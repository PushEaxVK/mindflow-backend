import { Router } from 'express';
import authRouter from './auth.js';
import articlesRouter from './articlesRouter.js';
import usersRouter from './usersRouter.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/articles', articlesRouter);
router.use('/users', usersRouter);
// router.use('/authors', authorsRouter);

export default router;
