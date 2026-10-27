import AdminSidebar, { AdminIcon } from "../../components/AdminSidebar";

const monthlyRevenue = [
  { month: "Apr 2026", membership: 36, personalTraining: 22, total: 58 },
  { month: "Mei 2026", membership: 40, personalTraining: 24, total: 64 },
  { month: "Jun 2026", membership: 42.5, personalTraining: 26, total: 68.5 },
  { month: "Jul 2026", membership: 46, personalTraining: 26, total: 72 },
  { month: "Agu 2026", membership: 47, personalTraining: 28, total: 75 },
  { month: "Sep 2026", membership: 52, personalTraining: 32.5, total: 84.5 },
];

const salesRows = [
  { item: "Membership Basic", transactions: 65, price: "Rp 300.000", revenue: "Rp 19.500.000", contribution: "23.1%" },
  { item: "Membership Plus", transactions: 40, price: "Rp 500.000", revenue: "Rp 20.000.000", contribution: "23.7%" },
  { item: "Membership Premium", transactions: 10, price: "Rp 1.250.000", revenue: "Rp 12.500.000", contribution: "14.8%" },
  { item: "Personal Training", transactions: 65, price: "Rp 500.000", revenue: "Rp 32.500.000", contribution: "38.4%" },
];

const stats = [
  { label: "Membership Revenue", value: "Rp 52M", note: "8.3% dari Agustus • 115 transaksi", icon: "wallet" },
  { label: "PT Revenue", value: "Rp 32.5M", note: "20.4% dari Agustus • 65 transaksi", icon: "dumbbell" },
  { label: "Total Revenue", value: "Rp 84.5M", note: "12.6% dari Agustus • 180 transaksi", icon: "wallet" },
];

function RevenueBars() {
  const plot = { left: 78, top: 20, width: 910, height: 190 };
  const yFor = (value) => plot.top + plot.height - (value / 100) * plot.height;
  const barWidth = 54;
  const slotWidth = plot.width / monthlyRevenue.length;

  return (
    <svg viewBox="0 0 1010 260" className="mt-5 h-[270px] w-full" role="img" aria-label="Grafik batang pendapatan per bulan dari April sampai September 2026">
      {[0, 25, 50, 75, 100].map((tick) => {
        const y = yFor(tick);
        return (
          <g key={tick}>
            <line x1={plot.left} y1={y} x2={plot.left + plot.width} y2={y} stroke="#e7ebf1" strokeWidth="1" />
            <text x="0" y={y + 4} fill="#8a97aa" fontSize="12">{tick === 0 ? "0" : `${tick}M`}</text>
          </g>
        );
      })}
      {monthlyRevenue.map((month, index) => {
        const x = plot.left + slotWidth * index + (slotWidth - barWidth) / 2;
        const membershipHeight = (month.membership / 100) * plot.height;
        const ptHeight = (month.personalTraining / 100) * plot.height;
        const membershipY = plot.top + plot.height - membershipHeight;
        const ptY = membershipY - ptHeight;
        return (
          <g key={month.month}>
            <rect x={x} y={membershipY} width={barWidth} height={membershipHeight} rx="2" fill="#ff6b00" />
            <rect x={x} y={ptY} width={barWidth} height={ptHeight} rx="3" fill="#ffb27d" />
            <text x={x + barWidth / 2} y={ptY - 9} textAnchor="middle" fill="#344054" fontSize="13" fontWeight="700">{month.total}M</text>
            <text x={x + barWidth / 2} y={plot.top + plot.height + 23} textAnchor="middle" fill={index === monthlyRevenue.length - 1 ? "#e85f00" : "#7b899e"} fontSize="12" fontWeight={index === monthlyRevenue.length - 1 ? "700" : "400"}>{month.month}</text>
          </g>
        );
      })}
    </svg>
  );
}

function ReportStatCard({ item }) {
  return (
    <article className="rounded-xl border border-[#e5e9ef] bg-white p-5 shadow-[0_2px_7px_rgba(27,39,58,0.015)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-[#7b899e]">{item.label}</p>
        <span className="text-[#7889a2]"><AdminIcon name={item.icon} className="h-5 w-5" /></span>
      </div>
      <p className="mt-4 text-[28px] font-extrabold leading-none tracking-tight text-[#263346] sm:text-[30px]">{item.value}</p>
      <p className="mt-4 flex items-center gap-1.5 text-xs text-emerald-600"><span aria-hidden="true">↗</span>{item.note}</p>
    </article>
  );
}

function AdminReportsPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#263346] md:flex">
      <div className="print:hidden"><AdminSidebar /></div>

      <div className="min-w-0 flex-1">
        <header className="flex h-[70px] items-center border-b border-[#e5e9ef] bg-white px-5 sm:px-8 lg:px-10 print:hidden">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-[#8a97aa]">Workspace</span>
            <AdminIcon name="chevron" className="h-4 w-4 text-[#9aa5b4]" />
            <span className="font-semibold text-[#263346]">Laporan</span>
          </div>
        </header>

        <div className="mx-auto max-w-[1600px] px-5 pb-6 pt-7 sm:px-8 lg:px-10 lg:pt-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-[#263346] sm:text-[30px]">Laporan Keuangan &amp; Analytics</h1>
              <p className="mt-2 text-sm text-[#7b899e]">Pantau pendapatan dan performa penjualan BugarHub Senayan.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 print:hidden">
              <span className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#e5e9ef] bg-white px-4 text-sm font-semibold text-[#344054]">
                <AdminIcon name="calendar" className="h-4 w-4" />1–30 Sep 2026
              </span>
              <button type="button" onClick={() => window.print()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#ff6b00] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#ed6200] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#ff6b00]/20">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5M12 15V3"/></svg>
                Export PDF
              </button>
            </div>
          </div>

          <section aria-label="Ringkasan pendapatan" className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {stats.map((item) => <ReportStatCard key={item.label} item={item} />)}
          </section>

          <section className="mt-6 rounded-xl border border-[#e5e9ef] bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-[#2b3749]">Pendapatan Per Bulan</h2>
                <p className="mt-1 text-xs text-[#8a97aa]">Tren 6 bulan terakhir • April–September 2026</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-5 text-xs text-[#7b899e]">
              <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#ff6b00]" />Membership</span>
              <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#ffb27d]" />Personal Training</span>
              <span className="text-[#a0aaba]">Dalam juta rupiah</span>
            </div>
            <RevenueBars />
          </section>

          <section className="mt-6 overflow-hidden rounded-xl border border-[#e5e9ef] bg-white">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5e9ef] px-5 py-4 sm:px-6">
              <h2 className="text-base font-bold text-[#2b3749]">Rincian Penjualan</h2>
              <span className="rounded-md bg-[#f4f6f9] px-3 py-1.5 text-xs font-semibold text-[#7b899e]">September 2026</span>
            </header>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead className="bg-[#f4f6f8] text-xs font-semibold text-[#7b899e]">
                  <tr>
                    <th className="px-5 py-3.5 sm:px-6">Produk / Layanan</th>
                    <th className="px-4 py-3.5">Transaksi</th>
                    <th className="px-4 py-3.5">Harga per Transaksi</th>
                    <th className="px-4 py-3.5">Pendapatan</th>
                    <th className="px-5 py-3.5 sm:px-6">Kontribusi</th>
                  </tr>
                </thead>
                <tbody>
                  {salesRows.map((row) => (
                    <tr key={row.item} className="border-t border-[#e8ebf0]">
                      <td className="px-5 py-4 font-semibold text-[#344054] sm:px-6">{row.item}</td>
                      <td className="px-4 py-4 text-[#7b899e]">{row.transactions}</td>
                      <td className="px-4 py-4 text-[#7b899e]">{row.price}</td>
                      <td className="px-4 py-4 font-semibold text-[#344054]">{row.revenue}</td>
                      <td className="px-5 py-4 text-[#7b899e] sm:px-6">{row.contribution}</td>
                    </tr>
                  ))}
                  <tr className="border-t border-[#f4d2bc] bg-[#fff1e7]">
                    <td className="px-5 py-4 font-extrabold text-[#263346] sm:px-6">Total Pendapatan</td>
                    <td className="px-4 py-4 font-bold text-[#263346]">180</td>
                    <td className="px-4 py-4 text-[#7b899e]">—</td>
                    <td className="px-4 py-4 font-extrabold text-[#c94e00]">Rp 84.500.000</td>
                    <td className="px-5 py-4 font-extrabold text-[#263346] sm:px-6">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <footer className="mt-6 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#9aa5b4]">
            <span>© 2026 BugarHub • Admin workspace</span>
            <span>Terakhir diperbarui: 30 Sep 2026, 18:00 WIB</span>
          </footer>
          <div className="mt-3 rounded-lg border border-[#ffd0ac] bg-[#fff9f4] px-4 py-3 text-xs leading-5 text-[#a84c10]">
            Catatan: seluruh angka, grafik pendapatan, dan transaksi di halaman ini merupakan data demo untuk pratinjau antarmuka, bukan data operasional aktual. Tombol Export PDF membuka dialog cetak browser; pilih “Save as PDF” untuk menyimpan salinan laporan.
          </div>
        </div>
      </div>
    </main>
  );
}

export default AdminReportsPage;
