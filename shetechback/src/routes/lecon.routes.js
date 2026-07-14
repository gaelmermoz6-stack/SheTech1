import { Router } from 'express';
import { verifierToken, verifierAdmin } from '../middlewares/auth.middleware.js';
import {
  getLecons, getLecon, createLecon, updateLecon, deleteLecon,
  getVideos, createVideo, updateVideo, deleteVideo,
  createQuizLecon, updateQuizLecon, deleteQuizLecon,
  createRessource,
} from '../controllers/lecon.controller.js';

const router = Router();

router.get('/module/:id', verifierToken, getLecons);
router.get('/:id', verifierToken, getLecon);
router.post('/', verifierToken, verifierAdmin, createLecon);
router.put('/:id', verifierToken, verifierAdmin, updateLecon);
router.delete('/:id', verifierToken, verifierAdmin, deleteLecon);

router.get('/:id/videos', verifierToken, getVideos);
router.post('/:id/videos', verifierToken, verifierAdmin, createVideo);
router.put('/videos/:id', verifierToken, verifierAdmin, updateVideo);
router.delete('/videos/:id', verifierToken, verifierAdmin, deleteVideo);

router.post('/:id/quiz', verifierToken, verifierAdmin, createQuizLecon);
router.put('/quiz/:id', verifierToken, verifierAdmin, updateQuizLecon);
router.delete('/quiz/:id', verifierToken, verifierAdmin, deleteQuizLecon);

router.post('/:id/ressources', verifierToken, verifierAdmin, createRessource);

export default router;
