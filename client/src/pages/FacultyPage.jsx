import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Mail,
  Shield,
  Building,
  CheckCircle2,
  Calendar,
  Clock,
  BookOpen,
} from 'lucide-react';

const DEPT_COLORS = {
  CSE:   { bg: "rgba(99,102,241,0.12)", border: "rgba(99,102,241,0.25)", color: "#a5b4fc" },
  ECE:   { bg: "rgba(16,185,129,0.10)", border: "rgba(16,185,129,0.22)", color: "#6ee7b7" },
  MECH:  { bg: "rgba(245,158,11,0.10)", border: "rgba(245,158,11,0.22)", color: "#fcd34d" },
  CIVIL: { bg: "rgba(239,68,68,0.10)",  border: "rgba(239,68,68,0.22)",  color: "#fca5a5" },
  EEE:   { bg: "rgba(6,182,212,0.10)",  border: "rgba(6,182,212,0.22)",  color: "#67e8f9" },
};

const getDeptStyle = (dept) => DEPT_COLORS[dept] || {
  bg: "rgba(79,70,229,0.10)",
  border: "rgba(79,70,229,0.20)",
  color: "#a5b4fc",
};

const FacultyPage = ({ onConfigureAvailability }) => {
  const { isAdmin } = useAuth();
  const { success, error } = useToast();

  const [faculties, setFaculties] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');

  const [showModal, setShowModal] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    employeeId: '',
    email: '',
    department: 'CSE',
    maxWeeklyHours: 20,
    subjects: [],
  });
  const [saving, setSaving] = useState(false);

  const fetchFaculties = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedDept !== 'ALL') params.department = selectedDept;
      if (search) params.search = search;
      const [facRes, subRes] = await Promise.all([
        API.get('/faculty', { params }),
        API.get('/subjects'),
      ]);
      if (facRes.data.success) setFaculties(facRes.data.data);
      if (subRes.data.success) setSubjects(subRes.data.data);
    } catch (err) {
      console.error('Error fetching faculty list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFaculties(); }, [selectedDept, search]);

  const handleOpenAdd = () => {
    setEditingFaculty(null);
    setFormData({
      name: '',
      employeeId: `FAC${Math.floor(100 + Math.random() * 900)}`,
      email: '',
      department: 'CSE',
      maxWeeklyHours: 20,
      subjects: [],
    });
    setShowModal(true);
  };

  const handleOpenEdit = (fac) => {
    setEditingFaculty(fac);
    setFormData({
      name: fac.name,
      employeeId: fac.employeeId,
      email: fac.email,
      department: fac.department,
      maxWeeklyHours: fac.maxWeeklyHours || 20,
      subjects: fac.subjects ? fac.subjects.map((s) => s._id || s) : [],
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingFaculty) {
        await API.put(`/faculty/${editingFaculty._id}`, formData);
        success('Faculty updated successfully!');
      } else {
        await API.post('/faculty', formData);
        success('Faculty member added!');
      }
      setShowModal(false);
      fetchFaculties();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save faculty');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, force = false) => {
    if (!window.confirm('Delete this faculty member?')) return;
    try {
      await API.delete(`/faculty/${id}${force ? '?force=true' : ''}`);
      success('Faculty deleted');
      fetchFaculties();
    } catch (err) {
      if (err.response?.status === 400 && !force) {
        if (
          window.confirm(
            `${err.response.data.message}\nDo you want to FORCE delete and remove associated class entries?`
          )
        ) {
          handleDelete(id, true);
        }
      } else {
        error(err.response?.data?.message || 'Failed to delete faculty');
      }
    }
  };

  return (
    <div className="space-y-5 panel-enter-3d">

      {/* Header */}
      <div className="app-card p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200/60">
                <Users className="w-3.5 h-3.5" />
                Teaching Faculty
              </span>
              <span className="text-xs text-slate-500 font-medium">Academic Staff Directory</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Faculty Management</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage instructors, track weekly workloads, assign subject disciplines, and configure availability matrices.
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={handleOpenAdd}
              className="btn-primary text-xs flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Faculty Member</span>
            </button>
          )}
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search faculty by name or ID..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all font-medium"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-600">Department:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            >
              <option value="ALL">All Departments</option>
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="MECH">MECH</option>
              <option value="CIVIL">CIVIL</option>
            </select>
          </div>
        </div>
      </div>

      {/* Faculty Cards */}
      {loading ? (
        <div className="app-card p-12 text-center text-xs text-slate-400">
          Loading faculty registry...
        </div>
      ) : faculties.length === 0 ? (
        <div className="app-card p-12 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
            <Users className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">No Faculty Members Found</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No instructors match the selected department or query. Add a new faculty member or clear filters.
          </p>
          {isAdmin && (
            <button
              onClick={handleOpenAdd}
              className="btn-primary text-xs"
            >
              Add New Faculty
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {faculties.map((fac) => (
            <div
              key={fac._id}
              className="app-card p-5 hover:border-teal-400 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200/60 flex items-center justify-center text-sm font-bold text-teal-700">
                    {fac.name.charAt(0)}
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    {fac.department}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900">{fac.name}</h3>
                <span className="text-[11px] text-slate-400 font-mono block mt-0.5">{fac.employeeId}</span>
                <span className="text-xs text-slate-500 block mt-1">{fac.email}</span>

                {/* Assigned Subjects */}
                <div className="mt-3.5 pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Assigned Subjects:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {fac.subjects && fac.subjects.length > 0 ? (
                      fac.subjects.map((sub) => (
                        <span
                          key={sub._id || sub}
                          className="px-2 py-0.5 rounded text-[10px] font-medium bg-teal-50 border border-teal-200/60 text-teal-800"
                        >
                          {sub.name || sub.code || sub}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">No subjects assigned</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-100 text-xs">
                <button
                  onClick={() => onConfigureAvailability?.(fac)}
                  className="text-teal-700 hover:text-teal-800 font-bold flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5 text-teal-600" />
                  <span>Availability</span>
                </button>

                {isAdmin && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(fac)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
                      title="Edit Faculty"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(fac._id)}
                      className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete Faculty"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
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
                {editingFaculty ? 'Edit Faculty Record' : 'Register New Faculty'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g. Dr. Jane Smith"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Employee ID</label>
                  <input
                    type="text"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    required
                    placeholder="FAC101"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  >
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="MECH">MECH</option>
                    <option value="CIVIL">CIVIL</option>
                    <option value="EEE">EEE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="jane.smith@institution.edu"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Max Weekly Hours</label>
                <input
                  type="number"
                  value={formData.maxWeeklyHours}
                  onChange={(e) => setFormData({ ...formData, maxWeeklyHours: Number(e.target.value) })}
                  min={1}
                  max={40}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
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
                  {saving ? 'Saving…' : 'Save Faculty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyPage;
