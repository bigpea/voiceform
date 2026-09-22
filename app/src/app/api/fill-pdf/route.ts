import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument } from 'pdf-lib'
import type { FillPDFRequest } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const { pdfBase64, fields } = (await request.json()) as FillPDFRequest

    const pdfBytes = Buffer.from(pdfBase64, 'base64')
    const pdfDoc = await PDFDocument.load(pdfBytes)
    const form = pdfDoc.getForm()

    for (const [fieldName, value] of Object.entries(fields)) {
      try {
        form.getTextField(fieldName).setText(value)
      } catch {
        // Field not found or wrong type — skip silently
      }
    }

    const filledBytes = await pdfDoc.save()
    const filledBase64 = Buffer.from(filledBytes).toString('base64')

    return NextResponse.json({ pdfBase64: filledBase64 })
  } catch {
    return NextResponse.json({ error: 'Failed to fill PDF' }, { status: 500 })
  }
}
