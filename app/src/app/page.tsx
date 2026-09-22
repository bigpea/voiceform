'use client'

import { useState, useCallback } from 'react'
import PDFUploader from '@/components/PDFUploader'
import VoiceRecorder from '@/components/VoiceRecorder'
import FieldList from '@/components/FieldList'
import PDFViewer from '@/components/PDFViewer'
import type { PDFField } from '@/types'

export default function Home() {
  const [originalPdfBase64, setOriginalPdfBase64] = useState<string | null>(null)
  const [currentPdfBase64, setCurrentPdfBase64] = useState<string | null>(null)
  const [pdfFields, setPdfFields] = useState<PDFField[]>([])
  const [filledValues, setFilledValues] = useState<Record<string, string>>({})
  const [lastFilled, setLastFilled] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePDFLoaded = useCallback(async (base64: string) => {
    setOriginalPdfBase64(base64)
    setCurrentPdfBase64(base64)
    setFilledValues({})
    setLastFilled([])
    setError(null)

    try {
      const binaryStr = atob(base64)
      const bytes = new Uint8Array(binaryStr.length)
      for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i)
      const blob = new Blob([bytes], { type: 'application/pdf' })

      const formData = new FormData()
      formData.append('pdf', blob, 'form.pdf')

      const res = await fetch('/api/fields', { method: 'POST', body: formData })
      const { fields } = await res.json()
      setPdfFields(fields ?? [])
    } catch {
      setError('Errore nel caricamento dei campi del PDF.')
    }
  }, [])

  const handleTranscript = useCallback(
    async (transcript: string) => {
      if (!transcript.trim() || pdfFields.length === 0 || !originalPdfBase64) return

      setIsProcessing(true)
      setError(null)

      try {
        const availableFields = pdfFields.map((f) => f.name)

        const understandRes = await fetch('/api/understand', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transcript, availableFields }),
        })
        const { results } = await understandRes.json()

        if (!results || results.length === 0) {
          setError('Nessun campo riconosciuto. Prova con una frase diversa.')
          return
        }

        const newValues = { ...filledValues }
        const newLastFilled: string[] = []

        for (const { field, value, confidence } of results) {
          if (confidence >= 0.7 && value) {
            newValues[field] = value
            newLastFilled.push(field)
          }
        }

        if (newLastFilled.length === 0) {
          setError('Confidenza troppo bassa. Prova a essere più specifico.')
          return
        }

        setFilledValues(newValues)
        setLastFilled(newLastFilled)

        const fillRes = await fetch('/api/fill-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pdfBase64: originalPdfBase64, fields: newValues }),
        })
        const { pdfBase64: filledPdf } = await fillRes.json()
        setCurrentPdfBase64(filledPdf)

        setTimeout(() => setLastFilled([]), 3000)
      } catch {
        setError("Errore durante l'elaborazione. Riprova.")
      } finally {
        setIsProcessing(false)
      }
    },
    [pdfFields, filledValues, originalPdfBase64]
  )

  const handleReset = useCallback(() => {
    setOriginalPdfBase64(null)
    setCurrentPdfBase64(null)
    setPdfFields([])
    setFilledValues({})
    setLastFilled([])
    setError(null)
  }, [])

  const filledCount = Object.keys(filledValues).length
  const totalFields = pdfFields.length
  const progress = totalFields > 0 ? Math.round((filledCount / totalFields) * 100) : 0

  // ── LANDING ────────────────────────────────────────────────────────────
  if (!currentPdfBase64) {
    return (
      <div className="min-h-screen flex flex-col bg-[#070711]">
        {/* Ambient gradient blobs */}
        <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px]" />
          <div className="absolute top-1/5 right-1/4 w-[400px] h-[400px] rounded-full bg-violet-500/8 blur-[100px]" />
          <div className="absolute bottom-1/3 left-1/2 w-[300px] h-[300px] rounded-full bg-cyan-600/6 blur-[80px]" />
        </div>

        <main className="relative flex-1 flex flex-col items-center justify-center px-6 py-10">
          {/* Pill badge */}
          <div className="flex items-center gap-2 border border-white/20 bg-white/[0.05] rounded-full px-4 py-1.5 text-sm text-white/80 mb-8">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse flex-shrink-0" />
            Accessibilità digitale
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full flex-shrink-0" />
            Nessuna tastiera necessaria
          </div>

          {/* Title */}
          <h1 className="font-black tracking-tighter leading-none mb-5 text-center" style={{ fontSize: '5.5rem' }}>
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Voice
            </span>
            <span className="text-white">Form</span>
          </h1>

          {/* Tagline */}
          <p className="text-xl text-white/80 mb-2 text-center font-light tracking-wide">
            Compila moduli PDF{' '}
            <span className="text-white font-semibold">parlando</span>.
          </p>
          <p className="text-sm text-white/70 mb-10 text-center max-w-sm leading-relaxed">
            Progettato per persone con disabilità motoria — tremore, emiplegia, mobilità ridotta.
          </p>

          {/* Upload zone */}
          <div className="w-full max-w-lg">
            <PDFUploader onPDFLoaded={handlePDFLoaded} />
          </div>
        </main>

        <footer className="relative text-center py-4 text-white/65 text-xs tracking-widest uppercase border-t border-white/[0.08]">
          ♿ Conforme WCAG 2.1 Livello AA
        </footer>
      </div>
    )
  }

  // ── APP ────────────────────────────────────────────────────────────────
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#070711]">
      {/* Header */}
      <header className="flex-shrink-0 h-14 flex items-center px-5 border-b border-white/[0.06] bg-[#0b0b18]">
        {/* Logo — sinistra */}
        <span className="font-black tracking-tighter text-xl flex-shrink-0 w-48">
          <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">Voice</span>
          <span className="text-white">Form</span>
        </span>

        {/* Progress — centro */}
        <div className="flex-1 flex flex-col items-center gap-1.5 px-6">
          <div
            className="w-full max-w-sm h-1.5 rounded-full bg-white/15 overflow-hidden"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${progress}% completato`}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[11px] text-white/60 tabular-nums">
            {filledCount} di {totalFields} campi compilati · {progress}%
          </span>
        </div>

        {/* Bottone — destra */}
        <div className="flex-shrink-0 w-48 flex justify-end">
          <button
            onClick={handleReset}
            className="inline-flex items-center whitespace-nowrap px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-300 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 shadow-[0_0_20px_rgba(109,40,217,0.3)] hover:shadow-[0_0_35px_rgba(109,40,217,0.5)]"
            aria-label="Carica un nuovo PDF"
          >
            Carica nuovo PDF
          </button>
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div
          role="alert"
          className="flex-shrink-0 flex items-center gap-2 px-5 py-2 text-sm bg-amber-500/[0.07] border-b border-amber-500/20 text-amber-300/80"
        >
          <span aria-hidden="true">⚠</span>
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-amber-500/40 hover:text-amber-300 transition-colors"
            aria-label="Chiudi avviso"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main */}
      <div className="flex flex-1 overflow-hidden">
        <aside
          className="flex-shrink-0 w-64 overflow-y-auto border-r border-white/[0.06] bg-[#0b0b18] px-3 py-3"
          aria-label="Lista campi del modulo"
        >
          <FieldList fields={pdfFields} filledValues={filledValues} lastFilled={lastFilled} />
        </aside>

        <div className="flex-1 overflow-hidden">
          <PDFViewer pdfBase64={currentPdfBase64} />
        </div>
      </div>

      {/* Voice recorder */}
      <div className="flex-shrink-0 bg-[#0b0b18] border-t border-white/[0.06] px-4 pt-4 pb-0">
        <VoiceRecorder onTranscript={handleTranscript} isProcessing={isProcessing} />
        <footer className="text-center py-4 text-white/65 text-xs tracking-widest uppercase border-t border-white/[0.08] mt-4">
          ♿ Conforme WCAG 2.1 Livello AA
        </footer>
      </div>
    </div>
  )
}
