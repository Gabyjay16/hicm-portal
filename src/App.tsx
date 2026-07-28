import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { User, AdminSettingsConfig } from './types';

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
import { ForumPage } from './components/ForumPage';
import { AlertsView } from './components/AlertsView';
import { NotesView } from './components/NotesView';
import { ComplaintsDesk } from './components/ComplaintsDesk';
import { LostAndFound } from './components/LostAndFound';
import { ElectionsView } from './components/ElectionsView';
import { TokenRequestsAdmin } from './components/TokenRequestsAdmin';
import { RequestsHub } from './components/RequestsHub';
import { UserManagement } from './components/UserManagement';
import { PlagiarismCodeLookup } from './components/PlagiarismCodeLookup';
import { AdminSettings } from './components/AdminSettings';
import { AdminAnnouncementsManager } from './components/AdminAnnouncementsManager';
import { AdminElections } from './components/AdminElections';
import { StudentSettings } from './components/StudentSettings';

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  const [plagiarismTokens, setPlagiarismTokens] = useState<number>(5);
  
  const [adminSettings, setAdminSettings] = useState<AdminSettingsConfig>({
    matriculeVerificationEnabled: false,
    validMatricules: [],
    plagiarismPayment: {
      primaryNumber: '681 597 837',
      primaryName: 'B. Judmi',
      secondaryNumber: '',
      secondaryName: '',
      amount: '3,500',
    }
  });

  const handleEnforceMatricules = () => {
    if (user?.role === 'student' && adminSettings.matriculeVerificationEnabled) {
      if (user.matricNo && !adminSettings.validMatricules.includes(user.matricNo)) {
        alert("Your account has been suspended due to an invalid matricule.");
        handleLogout();
      }
    }
  };

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

  const handleUpdateUser = (updated: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updated } : null));
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginForm onLogin={handleLogin} adminSettings={adminSettings} />} />

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
        <Route path="/student" element={<StudentLayout user={user} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />}>
          <Route path="dashboard" element={
            <StudentDashboard user={user} plagiarismTokens={plagiarismTokens} />
          } />
          <Route path="evaluation" element={<TimedEvaluation user={user} />} />
          <Route path="plagiarism" element={
            <PlagiarismTest user={user} adminSettings={adminSettings} />
          } />
          <Route path="forum" element={<ForumPage currentUser={user} />} />
          <Route path="alerts" element={<AlertsView />} />
          <Route path="notes" element={<NotesView user={user} />} />
          <Route path="complaints" element={<ComplaintsDesk user={user} adminMode="none" />} />
          <Route path="lost-and-found" element={<LostAndFound user={user} />} />
          <Route path="elections" element={<ElectionsView user={user} />} />
          <Route path="requests" element={<RequestsHub user={user} />} />
          <Route path="settings" element={<StudentSettings user={user} />} />
        </Route>

        {/* Staff Routes */}
        <Route path="/staff" element={<StaffLayout user={user} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />}>
          <Route path="dashboard" element={<StaffDashboard user={user} />} />
          <Route path="plagiarism-lookup" element={<PlagiarismCodeLookup />} />
          <Route path="elections" element={<AdminElections />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout user={user} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="tokens" element={<TokenRequestsAdmin />} />
          <Route path="users" element={<UserManagement adminSettings={adminSettings} />} />
          <Route path="complaints" element={<ComplaintsDesk user={user} adminMode="manage" />} />
          <Route path="complaint-fields" element={<ComplaintsDesk user={user} adminMode="fields" />} />
          <Route path="forum" element={<ForumPage currentUser={user} />} />
          <Route path="content" element={<AdminAnnouncementsManager />} />
          <Route path="elections" element={<AdminElections />} />
          <Route path="settings" element={
            <AdminSettings 
              settings={adminSettings} 
              onUpdateSettings={setAdminSettings} 
              onEnforceMatricules={handleEnforceMatricules} 
            />
          } />
        </Route>

        {/* Catch All */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
