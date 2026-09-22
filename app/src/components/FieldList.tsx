import type { PDFField } from '@/types'

interface FieldListProps {
  fields: PDFField[]
  filledValues: Record<string, string>
  lastFilled: string[]
}

export default function FieldList({ fields, filledValues, lastFilled }: FieldListProps) {
  const filledCount = Object.keys(filledValues).length

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs font-bold text-white/70 uppercase tracking-widest">Campi</h2>
        <span className="text-xs font-semibold text-white/70">
          {filledCount}
          <span className="text-white/50">/{fields.length}</span>
        </span>
      </div>

      {fields.length === 0 && (
        <p className="text-white/20 text-sm italic">Caricamento...</p>
      )}

      <div className="space-y-1">
        {fields.map((field) => {
          const value = filledValues[field.name]
          const isNew = lastFilled.includes(field.name)

          return (
            <div
              key={field.name}
              className={`rounded-xl px-3 py-1.5 border transition-all duration-500
                ${isNew
                  ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                  : value
                    ? 'bg-white/[0.04] border-white/[0.08]'
                    : 'bg-white/[0.02] border-white/[0.04]'
                }`}
              aria-label={`${field.label}: ${value || 'non compilato'}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors
                  ${isNew ? 'text-emerald-400' : value ? 'text-white/65' : 'text-white/50'}`}>
                  {field.label}
                </span>
                {value ? (
                  <span className={`text-xs font-bold transition-colors ${isNew ? 'text-emerald-400' : 'text-white/55'}`} aria-hidden="true">
                    ✓
                  </span>
                ) : (
                  <span className="text-white/40 text-xs" aria-hidden="true">○</span>
                )}
              </div>

              {value ? (
                <p className="text-white font-semibold leading-tight" style={{ fontSize: '11px' }}>{value}</p>
              ) : (
                <p className="text-white/50 italic leading-tight" style={{ fontSize: '11px' }}>—</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
