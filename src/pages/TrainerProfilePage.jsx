import { useEffect, useMemo, useState } from "react";
import TrainerPageLayout from "../components/TrainerPageLayout";
import { AdminIcon } from "../components/AdminSidebar";
import { getStaffSession } from "../utils/staffSession";
import { compressProfileImage } from "../utils/profileImage";
import {
  getTrainerProfileChangeRequests,
  requestTrainerProfileChange,
  TRAINER_PERMISSION_EVENT,
} from "../utils/trainerPermissionRequests";

function initials(name = "PT Coach") {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "PT";
}

function statusStyle(status) {
  if (status === "approved") return "bg-[#e9f8f1] text-emerald-700";
  if (status === "rejected") return "bg-red-50 text-red-700";
  if (status === "superseded") return "bg-[#f1f4f8] text-[#68778d]";
  return "bg-[#fff1e7] text-[#e85f00]";
}

function statusLabel(status) {
  if (status === "approved") return "Disetujui";
  if (status === "rejected") return "Perlu diajukan ulang";
  if (status === "superseded") return "Diperbarui oleh Admin";
  return "Menunggu persetujuan Admin";
}

function TrainerProfilePage() {
  const [trainer, setTrainer] = useState(() => getStaffSession() || {});
  const [requests, setRequests] = useState(getTrainerProfileChangeRequests);
  const [profile, setProfile] = useState(() => {
    const current = getStaffSession() || {};
    return {
      name: current.name || "",
      email: current.email || "",
      phone: current.phone || "",
      bio: current.bio || "",
      avatar: current.avatar || "",
    };
  });
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);

  const trainerId = String(trainer.id || trainer.username || trainer.email || "trainer-demo-001");
  const myRequests = useMemo(() => requests.filter((item) => item.trainerId === trainerId), [requests, trainerId]);
  const latestRequest = myRequests[0] || null;
  const hasPendingRequest = myRequests.some((item) => item.status === "pending");

  useEffect(() => {
    const refreshRequests = () => setRequests(getTrainerProfileChangeRequests());
    const refreshProfile = () => {
      const nextTrainer = getStaffSession() || {};
      setTrainer(nextTrainer);
      setProfile({
        name: nextTrainer.name || "",
        email: nextTrainer.email || "",
        phone: nextTrainer.phone || "",
        bio: nextTrainer.bio || "",
        avatar: nextTrainer.avatar || "",
      });
    };
    window.addEventListener(TRAINER_PERMISSION_EVENT, refreshRequests);
    window.addEventListener("storage", refreshRequests);
    window.addEventListener("storage", refreshProfile);
    return () => {
      window.removeEventListener(TRAINER_PERMISSION_EVENT, refreshRequests);
      window.removeEventListener("storage", refreshRequests);
      window.removeEventListener("storage", refreshProfile);
    };
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
    setNotice("");
    setError("");
  }

  async function handlePhotoChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsProcessingPhoto(true);
    setError("");
    try {
      const avatar = await compressProfileImage(file);
      setProfile((current) => ({ ...current, avatar }));
      setNotice("Foto dipilih. Perubahan akan dikirim setelah kamu menyimpan permintaan profil.");
    } catch (imageError) {
      setError(imageError.message || "Foto tidak dapat diproses.");
    } finally {
      setIsProcessingPhoto(false);
      event.target.value = "";
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    setNotice("");
    setError("");
    if (hasPendingRequest) {
      setError("Masih ada permintaan profil yang menunggu persetujuan Admin.");
      return;
    }
    const result = requestTrainerProfileChange(trainer, profile);
    if (!result.ok) {
      setError(result.reason === "already_pending" ? "Masih ada permintaan profil yang menunggu persetujuan Admin." : "Nama dan email wajib diisi.");
      setRequests(getTrainerProfileChangeRequests());
      return;
    }
    setRequests(getTrainerProfileChangeRequests());
    setNotice("Permintaan perubahan profil telah dikirim. Profil akan berubah setelah disetujui Admin.");
  }

  function resetForm() {
    setProfile({
      name: trainer.name || "",
      email: trainer.email || "",
      phone: trainer.phone || "",
      bio: trainer.bio || "",
      avatar: trainer.avatar || "",
    });
    setNotice("");
    setError("");
  }

  return (
    <TrainerPageLayout
      title="Profil Saya"
      subtitle="Kelola informasi diri dan ajukan perubahan profil untuk ditinjau Admin."
    >
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)]">
        <section className="rounded-2xl border border-[#e5e9ef] bg-white p-5 sm:p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-[#fff0e5] bg-[#ffead9] text-xl font-extrabold text-[#f56600]">
              {profile.avatar ? <img src={profile.avatar} alt={`Foto ${profile.name}`} className="h-full w-full object-cover" /> : initials(profile.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#ff6b00]">PT / Coach</p>
              <h2 className="mt-1 text-xl font-extrabold text-[#263346]">{trainer.name || "Profil Trainer"}</h2>
              <p className="mt-1 text-sm text-[#7b899e]">{trainer.email || "Email belum diatur"}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(Array.isArray(trainer.specialties) ? trainer.specialties : []).map((item) => <span key={item} className="rounded-full border border-[#ffd2b7] bg-[#fff8f3] px-2.5 py-1 text-[11px] font-semibold text-[#a34c12]">{item}</span>)}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-[#344155]">Nama lengkap
                <input name="name" value={profile.name} onChange={handleChange} required disabled={hasPendingRequest} placeholder="Nama lengkap" className="mt-1.5 h-11 w-full rounded-lg border border-[#dfe5ed] px-3 text-sm font-normal outline-none transition focus:border-[#ff6b00] focus:ring-4 focus:ring-[#ff6b00]/10 disabled:bg-[#f5f7fa]" />
              </label>
              <label className="block text-sm font-semibold text-[#344155]">Email
                <input name="email" type="email" value={profile.email} onChange={handleChange} required disabled={hasPendingRequest} placeholder="nama@bugarhub.id" className="mt-1.5 h-11 w-full rounded-lg border border-[#dfe5ed] px-3 text-sm font-normal outline-none transition focus:border-[#ff6b00] focus:ring-4 focus:ring-[#ff6b00]/10 disabled:bg-[#f5f7fa]" />
              </label>
              <label className="block text-sm font-semibold text-[#344155]">Nomor telepon
                <input name="phone" value={profile.phone} onChange={handleChange} disabled={hasPendingRequest} placeholder="08xxxxxxxxxx" className="mt-1.5 h-11 w-full rounded-lg border border-[#dfe5ed] px-3 text-sm font-normal outline-none transition focus:border-[#ff6b00] focus:ring-4 focus:ring-[#ff6b00]/10 disabled:bg-[#f5f7fa]" />
              </label>
              <div className="block text-sm font-semibold text-[#344155]">Foto profil
                <label className={`mt-1.5 flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#dfe5ed] px-3 text-sm font-semibold text-[#526177] transition hover:border-[#ffb987] hover:bg-[#fff8f3] ${hasPendingRequest ? "cursor-not-allowed bg-[#f5f7fa] opacity-60" : ""}`}>
                  <AdminIcon name="user" className="h-4 w-4" /> {isProcessingPhoto ? "Memproses foto..." : "Pilih foto"}
                  <input type="file" accept="image/*" disabled={hasPendingRequest || isProcessingPhoto} onChange={handlePhotoChange} className="sr-only" />
                </label>
                <p className="mt-1 text-[10px] font-normal text-[#8a97aa]">Gambar akan diperkecil agar mudah disimpan.</p>
              </div>
            </div>
            <label className="block text-sm font-semibold text-[#344155]">Tentang saya
              <textarea name="bio" rows={4} value={profile.bio} onChange={handleChange} disabled={hasPendingRequest} placeholder="Ceritakan pengalaman dan pendekatan latihanmu..." className="mt-1.5 w-full rounded-lg border border-[#dfe5ed] px-3 py-2.5 text-sm font-normal outline-none transition focus:border-[#ff6b00] focus:ring-4 focus:ring-[#ff6b00]/10 disabled:bg-[#f5f7fa]" />
            </label>

            {notice && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">{notice}</p>}
            {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</p>}

            <div className="flex flex-wrap justify-end gap-2 border-t border-[#edf0f4] pt-4">
              <button type="button" onClick={resetForm} disabled={hasPendingRequest} className="min-h-10 rounded-lg border border-[#dfe5ed] px-4 text-sm font-semibold text-[#526177] transition hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-50">Reset</button>
              <button type="submit" disabled={hasPendingRequest || isProcessingPhoto} className="min-h-10 rounded-lg bg-[#ff6b00] px-4 text-sm font-bold text-white transition hover:bg-[#ed6200] disabled:cursor-not-allowed disabled:bg-[#f5b184]">Kirim untuk Persetujuan</button>
            </div>
            <p className="text-xs leading-5 text-[#8a97aa]">Perubahan nama, email, nomor telepon, deskripsi, dan foto tidak diterapkan langsung. Admin perlu menyetujui permintaan terlebih dahulu.</p>
          </form>
        </section>

        <div className="space-y-5">
          <section className="rounded-2xl border border-[#e5e9ef] bg-white p-5 sm:p-6">
            <header className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff1e7] text-[#ff6b00]"><AdminIcon name="clock" className="h-5 w-5" /></span>
              <div><h2 className="text-base font-extrabold text-[#263346]">Status permintaan profil</h2><p className="mt-1 text-xs leading-5 text-[#8a97aa]">Permintaan terakhir yang kamu kirim ke Admin.</p></div>
            </header>
            {!latestRequest ? (
              <div className="mt-5 rounded-xl border border-dashed border-[#dfe5ed] px-4 py-8 text-center"><p className="text-sm font-semibold text-[#344155]">Belum ada permintaan perubahan</p><p className="mt-1 text-xs leading-5 text-[#8a97aa]">Perubahan profil akan tercatat di sini setelah diajukan.</p></div>
            ) : (
              <article className="mt-5 rounded-xl border border-[#e5e9ef] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2"><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${statusStyle(latestRequest.status)}`}>{statusLabel(latestRequest.status)}</span><span className="text-[10px] text-[#8a97aa]">{new Date(latestRequest.requestedAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}</span></div>
                <p className="mt-3 text-sm font-bold text-[#344155]">Perubahan yang diajukan</p>
                <div className="mt-2 space-y-2 text-xs text-[#718096]">
                  <p><span className="font-semibold text-[#344155]">Nama:</span> {latestRequest.proposedProfile?.name || "—"}</p>
                  <p><span className="font-semibold text-[#344155]">Email:</span> {latestRequest.proposedProfile?.email || "—"}</p>
                  <p><span className="font-semibold text-[#344155]">Foto:</span> {latestRequest.proposedProfile?.avatar ? "Foto baru dilampirkan" : "Tidak diubah"}</p>
                </div>
                {latestRequest.status === "rejected" && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs leading-5 text-red-700">Permintaan ditolak. Kamu dapat memperbarui profil dan mengajukan kembali.</p>}
                {latestRequest.status === "approved" && <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs leading-5 text-emerald-700">Perubahan telah disetujui. Profil aktif akan menampilkan informasi terbaru setelah sesi dimuat kembali.</p>}
              </article>
            )}
          </section>
          <section className="rounded-2xl border border-[#e5e9ef] bg-white p-5 sm:p-6">
            <h2 className="text-base font-extrabold text-[#263346]">Spesialisasi dan izin kelas</h2>
            <p className="mt-1 text-xs leading-5 text-[#8a97aa]">Spesialisasi tidak diubah dari formulir profil. Ajukan izin kelas baru melalui halaman Manajemen Kelas agar Admin dapat meninjau permintaan tersebut.</p>
          </section>
        </div>
      </div>
    </TrainerPageLayout>
  );
}

export default TrainerProfilePage;
