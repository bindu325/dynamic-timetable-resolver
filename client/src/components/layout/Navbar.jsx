import React from "react";
import { RefreshCw, AlertCircle, Activity } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Navbar = ({ onQuickScan, activeConflictCount = 0, isScanning = false }) => {
  const { user, isAdmin } = useAuth();

  return (
    <header
      className="h-14 px-6 flex items-center justify-between sticky top-0 z-30"
      style={{
        background: "rgba(4, 8, 18, 0.80)",
        backdropFilter: "blur(28px) saturate(1.4)",
        borderBottom: "1px solid rgba(79, 70, 229, 0.14)",
        boxShadow: "0 1px 0 rgba(79,70,229,0.08), 0 4px 24px rgba(0,0,0,0.40)",
      }}
    >
      {/* Left — Page Title */}
      <div className="flex items-center gap-3">
        <div
          className="w-1.5 h-6 rounded-full"
          style={{
            background: "linear-gradient(180deg, #6366f1 0%, #4f46e5 100%)",
            boxShadow: "0 0 12px rgba(99, 102, 241, 0.60)",
          }}
        />
        <div>
          <h1
            className="text-sm font-semibold leading-none"
            style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.01em" }}
          >
            Academic Timetable Management
          </h1>
          <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
            Semester 2025–2026
          </p>
        </div>
      </div>

      {/* Right — Actions */}
      <div className="flex items-center gap-2.5">
        {/* Live Status Indicator */}
        <div
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium"
          style={{
            background: "rgba(16, 185, 129, 0.07)",
            border: "1px solid rgba(16, 185, 129, 0.18)",
            color: "#6ee7b7",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "#10b981", boxShadow: "0 0 6px rgba(16,185,129,0.70)" }}
          />
          <span>Live</span>
        </div>

        {/* Conflict Badge */}
        {activeConflictCount > 0 && (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold"
            style={{
              background: "rgba(239, 68, 68, 0.10)",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              color: "#fca5a5",
            }}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{activeConflictCount} conflict{activeConflictCount !== 1 ? "s" : ""}</span>
          </div>
        )}

        {/* Quick Scan Button */}
        {isAdmin && (
          <button
            id="navbar-scan-btn"
            onClick={onQuickScan}
            disabled={isScanning}
            className="btn btn-primary btn-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`} />
            <span>{isScanning ? "Scanning…" : "Scan"}</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
