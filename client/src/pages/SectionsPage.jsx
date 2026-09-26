import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  GraduationCap,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Users,
} from 'lucide-react';

const SectionsPage = () => {
  const { isAdmin } = useAuth();
  const { success, error } = useToast();

  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');

  const [showModal, setShowModal] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    department: 'CSE',
    year: 3,
    semester: 5,
    studentCount: 60,
    academicYear: '2025-2026',
  });
  const [saving, setSaving] = useState(false);

  const fetchSections = async () => {
    setLoading(true);
    try {
      const params = {};
      if (deptFilter !== 'ALL') params.department = deptFilter;
      if (search) params.search = search;

      const res = await API.get('/sections', { params });
      if (res.data.success) {
        setSections(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, [deptFilter, search]);

  const handleOpenAdd = () => {
    setEditingSection(null);
    setFormData({
      name: '',
      department: 'CSE',
      year: 3,
      semester: 5,
      studentCount: 60,
      academicYear: '2025-2026',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (s) => {
    setEditingSection(s);
    setFormData({
      name: s.name,
      department: s.department,
      year: s.year,
      semester: s.semester,
      studentCount: s.studentCount,
      academicYear: s.academicYear,
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingSection) {
        await API.put(`/sections/${editingSection._id}`, formData);
        success('Section updated successfully!');
      } else {
        await API.post('/sections', formData);
        success('Section created successfully!');
      }
      setShowModal(false);
      fetchSections();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save section');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, force = false) => {
    if (!window.confirm('Are you sure you want to delete this section?')) return;
    try {
      await API.delete(`/sections/${id}${force ? '?force=true' : ''}`);
      success('Section deleted successfully');
      fetchSections();
    } catch (err) {
      if (err.response?.status === 400 && !force) {
        if (window.confirm(`${err.response.data.message}\nDo you want to FORCE delete and clear its scheduled periods?`)) {
          handleDelete(id, true);
        }
      } else {
        error(err.response?.data?.message || 'Failed to delete section');
      }
    }
  };

  return (
    <div className="space-y-5 panel-enter-3d">
      {/* Header */}
      <div
        className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 overflow-hidden"
        style={{ background: "linear-gradient(135deg, rgba(22,34,64,0.80) 0%, rgba(10,18,40,0.90) 100%)" }}
      >
        <div
          style={{ position: "absolute", right: 0, top: 0, width: "30%", height: "200%",
            background: "radial-gradient(ellipse at 80% 50%, rgba(79,70,229,0.06) 0%, transparent 70%)", pointerEvents: "none" }}
        />
        <div className="relative">
          <span className="section-eyebrow">Student Cohorts</span>
          <h2 className="section-title mt-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Section <span className="text-gradient-indigo">Management</span>
          </h2>
          <p className="section-desc mt-1">Manage student sections, enrolled capacities, academic years, and semesters.</p>
        </div>
        {isAdmin && (
          <button onClick={handleOpenAdd} className="btn btn-primary shrink-0 relative">
            <Plus className="w-4 h-4" />
            <span>Add Section</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="input-with-icon w-full sm:w-80">
          <Search className="input-icon" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search section name or department…" className="input-field" />
        </div>
        <div className="flex items-center gap-2">
          <label className="input-label" style={{ whiteSpace: "nowrap" }}>Department:</label>
          <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="input-field" style={{ width: "auto" }}>
            <option value="ALL">All departments</option>
            <option value="CSE">CSE</option>
            <option value="ECE">ECE</option>
            <option value="MECH">MECH</option>
            <option value="CIVIL">CIVIL</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="spinner" /></div>
      ) : sections.length === 0 ? (
        <div className="glass-card p-12 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(79,70,229,0.10)", border: "1px solid rgba(79,70,229,0.22)" }}>
            <GraduationCap className="w-6 h-6" style={{ color: "#a5b4fc" }} />
          </div>
          <h4 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>No Sections Found</h4>
          <p className="section-desc">Add a new section to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((sec) => (
            <div key={sec._id} className="card-3d p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "rgba(79,70,229,0.12)", border: "1px solid rgba(79,70,229,0.22)" }}>
                    <GraduationCap className="w-4 h-4" style={{ color: "#a5b4fc" }} />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                    style={{ background: "rgba(79,70,229,0.12)", border: "1px solid rgba(79,70,229,0.25)", color: "#a5b4fc" }}>
                    {sec.department}
                  </span>
                </div>
                <h3 className="text-base font-bold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>
                  {sec.name}
                </h3>
                <div className="space-y-1.5 text-xs mt-3">
                  {[{label: "Year / Semester", value: `Year ${sec.year} (Sem ${sec.semester})`, color: "var(--text-primary)"},
                    {label: "Enrolled students", value: `${sec.studentCount} students`, color: "#6ee7b7"},
                    {label: "Academic year", value: sec.academicYear, color: "var(--text-secondary)"},
                  ].map(({label, value, color}) => (
                    <div key={label} className="flex items-center justify-between">
                      <span style={{ color: "var(--text-muted)" }}>{label}:</span>
                      <span className="font-medium" style={{ color }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              {isAdmin && (
                <div className="flex items-center justify-end gap-1 pt-4 mt-4" style={{ borderTop: "1px solid rgba(79,70,229,0.12)" }}>
                  <button onClick={() => handleOpenEdit(sec)} className="btn btn-ghost btn-sm" style={{ padding: "0.375rem 0.5rem" }} title="Edit">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(sec._id)} className="btn btn-ghost btn-sm" style={{ padding: "0.375rem 0.5rem", color: "#fca5a5" }}
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
          <div className="modal-box glass-elevated max-w-md" style={{ padding: "1.75rem", borderRadius: "var(--r-2xl)" }}>
            <div className="flex items-center justify-between pb-4 mb-4" style={{ borderBottom: "1px solid rgba(79,70,229,0.15)" }}>
              <h3 className="text-base font-bold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>
                {editingSection ? 'Edit Section' : 'Add New Section'}
              </h3>
              <button onClick={() => setShowModal(false)} className="btn btn-ghost" style={{ padding: "0.375rem" }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Section name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required placeholder="CSE-A" className="input-field" />
                </div>
                <div>
                  <label className="input-label">Department</label>
                  <select value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="input-field">
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="MECH">MECH</option>
                    <option value="CIVIL">CIVIL</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Year</label>
                  <input type="number" value={formData.year} onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })} min={1} max={5} className="input-field" />
                </div>
                <div>
                  <label className="input-label">Semester</label>
                  <input type="number" value={formData.semester} onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })} min={1} max={10} className="input-field" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Student count</label>
                  <input type="number" value={formData.studentCount} onChange={(e) => setFormData({ ...formData, studentCount: Number(e.target.value) })} min={1} className="input-field" />
                </div>
                <div>
                  <label className="input-label">Academic year</label>
                  <input type="text" value={formData.academicYear} onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })} placeholder="2025-2026" className="input-field" />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-4" style={{ borderTop: "1px solid rgba(79,70,229,0.15)" }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary btn-sm">Cancel</button>
                <button type="submit" disabled={saving} className="btn btn-primary btn-sm">{saving ? 'Saving…' : 'Save Section'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionsPage;

