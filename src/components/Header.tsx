import React, { useState, useRef, useEffect } from 'react';
import { Home, MessageSquare, User as UserIcon, LogOut, ChevronDown, Camera, Settings, X, Download } from 'lucide-react';
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
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Capture PWA install prompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed) setShowInstallBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handler as EventListener);
    return () => window.removeEventListener('beforeinstallprompt', handler as EventListener);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBanner(false);
      setDeferredPrompt(null);
    }
  };

  const dismissInstallBanner = () => {
    setShowInstallBanner(false);
    localStorage.setItem('pwa-install-dismissed', '1');
  };

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
    <>
      {/* PWA Install Banner */}
      {showInstallBanner && (
        <div className="fixed top-0 left-0 right-0 z-[200] bg-blue-600 text-white px-4 py-3 flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3 min-w-0">
            <Download className="w-5 h-5 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-bold truncate">Install HICM Hub</p>
              <p className="text-xs text-blue-100 truncate">Add to home screen for quick access</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleInstall}
              className="px-3 py-1.5 bg-white text-blue-700 text-xs font-bold rounded-lg hover:bg-blue-50 transition-colors"
            >
              Install
            </button>
            <button onClick={dismissInstallBanner} className="p-1 hover:bg-blue-500 rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <header className={`sticky top-0 z-40 bg-white px-4 sm:px-6 py-3 flex items-center justify-between border-b border-slate-200 shadow-sm text-slate-900 ${showInstallBanner ? 'mt-14' : ''}`}>
        {/* Logo / Title Area */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-black text-sm">H</span>
          </div>
          <div className="hidden sm:block min-w-0">
            <h1 className="text-base font-black tracking-tight text-slate-900 leading-none">HICM Hub</h1>
            <p className="text-[11px] text-slate-400 font-medium">Student Portal</p>
          </div>
        </div>

        {/* Navigation Links & Profile */}
        <div className="flex items-center gap-2 sm:gap-4 text-sm font-bold text-slate-900">
          <Link
            to={getHomePath()}
            className="hidden md:flex items-center gap-1.5 hover:text-blue-600 transition-colors text-black"
          >
            <Home className="w-4 h-4 text-blue-500" />
            <span>Home</span>
          </Link>

          <Link
            to={user?.role === 'admin' ? '/admin/forum' : user?.role === 'staff' ? '/staff/forum' : '/student/forum'}
            className="hidden md:flex items-center gap-1.5 hover:text-blue-600 transition-colors text-black"
          >
            <MessageSquare className="w-4 h-4 text-blue-500" />
            <span>Forum</span>
          </Link>

          {/* Profile dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors group p-1.5 rounded-xl hover:bg-blue-50"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className="w-8 h-8 rounded-full bg-blue-50 overflow-hidden border-2 border-blue-200 flex items-center justify-center shadow-sm flex-shrink-0">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-4 h-4 text-blue-600" />
                )}
              </div>
              <span className="hidden lg:block font-bold text-slate-700 group-hover:text-blue-600 max-w-[100px] truncate">
                {user?.name?.split(' ')[0] || 'Profile'}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 shadow-2xl rounded-2xl py-2 z-50">
                {/* User Info */}
                {user && (
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
                    <p className="text-[10px] text-slate-400 capitalize">{user.role}</p>
                  </div>
                )}
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setIsProfileModalOpen(true);
                  }}
                  className="w-full flex items-center px-4 py-2.5 text-sm text-black hover:bg-blue-50 hover:text-blue-600 transition-all font-semibold"
                >
                  <Settings className="w-4 h-4 mr-2.5 text-blue-600" />
                  Update Profile
                </button>
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    if (onLogout) onLogout();
                  }}
                  className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-all font-semibold"
                >
                  <LogOut className="w-4 h-4 mr-2.5 text-red-600" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Hidden File Input for Avatar */}
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
            <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-gradient-to-r from-blue-600 to-blue-700">
                <h2 className="font-extrabold text-white text-base">Update Profile</h2>
                <button onClick={() => setIsProfileModalOpen(false)} className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-5">
                {/* Picture Upload */}
                <div className="flex flex-col items-center gap-3">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 rounded-full bg-blue-100 overflow-hidden border-4 border-blue-200 flex items-center justify-center relative group cursor-pointer shadow-lg"
                  >
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-12 h-12 text-blue-400" />
                    )}
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                      <Camera className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                  >
                    Change Profile Picture
                  </button>
                </div>

                {/* Forum Username */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Forum Username / Display Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Anonymous Student"
                    value={customUsernameInput}
                    onChange={(e) => setCustomUsernameInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
                  />
                  <p className="text-[10px] text-slate-400">Name shown when posting in chat forums</p>
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="e.g. 671234567"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
                  />
                </div>

                {/* Show Avatar Toggle */}
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <label className="text-xs font-bold text-slate-700">Show Picture in Forums</label>
                    <p className="text-[10px] text-slate-400">Show your picture to others in chat forums</p>
                  </div>
                  <button
                    onClick={() => setShowAvatarInForum(!showAvatarInForum)}
                    className={`w-11 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors ${showAvatarInForum ? 'bg-blue-600' : 'bg-slate-200'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform ${showAvatarInForum ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Submit */}
                <button
                  onClick={handleSaveChanges}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-sm transition-all shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
