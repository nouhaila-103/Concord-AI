import React, { useState } from "react";
import { User, Organization } from "../types";
import { ShieldCheck, Plus, Building2, Dices, Menu, X } from "lucide-react";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Platform Title - Responsive & Fixed against flex compression */}
          <div
            id="brand-header-logo"
            className="flex items-center space-x-3 cursor-pointer shrink-0 select-none py-1"
            onClick={() => {
              setActiveTab("systems");
              setIsMobileMenuOpen(false);
            }}
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold shadow-md shrink-0 ring-1 ring-emerald-500/40">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0 flex flex-col justify-center">
              <div className="flex items-center space-x-2">
                <span className="text-lg sm:text-xl font-bold tracking-tight text-white whitespace-nowrap leading-tight">
                  Concord AI
                </span>
                <span className="text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap hidden sm:inline-flex items-center">
                  Enterprise SaaS
                </span>
              </div>
              <p className="text-xs text-slate-400 whitespace-nowrap tracking-normal leading-normal hidden md:block mt-0.5">
                Deterministic Multi-Framework AI Governance
              </p>
              <p className="text-[11px] text-slate-400 whitespace-nowrap tracking-normal leading-normal md:hidden mt-0.5">
                Deterministic AI Governance
              </p>
            </div>
          </div>

          {/* Navigation Links (Desktop / Full Screen) */}
          <nav className="hidden lg:flex items-center space-x-0.5 xl:space-x-1 shrink-0">
            <button
              id="nav-btn-systems"
              onClick={() => setActiveTab("systems")}
              className={`px-2.5 xl:px-3 py-1.5 rounded-md text-xs xl:text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === "systems"
                  ? "bg-slate-800 text-white border border-slate-700 shadow-xs"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              AI Systems Fleet
            </button>

            <button
              id="nav-btn-monitor"
              onClick={() => setActiveTab("monitor")}
              className={`px-2.5 xl:px-3 py-1.5 rounded-md text-xs xl:text-sm font-medium transition-colors flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === "monitor"
                  ? "bg-slate-800 text-white border border-slate-700 shadow-xs"
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
              className={`px-2.5 xl:px-3 py-1.5 rounded-md text-xs xl:text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === "audit"
                  ? "bg-slate-800 text-white border border-slate-700 shadow-xs"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              Audit Logs
            </button>

            <button
              id="nav-btn-rules"
              onClick={() => setActiveTab("rules")}
              className={`px-2.5 xl:px-3 py-1.5 rounded-md text-xs xl:text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === "rules"
                  ? "bg-slate-800 text-white border border-slate-700 shadow-xs"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              Rules Database
            </button>

            <button
              id="nav-btn-api"
              onClick={() => setActiveTab("api")}
              className={`px-2.5 xl:px-3 py-1.5 rounded-md text-xs xl:text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === "api"
                  ? "bg-slate-800 text-white border border-slate-700 shadow-xs"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              API & Docs
            </button>
          </nav>

          {/* Action CTAs & Organization Profile */}
          <div className="flex items-center space-x-2 shrink-0">
            {onTriggerRandomDemo && (
              <button
                id="btn-header-random-demo"
                onClick={onTriggerRandomDemo}
                className="bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/60 text-xs font-semibold px-2.5 sm:px-3 py-2 rounded-md shadow-xs flex items-center space-x-1.5 transition-all shrink-0"
                title="Generate a randomized AI system and immediately show the regulatory compliance results"
              >
                <Dices className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="hidden xl:inline whitespace-nowrap">🎲 Random Demo</span>
                <span className="xl:hidden whitespace-nowrap">Demo</span>
              </button>
            )}

            <button
              id="btn-add-ai-system"
              onClick={onOpenAddSystem}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-2.5 sm:px-3 py-2 rounded-md shadow flex items-center space-x-1.5 transition-all shrink-0"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">Add AI System</span>
              <span className="sm:hidden whitespace-nowrap">Add</span>
            </button>

            <div
              id="user-org-badge"
              onClick={onOpenAuthModal}
              className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 px-2 sm:px-3 py-1.5 rounded-md cursor-pointer transition-colors shrink-0"
              title="Click to switch organization or user account"
            >
              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <div className="text-left leading-none hidden sm:block">
                <p className="text-xs font-medium text-slate-200 truncate max-w-[90px] lg:max-w-[110px] xl:max-w-[140px]">
                  {organization?.name || "Organization"}
                </p>
                <p className="text-[10px] text-slate-400 truncate max-w-[90px] lg:max-w-[110px] xl:max-w-[140px] mt-0.5">
                  {user?.email || "Account"}
                </p>
              </div>
            </div>

            {/* Mobile / Tablet Menu Toggle Button */}
            <button
              id="btn-mobile-nav-toggle"
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-md bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 transition-colors shrink-0"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Responsive Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-2 animate-in fade-in slide-in-from-top-1 duration-150">
            <button
              onClick={() => {
                setActiveTab("systems");
                setIsMobileMenuOpen(false);
              }}
              className={`px-3 py-2 rounded-md text-xs font-medium text-left transition-colors ${
                activeTab === "systems"
                  ? "bg-slate-800 text-emerald-400 border border-slate-700 font-semibold"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              AI Systems Fleet
            </button>
            <button
              onClick={() => {
                setActiveTab("monitor");
                setIsMobileMenuOpen(false);
              }}
              className={`px-3 py-2 rounded-md text-xs font-medium text-left transition-colors flex items-center justify-between ${
                activeTab === "monitor"
                  ? "bg-slate-800 text-emerald-400 border border-slate-700 font-semibold"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              <span>Regulatory Monitor</span>
              {conflictCount > 0 && (
                <span className="bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                  {conflictCount}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab("audit");
                setIsMobileMenuOpen(false);
              }}
              className={`px-3 py-2 rounded-md text-xs font-medium text-left transition-colors ${
                activeTab === "audit"
                  ? "bg-slate-800 text-emerald-400 border border-slate-700 font-semibold"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              Audit Logs
            </button>
            <button
              onClick={() => {
                setActiveTab("rules");
                setIsMobileMenuOpen(false);
              }}
              className={`px-3 py-2 rounded-md text-xs font-medium text-left transition-colors ${
                activeTab === "rules"
                  ? "bg-slate-800 text-emerald-400 border border-slate-700 font-semibold"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              Rules Database
            </button>
            <button
              onClick={() => {
                setActiveTab("api");
                setIsMobileMenuOpen(false);
              }}
              className={`px-3 py-2 rounded-md text-xs font-medium text-left transition-colors ${
                activeTab === "api"
                  ? "bg-slate-800 text-emerald-400 border border-slate-700 font-semibold"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              API & Docs
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
