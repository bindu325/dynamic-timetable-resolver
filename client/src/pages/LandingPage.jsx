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
      color: 'bg-[#faeceb] text-[#a8483f] border-[#f0c7c3]',
      title: 'Zero-Collision Conflict Detection',
      description: 'Constantly inspects the master schedule to pinpoint simultaneous room bookings, faculty overlaps, and capacity overflows.',
    },
    {
      icon: Sparkles,
      color: 'bg-[#faf4ea] text-[#8c5e47] border-[#ebd6b3]',
      title: 'Multi-Factor Constraint Resolver',
      description: 'Permutes available slots, room types, and days to deliver ranked solutions with transparent constraint validation scores.',
    },
    {
      icon: ShieldCheck,
      color: 'bg-[#edf5ee] text-[#4d7358] border-[#c7decb]',
      title: 'What-If Impact Simulation',
      description: 'Simulate the ripple effects of any timetable adjustment before persisting changes to the central database.',
    },
    {
      icon: BarChart3,
      color: 'bg-[#eef4f8] text-[#49657b] border-[#c5dae8]',
      title: 'Resource Telemetry & Analytics',
      description: 'Monitor lecture hall utilization rates, track faculty teaching hour distribution, and balance weekly student loads.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#2d2a26] flex flex-col selection:bg-[#faf4ea] selection:text-[#8c5e47]">
      {/* Top Floating Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#faf9f5]/90 backdrop-blur-md border-b border-[#e5ded2] transition-all">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#8c5e47] flex items-center justify-center text-white shadow-sm font-bold">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-sm text-[#2d2a26] tracking-tight block leading-tight">
                Dynamic Timetable Resolver
              </span>
              <span className="text-[10px] text-[#8c5e47] font-semibold uppercase tracking-wider block">
                Zen Linen Academic Suite
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onViewTimetable}
              className="text-xs font-semibold text-[#57524a] hover:text-[#2d2a26] px-3 py-2 rounded-lg hover:bg-[#eae3d5] transition-colors cursor-pointer"
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
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-[#e5ded2]">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gradient-to-b from-[#8c5e47]/10 via-[#526b58]/5 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Column: Hero Text */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#faf4ea] border border-[#ebd6b3] text-[#8c5e47] text-xs font-semibold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#8c5e47] animate-pulse" />
              <span>Next-Gen Constraint Satisfaction Engine</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#2d2a26] tracking-tight leading-[1.15]">
              Intelligent Academic Scheduling &{' '}
              <span className="text-[#8c5e47] underline decoration-[#d8cebf] decoration-wavy decoration-2">
                Conflict Resolution
              </span>
            </h1>

            <p className="text-base text-[#57524a] leading-relaxed max-w-xl">
              Eliminate lecture collisions, optimize campus room occupancy, and resolve complex scheduling constraints automatically with real-time What-If simulations.
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                onClick={onGetStarted}
                className="btn-primary text-sm px-6 py-3 flex items-center gap-2 shadow-sm hover:shadow-md transition-all"
              >
                <span>Launch Scheduling Suite</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onViewTimetable}
                className="btn-secondary text-sm px-5 py-3 flex items-center gap-2"
              >
                <Calendar className="w-4 h-4 text-[#8a8275]" />
                <span>Explore Live Matrix</span>
              </button>
            </div>

            {/* Quick trust metrics checklist */}
            <div className="pt-6 border-t border-[#e5ded2] grid grid-cols-3 gap-4 text-xs">
              <div className="space-y-0.5">
                <div className="font-bold text-[#2d2a26] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#526b58] shrink-0" />
                  <span>100% Collision Free</span>
                </div>
                <p className="text-[11px] text-[#8a8275]">Automated CSP verification</p>
              </div>

              <div className="space-y-0.5">
                <div className="font-bold text-[#2d2a26] flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-[#8c5e47] shrink-0" />
                  <span>Instant Alternatives</span>
                </div>
                <p className="text-[11px] text-[#8a8275]">Multi-factor score ranking</p>
              </div>

              <div className="space-y-0.5">
                <div className="font-bold text-[#2d2a26] flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-[#49657b] shrink-0" />
                  <span>Room Optimization</span>
                </div>
                <p className="text-[11px] text-[#8a8275]">Capacity & lab balancing</p>
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
      <section className="py-20 bg-white border-b border-[#e5ded2]">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-[#8c5e47] uppercase tracking-wider block">
              Core Platform Capabilities
            </span>
            <h2 className="text-3xl font-bold text-[#2d2a26] tracking-tight">
              Designed for Higher Education Operations
            </h2>
            <p className="text-sm text-[#8a8275]">
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
                    <h3 className="text-base font-bold text-[#2d2a26] leading-snug">{f.title}</h3>
                    <p className="text-xs text-[#57524a] leading-relaxed">{f.description}</p>
                  </div>

                  <div className="pt-3 border-t border-[#ede8df] flex items-center text-xs font-bold text-[#8c5e47] gap-1">
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
      <section className="py-20 bg-[#f7f5f0] border-b border-[#e5ded2]">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-[#8c5e47] uppercase tracking-wider block">
              Algorithmic Lifecycle
            </span>
            <h2 className="text-3xl font-bold text-[#2d2a26] tracking-tight">
              From Raw Constraints to Optimal Schedule
            </h2>
            <p className="text-sm text-[#8a8275]">
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
                    <span className="text-xs font-mono font-bold text-[#8c5e47] bg-[#faf4ea] px-2 py-0.5 rounded border border-[#ebd6b3]">
                      {step.num}
                    </span>
                    <Icon className="w-4 h-4 text-[#8a8275]" />
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-[#2d2a26] leading-snug">{step.title}</h4>
                    <p className="text-[11px] text-[#8a8275] mt-1 leading-normal">{step.subtitle}</p>
                  </div>

                  <p className="text-[10px] text-[#57524a] bg-[#faf9f5] p-2 rounded-lg border border-[#e5ded2] leading-relaxed">
                    {step.details}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= 3D INTERACTIVE SCHEDULING VISUALIZATION SECTION ================= */}
      <section className="py-20 bg-white border-b border-[#e5ded2] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left: Explanation */}
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-bold text-[#8c5e47] uppercase tracking-wider block">
                Visual Constraint Resolution
              </span>
              <h2 className="text-3xl font-bold text-[#2d2a26] tracking-tight leading-tight">
                See Conflicts Resolve in Real-Time
              </h2>
              <p className="text-sm text-[#57524a] leading-relaxed">
                When room double-bookings or instructor schedule overlaps occur, the system evaluates valid alternatives across all available days and periods.
              </p>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-[#faf9f5] border border-[#e5ded2] flex items-start gap-3">
                  <div className="w-6 h-6 rounded bg-[#faeceb] text-[#a8483f] font-bold flex items-center justify-center shrink-0 text-xs">
                    !
                  </div>
                  <div>
                    <strong className="text-[#2d2a26] block">Conflict Detected:</strong>
                    <span className="text-[#57524a]">Room LH-101 assigned simultaneously to Data Structures and Operating Systems on Monday at 10:00 AM.</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#edf5ee] border border-[#c7decb] flex items-start gap-3">
                  <div className="w-6 h-6 rounded bg-[#526b58] text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    ✓
                  </div>
                  <div>
                    <strong className="text-[#2d2a26] block">Automated AI Resolution:</strong>
                    <span className="text-[#4d7358]">Operating Systems shifted to Room LH-204 (Score: 98/100, 0 hard constraint collisions).</span>
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
              <div className="w-full max-w-lg bg-[#faf9f5] p-6 rounded-2xl border border-[#e5ded2] shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#e5ded2]">
                  <span className="text-xs font-bold text-[#2d2a26] uppercase tracking-wider">
                    Conflict Resolution Demo
                  </span>
                  <span className="text-[11px] font-bold text-[#4d7358] bg-[#edf5ee] px-2.5 py-0.5 rounded-full border border-[#c7decb]">
                    Resolved: 0 Errors
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3.5 text-xs">
                  {/* Before Box */}
                  <div className="p-4 rounded-xl bg-white border border-[#f0c7c3] space-y-2">
                    <span className="text-[10px] font-bold text-[#a8483f] uppercase tracking-wider block">
                      Prior State (Conflicted)
                    </span>
                    <div className="p-2 rounded bg-[#faeceb] border border-[#f0c7c3]/60">
                      <div className="font-bold text-[#2d2a26]">Data Structures</div>
                      <div className="text-[11px] text-[#a8483f] font-medium">Mon · 10:00 AM · LH-101</div>
                    </div>
                    <div className="p-2 rounded bg-[#faeceb] border border-[#f0c7c3]/60">
                      <div className="font-bold text-[#2d2a26]">Operating Systems</div>
                      <div className="text-[11px] text-[#a8483f] font-medium">Mon · 10:00 AM · LH-101 (Collision!)</div>
                    </div>
                  </div>

                  {/* After Box */}
                  <div className="p-4 rounded-xl bg-white border border-[#c7decb] space-y-2">
                    <span className="text-[10px] font-bold text-[#4d7358] uppercase tracking-wider block">
                      Resolved State (Optimized)
                    </span>
                    <div className="p-2 rounded bg-[#faf9f5] border border-[#ede8df]">
                      <div className="font-bold text-[#2d2a26]">Data Structures</div>
                      <div className="text-[11px] text-[#57524a] font-medium">Mon · 10:00 AM · LH-101</div>
                    </div>
                    <div className="p-2 rounded bg-[#edf5ee] border border-[#c7decb]">
                      <div className="font-bold text-[#2d2a26]">Operating Systems</div>
                      <div className="text-[11px] text-[#4d7358] font-bold">Mon · 10:00 AM · LH-204 (Assigned)</div>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-[#8a8275] pt-2 border-t border-[#ede8df] text-center">
                  Live CSP algorithm runs locally in &lt;15ms per slot calculation.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA SECTION ================= */}
      <section className="py-20 bg-[#2d2a26] text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8c5e47]/20 border border-[#8c5e47]/40 text-[#fdedd9] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ready for Immediate Deployment</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#faf9f5]">
            Ready to Streamline Your Academic Scheduling?
          </h2>

          <p className="text-sm text-[#d8cebf] max-w-xl mx-auto leading-relaxed">
            Eliminate hours of manual timetable compilation and constraint conflict resolution with an integrated operations platform.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
            <button
              onClick={onGetStarted}
              className="bg-[#8c5e47] hover:bg-[#784f3a] text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-98"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onViewTimetable}
              className="bg-transparent hover:bg-[#413b34] text-[#faf9f5] font-semibold text-sm px-5 py-3 rounded-xl border border-[#57524a] transition-all flex items-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-[#d8cebf]" />
              <span>Explore Master Grid</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 bg-[#23201d] border-t border-[#3d3731] text-center text-xs text-[#8a8275]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Dynamic Timetable Resolver · Zen Linen Theme</span>
          <span>Operations Platform · Connected Constraint Satisfaction Engine</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
