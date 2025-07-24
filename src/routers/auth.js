import { Router } from 'express';
import { registerUserController } from '../controllers/authController.js';

const router = Router();

router.post('/register', registerUserController);

export default router;
