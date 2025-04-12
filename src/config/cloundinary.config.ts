import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Định nghĩa interface cho params
interface CloudinaryParams {
    folder: string;
    allowedFormats: string[];
}

// Cấu hình Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Tạo storage engine cho Multer
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'YOUR_FOLDER_NAME',
        allowedFormats: ['jpeg', 'png', 'jpg'],
    } as CloudinaryParams,
});

export { cloudinary, storage };
