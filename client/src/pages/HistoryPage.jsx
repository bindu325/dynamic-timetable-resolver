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
  Filter,
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
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'CREATE':
        return 'bg-teal-50 text-teal-800 border-teal-200/60';
      case 'UPDATE':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'DELETE':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="app-card p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200/60">
                <History className="w-3.5 h-3.5" />
                Audit Trail
              </span>
              <span className="text-xs text-slate-500 font-medium">Activity Log</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Schedule Activity Timeline</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Chronological audit ledger of automated conflict resolutions, manual edits, and period allocations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Filter Action:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            >
              <option value="ALL">All Actions</option>
              <option value="RESOLVE_CONFLICT">Conflict Resolutions</option>
              <option value="CREATE">Created Entries</option>
              <option value="UPDATE">Manual Updates</option>
              <option value="DELETE">Deleted Entries</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="app-card p-12 text-center text-xs text-slate-400">Loading audit history...</div>
      ) : history.length === 0 ? (
        <div className="app-card p-12 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
            <History className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">No Change History Recorded</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Modifications to schedules and automated resolution actions will appear here in chronological order.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((record) => (
            <div
              key={record._id}
              className="app-card p-4.5 hover:border-teal-400 hover:shadow-xs transition-all space-y-2.5"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getBadgeStyle(record.changeType)}`}>
                    {record.changeType.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {record.reason}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{new Date(record.timestamp || record.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Before vs After Context snippet */}
              {(record.before || record.after) && (
                <div className="text-xs text-slate-600 p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-4 flex-wrap">
                  {record.before && (
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <span className="text-rose-600 font-bold text-[11px]">Before:</span>
                      <span>
                        {record.before.day || 'N/A'} {record.before.startTime ? `${record.before.startTime}-${record.before.endTime}` : ''}
                      </span>
                    </div>
                  )}

                  {record.before && record.after && (
                    <ArrowRight className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  )}

                  {record.after && (
                    <div className="flex items-center gap-1.5 text-slate-800">
                      <span className="text-emerald-600 font-bold text-[11px]">After:</span>
                      <span className="font-semibold">
                        {record.after.day || 'N/A'} {record.after.startTime ? `${record.after.startTime}-${record.after.endTime}` : ''}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-400" />
                  <span>Changed by: <strong className="text-slate-700 font-medium">{record.changedByName || record.changedBy?.name || 'Administrator'}</strong></span>
                </span>
                {record.impactSummary && (
                  <span className="text-teal-700 font-medium">({record.impactSummary})</span>
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
