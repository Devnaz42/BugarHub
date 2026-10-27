import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import TrainerPageLayout from "../../components/TrainerPageLayout";
import { AdminIcon } from "../../components/AdminSidebar";
import { getStaffSession } from "../../utils/staffSession";
import {
  addDays,
  formatDate,
  getMonday,
  getTrainerSessions,
  parseISODate,
  sessionStatusLabel,
  toISODate,
  TRAINER_SESSIONS_UPDATED_EVENT,
} from "../../utils/trainerWorkspaceData";
import { getTrainerAccountId, transitionPTBooking } from "../../utils/ptBookingData";

const DAY_NAMES = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
const TIME_SLOTS = Array.from({ length: 14 }, (_, index) => `${String(index + 8).padStart(2, "0")}:00`);
const DISPLAY_STATUSES = new Set(["confirmed", "cancellation_requested", "completed"]);

function dateRangeLabel(start) {
  const end = addDays(start, 6);
  if (start.getMonth() === end.getMonth()) {
    return `${start.getDate()}–${end.getDate()} ${end.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}`;
  }
  return `${start.toLocaleDateString("id-ID", { day: "numeric", month: "short" })} – ${end.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}`;
}

function timeMinutes(value = "08:00") {
  const [hours, minutes] = String(value).split(":").map(Number);
  return hours * 60 + minutes;
}

function rowForSession(session) {
  const hour = Math.floor(timeMinutes(session.startTime) / 60);
  return `${String(Math.max(8, Math.min(21, hour))).padStart(2, "0")}:00`;
}

function BookingCard({ session, onClick, compact = false }) {
  const canCancel = session.status === "confirmed";
  const tone = session.status === "completed"
    ? "border-violet-200 bg-violet-50 text-violet-800"
    : session.status === "cancellation_requested"
      ? "border-amber-200 bg-amber-50 text-amber-800"
      : "border-[#ffd4b3] bg-[#fff4eb] text-[#263346]";

  return (
    <button
      type="button"
      onClick={() => canCancel && onClick(session)}
      disabled={!canCancel}
      title={canCancel ? "Klik untuk membatalkan sesi" : sessionStatusLabel(session.status)}
      className={`block w-full rounded-lg border p-2 text-left transition ${tone} ${canCancel ? "cursor-pointer hover:border-[#ff9b57] hover:shadow-sm" : "cursor-default opacity-90"} ${compact ? "min-h-[56px]" : "min-h-[74px]"}`}
    >
      <span className="block text-[10px] font-bold">{session.startTime}–{session.endTime}</span>
      <span className="mt-1 block truncate text-xs font-extrabold leading-4">{session.member || "Member BugarHub"}</span>
      {session.status !== "confirmed" && <span className="mt-1 block truncate text-[9px] font-semibold">{sessionStatusLabel(session.status)}</span>}
    </button>
  );
}

function WeeklySchedule({ weekStart, selectedDate, sessions, onSelectDate, onCancel }) {
  const days = DAY_NAMES.map((name, index) => ({ name, date: addDays(weekStart, index) }));
  return (
    <div className="overflow-x-auto rounded-xl border border-[#e3e8ef] bg-white">
      <div className="min-w-[1050px]">
        <div className="grid border-b border-[#e3e8ef]" style={{ gridTemplateColumns: "56px repeat(7,minmax(0,1fr))" }}>
          <div className="flex items-center justify-center border-r border-[#e3e8ef] px-1 py-3 text-[10px] text-[#8997aa]">Waktu</div>
          {days.map(({ name, date }) => {
            const iso = toISODate(date);
            const active = iso === selectedDate;
            return <button key={iso} type="button" onClick={() => onSelectDate(iso)} className={`border-r border-[#e3e8ef] px-1 py-3 text-center last:border-r-0 ${active ? "bg-[#fff0e5]" : "hover:bg-[#f8fafc]"}`}>
              <span className={`block text-xs ${active ? "font-semibold text-[#e85f00]" : "text-[#7b899e]"}`}>{name}</span>
              <span className={`mt-1 block text-base font-semibold ${active ? "text-[#e85f00]" : "text-[#263346]"}`}>{date.getDate()}</span>
            </button>;
          })}
        </div>
        {TIME_SLOTS.map((slot) => (
          <div key={slot} className="grid border-b border-[#e8ecf2] last:border-b-0" style={{ gridTemplateColumns: "56px repeat(7,minmax(0,1fr))" }}>
            <div className="border-r border-[#e3e8ef] px-1 pt-3 text-center text-[10px] text-[#8997aa]">{slot}</div>
            {days.map(({ date }) => {
              const iso = toISODate(date);
              const events = sessions.filter((item) => item.date === iso && rowForSession(item) === slot);
              return <div key={`${iso}-${slot}`} className={`min-h-[96px] border-r border-[#e3e8ef] p-1.5 last:border-r-0 ${iso === selectedDate ? "bg-[#fffaf6]" : "bg-[#fcfdff]"}`}>
                <div className="flex flex-col gap-1.5">{events.map((item) => <BookingCard key={item.id} session={item} onClick={onCancel} />)}</div>
              </div>;
            })}
          </div>
        ))}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-[11px] text-[#8391a5]">
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#ff6b00]" /> Sesi terjadwal · klik sesi aktif untuk membatalkan</span>
          <span>{sessions.filter((item) => item.date >= toISODate(weekStart) && item.date <= toISODate(addDays(weekStart, 6))).length} sesi minggu ini</span>
        </div>
      </div>
    </div>
  );
}

function MonthlySchedule({ weekStart, selectedDate, sessions, onSelectDate, onCancel }) {
  const monthFirst = new Date(weekStart.getFullYear(), weekStart.getMonth(), 1);
  const monthLast = new Date(weekStart.getFullYear(), weekStart.getMonth() + 1, 0);
  const leading = (monthFirst.getDay() + 6) % 7;
  const days = Array.from({ length: leading + monthLast.getDate() }, (_, index) => index < leading ? null : new Date(weekStart.getFullYear(), weekStart.getMonth(), index - leading + 1));
  while (days.length % 7 !== 0) days.push(null);

  return (
    <div className="overflow-x-auto rounded-xl border border-[#e3e8ef] bg-white p-3 sm:p-4">
      <div className="min-w-[740px]">
        <div className="grid grid-cols-7 border-b border-[#e3e8ef] pb-2 text-center text-xs font-semibold text-[#7b899e]">{DAY_NAMES.map((day) => <div key={day} className="py-2">{day}</div>)}</div>
        <div className="grid grid-cols-7">{days.map((date, index) => {
          if (!date) return <div key={`empty-${index}`} className="min-h-[118px] border-b border-r border-[#edf0f4] bg-[#fcfdff]" />;
          const iso = toISODate(date);
          const dayItems = sessions.filter((item) => item.date === iso).sort((a, b) => a.startTime.localeCompare(b.startTime));
          return <div key={iso} className={`min-h-[118px] border-b border-r border-[#edf0f4] p-2 ${iso === selectedDate ? "bg-[#fffaf6]" : "bg-white"}`}>
            <button type="button" onClick={() => onSelectDate(iso)} className={`text-xs font-bold ${iso === selectedDate ? "text-[#e85f00]" : "text-[#344155]"}`}>{date.getDate()}</button>
            <div className="mt-2 space-y-1">{dayItems.slice(0, 3).map((item) => <BookingCard key={item.id} session={item} onClick={onCancel} compact />)}{dayItems.length > 3 && <p className="text-[10px] text-[#8491a5]">+{dayItems.length - 3} sesi lainnya</p>}</div>
          </div>;
        })}</div>
      </div>
    </div>
  );
}

function TrainerSchedulePage() {
  const trainer = getStaffSession();
  const trainerId = getTrainerAccountId(trainer);
  const [allSessions, setAllSessions] = useState(getTrainerSessions);
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => toISODate(new Date()));
  const [viewMode, setViewMode] = useState("Minggu");
  const [cancellationTarget, setCancellationTarget] = useState(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const refresh = () => setAllSessions(getTrainerSessions());
    window.addEventListener(TRAINER_SESSIONS_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(TRAINER_SESSIONS_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const sessions = useMemo(() => allSessions
    .filter((item) => String(item.trainerId || "trainer-001") === trainerId && DISPLAY_STATUSES.has(item.status))
    .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`)), [allSessions, trainerId]);

  const weekSessions = sessions.filter((item) => item.date >= toISODate(weekStart) && item.date <= toISODate(addDays(weekStart, 6)));
  const currentConfirmed = sessions.filter((item) => item.status === "confirmed" && item.date >= toISODate(new Date())).length;
  const pendingCancellation = sessions.filter((item) => item.status === "cancellation_requested").length;

  if (!trainer || trainer.role !== "trainer") return <Navigate to="/admin/login" replace />;

  function moveWeek(amount) {
    const next = addDays(weekStart, amount * 7);
    setWeekStart(next);
    setSelectedDate(toISODate(next));
  }

  function openCancellation(session) {
    if (session.status !== "confirmed") return;
    setCancellationTarget(session);
    setCancellationReason("");
    setNotice("");
  }

  function submitCancellation(event) {
    event.preventDefault();
    const reason = cancellationReason.trim();
    if (!cancellationTarget || reason.length < 3) return;

    const result = transitionPTBooking(cancellationTarget.id, "cancelled", {
      cancellationReason: reason,
      cancellationRequestedBy: "trainer",
      cancellationDecision: "trainer_cancelled",
    });
    if (!result.ok) {
      setNotice("Sesi belum berhasil dibatalkan. Muat ulang halaman dan coba lagi.");
      setCancellationTarget(null);
      return;
    }
    setAllSessions(getTrainerSessions());
    setNotice(`Sesi ${cancellationTarget.member || "member"} berhasil dibatalkan.${result.booking.ptCreditRefunded ? " Satu sesi PT dikembalikan ke saldo member." : ""}`);
    setCancellationTarget(null);
    setCancellationReason("");
  }

  return (
    <TrainerPageLayout title="Jadwal" showHeading>
      {notice && <div role="status" aria-live="polite" className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-[#cfeedd] bg-[#f0fbf5] px-4 py-3 text-sm text-[#176b43]"><span>{notice}</span><button type="button" onClick={() => setNotice("")} aria-label="Tutup pemberitahuan" className="font-bold">×</button></div>}
      <section className="rounded-xl border border-[#e5e9ef] bg-white p-4 shadow-[0_2px_7px_rgba(27,39,58,0.015)] sm:p-5">
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => moveWeek(-1)} aria-label="Minggu sebelumnya" className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e1e6ed] text-[#69798f] hover:bg-[#f8fafc]">‹</button>
            <button type="button" onClick={() => { const monday = getMonday(new Date()); setWeekStart(monday); setSelectedDate(toISODate(new Date())); }} className="h-9 rounded-lg border border-[#e1e6ed] px-3 text-xs font-bold text-[#526177] hover:bg-[#f8fafc]">Hari ini</button>
            <button type="button" onClick={() => moveWeek(1)} aria-label="Minggu berikutnya" className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e1e6ed] text-[#69798f] hover:bg-[#f8fafc]">›</button>
            <span className="ml-1 text-sm font-bold text-[#344155]">{viewMode === "Minggu" ? dateRangeLabel(weekStart) : weekStart.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}</span>
            <input aria-label="Pilih tanggal" type="date" value={selectedDate} onChange={(event) => { const date = parseISODate(event.target.value); setSelectedDate(event.target.value); setWeekStart(getMonday(date)); }} className="ml-0 h-9 rounded-lg border border-[#e1e6ed] px-2 text-xs text-[#526177] sm:ml-2" />
          </div>
          <div className="inline-flex w-fit rounded-lg bg-[#f3f5f8] p-1">
            <button type="button" onClick={() => setViewMode("Minggu")} className={`rounded-md px-4 py-2 text-xs font-bold ${viewMode === "Minggu" ? "bg-white text-[#344155] shadow-sm" : "text-[#8491a5] hover:text-[#344155]"}`}>Minggu</button>
            <button type="button" onClick={() => setViewMode("Bulan")} className={`rounded-md px-4 py-2 text-xs font-bold ${viewMode === "Bulan" ? "bg-white text-[#344155] shadow-sm" : "text-[#8491a5] hover:text-[#344155]"}`}>Bulan</button>
          </div>
        </div>
        <div className="mt-4">{viewMode === "Minggu"
          ? <WeeklySchedule weekStart={weekStart} selectedDate={selectedDate} sessions={sessions} onSelectDate={setSelectedDate} onCancel={openCancellation} />
          : <MonthlySchedule weekStart={weekStart} selectedDate={selectedDate} sessions={sessions} onSelectDate={setSelectedDate} onCancel={openCancellation} />}</div>
      </section>

      <section className="mt-5 grid gap-4 md:grid-cols-3">
        <InfoCard label="Sesi minggu ini" value={String(weekSessions.length)} desc="Booking PT pada kalender minggu ini" icon="calendar" />
        <InfoCard label="Sesi terkonfirmasi" value={String(currentConfirmed)} desc="Sesi mendatang yang masih aktif" icon="activity" />
        <InfoCard label="Permintaan pembatalan" value={String(pendingCancellation)} desc="Ajukan persetujuan dari menu Sesi & Booking" icon="clock" />
      </section>

      {cancellationTarget && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#172033]/45 p-4 backdrop-blur-[2px]" onMouseDown={(event) => { if (event.target === event.currentTarget) setCancellationTarget(null); }}>
        <section role="dialog" aria-modal="true" aria-labelledby="calendar-cancel-title" className="w-full max-w-lg rounded-2xl border border-[#e5e9ef] bg-white p-5 shadow-2xl sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#f56600]">Jadwal PT / Coach</p><h2 id="calendar-cancel-title" className="mt-1 text-xl font-black text-[#263346]">Batalkan sesi</h2><p className="mt-1 text-sm leading-6 text-[#7b899e]">Sesi akan dihapus dari jadwal aktif. Member mendapatkan kembali satu sesi PT jika saldo sudah digunakan.</p></div>
            <button type="button" onClick={() => setCancellationTarget(null)} className="rounded-lg px-2 py-1 text-xl text-[#7b8798] hover:bg-slate-100" aria-label="Tutup dialog">×</button>
          </div>
          <div className="mt-4 rounded-xl bg-[#f8fafc] p-3 text-sm"><p className="font-bold text-[#263346]">{cancellationTarget.member || "Member BugarHub"}</p><p className="mt-1 text-[#738095]">{formatDate(cancellationTarget.date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · {cancellationTarget.startTime}–{cancellationTarget.endTime}</p><p className="mt-1 text-xs text-[#8a97aa]">ID sesi: {cancellationTarget.id}</p></div>
          <form className="mt-4" onSubmit={submitCancellation}>
            <label htmlFor="schedule-cancel-reason" className="mb-2 block text-sm font-bold text-[#344155]">Alasan pembatalan</label>
            <textarea id="schedule-cancel-reason" value={cancellationReason} onChange={(event) => setCancellationReason(event.target.value)} minLength={3} required rows={4} placeholder="Tuliskan alasan pembatalan sesi..." className="w-full resize-y rounded-xl border border-[#dce2e9] px-3 py-2.5 text-sm text-[#263346] outline-none transition placeholder:text-[#a0aaba] focus:border-[#ff6b00] focus:ring-4 focus:ring-[#ff6b00]/10" />
            <div className="mt-4 flex flex-col-reverse justify-end gap-2 sm:flex-row"><button type="button" onClick={() => setCancellationTarget(null)} className="rounded-xl border border-[#dce2e9] px-4 py-2.5 text-sm font-bold text-[#68778d] hover:bg-slate-50">Kembali</button><button type="submit" disabled={cancellationReason.trim().length < 3} className="rounded-xl bg-[#ff6b00] px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-[#e85f00] disabled:cursor-not-allowed disabled:opacity-50">Konfirmasi pembatalan</button></div>
          </form>
        </section>
      </div>}
    </TrainerPageLayout>
  );
}

function InfoCard({ label, value, desc, icon }) {
  return <article className="rounded-xl border border-[#e5e9ef] bg-white p-4"><div className="flex items-start justify-between gap-3"><p className="text-sm text-[#718099]">{label}</p><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f3f6fa] text-[#74849c]"><AdminIcon name={icon} className="h-4 w-4" /></span></div><p className="mt-2 text-2xl font-extrabold text-[#263346]">{value}</p><p className="mt-1 text-xs leading-5 text-[#8a97aa]">{desc}</p></article>;
}

export default TrainerSchedulePage;
