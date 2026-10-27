import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import TrainerPageLayout from "../../components/TrainerPageLayout";
import { AdminIcon } from "../../components/AdminSidebar";
import { getStaffSession } from "../../utils/staffSession";
import {
  getTrainerPermissionRequests,
  requestTrainerPermission,
  TRAINER_PERMISSION_EVENT,
} from "../../utils/trainerPermissionRequests";
import { addDays, toISODate } from "../../utils/trainerWorkspaceData";
import { saveTrainerClasses, TRAINER_CLASSES_STORAGE_KEY, TRAINER_CLASSES_UPDATED_EVENT } from "../../utils/trainerClassSchedule";
import { CLASS_RESERVATIONS_UPDATED_EVENT, getClassReservationCounts, getClassReservations, getClassCapacitySnapshot } from "../../utils/classReservationData";

const STORAGE_KEY = TRAINER_CLASSES_STORAGE_KEY;

const CLASS_TYPES = [
  { category: "Strength Training", description: "Latihan kekuatan, teknik gerakan, dan program beban." },
  { category: "Personal Training", description: "Sesi satu lawan satu dengan program individual." },
  { category: "HIIT", description: "Latihan interval intensitas tinggi." },
  { category: "Yoga", description: "Latihan mobilitas, pernapasan, keseimbangan, dan fokus." },
  { category: "Pilates", description: "Latihan kontrol tubuh, stabilitas inti, dan fleksibilitas." },
  { category: "Mobility & Flexibility", description: "Latihan mobilitas sendi dan fleksibilitas tubuh." },
  { category: "Spinning", description: "Latihan kardio menggunakan sepeda statis." },
  { category: "Zumba & Dance Fitness", description: "Latihan kebugaran berbasis gerakan tari." },
  { category: "CrossFit", description: "Latihan fungsional dengan kombinasi kekuatan dan kardio." },
  { category: "Boxing & Conditioning", description: "Teknik tinju, koordinasi, dan conditioning." },
  { category: "Body Balance", description: "Latihan kombinasi keseimbangan, peregangan, dan kontrol tubuh." },
  { category: "Functional Training", description: "Latihan gerakan fungsional untuk aktivitas sehari-hari." },
];

const CLASS_SEEDS = [
  { id: "CL-101", title: "Strength Training 101", category: "Strength Training", dateOffset: 1, startTime: "08:00", endTime: "09:00", capacity: 8, students: 5, room: "Main Gym", description: "Dasar teknik strength training dan program beban." },
  { id: "CL-102", title: "Personal Training Intro", category: "Personal Training", dateOffset: 2, startTime: "10:00", endTime: "11:00", capacity: 1, students: 1, room: "Training Area", description: "Sesi satu lawan satu dengan program latihan individual." },
  { id: "CL-103", title: "HIIT Burn", category: "HIIT", dateOffset: 3, startTime: "16:00", endTime: "17:00", capacity: 12, students: 9, room: "Studio B", description: "Sesi interval intensitas tinggi." },
  { id: "CL-104", title: "Yoga Flow", category: "Yoga", dateOffset: 4, startTime: "09:00", endTime: "10:00", capacity: 12, students: 7, room: "Studio A", description: "Kelas mobilitas dan pernapasan." },
];

function makeSeedClasses() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return CLASS_SEEDS.map(({ dateOffset, ...item }) => ({ ...item, date: toISODate(addDays(today, dateOffset)), added: false }));
}

function readClasses() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value) {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    }
    const seed = makeSeedClasses();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  } catch {
    return makeSeedClasses();
  }
}

function writeClasses(items) {
  return saveTrainerClasses(items);
}

function hasPermission(trainer, category) {
  const specialties = Array.isArray(trainer?.specialties) ? trainer.specialties : [];
  return specialties.some((specialty) => specialty.trim().toLowerCase() === category.trim().toLowerCase());
}

function formatDate(date) {
  if (!date) return "—";
  return new Date(`${date}T12:00:00`).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function ClassFormModal({ types, item, onClose, onSave, onDelete, classReservations = [] }) {
  const isEdit = Boolean(item);
  const [title, setTitle] = useState(item?.title || types[0] || "Personal Training");
  const [category, setCategory] = useState(item?.category || types[0] || "Personal Training");
  const [date, setDate] = useState(item?.date || toISODate(addDays(new Date(), 1)));
  const [startTime, setStartTime] = useState(item?.startTime || "09:00");
  const [endTime, setEndTime] = useState(item?.endTime || "10:00");
  const [capacity, setCapacity] = useState(String(item?.capacity ?? 8));
  const [students, setStudents] = useState(String(item?.students ?? 0));
  const [room, setRoom] = useState(item?.room || "Main Gym");
  const [description, setDescription] = useState(item?.description || "");
  const [error, setError] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "date", direction: "desc" });

  const classParticipantRows = useMemo(() => {
    if (!item?.id) return [];
    const visibleStatuses = ["confirmed", "completed"];
    const query = memberSearch.trim().toLocaleLowerCase("id-ID");
    return (Array.isArray(classReservations) ? classReservations : [])
      .filter((reservation) => String(reservation.classId) === String(item.id) && visibleStatuses.includes(reservation.status))
      .filter((reservation) => {
        const name = String(reservation.memberName || reservation.member || "Member BugarHub").toLocaleLowerCase("id-ID");
        const email = String(reservation.memberEmail || "").toLocaleLowerCase("id-ID");
        return !query || name.includes(query) || email.includes(query);
      })
      .sort((left, right) => {
        if (sortConfig.key === "name") {
          const order = String(left.memberName || left.member || "Member").localeCompare(String(right.memberName || right.member || "Member"), "id", { sensitivity: "base" });
          return sortConfig.direction === "asc" ? order : -order;
        }
        const leftDate = new Date(left.createdAt || `${left.dateISO || left.date || "1970-01-01"}T00:00:00`).getTime();
        const rightDate = new Date(right.createdAt || `${right.dateISO || right.date || "1970-01-01"}T00:00:00`).getTime();
        const order = leftDate - rightDate;
        return sortConfig.direction === "asc" ? order : -order;
      });
  }, [classReservations, item?.id, memberSearch, sortConfig]);

  function toggleSort(key) {
    setSortConfig((current) => current.key === key
      ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
      : { key, direction: key === "date" ? "desc" : "asc" });
  }

  function formatReservationDate(reservation) {
    const raw = reservation.createdAt || `${reservation.dateISO || reservation.date || "1970-01-01"}T00:00:00`;
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  function memberInitials(name) {
    return String(name || "Member").trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part.charAt(0)).join("").toUpperCase() || "MB";
  }

  function submit(event) {
    event.preventDefault();
    const numericCapacity = Number(capacity);
    const numericStudents = Number(students);
    if (!title.trim() || !date || !startTime || !endTime || startTime >= endTime) {
      setError("Lengkapi judul, tanggal, dan rentang waktu yang valid.");
      return;
    }
    if (!Number.isInteger(numericCapacity) || numericCapacity < 1 || numericCapacity > 100) {
      setError("Kapasitas maksimal harus antara 1 sampai 100 peserta.");
      return;
    }
    if (!Number.isInteger(numericStudents) || numericStudents < 0 || numericStudents > numericCapacity) {
      setError("Jumlah peserta terdaftar tidak boleh melebihi kapasitas maksimal.");
      return;
    }
    onSave({
      ...(item || {}),
      id: item?.id || `CL-${Date.now()}`,
      title: title.trim(),
      category,
      date,
      startTime,
      endTime,
      capacity: numericCapacity,
      students: numericStudents,
      room,
      description: description.trim(),
      added: item?.added ?? true,
    });
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#182334]/45 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="class-form-title" className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#e3e8ef] bg-white p-5 shadow-2xl sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#ff6b00]">Manajemen kelas</p>
            <h2 id="class-form-title" className="mt-1 text-xl font-extrabold text-[#263346]">{isEdit ? "Kelola kelas" : "Tambah jadwal kelas"}</h2>
            <p className="mt-1 text-sm text-[#7b899e]">Perubahan disimpan pada data jadwal di browser ini.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup" className="h-9 w-9 shrink-0 rounded-full border border-[#e3e8ef] text-lg text-[#7b899e] hover:bg-slate-50">×</button>
        </div>
        <form onSubmit={submit} className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-[#344155]">Judul kelas<input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={80} required placeholder="Contoh: Pilates Core" className="mt-1.5 h-11 w-full rounded-lg border border-[#dfe5ed] px-3 text-sm outline-none focus:border-[#ff6b00]" /></label>
            <label className="block text-sm font-semibold text-[#344155]">Jenis latihan<select value={category} onChange={(event) => { setCategory(event.target.value); if (!title || types.includes(title)) setTitle(event.target.value); }} className="mt-1.5 h-11 w-full rounded-lg border border-[#dfe5ed] bg-white px-3 text-sm outline-none focus:border-[#ff6b00]">{types.map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
            <label className="block text-sm font-semibold text-[#344155]">Tanggal<input type="date" value={date} onChange={(event) => setDate(event.target.value)} required className="mt-1.5 h-11 w-full rounded-lg border border-[#dfe5ed] px-3 text-sm outline-none focus:border-[#ff6b00]" /></label>
            <label className="block text-sm font-semibold text-[#344155]">Lokasi<select value={room} onChange={(event) => setRoom(event.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-[#dfe5ed] bg-white px-3 text-sm outline-none focus:border-[#ff6b00]"><option>Main Gym</option><option>Studio A</option><option>Studio B</option><option>Training Area</option><option>Studio C</option><option>Outdoor Area</option></select></label>
            <label className="block text-sm font-semibold text-[#344155]">Jam mulai<input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} required className="mt-1.5 h-11 w-full rounded-lg border border-[#dfe5ed] px-3 text-sm outline-none focus:border-[#ff6b00]" /></label>
            <label className="block text-sm font-semibold text-[#344155]">Jam selesai<input type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} required className="mt-1.5 h-11 w-full rounded-lg border border-[#dfe5ed] px-3 text-sm outline-none focus:border-[#ff6b00]" /></label>
            <label className="block text-sm font-semibold text-[#344155]">Kapasitas maksimal<input type="number" min="1" max="100" value={capacity} onChange={(event) => setCapacity(event.target.value)} required className="mt-1.5 h-11 w-full rounded-lg border border-[#dfe5ed] px-3 text-sm outline-none focus:border-[#ff6b00]" /></label>
            <label className="block text-sm font-semibold text-[#344155]">Peserta terdaftar<input type="number" min="0" max={capacity || 100} value={students} onChange={(event) => setStudents(event.target.value)} required className="mt-1.5 h-11 w-full rounded-lg border border-[#dfe5ed] px-3 text-sm outline-none focus:border-[#ff6b00]" /><span className="mt-1 block text-[11px] font-normal text-[#8a97aa]">Maksimal {capacity || 0} peserta.</span></label>
          </div>
          <label className="block text-sm font-semibold text-[#344155]">Deskripsi kelas<textarea rows={3} value={description} onChange={(event) => setDescription(event.target.value)} maxLength={350} placeholder="Jelaskan fokus atau tujuan kelas..." className="mt-1.5 w-full rounded-lg border border-[#dfe5ed] px-3 py-2.5 text-sm outline-none focus:border-[#ff6b00]" /></label>

          <section className="border-t border-[#edf0f4] pt-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-extrabold text-[#263346]">Member kelas</h3>
                <p className="mt-1 text-xs leading-5 text-[#7b899e]">Daftar member yang sudah bergabung. Peserta tercatat langsung selama kuota masih tersedia.</p>
              </div>
              <span className="rounded-full bg-[#f4f6f9] px-3 py-1.5 text-xs font-bold text-[#526177]">{classParticipantRows.length} member</span>
            </div>
            {isEdit ? <>
              <div className="mt-3">
                <input value={memberSearch} onChange={(event) => setMemberSearch(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") event.preventDefault(); }} placeholder="Cari nama atau email member..." aria-label="Cari nama member kelas" className="h-10 w-full rounded-lg border border-[#dfe5ed] px-3 text-sm outline-none transition focus:border-[#ff6b00]" />
              </div>
              <div className="mt-3 overflow-x-auto rounded-xl border border-[#e5e9ef]">
                <table className="w-full min-w-[520px] border-collapse text-left text-sm">
                  <thead className="bg-[#f8fafc] text-xs uppercase tracking-wide text-[#8794a8]">
                    <tr>
                      <th className="px-3 py-3 font-bold">
                        <button
                          type="button"
                          onClick={() => toggleSort("name")}
                          className="inline-flex items-center gap-1.5 transition hover:text-[#e85f00]"
                        >
                          Nama member <span aria-hidden="true">{sortConfig.key === "name" ? (sortConfig.direction === "asc" ? "↑ A-Z" : "↓ Z-A") : "↕"}</span>
                        </button>
                      </th>
                      <th className="px-3 py-3 font-bold">
                        <button
                          type="button"
                          onClick={() => toggleSort("date")}
                          className="inline-flex items-center gap-1.5 transition hover:text-[#e85f00]"
                        >
                          Tanggal bergabung <span aria-hidden="true">{sortConfig.key === "date" ? (sortConfig.direction === "desc" ? "↓ Baru–lama" : "↑ Lama–baru") : "↕"}</span>
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#edf0f4]">
                    {classParticipantRows.length === 0 ? <tr><td colSpan={2} className="px-3 py-8 text-center text-sm text-[#8a97aa]">{memberSearch.trim() ? "Member tidak ditemukan." : "Belum ada member yang bergabung dengan kelas ini."}</td></tr> : classParticipantRows.map((reservation) => {
                      const memberName = reservation.memberName || reservation.member || "Member BugarHub";
                      const avatar = reservation.memberAvatar || reservation.avatarDataUrl || reservation.memberPhoto || reservation.avatar || "";
                      return <tr key={reservation.id} className="bg-white align-middle">
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-3">
                            {avatar ? <img src={avatar} alt={`Foto ${memberName}`} className="h-10 w-10 shrink-0 rounded-full border border-[#e5e9ef] object-cover" /> : <span aria-label={`Foto profil ${memberName}`} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#ffe0ca] bg-[#fff1e7] text-xs font-extrabold text-[#df5b00]">{memberInitials(memberName)}</span>}
                            <div className="min-w-0"><p className="font-bold text-[#263346]">{memberName}</p>{reservation.memberEmail && <p className="mt-0.5 truncate text-xs text-[#8a97aa]">{reservation.memberEmail}</p>}</div>
                          </div>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-xs text-[#526177]">{formatReservationDate(reservation)}</td>
                      </tr>;
                    })}
                  </tbody>
                </table>
              </div>
              {Number(item.students || 0) > 0 && <p className="mt-2 text-[11px] leading-5 text-[#8a97aa]">Catatan: {Number(item.students)} peserta pada data awal kelas tidak memiliki identitas reservasi individual. Daftar di atas menampilkan member yang mendaftar melalui BugarHub.</p>}
            </> : <div className="mt-3 rounded-lg border border-dashed border-[#dfe5ed] bg-[#fafbfc] px-4 py-5 text-sm text-[#8a97aa]">Simpan jadwal kelas terlebih dahulu. Daftar member akan muncul setelah kelas dibuat dan member langsung bergabung sesuai kuota.</div>}
          </section>
          {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <div className="flex flex-col-reverse gap-2 border-t border-[#edf0f4] pt-4 sm:flex-row sm:items-center sm:justify-between">
            {isEdit ? <button type="button" onClick={() => onDelete(item)} className="min-h-10 rounded-lg px-3 text-sm font-semibold text-red-600 transition hover:bg-red-50">Hapus kelas</button> : <span />}
            <div className="flex justify-end gap-2"><button type="button" onClick={onClose} className="min-h-10 rounded-lg border border-[#dfe5ed] px-4 text-sm font-semibold text-[#526177] hover:bg-slate-50">Batal</button><button type="submit" className="min-h-10 rounded-lg bg-[#ff6b00] px-4 text-sm font-bold text-white transition hover:bg-[#ec6200]">{isEdit ? "Simpan perubahan" : "Simpan jadwal"}</button></div>
          </div>
        </form>
      </section>
    </div>
  );
}

function TrainerClassesPage() {
  const [trainer, setTrainer] = useState(() => getStaffSession());
  const [classes, setClasses] = useState(readClasses);
  const [classReservations, setClassReservations] = useState(getClassReservations);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [permissionRequests, setPermissionRequests] = useState(getTrainerPermissionRequests);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const refresh = () => {
      setTrainer(getStaffSession());
      setClasses(readClasses());
      setClassReservations(getClassReservations());
      setPermissionRequests(getTrainerPermissionRequests());
    };
    window.addEventListener("storage", refresh);
    window.addEventListener(TRAINER_PERMISSION_EVENT, refresh);
    window.addEventListener(TRAINER_CLASSES_UPDATED_EVENT, refresh);
    window.addEventListener(CLASS_RESERVATIONS_UPDATED_EVENT, refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener(TRAINER_PERMISSION_EVENT, refresh);
      window.removeEventListener(TRAINER_CLASSES_UPDATED_EVENT, refresh);
      window.removeEventListener(CLASS_RESERVATIONS_UPDATED_EVENT, refresh);
    };
  }, []);

  if (!trainer || trainer.role !== "trainer") return <Navigate to="/admin/login" replace />;

  const specialties = trainer.specialties?.length ? trainer.specialties : ["Personal Training", "Strength Training"];
  const allowedClasses = classes.filter((item) => hasPermission(trainer, item.category));
  const requestableTypes = CLASS_TYPES.filter((item) => !hasPermission(trainer, item.category));
  const latestRequestsByCategory = new Map();
  permissionRequests
    .filter((item) => item.trainerId === String(trainer.id || trainer.username || trainer.email || "trainer-001"))
    .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime())
    .forEach((item) => { if (!latestRequestsByCategory.has(item.category)) latestRequestsByCategory.set(item.category, item); });

  function saveClass(item) {
    const classWithOwner = {
      ...item,
      trainerId: item.trainerId || String(trainer.id || trainer.username || trainer.email || "trainer-001"),
      trainerName: item.trainerName || trainer.name || trainer.username || "PT/Coach",
      trainerEmail: item.trainerEmail || trainer.email || "",
    };
    if (editingClass) {
      const counts = getClassReservationCounts(classWithOwner.id, classReservations);
      const reservedOrAccepted = Number(classWithOwner.students || 0) + counts.confirmed + counts.completed;
      if (Number(classWithOwner.capacity) < reservedOrAccepted) {
        setNotice(`Kapasitas tidak bisa diubah menjadi ${classWithOwner.capacity}, karena sudah terdaftar ${reservedOrAccepted} peserta.`);
        return;
      }
    }
    const next = editingClass
      ? classes.map((existing) => existing.id === classWithOwner.id ? classWithOwner : existing)
      : [...classes, classWithOwner];
    setClasses(next);
    writeClasses(next);
    setEditingClass(null);
    setShowCreateModal(false);
    setNotice(editingClass ? "Perubahan kelas berhasil disimpan." : "Jadwal kelas berhasil ditambahkan.");
  }

  function deleteClass(item) {
    const next = classes.filter((existing) => existing.id !== item.id);
    setClasses(next);
    writeClasses(next);
    setEditingClass(null);
    setNotice(`Kelas ${item.title} berhasil dihapus dari jadwal ini.`);
  }


  function handlePermissionRequest(category) {
    const result = requestTrainerPermission(trainer, category);
    setPermissionRequests(getTrainerPermissionRequests());
    if (result.ok) setNotice(`Permintaan izin ${category} berhasil dikirim ke Admin.`);
    else if (result.reason === "already_pending") setNotice(`Permintaan izin ${category} sudah menunggu persetujuan Admin.`);
    else setNotice(`Akunmu sudah memiliki izin ${category}.`);
  }

  const actions = <button type="button" onClick={() => setShowCreateModal(true)} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#ff6b00] px-4 text-sm font-bold text-white transition hover:bg-[#eb6200]"><AdminIcon name="activity" className="h-4 w-4" />Tambah jadwal kelas</button>;

  return (
    <TrainerPageLayout title="Manajemen Kelas" subtitle="Kelola jadwal kelas sesuai spesialisasi dan ajukan izin untuk jenis latihan lainnya." actions={actions}>
      {notice && <div role="status" className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-[#cfeedd] bg-[#f0fbf5] px-4 py-3 text-sm text-[#176b43]"><span>{notice}</span><button type="button" onClick={() => setNotice("")} aria-label="Tutup" className="font-bold">×</button></div>}

      <section className="rounded-xl border border-[#e5e9ef] bg-white p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#fff1e7] text-[#e85f00]"><AdminIcon name="shield" className="h-5 w-5" /></span>
          <div className="min-w-0"><h2 className="font-extrabold text-[#263346]">Spesialisasi dan izin kelas</h2><p className="mt-1 text-sm leading-6 text-[#7b899e]">Akunmu memiliki izin untuk jenis latihan berikut. Izin baru akan muncul di sini setelah disetujui Admin.</p><div className="mt-3 flex flex-wrap gap-2">{specialties.map((item) => <span key={item} className="rounded-full border border-[#f5d4bd] bg-[#fff7f1] px-3 py-1.5 text-xs font-semibold text-[#9a4f1b]">{item}</span>)}</div></div>
        </div>
      </section>

      <section className="mt-6">
        <div className="mb-3 flex items-end justify-between gap-3"><div><h2 className="text-lg font-extrabold text-[#263346]">Kelas yang dapat dikelola</h2><p className="mt-1 text-sm text-[#7b899e]">Klik Kelola kelas untuk mengubah detail kelas dan melihat member yang telah bergabung.</p></div><span className="rounded-full bg-[#e8f7ef] px-3 py-1.5 text-xs font-bold text-emerald-700">{allowedClasses.length} kelas</span></div>
        <div className="grid gap-4 xl:grid-cols-2">{allowedClasses.map((item) => <ClassCard key={item.id} item={item} reservationSnapshot={getClassCapacitySnapshot(item, classReservations)} onEdit={() => { setEditingClass(classes.find((existing) => String(existing.id) === String(item.id)) || item); setShowCreateModal(false); }} />)}{allowedClasses.length === 0 && <EmptyCard message="Belum ada jadwal pada izin kelas yang kamu miliki. Gunakan Tambah jadwal kelas untuk membuat jadwal baru." />}</div>
      </section>

      <section className="mt-7">
        <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="text-lg font-extrabold text-[#263346]">Izin Kelas Lainnya</h2><p className="mt-1 text-sm text-[#7b899e]">Jelajahi jenis latihan yang tersedia dan ajukan izin kepada Admin agar bisa mengelolanya.</p></div><span className="self-start rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 sm:self-auto">{requestableTypes.length} jenis latihan</span></div>
        <div className="grid gap-4 xl:grid-cols-2">
          {requestableTypes.map((type) => {
            const request = latestRequestsByCategory.get(type.category);
            return <PermissionTypeCard key={type.category} type={type} request={request} onRequest={() => handlePermissionRequest(type.category)} />;
          })}
          {requestableTypes.length === 0 && <EmptyCard message="Kamu telah memiliki izin untuk seluruh jenis latihan yang tersedia." />}
        </div>
      </section>

      {(showCreateModal || editingClass) && <ClassFormModal types={specialties} item={editingClass} classReservations={classReservations} onClose={() => { setShowCreateModal(false); setEditingClass(null); }} onSave={saveClass} onDelete={(item) => { if (window.confirm(`Hapus kelas ${item.title} dari jadwal?`)) deleteClass(item); }} />}
    </TrainerPageLayout>
  );
}

function ClassCard({ item, reservationSnapshot, onEdit }) {
  const snapshot = reservationSnapshot || getClassCapacitySnapshot(item);
  const full = snapshot.isFull;
  return <article className="rounded-xl border border-[#e5e9ef] bg-white p-5 transition hover:border-[#d9e0e8] hover:shadow-sm">
    <div className="flex items-start justify-between gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff1e7] text-[#e85f00]"><AdminIcon name="dumbbell" className="h-5 w-5" /></span><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${full ? "bg-orange-50 text-orange-700" : "bg-[#e8f7ef] text-emerald-700"}`}>{full ? "Penuh" : "Dapat dikelola"}</span></div>
    <h3 className="mt-4 text-base font-extrabold text-[#263346]">{item.title}</h3><p className="mt-1 text-sm text-[#7b899e]">{item.category}</p>
    <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-[#f8fafc] p-3"><InfoItem label="Tanggal" value={formatDate(item.date)} /><InfoItem label="Waktu" value={`${item.startTime}–${item.endTime}`} /><InfoItem label="Peserta terdaftar" value={`${snapshot.accepted}/${snapshot.capacity}`} /><InfoItem label="Lokasi" value={item.room} /></div>
    <p className="mt-3 min-h-10 text-xs leading-5 text-[#7b899e]">{item.description || "Belum ada deskripsi kelas."}</p>
    <button type="button" onClick={onEdit} className="mt-4 min-h-10 w-full rounded-lg border border-[#ffd4b3] px-3 text-sm font-bold text-[#e85f00] transition hover:bg-[#fff1e7]">Kelola kelas</button>
  </article>;
}

function PermissionTypeCard({ type, request, onRequest }) {
  const pending = request?.status === "pending";
  const rejected = request?.status === "rejected";
  return <article className="rounded-xl border border-[#e5e9ef] bg-white p-4 sm:p-5">
    <div className="flex items-start justify-between gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f3f5f8] text-[#738198]"><AdminIcon name="activity" className="h-5 w-5" /></span>{pending ? <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700">Menunggu persetujuan</span> : rejected ? <span className="rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-700">Permintaan ditolak</span> : <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">Belum memiliki izin</span>}</div>
    <h3 className="mt-4 text-base font-extrabold text-[#263346]">{type.category}</h3><p className="mt-2 min-h-10 text-xs leading-5 text-[#7b899e]">{type.description}</p>
    <button type="button" onClick={onRequest} disabled={pending} className={`mt-4 min-h-10 w-full rounded-lg border px-3 text-sm font-bold transition ${pending ? "cursor-not-allowed border-amber-100 bg-amber-50 text-amber-700" : "border-[#ffd4b3] text-[#e85f00] hover:bg-[#fff1e7]"}`}>{pending ? "Permintaan dikirim" : rejected ? "Minta izin lagi" : "Minta izin"}</button>
  </article>;
}

function InfoItem({ label, value }) {
  return <div><p className="text-[10px] uppercase tracking-wide text-[#8a97aa]">{label}</p><p className="mt-1 text-sm font-bold text-[#344155]">{value}</p></div>;
}

function EmptyCard({ message }) {
  return <div className="rounded-xl border border-dashed border-[#dfe5ed] bg-white px-5 py-8 text-center text-sm text-[#8a97aa]">{message}</div>;
}

export default TrainerClassesPage;
