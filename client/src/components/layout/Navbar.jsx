import React from 'react';
import { RefreshCw, AlertCircle, CheckCircle2, Search, Bell, CalendarCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ onQuickScan, activeConflictCount = 0, isScanning = false, activeTab = 'dashboard' }) => {
  const { user, isAdmin } = useAuth();

  const tabLabels = {
    dashboard: 'Operations Dashboard',
    timetable: 'Weekly Timetable Grid',
    resolver: 'Conflict Resolution Center',
    export: 'Reporting & Document Export',
    faculty: 'Faculty Directory',
    availability: 'Faculty Availability Matrix',
    sections: 'Student Sections',
    subjects: 'Course Curriculum',
    rooms: 'Facilities & Labs',
    timeslots: 'Period Time Slots',
    history: 'System Audit History',
    analytics: 'Institutional Analytics',
  };

  return (
    <header className="h-16 border-b border-[#e5ded2] bg-[#faf9f5]/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left: Breadcrumbs / Title */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#8a8275]">
            <span>Dynamic Timetable Resolver</span>
            <span>/</span>
            <span className="text-[#8c5e47] font-bold capitalize">{activeTab}</span>
          </div>
          <h1 className="text-base font-bold text-[#2d2a26] tracking-tight">
            {tabLabels[activeTab] || 'Academic Management'}
          </h1>
        </div>
      </div>

      {/* Right Actions: Search / Conflict Badge / Scan Button */}
      <div className="flex items-center gap-3">
        {activeConflictCount > 0 ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#faeceb] border border-[#f0c7c3] text-[#a8483f] text-xs font-semibold">
            <AlertCircle className="w-3.5 h-3.5 text-[#a8483f] animate-pulse" />
            <span>{activeConflictCount} Active Conflicts</span>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#edf5ee] border border-[#c7decb] text-[#4d7358] text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#4d7358]" />
            <span>Schedules Optimal</span>
          </div>
        )}

        {/* Quick Scan Button */}
        {isAdmin && (
          <button
            id="navbar-scan-btn"
            onClick={onQuickScan}
            disabled={isScanning}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#2d2a26] hover:bg-[#413b34] text-[#f7f5f0] shadow-xs transition-all disabled:opacity-50 cursor-pointer active:scale-98"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`} />
            <span>{isScanning ? "Scanning…" : "Scan"}</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
