import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { AISystemsFleetView } from "./components/AISystemsFleetView";
import { AssessmentWizard } from "./components/AssessmentWizard";
import { AssessmentResultsView } from "./components/AssessmentResultsView";
import { ContinuousMonitorView } from "./components/ContinuousMonitorView";
import { AuditLogView } from "./components/AuditLogView";
import { RulesCatalogView } from "./components/RulesCatalogView";
import { ApiDocsView } from "./components/ApiDocsView";
import { ReportModal } from "./components/ReportModal";
import { AuthOrgModal } from "./components/AuthOrgModal";
import { User, Organization, AISystem, Assessment } from "./types";
import { generateRandomAISystemDemo } from "./utils/demoGenerator";
import { Loader2 } from "lucide-react";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [activeTab, setActiveTab] = useState<string>("systems");
  const [systems, setSystems] = useState<AISystem[]>([]);
  const [currentAssessment, setCurrentAssessment] = useState<Assessment | null>(null);
  const [selectedSystem, setSelectedSystem] = useState<AISystem | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [conflictCount, setConflictCount] = useState<number>(0);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);

  // Initial Data Bootstrap
  const loadInitialData = async () => {
    try {
      // 1. Fetch current auth & organization
      const authRes = await fetch("/api/auth/me");
      const authData = await authRes.json();
      setUser(authData.user);
      setOrganization(authData.organization);

      // 2. Fetch systems
      const sysRes = await fetch("/api/systems", {
        headers: {
          "x-organization-id": authData.organization?.id || "org-acme-corp",
          "x-user-email": authData.user?.email || "compliance.lead@acmeglobal.com",
        },
      });
      const sysData = await sysRes.json();
      const loadedSystems: AISystem[] = sysData.systems || [];
      setSystems(loadedSystems);

      // If systems exist, load the latest assessment of the first system
      if (loadedSystems.length > 0 && loadedSystems[0].latestAssessmentId) {
        const sysDetailRes = await fetch(`/api/systems/${loadedSystems[0].id}`);
        const sysDetailData = await sysDetailRes.json();
        if (sysDetailData.latestAssessment) {
          setCurrentAssessment(sysDetailData.latestAssessment);
          setSelectedSystem(loadedSystems[0]);
        }
      }

      // 3. Check continuous conflict monitor
      const conflictsRes = await fetch("/api/regulatory/conflicts", {
        headers: { "x-organization-id": authData.organization?.id || "org-acme-corp" },
      });
      const conflictsData = await conflictsRes.json();
      setConflictCount(conflictsData.conflictsFoundCount || 0);
    } catch (err) {
      console.error("Failed to load initial data:", err);
    } finally {
      setLoadingInitial(false);
    }
  };

  useEffect(() => {
    loadInitialData();

    // Constant background check for regulatory updates and compliance conflicts (every 60s)
    const interval = setInterval(async () => {
      try {
        const conflictsRes = await fetch("/api/regulatory/conflicts");
        const conflictsData = await conflictsRes.json();
        setConflictCount(conflictsData.conflictsFoundCount || 0);
      } catch (e) {
        // silent background check
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Handler when an assessment is completed via the Wizard
  const handleAssessmentComplete = (assessment: Assessment) => {
    setCurrentAssessment(assessment);
    // Refresh systems list
    fetch("/api/systems")
      .then((res) => res.json())
      .then((data) => {
        setSystems(data.systems || []);
        const sys = data.systems?.find((s: AISystem) => s.id === assessment.systemId);
        if (sys) setSelectedSystem(sys);
      });
    setActiveTab("assessment_results");
  };

  // Handler when selecting a system to view
  const handleSelectSystem = async (sys: AISystem) => {
    setSelectedSystem(sys);
    if (sys.latestAssessmentId) {
      try {
        const res = await fetch(`/api/systems/${sys.id}`);
        const data = await res.json();
        if (data.latestAssessment) {
          setCurrentAssessment(data.latestAssessment);
          setActiveTab("assessment_results");
          return;
        }
      } catch (err) {
        console.error("Failed to load system assessment:", err);
      }
    }
    setActiveTab("assessment_results");
  };

  // Handler to re-evaluate a system
  const handleReevaluateSystem = async (systemId: string) => {
    try {
      const res = await fetch(`/api/systems/${systemId}/re-evaluate`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.assessment) {
        setCurrentAssessment(data.assessment);
        // Refresh systems
        const sysRes = await fetch("/api/systems");
        const sysData = await sysRes.json();
        setSystems(sysData.systems || []);
        const sys = sysData.systems?.find((s: AISystem) => s.id === systemId);
        if (sys) setSelectedSystem(sys);
        setActiveTab("assessment_results");
      }
    } catch (err) {
      console.error("Re-evaluation failed:", err);
    }
  };

  const [isDemoRunning, setIsDemoRunning] = useState<boolean>(false);
  const [demoBannerMessage, setDemoBannerMessage] = useState<string>("");

  // Handler for global Random Demo trigger (from Header or Fleet view)
  const handleTriggerRandomDemo = async () => {
    setIsDemoRunning(true);
    try {
      const randomDemo = generateRandomAISystemDemo();
      setDemoBannerMessage(`🎲 Randomizing: ${randomDemo.systemName}...`);

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

      // 1. Fact extraction
      const factRes = await fetch("/api/assess/extract-facts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(populatedForm),
      });
      const factData = await factRes.json();
      if (!factRes.ok) throw new Error(factData.error || "Fact extraction failed");

      // 2. Deterministic evaluation
      setDemoBannerMessage(`Executing rules engine for ${randomDemo.systemName}...`);
      const evalRes = await fetch("/api/assess/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemName: populatedForm.systemName,
          rawAnswers: populatedForm,
          facts: factData.facts,
        }),
      });
      const evalData = await evalRes.json();
      if (!evalRes.ok) throw new Error(evalData.error || "Deterministic evaluation failed");

      // 3. Update active assessment & system
      setCurrentAssessment(evalData.assessment);
      const sysRes = await fetch("/api/systems");
      const sysData = await sysRes.json();
      setSystems(sysData.systems || []);
      const createdSys = sysData.systems?.find((s: AISystem) => s.id === evalData.assessment.systemId);
      if (createdSys) setSelectedSystem(createdSys);

      // 4. Navigate directly to results view
      setActiveTab("assessment_results");
    } catch (err) {
      console.error("Random demo trigger failed:", err);
    } finally {
      setIsDemoRunning(false);
      setDemoBannerMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        user={user}
        organization={organization}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddSystem={() => setActiveTab("add_system")}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onTriggerRandomDemo={handleTriggerRandomDemo}
        conflictCount={conflictCount}
      />

      {/* Demo Running Notification */}
      {isDemoRunning && (
        <div className="bg-emerald-600 text-white text-xs font-semibold px-4 py-2 flex items-center justify-center space-x-2 shadow-sm animate-pulse sticky top-16 z-30">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
          <span>{demoBannerMessage || "Generating randomized AI system and running multi-framework compliance evaluation..."}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {loadingInitial ? (
          <div className="max-w-7xl mx-auto py-24 text-center">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-semibold text-slate-700">Connecting to Concord AI Enterprise Engine...</p>
            <p className="text-xs text-slate-400 mt-1">Loading versioned statutory rulebook & system inventory</p>
          </div>
        ) : (
          <>
            {/* VIEW 1: SYSTEMS FLEET INVENTORY */}
            {activeTab === "systems" && (
              <AISystemsFleetView
                systems={systems}
                onAddSystem={() => setActiveTab("add_system")}
                onSelectSystem={handleSelectSystem}
                onReevaluateSystem={handleReevaluateSystem}
                onTriggerRandomDemo={handleTriggerRandomDemo}
              />
            )}

            {/* VIEW 2: ADD AI SYSTEM & QUESTIONNAIRE WIZARD */}
            {activeTab === "add_system" && (
              <AssessmentWizard
                onComplete={handleAssessmentComplete}
                onCancel={() => setActiveTab("systems")}
              />
            )}

            {/* VIEW 3: COMPREHENSIVE ASSESSMENT RESULTS & COMPLIANCE HUB */}
            {activeTab === "assessment_results" && currentAssessment && (
              <AssessmentResultsView
                assessment={currentAssessment}
                system={selectedSystem || undefined}
                onOpenReportModal={() => setIsReportModalOpen(true)}
                onReevaluate={() => handleReevaluateSystem(currentAssessment.systemId)}
                onViewAuditLog={() => setActiveTab("audit")}
              />
            )}

            {/* If no current assessment selected */}
            {activeTab === "assessment_results" && !currentAssessment && (
              <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
                <p className="text-slate-500 text-sm">No assessment currently selected.</p>
                <button
                  onClick={() => setActiveTab("add_system")}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-lg"
                >
                  Conduct Assessment Now
                </button>
              </div>
            )}

            {/* VIEW 4: CONTINUOUS CONFLICT MONITOR & STATUTORY FEED */}
            {activeTab === "monitor" && (
              <ContinuousMonitorView
                onSelectSystem={(systemId) => {
                  const sys = systems.find((s) => s.id === systemId);
                  if (sys) handleSelectSystem(sys);
                }}
              />
            )}

            {/* VIEW 5: IMMUTABLE AUDIT LOGS */}
            {activeTab === "audit" && <AuditLogView />}

            {/* VIEW 6: STRUCTURED RULES DATABASE */}
            {activeTab === "rules" && <RulesCatalogView />}

            {/* VIEW 7: ENTERPRISE API & DOCS */}
            {activeTab === "api" && <ApiDocsView apiKey={organization?.apiKey} />}
          </>
        )}
      </main>

      {/* Compliance Report Generation Modal */}
      {currentAssessment && (
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          assessment={currentAssessment}
          system={selectedSystem || undefined}
          organization={organization}
        />
      )}

      {/* Account & Organization Switcher Modal */}
      <AuthOrgModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={user}
        currentOrg={organization}
        onUserOrOrgChanged={(newUser, newOrg) => {
          setUser(newUser);
          setOrganization(newOrg);
          // Reload systems for new org
          fetch("/api/systems", {
            headers: {
              "x-organization-id": newOrg.id,
              "x-user-email": newUser.email,
            },
          })
            .then((r) => r.json())
            .then((d) => setSystems(d.systems || []));
        }}
      />
    </div>
  );
}
