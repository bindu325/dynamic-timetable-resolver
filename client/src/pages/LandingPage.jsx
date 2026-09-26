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
  TrendingUp,
  Activity,
  Cpu,
  Compass,
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
      iconBg: 'bg-gradient-to-r from-[#f5365c] to-[#f56036] text-white shadow-md shadow-[#f5365c]/30',
      badge: 'Real-Time Telemetry',
      badgeBg: 'bg-[#f5365c]/10 text-[#f5365c]',
      title: 'Zero-Collision Conflict Detection',
      description: 'Constantly inspects the master schedule to pinpoint simultaneous room bookings, faculty overlaps, and capacity overflows.',
    },
    {
      icon: Sparkles,
      iconBg: 'bg-gradient-to-r from-[#5e72e4] to-[#825ee4] text-white shadow-md shadow-[#5e72e4]/30',
      badge: 'Autonomous AI',
      badgeBg: 'bg-[#5e72e4]/10 text-[#5e72e4]',
      title: 'Multi-Factor Constraint Resolver',
      description: 'Permutes available slots, room types, and days to deliver ranked solutions with transparent constraint validation scores.',
    },
    {
      icon: ShieldCheck,
      iconBg: 'bg-gradient-to-r from-[#2dce89] to-[#2dcecc] text-white shadow-md shadow-[#2dce89]/30',
      badge: 'Constraint Simulator',
      badgeBg: 'bg-[#2dce89]/10 text-[#2dce89]',
      title: 'What-If Impact Simulation',
      description: 'Simulate the ripple effects of any timetable adjustment before persisting changes to the central database.',
    },
    {
      icon: BarChart3,
      iconBg: 'bg-gradient-to-r from-[#11cdef] to-[#1171ef] text-white shadow-md shadow-[#11cdef]/30',
      badge: 'Executive Analytics',
      badgeBg: 'bg-[#11cdef]/10 text-[#11cdef]',
      title: 'Resource Telemetry & Analytics',
      description: 'Monitor lecture hall utilization rates, track faculty teaching hour distribution, and balance weekly student loads.',
    },
  ];

  const quickStats = [
    { label: 'ACTIVE SLOTS', value: '3,450+', change: '+12.5%', isPositive: true, icon: Calendar, iconBg: 'bg-gradient-to-r from-[#5e72e4] to-[#825ee4]' },
    { label: 'RESOLVED CLASHES', value: '100%', change: '+3.4%', isPositive: true, icon: CheckCircle2, iconBg: 'bg-gradient-to-r from-[#2dce89] to-[#2dcecc]' },
    { label: 'ROOM OCCUPANCY', value: '89.4%', change: '+5.2%', isPositive: true, icon: Building, iconBg: 'bg-gradient-to-r from-[#11cdef] to-[#1171ef]' },
    { label: 'AVG RESOLUTION', value: '14ms', change: '-45%', isPositive: true, icon: Zap, iconBg: 'bg-gradient-to-r from-[#fb6340] to-[#fbb140]' },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fe] text-[#32325d] flex flex-col font-sans selection:bg-[#5e72e4]/20 selection:text-[#5e72e4]">
      {/* ================= TOP NAVIGATION HEADER ================= */}
      <header className="sticky top-0 z-50 bg-[#172b4d] border-b border-[#243e69] shadow-md transition-all">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#5e72e4] to-[#825ee4] flex items-center justify-center text-white shadow-md shadow-[#5e72e4]/40 font-bold">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-base text-white tracking-tight block leading-tight">
                Argon Timetable Resolver
              </span>
              <span className="text-[10px] text-[#11cdef] font-bold uppercase tracking-wider block">
                Next-Gen Academic Scheduling Engine
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onViewTimetable}
              className="text-xs font-semibold text-[#ced4da] hover:text-white px-3.5 py-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              Live Grid
            </button>
            <button
              onClick={onGetStarted}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#5e72e4] to-[#825ee4] text-white text-xs font-bold shadow-md shadow-[#5e72e4]/30 hover:shadow-lg hover:shadow-[#5e72e4]/40 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Launch Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ================= HERO SECTION WITH SIGNATURE ARGON BLUE GRADIENT ================= */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#5e72e4] via-[#775ada] to-[#11cdef] pt-14 pb-28 text-white shadow-lg">
        {/* Subtle geometric Argon grid & light overlays */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        <div className="absolute -right-24 -top-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-10 -bottom-20 w-80 h-80 bg-[#11cdef]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Column: Hero Text */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-xs font-bold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#2dce89] animate-pulse" />
              <span className="tracking-wide uppercase text-[11px]">Argon Reactive Scheduling Suite</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.2rem] font-extrabold text-white tracking-tight leading-[1.12]">
              Intelligent Academic Operations &amp;{' '}
              <span className="bg-gradient-to-r from-[#ffe066] to-[#ffffff] bg-clip-text text-transparent underline decoration-[#ffd600] decoration-wavy decoration-2">
                Conflict Resolution
              </span>
            </h1>

            <p className="text-base sm:text-lg text-white/90 leading-relaxed max-w-xl font-normal">
              Eliminate lecture collisions, optimize campus room occupancy, and execute automated multi-constraint satisfactions with real-time What-If simulations.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onGetStarted}
                className="px-6 py-3.5 rounded-xl bg-white text-[#5e72e4] hover:bg-[#f8f9fe] font-extrabold text-sm shadow-xl shadow-black/15 hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Launch Scheduling Suite</span>
                <ArrowRight className="w-4 h-4 text-[#5e72e4]" />
              </button>

              <button
                onClick={onViewTimetable}
                className="px-6 py-3.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/30 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-white/90" />
                <span>Explore Live Matrix</span>
              </button>
            </div>

            {/* Quick trust metrics checklist */}
            <div className="pt-6 border-t border-white/20 grid grid-cols-3 gap-4 text-xs">
              <div className="space-y-0.5">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2dce89] shrink-0" />
                  <span>100% Collision-Free</span>
                </div>
                <p className="text-[11px] text-white/75">Automated CSP verification</p>
              </div>

              <div className="space-y-0.5">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-[#ffd600] shrink-0" />
                  <span>Instant Alternatives</span>
                </div>
                <p className="text-[11px] text-white/75">Multi-factor score ranking</p>
              </div>

              <div className="space-y-0.5">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-[#11cdef] shrink-0" />
                  <span>Room Optimization</span>
                </div>
                <p className="text-[11px] text-white/75">Capacity &amp; lab balancing</p>
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

      {/* ================= ARGON FLOATING STAT CARDS OVERLAY ================= */}
      <section className="-mt-14 max-w-7xl mx-auto px-6 w-full relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {quickStats.map((st, i) => {
            const Icon = st.icon;
            return (
              <div
                key={i}
                className="bg-white rounded-2xl p-5 border border-[#e9ecef] shadow-[0_15px_35px_rgba(50,50,93,0.1),0_5px_15px_rgba(0,0,0,0.07)] hover:-translate-y-1 transition-all duration-200 flex items-center justify-between"
              >
                <div>
                  <span className="text-[11px] font-bold text-[#8898aa] uppercase tracking-wider block">
                    {st.label}
                  </span>
                  <div className="text-2xl font-black text-[#32325d] mt-1 tracking-tight">
                    {st.value}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 text-xs font-bold text-[#2dce89]">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{st.change}</span>
                    <span className="text-[#8898aa] font-normal text-[11px]">since last term</span>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-xl ${st.iconBg} text-white flex items-center justify-center shadow-md shrink-0`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= CORE CAPABILITIES GRID (ARGON CARDS) ================= */}
      <section className="py-24 bg-[#f8f9fe]">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-extrabold text-[#5e72e4] uppercase tracking-widest block">
              Core Platform Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#32325d] tracking-tight">
              Designed for Higher Education Operations
            </h2>
            <p className="text-sm sm:text-base text-[#525f7f]">
              Manage multi-department scheduling complexities through enterprise Argon architecture.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-6 border border-[#e9ecef] shadow-[0_15px_35px_rgba(50,50,93,0.06),0_5px_15px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_45px_rgba(50,50,93,0.12),0_8px_20px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${f.iconBg}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${f.badgeBg}`}>
                        {f.badge}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-[#32325d] leading-snug">{f.title}</h3>
                    <p className="text-xs sm:text-sm text-[#525f7f] leading-relaxed">{f.description}</p>
                  </div>

                  <div className="pt-4 border-t border-[#f1f3f9] flex items-center text-xs font-bold text-[#5e72e4] gap-1.5">
                    <span>Feature Active</span>
                    <Check className="w-4 h-4 text-[#2dce89]" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS: END-TO-END WORKFLOW ================= */}
      <section className="py-20 bg-white border-y border-[#e9ecef]">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-extrabold text-[#5e72e4] uppercase tracking-widest block">
              Algorithmic Pipeline
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#32325d] tracking-tight">
              From Raw Constraints to Optimal Schedule
            </h2>
            <p className="text-sm text-[#525f7f]">
              Follow how the Argon Timetable Resolver turns scheduling conflicts into a synchronized timetable.
            </p>
          </div>

          {/* Workflow Steps Horizontal Pipeline */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {workflowSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="bg-[#f8f9fe] p-5 rounded-2xl border border-[#e9ecef] shadow-xs relative flex flex-col justify-between space-y-3 hover:border-[#5e72e4]/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#5e72e4] bg-white px-2.5 py-1 rounded-lg border border-[#e9ecef] shadow-xs">
                      {step.num}
                    </span>
                    <Icon className="w-5 h-5 text-[#8898aa]" />
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-[#32325d] leading-snug">{step.title}</h4>
                    <p className="text-[11px] text-[#525f7f] mt-1 leading-normal">{step.subtitle}</p>
                  </div>

                  <p className="text-[10px] text-[#525f7f] bg-white p-2.5 rounded-xl border border-[#e9ecef] leading-relaxed">
                    {step.details}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= INTERACTIVE SCHEDULING VISUALIZATION SECTION ================= */}
      <section className="py-20 bg-[#f8f9fe] border-b border-[#e9ecef] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left: Explanation */}
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-extrabold text-[#5e72e4] uppercase tracking-widest block">
                Visual Constraint Resolution
              </span>
              <h2 className="text-3xl font-extrabold text-[#32325d] tracking-tight leading-tight">
                See Conflicts Resolve in Real-Time
              </h2>
              <p className="text-sm text-[#525f7f] leading-relaxed">
                When room double-bookings or instructor schedule overlaps occur, the system evaluates valid alternatives across all available days and periods.
              </p>

              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-xl bg-white border border-[#f5365c]/30 shadow-xs flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-r from-[#f5365c] to-[#f56036] text-white font-bold flex items-center justify-center shrink-0 shadow-sm">
                    !
                  </div>
                  <div>
                    <strong className="text-[#32325d] block">Conflict Detected:</strong>
                    <span className="text-[#525f7f]">Room LH-101 assigned simultaneously to Data Structures and Operating Systems on Monday at 10:00 AM.</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#2dce89]/30 shadow-xs flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-r from-[#2dce89] to-[#2dcecc] text-white font-bold flex items-center justify-center shrink-0 shadow-sm">
                    ✓
                  </div>
                  <div>
                    <strong className="text-[#32325d] block">Automated AI Resolution:</strong>
                    <span className="text-[#2dce89] font-semibold">Operating Systems shifted to Room LH-204 (Score: 98/100, 0 hard constraint collisions).</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={onGetStarted}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#5e72e4] to-[#825ee4] text-white text-xs font-bold shadow-md shadow-[#5e72e4]/30 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Open Conflict Resolver</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right: Visual Board */}
            <div className="lg:col-span-7 flex justify-center">
              <div className="w-full max-w-lg bg-white p-6 rounded-2xl border border-[#e9ecef] shadow-[0_20px_50px_rgba(50,50,93,0.08)] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#f1f3f9]">
                  <span className="text-xs font-bold text-[#32325d] uppercase tracking-wider">
                    Conflict Resolution Demo
                  </span>
                  <span className="text-[11px] font-bold text-[#2dce89] bg-[#2dce89]/10 px-3 py-1 rounded-full">
                    Resolved: 0 Errors
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3.5 text-xs">
                  {/* Before Box */}
                  <div className="p-4 rounded-xl bg-[#fff5f5] border border-[#f5365c]/30 space-y-2">
                    <span className="text-[10px] font-bold text-[#f5365c] uppercase tracking-wider block">
                      Prior State (Conflicted)
                    </span>
                    <div className="p-2.5 rounded-lg bg-white border border-[#f5365c]/20 shadow-xs">
                      <div className="font-bold text-[#32325d]">Data Structures</div>
                      <div className="text-[11px] text-[#f5365c] font-medium">Mon · 10:00 AM · LH-101</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-[#f5365c]/20 shadow-xs">
                      <div className="font-bold text-[#32325d]">Operating Systems</div>
                      <div className="text-[11px] text-[#f5365c] font-medium">Mon · 10:00 AM · LH-101 (Collision!)</div>
                    </div>
                  </div>

                  {/* After Box */}
                  <div className="p-4 rounded-xl bg-[#f0fff4] border border-[#2dce89]/30 space-y-2">
                    <span className="text-[10px] font-bold text-[#2dce89] uppercase tracking-wider block">
                      Resolved State (Optimized)
                    </span>
                    <div className="p-2.5 rounded-lg bg-white border border-[#2dce89]/20 shadow-xs">
                      <div className="font-bold text-[#32325d]">Data Structures</div>
                      <div className="text-[11px] text-[#525f7f] font-medium">Mon · 10:00 AM · LH-101</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-[#2dce89]/20 shadow-xs">
                      <div className="font-bold text-[#32325d]">Operating Systems</div>
                      <div className="text-[11px] text-[#2dce89] font-bold">Mon · 10:00 AM · LH-204 (Assigned)</div>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-[#8898aa] pt-2 border-t border-[#f1f3f9] text-center">
                  Live CSP algorithm runs locally in &lt;15ms per slot calculation.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA SECTION (ARGON DARK NAVY) ================= */}
      <section className="py-20 bg-[#172b4d] text-white relative overflow-hidden">
        <div className="absolute -left-20 -top-20 w-80 h-80 bg-[#5e72e4]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#11cdef]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-[#11cdef] text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ready for Immediate Deployment</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Ready to Streamline Your Academic Scheduling?
          </h2>

          <p className="text-sm sm:text-base text-[#8898aa] max-w-xl mx-auto leading-relaxed">
            Eliminate hours of manual timetable compilation and constraint conflict resolution with an integrated Argon operations platform.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={onGetStarted}
              className="bg-gradient-to-r from-[#5e72e4] to-[#825ee4] hover:from-[#5166db] hover:to-[#7450db] text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-[#5e72e4]/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onViewTimetable}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold text-sm px-5 py-3.5 rounded-xl border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-[#11cdef]" />
              <span>Explore Master Grid</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 bg-[#0f1e36] border-t border-[#1e3458] text-center text-xs text-[#8898aa]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Argon Dynamic Timetable Resolver · Creative Tim Theme</span>
          <span>Higher Education Operations Platform · Constraint Satisfaction Engine</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
