import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Testimonial from '../models/Testimonial.js';

dotenv.config();
await connectDB();

const testimonials = [
  {
    quote: 'SkillForge gave our students a cleaner path from lesson to project to portfolio.',
    name: 'Nadia R.',
    role: 'Curriculum Lead',
    sortOrder: 1,
  },
  {
    quote: 'Enrollment doubled after we started showing learner analytics in class reviews.',
    name: 'Arjun M.',
    role: 'Instructor',
    sortOrder: 2,
  },
  {
    quote: 'The AI support bot solved common learner doubts without waiting for office hours.',
    name: 'Khalid A.',
    role: 'Program Manager',
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

console.log('Testimonials seeded/updated successfully.');
process.exit(0);
