import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { ArrowLeft, MessageSquare, AlertCircle, CheckCircle, Clock, Send, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ComplaintsDeskProps {
  user: User | null;
}

export const ComplaintsDesk: React.FC<ComplaintsDeskProps> = ({ user }) => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('academic');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const fetchComplaints = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/complaints?studentId=${user.id}`);
      const data = await res.json();
      if (data.success) {
        setComplaints(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (!subject.trim() || !description.trim()) {
      setMessage('Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: user.id,
          subject,
          category,
          description
        })
      });
      const data = await res.json();
      if (data.success) {
        setSubject('');
        setDescription('');
        setMessage('Complaint submitted successfully.');
        fetchComplaints();
      } else {
        setMessage(data.error || 'Failed to submit complaint.');
      }
    } catch (err) {
      setMessage('Network error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'resolved': return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'closed': return <CheckCircle className="w-4 h-4 text-slate-400" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-amber-400" />;
      default: return <AlertCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'resolved': return 'Resolved';
      case 'closed': return 'Closed';
      case 'in_progress': return 'In Progress';
      default: return 'Pending';
    }
  };

  return (
    <div className="max-w-4xl w-full mx-auto space-y-6 pb-20 md:pb-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-slate-300 hover:text-white text-xs font-semibold px-3 py-2 bg-navy-800 border border-slate-700/60 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-400" />
          <span>Back</span>
        </button>
      </div>

      <div className="bg-navy-800 border border-slate-700/60 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center space-x-3 border-b border-slate-700/60 pb-4">
          <div className="p-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-offwhite">Complaints Desk</h2>
            <p className="text-xs text-slate-400">Submit official grievances or requests to administration.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-offwhite border-b border-slate-700/60 pb-2">New Complaint</h3>
            {message && (
              <div className="p-3 bg-navy-900/80 rounded-xl border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                {message}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-navy-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-offwhite focus:outline-none focus:border-emerald-500"
                >
                  <option value="academic">Academic & Grading</option>
                  <option value="financial">Financial & Fees</option>
                  <option value="harassment">Harassment & Disciplinary</option>
                  <option value="infrastructure">Infrastructure & Facilities</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief title of your complaint"
                  className="w-full bg-navy-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-offwhite focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide detailed information..."
                  rows={4}
                  className="w-full bg-navy-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-offwhite focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !user}
                className="w-full flex items-center justify-center space-x-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors shadow"
              >
                <span>{isSubmitting ? 'Submitting...' : 'Submit Complaint'}</span>
                {!isSubmitting && <Send className="w-3.5 h-3.5" />}
              </button>
            </form>
          </div>

          {/* History Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-offwhite border-b border-slate-700/60 pb-2">Your History</h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {isLoading ? (
                <div className="text-xs text-slate-400">Loading history...</div>
              ) : complaints.length === 0 ? (
                <div className="text-xs text-slate-400 text-center py-8">No previous complaints found.</div>
              ) : (
                complaints.map((comp) => (
                  <div key={comp.id} className="bg-navy-900/80 p-4 rounded-xl border border-slate-700/50 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-xs font-bold text-offwhite">{comp.subject}</h4>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider">{comp.category}</span>
                      </div>
                      <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-navy-800 border border-slate-700 text-[10px] font-semibold text-slate-300">
                        {getStatusIcon(comp.status)}
                        <span>{getStatusText(comp.status)}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-2">{comp.description}</p>
                    
                    {comp.adminResponse && (
                      <div className="mt-3 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase mb-1 block">Admin Response</span>
                        <p className="text-xs text-emerald-200/80 leading-relaxed">{comp.adminResponse}</p>
                      </div>
                    )}
                    
                    <div className="text-[10px] text-slate-500 text-right pt-2 border-t border-slate-700/30">
                      {new Date(comp.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
