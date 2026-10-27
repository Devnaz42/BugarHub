import { Link, Navigate } from "react-router-dom";
import TrainerPageLayout from "../../components/TrainerPageLayout";
import { AdminIcon } from "../../components/AdminSidebar";
import { getStaffSession } from "../../utils/staffSession";
import { getTrainerSessions } from "../../utils/trainerWorkspaceData";
import { getTrainerAccountId } from "../../utils/ptBookingData";

function TrainerStatisticsPage() {
  const trainer = getStaffSession();
  const trainerId = getTrainerAccountId(trainer);
  const sessions = getTrainerSessions().filter((session) => String(session.trainerId || "trainer-001") === trainerId);
  if (!trainer || trainer.role !== "trainer") return <Navigate to="/admin/login" replace />;

  const monthLabel = new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" });
  const currentMonthSessions = sessions.filter((session) => {
    const date = new Date(`${session.date}T12:00:00`);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });
  const completed = currentMonthSessions.filter((item) => item.status === "completed").length;
  const cancelled = currentMonthSessions.filter((item) => item.status === "cancelled").length;
  const confirmed = currentMonthSessions.filter((item) => item.status === "confirmed").length;
  const now = new Date();
  const monthlyBars = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
    const label = date.toLocaleDateString("id-ID", { month: "short" });
    // Chart structure is ready to use real aggregated API values later.
    const value = index === 5 ? Math.max(currentMonthSessions.filter((item) => item.status === "completed").length, 1) : [12, 15, 11, 19, 16][index];
    return { label, value };
  });
  const maxBar = Math.max(...monthlyBars.map((bar) => bar.value), 1);

  return <TrainerPageLayout title="Statistik Sesi" subtitle="Pantau total sesi latihan, pembatalan, dan aktivitasmu dalam periode berjalan.">
    <section className="flex flex-col justify-between gap-3 rounded-2xl border border-[#e5e9ef] bg-white p-5 sm:flex-row sm:items-center sm:p-6"><div><p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#ff6b00]">Periode laporan</p><h2 className="mt-1 text-xl font-extrabold text-[#263346]">{monthLabel}</h2><p className="mt-1 text-sm text-[#7b899e]">Ringkasan aktivitas berdasarkan sesi yang tercatat.</p></div><Link to="/trainer/bookings" className="inline-flex min-h-10 w-fit items-center gap-2 rounded-lg border border-[#ffd7bd] px-4 text-sm font-bold text-[#e85f00] hover:bg-[#fff8f3]">Lihat sesi <AdminIcon name="chevron" className="h-4 w-4" /></Link></section>

    <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Stat label="Sesi selesai" value={String(completed)} detail="Pada bulan berjalan" icon="check" />
      <Stat label="Sesi terkonfirmasi" value={String(confirmed)} detail="Menunggu pelaksanaan" icon="calendar" />
      <Stat label="Sesi dibatalkan" value={String(cancelled)} detail="Pada bulan berjalan" icon="clock" />
      <Stat label="Total sesi" value={String(completed + confirmed)} detail="Sesi selesai + sedang berjalan" icon="calendar" />
    </section>

    <section className="mt-5 grid gap-5 xl:grid-cols-[1.3fr_0.9fr]">
      <article className="rounded-xl border border-[#e5e9ef] bg-white p-5 sm:p-6"><div><h2 className="text-lg font-extrabold text-[#263346]">Tren penyelesaian sesi</h2><p className="mt-1 text-sm text-[#7b899e]">Perbandingan enam bulan terakhir.</p></div><div className="mt-6 flex h-64 items-end gap-3 border-b border-[#e8ecf2] px-1 pb-0 sm:gap-5 sm:px-3">{monthlyBars.map((bar) => <div key={bar.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><span className="text-xs font-bold text-[#65758c]">{bar.value}</span><div className="flex w-full max-w-[48px] items-end justify-center" style={{ height: "78%" }}><div title={`${bar.value} sesi`} className="w-full rounded-t-lg bg-[#ff8b3d] transition-all" style={{ height: `${Math.max((bar.value / maxBar) * 100, 5)}%` }} /></div><span className="pb-2 text-xs font-semibold text-[#8997aa]">{bar.label}</span></div>)}</div><p className="mt-3 text-xs leading-5 text-[#94a0b1]">Grafik ini menggunakan data agregat yang perlu diganti dengan hasil API ketika backend terhubung.</p></article>
      <article className="rounded-xl border border-[#e5e9ef] bg-white p-5 sm:p-6"><h2 className="text-lg font-extrabold text-[#263346]">Ringkasan aktivitas</h2><p className="mt-1 text-sm text-[#7b899e]">Status sesi dalam periode ini.</p><div className="mt-5 space-y-4"><ProgressRow label="Selesai" value={completed} total={Math.max(currentMonthSessions.length, 1)} color="bg-emerald-500" /><ProgressRow label="Dikonfirmasi" value={confirmed} total={Math.max(currentMonthSessions.length, 1)} color="bg-[#ff8b3d]" /><ProgressRow label="Dibatalkan" value={cancelled} total={Math.max(currentMonthSessions.length, 1)} color="bg-slate-400" /></div><div className="mt-6 rounded-xl bg-[#f8fafc] p-4"><p className="text-sm font-bold text-[#344155]">Tips untuk evaluasi</p><p className="mt-1 text-xs leading-5 text-[#7b899e]">Pantau status sesi dan pembatalan secara berkala agar jadwal latihan tetap akurat.</p></div></article>
    </section>

  </TrainerPageLayout>;
}

function Stat({ label, value, detail, icon }) { return <article className="rounded-xl border border-[#e5e9ef] bg-white p-4"><div className="flex items-start justify-between gap-3"><p className="text-sm text-[#718099]">{label}</p><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f3f6fa] text-[#74849c]"><AdminIcon name={icon} className="h-4 w-4" /></span></div><p className="mt-2 text-3xl font-extrabold text-[#263346]">{value}</p><p className="mt-1 text-xs text-[#8a97aa]">{detail}</p></article>; }
function ProgressRow({ label, value, total, color }) { const width = Math.min(100, (value / total) * 100); return <div><div className="mb-2 flex items-center justify-between gap-3 text-sm"><span className="font-semibold text-[#526177]">{label}</span><span className="text-xs font-bold text-[#7b899e]">{value}</span></div><div className="h-2.5 overflow-hidden rounded-full bg-[#edf1f6]"><div className={`h-full rounded-full ${color}`} style={{ width: `${width}%` }} /></div></div>; }

export default TrainerStatisticsPage;
