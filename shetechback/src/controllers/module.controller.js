import prisma from '../lib/prisma.js';

export const getModules = async (req, res) => {
  const { formation_id } = req.query;
  if (!formation_id) return res.status(400).json({ message: 'formation_id est requis' });
  try {
    const modules = await prisma.module.findMany({
      where: { formationId: Number(formation_id) },
      orderBy: { id: 'asc' },
    });
    res.json(modules);
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const createModule = async (req, res) => {
  const { formation_id, titre, duree } = req.body;
  if (!formation_id || !titre)
    return res.status(400).json({ message: 'formation_id et titre sont obligatoires' });
  try {
    const m = await prisma.module.create({ data: { formationId: Number(formation_id), titre, duree: duree || 0 } });
    res.status(201).json({ message: 'Module créé', id: m.id });
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const updateModule = async (req, res) => {
  const { titre, duree } = req.body;
  if (!titre) return res.status(400).json({ message: 'Le titre est obligatoire' });
  try {
    await prisma.module.update({ where: { id: Number(req.params.id) }, data: { titre, duree: duree || 0 } });
    res.json({ message: 'Module mis à jour' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Module introuvable' });
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const deleteModule = async (req, res) => {
  try {
    await prisma.module.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Module supprimé' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Module introuvable' });
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const generateQuiz = async (req, res) => {
  const id = Number(req.params.id);
  const { nb_questions = 5 } = req.body;
  try {
    const mod = await prisma.module.findUnique({ where: { id } });
    if (!mod) return res.status(404).json({ message: 'Module introuvable' });

    const lecons = await prisma.lecon.findMany({
      where: { moduleId: id },
      orderBy: { id: 'asc' },
      select: { titre: true, contenuTexte: true, type: true },
    });
    const contenu = lecons.map((l, i) => `Leçon ${i + 1} : ${l.titre}\n${l.contenuTexte || ''}`).join('\n\n').trim();
    if (!contenu) return res.status(400).json({ message: 'Aucun contenu texte dans les leçons.' });

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': 'SheTech',
      },
      body: JSON.stringify({
        model: 'openrouter/auto',
        messages: [{ role: 'user', content: `Tu es un expert pédagogique. Génère exactement ${nb_questions} questions QCM en français basées sur ce contenu de module intitulé "${mod.titre}".\n\nCONTENU :\n${contenu}\n\nRÈGLES :\n- Chaque question doit avoir exactement 4 options (A, B, C, D)\n- Une seule bonne réponse par question\n- Réponds UNIQUEMENT avec un tableau JSON valide, sans markdown\n\nFORMAT JSON requis :\n[\n  {\n    "question": "Texte ?",\n    "option_a": "A",\n    "option_b": "B",\n    "option_c": "C",\n    "option_d": "D",\n    "reponse_correcte": "a",\n    "explication": "Explication"\n  }\n]` }],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });
    const rawText = await response.text();
    if (!response.ok) return res.status(500).json({ message: `Erreur OpenRouter API (${response.status})`, detail: rawText.substring(0, 300) });
    const data = JSON.parse(rawText);
    const text = data.choices?.[0]?.message?.content || '';
    if (!text) return res.status(500).json({ message: "L'IA n'a retourné aucun contenu." });
    const clean = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const questions = JSON.parse(clean);
    if (!Array.isArray(questions) || questions.length === 0)
      return res.status(500).json({ message: "Format de réponse invalide de l'IA." });
    res.json({ questions, module_titre: mod.titre });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la génération du quiz', detail: err.message });
  }
};

export const saveQuiz = async (req, res) => {
  const moduleId = Number(req.params.id);
  const { questions } = req.body;
  if (!questions || !Array.isArray(questions) || questions.length === 0)
    return res.status(400).json({ message: 'Questions obligatoires' });
  try {
    await prisma.$transaction([
      prisma.moduleQuiz.deleteMany({ where: { moduleId } }),
      prisma.moduleQuiz.createMany({
        data: questions.map((q, i) => ({
          moduleId, question: q.question, optionA: q.option_a, optionB: q.option_b,
          optionC: q.option_c || null, optionD: q.option_d || null,
          reponseCorrecte: q.reponse_correcte, explication: q.explication || null, ordre: i + 1,
        })),
      }),
    ]);
    res.status(201).json({ message: 'Quiz sauvegardé', nb_questions: questions.length });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', detail: err.message });
  }
};

export const getQuizAdmin = async (req, res) => {
  try {
    const quiz = await prisma.moduleQuiz.findMany({
      where: { moduleId: Number(req.params.id) },
      orderBy: { ordre: 'asc' },
    });
    res.json(quiz);
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getQuiz = async (req, res) => {
  try {
    const quiz = await prisma.moduleQuiz.findMany({
      where: { moduleId: Number(req.params.id) },
      orderBy: { ordre: 'asc' },
      select: { id: true, moduleId: true, question: true, optionA: true, optionB: true, optionC: true, optionD: true, ordre: true },
    });
    res.json(quiz.map(q => ({
      id: q.id, module_id: q.moduleId, question: q.question,
      option_a: q.optionA, option_b: q.optionB, option_c: q.optionC, option_d: q.optionD, ordre: q.ordre,
    })));
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getQuizStatus = async (req, res) => {
  try {
    const result = await prisma.moduleQuizResultat.findUnique({
      where: { userId_moduleId: { userId: req.user.id, moduleId: Number(req.params.id) } },
      select: { reussi: true },
    });
    res.json({ valide: result?.reussi === true });
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const soumettreQuiz = async (req, res) => {
  const moduleId = Number(req.params.id);
  const { reponses } = req.body;
  try {
    const questions = await prisma.moduleQuiz.findMany({
      where: { moduleId },
      orderBy: { ordre: 'asc' },
    });
    if (questions.length === 0)
      return res.status(404).json({ message: 'Quiz introuvable pour ce module' });

    let correct = 0;
    const details = questions.map(q => {
      const repUser = reponses[q.id];
      const ok = repUser === q.reponseCorrecte;
      if (ok) correct++;
      return {
        id: q.id, question: q.question, reponse_user: repUser,
        reponse_correcte: q.reponseCorrecte, correct: ok, explication: q.explication,
      };
    });

    const score = Math.round((correct / questions.length) * 100);
    const reussi = score >= 70;

    await prisma.moduleQuizResultat.upsert({
      where: { userId_moduleId: { userId: req.user.id, moduleId } },
      update: { score, reussi },
      create: { userId: req.user.id, moduleId, score, reussi },
    });

    res.json({
      score, reussi, correct, total: questions.length, details,
      message: reussi
        ? 'Félicitations ! Vous avez réussi le quiz. Le module suivant est débloqué.'
        : `Score insuffisant (${score}/100). Il faut au moins 70% pour continuer. Réessayez !`,
    });
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
