const assert = require('assert');
process.env.NODE_ENV = 'test';
const app = require('../server/index');
const db = require('../server/db');

async function runTests() {
  console.log("--- Starting Backend Tests ---");

  // Test Teacher Registration with Invalid Code
  const res1 = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Fake Teacher', password: 'pass', role: 'teacher', teacherCode: 'WRONG' })
  });
  assert.strictEqual(res1.status, 403, "Invalid teacher access code should be rejected");
  console.log("✔ Teacher registration invalid code rejected correctly");

  // Test Teacher Login
  const res2 = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Ms. Vance', password: 'password123', role: 'teacher' })
  });
  assert.strictEqual(res2.status, 200, "Teacher login should succeed");
  const data2 = await res2.json();
  assert.ok(data2.token, "Token should be returned");
  console.log("✔ Teacher login successful");

  // Test Student Login
  const res3 = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Alex Johnson', password: 'password123', role: 'student' })
  });
  assert.strictEqual(res3.status, 200, "Student login should succeed");
  const data3 = await res3.json();
  const studentToken = data3.token;
  console.log("✔ Student login successful");

  // Test Quiz Submission
  const quizzesRes = await fetch('http://localhost:5000/api/quizzes', {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  const quizzes = await quizzesRes.json();
  const quizId = quizzes[0].id;

  const submitRes = await fetch(`http://localhost:5000/api/quizzes/${quizId}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentToken}`
    },
    body: JSON.stringify({ answers: [1, 2] })
  });
  assert.strictEqual(submitRes.status, 200);
  const submitData = await submitRes.json();
  assert.strictEqual(submitData.score, 2);
  console.log("✔ Quiz submission and instant grading passed");

  // Test Messaging Restriction
  const msgRes = await fetch('http://localhost:5000/api/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentToken}`
    },
    body: JSON.stringify({
      recipient_id: data2.user.id,
      subject: 'Question on homework',
      content: 'Can you help with question 3?',
      sender_as: 'parent'
    })
  });
  assert.strictEqual(msgRes.status, 201);
  console.log("✔ Parent message to teacher allowed");

  console.log("--- ALL BACKEND TESTS PASSED ---");
}

const server = app.listen(5000, async () => {
  try {
    await runTests();
    server.close();
    process.exit(0);
  } catch (err) {
    console.error("Test failed:", err);
    server.close();
    process.exit(1);
  }
});
