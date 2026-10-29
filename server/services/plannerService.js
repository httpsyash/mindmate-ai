/**
 * Study planner logic — local fallback scheduler.
 * Generates a balanced daily schedule from subjects, available time, deadline, and prep level.
 */

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/**
 * Difficulty weight by preparation level.
 * Lower prep = more weight (needs more time).
 */
function prepWeight(level) {
  switch ((level || 'medium').toLowerCase()) {
    case 'beginner':
      return 1.5;
    case 'medium':
      return 1.0;
    case 'advanced':
      return 0.7;
    default:
      return 1.0;
  }
}

/**
 * Distribute study hours across subjects based on prep weight.
 * @param {Array} subjects - [{name, deadline?}]
 * @param {number} totalHours - hours available per day
 * @param {string} prepLevel
 */
function allocateSubjectHours(subjects, totalHours, prepLevel) {
  if (!subjects || subjects.length === 0) return [];

  const weights = subjects.map(() => prepWeight(prepLevel));
  const totalWeight = weights.reduce((a, b) => a + b, 0);

  return subjects.map((subj, i) => {
    const hours = Math.max(0.25, (totalHours * weights[i]) / totalWeight);
    return {
      name: (typeof subj === 'string' ? subj : subj?.name) || `Subject ${i + 1}`,
      hours: Number(hours.toFixed(2)),
      minutes: Math.round(hours * 60),
    };
  });
}

/**
 * Generate a daily schedule block list for a single day.
 * @param {Array} allocations - [{name, minutes}]
 * @param {string} startTime - "09:00"
 */
function buildDayBlocks(allocations, startTime = '09:00') {
  const blocks = [];
  let [hour, minute] = startTime.split(':').map(Number);

  const addMinutes = (h, m, add) => {
    let total = h * 60 + m + add;
    return [Math.floor((total / 60) % 24), total % 60];
  };

  const fmt = (h, m) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

  let currentH = hour;
  let currentM = minute;

  for (const alloc of allocations) {
    const studyMinutes = alloc.minutes;
    const breakMinutes = Math.max(5, Math.round(studyMinutes / 5)); // ~20% break
    const start = fmt(currentH, currentM);

    blocks.push({
      time: start,
      subject: alloc.name,
      durationMinutes: studyMinutes,
      type: 'study',
    });

    [currentH, currentM] = addMinutes(currentH, currentM, studyMinutes);

    blocks.push({
      time: fmt(currentH, currentM),
      subject: 'Break / Stretch',
      durationMinutes: breakMinutes,
      type: 'break',
    });

    [currentH, currentM] = addMinutes(currentH, currentM, breakMinutes);
  }

  return blocks;
}

/**
 * Generate a multi-day study plan.
 * @param {Object} params
 */
function generateLocalPlan(params) {
  const {
    subjects = [],
    availableHoursPerDay = 2,
    deadline,
    preparationLevel = 'medium',
    userName = 'there',
  } = params;

  const totalMinutes = Math.round(availableHoursPerDay * 60);
  const allocations = allocateSubjectHours(subjects, totalMinutes / 60, preparationLevel);

  // Build schedule for next 7 days
  const schedule = [];
  const today = new Date();
  const endDate = deadline ? new Date(deadline) : new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000);

  let daysCount = 0;
  let cursor = new Date(today);

  while (cursor <= endDate && daysCount < 7) {
    const dayName = DAYS_OF_WEEK[cursor.getDay()];
    const dateStr = cursor.toISOString().split('T')[0];
    const blocks = buildDayBlocks(allocations, '09:00');

    schedule.push({
      day: dayName,
      date: dateStr,
      blocks,
      totalStudyMinutes: totalMinutes,
    });

    cursor.setDate(cursor.getDate() + 1);
    daysCount += 1;
  }

  return {
    plan: schedule,
    note: `Hi ${userName}! This is a starter schedule. Add your Gemini API key for an AI-generated plan tailored to your deadlines and prep level.`,
  };
}

module.exports = {
  generateLocalPlan,
  allocateSubjectHours,
  buildDayBlocks,
  prepWeight,
};
