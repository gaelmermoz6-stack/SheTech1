import prisma from '../lib/prisma.js';

function normalizeStatut(statut) {
  if (!statut || statut === 'reserve' || statut === 'réservé') return 'réservé';
  if (statut === 'termine' || statut === 'terminé') return 'terminé';
  return null;
}

function mapSession(s) {
  return {
    ...s,
    mentor_id: s.mentorId, user_id: s.userId,
    date_session: s.dateSession, lien_reunion: s.lienReunion,
    mentor_nom: s.mentor?.nom, apprenant_nom: s.user?.nom,
  };
}

export const getMentors = async (req, res) => {
  try {
    const mentors = await prisma.user.findMany({
      where: { role: 'mentor' },
      select: { id: true, nom: true, email: true, niveau: true },
    });
    res.json(mentors);
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getSessions = async (req, res) => {
  try {
    const sessions = await prisma.sessionMentorat.findMany({
      where: { userId: req.user.id },
      orderBy: { dateSession: 'desc' },
      include: { mentor: { select: { nom: true } } },
    });
    res.json(sessions.map(mapSession));
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const createSession = async (req, res) => {
  const { mentor_id, date_session, type } = req.body;
  if (!mentor_id || !date_session || !type)
    return res.status(400).json({ message: 'mentor_id, date_session et type sont obligatoires' });
  try {
    const mentor = await prisma.user.findFirst({ where: { id: Number(mentor_id), role: 'mentor' }, select: { id: true } });
    if (!mentor) return res.status(404).json({ message: 'Mentor introuvable' });
    const s = await prisma.sessionMentorat.create({
      data: { mentorId: Number(mentor_id), userId: req.user.id, dateSession: new Date(date_session), type },
    });
    res.status(201).json({ message: 'Session réservée', id: s.id });
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const reserverSession = async (req, res) => {
  const { mentor_id, sujet, message } = req.body;
  if (!mentor_id) return res.status(400).json({ message: 'mentor_id est obligatoire' });
  try {
    const mentor = await prisma.user.findFirst({ where: { id: Number(mentor_id), role: 'mentor' }, select: { id: true } });
    if (!mentor) return res.status(404).json({ message: 'Mentor introuvable' });
    const s = await prisma.sessionMentorat.create({
      data: { mentorId: Number(mentor_id), userId: req.user.id, dateSession: new Date(), type: 'individuel', sujet: sujet || null, notes: message || null },
    });
    res.status(201).json({ message: 'Session réservée', id: s.id });
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getAdminSessions = async (req, res) => {
  try {
    const sessions = await prisma.sessionMentorat.findMany({
      orderBy: { dateSession: 'desc' },
      include: {
        user: { select: { nom: true } },
        mentor: { select: { nom: true } },
      },
    });
    res.json(sessions.map(s => ({ ...mapSession(s), apprenant_nom: s.user?.nom })));
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const createAdminSession = async (req, res) => {
  const { mentor_id, user_id, date_session, type, sujet, lien_reunion } = req.body;
  if (!mentor_id || !user_id || !date_session || !type)
    return res.status(400).json({ message: 'mentor_id, user_id, date_session et type sont obligatoires' });
  try {
    const s = await prisma.sessionMentorat.create({
      data: { mentorId: Number(mentor_id), userId: Number(user_id), dateSession: new Date(date_session), type, sujet: sujet || null, lienReunion: lien_reunion || null },
    });
    res.status(201).json({ message: 'Session créée', id: s.id });
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const updateAdminSession = async (req, res) => {
  const { statut, notes, lien_reunion, sujet } = req.body;
  const statutNorm = normalizeStatut(statut);
  if (!statutNorm) return res.status(400).json({ message: 'Statut de session invalide' });
  try {
    await prisma.sessionMentorat.update({
      where: { id: Number(req.params.id) },
      data: { statut: statutNorm, notes: notes || null, lienReunion: lien_reunion || null, sujet: sujet || null },
    });
    res.json({ message: 'Session mise à jour' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Session introuvable' });
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const deleteAdminSession = async (req, res) => {
  try {
    await prisma.sessionMentorat.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Session supprimée' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Session introuvable' });
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
