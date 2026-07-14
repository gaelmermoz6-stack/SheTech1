import prisma from '../lib/prisma.js';

export const getLecons = async (req, res) => {
  try {
    const lecons = await prisma.lecon.findMany({
      where: { moduleId: Number(req.params.id) },
      orderBy: { id: 'asc' },
    });
    res.json(lecons.map(l => ({ ...l, module_id: l.moduleId, video_url: l.videoUrl, contenu_texte: l.contenuTexte })));
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getLecon = async (req, res) => {
  try {
    const lecon = await prisma.lecon.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        quiz: { orderBy: { ordre: 'asc' } },
        ressources: true,
      },
    });
    if (!lecon) return res.status(404).json({ message: 'Leçon introuvable' });
    const questions = lecon.quiz.map(q => ({
      id: q.id, lecon_id: q.leconId, question: q.question,
      option_a: q.optionA, option_b: q.optionB, option_c: q.optionC, option_d: q.optionD,
      reponse_correcte: q.reponseCorrecte, explication: q.explication, ordre: q.ordre,
    }));
    res.json({ lecon: { ...lecon, module_id: lecon.moduleId, video_url: lecon.videoUrl, contenu_texte: lecon.contenuTexte }, questions, ressources: lecon.ressources });
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const createLecon = async (req, res) => {
  const { module_id, titre, type, video_url, contenu_texte, duree } = req.body;
  if (!module_id || !titre || !type)
    return res.status(400).json({ message: 'module_id, titre et type sont obligatoires' });
  try {
    const l = await prisma.lecon.create({
      data: { moduleId: Number(module_id), titre, type, videoUrl: video_url || null, contenuTexte: contenu_texte || null, duree: duree || 0 },
    });
    res.status(201).json({ message: 'Leçon créée', id: l.id });
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const updateLecon = async (req, res) => {
  const { titre, type, video_url, contenu_texte, duree } = req.body;
  try {
    await prisma.lecon.update({
      where: { id: Number(req.params.id) },
      data: { titre, type, videoUrl: video_url || null, contenuTexte: contenu_texte || null, duree: duree || 0 },
    });
    res.json({ message: 'Leçon mise à jour' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Leçon introuvable' });
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const deleteLecon = async (req, res) => {
  try {
    await prisma.lecon.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Leçon supprimée' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Leçon introuvable' });
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getVideos = async (req, res) => {
  try {
    const videos = await prisma.video.findMany({
      where: { leconId: Number(req.params.id) },
      orderBy: { createdAt: 'asc' },
    });
    res.json(videos);
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const createVideo = async (req, res) => {
  const { titre, url, description, duree } = req.body;
  if (!titre || !url)
    return res.status(400).json({ message: 'Titre et URL sont obligatoires' });
  try {
    const v = await prisma.video.create({
      data: { leconId: Number(req.params.id), titre, url, description: description || null, duree: duree || null },
    });
    res.status(201).json({ message: 'Vidéo ajoutée', id: v.id });
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const updateVideo = async (req, res) => {
  const { titre, url, description, duree } = req.body;
  try {
    await prisma.video.update({
      where: { id: Number(req.params.id) },
      data: { titre, url, description: description || null, duree: duree || null },
    });
    res.json({ message: 'Vidéo mise à jour' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Vidéo introuvable' });
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const deleteVideo = async (req, res) => {
  try {
    await prisma.video.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Vidéo supprimée' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Vidéo introuvable' });
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const createQuizLecon = async (req, res) => {
  const { question, option_a, option_b, option_c, option_d, reponse_correcte, explication, ordre } = req.body;
  if (!question || !option_a || !option_b || reponse_correcte === undefined)
    return res.status(400).json({ message: 'question, option_a, option_b et reponse_correcte sont obligatoires' });
  try {
    const q = await prisma.quiz.create({
      data: { leconId: Number(req.params.id), question, optionA: option_a, optionB: option_b, optionC: option_c || null, optionD: option_d || null, reponseCorrecte: reponse_correcte, explication: explication || null, ordre: ordre || 1 },
    });
    res.status(201).json({ message: 'Question ajoutée', id: q.id });
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const updateQuizLecon = async (req, res) => {
  const { question, option_a, option_b, option_c, option_d, reponse_correcte, explication } = req.body;
  try {
    await prisma.quiz.update({
      where: { id: Number(req.params.id) },
      data: { question, optionA: option_a, optionB: option_b, optionC: option_c || null, optionD: option_d || null, reponseCorrecte: reponse_correcte, explication: explication || null },
    });
    res.json({ message: 'Question mise à jour' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Question introuvable' });
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const deleteQuizLecon = async (req, res) => {
  try {
    await prisma.quiz.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Question supprimée' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Question introuvable' });
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const createRessource = async (req, res) => {
  const { titre, type, url } = req.body;
  if (!titre || !url) return res.status(400).json({ message: 'titre et url sont obligatoires' });
  try {
    const r = await prisma.ressource.create({
      data: { leconId: Number(req.params.id), titre, type: type || 'lien', url },
    });
    res.status(201).json({ message: 'Ressource ajoutée', id: r.id });
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
