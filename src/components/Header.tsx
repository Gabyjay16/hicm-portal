import React from 'react';
import { GraduationCap, Bell, User as UserIcon, LogOut, LogIn } from 'lucide-react';
import { User, NavTab, SubView } from '../types';

interface HeaderProps {
  user: User | null;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  setActiveSubView: (view: SubView) => void;
  unreadAlertCount?: number;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  setActiveTab,
  setActiveSubView,
  unreadAlertCount = 2,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-navy-900 text-offwhite px-4 py-3 shadow-md flex items-center justify-between border-b border-navy-800">
      {/* Brand Logo & Name */}
      <div 
        className="flex items-center space-x-3 cursor-pointer group"
        onClick={() => {
          setActiveTab('home');
          setActiveSubView('dashboard');
        }}
      >
        <div className="bg-emerald-500/20 p-2 rounded-xl border border-emerald-500/30 text-emerald-500 group-hover:scale-105 transition-transform">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-offwhite flex items-center gap-1.5">
            HICM Hub
            <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
              v2.0
            </span>
          </h1>
          <p className="text-xs text-slate-400 hidden sm:block">Higher Institute of Commerce & Management</p>
        </div>
      </div>

      {/* Right Controls: Notifications & User Profile */}
      <div className="flex items-center space-x-3">
        {/* Notification Bell */}
        <button
          onClick={() => setActiveTab('alerts')}
          className="relative p-2 text-slate-300 hover:text-offwhite hover:bg-navy-800 rounded-lg transition-colors"
          title="Notifications & Alerts"
        >
          <Bell className="w-5 h-5" />
          {unreadAlertCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
              {unreadAlertCount > 9 ? '9+' : unreadAlertCount}
            </span>
          )}
        </button>

        {/* User Status / Avatar Card */}
        {user ? (
          <div className="flex items-center space-x-3 bg-navy-800/80 border border-slate-700/60 pl-2.5 pr-2 py-1.5 rounded-xl">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold text-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block text-left text-xs">
              <p className="font-semibold text-offwhite truncate max-w-[120px]">{user.name}</p>
              <div className="flex items-center gap-1">
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${user.role === 'staff' ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                <span className="text-[11px] text-slate-400 capitalize">{user.role}</span>
              </div>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={() => setActiveSubView('login')}
            className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-navy-900 font-semibold px-3 py-1.5 rounded-xl text-sm transition-colors shadow-sm"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
