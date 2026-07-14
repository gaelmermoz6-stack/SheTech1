import prisma from '../lib/prisma.js';

export const terminerLecon = async (req, res) => {
  try {
    await prisma.leconFaite.createMany({
      data: [{ userId: req.user.id, leconId: Number(req.params.id) }],
      skipDuplicates: true,
    });
    res.json({ message: 'Leçon marquée comme terminée' });
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getModuleProgression = async (req, res) => {
  const moduleId = Number(req.params.id);
  const userId = req.user.id;
  try {
    const lecons = await prisma.lecon.findMany({
      where: { moduleId },
      select: {
        id: true, titre: true, type: true,
        leconsFaites: { where: { userId }, select: { id: true } },
      },
    });
    res.json(lecons.map(l => ({ id: l.id, titre: l.titre, type: l.type, fait: l.leconsFaites.length > 0 ? 1 : 0 })));
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getProgression = async (req, res) => {
  try {
    const progressions = await prisma.progression.findMany({
      where: { userId: req.user.id },
      include: { formation: { select: { titre: true, domaine: true } } },
    });
    res.json(progressions.map(p => ({
      ...p,
      user_id: p.userId, formation_id: p.formationId,
      formation_titre: p.formation.titre,
      formation_domaine: p.formation.domaine,
      domaine_id: p.formation.domaine === 'intelligence_artificielle' ? 'ia' : p.formation.domaine,
      updated_at: p.updatedAt,
    })));
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', detail: err.message });
  }
};

export const updateProgression = async (req, res) => {
  const { formation_id, pourcentage } = req.body;
  if (!formation_id || pourcentage === undefined)
    return res.status(400).json({ message: 'formation_id et pourcentage sont obligatoires' });
  try {
    const formation = await prisma.formation.findUnique({ where: { id: Number(formation_id) }, select: { id: true } });
    if (!formation) return res.status(404).json({ message: 'Formation introuvable' });

    await prisma.progression.upsert({
      where: { userId_formationId: { userId: req.user.id, formationId: Number(formation_id) } },
      update: { pourcentage },
      create: { userId: req.user.id, formationId: Number(formation_id), pourcentage },
    });
    res.json({ message: 'Progression mise à jour' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', detail: err.message });
  }
};

export const getProgressionCalculee = async (req, res) => {
  const formationId = Number(req.params.id);
  const userId = req.user.id;
  try {
    const stats = await prisma.$queryRaw`
      SELECT
        COUNT(DISTINCT l.id)::int          AS total_lecons,
        COUNT(DISTINCT lf.lecon_id)::int   AS lecons_faites,
        COUNT(DISTINCT mq.module_id)::int  AS total_quiz,
        COUNT(DISTINCT CASE WHEN mqr.reussi = true THEN mqr.module_id END)::int AS quiz_reussis
      FROM modules m
      LEFT JOIN lecons l       ON l.module_id = m.id
      LEFT JOIN lecons_faites lf ON lf.lecon_id = l.id AND lf.user_id = ${userId}
      LEFT JOIN module_quiz mq ON mq.module_id = m.id
      LEFT JOIN module_quiz_resultats mqr ON mqr.module_id = m.id AND mqr.user_id = ${userId} AND mqr.reussi = true
      WHERE m.formation_id = ${formationId}
    `;

    const s = stats[0] || {};
    const totalLecons = Number(s.total_lecons) || 0;
    const leconsFaites = Number(s.lecons_faites) || 0;
    const totalQuiz = Number(s.total_quiz) || 0;
    const quizReussis = Number(s.quiz_reussis) || 0;
    const total = totalLecons + totalQuiz;
    const faites = leconsFaites + quizReussis;
    const pourcentage = total === 0 ? 0 : Math.round((faites / total) * 100);

    await prisma.progression.upsert({
      where: { userId_formationId: { userId, formationId } },
      update: { pourcentage },
      create: { userId, formationId, pourcentage },
    });

    res.json({ pourcentage, total, faites, total_lecons: totalLecons, lecons_faites: leconsFaites, total_quiz: totalQuiz, quiz_reussis: quizReussis });
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
