import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper';
import {
  getUserArticlesController,
  getUserInfoController,
} from '../controllers/users';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

router.use(authenticate);

router.get('/user', ctrlWrapper(getUserInfoController));

router.get('/articles/my', ctrlWrapper(getUserArticlesController));

export default router;
