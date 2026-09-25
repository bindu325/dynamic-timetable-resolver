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
  Activity,
  Layers,
  CalendarCheck,
  Building,
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
} from 'recharts';

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
          <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-500 font-semibold tracking-wider uppercase">
            Loading Academic Metrics...
          </span>
        </div>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Faculty', count: stats?.totalFaculty || 0, subtitle: 'Active instructors', icon: Users, path: 'faculty' },
    { title: 'Sections', count: stats?.totalSections || 0, subtitle: 'Student cohorts', icon: GraduationCap, path: 'sections' },
    { title: 'Subjects', count: stats?.totalSubjects || 0, subtitle: 'Course curriculum', icon: BookOpen, path: 'subjects' },
    { title: 'Rooms & Labs', count: stats?.totalRooms || 0, subtitle: 'Physical spaces', icon: DoorClosed, path: 'rooms' },
    { title: 'Scheduled Periods', count: stats?.totalEntries || 0, subtitle: 'Active sessions', icon: Calendar, path: 'timetable' },
    {
      title: 'Active Conflicts',
      count: stats?.activeConflicts || 0,
      subtitle: stats?.activeConflicts > 0 ? 'Requires attention' : 'Zero clashes',
      icon: AlertTriangle,
      path: 'resolver',
      highlight: stats?.activeConflicts > 0,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome / Action Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md text-[11px] font-bold text-teal-800 bg-teal-50 border border-teal-200 uppercase tracking-wider">
            <CalendarCheck className="w-3.5 h-3.5 text-teal-700" />
            Institutional Scheduling Console
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Academic Operations & Timetable Overview
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Monitor real-time resource allocations, constraint validations, and automated conflict resolutions across all departments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('resolver')}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs flex items-center gap-2 transition-all cursor-pointer active:scale-98"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>Open Conflict Resolver</span>
          </button>
          <button
            onClick={() => setActiveTab('timetable')}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs flex items-center gap-2 transition-all cursor-pointer active:scale-98"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>View Timetable Grid</span>
          </button>
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
              className={`bg-white p-4 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-md hover:border-slate-300 flex flex-col justify-between ${
                card.highlight
                  ? 'border-rose-300 bg-rose-50/40'
                  : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">{card.title}</span>
                  <div className={`p-1.5 rounded-md ${card.highlight ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className={`text-2xl font-extrabold tracking-tight ${card.highlight ? 'text-rose-600' : 'text-slate-900'}`}>
                  {card.count}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 truncate">{card.subtitle}</div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-teal-700">
                <span>Manage</span>
                <ArrowUpRight className="w-3 h-3 text-teal-600" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center shrink-0">
            <Percent className="w-5 h-5 text-teal-700" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-semibold text-slate-500">Average Room Utilization</span>
            <div className="text-lg font-bold text-slate-900 mt-0.5">
              {stats?.roomUtilization || 0}%
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-teal-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${stats?.roomUtilization || 0}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-blue-700" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500">Avg Faculty Workload</span>
            <div className="text-lg font-bold text-slate-900 mt-0.5">
              {stats?.avgFacultyWorkload || 0} <span className="text-xs text-slate-400 font-normal">hrs / week</span>
            </div>
            <span className="text-[11px] text-slate-400">Target baseline: 18 - 22 hrs</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
              stats?.activeConflicts === 0
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}
          >
            {stats?.activeConflicts === 0 ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            )}
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500">Timetable Integrity State</span>
            <div
              className={`text-base font-bold mt-0.5 ${
                stats?.activeConflicts === 0 ? 'text-emerald-700' : 'text-rose-600'
              }`}
            >
              {stats?.activeConflicts === 0 ? 'Optimal (0 Conflicts)' : `${stats?.activeConflicts} Action Required`}
            </div>
            <span className="text-[11px] text-slate-400">Autonomous validator active</span>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Weekly Class Distribution</h3>
              <p className="text-xs text-slate-500 mt-0.5">Periods scheduled per day across all departments</p>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200">
              <Activity className="w-4 h-4 text-slate-500" />
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.dayDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="classes" fill="#0f766e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Department Course Load</h3>
              <p className="text-xs text-slate-500 mt-0.5">Total scheduled lecture and lab volume</p>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200">
              <Layers className="w-4 h-4 text-slate-500" />
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.classesByDepartment || []}>
                <defs>
                  <linearGradient id="colorClasses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="department" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="classes" stroke="#0284c7" strokeWidth={2} fillOpacity={1} fill="url(#colorClasses)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
