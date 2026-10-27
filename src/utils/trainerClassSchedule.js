export const TRAINER_CLASSES_STORAGE_KEY = "bugarhub_trainer_classes_v1";
export const TRAINER_CLASSES_UPDATED_EVENT = "bugarhub-trainer-classes-updated";

/** Read the same class schedule collection used by the PT/Coach workspace. */
export function readTrainerClasses() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(TRAINER_CLASSES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Persist trainer-created/updated classes and notify React pages in this tab. */
export function saveTrainerClasses(classes) {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(TRAINER_CLASSES_STORAGE_KEY, JSON.stringify(classes));
    window.dispatchEvent(new CustomEvent(TRAINER_CLASSES_UPDATED_EVENT, { detail: classes }));
    return true;
  } catch {
    return false;
  }
}
