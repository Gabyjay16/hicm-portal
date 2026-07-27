import React from 'react';
import { Search, Home, MessageSquare, Bell, User as UserIcon, LogOut, ChevronDown } from 'lucide-react';
import { User } from '../types';
import { Link, useLocation } from 'react-router-dom';

interface HeaderProps {
  user: User | null;
  unreadAlertCount?: number;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  unreadAlertCount = 2,
  onLogout,
}) => {
  const location = useLocation();

  const getHomePath = () => {
    if (!user) return '/login';
    if (user.role === 'staff') return '/staff/dashboard';
    if (user.role === 'admin') return '/admin/dashboard';
    return '/student/dashboard';
  };

  const getAlertsPath = () => {
    if (!user) return '/login';
    return `/${user.role}/alerts`;
  };

  return (
    <header className="sticky top-0 z-40 bg-white px-8 py-5 flex items-center justify-between border-b border-slate-200 shadow-sm">
      {/* Title Area */}
      <div className="hidden sm:block">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">HICM Hub</h1>
        <p className="text-[13px] text-slate-500 font-medium">Student Academic & Services Portal</p>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-md mx-4">
        <div className="relative group">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="text"
            placeholder="Search HICM Hub..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-700"
          />
        </div>
      </div>

      {/* Navigation Links & Profile */}
      <div className="flex items-center space-x-6 text-sm font-semibold text-slate-600">
        <Link 
          to={getHomePath()} 
          className="hidden md:flex items-center space-x-1.5 hover:text-emerald-600 transition-colors border-b-2 border-emerald-500 text-emerald-600 pb-0.5"
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </Link>
        
        <Link 
          to="/student/forum" 
          className="hidden md:flex items-center space-x-1.5 hover:text-emerald-600 transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Forum</span>
        </Link>

        <Link 
          to={getAlertsPath()} 
          className="relative hidden md:flex items-center space-x-1.5 hover:text-emerald-600 transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span>Alerts</span>
          {unreadAlertCount > 0 && (
            <span className="absolute -top-1 -right-2 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></span>
          )}
        </Link>

        <div className="flex items-center space-x-2 cursor-pointer hover:text-emerald-600 transition-colors group">
          <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden border border-slate-200 flex items-center justify-center">
             {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-5 h-5 text-slate-400" />
              )}
          </div>
          <span className="hidden lg:block">Profile</span>
          <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
        </div>
      </div>
    </header>
  );
};
