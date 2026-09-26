import React, { useEffect, useState } from "react";
import API from "../services/api";
import {
  Users,
  GraduationCap,
  BookOpen,
  DoorClosed,
  Calendar,
  AlertTriangle,
  Percent,
  CheckCircle2,
  Clock,
  Zap,
  ArrowUpRight,
  Activity,
  Layers,
  CalendarCheck,
  Building,
  TrendingUp,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

const DashboardPage = ({ setActiveTab }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await API.get("/dashboard/stats");
      if (res.data.success) setStats(res.data.data);
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-[#5e72e4] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-[#8898aa] font-bold tracking-wider uppercase">
            Loading Argon Operations Dashboard...
          </span>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'TOTAL FACULTY',
      count: stats?.totalFaculty || 0,
      subtitle: '+3.48% vs last month',
      isPositive: true,
      icon: Users,
      iconBg: 'bg-gradient-to-r from-[#f5365c] to-[#f56036] shadow-md shadow-[#f5365c]/30',
      path: 'faculty',
    },
    {
      title: 'ACTIVE SECTIONS',
      count: stats?.totalSections || 0,
      subtitle: '+2.15% new cohorts',
      isPositive: true,
      icon: GraduationCap,
      iconBg: 'bg-gradient-to-r from-[#fb6340] to-[#fbb140] shadow-md shadow-[#fb6340]/30',
      path: 'sections',
    },
    {
      title: 'COURSE SUBJECTS',
      count: stats?.totalSubjects || 0,
      subtitle: 'Synchronized syllabus',
      isPositive: true,
      icon: BookOpen,
      iconBg: 'bg-gradient-to-r from-[#2dce89] to-[#2dcecc] shadow-md shadow-[#2dce89]/30',
      path: 'subjects',
    },
    {
      title: 'ROOMS & LABS',
      count: stats?.totalRooms || 0,
      subtitle: '92% capacity active',
      isPositive: true,
      icon: DoorClosed,
      iconBg: 'bg-gradient-to-r from-[#11cdef] to-[#1171ef] shadow-md shadow-[#11cdef]/30',
      path: 'rooms',
    },
    {
      title: 'SCHEDULED SESSIONS',
      count: stats?.totalEntries || 0,
      subtitle: '+14% period volume',
      isPositive: true,
      icon: Calendar,
      iconBg: 'bg-gradient-to-r from-[#5e72e4] to-[#825ee4] shadow-md shadow-[#5e72e4]/30',
      path: 'timetable',
    },
    {
      title: 'ACTIVE CONFLICTS',
      count: stats?.activeConflicts || 0,
      subtitle: stats?.activeConflicts > 0 ? 'Action required' : 'Zero clashes (Optimal)',
      isPositive: stats?.activeConflicts === 0,
      icon: AlertTriangle,
      iconBg: stats?.activeConflicts > 0
        ? 'bg-gradient-to-r from-[#f5365c] to-[#f56036] shadow-md shadow-[#f5365c]/30'
        : 'bg-gradient-to-r from-[#2dce89] to-[#2dcecc] shadow-md shadow-[#2dce89]/30',
      path: 'resolver',
      highlight: stats?.activeConflicts > 0,
    },
  ];

  return (
    <div className="space-y-6">
      {/* ================= ARGON TOP HERO BANNER ================= */}
      <div className="relative rounded-2xl p-7 bg-gradient-to-r from-[#5e72e4] via-[#7254df] to-[#11cdef] text-white shadow-[0_15px_35px_rgba(50,50,93,0.12),0_5px_15px_rgba(0,0,0,0.07)] overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute left-1/3 -top-12 w-48 h-48 bg-[#11cdef]/20 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-2 max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-[11px] font-extrabold uppercase tracking-wider">
            <CalendarCheck className="w-3.5 h-3.5 text-white" />
            Argon Operations Console
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            Academic Operations &amp; Timetable Center
          </h2>
          <p className="text-xs sm:text-sm text-white/85 leading-relaxed font-normal">
            Real-time constraint tracking, automated room-faculty conflict resolution, and institutional workload telemetry.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0 relative z-10">
          <button
            onClick={() => setActiveTab('resolver')}
            className="px-5 py-2.5 rounded-xl bg-white text-[#5e72e4] hover:bg-[#f8f9fe] text-xs font-black shadow-lg shadow-black/15 hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#5e72e4]" />
            <span>Open Conflict Resolver</span>
          </button>
          <button
            onClick={() => setActiveTab('timetable')}
            className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold border border-white/30 shadow-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-white/90" />
            <span>View Master Grid</span>
          </button>
        </div>
      </div>

      {/* ================= ARGON STAT CARDS GRID ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              onClick={() => setActiveTab(card.path)}
              className="bg-white p-5 rounded-2xl border border-[#e9ecef] shadow-[0_15px_35px_rgba(50,50,93,0.06),0_5px_15px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_45px_rgba(50,50,93,0.12),0_8px_20px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-extrabold text-[#8898aa] uppercase tracking-wider truncate">
                    {card.title}
                  </span>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 ${card.iconBg}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-[#32325d] tracking-tight">
                  {card.count}
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#f1f3f9] flex items-center justify-between text-[11px] font-bold">
                <span className={card.isPositive ? 'text-[#2dce89]' : 'text-[#f5365c]'}>
                  {card.subtitle}
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#5e72e4]" />
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= ARGON METRICS TELEMETRY ROW ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-[#e9ecef] shadow-[0_15px_35px_rgba(50,50,93,0.05)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-[#11cdef] to-[#1171ef] text-white flex items-center justify-center shadow-md shadow-[#11cdef]/30 shrink-0">
            <Percent className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold text-[#8898aa] uppercase tracking-wider block">Average Room Occupancy</span>
            <div className="text-xl font-black text-[#32325d] mt-0.5">
              {stats?.roomUtilization || 0}%
            </div>
            <div className="w-full bg-[#e9ecef] h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#11cdef] to-[#1171ef] h-full rounded-full transition-all duration-500"
                style={{ width: `${stats?.roomUtilization || 0}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e9ecef] shadow-[0_15px_35px_rgba(50,50,93,0.05)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-[#5e72e4] to-[#825ee4] text-white flex items-center justify-center shadow-md shadow-[#5e72e4]/30 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#8898aa] uppercase tracking-wider block">Faculty Workload Average</span>
            <div className="text-xl font-black text-[#32325d] mt-0.5">
              {stats?.avgFacultyWorkload || 0} <span className="text-xs text-[#8898aa] font-medium">hrs / week</span>
            </div>
            <span className="text-[11px] text-[#2dce89] font-bold">Target baseline: 18 - 22 hrs</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e9ecef] shadow-[0_15px_35px_rgba(50,50,93,0.05)] flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-2xl text-white flex items-center justify-center shrink-0 ${
              stats?.activeConflicts === 0
                ? 'bg-gradient-to-r from-[#2dce89] to-[#2dcecc] shadow-md shadow-[#2dce89]/30'
                : 'bg-gradient-to-r from-[#f5365c] to-[#f56036] shadow-md shadow-[#f5365c]/30'
            }`}
          >
            {stats?.activeConflicts === 0 ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : (
              <AlertTriangle className="w-6 h-6" />
            )}
          </div>
          <div>
            <span className="text-xs font-bold text-[#8898aa] uppercase tracking-wider block">Timetable Integrity State</span>
            <div
              className={`text-lg font-black mt-0.5 ${
                stats?.activeConflicts === 0 ? 'text-[#2dce89]' : 'text-[#f5365c]'
              }`}
            >
              {stats?.activeConflicts === 0 ? '100% Conflict Free' : `${stats?.activeConflicts} Clashes Detected`}
            </div>
            <span className="text-[11px] text-[#8898aa]">
              {stats?.activeConflicts === 0 ? 'CSP optimization complete' : 'Requires constraint resolution'}
            </span>
          </div>
        </div>
      </div>

      {/* ================= ARGON ANALYTICS CHARTS (LIGHT & DARK ACCENTS) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Class Distribution Chart in Argon Card */}
        <div className="bg-white p-6 rounded-2xl border border-[#e9ecef] shadow-[0_15px_35px_rgba(50,50,93,0.06)]">
          <div className="flex items-center justify-between mb-5">
            <div>
              <span className="text-[10px] font-extrabold text-[#5e72e4] uppercase tracking-widest block">Overview</span>
              <h3 className="text-base font-extrabold text-[#32325d] mt-0.5">Weekly Session Volume</h3>
            </div>
            <div className="p-2 rounded-xl bg-[#5e72e4]/10 text-[#5e72e4]">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div style={{ height: 230 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.dayDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" vertical={false} />
                <XAxis dataKey="day" stroke="#8898aa" fontSize={11} tickLine={false} />
                <YAxis stroke="#8898aa" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#172b4d', color: '#ffffff', borderColor: '#243e69', borderRadius: '12px', fontSize: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}
                />
                <Bar dataKey="classes" fill="#5e72e4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Course Load Area Chart in Argon Dark Container */}
        <div className="bg-[#172b4d] text-white p-6 rounded-2xl border border-[#243e69] shadow-[0_15px_35px_rgba(50,50,93,0.15)]">
          <div className="flex items-center justify-between mb-5">
            <div>
              <span className="text-[10px] font-extrabold text-[#11cdef] uppercase tracking-widest block">Distribution</span>
              <h3 className="text-base font-extrabold text-white mt-0.5">Department Course Load</h3>
            </div>
            <div className="p-2 rounded-xl bg-white/10 text-[#11cdef]">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div style={{ height: 230 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={stats?.classesByDepartment || []}
                margin={{ top: 4, right: 4, bottom: 0, left: -16 }}
              >
                <defs>
                  <linearGradient id="argonAreaClasses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#11cdef" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#11cdef" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#243e69" vertical={false} />
                <XAxis dataKey="department" stroke="#8898aa" fontSize={11} tickLine={false} />
                <YAxis stroke="#8898aa" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', color: '#32325d', borderColor: '#e9ecef', borderRadius: '12px', fontSize: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="classes" stroke="#11cdef" strokeWidth={3} fillOpacity={1} fill="url(#argonAreaClasses)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
