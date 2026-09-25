import React from 'react';
import { Sparkles, RefreshCw, AlertCircle, Zap, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ onQuickScan, activeConflictCount = 0, isScanning = false }) => {
  const { user, isAdmin } = useAuth();

  return (
    <header className="h-16 border-b border-slate-800/80 bg-gray-950/70 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-4">
        <h1 className="text-base sm:text-lg font-bold text-white flex items-center gap-2.5 tracking-tight font-heading">
          <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
            Academic Timetable Optimizer
          </span>
        </h1>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shadow-inner">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
          Academic Year 2025-2026
        </span>
      </div>

      <div className="flex items-center gap-3">
        {activeConflictCount > 0 ? (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold shadow-lg shadow-rose-950/40 animate-pulse">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{activeConflictCount} Active Conflicts</span>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>System Optimized</span>
          </div>
        )}

        {isAdmin && (
          <button
            onClick={onQuickScan}
            disabled={isScanning}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/25 transition-all transform active:scale-95 disabled:opacity-50"
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
