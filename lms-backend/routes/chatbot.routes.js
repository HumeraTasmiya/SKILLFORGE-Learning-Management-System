import express from 'express';
import {
  chat,
  supportChat,
  generateRoadmap,
  explainError,
  generateNotes,
} from '../controllers/chatbot.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { chatbotLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/chat', protect, chatbotLimiter, chat);
router.post('/support', chatbotLimiter, supportChat);
router.post('/roadmap', protect, chatbotLimiter, generateRoadmap);
router.post('/explain-error', protect, chatbotLimiter, explainError);
router.post('/generate-notes', protect, chatbotLimiter, generateNotes);

export default router;
