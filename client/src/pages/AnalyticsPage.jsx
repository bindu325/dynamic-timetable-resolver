import React, { useState, useEffect } from "react";
import API from "../services/api";
import {
  Percent,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Users,
  DoorClosed,
  TrendingUp,
  Activity,
} from "lucide-react";
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
} from "recharts";

const PIE_COLORS = ["#ef4444", "#f59e0b", "#8b5cf6", "#6366f1", "#ec4899", "#10b981", "#06b6d4"];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-3 py-2 rounded-xl text-xs"
      style={{
        background: "rgba(10, 18, 40, 0.96)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(79, 70, 229, 0.30)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.60)",
        color: "var(--text-primary)",
      }}
    >
      <div className="mb-1 text-[11px]" style={{ color: "var(--text-muted)" }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="font-bold" style={{ color: "#a5b4fc" }}>
          {p.value}{p.unit || ""}
        </div>
      ))}
    </div>
  );
};

const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const res = await API.get("/analytics");
      if (res.data.success) setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnalytics(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="spinner" />
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            Loading analytics…
          </span>
        </div>
      </div>
    );
  }

  const { summary, roomUtilizationData, facultyWorkloadData, sectionWorkloadData, conflictTypeChartData } = data || {};

  const kpis = [
    {
      label: "Periods Scheduled",
      value: summary?.totalPeriodsScheduled || 0,
      sub: "Across all cohorts",
      icon: Activity,
      color: "#a5b4fc",
      bgColor: "rgba(79,70,229,0.12)",
      borderColor: "rgba(79,70,229,0.22)",
    },
    {
      label: "Resolution Rate",
      value: `${summary?.resolutionRate || 100}%`,
      sub: `${summary?.resolvedConflicts || 0} auto-resolved`,
      icon: CheckCircle2,
      color: "#6ee7b7",
      bgColor: "rgba(16,185,129,0.10)",
      borderColor: "rgba(16,185,129,0.22)",
    },
    {
      label: "Active Conflicts",
      value: summary?.activeConflicts || 0,
      sub: "Requires review",
      icon: AlertTriangle,
      color: (summary?.activeConflicts || 0) > 0 ? "#fca5a5" : "#6ee7b7",
      bgColor: (summary?.activeConflicts || 0) > 0 ? "rgba(239,68,68,0.10)" : "rgba(16,185,129,0.10)",
      borderColor: (summary?.activeConflicts || 0) > 0 ? "rgba(239,68,68,0.22)" : "rgba(16,185,129,0.22)",
    },
    {
      label: "Active Facilities",
      value: summary?.totalRooms || 0,
      sub: "Halls & labs",
      icon: DoorClosed,
      color: "#94a3b8",
      bgColor: "rgba(148,163,184,0.08)",
      borderColor: "rgba(148,163,184,0.18)",
    },
  ];

  return (
    <div className="space-y-5 panel-enter-3d">

      {/* Page Header */}
      <div
        className="glass-card p-6 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(22, 34, 64, 0.80) 0%, rgba(10, 18, 40, 0.90) 100%)",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            width: "40%",
            height: "200%",
            background: "radial-gradient(ellipse at 80% 50%, rgba(79,70,229,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div className="relative">
          <span className="section-eyebrow">Intelligence & Telemetry</span>
          <h2
            className="section-title mt-1"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Analytics &amp;{" "}
            <span className="text-gradient-indigo">Workload Metrics</span>
          </h2>
          <p className="section-desc mt-1.5">
            Capacity utilization, faculty distribution balance, and conflict resolution efficiency.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="card-3d p-5">
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: kpi.bgColor, border: `1px solid ${kpi.borderColor}` }}
                >
                  <Icon className="w-4 h-4" style={{ color: kpi.color }} />
                </div>
              </div>
              <div className="stat-number" style={{ color: kpi.color }}>{kpi.value}</div>
              <div className="stat-label mt-1">{kpi.label}</div>
              <div className="text-[10px] mt-0.5" style={{ color: "var(--text-faint)" }}>{kpi.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Charts 2x2 Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Room Utilization */}
        <div className="glass-card p-5">
          <h3
            className="text-sm font-semibold mb-0.5"
            style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Room Utilization
          </h3>
          <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
            Booked periods vs theoretical capacity
          </p>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roomUtilizationData || []} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
                <defs>
                  <linearGradient id="roomGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#818cf8" stopOpacity={1} />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="rgba(79,70,229,0.08)" vertical={false} />
                <XAxis dataKey="roomNumber" stroke="var(--text-faint)" fontSize={11} tickLine={false} axisLine={false} tick={{ fill: "var(--text-muted)" }} />
                <YAxis stroke="var(--text-faint)" fontSize={11} tickLine={false} axisLine={false} tick={{ fill: "var(--text-muted)" }} unit="%" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="utilizationRate" fill="url(#roomGrad)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Faculty Workload */}
        <div className="glass-card p-5">
          <h3
            className="text-sm font-semibold mb-0.5"
            style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Faculty Teaching Workload
          </h3>
          <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
            Assigned hours per staff member (hrs/week)
          </p>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={(facultyWorkloadData || []).slice(0, 10)} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
                <defs>
                  <linearGradient id="facGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6ee7b7" stopOpacity={1} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="rgba(79,70,229,0.08)" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="var(--text-faint)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--text-muted)" }}
                  tickFormatter={(v) => v.split(" ")[1] || v}
                />
                <YAxis stroke="var(--text-faint)" fontSize={11} tickLine={false} axisLine={false} tick={{ fill: "var(--text-muted)" }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="assignedHours" fill="url(#facGrad)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Conflict Distribution Pie */}
        <div className="glass-card p-5">
          <h3
            className="text-sm font-semibold mb-0.5"
            style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Conflict Distribution
          </h3>
          <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
            By constraint type
          </p>
          <div style={{ height: 220, position: "relative" }}>
            {((conflictTypeChartData || []).filter((d) => d.count > 0).length > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={(conflictTypeChartData || []).filter((d) => d.count > 0)}
                    dataKey="count"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    outerRadius={78}
                    innerRadius={36}
                    paddingAngle={2}
                  >
                    {(conflictTypeChartData || []).filter((d) => d.count > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} opacity={0.90} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "rgba(10, 18, 40, 0.96)",
                      border: "1px solid rgba(79, 70, 229, 0.30)",
                      borderRadius: "12px",
                      fontSize: "11px",
                      color: "var(--text-primary)",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "10px", color: "var(--text-secondary)" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full blur-2xl pointer-events-none"
                  style={{ background: "radial-gradient(circle, rgba(79,70,229,0.15) 0%, transparent 70%)", zIndex: 0 }}
                />
                <div
                  className="relative z-10 flex flex-col items-center gap-3 p-5 rounded-2xl"
                  style={{
                    background: "rgba(22,34,64,0.80)",
                    backdropFilter: "blur(16px)",
                    border: "1px solid rgba(79,70,229,0.25)",
                    boxShadow: "0 4px 24px rgba(79,70,229,0.12), inset 0 1px 0 rgba(255,255,255,0.05)",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      background: "linear-gradient(145deg, #6366f1 0%, #4f46e5 100%)",
                      boxShadow: "0 3px 0 rgba(40,33,160,0.50), 0 6px 16px rgba(79,70,229,0.35)",
                    }}
                  >
                    <CheckCircle2 className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                  <div className="text-center">
                    <span
                      className="block text-sm font-extrabold tracking-tight whitespace-nowrap text-gradient-indigo"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      100% Conflict-Free
                    </span>
                    <span
                      className="block text-[10px] mt-0.5 font-medium uppercase tracking-widest whitespace-nowrap"
                      style={{ color: "var(--text-muted)" }}
                    >
                      System optimized
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section Load Breakdown */}
        <div className="glass-card p-5">
          <h3
            className="text-sm font-semibold mb-0.5"
            style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Section Load Breakdown
          </h3>
          <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
            Weekly class hours per cohort
          </p>
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {(sectionWorkloadData || []).map((sec) => (
              <div
                key={sec.name}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs"
                style={{
                  background: "rgba(10,18,40,0.60)",
                  border: "1px solid rgba(79,70,229,0.12)",
                }}
              >
                <div>
                  <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                    {sec.name}
                  </span>
                  <span className="ml-2" style={{ color: "var(--text-muted)" }}>
                    ({sec.department})
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span style={{ color: "var(--text-muted)" }}>{sec.studentCount} students</span>
                  <span
                    className="px-2 py-0.5 rounded-lg font-bold"
                    style={{
                      background: "rgba(79,70,229,0.12)",
                      color: "#a5b4fc",
                      border: "1px solid rgba(79,70,229,0.22)",
                    }}
                  >
                    {sec.classesCount} /wk
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
