import crypto from 'crypto';

export const generateCertificateId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `LMS-${timestamp}-${random}`;
};
