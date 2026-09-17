export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "compliance_officer" | "auditor";
  organizationId: string;
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  tier: "Enterprise" | "Growth" | "Starter";
  industry: string;
  primaryJurisdictions: string[];
  apiKey: string;
  createdAt: string;
}

export interface AISystem {
  id: string;
  name: string;
  organizationId: string;
  status: "Assessed" | "Needs Review" | "Conflict Detected" | "Draft";
  rawAnswers: Record<string, any>;
  extractedFacts: any;
  latestAssessmentId?: string;
  latestAssessmentDate?: string;
  riskTier: "Prohibited" | "High Risk" | "Specific Transparency Risk" | "Minimal / No Risk" | "Unassessed";
  createdAt: string;
  updatedAt: string;
}

export interface Assessment {
  id: string;
  systemId: string;
  systemName: string;
  organizationId: string;
  evaluatedBy: string;
  evaluatedAt: string;
  rulebookVersion: string;
  facts: any;
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
  triggeredRules: {
    ruleId: string;
    framework: string;
    title: string;
    citation: string;
    sourceVersion: string;
    effectiveDate: string;
    jurisdiction: string;
    severity: string;
    result: string;
    triggeringFacts: string[];
    explanation: string;
    requirements: string[];
    missingEvidence: string[];
    riskAreas: string[];
    legalReviewQuestions: string[];
  }[];
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
    status?: "Missing" | "Uploaded" | "Verified";
    evidenceArtifact?: {
      fileName: string;
      fileSize?: string;
      uploadedAt: string;
      notes?: string;
      referenceId?: string;
    };
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
  deterministicHash?: string;
}

export interface AuditLog {
  id: string;
  assessmentId: string;
  systemId: string;
  systemName: string;
  organizationId: string;
  userEmail: string;
  evaluatedAt: string;
  rulebookVersion: string;
  rulesEvaluatedCount: number;
  rulesTriggeredCount: number;
  ruleEvaluations: {
    ruleId: string;
    regulatorySource: string;
    sourceVersion: string;
    effectiveDate: string;
    triggeringFacts: string[];
    result: "TRIGGERED" | "NOT_TRIGGERED";
  }[];
  deterministicHash: string;
}

export interface RegulatoryUpdate {
  id: string;
  framework: string;
  title: string;
  publishDate: string;
  effectiveDate: string;
  type: "AMENDMENT" | "GUIDANCE" | "DEADLINE_ALERT" | "ENFORCEMENT";
  summary: string;
  impactedDomains: string[];
  recommendedAction: string;
}

export interface RegulatoryConflict {
  systemId: string;
  systemName: string;
  organizationId: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "INFO";
  type: "STALE_RULEBOOK" | "DEADLINE_APPROACHING" | "MANDATORY_EVIDENCE_MISSING" | "JURISDICTION_CONFLICT";
  title: string;
  message: string;
  framework: string;
  remedyAction: string;
}
