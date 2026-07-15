# SkillForge LMS Project Report

## 1. Project Overview

SkillForge is a full-stack Learning Management System (LMS) built with the MERN stack. The application provides an online learning platform where students can browse free courses, enroll in published learning tracks, complete lessons and quizzes, use AI learning support, track progress, and unlock verified paid certificates after meeting completion requirements.

The system also includes instructor tools for course creation, student monitoring, assignments, grading, live class scheduling, and AI-assisted course management. Admin users can manage users, roles, courses, certificates, announcements, analytics, and platform activity.

## 2. Project Objectives

- Provide a modern online learning platform for technical education.
- Support role-based access for students, instructors, and admins.
- Allow free course learning with optional paid verified certificates.
- Track learner progress, quiz performance, streaks, notes, bookmarks, and certificates.
- Give instructors a workspace to manage courses and monitor learner performance.
- Give admins complete platform governance and analytics.
- Integrate AI assistance for tutoring, roadmaps, notes, error explanation, and instructor support.

## 3. Technology Stack

### Frontend

- React 18 with Vite
- React Router for navigation
- Tailwind CSS for responsive UI styling
- Axios for API communication
- Redux Toolkit and Zustand support for state management patterns
- Framer Motion and GSAP for animations
- Recharts for dashboards and analytics charts
- Monaco Editor for coding playground support
- Socket.IO client for real-time features
- Lucide React icons

### Backend

- Node.js and Express.js
- MongoDB with Mongoose
- JWT authentication with HTTP-only cookie support
- Bcrypt password hashing
- Socket.IO for real-time notifications
- Cloudinary and Multer for image/video upload
- Stripe for certificate payment checkout
- PDFKit and QRCode for certificate PDF generation and verification
- Google Gemini AI integration for chatbot features
- Nodemailer for email and password reset flows
- Helmet, CORS, Morgan, and rate limiting for security and observability
- Swagger UI for API documentation

## 4. System Architecture

The application is divided into two main workspaces:

- `frontend`: React single-page application that contains public pages, authentication pages, course catalog, course details, certificate portal, playground, and dashboards.
- `lms-backend`: Express REST API that handles authentication, users, courses, lessons, quizzes, enrollments, certificates, payments, analytics, notifications, uploads, instructor tools, and admin tools.

The backend exposes REST endpoints under `/api`, connects to MongoDB, and initializes Socket.IO for real-time notifications. The frontend consumes these APIs through a shared Axios API client.

## 5. User Roles

### Student

Students can register, log in, browse courses, enroll in courses, view course lessons, complete quizzes, track progress, save notes, bookmark lessons, view announcements, use the AI assistant, and unlock certificates after meeting course requirements.

### Instructor

Instructors can create and manage courses, add lessons and quizzes, view enrolled students, answer course questions, create assignments, grade submissions and quiz reviews, schedule live classes, monitor at-risk learners, and use AI support for course-related work.

### Admin

Admins have platform-level control. They can manage users, roles, course publishing, certificates, announcements, analytics, revenue, activity, and platform health indicators.

## 6. Main Frontend Modules

### Landing Page

The landing page presents the SkillForge brand, platform value, featured courses, FAQs, and major capabilities such as free courses, AI assistance, progress analytics, quizzes, certificates, badges, learning paths, projects, dark/light mode, and streak tracking.

### Authentication

The authentication page supports user registration and login. The backend handles password hashing, JWT generation, cookie-based sessions, logout, current-user lookup, forgot password, and password reset.

### Course Catalog

The course catalog allows users to:

- Browse published courses.
- Search by course title, description, or tags.
- Filter by category and level.
- Use quick topic filters.
- See course metadata such as instructor, level, rating, videos, quizzes, certificate availability, and free/paid status.
- Navigate to course detail pages.
- Allow instructors to jump into course management for listed courses.

### Course Details

The course detail flow supports course previewing, enrollment awareness, lesson visibility rules, quiz visibility rules, course reviews, progress display, and course Q&A. Non-enrolled users can only see preview lesson content, while enrolled students and course managers can access full content.

### Student Dashboard

The student dashboard includes:

- Enrolled course count.
- Completed course count.
- Weekly study hours.
- Average quiz score.
- Certificates earned.
- Continue-learning list with next lesson information.
- Learning streak tracking.
- Last-seven-day study activity.
- Upcoming learning deadlines.
- Recent quiz scores.
- Announcements.
- Certificate wallet.
- Courses ready for certificate unlock.

### Instructor Dashboard

The instructor dashboard includes:

- Instructor metrics such as total students, active courses, average completion, overall rating, and total courses.
- Course management list.
- Course builder studio.
- Lesson engagement analytics.
- At-risk student detection.
- Grading queue for assignments and quiz attempts.
- Course Q&A queue.
- Upcoming live classes, assignment deadlines, and content review reminders.
- Activity feed.
- AI assistant panel for instructor support.

### Admin Dashboard

The admin dashboard includes:

- Total users, students, courses, enrollments, certificates, revenue, active learners, and completion rate.
- Recent users, courses, enrollments, payments, certificates, and AI events.
- Role statistics.
- Monthly user growth.
- Top courses by enrollment and completion.
- User management.
- Role management.
- Course publish/unpublish controls.
- Certificate approval and revocation workflows.
- Announcement publishing.
- Platform analytics by date range.

### Certificate Portal

The certificate portal supports certificate eligibility checking, certificate purchase/unlock flow, viewing issued certificates, certificate verification, and PDF download.

### Playground

The frontend includes a playground route and Monaco Editor dependency, indicating support for interactive coding or practice experiences.

### Chatbot

The UI includes chatbot components for AI learning support and support-style questions.

## 7. Main Backend Features

### Authentication and Authorization

- User registration with safe role handling.
- Login by email/identifier/phone.
- Password hashing with bcrypt.
- JWT token generation.
- HTTP-only cookie support.
- Logout.
- Current user endpoint.
- Forgot password and reset password via email token.
- Protected routes and role-based authorization middleware.
- Rate limiting for authentication and chatbot endpoints.

### Course Management

- Create, update, and delete courses by instructors/admins.
- Publish/unpublish courses by admins.
- Course catalog listing with pagination, search, category filter, and level filter.
- Course detail retrieval with enrollment-aware content protection.
- Add, update, and delete lessons.
- Add, update, and delete quizzes.
- Add course reviews by enrolled students.
- Course Q&A support for enrolled students.

### Enrollment and Progress Tracking

- Course enrollment.
- Progress updates.
- Completed lesson tracking.
- Quiz submission.
- Quiz score history.
- Course completion status.
- Certificate-issued status.
- Last accessed tracking.
- Duplicate enrollment prevention.

### Student Learning Tools

- Student dashboard aggregation.
- Continue-learning recommendations.
- Streak and study-date tracking.
- Weekly study minutes.
- Notes by lesson.
- Bookmarks by lesson.
- Leaderboard support.
- Notifications and announcements.

### Instructor Workspace

- Instructor course list and course performance metrics.
- Student list with progress and quiz averages.
- Assignment creation.
- Assignment submission grading.
- Manual review for quiz attempts.
- At-risk student detection based on inactivity, quiz performance, and low progress.
- Lesson engagement analysis.
- Course Q&A queue and answer workflow.
- Live class scheduling.
- Activity feed with enrollments, submissions, AI events, and risk alerts.

### AI Features

The application integrates Google Gemini AI for:

- AI tutor chat.
- Course-specific assistance using enrolled course material.
- Learning roadmap generation.
- Programming error explanation.
- Smart notes generation.
- Support FAQ responses.
- Instructor AI support endpoint.

### Certificate System

- Certificate eligibility checks.
- Configurable completion requirement, defaulting to 85 percent.
- Configurable passing score, defaulting to 90 percent.
- Payment requirement for certificate unlock.
- Certificate generation with unique certificate ID.
- Verification hash and verification URL.
- QR-code based verification.
- PDF certificate download.
- Certificate wallet.
- Admin certificate approval and revocation.
- Public certificate verification endpoint.

### Payment System

- Certificate checkout creation.
- Stripe Checkout integration when configured.
- Manual payment confirmation fallback.
- Payment history.
- Certificate generation after successful payment.
- Payment metadata for score and grade.
- Configurable certificate base price.

### Admin Management

- Dashboard analytics and metrics.
- User CRUD operations.
- Role and permission management.
- Course publishing control.
- Certificate approval/revocation.
- Revenue tracking.
- AI usage tracking.
- Announcement publishing to all active users.
- Real-time notification emission with Socket.IO.

### Uploads

- Image upload.
- Video upload for instructors/admins.
- Thumbnail upload.
- Cloudinary integration.
- Multer middleware for file handling.

### Analytics and Notifications

- Analytics event tracking.
- Landing stats and testimonials.
- Progress trend data.
- Dashboard analytics for admins/instructors.
- User notifications.
- Mark notification as read.
- Real-time notification delivery.

## 8. Database Models

The backend uses Mongoose models for:

- `User`: profile, authentication, role, enrolled courses, certificates, bookmarks, notes, streaks, study dates, and account status.
- `Course`: title, description, category, level, instructor, lessons, quizzes, price, publish status, enrolled students, duration, language, tags, rating, and reviews.
- `Enrollment`: user-course relation, completed lessons, progress, quiz scores, completion status, certificate issued status, and last access time.
- `Certificate`: certificate ID, user, course, payment, status, verification data, score, grade, skills, duration, and revocation data.
- `Payment`: certificate payment records and provider information.
- `Assignment`: instructor-created work and submissions.
- `LiveClass`: scheduled live class sessions.
- `CourseQuestion`: student questions and instructor answers.
- `Notification`: announcements and user notifications.
- `AnalyticsEvent`: tracked analytics and AI usage events.
- `Role`: platform roles and permissions.
- `Testimonial`: public testimonial data.

## 9. Security Features

- Password hashing with bcrypt.
- JWT-based authentication.
- HTTP-only cookie handling.
- Role-based route protection.
- Admin self-registration disabled unless explicitly enabled by environment settings.
- Rate limiting for authentication and chatbot endpoints.
- Helmet security headers.
- CORS origin allowlist.
- File upload restrictions through upload middleware.
- Protected certificate/payment generation workflows.

## 10. Key Strengths of the Application

- Full role-based LMS workflow for students, instructors, and admins.
- Free learning model with premium certificate monetization.
- Strong certificate system with eligibility, payment, verification, QR code, and PDF export.
- AI-powered learning support and content assistance.
- Instructor analytics including at-risk learner detection and grading workflows.
- Admin analytics covering users, enrollments, revenue, certificates, courses, and AI usage.
- Modern responsive frontend with dashboards, charts, and polished course discovery.
- Scalable MERN architecture with clear separation between frontend and backend.

## 11. Conclusion

SkillForge is a feature-rich LMS application designed for modern technical education. It supports the complete learning lifecycle: discovery, enrollment, lesson progress, quizzes, AI support, instructor management, admin governance, payment-backed certificate issuing, and public certificate verification.

The project demonstrates strong use of the MERN stack, role-based access control, analytics, AI integration, real-time notifications, payment processing, and certificate automation. These features make it suitable as a final-year project, portfolio project, or production-ready foundation for an online learning platform.
