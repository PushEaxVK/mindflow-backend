import { Router } from 'express';
// import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import {
  loginUserController,
  refreshSessionController,
  logoutUserController,
} from '../controllers/auth.js';

import { loginUserSchema } from '../validation/auth.js';

const authRouter = Router();

authRouter.post(
  '/auth/login',
  validateBody(loginUserSchema),
  loginUserController,
);

authRouter.post('/auth/logout', logoutUserController);

authRouter.post('/auth/refresh', refreshSessionController);

export default authRouter;
