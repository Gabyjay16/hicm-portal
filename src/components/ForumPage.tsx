import React, { useState, useEffect } from 'react';
import { GeneralForum } from './GeneralForum';
import { User } from '../types';
import { Users, GraduationCap, Edit2, Save } from 'lucide-react';

interface ForumPageProps {
  currentUser: User | null;
}

export const ForumPage: React.FC<ForumPageProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'department'>('general');
  const [customUsername, setCustomUsername] = useState(currentUser?.customUsername || currentUser?.name || '');
  const [isEditingUsername, setIsEditingUsername] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setCustomUsername(currentUser.customUsername || currentUser.name);
    }
  }, [currentUser]);

  const dept = currentUser?.department || 'General';

  return (
    <div className="max-w-4xl w-full mx-auto space-y-4 pb-20 md:pb-6">
      {/* Username Settings */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Posting as:</span>
          {isEditingUsername ? (
            <input
              type="text"
              value={customUsername}
              onChange={(e) => setCustomUsername(e.target.value)}
              className="px-2 py-1 border rounded text-sm"
            />
          ) : (
            <span className="font-bold text-slate-900">{customUsername}</span>
          )}
        </div>
        <button
          onClick={() => setIsEditingUsername(!isEditingUsername)}
          className="text-slate-500 hover:text-slate-900"
        >
          {isEditingUsername ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
        </button>
      </div>

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
        <GeneralForum currentUser={currentUser} customUsername={customUsername} forumType="general" />
      ) : (
        <GeneralForum currentUser={currentUser} customUsername={customUsername} forumType="department" departmentName={dept} />
      )}
    </div>
  );
};
