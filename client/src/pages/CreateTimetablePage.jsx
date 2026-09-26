import React, { useState } from 'react';
import {
  Sparkles,
  Users,
  DoorClosed,
  UserCheck,
  Clock,
  ArrowRight,
  Settings2,
  BookOpen,
  Building,
  CalendarDays,
  ChevronRight,
} from 'lucide-react';
import API from '../services/api';
import { useToast } from '../context/ToastContext';

const CreateTimetablePage = ({ setActiveTab }) => {
  const { success, error } = useToast();

  const [formData, setFormData] = useState({
    studentCount: 1500,
    facultyCount: 120,
    facultyNames: 'Dr. Smith, Prof. Johnson, Dr. Williams',
    classroomCount: 45,
    classroomNumbers: 'CR-101, CR-102, LAB-01',
    blockCount: 4,
    subjectCount: 24,
    subjectNames: 'Data Structures, Operating Systems, Computer Networks',
    departmentList: 'ACSE, CSE, ECE, EEE, MECH, CIVIL',
    workingDays: 'Monday, Tuesday, Wednesday, Thursday, Friday, Saturday',
    periodsPerDay: 6,
    maxFacultyWorkload: 20,
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const res = await API.post('/timetable/generate', formData);
      if (res.data.success) {
        success('Timetable successfully generated and deployed!');
        setActiveTab('timetable');
      } else {
        error(res.data.message || 'Failed to generate timetable');
      }
    } catch (err) {
      console.error('Generation error:', err);
      error(err.response?.data?.message || 'An error occurred during generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  const sections = [
    {
      title: "Population Data",
      icon: Users,
      iconColor: "#a5b4fc",
      fields: [
        {
          type: "grid",
          cols: 2,
          items: [
            { label: "Total students", name: "studentCount", inputType: "number", icon: Users },
            { label: "Total faculty", name: "facultyCount", inputType: "number", icon: UserCheck },
          ],
        },
        { label: "Faculty identifiers (CSV)", name: "facultyNames", inputType: "textarea" },
        { label: "Departments (CSV)", name: "departmentList", inputType: "textarea" },
      ],
    },
    {
      title: "Academic Curriculum",
      icon: BookOpen,
      iconColor: "#6ee7b7",
      fields: [
        { label: "Number of subjects", name: "subjectCount", inputType: "number", icon: BookOpen },
        { label: "Subject names (CSV)", name: "subjectNames", inputType: "textarea" },
      ],
    },
    {
      title: "Infrastructure Data",
      icon: DoorClosed,
      iconColor: "#fcd34d",
      fields: [
        {
          type: "grid",
          cols: 2,
          items: [
            { label: "Classrooms", name: "classroomCount", inputType: "number" },
            { label: "Campus blocks", name: "blockCount", inputType: "number", icon: Building },
          ],
        },
        { label: "Classroom identifiers (CSV)", name: "classroomNumbers", inputType: "textarea" },
      ],
    },
    {
      title: "Operational Constraints",
      icon: CalendarDays,
      iconColor: "#c4b5fd",
      fields: [
        { label: "Working days (CSV)", name: "workingDays", inputType: "textarea" },
        {
          type: "grid",
          cols: 2,
          items: [
            { label: "Periods per day", name: "periodsPerDay", inputType: "number", icon: Clock },
            { label: "Max faculty hrs/week", name: "maxFacultyWorkload", inputType: "number", icon: Settings2 },
          ],
        },
      ],
    },
  ];

  const renderField = (field, sectionIdx, fieldIdx) => {
    if (field.type === "grid") {
      return (
        <div key={`${sectionIdx}-${fieldIdx}-grid`} className={`grid grid-cols-${field.cols} gap-4`}>
          {field.items.map((item, itemIdx) => (
            <div key={itemIdx}>
              <label className="input-label">{item.label}</label>
              <div className={item.icon ? "input-with-icon" : ""}>
                {item.icon && <item.icon className="input-icon" />}
                <input
                  type={item.inputType || "text"}
                  name={item.name}
                  value={formData[item.name]}
                  onChange={handleChange}
                  className="input-field"
                  style={item.icon ? { paddingLeft: "2.25rem" } : {}}
                />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (field.inputType === "textarea") {
      return (
        <div key={`${sectionIdx}-${fieldIdx}`}>
          <label className="input-label">{field.label}</label>
          <textarea
            name={field.name}
            value={formData[field.name]}
            onChange={handleChange}
            rows={2}
            className="input-field resize-none"
            style={{ lineHeight: "1.6" }}
          />
        </div>
      );
    }

    return (
      <div key={`${sectionIdx}-${fieldIdx}`}>
        <label className="input-label">{field.label}</label>
        <div className={field.icon ? "input-with-icon" : ""}>
          {field.icon && <field.icon className="input-icon" />}
          <input
            type={field.inputType || "text"}
            name={field.name}
            value={formData[field.name]}
            onChange={handleChange}
            className="input-field"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-6 panel-enter-3d">

      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="section-eyebrow">Schedule Generation</span>
          <h1
            className="mt-1"
            style={{
              fontSize: "32px",
              fontWeight: 800,
              fontFamily: "'Space Grotesk', sans-serif",
              letterSpacing: "-0.03em",
              color: "var(--text-primary)",
            }}
          >
            Initialize New{" "}
            <span className="text-gradient-indigo">Timetable</span>
          </h1>
          <p className="section-desc mt-2">
            Configure institutional parameters to train the engine and generate a fully autonomous schedule.
          </p>
        </div>
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
          style={{
            background: "linear-gradient(145deg, #6366f1 0%, #4f46e5 100%)",
            boxShadow: "0 4px 0 rgba(40,33,160,0.50), 0 8px 32px rgba(79,70,229,0.40), inset 0 1px 0 rgba(255,255,255,0.18)",
          }}
        >
          <Sparkles className="w-6 h-6 text-white" />
        </div>
      </div>

      <form onSubmit={handleGenerate} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {sections.map((section, sectionIdx) => {
            const SectionIcon = section.icon;
            return (
              <div key={sectionIdx} className="glass-card p-6">
                <h2
                  className="text-base font-bold flex items-center gap-2.5 mb-6"
                  style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: `${section.iconColor}18`,
                      border: `1px solid ${section.iconColor}33`,
                    }}
                  >
                    <SectionIcon className="w-4 h-4" style={{ color: section.iconColor }} />
                  </div>
                  {section.title}
                </h2>

                <div className="space-y-4">
                  {section.fields.map((field, fieldIdx) => renderField(field, sectionIdx, fieldIdx))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit Actions */}
        <div
          className="flex items-center justify-end gap-4 pt-5"
          style={{ borderTop: "1px solid rgba(79,70,229,0.15)" }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('timetable')}
            className="btn btn-ghost"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isGenerating}
            className="btn btn-primary btn-lg"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Synthesizing…</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Autonomous Timetable</span>
                <ChevronRight className="w-4 h-4 opacity-70" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTimetablePage;
