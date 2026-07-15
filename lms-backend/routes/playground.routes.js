import express from 'express';
import { runPlaygroundCode } from '../controllers/playground.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { playgroundLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/run', protect, playgroundLimiter, runPlaygroundCode);

export default router;
