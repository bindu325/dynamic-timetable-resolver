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
  Calendar,
  User,
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
        const defaultId =
          targetFacultyId ||
          (isFaculty && user?.facultyId ? user.facultyId._id || user.facultyId : res.data.data[0]?._id);
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
        success('Faculty availability preferences updated!');
        try {
          await API.post('/conflicts/check');
        } catch (checkErr) {
          console.warn('Conflict re-scan notice:', checkErr);
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to save availability preferences';
      error(msg);
    } finally {
      setSaving(false);
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
                <UserCheck className="w-3.5 h-3.5" />
                Faculty Working Preferences
              </span>
              <span className="text-xs text-slate-500 font-medium">Weekly Shift Constraints</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Faculty Availability Matrix
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Set availability preferences per faculty member. The resolver strictly respects "Unavailable" hard constraints.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isAdmin && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" />
                <select
                  value={selectedFacultyId}
                  onChange={(e) => setSelectedFacultyId(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                >
                  {faculties.map((f) => (
                    <option key={f._id} value={f._id}>
                      {f.name} ({f.department})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={handleSaveAvailability}
              disabled={saving}
              className="btn-primary text-xs flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Availability'}</span>
            </button>
          </div>
        </div>

        {/* Legend Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 text-xs">
          <span className="text-slate-600 font-medium">Click any time cell to cycle through status:</span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500">
                <Check className="w-2.5 h-2.5" />
              </div>
              <span className="text-slate-700 font-medium">Available (Default)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700">
                <X className="w-2.5 h-2.5" />
              </div>
              <span className="text-slate-700 font-medium">Unavailable (Hard Constraint)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                <Star className="w-2.5 h-2.5" />
              </div>
              <span className="text-slate-700 font-medium">Preferred (Optimizer Boost)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Availability Matrix Grid */}
      <div className="app-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse min-w-[760px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 text-xs font-semibold">
                <th className="p-4 text-left w-32 bg-slate-100/90 text-slate-700 font-bold border-r border-slate-200">
                  Day / Time Slot
                </th>
                {SLOTS.map((slot) => (
                  <th key={slot.startTime} className="p-3.5 border-l border-slate-200 first:border-l-0">
                    <span className="block text-slate-800 font-bold">{slot.startTime} - {slot.endTime}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {DAYS.map((day) => (
                <tr key={day} className="hover:bg-slate-50/40 transition-colors">
                  <td className="p-4 text-left font-bold text-slate-900 bg-slate-50/90 border-r border-slate-200">
                    {day}
                  </td>
                  {SLOTS.map((slot) => {
                    const key = `${slot.startTime}-${slot.endTime}`;
                    const status = availabilityMatrix[day]?.[key] || 'AVAILABLE';
                    return (
                      <td key={key} className="p-2 border-l border-slate-100">
                        <button
                          type="button"
                          onClick={() => toggleSlotStatus(day, key)}
                          className={`w-full py-3 px-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                            status === 'UNAVAILABLE'
                              ? 'bg-rose-50 border-rose-200 text-rose-800 shadow-xs'
                              : status === 'PREFERRED'
                              ? 'bg-amber-50 border-amber-200 text-amber-800 shadow-xs'
                              : 'bg-white border-slate-200/90 text-slate-500 hover:border-teal-400 hover:bg-teal-50/20'
                          }`}
                        >
                          {status === 'UNAVAILABLE' && (
                            <>
                              <X className="w-4 h-4 text-rose-600" />
                              <span className="text-[10px] font-bold tracking-wider">UNAVAILABLE</span>
                            </>
                          )}
                          {status === 'PREFERRED' && (
                            <>
                              <Star className="w-4 h-4 text-amber-600 fill-amber-500" />
                              <span className="text-[10px] font-bold tracking-wider">PREFERRED</span>
                            </>
                          )}
                          {status === 'AVAILABLE' && (
                            <>
                              <Check className="w-4 h-4 text-emerald-600" />
                              <span className="text-[10px] font-medium text-slate-600">AVAILABLE</span>
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

