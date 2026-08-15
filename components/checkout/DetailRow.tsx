export default function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-neutral-500 shrink-0">{label}</span>
      <span className="font-semibold text-neutral-800 text-right">{value}</span>
    </div>
  )
}