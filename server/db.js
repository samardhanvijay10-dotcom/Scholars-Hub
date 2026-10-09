const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'scholarhub.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      password TEXT NOT NULL,
      role TEXT CHECK(role IN ('teacher', 'student')) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(name, role)
    );

    CREATE TABLE IF NOT EXISTS quizzes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      subject TEXT NOT NULL,
      description TEXT,
      questions TEXT NOT NULL, -- JSON array of questions
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS quiz_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quiz_id INTEGER NOT NULL,
      student_id INTEGER NOT NULL,
      score INTEGER NOT NULL,
      total INTEGER NOT NULL,
      answers TEXT NOT NULL, -- JSON array
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (quiz_id) REFERENCES quizzes(id),
      FOREIGN KEY (student_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS flashcards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject TEXT NOT NULL,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      difficulty TEXT DEFAULT 'Medium',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS qna_bank (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject TEXT NOT NULL,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS study_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      subject TEXT NOT NULL,
      content TEXT NOT NULL,
      author_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS homework (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      subject TEXT NOT NULL,
      due_date TEXT NOT NULL,
      description TEXT NOT NULL,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS homework_status (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      homework_id INTEGER NOT NULL,
      student_id INTEGER NOT NULL,
      completed INTEGER DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(homework_id, student_id),
      FOREIGN KEY (homework_id) REFERENCES homework(id),
      FOREIGN KEY (student_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS calendar_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      type TEXT NOT NULL, -- 'exam', 'homework', 'lecture'
      subject TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER NOT NULL,
      sender_name TEXT NOT NULL,
      sender_role TEXT NOT NULL, -- 'student' or 'parent' or 'teacher'
      recipient_id INTEGER NOT NULL,
      recipient_name TEXT NOT NULL,
      subject TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users(id),
      FOREIGN KEY (recipient_id) REFERENCES users(id)
    );
  `);

  // Seed default users and data if empty
  const teacherCheck = db.prepare(`SELECT count(*) as count FROM users WHERE role = 'teacher'`).get();
  if (teacherCheck.count === 0) {
    const hashedTeacherPassword = bcrypt.hashSync('password123', 10);
    const hashedStudentPassword = bcrypt.hashSync('password123', 10);

    const teacherInsert = db.prepare(`INSERT INTO users (name, password, role) VALUES (?, ?, 'teacher')`).run('Ms. Vance', hashedTeacherPassword);
    const studentInsert = db.prepare(`INSERT INTO users (name, password, role) VALUES (?, ?, 'student')`).run('Alex Johnson', hashedStudentPassword);

    const teacherId = teacherInsert.lastInsertRowid;
    const studentId = studentInsert.lastInsertRowid;

    // Seed Quizzes
    const quizQuestions1 = JSON.stringify([
      {
        id: 1,
        question: "Which organelle is known as the powerhouse of the cell?",
        options: ["Nucleus", "Mitochondria", "Ribosome", "Endoplasmic Reticulum"],
        correctIndex: 1,
        explanation: "Mitochondria produce ATP through cellular respiration."
      },
      {
        id: 2,
        question: "What primary pigment absorbs light energy in photosynthesis?",
        options: ["Carotene", "Hemoglobin", "Chlorophyll", "Xanthophyll"],
        correctIndex: 2,
        explanation: "Chlorophyll absorbs light mostly in the blue and red wavelengths."
      }
    ]);

    const quizQuestions2 = JSON.stringify([
      {
        id: 1,
        question: "Solve for x: 3x + 12 = 27",
        options: ["x = 3", "x = 5", "x = 6", "x = 9"],
        correctIndex: 1,
        explanation: "Subtract 12 from 27 to get 15, then divide 15 by 3 to get x = 5."
      },
      {
        id: 2,
        question: "What is the slope of the line given by y = -2x + 8?",
        options: ["8", "-2", "2", "-8"],
        correctIndex: 1,
        explanation: "In slope-intercept form y = mx + b, m represents the slope (-2)."
      },
      {
        id: 3,
        question: "What is the square root of 144?",
        options: ["11", "12", "14", "16"],
        correctIndex: 1,
        explanation: "12 x 12 = 144."
      }
    ]);

    db.prepare(`INSERT INTO quizzes (title, subject, description, questions, created_by) VALUES (?, ?, ?, ?, ?)`)
      .run('Cell Biology & Photosynthesis', 'Biology', 'Core concepts quiz covering cell organelles and the photosynthesis cycle.', quizQuestions1, teacherId);
    
    db.prepare(`INSERT INTO quizzes (title, subject, description, questions, created_by) VALUES (?, ?, ?, ?, ?)`)
      .run('Algebra Foundations & Remediation', 'Mathematics', 'A review quiz designed for reinforcing linear equations and solving for variables.', quizQuestions2, teacherId);

    // Seed Flashcards
    const flashcardsData = [
      { subject: 'History', question: 'What year did World War II end?', answer: '1945', difficulty: 'Easy' },
      { subject: 'Biology', question: 'What is the function of Ribosomes?', answer: 'Protein synthesis in cells.', difficulty: 'Medium' },
      { subject: 'Chemistry', question: 'What is Avogadro\'s number?', answer: '6.022 x 10^23 particles per mole.', difficulty: 'Hard' },
      { subject: 'Mathematics', question: 'What is the Pythagorean Theorem?', answer: 'a² + b² = c² for right-angled triangles.', difficulty: 'Easy' }
    ];
    const insertCard = db.prepare(`INSERT INTO flashcards (subject, question, answer, difficulty) VALUES (?, ?, ?, ?)`);
    flashcardsData.forEach(f => insertCard.run(f.subject, f.question, f.answer, f.difficulty));

    // Seed Q&A Bank
    const qnaData = [
      { subject: 'Chemistry', question: 'What is the difference between an element and a compound?', answer: 'An element consists of only one type of atom, while a compound consists of two or more different elements chemically bonded together.' },
      { subject: 'Physics', question: 'What is Newton\'s Second Law of Motion?', answer: 'Force equals mass times acceleration (F = m * a).' },
      { subject: 'English Language', question: 'How do you identify a metaphor versus a simile?', answer: 'A simile directly compares two things using "like" or "as", whereas a metaphor states that one thing is another.' }
    ];
    const insertQna = db.prepare(`INSERT INTO qna_bank (subject, question, answer) VALUES (?, ?, ?)`);
    qnaData.forEach(q => insertQna.run(q.subject, q.question, q.answer));

    // Seed Study Notes
    db.prepare(`INSERT INTO study_notes (title, subject, content, author_id) VALUES (?, ?, ?, ?)`)
      .run('Unit 3 Study Guide: Photosynthesis & Cellular Respiration', 'Biology', `### Key Concepts Overview

1. **Light-Dependent Reactions**: Occur in the thylakoid membranes of chloroplasts. Sunlight excites electrons in chlorophyll, driving ATP and NADPH synthesis.
2. **Calvin Cycle (Light-Independent)**: Takes place in the stroma. Uses ATP and NADPH to fix carbon dioxide into G3P (precursor to glucose).
3. **Cellular Respiration Steps**:
   - Glycolysis (Cytoplasm): Converts glucose to pyruvate (+2 ATP).
   - Krebs Cycle (Mitochondria Matrix): Produces NADH and FADH2 (+2 ATP).
   - Electron Transport Chain (Inner Membrane): Generates ~32 ATP.`, teacherId);

    db.prepare(`INSERT INTO study_notes (title, subject, content, author_id) VALUES (?, ?, ?, ?)`)
      .run('Algebra Cheat Sheet: Linear Equations & Functions', 'Mathematics', `### Quick Reference

- **Slope Formula**: $m = (y_2 - y_1) / (x_2 - x_1)$
- **Slope-Intercept Form**: $y = mx + b$
- **Point-Slope Form**: $y - y_1 = m(x - x_1)$
- **Parallel Lines**: Have equal slopes ($m_1 = m_2$).
- **Perpendicular Lines**: Have negative reciprocal slopes ($m_1 * m_2 = -1$).`, teacherId);

    // Seed Homework
    db.prepare(`INSERT INTO homework (title, subject, due_date, description, created_by) VALUES (?, ?, ?, ?, ?)`)
      .run('Read Chapter 4 & Complete Worksheet', 'Biology', '2025-10-15', 'Read Pages 88-102 on cellular respiration and answer questions 1-15 on the worksheet.', teacherId);
    
    db.prepare(`INSERT INTO homework (title, subject, due_date, description, created_by) VALUES (?, ?, ?, ?, ?)`)
      .run('Linear Equation Problem Set #2', 'Mathematics', '2025-10-18', 'Solve odd problems from Page 140 (Problems 1 through 29).', teacherId);

    // Seed Calendar
    db.prepare(`INSERT INTO calendar_events (title, date, type, subject) VALUES (?, ?, ?, ?)`)
      .run('Biology Midterm Exam', '2025-10-22', 'exam', 'Biology');
    db.prepare(`INSERT INTO calendar_events (title, date, type, subject) VALUES (?, ?, ?, ?)`)
      .run('Math Quiz on Systems of Equations', '2025-10-25', 'homework', 'Mathematics');

    // Seed Message
    db.prepare(`INSERT INTO messages (sender_id, sender_name, sender_role, recipient_id, recipient_name, subject, content) VALUES (?, ?, ?, ?, ?, ?, ?)`)
      .run(studentId, 'Alex Johnson (Parent)', 'parent', teacherId, 'Ms. Vance', 'Inquiry regarding Biology Midterm Prep', 'Hello Ms. Vance, Alex is preparing for the upcoming biology exam. Are there extra practice worksheets available?');
  }
}

initDb();

module.exports = db;
