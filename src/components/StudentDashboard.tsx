import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { AccordionNav } from './AccordionNav';
import { Bell, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StudentDashboardProps {
  user: User | null;
  plagiarismTokens?: number;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ user }) => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch('/api/announcements');
        const data = await res.json();
        if (data.success && data.data) {
          setAnnouncements(data.data.slice(0, 3));
        }
      } catch {
        // silently fail
      } finally {
        setIsLoadingAnnouncements(false);
      }
    };
    fetchAnnouncements();
  }, []);

  return (
    <div className="space-y-6 pb-16 md:pb-6 font-sans">
      {/* Header Greeting */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-slate-900">Welcome back 👋</h2>
        <p className="text-sm text-slate-500">Here's what's happening in your campus today.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Navigation Accordions */}
        <div className="lg:col-span-2 space-y-4">
          <AccordionNav onSelectItem={(_, itemId) => navigate(`/student/${itemId}`)} />
        </div>

      </div>
    </div>
  );
};
