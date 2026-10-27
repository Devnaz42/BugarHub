import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import Logo from "./Logo";
import { readDemoMember, DEMO_MEMBER_SESSION_KEY } from "../utils/demoData";
import { getMemberPTEntitlement, MEMBER_PT_ENTITLEMENT_UPDATED_EVENT } from "../utils/ptBookingData";

const serviceItems = [
  { label: "Book PT", description: "Pilih personal trainer", to: "/book-pt", icon: "pt" },
  { label: "Jadwal Kelas", description: "Cari kelas dan reservasi", to: "/jadwal", icon: "calendar" },
  { label: "Latihan", description: "Program dan panduan latihan", to: "/latihan", icon: "activity" },
];

function SmallIcon({ name, className = "h-5 w-5" }) {
  const paths = {
    chevron: <path d="m6 9 6 6 6-6" />,
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    pt: <><path d="M6 4v16M18 4v16M3 7h6M15 7h6M3 17h6M15 17h6" /><path d="M9 12h6" /></>,
    calendar: <><rect x="3.5" y="5" width="17" height="15.5" rx="2.2" /><path d="M7.5 3v4M16.5 3v4M3.5 9.5h17" /></>,
    activity: <path d="M3 12h4l3-8 4 16 3-8h4" />,
    dashboard: <><rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="5" rx="1.5" /><rect x="13" y="10" width="8" height="11" rx="1.5" /><rect x="3" y="13" width="8" height="8" rx="1.5" /></>,
    list: <><path d="M9 6h11M9 12h11M9 18h11" /><path d="M4 6h.01M4 12h.01M4 18h.01" /></>,
    user: <><circle cx="12" cy="8" r="3.2" /><path d="M5 20c.5-3.3 2.8-5.2 7-5.2s6.5 1.9 7 5.2" /></>,
    edit: <><path d="m15 5 4 4M4 20l4.2-.8L19 8.4a2.1 2.1 0 0 0-3-3L5.2 16.2 4 20Z" /></>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    contact: <><path d="M21 11.5a8.4 8.4 0 0 1-8.8 8.4 9 9 0 0 1-3.9-.9L3 20l1.1-4.1a8.4 8.4 0 1 1 16.9-4.4Z" /></>,
    membership: <><rect x="2.5" y="5" width="19" height="14" rx="2" /><path d="M2.5 9h19M7 14h4M16 14h.01" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1a1.8 1.8 0 0 1-2.5 2.5l-.1-.1a1.8 1.8 0 0 0-3 .9v.2a1.8 1.8 0 0 1-3.6 0v-.2a1.8 1.8 0 0 0-3-.9l-.1.1a1.8 1.8 0 0 1-2.5-2.5l.1-.1a1.8 1.8 0 0 0-.9-3H4a1.8 1.8 0 0 1 0-3.6h.2a1.8 1.8 0 0 0 .9-3l-.1-.1a1.8 1.8 0 0 1 2.5-2.5l.1.1a1.8 1.8 0 0 0 3-.9V2a1.8 1.8 0 0 1 3.6 0v.2a1.8 1.8 0 0 0 3 .9l.1-.1a1.8 1.8 0 0 1 2.5 2.5l-.1.1a1.8 1.8 0 0 0 .9 3h.2a1.8 1.8 0 0 1 0 3.6h-.2a1.8 1.8 0 0 0-.9 2.8Z" /></>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" /></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
  };

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {paths[name] || paths.arrow}
    </svg>
  );
}

function getInitials(member) {
  return member?.initials || String(member?.name || "Member").trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "MB";
}

function MemberAvatar({ member, className = "h-9 w-9" }) {
  if (member?.avatarDataUrl) {
    return <img src={member.avatarDataUrl} alt={`Foto profil ${member.name}`} className={`${className} shrink-0 rounded-full border border-[#f0e7df] object-cover`} />;
  }
  return <span className={`${className} flex shrink-0 items-center justify-center rounded-full bg-[#fff0e5] text-xs font-extrabold text-[#f56600] sm:text-sm`} aria-label={`Avatar ${member?.name || "Member"}`}>{getInitials(member)}</span>;
}

function menuItemClass(active = false) {
  return `flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6b00]/35 ${active ? "bg-[#fff0e5] text-[#f56600]" : "text-[#30363b] hover:bg-[#faf7f4]"}`;
}

export default function MemberHeader() {
  const [member, setMember] = useState(readDemoMember);
  const [membershipStatus, setMembershipStatus] = useState(() => getMemberPTEntitlement(readDemoMember()).membershipStatus);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileServicesOpen, setProfileServicesOpen] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const profileMenuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const isServiceActive = serviceItems.some((item) => location.pathname === item.to || location.pathname.startsWith(`${item.to}/`));

  useEffect(() => {
    const applyCurrentMember = (nextMember = readDemoMember()) => {
      setMember(nextMember);
      setMembershipStatus(getMemberPTEntitlement(nextMember).membershipStatus);
    };
    const handleMemberUpdated = (event) => applyCurrentMember(event.detail || readDemoMember());
    const handleStorage = () => applyCurrentMember(readDemoMember());
    const handleEntitlementUpdated = () => applyCurrentMember(readDemoMember());
    window.addEventListener("bugarhub-demo-member-updated", handleMemberUpdated);
    window.addEventListener("storage", handleStorage);
    window.addEventListener(MEMBER_PT_ENTITLEMENT_UPDATED_EVENT, handleEntitlementUpdated);
    return () => {
      window.removeEventListener("bugarhub-demo-member-updated", handleMemberUpdated);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(MEMBER_PT_ENTITLEMENT_UPDATED_EVENT, handleEntitlementUpdated);
    };
  }, []);

  useEffect(() => {
    function handlePointerDown(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileOpen(false);
        setProfileServicesOpen(false);
      }
    }
    function handleEscape(event) {
      if (event.key === "Escape") {
        setProfileOpen(false);
        setProfileServicesOpen(false);
        setShowContact(false);
        setServicesOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function closeProfileMenu() {
    setProfileOpen(false);
    setProfileServicesOpen(false);
  }

  function handleLogout() {
    try {
      window.sessionStorage.removeItem(DEMO_MEMBER_SESSION_KEY);
    } catch {
      // Continue to Login even if browser storage is unavailable.
    }
    closeProfileMenu();
    navigate("/login", { replace: true });
  }

  return (
    <>
      <header className="relative z-40 border-b border-[#e7e8ea] bg-white">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-x-6 gap-y-3 px-5 py-3 sm:px-8 lg:flex-nowrap lg:px-10 xl:px-14">
          <div className="flex w-fit shrink-0 items-center rounded-lg focus-within:outline-none focus-within:ring-4 focus-within:ring-[#ff6b00]/20">
            {/* Logo component already contains its own home link; don't wrap it in another anchor. */}
            <Logo />
          </div>

          <nav aria-label="Navigasi member" className="order-3 flex w-full flex-wrap items-center gap-1.5 py-1 lg:order-none lg:w-auto lg:flex-1 lg:justify-center lg:gap-2">
            <NavLink to="/dashboard" end className={({ isActive }) => `shrink-0 inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#ff6b00]/20 sm:px-5 ${isActive ? "border-[#ff6b00] bg-[#fff0e5] text-[#f56600]" : "border-transparent text-[#697077] hover:border-[#e7e8e7] hover:bg-white hover:text-[#202326]"}`}>
              <SmallIcon name="dashboard" className="hidden h-4 w-4 sm:block" />Dashboard
            </NavLink>

            <div
              className="relative shrink-0"
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}
              onKeyDown={(event) => { if (event.key === "Escape") setServicesOpen(false); }}
              onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setServicesOpen(false); }}
            >
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={servicesOpen}
                onClick={() => {
                  const isDesktopPointer = typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
                  setServicesOpen((open) => (isDesktopPointer ? true : !open));
                }}
                onFocus={() => setServicesOpen(true)}
                className={`shrink-0 inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#ff6b00]/20 sm:px-5 ${isServiceActive || servicesOpen ? "border-[#ff6b00] bg-[#fff0e5] text-[#f56600]" : "border-transparent text-[#697077] hover:border-[#e7e8e7] hover:bg-white hover:text-[#202326]"}`}
              >
                Layanan
                <SmallIcon name="chevron" className={`h-4 w-4 transition-transform ${servicesOpen ? "rotate-180" : ""}`} />
              </button>
              {servicesOpen && (
                <div role="menu" aria-label="Pilihan layanan" className="absolute left-0 top-full z-50 w-[280px] pt-2">
                  <div className="overflow-hidden rounded-2xl border border-[#e8e8e6] bg-white p-2 shadow-[0_16px_50px_rgba(24,28,32,0.16)]">
                    {serviceItems.map((item) => {
                      const active = location.pathname === item.to;
                      return (
                        <NavLink key={item.to} to={item.to} role="menuitem" onClick={() => setServicesOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-3 transition ${active ? "bg-[#fff0e5]" : "hover:bg-[#faf7f4]"}`}>
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff0e5] text-[#f56600]"><SmallIcon name={item.icon} className="h-5 w-5" /></span>
                          <span className="min-w-0 flex-1"><span className={`block text-sm font-extrabold ${active ? "text-[#f56600]" : "text-[#202326]"}`}>{item.label}</span><span className="mt-0.5 block text-xs text-[#7a8085]">{item.description}</span></span>
                          <SmallIcon name="arrow" className="h-4 w-4 shrink-0 text-[#a0a5a8]" />
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <NavLink to="/jadwal-saya" className={({ isActive }) => `shrink-0 inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#ff6b00]/20 sm:px-5 ${isActive ? "border-[#ff6b00] bg-[#fff0e5] text-[#f56600]" : "border-transparent text-[#697077] hover:border-[#e7e8e7] hover:bg-white hover:text-[#202326]"}`}>
              <SmallIcon name="list" className="hidden h-4 w-4 sm:block" />Jadwal Saya
            </NavLink>
          </nav>

          <div className="relative ml-auto shrink-0" ref={profileMenuRef}>
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={profileOpen}
              aria-label="Buka menu profil member"
              onClick={() => { setProfileOpen((open) => !open); setProfileServicesOpen(false); }}
              className={`flex max-w-[230px] items-center gap-2 rounded-full border bg-white py-1.5 pl-1.5 pr-2.5 shadow-sm transition hover:border-[#ffc49e] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#ff6b00]/20 sm:gap-3 sm:py-2 sm:pl-2 sm:pr-3.5 ${profileOpen ? "border-[#ffc49e] ring-2 ring-[#ff6b00]/10" : "border-[#e6e7e8]"}`}
            >
              <MemberAvatar member={member} className="h-8 w-8 sm:h-9 sm:w-9" />
              <span className="max-w-[110px] truncate text-xs font-bold text-[#202326] sm:max-w-[155px] sm:text-sm">{member.name}</span>
              <SmallIcon name="chevron" className={`h-3.5 w-3.5 shrink-0 text-[#70767c] transition-transform ${profileOpen ? "rotate-180" : ""}`} />
            </button>

            {profileOpen && (
              <div role="menu" aria-label="Menu profil member" className="absolute right-0 top-full z-[70] mt-3 w-[350px] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-[22px] border border-[#e8e8e8] bg-white shadow-[0_22px_65px_rgba(20,25,30,0.20)]">
                <div className="p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <MemberAvatar member={member} className="h-14 w-14 sm:h-16 sm:w-16" />
                    <div className="min-w-0 flex-1 pt-0.5">
                      <p className="truncate text-base font-extrabold text-[#202326]">{member.name}</p>
                      <p className="mt-1 break-all text-xs leading-5 text-[#7a8085] sm:text-sm">{member.email || "Email belum diatur"}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#fff0e5] px-2.5 py-1 text-[11px] font-bold text-[#f56600]">Member</span>
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${membershipStatus === "active" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>{membershipStatus === "active" ? "Membership Aktif" : "Membership Nonaktif"}</span>
                        <Link to="/profile" role="menuitem" onClick={closeProfileMenu} className="inline-flex items-center gap-1 text-xs font-bold text-[#f56600] transition hover:underline"><SmallIcon name="edit" className="h-3.5 w-3.5" />Edit Profile</Link>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mx-4 border-t border-[#eceeef] sm:mx-5" />

                <div className="p-2.5 sm:p-3">
                  <Link to="/dashboard" role="menuitem" onClick={closeProfileMenu} className={menuItemClass(location.pathname === "/dashboard")}>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f5f6f6] text-[#4d555b]"><SmallIcon name="dashboard" /></span>
                    <span className="min-w-0 flex-1"><span className="block text-sm font-bold">Dashboard</span><span className="mt-0.5 block text-xs text-[#7a8085]">Ringkasan aktivitasmu</span></span>
                  </Link>

                  <div className="mt-1">
                    <button type="button" role="menuitem" aria-expanded={profileServicesOpen} onClick={() => setProfileServicesOpen((open) => !open)} className={menuItemClass(profileServicesOpen || isServiceActive)}>
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f5f6f6] text-[#4d555b]"><SmallIcon name="grid" /></span>
                      <span className="min-w-0 flex-1"><span className="block text-sm font-bold">Layanan</span><span className="mt-0.5 block text-xs text-[#7a8085]">Book PT, jadwal kelas, dan latihan</span></span>
                      <SmallIcon name="chevron" className={`h-4 w-4 shrink-0 transition-transform ${profileServicesOpen ? "rotate-90" : "-rotate-90"}`} />
                    </button>
                    {profileServicesOpen && (
                      <div className="ml-[52px] mt-1 space-y-1 border-l border-[#e8e8e8] pl-2">
                        {serviceItems.map((item) => (
                          <Link key={item.to} to={item.to} role="menuitem" onClick={closeProfileMenu} className={`block rounded-lg px-3 py-2 text-sm transition ${location.pathname === item.to ? "bg-[#fff0e5] font-bold text-[#f56600]" : "text-[#50575d] hover:bg-[#faf7f4] hover:text-[#f56600]"}`}>{item.label}</Link>
                        ))}
                      </div>
                    )}
                  </div>

                  <Link to="/membership" role="menuitem" onClick={closeProfileMenu} className={`${menuItemClass(location.pathname.startsWith("/membership"))} mt-1`}>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f5f6f6] text-[#4d555b]"><SmallIcon name="membership" /></span>
                    <span className="min-w-0 flex-1"><span className="block text-sm font-bold">Membership</span><span className="mt-0.5 block text-xs text-[#7a8085]">Paket membership dan Token PT</span></span>
                    <SmallIcon name="arrow" className="h-4 w-4 shrink-0 text-[#9ba1a6]" />
                  </Link>

                  <button type="button" role="menuitem" onClick={() => { closeProfileMenu(); setShowContact(true); }} className={`${menuItemClass(false)} mt-1`}>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f5f6f6] text-[#4d555b]"><SmallIcon name="contact" /></span>
                    <span className="min-w-0 flex-1"><span className="block text-sm font-bold">Contact</span><span className="mt-0.5 block text-xs text-[#7a8085]">Lokasi & WhatsApp Admin</span></span>
                    <SmallIcon name="arrow" className="h-4 w-4 shrink-0 text-[#9ba1a6]" />
                  </button>
                </div>

                <div className="mx-4 border-t border-[#eceeef] sm:mx-5" />
                <div className="p-2.5 sm:p-3">
                  <Link to="/settings" role="menuitem" onClick={closeProfileMenu} className={menuItemClass(location.pathname === "/settings")}>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f5f6f6] text-[#4d555b]"><SmallIcon name="settings" /></span>
                    <span className="min-w-0 flex-1"><span className="block text-sm font-bold">Settings</span><span className="mt-0.5 block text-xs text-[#7a8085]">Preferensi dan pengaturan akun</span></span>
                    <SmallIcon name="arrow" className="h-4 w-4 shrink-0 text-[#9ba1a6]" />
                  </Link>
                  <button type="button" role="menuitem" onClick={handleLogout} className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[#d92d20] transition hover:bg-[#fff0f0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff0f0]"><SmallIcon name="logout" /></span>
                    <span className="text-sm font-bold">Log out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {showContact && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#171a1c]/55 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowContact(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="member-contact-title" className="w-full max-w-md rounded-[24px] border border-white/70 bg-white p-5 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff0e5] text-[#f56600]"><SmallIcon name="contact" className="h-5 w-5" /></span>
                <div><p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#f56600]">BugarHub</p><h2 id="member-contact-title" className="mt-0.5 text-xl font-black text-[#202326]">Contact Admin</h2></div>
              </div>
              <button type="button" aria-label="Tutup kontak" onClick={() => setShowContact(false)} className="flex h-9 w-9 items-center justify-center rounded-full text-[#777f85] transition hover:bg-[#f3f4f4]"><SmallIcon name="close" /></button>
            </div>
            <div className="mt-5 space-y-3">
              <div className="flex items-start gap-3 rounded-xl border border-[#eceeef] p-3.5">
                <SmallIcon name="pin" className="mt-0.5 h-5 w-5 shrink-0 text-[#f56600]" />
                <div><p className="text-sm font-bold text-[#202326]">Lokasi Gym</p><p className="mt-1 text-sm text-[#697077]">BugarHub Senayan <span className="text-xs text-[#92989d]">(lokasi pada data demo)</span></p></div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-[#eceeef] p-3.5">
                <SmallIcon name="contact" className="mt-0.5 h-5 w-5 shrink-0 text-[#f56600]" />
                <div><p className="text-sm font-bold text-[#202326]">WhatsApp Admin</p><p className="mt-1 text-sm leading-5 text-[#697077]">Nomor WhatsApp resmi belum dikonfigurasi. Kita tambahkan setelah kontak BugarHub dikonfirmasi.</p></div>
              </div>
            </div>
            <button type="button" onClick={() => setShowContact(false)} className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#ff6b00] px-4 text-sm font-extrabold text-white transition hover:bg-[#ec6100] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#ff6b00]/25">Tutup</button>
          </section>
        </div>
      )}
    </>
  );
}
