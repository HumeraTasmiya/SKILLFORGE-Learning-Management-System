import express from 'express';
import cloudinary from '../config/cloudinary.js';
import { uploadImage, uploadVideo } from '../middleware/upload.middleware.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// @route POST /api/upload/image
router.post(
  '/image',
  protect,
  uploadImage.single('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: 'No file provided' });
      }

      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'lms/images',
      });

      res.json({ success: true, url: result.secure_url, publicId: result.public_id });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// @route POST /api/upload/video (instructor/admin only)
router.post(
  '/video',
  protect,
  authorize('instructor', 'admin'),
  uploadVideo.single('video'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: 'No file provided' });
      }

      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'lms/videos',
        resource_type: 'video',
        chunk_size: 6000000,
      });

      res.json({ success: true, url: result.secure_url, publicId: result.public_id });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// @route POST /api/upload/thumbnail
router.post(
  '/thumbnail',
  protect,
  authorize('instructor', 'admin'),
  uploadImage.single('thumbnail'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: 'No file provided' });
      }

      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'lms/thumbnails',
        width: 1280,
        height: 720,
        crop: 'fill',
      });

      res.json({ success: true, url: result.secure_url });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

export default router;
