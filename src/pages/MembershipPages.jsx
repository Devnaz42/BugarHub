import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import MemberHeader from "../components/MemberHeader";
import Logo from "../components/Logo";
import { readDemoMember } from "../utils/demoData";
import { getMemberPTEntitlement, MEMBER_PT_ENTITLEMENT_UPDATED_EVENT } from "../utils/ptBookingData";
import {
  createMembershipCheckoutDraft,
  readMembershipCheckoutDraft,
  saveMembershipCheckoutDraft,
  getMembershipPlan,
  getMembershipPurchaseSummary,
  getActiveMembershipRecord,
  completeMembershipPurchase,
  MEMBERSHIP_PLANS,
  PT_TOKEN_PACKS,
  MEMBERSHIP_UPDATED_EVENT,
  rupiah,
} from "../utils/membershipPurchaseData";

const bankOptions = [
  { id: "BCA", name: "Bank BCA", number: "88012 0000 0000", logo: "BCA" },
  { id: "Mandiri", name: "Bank Mandiri", number: "88013 0000 0000", logo: "M" },
  { id: "BRI", name: "Bank BRI", number: "88014 0000 0000", logo: "BRI" },
  { id: "BNI", name: "Bank BNI", number: "88015 0000 0000", logo: "BNI" },
];

function Icon({ name, className = "h-5 w-5" }) {
  const paths = {
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    back: <><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    token: <><path d="m13 2-9 12h7l-1 8 10-13h-7l0-7Z" /></>,
    calendar: <><rect x="3.5" y="5" width="17" height="15.5" rx="2.2" /><path d="M7.5 3v4M16.5 3v4M3.5 9.5h17" /></>,
    card: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M7 15h4" /></>,
    bank: <><path d="m3 9 9-6 9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 21h18M2 18h20" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    crown: <><path d="m3 8 5 4 4-7 4 7 5-4-2 12H5L3 8Z" /><path d="M5 16h14" /></>,
    dumbbell: <><path d="M4 9v6M8 6v12M16 6v12M20 9v6M8 12h8" /></>,
    shield: <><path d="M12 3 19 6v5c0 4.5-2.8 7.7-7 10-4.2-2.3-7-5.5-7-10V6l7-3Z" /><path d="m9 12 2 2 4-4" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    copy: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" /></>,
    gift: <><rect x="3" y="9" width="18" height="12" rx="2" /><path d="M2 9h20v4H2zM12 9v12M12 9H7.5a2.5 2.5 0 1 1 2.5-2.5V9ZM12 9h4.5A2.5 2.5 0 1 0 14 6.5V9Z" /></>,
    star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />,
    qr: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3h-3zM20 14v3M14 20h4M20 20v.01" /></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>{paths[name] || paths.check}</svg>;
}

function Money({ value, className = "" }) {
  return <span className={className}>{rupiah(value)}</span>;
}

function MembershipFooter() {
  return (
    <footer className="mt-12 rounded-t-[30px] bg-[#111827] text-white sm:mt-16 sm:rounded-t-[36px]">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-6 px-5 py-8 sm:px-8 sm:py-10 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Logo tone="light" />
          <h2 className="mt-5 text-xl font-extrabold sm:text-2xl">Hubungi Admin &amp; Pendaftaran</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/65">Tanya membership, cek jadwal kelas, atau temukan teman latihan baru di kanal resmi BugarHub.</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm font-semibold sm:min-w-[380px]">
          {[["◉", "WhatsApp"], ["◎", "Instagram"], ["♪", "TikTok"], ["▷", "YouTube"]].map(([symbol, label]) => (
            <span key={label} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5"><span className="font-black text-[#ff6b00]">{symbol}</span>{label} <span className="text-white/45">↗</span></span>
          ))}
        </div>
      </div>
      <p className="pb-5 text-center text-xs text-white/45">© 2026 BugarHub. Bergerak lebih kuat, setiap hari.</p>
    </footer>
  );
}

function MembershipShell({ children, compact = false }) {
  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#18212f]">
      <MemberHeader />
      <main className={`mx-auto max-w-[1180px] px-4 py-6 sm:px-7 sm:py-9 lg:px-8 ${compact ? "min-h-[68vh]" : "min-h-[58vh]"}`}>
        {children}
      </main>
      <MembershipFooter />
    </div>
  );
}

function Breadcrumb({ current, onBack }) {
  return (
    <div className="mb-5 flex flex-wrap items-center gap-2 text-xs font-medium text-[#7d8794] sm:text-sm">
      {onBack ? <button type="button" onClick={onBack} className="inline-flex items-center gap-2 transition hover:text-[#f56600]"><Icon name="back" className="h-4 w-4" /> Kembali</button> : <Link to="/dashboard" className="transition hover:text-[#f56600]">Dashboard</Link>}
      <span aria-hidden="true">›</span>
      {onBack ? <Link to="/membership" className="hover:text-[#f56600]">Membership &amp; Token PT</Link> : <span>Layanan</span>}
      {!onBack && <><span aria-hidden="true">›</span><span className="text-[#f56600]">{current}</span></>}
      {onBack && <><span aria-hidden="true">›</span><span className="text-[#f56600]">{current}</span></>}
    </div>
  );
}

function getSelectionDraft(member, membershipActive) {
  const existing = readMembershipCheckoutDraft(member);
  // Preserve an in-progress checkout. Payment validation runs again before completion.
  if (existing && existing.status === "payment_pending") return existing;

  if (existing?.status === "selecting") {
    // Plans and token packs are selected independently. Older drafts that used a purchase
    // mode are normalized to the new selection model.
    const planId = existing.planId || null;
    const tokenPackId = membershipActive || planId ? existing.tokenPackId || null : null;
    return {
      ...existing,
      planId,
      tokenPackId,
      purchaseType: planId ? "membership" : membershipActive ? "tokens" : "membership",
      promoCode: planId ? existing.promoCode || "" : "",
      promoDiscount: planId ? Number(existing.promoDiscount) || 0 : 0,
      promoApplied: Boolean(planId && existing.promoApplied),
    };
  }

  // Start with no items selected; the member chooses packages and token packs directly.
  return createMembershipCheckoutDraft(member, {
    planId: null,
    purchaseType: membershipActive ? "tokens" : "membership",
    tokenPackId: null,
  });
}

export function MembershipPage() {
  const member = useMemo(() => readDemoMember(), []);
  const [entitlement, setEntitlement] = useState(() => getMemberPTEntitlement(member));
  const [draft, setDraft] = useState(() => getSelectionDraft(member, getMemberPTEntitlement(member).membershipStatus === "active"));
  const [activeMembership, setActiveMembership] = useState(() => getActiveMembershipRecord(member));
  const [selectionNotice, setSelectionNotice] = useState("");
  const navigate = useNavigate();
  const summary = getMembershipPurchaseSummary(draft);
  const membershipActive = entitlement.membershipStatus === "active";
  const tokenOnlySelection = membershipActive && !draft.planId && Boolean(draft.tokenPackId);
  const canContinue = summary.total > 0 && (membershipActive
    ? Boolean(draft.planId || draft.tokenPackId)
    : Boolean(draft.planId));

  useEffect(() => {
    const refresh = () => {
      const nextEntitlement = getMemberPTEntitlement(member);
      setEntitlement(nextEntitlement);
      setActiveMembership(getActiveMembershipRecord(member));
      if (nextEntitlement.membershipStatus !== "active") {
        setDraft((current) => {
          // A non-active member may keep a selected membership plan, but cannot keep a
          // token-only selection after the entitlement expires.
          if (current.planId || !current.tokenPackId) return current;
          const next = { ...current, purchaseType: "membership", tokenPackId: null, status: "selecting", receipt: null };
          saveMembershipCheckoutDraft(member, next);
          return next;
        });
      }
    };
    window.addEventListener(MEMBER_PT_ENTITLEMENT_UPDATED_EVENT, refresh);
    window.addEventListener(MEMBERSHIP_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    window.addEventListener("bugarhub-demo-member-updated", refresh);
    return () => {
      window.removeEventListener(MEMBER_PT_ENTITLEMENT_UPDATED_EVENT, refresh);
      window.removeEventListener(MEMBERSHIP_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
      window.removeEventListener("bugarhub-demo-member-updated", refresh);
    };
  }, [member]);

  function updateDraft(changes) {
    const next = { ...draft, ...changes, status: "selecting", receipt: null };
    if (next.planId) {
      next.purchaseType = "membership";
    } else {
      next.purchaseType = membershipActive ? "tokens" : "membership";
      if (!membershipActive) next.tokenPackId = null;
    }
    if (Object.hasOwn(changes, "planId")) {
      next.promoCode = "";
      next.promoDiscount = 0;
      next.promoApplied = false;
    }
    setDraft(next);
    saveMembershipCheckoutDraft(member, next);
    setSelectionNotice("");
  }

  function selectMembershipPlan(planId) {
    const nextPlanId = draft.planId === planId ? null : planId;
    updateDraft({
      planId: nextPlanId,
      // Non-active members must keep a plan selected before they can select token packs.
      ...(!membershipActive && !nextPlanId ? { tokenPackId: null } : {}),
    });
  }

  function selectTokenPack(packId) {
    if (!membershipActive && !draft.planId) {
      setSelectionNotice("Pilih paket membership terlebih dahulu agar Token PT dapat dibeli bersama paket tersebut.");
      return;
    }
    updateDraft({ tokenPackId: draft.tokenPackId === packId ? null : packId });
  }

  function continueToPayment() {
    const currentEntitlement = getMemberPTEntitlement(member);
    const currentMembershipActive = currentEntitlement.membershipStatus === "active";

    if (!draft.planId && !draft.tokenPackId) {
      setSelectionNotice("Pilih paket membership dan/atau paket Token PT terlebih dahulu.");
      return;
    }
    if (!currentMembershipActive && !draft.planId) {
      setSelectionNotice("Membership tidak aktif atau sudah berakhir. Pilih paket membership terlebih dahulu sebelum membeli Token PT.");
      return;
    }
    const nextType = draft.planId ? "membership" : "tokens";
    const next = { ...draft, purchaseType: nextType, status: "payment_pending", receipt: null };
    saveMembershipCheckoutDraft(member, next);
    navigate("/membership/payment");
  }

  return (
    <MembershipShell>
      <Breadcrumb current="Membership & Token PT" />
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#f56600]">Membership &amp; token latihan</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Pilih Paket &amp; Token PT</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#748092] sm:text-base">Atur akses gym dan saldo sesi Personal Trainer sesuai kebutuhan latihanmu.</p>
        </div>
        <span className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-xs font-bold ${membershipActive ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>
          <span className={`h-2 w-2 rounded-full ${membershipActive ? "bg-emerald-500" : "bg-amber-500"}`} />
          Membership {membershipActive ? "Aktif" : "Nonaktif"}
        </span>
      </div>

      <section className="mt-6 flex flex-col gap-3 rounded-2xl bg-[#ff6b00] p-4 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15"><Icon name="token" className="h-6 w-6" /></span>
          <div><p className="text-xs font-semibold text-white/75">Saldo Token PT</p><p className="mt-0.5 text-xl font-black">{entitlement.ptCredits} Sesi</p></div>
        </div>
        <div className="text-sm font-medium text-white/90">
          {activeMembership?.planName ? `Paket saat ini: ${activeMembership.planName}` : membershipActive ? "Membership aktif · token dapat dibeli secara terpisah." : "Pilih paket membership untuk mengaktifkan layanan dan membeli token PT."}
        </div>
      </section>


      {!membershipActive && (
        <div className="mt-6 rounded-2xl border border-[#f4c4a2] bg-[#fff7f0] p-4 text-sm leading-6 text-[#99501d]">
          Membership harus aktif untuk membeli Token PT saja. Pilih paket membership di bawah; setelah paket dipilih, kamu juga boleh menambahkan Token PT dalam transaksi yang sama.
        </div>
      )}

      {tokenOnlySelection && (
        <div className="mt-5 rounded-xl bg-[#f0fbf5] px-4 py-3 text-sm text-[#176344]">Pembelian ini hanya menambah saldo Token PT. Paket dan masa berlaku membership tidak akan berubah.</div>
      )}

      <section className="mt-8">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div><h2 className="text-xl font-extrabold sm:text-2xl">Token PT</h2><p className="mt-1 text-sm text-[#7c8796]">Pilih token tambahan untuk menambah sesi latihan.</p></div>
          {draft.tokenPackId && <button type="button" onClick={() => updateDraft({ tokenPackId: null })} className="text-xs font-bold text-[#f56600] hover:underline">Batalkan pilihan token</button>}
        </div>
        {!membershipActive && !draft.planId && <p className="mb-3 text-xs text-[#9a5b2d]">Paket token akan tersedia setelah kamu memilih paket membership.</p>}
        <div className="grid gap-3 sm:grid-cols-3">
          {PT_TOKEN_PACKS.map((pack) => {
            const selected = draft.tokenPackId === pack.id;
            const tokenLocked = !membershipActive && !draft.planId;
            return (
              <button key={pack.id} type="button" disabled={tokenLocked} aria-pressed={selected} onClick={() => selectTokenPack(pack.id)} className={`relative rounded-2xl border bg-white p-4 text-left transition ${tokenLocked ? "cursor-not-allowed border-[#e1e6eb] opacity-50" : "hover:-translate-y-0.5 hover:shadow-md"} ${selected ? "border-2 border-[#ff6b00] bg-[#fff7f0]" : pack.featured ? "border-[#ffb77e]" : "border-[#e1e6eb]"}`}>
                {pack.featured && <span className="absolute right-3 top-3 rounded-full bg-[#fff0e5] px-2.5 py-1 text-[10px] font-extrabold text-[#f56600]">Popular</span>}
                <Icon name="token" className="h-5 w-5 text-[#ff6b00]" />
                <p className="mt-3 text-base font-extrabold">{pack.name}</p>
                <p className="mt-1 text-xs text-[#7c8796]">{pack.description}</p>
                <div className="mt-3 flex items-center justify-between gap-2"><span className="text-lg font-black text-[#f56600]">{rupiah(pack.price)}</span><span className={`flex h-5 w-5 items-center justify-center rounded-full border ${selected ? "border-[#ff6b00] bg-[#ff6b00] text-white" : "border-[#d7dde4] text-transparent"}`}><Icon name="check" className="h-3 w-3" /></span></div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-9">
          <div className="mb-4"><h2 className="text-xl font-extrabold sm:text-2xl">Pilih Paket Membership</h2><p className="mt-1 text-sm text-[#7c8796]">Paket dihitung per bulan. Token bonus akan ditambahkan setelah konfirmasi pembayaran.</p></div>
          <div className="grid items-stretch gap-3 lg:grid-cols-3">
            {MEMBERSHIP_PLANS.map((plan) => {
              const selected = draft.planId === plan.id;
              return (
                <button key={plan.id} type="button" aria-pressed={selected} onClick={() => selectMembershipPlan(plan.id)} className={`relative flex h-full flex-col rounded-[22px] border p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md sm:p-6 ${selected ? "border-2 border-[#ff6b00] bg-[#fff7f0] shadow-[0_10px_25px_rgba(255,107,0,0.08)]" : "border-[#e2e7ec] bg-white"}`}>
                  {plan.featured && <span className="absolute right-4 top-4 rounded-full bg-[#ff6b00] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white">Pilihan populer</span>}
                  <div className="flex items-start gap-3 pr-1"><span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${selected ? "bg-[#ff6b00] text-white" : "bg-[#fff0e5] text-[#f56600]"}`}><Icon name={plan.icon} /></span><div className="min-w-0 flex-1"><h3 className="text-lg font-extrabold">{plan.name}</h3><p className="mt-1 text-xs leading-5 text-[#7c8796]">{plan.description}</p></div><span className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${selected ? "border-[#ff6b00] bg-[#ff6b00] text-white" : "border-[#cbd3dc] text-transparent"}`}><Icon name="check" className="h-3 w-3" /></span></div>
                  <div className="mt-5 flex items-baseline gap-1"><span className="text-sm font-bold">Rp</span><span className="text-3xl font-black tracking-tight">{new Intl.NumberFormat("id-ID").format(plan.price)}</span><span className="text-sm text-[#7c8796]">/bln</span></div>
                  <div className="mt-5 flex-1 space-y-2.5">{plan.features.map((feature) => <div key={feature} className="flex items-start gap-2 text-sm text-[#384454]"><span className="mt-0.5 font-black text-[#ff6b00]">✓</span><span>{feature}</span></div>)}</div>
                </button>
              );
            })}
          </div>
      </section>

      {selectionNotice && <p role="alert" className="mt-5 rounded-xl border border-[#fed7aa] bg-[#fff7ed] px-4 py-3 text-sm text-[#9a3412]">{selectionNotice}</p>}

      <section className="mt-8 rounded-2xl border border-[#f1d2bd] bg-white p-4 shadow-sm sm:flex sm:items-center sm:justify-between sm:px-6 sm:py-5">
        <div><p className="text-xs font-bold uppercase tracking-wider text-[#7c8796]">Ringkasan pilihan</p><p className="mt-1 font-extrabold">{summary.itemLabel}</p><p className="mt-1 text-xs text-[#7c8796]">{summary.tokenCount > 0 ? `${summary.tokenCount} token PT akan ditambahkan setelah pembayaran berhasil.` : "Tidak ada token PT tambahan pada pilihan ini."}{tokenOnlySelection ? " Masa membership tidak berubah." : ""}</p></div>
        <div className="mt-4 flex items-center justify-between gap-4 sm:mt-0 sm:justify-end"><div className="sm:text-right"><p className="text-xs text-[#7c8796]">Total pembayaran</p><p className="text-2xl font-black text-[#f56600]">{rupiah(summary.total)}</p></div><button type="button" disabled={!canContinue} onClick={continueToPayment} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#ff6b00] px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#ed6100] disabled:cursor-not-allowed disabled:bg-[#cbd5e1]">Lanjut Pembayaran <Icon name="arrow" className="h-4 w-4" /></button></div>
      </section>
      {!canContinue && <p className="mt-2 text-right text-xs text-[#7c8796]">{!membershipActive && !draft.planId ? "Pilih paket membership terlebih dahulu untuk melanjutkan." : "Pilih setidaknya satu paket membership atau Token PT untuk melanjutkan."}</p>}
    </MembershipShell>
  );
}

function OrderSummary({ draft }) {
  const summary = getMembershipPurchaseSummary(draft);
  return (
    <section className="rounded-2xl border border-[#e0e5eb] bg-white p-5 sm:p-6">
      <p className="text-sm font-semibold text-[#788391]">Ringkasan Pesanan</p>
      <h2 className="mt-3 text-lg font-extrabold">{summary.plan ? `${summary.plan.name}${summary.plan.bonusTokens ? ` + Bonus ${summary.plan.bonusTokens} Token PT` : ""}` : summary.tokenPack ? `${summary.tokenPack.name} Token PT` : "Belum ada pilihan"}</h2>
      {summary.plan && <p className="mt-1 text-sm text-[#697789]">Membership aktif selama satu bulan setelah pembayaran selesai.</p>}
      {summary.tokenPack && summary.plan && <p className="mt-1 text-sm text-[#697789]">Tambahan {summary.tokenPack.tokens} Token PT</p>}
      {summary.tokenPack && !summary.plan && <p className="mt-1 text-sm text-[#697789]">Pembelian token saja. Masa berlaku membership tidak berubah.</p>}
      <div className="mt-5 flex flex-wrap items-end justify-between gap-3 border-t border-[#edf0f3] pt-4"><span className="text-sm text-[#7b8593]">Total Pembayaran</span><Money value={summary.total} className="text-2xl font-black text-[#f56600] sm:text-3xl" /></div>
      {(summary.plan && summary.tokenPack || summary.promoDiscount > 0) && <div className="mt-3 space-y-1 text-xs text-[#7b8593]">{summary.plan && <div className="flex justify-between gap-3"><span>Harga membership</span><Money value={summary.membershipSubtotal} /></div>}{summary.tokenPack && <div className="flex justify-between gap-3"><span>{summary.tokenPack.name}</span><Money value={summary.tokenSubtotal} /></div>}{summary.promoDiscount > 0 && <div className="flex justify-between gap-3 text-emerald-700"><span>Diskon promo</span><Money value={-summary.promoDiscount} /></div>}</div>}
    </section>
  );
}

export function MembershipPaymentPage() {
  const member = useMemo(() => readDemoMember(), []);
  const navigate = useNavigate();
  const storedDraft = readMembershipCheckoutDraft(member);
  const [draft, setDraft] = useState(storedDraft);
  const [promoCode, setPromoCode] = useState(storedDraft?.promoCode || "");
  const [promoMessage, setPromoMessage] = useState("");
  const [method, setMethod] = useState(storedDraft?.paymentMethod || "QRIS");

  const tokenOnlyDraft = draft && !draft.planId && Boolean(draft.tokenPackId);
  const tokenOnlyAllowed = tokenOnlyDraft && getMemberPTEntitlement(member).membershipStatus === "active";
  if (!draft || (!draft.planId && !draft.tokenPackId) || draft.status === "paid" || (tokenOnlyDraft && !tokenOnlyAllowed)) return <Navigate to="/membership" replace />;

  const summary = getMembershipPurchaseSummary(draft);
  function updateMethod(nextMethod) {
    setMethod(nextMethod);
    const next = { ...draft, paymentMethod: nextMethod };
    setDraft(next);
    saveMembershipCheckoutDraft(member, next);
  }
  function applyPromo() {
    const normalized = promoCode.trim().toUpperCase();
    if (!draft.planId) {
      setPromoMessage("Kode promo hanya berlaku untuk pembelian paket membership.");
      return;
    }
    if (normalized === "BUGAR10") {
      const selectedPlan = getMembershipPlan(draft.planId);
      const discount = Math.round((selectedPlan?.price || 0) * 0.1);
      const next = { ...draft, promoCode: normalized, promoDiscount: discount, promoApplied: true };
      setDraft(next);
      saveMembershipCheckoutDraft(member, next);
      setPromoMessage("Kode promo berhasil diterapkan.");
    } else {
      const next = { ...draft, promoCode: normalized, promoDiscount: 0, promoApplied: false };
      setDraft(next);
      saveMembershipCheckoutDraft(member, next);
      setPromoMessage(normalized ? "Kode promo tidak valid." : "Masukkan kode promo terlebih dahulu.");
    }
  }
  function startPayment() {
    const next = { ...draft, paymentMethod: method, status: "payment_pending", receipt: null };
    saveMembershipCheckoutDraft(member, next);
    navigate(method === "QRIS" ? "/membership/payment/qris" : "/membership/payment/va");
  }

  return (
    <MembershipShell compact>
      <Breadcrumb current="Pembayaran" onBack={() => navigate("/membership")} />
      <div className="mx-auto max-w-[840px]">
        <h1 className="mb-5 text-3xl font-black tracking-tight sm:text-4xl">Pembayaran</h1>
        <OrderSummary draft={draft} />
        <section className="mt-6">
          <h2 className="mb-3 text-lg font-extrabold">Metode Pembayaran</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[{ id: "QRIS", icon: "qr", label: "QRIS", description: "Pindai menggunakan aplikasi pembayaran" }, { id: "VA", icon: "bank", label: "Virtual Account", description: "Transfer melalui bank pilihan" }].map((item) => (
              <button key={item.id} type="button" aria-pressed={method === item.id} onClick={() => updateMethod(item.id)} className={`flex items-center gap-3 rounded-xl border bg-white p-4 text-left transition ${method === item.id ? "border-2 border-[#ff6b00] bg-[#fff8f2]" : "border-[#e1e6eb] hover:border-[#ffc49e]"}`}>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff0e5] text-[#f56600]"><Icon name={item.icon} /></span><span className="min-w-0 flex-1"><span className="block font-extrabold">{item.label}</span><span className="mt-1 block text-xs text-[#7b8593]">{item.description}</span></span><span className={`flex h-5 w-5 items-center justify-center rounded-full border ${method === item.id ? "border-[#ff6b00]" : "border-[#ccd3dc]"}`}>{method === item.id && <span className="h-2.5 w-2.5 rounded-full bg-[#ff6b00]" />}</span>
              </button>
            ))}
          </div>
        </section>
        <section className="mt-6 rounded-2xl border border-[#e1e6eb] bg-white p-4 sm:p-5">
          <label htmlFor="membership-promo" className="text-sm font-bold">Kode Promo</label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row"><input id="membership-promo" value={promoCode} onChange={(event) => setPromoCode(event.target.value)} placeholder={draft.planId ? "Masukkan Kode Promo" : "Promo hanya untuk paket membership"} disabled={!draft.planId} className="min-h-11 min-w-0 flex-1 rounded-xl border border-[#dfe4ea] px-4 text-sm outline-none transition focus:border-[#ff6b00] focus:ring-4 focus:ring-[#ff6b00]/10 disabled:cursor-not-allowed disabled:bg-[#f4f6f8]" /><button type="button" onClick={applyPromo} disabled={!draft.planId} className="min-h-11 rounded-full border border-[#ff6b00] px-5 text-sm font-extrabold text-[#f56600] transition hover:bg-[#fff0e5] disabled:cursor-not-allowed disabled:opacity-50">Gunakan</button></div>
          {promoMessage && <p role="status" className={`mt-2 text-xs ${promoMessage.includes("berhasil") ? "text-emerald-700" : "text-rose-600"}`}>{promoMessage}</p>}
          <p className="mt-4 flex items-center justify-center gap-2 text-xs text-[#7b8593]"><Icon name="shield" className="h-4 w-4" /> Pembayaran aman &amp; terverifikasi</p>
        </section>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between"><button type="button" onClick={() => navigate("/membership")} className="min-h-11 rounded-full border border-[#dfe4ea] px-5 text-sm font-bold text-[#5f6b7a] transition hover:bg-white">Kembali pilih paket</button><div className="flex items-center justify-between gap-4 sm:justify-end"><div className="text-right"><p className="text-xs text-[#7b8593]">Total Pembayaran</p><p className="text-xl font-black text-[#f56600]">{rupiah(summary.total)}</p></div><button type="button" onClick={startPayment} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#ff6b00] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#ed6100]">Bayar Sekarang <Icon name="arrow" className="h-4 w-4" /></button></div></div>
      </div>
    </MembershipShell>
  );
}

function QrIllustration() {
  const size = 29;
  function inFinder(row, col, top, left) {
    const r = row - top;
    const c = col - left;
    if (r < 0 || r > 6 || c < 0 || c > 6) return null;
    return r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4);
  }
  const cells = [];
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      const finder = inFinder(row, col, 0, 0) ?? inFinder(row, col, 0, size - 7) ?? inFinder(row, col, size - 7, 0);
      const filled = finder === null ? ((row * 31 + col * 17 + (row * col) % 13) % 7 < 3) : finder;
      cells.push(<span key={`${row}-${col}`} className={filled ? "bg-[#151b28]" : "bg-white"} />);
    }
  }
  return <div aria-label="Ilustrasi QRIS" role="img" className="mx-auto grid aspect-square w-[220px] gap-[2px] rounded-lg border-8 border-white bg-white p-1 shadow-sm sm:w-[250px]" style={{ gridTemplateColumns: "repeat(29, minmax(0, 1fr))" }}>{cells}</div>;
}

function requirePendingPayment(member) {
  const draft = readMembershipCheckoutDraft(member);
  if (!draft || (!draft.planId && !draft.tokenPackId)) return null;
  const tokenOnlyDraft = !draft.planId && Boolean(draft.tokenPackId);
  if (tokenOnlyDraft && getMemberPTEntitlement(member).membershipStatus !== "active") return null;
  return draft.status === "payment_pending" || (draft.status === "paid" && draft.receipt) ? draft : null;
}

export function MembershipQrisPage() {
  const member = useMemo(() => readDemoMember(), []);
  const navigate = useNavigate();
  const draft = requirePendingPayment(member);
  const summary = draft ? getMembershipPurchaseSummary(draft) : null;
  if (!draft) return <Navigate to="/membership" replace />;
  if (draft.status === "paid") return <Navigate to="/membership/success" replace />;
  const confirmPayment = () => navigate("/membership/success");

  return (
    <MembershipShell compact>
      <Breadcrumb current="Pembayaran QRIS" onBack={() => navigate("/membership/payment")} />
      <div className="mx-auto max-w-[800px]">
        <h1 className="mb-5 text-3xl font-black tracking-tight sm:text-4xl">Pembayaran QRIS</h1>
        <OrderSummary draft={draft} />
        <section className="mt-5 rounded-2xl border border-[#e1e6eb] bg-white p-5 text-center sm:p-7">
          <div className="mx-auto flex max-w-[460px] flex-col items-center"><QrIllustration /><p className="mt-5 text-sm leading-6 text-[#364152]">Pindai QRIS menggunakan GoPay, OVO, ShopeePay, atau Mobile Banking.</p><span className="mt-3 rounded-full bg-[#fff0e5] px-4 py-2 text-xs font-bold text-[#f56600]">Menunggu konfirmasi pembayaran</span><p className="mt-3 text-xs leading-5 text-[#8a95a3]">Kode QR dan status transaksi akan dihubungkan ke penyedia pembayaran pada tahap integrasi.</p></div>
        </section>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row"><button type="button" onClick={() => navigate("/membership/payment")} className="min-h-12 flex-1 rounded-full border border-[#dfe4ea] bg-white px-5 py-3 text-sm font-bold text-[#5f6b7a] transition hover:bg-[#f9fafb]">Kembali</button><button type="button" onClick={confirmPayment} className="min-h-12 flex-1 rounded-full bg-[#ff6b00] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#ed6100]">Cek Status Pembayaran</button></div>
      </div>
    </MembershipShell>
  );
}

export function MembershipVirtualAccountPage() {
  const member = useMemo(() => readDemoMember(), []);
  const navigate = useNavigate();
  const draft = requirePendingPayment(member);
  const [bank, setBank] = useState("BCA");
  const [copied, setCopied] = useState(false);
  const [instructionsOpen, setInstructionsOpen] = useState(true);
  if (!draft) return <Navigate to="/membership" replace />;
  if (draft.status === "paid") return <Navigate to="/membership/success" replace />;
  const summary = getMembershipPurchaseSummary(draft);
  const selectedBank = bankOptions.find((item) => item.id === bank) || bankOptions[0];

  async function copyVa() {
    try {
      await navigator.clipboard.writeText(selectedBank.number);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <MembershipShell compact>
      <Breadcrumb current="Pembayaran VA" onBack={() => navigate("/membership/payment")} />
      <div className="mx-auto max-w-[800px]">
        <h1 className="mb-5 text-3xl font-black tracking-tight sm:text-4xl">Pembayaran Virtual Account</h1>
        <OrderSummary draft={draft} />
        <section className="mt-5">
          <h2 className="mb-3 text-base font-extrabold">Pilih Bank</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{bankOptions.map((option) => <button key={option.id} type="button" aria-pressed={bank === option.id} onClick={() => { setBank(option.id); setCopied(false); }} className={`min-h-11 rounded-full border px-3 py-2 text-sm font-bold transition ${bank === option.id ? "border-[#ff6b00] bg-[#ff6b00] text-white" : "border-[#dfe4ea] bg-white text-[#4f5c6d] hover:border-[#ffc49e]"}`}>{option.name}</button>)}</div>
        </section>
        <section className="mt-4 rounded-2xl border border-[#e1e6eb] bg-white p-5 sm:p-6">
          <p className="text-sm font-semibold text-[#788391]">Nomor Virtual Account {selectedBank.id}</p>
          <p className="mt-3 text-2xl font-black tracking-wider text-[#172033] sm:text-3xl">{selectedBank.number}</p>
          <button type="button" onClick={copyVa} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-full bg-[#fff0e5] px-4 py-2 text-sm font-extrabold text-[#f56600] transition hover:bg-[#ffe5d1]"><Icon name="copy" className="h-4 w-4" />{copied ? "Tersalin" : "Salin VA"}</button>
          <p className="mt-2 text-xs leading-5 text-[#8a95a3]">Nomor di atas merupakan format tampilan dan belum terhubung ke rekening pembayaran.</p>
          <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#edf0f3] pt-4"><span className="text-sm text-[#7b8593]">Total Pembayaran</span><Money value={summary.total} className="text-2xl font-black text-[#f56600]" /></div>
        </section>
        <section className="mt-4 overflow-hidden rounded-2xl border border-[#e1e6eb] bg-white">
          <button type="button" aria-expanded={instructionsOpen} onClick={() => setInstructionsOpen((open) => !open)} className="flex min-h-12 w-full items-center justify-between gap-3 px-5 py-4 text-left font-extrabold"><span>Petunjuk Pembayaran ATM &amp; m-Banking</span><span className={`text-[#7b8593] transition-transform ${instructionsOpen ? "rotate-180" : ""}`}>⌃</span></button>
          {instructionsOpen && <ol className="space-y-2 px-5 pb-5 text-sm leading-6 text-[#6d7989]"><li>1. Pilih menu Transfer atau Virtual Account pada aplikasi bank.</li><li>2. Masukkan nomor Virtual Account dan periksa total tagihan.</li><li>3. Konfirmasi transaksi setelah kanal pembayaran BugarHub tersedia.</li></ol>}
        </section>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row"><button type="button" onClick={() => navigate("/membership/payment")} className="min-h-12 flex-1 rounded-full border border-[#dfe4ea] bg-white px-5 py-3 text-sm font-bold text-[#5f6b7a] transition hover:bg-[#f9fafb]">Kembali</button><button type="button" onClick={() => navigate("/membership/success")} className="min-h-12 flex-1 rounded-full bg-[#ff6b00] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#ed6100]">Saya Sudah Bayar</button></div>
      </div>
    </MembershipShell>
  );
}

export function MembershipSuccessPage() {
  const member = useMemo(() => readDemoMember(), []);
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState(() => readMembershipCheckoutDraft(member)?.receipt || null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const saved = completeMembershipPurchase(member, readMembershipCheckoutDraft(member)?.paymentMethod || "QRIS");
    if (saved) setReceipt(saved);
    else setFailed(true);
  }, [member]);

  if (!receipt && !failed) return <MembershipShell compact><div className="mx-auto max-w-[640px] py-16 text-center text-[#64748b]">Memeriksa status pembayaran…</div></MembershipShell>;
  if (!receipt) return <Navigate to="/membership/payment" replace />;
  const plan = getMembershipPlan(receipt.planId);
  const tokenOnlyPurchase = !plan && receipt.purchaseType === "tokens";

  return (
    <MembershipShell compact>
      <Breadcrumb current="Pembayaran Berhasil" />
      <div className="mx-auto max-w-[700px] py-2 text-center sm:py-6">
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#e4f8ee] text-[#13a66a]"><svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 4.5 4.5L19 7" /></svg></span>
        <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">Pembayaran Berhasil!</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#6f7b8b] sm:text-base">{tokenOnlyPurchase ? "Token PT telah ditambahkan ke saldo sesi. Masa berlaku membership aktifmu tidak berubah." : `Paket ${plan?.name || "membership"} dan token PT yang termasuk dalam pesanan telah diaktifkan pada akunmu.`}</p>
        <section className="mt-7 rounded-2xl border border-[#e1e6eb] bg-white p-5 text-left sm:p-6">
          <dl className="space-y-4 text-sm"><div className="flex items-start justify-between gap-4"><dt className="text-[#7b8593]">Transaction ID</dt><dd className="break-all text-right font-extrabold">#{receipt.id}</dd></div><div className="flex items-start justify-between gap-4"><dt className="text-[#7b8593]">Paket</dt><dd className="text-right font-bold">{receipt.itemLabel}</dd></div><div className="flex items-start justify-between gap-4"><dt className="text-[#7b8593]">Metode</dt><dd className="font-bold">{receipt.method === "VA" ? "Virtual Account" : "QRIS"}</dd></div><div className="flex items-start justify-between gap-4"><dt className="text-[#7b8593]">Total</dt><dd className="text-right text-xl font-black text-[#f56600]">{rupiah(receipt.total)}</dd></div><div className="flex items-start justify-between gap-4"><dt className="text-[#7b8593]">Tanggal</dt><dd className="text-right font-bold">{new Date(receipt.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}</dd></div><div className="flex items-start justify-between gap-4"><dt className="text-[#7b8593]">Token ditambahkan</dt><dd className="font-bold text-emerald-700">+{receipt.tokensAdded} sesi</dd></div></dl>
        </section>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row"><button type="button" onClick={() => navigate("/book-pt")} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#ff6b00] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#ed6100]">Mulai Booking PT <Icon name="arrow" className="h-4 w-4" /></button><button type="button" onClick={() => navigate("/dashboard")} className="min-h-12 flex-1 rounded-full border border-[#ff6b00] bg-white px-5 py-3 text-sm font-extrabold text-[#f56600] transition hover:bg-[#fff7f0]">Kembali ke Dashboard</button></div>
        <p className="mt-4 text-xs leading-5 text-[#8a95a3]">Status ini memperbarui data lokal pada aplikasi. Pemrosesan pembayaran nyata membutuhkan integrasi penyedia pembayaran.</p>
      </div>
    </MembershipShell>
  );
}
