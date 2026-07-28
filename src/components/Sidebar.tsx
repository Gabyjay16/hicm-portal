import React, { useState } from 'react';
import {
  Home, FileText, MessageSquare, Settings, Headset, Shield,
  ChevronDown, ChevronRight, BookOpen, Award, FileCheck,
  HeartHandshake, Search, MapPin, Users, Activity, Bell, Layers
} from 'lucide-react';
import { User } from '../types';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  user: User | null;
  unreadAlertsCount?: number;
  plagiarismTokens?: number;
}

type AccordionKey = 'academics' | 'services' | 'campus';

interface NavSection {
  id: AccordionKey;
  title: string;
  icon: React.ElementType;
  colorClass: string;
  items: { path: string; label: string; icon: React.ElementType }[];
}

export const Sidebar: React.FC<SidebarProps> = ({ user, unreadAlertsCount = 0 }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [openSections, setOpenSections] = useState<Record<AccordionKey, boolean>>({
    academics: false,
    services: false,
    campus: false,
  });

  const toggleSection = (id: AccordionKey) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const topNavItems = [
    { path: '/student/dashboard', label: 'Dashboard', icon: Home },
    { path: '/student/alerts', label: 'Alerts & Notices', icon: Bell, badge: unreadAlertsCount },
    { path: '/student/notes', label: 'My Documents', icon: FileText },
    { path: '/student/forum', label: 'Messages', icon: MessageSquare },
  ];

  const sections: NavSection[] = [
    {
      id: 'academics',
      title: 'Academics',
      icon: BookOpen,
      colorClass: 'blue',
      items: [
        { path: '/student/evaluation', label: 'Evaluation', icon: Award },
        { path: '/student/notes', label: 'Lecture Notes', icon: FileText },
        { path: '/student/plagiarism', label: 'Plagiarism Test', icon: FileCheck },
      ],
    },
    {
      id: 'services',
      title: 'Student Services',
      icon: Shield,
      colorClass: 'emerald',
      items: [
        { path: '/student/complaints', label: 'Complaints Desk', icon: HeartHandshake },
        { path: '/student/lost-and-found', label: 'Lost & Found', icon: MapPin },
        { path: '/student/requests', label: 'Requests', icon: Search },
      ],
    },
    {
      id: 'campus',
      title: 'Campus Life',
      icon: Layers,
      colorClass: 'violet',
      items: [
        { path: '/student/forum', label: 'General Forum', icon: Users },
        { path: '/student/elections', label: 'Student Elections', icon: Activity },
      ],
    },
  ];

  const colorVariants: Record<string, { bg: string; text: string; border: string; iconBg: string; itemHover: string }> = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      iconBg: 'bg-blue-100 text-blue-600',
      itemHover: 'hover:bg-blue-50 hover:text-blue-700',
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      iconBg: 'bg-emerald-100 text-emerald-600',
      itemHover: 'hover:bg-emerald-50 hover:text-emerald-700',
    },
    violet: {
      bg: 'bg-violet-50',
      text: 'text-violet-700',
      border: 'border-violet-200',
      iconBg: 'bg-violet-100 text-violet-600',
      itemHover: 'hover:bg-violet-50 hover:text-violet-700',
    },
  };

  return (
    <aside className="hidden md:flex flex-col w-[260px] min-h-screen flex-shrink-0 relative overflow-y-auto overflow-x-hidden sidebar-glass">
      {/* Brand Header */}
      <div className="flex flex-col items-center justify-center mt-8 mb-6 space-y-3 px-4">
        <div className="p-3 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center shadow-sm">
          <Shield className="w-8 h-8 text-blue-600" />
        </div>
        <div className="text-center">
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">HICM Hub</h2>
          <p className="text-xs text-slate-400 mt-0.5">Student Portal</p>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-slate-100 mb-4" />

      {/* User Info */}
      {user && (
        <div className="mx-3 mb-4">
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm border border-blue-200 flex-shrink-0 overflow-hidden">
              {user.avatarUrl
                ? <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                : user.name.charAt(0).toUpperCase()
              }
            </div>
            <div className="overflow-hidden min-w-0">
              <p className="text-[10px] text-slate-400 font-medium">Hello,</p>
              <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">{user.department || 'Student'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Top Nav Items */}
      <div className="px-3 space-y-1 mb-3">
        {topNavItems.map(item => {
          const Icon = item.icon;
          const isActive = currentPath === item.path || (currentPath.startsWith(item.path) && item.path !== '/student/notes');
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`w-full flex items-center px-3 py-2.5 rounded-xl font-medium text-sm transition-all group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
              }`}
            >
              <Icon className={`w-4 h-4 mr-3 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'}`} />
              <span className={isActive ? 'text-white' : 'text-slate-700 group-hover:text-blue-700'}>{item.label}</span>
              {item.badge && item.badge > 0 && !isActive && (
                <span className="ml-auto bg-red-500 text-white text-[9px] font-bold px-1.5 rounded-full">{item.badge}</span>
              )}
            </Link>
          );
        })}
      </div>

      <div className="mx-4 h-px bg-slate-100 mb-3" />

      {/* Accordion Sections */}
      <div className="px-3 space-y-2 flex-1">
        {sections.map(section => {
          const SectionIcon = section.icon;
          const isOpen = openSections[section.id];
          const colors = colorVariants[section.colorClass];
          const hasActiveItem = section.items.some(item => currentPath.startsWith(item.path));

          return (
            <div key={section.id} className={`rounded-xl border overflow-hidden ${hasActiveItem ? colors.border : 'border-slate-200'}`}>
              <button
                onClick={() => toggleSection(section.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors ${isOpen || hasActiveItem ? `${colors.bg}` : 'hover:bg-slate-50'}`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg ${isOpen || hasActiveItem ? colors.iconBg : 'bg-slate-100 text-slate-500'}`}>
                    <SectionIcon className="w-3.5 h-3.5" />
                  </div>
                  <span className={`text-sm font-bold ${isOpen || hasActiveItem ? colors.text : 'text-slate-700'}`}>{section.title}</span>
                </div>
                <div className={`${isOpen || hasActiveItem ? colors.text : 'text-slate-400'}`}>
                  {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </div>
              </button>
              {isOpen && (
                <div className="px-3 pb-2 pt-1 bg-white border-t border-slate-100 space-y-1">
                  {section.items.map(item => {
                    const ItemIcon = item.icon;
                    const isActive = currentPath.startsWith(item.path);
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                          isActive
                            ? `${colors.bg} ${colors.text} font-semibold`
                            : `text-slate-600 ${colors.itemHover}`
                        }`}
                      >
                        <ItemIcon className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Settings + Need Help */}
      <div className="p-3 space-y-2 mt-3">
        <Link
          to="/student/settings"
          className={`w-full flex items-center px-3 py-2.5 rounded-xl font-medium text-sm transition-all group ${
            currentPath === '/student/settings'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
          }`}
        >
          <Settings className={`w-4 h-4 mr-3 flex-shrink-0 ${currentPath === '/student/settings' ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'}`} />
          <span className={currentPath === '/student/settings' ? 'text-white' : 'text-slate-700 group-hover:text-blue-700'}>Settings</span>
        </Link>

        <div className="bg-blue-600 rounded-2xl p-4 relative overflow-hidden hover:bg-blue-700 transition-all cursor-pointer shadow-md shadow-blue-100">
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
