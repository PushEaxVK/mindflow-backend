import express from 'express';
import { upload } from '../middlewares/upload.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { uploadPhotoController } from '../controllers/upload.js';
const router = express.Router();

router.post('/', upload.single('photo'), ctrlWrapper(uploadPhotoController));


export default router;