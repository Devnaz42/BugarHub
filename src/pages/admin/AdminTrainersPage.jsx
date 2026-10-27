import { useEffect, useMemo, useState } from "react";
import AdminSidebar, { AdminIcon } from "../../components/AdminSidebar";
import rizkyAvatar from "../../assets/admin-trainer-rizky.jpg";
import mayaAvatar from "../../assets/admin-trainer-maya.jpg";
import alexAvatar from "../../assets/admin-trainer-alex.jpg";
import ninaAvatar from "../../assets/admin-trainer-nina.jpg";
import sariAvatar from "../../assets/admin-trainer-sari.jpg";
import dimasAvatar from "../../assets/admin-trainer-dimas.jpg";
import { compressProfileImage } from "../../utils/profileImage";
import {
  getTrainerProfileOverride,
  saveTrainerProfileOverride,
  supersedePendingTrainerProfileChangeRequests,
  TRAINER_PERMISSION_EVENT,
} from "../../utils/trainerPermissionRequests";

const initialTrainers = [
  { id: 1, accountId: "trainer-001", name: "Coach Rizky", specialty: "Strength & Personal Training", specialties: ["Strength Training", "Personal Training"], email: "trainer@bugarhub.id", rating: "4.9", sessions: 248, experience: 5, certified: true, availability: "Tersedia hari ini", schedule: "Hari ini, 16:00 • Strength 101", avatar: rizkyAvatar },
  { id: 2, accountId: "trainer-account-002", name: "Coach Maya", specialty: "Yoga & Mobility", specialties: ["Yoga", "Mobility"], rating: "4.9", sessions: 312, experience: 6, certified: true, availability: "Tersedia hari ini", schedule: "Hari ini, 19:00 • Evening Yoga", avatar: mayaAvatar },
  { id: 3, accountId: "trainer-account-003", name: "Coach Alex", specialty: "HIIT & Conditioning", specialties: ["HIIT", "Conditioning"], rating: "4.9", sessions: 286, experience: 5, certified: true, availability: "Tersedia hari ini", schedule: "Hari ini, 17:00 • HIIT Burn", avatar: alexAvatar },
  { id: 4, accountId: "trainer-account-004", name: "Coach Nina", specialty: "Pilates & Core", specialties: ["Pilates", "Core"], rating: "4.9", sessions: 195, experience: 4, certified: true, availability: "Jadwal besok", schedule: "Besok, 10:00 • Pilates Core", avatar: ninaAvatar },
  { id: 5, accountId: "trainer-account-005", name: "Coach Sari", specialty: "Zumba & Dance Fitness", specialties: ["Zumba", "Dance Fitness"], rating: "4.9", sessions: 224, experience: 4, certified: true, availability: "Tersedia hari ini", schedule: "Hari ini, 18:00 • Zumba Party", avatar: sariAvatar },
  { id: 6, accountId: "trainer-account-006", name: "Coach Dimas", specialty: "Functional & Boxing", specialties: ["Functional", "Boxing"], rating: "4.9", sessions: 168, experience: 3, certified: true, availability: "Jadwal besok", schedule: "Besok, 08:00 • Functional Fit", avatar: dimasAvatar },
];

function initials(name) {
  return name.split(/\s+/).filter(Boolean).slice(-2).map((part) => part[0]).join("").toUpperCase();
}

function trainerAccountId(trainer) {
  return String(trainer?.accountId || trainer?.id || "");
}

function applyTrainerProfile(trainer) {
  const override = getTrainerProfileOverride(trainerAccountId(trainer));
  if (!override) return trainer;
  const cleanName = String(override.name || trainer.profileName || trainer.name.replace(/^Coach\s+/i, "")).replace(/^Coach\s+/i, "").trim();
  const specialties = Array.isArray(override.specialties) && override.specialties.length ? override.specialties : (trainer.specialties || []);
  return {
    ...trainer,
    ...override,
    accountId: trainerAccountId(trainer),
    profileName: cleanName,
    name: override.displayName || (cleanName ? `Coach ${cleanName}` : trainer.name),
    specialty: override.specialty || (specialties.length ? specialties.join(" & ") : trainer.specialty),
    specialties,
    avatar: override.avatar || trainer.avatar,
    email: override.email || trainer.email || "",
    phone: override.phone || "",
    bio: override.bio || "",
    experience: override.experience ?? trainer.experience,
    certified: override.certified ?? trainer.certified,
  };
}

function getTrainerRows() {
  return initialTrainers.map((trainer) => applyTrainerProfile(trainer));
}

function TrainerProfileModal({ trainer, onClose, onSave }) {
  const [name, setName] = useState(trainer.profileName || trainer.name.replace(/^Coach\s+/i, ""));
  const [email, setEmail] = useState(trainer.email || "");
  const [phone, setPhone] = useState(trainer.phone || "");
  const [specialtiesText, setSpecialtiesText] = useState((trainer.specialties || trainer.specialty.split(/\s*&\s*/)).join(", "));
  const [experience, setExperience] = useState(String(trainer.experience || 0));
  const [certified, setCertified] = useState(Boolean(trainer.certified));
  const [bio, setBio] = useState(trainer.bio || "");
  const [avatar, setAvatar] = useState(trainer.avatar || "");
  const [photoBusy, setPhotoBusy] = useState(false);
  const [error, setError] = useState("");

  async function handlePhoto(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhotoBusy(true);
    setError("");
    try {
      setAvatar(await compressProfileImage(file));
    } catch (photoError) {
      setError(photoError.message || "Foto tidak dapat diproses.");
    } finally {
      setPhotoBusy(false);
      event.target.value = "";
    }
  }

  function submit(event) {
    event.preventDefault();
    const specialties = specialtiesText.split(",").map((item) => item.trim()).filter(Boolean);
    if (!name.trim() || !email.trim() || specialties.length === 0) {
      setError("Nama, email, dan minimal satu spesialisasi wajib diisi.");
      return;
    }
    onSave({
      trainer,
      profile: {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        bio: bio.trim(),
        avatar,
        specialties,
        specialty: specialties.join(" & "),
        experience: Number(experience) || 0,
        certified,
      },
    });
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#172235]/45 p-4 backdrop-blur-[2px]" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="trainer-profile-title" className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#e5e9ef] bg-white p-5 shadow-2xl sm:p-6">
        <header className="flex items-start justify-between gap-3">
          <div><p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#ff6b00]">Profil Trainer</p><h2 id="trainer-profile-title" className="mt-1 text-xl font-extrabold text-[#263346]">Edit Profil · {trainer.name}</h2><p className="mt-1 text-sm text-[#7b899e]">Admin dapat memperbarui profil trainer secara langsung.</p></div>
          <button type="button" onClick={onClose} aria-label="Tutup dialog" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e5e9ef] text-[#7b899e] hover:bg-[#f8fafc]">×</button>
        </header>
        <form onSubmit={submit} className="mt-5 space-y-4">
          <div className="flex items-center gap-4 rounded-xl border border-[#edf0f4] p-3">
            {avatar ? <img src={avatar} alt="Pratinjau foto trainer" className="h-16 w-16 rounded-full border border-[#e5e9ef] object-cover" /> : <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#fff1e7] text-lg font-extrabold text-[#e85f00]">{initials(name)}</div>}
            <div className="min-w-0 flex-1"><p className="text-sm font-bold text-[#344155]">Foto profil</p><p className="mt-1 text-xs text-[#8a97aa]">Foto baru akan digunakan di kartu trainer dan panel PT/Coach.</p><label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#dfe5ed] px-3 py-2 text-xs font-bold text-[#526177] hover:border-[#ffb987] hover:text-[#e85f00]">{photoBusy ? "Memproses foto..." : "Ganti foto"}<input type="file" accept="image/*" onChange={handlePhoto} disabled={photoBusy} className="sr-only" /></label></div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-[#344155]">Nama lengkap<input value={name} onChange={(event) => setName(event.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-[#dfe5ed] px-3 text-sm font-normal outline-none focus:border-[#ff6b00]" required /></label>
            <label className="block text-sm font-semibold text-[#344155]">Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-[#dfe5ed] px-3 text-sm font-normal outline-none focus:border-[#ff6b00]" required /></label>
            <label className="block text-sm font-semibold text-[#344155]">Nomor telepon<input value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-[#dfe5ed] px-3 text-sm font-normal outline-none focus:border-[#ff6b00]" /></label>
            <label className="block text-sm font-semibold text-[#344155]">Pengalaman (tahun)<input type="number" min="0" max="60" value={experience} onChange={(event) => setExperience(event.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-[#dfe5ed] px-3 text-sm font-normal outline-none focus:border-[#ff6b00]" /></label>
          </div>
          <label className="block text-sm font-semibold text-[#344155]">Spesialisasi / izin kelas <span className="font-normal text-[#8a97aa]">(pisahkan dengan koma)</span><input value={specialtiesText} onChange={(event) => setSpecialtiesText(event.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-[#dfe5ed] px-3 text-sm font-normal outline-none focus:border-[#ff6b00]" required /></label>
          <label className="flex items-center gap-2 text-sm text-[#526177]"><input type="checkbox" checked={certified} onChange={(event) => setCertified(event.target.checked)} className="h-4 w-4 accent-[#ff6b00]" /> Memiliki sertifikasi</label>
          <label className="block text-sm font-semibold text-[#344155]">Tentang trainer<textarea rows={3} value={bio} onChange={(event) => setBio(event.target.value)} className="mt-1.5 w-full rounded-lg border border-[#dfe5ed] px-3 py-2.5 text-sm font-normal outline-none focus:border-[#ff6b00]" /></label>
          {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <div className="flex justify-end gap-2 border-t border-[#edf0f4] pt-4"><button type="button" onClick={onClose} className="min-h-10 rounded-lg border border-[#dfe5ed] px-4 text-sm font-semibold text-[#526177] hover:bg-[#f8fafc]">Batal</button><button type="submit" disabled={photoBusy} className="min-h-10 rounded-lg bg-[#ff6b00] px-4 text-sm font-bold text-white transition hover:bg-[#ed6200] disabled:opacity-60">Simpan Profil</button></div>
        </form>
      </section>
    </div>
  );
}

function TrainerModal({ mode, trainer, onClose, onSave }) {
  const isSchedule = mode === "schedule";
  const [name, setName] = useState(trainer?.name?.replace(/^Coach\s+/, "") ?? "");
  const [specialty, setSpecialty] = useState(trainer?.specialty ?? "");
  const [experience, setExperience] = useState(String(trainer?.experience ?? 1));
  const [certified, setCertified] = useState(trainer?.certified ?? true);
  const [date, setDate] = useState(new Date().toLocaleDateString("en-CA"));
  const [time, setTime] = useState("16:00");
  const [sessionName, setSessionName] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    if (isSchedule) {
      if (!date || !time || !sessionName.trim()) {
        setError("Tanggal, waktu, dan nama sesi wajib diisi.");
        return;
      }
      const dateLabel = new Date(`${date}T00:00:00`).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
      onSave({ type: "schedule", trainerId: trainer.id, schedule: `${dateLabel}, ${time} • ${sessionName.trim()}`, availability: date === new Date().toLocaleDateString("en-CA") ? "Tersedia hari ini" : "Jadwal diperbarui" });
      return;
    }
    if (!name.trim() || !specialty.trim() || !experience.trim()) {
      setError("Nama trainer, spesialisasi, dan pengalaman wajib diisi.");
      return;
    }
    onSave({ type: "register", trainer: { id: Date.now(), name: `Coach ${name.trim()}`, specialty: specialty.trim(), rating: "—", sessions: 0, experience: Number(experience), certified, availability: "Jadwal belum diatur", schedule: "Belum ada jadwal", avatar: null } });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#172235]/45 p-4 backdrop-blur-[2px]" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="trainer-modal-title" className="w-full max-w-lg rounded-2xl border border-[#e5e9ef] bg-white p-5 shadow-2xl sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#ff6b00]">{isSchedule ? "Jadwal Trainer" : "Data Trainer"}</p>
            <h2 id="trainer-modal-title" className="mt-1 text-xl font-extrabold text-[#263346]">{isSchedule ? `Atur Jadwal • ${trainer?.name}` : "Registrasi Trainer"}</h2>
            <p className="mt-1 text-sm text-[#7b899e]">{isSchedule ? "Atur jadwal sesi sebagai data demo frontend." : "Tambahkan profil trainer untuk pratinjau antarmuka."}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup dialog" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e5e9ef] text-[#7b899e] hover:bg-[#f8fafc]">×</button>
        </div>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {isSchedule ? (
            <>
              <label className="block text-sm font-semibold text-[#344155]">Nama sesi
                <input value={sessionName} onChange={(event) => setSessionName(event.target.value)} placeholder="Contoh: Strength 101" className="mt-1.5 h-11 w-full rounded-lg border border-[#dfe5ed] px-3 font-normal outline-none focus:border-[#ff6b00] focus:ring-4 focus:ring-[#ff6b00]/10" />
              </label>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-[#344155]">Tanggal
                  <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-[#dfe5ed] px-3 font-normal outline-none focus:border-[#ff6b00]" />
                </label>
                <label className="block text-sm font-semibold text-[#344155]">Waktu
                  <input type="time" value={time} onChange={(event) => setTime(event.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-[#dfe5ed] px-3 font-normal outline-none focus:border-[#ff6b00]" />
                </label>
              </div>
            </>
          ) : (
            <>
              <label className="block text-sm font-semibold text-[#344155]">Nama trainer
                <input value={name} onChange={(event) => setName(event.target.value)} autoFocus placeholder="Masukkan nama trainer" className="mt-1.5 h-11 w-full rounded-lg border border-[#dfe5ed] px-3 font-normal outline-none focus:border-[#ff6b00] focus:ring-4 focus:ring-[#ff6b00]/10" />
              </label>
              <label className="block text-sm font-semibold text-[#344155]">Spesialisasi
                <input value={specialty} onChange={(event) => setSpecialty(event.target.value)} placeholder="Contoh: Strength Training" className="mt-1.5 h-11 w-full rounded-lg border border-[#dfe5ed] px-3 font-normal outline-none focus:border-[#ff6b00]" />
              </label>
              <label className="block text-sm font-semibold text-[#344155]">Pengalaman (tahun)
                <input type="number" min="0" max="60" value={experience} onChange={(event) => setExperience(event.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-[#dfe5ed] px-3 font-normal outline-none focus:border-[#ff6b00]" />
              </label>
              <label className="flex items-center gap-2 text-sm text-[#526177]">
                <input type="checkbox" checked={certified} onChange={(event) => setCertified(event.target.checked)} className="h-4 w-4 accent-[#ff6b00]" /> Memiliki sertifikasi
              </label>
            </>
          )}
          {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <div className="flex justify-end gap-2 border-t border-[#edf0f4] pt-4">
            <button type="button" onClick={onClose} className="min-h-10 rounded-lg border border-[#dfe5ed] px-4 text-sm font-semibold text-[#526177] hover:bg-[#f8fafc]">Batal</button>
            <button type="submit" className="min-h-10 rounded-lg bg-[#ff6b00] px-4 text-sm font-bold text-white transition hover:bg-[#ed6200]">{isSchedule ? "Simpan Jadwal Demo" : "Tambah Trainer"}</button>
          </div>
        </form>
      </section>
    </div>
  );
}

function TrainerCard({ trainer, onSchedule, onEditProfile }) {
  const isAvailable = trainer.availability === "Tersedia hari ini";
  return (
    <article className="flex min-w-0 flex-col rounded-xl border border-[#e5e9ef] bg-white p-5 transition hover:border-[#d8dee8] hover:shadow-[0_8px_24px_rgba(27,39,58,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          {trainer.avatar ? (
            <img src={trainer.avatar} alt={trainer.name} className="h-[68px] w-[68px] rounded-full border border-[#edf0f4] object-cover" />
          ) : (
            <div className="flex h-[68px] w-[68px] items-center justify-center rounded-full bg-[#fff1e7] text-lg font-extrabold text-[#e85f00]">{initials(trainer.name)}</div>
          )}
          <button type="button" onClick={() => onEditProfile(trainer)} title={`Edit profil ${trainer.name}`} aria-label={`Edit profil ${trainer.name}`} className="mt-1 inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#dfe5ed] bg-white px-2 text-[11px] font-bold text-[#68778d] transition hover:border-[#ffb987] hover:bg-[#fff8f3] hover:text-[#e85f00]"><AdminIcon name="user" className="h-3.5 w-3.5" /> Edit profil</button>
        </div>
        <span className={`mt-2 inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${isAvailable ? "bg-[#e9f8f1] text-emerald-700" : "bg-[#f1f4f8] text-[#718096]"}`}>{trainer.availability}</span>
      </div>
      <h2 className="mt-4 text-lg font-extrabold text-[#263346]">{trainer.name}</h2>
      <p className="mt-1 min-h-5 text-sm text-[#7b899e]">{trainer.specialty}</p>
      <div className="my-4 grid grid-cols-2 gap-4 border-y border-[#e8ecf2] py-3.5">
        <div>
          <p className="text-lg font-extrabold text-[#263346]">{trainer.rating}<span className="ml-0.5 text-[#ff8a00]">★</span></p>
          <p className="mt-0.5 text-xs text-[#7b899e]">Rating member</p>
        </div>
        <div>
          <p className="text-lg font-extrabold text-[#263346]">{trainer.sessions}</p>
          <p className="mt-0.5 text-xs text-[#7b899e]">Total sesi</p>
        </div>
      </div>
      <p className="text-xs text-[#7b899e]">{trainer.experience} tahun pengalaman{trainer.certified ? " • Bersertifikat" : " • Sertifikasi belum dicatat"}</p>
      <p className="mt-3 flex min-h-[36px] items-start gap-2 text-xs leading-5 text-[#344155]">
        <AdminIcon name="calendar" className="mt-0.5 h-4 w-4 shrink-0 text-[#718096]" />
        <span>{trainer.schedule}</span>
      </p>
      <button type="button" onClick={() => onSchedule(trainer)} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#ff6b00] px-4 text-sm font-bold text-white transition hover:bg-[#ed6200] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#ff6b00]/20">
        <AdminIcon name="calendar" className="h-4 w-4" /> Atur Jadwal
      </button>
    </article>
  );
}

function AdminTrainersPage() {
  const [trainers, setTrainers] = useState(getTrainerRows);
  const [search, setSearch] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("Semua trainer");
  const [modal, setModal] = useState(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const refreshProfiles = () => setTrainers((current) => current.map((trainer) => applyTrainerProfile(trainer)));
    window.addEventListener("storage", refreshProfiles);
    window.addEventListener(TRAINER_PERMISSION_EVENT, refreshProfiles);
    return () => {
      window.removeEventListener("storage", refreshProfiles);
      window.removeEventListener(TRAINER_PERMISSION_EVENT, refreshProfiles);
    };
  }, []);

  const filteredTrainers = useMemo(() => trainers.filter((trainer) => {
    const term = search.trim().toLowerCase();
    const matchesSearch = !term || `${trainer.name} ${trainer.specialty}`.toLowerCase().includes(term);
    const matchesAvailability = availabilityFilter === "Semua trainer" || (availabilityFilter === "Tersedia hari ini" ? trainer.availability === "Tersedia hari ini" : trainer.availability !== "Tersedia hari ini");
    return matchesSearch && matchesAvailability;
  }), [trainers, search, availabilityFilter]);

  function handleModalSave(payload) {
    if (payload.type === "register") {
      const newTrainer = { ...payload.trainer, accountId: `trainer-${payload.trainer.id}` };
      setTrainers((current) => [...current, newTrainer]);
      setNotice(`${payload.trainer.name} berhasil ditambahkan ke daftar trainer.`);
    } else {
      setTrainers((current) => current.map((trainer) => trainer.id === payload.trainerId ? { ...trainer, schedule: payload.schedule, availability: payload.availability } : trainer));
      setNotice(`Jadwal ${trainers.find((trainer) => trainer.id === payload.trainerId)?.name ?? "trainer"} berhasil diperbarui pada tampilan ini.`);
    }
    setModal(null);
  }

  function handleProfileSave(payload) {
    const key = trainerAccountId(payload.trainer);
    saveTrainerProfileOverride(key, payload.profile);
    supersedePendingTrainerProfileChangeRequests(key);
    setTrainers((current) => current.map((trainer) => applyTrainerProfile(trainer)));
    setNotice(`Profil ${payload.trainer.name} berhasil diperbarui.`);
    setModal(null);
  }

  const availableCount = trainers.filter((trainer) => trainer.availability === "Tersedia hari ini").length;

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#263346] md:flex">
      <AdminSidebar />
      <div className="min-w-0 flex-1">
        <header className="flex h-[70px] items-center border-b border-[#e5e9ef] bg-white px-5 sm:px-8 lg:px-10">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-[#8a97aa]">Workspace</span>
            <AdminIcon name="chevron" className="h-4 w-4 text-[#9aa5b4]" />
            <span className="font-semibold text-[#263346]">Kelola Trainer</span>
          </div>
        </header>

        <div className="mx-auto max-w-[1700px] px-5 pb-8 pt-7 sm:px-8 lg:px-10 lg:pt-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-[#263346] sm:text-[30px]">Kelola Trainer &amp; Instruktur</h1>
              <p className="mt-2 text-sm text-[#7b899e]">Tim terbaik untuk mendukung perjalanan kebugaran member Anda.</p>
            </div>
            <button type="button" onClick={() => { setNotice(""); setModal({ mode: "register" }); }} className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-lg bg-[#ff6b00] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#ed6200] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#ff6b00]/20 sm:self-auto">
              <span className="text-lg leading-none">+</span> Registrasi Trainer
            </button>
          </div>

          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <label className="flex h-11 w-full max-w-[430px] items-center gap-3 rounded-lg border border-[#dfe5ed] bg-white px-3.5 text-[#8290a3] focus-within:border-[#ff6b00] focus-within:ring-4 focus-within:ring-[#ff6b00]/10">
              <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5" strokeLinecap="round" /></svg>
              <input aria-label="Cari trainer atau spesialisasi" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari trainer atau spesialisasi..." className="h-full min-w-0 flex-1 bg-transparent text-sm text-[#344155] outline-none placeholder:text-[#a4aebb]" />
              {search && <button type="button" onClick={() => setSearch("")} className="text-xs font-semibold text-[#e85f00]">Hapus</button>}
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex rounded-md bg-[#fff1e7] px-2.5 py-1.5 text-xs font-bold text-[#e85f00]">Semua Trainer&nbsp; {trainers.length}</span>
              <span className="inline-flex rounded-md bg-[#e9f8f1] px-2.5 py-1.5 text-xs font-bold text-emerald-700">Tersedia Hari Ini&nbsp; {availableCount}</span>
              <select aria-label="Filter ketersediaan trainer" value={availabilityFilter} onChange={(event) => setAvailabilityFilter(event.target.value)} className="h-10 rounded-lg border border-[#dfe5ed] bg-white px-3 text-sm font-semibold text-[#344155] outline-none focus:border-[#ff6b00]">
                <option>Semua trainer</option><option>Tersedia hari ini</option><option>Jadwal lain</option>
              </select>
            </div>
          </div>

          {notice && <div role="status" className="mb-4 flex items-start justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"><span>{notice}</span><button type="button" onClick={() => setNotice("")} aria-label="Tutup pemberitahuan">×</button></div>}

          <section aria-label="Daftar trainer" className="grid grid-cols-1 gap-5 sm:grid-cols-2 2xl:grid-cols-3">
            {filteredTrainers.map((trainer) => <TrainerCard key={trainer.id} trainer={trainer} onEditProfile={(selectedTrainer) => { setNotice(""); setModal({ mode: "edit-profile", trainer: selectedTrainer }); }} onSchedule={(selectedTrainer) => { setNotice(""); setModal({ mode: "schedule", trainer: selectedTrainer }); }} />)}
            {filteredTrainers.length === 0 && <div className="rounded-xl border border-dashed border-[#dfe5ed] bg-white px-5 py-14 text-center text-sm text-[#8a97aa] sm:col-span-2 2xl:col-span-3">Tidak ada trainer yang cocok dengan pencarian atau filter.</div>}
          </section>

          <footer className="flex flex-col gap-2 pb-2 pt-6 text-[11px] text-[#a2adbc] sm:flex-row sm:items-center sm:justify-between">
            <span>© 2026 BugarHub • Admin workspace</span>
            <span>Data contoh untuk pratinjau antarmuka</span>
          </footer>
          <p className="mt-2 rounded-lg border border-[#f5d4b6] bg-[#fff8f1] px-3 py-2 text-xs leading-5 text-[#9b5a22]">Catatan: profil trainer, rating, jumlah sesi, dan jadwal yang tampil adalah data demo. Registrasi dan pengaturan jadwal belum tersimpan ke backend.</p>
        </div>
      </div>
      {modal?.mode === "edit-profile" && <TrainerProfileModal trainer={modal.trainer} onClose={() => setModal(null)} onSave={handleProfileSave} />}
      {modal && modal.mode !== "edit-profile" && <TrainerModal mode={modal.mode} trainer={modal.trainer} onClose={() => setModal(null)} onSave={handleModalSave} />}
    </main>
  );
}

export default AdminTrainersPage;
