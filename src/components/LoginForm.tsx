import React, { useState } from 'react';
import { User } from '../types';
import { ShieldCheck, UserCheck, Key, Mail, User as UserIcon, BookOpen, AlertCircle, Sparkles } from 'lucide-react';

interface LoginFormProps {
  onLogin: (user: User) => void;
  onCancel?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onCancel }) => {
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const [role, setRole] = useState<'student' | 'staff'>('student');

  // Input states
  const [name, setName] = useState<string>('John Doe');
  const [email, setEmail] = useState<string>('student@hicm.edu');
  const [matricNo, setMatricNo] = useState<string>('HICM-2024-089');
  const [staffCodeInput, setStaffCodeInput] = useState<string>('');
  const [department, setDepartment] = useState<string>('Business Administration');
  const [level, setLevel] = useState<string>('Level 300');
  const [staffRole, setStaffRole] = useState<string>('Lecturer');

  // Validation / Error state
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Handle staff code change dynamically
  const handleStaffCodeChange = (code: string) => {
    setStaffCodeInput(code);
    if (code.trim().toUpperCase() === 'STF-123') {
      setRole('staff');
      setErrorMessage('');
    } else {
      setRole('student');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    const isStaff = role === 'staff' || staffCodeInput.trim().toUpperCase() === 'STF-123';

    if (isStaff) {
      if (staffCodeInput.trim().toUpperCase() !== 'STF-123') {
        setErrorMessage('Invalid Staff Code. Use "STF-123" for staff access.');
        return;
      }
      const staffUser: User = {
        id: `staff-${Date.now()}`,
        name: name.trim(),
        email: email.trim(),
        role: 'staff',
        staffCode: 'STF-123',
        department: department,
        status: `${staffRole} - Verified`,
      };
      onLogin(staffUser);
    } else {
      const studentUser: User = {
        id: `std-${Date.now()}`,
        name: name.trim(),
        email: email.trim(),
        role: 'student',
        matricNo: matricNo.trim() || 'HICM-2024-001',
        department: department,
        level: level,
        status: 'Active Student',
      };
      onLogin(studentUser);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto my-6 bg-navy-800 border border-slate-700/60 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
      {/* Header Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-1">
          <BookOpen className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-offwhite tracking-tight">
          {isRegisterMode ? 'Create Account' : 'Portal Authentication'}
        </h2>
        <p className="text-xs text-slate-400">
          Access HICM Hub student dashboard, quiz evaluation & plagiarism checker.
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="flex bg-navy-900/80 p-1 rounded-xl border border-slate-700/50 text-xs font-semibold">
        <button
          type="button"
          onClick={() => {
            setIsRegisterMode(false);
            setErrorMessage('');
          }}
          className={`flex-1 py-2 rounded-lg transition-all ${
            !isRegisterMode
              ? 'bg-emerald-500 text-navy-900 font-bold shadow'
              : 'text-slate-400 hover:text-offwhite'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setIsRegisterMode(true);
            setErrorMessage('');
          }}
          className={`flex-1 py-2 rounded-lg transition-all ${
            isRegisterMode
              ? 'bg-emerald-500 text-navy-900 font-bold shadow'
              : 'text-slate-400 hover:text-offwhite'
          }`}
        >
          Register Account
        </button>
      </div>

      {/* Staff Code Trigger Helper */}
      <div className="p-3 bg-slate-900/60 border border-amber-500/30 rounded-xl text-xs space-y-1">
        <div className="flex items-center space-x-1.5 text-amber-400 font-semibold">
          <Sparkles className="w-4 h-4" />
          <span>Staff Access Shortcut</span>
        </div>
        <p className="text-slate-300">
          Enter staff code <code className="bg-navy-900 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold">STF-123</code> into the Staff Code field to trigger Staff Registration mode!
        </p>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-3 bg-red-500/10 border border-red-500/40 rounded-xl text-red-400 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Full Name */}
        <div className="space-y-1">
          <label className="block text-slate-300 font-medium">Full Name</label>
          <div className="relative">
            <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jane Doe"
              className="w-full bg-navy-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-offwhite focus:outline-none focus:border-emerald-500 transition-colors"
              required
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="block text-slate-300 font-medium">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@hicm.edu"
              className="w-full bg-navy-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-offwhite focus:outline-none focus:border-emerald-500 transition-colors"
              required
            />
          </div>
        </div>

        {/* Staff Code Field */}
        <div className="space-y-1">
          <label className="block text-slate-300 font-medium">
            Staff Verification Code <span className="text-slate-400 font-normal">(Optional for Students)</span>
          </label>
          <div className="relative">
            <Key className="w-4 h-4 text-amber-400 absolute left-3 top-3" />
            <input
              type="text"
              value={staffCodeInput}
              onChange={(e) => handleStaffCodeChange(e.target.value)}
              placeholder="Enter STF-123 for Staff Mode"
              className="w-full bg-navy-900 border border-amber-500/40 rounded-xl pl-9 pr-3 py-2 text-offwhite placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors uppercase font-mono"
            />
          </div>
        </div>

        {/* Dynamic Fields based on Role / Staff Code */}
        {role === 'staff' || staffCodeInput.trim().toUpperCase() === 'STF-123' ? (
          <div className="space-y-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <div className="flex items-center space-x-1.5 text-amber-400 font-bold text-xs uppercase tracking-wide">
              <ShieldCheck className="w-4 h-4" />
              <span>Dynamic Staff Registration Active</span>
            </div>

            <div className="space-y-1">
              <label className="block text-slate-300 font-medium">Staff ID Code</label>
              <input
                type="text"
                readOnly
                value="STF-123 (Verified)"
                className="w-full bg-navy-900/90 border border-amber-500/50 rounded-lg px-3 py-1.5 text-amber-300 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-slate-300 font-medium">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-navy-900 border border-slate-700 rounded-lg px-3 py-1.5 text-offwhite focus:outline-none focus:border-emerald-500"
              >
                <option value="Business Administration">Business Administration</option>
                <option value="Accounting & Finance">Accounting & Finance</option>
                <option value="Management Information Systems">Management Information Systems</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-slate-300 font-medium">Staff Role</label>
              <select
                value={staffRole}
                onChange={(e) => setStaffRole(e.target.value)}
                className="w-full bg-navy-900 border border-slate-700 rounded-lg px-3 py-1.5 text-offwhite focus:outline-none focus:border-emerald-500"
              >
                <option value="Lecturer">Lecturer</option>
                <option value="Senior Academic Staff">Senior Academic Staff</option>
                <option value="Head of Department">Head of Department (HOD)</option>
                <option value="System Administrator">System Administrator</option>
              </select>
            </div>
          </div>
        ) : (
          /* Standard Student Fields */
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="block text-slate-300 font-medium">Matriculation Number</label>
              <input
                type="text"
                value={matricNo}
                onChange={(e) => setMatricNo(e.target.value)}
                placeholder="HICM-2024-001"
                className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-offwhite font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="block text-slate-300 font-medium">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-navy-900 border border-slate-700 rounded-xl px-2.5 py-2 text-offwhite text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="Business Administration">Business Admin</option>
                  <option value="Accounting & Finance">Accounting</option>
                  <option value="Management Systems">MIS</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-300 font-medium">Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full bg-navy-900 border border-slate-700 rounded-xl px-2.5 py-2 text-offwhite text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="Level 100">Level 100</option>
                  <option value="Level 200">Level 200</option>
                  <option value="Level 300">Level 300</option>
                  <option value="Level 400">Level 400</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="pt-2 flex space-x-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 bg-navy-900 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl transition-colors border border-slate-700"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-navy-900 font-bold rounded-xl transition-colors shadow-lg flex items-center justify-center space-x-2"
          >
            <UserCheck className="w-4 h-4" />
            <span>{isRegisterMode ? 'Complete Registration' : 'Sign In to Portal'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
