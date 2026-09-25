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

const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#6366f1'];

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
    return <div className="text-center py-16 text-xs text-slate-400">Loading comprehensive analytics...</div>;
  }

  const { summary, roomUtilizationData, facultyWorkloadData, sectionWorkloadData, conflictTypeChartData } = data || {};

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6 border border-slate-800">
        <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
          Intelligence & Telemetry
        </span>
        <h2 className="text-2xl font-bold text-white mt-0.5">Timetable Analytics & Workload Metrics</h2>
        <p className="text-xs text-slate-400">
          In-depth capacity utilization, faculty distribution balance, and conflict resolution efficiency.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400">Scheduled Periods</span>
          <div className="text-2xl font-bold text-white mt-1">{summary?.totalPeriodsScheduled || 0}</div>
          <span className="text-[10px] text-indigo-400">Across all cohorts</span>
        </div>

        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400">Resolution Rate</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{summary?.resolutionRate || 100}%</div>
          <span className="text-[10px] text-slate-400">{summary?.resolvedConflicts || 0} conflicts auto-resolved</span>
        </div>

        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400">Active Conflicts</span>
          <div className={`text-2xl font-bold mt-1 ${summary?.activeConflicts > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {summary?.activeConflicts || 0}
          </div>
          <span className="text-[10px] text-slate-400">Requires review</span>
        </div>

        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400">Active Facilities</span>
          <div className="text-2xl font-bold text-white mt-1">{summary?.totalRooms || 0}</div>
          <span className="text-[10px] text-slate-400">Lecture halls & labs</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Room Utilization */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <h3 className="text-sm font-semibold text-white mb-1">Room Utilization Percentages</h3>
          <p className="text-xs text-slate-400 mb-4">Booked periods vs max theoretical capacity</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roomUtilizationData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="roomNumber" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="utilizationRate" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Faculty Workload Distribution */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <h3 className="text-sm font-semibold text-white mb-1">Faculty Teaching Workload (Hours/Week)</h3>
          <p className="text-xs text-slate-400 mb-4">Assigned lecture hours per staff member</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={(facultyWorkloadData || []).slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickFormatter={(v) => v.split(' ')[1] || v} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="assignedHours" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Conflict Type Breakdown Pie Chart */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <h3 className="text-sm font-semibold text-white mb-1">Conflict Distribution by Constraint Type</h3>
          <p className="text-xs text-slate-400 mb-4">Historical & active collision classifications</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={(conflictTypeChartData || []).filter((d) => d.count > 0)}
                  dataKey="count"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {(conflictTypeChartData || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Section Load Table / Metrics */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <h3 className="text-sm font-semibold text-white mb-1">Section Load Breakdown</h3>
          <p className="text-xs text-slate-400 mb-4">Weekly class hours scheduled per cohort</p>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {(sectionWorkloadData || []).map((sec) => (
              <div
                key={sec.name}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs"
              >
                <div>
                  <span className="font-bold text-white">{sec.name}</span>
                  <span className="text-slate-400 ml-2">({sec.department})</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-slate-400">{sec.studentCount} students</span>
                  <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 font-bold border border-indigo-500/20">
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
