import React from 'react';
import { Home, Calendar, FileText, MessageSquare, Settings, Headset, Shield, ChevronDown } from 'lucide-react';
import { User } from '../types';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  user: User | null;
  unreadAlertsCount?: number;
  plagiarismTokens?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ user }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const mainNavItems = [
    { id: 'dashboard', path: '/student/dashboard', label: 'Dashboard', icon: Home },
    { id: 'calendar', path: '/student/calendar', label: 'My Calendar', icon: Calendar },
    { id: 'documents', path: '/student/notes', label: 'My Documents', icon: FileText },
    { id: 'messages', path: '/student/forum', label: 'Messages', icon: MessageSquare },
    { id: 'settings', path: '/student/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-[260px] min-h-screen flex-shrink-0 relative overflow-hidden sidebar-glass">
      {/* Brand Header */}
      <div className="flex flex-col items-center justify-center mt-10 mb-8 space-y-3 px-4">
        <div className="p-3 bg-indigo-500/20 border border-indigo-400/30 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Shield className="w-9 h-9 text-indigo-300" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-extrabold text-white tracking-tight">HICM Hub</h2>
          <p className="text-xs text-slate-400 mt-0.5">Student Portal</p>
        </div>
      </div>

      {/* Thin divider */}
      <div className="mx-4 h-px bg-white/10 mb-6" />

      {/* User Info Card */}
      {user && (
        <div className="mx-4 mb-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-sm border border-emerald-500/30 flex-shrink-0">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] text-slate-400 font-medium">Hello,</p>
                <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {user.department === 'Business Administration' ? 'BBA (Hons.)' : user.department || 'Student'}
                </p>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <div className="flex-1 px-3 space-y-1">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath.startsWith(item.path);

          return (
            <Link
              key={item.id}
              to={item.path}
              className={`w-full flex items-center px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 group ${
                isActive
                  ? 'bg-indigo-600/80 text-white shadow-lg shadow-indigo-500/30 border border-indigo-400/30'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white border border-transparent'
              }`}
            >
              <div className="flex items-center space-x-3 w-full relative">
                <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-indigo-100' : 'text-slate-400 group-hover:text-white'}`} />
                <span>{item.label}</span>
                {/* Unread dot */}
                {item.id === 'messages' && !isActive && (
                  <div className="absolute right-0 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-400/30" />
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Need Help Card */}
      <div className="p-4 mb-6 mt-4">
        <div className="bg-indigo-600/20 border border-indigo-500/30 rounded-2xl p-4 relative overflow-hidden group hover:bg-indigo-600/30 transition-all cursor-pointer">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-indigo-500/10 rounded-full blur-2xl" />
          <div className="relative z-10 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/30 text-indigo-300 flex items-center justify-center">
              <Headset className="w-4 h-4" />
            </div>
            <p className="text-sm font-bold text-white">Need Help?</p>
            <p className="text-[11px] text-slate-400 leading-relaxed">Our support team is here for you.</p>
            <span className="text-xs font-semibold text-indigo-300 flex items-center space-x-1 group-hover:text-indigo-200 transition-colors">
              <span>Contact Support</span>
              <span>→</span>
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
