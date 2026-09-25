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
  Clock,
  Building,
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
        if (
          window.confirm(
            `${err.response.data.message}\nDo you want to FORCE delete and clear scheduled slots for this subject?`
          )
        ) {
          handleDelete(id, true);
        }
      } else {
        error(err.response?.data?.message || 'Failed to delete subject');
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
                <BookOpen className="w-3.5 h-3.5" />
                Academic Courses
              </span>
              <span className="text-xs text-slate-500 font-medium">Curriculum Registry</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Subject Management</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure course offerings, theory vs lab requirements, credit weighting, and weekly load.
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={handleOpenAdd}
              className="btn-primary text-xs flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Subject</span>
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
              placeholder="Search code or subject title..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all font-medium"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-600">Course Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            >
              <option value="ALL">All Course Types</option>
              <option value="THEORY">Theory</option>
              <option value="LAB">Lab</option>
              <option value="PRACTICAL">Practical</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="app-card p-12 text-center text-xs text-slate-400">Loading course curriculum...</div>
      ) : subjects.length === 0 ? (
        <div className="app-card p-12 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">No Subjects Found</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No courses match the search query or course type filter.
          </p>
          {isAdmin && (
            <button
              onClick={handleOpenAdd}
              className="btn-primary text-xs"
            >
              Add New Subject
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((sub) => (
            <div
              key={sub._id}
              className="app-card p-5 hover:border-teal-400 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="px-2.5 py-1 rounded text-xs font-bold font-mono bg-teal-50 text-teal-800 border border-teal-200/60">
                    {sub.code}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      sub.type === 'LAB'
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {sub.type}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mt-2">{sub.name}</h3>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mt-3 pt-3 border-t border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-medium">Department</span>
                    <span className="text-slate-800 font-bold">{sub.department}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-medium">Credits</span>
                    <span className="text-slate-800 font-bold">{sub.credits} Credits</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-medium">Weekly Hours</span>
                    <span className="text-slate-800 font-bold">{sub.weeklyHours} hrs/wk</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-medium">Facility Req</span>
                    <span className="text-teal-700 font-medium">{sub.preferredRoomType}</span>
                  </div>
                </div>
              </div>

              {isAdmin && (
                <div className="flex items-center justify-end gap-1 pt-3 mt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleOpenEdit(sub)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
                    title="Edit Subject"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(sub._id)}
                    className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Delete Subject"
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
                {editingSubject ? 'Edit Subject Course' : 'Create New Course'}
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
                <label className="block text-slate-700 font-semibold mb-1">Subject Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g. Data Structures & Algorithms"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Course Code</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    required
                    placeholder="CS201"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-mono font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
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
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Credits</label>
                  <input
                    type="number"
                    value={formData.credits}
                    onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })}
                    min={1}
                    max={10}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Weekly Hours</label>
                  <input
                    type="number"
                    value={formData.weeklyHours}
                    onChange={(e) => setFormData({ ...formData, weeklyHours: Number(e.target.value) })}
                    min={1}
                    max={20}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Subject Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  >
                    <option value="THEORY">Theory</option>
                    <option value="LAB">Lab</option>
                    <option value="PRACTICAL">Practical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Preferred Room Type</label>
                  <select
                    value={formData.preferredRoomType}
                    onChange={(e) => setFormData({ ...formData, preferredRoomType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  >
                    <option value="CLASSROOM">Classroom</option>
                    <option value="LAB">Laboratory</option>
                    <option value="SEMINAR_HALL">Seminar Hall</option>
                  </select>
                </div>
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
