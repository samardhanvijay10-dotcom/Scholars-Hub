import React from 'react';
import { UserCheck, BookOpen, MessageSquare, ShieldCheck, Sparkles, Brain, CheckCircle2, ArrowRight } from 'lucide-react';

export default function LandingPage({ onOpenAuth }) {
  return (
    <div className="relative overflow-hidden">
      {/* Background glow graphics */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-indigo-500/10 via-purple-500/10 to-pink-500/10 blur-3xl -z-10 pointer-events-none"></div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-8 animate-fade-in">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          Modern Academic Support & Remediation Platform
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight">
          Empowering Every Student through <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">Tailored Remediation</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
          A modern portal connecting students, parents, and educators. Access personalized study notes, practice quizzes, and direct, secure teacher messaging.
        </p>

        {/* Primary CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <button
            onClick={() => onOpenAuth('teacher')}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 group cursor-pointer"
          >
            <UserCheck className="w-5 h-5" />
            <span>Login as Teacher</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => onOpenAuth('student')}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-base border border-slate-700 dark:border-slate-600 shadow-md transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 cursor-pointer"
          >
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <span>Login as Student</span>
          </button>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none hover:border-indigo-500/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Tailored Remediation</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Targeted practice quizzes, flashcards, and Q&A banks created by teachers to help struggling students master difficult concepts.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none hover:border-indigo-500/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-6">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Learning Guides Hub</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Organized study notes, homework assignments with completion trackers, and integrated exam calendars.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none hover:border-indigo-500/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-pink-100 dark:bg-pink-950/70 text-pink-600 dark:text-pink-400 flex items-center justify-center mb-6">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Direct Communication</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              A private messaging portal allowing students and parents to ask questions and request assistance directly from teachers.
            </p>
          </div>
        </div>

        {/* Security / Verification Banner */}
        <div className="mt-16 p-6 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Secure Educator Verification</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Teacher registration is protected with a secure verification access code. Name & password authentication eliminates third-party dependencies.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
