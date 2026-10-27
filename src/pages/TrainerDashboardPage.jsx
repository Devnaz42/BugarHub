import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import TrainerPageLayout from "../components/TrainerPageLayout";
import { AdminIcon } from "../components/AdminSidebar";
import { getStaffSession } from "../utils/staffSession";
import {
  formatDate,
  getTrainerSessions,
  sessionStatusLabel,
  TRAINER_FEEDBACK,
  TRAINER_SESSIONS_UPDATED_EVENT,
} from "../utils/trainerWorkspaceData";
import { getTrainerAccountId } from "../utils/ptBookingData";
import { CLASS_RESERVATIONS_UPDATED_EVENT, getClassReservations } from "../utils/classReservationData";

function statusStyle(status) {
  if (status === "requested") return "bg-blue-50 text-blue-700";
  if (status === "cancellation_requested") return "bg-amber-50 text-amber-700";
  if (status === "completed") return "bg-violet-50 text-violet-700";
  if (status === "cancelled" || status === "declined") return "bg-slate-100 text-slate-600";
  return "bg-emerald-50 text-emerald-700";
}

function TrainerDashboardPage() {
  const trainer = getStaffSession();
  const trainerId = getTrainerAccountId(trainer);
  const [allSessions, setAllSessions] = useState(getTrainerSessions);
  const [classReservations, setClassReservations] = useState(getClassReservations);

  useEffect(() => {
    const refresh = () => setAllSessions(getTrainerSessions());
    const refreshClasses = () => setClassReservations(getClassReservations());
    window.addEventListener(TRAINER_SESSIONS_UPDATED_EVENT, refresh);
    window.addEventListener(CLASS_RESERVATIONS_UPDATED_EVENT, refreshClasses);
    window.addEventListener("storage", refresh);
    window.addEventListener("storage", refreshClasses);
    return () => {
      window.removeEventListener(TRAINER_SESSIONS_UPDATED_EVENT, refresh);
      window.removeEventListener(CLASS_RESERVATIONS_UPDATED_EVENT, refreshClasses);
      window.removeEventListener("storage", refresh);
      window.removeEventListener("storage", refreshClasses);
    };
  }, []);

  const sessions = useMemo(() => allSessions.filter((item) => String(item.trainerId || "trainer-001") === trainerId), [allSessions, trainerId]);
  if (!trainer || trainer.role !== "trainer") return <Navigate to="/admin/login" replace />;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const monthSessions = sessions.filter((item) => {
    const date = new Date(`${item.date}T12:00:00`);
    return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  });
  const confirmedCount = sessions.filter((item) => item.status === "confirmed").length;
  const classParticipantCount = classReservations.filter((item) => item.reservationType === "trainer_class" && String(item.trainerId || "trainer-001") === trainerId && ["confirmed", "completed"].includes(item.status)).length;
  const cancellationCount = sessions.filter((item) => item.status === "cancellation_requested").length;
  const completedThisMonth = monthSessions.filter((item) => item.status === "completed").length;
  const upcoming = sessions
    .filter((item) => item.date >= todayISO && ["requested", "confirmed", "cancellation_requested"].includes(item.status))
    .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`))
    .slice(0, 6);
  const specialties = trainer.specialties?.length ? trainer.specialties : ["Personal Training"];

  return (
    <TrainerPageLayout title="Dashboard PT / Coach" subtitle="Pantau sesi mendatang, permintaan booking, pembatalan, dan feedback member dari satu tempat." actions={<Link to="/trainer/bookings" className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#ff6b00] px-4 text-sm font-bold text-white transition hover:bg-[#eb6200]"><AdminIcon name="calendar" className="h-4 w-4" />Kelola sesi</Link>}>
      <section className="flex flex-col justify-between gap-5 rounded-2xl border border-[#e5e9ef] bg-white p-6 sm:p-8 lg:flex-row lg:items-center">
        <div><p className="mb-1 text-xs font-bold uppercase tracking-[0.12em] text-[#ff6b00]">PT / Coach workspace</p><h2 className="text-2xl font-extrabold tracking-tight text-[#263346] sm:text-[30px]">Halo, {trainer.name?.split(/\s+/)[0] || "Trainer"}!</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[#7b899e]">Lihat jadwal latihan, tinjau sesi member, dan pantau ringkasan aktivitasmu dari workspace BugarHub.</p></div>
        <div className="flex flex-wrap gap-2">{specialties.map((specialty) => <span key={specialty} className="rounded-full border border-[#f5d4bd] bg-[#fff7f1] px-3 py-2 text-xs font-semibold text-[#9a4f1b]">{specialty}</span>)}</div>
      </section>

      <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Booking PT aktif" value={confirmedCount} desc="Slot yang berhasil diambil" icon="calendar" />
        <MetricCard label="Peserta kelas" value={classParticipantCount} desc="Member yang telah bergabung" icon="activity" />
        <MetricCard label="Permintaan pembatalan" value={cancellationCount} desc="Menunggu keputusanmu" icon="clock" accent={cancellationCount > 0} />
        <MetricCard label="Sesi selesai bulan ini" value={completedThisMonth} desc="Berdasarkan sesi tercatat" icon="check" />
      </section>

      <section className="mt-5 rounded-2xl border border-[#e5e9ef] bg-white p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><h2 className="text-lg font-extrabold text-[#263346]">Jadwal sesi mendatang</h2><p className="mt-1 text-sm text-[#7b899e]">Booking PT dan sesi terjadwal muncul di tabel ini tanpa menunggu konfirmasi trainer.</p></div><Link to="/trainer/schedule" className="inline-flex min-h-9 w-fit items-center gap-2 rounded-lg border border-[#ffd4b3] px-3 text-sm font-bold text-[#e85f00] hover:bg-[#fff8f3]"><AdminIcon name="calendar" className="h-4 w-4" />Jadwal</Link></div>
        <div className="mt-4 overflow-x-auto rounded-xl border border-[#e8ecf2]"><table className="w-full min-w-[740px] border-collapse text-left text-sm"><thead className="bg-[#f8fafc] text-xs uppercase tracking-wide text-[#8794a8]"><tr><th className="px-4 py-3">Member</th><th className="px-4 py-3">Sesi</th><th className="px-4 py-3">Tanggal & waktu</th><th className="px-4 py-3">Status</th></tr></thead><tbody className="divide-y divide-[#edf0f4]">{upcoming.length === 0 ? <tr><td colSpan="4" className="px-4 py-10 text-center text-sm text-[#8a97aa]">Belum ada sesi mendatang. Booking yang berhasil diambil member akan muncul otomatis di sini.</td></tr> : upcoming.map((item) => <tr key={item.id} className="hover:bg-[#fcfdff]"><td className="px-4 py-4"><p className="font-bold text-[#344155]">{item.member || "Member"}</p><p className="mt-1 text-xs text-[#8a97aa]">{item.id}</p></td><td className="px-4 py-4 text-[#607089]">{item.type}</td><td className="px-4 py-4"><p className="font-semibold text-[#344155]">{formatDate(item.date, { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</p><p className="mt-1 text-xs text-[#8a97aa]">{item.startTime}–{item.endTime}</p></td><td className="px-4 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${statusStyle(item.status)}`}>{sessionStatusLabel(item.status)}</span></td></tr>)}</tbody></table></div>
        <div className="mt-4 flex justify-end"><Link to="/trainer/bookings" className="inline-flex items-center gap-2 text-sm font-bold text-[#e85f00] hover:underline">Lihat semua sesi <AdminIcon name="chevron" className="h-4 w-4" /></Link></div>
      </section>

      <section className="mt-5 rounded-2xl border border-[#e5e9ef] bg-white p-5 sm:p-6"><div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-lg font-extrabold text-[#263346]">Feedback member terbaru</h2><p className="mt-1 text-sm text-[#7b899e]">Tinjau komentar untuk mengevaluasi pengalaman latihan member.</p></div><Link to="/trainer/statistics" className="text-sm font-bold text-[#e85f00] hover:underline">Buka statistik</Link></div><div className="mt-4 grid gap-3 lg:grid-cols-3">{TRAINER_FEEDBACK.slice(0, 3).map((feedback) => <article key={feedback.id} className="rounded-xl border border-[#edf0f4] p-4"><div className="flex items-start justify-between gap-2"><div><h3 className="text-sm font-bold text-[#344155]">{feedback.member}</h3><p className="mt-1 text-xs text-[#8a97aa]">{feedback.activity} · {feedback.dateLabel}</p></div><span className="whitespace-nowrap text-xs font-bold text-[#a56a00]">{"★".repeat(feedback.rating)} {feedback.rating}/5</span></div><p className="mt-3 text-sm leading-6 text-[#64748b]">“{feedback.comment}”</p></article>)}</div></section>
    </TrainerPageLayout>
  );
}

function MetricCard({ label, value, desc, icon, accent }) {
  return <article className="rounded-xl border border-[#e5e9ef] bg-white p-4"><div className="flex items-start justify-between gap-3"><p className="text-sm text-[#718099]">{label}</p><span className={`flex h-9 w-9 items-center justify-center rounded-xl ${accent ? "bg-[#fff1e7] text-[#f56600]" : "bg-[#f3f6fa] text-[#74849c]"}`}><AdminIcon name={icon} className="h-4 w-4" /></span></div><p className="mt-2 text-3xl font-extrabold text-[#263346]">{value}</p><p className="mt-1 text-xs text-[#8a97aa]">{desc}</p></article>;
}

export default TrainerDashboardPage;
