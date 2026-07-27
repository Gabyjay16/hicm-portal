import React, { useState } from 'react';
import { ForumMessage, User } from '../types';
import { MessageSquare, AlertTriangle, Send, ShieldAlert } from 'lucide-react';
import { checkForForbiddenLinks } from '../utils/urlValidator';

interface GeneralForumProps {
  currentUser: User | null;
  messages: ForumMessage[];
  onSendMessage: (text: string) => void;
}

export const GeneralForum: React.FC<GeneralForumProps> = ({
  currentUser,
  messages,
  onSendMessage,
}) => {
  const [inputText, setInputText] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const textToSubmit = inputText.trim();
    if (!textToSubmit) return;

    // Check for web links using urlValidator utility
    if (checkForForbiddenLinks(textToSubmit)) {
      setErrorMessage('Web links are strictly forbidden.');
      return;
    }

    onSendMessage(textToSubmit);
    setInputText('');
  };

  return (
    <div className="max-w-4xl w-full mx-auto space-y-6 pb-20 md:pb-6">
      {/* Prominent Warning Banner */}
      <div className="bg-red-500/15 border-2 border-red-500/50 rounded-2xl p-4 shadow-lg flex items-center space-x-3">
        <div className="p-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 flex-shrink-0 animate-pulse">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-red-400 uppercase tracking-wider">
            Academic Forum Security Rule
          </h3>
          <p className="text-xs text-red-200 font-semibold mt-0.5">
            "Web links are strictly forbidden."
          </p>
          <p className="text-[11px] text-slate-400">
            Posts containing HTTP/HTTPS links, domain extensions (.com, .org, .edu), or www prefixes will be automatically blocked.
          </p>
        </div>
      </div>

      {/* Main Forum Feed & Input Container */}
      <div className="bg-navy-800 border border-slate-700/60 rounded-2xl shadow-xl overflow-hidden flex flex-col h-[550px]">
        {/* Header */}
        <div className="p-4 bg-navy-900 border-b border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-offwhite">HICM Student & Staff General Forum</h2>
              <p className="text-xs text-slate-400">Moderated discussion wall for academic inquiries.</p>
            </div>
          </div>
          <span className="text-xs text-emerald-400 font-mono font-bold bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
            {messages.length} Messages
          </span>
        </div>

        {/* Error Notification Alert */}
        {errorMessage && (
          <div className="p-3 bg-red-500/20 border-b border-red-500/40 text-red-400 text-xs font-bold flex items-center justify-between px-4 animate-in slide-in-from-top duration-200">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage('')}
              className="text-red-400 hover:text-white font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Chronological Chat Feed */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-navy-900/50">
          {messages.map((msg) => {
            const isStaff = msg.role === 'staff';
            const isMe = currentUser && currentUser.name === msg.author;

            return (
              <div
                key={msg.id}
                className={`flex space-x-3 ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-lg rounded-2xl p-4 space-y-1.5 shadow-sm border ${
                    isMe
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-slate-100 ml-auto'
                      : isStaff
                      ? 'bg-amber-500/10 border-amber-500/30 text-slate-100'
                      : 'bg-navy-800 border-slate-700/60 text-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 border-b border-slate-700/40 pb-1 text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-offwhite">{msg.author}</span>
                      <span
                        className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded border ${
                          isStaff
                            ? 'bg-amber-400/20 text-amber-300 border-amber-400/30'
                            : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        {msg.role}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{msg.timestamp}</span>
                  </div>

                  <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Post Message Input Bar */}
        <form onSubmit={handleSubmit} className="p-3 bg-navy-900 border-t border-slate-700/60 flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              if (errorMessage) setErrorMessage('');
            }}
            placeholder={
              currentUser
                ? `Posting as ${currentUser.name}... (Remember: Web links strictly forbidden!)`
                : 'Type your academic query... (Web links strictly forbidden!)'
            }
            className="flex-1 bg-navy-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-offwhite focus:outline-none focus:border-emerald-500 placeholder:text-slate-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-navy-900 font-bold rounded-xl text-xs transition-colors shadow flex items-center space-x-1.5"
          >
            <span>Post</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
