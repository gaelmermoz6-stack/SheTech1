import { Router } from 'express';
import * as moduleController from '../controllers/module.controller.js';
import * as leconController from '../controllers/lecon.controller.js';
import { verifierToken, verifierAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// Modules
router.get('/formations/:formationId/modules', moduleController.getModules);
router.get('/modules/:id', moduleController.getModuleDetail);
router.post('/modules', verifierToken, verifierAdmin, moduleController.createModule);
router.put('/modules/:id', verifierToken, verifierAdmin, moduleController.updateModule);
router.delete('/modules/:id', verifierToken, verifierAdmin, moduleController.deleteModule);

// Lecons
router.get('/cours/:coursId/lecons', leconController.getLecons);
router.get('/lecons/:id', leconController.getLeconDetail);
router.post('/lecons', verifierToken, verifierAdmin, leconController.createLecon);
router.put('/lecons/:id', verifierToken, verifierAdmin, leconController.updateLecon);
router.delete('/lecons/:id', verifierToken, verifierAdmin, leconController.deleteLecon);

// Lecon completion tracking
router.post('/lecons/:id/complete', verifierToken, leconController.markLeconComplete);

// Media resources
router.post('/lecons/:leconId/videos', verifierToken, verifierAdmin, leconController.addVideo);
router.post('/lecons/:leconId/audios', verifierToken, verifierAdmin, leconController.addAudio);
router.post('/lecons/:leconId/pieces-jointes', verifierToken, verifierAdmin, leconController.addPieceJointe);

router.delete('/videos/:id', verifierToken, verifierAdmin, leconController.deleteVideo);
router.delete('/audios/:id', verifierToken, verifierAdmin, leconController.deleteAudio);
router.delete('/pieces-jointes/:id', verifierToken, verifierAdmin, leconController.deletePieceJointe);

export default router;
