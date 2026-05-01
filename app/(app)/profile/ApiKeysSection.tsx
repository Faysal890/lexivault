"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { apiKeysApi, ApiClientError } from "@/lib/api-client";
import type { ApiKeyDto } from "@/lib/server/dto/apiKey";

const EXPIRY_OPTIONS = [
  { label: "Never", value: undefined },
  { label: "30 days", value: 30 },
  { label: "90 days", value: 90 },
  { label: "1 year", value: 365 },
];

export default function ApiKeysSection() {
  const [open, setOpen] = useState(false);
  const [keys, setKeys] = useState<ApiKeyDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [expiresInDays, setExpiresInDays] = useState<number | undefined>(undefined);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await apiKeysApi.list();
      setKeys(data);
    } catch {
      toast.error("Failed to load API keys");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && keys.length === 0 && !loading) refresh();
  }, [open]);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Please give the key a name");
      return;
    }
    setCreating(true);
    try {
      const result = await apiKeysApi.create({ name: name.trim(), expiresInDays });
      setNewKey(result.raw);
      setName("");
      setExpiresInDays(undefined);
      await refresh();
    } catch (err: unknown) {
      const msg = err instanceof ApiClientError ? err.message : "Failed to create key";
      toast.error(msg);
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm("Revoke this key? Apps using it will stop working immediately.")) return;
    setRevoking(id);
    try {
      await apiKeysApi.revoke(id);
      toast.success("Key revoked");
      await refresh();
    } catch {
      toast.error("Failed to revoke key");
    } finally {
      setRevoking(null);
    }
  };

  const copyKey = async () => {
    if (!newKey) return;
    try {
      await navigator.clipboard.writeText(newKey);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Copy failed — select and copy manually");
    }
  };

  const statusOf = (k: ApiKeyDto): { label: string; tone: string } => {
    if (k.revokedAt) return { label: "Revoked", tone: "text-error" };
    if (k.expiresAt && new Date(k.expiresAt) < new Date()) return { label: "Expired", tone: "text-error" };
    return { label: "Active", tone: "text-tertiary" };
  };

  return (
    <div className="bg-surface-container-lowest rounded-3xl p-5 lg:p-7">
      <button className="flex items-center justify-between w-full" onClick={() => setOpen((v) => !v)}>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-on-surface-variant">key</span>
          <h3 className="font-headline font-bold text-on-surface">API Keys</h3>
        </div>
        <span className="material-symbols-outlined text-on-surface-variant text-base">
          {open ? "expand_less" : "expand_more"}
        </span>
      </button>

      {open && (
        <div className="mt-4 space-y-5">
          <p className="text-sm text-on-surface-variant">
            Use API keys to authenticate the Lexora mobile app or browser extension. Send them as
            <code className="mx-1 px-1.5 py-0.5 rounded bg-surface-container text-xs">Authorization: Bearer lx_...</code>
          </p>

          {newKey && (
            <div className="rounded-2xl border-2 border-tertiary bg-tertiary-container/30 p-4 space-y-3">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-tertiary shrink-0">check_circle</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-on-surface text-sm">Key created — copy it now</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    This is the only time you&apos;ll see the full key. Store it somewhere safe.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 rounded-xl bg-surface-container text-xs font-mono break-all">{newKey}</code>
                <button
                  onClick={copyKey}
                  className="shrink-0 px-3 py-2 rounded-xl bg-tertiary text-on-tertiary text-sm font-bold flex items-center gap-1 hover:opacity-90"
                >
                  <span className="material-symbols-outlined text-base">content_copy</span>
                  Copy
                </button>
              </div>
              <button
                onClick={() => setNewKey(null)}
                className="text-xs font-bold text-on-surface-variant hover:text-on-surface"
              >
                I&apos;ve saved it — dismiss
              </button>
            </div>
          )}

          {/* Create form */}
          <div className="rounded-2xl bg-surface-container/40 p-4 space-y-3">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Create a new key</p>
            <div className="space-y-3 lg:grid lg:grid-cols-3 lg:gap-3 lg:space-y-0">
              <div className="lg:col-span-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder='e.g. "iPhone app" or "Chrome extension"'
                  maxLength={60}
                  className="input-field"
                  disabled={creating}
                />
              </div>
              <select
                value={expiresInDays ?? ""}
                onChange={(e) => setExpiresInDays(e.target.value ? Number(e.target.value) : undefined)}
                className="input-field"
                disabled={creating}
              >
                {EXPIRY_OPTIONS.map((opt) => (
                  <option key={opt.label} value={opt.value ?? ""}>{opt.label}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleCreate}
              disabled={creating || !name.trim()}
              className="w-full py-3 rounded-xl bg-primary text-on-primary font-bold text-sm disabled:opacity-60 flex items-center justify-center gap-1 hover:opacity-90 transition-opacity lg:w-auto lg:px-8"
            >
              {creating ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
                  Creating...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">add</span>
                  Create key
                </>
              )}
            </button>
          </div>

          {/* List */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Your keys</p>
            {loading && keys.length === 0 ? (
              <p className="text-sm text-on-surface-variant py-3">Loading...</p>
            ) : keys.length === 0 ? (
              <p className="text-sm text-on-surface-variant py-3">No keys yet.</p>
            ) : (
              <ul className="space-y-2">
                {keys.map((k) => {
                  const status = statusOf(k);
                  const isRevoked = !!k.revokedAt;
                  return (
                    <li
                      key={k.id}
                      className="rounded-2xl bg-surface-container/40 p-3 lg:p-4 flex items-start justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-on-surface text-sm truncate">{k.name}</span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${status.tone}`}>
                            {status.label}
                          </span>
                        </div>
                        <code className="text-xs text-on-surface-variant font-mono">{k.prefix}_••••••••</code>
                        <p className="text-[11px] text-outline mt-1">
                          Created {format(new Date(k.createdAt), "MMM d, yyyy")}
                          {k.lastUsedAt && ` · Last used ${format(new Date(k.lastUsedAt), "MMM d, yyyy")}`}
                          {k.expiresAt && ` · Expires ${format(new Date(k.expiresAt), "MMM d, yyyy")}`}
                        </p>
                      </div>
                      {!isRevoked && (
                        <button
                          onClick={() => handleRevoke(k.id)}
                          disabled={revoking === k.id}
                          className="shrink-0 px-3 py-1.5 rounded-xl border-2 border-error/40 text-error text-xs font-bold disabled:opacity-60 hover:bg-error-container/20"
                        >
                          {revoking === k.id ? "..." : "Revoke"}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
