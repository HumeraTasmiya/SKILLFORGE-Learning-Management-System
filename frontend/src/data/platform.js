import {
  Award,
  BarChart3,
  BookOpen,
  Bot,
  BrainCircuit,
  CalendarClock,
  Code2,
  CreditCard,
  PlayCircle,
  ShieldCheck,
  Smartphone,
  Trophy,
} from 'lucide-react';

export const brand = {
  name: 'SkillForge',
  tagline: 'Learn Smarter. Build Faster. Grow Limitlessly.',
  vision: 'To democratize high-quality tech education with AI-driven personalized learning experiences.',
  mission:
    'Empower students, instructors, and organizations with structured courses, hands-on practice, certificates, and role-based tooling.',
};

/** Landing page FAQs — aligned with what the app ships today */
export const landingFaqs = [
  {
    q: 'Is learning on SkillForge free?',
    a: 'Yes. Browse and enroll in published courses at no cost. You pay only if you choose optional verified certificate checkout after reaching enough progress (80%) on a course.',
  },
  {
    q: 'How do verified certificates work?',
    a: 'When you reach the progress threshold, you can start a Stripe Checkout session (when the server is configured with Stripe). After payment, a certificate record is created with a verification ID you can share.',
  },
  {
    q: 'Who is SkillForge built for?',
    a: 'Learners who want structured courses with lessons and progress tracking, plus instructors and admins who need dashboards to manage content and users.',
  },
  {
    q: 'What can instructors do?',
    a: 'Instructors use the instructor dashboard to work with courses and analytics as implemented in your deployment. Advanced workflows (reviews, enterprise SSO) depend on how you configure and extend the backend.',
  },
  {
    q: 'Does SkillForge work on phones and tablets?',
    a: 'The UI is responsive: collapsible navigation, touch-friendly controls, and readable layouts from small phones up. Complex coding labs are best on desktop.',
  },
  {
    q: 'How do I get help?',
    a: 'Use the in-app AI assistant for learning questions, or reach out through your organization’s support channel if this is a private deployment.',
  },
];

/** Features shown on the landing page — match shipped product capabilities */
export const features = [
  ['AI learning assistant', Bot],
  ['Hands-on coding playground', Code2],
  ['Searchable course catalog', BookOpen],
  ['Lessons with video & progress tracking', PlayCircle],
  ['Course quizzes', BrainCircuit],
  ['Verified certificates & QR lookup', Award],
  ['Stripe checkout for certificates', CreditCard],
  ['Student, instructor & admin dashboards', BarChart3],
  ['Role-based access & secure auth', ShieldCheck],
  ['Responsive layout & dark mode', Smartphone],
];

const courseNames = [
  'MERN Stack Development',
  'React Mastery',
  'Node.js Backend Engineering',
  'MongoDB Complete Guide',
  'TypeScript Advanced',
  'Python for AI',
  'Machine Learning Fundamentals',
  'Data Structures & Algorithms',
  'Next.js Bootcamp',
  'DevOps Essentials',
  'Docker & Kubernetes',
  'Cybersecurity Basics',
  'UI/UX Design',
  'System Design',
  'AWS Cloud Computing',
  'Blockchain Development',
  'AI Prompt Engineering',
  'Flutter Development',
  'Java Programming',
  'Full Stack Web Development',
  'Cloud Native APIs',
  'Stripe Payment Systems',
];

export const courses = courseNames.map((title, index) => ({
  id: index + 1,
  title,
  instructor: ['Aisha Rao', 'Marcus Lee', 'Nora Patel', 'Daniel Kim'][index % 4],
  rating: (4.6 + (index % 4) * 0.1).toFixed(1),
  progress: index % 5 === 0 ? 82 : index % 5 === 1 ? 48 : index % 5 === 2 ? 17 : 0,
  level: ['Beginner', 'Intermediate', 'Advanced'][index % 3],
  price: 'Free',
  certificate: `$${(2.25 + (index % 3) * 0.25).toFixed(2)} certificate`,
  enrolled: `${(12 + index * 3).toLocaleString()}k`,
  image: `https://images.unsplash.com/photo-${[
    '1516321318423-f06f85e504b3',
    '1555066931-4365d14bab8c',
    '1555949963-aa79dcee981c',
    '1515879218367-8466d910aaa4',
    '1551288049-bebda4e38f71',
    '1677442136019-21780ecad995',
  ][index % 6]}?auto=format&fit=crop&w=900&q=80`,
}));

export const dashboardCards = [
  { label: 'Learning Progress', value: '78%', delta: '+12%', icon: BookOpen },
  { label: 'Certificates Earned', value: '9', delta: '+3', icon: Award },
  { label: 'Study Streak', value: '31 days', delta: '+8', icon: Trophy },
  { label: 'Upcoming Deadlines', value: '6', delta: '2 urgent', icon: CalendarClock },
];

export const chartData = [
  { month: 'Jan', progress: 28, revenue: 1200, active: 340 },
  { month: 'Feb', progress: 42, revenue: 2100, active: 480 },
  { month: 'Mar', progress: 51, revenue: 2600, active: 620 },
  { month: 'Apr', progress: 67, revenue: 3900, active: 810 },
  { month: 'May', progress: 78, revenue: 5200, active: 1040 },
  { month: 'Jun', progress: 86, revenue: 7100, active: 1290 },
];

export const testimonials = [
  ['The coding playground feels like W3Schools grew into an enterprise product.', 'Priya S.', 'Frontend Engineer'],
  ['The certificate workflow paid for itself in the first week of launch.', 'Omar K.', 'Bootcamp Founder'],
  ['Our instructors finally have analytics that feel actionable, not decorative.', 'Maya J.', 'Learning Ops Lead'],
];
