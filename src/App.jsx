import { useState, useRef, useCallback, useEffect } from "react";
import { Download, MousePointer2, ZoomIn, ZoomOut, Upload, X, RotateCcw, Image, HelpCircle, Search, ChevronUp, ChevronDown, Layers, Shield, Cookie, Info, FileDown } from "lucide-react";

/* === PALETTE — Okabe-Ito colorblind-safe === */
const C = {
  bg: "#F5F3F0", surface: "#FFFFFF", surfaceAlt: "#ECEAE6", border: "#CCC8C0",
  text: "#1A1A1A", textMuted: "#6B6560", textLight: "#9B9590",
  primary: "#0072B2", primaryHover: "#005A8C", primaryLight: "#E3F0F8",
  secondary: "#E69F00", secondaryLight: "#FFF5E0",
  accent: "#009E73", accentLight: "#E0F5EF",
  warning: "#D55E00", warningLight: "#FDECE3",
  danger: "#CC3D3D", dangerLight: "#FDE8E8",
  mapBg: "#E0DEDA", toolbarBg: "#2C2926", toolbarText: "#F5F3F0",
};

const MAX_FILE = 2 * 1024 * 1024;
const DEFAULT_SIZE = 64;

/* === SYMBOL LIBRARY === */
const sv = (bg, inner) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" rx="12" fill="${bg}"/>${inner}</svg>`)}`;

const LIBRARY = [
  { category: "Orientamento", color: "#0072B2", symbols: [
    { id: "ingresso", name: "Ingresso", src: sv("#0072B2",'<path d="M30 20h20v40H30z" fill="none" stroke="#fff" stroke-width="3"/><path d="M40 32l8 8-8 8" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><line x1="26" y1="40" x2="48" y2="40" stroke="#fff" stroke-width="3" stroke-linecap="round"/>') },
    { id: "uscita", name: "Uscita", src: sv("#0072B2",'<path d="M30 20h20v40H30z" fill="none" stroke="#fff" stroke-width="3"/><path d="M50 32l8 8-8 8" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><line x1="36" y1="40" x2="58" y2="40" stroke="#fff" stroke-width="3" stroke-linecap="round"/>') },
    { id: "inizio", name: "Inizio percorso", src: sv("#0072B2",'<circle cx="40" cy="40" r="16" fill="none" stroke="#fff" stroke-width="3"/><polygon points="36,30 52,40 36,50" fill="#fff"/>') },
    { id: "fine", name: "Fine percorso", src: sv("#0072B2",'<circle cx="40" cy="40" r="16" fill="none" stroke="#fff" stroke-width="3"/><rect x="32" y="32" width="16" height="16" rx="2" fill="#fff"/>') },
    { id: "scale", name: "Scale", src: sv("#0072B2",'<path d="M20 58h8v-8h8v-8h8v-8h8v-8h8" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>') },
    { id: "ascensore", name: "Ascensore", src: sv("#0072B2",'<rect x="22" y="16" width="36" height="48" rx="4" fill="none" stroke="#fff" stroke-width="3"/><line x1="40" y1="20" x2="40" y2="60" stroke="#fff" stroke-width="2"/><path d="M30 34l-4-6 4-6" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M50 40l4 6-4 6" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>') },
    { id: "tu_sei_qui", name: "Tu sei qui", src: sv("#0072B2",'<circle cx="40" cy="36" r="10" fill="#fff" opacity="0.3"/><circle cx="40" cy="36" r="5" fill="#fff"/><path d="M40 48v10" stroke="#fff" stroke-width="3" stroke-linecap="round"/>') },
  ]},
  { category: "Servizi", color: "#E69F00", symbols: [
    { id: "biglietteria", name: "Biglietteria", src: sv("#E69F00",'<rect x="18" y="24" width="44" height="28" rx="5" fill="none" stroke="#fff" stroke-width="3"/><circle cx="40" cy="38" r="8" fill="none" stroke="#fff" stroke-width="2.5"/><text x="40" y="43" text-anchor="middle" fill="#fff" font-size="14" font-weight="700" font-family="sans-serif">€</text>') },
    { id: "bagno", name: "Bagno", src: sv("#E69F00",'<rect x="18" y="38" width="18" height="16" rx="3" fill="none" stroke="#fff" stroke-width="2.5"/><path d="M44 28c0-4 4-4 4-10" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/><path d="M50 28c0-4 4-4 4-10" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/><rect x="38" y="30" width="22" height="18" rx="3" fill="none" stroke="#fff" stroke-width="2.5"/><path d="M22 54v4" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/><path d="M32 54v4" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>') },
    { id: "bar", name: "Bar", src: sv("#E69F00",'<rect x="18" y="32" width="32" height="24" rx="4" fill="none" stroke="#fff" stroke-width="3"/><path d="M50 38h6a4 4 0 010 8h-6" fill="none" stroke="#fff" stroke-width="3"/><path d="M28 28c0-6 4-6 4-12" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/><path d="M38 28c0-6 4-6 4-12" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>') },
    { id: "guardaroba", name: "Guardaroba", src: sv("#E69F00",'<path d="M26 56V30l14-12 14 12v26" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="40" cy="32" r="3" fill="#fff"/>') },
    { id: "bookshop", name: "Bookshop", src: sv("#E69F00",'<path d="M18 22l22-6 22 6v36l-22-6-22 6z" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round"/><line x1="40" y1="16" x2="40" y2="52" stroke="#fff" stroke-width="2.5"/>') },
    { id: "fontanella", name: "Fontanella", src: sv("#E69F00",'<path d="M28 50V30h24v20" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M36 38c0-6 8-6 8 0" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>') },
    { id: "gel", name: "Gel igienizzante", src: sv("#E69F00",'<rect x="30" y="18" width="20" height="32" rx="4" fill="none" stroke="#fff" stroke-width="2.5"/><path d="M36 50v4m8-4v4m-4-4v6" stroke="#fff" stroke-width="2" stroke-linecap="round"/><rect x="34" y="14" width="12" height="6" rx="2" fill="#fff"/>') },
    { id: "infermeria", name: "Infermeria", src: sv("#E69F00",'<rect x="32" y="22" width="16" height="36" rx="2" fill="#fff"/><rect x="22" y="32" width="36" height="16" rx="2" fill="#fff"/>') },
    { id: "panchina", name: "Area sosta", src: sv("#E69F00",'<rect x="20" y="34" width="40" height="6" rx="3" fill="#fff"/><rect x="20" y="40" width="4" height="18" rx="2" fill="#fff"/><rect x="56" y="40" width="4" height="18" rx="2" fill="#fff"/><rect x="18" y="24" width="4" height="14" rx="2" fill="#fff"/><rect x="58" y="24" width="4" height="14" rx="2" fill="#fff"/>') },
  ]},
  { category: "Contenuti", color: "#56B4E9", symbols: [
    { id: "reperto", name: "Oggetto esposto", src: sv("#56B4E9",'<rect x="20" y="26" width="40" height="32" rx="3" fill="none" stroke="#fff" stroke-width="2.5"/><path d="M28 26V18h24v8" fill="none" stroke="#fff" stroke-width="2.5" stroke-linejoin="round"/><circle cx="40" cy="42" r="7" fill="#fff" opacity="0.5"/>') },
    { id: "audio_racconto", name: "Audio racconto", src: sv("#56B4E9",'<circle cx="36" cy="28" r="8" fill="none" stroke="#fff" stroke-width="3"/><path d="M36 36v12" stroke="#fff" stroke-width="3" stroke-linecap="round"/><rect x="28" y="48" width="16" height="8" rx="3" fill="#fff"/><path d="M50 22a14 14 0 010 16" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/><path d="M56 18a20 20 0 010 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>') },
    { id: "video", name: "Video proiezione", src: sv("#56B4E9",'<rect x="16" y="22" width="48" height="30" rx="4" fill="none" stroke="#fff" stroke-width="3"/><polygon points="36,30 36,48 50,39" fill="#fff"/><line x1="30" y1="58" x2="50" y2="58" stroke="#fff" stroke-width="3" stroke-linecap="round"/>') },
    { id: "testo", name: "Testo", src: sv("#56B4E9",'<rect x="20" y="18" width="40" height="44" rx="4" fill="none" stroke="#fff" stroke-width="2.5"/><line x1="28" y1="28" x2="52" y2="28" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/><line x1="28" y1="36" x2="52" y2="36" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/><line x1="28" y1="44" x2="44" y2="44" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>') },
    { id: "aula", name: "Aula didattica", src: sv("#56B4E9",'<rect x="22" y="30" width="36" height="22" rx="3" fill="none" stroke="#fff" stroke-width="2.5"/><circle cx="30" cy="22" r="4" fill="#fff"/><circle cx="40" cy="22" r="4" fill="#fff"/><circle cx="50" cy="22" r="4" fill="#fff"/><line x1="28" y1="58" x2="28" y2="52" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/><line x1="52" y1="58" x2="52" y2="52" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>') },
    { id: "visita_guidata", name: "Visita guidata", src: sv("#56B4E9",'<circle cx="30" cy="24" r="5" fill="#fff"/><path d="M30 30v16" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/><path d="M30 34l16-4" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/><circle cx="50" cy="22" r="3" fill="#fff" opacity="0.5"/><circle cx="54" cy="30" r="3" fill="#fff" opacity="0.5"/><circle cx="48" cy="36" r="3" fill="#fff" opacity="0.5"/>') },
    { id: "toccare_si", name: "Toccare consentito", src: sv("#56B4E9",'<path d="M34 50V28a4 4 0 018 0v10m0 0v-4a4 4 0 018 0v6m-24 10V34a4 4 0 018 0" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/><circle cx="56" cy="56" r="10" fill="#009E73"/><path d="M52 56l3 3 6-6" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>') },
    { id: "toccare_no", name: "Non toccare", src: sv("#56B4E9",'<path d="M34 50V28a4 4 0 018 0v10m0 0v-4a4 4 0 018 0v6m-24 10V34a4 4 0 018 0" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/><circle cx="56" cy="56" r="10" fill="#CC3D3D"/><path d="M52 52l8 8m0-8l-8 8" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>') },
    { id: "foto_si", name: "Foto consentite", src: sv("#56B4E9",'<rect x="20" y="28" width="32" height="24" rx="4" fill="none" stroke="#fff" stroke-width="2.5"/><circle cx="36" cy="40" r="6" fill="none" stroke="#fff" stroke-width="2.5"/><circle cx="58" cy="56" r="10" fill="#009E73"/><path d="M54 56l3 3 6-6" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>') },
    { id: "foto_no", name: "Foto vietate", src: sv("#56B4E9",'<rect x="20" y="28" width="32" height="24" rx="4" fill="none" stroke="#fff" stroke-width="2.5"/><circle cx="36" cy="40" r="6" fill="none" stroke="#fff" stroke-width="2.5"/><circle cx="58" cy="56" r="10" fill="#CC3D3D"/><path d="M54 52l8 8m0-8l-8 8" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>') },
  ]},
  { category: "Accessibilità", color: "#009E73", symbols: [
    { id: "acc_motoria", name: "Accessibilità motoria", src: sv("#009E73",'<circle cx="42" cy="22" r="5" fill="#fff"/><path d="M36 56l6-16h10l4 16" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="32" cy="56" r="8" fill="none" stroke="#fff" stroke-width="2.5"/><path d="M42 30v10h10" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>') },
    { id: "tattile", name: "Percorso tattile", src: sv("#009E73",'<circle cx="28" cy="26" r="4" fill="#fff"/><circle cx="40" cy="26" r="4" fill="#fff"/><circle cx="52" cy="26" r="4" fill="#fff"/><circle cx="28" cy="40" r="4" fill="#fff"/><circle cx="40" cy="40" r="4" fill="#fff"/><circle cx="52" cy="40" r="4" fill="#fff"/><circle cx="28" cy="54" r="4" fill="#fff"/><circle cx="40" cy="54" r="4" fill="#fff"/><circle cx="52" cy="54" r="4" fill="#fff"/>') },
    { id: "mappa_tattile", name: "Mappa tattile", src: sv("#009E73",'<rect x="18" y="22" width="44" height="36" rx="4" fill="none" stroke="#fff" stroke-width="2.5"/><path d="M26 40h28M40 28v24" stroke="#fff" stroke-width="2" stroke-linecap="round"/><circle cx="34" cy="34" r="3" fill="#fff"/><circle cx="48" cy="46" r="3" fill="#fff"/>') },
    { id: "audio_guida", name: "Audio guida", src: sv("#009E73",'<rect x="28" y="18" width="24" height="40" rx="6" fill="none" stroke="#fff" stroke-width="2.5"/><circle cx="40" cy="48" r="3" fill="#fff"/><path d="M20 30c0-4 4-6 8-6m24 0c4 0 8 2 8 6" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>') },
    { id: "lis", name: "LIS", src: sv("#009E73",'<text x="40" y="50" text-anchor="middle" fill="#fff" font-size="24" font-weight="700" font-family="sans-serif">LIS</text>') },
    { id: "caa", name: "CAA", src: sv("#009E73",'<text x="40" y="50" text-anchor="middle" fill="#fff" font-size="22" font-weight="700" font-family="sans-serif">CAA</text>') },
    { id: "rampa", name: "Rampa", src: sv("#009E73",'<path d="M16 58l48-28" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/><circle cx="40" cy="38" r="4" fill="#fff"/><path d="M40 42v8" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>') },
    { id: "cane_guida", name: "Cane guida", src: sv("#009E73",'<path d="M22 52l6-14 10 2 8-8 8 4v16" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="52" cy="30" r="3" fill="#fff"/><circle cx="60" cy="58" r="8" fill="#009E73" stroke="#fff" stroke-width="2"/><path d="M56 58l3 3 5-5" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>') },
    { id: "bagno_acc", name: "Bagno accessibile", src: sv("#009E73",'<circle cx="40" cy="22" r="5" fill="#fff"/><path d="M34 56l6-16h10" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="30" cy="56" r="7" fill="none" stroke="#fff" stroke-width="2.5"/><path d="M40 30v10h10l4 12" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>') },
  ]},
  { category: "Sicurezza", color: "#D55E00", symbols: [
    { id: "emergenza", name: "Uscita emergenza", src: sv("#D55E00",'<rect x="16" y="20" width="48" height="40" rx="4" fill="none" stroke="#fff" stroke-width="3"/><path d="M36 30v10h-6l10 12 10-12h-6V30z" fill="#fff"/>') },
    { id: "punto_raccolta", name: "Punto di raccolta", src: sv("#D55E00",'<circle cx="30" cy="30" r="4" fill="#fff"/><circle cx="40" cy="26" r="4" fill="#fff"/><circle cx="50" cy="30" r="4" fill="#fff"/><path d="M24 56h32" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="M30 36v20m10-24v24m10-22v22" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>') },
    { id: "estintore", name: "Estintore", src: sv("#D55E00",'<rect x="30" y="24" width="20" height="34" rx="6" fill="none" stroke="#fff" stroke-width="3"/><path d="M38 24v-6h8" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><line x1="40" y1="36" x2="40" y2="48" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>') },
    { id: "dae", name: "Defibrillatore", src: sv("#D55E00",'<path d="M40 58s-18-12-18-26a12 12 0 0124-4 12 12 0 0124 4c0 14-18 26-18 26z" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round"/><path d="M32 38l6-10 4 14 6-10" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>') },
  ]},
];

/* === PROJECT TEXT === */
const PROJECT_TEXT = [
  { type: "title", text: "CAA4all" },
  { type: "paragraph", text: "Nei musei che provano a rendere i percorsi accessibili alle persone con disabilità comunicative, manca quasi sempre lo strumento per farlo senza budget e senza grafico. Ho costruito CAA4all per questo: è una webapp gratuita dove carichi la planimetria del tuo museo e ci posizioni sopra i simboli CAA che ti servono. Scarichi il risultato come immagine e da lì decidi tu cosa farne: stamparlo, prestarlo ai visitatori, metterlo a disposizione online." },
  { type: "paragraph", text: "I simboli li ho disegnati io, Mattia Boero. Ogni simbolo rappresenta quello che il visitatore fa in quel punto, non quello che siamo abituati a vedere sui cartelli. Il bagno è le mani sotto l'acqua e il water, non la sagoma uomo/donna. La biglietteria è una mano che porge un biglietto attraverso una finestrella. Il percorso tattile sono piedi che seguono una striscia di punti in rilievo. Nella CAA conta l'azione, non il pittogramma convenzionale." },
  { type: "heading", text: "Uso, riuso, ridistribuzione" },
  { type: "paragraph", text: "Simboli e mappe prodotte con CAA4all si possono usare, modificare e ridistribuire gratis. Non ci sono condizioni d'uso: valgono per qualsiasi scopo, compreso quello commerciale. Se volete citarmi come autore mi fa piacere, ma non è un obbligo. Ho scelto di farlo così perché i simboli per l'accessibilità funzionano solo se girano, e non ha senso metterci un prezzo o un vincolo sopra." },
  { type: "heading", text: "File sorgente" },
  { type: "paragraph", text: "Se vuoi modificare un simbolo (cambiare un colore, adattarlo al tuo museo, aggiungere un dettaglio), puoi farlo. I file vettoriali SVG sono scaricabili gratuitamente da questa pagina e ridistribuibili alle stesse condizioni." },
  { type: "download" },
  { type: "heading", text: "Contatti" },
  { type: "paragraph", text: "Se lavori nell'accessibilità museale e hai suggerimenti, correzioni o richieste di nuovi simboli, scrivimi a [email]." },
];

/* === GDPR TEXTS === */
const PRIVACY_POLICY = `Informativa sulla privacy ai sensi del Regolamento (UE) 2016/679 (GDPR)

Ultimo aggiornamento: marzo 2026

1. Titolare del trattamento
Il titolare del trattamento è [Nome del titolare / Ragione sociale], con sede in [indirizzo], contattabile all'indirizzo email [email].

2. Dati raccolti
Questa applicazione web non raccoglie dati personali. Non è prevista alcuna forma di registrazione, login o autenticazione. Non vengono richiesti nome, email, indirizzo o altri dati identificativi.

3. Trattamento delle immagini
Le immagini caricate dall'utente (mappe museali) vengono elaborate interamente nel browser dell'utente, sul suo dispositivo. Nessuna immagine viene trasmessa a server esterni, archiviata o conservata dall'applicazione. Al termine della sessione di navigazione o alla chiusura della pagina, tutte le immagini vengono eliminate automaticamente dalla memoria del browser.

4. Cookie
Questa applicazione non utilizza cookie di profilazione né cookie di terze parti a scopo pubblicitario. Per maggiori dettagli, consulta la Cookie Policy.

5. Dati di navigazione
Il server che ospita l'applicazione potrebbe raccogliere automaticamente alcuni dati tecnici (indirizzo IP, tipo di browser, sistema operativo, data e ora di accesso) nei log del server. Questi dati vengono trattati esclusivamente per garantire il funzionamento e la sicurezza del servizio, e non vengono utilizzati per identificare l'utente. La base giuridica è il legittimo interesse del titolare (art. 6, par. 1, lett. f del GDPR).

6. Trasferimento dei dati
Non viene effettuato alcun trasferimento di dati personali verso Paesi terzi o organizzazioni internazionali.

7. Periodo di conservazione
I dati tecnici di navigazione eventualmente registrati nei log del server vengono conservati per un massimo di 30 giorni, dopodiché vengono cancellati automaticamente.

8. Diritti dell'utente
Ai sensi degli articoli 15-22 del GDPR, l'utente ha diritto di accedere ai propri dati, richiederne la rettifica o la cancellazione, limitarne il trattamento, opporsi al trattamento e richiedere la portabilità dei dati. L'utente ha inoltre il diritto di proporre reclamo all'Autorità Garante per la Protezione dei Dati Personali (www.garanteprivacy.it).

Per esercitare i propri diritti, l'utente può contattare il titolare all'indirizzo email indicato al punto 1.

9. Modifiche
Il titolare si riserva di aggiornare la presente informativa. Eventuali modifiche saranno pubblicate su questa pagina con indicazione della data di ultimo aggiornamento.`;

const COOKIE_POLICY = `Cookie Policy ai sensi del Regolamento (UE) 2016/679 (GDPR) e della Direttiva 2002/58/CE (ePrivacy)

Ultimo aggiornamento: marzo 2026

1. Cosa sono i cookie
I cookie sono piccoli file di testo che i siti web memorizzano sul dispositivo dell'utente. Possono essere utilizzati per diverse finalità: funzionamento tecnico del sito, analisi del traffico, profilazione pubblicitaria.

2. Cookie utilizzati da questa applicazione
Questa applicazione non utilizza cookie di alcun tipo. In particolare:
a) Non vengono utilizzati cookie di profilazione.
b) Non vengono utilizzati cookie di terze parti a scopo pubblicitario.
c) Non vengono utilizzati cookie analitici (Google Analytics o strumenti simili).
d) Non vengono utilizzati cookie di sessione per il login, poiché l'applicazione non prevede autenticazione.

L'applicazione potrebbe utilizzare esclusivamente cookie tecnici strettamente necessari al funzionamento della pagina web (ad esempio, cookie impostati dal server di hosting per la gestione della connessione). Questi cookie non richiedono il consenso dell'utente ai sensi dell'art. 5, par. 3, della Direttiva ePrivacy, in quanto indispensabili per l'erogazione del servizio.

3. Dati memorizzati nel browser
L'applicazione utilizza temporaneamente la memoria del browser (RAM) per elaborare le immagini caricate dall'utente. Questi dati non vengono scritti in alcuno spazio di archiviazione persistente (localStorage, sessionStorage, IndexedDB) e vengono eliminati automaticamente alla chiusura della pagina.

4. Cookie di terze parti
L'applicazione carica il font Lexend da Google Fonts. Google potrebbe impostare cookie tecnici per ottimizzare la distribuzione del font. Per informazioni sui cookie di Google, consultare: policies.google.com/privacy

5. Come gestire i cookie
L'utente può gestire le preferenze sui cookie attraverso le impostazioni del proprio browser. La disattivazione dei cookie tecnici potrebbe compromettere il funzionamento dell'applicazione.

Istruzioni per i browser principali:
- Chrome: Impostazioni > Privacy e sicurezza > Cookie
- Firefox: Impostazioni > Privacy e sicurezza
- Safari: Preferenze > Privacy
- Edge: Impostazioni > Cookie e autorizzazioni sito

6. Aggiornamenti
Eventuali modifiche alla presente Cookie Policy verranno pubblicate su questa pagina.

7. Contatti
Per informazioni sui cookie utilizzati da questa applicazione, contattare il titolare all'indirizzo email indicato nella Privacy Policy.`;

/* === HOOKS === */
function useBreakpoint() {
  const [bp, setBp] = useState("desktop");
  useEffect(() => {
    const check = () => { const w = window.innerWidth; setBp(w < 640 ? "mobile" : w < 1024 ? "tablet" : "desktop"); };
    check(); window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return bp;
}

/* === MODAL === */
function Modal({ title, onClose, isMobile, children }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: isMobile ? 12 : 40 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.surface, borderRadius: 12, width: "100%", maxWidth: 680, maxHeight: isMobile ? "85vh" : "80vh", display: "flex", flexDirection: "column", boxShadow: "0 8px 40px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: isMobile ? "14px 16px" : "18px 24px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          <h2 style={{ margin: 0, fontSize: isMobile ? 16 : 18, fontWeight: 700, color: C.text }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.textMuted, padding: 4 }}><X size={20} /></button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "16px 16px 24px" : "24px 24px 32px", WebkitOverflowScrolling: "touch" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function PolicyContent({ text }) {
  return text.split("\n\n").map((block, i) => {
    if (/^Informativa|^Cookie Policy/.test(block)) return <h3 key={i} style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: "0 0 16px", lineHeight: 1.4 }}>{block}</h3>;
    if (/^Ultimo aggiornamento/.test(block)) return <p key={i} style={{ fontSize: 12, color: C.textMuted, margin: "0 0 20px", fontStyle: "italic" }}>{block}</p>;
    if (/^\d+\.\s/.test(block.trim())) {
      const lines = block.split("\n"); const heading = lines[0]; const body = lines.slice(1).join("\n");
      return <div key={i} style={{ marginBottom: 16 }}><h4 style={{ fontSize: 14, fontWeight: 600, color: C.text, margin: "0 0 6px" }}>{heading}</h4>{body && <p style={{ fontSize: 13, color: C.text, lineHeight: 1.7, margin: 0, whiteSpace: "pre-line" }}>{body}</p>}</div>;
    }
    return <p key={i} style={{ fontSize: 13, color: C.text, lineHeight: 1.7, margin: "0 0 12px", whiteSpace: "pre-line" }}>{block}</p>;
  });
}

function ProjectContent({ isMobile }) {
  return PROJECT_TEXT.map((block, i) => {
    if (block.type === "title") return <h3 key={i} style={{ fontSize: isMobile ? 22 : 26, fontWeight: 700, color: C.text, margin: "0 0 20px", letterSpacing: "-0.01em" }}>{block.text}</h3>;
    if (block.type === "heading") return <h4 key={i} style={{ fontSize: 15, fontWeight: 600, color: C.primary, margin: "24px 0 8px" }}>{block.text}</h4>;
    if (block.type === "download") return (
      <div key={i} style={{ margin: "12px 0 8px", padding: "14px 18px", background: C.primaryLight, borderRadius: 8, display: "flex", alignItems: "center", gap: 10 }}>
        <FileDown size={20} style={{ color: C.primary, flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.primary }}>Scarica i simboli SVG</div>
          <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>File vettoriali, gratuiti, ridistribuibili con attribuzione</div>
        </div>
      </div>
    );
    return <p key={i} style={{ fontSize: 14, color: C.text, lineHeight: 1.8, margin: "0 0 14px" }}>{block.text}</p>;
  });
}

function CookieBanner({ onAccept, isMobile }) {
  return (
    <div style={{ position: "fixed", bottom: isMobile ? 56 : 0, left: 0, right: 0, zIndex: 500, background: C.toolbarBg, color: C.toolbarText, padding: isMobile ? "12px 14px" : "14px 24px", display: "flex", alignItems: isMobile ? "flex-start" : "center", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 10 : 16, boxShadow: "0 -2px 16px rgba(0,0,0,0.2)" }}>
      <Cookie size={18} style={{ flexShrink: 0, marginTop: isMobile ? 2 : 0 }} />
      <p style={{ fontSize: 12, lineHeight: 1.6, margin: 0, flex: 1 }}>
        Questo sito utilizza esclusivamente cookie tecnici necessari al funzionamento dell'applicazione. Non vengono utilizzati cookie di profilazione o di terze parti a scopo pubblicitario. Continuando la navigazione accetti l'utilizzo dei cookie tecnici.
      </p>
      <button onClick={onAccept} style={{ padding: "8px 20px", borderRadius: 6, border: "none", background: C.secondary, color: C.toolbarBg, fontFamily: "inherit", fontWeight: 600, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>Ho capito</button>
    </div>
  );
}

/* === MAIN === */
export default function CAAMapBuilder() {
  const bp = useBreakpoint();
  const isMobile = bp === "mobile";
  const isTablet = bp === "tablet";

  const [mapImage, setMapImage] = useState(null);
  const [mapDim, setMapDim] = useState({ w: 0, h: 0 });
  const [placed, setPlaced] = useState([]);
  const [selected, setSelected] = useState(null);
  const [symSize, setSymSize] = useState(DEFAULT_SIZE);
  const [dragIdx, setDragIdx] = useState(null);
  const [dragOff, setDragOff] = useState({ x: 0, y: 0 });
  const [hoverIdx, setHoverIdx] = useState(null);
  const [scale, setScale] = useState(1);
  const [showHelp, setShowHelp] = useState(false);
  const [search, setSearch] = useState("");
  const [openCats, setOpenCats] = useState(() => LIBRARY.reduce((a, c) => ({ ...a, [c.category]: true }), {}));
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [modal, setModal] = useState(null); // "project" | "privacy" | "cookie" | null
  const [cookieAccepted, setCookieAccepted] = useState(false);

  const mapFileRef = useRef(null);
  const mapRef = useRef(null);

  const handleMap = (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    if (f.size > MAX_FILE) { setError("Il file supera 2 MB."); e.target.value = ""; return; }
    if (!f.type.match(/image\/(jpeg|png)/)) { setError("Formato non supportato. Usa JPEG o PNG."); e.target.value = ""; return; }
    setError(null);
    // Verify actual file content via magic bytes (MIME type alone can be spoofed)
    const headerReader = new FileReader();
    headerReader.onload = (he) => {
      const arr = new Uint8Array(he.target.result);
      const isJPEG = arr[0] === 0xFF && arr[1] === 0xD8 && arr[2] === 0xFF;
      const isPNG = arr[0] === 0x89 && arr[1] === 0x50 && arr[2] === 0x4E && arr[3] === 0x47;
      if (!isJPEG && !isPNG) { setError("Il file non è un'immagine JPEG o PNG valida."); return; }
      const r = new FileReader();
      r.onload = (ev) => {
        const img = new window.Image();
        img.onload = () => {
          // Reject images with extreme dimensions to prevent memory exhaustion
          if (img.width > 10000 || img.height > 10000) { setError("Immagine troppo grande. La dimensione massima è 10000×10000 pixel."); return; }
          setMapImage(ev.target.result); setMapDim({ w: img.width, h: img.height }); setPlaced([]); setScale(1);
        };
        img.onerror = () => { setError("Impossibile caricare l'immagine. Il file potrebbe essere danneggiato."); };
        img.src = ev.target.result;
      };
      r.onerror = () => { setError("Errore nella lettura del file."); };
      r.readAsDataURL(f);
    };
    headerReader.readAsArrayBuffer(f.slice(0, 8));
    e.target.value = "";
  };

  const placeSymbol = (e) => {
    if (!selected || !mapImage || dragIdx !== null) return;
    const rect = mapRef.current?.getBoundingClientRect(); if (!rect) return;
    const sym = LIBRARY.flatMap(c => c.symbols).find(s => s.id === selected); if (!sym) return;
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    setPlaced(p => {
      if (p.length >= 200) { setError("Numero massimo di simboli raggiunto (200)."); return p; }
      return [...p, { id: crypto.randomUUID(), src: sym.src, name: sym.name, x: (cx - rect.left) / scale - symSize / 2, y: (cy - rect.top) / scale - symSize / 2, size: symSize }];
    });
    if (isMobile) setDrawerOpen(false);
  };

  const startDrag = (e, idx) => {
    e.stopPropagation(); e.preventDefault();
    const rect = mapRef.current?.getBoundingClientRect(); if (!rect) return;
    const p = placed[idx];
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    setDragOff({ x: cx - rect.left - p.x * scale, y: cy - rect.top - p.y * scale }); setDragIdx(idx);
  };

  useEffect(() => {
    if (dragIdx === null) return;
    const mv = (e) => { const rect = mapRef.current?.getBoundingClientRect(); if (!rect) return; const cx = e.touches ? e.touches[0].clientX : e.clientX; const cy = e.touches ? e.touches[0].clientY : e.clientY; setPlaced(p => p.map((s, i) => i === dragIdx ? { ...s, x: (cx - rect.left - dragOff.x) / scale, y: (cy - rect.top - dragOff.y) / scale } : s)); };
    const up = () => setDragIdx(null);
    window.addEventListener("mousemove", mv); window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", mv, { passive: false }); window.addEventListener("touchend", up);
    return () => { window.removeEventListener("mousemove", mv); window.removeEventListener("mouseup", up); window.removeEventListener("touchmove", mv); window.removeEventListener("touchend", up); };
  }, [dragIdx, dragOff, scale]);

  const exportPNG = useCallback(async () => {
    if (!mapImage) return; setExporting(true);
    try {
      // Check canvas memory limits (mobile Safari can crash on very large canvases)
      const maxPixels = 16777216; // 4096x4096 safe limit for most mobile browsers
      if (mapDim.w * mapDim.h > maxPixels) { setError("L'immagine è troppo grande per l'esportazione. Usa una mappa con risoluzione inferiore."); setExporting(false); return; }
      const cv = document.createElement("canvas"); cv.width = mapDim.w; cv.height = mapDim.h; const ctx = cv.getContext("2d");
      if (!ctx) { setError("Il browser non supporta l'esportazione su canvas."); setExporting(false); return; }
      const mi = new window.Image(); await new Promise((r, j) => { mi.onload = r; mi.onerror = j; mi.src = mapImage; }); ctx.drawImage(mi, 0, 0, mapDim.w, mapDim.h);
      for (const p of placed) { const si = new window.Image(); await new Promise((r, j) => { si.onload = r; si.onerror = j; si.src = p.src; }); ctx.drawImage(si, p.x, p.y, p.size, p.size); }
      const a = document.createElement("a"); a.download = "mappa-caa-museo.png"; a.href = cv.toDataURL("image/png"); a.click();
      // Release canvas memory
      cv.width = 0; cv.height = 0;
    } catch (err) { setError("Errore durante l'esportazione. Riprova con un'immagine più piccola."); }
    setExporting(false);
  }, [mapImage, mapDim, placed]);

  const filtered = LIBRARY.map(c => ({ ...c, symbols: c.symbols.filter(s => s.name.toLowerCase().includes(search.toLowerCase())) })).filter(c => c.symbols.length > 0);
  const dW = mapDim.w * scale, dH = mapDim.h * scale;
  const sideW = isTablet ? 200 : 230;

  const SidebarContent = (
    <>
      <div style={{ padding: "10px 12px 6px" }}>
        <div style={{ position: "relative" }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: 10, color: C.textLight }} />
          <input placeholder="Cerca simbolo..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px 8px 30px", borderRadius: 7, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: "inherit", color: C.text, background: C.bg, outline: "none" }} />
        </div>
      </div>
      <div style={{ padding: "4px 12px 8px", borderBottom: `1px solid ${C.border}` }}>
        <label style={{ fontSize: 11, fontWeight: 500, color: C.textMuted, display: "flex", justifyContent: "space-between" }}><span>Dimensione</span><span style={{ color: C.text, fontWeight: 600 }}>{symSize}px</span></label>
        <input type="range" min={32} max={128} step={8} value={symSize} onChange={e => setSymSize(+e.target.value)} style={{ width: "100%", accentColor: C.primary, marginTop: 4 }} />
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "4px 0", WebkitOverflowScrolling: "touch" }}>
        {filtered.map(cat => (
          <div key={cat.category}>
            <button onClick={() => setOpenCats(p => ({ ...p, [cat.category]: !p[cat.category] }))} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 600, color: C.text, textAlign: "left" }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: cat.color, flexShrink: 0 }} />
              {cat.category}
              <span style={{ marginLeft: "auto", fontSize: 10, color: C.textLight }}>{openCats[cat.category] ? "▾" : "▸"}</span>
            </button>
            {openCats[cat.category] && (
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(auto-fill, minmax(70px, 1fr))" : "1fr 1fr 1fr", gap: 4, padding: "0 8px 8px" }}>
                {cat.symbols.map(sym => (
                  <button key={sym.id} onClick={() => setSelected(selected === sym.id ? null : sym.id)} title={sym.name} style={{ background: selected === sym.id ? C.primaryLight : C.bg, border: `2px solid ${selected === sym.id ? C.primary : "transparent"}`, borderRadius: 8, padding: isMobile ? 8 : 5, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, transition: "all 0.12s", minHeight: isMobile ? 72 : "auto" }}>
                    <img src={sym.src} alt={sym.name} style={{ width: isMobile ? 44 : 40, height: isMobile ? 44 : 40, objectFit: "contain" }} draggable={false} />
                    <span style={{ fontSize: isMobile ? 10 : 9, fontWeight: 500, color: selected === sym.id ? C.primary : C.textMuted, textAlign: "center", lineHeight: 1.2, wordBreak: "break-word" }}>{sym.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );

  return (
    <div style={{ minHeight: "100vh", maxHeight: "100vh", background: C.bg, fontFamily: "'Lexend', sans-serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap" rel="stylesheet" referrerPolicy="no-referrer" />
      <input ref={mapFileRef} type="file" accept="image/jpeg,image/png" onChange={handleMap} style={{ display: "none" }} />

      {/* HEADER */}
      <header style={{ background: C.toolbarBg, color: C.toolbarText, padding: isMobile ? "10px 12px" : "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, cursor: "pointer" }} onClick={() => setModal("project")}>
          <div style={{ width: isMobile ? 28 : 34, height: isMobile ? 28 : 34, borderRadius: 8, background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: isMobile ? 11 : 13, fontWeight: 700, color: "#fff" }}>4all</span>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: isMobile ? 14 : 18, fontWeight: 700, whiteSpace: "nowrap" }}>CAA4all</div>
            {!isMobile && <div style={{ fontSize: 11, opacity: 0.7, fontWeight: 300 }}>Mappe museali accessibili con simboli CAA</div>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <HBtn icon={<Info size={15}/>} label={isMobile ? "" : "Il progetto"} onClick={() => setModal("project")} />
          {!isMobile && <HBtn icon={<HelpCircle size={15}/>} label="Guida" onClick={() => setShowHelp(!showHelp)} />}
          <HBtn icon={<RotateCcw size={15}/>} label={isMobile ? "" : "Reset"} onClick={() => { setPlaced([]); setMapImage(null); setError(null); }} />
          <HBtn icon={<Download size={15}/>} label={isMobile ? "" : (exporting ? "Esporto..." : "Esporta PNG")} primary onClick={exportPNG} disabled={!mapImage || exporting} />
        </div>
      </header>

      {showHelp && (
        <div style={{ background: C.primaryLight, borderBottom: `1px solid ${C.primary}`, padding: "12px 16px", fontSize: 13, color: C.text, lineHeight: 1.7, flexShrink: 0 }}>
          <strong>Come funziona</strong><br/>
          1. Carica la mappa del museo (JPEG/PNG, max 2 MB).<br/>
          2. Scegli un simbolo dalla libreria.<br/>
          3. Tocca/clicca sulla mappa per posizionarlo. Trascinalo per spostarlo.<br/>
          4. Esporta la mappa come PNG, pronta per la stampa.
          <div style={{ marginTop: 6 }}><button onClick={() => setShowHelp(false)} style={{ background: "none", border: "none", color: C.primary, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>Ho capito, chiudi</button></div>
        </div>
      )}

      {error && (
        <div style={{ background: C.warningLight, borderBottom: `2px solid ${C.warning}`, padding: "8px 16px", fontSize: 13, color: C.warning, fontWeight: 500, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          {error}<button onClick={() => setError(null)} style={{ background: "none", border: "none", color: C.warning, cursor: "pointer", padding: 0 }}><X size={16}/></button>
        </div>
      )}

      <div style={{ display: "flex", flex: 1, minHeight: 0, position: "relative" }}>
        {!isMobile && (
          <aside style={{ width: sidebarOpen ? sideW : 0, minWidth: sidebarOpen ? sideW : 0, background: C.surface, borderRight: sidebarOpen ? `1px solid ${C.border}` : "none", display: "flex", flexDirection: "column", overflow: "hidden", transition: "width 0.25s, min-width 0.25s", flexShrink: 0 }}>
            {sidebarOpen && SidebarContent}
          </aside>
        )}

        <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
          <div style={{ padding: isMobile ? "6px 10px" : "8px 16px", background: C.surfaceAlt, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: isMobile ? 6 : 10, fontSize: 12, flexWrap: "nowrap", overflowX: "auto", flexShrink: 0 }}>
            {!isMobile && <button onClick={() => setSidebarOpen(!sidebarOpen)} style={tBtn}><Layers size={14}/></button>}
            <button onClick={() => mapFileRef.current?.click()} style={tBtn}><Upload size={14}/> {isMobile ? "Mappa" : "Carica mappa"}</button>
            <span style={{ width: 1, height: 20, background: C.border, flexShrink: 0 }} />
            <button onClick={() => setScale(s => Math.max(s - 0.15, 0.2))} style={tBtn} disabled={!mapImage}><ZoomOut size={14}/></button>
            <span style={{ color: C.textMuted, fontWeight: 500, minWidth: 36, textAlign: "center", flexShrink: 0 }}>{Math.round(scale * 100)}%</span>
            <button onClick={() => setScale(s => Math.min(s + 0.15, 3))} style={tBtn} disabled={!mapImage}><ZoomIn size={14}/></button>
            {!isMobile && <button onClick={() => setScale(1)} style={{ ...tBtn, fontSize: 11 }} disabled={!mapImage}>Adatta</button>}
            <div style={{ flex: 1, minWidth: 8 }} />
            {selected && !isMobile && <div style={{ display: "flex", alignItems: "center", gap: 6, background: C.primaryLight, border: `1px solid ${C.primary}`, borderRadius: 6, padding: "4px 10px", color: C.primary, fontWeight: 500, fontSize: 12, whiteSpace: "nowrap", flexShrink: 0 }}><MousePointer2 size={13}/> Clicca sulla mappa</div>}
            {placed.length > 0 && <span style={{ color: C.textMuted, whiteSpace: "nowrap", flexShrink: 0 }}>{placed.length}</span>}
          </div>

          <div style={{ flex: 1, overflow: "auto", display: "flex", alignItems: mapImage ? "flex-start" : "center", justifyContent: mapImage ? "flex-start" : "center", padding: mapImage ? (isMobile ? 10 : 20) : 0, background: C.mapBg, WebkitOverflowScrolling: "touch", paddingBottom: isMobile && drawerOpen ? 320 : (isMobile ? 90 : 36) }}>
            {!mapImage ? (
              <div onClick={() => mapFileRef.current?.click()} style={{ width: isMobile ? "90%" : 400, maxWidth: 400, padding: isMobile ? "40px 24px" : "56px 36px", textAlign: "center", borderRadius: 12, border: `2px dashed ${C.border}`, background: C.surface, cursor: "pointer" }}>
                <Image size={isMobile ? 36 : 48} strokeWidth={1.2} style={{ color: C.textLight, marginBottom: 14 }} />
                <div style={{ fontSize: isMobile ? 14 : 16, fontWeight: 600, color: C.text, marginBottom: 6 }}>Carica la mappa del museo</div>
                <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.5 }}>JPEG o PNG · Max 2 MB</div>
              </div>
            ) : (
              <div ref={mapRef} onClick={placeSymbol} style={{ position: "relative", width: dW, height: dH, flexShrink: 0, cursor: selected ? "crosshair" : "default", boxShadow: "0 2px 20px rgba(0,0,0,0.12)", borderRadius: 4, overflow: "hidden" }}>
                <img src={mapImage} alt="Mappa museo" style={{ width: dW, height: dH, display: "block", userSelect: "none", pointerEvents: "none" }} draggable={false} />
                {placed.map((p, i) => (
                  <div key={p.id} onMouseDown={e => startDrag(e, i)} onTouchStart={e => startDrag(e, i)} onMouseEnter={() => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(null)}
                    style={{ position: "absolute", left: p.x * scale, top: p.y * scale, width: p.size * scale, height: p.size * scale, cursor: "grab", zIndex: dragIdx === i ? 100 : 10, filter: dragIdx === i ? "drop-shadow(0 4px 8px rgba(0,0,0,0.35))" : "drop-shadow(0 1px 4px rgba(0,0,0,0.25))", transition: dragIdx === i ? "none" : "filter 0.15s" }}>
                    <img src={p.src} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "contain", userSelect: "none", pointerEvents: "none" }} draggable={false} />
                    {(hoverIdx === i || (isMobile && i === placed.length - 1 && dragIdx === null)) && (
                      <>
                        <button onClick={e => { e.stopPropagation(); setPlaced(pr => pr.filter((_, j) => j !== i)); }} style={{ position: "absolute", top: -10, right: -10, width: isMobile ? 28 : 22, height: isMobile ? 28 : 22, borderRadius: "50%", border: "2px solid #fff", background: C.danger, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 110, padding: 0 }}><X size={isMobile ? 14 : 12}/></button>
                        <div style={{ position: "absolute", bottom: isMobile ? -20 : -24, left: "50%", transform: "translateX(-50%)", background: C.toolbarBg, color: "#fff", fontSize: 10, fontWeight: 500, padding: "2px 8px", borderRadius: 4, whiteSpace: "nowrap" }}>{p.name}</div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {!isMobile && (
            <div style={{ padding: "8px 20px", background: C.surfaceAlt, borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 20, fontSize: 11, color: C.textMuted, flexShrink: 0 }}>
              <span>© {new Date().getFullYear()} CAA4all · Simboli di Mattia Boero</span>
              <button onClick={() => setModal("project")} style={footerLink}><Info size={11}/> Il progetto</button>
              <button onClick={() => setModal("privacy")} style={footerLink}><Shield size={11}/> Privacy</button>
              <button onClick={() => setModal("cookie")} style={footerLink}><Cookie size={11}/> Cookie</button>
            </div>
          )}
        </main>
      </div>

      {/* MOBILE DRAWER */}
      {isMobile && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: C.surface, borderTop: `1px solid ${C.border}`, borderRadius: "16px 16px 0 0", boxShadow: "0 -4px 24px rgba(0,0,0,0.15)", zIndex: 200, display: "flex", flexDirection: "column", maxHeight: drawerOpen ? "65vh" : 56, transition: "max-height 0.3s ease", overflow: "hidden" }}>
          <button onClick={() => setDrawerOpen(!drawerOpen)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px 16px", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 600, color: C.text, flexShrink: 0, position: "relative" }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: C.border, position: "absolute", top: 8 }} />
            <Layers size={16} style={{ color: C.primary }} />
            <span>Libreria simboli</span>
            {selected && <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.primary }} />}
            {drawerOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
          {drawerOpen && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              {SidebarContent}
              <div style={{ padding: "10px 14px", borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 14, fontSize: 11, color: C.textMuted, flexShrink: 0, flexWrap: "wrap" }}>
                <span>Simboli di Mattia Boero</span>
                <button onClick={() => setModal("project")} style={footerLink}><Info size={10}/> Progetto</button>
                <button onClick={() => setModal("privacy")} style={footerLink}><Shield size={10}/> Privacy</button>
                <button onClick={() => setModal("cookie")} style={footerLink}><Cookie size={10}/> Cookie</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* COOKIE BANNER */}
      {!cookieAccepted && <CookieBanner onAccept={() => setCookieAccepted(true)} isMobile={isMobile} />}

      {/* MODALS */}
      {modal === "project" && <Modal title="Il progetto" onClose={() => setModal(null)} isMobile={isMobile}><ProjectContent isMobile={isMobile} /></Modal>}
      {modal === "privacy" && <Modal title="Privacy Policy" onClose={() => setModal(null)} isMobile={isMobile}><PolicyContent text={PRIVACY_POLICY} /></Modal>}
      {modal === "cookie" && <Modal title="Cookie Policy" onClose={() => setModal(null)} isMobile={isMobile}><PolicyContent text={COOKIE_POLICY} /></Modal>}
    </div>
  );
}

function HBtn({ icon, label, onClick, primary, disabled }) {
  return <button onClick={onClick} disabled={disabled} style={{ display: "flex", alignItems: "center", gap: label ? 5 : 0, padding: label ? "7px 12px" : "7px 8px", borderRadius: 6, border: primary ? "none" : "1px solid rgba(255,255,255,0.25)", background: primary ? C.secondary : "transparent", color: primary ? C.toolbarBg : C.toolbarText, fontFamily: "inherit", fontWeight: 600, fontSize: 12, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1 }}>{icon} {label}</button>;
}

const tBtn = { display: "flex", alignItems: "center", gap: 4, padding: "6px 10px", borderRadius: 5, border: `1px solid ${C.border}`, background: C.surface, color: C.text, fontFamily: "'Lexend', sans-serif", fontWeight: 500, fontSize: 12, cursor: "pointer", flexShrink: 0 };

const footerLink = { background: "none", border: "none", cursor: "pointer", color: C.textMuted, fontFamily: "'Lexend', sans-serif", fontSize: 11, fontWeight: 500, display: "flex", alignItems: "center", gap: 4, padding: 0, textDecoration: "underline", textDecorationColor: C.border, textUnderlineOffset: 2 };
