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
  ChevronDown,
  Layers,
  ShieldCheck,
  Check,
  Building,
  User,
  Clock,
  Info,
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
        },
      });

      if (res.data.success) {
        setAlternatives(res.data.data);
        if (res.data.data.length === 0) {
          warning('No feasible slot found matching all hard constraints. Try enabling Day and Room changes.');
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

  // What-If Impact Evaluation before applying
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
      <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
              Core Engine
            </span>
            <span className="text-xs text-slate-400">Multi-Constraint Constraint Satisfaction Problem (CSP)</span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">
            Dynamic Timetable Conflict Resolver
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Real-time conflict detection, multi-factor scoring optimizer, and What-If impact simulation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleScanNow}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 flex items-center gap-2 transition-all"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Re-Scan Entire Timetable</span>
          </button>
        </div>
      </div>

      {/* Preferences Bar */}
      <div className="glass-card px-5 py-3.5 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-medium">
          <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
          <span>Resolver Optimization Parameters:</span>
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={allowDayChange}
              onChange={(e) => setAllowDayChange(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0"
            />
            <span>Allow Day Permutations (Mon-Sat)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={allowRoomChange}
              onChange={(e) => setAllowRoomChange(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0"
            />
            <span>Allow Room Reallocation</span>
          </label>
        </div>
      </div>

      {/* Main Grid: Active Conflicts List vs Suggested Alternatives */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Active Conflicts (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Active Conflicts ({conflicts.length})</span>
            </h3>
            <span className="text-[11px] text-slate-400">Click a conflict to solve</span>
          </div>

          {loading ? (
            <div className="glass-card rounded-xl p-8 text-center text-slate-400 text-xs">
              Scanning database for timetable collisions...
            </div>
          ) : conflicts.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 border border-emerald-500/20 bg-emerald-950/10 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white">0 Conflicts Detected!</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                All faculty schedules, room capacities, section periods, and time constraints are completely satisfied.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
              {conflicts.map((conflict) => {
                const isSelected = selectedConflict?._id === conflict._id;
                return (
                  <div
                    key={conflict._id}
                    className={`glass-card p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-950/30 ring-1 ring-indigo-500'
                        : 'border-slate-800 hover:border-slate-700 bg-slate-900/60'
                    }`}
                    onClick={() => handleFindAlternatives(conflict)}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        {conflict.type.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {conflict.day ? `${conflict.day} ${conflict.timeSlot || ''}` : 'General'}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-200 leading-snug">
                      {conflict.message}
                    </p>

                    <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-800/80 text-[11px]">
                      <span className="text-slate-400">
                        {conflict.affectedEntries?.length || 1} Entry affected
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFindAlternatives(conflict);
                        }}
                        className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                      >
                        <span>Find Alternatives</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Suggested Alternatives & Ranking Details (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Feasible Alternative Schedules</span>
            </h3>
            {alternatives.length > 0 && (
              <span className="text-[11px] text-emerald-400 font-medium">
                {alternatives.length} Valid Solutions Ranked
              </span>
            )}
          </div>

          {!selectedConflict ? (
            <div className="glass-card rounded-2xl p-12 border border-slate-800 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-white">Select a Conflict to Generate Solutions</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                The resolver engine will permute across all rooms, time slots, and days, filtering out hard violations and ranking the best options.
              </p>
            </div>
          ) : findingAlternatives ? (
            <div className="glass-card rounded-2xl p-12 border border-slate-800 text-center space-y-3">
              <div className="w-8 h-8 mx-auto border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <h4 className="text-sm font-semibold text-white">Evaluating Feasible Slots...</h4>
              <p className="text-xs text-slate-400">
                Testing room capacity, faculty availability, and section timetable gaps.
              </p>
            </div>
          ) : alternatives.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 border border-slate-800 text-center space-y-3">
              <div className="w-10 h-10 mx-auto rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-semibold text-white">No Valid Alternative Found</h4>
              <p className="text-xs text-slate-400">
                Every tested permutation violates at least one hard constraint. Try toggling Day/Room changes in parameters.
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
              {alternatives.map((alt, idx) => (
                <div
                  key={idx}
                  className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/50 transition-all space-y-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          Option #{idx + 1}
                        </span>
                        <h4 className="text-base font-bold text-white">
                          {alt.day} {alt.startTime} – {alt.endTime}
                        </h4>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-indigo-400" />
                          Room {alt.room.roomNumber} ({alt.room.roomType}, Cap: {alt.room.capacity})
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-violet-400" />
                          {alt.faculty.name}
                        </span>
                      </div>
                    </div>

                    {/* Score Badge */}
                    <div className="text-right shrink-0">
                      <div className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold text-sm">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        <span>Score: {alt.score}/100</span>
                      </div>
                    </div>
                  </div>

                  {/* Constraint Passes & Advantages List */}
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <span className="block text-[11px] font-semibold text-slate-300">
                      Evaluated Constraints & Advantages:
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs text-emerald-300">
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>0 Hard Collisions</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Capacity Valid ({alt.room.capacity} seats)</span>
                      </div>
                      {alt.advantages.map((adv, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-slate-300">
                          <Check className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{adv}</span>
                        </div>
                      ))}
                    </div>

                    {alt.warnings.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-800/80 text-[11px] text-amber-300 flex items-center gap-1">
                        <Info className="w-3.5 h-3.5 text-amber-400" />
                        <span>{alt.warnings.join(', ')}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {isAdmin && (
                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        onClick={() => handleOpenImpactAnalysis(alt)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>What-If Simulation & Apply</span>
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
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl max-w-xl w-full p-6 border border-slate-800 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                  What-If Simulation Mode
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  Confirm Timetable Resolution
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                0 New Conflicts
              </span>
            </div>

            {/* Before vs After Visual Comparison */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-rose-400 uppercase">Original (Conflicted)</span>
                <div className="text-xs text-white font-semibold">{simulatedImpact.before.subject}</div>
                <div className="text-xs text-slate-400">{simulatedImpact.before.day} {simulatedImpact.before.time}</div>
                <div className="text-xs text-slate-400">Room: {simulatedImpact.before.room}</div>
                <div className="text-xs text-slate-400">Faculty: {simulatedImpact.before.faculty}</div>
              </div>

              <div className="space-y-1 border-l border-slate-800 pl-4">
                <span className="text-[10px] font-bold text-emerald-400 uppercase">Proposed Alternative</span>
                <div className="text-xs text-white font-semibold">{simulatedImpact.after.subject}</div>
                <div className="text-xs text-emerald-300 font-medium">{simulatedImpact.after.day} {simulatedImpact.after.time}</div>
                <div className="text-xs text-slate-300">Room: {simulatedImpact.after.room}</div>
                <div className="text-xs text-slate-300">Faculty: {simulatedImpact.after.faculty}</div>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {simulatedImpact.summary} Applying this change will persist the updated schedule in MongoDB and automatically revalidate all remaining entries.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowSimulationModal(false)}
                disabled={applyingAlt}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
              >
                Discard / Cancel
              </button>
              <button
                onClick={handleApplyChosenAlternative}
                disabled={applyingAlt}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
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
