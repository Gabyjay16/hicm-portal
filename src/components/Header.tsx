import React, { useState, useRef, useEffect } from 'react';
import { Home, MessageSquare, Bell, User as UserIcon, LogOut, ChevronDown, Camera, Settings, X } from 'lucide-react';
import { User } from '../types';
import { Link, useLocation } from 'react-router-dom';

interface HeaderProps {
  user: User | null;
  unreadAlertCount?: number;
  onLogout?: () => void;
  onUpdateUser?: (updated: Partial<User>) => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  unreadAlertCount = 2,
  onLogout,
  onUpdateUser,
}) => {
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(user?.avatarUrl);
  const [phoneInput, setPhoneInput] = useState<string>(user?.phone || '');
  const [customUsernameInput, setCustomUsernameInput] = useState<string>(user?.customUsername || user?.name || '');
  const [showAvatarInForum, setShowAvatarInForum] = useState<boolean>(user?.showAvatarInForum !== false);

  useEffect(() => {
    if (user) {
      setAvatarPreview(user.avatarUrl);
      setPhoneInput(user.phone || '');
      setCustomUsernameInput(user.customUsername || user.name);
      setShowAvatarInForum(user.showAvatarInForum !== false);
    }
  }, [user]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setAvatarPreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = () => {
    if (onUpdateUser) {
      onUpdateUser({
        avatarUrl: avatarPreview,
        phone: phoneInput,
        customUsername: customUsernameInput,
        showAvatarInForum: showAvatarInForum,
      });
    }
    setIsProfileModalOpen(false);
  };

  const getHomePath = () => {
    if (!user) return '/login';
    if (user.role === 'staff') return '/staff/dashboard';
    if (user.role === 'admin') return '/admin/dashboard';
    return '/student/dashboard';
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl px-6 sm:px-8 py-4 flex items-center justify-between border-b border-white/10 shadow-2xl text-white">
      {/* Title Area */}
      <div className="hidden sm:block">
        <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-white via-yellow-200 to-yellow-400 bg-clip-text text-transparent flex items-center gap-2">
          HICM Hub
        </h1>
        <p className="text-[12px] text-slate-300 font-medium">Student Academic &amp; Services Portal</p>
      </div>

      {/* Navigation Links & Profile */}
      <div className="flex items-center space-x-6 text-sm font-semibold text-slate-200">
        <Link 
          to={getHomePath()} 
          className="hidden md:flex items-center space-x-1.5 hover:text-yellow-400 transition-colors border-b-2 border-blue-500 text-yellow-400 pb-0.5"
        >
          <Home className="w-4 h-4 text-blue-400" />
          <span>Home</span>
        </Link>
        
        <Link 
          to="/student/forum" 
          className="hidden md:flex items-center space-x-1.5 hover:text-yellow-400 transition-colors text-slate-200"
        >
          <MessageSquare className="w-4 h-4 text-blue-400" />
          <span>Forum</span>
        </Link>

        <div className="relative">
          <div 
            className="flex items-center space-x-2.5 cursor-pointer hover:text-yellow-400 transition-colors group p-1 rounded-xl hover:bg-white/5"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="w-9 h-9 rounded-full bg-blue-950/80 overflow-hidden border-2 border-yellow-500/50 flex items-center justify-center shadow-lg shadow-blue-500/20">
               {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-5 h-5 text-yellow-400" />
                )}
            </div>
            <span className="hidden lg:block font-bold text-white group-hover:text-yellow-400">Profile</span>
            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-yellow-400 transition-colors" />
          </div>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-52 glass-panel border border-white/20 shadow-2xl rounded-2xl py-2 z-50 backdrop-blur-2xl">
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  setIsProfileModalOpen(true);
                }}
                className="w-full flex items-center px-4 py-2.5 text-sm text-slate-200 hover:bg-blue-600/20 hover:text-yellow-400 transition-all font-medium"
              >
                <Settings className="w-4 h-4 mr-2.5 text-blue-400" />
                Update Profile
              </button>
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  if (onLogout) onLogout();
                }}
                className="w-full flex items-center px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/20 transition-all font-medium"
              >
                <LogOut className="w-4 h-4 mr-2.5 text-red-400" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hidden File Input for Avatar Selection */}
      <input 
        type="file" 
        ref={fileInputRef} 
        accept="image/*" 
        className="hidden" 
        onChange={handleFileSelect} 
      />

      {/* Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="glass-panel rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-white/20 backdrop-blur-2xl text-white">
            <div className="flex justify-between items-center p-4 border-b border-white/10 bg-black/40">
              <h2 className="font-extrabold text-white text-base">Update Profile</h2>
              <button onClick={() => setIsProfileModalOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5 text-white">
              {/* Picture Upload */}
              <div className="flex flex-col items-center gap-3">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 rounded-full bg-blue-950 overflow-hidden border-2 border-yellow-400 flex items-center justify-center relative group cursor-pointer shadow-xl shadow-blue-500/20"
                >
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-12 h-12 text-yellow-400" />
                  )}
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs">
                    <Camera className="w-7 h-7 text-yellow-400" />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-bold text-yellow-400 hover:text-yellow-300 hover:underline cursor-pointer"
                >
                  Change Picture (Select from Gallery)
                </button>
              </div>

              {/* Forum Username */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200">Forum Username / Display Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Anonymous Student or Jane Doe" 
                  value={customUsernameInput}
                  onChange={(e) => setCustomUsernameInput(e.target.value)}
                  className="w-full bg-black/60 border border-white/20 text-white placeholder-slate-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all" 
                />
                <p className="text-[10px] text-slate-400">Name shown when posting in chat forums (defaults to your real name)</p>
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200">Phone Number</label>
                <input 
                  type="text" 
                  placeholder="e.g. 671234567" 
                  value={phoneInput} 
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full bg-black/60 border border-white/20 text-white placeholder-slate-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all" 
                />
              </div>

              {/* Visibility Switch */}
              <div className="space-y-1.5 flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/10">
                <div>
                  <label className="text-xs font-semibold text-slate-200">Picture Visibility</label>
                  <p className="text-[10px] text-slate-400">Show picture to others in chat forums</p>
                </div>
                <div 
                  onClick={() => setShowAvatarInForum(!showAvatarInForum)}
                  className={`w-11 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors ${showAvatarInForum ? 'bg-blue-600' : 'bg-slate-700'}`}
                >
                  <div className={`w-4 h-4 bg-yellow-400 rounded-full shadow-md transition-transform ${showAvatarInForum ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
              </div>

              {/* Submit */}
              <button
                onClick={handleSaveChanges}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-500 hover:to-blue-600 text-white font-extrabold rounded-2xl text-sm transition-all shadow-xl shadow-blue-600/30 hover:scale-[1.01] active:scale-[0.99] border border-blue-400/30 mt-4 cursor-pointer"
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
