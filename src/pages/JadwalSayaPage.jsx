import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import MemberHeader from "../components/MemberHeader";
import { getDemoMemberKey, readDemoMember } from "../utils/demoData";
import { CLASS_RESERVATIONS_UPDATED_EVENT, getClassReservations, saveClassReservations } from "../utils/classReservationData";
import { getMemberPTEntitlement, getPTBookingsForMember, MEMBER_PT_ENTITLEMENT_UPDATED_EVENT, requestPTBookingCancellation } from "../utils/ptBookingData";
import { TRAINER_SESSIONS_UPDATED_EVENT } from "../utils/trainerWorkspaceData";

function Icon({ name, className = "h-5 w-5" }) {
  const paths = {
    calendar: <><rect x="3.5" y="5" width="17" height="15.5" rx="2.2" /><path d="M7.5 3v4M16.5 3v4M3.5 9.5h17" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    dumbbell: <><path d="M6 4v16M18 4v16M3 7h6M15 7h6M3 17h6M15 17h6" /><path d="M9 12h6" /></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">{paths[name] || paths.calendar}</svg>;
}

function formatLongDate(value) {
  if (!value) return "Tanggal belum tersedia";
  const date = new Date(`${value}T12:00:00`);
  return new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(date);
}

export default function JadwalSayaPage() {
  const [member] = useState(readDemoMember);
  const memberKey = getDemoMemberKey(member);
  const [allReservations, setAllReservations] = useState(getClassReservations);
  const [ptBookings, setPTBookings] = useState(() => getPTBookingsForMember(memberKey));
  const [ptEntitlement, setPTEntitlement] = useState(() => getMemberPTEntitlement(member));
  const [ptNotice, setPTNotice] = useState("");
  const [cancellationTarget, setCancellationTarget] = useState(null);
  const [cancellationReason, setCancellationReason] = useState("");

  useEffect(() => {
    const refreshBookings = () => setPTBookings(getPTBookingsForMember(memberKey));
    const refreshEntitlement = () => setPTEntitlement(getMemberPTEntitlement(member));
    const refreshClassReservations = () => setAllReservations(getClassReservations());
    window.addEventListener(CLASS_RESERVATIONS_UPDATED_EVENT, refreshClassReservations);
    window.addEventListener(TRAINER_SESSIONS_UPDATED_EVENT, refreshBookings);
    window.addEventListener(MEMBER_PT_ENTITLEMENT_UPDATED_EVENT, refreshEntitlement);
    window.addEventListener("storage", refreshBookings);
    window.addEventListener("storage", refreshEntitlement);
    window.addEventListener("storage", refreshClassReservations);
    return () => {
      window.removeEventListener(CLASS_RESERVATIONS_UPDATED_EVENT, refreshClassReservations);
      window.removeEventListener(TRAINER_SESSIONS_UPDATED_EVENT, refreshBookings);
      window.removeEventListener(MEMBER_PT_ENTITLEMENT_UPDATED_EVENT, refreshEntitlement);
      window.removeEventListener("storage", refreshBookings);
      window.removeEventListener("storage", refreshEntitlement);
      window.removeEventListener("storage", refreshClassReservations);
    };
  }, [member, memberKey]);
  const reservations = useMemo(
    () => allReservations
      .filter((item) => item.memberKey === memberKey)
      .sort((a, b) => `${a.dateISO} ${a.time}`.localeCompare(`${b.dateISO} ${b.time}`)),
    [allReservations, memberKey]
  );

  function cancelReservation(reservationId) {
    const updated = allReservations.filter((item) => item.id !== reservationId);
    const saved = saveClassReservations(updated);
    if (saved) setAllReservations(updated);
  }

  function openPTCancellation(booking) {
    setCancellationTarget(booking);
    setCancellationReason("");
  }

  function submitPTCancellation(event) {
    event.preventDefault();
    const booking = cancellationTarget;
    const reason = cancellationReason.trim();
    if (!booking || !reason) {
      setPTNotice("Tuliskan alasan pembatalan terlebih dahulu.");
      return;
    }
    const result = requestPTBookingCancellation({ bookingId: booking.id, memberKey, reason });
    if (!result.ok) {
      const message = result.reason === "not_found"
        ? "Booking tidak ditemukan pada akun ini. Muat ulang halaman dan periksa booking yang dipilih."
        : "Permintaan pembatalan tidak dapat diproses karena status booking sudah berubah.";
      setPTNotice(message);
      setCancellationTarget(null);
      return;
    }
    setPTBookings(getPTBookingsForMember(memberKey));
    setPTNotice(`Permintaan pembatalan ${booking.id} dikirim. Sesi PT baru akan dikembalikan setelah PT/Coach menyetujuinya.`);
    setCancellationTarget(null);
    setCancellationReason("");
  }

  const statusLabels = {
    requested: "Menunggu konfirmasi PT/Coach",
    confirmed: "Dikonfirmasi",
    cancellation_requested: "Menunggu persetujuan pembatalan",
    cancelled: "Dibatalkan",
    completed: "Selesai",
    declined: "Ditolak",
  };

  return (
    <main className="min-h-screen bg-[#fbfbfa] text-[#202326]">
      <MemberHeader />
      <div className="mx-auto max-w-[1240px] px-5 pb-14 pt-7 sm:px-8 sm:pt-10 lg:px-10 lg:pt-12">
        <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-[#737a80] sm:text-base">
          <Link to="/dashboard" className="transition hover:text-[#f56600]">Dashboard</Link>
          <span aria-hidden="true">›</span>
          <span className="text-[#f56600]">Jadwal Saya</span>
        </div>

        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#f56600]">Aktivitas member</p>
            <h1 className="mt-2 text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">Jadwal Saya</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[#737a80] sm:text-lg">Kelas yang sudah kamu pesan akan muncul di sini.</p>
          </div>
          <Link to="/jadwal" className="inline-flex w-fit items-center justify-center gap-2 rounded-full bg-[#ff6b00] px-5 py-3 text-sm font-extrabold text-white shadow-md shadow-[#ff6b00]/15 transition hover:bg-[#eb6000] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#ff6b00]/25">
            Cari kelas <Icon name="arrow" className="h-4 w-4" />
          </Link>
        </section>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#f2dece] bg-[#fff6ef] px-4 py-3 text-sm text-[#87593b] sm:px-5">
          <span className="font-bold">{reservations.length} reservasi kelas · {ptBookings.length} booking PT · {ptEntitlement.ptCredits} sesi PT tersisa</span>
          <span className="text-xs sm:text-sm">Booking PT dan kelas langsung tercatat jika slot tersedia. Pembatalan booking PT oleh member tetap memerlukan persetujuan trainer.</span>
        </div>

        <section className="mt-6 rounded-[24px] border border-[#e4e5e5] bg-white p-5 shadow-[0_8px_28px_rgba(20,24,28,0.035)] sm:p-6" aria-label="Booking Personal Trainer">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#f56600]">Latihan personal</p><h2 className="mt-1 text-xl font-black sm:text-2xl">Booking PT Saya</h2><p className="mt-1 text-sm leading-6 text-[#737a80]">Booking langsung dikonfirmasi selama slot tersedia. Pembatalan member tetap memerlukan persetujuan trainer.</p></div><Link to="/book-pt" className="inline-flex w-fit items-center gap-2 rounded-full bg-[#ff6b00] px-4 py-2.5 text-sm font-extrabold text-white hover:bg-[#eb6100]">Cari PT <Icon name="arrow" className="h-4 w-4" /></Link></div>
          {ptNotice && <div role="status" aria-live="polite" className="mt-4 flex items-start justify-between gap-3 rounded-xl border border-[#ffd0ae] bg-[#fff5ed] px-4 py-3 text-sm leading-6 text-[#9d4300]"><span>{ptNotice}</span><button type="button" onClick={() => setPTNotice("")} aria-label="Tutup pemberitahuan" className="font-bold">×</button></div>}
          {ptBookings.length === 0 ? <div className="mt-4 rounded-xl border border-dashed border-[#dedfdf] bg-[#fcfcfb] px-4 py-8 text-center"><div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff0e5] text-[#f56600]"><Icon name="dumbbell" /></div><p className="mt-3 text-sm font-bold text-[#34383b]">Belum ada booking PT</p><p className="mt-1 text-xs text-[#737a80]">Booking yang berhasil dibuat akan langsung muncul di sini.</p></div> : <div className="mt-4 space-y-3">{ptBookings.map((booking) => {
            const statusClass = booking.status === "confirmed" ? "bg-emerald-50 text-emerald-700" : booking.status === "requested" ? "bg-blue-50 text-blue-700" : booking.status === "cancellation_requested" ? "bg-amber-50 text-amber-700" : booking.status === "completed" ? "bg-violet-50 text-violet-700" : "bg-slate-100 text-slate-600";
            return <article key={booking.id} className="grid gap-3 rounded-xl border border-[#e7e9eb] p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-extrabold text-[#263346]">{booking.type}</h3>{booking.status !== "confirmed" && <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${statusClass}`}>{statusLabels[booking.status] || booking.status}</span>}</div><p className="mt-1 text-xs text-[#8a97aa]">{booking.id} · {booking.trainerName || "PT/Coach"}</p><p className="mt-2 flex items-center gap-2 text-sm font-semibold text-[#454b50]"><Icon name="calendar" className="h-4 w-4 text-[#f56600]" />{formatLongDate(booking.date)}</p><p className="mt-1 flex items-center gap-2 text-sm text-[#737a80]"><Icon name="clock" className="h-4 w-4" />{booking.startTime}–{booking.endTime}</p><p className="mt-1 text-xs text-[#737a80]">Lokasi: {booking.room || "Area Gym BugarHub"}</p>{booking.cancellationReason && <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">Alasan pembatalan: {booking.cancellationReason}</p>}{booking.ptCreditRefunded && <p className="mt-2 text-xs font-bold text-emerald-700">Sesi PT telah dikembalikan ke saldo.</p>}</div><div className="flex flex-col items-start gap-2 sm:items-end">{["requested", "confirmed"].includes(booking.status) && <button type="button" onClick={() => openPTCancellation(booking)} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#e1e3e4] px-4 py-2 text-xs font-bold text-[#697077] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"><Icon name="close" className="h-4 w-4" />Ajukan pembatalan</button>}{booking.status === "cancellation_requested" && <span className="text-xs font-semibold text-amber-700">Menunggu keputusan PT/Coach</span>}{booking.status === "declined" && <span className="text-xs font-semibold text-slate-600">Permintaan booking ditolak</span>}</div></article>;
          })}</div>}
        </section>

        {reservations.length === 0 ? (
          <section className="mt-5 rounded-[28px] border border-dashed border-[#dedfdf] bg-white px-6 py-12 text-center sm:px-10 sm:py-16">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff0e5] text-[#f56600]"><Icon name="calendar" className="h-8 w-8" /></div>
            <h2 className="mt-5 text-xl font-black sm:text-2xl">Belum ada kelas yang dipesan</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#737a80] sm:text-base">Kunjungi Jadwal Kelas untuk bergabung pada kelas yang masih memiliki tempat.</p>
            <Link to="/jadwal" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#ff6b00] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#ed6100]">Lihat Jadwal Kelas <Icon name="arrow" className="h-4 w-4" /></Link>
          </section>
        ) : (
          <section className="mt-5 space-y-4" aria-label="Kelas yang telah dipesan">
            {reservations.map((reservation) => (
              <article key={reservation.id} className="grid gap-4 rounded-[24px] border border-[#e4e5e5] bg-white p-5 shadow-[0_8px_28px_rgba(20,24,28,0.035)] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#fff0e5] text-[#f56600] sm:h-14 sm:w-14"><Icon name="dumbbell" className="h-6 w-6 sm:h-7 sm:w-7" /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-black sm:text-xl">{reservation.className}</h2>
                      <span className="rounded-full bg-[#e8f7f0] px-3 py-1 text-xs font-extrabold text-[#168557]">Dipesan</span>
                    </div>
                    <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-[#454b50]"><Icon name="calendar" className="h-4 w-4 text-[#f56600]" />{reservation.dateLabel || formatLongDate(reservation.dateISO)}</p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-[#737a80]">
                      <span className="inline-flex items-center gap-1.5"><Icon name="clock" className="h-4 w-4" />{reservation.time} · {reservation.duration}</span>
                      <span className="inline-flex items-center gap-1.5"><Icon name="pin" className="h-4 w-4" />{reservation.studio} · {reservation.floor}</span>
                    </div>
                  </div>
                </div>
                <button type="button" onClick={() => cancelReservation(reservation.id)} className="inline-flex w-fit items-center justify-center gap-2 rounded-full border border-[#e1e3e4] px-4 py-2.5 text-sm font-bold text-[#697077] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100">
                  <Icon name="close" className="h-4 w-4" /> Batalkan reservasi
                </button>
              </article>
            ))}
          </section>
        )}

        <p className="mt-6 text-xs leading-5 text-[#969da2]">Perubahan booking dan reservasi saat ini tersimpan di browser yang sama. Integrasi server akan ditambahkan pada tahap backend.</p>
      </div>
      {cancellationTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#172033]/45 p-4 backdrop-blur-[2px]" onMouseDown={(event) => { if (event.target === event.currentTarget) setCancellationTarget(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="member-cancel-title" className="w-full max-w-lg rounded-2xl border border-[#e5e8eb] bg-white p-5 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#f56600]">Booking PT</p>
                <h2 id="member-cancel-title" className="mt-1 text-xl font-black text-[#263346]">Ajukan pembatalan</h2>
                <p className="mt-1 text-sm leading-6 text-[#738095]">Pembatalan ini akan dikirim ke PT/Coach. Sesi PT dikembalikan setelah permintaan disetujui.</p>
              </div>
              <button type="button" onClick={() => setCancellationTarget(null)} className="rounded-lg px-2 py-1 text-xl text-[#7b8798] hover:bg-slate-100" aria-label="Tutup dialog">×</button>
            </div>
            <div className="mt-4 rounded-xl bg-[#f7f9fc] p-3 text-sm">
              <p className="font-bold text-[#263346]">{cancellationTarget.type}</p>
              <p className="mt-1 text-[#738095]">{formatLongDate(cancellationTarget.date)} · {cancellationTarget.startTime}–{cancellationTarget.endTime}</p>
              <p className="mt-1 text-xs text-[#8a97aa]">{cancellationTarget.trainerName || "PT/Coach"} · {cancellationTarget.id}</p>
            </div>
            <form className="mt-4" onSubmit={submitPTCancellation}>
              <label htmlFor="member-cancellation-reason" className="mb-2 block text-sm font-bold text-[#344155]">Alasan pembatalan</label>
              <textarea id="member-cancellation-reason" value={cancellationReason} onChange={(event) => setCancellationReason(event.target.value)} required minLength={3} rows={4} placeholder="Jelaskan alasan kamu ingin membatalkan sesi..." className="w-full resize-y rounded-xl border border-[#dce2e9] px-3 py-2.5 text-sm text-[#263346] outline-none transition placeholder:text-[#a0aaba] focus:border-[#ff6b00] focus:ring-4 focus:ring-[#ff6b00]/10" />
              <div className="mt-4 flex flex-col-reverse justify-end gap-2 sm:flex-row">
                <button type="button" onClick={() => setCancellationTarget(null)} className="rounded-xl border border-[#dce2e9] px-4 py-2.5 text-sm font-bold text-[#68778d] hover:bg-slate-50">Kembali</button>
                <button type="submit" disabled={cancellationReason.trim().length < 3} className="rounded-xl bg-[#ff6b00] px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-[#e85f00] disabled:cursor-not-allowed disabled:opacity-50">Kirim permintaan</button>
              </div>
            </form>
          </section>
        </div>
      )}

      <footer className="rounded-t-[28px] bg-[#191c1e] px-5 py-8 text-white sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-[1240px] flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <p className="text-sm font-extrabold">BugarHub <span className="font-medium text-white/55">· Move forward, one session at a time.</span></p>
          <p className="text-xs text-white/45">© 2026 BugarHub. Bergerak lebih kuat, setiap hari.</p>
        </div>
      </footer>
    </main>
  );
}
