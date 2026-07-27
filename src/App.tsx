import React, { useState } from 'react';
import { User, NavTab, SubView, ForumMessage } from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { StudentDashboard } from './components/StudentDashboard';
import { TimedEvaluation } from './components/TimedEvaluation';
import { PlagiarismTest } from './components/PlagiarismTest';
import { GeneralForum } from './components/GeneralForum';
import { LoginForm } from './components/LoginForm';
import { AlertsView } from './components/AlertsView';
import { NotesView } from './components/NotesView';

export default function App() {
  // Navigation & Sub-view states
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [activeSubView, setActiveSubView] = useState<SubView>('dashboard');

  // Authenticated user state (default active student)
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

  // Plagiarism token counter state
  const [plagiarismTokens, setPlagiarismTokens] = useState<number>(5);

  // Forum messages state
  const [forumMessages, setForumMessages] = useState<ForumMessage[]>([
    {
      id: 'm1',
      author: 'Dr. Samuel N.',
      role: 'staff',
      text: 'Welcome to the HICM General Academic Forum. Please submit all course queries here. Web links are strictly forbidden!',
      timestamp: '10:15 AM',
    },
    {
      id: 'm2',
      author: 'Jane Doe',
      role: 'student',
      text: 'Good morning Dr. Samuel. Is the ACC 301 mid-term revision hall assigned to Main Auditorium or Lab 2?',
      timestamp: '10:28 AM',
    },
    {
      id: 'm3',
      author: 'Dr. Samuel N.',
      role: 'staff',
      text: 'The ACC 301 revision will hold in Main Auditorium tomorrow at 2:00 PM.',
      timestamp: '10:42 AM',
    },
  ]);

  // Token Handlers
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

  // Forum Send Handler
  const handleSendForumMessage = (text: string) => {
    const newMsg: ForumMessage = {
      id: `msg-${Date.now()}`,
      author: user ? user.name : 'Guest Student',
      role: user ? user.role : 'student',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setForumMessages((prev) => [...prev, newMsg]);
  };

  // Login Handler
  const handleLogin = (newUser: User) => {
    setUser(newUser);
    setActiveTab('home');
    setActiveSubView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
  };

  // Render main content area based on active tab and subview
  const renderMainContent = () => {
    // If login subview is triggered explicitly
    if (activeSubView === 'login') {
      return (
        <LoginForm
          onLogin={handleLogin}
          onCancel={() => setActiveSubView('dashboard')}
        />
      );
    }

    // Home Tab
    if (activeTab === 'home') {
      if (activeSubView === 'evaluation') {
        return (
          <TimedEvaluation
            onBackToDashboard={() => setActiveSubView('dashboard')}
          />
        );
      }
      if (activeSubView === 'plagiarism') {
        return (
          <PlagiarismTest
            tokens={plagiarismTokens}
            onUseToken={handleUsePlagiarismToken}
            onAddTokens={handleAddTokens}
            onBackToDashboard={() => setActiveSubView('dashboard')}
          />
        );
      }
      return (
        <StudentDashboard
          user={user}
          onNavigateSubView={(view) => setActiveSubView(view)}
          plagiarismTokens={plagiarismTokens}
        />
      );
    }

    // Forum Tab
    if (activeTab === 'forum') {
      return (
        <GeneralForum
          currentUser={user}
          messages={forumMessages}
          onSendMessage={handleSendForumMessage}
        />
      );
    }

    // Alerts Tab
    if (activeTab === 'alerts') {
      return <AlertsView />;
    }

    // Notes Tab
    if (activeTab === 'notes') {
      return <NotesView />;
    }

    return (
      <StudentDashboard
        user={user}
        onNavigateSubView={(view) => setActiveSubView(view)}
        plagiarismTokens={plagiarismTokens}
      />
    );
  };

  return (
    <div className="min-h-screen bg-navy-900 text-offwhite flex flex-col antialiased">
      {/* Sticky Top Header */}
      <Header
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setActiveSubView={setActiveSubView}
        unreadAlertCount={2}
        onLogout={handleLogout}
      />

      {/* Main Body Layout with Desktop Sidebar */}
      <div className="flex-1 flex w-full">
        {/* Desktop Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeSubView={activeSubView}
          setActiveSubView={setActiveSubView}
          user={user}
          unreadAlertsCount={2}
          plagiarismTokens={plagiarismTokens}
        />

        {/* Center Main Dynamic Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {renderMainContent()}
        </main>
      </div>

      {/* Mobile Fixed Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setActiveSubView={setActiveSubView}
        unreadAlertsCount={2}
      />
    </div>
  );
}
