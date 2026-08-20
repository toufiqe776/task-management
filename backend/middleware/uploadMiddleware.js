import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary from env variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name'
);

const storage = isCloudinaryConfigured
  ? new CloudinaryStorage({
      cloudinary,
      params: async (req, file) => ({
        folder: 'task-manager',
        resource_type: 'auto',
        public_id: `${Date.now()}-${file.originalname.replace(/\.[^/.]+$/, '')}`,
      }),
    })
  : multer.memoryStorage(); // Safe fallback to memory storage if credentials are missing

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
      return;
    }

    cb(new Error('Unsupported file type'));
  },
});

export default upload;