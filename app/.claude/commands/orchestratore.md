# /orchestratore — Orchestratore VoiceForm

Leggi `../requirements/requirements.md` e coordina lo sviluppo dell'app VoiceForm.
Se l'utente passa argomenti dopo `/orchestratore`, trattali come task di sviluppo aggiuntivi da assegnare ai sub-agent dev.

## Processo

1. Leggi in parallelo:
   - `../requirements/requirements.md`
   - `src/app/page.tsx`
   - `src/app/api/understand/route.ts`

2. Analizza cosa manca rispetto ai requisiti. Se l'utente ha passato task specifici negli argomenti, aggiungili alla lista.

3. Lancia i seguenti sub-agent **tutti in parallelo** (più tool call Agent in un singolo messaggio):

   - **`dev`** (uno per ogni task di sviluppo indipendente) — implementa API routes, componenti React, script PDF. Vincoli: TypeScript strict, Tailwind, zero API key esterne, pdf-lib, WCAG AA.

   - **`presentazione_agent`** — genera `../presentation/contenuto_slide.md` con il contenuto per le slide del hackathon.

   - **`readme_agent`** — genera `../README.md` con documentazione aggiornata del progetto.

4. Dopo il completamento dei dev agent: verifica che `npm run build` passi senza errori TypeScript.
