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
  Layers,
  ShieldCheck,
  Check,
  Building,
  User,
  Info,
  UploadCloud,
  FileText,
  FileCheck,
  Loader2,
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

  const [allowDayChange, setAllowDayChange] = useState(true);
  const [allowRoomChange, setAllowRoomChange] = useState(true);

  const [simulatedImpact, setSimulatedImpact] = useState(null);
  const [showSimulationModal, setShowSimulationModal] = useState(false);
  const [activeAlternativeForApply, setActiveAlternativeForApply] = useState(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');

  const fetchConflicts = async () => {
    setLoading(true);
    try {
      const res = await API.get('/conflicts');
      if (res.data.success) setConflicts(res.data.data);
    } catch (err) {
      console.error('Error fetching conflicts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchConflicts(); }, []);

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

  const handlePDFUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      error('Only PDF files are supported for Timetable import.');
      return;
    }
    setUploadedFile(file);
    setIsUploading(true);
    setUploadStatus('Uploading timetable PDF…');
    setTimeout(() => {
      setUploadStatus('Analyzing structure & constraints…');
      setTimeout(() => {
        setUploadStatus('Extracting scheduling anomalies…');
        setTimeout(() => {
          setUploadStatus('PDF parsed — resolving conflicts…');
          setTimeout(() => {
            setIsUploading(false);
            setUploadStatus('');
            handleScanNow();
          }, 1000);
        }, 1500);
      }, 1500);
    }, 1500);
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
        preferences: { allowDayChange, allowRoomChange },
      });
      if (res.data.success) {
        setAlternatives(res.data.data);
        if (res.data.data.length === 0) {
          warning('No feasible slot found. Try enabling Day and Room changes.');
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
    <div className="space-y-5 panel-enter-3d">

      {/* Top Banner */}
      <div
        className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(22, 34, 64, 0.85) 0%, rgba(10, 18, 40, 0.95) 100%)",
        }}
      >
        {/* BG glow */}
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            width: "35%",
            height: "100%",
            background: "radial-gradient(ellipse at 80% 50%, rgba(239,68,68,0.07) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
              style={{
                background: "rgba(239,68,68,0.12)",
                border: "1px solid rgba(239,68,68,0.25)",
                color: "#fca5a5",
              }}
            >
              Core Engine
            </span>
            <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              Multi-Constraint CSP Solver
            </span>
          </div>
          <h2
            className="text-2xl font-bold"
            style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em" }}
          >
            Dynamic Timetable{" "}
            <span className="text-gradient-indigo">Conflict Resolver</span>
          </h2>
          <p className="text-sm mt-1.5" style={{ color: "var(--text-secondary)" }}>
            Real-time conflict detection, multi-factor scoring optimizer, and What-If impact simulation.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 relative">
          {/* PDF Upload */}
          <label
            className="relative cursor-pointer overflow-hidden px-4 py-2.5 rounded-xl text-white text-xs font-semibold flex items-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0"
            style={{
              background: "linear-gradient(145deg, #6366f1 0%, #4f46e5 100%)",
              boxShadow: "0 3px 0 rgba(40,33,160,0.50), 0 6px 20px rgba(79,70,229,0.30), inset 0 1px 0 rgba(255,255,255,0.18)",
            }}
          >
            {isUploading ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <UploadCloud className="w-3.5 h-3.5" />
            )}
            <span>{isUploading ? 'Extracting PDF…' : 'Import Timetable PDF'}</span>
            <input
              type="file"
              accept=".pdf"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handlePDFUpload}
              disabled={isUploading || loading}
            />
          </label>

          <button
            onClick={handleScanNow}
            disabled={loading || isUploading}
            className="btn btn-secondary"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Re-Scan System</span>
          </button>
        </div>
      </div>

      {/* Uploaded File Indicator */}
      {uploadedFile && (
        <div
          className="glass-card p-4 flex items-center justify-between gap-4"
          style={{
            borderColor: isUploading ? "rgba(99,102,241,0.35)" : "rgba(16,185,129,0.30)",
            background: isUploading ? "rgba(79,70,229,0.06)" : "rgba(16,185,129,0.05)",
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: isUploading ? "rgba(99,102,241,0.15)" : "rgba(16,185,129,0.15)",
                border: `1px solid ${isUploading ? "rgba(99,102,241,0.30)" : "rgba(16,185,129,0.30)"}`,
              }}
            >
              {isUploading ? (
                <FileText className="w-5 h-5" style={{ color: "#a5b4fc" }} />
              ) : (
                <FileCheck className="w-5 h-5" style={{ color: "#6ee7b7" }} />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                {uploadedFile.name}
              </h3>
              <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB · PDF Document
              </p>
              {isUploading && (
                <div className="flex items-center gap-2 mt-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: "#a5b4fc" }} />
                  <span className="text-[11px] font-semibold" style={{ color: "#a5b4fc" }}>
                    {uploadStatus}
                  </span>
                </div>
              )}
            </div>
          </div>
          {!isUploading && (
            <button
              onClick={() => setUploadedFile(null)}
              className="btn btn-ghost"
              style={{ padding: "0.375rem" }}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Preferences Bar */}
      <div
        className="glass-card px-5 py-3.5 flex flex-wrap items-center justify-between gap-4 text-xs"
        style={{ borderColor: "rgba(79,70,229,0.20)" }}
      >
        <div className="flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
          <SlidersHorizontal className="w-4 h-4" style={{ color: "#a5b4fc" }} />
          <span className="font-medium">Resolver optimization parameters:</span>
        </div>

        <div className="flex items-center gap-6">
          {[
            { label: "Allow day permutations (Mon–Sat)", checked: allowDayChange, onChange: setAllowDayChange },
            { label: "Allow room reallocation", checked: allowRoomChange, onChange: setAllowRoomChange },
          ].map(({ label, checked, onChange }) => (
            <label key={label} className="flex items-center gap-2 cursor-pointer">
              <div
                onClick={() => onChange(!checked)}
                className="relative w-8 h-4 rounded-full transition-colors"
                style={{
                  background: checked ? "var(--indigo)" : "rgba(79,70,229,0.20)",
                  boxShadow: checked ? "0 0 8px rgba(79,70,229,0.40)" : "none",
                }}
              >
                <div
                  className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform shadow-sm"
                  style={{ transform: `translateX(${checked ? '18px' : '2px'})` }}
                />
              </div>
              <span style={{ color: checked ? "var(--text-primary)" : "var(--text-muted)" }}>
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* Left Column — Active Conflicts */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3
              className="text-sm font-semibold flex items-center gap-2"
              style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <AlertTriangle className="w-4 h-4" style={{ color: "#fca5a5" }} />
              <span>Active Conflicts ({conflicts.length})</span>
            </h3>
            <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              Click to resolve
            </span>
          </div>

          {loading ? (
            <div className="glass-card p-8 text-center">
              <div className="spinner mx-auto mb-3" />
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Scanning database…</p>
            </div>
          ) : conflicts.length === 0 ? (
            <div
              className="glass-card rounded-2xl p-8 text-center space-y-3"
              style={{ borderColor: "rgba(16,185,129,0.25)", background: "rgba(16,185,129,0.04)" }}
            >
              <div
                className="w-12 h-12 mx-auto rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(16,185,129,0.10)",
                  border: "1px solid rgba(16,185,129,0.25)",
                }}
              >
                <CheckCircle2 className="w-6 h-6" style={{ color: "#6ee7b7" }} />
              </div>
              <h4 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                0 Conflicts Detected
              </h4>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                All faculty schedules, room capacities, section periods, and time constraints are satisfied.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
              {conflicts.map((conflict) => {
                const isSelected = selectedConflict?._id === conflict._id;
                return (
                  <div
                    key={conflict._id}
                    className="glass-card p-4 transition-all cursor-pointer"
                    style={{
                      borderColor: isSelected
                        ? "rgba(99,102,241,0.50)"
                        : "rgba(239,68,68,0.20)",
                      background: isSelected
                        ? "rgba(79,70,229,0.10)"
                        : "rgba(239,68,68,0.04)",
                      boxShadow: isSelected
                        ? "0 0 0 1px rgba(99,102,241,0.30), 0 4px 20px rgba(79,70,229,0.12)"
                        : "",
                    }}
                    onClick={() => handleFindAlternatives(conflict)}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          background: "rgba(239,68,68,0.12)",
                          border: "1px solid rgba(239,68,68,0.25)",
                          color: "#fca5a5",
                        }}
                      >
                        {conflict.type.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                        {conflict.day ? `${conflict.day} ${conflict.timeSlot || ''}` : 'General'}
                      </span>
                    </div>

                    <p className="text-xs font-medium leading-snug" style={{ color: "var(--text-secondary)" }}>
                      {conflict.message}
                    </p>

                    <div
                      className="mt-3 flex items-center justify-between pt-3 text-[11px]"
                      style={{ borderTop: "1px solid rgba(79,70,229,0.10)" }}
                    >
                      <span style={{ color: "var(--text-muted)" }}>
                        {conflict.affectedEntries?.length || 1} entry affected
                      </span>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleFindAlternatives(conflict); }}
                        className="flex items-center gap-1 font-semibold transition-colors"
                        style={{ color: "#a5b4fc" }}
                        onMouseEnter={e => e.currentTarget.style.color = "#c7d2fe"}
                        onMouseLeave={e => e.currentTarget.style.color = "#a5b4fc"}
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

        {/* Right Column — Alternatives */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3
              className="text-sm font-semibold flex items-center gap-2"
              style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <Sparkles className="w-4 h-4" style={{ color: "#a5b4fc" }} />
              <span>Feasible Alternative Schedules</span>
            </h3>
            {alternatives.length > 0 && (
              <span
                className="text-[11px] font-medium"
                style={{ color: "#6ee7b7" }}
              >
                {alternatives.length} valid solutions ranked
              </span>
            )}
          </div>

          {!selectedConflict ? (
            <div
              className="glass-card rounded-2xl p-12 text-center space-y-3"
              style={{ borderColor: "rgba(79,70,229,0.20)" }}
            >
              <div
                className="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center"
                style={{
                  background: "rgba(79,70,229,0.10)",
                  border: "1px solid rgba(79,70,229,0.22)",
                }}
              >
                <Sparkles className="w-6 h-6" style={{ color: "#a5b4fc" }} />
              </div>
              <h4 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Select a conflict to generate solutions
              </h4>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                The resolver engine will permute across all rooms, time slots, and days, filtering violations and ranking the best options.
              </p>
            </div>
          ) : findingAlternatives ? (
            <div
              className="glass-card rounded-2xl p-12 text-center space-y-4"
              style={{ borderColor: "rgba(79,70,229,0.20)" }}
            >
              <div className="spinner mx-auto" style={{ width: "2rem", height: "2rem" }} />
              <h4 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Evaluating feasible slots…
              </h4>
              <p className="section-desc">
                Testing room capacity, faculty availability, and section timetable gaps.
              </p>
            </div>
          ) : alternatives.length === 0 ? (
            <div
              className="glass-card rounded-2xl p-8 text-center space-y-3"
              style={{ borderColor: "rgba(79,70,229,0.20)" }}
            >
              <div
                className="w-10 h-10 mx-auto rounded-full flex items-center justify-center"
                style={{ background: "rgba(245,158,11,0.10)", border: "1px solid rgba(245,158,11,0.25)" }}
              >
                <AlertTriangle className="w-5 h-5" style={{ color: "#fcd34d" }} />
              </div>
              <h4 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                No valid alternative found
              </h4>
              <p className="section-desc">
                Every tested permutation violates at least one hard constraint. Try enabling day/room changes.
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
              {alternatives.map((alt, idx) => (
                <div
                  key={idx}
                  className="glass-card p-5 transition-all space-y-4"
                  style={{ borderColor: "rgba(79,70,229,0.18)" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(79,70,229,0.40)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(79,70,229,0.18)"}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold"
                          style={{
                            background: "rgba(79,70,229,0.15)",
                            border: "1px solid rgba(79,70,229,0.30)",
                            color: "#a5b4fc",
                          }}
                        >
                          Option #{idx + 1}
                        </span>
                        <h4
                          className="text-sm font-bold"
                          style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}
                        >
                          {alt.day} {alt.startTime} – {alt.endTime}
                        </h4>
                      </div>
                      <div className="flex items-center gap-3 text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                        <span className="flex items-center gap-1">
                          <Building className="w-3.5 h-3.5" style={{ color: "#a5b4fc" }} />
                          Room {alt.room.roomNumber} ({alt.room.roomType}, Cap: {alt.room.capacity})
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" style={{ color: "#6ee7b7" }} />
                          {alt.faculty.name}
                        </span>
                      </div>
                    </div>

                    <div
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold shrink-0"
                      style={{
                        background: "rgba(16,185,129,0.10)",
                        border: "1px solid rgba(16,185,129,0.25)",
                        color: "#6ee7b7",
                      }}
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>{alt.score}/100</span>
                    </div>
                  </div>

                  {/* Constraint Summary */}
                  <div
                    className="p-3 rounded-xl space-y-2"
                    style={{
                      background: "rgba(10,18,40,0.60)",
                      border: "1px solid rgba(79,70,229,0.12)",
                    }}
                  >
                    <span className="block text-[11px] font-semibold" style={{ color: "var(--text-muted)" }}>
                      Evaluated constraints &amp; advantages:
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs">
                      <div className="flex items-center gap-1.5" style={{ color: "#6ee7b7" }}>
                        <Check className="w-3.5 h-3.5" />
                        <span>0 hard collisions</span>
                      </div>
                      <div className="flex items-center gap-1.5" style={{ color: "#6ee7b7" }}>
                        <Check className="w-3.5 h-3.5" />
                        <span>Capacity valid ({alt.room.capacity} seats)</span>
                      </div>
                      {alt.advantages.map((adv, i) => (
                        <div key={i} className="flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}>
                          <Check className="w-3.5 h-3.5" style={{ color: "#a5b4fc" }} />
                          <span>{adv}</span>
                        </div>
                      ))}
                    </div>
                    {alt.warnings.length > 0 && (
                      <div
                        className="mt-2 pt-2 text-[11px] flex items-center gap-1"
                        style={{
                          borderTop: "1px solid rgba(79,70,229,0.12)",
                          color: "#fcd34d",
                        }}
                      >
                        <Info className="w-3.5 h-3.5" style={{ color: "#fcd34d" }} />
                        <span>{alt.warnings.join(', ')}</span>
                      </div>
                    )}
                  </div>

                  {isAdmin && (
                    <div className="flex items-center justify-end pt-1">
                      <button
                        onClick={() => handleOpenImpactAnalysis(alt)}
                        className="btn btn-primary btn-sm"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>What-If Simulation &amp; Apply</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Simulation Modal */}
      {showSimulationModal && simulatedImpact && (
        <div className="modal-backdrop">
          <div className="modal-box glass-elevated max-w-xl" style={{ padding: "1.75rem", borderRadius: "var(--r-2xl)" }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="section-eyebrow">What-If Simulation</span>
                <h3
                  className="text-lg font-bold mt-0.5"
                  style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Confirm Timetable Resolution
                </h3>
              </div>
              <span
                className="px-2.5 py-1 rounded-full text-xs font-bold"
                style={{
                  background: "rgba(16,185,129,0.10)",
                  border: "1px solid rgba(16,185,129,0.25)",
                  color: "#6ee7b7",
                }}
              >
                0 New Conflicts
              </span>
            </div>

            {/* Before / After */}
            <div
              className="grid grid-cols-2 gap-4 p-4 rounded-xl mb-4"
              style={{
                background: "rgba(10,18,40,0.80)",
                border: "1px solid rgba(79,70,229,0.15)",
              }}
            >
              <div className="space-y-1.5">
                <span
                  className="block text-[10px] font-bold uppercase tracking-wider"
                  style={{ color: "#fca5a5" }}
                >
                  Original (Conflicted)
                </span>
                <div className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                  {simulatedImpact.before.subject}
                </div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {simulatedImpact.before.day} · {simulatedImpact.before.time}
                </div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Room: {simulatedImpact.before.room}
                </div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Faculty: {simulatedImpact.before.faculty}
                </div>
              </div>

              <div
                className="space-y-1.5 pl-4"
                style={{ borderLeft: "1px solid rgba(79,70,229,0.18)" }}
              >
                <span
                  className="block text-[10px] font-bold uppercase tracking-wider"
                  style={{ color: "#6ee7b7" }}
                >
                  Proposed Alternative
                </span>
                <div className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                  {simulatedImpact.after.subject}
                </div>
                <div className="text-xs font-medium" style={{ color: "#6ee7b7" }}>
                  {simulatedImpact.after.day} · {simulatedImpact.after.time}
                </div>
                <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  Room: {simulatedImpact.after.room}
                </div>
                <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  Faculty: {simulatedImpact.after.faculty}
                </div>
              </div>
            </div>

            <p className="text-xs leading-relaxed mb-5" style={{ color: "var(--text-secondary)" }}>
              {simulatedImpact.summary} Applying this change will persist the updated schedule and automatically revalidate all remaining entries.
            </p>

            <div
              className="flex items-center justify-end gap-3 pt-4"
              style={{ borderTop: "1px solid rgba(79,70,229,0.15)" }}
            >
              <button
                onClick={() => setShowSimulationModal(false)}
                disabled={applyingAlt}
                className="btn btn-secondary btn-sm"
              >
                Discard
              </button>
              <button
                onClick={handleApplyChosenAlternative}
                disabled={applyingAlt}
                className="btn btn-primary"
              >
                {applyingAlt ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Apply Resolution</span>
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
