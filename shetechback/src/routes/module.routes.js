import { Router } from 'express';
import { verifierToken, verifierAdmin } from '../middlewares/auth.middleware.js';
import {
  getModules, createModule, updateModule, deleteModule,
  generateQuiz, saveQuiz, getQuiz, getQuizAdmin, getQuizStatus, soumettreQuiz,
} from '../controllers/module.controller.js';

const router = Router();

router.get('/', verifierToken, getModules);
router.post('/', verifierToken, verifierAdmin, createModule);
router.put('/:id', verifierToken, verifierAdmin, updateModule);
router.delete('/:id', verifierToken, verifierAdmin, deleteModule);

router.post('/:id/generate-quiz', verifierToken, verifierAdmin, generateQuiz);
router.post('/:id/quiz', verifierToken, verifierAdmin, saveQuiz);
router.get('/:id/quiz', verifierToken, getQuiz);
router.get('/:id/quiz/admin', verifierToken, verifierAdmin, getQuizAdmin);
router.get('/:id/quiz/status', verifierToken, getQuizStatus);
router.post('/:id/quiz/soumettre', verifierToken, soumettreQuiz);

export default router;
