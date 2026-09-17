import React, { useState } from "react";
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2, ShieldAlert, Cpu, FileText, Check, AlertTriangle, RefreshCw, Dices, Loader2 } from "lucide-react";
import { Assessment } from "../types";
import { generateRandomAISystemDemo, DemoSystemTemplate } from "../utils/demoGenerator";

interface AssessmentWizardProps {
  onComplete: (assessment: Assessment) => void;
  onCancel: () => void;
}

export const AssessmentWizard: React.FC<AssessmentWizardProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Questionnaire, 2: Fact Extraction (Layer A), 3: Evaluating (Layer B & C)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRandomDemo, setLastRandomDemo] = useState<(DemoSystemTemplate & { demoSeedId: string }) | null>(null);
  const [randomizeCount, setRandomizeCount] = useState<number>(0);
  const [isAutoEvaluating, setIsAutoEvaluating] = useState<boolean>(false);
  const [autoEvalStatus, setAutoEvalStatus] = useState<string>("");

  // Questionnaire state (13 required questions)
  const [form, setForm] = useState({
    systemName: "",
    whatItDoes: "",
    intendedPurpose: "",
    industry: "",
    deploymentLocations: "",
    whoUsesIt: "",
    whoIsAffected: "",
    makesDecisionsAboutPeople: true,
    processesPersonalData: true,
    processesSensitiveData: false,
    affectedRegulatedAreas: [] as string[],
    humanOversightDegree: "in-the-loop",
    modelProvider: "",
    decisionsAutomated: true,
    unstructuredNotes: "",
  });

  // Layer A extracted facts
  const [extractedFacts, setExtractedFacts] = useState<any>(null);

  // Presets to let user test immediately with real-world scenarios
  const applyPreset = (presetType: "hr" | "credit" | "genai" | "healthcare") => {
    if (presetType === "hr") {
      setForm({
        systemName: "TalentScan Automated Candidate Screener",
        whatItDoes: "Automated candidate resume parsing, skill matching, and video interview semantic scoring for hiring pipelines.",
        intendedPurpose: "Screen incoming applicant resumes and rank candidates for job interviews in corporate engineering and sales roles.",
        industry: "Human Resources / Employment",
        deploymentLocations: "European Union (Germany, France), United States (Colorado, New York City, California)",
        whoUsesIt: "Corporate hiring managers and HR talent acquisition teams.",
        whoIsAffected: "Job applicants and internal promotion candidates.",
        makesDecisionsAboutPeople: true,
        processesPersonalData: true,
        processesSensitiveData: false,
        affectedRegulatedAreas: ["employment"],
        humanOversightDegree: "on-the-loop",
        modelProvider: "Fine-tuned Transformer on proprietary historical hiring records",
        decisionsAutomated: true,
        unstructuredNotes: "Deployed as a SaaS API integrated with Workday. System generates ranked candidate scores between 0-100.",
      });
    } else if (presetType === "credit") {
      setForm({
        systemName: "CrediPulse Underwriting & Loan Decision Engine",
        whatItDoes: "Analyzes financial transactions, debt-to-income ratios, and payment behavior to predict credit default probability.",
        intendedPurpose: "Automate consumer loan eligibility thresholds and set interest rates for credit card applicants.",
        industry: "Financial Services / Banking",
        deploymentLocations: "European Union, United States (Colorado, California, Nationwide)",
        whoUsesIt: "Retail loan officers and automated credit approval servers.",
        whoIsAffected: "Consumer credit applicants and mortgage seekers.",
        makesDecisionsAboutPeople: true,
        processesPersonalData: true,
        processesSensitiveData: false,
        affectedRegulatedAreas: ["finance"],
        humanOversightDegree: "in-the-loop",
        modelProvider: "LightGBM + Deep Learning ensemble trained on credit bureau datasets",
        decisionsAutomated: true,
        unstructuredNotes: "Produces automated denial letters and risk tier scores. Substantial factor in lending determinations.",
      });
    } else if (presetType === "genai") {
      setForm({
        systemName: "OmniAssist Public Customer Support Bot",
        whatItDoes: "Generative conversational agent answering customer billing inquiries, product questions, and troubleshooting requests.",
        intendedPurpose: "Provide 24/7 self-service answers to public web visitors.",
        industry: "Retail & E-commerce",
        deploymentLocations: "European Union, United States (California, New York, Texas)",
        whoUsesIt: "End-consumer web visitors.",
        whoIsAffected: "General public consumers.",
        makesDecisionsAboutPeople: false,
        processesPersonalData: true,
        processesSensitiveData: false,
        affectedRegulatedAreas: [],
        humanOversightDegree: "in-the-loop",
        modelProvider: "OpenAI GPT-4o / Google Gemini 3.8 Flash via API",
        decisionsAutomated: false,
        unstructuredNotes: "Generates synthetic text and assists live support agents. Operates directly on public web portal.",
      });
    } else if (presetType === "healthcare") {
      setForm({
        systemName: "TriageIQ Emergency Patient Severity Classifier",
        whatItDoes: "Predicts patient acute deterioration risk from vital signs and triage intake notes at hospital admission.",
        intendedPurpose: "Establish patient queue prioritization in emergency room waiting areas.",
        industry: "Healthcare & Emergency Medicine",
        deploymentLocations: "European Union (Germany), United States (Federal Hospital Network, Colorado)",
        whoUsesIt: "Emergency department triage nurses and attending emergency physicians.",
        whoIsAffected: "Hospital emergency room patients.",
        makesDecisionsAboutPeople: true,
        processesPersonalData: true,
        processesSensitiveData: true,
        affectedRegulatedAreas: ["healthcare"],
        humanOversightDegree: "in-the-loop",
        modelProvider: "Hospital clinical predictive model",
        decisionsAutomated: false,
        unstructuredNotes: "Advisory score displayed on EHR dashboard with clinical nurse veto requirement.",
      });
    }
  };

  // Demo Feature: Fills the form with a freshly randomized AI system
  const handleRandomizeInputs = () => {
    const randomDemo = generateRandomAISystemDemo();
    setLastRandomDemo(randomDemo);
    setRandomizeCount((prev) => prev + 1);
    setForm({
      systemName: randomDemo.systemName,
      whatItDoes: randomDemo.whatItDoes,
      intendedPurpose: randomDemo.intendedPurpose,
      industry: randomDemo.industry,
      deploymentLocations: randomDemo.deploymentLocations,
      whoUsesIt: randomDemo.whoUsesIt,
      whoIsAffected: randomDemo.whoIsAffected,
      makesDecisionsAboutPeople: randomDemo.makesDecisionsAboutPeople,
      processesPersonalData: randomDemo.processesPersonalData,
      processesSensitiveData: randomDemo.processesSensitiveData,
      affectedRegulatedAreas: [...randomDemo.affectedRegulatedAreas],
      humanOversightDegree: randomDemo.humanOversightDegree,
      modelProvider: randomDemo.modelProvider,
      decisionsAutomated: randomDemo.decisionsAutomated,
      unstructuredNotes: randomDemo.unstructuredNotes,
    });
    setError(null);
  };

  // Demo Feature: Fills with a randomized AI system AND executes evaluation immediately so it shows the result
  const handleRandomDemoAndShowResult = async () => {
    setError(null);
    setIsAutoEvaluating(true);
    const randomDemo = generateRandomAISystemDemo();
    setLastRandomDemo(randomDemo);
    setRandomizeCount((prev) => prev + 1);

    const populatedForm = {
      systemName: randomDemo.systemName,
      whatItDoes: randomDemo.whatItDoes,
      intendedPurpose: randomDemo.intendedPurpose,
      industry: randomDemo.industry,
      deploymentLocations: randomDemo.deploymentLocations,
      whoUsesIt: randomDemo.whoUsesIt,
      whoIsAffected: randomDemo.whoIsAffected,
      makesDecisionsAboutPeople: randomDemo.makesDecisionsAboutPeople,
      processesPersonalData: randomDemo.processesPersonalData,
      processesSensitiveData: randomDemo.processesSensitiveData,
      affectedRegulatedAreas: [...randomDemo.affectedRegulatedAreas],
      humanOversightDegree: randomDemo.humanOversightDegree,
      modelProvider: randomDemo.modelProvider,
      decisionsAutomated: randomDemo.decisionsAutomated,
      unstructuredNotes: randomDemo.unstructuredNotes,
    };
    setForm(populatedForm);

    try {
      setAutoEvalStatus(`Randomizing: ${randomDemo.systemName} (${randomDemo.industry})...`);
      
      // Step 1: Extract Structured Facts
      setAutoEvalStatus(`Layer A: Extracting technical facts for ${randomDemo.systemName}...`);
      const factRes = await fetch("/api/assess/extract-facts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(populatedForm),
      });
      const factData = await factRes.json();
      if (!factRes.ok) throw new Error(factData.error || "Fact extraction failed");

      const facts = factData.facts;
      setExtractedFacts(facts);

      // Step 2: Evaluate Deterministic Rules
      setAutoEvalStatus("Layer B & C: Executing deterministic statutory rules engine (EU AI Act & US State Laws)...");
      const evalRes = await fetch("/api/assess/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemName: populatedForm.systemName,
          rawAnswers: populatedForm,
          facts,
        }),
      });
      const evalData = await evalRes.json();
      if (!evalRes.ok) throw new Error(evalData.error || "Deterministic evaluation failed");

      setAutoEvalStatus("Evaluation complete! Loading regulatory compliance dossier...");
      setTimeout(() => {
        onComplete(evalData.assessment);
      }, 350);
    } catch (err: any) {
      setError(err.message || "Failed to execute random demo evaluation");
      setIsAutoEvaluating(false);
      setAutoEvalStatus("");
    }
  };

  const handleRegulatedAreaToggle = (area: string) => {
    if (form.affectedRegulatedAreas.includes(area)) {
      setForm({ ...form, affectedRegulatedAreas: form.affectedRegulatedAreas.filter((a) => a !== area) });
    } else {
      setForm({ ...form, affectedRegulatedAreas: [...form.affectedRegulatedAreas, area] });
    }
  };

  // Step 1 -> Step 2: Trigger Layer A Fact Extraction
  const handleProceedToFactExtraction = async () => {
    if (!form.systemName || !form.whatItDoes) {
      setError("Please provide at least a System Name and description of what it does.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/assess/extract-facts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Fact extraction failed");

      setExtractedFacts(data.facts);
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Failed to extract facts");
    } finally {
      setLoading(false);
    }
  };

  // Step 2 -> Step 3: Trigger Layer B & C Deterministic Rules Engine
  const handleExecuteDeterministicEvaluation = async () => {
    setError(null);
    setLoading(true);
    setStep(3);

    try {
      const res = await fetch("/api/assess/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemName: form.systemName,
          rawAnswers: form,
          facts: extractedFacts,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Evaluation failed");

      onComplete(data.assessment);
    } catch (err: any) {
      setError(err.message || "Failed to run rules engine");
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Wizard Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          <span className={step >= 1 ? "text-emerald-700 font-bold" : ""}>1. Structured Questionnaire</span>
          <span className={step >= 2 ? "text-emerald-700 font-bold" : ""}>2. Layer A: Fact Extraction</span>
          <span className={step >= 3 ? "text-emerald-700 font-bold" : ""}>3. Layer B/C: Deterministic Rules</span>
        </div>
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-emerald-600 h-full transition-all duration-300"
            style={{ width: step === 1 ? "33%" : step === 2 ? "66%" : "100%" }}
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-start space-x-3 text-rose-800 text-sm">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Assessment Error</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* STEP 1: STRUCTURED QUESTIONNAIRE */}
      {step === 1 && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-slate-200 gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Add AI System & Conduct Regulatory Assessment</h2>
              <p className="text-sm text-slate-500 mt-1">
                Provide technical parameters for multi-framework compliance evaluation against EU AI Act, Colorado SB 205, NYC LL 144, and NIST.
              </p>
            </div>

            {/* Quick Demo Template Loader */}
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-xs text-slate-500 font-medium">Quick Template:</span>
              <button
                type="button"
                id="btn-quick-random"
                onClick={handleRandomizeInputs}
                className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-1 rounded border border-emerald-300 transition-colors flex items-center space-x-1"
                title="Fill with randomized AI system"
              >
                <Dices className="w-3.5 h-3.5 text-emerald-600" />
                <span>🎲 Randomize</span>
              </button>
              <button
                type="button"
                onClick={() => applyPreset("hr")}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-2.5 py-1 rounded border border-slate-300 transition-colors"
              >
                HR Screener
              </button>
              <button
                type="button"
                onClick={() => applyPreset("credit")}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-2.5 py-1 rounded border border-slate-300 transition-colors"
              >
                Credit Scorer
              </button>
              <button
                type="button"
                onClick={() => applyPreset("genai")}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-2.5 py-1 rounded border border-slate-300 transition-colors"
              >
                GenAI Chatbot
              </button>
              <button
                type="button"
                onClick={() => applyPreset("healthcare")}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-2.5 py-1 rounded border border-slate-300 transition-colors"
              >
                Clinical Triage
              </button>
            </div>
          </div>

          {/* Interactive Demo Simulator Banner */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50/70 to-slate-50 border border-emerald-200 rounded-xl p-4 sm:p-5 mb-6 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="bg-emerald-600 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wider flex items-center space-x-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Demo Feature</span>
                  </span>
                  <span className="text-xs font-bold text-slate-800">Randomized AI System Simulator</span>
                </div>
                <p className="text-xs text-slate-600 max-w-xl">
                  One-click evaluation simulator across 16 diverse enterprise archetypes (Healthcare, Credit, HR, Biometrics, Robotics, Housing). Every click continuously generates a fresh randomized system profile.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  id="btn-randomize-form"
                  onClick={handleRandomizeInputs}
                  disabled={isAutoEvaluating}
                  className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 shadow-xs flex items-center space-x-1.5 transition-colors"
                  title="Populate questionnaire with another randomized AI system"
                >
                  <Dices className="w-4 h-4 text-emerald-600" />
                  <span>🎲 Randomize Form Inputs</span>
                </button>

                <button
                  type="button"
                  id="btn-random-demo-evaluate"
                  onClick={handleRandomDemoAndShowResult}
                  disabled={isAutoEvaluating}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm flex items-center space-x-1.5 transition-colors"
                  title="Randomize AI system and immediately show the full assessment result"
                >
                  {isAutoEvaluating ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Dices className="w-4 h-4 text-white" />
                  )}
                  <span>{isAutoEvaluating ? "Evaluating..." : "🎲 Randomize & Show Result"}</span>
                </button>
              </div>
            </div>

            {/* Currently Active Random Profile Indicator */}
            {lastRandomDemo && (
              <div className="mt-3 pt-3 border-t border-emerald-200/70 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-700 gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-bold text-emerald-800">Randomized #{randomizeCount}:</span>
                  <span className="font-bold text-slate-900">{lastRandomDemo.systemName}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-600 font-medium">{lastRandomDemo.industry}</span>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded uppercase">
                    {lastRandomDemo.expectedTier}
                  </span>
                  <button
                    type="button"
                    onClick={handleRandomizeInputs}
                    className="text-emerald-700 hover:text-emerald-800 font-semibold text-[11px] underline"
                  >
                    Next random system →
                  </button>
                </div>
              </div>
            )}

            {/* Auto-Evaluation Status Feedback */}
            {isAutoEvaluating && autoEvalStatus && (
              <div className="mt-3 p-3 bg-emerald-100/90 border border-emerald-300 rounded-lg flex items-center space-x-2.5 text-xs text-emerald-900 font-medium animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-700 shrink-0" />
                <span>{autoEvalStatus}</span>
              </div>
            )}
          </div>

          <form className="space-y-6">
            {/* System Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">
                AI System Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-system-name"
                type="text"
                placeholder="e.g. TalentScan Candidate Evaluator v3"
                value={form.systemName}
                onChange={(e) => setForm({ ...form, systemName: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
              />
            </div>

            {/* Q1: What does the AI system do? */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">
                1. What does the AI system do? <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="input-what-it-does"
                rows={3}
                placeholder="Describe key algorithms, inputs, inferences, and outputs..."
                value={form.whatItDoes}
                onChange={(e) => setForm({ ...form, whatItDoes: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
              />
            </div>

            {/* Q2: Intended purpose */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">
                2. Intended purpose <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-intended-purpose"
                type="text"
                placeholder="e.g. Pre-filter and score applicant CVs for interview invitations"
                value={form.intendedPurpose}
                onChange={(e) => setForm({ ...form, intendedPurpose: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
              />
            </div>

            {/* Q3: Industry & Q4: Deployment Locations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">
                  3. Industry
                </label>
                <input
                  id="input-industry"
                  type="text"
                  placeholder="e.g. Human Resources / Financial Services"
                  value={form.industry}
                  onChange={(e) => setForm({ ...form, industry: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">
                  4. Countries / States where deployed
                </label>
                <input
                  id="input-deployment-locations"
                  type="text"
                  placeholder="e.g. European Union (Germany, France), US (Colorado, New York City, California)"
                  value={form.deploymentLocations}
                  onChange={(e) => setForm({ ...form, deploymentLocations: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
                />
              </div>
            </div>

            {/* Q5: Who uses it? & Q6: Who is affected? */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">
                  5. Who uses it? (Deployers / Operators)
                </label>
                <input
                  id="input-who-uses-it"
                  type="text"
                  placeholder="e.g. Internal recruiters, hiring managers"
                  value={form.whoUsesIt}
                  onChange={(e) => setForm({ ...form, whoUsesIt: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">
                  6. Who is affected? (Subject Population)
                </label>
                <input
                  id="input-who-is-affected"
                  type="text"
                  placeholder="e.g. Job applicants, existing employees"
                  value={form.whoIsAffected}
                  onChange={(e) => setForm({ ...form, whoIsAffected: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
                />
              </div>
            </div>

            {/* Boolean questions: Decisions about people, Personal data, Sensitive data */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    7. Does it make or influence decisions about people?
                  </p>
                  <p className="text-xs text-slate-500">Decisions affecting legal, economic, or material rights.</p>
                </div>
                <input
                  type="checkbox"
                  id="check-makes-decisions"
                  checked={form.makesDecisionsAboutPeople}
                  onChange={(e) => setForm({ ...form, makesDecisionsAboutPeople: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
              </div>

              <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    8. Does it process personal data?
                  </p>
                  <p className="text-xs text-slate-500">Names, identifiers, emails, resumes, behavioral telemetry.</p>
                </div>
                <input
                  type="checkbox"
                  id="check-personal-data"
                  checked={form.processesPersonalData}
                  onChange={(e) => setForm({ ...form, processesPersonalData: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
              </div>

              <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    9. Does it process sensitive data?
                  </p>
                  <p className="text-xs text-slate-500">Biometrics, health, trade union, racial/ethnic or political traits.</p>
                </div>
                <input
                  type="checkbox"
                  id="check-sensitive-data"
                  checked={form.processesSensitiveData}
                  onChange={(e) => setForm({ ...form, processesSensitiveData: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Q10: Affected Regulated Areas */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                10. Does it affect employment, education, healthcare, finance, law enforcement, or other regulated areas?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {[
                  { id: "employment", label: "Employment & Hiring" },
                  { id: "education", label: "Education & Admissions" },
                  { id: "healthcare", label: "Healthcare & Triage" },
                  { id: "finance", label: "Finance & Credit Scoring" },
                  { id: "housing", label: "Housing & Tenancy" },
                  { id: "law_enforcement", label: "Law Enforcement & Border" },
                  { id: "justice", label: "Justice & Legal Services" },
                  { id: "critical_infrastructure", label: "Critical Infrastructure" },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => handleRegulatedAreaToggle(item.id)}
                    className={`p-2.5 rounded-lg border text-left font-medium transition-all ${
                      form.affectedRegulatedAreas.includes(item.id)
                        ? "bg-emerald-50 border-emerald-500 text-emerald-800 font-semibold"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Q11: Human Oversight & Q12: Model Provider & Q13: Decisions Automated */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">
                  11. Degree of human oversight
                </label>
                <select
                  id="select-human-oversight"
                  value={form.humanOversightDegree}
                  onChange={(e) => setForm({ ...form, humanOversightDegree: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                >
                  <option value="in-the-loop">Human-in-the-loop (Human must approve every decision)</option>
                  <option value="on-the-loop">Human-on-the-loop (Automated with real-time veto ability)</option>
                  <option value="over-the-loop">Human-over-the-loop (Periodic aggregate audit)</option>
                  <option value="none/fully_autonomous">Fully Autonomous (No human intervention)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">
                  12. Model / Provider
                </label>
                <input
                  id="input-model-provider"
                  type="text"
                  placeholder="e.g. OpenAI GPT-4o, Google Gemini, Custom XGBoost"
                  value={form.modelProvider}
                  onChange={(e) => setForm({ ...form, modelProvider: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  13. Whether decisions are automated (vs purely advisory recommendations)
                </p>
                <p className="text-xs text-slate-500">Does the AI directly execute actions or recommend outcomes?</p>
              </div>
              <input
                type="checkbox"
                id="check-decisions-automated"
                checked={form.decisionsAutomated}
                onChange={(e) => setForm({ ...form, decisionsAutomated: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
            </div>

            {/* Submit Action */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                id="btn-proceed-fact-extraction"
                disabled={loading}
                onClick={handleProceedToFactExtraction}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center space-x-2 shadow transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Extracting Facts...</span>
                  </>
                ) : (
                  <>
                    <span>Extract Structured Facts (Layer A)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STEP 2: LAYER A FACT EXTRACTION REVIEW */}
      {step === 2 && extractedFacts && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-start justify-between pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center space-x-2">
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded">
                  Layer A: AI-Assisted Fact Extraction
                </span>
                <span className="text-xs text-slate-500 font-mono">Status: Verified Technical Facts</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-2">Inspect Normalized JSON Facts</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                In strict compliance with architectural constraints, the LLM extracted technical parameters only. Legal conclusions are strictly deferred to the deterministic rules engine in Layer B & C.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">System Profile</h4>
              <p className="text-xs text-slate-700"><strong>Name:</strong> {extractedFacts.system_profile?.name}</p>
              <p className="text-xs text-slate-700"><strong>Purpose:</strong> {extractedFacts.system_profile?.intendedPurpose}</p>
              <p className="text-xs text-slate-700"><strong>Generative AI:</strong> {extractedFacts.system_profile?.isGenerativeAI ? "Yes" : "No"}</p>
              <p className="text-xs text-slate-700"><strong>Direct Human Interaction:</strong> {extractedFacts.system_profile?.interactsWithHumansDirectly ? "Yes" : "No"}</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Jurisdiction & Scope</h4>
              <p className="text-xs text-slate-700"><strong>EU Deployment:</strong> {extractedFacts.geographic_scope?.isEUDeployed ? "Yes" : "No"}</p>
              <p className="text-xs text-slate-700"><strong>US Jurisdictions:</strong> {extractedFacts.geographic_scope?.deployedUSStates?.join(", ") || "None"}</p>
              <p className="text-xs text-slate-700"><strong>Federal Contract Scope:</strong> {extractedFacts.geographic_scope?.isFederalGovContract ? "Yes" : "No"}</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Decision Consequentiality</h4>
              <p className="text-xs text-slate-700"><strong>Consequential Decision:</strong> {extractedFacts.decision_impact?.isConsequentialDecision ? "Yes" : "No"}</p>
              <p className="text-xs text-slate-700"><strong>Decision Automation:</strong> {extractedFacts.decision_impact?.automatedDecisionLevel}</p>
              <p className="text-xs text-slate-700"><strong>Regulated Sectors:</strong> {extractedFacts.regulated_sectors?.join(", ") || "None"}</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Data & Human Oversight</h4>
              <p className="text-xs text-slate-700"><strong>Personal Data:</strong> {extractedFacts.data_processing?.processesPersonalData ? "Yes" : "No"}</p>
              <p className="text-xs text-slate-700"><strong>Biometrics / Sensitive Data:</strong> {extractedFacts.data_processing?.processesBiometrics || extractedFacts.data_processing?.processesSpecialCategoryData ? "Yes" : "No"}</p>
              <p className="text-xs text-slate-700"><strong>Oversight Level:</strong> {extractedFacts.oversight_profile?.oversightLevel}</p>
            </div>
          </div>

          {/* Raw JSON Facts Inspector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Structured JSON Facts Snapshot</label>
              <span className="text-[11px] text-slate-400 font-mono">Layer A Canonical Schema</span>
            </div>
            <pre className="p-4 bg-slate-900 text-emerald-400 rounded-lg text-xs font-mono overflow-x-auto max-h-60 border border-slate-800">
              {JSON.stringify(extractedFacts, null, 2)}
            </pre>
          </div>

          {/* Step 2 Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center space-x-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Questionnaire</span>
            </button>

            <button
              type="button"
              id="btn-execute-rules-engine"
              disabled={loading}
              onClick={handleExecuteDeterministicEvaluation}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center space-x-2 shadow transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Evaluating Rules...</span>
                </>
              ) : (
                <>
                  <span>Execute Deterministic Rules Engine (Layer B & C)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: EVALUATING DETERMINISTIC RULES */}
      {step === 3 && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-12 text-center space-y-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Executing Deterministic Rules Engine</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Evaluating 13 statutory rule predicates against EU AI Act (Regulation 2024/1689), Colorado SB 205, NYC Local Law 144, and NIST AI RMF...
          </p>
          <div className="text-xs font-mono text-slate-400 bg-slate-50 py-2 px-4 rounded-md inline-block">
            Generating cryptographic audit hash and compliance report...
          </div>
        </div>
      )}
    </div>
  );
};
