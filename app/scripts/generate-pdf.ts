import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

async function generateAutocertificazionePDF() {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595.28, 841.89]) // A4

  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

  const { width, height } = page.getSize()
  const marginX = 50
  const contentWidth = width - marginX * 2

  // Header istituzionale
  page.drawText('DICHIARAZIONE SOSTITUTIVA DI CERTIFICAZIONE', {
    x: marginX,
    y: height - 55,
    size: 13,
    font: boldFont,
    color: rgb(0.1, 0.1, 0.4),
  })

  page.drawText('(Art. 46 D.P.R. 28 dicembre 2000, n. 445)', {
    x: marginX,
    y: height - 73,
    size: 9,
    font: regularFont,
    color: rgb(0.4, 0.4, 0.4),
  })

  page.drawLine({
    start: { x: marginX, y: height - 83 },
    end: { x: width - marginX, y: height - 83 },
    thickness: 1.5,
    color: rgb(0.1, 0.1, 0.4),
  })

  const form = pdfDoc.getForm()

  const FIELDS: Array<{
    name: string
    label: string
    y: number
    width?: number
    hint?: string
  }> = [
    { name: 'nome',               label: 'Nome',                    y: height - 140, hint: 'Es: Mario' },
    { name: 'cognome',            label: 'Cognome',                 y: height - 195, hint: 'Es: Rossi' },
    { name: 'data_nascita',       label: 'Data di nascita',         y: height - 250, hint: 'GG/MM/AAAA' },
    { name: 'luogo_nascita',      label: 'Luogo di nascita',        y: height - 305, hint: 'Città' },
    { name: 'indirizzo',          label: 'Indirizzo (via, n. civico)', y: height - 360, hint: 'Es: Via Garibaldi, 5' },
    { name: 'comune',             label: 'Comune di residenza',     y: height - 415, hint: 'Es: Milano' },
    { name: 'cap',                label: 'CAP',                     y: height - 470, width: 120, hint: '00000' },
    { name: 'provincia',          label: 'Provincia',               y: height - 470, hint: 'Es: MI' },
    { name: 'data_dichiarazione', label: 'Data della dichiarazione',y: height - 545, hint: 'GG/MM/AAAA' },
  ]

  const fieldH = 24
  const labelSize = 9
  const valueSize = 11

  for (const f of FIELDS) {
    let x = marginX
    let w = contentWidth

    if (f.name === 'cap') {
      w = 120
    } else if (f.name === 'provincia') {
      x = marginX + 140
      w = 100
    }

    page.drawText(f.label + ':', {
      x,
      y: f.y + fieldH + 4,
      size: labelSize,
      font: boldFont,
      color: rgb(0.3, 0.3, 0.3),
    })

    const textField = form.createTextField(f.name)
    textField.addToPage(page, {
      x,
      y: f.y,
      width: w,
      height: fieldH,
      borderWidth: 1,
      borderColor: rgb(0.6, 0.6, 0.8),
      backgroundColor: rgb(0.96, 0.96, 1),
    })
    textField.setFontSize(valueSize)

    if (f.hint) {
      page.drawText(f.hint, {
        x: x + 4,
        y: f.y + 7,
        size: 8,
        font: regularFont,
        color: rgb(0.7, 0.7, 0.7),
      })
    }
  }

  page.drawLine({
    start: { x: marginX, y: height - 595 },
    end: { x: width - marginX, y: height - 595 },
    thickness: 0.5,
    color: rgb(0.8, 0.8, 0.8),
  })

  page.drawText('Il/La sottoscritto/a dichiara sotto la propria responsabilità, ai sensi e per gli effetti', {
    x: marginX,
    y: height - 613,
    size: 8,
    font: regularFont,
    color: rgb(0.5, 0.5, 0.5),
  })
  page.drawText('del D.P.R. 28 dicembre 2000, n. 445, che le informazioni sopra riportate sono veritiere.', {
    x: marginX,
    y: height - 625,
    size: 8,
    font: regularFont,
    color: rgb(0.5, 0.5, 0.5),
  })

  page.drawText('Firma: _________________________________', {
    x: marginX,
    y: height - 660,
    size: 10,
    font: regularFont,
    color: rgb(0.2, 0.2, 0.2),
  })

  page.drawText('Compilato con VoiceForm', {
    x: 380,
    y: 30,
    size: 8,
    font: regularFont,
    color: rgb(0.75, 0.75, 0.75),
    rotate: degrees(0),
  })

  const pdfBytes = await pdfDoc.save()

  const publicDir = join(process.cwd(), 'public')
  mkdirSync(publicDir, { recursive: true })
  const outputPath = join(publicDir, 'autocertificazione.pdf')
  writeFileSync(outputPath, pdfBytes)

  console.log(`✓ PDF generato: ${outputPath}`)
  console.log(`  Campi AcroForm: ${FIELDS.map((f) => f.name).join(', ')}`)
}

generateAutocertificazionePDF().catch((err) => {
  console.error('Errore generazione PDF:', err)
  process.exit(1)
})
