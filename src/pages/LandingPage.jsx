import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import { DEMO_MEMBER_SESSION_KEY, readDemoMember } from "../utils/demoData";
import { getMemberPTEntitlement } from "../utils/ptBookingData";

const publicServiceMenu = [
  { label: "Book PT", description: "Pilih personal trainer", type: "trainer" },
  { label: "Jadwal Kelas", description: "Cek kelas dan reservasi", type: "calendar" },
  { label: "Latihan", description: "Program dan panduan latihan", type: "dumbbell" },
];

const services = [
  {
    title: "Book PT",
    description: "Sesi privat dengan trainer profesional",
    to: "/book-pt",
    type: "trainer",
    restricted: true,
  },
  {
    title: "Membership Gym",
    description: "Akses alat 24/7 & kelas harian",
    to: "#membership",
    type: "membership",
    anchor: true,
  },
  {
    title: "Jadwal Kelas",
    description: "Yoga, HIIT, & Pilates",
    to: "/jadwal",
    type: "calendar",
    restricted: true,
  },
];

const plans = [
  {
    name: "Bronze Member",
    description: "Pilihan praktis untuk membangun rutinitas fitness yang konsisten.",
    price: "150k",
    featured: false,
    icon: "dumbbell",
    features: [
      "Basic Gym Access",
      "Akses alat cardio & strength",
      "Loker harian bersama",
    ],
  },
  {
    name: "Silver Member",
    description: "Pendampingan ekstra untuk progres yang lebih terarah dan terukur.",
    price: "300k",
    featured: true,
    icon: "lightning",
    features: [
      "Full Access",
      "1x Sesi PT",
      "Loker pribadi",
      "Akses semua kelas reguler",
    ],
  },
  {
    name: "Gold VIP Member",
    description: "Pengalaman premium tanpa batas untuk hasil kebugaran terbaik.",
    price: "500k",
    featured: false,
    icon: "crown",
    features: [
      "VIP Access",
      "Unlimited Classes",
      "Consultation",
      "Towel Service",
      "Priority booking",
    ],
  },
];

// Add the official account URLs here when they are available.
// Leave a URL empty to show the social chip without navigating anywhere.
const socialLinks = [
  { label: "WhatsApp", symbol: "◉", href: "" },
  { label: "Instagram", symbol: "◎", href: "" },
  { label: "TikTok", symbol: "♪", href: "" },
  { label: "YouTube", symbol: "▷", href: "" },
];

function ArrowUpRight({ className = "h-4 w-4" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M7 17 17 7M8 7h9v9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowDown({ className = "h-4 w-4" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 4v15m-6-6 6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ServiceIcon({ type }) {
  const common = {
    className: "h-6 w-6",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  let drawing;
  switch (type) {
    case "trainer":
      drawing = (
        <>
          <path d="M12 3.5 14.4 5l2.8-.1.9 2.6 2.2 1.8-.9 2.6.3 2.8-2.4 1.4-1.2 2.5-2.8-.4L11 19.5l-2.4-1.5-2.8.1-.9-2.6-2.2-1.8.9-2.6-.3-2.8 2.4-1.4L7 4.4l2.8.4L12 3.5Z" />
          <path d="m9 11.8 2 2 4-4" />
        </>
      );
      break;
    case "membership":
      drawing = (
        <>
          <path d="M3 9h18l-2 11H5L3 9Z" />
          <path d="M7 9 5 4l5 3 2-5 2 5 5-3-2 5" />
        </>
      );
      break;
    case "calendar":
      drawing = (
        <>
          <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
          <path d="M7.5 3v4M16.5 3v4M4 9.5h16" />
          <path d="M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01" strokeWidth="2.5" />
        </>
      );
      break;
    case "dumbbell":
      drawing = (
        <>
          <path d="m6 8 12 8M8 5l3 3-5 5-3-3 5-5ZM16 11l5 5-5 5-5-5 5-5Z" />
          <path d="m4 13-2 2M10 7l2-2M14 17l-2 2M20 11l2-2" />
        </>
      );
      break;
    case "lightning":
      drawing = <path d="M13.5 2.5 5 13h6l-.5 8.5L19 11h-6l.5-8.5Z" />;
      break;
    case "crown":
      drawing = (
        <>
          <path d="m3 7 5 4 4-7 4 7 5-4-2 12H5L3 7Z" />
          <path d="M6 22h12" />
        </>
      );
      break;
    default:
      drawing = <circle cx="12" cy="12" r="8" />;
  }

  return <svg {...common}>{drawing}</svg>;
}

function CheckIcon({ featured = false }) {
  return (
    <span
      className={`mt-0.5 inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full ${
        featured ? "bg-[#ff6b00] text-white" : "bg-[#fff0e4] text-[#ff6b00]"
      }`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none">
        <path d="m3.5 8 3 3 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function ServiceDropdown({ mobile = false, isOpen, setIsOpen, onRequestAccess }) {
  return (
    <div
      className="relative shrink-0"
      onMouseEnter={() => { if (!mobile) setIsOpen(true); }}
      onMouseLeave={() => { if (!mobile) setIsOpen(false); }}
      onKeyDown={(event) => {
        if (event.key === "Escape") setIsOpen(false);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false);
      }}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => (mobile ? !open : true))}
        onFocus={() => { if (!mobile) setIsOpen(true); }}
        className={mobile
          ? `inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${isOpen ? "border-[#ffc49e] bg-[#fff8f3] text-[#f56600]" : "border-[#e9e9e9] text-[#555b60] hover:border-[#ff6b00] hover:text-[#ff6b00]"}`
          : `inline-flex whitespace-nowrap items-center gap-2 rounded-full px-3 py-2 text-[15px] font-semibold transition ${isOpen ? "bg-[#fff3e9] text-[#f56600]" : "text-[#54595e] hover:bg-[#fff3e9] hover:text-[#f56600]"}`}
      >
        Layanan
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}>
          <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Pilihan layanan"
          className={`absolute left-0 top-full z-50 w-[280px] max-w-[calc(100vw-2.5rem)] pt-2`}
        >
          <div className="overflow-hidden rounded-2xl border border-[#e8e8e6] bg-white p-2 shadow-[0_16px_50px_rgba(24,28,32,0.16)]">
            {publicServiceMenu.map((item) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                onClick={() => {
                  setIsOpen(false);
                  onRequestAccess(item.label);
                }}
                className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-[#faf7f4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6b00]/40"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff0e5] text-[#f56600] transition group-hover:bg-[#ff6b00] group-hover:text-white">
                  <ServiceIcon type={item.type} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-extrabold text-[#202326]">{item.label}</span>
                  <span className="mt-0.5 block text-xs text-[#7a8085]">{item.description}</span>
                </span>
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0 text-[#a0a5a8] transition group-hover:text-[#f56600]">
                  <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LockIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-7 w-7">
      <rect x="5" y="10" width="14" height="11" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function RestrictedAccessModal({ open, onClose, mode = "login" }) {
  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-0 backdrop-blur-[3px] sm:items-center sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="restricted-access-title"
        className="relative w-full max-w-[420px] rounded-t-[28px] bg-white px-6 pb-7 pt-6 text-center shadow-2xl sm:rounded-[24px] sm:px-8 sm:py-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup dialog"
          className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full text-[#858b90] transition hover:bg-[#f3f3f2] hover:text-[#202326]"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
            <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#fff0e5] text-[#f56600]">
          <LockIcon />
        </div>
        <h2 id="restricted-access-title" className="mt-4 text-xl font-extrabold tracking-tight text-[#202326] sm:text-2xl">
          {mode === "membership" ? "Membership Belum Aktif" : "Akses Terbatas"}
        </h2>
        <p className="mx-auto mt-2 max-w-[330px] text-sm leading-6 text-[#737980]">
          {mode === "membership"
            ? "Aktifkan membership untuk menggunakan layanan Book PT, Jadwal Kelas, dan Latihan. Riwayat tetap dapat dilihat di Jadwal Saya."
            : "Silakan login terlebih dahulu untuk mengakses layanan Book PT, Jadwal Kelas, dan Latihan."}
        </p>

        <Link
          to={mode === "membership" ? "/membership" : "/login"}
          onClick={onClose}
          className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#ff6b00] px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#ed6100] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#ff6b00]/25"
        >
          {mode === "membership" ? "Lihat Paket Membership" : "Login Sekarang"}
        </Link>
        {mode === "membership" ? (
          <Link to="/jadwal-saya" onClick={onClose} className="mt-3 inline-flex min-h-10 items-center justify-center rounded-lg px-5 text-sm font-semibold text-[#6c7379] transition hover:bg-[#f7f7f6] hover:text-[#202326]">
            Lihat Jadwal Saya
          </Link>
        ) : (
          <button
            type="button"
            onClick={onClose}
            className="mt-3 inline-flex min-h-10 items-center justify-center rounded-lg px-5 text-sm font-semibold text-[#6c7379] transition hover:bg-[#f7f7f6] hover:text-[#202326]"
          >
            Nanti Saja
          </button>
        )}
      </section>
    </div>
  );
}

function LandingPage() {
  const [servicesOpen, setServicesOpen] = useState(false);
  const [accessModalOpen, setAccessModalOpen] = useState(false);
  const [accessModalMode, setAccessModalMode] = useState("login");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname !== "/" || !location.hash) return undefined;
    const targetId = location.hash.slice(1);
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [location.pathname, location.hash]);

  const requestAccess = (serviceLabel = "Book PT") => {
    const signedIn = (() => {
      try {
        return Boolean(window.sessionStorage.getItem(DEMO_MEMBER_SESSION_KEY));
      } catch {
        return false;
      }
    })();

    if (!signedIn) {
      setAccessModalMode("login");
      setAccessModalOpen(true);
      return;
    }

    const entitlement = getMemberPTEntitlement(readDemoMember());
    if (entitlement.membershipStatus !== "active") {
      setAccessModalMode("membership");
      setAccessModalOpen(true);
      return;
    }

    const serviceRoutes = {
      "Book PT": "/book-pt",
      "Jadwal Kelas": "/jadwal",
      "Latihan": "/latihan",
    };
    navigate(serviceRoutes[serviceLabel] || "/dashboard");
  };

  return (
    <div className="min-h-screen overflow-hidden bg-white text-[#202326] antialiased">
      <header className="relative z-10 border-b border-[#ededed] bg-white">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-4 px-5 py-4 sm:px-7 lg:px-8 lg:py-5">
          <Logo />

          <nav aria-label="Navigasi utama" className="hidden items-center gap-1 lg:flex">
            <ServiceDropdown
              isOpen={servicesOpen}
              setIsOpen={setServicesOpen}
              onRequestAccess={requestAccess}
            />
            <a
              href="#membership"
              className="whitespace-nowrap rounded-full px-3 py-2 text-[15px] font-semibold text-[#54595e] transition hover:bg-[#fff3e9] hover:text-[#f56600]"
            >
              Membership
            </a>
          </nav>

          <Link
            to="/login"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#ff6b00] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#ed6100] sm:px-5"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-4 w-4">
              <path d="M10 17l5-5-5-5M15 12H3M13 3h5a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Login / Masuk
          </Link>
        </div>

        <nav aria-label="Navigasi layanan" className="border-t border-[#f2f2f2] lg:hidden">
          <div className="mx-auto flex max-w-[1240px] items-center gap-2 px-5 py-3 sm:px-7">
            <ServiceDropdown
              mobile
              isOpen={servicesOpen}
              setIsOpen={setServicesOpen}
              onRequestAccess={requestAccess}
            />
            <a
              href="#membership"
              className="shrink-0 rounded-full border border-[#e9e9e9] px-4 py-2 text-sm font-medium text-[#555b60] transition hover:border-[#ff6b00] hover:text-[#ff6b00]"
            >
              Membership
            </a>
          </div>
        </nav>
      </header>

      <main>
        <section className="mx-auto max-w-[1240px] px-5 pb-16 pt-12 sm:px-7 sm:pb-20 sm:pt-16 lg:px-8 lg:pb-24 lg:pt-24">
          <div className="max-w-[850px]">
            <span className="inline-flex items-center rounded-full bg-[#fff0e4] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.1em] text-[#ed6500] sm:text-sm">
              <span className="mr-2 h-2 w-2 rounded-full bg-[#ff6b00]" />
              Membership BugarHub
            </span>
            <h1 className="mt-5 max-w-[820px] text-[38px] font-extrabold leading-[1.08] tracking-[-0.04em] sm:mt-6 sm:text-5xl lg:text-[64px]">
              Semua Kebutuhan Fitness Kamu, Dalam Satu Tempat.
            </h1>
            <p className="mt-5 max-w-[650px] text-base leading-7 text-[#747a80] sm:mt-6 sm:text-lg sm:leading-8">
              Booking Personal Trainer, ikuti kelas pilihan, dan kelola keanggotaan gym dengan proses praktis.
            </p>
            <a
              href="#membership"
              className="mt-7 inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#ff6b00] px-7 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#ed6100] sm:mt-8 sm:min-w-[260px] sm:text-base"
            >
              Pilih Membership
              <ArrowDown className="h-4 w-4" />
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </section>

        <section id="layanan" className="scroll-mt-24 border-y border-[#f1f1f1] bg-[#fcfbfa]">
          <div className="mx-auto max-w-[1240px] px-5 py-14 sm:px-7 sm:py-16 lg:px-8 lg:py-20">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Pilih Yang Kamu Butuhkan
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
              {services.map((service) => {
                const content = (
                  <>
                    <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-[#fff0e4] text-[#ff6b00] transition group-hover:bg-[#ff6b00] group-hover:text-white">
                      <ServiceIcon type={service.type} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-base font-extrabold text-[#25282b] sm:text-[17px]">
                        {service.title}
                      </span>
                      <span className="mt-1 block text-sm leading-6 text-[#747a80]">
                        {service.description}
                      </span>
                    </span>
                    <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-[#8b9095] transition group-hover:text-[#ff6b00]" />
                  </>
                );

                const cardClass = "group flex min-h-[112px] items-center gap-4 rounded-[22px] border border-[#e9e9e9] bg-white p-4 shadow-[0_8px_24px_rgba(25,25,25,0.035)] transition hover:-translate-y-1 hover:border-[#ffc18f] hover:shadow-md sm:p-5";

                if (service.restricted) {
                  return (
                    <button
                      type="button"
                      className={`${cardClass} w-full text-left`}
                      key={service.title}
                      onClick={() => requestAccess(service.title)}
                    >
                      {content}
                    </button>
                  );
                }

                return (
                  <a href={service.to} className={cardClass} key={service.title}>
                    {content}
                  </a>
                );
              })}
            </div>
          </div>
        </section>

        <section id="membership" className="scroll-mt-24 mx-auto max-w-[1240px] px-5 py-14 sm:px-7 sm:py-16 lg:px-8 lg:py-20">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#f56600] sm:text-sm">
                Pilih paketmu
              </span>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
                Pilih Paket Membership
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-[#747a80]">
              Pilih paket sesuai kebutuhan dan target latihanmu.
            </p>
          </div>

          <div className="mt-7 grid grid-cols-1 items-stretch gap-4 md:mt-9 md:grid-cols-3 md:gap-5 lg:gap-6">
            {plans.map((plan) => (
              <article
                key={plan.name}
                className={`relative flex h-full flex-col rounded-[26px] border p-5 shadow-[0_12px_30px_rgba(25,25,25,0.04)] transition sm:p-6 lg:p-7 ${
                  plan.featured
                    ? "border-2 border-[#ff6b00] bg-[#fff8f2]"
                    : "border-[#e8e8e8] bg-white hover:border-[#ffc18f]"
                }`}
              >
                {plan.featured && (
                  <span className="absolute right-5 top-5 rounded-full bg-[#ff6b00] px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-white sm:right-6 sm:top-6">
                    Pilihan populer
                  </span>
                )}

                <div className="flex items-start gap-3 pr-2">
                  <span
                    className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] ${
                      plan.featured ? "bg-[#ff6b00] text-white" : "bg-[#fff0e4] text-[#ff6b00]"
                    }`}
                  >
                    <ServiceIcon type={plan.icon} />
                  </span>
                  <div className="min-w-0 pt-0.5">
                    <h3 className="text-lg font-extrabold tracking-tight sm:text-xl">{plan.name}</h3>
                    <p className="mt-1.5 text-sm leading-6 text-[#747a80]">{plan.description}</p>
                  </div>
                </div>

                <div className="mt-6 flex items-baseline gap-1.5">
                  <span className="text-sm font-bold">Rp</span>
                  <span className="text-[42px] font-extrabold leading-none tracking-[-0.04em] sm:text-5xl">{plan.price}</span>
                  <span className="text-sm text-[#747a80]">/bln</span>
                </div>

                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm leading-6 text-[#363a3e]">
                      <CheckIcon featured={plan.featured} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/register"
                  state={{ selectedPlan: plan.name }}
                  className={`mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-extrabold transition ${
                    plan.featured
                      ? "bg-[#ff6b00] text-white hover:bg-[#ed6100]"
                      : "border border-[#dcdcdc] bg-white text-[#25282b] hover:border-[#ff6b00] hover:text-[#f56600]"
                  }`}
                >
                  Pilih Paket
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="rounded-t-[32px] bg-[#191c1f] text-white sm:rounded-t-[40px]">
        <div className="mx-auto max-w-[1240px] px-5 py-10 sm:px-7 sm:py-12 lg:px-8 lg:py-16">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-12">
            <div>
              <Logo tone="light" />
              <h2 className="mt-6 text-2xl font-extrabold tracking-tight sm:text-3xl">
                Hubungi Admin &amp; Pendaftaran
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-[#aeb3b8] sm:text-base">
                Tanya membership, cek jadwal kelas, atau temukan teman latihan baru di kanal resmi BugarHub.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5 lg:justify-end">
              {socialLinks.map((social) => {
                const className = "inline-flex min-h-10 items-center gap-2 rounded-full border border-[#34383c] bg-[#22262a] px-4 py-2 text-sm font-semibold text-white transition hover:border-[#ff6b00] hover:bg-[#2a2e32]";
                const content = (
                  <>
                    <span className="font-bold text-[#ff6b00]" aria-hidden="true">{social.symbol}</span>
                    {social.label}
                    <ArrowUpRight className="h-3.5 w-3.5 text-[#aeb3b8]" />
                  </>
                );

                return social.href ? (
                  <a key={social.label} className={className} href={social.href} target="_blank" rel="noreferrer">
                    {content}
                  </a>
                ) : (
                  <span
                    key={social.label}
                    className={`${className} cursor-default`}
                    title={`Tambahkan URL resmi ${social.label} saat sudah tersedia`}
                    aria-label={`${social.label} (tautan belum diatur)`}
                  >
                    {content}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="mt-10 border-t border-[#303438] pt-5 text-center text-xs text-[#82888e] sm:mt-12 sm:pt-6">
            © 2026 BugarHub. Bergerak lebih kuat, setiap hari.
          </div>
        </div>
      </footer>

      <RestrictedAccessModal
        open={accessModalOpen}
        mode={accessModalMode}
        onClose={() => setAccessModalOpen(false)}
      />
    </div>
  );
}

export default LandingPage;
