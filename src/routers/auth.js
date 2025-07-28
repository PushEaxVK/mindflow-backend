import { Router } from 'express';
import { validateBody } from '../middlewares/validateBody.js';
import { registerUserSchema, loginUserSchema, refreshSessionSchema } from '../validation/auth.js';
import {
  registerUserController,
  loginUserController,
  logoutUserController,
  refreshSessionController,
} from '../controllers/auth.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

router.post(
  '/register',
  validateBody(registerUserSchema),
  registerUserController,
);

authRouter.post('/login', validateBody(loginUserSchema), loginUserController);

authRouter.post('/logout', authenticate, logoutUserController);

authRouter.post(
  '/refresh',
  validateBody(refreshSessionSchema),
  refreshSessionController,
);

export default router;
