'use client'

import { useState, useCallback, useRef } from 'react'

interface VoiceRecorderProps {
  onTranscript: (transcript: string) => void
  isProcessing: boolean
}

export default function VoiceRecorder({ onTranscript, isProcessing }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [interimText, setInterimText] = useState('')
  const [statusMessage, setStatusMessage] = useState('Premi il microfono e parla')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)

  const startRecording = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionAPI: any =
      (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)) || null

    if (!SpeechRecognitionAPI) {
      setStatusMessage('Browser non supportato. Usa Chrome o Edge.')
      return
    }

    const recognition = new SpeechRecognitionAPI()
    recognition.lang = 'it-IT'
    recognition.continuous = false
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsRecording(true)
      setStatusMessage('In ascolto — parla ora')
      setInterimText('')
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let interim = ''
      let final = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript
        } else {
          interim += event.results[i][0].transcript
        }
      }
      if (interim) setInterimText(interim)
      if (final) {
        setInterimText(final)
        setStatusMessage('Elaborazione in corso...')
        onTranscript(final)
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      setIsRecording(false)
      if (event.error === 'no-speech') {
        setStatusMessage('Nessun audio rilevato. Riprova.')
      } else if (event.error === 'not-allowed') {
        setStatusMessage('Microfono non autorizzato. Controlla i permessi del browser.')
      } else {
        setStatusMessage(`Errore: ${event.error}. Riprova.`)
      }
    }

    recognition.onend = () => {
      setIsRecording(false)
      if (!isProcessing) {
        setTimeout(() => {
          setStatusMessage('Premi il microfono e parla')
          setInterimText('')
        }, 2000)
      }
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [onTranscript, isProcessing])

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop()
  }, [])

  return (
    <div
      className={`rounded-2xl border px-5 py-4 transition-all duration-500 ${
        isRecording
          ? 'border-red-500/40 bg-red-500/5 shadow-[0_0_30px_rgba(239,68,68,0.1)]'
          : isProcessing
            ? 'border-blue-500/30 bg-blue-500/5'
            : 'border-violet-500/25 bg-violet-950/20'
      }`}
    >
      {/* Titolo centrato */}
      <p className={`text-center text-xs font-bold uppercase tracking-widest mb-4 transition-colors ${
        isRecording ? 'text-red-400' : isProcessing ? 'text-blue-400' : 'text-white/60'
      }`}>
        {isRecording ? '● Registrazione in corso' : isProcessing ? '⏳ Elaborazione' : 'Compilazione vocale'}
      </p>

      {/* Riga principale */}
      <div className="flex items-center gap-5">
        {/* Mic button */}
        <div className="relative flex-shrink-0">
          {isRecording && (
            <>
              <span className="absolute inset-0 rounded-full bg-red-500/25 animate-ping" />
              <span
                className="absolute rounded-full bg-red-500/12 animate-ping"
                style={{ inset: '-10px', animationDelay: '0.35s' }}
              />
            </>
          )}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            aria-label={isRecording ? 'Ferma registrazione' : 'Avvia registrazione vocale'}
            className={`relative w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all duration-300
              ${isRecording
                ? 'bg-red-500 shadow-[0_0_50px_rgba(239,68,68,0.65)] scale-110'
                : isProcessing
                  ? 'bg-white/[0.04] border border-white/10 cursor-not-allowed text-white/25'
                  : 'bg-gradient-to-br from-blue-500 to-violet-600 shadow-[0_0_30px_rgba(109,40,217,0.5)] hover:shadow-[0_0_50px_rgba(109,40,217,0.7)] hover:scale-105 active:scale-95'
              }`}
          >
            {isProcessing ? '⏳' : isRecording ? '⏹' : '🎤'}
          </button>
        </div>

        {/* Trascrizione */}
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-semibold mb-2 transition-colors ${
            isRecording ? 'text-red-400' : isProcessing ? 'text-blue-400' : 'text-white/55'
          }`}>
            {statusMessage}
          </p>

          {interimText ? (
            <div className="bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3">
              <p className="text-white text-base leading-snug">"{interimText}"</p>
            </div>
          ) : (
            <button
              onClick={isProcessing ? undefined : (isRecording ? stopRecording : startRecording)}
              disabled={isProcessing}
              className={`w-full text-left rounded-xl px-4 py-3 transition-all duration-200 border
                ${isRecording
                  ? 'border-red-500/30 bg-red-500/5'
                  : isProcessing
                    ? 'border-white/[0.06] bg-white/[0.02] cursor-not-allowed'
                    : 'border-white/[0.08] bg-white/[0.02] hover:border-violet-500/40 hover:bg-violet-500/5 cursor-pointer'
                }`}
              aria-label="Clicca o premi il microfono per iniziare a parlare"
            >
              <p className="text-white/65 text-sm italic">
                {isRecording
                  ? 'Sto ascoltando...'
                  : 'Es: "Mi chiamo Mario Rossi, abito a Milano in via Garibaldi 5"'
                }
              </p>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
