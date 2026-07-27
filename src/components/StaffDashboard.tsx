import React, { useState, useEffect } from 'react';
import { FileText, Clock, Users, ArrowRight, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
            evaluationsCount: data.data.evaluationsCount
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
    <div className="space-y-6 pb-16 md:pb-6">
      <div className="bg-navy-800 border border-slate-700/60 rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-offwhite flex items-center gap-2">
            Staff Overview Portal
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your course notes, evaluations, and monitor student progress.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Metric 1 */}
        <div className="bg-navy-800 border border-slate-700/60 rounded-xl p-5 shadow flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Uploaded Notes</p>
            <h3 className="text-3xl font-bold text-offwhite">{isLoading ? '-' : stats.notesCount}</h3>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-navy-800 border border-slate-700/60 rounded-xl p-5 shadow flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Active Evaluations</p>
            <h3 className="text-3xl font-bold text-offwhite">{isLoading ? '-' : stats.evaluationsCount}</h3>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-lg text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>
        
        {/* Metric 3 */}
        <div className="bg-navy-800 border border-slate-700/60 rounded-xl p-5 shadow flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Recent Activity</p>
            <h3 className="text-3xl font-bold text-emerald-400 text-sm mt-2">All Systems Go</h3>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400">
            <Activity className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        {/* Action 1 */}
        <div className="bg-gradient-to-br from-navy-800 to-navy-900 border border-blue-500/30 rounded-2xl p-5 shadow-lg group hover:border-blue-500/60 transition-all">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-offwhite group-hover:text-blue-300">Course Materials</h3>
          </div>
          <p className="text-sm text-slate-400 mb-6 line-clamp-2">Upload and manage lecture notes, slides, and academic resources for your students.</p>
          <button
            onClick={() => navigate('/staff/notes')}
            className="w-full flex items-center justify-center space-x-2 py-2.5 bg-navy-950 border border-slate-700 text-slate-300 rounded-xl hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-colors"
          >
            <span>Manage Notes</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Action 2 */}
        <div className="bg-gradient-to-br from-navy-800 to-navy-900 border border-amber-500/30 rounded-2xl p-5 shadow-lg group hover:border-amber-500/60 transition-all">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-offwhite group-hover:text-amber-300">Evaluations & Quizzes</h3>
          </div>
          <p className="text-sm text-slate-400 mb-6 line-clamp-2">Create timed multiple-choice questions, set durations, and monitor student attempt scores.</p>
          <button
            onClick={() => navigate('/staff/evaluations')}
            className="w-full flex items-center justify-center space-x-2 py-2.5 bg-navy-950 border border-slate-700 text-slate-300 rounded-xl hover:bg-amber-600 hover:text-white hover:border-amber-500 transition-colors"
          >
            <span>Manage Evaluations</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
