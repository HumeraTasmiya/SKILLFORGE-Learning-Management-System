import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    certificate: { type: mongoose.Schema.Types.ObjectId, ref: 'Certificate' },
    provider: { type: String, enum: ['stripe', 'razorpay', 'paypal'], required: true },
    providerPaymentId: String,
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    status: { type: String, enum: ['created', 'paid', 'failed', 'refunded'], default: 'created' },
    invoiceUrl: String,
    couponCode: String,
    metadata: Object,
  },
  { timestamps: true }
);

export default mongoose.model('Payment', paymentSchema);
