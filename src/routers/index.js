import { Router } from 'express';
import authRouter from './auth.js';
import articlesRouter from './articlesRouter.js';
import authorsRouter from './authorsRouter.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/articles', articlesRouter);
router.use('/authors', authorsRouter);

export default router;
