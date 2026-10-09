const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'scholarhub_jwt_secret_key_2025';
const TEACHER_ACCESS_CODE = 'TEACHER2026';

app.use(cors());
app.use(express.json());

// Auth Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// AUTH ENDPOINTS
app.post('/api/auth/register', (req, res) => {
  const { name, password, role, teacherCode } = req.body;

  if (!name || !password || !role) {
    return res.status(400).json({ error: 'Name, password, and role are required' });
  }

  if (role !== 'teacher' && role !== 'student') {
    return res.status(400).json({ error: 'Invalid role specified' });
  }

  if (role === 'teacher') {
    if (!teacherCode || teacherCode.trim() !== TEACHER_ACCESS_CODE) {
      return res.status(403).json({ error: 'Invalid Teacher Access Code. Access denied.' });
    }
  }

  try {
    const existing = db.prepare(`SELECT * FROM users WHERE name = ? AND role = ?`).get(name, role);
    if (existing) {
      return res.status(400).json({ error: `A ${role} with the name "${name}" already exists.` });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const result = db.prepare(`INSERT INTO users (name, password, role) VALUES (?, ?, ?)`).run(name, hashedPassword, role);

    const newUser = { id: result.lastInsertRowid, name, role };
    const token = jwt.sign(newUser, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ user: newUser, token });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed: ' + err.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { name, password, role, teacherCode } = req.body;

  if (!name || !password || !role) {
    return res.status(400).json({ error: 'Name, password, and role are required' });
  }

  if (role === 'teacher' && teacherCode && teacherCode.trim() !== TEACHER_ACCESS_CODE) {
    return res.status(403).json({ error: 'Invalid Teacher Access Code' });
  }

  try {
    const user = db.prepare(`SELECT * FROM users WHERE name = ? AND role = ?`).get(name, role);
    if (!user) {
      return res.status(400).json({ error: 'Invalid name or password' });
    }

    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid name or password' });
    }

    const payload = { id: user.id, name: user.name, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.json({ user: payload, token });
  } catch (err) {
    res.status(500).json({ error: 'Login failed: ' + err.message });
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// QUIZZES ENDPOINTS
app.get('/api/quizzes', authenticateToken, (req, res) => {
  try {
    const quizzes = db.prepare(`SELECT * FROM quizzes ORDER BY created_at DESC`).all();
    const formatted = quizzes.map(q => ({
      ...q,
      questions: JSON.parse(q.questions)
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/quizzes', authenticateToken, (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Only teachers can create quizzes' });
  }
  const { title, subject, description, questions } = req.body;
  if (!title || !subject || !questions || !Array.isArray(questions)) {
    return res.status(400).json({ error: 'Title, subject, and questions array are required' });
  }

  try {
    const result = db.prepare(`INSERT INTO quizzes (title, subject, description, questions, created_by) VALUES (?, ?, ?, ?, ?)`)
      .run(title, subject, description || '', JSON.stringify(questions), req.user.id);
    
    res.status(201).json({ id: result.lastInsertRowid, title, subject, description, questions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/quizzes/:id/submit', authenticateToken, (req, res) => {
  const quizId = req.params.id;
  const { answers } = req.body; // array of selected option indices

  try {
    const quiz = db.prepare(`SELECT * FROM quizzes WHERE id = ?`).get(quizId);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const questions = JSON.parse(quiz.questions);
    let score = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] !== undefined && answers[idx] === q.correctIndex) {
        score++;
      }
    });

    const result = db.prepare(`INSERT INTO quiz_results (quiz_id, student_id, score, total, answers) VALUES (?, ?, ?, ?, ?)`)
      .run(quizId, req.user.id, score, questions.length, JSON.stringify(answers));

    res.json({
      resultId: result.lastInsertRowid,
      score,
      total: questions.length,
      percentage: Math.round((score / questions.length) * 100)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/quiz-results', authenticateToken, (req, res) => {
  try {
    if (req.user.role === 'student') {
      const results = db.prepare(`
        SELECT qr.*, q.title as quiz_title, q.subject
        FROM quiz_results qr
        JOIN quizzes q ON qr.quiz_id = q.id
        WHERE qr.student_id = ?
        ORDER BY qr.submitted_at DESC
      `).all(req.user.id);
      res.json(results);
    } else {
      const results = db.prepare(`
        SELECT qr.*, q.title as quiz_title, q.subject, u.name as student_name
        FROM quiz_results qr
        JOIN quizzes q ON qr.quiz_id = q.id
        JOIN users u ON qr.student_id = u.id
        ORDER BY qr.submitted_at DESC
      `).all();
      res.json(results);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// FLASHCARDS & QNA
app.get('/api/flashcards', authenticateToken, (req, res) => {
  try {
    const cards = db.prepare(`SELECT * FROM flashcards ORDER BY id ASC`).all();
    res.json(cards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/flashcards', authenticateToken, (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Only teachers can create flashcards' });
  }
  const { subject, question, answer, difficulty } = req.body;
  try {
    const result = db.prepare(`INSERT INTO flashcards (subject, question, answer, difficulty) VALUES (?, ?, ?, ?)`)
      .run(subject, question, answer, difficulty || 'Medium');
    res.status(201).json({ id: result.lastInsertRowid, subject, question, answer, difficulty });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/qna', authenticateToken, (req, res) => {
  try {
    const qna = db.prepare(`SELECT * FROM qna_bank ORDER BY id ASC`).all();
    res.json(qna);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// STUDY NOTES
app.get('/api/study-notes', authenticateToken, (req, res) => {
  try {
    const notes = db.prepare(`
      SELECT sn.*, u.name as author_name
      FROM study_notes sn
      LEFT JOIN users u ON sn.author_id = u.id
      ORDER BY sn.created_at DESC
    `).all();
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/study-notes', authenticateToken, (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Only teachers can upload study notes' });
  }
  const { title, subject, content } = req.body;
  if (!title || !subject || !content) {
    return res.status(400).json({ error: 'Title, subject, and content are required' });
  }
  try {
    const result = db.prepare(`INSERT INTO study_notes (title, subject, content, author_id) VALUES (?, ?, ?, ?)`)
      .run(title, subject, content, req.user.id);
    res.status(201).json({ id: result.lastInsertRowid, title, subject, content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// HOMEWORK TRACKER
app.get('/api/homework', authenticateToken, (req, res) => {
  try {
    const homework = db.prepare(`
      SELECT h.*, COALESCE(hs.completed, 0) as completed
      FROM homework h
      LEFT JOIN homework_status hs ON h.id = hs.homework_id AND hs.student_id = ?
      ORDER BY h.due_date ASC
    `).all(req.user.id);
    res.json(homework);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/homework', authenticateToken, (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Only teachers can create homework assignments' });
  }
  const { title, subject, due_date, description } = req.body;
  try {
    const result = db.prepare(`INSERT INTO homework (title, subject, due_date, description, created_by) VALUES (?, ?, ?, ?, ?)`)
      .run(title, subject, due_date, description, req.user.id);
    res.status(201).json({ id: result.lastInsertRowid, title, subject, due_date, description });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/homework/:id/status', authenticateToken, (req, res) => {
  const homeworkId = req.params.id;
  const { completed } = req.body;
  try {
    db.prepare(`
      INSERT INTO homework_status (homework_id, student_id, completed)
      VALUES (?, ?, ?)
      ON CONFLICT(homework_id, student_id) DO UPDATE SET completed = excluded.completed, updated_at = CURRENT_TIMESTAMP
    `).run(homeworkId, req.user.id, completed ? 1 : 0);
    res.json({ success: true, completed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CALENDAR
app.get('/api/calendar-events', authenticateToken, (req, res) => {
  try {
    const events = db.prepare(`SELECT * FROM calendar_events ORDER BY date ASC`).all();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// MESSAGING SYSTEM
// Strict policy: Students/Parents can ONLY send messages to teachers. Direct student-to-parent messaging is disabled.
app.get('/api/messages', authenticateToken, (req, res) => {
  try {
    if (req.user.role === 'teacher') {
      const messages = db.prepare(`
        SELECT * FROM messages
        WHERE recipient_id = ? OR sender_id = ?
        ORDER BY created_at ASC
      `).all(req.user.id, req.user.id);
      res.json(messages);
    } else {
      const messages = db.prepare(`
        SELECT * FROM messages
        WHERE sender_id = ? OR recipient_id = ?
        ORDER BY created_at ASC
      `).all(req.user.id, req.user.id);
      res.json(messages);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/messages', authenticateToken, (req, res) => {
  const { recipient_id, subject, content, sender_as } = req.body; // sender_as can be 'student' or 'parent'

  if (!recipient_id || !subject || !content) {
    return res.status(400).json({ error: 'Recipient, subject, and message content are required' });
  }

  try {
    const recipient = db.prepare(`SELECT * FROM users WHERE id = ?`).get(recipient_id);
    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    // Direct student-to-parent messaging restriction
    if (req.user.role === 'student' && recipient.role !== 'teacher') {
      return res.status(403).json({ error: 'Messaging Policy Error: Students and parents may only send messages directly to Teachers.' });
    }

    const effectiveSenderRole = (req.user.role === 'student' && sender_as === 'parent') ? 'parent' : req.user.role;
    const effectiveSenderName = effectiveSenderRole === 'parent' ? `${req.user.name} (Parent)` : req.user.name;

    const result = db.prepare(`
      INSERT INTO messages (sender_id, sender_name, sender_role, recipient_id, recipient_name, subject, content)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(req.user.id, effectiveSenderName, effectiveSenderRole, recipient.id, recipient.name, subject, content);

    res.status(201).json({
      id: result.lastInsertRowid,
      sender_id: req.user.id,
      sender_name: effectiveSenderName,
      sender_role: effectiveSenderRole,
      recipient_id: recipient.id,
      recipient_name: recipient.name,
      subject,
      content
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET TEACHERS LIST (for messaging dropdown)
app.get('/api/teachers', authenticateToken, (req, res) => {
  try {
    const teachers = db.prepare(`SELECT id, name FROM users WHERE role = 'teacher'`).all();
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TEACHER ANALYTICS
app.get('/api/teacher/analytics', authenticateToken, (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Teacher authorization required' });
  }
  try {
    const totalStudents = db.prepare(`SELECT count(*) as count FROM users WHERE role = 'student'`).get().count;
    const totalQuizzes = db.prepare(`SELECT count(*) as count FROM quizzes`).get().count;
    const quizResults = db.prepare(`SELECT score, total FROM quiz_results`).all();
    let avgScore = 0;
    if (quizResults.length > 0) {
      const sum = quizResults.reduce((acc, r) => acc + (r.score / r.total) * 100, 0);
      avgScore = Math.round(sum / quizResults.length);
    }
    const messageCount = db.prepare(`SELECT count(*) as count FROM messages WHERE recipient_id = ?`).get(req.user.id).count;

    res.json({
      totalStudents,
      totalQuizzes,
      totalSubmissions: quizResults.length,
      averageScore: avgScore,
      inboxCount: messageCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fallback 404 JSON handler
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.url}` });
});

// Global Express Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`ScholarHub API server running on port ${PORT}`);
  });
}

module.exports = app;
