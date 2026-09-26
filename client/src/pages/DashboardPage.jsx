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
  Flame,
  TrendingUp,
} from "lucide-react";
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
      <div style={{ color: "var(--text-muted)" }} className="mb-1 text-[11px]">{label}</div>
      <div className="font-bold text-indigo-300">{payload[0]?.value}</div>
    </div>
  );
};

const StatCard = ({ card, onClick }) => {
  const Icon = card.icon;
  return (
    <div
      onClick={onClick}
      className="card-3d card-interactive p-5 cursor-pointer group"
      style={
        card.highlight
          ? {
              background: "linear-gradient(145deg, rgba(239,68,68,0.12) 0%, rgba(239,68,68,0.07) 100%)",
              borderColor: "rgba(239,68,68,0.30)",
            }
          : {}
      }
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{
            background: card.highlight
              ? "rgba(239,68,68,0.12)"
              : "rgba(79,70,229,0.12)",
            border: `1px solid ${card.highlight ? "rgba(239,68,68,0.25)" : "rgba(79,70,229,0.22)"}`,
          }}
        >
          <Icon
            className="w-4 h-4"
            style={{ color: card.highlight ? "#fca5a5" : "#a5b4fc" }}
          />
        </div>
        <ArrowUpRight
          className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: "var(--text-muted)" }}
        />
      </div>
      <div
        className="stat-number"
        style={{ color: card.highlight ? "#fca5a5" : "var(--text-primary)" }}
      >
        {card.count}
      </div>
      <div className="stat-label mt-1">{card.title}</div>
      <div className="text-[10px] mt-0.5" style={{ color: "var(--text-faint)" }}>
        {card.unit}
      </div>
    </div>
  );
};

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
        <div className="flex flex-col items-center gap-4">
          <div className="spinner" />
          <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
            Loading dashboard…
          </span>
        </div>
      </div>
    );
  }

  const statCards = [
    { title: "Faculty", count: stats?.totalFaculty || 0, icon: Users, path: "faculty", unit: "members" },
    { title: "Sections", count: stats?.totalSections || 0, icon: GraduationCap, path: "sections", unit: "cohorts" },
    { title: "Subjects", count: stats?.totalSubjects || 0, icon: BookOpen, path: "subjects", unit: "courses" },
    { title: "Rooms", count: stats?.totalRooms || 0, icon: DoorClosed, path: "rooms", unit: "spaces" },
    { title: "Periods", count: stats?.totalEntries || 0, icon: Calendar, path: "timetable", unit: "scheduled" },
    {
      title: "Conflicts",
      count: stats?.activeConflicts || 0,
      icon: AlertTriangle,
      path: "resolver",
      unit: "active",
      highlight: (stats?.activeConflicts || 0) > 0,
    },
  ];

  const hasConflicts = (stats?.activeConflicts || 0) > 0;

  return (
    <div className="space-y-5 panel-enter-3d">

      {/* Animated Multi-Color Hero Banner */}
      <div
        className="glass-card p-8 overflow-hidden relative"
        style={{
          background: "linear-gradient(135deg, rgba(22, 34, 64, 0.65) 0%, rgba(10, 18, 40, 0.75) 100%)",
          border: "1px solid rgba(139, 92, 246, 0.4)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.15)",
        }}
      >
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 opacity-100 mix-blend-screen pointer-events-none"
             style={{
               background: "radial-gradient(circle at 20% 0%, rgba(99, 102, 241, 0.9) 0%, transparent 60%), radial-gradient(circle at 80% 100%, rgba(236, 72, 153, 0.9) 0%, transparent 60%), radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.6) 0%, transparent 70%)",
             }}
        />
        <div className="absolute top-[-30%] right-[-10%] w-[32rem] h-[32rem] rounded-full blur-3xl opacity-90 pointer-events-none mix-blend-screen"
             style={{ background: "linear-gradient(to right, #4f46e5, #ec4899)", animation: "spin 10s linear infinite" }} />
        <div className="absolute bottom-[-30%] left-[-10%] w-[28rem] h-[28rem] rounded-full blur-3xl opacity-80 pointer-events-none mix-blend-screen"
             style={{ background: "linear-gradient(to right, #10b981, #3b82f6)", animation: "spin 12s linear infinite reverse" }} />

        <style>{`
          @keyframes spin { 100% { transform: rotate(360deg); } }
          .hero-text-gradient {
            background: linear-gradient(to right, #ffffff 0%, #a5b4fc 50%, #f9a8d4 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
        `}</style>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-3"
                  style={{ background: "rgba(255,255,255,0.1)", color: "#e0e7ff", border: "1px solid rgba(255,255,255,0.2)" }}>
              System Overview
            </span>
            <h2
              className="mt-1 font-bold leading-tight"
              style={{ fontSize: "36px", fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Timetable <span className="hero-text-gradient">Conflict Resolver</span>
            </h2>
            <p className="mt-3 max-w-xl text-sm" style={{ color: "rgba(255,255,255,0.7)", lineHeight: "1.6" }}>
              Autonomous constraint validation, conflict detection, and multi-factor resolution engine. Engineered for extreme efficiency.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setActiveTab("timetable")}
              className="btn btn-secondary"
            >
              <Calendar className="w-4 h-4" />
              Timetable
            </button>
            <button
              onClick={() => setActiveTab("resolver")}
              className="btn btn-primary"
            >
              <Zap className="w-4 h-4" />
              Resolve Conflicts
            </button>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((card) => (
          <StatCard
            key={card.title}
            card={card}
            onClick={() => setActiveTab(card.path)}
          />
        ))}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Room Utilization */}
        <div className="glass-card p-4 flex items-start gap-3.5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: "rgba(79,70,229,0.12)",
              border: "1px solid rgba(79,70,229,0.22)",
              boxShadow: "0 2px 8px rgba(79,70,229,0.12)",
            }}
          >
            <Percent className="w-5 h-5" style={{ color: "#a5b4fc" }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="stat-label">Room Utilization</div>
            <div className="stat-number mt-1">{stats?.roomUtilization || 0}%</div>
            <div className="progress-bar mt-2">
              <div
                className="progress-bar-fill"
                style={{ width: `${stats?.roomUtilization || 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Faculty Workload */}
        <div className="glass-card p-4 flex items-start gap-3.5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: "rgba(16,185,129,0.10)",
              border: "1px solid rgba(16,185,129,0.22)",
            }}
          >
            <Flame className="w-5 h-5" style={{ color: "#6ee7b7" }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="stat-label">Avg Faculty Workload</div>
            <div className="stat-number mt-1">{stats?.avgFacultyWorkload || 0}</div>
            <div className="text-[11px] mt-1" style={{ color: "var(--text-muted)" }}>
              hrs/week · Target: 18–22 hrs
            </div>
          </div>
        </div>

        {/* Integrity Status */}
        <div className="glass-card p-4 flex items-start gap-3.5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={
              hasConflicts
                ? { background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.22)" }
                : { background: "rgba(16,185,129,0.10)", border: "1px solid rgba(16,185,129,0.22)" }
            }
          >
            {hasConflicts ? (
              <AlertTriangle className="w-5 h-5" style={{ color: "#fca5a5" }} />
            ) : (
              <CheckCircle2 className="w-5 h-5" style={{ color: "#6ee7b7" }} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="stat-label">Integrity Status</div>
            <div
              className="text-base font-bold mt-1 leading-tight"
              style={{
                color: hasConflicts ? "#fca5a5" : "#6ee7b7",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              {hasConflicts
                ? `${stats?.activeConflicts} Issue${stats?.activeConflicts !== 1 ? "s" : ""} Found`
                : "Conflict-Free"}
            </div>
            <div className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
              Autonomous validator active
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Weekly Distribution */}
        <div className="glass-card p-5">
          <div className="mb-4">
            <h3
              className="text-sm font-semibold"
              style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Weekly Class Distribution
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              Periods scheduled per day
            </p>
          </div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats?.dayDistribution || []}
                margin={{ top: 4, right: 4, bottom: 0, left: -16 }}
              >
                <CartesianGrid strokeDasharray="2 4" stroke="rgba(79,70,229,0.08)" vertical={false} />
                <XAxis
                  dataKey="day"
                  stroke="var(--text-faint)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--text-muted)" }}
                />
                <YAxis
                  stroke="var(--text-faint)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--text-muted)" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="classes"
                  fill="url(#barGradient)"
                  radius={[6, 6, 0, 0]}
                  opacity={0.95}
                />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#818cf8" stopOpacity={1} />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.85} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Load */}
        <div className="glass-card p-5">
          <div className="mb-4">
            <h3
              className="text-sm font-semibold"
              style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Scheduled Load by Department
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              Course volume breakdown
            </p>
          </div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={stats?.classesByDepartment || []}
                margin={{ top: 4, right: 4, bottom: 0, left: -16 }}
              >
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.40} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="rgba(79,70,229,0.08)" vertical={false} />
                <XAxis
                  dataKey="department"
                  stroke="var(--text-faint)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--text-muted)" }}
                />
                <YAxis
                  stroke="var(--text-faint)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--text-muted)" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="classes"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fill="url(#areaGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
