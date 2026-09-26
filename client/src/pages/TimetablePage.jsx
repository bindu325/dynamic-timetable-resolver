import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  AlertTriangle,
  DoorClosed,
  User,
  BookOpen,
  Sparkles,
  Trash2,
  Edit2,
  X,
  Plus,
  Calendar,
} from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DEFAULT_TIME_SLOTS = [
  { start: '09:00', end: '10:00', label: '09:00 - 10:00' },
  { start: '10:00', end: '11:00', label: '10:00 - 11:00' },
  { start: '11:15', end: '12:15', label: '11:15 - 12:15' },
  { start: '12:15', end: '13:15', label: '12:15 - 13:15' },
  { start: '14:00', end: '15:00', label: '14:00 - 15:00' },
  { start: '15:00', end: '16:00', label: '15:00 - 16:00' },
];

const DAY_ABBR = { Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat' };

const TimetablePage = ({ onOpenResolverForEntry }) => {
  const { isAdmin, isFaculty, user } = useAuth();
  const { success, error, warning } = useToast();

  const [entries, setEntries] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedSection, setSelectedSection] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('ALL');
  const [selectedDay, setSelectedDay] = useState('ALL');

  const [showEntryModal, setShowEntryModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [entryForm, setEntryForm] = useState({
    academicYear: '2025-2026',
    semester: 5,
    section: '',
    subject: '',
    faculty: '',
    room: '',
    day: 'Monday',
    startTime: '09:00',
    endTime: '10:00',
    periodNumber: 1,
    status: 'PUBLISHED',
  });
  const [modalConflictWarning, setModalConflictWarning] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [facRes, secRes, subRes, roomRes] = await Promise.all([
        API.get('/faculty'),
        API.get('/sections'),
        API.get('/subjects'),
        API.get('/rooms'),
      ]);
      if (facRes.data.success) setFaculties(facRes.data.data);
      if (secRes.data.success) {
        setSections(secRes.data.data);
        if (!selectedSection && secRes.data.data.length > 0) {
          setSelectedSection(secRes.data.data[0]._id);
        }
      }
      if (subRes.data.success) setSubjects(subRes.data.data);
      if (roomRes.data.success) setRooms(roomRes.data.data);
    } catch (err) {
      console.error('Failed to fetch filter data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEntries = async () => {
    try {
      const params = {};
      if (selectedSection && selectedSection !== 'ALL') params.section = selectedSection;
      if (selectedFaculty && selectedFaculty !== 'ALL') params.faculty = selectedFaculty;
      if (selectedRoom && selectedRoom !== 'ALL') params.room = selectedRoom;
      if (selectedDay && selectedDay !== 'ALL') params.day = selectedDay;
      const res = await API.get('/timetable', { params });
      if (res.data.success) setEntries(res.data.data);
    } catch (err) {
      console.error('Failed to fetch timetable entries:', err);
    }
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { fetchEntries(); }, [selectedSection, selectedFaculty, selectedRoom, selectedDay]);

  const handleOpenCreateModal = (day = 'Monday', startTime = '09:00', endTime = '10:00') => {
    setEditingEntry(null);
    setModalConflictWarning(null);
    setEntryForm({
      academicYear: '2025-2026',
      semester: 5,
      section: selectedSection || sections[0]?._id || '',
      subject: subjects[0]?._id || '',
      faculty: faculties[0]?._id || '',
      room: rooms[0]?._id || '',
      day,
      startTime,
      endTime,
      periodNumber: 1,
      status: 'PUBLISHED',
    });
    setShowEntryModal(true);
  };

  const handleOpenEditModal = (entry) => {
    setEditingEntry(entry);
    setModalConflictWarning(null);
    setEntryForm({
      academicYear: entry.academicYear,
      semester: entry.semester,
      section: entry.section?._id || entry.section,
      subject: entry.subject?._id || entry.subject,
      faculty: entry.faculty?._id || entry.faculty,
      room: entry.room?._id || entry.room,
      day: entry.day,
      startTime: entry.startTime,
      endTime: entry.endTime,
      periodNumber: entry.periodNumber || 1,
      status: entry.status || 'PUBLISHED',
    });
    setShowEntryModal(true);
  };

  const handleSaveEntry = async (allowForce = false) => {
    setSubmitting(true);
    setModalConflictWarning(null);
    try {
      if (editingEntry) {
        const res = await API.put(`/timetable/${editingEntry._id}`, entryForm);
        if (res.data.success) {
          success('Timetable entry updated!');
          setShowEntryModal(false);
          fetchEntries();
        }
      } else {
        const res = await API.post('/timetable', { ...entryForm, allowForce });
        if (res.data.success) {
          success(res.data.message || 'Timetable entry added!');
          setShowEntryModal(false);
          fetchEntries();
        }
      }
    } catch (err) {
      if (err.response?.status === 409) {
        setModalConflictWarning({
          message: err.response.data.message,
          conflicts: err.response.data.conflicts || [],
        });
        warning('Constraint conflict detected for this slot!');
      } else {
        error(err.response?.data?.message || 'Failed to save timetable entry');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (!window.confirm('Remove this timetable entry?')) return;
    try {
      const res = await API.delete(`/timetable/${entryId}`);
      if (res.data.success) {
        success('Entry deleted');
        fetchEntries();
      }
    } catch (err) {
      error('Failed to delete entry');
    }
  };

  const getEntryForSlot = (day, startTime) =>
    entries.find((e) => e.day === day && e.startTime === startTime);

  const filterSelectClass = [
    "w-full rounded-xl px-3 py-2 text-xs font-medium",
    "border outline-none transition-all",
  ].join(" ");

  const filterSelectStyle = {
    background: "rgba(10,18,40,0.80)",
    border: "1px solid rgba(79,70,229,0.20)",
    color: "var(--text-primary)",
    appearance: "none",
  };

  return (
    <div className="space-y-5 panel-enter-3d">

      {/* Header */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="section-eyebrow">Schedule Visualizer</span>
            <h2
              className="section-title mt-1"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Academic <span className="text-gradient-indigo">Timetable Grid</span>
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <button
                onClick={() => handleOpenCreateModal()}
                className="btn btn-primary"
              >
                <Plus className="w-4 h-4" />
                <span>Add Class Entry</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Bar */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-4"
          style={{ borderTop: "1px solid rgba(79,70,229,0.12)" }}
        >
          {[
            {
              label: "Section",
              value: selectedSection,
              onChange: setSelectedSection,
              options: [
                { value: "ALL", label: "All sections" },
                ...sections.map(s => ({ value: s._id, label: `${s.name} (${s.department})` })),
              ],
            },
            {
              label: "Faculty",
              value: selectedFaculty,
              onChange: setSelectedFaculty,
              options: [
                { value: "ALL", label: "All faculty" },
                ...faculties.map(f => ({ value: f._id, label: `${f.name} (${f.department})` })),
              ],
            },
            {
              label: "Room",
              value: selectedRoom,
              onChange: setSelectedRoom,
              options: [
                { value: "ALL", label: "All rooms & labs" },
                ...rooms.map(r => ({ value: r._id, label: `${r.roomNumber} (${r.roomType})` })),
              ],
            },
            {
              label: "Day",
              value: selectedDay,
              onChange: setSelectedDay,
              options: [
                { value: "ALL", label: "All days" },
                ...DAYS.map(d => ({ value: d, label: d })),
              ],
            },
          ].map(({ label, value, onChange, options }) => (
            <div key={label}>
              <label className="input-label">{label}</label>
              <select
                value={value}
                onChange={e => onChange(e.target.value)}
                className="input-field"
                style={{ fontSize: "12px" }}
              >
                {options.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Timetable Grid */}
      <div
        className="glass-card overflow-hidden"
        style={{ borderRadius: "var(--r-xl)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr
                style={{
                  background: "rgba(10,18,40,0.90)",
                  borderBottom: "1px solid rgba(79,70,229,0.18)",
                }}
              >
                <th
                  className="p-4 w-28 text-center sticky left-0 z-10 text-xs font-bold"
                  style={{
                    background: "rgba(10,18,40,0.95)",
                    color: "var(--text-muted)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  Day / Time
                </th>
                {DEFAULT_TIME_SLOTS.map((slot) => (
                  <th
                    key={slot.label}
                    className="p-4 text-center text-xs"
                    style={{
                      borderLeft: "1px solid rgba(79,70,229,0.10)",
                      color: "var(--text-muted)",
                      fontWeight: 600,
                    }}
                  >
                    <span style={{ color: "var(--text-secondary)", fontWeight: 700 }}>
                      {slot.label}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(selectedDay === 'ALL' ? DAYS : [selectedDay]).map((day, rowIdx) => (
                <tr
                  key={day}
                  style={{
                    borderBottom: "1px solid rgba(79,70,229,0.08)",
                    background: rowIdx % 2 === 0
                      ? "rgba(22,34,64,0.30)"
                      : "rgba(10,18,40,0.30)",
                  }}
                >
                  {/* Day Header */}
                  <td
                    className="p-4 font-bold text-center sticky left-0 z-10 text-xs"
                    style={{
                      background: rowIdx % 2 === 0
                        ? "rgba(10,18,40,0.90)"
                        : "rgba(7,13,30,0.92)",
                      borderRight: "1px solid rgba(79,70,229,0.12)",
                      color: "#a5b4fc",
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                  >
                    {DAY_ABBR[day] || day}
                  </td>

                  {DEFAULT_TIME_SLOTS.map((slot) => {
                    const entry = getEntryForSlot(day, slot.start);
                    return (
                      <td
                        key={slot.start}
                        className="p-2 align-top"
                        style={{
                          borderLeft: "1px solid rgba(79,70,229,0.08)",
                          width: "160px",
                          minHeight: "112px",
                          verticalAlign: "top",
                        }}
                      >
                        {entry ? (
                          <div
                            className="p-3 rounded-xl flex flex-col justify-between transition-all group"
                            style={{
                              minHeight: "100px",
                              background: entry.hasConflict
                                ? "rgba(239,68,68,0.10)"
                                : "rgba(79,70,229,0.10)",
                              border: `1px solid ${entry.hasConflict
                                ? "rgba(239,68,68,0.30)"
                                : "rgba(79,70,229,0.25)"}`,
                              boxShadow: entry.hasConflict
                                ? "0 0 16px rgba(239,68,68,0.08)"
                                : "0 2px 8px rgba(0,0,0,0.20)",
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.transform = "translateY(-1px)";
                              e.currentTarget.style.borderColor = entry.hasConflict
                                ? "rgba(239,68,68,0.50)"
                                : "rgba(79,70,229,0.50)";
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.borderColor = entry.hasConflict
                                ? "rgba(239,68,68,0.30)"
                                : "rgba(79,70,229,0.25)";
                            }}
                          >
                            <div>
                              <div className="flex items-start justify-between gap-1 mb-1.5">
                                <span
                                  className="font-bold text-[11px] leading-tight"
                                  style={{ color: "var(--text-primary)" }}
                                >
                                  {entry.subject?.name || 'Subject'}
                                </span>
                                {entry.hasConflict && (
                                  <AlertTriangle
                                    className="w-3.5 h-3.5 shrink-0"
                                    style={{ color: "#fca5a5" }}
                                    title={entry.conflictSummary || 'Conflict!'}
                                  />
                                )}
                              </div>
                              <div className="space-y-0.5 text-[10px]" style={{ color: "var(--text-muted)" }}>
                                <div className="flex items-center gap-1" style={{ color: "#a5b4fc" }}>
                                  <User className="w-2.5 h-2.5" />
                                  <span className="truncate">{entry.faculty?.name || 'Faculty'}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <DoorClosed className="w-2.5 h-2.5" />
                                  <span>{entry.room?.roomNumber || 'Room'}</span>
                                  <span
                                    className="px-1 rounded text-[9px] font-semibold"
                                    style={{
                                      background: "rgba(79,70,229,0.15)",
                                      color: "#a5b4fc",
                                    }}
                                  >
                                    {entry.section?.name || 'Sec'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {isAdmin && (
                              <div
                                className="flex items-center justify-end gap-1 mt-2 pt-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{ borderTop: "1px solid rgba(79,70,229,0.15)" }}
                              >
                                {entry.hasConflict && (
                                  <button
                                    onClick={() => onOpenResolverForEntry?.(entry)}
                                    className="p-1 rounded text-[10px] font-semibold flex items-center gap-1 px-1.5 transition-colors"
                                    style={{
                                      background: "rgba(239,68,68,0.15)",
                                      color: "#fca5a5",
                                      border: "1px solid rgba(239,68,68,0.25)",
                                    }}
                                    title="Auto-Resolve"
                                  >
                                    <Sparkles className="w-2.5 h-2.5" />
                                    <span>Solve</span>
                                  </button>
                                )}
                                <button
                                  onClick={() => handleOpenEditModal(entry)}
                                  className="p-1 rounded transition-colors"
                                  style={{ color: "var(--text-muted)" }}
                                  onMouseEnter={e => e.currentTarget.style.color = "var(--text-primary)"}
                                  onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
                                  title="Edit"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleDeleteEntry(entry._id)}
                                  className="p-1 rounded transition-colors"
                                  style={{ color: "var(--text-muted)" }}
                                  onMouseEnter={e => e.currentTarget.style.color = "#fca5a5"}
                                  onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
                                  title="Delete"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div
                            onClick={() => isAdmin && handleOpenCreateModal(day, slot.start, slot.end)}
                            className="rounded-xl border-dashed flex items-center justify-center transition-all"
                            style={{
                              minHeight: "100px",
                              border: "1px dashed rgba(255,255,255,0.30)",
                              cursor: isAdmin ? "pointer" : "default",
                              color: "#ffffff",
                            }}
                            onMouseEnter={e => {
                              if (!isAdmin) return;
                              e.currentTarget.style.borderColor = "#ffffff";
                              e.currentTarget.style.background = "rgba(255,255,255,0.10)";
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.borderColor = "rgba(255,255,255,0.30)";
                              e.currentTarget.style.background = "transparent";
                            }}
                          >
                            <span className="text-[11px] font-bold tracking-wide">+ Free</span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Entry Modal */}
      {showEntryModal && (
        <div className="modal-backdrop">
          <div
            className="modal-box glass-elevated max-w-lg"
            style={{ padding: "1.75rem", borderRadius: "var(--r-2xl)" }}
          >
            <div
              className="flex items-center justify-between pb-4 mb-4"
              style={{ borderBottom: "1px solid rgba(79,70,229,0.15)" }}
            >
              <h3
                className="text-base font-bold"
                style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {editingEntry ? 'Edit Class Period' : 'Schedule New Class Period'}
              </h3>
              <button
                onClick={() => setShowEntryModal(false)}
                className="btn btn-ghost"
                style={{ padding: "0.375rem" }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalConflictWarning && (
              <div
                className="p-3.5 rounded-xl mb-4 space-y-2 text-xs"
                style={{
                  background: "rgba(239,68,68,0.10)",
                  border: "1px solid rgba(239,68,68,0.30)",
                }}
              >
                <div
                  className="flex items-center gap-2 font-bold"
                  style={{ color: "#fca5a5" }}
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Conflict Warning</span>
                </div>
                <p style={{ color: "var(--text-secondary)" }}>{modalConflictWarning.message}</p>
                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSaveEntry(true)}
                    className="btn btn-danger btn-sm"
                  >
                    Force Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEntryModal(false);
                      onOpenResolverForEntry?.(editingEntry || entryForm);
                    }}
                    className="btn btn-primary btn-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Find Alternative</span>
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  label: "Section",
                  value: entryForm.section,
                  onChange: v => setEntryForm({ ...entryForm, section: v }),
                  options: sections.map(s => ({ value: s._id, label: `${s.name} (${s.studentCount} students)` })),
                },
                {
                  label: "Subject",
                  value: entryForm.subject,
                  onChange: v => setEntryForm({ ...entryForm, subject: v }),
                  options: subjects.map(s => ({ value: s._id, label: `${s.code} - ${s.name}` })),
                },
                {
                  label: "Faculty member",
                  value: entryForm.faculty,
                  onChange: v => setEntryForm({ ...entryForm, faculty: v }),
                  options: faculties.map(f => ({ value: f._id, label: `${f.name} (${f.department})` })),
                },
                {
                  label: "Room / Lab",
                  value: entryForm.room,
                  onChange: v => setEntryForm({ ...entryForm, room: v }),
                  options: rooms.map(r => ({ value: r._id, label: `${r.roomNumber} (${r.roomType}, Cap: ${r.capacity})` })),
                },
                {
                  label: "Day",
                  value: entryForm.day,
                  onChange: v => setEntryForm({ ...entryForm, day: v }),
                  options: DAYS.map(d => ({ value: d, label: d })),
                },
                {
                  label: "Time slot",
                  value: `${entryForm.startTime}-${entryForm.endTime}`,
                  onChange: v => {
                    const [start, end] = v.split('-');
                    setEntryForm({ ...entryForm, startTime: start, endTime: end });
                  },
                  options: DEFAULT_TIME_SLOTS.map(s => ({ value: `${s.start}-${s.end}`, label: s.label })),
                },
              ].map(({ label, value, onChange, options }) => (
                <div key={label}>
                  <label className="input-label">{label}</label>
                  <select
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className="input-field"
                    style={{ fontSize: "12px" }}
                  >
                    {options.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div
              className="flex items-center justify-end gap-3 pt-4 mt-4"
              style={{ borderTop: "1px solid rgba(79,70,229,0.15)" }}
            >
              <button
                type="button"
                onClick={() => setShowEntryModal(false)}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveEntry(false)}
                disabled={submitting}
                className="btn btn-primary btn-sm"
              >
                {submitting ? 'Checking…' : 'Validate & Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimetablePage;
