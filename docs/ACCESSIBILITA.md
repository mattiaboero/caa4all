# Accessibilita

## Obiettivo

Rendere l'editor utilizzabile anche con tastiera e tecnologie assistive.

## Stato attuale

- Navigazione con Tab su elementi interattivi
- Attivazione con Enter
- Rimozione simbolo con Canc/Backspace
- Undo con Ctrl+Z/Cmd+Z
- Skip link verso area mappa
- Messaggi errore annunciati via `role="alert"`
- Label ARIA su pulsanti e controlli principali
- Palette Okabe-Ito per distinguibilita cromatica
- Doppia codifica categoria: colore + forma

## Aree da migliorare

- Navigazione fine dei simboli in mappa via tastiera
- Miglioramento ulteriore annunci screen reader nel canvas editor
- Test periodici con utenti reali e assistive tech

## Verifica manuale rapida

1. Apri editor senza mouse.
2. Controlla focus visibile su tutti i controlli.
3. Carica mappa e posiziona simboli via tastiera.
4. Verifica annunci errori e stati.
5. Testa export PNG/PDF.

## Riferimenti

- WCAG 2.2 (criteri A/AA rilevanti)
- Pattern ARIA Authoring Practices
