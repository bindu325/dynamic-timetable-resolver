import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Layers,
  GraduationCap,
} from 'lucide-react';

const SubjectsPage = () => {
  const { isAdmin } = useAuth();
  const { success, error } = useToast();

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    department: 'CSE',
    credits: 4,
    weeklyHours: 4,
    type: 'THEORY',
    preferredRoomType: 'CLASSROOM',
  });
  const [saving, setSaving] = useState(false);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const params = {};
      if (typeFilter !== 'ALL') params.type = typeFilter;
      if (search) params.search = search;

      const res = await API.get('/subjects', { params });
      if (res.data.success) {
        setSubjects(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, [typeFilter, search]);

  const handleOpenAdd = () => {
    setEditingSubject(null);
    setFormData({
      name: '',
      code: `CS${Math.floor(100 + Math.random() * 899)}`,
      department: 'CSE',
      credits: 4,
      weeklyHours: 4,
      type: 'THEORY',
      preferredRoomType: 'CLASSROOM',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (sub) => {
    setEditingSubject(sub);
    setFormData({
      name: sub.name,
      code: sub.code,
      department: sub.department,
      credits: sub.credits,
      weeklyHours: sub.weeklyHours,
      type: sub.type,
      preferredRoomType: sub.preferredRoomType || 'CLASSROOM',
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingSubject) {
        await API.put(`/subjects/${editingSubject._id}`, formData);
        success('Subject updated successfully!');
      } else {
        await API.post('/subjects', formData);
        success('Subject created successfully!');
      }
      setShowModal(false);
      fetchSubjects();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save subject');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, force = false) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return;
    try {
      await API.delete(`/subjects/${id}${force ? '?force=true' : ''}`);
      success('Subject deleted successfully');
      fetchSubjects();
    } catch (err) {
      if (err.response?.status === 400 && !force) {
        if (window.confirm(`${err.response.data.message}\nDo you want to FORCE delete and clear scheduled slots for this subject?`)) {
          handleDelete(id, true);
        }
      } else {
        error(err.response?.data?.message || 'Failed to delete subject');
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
          <span className="section-eyebrow">Curriculum Courses</span>
          <h2 className="section-title mt-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Subject <span className="text-gradient-indigo">Management</span>
          </h2>
          <p className="section-desc mt-1">Define theory lectures, practical sessions, laboratory requirements, and credit hours.</p>
        </div>
        {isAdmin && (
          <button onClick={handleOpenAdd} className="btn btn-primary shrink-0 relative">
            <Plus className="w-4 h-4" />
            <span>Add Subject</span>
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="input-with-icon w-full sm:w-80">
          <Search className="input-icon" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search code, title, or department…" className="input-field" />
        </div>
        <div className="flex items-center gap-2">
          <label className="input-label" style={{ whiteSpace: "nowrap" }}>Course type:</label>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input-field" style={{ width: "auto" }}>
            <option value="ALL">All types</option>
            <option value="THEORY">Theory</option>
            <option value="LAB">Lab</option>
            <option value="PRACTICAL">Practical</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="spinner" /></div>
      ) : subjects.length === 0 ? (
        <div className="glass-card p-12 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(79,70,229,0.10)", border: "1px solid rgba(79,70,229,0.22)" }}>
            <BookOpen className="w-6 h-6" style={{ color: "#a5b4fc" }} />
          </div>
          <h4 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>No Subjects Found</h4>
          <p className="section-desc">Create a new subject course to begin scheduling.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((sub) => (
            <div
              key={sub._id}
              className="glass-card p-5 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="px-2.5 py-1 rounded text-xs font-bold font-mono bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-500/30">
                    {sub.code}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      sub.type === 'LAB'
                        ? 'bg-purple-950 text-purple-300 border border-purple-500/30'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {sub.type}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white mt-2">{sub.name}</h3>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 mt-4 pt-3 border-t border-slate-800/60">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Department</span>
                    <span className="text-slate-200 font-medium">{sub.department}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Credits</span>
                    <span className="text-slate-200 font-medium">{sub.credits} Credits</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Weekly Hours</span>
                    <span className="text-slate-200 font-medium">{sub.weeklyHours} hrs/wk</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Facility</span>
                    <span className="text-slate-200 font-medium">{sub.preferredRoomType}</span>
                  </div>
                </div>
              </div>

              {isAdmin && (
                <div className="flex items-center justify-end gap-1 pt-3 mt-3 border-t border-slate-800/80">
                  <button
                    onClick={() => handleOpenEdit(sub)}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(sub._id)}
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
        <div className="modal-backdrop">
          <div className="modal-box glass-elevated max-w-md" style={{ padding: "1.5rem", borderRadius: "var(--r-2xl)" }}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingSubject ? 'Edit Subject' : 'Add New Subject'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="input-label">Subject Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Data Structures & Algorithms"
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Course Code</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    required
                    placeholder="CS201"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
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
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Credits</label>
                  <input
                    type="number"
                    value={formData.credits}
                    onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })}
                    min={1}
                    max={10}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="input-label">Weekly Hours</label>
                  <input
                    type="number"
                    value={formData.weeklyHours}
                    onChange={(e) => setFormData({ ...formData, weeklyHours: Number(e.target.value) })}
                    min={1}
                    max={20}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Subject Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="input-field"
                  >
                    <option value="THEORY">Theory</option>
                    <option value="LAB">Lab</option>
                    <option value="PRACTICAL">Practical</option>
                  </select>
                </div>

                <div>
                  <label className="input-label">Preferred Room Type</label>
                  <select
                    value={formData.preferredRoomType}
                    onChange={(e) => setFormData({ ...formData, preferredRoomType: e.target.value })}
                    className="input-field"
                  >
                    <option value="CLASSROOM">Classroom</option>
                    <option value="LAB">Laboratory</option>
                    <option value="SEMINAR_HALL">Seminar Hall</option>
                  </select>
                </div>
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
                  {saving ? 'Saving...' : 'Save Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectsPage;

