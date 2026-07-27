import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, AdminSettingsConfig } from '../types';
import { ShieldCheck, UserCheck, User as UserIcon, BookOpen, AlertCircle, Lock, Phone, UserCheck2, Bell, ChevronUp, ChevronDown, ArrowLeft, LogIn, UserPlus, Sparkles } from 'lucide-react';

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
    title: '📢 2026/2027 Academic Year Registration & Semester Start Notice',
    content: 'Welcome to the Higher Institute of Human Resource Management (HICM). Online course registrations, CA mark verifications, and student services are now active for all departments.',
    date: 'July 26, 2026',
    category: 'Official Notice',
    imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'ann-2',
    title: '🎓 Welcome & Orientation Address by the Director',
    content: 'Watch the official orientation address detailing academic integrity policies, evaluation timetables, and campus facilities.',
    date: 'July 20, 2026',
    category: 'Campus Life',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
  },
  {
    id: 'ann-3',
    title: '📜 CA Marks Verification & Script Remarking Window',
    content: 'All students are advised to check their continuous assessment marks. Any discrepancies or script review requests should be submitted through the portal Complaints Desk.',
    date: 'July 15, 2026',
    category: 'Academic Update',
  },
];

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onCancel, adminSettings }) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('landing');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Public Announcements state
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

  // Messages
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
        // Fallback to default announcements with images/videos
      }
    };
    fetchAnnouncements();
  }, []);

  const handleScrollUp = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ top: -180, behavior: 'smooth' });
    }
  };

  const handleScrollDown = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ top: 180, behavior: 'smooth' });
    }
  };

  // Silent staff verification check (no hints displayed anywhere)
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

    // 1. Silent Staff Code Trigger
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

    // 2. Standard Sign In
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
    } else if (cleanLoginName.includes('dr.') || cleanLoginName.includes('prof') || cleanLoginName.includes('staff') || cleanSecret === 'password123') {
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

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('Please enter your phone number.');
      return;
    }
    if (!matricNo.trim()) {
      setErrorMessage('Please enter your matricule number.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Please enter a password.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (adminSettings?.matriculeVerificationEnabled) {
      if (!adminSettings.validMatricules.includes(matricNo.trim())) {
        setErrorMessage(`Matricule '${matricNo}' is not recognized in the system. Please check your matricule.`);
        return;
      }
    }

    const newStudent: User = {
      id: `std-${Date.now()}`,
      name: name.trim(),
      role: 'student',
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

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('Please enter your phone number.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Please enter a password.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

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

  return (
    <div className="max-w-xl w-full mx-auto my-8 glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 font-sans text-black border border-slate-200/90 backdrop-blur-2xl">
      {/* Header Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 mb-1 shadow-md shadow-blue-500/10">
          <BookOpen className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight flex items-center justify-center gap-2">
          {mode === 'landing' && 'HICM Public Portal'}
          {mode === 'login_form' && 'Portal Sign In'}
          {mode === 'student_register' && 'Student Account Registration'}
          {mode === 'staff_register' && 'Staff Account Registration'}
          <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
        </h2>
        <p className="text-xs font-semibold text-black">
          {mode === 'landing' && 'Higher Institute of Human Resource Management - Campus Announcements'}
          {mode === 'login_form' && 'Sign in with your Name and Matricule Number.'}
          {mode === 'student_register' && 'Register your student account with your details below.'}
          {mode === 'staff_register' && 'Complete your official staff profile.'}
        </p>
      </div>

      {/* Error / Info Messages */}
      {errorMessage && (
        <div className="p-3 bg-red-500/10 border border-red-500/40 text-red-400 rounded-xl text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 rounded-xl text-xs flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* ── 1. PUBLIC LANDING PAGE (MODE = 'landing') ────────────────────────── */}
      {mode === 'landing' && (
        <div className="space-y-6">
          {/* TOP LOGIN BUTTON */}
          <div>
            <button
              type="button"
              onClick={() => {
                setMode('login_form');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-500 hover:to-blue-600 text-white font-extrabold text-sm rounded-2xl transition-all shadow-xl shadow-blue-600/30 hover:scale-[1.01] active:scale-[0.99] border border-blue-400/30 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <LogIn className="w-5 h-5 text-yellow-400" />
              <span>Log In to Portal</span>
            </button>
          </div>

          {/* PUBLIC ADMIN ANNOUNCEMENTS FEED */}
          <div className="bg-white/90 border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-black font-extrabold text-sm">
                <Bell className="w-5 h-5 text-yellow-600 animate-bounce" />
                <span className="text-black">
                  Campus Announcements &amp; Official Notices
                </span>
              </div>

              {/* SCROLL UP & SCROLL DOWN BUTTONS */}
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={handleScrollUp}
                  title="Scroll Up"
                  className="p-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-blue-700 transition-all shadow hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleScrollDown}
                  title="Scroll Down"
                  className="p-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-blue-700 transition-all shadow hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Announcements List */}
            <div
              ref={scrollRef}
              className="max-h-[380px] overflow-y-auto space-y-4 pr-2 scrollbar-thin"
            >
              {announcements.map((ann, idx) => {
                const isYellow = idx % 3 === 1;
                const isRed = idx % 3 === 2;
                return (
                  <div
                    key={ann.id}
                    className={`p-4 rounded-2xl border transition-all duration-300 hover:scale-[1.01] ${
                      isRed
                        ? 'glass-card-red'
                        : isYellow
                        ? 'glass-card-yellow'
                        : 'glass-card-blue'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-sm font-extrabold text-black leading-tight">{ann.title}</h3>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex-shrink-0 uppercase border shadow-sm ${
                        isRed
                          ? 'bg-red-100 border-red-300 text-red-700'
                          : isYellow
                          ? 'bg-yellow-100 border-yellow-300 text-yellow-800'
                          : 'bg-blue-100 border-blue-300 text-blue-800'
                      }`}>
                        {ann.category || 'Notice'}
                      </span>
                    </div>

                    <p className="text-xs text-black leading-relaxed mt-2 font-medium">{ann.content}</p>

                    {/* Photos */}
                    {ann.imageUrl && (
                      <div className="mt-3 rounded-xl overflow-hidden border border-slate-200 shadow-md">
                        <img src={ann.imageUrl} alt={ann.title} className="w-full max-h-56 object-cover hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}

                    {/* Videos */}
                    {ann.videoUrl && (
                      <div className="mt-3 rounded-xl overflow-hidden border border-slate-200 bg-black shadow-md">
                        <video controls src={ann.videoUrl} className="w-full max-h-56 object-contain" />
                      </div>
                    )}

                    <p className="text-[10px] text-black pt-2 font-semibold">Posted: {ann.date}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECONDARY LOGIN BUTTON BELOW ANNOUNCEMENTS */}
          <div>
            <button
              type="button"
              onClick={() => {
                setMode('login_form');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className="w-full py-3.5 bg-black/80 hover:bg-black/90 text-yellow-400 border border-yellow-500/50 font-extrabold text-sm rounded-2xl transition-all shadow-xl hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center space-x-2 cursor-pointer backdrop-blur-xl"
            >
              <LogIn className="w-4 h-4 text-blue-400" />
              <span>Log In to Portal</span>
            </button>
          </div>

          {/* NOT A STUDENT? TEXT LINK TO REGISTRATION PAGE */}
          <div className="text-center pt-3 border-t border-white/10 space-y-1">
            <p className="text-xs text-black font-medium">Not a student?</p>
            <button
              type="button"
              onClick={() => {
                setMode('student_register');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className="text-xs font-extrabold text-blue-400 hover:text-yellow-400 hover:underline transition-colors cursor-pointer"
            >
              Click here to go to the Registration Page →
            </button>
          </div>
        </div>
      )}

      {/* ── 2. LOGIN FORM PAGE (MODE = 'login_form') ─────────────────────────── */}
      {mode === 'login_form' && (
        <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
          <button
            type="button"
            onClick={() => {
              setMode('landing');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className="flex items-center gap-1.5 text-xs text-blue-700 hover:text-blue-900 font-extrabold mb-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-blue-600" /> Back to Public Home
          </button>

          <div className="space-y-1">
            <label className="block text-black font-bold">Full Name</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-blue-600 absolute left-3 top-3.5" />
              <input
                type="text"
                id="loginName"
                name="username"
                autoComplete="username"
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
                placeholder="Enter Full Name"
                className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-3 text-black placeholder-slate-600 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-sm transition-all font-semibold"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-black font-bold">Matricule Number</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-blue-600 absolute left-3 top-3.5" />
              <input
                type="password"
                id="loginSecret"
                name="password"
                autoComplete="current-password"
                value={loginSecret}
                onChange={(e) => setLoginSecret(e.target.value)}
                placeholder="UBa26C0001"
                className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-3 text-black placeholder-slate-600 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-sm transition-all font-mono tracking-wider"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl transition-all shadow-lg shadow-blue-600/25 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center space-x-2 mt-4 cursor-pointer"
          >
            <UserCheck className="w-4 h-4 text-yellow-300" />
            <span>{isLoading ? 'Authenticating...' : 'Sign In to Portal'}</span>
          </button>

          <div className="text-center pt-3 border-t border-slate-200 space-y-1">
            <p className="text-xs text-black font-medium">Not a student?</p>
            <button
              type="button"
              onClick={() => {
                setMode('student_register');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:underline transition-colors cursor-pointer"
            >
              Click here to go to the Registration Page →
            </button>
          </div>
        </form>
      )}

      {/* ── 3. STUDENT REGISTRATION FORM (MODE = 'student_register') ─────────── */}
      {mode === 'student_register' && (
        <form onSubmit={handleStudentRegisterSubmit} className="space-y-4 text-xs">
          <button
            type="button"
            onClick={() => {
              setMode('landing');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className="flex items-center gap-1.5 text-xs text-black hover:text-white font-medium mb-2"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-400" /> Back to Public Home
          </button>

          <div className="space-y-1">
            <label className="block text-black font-medium">Full Name</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-black absolute left-3 top-3" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jane Doe"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-black focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-black font-medium">Phone Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-black absolute left-3 top-3" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 671234567"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-black focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-black font-medium">Matriculation Number</label>
            <input
              type="text"
              value={matricNo}
              onChange={(e) => setMatricNo(e.target.value)}
              placeholder="UBa26C0001"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-black font-mono uppercase focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="block text-black font-medium">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2.5 text-black text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="Money and Banking">Money &amp; Banking</option>
                <option value="Accounting and Finance">Accounting &amp; Finance</option>
                <option value="Organisational Sciences">Org. Sciences</option>
                <option value="Management">Management</option>
                <option value="Insurance and Security">Insurance &amp; Security</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-black font-medium">Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2.5 text-black text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="Level 100">Level 100</option>
                <option value="Level 200">Level 200</option>
                <option value="Level 300">Level 300</option>
                <option value="Level 400">Level 400</option>
                <option value="Level 500">Level 500</option>
                <option value="Level 600">Level 600</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="block text-black font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-black focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="block text-black font-medium">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-black focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-navy-900 font-bold rounded-xl transition-colors shadow-lg flex items-center justify-center space-x-2 mt-4"
          >
            <UserCheck2 className="w-4 h-4" />
            <span>{isLoading ? 'Registering...' : 'Register Student Account'}</span>
          </button>

          <div className="text-center pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                setMode('login_form');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className="text-xs font-semibold text-emerald-400 hover:underline"
            >
              Already registered? Click here to Sign In →
            </button>
          </div>
        </form>
      )}

      {/* ── 4. STAFF REGISTRATION FORM (MODE = 'staff_register') ───────────── */}
      {mode === 'staff_register' && (
        <form onSubmit={handleStaffRegisterSubmit} className="space-y-4 text-xs">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-2 text-amber-400 font-bold">
            <ShieldCheck className="w-5 h-5 flex-shrink-0" />
            <span>Staff Registration Section</span>
          </div>

          <div className="space-y-1">
            <label className="block text-black font-medium">Full Name</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-black absolute left-3 top-3" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dr. Robert Vance"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-black focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-black font-medium">Phone Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-black absolute left-3 top-3" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 671234567"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-black focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="block text-black font-medium">Position</label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2.5 text-black text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="Lecturer">Lecturer</option>
                <option value="Senior Academic Staff">Senior Academic Staff</option>
                <option value="Head of Department">Head of Department (HOD)</option>
                <option value="System Administrator">System Administrator</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-black font-medium">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2.5 text-black text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="block text-black font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-black focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="block text-black font-medium">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-black focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-navy-900 font-bold rounded-xl transition-colors shadow-lg flex items-center justify-center space-x-2 mt-4"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isLoading ? 'Registering Staff...' : 'Register Staff Account'}</span>
          </button>
        </form>
      )}
    </div>
  );
};
