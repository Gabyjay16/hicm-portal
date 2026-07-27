import React, { useState, useEffect } from 'react';
import { User, ComplaintType, ComplaintFormConfig } from '../types';
import {
  ArrowLeft, MessageSquare, CheckCircle, Clock, AlertCircle,
  ChevronRight, BarChart2, BookOpen, FileSearch, Plus, Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ComplaintsDeskProps {
  user: User | null;
  isAdmin?: boolean;
}

// Default field configurations for each complaint type
const defaultFormConfigs: ComplaintFormConfig[] = [
  {
    type: 'wrong_marks',
    title: 'Wrong / No Marks',
    description: 'Report a missing or incorrect mark entry for a course.',
    fields: [
      { id: 'fullName', label: 'Full Name', type: 'text', autoFill: 'name', placeholder: 'Auto-filled' },
      { id: 'matricule', label: 'Matricule', type: 'text', autoFill: 'matricule', placeholder: 'Auto-filled' },
      { id: 'phone', label: 'Phone Number', type: 'text', autoFill: 'phone', placeholder: 'Auto-filled' },
      { id: 'courseName', label: 'Course Name', type: 'text', placeholder: 'e.g. Principles of Management' },
      { id: 'courseCode', label: 'Course Code', type: 'text', placeholder: 'e.g. MGT 301' },
      { id: 'camark', label: 'CA Mark', type: 'toggle', toggleLabel: 'NO MARK', placeholder: 'Enter your CA mark' },
      { id: 'semester', label: 'Semester', type: 'select', options: ['First Semester', 'Second Semester'] },
      { id: 'year', label: 'Academic Year', type: 'text', placeholder: 'e.g. 2024/2025' },
    ],
  },
  {
    type: 'wrong_course_code',
    title: 'Wrong Course Code',
    description: 'Report an incorrect course code assignment in your record.',
    fields: [
      { id: 'fullName', label: 'Full Name', type: 'text', autoFill: 'name', placeholder: 'Auto-filled' },
      { id: 'matricule', label: 'Matricule', type: 'text', autoFill: 'matricule', placeholder: 'Auto-filled' },
      { id: 'wrongCode', label: 'Incorrect Course Code', type: 'text', placeholder: 'e.g. MGT 201' },
      { id: 'correctCode', label: 'Correct Course Code', type: 'text', placeholder: 'e.g. MGT 301' },
      { id: 'description', label: 'Additional Details', type: 'textarea', placeholder: 'Describe the discrepancy...' },
    ],
  },
  {
    type: 'remark_script',
    title: 'Request Remark Script',
    description: 'Request an official review and re-marking of your exam script.',
    fields: [
      { id: 'fullName', label: 'Full Name', type: 'text', autoFill: 'name', placeholder: 'Auto-filled' },
      { id: 'matricule', label: 'Matricule', type: 'text', autoFill: 'matricule', placeholder: 'Auto-filled' },
      { id: 'phone', label: 'Phone Number', type: 'text', autoFill: 'phone', placeholder: 'Auto-filled' },
      { id: 'courseName', label: 'Course Name', type: 'text', placeholder: 'e.g. Business Law' },
      { id: 'courseCode', label: 'Course Code', type: 'text', placeholder: 'e.g. LAW 201' },
      { id: 'justification', label: 'Justification', type: 'textarea', placeholder: 'Why do you believe your script needs re-marking?' },
    ],
  },
];

const typeIcons: Record<ComplaintType, React.ElementType> = {
  wrong_marks: BarChart2,
  wrong_course_code: BookOpen,
  remark_script: FileSearch,
};

const typeColors: Record<ComplaintType, string> = {
  wrong_marks: 'text-red-500 bg-red-50 border-red-200 hover:border-red-400',
  wrong_course_code: 'text-amber-600 bg-amber-50 border-amber-200 hover:border-amber-400',
  remark_script: 'text-blue-600 bg-blue-50 border-blue-200 hover:border-blue-400',
};

const typeActiveColors: Record<ComplaintType, string> = {
  wrong_marks: 'border-red-500 bg-red-50 ring-2 ring-red-200',
  wrong_course_code: 'border-amber-500 bg-amber-50 ring-2 ring-amber-200',
  remark_script: 'border-blue-500 bg-blue-50 ring-2 ring-blue-200',
};

export const ComplaintsDesk: React.FC<ComplaintsDeskProps> = ({ user, isAdmin = false }) => {
  const navigate = useNavigate();

  // Form configs (admin can edit these)
  const [formConfigs, setFormConfigs] = useState<ComplaintFormConfig[]>(defaultFormConfigs);

  // Student UI state
  const [selectedType, setSelectedType] = useState<ComplaintType | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string | boolean>>({});
  const [caMarkIsNone, setCaMarkIsNone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [complaints, setComplaints] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Admin UI state
  const [adminView, setAdminView] = useState<'list' | 'editor'>('list');
  const [editingType, setEditingType] = useState<ComplaintType | null>(null);
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState<'text' | 'textarea' | 'select'>('text');

  // Auto-fill on type select
  useEffect(() => {
    if (!selectedType || !user) return;
    const config = formConfigs.find((c) => c.type === selectedType);
    if (!config) return;
    const autoFilled: Record<string, string> = {};
    config.fields.forEach((f) => {
      if (f.autoFill === 'name') autoFilled[f.id] = user.name || '';
      if (f.autoFill === 'matricule') autoFilled[f.id] = user.matricNo || user.matricule || '';
      if (f.autoFill === 'phone') autoFilled[f.id] = user.phone || '';
    });
    setFormValues(autoFilled);
    setCaMarkIsNone(false);
  }, [selectedType]);

  const fetchComplaints = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/complaints?studentId=${user.id}`);
      const data = await res.json();
      if (data.success) setComplaints(data.data);
    } catch {
      // silently fail — show empty history
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [user]);

  const handleFieldChange = (fieldId: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedType) return;
    setIsSubmitting(true);
    setSuccessMsg('');
    try {
      const payload = {
        studentId: user.id,
        category: selectedType,
        subject: formConfigs.find((c) => c.type === selectedType)?.title,
        description: JSON.stringify({ ...formValues, camark: caMarkIsNone ? 'NO MARK' : formValues['camark'] }),
      };
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success || res.ok) {
        setSuccessMsg('Your complaint has been submitted successfully.');
        setFormValues({});
        setSelectedType(null);
        fetchComplaints();
      } else {
        setSuccessMsg(data.error || 'Failed to submit. Please try again.');
      }
    } catch {
      setSuccessMsg('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved': return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">Resolved</span>;
      case 'in_progress': return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">In Progress</span>;
      case 'closed': return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-black">Closed</span>;
      default: return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600">Pending</span>;
    }
  };

  // ─── ADMIN FIELD EDITOR ────────────────────────────────────────────────────
  if (isAdmin) {
    const editingConfig = formConfigs.find((c) => c.type === editingType);
    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-black">Complaint Form Editor</h2>
          {editingType && (
            <button onClick={() => setEditingType(null)} className="text-xs text-black flex items-center gap-1 hover:text-black">
              <ArrowLeft className="w-4 h-4" /> Back to types
            </button>
          )}
        </div>

        {!editingType ? (
          <div className="grid grid-cols-1 gap-4">
            {formConfigs.map((config) => {
              const Icon = typeIcons[config.type];
              return (
                <button
                  key={config.type}
                  onClick={() => setEditingType(config.type)}
                  className="flex items-center justify-between p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-slate-400 transition-all group text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-slate-100 rounded-xl"><Icon className="w-5 h-5 text-black" /></div>
                    <div>
                      <p className="font-bold text-black">{config.title}</p>
                      <p className="text-xs text-black">{config.fields.length} fields configured</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-black group-hover:text-black" />
                </button>
              );
            })}
          </div>
        ) : editingConfig ? (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-black text-lg">{editingConfig.title} — Fields</h3>
            <div className="space-y-2">
              {editingConfig.fields.map((field, idx) => (
                <div key={field.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <p className="text-sm font-semibold text-black">{field.label}</p>
                    <p className="text-xs text-black">Type: {field.type}{field.autoFill ? ` · Auto-fill: ${field.autoFill}` : ''}</p>
                  </div>
                  {!field.autoFill && (
                    <button
                      onClick={() => {
                        setFormConfigs((prev) =>
                          prev.map((c) =>
                            c.type === editingType
                              ? { ...c, fields: c.fields.filter((_, i) => i !== idx) }
                              : c
                          )
                        );
                      }}
                      className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add new field */}
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <p className="text-sm font-bold text-black">Add New Field</p>
              <div className="flex gap-2">
                <input
                  value={newFieldLabel}
                  onChange={(e) => setNewFieldLabel(e.target.value)}
                  placeholder="Field label"
                  className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                />
                <select
                  value={newFieldType}
                  onChange={(e) => setNewFieldType(e.target.value as any)}
                  className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                >
                  <option value="text">Text</option>
                  <option value="textarea">Textarea</option>
                  <option value="select">Select</option>
                </select>
                <button
                  onClick={() => {
                    if (!newFieldLabel.trim()) return;
                    const newField = {
                      id: newFieldLabel.toLowerCase().replace(/\s+/g, '_'),
                      label: newFieldLabel,
                      type: newFieldType,
                      placeholder: `Enter ${newFieldLabel.toLowerCase()}`,
                    };
                    setFormConfigs((prev) =>
                      prev.map((c) =>
                        c.type === editingType ? { ...c, fields: [...c.fields, newField] } : c
                      )
                    );
                    setNewFieldLabel('');
                  }}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  // ─── STUDENT VIEW ──────────────────────────────────────────────────────────
  const activeConfig = formConfigs.find((c) => c.type === selectedType);

  return (
    <div className="max-w-4xl w-full mx-auto space-y-6 pb-20 md:pb-6">
      {/* Back */}
      <button
        onClick={() => selectedType ? setSelectedType(null) : navigate(-1)}
        className="flex items-center space-x-2 text-black hover:text-black text-xs font-semibold px-3 py-2 bg-white border border-slate-200 rounded-xl transition-colors shadow-sm"
      >
        <ArrowLeft className="w-4 h-4 text-emerald-500" />
        <span>{selectedType ? 'Back to complaint types' : 'Back'}</span>
      </button>

      {/* Success message */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-sm font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          {successMsg}
        </div>
      )}

      {!selectedType ? (
        <>
          {/* Type picker */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-black">Complaints Desk</h2>
            <p className="text-sm text-black">Select the type of complaint you want to submit.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {formConfigs.map((config) => {
              const Icon = typeIcons[config.type];
              return (
                <button
                  key={config.type}
                  onClick={() => setSelectedType(config.type)}
                  className={`flex flex-col items-start p-5 bg-white border-2 rounded-2xl shadow-sm text-left transition-all group ${typeColors[config.type]}`}
                >
                  <div className="p-2.5 rounded-xl bg-white border border-current mb-3 shadow-sm">
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="font-bold text-black text-sm">{config.title}</p>
                  <p className="text-xs text-black mt-1 leading-relaxed">{config.description}</p>
                  <div className="mt-4 flex items-center gap-1 text-xs font-bold">
                    <span>File Complaint</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* History */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-black text-sm border-b border-slate-100 pb-3">Your Complaint History</h3>
            {isLoading ? (
              <p className="text-xs text-black text-center py-4">Loading history...</p>
            ) : complaints.length === 0 ? (
              <p className="text-xs text-black text-center py-6">No complaints found.</p>
            ) : (
              <div className="space-y-3">
                {complaints.map((comp) => (
                  <div key={comp.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-bold text-black">{comp.subject}</p>
                      {getStatusBadge(comp.status)}
                    </div>
                    {comp.adminResponse && (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg">
                        <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Admin Response</p>
                        <p className="text-xs text-emerald-800">{comp.adminResponse}</p>
                      </div>
                    )}
                    <p className="text-[10px] text-black">{new Date(comp.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : activeConfig ? (
        /* ── Structured Complaint Form ── */
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            {React.createElement(typeIcons[selectedType], { className: 'w-5 h-5 text-black' })}
            <div>
              <h2 className="text-lg font-bold text-black">{activeConfig.title}</h2>
              <p className="text-xs text-black">{activeConfig.description}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {activeConfig.fields.map((field) => {
              const isAutoFill = !!field.autoFill;
              const value = (formValues[field.id] as string) || '';

              if (field.type === 'toggle') {
                return (
                  <div key={field.id} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-black">{field.label}</label>
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <span className="text-xs text-black">{field.toggleLabel}</span>
                        <div
                          onClick={() => setCaMarkIsNone((p) => !p)}
                          className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 ${caMarkIsNone ? 'bg-red-500' : 'bg-slate-200'}`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${caMarkIsNone ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                      </label>
                    </div>
                    <input
                      type="number"
                      value={caMarkIsNone ? '' : value}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      disabled={caMarkIsNone}
                      placeholder={caMarkIsNone ? 'NO MARK' : field.placeholder}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 disabled:bg-red-50 disabled:text-red-400 disabled:border-red-200 transition-colors"
                    />
                  </div>
                );
              }

              if (field.type === 'select') {
                return (
                  <div key={field.id} className="space-y-1.5">
                    <label className="text-xs font-semibold text-black">{field.label}</label>
                    <select
                      value={value}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 bg-white"
                    >
                      <option value="">Select {field.label}</option>
                      {(field.options || []).map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                );
              }

              if (field.type === 'textarea') {
                return (
                  <div key={field.id} className="space-y-1.5">
                    <label className="text-xs font-semibold text-black">{field.label}</label>
                    <textarea
                      value={value}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      rows={4}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 resize-none"
                    />
                  </div>
                );
              }

              return (
                <div key={field.id} className="space-y-1.5">
                  <label className="text-xs font-semibold text-black">
                    {field.label} {isAutoFill && <span className="text-emerald-500 font-normal">(auto-filled)</span>}
                  </label>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    readOnly={isAutoFill}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 transition-colors ${
                      isAutoFill ? 'bg-emerald-50 border-emerald-200 text-black' : 'border-slate-200'
                    }`}
                  />
                </div>
              );
            })}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-slate-50 text-black font-bold rounded-xl text-sm hover:bg-white disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
};
