# VoiceForm — Requisiti Funzionali

## Profilo Utente
Persona con disabilità motoria (tremore essenziale, emiplegia) che non riesce a usare tastiera e mouse per compilare moduli digitali della PA italiana.

## Scenario
L'utente deve compilare una Dichiarazione Sostitutiva di Certificazione (DPR 445/2000) online. Il modulo richiede ~10 campi anagrafici. Senza VoiceForm, la persona non può completare autonomamente l'operazione.

## Requisiti Funzionali
1. L'utente carica un PDF compilabile (con campi AcroForm) oppure usa quello predefinito
2. Il sistema estrae automaticamente i campi del form dal PDF
3. L'utente attiva il microfono e parla in italiano
4. Il sistema trascrive il parlato in tempo reale (Web Speech API)
5. Il sistema identifica quale campo viene descritto e quale valore inserire
6. Il campo viene compilato automaticamente nel PDF visualizzato
7. L'utente può scaricare il PDF compilato
8. L'interfaccia è accessibile: font grande, contrasto alto, feedback visivo e testuale

## Requisiti Non Funzionali
- Zero API key esterne: Web Speech API (browser) + pattern matching (server)
- Funziona in Chrome/Edge
- Tempo di risposta < 2 secondi dalla fine del parlato alla compilazione
- Supporto lingua italiana

## Capability Agentica Dimostrata
- Rilevamento del campo: capisce "il mio nome è Mario" → campo `nome` = "Mario"
- Parsing multi-campo: "mi chiamo Mario Rossi nato a Roma il 3 marzo 1970" → 4 campi in un'unica frase
- Gestione ambiguità: confidence score per ogni estrazione
- Progresso: mostra quali campi sono stati compilati e quali mancano

## Stack Tecnologico
- Next.js 14 (App Router, TypeScript, Tailwind CSS)
- pdf-lib: estrazione campi AcroForm + filling
- Web Speech API: trascrizione voce in browser (gratis, built-in)
- Pattern matching: mappatura trascrizione → campi (server-side, no AI key)
