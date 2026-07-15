import Certificate from '../models/Certificate.js';
import Course from '../models/Course.js';
import User from '../models/User.js';

// @route GET /api/certificates/my
export const getMyCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({
      user: req.user.id,
      status: 'approved',
    })
      .populate('course', 'title category instructor thumbnail')
      .populate('user', 'name');

    res.json({ success: true, certificates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/certificates/verify/:certificateId
export const verifyCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findOne({
      certificateId: req.params.certificateId,
      status: 'approved',
    })
      .populate('user', 'name email')
      .populate('course', 'title category');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found or not approved',
      });
    }

    res.json({ success: true, valid: true, certificate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/certificates (admin only)
export const getAllCertificates = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};

    const certificates = await Certificate.find(query)
      .populate('user', 'name email')
      .populate('course', 'title category')
      .sort({ createdAt: -1 });

    res.json({ success: true, certificates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
