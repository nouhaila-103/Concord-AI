import React, { useState, useEffect } from "react";
import { AuditLog } from "../types";
import { Layers, ShieldCheck, Check, Copy, ChevronDown, ChevronUp, Clock, Filter, Search } from "lucide-react";

export const AuditLogView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/audit-logs");
      const data = await res.json();
      setLogs(data.auditLogs || []);
      if (data.auditLogs && data.auditLogs.length > 0 && !selectedLog) {
        setSelectedLog(data.auditLogs[0]);
      }
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const filteredLogs = logs.filter(
    (l) =>
      (l.systemName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.deterministicHash || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded">
              Statutory Provenance
            </span>
            <span className="text-xs text-slate-500 font-mono">Zero LLM Hallucinations</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Immutable Regulatory Audit Logs
          </h1>
          <p className="text-sm text-slate-500">
            Cryptographically sealed audit trail documenting exact rules evaluated, triggering facts, and statutory versions.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search logs or hash..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Log list */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Evaluation History</h3>
          {filteredLogs.length === 0 ? (
            <div className="p-6 bg-white border border-slate-200 rounded-xl text-center text-xs text-slate-500">
              No audit logs found. Run an assessment to populate.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLogs.map((log) => {
                const isSelected = selectedLog?.id === log.id;
                return (
                  <div
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-emerald-50/50 border-emerald-500 shadow-sm"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 truncate max-w-[180px]">
                        {log.systemName}
                      </span>
                      <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                        {log.rulebookVersion}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 mt-1 flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{new Date(log.evaluatedAt).toLocaleString()}</span>
                    </p>

                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      <span className="text-slate-600">
                        Triggered: <strong>{log.rulesTriggeredCount}</strong> / {log.rulesEvaluatedCount}
                      </span>
                      <span className="text-emerald-700 font-mono text-[10px]">
                        {(log.deterministicHash || "SHA256-PENDING").substring(0, 10)}...
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column: Selected Log Detail */}
        <div className="lg:col-span-2">
          {selectedLog ? (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-6">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                    LOG ID: {selectedLog.id}
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 mt-0.5">{selectedLog.systemName}</h2>
                  <p className="text-xs text-slate-500">
                    Evaluator: {selectedLog.userEmail} • Assessment Date: {new Date(selectedLog.evaluatedAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded border border-slate-200 text-slate-700">
                    Rulebook {selectedLog.rulebookVersion}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyHash(selectedLog.deterministicHash || "")}
                    className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-slate-600 text-xs flex items-center space-x-1"
                    title="Copy SHA-256 Hash"
                  >
                    {copiedHash === (selectedLog.deterministicHash || "") ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span className="font-mono text-[11px]">Copy Seal</span>
                  </button>
                </div>
              </div>

              {/* Hash Banner */}
              <div className="p-3 bg-slate-900 text-emerald-400 rounded-lg font-mono text-xs flex items-center justify-between">
                <span className="text-slate-400">Cryptographic Seal:</span>
                <span className="font-bold">{selectedLog.deterministicHash || "SHA256-PENDING"}</span>
              </div>

              {/* Requirement 9: Detailed Rules Evaluated Matrix */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">
                    Evaluated Rules & Triggering Facts Breakdown ({selectedLog.ruleEvaluations.length})
                  </h3>
                  <span className="text-xs text-slate-500">Exact predicate evaluation trace</span>
                </div>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                  {selectedLog.ruleEvaluations.map((ev, idx) => {
                    const isTriggered = ev.result === "TRIGGERED";
                    return (
                      <div
                        key={idx}
                        className={`p-4 space-y-2 ${isTriggered ? "bg-white" : "bg-slate-50/60 opacity-80"}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                                isTriggered
                                  ? "bg-rose-100 text-rose-800 border border-rose-200"
                                  : "bg-slate-200 text-slate-600"
                              }`}
                            >
                              {ev.result}
                            </span>
                            <span className="text-xs font-bold font-mono text-slate-800">{ev.ruleId}</span>
                          </div>

                          <span className="text-xs font-mono text-slate-500">
                            Source Version: {ev.sourceVersion} (Eff: {ev.effectiveDate})
                          </span>
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-slate-900">Regulatory Source:</p>
                          <p className="text-xs text-slate-600 italic">{ev.regulatorySource}</p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-slate-900">Triggering Facts:</p>
                          {ev.triggeringFacts.length > 0 ? (
                            <ul className="list-disc list-inside text-xs text-emerald-800 font-mono space-y-0.5 mt-0.5 bg-emerald-50/60 p-2 rounded border border-emerald-100">
                              {ev.triggeringFacts.map((fact, fIdx) => (
                                <li key={fIdx}>{fact}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-slate-400 font-mono mt-0.5">None (Predicates not satisfied)</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 bg-white border border-slate-200 rounded-xl text-center text-slate-500 text-sm">
              Select an audit log to inspect its deterministic evaluation trace.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
