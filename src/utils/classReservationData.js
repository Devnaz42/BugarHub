import { CLASS_RESERVATIONS_STORAGE_KEY } from "./demoData";
import { readTrainerClasses } from "./trainerClassSchedule";

export const CLASS_RESERVATIONS_UPDATED_EVENT = "bugarhub-class-reservations-updated";

function normalizeTrainerId(value) {
  const id = String(value || "trainer-001");
  return id === "trainer-demo-001" ? "trainer-001" : id;
}

function readRawReservations() {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(CLASS_RESERVATIONS_STORAGE_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function normalizeStatus(value) {
  const status = String(value || "").toLowerCase();
  if (["requested", "pending", "menunggu konfirmasi", "menunggu konfirmasi trainer"].includes(status)) return "confirmed";
  if (["confirmed", "accepted", "dipesan", "reservasi diterima", "disetujui"].includes(status)) return "confirmed";
  if (["declined", "rejected", "ditolak", "permintaan ditolak"].includes(status)) return "declined";
  if (["cancelled", "canceled", "dibatalkan"].includes(status)) return "cancelled";
  if (["completed", "selesai"].includes(status)) return "completed";
  return status || "confirmed";
}

/** Read class reservations and attach trainer details to earlier reservations when possible. */
export function getClassReservations() {
  const classes = readTrainerClasses();
  return readRawReservations().map((reservation) => {
    const matchingClass = classes.find((item) => String(item.id) === String(reservation.classId || ""));
    const isTrainerClass = reservation.reservationType === "trainer_class" || Boolean(matchingClass);
    const oldStatus = reservation.status || "Dipesan";
    return {
      ...reservation,
      reservationType: reservation.reservationType || (isTrainerClass ? "trainer_class" : "legacy_class"),
      status: normalizeStatus(oldStatus),
      trainerId: normalizeTrainerId(reservation.trainerId || matchingClass?.trainerId || "trainer-001"),
      trainerName: reservation.trainerName || matchingClass?.trainerName || "PT/Coach BugarHub",
      className: reservation.className || matchingClass?.title || reservation.title || "Kelas BugarHub",
      category: reservation.category || matchingClass?.category || "Fitness",
      date: reservation.date || reservation.dateISO,
      dateISO: reservation.dateISO || reservation.date,
      startTime: reservation.startTime || reservation.time || matchingClass?.startTime || "09:00",
      endTime: reservation.endTime || matchingClass?.endTime || "10:00",
      room: reservation.room || matchingClass?.room || reservation.studio || "Gym BugarHub",
      capacity: Number(reservation.capacity ?? matchingClass?.capacity ?? 0),
      baseStudents: Number(reservation.baseStudents ?? matchingClass?.students ?? 0),
    };
  });
}

/** Save to the same storage key used by member Schedule and dispatch an in-tab event. */
export function saveClassReservations(reservations) {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(CLASS_RESERVATIONS_STORAGE_KEY, JSON.stringify(reservations));
    window.dispatchEvent(new CustomEvent(CLASS_RESERVATIONS_UPDATED_EVENT, { detail: reservations }));
    return true;
  } catch {
    return false;
  }
}

export function getClassReservationCounts(classId, reservations = getClassReservations()) {
  const relevant = reservations.filter((item) => String(item.classId) === String(classId));
  return {
    requested: relevant.filter((item) => item.status === "requested").length,
    confirmed: relevant.filter((item) => item.status === "confirmed").length,
    declined: relevant.filter((item) => item.status === "declined").length,
    cancelled: relevant.filter((item) => item.status === "cancelled").length,
    completed: relevant.filter((item) => item.status === "completed").length,
  };
}

export function getClassCapacitySnapshot(classItem, reservations = getClassReservations()) {
  const counts = getClassReservationCounts(classItem?.id, reservations);
  const capacity = Math.max(0, Number(classItem?.capacity || 0));
  const baseStudents = Math.max(0, Number(classItem?.students || 0));
  const accepted = baseStudents + counts.confirmed + counts.completed;
  const held = accepted;
  return {
    ...counts,
    capacity,
    baseStudents,
    accepted,
    held,
    remaining: capacity > 0 ? Math.max(0, capacity - accepted) : null,
    isFull: capacity > 0 && accepted >= capacity,
  };
}

export function createClassReservation({ member, memberKey, classItem, dateLabel }) {
  const existing = getClassReservations();
  const duplicate = existing.find((item) =>
    item.memberKey === memberKey
    && String(item.classId) === String(classItem.id)
    && item.dateISO === (classItem.dateISO || classItem.date)
    && ["confirmed", "completed"].includes(item.status)
  );
  if (duplicate) return { ok: false, reason: "duplicate", reservation: duplicate };

  const trainerId = normalizeTrainerId(classItem.trainerId || "trainer-001");
  const isTrainerClass = Boolean(classItem.isTrainerPublished || classItem.trainerId);
  const status = "confirmed";
  const reservation = {
    id: `CLASS-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    reservationType: isTrainerClass ? "trainer_class" : "legacy_class",
    memberKey,
    memberName: member?.name || "Member BugarHub",
    memberEmail: member?.email || "",
    memberAvatar: member?.avatarDataUrl || member?.avatar || member?.photoUrl || "",
    classId: String(classItem.id),
    className: classItem.name || classItem.title || "Kelas BugarHub",
    category: classItem.category || "Fitness",
    trainerId,
    trainerName: classItem.trainerName || "PT/Coach BugarHub",
    dateISO: classItem.dateISO || classItem.date,
    dateLabel: dateLabel || "Tanggal belum tersedia",
    time: classItem.time || classItem.startTime || "09:00",
    startTime: classItem.time || classItem.startTime || "09:00",
    endTime: classItem.endTime || "10:00",
    duration: classItem.duration || "60 min",
    studio: classItem.studio || classItem.room || "Gym BugarHub",
    room: classItem.studio || classItem.room || "Gym BugarHub",
    floor: classItem.floor || (classItem.trainerName ? `Coach ${classItem.trainerName}` : "BugarHub"),
    capacity: Number(classItem.capacity || 0),
    baseStudents: Number(classItem.students || 0),
    status,
    note: "Member langsung terdaftar pada kelas yang dipilih.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const classSource = readTrainerClasses().find((item) => String(item.id) === String(classItem.id)) || classItem;
  const snapshot = getClassCapacitySnapshot(classSource, existing);
  if (snapshot.capacity > 0 && snapshot.accepted >= snapshot.capacity) return { ok: false, reason: "full" };

  const saved = saveClassReservations([...readRawReservations(), reservation]);
  return saved ? { ok: true, reservation } : { ok: false, reason: "storage" };
}

export function transitionClassReservation({ reservationId, trainerId, nextStatus }) {
  if (!['confirmed', 'declined', 'cancelled', 'completed'].includes(nextStatus)) return { ok: false, reason: "invalid_status" };
  const reservations = getClassReservations();
  const current = reservations.find((item) => String(item.id) === String(reservationId));
  if (!current) return { ok: false, reason: "not_found" };
  if (current.reservationType !== "trainer_class") return { ok: false, reason: "invalid_type" };
  if (normalizeTrainerId(current.trainerId) !== normalizeTrainerId(trainerId)) return { ok: false, reason: "not_owner" };
  if (current.status !== "requested" && !(nextStatus === "cancelled" && current.status === "confirmed")) return { ok: false, reason: "invalid_transition" };

  if (nextStatus === "confirmed") {
    const classItem = readTrainerClasses().find((item) => String(item.id) === String(current.classId));
    const capacity = Number(classItem?.capacity ?? current.capacity ?? 0);
    const baseStudents = Number(classItem?.students ?? current.baseStudents ?? 0);
    const accepted = reservations.filter((item) => String(item.classId) === String(current.classId) && item.id !== current.id && ["confirmed", "completed"].includes(item.status)).length;
    if (capacity > 0 && baseStudents + accepted >= capacity) return { ok: false, reason: "full" };
  }

  const updated = {
    ...current,
    status: nextStatus,
    decision: nextStatus === "confirmed" ? "approved" : nextStatus === "declined" ? "rejected" : nextStatus,
    reviewedBy: normalizeTrainerId(trainerId),
    reviewedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    note: nextStatus === "confirmed" ? "Reservasi kelas disetujui PT/Coach." : nextStatus === "declined" ? "Permintaan reservasi kelas ditolak PT/Coach." : current.note,
  };
  const next = reservations.map((item) => String(item.id) === String(reservationId) ? updated : item);
  return saveClassReservations(next) ? { ok: true, reservation: updated, reservations: next } : { ok: false, reason: "storage" };
}
