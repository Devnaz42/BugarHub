import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import MemberHeader from "../components/MemberHeader";
import { getDemoMemberKey, readDemoMember } from "../utils/demoData";
import { readTrainerClasses, TRAINER_CLASSES_STORAGE_KEY, TRAINER_CLASSES_UPDATED_EVENT } from "../utils/trainerClassSchedule";
import { CLASS_RESERVATIONS_UPDATED_EVENT, createClassReservation, getClassCapacitySnapshot, getClassReservations } from "../utils/classReservationData";

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
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    chevron: <path d="m9 5 7 7-7 7" />,
    calendar: <><rect x="3.5" y="5" width="17" height="15.5" rx="2.2" /><path d="M7.5 3v4M16.5 3v4M3.5 9.5h17" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>,
    sun: <><circle cx="12" cy="12" r="3.2" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
    activity: <path d="M3 12h4l3-8 4 16 3-8h4" />,
    heart: <><path d="M20.8 8.8c0 5.2-8.8 11-8.8 11s-8.8-5.8-8.8-11a4.6 4.6 0 0 1 8.8-1.7 4.6 4.6 0 0 1 8.8 1.7Z" /><path d="M4.5 12h4l1.5-3 3 6 1.5-3h5" /></>,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    person: <><circle cx="12" cy="8" r="3.4" /><path d="M5 20c.4-3.5 2.9-5.4 7-5.4s6.6 1.9 7 5.4" /></>,
  };

  return <svg {...common}>{shapes[name] || shapes.arrow}</svg>;
}

function getLocalDateISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDateOptions(trainerClasses = []) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = getLocalDateISO(today);
  const dateValues = new Set();

  // Keep the original quick-pick dates, then include any upcoming class date
  // published by PT/Coach so members can navigate to it.
  Array.from({ length: 4 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);
    dateValues.add(getLocalDateISO(date));
  });

  trainerClasses.forEach((item) => {
    if (item?.date && item.date >= todayISO && item.status !== "cancelled" && item.status !== "Dibatalkan") {
      dateValues.add(item.date);
    }
  });

  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  return [...dateValues].sort().map((value) => {
    const date = new Date(`${value}T12:00:00`);
    return {
      value,
      label: value === todayISO ? "Hari Ini" : `${dayNames[date.getDay()]} ${String(date.getDate()).padStart(2, "0")}`,
      longLabel: new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(date),
    };
  });
}

const DEFAULT_CLASSES = [
  {
    id: "morning-yoga",
    name: "Morning Yoga",
    time: "07:00",
    duration: "60 min",
    studio: "Studio Lotus",
    floor: "Lantai 2",
    status: "Tersedia",
    statusType: "available",
    icon: "sun",
    description: "Awali hari dengan gerakan dan pernapasan yang lebih mindful.",
  },
  {
    id: "hiit-cardio",
    name: "HIIT Cardio",
    time: "17:30",
    duration: "45 min",
    studio: "Studio Energy",
    floor: "Lantai 1",
    status: "Hampir penuh",
    statusType: "limited",
    icon: "activity",
    description: "Latihan interval intensitas tinggi untuk meningkatkan stamina.",
  },
  {
    id: "core-pilates",
    name: "Core Pilates",
    time: "19:00",
    duration: "50 min",
    studio: "Studio Balance",
    floor: "Lantai 2",
    status: "Tersedia",
    statusType: "available",
    icon: "heart",
    description: "Latihan kontrol, postur, dan kekuatan otot inti.",
  },
];

function getDurationLabel(startTime, endTime) {
  if (!startTime || !endTime) return "60 min";
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  const minutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
  return minutes > 0 ? `${minutes} min` : "60 min";
}

function mapTrainerClass(classItem, reservations = []) {
  const snapshot = getClassCapacitySnapshot(classItem, reservations);
  const capacity = Number(classItem.capacity || 0);
  const students = snapshot.accepted;
  const remaining = snapshot.remaining;
  const statusType = snapshot.isFull ? "full" : remaining !== null && remaining <= 2 ? "limited" : "available";
  const category = String(classItem.category || "Fitness");
  const icon = /yoga/i.test(category) ? "sun" : /pilates|balance|flexibility/i.test(category) ? "heart" : "activity";
  return {
    id: String(classItem.id),
    name: classItem.title || category,
    category,
    time: classItem.startTime || "09:00",
    endTime: classItem.endTime || "10:00",
    duration: getDurationLabel(classItem.startTime, classItem.endTime),
    studio: classItem.room || "Gym BugarHub",
    floor: classItem.trainerName ? `Coach ${classItem.trainerName}` : "Jadwal PT/Coach",
    status: statusType === "full" ? "Penuh" : statusType === "limited" ? "Hampir penuh" : "Tersedia",
    statusType,
    icon,
    description: classItem.description || `Kelas ${category} bersama PT/Coach BugarHub.`,
    dateISO: classItem.date,
    capacity,
    students,
    pendingReservations: snapshot.requested,
    reservableSeats: remaining,
    trainerId: classItem.trainerId || "trainer-001",
    trainerName: classItem.trainerName || "PT/Coach BugarHub",
    isTrainerPublished: true,
  };
}

function JadwalKelasPage() {
  const [member] = useState(readDemoMember);
  const navigate = useNavigate();
  const memberKey = getDemoMemberKey(member);
  const [trainerClasses, setTrainerClasses] = useState(readTrainerClasses);
  const [classReservations, setClassReservations] = useState(getClassReservations);
  const dateOptions = useMemo(() => getDateOptions(trainerClasses), [trainerClasses]);
  const [selectedDate, setSelectedDate] = useState(() => getLocalDateISO(new Date()));
  const [selectedClass, setSelectedClass] = useState(null);
  const [reservationMessage, setReservationMessage] = useState("");
  const [reservationSaved, setReservationSaved] = useState(false);

  useEffect(() => {
    const refreshClasses = (event) => {
      if (event?.key && event.key !== TRAINER_CLASSES_STORAGE_KEY) return;
      setTrainerClasses(readTrainerClasses());
    };
    const refreshReservations = () => setClassReservations(getClassReservations());
    window.addEventListener(TRAINER_CLASSES_UPDATED_EVENT, refreshClasses);
    window.addEventListener(CLASS_RESERVATIONS_UPDATED_EVENT, refreshReservations);
    window.addEventListener("storage", refreshClasses);
    window.addEventListener("storage", refreshReservations);
    return () => {
      window.removeEventListener(TRAINER_CLASSES_UPDATED_EVENT, refreshClasses);
      window.removeEventListener(CLASS_RESERVATIONS_UPDATED_EVENT, refreshReservations);
      window.removeEventListener("storage", refreshClasses);
      window.removeEventListener("storage", refreshReservations);
    };
  }, []);

  useEffect(() => {
    if (!dateOptions.some((date) => date.value === selectedDate) && dateOptions[0]) {
      setSelectedDate(dateOptions[0].value);
    }
  }, [dateOptions, selectedDate]);

  const activeDate = dateOptions.find((date) => date.value === selectedDate) || dateOptions[0];
  const memberTrainerClasses = useMemo(() => trainerClasses
    .filter((item) => item?.date && item.date === selectedDate && item.status !== "cancelled" && item.status !== "Dibatalkan")
    .map((item) => mapTrainerClass(item, classReservations)), [trainerClasses, selectedDate, classReservations]);
  const visibleClasses = useMemo(() => [...DEFAULT_CLASSES, ...memberTrainerClasses], [memberTrainerClasses]);

  function openReservation(classItem) {
    setSelectedClass(classItem);
    setReservationMessage("");
    setReservationSaved(false);
  }

  function closeReservation() {
    setSelectedClass(null);
    setReservationMessage("");
    setReservationSaved(false);
  }

  function handleReservation() {
    if (!selectedClass) return;

    const reservationDateISO = selectedClass.dateISO || activeDate.value;
    const dateForReservation = dateOptions.find((date) => date.value === reservationDateISO);
    const reservationDateLabel = dateForReservation?.longLabel || new Intl.DateTimeFormat("id-ID", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    }).format(new Date(`${reservationDateISO}T12:00:00`));

    const classSource = trainerClasses.find((item) => String(item.id) === String(selectedClass.id));
    if (selectedClass.isTrainerPublished && classSource) {
      const snapshot = getClassCapacitySnapshot(classSource, classReservations);
      if (snapshot.isFull) {
        setReservationSaved(false);
        setReservationMessage("Maaf, kuota kelas sudah penuh. Pilih kelas atau tanggal lain.");
        return;
      }
    }

    const result = createClassReservation({
      member,
      memberKey,
      classItem: selectedClass,
      dateLabel: reservationDateLabel,
    });

    if (!result.ok) {
      setReservationSaved(false);
      if (result.reason === "duplicate") {
        setReservationMessage("Kamu sudah terdaftar pada kelas ini di tanggal tersebut.");
      } else if (result.reason === "full") {
        setReservationMessage("Maaf, kuota kelas sudah penuh. Pilih kelas atau tanggal lain.");
      } else {
        setReservationMessage("Reservasi tidak dapat disimpan. Periksa penyimpanan browser, lalu coba lagi.");
      }
      setClassReservations(getClassReservations());
      return;
    }

    setClassReservations(getClassReservations());
    setReservationSaved(true);
    setReservationMessage(`Kamu berhasil bergabung dengan ${selectedClass.name} pada ${reservationDateLabel}. Tempat langsung tercatat selama kuota tersedia.`);
  }

  return (
    <main className="min-h-screen bg-[#fbfbfa] text-[#202326]">
      <MemberHeader />

      <div className="mx-auto max-w-[1440px] px-5 pb-12 pt-7 sm:px-8 sm:pt-10 lg:px-10 lg:pt-12 xl:px-14">
        <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-[#737a80] sm:text-base">
          <Link to="/dashboard" className="transition hover:text-[#f56600]">Layanan</Link>
          <Icon name="chevron" className="h-4 w-4" />
          <span className="text-[#f56600]">Jadwal Kelas</span>
        </div>

        <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="max-w-3xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#f56600]">Kelas grup</p>
            <h1 className="mt-2 text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">Jadwal Kelas Harian</h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-[#737a80] sm:text-lg sm:leading-8">
              Temukan kelas favoritmu dan amankan tempat sebelum kuota penuh.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 self-start rounded-full border border-[#f2d9c7] bg-[#fff5ed] px-4 py-2.5 text-sm font-semibold text-[#b94e00] md:self-auto">
            <Icon name="calendar" className="h-4 w-4" />
            {activeDate.longLabel}
          </div>
        </section>

        <section className="mt-7" aria-label="Pilih tanggal kelas">
          <div className="flex flex-wrap gap-2.5 sm:gap-3">
            {dateOptions.map((date) => {
              const isActive = date.value === selectedDate;
              return (
                <button
                  key={date.value}
                  type="button"
                  onClick={() => setSelectedDate(date.value)}
                  aria-pressed={isActive}
                  className={`min-h-11 rounded-full border px-5 py-2.5 text-sm font-bold transition sm:min-h-12 sm:px-6 sm:text-base ${
                    isActive
                      ? "border-[#ff6b00] bg-[#ff6b00] text-white shadow-md shadow-[#ff6b00]/15"
                      : "border-[#e1e3e4] bg-white text-[#697077] hover:border-[#ffc49e] hover:bg-[#fff8f3] hover:text-[#c95700]"
                  }`}
                >
                  {date.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-6 space-y-4 sm:mt-7 sm:space-y-5" aria-label="Daftar kelas">
          {visibleClasses.map((classItem) => (
            <article key={classItem.id} className="grid gap-5 rounded-[26px] border border-[#e4e5e5] bg-white p-5 shadow-[0_8px_28px_rgba(20,24,28,0.035)] transition hover:border-[#ffd0b1] sm:p-6 lg:grid-cols-[145px_minmax(0,1fr)_auto] lg:items-center lg:gap-7 lg:p-7">
              <div className="flex items-center gap-4 border-b border-[#e7e8e8] pb-4 lg:flex-col lg:justify-center lg:gap-1 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-7">
                <div className="text-3xl font-black tracking-tight text-[#202326] sm:text-4xl">{classItem.time}</div>
                <div className="text-sm font-medium text-[#7b8287] sm:text-base">{classItem.duration}</div>
              </div>

              <div className="flex min-w-0 items-start gap-4 sm:gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#fff0e5] text-[#ff6b00] sm:h-16 sm:w-16">
                  <Icon name={classItem.icon} className="h-7 w-7 sm:h-8 sm:w-8" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">{classItem.name}</h2>
                  <p className="mt-1 text-sm text-[#737a80] sm:text-base">{classItem.studio}{classItem.floor ? <><span className="mx-1">·</span>{classItem.floor}</> : null}</p>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[#737a80]">{classItem.description}</p>
                  <p className={`mt-3 inline-flex items-center gap-2 text-sm font-semibold sm:text-base ${classItem.statusType === "full" ? "text-[#c43c3c]" : classItem.statusType === "limited" ? "text-[#d58a00]" : "text-[#15966a]"}`}>
                    <span className={`h-2.5 w-2.5 rounded-full ${classItem.statusType === "full" ? "bg-[#dc4545]" : classItem.statusType === "limited" ? "bg-[#e5a000]" : "bg-[#19a875]"}`} />
                    {classItem.status}{classItem.isTrainerPublished && classItem.capacity > 0 ? ` · ${classItem.reservableSeats} tempat tersedia` : ""}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => openReservation(classItem)}
                disabled={classItem.statusType === "full"}
                className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#ff6b00] px-6 py-3 text-sm font-extrabold text-white shadow-md shadow-[#ff6b00]/15 transition hover:-translate-y-0.5 hover:bg-[#ed6100] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#ff6b00]/25 active:translate-y-0 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none disabled:hover:translate-y-0 sm:text-base lg:min-w-[165px] lg:justify-between"
              >
                {classItem.statusType === "full" ? "Kelas Penuh" : "Reservasi"} {classItem.statusType === "full" ? null : <Icon name="arrow" className="h-5 w-5" />}
              </button>
            </article>
          ))}
        </section>

        <aside className="mt-6 flex items-start gap-3 rounded-2xl bg-[#f4f5f4] px-4 py-4 text-sm leading-6 text-[#737a80] sm:items-center sm:px-5 sm:text-base">
          <Icon name="info" className="mt-0.5 h-5 w-5 shrink-0 text-[#ff6b00] sm:mt-0" />
          <p>Datang 10 menit lebih awal untuk check-in kelas.</p>
        </aside>
      </div>

      <footer id="contact" className="rounded-t-[30px] bg-[#191c1e] text-white sm:rounded-t-[38px]">
        <div className="mx-auto grid max-w-[1440px] gap-8 px-5 py-9 sm:px-8 sm:py-11 lg:grid-cols-[1.3fr_1fr] lg:items-center lg:gap-12 lg:px-10 xl:px-14">
          <div>
            <Logo tone="light" />
            <h2 className="mt-5 text-2xl font-black tracking-tight sm:text-3xl">Hubungi Admin &amp; Pendaftaran</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/65 sm:text-base sm:leading-7">Tanya membership, cek jadwal kelas, atau temukan teman latihan baru di kanal resmi BugarHub.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              ["WhatsApp", "◉"],
              ["Instagram", "◎"],
              ["TikTok", "♪"],
              ["YouTube", "▷"],
            ].map(([label, symbol]) => (
              <a key={label} href="#contact" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-bold transition hover:border-[#ff6b00]/60 hover:bg-white/10 sm:text-base">
                <span className="font-black text-[#ff6b00]">{symbol}</span>{label}<span className="ml-auto text-white/45">↗</span>
              </a>
            ))}
          </div>
        </div>
        <div className="mx-auto max-w-[1440px] border-t border-white/10 px-5 py-5 text-center text-xs text-white/45 sm:px-8 sm:text-sm lg:px-10 xl:px-14">© 2026 BugarHub. Bergerak lebih kuat, setiap hari.</div>
      </footer>

      {selectedClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111416]/60 px-4 py-6 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeReservation(); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="reservation-title" className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-[28px] bg-white p-5 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#f56600]">Reservasi kelas</p>
                <h2 id="reservation-title" className="mt-1 text-2xl font-black sm:text-3xl">{selectedClass.name}</h2>
                <p className="mt-2 text-sm leading-6 text-[#737a80]">Pastikan jadwal sesuai. Jika kuota masih tersedia, kamu langsung terdaftar di kelas.</p>
              </div>
              <button type="button" onClick={closeReservation} aria-label="Tutup dialog" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e6e7e8] text-[#555d63] hover:bg-[#f6f7f8]"><Icon name="close" /></button>
            </div>

            <div className="mt-5 rounded-2xl bg-[#fff5ed] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#ff6b00]"><Icon name={selectedClass.icon} className="h-6 w-6" /></div>
                <div>
                  <p className="font-extrabold">{selectedClass.time} <span className="mx-1 text-[#a0a5a8]">·</span> {selectedClass.duration}</p>
                  <p className="mt-1 text-sm text-[#737a80]">{selectedClass.studio} · {selectedClass.floor}</p>
                </div>
              </div>
              <div className="mt-4 border-t border-[#f1d9c7] pt-3 text-sm text-[#737a80]">Tanggal pilihan: <span className="font-bold text-[#202326]">{activeDate.longLabel}</span></div>
            </div>

            {reservationMessage && <div role="status" className={`mt-4 rounded-xl border p-3.5 text-sm leading-6 ${reservationSaved ? "border-[#bfe8d4] bg-[#effbf5] text-[#16764d]" : "border-[#ffd0ae] bg-[#fff5ed] text-[#9d4300]"}`}>{reservationMessage}</div>}
            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={closeReservation} className="rounded-full border border-[#e1e3e4] px-5 py-3 text-sm font-bold text-[#444b50] transition hover:bg-[#f7f7f5]">Tutup</button>
              {reservationSaved ? (
                <button type="button" onClick={() => navigate("/jadwal-saya")} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#ff6b00] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#ed6100] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#ff6b00]/25">Lihat Jadwal Saya <Icon name="arrow" className="h-4 w-4" /></button>
              ) : (
                <button type="button" onClick={handleReservation} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#ff6b00] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#ed6100] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#ff6b00]/25">Gabung Kelas <Icon name="arrow" className="h-4 w-4" /></button>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

export default JadwalKelasPage;
