import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { AccordionNav } from './AccordionNav';
import { Bell, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StudentDashboardProps {
  user: User | null;
  plagiarismTokens?: number;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ user }) => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch('/api/announcements');
        const data = await res.json();
        if (data.success && data.data) {
          setAnnouncements(data.data.slice(0, 3));
        }
      } catch {
        // silently fail
      } finally {
        setIsLoadingAnnouncements(false);
      }
    };
    fetchAnnouncements();
  }, []);

  return (
    <div className="space-y-6 pb-16 md:pb-6 font-sans">
      {/* Header Greeting */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-slate-900">Welcome back 👋</h2>
        <p className="text-sm text-slate-500">Here's what's happening in your campus today.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Navigation Accordions */}
        <div className="lg:col-span-2 space-y-4">
          <AccordionNav onSelectItem={(_, itemId) => navigate(`/student/${itemId}`)} />
        </div>

        {/* Right Column: Widgets */}
        <div className="space-y-6">
          {/* Announcements Widget */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                <Bell className="w-4 h-4 text-emerald-500" />
                <span>Announcements</span>
              </div>
              <button className="text-xs text-emerald-600 font-medium hover:underline">View all</button>
            </div>
            <div className="space-y-4">
              {isLoadingAnnouncements ? (
                <div className="text-slate-400 text-xs text-center py-2">Loading...</div>
              ) : announcements.length === 0 ? (
                <div className="text-slate-400 text-xs text-center py-2">No active announcements.</div>
              ) : (
                announcements.map((ann, idx) => (
                  <div key={ann.id} className="relative pl-4 border-l-2 border-emerald-500/30">
                    <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-emerald-500" />
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-semibold text-slate-800 leading-tight">{ann.title}</p>
                      {idx === 0 && (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">New</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(ann.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                ))
              )}
            </div>
            <button className="w-full mt-5 text-left text-xs font-medium text-slate-500 flex justify-between items-center group">
              <span>View all announcements</span>
              <ChevronRight className="w-4 h-4 group-hover:text-slate-800 transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
