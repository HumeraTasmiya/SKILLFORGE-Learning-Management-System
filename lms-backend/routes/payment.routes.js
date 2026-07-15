import express from 'express';
import {
  confirmCertificatePayment,
  completeStripeCheckout,
  createCertificateCheckout,
  getPaymentConfig,
  getPaymentHistory,
} from '../controllers/payment.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/config', getPaymentConfig);
router.post('/certificate-checkout', protect, createCertificateCheckout);
router.post('/stripe/complete', protect, completeStripeCheckout);
router.post('/:id/confirm', protect, confirmCertificatePayment);
router.get('/history', protect, getPaymentHistory);

export default router;
