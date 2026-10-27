import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../components/Logo";
import { clearStaffSessions, setStaffSession } from "../../utils/staffSession";

function EyeIcon({ visible }) {
  return visible ? (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 12s3.3-6 9.5-6 9.5 6 9.5 6-3.3 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.8" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3l18 18" />
      <path d="M10.6 6.2A10.9 10.9 0 0 1 12 6c6.2 0 9.5 6 9.5 6a15.8 15.8 0 0 1-3.2 3.8" />
      <path d="M6.2 6.7C3.8 8.3 2.5 12 2.5 12s3.3 6 9.5 6a10 10 0 0 0 3.1-.5" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}

function AdminLoginPage() {
  const navigate = useNavigate();
  const [staffId, setStaffId] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState("");

  // The shared staff login always opens with the form, not a previous staff session.
  useEffect(() => {
    clearStaffSessions();
  }, []);

  function handleSubmit(event) {
    event.preventDefault();
    const normalizedId = staffId.trim().toLowerCase();

    const isAdmin = ["admin", "admin@bugarhub.id"].includes(normalizedId) && password === "admin";
    if (isAdmin) {
      setStaffSession("admin", {
        username: "admin",
        email: "admin@bugarhub.id",
        name: "Admin Putri",
        displayRole: "Super Admin",
      });
      navigate("/admin/dashboard", { replace: true });
      return;
    }

    const isTrainer = ["trainer", "trainer@bugarhub.id"].includes(normalizedId) && password === "trainer123";
    if (isTrainer) {
      setStaffSession("trainer", {
        id: "trainer-001",
        username: "trainer",
        email: "trainer@bugarhub.id",
        name: "Rizky Pratama",
        specialties: ["Strength Training", "Personal Training"],
      });
      navigate("/trainer/dashboard", { replace: true });
      return;
    }

    setNotice("Email atau ID staf dan password tidak sesuai.");
  }

  function handleForgotPassword() {
    setNotice("Untuk pemulihan akses, silakan hubungi administrator BugarHub.");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#f5f7fa] px-4 py-8 text-[#253044] sm:px-6">
      <section className="w-full max-w-[400px]">
        <div className="rounded-xl border border-[#e3e8ef] bg-white px-7 py-7 shadow-[0_8px_28px_rgba(31,45,61,0.035)] sm:px-8 sm:py-8">
          <div className="mb-5 flex justify-center">
            <Logo className="justify-center" />
          </div>

          <header className="mb-6 text-center">
            <h1 className="text-[22px] font-extrabold leading-7 tracking-tight text-[#253044] sm:text-[23px]">
              Portal Admin Login
            </h1>
            <p className="mx-auto mt-2 max-w-[310px] text-[12px] leading-[19px] text-[#7b879a]">
              Selamat datang kembali. Masuk untuk mengelola operasional BugarHub.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-[18px]">
            <div>
              <label htmlFor="staff-id" className="mb-2 block text-[12px] font-medium text-[#253044]">
                Email / ID Staf
              </label>
              <input
                id="staff-id"
                name="staffId"
                type="text"
                autoComplete="username"
                value={staffId}
                onChange={(event) => { setStaffId(event.target.value); setNotice(""); }}
                placeholder="admin@bugarhub.id"
                required
                className="h-[47px] w-full rounded-lg border border-[#dfe5ed] bg-white px-3 text-[12px] text-[#253044] outline-none transition placeholder:text-[#a3adbd] focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/10"
              />
            </div>

            <div>
              <label htmlFor="staff-password" className="mb-2 block text-[12px] font-medium text-[#253044]">
                Password
              </label>
              <div className="flex h-[47px] items-center rounded-lg border border-[#dfe5ed] bg-white pr-3 transition focus-within:border-[#ff6b00] focus-within:ring-2 focus-within:ring-[#ff6b00]/10">
                <input
                  id="staff-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => { setPassword(event.target.value); setNotice(""); }}
                  placeholder="Masukkan password"
                  required
                  className="h-full min-w-0 flex-1 rounded-lg border-0 bg-transparent px-3 text-[12px] text-[#253044] outline-none placeholder:text-[#a3adbd] focus:ring-0"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#718099] transition hover:bg-[#f3f5f8] hover:text-[#253044] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6b00]"
                >
                  <EyeIcon visible={showPassword} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-0.5 text-[11px]">
              <label className="inline-flex cursor-pointer items-center gap-2 text-[#8190a5]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="h-[14px] w-[14px] rounded border-[#d7deea] accent-[#ff6b00] focus:ring-[#ff6b00]"
                />
                Ingat saya
              </label>
              <button type="button" onClick={handleForgotPassword} className="font-medium text-[#e85f00] transition hover:text-[#bd4b00] hover:underline">
                Lupa password?
              </button>
            </div>

            {notice && (
              <div role="alert" aria-live="polite" className="rounded-lg border border-[#ffd0ad] bg-[#fff7f1] px-3 py-2.5 text-xs leading-5 text-[#9a480e]">
                {notice}
              </div>
            )}

            <button type="submit" className="flex h-[43px] w-full items-center justify-center rounded-lg bg-[#ff6b00] px-4 text-[12px] font-bold text-white shadow-sm transition hover:bg-[#ed6100] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#ff6b00]/25 active:translate-y-px">
              Masuk ke Dashboard
            </button>
          </form>
        </div>

        <p className="mt-6 flex items-center justify-center gap-2 px-2 text-center text-[10px] leading-5 text-[#8090a7] sm:text-[11px]">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[14px] w-[14px] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 3l7 3v5c0 4.6-3 7.8-7 10-4-2.2-7-5.4-7-10V6l7-3z" strokeLinejoin="round" />
            <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Akses terbatas untuk staf BugarHub yang berwenang.
        </p>
        <p className="mt-4 text-center text-[10px] text-[#a7b0bf] sm:text-[11px]">
          © 2026 BugarHub. All rights reserved.
        </p>
      </section>
    </main>
  );
}

export default AdminLoginPage;
