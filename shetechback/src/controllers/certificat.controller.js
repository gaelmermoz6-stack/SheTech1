import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import prisma from '../lib/prisma.js';
import { generateCertificatePDF, generateClassicCertificatePDF, generateModernCertificatePDF } from '../lib/pdf.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function buildCertData(nomComplet, formation) {
  const now = new Date();
  const dateDebut = new Date(formation.createdAt || now);
  const dateFin = now;
  const numeroCertificat = 'SHT-' + crypto.randomBytes(4).toString('hex').toUpperCase() + '-' + now.getFullYear();
  return {
    nomComplet,
    domaine: formation.domaine || formation.titre,
    formationTitre: formation.titre,
    dateDebut,
    dateFin,
    numeroCertificat,
  };
}

export const verifierEligibilite = async (req, res) => {
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
      LEFT JOIN lecons l         ON l.module_id = m.id
      LEFT JOIN lecons_faites lf ON lf.lecon_id = l.id AND lf.user_id = ${userId}
      LEFT JOIN module_quiz mq   ON mq.module_id = m.id
      LEFT JOIN module_quiz_resultats mqr ON mqr.module_id = m.id AND mqr.user_id = ${userId} AND mqr.reussi = true
      WHERE m.formation_id = ${formationId}
    `;

    const s = stats[0] || {};
    const totalLecons = Number(s.total_lecons) || 0;
    const leconsFaites = Number(s.lecons_faites) || 0;
    const totalQuiz = Number(s.total_quiz) || 0;
    const quizReussis = Number(s.quiz_reussis) || 0;

    // Quiz final de formation : s'il existe, il doit être réussi pour valider
    const [nbQuizFinal, resultatFinal] = await Promise.all([
      prisma.formationQuiz.count({ where: { formationId } }),
      prisma.formationQuizResultat.findUnique({
        where: { userId_formationId: { userId, formationId } },
        select: { reussi: true },
      }),
    ]);
    const quizFinalExiste = nbQuizFinal > 0;
    const quizFinalReussi = resultatFinal?.reussi === true;

    const total = totalLecons + totalQuiz + (quizFinalExiste ? 1 : 0);
    const fait = leconsFaites + quizReussis + (quizFinalExiste && quizFinalReussi ? 1 : 0);
    const pourcentage = total === 0 ? 100 : Math.round((fait / total) * 100);
    const eligible =
      total === 0 ||
      (leconsFaites >= totalLecons && quizReussis >= totalQuiz && (!quizFinalExiste || quizFinalReussi));

    const existant = await prisma.certificat.findUnique({ where: { userId_formationId: { userId, formationId } } });

    res.json({
      eligible, pourcentage, deja_genere: !!existant, total, fait,
      quiz_final_existe: quizFinalExiste, quiz_final_reussi: quizFinalReussi,
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', detail: err.message });
  }
};

export const genererCertificat = async (req, res) => {
  const formationId = Number(req.params.id);
  const userId = req.user.id;
  try {
    const existant = await prisma.certificat.findUnique({ where: { userId_formationId: { userId, formationId } } });
    if (existant) {
      const filePath = path.join(__dirname, '../../uploads/certificats', existant.nomFichier);
      if (fs.existsSync(filePath)) return res.download(filePath, existant.nomFichier);
    }

    const [user, formation] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { nom: true } }),
      prisma.formation.findUnique({ where: { id: formationId }, select: { titre: true, domaine: true, createdAt: true } }),
    ]);
    if (!user || !formation) return res.status(404).json({ message: 'Données introuvables' });

    const data = buildCertData(user.nom, formation);
    const filePath = await generateClassicCertificatePDF(data);
    const fileName = path.basename(filePath);

    await prisma.certificat.upsert({
      where: { userId_formationId: { userId, formationId } },
      update: { nomFichier: fileName, codeVerification: data.numeroCertificat },
      create: { userId, formationId, nomFichier: fileName, codeVerification: data.numeroCertificat },
    });

    res.download(filePath, fileName);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la génération', detail: err.message });
  }
};

export const genererAuto = async (req, res) => {
  const { formationId, type = 'classic' } = req.body;
  if (!formationId) return res.status(400).json({ message: 'formationId est obligatoire' });
  const userId = req.user.id;
  try {
    const [user, formation] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { nom: true } }),
      prisma.formation.findUnique({ where: { id: Number(formationId) }, select: { titre: true, domaine: true, createdAt: true } }),
    ]);
    if (!user || !formation) return res.status(404).json({ message: 'Données introuvables' });

    const data = buildCertData(user.nom, formation);
    const generators = { modern: generateModernCertificatePDF, classic: generateClassicCertificatePDF, default: generateCertificatePDF };
    const generator = generators[type] || generators.classic;
    const filePath = await generator(data);
    const fileName = path.basename(filePath);

    await prisma.certificat.upsert({
      where: { userId_formationId: { userId, formationId: Number(formationId) } },
      update: { nomFichier: fileName, codeVerification: data.numeroCertificat },
      create: { userId, formationId: Number(formationId), nomFichier: fileName, codeVerification: data.numeroCertificat },
    });

    res.json({ message: 'Certificat généré', fileName, codeVerification: data.numeroCertificat });
  } catch (err) {
    res.status(500).json({ message: 'Erreur génération', detail: err.message });
  }
};

export const mesCertificats = async (req, res) => {
  try {
    const certificats = await prisma.certificat.findMany({
      where: { userId: req.user.id },
      include: { formation: { select: { titre: true } } },
      orderBy: { dateObtention: 'desc' },
    });
    res.json(certificats.map(c => ({
      id: c.id, user_id: c.userId, formation_id: c.formationId,
      formation_titre: c.formation?.titre,
      nom_fichier: c.nomFichier, code_verification: c.codeVerification,
      date_obtention: c.dateObtention,
    })));
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const downloadCertificat = async (req, res) => {
  try {
    const certificat = await prisma.certificat.findFirst({
      where: { id: Number(req.params.id), userId: req.user.id },
    });
    if (!certificat) return res.status(404).json({ message: 'Certificat introuvable' });
    const filePath = path.join(__dirname, '../../uploads/certificats', certificat.nomFichier);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'Fichier introuvable sur le serveur' });
    res.download(filePath, certificat.nomFichier);
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const supprimerCertificat = async (req, res) => {
  try {
    const certificat = await prisma.certificat.findFirst({
      where: { id: Number(req.params.id), userId: req.user.id },
    });
    if (!certificat) return res.status(404).json({ message: 'Certificat introuvable' });
    const filePath = path.join(__dirname, '../../uploads/certificats', certificat.nomFichier);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    await prisma.certificat.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Certificat supprimé' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Certificat introuvable' });
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
