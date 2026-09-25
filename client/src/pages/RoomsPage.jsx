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
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            Campus Facilities
          </span>
          <h2 className="text-2xl font-bold text-white mt-0.5">Room & Lab Management</h2>
          <p className="text-xs text-slate-400">
            Monitor real-time capacity, equipment availability, and weekly utilization rates.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Facility</span>
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search room number or building..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400">Facility Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Facilities</option>
            <option value="CLASSROOM">Classrooms</option>
            <option value="LAB">Laboratories</option>
            <option value="SEMINAR_HALL">Seminar Halls</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-xs text-slate-400">Loading rooms...</div>
      ) : rooms.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-slate-800 space-y-3">
          <DoorClosed className="w-10 h-10 mx-auto text-slate-600" />
          <h4 className="text-sm font-semibold text-white">No Facilities Found</h4>
          <p className="text-xs text-slate-400">Add a new room or laboratory.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <div
              key={room._id}
              className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-indigo-400">
                      <DoorClosed className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white leading-tight">{room.roomNumber}</h3>
                      <span className="text-[11px] text-slate-400">{room.building}</span>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      room.roomType === 'LAB'
                        ? 'bg-purple-950 text-purple-300 border border-purple-500/30'
                        : 'bg-indigo-950 text-indigo-300 border border-indigo-500/30'
                    }`}
                  >
                    {room.roomType}
                  </span>
                </div>

                <div className="mt-3 space-y-2 text-xs text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Capacity:</span>
                    <span className="font-bold text-white">{room.capacity} Seats</span>
                  </div>

                  {/* Utilization Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Utilization Rate:</span>
                      <span className="font-semibold text-indigo-300">
                        {room.currentUsagePercent || 0}% ({room.activeBookingsCount || 0} periods/wk)
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          (room.currentUsagePercent || 0) > 80
                            ? 'bg-rose-500'
                            : (room.currentUsagePercent || 0) > 50
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${room.currentUsagePercent || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Equipment List */}
                  {room.equipment && room.equipment.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[10px] font-semibold text-slate-500 block uppercase">Equipment:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {room.equipment.map((eq, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-300 text-[10px]"
                          >
                            {eq}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {isAdmin && (
                <div className="flex items-center justify-end gap-1 pt-3 mt-3 border-t border-slate-800/80">
                  <button
                    onClick={() => handleOpenEdit(room)}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(room._id)}
                    className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl max-w-md w-full p-6 border border-slate-800 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
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
                  <label className="block text-slate-300 font-medium mb-1">Room Number</label>
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
                  <label className="block text-slate-300 font-medium mb-1">Building</label>
                  <input
                    type="text"
                    value={formData.building}
                    onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                    required
                    placeholder="Academic Block A"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Seating Capacity</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    min={1}
                    max={500}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Room Type</label>
                  <select
                    value={formData.roomType}
                    onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="CLASSROOM">Classroom</option>
                    <option value="LAB">Laboratory</option>
                    <option value="SEMINAR_HALL">Seminar Hall</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Equipment (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.equipment}
                  onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                  placeholder="Projector, Smartboard, 60 Workstations"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="availCheck"
                  checked={formData.available}
                  onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                  className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0"
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
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold shadow-lg shadow-indigo-600/30"
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
