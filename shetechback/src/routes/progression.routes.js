import { Router } from 'express';
import { verifierToken } from '../middlewares/auth.middleware.js';
import {
  terminerLecon, getModuleProgression, getProgression, updateProgression, getProgressionCalculee,
} from '../controllers/progression.controller.js';

const router = Router();

router.post('/lecons/:id/terminer', verifierToken, terminerLecon);
router.get('/modules/:id/progression', verifierToken, getModuleProgression);
router.get('/progression', verifierToken, getProgression);
router.post('/progression', verifierToken, updateProgression);
router.get('/formations/:id/progression-calculee', verifierToken, getProgressionCalculee);

export default router;
