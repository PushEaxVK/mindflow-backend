import { Router } from 'express';
import {
  loginUserController,
  logoutUserController,
  refreshSessionController,
} from '../controllers/auth.js';
import { authenticate } from '../middlewares/authenticate.js';
import { validateBody } from '../middlewares/validateBody.js';
import { loginUserSchema, refreshSessionSchema } from '../validation/auth.js';

const authRouter = Router();

authRouter.post('/login', validateBody(loginUserSchema), loginUserController);

authRouter.post('/logout', authenticate, logoutUserController);

authRouter.post(
  '/refresh',
  validateBody(refreshSessionSchema),
  refreshSessionController,
);

export default authRouter;
