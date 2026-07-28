import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, Search, ChevronRight, User as UserIcon } from 'lucide-react';

// Mock data for voting requests
const MOCK_REQUESTS = [
  { id: 'req1', name: 'John Doe', matricule: 'UBa26C0001', position: 'president', pitch: 'I will fight for better internet on campus.', status: 'pending', date: '2026-07-28' },
  { id: 'req2', name: 'Sarah Connor', matricule: 'UBa26C0002', position: 'social', pitch: 'More parties and networking events!', status: 'pending', date: '2026-07-28' },
];

export const AdminElections: React.FC = () => {
  const [requests, setRequests] = useState(MOCK_REQUESTS);

  const handleApprove = (id: string) => {
    setRequests(prev => prev.map(req => req.id === id ? { ...req, status: 'approved' } : req));
  };

  const handleReject = (id: string) => {
    setRequests(prev => prev.map(req => req.id === id ? { ...req, status: 'rejected' } : req));
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const approvedRequests = requests.filter(r => r.status === 'approved');

  return (
    <div className="space-y-6 pb-16 md:pb-6 font-sans">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-black">Elections & Voting Admin</h1>
        <p className="text-sm text-black mt-1">Manage student voting requests and monitor election status.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h2 className="text-sm font-bold text-black uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
              Pending Voting Requests ({pendingRequests.length})
            </h2>
            <div className="space-y-4">
              {pendingRequests.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-6">No pending voting requests.</p>
              ) : (
                pendingRequests.map(req => (
                  <div key={req.id} className="border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between bg-slate-50">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        <h3 className="font-bold text-black">{req.name}</h3>
                        <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">{req.matricule}</span>
                      </div>
                      <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">
                        Position: {req.position.replace('-', ' ')}
                      </p>
                      <p className="text-sm text-slate-700 italic border-l-2 border-blue-200 pl-3 py-1">
                        "{req.pitch}"
                      </p>
                      <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Submitted: {req.date}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-4 md:mt-0 flex-shrink-0">
                      <button 
                        onClick={() => handleApprove(req.id)}
                        className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 flex items-center gap-1 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" /> Approve
                      </button>
                      <button 
                        onClick={() => handleReject(req.id)}
                        className="px-4 py-2 bg-red-100 text-red-600 text-xs font-bold rounded-xl hover:bg-red-200 flex items-center gap-1 transition-colors"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h2 className="text-sm font-bold text-black uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
              Approved Candidates
            </h2>
            <div className="space-y-3">
              {approvedRequests.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">No candidates approved yet.</p>
              ) : (
                approvedRequests.map(req => (
                  <div key={req.id} className="flex items-center justify-between p-3 border border-slate-100 bg-emerald-50/50 rounded-xl">
                    <div>
                      <p className="font-bold text-black text-sm">{req.name}</p>
                      <p className="text-[10px] uppercase text-emerald-700 font-semibold">{req.position.replace('-', ' ')}</p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 shadow-sm">
            <h2 className="text-sm font-bold text-blue-900 mb-2">Election Controls</h2>
            <p className="text-xs text-blue-800 mb-4">Toggle live election visibility for students.</p>
            <div className="space-y-2">
              <button className="w-full py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-colors">
                Publish Candidates to Ballot
              </button>
              <button className="w-full py-2.5 bg-white border border-blue-200 text-blue-700 font-bold text-sm rounded-xl hover:bg-blue-50 transition-colors">
                Show Live Results
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
