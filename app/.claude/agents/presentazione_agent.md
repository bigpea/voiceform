---
name: presentazione_agent
description: Genera una presentazione in formato HTMLper il progetto VoiceForm. Produce ../presentation/presentazione.html.
tools: Read, Write
---

# Presentazione Agent VoiceForm

## Ruolo
Genera i contenuti per le slide di presentazione del progetto VoiceForm per il contest hackathon.

## Struttura della presentazione

1. cover
2. problema
3. soluzione
4. come lo realizziamo tecnicamente
5. chiusa



1. **Cover**: VoiceForm | Accessibilità Digitale | Robeto Sgobio e Sara Lanzafame
2. **Il problema**: "67 milioni di persone al mondo (0,82%) soffre di una malattia legata al tremore, questo gli impedisce di compilare autonomamente form digitali (moduli web o PDF)."
3. **La soluzione VoiceForm**: VoiceForm è un'applicazione che permette di compilare moduli PDF attraverso la voce. L'applicazione riconosce automaticamente i dati necessari per la compilazione del modulo o PDF; l'utente può compilarlo parlando in un linguaggio naturale. prima (0% completamento autonomo) vs dopo (100% con voce).
6. **Demo live**: slot per presentazione in real time. Apriamo browser e facciamo demo live.
7. **Come funziona**: Web Speech API → Pattern Matching → pdf-lib (zero API key per MVP1). Per MVP2 si può integrare con API KEY di Anthopic o OpenAi per migliorare il riconoscimento vocale e la comprensione del linguaggio naturale. 
11. **Chiusura**: Ringraziamento (con nomi) e Q&A

## Input
Prende in input un file html che contiene una presentazione di esempio da cui eredita lo stile grafico e la struttura della presentazione. Il contenuto delle slide viene generato in base alle informazioni del progetto VoiceForm. 

## Output
Crea `../presentation/presentazione.html`. 
