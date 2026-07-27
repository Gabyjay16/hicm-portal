import React from 'react';
import { User, SubView } from '../types';
import { AccordionNav } from './AccordionNav';
import { Clock, FileCheck, Bell, ShieldCheck, User as UserIcon, ArrowRight, Sparkles, AlertTriangle } from 'lucide-react';

interface StudentDashboardProps {
  user: User | null;
  onNavigateSubView: (view: SubView) => void;
  plagiarismTokens: number;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  user,
  onNavigateSubView,
  plagiarismTokens,
}) => {
  // Announcements ticker list
  const announcements = [
    { id: 1, text: '🚨 Second Semester Mid-Term Examination Schedule is now published.', tag: 'Urgent' },
    { id: 2, text: '📢 Plagiarism checker tokens renewed for all registered Level 300 & 400 students.', tag: 'Notice' },
    { id: 3, text: '💡 HICM General Academic Forum rules updated: External web links strictly forbidden.', tag: 'Policy' },
  ];

  return (
    <div className="space-y-6 pb-16 md:pb-6">
      {/* Prominent Announcement Ribbon / Ticker */}
      <div className="bg-gradient-to-r from-navy-800 via-navy-800 to-navy-900 border border-emerald-500/30 rounded-2xl p-4 shadow-lg">
        <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-2">
          <Bell className="w-4 h-4 animate-bounce" />
          <span>Campus Announcement Ribbon</span>
        </div>
        <div className="space-y-2">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-navy-900/80 border border-slate-700/50 text-xs text-slate-200"
            >
              <div className="flex items-center space-x-2 truncate">
                <span className="text-offwhite font-medium truncate">{ann.text}</span>
              </div>
              <span className="ml-2 flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                {ann.tag}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* User Information Card */}
      <div className="bg-navy-800 border border-slate-700/60 rounded-2xl p-5 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold text-2xl shadow-inner">
            {user ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-7 h-7" />}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-offwhite">{user ? user.name : 'Guest Student'}</h2>
              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {user ? user.role : 'Guest'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {user?.role === 'staff'
                ? `Staff Code: ${user.staffCode || 'STF-123'} • Dept: ${user.department || 'Academic'}`
                : `Matric No: ${user?.matricNo || 'HICM-2024-089'} • ${user?.department || 'Business Admin'}`}
            </p>
            <div className="flex items-center space-x-3 mt-1.5 text-xs text-slate-300">
              <span className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                {user?.status || 'Active Student'}
              </span>
              <span>•</span>
              <span className="text-slate-400">{user?.level || 'Level 300'}</span>
            </div>
          </div>
        </div>

        {/* User quick status or login trigger */}
        {!user && (
          <button
            onClick={() => onNavigateSubView('login')}
            className="w-full sm:w-auto px-4 py-2 bg-emerald-500 text-navy-900 font-bold rounded-xl text-xs hover:bg-emerald-600 transition-colors shadow"
          >
            Authenticate Portal
          </button>
        )}
      </div>

      {/* Action Cards: Timed Evaluation & Plagiarism Test */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Timed Evaluation */}
        <div className="bg-gradient-to-br from-navy-800 to-navy-900 border border-amber-500/30 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-amber-500/60 transition-all group">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 group-hover:scale-105 transition-transform">
                <Clock className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/30">
                10-Min Quiz
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-offwhite group-hover:text-amber-300 transition-colors">
                Timed Evaluation Quiz
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Test your course knowledge under countdown constraints. Auto-submits at 0:00 with immediate score & detailed answer explanations.
              </p>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-700/50 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">5 Questions • MCQ</span>
            <button
              onClick={() => onNavigateSubView('evaluation')}
              className="flex items-center space-x-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-navy-900 font-bold rounded-xl text-xs transition-colors shadow"
            >
              <span>Start Test</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Card 2: Plagiarism Test */}
        <div className="bg-gradient-to-br from-navy-800 to-navy-900 border border-emerald-500/30 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-emerald-500/60 transition-all group">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 group-hover:scale-105 transition-transform">
                <FileCheck className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 font-mono">
                {plagiarismTokens} Tokens Available
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-offwhite group-hover:text-emerald-300 transition-colors">
                Plagiarism & Similarity Check
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Upload course assignments (.pdf, .docx, .txt) to perform deep content originality analysis against academic repositories.
              </p>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-700/50 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Cost: 1 Token / Check</span>
            <button
              onClick={() => onNavigateSubView('plagiarism')}
              className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-navy-900 font-bold rounded-xl text-xs transition-colors shadow"
            >
              <span>Launch Checker</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Embedded Accordion Directory */}
      <div className="bg-navy-800 border border-slate-700/60 rounded-2xl p-5 shadow-md">
        <AccordionNav />
      </div>
    </div>
  );
};
