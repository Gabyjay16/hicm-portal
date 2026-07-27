import React from 'react';
import { Home, Calendar, FileText, MessageSquare, Settings, Headset, Shield, ChevronDown } from 'lucide-react';
import { User } from '../types';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  user: User | null;
  unreadAlertsCount?: number;
  plagiarismTokens?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
}) => {
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
    <aside className="hidden md:flex flex-col w-[260px] bg-slate-900 text-slate-100 min-h-screen flex-shrink-0 relative overflow-hidden rounded-r-3xl my-2 ml-2 shadow-2xl">
      {/* Brand Header */}
      <div className="flex flex-col items-center justify-center mt-10 mb-8 space-y-3">
        <div className="p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
           <Shield className="w-10 h-10 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">HICM Hub</h2>
      </div>

      {/* User Info Card */}
      {user && (
        <div className="mx-4 mb-8">
          <div className="bg-slate-800/50 rounded-2xl p-3 flex items-center justify-between border border-white/5 cursor-pointer hover:bg-slate-800 transition-colors">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold overflow-hidden border border-emerald-500/30">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] text-slate-400">Hello,</p>
                <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {user.department === 'Business Administration' ? 'BBA (Hons.)' : user.department || 'Student'}
                </p>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <div className="flex-1 px-4 space-y-2">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path || (item.path === '/student/dashboard' && currentPath === '/student/dashboard');
          
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`w-full flex items-center px-4 py-3.5 rounded-xl font-medium text-sm transition-all ${
                isActive
                  ? 'bg-emerald-600/90 text-white shadow-lg'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-4 w-full relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                
                {/* Active indicator dot */}
                {item.id === 'messages' && !isActive && (
                  <div className="absolute right-0 w-2 h-2 rounded-full bg-emerald-400"></div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Need Help Card */}
      <div className="mt-auto p-4 mb-4">
        <div className="bg-slate-800/60 rounded-2xl p-4 border border-white/5 relative overflow-hidden group hover:bg-slate-800 transition-colors cursor-pointer">
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="relative z-10 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Headset className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Need Help?</p>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Our support team is here for you.
              </p>
            </div>
            <div className="pt-2">
              <span className="text-xs font-semibold text-emerald-400 flex items-center space-x-1 group-hover:text-emerald-300 transition-colors">
                <span>Contact Support</span>
                <span>→</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
