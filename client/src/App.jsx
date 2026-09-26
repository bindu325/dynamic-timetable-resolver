import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useToast } from './context/ToastContext';
import API from './services/api';

import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';

import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import TimetablePage from './pages/TimetablePage';
import ConflictResolverPage from './pages/ConflictResolverPage';
import FacultyPage from './pages/FacultyPage';
import FacultyAvailabilityPage from './pages/FacultyAvailabilityPage';
import SectionsPage from './pages/SectionsPage';
import SubjectsPage from './pages/SubjectsPage';
import RoomsPage from './pages/RoomsPage';
import TimeSlotsPage from './pages/TimeSlotsPage';
import HistoryPage from './pages/HistoryPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ExportPage from './pages/ExportPage';
import CreateTimetablePage from './pages/CreateTimetablePage';
import Fluid3DBackground from './components/layout/Fluid3DBackground';

function App() {
  const { user, token, loading } = useAuth();
  const { success, warning, error } = useToast();

  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Global Conflict Counter for top Navbar
  const [activeConflictCount, setActiveConflictCount] = useState(0);
  const [isScanning, setIsScanning] = useState(false);

  // Context passing helper when clicking "Availability" from faculty list
  const [targetFacultyForAvail, setTargetFacultyForAvail] = useState(null);

  const fetchGlobalConflicts = async () => {
    if (!token) return;
    try {
      const res = await API.get('/conflicts');
      if (res.data.success) {
        setActiveConflictCount(res.data.count || 0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchGlobalConflicts();
    }
  }, [token, activeTab]);

  const handleQuickScan = async () => {
    setIsScanning(true);
    try {
      const res = await API.post('/conflicts/check');
      if (res.data.success) {
        setActiveConflictCount(res.data.count || 0);
        if (res.data.count === 0) {
          success('Timetable is 100% Conflict-Free!');
        } else {
          warning(`Detected ${res.data.count} active conflict(s).`);
          setActiveTab('resolver');
        }
      }
    } catch (err) {
      error('Conflict scan failed');
    } finally {
      setIsScanning(false);
    }
  };

  const handleOpenResolverForEntry = (entry) => {
    setActiveTab('resolver');
  };

  const handleConfigureAvailability = (faculty) => {
    setTargetFacultyForAvail(faculty._id);
    setActiveTab('availability');
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--bg-base)' }}
      >
        <div className="flex flex-col items-center gap-5">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(145deg, #6366f1 0%, #4f46e5 100%)',
              boxShadow: '0 3px 0 rgba(40,33,160,0.50), 0 8px 32px rgba(79,70,229,0.40)',
            }}
          >
            <div className="spinner" style={{ width: '1.5rem', height: '1.5rem', borderColor: 'rgba(255,255,255,0.25)', borderTopColor: '#fff' }} />
          </div>
          <span
            className="text-[11px] font-semibold tracking-widest uppercase"
            style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}
          >
            Initializing…
          </span>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!token || !user) {
    if (authMode === 'signup') {
      return <SignupPage onSwitchToLogin={() => setAuthMode('login')} />;
    }
    return <LoginPage onSwitchToSignup={() => setAuthMode('signup')} />;
  }

  return (
    <div
      className="min-h-screen flex relative"
      style={{
        backgroundColor: "var(--bg-base)",
        color: "var(--text-primary)",
      }}
    >
      <Fluid3DBackground />
      {/* Subtle noise texture overlay */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 60% at 80% 10%, rgba(79,70,229,0.07) 0%, transparent 70%), ' +
            'radial-gradient(ellipse 40% 40% at 20% 90%, rgba(99,102,241,0.05) 0%, transparent 70%)',
        }}
      />
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Main App Content Area */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 relative z-10 ${
          isSidebarCollapsed ? 'ml-[68px]' : 'ml-60'
        }`}
      >
        <Navbar
          onQuickScan={handleQuickScan}
          activeConflictCount={activeConflictCount}
          isScanning={isScanning}
        />

        <main className="p-6 flex-1 max-w-7xl w-full mx-auto page-enter" style={{ minHeight: 'calc(100vh - 56px)' }}>
          {activeTab === 'dashboard' && <DashboardPage setActiveTab={setActiveTab} />}
          {activeTab === 'create-timetable' && <CreateTimetablePage setActiveTab={setActiveTab} />}
          {activeTab === 'timetable' && (
            <TimetablePage onOpenResolverForEntry={handleOpenResolverForEntry} />
          )}
          {activeTab === 'resolver' && (
            <ConflictResolverPage onJumpToTimetable={() => setActiveTab('timetable')} />
          )}
          {activeTab === 'export' && <ExportPage />}
          {activeTab === 'faculty' && (
            <FacultyPage onConfigureAvailability={handleConfigureAvailability} />
          )}
          {activeTab === 'availability' && (
            <FacultyAvailabilityPage targetFacultyId={targetFacultyForAvail} />
          )}
          {activeTab === 'sections' && <SectionsPage />}
          {activeTab === 'subjects' && <SubjectsPage />}
          {activeTab === 'rooms' && <RoomsPage />}
          {activeTab === 'timeslots' && <TimeSlotsPage />}
          {activeTab === 'history' && <HistoryPage />}
          {activeTab === 'analytics' && <AnalyticsPage />}
        </main>
      </div>
    </div>
  );
}

export default App;
