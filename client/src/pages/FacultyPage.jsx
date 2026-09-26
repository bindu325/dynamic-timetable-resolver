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
  ShieldCheck,
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
        if (window.confirm(`${err.response.data.message}\nForce delete and remove associated entries?`)) {
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
      <div className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 overflow-hidden">
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            width: "30%",
            height: "200%",
            background: "radial-gradient(ellipse at 80% 50%, rgba(79,70,229,0.06) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div className="relative">
          <span className="section-eyebrow">Faculty Directory</span>
          <h2
            className="section-title mt-1"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Faculty <span className="text-gradient-indigo">Management</span>
          </h2>
          <p className="section-desc mt-1">
            Manage teaching staff, assignments, workload targets, and availability.
          </p>
        </div>
        {isAdmin && (
          <button onClick={handleOpenAdd} className="btn btn-primary shrink-0 relative">
            <Plus className="w-4 h-4" />
            <span>Add Faculty</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="input-with-icon w-full sm:w-80">
          <Search className="input-icon" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, ID, or email…"
            className="input-field"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="input-label" style={{ whiteSpace: "nowrap" }}>Department:</label>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="input-field"
            style={{ width: "auto" }}
          >
            <option value="ALL">All</option>
            <option value="CSE">CSE</option>
            <option value="ECE">ECE</option>
            <option value="MECH">MECH</option>
            <option value="CIVIL">CIVIL</option>
            <option value="EEE">EEE</option>
          </select>
        </div>
      </div>

      {/* Faculty Cards */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="spinner" />
        </div>
      ) : faculties.length === 0 ? (
        <div className="glass-card p-12 text-center space-y-3">
          <Users className="w-8 h-8 mx-auto" style={{ color: "var(--text-faint)" }} />
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            No Faculty Found
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Try adjusting your search or filter.
          </p>
          {isAdmin && (
            <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
              Add Faculty
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {faculties.map((fac) => {
            const deptStyle = getDeptStyle(fac.department);
            return (
              <div key={fac._id} className="card-3d p-5 flex flex-col justify-between">
                <div>
                  {/* Card Top */}
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                      style={{
                        background: deptStyle.bg,
                        border: `1px solid ${deptStyle.border}`,
                        color: deptStyle.color,
                        fontFamily: "'Space Grotesk', sans-serif",
                        boxShadow: `0 2px 8px ${deptStyle.bg}`,
                      }}
                    >
                      {fac.name.charAt(0).toUpperCase()}
                    </div>
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                      style={{
                        background: deptStyle.bg,
                        border: `1px solid ${deptStyle.border}`,
                        color: deptStyle.color,
                      }}
                    >
                      {fac.department}
                    </span>
                  </div>

                  <h3
                    className="text-sm font-bold leading-tight"
                    style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {fac.name}
                  </h3>
                  <span
                    className="text-[11px] block mt-0.5"
                    style={{ color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {fac.employeeId}
                  </span>
                  <span
                    className="text-xs block mt-0.5"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {fac.email}
                  </span>

                  {/* Subjects */}
                  <div className="mt-4">
                    <span
                      className="text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: "var(--text-faint)" }}
                    >
                      Assigned subjects
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {fac.subjects && fac.subjects.length > 0 ? (
                        fac.subjects.map((sub) => (
                          <span key={sub._id || sub} className="badge badge-accent">
                            {sub.code || sub.name || 'Subject'}
                          </span>
                        ))
                      ) : (
                        <span
                          className="text-[11px] italic"
                          style={{ color: "var(--text-faint)" }}
                        >
                          No subjects assigned
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div
                  className="flex items-center justify-between pt-4 mt-4"
                  style={{ borderTop: "1px solid rgba(79,70,229,0.12)" }}
                >
                  <button
                    onClick={() => onConfigureAvailability?.(fac)}
                    className="btn btn-ghost btn-sm"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Availability</span>
                  </button>
                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(fac)}
                        className="btn btn-ghost btn-sm"
                        title="Edit"
                        style={{ padding: "0.375rem 0.5rem" }}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(fac._id)}
                        className="btn btn-ghost btn-sm"
                        title="Delete"
                        style={{ padding: "0.375rem 0.5rem", color: "#fca5a5" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.10)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div
            className="modal-box glass-elevated max-w-md"
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
                {editingFaculty ? 'Edit Faculty Member' : 'Add Faculty Member'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-ghost"
                style={{ padding: "0.375rem" }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="input-label">Full name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Dr. John Doe"
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Employee ID</label>
                  <input
                    type="text"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    required
                    placeholder="FAC101"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="input-label">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="input-field"
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
                <label className="input-label">Email address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="john.doe@college.edu"
                  className="input-field"
                />
              </div>

              <div>
                <label className="input-label">Max weekly hours</label>
                <input
                  type="number"
                  value={formData.maxWeeklyHours}
                  onChange={(e) => setFormData({ ...formData, maxWeeklyHours: Number(e.target.value) })}
                  min={1}
                  max={40}
                  className="input-field"
                />
              </div>

              <div
                className="flex items-center justify-end gap-2 pt-4"
                style={{ borderTop: "1px solid rgba(79,70,229,0.15)" }}
              >
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary btn-sm"
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
