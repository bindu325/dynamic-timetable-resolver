import React, { useEffect, useState, useRef } from "react";
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
      title: "Conflicts",
      count: stats?.activeConflicts || 0,
      subtitle: stats?.activeConflicts > 0 ? 'Requires attention' : 'Zero clashes',
      icon: AlertTriangle,
      path: 'resolver',
      highlight: stats?.activeConflicts > 0,
    },
  ];

  const hasConflicts = (stats?.activeConflicts || 0) > 0;

  return (
    <div className="space-y-6">
      {/* Top Welcome / Action Banner */}
      <div className="bg-[#ffffff] rounded-2xl p-6 sm:p-7 border border-[#e5ded2] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md text-[11px] font-bold text-[#8c5e47] bg-[#faf4ea] border border-[#ebd6b3] uppercase tracking-wider">
            <CalendarCheck className="w-3.5 h-3.5 text-[#8c5e47]" />
            Institutional Scheduling Console
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#2d2a26] tracking-tight">
            Academic Operations & Timetable Overview
          </h2>
          <p className="text-xs sm:text-sm text-[#8a8275] leading-relaxed">
            Monitor real-time resource allocations, constraint validations, and automated conflict resolutions across all departments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('resolver')}
            className="px-4 py-2 rounded-xl bg-[#8c5e47] hover:bg-[#784f3a] text-white text-xs font-semibold shadow-xs flex items-center gap-2 transition-all cursor-pointer active:scale-98"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#fdedd9]" />
            <span>Open Conflict Resolver</span>
          </button>
          <button
            onClick={() => setActiveTab('timetable')}
            className="px-4 py-2 rounded-xl bg-[#ffffff] hover:bg-[#f7f5f0] text-[#57524a] text-xs font-semibold border border-[#e5ded2] shadow-xs flex items-center gap-2 transition-all cursor-pointer active:scale-98"
          >
            <Calendar className="w-3.5 h-3.5 text-[#8a8275]" />
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
              className={`bg-white p-4 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-md flex flex-col justify-between ${
                card.highlight
                  ? 'border-[#f0c7c3] bg-[#faeceb]/60'
                  : 'border-[#e5ded2] hover:border-[#d8cebf]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-[#8a8275] uppercase tracking-wider truncate">{card.title}</span>
                  <div className={`p-1.5 rounded-md ${card.highlight ? 'bg-[#faeceb] text-[#a8483f]' : 'bg-[#f4f0e7] text-[#57524a]'}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className={`text-2xl font-extrabold tracking-tight ${card.highlight ? 'text-[#a8483f]' : 'text-[#2d2a26]'}`}>
                  {card.count}
                </div>
                <div className="text-[11px] text-[#8a8275] mt-0.5 truncate">{card.subtitle}</div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#ede8df] flex items-center justify-between text-[11px] font-semibold text-[#8c5e47]">
                <span>Manage</span>
                <ArrowUpRight className="w-3 h-3 text-[#8c5e47]" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#e5ded2] shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#faf4ea] border border-[#ebd6b3] flex items-center justify-center shrink-0">
            <Percent className="w-5 h-5 text-[#8c5e47]" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-semibold text-[#8a8275]">Average Room Utilization</span>
            <div className="text-lg font-bold text-[#2d2a26] mt-0.5">
              {stats?.roomUtilization || 0}%
            </div>
            <div className="w-full bg-[#f4f0e7] h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-[#8c5e47] h-full rounded-full transition-all duration-500"
                style={{ width: `${stats?.roomUtilization || 0}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#e5ded2] shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#edf5ee] border border-[#c7decb] flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-[#526b58]" />
          </div>
          <div>
            <span className="text-xs font-semibold text-[#8a8275]">Avg Faculty Workload</span>
            <div className="text-lg font-bold text-[#2d2a26] mt-0.5">
              {stats?.avgFacultyWorkload || 0} <span className="text-xs text-[#8a8275] font-normal">hrs / week</span>
            </div>
            <span className="text-[11px] text-[#8a8275]">Target baseline: 18 - 22 hrs</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#e5ded2] shadow-xs flex items-center gap-4">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
              stats?.activeConflicts === 0
                ? 'bg-[#edf5ee] border-[#c7decb] text-[#4d7358]'
                : 'bg-[#faeceb] border-[#f0c7c3] text-[#a8483f]'
            }`}
          >
            {stats?.activeConflicts === 0 ? (
              <CheckCircle2 className="w-5 h-5 text-[#4d7358]" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-[#a8483f]" />
            )}
          </div>
          <div>
            <span className="text-xs font-semibold text-[#8a8275]">Timetable Integrity State</span>
            <div
              className={`text-base font-bold mt-0.5 ${
                stats?.activeConflicts === 0 ? 'text-[#4d7358]' : 'text-[#a8483f]'
              }`}
            >
              {stats?.activeConflicts === 0 ? 'Optimal (0 Conflicts)' : `${stats?.activeConflicts} Action Required`}
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-[#e5ded2] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#2d2a26]">Weekly Class Distribution</h3>
              <p className="text-xs text-[#8a8275] mt-0.5">Periods scheduled per day across all departments</p>
            </div>
            <div className="p-1.5 rounded-lg bg-[#f4f0e7] border border-[#e5ded2]">
              <Activity className="w-4 h-4 text-[#57524a]" />
            </div>
          </div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.dayDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ede8df" vertical={false} />
                <XAxis dataKey="day" stroke="#8a8275" fontSize={11} tickLine={false} />
                <YAxis stroke="#8a8275" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5ded2', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', color: '#2d2a26' }}
                />
                <Bar dataKey="classes" fill="#8c5e47" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#e5ded2] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#2d2a26]">Department Course Load</h3>
              <p className="text-xs text-[#8a8275] mt-0.5">Total scheduled lecture and lab volume</p>
            </div>
            <div className="p-1.5 rounded-lg bg-[#f4f0e7] border border-[#e5ded2]">
              <Layers className="w-4 h-4 text-[#57524a]" />
            </div>
          </div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={stats?.classesByDepartment || []}
                margin={{ top: 4, right: 4, bottom: 0, left: -16 }}
              >
                <defs>
                  <linearGradient id="colorClasses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#526b58" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#526b58" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ede8df" vertical={false} />
                <XAxis dataKey="department" stroke="#8a8275" fontSize={11} tickLine={false} />
                <YAxis stroke="#8a8275" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5ded2', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', color: '#2d2a26' }}
                />
                <Area type="monotone" dataKey="classes" stroke="#526b58" strokeWidth={2} fillOpacity={1} fill="url(#colorClasses)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
