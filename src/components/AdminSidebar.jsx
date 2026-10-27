import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Logo from "./Logo";
import { clearStaffSessions, getStaffSession } from "../utils/staffSession";
import {
  getTrainerPermissionRequests,
  resolveTrainerPermissionRequest,
  getTrainerProfileChangeRequests,
  resolveTrainerProfileChangeRequest,
  TRAINER_PERMISSION_EVENT,
  TRAINER_PROFILE_EVENT,
} from "../utils/trainerPermissionRequests";

function AdminIcon({ name, className = "h-5 w-5" }) {
  const paths = {
    dashboard: <><rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1" /><rect x="14" y="3.5" width="6.5" height="6.5" rx="1" /><rect x="3.5" y="14" width="6.5" height="6.5" rx="1" /><rect x="14" y="14" width="6.5" height="6.5" rx="1" /></>,
    calendar: <><rect x="3.5" y="5" width="17" height="15.5" rx="2" /><path d="M7.5 3v4M16.5 3v4M3.5 9.5h17" /></>,
    users: <><path d="M16 20v-1.5a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4V20" /><circle cx="10" cy="7" r="3.5" /><path d="M17 4.2a3.5 3.5 0 0 1 0 6.8M20 20v-1.5a4 4 0 0 0-2.8-3.8" /></>,
    dumbbell: <><path d="m6 9-3 3 3 3M18 9l3 3-3 3M9 5 5 9M19 15l-4 4M8 8l8 8M5 15l4 4M15 5l4 4" /></>,
    chart: <><path d="M3 20h18M5 16l4-5 4 2 6-8" /><path d="M15 5h4v4" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    activity: <><path d="M3 12h4l3-7 4 14 3-7h4" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    star: <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3z" />,
    shield: <><path d="M12 3l7 3v5c0 4.6-3 7.8-7 10-4-2.2-7-5.4-7-10V6l7-3z" /><path d="m9 12 2 2 4-4" /></>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" /></>,
    user: <><circle cx="12" cy="8" r="3.4" /><path d="M5 20c.4-3.5 2.9-5.4 7-5.4s6.6 1.9 7 5.4" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    chevron: <path d="m9 5 7 7-7 7" />,
  };
  return <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.dashboard}</svg>;
}

const adminNavItems = [
  { label: "Dashboard", to: "/admin/dashboard", icon: "dashboard" },
  { label: "Jadwal Kelas", to: "/admin/jadwal-kelas", icon: "calendar" },
  { label: "Kelola Member", to: "/admin/members", icon: "users" },
  { label: "Kelola Trainer", to: "/admin/trainers", icon: "dumbbell" },
  { label: "Laporan", to: "/admin/reports", icon: "chart" },
];

const trainerNavItems = [
  { label: "Dashboard", to: "/trainer/dashboard", icon: "dashboard" },
  { label: "Jadwal", to: "/trainer/schedule", icon: "calendar" },
  { label: "Sesi & Booking", to: "/trainer/bookings", icon: "clock" },
  { label: "Manajemen Kelas", to: "/trainer/classes", icon: "dumbbell" },
  { label: "Statistik Sesi", to: "/trainer/statistics", icon: "chart" },
];

function AdminNavItems({ compact = false, isTrainer = false }) {
  const navItems = isTrainer ? trainerNavItems : adminNavItems;
  return navItems.map((item) => <NavLink key={item.to} to={item.to} end title={compact ? item.label : undefined} className={({ isActive }) => `group flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${compact ? "justify-center" : ""} ${isActive ? "bg-[#fff1e7] text-[#e85f00]" : "text-[#738198] hover:bg-[#f6f8fb] hover:text-[#263346]"}`}>
    <AdminIcon name={item.icon} className="h-5 w-5 shrink-0" />{!compact && <span>{item.label}</span>}
  </NavLink>);
}

function TrainerPermissionBell({ compact = false }) {
  const [open, setOpen] = useState(false);
  const [requests, setRequests] = useState(getTrainerPermissionRequests);
  const [profileRequests, setProfileRequests] = useState(getTrainerProfileChangeRequests);
  const [notice, setNotice] = useState("");
  const wrapperRef = useRef(null);
  const pendingRequests = requests.filter((item) => item.status === "pending");
  const pendingProfileRequests = profileRequests.filter((item) => item.status === "pending");
  const pendingCount = pendingRequests.length + pendingProfileRequests.length;

  useEffect(() => {
    const refresh = () => {
      setRequests(getTrainerPermissionRequests());
      setProfileRequests(getTrainerProfileChangeRequests());
    };
    const onPointerDown = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("storage", refresh);
    window.addEventListener(TRAINER_PERMISSION_EVENT, refresh);
    window.addEventListener(TRAINER_PROFILE_EVENT, refresh);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener(TRAINER_PERMISSION_EVENT, refresh);
      window.removeEventListener(TRAINER_PROFILE_EVENT, refresh);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  function refreshRequests() {
    setRequests(getTrainerPermissionRequests());
    setProfileRequests(getTrainerProfileChangeRequests());
  }

  function handlePermissionDecision(request, decision) {
    const result = resolveTrainerPermissionRequest(request.id, decision);
    refreshRequests();
    if (result.ok && decision === "approved") setNotice(`Izin ${request.category} disetujui untuk ${request.trainerName}.`);
    else if (result.ok) setNotice(`Permintaan ${request.category} dari ${request.trainerName} ditolak.`);
    else setNotice("Permintaan sudah diproses atau tidak tersedia.");
  }

  function handleProfileDecision(request, decision) {
    const result = resolveTrainerProfileChangeRequest(request.id, decision);
    refreshRequests();
    if (result.ok && decision === "approved") setNotice(`Perubahan profil ${request.trainerName} disetujui.`);
    else if (result.ok) setNotice(`Perubahan profil ${request.trainerName} ditolak.`);
    else setNotice("Permintaan profil sudah diproses atau tidak tersedia.");
  }

  return <div ref={wrapperRef} className={compact ? "relative" : "relative shrink-0"}>
    <button type="button" onClick={() => { refreshRequests(); setOpen((value) => !value); setNotice(""); }} aria-label="Notifikasi permintaan staf" aria-expanded={open} className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#e5e9ef] bg-white text-[#718096] transition hover:border-[#ffd4b3] hover:bg-[#fff8f3] hover:text-[#e85f00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6b00]">
      <AdminIcon name="bell" className="h-[17px] w-[17px]" />
      {pendingCount > 0 && <><span className="absolute right-[5px] top-[4px] h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" /><span className="sr-only">{pendingCount} permintaan menunggu</span></>}
    </button>

    {open && <section role="dialog" aria-label="Notifikasi staf" className="fixed right-3 top-20 z-[100] w-[min(440px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-[#e5e9ef] bg-white shadow-[0_18px_60px_rgba(25,39,58,0.2)] md:bottom-20 md:left-[228px] md:right-auto md:top-auto">
      <header className="flex items-start justify-between gap-3 border-b border-[#edf0f4] px-4 py-3.5"><div><h2 className="text-sm font-extrabold text-[#263346]">Notifikasi staf</h2><p className="mt-1 text-xs text-[#7b899e]">Permintaan izin kelas dan perubahan profil PT/Coach.</p></div><span className="rounded-full bg-[#fff1e7] px-2.5 py-1 text-[10px] font-bold text-[#e85f00]">{pendingCount} menunggu</span></header>
      {notice && <p role="status" className="mx-4 mt-3 rounded-lg bg-[#f0fbf5] px-3 py-2 text-xs text-[#176b43]">{notice}</p>}
      <div className="max-h-[min(65vh,500px)] space-y-4 overflow-y-auto p-4">
        {pendingProfileRequests.length === 0 && pendingRequests.length === 0 ? <div className="rounded-xl border border-dashed border-[#dfe5ed] px-4 py-8 text-center"><span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#f4f6f9] text-[#8a97aa]"><AdminIcon name="bell" /></span><p className="mt-3 text-sm font-semibold text-[#344155]">Belum ada permintaan baru</p><p className="mt-1 text-xs text-[#8a97aa]">Permintaan dari PT/Coach akan muncul di sini.</p></div> : <>
          {pendingProfileRequests.length > 0 && <section><div className="mb-2 flex items-center justify-between"><h3 className="text-xs font-extrabold uppercase tracking-wide text-[#68778d]">Perubahan profil</h3><span className="rounded-full bg-[#fff1e7] px-2 py-0.5 text-[10px] font-bold text-[#e85f00]">{pendingProfileRequests.length}</span></div><div className="space-y-3">{pendingProfileRequests.map((request) => <article key={request.id} className="rounded-xl border border-[#e5e9ef] p-3.5">
            <div className="flex items-start gap-3">{request.proposedProfile?.avatar ? <img src={request.proposedProfile.avatar} alt="Foto yang diajukan" className="h-10 w-10 shrink-0 rounded-full border border-[#e5e9ef] object-cover" /> : <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fff1e7] text-[11px] font-extrabold text-[#e85f00]">{request.trainerName.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</span>}<div className="min-w-0 flex-1"><p className="text-sm leading-5 text-[#344155]"><span className="font-extrabold">Coach {request.trainerName}</span> meminta persetujuan perubahan profil.</p><div className="mt-2 space-y-1.5 rounded-lg bg-[#f8fafc] p-2.5 text-xs text-[#718096]"><p><span className="font-semibold text-[#344155]">Nama baru:</span> {request.proposedProfile?.name || "Tidak diubah"}</p><p><span className="font-semibold text-[#344155]">Email baru:</span> {request.proposedProfile?.email || "Tidak diubah"}</p><p><span className="font-semibold text-[#344155]">Foto:</span> {request.proposedProfile?.avatar && request.proposedProfile.avatar !== request.currentProfile?.avatar ? "Mengajukan foto baru" : "Tidak diubah"}</p></div><p className="mt-2 text-[10px] text-[#8a97aa]">{new Date(request.requestedAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}</p></div></div>
            <div className="mt-3 grid grid-cols-2 gap-2"><button type="button" onClick={() => handleProfileDecision(request, "approved")} className="min-h-9 rounded-lg border border-emerald-200 bg-white px-3 text-xs font-bold text-emerald-700 transition hover:border-emerald-600 hover:bg-emerald-600 hover:text-white">Terima</button><button type="button" onClick={() => handleProfileDecision(request, "rejected")} className="min-h-9 rounded-lg border border-red-200 bg-white px-3 text-xs font-bold text-red-600 transition hover:border-red-600 hover:bg-red-600 hover:text-white">Tolak</button></div>
          </article>)}</div></section>}
          {pendingRequests.length > 0 && <section><div className="mb-2 flex items-center justify-between"><h3 className="text-xs font-extrabold uppercase tracking-wide text-[#68778d]">Izin kelas</h3><span className="rounded-full bg-[#fff1e7] px-2 py-0.5 text-[10px] font-bold text-[#e85f00]">{pendingRequests.length}</span></div><div className="space-y-3">{pendingRequests.map((request) => <article key={request.id} className="rounded-xl border border-[#e5e9ef] p-3.5">
            <div className="flex items-start gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fff1e7] text-[11px] font-extrabold text-[#e85f00]">{request.trainerName.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</span><div className="min-w-0 flex-1"><p className="text-sm leading-5 text-[#344155]"><span className="font-extrabold">Coach {request.trainerName}</span> meminta untuk menambah kelas:</p><span className="mt-1.5 inline-flex rounded-full border border-[#f5d4bd] bg-[#fff7f1] px-2.5 py-1 text-xs font-bold text-[#9a4f1b]">{request.category}</span><p className="mt-2 text-[10px] text-[#8a97aa]">{new Date(request.requestedAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}</p></div></div>
            <div className="mt-3 grid grid-cols-2 gap-2"><button type="button" onClick={() => handlePermissionDecision(request, "approved")} className="min-h-9 rounded-lg border border-emerald-200 bg-white px-3 text-xs font-bold text-emerald-700 transition hover:border-emerald-600 hover:bg-emerald-600 hover:text-white">Terima</button><button type="button" onClick={() => handlePermissionDecision(request, "rejected")} className="min-h-9 rounded-lg border border-red-200 bg-white px-3 text-xs font-bold text-red-600 transition hover:border-red-600 hover:bg-red-600 hover:text-white">Tolak</button></div>
          </article>)}</div></section>}
        </>}
      </div>
      <footer className="border-t border-[#edf0f4] bg-[#fafbfc] px-4 py-2.5 text-[10px] text-[#8a97aa]">Profil trainer hanya berubah setelah permintaan disetujui Admin.</footer>
    </section>}
  </div>;
}

function AdminSidebar() {
  const navigate = useNavigate();
  const session = getStaffSession();
  const isTrainer = session?.role === "trainer";
  const roleLabel = isTrainer ? "PT / Coach" : "Admin";
  const name = session?.name || (isTrainer ? "Rizky Pratama" : "Admin Putri");
  const initials = name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase();

  function handleLogout() {
    clearStaffSessions();
    navigate("/admin/login", { replace: true });
  }

  return <>
    <aside className="sticky top-0 hidden h-screen max-h-screen w-[218px] shrink-0 self-start flex-col overflow-hidden border-r border-[#e5e9ef] bg-white px-4 pb-4 pt-6 md:flex">
      <div className="shrink-0 px-0.5"><Logo className="gap-2" /><span className="mt-3 inline-flex rounded-md bg-[#f4f6f9] px-2.5 py-1 text-xs font-semibold text-[#77849a]">{roleLabel}</span></div>
      <div className="mt-8 flex min-h-0 flex-1 flex-col"><p className="mb-3 shrink-0 px-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#a2adbc]">Workspace</p><nav aria-label={`${roleLabel} navigation`} className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pb-2 pr-1"><AdminNavItems isTrainer={isTrainer} /></nav></div>
      <div className="mt-auto shrink-0 border-t border-[#e7eaf0] pt-4">
        {isTrainer ? <NavLink to="/trainer/profile" title="Edit profil PT/Coach" className={({ isActive }) => `flex items-center gap-2 rounded-xl px-1.5 py-2 transition ${isActive ? "bg-[#fff1e7]" : "hover:bg-[#f8f9fb]"}`}><span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#fff0e5] text-xs font-extrabold text-[#f56600]">{session?.avatar ? <img src={session.avatar} alt={`Foto ${name}`} className="h-full w-full object-cover" /> : initials}</span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-[#334155]">{name}</span><span className="mt-0.5 block truncate text-[11px] text-[#94a0b1]">Personal Trainer / Coach</span><span className="mt-0.5 block text-[10px] font-semibold text-[#e85f00]">Edit profil</span></span></NavLink> : <div className="flex items-center gap-1 rounded-xl px-0.5 py-2">
          <NavLink to="/admin/profile" aria-label="Edit profile admin" className={({ isActive }) => `flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fff0e5] text-xs font-extrabold text-[#f56600] transition ${isActive ? "ring-2 ring-[#ff6b00]" : "hover:bg-[#ffe6d4]"}`}>{initials}</NavLink>
          <TrainerPermissionBell />
          <NavLink to="/admin/profile" className={({ isActive }) => `min-w-0 flex-1 rounded-lg px-1.5 py-2 transition ${isActive ? "bg-[#fff1e7]" : "hover:bg-[#f8f9fb]"}`}><span className="block truncate text-xs font-semibold text-[#334155]">{name}</span><span className="mt-0.5 block truncate text-[11px] text-[#94a0b1]">{session?.displayRole || "Super Admin"}</span></NavLink>
        </div>}
        <button type="button" onClick={handleLogout} className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-[#738198] transition hover:bg-[#f6f8fb] hover:text-[#e85f00]"><AdminIcon name="logout" className="h-4 w-4" /> Keluar</button>
      </div>
    </aside>

    <div className="border-b border-[#e5e9ef] bg-white px-4 py-3 md:hidden"><div className="mb-3 flex items-center justify-between gap-3"><Logo className="gap-2" /><div className="flex items-center gap-2"><span className="rounded-md bg-[#f4f6f9] px-2.5 py-1 text-xs font-semibold text-[#77849a]">{roleLabel}</span>{!isTrainer && <TrainerPermissionBell compact />}<button type="button" onClick={handleLogout} aria-label="Keluar" className="rounded-lg border border-[#e5e9ef] p-2 text-[#738198] hover:text-[#e85f00]"><AdminIcon name="logout" className="h-4 w-4" /></button></div></div><nav aria-label={`${roleLabel} navigation`} className="flex gap-1.5 overflow-x-auto pb-1"><AdminNavItems isTrainer={isTrainer} compact={false} /></nav></div>
  </>;
}

export { AdminIcon };
export default AdminSidebar;
