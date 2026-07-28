import React, { useState, useEffect, useMemo } from 'react';
import { User, ComplaintType, ComplaintFormConfig } from '../types';
import {
  ArrowLeft, CheckCircle, ChevronRight, BarChart2, BookOpen, FileSearch, 
  Plus, Trash2, Filter, Paperclip, MessageSquare, Clock, User as UserIcon, List, Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ComplaintsDeskProps {
  user: User | null;
  adminMode?: 'none' | 'manage' | 'fields';
}

// Default field configurations for each complaint type
const defaultFormConfigs: ComplaintFormConfig[] = [
  {
    type: 'academic_complaint',
    title: 'Academic Complaint Form',
    description: 'Submit an academic complaint including transcript issues, missing marks, wrong course codes, and more.',
    allowFileUpload: true,
    fileUploadRequired: false,
    fields: [
      { id: 'fullName', label: "Student's Name", type: 'text', autoFill: 'name', placeholder: 'Auto-filled' },
      { id: 'matricule', label: 'Reg Number', type: 'text', autoFill: 'matricule', placeholder: 'Auto-filled' },
      { id: 'department', label: 'Department/Option', type: 'text', placeholder: 'e.g. Management and Entre' },
      { id: 'phone', label: 'Tel', type: 'text', autoFill: 'phone', placeholder: 'Auto-filled' },
      { 
        id: 'natureOfComplaint', 
        label: 'Nature of Complaint', 
        type: 'checkbox-group', 
        options: ['Transcript Issue', 'Certificate Issue', 'Marks Not Found Online', 'Wrong Mark', 'Drop Registered Course', 'Wrong Information', 'Spelling Error', 'Others']
      },
      { id: 'natureOthers', label: 'Others (Briefly State)', type: 'text', placeholder: 'If others, specify here...' },
      { id: 'academicYear', label: 'Academic Year', type: 'text', placeholder: 'e.g. 2025/2026' },
      { id: 'semester', label: 'Semester', type: 'select', options: ['First Semester', 'Second Semester'] },
      { id: 'caMark', label: 'CA Mark', type: 'text', placeholder: 'e.g. 15' },
      { id: 'examMark', label: 'Exam/Resit Mark', type: 'text', placeholder: 'e.g. 0 (Zero)' },
      { id: 'courseCode', label: 'Course Code', type: 'text', placeholder: 'e.g. MGTC 3218' },
      { id: 'courseTitle', label: 'Course Title', type: 'text', placeholder: 'e.g. Price and Pricing policy' },
      { id: 'problem', label: 'Explanation of Complaint (Problem)', type: 'textarea', placeholder: 'Describe the problem in detail...' }
    ],
  }
];

const typeIcons: Record<string, React.ElementType> = {
  academic_complaint: FileSearch,
};

const typeColors: Record<string, string> = {
  academic_complaint: 'text-blue-600 bg-blue-50 border-blue-200 hover:border-blue-400',
};

// Mock ALL complaints for management view
const MOCK_ALL_COMPLAINTS = [
  { id: 'comp-1', studentName: 'Jane Doe', matricule: 'UBa26C0001', category: 'academic_complaint', subject: 'Academic Complaint Form', status: 'pending', createdAt: '2026-07-27T10:00:00Z', description: JSON.stringify({ courseTitle: 'Management', courseCode: 'MGT 301', natureOfComplaint: ['Marks Not Found Online'], problem: 'No CA Mark found.' }) },
  { id: 'comp-2', studentName: 'John Smith', matricule: 'UBa26C0002', category: 'academic_complaint', subject: 'Academic Complaint Form', status: 'pending', createdAt: '2026-07-27T11:00:00Z', description: JSON.stringify({ courseTitle: 'Accounting', courseCode: 'ACC 201', natureOfComplaint: ['Wrong Mark'], problem: 'I scored higher on the script.' }) },
  { id: 'comp-3', studentName: 'Alice Johnson', matricule: 'UBa26C0003', category: 'academic_complaint', subject: 'Academic Complaint Form', status: 'in_progress', createdAt: '2026-07-26T14:30:00Z', description: JSON.stringify({ courseTitle: 'Law', courseCode: 'LAW 200', natureOfComplaint: ['Drop Registered Course'], problem: 'I wish to drop this course.' }) },
];

export const ComplaintsDesk: React.FC<ComplaintsDeskProps> = ({ user, adminMode = 'none' }) => {
  const navigate = useNavigate();

  // Determine actual view mode based on props and permissions
  const [viewMode, setViewMode] = useState<'my_complaints' | 'manage' | 'fields'>(
    adminMode === 'fields' ? 'fields' : (adminMode === 'manage' ? 'manage' : 'my_complaints')
  );

  const canManage = user?.role === 'admin' || user?.canManageComplaints;

  // Form configs
  const [formConfigs, setFormConfigs] = useState<ComplaintFormConfig[]>(defaultFormConfigs);

  // Student UI state
  const [selectedType, setSelectedType] = useState<ComplaintType | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string | boolean>>({});
  const [caMarkIsNone, setCaMarkIsNone] = useState(false);
  const [fileAttached, setFileAttached] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  // Data state
  const [myComplaints, setMyComplaints] = useState<any[]>([]);
  const [allComplaints, setAllComplaints] = useState<any[]>(MOCK_ALL_COMPLAINTS);
  const [isLoading, setIsLoading] = useState(true);

  // Admin/Manager UI state
  const [editingType, setEditingType] = useState<ComplaintType | null>(null);
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState<'text' | 'textarea' | 'select' | 'file'>('text');
  const [groupBy, setGroupBy] = useState<'none' | 'courseName' | 'courseCode' | 'noMark'>('none');
  const [selectedComplaint, setSelectedComplaint] = useState<any | null>(null);
  const [adminResponseInput, setAdminResponseInput] = useState('');
  const [examCodeInput, setExamCodeInput] = useState('');

  // Update exam code input when complaint changes
  useEffect(() => {
    if (selectedComplaint) {
      setExamCodeInput(selectedComplaint.examCode || '');
    }
  }, [selectedComplaint]);

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
    setFileAttached(null);
  }, [selectedType, user, formConfigs]);

  const fetchComplaints = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/complaints?studentId=${user.id}`);
      const data = await res.json();
      if (data.success) {
        setMyComplaints(data.data);
      }
    } catch {
      // silently fail — show empty history for demo or use local mock
      setMyComplaints(MOCK_ALL_COMPLAINTS.filter(c => c.matricule === user.matricule || c.studentName === user.name));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [user]);

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileAttached(e.target.files[0]);
    }
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
        description: JSON.stringify({ 
          ...formValues, 
          camark: caMarkIsNone ? 'NO MARK' : formValues['camark'],
          attachedFile: fileAttached ? fileAttached.name : null
        }),
      };
      
      // Simulate API call for demo
      setTimeout(() => {
        setSuccessMsg('Your complaint has been submitted successfully.');
        setFormValues({});
        setSelectedType(null);
        fetchComplaints();
        setIsSubmitting(false);
      }, 800);
    } catch {
      setSuccessMsg('Network error. Please try again.');
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved': return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">Resolved</span>;
      case 'in_progress': return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">In Progress</span>;
      case 'closed': return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">Closed</span>;
      default: return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600 border border-red-200">Pending</span>;
    }
  };

  const handleResolveComplaint = (id: string, status: string) => {
    setAllComplaints(prev => prev.map(c => 
      c.id === id ? { ...c, status, adminResponse: adminResponseInput || c.adminResponse, examCode: examCodeInput } : c
    ));
    setAdminResponseInput('');
    setSelectedComplaint(null);
  };

  const handleSaveExamCode = (id: string) => {
    setAllComplaints(prev => prev.map(c => 
      c.id === id ? { ...c, examCode: examCodeInput } : c
    ));
    setSelectedComplaint((prev: any) => ({ ...prev, examCode: examCodeInput }));
    setSuccessMsg('Exam code saved successfully.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleExportCSV = (targetGroup?: string) => {
    let itemsToExport = [];
    if (targetGroup && groupedComplaints[targetGroup]) {
      itemsToExport = groupedComplaints[targetGroup];
    } else {
      itemsToExport = Object.values(groupedComplaints).flat();
    }

    const headers = ['ID', 'Student Name', 'Matricule', 'Subject', 'Status', 'Date', 'Exam Code', 'Course Name', 'Course Code', 'CA Mark', 'Description'];
    const rows = itemsToExport.map(c => {
      let desc: any = {};
      try { desc = JSON.parse(c.description || '{}'); } catch(e) {}
      
      return [
        c.id,
        c.studentName,
        c.matricule,
        c.subject,
        c.status,
        new Date(c.createdAt).toLocaleDateString(),
        c.examCode || '',
        desc.courseTitle || desc.courseName || '',
        desc.courseCode || desc.wrongCode || desc.correctCode || '',
        desc.caMark || desc.camark || '',
        JSON.stringify(desc).replace(/"/g, '""')
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `complaints_export_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Grouping logic for Management View
  const groupedComplaints = useMemo(() => {
    if (groupBy === 'none') return { 'All Complaints': allComplaints };
    
    const groups: Record<string, any[]> = {};
    allComplaints.forEach(c => {
      let key = 'Other';
      try {
        const desc = JSON.parse(c.description || '{}');
        if (groupBy === 'courseName' && desc.courseTitle) key = desc.courseTitle;
        if (groupBy === 'courseCode' && desc.courseCode) key = desc.courseCode;
        if (groupBy === 'noMark' && desc.natureOfComplaint && desc.natureOfComplaint.includes('Marks Not Found Online')) key = 'Marks Not Found Online';
      } catch (e) {}
      
      if (groupBy === 'noMark' && key !== 'Marks Not Found Online') return; // Filter to only No Mark
      
      if (!groups[key]) groups[key] = [];
      groups[key].push(c);
    });
    return groups;
  }, [allComplaints, groupBy]);

  // ─── ADMIN FIELD EDITOR (FIELDS MODE) ────────────────────────────────────────────────────
  if (viewMode === 'fields') {
    const editingConfig = formConfigs.find((c) => c.type === editingType);
    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Complaint Form Editor</h2>
          {editingType ? (
            <button onClick={() => setEditingType(null)} className="text-xs text-slate-600 flex items-center gap-1 hover:text-slate-900">
              <ArrowLeft className="w-4 h-4" /> Back to types
            </button>
          ) : (
            <button onClick={() => navigate(-1)} className="text-xs text-slate-600 flex items-center gap-1 hover:text-slate-900">
              <ArrowLeft className="w-4 h-4" /> Go Back
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
                  className="flex items-center justify-between p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-blue-300 transition-all group text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100"><Icon className="w-5 h-5 text-slate-700" /></div>
                    <div>
                      <p className="font-bold text-slate-900">{config.title}</p>
                      <p className="text-xs text-slate-500">{config.fields.length} fields · File upload: {config.allowFileUpload ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-500" />
                </button>
              );
            })}
          </div>
        ) : editingConfig ? (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6">
            <h3 className="font-bold text-slate-900 text-lg border-b border-slate-100 pb-3">{editingConfig.title} Configuration</h3>
            
            {/* File Upload Settings */}
            <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2"><Paperclip className="w-4 h-4" /> File Upload Settings</h4>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-700">Allow File Uploads</p>
                  <p className="text-xs text-slate-500">Students can attach a file (e.g., screenshot, document)</p>
                </div>
                <div 
                  onClick={() => setFormConfigs(prev => prev.map(c => c.type === editingType ? { ...c, allowFileUpload: !c.allowFileUpload } : c))}
                  className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 cursor-pointer ${editingConfig.allowFileUpload ? 'bg-blue-500' : 'bg-slate-300'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${editingConfig.allowFileUpload ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </div>
              {editingConfig.allowFileUpload && (
                <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Make File Upload Required</p>
                    <p className="text-xs text-slate-500">Form cannot be submitted without an attachment</p>
                  </div>
                  <div 
                    onClick={() => setFormConfigs(prev => prev.map(c => c.type === editingType ? { ...c, fileUploadRequired: !c.fileUploadRequired } : c))}
                    className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 cursor-pointer ${editingConfig.fileUploadRequired ? 'bg-emerald-500' : 'bg-slate-300'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${editingConfig.fileUploadRequired ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-800">Form Fields</h4>
              {editingConfig.fields.map((field, idx) => (
                <div key={field.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{field.label}</p>
                    <p className="text-xs text-slate-500">Type: {field.type}{field.autoFill ? ` · Auto-fill: ${field.autoFill}` : ''}</p>
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
                      className="p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add new field */}
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <p className="text-sm font-bold text-slate-800">Add New Field</p>
              <div className="flex flex-wrap sm:flex-nowrap gap-2">
                <input
                  value={newFieldLabel}
                  onChange={(e) => setNewFieldLabel(e.target.value)}
                  placeholder="Field label"
                  className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
                <select
                  value={newFieldType}
                  onChange={(e) => setNewFieldType(e.target.value as any)}
                  className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white"
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 flex items-center justify-center gap-1 w-full sm:w-auto transition-colors"
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

  // ─── MANAGEMENT VIEW (MANAGE MODE) ───────────────────────────────────────────────────
  if (viewMode === 'manage') {
    return (
      <div className="max-w-5xl mx-auto space-y-6 pb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <List className="w-6 h-6 text-blue-500" />
              Manage Complaints
            </h2>
            <p className="text-sm text-slate-500 mt-1">Review, group, and resolve student complaints.</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as any)}
              className="border border-slate-200 bg-white rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm focus:outline-none focus:border-blue-500"
            >
              <option value="none">List All</option>
              <option value="courseName">Group by Course Name</option>
              <option value="courseCode">Group by Course Code</option>
              <option value="noMark">Filter: No CA Mark</option>
            </select>
            <button onClick={() => handleExportCSV()} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-2">
              <Download className="w-4 h-4" /> Export All
            </button>
            {user?.role !== 'admin' && (
              <button 
                onClick={() => setViewMode('my_complaints')}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-black hover:bg-slate-50 transition-colors shadow-sm"
              >
                My Complaints
              </button>
            )}
            {user?.role === 'admin' && (
              <button 
                onClick={() => navigate(-1)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-black hover:bg-slate-50 transition-colors shadow-sm"
              >
                Dashboard
              </button>
            )}
          </div>
        </div>

        {selectedComplaint ? (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row">
            <div className="md:w-1/2 p-6 border-b md:border-b-0 md:border-r border-slate-100 space-y-6">
              <div>
                <button onClick={() => setSelectedComplaint(null)} className="text-xs text-black font-bold flex items-center gap-1 hover:text-blue-600 mb-4 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back to list
                </button>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-black">{selectedComplaint.subject}</h3>
                  {getStatusBadge(selectedComplaint.status)}
                </div>
                <div className="flex items-center gap-3 text-sm text-black mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-1.5"><UserIcon className="w-4 h-4 text-black" /> <span className="font-bold text-black">{selectedComplaint.studentName}</span></div>
                  <div className="w-1 h-1 bg-black rounded-full" />
                  <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-black">{selectedComplaint.matricule}</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Complaint Details</h4>
                <div className="space-y-3">
                  {Object.entries(JSON.parse(selectedComplaint.description || '{}')).map(([key, value]) => {
                    if (key === 'attachedFile' && value) {
                      return (
                        <div key={key} className="bg-blue-50 p-3 rounded-xl border border-blue-100 flex items-start gap-3">
                          <Paperclip className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-blue-700 uppercase">Attached File</p>
                            <a href="#" className="text-sm font-medium text-blue-600 hover:underline">{String(value)}</a>
                          </div>
                        </div>
                      )
                    }
                    return (
                      <div key={key} className="border-b border-slate-100 pb-2">
                        <p className="text-xs font-semibold text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                        <p className="text-sm font-medium text-slate-900 mt-0.5">{Array.isArray(value) ? value.join(', ') : String(value)}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
            
            <div className="md:w-1/2 p-6 bg-slate-50 flex flex-col justify-between">
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-black uppercase tracking-wide flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Administration
                </h4>
                
                {/* Exam Code Section */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-2">
                  <label className="block text-xs font-bold text-black mb-2">Exam Code (Optional)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. EC-1029"
                      value={examCodeInput}
                      onChange={(e) => setExamCodeInput(e.target.value)}
                      className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-black"
                    />
                    <button 
                      onClick={() => handleSaveExamCode(selectedComplaint.id)}
                      className="px-3 py-2 bg-slate-100 text-black font-bold text-xs rounded-lg hover:bg-slate-200 transition-colors border border-slate-200"
                    >
                      Save
                    </button>
                  </div>
                </div>

                {selectedComplaint.adminResponse && (
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-sm text-slate-700">
                    <span className="font-bold text-slate-900 block mb-1">Previous Response:</span>
                    {selectedComplaint.adminResponse}
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600">Update Response (Optional)</label>
                  <textarea 
                    value={adminResponseInput}
                    onChange={(e) => setAdminResponseInput(e.target.value)}
                    placeholder="Provide a resolution or status update..."
                    rows={4}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 resize-none shadow-sm"
                  />
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <button 
                  onClick={() => handleResolveComplaint(selectedComplaint.id, 'resolved')}
                  className="flex-1 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-sm hover:bg-emerald-700 transition-colors shadow-sm flex items-center justify-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" /> Mark Resolved
                </button>
                <button 
                  onClick={() => handleResolveComplaint(selectedComplaint.id, 'in_progress')}
                  className="flex-1 py-2.5 bg-amber-500 text-white font-bold rounded-xl text-sm hover:bg-amber-600 transition-colors shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Clock className="w-4 h-4" /> In Progress
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedComplaints).map(([groupName, groupItems]) => (
              <div key={groupName} className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="font-bold text-black text-lg flex items-center gap-2">
                    <Filter className="w-5 h-5 text-black" />
                    {groupName} <span className="bg-slate-200 text-black text-xs font-bold px-2 py-0.5 rounded-full">{groupItems.length}</span>
                  </h3>
                  <button 
                    onClick={() => handleExportCSV(groupName)} 
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Export Group
                  </button>
                </div>
                {groupItems.length === 0 ? (
                   <p className="text-sm text-black py-4 italic font-medium">No complaints found in this group.</p>
                ) : (
                  <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-sm">
                    <table className="w-full text-left text-sm text-black">
                      <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-black">
                        <tr>
                          <th className="px-4 py-3">Student</th>
                          <th className="px-4 py-3">Matricule</th>
                          <th className="px-4 py-3">Subject</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Date & Time</th>
                          <th className="px-4 py-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {groupItems.map((comp) => (
                          <tr 
                            key={comp.id} 
                            onClick={() => setSelectedComplaint(comp)}
                            className="hover:bg-blue-50 cursor-pointer transition-colors"
                          >
                            <td className="px-4 py-3 font-bold text-black">{comp.studentName}</td>
                            <td className="px-4 py-3 font-mono text-xs text-black">{comp.matricule}</td>
                            <td className="px-4 py-3 font-medium text-black">
                              <div className="flex items-center gap-2">
                                <span>{comp.subject}</span>
                                {comp.description?.includes('attachedFile') && (
                                  <Paperclip className="w-3 h-3 text-blue-500" />
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">{getStatusBadge(comp.status)}</td>
                            <td className="px-4 py-3 text-xs font-medium text-black">
                              {new Date(comp.createdAt).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button className="text-xs font-bold text-blue-700 hover:underline">View</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ─── STUDENT VIEW (MY COMPLAINTS MODE) ───────────────────────────────────────────────────
  const activeConfig = formConfigs.find((c) => c.type === selectedType);

  return (
    <div className="max-w-4xl w-full mx-auto space-y-6 pb-20 md:pb-6">
      {/* Header and Back/Toggle controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => selectedType ? setSelectedType(null) : navigate(-1)}
          className="self-start flex items-center space-x-2 text-slate-700 hover:text-slate-900 text-xs font-bold px-3 py-2 bg-white border border-slate-200 rounded-xl transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-blue-500" />
          <span>{selectedType ? 'Back to complaint types' : 'Back'}</span>
        </button>

        {canManage && !selectedType && (
          <button 
            onClick={() => setViewMode('manage')}
            className="flex items-center space-x-2 text-white text-xs font-bold px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm"
          >
            <List className="w-4 h-4" />
            <span>Manage Complaints</span>
          </button>
        )}
      </div>

      {/* Success message */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm font-semibold flex items-center gap-2 shadow-sm">
          <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          {successMsg}
        </div>
      )}

      {!selectedType ? (
        <>
          {/* Type picker */}
          <div className="space-y-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">Complaints Desk</h2>
            <p className="text-sm text-slate-500">Select the type of complaint you want to submit. All submissions are reviewed by the administration.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {formConfigs.map((config) => {
              const Icon = typeIcons[config.type];
              return (
                <button
                  key={config.type}
                  onClick={() => setSelectedType(config.type)}
                  className={`flex flex-col items-start p-5 bg-white border rounded-2xl shadow-sm text-left transition-all group hover:shadow-md ${typeColors[config.type]}`}
                >
                  <div className="p-2.5 rounded-xl bg-white border border-current mb-3 shadow-sm group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="font-bold text-slate-900 text-sm">{config.title}</p>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{config.description}</p>
                  <div className="mt-4 flex items-center gap-1 text-xs font-bold text-slate-800">
                    <span>File Complaint</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* History */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              Your Complaint History
            </h3>
            {isLoading ? (
              <p className="text-xs text-slate-500 text-center py-4">Loading history...</p>
            ) : myComplaints.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-slate-100">
                   <FileSearch className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-sm font-medium text-slate-900">No complaints found</p>
                <p className="text-xs text-slate-500 mt-1">You haven't submitted any complaints yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myComplaints.map((comp) => (
                  <div key={comp.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 hover:border-slate-300 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-sm font-bold text-slate-900 leading-snug">{comp.subject}</p>
                      <div className="flex-shrink-0">{getStatusBadge(comp.status)}</div>
                    </div>
                    {comp.adminResponse && (
                      <div className="p-3 bg-white border border-emerald-100 rounded-lg shadow-sm">
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" /> Admin Response
                        </p>
                        <p className="text-xs text-slate-700 font-medium">{comp.adminResponse}</p>
                      </div>
                    )}
                    <p className="text-[10px] text-slate-400 font-medium">{new Date(comp.createdAt).toLocaleString()}</p>
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
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              {React.createElement(typeIcons[selectedType], { className: 'w-5 h-5' })}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{activeConfig.title}</h2>
              <p className="text-xs text-slate-500">{activeConfig.description}</p>
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
                      <label className="text-xs font-bold text-slate-700">{field.label}</label>
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <span className="text-xs font-bold text-slate-600">{field.toggleLabel}</span>
                        <div
                          onClick={() => setCaMarkIsNone((p) => !p)}
                          className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 ${caMarkIsNone ? 'bg-blue-600' : 'bg-slate-300'}`}
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
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-400 transition-colors"
                    />
                  </div>
                );
              }

              if (field.type === 'select') {
                return (
                  <div key={field.id} className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">{field.label}</label>
                    <select
                      value={value}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 bg-white"
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
                    <label className="text-xs font-bold text-slate-700">{field.label}</label>
                    <textarea
                      value={value}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      required
                      rows={4}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 resize-none shadow-sm"
                    />
                  </div>
                );
              }

              if (field.type === 'checkbox-group') {
                const currentSelections: string[] = Array.isArray(value) ? value : [];
                return (
                  <div key={field.id} className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">{field.label}</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(field.options || []).map(opt => (
                        <label key={opt} className="flex items-center gap-2 cursor-pointer p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                          <input 
                            type="checkbox" 
                            checked={currentSelections.includes(opt)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                handleFieldChange(field.id, [...currentSelections, opt]);
                              } else {
                                handleFieldChange(field.id, currentSelections.filter(v => v !== opt));
                              }
                            }}
                            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-slate-700">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <div key={field.id} className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    {field.label} {isAutoFill && <span className="text-emerald-500 font-semibold">(auto-filled)</span>}
                  </label>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    readOnly={isAutoFill}
                    required={!isAutoFill}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors shadow-sm ${
                      isAutoFill ? 'bg-slate-50 border-slate-200 text-slate-600 font-medium' : 'border-slate-200 bg-white'
                    }`}
                  />
                </div>
              );
            })}

            {/* Optional File Upload section based on configuration */}
            {activeConfig.allowFileUpload && (
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                  Attachment {activeConfig.fileUploadRequired ? <span className="text-red-500">*</span> : <span className="text-slate-400 font-normal">(Optional)</span>}
                </label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-blue-400 transition-colors bg-slate-50 cursor-pointer relative">
                  <input 
                    type="file" 
                    accept="application/pdf"
                    onChange={handleFileChange}
                    required={activeConfig.fileUploadRequired}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {fileAttached ? (
                    <div className="flex items-center justify-center gap-2 text-sm text-blue-600 font-bold">
                       <CheckCircle className="w-4 h-4" />
                       {fileAttached.name}
                    </div>
                  ) : (
                    <div className="text-sm text-slate-500 font-medium">
                      <span className="text-blue-500 font-bold">Click to upload</span> or drag and drop<br/>
                      <span className="text-xs">PDF Only (max 5MB)</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700 disabled:opacity-70 transition-colors shadow-sm mt-4 flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
};
