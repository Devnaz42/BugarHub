import AdminSidebar, { AdminIcon } from "./AdminSidebar";

function TrainerPageLayout({ title, subtitle, children, actions, showHeading = false }) {
  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#263346] md:flex">
      <AdminSidebar />
      <div className="min-w-0 flex-1">
        <header className="flex min-h-[64px] items-center justify-between gap-4 border-b border-[#e5e9ef] bg-white px-5 py-4 sm:px-8 lg:px-10">
          <div className="flex min-w-0 items-center gap-3 text-sm">
            <span className="text-[#8a97aa]">Workspace</span>
            <AdminIcon name="chevron" className="h-4 w-4 shrink-0 text-[#9aa5b4]" />
            <span className="truncate font-semibold text-[#263346]">{title}</span>
          </div>
          <span className="hidden rounded-full bg-[#fff1e7] px-3 py-1.5 text-xs font-bold text-[#e85f00] sm:inline-flex">PT / Coach Workspace</span>
        </header>
        <div className="mx-auto max-w-[1600px] px-4 pb-8 pt-5 sm:px-8 sm:pt-7 lg:px-10">
          {(subtitle || actions || showHeading) && (
            <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-[#263346] sm:text-[28px]">{title}</h1>
                {subtitle && <p className="mt-1.5 max-w-3xl text-sm leading-6 text-[#7b899e]">{subtitle}</p>}
              </div>
              {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
            </div>
          )}
          {children}
        </div>
      </div>
    </main>
  );
}

export default TrainerPageLayout;
