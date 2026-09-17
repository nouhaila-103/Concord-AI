import React, { useState, useEffect } from "react";
import { Assessment, AISystem } from "../types";
import {
  ShieldAlert,
  ShieldCheck,
  AlertCircle,
  FileDown,
  Scale,
  CheckCircle2,
  FileQuestion,
  BookOpen,
  Layers,
  ArrowRight,
  ExternalLink,
  RotateCcw,
  Check,
  Copy,
  Clock,
  Sparkles,
  Upload,
  FileCheck,
  Loader2,
  HelpCircle,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import { generateAssessmentPDF } from "../utils/pdfGenerator";
import { EvidenceUploadModal, EvidenceItem } from "./EvidenceUploadModal";
import { DecisionWhyModal } from "./DecisionWhyModal";
import { ProblemSolvingTipsView } from "./ProblemSolvingTipsView";

interface AssessmentResultsViewProps {
  assessment: Assessment;
  system?: AISystem;
  onOpenReportModal: () => void;
  onReevaluate: () => void;
  onViewAuditLog: () => void;
}

export const AssessmentResultsView: React.FC<AssessmentResultsViewProps> = ({
  assessment,
  system,
  onOpenReportModal,
  onReevaluate,
  onViewAuditLog,
}) => {
  const [currentAssessment, setCurrentAssessment] = useState<Assessment>(assessment);
  const [activeTab, setActiveTab] = useState<"overview" | "tips" | "requirements" | "evidence" | "risks" | "legal" | "citations">("overview");
  const [copiedHash, setCopiedHash] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedEvidenceIndex, setSelectedEvidenceIndex] = useState<number | null>(null);

  // Explanatory "Why?" States
  const [isWhyModalOpen, setIsWhyModalOpen] = useState(false);
  const [whyFramework, setWhyFramework] = useState<"eu" | "us" | "rules" | "facts">("eu");
  const [showInlineEUWhy, setShowInlineEUWhy] = useState(false);
  const [expandedUSWhy, setExpandedUSWhy] = useState<Record<string, boolean>>({});
  const [expandedReqWhy, setExpandedReqWhy] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setCurrentAssessment(assessment);
  }, [assessment]);

  const [requirementsState, setRequirementsState] = useState<Record<string, "Pending" | "In Review" | "Satisfied">>(
    assessment.aggregatedRequirements.reduce((acc, req) => ({ ...acc, [req.id]: req.status }), {})
  );

  const handleDirectPDFDownload = () => {
    try {
      setIsDownloadingPDF(true);
      generateAssessmentPDF(currentAssessment, system?.name);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setTimeout(() => setIsDownloadingPDF(false), 500);
    }
  };

  const handleOpenEvidenceUpload = (index: number) => {
    setSelectedEvidenceIndex(index);
    setIsUploadModalOpen(true);
  };

  const handleEvidenceUploaded = async (
    index: number,
    artifact: {
      fileName: string;
      fileSize: string;
      uploadedAt: string;
      notes: string;
      referenceId: string;
    }
  ) => {
    const updatedList = [...(currentAssessment.missingEvidenceList || [])];
    if (updatedList[index]) {
      updatedList[index] = {
        ...updatedList[index],
        status: "Uploaded",
        evidenceArtifact: artifact,
      };
    }
    const newScore = Math.min(95, (currentAssessment.complianceScore || 40) + 6);
    const updated = {
      ...currentAssessment,
      missingEvidenceList: updatedList,
      complianceScore: newScore,
    };
    setCurrentAssessment(updated);

    try {
      await fetch(`/api/assessments/${currentAssessment.id}/evidence`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemIndex: index, evidenceArtifact: artifact }),
      });
    } catch (err) {
      console.error("Evidence upload sync error:", err);
    }
  };

  const toggleReqStatus = (id: string) => {
    setRequirementsState((prev) => {
      const current = prev[id] || "Pending";
      const next = current === "Pending" ? "In Review" : current === "In Review" ? "Satisfied" : "Pending";
      return { ...prev, [id]: next };
    });
  };

  const copyDeterministicHash = () => {
    const hash = (assessment as any).deterministicHash || (assessment as any).auditLog?.deterministicHash || "SHA256-VERIFIED";
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  // EU Tier Styling
  const getEUTierBadge = (tier: string) => {
    switch (tier) {
      case "Prohibited":
        return {
          bg: "bg-red-500/10 text-red-700 border-red-300",
          icon: ShieldAlert,
          title: "PROHIBITED (Article 5)",
        };
      case "High Risk":
        return {
          bg: "bg-rose-500/10 text-rose-700 border-rose-300",
          icon: AlertCircle,
          title: "HIGH-RISK AI SYSTEM (Article 6 & Annex III)",
        };
      case "Specific Transparency Risk":
        return {
          bg: "bg-amber-500/10 text-amber-800 border-amber-300",
          icon: Scale,
          title: "SPECIFIC TRANSPARENCY RISK (Article 50)",
        };
      default:
        return {
          bg: "bg-emerald-500/10 text-emerald-800 border-emerald-300",
          icon: ShieldCheck,
          title: "MINIMAL / NO RISK",
        };
    }
  };

  const euBadge = getEUTierBadge(assessment.euClassification.tier);
  const EUBadgeIcon = euBadge.icon;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner & Assessment Identity */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Rulebook {assessment.rulebookVersion}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Evaluated: {new Date(assessment.evaluatedAt).toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">By: {assessment.evaluatedBy}</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{assessment.systemName}</span>
          </h1>

          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            {assessment.facts?.system_profile?.intendedPurpose || "Deterministic statutory regulatory assessment result"}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="btn-explain-why"
            onClick={() => {
              setWhyFramework("eu");
              setIsWhyModalOpen(true);
            }}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-semibold px-3 py-2 rounded-lg shadow-2xs flex items-center space-x-1.5 transition-colors"
            title="Explanatory 'Why?': Detailed statutory decision rationale"
          >
            <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Why? Explain Logic</span>
          </button>

          <button
            id="btn-direct-download-pdf"
            onClick={handleDirectPDFDownload}
            disabled={isDownloadingPDF}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm flex items-center space-x-1.5 transition-colors"
            title="Download official PDF compliance dossier"
          >
            {isDownloadingPDF ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileDown className="w-3.5 h-3.5" />
            )}
            <span>Download PDF</span>
          </button>

          <button
            id="btn-open-report"
            onClick={onOpenReportModal}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm flex items-center space-x-2 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>View Dossier</span>
          </button>

          <button
            id="btn-reevaluate"
            onClick={onReevaluate}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold px-3 py-2 rounded-lg shadow-sm flex items-center space-x-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Re-evaluate</span>
          </button>

          <button
            id="btn-view-audit-log"
            onClick={onViewAuditLog}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold px-3 py-2 rounded-lg shadow-sm flex items-center space-x-1.5 transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>Audit Trail</span>
          </button>
        </div>
      </div>

      {/* Real-time Regulatory Conflict Alert Bar (if triggered) */}
      {assessment.conflictAlerts && assessment.conflictAlerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-amber-900">
                Compliance Conflict & Regulatory Alert Detected ({assessment.conflictAlerts.length})
              </h4>
              {assessment.conflictAlerts.map((alert) => (
                <div key={alert.id} className="text-xs text-amber-800">
                  <span className="font-semibold">{alert.title}:</span> {alert.description}{" "}
                  <span className="font-semibold underline ml-1">Remedy: {alert.recommendation}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Primary Tab Navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8 overflow-x-auto">
          {[
            { id: "overview", label: "Overview & Classifications" },
            {
              id: "tips",
              label: `Tips to Solve Problems (${
                (currentAssessment.missingEvidenceList?.length || 0) +
                (currentAssessment.conflictAlerts?.length || 0) +
                2
              })`,
            },
            { id: "requirements", label: `Applicable Requirements (${assessment.aggregatedRequirements.length})` },
            { id: "evidence", label: `Missing Evidence (${assessment.missingEvidenceList.length})` },
            { id: "risks", label: `Identified Risk Areas (${assessment.riskAreasList.length})` },
            { id: "legal", label: `Legal Review (${assessment.questionsRequiringLegalReview.length})` },
            { id: "citations", label: `Source Citations (${assessment.sourceCitations.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              id={`tab-btn-${tab.id}`}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "border-emerald-600 text-emerald-700 font-semibold"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* TAB 1: OVERVIEW & CLASSIFICATIONS */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Main Classification Cards: EU & US Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. EU AI Act Classification Card */}
            <div className={`p-6 rounded-xl border ${euBadge.bg} shadow-sm space-y-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <EUBadgeIcon className="w-6 h-6" />
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      European Union (Regulation 2024/1689)
                    </span>
                    <h3 className="text-lg font-bold">{euBadge.title}</h3>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setWhyFramework("eu");
                      setIsWhyModalOpen(true);
                    }}
                    className="text-xs font-bold px-2.5 py-1 bg-white hover:bg-slate-50 text-emerald-800 rounded border border-slate-300 shadow-2xs flex items-center space-x-1"
                    title="Explanatory 'Why?': Detailed statutory rationale"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Why?</span>
                  </button>
                  <span className="text-xs font-mono px-2 py-1 bg-white/70 rounded border border-slate-300">
                    {assessment.euClassification.annexReference || "Regulation (EU) 2024/1689"}
                  </span>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-slate-800">
                {assessment.euClassification.summary}
              </p>

              <div className="bg-white/80 rounded-lg p-3 border border-slate-200 text-xs text-slate-700 space-y-1">
                <p className="font-semibold text-slate-900">Enforcement Impact:</p>
                {assessment.euClassification.tier === "High Risk" ? (
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                    <li>Mandatory Fundamental Rights Impact Assessment (FRIA) prior to market placement.</li>
                    <li>Technical Documentation per Annex IV & CE-marking conformity pathway.</li>
                    <li>Official EU High-Risk Database registration under Article 71.</li>
                  </ul>
                ) : assessment.euClassification.tier === "Prohibited" ? (
                  <p className="text-red-700 font-semibold">
                    Deployment in the EU single market is strictly banned. Immediate decommissioning required.
                  </p>
                ) : assessment.euClassification.tier === "Specific Transparency Risk" ? (
                  <p className="text-amber-800">
                    Direct notification to natural persons and machine-readable synthetic output watermarking required (Art. 50).
                  </p>
                ) : (
                  <p className="text-emerald-700">
                    System falls within Minimal Risk tier. Voluntary adherence to AI Codes of Conduct recommended.
                  </p>
                )}
              </div>

              {/* Explanatory "Why?" Accordion for EU Classification */}
              <div className="pt-2 border-t border-slate-200/70">
                <button
                  type="button"
                  id="btn-toggle-inline-eu-why"
                  onClick={() => setShowInlineEUWhy(!showInlineEUWhy)}
                  className="w-full flex items-center justify-between text-xs font-bold text-slate-800 hover:text-slate-950 py-1"
                >
                  <span className="flex items-center space-x-1.5">
                    <HelpCircle className="w-4 h-4 text-emerald-700" />
                    <span>Why was this system classified as {assessment.euClassification.tier}?</span>
                  </span>
                  {showInlineEUWhy ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showInlineEUWhy && (
                  <div className="mt-2.5 p-3.5 bg-white/95 rounded-lg border border-slate-300 text-xs text-slate-700 space-y-2.5 shadow-2xs">
                    <div className="space-y-1">
                      <span className="font-bold text-slate-900 block">Statutory Causal Determinants:</span>
                      <ul className="list-disc list-inside space-y-1 text-slate-700">
                        <li>
                          <strong>Regulated Domain (Annex III):</strong>{" "}
                          {assessment.facts?.regulated_sectors && assessment.facts.regulated_sectors.length > 0
                            ? assessment.facts.regulated_sectors.join(", ")
                            : "Regulated sector match (Finance/Credit, Employment, Critical Infrastructure, or Public Services)"}
                        </li>
                        <li>
                          <strong>Consequential Impact on Natural Persons:</strong>{" "}
                          {assessment.facts?.decision_impact?.isConsequentialDecision || assessment.facts?.decision_impact?.affectsLegalOrMaterialRights
                            ? "System makes or substantially influences decisions affecting material legal or economic outcomes."
                            : "System provides advisory procedural support."}
                        </li>
                        <li>
                          <strong>Article 6(3) Exemption Filter:</strong>{" "}
                          {assessment.euClassification.isExemptCandidate
                            ? "Eligible for narrow procedural exemption review."
                            : "Exemption disallowed because the system performs profiling of natural persons or directly affects outcomes."}
                        </li>
                      </ul>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 font-mono">Article 6(2) & Annex III</span>
                      <button
                        type="button"
                        onClick={() => {
                          setWhyFramework("eu");
                          setIsWhyModalOpen(true);
                        }}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline flex items-center space-x-1"
                      >
                        <span>View Full Causal Flowchart & Logs</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 2. US Jurisdiction Applicability Matrix */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    United States Jurisdictions
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">Applicability Matrix</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setWhyFramework("us");
                      setIsWhyModalOpen(true);
                    }}
                    className="text-xs font-bold px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded border border-slate-200 flex items-center space-x-1"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                    <span>Why?</span>
                  </button>
                  <span className="text-xs font-medium px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200">
                    State & Federal
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {/* Colorado SB 205 */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-900">Colorado AI Act (SB 24-205)</span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            assessment.usJurisdictionApplicability.coloradoSB205.applicable
                              ? "bg-rose-100 text-rose-800"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {assessment.usJurisdictionApplicability.coloradoSB205.applicable ? "APPLICABLE (High-Risk)" : "Non-Applicable"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        {assessment.usJurisdictionApplicability.coloradoSB205.reason}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setExpandedUSWhy((prev) => ({ ...prev, colorado: !prev.colorado }))
                      }
                      className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 flex items-center space-x-0.5 shrink-0 ml-2"
                    >
                      <span>Why?</span>
                      {expandedUSWhy.colorado ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>

                  {expandedUSWhy.colorado && (
                    <div className="p-2.5 bg-white rounded border border-slate-200 text-[11px] text-slate-700 space-y-1">
                      <p className="font-bold text-slate-900">Statutory Threshold Analysis (C.R.S. § 6-1-1701):</p>
                      <p>
                        {assessment.usJurisdictionApplicability.coloradoSB205.applicable
                          ? "Triggered because the AI system is a 'substantial factor' in consequential decisions concerning financial lending, employment, housing, or healthcare for Colorado consumers."
                          : "Did not meet the statutory threshold of being a substantial factor in consequential decisions under Colorado law."}
                      </p>
                      <p className="text-slate-500 italic">Effective Date: February 1, 2026</p>
                    </div>
                  )}
                </div>

                {/* NYC Local Law 144 */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-900">NYC Local Law 144 (AEDT)</span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            assessment.usJurisdictionApplicability.nycLL144.applicable
                              ? "bg-rose-100 text-rose-800"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {assessment.usJurisdictionApplicability.nycLL144.applicable ? "APPLICABLE (AEDT Tool)" : "Non-Applicable"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        {assessment.usJurisdictionApplicability.nycLL144.reason}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setExpandedUSWhy((prev) => ({ ...prev, nyc: !prev.nyc }))
                      }
                      className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 flex items-center space-x-0.5 shrink-0 ml-2"
                    >
                      <span>Why?</span>
                      {expandedUSWhy.nyc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>

                  {expandedUSWhy.nyc && (
                    <div className="p-2.5 bg-white rounded border border-slate-200 text-[11px] text-slate-700 space-y-1">
                      <p className="font-bold text-slate-900">Statutory Threshold Analysis (NYC Admin Code § 20-870):</p>
                      <p>
                        {assessment.usJurisdictionApplicability.nycLL144.applicable
                          ? "Triggered because the tool substantially screens, evaluates, or ranks candidates for employment or promotion residing within the City of New York, mandating an independent bias audit within 12 months."
                          : "Non-applicable because the system's intended purpose does not involve employment candidate screening or employee promotions."}
                      </p>
                      <p className="text-slate-500 italic">Enforcement Date: July 5, 2023</p>
                    </div>
                  )}
                </div>

                {/* California AB 2013 */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-900">California AB 2013 (Data Transparency)</span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            assessment.usJurisdictionApplicability.californiaAB2013.applicable
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {assessment.usJurisdictionApplicability.californiaAB2013.applicable ? "APPLICABLE" : "Non-Applicable"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        {assessment.usJurisdictionApplicability.californiaAB2013.reason}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setExpandedUSWhy((prev) => ({ ...prev, ca: !prev.ca }))
                      }
                      className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 flex items-center space-x-0.5 shrink-0 ml-2"
                    >
                      <span>Why?</span>
                      {expandedUSWhy.ca ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>

                  {expandedUSWhy.ca && (
                    <div className="p-2.5 bg-white rounded border border-slate-200 text-[11px] text-slate-700 space-y-1">
                      <p className="font-bold text-slate-900">Statutory Threshold Analysis (Cal. Civ. Code § 1798.500):</p>
                      <p>
                        {assessment.usJurisdictionApplicability.californiaAB2013.applicable
                          ? "Requires public posting of high-level training data documentation (sources, licenses, whether personal data was used) for models made available to California consumers."
                          : "Non-applicable because the model is not released or made available directly or indirectly to California residents."}
                      </p>
                      <p className="text-slate-500 italic">Effective Date: January 1, 2026</p>
                    </div>
                  )}
                </div>

                {/* White House OMB Memo M-24-10 */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-900">White House OMB M-24-10</span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            assessment.usJurisdictionApplicability.whiteHouseOMBM24.applicable
                              ? "bg-blue-100 text-blue-800"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {assessment.usJurisdictionApplicability.whiteHouseOMBM24.applicable ? "APPLICABLE (Federal Scope)" : "Non-Applicable"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        {assessment.usJurisdictionApplicability.whiteHouseOMBM24.reason}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setExpandedUSWhy((prev) => ({ ...prev, omb: !prev.omb }))
                      }
                      className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 flex items-center space-x-0.5 shrink-0 ml-2"
                    >
                      <span>Why?</span>
                      {expandedUSWhy.omb ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>

                  {expandedUSWhy.omb && (
                    <div className="p-2.5 bg-white rounded border border-slate-200 text-[11px] text-slate-700 space-y-1">
                      <p className="font-bold text-slate-900">Federal Agency Standard (OMB M-24-10 Section 5):</p>
                      <p>
                        Applies mandatory minimum risk management practices if deployed by federal agencies or federal contractor ecosystems for rights-impacting or safety-impacting purposes.
                      </p>
                    </div>
                  )}
                </div>

                {/* NIST AI RMF 1.0 */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-900">NIST AI RMF 1.0 (NIST AI 100-1)</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {assessment.usJurisdictionApplicability.nistApplicability.level}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Core Trustworthy Governance Functions: {assessment.usJurisdictionApplicability.nistApplicability.focusFunctions.join(" • ")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm text-center">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Compliance Score</span>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">{assessment.complianceScore}%</p>
              <span className="text-[11px] text-slate-500">Readiness index</span>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm text-center">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mandatory Requirements</span>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">{assessment.aggregatedRequirements.length}</p>
              <span className="text-[11px] text-slate-500">Statutory obligations</span>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm text-center">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Missing Evidence Gaps</span>
              <p className="text-3xl font-extrabold text-rose-600 mt-1">{assessment.missingEvidenceList.length}</p>
              <span className="text-[11px] text-slate-500">Action items</span>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm text-center">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Legal Escalations</span>
              <p className="text-3xl font-extrabold text-amber-600 mt-1">{assessment.questionsRequiringLegalReview.length}</p>
              <span className="text-[11px] text-slate-500">General counsel items</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TIPS TO SOLVE PROBLEMS */}
      {activeTab === "tips" && (
        <ProblemSolvingTipsView
          assessment={currentAssessment}
          system={system}
          onOpenUploadEvidence={handleOpenEvidenceUpload}
          onOpenWhyModal={() => {
            setWhyFramework("eu");
            setIsWhyModalOpen(true);
          }}
        />
      )}

      {/* TAB 3: APPLICABLE REQUIREMENTS */}
      {activeTab === "requirements" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-base font-bold text-slate-900">Mandatory Regulatory Requirements</h3>
              <p className="text-xs text-slate-500">
                Triggered deterministically based on system purpose, sector, and geographic deployment scope. Click status to cycle through Pending → In Review → Satisfied.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              {Object.values(requirementsState).filter((s) => s === "Satisfied").length} of {assessment.aggregatedRequirements.length} Satisfied
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {assessment.aggregatedRequirements.map((req) => {
              const status = requirementsState[req.id] || "Pending";
              return (
                <div key={req.id} className="py-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 max-w-2xl flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                        {req.framework.replace(/_/g, " ")}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">Eff: {req.effectiveDate}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-900">{req.title}</h4>
                    <p className="text-xs text-slate-500 italic">Citation: {req.sourceCitation}</p>

                    {/* Explanatory "Why did this rule trigger?" */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedReqWhy((prev) => ({ ...prev, [req.id]: !prev[req.id] }))
                        }
                        className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 flex items-center space-x-1"
                      >
                        <HelpCircle className="w-3 h-3" />
                        <span>{expandedReqWhy[req.id] ? "Hide 'Why?'" : "Why did this rule trigger?"}</span>
                      </button>

                      {expandedReqWhy[req.id] && (
                        <div className="mt-1.5 p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-1">
                          <p>
                            <strong>Statutory Basis:</strong> {req.sourceCitation} ({req.framework})
                          </p>
                          <p>
                            <strong>Triggering Facts:</strong> Triggered because the system operates in regulated domain (
                            {assessment.facts?.regulated_sectors && assessment.facts.regulated_sectors.length > 0
                              ? assessment.facts.regulated_sectors.join(", ")
                              : "High-Risk Domain"}
                            ) and processes personal data or makes consequential determinations under {req.framework}.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => toggleReqStatus(req.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center space-x-1.5 shrink-0 ${
                      status === "Satisfied"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                        : status === "In Review"
                        ? "bg-amber-50 text-amber-800 border-amber-300"
                        : "bg-slate-50 text-slate-600 border-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    {status === "Satisfied" && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    {status === "In Review" && <Clock className="w-3.5 h-3.5 text-amber-600" />}
                    <span>{status}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: MISSING EVIDENCE */}
      {activeTab === "evidence" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Compliance Evidence & Audit Artifacts</h3>
              <p className="text-xs text-slate-500">
                Mandatory technical files, bias audit certificates, and FRIA documentation required to clear regulatory gates.
              </p>
            </div>

            {/* Evidence Progress Counter */}
            <div className="flex items-center space-x-2.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 shrink-0">
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Evidence Status</span>
                <span className="text-xs font-bold text-slate-800">
                  {currentAssessment.missingEvidenceList.filter((e) => e.status === "Uploaded" || Boolean(e.evidenceArtifact)).length} / {currentAssessment.missingEvidenceList.length} Attached
                </span>
              </div>
              <div className="w-16 bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.round(
                      (currentAssessment.missingEvidenceList.filter((e) => e.status === "Uploaded" || Boolean(e.evidenceArtifact)).length /
                        (currentAssessment.missingEvidenceList.length || 1)) *
                        100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {currentAssessment.missingEvidenceList.map((ev, idx) => {
              const isUploaded = ev.status === "Uploaded" || Boolean(ev.evidenceArtifact);

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border transition-all ${
                    isUploaded
                      ? "bg-emerald-50/40 border-emerald-300 shadow-xs"
                      : "bg-slate-50/70 border-slate-200 hover:border-slate-300"
                  } flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center space-x-2">
                      {isUploaded ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-emerald-100 text-emerald-800 flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Attached & Verified</span>
                        </span>
                      ) : (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            ev.criticality === "Critical"
                              ? "bg-red-100 text-red-800"
                              : ev.criticality === "High"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {ev.criticality} Priority
                        </span>
                      )}
                      <span className="text-xs text-slate-500 font-medium">Framework: {ev.framework.replace(/_/g, " ")}</span>
                    </div>

                    <h4 className="text-sm font-semibold text-slate-900">{ev.item}</h4>

                    {isUploaded && ev.evidenceArtifact && (
                      <div className="p-2 bg-white rounded-lg border border-emerald-200 inline-flex items-center space-x-2 text-xs text-slate-700 mt-1">
                        <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-semibold text-slate-900">{ev.evidenceArtifact.fileName}</span>
                        <span className="text-slate-400">•</span>
                        <span className="font-mono text-emerald-800">{ev.evidenceArtifact.referenceId}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500">{new Date(ev.evidenceArtifact.uploadedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenEvidenceUpload(idx)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-semibold shrink-0 flex items-center space-x-1.5 shadow-xs transition-colors ${
                      isUploaded
                        ? "bg-white hover:bg-slate-50 text-slate-700 border border-slate-300"
                        : "bg-emerald-600 hover:bg-emerald-500 text-white"
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploaded ? "Replace Artifact" : "Upload Evidence"}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: RISK AREAS */}
      {activeTab === "risks" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="pb-4 border-b border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Identified High-Risk Vectors</h3>
            <p className="text-xs text-slate-500">
              Statutory vulnerabilities, algorithmic liability flags, and exposure vectors identified by the deterministic engine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assessment.riskAreasList.map((risk, idx) => (
              <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      risk.severity === "Critical"
                        ? "bg-red-100 text-red-800"
                        : risk.severity === "High"
                        ? "bg-rose-100 text-rose-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {risk.severity} Severity
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">{risk.framework}</span>
                </div>
                <h4 className="text-sm font-semibold text-slate-900">{risk.risk}</h4>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: LEGAL REVIEW QUESTIONS */}
      {activeTab === "legal" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="pb-4 border-b border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Questions Requiring Legal Counsel Review</h3>
            <p className="text-xs text-slate-500">
              Escalation queries tailored for internal corporate legal counsel and regulatory compliance officers.
            </p>
          </div>

          <div className="space-y-3">
            {assessment.questionsRequiringLegalReview.map((q, idx) => (
              <div key={idx} className="p-4 bg-amber-50/50 border border-amber-200 rounded-lg flex items-start space-x-3">
                <FileQuestion className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-amber-900">Legal Inquiry #{idx + 1}</span>
                  <p className="text-sm text-slate-800 mt-0.5 font-medium">{q}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: SOURCE CITATIONS */}
      {activeTab === "citations" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="pb-4 border-b border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Statutory Source Citations & Authorities</h3>
            <p className="text-xs text-slate-500">
              Official legal journal citations, article numbers, and effective dates underpinning this assessment.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {assessment.sourceCitations.map((cit, idx) => (
              <div key={idx} className="py-3 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                      {cit.framework}
                    </span>
                    <span className="text-xs text-slate-500">Effective: {cit.effectiveDate}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900">{cit.citation}</h4>
                  <p className="text-xs text-slate-600">{cit.article}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Evidence Upload Modal */}
      {selectedEvidenceIndex !== null && currentAssessment.missingEvidenceList[selectedEvidenceIndex] && (
        <EvidenceUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => {
            setIsUploadModalOpen(false);
            setSelectedEvidenceIndex(null);
          }}
          evidenceItem={currentAssessment.missingEvidenceList[selectedEvidenceIndex]}
          itemIndex={selectedEvidenceIndex}
          onUploadSuccess={handleEvidenceUploaded}
        />
      )}

      {/* Explanatory "Why?" Modal */}
      <DecisionWhyModal
        isOpen={isWhyModalOpen}
        onClose={() => setIsWhyModalOpen(false)}
        assessment={currentAssessment}
        system={system}
        defaultFramework={whyFramework}
      />
    </div>
  );
};
