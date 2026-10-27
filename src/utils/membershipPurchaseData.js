import { getDemoMemberKey } from "./demoData";
import { getMemberPTEntitlement, saveMemberPTEntitlement } from "./ptBookingData";

export const MEMBERSHIP_CHECKOUT_DRAFTS_KEY = "bugarhub_membership_checkout_drafts_v1";
export const MEMBERSHIP_ACCOUNTS_KEY = "bugarhub_membership_accounts_v1";
export const MEMBERSHIP_TRANSACTIONS_KEY = "bugarhub_membership_transactions_v1";
export const MEMBERSHIP_UPDATED_EVENT = "bugarhub-membership-updated";

export const MEMBERSHIP_PLANS = [
  {
    id: "bronze",
    name: "Bronze Member",
    price: 150000,
    bonusTokens: 0,
    description: "Pilihan praktis untuk memulai rutinitas fitness.",
    features: ["Basic Access", "Akses alat cardio & strength", "Loker bersama"],
    icon: "dumbbell",
  },
  {
    id: "silver",
    name: "Silver Member",
    price: 300000,
    bonusTokens: 1,
    description: "Akses lengkap untuk latihan yang lebih terarah.",
    features: ["Full Access", "Bonus 1 Token PT", "Loker pribadi", "Akses kelas reguler"],
    icon: "bolt",
    featured: true,
  },
  {
    id: "gold",
    name: "Gold VIP",
    price: 500000,
    bonusTokens: 3,
    description: "Pengalaman premium dengan fasilitas tambahan.",
    features: ["VIP Access", "Bonus 3 Token PT", "Unlimited Classes", "Consultation"],
    icon: "crown",
  },
];

export const PT_TOKEN_PACKS = [
  { id: "token-1", tokens: 1, price: 100000, name: "1 Token", description: "Untuk satu sesi PT" },
  { id: "token-5", tokens: 5, price: 450000, name: "5 Token", description: "Lebih hemat", featured: true },
  { id: "token-10", tokens: 10, price: 850000, name: "10 Token", description: "Untuk latihan rutin" },
];

function readMap(key) {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) || "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function writeMap(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function memberKey(member) {
  return getDemoMemberKey(member);
}

export function createMembershipCheckoutDraft(member, overrides = {}) {
  return {
    memberKey: memberKey(member),
    planId: "silver",
    purchaseType: "membership",
    tokenPackId: null,
    paymentMethod: "QRIS",
    promoCode: "",
    promoDiscount: 0,
    promoApplied: false,
    status: "selecting",
    receipt: null,
    ...overrides,
    updatedAt: new Date().toISOString(),
  };
}

export function readMembershipCheckoutDraft(member) {
  const key = memberKey(member);
  const drafts = readMap(MEMBERSHIP_CHECKOUT_DRAFTS_KEY);
  const draft = drafts[key];
  if (!draft || draft.memberKey !== key) return null;
  return draft;
}

export function saveMembershipCheckoutDraft(member, draft) {
  const key = memberKey(member);
  if (!key || !draft) return null;
  const drafts = readMap(MEMBERSHIP_CHECKOUT_DRAFTS_KEY);
  const next = { ...draft, memberKey: key, updatedAt: new Date().toISOString() };
  drafts[key] = next;
  return writeMap(MEMBERSHIP_CHECKOUT_DRAFTS_KEY, drafts) ? next : null;
}

export function getMembershipPlan(planId) {
  if (!planId) return null;
  return MEMBERSHIP_PLANS.find((plan) => plan.id === planId) || null;
}

export function getTokenPack(tokenPackId) {
  return PT_TOKEN_PACKS.find((pack) => pack.id === tokenPackId) || null;
}

export function getMembershipPurchaseSummary(draft) {
  const plan = getMembershipPlan(draft?.planId);
  const tokenPack = getTokenPack(draft?.tokenPackId);
  const membershipSubtotal = plan?.price || 0;
  const tokenSubtotal = tokenPack?.price || 0;
  const promoDiscount = Math.min(membershipSubtotal, Math.max(0, Number(draft?.promoDiscount) || 0));
  const total = Math.max(0, membershipSubtotal + tokenSubtotal - promoDiscount);
  const tokenCount = (plan?.bonusTokens || 0) + (tokenPack?.tokens || 0);
  const itemLabels = [];
  if (plan) itemLabels.push(plan.name);
  if (plan?.bonusTokens > 0) itemLabels.push(`Bonus ${plan.bonusTokens} Token PT`);
  if (tokenPack) itemLabels.push(`${tokenPack.tokens} Token PT`);
  return {
    plan,
    tokenPack,
    membershipSubtotal,
    tokenSubtotal,
    promoDiscount,
    total,
    tokenCount,
    itemLabel: itemLabels.join(" + ") || "Belum ada pilihan",
    purchaseType: plan ? "membership" : tokenPack ? "tokens" : null,
  };
}

export function getActiveMembershipRecord(member) {
  // This also synchronizes an expired account into the effective inactive entitlement.
  const entitlement = getMemberPTEntitlement(member);
  const record = readMap(MEMBERSHIP_ACCOUNTS_KEY)[memberKey(member)] || null;
  if (!record || record.status !== "active" || entitlement.membershipStatus !== "active") return null;
  if (record.expiresAt) {
    const expiresAt = Date.parse(record.expiresAt);
    if (Number.isFinite(expiresAt) && expiresAt <= Date.now()) return null;
  }
  return record;
}

export function getMembershipTransactions(member) {
  const all = readMap(MEMBERSHIP_TRANSACTIONS_KEY);
  const key = memberKey(member);
  return Array.isArray(all[key]) ? all[key] : [];
}

/**
 * Complete the locally represented checkout once. This updates the frontend membership
 * entitlement and token balance; it does not charge a real payment method.
 */
export function completeMembershipPurchase(member, paymentMethod) {
  const key = memberKey(member);
  const draft = readMembershipCheckoutDraft(member);
  if (!draft) return null;
  if (draft.status === "paid" && draft.receipt) return draft.receipt;
  if (draft.status !== "payment_pending") return null;

  const { plan, tokenPack, total, tokenCount, itemLabel, membershipSubtotal, tokenSubtotal, promoDiscount } = getMembershipPurchaseSummary(draft);
  const tokenOnly = !plan;
  if (tokenOnly && !tokenPack) return null;

  const currentEntitlement = getMemberPTEntitlement(member);
  // Token-only purchases are allowed only while membership is currently active.
  if (tokenOnly && currentEntitlement.membershipStatus !== "active") return null;
  if (!tokenOnly && !plan) return null;

  const now = new Date();
  let expiresAt = getActiveMembershipRecord(member)?.expiresAt || null;
  if (plan) {
    expiresAt = new Date(now);
    expiresAt.setMonth(expiresAt.getMonth() + 1);
    expiresAt = expiresAt.toISOString();
  }

  const transactionId = `TRX-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const receipt = {
    id: transactionId,
    memberKey: key,
    purchaseType: tokenOnly ? "tokens" : (tokenPack ? "membership_and_tokens" : "membership"),
    planId: plan?.id || null,
    planName: plan?.name || null,
    itemLabel,
    method: paymentMethod || draft.paymentMethod || "QRIS",
    total,
    membershipSubtotal,
    tokenSubtotal,
    promoDiscount,
    tokensAdded: tokenCount,
    status: "success",
    date: now.toISOString(),
    expiresAt,
  };

  // A token-only purchase must not create, renew, or reactivate a membership record.
  const savedEntitlement = saveMemberPTEntitlement(key, {
    membershipStatus: tokenOnly ? currentEntitlement.membershipStatus : "active",
    ptCredits: currentEntitlement.ptCredits + tokenCount,
  });
  if (!savedEntitlement) return null;

  if (plan) {
    const accounts = readMap(MEMBERSHIP_ACCOUNTS_KEY);
    accounts[key] = {
      planId: plan.id,
      planName: plan.name,
      status: "active",
      startedAt: now.toISOString(),
      expiresAt,
      updatedAt: now.toISOString(),
      transactionId,
    };
    if (!writeMap(MEMBERSHIP_ACCOUNTS_KEY, accounts)) return null;
  }

  const transactions = readMap(MEMBERSHIP_TRANSACTIONS_KEY);
  const memberTransactions = Array.isArray(transactions[key]) ? transactions[key] : [];
  transactions[key] = [receipt, ...memberTransactions];
  if (!writeMap(MEMBERSHIP_TRANSACTIONS_KEY, transactions)) return null;

  const savedDraft = saveMembershipCheckoutDraft(member, {
    ...draft,
    status: "paid",
    receipt,
    paymentMethod: receipt.method,
  });
  if (!savedDraft) return null;
  window.dispatchEvent(new CustomEvent(MEMBERSHIP_UPDATED_EVENT, { detail: receipt }));
  return receipt;
}

export function rupiah(amount) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(amount) || 0).replace("IDR", "Rp").replace(/\u00a0/g, " ").trim();
}
