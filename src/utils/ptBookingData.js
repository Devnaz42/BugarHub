import { getDemoMemberKey } from "./demoData";
import {
  getTrainerSessions,
  saveTrainerSessions,
} from "./trainerWorkspaceData";

export const MEMBER_PT_ENTITLEMENTS_KEY = "bugarhub_member_pt_entitlements_v1";
export const MEMBER_PT_ENTITLEMENT_UPDATED_EVENT = "bugarhub-member-pt-entitlement-updated";
const ACTIVE_BOOKING_STATUSES = new Set(["requested", "confirmed", "cancellation_requested"]);
const REFUNDABLE_END_STATUSES = new Set(["cancelled", "declined"]);

export function getTrainerAccountId(trainer) {
  const raw = String(trainer?.accountId || trainer?.id || trainer?.username || trainer?.email || "trainer-001");
  return raw === "trainer-demo-001" ? "trainer-001" : raw;
}

function readEntitlementMap() {
  try {
    const value = JSON.parse(window.localStorage.getItem(MEMBER_PT_ENTITLEMENTS_KEY) || "{}");
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}

function writeEntitlementMap(value) {
  try {
    window.localStorage.setItem(MEMBER_PT_ENTITLEMENTS_KEY, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(MEMBER_PT_ENTITLEMENT_UPDATED_EVENT, { detail: value }));
    return true;
  } catch {
    return false;
  }
}

function normalizeEntitlement(value) {
  return {
    membershipStatus: value?.membershipStatus === "active" ? "active" : "inactive",
    ptCredits: Math.max(0, Number.parseInt(value?.ptCredits, 10) || 0),
    updatedAt: value?.updatedAt || new Date().toISOString(),
  };
}

function defaultEntitlement(member) {
  const explicitStatus = String(member?.membershipStatus || "").toLowerCase();
  const membershipStatus = explicitStatus
    ? (explicitStatus === "active" ? "active" : "inactive")
    : (member?.isMember === false ? "inactive" : "active");
  const credits = Number.isFinite(Number(member?.ptCredits)) ? Math.max(0, Number(member.ptCredits)) : 2;
  return {
    membershipStatus,
    ptCredits: credits,
    updatedAt: new Date().toISOString(),
  };
}

export function getMemberPTEntitlement(member) {
  const memberKey = getDemoMemberKey(member);
  const all = readEntitlementMap();
  if (all[memberKey]) return normalizeEntitlement(all[memberKey]);
  const seeded = defaultEntitlement(member);
  all[memberKey] = seeded;
  writeEntitlementMap(all);
  return seeded;
}

export function saveMemberPTEntitlement(memberKey, changes) {
  if (!memberKey) return null;
  const all = readEntitlementMap();
  const current = normalizeEntitlement(all[memberKey] || { membershipStatus: "active", ptCredits: 2 });
  const next = normalizeEntitlement({ ...current, ...changes, updatedAt: new Date().toISOString() });
  all[memberKey] = next;
  return writeEntitlementMap(all) ? next : null;
}

function timeToMinutes(value) {
  const [hours, minutes] = String(value || "0:0").split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(value) {
  return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
}

function localTodayISO() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function slotOverlapsSession(slot, sessions) {
  return sessions.some((session) => {
    if (String(session.trainerId) !== String(slot.trainerId)) return false;
    if (session.date !== slot.date || !ACTIVE_BOOKING_STATUSES.has(session.status)) return false;
    return timeToMinutes(slot.startTime) < timeToMinutes(session.endTime)
      && timeToMinutes(slot.endTime) > timeToMinutes(session.startTime);
  });
}

/**
 * Build fixed one-hour booking slots from 08:00 through 22:00 for the next 31 days.
 * A slot is only offered when it does not overlap an active booking for that trainer.
 * Trainer availability blocks are intentionally not used here: the workspace calendar
 * now represents actual booked sessions, rather than manually-created availability.
 */
export function getBookablePTSlots(trainerId) {
  const today = localTodayISO();
  const current = new Date();
  const nowMinutes = current.getHours() * 60 + current.getMinutes();
  const rawTrainerId = trainerId ? String(trainerId) : null;
  const requestedTrainerId = rawTrainerId === "trainer-demo-001" ? "trainer-001" : rawTrainerId;
  const trainerProfiles = requestedTrainerId
    ? [{ id: requestedTrainerId, name: requestedTrainerId === "trainer-account-002" ? "Coach Sarah" : "Coach Rizky" }]
    : [
        { id: "trainer-001", name: "Coach Rizky" },
        { id: "trainer-account-002", name: "Coach Sarah" },
      ];
  const sessions = getTrainerSessions();
  const slots = [];

  for (const trainerProfile of trainerProfiles) {
    for (let dayOffset = 0; dayOffset <= 30; dayOffset += 1) {
      const day = new Date();
      day.setHours(12, 0, 0, 0);
      day.setDate(day.getDate() + dayOffset);
      const date = localTodayISOFromDate(day);

      for (let hour = 8; hour < 22; hour += 1) {
        const startTime = minutesToTime(hour * 60);
        const endTime = minutesToTime((hour + 1) * 60);
        const slot = {
          key: `${trainerProfile.id}-${date}-${startTime}`,
          trainerId: trainerProfile.id,
          trainerName: trainerProfile.name,
          date,
          startTime,
          endTime,
          type: "Personal Training",
          room: "Area Gym BugarHub",
          note: "",
        };
        if (date === today && timeToMinutes(startTime) <= nowMinutes) continue;
        if (slotOverlapsSession(slot, sessions)) continue;
        slots.push(slot);
      }
    }
  }

  return slots.sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`));
}

function localTodayISOFromDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function createPTBooking({ member, trainer, slot }) {
  const memberKey = getDemoMemberKey(member);
  const trainerId = getTrainerAccountId(trainer);
  const entitlement = getMemberPTEntitlement(member);

  if (entitlement.membershipStatus !== "active") return { ok: false, reason: "membership" };
  if (entitlement.ptCredits < 1) return { ok: false, reason: "credits" };
  if (!memberKey || !trainerId || !slot?.date || !slot?.startTime) return { ok: false, reason: "invalid" };

  // Re-read availability and bookings just before saving, so a stale open modal
  // cannot reserve a time that has already been booked by another session.
  const freshSlot = getBookablePTSlots(trainerId).find((item) => item.key === slot.key);
  if (!freshSlot) return { ok: false, reason: "unavailable" };

  const sessions = getTrainerSessions();
  const existingIds = new Set(sessions.map((item) => String(item.id)));
  let bookingId = `PT-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  while (existingIds.has(bookingId)) {
    bookingId = `PT-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }
  const booking = {
    id: bookingId,
    member: member?.name || "Member BugarHub",
    memberEmail: member?.email || "",
    memberKey,
    trainerId,
    trainerName: trainer?.name || freshSlot.trainerName || "PT/Coach",
    type: freshSlot.type || "Personal Training",
    room: freshSlot.room || "Area Gym BugarHub",
    date: freshSlot.date,
    startTime: freshSlot.startTime,
    endTime: freshSlot.endTime,
    status: "confirmed",
    note: "Booking langsung dikonfirmasi sesuai prinsip siapa cepat dia dapat.",
    requestedBy: "member",
    ptCreditCharged: true,
    ptCreditRefunded: false,
    refundProcessed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  saveTrainerSessions([...sessions, booking]);
  const updatedEntitlement = saveMemberPTEntitlement(memberKey, { ...entitlement, ptCredits: entitlement.ptCredits - 1 });
  if (!updatedEntitlement) {
    // Roll back the pending booking if the credit balance could not be saved.
    saveTrainerSessions(sessions);
    return { ok: false, reason: "storage" };
  }
  return { ok: true, booking, entitlement: updatedEntitlement };
}

export function getPTBookingsForMember(memberKey) {
  return getTrainerSessions()
    .filter((item) => item.memberKey && item.memberKey === memberKey)
    .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`));
}

export function requestPTBookingCancellation({ bookingId, memberKey, reason }) {
  const sessions = getTrainerSessions();
  const booking = sessions.find((item) => item.id === bookingId && item.memberKey === memberKey);
  if (!booking) return { ok: false, reason: "not_found" };
  if (!["requested", "confirmed"].includes(booking.status)) return { ok: false, reason: "invalid_status" };

  const updatedBooking = {
    ...booking,
    previousStatusBeforeCancellation: booking.status,
    status: "cancellation_requested",
    cancellationRequestedBy: "member",
    cancellationReason: String(reason || "").trim(),
    cancellationDecision: "pending",
    cancellationRequestedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  saveTrainerSessions(sessions.map((item) => item.id === bookingId ? updatedBooking : item));
  return { ok: true, booking: updatedBooking };
}

/** Change a PT booking status and apply a one-time credit refund for cancelled/declined paid requests. */
export function transitionPTBooking(bookingId, nextStatus, changes = {}) {
  const sessions = getTrainerSessions();
  const current = sessions.find((item) => item.id === bookingId);
  if (!current) return { ok: false, reason: "not_found", sessions };

  let updated = {
    ...current,
    ...changes,
    status: nextStatus,
    updatedAt: new Date().toISOString(),
  };

  if (nextStatus === "cancelled" && current.status === "cancellation_requested") {
    updated.cancellationDecision = "approved";
    updated.cancellationReviewedAt = new Date().toISOString();
  }
  if (current.status === "cancellation_requested" && nextStatus !== "cancelled") {
    updated.cancellationDecision = "rejected";
    updated.cancellationReviewedAt = new Date().toISOString();
    updated.status = current.previousStatusBeforeCancellation || "confirmed";
  }

  if (REFUNDABLE_END_STATUSES.has(updated.status) && current.ptCreditCharged && !current.refundProcessed && current.memberKey) {
    const entitlementMap = readEntitlementMap();
    const currentEntitlement = normalizeEntitlement(entitlementMap[current.memberKey] || { membershipStatus: "active", ptCredits: 0 });
    const nextEntitlement = { ...currentEntitlement, ptCredits: currentEntitlement.ptCredits + 1, updatedAt: new Date().toISOString() };
    entitlementMap[current.memberKey] = nextEntitlement;
    const saved = writeEntitlementMap(entitlementMap);
    if (saved) {
      updated.ptCreditRefunded = true;
      updated.refundProcessed = true;
      updated.refundProcessedAt = new Date().toISOString();
      updated.refundReason = updated.cancellationReason || (nextStatus === "declined" ? "Permintaan booking ditolak" : "Sesi dibatalkan");
    }
  }

  const nextSessions = sessions.map((item) => item.id === bookingId ? updated : item);
  saveTrainerSessions(nextSessions);
  return { ok: true, booking: updated, sessions: nextSessions };
}
