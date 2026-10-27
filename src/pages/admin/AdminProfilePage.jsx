import { useState } from "react";
import AdminSidebar, { AdminIcon } from "../../components/AdminSidebar";

const DEFAULT_PROFILE = {
  fullName: "admin kayes",
  email: "admin@bugarhub.id",
  phone: "0812-3456-7890",
  role: "Super Admin",
  location: "BugarHub Senayan",
};

const STORAGE_KEY = "bugarhub-admin-profile-demo";

function readSavedProfile() {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value ? { ...DEFAULT_PROFILE, ...JSON.parse(value) } : DEFAULT_PROFILE;
  } catch {
    return DEFAULT_PROFILE;
  }
}

function TextField({ label, name, value, onChange, type = "text", placeholder, autoComplete }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-[#344155]">{label}</span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="h-11 w-full rounded-lg border border-[#dfe5ed] bg-white px-3 text-sm text-[#263346] outline-none transition placeholder:text-[#a2adbc] focus:border-[#ff6b00] focus:ring-4 focus:ring-[#ff6b00]/10"
      />
    </label>
  );
}

function AdminProfilePage() {
  const [profile, setProfile] = useState(readSavedProfile);
  const [savedMessage, setSavedMessage] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: "", next: "", confirm: "" });
  const [passwordMessage, setPasswordMessage] = useState("");

  function handleProfileChange(event) {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
    setSavedMessage("");
  }

  function handleSaveProfile(event) {
    event.preventDefault();
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      setSavedMessage("Perubahan profil demo berhasil disimpan di browser ini.");
    } catch {
      setSavedMessage("Perubahan ditampilkan untuk sesi ini, tetapi browser tidak mengizinkan penyimpanan lokal.");
    }
  }

  function handlePasswordSubmit(event) {
    event.preventDefault();
    if (passwordForm.next.length < 8) {
      setPasswordMessage("Password baru harus terdiri dari minimal 8 karakter.");
      return;
    }
    if (passwordForm.next !== passwordForm.confirm) {
      setPasswordMessage("Konfirmasi password belum cocok.");
      return;
    }
    setPasswordMessage("Simulasi berhasil. Password belum diubah di server karena backend belum tersedia.");
    setPasswordForm({ current: "", next: "", confirm: "" });
  }

  const initials = profile.fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] || "")
    .join("")
    .toUpperCase() || "AP";

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#263346] md:flex">
      <AdminSidebar />

      <div className="min-w-0 flex-1">
        <header className="flex h-[70px] items-center border-b border-[#e5e9ef] bg-white px-5 sm:px-8 lg:px-10">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-[#8a97aa]">Workspace</span>
            <AdminIcon name="chevron" className="h-4 w-4 text-[#9aa5b4]" />
            <span className="font-semibold text-[#263346]">Profil Admin</span>
          </div>
        </header>

        <div className="mx-auto max-w-[1400px] px-5 pb-8 pt-7 sm:px-8 lg:px-10 lg:pt-8">
          <div className="mb-6">
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.12em] text-[#ff6b00] sm:hidden">Admin workspace</p>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#263346] sm:text-[30px]">Profil Admin</h1>
            <p className="mt-2 text-sm text-[#7b899e]">Kelola informasi akun dan preferensi admin BugarHub.</p>
          </div>

          <section className="mb-5 rounded-2xl border border-[#e5e9ef] bg-white p-5 shadow-[0_2px_7px_rgba(27,39,58,0.015)] sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-[#fff0e5] bg-[#ffead9] text-2xl font-extrabold text-[#f56600]">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-extrabold text-[#263346]">{profile.fullName}</h2>
                  <span className="rounded-full bg-[#e9f8f1] px-2.5 py-1 text-xs font-bold text-emerald-700">Akun demo aktif</span>
                </div>
                <p className="mt-1 text-sm text-[#7b899e]">{profile.email}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-md bg-[#f3f5f8] px-2.5 py-1 text-xs font-semibold text-[#66758b]">{profile.role}</span>
                  <span className="rounded-md bg-[#fff1e7] px-2.5 py-1 text-xs font-semibold text-[#e85f00]">{profile.location}</span>
                </div>
              </div>
              <div className="rounded-xl border border-[#e5e9ef] bg-[#fbfcfe] p-4 sm:min-w-[190px]">
                <p className="text-xs text-[#8a97aa]">Akses akun</p>
                <p className="mt-1 text-sm font-bold text-[#263346]">Administrator</p>
                <p className="mt-1 text-xs text-[#7b899e]">Profil lokal untuk demo</p>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(310px,0.85fr)]">
            <section className="rounded-2xl border border-[#e5e9ef] bg-white p-5 sm:p-6">
              <header className="mb-6 flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff1e7] text-[#ff6b00]">
                  <AdminIcon name="user" className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-base font-extrabold text-[#2b3749]">Informasi Pribadi</h2>
                  <p className="mt-1 text-xs leading-5 text-[#8a97aa]">Perbarui informasi dasar profil admin.</p>
                </div>
              </header>

              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <TextField label="Nama Lengkap" name="fullName" value={profile.fullName} onChange={handleProfileChange} placeholder="Masukkan nama lengkap" autoComplete="name" />
                  <TextField label="Email" name="email" type="email" value={profile.email} onChange={handleProfileChange} placeholder="nama@bugarhub.id" autoComplete="email" />
                  <TextField label="Nomor Telepon" name="phone" value={profile.phone} onChange={handleProfileChange} placeholder="Masukkan nomor telepon" autoComplete="tel" />
                  <TextField label="Lokasi / Cabang" name="location" value={profile.location} onChange={handleProfileChange} placeholder="Nama cabang" />
                </div>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#344155]">Role</span>
                  <input value={profile.role} readOnly className="h-11 w-full cursor-not-allowed rounded-lg border border-[#e5e9ef] bg-[#f5f7fa] px-3 text-sm text-[#8793a5]" />
                  <span className="mt-1.5 block text-xs text-[#8a97aa]">Role hanya dapat diubah oleh pengelola akses melalui sistem backend.</span>
                </label>

                {savedMessage && (
                  <div role="status" aria-live="polite" className="rounded-lg border border-[#b8ead1] bg-[#effbf5] px-3 py-2.5 text-sm text-[#13744a]">
                    {savedMessage}
                  </div>
                )}

                <div className="flex flex-wrap justify-end gap-3 border-t border-[#edf0f4] pt-5">
                  <button type="button" onClick={() => { setProfile(readSavedProfile()); setSavedMessage(""); }} className="inline-flex h-11 items-center justify-center rounded-lg border border-[#dfe5ed] px-4 text-sm font-semibold text-[#536176] transition hover:bg-[#f7f9fb]">
                    Reset
                  </button>
                  <button type="submit" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#ff6b00] px-5 text-sm font-bold text-white transition hover:bg-[#ed6200] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#ff6b00]/20">
                    <AdminIcon name="user" className="h-4 w-4" /> Simpan Perubahan
                  </button>
                </div>
              </form>
            </section>

            <div className="space-y-5">
              <section className="rounded-2xl border border-[#e5e9ef] bg-white p-5 sm:p-6">
                <header className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff1e7] text-[#ff6b00]">
                    <AdminIcon name="wallet" className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-base font-extrabold text-[#2b3749]">Keamanan Akun</h2>
                    <p className="mt-1 text-xs leading-5 text-[#8a97aa]">Pengaturan password dan akses akun.</p>
                  </div>
                </header>
                <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-[#edf0f4] p-4">
                  <div>
                    <p className="text-sm font-bold text-[#344155]">Password</p>
                    <p className="mt-1 text-xs text-[#8a97aa]">Kelola kata sandi akun demo</p>
                  </div>
                  <button type="button" onClick={() => { setShowPasswordForm((open) => !open); setPasswordMessage(""); }} className="shrink-0 rounded-lg border border-[#dfe5ed] px-3 py-2 text-xs font-bold text-[#344155] transition hover:border-[#ff6b00] hover:text-[#e85f00]">
                    {showPasswordForm ? "Tutup" : "Ubah Password"}
                  </button>
                </div>
                {showPasswordForm && (
                  <form onSubmit={handlePasswordSubmit} className="mt-4 space-y-3">
                    <TextField label="Password Saat Ini" name="current" type="password" value={passwordForm.current} onChange={(event) => { setPasswordForm((current) => ({ ...current, current: event.target.value })); setPasswordMessage(""); }} placeholder="Masukkan password saat ini" autoComplete="current-password" />
                    <TextField label="Password Baru" name="next" type="password" value={passwordForm.next} onChange={(event) => { setPasswordForm((current) => ({ ...current, next: event.target.value })); setPasswordMessage(""); }} placeholder="Minimal 8 karakter" autoComplete="new-password" />
                    <TextField label="Konfirmasi Password Baru" name="confirm" type="password" value={passwordForm.confirm} onChange={(event) => { setPasswordForm((current) => ({ ...current, confirm: event.target.value })); setPasswordMessage(""); }} placeholder="Ulangi password baru" autoComplete="new-password" />
                    {passwordMessage && <p role="status" className="rounded-lg bg-[#fff7f1] px-3 py-2 text-xs leading-5 text-[#9a480e]">{passwordMessage}</p>}
                    <button type="submit" className="h-10 w-full rounded-lg bg-[#ff6b00] px-4 text-sm font-bold text-white transition hover:bg-[#ed6200]">Simpan Password Demo</button>
                  </form>
                )}
                {!showPasswordForm && <p className="mt-3 text-xs leading-5 text-[#8a97aa]">Perubahan password nyata belum aktif karena autentikasi masih berupa demo frontend.</p>}
              </section>

              <section className="rounded-2xl border border-[#e5e9ef] bg-white p-5 sm:p-6">
                <header className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff1e7] text-[#ff6b00]">
                    <AdminIcon name="activity" className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-base font-extrabold text-[#2b3749]">Preferensi Notifikasi</h2>
                    <p className="mt-1 text-xs leading-5 text-[#8a97aa]">Pilih pemberitahuan yang ingin kamu terima.</p>
                  </div>
                </header>
                <div className="mt-5 space-y-4">
                  <Preference label="Laporan operasional mingguan" detail="Ringkasan aktivitas gym dan pendapatan." />
                  <Preference label="Pemberitahuan jadwal kelas" detail="Perubahan jadwal dan kapasitas kelas." />
                  <Preference label="Pembaruan akun Admin" detail="Aktivitas yang berkaitan dengan akun admin." />
                </div>
                <p className="mt-4 border-t border-[#edf0f4] pt-3 text-xs leading-5 text-[#8a97aa]">Preferensi ini hanya contoh tampilan; pengiriman notifikasi belum dihubungkan.</p>
              </section>
            </div>
          </div>

          <footer className="flex flex-col gap-2 pb-2 pt-6 text-[11px] text-[#a2adbc] sm:flex-row sm:items-center sm:justify-between">
            <span>© 2026 BugarHub • Admin workspace</span>
            <span>Profil admin • Mode demo</span>
          </footer>
          <p className="mt-1 rounded-lg border border-[#f5d4b6] bg-[#fff8f1] px-3 py-2 text-xs leading-5 text-[#9b5a22]">
            Catatan: perubahan informasi profil disimpan secara lokal di browser ini. Pengelolaan password, role, dan notifikasi belum terhubung ke backend.
          </p>
        </div>
      </div>
    </main>
  );
}

function Preference({ label, detail }) {
  const [enabled, setEnabled] = useState(true);
  return (
    <label className="flex cursor-pointer items-start justify-between gap-3">
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-[#344155]">{label}</span>
        <span className="mt-1 block text-xs leading-5 text-[#8a97aa]">{detail}</span>
      </span>
      <input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-[#ff6b00]" />
    </label>
  );
}

export default AdminProfilePage;
