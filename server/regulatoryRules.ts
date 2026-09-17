export interface RulePredicate {
  field: string;
  operator: "equals" | "in" | "contains" | "includes_any" | "is_true" | "is_false";
  value?: any;
}

export interface StructuredRegulatoryRule {
  id: string;
  framework: "EU_AI_ACT" | "US_COLORADO_SB205" | "US_NYC_LL144" | "US_CALIFORNIA_AB2013" | "US_OMB_M24_10" | "NIST_AI_RMF" | "US_FTC_ACT_SEC5";
  rulebookVersion: string;
  title: string;
  citation: string;
  sourceVersion: string;
  effectiveDate: string;
  jurisdiction: string;
  severity: "PROHIBITED" | "HIGH_RISK" | "SPECIFIC_TRANSPARENCY" | "GOVERNANCE_MANDATE" | "MINIMAL_RISK";
  predicates: RulePredicate[];
  explanation: string;
  mandatoryRequirements: string[];
  missingEvidenceChecks: string[];
  riskAreas: string[];
  legalReviewQuestions: string[];
}

export const CURRENT_RULEBOOK_VERSION = "2026.2-FINAL";

export const REGULATORY_RULE_CATALOG: StructuredRegulatoryRule[] = [
  // 1. EU AI ACT - PROHIBITED: Biometric Categorization of Sensitive Traits
  {
    id: "EU-AIA-ART5-1D-BIOMETRIC-SENSITIVE",
    framework: "EU_AI_ACT",
    rulebookVersion: "2026.2-FINAL",
    title: "Prohibition: Biometric Categorization of Protected Attributes",
    citation: "Regulation (EU) 2024/1689, Article 5(1)(d)",
    sourceVersion: "Official Journal L 2024/1689",
    effectiveDate: "2025-02-02",
    jurisdiction: "European Union",
    severity: "PROHIBITED",
    predicates: [
      { field: "geographic_scope.isEUDeployed", operator: "is_true" },
      { field: "data_processing.processesBiometrics", operator: "is_true" },
      { field: "data_processing.processesSpecialCategoryData", operator: "is_true" },
    ],
    explanation: "AI systems that use biometric categorization to deduce or infer natural persons' race, political opinions, trade union membership, religious or philosophical beliefs, sex life or sexual orientation are strictly banned under Article 5.",
    mandatoryRequirements: [
      "Immediate cessation of biometric inference of sensitive or protected characteristics within the EU single market.",
      "Redesign system architecture to remove prohibited classification modules.",
    ],
    missingEvidenceChecks: [
      "Technical confirmation that biometric models do not classify sensitive attributes.",
      "Data lineage audit proving absence of prohibited profiling weights.",
    ],
    riskAreas: ["Unlawful biometric profiling", "Article 5 severe administrative fines (up to €35M or 7% global turnover)"],
    legalReviewQuestions: [
      "Does the system infer or predict any protected characteristics (health, politics, ethnicity) using biometric or behavioral sensor signals?",
    ],
  },

  // 2. EU AI ACT - HIGH RISK: Employment & Worker Management (Recruitment / Hiring)
  {
    id: "EU-AIA-ART6-ANNEX3-4A-HIRING",
    framework: "EU_AI_ACT",
    rulebookVersion: "2026.2-FINAL",
    title: "High-Risk AI System: Recruitment, Resume Screening & Job Allocation",
    citation: "Regulation (EU) 2024/1689, Article 6(2) and Annex III, Point 4(a)",
    sourceVersion: "Official Journal L 2024/1689",
    effectiveDate: "2026-08-02",
    jurisdiction: "European Union",
    severity: "HIGH_RISK",
    predicates: [
      { field: "geographic_scope.isEUDeployed", operator: "is_true" },
      { field: "regulated_sectors", operator: "includes_any", value: ["employment", "recruitment", "workforce_management"] },
      { field: "decision_impact.isConsequentialDecision", operator: "is_true" },
    ],
    explanation: "AI systems intended to be used for the recruitment or selection of natural persons, notably for placing targeted job advertisements, screening or filtering job applications, and evaluating candidates, are classified as High-Risk.",
    mandatoryRequirements: [
      "Mandatory Risk Management System established per Article 9.",
      "Data governance and training/validation dataset quality controls per Article 10.",
      "Comprehensive technical documentation drafted per Annex IV prior to deployment (Article 11).",
      "Automatic logging of events and model decisions during runtime (Article 12).",
      "Human oversight architecture (Article 14) enabling human operators to intervene or override outputs.",
      "High accuracy, robustness, and cybersecurity standards per Article 15.",
      "Registration in the official EU Database for High-Risk AI Systems before market entry (Article 71).",
      "Fundamental Rights Impact Assessment (FRIA) conducted prior to deployment (Article 27).",
    ],
    missingEvidenceChecks: [
      "Fundamental Rights Impact Assessment (FRIA) document.",
      "Annex IV Technical Documentation File.",
      "Data quality and anti-bias validation audit log.",
      "Designated qualified Human-in-the-Loop oversight protocol.",
      "EU Database Registration Confirmation.",
    ],
    riskAreas: ["Algorithmic discrimination in talent acquisition", "Unchecked automated rejection of candidates", "Disparate impact on protected classes"],
    legalReviewQuestions: [
      "Can human hiring managers meaningfully override the AI's candidate ranking, and are override decisions logged?",
      "Are candidates informed that an automated system was used in their evaluation, as mandated by Article 86?",
    ],
  },

  // 3. EU AI ACT - HIGH RISK: Worker Performance, Task Allocation & Termination
  {
    id: "EU-AIA-ART6-ANNEX3-4B-WORKFORCE-EVAL",
    framework: "EU_AI_ACT",
    rulebookVersion: "2026.2-FINAL",
    title: "High-Risk AI System: Employee Performance Evaluation & Promotion",
    citation: "Regulation (EU) 2024/1689, Article 6(2) and Annex III, Point 4(b)",
    sourceVersion: "Official Journal L 2024/1689",
    effectiveDate: "2026-08-02",
    jurisdiction: "European Union",
    severity: "HIGH_RISK",
    predicates: [
      { field: "geographic_scope.isEUDeployed", operator: "is_true" },
      { field: "regulated_sectors", operator: "includes_any", value: ["employment", "workforce_management"] },
      { field: "decision_impact.affectsLegalOrMaterialRights", operator: "is_true" },
    ],
    explanation: "AI systems intended to be used to make decisions affecting terms of work-related relationships, promotion, or termination, or to allocate tasks based on individual behavior, are classified as High-Risk.",
    mandatoryRequirements: [
      "Worker representative and employee notification prior to deployment (Article 26(11)).",
      "Continuous post-market monitoring plan (Article 72).",
      "Explainability reports for adverse worker decisions.",
    ],
    missingEvidenceChecks: [
      "Worker council / employee union consultation record.",
      "Standard operating procedure for contested performance ratings.",
    ],
    riskAreas: ["Intrusive workplace surveillance", "Invidious behavioral scoring", "Labor law violations"],
    legalReviewQuestions: [
      "Does the tool monitor employees continuously without active employee awareness?",
    ],
  },

  // 4. EU AI ACT - HIGH RISK: Credit Scoring & Financial Risk Assessment
  {
    id: "EU-AIA-ART6-ANNEX3-5A-CREDIT-SCORING",
    framework: "EU_AI_ACT",
    rulebookVersion: "2026.2-FINAL",
    title: "High-Risk AI System: Creditworthiness Evaluation & Credit Scoring",
    citation: "Regulation (EU) 2024/1689, Article 6(2) and Annex III, Point 5(a)",
    sourceVersion: "Official Journal L 2024/1689",
    effectiveDate: "2026-08-02",
    jurisdiction: "European Union",
    severity: "HIGH_RISK",
    predicates: [
      { field: "geographic_scope.isEUDeployed", operator: "is_true" },
      { field: "regulated_sectors", operator: "includes_any", value: ["finance", "banking", "credit_scoring", "lending"] },
      { field: "decision_impact.isConsequentialDecision", operator: "is_true" },
    ],
    explanation: "AI systems intended to evaluate the creditworthiness of natural persons or establish their credit score (excluding fraud detection AI) are designated High-Risk due to potential socio-economic exclusion.",
    mandatoryRequirements: [
      "Article 9 Risk Management System for credit bias prevention.",
      "Clear explanation provided to loan/credit applicants when denied or adversely scored (Article 86).",
      "Model governance ensuring non-use of proxy variables correlated with protected demographic characteristics.",
    ],
    missingEvidenceChecks: [
      "Disparate impact statistical test on demographic parity and equalized odds.",
      "Applicant right-to-explanation disclosure notice.",
    ],
    riskAreas: ["Redlining by proxy zip codes/digital footprints", "Financial exclusion", "Regulatory non-compliance with Consumer Credit Directive"],
    legalReviewQuestions: [
      "Does the model ingest alternative credit data (e.g. social media, device battery, browsing history) that violates fair lending norms?",
    ],
  },

  // 5. EU AI ACT - HIGH RISK: Healthcare Triage & Patient Prioritization
  {
    id: "EU-AIA-ART6-ANNEX3-5C-HEALTHCARE-TRIAGE",
    framework: "EU_AI_ACT",
    rulebookVersion: "2026.2-FINAL",
    title: "High-Risk AI System: Emergency Healthcare Triage & Service Allocation",
    citation: "Regulation (EU) 2024/1689, Article 6(2) and Annex III, Point 5(c)",
    sourceVersion: "Official Journal L 2024/1689",
    effectiveDate: "2026-08-02",
    jurisdiction: "European Union",
    severity: "HIGH_RISK",
    predicates: [
      { field: "geographic_scope.isEUDeployed", operator: "is_true" },
      { field: "regulated_sectors", operator: "includes_any", value: ["healthcare", "emergency_services", "medicine"] },
      { field: "decision_impact.affectsLegalOrMaterialRights", operator: "is_true" },
    ],
    explanation: "AI systems intended to dispatch or establish priority in the dispatching of emergency healthcare, fire, or police services are classified High-Risk.",
    mandatoryRequirements: [
      "Clinical safety verification and MDR/IVDR coordination if applicable.",
      "Fail-safe fallback procedures during network or algorithmic outage.",
      "Real-time human clinical oversight.",
    ],
    missingEvidenceChecks: [
      "Clinical risk assessment and validation protocol.",
      "Emergency manual override protocol documentation.",
    ],
    riskAreas: ["Delayed medical emergency response", "Life-safety algorithmic failure"],
    legalReviewQuestions: [
      "Is this system also subject to CE-marking under EU Medical Device Regulation (EU) 2017/745?",
    ],
  },

  // 6. EU AI ACT - TRANSPARENCY: Direct Human Interaction (Chatbots & Conversational AI)
  {
    id: "EU-AIA-ART50-1-CHATBOT-TRANSPARENCY",
    framework: "EU_AI_ACT",
    rulebookVersion: "2026.2-FINAL",
    title: "Transparency Obligation: Direct Human Interaction (Chatbots & Virtual Assistants)",
    citation: "Regulation (EU) 2024/1689, Article 50(1)",
    sourceVersion: "Official Journal L 2024/1689",
    effectiveDate: "2026-08-02",
    jurisdiction: "European Union",
    severity: "SPECIFIC_TRANSPARENCY",
    predicates: [
      { field: "geographic_scope.isEUDeployed", operator: "is_true" },
      { field: "system_profile.interactsWithHumansDirectly", operator: "is_true" },
    ],
    explanation: "Providers shall ensure that AI systems intended to interact directly with natural persons are designed and developed in such a way that the natural persons concerned are informed that they are interacting with an AI system.",
    mandatoryRequirements: [
      "Clear, upfront, and conspicuous disclosure to end users that they are interacting with an artificial intelligence system.",
      "Exception only applies where obvious from the context of use or permitted for law enforcement under specific conditions.",
    ],
    missingEvidenceChecks: [
      "UI/UX disclosure copy screenshot or API header documentation.",
    ],
    riskAreas: ["Deceptive anthropomorphic deception", "Article 50 transparency infringement penalties"],
    legalReviewQuestions: [
      "Is the AI notification visible at the initial touchpoint before personal data is exchanged?",
    ],
  },

  // 7. EU AI ACT - TRANSPARENCY: Generative AI & Synthetic Media Watermarking
  {
    id: "EU-AIA-ART50-2-GENAI-WATERMARKING",
    framework: "EU_AI_ACT",
    rulebookVersion: "2026.2-FINAL",
    title: "Transparency Obligation: Synthetic Content Marking & Watermarking",
    citation: "Regulation (EU) 2024/1689, Article 50(2) & 50(4)",
    sourceVersion: "Official Journal L 2024/1689",
    effectiveDate: "2026-08-02",
    jurisdiction: "European Union",
    severity: "SPECIFIC_TRANSPARENCY",
    predicates: [
      { field: "geographic_scope.isEUDeployed", operator: "is_true" },
      { field: "system_profile.isGenerativeAI", operator: "is_true" },
    ],
    explanation: "Providers of AI systems generating synthetic audio, image, video or text content must ensure outputs are marked in a machine-readable format and detectable as artificially created or manipulated.",
    mandatoryRequirements: [
      "Implement robust, state-of-the-art watermarking or metadata tags (e.g. C2PA / IPTC standard metadata).",
      "Ensure marks are resistant to stripping or trivial compression.",
    ],
    missingEvidenceChecks: [
      "Synthetic media detection & provenance metadata implementation specification.",
    ],
    riskAreas: ["Unlabeled deepfakes or disinformation generation", "Failure to comply with digital content provenance standards"],
    legalReviewQuestions: [
      "Does the generative output pass machine-readable provenance checks?",
    ],
  },

  // 8. US COLORADO - SB 24-205: High-Risk AI in Consequential Decisions
  {
    id: "US-CO-SB205-CONSEQUENTIAL-DECISIONS",
    framework: "US_COLORADO_SB205",
    rulebookVersion: "2026.2-FINAL",
    title: "Colorado AI Act (SB 24-205): Consequential Decision Deployer Governance",
    citation: "Colorado Revised Statutes § 6-1-1701 et seq. (SB 24-205)",
    sourceVersion: "Enacted 2024 / Effective Feb 1, 2026",
    effectiveDate: "2026-02-01",
    jurisdiction: "Colorado, USA",
    severity: "HIGH_RISK",
    predicates: [
      { field: "geographic_scope.deployedUSStates", operator: "includes_any", value: ["CO", "Colorado", "US-CO", "ALL_US"] },
      { field: "decision_impact.isConsequentialDecision", operator: "is_true" },
      { field: "regulated_sectors", operator: "includes_any", value: ["employment", "education", "finance", "healthcare", "housing", "insurance", "legal_services"] },
    ],
    explanation: "Colorado SB 24-205 establishes a statutory duty of reasonable care on deployers and developers of high-risk AI systems to protect consumers from known or reasonably foreseeable risks of algorithmic discrimination.",
    mandatoryRequirements: [
      "Implement a dedicated risk management policy and program based on NIST AI RMF or ISO/IEC 42001.",
      "Complete an annual Impact Assessment documenting purpose, intended benefits, potential discrimination risks, and mitigation measures.",
      "Provide pre-deployment notice to consumers explaining that high-risk AI is used, its purpose, and contact information.",
      "Provide consumer right to appeal an adverse consequential decision and request human review.",
      "Notify Colorado Attorney General within 90 days of discovering that the system caused or resulted in algorithmic discrimination.",
    ],
    missingEvidenceChecks: [
      "Colorado SB 205 AI Impact Assessment (annual).",
      "Consumer adverse decision notice with appeal & human review mechanism.",
      "Corporate Algorithmic Discrimination Risk Management Policy.",
    ],
    riskAreas: ["Algorithmic discrimination enforcement by Colorado AG (up to $20,000 per violation under CCPA)", "Lack of affirmative defense documentation"],
    legalReviewQuestions: [
      "Does the organization have an operational rebuttable presumption defense established by adhering to NIST AI RMF or ISO 42001?",
      "Can Colorado consumers formally appeal adverse decisions to a human decisionmaker?",
    ],
  },

  // 9. US NYC - LOCAL LAW 144: Automated Employment Decision Tools (AEDT)
  {
    id: "US-NYC-LL144-AEDT-BIAS-AUDIT",
    framework: "US_NYC_LL144",
    rulebookVersion: "2026.2-FINAL",
    title: "NYC Local Law 144: Mandatory Annual Independent Bias Audit for AEDT",
    citation: "NYC Administrative Code § 20-870 through 20-874, 6 RCNY § 5-300 et seq.",
    sourceVersion: "Final Rules Effective July 5, 2023",
    effectiveDate: "2023-07-05",
    jurisdiction: "New York City, USA",
    severity: "HIGH_RISK",
    predicates: [
      { field: "geographic_scope.deployedUSStates", operator: "includes_any", value: ["NYC", "New York City", "NY", "New York", "US-NY", "ALL_US"] },
      { field: "regulated_sectors", operator: "includes_any", value: ["employment", "recruitment", "hiring", "workforce_management"] },
      { field: "decision_impact.isConsequentialDecision", operator: "is_true" },
    ],
    explanation: "Employers and employment agencies in New York City are prohibited from using an automated employment decision tool (AEDT) to screen candidates or employees unless the tool has undergone an independent bias audit within the past year.",
    mandatoryRequirements: [
      "Independent external bias audit calculating selection rates and impact ratios across sex, race, and ethnicity categories.",
      "Publicly post a summary of the most recent bias audit and distribution date on the careers section of the employer's website.",
      "Provide 10 business days advance written notice to candidates and employees residing in NYC before the tool is used.",
      "Provide instructions on how to request an alternative selection process or reasonable accommodation.",
      "Disclose data retention policy and type of data collected within 30 days of written request.",
    ],
    missingEvidenceChecks: [
      "Independent Auditor Bias Audit Report dated within the last 365 days.",
      "Publicly posted summary link with impact ratio tables.",
      "10-day candidate advance notice template with opt-out / accommodation instructions.",
    ],
    riskAreas: ["Daily civil penalties ($500 to $1,500 per day per candidate)", "NYC Department of Consumer and Worker Protection (DCWP) enforcement"],
    legalReviewQuestions: [
      "Has an external, objective auditor executed the disparate impact matrix on historical applicant data within the last 12 months?",
      "Is the 10-day candidate notice triggered automatically before any automated scoring occurs?",
    ],
  },

  // 10. US CALIFORNIA - AB 2013: AI Training Data Transparency Act
  {
    id: "US-CA-AB2013-TRAINING-TRANSPARENCY",
    framework: "US_CALIFORNIA_AB2013",
    rulebookVersion: "2026.2-FINAL",
    title: "California AB 2013: Generative AI Training Data Disclosure",
    citation: "California Civil Code § 1798.500 et seq. (AB 2013)",
    sourceVersion: "Enacted 2024 / Operative Jan 1, 2026",
    effectiveDate: "2026-01-01",
    jurisdiction: "California, USA",
    severity: "GOVERNANCE_MANDATE",
    predicates: [
      { field: "geographic_scope.deployedUSStates", operator: "includes_any", value: ["CA", "California", "US-CA", "ALL_US"] },
      { field: "system_profile.isGenerativeAI", operator: "is_true" },
    ],
    explanation: "Requires developers of generative AI systems made available to Californians to post on their website a high-level summary of the datasets used to train the system.",
    mandatoryRequirements: [
      "Publicly document source and ownership of datasets used in pre-training and fine-tuning.",
      "Disclose whether datasets contain copyrighted, trademarked, or patented data.",
      "Disclose whether datasets include personal information or protected attributes under California law.",
      "Disclose whether synthetic data was used to augment the training set.",
    ],
    missingEvidenceChecks: [
      "AB 2013 Public Training Data Disclosure Sheet.",
      "IP and Copyright scrub audit report.",
    ],
    riskAreas: ["California Attorney General and privacy regulator inquiries", "IP infringement exposure"],
    legalReviewQuestions: [
      "Has legal counsel reviewed the training data disclosure summary before public publication?",
    ],
  },

  // 11. US FEDERAL - OMB MEMO M-24-10: Federal AI Governance
  {
    id: "US-FED-OMB-M24-10-FEDERAL-USE",
    framework: "US_OMB_M24_10",
    rulebookVersion: "2026.2-FINAL",
    title: "OMB Memo M-24-10: Minimum Risk Management for Rights-Impacting Federal AI",
    citation: "White House OMB Memorandum M-24-10 (Advancing Governance, Innovation, and Risk Management for Agency Use of AI)",
    sourceVersion: "OMB M-24-10 (March 2024 / Ongoing)",
    effectiveDate: "2024-12-01",
    jurisdiction: "United States (Federal)",
    severity: "HIGH_RISK",
    predicates: [
      { field: "geographic_scope.isFederalGovContract", operator: "is_true" },
      { field: "decision_impact.affectsLegalOrMaterialRights", operator: "is_true" },
    ],
    explanation: "Applies mandatory minimum risk management practices for rights-impacting or safety-impacting AI procured, operated, or used by US federal agencies.",
    mandatoryRequirements: [
      "Agency Chief AI Officer (CAIO) determination and risk review.",
      "Pre-deployment real-world performance testing for equity and fairness.",
      "Mandatory human oversight with ability to intervene or reverse automated determinations.",
      "Inclusion in the annual agency public AI use case inventory.",
    ],
    missingEvidenceChecks: [
      "Federal Agency CAIO Authorization Memo.",
      "Pre-deployment real-world equity impact testing report.",
      "Federal AI Inventory registration entry.",
    ],
    riskAreas: ["Contract disqualification with federal agency", "Non-compliance with Federal Acquisition Regulations (FAR)"],
    legalReviewQuestions: [
      "Has an agency CAIO waiver been requested if any minimum risk management practice cannot be met?",
    ],
  },

  // 12. US FTC - SECTION 5: Deceptive & Unfair AI Practices
  {
    id: "US-FTC-ACT-SECTION5-FAIRNESS",
    framework: "US_FTC_ACT_SEC5",
    rulebookVersion: "2026.2-FINAL",
    title: "FTC Act Section 5: Unfair, Deceptive or Biased Automated Decision-Making",
    citation: "Federal Trade Commission Act, 15 U.S.C. § 45(a)",
    sourceVersion: "FTC AI Enforcement Guidance 2023-2025",
    effectiveDate: "2023-01-01",
    jurisdiction: "United States (Federal)",
    severity: "GOVERNANCE_MANDATE",
    predicates: [
      { field: "decision_impact.isConsequentialDecision", operator: "is_true" },
      { field: "oversight_profile.oversightLevel", operator: "equals", value: "none/fully_autonomous" },
    ],
    explanation: "The FTC actively enforces Section 5 against companies deploying automated systems that produce discriminatory outcomes without substantiation or deploy automated claims that deceive consumers.",
    mandatoryRequirements: [
      "Empirical substantiation of all accuracy, efficacy, and fairness claims.",
      "Algorithmic impact monitoring to prevent unfair trade practices and discriminatory impact.",
      "Mechanism for human intervention where autonomous decisions cause substantial injury.",
    ],
    missingEvidenceChecks: [
      "Substantiation dossier supporting all public performance claims.",
      "Complaint handling procedure for consumers harmed by algorithmic outputs.",
    ],
    riskAreas: ["FTC Civil Investigative Demands (CIDs)", "Mandatory algorithmic disgorgement (destroying models & weights)"],
    legalReviewQuestions: [
      "Can marketing or sales claims about the AI's precision be validated with rigorous empirical data?",
    ],
  },

  // 13. NIST AI RMF 1.0 (NIST AI 100-1) - Core Trustworthy AI Profile
  {
    id: "NIST-AI-RMF-100-1-CORE-GOVERNANCE",
    framework: "NIST_AI_RMF",
    rulebookVersion: "2026.2-FINAL",
    title: "NIST AI RMF 1.0: Cross-Cutting Trustworthy AI Framework Profile",
    citation: "NIST Special Publication 1270 / NIST AI 100-1",
    sourceVersion: "NIST AI RMF 1.0",
    effectiveDate: "2023-01-26",
    jurisdiction: "United States & International Standard",
    severity: "GOVERNANCE_MANDATE",
    predicates: [
      { field: "decision_impact.isConsequentialDecision", operator: "is_true" },
    ],
    explanation: "Voluntary benchmark standard widely adopted as the safe harbor and compliance baseline across US state laws (e.g. Colorado SB 205) and federal guidance.",
    mandatoryRequirements: [
      "GOVERN: Institutional policies, roles, and accountability for AI risk management.",
      "MAP: Context identification, intended purpose boundaries, and stakeholder impact mapping.",
      "MEASURE: Rigorous quantitative and qualitative tracking of bias, robustness, and drift.",
      "MANAGE: Risk prioritization, incident response, and continuous operational oversight.",
    ],
    missingEvidenceChecks: [
      "NIST AI RMF Crosswalk Alignment Matrix.",
      "AI Incident Response and Model Rollback Protocol.",
    ],
    riskAreas: ["Failure to establish standard-of-care defense in tort or regulatory litigation"],
    legalReviewQuestions: [
      "Are risk tolerances formally approved by senior executive leadership / AI Ethics Board?",
    ],
  },
];
