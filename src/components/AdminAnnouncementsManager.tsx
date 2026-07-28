import React, { useState } from 'react';
import { PlusCircle, Trash2, Bell, AlertCircle, CheckCircle, X, Image as ImageIcon, Video } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  category: string;
  imageUrl?: string;
  videoUrl?: string;
}

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: '2026/2027 Academic Year Registration & Semester Start Notice',
    content: 'Welcome to the Higher Institute of Human Resource Management (HICM). Online course registrations, CA mark verifications, and student services are now active for all departments.',
    date: 'July 26, 2026',
    category: 'Official Notice',
    imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'ann-2',
    title: 'Welcome & Orientation Address by the Director',
    content: 'Watch the official orientation address detailing academic integrity policies, evaluation timetables, and campus facilities for new and returning students.',
    date: 'July 20, 2026',
    category: 'Campus Life',
  },
  {
    id: 'ann-3',
    title: 'CA Marks Verification & Script Remarking Window',
    content: 'All students are advised to check their continuous assessment marks. Any discrepancies or script review requests must be submitted through the portal Complaints Desk before August 5, 2026.',
    date: 'July 15, 2026',
    category: 'Academic',
  },
];

const CATEGORIES = ['Official Notice', 'Academic', 'Campus Life', 'Student Services', 'Exam', 'Finance'];

export const AdminAnnouncementsManager: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Official Notice');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      title: title.trim(),
      content: content.trim(),
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      category,
      imageUrl: imageUrl.trim() || undefined,
      videoUrl: videoUrl.trim() || undefined,
    };

    setAnnouncements((prev) => [newAnn, ...prev]);
    setTitle('');
    setContent('');
    setCategory('Official Notice');
    setImageUrl('');
    setVideoUrl('');
    setShowForm(false);
    showSuccess('Announcement posted successfully!');
  };

  const handleDelete = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    setDeleteConfirmId(null);
    showSuccess('Announcement deleted.');
  };

  const categoryColors: Record<string, string> = {
    'Official Notice': 'bg-blue-100 text-blue-700 border-blue-200',
    'Academic': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'Campus Life': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Student Services': 'bg-violet-100 text-violet-700 border-violet-200',
    'Exam': 'bg-amber-100 text-amber-700 border-amber-200',
    'Finance': 'bg-red-100 text-red-700 border-red-200',
  };

  const inputCls = "w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all text-sm";
  const labelCls = "block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider";

  return (
    <div className="space-y-5 pb-16 md:pb-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Announcements Manager</h1>
          <p className="text-sm text-slate-500 mt-0.5">Post and manage public campus announcements</p>
        </div>
        <button
          onClick={() => { setShowForm((p) => !p); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${
            showForm
              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
          }`}
        >
          {showForm ? <X className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'New Announcement'}
        </button>
      </div>

      {/* Success Message */}
      {successMsg && (
        <div className="flex items-center gap-2.5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          {successMsg}
        </div>
      )}

      {/* New Announcement Form */}
      {showForm && (
        <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-sm space-y-4"
          style={{ boxShadow: '0 4px 24px -4px rgba(59,130,246,0.10)' }}>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-500" />
            New Announcement
          </h2>
          <form onSubmit={handlePost} className="space-y-4">
            <div>
              <label className={labelCls}>Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Exam Timetable Released"
                className={inputCls}
                required
              />
            </div>

            <div>
              <label className={labelCls}>Content *</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write the full announcement text here..."
                rows={4}
                className={`${inputCls} resize-none`}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}
                  className={inputCls}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Image URL (optional)</label>
                <div className="relative">
                  <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..." className={`${inputCls} pl-10`} />
                </div>
              </div>
            </div>

            <div>
              <label className={labelCls}>Video URL (optional)</label>
              <div className="relative">
                <Video className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://..." className={`${inputCls} pl-10`} />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button type="submit"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors shadow-sm shadow-blue-200 flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Post Announcement
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Announcements List */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
          {announcements.length} announcement{announcements.length !== 1 ? 's' : ''} published
        </p>

        {announcements.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-400 shadow-sm">
            <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No announcements yet. Post one above!</p>
          </div>
        )}

        {announcements.map((ann) => (
          <div key={ann.id}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wide ${categoryColors[ann.category] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                    {ann.category}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">{ann.date}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 leading-snug mb-1">{ann.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{ann.content}</p>
                {(ann.imageUrl || ann.videoUrl) && (
                  <div className="flex items-center gap-3 mt-2">
                    {ann.imageUrl && (
                      <span className="flex items-center gap-1 text-[11px] text-blue-500 font-medium">
                        <ImageIcon className="w-3 h-3" /> Has image
                      </span>
                    )}
                    {ann.videoUrl && (
                      <span className="flex items-center gap-1 text-[11px] text-violet-500 font-medium">
                        <Video className="w-3 h-3" /> Has video
      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Delete button */}
              {deleteConfirmId === ann.id ? (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-red-600 font-semibold">Delete?</span>
                  <button onClick={() => handleDelete(ann.id)}
                    className="px-2.5 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors">
                    Yes
                  </button>
                  <button onClick={() => setDeleteConfirmId(null)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg transition-colors">
                    No
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setDeleteConfirmId(ann.id)}
                  className="p-2 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 flex-shrink-0"
                  title="Delete announcement"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
