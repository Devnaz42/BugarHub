import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import heroImage from "../assets/hero.png";
import MemberHeader from "../components/MemberHeader";
import { readDemoMember } from "../utils/demoData";
import { getMemberPTEntitlement, MEMBER_PT_ENTITLEMENT_UPDATED_EVENT } from "../utils/ptBookingData";
import { getActiveMembershipRecord, MEMBERSHIP_UPDATED_EVENT } from "../utils/membershipPurchaseData";

function Icon({ name, className = "h-5 w-5" }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  const paths = {
    calendar: <><rect x="3.5" y="5" width="17" height="15.5" rx="2.2" /><path d="M7.5 3v4M16.5 3v4M3.5 9.5h17M8 13h.01M12 13h.01M16 13h.01M8 16.5h.01M12 16.5h.01" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>,
    user: <><circle cx="12" cy="8" r="3.4" /><path d="M5 20c.4-3.5 2.9-5.4 7-5.4s6.6 1.9 7 5.4" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    chevron: <path d="m9 5 7 7-7 7" />,
    bolt: <path d="m13 2-9 12h7l-1 8 10-13h-7l0-7Z" />,
    dumbbell: <><path d="m6 9-3 3 3 3M18 9l3 3-3 3M9 5 5 9M19 15l-4 4M8 8l8 8M5 15l4 4M15 5l4 4" /></>,
    home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z" /></>,
  };

  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...common}>
      {paths[name] || paths.arrow}
    </svg>
  );
}

function MemberDashboard() {
  const [member] = useState(readDemoMember);
  const [membership, setMembership] = useState(() => getMemberPTEntitlement(member));
  const [activeMembership, setActiveMembership] = useState(() => getActiveMembershipRecord(member));
  const firstName = member.name.split(/\s+/)[0] || "Member";

  useEffect(() => {
    const refreshMembership = () => {
      setMembership(getMemberPTEntitlement(member));
      setActiveMembership(getActiveMembershipRecord(member));
    };
    window.addEventListener(MEMBER_PT_ENTITLEMENT_UPDATED_EVENT, refreshMembership);
    window.addEventListener(MEMBERSHIP_UPDATED_EVENT, refreshMembership);
    window.addEventListener("storage", refreshMembership);
    return () => {
      window.removeEventListener(MEMBER_PT_ENTITLEMENT_UPDATED_EVENT, refreshMembership);
      window.removeEventListener(MEMBERSHIP_UPDATED_EVENT, refreshMembership);
      window.removeEventListener("storage", refreshMembership);
    };
  }, [member]);
  return (
    <main className="min-h-screen bg-[#f6f7f8] text-[#202326]">
      <MemberHeader />

      <div className="mx-auto max-w-[1440px] px-5 pb-14 pt-7 sm:px-8 sm:pt-9 lg:px-10 lg:pt-10 xl:px-14">
        <section className="relative isolate overflow-hidden rounded-[28px] border border-[#ffd1af] bg-gradient-to-r from-[#fff5ec] via-[#ffeadb] to-[#ffe0c8] px-6 py-7 shadow-sm sm:rounded-[34px] sm:px-9 sm:py-9 lg:min-h-[300px] lg:px-12 lg:py-10 xl:min-h-[330px] xl:px-14">
          <div className="absolute -right-16 -top-20 -z-10 h-64 w-64 rounded-full bg-[#ffb67b]/25 sm:h-80 sm:w-80" />
          <div className="absolute -bottom-28 right-24 -z-10 h-56 w-56 rounded-full bg-white/35 blur-2xl" />
          <div className="relative z-10 max-w-3xl lg:max-w-[68%] xl:max-w-[65%]">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-[#f56600] sm:text-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff6b00]" />
              Senin, 19 Oktober
            </p>
            <h1 className="mt-5 max-w-3xl text-3xl font-black leading-[1.08] tracking-tight sm:text-4xl lg:text-5xl xl:text-[3.5rem]">
              {`Halo, ${firstName}! Siap untuk latihan hari ini?`}
            </h1>
            <p className="mt-4 text-base font-medium text-[#6d747a] sm:text-lg lg:text-xl">
              {membership.membershipStatus === "active" ? <>Fokus hari ini <span className="mx-1 text-[#ff6b00]">·</span> Upper body</> : "Membership belum aktif · Pilih paket untuk memulai latihan"}
            </p>
            <Link to="/jadwal-saya" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#ff6b00] px-5 py-3 text-sm font-bold text-white shadow-md shadow-[#ff6b00]/20 transition hover:-translate-y-0.5 hover:bg-[#ec6100] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#ff6b00]/25 sm:mt-7 sm:px-6 sm:text-base">
              {membership.membershipStatus === "active" ? "Lihat jadwal saya" : "Lihat jadwal & riwayat saya"} <Icon name="arrow" className="h-4 w-4" />
            </Link>
          </div>
          <div className="pointer-events-none absolute bottom-0 right-0 top-0 hidden w-[34%] lg:block">
            <div className="absolute right-[12%] top-[-18%] h-[115%] w-[78%] rounded-full bg-[#ffc79f]/50" />
            <img src={heroImage} alt="" className="absolute bottom-0 right-[6%] h-[96%] max-w-full object-contain object-bottom drop-shadow-sm" />
          </div>
        </section>

        <div className="mb-5 mt-9 flex items-end justify-between gap-4 sm:mt-11">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#f56600]">Ringkasan member</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Aktivitas kamu</h2>
          </div>
          <Link to="/jadwal-saya" className="shrink-0 rounded-lg px-2 py-2 text-sm font-bold text-[#f56600] transition hover:bg-[#fff0e5] sm:text-base">
            Lihat semua <span aria-hidden="true">↗</span>
          </Link>
        </div>

        {membership.membershipStatus === "active" ? (
        <section className="grid gap-5 lg:grid-cols-2 xl:gap-6" aria-label="Member activity summary">
          <article className="rounded-[26px] border border-[#e5e7e9] bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#fff0e5] text-[#ff6b00] sm:h-16 sm:w-16">
                  <Icon name="calendar" className="h-7 w-7 sm:h-8 sm:w-8" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#8a9096]">Sesi PT berikutnya</p>
                  <h3 className="mt-1 text-lg font-extrabold sm:text-xl">Upper Body Strength</h3>
                  <p className="mt-1 text-sm text-[#737a80] sm:text-base">Latihan bersama personal trainer</p>
                </div>
              </div>
              <span className="rounded-full bg-[#e8f7f0] px-3.5 py-2 text-sm font-bold text-[#14965e]">Terjadwal</span>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-[#eceeef] pt-5 text-sm font-semibold text-[#454b50] sm:text-base">
              <span className="inline-flex items-center gap-2"><Icon name="clock" className="h-5 w-5 text-[#7b8288]" />18.30 WITA</span>
              <span className="hidden h-6 w-px bg-[#e4e6e7] sm:block" />
              <span className="inline-flex items-center gap-2"><Icon name="user" className="h-5 w-5 text-[#7b8288]" />Coach Rizky</span>
              <Link to="/book-pt" aria-label="Open personal trainer booking" className="ml-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#ff6b00] text-white transition hover:bg-[#e85c00] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#ff6b00]/25">
                <Icon name="arrow" className="h-5 w-5" />
              </Link>
            </div>
          </article>

          <article className="rounded-[26px] border border-[#e5e7e9] bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#fff0e5] text-[#ff6b00] sm:h-16 sm:w-16">
                <Icon name="dumbbell" className="h-7 w-7 sm:h-8 sm:w-8" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold sm:text-xl">Akses cepat</h3>
                <p className="mt-1 text-sm text-[#737a80] sm:text-base">Pilih layanan untuk aktivitas berikutnya.</p>
              </div>
            </div>
            <div className="mt-5 space-y-3 border-t border-[#eceeef] pt-4">
              <Link to="/book-pt" className="flex items-center justify-between rounded-xl border border-[#eceeef] px-4 py-3 text-sm font-bold text-[#343b40] transition hover:border-[#ffc49e] hover:bg-[#fff8f3] hover:text-[#f56600]">
                <span className="inline-flex items-center gap-3"><Icon name="user" className="h-5 w-5 text-[#ff6b00]" />Booking Personal Trainer</span><Icon name="chevron" className="h-4 w-4" />
              </Link>
              <Link to="/jadwal" className="flex items-center justify-between rounded-xl border border-[#eceeef] px-4 py-3 text-sm font-bold text-[#343b40] transition hover:border-[#ffc49e] hover:bg-[#fff8f3] hover:text-[#f56600]">
                <span className="inline-flex items-center gap-3"><Icon name="calendar" className="h-5 w-5 text-[#ff6b00]" />Jadwal Kelas</span><Icon name="chevron" className="h-4 w-4" />
              </Link>
              <Link to="/latihan" className="flex items-center justify-between rounded-xl border border-[#eceeef] px-4 py-3 text-sm font-bold text-[#343b40] transition hover:border-[#ffc49e] hover:bg-[#fff8f3] hover:text-[#f56600]">
                <span className="inline-flex items-center gap-3"><Icon name="bolt" className="h-5 w-5 text-[#ff6b00]" />Latihan</span><Icon name="chevron" className="h-4 w-4" />
              </Link>
            </div>
          </article>
        </section>
        ) : (
          <section className="grid gap-5 lg:grid-cols-2 xl:gap-6" aria-label="Membership access information">
            <article className="rounded-[26px] border border-[#f2d9c7] bg-white p-5 shadow-sm sm:p-7">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff0e5] text-[#ff6b00]"><Icon name="bolt" className="h-7 w-7" /></div>
              <h3 className="mt-4 text-xl font-extrabold sm:text-2xl">Aktifkan Membership</h3>
              <p className="mt-2 text-sm leading-6 text-[#737a80] sm:text-base">Book PT, reservasi kelas, dan latihan tersedia setelah membership aktif.</p>
              <Link to="/membership" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#ff6b00] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#ec6100]">Lihat Paket Membership <Icon name="arrow" className="h-4 w-4" /></Link>
            </article>
            <article className="rounded-[26px] border border-[#e5e7e9] bg-white p-5 shadow-sm sm:p-7">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f5f6f6] text-[#56616b]"><Icon name="calendar" className="h-7 w-7" /></div>
              <h3 className="mt-4 text-xl font-extrabold sm:text-2xl">Riwayat aktivitas</h3>
              <p className="mt-2 text-sm leading-6 text-[#737a80] sm:text-base">Kamu tetap dapat membuka Jadwal Saya untuk melihat reservasi dan riwayat aktivitas akun.</p>
              <Link to="/jadwal-saya" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full border border-[#e1e3e4] px-5 py-3 text-sm font-bold text-[#343b40] transition hover:border-[#ff6b00] hover:text-[#f56600]">Buka Jadwal Saya <Icon name="arrow" className="h-4 w-4" /></Link>
            </article>
          </section>
        )}

        <section className="mt-5 flex flex-col justify-between gap-5 rounded-[26px] bg-[#191c1e] p-5 text-white shadow-sm sm:flex-row sm:items-center sm:p-7 xl:mt-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[#ff6b00] sm:h-16 sm:w-16">
              <Icon name="bolt" className="h-7 w-7 sm:h-8 sm:w-8" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold sm:text-2xl">{membership.membershipStatus === "active" ? (activeMembership?.planName || "Membership Aktif") : "Membership Belum Aktif"}</h3>
              <p className="mt-1 text-sm text-white/65 sm:text-base">{membership.membershipStatus === "active" ? (activeMembership?.expiresAt ? `Aktif hingga ${new Date(activeMembership.expiresAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}` : "Paket membership kamu aktif.") : "Pilih paket untuk mengaktifkan layanan BugarHub."}</p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 sm:justify-end">
            <span className={`rounded-full px-4 py-2 text-sm font-bold ${membership.membershipStatus === "active" ? "bg-[#103e2e] text-[#6be0ae]" : "bg-[#5b2b16] text-[#ffd2b7]"}`}>{membership.membershipStatus === "active" ? "Aktif" : "Nonaktif"}</span>
            <Link to="/membership" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2.5 text-sm font-semibold text-white/90 transition hover:border-[#ff6b00] hover:bg-white/5">
              {membership.membershipStatus === "active" ? "Detail membership" : "Lihat Paket Membership"} <Icon name="arrow" className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <p className="mt-7 text-center text-xs leading-5 text-[#8b9197]">
          Data yang tampil saat ini adalah contoh tampilan. Aktivitas, jadwal, dan status membership belum tersambung ke backend.
        </p>
      </div>
    </main>
  );
}

export default MemberDashboard;
