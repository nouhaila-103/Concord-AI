import React, { useState, useEffect } from "react";
import { RegulatoryConflict, RegulatoryUpdate, AISystem } from "../types";
import { ShieldAlert, AlertTriangle, RefreshCw, Calendar, ArrowUpRight, CheckCircle2, Info, Bell, Clock } from "lucide-react";

interface ContinuousMonitorViewProps {
  onSelectSystem?: (systemId: string) => void;
}

export const ContinuousMonitorView: React.FC<ContinuousMonitorViewProps> = ({ onSelectSystem }) => {
  const [conflicts, setConflicts] = useState<RegulatoryConflict[]>([]);
  const [updates, setUpdates] = useState<RegulatoryUpdate[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<string>(new Date().toLocaleTimeString());

  const fetchMonitorData = async () => {
    setLoading(true);
    try {
      const [conflictsRes, updatesRes] = await Promise.all([
        fetch("/api/regulatory/conflicts"),
        fetch("/api/regulatory/feed"),
      ]);

      const conflictsData = await conflictsRes.json();
      const updatesData = await updatesRes.json();

      setConflicts(conflictsData.conflicts || []);
      setUpdates(updatesData.updates || []);
      setLastChecked(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Failed to load monitor data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitorData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Scan Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded">
              Continuous Intelligence
            </span>
            <span className="text-xs text-slate-500 font-mono">Last Scan: {lastChecked}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Regulatory Updates & Real-Time Conflict Monitor
          </h1>
          <p className="text-sm text-slate-500">
            Continuously evaluates registered AI systems against new statutory amendments, statutory deadlines, and regulatory shifts.
          </p>
        </div>

        <button
          onClick={fetchMonitorData}
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm flex items-center space-x-2 transition-all disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>{loading ? "Scanning Fleet..." : "Run Fleet Conflict Check"}</span>
        </button>
      </div>

      {/* Flagged Potential Compliance Conflicts Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <span>Active Compliance Conflicts & Immediate Action Alerts ({conflicts.length})</span>
          </h2>
          <span className="text-xs text-slate-500">Auto-flagged across organizational systems</span>
        </div>

        {conflicts.length === 0 ? (
          <div className="p-8 bg-white rounded-xl border border-slate-200 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900">Zero Compliance Conflicts Detected</h3>
            <p className="text-xs text-slate-500">
              All active AI systems match the current regulatory rulebook version and meet all known statutory criteria.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {conflicts.map((conf, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3 hover:border-slate-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        conf.severity === "CRITICAL"
                          ? "bg-red-100 text-red-800"
                          : conf.severity === "HIGH"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {conf.severity}
                    </span>
                    <span className="text-xs font-bold text-slate-900">Target System: {conf.systemName}</span>
                    <span className="text-xs text-slate-400 font-mono">({conf.framework})</span>
                  </div>

                  <span className="text-[11px] text-slate-500 font-mono">Type: {conf.type}</span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">{conf.title}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{conf.message}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-semibold text-slate-700">Immediate Remedy: </span>
                    <span className="text-emerald-700 font-medium">{conf.remedyAction}</span>
                  </div>

                  {onSelectSystem && (
                    <button
                      onClick={() => onSelectSystem(conf.systemId)}
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline flex items-center space-x-1 shrink-0"
                    >
                      <span>Open System</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Real-time Global Regulatory Intelligence Feed */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <span>Official Regulatory Feed & Statutory Deadlines</span>
          </h2>
          <span className="text-xs text-slate-500">Curated from EU Official Journal & US State Gazettes</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {updates.map((update) => (
            <div
              key={update.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                    {update.framework}
                  </span>
                  <span className="text-xs font-mono text-slate-500 flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>Effective: {update.effectiveDate}</span>
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900">{update.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{update.summary}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                <p>
                  <strong>Impacted Domains:</strong> {update.impactedDomains.join(", ")}
                </p>
                <p className="text-emerald-700 font-medium">
                  <strong>Recommended Action:</strong> {update.recommendedAction}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
