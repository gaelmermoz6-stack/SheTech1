import prisma from '../lib/prisma.js';
import { genererQuestionsQuiz } from '../lib/gemini.js';

const SEUIL_REUSSITE = 70;

// POST /formations/:id/quiz-final/generate (admin) — génère via Gemini, sans sauvegarder
export const generateQuizFinal = async (req, res) => {
  const formationId = Number(req.params.id);
  const { nb_questions = 8 } = req.body;
  try {
    const formation = await prisma.formation.findUnique({
      where: { id: formationId },
      include: {
        modules: {
          orderBy: { id: 'asc' },
          include: { lecons: { orderBy: { id: 'asc' }, select: { titre: true, contenuTexte: true } } },
        },
      },
    });
    if (!formation) return res.status(404).json({ message: 'Formation introuvable' });

    const contenu = formation.modules
      .map((m, i) => {
        const lecons = m.lecons.map(l => `${l.titre}\n${l.contenuTexte || ''}`).join('\n');
        return `Module ${i + 1} : ${m.titre}\n${lecons}`;
      })
      .join('\n\n')
      .trim();

    if (!contenu) return res.status(400).json({ message: 'Aucun contenu texte dans les modules de cette formation.' });

    const questions = await genererQuestionsQuiz({
      titre: formation.titre,
      contenu,
      nbQuestions: nb_questions,
    });
    res.json({ questions, formation_titre: formation.titre });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la génération du quiz', detail: err.message });
  }
};

// POST /formations/:id/quiz-final (admin) — sauvegarde les questions
export const saveQuizFinal = async (req, res) => {
  const formationId = Number(req.params.id);
  const { questions } = req.body;
  if (!questions || !Array.isArray(questions) || questions.length === 0)
    return res.status(400).json({ message: 'Questions obligatoires' });
  try {
    await prisma.$transaction([
      prisma.formationQuiz.deleteMany({ where: { formationId } }),
      prisma.formationQuiz.createMany({
        data: questions.map((q, i) => ({
          formationId, question: q.question, optionA: q.option_a, optionB: q.option_b,
          optionC: q.option_c || null, optionD: q.option_d || null,
          reponseCorrecte: q.reponse_correcte, explication: q.explication || null, ordre: i + 1,
        })),
      }),
    ]);
    res.status(201).json({ message: 'Quiz final sauvegardé', nb_questions: questions.length });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', detail: err.message });
  }
};

// GET /formations/:id/quiz-final/admin (admin) — questions avec réponses
export const getQuizFinalAdmin = async (req, res) => {
  try {
    const quiz = await prisma.formationQuiz.findMany({
      where: { formationId: Number(req.params.id) },
      orderBy: { ordre: 'asc' },
    });
    res.json(quiz);
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// GET /formations/:id/quiz-final (token) — questions sans les réponses
export const getQuizFinal = async (req, res) => {
  try {
    const quiz = await prisma.formationQuiz.findMany({
      where: { formationId: Number(req.params.id) },
      orderBy: { ordre: 'asc' },
      select: { id: true, formationId: true, question: true, optionA: true, optionB: true, optionC: true, optionD: true, ordre: true },
    });
    res.json(quiz.map(q => ({
      id: q.id, formation_id: q.formationId, question: q.question,
      option_a: q.optionA, option_b: q.optionB, option_c: q.optionC, option_d: q.optionD, ordre: q.ordre,
    })));
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// GET /formations/:id/quiz-final/status (token) — l'utilisateur a-t-il réussi ?
export const getQuizFinalStatus = async (req, res) => {
  const formationId = Number(req.params.id);
  try {
    const [nbQuestions, result] = await Promise.all([
      prisma.formationQuiz.count({ where: { formationId } }),
      prisma.formationQuizResultat.findUnique({
        where: { userId_formationId: { userId: req.user.id, formationId } },
        select: { score: true, reussi: true },
      }),
    ]);
    res.json({
      existe: nbQuestions > 0,
      nb_questions: nbQuestions,
      reussi: result?.reussi === true,
      score: result?.score ?? null,
    });
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// POST /formations/:id/quiz-final/soumettre (token) — corrige et enregistre
export const soumettreQuizFinal = async (req, res) => {
  const formationId = Number(req.params.id);
  const { reponses } = req.body;
  try {
    const questions = await prisma.formationQuiz.findMany({
      where: { formationId },
      orderBy: { ordre: 'asc' },
    });
    if (questions.length === 0)
      return res.status(404).json({ message: 'Aucun quiz final pour cette formation' });

    let correct = 0;
    const details = questions.map(q => {
      const repUser = reponses?.[q.id];
      const ok = repUser === q.reponseCorrecte;
      if (ok) correct++;
      return {
        id: q.id, question: q.question, reponse_user: repUser,
        reponse_correcte: q.reponseCorrecte, correct: ok, explication: q.explication,
      };
    });

    const score = Math.round((correct / questions.length) * 100);
    const reussi = score >= SEUIL_REUSSITE;

    await prisma.formationQuizResultat.upsert({
      where: { userId_formationId: { userId: req.user.id, formationId } },
      update: { score, reussi },
      create: { userId: req.user.id, formationId, score, reussi },
    });

    res.json({
      score, reussi, correct, total: questions.length, details,
      message: reussi
        ? 'Félicitations ! Vous avez réussi le quiz final. Votre certificat est débloqué.'
        : `Score insuffisant (${score}/100). Il faut au moins ${SEUIL_REUSSITE}% pour valider la formation. Réessayez !`,
    });
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
