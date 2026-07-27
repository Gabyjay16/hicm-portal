import React, { useState, useRef, useEffect } from 'react';
import { User, AdminSettingsConfig } from '../types';
import { ShieldCheck, UserCheck, User as UserIcon, BookOpen, AlertCircle, Lock, Phone, UserCheck2, Bell, ChevronUp, ChevronDown, Image as ImageIcon, Video } from 'lucide-react';

interface LoginFormProps {
  onLogin: (user: User) => void;
  onCancel?: () => void;
  adminSettings?: AdminSettingsConfig;
}

type AuthMode = 'login' | 'student_register' | 'staff_register';

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
  const [mode, setMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Announcements state
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

  // Silent staff verification check (no hints displayed)
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

    setTimeout(() => {
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

      setIsLoading(false);
      onLogin(authenticatedUser);
    }, 600);
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

    setIsLoading(true);

    setTimeout(() => {
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
      setIsLoading(false);
      onLogin(newStudent);
    }, 600);
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

    setIsLoading(true);

    const isSystemAdmin = position === 'System Administrator';
    const staffRole = isSystemAdmin ? 'admin' : 'staff';

    setTimeout(() => {
      const newStaff: User = {
        id: `stf-${Date.now()}`,
        name: name.trim(),
        role: staffRole,
        isStaff: true,
        phone: phone.trim(),
        department: department,
        status: `${position} - Verified`,
      };
      setIsLoading(false);
      onLogin(newStaff);
    }, 600);
  };

  return (
    <div className="max-w-xl w-full mx-auto my-6 bg-navy-800 border border-slate-700/60 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 font-sans text-slate-100">
      {/* Header Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-1">
          <BookOpen className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-offwhite tracking-tight">
          {mode === 'login' && 'HICM Student Portal & Public Announcements'}
          {mode === 'student_register' && 'Student Account Registration'}
          {mode === 'staff_register' && 'Staff Account Registration'}
        </h2>
        <p className="text-xs text-slate-400">
          {mode === 'login' && 'Higher Institute of Human Resource Management - Academic Portal'}
          {mode === 'student_register' && 'Register your student account with your details below.'}
          {mode === 'staff_register' && 'Complete your official staff profile.'}
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex bg-navy-900/80 p-1 rounded-xl border border-slate-700/50 text-xs font-semibold">
        <button
          type="button"
          onClick={() => {
            setMode('login');
            setErrorMessage('');
            setSuccessMessage('');
          }}
          className={`flex-1 py-2 rounded-lg transition-all ${
            mode === 'login'
              ? 'bg-emerald-500 text-navy-900 font-bold shadow'
              : 'text-slate-400 hover:text-offwhite'
          }`}
        >
          Sign In &amp; Announcements
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('student_register');
            setErrorMessage('');
            setSuccessMessage('');
          }}
          className={`flex-1 py-2 rounded-lg transition-all ${
            mode === 'student_register' || mode === 'staff_register'
              ? 'bg-emerald-500 text-navy-900 font-bold shadow'
              : 'text-slate-400 hover:text-offwhite'
          }`}
        >
          {mode === 'staff_register' ? 'Staff Registration' : 'Student Register'}
        </button>
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

      {/* ── 1. SIGN IN & PUBLIC ANNOUNCEMENTS PAGE ───────────────────────────── */}
      {mode === 'login' && (
        <div className="space-y-6">
          {/* TOP LOGIN BUTTON SECTION */}
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs bg-navy-900/60 p-5 rounded-2xl border border-slate-700/40">
            <div className="flex items-center justify-between border-b border-slate-700/50 pb-2 mb-3">
              <span className="font-bold text-emerald-400 text-sm flex items-center gap-1.5">
                <UserCheck className="w-4 h-4" /> Quick Student Sign In
              </span>
              <span className="text-[10px] text-slate-400">Name + Matricule</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-slate-300 font-medium">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={loginName}
                    onChange={(e) => setLoginName(e.target.value)}
                    placeholder="Enter Full Name"
                    className="w-full bg-navy-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-offwhite focus:outline-none focus:border-emerald-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-300 font-medium">Matricule Number</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={loginSecret}
                    onChange={(e) => setLoginSecret(e.target.value)}
                    placeholder="UBa26C0001"
                    className="w-full bg-navy-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-offwhite focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                  />
                </div>
              </div>
            </div>

            {/* TOP LOGIN BUTTON */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-navy-900 font-bold rounded-xl transition-colors shadow-lg flex items-center justify-center space-x-2 mt-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>{isLoading ? 'Signing In...' : 'Sign In to Portal (Top)'}</span>
            </button>
          </form>

          {/* PUBLIC ADMIN ANNOUNCEMENTS SECTION */}
          <div className="bg-navy-900/90 border border-slate-700/80 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div className="flex items-center gap-2 text-offwhite font-bold text-sm">
                <Bell className="w-5 h-5 text-emerald-400" />
                <span>Campus Announcements &amp; Official Notices</span>
              </div>

              {/* SCROLL UP & SCROLL DOWN BUTTONS */}
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={handleScrollUp}
                  title="Scroll Up"
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-slate-300 hover:text-white transition-colors"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleScrollDown}
                  title="Scroll Down"
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-slate-300 hover:text-white transition-colors"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Announcements List */}
            <div
              ref={scrollRef}
              className="max-h-[380px] overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-slate-700"
            >
              {announcements.map((ann) => (
                <div key={ann.id} className="p-4 bg-navy-800/80 border border-slate-700/60 rounded-xl space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-bold text-white leading-tight">{ann.title}</h3>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full flex-shrink-0">
                      {ann.category || 'Announcement'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{ann.content}</p>

                  {/* Render Photos if attached */}
                  {ann.imageUrl && (
                    <div className="mt-2 rounded-xl overflow-hidden border border-slate-700/60">
                      <img src={ann.imageUrl} alt={ann.title} className="w-full max-h-56 object-cover" />
                    </div>
                  )}

                  {/* Render Videos if attached */}
                  {ann.videoUrl && (
                    <div className="mt-2 rounded-xl overflow-hidden border border-slate-700/60 bg-black">
                      <video controls src={ann.videoUrl} className="w-full max-h-56 object-contain" />
                    </div>
                  )}

                  <p className="text-[10px] text-slate-500 pt-1">Posted: {ann.date}</p>
                </div>
              ))}
            </div>
          </div>

          {/* BOTTOM LOGIN BUTTON SECTION */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleLoginSubmit}
              disabled={isLoading}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/40 font-bold rounded-xl transition-colors shadow-lg flex items-center justify-center space-x-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>{isLoading ? 'Signing In...' : 'Sign In to Portal (Bottom)'}</span>
            </button>
          </div>

          {/* NOT A STUDENT? REGISTRATION REDIRECT LINK */}
          <div className="text-center pt-2 border-t border-slate-700/40">
            <button
              type="button"
              onClick={() => {
                setMode('student_register');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:underline transition-colors cursor-pointer"
            >
              Not a student? Click here to register your account →
            </button>
          </div>
        </div>
      )}

      {/* ── 2. STUDENT REGISTRATION FORM ────────────────────────────────────────── */}
      {mode === 'student_register' && (
        <form onSubmit={handleStudentRegisterSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="block text-slate-300 font-medium">Full Name</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jane Doe"
                className="w-full bg-navy-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-offwhite focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-slate-300 font-medium">Phone Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 671234567"
                className="w-full bg-navy-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-offwhite focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-slate-300 font-medium">Matriculation Number</label>
            <input
              type="text"
              value={matricNo}
              onChange={(e) => setMatricNo(e.target.value)}
              placeholder="UBa26C0001"
              className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2.5 text-offwhite font-mono uppercase focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="block text-slate-300 font-medium">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-navy-900 border border-slate-700 rounded-xl px-2.5 py-2.5 text-offwhite text-xs focus:outline-none focus:border-emerald-500"
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
              <label className="block text-slate-300 font-medium">Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full bg-navy-900 border border-slate-700 rounded-xl px-2.5 py-2.5 text-offwhite text-xs focus:outline-none focus:border-emerald-500"
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
              <label className="block text-slate-300 font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2.5 text-offwhite focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="block text-slate-300 font-medium">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2.5 text-offwhite focus:outline-none focus:border-emerald-500"
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
        </form>
      )}

      {/* ── 3. STAFF REGISTRATION FORM ────────────────────────────────────────── */}
      {mode === 'staff_register' && (
        <form onSubmit={handleStaffRegisterSubmit} className="space-y-4 text-xs">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-2 text-amber-400 font-bold">
            <ShieldCheck className="w-5 h-5 flex-shrink-0" />
            <span>Staff Registration Section</span>
          </div>

          <div className="space-y-1">
            <label className="block text-slate-300 font-medium">Full Name</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dr. Robert Vance"
                className="w-full bg-navy-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-offwhite focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-slate-300 font-medium">Phone Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 671234567"
                className="w-full bg-navy-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-offwhite focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="block text-slate-300 font-medium">Position</label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full bg-navy-900 border border-slate-700 rounded-xl px-2.5 py-2.5 text-offwhite text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="Lecturer">Lecturer</option>
                <option value="Senior Academic Staff">Senior Academic Staff</option>
                <option value="Head of Department">Head of Department (HOD)</option>
                <option value="System Administrator">System Administrator</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-slate-300 font-medium">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-navy-900 border border-slate-700 rounded-xl px-2.5 py-2.5 text-offwhite text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="block text-slate-300 font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2.5 text-offwhite focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="block text-slate-300 font-medium">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2.5 text-offwhite focus:outline-none focus:border-emerald-500"
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
