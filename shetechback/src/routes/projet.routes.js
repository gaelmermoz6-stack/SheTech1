import { Router } from 'express';
import { verifierToken, verifierAdmin, verifierMentorOuAdmin } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';
import {
  getProjets, getProjet, getProjetsPublics, getAdminProjets,
  createProjet, updateProjet, deleteProjet, assignerProjet,
  addCommentaire, toggleLike, evaluerProjet,
  getLivrables, uploadLivrable, deleteLivrable,
} from '../controllers/projet.controller.js';

const router = Router();

router.get('/projets/publics', getProjetsPublics);
router.get('/projets', verifierToken, getProjets);
router.get('/projets/:id', verifierToken, getProjet);
router.post('/projets', verifierToken, createProjet);
router.put('/projets/:id', verifierToken, updateProjet);
router.delete('/projets/:id', verifierToken, deleteProjet);

router.post('/projets/:id/commentaires', verifierToken, addCommentaire);
router.post('/projets/:id/like', verifierToken, toggleLike);
router.put('/projets/:id/evaluer', verifierToken, verifierMentorOuAdmin, evaluerProjet);

router.get('/projets/:id/livrables', verifierToken, getLivrables);
router.post('/projets/:id/livrables', verifierToken, upload.single('fichier'), uploadLivrable);
router.delete('/livrables/:id', verifierToken, deleteLivrable);

router.get('/admin/projets', verifierToken, verifierAdmin, getAdminProjets);
router.post('/admin/projets/assigner', verifierToken, verifierMentorOuAdmin, assignerProjet);

export default router;
