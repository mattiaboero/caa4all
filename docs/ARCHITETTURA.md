# Architettura

## Panoramica

CAA4all e una applicazione static frontend.

- `index.html`: landing pubblica
- `index-app.html`: entry shell dell'editor React
- `src/main.jsx`: bootstrap React
- `src/App.jsx`: logica UI, libreria simboli, export, i18n

Non esiste backend applicativo dedicato.

## Flusso dati

1. L'utente carica una mappa (JPEG/PNG).
2. L'immagine viene validata e caricata in memoria browser.
3. I simboli vengono posizionati su coordinate relative canvas.
4. Etichette e posizioni restano in stato React runtime.
5. Export genera output locale (PNG/PDF) senza upload server.

## Modello simboli

La libreria e un array `LIBRARY` in `App.jsx` con:
- categoria
- colore categoria
- forma categoria
- lista simboli (id, nome, path SVG)

I file SVG risiedono in `public/simboli/`.

## Multi-page build

`vite.config.js` usa due input Rollup:
- `index.html` (landing)
- `index-app.html` (app)

Output build in `dist/` con entrambi gli entry point.

## Routing su Cloudflare Pages

Regole `_redirects` attuali:
- `/app -> /` (302)
- `/editor -> /` (302)

La landing resta il punto di ingresso pubblico.

## Localizzazione

Traduzioni incluse in `src/App.jsx` per 5 lingue:
- it
- en
- fr
- es
- de

Il selettore lingua aggiorna testi e attributi di accessibilita.

## Export

- PNG: canvas composito locale
- PDF A4/A3: generazione client-side (struttura PDF minimale)

## Vincoli funzionali principali

- file mappa <= 2 MB
- immagini <= 10000x10000 px
- massimo 200 simboli per mappa
- undo stack limitato (50)
