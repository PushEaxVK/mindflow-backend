import { Router } from 'express';
import { validateBody } from '../middlewares/validateBody.js';
import { registerUserSchema, loginUserSchema } from '../validation/auth.js';
import {
  registerUserController,
  loginUserController,
  logoutUserController,
  refreshSessionController,
} from '../controllers/authController.js';

const router = Router();

router.post(
  '/register',
  validateBody(registerUserSchema),
  registerUserController,
);

router.post(
  '/login',
  validateBody(loginUserSchema),
  loginUserController,
);

router.post('/refresh', refreshSessionController);

router.post('/logout', logoutUserController);

export default router;
