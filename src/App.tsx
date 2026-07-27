import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { User, ForumMessage } from './types';

// Layouts
import { StudentLayout } from './layouts/StudentLayout';
import { StaffLayout } from './layouts/StaffLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Components
import { LoginForm } from './components/LoginForm';
import { StudentDashboard } from './components/StudentDashboard';
import { StaffDashboard } from './components/StaffDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { TimedEvaluation } from './components/TimedEvaluation';
import { PlagiarismTest } from './components/PlagiarismTest';
import { GeneralForum } from './components/GeneralForum';
import { AlertsView } from './components/AlertsView';
import { NotesView } from './components/NotesView';
import { ComplaintsDesk } from './components/ComplaintsDesk';
import { LostAndFound } from './components/LostAndFound';
import { ElectionsView } from './components/ElectionsView';
import { TokenRequestsAdmin } from './components/TokenRequestsAdmin';

export default function App() {
  // Authenticated user state
  const [user, setUser] = useState<User | null>({
    id: 'std-2026-089',
    name: 'Jane Doe',
    email: 'j.doe@student.hicm.edu',
    role: 'student',
    matricNo: 'HICM-2024-089',
    department: 'Business Administration',
    level: 'Level 300',
    status: 'Active Student - Verified',
  });

  const [plagiarismTokens, setPlagiarismTokens] = useState<number>(5);



  const handleUsePlagiarismToken = (): boolean => {
    if (plagiarismTokens >= 1) {
      setPlagiarismTokens((prev) => prev - 1);
      return true;
    }
    return false;
  };

  const handleAddTokens = (amount: number) => {
    setPlagiarismTokens((prev) => prev + amount);
  };



  const handleLogin = (newUser: User) => {
    setUser(newUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginForm onLogin={handleLogin} />} />

        {/* Root Redirect based on Role */}
        <Route 
          path="/" 
          element={
            !user ? <Navigate to="/login" replace /> :
            user.role === 'student' ? <Navigate to="/student/dashboard" replace /> :
            user.role === 'staff' ? <Navigate to="/staff/dashboard" replace /> :
            <Navigate to="/admin/dashboard" replace />
          } 
        />

        {/* Student Routes */}
        <Route path="/student" element={<StudentLayout user={user} onLogout={handleLogout} />}>
          <Route path="dashboard" element={
            <StudentDashboard 
              user={user} 
              plagiarismTokens={plagiarismTokens} 
            />
          } />
          <Route path="evaluation" element={<TimedEvaluation user={user} />} />
          <Route path="plagiarism" element={
            <PlagiarismTest 
              user={user}
            />
          } />
          <Route path="forum" element={
            <GeneralForum 
              currentUser={user} 
            />
          } />
          <Route path="alerts" element={<AlertsView />} />
          <Route path="notes" element={<NotesView user={user} />} />
          <Route path="complaints" element={<ComplaintsDesk user={user} />} />
          <Route path="lost-and-found" element={<LostAndFound user={user} />} />
          <Route path="elections" element={<ElectionsView user={user} />} />
        </Route>

        {/* Staff Routes */}
        <Route path="/staff" element={<StaffLayout user={user} onLogout={handleLogout} />}>
          <Route path="dashboard" element={<StaffDashboard />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout user={user} onLogout={handleLogout} />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="tokens" element={<TokenRequestsAdmin />} />
        </Route>

        {/* Catch All */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
