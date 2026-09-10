"use client";

import React from "react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/ToastProvider";
import { RoleGuard } from "@/components/RouteGuard";
import { Settings, Shield, User, Building, Key, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const { currentUser } = useAuth();
  const isAcme = currentUser?.organization_id === "11111111-1111-1111-1111-111111111111";

  return (
    <RoleGuard requiredPermission="project.read">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-blue-400" />
            Account & Organization Settings
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your user persona identity, tenant context, and active RBAC permissions.
          </p>
        </div>

        {/* User Profile Card */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider font-mono">
            <User className="w-4 h-4 text-blue-400" />
            <span>Active Identity & Membership</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 font-mono uppercase">Full Name</span>
              <p className="text-sm font-semibold text-white mt-1">{currentUser?.name || "PMRG Admin"}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 font-mono uppercase">Work Email</span>
              <p className="text-sm font-semibold text-white mt-1 font-mono">{currentUser?.email || "admin@pmrgsolution.com"}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 font-mono uppercase">Assigned System Role</span>
              <p className="text-sm font-semibold text-blue-400 mt-1 font-mono">{currentUser?.role || "ADMIN"}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 font-mono uppercase">User UUID</span>
              <p className="text-xs font-mono text-slate-300 mt-1 truncate">{currentUser?.user_id || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Tenant Organization Card */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider font-mono">
            <Building className="w-4 h-4 text-purple-400" />
            <span>Tenant Isolation & Organization</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 font-mono uppercase">Organization Name</span>
              <p className="text-sm font-semibold text-white mt-1">
                {isAcme ? "Acme Corp (Primary Tenant)" : "Globex Systems (Tenant B)"}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 font-mono uppercase">Tenant Organization ID</span>
              <p className="text-xs font-mono text-slate-300 mt-1 truncate">{currentUser?.organization_id || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Active RBAC Permissions Matrix */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider font-mono">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Active RBAC Capabilities ({currentUser?.permissions?.length || 0})</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Server Authoritative
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {currentUser?.permissions?.map((perm) => (
              <span
                key={perm}
                className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>{perm}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Tenant AI Provider Configuration (Gated by ai_config.manage or admin) */}
        {currentUser && (currentUser.permissions?.includes("ai_config.manage") || currentUser.permissions?.includes("*")) && (
          <TenantAIConfigSection />
        )}
      </div>
    </RoleGuard>
  );
}

function TenantAIConfigSection() {
  const [configs, setConfigs] = React.useState<any[]>([]);
  const { toast, confirmModal } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [apiKey, setApiKey] = React.useState("");
  const [provider, setProvider] = React.useState("google_gemini");
  const [isSaving, setIsSaving] = React.useState(false);
  const [message, setMessage] = React.useState<{ text: string; type: "success" | "error" } | null>(null);

  const fetchConfigs = async () => {
    try {
      const { api } = await import("@/lib/api");
      const data = await api.getAIConfig();
      setConfigs(data || []);
    } catch (err: any) {
      console.error("Failed to load AI configs:", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchConfigs();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    setIsSaving(true);
    setMessage(null);
    try {
      const { api } = await import("@/lib/api");
      await api.saveAIConfig(provider, apiKey.trim());
      toast.success("API Key Saved", `${provider.toUpperCase()} API key encrypted and saved securely for this tenant.`);
      setMessage({ text: "AI API Key encrypted and saved securely for this tenant.", type: "success" });
      setApiKey("");
      await fetchConfigs();
    } catch (err: any) {
      toast.error("Failed to Save Key", err.message || "Failed to save API key.");
      setMessage({ text: err.message || "Failed to save API key.", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (prov: string) => {
    const confirmed = await confirmModal({
      title: "Revoke AI API Key",
      message: `Are you sure you want to revoke the ${prov.toUpperCase()} API key for this organization? PM Buddy AI will no longer use this key for requests.`,
      confirmText: "Revoke Key",
      cancelText: "Cancel",
      variant: "danger",
    });
    if (!confirmed) return;

    try {
      const { api } = await import("@/lib/api");
      await api.deleteAIConfig(prov);
      toast.success("API Key Revoked", `The ${prov.toUpperCase()} API key was revoked successfully.`);
      setMessage({ text: `Key for ${prov} deleted successfully.`, type: "success" });
      await fetchConfigs();
    } catch (err: any) {
      toast.error("Revocation Failed", err.message || "Failed to delete API key.");
      setMessage({ text: err.message || "Failed to delete API key.", type: "error" });
    }
  };

  return (
    <div className="bg-slate-900/70 border border-indigo-900/40 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider font-mono">
          <Key className="w-4 h-4 text-indigo-400" />
          <span>Tenant AI Provider Keys (BYOK / Multi-Tenant Isolation)</span>
        </div>
        <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
          AES-256 Fernet Encrypted
        </span>
      </div>

      <p className="text-xs text-slate-400">
        Configure tenant-dedicated API keys for PM Buddy AI. Keys are encrypted at rest using AES-256 Fernet,
        never logged, never exposed in client responses, and isolated strictly to your organization.
      </p>

      {message && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
            message.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/10 border border-rose-500/30 text-rose-300"
          }`}
        >
          {message.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" /> : <Shield className="w-4 h-4 shrink-0 text-rose-400" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Existing Configs */}
      {loading ? (
        <div className="text-xs text-slate-500 font-mono py-2">Loading configured keys...</div>
      ) : configs.length > 0 ? (
        <div className="space-y-2">
          {configs.map((c) => (
            <div
              key={c.id || c.provider}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
            >
              <div>
                <div className="font-semibold text-white uppercase tracking-wide font-mono text-[11px]">
                  {c.provider}
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  Masked Fingerprint: <span className="text-indigo-400">{c.masked_key || "••••••••"}</span>
                  {c.updated_at && <span className="ml-3 text-slate-500">Updated: {new Date(c.updated_at).toLocaleDateString()}</span>}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(c.provider)}
                className="px-2.5 py-1 text-[11px] font-mono rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition"
              >
                Revoke Key
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-slate-950 border border-dashed border-slate-800 text-xs text-slate-500">
          No tenant-specific AI keys configured. The platform shared key pool is currently used as default.
        </div>
      )}

      {/* Add / Update Key Form */}
      <form onSubmit={handleSave} className="pt-2 border-t border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">
              Provider
            </label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="google_gemini">Google Gemini (Default)</option>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic Claude</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">
              API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste new API key (e.g. AIzaSy...)"
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder:text-slate-600 text-xs focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving || !apiKey.trim()}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow transition"
        >
          {isSaving ? "Encrypting & Storing..." : "Save Encrypted API Key"}
        </button>
      </form>
    </div>
  );
}
