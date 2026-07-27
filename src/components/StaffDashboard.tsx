import React, { useState, useEffect } from 'react';
import { FileText, Clock, ArrowRight, Activity, HeartHandshake, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Simulated incoming counselling notifications
const MOCK_COUNSELLING_REQUESTS = [
  { id: 'csess-001', displayName: 'Anonymous Student', mode: 'online', requestedAt: '2026-07-27T18:30:00Z' },
  { id: 'csess-002', displayName: 'Paul Nkemdirim', mode: 'in_person', requestedAt: '2026-07-27T19:15:00Z' },
];

export const StaffDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ notesCount: 0, evaluationsCount: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/staff/overview');
        const data = await res.json();
        if (data.success && data.data) {
          setStats({
            notesCount: data.data.notesCount,
            evaluationsCount: data.data.evaluationsCount,
          });
        }
      } catch (error) {
        console.error('Failed to fetch staff stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6 pb-16 md:pb-6 font-sans">

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Staff Overview Portal</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your course notes, evaluations, and monitor student progress.</p>
      </div>

      {/* Counselling Notifications */}
      {MOCK_COUNSELLING_REQUESTS.length > 0 && (
        <div className="bg-white border border-purple-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-3 bg-purple-50 border-b border-purple-100">
            <div className="p-2 bg-purple-100 rounded-xl">
              <HeartHandshake className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-purple-800">Counselling Requests</p>
              <p className="text-xs text-purple-600">Students are waiting for a counsellor.</p>
            </div>
            <span className="px-2 py-0.5 bg-purple-200 text-purple-800 rounded-full text-xs font-bold">
              {MOCK_COUNSELLING_REQUESTS.length} New
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {MOCK_COUNSELLING_REQUESTS.map((req) => (
              <div key={req.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Bell className="w-3.5 h-3.5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{req.displayName}</p>
                    <p className="text-xs text-slate-500 capitalize">
                      {req.mode === 'online' ? '🌐 Online session' : '📍 In-person session'} ·{' '}
                      {new Date(req.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <button className="px-3 py-1.5 bg-purple-500 text-white text-xs font-bold rounded-xl hover:bg-purple-600 transition-colors">
                  Accept
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Uploaded Notes</p>
            <h3 className="text-3xl font-bold text-slate-900">{isLoading ? '-' : stats.notesCount}</h3>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg text-blue-500">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Active Evaluations</p>
            <h3 className="text-3xl font-bold text-slate-900">{isLoading ? '-' : stats.evaluationsCount}</h3>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg text-amber-500">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">System Status</p>
            <h3 className="text-sm font-bold text-emerald-600 mt-2">All Systems Go</h3>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-500">
            <Activity className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-blue-200 rounded-2xl p-5 shadow-sm group hover:border-blue-400 transition-all">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-500 border border-blue-100">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Course Materials</h3>
          </div>
          <p className="text-sm text-slate-500 mb-5">Upload and manage lecture notes, slides, and academic resources for your students.</p>
          <button
            onClick={() => navigate('/staff/notes')}
            className="w-full flex items-center justify-center space-x-2 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors text-sm font-bold"
          >
            <span>Manage Notes</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-white border border-amber-200 rounded-2xl p-5 shadow-sm group hover:border-amber-400 transition-all">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-500 border border-amber-100">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Evaluations & Quizzes</h3>
          </div>
          <p className="text-sm text-slate-500 mb-5">Create timed multiple-choice questions, set durations, and monitor student attempt scores.</p>
          <button
            onClick={() => navigate('/staff/evaluations')}
            className="w-full flex items-center justify-center space-x-2 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors text-sm font-bold"
          >
            <span>Manage Evaluations</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
