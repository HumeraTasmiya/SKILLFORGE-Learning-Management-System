import User from '../models/User.js';

/** Monday UTC date string YYYY-MM-DD for weekly study minute buckets */
export function getUtcWeekKey(d = new Date()) {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = x.getUTCDay() || 7;
  x.setUTCDate(x.getUTCDate() - day + 1);
  return x.toISOString().slice(0, 10);
}

export function lastSevenDayFlags(studyDates) {
  const set = new Set(Array.isArray(studyDates) ? studyDates : []);
  const out = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push(set.has(key));
  }
  return out;
}

/**
 * Call when a student completes a lesson or submits a quiz.
 * Rolls weekly minutes, logs calendar days for the streak UI, updates codingStreak.
 */
export async function recordStudentStudy(userId, minutesToAdd = 12) {
  if (!userId) return;
  const add = Math.min(180, Math.max(1, Number(minutesToAdd) || 12));
  const user = await User.findById(userId);
  if (!user) return;

  const weekKey = getUtcWeekKey();
  if (user.studyWeekKey !== weekKey) {
    user.studyWeekKey = weekKey;
    user.studyMinutesWeek = 0;
  }
  user.studyMinutesWeek = (user.studyMinutesWeek || 0) + add;

  const dayStr = new Date().toISOString().slice(0, 10);
  const dates = new Set(user.studyDates || []);
  dates.add(dayStr);
  user.studyDates = Array.from(dates).sort().slice(-120);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const last = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
  if (last) last.setHours(0, 0, 0, 0);
  const diffDays = last == null ? null : Math.floor((today.getTime() - last.getTime()) / 86400000);

  if (diffDays === null) {
    user.codingStreak = 1;
  } else if (diffDays === 0) {
    if (!user.codingStreak) user.codingStreak = 1;
  } else if (diffDays === 1) {
    user.codingStreak = (user.codingStreak || 0) + 1;
  } else {
    user.codingStreak = 1;
  }
  user.lastActiveDate = new Date();

  await user.save();
}
