import React, { useState } from 'react';
import { User, DocumentRequest, CounsellingSession } from '../types';
import {
  ArrowLeft, FileText, GraduationCap, BookOpen, FileCheck,
  HeartHandshake, Eye, EyeOff, Users, Wifi, MapPin,
  CheckCircle, Clock, ChevronRight, Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CounsellingForum } from './CounsellingForum';

interface RequestDocumentsProps {
  user: User | null;
}

type DocumentType = 'attestation' | 'attendance' | 'admission';
type ServiceType = 'document' | 'counselling';

const documentTypes = [
  {
    type: 'attestation' as DocumentType,
    label: 'Attestation of Completion of Studies',
    icon: GraduationCap,
    description: 'Official letter confirming you have completed your studies.',
    processingDays: '3-5 business days',
  },
  {
    type: 'attendance' as DocumentType,
    label: 'School Attendance Letter',
    icon: BookOpen,
    description: 'Letter confirming your enrolment and attendance at HICM.',
    processingDays: '1-2 business days',
  },
  {
    type: 'admission' as DocumentType,
    label: 'Admission Letter',
    icon: FileCheck,
    description: 'Copy of your original admission letter from the institute.',
    processingDays: '2-3 business days',
  },
];

const statusBadge = (status: DocumentRequest['status']) => {
  const map: Record<DocumentRequest['status'], { label: string; cls: string }> = {
    pending: { label: 'Pending', cls: 'bg-amber-100 text-amber-700' },
    processing: { label: 'Processing', cls: 'bg-blue-100 text-blue-700' },
    ready: { label: 'Ready for Collection', cls: 'bg-emerald-100 text-emerald-700' },
    collected: { label: 'Collected', cls: 'bg-slate-100 text-black' },
  };
  const { label, cls } = map[status];
  return <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${cls}`}>{label}</span>;
};

export const RequestDocuments: React.FC<RequestDocumentsProps> = ({ user }) => {
  const navigate = useNavigate();
  const [view, setView] = useState<'menu' | 'document' | 'counselling' | 'counselling-chat'>('menu');
  const [selectedDocType, setSelectedDocType] = useState<DocumentType | null>(null);
  const [docNotes, setDocNotes] = useState('');
  const [docRequests, setDocRequests] = useState<DocumentRequest[]>([]);
  const [submitted, setSubmitted] = useState(false);

  // Counselling state
  const [counselMode, setCounselMode] = useState<'online' | 'in_person'>('online');
  const [revealIdentity, setRevealIdentity] = useState(true);
  const [activeSessions, setActiveSessions] = useState<CounsellingSession[]>([]);
  const [activeSession, setActiveSession] = useState<CounsellingSession | null>(null);
  const [counselSubmitted, setCounselSubmitted] = useState(false);

  const handleDocRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocType || !user) return;
    const newReq: DocumentRequest = {
      id: `doc-${Date.now()}`,
      studentId: user.id,
      studentName: user.name,
      documentType: selectedDocType,
      status: 'pending',
      requestDate: new Date().toISOString(),
      notes: docNotes,
    };
    setDocRequests((prev) => [newReq, ...prev]);
    setSubmitted(true);
    setDocNotes('');
    setSelectedDocType(null);
  };

  const handleCounselRequest = () => {
    if (!user) return;
    const session: CounsellingSession = {
      id: `csess-${Date.now()}`,
      studentId: user.id,
      studentName: user.name,
      isAnonymous: !revealIdentity,
      mode: counselMode,
      status: 'pending',
      createdAt: new Date().toISOString(),
      messages: [
        {
          id: 'sys-1',
          author: 'System',
          role: 'staff',
          text: `Your counselling session has been created. A counsellor will be assigned shortly. Mode: ${counselMode === 'online' ? 'Online' : 'In-Person'}. Identity: ${revealIdentity ? 'Revealed' : 'Anonymous'}.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    };
    setActiveSessions((prev) => [session, ...prev]);
    setActiveSession(session);
    setCounselSubmitted(true);
    setView('counselling-chat');
  };

  // ─── Counselling Chat ─────────────────────────────────────────────────────
  if (view === 'counselling-chat' && activeSession) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 pb-16">
        <button
          onClick={() => { setView('counselling'); setActiveSession(null); }}
          className="flex items-center gap-2 text-xs text-black hover:text-black font-semibold px-3 py-2 bg-white border border-slate-200 rounded-xl shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-500" /> Back to Counselling
        </button>
        <CounsellingForum
          currentUser={user}
          session={activeSession}
          onClose={() => { setView('counselling'); setActiveSession(null); }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl w-full mx-auto space-y-6 pb-20 md:pb-6">
      {/* Back */}
      <button
        onClick={() => view === 'menu' ? navigate(-1) : setView('menu')}
        className="flex items-center gap-2 text-xs text-black hover:text-black font-semibold px-3 py-2 bg-white border border-slate-200 rounded-xl shadow-sm"
      >
        <ArrowLeft className="w-4 h-4 text-emerald-500" />
        {view === 'menu' ? 'Back' : 'Back to Services'}
      </button>

      {/* ─── MENU ─────────────────────────────────────────────────────────── */}
      {view === 'menu' && (
        <>
          <div>
            <h2 className="text-2xl font-bold text-black">Student Services</h2>
            <p className="text-sm text-black mt-1">Request official documents or connect with a counsellor.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Request Document Card */}
            <button
              onClick={() => setView('document')}
              className="flex flex-col items-start p-6 bg-white border-2 border-slate-200 hover:border-emerald-400 rounded-2xl shadow-sm text-left transition-all group"
            >
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 mb-4">
                <FileText className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-bold text-black text-base">Request</h3>
              <p className="text-sm text-black mt-1 leading-relaxed">
                Request official academic documents such as attestation, attendance letters, and admission letters.
              </p>
              <div className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-600 group-hover:gap-2 transition-all">
                <span>Request</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </button>

            {/* Counselling Card */}
            <button
              onClick={() => setView('counselling')}
              className="flex flex-col items-start p-6 bg-white border-2 border-slate-200 hover:border-purple-400 rounded-2xl shadow-sm text-left transition-all group"
            >
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 mb-4">
                <HeartHandshake className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-bold text-black text-base">Chat with Counsellor</h3>
              <p className="text-sm text-black mt-1 leading-relaxed">
                Connect one-on-one with a counsellor online or request an in-person session. Anonymous mode available.
              </p>
              <div className="mt-4 flex items-center gap-1 text-xs font-bold text-purple-600 group-hover:gap-2 transition-all">
                <span>Get Support</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </button>
          </div>

          {/* Document request history */}
          {docRequests.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-3">
              <h3 className="font-bold text-black text-sm border-b border-slate-100 pb-3">Document Request History</h3>
              {docRequests.map((req) => {
                const dt = documentTypes.find((d) => d.type === req.documentType);
                return (
                  <div key={req.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <p className="text-sm font-semibold text-black">{dt?.label}</p>
                      <p className="text-xs text-black">{new Date(req.requestDate).toLocaleDateString()}</p>
                    </div>
                    {statusBadge(req.status)}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ─── DOCUMENT REQUEST ──────────────────────────────────────────────── */}
      {view === 'document' && (
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-bold text-black">Request a Document</h2>
            <p className="text-sm text-black mt-1">Select the document type and submit your request.</p>
          </div>

          {submitted && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-sm font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              Request submitted! Your document will be ready within the stated processing time.
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {documentTypes.map((dt) => {
              const Icon = dt.icon;
              const selected = selectedDocType === dt.type;
              return (
                <button
                  key={dt.type}
                  onClick={() => { setSelectedDocType(dt.type); setSubmitted(false); }}
                  className={`flex items-center gap-4 p-5 bg-white border-2 rounded-2xl text-left transition-all ${
                    selected ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl flex-shrink-0 ${selected ? 'bg-emerald-50' : 'bg-slate-100'}`}>
                    <Icon className={`w-5 h-5 ${selected ? 'text-emerald-600' : 'text-black'}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-black text-sm">{dt.label}</p>
                    <p className="text-xs text-black mt-0.5">{dt.description}</p>
                    <div className="flex items-center gap-1 mt-1.5 text-[10px] text-black">
                      <Clock className="w-3 h-3" /> {dt.processingDays}
                    </div>
                  </div>
                  {selected && <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />}
                </button>
              );
            })}
          </div>

          {selectedDocType && (
            <form onSubmit={handleDocRequest} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
              <h3 className="font-bold text-black">Additional Notes (optional)</h3>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-black">Full Name <span className="text-emerald-500 font-normal">(auto-filled)</span></label>
                <input readOnly value={user?.name || ''} className="w-full border border-emerald-200 bg-emerald-50 rounded-xl px-4 py-2.5 text-sm text-black" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-black">Matricule <span className="text-emerald-500 font-normal">(auto-filled)</span></label>
                <input readOnly value={user?.matricNo || user?.matricule || ''} className="w-full border border-emerald-200 bg-emerald-50 rounded-xl px-4 py-2.5 text-sm text-black" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-black">Notes / Special Instructions</label>
                <textarea
                  value={docNotes}
                  onChange={(e) => setDocNotes(e.target.value)}
                  placeholder="Any special instructions or notes for processing..."
                  rows={3}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:border-emerald-500"
                />
              </div>
              <button type="submit" className="w-full py-3 bg-slate-50 text-black font-bold rounded-xl text-sm hover:bg-white transition-colors">
                Submit Request
              </button>
            </form>
          )}
        </div>
      )}

      {/* ─── COUNSELLING REQUEST ───────────────────────────────────────────── */}
      {view === 'counselling' && (
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-bold text-black">Counselling Service</h2>
            <p className="text-sm text-black mt-1">Connect with a certified counsellor. Your sessions are private and confidential.</p>
          </div>

          {counselSubmitted && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-sm font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              Session created! A counsellor will be assigned shortly.
            </div>
          )}

          {/* Active sessions */}
          {activeSessions.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-3">
              <h3 className="font-bold text-black text-sm border-b border-slate-100 pb-3">Your Sessions</h3>
              {activeSessions.map((sess) => (
                <button
                  key={sess.id}
                  onClick={() => { setActiveSession(sess); setView('counselling-chat'); }}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-purple-400 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 rounded-xl"><HeartHandshake className="w-4 h-4 text-purple-600" /></div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-black">Session #{sess.id.slice(-6)}</p>
                      <p className="text-xs text-black capitalize">{sess.mode} · {sess.isAnonymous ? 'Anonymous' : 'Identity Revealed'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      sess.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                      sess.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-black'
                    }`}>{sess.status.charAt(0).toUpperCase() + sess.status.slice(1)}</span>
                    <ChevronRight className="w-4 h-4 text-black group-hover:text-purple-500" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* New session form */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6">
            <h3 className="font-bold text-black flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-500" /> Start New Counselling Session
            </h3>

            {/* Mode */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-black uppercase tracking-wider">Session Mode</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'online', label: 'Online Chat', icon: Wifi, desc: 'Chat via this platform' },
                  { value: 'in_person', label: 'In-Person', icon: MapPin, desc: 'Visit the counselling office' },
                ].map(({ value, label, icon: Icon, desc }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setCounselMode(value as any)}
                    className={`flex flex-col items-center p-4 border-2 rounded-2xl text-center transition-all ${
                      counselMode === value
                        ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-100'
                        : 'border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-2 ${counselMode === value ? 'text-purple-600' : 'text-black'}`} />
                    <p className="text-sm font-bold text-black">{label}</p>
                    <p className="text-xs text-black mt-0.5">{desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Identity */}
            {counselMode === 'online' && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-black uppercase tracking-wider">Identity Preference</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: true, label: 'Reveal Identity', icon: Eye, desc: 'Counsellor can see your name' },
                    { value: false, label: 'Stay Anonymous', icon: EyeOff, desc: 'Appear as Anonymous Student' },
                  ].map(({ value, label, icon: Icon, desc }) => (
                    <button
                      key={String(value)}
                      type="button"
                      onClick={() => setRevealIdentity(value)}
                      className={`flex flex-col items-center p-4 border-2 rounded-2xl text-center transition-all ${
                        revealIdentity === value
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100'
                          : 'border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mb-2 ${revealIdentity === value ? 'text-blue-600' : 'text-black'}`} />
                      <p className="text-sm font-bold text-black">{label}</p>
                      <p className="text-xs text-black mt-0.5">{desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleCounselRequest}
              className="w-full py-3 bg-purple-600 text-black font-bold rounded-xl text-sm hover:bg-purple-700 transition-colors"
            >
              Request Counselling Session
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
