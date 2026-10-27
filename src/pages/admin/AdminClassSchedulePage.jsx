import { useMemo, useState } from "react";
import AdminSidebar, { AdminIcon } from "../../components/AdminSidebar";

const DAY_NAMES = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
const TIME_SLOTS = ["07:00", "10:00", "13:00", "16:00", "19:00"];
const STUDIO_OPTIONS = ["Semua Studio", "Studio A", "Studio B", "Main Gym"];
const TRAINER_OPTIONS = ["Coach Maya", "Coach Alex", "Coach Nina", "Coach Rizky", "Coach Sari"];
const STORAGE_KEY = "bugarhub_admin_demo_classes_v1";

// Jadwal berulang ini adalah data contoh untuk meniru kalender pada desain Figma.
const RECURRING_CLASSES = [
  { id: "w1", day: 0, slot: "07:00", time: "07:00–08:00", title: "Morning Yoga", studio: "Studio A", trainer: "Coach Maya", joined: 12, capacity: 15 },
  { id: "w2", day: 0, slot: "10:00", time: "10:00–11:00", title: "Pilates Core", studio: "Studio B", trainer: "Coach Nina", joined: 9, capacity: 12 },
  { id: "w3", day: 0, slot: "16:00", time: "17:00–18:00", title: "HIIT Burn", studio: "Main Gym", trainer: "Coach Alex", joined: 20, capacity: 20 },
  { id: "w4", day: 0, slot: "19:00", time: "19:00–20:00", title: "Evening Yoga", studio: "Studio A", trainer: "Coach Maya", joined: 11, capacity: 15 },
  { id: "w5", day: 1, slot: "07:00", time: "08:00–09:00", title: "HIIT Burn", studio: "Main Gym", trainer: "Coach Alex", joined: 18, capacity: 20 },
  { id: "w6", day: 1, slot: "10:00", time: "10:00–11:00", title: "Strength 101", studio: "Main Gym", trainer: "Coach Rizky", joined: 11, capacity: 15 },
  { id: "w7", day: 1, slot: "16:00", time: "17:00–18:00", title: "Zumba Party", studio: "Studio B", trainer: "Coach Sari", joined: 16, capacity: 20 },
  { id: "w8", day: 2, slot: "07:00", time: "07:00–08:00", title: "Morning Yoga", studio: "Studio A", trainer: "Coach Maya", joined: 15, capacity: 15 },
  { id: "w9", day: 2, slot: "13:00", time: "14:00–15:00", title: "Mobility Reset", studio: "Studio A", trainer: "Coach Maya", joined: 8, capacity: 15 },
  { id: "w10", day: 2, slot: "16:00", time: "17:00–18:00", title: "Strength 101", studio: "Main Gym", trainer: "Coach Rizky", joined: 13, capacity: 15 },
  { id: "w11", day: 2, slot: "19:00", time: "19:00–20:00", title: "HIIT Burn", studio: "Main Gym", trainer: "Coach Alex", joined: 16, capacity: 20 },
  { id: "w12", day: 3, slot: "07:00", time: "08:00–09:00", title: "HIIT Burn", studio: "Main Gym", trainer: "Coach Alex", joined: 18, capacity: 20 },
  { id: "w13", day: 3, slot: "10:00", time: "10:00–11:00", title: "Pilates Core", studio: "Studio B", trainer: "Coach Nina", joined: 12, capacity: 12 },
  { id: "w14", day: 3, slot: "16:00", time: "17:00–18:00", title: "Zumba Party", studio: "Studio B", trainer: "Coach Sari", joined: 20, capacity: 20 },
  { id: "w15", day: 3, slot: "19:00", time: "19:00–20:00", title: "Evening Yoga", studio: "Studio A", trainer: "Coach Maya", joined: 9, capacity: 15 },
  { id: "w16", day: 4, slot: "07:00", time: "07:00–08:00", title: "Morning Yoga", studio: "Studio A", trainer: "Coach Maya", joined: 10, capacity: 15 },
  { id: "w17", day: 4, slot: "13:00", time: "14:00–15:00", title: "Pilates Core", studio: "Studio B", trainer: "Coach Nina", joined: 7, capacity: 12 },
  { id: "w18", day: 4, slot: "16:00", time: "17:00–18:00", title: "HIIT Burn", studio: "Main Gym", trainer: "Coach Alex", joined: 17, capacity: 20 },
  { id: "w19", day: 4, slot: "19:00", time: "19:00–20:00", title: "Dance Fit", studio: "Studio B", trainer: "Coach Sari", joined: 14, capacity: 20 },
  { id: "w20", day: 5, slot: "07:00", time: "08:00–09:00", title: "Yoga Flow", studio: "Studio A", trainer: "Coach Maya", joined: 13, capacity: 15 },
  { id: "w21", day: 5, slot: "10:00", time: "10:00–11:00", title: "HIIT Burn", studio: "Main Gym", trainer: "Coach Alex", joined: 20, capacity: 20 },
  { id: "w22", day: 5, slot: "13:00", time: "14:00–15:00", title: "Strength 101", studio: "Main Gym", trainer: "Coach Rizky", joined: 12, capacity: 15 },
  { id: "w23", day: 5, slot: "16:00", time: "16:00–17:00", title: "Weekend Burn", studio: "Main Gym", trainer: "Coach Alex", joined: 15, capacity: 20 },
  { id: "w24", day: 6, slot: "07:00", time: "09:00–10:00", title: "Stretch & Flow", studio: "Studio A", trainer: "Coach Maya", joined: 8, capacity: 15 },
  { id: "w25", day: 6, slot: "10:00", time: "10:00–11:00", title: "Body Balance", studio: "Studio B", trainer: "Coach Nina", joined: 10, capacity: 12 },
];

function toISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function fromISODate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date, amount) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  return copy;
}

function getMonday(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  const day = (copy.getDay() + 6) % 7;
  copy.setDate(copy.getDate() - day);
  return copy;
}

function dateRangeLabel(start) {
  const end = addDays(start, 6);
  const sameMonth = start.getMonth() === end.getMonth();
  const startText = start.toLocaleDateString("id-ID", { day: "numeric", month: sameMonth ? undefined : "long" });
  const endText = end.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  return `${startText} – ${endText}`;
}

function readExtraClasses() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value ? JSON.parse(value) : [];
  } catch {
    return [];
  }
}

function getStatus(item) {
  return item.joined >= item.capacity ? "Penuh" : "Terjadwal";
}

function ClassModal({ onClose, onSave, defaultDate }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(toISODate(defaultDate));
  const [startTime, setStartTime] = useState("07:00");
  const [duration, setDuration] = useState("60");
  const [studio, setStudio] = useState("Studio A");
  const [trainer, setTrainer] = useState("Coach Maya");
  const [capacity, setCapacity] = useState("15");
  const [error, setError] = useState("");

  function submit(event) {
    event.preventDefault();
    if (!title.trim() || !date || !startTime || !duration || !studio || !trainer || Number(capacity) < 1) {
      setError("Lengkapi semua informasi kelas dengan benar.");
      return;
    }
    const [hours, minutes] = startTime.split(":").map(Number);
    const endMinutes = hours * 60 + minutes + Number(duration);
    const endTime = `${String(Math.floor((endMinutes % (24 * 60)) / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`;
    onSave({
      id: `added-${Date.now()}`,
      title: title.trim(),
      date,
      slot: TIME_SLOTS.reduce((closest, slot) => Math.abs(Number(slot.slice(0, 2)) - hours) < Math.abs(Number(closest.slice(0, 2)) - hours) ? slot : closest, TIME_SLOTS[0]),
      time: `${startTime}–${endTime}`,
      studio,
      trainer,
      joined: 0,
      capacity: Number(capacity),
      duration: Number(duration),
      added: true,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#182334]/45 p-4 backdrop-blur-[2px]" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="class-modal-title" className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-[#e3e8ef] bg-white p-5 shadow-2xl sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#ff6b00]">Manajemen kelas</p>
            <h2 id="class-modal-title" className="mt-1 text-xl font-extrabold text-[#263346]">Tambah Kelas Baru</h2>
            <p className="mt-1 text-sm text-[#7b899e]">Tambahkan jadwal ke kalender demo Admin.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup dialog" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e3e8ef] text-[#7b899e] hover:bg-[#f8fafc]">×</button>
        </div>
        <form onSubmit={submit} className="mt-5 space-y-4">
          <label className="block text-sm font-semibold text-[#344155]">Nama kelas
            <input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Contoh: Morning Yoga" className="mt-1.5 h-11 w-full rounded-lg border border-[#dfe5ed] px-3 text-sm outline-none focus:border-[#ff6b00] focus:ring-4 focus:ring-[#ff6b00]/10" />
          </label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-[#344155]">Tanggal
              <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-[#dfe5ed] px-3 text-sm outline-none focus:border-[#ff6b00]" />
            </label>
            <label className="block text-sm font-semibold text-[#344155]">Waktu mulai
              <input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-[#dfe5ed] px-3 text-sm outline-none focus:border-[#ff6b00]" />
            </label>
            <label className="block text-sm font-semibold text-[#344155]">Durasi
              <select value={duration} onChange={(event) => setDuration(event.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-[#dfe5ed] bg-white px-3 text-sm outline-none focus:border-[#ff6b00]">
                <option value="30">30 menit</option><option value="45">45 menit</option><option value="60">60 menit</option><option value="90">90 menit</option>
              </select>
            </label>
            <label className="block text-sm font-semibold text-[#344155]">Kapasitas
              <input type="number" min="1" max="100" value={capacity} onChange={(event) => setCapacity(event.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-[#dfe5ed] px-3 text-sm outline-none focus:border-[#ff6b00]" />
            </label>
            <label className="block text-sm font-semibold text-[#344155]">Studio
              <select value={studio} onChange={(event) => setStudio(event.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-[#dfe5ed] bg-white px-3 text-sm outline-none focus:border-[#ff6b00]">
                <option>Studio A</option><option>Studio B</option><option>Main Gym</option>
              </select>
            </label>
            <label className="block text-sm font-semibold text-[#344155]">Trainer
              <select value={trainer} onChange={(event) => setTrainer(event.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-[#dfe5ed] bg-white px-3 text-sm outline-none focus:border-[#ff6b00]">
                {TRAINER_OPTIONS.map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>
          </div>
          {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <div className="flex justify-end gap-2 border-t border-[#edf0f4] pt-4">
            <button type="button" onClick={onClose} className="min-h-10 rounded-lg border border-[#dfe5ed] px-4 text-sm font-semibold text-[#526177] hover:bg-[#f8fafc]">Batal</button>
            <button type="submit" className="min-h-10 rounded-lg bg-[#ff6b00] px-4 text-sm font-bold text-white transition hover:bg-[#ed6200]">Tambah Kelas Demo</button>
          </div>
        </form>
      </section>
    </div>
  );
}

function ClassCard({ item }) {
  const full = getStatus(item) === "Penuh";
  return (
    <article className={`min-h-[132px] rounded-lg border p-2 text-[11px] leading-4 ${full ? "border-[#ffd4b3] bg-[#fff4eb]" : "border-[#e2e7ee] bg-white"}`}>
      <p className={`font-semibold ${full ? "text-[#e85f00]" : "text-[#8090a6]"}`}>{item.time}</p>
      <h3 className="mt-1 line-clamp-2 text-xs font-extrabold leading-4 text-[#263346]">{item.title}</h3>
      <p className="mt-1 text-[#7b899e]">{item.studio}</p>
      <p className="text-[#7b899e]">{item.trainer}</p>
      <p className="mt-1 font-semibold text-[#344155]">{item.joined}/{item.capacity} Joined</p>
      <span className={`mt-1 inline-flex rounded px-2 py-0.5 text-[10px] font-bold ${full ? "bg-[#ffe4d1] text-[#d85c00]" : "bg-[#e7f7ef] text-emerald-700"}`}>{full ? "Penuh" : "Terjadwal"}</span>
    </article>
  );
}

function WeeklyCalendar({ weekStart, selectedDate, onSelectDate, classes, studioFilter }) {
  const days = DAY_NAMES.map((name, index) => ({ name, date: addDays(weekStart, index) }));
  const filtered = classes.filter((item) => studioFilter === "Semua Studio" || item.studio === studioFilter);

  return (
    <div className="overflow-x-auto rounded-xl border border-[#e3e8ef] bg-white">
      <div className="min-w-[1120px]">
        <div className="grid border-b border-[#e3e8ef]" style={{ gridTemplateColumns: "50px repeat(7,minmax(0,1fr))" }}>
          <div className="flex items-center justify-center border-r border-[#e3e8ef] px-1 py-3 text-[10px] text-[#8997aa]">WIB</div>
          {days.map(({ name, date }) => {
            const iso = toISODate(date);
            const active = iso === selectedDate;
            return <button key={iso} type="button" onClick={() => onSelectDate(iso)} className={`border-r border-[#e3e8ef] px-1 py-3 text-center last:border-r-0 ${active ? "bg-[#fff0e5]" : "hover:bg-[#f8fafc]"}`}>
              <span className={`block text-xs ${active ? "font-semibold text-[#e85f00]" : "text-[#7b899e]"}`}>{name}</span>
              <span className={`mt-1 block text-base font-semibold ${active ? "text-[#e85f00]" : "text-[#263346]"}`}>{date.getDate()}</span>
            </button>;
          })}
        </div>
        {TIME_SLOTS.map((slot) => (
          <div key={slot} className="grid border-b border-[#e8ecf2] last:border-b-0" style={{ gridTemplateColumns: "50px repeat(7,minmax(0,1fr))" }}>
            <div className="border-r border-[#e3e8ef] px-1 pt-3 text-center text-[10px] text-[#8997aa]">{slot}</div>
            {days.map(({ date }) => {
              const iso = toISODate(date);
              const dayIndex = (date.getDay() + 6) % 7;
              const items = filtered.filter((item) => item.date ? item.date === iso && item.slot === slot : item.day === dayIndex && item.slot === slot);
              return <div key={`${iso}-${slot}`} className={`min-h-[142px] border-r border-[#e3e8ef] p-1 last:border-r-0 ${iso === selectedDate ? "bg-[#fffaf6]" : "bg-[#fcfdff]"}`}>
                <div className="flex flex-col gap-1.5">{items.map((item) => <ClassCard key={item.id} item={item} />)}</div>
              </div>;
            })}
          </div>
        ))}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-[11px] text-[#8391a5]">
          <div className="flex items-center gap-4"><span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-600"/> Terjadwal</span><span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#ff6b00]"/> Penuh</span></div>
          <span>{filtered.length} kelas · Semua waktu dalam WIB</span>
        </div>
      </div>
    </div>
  );
}

function MonthlyCalendar({ weekStart, classes, studioFilter, onSelectDate }) {
  const monthFirst = new Date(weekStart.getFullYear(), weekStart.getMonth(), 1);
  const monthLast = new Date(weekStart.getFullYear(), weekStart.getMonth() + 1, 0);
  const leading = (monthFirst.getDay() + 6) % 7;
  const days = Array.from({ length: leading + monthLast.getDate() }, (_, index) => index < leading ? null : new Date(weekStart.getFullYear(), weekStart.getMonth(), index - leading + 1));
  while (days.length % 7 !== 0) days.push(null);
  const filtered = classes.filter((item) => studioFilter === "Semua Studio" || item.studio === studioFilter);
  return (
    <div className="overflow-x-auto rounded-xl border border-[#e3e8ef] bg-white p-3 sm:p-4">
      <div className="min-w-[720px]">
        <div className="grid grid-cols-7 border-b border-[#e3e8ef] pb-2 text-center text-xs font-semibold text-[#7b899e]">{DAY_NAMES.map((day) => <div key={day} className="py-2">{day}</div>)}</div>
        <div className="grid grid-cols-7">{days.map((date, index) => {
          if (!date) return <div key={`empty-${index}`} className="min-h-[110px] border-b border-r border-[#edf0f4] bg-[#fcfdff]"/>;
          const iso = toISODate(date);
          const dayIndex = (date.getDay() + 6) % 7;
          const dayClasses = filtered.filter((item) => item.date ? item.date === iso : item.day === dayIndex);
          return <button key={iso} type="button" onClick={() => onSelectDate(iso)} className="min-h-[110px] border-b border-r border-[#edf0f4] p-2 text-left transition hover:bg-[#fffaf6]">
            <span className="text-xs font-semibold text-[#344155]">{date.getDate()}</span>
            <span className="mt-2 block text-[10px] text-[#7b899e]">{dayClasses.length} kelas</span>
            {dayClasses.slice(0, 2).map((item) => <span key={item.id} className={`mt-1 block truncate rounded px-1.5 py-1 text-[10px] ${getStatus(item) === "Penuh" ? "bg-[#fff0e5] text-[#d85c00]" : "bg-[#e7f7ef] text-emerald-700"}`}>{item.title}</span>)}
          </button>;
        })}</div>
      </div>
    </div>
  );
}

function AdminClassSchedulePage() {
  const [weekStart, setWeekStart] = useState(() => new Date(2026, 9, 12));
  const [selectedDate, setSelectedDate] = useState("2026-10-12");
  const [studioFilter, setStudioFilter] = useState("Semua Studio");
  const [viewMode, setViewMode] = useState("Minggu");
  const [showModal, setShowModal] = useState(false);
  const [notice, setNotice] = useState("");
  const [extraClasses, setExtraClasses] = useState(readExtraClasses);

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)), [weekStart]);
  const classList = useMemo(() => [
    ...RECURRING_CLASSES,
    ...extraClasses.map((item) => ({ ...item, day: (fromISODate(item.date).getDay() + 6) % 7 })),
  ], [extraClasses]);
  const displayedClasses = useMemo(() => classList.filter((item) => {
    if (studioFilter !== "Semua Studio" && item.studio !== studioFilter) return false;
    if (item.date) return weekDays.some((date) => toISODate(date) === item.date);
    return true;
  }), [classList, studioFilter, weekDays]);
  const totalJoined = displayedClasses.reduce((sum, item) => sum + item.joined, 0);
  const totalCapacity = displayedClasses.reduce((sum, item) => sum + item.capacity, 0);
  const fillRate = totalCapacity ? Math.round((totalJoined / totalCapacity) * 100) : 0;
  const fullCount = displayedClasses.filter((item) => getStatus(item) === "Penuh").length;

  function moveWeek(amount) {
    setWeekStart((current) => addDays(current, amount * 7));
    setSelectedDate((current) => toISODate(addDays(fromISODate(current), amount * 7)));
  }

  function goToToday() {
    const today = new Date();
    setWeekStart(getMonday(today));
    setSelectedDate(toISODate(today));
  }

  function saveClass(item) {
    const updated = [...extraClasses, item];
    setExtraClasses(updated);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch { /* The page still works for this session if storage is blocked. */ }
    const newWeekStart = getMonday(fromISODate(item.date));
    setWeekStart(newWeekStart);
    setSelectedDate(item.date);
    setViewMode("Minggu");
    setShowModal(false);
    setNotice(`Kelas “${item.title}” ditambahkan ke kalender demo. Data belum tersimpan ke backend.`);
  }

  const monthlyLabel = weekStart.toLocaleDateString("id-ID", { month: "long", year: "numeric" });

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#263346] md:flex">
      <AdminSidebar />
      <div className="min-w-0 flex-1">
        <header className="flex h-[70px] items-center border-b border-[#e5e9ef] bg-white px-5 sm:px-8 lg:px-10">
          <div className="flex items-center gap-3 text-sm"><span className="text-[#8a97aa]">Workspace</span><AdminIcon name="chevron" className="h-4 w-4 text-[#9aa5b4]"/><span className="font-semibold text-[#263346]">Jadwal Kelas</span></div>
        </header>

        <div className="mx-auto max-w-[1880px] px-4 pb-8 pt-6 sm:px-6 lg:px-7 lg:pt-7">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div><h1 className="text-2xl font-extrabold tracking-tight text-[#263346] sm:text-[30px]">Penjadwalan Kelas Mingguan</h1><p className="mt-2 text-sm text-[#7b899e]">Kelola jadwal, trainer, dan kapasitas kelas dalam satu tempat.</p></div>
            <button type="button" onClick={() => { setNotice(""); setShowModal(true); }} className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-lg bg-[#ff6b00] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#ed6200] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#ff6b00]/20 sm:self-auto"><span className="text-lg leading-none">+</span> Tambah Kelas Baru</button>
          </div>

          <div className="grid grid-cols-1 items-start gap-5 2xl:grid-cols-[minmax(0,1fr)_300px]">
            <section className="min-w-0">
              <div className="mb-3 flex flex-col gap-3 rounded-xl border border-[#e3e8ef] bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => moveWeek(-1)} aria-label="Minggu sebelumnya" className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e0e6ee] text-[#66758a] transition hover:border-[#ff6b00] hover:text-[#e85f00]">‹</button>
                  <span className="min-w-[175px] text-sm font-semibold text-[#344155]">{viewMode === "Minggu" ? dateRangeLabel(weekStart) : monthlyLabel}</span>
                  <button type="button" onClick={() => moveWeek(1)} aria-label="Minggu berikutnya" className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e0e6ee] text-[#66758a] transition hover:border-[#ff6b00] hover:text-[#e85f00]">›</button>
                  <button type="button" onClick={goToToday} className="h-9 rounded-lg border border-[#e0e6ee] px-3 text-sm font-semibold text-[#344155] transition hover:border-[#ff6b00] hover:text-[#e85f00]">Hari ini</button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="flex h-9 items-center gap-2 rounded-lg border border-[#e0e6ee] bg-white px-3 text-sm text-[#344155]"><AdminIcon name="activity" className="h-4 w-4 text-[#7b899e]"/><select aria-label="Filter studio" value={studioFilter} onChange={(event) => setStudioFilter(event.target.value)} className="max-w-[145px] bg-transparent text-sm font-semibold outline-none">{STUDIO_OPTIONS.map((option) => <option key={option}>{option}</option>)}</select></label>
                  <div className="inline-flex rounded-lg bg-[#f2f5f8] p-1"><button type="button" onClick={() => setViewMode("Minggu")} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${viewMode === "Minggu" ? "bg-white text-[#263346] shadow-sm" : "text-[#7b899e]"}`}>Minggu</button><button type="button" onClick={() => setViewMode("Bulan")} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${viewMode === "Bulan" ? "bg-white text-[#263346] shadow-sm" : "text-[#7b899e]"}`}>Bulan</button></div>
                </div>
              </div>
              {notice && <div role="status" className="mb-3 flex items-start justify-between gap-3 rounded-lg border border-[#b7efd1] bg-[#effbf5] px-4 py-3 text-sm text-emerald-800"><span>{notice}</span><button type="button" onClick={() => setNotice("")} aria-label="Tutup pemberitahuan">×</button></div>}
              {viewMode === "Minggu" ? (
                <WeeklyCalendar weekStart={weekStart} selectedDate={selectedDate} onSelectDate={setSelectedDate} classes={classList.filter((item) => !item.date || weekDays.some((date) => toISODate(date) === item.date))} studioFilter={studioFilter}/>
              ) : (
                <MonthlyCalendar weekStart={weekStart} classes={classList} studioFilter={studioFilter} onSelectDate={(date) => { setSelectedDate(date); setWeekStart(getMonday(fromISODate(date))); setViewMode("Minggu"); }}/>
              )}
            </section>

            <aside className="space-y-4">
              <div className="flex items-center justify-between"><h2 className="text-sm font-semibold text-[#344155]">Ringkasan Minggu Ini</h2><button type="button" className="rounded-md px-2 py-1 text-lg leading-none text-[#94a0b1] hover:bg-white" aria-label="Opsi ringkasan" title="Ringkasan data demo">···</button></div>
              <article className="rounded-xl border border-[#e3e8ef] bg-white p-5"><div className="flex items-center justify-between text-sm text-[#7b899e]"><span>Total Member Aktif</span><AdminIcon name="users" className="h-5 w-5"/></div><div className="mt-3 flex items-center gap-2"><p className="text-3xl font-extrabold tracking-tight text-[#263346]">1.248</p><span className="rounded-md bg-[#e7f7ef] px-2 py-1 text-[11px] font-bold text-emerald-700">↗ 8,2%</span></div><p className="mt-2 text-xs text-[#8b99ac]">+94 member dari bulan lalu</p></article>
              <article className="rounded-xl border border-[#e3e8ef] bg-white p-5"><div className="flex items-center justify-between text-sm text-[#7b899e]"><span>Kelas Minggu Ini</span><AdminIcon name="calendar" className="h-5 w-5"/></div><div className="mt-3 flex items-center gap-2"><p className="text-3xl font-extrabold tracking-tight text-[#263346]">{displayedClasses.length}</p><span className="rounded-md bg-[#e7f7ef] px-2 py-1 text-[11px] font-bold text-emerald-700">+4 kelas</span></div><p className="mt-2 text-xs text-[#8b99ac]">{fullCount} kelas penuh · {Math.max(0, displayedClasses.length - fullCount)} masih tersedia</p></article>
              <article className="rounded-xl border border-[#e3e8ef] bg-white p-5"><div className="flex items-center justify-between gap-2 text-sm text-[#7b899e]"><span>Keterisian kelas</span><strong className="text-[#344155]">{fillRate}%</strong></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-[#edf1f5]"><div className="h-full rounded-full bg-[#ff6b00] transition-all" style={{ width: `${fillRate}%` }}/></div><p className="mt-3 text-xs text-[#8b99ac]">{totalJoined} dari {totalCapacity} spot telah terisi.</p></article>
            </aside>
          </div>

          <footer className="flex flex-col gap-2 pt-6 text-[11px] text-[#a2adbc] sm:flex-row sm:items-center sm:justify-between"><span>© 2026 BugarHub • Admin workspace</span><span>Data demo · Semua waktu dalam WIB</span></footer>
          <p className="mt-2 rounded-lg border border-[#f5d4b6] bg-[#fff8f1] px-3 py-2 text-xs leading-5 text-[#9b5a22]">Catatan: kalender, kapasitas, peserta, dan ringkasan adalah data demo untuk pratinjau antarmuka. Kelas tambahan disimpan secara lokal di browser ini dan belum tersinkron ke backend.</p>
        </div>
      </div>
      {showModal && <ClassModal defaultDate={fromISODate(selectedDate)} onClose={() => setShowModal(false)} onSave={saveClass}/>}
    </main>
  );
}

export default AdminClassSchedulePage;
