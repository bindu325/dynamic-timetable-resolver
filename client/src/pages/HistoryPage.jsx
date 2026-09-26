import React, { useState, useEffect } from "react";
import API from "../services/api";
import { History, Clock, User, ArrowRight, CheckCircle2, Edit2, Trash2, Plus, RefreshCw } from "lucide-react";

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("ALL");

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterType !== "ALL") params.changeType = filterType;
      const res = await API.get("/history", { params });
      if (res.data.success) setHistory(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, [filterType]);

  const getChangeStyle = (type) => {
    switch (type) {
      case "RESOLVE_CONFLICT":
      case "AUTO_RESOLVE":
        return { color: "#6ee7b7", bg: "rgba(16,185,129,0.10)", border: "rgba(16,185,129,0.25)", icon: CheckCircle2 };
      case "CREATE":
        return { color: "#a5b4fc", bg: "rgba(79,70,229,0.10)", border: "rgba(79,70,229,0.25)", icon: Plus };
      case "UPDATE":
        return { color: "#fcd34d", bg: "rgba(245,158,11,0.10)", border: "rgba(245,158,11,0.25)", icon: Edit2 };
      case "DELETE":
        return { color: "#fca5a5", bg: "rgba(239,68,68,0.10)", border: "rgba(239,68,68,0.25)", icon: Trash2 };
      default:
        return { color: "var(--text-muted)", bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.10)", icon: History };
    }
  };

  return (
    <div className="space-y-5 panel-enter-3d">

      {/* Header */}
      <div
        className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(22, 34, 64, 0.80) 0%, rgba(10, 18, 40, 0.90) 100%)",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            width: "30%",
            height: "200%",
            background: "radial-gradient(ellipse at 80% 50%, rgba(79,70,229,0.06) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div className="relative">
          <span className="section-eyebrow">Audit Trail</span>
          <h2
            className="section-title mt-1"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Change <span className="text-gradient-indigo">History</span>
          </h2>
          <p className="section-desc mt-1">
            Chronological log of conflict resolutions, manual edits, and schedule adjustments.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 relative">
          <label className="input-label" style={{ whiteSpace: "nowrap" }}>Filter:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input-field"
            style={{ width: "auto", minWidth: "160px" }}
          >
            <option value="ALL">All actions</option>
            <option value="RESOLVE_CONFLICT">Conflict resolutions</option>
            <option value="CREATE">Created entries</option>
            <option value="UPDATE">Manual updates</option>
            <option value="DELETE">Deleted entries</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="spinner" />
        </div>
      ) : history.length === 0 ? (
        <div className="glass-card p-12 text-center space-y-3">
          <div
            className="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center"
            style={{
              background: "rgba(79,70,229,0.10)",
              border: "1px solid rgba(79,70,229,0.22)",
            }}
          >
            <History className="w-6 h-6" style={{ color: "#a5b4fc" }} />
          </div>
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            No History Recorded
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Schedule modifications and conflict resolutions will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {history.map((record) => {
            const style = getChangeStyle(record.changeType);
            const IconComp = style.icon;
            return (
              <div
                key={record._id}
                className="glass-card p-4 space-y-2.5 transition-all"
                onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(79,70,229,0.30)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(79,70,229,0.18)"}
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    {/* Type badge */}
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        background: style.bg,
                        border: `1px solid ${style.border}`,
                      }}
                    >
                      <IconComp className="w-3.5 h-3.5" style={{ color: style.color }} />
                    </div>
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                      style={{
                        background: style.bg,
                        border: `1px solid ${style.border}`,
                        color: style.color,
                      }}
                    >
                      {record.changeType.replace(/_/g, " ")}
                    </span>
                    <span
                      className="text-xs font-medium"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {record.reason}
                    </span>
                  </div>

                  <div
                    className="flex items-center gap-1.5 text-[11px]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <Clock className="w-3 h-3" />
                    <span>{new Date(record.timestamp || record.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {(record.before || record.after) && (
                  <div
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs"
                    style={{
                      background: "rgba(10,18,40,0.60)",
                      border: "1px solid rgba(79,70,229,0.10)",
                    }}
                  >
                    {record.before && (
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium" style={{ color: "#fca5a5" }}>Prior:</span>
                        <span style={{ color: "var(--text-secondary)" }}>
                          {record.before.day || "N/A"}{" "}
                          {record.before.startTime
                            ? `${record.before.startTime}–${record.before.endTime}`
                            : ""}
                        </span>
                      </div>
                    )}
                    {record.before && record.after && (
                      <ArrowRight className="w-3.5 h-3.5 shrink-0" style={{ color: "#a5b4fc" }} />
                    )}
                    {record.after && (
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium" style={{ color: "#6ee7b7" }}>New:</span>
                        <span style={{ color: "var(--text-primary)" }}>
                          {record.after.day || "N/A"}{" "}
                          {record.after.startTime
                            ? `${record.after.startTime}–${record.after.endTime}`
                            : ""}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div
                  className="flex items-center gap-1.5 text-[11px]"
                  style={{ color: "var(--text-faint)" }}
                >
                  <User className="w-3 h-3" />
                  <span>By: {record.changedByName || record.changedBy?.name || "Administrator"}</span>
                  {record.impactSummary && (
                    <span style={{ color: "#a5b4fc" }}>· {record.impactSummary}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
