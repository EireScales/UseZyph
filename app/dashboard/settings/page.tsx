"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  parseSubscriptionRow,
  type SubscriptionRow,
} from "@/lib/subscription-shared";

type ProfileRow = {
  id: string;
  display_name: string | null;
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

type Toast = { type: "success" | "error"; message: string } | null;

const inputClass =
  "w-full px-4 py-2.5 rounded-lg bg-[#111] border border-[#1e1e1e] text-[#f0f0f0] placeholder-[#666] focus:outline-none focus:border-[#7c3aed] focus:ring-0 transition-colors duration-200";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [frequency, setFrequency] = useState("every_5m");
  const [idleEnabled, setIdleEnabled] = useState(true);
  const [categories, setCategories] = useState<string[]>(["apps", "text"]);
  const [dataRetentionDays, setDataRetentionDays] = useState(90);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionRow | null>(
    null
  );
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
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
          .select("display_name, settings, subscription")
          .eq("id", user.id)
          .single();

        if (data) {
          const row = data as ProfileRow & { subscription?: unknown };
          setSubscription(parseSubscriptionRow(row.subscription));
          setDisplayName(row.display_name ?? "");
          const s = row.settings;
          if (s) {
            if (s.capture_frequency) setFrequency(s.capture_frequency);
            if (typeof s.idle_enabled === "boolean") setIdleEnabled(s.idle_enabled);
            if (Array.isArray(s.categories)) setCategories(s.categories);
            if (typeof s.data_retention_days === "number")
              setDataRetentionDays(s.data_retention_days);
          }
        }
      } catch (err) {
        console.error("Save error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
          display_name: displayName.trim() || null,
          settings,
        })
        .eq("id", userId);

      if (error) throw error;
      setToast({ type: "success", message: "Saved" });
    } catch (err) {
      const message = (err as Error)?.message ?? "Failed to save";
      setToast({ type: "error", message });
    } finally {
      setSaving(false);
    }
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        credentials: "include",
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) {
        setToast({
          type: "error",
          message: data.error ?? "Could not open billing portal",
        });
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setToast({ type: "error", message: "No portal URL returned" });
    } catch {
      setToast({ type: "error", message: "Network error" });
    } finally {
      setPortalLoading(false);
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
      setToast({ type: "success", message: "All data deleted" });
      setDeleteModalOpen(false);
    } catch {
      setToast({ type: "error", message: "Failed to delete data" });
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
      className="p-6 md:p-8 pb-24"
      style={{ animation: "dashboardFadeIn 0.3s ease forwards" }}
    >

      <div className="max-w-[680px] mx-auto">
        <h1 className="text-[28px] font-semibold text-[#f0f0f0] mb-8">
          Settings
        </h1>

        {/* Account */}
        <section className="mb-10">
          <h2 className="text-sm font-medium text-[#666] uppercase tracking-wider mb-4">
            Account
          </h2>
          <div className="h-px bg-[#1a1a1a] mb-6" />
          <div className="flex items-start gap-6 mb-6">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white shrink-0"
              style={{
                background: "linear-gradient(135deg, #7c3aed 0%, #e8837a 100%)",
              }}
            >
              {initial}
            </div>
            <div className="flex-1 space-y-4 min-w-0">
              <div>
                <label className="block text-xs text-[#666] mb-1.5">
                  Display name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className={inputClass}
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-xs text-[#666] mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  readOnly
                  className={`${inputClass} opacity-80 cursor-not-allowed`}
                  placeholder="Email"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Subscription */}
        <section className="mb-10">
          <h2 className="text-sm font-medium text-[#666] uppercase tracking-wider mb-4">
            Subscription
          </h2>
          <div className="h-px bg-[#1a1a1a] mb-6" />
          <div className="rounded-xl border border-[#1e1e1e] bg-[#111] px-4 py-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[#f0f0f0] font-medium">Billing</p>
                <p className="text-[#666] text-sm mt-0.5">
                  {subscription?.stripe_customer_id
                    ? "Manage your plan, payment method, and invoices in Stripe."
                    : "Subscribe to Pro to unlock unlimited captures and full history."}
                </p>
              </div>
              {subscription?.stripe_customer_id ? (
                <button
                  type="button"
                  onClick={handleManageSubscription}
                  disabled={portalLoading}
                  className="shrink-0 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-[#7c3aed] hover:opacity-90 disabled:opacity-50 transition-opacity duration-200"
                >
                  {portalLoading ? "Opening…" : "Manage subscription"}
                </button>
              ) : (
                <a
                  href="/pricing"
                  className="shrink-0 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-[#7c3aed] hover:opacity-90 transition-opacity duration-200 inline-block text-center"
                >
                  View pricing
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Capture Preferences */}
        <section className="mb-10">
          <h2 className="text-sm font-medium text-[#666] uppercase tracking-wider mb-4">
            Capture Preferences
          </h2>
          <div className="h-px bg-[#1a1a1a] mb-6" />
          <div className="space-y-6">
            <div>
              <label className="block text-xs text-[#666] mb-1.5">
                Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className={inputClass}
                style={{ appearance: "auto" }}
              >
                {FREQUENCY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-[#f0f0f0] font-medium">Capture when idle</p>
                <p className="text-[#666] text-sm mt-0.5">
                  Continue learning when you&apos;re away from the keyboard
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={idleEnabled}
                onClick={() => setIdleEnabled((v) => !v)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                  idleEnabled ? "bg-[#7c3aed]" : "bg-[#1a1a1a]"
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200 ${
                    idleEnabled ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>
            <div>
              <label className="block text-xs text-[#666] mb-2">
                Categories to capture
              </label>
              <div className="space-y-1">
                {CAPTURE_CATEGORIES.map((cat) => (
                  <label
                    key={cat.id}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-[#141414] transition-colors duration-200"
                  >
                    <input
                      type="checkbox"
                      checked={categories.includes(cat.id)}
                      onChange={() => toggleCategory(cat.id)}
                      className="w-4 h-4 rounded border-[#1e1e1e] bg-[#111] text-[#7c3aed] focus:ring-[#7c3aed] focus:ring-offset-0 focus:ring-offset-transparent"
                    />
                    <span className="text-[#f0f0f0] text-sm">{cat.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Data & Privacy */}
        <section className="mb-10">
          <h2 className="text-sm font-medium text-[#666] uppercase tracking-wider mb-4">
            Data & Privacy
          </h2>
          <div className="h-px bg-[#1a1a1a] mb-6" />
          <div className="space-y-6">
            <div className="flex items-baseline gap-2 flex-wrap">
              <label className="text-xs text-[#666]">Data retention</label>
              <input
                type="number"
                min={7}
                max={365}
                value={dataRetentionDays}
                onChange={(e) =>
                  setDataRetentionDays(Number(e.target.value) || 90)
                }
                className="w-20 px-3 py-2 rounded-lg bg-[#111] border border-[#1e1e1e] text-[#f0f0f0] focus:outline-none focus:border-[#7c3aed] text-sm"
              />
              <span className="text-[#666] text-sm">days</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="px-4 py-2 rounded-lg text-sm font-medium text-[#f0f0f0] border border-[#1e1e1e] hover:bg-[#141414] transition-colors duration-200"
              >
                Export my data
              </button>
              <button
                type="button"
                onClick={() => setDeleteModalOpen(true)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-red-400 border border-red-900/60 bg-transparent hover:bg-red-950/50 transition-colors duration-200"
              >
                Delete all data
              </button>
            </div>
          </div>
        </section>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 rounded-lg font-medium text-white bg-[#7c3aed] hover:opacity-90 disabled:opacity-50 transition-all duration-200 flex items-center gap-2"
          >
            {saving ? (
              <>
                <span
                  className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"
                  aria-hidden
                />
                Saving…
              </>
            ) : (
              "Save changes"
            )}
          </button>
        </div>
      </div>

      {/* Toasts */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border border-[#1e1e1e] shadow-lg"
          style={{ background: "#111111" }}
        >
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              toast.type === "success" ? "bg-[#22c55e]" : "bg-red-500"
            }`}
          />
          <span className="text-sm text-[#f0f0f0]">{toast.message}</span>
        </div>
      )}

      {/* Delete modal */}
      {deleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
          onClick={() => !deleting && setDeleteModalOpen(false)}
        >
          <div
            className="rounded-xl p-6 max-w-md w-full border border-[#1e1e1e] bg-[#111111]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-[#f0f0f0] mb-2">
              Delete all data?
            </h3>
            <p className="text-[#666] text-sm mb-6">
              This will permanently delete all observations and insights. Your
              account will remain; only learned data is removed.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                disabled={deleting}
                className="px-4 py-2 rounded-lg text-[#999] hover:bg-[#141414] transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAllData}
                disabled={deleting}
                className="px-4 py-2 rounded-lg text-red-400 border border-red-900/50 bg-transparent hover:bg-red-950/50 disabled:opacity-50 transition-colors duration-200"
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
