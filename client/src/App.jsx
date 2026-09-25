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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">
            Initializing Dynamic Resolver Engine...
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Main App Content Area */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          isSidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <Navbar
          onQuickScan={handleQuickScan}
          activeConflictCount={activeConflictCount}
          isScanning={isScanning}
        />

        <main className="p-6 flex-1 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && <DashboardPage setActiveTab={setActiveTab} />}
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
