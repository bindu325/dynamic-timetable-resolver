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
          <span className="section-eyebrow">Faculty Workload & Preferences</span>
          <h2 className="section-title mt-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Weekly <span className="text-gradient-indigo">Availability Matrix</span>
          </h2>
          <p className="section-desc mt-1">Configure preferred working hours and mark unavailable slots to prevent collision.</p>
        </div>

        <div className="flex items-center gap-3 relative">
          {isAdmin && (
            <select
              value={selectedFacultyId}
              onChange={(e) => setSelectedFacultyId(e.target.value)}
              className="input-field"
              style={{ width: "auto", minWidth: "200px" }}
            >
              {faculties.map((f) => (
                <option key={f._id} value={f._id}>{f.name} ({f.department})</option>
              ))}
            </select>
          )}
          <button
            onClick={handleSaveAvailability}
            disabled={saving}
            className="btn btn-primary"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving…' : 'Save Availability'}</span>
          </button>
        </div>
      </div>

      {/* Legend */}
      <div
        className="glass-card px-5 py-3 rounded-xl flex flex-wrap items-center justify-between gap-4 text-xs"
        style={{ borderColor: "rgba(79,70,229,0.18)" }}
      >
        <span style={{ color: "var(--text-secondary)" }} className="font-medium">Click any time cell to toggle state:</span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded flex items-center justify-center"
              style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.35)" }}>
              <Check className="w-2.5 h-2.5" style={{ color: "#6ee7b7" }} />
            </div>
            <span style={{ color: "var(--text-secondary)" }}>Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded flex items-center justify-center"
              style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.35)" }}>
              <X className="w-2.5 h-2.5" style={{ color: "#fca5a5" }} />
            </div>
            <span style={{ color: "var(--text-secondary)" }}>Unavailable (Hard constraint)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded flex items-center justify-center"
              style={{ background: "rgba(79,70,229,0.15)", border: "1px solid rgba(79,70,229,0.35)" }}>
              <Star className="w-2.5 h-2.5" style={{ color: "#a5b4fc" }} />
            </div>
            <span style={{ color: "var(--text-secondary)" }}>Preferred (Optimizer boost)</span>
          </div>
        </div>
      </div>

      {/* Visual Availability Matrix Grid */}
      <div
        className="glass-card overflow-hidden"
        style={{ borderRadius: "var(--r-xl)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse min-w-[700px]">
            <thead>
              <tr
                style={{
                  background: "rgba(10,18,40,0.90)",
                  borderBottom: "1px solid rgba(79,70,229,0.18)",
                }}
              >
                <th
                  className="p-4 text-left text-xs font-bold"
                  style={{ color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}
                >
                  Day / Time Slot
                </th>
                {SLOTS.map((slot) => (
                  <th key={slot.startTime} className="p-4 text-xs font-semibold"
                    style={{ borderLeft: "1px solid rgba(79,70,229,0.10)", color: "var(--text-secondary)" }}>
                    {slot.startTime} - {slot.endTime}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-xs">
              {DAYS.map((day, rowIdx) => (
                <tr key={day}
                  style={{ borderBottom: "1px solid rgba(79,70,229,0.08)",
                    background: rowIdx % 2 === 0 ? "rgba(22,34,64,0.30)" : "rgba(10,18,40,0.30)" }}>
                  <td
                    className="p-4 text-left font-bold"
                    style={{ color: "#a5b4fc", background: rowIdx % 2 === 0 ? "rgba(10,18,40,0.90)" : "rgba(7,13,30,0.92)",
                      borderRight: "1px solid rgba(79,70,229,0.12)", fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {day}
                  </td>
                  {SLOTS.map((slot) => {
                    const key = `${slot.startTime}-${slot.endTime}`;
                    const status = availabilityMatrix[day]?.[key] || 'AVAILABLE';
                    return (
                      <td key={key} className="p-2" style={{ borderLeft: "1px solid rgba(79,70,229,0.08)" }}>
                        <button
                          type="button"
                          onClick={() => toggleSlotStatus(day, key)}
                          className="w-full py-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all"
                          style={status === 'UNAVAILABLE' ? {
                            background: "rgba(239,68,68,0.12)", borderColor: "rgba(239,68,68,0.40)", color: "#fca5a5"
                          } : status === 'PREFERRED' ? {
                            background: "rgba(79,70,229,0.15)", borderColor: "rgba(79,70,229,0.45)", color: "#a5b4fc"
                          } : {
                            background: "rgba(10,18,40,0.50)", borderColor: "rgba(79,70,229,0.12)", color: "var(--text-faint)"
                          }}
                        >
                          {status === 'UNAVAILABLE' && (
                            <><X className="w-4 h-4" style={{ color: "#fca5a5" }} />
                              <span className="text-[10px] font-bold">UNAVAILABLE</span></>
                          )}
                          {status === 'PREFERRED' && (
                            <><Star className="w-4 h-4" style={{ color: "#a5b4fc" }} />
                              <span className="text-[10px] font-bold">PREFERRED</span></>
                          )}
                          {status === 'AVAILABLE' && (
                            <><Check className="w-4 h-4 opacity-50" style={{ color: "#6ee7b7" }} />
                              <span className="text-[10px] opacity-60">AVAILABLE</span></>
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

