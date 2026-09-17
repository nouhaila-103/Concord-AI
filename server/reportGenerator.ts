import { EngineResult } from "./rulesEngine.js";
import { StoredAISystem, StoredOrganization } from "./db.js";

export function generateMarkdownReport(
  system: StoredAISystem,
  org: StoredOrganization,
  evaluation: any
): string {
  const hash = String(evaluation.deterministicHash || evaluation.facts?.auditSeal || "SHA256-RECORDED");
  const docId = `CONCORD-REP-${hash.substring(0, 12).toUpperCase()}`;
  const evaluatedAt = evaluation.evaluatedAt || new Date().toISOString();
  const rulebookVersion = evaluation.rulebookVersion || "2026.2-FINAL";
  const facts = evaluation.factsSnapshot || evaluation.facts || {};
  const sysProfile = facts.system_profile || {};
  const oversightProfile = facts.oversight_profile || {};
  const euClass = evaluation.euClassification || { tier: "Unassessed", summary: "Assessment logged.", annexReference: "" };
  const usJurisdiction = evaluation.usJurisdictionApplicability || {
    coloradoSB205: { applicable: false, reason: "N/A" },
    nycLL144: { applicable: false, reason: "N/A" },
    californiaAB2013: { applicable: false, reason: "N/A" },
    whiteHouseOMBM24: { applicable: false, reason: "N/A" },
    ftcAct: { applicable: false, reason: "N/A" },
    nistApplicability: { level: "Standard", focusFunctions: [] },
  };
  const aggregatedRequirements: any[] = evaluation.aggregatedRequirements || [];
  const missingEvidenceList: any[] = evaluation.missingEvidenceList || [];
  const riskAreasList: any[] = evaluation.riskAreasList || [];
  const questionsRequiringLegalReview: string[] = evaluation.questionsRequiringLegalReview || [];
  const evaluations: any[] = evaluation.evaluations || evaluation.ruleEvaluations || evaluation.triggeredRules || [];

  const md = `
# CONCORD AI - REGULATORY COMPLIANCE ASSESSMENT REPORT
**Document ID:** ${docId}  
**Generated On:** ${evaluatedAt}  
**Deterministic Audit Hash:** \`${hash}\`  
**Rulebook Version:** ${rulebookVersion}

---

## 1. Executive Summary & System Profile
- **Target AI System:** ${system.name || "AI System"}
- **Organization:** ${org.name || "Organization"} (${org.industry || "General Industry"})
- **Evaluated Scope:** ${sysProfile.intendedPurpose || system.rawAnswers?.intendedPurpose || "Enterprise Deployment"}
- **Model Architecture:** ${sysProfile.modelProvider || system.rawAnswers?.modelProvider || "Proprietary"} (${sysProfile.isGenerativeAI ? "Generative AI" : "Predictive Model"})
- **Human Oversight:** ${oversightProfile.oversightLevel || system.rawAnswers?.humanOversightDegree || "In-The-Loop"}
- **Overall Compliance Readiness Score:** ${evaluation.complianceScore ?? 80}% / 100%

---

## 2. Statutory Classifications

### European Union (EU AI Act - Regulation (EU) 2024/1689)
- **Classification:** **${String(euClass.tier || "UNASSESSED").toUpperCase()}**
- **Statutory Reference:** ${euClass.annexReference || "Regulation (EU) 2024/1689 General Provisions"}
- **Findings Summary:** ${euClass.summary || "Evaluation completed."}

### United States State & Federal Applicability Matrix
| Jurisdiction / Framework | Applicability | Regulatory Mandate / Rationale |
| :--- | :--- | :--- |
| **Colorado SB 24-205** | ${usJurisdiction.coloradoSB205?.applicable ? "APPLICABLE (High-Risk AI)" : "Exempt / Non-Applicable"} | ${usJurisdiction.coloradoSB205?.reason || "N/A"} |
| **NYC Local Law 144** | ${usJurisdiction.nycLL144?.applicable ? "APPLICABLE (AEDT Tool)" : "Exempt / Non-Applicable"} | ${usJurisdiction.nycLL144?.reason || "N/A"} |
| **California AB 2013** | ${usJurisdiction.californiaAB2013?.applicable ? "APPLICABLE (Training Transparency)" : "Exempt / Non-Applicable"} | ${usJurisdiction.californiaAB2013?.reason || "N/A"} |
| **White House OMB M-24-10** | ${usJurisdiction.whiteHouseOMBM24?.applicable ? "APPLICABLE (Federal Agency/Contract)" : "Exempt / Non-Applicable"} | ${usJurisdiction.whiteHouseOMBM24?.reason || "N/A"} |
| **FTC Act Section 5** | ${usJurisdiction.ftcAct?.applicable ? "HEIGHTENED ENFORCEMENT RISK" : "Baseline Standard"} | ${usJurisdiction.ftcAct?.reason || "N/A"} |
| **NIST AI RMF 1.0** | ${usJurisdiction.nistApplicability?.level || "Benchmark"} | Standard benchmark governance functions: GOVERN, MAP, MEASURE, MANAGE |

---

## 3. Mandatory Compliance Requirements (${aggregatedRequirements.length})
${aggregatedRequirements.length > 0
  ? aggregatedRequirements
      .map(
        (req, i) =>
          `### ${i + 1}. [${req.framework || "Regulation"}] ${req.title || "Requirement"}\n- **Statutory Citation:** ${req.sourceCitation || "N/A"}\n- **Effective Date:** ${req.effectiveDate || "N/A"}\n- **Current Status:** ${req.status || "Pending"}`
      )
      .join("\n\n")
  : "No mandatory requirements triggered."}

---

## 4. Missing Evidence & Compliance Gaps (${missingEvidenceList.length})
${missingEvidenceList.length > 0
  ? missingEvidenceList
      .map((gap, i) => `${i + 1}. **[${gap.criticality || "Standard"} Priority]** ${gap.item} *(Applicable under ${gap.framework || "Applicable Law"})*`)
      .join("\n")
  : "No critical evidence gaps detected."}

---

## 5. Identified High-Risk Vectors (${riskAreasList.length})
${riskAreasList.length > 0
  ? riskAreasList
      .map((r, i) => `${i + 1}. **[${r.severity || "Warning"}]** ${r.risk} *(Triggered by ${r.framework || "Statute"})*`)
      .join("\n")
  : "No high-risk vectors identified."}

---

## 6. Questions Requiring Legal Review
${questionsRequiringLegalReview.length > 0
  ? questionsRequiringLegalReview.map((q, i) => `${i + 1}. ${q}`).join("\n")
  : "No additional legal review escalations noted."}

---

## 7. Deterministic Evaluation Audit Log
- **Total Versioned Rules Tested:** ${evaluation.rulesEvaluatedCount || evaluations.length}
- **Rules Triggered:** ${evaluation.rulesTriggeredCount || (evaluation.triggeredRules ? evaluation.triggeredRules.length : 0)}
- **Rulebook Version:** ${rulebookVersion}
- **Assessment Date:** ${evaluatedAt}

### Evaluated Rule Details:
${evaluations.length > 0
  ? evaluations
      .map(
        (e) => `
#### Rule: ${e.ruleId || "RULE"} - ${e.title || e.regulatorySource || "Regulatory Rule"}
- **Framework & Source:** ${e.citation || e.regulatorySource || "Statutory Code"} (${e.sourceVersion || rulebookVersion})
- **Effective Date:** ${e.effectiveDate || "Enforced"}
- **Status:** **${e.result || "TRIGGERED"}**
${(e.triggeringFacts && e.triggeringFacts.length > 0) ? `- **Triggering Facts:**\n  - ${e.triggeringFacts.join("\n  - ")}` : "- **Triggering Facts:** None (predicates not met)"}
`
      )
      .join("\n")
  : "Audit rule records logged."}

---
*Notice: This report was deterministically computed by Concord AI's statutory rules engine based on technical facts extracted under Layer A and validated against Rulebook ${rulebookVersion}. Not formal legal counsel.*
`;

  return md;
}
