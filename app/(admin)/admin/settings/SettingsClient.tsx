"use client";
import { useState } from "react";
import { adminApi } from "@/lib/api-client/admin";

interface Settings { newUserCoins: number; generationCost: number; dailyQuizCoins: number; }
interface CoinPackage { id: string; name: string; coins: number; priceUsd: number; lsVariantId: string | null; isActive: boolean; }

export default function SettingsClient({
  settings: initialSettings,
  initialPackages,
}: {
  settings: Settings;
  initialPackages: CoinPackage[];
}) {
  const [settings, setSettings] = useState(initialSettings);
  const [packages, setPackages] = useState(initialPackages);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [newPkg, setNewPkg] = useState({ name: "", coins: 10000, priceUsd: 100, lsVariantId: "" });
  const [addingPkg, setAddingPkg] = useState(false);
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [variantIdDraft, setVariantIdDraft] = useState("");
  const [savingVariantId, setSavingVariantId] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSavingSettings(true);
    setError(null);
    try {
      const updated = await adminApi.updateSettings({
        newUserCoins: settings.newUserCoins,
        generationCost: settings.generationCost,
        dailyQuizCoins: settings.dailyQuizCoins,
      });
      setSettings(updated);
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 2000);
    } catch {
      setError("Failed to save settings.");
    } finally {
      setSavingSettings(false);
    }
  }

  async function handleAddPackage(e: React.FormEvent) {
    e.preventDefault();
    if (!newPkg.name.trim()) return;
    setAddingPkg(true);
    setError(null);
    try {
      const created = await adminApi.createPackage({
        name: newPkg.name.trim(),
        coins: newPkg.coins,
        priceUsd: newPkg.priceUsd,
        lsVariantId: newPkg.lsVariantId.trim() || undefined,
      });
      setPackages((prev) => [...prev, created]);
      setNewPkg({ name: "", coins: 10000, priceUsd: 100, lsVariantId: "" });
    } catch {
      setError("Failed to create package.");
    } finally {
      setAddingPkg(false);
    }
  }

  async function handleTogglePackage(id: string, isActive: boolean) {
    try {
      const updated = await adminApi.updatePackage(id, { isActive: !isActive });
      setPackages((prev) => prev.map((p) => (p.id === id ? updated : p)));
    } catch {
      setError("Failed to update package.");
    }
  }

  async function handleDeletePackage(id: string) {
    if (!confirm("Delete this package?")) return;
    try {
      await adminApi.deletePackage(id);
      setPackages((prev) => prev.filter((p) => p.id !== id));
    } catch {
      setError("Failed to delete package.");
    }
  }

  async function handleSaveVariantId(id: string) {
    setSavingVariantId(true);
    setError(null);
    try {
      const updated = await adminApi.updatePackage(id, { lsVariantId: variantIdDraft.trim() || undefined });
      setPackages((prev) => prev.map((p) => (p.id === id ? updated : p)));
      setEditingVariantId(null);
    } catch {
      setError("Failed to save variant ID.");
    } finally {
      setSavingVariantId(false);
    }
  }

  return (
    <div className="py-4 space-y-6 lg:py-0 lg:space-y-8">
      <h1 className="font-headline text-2xl lg:text-4xl font-extrabold text-on-surface">Settings</h1>

      {error && (
        <div className="flex items-center gap-2 bg-error-container/20 border border-error/20 rounded-xl px-4 py-3 text-sm text-error">
          <span className="material-symbols-outlined text-[18px]">error</span> {error}
        </div>
      )}

      {/* Generation Settings */}
      <div className="bg-surface-container-lowest rounded-3xl p-5 lg:p-7 space-y-5">
        <h2 className="font-headline font-bold text-on-surface text-sm uppercase tracking-wider text-outline">AI Generation Settings</h2>
        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-semibold mb-1.5">New User Welcome Coins</label>
              <input
                type="number"
                min={0}
                value={settings.newUserCoins}
                onChange={(e) => setSettings((s) => ({ ...s, newUserCoins: parseInt(e.target.value) || 0 }))}
                className="input-field"
              />
              <p className="text-xs text-on-surface-variant mt-1">Coins granted when a new user registers.</p>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">Cost Per Generation (coins)</label>
              <input
                type="number"
                min={0}
                value={settings.generationCost}
                onChange={(e) => setSettings((s) => ({ ...s, generationCost: parseInt(e.target.value) || 0 }))}
                className="input-field"
              />
              <p className="text-xs text-on-surface-variant mt-1">Coins deducted each time a user generates a sentence.</p>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">Daily Quiz Reward (coins)</label>
              <input
                type="number"
                min={0}
                value={settings.dailyQuizCoins}
                onChange={(e) => setSettings((s) => ({ ...s, dailyQuizCoins: parseInt(e.target.value) || 0 }))}
                className="input-field"
              />
              <p className="text-xs text-on-surface-variant mt-1">Coins rewarded for the first quiz completed each day.</p>
            </div>
          </div>
          <button
            type="submit"
            disabled={savingSettings}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-2xl text-sm font-bold disabled:opacity-60 transition-colors hover:bg-primary/90"
          >
            {savingSettings ? (
              <><span className="material-symbols-outlined animate-spin text-base">refresh</span> Saving...</>
            ) : settingsSaved ? (
              <><span className="material-symbols-outlined text-base">check_circle</span> Saved!</>
            ) : (
              <><span className="material-symbols-outlined text-base">save</span> Save Settings</>
            )}
          </button>
        </form>
      </div>

      {/* Coin Packages */}
      <div className="bg-surface-container-lowest rounded-3xl p-5 lg:p-7 space-y-5">
        <h2 className="font-headline font-bold text-on-surface text-sm uppercase tracking-wider text-outline">Coin Store Packages</h2>

        {packages.length > 0 && (
          <div className="divide-y divide-surface-container-high rounded-2xl border border-surface-container-high overflow-hidden">
            {packages.map((pkg) => (
              <div key={pkg.id} className="p-4 bg-surface-container-lowest space-y-2">
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-on-surface text-sm">{pkg.name}</p>
                    <p className="text-xs text-on-surface-variant">{pkg.coins.toLocaleString()} coins · ${(pkg.priceUsd / 100).toFixed(2)}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${pkg.isActive ? "bg-secondary-container text-on-secondary-container" : "bg-surface-container text-on-surface-variant"}`}>
                    {pkg.isActive ? "Active" : "Hidden"}
                  </span>
                  <button
                    onClick={() => handleTogglePackage(pkg.id, pkg.isActive)}
                    className="p-2 rounded-xl hover:bg-surface-container transition-colors"
                    title={pkg.isActive ? "Hide from store" : "Show in store"}
                  >
                    <span className="material-symbols-outlined text-base text-outline">
                      {pkg.isActive ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                  <button
                    onClick={() => handleDeletePackage(pkg.id)}
                    className="p-2 rounded-xl hover:bg-error-container/30 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base text-error/60">delete</span>
                  </button>
                </div>

                {/* Lemon Squeezy Variant ID */}
                {editingVariantId === pkg.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      autoFocus
                      value={variantIdDraft}
                      onChange={(e) => setVariantIdDraft(e.target.value)}
                      placeholder="e.g. 123456"
                      className="input-field text-xs flex-1"
                    />
                    <button
                      onClick={() => handleSaveVariantId(pkg.id)}
                      disabled={savingVariantId}
                      className="px-3 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold disabled:opacity-60"
                    >
                      {savingVariantId ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => setEditingVariantId(null)}
                      className="px-3 py-2 bg-surface-container text-on-surface-variant rounded-xl text-xs font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setEditingVariantId(pkg.id); setVariantIdDraft(pkg.lsVariantId ?? ""); }}
                    className="flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {pkg.lsVariantId ? "edit" : "add_circle"}
                    </span>
                    {pkg.lsVariantId
                      ? <span>LS Variant ID: <span className="font-mono font-bold text-secondary">{pkg.lsVariantId}</span></span>
                      : <span className="text-error font-semibold">Set Lemon Squeezy Variant ID (required for checkout)</span>
                    }
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleAddPackage} className="space-y-3 pt-2 border-t border-surface-container-high">
          <p className="text-sm font-semibold text-on-surface">Add New Package</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold mb-1 text-on-surface-variant">Package Name</label>
              <input
                value={newPkg.name}
                onChange={(e) => setNewPkg((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Starter Pack"
                className="input-field text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-on-surface-variant">LS Variant ID</label>
              <input
                value={newPkg.lsVariantId}
                onChange={(e) => setNewPkg((p) => ({ ...p, lsVariantId: e.target.value }))}
                placeholder="e.g. 123456"
                className="input-field text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-on-surface-variant">Coins</label>
              <input
                type="number"
                min={1}
                value={newPkg.coins}
                onChange={(e) => setNewPkg((p) => ({ ...p, coins: parseInt(e.target.value) || 0 }))}
                className="input-field text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-on-surface-variant">Price (cents, e.g. 100 = $1)</label>
              <input
                type="number"
                min={1}
                value={newPkg.priceUsd}
                onChange={(e) => setNewPkg((p) => ({ ...p, priceUsd: parseInt(e.target.value) || 0 }))}
                className="input-field text-sm"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={addingPkg || !newPkg.name.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-surface-container-high text-on-surface rounded-xl text-sm font-bold disabled:opacity-60 hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            {addingPkg ? "Adding..." : "Add Package"}
          </button>
        </form>
      </div>
    </div>
  );
}
