export default function PriceRow({
  label,
  value,
  valueClass = 'font-semibold',
}: {
  label: string
  value: string
  valueClass?: string
}) {
  return (
    <div className="flex items-center justify-between text-sm text-neutral-600">
      <span>{label}</span>
      <span className={valueClass}>{value}</span>
    </div>
  )
}
