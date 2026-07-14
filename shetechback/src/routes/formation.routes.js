import { Router } from 'express';
import { verifierToken, verifierAdmin } from '../middlewares/auth.middleware.js';
import {
  getFormations, getFormation, createFormation, deleteFormation,
  getProjetsBriefs, getAdminProjetsBriefs, createProjetBrief, updateProjetBrief, deleteProjetBrief,
} from '../controllers/formation.controller.js';

const router = Router();

// Static admin routes MUST come before /:id to avoid param capture
router.get('/admin/projets-briefs', verifierToken, verifierAdmin, getAdminProjetsBriefs);
router.post('/admin/projets-briefs', verifierToken, verifierAdmin, createProjetBrief);
router.put('/admin/projets-briefs/:id', verifierToken, verifierAdmin, updateProjetBrief);
router.delete('/admin/projets-briefs/:id', verifierToken, verifierAdmin, deleteProjetBrief);

router.get('/', getFormations);
router.post('/', verifierToken, verifierAdmin, createFormation);
router.get('/:id', getFormation);
router.delete('/:id', verifierToken, verifierAdmin, deleteFormation);
router.get('/:id/projets-briefs', verifierToken, getProjetsBriefs);

export default router;
