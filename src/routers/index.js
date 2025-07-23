import { Router } from 'express';
import contactsRouter from './contacts.js';
import authRouter from './auth.js';

const router = Router();

router.use(contactsRouter);
router.use(authRouter);

export default router;
