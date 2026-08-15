function ReceiptSection({ icon, title, badge, children }: { icon: React.ReactNode; title: string; badge?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between bg-neutral-100 px-5 py-3">
        <h2 className="flex items-center gap-2 text-sm font-bold text-neutral-800"><span className="text-[#c8102e]">{icon}</span>{title}</h2>
        {badge}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  )
}