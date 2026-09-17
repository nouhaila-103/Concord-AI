import crypto from "crypto";
import {
  CURRENT_RULEBOOK_VERSION,
  REGULATORY_RULE_CATALOG,
  StructuredRegulatoryRule,
  RulePredicate,
} from "./regulatoryRules.js";

export interface EvaluationDetail {
  ruleId: string;
  framework: string;
  title: string;
  citation: string;
  sourceVersion: string;
  effectiveDate: string;
  jurisdiction: string;
  severity: string;
  result: "TRIGGERED" | "NOT_TRIGGERED";
  triggeringFacts: string[];
  explanation: string;
  requirements: string[];
  missingEvidence: string[];
  riskAreas: string[];
  legalReviewQuestions: string[];
}

export interface EngineResult {
  rulebookVersion: string;
  evaluatedAt: string;
  deterministicHash: string;
  factsSnapshot: any;
  rulesEvaluatedCount: number;
  rulesTriggeredCount: number;
  evaluations: EvaluationDetail[];
  triggeredRules: EvaluationDetail[];
  euClassification: {
    tier: "Prohibited" | "High Risk" | "Specific Transparency Risk" | "Minimal / No Risk";
    summary: string;
    annexReference?: string;
    isExemptCandidate: boolean;
  };
  usJurisdictionApplicability: {
    coloradoSB205: { applicable: boolean; role: string; reason: string };
    nycLL144: { applicable: boolean; reason: string };
    californiaAB2013: { applicable: boolean; reason: string };
    whiteHouseOMBM24: { applicable: boolean; reason: string };
    ftcAct: { applicable: boolean; reason: string };
    nistApplicability: { level: string; focusFunctions: string[] };
  };
  aggregatedRequirements: {
    id: string;
    category: string;
    title: string;
    framework: string;
    sourceCitation: string;
    effectiveDate: string;
    status: "Pending" | "In Review" | "Satisfied";
  }[];
  missingEvidenceList: {
    item: string;
    framework: string;
    criticality: "Critical" | "High" | "Medium";
  }[];
  riskAreasList: {
    risk: string;
    severity: "Critical" | "High" | "Medium";
    framework: string;
  }[];
  questionsRequiringLegalReview: string[];
  sourceCitations: {
    citation: string;
    framework: string;
    article: string;
    effectiveDate: string;
  }[];
  conflictAlerts: {
    id: string;
    title: string;
    type: "RULE_UPDATE" | "REGULATORY_DEADLINE" | "CROSS_JURISDICTION_CONFLICT";
    description: string;
    affectedFrameworks: string[];
    recommendation: string;
  }[];
  complianceScore: number;
}

function getNestedValue(obj: any, path: string): any {
  const parts = path.split(".");
  let current = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    current = current[part];
  }
  return current;
}

function testPredicate(facts: any, predicate: RulePredicate): { matched: boolean; triggeringFact?: string } {
  const val = getNestedValue(facts, predicate.field);

  switch (predicate.operator) {
    case "is_true":
      return {
        matched: val === true,
        triggeringFact: val === true ? `${predicate.field} is TRUE` : undefined,
      };

    case "is_false":
      return {
        matched: val === false,
        triggeringFact: val === false ? `${predicate.field} is FALSE` : undefined,
      };

    case "equals":
      return {
        matched: val === predicate.value,
        triggeringFact: val === predicate.value ? `${predicate.field} matches "${predicate.value}"` : undefined,
      };

    case "contains":
      if (typeof val === "string") {
        const has = val.toLowerCase().includes(String(predicate.value).toLowerCase());
        return {
          matched: has,
          triggeringFact: has ? `${predicate.field} contains "${predicate.value}"` : undefined,
        };
      }
      return { matched: false };

    case "includes_any":
      if (Array.isArray(val) && Array.isArray(predicate.value)) {
        const lowerList = val.map((v: any) => String(v).toLowerCase());
        const found = predicate.value.find((target: any) =>
          lowerList.some((item) => item.includes(String(target).toLowerCase()) || String(target).toLowerCase().includes(item))
        );
        return {
          matched: !!found,
          triggeringFact: found ? `${predicate.field} includes sector/location matching "${found}"` : undefined,
        };
      }
      return { matched: false };

    default:
      return { matched: false };
  }
}

export function evaluateDeterministicRules(
  facts: any,
  rulesToEvaluate: StructuredRegulatoryRule[] = REGULATORY_RULE_CATALOG
): EngineResult {
  const evaluatedAt = new Date().toISOString();
  const evaluations: EvaluationDetail[] = [];
  const triggeredRules: EvaluationDetail[] = [];

  for (const rule of rulesToEvaluate) {
    let allMatched = true;
    const ruleTriggeringFacts: string[] = [];

    for (const pred of rule.predicates) {
      const res = testPredicate(facts, pred);
      if (!res.matched) {
        allMatched = false;
        break;
      }
      if (res.triggeringFact) {
        ruleTriggeringFacts.push(res.triggeringFact);
      }
    }

    const detail: EvaluationDetail = {
      ruleId: rule.id,
      framework: rule.framework,
      title: rule.title,
      citation: rule.citation,
      sourceVersion: rule.sourceVersion,
      effectiveDate: rule.effectiveDate,
      jurisdiction: rule.jurisdiction,
      severity: rule.severity,
      result: allMatched ? "TRIGGERED" : "NOT_TRIGGERED",
      triggeringFacts: ruleTriggeringFacts,
      explanation: rule.explanation,
      requirements: rule.mandatoryRequirements,
      missingEvidence: rule.missingEvidenceChecks,
      riskAreas: rule.riskAreas,
      legalReviewQuestions: rule.legalReviewQuestions,
    };

    evaluations.push(detail);
    if (allMatched) {
      triggeredRules.push(detail);
    }
  }

  // 1. EU AI Act Classification derivation
  let euTier: "Prohibited" | "High Risk" | "Specific Transparency Risk" | "Minimal / No Risk" = "Minimal / No Risk";
  let euSummary = "The AI system does not meet criteria for prohibited or high-risk classification under Regulation (EU) 2024/1689. Subject to general transparency recommendations and voluntary codes of conduct.";
  let annexRef: string | undefined = undefined;

  const prohibitedTrigger = triggeredRules.find((r) => r.framework === "EU_AI_ACT" && r.severity === "PROHIBITED");
  const highRiskTrigger = triggeredRules.find((r) => r.framework === "EU_AI_ACT" && r.severity === "HIGH_RISK");
  const transparencyTrigger = triggeredRules.find((r) => r.framework === "EU_AI_ACT" && r.severity === "SPECIFIC_TRANSPARENCY");

  if (prohibitedTrigger) {
    euTier = "Prohibited";
    euSummary = `Prohibited under Article 5 of Regulation (EU) 2024/1689: ${prohibitedTrigger.title}. Deploying this AI system within the European Union is strictly banned and subject to maximal statutory sanctions.`;
    annexRef = "Article 5(1)";
  } else if (highRiskTrigger) {
    euTier = "High Risk";
    euSummary = `Classified as High-Risk AI under Article 6(2) and Annex III of Regulation (EU) 2024/1689: ${highRiskTrigger.title}. Requires mandatory CE-marking, conformity assessment, FRIA, and EU database registration.`;
    annexRef = highRiskTrigger.citation;
  } else if (transparencyTrigger) {
    euTier = "Specific Transparency Risk";
    euSummary = `Subject to Specific Transparency Obligations under Article 50 of Regulation (EU) 2024/1689: Direct human notice and/or machine-readable synthetic output watermarking required.`;
    annexRef = "Article 50";
  }

  // 2. US Jurisdiction Applicability Matrix
  const coRule = triggeredRules.find((r) => r.ruleId === "US-CO-SB205-CONSEQUENTIAL-DECISIONS");
  const nycRule = triggeredRules.find((r) => r.ruleId === "US-NYC-LL144-AEDT-BIAS-AUDIT");
  const caRule = triggeredRules.find((r) => r.ruleId === "US-CA-AB2013-TRAINING-TRANSPARENCY");
  const ombRule = triggeredRules.find((r) => r.ruleId === "US-FED-OMB-M24-10-FEDERAL-USE");
  const ftcRule = triggeredRules.find((r) => r.ruleId === "US-FTC-ACT-SECTION5-FAIRNESS");

  const usJurisdictionApplicability = {
    coloradoSB205: {
      applicable: !!coRule,
      role: coRule ? "Deployer" : "None",
      reason: coRule
        ? "Deployed in Colorado and makes or influences consequential decisions in regulated sectors (employment, healthcare, finance, or education). Mandatory duty of reasonable care & annual impact assessments apply."
        : "Not identified as deploying high-risk consequential decision systems in Colorado.",
    },
    nycLL144: {
      applicable: !!nycRule,
      reason: nycRule
        ? "System deployed in New York City for employment recruitment or evaluation. Mandatory annual independent bias audit and 10-business-day candidate notices apply."
        : "Not identified as an Automated Employment Decision Tool deployed in NYC jurisdiction.",
    },
    californiaAB2013: {
      applicable: !!caRule,
      reason: caRule
        ? "Generative AI system made available to California residents. Obligation to publish pre-training and fine-tuning dataset provenance summaries."
        : "Not identified as public-facing Generative AI in California.",
    },
    whiteHouseOMBM24: {
      applicable: !!ombRule,
      reason: ombRule
        ? "Operated or procured under US Federal Agency contract affecting rights or safety. Chief AI Officer review and federal inventory listing required."
        : "No active federal rights-impacting contract scope identified.",
    },
    ftcAct: {
      applicable: !!ftcRule,
      reason: ftcRule
        ? "Autonomous consequential decisions with no meaningful human oversight pose heightened unfairness or deceptive practices liability under 15 U.S.C. § 45."
        : "Human oversight or non-consequential scope mitigates standalone Section 5 automated injury flags.",
    },
    nistApplicability: {
      level: highRiskTrigger || coRule ? "Tier 1 - High Assurance" : "Tier 2 - Baseline Governance",
      focusFunctions: ["GOVERN", "MAP", "MEASURE", "MANAGE"],
    },
  };

  // 3. Aggregated Requirements
  const aggregatedRequirements: EngineResult["aggregatedRequirements"] = [];
  const reqSet = new Set<string>();

  triggeredRules.forEach((rule, idx) => {
    rule.requirements.forEach((req, reqIdx) => {
      if (!reqSet.has(req)) {
        reqSet.add(req);
        aggregatedRequirements.push({
          id: `REQ-${rule.framework}-${idx + 1}-${reqIdx + 1}`,
          category: rule.framework.replace(/_/g, " "),
          title: req,
          framework: rule.framework,
          sourceCitation: rule.citation,
          effectiveDate: rule.effectiveDate,
          status: "Pending",
        });
      }
    });
  });

  // 4. Missing Evidence Checks
  const missingEvidenceList: EngineResult["missingEvidenceList"] = [];
  const evSet = new Set<string>();

  triggeredRules.forEach((rule) => {
    rule.missingEvidence.forEach((item) => {
      if (!evSet.has(item)) {
        evSet.add(item);
        missingEvidenceList.push({
          item,
          framework: rule.framework,
          criticality: rule.severity === "PROHIBITED" ? "Critical" : rule.severity === "HIGH_RISK" ? "High" : "Medium",
        });
      }
    });
  });

  // 5. Risk Areas
  const riskAreasList: EngineResult["riskAreasList"] = [];
  const riskSet = new Set<string>();

  triggeredRules.forEach((rule) => {
    rule.riskAreas.forEach((risk) => {
      if (!riskSet.has(risk)) {
        riskSet.add(risk);
        riskAreasList.push({
          risk,
          severity: rule.severity === "PROHIBITED" ? "Critical" : rule.severity === "HIGH_RISK" ? "High" : "Medium",
          framework: rule.framework,
        });
      }
    });
  });

  // 6. Questions Requiring Legal Review
  const questionsRequiringLegalReview: string[] = [];
  const qSet = new Set<string>();

  triggeredRules.forEach((rule) => {
    rule.legalReviewQuestions.forEach((q) => {
      if (!qSet.has(q)) {
        qSet.add(q);
        questionsRequiringLegalReview.push(q);
      }
    });
  });

  // 7. Source Citations
  const sourceCitations: EngineResult["sourceCitations"] = [];
  const citSet = new Set<string>();

  triggeredRules.forEach((rule) => {
    if (!citSet.has(rule.citation)) {
      citSet.add(rule.citation);
      sourceCitations.push({
        citation: rule.citation,
        framework: rule.framework,
        article: rule.title,
        effectiveDate: rule.effectiveDate,
      });
    }
  });

  // 8. Continuous Conflict Alerts & Real-Time Discrepancies
  const conflictAlerts: EngineResult["conflictAlerts"] = [];

  if (euTier === "High Risk" && usJurisdictionApplicability.coloradoSB205.applicable) {
    conflictAlerts.push({
      id: "CONF-EU-CO-DUAL-OVERSIGHT",
      title: "Dual High-Risk Mandate: EU AI Act + Colorado SB 205",
      type: "CROSS_JURISDICTION_CONFLICT",
      description: "The AI system is categorized as High-Risk under both EU AI Act Annex III and Colorado SB 205. Note divergence in consumer notice timelines: Colorado requires pre-deployment notices with appeal rights, whereas EU mandates formal Fundamental Rights Impact Assessments (FRIA) and EU database registration.",
      affectedFrameworks: ["EU AI Act", "Colorado SB 24-205"],
      recommendation: "Harmonize risk documentation using NIST AI RMF / ISO 42001 crosswalk to eliminate duplicate assessment audits.",
    });
  }

  if (nycRule && (!facts.oversight_profile || facts.oversight_profile.oversightLevel === "none/fully_autonomous")) {
    conflictAlerts.push({
      id: "CONF-NYC-LL144-AUTONOMOUS-AUDIT",
      title: "Immediate Compliance Gap: Fully Autonomous Employment Tool in NYC",
      type: "REGULATORY_DEADLINE",
      description: "NYC Local Law 144 strictly regulates automated employment decision tools. Deploying automated screening without verified annual bias audit results published on public careers portal creates daily liability of $1,500/day.",
      affectedFrameworks: ["NYC Local Law 144"],
      recommendation: "Publish bias audit summary or implement human-in-the-loop review veto prior to candidate elimination.",
    });
  }

  if (new Date(evaluatedAt) < new Date("2026-08-02") && euTier === "High Risk") {
    conflictAlerts.push({
      id: "ALERT-EU-ANNEX3-ENFORCEMENT-APPROACHING",
      title: "Enforcement Deadline Approaching: August 2, 2026",
      type: "REGULATORY_DEADLINE",
      description: "Annex III high-risk compliance obligations for employment, education, and essential services become legally enforceable across all EU member states on August 2, 2026.",
      affectedFrameworks: ["EU AI Act"],
      recommendation: "Establish Quality Management System (Article 17) and Annex IV Technical Documentation immediately.",
    });
  }

  // 9. Compliance Score Calculation
  let baseScore = 100;
  if (euTier === "Prohibited") baseScore -= 80;
  else if (euTier === "High Risk") baseScore -= 35;
  else if (euTier === "Specific Transparency Risk") baseScore -= 10;

  if (usJurisdictionApplicability.coloradoSB205.applicable) baseScore -= 10;
  if (usJurisdictionApplicability.nycLL144.applicable) baseScore -= 10;
  if (missingEvidenceList.length > 0) baseScore -= Math.min(25, missingEvidenceList.length * 4);

  const complianceScore = Math.max(15, baseScore);

  // Deterministic Hash calculation
  const hashInput = JSON.stringify({
    rulebookVersion: CURRENT_RULEBOOK_VERSION,
    facts,
    triggeredRuleIds: triggeredRules.map((r) => r.ruleId).sort(),
  });
  const deterministicHash = crypto.createHash("sha256").update(hashInput).digest("hex");

  return {
    rulebookVersion: CURRENT_RULEBOOK_VERSION,
    evaluatedAt,
    deterministicHash,
    factsSnapshot: facts,
    rulesEvaluatedCount: evaluations.length,
    rulesTriggeredCount: triggeredRules.length,
    evaluations,
    triggeredRules,
    euClassification: {
      tier: euTier,
      summary: euSummary,
      annexReference: annexRef,
      isExemptCandidate: false,
    },
    usJurisdictionApplicability,
    aggregatedRequirements,
    missingEvidenceList,
    riskAreasList,
    questionsRequiringLegalReview,
    sourceCitations,
    conflictAlerts,
    complianceScore,
  };
}
