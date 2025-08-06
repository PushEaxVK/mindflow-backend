import { updateUserService } from "../services/userUpload.js";
import { uploadCloud } from "../utils/uploadToClaudinary.js";


export async function uploadPhotoController(req, res, next) {
  try {
    
    if (!req.file) {
      return res.status(400).json({
        status: 400,
        message: 'No file uploaded.'
      });
    }

    
    const photoUrl = await uploadCloud(req.file.path);

   
    
    const userId = req.user._id;


    const updatedUser = await updateUserService(userId, {
      avatarUrl: photoUrl
    });


    res.status(200).json({
      status: 200,
      message: 'Фото успішно завантажено та збережено!',
      data: updatedUser,
    });
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