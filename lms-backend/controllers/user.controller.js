import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';

// @route PUT /api/users/profile
export const updateProfile = async (req, res) => {
  try {
    const { name, bio } = req.body;
    const updates = {};
    if (name !== undefined) {
      const trimmed = String(name).trim();
      if (!trimmed) {
        return res.status(400).json({ success: false, message: 'Name cannot be empty' });
      }
      updates.name = trimmed;
    }
    if (bio !== undefined) {
      updates.bio = String(bio ?? '').trim();
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'Provide name or bio to update' });
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/users/avatar
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: 'No image provided' });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'lms/avatars',
      width: 300,
      height: 300,
      crop: 'fill',
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: result.secure_url },
      { new: true }
    ).select('-password');

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/users/bookmarks/:lessonId
export const toggleBookmark = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const lessonId = req.params.lessonId;
    const isBookmarked = user.bookmarks.includes(lessonId);

    if (isBookmarked) {
      user.bookmarks = user.bookmarks.filter(
        (id) => id.toString() !== lessonId
      );
    } else {
      user.bookmarks.push(lessonId);
    }

    await user.save();
    res.json({
      success: true,
      bookmarked: !isBookmarked,
      bookmarks: user.bookmarks,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/users/notes
export const saveNote = async (req, res) => {
  try {
    const { lessonId, content } = req.body;
    const user = await User.findById(req.user.id);

    const existingNote = user.notes.find(
      (n) => n.lessonId.toString() === lessonId
    );
    if (existingNote) {
      existingNote.content = content;
      existingNote.updatedAt = Date.now();
    } else {
      user.notes.push({ lessonId, content });
    }

    await user.save();
    res.json({ success: true, notes: user.notes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/users/notes
export const getNotes = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate(
      'notes.lessonId',
      'title'
    );
    res.json({ success: true, notes: user.notes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/users/leaderboard
export const getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({ role: 'student', isActive: true })
      .select('name avatar codingStreak enrolledCourses certificates')
      .sort({ codingStreak: -1 })
      .limit(20);

    res.json({ success: true, leaderboard: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
