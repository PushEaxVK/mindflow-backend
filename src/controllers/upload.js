import { uploadCloud } from "../utils/uploadToClaudinary.js";




export async  function uploadPhotoController(req, res, next) {
  try {
   
    if (!req.file) {
      return res.status(400).json({ status: 400, message: 'No file uploaded.' });
    }

    console.log("Файл знайдено, завантажуємо в Cloudinary...");
    const photoUrl = await uploadCloud(req.file.path);

    const photoAdded = {
      photo: photoUrl,
    };

    res.status(201).json({ status: 201, message: 'Successfully added photo!', data: photoAdded });

  } catch (error) {
    
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: 400,
        message: 'File size limit exceeded (max 1MB).',
      });
    }

    console.error('Помилка у uploadPhotoController:', error);
    next(error);
  }
}

