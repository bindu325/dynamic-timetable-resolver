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

  // Filters for targeted export
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

        if (entRes.data.success) setEntries(entRes.data.data);
        if (confRes.data.success) setConflicts(confRes.data.data);
        if (secRes.data.success) setSections(secRes.data.data);
        if (facRes.data.success) setFaculties(facRes.data.data);
        if (roomRes.data.success) setRooms(roomRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter entries according to chosen export scope
  const getFilteredEntries = () => {
    if (exportType === 'SECTION' && selectedTargetId !== 'ALL') {
      return entries.filter((e) => e.section?._id === selectedTargetId || e.section === selectedTargetId);
    }
    if (exportType === 'FACULTY' && selectedTargetId !== 'ALL') {
      return entries.filter((e) => e.faculty?._id === selectedTargetId || e.faculty === selectedTargetId);
    }
    if (exportType === 'ROOM' && selectedTargetId !== 'ALL') {
      return entries.filter((e) => e.room?._id === selectedTargetId || e.room === selectedTargetId);
    }
    return entries;
  };

  // Export to CSV
  const handleExportCSV = () => {
    try {
      const dataToExport = getFilteredEntries();
      if (dataToExport.length === 0) {
        error('No records found to export');
        return;
      }

      const headers = ['Day', 'Start Time', 'End Time', 'Subject Code', 'Subject Name', 'Faculty', 'Room', 'Section', 'Status'];
      const rows = dataToExport.map((e) => [
        `"${e.day}"`,
        `"${e.startTime}"`,
        `"${e.endTime}"`,
        `"${e.subject?.code || ''}"`,
        `"${e.subject?.name || ''}"`,
        `"${e.faculty?.name || ''}"`,
        `"${e.room?.roomNumber || ''}"`,
        `"${e.section?.name || ''}"`,
        `"${e.status || 'PUBLISHED'}"`,
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `timetable_export_${exportType.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      success('CSV export generated successfully!');
    } catch (err) {
      error('Failed to generate CSV');
    }
  };

  // Export to PDF
  const handleExportPDF = () => {
    try {
      const dataToExport = getFilteredEntries();
      if (dataToExport.length === 0) {
        error('No records found to export');
        return;
      }

      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text('Academic Timetable & Schedule Report', 14, 15);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()} | Scope: ${exportType}`, 14, 22);

      const tableData = dataToExport.map((e) => [
        e.day,
        `${e.startTime} - ${e.endTime}`,
        e.subject?.code || '',
        e.subject?.name || '',
        e.faculty?.name || '',
        e.room?.roomNumber || '',
        e.section?.name || '',
      ]);

      autoTable(doc, {
        head: [['Day', 'Time', 'Code', 'Subject', 'Faculty', 'Room', 'Section']],
        body: tableData,
        startY: 28,
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241] },
        styles: { fontSize: 8 },
      });

      doc.save(`timetable_report_${exportType.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.pdf`);
      success('PDF report created and downloaded!');
    } catch (err) {
      console.error(err);
      error('Failed to generate PDF');
    }
  };

  // Export Conflict Report
  const handleExportConflictReportPDF = () => {
    try {
      if (conflicts.length === 0) {
        error('No active conflicts to export');
        return;
      }

      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.setTextColor(220, 38, 38);
      doc.text('Timetable Conflict & Collision Report', 14, 15);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleString()} | Total Collisions: ${conflicts.length}`, 14, 22);

      const tableData = conflicts.map((c) => [
        c.type.replace(/_/g, ' '),
        c.severity,
        c.day ? `${c.day} ${c.timeSlot || ''}` : 'General',
        c.message,
      ]);

      autoTable(doc, {
        head: [['Type', 'Severity', 'Day & Time', 'Explanation & Violations']],
        body: tableData,
        startY: 28,
        theme: 'striped',
        headStyles: { fillColor: [239, 68, 68] },
        styles: { fontSize: 8 },
      });

      doc.save(`conflict_audit_report_${new Date().toISOString().slice(0, 10)}.pdf`);
      success('Conflict Audit PDF downloaded!');
    } catch (err) {
      error('Failed to generate Conflict PDF');
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6 border border-slate-800">
        <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
          Reporting & Documents
        </span>
        <h2 className="text-2xl font-bold text-white mt-0.5">Export Timetables & Conflict Reports</h2>
        <p className="text-xs text-slate-400">
          Generate printable PDF sheets and CSV tables for student sections, faculty, or institutional audits.
        </p>
      </div>

      {/* Scope Selector */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-semibold text-white">Select Export Scope</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => {
              setExportType('ALL');
              setSelectedTargetId('ALL');
            }}
            className={`p-4 rounded-xl border text-left transition-all ${
              exportType === 'ALL'
                ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-lg shadow-indigo-950/50'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <Calendar className="w-5 h-5 text-indigo-400 mb-2" />
            <div className="font-bold text-xs">Complete Timetable</div>
            <span className="text-[11px] text-slate-400">All periods and cohorts</span>
          </button>

          <button
            onClick={() => {
              setExportType('SECTION');
              setSelectedTargetId(sections[0]?._id || 'ALL');
            }}
            className={`p-4 rounded-xl border text-left transition-all ${
              exportType === 'SECTION'
                ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-lg shadow-indigo-950/50'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <GraduationCap className="w-5 h-5 text-sky-400 mb-2" />
            <div className="font-bold text-xs">Section-Wise</div>
            <span className="text-[11px] text-slate-400">Targeted student cohort</span>
          </button>

          <button
            onClick={() => {
              setExportType('FACULTY');
              setSelectedTargetId(faculties[0]?._id || 'ALL');
            }}
            className={`p-4 rounded-xl border text-left transition-all ${
              exportType === 'FACULTY'
                ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-lg shadow-indigo-950/50'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <User className="w-5 h-5 text-violet-400 mb-2" />
            <div className="font-bold text-xs">Faculty-Wise</div>
            <span className="text-[11px] text-slate-400">Individual lecturer load</span>
          </button>

          <button
            onClick={() => {
              setExportType('ROOM');
              setSelectedTargetId(rooms[0]?._id || 'ALL');
            }}
            className={`p-4 rounded-xl border text-left transition-all ${
              exportType === 'ROOM'
                ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-lg shadow-indigo-950/50'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <Building className="w-5 h-5 text-emerald-400 mb-2" />
            <div className="font-bold text-xs">Room-Wise</div>
            <span className="text-[11px] text-slate-400">Hall occupancy schedule</span>
          </button>
        </div>

        {/* Dynamic target selector */}
        {exportType !== 'ALL' && (
          <div className="pt-2 max-w-sm text-xs">
            <label className="block text-slate-300 font-medium mb-1">
              Select Specific {exportType}:
            </label>
            <select
              value={selectedTargetId}
              onChange={(e) => setSelectedTargetId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
            >
              {exportType === 'SECTION' &&
                sections.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.department} Sem {s.semester})
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
        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={handleExportPDF}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            <span>Download Timetable PDF</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Download CSV (Excel)</span>
          </button>

          <button
            onClick={handleExportConflictReportPDF}
            className="px-5 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 text-rose-200 text-xs font-semibold border border-rose-500/30 flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Download Conflict Audit Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportPage;
