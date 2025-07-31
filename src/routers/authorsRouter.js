import { Router } from 'express';
import { authorProfileController } from '../controllers/authorsController.js';
import { isValidId } from '../middlewares/isValidId.js';
import { authOptional } from '../middlewares/authOptional.js';
import { authorProfileSchema } from '../validation/authorsValidation.js';
import { validateQuery } from '../middlewares/validateQuery.js';

const authorsRouter = Router();

authorsRouter.get(
  '/:id',
  authOptional,
  isValidId,
  validateQuery(authorProfileSchema),
  authorProfileController,
);

export default authorsRouter;
