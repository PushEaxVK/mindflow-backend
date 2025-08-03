import multer from 'multer';
import path from 'node:path';

export const TEMP_UPLOAD_DIR = path.join(process.cwd(), 'src', 'uploads');//uploads

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, TEMP_UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, `${uniqueSuffix}_${file.originalname}`);
  },
});

const upload = multer({
    storage,
    limits: { fileSize: 1 * 1024 * 1024 }
 });

export { upload };