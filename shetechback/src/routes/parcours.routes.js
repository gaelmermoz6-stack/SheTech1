import { Router } from 'express';
import { verifierToken, verifierAdmin } from '../middlewares/auth.middleware.js';
import {
  getParcours, getParcoursDetail,
  createParcours, updateParcours, deleteParcours,
  reordonnerFormations,
} from '../controllers/parcours.controller.js';

const router = Router();

router.get('/', getParcours);
router.post('/', verifierToken, verifierAdmin, createParcours);

router.get('/:id', verifierToken, getParcoursDetail);
router.put('/:id', verifierToken, verifierAdmin, updateParcours);
router.delete('/:id', verifierToken, verifierAdmin, deleteParcours);

router.put('/:id/formations/ordre', verifierToken, verifierAdmin, reordonnerFormations);

export default router;
