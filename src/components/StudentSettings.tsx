import React, { useEffect, useState } from 'react';
import { User } from '../types';
import { Moon, Sun, Monitor, Bell, BellOff, Volume2, VolumeX, Shield } from 'lucide-react';

interface StudentSettingsProps {
  user: User | null;
}

export const StudentSettings: React.FC<StudentSettingsProps> = ({ user }) => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [forumNotifications, setForumNotifications] = useState(true);
  const [announcementNotifications, setAnnouncementNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' || 'system';
    setTheme(savedTheme);
    setForumNotifications(localStorage.getItem('forum_notifications') !== 'false');
    setAnnouncementNotifications(localStorage.getItem('announcement_notifications') !== 'false');
    setSoundEnabled(localStorage.getItem('notification_sound') !== 'false');
  }, []);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark' || (newTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleForumNotifications = () => {
    const next = !forumNotifications;
    setForumNotifications(next);
    localStorage.setItem('forum_notifications', next ? 'true' : 'false');
  };

  const toggleAnnouncementNotifications = () => {
    const next = !announcementNotifications;
    setAnnouncementNotifications(next);
    localStorage.setItem('announcement_notifications', next ? 'true' : 'false');
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('notification_sound', next ? 'true' : 'false');
    // Play a test sound when enabling
    if (next) {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      } catch {}
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification('HICM Hub', {
          body: 'Notifications are now enabled!',
          icon: '/icons/icon-192.svg',
        });
      }
    }
  };

  const Toggle: React.FC<{ enabled: boolean; onToggle: () => void }> = ({ enabled, onToggle }) => (
    <button
      onClick={onToggle}
      className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer transition-all duration-200 ${enabled ? 'bg-blue-600' : 'bg-slate-200'}`}
    >
      <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-200 ${enabled ? 'translate-x-6' : 'translate-x-0'}`} />
    </button>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-20 md:pb-6 font-sans px-1">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your account preferences and app appearance.</p>
      </div>

      {/* Appearance */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm space-y-4">
        <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 pb-2">
          Appearance
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'light' as const, label: 'Light', icon: Sun },
            { value: 'dark' as const, label: 'Dark', icon: Moon },
            { value: 'system' as const, label: 'System', icon: Monitor },
          ].map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => handleThemeChange(value)}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                theme === value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-bold">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm space-y-4">
        <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 pb-2">
          Notifications
        </h2>

        {/* Request browser notification permission */}
        {'Notification' in window && Notification.permission !== 'granted' && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold text-amber-800">Enable browser notifications</p>
              <p className="text-[10px] text-amber-600">Allow HICM Hub to send you alerts</p>
            </div>
            <button
              onClick={requestNotificationPermission}
              className="px-3 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-lg hover:bg-amber-600 transition-colors flex-shrink-0"
            >
              Enable
            </button>
          </div>
        )}

        <div className="space-y-3">
          {/* Forum Reply Notifications */}
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600">
            <div className="flex items-center gap-3 min-w-0">
              {forumNotifications ? <Bell className="w-4 h-4 text-blue-500 flex-shrink-0" /> : <BellOff className="w-4 h-4 text-slate-400 flex-shrink-0" />}
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Forum Replies</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Get notified when someone replies to your messages</p>
              </div>
            </div>
            <Toggle enabled={forumNotifications} onToggle={toggleForumNotifications} />
          </div>

          {/* Announcement Notifications */}
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600">
            <div className="flex items-center gap-3 min-w-0">
              {announcementNotifications ? <Bell className="w-4 h-4 text-blue-500 flex-shrink-0" /> : <BellOff className="w-4 h-4 text-slate-400 flex-shrink-0" />}
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Urgent Announcements</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Play sound when an urgent announcement is posted</p>
              </div>
            </div>
            <Toggle enabled={announcementNotifications} onToggle={toggleAnnouncementNotifications} />
          </div>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600">
            <div className="flex items-center gap-3 min-w-0">
              {soundEnabled ? <Volume2 className="w-4 h-4 text-blue-500 flex-shrink-0" /> : <VolumeX className="w-4 h-4 text-slate-400 flex-shrink-0" />}
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Notification Sound</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Play a sound for all notifications</p>
              </div>
            </div>
            <Toggle enabled={soundEnabled} onToggle={toggleSound} />
          </div>
        </div>
      </div>

      {/* Account Info */}
      {user && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm space-y-3">
          <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 pb-2">
            Account
          </h2>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 border-2 border-blue-200 flex items-center justify-center overflow-hidden flex-shrink-0">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-blue-700 font-black text-lg">{user.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{user.matricNo || user.staffCode || ''} · {user.department || user.role}</p>
            </div>
            <Shield className="w-5 h-5 text-slate-300 ml-auto flex-shrink-0" />
          </div>
        </div>
      )}
    </div>
  );
};
