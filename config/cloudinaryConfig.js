import cloudinary from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Cloudinary configuration
cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Setting up Cloudinary storage with multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,  // use cloudinary.v2
  params: {
    folder: 'personal_details',
    allowed_formats: ['jpg', 'jpeg', 'png', 'mp4'],
  },
});

const upload = multer({ storage });

// Correct export
export default upload;
