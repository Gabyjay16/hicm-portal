import React, { useState } from 'react';
import { GeneralForum } from './GeneralForum';
import { User } from '../types';
import { Users, GraduationCap } from 'lucide-react';

interface ForumPageProps {
  currentUser: User | null;
}

export const ForumPage: React.FC<ForumPageProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'department'>('general');

  const dept = currentUser?.department || 'General';

  return (
    <div className="max-w-4xl w-full mx-auto space-y-4 pb-20 md:pb-6">
      {/* Tab switcher */}
      <div className="flex gap-2 bg-slate-100 p-1 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'general' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Users className="w-4 h-4" /> General Forum
        </button>
        <button
          onClick={() => setActiveTab('department')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'department' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <GraduationCap className="w-4 h-4" /> {dept} Forum
        </button>
      </div>

      {activeTab === 'general' ? (
        <GeneralForum currentUser={currentUser} forumType="general" />
      ) : (
        <GeneralForum currentUser={currentUser} forumType="department" departmentName={dept} />
      )}
    </div>
  );
};
