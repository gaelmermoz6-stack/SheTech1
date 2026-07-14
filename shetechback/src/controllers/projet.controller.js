import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import prisma from '../lib/prisma.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function normalizeProjetStatut(statut) {
  if (!statut || statut === 'en_cours') return 'en_cours';
  if (statut === 'lance' || statut === 'lancé') return 'lancé';
  if (statut === 'termine' || statut === 'terminé') return 'terminé';
  return null;
}

export const getProjets = async (req, res) => {
  try {
    const projets = await prisma.projet.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        commentaires: { include: { user: { select: { nom: true } } }, orderBy: { createdAt: 'asc' } },
        livrables: true, likes: true, brief: true,
        user: { select: { nom: true } },
      },
    });
    res.json(projets.map(p => ({
      ...p, user_id: p.userId, lien_github: p.lienGithub, lien_demo: p.lienDemo,
      statut_evaluation: p.statutEvaluation, commentaire_mentor: p.commentaireMentor,
      created_at: p.createdAt, nb_likes: p.likes.length,
    })));
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getProjet = async (req, res) => {
  try {
    const projet = await prisma.projet.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        commentaires: { include: { user: { select: { nom: true } } }, orderBy: { createdAt: 'asc' } },
        livrables: true, likes: true, brief: true,
        user: { select: { nom: true } },
        mentor: { select: { nom: true } },
      },
    });
    if (!projet) return res.status(404).json({ message: 'Projet introuvable' });
    res.json({ ...projet, nb_likes: projet.likes.length });
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getProjetsPublics = async (req, res) => {
  try {
    const projets = await prisma.projet.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: 'desc' },
      include: {
        commentaires: { include: { user: { select: { nom: true } } }, orderBy: { createdAt: 'asc' } },
        livrables: true, likes: true,
        user: { select: { nom: true } },
        brief: { select: { titre: true, formationId: true } },
      },
    });
    res.json(projets.map(p => ({
      ...p, user_id: p.userId, nom_auteur: p.user?.nom,
      nb_likes: p.likes.length, created_at: p.createdAt,
    })));
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getAdminProjets = async (req, res) => {
  try {
    const projets = await prisma.projet.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { nom: true } },
        mentor: { select: { nom: true } },
        livrables: true,
        brief: { select: { titre: true } },
      },
    });
    res.json(projets.map(p => ({
      ...p, user_id: p.userId, mentor_id: p.mentorId,
      nom_auteur: p.user?.nom, nom_mentor: p.mentor?.nom,
      brief_titre: p.brief?.titre, lien_github: p.lienGithub, lien_demo: p.lienDemo,
      statut_evaluation: p.statutEvaluation, commentaire_mentor: p.commentaireMentor, created_at: p.createdAt,
    })));
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const createProjet = async (req, res) => {
  const { brief_id, lien_github, lien_demo, description, is_public } = req.body;
  try {
    const p = await prisma.projet.create({
      data: {
        userId: req.user.id, briefId: brief_id ? Number(brief_id) : null,
        lienGithub: lien_github || null, lienDemo: lien_demo || null,
        description: description || null, isPublic: is_public === true || is_public === 'true',
      },
    });
    res.status(201).json({ message: 'Projet créé', id: p.id });
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const updateProjet = async (req, res) => {
  const { lien_github, lien_demo, description, statut, is_public } = req.body;
  const statutNorm = normalizeProjetStatut(statut);
  try {
    await prisma.projet.update({
      where: { id: Number(req.params.id) },
      data: { lienGithub: lien_github || null, lienDemo: lien_demo || null, description: description || null, statut: statutNorm, isPublic: is_public === true || is_public === 'true' },
    });
    res.json({ message: 'Projet mis à jour' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Projet introuvable' });
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const deleteProjet = async (req, res) => {
  try {
    await prisma.projet.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Projet supprimé' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Projet introuvable' });
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const addCommentaire = async (req, res) => {
  const { contenu } = req.body;
  if (!contenu) return res.status(400).json({ message: 'Le contenu est obligatoire' });
  try {
    const c = await prisma.projetCommentaire.create({
      data: { projetId: Number(req.params.id), userId: req.user.id, contenu },
      include: { user: { select: { nom: true } } },
    });
    res.status(201).json({ message: 'Commentaire ajouté', commentaire: { ...c, nom_user: c.user?.nom } });
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const toggleLike = async (req, res) => {
  const projetId = Number(req.params.id);
  const userId = req.user.id;
  try {
    const existing = await prisma.projetLike.findUnique({ where: { projetId_userId: { projetId, userId } } });
    if (existing) {
      await prisma.projetLike.delete({ where: { projetId_userId: { projetId, userId } } });
      const count = await prisma.projetLike.count({ where: { projetId } });
      return res.json({ liked: false, nb_likes: count });
    }
    await prisma.projetLike.create({ data: { projetId, userId } });
    const count = await prisma.projetLike.count({ where: { projetId } });
    res.json({ liked: true, nb_likes: count });
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const evaluerProjet = async (req, res) => {
  const { statut_evaluation, commentaire_mentor, note } = req.body;
  if (!statut_evaluation) return res.status(400).json({ message: 'statut_evaluation est obligatoire' });
  try {
    await prisma.projet.update({
      where: { id: Number(req.params.id) },
      data: { statutEvaluation: statut_evaluation, commentaireMentor: commentaire_mentor || null, note: note || null, mentorId: req.user.id },
    });
    res.json({ message: 'Évaluation enregistrée' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Projet introuvable' });
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getLivrables = async (req, res) => {
  const projetId = Number(req.params.id);
  try {
    const projet = await prisma.projet.findUnique({ where: { id: projetId }, select: { userId: true } });
    if (!projet) return res.status(404).json({ message: 'Projet introuvable' });
    if (projet.userId !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'mentor')
      return res.status(403).json({ message: 'Accès non autorisé' });
    const livrables = await prisma.livrable.findMany({ where: { projetId }, orderBy: { createdAt: 'desc' } });
    res.json(livrables);
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const uploadLivrable = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Fichier requis' });
  const { titre, description } = req.body;
  const projetId = Number(req.params.id);
  try {
    const l = await prisma.livrable.create({
      data: { projetId, userId: req.user.id, titre: titre || req.file.originalname, description: description || null, nomFichier: req.file.filename, cheminFichier: req.file.path, typeFichier: req.file.mimetype, tailleFichier: req.file.size },
    });
    res.status(201).json({ message: 'Livrable uploadé', id: l.id, nom_fichier: l.nomFichier });
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const deleteLivrable = async (req, res) => {
  try {
    const livrable = await prisma.livrable.findUnique({ where: { id: Number(req.params.id) } });
    if (!livrable) return res.status(404).json({ message: 'Livrable introuvable' });
    if (livrable.userId !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Accès non autorisé' });
    const filePath = path.resolve(__dirname, '../../', livrable.cheminFichier);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    await prisma.livrable.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Livrable supprimé' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Livrable introuvable' });
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
