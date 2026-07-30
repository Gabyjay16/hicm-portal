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

  const [adminDept, setAdminDept] = useState('Money and Banking');

  const dept = currentUser?.role === 'admin' ? adminDept : (currentUser?.department || 'General');
  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="max-w-4xl w-full mx-auto space-y-4 pb-20 md:pb-6 font-sans">
      {/* Username Settings */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-black">Posting as:</span>
          {isEditingUsername ? (
            <input
              type="text"
              value={customUsername}
              onChange={(e) => setCustomUsername(e.target.value)}
              className="px-2 py-1 border rounded text-base text-black"
            />
          ) : (
            <span className="font-bold text-black">{customUsername}</span>
          )}
        </div>
        <button
          onClick={() => setIsEditingUsername(!isEditingUsername)}
          className="text-black hover:text-blue-600 transition-colors"
        >
          {isEditingUsername ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Tab switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex gap-2 bg-slate-100 p-1 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'general' ? 'bg-white shadow text-black' : 'text-black hover:bg-slate-200'
            }`}
          >
            <Users className="w-4 h-4" /> General Forum
          </button>
          <button
            onClick={() => setActiveTab('department')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'department' ? 'bg-white shadow text-black' : 'text-black hover:bg-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4" /> {isAdmin ? 'Dept Forums' : `${dept} Forum`}
          </button>
        </div>

        {isAdmin && activeTab === 'department' && (
          <select 
            value={adminDept}
            onChange={(e) => setAdminDept(e.target.value)}
            className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-base text-black focus:outline-none focus:border-blue-500 shadow-sm"
          >
            <option value="Money and Banking">Money &amp; Banking</option>
            <option value="Accounting and Finance">Accounting &amp; Finance</option>
            <option value="Organizational Sciences">Org. Sciences</option>
            <option value="Management">Management</option>
            <option value="Insurance and Security">Insurance &amp; Security</option>
            <option value="Marketing">Marketing</option>
          </select>
        )}
      </div>

      {activeTab === 'general' ? (
        <GeneralForum currentUser={currentUser} customUsername={customUsername} forumType="general" />
      ) : (
        <GeneralForum currentUser={currentUser} customUsername={customUsername} forumType="department" departmentName={dept} />
      )}
    </div>
  );
};

