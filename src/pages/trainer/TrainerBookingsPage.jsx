import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import TrainerPageLayout from "../../components/TrainerPageLayout";
import { AdminIcon } from "../../components/AdminSidebar";
import { getStaffSession } from "../../utils/staffSession";
import { formatDate, getTrainerSessions, TRAINER_SESSIONS_UPDATED_EVENT } from "../../utils/trainerWorkspaceData";
import { getTrainerAccountId, transitionPTBooking } from "../../utils/ptBookingData";
import { CLASS_RESERVATIONS_UPDATED_EVENT, getClassReservations } from "../../utils/classReservationData";

const FILTERS = [
  { id: "all", label: "Semua aktivitas" },
  { id: "pt", label: "Booking PT" },
  { id: "class", label: "Peserta kelas" },
  { id: "completed", label: "Selesai" },
];

function TrainerBookingsPage() {
  const trainer = getStaffSession();
  const trainerId = getTrainerAccountId(trainer);
  const [allSessions, setAllSessions] = useState(getTrainerSessions);
  const [classReservations, setClassReservations] = useState(getClassReservations);
  const [filter, setFilter] = useState("all");
  const [notice, setNotice] = useState("");
  const [cancellationTarget, setCancellationTarget] = useState(null);
  const [cancellationReason, setCancellationReason] = useState("");

  useEffect(() => {
    const refreshPT = () => setAllSessions(getTrainerSessions());
    const refreshClasses = () => setClassReservations(getClassReservations());
    window.addEventListener(TRAINER_SESSIONS_UPDATED_EVENT, refreshPT);
    window.addEventListener(CLASS_RESERVATIONS_UPDATED_EVENT, refreshClasses);
    window.addEventListener("storage", refreshPT);
    window.addEventListener("storage", refreshClasses);
    return () => {
      window.removeEventListener(TRAINER_SESSIONS_UPDATED_EVENT, refreshPT);
      window.removeEventListener(CLASS_RESERVATIONS_UPDATED_EVENT, refreshClasses);
      window.removeEventListener("storage", refreshPT);
      window.removeEventListener("storage", refreshClasses);
    };
  }, []);

  const ptSessions = useMemo(
    () => allSessions.filter((session) => String(session.trainerId || "trainer-001") === trainerId),
    [allSessions, trainerId],
  );
  const trainerClassReservations = useMemo(() => classReservations
    .filter((reservation) => reservation.reservationType === "trainer_class" && String(reservation.trainerId || "trainer-001") === trainerId)
    .map((reservation) => ({
      ...reservation,
      kind: "class",
      member: reservation.memberName || reservation.member || "Member BugarHub",
      type: reservation.className || "Kelas BugarHub",
      date: reservation.dateISO || reservation.date,
      startTime: reservation.startTime || reservation.time || "09:00",
      endTime: reservation.endTime || "10:00",
      note: reservation.note || `Terdaftar pada ${reservation.category || "kelas"}`,
    })), [classReservations, trainerId]);

  // The table is a roster/history, not an approval queue. Pending legacy PT
  // records are normalized to confirmed in trainerWorkspaceData.
  const rows = useMemo(() => [
    ...ptSessions
      .filter((session) => ["confirmed", "completed"].includes(session.status))
      .map((session) => ({ ...session, kind: "pt", member: session.member || "Member", type: session.type || "Personal Training" })),
    ...trainerClassReservations
      .filter((reservation) => ["confirmed", "completed"].includes(reservation.status)),
  ].filter((item) => filter === "all"
    || (filter === "pt" && item.kind === "pt")
    || (filter === "class" && item.kind === "class")
    || (filter === "completed" && item.status === "completed"))
    .sort((a, b) => `${a.date || ""} ${a.startTime || ""}`.localeCompare(`${b.date || ""} ${b.startTime || ""}`)),
  [ptSessions, trainerClassReservations, filter]);

  const activePTSessions = useMemo(() => ptSessions
    .filter((session) => session.status === "confirmed")
    .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`)), [ptSessions]);
  const cancellationRequests = useMemo(() => ptSessions
    .filter((session) => session.status === "cancellation_requested")
    .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`)), [ptSessions]);

  if (!trainer || trainer.role !== "trainer") return <Navigate to="/admin/login" replace />;

  const activeClassCount = trainerClassReservations.filter((item) => ["confirmed", "completed"].includes(item.status)).length;
  const completedCount = ptSessions.filter((item) => item.status === "completed").length
    + trainerClassReservations.filter((item) => item.status === "completed").length;

  function updatePTStatus(id, status, message, updates = {}) {
    const result = transitionPTBooking(id, status, updates);
    if (!result.ok) {
      setNotice("Perubahan belum dapat disimpan. Muat ulang halaman dan coba kembali.");
      return;
    }
    setAllSessions(getTrainerSessions());
    const refundText = result.booking.ptCreditRefunded ? " Satu sesi PT sudah dikembalikan ke saldo member." : "";
    setNotice(`${message}${refundText}`);
  }

  function cancelByTrainer(session) {
    setCancellationTarget(session);
    setCancellationReason("");
  }

  function submitTrainerCancellation(event) {
    event.preventDefault();
    const session = cancellationTarget;
    const reason = cancellationReason.trim();
    if (!session || reason.length < 3) {
      setNotice("Tuliskan alasan pembatalan minimal 3 karakter.");
      return;
    }
    updatePTStatus(session.id, "cancelled", `Sesi ${session.id} dibatalkan oleh PT/Coach.`, {
      cancellationReason: reason,
      cancellationRequestedBy: "trainer",
      cancellationDecision: "trainer_cancelled",
    });
    setCancellationTarget(null);
    setCancellationReason("");
  }

  const actions = <Link to="/trainer/schedule" className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#ff6b00] px-4 text-sm font-bold text-white transition hover:bg-[#eb6200]"><AdminIcon name="calendar" className="h-4 w-4" />Lihat kalender</Link>;

  return <TrainerPageLayout title="Sesi & Booking" subtitle="Daftar member yang bergabung pada sesi PT dan kelas, serta pengelolaan pembatalan sesi." actions={actions}>
    {notice && <div role="status" aria-live="polite" className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-[#cfeedd] bg-[#f0fbf5] px-4 py-3 text-sm text-[#176b43]"><span>{notice}</span><button type="button" onClick={() => setNotice("")} aria-label="Tutup pemberitahuan" className="font-bold">×</button></div>}

    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard label="Booking PT" value={String(ptSessions.filter((item) => ["confirmed", "completed"].includes(item.status)).length)} icon="activity" desc="Slot yang berhasil diambil" />
      <SummaryCard label="Peserta kelas" value={String(activeClassCount)} icon="calendar" desc="Member terdaftar pada kelas" />
      <SummaryCard label="Permintaan pembatalan" value={String(cancellationRequests.length)} icon="clock" accent={cancellationRequests.length > 0} desc="Perlu keputusan PT/Coach" />
      <SummaryCard label="Sesi selesai" value={String(completedCount)} icon="check" desc="Sesi PT dan kelas" />
    </section>

    {cancellationRequests.length > 0 && <section className="mt-5 rounded-xl border border-amber-200 bg-white p-4 sm:p-5">
      <div><h2 className="text-lg font-extrabold text-[#263346]">Permintaan pembatalan member</h2><p className="mt-1 text-sm text-[#7b899e]">Pembatalan oleh member masih memerlukan persetujuan PT/Coach. Sesi baru dikembalikan setelah disetujui.</p></div>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">{cancellationRequests.map((session) => <article key={session.id} className="rounded-xl border border-amber-100 bg-[#fffaf5] p-4">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-extrabold text-[#263346]">{session.member} · {session.type}</p><p className="mt-1 text-xs text-[#7b899e]">{session.id}</p><p className="mt-2 text-sm text-[#526177]">{formatDate(session.date, { weekday: "short", day: "numeric", month: "short", year: "numeric" })} · {session.startTime}–{session.endTime}</p></div><span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-800">Menunggu keputusan</span></div>
        {session.cancellationReason && <p className="mt-3 rounded-lg bg-white px-3 py-2 text-sm text-[#7b4a2a]">Alasan: {session.cancellationReason}</p>}
        <div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => updatePTStatus(session.id, "cancelled", `Pembatalan ${session.id} disetujui.`, { cancellationDecision: "approved" })} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-700">Setujui pembatalan</button><button type="button" onClick={() => updatePTStatus(session.id, session.previousStatusBeforeCancellation || "confirmed", `Pembatalan ${session.id} ditolak; sesi tetap terjadwal.`, { cancellationDecision: "rejected" })} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50">Tolak pembatalan</button></div>
      </article>)}</div>
    </section>}

    {activePTSessions.length > 0 && <section className="mt-5 rounded-xl border border-[#e5e9ef] bg-white p-4 sm:p-5">
      <div><h2 className="text-lg font-extrabold text-[#263346]">Sesi PT mendatang</h2><p className="mt-1 text-sm text-[#7b899e]">Gunakan pengelolaan terpisah ini jika sesi perlu diselesaikan atau dibatalkan.</p></div>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">{activePTSessions.map((session) => <article key={session.id} className="flex flex-col gap-3 rounded-xl border border-[#e8ecf2] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="font-extrabold text-[#263346]">{session.member} · {session.type}</p><p className="mt-1 text-xs text-[#8a97aa]">{session.id}</p><p className="mt-2 text-sm text-[#526177]">{formatDate(session.date, { weekday: "short", day: "numeric", month: "short", year: "numeric" })} · {session.startTime}–{session.endTime}</p></div>
        <div className="flex shrink-0 gap-2"><button type="button" onClick={() => updatePTStatus(session.id, "completed", `Sesi ${session.id} ditandai selesai.`)} className="rounded-lg border border-emerald-200 px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-50">Tandai selesai</button><button type="button" onClick={() => cancelByTrainer(session)} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50">Batalkan sesi</button></div>
      </article>)}</div>
    </section>}

    <section className="mt-5 rounded-xl border border-[#e5e9ef] bg-white p-4 sm:p-6">
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center"><div><h2 className="text-lg font-extrabold text-[#263346]">Daftar sesi dan member</h2><p className="mt-1 text-sm text-[#7b899e]">Daftar booking PT dan member yang terdaftar di kelas. Tempat langsung tercatat selama slot atau kuota tersedia.</p></div><div className="flex flex-wrap gap-1.5">{FILTERS.map((item) => <button type="button" key={item.id} onClick={() => setFilter(item.id)} className={`rounded-lg px-3 py-2 text-xs font-bold transition ${filter === item.id ? "bg-[#fff0e5] text-[#e85f00]" : "bg-[#f5f7fa] text-[#74839a] hover:bg-[#edf0f5]"}`}>{item.label}</button>)}</div></div>
      <div className="mt-4 overflow-x-auto rounded-lg border border-[#e8ecf2]"><table className="w-full min-w-[740px] border-collapse text-left text-sm">
        <thead className="bg-[#f8fafc] text-xs uppercase tracking-wide text-[#8794a8]"><tr><th className="px-4 py-3 font-bold">Member / ID</th><th className="px-4 py-3 font-bold">Aktivitas</th><th className="px-4 py-3 font-bold">Tanggal & waktu</th><th className="px-4 py-3 font-bold">Catatan</th></tr></thead>
        <tbody className="divide-y divide-[#edf0f4]">{rows.length === 0 ? <tr><td colSpan={4} className="px-4 py-12 text-center text-sm text-[#8a97aa]">Belum ada booking PT atau peserta kelas pada filter ini.</td></tr> : rows.map((session) => <tr key={`${session.kind}-${session.id}`} className="align-top hover:bg-[#fcfdff]"><td className="px-4 py-4"><p className="font-bold text-[#344155]">{session.member || "Member"}</p><p className="mt-1 text-xs text-[#8a97aa]">{session.id}</p><span className={`mt-2 inline-flex rounded-full px-2 py-1 text-[10px] font-bold ${session.kind === "class" ? "bg-orange-50 text-orange-700" : "bg-slate-100 text-slate-600"}`}>{session.kind === "class" ? "Peserta kelas" : "Booking PT"}</span></td><td className="px-4 py-4 text-[#607089]">{session.type}</td><td className="px-4 py-4"><p className="font-semibold text-[#344155]">{formatDate(session.date, { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</p><p className="mt-1 text-xs text-[#8a97aa]">{session.startTime}–{session.endTime}</p></td><td className="max-w-[240px] px-4 py-4 text-xs leading-5 text-[#7b899e]">{session.note || "—"}{session.cancellationReason && <p className="mt-2 rounded bg-amber-50 p-2 text-[11px] leading-4 text-amber-800">Alasan: {session.cancellationReason}</p>}</td></tr>)}</tbody>
      </table></div>
    </section>

    {cancellationTarget && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#172033]/45 p-4 backdrop-blur-[2px]" onMouseDown={(event) => { if (event.target === event.currentTarget) setCancellationTarget(null); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="trainer-cancel-title" className="w-full max-w-lg rounded-2xl border border-[#e5e9ef] bg-white p-5 shadow-2xl sm:p-6">
        <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#f56600]">Sesi & Booking</p><h2 id="trainer-cancel-title" className="mt-1 text-xl font-black text-[#263346]">Batalkan sesi</h2><p className="mt-1 text-sm leading-6 text-[#7b899e]">Member menerima kembali satu sesi PT jika sesi berhasil dibatalkan.</p></div><button type="button" onClick={() => setCancellationTarget(null)} className="rounded-lg px-2 py-1 text-xl text-[#7b8798] hover:bg-slate-100" aria-label="Tutup dialog">×</button></div>
        <div className="mt-4 rounded-xl bg-[#f8fafc] p-3 text-sm"><p className="font-bold text-[#263346]">{cancellationTarget.member} · {cancellationTarget.type}</p><p className="mt-1 text-[#738095]">{formatDate(cancellationTarget.date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · {cancellationTarget.startTime}–{cancellationTarget.endTime}</p><p className="mt-1 text-xs text-[#8a97aa]">ID sesi: {cancellationTarget.id}</p></div>
        <form className="mt-4" onSubmit={submitTrainerCancellation}><label htmlFor="trainer-cancellation-reason" className="mb-2 block text-sm font-bold text-[#344155]">Alasan pembatalan</label><textarea id="trainer-cancellation-reason" value={cancellationReason} onChange={(event) => setCancellationReason(event.target.value)} minLength={3} required rows={4} placeholder="Contoh: trainer berhalangan hadir karena sakit..." className="w-full resize-y rounded-xl border border-[#dce2e9] px-3 py-2.5 text-sm text-[#263346] outline-none transition placeholder:text-[#a0aaba] focus:border-[#ff6b00] focus:ring-4 focus:ring-[#ff6b00]/10" /><div className="mt-4 flex flex-col-reverse justify-end gap-2 sm:flex-row"><button type="button" onClick={() => setCancellationTarget(null)} className="rounded-xl border border-[#dce2e9] px-4 py-2.5 text-sm font-bold text-[#68778d] hover:bg-slate-50">Kembali</button><button type="submit" disabled={cancellationReason.trim().length < 3} className="rounded-xl bg-[#ff6b00] px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-[#e85f00] disabled:cursor-not-allowed disabled:opacity-50">Konfirmasi pembatalan</button></div></form>
      </section>
    </div>}
  </TrainerPageLayout>;
}

function SummaryCard({ label, value, icon, accent, desc }) {
  return <article className="rounded-xl border border-[#e5e9ef] bg-white p-4"><div className="flex items-start justify-between gap-3"><p className="text-sm text-[#718099]">{label}</p><span className={`flex h-9 w-9 items-center justify-center rounded-xl ${accent ? "bg-[#fff1e7] text-[#f56600]" : "bg-[#f3f6fa] text-[#74849c]"}`}><AdminIcon name={icon} className="h-4 w-4" /></span></div><p className="mt-2 text-3xl font-extrabold text-[#263346]">{value}</p><p className="mt-1 text-xs text-[#8a97aa]">{desc}</p></article>;
}

export default TrainerBookingsPage;
