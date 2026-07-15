export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'SkillForge API',
    version: '1.0.0',
    description: 'REST API for courses, auth, AI chatbot, certificates, payments, analytics, and notifications.',
  },
  servers: [{ url: '/api' }],
  paths: {
    '/auth/register': { post: { summary: 'Register student, instructor, or admin account' } },
    '/auth/login': { post: { summary: 'Login with JWT cookie/session support' } },
    '/courses': { get: { summary: 'List free course catalog' }, post: { summary: 'Create instructor course' } },
    '/chatbot': { post: { summary: 'Ask context-aware AI assistant' } },
    '/payments/certificate-checkout': { post: { summary: 'Create paid certificate checkout' } },
    '/certificates': { get: { summary: 'List user certificates' } },
    '/analytics/dashboard': { get: { summary: 'Admin and instructor analytics dashboard' } },
    '/notifications': { get: { summary: 'List user notifications' } },
  },
};
