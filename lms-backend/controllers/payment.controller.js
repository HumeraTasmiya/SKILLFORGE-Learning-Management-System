import Stripe from 'stripe';
import Payment from '../models/Payment.js';
import Certificate from '../models/Certificate.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import User from '../models/User.js';
import { generateCertificateId } from '../utils/certificate.js';

const certificatePrice = () => Number(process.env.CERTIFICATE_BASE_PRICE || 2.49);

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecret ? new Stripe(stripeSecret) : null;

export const getPaymentConfig = (req, res) => {
  res.json({
    success: true,
    certificatePrice: certificatePrice(),
    currency: 'USD',
    stripeConfigured: Boolean(stripe),
  });
};

export const createCertificateCheckout = async (req, res) => {
  try {
    const { courseId, currency = 'usd', couponCode } = req.body;
    if (!courseId) {
      return res
        .status(400)
        .json({ success: false, message: 'courseId is required' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: 'Course not found' });
    }

    const enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: courseId,
    });
    if (!enrollment || enrollment.progress < 80) {
      return res.status(400).json({
        success: false,
        message:
          'Complete at least 80% of this course to purchase a verified certificate.',
      });
    }

    const paidAlready = await Payment.findOne({
      user: req.user.id,
      course: courseId,
      status: 'paid',
    });
    if (paidAlready) {
      return res.status(400).json({
        success: false,
        message: 'You already purchased a certificate for this course.',
      });
    }

    const amount = certificatePrice();
    const payment = await Payment.create({
      user: req.user.id,
      course: courseId,
      provider: 'stripe',
      amount,
      currency: currency.toUpperCase(),
      couponCode,
      status: 'created',
      metadata: {},
    });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    if (!stripe) {
      return res.status(201).json({
        success: true,
        payment,
        checkout: {
          provider: 'stripe',
          amount,
          currency: currency.toUpperCase(),
          url: null,
          sessionId: null,
          message:
            'Stripe is not configured on the server (set STRIPE_SECRET_KEY). Use payment confirmation from the API or configure Stripe for live checkout.',
        },
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `Verified certificate · ${course.title}`,
              description: 'SkillForge verified completion certificate',
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        paymentId: payment._id.toString(),
        userId: req.user.id.toString(),
        courseId: course._id.toString(),
      },
      success_url: `${clientUrl}/certificates?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/certificates?checkout=cancel`,
    });

    payment.metadata = { ...(payment.metadata || {}), stripeSessionId: session.id };
    await payment.save();

    res.status(201).json({
      success: true,
      payment,
      checkout: {
        provider: 'stripe',
        amount,
        currency: currency.toUpperCase(),
        url: session.url,
        sessionId: session.id,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const completeStripeCheckout = async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res
        .status(400)
        .json({ success: false, message: 'sessionId is required' });
    }
    if (!stripe) {
      return res
        .status(503)
        .json({ success: false, message: 'Stripe is not configured.' });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Payment was not completed.',
      });
    }

    const paymentId = session.metadata?.paymentId;
    const payment = await Payment.findById(paymentId);
    if (!payment || String(payment.user) !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'This payment does not belong to your account.',
      });
    }

    if (payment.status === 'paid') {
      const certificate = await Certificate.findOne({
        user: payment.user,
        course: payment.course,
      }).sort({ createdAt: -1 });
      return res.json({
        success: true,
        alreadyCompleted: true,
        payment,
        certificate,
      });
    }

    payment.status = 'paid';
    payment.providerPaymentId =
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id || session.id;
    await payment.save();

    const certId = generateCertificateId();
    const certificate = await Certificate.create({
      user: payment.user,
      course: payment.course,
      certificateId: certId,
      status: 'approved',
      score: 100,
      certificateUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/certificates?verify=${encodeURIComponent(certId)}`,
    });

    payment.certificate = certificate._id;
    await payment.save();

    await User.findByIdAndUpdate(req.user.id, {
      $push: { certificates: certificate._id },
    });

    res.json({ success: true, payment, certificate });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const confirmCertificatePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment)
      return res
        .status(404)
        .json({ success: false, message: 'Payment not found' });
    if (String(payment.user) !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    payment.status = 'paid';
    payment.providerPaymentId =
      req.body.providerPaymentId || `manual_${Date.now()}`;
    const certId = generateCertificateId();
    const certificate = await Certificate.create({
      user: payment.user,
      course: payment.course,
      certificateId: certId,
      status: 'approved',
      score: 96,
      certificateUrl: `${process.env.CLIENT_URL}/certificates?verify=${encodeURIComponent(certId)}`,
    });
    payment.certificate = certificate._id;
    await payment.save();

    await User.findByIdAndUpdate(payment.user, {
      $push: { certificates: certificate._id },
    });

    res.json({ success: true, payment, certificate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPaymentHistory = async (req, res) => {
  const query = req.user.role === 'admin' ? {} : { user: req.user.id };
  const payments = await Payment.find(query)
    .populate('course', 'title thumbnail')
    .sort('-createdAt');
  res.json({ success: true, payments });
};
