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
        <div className="p-3 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center shadow-sm">
          <Shield className="w-9 h-9 text-blue-600" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">HICM Hub</h2>
          <p className="text-xs text-slate-400 mt-0.5">Student Portal</p>
        </div>
      </div>

      {/* Thin divider */}
      <div className="mx-4 h-px bg-slate-100 mb-5" />

      {/* User Info Card */}
      {user && (
        <div className="mx-4 mb-5">
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3 flex items-center justify-between hover:bg-blue-100 transition-colors cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm border border-blue-200 flex-shrink-0">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] text-slate-400 font-medium">Hello,</p>
                <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
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
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200 border border-blue-500'
                  : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700 border border-transparent'
              }`}
            >
              <div className="flex items-center space-x-3 w-full relative">
                <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'}`} />
                <span className={isActive ? 'text-white' : 'text-slate-700 group-hover:text-blue-700'}>{item.label}</span>
                {/* Unread dot */}
                {item.id === 'messages' && !isActive && (
                  <div className="absolute right-0 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-blue-200" />
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Need Help Card */}
      <div className="p-4 mb-6 mt-4">
        <div className="bg-blue-600 rounded-2xl p-4 relative overflow-hidden group hover:bg-blue-700 transition-all cursor-pointer shadow-md shadow-blue-200">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 text-white flex items-center justify-center">
              <Headset className="w-4 h-4" />
            </div>
            <p className="text-sm font-bold text-white">Need Help?</p>
            <p className="text-[11px] text-blue-100 leading-relaxed">Our support team is here for you.</p>
            <span className="text-xs font-semibold text-white flex items-center space-x-1">
              <span>Contact Support</span>
              <span>→</span>
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
