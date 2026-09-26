import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Clock,
  Plus,
  Trash2,
  X,
  AlertCircle,
} from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TimeSlotsPage = () => {
  const { isAdmin } = useAuth();
  const { success, error } = useToast();

  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState('ALL');

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    day: 'Monday',
    startTime: '09:00',
    endTime: '10:00',
    periodNumber: 1,
    label: 'Period 1',
  });
  const [saving, setSaving] = useState(false);

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedDay !== 'ALL') params.day = selectedDay;
      const res = await API.get('/time-slots', { params });
      if (res.data.success) {
        setTimeSlots(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [selectedDay]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.post('/time-slots', formData);
      success('Time slot created successfully!');
      setShowModal(false);
      fetchSlots();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to create slot');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this time slot?')) return;
    try {
      await API.delete(`/time-slots/${id}`);
      success('Time slot removed');
      fetchSlots();
    } catch (err) {
      error('Failed to delete time slot');
    }
  };

  return (
    <div className="space-y-5 panel-enter-3d">
      <div
        className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 overflow-hidden"
        style={{ background: "linear-gradient(135deg, rgba(22,34,64,0.80) 0%, rgba(10,18,40,0.90) 100%)" }}
      >
        <div
          style={{ position: "absolute", right: 0, top: 0, width: "30%", height: "200%",
            background: "radial-gradient(ellipse at 80% 50%, rgba(79,70,229,0.06) 0%, transparent 70%)", pointerEvents: "none" }}
        />
        <div className="relative">
          <span className="section-eyebrow">Schedule Boundaries</span>
          <h2 className="section-title mt-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Time Slot <span className="text-gradient-indigo">Management</span>
          </h2>
          <p className="section-desc mt-1">Define daily periods, lecture durations, and bell schedules across days.</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowModal(true)} className="btn btn-primary shrink-0 relative">
            <Plus className="w-4 h-4" />
            <span>Create Time Slot</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <label className="input-label" style={{ whiteSpace: "nowrap" }}>Filter day:</label>
        <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)} className="input-field" style={{ width: "auto" }}>
          <option value="ALL">All days (Mon–Sat)</option>
          {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="spinner" /></div>
      ) : timeSlots.length === 0 ? (
        <div className="glass-card p-12 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(79,70,229,0.10)", border: "1px solid rgba(79,70,229,0.22)" }}>
            <Clock className="w-6 h-6" style={{ color: "#a5b4fc" }} />
          </div>
          <h4 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>No Slots Configured</h4>
          <p className="section-desc">Add period intervals to construct your schedule.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {timeSlots.map((slot) => (
            <div key={slot._id} className="card-depth p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs"
                  style={{ background: "rgba(79,70,229,0.15)", border: "1px solid rgba(79,70,229,0.25)", color: "#a5b4fc",
                    fontFamily: "'JetBrains Mono', monospace" }}>
                  P{slot.periodNumber}
                </div>
                <div>
                  <h4 className="text-sm font-bold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>
                    {slot.startTime} – {slot.endTime}
                  </h4>
                  <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>{slot.day}</span>
                </div>
              </div>
              {isAdmin && (
                <button onClick={() => handleDelete(slot._id)} className="btn btn-ghost btn-sm" style={{ padding: "0.375rem" }}
                  onMouseEnter={e => e.currentTarget.style.color = "#fca5a5"}
                  onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}>
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-backdrop">
          <div className="glass-card rounded-2xl max-w-md w-full p-6 border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">New Period Slot</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="input-label">Day</label>
                <select
                  value={formData.day}
                  onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                  className="input-field"
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Start Time (24-hr)</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="input-label">End Time (24-hr)</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    required
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="input-label">Period Number</label>
                <input
                  type="number"
                  value={formData.periodNumber}
                  onChange={(e) => setFormData({ ...formData, periodNumber: Number(e.target.value) })}
                  min={1}
                  max={12}
                  className="input-field"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-orange-600 hover:from-fuchsia-500 hover:to-orange-500 text-white font-semibold shadow-lg shadow-fuchsia-600/30"
                >
                  {saving ? 'Saving...' : 'Save Time Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSlotsPage;

