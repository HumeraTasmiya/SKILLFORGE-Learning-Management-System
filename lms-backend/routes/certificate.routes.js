import express from 'express';
import {
  getMyCertificates,
  verifyCertificate,
  getAllCertificates,
} from '../controllers/certificate.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/my', protect, getMyCertificates);
router.get('/verify/:certificateId', verifyCertificate);
router.get('/', protect, authorize('admin'), getAllCertificates);

export default router;
