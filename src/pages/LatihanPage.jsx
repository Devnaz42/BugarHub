import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../components/Logo";
import MemberHeader from "../components/MemberHeader";

function Icon({ name, className = "h-5 w-5" }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className,
    "aria-hidden": true,
  };

  const shapes = {
    chevron: <path d="m9 5 7 7-7 7" />,
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    dumbbell: <><path d="m6.5 6.5 11 11M4 9l5-5M15 20l5-5M3 7l4-4M17 21l4-4M2 10l2-2M14 22l2-2M8 2l2 2M20 14l2 2" /></>,
    person: <><circle cx="12" cy="4" r="1.7" /><path d="m12 7-1 5-4 2M12 8l4 3 3-1M11 12l-1 6M11 18l-3 3M11 18l4 3" /></>,
    flame: <path d="M12 22c4.4 0 7-3 7-7 0-2.4-1.2-4.4-3.5-6.5-.1 2-1.1 3-2 3.5C13.5 7.3 11.5 4.5 9 2c.3 4.3-1 6.4-2.5 8.5C5.3 12.2 5 13.5 5 15c0 4.1 2.8 7 7 7Z" />,
    stretch: <><circle cx="12" cy="4" r="1.7" /><path d="M12 7v6M12 9 7 7M12 9l5-3M12 13l-4 5M12 13l4 5M8 18l-2 3M16 18l2 3" /></>,
    list: <><path d="m8 6 2 2 4-4M8 12l2 2 4-4M8 18l2 2 4-4" /><path d="M18 6h3M18 12h3M18 18h3M3 6h1M3 12h1M3 18h1" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    help: <><circle cx="12" cy="12" r="9" /><path d="M9.6 9a2.5 2.5 0 0 1 4.8.8c0 1.7-2.4 2.1-2.4 4M12 17.5h.01" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    check: <path d="m5 12 4 4L19 6" />,
  };

  return <svg {...common}>{shapes[name] || shapes.arrow}</svg>;
}

const programs = [
  {
    id: "upper-body",
    title: "Upper Body Strength",
    count: "8 latihan",
    duration: "45 menit",
    icon: "dumbbell",
    tint: "bg-[#fff0e5] text-[#ff6b00]",
    description: "Bangun kekuatan tubuh bagian atas melalui gerakan yang terstruktur dan berfokus pada teknik.",
    exercises: ["Push-up", "Dumbbell row", "Shoulder press", "Biceps curl", "Triceps extension"],
  },
  {
    id: "lower-core",
    title: "Lower Body & Core",
    count: "10 latihan",
    duration: "50 menit",
    icon: "person",
    tint: "bg-[#fff4df] text-[#ff8a00]",
    description: "Latihan kaki dan otot inti untuk membantu stabilitas, keseimbangan, dan kekuatan dasar.",
    exercises: ["Bodyweight squat", "Reverse lunge", "Glute bridge", "Plank", "Dead bug"],
  },
  {
    id: "cardio",
    title: "Cardio Fat Burn",
    count: "7 latihan",
    duration: "30 menit",
    icon: "flame",
    tint: "bg-[#fff0e9] text-[#ff6b00]",
    description: "Rangkaian kardio untuk melatih daya tahan. Sesuaikan intensitas dengan kondisi tubuhmu.",
    exercises: ["March in place", "Jumping jack", "High knees", "Mountain climber", "Step touch"],
  },
  {
    id: "flexibility",
    title: "Flexibility",
    count: "12 gerakan",
    duration: "25 menit",
    icon: "stretch",
    tint: "bg-[#fff0e5] text-[#ff6b00]",
    description: "Gerakan mobilitas dan peregangan untuk membantu rentang gerak dan pemulihan setelah latihan.",
    exercises: ["Cat-cow stretch", "Standing quad stretch", "Hamstring stretch", "Child's pose", "Chest opener"],
  },
];

function MemberFooter() {
  const socialLinks = [
    { label: "WhatsApp", icon: "◉" },
    { label: "Instagram", icon: "◎" },
    { label: "TikTok", icon: "♪" },
    { label: "YouTube", icon: "▷" },
  ];

  return (
    <footer id="contact" className="rounded-t-[30px] bg-[#191c1e] text-white sm:rounded-t-[38px]">
      <div className="mx-auto grid max-w-[1440px] gap-8 px-5 py-9 sm:px-8 sm:py-11 lg:grid-cols-[1.3fr_1fr] lg:items-center lg:gap-12 lg:px-10 xl:px-14">
        <div>
          <Logo tone="light" />
          <h2 className="mt-5 text-2xl font-black tracking-tight sm:text-3xl">Hubungi Admin &amp; Pendaftaran</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/65 sm:text-base sm:leading-7">
            Tanya membership, cek jadwal kelas, atau temukan teman latihan baru di kanal resmi BugarHub.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {socialLinks.map((item) => (
            <span key={item.label} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/90">
              <span className="text-base text-[#ff6b00]">{item.icon}</span>{item.label}
              <span className="ml-auto text-white/45">↗</span>
            </span>
          ))}
        </div>
        <p className="border-t border-white/10 pt-5 text-center text-xs text-white/45 lg:col-span-2">
          © {new Date().getFullYear()} BugarHub. Bergerak lebih kuat, setiap hari.
        </p>
      </div>
    </footer>
  );
}

function ProgramCard({ program, onOpen }) {
  return (
    <article className="flex min-h-[285px] flex-col rounded-[28px] border border-[#e4e6e6] bg-white p-5 shadow-[0_8px_28px_rgba(20,24,28,0.035)] transition hover:-translate-y-0.5 hover:border-[#ffd0ae] hover:shadow-[0_12px_30px_rgba(20,24,28,0.06)] sm:min-h-[300px] sm:p-6 lg:min-h-[320px]">
      <div className={`flex h-16 w-16 items-center justify-center rounded-[22px] ${program.tint}`}>
        <Icon name={program.icon} className="h-8 w-8" />
      </div>
      <h2 className="mt-5 text-lg font-bold leading-snug tracking-tight text-[#292d30] sm:text-xl">{program.title}</h2>
      <div className="mt-4 space-y-2.5 text-sm font-semibold text-[#737a80] sm:text-base">
        <p className="flex items-center gap-2.5"><Icon name="list" className="h-5 w-5 shrink-0" />{program.count}</p>
        <p className="flex items-center gap-2.5"><Icon name="clock" className="h-5 w-5 shrink-0" />{program.duration}</p>
      </div>
      <button
        type="button"
        onClick={() => onOpen(program)}
        className="group mt-auto flex w-fit items-center gap-2 pt-6 text-base font-semibold text-[#f56600] transition hover:text-[#d95400] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#ff6b00]/20"
      >
        Lihat Detail <Icon name="arrow" className="h-5 w-5 transition-transform group-hover:translate-x-1" />
      </button>
    </article>
  );
}

function ProgramDetailModal({ program, onClose }) {
  if (!program) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#101416]/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <section role="dialog" aria-modal="true" aria-labelledby="program-detail-title" className="my-auto w-full max-w-xl rounded-[28px] bg-white p-5 shadow-2xl sm:p-7">
        <div className="flex items-start gap-4">
          <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${program.tint}`}>
            <Icon name={program.icon} className="h-7 w-7" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#f56600]">Program latihan</p>
            <h2 id="program-detail-title" className="mt-1 text-2xl font-black tracking-tight text-[#202326]">{program.title}</h2>
            <p className="mt-2 text-sm leading-6 text-[#737a80]">{program.description}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup detail program" className="rounded-full border border-[#e4e6e6] p-2 text-[#737a80] transition hover:bg-[#f7f7f5]">
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-[#f8f8f6] p-4">
            <p className="text-xs font-semibold text-[#737a80]">Jumlah program</p>
            <p className="mt-1 font-extrabold text-[#292d30]">{program.count}</p>
          </div>
          <div className="rounded-2xl bg-[#f8f8f6] p-4">
            <p className="text-xs font-semibold text-[#737a80]">Estimasi durasi</p>
            <p className="mt-1 font-extrabold text-[#292d30]">{program.duration}</p>
          </div>
        </div>

        <h3 className="mt-6 text-base font-extrabold text-[#292d30]">Contoh gerakan</h3>
        <ul className="mt-3 space-y-2">
          {program.exercises.map((exercise, index) => (
            <li key={exercise} className="flex items-center gap-3 rounded-xl border border-[#eceeed] px-3.5 py-3 text-sm text-[#4e555b]">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#fff0e5] text-xs font-extrabold text-[#f56600]">{String(index + 1).padStart(2, "0")}</span>
              {exercise}
            </li>
          ))}
        </ul>
        <div className="mt-5 flex items-start gap-2.5 rounded-2xl bg-[#fff7f0] p-4 text-sm leading-6 text-[#7d6a5b]">
          <Icon name="help" className="mt-0.5 h-5 w-5 shrink-0 text-[#ff6b00]" />
          <p>Ini contoh konten untuk pratinjau frontend. Sesuaikan beban dan tempo dengan kemampuanmu, dan istirahat bila diperlukan.</p>
        </div>
        <button type="button" onClick={onClose} className="mt-5 flex h-12 w-full items-center justify-center rounded-full bg-[#ff6b00] px-5 text-sm font-extrabold text-white transition hover:bg-[#ef6100] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#ff6b00]/25">
          Mengerti
        </button>
      </section>
    </div>
  );
}

export default function LatihanPage() {
  const [selectedProgram, setSelectedProgram] = useState(null);

  return (
    <main className="min-h-screen bg-[#fbfbfa] text-[#202326]">
      <MemberHeader />

      <div className="mx-auto max-w-[1440px] px-5 pb-12 pt-7 sm:px-8 sm:pt-10 lg:px-10 lg:pt-12 xl:px-14">
        <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-[#737a80] sm:text-base">
          <Link to="/dashboard" className="transition hover:text-[#f56600]">Layanan</Link>
          <Icon name="chevron" className="h-4 w-4" />
          <span className="text-[#f56600]">Latihan</span>
        </div>

        <section className="max-w-4xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#f56600]">Program kebugaran</p>
          <h1 className="mt-2 text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">Program &amp; Panduan Latihan</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-[#737a80] sm:text-lg sm:leading-8">
            Ikuti program terstruktur untuk membangun kekuatan, daya tahan, dan mobilitas.
          </p>
        </section>

        <section className="mt-7 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-5 lg:grid-cols-2 xl:grid-cols-4" aria-label="Daftar program latihan">
          {programs.map((program) => <ProgramCard key={program.id} program={program} onOpen={setSelectedProgram} />)}
        </section>

        <div className="mt-6 flex items-start gap-3 rounded-[24px] bg-[#f6f6f4] p-4 text-sm leading-6 text-[#737a80] sm:mt-7 sm:gap-4 sm:p-5 sm:text-base">
          <Icon name="help" className="mt-0.5 h-6 w-6 shrink-0 text-[#ff6b00]" />
          <p>Sesuaikan beban dan tempo dengan kemampuanmu. Istirahat bila diperlukan.</p>
        </div>
        <p className="mt-4 text-xs leading-5 text-[#9a9fa3] sm:text-sm">Catatan: daftar gerakan dan durasi merupakan contoh untuk pratinjau antarmuka, bukan program latihan individual.</p>
      </div>

      <MemberFooter />
      <ProgramDetailModal program={selectedProgram} onClose={() => setSelectedProgram(null)} />
    </main>
  );
}
