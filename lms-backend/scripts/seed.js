import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Testimonial from '../models/Testimonial.js';

dotenv.config();
await connectDB();

const password = await bcrypt.hash('SkillForge@123', 12);
const instructor = await User.findOneAndUpdate(
  { email: 'instructor@skillforge.ai' },
  { name: 'Aisha Rao', email: 'instructor@skillforge.ai', password, role: 'instructor', isVerified: true },
  { upsert: true, new: true }
);

await User.findOneAndUpdate(
  { email: 'admin@skillforge.ai' },
  { name: 'Admin User', email: 'admin@skillforge.ai', password, role: 'admin', isVerified: true },
  { upsert: true }
);

await User.findOneAndUpdate(
  { email: 'student@skillforge.ai' },
  { name: 'Demo Student', email: 'student@skillforge.ai', password, role: 'student', isVerified: true },
  { upsert: true }
);

const courseCatalog = [
  ['MERN Stack Development', 'React', 'Intermediate'],
  ['React Mastery', 'React', 'Intermediate'],
  ['Node.js Backend Engineering', 'Node.js', 'Intermediate'],
  ['MongoDB Complete Guide', 'MongoDB', 'Beginner'],
  ['TypeScript Advanced', 'TypeScript', 'Advanced'],
  ['Python for AI', 'Python', 'Beginner'],
  ['Machine Learning Fundamentals', 'Python', 'Intermediate'],
  ['Data Structures & Algorithms', 'DSA', 'Intermediate'],
  ['Next.js Bootcamp', 'Next.js', 'Intermediate'],
  ['DevOps Essentials', 'DevOps', 'Beginner'],
  ['Docker & Kubernetes', 'DevOps', 'Advanced'],
  ['Cybersecurity Basics', 'Other', 'Beginner'],
  ['Git and GitHub Workflow', 'Git', 'Beginner'],
  ['HTML and Accessibility Foundations', 'HTML', 'Beginner'],
  ['CSS Layouts and Responsive Design', 'CSS', 'Beginner'],
  ['Modern JavaScript Projects', 'JavaScript', 'Intermediate'],
  ['Java Programming Core', 'Java', 'Beginner'],
  ['C Programming Foundations', 'C', 'Beginner'],
  ['C++ Problem Solving', 'C++', 'Intermediate'],
  ['Full Stack Web Development', 'React', 'Advanced'],
  ['API Design and Testing', 'Node.js', 'Intermediate'],
  ['Database Modeling for Apps', 'MongoDB', 'Intermediate'],
  ['Cloud Deployment Playbook', 'DevOps', 'Intermediate'],
  ['AI Prompt Engineering for Developers', 'Other', 'Beginner'],
];

for (const [index, [title, category, level]] of courseCatalog.entries()) {
  const labName = `${title.split(' ')[0]} capstone lab`;
  await Course.findOneAndUpdate(
    { title },
    {
      title,
      description: `${title} with guided readings, hands-on labs, quizzes, project checkpoints, and certificate eligibility.`,
      thumbnail: `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80`,
      category,
      level,
      instructor: instructor._id,
      lessons: [
        {
          title: 'Roadmap and setup',
          content: `Set up the tools for ${title}, understand the outcomes, and complete a short readiness checklist.`,
          duration: 18,
          order: 1,
          isPreview: true,
          resources: [{ title: 'Course roadmap', url: 'https://developer.mozilla.org/' }],
        },
        {
          title: 'Core concepts and worked examples',
          content: `Study the key patterns behind ${title} through annotated examples and common mistakes.`,
          codeExample: category === 'HTML' ? '<main><h1>Hello SkillForge</h1></main>' : 'const progress = completed / total;',
          duration: 32,
          order: 2,
        },
        {
          title: labName,
          content: `Build a practical ${labName.toLowerCase()} and submit evidence of your implementation decisions.`,
          duration: 45,
          order: 3,
        },
        {
          title: 'Review, quiz, and next steps',
          content: `Review the project, take the assessment, and map the next skill to learn after ${title}.`,
          duration: 20,
          order: 4,
        },
      ],
      quizzes: [
        { question: `What is the best first step for ${title}?`, options: ['Skip setup', 'Understand goals', 'Avoid practice'], answer: 'Understand goals', explanation: 'A clear roadmap improves retention.' },
        { question: `How should you prove progress in ${title}?`, options: ['Only watch videos', 'Build and test a project', 'Ignore feedback'], answer: 'Build and test a project', explanation: 'Applied work turns concepts into durable skill.' },
      ],
      isPublished: true,
      isFree: true,
      price: 0,
      totalDuration: 115,
      tags: ['hands-on', 'interactive', 'certificate', category.toLowerCase()],
    },
    { upsert: true }
  );
}

const student = await User.findOne({ email: 'student@skillforge.ai' });
const seededCourses = await Course.find({ isPublished: true }).sort({ createdAt: -1 }).limit(6);

if (student && seededCourses.length > 0) {
  for (const [i, course] of seededCourses.entries()) {
    const lessonIds = course.lessons.map((lesson) => lesson._id);
    const completedCount = Math.max(1, Math.min(lessonIds.length, (i % lessonIds.length) + 1));
    const completedLessons = lessonIds.slice(0, completedCount);
    const progress = Math.round((completedCount / Math.max(lessonIds.length, 1)) * 100);

    await Enrollment.findOneAndUpdate(
      { user: student._id, course: course._id },
      {
        user: student._id,
        course: course._id,
        completedLessons,
        progress,
        isCompleted: progress === 100,
        completedAt: progress === 100 ? new Date() : undefined,
        lastAccessedAt: new Date(Date.now() - i * 86400000),
      },
      { upsert: true, new: true }
    );
  }
}

const testimonials = [
  {
    quote: 'The coding playground feels like W3Schools grew into an enterprise product.',
    name: 'Priya S.',
    role: 'Frontend Engineer',
    sortOrder: 1,
  },
  {
    quote: 'The certificate workflow paid for itself in the first week of launch.',
    name: 'Omar K.',
    role: 'Bootcamp Founder',
    sortOrder: 2,
  },
  {
    quote: 'Our instructors finally have analytics that feel actionable, not decorative.',
    name: 'Maya J.',
    role: 'Learning Ops Lead',
    sortOrder: 3,
  },
];

for (const item of testimonials) {
  await Testimonial.findOneAndUpdate(
    { name: item.name, role: item.role },
    { ...item, isActive: true },
    { upsert: true, new: true }
  );
}

console.log('SkillForge seed complete. Password for seeded accounts: SkillForge@123');
console.log('  instructor@skillforge.ai | admin@skillforge.ai | student@skillforge.ai');
process.exit(0);
