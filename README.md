# VoiceForm — Compila moduli PDF con la voce

> Compila qualsiasi PDF accessibile parlando. Senza tastiera, senza mouse.

---

## Il problema

In Italia, milioni di persone con disabilità motoria — tremore essenziale, emiplegia, sclerosi multipla — non riescono a compilare autonomamente i moduli digitali.

Ogni volta che devono compilare un modulo, hanno bisogno di qualcuno che lo faccia per loro. Perdono autonomia.

---

## La soluzione

VoiceForm trasforma la voce in un modulo compilato.

```
Parla  →  Compila  →  Scarica
```

L'utente dice:
> "Mi chiamo Mario Rossi, sono nato a Roma il 3 marzo 1970"

VoiceForm compila automaticamente: **Nome**, **Cognome**, **Luogo di nascita**, **Data di nascita** — in 2 secondi.

---

## Profilo Utente (Learner Profile Statement)

**Marco, 68 anni, ex insegnante.**  
Ha il tremore essenziale da 3 anni. Usa il computer ma non riesce a digitare con precisione — i campi dei form lo frustrano, gli errori lo bloccano. Vive da solo e non vuole dipendere dai figli per pratiche burocratiche.

VoiceForm è stato progettato per lui.

---

## Adaptive Evidence

| Frase pronunciata | Campi compilati |
|---|---|
| "Mi chiamo Mario Rossi" | nome=Mario, cognome=Rossi |
| "Sono nato a Roma il 3 marzo 1970" | luogo_nascita=Roma, data_nascita=03/03/1970 |
| "CF RSSMRA70A01H501U" | codice_fiscale=RSSMRA70A01H501U |
| "Abito in via Garibaldi 5, CAP 20121" | indirizzo, cap |
| "Oggi" | data_dichiarazione=data odierna |

Il sistema non è un semplice speech-to-text: **capisce il contesto**, estrae più campi da una sola frase e associa ogni valore al campo corretto del PDF.

---

## Learning Outcome

**Prima di VoiceForm**: Marco non riesce a completare il modulo in autonomia (0% di completamento autonomo).

**Dopo VoiceForm**: Marco carica il PDF, parla, e scarica il documento compilato (100% di completamento autonomo).

**Come è verificato**: il PDF scaricato contiene tutti i campi valorizzati correttamente, verificabili aprendo il file in qualsiasi PDF reader.

---

## Stack Tecnologico

| Componente | Tecnologia |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| PDF filling | pdf-lib (AcroForm) |
| Speech-to-text | Web Speech API (browser built-in, gratis) |
| Field understanding | Pattern matching in italiano (server-side) |
| Nessuna API key | ✓ Zero dipendenze esterne |

---

## Come avviare

```bash
cd app
npm install
npm run generate-pdf
npm run dev
```

Poi apri **http://localhost:3000** in Chrome o Edge.

---

## Come usare

1. Carica il tuo PDF accessibile e compilabile
2. Premi il pulsante **🎤 microfono**
3. Parla descrivendo i tuoi dati:
   - *"Mi chiamo Mario Rossi"*
   - *"Nato a Roma il 3 marzo 1970"*
   - *"Abito in via Garibaldi 5 a Milano, CAP 20121"*
   - *"Data di oggi"*
4. I campi si compilano automaticamente nel PDF visualizzato
5. Scarica il documento compilato

---

## Struttura del progetto

```
VoiceForm/
├── README.md
├── presentation/                    (slide del progetto)
├── requirements/
│   └── requirements.md              requisiti funzionali
└── app/                             Next.js 14
    ├── .claude/
    │   ├── agents/
    │   │   ├── dev.md
    │   │   ├── presentazione_agent.md
    │   │   └── readme_agent.md
    │   └── commands/
    │       └── orchestratore.md     orchestratore pipeline
    ├── public/
    │   └── autocertificazione.pdf   modulo PA predefinito
    ├── scripts/
    │   └── generate-pdf.ts          genera il PDF di test
    └── src/
        ├── app/
        │   ├── layout.tsx
        │   ├── globals.css
        │   ├── page.tsx             UI principale
        │   └── api/
        │       ├── fields/          estrae campi dal PDF
        │       ├── understand/      mappa voce → campo
        │       └── fill-pdf/        compila il PDF
        ├── components/
        │   ├── PDFUploader.tsx
        │   ├── VoiceRecorder.tsx
        │   ├── FieldList.tsx
        │   └── PDFViewer.tsx
        └── types/
            ├── index.ts
            └── speech.d.ts
```
