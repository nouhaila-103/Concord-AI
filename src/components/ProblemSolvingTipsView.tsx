import React, { useState } from "react";
import { Assessment, AISystem } from "../types";
import {
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Scale,
  Upload,
  Copy,
  Check,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileCheck,
  FileText,
  Sliders,
  Shield,
  HelpCircle,
  Compass,
} from "lucide-react";

interface ProblemSolvingTipsViewProps {
  assessment: Assessment;
  system?: AISystem;
  onOpenUploadEvidence?: (index: number) => void;
  onOpenWhyModal?: () => void;
}

export interface RemediationTip {
  id: string;
  category: "evidence" | "deescalation" | "conflict" | "legal";
  title: string;
  criticality: "Critical" | "High" | "Medium";
  framework: string;
  problemSummary: string;
  statutoryImpact: string;
  tips: string[];
  recommendedTools?: string[];
  checklistItems: string[];
  ownerRole: string;
  evidenceIndex?: number;
  isCompleted?: boolean;
}

export const ProblemSolvingTipsView: React.FC<ProblemSolvingTipsViewProps> = ({
  assessment,
  system,
  onOpenUploadEvidence,
  onOpenWhyModal,
}) => {
  const [activeCategory, setActiveCategory] = useState<"all" | "evidence" | "deescalation" | "conflict" | "legal">("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | "Critical" | "High">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [completedTips, setCompletedTips] = useState<Record<string, boolean>>({});
  const [copiedPlan, setCopiedPlan] = useState(false);
  const [expandedTipId, setExpandedTipId] = useState<string | null>(null);

  // Generate dynamic remediation tips from assessment problems
  const tipsList: RemediationTip[] = [];

  // 1. Generate tips for Missing Evidence Items
  (assessment.missingEvidenceList || []).forEach((ev, idx) => {
    let tips: string[] = [];
    let tools: string[] = [];
    let checklist: string[] = [];
    let owner = "MLOps & Compliance Lead";
    const itemLower = ev.item.toLowerCase();

    if (itemLower.includes("fundamental rights") || itemLower.includes("fria")) {
      tips = [
        "Conduct a cross-functional workshop between engineering and legal to map impacts on human dignity, non-discrimination, and privacy.",
        "Use the official EU Commission FRIA template to benchmark the system's operational risks against the Charter of Fundamental Rights.",
        "Formalize post-market monitoring indicators and establish an escalation channel for affected natural persons.",
      ];
      tools = ["EU Commission FRIA Template", "NIST AI RMF Playbook", "Amnesty Algorithmic Impact Framework"];
      checklist = [
        "Intended purpose and operational context identified",
        "Target vulnerable groups and protected categories mapped",
        "Fundamental rights risk mitigations documented",
        "Supervisory authority notification procedure defined",
      ];
      owner = "Data Protection Officer & Head of Legal";
    } else if (itemLower.includes("bias") || itemLower.includes("audit") || itemLower.includes("aedt")) {
      tips = [
        "Run an independent statistical bias audit measuring Disparate Impact Ratio across sex, race, and ethnicity using historical training and validation sets.",
        "Calculate the 4/5ths (80%) rule compliance: ensure selection rates for protected classes are >= 80% of the highest selection group.",
        "Publish the audit summary on your corporate website at least 10 business days prior to live NYC deployment as mandated by Local Law 144.",
      ];
      tools = ["Fairlearn (Microsoft)", "AIF360 (IBM)", "Aequitas (Carnegie Mellon)", "Audit-AI"];
      checklist = [
        "Selection rates and impact ratios tabulated per demographic group",
        "Independent auditor verification letter secured",
        "Public web disclosure URL prepared per NYC DCWP rules",
        "Candidate notice and opt-out mechanism established",
      ];
      owner = "Lead Data Scientist & External Auditor";
    } else if (itemLower.includes("technical documentation") || itemLower.includes("annex iv")) {
      tips = [
        "Assemble the Annex IV Technical Dossier detailing model architecture, design choices, training data provenance, and hyperparameter logs.",
        "Document hardware specifications, compute clusters, and latency requirements to demonstrate reproducibility.",
        "Maintain version-controlled documentation linked to specific commit hashes and container image digests.",
      ];
      tools = ["MLflow Model Registry", "Weights & Biases Model Cards", "DVC (Data Version Control)", "Sphinx / MkDocs"];
      checklist = [
        "General system architecture and algorithmic design documented",
        "Data lineage, collection methods, and cleaning protocols recorded",
        "Validation and testing metrics under normal and adversarial conditions",
        "Hardware resources, computational constraints, and energy efficiency logged",
      ];
      owner = "ML Platform Engineer & Solutions Architect";
    } else if (itemLower.includes("risk management") || itemLower.includes("article 9")) {
      tips = [
        "Implement a continuous Risk Management System (RMS) that operates iteratively throughout the entire lifecycle of the AI system.",
        "Evaluate foreseeable misuses, adversarial prompt injections, model hallucinations, and edge-case failure modes.",
        "Establish residual risk thresholds signed off by executive leadership before public release.",
      ];
      tools = ["NIST AI RMF 1.0", "ISO/IEC 42001 Standard", "OWASP Top 10 for LLMs", "MITRE ATLAS Matrix"];
      checklist = [
        "Known and foreseeable risks identified and categorized",
        "Risk mitigation measures tested and integrated into code",
        "Residual risk acceptance signed off by leadership",
        "Post-market risk monitoring triggers configured",
      ];
      owner = "Risk & Trust Officer";
    } else if (itemLower.includes("transparency") || itemLower.includes("ab 2013") || itemLower.includes("data")) {
      tips = [
        "Draft a public summary of datasets used to train the model, including source URLs, copyright licenses, and date ranges.",
        "Specify whether copyrighted works or personal data were ingested in the pre-training or fine-tuning pipelines.",
        "Host the transparency disclosure on an easily accessible public webpage prior to January 1, 2026.",
      ];
      tools = ["California Privacy Protection Agency Guidelines", "HuggingFace Dataset Cards", "Data Provenance Initiative"];
      checklist = [
        "Sources and owners of training datasets enumerated",
        "Data collection methodologies and licensing verified",
        "Synthetic data generation protocols documented",
        "Public transparency portal URL established",
      ];
      owner = "Data Governance Director";
    } else {
      tips = [
        `Gather verified documentation from your engineering and data science teams for: ${ev.item}.`,
        "Store the signed artifact in the Concord compliance vault with cryptographic SHA-256 hash tracking.",
        "Attach the completed PDF or certificate directly to this assessment to improve readiness score.",
      ];
      tools = ["Concord Evidence Vault", "Confluence Compliance Hub", "Notion Compliance Wiki"];
      checklist = [
        "Primary documentation authored and reviewed",
        "Peer review and engineering lead sign-off",
        "Uploaded to compliance vault",
      ];
      owner = "Compliance Project Manager";
    }

    tipsList.push({
      id: `ev-tip-${idx}`,
      category: "evidence",
      title: `Resolve Missing: ${ev.item}`,
      criticality: ev.criticality,
      framework: ev.framework,
      problemSummary: `The regulatory engine identified that mandatory artifact '${ev.item}' is currently missing from the compliance dossier.`,
      statutoryImpact:
        ev.criticality === "Critical"
          ? "Blocks CE-marking or market deployment; triggers immediate civil penalties or injunctions."
          : "Flags audit non-conformity during supervisory inspections.",
      tips,
      recommendedTools: tools,
      checklistItems: checklist,
      ownerRole: owner,
      evidenceIndex: idx,
      isCompleted: ev.status === "Uploaded" || Boolean(ev.evidenceArtifact),
    });
  });

  // 2. Generate tips for Risk De-escalation & Safe Harbors
  if (assessment.euClassification.tier === "High Risk" || assessment.usJurisdictionApplicability.coloradoSB205.applicable) {
    tipsList.push({
      id: "deescalate-human-in-loop",
      category: "deescalation",
      title: "Risk De-escalation: Establish Binding Human-in-the-Loop Oversight",
      criticality: "High",
      framework: "EU_AI_ACT / CO_SB_205",
      problemSummary:
        "Fully automated decision-making elevates statutory scrutiny and increases statutory liability under EU AI Act Article 14 and Colorado SB 205.",
      statutoryImpact:
        "Shifting from fully automated to human-in-the-loop with documented override capabilities can significantly reduce liability and support narrow procedural exemptions under Article 6(3).",
      tips: [
        "Configure the system to present recommendation scores as advisory aids rather than automated actions.",
        "Require trained human reviewers to independently verify AI recommendations before any final decision is committed.",
        "Log reviewer override rates and reasons to demonstrate that human oversight is genuine and meaningful rather than a rubber-stamp.",
        "Provide reviewers with an explicit 'Reject / Escalate' button in the operator UI.",
      ],
      recommendedTools: ["Human-in-the-loop workflow engine", "Audit Logging API", "Operator Console with Override Veto"],
      checklistItems: [
        "Human review interface built with clear model confidence metrics",
        "Standard operating procedure (SOP) written for human operators",
        "Override and discrepancy logging enabled in production database",
        "Quarterly human oversight efficacy report generated",
      ],
      ownerRole: "Product Lead & UX/MLOps Team",
    });

    tipsList.push({
      id: "deescalate-proxy-variables",
      category: "deescalation",
      title: "Mitigate Algorithmic Discrimination: Strip Protected Class Proxies",
      criticality: "Critical",
      framework: "CO_SB_205 / FTC_ACT",
      problemSummary:
        "Input features such as ZIP code, educational pedigree, or credit history proxies can produce unlawful disparate impact across protected demographic groups.",
      statutoryImpact:
        "Colorado SB 205 and FTC Act Section 5 hold deployers strictly liable for algorithmic discrimination resulting in disparate economic outcomes.",
      tips: [
        "Perform feature importance analysis (SHAP / LIME) to identify features with high mutual information regarding race, age, sex, or disability.",
        "Prune proxy attributes (e.g. replace detailed 9-digit ZIP codes with broader macro-economic indicators or remove them entirely).",
        "Apply post-processing fair threshold calibration (e.g. Equalized Odds or Demographic Parity adjustments).",
      ],
      recommendedTools: ["SHAP (SHapley Additive exPlanations)", "Fairlearn ThresholdOptimizer", "Google What-If Tool"],
      checklistItems: [
        "Feature correlation matrix audited against protected demographic proxies",
        "High-correlation proxy variables pruned or normalized",
        "Pre-release disparate impact ratio calculated across subgroups",
        "Bias mitigation rationale documented for supervisory review",
      ],
      ownerRole: "Chief Data Scientist & Algorithmic Ethics Lead",
    });
  }

  // 3. Generate tips for Cross-Jurisdiction & Regulatory Conflicts
  (assessment.conflictAlerts || []).forEach((conflict, cIdx) => {
    tipsList.push({
      id: `conflict-tip-${cIdx}`,
      category: "conflict",
      title: `Harmonize Conflict: ${conflict.title}`,
      criticality: "High",
      framework: conflict.affectedFrameworks.join(" / "),
      problemSummary: conflict.description,
      statutoryImpact: "Conflicting requirements across jurisdictions create operational friction and duplicate compliance overhead.",
      tips: [
        conflict.recommendation,
        "Adopt the highest common regulatory denominator: building to the strictest requirement (e.g. EU AI Act FRIA) generally satisfies state-level impact assessments (e.g. Colorado SB 205).",
        "Establish a centralized compliance registry where a single assessment artifact maps to multiple state and international statutory citations.",
      ],
      recommendedTools: ["Concord Unified Compliance Engine", "Cross-Regulatory Mapping Matrix"],
      checklistItems: [
        "Highest common denominator standards implemented across fleet",
        "Cross-jurisdictional disclosure timeline aligned",
        "Unified notice template deployed to end-users",
      ],
      ownerRole: "Head of Regulatory Affairs",
    });
  });

  // 4. Generate tips for Legal Review Questions
  (assessment.questionsRequiringLegalReview || []).forEach((q, qIdx) => {
    tipsList.push({
      id: `legal-tip-${qIdx}`,
      category: "legal",
      title: `Legal Counsel Guidance: Inquiry #${qIdx + 1}`,
      criticality: "Medium",
      framework: "CORPORATE_GOVERNANCE",
      problemSummary: q,
      statutoryImpact: "Unresolved legal ambiguities can invalidate corporate indemnification clauses and create direct director/officer liability.",
      tips: [
        "Review foundation model vendor agreements (OpenAI, Anthropic, Google, AWS) to confirm data ownership, training opt-outs, and intellectual property indemnification.",
        "Update the customer-facing terms of service to include statutory AI disclosures, machine output disclaimers, and dispute resolution clauses.",
        "Audit data processing addenda (DPA) to confirm legal basis for processing personal data under GDPR Article 6 and CCPA/CPRA.",
      ],
      recommendedTools: ["Corporate Legal Counsel Template", "Standard Contractual Clauses (SCCs)", "AI Vendor Due Diligence Checklist"],
      checklistItems: [
        "Vendor Terms of Service reviewed for model weight IP ownership",
        "End-user license agreement (EULA) updated with synthetic disclaimers",
        "Enterprise insurance coverage reviewed for algorithmic liability",
      ],
      ownerRole: "General Counsel & External Privacy Counsel",
    });
  });

  const toggleTipCompleted = (id: string) => {
    setCompletedTips((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter tips
  const filteredTips = tipsList.filter((tip) => {
    const isDone = completedTips[tip.id] || tip.isCompleted;
    if (activeCategory !== "all" && tip.category !== activeCategory) return false;
    if (priorityFilter !== "all" && tip.criticality !== priorityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = `${tip.title} ${tip.problemSummary} ${tip.framework} ${tip.ownerRole} ${tip.tips.join(" ")}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }
    return true;
  });

  const totalTipsCount = tipsList.length;
  const completedCount = tipsList.filter((t) => completedTips[t.id] || t.isCompleted).length;
  const progressPercent = Math.round((completedCount / (totalTipsCount || 1)) * 100);

  const copyFullRemediationPlan = () => {
    const planMarkdown = `
# Concord AI Remediation Action Plan
System: ${system?.name || assessment.systemName}
Generated: ${new Date().toLocaleDateString()}
Current Compliance Readiness: ${assessment.complianceScore}%
Total Remediation Items: ${totalTipsCount} (Completed: ${completedCount})

## Executive Summary
This document provides actionable engineering, data science, and legal steps to resolve regulatory gaps, missing audit evidence, and compliance conflicts for "${system?.name || assessment.systemName}".

${tipsList
  .map(
    (t, i) => `
### ${i + 1}. [${t.criticality.toUpperCase()}] ${t.title}
- **Framework:** ${t.framework}
- **Assigned Owner:** ${t.ownerRole}
- **Status:** ${completedTips[t.id] || t.isCompleted ? "[COMPLETED]" : "[ACTION REQUIRED]"}
- **Problem:** ${t.problemSummary}
- **Statutory Risk:** ${t.statutoryImpact}
- **Actionable Tips:**
${t.tips.map((step) => `  * ${step}`).join("\n")}
${t.recommendedTools ? `- **Recommended Tools:** ${t.recommendedTools.join(", ")}` : ""}
- **Checklist:**
${t.checklistItems.map((chk) => `  - [ ] ${chk}`).join("\n")}
`
  )
  .join("\n")}
`.trim();

    navigator.clipboard.writeText(planMarkdown);
    setCopiedPlan(true);
    setTimeout(() => setCopiedPlan(false), 2000);
  };

  return (
    <div id="problem-solving-tips-tab" className="space-y-6">
      {/* Top Banner & Remediation Dashboard */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                <Lightbulb className="w-5 h-5 text-emerald-400" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Actionable Problem Resolution Hub
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Tips to Solve Compliance Problems & Clear Regulatory Gates
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Step-by-step resolution blueprints, tool recommendations, and de-escalation strategies tailored for{" "}
              <span className="font-semibold text-emerald-400">{system?.name || assessment.systemName}</span>.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {onOpenWhyModal && (
              <button
                id="tips-open-why-btn"
                onClick={onOpenWhyModal}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center space-x-1.5 transition-colors"
              >
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                <span>Why These Apply?</span>
              </button>
            )}

            <button
              id="copy-remediation-plan-btn"
              onClick={copyFullRemediationPlan}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-sm flex items-center space-x-1.5 transition-all"
            >
              {copiedPlan ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedPlan ? "Plan Copied!" : "Copy Full Action Plan"}</span>
            </button>
          </div>
        </div>

        {/* Progress Bar and Summary Stats */}
        <div className="pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="sm:col-span-2 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Remediation Roadmap Progress</span>
              <span className="font-bold text-emerald-400">{progressPercent}% Solved ({completedCount}/{totalTipsCount})</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[11px] text-slate-400">
              {totalTipsCount - completedCount} actionable items remaining to achieve complete audit clearance
            </span>
          </div>

          <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/60 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Missing Artifacts</span>
            <span className="text-lg font-bold text-rose-400">{assessment.missingEvidenceList.length}</span>
            <span className="text-[10px] text-slate-400 block">Documentation gaps</span>
          </div>

          <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/60 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Safe Harbor Paths</span>
            <span className="text-lg font-bold text-emerald-400">2</span>
            <span className="text-[10px] text-slate-400 block">De-escalation options</span>
          </div>
        </div>
      </div>

      {/* 3-Phase Executive Remediation Timeline Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Phase 1 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-100 text-red-800">
              Phase 1: 0 - 30 Days
            </span>
            <span className="text-xs font-semibold text-slate-500">Immediate Gaps</span>
          </div>
          <h4 className="text-xs font-bold text-slate-900">Critical Evidence & Bias Audits</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Draft Fundamental Rights Impact Assessment (FRIA), run independent bias audit (Fairlearn), and compile Annex IV tech file.
          </p>
        </div>

        {/* Phase 2 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800">
              Phase 2: 30 - 60 Days
            </span>
            <span className="text-xs font-semibold text-slate-500">Governance Controls</span>
          </div>
          <h4 className="text-xs font-bold text-slate-900">Human Oversight & De-escalation</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Deploy human operator veto console, configure SHAP feature auditing, and strip demographic proxy variables to minimize liability.
          </p>
        </div>

        {/* Phase 3 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              Phase 3: 60 - 90 Days
            </span>
            <span className="text-xs font-semibold text-slate-500">Legal & Market Gate</span>
          </div>
          <h4 className="text-xs font-bold text-slate-900">Multi-State Harmonization & EULA</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Finalize vendor indemnity clauses, post California AB 2013 data transparency notice, and submit EU database registration.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: `All Problems (${tipsList.length})` },
            { id: "evidence", label: `Missing Evidence (${tipsList.filter((t) => t.category === "evidence").length})` },
            { id: "deescalation", label: `Risk De-escalation (${tipsList.filter((t) => t.category === "deescalation").length})` },
            { id: "conflict", label: `Conflicts (${tipsList.filter((t) => t.category === "conflict").length})` },
            { id: "legal", label: `Legal Review (${tipsList.filter((t) => t.category === "legal").length})` },
          ].map((cat) => (
            <button
              key={cat.id}
              id={`filter-cat-${cat.id}`}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeCategory === cat.id
                  ? "bg-emerald-600 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search & Priority Controls */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="search-tips-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tips, tools, rules..."
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 w-44"
            />
          </div>

          <select
            id="filter-priority-select"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
            className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Priorities</option>
            <option value="Critical">Critical Only</option>
            <option value="High">High Priority</option>
          </select>
        </div>
      </div>

      {/* Detailed Problem Solving Tip Cards */}
      <div className="space-y-4">
        {filteredTips.length === 0 ? (
          <div className="p-8 bg-white rounded-xl border border-slate-200 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <h4 className="text-sm font-bold text-slate-900">No Matching Problems Found</h4>
            <p className="text-xs text-slate-500">
              Try adjusting your search query or filter to view other remediation guides.
            </p>
          </div>
        ) : (
          filteredTips.map((tip) => {
            const isDone = completedTips[tip.id] || tip.isCompleted;
            const isExpanded = expandedTipId === tip.id || !expandedTipId; // Default expanded for ease of reading

            return (
              <div
                key={tip.id}
                id={`tip-card-${tip.id}`}
                className={`bg-white rounded-xl border transition-all ${
                  isDone
                    ? "border-emerald-300 bg-emerald-50/20 shadow-2xs opacity-85"
                    : tip.criticality === "Critical"
                    ? "border-red-200 shadow-2xs hover:border-red-300"
                    : "border-slate-200 shadow-2xs hover:border-slate-300"
                } p-5 space-y-4`}
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Completion status checkbox */}
                      <button
                        type="button"
                        onClick={() => toggleTipCompleted(tip.id)}
                        className={`flex items-center space-x-1 px-2.5 py-0.5 rounded text-[11px] font-bold border transition-colors ${
                          isDone
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                            : "bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200"
                        }`}
                      >
                        {isDone ? <Check className="w-3 h-3 text-emerald-700" /> : <span className="w-3 h-3 rounded-xs border border-slate-400 inline-block" />}
                        <span>{isDone ? "Resolved" : "Mark as Resolved"}</span>
                      </button>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          tip.criticality === "Critical"
                            ? "bg-red-100 text-red-800"
                            : tip.criticality === "High"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {tip.criticality} Priority
                      </span>

                      <span className="text-xs font-mono px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                        {tip.framework}
                      </span>

                      <span className="text-xs text-slate-400 font-medium">
                        Owner: <strong className="text-slate-700">{tip.ownerRole}</strong>
                      </span>
                    </div>

                    <h3 className={`text-base font-bold text-slate-900 ${isDone ? "line-through text-slate-500" : ""}`}>
                      {tip.title}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      <strong>Problem: </strong>
                      {tip.problemSummary}
                    </p>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex items-center space-x-2 shrink-0">
                    {tip.evidenceIndex !== undefined && onOpenUploadEvidence && (
                      <button
                        id={`upload-evidence-tip-btn-${tip.evidenceIndex}`}
                        type="button"
                        onClick={() => onOpenUploadEvidence(tip.evidenceIndex!)}
                        className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-2xs transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Artifact</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setExpandedTipId(expandedTipId === tip.id ? null : tip.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                    >
                      {expandedTipId === tip.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Statutory Risk Note */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs text-slate-700 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900">Regulatory Impact if Unaddressed: </span>
                    <span>{tip.statutoryImpact}</span>
                  </div>
                </div>

                {/* Practical Solution Tips */}
                <div className="space-y-2 bg-emerald-50/40 p-4 rounded-xl border border-emerald-200">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-900">
                    <Lightbulb className="w-4 h-4 text-emerald-600" />
                    <span>💡 Actionable How-To & Best Practices</span>
                  </div>

                  <ul className="space-y-1.5 text-xs text-slate-800">
                    {tip.tips.map((step, sIdx) => (
                      <li key={sIdx} className="flex items-start space-x-2">
                        <span className="w-4 h-4 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          {sIdx + 1}
                        </span>
                        <span className="leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommended Tools & Open Source Libraries */}
                {tip.recommendedTools && tip.recommendedTools.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Recommended Tools:
                    </span>
                    {tip.recommendedTools.map((tool, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2.5 py-0.5 bg-white rounded-md border border-slate-300 text-xs font-semibold text-slate-700 shadow-2xs"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                )}

                {/* Document Readiness Checklist */}
                {tip.checklistItems && tip.checklistItems.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-900 block mb-1.5">
                      Required Content Checklist:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-600">
                      {tip.checklistItems.map((chk, cIdx) => (
                        <div key={cIdx} className="flex items-center space-x-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{chk}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
