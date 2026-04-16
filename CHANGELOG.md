# Changelog — BOOSTERPATCH

---

## v0.9.4.8 — 2026-04-17

**Drucken — Tabellenkopf schwarz auf weiß**

- `th` Farbe auf `#000` + weißer Hintergrund — Browser drucken Hintergrundfarben standardmäßig nicht, weißer Text auf dunklem Hintergrund wurde unsichtbar
- `border-bottom: 2px solid #000` als klare Trennung zwischen Kopf und Body
- `.th-in` Spalten: dezentes Hellgrau (`#f0f0f0`) für Abgrenzung

---

## v0.9.4.7 — 2026-04-17

**Drucken — Tabellenkopf kräftiger**

- `font-weight: 900`, `font-size: 9pt`, `letter-spacing: .03em` (war `.07em`)
- `text-shadow` für Kontrast auf dunklem Hintergrund

---

## v0.9.4.6 — 2026-04-17

**Drucken — Logos, zentrierter Header, Border-Fix**

- Header auf 3-Spalten-Grid (wie Personalplan): Planer-Logo links, BOOSTERPATCH + Band-Logo mittig, Datum + Booking-Logo rechts
- Alle `td` bekommen `border: 1px solid #ccd` — leere und n/a-Zellen hatten zuvor keine Borders (sah kaputt aus)
- Alle Schriftgrößen und Abstände einen Hauch größer
- `font-weight: 900` auf Spaltenköpfen

---

## v0.9.4.5 — 2026-04-17

**Drucken — Komplett neu gestaltet**

- Button umbenannt: „Export" → „Drucken"
- `exportPrint()` baut jetzt ein vollständiges HTML-Dokument und öffnet es in einem neuen Fenster (statt `window.print()` direkt) — löst Pixeligkeit und Layout-Probleme
- Layout: Header mit Projektname/Datum/Version, Tabelle BOOSTER | IN 1 [| IN 2] | OUT 1…N
- IN 2-Spalte nur wenn mind. ein Booster 2 Inputs hat
- Farben: aktive Outputs grün, belegte Inputs blau — B/W-tauglich durch bold/normal-Kontrast
- `@page { size: A4 landscape; margin: 10mm; }` — alle Spalten passen aufs Blatt
- Altes `@media print` aus `misc.css` entfernt

---

## v0.9.4.4 — 2026-04-17

**Route-Lämpchen bei 1-Input-Boostern ausgeblendet**

- Output-Routing-Buttons (IN1/IN2-Lämpchen) werden nur noch gerendert wenn `device.inputs > 1`
- Bei Boostern mit nur einem Input haben die Buttons keine Funktion und werden nicht mehr angezeigt

---

## v0.9.4.3 — 2026-04-17

**Scroll-Position bleibt beim Drag & Drop erhalten**

- `connectLineToOutput()` in `fixtures.js` rief `renderAllDevices()` auf → gesamter Container wurde neu gebaut → Scroll-Position verloren
- Fix: `renderAllDevices()` → `updateConnDisplay(deviceId, 'output', conn)` (identisches Muster wie `connectEthToOutput()` in `patch.js`)

---

## v0.9.4.2 — 2026-04-17

**Display-Split-Bugfix: Label ohne Leerzeichen mit Schrägstrich**

- `getConnDisplayParts()` in `device-render.js`: bei fehlendem Leerzeichen aber vorhandenem `/` wird jetzt am Zeichen **vor** dem Schrägstrich gesplittet
- Beispiel: `LKC/1` → Zeile 1: `LK`, Zeile 2: `C/1` (statt alles in Zeile 1)

---

## v0.9.4.1 — 2026-04-16

**Skin-Feature vollständig entfernt**

- `SKIN_CATALOG` aus `state.js` entfernt
- `selectSkin()`, `applySkinModel()`, `findCatalogModel()`, `allCatalogModelIds()`, `bsSkinChanged()` aus `device-crud.js` entfernt
- Skin-Rendering (CSS-Klassen, Logos, Power-LED) aus `device-render.js` entfernt
- Skin-Picker-Block aus `src/template.html` entfernt
- Gerät-Spalte (Swisson/Netron/Major-Dropdown) aus Booster-Setup-Wizard entfernt
- `createDevice()` ohne `skin`/`skinModel`/`connectorType`
- `.skin-swisson`, `.skin-obsidian`, `.skin-major` CSS-Blöcke aus `rack.css` entfernt
- `.skin-picker`, `.skin-tile`, `.bs-skin-select` aus `modal.css` entfernt
- `skin Feature.md` gelöscht

---

## v0.9.4 — 2026-04-16

**Code-Cleanup — Toter Code & Leichen entfernt**

- `clearFileHandleFromIDB()` in `storage.js` entfernt — war definiert, wurde aber nirgendwo aufgerufen
- `state.logos` aus dem State-Objekt entfernt — redundant, da Storage bereits ein eigenes `logos`-Modul-Variable verwendet
- `setInterval` für File-Auto-Save speichert jetzt die Interval-ID (`_autoSaveInterval`) für saubere Handhabung
- CSS-Leichen aus `layout.css` entfernt: `.sb-device-item`, `.sb-device-item:hover`, `.sb-device-name`, `.sb-device-badge`
- CSS-Leiche aus `misc.css` entfernt: `.fix-count-badge`

---

## v0.9.3 — 2026-04-16

**Swisson Hardware-Skin entfernt — Swisson auf Standard-Rendering zurückgesetzt**

- `buildSwissonHardwareSkin()` und `buildSwissonInputPanel()` aus `device-render.js` entfernt
- Alle `swisson-hw-*` CSS-Klassen aus `rack.css` entfernt (~130 Zeilen)
- `.skin-logo-swisson` wiederhergestellt, `.skin-swisson .rack-connectors` bordeaux-Hintergrund wiederhergestellt

---

## v0.9.2.2–v0.9.2.6 — 2026-04-15/16

**Swisson Hardware-Skin (abgebrochen)**

Versuchte visuelle Annäherung an die echte Swisson XSP-5R-5R Hardware — alle Ansätze scheiterten an Farbverschmelzung mit dem dunklen Hintergrund. Feature eingestellt.

---

## v0.8.3 — 2026-04-11

**Multi-Plan-System, Fixture-Datenbank, 11-Segment-Display, SCHEMATISCH-Tab**

- Multi-Plan-System: Sidebar mit Plan-Liste, aktiver Plan wird beim Start geladen
- Fixture-Datenbank: TSV-Import, FIXTURES-Tab, Fixture-Popover unter Output-Connectors
- CORES-Panel: ETH-Quellen und Line-Einträge per Drag & Drop auf Outputs
- 11-Segment-Display: 7 Standard-Segmente + 4 Halb-Diagonalen, gestapelte Output-Displays
- SCHEMATISCH-Tab: kompakte Übersichtstabelle BOOSTER | IN 1 | IN 2 | PORT 1…N
- Universe-Eingabe per Popover (Klick auf Input-Display)

---

## v0.6.0 — 2026-04-09

**Refactoring — Build-System mit Multi-File Quellstruktur**

- Quellcode aufgeteilt: `src/template.html`, `css/*.css`, `js/*.js`
- `build.py` assembliert alle Teile zu einer vollständigen Single-File `boosterpatch.html`

---

## v0.5.x — 2026-04-08/09

**Retro-Lamp-System, Routing-Buttons, LED-Sync-Logik**

- `.retro-lamp` — CSS-Lampen (orange IN1, blau IN2) mit Pulsier-Animation
- Routing-Buttons auf Outputs: Umschalten zwischen Input A/B
- `syncConnLed()`, `syncRoutingBtnsForInput()`, `syncOutputLedsForInput()` — vollständiges LED-Sync-System

---

## v0.3.1 — 2026-04-08

**7-Segment Display — VFD/Nixie Röhren-Optik**

- Warmes Amber `#ffb200`, 3-lagiger Bloom-Glow, dickere Segmente (3px), abgerundete Enden

---

## v0.3.0 — 2026-04-08

**Major Feature Update — Projekt-Workflow, Booster-Setup, ETH-Quellen, Displays, Tabs**

- Neues-Projekt-Popup mit Pflichtfeld Name + Datum
- Booster-Setup-Modal (2-stufig): Anzahl → Konfigurationstabelle
- Horizontales Layout (Geräte nebeneinander, gleich breit)
- 7-Segment-Displays über Connectors
- ETH-Quellenliste mit Drag & Drop
- Tab-System: PATCH-ANSICHT + DETAILS / TABELLE

---

## v0.2.0 — 2026-04-07

**Design-Redesign — Stage/Touring-Ästhetik**

- Farbpalette: Dunkelblau-Basis, Gold-Accent, Bebas Neue, Barlow Condensed, Share Tech Mono
- Überarbeitete Rack-Optik, verbesserte Patch-Tabelle

---

## v0.1.0 — 2026-04-07

**Initial Release**

- Visueller DMX Booster als 1U Rack-Gerät
- Neues Gerät, XLR Connectors, Patch-Tabelle
- Projekt speichern / laden, Import, Logo-Slots
