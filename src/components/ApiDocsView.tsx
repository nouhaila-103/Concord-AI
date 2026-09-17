import React, { useState } from "react";
import { Code2, Copy, Check, Terminal, Play, CheckCircle2 } from "lucide-react";

export const ApiDocsView: React.FC<{ apiKey?: string }> = ({ apiKey = "cncrd_live_default123" }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [loadingTest, setLoadingTest] = useState(false);

  const copyCode = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleTestAPI = async () => {
    setLoadingTest(true);
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      setTestResponse(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setTestResponse(`Error: ${err.message}`);
    } finally {
      setLoadingTest(false);
    }
  };

  const endpoints = [
    {
      method: "POST",
      path: "/api/assess/extract-facts",
      title: "Layer A: Extract Structured Facts",
      description: "Converts raw 13-question system technical parameters into verified JSON facts without drawing legal conclusions.",
      requestExample: `{
  "systemName": "CandidateScreener v2",
  "whatItDoes": "Automated resume parsing and semantic ranking",
  "intendedPurpose": "Screen applicants for engineering positions",
  "industry": "Employment / HR",
  "deploymentLocations": "European Union, United States (Colorado, NYC)",
  "whoUsesIt": "Corporate recruiters",
  "whoIsAffected": "Job applicants",
  "makesDecisionsAboutPeople": true,
  "processesPersonalData": true,
  "processesSensitiveData": false,
  "affectedRegulatedAreas": ["employment"],
  "humanOversightDegree": "on-the-loop",
  "modelProvider": "Proprietary BERT Transformer",
  "decisionsAutomated": true
}`,
    },
    {
      method: "POST",
      path: "/api/assess/evaluate",
      title: "Layer B & C: Evaluate Deterministic Rules",
      description: "Evaluates structured facts strictly against the versioned statutory rulebook. Generates classifications, requirements, missing evidence, risk areas, legal review questions, and cryptographic hash.",
      requestExample: `{
  "systemName": "CandidateScreener v2",
  "facts": {
    "system_profile": { "name": "CandidateScreener v2", "intendedPurpose": "Screen applicants" },
    "geographic_scope": { "isEUDeployed": true, "deployedUSStates": ["CO", "NY"] },
    "decision_impact": { "isConsequentialDecision": true, "automatedDecisionLevel": "automated" },
    "data_processing": { "processesPersonalData": true },
    "regulated_sectors": ["employment"]
  }
}`,
    },
    {
      method: "GET",
      path: "/api/regulatory/conflicts",
      title: "Continuous Conflict Scan",
      description: "Scans all systems in the organization against current statutory amendments and enforcement deadlines.",
      requestExample: `// Headers:
// X-API-Key: ${apiKey}`,
    },
    {
      method: "GET",
      path: "/api/audit-logs",
      title: "Retrieve Cryptographic Audit Trail",
      description: "Returns immutable evaluation records with evaluated rules, triggering facts, and deterministic SHA-256 seals.",
      requestExample: `// Headers:
// X-API-Key: ${apiKey}`,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded">
              Enterprise SDK & REST
            </span>
            <span className="text-xs text-slate-500 font-mono">OpenAPI 3.0 Compatible</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Concord AI Developer API Documentation
          </h1>
          <p className="text-sm text-slate-500">
            Integrate deterministic compliance checks into CI/CD pipelines, MLOps registries, and governance workflows.
          </p>
        </div>

        {/* API Key Box */}
        <div className="p-3 bg-slate-900 text-white rounded-lg text-xs font-mono flex items-center space-x-3 shadow">
          <div>
            <span className="text-slate-400 block text-[10px]">ORGANIZATION API KEY</span>
            <span className="text-emerald-400 font-semibold">{apiKey}</span>
          </div>
          <button
            onClick={() => copyCode(apiKey, 999)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 transition-colors"
          >
            {copiedIndex === 999 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Quick Test Console */}
      <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-emerald-600" />
            <span>Interactive API Health Ping</span>
          </h3>
          <button
            onClick={handleTestAPI}
            disabled={loadingTest}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded flex items-center space-x-1.5 transition-colors disabled:opacity-50"
          >
            <Play className="w-3 h-3 text-emerald-400 fill-current" />
            <span>{loadingTest ? "Pinging..." : "Execute GET /api/health"}</span>
          </button>
        </div>

        {testResponse && (
          <pre className="p-3 bg-slate-950 text-emerald-400 rounded text-xs font-mono overflow-x-auto border border-slate-800">
            {testResponse}
          </pre>
        )}
      </div>

      {/* Endpoints Directory */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900">Core REST Endpoints</h2>

        <div className="space-y-4">
          {endpoints.map((ep, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      ep.method === "POST" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {ep.method}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-800">{ep.path}</span>
                </div>

                <button
                  onClick={() => copyCode(ep.requestExample, idx)}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center space-x-1"
                >
                  {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedIndex === idx ? "Copied" : "Copy Payload"}</span>
                </button>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-900">{ep.title}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{ep.description}</p>
              </div>

              <pre className="p-3 bg-slate-900 text-slate-200 rounded-lg text-xs font-mono overflow-x-auto border border-slate-800">
                {ep.requestExample}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
