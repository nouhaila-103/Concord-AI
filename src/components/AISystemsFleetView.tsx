import React from "react";
import { AISystem } from "../types";
import { Plus, ShieldAlert, ShieldCheck, AlertCircle, Scale, Eye, RotateCcw, Clock, Sparkles, Dices } from "lucide-react";

interface AISystemsFleetViewProps {
  systems: AISystem[];
  onAddSystem: () => void;
  onSelectSystem: (system: AISystem) => void;
  onReevaluateSystem: (systemId: string) => void;
  onTriggerRandomDemo?: () => void;
}

export const AISystemsFleetView: React.FC<AISystemsFleetViewProps> = ({
  systems,
  onAddSystem,
  onSelectSystem,
  onReevaluateSystem,
  onTriggerRandomDemo,
}) => {
  const getRiskTierBadge = (tier: string) => {
    switch (tier) {
      case "Prohibited":
        return "bg-red-100 text-red-800 border-red-200";
      case "High Risk":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "Specific Transparency Risk":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Minimal / No Risk":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Fleet Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded">
              Enterprise Governance
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Total Managed Systems: {systems.length}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            AI Systems Fleet & Compliance Inventory
          </h1>
          <p className="text-sm text-slate-500">
            Centrally register, classify, and monitor organizational AI models against global regulatory frameworks.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 shrink-0">
          {onTriggerRandomDemo && (
            <button
              id="btn-fleet-random-demo"
              onClick={onTriggerRandomDemo}
              className="bg-white hover:bg-slate-50 text-emerald-700 border border-emerald-300 text-xs font-semibold px-3.5 py-2.5 rounded-lg shadow-2xs flex items-center space-x-1.5 transition-all"
              title="Generate a randomized AI system and view its full assessment result"
            >
              <Dices className="w-4 h-4 text-emerald-600" />
              <span>🎲 Random Demo</span>
            </button>
          )}

          <button
            id="btn-fleet-add-system"
            onClick={onAddSystem}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm flex items-center space-x-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add AI System</span>
          </button>
        </div>
      </div>

      {/* Systems Grid */}
      {systems.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <Scale className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No AI Systems Registered Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Click "Add AI System" to start the 13-question regulatory compliance questionnaire, or click "🎲 Random Demo" to instantly generate and evaluate a randomized enterprise AI system.
          </p>
          <div className="flex items-center justify-center space-x-3 pt-2">
            {onTriggerRandomDemo && (
              <button
                onClick={onTriggerRandomDemo}
                className="bg-white hover:bg-slate-50 text-emerald-700 border border-emerald-300 text-xs font-semibold px-4 py-2 rounded-lg inline-flex items-center space-x-1.5 shadow-2xs"
              >
                <Dices className="w-4 h-4 text-emerald-600" />
                <span>🎲 Random Demo</span>
              </button>
            )}
            <button
              onClick={onAddSystem}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-lg inline-flex items-center space-x-1.5 shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Add AI System Now</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {systems.map((sys) => (
            <div
              key={sys.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${getRiskTierBadge(
                      sys.riskTier
                    )}`}
                  >
                    {sys.riskTier}
                  </span>

                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                      sys.status === "Conflict Detected"
                        ? "bg-rose-50 text-rose-700 font-bold"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {sys.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 line-clamp-1">{sys.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {sys.extractedFacts?.system_profile?.intendedPurpose ||
                      sys.rawAnswers?.whatItDoes ||
                      "System pending full technical description"}
                  </p>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg text-xs space-y-1 text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Model / Provider:</span>
                    <span className="font-medium text-slate-800 truncate max-w-[130px]">
                      {sys.extractedFacts?.system_profile?.modelProvider || sys.rawAnswers?.modelProvider || "Proprietary"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Jurisdictions:</span>
                    <span className="font-medium text-slate-800 truncate max-w-[130px]">
                      {sys.extractedFacts?.geographic_scope?.isEUDeployed ? "EU • " : ""}
                      {sys.extractedFacts?.geographic_scope?.deployedUSStates?.join(", ") || "US"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(sys.updatedAt).toLocaleDateString()}</span>
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onReevaluateSystem(sys.id)}
                    className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition-colors"
                    title="Re-evaluate against current rulebook"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onSelectSystem(sys)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-md flex items-center space-x-1 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Dossier</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
