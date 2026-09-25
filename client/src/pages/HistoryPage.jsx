import React, { useState, useEffect } from 'react';
import API from '../services/api';
import {
  History,
  Clock,
  User,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Trash2,
  PlusCircle,
  Edit,
} from 'lucide-react';

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterType !== 'ALL') params.changeType = filterType;

      const res = await API.get('/history', { params });
      if (res.data.success) {
        setHistory(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [filterType]);

  const getBadgeStyle = (type) => {
    switch (type) {
      case 'RESOLVE_CONFLICT':
      case 'AUTO_RESOLVE':
        return 'bg-emerald-950 text-emerald-300 border-emerald-500/30';
      case 'CREATE':
        return 'bg-indigo-950 text-indigo-300 border-indigo-500/30';
      case 'UPDATE':
        return 'bg-amber-950 text-amber-300 border-amber-500/30';
      case 'DELETE':
        return 'bg-rose-950 text-rose-300 border-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            Audit Trail
          </span>
          <h2 className="text-2xl font-bold text-white mt-0.5">Timetable Change History</h2>
          <p className="text-xs text-slate-400">
            Chronological audit log of automated conflict resolutions, manual edits, and schedule adjustments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">Filter Change Type:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Actions</option>
            <option value="RESOLVE_CONFLICT">Conflict Resolutions</option>
            <option value="CREATE">Created Entries</option>
            <option value="UPDATE">Manual Updates</option>
            <option value="DELETE">Deleted Entries</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-xs text-slate-400">Loading audit log...</div>
      ) : history.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-slate-800 space-y-3">
          <History className="w-10 h-10 mx-auto text-slate-600" />
          <h4 className="text-sm font-semibold text-white">No Change History Recorded</h4>
          <p className="text-xs text-slate-400">Modifications to schedules and resolutions will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((record) => (
            <div
              key={record._id}
              className="glass-card p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all space-y-2"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${getBadgeStyle(record.changeType)}`}>
                    {record.changeType.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs font-semibold text-white">
                    {record.reason}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{new Date(record.timestamp || record.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Before vs After Context snippet */}
              {(record.before || record.after) && (
                <div className="text-xs text-slate-300 p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 flex items-center gap-3">
                  {record.before && (
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <span className="text-rose-400 font-medium">Prior:</span>
                      <span>
                        {record.before.day || 'N/A'} {record.before.startTime ? `${record.before.startTime}-${record.before.endTime}` : ''}
                      </span>
                    </div>
                  )}

                  {record.before && record.after && (
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  )}

                  {record.after && (
                    <div className="flex items-center gap-1.5 text-slate-200">
                      <span className="text-emerald-400 font-medium">New:</span>
                      <span>
                        {record.after.day || 'N/A'} {record.after.startTime ? `${record.after.startTime}-${record.after.endTime}` : ''}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-1 text-[11px] text-slate-500 pt-1">
                <User className="w-3 h-3 text-slate-500" />
                <span>Changed by: {record.changedByName || record.changedBy?.name || 'Administrator'}</span>
                {record.impactSummary && (
                  <span className="ml-2 text-indigo-400">({record.impactSummary})</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
