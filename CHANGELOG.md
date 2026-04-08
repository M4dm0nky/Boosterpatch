# Changelog

## v0.3.1 — 2026-04-08

**7-Segment Display — VFD/Nixie Röhren-Optik**

- Display-Farbe auf warmes Amber `#ffb200` angepasst
- 3-lagiger Bloom-Glow-Effekt (3px / 7px / 14px Radius) nach Referenzbild
- Segmente dicker (3px), mit abgerundeten Enden
- Digit-Größe erhöht (13×23px)
- Inaktive Segmente nahezu unsichtbar (`rgba(35,12,0,0.22)`)
- Subtile Glas-Reflexion im Display-Container via `::before`

---

## v0.3.0 — 2026-04-08

**Major Feature Update — Projekt-Workflow, Booster-Setup, ETH-Quellen, Displays, Tabs**

### Neues-Projekt-Popup
- Klick auf „Neues Projekt" öffnet Modal statt `confirm()`
- Pflichtfeld Projektname + optionales Datum
- Projektname wird Dateiname beim Speichern (`.json`)
- Direkt nach Bestätigung öffnet automatisch der Booster-Setup-Dialog

### Booster-Setup-Modal (2-stufig)
- Schritt 1: Anzahl Booster (1–16)
- Schritt 2: Konfigurationstabelle — Name, Inputs (1/2), Outputs (4–12) pro Booster
- Jeder Booster kann einen anderen Typ erhalten

### Horizontales Layout
- Booster stehen nebeneinander (scroll nach rechts)
- Alle Geräte gleich breit (orientiert am Gerät mit den meisten Outputs)
- Geräte mit weniger Outputs: Connectors links, Platz rechts frei

### 7-Segment-Displays über Connectors
- 6-stelliges Display über jedem XLR-Connector
- Orangegelbe Segmente auf schwarzem Hintergrund, CSS-only
- Input zeigt: `U    1` bis `U  999` (Universum)
- Output zeigt: `A    1` / `US   2` wenn ETH verbunden, sonst `------`
- Display aktualisiert sich live beim Verbinden/Trennen

### ETH-Quellenliste (linkes Panel)
- 16 Dummy-ETHs: ETH A/1–4, ETH B/1–4, ETH C/1–4, ETH US/1–4
- Einträge sind per Drag & Drop auf Output-Connector ziehbar
- Rechtsklick auf Output = Verbindung trennen
- Datenstruktur vorbereitet für spätere vollständige Verknüpfungslogik

### Tab-System
- `PATCH-ANSICHT` — grafische Booster mit ETH-Panel
- `DETAILS / TABELLE` — Patchtabelle mit neuem ETH-Feld
- Connector anklicken → wechselt zu Details-Tab, markiert die Zeile kurz gelb

### Connector-Bearbeitung
- Inline-Edit-Panel unter Geräten entfernt
- Klick auf Connector navigiert zur Patchtabelle (Details-Tab)
- LED-Status jetzt direkt in der Tabelle umschaltbar (Klick auf LED)

### Sonstiges
- `state.ethDatabase` — persistiert in JSON-Projekten
- `conn.ethId` an Output-Verbindungen — ETH-Zuordnung wird gespeichert/geladen
- Neue Spalte „ETH" in der Patchtabelle

---

## v0.2.0 — 2026-04-07

**Design-Redesign — Materialliste-Optik**

- Komplett überarbeitetes Design-System nach Materialliste-Vorlage
- Neue Farbpalette: Dunkelblau-Basis, Gold-Accent `#e8c84a`
- Bebas Neue als Header-Font, Barlow Condensed als UI-Font
- Überarbeitete Rack-Optik: neue Ear-Screws, Face-Gradient, LED-Glow
- Verbesserte Patch-Tabelle mit hover-Highlights
- Projektname im Header via Doppelklick editierbar
- UNGESPEICHERT-Indikator (rot, sichtbar bei Änderungen)

---

## v0.1.2 — 2026-04-07

**UI-Anpassungen & Startscreen**

- Startscreen überarbeitet
- Header-Layout verbessert

---

## v0.1.0 — 2026-04-07

**Initial Release**

- Visueller DMX Booster als 1U Rack-Gerät (CSS-gezeichnet)
- Neues Gerät: Popup mit Name, 1–2 Eingänge, 4–12 Ausgänge
- XLR 5-Pin Connectors mit LED-Indikator, editierbaren Labels, Universe und DMX-Startkanal
- Connector Edit-Panel (inline, direkt unter dem Gerät)
- Globale Patch-Tabelle — alle Verbindungen aller Geräte, inline editierbar
- Gerät duplizieren, löschen und umbenennen
- Projekt speichern / laden als `.json`
- Geräte aus anderem Projekt importieren (merge)
- 3 Logo-Slots im Header
- Projektname editierbar
- Print / Export Funktion
- Dark Theme — Stage/Touring-Ästhetik
- Single-File HTML — kein Server, kein Build-Tool
