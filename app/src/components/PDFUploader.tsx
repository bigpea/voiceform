'use client'

import { useCallback, useState } from 'react'

interface PDFUploaderProps {
  onPDFLoaded: (base64: string) => void
}

export default function PDFUploader({ onPDFLoaded }: PDFUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)

  const loadFile = useCallback(
    (file: File) => {
      if (!file.type.includes('pdf')) {
        alert('Carica un file PDF compilabile')
        return
      }
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        onPDFLoaded(result.split(',')[1])
      }
      reader.readAsDataURL(file)
    },
    [onPDFLoaded]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) loadFile(file)
    },
    [loadFile]
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) loadFile(file)
    },
    [loadFile]
  )

  return (
    <label
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`flex flex-col items-center justify-center rounded-2xl px-10 py-8 text-center cursor-pointer transition-all duration-300 border-2 border-dashed
        ${isDragging
          ? 'border-blue-400/70 bg-blue-500/8'
          : 'border-white/40 hover:border-white/60 bg-transparent hover:bg-white/[0.02]'
        }`}
      aria-label="Zona di caricamento PDF: trascina il file o clicca per selezionarlo"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.click()}
    >
      <p className="text-lg font-semibold text-white mb-1">
        {isDragging ? 'Rilascia qui il PDF' : 'Trascina il tuo PDF qui'}
      </p>
      <p className="text-sm text-white/70 mb-6">oppure clicca per selezionarlo</p>

      <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 shadow-[0_0_25px_rgba(109,40,217,0.35)] hover:shadow-[0_0_40px_rgba(109,40,217,0.5)]">
        Scegli file PDF
      </span>

      <input
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={handleChange}
        aria-hidden="true"
      />
    </label>
  )
}
