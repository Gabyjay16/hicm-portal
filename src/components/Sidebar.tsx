import React from 'react';
import { Home, MessageSquare, Bell, FileText, Clock, FileCheck, ShieldCheck, UserCheck, BookOpen } from 'lucide-react';
import { NavTab, SubView, User } from '../types';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  activeSubView: SubView;
  setActiveSubView: (view: SubView) => void;
  user: User | null;
  unreadAlertsCount?: number;
  plagiarismTokens?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  activeSubView,
  setActiveSubView,
  user,
  unreadAlertsCount = 2,
  plagiarismTokens = 5,
}) => {
  const mainNavItems = [
    { id: 'home' as NavTab, label: 'Home Dashboard', icon: Home },
    { id: 'forum' as NavTab, label: 'General Forum', icon: MessageSquare },
    { id: 'alerts' as NavTab, label: 'Alerts & Notices', icon: Bell, badge: unreadAlertsCount },
    { id: 'notes' as NavTab, label: 'Course Notes', icon: FileText },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-navy-900 text-offwhite min-h-screen border-r border-navy-800 p-4 flex-shrink-0">
      {/* Brand Header */}
      <div className="flex items-center space-x-3 mb-8 px-2 py-1">
        <div className="bg-emerald-500/20 p-2.5 rounded-xl border border-emerald-500/30 text-emerald-400">
          <BookOpen className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-offwhite tracking-tight">HICM Hub</h2>
          <p className="text-xs text-slate-400 font-medium">Academic Portal</p>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="space-y-1 mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 mb-2">
          Navigation
        </p>
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id && activeSubView === 'dashboard';
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (item.id === 'home') {
                  setActiveSubView('dashboard');
                }
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                isActive
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-300 hover:bg-navy-800 hover:text-offwhite'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && item.badge > 0 ? (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Quick Core Features */}
      <div className="space-y-1 mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 mb-2">
          Quick Tools
        </p>
        <button
          onClick={() => {
            setActiveTab('home');
            setActiveSubView('evaluation');
          }}
          className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
            activeSubView === 'evaluation'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
              : 'text-slate-300 hover:bg-navy-800 hover:text-offwhite'
          }`}
        >
          <Clock className="w-5 h-5 text-amber-400" />
          <span>Timed Evaluation</span>
        </button>
        <button
          onClick={() => {
            setActiveTab('home');
            setActiveSubView('plagiarism');
          }}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
            activeSubView === 'plagiarism'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
              : 'text-slate-300 hover:bg-navy-800 hover:text-offwhite'
          }`}
        >
          <div className="flex items-center space-x-3">
            <FileCheck className="w-5 h-5 text-emerald-400" />
            <span>Plagiarism Test</span>
          </div>
          <span className="text-[10px] bg-navy-800 border border-slate-700 text-slate-300 px-1.5 py-0.5 rounded font-mono">
            {plagiarismTokens} 🪙
          </span>
        </button>
      </div>

      {/* User Info / Status Banner */}
      <div className="mt-auto pt-4 border-t border-navy-800">
        {user ? (
          <div className="p-3 rounded-xl bg-navy-800 border border-slate-700/60 space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-offwhite truncate">{user.name}</p>
                <p className="text-xs text-slate-400 truncate">
                  {user.role === 'staff' ? user.staffCode || 'Staff' : user.matricNo || 'Student'}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-700/50">
              <span className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Active
              </span>
              <span className="capitalize px-1.5 py-0.2 bg-slate-900 rounded text-slate-300">
                {user.department || 'Business Admin'}
              </span>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-navy-800 border border-slate-700/60 text-center space-y-2">
            <UserCheck className="w-6 h-6 text-slate-400 mx-auto" />
            <p className="text-xs text-slate-300">Guest Access Mode</p>
            <button
              onClick={() => setActiveSubView('login')}
              className="w-full py-1.5 bg-emerald-500 text-navy-900 font-bold rounded-lg text-xs hover:bg-emerald-600 transition-colors"
            >
              Log In / Register
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
