import React, { useState, useEffect } from "react";
import { User, Organization } from "../types";
import { X, Building2, UserCircle2, Plus, Check } from "lucide-react";

interface AuthOrgModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  currentOrg: Organization | null;
  onUserOrOrgChanged: (user: User, org: Organization) => void;
}

export const AuthOrgModal: React.FC<AuthOrgModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentOrg,
  onUserOrOrgChanged,
}) => {
  const [tab, setTab] = useState<"switch" | "create_org" | "create_user">("switch");
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New Org Form
  const [orgName, setOrgName] = useState("");
  const [industry, setIndustry] = useState("Enterprise Software");

  // New User Form
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState<"compliance_officer" | "auditor" | "admin">("compliance_officer");

  useEffect(() => {
    if (isOpen) {
      fetch("/api/auth/organizations")
        .then((res) => res.json())
        .then((data) => setOrganizations(data.organizations || []))
        .catch((err) => console.error(err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectOrg = (org: Organization) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, organizationId: org.id };
      onUserOrOrgChanged(updatedUser, org);
      onClose();
    }
  };

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: orgName, industry }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create organization");

      if (currentUser) {
        onUserOrOrgChanged(currentUser, data.organization);
      }
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUserAndOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail || !orgName) {
      setError("Email and Organization Name are required");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userName,
          email: userEmail,
          role: userRole,
          organizationName: orgName,
          industry,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to register");

      onUserOrOrgChanged(data.user, data.organization);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-emerald-700" />
            <h3 className="text-base font-bold text-slate-900">Account & Organization</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setTab("switch")}
            className={`flex-1 py-3 text-center transition-colors ${
              tab === "switch" ? "border-b-2 border-emerald-600 text-emerald-800" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Active Profile
          </button>
          <button
            onClick={() => setTab("create_org")}
            className={`flex-1 py-3 text-center transition-colors ${
              tab === "create_org" ? "border-b-2 border-emerald-600 text-emerald-800" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            New Organization
          </button>
          <button
            onClick={() => setTab("create_user")}
            className={`flex-1 py-3 text-center transition-colors ${
              tab === "create_user" ? "border-b-2 border-emerald-600 text-emerald-800" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Register Account
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded border border-rose-200">{error}</div>}

          {/* TAB 1: Switch Org */}
          {tab === "switch" && (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                <p className="text-slate-500">Current Active Session:</p>
                <p className="font-bold text-slate-900 text-sm">{currentUser?.name || "Compliance Lead"}</p>
                <p className="text-slate-600">{currentUser?.email}</p>
                <span className="inline-block mt-1 bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono text-[10px]">
                  Role: {currentUser?.role}
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Select Organization
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {organizations.map((org) => {
                    const isCurrent = currentOrg?.id === org.id;
                    return (
                      <div
                        key={org.id}
                        onClick={() => handleSelectOrg(org)}
                        className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                          isCurrent
                            ? "bg-emerald-50 border-emerald-500 text-emerald-900"
                            : "bg-white border-slate-200 hover:border-slate-300 text-slate-800"
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold">{org.name}</p>
                          <p className="text-[11px] text-slate-500">{org.industry} • {org.tier}</p>
                        </div>
                        {isCurrent && <Check className="w-4 h-4 text-emerald-600" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Create Organization */}
          {tab === "create_org" && (
            <form onSubmit={handleCreateOrg} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Organization Name</label>
                <input
                  type="text"
                  placeholder="e.g. Acme FinTech Global"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Industry Sector</label>
                <input
                  type="text"
                  placeholder="e.g. Healthcare / Financial Services"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 rounded-lg text-xs transition-colors shadow disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Organization"}
              </button>
            </form>
          )}

          {/* TAB 3: Register Account & Org */}
          {tab === "create_user" && (
            <form onSubmit={handleCreateUserAndOrg} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Sarah Jenkins"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="sarah.jenkins@acmecorp.com"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Role</label>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                >
                  <option value="compliance_officer">Chief Compliance / AI Risk Officer</option>
                  <option value="auditor">Internal / External Legal Auditor</option>
                  <option value="admin">System Administrator</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Organization Name</label>
                <input
                  type="text"
                  placeholder="e.g. Horizon Biometrics"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 rounded-lg text-xs transition-colors shadow disabled:opacity-50 mt-2"
              >
                {loading ? "Registering..." : "Complete Registration"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
