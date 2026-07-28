import React, { useState } from 'react';
import { User } from '../types';
import { FileText, UserPlus, ChevronRight, ArrowLeft } from 'lucide-react';
import { RequestDocuments } from './RequestDocuments';
import { VotingRequestForm } from './VotingRequestForm';

interface RequestsHubProps {
  user: User | null;
}

export const RequestsHub: React.FC<RequestsHubProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'hub' | 'documents' | 'voting'>('hub');

  if (activeTab === 'documents') {
    return (
      <div className="space-y-4">
        <button 
          onClick={() => setActiveTab('hub')}
          className="flex items-center text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Requests
        </button>
        <RequestDocuments user={user} />
      </div>
    );
  }

  if (activeTab === 'voting') {
    return (
      <div className="space-y-4">
        <button 
          onClick={() => setActiveTab('hub')}
          className="flex items-center text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Requests
        </button>
        <VotingRequestForm user={user} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight dark:text-white">Student Requests</h2>
        <p className="text-slate-500 text-sm mt-1 dark:text-slate-400">Select the type of request you want to make.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Request Documents */}
        <div 
          onClick={() => setActiveTab('documents')}
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-start justify-between">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-xl text-blue-600 dark:text-blue-400">
              <FileText className="w-6 h-6" />
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-4">Request Document</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Request transcripts, attestations, or other official university documents.</p>
        </div>

        {/* Request Voting Poll */}
        <div 
          onClick={() => {
            if (user?.hasVotingPermit) {
              setActiveTab('voting');
            } else {
              alert('You do not have the required permit to apply for elections. Please contact the administrator.');
            }
          }}
          className={`border rounded-2xl p-6 transition-all group ${
            user?.hasVotingPermit 
              ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 cursor-pointer hover:border-violet-300 hover:shadow-md'
              : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-60 cursor-not-allowed'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className={`p-3 rounded-xl ${user?.hasVotingPermit ? 'bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
              <UserPlus className="w-6 h-6" />
            </div>
            {user?.hasVotingPermit && <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-violet-500 transition-colors" />}
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-4">Voting Poll Application</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Submit a request to be placed on the student election voting poll.</p>
          {!user?.hasVotingPermit && (
            <p className="text-xs text-rose-500 font-bold mt-3 border border-rose-500/20 bg-rose-500/10 px-2 py-1 rounded inline-block">
              Permit Required
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
