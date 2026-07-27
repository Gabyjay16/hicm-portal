import React, { useState } from 'react';
import { AlertItem } from '../types';
import { Bell, AlertTriangle, Calendar, Info, CheckCircle2, Filter, ShieldAlert } from 'lucide-react';

const SAMPLE_ALERTS: AlertItem[] = [
  {
    id: 'a1',
    title: 'Semester End Examination Timetable Released',
    category: 'academic',
    priority: 'high',
    date: 'July 26, 2026',
    content: 'The official timetable for HICM Second Semester Final Examinations has been uploaded to the student portal. All students are advised to confirm hall allocations by Friday.',
    isRead: false,
  },
  {
    id: 'a2',
    title: 'Emergency Maintenance Notice: E-Library Portal',
    category: 'emergency',
    priority: 'high',
    date: 'July 25, 2026',
    content: 'Scheduled database server maintenance will occur this Saturday between 02:00 AM and 06:00 AM. E-library search will be briefly unavailable.',
    isRead: false,
  },
  {
    id: 'a3',
    title: 'Annual HICM Innovation & Entrepreneurship Summit',
    category: 'event',
    priority: 'medium',
    date: 'July 24, 2026',
    content: 'Join us for the 2026 HICM Business Innovation Challenge in Main Auditorium. Guest speakers include regional industry leaders and alumni founders.',
    isRead: true,
  },
  {
    id: 'a4',
    title: 'Plagiarism Token Allocation Update for Level 300 & 400',
    category: 'academic',
    priority: 'low',
    date: 'July 22, 2026',
    content: 'All final year and third year students have been credited with complimentary plagiarism test tokens for project dissertation submissions.',
    isRead: true,
  },
];

export const AlertsView: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>(SAMPLE_ALERTS);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const toggleReadStatus = (id: string) => {
    setAlerts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRead: !item.isRead } : item))
    );
  };

  const filteredAlerts =
    activeCategory === 'all'
      ? alerts
      : alerts.filter((item) => item.category === activeCategory);

  return (
    <div className="max-w-4xl w-full mx-auto space-y-6 pb-20 md:pb-6">
      {/* Header Banner */}
      <div className="bg-navy-800 border border-slate-700/60 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-offwhite">Campus Alerts & Official Notices</h2>
            <p className="text-xs text-slate-400">
              Emergency broadcasts, academic deadlines, and official announcements.
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-400 bg-navy-900 px-3 py-1.5 rounded-xl border border-slate-700/50 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>
            {alerts.filter((a) => !a.isRead).length} Unread Broadcasts
          </span>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs font-semibold">
        <span className="text-slate-400 flex items-center gap-1 pl-1">
          <Filter className="w-3.5 h-3.5" /> Filter:
        </span>
        {['all', 'academic', 'emergency', 'event'].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-xl uppercase tracking-wider text-[11px] font-bold transition-all ${
              activeCategory === cat
                ? 'bg-emerald-500 text-navy-900 shadow-sm'
                : 'bg-navy-800 text-slate-300 hover:bg-slate-700 border border-slate-700/50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => {
          const isHigh = alert.priority === 'high';
          const isEmergency = alert.category === 'emergency';

          return (
            <div
              key={alert.id}
              className={`p-5 rounded-2xl border transition-all shadow-sm space-y-3 ${
                !alert.isRead
                  ? 'bg-navy-800/95 border-emerald-500/40 shadow-emerald-500/5'
                  : 'bg-navy-900/80 border-slate-700/50 text-slate-300 opacity-90'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start space-x-3">
                  <div
                    className={`p-2.5 rounded-xl flex-shrink-0 mt-0.5 ${
                      isEmergency
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : isHigh
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {isEmergency ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : isHigh ? (
                      <ShieldAlert className="w-5 h-5" />
                    ) : (
                      <Info className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700">
                        {alert.category}
                      </span>
                      {isHigh && (
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                          Priority High
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-offwhite mt-1">{alert.title}</h3>
                  </div>
                </div>

                <button
                  onClick={() => toggleReadStatus(alert.id)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 ${
                    alert.isRead
                      ? 'bg-navy-900 text-slate-400 border-slate-700 hover:text-white'
                      : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{alert.isRead ? 'Mark Unread' : 'Mark Read'}</span>
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed pl-12">{alert.content}</p>

              <div className="pt-2 pl-12 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-700/40">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Posted {alert.date}
                </span>
                <span className="text-emerald-400 font-medium">HICM Administration</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
