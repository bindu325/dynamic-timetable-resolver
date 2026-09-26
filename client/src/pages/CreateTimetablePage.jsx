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
      iconColor: "#8c5e47",
      bgColor: "#faf4ea",
      borderColor: "#ebd6b3",
      fields: [
        {
          type: "grid",
          cols: 2,
          items: [
            { label: "Total Students", name: "studentCount", inputType: "number", icon: Users },
            { label: "Total Faculty", name: "facultyCount", inputType: "number", icon: UserCheck },
          ],
        },
        { label: "Faculty Identifiers (CSV)", name: "facultyNames", inputType: "textarea" },
        { label: "Departments (CSV)", name: "departmentList", inputType: "textarea" },
      ],
    },
    {
      title: "Academic Curriculum",
      icon: BookOpen,
      iconColor: "#526b58",
      bgColor: "#edf5ee",
      borderColor: "#c7decb",
      fields: [
        { label: "Number of Subjects", name: "subjectCount", inputType: "number", icon: BookOpen },
        { label: "Subject Names (CSV)", name: "subjectNames", inputType: "textarea" },
      ],
    },
    {
      title: "Infrastructure Data",
      icon: DoorClosed,
      iconColor: "#a87432",
      bgColor: "#faf4ea",
      borderColor: "#ebd6b3",
      fields: [
        {
          type: "grid",
          cols: 2,
          items: [
            { label: "Classrooms", name: "classroomCount", inputType: "number" },
            { label: "Campus Blocks", name: "blockCount", inputType: "number", icon: Building },
          ],
        },
        { label: "Classroom Identifiers (CSV)", name: "classroomNumbers", inputType: "textarea" },
      ],
    },
    {
      title: "Operational Constraints",
      icon: CalendarDays,
      iconColor: "#49657b",
      bgColor: "#eef4f8",
      borderColor: "#c5dae8",
      fields: [
        { label: "Working Days (CSV)", name: "workingDays", inputType: "textarea" },
        {
          type: "grid",
          cols: 2,
          items: [
            { label: "Periods per Day", name: "periodsPerDay", inputType: "number", icon: Clock },
            { label: "Max Faculty Hrs/Week", name: "maxFacultyWorkload", inputType: "number", icon: Settings2 },
          ],
        },
      ],
    },
  ];

  const renderField = (field, sectionIdx, fieldIdx) => {
    if (field.type === "grid") {
      return (
        <div key={`${sectionIdx}-${fieldIdx}-grid`} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field.items.map((item, itemIdx) => (
            <div key={itemIdx}>
              <label className="block text-xs font-semibold text-[#57524a] mb-1.5">{item.label}</label>
              <div className="relative">
                {item.icon && <item.icon className="w-4 h-4 text-[#8a8275] absolute left-3 top-1/2 -translate-y-1/2" />}
                <input
                  type={item.inputType || "text"}
                  name={item.name}
                  value={formData[item.name]}
                  onChange={handleChange}
                  className={`w-full bg-[#faf9f5] border border-[#e5ded2] rounded-xl py-2 pr-3 text-xs text-[#2d2a26] focus:outline-none focus:ring-2 focus:ring-[#8c5e47]/20 focus:border-[#8c5e47] ${
                    item.icon ? 'pl-9' : 'pl-3'
                  }`}
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
          <label className="block text-xs font-semibold text-[#57524a] mb-1.5">{field.label}</label>
          <textarea
            name={field.name}
            value={formData[field.name]}
            onChange={handleChange}
            rows={2}
            className="w-full bg-[#faf9f5] border border-[#e5ded2] rounded-xl p-3 text-xs text-[#2d2a26] focus:outline-none focus:ring-2 focus:ring-[#8c5e47]/20 focus:border-[#8c5e47] resize-none"
          />
        </div>
      );
    }

    return (
      <div key={`${sectionIdx}-${fieldIdx}`}>
        <label className="block text-xs font-semibold text-[#57524a] mb-1.5">{field.label}</label>
        <div className="relative">
          {field.icon && <field.icon className="w-4 h-4 text-[#8a8275] absolute left-3 top-1/2 -translate-y-1/2" />}
          <input
            type={field.inputType || "text"}
            name={field.name}
            value={formData[field.name]}
            onChange={handleChange}
            className={`w-full bg-[#faf9f5] border border-[#e5ded2] rounded-xl py-2 pr-3 text-xs text-[#2d2a26] focus:outline-none focus:ring-2 focus:ring-[#8c5e47]/20 focus:border-[#8c5e47] ${
              field.icon ? 'pl-9' : 'pl-3'
            }`}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-4 space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl p-6 border border-[#e5ded2] shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-[#8c5e47] uppercase tracking-wider block">
            Schedule Generation
          </span>
          <h1 className="text-2xl font-bold text-[#2d2a26] tracking-tight mt-1">
            Initialize New Timetable
          </h1>
          <p className="text-xs text-[#8a8275] mt-1">
            Configure institutional parameters to generate a fully optimized, collision-free schedule.
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-[#faf4ea] border border-[#ebd6b3] flex items-center justify-center shrink-0">
          <Sparkles className="w-6 h-6 text-[#8c5e47]" />
        </div>
      </div>

      <form onSubmit={handleGenerate} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {sections.map((section, sectionIdx) => {
            const SectionIcon = section.icon;
            return (
              <div key={sectionIdx} className="app-card p-6">
                <h2 className="text-sm font-bold text-[#2d2a26] flex items-center gap-2.5 mb-5 pb-3 border-b border-[#ede8df]">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: section.bgColor,
                      border: `1px solid ${section.borderColor}`,
                      color: section.iconColor,
                    }}
                  >
                    <SectionIcon className="w-4 h-4" />
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
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e5ded2]">
          <button
            type="button"
            onClick={() => setActiveTab('timetable')}
            className="btn-secondary text-xs"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isGenerating}
            className="btn-primary text-xs flex items-center gap-2 shadow-sm"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Synthesizing Timetable…</span>
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
