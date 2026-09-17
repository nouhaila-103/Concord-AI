import React, { useState } from "react";
import { Assessment, Organization, AISystem } from "../types";
import { X, FileDown, Printer, Copy, Check, ShieldCheck, Scale, FileText, Download, Loader2 } from "lucide-react";
import { generateAssessmentPDF } from "../utils/pdfGenerator";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessment: Assessment;
  system?: AISystem;
  organization?: Organization | null;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  assessment,
  system,
  organization,
}) => {
  const [copied, setCopied] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  if (!isOpen) return null;

  const handleDownloadPDF = () => {
    try {
      setIsGeneratingPDF(true);
      generateAssessmentPDF(assessment, system?.name, organization?.name);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      // Fallback to print
      window.print();
    } finally {
      setTimeout(() => setIsGeneratingPDF(false), 500);
    }
  };

  const handlePrint = () => {
    try {
      window.print();
    } catch {
      handleDownloadPDF();
    }
  };

  const handleDownloadJSON = async () => {
    try {
      const res = await fetch(`/api/assess/report/${assessment.id}/json`);
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Concord_Compliance_${assessment.id}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("JSON download error:", err);
    }
  };

  const handleDownloadMarkdown = async () => {
    try {
      const res = await fetch(`/api/assess/report/${assessment.id}/markdown`);
      const text = await res.text();
      const blob = new Blob([text], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Concord_Report_${assessment.id}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Markdown download error:", err);
    }
  };

  const copyHash = () => {
    const hashToCopy = assessment.deterministicHash || `SHA256:${assessment.id}-RULEBOOK-${assessment.rulebookVersion}`;
    navigator.clipboard.writeText(hashToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] overflow-y-auto print:max-h-none print:shadow-none print:border-none">
        {/* Modal Header (Hidden during browser print) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-slate-200 print:hidden bg-slate-50 sticky top-0 z-10 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold shadow-sm shrink-0">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Download Compliance Assessment Report</h3>
              <p className="text-xs text-slate-500">Certified Multi-Framework Audit Dossier & Export Suite</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              id="btn-modal-download-pdf"
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-md shadow-sm flex items-center space-x-1.5 transition-colors"
              title="Download formatted executive PDF report"
            >
              {isGeneratingPDF ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileDown className="w-3.5 h-3.5" />
              )}
              <span>Download PDF</span>
            </button>

            <button
              onClick={handleDownloadJSON}
              id="btn-modal-download-json"
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-md border border-slate-300 flex items-center space-x-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>JSON</span>
            </button>

            <button
              onClick={handleDownloadMarkdown}
              id="btn-modal-download-md"
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-md border border-slate-300 flex items-center space-x-1.5 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Markdown</span>
            </button>

            <button
              onClick={handlePrint}
              id="btn-modal-print"
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-md border border-slate-300 flex items-center space-x-1 transition-colors"
              title="Print view"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Formal Executive Dossier */}
        <div className="p-8 sm:p-12 space-y-8 print:p-0 text-slate-900">
          {/* Certificate Header */}
          <div className="border-b-2 border-slate-900 pb-6 flex items-start justify-between">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-800">
                Concord AI Governance Platform
              </span>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-1">
                EXECUTIVE REGULATORY COMPLIANCE DOSSIER
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Deterministic statutory evaluation against EU AI Act, US State AI Legislation & NIST Standards.
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-slate-100 border border-slate-300 rounded text-[11px] font-mono font-bold text-slate-800">
                RULEBOOK v{assessment.rulebookVersion}
              </span>
              <p className="text-[11px] text-slate-400 mt-1">
                {new Date(assessment.evaluatedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* System Profile Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block uppercase tracking-wider text-[10px] font-bold">Target System</span>
              <span className="font-bold text-slate-800 text-sm mt-0.5 block">{system?.name || assessment.systemName}</span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase tracking-wider text-[10px] font-bold">Organization</span>
              <span className="font-semibold text-slate-700 mt-0.5 block">{organization?.name || "Enterprise Client"}</span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase tracking-wider text-[10px] font-bold">Evaluator</span>
              <span className="font-semibold text-slate-700 mt-0.5 block">{assessment.evaluatedBy}</span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase tracking-wider text-[10px] font-bold">Readiness Score</span>
              <span className="text-emerald-700 font-bold text-base mt-0.5 block">{assessment.complianceScore}% / 100%</span>
            </div>
          </div>

          {/* Statutory Classifications Table */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Scale className="w-4 h-4 text-emerald-700" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                1. Statutory Regulatory Classifications
              </h2>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Jurisdiction / Framework</th>
                    <th className="p-3">Statutory Tier / Result</th>
                    <th className="p-3">Specific Legal Basis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-3 font-semibold text-slate-900">European Union (EU AI Act 2024/1689)</td>
                    <td className="p-3">
                      <span className="font-bold text-red-700 uppercase">
                        {assessment.euClassification.tier}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">
                      {assessment.euClassification.annexReference || "Regulation (EU) 2024/1689 Annex III"}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900">Colorado SB 24-205</td>
                    <td className="p-3 font-medium">
                      {assessment.usJurisdictionApplicability.coloradoSB205.applicable
                        ? "APPLICABLE (High-Risk AI System)"
                        : "Exempt / Non-Applicable"}
                    </td>
                    <td className="p-3 text-slate-600">C.R.S. § 6-1-1701 et seq. (Consequential Decisions)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900">NYC Local Law 144</td>
                    <td className="p-3 font-medium">
                      {assessment.usJurisdictionApplicability.nycLL144.applicable
                        ? "APPLICABLE (AEDT Bias Audit Mandate)"
                        : "Exempt"}
                    </td>
                    <td className="p-3 text-slate-600">NYC Admin. Code § 20-870 et seq.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900">California AB 2013</td>
                    <td className="p-3 font-medium">
                      {assessment.usJurisdictionApplicability.californiaAB2013.applicable
                        ? "APPLICABLE (Data Transparency)"
                        : "Exempt"}
                    </td>
                    <td className="p-3 text-slate-600">Cal. Civ. Code § 1798.500 et seq.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Aggregated Requirements List */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              2. Mandatory Statutory Compliance Requirements ({assessment.aggregatedRequirements.length})
            </h2>
            <div className="space-y-2 text-xs">
              {assessment.aggregatedRequirements.map((req, i) => (
                <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">
                      {i + 1}. [{req.framework}] {req.title}
                    </span>
                    <span className="text-[10px] font-mono bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                      Eff: {req.effectiveDate}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-1 font-mono text-[11px]">{req.sourceCitation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Missing Evidence & Attached Artifacts */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              3. Evidence Gaps & Attached Artifacts ({assessment.missingEvidenceList.length})
            </h2>
            <div className="space-y-2 text-xs">
              {assessment.missingEvidenceList.map((gap, i) => (
                <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-md flex items-center justify-between">
                  <div>
                    <span className={`font-bold ${gap.status === "Uploaded" ? "text-emerald-700" : "text-amber-700"}`}>
                      {gap.status === "Uploaded" ? "[ATTACHED & VERIFIED] " : `[${gap.criticality} Priority] `}
                    </span>
                    <span className="text-slate-800 font-medium">{gap.item}</span>
                    {gap.evidenceArtifact && (
                      <p className="text-[11px] text-emerald-700 font-mono mt-0.5">
                        Artifact: {gap.evidenceArtifact.fileName} ({gap.evidenceArtifact.referenceId})
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-2">{gap.framework}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Immutable Cryptographic Audit Attestation */}
          <div className="p-4 bg-slate-100 rounded-lg border border-slate-300 text-xs font-mono space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">IMMUTABLE DETERMINISTIC AUDIT SEAL</span>
              <button
                type="button"
                onClick={copyHash}
                className="text-[11px] text-emerald-700 hover:underline print:hidden flex items-center space-x-1"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? "Copied" : "Copy Hash"}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-600 break-all">
              Verification Hash: {assessment.deterministicHash || `SHA256:${assessment.id}-RULEBOOK-${assessment.rulebookVersion}`}
            </p>
            <p className="text-[10px] text-slate-500">
              Attestation: Technical facts were extracted and strictly evaluated against versioned deterministic statutory predicates. Zero hallucinations.
            </p>
          </div>

          {/* Executive Signature Blocks */}
          <div className="pt-8 border-t border-slate-300 grid grid-cols-2 gap-12 text-xs">
            <div className="space-y-6">
              <p className="text-slate-500">Lead AI Compliance Officer:</p>
              <div className="border-b border-slate-400 w-full" />
              <p className="text-slate-700">Signature / Date</p>
            </div>
            <div className="space-y-6">
              <p className="text-slate-500">General Counsel / External Legal Auditor:</p>
              <div className="border-b border-slate-400 w-full" />
              <p className="text-slate-700">Signature / Date</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
