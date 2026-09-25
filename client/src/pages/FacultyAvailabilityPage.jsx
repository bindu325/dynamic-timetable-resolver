import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  UserCheck,
  Check,
  X,
  Star,
  Save,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SLOTS = [
  { startTime: '09:00', endTime: '10:00' },
  { startTime: '10:00', endTime: '11:00' },
  { startTime: '11:15', endTime: '12:15' },
  { startTime: '12:15', endTime: '13:15' },
  { startTime: '14:00', endTime: '15:00' },
  { startTime: '15:00', endTime: '16:00' },
];

const FacultyAvailabilityPage = ({ targetFacultyId }) => {
  const { user, isAdmin, isFaculty } = useAuth();
  const { success, error, warning } = useToast();

  const [faculties, setFaculties] = useState([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState(targetFacultyId || '');
  const [currentFaculty, setCurrentFaculty] = useState(null);
  const [availabilityMatrix, setAvailabilityMatrix] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchFaculties = async () => {
    try {
      const res = await API.get('/faculty');
      if (res.data.success) {
        setFaculties(res.data.data);
        const defaultId = targetFacultyId || (isFaculty && user.facultyId ? user.facultyId._id || user.facultyId : res.data.data[0]?._id);
        if (defaultId) setSelectedFacultyId(defaultId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculties();
  }, []);

  useEffect(() => {
    if (selectedFacultyId && faculties.length > 0) {
      const fac = faculties.find((f) => f._id === selectedFacultyId);
      if (fac) {
        setCurrentFaculty(fac);
        // Build initial matrix
        const matrix = {};
        DAYS.forEach((day) => {
          matrix[day] = {};
          SLOTS.forEach((slot) => {
            const key = `${slot.startTime}-${slot.endTime}`;
            const existing = fac.availability?.find(
              (a) => a.day === day && a.startTime === slot.startTime
            );
            matrix[day][key] = existing ? existing.status : 'AVAILABLE';
          });
        });
        setAvailabilityMatrix(matrix);
      }
    }
  }, [selectedFacultyId, faculties]);

  const toggleSlotStatus = (day, slotKey) => {
    setAvailabilityMatrix((prev) => {
      const current = prev[day]?.[slotKey] || 'AVAILABLE';
      let nextStatus = 'AVAILABLE';
      if (current === 'AVAILABLE') nextStatus = 'UNAVAILABLE';
      else if (current === 'UNAVAILABLE') nextStatus = 'PREFERRED';
      else if (current === 'PREFERRED') nextStatus = 'AVAILABLE';

      return {
        ...prev,
        [day]: {
          ...prev[day],
          [slotKey]: nextStatus,
        },
      };
    });
  };

  const handleSaveAvailability = async () => {
    if (!currentFaculty) return;
    setSaving(true);
    try {
      const updatedAvailabilityList = [];
      DAYS.forEach((day) => {
        SLOTS.forEach((slot) => {
          const key = `${slot.startTime}-${slot.endTime}`;
          const status = availabilityMatrix[day]?.[key] || 'AVAILABLE';
          if (status !== 'AVAILABLE') {
            updatedAvailabilityList.push({
              day,
              startTime: slot.startTime,
              endTime: slot.endTime,
              status,
            });
          }
        });
      });

      const res = await API.put(`/faculty/${currentFaculty._id}`, {
        availability: updatedAvailabilityList,
      });

      if (res.data.success) {
        success('Faculty availability preferences updated! Re-validating conflicts...');
        // Trigger background conflict check to alert if current timetable now collides
        await API.post('/conflicts/check');
      }
    } catch (err) {
      error('Failed to save availability preferences');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            Faculty Workload & Preferences
          </span>
          <h2 className="text-2xl font-bold text-white mt-0.5">
            Weekly Availability Matrix
          </h2>
          <p className="text-xs text-slate-400">
            Configure preferred working hours and mark unavailable slots to prevent collision.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Faculty Selector (Admin only or switcher) */}
          {isAdmin && (
            <select
              value={selectedFacultyId}
              onChange={(e) => setSelectedFacultyId(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              {faculties.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.name} ({f.department})
                </option>
              ))}
            </select>
          )}

          <button
            onClick={handleSaveAvailability}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Availability'}</span>
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="glass-card px-5 py-3 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        <span className="text-slate-400 font-medium">Click any time cell to toggle state:</span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Check className="w-2.5 h-2.5" />
            </div>
            <span className="text-slate-300">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <X className="w-2.5 h-2.5" />
            </div>
            <span className="text-slate-300">Unavailable (Hard Constraint)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Star className="w-2.5 h-2.5" />
            </div>
            <span className="text-slate-300">Preferred (Optimizer Boost)</span>
          </div>
        </div>
      </div>

      {/* Visual Availability Matrix Grid */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 text-xs font-semibold">
                <th className="p-4 text-left">Day / Time Slot</th>
                {SLOTS.map((slot) => (
                  <th key={slot.startTime} className="p-4 border-l border-slate-800">
                    {slot.startTime} - {slot.endTime}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {DAYS.map((day) => (
                <tr key={day} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-4 text-left font-bold text-indigo-300 bg-slate-900/50">
                    {day}
                  </td>
                  {SLOTS.map((slot) => {
                    const key = `${slot.startTime}-${slot.endTime}`;
                    const status = availabilityMatrix[day]?.[key] || 'AVAILABLE';
                    return (
                      <td key={key} className="p-2.5 border-l border-slate-800/60">
                        <button
                          type="button"
                          onClick={() => toggleSlotStatus(day, key)}
                          className={`w-full py-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                            status === 'UNAVAILABLE'
                              ? 'bg-rose-950/40 border-rose-500/40 text-rose-300 shadow-md shadow-rose-950/30'
                              : status === 'PREFERRED'
                              ? 'bg-amber-950/40 border-amber-500/40 text-amber-300 shadow-md shadow-amber-950/30'
                              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          {status === 'UNAVAILABLE' && (
                            <>
                              <X className="w-4 h-4 text-rose-400" />
                              <span className="text-[10px] font-bold">UNAVAILABLE</span>
                            </>
                          )}
                          {status === 'PREFERRED' && (
                            <>
                              <Star className="w-4 h-4 text-amber-400" />
                              <span className="text-[10px] font-bold">PREFERRED</span>
                            </>
                          )}
                          {status === 'AVAILABLE' && (
                            <>
                              <Check className="w-4 h-4 text-emerald-400 opacity-60" />
                              <span className="text-[10px] opacity-70">AVAILABLE</span>
                            </>
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FacultyAvailabilityPage;
