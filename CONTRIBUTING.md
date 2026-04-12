# Contributing

Grazie per voler contribuire a CAA4all.

## Come proporre modifiche

1. Apri una issue con problema/proposta.
2. Spiega impatto utente e contesto museo/accessibilita.
3. Per modifiche grandi, concorda prima l'approccio.
4. Invia una pull request piccola e focalizzata.

## Tipi di contributo utili

- Nuovi simboli CAA
- Miglioramenti accessibilita UX/UI
- Fix bug export PNG/PDF
- Correzioni traduzioni
- Hardening sicurezza frontend
- Pulizia documentazione

## Regole sui simboli

- Ogni simbolo deve rappresentare un'azione chiara.
- Mantenere canvas e stile coerenti con il set corrente (`viewBox 0 0 80 80`).
- Rispettare i colori categoria (Okabe-Ito):
  - Orientamento `#0072B2`
  - Servizi `#E69F00`
  - Contenuti `#56B4E9`
  - Accessibilita `#009E73`
  - Sicurezza `#D55E00`
- Verificare leggibilita su dimensioni ridotte.

## Setup locale

```bash
npm install
npm run dev
```

## Controlli prima di PR

```bash
npm run build
```

Checklist:
- nessun errore console bloccante
- export PNG/PDF funzionante
- tastiera: Tab, Enter, Canc, Ctrl/Cmd+Z
- nessun placeholder legale nei testi pubblici
- documentazione aggiornata se cambia comportamento

## Scope delle PR

Preferire PR singole e ben delimitate:
- `feat(symbols): ...`
- `fix(accessibility): ...`
- `docs: ...`
- `chore: ...`

## Contatti

- Email: `info@caa4all.org`
- Issue tracker: <https://github.com/mattiaboero/caa4all/issues>
