import { Router } from 'express';
import {
  registerUserSchema,
  loginUserSchema,
  refreshSessionSchema,
} from '../validation/auth.js';
import {
  registerUserController,
  loginUserController,
  logoutUserController,
  refreshSessionController,
} from '../controllers/auth.js';
import { authenticate } from '../middlewares/authenticate.js';

import validateBody from '../middlewares/validateBody';

const router = Router();

router.post(
  '/register',
  validateBody(registerUserSchema),
  registerUserController,
);

router.post('/login', validateBody(loginUserSchema), loginUserController);

router.post('/logout', authenticate, logoutUserController);

router.post(
  '/refresh',
  validateBody(refreshSessionSchema),
  refreshSessionController,
);

export default router;
