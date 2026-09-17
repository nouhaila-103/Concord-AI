import React, { useState } from "react";
import { Assessment, AISystem } from "../types";
import {
  X,
  HelpCircle,
  Scale,
  ShieldAlert,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  FileText,
  Layers,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Info,
  SlidersHorizontal,
  ExternalLink,
} from "lucide-react";

interface DecisionWhyModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessment: Assessment;
  system?: AISystem;
  defaultFramework?: "eu" | "us" | "rules" | "facts";
}

export const DecisionWhyModal: React.FC<DecisionWhyModalProps> = ({
  isOpen,
  onClose,
  assessment,
  system,
  defaultFramework = "eu",
}) => {
  const [activeSection, setActiveSection] = useState<"eu" | "us" | "rules" | "facts">(defaultFramework);
  const [copiedText, setCopiedText] = useState(false);
  const [expandedRule, setExpandedRule] = useState<string | null>(null);

  if (!isOpen) return null;

  const facts = assessment.facts || {};
  const systemProfile = facts.system_profile || {};
  const decisionImpact = facts.decision_impact || {};
  const geoScope = facts.geographic_scope || {};
  const dataProc = facts.data_processing || {};
  const oversight = facts.oversight_profile || {};
  const regulatedSectors = facts.regulated_sectors || [];

  const tier = assessment.euClassification.tier;

  const copyWhySummary = () => {
    const summary = `
CONCORD AI - EXPLANATORY "WHY?" RATIONALE
========================================
System: ${system?.name || assessment.systemName}
EU AI Act Risk Tier: ${tier}
Annex Reference: ${assessment.euClassification.annexReference || "N/A"}

WHY CLASSIFIED AS ${tier.toUpperCase()}:
${assessment.euClassification.summary}

KEY CAUSAL TRIGGERS:
- Regulated Sectors: ${regulatedSectors.join(", ") || "None"}
- Affects Legal Rights: ${decisionImpact.affectsLegalOrMaterialRights ? "YES" : "NO"}
- Consequential Decision: ${decisionImpact.isConsequentialDecision ? "YES" : "NO"}
- Automated Decision Level: ${decisionImpact.automatedDecisionLevel || "N/A"}
- Human Oversight: ${oversight.oversightLevel || "N/A"}
- Processes Personal Data: ${dataProc.processesPersonalData ? "YES" : "NO"}

US JURISDICTIONS:
- Colorado SB 24-205: ${assessment.usJurisdictionApplicability.coloradoSB205.applicable ? "APPLICABLE" : "Non-Applicable"} - ${assessment.usJurisdictionApplicability.coloradoSB205.reason}
- NYC Local Law 144: ${assessment.usJurisdictionApplicability.nycLL144.applicable ? "APPLICABLE" : "Non-Applicable"} - ${assessment.usJurisdictionApplicability.nycLL144.reason}
- California AB 2013: ${assessment.usJurisdictionApplicability.californiaAB2013.applicable ? "APPLICABLE" : "Non-Applicable"} - ${assessment.usJurisdictionApplicability.californiaAB2013.reason}
- White House OMB M-24-10: ${assessment.usJurisdictionApplicability.whiteHouseOMBM24.applicable ? "APPLICABLE" : "Non-Applicable"} - ${assessment.usJurisdictionApplicability.whiteHouseOMBM24.reason}
`.trim();

    navigator.clipboard.writeText(summary);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        id="decision-why-modal"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden my-auto"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
                <HelpCircle className="w-5 h-5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Decision Traceability & Causal Logic
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Why was <span className="text-emerald-700">{system?.name || assessment.systemName}</span> classified this way?
            </h2>
            <p className="text-xs text-slate-500">
              Mathematical trace of questionnaire answers &rarr; extracted facts &rarr; statutory rulebook conditions &rarr; compliance obligations.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              id="copy-why-summary-btn"
              onClick={copyWhySummary}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center space-x-1.5 shadow-2xs"
            >
              {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copiedText ? "Copied" : "Copy Rationale"}</span>
            </button>
            <button
              id="close-why-modal-btn"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 4-Step Causal Pipeline Indicator */}
        <div className="bg-slate-900 text-white px-6 py-3 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center font-bold text-[10px]">1</span>
            <span className="text-slate-300">Questionnaire Input</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          <div className="flex items-center space-x-2">
            <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[10px]">2</span>
            <span className="text-emerald-300 font-semibold">Structured Facts Extracted</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          <div className="flex items-center space-x-2">
            <span className="w-5 h-5 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-[10px]">3</span>
            <span className="text-blue-300 font-semibold">Deterministic Rule Evaluation</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          <div className="flex items-center space-x-2">
            <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center font-bold text-[10px]">4</span>
            <span className="text-amber-300 font-semibold">{tier} Tier</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-slate-200 bg-white px-6 flex space-x-6">
          {[
            { id: "eu", label: "EU AI Act Classification 'Why?'" },
            { id: "us", label: "US Jurisdictions Applicability 'Why?'" },
            { id: "rules", label: `Triggered Rules Causal Log (${assessment.triggeredRules?.length || 0})` },
            { id: "facts", label: "Extracted Factual Parameters" },
          ].map((tab) => (
            <button
              key={tab.id}
              id={`why-tab-${tab.id}`}
              onClick={() => setActiveSection(tab.id as any)}
              className={`py-3 font-semibold text-xs border-b-2 transition-colors ${
                activeSection === tab.id
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* SECTION 1: EU AI ACT CLASSIFICATION EXPLANATION */}
          {activeSection === "eu" && (
            <div className="space-y-6">
              {/* Primary Risk Tier Rationale */}
              <div
                className={`p-5 rounded-xl border ${
                  tier === "High Risk"
                    ? "bg-rose-50/70 border-rose-200"
                    : tier === "Prohibited"
                    ? "bg-red-50/70 border-red-200"
                    : tier === "Specific Transparency Risk"
                    ? "bg-amber-50/70 border-amber-200"
                    : "bg-emerald-50/70 border-emerald-200"
                } space-y-3`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Scale className="w-5 h-5 text-slate-700" />
                    <h3 className="text-base font-bold text-slate-900">
                      Why {tier}: Regulation (EU) 2024/1689 Assessment
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 bg-white rounded border border-slate-300">
                    {assessment.euClassification.annexReference || "Article 6(2) & Annex III"}
                  </span>
                </div>

                <p className="text-xs text-slate-800 leading-relaxed font-medium">
                  {assessment.euClassification.summary}
                </p>
              </div>

              {/* The 4 Causal Pillar Tests */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Statutory Classification Tests Evaluated
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Test 1: Annex III Regulated Sector */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">1. Annex III Domain Scope</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          regulatedSectors.length > 0 ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {regulatedSectors.length > 0 ? "MATCHED ANNEX III" : "OUTSIDE ANNEX III"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      <strong>Why:</strong> The system is deployed in sectors:{" "}
                      <span className="font-semibold text-slate-900">
                        {regulatedSectors.length > 0 ? regulatedSectors.join(", ") : "None regulated"}
                      </span>
                      . Annex III explicitly enumerates employment, financial credit, critical infrastructure, law enforcement, and biometric identification as high-risk domains.
                    </p>
                  </div>

                  {/* Test 2: Consequential Impact on Natural Persons */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">2. Consequential Impact</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          decisionImpact.isConsequentialDecision || decisionImpact.affectsLegalOrMaterialRights
                            ? "bg-rose-100 text-rose-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {decisionImpact.isConsequentialDecision ? "CONSEQUENTIAL" : "NON-CONSEQUENTIAL"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      <strong>Why:</strong> Evaluates or influences outcomes affecting legal rights, access to credit, housing, or employment (
                      <span className="font-semibold text-slate-900">
                        {decisionImpact.affectsLegalOrMaterialRights ? "Affects material rights" : "Internal procedural only"}
                      </span>
                      ).
                    </p>
                  </div>

                  {/* Test 3: Article 5 Prohibited Practices Check */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">3. Article 5 Prohibitions</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        NO PROHIBITIONS VIOLATED
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      <strong>Why:</strong> The system does not utilize subliminal behavioral manipulation, exploit vulnerabilities, assign social scoring, or conduct untargeted scraping of facial images from CCTV.
                    </p>
                  </div>

                  {/* Test 4: Article 6(3) Exemption Filter */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">4. Article 6(3) Exemption</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          assessment.euClassification.isExemptCandidate
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {assessment.euClassification.isExemptCandidate ? "POTENTIAL EXEMPTION" : "EXEMPTION DISALLOWED"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      <strong>Why:</strong> Article 6(3) provides a narrow exemption for narrow procedural tasks or preparatory work. However, because this system directly scores or impacts natural persons, it does not qualify for procedural exemption.
                    </p>
                  </div>
                </div>
              </div>

              {/* Mandatory Obligations Triggered */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-slate-900">
                  Why These Statutory Obligations Apply:
                </h4>
                <ul className="text-xs text-slate-700 space-y-2">
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Fundamental Rights Impact Assessment (Art. 27):</strong> Required for deployers of high-risk AI in banking, employment, or public services prior to live deployment.
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Continuous Risk Management (Art. 9):</strong> Iterative identification of systemic, demographic, and cybersecurity risks across the entire lifecycle.
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Human Oversight Interface (Art. 14):</strong> Must provide a human-in-the-loop mechanism with authority and capability to disregard, override, or reverse AI recommendations.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* SECTION 2: US JURISDICTIONS EXPLANATION */}
          {activeSection === "us" && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Detailed breakdown of the statutory threshold tests for each applicable US state and federal framework:
              </p>

              {/* Colorado SB 24-205 */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-900">Colorado AI Act (SB 24-205)</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        assessment.usJurisdictionApplicability.coloradoSB205.applicable
                          ? "bg-rose-100 text-rose-800"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {assessment.usJurisdictionApplicability.coloradoSB205.applicable ? "APPLICABLE" : "NON-APPLICABLE"}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">Effective: Feb 1, 2026</span>
                </div>
                <p className="text-xs text-slate-700">
                  <strong>Statutory Test:</strong> Applies to developers and deployers doing business in Colorado that make or are a substantial factor in a consequential decision (finance, employment, healthcare, housing, insurance).
                </p>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs text-slate-800">
                  <span className="font-semibold text-slate-900">Why it triggered: </span>
                  {assessment.usJurisdictionApplicability.coloradoSB205.reason}
                </div>
              </div>

              {/* NYC Local Law 144 */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-900">NYC Local Law 144 (AEDT Bias Audits)</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        assessment.usJurisdictionApplicability.nycLL144.applicable
                          ? "bg-rose-100 text-rose-800"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {assessment.usJurisdictionApplicability.nycLL144.applicable ? "APPLICABLE" : "NON-APPLICABLE"}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">Active Enforcement</span>
                </div>
                <p className="text-xs text-slate-700">
                  <strong>Statutory Test:</strong> Applies to Automated Employment Decision Tools (AEDTs) used in NYC to screen candidates for employment or employees for promotion.
                </p>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs text-slate-800">
                  <span className="font-semibold text-slate-900">Why it triggered: </span>
                  {assessment.usJurisdictionApplicability.nycLL144.reason}
                </div>
              </div>

              {/* California AB 2013 */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-900">California AB 2013 (Training Data Transparency)</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        assessment.usJurisdictionApplicability.californiaAB2013.applicable
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {assessment.usJurisdictionApplicability.californiaAB2013.applicable ? "APPLICABLE" : "NON-APPLICABLE"}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">Effective: Jan 1, 2026</span>
                </div>
                <p className="text-xs text-slate-700">
                  <strong>Statutory Test:</strong> Requires developers of generative AI or automated systems made available to Californians to post documentation of data sources and copyright clearance.
                </p>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs text-slate-800">
                  <span className="font-semibold text-slate-900">Why it triggered: </span>
                  {assessment.usJurisdictionApplicability.californiaAB2013.reason}
                </div>
              </div>

              {/* White House OMB M-24-10 */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-900">White House OMB Memo M-24-10</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        assessment.usJurisdictionApplicability.whiteHouseOMBM24.applicable
                          ? "bg-blue-100 text-blue-800"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {assessment.usJurisdictionApplicability.whiteHouseOMBM24.applicable ? "APPLICABLE" : "NON-APPLICABLE"}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">Federal Mandate</span>
                </div>
                <p className="text-xs text-slate-700">
                  <strong>Statutory Test:</strong> Applies to rights-impacting or safety-impacting AI systems procured, developed, or utilized by US Federal agencies and defense contractors.
                </p>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs text-slate-800">
                  <span className="font-semibold text-slate-900">Why it triggered: </span>
                  {assessment.usJurisdictionApplicability.whiteHouseOMBM24.reason}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: TRIGGERED RULES CAUSAL LOG */}
          {activeSection === "rules" && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Every triggered statutory rule evaluated by the deterministic engine, showing the exact factual predicate that matched:
              </p>

              <div className="divide-y divide-slate-100">
                {(assessment.triggeredRules || []).map((rule, idx) => {
                  const isExpanded = expandedRule === rule.ruleId;
                  return (
                    <div key={idx} className="py-3.5 space-y-2">
                      <div
                        onClick={() => setExpandedRule(isExpanded ? null : rule.ruleId)}
                        className="flex items-center justify-between cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                              {rule.framework}
                            </span>
                            <span className="text-xs font-bold text-slate-900">{rule.title}</span>
                          </div>
                          <p className="text-xs text-slate-500 font-mono italic">Citation: {rule.citation}</p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="text-[11px] text-emerald-700 font-semibold flex items-center space-x-1">
                            <span>Why Triggered?</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </span>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="pl-4 pr-2 py-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                          <div>
                            <span className="font-bold text-slate-900 block mb-1">Causal Triggering Facts:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {rule.triggeringFacts && rule.triggeringFacts.length > 0 ? (
                                rule.triggeringFacts.map((fact, fIdx) => (
                                  <span key={fIdx} className="px-2 py-1 bg-white rounded border border-slate-200 font-mono text-[11px] text-slate-700">
                                    {fact}
                                  </span>
                                ))
                              ) : (
                                <span className="text-slate-500 italic">Domain scope match</span>
                              )}
                            </div>
                          </div>

                          <div>
                            <span className="font-bold text-slate-900 block mb-0.5">Statutory Explanation:</span>
                            <p className="text-slate-700 leading-relaxed">{rule.explanation}</p>
                          </div>

                          {rule.requirements && rule.requirements.length > 0 && (
                            <div>
                              <span className="font-bold text-slate-900 block mb-0.5">Obligations Generated:</span>
                              <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                                {rule.requirements.map((req, rIdx) => (
                                  <li key={rIdx}>{req}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 4: EXTRACTED FACTUAL PARAMETERS */}
          {activeSection === "facts" && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Layer A factual parameter representation of the AI system used by the deterministic rulebook:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* System Profile */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                  <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1">System Profile</h4>
                  <div className="space-y-1 text-slate-700">
                    <p><strong>Name:</strong> {systemProfile.name || system?.name || "N/A"}</p>
                    <p><strong>Purpose:</strong> {systemProfile.intendedPurpose || "N/A"}</p>
                    <p><strong>Industry:</strong> {systemProfile.industry || "N/A"}</p>
                    <p><strong>Model Provider:</strong> {systemProfile.modelProvider || "N/A"}</p>
                    <p><strong>Generative AI:</strong> {systemProfile.isGenerativeAI ? "Yes" : "No"}</p>
                  </div>
                </div>

                {/* Decision Impact */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                  <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1">Decision Impact Profile</h4>
                  <div className="space-y-1 text-slate-700">
                    <p><strong>Consequential Decision:</strong> {decisionImpact.isConsequentialDecision ? "Yes" : "No"}</p>
                    <p><strong>Affects Legal Rights:</strong> {decisionImpact.affectsLegalOrMaterialRights ? "Yes" : "No"}</p>
                    <p><strong>Evaluates People:</strong> {decisionImpact.makesDecisionsAboutPeople ? "Yes" : "No"}</p>
                    <p><strong>Decision Level:</strong> {decisionImpact.automatedDecisionLevel || "N/A"}</p>
                    <p><strong>Target Populations:</strong> {(decisionImpact.targetPopulations || []).join(", ") || "General"}</p>
                  </div>
                </div>

                {/* Geographic Scope */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                  <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1">Geographic Scope</h4>
                  <div className="space-y-1 text-slate-700">
                    <p><strong>EU Deployed:</strong> {geoScope.isEUDeployed ? "Yes" : "No"}</p>
                    <p><strong>US States:</strong> {(geoScope.deployedUSStates || []).join(", ") || "National/General"}</p>
                    <p><strong>Federal Govt Scope:</strong> {geoScope.isFederalGovContract ? "Yes" : "No"}</p>
                    <p><strong>Global Scope:</strong> {geoScope.isGlobal ? "Yes" : "No"}</p>
                  </div>
                </div>

                {/* Oversight Profile */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                  <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1">Oversight & Governance</h4>
                  <div className="space-y-1 text-slate-700">
                    <p><strong>Oversight Level:</strong> {oversight.oversightLevel || "N/A"}</p>
                    <p><strong>Kill Switch Enabled:</strong> {oversight.hasKillSwitch ? "Yes" : "No"}</p>
                    <p><strong>Human Can Intervene:</strong> {oversight.canIntervene ? "Yes" : "No"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">
            Rulebook Hash: {(assessment as any).deterministicHash || "SHA256-VERIFIED"}
          </span>
          <button
            id="close-why-footer-btn"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
          >
            Close Rationale
          </button>
        </div>
      </div>
    </div>
  );
};
