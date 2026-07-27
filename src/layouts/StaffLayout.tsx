import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { User, NavTab, SubView } from '../types';

interface StaffLayoutProps {
  user: User | null;
  onLogout: () => void;
  onUpdateUser?: (updated: Partial<User>) => void;
}

export const StaffLayout: React.FC<StaffLayoutProps> = ({ user, onLogout, onUpdateUser }) => {
  const navigate = useNavigate();
  React.useEffect(() => {
    if (!user || user.role !== 'staff') {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user || user.role !== 'staff') return null;

  return (
    <div className="min-h-screen bg-ambient-glass text-black flex flex-col antialiased">
      <Header
        user={user}
        onLogout={onLogout}
        onUpdateUser={onUpdateUser}
        unreadAlertCount={0}
      />
      <div className="flex-1 flex w-full">
        {/* We can create a StaffSidebar later, but for now we'll just have a simple main view */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
