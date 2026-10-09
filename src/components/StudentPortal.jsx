import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, Brain, HelpCircle, CheckSquare, Calendar, MessageSquare, 
  Send, RotateCw, CheckCircle2, XCircle, ChevronRight, Search, FileText, UserCheck, ShieldAlert
} from 'lucide-react';

export default function StudentPortal() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('academic'); // 'academic', 'guides', 'messages'

  // Data States
  const [quizzes, setQuizzes] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [qna, setQna] = useState([]);
  const [notes, setNotes] = useState([]);
  const [homework, setHomework] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [messages, setMessages] = useState([]);
  const [teachers, setTeachers] = useState([]);

  // Active Quiz Modal
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  // Active Flashcard Index & Flip State
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Q&A Filter Search
  const [qnaSearch, setQnaSearch] = useState('');

  // Messaging Form State
  const [msgTeacherId, setMsgTeacherId] = useState('');
  const [msgSubject, setMsgSubject] = useState('');
  const [msgContent, setMsgContent] = useState('');
  const [senderAs, setSenderAs] = useState('student'); // 'student' or 'parent'
  const [msgSentNotice, setMsgSentNotice] = useState('');

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [resQ, resF, resA, resN, resH, resC, resM, resT] = await Promise.all([
        fetch('/api/quizzes', { headers }),
        fetch('/api/flashcards', { headers }),
        fetch('/api/qna', { headers }),
        fetch('/api/study-notes', { headers }),
        fetch('/api/homework', { headers }),
        fetch('/api/calendar-events', { headers }),
        fetch('/api/messages', { headers }),
        fetch('/api/teachers', { headers })
      ]);

      if (resQ.ok) setQuizzes(await resQ.json());
      if (resF.ok) setFlashcards(await resF.json());
      if (resA.ok) setQna(await resA.json());
      if (resN.ok) setNotes(await resN.json());
      if (resH.ok) setHomework(await resH.json());
      if (resC.ok) setCalendarEvents(await resC.json());
      if (resM.ok) setMessages(await resM.json());
      if (resT.ok) {
        const tList = await resT.json();
        setTeachers(tList);
        if (tList.length > 0) setMsgTeacherId(tList[0].id);
      }
    } catch (err) {
      console.error("Failed to load portal data:", err);
    }
  };

  const handleToggleHomework = async (id, currentStatus) => {
    try {
      const res = await fetch(`/api/homework/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ completed: !currentStatus })
      });
      if (res.ok) {
        setHomework(prev => prev.map(h => h.id === id ? { ...h, completed: currentStatus ? 0 : 1 } : h));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizResult(null);
  };

  const handleSubmitQuiz = async () => {
    if (!selectedQuiz) return;
    const answerArr = selectedQuiz.questions.map((_, idx) => quizAnswers[idx] ?? null);

    try {
      const res = await fetch(`/api/quizzes/${selectedQuiz.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ answers: answerArr })
      });
      if (res.ok) {
        const data = await res.json();
        setQuizResult(data);
        setQuizSubmitted(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!msgTeacherId || !msgSubject || !msgContent) return;

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          recipient_id: parseInt(msgTeacherId),
          subject: msgSubject,
          content: msgContent,
          sender_as: senderAs
        })
      });

      if (res.ok) {
        const newMsg = await res.json();
        setMessages(prev => [...prev, newMsg]);
        setMsgSubject('');
        setMsgContent('');
        setMsgSentNotice('Message sent successfully to your teacher!');
        setTimeout(() => setMsgSentNotice(''), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredQna = qna.filter(item => 
    item.question.toLowerCase().includes(qnaSearch.toLowerCase()) ||
    item.subject.toLowerCase().includes(qnaSearch.toLowerCase()) ||
    item.answer.toLowerCase().includes(qnaSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider mb-3 backdrop-blur-md">
              Student & Parent Portal
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Welcome back, {user?.name}!</h1>
            <p className="text-indigo-100 text-sm mt-1 max-w-xl">
              Access remediation resources, learning notes, homework, and teacher communication.
            </p>
          </div>

          {/* Navigation Pills */}
          <div className="flex bg-slate-900/40 p-1.5 rounded-2xl backdrop-blur-md border border-white/10 self-start md:self-auto">
            <button
              onClick={() => setActiveTab('academic')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'academic'
                  ? 'bg-white text-indigo-900 shadow-md'
                  : 'text-indigo-100 hover:bg-white/10'
              }`}
            >
              <Brain className="w-4 h-4" />
              <span>Academic Support</span>
            </button>
            <button
              onClick={() => setActiveTab('guides')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'guides'
                  ? 'bg-white text-indigo-900 shadow-md'
                  : 'text-indigo-100 hover:bg-white/10'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Learning Guides & Hub</span>
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'messages'
                  ? 'bg-white text-indigo-900 shadow-md'
                  : 'text-indigo-100 hover:bg-white/10'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Communication</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: ACADEMIC SUPPORT & QUIZZES */}
      {activeTab === 'academic' && (
        <div className="space-y-8 animate-fade-in">
          {/* Remediation Quizzes */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Brain className="w-5 h-5 text-indigo-500" />
                  Tailored Remediation Quizzes
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Practice questions created by teachers to reinforce key concepts
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between gap-4 hover:border-indigo-500/50 transition-all"
                >
                  <div>
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold uppercase mb-2">
                      {quiz.subject}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{quiz.title}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{quiz.description}</p>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-xs text-slate-500 font-medium">
                      {quiz.questions ? quiz.questions.length : 0} Questions
                    </span>
                    <button
                      onClick={() => handleStartQuiz(quiz)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                    >
                      <span>Start Quiz</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Flashcards & Q&A Side-by-Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Interactive Flashcards */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <RotateCw className="w-5 h-5 text-purple-500" />
                  Interactive Flashcards
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Flip to reveal key definitions and concepts
                </p>
              </div>

              {flashcards.length > 0 ? (
                <div className="space-y-4">
                  <div
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="cursor-pointer min-h-[220px] p-8 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white flex flex-col items-center justify-center text-center relative border border-indigo-500/30 shadow-2xl transition-all hover:scale-[1.01]"
                  >
                    <span className="absolute top-4 left-4 px-2.5 py-1 rounded-md bg-indigo-800/80 text-[10px] font-bold uppercase tracking-wider">
                      {flashcards[flashcardIndex]?.subject}
                    </span>
                    <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                      {isFlipped ? 'ANSWER' : 'QUESTION'}
                    </span>

                    <p className="text-lg font-semibold max-w-md">
                      {isFlipped
                        ? flashcards[flashcardIndex]?.answer
                        : flashcards[flashcardIndex]?.question}
                    </p>

                    <p className="text-[10px] text-indigo-300/80 mt-6 flex items-center gap-1">
                      <RotateCw className="w-3 h-3" /> Click card to flip
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => {
                        setIsFlipped(false);
                        setFlashcardIndex(prev => (prev > 0 ? prev - 1 : flashcards.length - 1));
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                      Previous
                    </button>
                    <span className="text-xs font-bold text-slate-500">
                      Card {flashcardIndex + 1} of {flashcards.length}
                    </span>
                    <button
                      onClick={() => {
                        setIsFlipped(false);
                        setFlashcardIndex(prev => (prev < flashcards.length - 1 ? prev + 1 : 0));
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                      Next Card
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500">No flashcards available yet.</p>
              )}
            </div>

            {/* Q&A Knowledge Bank */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-emerald-500" />
                  Q&A Knowledge Bank
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Curated answers to frequently asked academic questions
                </p>
              </div>

              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={qnaSearch}
                  onChange={(e) => setQnaSearch(e.target.value)}
                  placeholder="Search Q&A bank by topic or keyword..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div className="space-y-3 max-h-[260px] overflow-y-auto pr-2">
                {filteredQna.map((item) => (
                  <div key={item.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      {item.subject}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Q: {item.question}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">A: {item.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LEARNING GUIDES & HUB */}
      {activeTab === 'guides' && (
        <div className="space-y-8 animate-fade-in">
          {/* Formatted Study Notes */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                Curated Study Notes & Guides
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Official notes uploaded by your teachers for revision
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {notes.map((note) => (
                <div key={note.id} className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold uppercase">
                      {note.subject}
                    </span>
                    <span className="text-[10px] text-slate-400">By {note.author_name || 'Teacher'}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{note.title}</h3>
                  <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-sans bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60 max-h-48 overflow-y-auto">
                    {note.content}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Homework Tracker & Study Calendar Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Homework Tracker */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-emerald-500" />
                  Homework Tracker
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Track assigned homework tasks and mark completed items
                </p>
              </div>

              <div className="space-y-3">
                {homework.map((hw) => (
                  <div
                    key={hw.id}
                    onClick={() => handleToggleHomework(hw.id, hw.completed)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                      hw.completed
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 opacity-75'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-indigo-500/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={!!hw.completed}
                      onChange={() => {}} // handled by div click
                      className="mt-1 w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-xs font-bold ${hw.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                          {hw.title}
                        </h4>
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                          Due: {hw.due_date}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{hw.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Study Calendar */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-500" />
                  Study Calendar & Upcoming Exams
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Important upcoming dates, exams, and milestones
                </p>
              </div>

              <div className="space-y-3">
                {calendarEvents.map((evt) => (
                  <div key={evt.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl text-white font-bold text-xs uppercase ${
                        evt.type === 'exam' ? 'bg-red-500' : 'bg-indigo-500'
                      }`}>
                        {evt.type}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{evt.title}</h4>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">{evt.subject}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-xl">
                      {evt.date}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COMMUNICATION PORTAL */}
      {activeTab === 'messages' && (
        <div className="space-y-8 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Message Composer */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Send className="w-5 h-5 text-indigo-500" />
                  Ask & Request Help
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Send a message directly to your teacher
                </p>
              </div>

              {/* Policy Banner */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Portal Policy:</strong> Messages can strictly be sent to Teachers. Direct student-to-parent messaging is disabled.
                </span>
              </div>

              {msgSentNotice && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{msgSentNotice}</span>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="space-y-4">
                {/* Sender Role Switcher */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Send As
                  </label>
                  <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs">
                    <button
                      type="button"
                      onClick={() => setSenderAs('student')}
                      className={`py-1.5 rounded-lg font-bold transition-all ${
                        senderAs === 'student'
                          ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                          : 'text-slate-500'
                      }`}
                    >
                      Student
                    </button>
                    <button
                      type="button"
                      onClick={() => setSenderAs('parent')}
                      className={`py-1.5 rounded-lg font-bold transition-all ${
                        senderAs === 'parent'
                          ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                          : 'text-slate-500'
                      }`}
                    >
                      Parent
                    </button>
                  </div>
                </div>

                {/* Recipient Teacher Select */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Select Teacher
                  </label>
                  <select
                    value={msgTeacherId}
                    onChange={(e) => setMsgTeacherId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white outline-none"
                  >
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.name} (Teacher)</option>
                    ))}
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={msgSubject}
                    onChange={(e) => setMsgSubject(e.target.value)}
                    placeholder="e.g. Remediation help on Chapter 3"
                    required
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white outline-none"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    value={msgContent}
                    onChange={(e) => setMsgContent(e.target.value)}
                    placeholder="Describe your question or request..."
                    required
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white outline-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Right: Message Thread */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-indigo-500" />
                  Conversation History
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Sent and received messages with your teacher
                </p>
              </div>

              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {messages.length > 0 ? (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={`p-4 rounded-2xl border ${
                        m.sender_id === user.id
                          ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/50 ml-6'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 mr-6'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {m.sender_name}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold uppercase">
                            {m.sender_role}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">{m.created_at}</span>
                      </div>
                      <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                        {m.subject}
                      </h4>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {m.content}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 text-center py-8">
                    No messages sent or received yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUIZ TAKING MODAL */}
      {selectedQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400">
                  {selectedQuiz.subject}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedQuiz.title}</h3>
              </div>
              <button
                onClick={() => setSelectedQuiz(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {!quizSubmitted ? (
                selectedQuiz.questions.map((q, qIdx) => (
                  <div key={q.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {qIdx + 1}. {q.question}
                    </h4>
                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => (
                        <label
                          key={optIdx}
                          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all text-xs font-medium ${
                            quizAnswers[qIdx] === optIdx
                              ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 text-indigo-700 dark:text-indigo-300'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`q_${qIdx}`}
                            checked={quizAnswers[qIdx] === optIdx}
                            onChange={() => setQuizAnswers({ ...quizAnswers, [qIdx]: optIdx })}
                            className="text-indigo-600 focus:ring-indigo-500"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center space-y-6 py-4">
                  <div className="w-16 h-16 rounded-3xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center font-extrabold text-2xl">
                    {quizResult.percentage}%
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white">Quiz Completed!</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      You scored {quizResult.score} out of {quizResult.total}
                    </p>
                  </div>

                  <div className="text-left space-y-4">
                    <h5 className="text-xs font-bold uppercase text-slate-400">Answers & Explanations</h5>
                    {selectedQuiz.questions.map((q, idx) => {
                      const userAns = quizAnswers[idx];
                      const isCorrect = userAns === q.correctIndex;
                      return (
                        <div key={q.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                          <p className="font-bold text-slate-900 dark:text-white">
                            {idx + 1}. {q.question}
                          </p>
                          <p className={isCorrect ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-red-500 font-semibold'}>
                            Your choice: {q.options[userAns] ?? 'Not answered'} ({isCorrect ? 'Correct' : 'Incorrect'})
                          </p>
                          {!isCorrect && (
                            <p className="text-emerald-600 dark:text-emerald-400 font-semibold">
                              Correct answer: {q.options[q.correctIndex]}
                            </p>
                          )}
                          <p className="text-slate-500 italic mt-1">{q.explanation}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3">
              {!quizSubmitted ? (
                <button
                  onClick={handleSubmitQuiz}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md"
                >
                  Submit Answers
                </button>
              ) : (
                <button
                  onClick={() => setSelectedQuiz(null)}
                  className="px-6 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs"
                >
                  Close Quiz
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
