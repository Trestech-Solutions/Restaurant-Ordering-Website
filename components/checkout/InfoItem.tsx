import React from 'react'

interface InfoItemProps {
  icon: React.ReactNode
  label: string
  value: string
}

export function InfoItem({ icon, label, value }: InfoItemProps) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 shrink-0 text-neutral-400">{icon}</span>
      <div>
        <p className="text-[11px] text-neutral-400">{label}</p>
        <p className="text-sm font-semibold text-neutral-800">{value}</p>
      </div>
    </div>
  )
}
