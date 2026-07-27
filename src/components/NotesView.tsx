import React, { useState } from 'react';
import { NoteItem } from '../types';
import { FileText, Plus, Search, Tag, Share2, Trash2, Eye, BookOpen, User } from 'lucide-react';

const INITIAL_NOTES: NoteItem[] = [
  {
    id: 'n1',
    title: 'Financial Accounting II - Balance Sheet Reconciliation',
    courseCode: 'ACC 301',
    content: 'Comprehensive notes covering adjusting entries, trial balance adjustments, accrued revenue recognition, and asset depreciation calculations.',
    author: 'Jane Doe',
    date: 'July 24, 2026',
    isShared: true,
    tags: ['Accounting', 'Financials', 'Exam Prep'],
  },
  {
    id: 'n2',
    title: 'Strategic Management - Porter’s Five Forces Summary',
    courseCode: 'MGT 305',
    content: 'Analysis of competitive rivalry, threat of new entrants, buyer bargaining power, supplier leverage, and substitute availability in West African markets.',
    author: 'John Doe',
    date: 'July 20, 2026',
    isShared: false,
    tags: ['Management', 'Strategy', 'SWOT'],
  },
  {
    id: 'n3',
    title: 'Management Information Systems - SQL Database Design',
    courseCode: 'MIS 310',
    content: 'ER Diagram design, primary keys, foreign keys, normalization up to 3NF, and basic SQL join queries for student registration system.',
    author: 'Jane Doe',
    date: 'July 18, 2026',
    isShared: true,
    tags: ['Database', 'SQL', 'IT'],
  },
];

export const NotesView: React.FC = () => {
  const [notes, setNotes] = useState<NoteItem[]>(INITIAL_NOTES);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'shared' | 'personal'>('all');
  const [activeNoteModal, setActiveNoteModal] = useState<NoteItem | null>(null);

  // New Note Modal / Form State
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCourseCode, setNewCourseCode] = useState<string>('ACC 301');
  const [newContent, setNewContent] = useState<string>('');
  const [newIsShared, setNewIsShared] = useState<boolean>(true);
  const [newTagsStr, setNewTagsStr] = useState<string>('Accounting, Exam');

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newNote: NoteItem = {
      id: `note-${Date.now()}`,
      title: newTitle.trim(),
      courseCode: newCourseCode.trim() || 'GEN 101',
      content: newContent.trim(),
      author: 'Current Student',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      isShared: newIsShared,
      tags: newTagsStr.split(',').map((t) => t.trim()).filter(Boolean),
    };

    setNotes([newNote, ...notes]);
    setIsCreating(false);
    setNewTitle('');
    setNewContent('');
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (activeNoteModal?.id === id) {
      setActiveNoteModal(null);
    }
  };

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterType === 'shared') return matchesSearch && note.isShared;
    if (filterType === 'personal') return matchesSearch && !note.isShared;
    return matchesSearch;
  });

  return (
    <div className="max-w-4xl w-full mx-auto space-y-6 pb-20 md:pb-6">
      {/* Header Banner */}
      <div className="bg-navy-800 border border-slate-700/60 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-offwhite">Shared & Personal Course Notes</h2>
            <p className="text-xs text-slate-400">
              Access lecture summaries, revision packs, and collaborative course materials.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-navy-900 font-bold rounded-xl text-xs transition-colors shadow flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Create Note</span>
        </button>
      </div>

      {/* Search Bar & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes by title, course code (e.g. ACC 301)..."
            className="w-full bg-navy-800 border border-slate-700/60 rounded-xl pl-9 pr-3 py-2 text-xs text-offwhite focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Filter Toggle Buttons */}
        <div className="flex bg-navy-800 p-1 rounded-xl border border-slate-700/60 text-xs font-semibold">
          {(['all', 'shared', 'personal'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg uppercase tracking-wider text-[10px] font-bold transition-all ${
                filterType === type
                  ? 'bg-emerald-500 text-navy-900 shadow-sm'
                  : 'text-slate-400 hover:text-offwhite'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNotes.map((note) => (
          <div
            key={note.id}
            className="bg-navy-800 border border-slate-700/60 rounded-2xl p-5 shadow-md flex flex-col justify-between space-y-4 hover:border-slate-600 transition-all group"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                  {note.courseCode}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded flex items-center gap-1 ${
                    note.isShared
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                      : 'bg-slate-900 text-slate-400 border border-slate-700'
                  }`}
                >
                  <Share2 className="w-3 h-3" />
                  {note.isShared ? 'Shared' : 'Personal'}
                </span>
              </div>

              <h3 className="text-base font-bold text-offwhite group-hover:text-emerald-300 transition-colors line-clamp-1">
                {note.title}
              </h3>
              <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">{note.content}</p>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-700/50">
              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {note.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] bg-navy-900 text-slate-400 px-2 py-0.5 rounded-md border border-slate-700/50"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Action bar */}
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="text-[11px]">
                  By {note.author} • {note.date}
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setActiveNoteModal(note)}
                    className="p-1.5 text-slate-300 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                    title="View Full Note"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Delete Note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Note View Detail Modal */}
      {activeNoteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-800 border border-slate-700 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
              <div>
                <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30">
                  {activeNoteModal.courseCode}
                </span>
                <h3 className="text-lg font-bold text-offwhite mt-1">{activeNoteModal.title}</h3>
              </div>
              <button
                onClick={() => setActiveNoteModal(null)}
                className="text-slate-400 hover:text-white text-xl font-bold p-1 hover:bg-slate-700/50 rounded-lg"
              >
                ✕
              </button>
            </div>
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>Author: {activeNoteModal.author}</span>
              <span>Date: {activeNoteModal.date}</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed bg-navy-900 p-4 rounded-xl border border-slate-700/50 max-h-60 overflow-y-auto whitespace-pre-wrap font-mono">
              {activeNoteModal.content}
            </p>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveNoteModal(null)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-navy-900 font-bold text-xs rounded-xl transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create New Note Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-800 border border-slate-700 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
              <h3 className="text-lg font-bold text-offwhite">Create Course Note</h3>
              <button
                onClick={() => setIsCreating(false)}
                className="text-slate-400 hover:text-white text-xl font-bold p-1 hover:bg-slate-700/50 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNote} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block text-slate-300 font-medium">Note Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Marketing Research Methods Summary"
                  className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-offwhite focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-300 font-medium">Course Code</label>
                  <input
                    type="text"
                    value={newCourseCode}
                    onChange={(e) => setNewCourseCode(e.target.value)}
                    placeholder="MKT 302"
                    className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-offwhite font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-300 font-medium">Visibility</label>
                  <select
                    value={newIsShared ? 'shared' : 'personal'}
                    onChange={(e) => setNewIsShared(e.target.value === 'shared')}
                    className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-offwhite focus:outline-none focus:border-emerald-500"
                  >
                    <option value="shared">Shared (Public)</option>
                    <option value="personal">Personal (Private)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-300 font-medium">Tags (comma separated)</label>
                <input
                  type="text"
                  value={newTagsStr}
                  onChange={(e) => setNewTagsStr(e.target.value)}
                  placeholder="Marketing, Strategy, Quiz"
                  className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-offwhite focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-300 font-medium">Note Content</label>
                <textarea
                  rows={5}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Write note contents..."
                  className="w-full bg-navy-900 border border-slate-700 rounded-xl p-3 text-offwhite focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 bg-navy-900 border border-slate-700 text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-navy-900 font-bold rounded-xl shadow transition-colors"
                >
                  Publish Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
