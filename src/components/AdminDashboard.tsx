import React, { useState, useEffect } from 'react';
import { Users, FileText, Activity, ArrowRight, ShieldAlert, BookOpen, CheckCircle, XCircle, Clock, Search, ChevronDown, ChevronUp, Settings, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

// Simulated staff pending forum approval list
const MOCK_PENDING_STAFF = [
  { id: 'stf-001', name: 'Dr. Samuel Ngwa', department: 'Business Administration', code: 'STF-123', requestedAt: '2026-07-25' },
  { id: 'stf-002', name: 'Prof. Amina Bello', department: 'Human Resources', code: 'STF-456', requestedAt: '2026-07-26' },
];

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalStaff: 0,
    activeComplaints: 0,
    activeEvaluations: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [pendingStaff, setPendingStaff] = useState(MOCK_PENDING_STAFF);
  const [showForumApprovals, setShowForumApprovals] = useState(false);
  const [approvedIds, setApprovedIds] = useState<string[]>([]);
  const [rejectedIds, setRejectedIds] = useState<string[]>([]);

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

  const handleApprove = (id: string) => {
    setApprovedIds((p) => [...p, id]);
    setRejectedIds((p) => p.filter((i) => i !== id));
  };

  const handleReject = (id: string) => {
    setRejectedIds((p) => [...p, id]);
    setApprovedIds((p) => p.filter((i) => i !== id));
  };

  const pendingCount = pendingStaff.filter(
    (s) => !approvedIds.includes(s.id) && !rejectedIds.includes(s.id)
  ).length;

  return (
    <div className="space-y-6 pb-16 md:pb-6 font-sans">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-black">Administrator Control Panel</h1>
        <p className="text-sm text-black mt-1">System-wide overview, user management, and administrative actions.</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col items-center text-center">
          <div className="p-2.5 bg-blue-50 rounded-full text-blue-500 mb-2">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-2xl font-bold text-black">{isLoading ? '-' : stats.totalStudents}</h3>
          <p className="text-black text-[10px] font-semibold uppercase tracking-wider mt-1">Total Students</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col items-center text-center">
          <div className="p-2.5 bg-purple-50 rounded-full text-purple-500 mb-2">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-2xl font-bold text-black">{isLoading ? '-' : stats.totalStaff}</h3>
          <p className="text-black text-[10px] font-semibold uppercase tracking-wider mt-1">Registered Staff</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col items-center text-center">
          <div className="p-2.5 bg-red-50 rounded-full text-red-500 mb-2">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h3 className="text-2xl font-bold text-black">{isLoading ? '-' : stats.activeComplaints}</h3>
          <p className="text-black text-[10px] font-semibold uppercase tracking-wider mt-1">Active Complaints</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col items-center text-center">
          <div className="p-2.5 bg-amber-50 rounded-full text-amber-500 mb-2">
            <Activity className="w-5 h-5" />
          </div>
          <h3 className="text-2xl font-bold text-black">{isLoading ? '-' : stats.activeEvaluations}</h3>
          <p className="text-black text-[10px] font-semibold uppercase tracking-wider mt-1">Live Evaluations</p>
        </div>
      </div>

      {/* Forum Approvals Panel */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <button
          onClick={() => setShowForumApprovals((p) => !p)}
          className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="bg-emerald-50 p-2 rounded-lg">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-bold text-black">Forum Access Approvals</h3>
              <p className="text-xs text-black">Approve or reject staff forum posting access</p>
            </div>
            {pendingCount > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600">{pendingCount} pending</span>
            )}
          </div>
          {showForumApprovals ? <ChevronUp className="w-4 h-4 text-black" /> : <ChevronDown className="w-4 h-4 text-black" />}
        </button>

        {showForumApprovals && (
          <div className="border-t border-slate-100 divide-y divide-slate-100">
            {pendingStaff.length === 0 ? (
              <p className="p-5 text-xs text-black text-center">No pending forum access requests.</p>
            ) : (
              pendingStaff.map((staff) => {
                const isApproved = approvedIds.includes(staff.id);
                const isRejected = rejectedIds.includes(staff.id);
                return (
                  <div key={staff.id} className="flex items-center justify-between p-4 hover:bg-slate-50">
                    <div>
                      <p className="text-sm font-bold text-black">{staff.name}</p>
                      <p className="text-xs text-black">{staff.department} · {staff.code}</p>
                      <p className="text-[10px] text-black flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" /> Requested {staff.requestedAt}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isApproved ? (
                        <span className="flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                          <CheckCircle className="w-3 h-3" /> Approved
                        </span>
                      ) : isRejected ? (
                        <span className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-bold">
                          <XCircle className="w-3 h-3" /> Rejected
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={() => handleApprove(staff.id)}
                            className="px-3 py-1.5 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-colors"
                          >Approve</button>
                          <button
                            onClick={() => handleReject(staff.id)}
                            className="px-3 py-1.5 bg-red-100 text-red-600 rounded-xl text-xs font-bold hover:bg-red-200 transition-colors"
                          >Reject</button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Admin Modules */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <h2 className="text-sm font-bold text-black uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
          Administrative Modules
        </h2>

        <div className="space-y-3">
          <Link
            to="/admin/users"
            className="w-full flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-colors group"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Users className="w-5 h-5" /></div>
              <div className="text-left">
                <h3 className="text-sm font-bold text-black">User Management</h3>
                <p className="text-xs text-black mt-0.5">View all students and staff registered on the platform.</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-black group-hover:text-blue-500 transition-colors" />
          </Link>

          <Link
            to="/admin/complaints"
            className="w-full flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-red-400 hover:bg-red-50 transition-colors group"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-red-100 p-2 rounded-lg text-red-600"><ShieldAlert className="w-5 h-5" /></div>
              <div className="text-left">
                <h3 className="text-sm font-bold text-black">Complaints Desk</h3>
                <p className="text-xs text-black mt-0.5">Review and resolve student complaints and requests.</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-black group-hover:text-red-500 transition-colors" />
          </Link>

          <Link
            to="/admin/complaint-fields"
            className="w-full flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-colors group"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-purple-100 p-2 rounded-lg text-purple-600"><FileText className="w-5 h-5" /></div>
              <div className="text-left">
                <h3 className="text-sm font-bold text-black">Complaint Form Editor</h3>
                <p className="text-xs text-black mt-0.5">Add or remove fields from complaint form types.</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-black group-hover:text-purple-500 transition-colors" />
          </Link>

          <Link
            to="/admin/content"
            className="w-full flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-emerald-400 hover:bg-emerald-50 transition-colors group"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600"><BookOpen className="w-5 h-5" /></div>
              <div className="text-left">
                <h3 className="text-sm font-bold text-black">Content & Forum Moderation</h3>
                <p className="text-xs text-black mt-0.5">Manage announcements and monitor forum activity.</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-black group-hover:text-emerald-500 transition-colors" />
          </Link>

          <Link
            to="/admin/tokens"
            className="w-full flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-amber-400 hover:bg-amber-50 transition-colors group"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-amber-100 p-2 rounded-lg text-amber-600"><BookOpen className="w-5 h-5" /></div>
              <div className="text-left">
                <h3 className="text-sm font-bold text-black">Plagiarism Token Requests</h3>
                <p className="text-xs text-black mt-0.5">Approve token purchases for student plagiarism tests.</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-black group-hover:text-amber-500 transition-colors" />
          </Link>

          <Link
            to="/admin/settings"
            className="w-full flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-400 hover:bg-slate-100 transition-colors group"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-slate-200 p-2 rounded-lg text-black"><Settings className="w-5 h-5" /></div>
              <div className="text-left">
                <h3 className="text-sm font-bold text-black">System Settings</h3>
                <p className="text-xs text-black mt-0.5">Configure payment info and matricule verification rules.</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-black group-hover:text-black transition-colors" />
          </Link>
        </div>
      </div>
    </div>
  );
};

// Inline icon since lucide doesn't export MessageSquare separately as MessageSquareIcon
const MessageSquareIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
