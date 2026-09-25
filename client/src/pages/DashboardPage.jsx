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
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-400 font-medium">Loading Dashboard Metrics...</span>
        </div>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Faculty', count: stats?.totalFaculty || 0, icon: Users, color: 'indigo', path: 'faculty' },
    { title: 'Sections', count: stats?.totalSections || 0, icon: GraduationCap, color: 'sky', path: 'sections' },
    { title: 'Subjects', count: stats?.totalSubjects || 0, icon: BookOpen, color: 'emerald', path: 'subjects' },
    { title: 'Rooms & Labs', count: stats?.totalRooms || 0, icon: DoorClosed, color: 'purple', path: 'rooms' },
    { title: 'Scheduled Periods', count: stats?.totalEntries || 0, icon: Calendar, color: 'amber', path: 'timetable' },
    {
      title: 'Active Conflicts',
      count: stats?.activeConflicts || 0,
      icon: AlertTriangle,
      color: stats?.activeConflicts > 0 ? 'rose' : 'emerald',
      path: 'resolver',
      highlight: stats?.activeConflicts > 0,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-indigo-600/10 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              System Overview
            </span>
            <h2 className="text-2xl font-bold text-white mt-1">
              Dynamic Timetable Conflict Resolver
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Autonomous constraint validation, conflict detection, and multi-factor ranking optimizer.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('resolver')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/20 flex items-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch Conflict Resolver</span>
            </button>
            <button
              onClick={() => setActiveTab('timetable')}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 flex items-center gap-2 transition-all"
            >
              <Calendar className="w-4 h-4" />
              <span>View Timetable</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              onClick={() => setActiveTab(card.path)}
              className={`glass-card p-4 rounded-xl border transition-all cursor-pointer hover:-translate-y-0.5 ${
                card.highlight
                  ? 'border-rose-500/40 bg-rose-950/20 shadow-lg shadow-rose-950/50'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-slate-400">{card.title}</span>
                <Icon
                  className={`w-4 h-4 ${
                    card.highlight ? 'text-rose-400 animate-bounce' : 'text-indigo-400'
                  }`}
                />
              </div>
              <div className="text-2xl font-bold text-white tracking-tight">{card.count}</div>
              <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-400 hover:text-indigo-300">
                <span>Manage</span>
                <ArrowUpRight className="w-3 h-3" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-4 rounded-xl border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <Percent className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <span className="text-xs text-slate-400">Average Room Utilization</span>
            <div className="text-xl font-bold text-white mt-0.5">
              {stats?.roomUtilization || 0}%
            </div>
            <div className="w-48 bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${stats?.roomUtilization || 0}%` }}
              />
            </div>
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <span className="text-xs text-slate-400">Avg Faculty Workload</span>
            <div className="text-xl font-bold text-white mt-0.5">
              {stats?.avgFacultyWorkload || 0} hrs/week
            </div>
            <span className="text-[11px] text-slate-400">Target baseline: 18-22 hrs</span>
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-slate-800 flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
              stats?.activeConflicts === 0
                ? 'bg-emerald-500/10 border-emerald-500/20'
                : 'bg-rose-500/10 border-rose-500/20'
            }`}
          >
            {stats?.activeConflicts === 0 ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-rose-400" />
            )}
          </div>
          <div>
            <span className="text-xs text-slate-400">Timetable Integrity State</span>
            <div
              className={`text-lg font-bold mt-0.5 ${
                stats?.activeConflicts === 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {stats?.activeConflicts === 0 ? 'Optimal & Conflict-Free' : `${stats?.activeConflicts} Action Required`}
            </div>
            <span className="text-[11px] text-slate-400">Autonomous validator active</span>
          </div>
        </div>
      </div>

      {/* Recharts Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Timetable Distribution Chart */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Weekly Class Distribution</h3>
              <p className="text-xs text-slate-400">Periods scheduled per day across departments</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.dayDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="classes" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Classes by Department Pie/Bar */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Scheduled Load by Department</h3>
              <p className="text-xs text-slate-400">Course volume breakdown</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.classesByDepartment || []}>
                <defs>
                  <linearGradient id="colorClasses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="department" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="classes" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorClasses)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
