import { Router } from 'express';
import { verifierToken } from '../middlewares/auth.middleware.js';
import {
  verifierEligibilite, genererCertificat, genererAuto,
  mesCertificats, downloadCertificat, supprimerCertificat,
} from '../controllers/certificat.controller.js';

const router = Router();

router.get('/certificats', verifierToken, mesCertificats);
router.post('/certificats/generer-auto', verifierToken, genererAuto);
router.get('/formations/:id/certificat/verifier', verifierToken, verifierEligibilite);
router.get('/formations/:id/certificat/generer', verifierToken, genererCertificat);
router.get('/certificats/:id/download', verifierToken, downloadCertificat);
router.delete('/certificats/:id', verifierToken, supprimerCertificat);

export default router;
