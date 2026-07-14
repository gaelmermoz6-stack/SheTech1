import { Router } from 'express';
import { verifierToken, verifierAdmin } from '../middlewares/auth.middleware.js';
import {
  register, login, forgotPassword, validateResetToken, resetPassword,
  getProfil, updateProfil, getAdminUsers, updateUserRole,
} from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.get('/reset-password', validateResetToken);
router.post('/reset-password', resetPassword);
router.get('/profil', verifierToken, getProfil);
router.put('/profil', verifierToken, updateProfil);
router.get('/admin/users', verifierToken, verifierAdmin, getAdminUsers);
router.put('/admin/users/:id/role', verifierToken, verifierAdmin, updateUserRole);

export default router;
