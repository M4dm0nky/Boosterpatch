# CLAUDE.md — Boosterpatch

## Projekt-Überblick

**Boosterpatch** ist ein browser-basiertes DMX-Booster-Patchmanagement-Tool für Lichttechniker auf Tour.
Keine Installation, kein Backend, vollständig offline nutzbar.

- **Version:** `v0.9.4.8` (2026-04-17) — `APP_VERSION` in [js/state.js](js/state.js)
- **Live-URL:** https://m4dm0nky.github.io/Boosterpatch/boosterpatch.html
- **Sprache:** UI auf Deutsch, Code auf Englisch
- **Lizenz:** MIT

> **WICHTIG:** Vor jeder Implementierung die aktuelle Versionsnummer erfragen und `APP_VERSION` in `js/state.js` vor dem Build anpassen.

---

## Build-System

```bash
python3 build.py
```

Liest `src/template.html`, fügt CSS + JS inline ein, schreibt `boosterpatch.html`.

**CSS-Reihenfolge (Pflicht):**
`variables.css` → `layout.css` → `rack.css` → `patch-table.css` → `modal.css` → `misc.css`

**JS-Reihenfolge (Pflicht):**
`state.js` → `ui.js` → `device-render.js` → `device-crud.js` → `patch.js` → `fixtures.js` → `storage.js` → `main.js`

**Output:** `boosterpatch.html` (~4.700 Zeilen, ~145 KB) — diese Datei wird auf GitHub Pages deployed.

> Quell-Dateien editieren, dann `python3 build.py` ausführen. Nie direkt in `boosterpatch.html` schreiben.

---

## Dateistruktur

```
Boosterpatch/
├── boosterpatch.html          Kompilierter Output (nicht direkt editieren)
├── build.py                   Build-Script (Python 3, keine Dependencies)
├── src/template.html          HTML-Skelett mit BUILD:CSS und BUILD:JS Platzhaltern
├── README.md                  Projektdokumentation
├── CHANGELOG.md               Versionshistorie
├── skin Feature.md            Dokumentation des entfernten Skin-Systems
│
├── css/
│   ├── variables.css          CSS Custom Properties (Farben, Fonts, Dimensions)
│   ├── layout.css             Grid, Header, Sidebar, Tabs, CORES-Panel
│   ├── rack.css               Device-Cards, XLR-Connectors, Retro-Lamps
│   ├── patch-table.css        Patch- und Schematik-Tabellen
│   ├── modal.css              Modal-Dialoge, Booster-Setup-Wizard
│   └── misc.css               7-Segment-Displays, Toasts, Popovers, Empty-State
│
├── js/
│   ├── state.js               APP_VERSION, globaler State, generateUUID, showToast, escHtml
│   ├── ui.js                  openModal/closeModal, switchTab (3 Tabs)
│   ├── device-render.js       buildDeviceCard, buildXLRConnector, buildSegDisplay, SEG_MAP
│   ├── device-crud.js         createDevice, deleteDevice, duplicateDevice, Booster-Setup-Modal
│   ├── patch.js               ETH-Panel, Universe-Popover, renderPatchTable, renderSchematicTable
│   ├── fixtures.js            TSV-Import, parseTxtToFixtures, renderFixtureTab, Fixture-Popover
│   ├── storage.js             Multi-Plan localStorage, FileSystem API, IndexedDB, Print, Logos
│   └── main.js                App-Initialisierung (Bootstrap-Sequenz)
│
└── .github/workflows/pages.yml  GitHub Pages Deploy (push → main)
```

---

## Architektur

### Zentrale Prinzipien
- **Vanilla JavaScript** — kein Framework, kein npm, kein Bundler
- **Single Source of Truth** — globales `state`-Objekt in `state.js`
- **Single-File Output** — Build erzeugt eine selbstenthaltende HTML-Datei
- **Module by concern** — CRUD, Render, Storage, UI strikt getrennt

### Typischer Datenfluss
1. User-Aktion → CRUD-Funktion aktualisiert `state`
2. Render-Funktion liest `state` → erzeugt DOM
3. `storage.js` serialisiert `state` → localStorage / File

### Modul-Rollen auf einen Blick

| Modul | Zuständigkeit |
|---|---|
| `state.js` | State-Container, Utilities (`generateUUID`, `showToast`, `markModified`) |
| `ui.js` | Modal-Lifecycle, Tab-Wechsel |
| `device-render.js` | DOM-Bau für Rack-Units, XLR-Pins, 7-Segment-Displays |
| `device-crud.js` | Device anlegen/löschen/duplizieren, Projekt-Reset, Booster-Setup-Wizard |
| `patch.js` | ETH-Panel (Drag & Drop), Universe-Popover, Patch-Tabelle, Schematik |
| `fixtures.js` | Fixture-DB (TSV-Import), Linien-Zuordnung, Fixture-Popover |
| `storage.js` | Multi-Plan LS, FileSystem API, IndexedDB FileHandle, Print-Export, Logo-Upload |
| `main.js` | ResizeObserver für Rack-Scaling, ETH-Panel init, Auto-Save starten, Plan laden |

---

## Datenmodelle

### Device
```javascript
{
  id: "uuid",
  name: "DMX Booster FOH",
  inputs: 1 | 2,
  outputs: 4..12,
  connections: {
    inputs:  [{ id, universe, label, notes, active }],
    outputs: [{ id, universe, startChannel, label, notes, active, ethId, routeToInput }]
  }
}
```

### Fixture
```javascript
{ fixtureId: "F001", type: "LED PAR", line: "LK C/1" }
// Import aus TSV: Spalten "Fixture", "Typ", "Line" (NullPunkt wird übersprungen)
```

### ETH-Quellen (auto-generiert)
```javascript
// 16 feste Einträge: Gruppen A, B, C, US × je 4 Ports
{ id: "eth_a_1", group: "ETH A", port: 1 }
```

### Projekt-Speicherformat (JSON)
```javascript
{
  appVersion: "v0.9.4.8",
  projectName: "My Show 2026",
  created: "ISO8601",
  modified: "ISO8601",
  devices: [...],
  logos: { planer: "base64", band: "base64", booking: "base64" },
  fixtureDatabase: [...]
}
```

---

## Features

### Tabs (3 Views)
| Tab-ID | Button-ID | Inhalt |
|---|---|---|
| `tabPatch` | `tabBtnPatch` | Visuelle Rack-Ansicht + CORES-Panel |
| `tabDetails` | `tabBtnDetails` | Schematische Tabellen-Übersicht |
| `tabFixtures` | `tabBtnFixtures` | Fixture-Datenbank nach Linien |

### CORES-Panel
- Linke Sidebar der Patch-Ansicht
- Zeigt ETH-Quellen (A/B/C/US) und importierte Fixture-Linien
- Elemente sind per Drag & Drop auf Outputs ziehbar
- Rechtsklick auf Output/Input → Verbindung trennen

### 7-Segment-Displays (11-Segment)
- Amber-Glow (#ffb200), CSS-only (kein Canvas)
- Segmente: a–g (Standard) + ul, ur, ll, lr (Diagonalen)
- Input-Display: `U###` (Universe-Nummer)
- Output-Display: 2-zeilig — Linien-Präfix / Linien-Nummer
- Zeichenabbildung via `SEG_MAP` in `device-render.js`

### Retro-Lamps
- Orange = IN 1 (`.retro-lamp.on` via `applyLampOn`)
- Blau = IN 2
- XLR-Output-LEDs: `.active` wenn ETH + Input aktiv

### Print/Export
- `exportPrint()` in `storage.js` — öffnet neues Fenster
- A4 Landscape, 10mm Rand, `window.print()` nach 350ms
- 3-spaltige Kopfzeile: Planer-Logo | Titel + Band-Logo | Datum + Booking-Logo
- Spalten dynamisch nach max. Output-Anzahl (max. 12)
- IN-2-Spalte erscheint nur wenn ≥1 Gerät 2 Inputs hat

### Logos
- 3 Slots: `planer` (links), `band` (Mitte), `booking` (rechts)
- Upload als Base64-DataURL, persistent in localStorage (`boosterpatch-logos`)
- Erscheinen in Header und Print-Dokument

---

## Speicher-Konzept

### Layer 1 — localStorage (Multi-Plan)
- Index-Key: `bp-plans-index` → `[{id, name, modified}]`
- Plan-Key: `bp-plan-{planId}` → vollständiges JSON
- Legacy-Migration von `boosterpatch-state` beim ersten Start
- Auto-Save alle 2 Minuten via `autoSaveToLS()`

### Layer 2 — FileSystem Access API
- `window.showSaveFilePicker()` → User wählt .json-Datei
- FileHandle in IndexedDB gespeichert (DB: `boosterpatch-db`, Store: `filehandles`, Key: `current`)
- Erlaubt Auto-Save direkt in die zuletzt geöffnete Datei

### Layer 3 — Download-Fallback
- `downloadJSON()` — direkter Browser-Download wenn FileSystem API nicht verfügbar

### Status-Anzeige
- `#saveIndicator` im Header — zeigt "● UNGESPEICHERT" oder "✓ AUTO-GESPEICHERT"

---

## CSS-Architektur

### Design-Tokens (`variables.css`)
```css
--app-bg: #0d0f14;          /* Haupt-Hintergrund */
--sidebar-bg: #141720;
--header-bg: #0a0c14;
--header-border: #e8c84a;   /* Gold-Akzent */
--accent: #e8c84a;
--accent-green: #4ae8a0;
--accent-red: #e84a4a;
--accent-orange: #e8a04a;
--seg-on: #ffb200;          /* 7-Segment Amber */
--sidebar-w: 200px;
--header-h: 64px;
/* html { zoom: 1.2; } — globale 20% Skalierung */
```

### Layout-Grid
```
body: 2 rows (header, main) × 2 cols (sidebar, content)
Bereiche: "header header" / "sidebar main"
```

### Wichtige CSS-Klassen
- `.rack-unit` — ein Booster-Gerät
- `.xlr-connector` — XLR-Buchse (SVG + Gradient)
- `.seg-display` — 7-Segment-Container
- `.retro-lamp` + `.on` — leuchtende Eingangslampe
- `.connector-section` — Input/Output-Gruppe mit Label
- `.eth-panel` — CORES-Sidebar (linkes Panel)

---

## Konventionen

- **Kein Framework**, kein npm, keine Build-Tools außer `build.py`
- **UI-Sprache:** Deutsch (Labels, Toasts, Modals)
- **Code-Sprache:** Englisch (Variablen, Funktionen, Kommentare)
- **HTML-Escaping:** immer `escHtml()` aus `state.js` für User-Eingaben verwenden
- **UUIDs:** immer `generateUUID()` aus `state.js`
- **Änderungen tracken:** `markModified()` nach jeder State-Mutation aufrufen
- **Skin-System:** entfernt in v0.9.4.1 — nicht wiederbeleben ohne Absprache
- **Versionsnummer:** `APP_VERSION` in `js/state.js` — **vor** jeder Implementierung inkrementieren

---

## Roadmap (aus README)

**Kurzfristig:**
- Editierbare ETH-Datenbank
- Konflikt-Erkennung (doppelte Universen/Ports)
- Farbcodierung nach ETH-Gruppe oder Universe

**Mittelfristig:**
- Signal-Flow-Diagramm
- Direkter PDF-Download

**Langfristig:**
- ArtNet/sACN-Mapping
- Live-Import aus grandMA/EOS
- Hardware-Verbindung via Web Serial API

---

## Deployment

GitHub Actions (`.github/workflows/pages.yml`) deployed automatisch auf Push zu `main`:
https://m4dm0nky.github.io/Boosterpatch/
