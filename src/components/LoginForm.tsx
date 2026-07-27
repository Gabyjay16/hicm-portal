import React, { useState } from 'react';
import { User, AdminSettingsConfig } from '../types';
import { ShieldCheck, UserCheck, Key, User as UserIcon, BookOpen, AlertCircle, Lock, Phone, UserCheck2 } from 'lucide-react';

interface LoginFormProps {
  onLogin: (user: User) => void;
  onCancel?: () => void;
  adminSettings?: AdminSettingsConfig;
}

type AuthMode = 'login' | 'student_register' | 'staff_register';

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onCancel, adminSettings }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState<boolean>(false);

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

  // Helper to test if a string is a staff verification code
  const isStaffVerificationCode = (input: string): boolean => {
    const clean = input.trim().toUpperCase();
    return clean === 'STF-123' || clean === 'ADM-123' || clean.startsWith('STF-') || clean.startsWith('ADM-');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!loginName.trim()) {
      setErrorMessage('Please enter your name or staff code.');
      return;
    }

    // 1. Check if user typed a Staff Verification Code in the Name field
    if (isStaffVerificationCode(loginName)) {
      const code = loginName.trim().toUpperCase();
      setMode('staff_register');
      if (code === 'ADM-123' || code.includes('ADM')) {
        setPosition('System Administrator');
      } else {
        setPosition('Lecturer');
      }
      setSuccessMessage(`Staff Code '${code}' recognized! Complete your staff registration below.`);
      return;
    }

    // 2. Standard Login (Student or Staff)
    if (!loginSecret.trim()) {
      setErrorMessage('Please enter your Matricule Number or Password.');
      return;
    }

    setIsLoading(true);

    // Case-insensitive name comparison
    const cleanLoginName = loginName.trim().toLowerCase();
    const cleanSecret = loginSecret.trim();

    // Check if staff/admin login
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
      // Construct user object
      const authenticatedUser: User = {
        id: `${role}-${Date.now()}`,
        name: loginName.trim(), // Keep original capitalization for display
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

    // Check Matricule Verification if enabled
    if (adminSettings?.matriculeVerificationEnabled) {
      if (!adminSettings.validMatricules.includes(matricNo.trim())) {
        setErrorMessage(`Matricule '${matricNo}' is not found in the official system. Please check your matricule.`);
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
    <div className="max-w-md w-full mx-auto my-6 bg-navy-800 border border-slate-700/60 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 font-sans">
      {/* Header Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-1">
          <BookOpen className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-offwhite tracking-tight">
          {mode === 'login' && 'Portal Sign In'}
          {mode === 'student_register' && 'Student Registration'}
          {mode === 'staff_register' && 'Staff Registration'}
        </h2>
        <p className="text-xs text-slate-400">
          {mode === 'login' && 'Students sign in with Name & Matricule. Staff enter Staff Code into Name field.'}
          {mode === 'student_register' && 'Fill in your details below to register your student account.'}
          {mode === 'staff_register' && 'Enter your staff credentials to complete your staff profile.'}
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
          Sign In
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

      {/* ── 1. SIGN IN FORM ────────────────────────────────────────────────────── */}
      {mode === 'login' && (
        <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="block text-slate-300 font-medium">Name or Staff Verification Code</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
                placeholder="Enter Full Name (or STF-123 for Staff)"
                className="w-full bg-navy-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-offwhite focus:outline-none focus:border-emerald-500 transition-colors"
                required
              />
            </div>
            <p className="text-[10px] text-slate-500">Staff: Enter your Staff Code (e.g. STF-123) here and click Sign In.</p>
          </div>

          <div className="space-y-1">
            <label className="block text-slate-300 font-medium">Matricule Number or Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                value={loginSecret}
                onChange={(e) => setLoginSecret(e.target.value)}
                placeholder="Enter Matricule (Students) or Password (Staff)"
                className="w-full bg-navy-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-offwhite focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-navy-900 font-bold rounded-xl transition-colors shadow-lg flex items-center justify-center space-x-2 mt-4"
          >
            <UserCheck className="w-4 h-4" />
            <span>{isLoading ? 'Authenticating...' : 'Sign In to Portal'}</span>
          </button>
        </form>
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
              placeholder="e.g. HICM-2024-001"
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
