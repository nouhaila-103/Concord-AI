import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export interface StoredUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "compliance_officer" | "auditor";
  organizationId: string;
  createdAt: string;
}

export interface StoredOrganization {
  id: string;
  name: string;
  tier: "Enterprise" | "Growth" | "Starter";
  industry: string;
  primaryJurisdictions: string[];
  apiKey: string;
  createdAt: string;
}

export interface StoredAISystem {
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

export interface StoredAssessment {
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
  triggeredRules: any[];
  aggregatedRequirements: any[];
  missingEvidenceList: any[];
  riskAreasList: any[];
  questionsRequiringLegalReview: string[];
  sourceCitations: any[];
  conflictAlerts: any[];
  complianceScore: number;
  deterministicHash?: string;
}

export interface StoredAuditLog {
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

class PersistentStore {
  private usersFile = path.join(DATA_DIR, "users.json");
  private orgsFile = path.join(DATA_DIR, "organizations.json");
  private systemsFile = path.join(DATA_DIR, "systems.json");
  private assessmentsFile = path.join(DATA_DIR, "assessments.json");
  private auditLogsFile = path.join(DATA_DIR, "audit_logs.json");
  private regulatoryUpdatesFile = path.join(DATA_DIR, "regulatory_updates.json");

  constructor() {
    this.initDefaults();
  }

  private read<T>(filePath: string, fallback: T): T {
    try {
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2));
        return fallback;
      }
      const data = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(data);
    } catch (e) {
      console.error(`Error reading ${filePath}:`, e);
      return fallback;
    }
  }

  private write<T>(filePath: string, data: T): void {
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (e) {
      console.error(`Error writing ${filePath}:`, e);
    }
  }

  private initDefaults() {
    // Default Organization
    const orgs = this.read<StoredOrganization[]>(this.orgsFile, []);
    if (orgs.length === 0) {
      const defaultOrg: StoredOrganization = {
        id: "org-acme-corp",
        name: "Acme Global Technologies",
        tier: "Enterprise",
        industry: "Enterprise Software & Fintech",
        primaryJurisdictions: ["European Union", "United States (Federal)", "Colorado", "New York City", "California"],
        apiKey: "cncrd_live_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        createdAt: new Date().toISOString(),
      };
      this.write(this.orgsFile, [defaultOrg]);
    }

    // Default User
    const users = this.read<StoredUser[]>(this.usersFile, []);
    if (users.length === 0) {
      const defaultUser: StoredUser = {
        id: "user-1",
        email: "compliance.lead@acmeglobal.com",
        name: "Elena Rostova",
        role: "compliance_officer",
        organizationId: "org-acme-corp",
        createdAt: new Date().toISOString(),
      };
      this.write(this.usersFile, [defaultUser]);
    }

    // Default Regulatory Updates
    const updates = this.read<RegulatoryUpdate[]>(this.regulatoryUpdatesFile, []);
    if (updates.length === 0) {
      const defaultUpdates: RegulatoryUpdate[] = [
        {
          id: "reg-upd-2026-01",
          framework: "EU AI Act (Regulation (EU) 2024/1689)",
          title: "Full Enforcement of Annex III High-Risk Systems Approaches",
          publishDate: "2026-02-15",
          effectiveDate: "2026-08-02",
          type: "DEADLINE_ALERT",
          summary: "Mandatory conformity assessments, CE marking, and FRIA requirements take effect for Annex III AI systems in employment, education, and essential private services.",
          impactedDomains: ["employment", "education", "finance", "credit_scoring"],
          recommendedAction: "Verify technical documentation, QMS, and independent conformity pathways immediately.",
        },
        {
          id: "reg-upd-2026-02",
          framework: "Colorado SB 24-205 (Consumer Protection in AI)",
          title: "Colorado Attorney General Guidance on Algorithmic Discrimination",
          publishDate: "2026-01-20",
          effectiveDate: "2026-02-01",
          type: "ENFORCEMENT",
          summary: "Requires deployers of high-risk AI making consequential decisions to publish consumer disclosure statements and complete annual impact assessments.",
          impactedDomains: ["employment", "healthcare", "financial_services", "housing"],
          recommendedAction: "Ensure consumer notification template is implemented with 60-day pre-deployment notice.",
        },
        {
          id: "reg-upd-2026-03",
          framework: "California AB 2013 (AI Training Data Transparency Act)",
          title: "Public Training Data Source Disclosure Obligation",
          publishDate: "2026-01-01",
          effectiveDate: "2026-01-01",
          type: "GUIDANCE",
          summary: "Developers of generative AI systems deployed to Californians must publish high-level summaries of datasets, copyright status, and personal data inclusion.",
          impactedDomains: ["generative_ai", "foundation_models", "customer_service"],
          recommendedAction: "Document dataset lineage and publish training data summary.",
        },
        {
          id: "reg-upd-2026-04",
          framework: "NYC Local Law 144",
          title: "Enforcement Notice: Annual Bias Audit Recertification Requirement",
          publishDate: "2025-11-14",
          effectiveDate: "2026-01-01",
          type: "AMENDMENT",
          summary: "Automated employment decision tools (AEDT) must have audits completed within the preceding 12 months with publicly posted summary of selection rates.",
          impactedDomains: ["employment", "recruitment", "hiring"],
          recommendedAction: "Schedule annual external bias audit if audit date is older than 365 days.",
        }
      ];
      this.write(this.regulatoryUpdatesFile, defaultUpdates);
    }
  }

  // Users
  getUsers(): StoredUser[] {
    return this.read<StoredUser[]>(this.usersFile, []);
  }

  getUserById(id: string): StoredUser | undefined {
    return this.getUsers().find((u) => u.id === id);
  }

  getUserByEmail(email: string): StoredUser | undefined {
    return this.getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(user: StoredUser): StoredUser {
    const users = this.getUsers();
    users.push(user);
    this.write(this.usersFile, users);
    return user;
  }

  // Organizations
  getOrganizations(): StoredOrganization[] {
    return this.read<StoredOrganization[]>(this.orgsFile, []);
  }

  getOrganizationById(id: string): StoredOrganization | undefined {
    return this.getOrganizations().find((o) => o.id === id);
  }

  createOrganization(org: StoredOrganization): StoredOrganization {
    const orgs = this.getOrganizations();
    orgs.push(org);
    this.write(this.orgsFile, orgs);
    return org;
  }

  // AI Systems
  getSystems(organizationId?: string): StoredAISystem[] {
    const systems = this.read<StoredAISystem[]>(this.systemsFile, []);
    if (organizationId) {
      return systems.filter((s) => s.organizationId === organizationId);
    }
    return systems;
  }

  getSystemById(id: string): StoredAISystem | undefined {
    return this.getSystems().find((s) => s.id === id);
  }

  createOrUpdateSystem(system: StoredAISystem): StoredAISystem {
    const systems = this.getSystems();
    const index = systems.findIndex((s) => s.id === system.id);
    if (index >= 0) {
      systems[index] = { ...systems[index], ...system, updatedAt: new Date().toISOString() };
    } else {
      systems.push(system);
    }
    this.write(this.systemsFile, systems);
    return system;
  }

  // Assessments
  getAssessments(organizationId?: string): StoredAssessment[] {
    const assessments = this.read<StoredAssessment[]>(this.assessmentsFile, []);
    if (organizationId) {
      return assessments.filter((a) => a.organizationId === organizationId);
    }
    return assessments;
  }

  getAssessmentById(id: string): StoredAssessment | undefined {
    return this.getAssessments().find((a) => a.id === id);
  }

  createAssessment(assessment: StoredAssessment): StoredAssessment {
    const assessments = this.getAssessments();
    assessments.unshift(assessment);
    this.write(this.assessmentsFile, assessments);

    // Update AI System reference
    const system = this.getSystemById(assessment.systemId);
    if (system) {
      system.latestAssessmentId = assessment.id;
      system.latestAssessmentDate = assessment.evaluatedAt;
      system.riskTier = assessment.euClassification.tier;
      system.status = assessment.conflictAlerts.length > 0 ? "Conflict Detected" : "Assessed";
      this.createOrUpdateSystem(system);
    }

    return assessment;
  }

  updateAssessment(id: string, updates: Partial<StoredAssessment>): StoredAssessment | undefined {
    const assessments = this.getAssessments();
    const index = assessments.findIndex((a) => a.id === id);
    if (index >= 0) {
      assessments[index] = { ...assessments[index], ...updates };
      this.write(this.assessmentsFile, assessments);
      return assessments[index];
    }
    return undefined;
  }

  // Audit Logs
  getAuditLogs(organizationId?: string): StoredAuditLog[] {
    const logs = this.read<StoredAuditLog[]>(this.auditLogsFile, []);
    if (organizationId) {
      return logs.filter((l) => l.organizationId === organizationId);
    }
    return logs;
  }

  getAuditLogById(id: string): StoredAuditLog | undefined {
    return this.getAuditLogs().find((l) => l.id === id);
  }

  createAuditLog(log: StoredAuditLog): StoredAuditLog {
    const logs = this.getAuditLogs();
    logs.unshift(log);
    this.write(this.auditLogsFile, logs);
    return log;
  }

  // Regulatory Updates
  getRegulatoryUpdates(): RegulatoryUpdate[] {
    return this.read<RegulatoryUpdate[]>(this.regulatoryUpdatesFile, []);
  }

  addRegulatoryUpdate(update: RegulatoryUpdate): void {
    const updates = this.getRegulatoryUpdates();
    updates.unshift(update);
    this.write(this.regulatoryUpdatesFile, updates);
  }
}

export const db = new PersistentStore();
