import prisma from '../lib/prisma.js';

export const getFormations = async (req, res) => {
  const { domaine } = req.query;
  try {
    const formations = await prisma.formation.findMany({
      where: domaine ? { domaine: { equals: domaine, mode: 'insensitive' } } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    res.json(formations.map(f => ({ ...f, created_at: f.createdAt })));
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err });
  }
};

export const getFormation = async (req, res) => {
  const id = Number(req.params.id);
  try {
    const formation = await prisma.formation.findUnique({
      where: { id },
      include: {
        modules: {
          orderBy: { id: 'asc' },
          include: {
            lecons: {
              orderBy: { id: 'asc' },
              include: { videos: { orderBy: { createdAt: 'asc' } } },
            },
          },
        },
      },
    });
    if (!formation) return res.status(404).json({ message: 'Formation introuvable' });
    res.json({ formation, modules: formation.modules });
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const createFormation = async (req, res) => {
  const { titre, description, niveau, prix, domaine } = req.body;
  if (!titre || !description || !niveau || !domaine)
    return res.status(400).json({ message: 'Titre, description, niveau et domaine sont obligatoires' });
  try {
    const f = await prisma.formation.create({
      data: { titre, description, niveau, prix: prix || 0, domaine },
    });
    res.status(201).json({ message: 'Formation créée', id: f.id });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err });
  }
};

export const deleteFormation = async (req, res) => {
  try {
    await prisma.formation.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Formation supprimée' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Formation introuvable' });
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getProjetsBriefs = async (req, res) => {
  const formationId = Number(req.params.id);
  const userId = req.user.id;
  try {
    const briefs = await prisma.projetBrief.findMany({
      where: { formationId },
      orderBy: { createdAt: 'asc' },
      include: { projets: { where: { userId }, select: { id: true, lienGithub: true, lienDemo: true, description: true, statutEvaluation: true, commentaireMentor: true } } },
    });
    const result = briefs.map(b => {
      const soumission = b.projets[0] || null;
      return {
        ...b, created_at: b.createdAt, updated_at: b.updatedAt,
        soumission_id: soumission?.id || null,
        lien_github: soumission?.lienGithub || null,
        lien_demo: soumission?.lienDemo || null,
        commentaire_soumission: soumission?.description || null,
        statut_evaluation: soumission?.statutEvaluation || null,
        commentaire_mentor: soumission?.commentaireMentor || null,
      };
    });
    res.json(result);
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getAdminProjetsBriefs = async (req, res) => {
  try {
    const briefs = await prisma.projetBrief.findMany({
      orderBy: { createdAt: 'desc' },
      include: { formation: { select: { titre: true } }, _count: { select: { projets: true } } },
    });
    res.json(briefs.map(b => ({
      ...b, formation_titre: b.formation?.titre || null,
      nb_soumissions: b._count.projets, created_at: b.createdAt,
    })));
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const createProjetBrief = async (req, res) => {
  const { formation_id, titre, description, consignes, livrables } = req.body;
  if (!titre || !description)
    return res.status(400).json({ message: 'Titre et description sont obligatoires' });
  try {
    const b = await prisma.projetBrief.create({
      data: { formationId: formation_id || null, titre, description, consignes: consignes || null, livrables: livrables || null },
    });
    res.status(201).json({ message: 'Brief créé', id: b.id });
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const updateProjetBrief = async (req, res) => {
  const { titre, description, consignes, livrables, formation_id } = req.body;
  try {
    await prisma.projetBrief.update({
      where: { id: Number(req.params.id) },
      data: { titre, description, consignes: consignes || null, livrables: livrables || null, formationId: formation_id || null },
    });
    res.json({ message: 'Brief mis à jour' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Brief introuvable' });
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const deleteProjetBrief = async (req, res) => {
  try {
    await prisma.projetBrief.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Brief supprimé' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Brief introuvable' });
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
