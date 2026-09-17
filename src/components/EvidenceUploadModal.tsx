import React, { useState, useRef } from "react";
import { X, UploadCloud, FileText, CheckCircle2, Shield, AlertCircle, Trash2, FileCheck } from "lucide-react";

export interface EvidenceItem {
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
}

interface EvidenceUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  evidenceItem: EvidenceItem | null;
  itemIndex: number;
  onUploadSuccess: (index: number, artifact: {
    fileName: string;
    fileSize: string;
    uploadedAt: string;
    notes: string;
    referenceId: string;
  }) => void;
}

export const EvidenceUploadModal: React.FC<EvidenceUploadModalProps> = ({
  isOpen,
  onClose,
  evidenceItem,
  itemIndex,
  onUploadSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [docTitle, setDocTitle] = useState("");
  const [referenceId, setReferenceId] = useState("");
  const [auditorNotes, setAuditorNotes] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !evidenceItem) return null;

  const handleFileSelection = (selectedFile: File) => {
    setFile(selectedFile);
    if (!docTitle) {
      setDocTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
    }
    if (!referenceId) {
      const prefix = evidenceItem.framework.slice(0, 3).toUpperCase();
      const randNum = Math.floor(1000 + Math.random() * 9000);
      setReferenceId(`EVD-${prefix}-${randNum}`);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file && !evidenceItem.evidenceArtifact) {
      alert("Please choose a file or document to upload.");
      return;
    }

    setIsSubmitting(true);

    const fileName = file ? file.name : (evidenceItem.evidenceArtifact?.fileName || "Verification_Dossier.pdf");
    const fileSize = file ? formatFileSize(file.size) : (evidenceItem.evidenceArtifact?.fileSize || "1.4 MB");
    const generatedRef = referenceId || `EVD-${Math.floor(1000 + Math.random() * 9000)}`;

    const artifact = {
      fileName,
      fileSize,
      uploadedAt: new Date().toISOString(),
      notes: auditorNotes || `Attached for ${evidenceItem.framework} compliance audit verification.`,
      referenceId: generatedRef,
    };

    // Simulated short async upload delay for realistic UX
    setTimeout(() => {
      onUploadSuccess(itemIndex, artifact);
      setIsSubmitting(false);
      setUploadSuccess(true);
      setTimeout(() => {
        setUploadSuccess(false);
        setFile(null);
        setDocTitle("");
        setReferenceId("");
        setAuditorNotes("");
        onClose();
      }, 1000);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  evidenceItem.criticality === "Critical"
                    ? "bg-red-100 text-red-800"
                    : evidenceItem.criticality === "High"
                    ? "bg-rose-100 text-rose-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {evidenceItem.criticality} Priority
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {evidenceItem.framework.replace(/_/g, " ")}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1">Upload Compliance Evidence</h2>
            <p className="text-xs text-slate-600 mt-0.5 max-w-md">
              Attach technical audit documentation, impact assessments, or policy records to close this gap.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {uploadSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Artifact Attached Successfully!</h3>
            <p className="text-xs text-slate-500">
              Evidence has been cryptographically cataloged in the assessment compliance repository.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Target Item Display */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Required Evidence Item
              </span>
              <p className="text-sm font-semibold text-slate-900 mt-0.5">{evidenceItem.item}</p>
            </div>

            {/* Drag & Drop File Picker */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Evidence Document / Archive
              </label>

              {!file ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                    isDragging
                      ? "border-emerald-500 bg-emerald-50/50"
                      : "border-slate-300 hover:border-emerald-500 hover:bg-slate-50"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileSelection(e.target.files[0]);
                      }
                    }}
                    accept=".pdf,.docx,.doc,.txt,.json,.csv,.xlsx,.png,.jpg,.jpeg"
                  />
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-slate-800">
                    Click to browse or drag and drop file here
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Supports PDF, DOCX, TXT, JSON, CSV or Audit Screenshots (Max 25MB)
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="flex items-center space-x-3 truncate">
                    <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-900 truncate">{file.name}</p>
                      <p className="text-[11px] text-slate-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                    title="Remove file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Reference ID & Document Title */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Artifact Title
                </label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="e.g., Bias Audit Report 2026"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Vault Reference / ID
                </label>
                <input
                  type="text"
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                  placeholder="e.g., EVD-FRIA-8842"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>
            </div>

            {/* Auditor Notes */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Auditor Notes / Methodology
              </label>
              <textarea
                value={auditorNotes}
                onChange={(e) => setAuditorNotes(e.target.value)}
                placeholder="Include statutory scope, auditor signatories, or relevant Annex clauses..."
                rows={2}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end space-x-2.5 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || (!file && !evidenceItem.evidenceArtifact)}
                className={`px-4 py-2 text-xs font-semibold rounded-lg text-white shadow-sm flex items-center space-x-1.5 transition-colors ${
                  isSubmitting || (!file && !evidenceItem.evidenceArtifact)
                    ? "bg-slate-400 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-500"
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>{isSubmitting ? "Cataloging Artifact..." : "Attach Evidence"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
