import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  SlidersHorizontal,
  ShieldCheck,
  Check,
  Building,
  User,
  Clock,
  Info,
  X,
  Zap,
} from 'lucide-react';

const ConflictResolverPage = ({ onJumpToTimetable }) => {
  const { isAdmin } = useAuth();
  const { success, error, warning } = useToast();

  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConflict, setSelectedConflict] = useState(null);
  const [alternatives, setAlternatives] = useState([]);
  const [findingAlternatives, setFindingAlternatives] = useState(false);
  const [applyingAlt, setApplyingAlt] = useState(false);

  // Resolver Config Preferences
  const [allowDayChange, setAllowDayChange] = useState(true);
  const [allowRoomChange, setAllowRoomChange] = useState(true);
  const [allowFacultyChange, setAllowFacultyChange] = useState(true);

  // Impact Simulation Modal State
  const [simulatedImpact, setSimulatedImpact] = useState(null);
  const [showSimulationModal, setShowSimulationModal] = useState(false);
  const [activeAlternativeForApply, setActiveAlternativeForApply] = useState(null);

  const fetchConflicts = async () => {
    setLoading(true);
    try {
      const res = await API.get('/conflicts');
      if (res.data.success) {
        setConflicts(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching conflicts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConflicts();
  }, []);

  const handleScanNow = async () => {
    setLoading(true);
    try {
      const res = await API.post('/conflicts/check');
      if (res.data.success) {
        setConflicts(res.data.data);
        if (res.data.count === 0) {
          success('Comprehensive scan completed: 0 conflicts detected!');
        } else {
          warning(`Scan completed: ${res.data.count} conflict(s) detected.`);
        }
      }
    } catch (err) {
      error('Conflict scan failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFindAlternatives = async (conflict) => {
    setSelectedConflict(conflict);
    setAlternatives([]);
    setFindingAlternatives(true);

    const targetEntryId = conflict.affectedEntries?.[0]?._id || conflict.affectedEntries?.[0];
    if (!targetEntryId) {
      error('No entry linked to this conflict');
      setFindingAlternatives(false);
      return;
    }

    try {
      const res = await API.post('/resolver/suggest', {
        entryId: targetEntryId,
        preferences: {
          allowDayChange,
          allowRoomChange,
          allowFacultyChange,
        },
      });

      if (res.data.success) {
        setAlternatives(res.data.data);
        if (res.data.data.length === 0) {
          warning('No feasible slot found matching all hard constraints. Try enabling Day, Room, or Faculty changes.');
        } else {
          success(`Generated ${res.data.data.length} feasible, ranked alternatives!`);
        }
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to generate alternatives');
    } finally {
      setFindingAlternatives(false);
    }
  };

  const handleOpenImpactAnalysis = async (alt) => {
    setActiveAlternativeForApply(alt);
    const targetEntryId = selectedConflict.affectedEntries?.[0]?._id || selectedConflict.affectedEntries?.[0];

    try {
      const res = await API.post('/resolver/impact', {
        originalEntryId: targetEntryId,
        proposedChanges: {
          day: alt.day,
          startTime: alt.startTime,
          endTime: alt.endTime,
          room: alt.room._id,
          faculty: alt.faculty?._id,
        },
      });

      if (res.data.success) {
        setSimulatedImpact(res.data.data);
        setShowSimulationModal(true);
      }
    } catch (err) {
      error('Simulation failed');
    }
  };

  const handleApplyChosenAlternative = async () => {
    if (!activeAlternativeForApply || !selectedConflict) return;
    setApplyingAlt(true);

    const targetEntryId = selectedConflict.affectedEntries?.[0]?._id || selectedConflict.affectedEntries?.[0];

    try {
      const res = await API.post('/resolver/apply', {
        entryId: targetEntryId,
        alternative: activeAlternativeForApply,
        reason: `Automated resolution for ${selectedConflict.type} (Score: ${activeAlternativeForApply.score}/100)`,
      });

      if (res.data.success) {
        success('Resolution successfully applied! Timetable verified conflict-free.');
        setShowSimulationModal(false);
        setSelectedConflict(null);
        setAlternatives([]);
        fetchConflicts();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to apply resolution');
    } finally {
      setApplyingAlt(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="app-card p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                <AlertTriangle className="w-3.5 h-3.5" />
                Conflict Resolution Center
              </span>
              <span className="text-xs text-slate-500 font-medium">Multi-Constraint Satisfaction Engine</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Intelligent Conflict Resolver & What-If Simulator
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Identify scheduling bottlenecks, generate AI-ranked slot alternatives, and simulate schedule impact before applying.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleScanNow}
              disabled={loading}
              className="btn-secondary text-xs flex items-center gap-2"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Full System Re-Scan</span>
            </button>
          </div>
        </div>

        {/* Preferences Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 text-xs">
          <div className="flex items-center gap-2 text-slate-700 font-semibold">
            <SlidersHorizontal className="w-4 h-4 text-teal-600" />
            <span>Optimization Search Parameters:</span>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900 font-medium">
              <input
                type="checkbox"
                checked={allowDayChange}
                onChange={(e) => setAllowDayChange(e.target.checked)}
                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <span>Allow Day Permutations (Mon–Sat)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900 font-medium">
              <input
                type="checkbox"
                checked={allowRoomChange}
                onChange={(e) => setAllowRoomChange(e.target.checked)}
                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <span>Allow Room Reallocation</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900 font-medium">
              <input
                type="checkbox"
                checked={allowFacultyChange}
                onChange={(e) => setAllowFacultyChange(e.target.checked)}
                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <span>Allow Faculty Substitution (Free Faculty)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Main Grid: Active Conflicts List vs Suggested Alternatives */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Active Conflicts (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span>Active Conflicts ({conflicts.length})</span>
            </h3>
            <span className="text-[11px] text-slate-400">Select to resolve</span>
          </div>

          {loading ? (
            <div className="app-card p-8 text-center text-slate-400 text-xs">
              <RotateCcw className="w-5 h-5 mx-auto animate-spin text-teal-600 mb-2" />
              Scanning institutional schedule for collisions...
            </div>
          ) : conflicts.length === 0 ? (
            <div className="app-card p-8 border-emerald-200 bg-emerald-50/40 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">0 Scheduling Conflicts!</h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                All faculty schedules, room capacities, section periods, and time constraints are completely satisfied.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
              {conflicts.map((conflict) => {
                const isSelected = selectedConflict?._id === conflict._id;
                return (
                  <div
                    key={conflict._id}
                    className={`app-card p-4 transition-all cursor-pointer border ${
                      isSelected
                        ? 'border-teal-500 ring-2 ring-teal-500/20 bg-teal-50/20 shadow-md'
                        : 'border-slate-200/90 hover:border-slate-300 hover:shadow-sm'
                    }`}
                    onClick={() => handleFindAlternatives(conflict)}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                        {conflict.type.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {conflict.day ? `${conflict.day} ${conflict.timeSlot || ''}` : 'General'}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-800 leading-snug">
                      {conflict.message}
                    </p>

                    <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-slate-100 text-[11px]">
                      <span className="text-slate-500 font-medium">
                        {conflict.affectedEntries?.length || 1} Entry affected
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFindAlternatives(conflict);
                        }}
                        className="text-teal-700 hover:text-teal-800 font-bold flex items-center gap-1 group"
                      >
                        <span>Generate Options</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Suggested Alternatives & Ranking Details (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>Ranked Alternative Solutions</span>
            </h3>
            {alternatives.length > 0 && (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {alternatives.length} Valid Solutions
              </span>
            )}
          </div>

          {!selectedConflict ? (
            <div className="app-card p-12 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-teal-50 border border-teal-200/60 flex items-center justify-center text-teal-700">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Select a Conflict to Resolve</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                The resolver engine will permute across all rooms, time slots, and days, filtering out hard violations and ranking the best options.
              </p>
            </div>
          ) : findingAlternatives ? (
            <div className="app-card p-12 text-center space-y-3">
              <div className="w-8 h-8 mx-auto border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
              <h4 className="text-sm font-bold text-slate-900">Evaluating Feasible Slots...</h4>
              <p className="text-xs text-slate-500">
                Verifying room capacity, faculty availability, and timetable integrity.
              </p>
            </div>
          ) : alternatives.length === 0 ? (
            <div className="app-card p-8 border-amber-200 bg-amber-50/40 text-center space-y-3">
              <div className="w-10 h-10 mx-auto rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">No Valid Alternative Found</h4>
              <p className="text-xs text-slate-600">
                Every tested permutation violates at least one hard constraint. Try toggling Day/Room changes in search parameters.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
              {alternatives.map((alt, idx) => (
                <div
                  key={idx}
                  className="app-card p-5 hover:border-teal-400 hover:shadow-md transition-all space-y-3.5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                          Option #{idx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">
                          {alt.day} · {alt.startTime} – {alt.endTime}
                        </h4>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-1">
                        <span className="flex items-center gap-1 font-medium">
                          <Building className="w-3.5 h-3.5 text-teal-600" />
                          Room {alt.room.roomNumber} ({alt.room.roomType}, Cap: {alt.room.capacity})
                        </span>
                        <span className="flex items-center gap-1 font-medium">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          {alt.faculty.name}
                        </span>
                      </div>
                    </div>

                    {/* Score Badge */}
                    <div className="text-right shrink-0">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Score: {alt.score}/100</span>
                      </div>
                    </div>
                  </div>

                  {/* Constraint Passes & Advantages List */}
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-2">
                    <span className="block text-[11px] font-bold text-slate-700">
                      Evaluated Constraints & Advantages:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-700">
                      <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>0 Hard Collisions</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Capacity Valid ({alt.room.capacity} seats)</span>
                      </div>
                      {alt.advantages.map((adv, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-slate-600">
                          <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span>{adv}</span>
                        </div>
                      ))}
                    </div>

                    {alt.warnings.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-200/60 text-[11px] text-amber-800 flex items-center gap-1">
                        <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>{alt.warnings.join(', ')}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {isAdmin && (
                    <div className="flex items-center justify-end gap-3 pt-1">
                      <button
                        onClick={() => handleOpenImpactAnalysis(alt)}
                        className="btn-primary text-xs py-1.5 flex items-center gap-1.5"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Simulate & Apply</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* What-If Simulation & Confirmation Modal */}
      {showSimulationModal && simulatedImpact && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 border border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-teal-50 text-teal-700 border border-teal-200">
                    What-If Simulation
                  </span>
                  <span className="text-xs font-bold text-emerald-700">0 Collisions</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Confirm Schedule Resolution
                </h3>
              </div>
              <button
                onClick={() => setShowSimulationModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Before vs After Visual Comparison */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Before (Conflicted)</span>
                <div className="text-xs text-slate-900 font-bold">{simulatedImpact.before.subject}</div>
                <div className="text-xs text-slate-600">{simulatedImpact.before.day} · {simulatedImpact.before.time}</div>
                <div className="text-xs text-slate-600">Room: {simulatedImpact.before.room}</div>
                <div className="text-xs text-slate-600">Faculty: {simulatedImpact.before.faculty}</div>
              </div>

              <div className="space-y-1 border-l border-slate-200 pl-4">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Proposed Alternative</span>
                <div className="text-xs text-slate-900 font-bold">{simulatedImpact.after.subject}</div>
                <div className="text-xs text-teal-700 font-semibold">{simulatedImpact.after.day} · {simulatedImpact.after.time}</div>
                <div className="text-xs text-slate-700 font-medium">Room: {simulatedImpact.after.room}</div>
                <div className="text-xs text-slate-700 font-medium">Faculty: {simulatedImpact.after.faculty}</div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {simulatedImpact.summary} Applying this change will persist the updated schedule in MongoDB and automatically revalidate remaining entries.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowSimulationModal(false)}
                disabled={applyingAlt}
                className="btn-secondary text-xs"
              >
                Discard / Cancel
              </button>
              <button
                onClick={handleApplyChosenAlternative}
                disabled={applyingAlt}
                className="btn-primary text-xs flex items-center gap-2 disabled:opacity-50"
              >
                {applyingAlt ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Apply Resolution to DB</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConflictResolverPage;
