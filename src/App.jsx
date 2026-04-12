import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { Download, MousePointer2, ZoomIn, ZoomOut, Upload, X, RotateCcw, Image, HelpCircle, Search, ChevronUp, ChevronDown, Layers, Shield, Cookie, Info, FileDown, Undo2, Type, Globe, Grid3X3, Share2, FileText } from "lucide-react";

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
const MAX_UNDO = 50;

/* === i18n — MULTILINGUAL === */
const LANGS = {
  it: { code: "it", label: "Italiano", flag: "IT" },
  en: { code: "en", label: "English", flag: "EN" },
  fr: { code: "fr", label: "Français", flag: "FR" },
  es: { code: "es", label: "Español", flag: "ES" },
  de: { code: "de", label: "Deutsch", flag: "DE" },
};

const T = {
  it: {
    appName: "CAA4all",
    appSub: "Mappe museali accessibili con simboli CAA",
    project: "Il progetto",
    guide: "Guida",
    reset: "Reset",
    exportPng: "Esporta PNG",
    exporting: "Esporto...",
    undo: "Annulla",
    searchSymbol: "Cerca simbolo...",
    size: "Dimensione",
    libraryTitle: "Libreria simboli",
    uploadMap: "Carica mappa",
    uploadMapShort: "Mappa",
    fit: "Adatta",
    clickToPlace: "Clicca sulla mappa",
    loadMapTitle: "Carica la mappa del museo",
    loadMapSub: "JPEG o PNG · Max 2 MB",
    howTitle: "Come funziona",
    how1: "1. Carica la mappa del museo (JPEG/PNG, max 2 MB).",
    how2: "2. Scegli un simbolo dalla libreria.",
    how3: "3. Tocca/clicca sulla mappa per posizionarlo. Trascinalo per spostarlo.",
    how4: "4. Esporta la mappa come PNG, pronta per la stampa.",
    how5: "Non hai una mappa pronta? Scrivici a info@caa4all.org: possiamo realizzare la planimetria del tuo museo.",
    howClose: "Ho capito, chiudi",
    errFileSize: "Il file supera 2 MB.",
    errFileType: "Formato non supportato. Usa JPEG o PNG.",
    errFileBad: "Il file non è un'immagine JPEG o PNG valida.",
    errFileDimensions: "Immagine troppo grande. Massimo 10000×10000 pixel.",
    errFileCorrupt: "Impossibile caricare l'immagine. Il file potrebbe essere danneggiato.",
    errFileRead: "Errore nella lettura del file.",
    errMaxSymbols: "Numero massimo di simboli raggiunto (200).",
    errCanvasTooBig: "L'immagine è troppo grande per l'esportazione. Usa una mappa con risoluzione inferiore.",
    errCanvasUnsupported: "Il browser non supporta l'esportazione su canvas.",
    errExport: "Errore durante l'esportazione. Riprova con un'immagine più piccola.",
    privacy: "Privacy",
    cookie: "Cookie",
    cookieBanner: "Questo sito utilizza esclusivamente cookie tecnici necessari al funzionamento dell'applicazione. Non vengono utilizzati cookie di profilazione o di terze parti a scopo pubblicitario. Continuando la navigazione accetti l'utilizzo dei cookie tecnici.",
    cookieOk: "Ho capito",
    symbolsBy: "Simboli di Mattia Boero",
    addLabel: "Aggiungi etichetta...",
    labelPlaceholder: "Etichetta...",
    nothingToUndo: "Nulla da annullare.",
    catOrientamento: "Orientamento",
    catServizi: "Servizi",
    catContenuti: "Contenuti",
    catAccessibilita: "Accessibilità",
    catSicurezza: "Sicurezza",
    snapGrid: "Griglia",
    gridSize: "Griglia",
    exportPdf: "Esporta PDF",
    pdfFormat: "Formato",
    share: "Condividi",
    shareText: "CAA4all: webapp gratuita per creare mappe museali accessibili con simboli CAA",
    noMapTitle: "Non hai una mappa pronta?",
    noMapText: "Se i tuoi file sono tecnici, a bassa risoluzione o graficamente inadeguati, possiamo realizzare un rilievo e una mappa su misura per il tuo museo.",
    noMapCta: "Richiedi un preventivo",
    shareTitle: "Condividi CAA4all",
    shareLinkedIn: "Condividi su LinkedIn",
    shareFacebook: "Condividi su Facebook",
    shareX: "Condividi su X",
    downloadSvgTitle: "Scarica i simboli SVG",
    downloadSvgSub: "File vettoriali, gratuiti, ridistribuibili",
    downloadSvgAction: "Scarica ZIP",
    close: "Chiudi",
    changeLanguage: "Cambia lingua",
    closeError: "Chiudi errore",
    mapTools: "Strumenti mappa",
    openLibrary: "Apri libreria",
    closeLibrary: "Chiudi libreria",
    zoomOut: "Zoom indietro",
    zoomIn: "Zoom avanti",
    mapArea: "Mappa del museo",
    skipToMap: "Vai alla mappa",
    exportPngImage: "PNG (immagine)",
    exportPdfA4: "PDF — A4",
    exportPdfA3: "PDF — A3",
    removePrefix: "Rimuovi",
    quoteSubject: "Richiesta preventivo mappa museo",
  },
  en: {
    appName: "CAA4all",
    appSub: "Accessible museum maps with AAC symbols",
    project: "About",
    guide: "Guide",
    reset: "Reset",
    exportPng: "Export PNG",
    exporting: "Exporting...",
    undo: "Undo",
    searchSymbol: "Search symbol...",
    size: "Size",
    libraryTitle: "Symbol library",
    uploadMap: "Upload map",
    uploadMapShort: "Map",
    fit: "Fit",
    clickToPlace: "Click on the map",
    loadMapTitle: "Upload your museum map",
    loadMapSub: "JPEG or PNG · Max 2 MB",
    howTitle: "How it works",
    how1: "1. Upload your museum map (JPEG/PNG, max 2 MB).",
    how2: "2. Choose a symbol from the library.",
    how3: "3. Tap/click the map to place it. Drag to move.",
    how4: "4. Export the map as PNG, ready to print.",
    how5: "Don't have a map? Write to info@caa4all.org: we can create a floor plan for your museum.",
    howClose: "Got it, close",
    errFileSize: "File exceeds 2 MB.",
    errFileType: "Unsupported format. Use JPEG or PNG.",
    errFileBad: "Not a valid JPEG or PNG image.",
    errFileDimensions: "Image too large. Maximum 10000×10000 pixels.",
    errFileCorrupt: "Cannot load image. The file may be corrupted.",
    errFileRead: "Error reading file.",
    errMaxSymbols: "Maximum number of symbols reached (200).",
    errCanvasTooBig: "Image too large to export. Use a lower resolution map.",
    errCanvasUnsupported: "Your browser does not support canvas export.",
    errExport: "Export error. Try a smaller image.",
    privacy: "Privacy",
    cookie: "Cookie",
    cookieBanner: "This site uses only technical cookies necessary for operation. No profiling or third-party advertising cookies are used. By continuing to browse, you accept the use of technical cookies.",
    cookieOk: "Got it",
    symbolsBy: "Symbols by Mattia Boero",
    addLabel: "Add label...",
    labelPlaceholder: "Label...",
    nothingToUndo: "Nothing to undo.",
    catOrientamento: "Wayfinding",
    catServizi: "Services",
    catContenuti: "Content",
    catAccessibilita: "Accessibility",
    catSicurezza: "Safety",
    snapGrid: "Grid",
    gridSize: "Grid",
    exportPdf: "Export PDF",
    pdfFormat: "Format",
    share: "Share",
    shareText: "CAA4all: free webapp to create accessible museum maps with AAC symbols",
    noMapTitle: "Don't have a map ready?",
    noMapText: "If your files are technical drawings, low resolution or not suitable for visitors, we can survey your museum and create a custom map.",
    noMapCta: "Request a quote",
    shareTitle: "Share CAA4all",
    shareLinkedIn: "Share on LinkedIn",
    shareFacebook: "Share on Facebook",
    shareX: "Share on X",
    downloadSvgTitle: "Download SVG symbols",
    downloadSvgSub: "Vector files, free to reuse and redistribute",
    downloadSvgAction: "Download ZIP",
    close: "Close",
    changeLanguage: "Change language",
    closeError: "Close error",
    mapTools: "Map tools",
    openLibrary: "Open library",
    closeLibrary: "Close library",
    zoomOut: "Zoom out",
    zoomIn: "Zoom in",
    mapArea: "Museum map",
    skipToMap: "Skip to map",
    exportPngImage: "PNG (image)",
    exportPdfA4: "PDF — A4",
    exportPdfA3: "PDF — A3",
    removePrefix: "Remove",
    quoteSubject: "Request quote for museum map",
  },
  fr: {
    appName: "CAA4all",
    appSub: "Plans de musée accessibles avec symboles CAA",
    project: "Le projet",
    guide: "Guide",
    reset: "Réinitialiser",
    exportPng: "Exporter PNG",
    exporting: "Export...",
    undo: "Annuler",
    searchSymbol: "Chercher un symbole...",
    size: "Taille",
    libraryTitle: "Bibliothèque de symboles",
    uploadMap: "Charger le plan",
    uploadMapShort: "Plan",
    fit: "Adapter",
    clickToPlace: "Cliquez sur le plan",
    loadMapTitle: "Chargez le plan du musée",
    loadMapSub: "JPEG ou PNG · Max 2 Mo",
    howTitle: "Comment ça marche",
    how1: "1. Chargez le plan du musée (JPEG/PNG, max 2 Mo).",
    how2: "2. Choisissez un symbole dans la bibliothèque.",
    how3: "3. Cliquez sur le plan pour le placer. Faites-le glisser pour le déplacer.",
    how4: "4. Exportez le plan en PNG, prêt à imprimer.",
    how5: "Vous n'avez pas de plan ? Écrivez-nous à info@caa4all.org : nous pouvons réaliser le plan de votre musée.",
    howClose: "Compris, fermer",
    errFileSize: "Le fichier dépasse 2 Mo.",
    errFileType: "Format non supporté. Utilisez JPEG ou PNG.",
    errFileBad: "Ce n'est pas une image JPEG ou PNG valide.",
    errFileDimensions: "Image trop grande. Maximum 10000×10000 pixels.",
    errFileCorrupt: "Impossible de charger l'image. Le fichier est peut-être corrompu.",
    errFileRead: "Erreur de lecture du fichier.",
    errMaxSymbols: "Nombre maximum de symboles atteint (200).",
    errCanvasTooBig: "Image trop grande pour l'export. Utilisez un plan à résolution inférieure.",
    errCanvasUnsupported: "Votre navigateur ne supporte pas l'export canvas.",
    errExport: "Erreur lors de l'export. Essayez avec une image plus petite.",
    privacy: "Confidentialité",
    cookie: "Cookies",
    cookieBanner: "Ce site utilise uniquement des cookies techniques nécessaires à son fonctionnement. Aucun cookie de profilage ou publicitaire n'est utilisé. En poursuivant la navigation, vous acceptez l'utilisation des cookies techniques.",
    cookieOk: "Compris",
    symbolsBy: "Symboles par Mattia Boero",
    addLabel: "Ajouter une étiquette...",
    labelPlaceholder: "Étiquette...",
    nothingToUndo: "Rien à annuler.",
    catOrientamento: "Orientation",
    catServizi: "Services",
    catContenuti: "Contenus",
    catAccessibilita: "Accessibilité",
    catSicurezza: "Sécurité",
    snapGrid: "Grille",
    gridSize: "Grille",
    exportPdf: "Exporter PDF",
    pdfFormat: "Format",
    share: "Partager",
    shareText: "CAA4all : webapp gratuite pour créer des plans de musée accessibles avec symboles CAA",
    noMapTitle: "Vous n'avez pas de plan prêt ?",
    noMapText: "Si vos fichiers sont des plans techniques, en basse résolution ou inadaptés au public, nous pouvons réaliser un relevé et un plan sur mesure pour votre musée.",
    noMapCta: "Demander un devis",
    shareTitle: "Partager CAA4all",
    shareLinkedIn: "Partager sur LinkedIn",
    shareFacebook: "Partager sur Facebook",
    shareX: "Partager sur X",
    downloadSvgTitle: "Télécharger les symboles SVG",
    downloadSvgSub: "Fichiers vectoriels, gratuits et redistribuables",
    downloadSvgAction: "Télécharger le ZIP",
    close: "Fermer",
    changeLanguage: "Changer de langue",
    closeError: "Fermer l'erreur",
    mapTools: "Outils de carte",
    openLibrary: "Ouvrir la bibliothèque",
    closeLibrary: "Fermer la bibliothèque",
    zoomOut: "Zoom arrière",
    zoomIn: "Zoom avant",
    mapArea: "Plan du musée",
    skipToMap: "Aller à la carte",
    exportPngImage: "PNG (image)",
    exportPdfA4: "PDF — A4",
    exportPdfA3: "PDF — A3",
    removePrefix: "Supprimer",
    quoteSubject: "Demande de devis plan musée",
  },
  es: {
    appName: "CAA4all",
    appSub: "Mapas museales accesibles con símbolos CAA",
    project: "El proyecto",
    guide: "Guía",
    reset: "Reiniciar",
    exportPng: "Exportar PNG",
    exporting: "Exportando...",
    undo: "Deshacer",
    searchSymbol: "Buscar símbolo...",
    size: "Tamaño",
    libraryTitle: "Biblioteca de símbolos",
    uploadMap: "Cargar mapa",
    uploadMapShort: "Mapa",
    fit: "Ajustar",
    clickToPlace: "Haz clic en el mapa",
    loadMapTitle: "Carga el mapa del museo",
    loadMapSub: "JPEG o PNG · Máx. 2 MB",
    howTitle: "Cómo funciona",
    how1: "1. Carga el mapa del museo (JPEG/PNG, máx. 2 MB).",
    how2: "2. Elige un símbolo de la biblioteca.",
    how3: "3. Toca/haz clic en el mapa para colocarlo. Arrástralo para moverlo.",
    how4: "4. Exporta el mapa como PNG, listo para imprimir.",
    how5: "¿No tienes un mapa? Escríbenos a info@caa4all.org: podemos crear el plano de tu museo.",
    howClose: "Entendido, cerrar",
    errFileSize: "El archivo supera 2 MB.",
    errFileType: "Formato no compatible. Usa JPEG o PNG.",
    errFileBad: "No es una imagen JPEG o PNG válida.",
    errFileDimensions: "Imagen demasiado grande. Máximo 10000×10000 píxeles.",
    errFileCorrupt: "No se puede cargar la imagen. El archivo puede estar dañado.",
    errFileRead: "Error al leer el archivo.",
    errMaxSymbols: "Número máximo de símbolos alcanzado (200).",
    errCanvasTooBig: "Imagen demasiado grande para exportar. Usa un mapa de menor resolución.",
    errCanvasUnsupported: "Tu navegador no soporta la exportación canvas.",
    errExport: "Error al exportar. Intenta con una imagen más pequeña.",
    privacy: "Privacidad",
    cookie: "Cookies",
    cookieBanner: "Este sitio utiliza exclusivamente cookies técnicas necesarias para el funcionamiento de la aplicación. No se utilizan cookies de perfilado ni de terceros con fines publicitarios. Al continuar navegando, aceptas el uso de cookies técnicas.",
    cookieOk: "Entendido",
    symbolsBy: "Símbolos por Mattia Boero",
    addLabel: "Añadir etiqueta...",
    labelPlaceholder: "Etiqueta...",
    nothingToUndo: "Nada que deshacer.",
    catOrientamento: "Orientación",
    catServizi: "Servicios",
    catContenuti: "Contenidos",
    catAccessibilita: "Accesibilidad",
    catSicurezza: "Seguridad",
    snapGrid: "Cuadrícula",
    gridSize: "Cuadrícula",
    exportPdf: "Exportar PDF",
    pdfFormat: "Formato",
    share: "Compartir",
    shareText: "CAA4all: webapp gratuita para crear mapas de museo accesibles con símbolos CAA",
    noMapTitle: "¿No tienes un mapa listo?",
    noMapText: "Si tus archivos son planos técnicos, de baja resolución o inadecuados para los visitantes, podemos realizar un relevamiento y crear un mapa a medida para tu museo.",
    noMapCta: "Solicitar presupuesto",
    shareTitle: "Compartir CAA4all",
    shareLinkedIn: "Compartir en LinkedIn",
    shareFacebook: "Compartir en Facebook",
    shareX: "Compartir en X",
    downloadSvgTitle: "Descargar símbolos SVG",
    downloadSvgSub: "Archivos vectoriales, gratis y redistribuibles",
    downloadSvgAction: "Descargar ZIP",
    close: "Cerrar",
    changeLanguage: "Cambiar idioma",
    closeError: "Cerrar error",
    mapTools: "Herramientas del mapa",
    openLibrary: "Abrir biblioteca",
    closeLibrary: "Cerrar biblioteca",
    zoomOut: "Alejar zoom",
    zoomIn: "Acercar zoom",
    mapArea: "Mapa del museo",
    skipToMap: "Ir al mapa",
    exportPngImage: "PNG (imagen)",
    exportPdfA4: "PDF — A4",
    exportPdfA3: "PDF — A3",
    removePrefix: "Eliminar",
    quoteSubject: "Solicitud de presupuesto mapa museo",
  },
  de: {
    appName: "CAA4all",
    appSub: "Barrierefreie Museumskarten mit UK-Symbolen",
    project: "Das Projekt",
    guide: "Anleitung",
    reset: "Zurücksetzen",
    exportPng: "PNG exportieren",
    exporting: "Exportiere...",
    undo: "Rückgängig",
    searchSymbol: "Symbol suchen...",
    size: "Größe",
    libraryTitle: "Symbolbibliothek",
    uploadMap: "Karte hochladen",
    uploadMapShort: "Karte",
    fit: "Anpassen",
    clickToPlace: "Auf die Karte klicken",
    loadMapTitle: "Museumskarte hochladen",
    loadMapSub: "JPEG oder PNG · Max. 2 MB",
    howTitle: "So funktioniert's",
    how1: "1. Museumskarte hochladen (JPEG/PNG, max. 2 MB).",
    how2: "2. Symbol aus der Bibliothek wählen.",
    how3: "3. Auf die Karte tippen/klicken zum Platzieren. Ziehen zum Verschieben.",
    how4: "4. Karte als PNG exportieren, druckfertig.",
    how5: "Keine Karte vorhanden? Schreiben Sie an info@caa4all.org: Wir können einen Grundriss für Ihr Museum erstellen.",
    howClose: "Verstanden, schließen",
    errFileSize: "Die Datei überschreitet 2 MB.",
    errFileType: "Format nicht unterstützt. JPEG oder PNG verwenden.",
    errFileBad: "Keine gültige JPEG- oder PNG-Datei.",
    errFileDimensions: "Bild zu groß. Maximal 10000×10000 Pixel.",
    errFileCorrupt: "Bild kann nicht geladen werden. Die Datei ist möglicherweise beschädigt.",
    errFileRead: "Fehler beim Lesen der Datei.",
    errMaxSymbols: "Maximale Anzahl an Symbolen erreicht (200).",
    errCanvasTooBig: "Bild zu groß für den Export. Verwenden Sie eine Karte mit niedrigerer Auflösung.",
    errCanvasUnsupported: "Ihr Browser unterstützt keinen Canvas-Export.",
    errExport: "Exportfehler. Versuchen Sie es mit einem kleineren Bild.",
    privacy: "Datenschutz",
    cookie: "Cookies",
    cookieBanner: "Diese Website verwendet ausschließlich technische Cookies, die für den Betrieb der Anwendung erforderlich sind. Es werden keine Profiling- oder Werbe-Cookies von Drittanbietern verwendet. Durch die weitere Nutzung akzeptieren Sie die Verwendung technischer Cookies.",
    cookieOk: "Verstanden",
    symbolsBy: "Symbole von Mattia Boero",
    addLabel: "Beschriftung...",
    labelPlaceholder: "Beschriftung...",
    nothingToUndo: "Nichts rückgängig zu machen.",
    catOrientamento: "Orientierung",
    catServizi: "Einrichtungen",
    catContenuti: "Inhalte",
    catAccessibilita: "Barrierefreiheit",
    catSicurezza: "Sicherheit",
    snapGrid: "Raster",
    gridSize: "Raster",
    exportPdf: "PDF exportieren",
    pdfFormat: "Format",
    share: "Teilen",
    shareText: "CAA4all: Kostenlose Webapp für barrierefreie Museumskarten mit UK-Symbolen",
    noMapTitle: "Keine Karte vorhanden?",
    noMapText: "Wenn Ihre Dateien technische Zeichnungen, niedrig aufgelöst oder für Besucher ungeeignet sind, können wir Ihr Museum vermessen und eine passende Karte erstellen.",
    noMapCta: "Angebot anfordern",
    shareTitle: "CAA4all teilen",
    shareLinkedIn: "Auf LinkedIn teilen",
    shareFacebook: "Auf Facebook teilen",
    shareX: "Auf X teilen",
    downloadSvgTitle: "SVG-Symbole herunterladen",
    downloadSvgSub: "Vektordateien, kostenlos und weiterverteilbar",
    downloadSvgAction: "ZIP herunterladen",
    close: "Schließen",
    changeLanguage: "Sprache wechseln",
    closeError: "Fehler schließen",
    mapTools: "Kartenwerkzeuge",
    openLibrary: "Bibliothek öffnen",
    closeLibrary: "Bibliothek schließen",
    zoomOut: "Herauszoomen",
    zoomIn: "Hereinzoomen",
    mapArea: "Museumskarte",
    skipToMap: "Zur Karte springen",
    exportPngImage: "PNG (Bild)",
    exportPdfA4: "PDF — A4",
    exportPdfA3: "PDF — A3",
    removePrefix: "Entfernen",
    quoteSubject: "Angebotsanfrage Museumskarte",
  },
};

const CAT_KEYS = { "Orientamento": "catOrientamento", "Servizi": "catServizi", "Contenuti": "catContenuti", "Accessibilità": "catAccessibilita", "Sicurezza": "catSicurezza" };

/* === SYMBOL LIBRARY === */
const LIBRARY = [
  { category: "Orientamento", color: "#0072B2", shape: "circle", symbols: [
    { id: "ingresso", name: "Ingresso", src: "/simboli/01_ingresso.svg" },
    { id: "uscita", name: "Uscita", src: "/simboli/02_uscita.svg" },
    { id: "inizio", name: "Inizio percorso di mostra", src: "/simboli/03_inizio-percorso-mostra.svg" },
    { id: "fine", name: "Fine percorso di mostra", src: "/simboli/04_fine-percorso-mostra.svg" },
    { id: "direzione", name: "Direzione percorso di mostra", src: "/simboli/05_direzione-percorso-mostra.svg" },
    { id: "ascensore", name: "Ascensore", src: "/simboli/06_ascensore.svg" },
    { id: "scale", name: "Scale", src: "/simboli/07_scale.svg" },
    { id: "tu_sei_qui", name: "Tu sei qui", src: "/simboli/08_tu-sei-qui.svg" },
  ]},
  { category: "Servizi", color: "#E69F00", shape: "square", symbols: [
    { id: "biglietteria", name: "Biglietteria", src: "/simboli/11_biglietteria.svg" },
    { id: "bagno", name: "Bagno", src: "/simboli/12_bagno.svg" },
    { id: "bar", name: "Bar", src: "/simboli/13_bar.svg" },
    { id: "guardaroba", name: "Guardaroba", src: "/simboli/14_guardaroba.svg" },
    { id: "bookshop", name: "Bookshop", src: "/simboli/15_bookshop.svg" },
    { id: "gel", name: "Gel igienizzante", src: "/simboli/16_gel-igienizzante.svg" },
    { id: "infermeria", name: "Infermeria", src: "/simboli/17_infermeria.svg" },
    { id: "panchina", name: "Area di sosta", src: "/simboli/18_area-sosta.svg" },
  ]},
  { category: "Contenuti", color: "#56B4E9", shape: "triangle", symbols: [
    { id: "reperto", name: "Oggetto esposto", src: "/simboli/21_oggetto-esposto.svg" },
    { id: "audio_racconto", name: "Audio racconto", src: "/simboli/22_audio-racconto.svg" },
    { id: "video", name: "Video proiezione", src: "/simboli/23_video-proiezione.svg" },
    { id: "testo", name: "Testo", src: "/simboli/24_testo.svg" },
    { id: "aula", name: "Aula didattica", src: "/simboli/25_aula-didattica.svg" },
    { id: "toccare_si", name: "Toccare consentito", src: "/simboli/26_toccare-consentito.svg" },
    { id: "toccare_no", name: "Toccare non consentito", src: "/simboli/27_toccare-non-consentito.svg" },
  ]},
  { category: "Accessibilità", color: "#009E73", shape: "diamond", symbols: [
    { id: "acc_motoria", name: "Accessibilità motoria", src: "/simboli/31_accessibilita-motoria.svg" },
    { id: "mappa_tattile", name: "Mappa tattile", src: "/simboli/32_mappa-tattile.svg" },
    { id: "lis", name: "LIS", src: "/simboli/33_lis.svg" },
    { id: "caa", name: "CAA", src: "/simboli/34_caa.svg" },
    { id: "bagno_acc", name: "Bagno accessibile", src: "/simboli/35_bagno-accessibile.svg" },
  ]},
  { category: "Sicurezza", color: "#D55E00", shape: "hexagon", symbols: [
    { id: "emergenza", name: "Uscita di emergenza", src: "/simboli/41_uscita-emergenza.svg" },
    { id: "punto_raccolta", name: "Punto di raccolta", src: "/simboli/42_punto-raccolta.svg" },
    { id: "estintore", name: "Estintore", src: "/simboli/43_estintore.svg" },
    { id: "dae", name: "Defibrillatore", src: "/simboli/44_defibrillatore.svg" },
  ]},
];

/* === PROJECT TEXT (kept in Italian, shown via modal) === */
const PROJECT_TEXT = [
  { type: "title", text: "CAA4all" },
  { type: "paragraph", text: "Nei musei che provano a rendere i percorsi accessibili alle persone con disabilità comunicative, manca quasi sempre lo strumento per farlo senza budget e senza grafico. Ho costruito CAA4all per questo: è una webapp gratuita dove carichi la planimetria del tuo museo e ci posizioni sopra i simboli CAA che ti servono. Scarichi il risultato come immagine e da lì decidi tu cosa farne: stamparlo, prestarlo ai visitatori, metterlo a disposizione online." },
  { type: "paragraph", text: "I simboli li ho disegnati io, Mattia Boero. Ogni simbolo rappresenta quello che il visitatore fa in quel punto, non quello che siamo abituati a vedere sui cartelli. Il bagno è le mani sotto l'acqua e il water, non la sagoma uomo/donna. La biglietteria è una mano che porge un biglietto attraverso una finestrella. La mappa tattile è rappresentata con elementi chiari e leggibili. Nella CAA conta l'azione, non il pittogramma convenzionale." },
  { type: "heading", text: "Colori e daltonismo" },
  { type: "paragraph", text: "I simboli e l'interfaccia dell'app usano la palette Okabe-Ito, una combinazione di colori progettata per essere distinguibile anche dalle persone daltoniche (protanopia, deuteranopia, tritanopia). Ogni categoria di simboli ha un colore diverso e anche una forma diversa nell'indicatore di categoria, così chi ha difficoltà a distinguere i colori ha comunque un riferimento visivo alternativo." },
  { type: "heading", text: "Accessibilità dell'interfaccia" },
  { type: "paragraph", text: "Un'app che parla di accessibilità deve essere accessibile lei stessa. CAA4all si può usare interamente da tastiera: Tab per spostarsi tra gli elementi, Invio per attivare, Canc per rimuovere un simbolo dalla mappa, Ctrl+Z per annullare l'ultima azione. Ogni pulsante e ogni elemento interattivo è riconoscibile dagli screen reader. I messaggi di errore vengono annunciati automaticamente. Chi usa tecnologie assistive può navigare l'intera app senza il mouse." },
  { type: "heading", text: "Etichette sui simboli" },
  { type: "paragraph", text: "Ogni simbolo posizionato sulla mappa può avere un'etichetta di testo sotto, ad esempio \"Bagno piano 1\" o \"Ingresso gruppi\". L'etichetta compare sia nell'editor che nella mappa esportata come PNG, così chi legge la mappa stampata ha un doppio riferimento: il simbolo visivo e il testo scritto." },
  { type: "heading", text: "Lingue" },
  { type: "paragraph", text: "L'interfaccia dell'app è disponibile in italiano, inglese, francese, spagnolo e tedesco. I simboli sono visivi e non hanno bisogno di traduzione: funzionano in qualsiasi lingua. Il selettore si trova nell'header dell'app." },
  { type: "heading", text: "Uso, riuso, ridistribuzione" },
  { type: "paragraph", text: "Simboli e mappe prodotte con CAA4all si possono usare, modificare e ridistribuire gratis. Non ci sono condizioni d'uso: valgono per qualsiasi scopo, compreso quello commerciale. Se volete citarmi come autore mi fa piacere, ma non è un obbligo. Ho scelto di farlo così perché i simboli per l'accessibilità funzionano solo se girano, e non ha senso metterci un prezzo o un vincolo sopra." },
  { type: "heading", text: "File sorgente" },
  { type: "paragraph", text: "Se vuoi modificare un simbolo (cambiare un colore, adattarlo al tuo museo, aggiungere un dettaglio), puoi farlo. I file vettoriali SVG sono scaricabili gratuitamente da questa pagina e ridistribuibili alle stesse condizioni." },
  { type: "download" },
  { type: "heading", text: "Non hai una mappa pronta?" },
  { type: "paragraph", text: "Capita spesso: il museo ha solo planimetrie tecniche, file a bassa risoluzione o materiali graficamente inadeguati per il pubblico. Se ti trovi in questa situazione, posso realizzare un rilievo del museo e produrre una mappa su misura, pensata per essere chiara, leggibile e coerente con i simboli CAA. Scrivimi a info@caa4all.org per un preventivo." },
  { type: "heading", text: "Contatti" },
  { type: "paragraph", text: "Se lavori nell'accessibilità museale e hai suggerimenti, correzioni o richieste di nuovi simboli, scrivimi a info@caa4all.org." },
];

/* === GDPR TEXTS (kept in Italian) === */
const PRIVACY_POLICY = `Informativa sulla privacy ai sensi del Regolamento (UE) 2016/679 (GDPR)\n\nUltimo aggiornamento: 12 aprile 2026\n\n1. Titolare del trattamento\nIl titolare del trattamento è Mattia Boero, con sede in Corso Galileo Ferraris 148, 10129, Torino, TO, Italia, contattabile all'indirizzo email info@caa4all.org.\n\n2. Dati raccolti\nQuesta applicazione web non raccoglie dati personali. Non è prevista alcuna forma di registrazione, login o autenticazione. Non vengono richiesti nome, email, indirizzo o altri dati identificativi.\n\n3. Trattamento delle immagini\nLe immagini caricate dall'utente (mappe museali) vengono elaborate interamente nel browser dell'utente, sul suo dispositivo. Nessuna immagine viene trasmessa a server esterni, archiviata o conservata dall'applicazione. Al termine della sessione di navigazione o alla chiusura della pagina, tutte le immagini vengono eliminate automaticamente dalla memoria del browser.\n\n4. Cookie\nQuesta applicazione non utilizza cookie di profilazione né cookie di terze parti a scopo pubblicitario. Per maggiori dettagli, consulta la Cookie Policy.\n\n5. Dati di navigazione\nIl server che ospita l'applicazione potrebbe raccogliere automaticamente alcuni dati tecnici (indirizzo IP, tipo di browser, sistema operativo, data e ora di accesso) nei log del server. Questi dati vengono trattati esclusivamente per garantire il funzionamento e la sicurezza del servizio, e non vengono utilizzati per identificare l'utente. La base giuridica è il legittimo interesse del titolare (art. 6, par. 1, lett. f del GDPR).\n\n6. Trasferimento dei dati\nNon viene effettuato alcun trasferimento di dati personali verso Paesi terzi o organizzazioni internazionali.\n\n7. Periodo di conservazione\nI dati tecnici di navigazione eventualmente registrati nei log del server vengono conservati per un massimo di 30 giorni, dopodiché vengono cancellati automaticamente.\n\n8. Diritti dell'utente\nAi sensi degli articoli 15-22 del GDPR, l'utente ha diritto di accedere ai propri dati, richiederne la rettifica o la cancellazione, limitarne il trattamento, opporsi al trattamento e richiedere la portabilità dei dati. L'utente ha inoltre il diritto di proporre reclamo all'Autorità Garante per la Protezione dei Dati Personali (www.garanteprivacy.it).\n\nPer esercitare i propri diritti, l'utente può contattare il titolare all'indirizzo email indicato al punto 1.\n\n9. Modifiche\nIl titolare si riserva di aggiornare la presente informativa. Eventuali modifiche saranno pubblicate su questa pagina con indicazione della data di ultimo aggiornamento.`;

const COOKIE_POLICY = `Cookie Policy ai sensi del Regolamento (UE) 2016/679 (GDPR) e della Direttiva 2002/58/CE (ePrivacy)\n\nUltimo aggiornamento: 12 aprile 2026\n\n1. Cosa sono i cookie\nI cookie sono piccoli file di testo che i siti web memorizzano sul dispositivo dell'utente. Possono essere utilizzati per diverse finalità: funzionamento tecnico del sito, analisi del traffico, profilazione pubblicitaria.\n\n2. Cookie utilizzati da questa applicazione\nQuesta applicazione non utilizza cookie di alcun tipo. In particolare:\na) Non vengono utilizzati cookie di profilazione.\nb) Non vengono utilizzati cookie di terze parti a scopo pubblicitario.\nc) Non vengono utilizzati cookie analitici (Google Analytics o strumenti simili).\nd) Non vengono utilizzati cookie di sessione per il login, poiché l'applicazione non prevede autenticazione.\n\nL'applicazione potrebbe utilizzare esclusivamente cookie tecnici strettamente necessari al funzionamento della pagina web. Questi cookie non richiedono il consenso dell'utente ai sensi dell'art. 5, par. 3, della Direttiva ePrivacy, in quanto indispensabili per l'erogazione del servizio.\n\n3. Dati memorizzati nel browser\nL'applicazione utilizza temporaneamente la memoria del browser (RAM) per elaborare le immagini caricate dall'utente. Questi dati non vengono scritti in alcuno spazio di archiviazione persistente (localStorage, sessionStorage, IndexedDB) e vengono eliminati automaticamente alla chiusura della pagina.\n\n4. Cookie di terze parti\nL'applicazione carica il font Lexend da Google Fonts. Google potrebbe impostare cookie tecnici per ottimizzare la distribuzione del font. Per informazioni sui cookie di Google, consultare: policies.google.com/privacy\n\n5. Come gestire i cookie\nL'utente può gestire le preferenze sui cookie attraverso le impostazioni del proprio browser.\n\n6. Aggiornamenti\nEventuali modifiche alla presente Cookie Policy verranno pubblicate su questa pagina.\n\n7. Contatti\nPer informazioni sui cookie utilizzati da questa applicazione, contattare il titolare all'indirizzo email indicato nella Privacy Policy.`;

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

/* === CATEGORY SHAPES === */
function CategoryShape({ shape, color, size = 12 }) {
  const s = size; const half = s / 2;
  const st = { width: s, height: s, flexShrink: 0, display: "block" };
  switch (shape) {
    case "circle": return <svg viewBox={`0 0 ${s} ${s}`} style={st} aria-hidden="true"><circle cx={half} cy={half} r={half} fill={color}/></svg>;
    case "square": return <svg viewBox={`0 0 ${s} ${s}`} style={st} aria-hidden="true"><rect width={s} height={s} rx={1.5} fill={color}/></svg>;
    case "triangle": return <svg viewBox={`0 0 ${s} ${s}`} style={st} aria-hidden="true"><polygon points={`${half},0 ${s},${s} 0,${s}`} fill={color}/></svg>;
    case "diamond": return <svg viewBox={`0 0 ${s} ${s}`} style={st} aria-hidden="true"><polygon points={`${half},0 ${s},${half} ${half},${s} 0,${half}`} fill={color}/></svg>;
    case "hexagon": { const q=s*0.25; return <svg viewBox={`0 0 ${s} ${s}`} style={st} aria-hidden="true"><polygon points={`${q},0 ${s-q},0 ${s},${half} ${s-q},${s} ${q},${s} 0,${half}`} fill={color}/></svg>; }
    default: return <svg viewBox={`0 0 ${s} ${s}`} style={st} aria-hidden="true"><rect width={s} height={s} rx={2} fill={color}/></svg>;
  }
}

/* === MODAL === */
function Modal({ title, onClose, isMobile, children, closeLabel = "Close" }) {
  useEffect(() => { const h = (e) => { if (e.key === "Escape") onClose(); }; window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h); }, [onClose]);
  return (
    <div onClick={onClose} role="dialog" aria-modal="true" aria-label={title} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: isMobile ? 12 : 40 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.surface, borderRadius: 12, width: "100%", maxWidth: 680, maxHeight: isMobile ? "85vh" : "80vh", display: "flex", flexDirection: "column", boxShadow: "0 8px 40px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: isMobile ? "14px 16px" : "18px 24px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          <h2 style={{ margin: 0, fontSize: isMobile ? 16 : 18, fontWeight: 700, color: C.text }}>{title}</h2>
          <button onClick={onClose} aria-label={closeLabel} style={{ background: "none", border: "none", cursor: "pointer", color: C.textMuted, padding: 4 }}><X size={20}/></button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "16px 16px 24px" : "24px 24px 32px", WebkitOverflowScrolling: "touch" }}>{children}</div>
      </div>
    </div>
  );
}

function PolicyContent({ text }) {
  return text.split("\n\n").map((block, i) => {
    if (/^Informativa|^Cookie Policy/.test(block)) return <h3 key={i} style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: "0 0 16px", lineHeight: 1.4 }}>{block}</h3>;
    if (/^Ultimo aggiornamento/.test(block)) return <p key={i} style={{ fontSize: 12, color: C.textMuted, margin: "0 0 20px", fontStyle: "italic" }}>{block}</p>;
    if (/^\d+\.\s/.test(block.trim())) { const lines = block.split("\n"); return <div key={i} style={{ marginBottom: 16 }}><h4 style={{ fontSize: 14, fontWeight: 600, color: C.text, margin: "0 0 6px" }}>{lines[0]}</h4>{lines.length > 1 && <p style={{ fontSize: 13, color: C.text, lineHeight: 1.7, margin: 0, whiteSpace: "pre-line" }}>{lines.slice(1).join("\n")}</p>}</div>; }
    return <p key={i} style={{ fontSize: 13, color: C.text, lineHeight: 1.7, margin: "0 0 12px", whiteSpace: "pre-line" }}>{block}</p>;
  });
}

function ProjectContent({ isMobile, t }) {
  const siteUrl = "https://caa4all.org";
  const shareText = t.shareText;
  return (
    <>
      {PROJECT_TEXT.map((block, i) => {
        if (block.type === "title") return <h3 key={i} style={{ fontSize: isMobile ? 22 : 26, fontWeight: 700, color: C.text, margin: "0 0 20px", letterSpacing: "-0.01em" }}>{block.text}</h3>;
        if (block.type === "heading") return <h4 key={i} style={{ fontSize: 15, fontWeight: 600, color: C.primary, margin: "24px 0 8px" }}>{block.text}</h4>;
        if (block.type === "download") return (
          <div key={i} style={{ margin: "12px 0 8px", padding: "14px 18px", background: C.primaryLight, borderRadius: 8, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <FileDown size={20} style={{ color: C.primary, flexShrink: 0 }}/>
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.primary }}>{t.downloadSvgTitle}</div>
              <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{t.downloadSvgSub}</div>
            </div>
            <a
              href="/simboli-caa4all.zip"
              download
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 6, background: C.primary, color: "#fff", textDecoration: "none", fontSize: 12, fontWeight: 600 }}
            >
              {t.downloadSvgAction}
            </a>
          </div>
        );
        return <p key={i} style={{ fontSize: 14, color: C.text, lineHeight: 1.8, margin: "0 0 14px" }}>{block.text}</p>;
      })}
      {/* Share buttons */}
      <div style={{ marginTop: 28, paddingTop: 20, borderTop: `1px solid ${C.border}` }}>
        <h4 style={{ fontSize: 15, fontWeight: 600, color: C.primary, margin: "0 0 12px" }}>{t.shareTitle}</h4>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(siteUrl)}`} target="_blank" rel="noopener noreferrer" style={shareBtnStyle("#0072B2")} aria-label={t.shareLinkedIn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            LinkedIn
          </a>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(siteUrl)}`} target="_blank" rel="noopener noreferrer" style={shareBtnStyle("#1877F2")} aria-label={t.shareFacebook}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            Facebook
          </a>
          <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(siteUrl)}`} target="_blank" rel="noopener noreferrer" style={shareBtnStyle("#1A1A1A")} aria-label={t.shareX}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            X
          </a>
        </div>
      </div>
    </>
  );
}

/* === EXPORT MENU === */
function ExportMenu({ onPNG, onPDF, show, setShow, disabled, exporting, t, isMobile }) {
  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setShow(!show)} disabled={disabled}
        style={{ display: "flex", alignItems: "center", gap: 5, padding: isMobile ? "7px 8px" : "7px 12px", borderRadius: 6, border: "none", background: C.secondary, color: C.toolbarBg, fontFamily: "inherit", fontWeight: 600, fontSize: 12, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1 }}
        aria-label={t.exportPng} aria-expanded={show}>
        <Download size={15}/> {!isMobile && (exporting ? t.exporting : t.exportPng)} <ChevronDown size={12}/>
      </button>
      {show && !disabled && (
        <div style={{ position: "absolute", top: "100%", right: 0, marginTop: 4, background: C.surface, borderRadius: 8, boxShadow: "0 4px 20px rgba(0,0,0,0.15)", border: `1px solid ${C.border}`, zIndex: 1000, minWidth: 160, overflow: "hidden" }}>
          <button onClick={() => { onPNG(); setShow(false); }} style={exportItemStyle}>
            <Image size={14}/> {t.exportPngImage}
          </button>
          <button onClick={() => onPDF("A4")} style={exportItemStyle}>
            <FileText size={14}/> {t.exportPdfA4}
          </button>
          <button onClick={() => onPDF("A3")} style={exportItemStyle}>
            <FileText size={14}/> {t.exportPdfA3}
          </button>
        </div>
      )}
    </div>
  );
}

const exportItemStyle = {
  display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 14px",
  border: "none", background: "transparent", color: C.text, fontFamily: "'Lexend', sans-serif",
  fontSize: 13, fontWeight: 500, cursor: "pointer", textAlign: "left",
};

const shareBtnStyle = (bg) => ({
  display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px",
  borderRadius: 6, background: bg, color: "#fff", fontFamily: "'Lexend', sans-serif",
  fontSize: 12, fontWeight: 600, textDecoration: "none", cursor: "pointer",
});

function CookieBanner({ onAccept, isMobile, t }) {
  return (
    <div role="alert" style={{ position: "fixed", bottom: isMobile ? 56 : 0, left: 0, right: 0, zIndex: 500, background: C.toolbarBg, color: C.toolbarText, padding: isMobile ? "12px 14px" : "14px 24px", display: "flex", alignItems: isMobile ? "flex-start" : "center", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 10 : 16, boxShadow: "0 -2px 16px rgba(0,0,0,0.2)" }}>
      <Cookie size={18} style={{ flexShrink: 0, marginTop: isMobile ? 2 : 0 }} aria-hidden="true"/>
      <p style={{ fontSize: 12, lineHeight: 1.6, margin: 0, flex: 1 }}>{t.cookieBanner}</p>
      <button onClick={onAccept} style={{ padding: "8px 20px", borderRadius: 6, border: "none", background: C.secondary, color: C.toolbarBg, fontFamily: "inherit", fontWeight: 600, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>{t.cookieOk}</button>
    </div>
  );
}

/* === LANGUAGE PICKER === */
function LangPicker({ lang, setLang, isMobile, t }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen(!open)} aria-label={t.changeLanguage} aria-expanded={open} style={{ display: "flex", alignItems: "center", gap: 4, padding: isMobile ? "7px 8px" : "7px 12px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.25)", background: "transparent", color: C.toolbarText, fontFamily: "inherit", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
        <Globe size={15}/> {!isMobile && LANGS[lang].flag}
      </button>
      {open && (
        <div style={{ position: "absolute", top: "100%", right: 0, marginTop: 4, background: C.surface, borderRadius: 8, boxShadow: "0 4px 20px rgba(0,0,0,0.15)", border: `1px solid ${C.border}`, zIndex: 1000, minWidth: 140, overflow: "hidden" }}>
          {Object.values(LANGS).map(l => (
            <button key={l.code} onClick={() => { setLang(l.code); setOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 14px", border: "none", background: lang === l.code ? C.primaryLight : "transparent", color: C.text, fontFamily: "inherit", fontSize: 13, fontWeight: lang === l.code ? 600 : 400, cursor: "pointer", textAlign: "left" }}>
              <span style={{ fontWeight: 700, fontSize: 11, color: C.textMuted, width: 20 }}>{l.flag}</span> {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* === FOCUS STYLE (accessibility) === */
const focusOutline = "2px solid #0072B2";
const focusOffset = "2px";

/* === MAIN === */
export default function CAAMapBuilder() {
  const bp = useBreakpoint();
  const isMobile = bp === "mobile";
  const isTablet = bp === "tablet";

  const [lang, setLang] = useState("it");
  const t = useMemo(() => ({ ...T.it, ...(T[lang] || {}) }), [lang]);

  const [mapImage, setMapImage] = useState(null);
  const [mapDim, setMapDim] = useState({ w: 0, h: 0 });
  const [placed, setPlaced] = useState([]);
  const [undoStack, setUndoStack] = useState([]);
  const [selected, setSelected] = useState(null);
  const [symSize, setSymSize] = useState(DEFAULT_SIZE);
  const [dragIdx, setDragIdx] = useState(null);
  const [dragOff, setDragOff] = useState({ x: 0, y: 0 });
  const [hoverIdx, setHoverIdx] = useState(null);
  const [editingLabelIdx, setEditingLabelIdx] = useState(null);
  const [scale, setScale] = useState(1);
  const [showHelp, setShowHelp] = useState(false);
  const [search, setSearch] = useState("");
  const [openCats, setOpenCats] = useState(() => LIBRARY.reduce((a, c) => ({ ...a, [c.category]: true }), {}));
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [modal, setModal] = useState(null);
  const [cookieAccepted, setCookieAccepted] = useState(false);
  const [snapGrid, setSnapGrid] = useState(false);
  const [gridSize, setGridSize] = useState(40);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const mapFileRef = useRef(null);
  const mapRef = useRef(null);

  /* --- Snap helper --- */
  const snap = (val) => snapGrid ? Math.round(val / gridSize) * gridSize : val;

  /* --- Undo helpers --- */
  const pushUndo = (currentPlaced) => {
    setUndoStack(prev => {
      const next = [...prev, JSON.parse(JSON.stringify(currentPlaced))];
      return next.length > MAX_UNDO ? next.slice(-MAX_UNDO) : next;
    });
  };

  const doUndo = useCallback(() => {
    if (undoStack.length === 0) { setError(t.nothingToUndo); return; }
    setUndoStack(prev => {
      const next = [...prev];
      const last = next.pop();
      setPlaced(last);
      return next;
    });
  }, [undoStack, t.nothingToUndo]);

  /* --- Keyboard shortcut for undo --- */
  useEffect(() => {
    const h = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") { e.preventDefault(); doUndo(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [doUndo]);

  /* --- Map upload with magic bytes validation --- */
  const handleMap = (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    if (f.size > MAX_FILE) { setError(t.errFileSize); e.target.value = ""; return; }
    if (!f.type.match(/image\/(jpeg|png)/)) { setError(t.errFileType); e.target.value = ""; return; }
    setError(null);
    const headerReader = new FileReader();
    headerReader.onload = (he) => {
      const arr = new Uint8Array(he.target.result);
      const isJPEG = arr[0] === 0xFF && arr[1] === 0xD8 && arr[2] === 0xFF;
      const isPNG = arr[0] === 0x89 && arr[1] === 0x50 && arr[2] === 0x4E && arr[3] === 0x47;
      if (!isJPEG && !isPNG) { setError(t.errFileBad); return; }
      const r = new FileReader();
      r.onload = (ev) => {
        const img = new window.Image();
        img.onload = () => {
          if (img.width > 10000 || img.height > 10000) { setError(t.errFileDimensions); return; }
          setMapImage(ev.target.result); setMapDim({ w: img.width, h: img.height }); setPlaced([]); setUndoStack([]); setScale(1);
        };
        img.onerror = () => { setError(t.errFileCorrupt); };
        img.src = ev.target.result;
      };
      r.onerror = () => { setError(t.errFileRead); };
      r.readAsDataURL(f);
    };
    headerReader.readAsArrayBuffer(f.slice(0, 8));
    e.target.value = "";
  };

  /* --- Place symbol with undo and label --- */
  const placeSymbol = (e) => {
    if (!selected || !mapImage || dragIdx !== null) return;
    const rect = mapRef.current?.getBoundingClientRect(); if (!rect) return;
    const sym = LIBRARY.flatMap(c => c.symbols).find(s => s.id === selected); if (!sym) return;
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    pushUndo(placed);
    setPlaced(p => {
      if (p.length >= 200) { setError(t.errMaxSymbols); return p; }
      return [...p, { id: crypto.randomUUID(), src: sym.src, name: sym.name, x: snap((cx - rect.left) / scale - symSize / 2), y: snap((cy - rect.top) / scale - symSize / 2), size: symSize, label: "" }];
    });
    if (isMobile) setDrawerOpen(false);
  };

  /* --- Remove symbol with undo --- */
  const removeSymbol = (idx) => {
    pushUndo(placed);
    setPlaced(pr => pr.filter((_, j) => j !== idx));
  };

  /* --- Update label --- */
  const updateLabel = (idx, label) => {
    setPlaced(p => p.map((s, i) => i === idx ? { ...s, label } : s));
  };

  /* --- Drag --- */
  const startDrag = (e, idx) => {
    e.stopPropagation(); e.preventDefault();
    const rect = mapRef.current?.getBoundingClientRect(); if (!rect) return;
    pushUndo(placed);
    const p = placed[idx];
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    setDragOff({ x: cx - rect.left - p.x * scale, y: cy - rect.top - p.y * scale }); setDragIdx(idx);
  };

  useEffect(() => {
    if (dragIdx === null) return;
    const mv = (e) => {
      if (e.touches && e.cancelable) e.preventDefault();
      const rect = mapRef.current?.getBoundingClientRect(); if (!rect) return;
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;
      setPlaced(p => p.map((s, i) => i === dragIdx ? { ...s, x: snap((cx - rect.left - dragOff.x) / scale), y: snap((cy - rect.top - dragOff.y) / scale) } : s));
    };
    const up = () => setDragIdx(null);
    window.addEventListener("mousemove", mv); window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", mv, { passive: false }); window.addEventListener("touchend", up);
    return () => { window.removeEventListener("mousemove", mv); window.removeEventListener("mouseup", up); window.removeEventListener("touchmove", mv); window.removeEventListener("touchend", up); };
  }, [dragIdx, dragOff, scale]);

  /* --- Export with labels --- */
  const exportPNG = useCallback(async () => {
    if (!mapImage) return; setExporting(true);
    try {
      const maxPixels = 16777216;
      if (mapDim.w * mapDim.h > maxPixels) { setError(t.errCanvasTooBig); setExporting(false); return; }
      const cv = document.createElement("canvas"); cv.width = mapDim.w; cv.height = mapDim.h; const ctx = cv.getContext("2d");
      if (!ctx) { setError(t.errCanvasUnsupported); setExporting(false); return; }
      const mi = new window.Image(); await new Promise((r, j) => { mi.onload = r; mi.onerror = j; mi.src = mapImage; }); ctx.drawImage(mi, 0, 0, mapDim.w, mapDim.h);
      for (const p of placed) {
        const si = new window.Image(); await new Promise((r, j) => { si.onload = r; si.onerror = j; si.src = p.src; }); ctx.drawImage(si, p.x, p.y, p.size, p.size);
        if (p.label) {
          const fontSize = Math.max(12, Math.round(p.size * 0.22));
          ctx.font = `600 ${fontSize}px 'Lexend', sans-serif`;
          ctx.textAlign = "center";
          ctx.fillStyle = "rgba(44,41,38,0.85)";
          const tw = ctx.measureText(p.label).width;
          const pad = 4;
          const lx = p.x + p.size / 2;
          const ly = p.y + p.size + fontSize + 4;
          ctx.beginPath(); ctx.roundRect(lx - tw/2 - pad, ly - fontSize, tw + pad*2, fontSize + pad, 3); ctx.fill();
          ctx.fillStyle = "#FFFFFF";
          ctx.fillText(p.label, lx, ly - 2);
        }
      }
      const a = document.createElement("a"); a.download = "mappa-caa-museo.png"; a.href = cv.toDataURL("image/png"); a.click();
      cv.width = 0; cv.height = 0;
    } catch (err) { setError(t.errExport); }
    setExporting(false);
  }, [mapImage, mapDim, placed, t]);

  /* --- Build canvas helper (shared by PNG and PDF) --- */
  const buildCanvas = useCallback(async () => {
    const maxPixels = 16777216;
    if (mapDim.w * mapDim.h > maxPixels) throw new Error("too_big");
    const cv = document.createElement("canvas"); cv.width = mapDim.w; cv.height = mapDim.h;
    const ctx = cv.getContext("2d");
    if (!ctx) throw new Error("no_canvas");
    const mi = new window.Image(); await new Promise((r, j) => { mi.onload = r; mi.onerror = j; mi.src = mapImage; }); ctx.drawImage(mi, 0, 0, mapDim.w, mapDim.h);
    for (const p of placed) {
      const si = new window.Image(); await new Promise((r, j) => { si.onload = r; si.onerror = j; si.src = p.src; }); ctx.drawImage(si, p.x, p.y, p.size, p.size);
      if (p.label) {
        const fontSize = Math.max(12, Math.round(p.size * 0.22));
        ctx.font = `600 ${fontSize}px 'Lexend', sans-serif`;
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(44,41,38,0.85)";
        const tw = ctx.measureText(p.label).width;
        const pad = 4; const lx = p.x + p.size / 2; const ly = p.y + p.size + fontSize + 4;
        ctx.beginPath(); ctx.roundRect(lx - tw/2 - pad, ly - fontSize, tw + pad*2, fontSize + pad, 3); ctx.fill();
        ctx.fillStyle = "#FFFFFF"; ctx.fillText(p.label, lx, ly - 2);
      }
    }
    return cv;
  }, [mapImage, mapDim, placed]);

  /* --- PDF export --- */
  const exportPDF = useCallback(async (format) => {
    if (!mapImage) return; setExporting(true);
    try {
      const cv = await buildCanvas();
      const jpegUrl = cv.toDataURL("image/jpeg", 0.92);
      const jpegB64 = jpegUrl.split(",")[1];
      const jpegBytes = Uint8Array.from(atob(jpegB64), c => c.charCodeAt(0));

      // Page dimensions in PDF points (1 point = 1/72 inch)
      const pages = { A4: [595.28, 841.89], A3: [841.89, 1190.55] };
      const [pw, ph] = pages[format] || pages.A4;
      const margin = 36; // 0.5 inch

      // Fit image in page with margins
      const maxW = pw - margin * 2; const maxH = ph - margin * 2;
      const imgAspect = mapDim.w / mapDim.h;
      let imgW, imgH;
      if (imgAspect > maxW / maxH) { imgW = maxW; imgH = maxW / imgAspect; }
      else { imgH = maxH; imgW = maxH * imgAspect; }
      const imgX = (pw - imgW) / 2;
      const imgY = (ph - imgH) / 2;

      // Build minimal PDF
      const enc = new TextEncoder();
      const parts = [];
      const offsets = [];
      let pos = 0;
      const write = (s) => { const b = enc.encode(s); parts.push(b); pos += b.length; };
      const writeBytes = (b) => { parts.push(b); pos += b.length; };

      write("%PDF-1.4\n%\xFF\xFF\xFF\xFF\n");

      // Object 1: Catalog
      offsets[1] = pos;
      write("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");

      // Object 2: Pages
      offsets[2] = pos;
      write("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");

      // Object 3: Page
      offsets[3] = pos;
      write(`3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pw.toFixed(2)} ${ph.toFixed(2)}] /Contents 4 0 R /Resources << /XObject << /Img 5 0 R >> >> >>\nendobj\n`);

      // Object 4: Content stream (draw image)
      const contentStr = `q ${imgW.toFixed(2)} 0 0 ${imgH.toFixed(2)} ${imgX.toFixed(2)} ${imgY.toFixed(2)} cm /Img Do Q\n`;
      offsets[4] = pos;
      write(`4 0 obj\n<< /Length ${contentStr.length} >>\nstream\n${contentStr}endstream\nendobj\n`);

      // Object 5: Image XObject
      offsets[5] = pos;
      write(`5 0 obj\n<< /Type /XObject /Subtype /Image /Width ${mapDim.w} /Height ${mapDim.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`);
      writeBytes(jpegBytes);
      write("\nendstream\nendobj\n");

      // Cross-reference table
      const xrefPos = pos;
      write("xref\n");
      write(`0 6\n`);
      write("0000000000 65535 f \n");
      for (let i = 1; i <= 5; i++) { write(String(offsets[i]).padStart(10, "0") + " 00000 n \n"); }

      // Trailer
      write(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`);

      // Create blob and download
      const blob = new Blob(parts, { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.download = `mappa-caa-museo-${format}.pdf`; a.href = url; a.click();
      URL.revokeObjectURL(url);
      cv.width = 0; cv.height = 0;
    } catch (err) {
      if (err.message === "too_big") setError(t.errCanvasTooBig);
      else if (err.message === "no_canvas") setError(t.errCanvasUnsupported);
      else setError(t.errExport);
    }
    setExporting(false); setShowExportMenu(false);
  }, [mapImage, mapDim, buildCanvas, t]);

  const filtered = LIBRARY.map(c => ({ ...c, symbols: c.symbols.filter(s => s.name.toLowerCase().includes(search.toLowerCase())) })).filter(c => c.symbols.length > 0);
  const dW = mapDim.w * scale, dH = mapDim.h * scale;
  const sideW = isTablet ? 200 : 230;
  const quoteMailto = `mailto:info@caa4all.org?subject=${encodeURIComponent(t.quoteSubject)}`;

  /* === SIDEBAR CONTENT === */
  const SidebarContent = (
    <>
      <div style={{ padding: "10px 12px 6px" }}>
        <div style={{ position: "relative" }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: 10, color: C.textLight }} aria-hidden="true"/>
          <input placeholder={t.searchSymbol} value={search} onChange={e => setSearch(e.target.value)} aria-label={t.searchSymbol}
            style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px 8px 30px", borderRadius: 7, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: "inherit", color: C.text, background: C.bg, outline: "none" }}
            onFocus={e => e.target.style.outline = focusOutline} onBlur={e => e.target.style.outline = "none"} />
        </div>
      </div>
      <div style={{ padding: "4px 12px 8px", borderBottom: `1px solid ${C.border}` }}>
        <label style={{ fontSize: 11, fontWeight: 500, color: C.textMuted, display: "flex", justifyContent: "space-between" }}><span>{t.size}</span><span style={{ color: C.text, fontWeight: 600 }}>{symSize}px</span></label>
        <input type="range" min={32} max={128} step={8} value={symSize} onChange={e => setSymSize(+e.target.value)} aria-label={t.size}
          style={{ width: "100%", accentColor: C.primary, marginTop: 4 }} />
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "4px 0", WebkitOverflowScrolling: "touch" }} role="list" aria-label={t.libraryTitle}>
        {filtered.map(cat => {
          const catName = t[CAT_KEYS[cat.category]] || cat.category;
          return (
          <div key={cat.category} role="listitem">
            <button onClick={() => setOpenCats(p => ({ ...p, [cat.category]: !p[cat.category] }))} aria-expanded={openCats[cat.category]} aria-label={catName}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 600, color: C.text, textAlign: "left", outline: "none" }}
              onFocus={e => { e.target.style.outline = focusOutline; e.target.style.outlineOffset = focusOffset; }} onBlur={e => e.target.style.outline = "none"}>
              <CategoryShape shape={cat.shape} color={cat.color} size={12} />
              {catName}
              <span style={{ marginLeft: "auto", fontSize: 10, color: C.textLight }} aria-hidden="true">{openCats[cat.category] ? "▾" : "▸"}</span>
            </button>
            {openCats[cat.category] && (
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(auto-fill, minmax(70px, 1fr))" : "1fr 1fr 1fr", gap: 4, padding: "0 8px 8px" }} role="grid">
                {cat.symbols.map(sym => (
                  <button key={sym.id} onClick={() => setSelected(selected === sym.id ? null : sym.id)} title={sym.name} role="gridcell"
                    aria-pressed={selected === sym.id} aria-label={sym.name}
                    style={{ background: selected === sym.id ? C.primaryLight : C.bg, border: `2px solid ${selected === sym.id ? C.primary : "transparent"}`, borderRadius: 8, padding: isMobile ? 8 : 5, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, transition: "all 0.12s", minHeight: isMobile ? 72 : "auto", outline: "none" }}
                    onFocus={e => { e.target.style.outline = focusOutline; e.target.style.outlineOffset = focusOffset; }} onBlur={e => e.target.style.outline = "none"}>
                    <img src={sym.src} alt={sym.name} style={{ width: isMobile ? 44 : 40, height: isMobile ? 44 : 40, objectFit: "contain" }} draggable={false} />
                    <span style={{ fontSize: isMobile ? 10 : 9, fontWeight: 500, color: selected === sym.id ? C.primary : C.textMuted, textAlign: "center", lineHeight: 1.2, wordBreak: "break-word" }}>{sym.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        );})}
      </div>
    </>
  );

  return (
    <div style={{ minHeight: "100vh", maxHeight: "100vh", background: C.bg, fontFamily: "'Lexend', sans-serif", display: "flex", flexDirection: "column", overflow: "hidden" }} lang={lang}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap" rel="stylesheet" referrerPolicy="no-referrer" />
      <input ref={mapFileRef} type="file" accept="image/jpeg,image/png" onChange={handleMap} style={{ display: "none" }} aria-hidden="true" />

      {/* SKIP LINK (accessibility) */}
      <a href="#map-area" style={{ position: "absolute", left: -9999, top: 0, background: C.primary, color: "#fff", padding: "8px 16px", zIndex: 99999, fontSize: 14, fontWeight: 600, borderRadius: "0 0 8px 0" }}
        onFocus={e => e.target.style.left = "0"} onBlur={e => e.target.style.left = "-9999px"}>
        {t.skipToMap}
      </a>

      {/* HEADER */}
      <header role="banner" style={{ background: C.toolbarBg, color: C.toolbarText, padding: isMobile ? "10px 12px" : "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, cursor: "pointer" }} onClick={() => setModal("project")} role="button" tabIndex={0} aria-label={t.project} onKeyDown={e => e.key === "Enter" && setModal("project")}>
          <div style={{ width: isMobile ? 28 : 34, height: isMobile ? 28 : 34, borderRadius: 8, background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }} aria-hidden="true">
            <span style={{ fontSize: isMobile ? 11 : 13, fontWeight: 700, color: "#fff" }}>4all</span>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: isMobile ? 14 : 18, fontWeight: 700, whiteSpace: "nowrap" }}>{t.appName}</div>
            {!isMobile && <div style={{ fontSize: 11, opacity: 0.7, fontWeight: 300 }}>{t.appSub}</div>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, flexShrink: 0, alignItems: "center" }}>
          <LangPicker lang={lang} setLang={setLang} isMobile={isMobile} t={t} />
          <HBtn icon={<Info size={15}/>} label={isMobile ? "" : t.project} onClick={() => setModal("project")} ariaLabel={t.project} />
          {!isMobile && <HBtn icon={<HelpCircle size={15}/>} label={t.guide} onClick={() => setShowHelp(!showHelp)} ariaLabel={t.guide} />}
          <HBtn icon={<Undo2 size={15}/>} label={isMobile ? "" : t.undo} onClick={doUndo} disabled={undoStack.length === 0} ariaLabel={t.undo} />
          <HBtn icon={<RotateCcw size={15}/>} label={isMobile ? "" : t.reset} onClick={() => { pushUndo(placed); setPlaced([]); setMapImage(null); setError(null); setUndoStack([]); }} ariaLabel={t.reset} />
          <ExportMenu onPNG={exportPNG} onPDF={exportPDF} show={showExportMenu} setShow={setShowExportMenu} disabled={!mapImage || exporting} exporting={exporting} t={t} isMobile={isMobile} />
        </div>
      </header>

      {showHelp && (
        <div role="region" aria-label={t.howTitle} style={{ background: C.primaryLight, borderBottom: `1px solid ${C.primary}`, padding: "12px 16px", fontSize: 13, color: C.text, lineHeight: 1.7, flexShrink: 0 }}>
          <strong>{t.howTitle}</strong><br/>
          {t.how1}<br/>{t.how2}<br/>{t.how3}<br/>{t.how4}
          <div style={{ marginTop: 8, padding: "8px 0", fontSize: 12, color: C.primary, fontWeight: 500 }}>{t.how5}</div>
          <div style={{ marginTop: 6 }}><button onClick={() => setShowHelp(false)} style={{ background: "none", border: "none", color: C.primary, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>{t.howClose}</button></div>
        </div>
      )}

      {error && (
        <div role="alert" style={{ background: C.warningLight, borderBottom: `2px solid ${C.warning}`, padding: "8px 16px", fontSize: 13, color: C.warning, fontWeight: 500, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          {error}<button onClick={() => setError(null)} aria-label={t.closeError} style={{ background: "none", border: "none", color: C.warning, cursor: "pointer", padding: 0 }}><X size={16}/></button>
        </div>
      )}

      <div style={{ display: "flex", flex: 1, minHeight: 0, position: "relative" }}>
        {!isMobile && (
          <aside role="complementary" aria-label={t.libraryTitle} style={{ width: sidebarOpen ? sideW : 0, minWidth: sidebarOpen ? sideW : 0, background: C.surface, borderRight: sidebarOpen ? `1px solid ${C.border}` : "none", display: "flex", flexDirection: "column", overflow: "hidden", transition: "width 0.25s, min-width 0.25s", flexShrink: 0 }}>
            {sidebarOpen && SidebarContent}
          </aside>
        )}

        <main role="main" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
          {/* Toolbar */}
          <nav aria-label={t.mapTools} style={{ padding: isMobile ? "6px 10px" : "8px 16px", background: C.surfaceAlt, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: isMobile ? 6 : 10, fontSize: 12, flexWrap: "nowrap", overflowX: "auto", flexShrink: 0 }}>
            {!isMobile && <button onClick={() => setSidebarOpen(!sidebarOpen)} style={tBtn} aria-label={sidebarOpen ? t.closeLibrary : t.openLibrary} aria-expanded={sidebarOpen}><Layers size={14}/></button>}
            <button onClick={() => mapFileRef.current?.click()} style={tBtn} aria-label={t.uploadMap}><Upload size={14}/> {isMobile ? t.uploadMapShort : t.uploadMap}</button>
            <span style={{ width: 1, height: 20, background: C.border, flexShrink: 0 }} aria-hidden="true" />
            <button onClick={() => setScale(s => Math.max(s - 0.15, 0.2))} style={tBtn} disabled={!mapImage} aria-label={t.zoomOut}><ZoomOut size={14}/></button>
            <span style={{ color: C.textMuted, fontWeight: 500, minWidth: 36, textAlign: "center", flexShrink: 0 }} aria-live="polite">{Math.round(scale * 100)}%</span>
            <button onClick={() => setScale(s => Math.min(s + 0.15, 3))} style={tBtn} disabled={!mapImage} aria-label={t.zoomIn}><ZoomIn size={14}/></button>
            {!isMobile && <button onClick={() => setScale(1)} style={{ ...tBtn, fontSize: 11 }} disabled={!mapImage} aria-label={t.fit}>{t.fit}</button>}
            <span style={{ width: 1, height: 20, background: C.border, flexShrink: 0 }} aria-hidden="true" />
            <button onClick={() => setSnapGrid(!snapGrid)} disabled={!mapImage} aria-pressed={snapGrid} aria-label={t.snapGrid}
              style={{ ...tBtn, background: snapGrid ? C.primaryLight : C.surface, border: `1px solid ${snapGrid ? C.primary : C.border}`, color: snapGrid ? C.primary : C.text }}>
              <Grid3X3 size={14}/> {!isMobile && t.snapGrid}
            </button>
            {snapGrid && !isMobile && (
              <select value={gridSize} onChange={e => setGridSize(+e.target.value)} aria-label={t.gridSize}
                style={{ padding: "4px 6px", borderRadius: 5, border: `1px solid ${C.border}`, background: C.surface, color: C.text, fontFamily: "'Lexend', sans-serif", fontSize: 11, cursor: "pointer" }}>
                <option value={20}>20px</option>
                <option value={40}>40px</option>
                <option value={60}>60px</option>
                <option value={80}>80px</option>
              </select>
            )}
            <div style={{ flex: 1, minWidth: 8 }} />
            {selected && !isMobile && <div style={{ display: "flex", alignItems: "center", gap: 6, background: C.primaryLight, border: `1px solid ${C.primary}`, borderRadius: 6, padding: "4px 10px", color: C.primary, fontWeight: 500, fontSize: 12, whiteSpace: "nowrap", flexShrink: 0 }} role="status"><MousePointer2 size={13}/> {t.clickToPlace}</div>}
            {placed.length > 0 && <span style={{ color: C.textMuted, whiteSpace: "nowrap", flexShrink: 0 }} aria-live="polite">{placed.length}</span>}
          </nav>

          {/* Map area */}
          <div id="map-area" tabIndex={-1} style={{ flex: 1, overflow: "auto", display: "flex", alignItems: mapImage ? "flex-start" : "center", justifyContent: mapImage ? "flex-start" : "center", padding: mapImage ? (isMobile ? 10 : 20) : 0, background: C.mapBg, WebkitOverflowScrolling: "touch", paddingBottom: isMobile && drawerOpen ? 320 : (isMobile ? 90 : 36) }}>
            {!mapImage ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, width: isMobile ? "90%" : "auto", maxWidth: 440 }}>
                <div onClick={() => mapFileRef.current?.click()} role="button" tabIndex={0} aria-label={t.loadMapTitle}
                  onKeyDown={e => e.key === "Enter" && mapFileRef.current?.click()}
                  style={{ width: "100%", padding: isMobile ? "40px 24px" : "56px 36px", textAlign: "center", borderRadius: 12, border: `2px dashed ${C.border}`, background: C.surface, cursor: "pointer", outline: "none" }}
                  onFocus={e => { e.target.style.outline = focusOutline; e.target.style.outlineOffset = focusOffset; }} onBlur={e => e.target.style.outline = "none"}>
                  <Image size={isMobile ? 36 : 48} strokeWidth={1.2} style={{ color: C.textLight, marginBottom: 14 }} aria-hidden="true" />
                  <div style={{ fontSize: isMobile ? 14 : 16, fontWeight: 600, color: C.text, marginBottom: 6 }}>{t.loadMapTitle}</div>
                  <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.5 }}>{t.loadMapSub}</div>
                </div>
                <div style={{ width: "100%", padding: "16px 20px", background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, textAlign: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>{t.noMapTitle}</div>
                  <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6, marginBottom: 10 }}>{t.noMapText}</div>
                  <a href={quoteMailto} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 6, background: C.primary, color: "#fff", fontFamily: "inherit", fontWeight: 600, fontSize: 12, textDecoration: "none", cursor: "pointer" }}>
                    {t.noMapCta}
                  </a>
                </div>
              </div>
            ) : (
              <div ref={mapRef} onClick={placeSymbol} aria-label={t.mapArea} role="application"
                style={{ position: "relative", width: dW, height: dH, flexShrink: 0, cursor: selected ? "crosshair" : "default", boxShadow: "0 2px 20px rgba(0,0,0,0.12)", borderRadius: 4, overflow: "hidden" }}>
                <img src={mapImage} alt="Mappa museo" style={{ width: dW, height: dH, display: "block", userSelect: "none", pointerEvents: "none" }} draggable={false} />
                {/* Grid overlay */}
                {snapGrid && mapImage && (
                  <svg style={{ position: "absolute", top: 0, left: 0, width: dW, height: dH, pointerEvents: "none", zIndex: 5 }} aria-hidden="true">
                    <defs>
                      <pattern id="snapGridPattern" width={gridSize * scale} height={gridSize * scale} patternUnits="userSpaceOnUse">
                        <path d={`M ${gridSize * scale} 0 L 0 0 0 ${gridSize * scale}`} fill="none" stroke="rgba(0,114,178,0.2)" strokeWidth="0.5"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#snapGridPattern)"/>
                  </svg>
                )}
                {placed.map((p, i) => (
                  <div key={p.id} onMouseDown={e => startDrag(e, i)} onTouchStart={e => startDrag(e, i)} onMouseEnter={() => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(null)}
                    tabIndex={0} role="button" aria-label={`${p.name}${p.label ? ': ' + p.label : ''}`}
                    onKeyDown={e => { if (e.key === "Delete" || e.key === "Backspace") removeSymbol(i); if (e.key === "Enter") setEditingLabelIdx(i); }}
                    style={{ position: "absolute", left: p.x * scale, top: p.y * scale, width: p.size * scale, height: p.size * scale, cursor: "grab", zIndex: dragIdx === i ? 100 : 10, filter: dragIdx === i ? "drop-shadow(0 4px 8px rgba(0,0,0,0.35))" : "drop-shadow(0 1px 4px rgba(0,0,0,0.25))", transition: dragIdx === i ? "none" : "filter 0.15s", outline: "none" }}
                    onFocus={e => { e.target.style.outline = `3px solid ${C.primary}`; setHoverIdx(i); }} onBlur={e => { e.target.style.outline = "none"; setHoverIdx(null); }}>
                    <img src={p.src} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", userSelect: "none", pointerEvents: "none" }} draggable={false} />
                    {/* Label under symbol */}
                    {(editingLabelIdx === i) ? (
                      <input autoFocus value={p.label} onChange={e => updateLabel(i, e.target.value)}
                        onBlur={() => setEditingLabelIdx(null)} onKeyDown={e => { if (e.key === "Enter") setEditingLabelIdx(null); e.stopPropagation(); }}
                        onClick={e => e.stopPropagation()}
                        placeholder={t.labelPlaceholder}
                        style={{ position: "absolute", bottom: -28 * (1/scale), left: "50%", transform: `translateX(-50%) scale(${1/scale})`, transformOrigin: "top center", background: C.surface, border: `2px solid ${C.primary}`, borderRadius: 4, padding: "3px 8px", fontSize: 12, fontFamily: "inherit", fontWeight: 600, textAlign: "center", color: C.text, outline: "none", minWidth: 80, zIndex: 120 }} />
                    ) : p.label ? (
                      <div onClick={e => { e.stopPropagation(); setEditingLabelIdx(i); }}
                        style={{ position: "absolute", bottom: -22 * (1/scale), left: "50%", transform: `translateX(-50%) scale(${1/scale})`, transformOrigin: "top center", background: "rgba(44,41,38,0.85)", color: "#fff", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4, whiteSpace: "nowrap", cursor: "text", zIndex: 15 }}>
                        {p.label}
                      </div>
                    ) : null}
                    {/* Hover/focus controls */}
                    {(hoverIdx === i || (isMobile && i === placed.length - 1 && dragIdx === null)) && (
                      <>
                        <button onClick={e => { e.stopPropagation(); removeSymbol(i); }} aria-label={`${t.removePrefix} ${p.name}`}
                          style={{ position: "absolute", top: -10, right: -10, width: isMobile ? 28 : 22, height: isMobile ? 28 : 22, borderRadius: "50%", border: "2px solid #fff", background: C.danger, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 110, padding: 0 }}><X size={isMobile ? 14 : 12}/></button>
                        {!p.label && (
                          <button onClick={e => { e.stopPropagation(); setEditingLabelIdx(i); }} aria-label={t.addLabel}
                            style={{ position: "absolute", top: -10, left: -10, width: isMobile ? 28 : 22, height: isMobile ? 28 : 22, borderRadius: "50%", border: "2px solid #fff", background: C.primary, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 110, padding: 0 }}><Type size={isMobile ? 12 : 10}/></button>
                        )}
                        {!p.label && <div style={{ position: "absolute", bottom: isMobile ? -20 : -24, left: "50%", transform: "translateX(-50%)", background: C.toolbarBg, color: "#fff", fontSize: 10, fontWeight: 500, padding: "2px 8px", borderRadius: 4, whiteSpace: "nowrap", zIndex: 15 }}>{p.name}</div>}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer desktop */}
          {!isMobile && (
            <div style={{ padding: "8px 20px", background: C.surfaceAlt, borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 20, fontSize: 11, color: C.textMuted, flexShrink: 0 }}>
              <span>© {new Date().getFullYear()} CAA4all · {t.symbolsBy}</span>
              <button onClick={() => setModal("project")} style={footerLink}><Info size={11}/> {t.project}</button>
              <button onClick={() => setModal("privacy")} style={footerLink}><Shield size={11}/> {t.privacy}</button>
              <button onClick={() => setModal("cookie")} style={footerLink}><Cookie size={11}/> {t.cookie}</button>
            </div>
          )}
        </main>
      </div>

      {/* MOBILE DRAWER */}
      {isMobile && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: C.surface, borderTop: `1px solid ${C.border}`, borderRadius: "16px 16px 0 0", boxShadow: "0 -4px 24px rgba(0,0,0,0.15)", zIndex: 200, display: "flex", flexDirection: "column", maxHeight: drawerOpen ? "65vh" : 56, transition: "max-height 0.3s ease", overflow: "hidden" }}>
          <button onClick={() => setDrawerOpen(!drawerOpen)} aria-expanded={drawerOpen} aria-label={t.libraryTitle}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px 16px", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 600, color: C.text, flexShrink: 0, position: "relative" }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: C.border, position: "absolute", top: 8 }} aria-hidden="true" />
            <Layers size={16} style={{ color: C.primary }} aria-hidden="true" />
            <span>{t.libraryTitle}</span>
            {selected && <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.primary }} aria-hidden="true" />}
            {drawerOpen ? <ChevronDown size={16} aria-hidden="true" /> : <ChevronUp size={16} aria-hidden="true" />}
          </button>
          {drawerOpen && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              {SidebarContent}
              <div style={{ padding: "10px 14px", borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 14, fontSize: 11, color: C.textMuted, flexShrink: 0, flexWrap: "wrap" }}>
                <span>{t.symbolsBy}</span>
                <button onClick={() => setModal("project")} style={footerLink}><Info size={10}/> {t.project}</button>
                <button onClick={() => setModal("privacy")} style={footerLink}><Shield size={10}/> {t.privacy}</button>
                <button onClick={() => setModal("cookie")} style={footerLink}><Cookie size={10}/> {t.cookie}</button>
              </div>
            </div>
          )}
        </div>
      )}

      {!cookieAccepted && <CookieBanner onAccept={() => setCookieAccepted(true)} isMobile={isMobile} t={t} />}

      {modal === "project" && <Modal title={t.project} onClose={() => setModal(null)} isMobile={isMobile} closeLabel={t.close}><ProjectContent isMobile={isMobile} t={t} /></Modal>}
      {modal === "privacy" && <Modal title={t.privacy + " Policy"} onClose={() => setModal(null)} isMobile={isMobile} closeLabel={t.close}><PolicyContent text={PRIVACY_POLICY} /></Modal>}
      {modal === "cookie" && <Modal title={t.cookie + " Policy"} onClose={() => setModal(null)} isMobile={isMobile} closeLabel={t.close}><PolicyContent text={COOKIE_POLICY} /></Modal>}
    </div>
  );
}

function HBtn({ icon, label, onClick, primary, disabled, ariaLabel }) {
  return <button onClick={onClick} disabled={disabled} aria-label={ariaLabel || label || undefined}
    style={{ display: "flex", alignItems: "center", gap: label ? 5 : 0, padding: label ? "7px 12px" : "7px 8px", borderRadius: 6, border: primary ? "none" : "1px solid rgba(255,255,255,0.25)", background: primary ? C.secondary : "transparent", color: primary ? C.toolbarBg : C.toolbarText, fontFamily: "inherit", fontWeight: 600, fontSize: 12, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, outline: "none" }}
    onFocus={e => { e.target.style.outline = focusOutline; e.target.style.outlineOffset = focusOffset; }} onBlur={e => e.target.style.outline = "none"}
  >{icon} {label}</button>;
}

const tBtn = { display: "flex", alignItems: "center", gap: 4, padding: "6px 10px", borderRadius: 5, border: `1px solid ${C.border}`, background: C.surface, color: C.text, fontFamily: "'Lexend', sans-serif", fontWeight: 500, fontSize: 12, cursor: "pointer", flexShrink: 0 };

const footerLink = { background: "none", border: "none", cursor: "pointer", color: C.textMuted, fontFamily: "'Lexend', sans-serif", fontSize: 11, fontWeight: 500, display: "flex", alignItems: "center", gap: 4, padding: 0, textDecoration: "underline", textDecorationColor: C.border, textUnderlineOffset: 2 };
