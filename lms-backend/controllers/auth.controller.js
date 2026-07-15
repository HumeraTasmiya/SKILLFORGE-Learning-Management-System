import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendEmail } from '../config/mailer.js';

// Helper: generate JWT
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Helper: set cookie
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  const userObj = user.toObject();
  delete userObj.password;

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({ success: true, token, user: userObj });
};

// @route POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    const emailNorm = String(email || '').trim().toLowerCase();
    if (!emailNorm || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const existingUser = await User.findOne({ email: emailNorm })
      || (await User.findOne({
        email: { $regex: new RegExp(`^${emailNorm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      }));
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const allowAdminSelfRegister =
      String(process.env.ALLOW_SELF_ASSIGN_ROLES || process.env.ALLOW_ADMIN_SELF_REGISTER || '').toLowerCase() === 'true';
    const requested = typeof role === 'string' ? role.trim().toLowerCase() : '';
    let safeRole = 'student';
    if (requested === 'instructor' || requested === 'student') {
      safeRole = requested;
    } else if (requested === 'admin' && allowAdminSelfRegister) {
      safeRole = 'admin';
    } else if (requested === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin self-registration is disabled on this server.',
      });
    }

    const user = await User.create({
      name,
      email: emailNorm,
      phone: phone != null ? String(phone).trim() : '',
      password: hashedPassword,
      role: safeRole,
    });

    // Welcome email
    try {
      await sendEmail({
        to: emailNorm,
        subject: 'Welcome to LMS Platform 🎉',
        html: `<h2>Welcome, ${name}!</h2><p>Your account has been created. Start learning today!</p>`,
      });
    } catch (emailErr) {
      console.error('Email error:', emailErr.message);
    }

    sendTokenResponse(user, 201, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const identifier = String(email || req.body.identifier || req.body.phone || '').trim();
    const emailNorm = identifier.toLowerCase();
    const passwordStr = typeof password === 'string' ? password : String(password ?? '');
    if (!identifier || !passwordStr) {
      return res
        .status(400)
        .json({ success: false, message: 'Please provide email/phone and password' });
    }

    const escapedIdentifier = identifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const user = await User.findOne({ email: emailNorm })
      || (await User.findOne({
        email: { $regex: new RegExp(`^${escapedIdentifier}$`, 'i') },
      }))
      || (await User.findOne({ phone: identifier }));
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: 'Please login with Google',
      });
    }

    let isMatch = await bcrypt.compare(passwordStr, user.password);
    if (!isMatch && passwordStr.trim() !== passwordStr) {
      isMatch = await bcrypt.compare(passwordStr.trim(), user.password);
    }

    // Backward-compat migration for old plaintext passwords in legacy/demo data.
    const legacyPlaintextMatch =
      typeof user.password === 'string' &&
      (user.password === passwordStr || user.password === passwordStr.trim());
    if (!isMatch && legacyPlaintextMatch) {
      user.password = await bcrypt.hash(user.password, 12);
      await user.save();
      isMatch = true;
    }

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res
        .status(403)
        .json({ success: false, message: 'Account is deactivated' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/auth/logout
export const logout = (req, res) => {
  res.cookie('token', '', { expires: new Date(0), httpOnly: true });
  res.json({ success: true, message: 'Logged out successfully' });
};

// @route GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('enrolledCourses', 'title thumbnail category')
      .populate('certificates');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const emailNorm = String(email || '').trim().toLowerCase();
    const user = await User.findOne({ email: emailNorm })
      || (await User.findOne({
        email: { $regex: new RegExp(`^${emailNorm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      }));
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 min
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <h2>Password Reset</h2>
        <p>Click the link below to reset your password. This link expires in 15 minutes.</p>
        <a href="${resetUrl}" style="background:#22c55e;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;">Reset Password</a>
      `,
    });

    res.json({ success: true, message: 'Reset email sent' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/auth/reset-password/:token
export const resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid or expired token' });
    }

    user.password = await bcrypt.hash(req.body.password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
