import { Link, useLocation } from "react-router-dom";
import AdminSidebar from "../../components/AdminSidebar";

function AdminPlaceholderPage({ title = "Halaman Admin" }) {
  const location = useLocation();

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#263346] md:flex">
      <AdminSidebar />
      <section className="min-w-0 flex-1">
        <header className="flex h-[70px] items-center border-b border-[#e5e9ef] bg-white px-5 sm:px-8">
          <span className="text-sm text-[#8a97aa]">Workspace</span>
          <span className="mx-3 text-[#9aa5b4]">›</span>
          <span className="text-sm font-semibold">{title}</span>
        </header>
        <div className="mx-auto flex min-h-[65vh] max-w-3xl flex-col items-center justify-center px-6 py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff1e7] text-[#ff6b00]">
            <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 9h8M8 13h5M8 17h3" strokeLinecap="round"/></svg>
          </div>
          <h1 className="mt-5 text-2xl font-extrabold">{title}</h1>
          <p className="mt-2 max-w-md text-sm leading-6 text-[#7b899e]">Halaman ini sudah disiapkan di navigasi Admin dan akan kita bangun pada tahap berikutnya. Untuk sekarang, kamu bisa kembali ke Dashboard Admin.</p>
          <p className="mt-2 text-xs text-[#a2adbc]">Route: {location.pathname}</p>
          <Link to="/admin/dashboard" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#ff6b00] px-5 text-sm font-bold text-white transition hover:bg-[#ed6200]">
            Kembali ke Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}

export default AdminPlaceholderPage;
