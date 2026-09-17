import { db, StoredAISystem } from "./db.js";
import { evaluateDeterministicRules } from "./rulesEngine.js";
import { CURRENT_RULEBOOK_VERSION } from "./regulatoryRules.js";

export interface ConflictReport {
  timestamp: string;
  totalSystemsChecked: number;
  conflictsFoundCount: number;
  conflicts: {
    systemId: string;
    systemName: string;
    organizationId: string;
    severity: "CRITICAL" | "HIGH" | "MEDIUM" | "INFO";
    type: "STALE_RULEBOOK" | "DEADLINE_APPROACHING" | "MANDATORY_EVIDENCE_MISSING" | "JURISDICTION_CONFLICT";
    title: string;
    message: string;
    framework: string;
    remedyAction: string;
  }[];
}

export function runContinuousConflictCheck(organizationId?: string): ConflictReport {
  const systems = db.getSystems(organizationId);
  const conflicts: ConflictReport["conflicts"] = [];
  const now = new Date();

  for (const sys of systems) {
    if (!sys.extractedFacts) continue;

    // 1. Re-evaluate against the latest rulebook version
    const evalResult = evaluateDeterministicRules(sys.extractedFacts);

    // Check if current assessment is on a stale rulebook
    const currentAssessment = sys.latestAssessmentId ? db.getAssessmentById(sys.latestAssessmentId) : null;
    if (currentAssessment && currentAssessment.rulebookVersion !== CURRENT_RULEBOOK_VERSION) {
      conflicts.push({
        systemId: sys.id,
        systemName: sys.name,
        organizationId: sys.organizationId,
        severity: "HIGH",
        type: "STALE_RULEBOOK",
        title: "Rulebook Version Mismatch",
        message: `System was evaluated under rulebook ${currentAssessment.rulebookVersion}, but active enterprise rulebook is now ${CURRENT_RULEBOOK_VERSION}. New statutory predicates may apply.`,
        framework: "All Active Frameworks",
        remedyAction: "Execute fleet re-assessment against latest rulebook version.",
      });
    }

    // 2. High-Risk EU AI Act deadline check
    if (evalResult.euClassification.tier === "High Risk") {
      const euDeadline = new Date("2026-08-02");
      const daysUntil = Math.ceil((euDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntil <= 180 && daysUntil > 0) {
        conflicts.push({
          systemId: sys.id,
          systemName: sys.name,
          organizationId: sys.organizationId,
          severity: "CRITICAL",
          type: "DEADLINE_APPROACHING",
          title: `EU AI Act High-Risk Enforcement in ${daysUntil} Days`,
          message: `Mandatory CE marking, conformity assessment, and FRIA for Annex III High-Risk systems will be strictly enforced starting August 2, 2026.`,
          framework: "EU AI Act (Regulation (EU) 2024/1689)",
          remedyAction: "Complete Annex IV Technical Documentation and schedule notified body conformity review.",
        });
      }
    }

    // 3. Colorado SB 205 Check
    if (evalResult.usJurisdictionApplicability.coloradoSB205.applicable) {
      conflicts.push({
        systemId: sys.id,
        systemName: sys.name,
        organizationId: sys.organizationId,
        severity: "HIGH",
        type: "JURISDICTION_CONFLICT",
        title: "Colorado SB 24-205 Impact Assessment Mandate",
        message: "High-risk consequential decision deployer status requires an active, annually renewed AI Impact Assessment on file with consumer notice and appeal workflows.",
        framework: "Colorado SB 24-205",
        remedyAction: "Generate and sign annual Colorado Consumer Protection Impact Assessment.",
      });
    }

    // 4. Missing Critical Evidence Gaps
    const criticalEvidence = evalResult.missingEvidenceList.filter((e) => e.criticality === "Critical" || e.criticality === "High");
    if (criticalEvidence.length > 0) {
      conflicts.push({
        systemId: sys.id,
        systemName: sys.name,
        organizationId: sys.organizationId,
        severity: "MEDIUM",
        type: "MANDATORY_EVIDENCE_MISSING",
        title: `Unresolved Evidence Items (${criticalEvidence.length})`,
        message: `Missing: ${criticalEvidence.map((e) => e.item).slice(0, 2).join("; ")}${criticalEvidence.length > 2 ? " and others" : ""}.`,
        framework: criticalEvidence[0]?.framework || "Multi-Jurisdiction",
        remedyAction: "Upload or verify required compliance documents in the evidence repository.",
      });
    }
  }

  return {
    timestamp: new Date().toISOString(),
    totalSystemsChecked: systems.length,
    conflictsFoundCount: conflicts.length,
    conflicts,
  };
}
