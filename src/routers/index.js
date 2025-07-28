import { Router } from 'express';

import authRouter from './auth.js';
import articlesRouter from './articlesRouter.js'; 

const router = Router();

router.use('/auth', authRouter);
router.use('/articles', articlesRouter); 

export default router;
