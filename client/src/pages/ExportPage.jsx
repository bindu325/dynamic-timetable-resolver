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
  CheckCircle2,
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
      doc.text('Academic Timetable & Schedule Report', 14, 15);
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()} | Scope: ${exportType}`, 14, 22);
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
        headStyles: { fillColor: [79, 70, 229] },
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
      doc.setTextColor(239, 68, 68);
      doc.text('Timetable Conflict & Collision Report', 14, 15);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated: ${new Date().toLocaleString()} | Total: ${conflicts.length} conflicts`, 14, 22);
      const tableData = conflicts.map((c) => [
        c.type.replace(/_/g, ' '), c.severity,
        c.day ? `${c.day} ${c.timeSlot || ''}` : 'General', c.message,
      ]);
      autoTable(doc, {
        head: [['Type', 'Severity', 'Day & Time', 'Details']],
        body: tableData,
        startY: 28,
        theme: 'striped',
        headStyles: { fillColor: [239, 68, 68] },
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
    <div className="space-y-5 panel-enter-3d">

      {/* Header */}
      <div
        className="glass-card p-6 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(22, 34, 64, 0.80) 0%, rgba(10, 18, 40, 0.90) 100%)",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            width: "35%",
            height: "200%",
            background: "radial-gradient(ellipse at 80% 50%, rgba(79,70,229,0.07) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div className="relative">
          <span className="section-eyebrow">Reporting & Documents</span>
          <h2
            className="section-title mt-1"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Export <span className="text-gradient-indigo">Timetables & Reports</span>
          </h2>
          <p className="section-desc mt-1.5">
            Generate printable PDF sheets and CSV tables for student sections, faculty, or institutional audits.
          </p>
        </div>
      </div>

      {/* Scope Selector & Export Actions */}
      <div className="glass-card p-6 space-y-5">
        <div>
          <h3
            className="text-sm font-semibold mb-4"
            style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Select export scope
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {scopeCards.map((card) => {
              const Icon = card.icon;
              const isActive = exportType === card.id;
              return (
                <button
                  key={card.id}
                  onClick={() => {
                    setExportType(card.id);
                    card.onClick?.();
                    if (card.id === 'ALL') setSelectedTargetId('ALL');
                  }}
                  className="scope-card text-left"
                  style={isActive ? {
                    borderColor: "rgba(79,70,229,0.60)",
                    background: "rgba(79,70,229,0.12)",
                    boxShadow: "0 0 0 1px rgba(79,70,229,0.30), 0 4px 20px rgba(79,70,229,0.12)",
                  } : {}}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
                    style={{
                      background: `${card.color}18`,
                      border: `1px solid ${card.color}30`,
                    }}
                  >
                    <Icon className="w-4 h-4" style={{ color: card.color }} />
                  </div>
                  <div
                    className="font-bold text-xs mb-0.5"
                    style={{ color: isActive ? "var(--text-primary)" : "var(--text-secondary)" }}
                  >
                    {card.label}
                  </div>
                  <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                    {card.sub}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Target Selector */}
        {exportType !== 'ALL' && (
          <div className="max-w-sm">
            <label className="input-label">
              Select specific {exportType.toLowerCase()}:
            </label>
            <select
              value={selectedTargetId}
              onChange={(e) => setSelectedTargetId(e.target.value)}
              className="input-field"
            >
              {exportType === 'SECTION' && sections.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.department} Sem {s.semester})
                </option>
              ))}
              {exportType === 'FACULTY' && faculties.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.name} ({f.department})
                </option>
              ))}
              {exportType === 'ROOM' && rooms.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.roomNumber} ({r.roomType})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Stats Summary */}
        <div
          className="flex flex-wrap items-center gap-4 py-4 text-xs"
          style={{ borderTop: "1px solid rgba(79,70,229,0.12)" }}
        >
          <div className="flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
            <Calendar className="w-3.5 h-3.5" style={{ color: "#a5b4fc" }} />
            <span>{getFilteredEntries().length} entries in scope</span>
          </div>
          <div className="flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
            {conflicts.length > 0 ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5" style={{ color: "#fca5a5" }} />
                <span>{conflicts.length} active conflicts</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#6ee7b7" }} />
                <span>No active conflicts</span>
              </>
            )}
          </div>
        </div>

        {/* Export Actions */}
        <div
          className="flex flex-wrap items-center gap-3 pt-4"
          style={{ borderTop: "1px solid rgba(79,70,229,0.12)" }}
        >
          <button
            onClick={handleExportPDF}
            className="btn btn-primary"
          >
            <FileText className="w-4 h-4" />
            <span>Download Timetable PDF</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="btn btn-secondary"
          >
            <FileSpreadsheet className="w-4 h-4" style={{ color: "#6ee7b7" }} />
            <span>Download CSV (Excel)</span>
          </button>

          <button
            onClick={handleExportConflictReportPDF}
            className="btn btn-danger"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Conflict Audit Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportPage;
