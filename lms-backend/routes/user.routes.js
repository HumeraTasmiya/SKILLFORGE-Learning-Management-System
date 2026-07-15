import express from 'express';
import {
  updateProfile,
  uploadAvatar,
  toggleBookmark,
  saveNote,
  getNotes,
  getLeaderboard,
} from '../controllers/user.controller.js';
import { getStudentDashboard } from '../controllers/studentDashboard.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { uploadImage } from '../middleware/upload.middleware.js';

const router = express.Router();

router.put('/profile', protect, updateProfile);
router.put('/avatar', protect, uploadImage.single('avatar'), uploadAvatar);
router.post('/bookmarks/:lessonId', protect, toggleBookmark);
router.put('/notes', protect, saveNote);
router.get('/notes', protect, getNotes);
router.get('/leaderboard', getLeaderboard);
router.get('/student-dashboard', protect, authorize('student'), getStudentDashboard);

export default router;
