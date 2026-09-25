import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Building,
  User,
  Zap,
  ArrowRight,
  TrendingUp,
  Layers,
  BookOpen,
} from 'lucide-react';

const Hero3DScene = ({ onNavigateToTimetable, onNavigateToResolver }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeStep, setActiveStep] = useState(0);

  const workflowSteps = [
    { title: 'Detect Collisions', status: 'ALERT', icon: AlertTriangle, color: 'text-rose-600 bg-rose-50 border-rose-200' },
    { title: 'Evaluate Alternative Slots', status: 'SOLVING', icon: Sparkles, color: 'text-teal-700 bg-teal-50 border-teal-200' },
    { title: 'Optimal Timetable Generated', status: 'RESOLVED', icon: CheckCircle2, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % workflowSteps.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  // 3D rotation transform based on mouse
  const rotateX = -mousePos.y * 14;
  const rotateY = mousePos.x * 18;

  return (
    <div
      className="relative w-full h-[520px] flex items-center justify-center perspective-1200 select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Ambient Lighting / Glow Behind Scene */}
      <div className="absolute w-80 h-80 rounded-full bg-teal-400/10 blur-3xl -top-10 -right-10 pointer-events-none" />
      <div className="absolute w-72 h-72 rounded-full bg-emerald-400/10 blur-3xl -bottom-10 -left-10 pointer-events-none" />

      {/* Main 3D Container with smooth transition */}
      <div
        className="relative w-full max-w-[480px] h-[440px] transform-3d transition-transform duration-300 ease-out"
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        }}
      >
        {/* ================= CENTRAL 3D TIMETABLE SLAB ================= */}
        <div
          className="absolute inset-x-8 inset-y-6 bg-white/95 rounded-2xl border border-slate-200 shadow-[0_20px_50px_rgba(15,23,42,0.12)] p-5 flex flex-col justify-between backdrop-blur-xs"
          style={{
            transform: 'translateZ(0px)',
          }}
        >
          {/* Header of 3D Timetable Board */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-sm">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 leading-tight">CSE-V Sem Timetable</h4>
                <span className="text-[10px] text-slate-400 font-mono">Academic Year 2025-26</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200/60 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-pulse" />
              Auto-Balanced
            </span>
          </div>

          {/* Mini 3D Timetable Grid Representation */}
          <div className="grid grid-cols-4 gap-2 my-auto">
            {/* Period 1 */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100/80 space-y-1">
              <span className="text-[9px] font-bold text-slate-400 block font-mono">09:00 AM</span>
              <p className="text-[11px] font-bold text-slate-800 leading-tight">Algorithms</p>
              <span className="text-[9px] text-teal-700 font-medium block">LH-101 · Dr. Rao</span>
            </div>

            {/* Period 2 */}
            <div className="p-2.5 rounded-xl bg-teal-50/60 border border-teal-200/60 space-y-1">
              <span className="text-[9px] font-bold text-teal-600 block font-mono">10:00 AM</span>
              <p className="text-[11px] font-bold text-slate-800 leading-tight">Database Sys</p>
              <span className="text-[9px] text-slate-500 font-medium block">LH-204 · Prof. Roy</span>
            </div>

            {/* Period 3 (Highlight Resolving) */}
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1 relative">
              <span className="text-[9px] font-bold text-emerald-600 block font-mono">11:15 AM</span>
              <p className="text-[11px] font-bold text-slate-900 leading-tight">Comp Networks</p>
              <span className="text-[9px] text-emerald-700 font-medium block">Lab-3 · Dr. Maya</span>
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-bold shadow-xs">
                ✓
              </span>
            </div>

            {/* Period 4 */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100/80 space-y-1">
              <span className="text-[9px] font-bold text-slate-400 block font-mono">12:15 PM</span>
              <p className="text-[11px] font-bold text-slate-800 leading-tight">Cloud Comp</p>
              <span className="text-[9px] text-teal-700 font-medium block">LH-102 · Staff</span>
            </div>
          </div>

          {/* Footer Stats inside Central Slab */}
          <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-[10px] text-slate-500">
            <span className="flex items-center gap-1 font-medium">
              <Building className="w-3 h-3 text-slate-400" />
              <span>Room Utilization: <strong className="text-slate-700">89%</strong></span>
            </span>
            <span className="flex items-center gap-1 font-medium">
              <Zap className="w-3 h-3 text-teal-600" />
              <span>Collision Score: <strong className="text-emerald-600">0.0 (Zero Conflict)</strong></span>
            </span>
          </div>
        </div>

        {/* ================= FLOATING 3D SATELLITE CARD 1: CONFLICT RESOLUTION ================= */}
        <div
          className="absolute -top-4 -left-6 bg-white rounded-xl p-3.5 border border-slate-200 shadow-[0_12px_30px_rgba(0,0,0,0.08)] animate-float-slow max-w-[210px]"
          style={{
            transform: 'translateZ(45px)',
          }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-5 h-5 rounded-md bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-3 h-3" />
            </div>
            <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wide">
              Conflict Resolved
            </span>
          </div>
          <p className="text-[11px] font-bold text-slate-800 leading-snug">
            LH-204 Double-Booking Resolved
          </p>
          <p className="text-[9px] text-slate-500 mt-0.5">
            Swapped with Lab-2 · 0 constraints broken
          </p>
        </div>

        {/* ================= FLOATING 3D SATELLITE CARD 2: AI OPTIMIZER RANKING ================= */}
        <div
          className="absolute -bottom-4 -right-4 bg-white rounded-xl p-3.5 border border-slate-200 shadow-[0_12px_30px_rgba(0,0,0,0.08)] animate-float-delayed max-w-[220px]"
          style={{
            transform: 'translateZ(55px)',
          }}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wide flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-teal-600" />
              CSP Optimizer
            </span>
            <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold">
              98.4/100
            </span>
          </div>
          <p className="text-[11px] font-bold text-slate-800 leading-snug">
            Faculty Workload Balanced
          </p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div className="bg-teal-600 h-full rounded-full w-[94%]" />
          </div>
        </div>

        {/* ================= FLOATING 3D BADGE: FACULTY AVAILABILITY ================= */}
        <div
          className="absolute top-1/2 -right-8 -translate-y-1/2 bg-white rounded-xl p-2.5 border border-slate-200 shadow-md animate-float-subtle flex items-center gap-2.5"
          style={{
            transform: 'translateZ(35px)',
          }}
        >
          <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-bold text-xs">
            <User className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-800 block">Faculty Availability</span>
            <span className="text-[9px] text-emerald-600 font-semibold block">All Preferences Met</span>
          </div>
        </div>

        {/* ================= FLOATING 3D NODE: LIVE TIMELINE ================= */}
        <div
          className="absolute -bottom-6 left-12 bg-white/95 rounded-lg px-3 py-1.5 border border-slate-200 shadow-sm flex items-center gap-2"
          style={{
            transform: 'translateZ(20px)',
          }}
        >
          <Clock className="w-3.5 h-3.5 text-teal-600" />
          <span className="text-[10px] font-bold text-slate-700 font-mono">
            6 Days · 36 Scheduled Slots
          </span>
        </div>
      </div>
    </div>
  );
};

export default Hero3DScene;
