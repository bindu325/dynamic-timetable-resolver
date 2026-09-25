import React, { useState } from 'react';
import {
  Calendar,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Building,
  User,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
  BarChart3,
  Layers,
  GraduationCap,
  BookOpen,
  FileSpreadsheet,
  Check,
  ChevronRight,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import Hero3DScene from '../components/landing/Hero3DScene';

const LandingPage = ({ onGetStarted, onViewTimetable }) => {
  const [activeTabWorkflow, setActiveTabWorkflow] = useState(0);

  const workflowSteps = [
    {
      num: '01',
      title: 'Academic Data Ingestion',
      subtitle: 'Define faculty, rooms, course credits, and student cohorts.',
      icon: Layers,
      details: 'Input teacher workload ceilings, laboratory room requirements, and student cohort sizes.',
    },
    {
      num: '02',
      title: 'Constraint Formulation',
      subtitle: 'Map hard and soft academic rules into CSP parameters.',
      icon: SlidersHorizontal,
      details: 'Enforce non-overlapping faculty assignments, room capacity limits, and preferred timing shifts.',
    },
    {
      num: '03',
      title: 'Collision Detection',
      subtitle: 'Real-time multi-dimensional schedule scanning.',
      icon: AlertTriangle,
      details: 'Instant detection of room double-bookings, instructor timetable overlap, and faculty off-hour collisions.',
    },
    {
      num: '04',
      title: 'Multi-Factor Optimization',
      subtitle: 'Ranked alternative slot generation & simulation.',
      icon: Sparkles,
      details: 'Evaluate thousands of slot permutations and rank candidate solutions by satisfaction score.',
    },
    {
      num: '05',
      title: 'Conflict-Free Matrix',
      subtitle: 'Export master PDF schedules & departmental reports.',
      icon: CheckCircle2,
      details: 'Generate verified collision-free timetables ready for faculty publication and class distribution.',
    },
  ];

  const features = [
    {
      icon: AlertTriangle,
      color: 'bg-rose-50 text-rose-700 border-rose-200',
      title: 'Zero-Collision Conflict Detection',
      description: 'Constantly inspects the master schedule to pinpoint simultaneous room bookings, faculty overlaps, and capacity overflows.',
    },
    {
      icon: Sparkles,
      color: 'bg-teal-50 text-teal-700 border-teal-200',
      title: 'Multi-Factor Constraint Resolver',
      description: 'Permutes available slots, room types, and days to deliver ranked solutions with transparent constraint validation scores.',
    },
    {
      icon: ShieldCheck,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      title: 'What-If Impact Simulation',
      description: 'Simulate the ripple effects of any timetable adjustment before persisting changes to the central database.',
    },
    {
      icon: BarChart3,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      title: 'Resource Telemetry & Analytics',
      description: 'Monitor lecture hall utilization rates, track faculty teaching hour distribution, and balance weekly student loads.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-teal-100 selection:text-teal-900">
      {/* Top Floating Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-900 tracking-tight block leading-tight">
                Dynamic Timetable Resolver
              </span>
              <span className="text-[10px] text-teal-700 font-semibold uppercase tracking-wider block">
                Intelligent Academic Scheduling
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onViewTimetable}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Live Matrix
            </button>
            <button
              onClick={onGetStarted}
              className="btn-primary text-xs flex items-center gap-1.5"
            >
              <span>Access Platform</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-slate-200 bg-grid-pattern">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gradient-to-b from-teal-500/10 via-emerald-500/5 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Column: Hero Text */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
              <span>Next-Gen Constraint Satisfaction Engine</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Intelligent Academic Scheduling &{' '}
              <span className="text-teal-700 underline decoration-teal-300 decoration-wavy decoration-2">
                Conflict Resolution
              </span>
            </h1>

            <p className="text-base text-slate-600 leading-relaxed max-w-xl">
              Eliminate lecture collisions, optimize campus room occupancy, and resolve complex scheduling constraints automatically with real-time What-If simulations.
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                onClick={onGetStarted}
                className="btn-primary text-sm px-6 py-3 flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                <span>Launch Scheduling Suite</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onViewTimetable}
                className="btn-secondary text-sm px-5 py-3 flex items-center gap-2"
              >
                <Calendar className="w-4 h-4 text-slate-500" />
                <span>Explore Live Matrix</span>
              </button>
            </div>

            {/* Quick trust metrics checklist */}
            <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-4 text-xs">
              <div className="space-y-0.5">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100% Collision Free</span>
                </div>
                <p className="text-[11px] text-slate-500">Automated CSP verification</p>
              </div>

              <div className="space-y-0.5">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Instant Alternatives</span>
                </div>
                <p className="text-[11px] text-slate-500">Multi-factor score ranking</p>
              </div>

              <div className="space-y-0.5">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Room Optimization</span>
                </div>
                <p className="text-[11px] text-slate-500">Capacity & lab balancing</p>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Interactive Composition */}
          <div className="lg:col-span-6 flex justify-center">
            <Hero3DScene
              onNavigateToTimetable={onViewTimetable}
              onNavigateToResolver={onGetStarted}
            />
          </div>
        </div>
      </section>

      {/* ================= CORE CAPABILITIES GRID ================= */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider block">
              Core Platform Capabilities
            </span>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Designed for Higher Education Operations
            </h2>
            <p className="text-sm text-slate-500">
              Manage multi-department scheduling complexities through purpose-built tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="app-card p-6 app-card-hover flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${f.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">{f.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{f.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center text-xs font-bold text-teal-700 gap-1">
                    <span>Feature Active</span>
                    <Check className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS: END-TO-END WORKFLOW ================= */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider block">
              Algorithmic Lifecycle
            </span>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              From Raw Constraints to Optimal Schedule
            </h2>
            <p className="text-sm text-slate-500">
              Follow how the Dynamic Timetable Resolver turns scheduling conflicts into a synchronized timetable.
            </p>
          </div>

          {/* Workflow Steps Horizontal Pipeline */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {workflowSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="app-card p-5 relative flex flex-col justify-between space-y-3 bg-white"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200/60">
                      {step.num}
                    </span>
                    <Icon className="w-4 h-4 text-slate-400" />
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900 leading-snug">{step.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-normal">{step.subtitle}</p>
                  </div>

                  <p className="text-[10px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 leading-relaxed">
                    {step.details}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= 3D INTERACTIVE SCHEDULING VISUALIZATION SECTION ================= */}
      <section className="py-20 bg-white border-b border-slate-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left: Explanation */}
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-bold text-teal-700 uppercase tracking-wider block">
                Visual Constraint Resolution
              </span>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight leading-tight">
                See Conflicts Resolve in Real-Time
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                When room double-bookings or instructor schedule overlaps occur, the system evaluates valid alternatives across all available days and periods.
              </p>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <div className="w-6 h-6 rounded bg-rose-100 text-rose-700 font-bold flex items-center justify-center shrink-0 text-xs">
                    !
                  </div>
                  <div>
                    <strong className="text-slate-900 block">Conflict Detected:</strong>
                    <span className="text-slate-600">Room LH-101 assigned simultaneously to Data Structures and Operating Systems on Monday at 10:00 AM.</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-teal-50/60 border border-teal-200 flex items-start gap-3">
                  <div className="w-6 h-6 rounded bg-teal-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    ✓
                  </div>
                  <div>
                    <strong className="text-teal-900 block">Automated AI Resolution:</strong>
                    <span className="text-teal-800">Operating Systems shifted to Room LH-204 (Score: 98/100, 0 hard constraint collisions).</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={onGetStarted}
                  className="btn-primary text-xs flex items-center gap-2"
                >
                  <span>Open Conflict Resolver</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right: Visual 3D Perspective Comparison Board */}
            <div className="lg:col-span-7 flex justify-center">
              <div className="w-full max-w-lg bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-md space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Conflict Resolution Demo
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Resolved: 0 Errors
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3.5 text-xs">
                  {/* Before Box */}
                  <div className="p-4 rounded-xl bg-white border border-rose-200 space-y-2">
                    <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
                      Prior State (Conflicted)
                    </span>
                    <div className="p-2 rounded bg-rose-50 border border-rose-200/60">
                      <div className="font-bold text-slate-900">Data Structures</div>
                      <div className="text-[11px] text-rose-700 font-medium">Mon · 10:00 AM · LH-101</div>
                    </div>
                    <div className="p-2 rounded bg-rose-50 border border-rose-200/60">
                      <div className="font-bold text-slate-900">Operating Systems</div>
                      <div className="text-[11px] text-rose-700 font-medium">Mon · 10:00 AM · LH-101 (Collision!)</div>
                    </div>
                  </div>

                  {/* After Box */}
                  <div className="p-4 rounded-xl bg-white border border-teal-200 space-y-2">
                    <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block">
                      Resolved State (Optimized)
                    </span>
                    <div className="p-2 rounded bg-slate-50 border border-slate-100">
                      <div className="font-bold text-slate-900">Data Structures</div>
                      <div className="text-[11px] text-slate-600 font-medium">Mon · 10:00 AM · LH-101</div>
                    </div>
                    <div className="p-2 rounded bg-emerald-50 border border-emerald-200/80">
                      <div className="font-bold text-slate-900">Operating Systems</div>
                      <div className="text-[11px] text-emerald-700 font-bold">Mon · 10:00 AM · LH-204 (Assigned)</div>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-200 text-center">
                  Live CSP algorithm runs locally in &lt;15ms per slot calculation.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA SECTION ================= */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-400/30 text-teal-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ready for Immediate Deployment</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Streamline Your Academic Scheduling?
          </h2>

          <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Eliminate hours of manual timetable compilation and constraint conflict resolution with an integrated operations platform.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
            <button
              onClick={onGetStarted}
              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm px-6 py-3 rounded-lg shadow-lg shadow-teal-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onViewTimetable}
              className="bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm px-5 py-3 rounded-lg border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Explore Master Grid</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 bg-slate-950 border-t border-slate-800 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Dynamic Timetable Resolver · Intelligent Academic Scheduling</span>
          <span>Operations Platform · Connected Constraint Satisfaction Engine</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
