import React, { useState, useEffect } from 'react';
import { Users, FileText, Activity, ArrowRight, ShieldAlert, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalStaff: 0,
    activeComplaints: 0,
    activeEvaluations: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/overview');
        const data = await res.json();
        if (data.success && data.data) {
          setStats(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
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
            Administrator Control Panel
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            System-wide overview, user management, and administrative actions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-navy-800 border border-slate-700/60 rounded-xl p-4 shadow flex flex-col items-center text-center justify-center">
          <div className="p-2.5 bg-blue-500/10 rounded-full text-blue-400 mb-2">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-2xl font-bold text-offwhite">{isLoading ? '-' : stats.totalStudents}</h3>
          <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mt-1">Total Students</p>
        </div>

        {/* Metric 2 */}
        <div className="bg-navy-800 border border-slate-700/60 rounded-xl p-4 shadow flex flex-col items-center text-center justify-center">
          <div className="p-2.5 bg-purple-500/10 rounded-full text-purple-400 mb-2">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-2xl font-bold text-offwhite">{isLoading ? '-' : stats.totalStaff}</h3>
          <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mt-1">Registered Staff</p>
        </div>
        
        {/* Metric 3 */}
        <div className="bg-navy-800 border border-slate-700/60 rounded-xl p-4 shadow flex flex-col items-center text-center justify-center">
          <div className="p-2.5 bg-red-500/10 rounded-full text-red-400 mb-2">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h3 className="text-2xl font-bold text-offwhite">{isLoading ? '-' : stats.activeComplaints}</h3>
          <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mt-1">Active Complaints</p>
        </div>

        {/* Metric 4 */}
        <div className="bg-navy-800 border border-slate-700/60 rounded-xl p-4 shadow flex flex-col items-center text-center justify-center">
          <div className="p-2.5 bg-amber-500/10 rounded-full text-amber-400 mb-2">
            <Activity className="w-5 h-5" />
          </div>
          <h3 className="text-2xl font-bold text-offwhite">{isLoading ? '-' : stats.activeEvaluations}</h3>
          <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mt-1">Live Evaluations</p>
        </div>
      </div>

      {/* Accordion-style Admin Actions */}
      <div className="bg-navy-800 border border-slate-700/60 rounded-2xl p-5 shadow-md">
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 border-b border-slate-700/50 pb-2">
          Administrative Modules
        </h2>
        
        <div className="space-y-3">
          {/* Action Module: User Management */}
          <button 
            onClick={() => navigate('/admin/users')}
            className="w-full flex items-center justify-between p-4 bg-navy-900 border border-slate-700 rounded-xl hover:border-blue-500/50 hover:bg-navy-950 transition-colors group"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-blue-500/10 p-2 rounded-lg text-blue-400">
                <Users className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-bold text-offwhite">User Management</h3>
                <p className="text-xs text-slate-400 mt-0.5">Manage student and staff accounts, issue staff codes.</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
          </button>

          {/* Action Module: Complaints & Reports */}
          <button 
            onClick={() => navigate('/admin/complaints')}
            className="w-full flex items-center justify-between p-4 bg-navy-900 border border-slate-700 rounded-xl hover:border-red-500/50 hover:bg-navy-950 transition-colors group"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-red-500/10 p-2 rounded-lg text-red-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-bold text-offwhite">Complaints Desk</h3>
                <p className="text-xs text-slate-400 mt-0.5">Review and resolve student complaints and issues.</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-red-400 transition-colors" />
          </button>

          {/* Action Module: Content Moderation */}
          <button 
            onClick={() => navigate('/admin/content')}
            className="w-full flex items-center justify-between p-4 bg-navy-900 border border-slate-700 rounded-xl hover:border-emerald-500/50 hover:bg-navy-950 transition-colors group"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-bold text-offwhite">Content & Forum Moderation</h3>
                <p className="text-xs text-slate-400 mt-0.5">Manage announcements, monitor forum, approve payments.</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
          </button>

          {/* Action Module: Token Requests */}
          <button 
            onClick={() => navigate('/admin/tokens')}
            className="w-full flex items-center justify-between p-4 bg-navy-900 border border-slate-700 rounded-xl hover:border-amber-500/50 hover:bg-navy-950 transition-colors group"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-amber-500/10 p-2 rounded-lg text-amber-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-bold text-offwhite">Plagiarism Token Requests</h3>
                <p className="text-xs text-slate-400 mt-0.5">Approve token purchases for student plagiarism tests.</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
          </button>
        </div>
      </div>
    </div>
  );
};
