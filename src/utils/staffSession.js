import { getTrainerProfileOverride } from "./trainerPermissionRequests";

export const ADMIN_SESSION_KEY = "bugarhub-admin-demo";
export const TRAINER_SESSION_KEY = "bugarhub-trainer-demo";

function parseSession(raw, role) {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw);
    if (!value || typeof value !== "object") return null;
    return { ...value, role };
  } catch {
    return null;
  }
}

function applyTrainerProfile(session) {
  if (!session || session.role !== "trainer") return session;
  const profile = getTrainerProfileOverride(session.id || session.username || session.email);
  if (!profile) return session;
  return {
    ...session,
    ...profile,
    role: "trainer",
    specialties: Array.isArray(profile.specialties) ? profile.specialties : (session.specialties || []),
  };
}

/** Reads the current staff session. The frontend demo session is not production authentication. */
export function getStaffSession() {
  const trainer = parseSession(sessionStorage.getItem(TRAINER_SESSION_KEY), "trainer");
  if (trainer) return applyTrainerProfile(trainer);

  const admin = parseSession(sessionStorage.getItem(ADMIN_SESSION_KEY), "admin");
  if (admin) return admin;

  return null;
}

export function setStaffSession(role, session) {
  clearStaffSessions();
  const key = role === "trainer" ? TRAINER_SESSION_KEY : ADMIN_SESSION_KEY;
  sessionStorage.setItem(key, JSON.stringify({ ...session, role }));
}

export function clearStaffSessions() {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
  sessionStorage.removeItem(TRAINER_SESSION_KEY);
}
