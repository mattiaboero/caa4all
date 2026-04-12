# CAA4all

Mappe museali accessibili con simboli CAA (Comunicazione Aumentativa Alternativa).

CAA4all e una webapp gratuita che permette di:
- caricare una planimetria museo (JPEG/PNG)
- posizionare simboli CAA su mappa
- aggiungere etichette testuali
- esportare in PNG o PDF (A4/A3)

Sito pubblico: [https://caa4all.org](https://caa4all.org)

## Obiettivo del progetto

CAA4all nasce per dare a musei, professionisti e associazioni uno strumento semplice per costruire percorsi piu comprensibili e inclusivi senza costi di licenza, senza login e senza backend.

## Stato attuale

- Landing pubblica attiva su `/`
- Editor disponibile ma non esposto pubblicamente tramite i percorsi storici `/app` e `/editor`
- Libreria simboli organizzata in 5 categorie colore (palette Okabe-Ito)
- Simboli attivi attualmente in app: 32

## Funzionalita principali

- Upload mappa JPEG/PNG (max 2 MB)
- Validazione formato (MIME + magic bytes)
- Limite dimensioni immagine: 10000x10000 px
- Posizionamento simboli con griglia magnetica opzionale
- Etichette testuali per simbolo
- Undo (fino a 50 azioni)
- Export PNG
- Export PDF A4 / A3 (generazione client-side)
- Interfaccia multilingua: IT, EN, FR, ES, DE

## Stack tecnico

- React 18
- Vite 8
- @vitejs/plugin-react 6
- lucide-react
- Hosting: Cloudflare Pages

## Avvio locale

Prerequisiti:
- Node.js 20+
- npm 10+

Comandi:

```bash
npm install
npm run dev
```

Build produzione:

```bash
npm run build
npm run preview
```

## Struttura essenziale

```text
caa4all/
├── index.html            # Landing pubblica
├── index-app.html        # Shell editor React
├── src/
│   ├── main.jsx
│   └── App.jsx           # Logica applicativa principale
├── public/
│   ├── simboli/          # Set SVG simboli CAA
│   ├── simboli-caa4all.zip
│   ├── _headers          # Header di sicurezza Cloudflare
│   └── _redirects        # Redirect route pubbliche
└── docs/                 # Documentazione tecnica e di prodotto
```

## Simboli CAA

Categorie attive in app:
- Orientamento
- Servizi
- Contenuti
- Accessibilita
- Sicurezza

I simboli SVG sono in `public/simboli/` e lo zip scaricabile e rigenerato in `public/simboli-caa4all.zip`.

## Privacy e dati

- Nessun login
- Nessun backend applicativo
- Nessun salvataggio server delle immagini caricate
- Elaborazione mappe solo nel browser utente

Testi legali in app (privacy/cookie) aggiornati al 12 aprile 2026.

## Sicurezza

Header hardening configurati in `public/_headers`:
- `Content-Security-Policy`
- `X-Content-Type-Options`
- `X-Frame-Options`
- `Referrer-Policy`
- `Cross-Origin-Opener-Policy`
- `Cross-Origin-Resource-Policy`
- `Permissions-Policy`

Dettagli: vedi [SECURITY.md](./SECURITY.md).

## Documentazione

- [CONTRIBUTING.md](./CONTRIBUTING.md)
- [SECURITY.md](./SECURITY.md)
- [docs/ARCHITETTURA.md](./docs/ARCHITETTURA.md)
- [docs/DEPLOY-CLOUDFLARE.md](./docs/DEPLOY-CLOUDFLARE.md)
- [docs/SIMBOLI-E-PALETTE.md](./docs/SIMBOLI-E-PALETTE.md)
- [docs/ACCESSIBILITA.md](./docs/ACCESSIBILITA.md)
- [docs/PRODOTTO-E-ROADMAP.md](./docs/PRODOTTO-E-ROADMAP.md)

## Contribuire

Apri una issue su GitHub o scrivi a `info@caa4all.org`.

Repository: [https://github.com/mattiaboero/caa4all](https://github.com/mattiaboero/caa4all)

## Licenza

- Codice: MIT (vedi `LICENSE`)
- Simboli: utilizzo, modifica e ridistribuzione consentiti senza vincoli (attribuzione gradita ma non obbligatoria)

## Autore

Mattia Boero - `info@caa4all.org`
