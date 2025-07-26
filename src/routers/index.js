import { Router } from 'express';
import articlesRouter from './articlesRouter.js'; 
import authRouter from './auth.js';

const router = Router();

router.use(authRouter);
router.use('/articles', articlesRouter); 

export default router;
