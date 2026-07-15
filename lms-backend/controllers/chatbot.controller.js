import { GoogleGenerativeAI } from '@google/generative-ai';
import mongoose from 'mongoose';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are an intelligent AI tutor assistant for a coding learning platform (similar to W3Schools and GeeksforGeeks). 

Your capabilities include:
- Explaining programming concepts clearly with examples
- Helping debug code and explaining errors
- Suggesting learning roadmaps for different technologies
- Recommending courses based on student interests
- Generating quiz questions to test understanding
- Creating smart notes and summaries
- Answering doubts about web development, DSA, and programming

Always respond in a friendly, encouraging tone. Use code examples when relevant. Format code blocks with proper markdown syntax. Keep responses concise but comprehensive.

Technologies you specialize in: HTML, CSS, JavaScript, React, Node.js, MongoDB, Python, Java, C, C++, TypeScript, Next.js, DSA, Git, DevOps.`;

function buildCourseContext(course) {
  const lessons = (course.lessons || []).slice(0, 24).map((l) => {
    const snippet = [l.content, l.codeExample].filter(Boolean).join('\n').slice(0, 450);
    return `- ${l.title} (${l.duration || '?'} min): ${snippet}`;
  });
  const quizzes = (course.quizzes || []).slice(0, 20).map((q) => `- ${q.question}`);
  return [
    `Title: ${course.title}`,
    `Category: ${course.category}`,
    `Description: ${(course.description || '').slice(0, 1200)}`,
    'Lessons (excerpts):',
    ...lessons,
    'Quiz / assessment questions:',
    ...quizzes,
  ].join('\n');
}

const SUPPORT_FAQS = [
  {
    match: /(certificate|certification|verify)/i,
    answer:
      'Certificates unlock once a learner crosses the required progress threshold and then completes checkout if paid verification is enabled. You can verify issued certificates from the certificates portal.',
  },
  {
    match: /(enroll|join course|start course)/i,
    answer:
      'Go to Courses, open any published course, and click enroll. Your progress is tracked automatically as you complete lessons and quizzes.',
  },
  {
    match: /(reset password|forgot password|login issue)/i,
    answer:
      'Use the Forgot Password flow on the login page. If your token expires, request a new one and try again.',
  },
  {
    match: /(instructor|create course|publish)/i,
    answer:
      'Instructor accounts can create and publish courses from the instructor dashboard, then track enrollments and learner performance.',
  },
];

// @route POST /api/chatbot/chat
export const chat = async (req, res) => {
  try {
    const { message, history = [], courseId } = req.body;

    if (!message?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: 'Message is required' });
    }

    if (!process.env.GEMINI_API_KEY?.trim()) {
      return res.status(503).json({
        success: false,
        message: 'AI assistant is not configured (missing GEMINI_API_KEY).',
      });
    }

    let systemText = SYSTEM_PROMPT;
    if (courseId && mongoose.isValidObjectId(String(courseId))) {
      const en = await Enrollment.findOne({ user: req.user.id, course: courseId });
      if (en) {
        const c = await Course.findById(courseId).select('title description category lessons quizzes');
        if (c) {
          systemText = `${SYSTEM_PROMPT}

--- Enrolled course material (prioritize this for course-specific answers; do not contradict it) ---
${buildCourseContext(c)}`;
        }
      }
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Build conversation history for context
    const chatHistory = history.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const chatSession = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: systemText }],
        },
        {
          role: 'model',
          parts: [
            {
              text: "I'm your AI tutor! I'm here to help you learn coding, debug issues, and guide your learning journey. What would you like to learn today?",
            },
          ],
        },
        ...chatHistory,
      ],
    });

    const result = await chatSession.sendMessage(message);
    const reply = result.response.text();

    res.json({ success: true, reply });
  } catch (error) {
    console.error('Gemini API error:', error.message);
    res
      .status(500)
      .json({ success: false, message: 'AI service error. Please try again.' });
  }
};

// @route POST /api/chatbot/roadmap
export const generateRoadmap = async (req, res) => {
  try {
    const { technology, level } = req.body;

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `Create a detailed learning roadmap for ${technology} at ${level || 'beginner'} level. 
    Format as a structured JSON with steps, estimated time, and resources. Include:
    - Prerequisites
    - Core topics (in order)
    - Projects to build
    - Estimated total time
    Return only valid JSON.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Try to parse as JSON for structured response
    let roadmap;
    try {
      roadmap = JSON.parse(text.replace(/```json|```/g, '').trim());
    } catch {
      roadmap = { content: text };
    }

    res.json({ success: true, roadmap });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/chatbot/explain-error
export const explainError = async (req, res) => {
  try {
    const { code, error: errorMsg, language } = req.body;

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `Explain this ${language || 'JavaScript'} error in simple terms and provide a fix:
    
Error: ${errorMsg}

Code:
\`\`\`${language || 'javascript'}
${code}
\`\`\`

Provide: 1) What went wrong, 2) Why it happened, 3) How to fix it with corrected code.`;

    const result = await model.generateContent(prompt);
    const explanation = result.response.text();

    res.json({ success: true, explanation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/chatbot/generate-notes
export const generateNotes = async (req, res) => {
  try {
    const { topic, content } = req.body;

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `Generate concise, well-structured study notes for the topic: "${topic}".
${content ? `Based on this content: ${content}` : ''}

Format:
- Key concepts with brief explanations
- Important syntax / code examples
- Common mistakes to avoid
- Quick revision points
Use markdown formatting.`;

    const result = await model.generateContent(prompt);
    const notes = result.response.text();

    res.json({ success: true, notes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/chatbot/support
export const supportChat = async (req, res) => {
  const raw = String(req.body?.message || '').trim();
  if (!raw) {
    return res.status(400).json({ success: false, message: 'Message is required' });
  }

  const match = SUPPORT_FAQS.find((item) => item.match.test(raw));
  const reply =
    match?.answer ||
    'I can help with courses, certificates, enrollments, dashboards, and account issues. Try asking: "How do I unlock certificates?" or "How do instructors publish courses?"';

  return res.json({ success: true, reply });
};
