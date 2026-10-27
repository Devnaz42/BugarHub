import { useState } from "react";
import { Link } from "react-router-dom";
import MemberHeader from "../components/MemberHeader";
import { readDemoMember, readDemoMemberSettings, writeDemoMemberSettings } from "../utils/demoData";

function Icon({ name, className = "h-5 w-5" }) {
  const paths = {
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    calendar: <><rect x="3.5" y="5" width="17" height="15.5" rx="2.2" /><path d="M7.5 3v4M16.5 3v4M3.5 9.5h17" /></>,
    activity: <path d="M3 12h4l3-8 4 16 3-8h4" />,
    shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" /><path d="m9 12 2 2 4-4" /></>,
    save: <><path d="M5 3h12l4 4v14H3V3Z" /><path d="M7 3v6h10V3M7 21v-8h10v8" /></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">{paths[name] || paths.bell}</svg>;
}

const preferenceItems = [
  { key: "weeklyReport", title: "Laporan mingguan", description: "Ringkasan aktivitas latihan dan jadwal setiap minggu.", icon: "activity" },
  { key: "classReminders", title: "Pengingat jadwal kelas", description: "Pengingat untuk kelas yang sudah kamu pesan.", icon: "calendar" },
  { key: "workoutTips", title: "Tips dan panduan latihan", description: "Informasi program latihan dan kebiasaan sehat.", icon: "bell" },
  { key: "accountAlerts", title: "Pemberitahuan akun", description: "Informasi penting mengenai akun dan membership.", icon: "shield" },
];

export default function MemberSettingsPage() {
  const [member] = useState(readDemoMember);
  const [settings, setSettings] = useState(() => readDemoMemberSettings(readDemoMember()));
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState("success");

  function toggle(key) {
    setSettings((current) => ({ ...current, [key]: !current[key] }));
    setStatus("");
  }

  function saveSettings(event) {
    event.preventDefault();
    const saved = writeDemoMemberSettings(member, settings);
    setStatusType(saved ? "success" : "error");
    setStatus(saved ? "Preferensi demo berhasil disimpan di browser ini." : "Preferensi belum dapat disimpan. Coba lagi atau periksa penyimpanan browser.");
  }

  return (
    <main className="min-h-screen bg-[#f6f7f8] text-[#202326]">
      <MemberHeader />
      <div className="mx-auto max-w-[1000px] px-5 pb-14 pt-7 sm:px-8 sm:pt-10 lg:px-10 lg:pt-12">
        <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-[#737a80]"><Link to="/dashboard" className="transition hover:text-[#f56600]">Dashboard</Link><span aria-hidden="true">›</span><span className="text-[#f56600]">Settings</span></div>
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#f56600]">Preferences</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Settings</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#737a80] sm:text-base">Atur preferensi akun dan pemberitahuan BugarHub.</p>

        <form onSubmit={saveSettings} className="mt-7 rounded-[24px] border border-[#e5e7e9] bg-white p-5 shadow-sm sm:p-7">
          <div className="flex items-start gap-3 border-b border-[#eceeef] pb-5"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff0e5] text-[#f56600]"><Icon name="bell" /></span><div><h2 className="text-lg font-black">Notifikasi</h2><p className="mt-1 text-sm text-[#7c8389]">Pilih jenis pemberitahuan yang ingin kamu terima.</p></div></div>
          <div className="divide-y divide-[#eceeef]">
            {preferenceItems.map((item) => (
              <label key={item.key} className="flex cursor-pointer items-start gap-4 py-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f5f6f6] text-[#687179]"><Icon name={item.icon} /></span>
                <span className="min-w-0 flex-1"><span className="block text-sm font-bold text-[#30363b]">{item.title}</span><span className="mt-1 block text-sm leading-5 text-[#7a8085]">{item.description}</span></span>
                <input type="checkbox" checked={Boolean(settings[item.key])} onChange={() => toggle(item.key)} className="mt-1 h-4 w-4 accent-[#ff6b00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6b00]/40" />
              </label>
            ))}
          </div>
          {status && <div role="status" className={`mt-4 rounded-xl border px-4 py-3 text-sm ${statusType === "success" ? "border-[#afe8cb] bg-[#effbf5] text-[#147a4c]" : "border-[#ffc8b5] bg-[#fff7f3] text-[#a34200]"}`}>{status}</div>}
          <div className="mt-5 flex justify-end border-t border-[#eceeef] pt-5"><button type="submit" className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#ff6b00] px-5 text-sm font-extrabold text-white transition hover:bg-[#ec6100] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#ff6b00]/25"><Icon name="save" className="h-4 w-4" />Save Preferences</button></div>
        </form>

        <section className="mt-5 rounded-[24px] border border-[#e5e7e9] bg-white p-5 shadow-sm sm:p-7">
          <div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff0e5] text-[#f56600]"><Icon name="shield" /></span><div><h2 className="text-lg font-black">Account & Security</h2><p className="mt-1 text-sm leading-6 text-[#7c8389]">Akun demo kamu menggunakan simulasi login frontend. Penggantian password, verifikasi akun, dan pengaturan keamanan sungguhan akan tersedia setelah autentikasi backend dihubungkan.</p><p className="mt-3 text-xs text-[#989ea3]">Signed in as {member.email || member.name}. Preference changes are stored locally in this browser.</p></div></div>
        </section>
        <p className="mt-5 rounded-xl border border-[#f3d2bd] bg-[#fff8f3] px-4 py-3 text-xs leading-5 text-[#925b39]">Catatan: preferensi ini disimpan di localStorage browser dan belum mengirim notifikasi sungguhan.</p>
      </div>
    </main>
  );
}
