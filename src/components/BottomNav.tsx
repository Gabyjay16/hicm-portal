import React from 'react';
import { Home, MessageSquare, Bell, FileText } from 'lucide-react';
import { User } from '../types';
import { Link, useLocation } from 'react-router-dom';

interface BottomNavProps {
  user: User | null;
  unreadAlertsCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  user,
  unreadAlertsCount = 0,
}) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const getBasePath = () => {
    if (!user) return '/login';
    if (user.role === 'staff') return '/staff';
    if (user.role === 'admin') return '/admin';
    return '/student';
  };

  const basePath = getBasePath();

  const tabs = [
    { id: 'dashboard', path: `${basePath}/dashboard`, label: 'Home', icon: Home },
    { id: 'forum', path: `${basePath}/forum`, label: 'Forum', icon: MessageSquare },
    { id: 'alerts', path: `${basePath}/alerts`, label: 'Alerts', icon: Bell, badge: unreadAlertsCount },
    { id: 'notes', path: `${basePath}/notes`, label: 'Notes', icon: FileText },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 flex justify-around items-center py-2 md:hidden shadow-lg"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)' }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentPath.startsWith(tab.path);
        return (
          <Link
            key={tab.id}
            to={tab.path}
            className={`relative flex flex-col items-center justify-center flex-1 py-1 px-1 transition-all min-w-0 ${
              isActive ? 'text-blue-600 font-semibold' : 'text-slate-500'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
              {tab.badge && tab.badge > 0 ? (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] font-bold px-1 rounded-full min-w-[14px] text-center">
                  {tab.badge}
                </span>
              ) : null}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-medium truncate">{tab.label}</span>
            {isActive && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-600 rounded-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
};
