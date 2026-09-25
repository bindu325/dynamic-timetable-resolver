import React from 'react';
import { Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ onQuickScan, activeConflictCount = 0, isScanning = false }) => {
  const { user, isAdmin } = useAuth();

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-white flex items-center gap-2">
          Academic Timetable Management & Conflict Resolver
        </h1>
        <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          Semester 2025-2026
        </span>
      </div>

      <div className="flex items-center gap-3">
        {activeConflictCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold animate-pulse">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{activeConflictCount} Active Conflicts</span>
          </div>
        )}

        {isAdmin && (
          <button
            onClick={onQuickScan}
            disabled={isScanning}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning...' : 'Scan Conflicts'}</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
