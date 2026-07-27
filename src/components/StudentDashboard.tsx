import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { AccordionNav } from './AccordionNav';
import { Bell, MapPin, ChevronRight, Clock, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StudentDashboardProps {
  user: User | null;
  plagiarismTokens: number;
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
      } catch (err) {
        console.error('Failed to fetch announcements:', err);
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
          <AccordionNav
            onSelectItem={(_, itemId) => navigate(`/student/${itemId}`)}
          />
        </div>

        {/* Right Column: Widgets */}
        <div className="space-y-6">

          {/* Recent Announcements Widget */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
                <Bell className="w-4 h-4 text-emerald-500" />
                <span>Recent Announcements</span>
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
                    <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-emerald-500"></div>
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

          {/* Upcoming Evaluation Widget */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>Upcoming Evaluation</span>
              </div>
              <button
                onClick={() => navigate('/student/evaluation')}
                className="text-xs text-emerald-600 font-medium hover:underline"
              >View all</button>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-[10px] font-bold text-slate-500 uppercase">May</span>
                <span className="text-lg font-extrabold text-slate-800 leading-tight">20</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Mon</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800">Principles of Management</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Mid-Term Examination</p>
                <div className="flex items-center space-x-3 mt-2 text-[11px] text-slate-500">
                  <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> 10:00 AM - 12:00 PM</span>
                  <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" /> Room 101</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-emerald-600">2</p>
                <p className="text-[10px] text-slate-500">days left</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
