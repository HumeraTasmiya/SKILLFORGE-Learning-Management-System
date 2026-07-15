# LMS Platform — Backend (Node.js + Express + MongoDB)

## 🚀 Tech Stack
- **Runtime**: Node.js (ESM)
- **Framework**: Express.js
- **Database**: MongoDB Atlas + Mongoose
- **Auth**: JWT + bcryptjs + HttpOnly Cookies
- **File Storage**: Cloudinary
- **AI Chatbot**: Google Gemini API
- **Real-time**: Socket.IO (live classes, notifications)
- **Email**: Nodemailer (Gmail SMTP)
- **Security**: Helmet, Rate Limiting, Protected Routes

---

## 📁 Folder Structure

```
server/
├── config/
│   ├── db.js               # MongoDB connection
│   ├── cloudinary.js       # Cloudinary setup
│   └── mailer.js           # Nodemailer setup
├── controllers/
│   ├── auth.controller.js
│   ├── course.controller.js
│   ├── enrollment.controller.js
│   ├── user.controller.js
│   ├── admin.controller.js
│   ├── instructor.controller.js
│   ├── certificate.controller.js
│   └── chatbot.controller.js
├── middleware/
│   ├── auth.middleware.js   # JWT protect + authorize
│   ├── upload.middleware.js # Multer config
│   └── rateLimiter.js
├── models/
│   ├── User.js
│   ├── Course.js            # Includes lessons + quizzes as sub-docs
│   ├── Enrollment.js
│   ├── Certificate.js
│   └── LiveClass.js
├── routes/
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── course.routes.js
│   ├── lesson.routes.js
│   ├── quiz.routes.js
│   ├── enrollment.routes.js
│   ├── chatbot.routes.js
│   ├── certificate.routes.js
│   ├── admin.routes.js
│   ├── instructor.routes.js
│   └── upload.routes.js
├── sockets/
│   └── socket.js            # Socket.IO events
├── utils/
│   └── certificate.js       # Certificate ID generator
├── .env.example
├── package.json
└── server.js
```

---

## ⚙️ Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
```bash
cp .env.example .env
# Fill in all values in .env
```

### 3. Run in development
```bash
npm run dev
```

### 4. Run in production
```bash
npm start
```

---

## 🔑 Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 5000) |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for JWT (min 32 chars) |
| `CLIENT_URL` | Frontend URL for CORS |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `SMTP_HOST` | SMTP host (e.g., smtp.gmail.com) |
| `SMTP_PORT` | SMTP port (587) |
| `SMTP_USER` | Gmail address |
| `SMTP_PASS` | Gmail App Password |
| `GEMINI_API_KEY` | Google Gemini API key |

---

## 📡 API Endpoints

### Auth (`/api/auth`)
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/register` | Public | Register new user |
| POST | `/login` | Public | Login |
| POST | `/logout` | Public | Logout |
| GET | `/me` | Protected | Get current user |
| POST | `/forgot-password` | Public | Send reset email |
| PUT | `/reset-password/:token` | Public | Reset password |

### Courses (`/api/courses`)
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/` | Public | Get all published courses (with filters) |
| GET | `/:id` | Optional Auth | Get course by ID |
| POST | `/` | Instructor/Admin | Create course |
| PUT | `/:id` | Instructor/Admin | Update course |
| DELETE | `/:id` | Instructor/Admin | Delete course |
| POST | `/:id/lessons` | Instructor/Admin | Add lesson |
| POST | `/:id/review` | Enrolled Student | Add review |

### Enrollments (`/api/enrollments`)
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/:courseId` | Protected | Enroll in course |
| PUT | `/:courseId/progress` | Protected | Mark lesson complete |
| GET | `/my` | Protected | My enrollments |
| POST | `/:courseId/quiz` | Protected | Submit quiz |

### Chatbot (`/api/chatbot`)
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/chat` | Protected | Chat with AI |
| POST | `/roadmap` | Protected | Generate learning roadmap |
| POST | `/explain-error` | Protected | Debug code with AI |
| POST | `/generate-notes` | Protected | AI-generated notes |

### Admin (`/api/admin`)
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/dashboard` | Admin | Dashboard stats |
| GET | `/users` | Admin | All users |
| PUT | `/users/:id` | Admin | Update user role/status |
| DELETE | `/users/:id` | Admin | Delete user |
| PUT | `/courses/:id/publish` | Admin | Toggle publish |
| PUT | `/certificates/:id/approve` | Admin | Approve certificate |

### Instructor (`/api/instructor`)
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/dashboard` | Instructor | Instructor stats |
| GET | `/courses` | Instructor | My courses |
| GET | `/courses/:id/students` | Instructor | Course students |
| POST | `/live-class` | Instructor | Schedule live class |
| GET | `/live-classes` | Instructor | My live classes |

---

## 🔒 Role-Based Access
- **student** — Enroll, watch lessons, take quizzes, chat with AI
- **instructor** — All student permissions + create/manage courses, live classes
- **admin** — Full access to all routes

---

## 🤖 AI Chatbot Features (Gemini)
- **Course doubt solving** — Ask any programming question
- **Roadmap generation** — Get a structured learning path
- **Error explanation** — Debug and fix code
- **Smart notes** — Auto-generate study notes for any topic

---

## 🔌 Socket.IO Events
| Event | Direction | Description |
|-------|-----------|-------------|
| `join-room` | Client → Server | Join live class room |
| `leave-room` | Client → Server | Leave live class room |
| `user-joined` | Server → Clients | Notify others |
| `send-message` | Client → Server | Send chat message |
| `receive-message` | Server → Clients | Receive chat message |
| `offer/answer/ice-candidate` | Bidirectional | WebRTC signaling |
| `subscribe-notifications` | Client → Server | Subscribe to notifications |
| `notification` | Server → Client | Receive notification |

---

## 📜 Certificate System
- Certificate auto-issued when:
  - Student completes 100% of lessons
  - Average quiz score ≥ 75%
- Unique certificate ID format: `LMS-{timestamp}-{random}`
- Public verification endpoint: `GET /api/certificates/verify/:certificateId`
