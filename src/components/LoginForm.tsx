import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, AdminSettingsConfig } from '../types';
import {
  ShieldCheck, UserCheck, User as UserIcon, BookOpen, AlertCircle,
  Lock, Phone, UserCheck2, Bell, ChevronUp, ChevronDown, ArrowLeft,
  LogIn, UserPlus, Sparkles, GraduationCap, Building2, Shield,
  ArrowRight, ExternalLink
} from 'lucide-react';

interface LoginFormProps {
  onLogin: (user: User) => void;
  onCancel?: () => void;
  adminSettings?: AdminSettingsConfig;
}

type AuthMode = 'landing' | 'login_form' | 'student_register' | 'staff_register';

interface PublicAnnouncement {
  id: string;
  title: string;
  content: string;
  date: string;
  category: string;
  imageUrl?: string;
  videoUrl?: string;
}

const DEFAULT_ANNOUNCEMENTS: PublicAnnouncement[] = [
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
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
  },
  {
    id: 'ann-3',
    title: 'CA Marks Verification & Script Remarking Window',
    content: 'All students are advised to check their continuous assessment marks. Any discrepancies or script review requests should be submitted through the portal Complaints Desk before August 5, 2026.',
    date: 'July 15, 2026',
    category: 'Academic',
  },
  {
    id: 'ann-4',
    title: 'Plagiarism Test Submission Deadline — All Departments',
    content: 'Final year students must submit plagiarism test certificates before thesis defence. Tokens are available in the student portal. Contact your department HOD for payment details.',
    date: 'July 10, 2026',
    category: 'Academic',
  },
];

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onCancel, adminSettings }) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('landing');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [announcements, setAnnouncements] = useState<PublicAnnouncement[]>(DEFAULT_ANNOUNCEMENTS);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Login inputs
  const [loginName, setLoginName] = useState<string>('');
  const [loginSecret, setLoginSecret] = useState<string>('');

  // Registration inputs
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [matricNo, setMatricNo] = useState<string>('');
  const [department, setDepartment] = useState<string>('Money and Banking');
  const [level, setLevel] = useState<string>('Level 300');
  const [position, setPosition] = useState<string>('Lecturer');
  const [gender, setGender] = useState<string>('Male');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch('/api/announcements');
        const data = await res.json();
        if (data.success && data.data && data.data.length > 0) {
          setAnnouncements(data.data);
        }
      } catch {
        // Fallback to default announcements
      }
    };
    fetchAnnouncements();
  }, []);

  const handleScrollUp = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ top: -180, behavior: 'smooth' });
  };

  const handleScrollDown = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ top: 180, behavior: 'smooth' });
  };

  const isStaffVerificationCode = (input: string): boolean => {
    const clean = input.trim().toUpperCase();
    return clean === 'STF-123' || clean === 'ADM-123' || clean.startsWith('STF-') || clean.startsWith('ADM-');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!loginName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (isStaffVerificationCode(loginName)) {
      const code = loginName.trim().toUpperCase();
      setMode('staff_register');
      if (code === 'ADM-123' || code.includes('ADM')) {
        setPosition('System Administrator');
      } else {
        setPosition('Lecturer');
      }
      setSuccessMessage('Staff verification successful! Complete your staff profile below.');
      return;
    }

    if (!loginSecret.trim()) {
      setErrorMessage('Please enter your matricule number or password.');
      return;
    }

    setIsLoading(true);

    const cleanLoginName = loginName.trim().toLowerCase();
    const cleanSecret = loginSecret.trim();

    let role: 'student' | 'staff' | 'admin' = 'student';
    let isStaff = false;

    if (cleanLoginName.includes('admin') || cleanSecret === 'admin123') {
      role = 'admin';
      isStaff = true;
    } else if (
      cleanLoginName.includes('dr.') ||
      cleanLoginName.includes('prof') ||
      cleanLoginName.includes('staff') ||
      cleanSecret === 'password123'
    ) {
      role = 'staff';
      isStaff = true;
    }

    const authenticatedUser: User = {
      id: `${role}-${Date.now()}`,
      name: loginName.trim(),
      role: role,
      isStaff: isStaff,
      phone: phone || '+237 670 000 089',
      matricNo: role === 'student' ? cleanSecret.toUpperCase() : undefined,
      matricule: role === 'student' ? cleanSecret.toUpperCase() : undefined,
      department: department,
      level: level,
      status: 'Active & Verified',
    };

    onLogin(authenticatedUser);
  };

  const handleStudentRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name.trim()) { setErrorMessage('Please enter your full name.'); return; }
    if (!phone.trim()) { setErrorMessage('Please enter your phone number.'); return; }
    if (!matricNo.trim()) { setErrorMessage('Please enter your matricule number.'); return; }
    if (!password.trim()) { setErrorMessage('Please enter a password.'); return; }
    if (password !== confirmPassword) { setErrorMessage('Passwords do not match.'); return; }

    if (adminSettings?.matriculeVerificationEnabled) {
      if (!adminSettings.validMatricules.includes(matricNo.trim())) {
        setErrorMessage(`Matricule '${matricNo}' is not recognized. Please verify with your department.`);
        return;
      }
    }

    setIsLoading(true);
    const newStudent: User = {
      id: `std-${Date.now()}`,
      name: name.trim(),
      role: 'student',
      isStaff: false,
      phone: phone.trim(),
      matricNo: matricNo.trim().toUpperCase(),
      matricule: matricNo.trim().toUpperCase(),
      department: department,
      level: level,
      status: 'Active Student - Verified',
    };
    onLogin(newStudent);
  };

  const handleStaffRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name.trim()) { setErrorMessage('Please enter your full name.'); return; }
    if (!phone.trim()) { setErrorMessage('Please enter your phone number.'); return; }
    if (!password.trim()) { setErrorMessage('Please enter a password.'); return; }
    if (password !== confirmPassword) { setErrorMessage('Passwords do not match.'); return; }

    const isSystemAdmin = position === 'System Administrator';
    const staffRole = isSystemAdmin ? 'admin' : 'staff';

    const newStaff: User = {
      id: `stf-${Date.now()}`,
      name: name.trim(),
      role: staffRole,
      isStaff: true,
      phone: phone.trim(),
      department: department,
      status: `${position} - Verified`,
    };
    onLogin(newStaff);
  };

  /* ─── Shared input style ─── */
  const inputCls = "w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/30 transition-all text-sm";
  const labelCls = "block text-slate-300 text-xs font-semibold mb-1.5 uppercase tracking-wider";
  const selectCls = "w-full bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-400 transition-all";

  return (
    /* ─── Full page cinematic background ─── */
    <div className="min-h-screen w-full bg-ambient-glass flex items-center justify-center p-4 relative overflow-hidden">

      {/* Decorative orbs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-emerald-600/08 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 w-[600px] h-[300px] bg-violet-600/05 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-lg animate-fade-in-up">
        <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-black/60"
          style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)' }}>

          {/* ── Header Banner ── */}
          <div className="relative px-8 pt-10 pb-8 text-center overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.20) 0%, rgba(16,185,129,0.10) 100%)' }}>
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-xl"
                style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                {mode === 'landing' && 'HICM Hub'}
                {mode === 'login_form' && 'Sign In'}
                {mode === 'student_register' && 'Student Registration'}
                {mode === 'staff_register' && 'Staff Registration'}
              </h1>
              <p className="text-slate-400 text-sm mt-1.5 font-medium">
                {mode === 'landing' && 'Higher Institute of Human Resource Management'}
                {mode === 'login_form' && 'Enter your credentials to access the portal'}
                {mode === 'student_register' && 'Create your student account'}
                {mode === 'staff_register' && 'Complete your staff profile'}
              </p>
            </div>
          </div>

          {/* ── Body ── */}
          <div className="px-8 py-8 space-y-5">

            {/* Error / Success alerts */}
            {errorMessage && (
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* ── 1. LANDING PAGE ── */}
            {mode === 'landing' && (
              <div className="space-y-6">

                {/* CTA Button */}
                <button
                  type="button"
                  onClick={() => { setMode('login_form'); setErrorMessage(''); setSuccessMessage(''); }}
                  className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-bold text-white text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50"
                  style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
                >
                  <LogIn className="w-5 h-5" />
                  <span>Log In to Portal</span>
                  <ArrowRight className="w-4 h-4 opacity-70" />
                </button>

                {/* Quick Stats Row */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Students', value: '2,400+', color: 'text-indigo-400' },
                    { label: 'Departments', value: '6', color: 'text-emerald-400' },
                    { label: 'Active Now', value: '134', color: 'text-violet-400' },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center p-3 rounded-xl border border-white/06"
                      style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <p className={`text-lg font-black ${stat.color}`}>{stat.value}</p>
                      <p className="text-slate-500 text-[11px] font-medium">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Announcements Section */}
                <div className="rounded-2xl border border-white/10 overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.03)' }}>

                  {/* Announcement Header */}
                  <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/08"
                    style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center">
                        <Bell className="w-4 h-4 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm">Campus Announcements</p>
                        <p className="text-slate-500 text-[10px]">Official Notices</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button type="button" onClick={handleScrollUp}
                        className="p-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                        title="Scroll Up">
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" onClick={handleScrollDown}
                        className="p-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                        title="Scroll Down">
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Scrollable List */}
                  <div ref={scrollRef} className="max-h-[320px] overflow-y-auto divide-y divide-white/06">
                    {announcements.map((ann, idx) => {
                      const colors = [
                        { dot: 'bg-indigo-400', badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
                        { dot: 'bg-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
                        { dot: 'bg-violet-400',  badge: 'bg-violet-500/20 text-violet-300 border-violet-500/30' },
                        { dot: 'bg-amber-400',   badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
                      ];
                      const c = colors[idx % colors.length];
                      return (
                        <div key={ann.id}
                          className="px-5 py-4 hover:bg-white/04 transition-colors group">
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full ${c.dot} mt-1.5 flex-shrink-0`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1.5">
                                <h3 className="text-sm font-semibold text-white leading-snug">{ann.title}</h3>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 uppercase tracking-wide ${c.badge}`}>
                                  {ann.category || 'Notice'}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 leading-relaxed">{ann.content}</p>
                              {ann.imageUrl && (
                                <div className="mt-3 rounded-xl overflow-hidden border border-white/10">
                                  <img src={ann.imageUrl} alt={ann.title} className="w-full max-h-40 object-cover" />
                                </div>
                              )}
                              {ann.videoUrl && (
                                <div className="mt-3 rounded-xl overflow-hidden border border-white/10 bg-black/50">
                                  <video controls src={ann.videoUrl} className="w-full max-h-40 object-contain" />
                                </div>
                              )}
                              <p className="text-[10px] text-slate-600 mt-2 font-medium">{ann.date}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer links */}
                <div className="flex items-center justify-between pt-2 border-t border-white/08">
                  <button type="button"
                    onClick={() => { setMode('student_register'); setErrorMessage(''); setSuccessMessage(''); }}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-300 transition-colors font-medium">
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Register as Student</span>
                  </button>
                  <button type="button"
                    onClick={() => { setMode('login_form'); setErrorMessage(''); setSuccessMessage(''); }}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-300 transition-colors font-medium">
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </button>
                </div>
              </div>
            )}

            {/* ── 2. LOGIN FORM ── */}
            {mode === 'login_form' && (
              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <button type="button"
                  onClick={() => { setMode('landing'); setErrorMessage(''); setSuccessMessage(''); }}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors font-medium mb-1">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Public Home
                </button>

                <div>
                  <label className={labelCls}>Full Name</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      id="loginName"
                      name="username"
                      autoComplete="username"
                      value={loginName}
                      onChange={(e) => setLoginName(e.target.value)}
                      placeholder="Enter your full name"
                      className={`${inputCls} pl-11`}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Matricule / Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      id="loginSecret"
                      name="password"
                      autoComplete="current-password"
                      value={loginSecret}
                      onChange={(e) => setLoginSecret(e.target.value)}
                      placeholder="••••••••"
                      className={`${inputCls} pl-11 font-mono tracking-wider`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-bold text-white text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/30"
                  style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{isLoading ? 'Authenticating…' : 'Sign In to Portal'}</span>
                </button>

                <div className="text-center pt-2 border-t border-white/08">
                  <button type="button"
                    onClick={() => { setMode('student_register'); setErrorMessage(''); setSuccessMessage(''); }}
                    className="text-xs text-slate-500 hover:text-indigo-300 transition-colors">
                    Don't have an account? <span className="font-semibold text-indigo-400">Register here →</span>
                  </button>
                </div>
              </form>
            )}

            {/* ── 3. STUDENT REGISTRATION ── */}
            {mode === 'student_register' && (
              <form onSubmit={handleStudentRegisterSubmit} className="space-y-4">
                <button type="button"
                  onClick={() => { setMode('landing'); setErrorMessage(''); setSuccessMessage(''); }}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors font-medium mb-1">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>

                <div>
                  <label className={labelCls}>Full Name</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Jane Doe" className={`${inputCls} pl-11`} required />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 671234567" className={`${inputCls} pl-11`} required />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Matriculation Number</label>
                  <input type="text" value={matricNo} onChange={(e) => setMatricNo(e.target.value)}
                    placeholder="UBa26C0001" className={`${inputCls} font-mono uppercase`} required />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Department</label>
                    <select value={department} onChange={(e) => setDepartment(e.target.value)} className={selectCls}>
                      <option value="Money and Banking">Money &amp; Banking</option>
                      <option value="Accounting and Finance">Accounting &amp; Finance</option>
                      <option value="Organisational Sciences">Org. Sciences</option>
                      <option value="Management">Management</option>
                      <option value="Insurance and Security">Insurance &amp; Security</option>
                      <option value="Marketing">Marketing</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Level</label>
                    <select value={level} onChange={(e) => setLevel(e.target.value)} className={selectCls}>
                      {['Level 100','Level 200','Level 300','Level 400','Level 500','Level 600'].map(l => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••" className={inputCls} required />
                  </div>
                  <div>
                    <label className={labelCls}>Confirm Password</label>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••" className={inputCls} required />
                  </div>
                </div>

                <button type="submit" disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-white text-sm transition-all duration-200 hover:scale-[1.02] disabled:opacity-60 shadow-lg shadow-emerald-500/20"
                  style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                  <UserCheck2 className="w-4 h-4" />
                  <span>{isLoading ? 'Registering…' : 'Register Student Account'}</span>
                </button>

                <div className="text-center pt-2 border-t border-white/08">
                  <button type="button"
                    onClick={() => { setMode('login_form'); setErrorMessage(''); setSuccessMessage(''); }}
                    className="text-xs text-slate-500 hover:text-indigo-300 transition-colors">
                    Already registered? <span className="font-semibold text-indigo-400">Sign In →</span>
                  </button>
                </div>
              </form>
            )}

            {/* ── 4. STAFF REGISTRATION ── */}
            {mode === 'staff_register' && (
              <form onSubmit={handleStaffRegisterSubmit} className="space-y-4">
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <ShieldCheck className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <div>
                    <p className="text-amber-300 font-bold text-sm">Staff Registration Section</p>
                    <p className="text-amber-400/70 text-xs mt-0.5">Complete your official staff profile below.</p>
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Full Name</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Dr. Robert Vance" className={`${inputCls} pl-11`} required />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 671234567" className={`${inputCls} pl-11`} required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Position</label>
                    <select value={position} onChange={(e) => setPosition(e.target.value)} className={selectCls}>
                      <option value="Lecturer">Lecturer</option>
                      <option value="Senior Academic Staff">Senior Academic Staff</option>
                      <option value="Head of Department">Head of Department</option>
                      <option value="System Administrator">System Administrator</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Gender</label>
                    <select value={gender} onChange={(e) => setGender(e.target.value)} className={selectCls}>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••" className={inputCls} required />
                  </div>
                  <div>
                    <label className={labelCls}>Confirm Password</label>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••" className={inputCls} required />
                  </div>
                </div>

                <button type="submit" disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-white text-sm transition-all duration-200 hover:scale-[1.02] disabled:opacity-60 shadow-lg shadow-amber-500/20"
                  style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isLoading ? 'Registering…' : 'Register Staff Account'}</span>
                </button>
              </form>
            )}

          </div>

          {/* ── Footer ── */}
          <div className="px-8 py-4 border-t border-white/08 text-center"
            style={{ background: 'rgba(0,0,0,0.20)' }}>
            <p className="text-slate-600 text-[11px]">
              © 2026 HICM · Higher Institute of Human Resource Management
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
