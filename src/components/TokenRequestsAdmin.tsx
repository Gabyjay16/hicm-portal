import React, { useState, useEffect } from 'react';
import { Coins, CheckCircle2, XCircle, Clock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TokenRequestsAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/tokens');
      const data = await res.json();
      if (data.success) {
        setRequests(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdate = async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch('/api/tokens', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, status })
      });
      const data = await res.json();
      if (data.success) {
        fetchRequests();
      }
    } catch (err) {
      console.error('Failed to update request', err);
    }
  };

  return (
    <div className="space-y-6 pb-16 md:pb-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="flex items-center space-x-2 text-black hover:text-white text-xs font-semibold px-3 py-2 bg-white border border-slate-200 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-blue-400" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md">
        <div className="flex items-center space-x-3 border-b border-slate-200 pb-4 mb-4">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-black">Plagiarism Token Requests</h2>
            <p className="text-xs text-black">Approve or reject student token purchases.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-xs text-black">Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="text-xs text-black text-center py-8">No token requests found.</div>
        ) : (
          <div className="space-y-4">
            {requests.map(req => (
              <div key={req.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-black">{req.studentName} ({req.matriculation})</h4>
                  <p className="text-xs text-black mt-1">Requested: {req.amount} tokens (XAF {req.amountPaid})</p>
                  <p className="text-[10px] text-black mt-1">{new Date(req.createdAt).toLocaleString()}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  {req.status === 'pending' ? (
                    <>
                      <button onClick={() => handleUpdate(req.id, 'approved')} className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded text-xs font-bold transition-colors">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                      <button onClick={() => handleUpdate(req.id, 'rejected')} className="flex items-center space-x-1 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded text-xs font-bold transition-colors">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </>
                  ) : (
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                      req.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {req.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
