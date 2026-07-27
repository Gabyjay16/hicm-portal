import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { BottomNav } from '../components/BottomNav';
import { User } from '../types';

interface StudentLayoutProps {
  user: User | null;
  onLogout: () => void;
  onUpdateUser?: (updated: Partial<User>) => void;
}

export const StudentLayout: React.FC<StudentLayoutProps> = ({ user, onLogout, onUpdateUser }) => {
  const navigate = useNavigate();
  React.useEffect(() => {
    if (!user || user.role !== 'student') {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user || user.role !== 'student') return null;

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      <Sidebar
        user={user}
        plagiarismTokens={5} // Mock for now
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          user={user}
          onLogout={onLogout}
          onUpdateUser={onUpdateUser}
          unreadAlertCount={2} // Mock
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
      <BottomNav
        user={user}
        unreadAlertsCount={2}
      />
    </div>
  );
};
