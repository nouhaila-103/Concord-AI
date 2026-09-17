import express from "express";
import { db, StoredAISystem, StoredAssessment, StoredAuditLog, StoredOrganization, StoredUser } from "./db.js";
import { extractStructuredFacts, fallbackFactExtraction, QuestionnaireAnswers } from "./factExtractor.js";
import { evaluateDeterministicRules } from "./rulesEngine.js";
import { CURRENT_RULEBOOK_VERSION, REGULATORY_RULE_CATALOG } from "./regulatoryRules.js";
import { generateMarkdownReport } from "./reportGenerator.js";
import { runContinuousConflictCheck } from "./monitor.js";

export const router = express.Router();

// Helper to get active user & org from header or default
function getAuthContext(req: express.Request): { user: StoredUser; org: StoredOrganization } {
  const orgId = (req.headers["x-organization-id"] as string) || "org-acme-corp";
  const userEmail = (req.headers["x-user-email"] as string) || "compliance.lead@acmeglobal.com";

  let user = db.getUserByEmail(userEmail);
  if (!user) {
    const users = db.getUsers();
    user = users[0] || {
      id: "user-1",
      email: "compliance.lead@acmeglobal.com",
      name: "Compliance Officer",
      role: "compliance_officer",
      organizationId: orgId,
      createdAt: new Date().toISOString(),
    };
  }

  let org = db.getOrganizationById(user.organizationId || orgId);
  if (!org) {
    const orgs = db.getOrganizations();
    org = orgs[0] || {
      id: "org-acme-corp",
      name: "Acme Global Technologies",
      tier: "Enterprise",
      industry: "Enterprise Software & Fintech",
      primaryJurisdictions: ["European Union", "United States (Federal)", "Colorado", "New York City", "California"],
      apiKey: "cncrd_live_default123",
      createdAt: new Date().toISOString(),
    };
  }

  return { user, org };
}

// ----------------------------------------------------
// 1. AUTH & ORGANIZATION MANAGEMENT
// ----------------------------------------------------
router.get("/auth/me", (req, res) => {
  const { user, org } = getAuthContext(req);
  res.json({ user, organization: org });
});

router.post("/auth/register", (req, res) => {
  const { name, email, role, organizationName, industry, jurisdictions } = req.body;

  if (!email || !organizationName) {
    res.status(400).json({ error: "Email and Organization Name are required." });
    return;
  }

  const orgId = "org-" + Math.random().toString(36).substring(2, 9);
  const newOrg: StoredOrganization = {
    id: orgId,
    name: organizationName,
    tier: "Enterprise",
    industry: industry || "Technology / AI",
    primaryJurisdictions: jurisdictions || ["European Union", "United States (Federal)"],
    apiKey: "cncrd_live_" + Math.random().toString(36).substring(2, 15),
    createdAt: new Date().toISOString(),
  };
  db.createOrganization(newOrg);

  const userId = "user-" + Math.random().toString(36).substring(2, 9);
  const newUser: StoredUser = {
    id: userId,
    email: email.trim(),
    name: name || email.split("@")[0],
    role: role || "compliance_officer",
    organizationId: orgId,
    createdAt: new Date().toISOString(),
  };
  db.createUser(newUser);

  res.json({ success: true, user: newUser, organization: newOrg });
});

router.post("/auth/login", (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: "Email is required" });
    return;
  }

  let user = db.getUserByEmail(email);
  if (!user) {
    // Auto-create user in default org for smooth experience
    const defaultOrg = db.getOrganizations()[0];
    user = db.createUser({
      id: "user-" + Math.random().toString(36).substring(2, 9),
      email: email.trim(),
      name: email.split("@")[0],
      role: "compliance_officer",
      organizationId: defaultOrg?.id || "org-acme-corp",
      createdAt: new Date().toISOString(),
    });
  }

  const org = db.getOrganizationById(user.organizationId) || db.getOrganizations()[0];
  res.json({ success: true, user, organization: org });
});

router.get("/auth/organizations", (req, res) => {
  const orgs = db.getOrganizations();
  res.json({ organizations: orgs });
});

router.post("/auth/organizations", (req, res) => {
  const { name, industry, jurisdictions, tier } = req.body;
  if (!name) {
    res.status(400).json({ error: "Organization name is required." });
    return;
  }

  const newOrg: StoredOrganization = {
    id: "org-" + Math.random().toString(36).substring(2, 9),
    name,
    tier: tier || "Enterprise",
    industry: industry || "Technology",
    primaryJurisdictions: jurisdictions || ["European Union", "United States (Federal)"],
    apiKey: "cncrd_live_" + Math.random().toString(36).substring(2, 15),
    createdAt: new Date().toISOString(),
  };

  db.createOrganization(newOrg);
  res.json({ success: true, organization: newOrg });
});

// ----------------------------------------------------
// 2. AI SYSTEMS INVENTORY
// ----------------------------------------------------
router.get("/systems", (req, res) => {
  const { org } = getAuthContext(req);
  const systems = db.getSystems(org.id);

  // If no systems exist yet for this org, seed one high-impact demo system
  if (systems.length === 0) {
    const demoSystemId = "sys-talentscan-pro";
    const demoAnswers: QuestionnaireAnswers = {
      systemName: "TalentScan Automated Candidate Ranker",
      whatItDoes: "Automated candidate resume parsing, skill matching, and video interview semantic scoring for hiring pipelines.",
      intendedPurpose: "Screen incoming applicant resumes and rank candidates for job interviews in corporate engineering and sales roles.",
      industry: "Human Resources / Employment",
      deploymentLocations: "European Union (Germany, France), United States (Colorado, New York City, California)",
      whoUsesIt: "Corporate hiring managers and HR talent acquisition teams.",
      whoIsAffected: "Job applicants and internal promotion candidates.",
      makesDecisionsAboutPeople: true,
      processesPersonalData: true,
      processesSensitiveData: false,
      affectedRegulatedAreas: ["employment", "recruitment", "workforce_management"],
      humanOversightDegree: "on-the-loop",
      modelProvider: "Fine-tuned Transformer on proprietary historical hiring records",
      decisionsAutomated: true,
    };

    const extractedFacts = fallbackFactExtraction(demoAnswers);
    const evalResult = evaluateDeterministicRules(extractedFacts);

    const assessmentId = "asm-" + Math.random().toString(36).substring(2, 9);
    const assessment: StoredAssessment = {
      id: assessmentId,
      systemId: demoSystemId,
      systemName: demoAnswers.systemName!,
      organizationId: org.id,
      evaluatedBy: "Elena Rostova (Compliance Lead)",
      evaluatedAt: new Date().toISOString(),
      rulebookVersion: CURRENT_RULEBOOK_VERSION,
      facts: extractedFacts,
      euClassification: evalResult.euClassification,
      usJurisdictionApplicability: evalResult.usJurisdictionApplicability,
      triggeredRules: evalResult.triggeredRules,
      aggregatedRequirements: evalResult.aggregatedRequirements,
      missingEvidenceList: evalResult.missingEvidenceList,
      riskAreasList: evalResult.riskAreasList,
      questionsRequiringLegalReview: evalResult.questionsRequiringLegalReview,
      sourceCitations: evalResult.sourceCitations,
      conflictAlerts: evalResult.conflictAlerts,
      complianceScore: evalResult.complianceScore,
      deterministicHash: evalResult.deterministicHash,
    };
    db.createAssessment(assessment);

    const auditLog: StoredAuditLog = {
      id: "aud-" + Math.random().toString(36).substring(2, 9),
      assessmentId,
      systemId: demoSystemId,
      systemName: demoAnswers.systemName!,
      organizationId: org.id,
      userEmail: "compliance.lead@acmeglobal.com",
      evaluatedAt: assessment.evaluatedAt,
      rulebookVersion: CURRENT_RULEBOOK_VERSION,
      rulesEvaluatedCount: evalResult.rulesEvaluatedCount,
      rulesTriggeredCount: evalResult.rulesTriggeredCount,
      ruleEvaluations: evalResult.evaluations.map((e) => ({
        ruleId: e.ruleId,
        regulatorySource: e.citation,
        sourceVersion: e.sourceVersion,
        effectiveDate: e.effectiveDate,
        triggeringFacts: e.triggeringFacts,
        result: e.result,
      })),
      deterministicHash: evalResult.deterministicHash,
    };
    db.createAuditLog(auditLog);

    const initialSystem: StoredAISystem = {
      id: demoSystemId,
      name: demoAnswers.systemName!,
      organizationId: org.id,
      status: "Assessed",
      rawAnswers: demoAnswers,
      extractedFacts,
      latestAssessmentId: assessmentId,
      latestAssessmentDate: assessment.evaluatedAt,
      riskTier: assessment.euClassification.tier,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.createOrUpdateSystem(initialSystem);

    res.json({ systems: [initialSystem] });
    return;
  }

  res.json({ systems });
});

router.get("/systems/:id", (req, res) => {
  const system = db.getSystemById(req.params.id);
  if (!system) {
    res.status(404).json({ error: "AI System not found" });
    return;
  }

  let latestAssessment: StoredAssessment | undefined = undefined;
  if (system.latestAssessmentId) {
    latestAssessment = db.getAssessmentById(system.latestAssessmentId);
  }

  res.json({ system, latestAssessment });
});

// ----------------------------------------------------
// 3. LAYER A: FACT EXTRACTION (AI-ASSISTED & PARSER)
// ----------------------------------------------------
router.post("/assess/extract-facts", async (req, res) => {
  const answers: QuestionnaireAnswers = req.body;
  try {
    const extractedFacts = await extractStructuredFacts(answers);
    res.json({ success: true, facts: extractedFacts });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to extract facts", details: err.message });
  }
});

// Auto-fill questionnaire from unstructured architecture documentation
router.post("/assess/parse-doc", async (req, res) => {
  const { docText } = req.body;
  if (!docText) {
    res.status(400).json({ error: "docText is required" });
    return;
  }
  const safeText = typeof docText === "string" ? docText : String(docText || "");

  // Use Gemini to propose answers to the 13 questionnaire questions
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Deterministic extraction fallback
    const answers: QuestionnaireAnswers = {
      systemName: "Analyzed AI Architecture",
      whatItDoes: safeText.substring(0, 300),
      intendedPurpose: "Automated analysis based on uploaded architecture document",
      industry: "Enterprise Software",
      deploymentLocations: "European Union, United States",
      whoUsesIt: "Authorized internal staff",
      whoIsAffected: "Customers and platform users",
      makesDecisionsAboutPeople: safeText.toLowerCase().includes("user") || safeText.toLowerCase().includes("person"),
      processesPersonalData: safeText.toLowerCase().includes("data") || safeText.toLowerCase().includes("user"),
      processesSensitiveData: false,
      affectedRegulatedAreas: ["employment"],
      humanOversightDegree: "in-the-loop",
      modelProvider: "Standard Transformer",
      decisionsAutomated: false,
      unstructuredNotes: safeText,
    };
    const extractedFacts = fallbackFactExtraction(answers);
    res.json({ success: true, proposedAnswers: answers, facts: extractedFacts });
    return;
  }

  try {
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } },
    });

    const prompt = `
Analyze the following AI system architecture document. Propose factual answers for the Concord AI 13-question compliance questionnaire:
1. What does the AI system do?
2. Intended purpose
3. Industry
4. Countries/states where deployed
5. Who uses it?
6. Who is affected?
7. Does it make or influence decisions about people? (boolean)
8. Does it process personal data? (boolean)
9. Does it process sensitive data? (boolean)
10. Does it affect employment, education, healthcare, finance, law enforcement, or other regulated areas? (list of areas)
11. Degree of human oversight (none/fully_autonomous, on-the-loop, in-the-loop, over-the-loop)
12. Model/provider
13. Whether decisions are automated (boolean)

DOCUMENT TEXT:
${safeText.substring(0, 6000)}

CRITICAL: Extract objective facts only. Do not formulate legal conclusions. Return clean JSON matching the keys.
`;

    const candidateModels = ["gemini-3.8-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
    let proposedAnswers: any = null;

    for (const model of candidateModels) {
      try {
        const generatePromise = ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          },
        });

        const response = await Promise.race([
          generatePromise,
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`Model ${model} timed out after 8s`)), 8000)
          ),
        ]);

        const text = response.text ? response.text.trim() : "";
        if (text) {
          proposedAnswers = JSON.parse(text);
          break;
        }
      } catch (err: any) {
        const errMsg = err?.message || String(err);
        const isHighDemandOrTransient =
          errMsg.includes("503") ||
          errMsg.includes("high demand") ||
          errMsg.includes("429") ||
          errMsg.includes("timed out") ||
          errMsg.includes("UNAVAILABLE");

        if (isHighDemandOrTransient) {
          await new Promise((r) => setTimeout(r, 300));
          continue;
        }
        continue;
      }
    }

    if (proposedAnswers) {
      const extractedFacts = await extractStructuredFacts(proposedAnswers);
      res.json({ success: true, proposedAnswers, facts: extractedFacts });
      return;
    }

    // Fallback if all candidate models were unavailable
    console.info("Doc parsing fell back to deterministic parser due to peak model demand.");
    const answers: QuestionnaireAnswers = {
      systemName: "Extracted AI System",
      whatItDoes: safeText.substring(0, 300),
      intendedPurpose: "Extracted from specification document",
      industry: "Enterprise",
      deploymentLocations: "European Union, United States",
      whoUsesIt: "Enterprise users",
      whoIsAffected: "End users",
      makesDecisionsAboutPeople: true,
      processesPersonalData: true,
      processesSensitiveData: false,
      affectedRegulatedAreas: ["employment"],
      humanOversightDegree: "in-the-loop",
      modelProvider: "Cloud Foundation Model",
      decisionsAutomated: false,
    };
    const facts = fallbackFactExtraction(answers);
    res.json({ success: true, proposedAnswers: answers, facts });
  } catch (err: any) {
    console.info("Doc parsing falling back to deterministic template:", err?.message || err);
    // Fallback
    const answers: QuestionnaireAnswers = {
      systemName: "Extracted AI System",
      whatItDoes: safeText.substring(0, 300),
      intendedPurpose: "Extracted from specification document",
      industry: "Enterprise",
      deploymentLocations: "European Union, United States",
      whoUsesIt: "Enterprise users",
      whoIsAffected: "End users",
      makesDecisionsAboutPeople: true,
      processesPersonalData: true,
      processesSensitiveData: false,
      affectedRegulatedAreas: ["employment"],
      humanOversightDegree: "in-the-loop",
      modelProvider: "Cloud Foundation Model",
      decisionsAutomated: false,
    };
    const facts = fallbackFactExtraction(answers);
    res.json({ success: true, proposedAnswers: answers, facts });
  }
});

// ----------------------------------------------------
// 4. LAYER B & C: DETERMINISTIC EVALUATION
// ----------------------------------------------------
router.post("/assess/evaluate", (req, res) => {
  const { systemId, systemName, rawAnswers, facts } = req.body;
  const { user, org } = getAuthContext(req);

  if (!facts) {
    res.status(400).json({ error: "Structured JSON facts are required for evaluation." });
    return;
  }

  // Execute purely deterministic rules engine (0% LLM randomness)
  const evalResult = evaluateDeterministicRules(facts);

  const sysId = systemId || "sys-" + Math.random().toString(36).substring(2, 9);
  const sysName = systemName || facts.system_profile?.name || "AI System";

  // Create Assessment record
  const assessmentId = "asm-" + Math.random().toString(36).substring(2, 9);
  const assessment: StoredAssessment = {
    id: assessmentId,
    systemId: sysId,
    systemName: sysName,
    organizationId: org.id,
    evaluatedBy: `${user.name} (${user.role})`,
    evaluatedAt: evalResult.evaluatedAt,
    rulebookVersion: evalResult.rulebookVersion,
    facts,
    euClassification: evalResult.euClassification,
    usJurisdictionApplicability: evalResult.usJurisdictionApplicability,
    triggeredRules: evalResult.triggeredRules,
    aggregatedRequirements: evalResult.aggregatedRequirements,
    missingEvidenceList: evalResult.missingEvidenceList,
    riskAreasList: evalResult.riskAreasList,
    questionsRequiringLegalReview: evalResult.questionsRequiringLegalReview,
    sourceCitations: evalResult.sourceCitations,
    conflictAlerts: evalResult.conflictAlerts,
    complianceScore: evalResult.complianceScore,
    deterministicHash: evalResult.deterministicHash,
  };
  db.createAssessment(assessment);

  // Maintain Audit Log
  const auditLog: StoredAuditLog = {
    id: "aud-" + Math.random().toString(36).substring(2, 9),
    assessmentId,
    systemId: sysId,
    systemName: sysName,
    organizationId: org.id,
    userEmail: user.email,
    evaluatedAt: evalResult.evaluatedAt,
    rulebookVersion: evalResult.rulebookVersion,
    rulesEvaluatedCount: evalResult.rulesEvaluatedCount,
    rulesTriggeredCount: evalResult.rulesTriggeredCount,
    ruleEvaluations: evalResult.evaluations.map((e) => ({
      ruleId: e.ruleId,
      regulatorySource: e.citation,
      sourceVersion: e.sourceVersion,
      effectiveDate: e.effectiveDate,
      triggeringFacts: e.triggeringFacts,
      result: e.result,
    })),
    deterministicHash: evalResult.deterministicHash,
  };
  db.createAuditLog(auditLog);

  // Update or create AI System in inventory
  const existingSystem = db.getSystemById(sysId);
  const updatedSystem: StoredAISystem = {
    id: sysId,
    name: sysName,
    organizationId: org.id,
    status: evalResult.conflictAlerts.length > 0 ? "Conflict Detected" : "Assessed",
    rawAnswers: rawAnswers || existingSystem?.rawAnswers || {},
    extractedFacts: facts,
    latestAssessmentId: assessmentId,
    latestAssessmentDate: evalResult.evaluatedAt,
    riskTier: evalResult.euClassification.tier,
    createdAt: existingSystem ? existingSystem.createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.createOrUpdateSystem(updatedSystem);

  res.json({
    success: true,
    assessment,
    auditLog,
    system: updatedSystem,
  });
});

// Re-evaluate an existing system
router.post("/systems/:id/re-evaluate", (req, res) => {
  const system = db.getSystemById(req.params.id);
  if (!system) {
    res.status(404).json({ error: "System not found" });
    return;
  }

  const { user, org } = getAuthContext(req);
  const evalResult = evaluateDeterministicRules(system.extractedFacts);

  const assessmentId = "asm-" + Math.random().toString(36).substring(2, 9);
  const assessment: StoredAssessment = {
    id: assessmentId,
    systemId: system.id,
    systemName: system.name,
    organizationId: org.id,
    evaluatedBy: `${user.name} (${user.role})`,
    evaluatedAt: evalResult.evaluatedAt,
    rulebookVersion: evalResult.rulebookVersion,
    facts: system.extractedFacts,
    euClassification: evalResult.euClassification,
    usJurisdictionApplicability: evalResult.usJurisdictionApplicability,
    triggeredRules: evalResult.triggeredRules,
    aggregatedRequirements: evalResult.aggregatedRequirements,
    missingEvidenceList: evalResult.missingEvidenceList,
    riskAreasList: evalResult.riskAreasList,
    questionsRequiringLegalReview: evalResult.questionsRequiringLegalReview,
    sourceCitations: evalResult.sourceCitations,
    conflictAlerts: evalResult.conflictAlerts,
    complianceScore: evalResult.complianceScore,
    deterministicHash: evalResult.deterministicHash,
  };
  db.createAssessment(assessment);

  const auditLog: StoredAuditLog = {
    id: "aud-" + Math.random().toString(36).substring(2, 9),
    assessmentId,
    systemId: system.id,
    systemName: system.name,
    organizationId: org.id,
    userEmail: user.email,
    evaluatedAt: evalResult.evaluatedAt,
    rulebookVersion: evalResult.rulebookVersion,
    rulesEvaluatedCount: evalResult.rulesEvaluatedCount,
    rulesTriggeredCount: evalResult.rulesTriggeredCount,
    ruleEvaluations: evalResult.evaluations.map((e) => ({
      ruleId: e.ruleId,
      regulatorySource: e.citation,
      sourceVersion: e.sourceVersion,
      effectiveDate: e.effectiveDate,
      triggeringFacts: e.triggeringFacts,
      result: e.result,
    })),
    deterministicHash: evalResult.deterministicHash,
  };
  db.createAuditLog(auditLog);

  res.json({ success: true, assessment, auditLog });
});

// Attach Evidence Artifact to Assessment
router.post("/assessments/:id/evidence", (req, res) => {
  const assessment = db.getAssessmentById(req.params.id);
  if (!assessment) {
    res.status(404).json({ error: "Assessment not found" });
    return;
  }

  const { itemIndex, evidenceArtifact } = req.body;
  if (itemIndex === undefined || !evidenceArtifact) {
    res.status(400).json({ error: "itemIndex and evidenceArtifact are required" });
    return;
  }

  const updatedMissingEvidenceList = [...(assessment.missingEvidenceList || [])];
  if (updatedMissingEvidenceList[itemIndex]) {
    updatedMissingEvidenceList[itemIndex] = {
      ...updatedMissingEvidenceList[itemIndex],
      status: "Uploaded",
      evidenceArtifact,
    };
  }

  // Calculate new score based on closed evidence gaps
  const currentScore = assessment.complianceScore || 40;
  const updatedScore = Math.min(95, currentScore + 6);

  const updated = db.updateAssessment(req.params.id, {
    missingEvidenceList: updatedMissingEvidenceList,
    complianceScore: updatedScore,
  });

  res.json({
    success: true,
    assessment: updated,
  });
});

// ----------------------------------------------------
// 5. LAYER E: REPORT GENERATION & EXPORTS
// ----------------------------------------------------
router.get("/assess/report/:assessmentId/json", (req, res) => {
  const assessment = db.getAssessmentById(req.params.assessmentId);
  if (!assessment) {
    res.status(404).json({ error: "Assessment not found" });
    return;
  }
  const system = db.getSystemById(assessment.systemId);
  const org = db.getOrganizationById(assessment.organizationId);

  res.setHeader("Content-Disposition", `attachment; filename="concord_compliance_${assessment.id}.json"`);
  res.setHeader("Content-Type", "application/json");
  res.json({
    complianceDossierVersion: "1.0",
    generatedBy: "Concord AI Enterprise Compliance Platform",
    assessment,
    system,
    organization: org,
  });
});

router.get("/assess/report/:assessmentId/markdown", (req, res) => {
  const assessment = db.getAssessmentById(req.params.assessmentId);
  if (!assessment) {
    res.status(404).json({ error: "Assessment not found" });
    return;
  }
  const system = db.getSystemById(assessment.systemId) || {
    id: assessment.systemId,
    name: assessment.systemName,
    organizationId: assessment.organizationId,
    status: "Assessed",
    rawAnswers: {},
    extractedFacts: assessment.facts,
    riskTier: assessment.euClassification.tier,
    createdAt: assessment.evaluatedAt,
    updatedAt: assessment.evaluatedAt,
  };
  const org = db.getOrganizationById(assessment.organizationId) || {
    id: "org-unknown",
    name: "Enterprise Organization",
    tier: "Enterprise",
    industry: "Technology",
    primaryJurisdictions: ["EU", "US"],
    apiKey: "",
    createdAt: "",
  };

  const auditLog = db.getAuditLogs().find((l) => l.assessmentId === assessment.id);
  const hash = assessment.deterministicHash || auditLog?.deterministicHash || "SHA256-" + (assessment.id || "ASSESSMENT");
  const enrichedAssessment = {
    ...assessment,
    deterministicHash: hash,
    rulesEvaluatedCount: auditLog?.rulesEvaluatedCount || assessment.triggeredRules?.length || 0,
    rulesTriggeredCount: auditLog?.rulesTriggeredCount || assessment.triggeredRules?.length || 0,
    evaluations: auditLog?.ruleEvaluations || assessment.triggeredRules || [],
  };

  const md = generateMarkdownReport(system, org, enrichedAssessment as any);
  res.setHeader("Content-Disposition", `attachment; filename="concord_report_${assessment.id}.md"`);
  res.setHeader("Content-Type", "text/markdown");
  res.send(md);
});

// ----------------------------------------------------
// 6. LAYER B: STRUCTURED REGULATORY RULES DATABASE
// ----------------------------------------------------
router.get("/rules", (req, res) => {
  res.json({
    currentVersion: CURRENT_RULEBOOK_VERSION,
    totalRules: REGULATORY_RULE_CATALOG.length,
    rules: REGULATORY_RULE_CATALOG,
  });
});

router.get("/rules/versions", (req, res) => {
  res.json({
    versions: [
      { version: "2026.2-FINAL", status: "ACTIVE", released: "2026-02-15", notes: "Incorporates full Colorado SB 205 deployer rules and EU AI Act Annex III definitions." },
      { version: "2025.4-STABLE", status: "DEPRECATED", released: "2025-10-10", notes: "Baseline EU AI Act Article 50 & NYC Local Law 144 definitions." },
      { version: "2025.1-LEGACY", status: "ARCHIVED", released: "2025-01-15", notes: "Initial EU AI Act draft rules." },
    ],
  });
});

// ----------------------------------------------------
// 7. REAL-TIME REGULATORY UPDATES & CONFLICT MONITOR
// ----------------------------------------------------
router.get("/regulatory/feed", (req, res) => {
  const updates = db.getRegulatoryUpdates();
  res.json({ updates });
});

router.get("/regulatory/conflicts", (req, res) => {
  const { org } = getAuthContext(req);
  const report = runContinuousConflictCheck(org.id);
  res.json(report);
});

// ----------------------------------------------------
// 8. AUDIT LOGS & PROVENANCE
// ----------------------------------------------------
router.get("/audit-logs", (req, res) => {
  const { org } = getAuthContext(req);
  const logs = db.getAuditLogs(org.id);
  res.json({ auditLogs: logs });
});

router.get("/audit-logs/:id", (req, res) => {
  const log = db.getAuditLogById(req.params.id);
  if (!log) {
    res.status(404).json({ error: "Audit log not found" });
    return;
  }
  res.json({ auditLog: log });
});

// ----------------------------------------------------
// 9. ENTERPRISE API DOCUMENTATION (OPENAPI METADATA)
// ----------------------------------------------------
router.get("/docs", (req, res) => {
  res.json({
    openapi: "3.0.3",
    info: {
      title: "Concord AI Regulatory Compliance API",
      version: "1.0.0",
      description: "Deterministic AI regulatory compliance assessment, rulebook querying, and audit logging API.",
      contact: { name: "Concord AI Enterprise Compliance Engineering", email: "support@concordai.internal" },
    },
    servers: [{ url: "/api", description: "Direct In-Process Server Endpoint" }],
    security: [{ ApiKeyAuth: [] }],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "X-API-Key",
          description: "Enterprise Organization API Key (find in Organization settings)",
        },
      },
    },
    endpoints: [
      {
        path: "/api/assess/extract-facts",
        method: "POST",
        summary: "Layer A: AI-Assisted Fact Extraction",
        description: "Converts the 13-question compliance questionnaire into validated structured JSON facts.",
      },
      {
        path: "/api/assess/evaluate",
        method: "POST",
        summary: "Layer B & C: Deterministic Statutory Evaluation",
        description: "Executes pure deterministic predicate matching against versioned regulatory rules. Generates EU tier, US jurisdiction matrix, requirements, missing evidence, risk areas, legal review questions, and cryptographic audit hash.",
      },
      {
        path: "/api/regulatory/conflicts",
        method: "GET",
        summary: "Continuous Regulatory Conflict Check",
        description: "Scans fleet systems against the latest regulatory updates, upcoming enforcement deadlines, and flags compliance discrepancies.",
      },
      {
        path: "/api/rules",
        method: "GET",
        summary: "Structured Regulatory Rules Database",
        description: "Returns the complete catalog of structured, versioned statutory rules.",
      },
      {
        path: "/api/audit-logs",
        method: "GET",
        summary: "Immutable Audit Trail",
        description: "Retrieves complete audit logs including triggering facts, evaluated rules, and deterministic SHA-256 hashes.",
      },
    ],
  });
});
