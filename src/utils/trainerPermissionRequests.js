export const TRAINER_PERMISSION_REQUESTS_KEY = "bugarhub_trainer_permission_requests_v1";
export const TRAINER_PROFILE_OVERRIDES_KEY = "bugarhub_staff_profile_overrides_v1";
export const TRAINER_PROFILE_CHANGE_REQUESTS_KEY = "bugarhub_trainer_profile_change_requests_v1";
export const TRAINER_PERMISSION_EVENT = "bugarhub:trainer-permission-requests-updated";
export const TRAINER_PROFILE_EVENT = "bugarhub:trainer-profile-changes-updated";

function readJSON(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(TRAINER_PERMISSION_EVENT, { detail: { key } }));
    window.dispatchEvent(new CustomEvent(TRAINER_PROFILE_EVENT, { detail: { key } }));
  } catch {
    // Storage may be unavailable in restricted browser contexts.
  }
}

export function getTrainerPermissionRequests() {
  const value = readJSON(TRAINER_PERMISSION_REQUESTS_KEY, []);
  return Array.isArray(value) ? value : [];
}

export function getTrainerProfileOverrides() {
  const value = readJSON(TRAINER_PROFILE_OVERRIDES_KEY, {});
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

export function getTrainerProfileOverride(trainerId) {
  if (!trainerId) return null;
  const profiles = getTrainerProfileOverrides();
  return profiles[String(trainerId)] || null;
}

/** Save an Admin-approved/directly edited trainer profile, keyed by the trainer account ID. */
export function saveTrainerProfileOverride(trainerId, profile) {
  if (!trainerId || !profile || typeof profile !== "object") return null;
  const profiles = getTrainerProfileOverrides();
  const key = String(trainerId);
  const existing = profiles[key] || {};
  const updated = { ...existing, ...profile, id: key, updatedAt: new Date().toISOString() };
  profiles[key] = updated;
  writeJSON(TRAINER_PROFILE_OVERRIDES_KEY, profiles);
  return updated;
}

export function getTrainerProfileChangeRequests() {
  const value = readJSON(TRAINER_PROFILE_CHANGE_REQUESTS_KEY, []);
  return Array.isArray(value) ? value : [];
}

export function requestTrainerProfileChange(trainer, proposedProfile) {
  const trainerId = String(trainer?.id || trainer?.username || trainer?.email || "trainer-demo-001");
  const requests = getTrainerProfileChangeRequests();
  const existingPending = requests.find((item) => item.trainerId === trainerId && item.status === "pending");
  if (existingPending) return { ok: false, reason: "already_pending", request: existingPending };

  const cleanProfile = {
    name: String(proposedProfile?.name || "").trim(),
    email: String(proposedProfile?.email || "").trim(),
    phone: String(proposedProfile?.phone || "").trim(),
    bio: String(proposedProfile?.bio || "").trim(),
    avatar: proposedProfile?.avatar || "",
  };
  if (!cleanProfile.name) return { ok: false, reason: "name_required" };
  if (!cleanProfile.email) return { ok: false, reason: "email_required" };

  const request = {
    id: `TPR-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: "profile_change",
    trainerId,
    trainerName: trainer?.name || "PT/Coach",
    trainerEmail: trainer?.email || "",
    currentProfile: {
      name: trainer?.name || "",
      email: trainer?.email || "",
      phone: trainer?.phone || "",
      bio: trainer?.bio || "",
      avatar: trainer?.avatar || "",
    },
    proposedProfile: cleanProfile,
    status: "pending",
    requestedAt: new Date().toISOString(),
  };
  writeJSON(TRAINER_PROFILE_CHANGE_REQUESTS_KEY, [request, ...requests]);
  return { ok: true, request };
}

export function resolveTrainerProfileChangeRequest(requestId, decision) {
  if (!["approved", "rejected"].includes(decision)) return { ok: false, reason: "invalid_decision" };
  const requests = getTrainerProfileChangeRequests();
  const request = requests.find((item) => item.id === requestId && item.status === "pending");
  if (!request) return { ok: false, reason: "not_pending" };

  if (decision === "approved") {
    saveTrainerProfileOverride(request.trainerId, request.proposedProfile);
  }

  const updatedRequest = { ...request, status: decision, reviewedAt: new Date().toISOString() };
  writeJSON(TRAINER_PROFILE_CHANGE_REQUESTS_KEY, requests.map((item) => item.id === requestId ? updatedRequest : item));
  return { ok: true, request: updatedRequest };
}

/** Close a pending trainer-submitted change when an Admin updates that trainer's profile directly. */
export function supersedePendingTrainerProfileChangeRequests(trainerId) {
  if (!trainerId) return;
  const requests = getTrainerProfileChangeRequests();
  const key = String(trainerId);
  const hasPending = requests.some((item) => item.trainerId === key && item.status === "pending");
  if (!hasPending) return;
  const now = new Date().toISOString();
  writeJSON(TRAINER_PROFILE_CHANGE_REQUESTS_KEY, requests.map((item) => item.trainerId === key && item.status === "pending"
    ? { ...item, status: "superseded", reviewedAt: now, resolutionNote: "Profil diperbarui langsung oleh Admin." }
    : item));
}

export function requestTrainerPermission(trainer, category) {
  const trainerId = String(trainer?.id || trainer?.username || trainer?.email || "trainer-001");
  const specialties = Array.isArray(trainer?.specialties) ? trainer.specialties : [];
  if (specialties.some((item) => item.toLowerCase() === category.toLowerCase())) {
    return { ok: false, reason: "already_allowed" };
  }

  const requests = getTrainerPermissionRequests();
  const existingPending = requests.find((item) => item.trainerId === trainerId && item.category === category && item.status === "pending");
  if (existingPending) return { ok: false, reason: "already_pending", request: existingPending };

  const request = {
    id: `TPR-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    trainerId,
    trainerName: trainer?.name || "PT/Coach",
    trainerEmail: trainer?.email || "",
    category,
    currentSpecialties: specialties,
    status: "pending",
    requestedAt: new Date().toISOString(),
  };
  writeJSON(TRAINER_PERMISSION_REQUESTS_KEY, [request, ...requests]);
  return { ok: true, request };
}

export function resolveTrainerPermissionRequest(requestId, decision) {
  if (!["approved", "rejected"].includes(decision)) return { ok: false, reason: "invalid_decision" };
  const requests = getTrainerPermissionRequests();
  const request = requests.find((item) => item.id === requestId && item.status === "pending");
  if (!request) return { ok: false, reason: "not_pending" };

  if (decision === "approved") {
    const profiles = getTrainerProfileOverrides();
    const existing = profiles[request.trainerId] || {};
    const currentSpecialties = Array.isArray(existing.specialties)
      ? existing.specialties
      : (Array.isArray(request.currentSpecialties) ? request.currentSpecialties : []);
    const specialties = [...currentSpecialties];
    if (!specialties.some((item) => item.toLowerCase() === request.category.toLowerCase())) {
      specialties.push(request.category);
    }
    profiles[request.trainerId] = {
      ...existing,
      id: request.trainerId,
      name: existing.name || request.trainerName,
      email: existing.email || request.trainerEmail,
      specialties,
      updatedAt: new Date().toISOString(),
    };
    writeJSON(TRAINER_PROFILE_OVERRIDES_KEY, profiles);
  }

  const updatedRequest = { ...request, status: decision, reviewedAt: new Date().toISOString() };
  writeJSON(TRAINER_PERMISSION_REQUESTS_KEY, requests.map((item) => item.id === requestId ? updatedRequest : item));
  return { ok: true, request: updatedRequest };
}

export function countPendingTrainerPermissionRequests() {
  return getTrainerPermissionRequests().filter((item) => item.status === "pending").length;
}
