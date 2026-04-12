# Deploy su Cloudflare Pages

## Pipeline

1. Push su `main` in GitHub.
2. Cloudflare Pages clona la repo.
3. Install dipendenze (`npm install`).
4. Build (`npm run build`).
5. Pubblicazione asset `dist/`.

## Comandi build

Da `package.json`:

```bash
npm run build
```

## Config importanti

- `vite.config.js`: build multi-page (`index.html`, `index-app.html`)
- `public/_headers`: header sicurezza e cache policy
- `public/_redirects`: redirect route pubbliche bloccate

## Verifiche post deploy consigliate

- `/` carica landing
- `/app` redirige a `/`
- `/editor` redirige a `/`
- editor disponibile solo sui percorsi previsti dalla configurazione corrente
- `simboli-caa4all.zip` scaricabile
- export PNG/PDF funzionante

## Errori comuni

- Regole `_redirects` in conflitto (possibili loop)
- `_redirects` non valido per sintassi/spazi
- cache CDN non aggiornata (testare con hard refresh/incognito)

## Checklist release

- build locale ok
- nessun placeholder testuale in produzione
- documentazione aggiornata
- commit con summary/description chiari
