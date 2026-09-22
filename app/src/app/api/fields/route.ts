import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument } from 'pdf-lib'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('pdf') as File | null
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const arrayBuffer = await file.arrayBuffer()
    const pdfDoc = await PDFDocument.load(new Uint8Array(arrayBuffer))
    const form = pdfDoc.getForm()
    const rawFields = form.getFields()

    const LABEL_MAP: Record<string, string> = {
      nome:               'Nome',
      cognome:            'Cognome',
      data_nascita:       'Data di nascita',
      luogo_nascita:      'Luogo di nascita',
      indirizzo:          'Indirizzo',
      comune:             'Comune di residenza',
      cap:                'CAP',
      provincia:          'Provincia',
      data_dichiarazione: 'Data dichiarazione',
    }

    const fields = rawFields.map((field) => {
      const name = field.getName()
      return {
        name,
        type: 'text' as const,
        value: '',
        label: LABEL_MAP[name] ?? name.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      }
    })

    return NextResponse.json({ fields })
  } catch {
    return NextResponse.json({ error: 'Failed to parse PDF' }, { status: 500 })
  }
}
