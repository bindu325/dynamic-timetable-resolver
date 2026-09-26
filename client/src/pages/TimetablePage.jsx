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
  Layers,
  CheckCircle2,
  Clock,
  ChevronRight,
  RefreshCw,
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

  const getEntryForSlot = (day, startTime) => {
    return entries.find((e) => e.day === day && e.startTime === startTime);
  };

  const conflictCount = entries.filter((e) => e.hasConflict).length;

  return (
    <div className="space-y-6">
      {/* Header & Controls Panel */}
      <div className="app-card p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200/60">
                <Calendar className="w-3.5 h-3.5" />
                Schedule Matrix
              </span>
              {conflictCount > 0 ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                  <AlertTriangle className="w-3 h-3" />
                  {conflictCount} active conflict{conflictCount > 1 ? 's' : ''}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" />
                  Optimal Schedule
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Academic Timetable Matrix</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Inspect session allocations, verify room occupancies, and manage period schedules across departments.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchEntries}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              title="Refresh timetable"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {isAdmin && (
              <button
                onClick={() => handleOpenCreateModal()}
                className="btn-primary text-xs flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Class Entry</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 pt-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              Section Filter
            </label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
            >
              <option value="ALL">All Sections (Aggregate)</option>
              {sections.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.department} · Sem {s.semester})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Faculty Filter
            </label>
            <select
              value={selectedFaculty}
              onChange={(e) => setSelectedFaculty(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
            >
              <option value="ALL">All Faculty Members</option>
              {faculties.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.name} ({f.department})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <DoorClosed className="w-3.5 h-3.5 text-slate-400" />
              Room / Facility
            </label>
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
            >
              <option value="ALL">All Rooms & Labs</option>
              {rooms.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.roomNumber} ({r.roomType} · Cap: {r.capacity})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Day Scope
            </label>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
            >
              <option value="ALL">All Days (Mon – Sat)</option>
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Timetable Interactive Grid */}
      <div className="app-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[960px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 text-xs font-semibold">
                <th className="p-4 w-32 text-center bg-slate-100/90 text-slate-700 font-bold sticky left-0 z-10 border-r border-slate-200">
                  Day / Period
                </th>
                {DEFAULT_TIME_SLOTS.map((slot) => (
                  <th key={slot.label} className="p-3.5 text-center border-l border-slate-200 first:border-l-0">
                    <span className="block text-slate-800 font-bold">{slot.label}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {(selectedDay === 'ALL' ? DAYS : [selectedDay]).map((day) => (
                <tr key={day} className="hover:bg-slate-50/40 transition-colors">
                  {/* Day Sticky Header */}
                  <td className="p-4 font-bold text-center text-slate-900 bg-slate-50/90 border-r border-slate-200 sticky left-0 z-10 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.05)]">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-700">{day.substring(0, 3)}</div>
                    <div className="text-[11px] font-normal text-slate-400 mt-0.5">{day}</div>
                  </td>

                  {DEFAULT_TIME_SLOTS.map((slot) => {
                    const entry = getEntryForSlot(day, slot.start);
                    return (
                      <td
                        key={slot.start}
                        className="p-2 align-top border-l border-slate-100 h-32 w-48"
                      >
                        {entry ? (
                          <div
                            className={`p-3 rounded-xl border flex flex-col justify-between h-full transition-all group relative ${
                              entry.hasConflict
                                ? 'bg-rose-50/70 border-rose-200 hover:border-rose-400 hover:shadow-sm'
                                : 'bg-white border-slate-200/90 hover:border-teal-400 hover:shadow-md'
                            }`}
                          >
                            <div>
                              <div className="flex items-start justify-between gap-1 mb-1.5">
                                <span className="font-bold text-slate-900 text-xs leading-tight truncate">
                                  {entry.subject?.name || 'Subject'}
                                </span>
                                {entry.hasConflict && (
                                  <AlertTriangle
                                    className="w-4 h-4 text-rose-600 shrink-0 animate-bounce"
                                    title={entry.conflictSummary || 'Conflict detected!'}
                                  />
                                )}
                              </div>

                              <div className="space-y-1 text-[11px] text-slate-500">
                                <div className="flex items-center gap-1.5 text-teal-700 font-medium truncate">
                                  <User className="w-3 h-3 text-teal-600 shrink-0" />
                                  <span className="truncate">{entry.faculty?.name || 'Faculty'}</span>
                                </div>
                                <div className="flex items-center justify-between text-slate-500">
                                  <span className="flex items-center gap-1">
                                    <DoorClosed className="w-3 h-3 text-slate-400 shrink-0" />
                                    <span>{entry.room?.roomNumber || 'Room'}</span>
                                  </span>
                                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200/60">
                                    {entry.section?.name || 'Sec'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Entry Controls */}
                            {isAdmin && (
                              <div className="flex items-center justify-end gap-1.5 mt-2 pt-1.5 border-t border-slate-100 opacity-90 group-hover:opacity-100">
                                {entry.hasConflict && (
                                  <button
                                    onClick={() => onOpenResolverForEntry?.(entry)}
                                    className="px-2 py-0.5 rounded-md bg-rose-600 text-white hover:bg-rose-700 text-[10px] font-bold flex items-center gap-1 shadow-sm transition-all"
                                    title="Auto-Resolve Conflict"
                                  >
                                    <Sparkles className="w-3 h-3" />
                                    <span>Resolve</span>
                                  </button>
                                )}
                                <button
                                  onClick={() => handleOpenEditModal(entry)}
                                  className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
                                  title="Edit Entry"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleDeleteEntry(entry._id)}
                                  className="p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                                  title="Delete Entry"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div
                            onClick={() => isAdmin && handleOpenCreateModal(day, slot.start, slot.end)}
                            className={`h-full rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center transition-all ${
                              isAdmin
                                ? 'hover:border-teal-400 hover:bg-teal-50/40 cursor-pointer text-slate-400 hover:text-teal-700'
                                : 'text-slate-300'
                            }`}
                          >
                            <span className="text-[11px] font-medium">+ Open Slot</span>
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
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingEntry ? 'Edit Class Schedule' : 'Schedule New Period'}
                </h3>
                <p className="text-xs text-slate-500">
                  Assign section, faculty, and room with automatic conflict validation.
                </p>
              </div>
              <button
                onClick={() => setShowEntryModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalConflictWarning && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-rose-800">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Hard Constraint Conflict Detected</span>
                </div>
                <p className="text-rose-700">{modalConflictWarning.message}</p>
                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSaveEntry(true)}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors"
                  >
                    Force Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEntryModal(false);
                      onOpenResolverForEntry?.(editingEntry || entryForm);
                    }}
                    className="btn-primary text-xs py-1.5 flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Find Alternative Slot</span>
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Academic Section</label>
                <select
                  value={entryForm.section}
                  onChange={(e) => setEntryForm({ ...entryForm, section: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                >
                  {sections.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.studentCount} students)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Course Subject</label>
                <select
                  value={entryForm.subject}
                  onChange={(e) => setEntryForm({ ...entryForm, subject: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                >
                  {subjects.map((sub) => (
                    <option key={sub._id} value={sub._id}>
                      {sub.code} - {sub.name} ({sub.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Assigned Faculty</label>
                <select
                  value={entryForm.faculty}
                  onChange={(e) => setEntryForm({ ...entryForm, faculty: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                >
                  {faculties.map((f) => (
                    <option key={f._id} value={f._id}>
                      {f.name} ({f.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Allocated Room / Lab</label>
                <select
                  value={entryForm.room}
                  onChange={(e) => setEntryForm({ ...entryForm, room: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                >
                  {rooms.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.roomNumber} ({r.roomType} · Cap: {r.capacity})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Day of Week</label>
                <select
                  value={entryForm.day}
                  onChange={(e) => setEntryForm({ ...entryForm, day: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Time Period</label>
                <select
                  value={`${entryForm.startTime}-${entryForm.endTime}`}
                  onChange={(e) => {
                    const [start, end] = e.target.value.split('-');
                    setEntryForm({ ...entryForm, startTime: start, endTime: end });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                >
                  {DEFAULT_TIME_SLOTS.map((slot) => (
                    <option key={slot.label} value={`${slot.start}-${slot.end}`}>
                      {slot.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowEntryModal(false)}
                className="btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveEntry(false)}
                disabled={submitting}
                className="btn-primary text-xs flex items-center gap-2"
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
