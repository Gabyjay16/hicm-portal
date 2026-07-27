import React from 'react';
import { Home, MessageSquare, Bell, FileText } from 'lucide-react';
import { NavTab, SubView } from '../types';

interface BottomNavProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  setActiveSubView: (view: SubView) => void;
  unreadAlertsCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  setActiveSubView,
  unreadAlertsCount = 0,
}) => {
  const tabs = [
    { id: 'home' as NavTab, label: 'Home', icon: Home },
    { id: 'forum' as NavTab, label: 'Forum', icon: MessageSquare },
    { id: 'alerts' as NavTab, label: 'Alerts', icon: Bell, badge: unreadAlertsCount },
    { id: 'notes' as NavTab, label: 'Notes', icon: FileText },
  ];

  const handleTabClick = (tabId: NavTab) => {
    setActiveTab(tabId);
    if (tabId === 'home') {
      setActiveSubView('dashboard');
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-navy-900 border-t border-navy-800 flex justify-around items-center py-2 md:hidden shadow-lg">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`relative flex flex-col items-center justify-center w-full py-1 px-2 transition-all ${
              isActive ? 'text-emerald-500 font-semibold' : 'text-slate-400 hover:text-offwhite'
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
            <span className="text-[11px] mt-1 tracking-tight">{tab.label}</span>
            {isActive && (
              <span className="absolute bottom-0 w-8 h-0.5 bg-emerald-500 rounded-full"></span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
