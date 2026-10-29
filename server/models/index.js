const { pool } = require('../config/db');
const crypto = require('crypto');

/** User model */
const User = {
  async create({ name, mobile, email, passwordHash, avatar, googleId, isVerified = true }) {
    const id = crypto.randomUUID();
    const result = await pool.query(
      `INSERT INTO users (id, name, mobile, email, password_hash, avatar, google_id, is_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, name, mobile, email, avatar, is_verified, created_at`,
      [
        id,
        name,
        mobile || null,
        email ? email.toLowerCase().trim() : null,
        passwordHash || '',
        avatar || null,
        googleId || null,
        isVerified ? 1 : 0,
      ]
    );
    return result.rows[0];
  },

  async findByMobile(mobile) {
    if (!mobile) return null;
    const result = await pool.query(
      `SELECT id, name, mobile, email, avatar, password_hash, is_verified, created_at
       FROM users WHERE mobile = $1`,
      [mobile]
    );
    return result.rows[0];
  },

  async findByEmail(email) {
    if (!email) return null;
    const result = await pool.query(
      `SELECT id, name, mobile, email, avatar, password_hash, is_verified, created_at
       FROM users WHERE LOWER(email) = LOWER($1)`,
      [email.trim()]
    );
    return result.rows[0];
  },

  async findById(id) {
    const result = await pool.query(
      `SELECT id, name, mobile, email, avatar, is_verified, created_at
       FROM users WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  },

  async findOrCreateGoogleUser({ name, email, googleId, avatar }) {
    let user = await this.findByEmail(email);
    if (!user) {
      user = await this.create({
        name: name || 'Google User',
        email,
        googleId,
        avatar,
        passwordHash: crypto.randomBytes(16).toString('hex'),
        isVerified: true,
      });
    } else {
      // Update avatar or name if provided
      if (avatar || googleId) {
        await pool.query(
          `UPDATE users SET avatar = COALESCE($1, avatar), google_id = COALESCE($2, google_id), is_verified = 1 WHERE id = $3`,
          [avatar || null, googleId || null, user.id]
        );
        user = await this.findById(user.id);
      }
    }
    return user;
  },
};

/** Conversation model */
const Conversation = {
  async add({ userId, role, message, emotion }) {
    const id = crypto.randomUUID();
    const result = await pool.query(
      `INSERT INTO conversations (id, user_id, role, message, emotion)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, user_id, role, message, emotion, created_at`,
      [id, userId, role, message, emotion || null]
    );
    return result.rows[0];
  },

  async listByUser(userId, limit = 50) {
    const result = await pool.query(
      `SELECT id, role, message, emotion, created_at
       FROM conversations
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  },

  async clearByUser(userId) {
    await pool.query(
      `DELETE FROM conversations WHERE user_id = $1`,
      [userId]
    );
    return true;
  },
};

/** Mood model */
const Mood = {
  async upsert({ userId, mood, note, recordedAt }) {
    const id = crypto.randomUUID();
    const result = await pool.query(
      `INSERT INTO moods (id, user_id, mood, note, recorded_at)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, recorded_at)
       DO UPDATE SET mood = excluded.mood, note = excluded.note, created_at = CURRENT_TIMESTAMP
       RETURNING id, user_id, mood, note, recorded_at, created_at`,
      [id, userId, mood, note || null, recordedAt]
    );
    return result.rows[0];
  },

  async listByUser(userId, limit = 30) {
    const result = await pool.query(
      `SELECT id, mood, note, recorded_at, created_at
       FROM moods
       WHERE user_id = $1
       ORDER BY recorded_at DESC
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  },
};

/** Study plan model */
const StudyPlan = {
  async create({ userId, title, subjects, availableHoursPerDay, deadline, preparationLevel, schedule }) {
    const id = crypto.randomUUID();
    const subjectsJson = typeof subjects === 'string' ? subjects : JSON.stringify(subjects);
    const scheduleJson = typeof schedule === 'string' ? schedule : JSON.stringify(schedule);

    const result = await pool.query(
      `INSERT INTO study_plans (id, user_id, title, subjects, available_hours_per_day, deadline, preparation_level, schedule)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, user_id, title, subjects, available_hours_per_day, deadline, preparation_level, schedule, created_at`,
      [
        id,
        userId,
        title || 'My Study Plan',
        subjectsJson,
        availableHoursPerDay,
        deadline || null,
        preparationLevel,
        scheduleJson,
      ]
    );

    const row = result.rows[0];
    if (row) {
      if (typeof row.subjects === 'string') {
        try { row.subjects = JSON.parse(row.subjects); } catch (e) {}
      }
      if (typeof row.schedule === 'string') {
        try { row.schedule = JSON.parse(row.schedule); } catch (e) {}
      }
    }
    return row;
  },

  async listByUser(userId, limit = 10) {
    const result = await pool.query(
      `SELECT id, title, subjects, available_hours_per_day, deadline, preparation_level, schedule, created_at, updated_at
       FROM study_plans
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    return result.rows.map((row) => {
      const copy = { ...row };
      if (typeof copy.subjects === 'string') {
        try { copy.subjects = JSON.parse(copy.subjects); } catch (e) {}
      }
      if (typeof copy.schedule === 'string') {
        try { copy.schedule = JSON.parse(copy.schedule); } catch (e) {}
      }
      return copy;
    });
  },
};

/** Recommendation model */
const Recommendation = {
  async add({ userId, type, title, content }) {
    const id = crypto.randomUUID();
    const result = await pool.query(
      `INSERT INTO recommendations (id, user_id, type, title, content)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, type, title, content, created_at`,
      [id, userId, type, title, content]
    );
    return result.rows[0];
  },

  async listByUser(userId, limit = 20) {
    const result = await pool.query(
      `SELECT id, type, title, content, created_at
       FROM recommendations
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  },
};

module.exports = { User, Conversation, Mood, StudyPlan, Recommendation };
