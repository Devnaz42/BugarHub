export const CLASS_RESERVATIONS_STORAGE_KEY = "bugarhub-demo-class-reservations";
export const DEMO_MEMBER_SESSION_KEY = "bugarhub-demo-member";
export const MEMBER_PROFILE_STORAGE_KEY = "bugarhub-demo-member-profiles";
export const MEMBER_SETTINGS_STORAGE_KEY = "bugarhub-demo-member-settings";

function safeReadObject(storage, key) {
  try {
    const raw = storage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function getMemberInitials(name = "Member") {
  return String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "MB";
}


export function getDemoMemberProfileKey(member) {
  // Gunakan identitas asli akun agar profil setiap member terpisah.
  const key =
    member?.identityEmail ||
    member?.email ||
    member?.id ||
    member?.name ||
    "preview-member";

  return String(key).trim().toLowerCase();
}


export function readDemoMember() {
  let baseMember = null;
  try {
    const savedMember = window.sessionStorage.getItem(DEMO_MEMBER_SESSION_KEY);
    if (savedMember) {
      const parsedMember = JSON.parse(savedMember);
      if (parsedMember && typeof parsedMember.name === "string") baseMember = parsedMember;
    }
  } catch {
    // Fall back to the preview member if session storage is unavailable.
  }

  if (!baseMember) {
    baseMember = {
      id: "preview-member",
      name: "Yoga Aditya",
      email: "yoga.aditya@example.com",
      initials: "YA",
      phone: "",
    };
  }

  const identityEmail = baseMember.identityEmail || baseMember.email || "";
  let savedProfile = {};
  try {
    const profiles = safeReadObject(window.localStorage, MEMBER_PROFILE_STORAGE_KEY);
    savedProfile = profiles[getDemoMemberProfileKey(baseMember)] || {};
  } catch {
    // Continue with the current demo session if local storage is unavailable.
  }

  const member = {
    ...baseMember,
    ...savedProfile,
    id: baseMember.id || savedProfile.id || "preview-member",
    identityEmail,
  };
  member.initials = getMemberInitials(member.name);
  return member;
}

export function saveDemoMemberProfile(member, updates) {
  const key = getDemoMemberProfileKey(member);
  const allowedProfileFields = {
    name: String(updates?.name ?? member?.name ?? "").trim(),
    email: String(updates?.email ?? member?.email ?? "").trim(),
    phone: String(updates?.phone ?? member?.phone ?? "").trim(),
    avatarDataUrl: String(updates?.avatarDataUrl ?? member?.avatarDataUrl ?? ""),
  };

  if (!allowedProfileFields.name || !allowedProfileFields.email) return null;

  const updatedMember = {
    ...member,
    ...allowedProfileFields,
    identityEmail: member?.identityEmail || member?.email || "",
  };
  updatedMember.initials = getMemberInitials(updatedMember.name);

  try {
    const profiles = safeReadObject(window.localStorage, MEMBER_PROFILE_STORAGE_KEY);
    profiles[key] = allowedProfileFields;
    window.localStorage.setItem(MEMBER_PROFILE_STORAGE_KEY, JSON.stringify(profiles));
    window.sessionStorage.setItem(DEMO_MEMBER_SESSION_KEY, JSON.stringify(updatedMember));
    window.dispatchEvent(new CustomEvent("bugarhub-demo-member-updated", { detail: updatedMember }));
    return updatedMember;
  } catch {
    return null;
  }
}

const DEFAULT_MEMBER_SETTINGS = {
  weeklyReport: true,
  classReminders: true,
  workoutTips: false,
  accountAlerts: true,
};

export function readDemoMemberSettings(member) {
  try {
    const settings = safeReadObject(window.localStorage, MEMBER_SETTINGS_STORAGE_KEY);
    return { ...DEFAULT_MEMBER_SETTINGS, ...(settings[getDemoMemberProfileKey(member)] || {}) };
  } catch {
    return { ...DEFAULT_MEMBER_SETTINGS };
  }
}

export function writeDemoMemberSettings(member, nextSettings) {
  try {
    const settings = safeReadObject(window.localStorage, MEMBER_SETTINGS_STORAGE_KEY);
    settings[getDemoMemberProfileKey(member)] = { ...DEFAULT_MEMBER_SETTINGS, ...nextSettings };
    window.localStorage.setItem(MEMBER_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    return true;
  } catch {
    return false;
  }
}

// Prefer the account's original sign-in email so existing demo reservations remain associated
// with the same demo member if they edit the email shown on their profile.
export function getDemoMemberKey(member) {
  const key = member?.identityEmail || member?.email || member?.id || member?.name || "preview-member";
  return String(key).trim().toLowerCase();
}

export function readClassReservations() {
  try {
    const saved = window.localStorage.getItem(CLASS_RESERVATIONS_STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeClassReservations(reservations) {
  try {
    window.localStorage.setItem(CLASS_RESERVATIONS_STORAGE_KEY, JSON.stringify(reservations));
    return true;
  } catch {
    return false;
  }
}
