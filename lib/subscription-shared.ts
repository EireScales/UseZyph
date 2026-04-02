/** Client-safe subscription helpers (no server-only imports). */

export type PlanStatus = "free" | "trialing" | "pro" | "mirror";

export type SubscriptionRow = {
  status: PlanStatus;
  trial_end: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
};

export const defaultSubscription = (): SubscriptionRow => ({
  status: "free",
  trial_end: null,
  stripe_customer_id: null,
  stripe_subscription_id: null,
});

/** Start of current calendar day in UTC (for daily capture limits). */
export function startOfUtcDayIso(): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

export function isFreeTier(sub: SubscriptionRow): boolean {
  return sub.status === "free" || !sub.status;
}

export function isTrialing(sub: SubscriptionRow): boolean {
  return sub.status === "trialing";
}

/**
 * Whole calendar days remaining until trial_end (from now). 0 if already ended.
 * null if trial_end is missing or invalid.
 */
export function trialDaysRemaining(trialEndIso: string | null): number | null {
  if (!trialEndIso) return null;
  const end = new Date(trialEndIso).getTime();
  if (Number.isNaN(end)) return null;
  const diff = end - Date.now();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (24 * 60 * 60 * 1000));
}

function normalizeStatus(value: unknown): PlanStatus {
  if (
    value === "trialing" ||
    value === "pro" ||
    value === "mirror" ||
    value === "free"
  ) {
    return value;
  }
  return "free";
}

export function parseSubscriptionRow(raw: unknown): SubscriptionRow {
  if (!raw || typeof raw !== "object") {
    return defaultSubscription();
  }
  const o = raw as Record<string, unknown>;
  return {
    status: normalizeStatus(o.status),
    trial_end: typeof o.trial_end === "string" ? o.trial_end : null,
    stripe_customer_id:
      typeof o.stripe_customer_id === "string" ? o.stripe_customer_id : null,
    stripe_subscription_id:
      typeof o.stripe_subscription_id === "string"
        ? o.stripe_subscription_id
        : null,
  };
}
