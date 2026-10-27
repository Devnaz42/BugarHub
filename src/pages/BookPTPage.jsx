import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import coachRizky from "../assets/coach-rizky.jpg";
import coachSarah from "../assets/coach-sarah.jpg";
import Logo from "../components/Logo";
import MemberHeader from "../components/MemberHeader";
import { getDemoMemberKey, readDemoMember } from "../utils/demoData";
import {
  createPTBooking,
  getBookablePTSlots,
  getMemberPTEntitlement,
  MEMBER_PT_ENTITLEMENT_UPDATED_EVENT,
} from "../utils/ptBookingData";
import {
  TRAINER_AVAILABILITY_UPDATED_EVENT,
  TRAINER_SESSIONS_UPDATED_EVENT,
} from "../utils/trainerWorkspaceData";

function Icon({ name, className = "h-5 w-5" }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className,
    "aria-hidden": true,
  };
  const shapes = {
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    chevron: <path d="m9 5 7 7-7 7" />,
    calendar: <><rect x="3.5" y="5" width="17" height="15.5" rx="2.2" /><path d="M7.5 3v4M16.5 3v4M3.5 9.5h17" /></>,
    star: <path d="m12 3 2.75 5.57 6.15.9-4.45 4.34 1.05 6.12L12 17.04l-5.5 2.89 1.05-6.12L3.1 9.47l6.15-.9L12 3Z" />,
    gift: <><rect x="3" y="9" width="18" height="12" rx="2" /><path d="M2 9h20V5H2v4ZM12 5v16M12 5H7.5a2.5 2.5 0 1 1 2.5-2.5V5ZM12 5h4.5A2.5 2.5 0 1 0 14 2.5V5Z" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>,
    person: <><circle cx="12" cy="8" r="3.4" /><path d="M5 20c.4-3.5 2.9-5.4 7-5.4s6.6 1.9 7 5.4" /></>,
    shield: <><path d="M12 3 19 6v5c0 4.6-3 7.8-7 10-4-2.2-7-5.4-7-10V6l7-3Z" /><path d="m9 12 2 2 4-4" /></>,
  };
  return <svg {...common}>{shapes[name] || shapes.arrow}</svg>;
}

const coaches = [
  {
    id: "trainer-001",
    name: "Coach Rizky",
    focus: "Strength & Personal Training",
    rating: "4.9",
    sessions: "248 sesi",
    image: coachRizky,
    bio: "Fokus pada latihan kekuatan, teknik gerakan, dan program pembentukan otot yang terarah.",
  },
  {
    id: "trainer-account-002",
    name: "Coach Sarah",
    focus: "Personal Training",
    rating: "4.9",
    sessions: "120+ sesi",
    image: coachSarah,
    bio: "Mendampingi latihan kebugaran dan pembentukan rutinitas yang realistis sesuai targetmu.",
  },
];

function formatLongDate(value) {
  if (!value) return "Tanggal belum tersedia";
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

function formatShortDate(value) {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" })
    .format(new Date(`${value}T12:00:00`));
}

function getTodayISO() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function formatDateChip(value) {
  const date = new Date(`${value}T12:00:00`);
  if (value === getTodayISO()) {
    return { title: "Hari Ini", subtitle: formatShortDate(value) };
  }
  return {
    title: new Intl.DateTimeFormat("id-ID", { weekday: "short" }).format(date).replace(/\./g, ""),
    subtitle: new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short" }).format(date),
  };
}

function BookPTPage() {
  const [member] = useState(readDemoMember);
  const memberKey = getDemoMemberKey(member);
  const [entitlement, setEntitlement] = useState(() => getMemberPTEntitlement(member));
  const [availableSlots, setAvailableSlots] = useState(() => getBookablePTSlots());
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [sessionDate, setSessionDate] = useState("");
  const [selectedSlotKey, setSelectedSlotKey] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [restriction, setRestriction] = useState(null);

  useEffect(() => {
    const refreshSlots = () => setAvailableSlots(getBookablePTSlots());
    const refreshEntitlement = () => setEntitlement(getMemberPTEntitlement(member));
    window.addEventListener(TRAINER_AVAILABILITY_UPDATED_EVENT, refreshSlots);
    window.addEventListener(TRAINER_SESSIONS_UPDATED_EVENT, refreshSlots);
    window.addEventListener(MEMBER_PT_ENTITLEMENT_UPDATED_EVENT, refreshEntitlement);
    window.addEventListener("storage", refreshSlots);
    window.addEventListener("storage", refreshEntitlement);
    return () => {
      window.removeEventListener(TRAINER_AVAILABILITY_UPDATED_EVENT, refreshSlots);
      window.removeEventListener(TRAINER_SESSIONS_UPDATED_EVENT, refreshSlots);
      window.removeEventListener(MEMBER_PT_ENTITLEMENT_UPDATED_EVENT, refreshEntitlement);
      window.removeEventListener("storage", refreshSlots);
      window.removeEventListener("storage", refreshEntitlement);
    };
  }, [member]);

  const coachSlots = useMemo(
    () => selectedCoach ? availableSlots.filter((slot) => slot.trainerId === selectedCoach.id) : [],
    [availableSlots, selectedCoach]
  );
  const dateOptions = useMemo(() => [...new Set(coachSlots.map((slot) => slot.date))], [coachSlots]);
  const timeOptions = useMemo(() => coachSlots.filter((slot) => slot.date === sessionDate), [coachSlots, sessionDate]);
  const selectedSlot = timeOptions.find((slot) => slot.key === selectedSlotKey) || null;
  const availableSlotCountByCoach = useMemo(() => {
    const counts = {};
    coaches.forEach((coach) => {
      const coachSlots = availableSlots.filter((slot) => slot.trainerId === coach.id);
      counts[coach.id] = {
        today: coachSlots.filter((slot) => slot.date === getTodayISO()).length,
        upcoming: coachSlots.length,
      };
    });
    return counts;
  }, [availableSlots]);

  function refreshMemberData() {
    setEntitlement(getMemberPTEntitlement(member));
    setAvailableSlots(getBookablePTSlots());
  }

  function openBooking(coach) {
    refreshMemberData();
    const currentEntitlement = getMemberPTEntitlement(member);
    if (currentEntitlement.membershipStatus !== "active") {
      setRestriction({
        title: "Akses booking terbatas",
        message: "Booking Personal Trainer hanya tersedia untuk member dengan membership aktif.",
        action: "Lihat membership",
        kind: "membership",
      });
      return;
    }
    if (currentEntitlement.ptCredits < 1) {
      setRestriction({
        title: "Sesi PT tidak tersedia",
        message: "Saldo sesi PT kamu sudah habis. Tambahkan sesi PT sebelum membuat booking baru.",
        action: "Lihat pilihan paket",
        kind: "credits",
      });
      return;
    }
    const slots = getBookablePTSlots(coach.id);
    setAvailableSlots(getBookablePTSlots());
    if (slots.length === 0) {
      setRestriction({
        title: "Belum ada jadwal tersedia",
        message: `Belum ada slot latihan mendatang yang tersedia untuk ${coach.name}. Silakan periksa kembali nanti atau pilih trainer lain.`,
        action: "Mengerti",
        kind: "schedule",
      });
      return;
    }
    setSelectedCoach(coach);
    setSessionDate(slots[0].date);
    setSelectedSlotKey(slots[0].key);
    setBookingMessage("");
    setBookingSuccess(false);
    setConfirmedBooking(null);
  }

  function closeBooking() {
    setSelectedCoach(null);
    setBookingMessage("");
    setBookingSuccess(false);
    setConfirmedBooking(null);
    refreshMemberData();
  }

  function handleBookingSubmit(event) {
    event.preventDefault();
    if (!selectedCoach || !selectedSlot) {
      setBookingMessage("Pilih tanggal dan slot waktu yang tersedia.");
      return;
    }
    const result = createPTBooking({
      member,
      trainer: { id: selectedCoach.id, name: selectedCoach.name },
      slot: selectedSlot,
    });
    if (!result.ok) {
      refreshMemberData();
      const message = {
        membership: "Membership kamu tidak aktif. Aktifkan membership untuk melanjutkan.",
        credits: "Sesi PT kamu sudah tidak mencukupi untuk booking ini.",
        unavailable: "Slot ini baru saja tidak tersedia. Pilih slot lain.",
        storage: "Booking belum dapat disimpan. Coba lagi.",
        invalid: "Data booking belum lengkap. Periksa kembali pilihanmu.",
      }[result.reason] || "Booking belum berhasil disimpan.";
      setBookingMessage(message);
      return;
    }
    setBookingMessage(`Booking ${result.booking.id} berhasil dikonfirmasi untuk ${selectedCoach.name}. Satu sesi PT telah digunakan.`);
    setBookingSuccess(true);
    setConfirmedBooking(result.booking);
    setEntitlement(result.entitlement);
    setAvailableSlots(getBookablePTSlots());
  }

  return (
    <main className="min-h-screen bg-[#fbfbfa] text-[#202326]">
      <MemberHeader />

      <div className="mx-auto max-w-[1440px] px-5 pb-12 pt-7 sm:px-8 sm:pt-10 lg:px-10 lg:pt-12 xl:px-14">
        <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-[#737a80] sm:text-base">
          <Link to="/dashboard" className="transition hover:text-[#f56600]">Layanan</Link>
          <Icon name="chevron" className="h-4 w-4" />
          <span className="text-[#f56600]">Book PT</span>
        </div>

        <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="max-w-3xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#f56600]">Latihan personal</p>
            <h1 className="mt-2 text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">Booking Personal Trainer</h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-[#737a80] sm:text-lg sm:leading-8">Pilih coach sesuai target latihan dan jadwalkan sesi pada slot yang benar-benar tersedia.</p>
          </div>
          <div className="flex shrink-0 items-center gap-2 self-start rounded-full border border-[#f2d9c7] bg-[#fff5ed] px-4 py-2.5 text-sm font-semibold text-[#b94e00] md:self-auto">
            <span className="h-2 w-2 rounded-full bg-[#ff6b00]" /> Slot sesi tersedia pukul 08.00–22.00
          </div>
        </section>

        <section className="mt-6 grid gap-3 sm:grid-cols-2" aria-label="Status sesi PT">
          <article className="flex items-center gap-3 rounded-2xl border border-[#f2d9c7] bg-white p-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff1e7] text-[#f56600]"><Icon name="shield" /></span>
            <div><p className="text-xs font-semibold text-[#737a80]">Status membership</p><p className={`mt-1 text-base font-extrabold ${entitlement.membershipStatus === "active" ? "text-emerald-700" : "text-red-600"}`}>{entitlement.membershipStatus === "active" ? "Aktif" : "Tidak aktif"}</p></div>
          </article>
          <article className="flex items-center gap-3 rounded-2xl border border-[#f2d9c7] bg-white p-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff1e7] text-[#f56600]"><Icon name="gift" /></span>
            <div><p className="text-xs font-semibold text-[#737a80]">Sesi PT tersedia</p><p className="mt-1 text-base font-extrabold text-[#202326]">{entitlement.ptCredits} sesi</p></div>
          </article>
        </section>

        {entitlement.membershipStatus !== "active" && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">Membership kamu tidak aktif. Kamu masih bisa melihat profil trainer, tetapi booking PT memerlukan membership aktif.</div>}
        {entitlement.membershipStatus === "active" && entitlement.ptCredits < 1 && <div className="mt-4 rounded-xl border border-[#ffd9bf] bg-[#fff7f1] px-4 py-3 text-sm leading-6 text-[#9a480e]">Kamu belum memiliki sesi PT yang dapat digunakan. Tambahkan sesi sebelum mengirim permintaan booking.</div>}

        <section className="mt-8 grid gap-5 lg:mt-10 lg:grid-cols-2 xl:gap-6" aria-label="Daftar personal trainer">
          {coaches.map((coach) => {
            const slotCount = availableSlotCountByCoach[coach.id] || { today: 0, upcoming: 0 };
            return <article key={coach.id} className="group flex flex-col overflow-hidden rounded-[26px] border border-[#e4e5e5] bg-white shadow-[0_8px_28px_rgba(20,24,28,0.04)] transition duration-200 hover:-translate-y-0.5 hover:border-[#ffd0b1] hover:shadow-[0_14px_32px_rgba(20,24,28,0.08)] sm:flex-row">
              <div className="relative h-64 shrink-0 overflow-hidden bg-[#f0efec] sm:h-auto sm:min-h-[270px] sm:w-[37%] lg:w-[40%]">
                <img src={coach.image} alt={coach.name} className="h-full w-full object-cover object-center transition duration-300 group-hover:scale-[1.02]" />
                <div className="absolute bottom-3 left-3 rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-xs font-bold text-[#34383b] backdrop-blur">Personal Trainer</div>
              </div>
              <div className="flex min-w-0 flex-1 flex-col p-5 sm:p-6 lg:p-7">
                <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-bold uppercase tracking-[0.1em] text-[#f56600]">{coach.focus}</p><h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">{coach.name}</h2></div><div className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#fff5ed] px-2.5 py-2 text-sm font-extrabold text-[#24282b]"><Icon name="star" className="h-4 w-4 fill-[#ff9a24] text-[#ff9a24]" /> {coach.rating}</div></div>
                <p className="mt-3 text-sm leading-6 text-[#737a80] sm:text-base">{coach.bio}</p>
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold text-[#687078]"><span className="inline-flex items-center gap-2"><Icon name="person" className="h-4 w-4 text-[#f56600]" />{coach.sessions}</span><span className="h-1 w-1 rounded-full bg-[#c3c6c8]" /><span>Rating member 4.9/5</span></div>
                <div className="mt-3 text-xs font-semibold"><span className={`rounded-full px-2.5 py-1 ${slotCount.upcoming > 0 ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{slotCount.today > 0 ? `${slotCount.today} slot tersedia hari ini` : slotCount.upcoming > 0 ? "Jadwal tersedia" : "Jadwal belum tersedia"}</span></div>
                <button type="button" onClick={() => openBooking(coach)} className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#ff6b00] px-5 py-3 text-sm font-extrabold text-white shadow-md shadow-[#ff6b00]/15 transition hover:-translate-y-0.5 hover:bg-[#ed6100] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#ff6b00]/25 active:translate-y-0 sm:mt-auto sm:justify-between sm:text-base">Jadwalkan Sesi <Icon name="arrow" className="h-5 w-5" /></button>
              </div>
            </article>;
          })}
        </section>

        <section className="mt-7 flex flex-col gap-4 rounded-[24px] border border-[#ff6b00] bg-[#fff5ed] p-5 sm:flex-row sm:items-center sm:gap-5 sm:p-6 lg:mt-8 lg:p-7">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#ff6b00] text-white sm:h-16 sm:w-16"><Icon name="gift" className="h-7 w-7 sm:h-8 sm:w-8" /></div>
          <div><p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#f56600]">Membership & sesi latihan</p><h2 className="mt-1 text-lg font-extrabold leading-snug sm:text-xl">Membership aktif dan sesi PT adalah dua hal berbeda</h2><p className="mt-1 text-sm leading-6 text-[#737a80] sm:text-base">Pastikan membership aktif dan saldo sesi tersedia sebelum membuat booking.</p></div>
          <Link to="/dashboard" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-[#ffc49e] bg-white px-5 py-3 text-sm font-bold text-[#c95700] transition hover:bg-[#ffeadb] sm:ml-auto">Lihat membership <Icon name="arrow" className="h-4 w-4" /></Link>
        </section>
      </div>

      <footer id="contact" className="rounded-t-[30px] bg-[#191c1e] text-white sm:rounded-t-[38px]">
        <div className="mx-auto grid max-w-[1440px] gap-8 px-5 py-9 sm:px-8 sm:py-11 lg:grid-cols-[1.3fr_1fr] lg:items-center lg:gap-12 lg:px-10 xl:px-14">
          <div><Logo tone="light" /><h2 className="mt-5 text-2xl font-black tracking-tight sm:text-3xl">Hubungi Admin &amp; Pendaftaran</h2><p className="mt-3 max-w-xl text-sm leading-6 text-white/65 sm:text-base sm:leading-7">Tanya membership, cek jadwal kelas, atau temukan teman latihan baru di kanal resmi BugarHub.</p></div>
          <div className="grid grid-cols-2 gap-3">{[["WhatsApp", "◉"], ["Instagram", "◎"], ["TikTok", "♪"], ["YouTube", "▷"]].map(([label, symbol]) => <a key={label} href="#contact" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-bold transition hover:border-[#ff6b00]/60 hover:bg-white/10 sm:text-base"><span className="font-black text-[#ff6b00]">{symbol}</span>{label}<span className="ml-auto text-white/45">↗</span></a>)}</div>
        </div>
        <div className="mx-auto max-w-[1440px] border-t border-white/10 px-5 py-5 text-center text-xs text-white/45 sm:px-8 sm:text-sm lg:px-10 xl:px-14">© 2026 BugarHub. Bergerak lebih kuat, setiap hari.</div>
      </footer>

      {selectedCoach && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#111416]/60 px-3 py-4 backdrop-blur-sm sm:px-5 sm:py-6"
          role="presentation"
          onMouseDown={(event) => { if (event.target === event.currentTarget) closeBooking(); }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-title"
            className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-[26px] bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-[30px]"
          >
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#edf0f2] px-5 py-4 sm:px-7 sm:py-5">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#f56600]">Booking Personal Trainer</p>
                <h2 id="booking-title" className="mt-1 text-xl font-black tracking-tight text-[#202326] sm:text-2xl">Jadwalkan Sesi</h2>
                <p className="mt-1 max-w-2xl text-xs leading-5 text-[#737a80] sm:text-sm sm:leading-6">Pilih tanggal dan jam sesi yang tersedia. Booking langsung dikonfirmasi selama slot dan sesi PT masih tersedia.</p>
              </div>
              <button type="button" onClick={closeBooking} aria-label="Tutup dialog" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e3e6e8] text-[#65707a] transition hover:bg-[#f7f8f9]">
                <Icon name="close" className="h-4 w-4" />
              </button>
            </div>

            {bookingSuccess ? (
              <div className="overflow-y-auto p-5 sm:p-7">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xl font-black text-emerald-700">✓</span>
                    <div>
                      <p className="text-lg font-black text-emerald-900">Sesi berhasil dijadwalkan</p>
                      <p className="mt-1 text-sm leading-6 text-emerald-800">{bookingMessage}</p>
                      {confirmedBooking && <p className="mt-2 text-sm font-semibold text-emerald-900">{formatLongDate(confirmedBooking.date)} · {confirmedBooking.startTime}–{confirmedBooking.endTime}</p>}
                    </div>
                  </div>
                  <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <button type="button" onClick={closeBooking} className="min-h-11 rounded-full border border-emerald-200 bg-white px-5 text-sm font-bold text-emerald-800 transition hover:bg-emerald-100">Tutup</button>
                    <Link to="/jadwal-saya" onClick={closeBooking} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#ff6b00] px-5 text-sm font-extrabold text-white transition hover:bg-[#ed6100]">Lihat Jadwal Saya <Icon name="arrow" className="h-4 w-4" /></Link>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="flex min-h-0 flex-1 flex-col">
                <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
                  <div className="flex items-center gap-3 rounded-2xl border border-[#f1e4da] bg-[#fff7f1] p-3 sm:gap-4 sm:p-4">
                    <img src={selectedCoach.image} alt={selectedCoach.name} className="h-[76px] w-[76px] shrink-0 rounded-2xl object-cover sm:h-20 sm:w-20" />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-black text-[#202326] sm:text-lg">{selectedCoach.name}</h3>
                      <p className="mt-0.5 text-sm text-[#687078]">{selectedCoach.focus}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-[#687078] sm:text-sm">
                        <span className="inline-flex items-center gap-1.5 text-[#36404a]"><Icon name="star" className="h-4 w-4 fill-[#ff9a24] text-[#ff9a24]" /> {selectedCoach.rating} ({selectedCoach.sessions})</span>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{coachSlots.some((slot) => slot.date === getTodayISO()) ? "Tersedia Hari Ini" : `${coachSlots.length} slot tersedia`}</span>
                      </div>
                      <p className="mt-1.5 text-xs font-semibold text-[#b94e00]">Saldo sesi PT kamu: {entitlement.ptCredits} sesi</p>
                    </div>
                  </div>

                  <section aria-labelledby="pick-date-heading">
                    <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
                      <div>
                        <h3 id="pick-date-heading" className="text-sm font-extrabold text-[#202326] sm:text-base">Pilih Tanggal</h3>
                        <p className="mt-1 text-xs text-[#7b838a]">Pilih tanggal yang memiliki slot tersedia.</p>
                      </div>
                      <span className="text-xs font-medium text-[#7b838a]">{dateOptions.length} tanggal tersedia</span>
                    </div>
                    <div className="flex snap-x gap-2 overflow-x-auto pb-1">
                      {dateOptions.map((date) => {
                        const chip = formatDateChip(date);
                        const isSelected = sessionDate === date;
                        return (
                          <button
                            key={date}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => {
                              setSessionDate(date);
                              setSelectedSlotKey(coachSlots.find((slot) => slot.date === date)?.key || "");
                              setBookingMessage("");
                            }}
                            className={`flex min-w-[108px] snap-start flex-1 flex-col items-center justify-center rounded-full border px-4 py-2.5 text-center transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#ff6b00]/20 ${isSelected ? "border-[#ff6b00] bg-[#ff6b00] text-white shadow-sm shadow-[#ff6b00]/15" : "border-[#e0e4e7] bg-white text-[#56616b] hover:border-[#ffb98d] hover:bg-[#fff8f3]"}`}
                          >
                            <span className="text-sm font-extrabold">{chip.title}</span>
                            <span className={`mt-0.5 text-xs ${isSelected ? "text-white/85" : "text-[#858d94]"}`}>{chip.subtitle}</span>
                          </button>
                        );
                      })}
                    </div>
                  </section>

                  <section aria-labelledby="pick-time-heading">
                    <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
                      <div>
                        <h3 id="pick-time-heading" className="text-sm font-extrabold text-[#202326] sm:text-base">Pilih Jam Sesi</h3>
                        <p className="mt-1 text-xs text-[#7b838a]">Pilih satu slot untuk sesi latihan personal.</p>
                      </div>
                      <span className="text-xs font-medium text-[#7b838a]">Durasi 60 menit / sesi</span>
                    </div>
                    {timeOptions.length > 0 ? (
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {timeOptions.map((slot) => {
                          const isSelected = selectedSlotKey === slot.key;
                          return (
                            <button
                              key={slot.key}
                              type="button"
                              aria-pressed={isSelected}
                              onClick={() => { setSelectedSlotKey(slot.key); setBookingMessage(""); }}
                              className={`flex min-h-12 items-center justify-between gap-3 rounded-full border px-4 py-3 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#ff6b00]/20 ${isSelected ? "border-[#ff6b00] bg-[#fff3e9] text-[#c95600] shadow-sm" : "border-[#e1e5e8] bg-white text-[#2d3338] hover:border-[#ffb98d] hover:bg-[#fffaf6]"}`}
                            >
                              <span>{slot.startTime} – {slot.endTime}</span>
                              <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs ${isSelected ? "border-[#ff6b00] bg-[#ff6b00] text-white" : "border-[#cbd2d8] text-transparent"}`} aria-hidden="true">✓</span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-[#dfe4e8] bg-[#f8fafb] px-4 py-8 text-center">
                        <p className="font-bold text-[#4c5660]">Belum ada slot pada tanggal ini</p>
                        <p className="mt-1 text-sm text-[#7b838a]">Pilih tanggal lain untuk melihat jadwal yang tersedia.</p>
                      </div>
                    )}
                  </section>

                  {selectedSlot && (
                    <div className="grid gap-2 rounded-2xl bg-[#f7f9fc] p-3.5 text-sm text-[#66758b] sm:grid-cols-2 sm:px-4">
                      <p><span className="font-semibold text-[#344155]">Tanggal:</span> {formatLongDate(selectedSlot.date)}</p>
                      <p><span className="font-semibold text-[#344155]">Lokasi:</span> {selectedSlot.room}</p>
                      {selectedSlot.note && <p className="sm:col-span-2">{selectedSlot.note}</p>}
                    </div>
                  )}
                  {bookingMessage && <div role="alert" className="rounded-xl border border-[#ffd0ae] bg-[#fff5ed] p-3.5 text-sm leading-6 text-[#9d4300]">{bookingMessage}</div>}
                </div>

                <div className="flex shrink-0 flex-col gap-3 border-t border-[#edf0f2] bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold text-[#202326]">{selectedSlot ? "1 Sesi Terpilih" : "Belum ada sesi terpilih"}{selectedSlot && <span className="ml-1 font-semibold text-[#667078]">({selectedSlot.startTime} – {selectedSlot.endTime})</span>}</p>
                    <p className="mt-1 truncate text-xs text-[#7b838a]">{selectedSlot ? `${formatLongDate(selectedSlot.date)} · ${selectedSlot.room}` : "Pilih tanggal dan jam sesi terlebih dahulu."}</p>
                  </div>
                  <div className="flex shrink-0 flex-col-reverse gap-2 sm:flex-row">
                    <button type="button" onClick={closeBooking} className="min-h-11 rounded-full border border-[#e1e3e4] px-5 text-sm font-bold text-[#555d63] transition hover:bg-[#f7f7f5]">Tutup</button>
                    <button type="submit" disabled={!selectedSlot || entitlement.ptCredits < 1 || entitlement.membershipStatus !== "active"} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#ff6b00] px-5 text-sm font-extrabold text-white shadow-sm shadow-[#ff6b00]/15 transition hover:bg-[#ed6100] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#ff6b00]/20 disabled:cursor-not-allowed disabled:bg-[#f5b184]">Konfirmasi &amp; Lanjut Booking <Icon name="arrow" className="h-4 w-4" /></button>
                  </div>
                </div>
              </form>
            )}
          </section>
        </div>
      )}

      {restriction && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#111416]/60 px-4 py-6 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setRestriction(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="booking-restriction-title" className="w-full max-w-md rounded-[24px] bg-white p-6 text-center shadow-2xl sm:p-7">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff1e7] text-[#f56600]"><Icon name={restriction.kind === "schedule" ? "calendar" : "shield"} className="h-7 w-7" /></div>
            <h2 id="booking-restriction-title" className="mt-4 text-xl font-black text-[#202326]">{restriction.title}</h2>
            <p className="mt-2 text-sm leading-6 text-[#737a80]">{restriction.message}</p>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center"><button type="button" onClick={() => setRestriction(null)} className="min-h-11 rounded-full border border-[#e1e3e4] px-5 text-sm font-bold text-[#555d63] hover:bg-[#f7f7f5]">Tutup</button>{restriction.kind !== "schedule" && <Link to="/dashboard" onClick={() => setRestriction(null)} className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#ff6b00] px-5 text-sm font-extrabold text-white hover:bg-[#ed6100]">{restriction.action}</Link>}</div>
          </section>
        </div>
      )}
    </main>
  );
}

export default BookPTPage;
