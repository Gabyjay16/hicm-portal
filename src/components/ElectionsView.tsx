import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { ArrowLeft, Vote, CheckCircle2, Users, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ElectionsViewProps {
  user: User | null;
}

export const ElectionsView: React.FC<ElectionsViewProps> = ({ user }) => {
  const navigate = useNavigate();
  const [elections, setElections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isVoting, setIsVoting] = useState(false);

  const fetchElections = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/elections?studentId=${user.id}`);
      const data = await res.json();
      if (data.success) {
        setElections(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchElections();
  }, [user]);

  const handleVote = async (electionId: string, candidateId: string) => {
    if (!user) return;
    setIsVoting(true);
    setMessage('');
    
    try {
      const res = await fetch('/api/elections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          electionId,
          candidateId,
          voterId: user.id
        })
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Your vote has been cast successfully.');
        fetchElections();
      } else {
        setMessage(data.error || 'Failed to cast vote.');
      }
    } catch (err) {
      setMessage('Network error occurred.');
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="max-w-4xl w-full mx-auto space-y-6 pb-20 md:pb-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-black hover:text-white text-xs font-semibold px-3 py-2 bg-white border border-slate-200 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-400" />
          <span>Back</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center space-x-3 border-b border-slate-200 pb-4">
          <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <Vote className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-black">Student Elections</h2>
            <p className="text-xs text-black">Participate in campus democratic processes.</p>
          </div>
        </div>

        {message && (
          <div className="p-3 bg-slate-50/80 rounded-xl border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            {message}
          </div>
        )}

        <div className="space-y-6">
          {isLoading ? (
            <div className="text-xs text-black">Loading elections...</div>
          ) : elections.length === 0 ? (
            <div className="text-xs text-black text-center py-8">No active elections at this time.</div>
          ) : (
            elections.map((election) => (
              <div key={election.id} className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-4 bg-white border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-black">{election.title}</h3>
                    <p className="text-[11px] text-black mt-1">{election.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      election.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
                      election.status === 'upcoming' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-slate-100/50 text-black border border-slate-300'
                    }`}>
                      {election.status}
                    </span>
                    {election.hasVoted && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Voted
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {election.candidates && election.candidates.length > 0 ? (
                    election.candidates.map((candidate: any) => (
                      <div key={candidate.id} className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${
                        election.hasVoted 
                          ? 'bg-slate-50/50 border-slate-200 opacity-75' 
                          : 'bg-white border-slate-200 hover:border-purple-500/40 transition-colors'
                      }`}>
                        <div>
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-purple-400" />
                            <h4 className="text-sm font-bold text-black">{candidate.studentName}</h4>
                          </div>
                          <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider mt-1">{candidate.position}</p>
                          {candidate.manifesto && (
                            <p className="text-xs text-black mt-2 line-clamp-3">{candidate.manifesto}</p>
                          )}
                        </div>
                        
                        {!election.hasVoted && election.status === 'active' && (
                          <button
                            onClick={() => handleVote(election.id, candidate.id)}
                            disabled={isVoting}
                            className="w-full py-2 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-black font-bold rounded-lg text-xs transition-colors shadow-sm"
                          >
                            Vote for {candidate.studentName.split(' ')[0]}
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-xs text-black flex items-center justify-center p-4">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      No candidates listed for this election yet.
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
