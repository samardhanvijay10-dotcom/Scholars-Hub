import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, BookOpen, FilePlus, MessageSquare, Send, CheckCircle2, 
  BarChart3, PlusCircle, FileText, CheckSquare, Sparkles, Inbox, RefreshCw
} from 'lucide-react';

export default function TeacherDashboard() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('classroom'); // 'classroom', 'inbox'

  // Analytics State
  const [analytics, setAnalytics] = useState(null);
  const [quizResults, setQuizResults] = useState([]);
  const [messages, setMessages] = useState([]);

  // Create Quiz Form Drawer
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizSubject, setQuizSubject] = useState('Biology');
  const [quizDescription, setQuizDescription] = useState('');
  const [quizQuestions, setQuizQuestions] = useState([
    { question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' }
  ]);

  // Upload Study Note Drawer
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteSubject, setNoteSubject] = useState('Biology');
  const [noteContent, setNoteContent] = useState('');

  // Assign Homework Drawer
  const [showHwForm, setShowHwForm] = useState(false);
  const [hwTitle, setHwTitle] = useState('');
  const [hwSubject, setHwSubject] = useState('Biology');
  const [hwDueDate, setHwDueDate] = useState('');
  const [hwDesc, setHwDesc] = useState('');

  // Inbox Reply State
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const fetchDashboardData = async () => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [resA, resR, resM] = await Promise.all([
        fetch('/api/teacher/analytics', { headers }),
        fetch('/api/quiz-results', { headers }),
        fetch('/api/messages', { headers })
      ]);

      if (resA.ok) setAnalytics(await resA.json());
      if (resR.ok) setQuizResults(await resR.json());
      if (resM.ok) {
        const msgs = await resM.json();
        setMessages(msgs);
        if (msgs.length > 0) setSelectedMessage(msgs[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddQuestion = () => {
    setQuizQuestions([
      ...quizQuestions,
      { question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' }
    ]);
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...quizQuestions];
    updated[index][field] = value;
    setQuizQuestions(updated);
  };

  const handleOptionChange = (qIdx, optIdx, value) => {
    const updated = [...quizQuestions];
    updated[qIdx].options[optIdx] = value;
    setQuizQuestions(updated);
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/quizzes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: quizTitle,
          subject: quizSubject,
          description: quizDescription,
          questions: quizQuestions
        })
      });

      if (res.ok) {
        setShowQuizForm(false);
        setQuizTitle('');
        setQuizDescription('');
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadNote = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/study-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: noteTitle,
          subject: noteSubject,
          content: noteContent
        })
      });

      if (res.ok) {
        setShowNoteForm(false);
        setNoteTitle('');
        setNoteContent('');
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignHomework = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/homework', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: hwTitle,
          subject: hwSubject,
          due_date: hwDueDate,
          description: hwDesc
        })
      });

      if (res.ok) {
        setShowHwForm(false);
        setHwTitle('');
        setHwDesc('');
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!selectedMessage || !replyContent) return;

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          recipient_id: selectedMessage.sender_id,
          subject: `Re: ${selectedMessage.subject}`,
          content: replyContent
        })
      });

      if (res.ok) {
        setReplyContent('');
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Dashboard Top Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-2xl relative overflow-hidden border border-indigo-500/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-3 border border-indigo-500/30">
              Teacher Dashboard
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Classroom Management Portal</h1>
            <p className="text-slate-400 text-sm mt-1">
              Logged in as <strong className="text-white">{user?.name}</strong>. Assign quizzes, upload guides, and reply to student/parent messages.
            </p>
          </div>

          <div className="flex bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700">
            <button
              onClick={() => setActiveTab('classroom')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'classroom'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Classroom Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('inbox')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'inbox'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Inbox className="w-4 h-4" />
              <span>Communication Inbox</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: CLASSROOM MANAGEMENT */}
      {activeTab === 'classroom' && (
        <div className="space-y-8 animate-fade-in">
          {/* Key Analytics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Class Average Score</span>
              <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-2">
                {analytics?.averageScore || 0}%
              </p>
            </div>
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Students</span>
              <p className="text-3xl font-extrabold text-purple-600 dark:text-purple-400 mt-2">
                {analytics?.totalStudents || 0}
              </p>
            </div>
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quiz Submissions</span>
              <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
                {analytics?.totalSubmissions || 0}
              </p>
            </div>
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Inbox Messages</span>
              <p className="text-3xl font-extrabold text-pink-600 dark:text-pink-400 mt-2">
                {analytics?.inboxCount || 0}
              </p>
            </div>
          </div>

          {/* Quick Action Drawers Bar */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Quick Educator Actions
            </h3>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setShowQuizForm(true)}
                className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Assign Remediation Quiz</span>
              </button>
              <button
                onClick={() => setShowNoteForm(true)}
                className="px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span>Upload Learning Guide</span>
              </button>
              <button
                onClick={() => setShowHwForm(true)}
                className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
              >
                <CheckSquare className="w-4 h-4" />
                <span>Set Homework Assignment</span>
              </button>
            </div>
          </div>

          {/* Student Quiz Performance Table */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Student Gradebook & Quiz Log</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Real-time scores from remediation quizzes
                </p>
              </div>
              <button
                onClick={fetchDashboardData}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl bg-slate-100 dark:bg-slate-800"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold">
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Quiz Title</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Submitted At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {quizResults.length > 0 ? (
                    quizResults.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{r.student_name}</td>
                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{r.quiz_title}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold uppercase text-[10px]">
                            {r.subject}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                          {r.score} / {r.total} ({Math.round((r.score / r.total) * 100)}%)
                        </td>
                        <td className="py-3 px-4 text-slate-400">{r.submitted_at}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No quiz submissions recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COMMUNICATION INBOX */}
      {activeTab === 'inbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          {/* Messages List */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Inbox className="w-5 h-5 text-indigo-500" />
              Parent & Student Inbox
            </h2>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {messages.length > 0 ? (
                messages.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMessage(m)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      selectedMessage?.id === m.id
                        ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-indigo-500/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{m.sender_name}</span>
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {m.sender_role}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 line-clamp-1">{m.subject}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-1">{m.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 text-center py-8">Inbox is empty.</p>
              )}
            </div>
          </div>

          {/* Selected Message Detail & Reply Box */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-6">
            {selectedMessage ? (
              <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">
                        From: {selectedMessage.sender_name} ({selectedMessage.sender_role})
                      </span>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                        {selectedMessage.subject}
                      </h3>
                    </div>
                    <span className="text-[10px] text-slate-400">{selectedMessage.created_at}</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                    {selectedMessage.content}
                  </p>
                </div>

                {/* Reply Form */}
                <form onSubmit={handleSendReply} className="space-y-3">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Send Reply to {selectedMessage.sender_name}
                  </label>
                  <textarea
                    rows={4}
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write your response..."
                    required
                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                  ></textarea>
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Reply</span>
                  </button>
                </form>
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-12">Select a message from the inbox to read.</p>
            )}
          </div>
        </div>
      )}

      {/* MODAL: CREATE QUIZ */}
      {showQuizForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create Remediation Quiz</h3>
              <button onClick={() => setShowQuizForm(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateQuiz} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Quiz Title</label>
                  <input
                    type="text"
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    required
                    placeholder="e.g. Photosynthesis Remediation"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                  <input
                    type="text"
                    value={quizSubject}
                    onChange={(e) => setQuizSubject(e.target.value)}
                    required
                    placeholder="e.g. Biology"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <input
                  type="text"
                  value={quizDescription}
                  onChange={(e) => setQuizDescription(e.target.value)}
                  placeholder="Targeted review for struggling students..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none"
                />
              </div>

              {/* Questions Array */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase text-indigo-500">Questions</h4>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="text-xs font-bold text-indigo-600 hover:underline"
                  >
                    + Add Question
                  </button>
                </div>

                {quizQuestions.map((q, qIdx) => (
                  <div key={qIdx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                    <input
                      type="text"
                      value={q.question}
                      onChange={(e) => handleQuestionChange(qIdx, 'question', e.target.value)}
                      placeholder={`Question #${qIdx + 1}`}
                      required
                      className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold outline-none"
                    />

                    <div className="grid grid-cols-2 gap-2">
                      {q.options.map((opt, oIdx) => (
                        <input
                          key={oIdx}
                          type="text"
                          value={opt}
                          onChange={(e) => handleOptionChange(qIdx, oIdx, e.target.value)}
                          placeholder={`Option ${oIdx + 1}`}
                          required
                          className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none"
                        />
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-400 font-bold mb-1">Correct Option Index (0-3)</label>
                        <input
                          type="number"
                          min="0"
                          max="3"
                          value={q.correctIndex}
                          onChange={(e) => handleQuestionChange(qIdx, 'correctIndex', parseInt(e.target.value))}
                          className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 font-bold mb-1">Explanation</label>
                        <input
                          type="text"
                          value={q.explanation}
                          onChange={(e) => handleQuestionChange(qIdx, 'explanation', e.target.value)}
                          placeholder="Why is this correct?"
                          className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowQuizForm(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs"
                >
                  Save Quiz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: UPLOAD STUDY NOTE */}
      {showNoteForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Upload Study Guide Note</h3>
              <button onClick={() => setShowNoteForm(false)} className="text-slate-400">✕</button>
            </div>

            <form onSubmit={handleUploadNote} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  required
                  placeholder="e.g. Unit 4 Review Sheet"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                <input
                  type="text"
                  value={noteSubject}
                  onChange={(e) => setNoteSubject(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Content (Markdown supported)</label>
                <textarea
                  rows={5}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  required
                  placeholder="Key concepts, formulas, summary points..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNoteForm(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs"
                >
                  Publish Guide
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN HOMEWORK */}
      {showHwForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Assign Homework</h3>
              <button onClick={() => setShowHwForm(false)} className="text-slate-400">✕</button>
            </div>

            <form onSubmit={handleAssignHomework} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Homework Title</label>
                <input
                  type="text"
                  value={hwTitle}
                  onChange={(e) => setHwTitle(e.target.value)}
                  required
                  placeholder="e.g. Chapter 5 Problem Set"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                  <input
                    type="text"
                    value={hwSubject}
                    onChange={(e) => setHwSubject(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={hwDueDate}
                    onChange={(e) => setHwDueDate(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={hwDesc}
                  onChange={(e) => setHwDesc(e.target.value)}
                  required
                  placeholder="Instructions for students..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowHwForm(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                >
                  Set Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
