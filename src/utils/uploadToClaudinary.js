import { v2 as cloudinary } from 'cloudinary';
import { getEnvVar } from './getEnvVar.js';

cloudinary.config({
    cloud_name: getEnvVar('CLOUD_NAME'),
    api_key: getEnvVar('API_KEY'),
    api_secret: getEnvVar('API_SECRET'),
});

export async function uploadCloud(filePath) { 
    try {
        const result = await cloudinary.uploader.upload(filePath); 
        return result.secure_url; 
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw error;
    }
}