import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Calendar,
  Filter,
  Plus,
  AlertTriangle,
  DoorClosed,
  User,
  BookOpen,
  Sparkles,
  Trash2,
  Edit2,
  X,
  FileDown,
  Layers,
  Search,
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

const TimetablePage = ({ onOpenResolverForEntry }) => {
  const { isAdmin, isFaculty, user } = useAuth();
  const { success, error, warning } = useToast();

  const [entries, setEntries] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('ALL');
  const [selectedDay, setSelectedDay] = useState('ALL');

  // Modal create/edit entry
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

  // Fetch initial data
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
          // If faculty logged in, default to their section/timetable or CSE-A
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
      if (res.data.success) {
        setEntries(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch timetable entries:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [selectedSection, selectedFaculty, selectedRoom, selectedDay]);

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
          success('Timetable entry updated successfully!');
          setShowEntryModal(false);
          fetchEntries();
        }
      } else {
        const res = await API.post('/timetable', { ...entryForm, allowForce });
        if (res.data.success) {
          success(res.data.message || 'Timetable entry added successfully!');
          setShowEntryModal(false);
          fetchEntries();
        }
      }
    } catch (err) {
      if (err.response?.status === 409) {
        // Hard conflict detected! Display inline warning and prompt
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
    if (!window.confirm('Are you sure you want to remove this timetable entry?')) return;
    try {
      const res = await API.delete(`/timetable/${entryId}`);
      if (res.data.success) {
        success('Timetable entry deleted successfully');
        fetchEntries();
      }
    } catch (err) {
      error('Failed to delete entry');
    }
  };

  // Helper to find entry matching day and time
  const getEntryForSlot = (day, startTime) => {
    return entries.find((e) => e.day === day && e.startTime === startTime);
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              Schedule Visualizer
            </span>
            <h2 className="text-2xl font-bold text-white mt-0.5">
              Academic Timetable Grid
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <button
                onClick={() => handleOpenCreateModal()}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Class Entry</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Filter by Section</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Sections (Aggregate)</option>
              {sections.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.department} Sem {s.semester})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Filter by Faculty</label>
            <select
              value={selectedFaculty}
              onChange={(e) => setSelectedFaculty(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Faculty</option>
              {faculties.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.name} ({f.department})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Filter by Room</label>
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Rooms & Labs</option>
              {rooms.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.roomNumber} ({r.roomType}, Cap: {r.capacity})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Filter by Day</label>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Days (Monday - Saturday)</option>
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
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 text-xs font-semibold">
                <th className="p-4 w-28 text-center bg-slate-900/95 sticky left-0 z-10">Day / Time</th>
                {DEFAULT_TIME_SLOTS.map((slot) => (
                  <th key={slot.label} className="p-4 text-center border-l border-slate-800/80">
                    <span className="block text-slate-200 font-bold">{slot.label}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {(selectedDay === 'ALL' ? DAYS : [selectedDay]).map((day) => (
                <tr key={day} className="hover:bg-slate-900/30 transition-colors">
                  {/* Day Row Header */}
                  <td className="p-4 font-bold text-center text-indigo-300 bg-slate-900/70 border-r border-slate-800 sticky left-0 z-10">
                    {day}
                  </td>

                  {DEFAULT_TIME_SLOTS.map((slot) => {
                    const entry = getEntryForSlot(day, slot.start);
                    return (
                      <td
                        key={slot.start}
                        className="p-2.5 align-top border-l border-slate-800/60 h-28 w-44"
                      >
                        {entry ? (
                          <div
                            className={`p-3 rounded-xl border flex flex-col justify-between h-full transition-all group relative ${
                              entry.hasConflict
                                ? 'bg-rose-950/40 border-rose-500/50 hover:border-rose-400 glow-rose'
                                : 'bg-slate-900/90 border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850'
                            }`}
                          >
                            <div>
                              <div className="flex items-start justify-between gap-1 mb-1">
                                <span className="font-bold text-white text-xs leading-tight truncate">
                                  {entry.subject?.name || 'Subject'}
                                </span>
                                {entry.hasConflict && (
                                  <AlertTriangle
                                    className="w-4 h-4 text-rose-400 shrink-0 animate-pulse"
                                    title={entry.conflictSummary || 'Conflict detected!'}
                                  />
                                )}
                              </div>

                              <div className="space-y-0.5 text-[11px] text-slate-400">
                                <div className="flex items-center gap-1 text-indigo-300">
                                  <User className="w-3 h-3" />
                                  <span className="truncate">{entry.faculty?.name || 'Faculty'}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <DoorClosed className="w-3 h-3 text-slate-500" />
                                  <span>{entry.room?.roomNumber || 'Room'}</span>
                                  <span className="text-[10px] px-1 rounded bg-slate-800 text-slate-300">
                                    {entry.section?.name || 'Sec'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Entry Actions */}
                            {isAdmin && (
                              <div className="flex items-center justify-end gap-1.5 mt-2 pt-1 border-t border-slate-800/80 opacity-90 group-hover:opacity-100">
                                {entry.hasConflict && (
                                  <button
                                    onClick={() => onOpenResolverForEntry?.(entry)}
                                    className="p-1 rounded bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-[10px] font-semibold flex items-center gap-1 px-1.5"
                                    title="Auto-Resolve Conflict"
                                  >
                                    <Sparkles className="w-3 h-3" />
                                    <span>Solve</span>
                                  </button>
                                )}
                                <button
                                  onClick={() => handleOpenEditModal(entry)}
                                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                                  title="Edit Entry"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleDeleteEntry(entry._id)}
                                  className="p-1 rounded hover:bg-rose-500/10 text-slate-400 hover:text-rose-400"
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
                            className={`h-full rounded-xl border border-dashed border-slate-800/60 flex items-center justify-center transition-all ${
                              isAdmin
                                ? 'hover:border-indigo-500/40 hover:bg-indigo-950/10 cursor-pointer text-slate-600 hover:text-indigo-400'
                                : 'text-slate-700'
                            }`}
                          >
                            <span className="text-[11px] font-medium">+ Free</span>
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

      {/* Add / Edit Entry Modal */}
      {showEntryModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl max-w-lg w-full p-6 border border-slate-800 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingEntry ? 'Edit Timetable Schedule' : 'Schedule New Class Period'}
              </h3>
              <button
                onClick={() => setShowEntryModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* In-Modal Conflict Alert */}
            {modalConflictWarning && (
              <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Conflict Warning</span>
                </div>
                <p>{modalConflictWarning.message}</p>
                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSaveEntry(true)}
                    className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-[11px]"
                  >
                    Force Save Anyway
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEntryModal(false);
                      onOpenResolverForEntry?.(editingEntry || entryForm);
                    }}
                    className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Find Feasible Alternative</span>
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Section</label>
                <select
                  value={entryForm.section}
                  onChange={(e) => setEntryForm({ ...entryForm, section: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  {sections.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.studentCount} students)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Subject</label>
                <select
                  value={entryForm.subject}
                  onChange={(e) => setEntryForm({ ...entryForm, subject: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  {subjects.map((sub) => (
                    <option key={sub._id} value={sub._id}>
                      {sub.code} - {sub.name} ({sub.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Faculty Member</label>
                <select
                  value={entryForm.faculty}
                  onChange={(e) => setEntryForm({ ...entryForm, faculty: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  {faculties.map((f) => (
                    <option key={f._id} value={f._id}>
                      {f.name} ({f.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Room / Lab</label>
                <select
                  value={entryForm.room}
                  onChange={(e) => setEntryForm({ ...entryForm, room: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  {rooms.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.roomNumber} ({r.roomType}, Cap: {r.capacity})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Day</label>
                <select
                  value={entryForm.day}
                  onChange={(e) => setEntryForm({ ...entryForm, day: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Time Slot</label>
                <select
                  value={`${entryForm.startTime}-${entryForm.endTime}`}
                  onChange={(e) => {
                    const [start, end] = e.target.value.split('-');
                    setEntryForm({ ...entryForm, startTime: start, endTime: end });
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  {DEFAULT_TIME_SLOTS.map((slot) => (
                    <option key={slot.label} value={`${slot.start}-${slot.end}`}>
                      {slot.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowEntryModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveEntry(false)}
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-2"
              >
                {submitting ? 'Checking Constraints...' : 'Validate & Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimetablePage;
