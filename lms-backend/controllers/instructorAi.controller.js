import Anthropic from '@anthropic-ai/sdk';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';

const MODEL = 'claude-3-5-haiku-20241022';

function buildCourseDigest(course) {
  const lessons = (course.lessons || []).slice(0, 40).map((l, i) => `${i + 1}. ${l.title}`).join('\n');
  const quizN = (course.quizzes || []).length;
  return `Title: ${course.title}\nCategory: ${course.category}\nLevel: ${course.level}\nLessons:\n${lessons}\nQuizzes: ${quizN} questions`;
}

// @route POST /api/instructor/ai
export const instructorAi = async (req, res) => {
  try {
    const { action, courseId, extra } = req.body;
    if (!process.env.ANTHROPIC_API_KEY?.trim()) {
      return res.status(503).json({
        success: false,
        message: 'ANTHROPIC_API_KEY is not configured on this server.',
      });
    }

    let course;
    if (courseId) {
      course = await Course.findOne({ _id: courseId, instructor: req.user.id }).select(
        'title category level description lessons quizzes',
      );
      if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found or not yours' });
      }
    }

    if (['generate_quiz', 'struggle_topics'].includes(action) && !course) {
      return res.status(400).json({
        success: false,
        message: 'courseId is required for this action',
      });
    }

    const digest = course ? buildCourseDigest(course) : 'General LMS instructor context (no specific course).';
    const courseIds = course
      ? [course._id]
      : (await Course.find({ instructor: req.user.id }).select('_id').lean()).map((c) => c._id);

    const enrollments = await Enrollment.find({ course: { $in: courseIds } })
      .populate('user', 'name email')
      .populate('course', 'title')
      .lean();

    let userPrompt = '';
    switch (action) {
      case 'generate_quiz': {
        const chapter = String(extra?.chapter || 'the next chapter').trim();
        userPrompt = `You are an expert assessment author. ${digest}\n\nGenerate a short quiz (5 multiple-choice questions) for: ${chapter}. Output valid JSON only: { "questions": [ { "question", "options": ["A","B","C","D"], "answer", "explanation" } ] }`;
        break;
      }
      case 'at_risk': {
        const lines = enrollments
          .map((e) => {
            const idle = e.lastAccessedAt
              ? Math.floor((Date.now() - new Date(e.lastAccessedAt)) / 86400000)
              : 'n/a';
            const avg =
              e.quizScores?.length > 0
                ? Math.round(
                    e.quizScores.reduce((a, q) => a + (Number(q.score) || 0), 0) / e.quizScores.length,
                  )
                : 'n/a';
            const cname = e.course?.title || 'Course';
            return `- [${cname}] ${e.user?.name || e.user?.email}: progress ${e.progress}%, idleDays ${idle}, avgQuiz ${avg}`;
          })
          .join('\n');
        userPrompt = `You are a learning analytics coach.\n${digest}\n\nLearner snapshot across courses:\n${lines || '(no enrollments yet)'}\n\nList the top at-risk learners with a one-line rationale each, then 3 concrete interventions. Markdown.`;
        break;
      }
      case 'struggle_topics': {
        const lessonStats = (course?.lessons || []).map((lesson) => {
          const lid = lesson._id;
          const n = Math.max(enrollments.length, 1);
          const done = enrollments.filter((e) =>
            (e.completedLessons || []).some((id) => String(id) === String(lid)),
          ).length;
          return `${lesson.title}: ${Math.round((done / n) * 100)}% completion`;
        });
        userPrompt = `Course digest:\n${digest}\n\nLesson completion rates:\n${lessonStats.join('\n')}\n\nIdentify which topics students struggle with most and why. Suggest content fixes (not generic advice). Markdown with bullets.`;
        break;
      }
      case 'draft_announcement': {
        const topic = String(extra?.topic || 'important course update').trim();
        userPrompt = `Draft a concise instructor announcement (max 120 words) for students in this course.\n${digest}\n\nTopic / intent: ${topic}. Warm, professional tone. Plain text only.`;
        break;
      }
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action. Use generate_quiz | at_risk | struggle_topics | draft_announcement',
        });
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const text = msg.content?.map((b) => (b.type === 'text' ? b.text : '')).join('\n') || '';

    res.json({ success: true, reply: text, model: MODEL });
  } catch (error) {
    console.error('Instructor AI error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'AI request failed' });
  }
};
