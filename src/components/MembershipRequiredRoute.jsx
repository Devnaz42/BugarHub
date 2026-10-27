import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { readDemoMember } from "../utils/demoData";
import {
  getMemberPTEntitlement,
  MEMBER_PT_ENTITLEMENT_UPDATED_EVENT,
} from "../utils/ptBookingData";

function membershipIsInactive() {
  return getMemberPTEntitlement(readDemoMember()).membershipStatus !== "active";
}

function MembershipLockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="10" width="16" height="11" rx="2.5" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
    </svg>
  );
}

export default function MembershipRequiredRoute({ children }) {
  const navigate = useNavigate();
  const [inactive, setInactive] = useState(membershipIsInactive);

  const refreshMembership = useCallback(() => {
    setInactive(membershipIsInactive());
  }, []);

  useEffect(() => {
    window.addEventListener(MEMBER_PT_ENTITLEMENT_UPDATED_EVENT, refreshMembership);
    window.addEventListener("bugarhub-demo-member-updated", refreshMembership);
    window.addEventListener("storage", refreshMembership);
    return () => {
      window.removeEventListener(MEMBER_PT_ENTITLEMENT_UPDATED_EVENT, refreshMembership);
      window.removeEventListener("bugarhub-demo-member-updated", refreshMembership);
      window.removeEventListener("storage", refreshMembership);
    };
  }, [refreshMembership]);

  if (!inactive) return children;

  const returnToDashboard = () => navigate("/dashboard", { replace: true });

  return (
    <>
      <div aria-hidden="true" className="pointer-events-none select-none">
        {children}
      </div>
      <div
        className="fixed inset-0 z-[200] flex items-end justify-center bg-[#171a1c]/60 p-0 backdrop-blur-[3px] sm:items-center sm:p-5"
        role="presentation"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) returnToDashboard();
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") returnToDashboard();
        }}
      >
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="inactive-membership-title"
          className="relative w-full max-w-[430px] rounded-t-[28px] bg-white px-6 pb-7 pt-6 text-center shadow-2xl sm:rounded-[24px] sm:px-8 sm:py-8"
        >
          <button
            type="button"
            onClick={returnToDashboard}
            aria-label="Tutup pemberitahuan membership"
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-[#858b90] transition hover:bg-[#f3f3f2] hover:text-[#202326]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
          </button>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#fff0e5] text-[#f56600]">
            <MembershipLockIcon />
          </div>
          <h2 id="inactive-membership-title" className="mt-4 text-xl font-extrabold tracking-tight text-[#202326] sm:text-2xl">
            Membership Belum Aktif
          </h2>
          <p className="mx-auto mt-2 max-w-[340px] text-sm leading-6 text-[#737980]">
            Aktifkan membership untuk menggunakan layanan Book PT, Jadwal Kelas, dan Latihan. Kamu tetap dapat melihat riwayat di halaman Jadwal Saya.
          </p>
          <Link
            to="/membership"
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#ff6b00] px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#ed6100] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#ff6b00]/25"
          >
            Lihat Paket Membership
          </Link>
          <button
            type="button"
            onClick={returnToDashboard}
            className="mt-3 inline-flex min-h-10 items-center justify-center rounded-lg px-5 text-sm font-semibold text-[#6c7379] transition hover:bg-[#f7f7f6] hover:text-[#202326]"
          >
            Kembali ke Dashboard
          </button>
        </section>
      </div>
    </>
  );
}
