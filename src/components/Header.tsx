import React from "react";
import { User, Organization } from "../types";
import { ShieldCheck, Bell, Plus, Building2, UserCircle2, Code2, BookOpen, Layers, CheckCircle2, Dices } from "lucide-react";

interface HeaderProps {
  user: User | null;
  organization: Organization | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAddSystem: () => void;
  onOpenAuthModal: () => void;
  onTriggerRandomDemo?: () => void;
  conflictCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  organization,
  activeTab,
  setActiveTab,
  onOpenAddSystem,
  onOpenAuthModal,
  onTriggerRandomDemo,
  conflictCount,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab("systems")}>
            <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold shadow-md">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-white">Concord AI</span>
                <span className="text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Enterprise SaaS
                </span>
              </div>
              <p className="text-xs text-slate-400">Deterministic Multi-Framework AI Governance</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              id="nav-btn-systems"
              onClick={() => setActiveTab("systems")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === "systems"
                  ? "bg-slate-800 text-white border border-slate-700"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              AI Systems Fleet
            </button>

            <button
              id="nav-btn-monitor"
              onClick={() => setActiveTab("monitor")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === "monitor"
                  ? "bg-slate-800 text-white border border-slate-700"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <span>Regulatory Monitor</span>
              {conflictCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full animate-pulse">
                  {conflictCount}
                </span>
              )}
            </button>

            <button
              id="nav-btn-audit"
              onClick={() => setActiveTab("audit")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === "audit"
                  ? "bg-slate-800 text-white border border-slate-700"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              Audit Logs
            </button>

            <button
              id="nav-btn-rules"
              onClick={() => setActiveTab("rules")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === "rules"
                  ? "bg-slate-800 text-white border border-slate-700"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              Rules Database
            </button>

            <button
              id="nav-btn-api"
              onClick={() => setActiveTab("api")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === "api"
                  ? "bg-slate-800 text-white border border-slate-700"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              API & Docs
            </button>
          </nav>

          {/* Action CTAs & Organization Profile */}
          <div className="flex items-center space-x-2.5">
            {onTriggerRandomDemo && (
              <button
                id="btn-header-random-demo"
                onClick={onTriggerRandomDemo}
                className="bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/60 text-xs font-semibold px-2.5 sm:px-3 py-2 rounded-md shadow-xs flex items-center space-x-1.5 transition-all"
                title="Generate a randomized AI system and immediately show the regulatory compliance results"
              >
                <Dices className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">🎲 Random Demo</span>
                <span className="sm:hidden">🎲 Demo</span>
              </button>
            )}

            <button
              id="btn-add-ai-system"
              onClick={onOpenAddSystem}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-2 rounded-md shadow flex items-center space-x-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add AI System</span>
            </button>

            <div
              id="user-org-badge"
              onClick={onOpenAuthModal}
              className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 px-3 py-1.5 rounded-md cursor-pointer transition-colors"
              title="Click to switch organization or user account"
            >
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <div className="text-left leading-none">
                <p className="text-xs font-medium text-slate-200 truncate max-w-[120px]">
                  {organization?.name || "Organization"}
                </p>
                <p className="text-[10px] text-slate-400 truncate max-w-[120px]">
                  {user?.email || "Account"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
