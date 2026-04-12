# Security Policy

## Principi

CAA4all e una webapp frontend-only. Non gestisce account utente e non persiste dati applicativi lato server.

## Superficie di attacco principale

- Upload file mappa (JPEG/PNG)
- Rendering immagini nel browser
- Export PNG/PDF client-side
- Risorse esterne (Google Fonts)

## Contromisure implementate

- Limite file upload: 2 MB
- Validazione MIME + magic bytes
- Limite dimensione immagine: 10000x10000 px
- Limite simboli posizionabili: 200
- Header di sicurezza su Cloudflare (`public/_headers`)
- CSP restrittiva
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Permissions-Policy` minimalista

## Header di sicurezza correnti

Configurati in `public/_headers`:
- `Content-Security-Policy`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Resource-Policy: same-origin`
- `X-XSS-Protection: 1; mode=block`

## Disclosure vulnerabilita

Se trovi una vulnerabilita:
1. Non aprire issue pubblica con dettagli exploit.
2. Scrivi a `info@caa4all.org` con:
   - descrizione tecnica
   - impatto
   - passaggi di riproduzione
   - eventuale proof of concept
3. Riceverai riscontro e piano di patch.

## Obiettivi futuri

- Revisione periodica CSP
- Testing automatico base su upload e export
- Hardening ulteriore su parsing immagini edge case
