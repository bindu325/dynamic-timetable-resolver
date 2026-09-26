import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  DoorClosed,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Percent,
  CheckCircle2,
  AlertCircle,
  Building,
} from 'lucide-react';

const RoomsPage = () => {
  const { isAdmin } = useAuth();
  const { success, error } = useToast();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    roomNumber: '',
    building: 'Academic Block A',
    capacity: 60,
    roomType: 'CLASSROOM',
    equipment: '',
    available: true,
  });
  const [saving, setSaving] = useState(false);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const params = {};
      if (typeFilter !== 'ALL') params.roomType = typeFilter;
      if (search) params.search = search;

      const res = await API.get('/rooms', { params });
      if (res.data.success) {
        setRooms(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [typeFilter, search]);

  const handleOpenAdd = () => {
    setEditingRoom(null);
    setFormData({
      roomNumber: `LH-${Math.floor(100 + Math.random() * 899)}`,
      building: 'Academic Block A',
      capacity: 60,
      roomType: 'CLASSROOM',
      equipment: 'Projector, Smartboard, Audio System',
      available: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (r) => {
    setEditingRoom(r);
    setFormData({
      roomNumber: r.roomNumber,
      building: r.building,
      capacity: r.capacity,
      roomType: r.roomType,
      equipment: Array.isArray(r.equipment) ? r.equipment.join(', ') : (r.equipment || ''),
      available: r.available !== false,
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        equipment: typeof formData.equipment === 'string'
          ? formData.equipment.split(',').map((s) => s.trim()).filter(Boolean)
          : formData.equipment,
      };

      if (editingRoom) {
        await API.put(`/rooms/${editingRoom._id}`, payload);
        success('Room updated successfully!');
      } else {
        await API.post('/rooms', payload);
        success('Room added successfully!');
      }
      setShowModal(false);
      fetchRooms();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save room');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, force = false) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;
    try {
      await API.delete(`/rooms/${id}${force ? '?force=true' : ''}`);
      success('Room deleted successfully');
      fetchRooms();
    } catch (err) {
      if (err.response?.status === 400 && !force) {
        if (window.confirm(`${err.response.data.message}\nDo you want to FORCE delete and clear bookings for this room?`)) {
          handleDelete(id, true);
        }
      } else {
        error(err.response?.data?.message || 'Failed to delete room');
      }
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
          <span className="section-eyebrow">Campus Facilities</span>
          <h2 className="section-title mt-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Room &amp; Lab <span className="text-gradient-indigo">Management</span>
          </h2>
          <p className="section-desc mt-1">Monitor real-time capacity, equipment availability, and weekly utilization rates.</p>
        </div>
        {isAdmin && (
          <button onClick={handleOpenAdd} className="btn btn-primary shrink-0 relative">
            <Plus className="w-4 h-4" />
            <span>Add Facility</span>
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="input-with-icon w-full sm:w-80">
          <Search className="input-icon" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search room number or building…" className="input-field" />
        </div>
        <div className="flex items-center gap-2">
          <label className="input-label" style={{ whiteSpace: "nowrap" }}>Facility type:</label>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input-field" style={{ width: "auto" }}>
            <option value="ALL">All facilities</option>
            <option value="CLASSROOM">Classrooms</option>
            <option value="LAB">Laboratories</option>
            <option value="SEMINAR_HALL">Seminar halls</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="spinner" /></div>
      ) : rooms.length === 0 ? (
        <div className="glass-card p-12 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(79,70,229,0.10)", border: "1px solid rgba(79,70,229,0.22)" }}>
            <DoorClosed className="w-6 h-6" style={{ color: "#a5b4fc" }} />
          </div>
          <h4 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>No Facilities Found</h4>
          <p className="section-desc">Add a new room or laboratory.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <div key={room._id} className="card-3d p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: "rgba(79,70,229,0.12)", border: "1px solid rgba(79,70,229,0.22)" }}>
                      <DoorClosed className="w-5 h-5" style={{ color: "#a5b4fc" }} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold leading-tight" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>
                        {room.roomNumber}
                      </h3>
                      <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>{room.building}</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                    style={room.roomType === 'LAB' ? {
                      background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)", color: "#c4b5fd"
                    } : {
                      background: "rgba(79,70,229,0.12)", border: "1px solid rgba(79,70,229,0.25)", color: "#a5b4fc"
                    }}>
                    {room.roomType}
                  </span>
                </div>

                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span style={{ color: "var(--text-muted)" }}>Capacity:</span>
                    <span className="font-bold" style={{ color: "var(--text-primary)" }}>{room.capacity} seats</span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1.5">
                      <span style={{ color: "var(--text-muted)" }}>Utilization:</span>
                      <span className="font-semibold" style={{ color: "#a5b4fc" }}>
                        {room.currentUsagePercent || 0}% ({room.activeBookingsCount || 0} periods/wk)
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${room.currentUsagePercent || 0}%`,
                          background: (room.currentUsagePercent || 0) > 80
                            ? "linear-gradient(90deg, #ef4444 0%, #fca5a5 100%)"
                            : (room.currentUsagePercent || 0) > 50
                            ? "linear-gradient(90deg, #f59e0b 0%, #fcd34d 100%)"
                            : "linear-gradient(90deg, #4f46e5 0%, #818cf8 100%)",
                        }}
                      />
                    </div>
                  </div>

                  {room.equipment && room.equipment.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider block" style={{ color: "var(--text-faint)" }}>Equipment:</span>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {room.equipment.map((eq, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded text-[10px]"
                            style={{ background: "rgba(79,70,229,0.10)", color: "var(--text-secondary)", border: "1px solid rgba(79,70,229,0.18)" }}>
                            {eq}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {isAdmin && (
                <div className="flex items-center justify-end gap-1 pt-3 mt-3" style={{ borderTop: "1px solid rgba(79,70,229,0.12)" }}>
                  <button onClick={() => handleOpenEdit(room)} className="btn btn-ghost btn-sm" style={{ padding: "0.375rem 0.5rem" }} title="Edit">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(room._id)} className="btn btn-ghost btn-sm" style={{ padding: "0.375rem 0.5rem", color: "#fca5a5" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.10)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"} title="Delete">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-box glass-elevated max-w-md" style={{ padding: "1.5rem", borderRadius: "var(--r-2xl)" }}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingRoom ? 'Edit Room' : 'Add New Room / Lab'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Room Number</label>
                  <input
                    type="text"
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                    required
                    placeholder="LH-101"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="input-label">Building</label>
                  <input
                    type="text"
                    value={formData.building}
                    onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                    required
                    placeholder="Academic Block A"
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Seating Capacity</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    min={1}
                    max={500}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="input-label">Room Type</label>
                  <select
                    value={formData.roomType}
                    onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
                    className="input-field"
                  >
                    <option value="CLASSROOM">Classroom</option>
                    <option value="LAB">Laboratory</option>
                    <option value="SEMINAR_HALL">Seminar Hall</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="input-label">
                  Equipment (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.equipment}
                  onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                  placeholder="Projector, Smartboard, 60 Workstations"
                  className="input-field"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="availCheck"
                  checked={formData.available}
                  onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                  className="rounded bg-slate-900 border-slate-700 text-fuchsia-600 focus:ring-0"
                />
                <label htmlFor="availCheck" className="text-slate-300 cursor-pointer">
                  Room is currently active and available for scheduling
                </label>
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
                  {saving ? 'Saving...' : 'Save Facility'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomsPage;

