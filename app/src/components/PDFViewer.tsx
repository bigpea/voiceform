'use client'

import { useEffect, useRef } from 'react'

interface PDFViewerProps {
  pdfBase64: string
}

export default function PDFViewer({ pdfBase64 }: PDFViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const blobUrlRef = useRef<string | null>(null)

  useEffect(() => {
    if (!pdfBase64) return

    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)

    const binaryStr = atob(pdfBase64)
    const bytes = new Uint8Array(binaryStr.length)
    for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i)
    const blob = new Blob([bytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    blobUrlRef.current = url

    if (iframeRef.current) iframeRef.current.src = url

    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)
    }
  }, [pdfBase64])

  return (
    <div className="h-full flex flex-col bg-[#070711] p-4 gap-2">
      {/* Label */}
      <p className="text-xs text-white/55 tracking-wider uppercase font-medium flex-shrink-0 px-1">
        Anteprima — i campi si aggiornano dopo ogni registrazione
      </p>

      {/* PDF dentro box tratteggiato */}
      <div className="flex-1 border-2 border-dashed border-white/40 rounded-2xl overflow-hidden">
        <iframe
          ref={iframeRef}
          className="w-full h-full border-0"
          title="Anteprima modulo PDF compilato"
          aria-label="Visualizzazione del modulo PDF con i campi compilati dalla voce"
        />
      </div>
    </div>
  )
}
