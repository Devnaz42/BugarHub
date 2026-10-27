import { useMemo, useState } from "react";
import AdminSidebar, { AdminIcon } from "../../components/AdminSidebar";

const initialMembers = [
  { id: 1, name: "Andi Pratama", email: "andi.pratama@gmail.com", tier: "Plus", status: "Aktif" },
  { id: 2, name: "Nadia Putri", email: "nadia.putri@gmail.com", tier: "Premium", status: "Aktif" },
  { id: 3, name: "Fajar Ramadhan", email: "fajar.r@gmail.com", tier: "Basic", status: "Aktif" },
  { id: 4, name: "Dewi Lestari", email: "dewi.lestari@gmail.com", tier: "Plus", status: "Aktif" },
  { id: 5, name: "Bima Saputra", email: "bima.saputra@gmail.com", tier: "Basic", status: "Aktif" },
  { id: 6, name: "Sinta Maharani", email: "sinta.m@gmail.com", tier: "Premium", status: "Aktif" },
  { id: 7, name: "Rizal Hidayat", email: "rizal.h@gmail.com", tier: "Basic", status: "Berakhir" },
  { id: 8, name: "Ayu Wulandari", email: "ayu.wulandari@gmail.com", tier: "Plus", status: "Aktif" },
  { id: 9, name: "Dimas Aditya", email: "dimas.aditya@gmail.com", tier: "Basic", status: "Aktif" },
  { id: 10, name: "Rani Kusuma", email: "rani.kusuma@gmail.com", tier: "Basic", status: "Aktif" },
];

const tierClasses = {
  Basic: "bg-[#f4f6f9] text-[#7b899e]",
  Plus: "bg-[#f4f6f9] text-[#64748b]",
  Premium: "bg-[#fff1e7] text-[#e85f00]",
};

function initials(name) {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function MemberModal({ member, onClose, onSave }) {
  const [name, setName] = useState(member?.name ?? "");
  const [email, setEmail] = useState(member?.email ?? "");
  const [tier, setTier] = useState(member?.tier ?? "Basic");
  const [status, setStatus] = useState(member?.status ?? "Aktif");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("Nama dan email wajib diisi.");
      return;
    }
    onSave({ id: member?.id, name: name.trim(), email: email.trim(), tier, status });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#172235]/40 p-4 backdrop-blur-[2px]" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="member-modal-title" className="w-full max-w-lg rounded-2xl border border-[#e5e9ef] bg-white p-5 shadow-2xl sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#ff6b00]">Data Member</p>
            <h2 id="member-modal-title" className="mt-1 text-xl font-extrabold text-[#263346]">{member ? "Edit Member" : "Tambah Member"}</h2>
            <p className="mt-1 text-sm text-[#7b899e]">Perubahan hanya tersimpan dalam sesi demo frontend.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup dialog" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e5e9ef] text-[#7b899e] hover:bg-[#f8fafc]">×</button>
        </div>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <label className="block text-sm font-semibold text-[#344155]">Nama lengkap
            <input value={name} onChange={(event) => setName(event.target.value)} autoFocus placeholder="Masukkan nama member" className="mt-1.5 h-11 w-full rounded-lg border border-[#dfe5ed] px-3 font-normal outline-none transition focus:border-[#ff6b00] focus:ring-4 focus:ring-[#ff6b00]/10" />
          </label>
          <label className="block text-sm font-semibold text-[#344155]">Email
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nama@email.com" className="mt-1.5 h-11 w-full rounded-lg border border-[#dfe5ed] px-3 font-normal outline-none transition focus:border-[#ff6b00] focus:ring-4 focus:ring-[#ff6b00]/10" />
          </label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-[#344155]">Tipe Membership
              <select value={tier} onChange={(event) => setTier(event.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-[#dfe5ed] bg-white px-3 font-normal outline-none focus:border-[#ff6b00]">
                <option>Basic</option><option>Plus</option><option>Premium</option>
              </select>
            </label>
            <label className="block text-sm font-semibold text-[#344155]">Status
              <select value={status} onChange={(event) => setStatus(event.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-[#dfe5ed] bg-white px-3 font-normal outline-none focus:border-[#ff6b00]">
                <option>Aktif</option><option>Berakhir</option>
              </select>
            </label>
          </div>
          {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <div className="flex justify-end gap-2 border-t border-[#edf0f4] pt-4">
            <button type="button" onClick={onClose} className="min-h-10 rounded-lg border border-[#dfe5ed] px-4 text-sm font-semibold text-[#526177] hover:bg-[#f8fafc]">Batal</button>
            <button type="submit" className="min-h-10 rounded-lg bg-[#ff6b00] px-4 text-sm font-bold text-white hover:bg-[#ed6200]">{member ? "Simpan Perubahan" : "Tambah Member"}</button>
          </div>
        </form>
      </section>
    </div>
  );
}

function DistributionCard() {
  const legend = [
    { name: "Basic", count: "624", percent: "50.0%", color: "#ff6b00" },
    { name: "Plus", count: "416", percent: "33.3%", color: "#ffb47c" },
    { name: "Premium", count: "208", percent: "16.7%", color: "#64748b" },
  ];
  return (
    <article className="rounded-xl border border-[#e5e9ef] bg-white p-5">
      <h2 className="text-base font-bold text-[#2b3749]">Distribusi Tipe Member</h2>
      <p className="mt-1 text-xs text-[#8a97aa]">Seluruh 1,248 member terdaftar</p>
      <div className="mx-auto mt-5 flex h-[205px] w-[205px] items-center justify-center rounded-full" style={{ background: "conic-gradient(#ff6b00 0% 50%, #ffb47c 50% 83.3%, #64748b 83.3% 100%)" }}>
        <div className="flex h-[132px] w-[132px] flex-col items-center justify-center rounded-full bg-white">
          <span className="text-[27px] font-extrabold tracking-tight text-[#263346]">1,248</span>
          <span className="text-xs text-[#8a97aa]">Total member</span>
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {legend.map((item) => <div key={item.name} className="flex items-center gap-2 text-sm">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
          <span className="flex-1 text-[#526177]">{item.name}</span>
          <span className="font-semibold text-[#344155]">{item.count}</span>
          <span className="w-12 text-right text-xs text-[#8a97aa]">{item.percent}</span>
        </div>)}
      </div>
    </article>
  );
}

function MemberRetentionCard() {
  return (
    <article className="rounded-xl border border-[#e5e9ef] bg-white p-5">
      <h2 className="text-base font-bold text-[#2b3749]">Retensi Membership</h2>
      <p className="mt-4 text-[32px] font-extrabold leading-none tracking-tight text-[#263346]">95.0%</p>
      <p className="mt-4 text-sm leading-6 text-[#7b899e]">1,186 member aktif dari 1,248 member. 62 membership perlu diperpanjang.</p>
      <button type="button" onClick={() => window.alert("Daftar membership berakhir masih berupa data demo.")} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#e85f00] hover:underline">Lihat membership berakhir <AdminIcon name="arrow" className="h-4 w-4" /></button>
    </article>
  );
}

function AdminMembersPage() {
  const [members, setMembers] = useState(initialMembers);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("Semua tipe");
  const [statusFilter, setStatusFilter] = useState("Semua status");
  const [modalMember, setModalMember] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [notice, setNotice] = useState("");

  const filteredMembers = useMemo(() => members.filter((member) => {
    const term = search.trim().toLowerCase();
    const matchesSearch = !term || member.name.toLowerCase().includes(term) || member.email.toLowerCase().includes(term);
    const matchesTier = tierFilter === "Semua tipe" || member.tier === tierFilter;
    const matchesStatus = statusFilter === "Semua status" || member.status === statusFilter;
    return matchesSearch && matchesTier && matchesStatus;
  }), [members, search, tierFilter, statusFilter]);

  function saveMember(values) {
    if (values.id) {
      setMembers((current) => current.map((member) => member.id === values.id ? { ...member, ...values } : member));
      setNotice(`Data ${values.name} diperbarui di demo frontend.`);
    } else {
      setMembers((current) => [{ ...values, id: Date.now() }, ...current]);
      setNotice(`Member ${values.name} ditambahkan ke daftar demo.`);
      setSearch("");
      setTierFilter("Semua tipe");
      setStatusFilter("Semua status");
    }
    setModalOpen(false);
    setModalMember(null);
    window.setTimeout(() => setNotice(""), 3500);
  }

  function openAddModal() {
    setModalMember(null);
    setModalOpen(true);
  }

  function openEditModal(member) {
    setModalMember(member);
    setModalOpen(true);
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#263346] md:flex">
      <AdminSidebar />
      <div className="min-w-0 flex-1">
        <header className="flex h-[70px] items-center border-b border-[#e5e9ef] bg-white px-5 sm:px-8 lg:px-10">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-[#8a97aa]">Workspace</span>
            <AdminIcon name="chevron" className="h-4 w-4 text-[#9aa5b4]" />
            <span className="font-semibold text-[#263346]">Kelola Member</span>
          </div>
        </header>

        <div className="mx-auto max-w-[1700px] px-5 pb-8 pt-7 sm:px-8 lg:px-10 lg:pt-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-[#263346] sm:text-[30px]">Kelola Member Gym</h1>
              <p className="mt-2 text-sm text-[#7b899e]">Kelola profil, membership, dan status keaktifan seluruh member.</p>
            </div>
            <button type="button" onClick={openAddModal} className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-lg bg-[#ff6b00] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#ed6200] sm:self-auto"><span className="text-lg leading-none">+</span> Tambah Member</button>
          </div>

          <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <label className="flex h-11 w-full max-w-[420px] items-center gap-3 rounded-lg border border-[#dfe5ed] bg-white px-3.5 text-[#8290a3] focus-within:border-[#ff6b00] focus-within:ring-4 focus-within:ring-[#ff6b00]/10">
              <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5" strokeLinecap="round" /></svg>
              <input aria-label="Cari nama atau email member" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama atau email member..." className="h-full min-w-0 flex-1 bg-transparent text-sm text-[#344155] outline-none placeholder:text-[#a4aebb]" />
              {search && <button type="button" onClick={() => setSearch("")} className="text-xs font-semibold text-[#e85f00]">Hapus</button>}
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-[#fff1e7] px-2.5 py-1.5 text-xs font-bold text-[#e85f00]">Semua 1,248</span>
              <span className="rounded-md bg-[#e8f7f0] px-2.5 py-1.5 text-xs font-bold text-emerald-700">Aktif 1,186</span>
              <span className="rounded-md bg-[#f1f4f8] px-2.5 py-1.5 text-xs font-bold text-[#718096]">Berakhir 62</span>
              <div className="relative">
                <select aria-label="Filter tipe member" value={tierFilter} onChange={(event) => setTierFilter(event.target.value)} className="h-11 min-w-[145px] appearance-none rounded-lg border border-[#dfe5ed] bg-white py-2 pl-3 pr-9 text-sm font-semibold text-[#344155] outline-none focus:border-[#ff6b00]">
                  <option>Semua tipe</option><option>Basic</option><option>Plus</option><option>Premium</option>
                </select>
                <svg viewBox="0 0 24 24" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748b]" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m7 10 5 5 5-5" /></svg>
              </div>
              <div className="relative">
                <select aria-label="Filter status member" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-11 min-w-[145px] appearance-none rounded-lg border border-[#dfe5ed] bg-white py-2 pl-3 pr-9 text-sm font-semibold text-[#344155] outline-none focus:border-[#ff6b00]">
                  <option>Semua status</option><option>Aktif</option><option>Berakhir</option>
                </select>
                <svg viewBox="0 0 24 24" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748b]" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m7 10 5 5 5-5" /></svg>
              </div>
            </div>
          </div>

          {notice && <div role="status" className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}

          <div className="grid grid-cols-1 gap-5 2xl:grid-cols-[minmax(0,2.15fr)_minmax(290px,0.8fr)]">
            <section className="min-w-0 overflow-hidden rounded-xl border border-[#e5e9ef] bg-white">
              <header className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e8ecf2] px-5 py-5">
                <h2 className="text-base font-bold text-[#2b3749]">Daftar Member</h2>
                <span className="text-xs text-[#8a97aa]">{filteredMembers.length} data contoh ditampilkan</span>
              </header>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse text-left">
                  <thead className="bg-[#f3f5f8] text-xs font-semibold text-[#738198]">
                    <tr>
                      <th className="px-4 py-3.5 font-semibold">Nama</th>
                      <th className="px-4 py-3.5 font-semibold">Email</th>
                      <th className="px-4 py-3.5 font-semibold">Tipe Member</th>
                      <th className="px-4 py-3.5 font-semibold">Status Aktif</th>
                      <th className="px-4 py-3.5 font-semibold">Aksi Edit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e8ecf2]">
                    {filteredMembers.map((member) => (
                      <tr key={member.id} className="transition hover:bg-[#fffaf6]">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3 whitespace-nowrap">
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f1f4f8] text-[11px] font-bold text-[#8190a4]">{initials(member.name)}</span>
                            <span className="text-sm font-semibold text-[#344155]">{member.name}</span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-sm text-[#7b899e]">{member.email}</td>
                        <td className="px-4 py-3.5"><span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${tierClasses[member.tier] || tierClasses.Basic}`}>{member.tier}</span></td>
                        <td className="px-4 py-3.5"><span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${member.status === "Aktif" ? "bg-[#e8f7f0] text-emerald-700" : "bg-[#f1f4f8] text-[#718096]"}`}>{member.status}</span></td>
                        <td className="px-4 py-3.5"><button type="button" onClick={() => openEditModal(member)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#f56600] hover:underline"><svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/></svg>Edit</button></td>
                      </tr>
                    ))}
                    {filteredMembers.length === 0 && <tr><td colSpan="5" className="px-5 py-12 text-center text-sm text-[#8a97aa]">Tidak ada member yang cocok dengan pencarian atau filter.</td></tr>}
                  </tbody>
                </table>
              </div>
              <footer className="flex flex-col gap-3 border-t border-[#e8ecf2] px-5 py-4 text-xs text-[#8a97aa] sm:flex-row sm:items-center sm:justify-between">
                <span>Data tabel berisi 10 member contoh dan dapat ditambah melalui tombol Tambah Member.</span>
                <span className="inline-flex items-center gap-2 self-start rounded-md bg-[#f4f6f9] px-3 py-2 font-semibold text-[#718096]">1 halaman demo</span>
              </footer>
            </section>

            <aside className="space-y-5">
              <DistributionCard />
              <MemberRetentionCard />
            </aside>
          </div>

          <footer className="flex flex-col gap-2 pb-2 pt-6 text-[11px] text-[#a2adbc] sm:flex-row sm:items-center sm:justify-between">
            <span>© 2026 BugarHub • Admin workspace</span>
            <span>Data contoh untuk pengembangan antarmuka</span>
          </footer>
          <p className="mt-2 rounded-lg border border-[#f5d4b6] bg-[#fff8f1] px-3 py-2 text-xs leading-5 text-[#9b5a22]">Catatan: daftar member, statistik, tipe membership, dan status keanggotaan di halaman ini adalah data demo lokal. Perubahan belum disimpan ke database atau dibagikan ke perangkat lain.</p>
        </div>
      </div>
      {modalOpen && <MemberModal member={modalMember} onClose={() => { setModalOpen(false); setModalMember(null); }} onSave={saveMember} />}
    </main>
  );
}

export default AdminMembersPage;
