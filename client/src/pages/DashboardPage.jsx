import React, { useEffect, useState } from 'react';
import API from '../services/api';
import {
  Users,
  GraduationCap,
  BookOpen,
  DoorClosed,
  Calendar,
  AlertTriangle,
  Percent,
  CheckCircle2,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowUpRight,
  Flame,
  Activity,
  Layers,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#06b6d4'];

const DashboardPage = ({ setActiveTab }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await API.get('/dashboard/stats');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin shadow-lg shadow-indigo-500/20" />
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-widest">
            Compiling Intelligence Metrics...
          </span>
        </div>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Faculty', count: stats?.totalFaculty || 0, icon: Users, gradient: 'from-blue-600/20 to-indigo-600/20 border-indigo-500/30 text-indigo-400', path: 'faculty' },
    { title: 'Sections', count: stats?.totalSections || 0, icon: GraduationCap, gradient: 'from-cyan-600/20 to-sky-600/20 border-cyan-500/30 text-cyan-400', path: 'sections' },
    { title: 'Subjects', count: stats?.totalSubjects || 0, icon: BookOpen, gradient: 'from-emerald-600/20 to-teal-600/20 border-emerald-500/30 text-emerald-400', path: 'subjects' },
    { title: 'Rooms & Labs', count: stats?.totalRooms || 0, icon: DoorClosed, gradient: 'from-purple-600/20 to-pink-600/20 border-purple-500/30 text-purple-400', path: 'rooms' },
    { title: 'Scheduled Periods', count: stats?.totalEntries || 0, icon: Calendar, gradient: 'from-amber-600/20 to-orange-600/20 border-amber-500/30 text-amber-400', path: 'timetable' },
    {
      title: 'Active Conflicts',
      count: stats?.activeConflicts || 0,
      icon: AlertTriangle,
      gradient: stats?.activeConflicts > 0
        ? 'from-rose-600/30 to-red-600/30 border-rose-500/50 text-rose-400'
        : 'from-emerald-600/20 to-teal-600/20 border-emerald-500/30 text-emerald-400',
      path: 'resolver',
      highlight: stats?.activeConflicts > 0,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Hero Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-indigo-600/20 via-purple-600/10 to-transparent pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Autonomous Schedule Engine
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-heading leading-tight">
              Dynamic Timetable Conflict Resolver
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Multi-factor constraint validation, automated clash detection, and instant resolution recommendations across rooms, faculty, and student sections.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('resolver')}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold shadow-xl shadow-rose-600/25 flex items-center gap-2.5 transition-all transform active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch Conflict Resolver</span>
            </button>
            <button
              onClick={() => setActiveTab('timetable')}
              className="px-5 py-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white text-xs font-bold border border-slate-700/80 shadow-md flex items-center gap-2.5 transition-all transform active:scale-95 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>Open Timetable Grid</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              onClick={() => setActiveTab(card.path)}
              className={`glass-panel p-4 rounded-2xl border transition-all duration-300 cursor-pointer hover:-translate-y-1 bg-gradient-to-b ${card.gradient} ${
                card.highlight ? 'shadow-xl shadow-rose-950/60' : 'hover:border-indigo-500/40 shadow-lg'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-slate-400 truncate uppercase tracking-wider">{card.title}</span>
                <div className="p-1.5 rounded-lg bg-black/20">
                  <Icon className={`w-4 h-4 ${card.highlight ? 'animate-bounce' : ''}`} />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">{card.count}</div>
              <div className="mt-2.5 flex items-center gap-1 text-[10px] font-semibold text-slate-400 group-hover:text-white transition-colors">
                <span>Manage</span>
                <ArrowUpRight className="w-3 h-3 text-slate-500" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/90 flex items-center gap-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shrink-0 shadow-inner">
            <Percent className="w-6 h-6 text-indigo-400" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Room Utilization</span>
            <div className="text-xl font-extrabold text-white mt-0.5 font-heading">
              {stats?.roomUtilization || 0}%
            </div>
            <div className="w-full bg-slate-800/80 h-2 rounded-full mt-2 overflow-hidden border border-slate-700/50">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${stats?.roomUtilization || 0}%` }}
              />
            </div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800/90 flex items-center gap-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center shrink-0 shadow-inner">
            <Flame className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Faculty Workload</span>
            <div className="text-xl font-extrabold text-white mt-0.5 font-heading">
              {stats?.avgFacultyWorkload || 0} <span className="text-xs text-slate-400 font-normal">hrs / week</span>
            </div>
            <span className="text-[11px] font-medium text-indigo-400/80">Target Baseline: 18 - 22 hrs</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800/90 flex items-center gap-4 shadow-xl">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
              stats?.activeConflicts === 0
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/15 border-rose-500/30 text-rose-400 animate-pulse'
            }`}
          >
            {stats?.activeConflicts === 0 ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-rose-400" />
            )}
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Timetable Health Status</span>
            <div
              className={`text-lg font-extrabold mt-0.5 font-heading ${
                stats?.activeConflicts === 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {stats?.activeConflicts === 0 ? '100% Conflict Free' : `${stats?.activeConflicts} Action Required`}
            </div>
            <span className="text-[11px] text-slate-400">Autonomous validator active</span>
          </div>
        </div>
      </div>

      {/* Recharts Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Timetable Distribution Chart */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800/90 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-white font-heading">Weekly Class Distribution</h3>
              <p className="text-xs text-slate-400 mt-0.5">Periods scheduled per day across departments</p>
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <Activity className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.dayDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0b0f19', borderColor: '#374151', borderRadius: '16px', fontSize: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                />
                <Bar dataKey="classes" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Classes by Department Pie/Bar */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800/90 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-white font-heading">Department Load Dynamics</h3>
              <p className="text-xs text-slate-400 mt-0.5">Course volume breakdown</p>
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <Layers className="w-4 h-4 text-purple-400" />
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.classesByDepartment || []}>
                <defs>
                  <linearGradient id="colorClasses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="department" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0b0f19', borderColor: '#374151', borderRadius: '16px', fontSize: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                />
                <Area type="monotone" dataKey="classes" stroke="#a855f7" strokeWidth={2.5} fillOpacity={1} fill="url(#colorClasses)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
