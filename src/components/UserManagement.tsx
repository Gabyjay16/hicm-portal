import React, { useState } from 'react';
import { Search, Users, GraduationCap, ChevronDown, ChevronUp, User as UserIcon, ShieldAlert, CheckSquare, Square } from 'lucide-react';
import { AdminSettingsConfig, User } from '../types';

// Mock data for demo
const MOCK_STUDENTS = [
  { id: 'std-2026-089', name: 'Jane Doe', matricNo: 'HICM-2024-089', department: 'Business Administration', level: 'Level 300', status: 'Active', joinDate: '2024-09-01', email: 'j.doe@student.hicm.edu', canUpdateAnnouncements: false, canViewAllForums: false, canManageComplaints: false, hasVotingPermit: false },
  { id: 'std-2026-090', name: 'Paul Nkemdirim', matricNo: 'HICM-2024-090', department: 'Human Resources', level: 'Level 200', status: 'Active', joinDate: '2024-09-01', email: 'p.nkemdirim@student.hicm.edu', canUpdateAnnouncements: false, canViewAllForums: false, canManageComplaints: false, hasVotingPermit: false },
  { id: 'std-2026-091', name: 'Fatima Bah', matricNo: 'HICM-2024-091', department: 'Business Administration', level: 'Level 400', status: 'Active', joinDate: '2024-09-02', email: 'f.bah@student.hicm.edu', canUpdateAnnouncements: true, canViewAllForums: true, canManageComplaints: true, hasVotingPermit: true },
  { id: 'std-2026-092', name: 'Chukwuemeka Eze', matricNo: 'HICM-2024-092', department: 'Marketing', level: 'Level 100', status: 'Active', joinDate: '2025-09-01', email: 'c.eze@student.hicm.edu', canUpdateAnnouncements: false, canViewAllForums: false, canManageComplaints: false, hasVotingPermit: false },
  { id: 'std-2026-093', name: 'Abena Mensah', matricNo: 'HICM-2024-093', department: 'Accounting', level: 'Level 500', status: 'Suspended', joinDate: '2023-09-01', email: 'a.mensah@student.hicm.edu', canUpdateAnnouncements: false, canViewAllForums: false, canManageComplaints: false, hasVotingPermit: false },
  { id: 'std-2026-094', name: 'Kwame Asante', matricNo: 'HICM-2024-094', department: 'Finance', level: 'Level 600', status: 'Active', joinDate: '2022-09-01', email: 'k.asante@student.hicm.edu', canUpdateAnnouncements: false, canViewAllForums: false, canManageComplaints: false, hasVotingPermit: false },
];


const MOCK_STAFF = [
  { id: 'stf-001', name: 'Dr. Samuel Ngwa', staffCode: 'STF-123', department: 'Business Administration', role: 'Lecturer', status: 'Active', isForumApproved: false, joinDate: '2020-01-15', email: 's.ngwa@staff.hicm.edu', canManageComplaints: false, canViewAllForums: false, canUpdateAnnouncements: false, canVerifyMatricules: false, canViewAllStudents: false },
  { id: 'stf-002', name: 'Prof. Amina Bello', staffCode: 'STF-456', department: 'Human Resources', role: 'Professor', status: 'Active', isForumApproved: true, joinDate: '2018-08-20', email: 'a.bello@staff.hicm.edu', canManageComplaints: true, canViewAllForums: false, canUpdateAnnouncements: false, canVerifyMatricules: false, canViewAllStudents: false },
  { id: 'stf-003', name: 'Ms. Grace Okafor', staffCode: 'STF-789', department: 'Counselling', role: 'Counsellor', status: 'Active', isForumApproved: true, joinDate: '2021-03-10', email: 'g.okafor@staff.hicm.edu', canManageComplaints: false, canViewAllForums: false, canUpdateAnnouncements: false, canVerifyMatricules: false, canViewAllStudents: false },
];

type Tab = 'students' | 'staff';

export const UserManagement: React.FC<{ adminSettings?: AdminSettingsConfig }> = ({ adminSettings }) => {
  const [activeTab, setActiveTab] = useState<Tab>('students');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [students, setStudents] = useState<User[]>(MOCK_STUDENTS as unknown as User[]);
  const [staffList, setStaffList] = useState<User[]>(MOCK_STAFF as unknown as User[]);

  // Update students if matricules are enforced
  React.useEffect(() => {
    if (adminSettings?.matriculeVerificationEnabled && adminSettings.validMatricules.length > 0) {
      setStudents(prev => prev.map(s => {
        if (s.matricNo && !adminSettings.validMatricules.includes(s.matricNo)) {
          return { ...s, status: 'Suspended (Invalid Matricule)' };
        } else if (s.status === 'Suspended (Invalid Matricule)') {
          return { ...s, status: 'Active' };
        }
        return s;
      }));
    }
  }, [adminSettings?.matriculeVerificationEnabled, adminSettings?.validMatricules]);

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.matricNo && s.matricNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.department && s.department.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredStaff = staffList.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.staffCode && s.staffCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.department && s.department.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const statusBadge = (status: string) => (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
      status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
    }`}>{status}</span>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16 md:pb-6 font-sans">
      <div>
        <h2 className="text-2xl font-bold text-black">User Management</h2>
        <p className="text-sm text-black mt-1">View and manage all registered students and staff.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-100 p-1 rounded-2xl w-fit">
        {[
          { key: 'students' as Tab, label: 'Students', icon: GraduationCap, count: filteredStudents.length },
          { key: 'staff' as Tab, label: 'Staff', icon: Users, count: filteredStaff.length },
        ].map(({ key, label, icon: Icon, count }) => (
          <button
            key={key}
            onClick={() => { setActiveTab(key); setExpandedId(null); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === key
                ? 'bg-white shadow text-black'
                : 'text-black hover:text-black'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === key ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-black'
            }`}>{count}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-black" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Search ${activeTab === 'students' ? 'students' : 'staff'}...`}
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:border-emerald-500 shadow-sm"
        />
      </div>

      {/* List */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {activeTab === 'students' ? (
          filteredStudents.length === 0 ? (
            <p className="p-6 text-xs text-black text-center">No students found.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredStudents.map((student) => {
                const isExpanded = expandedId === student.id;
                return (
                  <div key={student.id}>
                    <button
                      onClick={() => toggleExpand(student.id)}
                      className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <UserIcon className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-black truncate">{student.name}</p>
                        <p className="text-xs text-black">{student.matricNo || 'N/A'} · {student.department || 'N/A'}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-xs text-black hidden sm:block">{student.level}</span>
                        {statusBadge(student.status || '')}
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-black" /> : <ChevronDown className="w-4 h-4 text-black" />}
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="px-6 pb-4 pt-2 bg-slate-50 border-t border-slate-100 flex flex-col gap-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {[
                            { label: 'Student ID', value: student.id },
                            { label: 'Email', value: student.email },
                            { label: 'Level', value: student.level },
                            { label: 'Department', value: student.department },
                            { label: 'Status', value: student.status },
                            { label: 'Join Date', value: student.joinDate },
                          ].map(({ label, value }) => (
                            <div key={label} className="space-y-0.5">
                              <p className="text-[10px] text-black font-semibold uppercase tracking-wider">{label}</p>
                              <p className="text-sm text-black font-medium">{value}</p>
                            </div>
                          ))}
                        </div>

                        {/* Permissions Section */}
                        <div className="border-t border-slate-200 pt-3 mt-1">
                          <p className="text-[10px] text-black font-semibold uppercase tracking-wider mb-2">Student Permissions</p>
                          <div className="flex flex-col sm:flex-row flex-wrap gap-4 mt-3">
                            <button
                              onClick={() => {
                                setStudents(prev => prev.map(s => s.id === student.id ? { ...s, canUpdateAnnouncements: !s.canUpdateAnnouncements } : s));
                              }}
                              className="flex items-center gap-2 text-sm text-black"
                            >
                              {student.canUpdateAnnouncements ? <CheckSquare className="w-5 h-5 text-emerald-500" /> : <Square className="w-5 h-5 text-black" />}
                              Can Update Announcement Board
                            </button>
                            <button
                              onClick={() => {
                                setStudents(prev => prev.map(s => s.id === student.id ? { ...s, canViewAllForums: !s.canViewAllForums } : s));
                              }}
                              className="flex items-center gap-2 text-sm text-black"
                            >
                              {student.canViewAllForums ? <CheckSquare className="w-5 h-5 text-emerald-500" /> : <Square className="w-5 h-5 text-black" />}
                              Can View & Reply in All Forums
                            </button>
                            <button
                              onClick={() => {
                                setStudents(prev => prev.map(s => s.id === student.id ? { ...s, canManageComplaints: !s.canManageComplaints } : s));
                              }}
                              className="flex items-center gap-2 text-sm text-black"
                            >
                              {student.canManageComplaints ? <CheckSquare className="w-5 h-5 text-emerald-500" /> : <Square className="w-5 h-5 text-black" />}
                              Can Manage Complaints
                            </button>
                            <button
                              onClick={() => {
                                setStudents(prev => prev.map(s => s.id === student.id ? { ...s, hasVotingPermit: !s.hasVotingPermit } : s));
                              }}
                              className="flex items-center gap-2 text-sm text-black"
                            >
                              {student.hasVotingPermit ? <CheckSquare className="w-5 h-5 text-emerald-500" /> : <Square className="w-5 h-5 text-black" />}
                              Voting Permit
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        ) : (
          filteredStaff.length === 0 ? (
            <p className="p-6 text-xs text-black text-center">No staff found.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredStaff.map((staff) => {
                const isExpanded = expandedId === staff.id;
                return (
                  <div key={staff.id}>
                    <button
                      onClick={() => toggleExpand(staff.id)}
                      className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <UserIcon className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-black truncate">{staff.name}</p>
                        <p className="text-xs text-black">{staff.staffCode} · {staff.department}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold hidden sm:block ${
                          staff.isForumApproved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>{staff.isForumApproved ? 'Forum Approved' : 'Pending Forum'}</span>
                        {statusBadge(staff.status || '')}
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-black" /> : <ChevronDown className="w-4 h-4 text-black" />}
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="px-6 pb-4 pt-2 bg-slate-50 border-t border-slate-100 flex flex-col gap-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {[
                            { label: 'Staff ID', value: staff.id },
                            { label: 'Email', value: staff.email },
                            { label: 'Role', value: staff.role },
                            { label: 'Department', value: staff.department },
                            { label: 'Forum Status', value: staff.isForumApproved ? 'Approved' : 'Pending' },
                            { label: 'Join Date', value: staff.joinDate },
                          ].map(({ label, value }) => (
                            <div key={label} className="space-y-0.5">
                              <p className="text-[10px] text-black font-semibold uppercase tracking-wider">{label}</p>
                              <p className="text-sm text-black font-medium">{value}</p>
                            </div>
                          ))}
                        </div>
                        
                        <div className="border-t border-slate-200 pt-3 mt-1">
                          <p className="text-[10px] text-black font-semibold uppercase tracking-wider mb-2">Staff Permissions</p>
                          <div className="flex flex-col sm:flex-row flex-wrap gap-4">
                            <button
                              onClick={() => {
                                setStaffList(prev => prev.map(s => s.id === staff.id ? { ...s, canManageComplaints: !s.canManageComplaints } : s));
                              }}
                              className="flex items-center gap-2 text-sm text-black"
                            >
                              {staff.canManageComplaints ? <CheckSquare className="w-5 h-5 text-emerald-500" /> : <Square className="w-5 h-5 text-black" />}
                              Can Manage Complaints
                            </button>
                            <button
                              onClick={() => {
                                setStaffList(prev => prev.map(s => s.id === staff.id ? { ...s, canViewAllForums: !s.canViewAllForums } : s));
                              }}
                              className="flex items-center gap-2 text-sm text-black"
                            >
                              {staff.canViewAllForums ? <CheckSquare className="w-5 h-5 text-emerald-500" /> : <Square className="w-5 h-5 text-black" />}
                              Full Forum Access
                            </button>
                            <button
                              onClick={() => {
                                setStaffList(prev => prev.map(s => s.id === staff.id ? { ...s, canUpdateAnnouncements: !s.canUpdateAnnouncements } : s));
                              }}
                              className="flex items-center gap-2 text-sm text-black"
                            >
                              {staff.canUpdateAnnouncements ? <CheckSquare className="w-5 h-5 text-emerald-500" /> : <Square className="w-5 h-5 text-black" />}
                              Manage Announcements
                            </button>
                            <button
                              onClick={() => {
                                setStaffList(prev => prev.map(s => s.id === staff.id ? { ...s, canVerifyMatricules: !s.canVerifyMatricules } : s));
                              }}
                              className="flex items-center gap-2 text-sm text-black"
                            >
                              {staff.canVerifyMatricules ? <CheckSquare className="w-5 h-5 text-emerald-500" /> : <Square className="w-5 h-5 text-black" />}
                              Verify Matricules
                            </button>
                            <button
                              onClick={() => {
                                setStaffList(prev => prev.map(s => s.id === staff.id ? { ...s, canViewAllStudents: !s.canViewAllStudents } : s));
                              }}
                              className="flex items-center gap-2 text-sm text-black"
                            >
                              {staff.canViewAllStudents ? <CheckSquare className="w-5 h-5 text-emerald-500" /> : <Square className="w-5 h-5 text-black" />}
                              View All Students
                            </button>
                            <button
                              onClick={() => {
                                setStaffList(prev => prev.map(s => s.id === staff.id ? { ...s, canManageElections: !s.canManageElections } : s));
                              }}
                              className="flex items-center gap-2 text-sm text-black"
                            >
                              {staff.canManageElections ? <CheckSquare className="w-5 h-5 text-emerald-500" /> : <Square className="w-5 h-5 text-black" />}
                              Manage Elections
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
};
