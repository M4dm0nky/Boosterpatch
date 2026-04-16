# Changelog — BOOSTERPATCH

---

## v0.9.4 — 2026-04-16

**Code-Cleanup — Tote Code & Leichen entfernt**

- `clearFileHandleFromIDB()` in `storage.js` entfernt — war definiert, wurde aber nirgendwo aufgerufen
- `state.logos` aus dem State-Objekt entfernt — redundant, da Storage bereits ein eigenes `logos`-Modul-Variable verwendet
- `setInterval` für File-Auto-Save speichert jetzt die Interval-ID (`_autoSaveInterval`) für saubere Handhabung
- CSS-Leichen aus `layout.css` entfernt: `.sb-device-item`, `.sb-device-item:hover`, `.sb-device-name`, `.sb-device-badge` (Reste einer älteren Sidebar-Implementierung)
- CSS-Leiche aus `misc.css` entfernt: `.fix-count-badge` (war nie in Verwendung)
- Build: 5074 Zeilen (−56 gegenüber v0.9.3)

---

## v0.9.3 — 2026-04-16

**Swisson Hardware-Skin entfernt — Swisson auf Standard-Rendering zurückgesetzt**

- `buildSwissonHardwareSkin()` aus `device-render.js` entfernt
- `buildSwissonInputPanel()` aus `device-render.js` entfernt (war definiert aber nicht final integriert)
- Swisson nutzt wieder Standard-XLR-Rendering wie alle anderen Skins
- `.skin-logo-swisson` in `rack.css` wiederhergestellt: weißer Schriftzug sichtbar (war auf `display:none` gesetzt)
- `.skin-swisson .rack-connectors` in `rack.css` wiederhergestellt: bordeaux Hintergrund (`#5c0a08`) mit Gradient
- Alle `swisson-hw-*` CSS-Klassen aus `rack.css` entfernt (~130 Zeilen)
- `skin Feature.md` erstellt: vollständige Dokumentation aller Ansätze und Ursachen des Scheiterns

---

## v0.9.2.2–v0.9.2.6 — 2026-04-15/16

**Swisson Hardware-Skin (abgebrochen)**

Versuchte visuelle Annäherung an die echte Swisson XSP-5R-5R Hardware:
- `buildSwissonHardwareSkin()`: Flex-Row mit linkem Display-Modul (Encoder + A/B-Anzeige) und rechtem rotem Panel-Balken
- `buildSwissonInputPanel()`: Kompaktes Display-Panel mit Retro-Lampen, Buchstaben-Labels, Seg-Displays statt XLR-Körpern
- Diverse CSS-Ansätze für den roten Panel-Balken (absolute, flex-center, min-height) — alle gescheitert wegen Farbverschmelzung mit dunklem Hintergrund

Entscheidung: Feature abgebrochen, in `skin Feature.md` dokumentiert, Code in v0.9.3 entfernt.

---

## v0.9.2.2 — 2026-04-15

**Swisson XSP Skin — Basis-Optik**

- Bordeaux/Crimson Connector-Panel: `.rack-connectors` erhält den charakteristischen dunkelroten Hintergrund (`#5c0a08`)
- Chrome XLR-Körper: Output-Buchsen silber-chrome, Input-Buchsen blau-getönt
- Blaue Power-LED im rechten Rack-Ear (`.swisson-power-led`)
- Labels in warmem Off-White für bessere Lesbarkeit auf rotem Hintergrund
- Roter Border um das gesamte `rack-unit` (`3px solid #C82C10`)

---

## v0.8.3 — 2026-04-11

**Multi-Plan-System, Fixture-Datenbank, 11-Segment-Display, SCHEMATISCH-Tab**

### Multi-Plan-System (`storage.js`)
- Sidebar: „PLÄNE"-Liste mit allen gespeicherten Plänen, aktiver Plan hervorgehoben
- Aktiver Plan wird beim Start automatisch geladen (neuester nach `modified`-Datum)
- Plan-Items: Klick = laden, ✎ = umbenennen, ✕ = löschen
- Speicherung: `bp-plans-index` (Index) + `bp-plan-{uuid}` (Daten) in localStorage

### Fixture-Datenbank (`fixtures.js`)
- Import: TSV-Datei parsen, Spalten `Fixture`, `Typ`, `Line`
- Daten in `state.fixtureDatabase`, im JSON-Save enthalten
- FIXTURES-Tab: 3. Tab — Ansicht nach Linien mit allen Fixture-IDs als Chips
- „ID's"-Button unter Output-Connector: Fixture-Popover mit allen Fixtures der zugewiesenen Line

### CORES-Panel
- Linkes Panel mit ETH-Quellen (draggable auf Outputs) und Line-Sektion (nach Fixture-Import)
- Line-Einträge draggable auf Outputs — setzt `conn.label` auf den Line-Namen

### 11-Segment-Display (`device-render.js`)
- 7 Standard-Segmente (a–g) + 4 Halb-Diagonalen (ul/ur/ll/lr)
- Outputs: 2 gestapelte Displays (`.seg-display-stack`): oben Text vor Leerzeichen, unten Rest
- SEG_MAP: A–Z, 0–9, Sonderzeichen (`/`, `\`, `K`, `Z`, `X`, …)

### SCHEMATISCH-Tab (`patch.js` → `renderSchematicTable()`)
- Aufbau: BOOSTER | IN 1 | IN 2 | PORT 1 … PORT N
- IN-Spalten zeigen Universe (blau), Port-Zellen zeigen Output-Label
- Sticky BOOSTER-Spalte und Header, druckoptimiert (A4, schwarz auf weiß)

### Universe-Eingabe per Popover
- Klick auf Input-Seg-Display → Vintage-Popover: `U`-Prefix + Drehrädchen + OK
- Tastatur: Enter/Escape/↑↓ — Klick außerhalb bestätigt automatisch

---

## v0.6.0 — 2026-04-09

**Refactoring — Build-System mit Multi-File Quellstruktur**

- Quellcode aufgeteilt: `src/template.html`, `css/*.css`, `js/*.js`
- `build.py` assembliert alle Teile zu einer vollständigen Single-File `boosterpatch.html`
- CSS-Module: `variables.css`, `layout.css`, `rack.css`, `patch-table.css`, `modal.css`, `misc.css`
- JS-Module: `state.js`, `ui.js`, `device-render.js`, `device-crud.js`, `patch.js`, `storage.js`, `main.js`
- `fixtures.js` später ergänzt (v0.8.x)
- Keine funktionalen Änderungen — reine Strukturumstellung für bessere Wartbarkeit

---

## v0.5.x — 2026-04-08/09

**Retro-Lamp-System, Routing-Buttons, LED-Sync-Logik**

- `.retro-lamp` — CSS-Lampen (orange IN1, blau IN2) mit Pulsier-Animation
- `applyLampOn(el)` / `removeLampOn(el)` — JS-Helpers mit `animationDelay` für Sync
- Routing-Buttons auf Outputs: Umschalten zwischen Input A/B (`.lamp-btn-housing`)
- Output-LED-Logik: leuchtet nur wenn ETH verbunden UND gerouteter Input hat Universum
- `syncConnLed()`, `syncRoutingBtnsForInput()`, `syncOutputLedsForInput()` — vollständiges LED-Sync-System
- `xlr-led` als Sonderfall: nutzt `.active` statt `.on`

---

## v0.3.1 — 2026-04-08

**7-Segment Display — VFD/Nixie Röhren-Optik**

- Display-Farbe auf warmes Amber `#ffb200` angepasst
- 3-lagiger Bloom-Glow-Effekt (3px / 7px / 14px Radius)
- Segmente dicker (3px), mit abgerundeten Enden, Digit-Größe erhöht (13×23px)
- Inaktive Segmente nahezu unsichtbar (`rgba(35,12,0,0.22)`)
- Subtile Glas-Reflexion im Display-Container via `::before`

---

## v0.3.0 — 2026-04-08

**Major Feature Update — Projekt-Workflow, Booster-Setup, ETH-Quellen, Displays, Tabs**

### Neues-Projekt-Popup
- Klick auf „Neues Projekt" → Modal statt `confirm()` — Pflichtfeld Name + optionales Datum
- Projektname wird Dateiname beim Speichern (`.json`)
- Direkt nach Bestätigung öffnet automatisch der Booster-Setup-Dialog

### Booster-Setup-Modal (2-stufig)
- Schritt 1: Anzahl Booster (1–16)
- Schritt 2: Konfigurationstabelle — Name, Inputs (1/2), Outputs (4–12) pro Booster

### Horizontales Layout
- Booster stehen nebeneinander (scroll nach rechts)
- Alle Geräte gleich breit (orientiert am Gerät mit den meisten Outputs)

### 7-Segment-Displays über Connectors
- 6-stelliges Display über jedem XLR-Connector, CSS-only
- Input: `U 1` bis `U 999`; Output: ETH-Bezeichnung oder `------`

### ETH-Quellenliste
- 16 Dummy-ETHs: ETH A/B/C/US je /1–/4
- Drag & Drop auf Output-Connector; Rechtsklick = trennen

### Tab-System
- `PATCH-ANSICHT` + `DETAILS / TABELLE`
- Connector anklicken → springt zu Details-Tab, markiert Zeile kurz gelb

---

## v0.2.0 — 2026-04-07

**Design-Redesign — Stage/Touring-Ästhetik**

- Farbpalette: Dunkelblau-Basis, Gold-Accent `#e8c84a`
- Bebas Neue als Header-Font, Barlow Condensed als UI-Font, Share Tech Mono für Displays
- Überarbeitete Rack-Optik: neue Ear-Screws, Face-Gradient, LED-Glow
- Verbesserte Patch-Tabelle mit Hover-Highlights
- Projektname via Doppelklick editierbar
- `UNGESPEICHERT`-Indikator (rot, sichtbar bei Änderungen)

---

## v0.1.2 — 2026-04-07

**UI-Anpassungen & Startscreen**

- Startscreen überarbeitet, Header-Layout verbessert

---

## v0.1.0 — 2026-04-07

**Initial Release**

- Visueller DMX Booster als 1U Rack-Gerät (CSS-gezeichnet)
- Neues Gerät: Popup mit Name, 1–2 Eingänge, 4–12 Ausgänge
- XLR 5-Pin Connectors mit LED-Indikator, editierbaren Labels, Universe und DMX-Startkanal
- Globale Patch-Tabelle — alle Verbindungen aller Geräte, inline editierbar
- Gerät duplizieren, löschen, umbenennen
- Projekt speichern / laden als `.json`
- Geräte aus anderem Projekt importieren (Merge)
- 3 Logo-Slots im Header
- Print / Export Funktion
- Dark Theme — Stage/Touring-Ästhetik
- Single-File HTML — kein Server, kein Build-Tool
