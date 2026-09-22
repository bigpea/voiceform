import { NextRequest, NextResponse } from 'next/server'
import type { UnderstandResult } from '@/types'

const MONTHS: Record<string, string> = {
  gennaio: '01', febbraio: '02', marzo: '03', aprile: '04',
  maggio: '05', giugno: '06', luglio: '07', agosto: '08',
  settembre: '09', ottobre: '10', novembre: '11', dicembre: '12',
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}

function titleCase(s: string): string {
  return s.trim().split(/\s+/).map(capitalize).join(' ')
}

// Normalize "è/é" → "e" and clean up extra spaces for easier pattern matching
function norm(text: string): string {
  return text
    .toLowerCase()
    .replace(/[èéê]/g, 'e')
    .replace(/\s+/g, ' ')
    .trim()
}

function parseDate(raw: string): string | null {
  const spoken = raw.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/i)
  if (spoken) {
    const day = spoken[1].padStart(2, '0')
    const month = MONTHS[spoken[2].toLowerCase()]
    if (month) return `${day}/${month}/${spoken[3]}`
  }
  const numeric = raw.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/)
  if (numeric) {
    const day = numeric[1].padStart(2, '0')
    const month = numeric[2].padStart(2, '0')
    const year = numeric[3].length === 2 ? `19${numeric[3]}` : numeric[3]
    return `${day}/${month}/${year}`
  }
  return null
}

function extractFields(transcript: string, availableFields: string[]): UnderstandResult[] {
  const results: UnderstandResult[] = []
  const n = norm(transcript)           // normalized lowercase, è→e
  const raw = transcript               // original case (for CF)

  const add = (field: string, value: string, confidence: number) => {
    if (!availableFields.includes(field) || !value.trim()) return
    const idx = results.findIndex((r) => r.field === field)
    const clean = value.trim()
    if (idx >= 0) {
      if (results[idx].confidence < confidence) results[idx] = { field, value: clean, confidence }
    } else {
      results.push({ field, value: clean, confidence })
    }
  }

  // ── NOME + COGNOME ──────────────────────────────────────────────────
  // "mi chiamo Mario Rossi"
  const chiamoFull = n.match(/mi chiamo\s+([a-zA-ZÀ-ù]+)\s+([a-zA-ZÀ-ù]+)/)
  if (chiamoFull) {
    add('nome', titleCase(chiamoFull[1]), 0.95)
    add('cognome', titleCase(chiamoFull[2]), 0.95)
  } else {
    const chiamoOne = n.match(/mi chiamo\s+([a-zA-ZÀ-ù]+)/)
    if (chiamoOne) add('nome', titleCase(chiamoOne[1]), 0.82)
  }
  // "il mio nome è Mario" / "nome Mario"
  const nomeMatch = n.match(/(?:(?:il )?mio )?nome\s+e\s+([a-zA-ZÀ-ù]+)/)
    ?? n.match(/^nome\s+([a-zA-ZÀ-ù]+)/i)
  if (nomeMatch) add('nome', titleCase(nomeMatch[1]), 0.88)

  // "il mio cognome è Rossi"
  const cognomeMatch = n.match(/(?:(?:il )?mio )?cognome\s+e\s+([a-zA-ZÀ-ù]+)/)
    ?? n.match(/^cognome\s+([a-zA-ZÀ-ù]+)/i)
  if (cognomeMatch) add('cognome', titleCase(cognomeMatch[1]), 0.9)

  // ── CODICE FISCALE ──────────────────────────────────────────────────
  // Strategy 1: extract the substring after "codice fiscale" keyword, then remove spaces
  const cfContextMatch = n.match(/(?:codice\s+fiscale|cf)\s+(?:e\s+)?(.{10,25}?)(?:,|\.|$)/)
  if (cfContextMatch) {
    const cfRaw = cfContextMatch[1].replace(/\s+/g, '').toUpperCase()
    if (/^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/.test(cfRaw)) {
      add('codice_fiscale', cfRaw, 0.97)
    }
  }
  // Strategy 2: spaces removed from full raw transcript
  const rawNoSpaces = raw.replace(/\s+/g, '')
  const cfMatch = rawNoSpaces.match(/([A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z])/i)
  if (cfMatch) add('codice_fiscale', cfMatch[1].toUpperCase(), 0.97)
  // Strategy 3: optional single spaces between groups "RSSMRA 70 A 01 H 501 U"
  const cfSpaced = raw.match(/([A-Z]{6})\s*(\d{2})\s*([A-Z])\s*(\d{2})\s*([A-Z])\s*(\d{3})\s*([A-Z])/i)
  if (cfSpaced && !results.find((r) => r.field === 'codice_fiscale')) {
    const cf = cfSpaced.slice(1, 8).join('')
    add('codice_fiscale', cf.toUpperCase(), 0.92)
  }

  // ── DATA DI NASCITA ─────────────────────────────────────────────────
  // "nato/a il 3 marzo 1970" / "nato il 3/3/1970"
  const dataNascitaCtx =
    n.match(/nato[a]?\s+il\s+(.{5,30}?)(?:\s+a\b|\s+in\b|,|\.|$)/) ??
    n.match(/data\s+(?:di\s+)?nascita\s+(?:e\s+)?(.{5,30}?)(?:,|\.|$)/)
  if (dataNascitaCtx) {
    const d = parseDate(dataNascitaCtx[1])
    if (d) add('data_nascita', d, 0.92)
  }
  // "il 3 marzo 1970" standalone — solo se il contesto non riguarda la dichiarazione
  const dateWithMonth = n.match(
    /(?:il\s+)?(\d{1,2}\s+(?:gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)\s+\d{4})/i
  )
  if (dateWithMonth && !results.find((r) => r.field === 'data_nascita') && !n.includes('dichiarazione')) {
    const d = parseDate(dateWithMonth[1])
    if (d) add('data_nascita', d, 0.8)
  }

  // ── LUOGO DI NASCITA ────────────────────────────────────────────────
  // "nato/a a Roma" / "nato/a in Francia" / "luogo di nascita Roma" / "luogo nascita Roma"
  const CITY = /([a-zA-ZÀ-ù]+(?:\s+[a-zA-ZÀ-ù]+){0,3})/
  const luogoMatch =
    n.match(new RegExp(`nato[a]?\\s+(?:a|in)\\s+${CITY.source}(?:\\s+il\\b|\\s+provincia|\\s*\\(|,|\\.|$)`)) ??
    n.match(new RegExp(`luogo\\s+(?:di\\s+)?nascita\\s*(?:e\\s+)?${CITY.source}(?:\\s+\\d|\\s+cap\\b|\\s+abito|,|\\.|$)`)) ??
    n.match(new RegExp(`(?:sono\\s+(?:nato|nata)\\s+a|nasco\\s+a)\\s+${CITY.source}(?:\\s+il\\b|,|\\.|$)`))
  if (luogoMatch) add('luogo_nascita', titleCase(luogoMatch[1].trim()), 0.9)

  // ── INDIRIZZO ────────────────────────────────────────────────────────
  // Handles: "il mio indirizzo è via...", "abito in via...", "vivo in corso..."
  // street type keywords: via, corso, piazza, viale, largo, vicolo, strada
  const streetTypes = 'via|corso|piazza|viale|largo|vicolo|strada'
  const indirizzoRe = new RegExp(
    `(?:(?:(?:il )?mio )?indirizzo\\s+(?:e\\s+)?|abito\\s+(?:in\\s+)?|vivo\\s+(?:in\\s+)?|risiedo\\s+(?:in\\s+)?)((?:${streetTypes})\\s+[^,\\n]+?)(?:\\s+a\\s+[a-zA-ZÀ-ù]|\\s+cap\\b|\\s+codice\\s+postale|\\s+provincia|,|\\.|$)`,
    'i'
  )
  const indirizzoMatch = n.match(indirizzoRe)
  const indirizzoStreet = n.match(new RegExp(`((?:${streetTypes})\\s+[a-zA-ZÀ-ù\\s]+(?:,?\\s*\\d+)?)`, 'i'))
  if (indirizzoMatch) {
    add('indirizzo', titleCase(indirizzoMatch[1].trim()), 0.9)
  } else if (indirizzoStreet) {
    add('indirizzo', titleCase(indirizzoStreet[1].trim()), 0.78)
  }

  // ── COMUNE DI RESIDENZA ──────────────────────────────────────────────
  const COMUNE_CITY = /([a-zA-ZÀ-ù]+(?:\s+[a-zA-ZÀ-ù]+){0,3})/
  const COMUNE_END = /(?:\s+cap\b|\s+codice\s+postale|\s+provincia|,|\.|$)/

  // "comune di residenza Milano" (senza è)
  const comuneDiResidenza = n.match(
    new RegExp(`comune\\s+di\\s+residenza\\s+${COMUNE_CITY.source}${COMUNE_END.source}`, 'i')
  )
  // "abito a Milano" / "comune di Milano" / "città di Milano" / "residente a Milano"
  const comuneExplicit = n.match(
    new RegExp(`(?:abito\\s+a|vivo\\s+a|risiedo\\s+a|comune\\s+di|citta\\s+di|residente\\s+a)\\s+${COMUNE_CITY.source}${COMUNE_END.source}`, 'i')
  )
  // "il comune è Milano" / "il comune di residenza è Milano"
  const comuneKeyword = n.match(
    new RegExp(`(?:(?:il\\s+)?comune(?:\\s+di\\s+residenza)?\\s+e\\s+|residenza\\s+(?:e\\s+)?)${COMUNE_CITY.source}${COMUNE_END.source}`, 'i')
  )
  // "abito in via X a Milano"
  const comuneAfterStreet = n.match(
    new RegExp(`(?:abito|vivo|risiedo)\\s+in\\s+[^.]+?\\s+a\\s+${COMUNE_CITY.source}${COMUNE_END.source}`, 'i')
  )
  if (comuneDiResidenza) {
    add('comune', titleCase(comuneDiResidenza[1].trim()), 0.95)
  } else if (comuneExplicit) {
    add('comune', titleCase(comuneExplicit[1].trim()), 0.9)
  } else if (comuneKeyword) {
    add('comune', titleCase(comuneKeyword[1].trim()), 0.88)
  } else if (comuneAfterStreet) {
    add('comune', titleCase(comuneAfterStreet[1].trim()), 0.83)
  }

  // ── CAP ──────────────────────────────────────────────────────────────
  // "CAP 20121" / "CAP: 20121" / "CAP è 20121" / "codice postale 20121"
  // Using .{0,6}? to skip "è", ":", " ", etc. between keyword and number
  const capExplicit = n.match(/\b(?:cap|codice\s+postale)\b.{0,6}?(\d{5})/i)
  const capAny = n.match(/\b(\d{5})\b/)
  if (capExplicit) {
    add('cap', capExplicit[1], 0.96)
  } else if (capAny) {
    add('cap', capAny[1], 0.73)
  }

  // ── PROVINCIA ────────────────────────────────────────────────────────
  // "(MI)" in original / "provincia di Milano" / "prov. MI"
  const provParen = raw.match(/\(([A-Z]{2})\)/)
  const provCode = raw.match(/\bprov(?:incia)?\s*\.?\s+([A-Z]{2})\b/i)
  const provFull = n.match(/provincia\s+(?:di\s+)?([a-zA-ZÀ-ù]{2,25})/)
  if (provParen) {
    add('provincia', provParen[1].toUpperCase(), 0.97)
  } else if (provCode) {
    add('provincia', provCode[1].toUpperCase(), 0.93)
  } else if (provFull) {
    add('provincia', titleCase(provFull[1].trim()), 0.85)
  }

  // ── DATA DICHIARAZIONE ───────────────────────────────────────────────
  // "data dichiarazione è 22 settembre 2026" / "data dichiarazione 22/09/2026"
  const dataDichCtx =
    n.match(/data\s+(?:della\s+)?dichiarazione\s+(?:e\s+)?(.{5,30}?)(?:,|\.|$)/)
  if (dataDichCtx) {
    const d = parseDate(dataDichCtx[1])
    if (d) add('data_dichiarazione', d, 0.95)
  }
  // "oggi" / "la data è oggi" / "data odierna"
  if (/\b(?:oggi|data\s+odierna|data\s+di\s+oggi)\b/i.test(n)) {
    const d = new Date()
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    add('data_dichiarazione', `${dd}/${mm}/${d.getFullYear()}`, 0.96)
  }

  return results
}

export async function POST(request: NextRequest) {
  const { transcript, availableFields } = (await request.json()) as {
    transcript: string
    availableFields: string[]
  }

  if (!transcript?.trim()) return NextResponse.json({ results: [] })

  const results = extractFields(transcript, availableFields ?? [])
  return NextResponse.json({ results })
}
