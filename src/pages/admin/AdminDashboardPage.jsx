import { Link } from "react-router-dom";
import AdminSidebar, { AdminIcon } from "../../components/AdminSidebar";

const stats = [
  { label: "Total Member", value: "1,248", note: "94 member dari bulan lalu", icon: "users", tone: "positive" },
  { label: "Revenue", value: "Rp 84.5M", note: "12.6% dari bulan lalu", icon: "wallet", tone: "positive" },
  { label: "Trainer Aktif", value: "6", note: "4 trainer tersedia hari ini", icon: "dumbbell", tone: "neutral" },
  { label: "Kelas Minggu Ini", value: "25", note: "5 penuh • 20 masih tersedia", icon: "calendar", tone: "neutral" },
];

const activities = [
  { title: "Member baru bergabung", detail: "Nadia Putri • Premium", time: "5 menit lalu", icon: "users" },
  { title: "Pembayaran membership diterima", detail: "Andi Pratama • Rp 500.000", time: "18 menit lalu", icon: "wallet" },
  { title: "Sesi personal training selesai", detail: "Coach Rizky • 2 sesi", time: "35 menit lalu", icon: "calendar" },
  { title: "Membership diperpanjang", detail: "Dewi Lestari • Plus", time: "1 jam lalu", icon: "activity" },
  { title: "Check-in member", detail: "Fajar Ramadhan • Basic", time: "1 jam lalu", icon: "users" },
];

function RevenueChart() {
  const points = "0,183 26,163 52,184 78,143 104,157 130,124 156,149 182,132 208,158 234,126 260,137 286,97 312,116 338,96 364,116 390,69 416,96 442,109 468,72 494,88 520,46 546,66 572,83 598,54 624,80 650,39 676,58 702,30 728,62 754,18";
  return (
    <svg viewBox="0 0 754 238" className="h-[230px] w-full" role="img" aria-label="Grafik pendapatan meningkat sepanjang September 2026">
      <defs>
        <linearGradient id="revenueArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff6b00" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#ff6b00" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[8, 62, 116, 170, 224].map((y) => <line key={y} x1="0" y1={y} x2="754" y2={y} stroke="#e7ebf1" strokeWidth="1" />)}
      <path d={`M ${points.replaceAll(" ", " L ")} L 754 224 L 0 224 Z`} fill="url(#revenueArea)" />
      <polyline points={points} fill="none" stroke="#ff6b00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <g fill="#8b97a8" fontSize="10">
        <text x="0" y="237">01 Sep</text><text x="163" y="237">06 Sep</text><text x="325" y="237">12 Sep</text><text x="487" y="237">18 Sep</text><text x="637" y="237">24 Sep</text><text x="716" y="237">30 Sep</text>
      </g>
    </svg>
  );
}

function StatCard({ item }) {
  return (
    <article className="rounded-xl border border-[#e5e9ef] bg-white p-5 shadow-[0_2px_7px_rgba(27,39,58,0.015)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-[#7b899e]">{item.label}</p>
        <span className="text-[#7889a2]"><AdminIcon name={item.icon} className="h-5 w-5" /></span>
      </div>
      <p className="mt-4 text-[30px] font-extrabold leading-none tracking-tight text-[#263346]">{item.value}</p>
      <p className={`mt-4 flex items-center gap-1.5 text-xs ${item.tone === "positive" ? "text-emerald-600" : "text-emerald-600"}`}>
        {item.tone === "positive" && <span aria-hidden="true">↗</span>}
        {item.note}
      </p>
    </article>
  );
}

function AdminDashboardPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#263346] md:flex">
      <AdminSidebar />

      <div className="min-w-0 flex-1">
        <header className="flex h-[70px] items-center border-b border-[#e5e9ef] bg-white px-5 sm:px-8 lg:px-10">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-[#8a97aa]">Workspace</span>
            <AdminIcon name="chevron" className="h-4 w-4 text-[#9aa5b4]" />
            <span className="font-semibold text-[#263346]">Dashboard</span>
          </div>
        </header>

        <div className="mx-auto max-w-[1600px] px-5 pb-6 pt-7 sm:px-8 lg:px-10 lg:pt-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.12em] text-[#ff6b00] sm:hidden">Admin workspace</p>
              <h1 className="text-2xl font-extrabold tracking-tight text-[#263346] sm:text-[30px]">Dashboard Utama</h1>
              <p className="mt-2 text-sm text-[#7b899e]">Selamat datang, Admin Putri. Berikut ringkasan operasional gym Anda.</p>
            </div>
            <Link to="/admin/members" className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-lg bg-[#ff6b00] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#ed6200] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#ff6b00]/20 sm:self-auto">
              <span className="text-lg leading-none">+</span> Tambah Member
            </Link>
          </div>

          <section aria-label="Ringkasan statistik" className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
            {stats.map((item) => <StatCard key={item.label} item={item} />)}
          </section>

          <section className="mt-6 grid grid-cols-1 gap-5 2xl:grid-cols-[minmax(0,1.7fr)_minmax(330px,0.9fr)]">
            <article className="min-w-0 rounded-xl border border-[#e5e9ef] bg-white p-5 sm:p-6">
              <header className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-[#2b3749]">Grafik Pendapatan 30 Hari</h2>
                  <p className="mt-1 text-xs text-[#8a97aa]">Performa pendapatan • September 2026</p>
                </div>
                <span className="hidden rounded-md bg-[#e9f8f1] px-2.5 py-1 text-xs font-bold text-emerald-700 sm:inline-flex">↗ 12.6%</span>
              </header>
              <div className="mt-5 flex flex-wrap items-baseline gap-3">
                <p className="text-[28px] font-extrabold tracking-tight text-[#263346] sm:text-[30px]">Rp 84.5M</p>
                <span className="rounded-md bg-[#e9f8f1] px-2 py-1 text-xs font-bold text-emerald-700 sm:hidden">↗ 12.6%</span>
                <span className="ml-auto text-[10px] text-[#8a97aa]">Dalam juta rupiah</span>
              </div>
              <div className="mt-1 pl-0">
                <div className="mb-1 flex h-[230px] items-stretch gap-3">
                  <div className="flex flex-col justify-between pb-5 pt-1 text-[10px] text-[#9aa5b4]">
                    <span>Rp 5M</span><span>Rp 4M</span><span>Rp 3M</span><span>Rp 2M</span><span>Rp 1M</span>
                  </div>
                  <div className="min-w-0 flex-1"><RevenueChart /></div>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-[#7b899e]">
                <span className="h-2 w-2 rounded-full bg-[#ff6b00]" /> Membership + Personal Training • 1–30 September 2026
              </div>
            </article>

            <article className="rounded-xl border border-[#e5e9ef] bg-white p-5 sm:p-6">
              <h2 className="text-base font-bold text-[#2b3749]">Aktivitas Terbaru</h2>
              <p className="mt-1 text-xs text-[#8a97aa]">Update terbaru dari BugarHub Senayan</p>
              <div className="mt-5 space-y-5">
                {activities.map((activity) => (
                  <div key={activity.title} className="flex gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff1e7] text-[#ff6b00]">
                      <AdminIcon name={activity.icon} className="h-[18px] w-[18px]" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold leading-5 text-[#344155]">{activity.title}</p>
                      <p className="mt-0.5 text-xs text-[#7b899e]">{activity.detail}</p>
                      <p className="mt-1 text-[11px] text-[#a0aaba]">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <article className="rounded-xl border border-[#e5e9ef] bg-white p-5 sm:p-6">
              <h2 className="text-base font-bold text-[#2b3749]">Target Pendapatan Bulanan</h2>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
                <span className="text-[#7b899e]">Rp 84.5M dari target Rp 100M</span>
                <span className="font-bold text-[#ff6b00]">84.5%</span>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#eef1f5]">
                <div className="h-full w-[84.5%] rounded-full bg-[#ff6b00]" />
              </div>
            </article>

            <article className="rounded-xl border border-[#e5e9ef] bg-white p-5 sm:p-6">
              <h2 className="text-base font-bold text-[#2b3749]">Ringkasan Member</h2>
              <div className="mt-5 grid grid-cols-1 items-center gap-4 sm:grid-cols-[1fr_1fr_auto]">
                <div>
                  <p className="text-[26px] font-extrabold leading-none text-[#263346]">1,186</p>
                  <p className="mt-2 text-xs text-emerald-600">Member aktif</p>
                </div>
                <div>
                  <p className="text-[26px] font-extrabold leading-none text-[#263346]">62</p>
                  <p className="mt-2 text-xs text-[#7b899e]">Membership berakhir</p>
                </div>
                <Link to="/admin/members" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#e0e5ec] px-4 text-sm font-semibold text-[#354156] transition hover:border-[#ff6b00] hover:text-[#e85f00]">
                  Kelola Member <AdminIcon name="arrow" className="h-4 w-4" />
                </Link>
              </div>
            </article>
          </section>

          <footer className="flex flex-col gap-2 pb-2 pt-6 text-[11px] text-[#a2adbc] sm:flex-row sm:items-center sm:justify-between">
            <span>© 2026 BugarHub • Admin workspace</span>
            <span>Terakhir diperbarui: 30 Sep 2026, 18:00 WIB</span>
          </footer>
          <p className="mt-2 rounded-lg border border-[#f5d4b6] bg-[#fff8f1] px-3 py-2 text-xs leading-5 text-[#9b5a22]">
            Catatan: seluruh angka, grafik pendapatan, dan aktivitas di dashboard ini merupakan data demo untuk pengembangan antarmuka, bukan data operasional aktual.
          </p>
        </div>
      </div>
    </main>
  );
}

export default AdminDashboardPage;
