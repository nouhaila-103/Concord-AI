import React, { useState, useEffect } from "react";
import { BookOpen, Check, Layers, ExternalLink, Filter, Search, Tag } from "lucide-react";

export const RulesCatalogView: React.FC = () => {
  const [rulesData, setRulesData] = useState<{ currentVersion: string; totalRules: number; rules: any[] }>({
    currentVersion: "2026.2-FINAL",
    totalRules: 0,
    rules: [],
  });
  const [selectedFramework, setSelectedFramework] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/rules")
      .then((res) => res.json())
      .then((data) => {
        setRulesData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load rules:", err);
        setLoading(false);
      });
  }, []);

  const frameworks = ["ALL", "EU_AI_ACT", "COLORADO_SB_205", "NYC_LL_144", "CALIFORNIA_AB_2013", "WHITE_HOUSE_OMB_M24_10", "FTC_ACT", "NIST_AI_RMF"];

  const filteredRules = rulesData.rules.filter((r) => {
    const matchesFw = selectedFramework === "ALL" || r.framework === selectedFramework;
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.sourceCitation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFw && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded">
              Layer B: Structured Rulebook
            </span>
            <span className="text-xs text-slate-500 font-mono">Active Version: {rulesData.currentVersion}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Structured Regulatory Rules Database
          </h1>
          <p className="text-sm text-slate-500">
            Machine-interpretable statutory rule catalog with explicit logical predicates, source citations, and statutory versions.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-700 shadow-sm">
            Total Rules: <strong>{rulesData.totalRules}</strong>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Framework Tabs */}
        <div className="flex flex-wrap gap-1.5">
          {frameworks.map((fw) => (
            <button
              key={fw}
              onClick={() => setSelectedFramework(fw)}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
                selectedFramework === fw
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {fw.replace(/_/g, " ")}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Search rules, citations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Rules List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRules.map((rule) => (
          <div
            key={rule.id}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  {rule.id}
                </span>
                <span className="text-xs font-mono text-slate-500">
                  v{rule.sourceVersion} • Eff: {rule.effectiveDate}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900">{rule.title}</h3>
              <p className="text-xs text-slate-500 italic">Citation: {rule.sourceCitation}</p>
              <p className="text-xs text-slate-700 leading-relaxed">{rule.description}</p>
            </div>

            {/* Predicates Definition */}
            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
              <div>
                <span className="font-semibold text-slate-600 uppercase text-[10px] tracking-wider">
                  Logical Predicates ({rule.predicates.length}):
                </span>
                <div className="mt-1 space-y-1">
                  {rule.predicates.map((p: any, pIdx: number) => (
                    <div key={pIdx} className="bg-slate-50 p-1.5 rounded font-mono text-[11px] text-slate-700 border border-slate-200">
                      <span className="text-emerald-700 font-bold">{p.factPath}</span>{" "}
                      <span className="text-purple-700">{p.operator}</span>{" "}
                      <span className="text-slate-900">{JSON.stringify(p.expectedValue)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-[11px] text-slate-500">
                <strong>Trigger Outcome:</strong> Tier {rule.consequences.tier || "N/A"} • Requirements:{" "}
                {rule.consequences.requirements?.length || 0} items
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
