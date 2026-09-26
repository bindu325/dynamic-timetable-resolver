import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  FileDown,
  FileSpreadsheet,
  FileText,
  Calendar,
  AlertTriangle,
  Building,
  User,
  GraduationCap,
  Layers,
  Printer,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ExportPage = () => {
  const { success, error } = useToast();

  const [entries, setEntries] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [sections, setSections] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const [exportType, setExportType] = useState('ALL');
  const [selectedTargetId, setSelectedTargetId] = useState('ALL');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [entRes, confRes, secRes, facRes, roomRes] = await Promise.all([
          API.get('/timetable'),
          API.get('/conflicts'),
          API.get('/sections'),
          API.get('/faculty'),
          API.get('/rooms'),
        ]);
        if (entRes.data.success)  setEntries(entRes.data.data);
        if (confRes.data.success) setConflicts(confRes.data.data);
        if (secRes.data.success)  setSections(secRes.data.data);
        if (facRes.data.success)  setFaculties(facRes.data.data);
        if (roomRes.data.success) setRooms(roomRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getFilteredEntries = () => {
    if (exportType === 'SECTION' && selectedTargetId !== 'ALL')
      return entries.filter((e) => e.section?._id === selectedTargetId || e.section === selectedTargetId);
    if (exportType === 'FACULTY' && selectedTargetId !== 'ALL')
      return entries.filter((e) => e.faculty?._id === selectedTargetId || e.faculty === selectedTargetId);
    if (exportType === 'ROOM' && selectedTargetId !== 'ALL')
      return entries.filter((e) => e.room?._id === selectedTargetId || e.room === selectedTargetId);
    return entries;
  };

  const handleExportCSV = () => {
    try {
      const dataToExport = getFilteredEntries();
      if (dataToExport.length === 0) { error('No records found to export'); return; }
      const headers = ['Day', 'Start Time', 'End Time', 'Subject Code', 'Subject Name', 'Faculty', 'Room', 'Section', 'Status'];
      const rows = dataToExport.map((e) => [
        `"${e.day}"`, `"${e.startTime}"`, `"${e.endTime}"`,
        `"${e.subject?.code || ''}"`, `"${e.subject?.name || ''}"`,
        `"${e.faculty?.name || ''}"`, `"${e.room?.roomNumber || ''}"`,
        `"${e.section?.name || ''}"`, `"${e.status || 'PUBLISHED'}"`,
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const link = document.createElement('a');
      link.setAttribute('href', encodeURI(csvContent));
      link.setAttribute('download', `timetable_export_${exportType.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      success('CSV export generated!');
    } catch (err) { error('Failed to generate CSV'); }
  };

  const handleExportPDF = () => {
    try {
      const dataToExport = getFilteredEntries();
      if (dataToExport.length === 0) { error('No records found to export'); return; }
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.setTextColor(15, 23, 42);
      doc.text('Academic Timetable & Schedule Report', 14, 15);
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`Generated on: ${new Date().toLocaleString()} | Scope: ${exportType}`, 14, 22);

      const tableData = dataToExport.map((e) => [
        e.day, `${e.startTime} - ${e.endTime}`,
        e.subject?.code || '', e.subject?.name || '',
        e.faculty?.name || '', e.room?.roomNumber || '', e.section?.name || '',
      ]);
      autoTable(doc, {
        head: [['Day', 'Time', 'Code', 'Subject', 'Faculty', 'Room', 'Section']],
        body: tableData,
        startY: 28,
        theme: 'striped',
        headStyles: { fillColor: [13, 148, 136] },
        styles: { fontSize: 8 },
      });
      doc.save(`timetable_report_${exportType.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.pdf`);
      success('PDF report downloaded!');
    } catch (err) { console.error(err); error('Failed to generate PDF'); }
  };

  const handleExportConflictReportPDF = () => {
    try {
      if (conflicts.length === 0) { error('No active conflicts to export'); return; }
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.setTextColor(225, 29, 72);
      doc.text('Timetable Conflict & Violation Audit Report', 14, 15);
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`Generated on: ${new Date().toLocaleString()} | Total Collisions: ${conflicts.length}`, 14, 22);

      const tableData = conflicts.map((c) => [
        c.type.replace(/_/g, ' '), c.severity,
        c.day ? `${c.day} ${c.timeSlot || ''}` : 'General', c.message,
      ]);
      autoTable(doc, {
        head: [['Type', 'Severity', 'Day & Time', 'Details']],
        body: tableData,
        startY: 28,
        theme: 'striped',
        headStyles: { fillColor: [225, 29, 72] },
        styles: { fontSize: 8 },
      });
      doc.save(`conflict_audit_${new Date().toISOString().slice(0, 10)}.pdf`);
      success('Conflict Audit PDF downloaded!');
    } catch (err) { error('Failed to generate Conflict PDF'); }
  };

  const scopeCards = [
    {
      id: 'ALL',
      label: 'Complete Timetable',
      sub: 'All periods and cohorts',
      icon: Calendar,
      color: "#a5b4fc",
    },
    {
      id: 'SECTION',
      label: 'Section-Wise',
      sub: 'Targeted student cohort',
      icon: GraduationCap,
      color: "#67e8f9",
      onClick: () => setSelectedTargetId(sections[0]?._id || 'ALL'),
    },
    {
      id: 'FACULTY',
      label: 'Faculty-Wise',
      sub: 'Individual lecturer load',
      icon: User,
      color: "#fcd34d",
      onClick: () => setSelectedTargetId(faculties[0]?._id || 'ALL'),
    },
    {
      id: 'ROOM',
      label: 'Room-Wise',
      sub: 'Hall occupancy schedule',
      icon: Building,
      color: "#6ee7b7",
      onClick: () => setSelectedTargetId(rooms[0]?._id || 'ALL'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="app-card p-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200/60">
            <FileDown className="w-3.5 h-3.5" />
            Reporting & Documents Hub
          </span>
          <span className="text-xs text-slate-500 font-medium">Data Export Center</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Export Timetables & Audit Reports</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Generate high-resolution printable PDF sheets, structured CSV datasets, or comprehensive conflict audit reports.
        </p>
      </div>

      {/* Scope Selector */}
      <div className="app-card p-6 space-y-5">
        <div>
          <h3 className="text-sm font-bold text-slate-900">1. Select Target Scope</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Choose whether to generate an aggregate institution schedule or isolate by section, faculty, or room.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
          <button
            onClick={() => {
              setExportType('ALL');
              setSelectedTargetId('ALL');
            }}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              exportType === 'ALL'
                ? 'bg-teal-50/60 border-teal-600 ring-2 ring-teal-600/20 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <Calendar className={`w-5 h-5 mb-2.5 ${exportType === 'ALL' ? 'text-teal-700' : 'text-slate-400'}`} />
            <div className="font-bold text-xs text-slate-900">Complete Master Schedule</div>
            <span className="text-[11px] text-slate-500 block mt-0.5">All periods across campus</span>
          </button>

          <button
            onClick={() => {
              setExportType('SECTION');
              setSelectedTargetId(sections[0]?._id || 'ALL');
            }}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              exportType === 'SECTION'
                ? 'bg-teal-50/60 border-teal-600 ring-2 ring-teal-600/20 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <GraduationCap className={`w-5 h-5 mb-2.5 ${exportType === 'SECTION' ? 'text-teal-700' : 'text-slate-400'}`} />
            <div className="font-bold text-xs text-slate-900">Section-Wise Cohort</div>
            <span className="text-[11px] text-slate-500 block mt-0.5">Individual student batch</span>
          </button>

          <button
            onClick={() => {
              setExportType('FACULTY');
              setSelectedTargetId(faculties[0]?._id || 'ALL');
            }}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              exportType === 'FACULTY'
                ? 'bg-teal-50/60 border-teal-600 ring-2 ring-teal-600/20 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <User className={`w-5 h-5 mb-2.5 ${exportType === 'FACULTY' ? 'text-teal-700' : 'text-slate-400'}`} />
            <div className="font-bold text-xs text-slate-900">Faculty-Wise Load</div>
            <span className="text-[11px] text-slate-500 block mt-0.5">Individual instructor routine</span>
          </button>

          <button
            onClick={() => {
              setExportType('ROOM');
              setSelectedTargetId(rooms[0]?._id || 'ALL');
            }}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              exportType === 'ROOM'
                ? 'bg-teal-50/60 border-teal-600 ring-2 ring-teal-600/20 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <Building className={`w-5 h-5 mb-2.5 ${exportType === 'ROOM' ? 'text-teal-700' : 'text-slate-400'}`} />
            <div className="font-bold text-xs text-slate-900">Room-Wise Occupancy</div>
            <span className="text-[11px] text-slate-500 block mt-0.5">Hall booking timetable</span>
          </button>
        </div>

        {/* Dynamic Target Selector */}
        {exportType !== 'ALL' && (
          <div className="pt-1 max-w-sm text-xs">
            <label className="block text-slate-700 font-semibold mb-1.5">
              Select Specific {exportType}:
            </label>
            <select
              value={selectedTargetId}
              onChange={(e) => setSelectedTargetId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            >
              {exportType === 'SECTION' &&
                sections.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.department} · Sem {s.semester})
                  </option>
                ))}

              {exportType === 'FACULTY' &&
                faculties.map((f) => (
                  <option key={f._id} value={f._id}>
                    {f.name} ({f.department})
                  </option>
                ))}

              {exportType === 'ROOM' &&
                rooms.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.roomNumber} ({r.roomType})
                  </option>
                ))}
            </select>
          </div>
        )}

        {/* Action Export Buttons */}
        <div className="pt-4 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">2. Choose Output Format</h4>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportPDF}
              className="btn-primary text-xs flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>Download Timetable PDF</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="btn-secondary text-xs flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Download CSV (Excel)</span>
            </button>

            <button
              onClick={handleExportConflictReportPDF}
              className="px-4 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs border border-rose-200 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Download Conflict Audit Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportPage;
