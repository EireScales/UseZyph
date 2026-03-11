"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const glassCard = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  backdropFilter: "blur(24px)",
};

type ProfileRow = {
  id: string;
  name: string | null;
  settings?: {
    capture_frequency?: string;
    idle_enabled?: boolean;
    categories?: string[];
    data_retention_days?: number;
  } | null;
};

const FREQUENCY_OPTIONS = [
  { value: "realtime", label: "Real-time" },
  { value: "every_5m", label: "Every 5 minutes" },
  { value: "every_15m", label: "Every 15 minutes" },
  { value: "every_hour", label: "Every hour" },
];

const CAPTURE_CATEGORIES = [
  { id: "apps", label: "Applications" },
  { id: "text", label: "Text & clipboard" },
  { id: "browsing", label: "Browsing" },
  { id: "meetings", label: "Meetings & calendar" },
];

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [frequency, setFrequency] = useState("every_5m");
  const [idleEnabled, setIdleEnabled] = useState(true);
  const [categories, setCategories] = useState<string[]>(["apps", "text"]);
  const [dataRetentionDays, setDataRetentionDays] = useState(90);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const {
        data: { user },
        error: sessionError,
      } = await supabase.auth.getUser();
      if (sessionError || !user) {
        router.replace("/auth");
        return;
      }

      setUserId(user.id);
      setEmail(user.email ?? "");

      try {
        const { data } = await supabase
          .from("profiles")
          .select("name, settings")
          .eq("id", user.id)
          .single();

        if (data) {
          const row = data as ProfileRow;
          setDisplayName(row.name ?? "");
          const s = row.settings;
          if (s) {
            if (s.capture_frequency) setFrequency(s.capture_frequency);
            if (typeof s.idle_enabled === "boolean") setIdleEnabled(s.idle_enabled);
            if (Array.isArray(s.categories)) setCategories(s.categories);
            if (typeof s.data_retention_days === "number")
              setDataRetentionDays(s.data_retention_days);
          }
        }
      } catch {
        // use defaults
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [router]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const toggleCategory = (id: string) => {
    setCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      const settings = {
        capture_frequency: frequency,
        idle_enabled: idleEnabled,
        categories,
        data_retention_days: dataRetentionDays,
      };
      const { error } = await supabase
        .from("profiles")
        .update({
          name: displayName.trim() || null,
          settings,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) throw error;
      setToast("Settings saved");
    } catch {
      setToast("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAllData = async () => {
    if (!userId) return;
    setDeleting(true);
    try {
      await supabase.from("observations").delete().eq("user_id", userId);
      await supabase.from("user_profile_insights").delete().eq("user_id", userId);
      await supabase
        .from("profiles")
        .update({
          settings: {},
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
      setToast("All data deleted");
      setDeleteModalOpen(false);
    } catch {
      setToast("Failed to delete data");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-[#7c3aed] border-t-transparent"
          aria-label="Loading"
        />
      </div>
    );
  }

  const initial = displayName?.[0]?.toUpperCase() || "?";

  return (
    <div
      className="min-h-screen p-8"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
        `,
        backgroundSize: "80px 80px",
      }}
    >
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

        <section className="rounded-2xl p-6 mb-8" style={glassCard}>
          <h2 className="text-lg font-semibold text-white mb-6">Account</h2>
          <div className="flex items-center gap-6 mb-6">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, #7c3aed 0%, #e8837a 100%)",
              }}
            >
              {initial}
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-1.5">
                  Display name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/50"
                  style={{
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="w-full px-4 py-2.5 rounded-xl text-white/70 bg-white/5 border border-white/10 cursor-not-allowed"
                  placeholder="Email"
                />
                <p className="text-white/40 text-xs mt-1">
                  Email is managed by your account and cannot be changed here.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl p-6 mb-8" style={glassCard}>
          <h2 className="text-lg font-semibold text-white mb-6">
            Capture preferences
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm text-white/60 mb-2">
                Capture frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/50 bg-black/30 border border-white/10"
              >
                {FREQUENCY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Capture when idle</p>
                <p className="text-white/50 text-sm">
                  Continue learning when you&apos;re away from the keyboard
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={idleEnabled}
                onClick={() => setIdleEnabled((v) => !v)}
                className={`relative w-12 h-7 rounded-full transition-colors ${
                  idleEnabled ? "bg-[#7c3aed]" : "bg-white/20"
                }`}
              >
                <span
                  className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${
                    idleEnabled ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">
                Categories to capture
              </label>
              <div className="flex flex-wrap gap-3">
                {CAPTURE_CATEGORIES.map((cat) => (
                  <label
                    key={cat.id}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={categories.includes(cat.id)}
                      onChange={() => toggleCategory(cat.id)}
                      className="rounded border-white/30 bg-black/30 text-[#7c3aed] focus:ring-[#7c3aed]/50"
                    />
                    <span className="text-white/90 text-sm">{cat.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl p-6 mb-8" style={glassCard}>
          <h2 className="text-lg font-semibold text-white mb-6">Danger zone</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm text-white/60 mb-2">
                Data retention (days)
              </label>
              <input
                type="number"
                min={7}
                max={365}
                value={dataRetentionDays}
                onChange={(e) =>
                  setDataRetentionDays(Number(e.target.value) || 90)
                }
                className="w-32 px-4 py-2.5 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/50 bg-black/30 border border-white/10"
              />
              <p className="text-white/40 text-xs mt-1">
                Observations older than this will be automatically removed.
              </p>
            </div>
            <div>
              <button
                type="button"
                onClick={() => setDeleteModalOpen(true)}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-red-400 border border-red-500/50 bg-red-500/10 hover:bg-red-500/20 transition-colors"
              >
                Delete all my data
              </button>
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 rounded-xl font-semibold text-white disabled:opacity-50 transition-all hover:opacity-95"
            style={{
              background:
                "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
              boxShadow: "0 4px 20px rgba(124,58,237,0.35)",
            }}
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>

      {toast && (
        <div
          className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl text-white text-sm font-medium shadow-lg"
          style={{
            background: "rgba(0,0,0,0.8)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(12px)",
          }}
        >
          {toast}
        </div>
      )}

      {deleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(8px)",
          }}
          onClick={() => !deleting && setDeleteModalOpen(false)}
        >
          <div
            className="rounded-2xl p-6 max-w-md w-full shadow-xl"
            style={glassCard}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-white mb-2">
              Delete all data?
            </h3>
            <p className="text-white/60 text-sm mb-6">
              This will permanently delete all observations and insights. Your
              account will remain; only learned data is removed.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl text-white/80 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAllData}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30 disabled:opacity-50 transition-colors"
              >
                {deleting ? "Deleting…" : "Yes, delete everything"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
