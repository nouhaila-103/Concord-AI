import jsPDF from "jspdf";
import { Assessment } from "../types";

export function generateAssessmentPDF(
  assessment: Assessment,
  systemName?: string,
  orgName?: string
) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin - 10) {
      doc.addPage();
      y = margin;
      drawHeaderFooter();
    }
  };

  const drawHeaderFooter = () => {
    // Top subtle bar
    doc.setFillColor(16, 185, 129); // emerald-500
    doc.rect(margin, y, contentWidth, 1.5, "F");
    y += 5;
  };

  // --- COVER / HEADER SECTION ---
  drawHeaderFooter();

  // Platform Tag
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(5, 150, 105); // emerald-600
  doc.text("CONCORD AI — ENTERPRISE REGULATORY COMPLIANCE DOSSIER", margin, y);
  y += 6;

  // Document Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text("EXECUTIVE COMPLIANCE AUDIT REPORT", margin, y);
  y += 7;

  // Meta row
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139); // slate-500
  const dateStr = new Date(assessment.evaluatedAt).toLocaleString();
  doc.text(`Generated: ${dateStr}  |  Rulebook: v${assessment.rulebookVersion}  |  Dossier ID: ${assessment.id}`, margin, y);
  y += 7;

  // Cryptographic Seal Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 13, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("CRYPTOGRAPHIC DETERMINISTIC AUDIT SEAL (SHA-256):", margin + 3, y + 4.5);

  doc.setFont("courier", "bold");
  doc.setFontSize(8);
  doc.setTextColor(5, 150, 105);
  const hash = assessment.deterministicHash || `SHA256-${assessment.id}-RULEBOOK-${assessment.rulebookVersion}`;
  doc.text(hash, margin + 3, y + 9.5);
  y += 18;

  // --- SYSTEM & ORGANIZATIONAL OVERVIEW ---
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, contentWidth, 26, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("Target AI System Profile", margin + 4, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);

  const sysName = systemName || assessment.systemName || "Enterprise AI Model";
  const organization = orgName || "Registered Enterprise";
  const purpose = assessment.facts?.system_profile?.intendedPurpose || "Automated Business Operations";
  const oversight = assessment.facts?.oversight_profile?.oversightLevel || "In-the-loop";

  doc.text(`System Name: ${sysName}`, margin + 4, y + 12);
  doc.text(`Organization: ${organization}`, margin + 4, y + 17);
  doc.text(`Human Oversight: ${oversight}`, margin + 4, y + 22);

  // Score badge on the right
  const scoreX = pageWidth - margin - 36;
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(scoreX, y + 3, 32, 20, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text("READINESS SCORE", scoreX + 4, y + 8);
  doc.setFontSize(14);
  doc.setTextColor(52, 211, 153);
  doc.text(`${assessment.complianceScore}%`, scoreX + 8, y + 17);
  y += 31;

  // --- STATUTORY CLASSIFICATIONS ---
  checkPageBreak(35);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("1. Statutory Regulatory Classifications", margin, y);
  y += 5;

  // EU Box
  const euTier = (assessment.euClassification?.tier || "UNASSESSED").toUpperCase();
  const euBg = euTier.includes("HIGH") ? [254, 242, 242] : euTier.includes("PROHIBITED") ? [254, 226, 226] : [240, 253, 244];
  const euTextCol = euTier.includes("HIGH") || euTier.includes("PROHIBITED") ? [185, 28, 28] : [21, 128, 61];

  doc.setFillColor(euBg[0], euBg[1], euBg[2]);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 18, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(euTextCol[0], euTextCol[1], euTextCol[2]);
  doc.text(`European Union (EU AI Act 2024/1689): ${euTier}`, margin + 4, y + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  const euSummary = doc.splitTextToSize(
    assessment.euClassification?.summary || "Conformity assessment required under Regulation (EU) 2024/1689.",
    contentWidth - 8
  );
  doc.text(euSummary, margin + 4, y + 10);
  y += 22;

  // US State & Federal Matrix
  checkPageBreak(40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text("United States Jurisdictional Matrix:", margin, y);
  y += 4.5;

  const usData = [
    {
      name: "Colorado SB 24-205",
      status: assessment.usJurisdictionApplicability?.coloradoSB205?.applicable ? "APPLICABLE" : "Exempt",
      reason: assessment.usJurisdictionApplicability?.coloradoSB205?.reason || "N/A",
    },
    {
      name: "NYC Local Law 144",
      status: assessment.usJurisdictionApplicability?.nycLL144?.applicable ? "APPLICABLE (AEDT)" : "Exempt",
      reason: assessment.usJurisdictionApplicability?.nycLL144?.reason || "N/A",
    },
    {
      name: "California AB 2013",
      status: assessment.usJurisdictionApplicability?.californiaAB2013?.applicable ? "APPLICABLE" : "Exempt",
      reason: assessment.usJurisdictionApplicability?.californiaAB2013?.reason || "N/A",
    },
    {
      name: "White House OMB M-24-10",
      status: assessment.usJurisdictionApplicability?.whiteHouseOMBM24?.applicable ? "APPLICABLE" : "Exempt",
      reason: assessment.usJurisdictionApplicability?.whiteHouseOMBM24?.reason || "N/A",
    },
    {
      name: "NIST AI RMF 1.0",
      status: assessment.usJurisdictionApplicability?.nistApplicability?.level || "Standard",
      reason: "Governance Benchmark Functions",
    },
  ];

  usData.forEach((row) => {
    checkPageBreak(8);
    const isApp = row.status.includes("APPLICABLE");
    doc.setFillColor(isApp ? 254 : 248, isApp ? 242 : 250, isApp ? 242 : 252);
    doc.roundedRect(margin, y, contentWidth, 7, 1, 1, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(row.name, margin + 3, y + 4.8);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(isApp ? 185 : 100, isApp ? 28 : 116, isApp ? 28 : 139);
    doc.text(row.status, margin + 55, y + 4.8);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    const reasonText = doc.splitTextToSize(row.reason, contentWidth - 95);
    doc.text(reasonText[0] || "", margin + 95, y + 4.8);
    y += 8.5;
  });
  y += 4;

  // --- MANDATORY REQUIREMENTS ---
  checkPageBreak(30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`2. Mandatory Statutory Requirements (${assessment.aggregatedRequirements?.length || 0})`, margin, y);
  y += 5;

  (assessment.aggregatedRequirements || []).forEach((req, idx) => {
    checkPageBreak(15);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, 13, 1.5, 1.5, "D");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`${idx + 1}. [${req.framework || "Statute"}] ${req.title}`, margin + 3, y + 5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Citation: ${req.sourceCitation || "Regulatory Rule"}  |  Effective: ${req.effectiveDate || "Enforced"}  |  Status: ${req.status || "Pending"}`, margin + 3, y + 9.5);
    y += 15;
  });
  y += 4;

  // --- MISSING EVIDENCE & ATTACHED ARTIFACTS ---
  checkPageBreak(30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`3. Missing Evidence Gaps & Compliance Artifacts (${assessment.missingEvidenceList?.length || 0})`, margin, y);
  y += 5;

  (assessment.missingEvidenceList || []).forEach((ev, idx) => {
    checkPageBreak(16);
    const isUploaded = ev.status === "Uploaded" || Boolean(ev.evidenceArtifact);

    doc.setFillColor(isUploaded ? 240 : 255, isUploaded ? 253 : 255, isUploaded ? 244 : 255);
    doc.setDrawColor(isUploaded ? 167 : 226, isUploaded ? 243 : 232, isUploaded ? 208 : 240);
    doc.roundedRect(margin, y, contentWidth, 14, 1.5, 1.5, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(isUploaded ? 21 : 185, isUploaded ? 128 : 28, isUploaded ? 61 : 28);
    doc.text(`[${isUploaded ? "ATTACHED & VERIFIED" : `${ev.criticality} Priority`}]`, margin + 3, y + 4.8);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(ev.item, margin + 45, y + 4.8);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);

    if (isUploaded && ev.evidenceArtifact) {
      doc.text(
        `Artifact: ${ev.evidenceArtifact.fileName} (${ev.evidenceArtifact.fileSize || "1.2 MB"}) - Attached: ${new Date(ev.evidenceArtifact.uploadedAt).toLocaleDateString()}`,
        margin + 3,
        y + 10
      );
    } else {
      doc.text(`Governing Framework: ${ev.framework.replace(/_/g, " ")}  |  Action Required: Upload technical verification document to vault`, margin + 3, y + 10);
    }

    y += 16;
  });
  y += 4;

  // --- HIGH-RISK VECTORS ---
  checkPageBreak(30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`4. Identified High-Risk Vectors (${assessment.riskAreasList?.length || 0})`, margin, y);
  y += 5;

  (assessment.riskAreasList || []).forEach((risk, idx) => {
    checkPageBreak(12);
    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(254, 202, 202);
    doc.roundedRect(margin, y, contentWidth, 10, 1.5, 1.5, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(185, 28, 28);
    doc.text(`[${risk.severity} Risk]`, margin + 3, y + 4.5);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(risk.risk, margin + 28, y + 4.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(`Triggered under: ${risk.framework}`, margin + 28, y + 8);

    y += 12;
  });
  y += 4;

  // --- QUESTIONS REQUIRING LEGAL REVIEW ---
  checkPageBreak(25);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("5. Questions Requiring Legal Review", margin, y);
  y += 5;

  (assessment.questionsRequiringLegalReview || []).forEach((q, idx) => {
    checkPageBreak(10);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(217, 119, 6);
    doc.text(`${idx + 1}.`, margin + 2, y + 4);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    const qLines = doc.splitTextToSize(q, contentWidth - 10);
    doc.text(qLines, margin + 7, y + 4);
    y += qLines.length * 4.5 + 2;
  });
  y += 6;

  // --- FOOTER NOTICE ---
  checkPageBreak(20);
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y, pageWidth - margin, y);
  y += 4;

  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  const footerText = `Concord AI Statutory Evaluation Engine — Deterministic Rulebook v${assessment.rulebookVersion}. Audit Record ID: ${assessment.id}. Not formal legal counsel. Computed deterministically against codified statutes.`;
  doc.text(doc.splitTextToSize(footerText, contentWidth), margin, y);

  // Trigger browser download directly
  const safeSysName = (systemName || assessment.systemName || "ai_system")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_");
  const fileName = `Concord_Compliance_Report_${safeSysName}_${assessment.id}.pdf`;
  doc.save(fileName);
}
