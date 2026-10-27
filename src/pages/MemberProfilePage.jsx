import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import MemberHeader from "../components/MemberHeader";
import { getMemberInitials, readDemoMember, saveDemoMemberProfile } from "../utils/demoData";

function Icon({ name, className = "h-5 w-5" }) {
  const paths = {
    user: <><circle cx="12" cy="8" r="3.2" /><path d="M5 20c.5-3.3 2.8-5.2 7-5.2s6.5 1.9 7 5.2" /></>,
    camera: <><path d="M4 7h3l1.5-2h7L17 7h3a1 1 0 0 1 1 1v11H3V8a1 1 0 0 1 1-1Z" /><circle cx="12" cy="13" r="3.5" /></>,
    save: <><path d="M5 3h12l4 4v14H3V3Z" /><path d="M7 3v6h10V3M7 21v-8h10v8" /></>,
    close: <path d="m6 6 12 12M18 6 6 18" />,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">{paths[name] || paths.user}</svg>;
}

function Avatar({ member, size = "h-20 w-20" }) {
  if (member.avatarDataUrl) return <img src={member.avatarDataUrl} alt={`Foto profil ${member.name}`} className={`${size} rounded-full border-4 border-white object-cover shadow-sm`} />;
  return <div className={`${size} flex items-center justify-center rounded-full border-4 border-white bg-[#fff0e5] text-2xl font-black text-[#f56600] shadow-sm`}>{getMemberInitials(member.name)}</div>;
}

export default function MemberProfilePage() {
  const [member, setMember] = useState(readDemoMember);
  const [form, setForm] = useState(() => {
    const current = readDemoMember();
    return { name: current.name || "", email: current.email || "", phone: current.phone || "", avatarDataUrl: current.avatarDataUrl || "" };
  });
  const [status, setStatus] = useState(null);
  const [emailVerificationOpen, setEmailVerificationOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [pendingEmail, setPendingEmail] = useState("");
  const fileInputRef = useRef(null);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setStatus(null);
    if (field === "email") setVerificationStatus(null);
  }

  function handlePhotoChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setStatus({ type: "error", text: "Pilih file gambar dengan format yang didukung." });
      event.target.value = "";
      return;
    }
    if (file.size > 1024 * 1024) {
      setStatus({ type: "error", text: "Ukuran foto maksimal 1 MB agar penyimpanan demo tetap ringan." });
      event.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setForm((current) => ({ ...current, avatarDataUrl: String(reader.result || "") }));
      setStatus(null);
    };
    reader.onerror = () => setStatus({ type: "error", text: "Foto belum bisa dibaca. Coba file gambar lain." });
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  function handleVerifyEmail() {
    const candidate = form.email.trim();
    if (!candidate) {
      setStatus({ type: "error", text: "Masukkan email yang ingin diverifikasi." });
      return;
    }
    if (candidate.toLowerCase() === String(member.email || "").trim().toLowerCase()) {
      setStatus({ type: "success", text: "Email ini sudah tersimpan dan tidak memerlukan verifikasi ulang." });
      return;
    }
    setPendingEmail(candidate);
    setVerificationCode("");
    setVerificationStatus(null);
    setEmailVerificationOpen(true);
  }

  function handleConfirmEmailVerification(event) {
    event.preventDefault();
    if (verificationCode !== "123456") {
      setVerificationStatus({ type: "error", text: "Kode OTP salah. Silakan coba kembali." });
      return;
    }
    const saved = saveDemoMemberProfile(member, { ...form, email: pendingEmail });
    if (!saved) {
      setVerificationStatus({ type: "error", text: "Email belum dapat disimpan. Silakan coba lagi." });
      return;
    }
    setMember(saved);
    setForm({ name: saved.name || "", email: saved.email || "", phone: saved.phone || "", avatarDataUrl: saved.avatarDataUrl || "" });
    setEmailVerificationOpen(false);
    setVerificationStatus(null);
    setStatus({ type: "success", text: "Email berhasil diverifikasi dan diperbarui di profil demo." });
  }

  function handleSave(event) {
    event.preventDefault();
    // Simpan data profil lain, tetapi jangan simpan email baru sebelum OTP berhasil.
    const saved = saveDemoMemberProfile(member, { ...form, email: member.email });
    if (!saved) {
      setStatus({ type: "error", text: "Perubahan tidak dapat disimpan di browser ini. Periksa kapasitas penyimpanan atau coba lagi." });
      return;
    }
    setMember(saved);
    setForm({ name: saved.name || "", email: form.email, phone: saved.phone || "", avatarDataUrl: saved.avatarDataUrl || "" });
    setStatus({
      type: "success",
      text: form.email.trim().toLowerCase() !== String(member.email || "").trim().toLowerCase()
        ? "Profil berhasil disimpan. Email baru masih menunggu verifikasi."
        : "Profil demo berhasil disimpan di browser ini.",
    });
  }

  function handleReset() {
    const current = readDemoMember();
    setMember(current);
    setForm({ name: current.name || "", email: current.email || "", phone: current.phone || "", avatarDataUrl: current.avatarDataUrl || "" });
    setStatus(null);
    setVerificationStatus(null);
  }

  const inputClass = "mt-2 h-12 w-full rounded-xl border border-[#e0e3e5] bg-[#fbfbfa] px-4 text-sm text-[#252a2e] outline-none transition placeholder:text-[#9aa0a5] focus:border-[#ff6b00] focus:bg-white focus:ring-4 focus:ring-[#ff6b00]/10";
  const emailMatchesSaved = form.email.trim().toLowerCase() === String(member.email || "").trim().toLowerCase();

  return (
    <main className="min-h-screen bg-[#f6f7f8] text-[#202326]">
      <MemberHeader />
      <div className="mx-auto max-w-[1120px] px-5 pb-14 pt-7 sm:px-8 sm:pt-10 lg:px-10 lg:pt-12">
        <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-[#737a80]"><Link to="/dashboard" className="transition hover:text-[#f56600]">Dashboard</Link><span aria-hidden="true">›</span><span className="text-[#f56600]">Edit Profile</span></div>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#f56600]">Account</p><h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Edit Profile</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[#737a80] sm:text-base">Kelola nama, email, nomor telepon, dan foto profil member BugarHub.</p></div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#f1dfd2] bg-white px-3.5 py-2 text-xs font-bold text-[#87593b]"><span className="h-2 w-2 rounded-full bg-[#ff6b00]" />Member demo</span>
        </div>

        <section className="mt-7 rounded-[24px] border border-[#e5e7e9] bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <Avatar member={{ ...member, ...form }} size="h-20 w-20" />
            <div className="min-w-0 flex-1"><h2 className="text-xl font-black">{form.name || "Your name"}</h2><p className="mt-1 break-all text-sm text-[#727980]">{form.email || "your@email.com"}</p><span className="mt-2 inline-flex rounded-full bg-[#fff0e5] px-3 py-1 text-xs font-bold text-[#f56600]">Member</span></div>
            <div className="flex flex-wrap gap-2">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#e0e3e5] px-3.5 text-sm font-bold text-[#4b5359] transition hover:border-[#ffb98c] hover:bg-[#fff8f3]"><Icon name="camera" className="h-4 w-4" />Upload Photo</button>
              {form.avatarDataUrl && <button type="button" onClick={() => updateField("avatarDataUrl", "")} className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#e0e3e5] px-3.5 text-sm font-bold text-[#697077] transition hover:bg-[#f6f7f8]"><Icon name="close" className="h-4 w-4" />Remove</button>}
            </div>
          </div>
        </section>

        <form onSubmit={handleSave} className="mt-5 rounded-[24px] border border-[#e5e7e9] bg-white p-5 shadow-sm sm:p-7">
          <div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff0e5] text-[#f56600]"><Icon name="user" /></span><div><h2 className="text-lg font-black">Personal Information</h2><p className="mt-1 text-sm text-[#7c8389]">Perubahan profil disimpan di browser pada mode demo ini.</p></div></div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-[#42494e]">Full Name<input value={form.name} onChange={(event) => updateField("name", event.target.value)} autoComplete="name" required maxLength={80} className={inputClass} placeholder="Enter your full name" /></label>
            <div className="block text-sm font-semibold text-[#42494e]">
              <div className="flex items-center justify-between gap-3"><label htmlFor="member-email">Email Address</label><button type="button" onClick={handleVerifyEmail} disabled={!form.email.trim() || emailMatchesSaved} className="rounded-lg border border-[#ff6b00] px-3 py-1.5 text-xs font-bold text-[#ff6b00] transition hover:bg-[#fff0e5] disabled:cursor-not-allowed disabled:border-[#dfe2e4] disabled:text-[#899097]">{emailMatchesSaved ? "Terverifikasi" : "Verifikasi"}</button></div>
              <input id="member-email" type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} autoComplete="email" required maxLength={160} className={inputClass} placeholder="you@example.com" />
              <p className="mt-1.5 text-xs font-normal text-[#858c92]">{emailMatchesSaved ? "Email yang tersimpan saat ini." : "Verifikasi email baru sebelum memperbarui alamat email."}</p>
            </div>
            <label className="block text-sm font-semibold text-[#42494e]">Phone Number <span className="font-normal text-[#9aa0a5]">(optional)</span><input value={form.phone} onChange={(event) => updateField("phone", event.target.value)} autoComplete="tel" maxLength={32} className={inputClass} placeholder="Enter your phone number" /></label>
            <div className="block text-sm font-semibold text-[#42494e]">Account Type<div className="mt-2 flex h-12 items-center justify-between rounded-xl border border-[#e0e3e5] bg-[#f7f8f8] px-4"><span className="text-sm font-medium text-[#626a70]">Member</span><span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-[#7b8288]">Demo</span></div><p className="mt-1.5 text-xs font-normal leading-5 text-[#959ba0]">Jenis akun tidak dapat diubah dari halaman profil.</p></div>
          </div>
          {status && <div role="status" className={`mt-5 rounded-xl border px-4 py-3 text-sm leading-5 ${status.type === "success" ? "border-[#afe8cb] bg-[#effbf5] text-[#147a4c]" : "border-[#ffc8b5] bg-[#fff7f3] text-[#a34200]"}`}>{status.text}</div>}
          <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-[#eceeef] pt-5"><button type="button" onClick={handleReset} className="inline-flex h-11 items-center justify-center rounded-xl border border-[#dfe2e4] px-5 text-sm font-bold text-[#5a6268] transition hover:bg-[#f7f8f8]">Reset</button><button type="submit" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#ff6b00] px-5 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#ec6100] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#ff6b00]/25"><Icon name="save" className="h-4 w-4" />Save Changes</button></div>
        </form>
        <p className="mt-5 rounded-xl border border-[#f3d2bd] bg-[#fff8f3] px-4 py-3 text-xs leading-5 text-[#925b39]">Catatan: perubahan profil dan foto disimpan lokal pada browser ini. Verifikasi OTP masih berupa simulasi frontend dan belum mengirim email sungguhan.</p>
      </div>

      {emailVerificationOpen && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm">
        <section role="dialog" aria-modal="true" aria-labelledby="email-verification-title" className="w-full max-w-md rounded-[24px] border border-[#e5e7e9] bg-white p-6 shadow-2xl sm:p-8">
          <div className="flex items-start justify-between gap-4"><div><span className="inline-flex rounded-full bg-[#fff0e5] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#ff6b00]">Email Verification</span><h2 id="email-verification-title" className="mt-3 text-2xl font-black text-[#202326]">Verify your email.</h2><p className="mt-2 text-sm leading-6 text-[#737a80]">Masukkan kode verifikasi untuk memperbarui email menjadi <strong className="break-all">{pendingEmail}</strong>.</p></div><button type="button" onClick={() => setEmailVerificationOpen(false)} aria-label="Tutup modal" className="rounded-full border border-[#e0e3e5] p-2 text-[#697077] hover:bg-[#f6f7f8]"><Icon name="close" className="h-4 w-4" /></button></div>
          <form onSubmit={handleConfirmEmailVerification} className="mt-6"><label htmlFor="email-otp" className="text-sm font-semibold text-[#42494e]">Kode OTP (6 digit)</label><input id="email-otp" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={verificationCode} onChange={(event) => { setVerificationCode(event.target.value.replace(/\D/g, "").slice(0, 6)); setVerificationStatus(null); }} placeholder="Masukkan kode OTP" className={inputClass} />
            <div className="mt-4 rounded-xl border border-[#f3d2bd] bg-[#fff8f3] px-4 py-3 text-xs leading-5 text-[#925b39]">Mode demo: gunakan kode <strong>123456</strong>. Belum ada email sungguhan yang dikirim.</div>
            {verificationStatus && <div role="status" className={`mt-4 rounded-xl border px-4 py-3 text-sm ${verificationStatus.type === "success" ? "border-[#afe8cb] bg-[#effbf5] text-[#147a4c]" : "border-[#ffc8b5] bg-[#fff7f3] text-[#a34200]"}`}>{verificationStatus.text}</div>}
            <div className="mt-6 flex gap-3"><button type="button" onClick={() => setEmailVerificationOpen(false)} className="h-12 flex-1 rounded-xl border border-[#dfe2e4] px-4 text-sm font-bold text-[#5a6268] hover:bg-[#f7f8f8]">Batal</button><button type="submit" className="h-12 flex-1 rounded-xl bg-[#ff6b00] px-4 text-sm font-extrabold text-white transition hover:bg-[#ec6100]">Verifikasi Email</button></div>
          </form>
        </section>
      </div>}
    </main>
  );
}
