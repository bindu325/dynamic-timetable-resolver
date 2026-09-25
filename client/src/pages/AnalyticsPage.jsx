import React, { useState, useEffect } from 'react';
import API from '../services/api';
import {
  BarChart3,
  Percent,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Users,
  DoorClosed,
  TrendingUp,
  Calendar,
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
  Legend,
} from 'recharts';

const COLORS = ['#e11d48', '#f59e0b', '#0d9488', '#6366f1', '#ec4899', '#10b981', '#3b82f6'];

const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const res = await API.get('/analytics');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="app-card p-16 text-center text-xs text-slate-400">Loading comprehensive analytics...</div>;
  }

  const { summary, roomUtilizationData, facultyWorkloadData, sectionWorkloadData, conflictTypeChartData } = data || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="app-card p-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200/60">
            <BarChart3 className="w-3.5 h-3.5" />
            Intelligence & Telemetry
          </span>
          <span className="text-xs text-slate-500 font-medium">Institutional Analytics</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Timetable Analytics & Workload Metrics</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          In-depth capacity utilization, faculty distribution balance, and conflict resolution efficiency.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <span className="stat-label">Scheduled Periods</span>
          <div className="stat-value">{summary?.totalPeriodsScheduled || 0}</div>
          <span className="stat-desc">Across all active cohorts</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Resolution Rate</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1 tracking-tight">{summary?.resolutionRate || 100}%</div>
          <span className="stat-desc">{summary?.resolvedConflicts || 0} conflicts resolved</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Active Conflicts</span>
          <div className={`text-2xl font-bold mt-1 tracking-tight ${summary?.activeConflicts > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {summary?.activeConflicts || 0}
          </div>
          <span className="stat-desc">Requiring attention</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Active Facilities</span>
          <div className="stat-value">{summary?.totalRooms || 0}</div>
          <span className="stat-desc">Lecture halls & labs</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Room Utilization */}
        <div className="app-card p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-0.5">Room Utilization Percentages</h3>
          <p className="text-xs text-slate-500 mb-4">Booked periods vs max theoretical capacity</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roomUtilizationData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="roomNumber" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} unit="%" tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '10px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                />
                <Bar dataKey="utilizationRate" fill="#0d9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Faculty Workload Distribution */}
        <div className="app-card p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-0.5">Faculty Teaching Workload (Hours/Week)</h3>
          <p className="text-xs text-slate-500 mb-4">Assigned lecture hours per staff member</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={(facultyWorkloadData || []).slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} tickFormatter={(v) => v.split(' ')[1] || v} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '10px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                />
                <Bar dataKey="assignedHours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Conflict Type Breakdown Pie Chart */}
        <div className="app-card p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-0.5">Conflict Distribution by Constraint Type</h3>
          <p className="text-xs text-slate-500 mb-4">Historical & active collision classifications</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={(conflictTypeChartData || []).filter((d) => d.count > 0)}
                  dataKey="count"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  label
                >
                  {(conflictTypeChartData || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '10px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Section Load Table / Metrics */}
        <div className="app-card p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-0.5">Section Load Breakdown</h3>
          <p className="text-xs text-slate-500 mb-4">Weekly class hours scheduled per student cohort</p>
          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {(sectionWorkloadData || []).map((sec) => (
              <div
                key={sec.name}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900">{sec.name}</span>
                  <span className="text-slate-400 ml-2">({sec.department})</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 font-medium">{sec.studentCount} students</span>
                  <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 font-bold border border-teal-200/60">
                    {sec.classesCount} periods/wk
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
