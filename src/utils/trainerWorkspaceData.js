export const TRAINER_SESSIONS_KEY = "bugarhub_trainer_sessions_v2";
export const TRAINER_AVAILABILITY_KEY = "bugarhub_trainer_availability_v2";
export const TRAINER_SESSIONS_UPDATED_EVENT = "bugarhub-trainer-sessions-updated";
export const TRAINER_AVAILABILITY_UPDATED_EVENT = "bugarhub-trainer-availability-updated";

export function toISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseISODate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(date, amount) {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

export function getMonday(date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  result.setDate(result.getDate() - ((result.getDay() + 6) % 7));
  return result;
}

export function formatDate(value, options = { day: "numeric", month: "short" }) {
  if (!value) return "—";
  return parseISODate(value).toLocaleDateString("id-ID", options);
}

function makeSeedSessions() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return [
    { id: "PT-2026-041", member: "Ayu Lestari", type: "Personal Training", date: toISODate(addDays(today, 0)), startTime: "09:00", endTime: "10:00", status: "confirmed", note: "" },
    { id: "PT-2026-042", member: "Made Aditya", type: "Strength Training", date: toISODate(addDays(today, 0)), startTime: "13:00", endTime: "14:00", status: "cancellation_requested", note: "Ada keperluan mendadak", requestedBy: "member" },
    { id: "PT-2026-043", member: "Dewi Anggraini", type: "Personal Training", date: toISODate(addDays(today, 1)), startTime: "10:00", endTime: "11:00", status: "requested", note: "Fokus latihan upper body" },
    { id: "PT-2026-044", member: "Komang Putra", type: "Strength Training", date: toISODate(addDays(today, 2)), startTime: "15:00", endTime: "16:00", status: "confirmed", note: "" },
    { id: "PT-2026-045", member: "Ni Luh Sari", type: "Personal Training", date: toISODate(addDays(today, -1)), startTime: "09:00", endTime: "10:00", status: "completed", note: "Sesi selesai" },
    { id: "PT-2026-046", member: "Dewa Pratama", type: "Personal Training", date: toISODate(addDays(today, 4)), startTime: "11:00", endTime: "12:00", status: "confirmed", note: "" },
  ];
}

function makeSeedAvailability() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return [
    { id: "AV-001", date: toISODate(addDays(today, 0)), title: "Personal Training", startTime: "08:00", endTime: "11:00", note: "Sesi personal" },
    { id: "AV-002", date: toISODate(addDays(today, 0)), title: "Strength Training", startTime: "13:00", endTime: "15:00", note: "Latihan kekuatan" },
    { id: "AV-003", date: toISODate(addDays(today, 1)), title: "Personal Training", startTime: "09:00", endTime: "12:00", note: "" },
    { id: "AV-004", date: toISODate(addDays(today, 2)), title: "Strength Training", startTime: "08:00", endTime: "11:00", note: "" },
    { id: "AV-005", date: toISODate(addDays(today, 3)), title: "Personal Training", startTime: "13:00", endTime: "16:00", note: "" },
    { id: "AV-006", date: toISODate(addDays(today, 5)), title: "Personal Training", startTime: "09:00", endTime: "12:00", note: "" },
  ];
}

function readCollection(key, seedFactory) {
  if (typeof window === "undefined") return seedFactory();
  try {
    const stored = window.localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
    const seed = seedFactory();
    window.localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  } catch {
    return seedFactory();
  }
}

function writeCollection(key, items) {
  if (typeof window !== "undefined") {
    try { window.localStorage.setItem(key, JSON.stringify(items)); } catch { /* Storage may be unavailable. */ }
  }
}

function normalizeTrainerId(value) {
  const id = String(value || "trainer-001");
  return id === "trainer-demo-001" ? "trainer-001" : id;
}

export function getTrainerSessions() {
  // Older schedule records did not identify their owner. Map those existing
  // records to the primary trainer account so the current workspace remains usable.
  return readCollection(TRAINER_SESSIONS_KEY, makeSeedSessions).map((item) => ({
    ...item,
    // Backward compatibility: new PT bookings are confirmed immediately.
    // Migrate older pending booking records to the same first-come-first-served rule.
    status: item.status === "requested" ? "confirmed" : item.status,
    previousStatusBeforeCancellation: item.previousStatusBeforeCancellation === "requested"
      ? "confirmed"
      : item.previousStatusBeforeCancellation,
    trainerId: normalizeTrainerId(item.trainerId),
    trainerName: item.trainerName || "Rizky Pratama",
  }));
}

export function saveTrainerSessions(items) {
  writeCollection(TRAINER_SESSIONS_KEY, items);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(TRAINER_SESSIONS_UPDATED_EVENT, { detail: items }));
  }
}

export function getTrainerAvailability() {
  return readCollection(TRAINER_AVAILABILITY_KEY, makeSeedAvailability).map((item) => ({
    ...item,
    trainerId: normalizeTrainerId(item.trainerId),
    trainerName: item.trainerName || "Rizky Pratama",
  }));
}

export function saveTrainerAvailability(items) {
  writeCollection(TRAINER_AVAILABILITY_KEY, items);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(TRAINER_AVAILABILITY_UPDATED_EVENT, { detail: items }));
  }
}

export function formatTimeRange(start, end) {
  return `${start}–${end}`;
}

export function sessionStatusLabel(status) {
  const labels = {
    confirmed: "Dikonfirmasi",
    requested: "Permintaan sesi",
    cancellation_requested: "Menunggu persetujuan",
    cancelled: "Dibatalkan",
    completed: "Selesai",
    declined: "Ditolak",
  };
  return labels[status] || status;
}

export const TRAINER_FEEDBACK = [
  { id: "FB-01", member: "Ayu Lestari", activity: "Personal Training", rating: 5, dateLabel: "Kemarin", comment: "Latihannya terarah dan penjelasan gerakannya mudah dipahami. Terima kasih, Coach!" },
  { id: "FB-02", member: "Made Aditya", activity: "Strength Training", rating: 5, dateLabel: "2 hari lalu", comment: "Programnya menantang tetapi tetap disesuaikan dengan kemampuan saya." },
  { id: "FB-03", member: "Ni Luh Sari", activity: "Personal Training", rating: 4, dateLabel: "Minggu ini", comment: "Sesi berjalan baik. Saya suka evaluasi di akhir latihan." },
];
