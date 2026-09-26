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
      equipment: Array.isArray(r.equipment) ? r.equipment.join(', ') : r.equipment || '',
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
        equipment:
          typeof formData.equipment === 'string'
            ? formData.equipment
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
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
        if (
          window.confirm(
            `${err.response.data.message}\nDo you want to FORCE delete and clear bookings for this room?`
          )
        ) {
          handleDelete(id, true);
        }
      } else {
        error(err.response?.data?.message || 'Failed to delete room');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="app-card p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200/60">
                <DoorClosed className="w-3.5 h-3.5" />
                Campus Facilities
              </span>
              <span className="text-xs text-slate-500 font-medium">Classrooms & Laboratories</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Room & Lab Management</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Monitor seating capacities, track weekly utilization percentages, and configure hardware equipment.
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={handleOpenAdd}
              className="btn-primary text-xs flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Facility</span>
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search room number or building..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all font-medium"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-600">Facility Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            >
              <option value="ALL">All Facilities</option>
              <option value="CLASSROOM">Classrooms</option>
              <option value="LAB">Laboratories</option>
              <option value="SEMINAR_HALL">Seminar Halls</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="app-card p-12 text-center text-xs text-slate-400">Loading campus facilities...</div>
      ) : rooms.length === 0 ? (
        <div className="app-card p-12 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
            <DoorClosed className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">No Facilities Found</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No rooms match the query or type filter. Add a new room or laboratory.
          </p>
          {isAdmin && (
            <button
              onClick={handleOpenAdd}
              className="btn-primary text-xs"
            >
              Add Facility
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <div
              key={room._id}
              className="app-card p-5 hover:border-teal-400 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200/60 flex items-center justify-center text-teal-700">
                      <DoorClosed className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-tight">{room.roomNumber}</h3>
                      <span className="text-[11px] text-slate-400">{room.building}</span>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      room.roomType === 'LAB'
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : 'bg-teal-50 text-teal-700 border-teal-200/60'
                    }`}
                  >
                    {room.roomType}
                  </span>
                </div>

                <div className="mt-3 space-y-2.5 text-xs text-slate-600 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Seating Capacity:</span>
                    <span className="font-bold text-slate-900">{room.capacity} Seats</span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-slate-400 font-medium">Weekly Utilization:</span>
                      <span className="font-bold text-teal-700">
                        {room.currentUsagePercent || 0}% ({room.activeBookingsCount || 0} periods/wk)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          (room.currentUsagePercent || 0) > 80
                            ? 'bg-rose-500'
                            : (room.currentUsagePercent || 0) > 50
                            ? 'bg-amber-500'
                            : 'bg-teal-600'
                        }`}
                        style={{ width: `${room.currentUsagePercent || 0}%` }}
                      />
                    </div>
                  </div>

                  {room.equipment && room.equipment.length > 0 && (
                    <div className="pt-1">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-1">
                        Equipment / Assets:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {room.equipment.map((eq, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200/80 text-slate-700 text-[10px] font-medium"
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
                <div className="flex items-center justify-end gap-1 pt-3 mt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleOpenEdit(room)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
                    title="Edit Facility"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(room._id)}
                    className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Delete Facility"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingRoom ? 'Edit Room Record' : 'Register New Room / Lab'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Room Number</label>
                  <input
                    type="text"
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                    required
                    placeholder="LH-101"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-mono font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Building</label>
                  <input
                    type="text"
                    value={formData.building}
                    onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                    required
                    placeholder="Academic Block A"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Seating Capacity</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    min={1}
                    max={500}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Room Type</label>
                  <select
                    value={formData.roomType}
                    onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  >
                    <option value="CLASSROOM">Classroom</option>
                    <option value="LAB">Laboratory</option>
                    <option value="SEMINAR_HALL">Seminar Hall</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Equipment / Assets (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.equipment}
                  onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                  placeholder="Projector, Smartboard, 60 Workstations"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="availCheck"
                  checked={formData.available}
                  onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <label htmlFor="availCheck" className="text-slate-700 font-medium cursor-pointer">
                  Room is currently active and available for scheduling
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary text-xs"
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

