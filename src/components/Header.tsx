import React, { useState } from 'react';
import { Home, MessageSquare, Bell, User as UserIcon, LogOut, ChevronDown, Camera, Settings, X } from 'lucide-react';
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

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



        <div className="relative">
          <div 
            className="flex items-center space-x-2 cursor-pointer hover:text-emerald-600 transition-colors group"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
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

          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-48 bg-white border border-slate-200 shadow-xl rounded-xl py-2 z-50">
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  setIsProfileModalOpen(true);
                }}
                className="w-full flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-emerald-600"
              >
                <Settings className="w-4 h-4 mr-2" />
                Update Profile
              </button>
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  if (onLogout) onLogout();
                }}
                className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-800">Update Profile</h2>
              <button onClick={() => setIsProfileModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5 text-slate-800">
              <div className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 rounded-full bg-slate-100 overflow-hidden border-2 border-slate-200 flex items-center justify-center relative group cursor-pointer">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-10 h-10 text-slate-400" />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-xs font-semibold text-emerald-600 cursor-pointer">Change Picture</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Phone Number</label>
                <input 
                  type="text" 
                  placeholder="e.g. 671234567" 
                  defaultValue={user?.phone} 
                  className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors" 
                />
              </div>
              <div className="space-y-1.5 flex items-center justify-between">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Picture Visibility</label>
                  <p className="text-[10px] text-slate-500">Show picture to others in chat forums</p>
                </div>
                <div className="w-10 h-6 bg-emerald-500 rounded-full flex items-center p-1 cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full translate-x-4 shadow-sm" />
                </div>
              </div>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl text-sm hover:bg-slate-800 transition-colors mt-4"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
