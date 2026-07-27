import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, Share2, Trash2, Eye, BookOpen, User, DownloadCloud } from 'lucide-react';

interface NotesViewProps {
  user: any;
}

export const NotesView: React.FC<NotesViewProps> = ({ user }) => {
  const [notes, setNotes] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // New Note Modal / Form State
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCourseCode, setNewCourseCode] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchNotes = async () => {
    try {
      const res = await fetch('/api/notes');
      const data = await res.json();
      if (data.success) {
        setNotes(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCourseCode.trim() || !selectedFile || !user) {
      setErrorMessage('Please fill all fields and select a file.');
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('title', newTitle.trim());
      formData.append('courseCode', newCourseCode.trim().toUpperCase());
      formData.append('lecturerId', user.id);
      formData.append('file', selectedFile);

      const res = await fetch('/api/notes', {
        method: 'POST',
        body: formData
      });
      
      const data = await res.json();
      if (data.success) {
        setIsCreating(false);
        setNewTitle('');
        setNewCourseCode('');
        setSelectedFile(null);
        fetchNotes();
      } else {
        setErrorMessage(data.error || 'Failed to upload note.');
      }
    } catch (err) {
      setErrorMessage('Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.courseCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="max-w-4xl w-full mx-auto space-y-6 pb-20 md:pb-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-black">Shared & Personal Course Notes</h2>
            <p className="text-xs text-black">Access lecture summaries, revision packs, and collaborative course materials.</p>
          </div>
        </div>

        {(user?.role === 'staff' || user?.role === 'admin') && (
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-navy-900 font-bold rounded-xl text-xs transition-colors shadow flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Notes</span>
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-black absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes by title, course code (e.g. ACC 301)..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-black focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-xs text-black text-center py-8">Loading notes...</div>
      ) : filteredNotes.length === 0 ? (
        <div className="text-xs text-black text-center py-8">No notes found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNotes.map((note) => (
            <div key={note.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-md flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all group">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                    {note.courseCode}
                  </span>
                </div>
                <h3 className="text-base font-bold text-black group-hover:text-emerald-300 transition-colors line-clamp-2">
                  {note.title}
                </h3>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between text-xs text-black">
                  <span className="text-[11px]">By {note.authorName} • {new Date(note.createdAt).toLocaleDateString()}</span>
                  <div className="flex items-center space-x-2">
                    <button className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-xs font-bold transition-colors">
                      <DownloadCloud className="w-3.5 h-3.5" />
                      <span>{Math.round(note.fileSize / 1024)} KB</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isCreating && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-black">Upload Course Notes</h3>
              <button
                onClick={() => setIsCreating(false)}
                className="text-black hover:text-white text-xl font-bold p-1 hover:bg-slate-100/50 rounded-lg"
              >
                ✕
              </button>
            </div>

            {errorMessage && <div className="text-xs text-red-400 bg-red-400/10 p-2 rounded">{errorMessage}</div>}

            <form onSubmit={handleCreateNote} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block text-black font-medium">Note Title</label>
                <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="e.g. Marketing Research Methods Summary" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-black focus:outline-none focus:border-emerald-500" required />
              </div>
              <div className="space-y-1">
                <label className="block text-black font-medium">Course Code</label>
                <input type="text" value={newCourseCode} onChange={(e) => setNewCourseCode(e.target.value)} placeholder="MKT 302" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-black font-mono focus:outline-none focus:border-emerald-500" required />
              </div>
              <div className="space-y-1">
                <label className="block text-black font-medium">Document File</label>
                <input type="file" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-black focus:outline-none focus:border-emerald-500" required />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 bg-slate-50 border border-slate-200 text-black font-semibold rounded-xl">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-navy-900 font-bold rounded-xl shadow transition-colors">Upload Note</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
