# BOOSTERPATCH

> Patch-Management für DMX Booster — für Touring-Produktionen im Bühnenlicht.

**Aktuelle Version: v0.9.4.8**

---

## ▶ [JETZT STARTEN](https://m4dm0nky.github.io/Boosterpatch/boosterpatch.html)

---

## Was ist Boosterpatch?

**Boosterpatch** ist ein browserbasiertes Werkzeug zur visuellen Verwaltung von DMX Booster Patch-Konfigurationen. Es richtet sich an Lichttechniker auf Tour, die schnell und übersichtlich dokumentieren wollen, welche Geräte an welchem DMX-Universum und ETH-Kanal hängen.

Kein Server. Keine Installation. Kein Login. Einfach die HTML-Datei öffnen — fertig.

---

## Features

- **Visueller Booster-Patch (nebeneinander)**  
  Jeder Booster wird als stilisiertes 1U Rack-Gerät gezeichnet — mit XLR-Connectors, Retro-Lampen und editierbaren Labels. Geräte werden horizontal nebeneinander dargestellt.

- **7-Segment-Displays (VFD/Nixie-Optik)**  
  Über jedem Connector leuchtet ein Display im Röhren-Stil (warmes Amber auf Schwarz, 11 Segmente inkl. Diagonalen). Inputs zeigen das DMX-Universum, Outputs die zugewiesene ETH-Quelle / Line-Bezeichnung.

- **CORES-Panel — ETH & Linien**  
  Linkes Panel mit ETH-Quellen und importierten Fixture-Linien. Per Drag & Drop auf Output-Connector ziehen. Rechtsklick = Verbindung trennen. Scroll-Position bleibt beim Droppen erhalten.

- **Fixture-Datenbank (TSV-Import)**  
  Fixture-Liste als TSV einlesen → Linien erscheinen im CORES-Panel und sind auf Outputs ziehbar. „ID's"-Button unter jedem Output zeigt alle Fixtures der zugewiesenen Line.

- **Multi-Plan-System**  
  Mehrere Projekte gleichzeitig in localStorage, per Sidebar wechselbar. Aktiver Plan wird beim Start automatisch geladen.

- **Geführter Projekt-Workflow**  
  Klick auf „Neues Projekt" → Name + Datum → Booster-Setup (Anzahl, Inputs, Outputs) → fertig.

- **Tab-System: 3 Ansichten**  
  - `PATCH-ANSICHT` — grafische Booster mit CORES-Panel  
  - `SCHEMATISCH` — kompakte Übersichtstabelle (BOOSTER | IN 1 | IN 2 | PORT 1 … N)  
  - `FIXTURES` — Fixture-Datenbank nach Linien

- **Speichern — 3 Wege**  
  - In aktuelle Datei (FileSystem Access API, direkt im Dateisystem)  
  - Neue Datei anlegen  
  - Herunterladen (Fallback)  
  - Auto-Save alle 2 Min in offene Datei + localStorage

- **Drucken**  
  Öffnet ein sauberes Druckdokument in einem neuen Fenster: Projektname, Logos, Datum und vollständige Patch-Tabelle. A4 Landscape, schwarz auf weiß — druckt auf jedem Drucker ohne Spezialeinstellungen.

- **Logo-Slots**  
  Drei Logo-Plätze für Produktionsfirma, Band/Produktion und Booking-Agentur — erscheinen im Header des Druckdokuments.

---

## Bedienung

| Aktion | Wo |
|--------|-----|
| Neues Projekt | Startscreen → **Neues Projekt** oder Sidebar |
| Booster anlegen (Batch) | Automatisch nach Projekt-Erstellung |
| Einzelnes Gerät hinzufügen | Sidebar → **⊕ Neuer Booster** |
| Gerät umbenennen | Doppelklick auf Gerätenamen im Rack |
| Universum eintragen | Klick auf Input-Display → Popover |
| Universum zurücksetzen | Rechtsklick auf Input-Connector |
| ETH/Line zuweisen | Eintrag aus CORES-Panel auf Output ziehen |
| ETH-Verbindung trennen | Rechtsklick auf Output-Connector |
| Fixtures der Line sehen | „ID's"-Button unter Output-Connector |
| Projekt speichern | Sidebar → **💾 Speichern** |
| Projekt laden | Sidebar → **📂 Öffnen** |
| Fixture-Datei importieren | Sidebar → FIXTURES → **Fixture-Datei laden** |
| Drucken | Sidebar → **🖨 Drucken** |
| Logos einfügen | Sidebar → **🖼 Logos** |

---

## Technischer Aufbau

```
Boosterpatch/
├── boosterpatch.html     ← Fertiges Single-File (NICHT direkt bearbeiten!)
├── build.py              ← python3 build.py → baut boosterpatch.html neu
├── CLAUDE.md             ← Projekt-Dokumentation für Claude Code (AI-Assistent)
├── skin Feature.md       ← Archiv: Dokumentation des abgebrochenen Skin-Features
├── src/
│   └── template.html     ← HTML-Skeleton
├── css/
│   ├── variables.css     ← CSS Custom Properties / Tokens
│   ├── layout.css        ← Grid, Header, Sidebar, Tabs, CORES-Panel
│   ├── rack.css          ← Device Card, XLR Connector, Retro Lamps
│   ├── patch-table.css   ← Patch-Tabelle + SCHEMATISCH-Tabelle
│   ├── modal.css         ← Modals, Booster-Setup
│   └── misc.css          ← 7-Segment (11-Seg), Toast, Popovers
└── js/
    ├── state.js          ← State-Objekt, APP_VERSION, Utilities
    ├── ui.js             ← Modal, Tab-Switching (3 Tabs)
    ├── device-render.js  ← buildDeviceCard, XLR, SEG_MAP, buildSegDisplay
    ├── device-crud.js    ← createDevice, deleteDevice, Booster-Setup-Wizard
    ├── patch.js          ← renderSchematicTable, CORES-Panel, Universe-Popover, LED-Sync
    ├── fixtures.js       ← Fixture-Import, Line-Zuweisung, Fixture-Popover
    ├── storage.js        ← FileSystem API, localStorage, Logos, Multi-Plan, Drucken
    └── main.js           ← Initialisierung
```

- Vanilla JavaScript — kein Framework, kein Build-Tool
- Google Fonts: Bebas Neue · Barlow Condensed · Share Tech Mono
- Läuft komplett im Browser, offline nutzbar nach erstem Laden
- CSS-only 7-Segment-Displays (kein Canvas, kein SVG)

---

## Projektformat (JSON)

```json
{
  "appVersion": "v0.9.4.8",
  "projectName": "My Show 2026",
  "created": "2026-04-08T00:00:00.000Z",
  "modified": "2026-04-17T12:00:00.000Z",
  "devices": [
    {
      "id": "uuid",
      "name": "DMX Booster FOH",
      "inputs": 2,
      "outputs": 8,
      "connections": {
        "inputs": [
          { "id": 1, "universe": 1, "label": "", "notes": "", "active": true },
          { "id": 2, "universe": 2, "label": "", "notes": "", "active": false }
        ],
        "outputs": [
          {
            "id": 1, "universe": 1, "startChannel": 1,
            "label": "LK C/1", "notes": "", "active": true,
            "ethId": "eth_a_1", "routeToInput": 1
          }
        ]
      }
    }
  ],
  "logos": { "planer": "", "band": "", "booking": "" },
  "fixtureDatabase": []
}
```

---

## Wohin die Reise gehen könnte

### Kurzfristig
- **ETH-Datenbank editierbar** — eigene ETH-Quellen anlegen und benennen
- **Konflikt-Erkennung** — Warnung bei doppelt belegten Universes oder ETH-Ports
- **Farbcodierung** — Outputs nach ETH-Gruppe oder Universe einfärben

### Mittelfristig
- **Signal-Flow-Diagramm** — Linie von ETH-Quelle durch Booster zu den Geräten
- **PDF-Download** — Patch-Dokument direkt als Datei speichern (ohne Browser-Druckdialog)

### Langfristig
- **ArtNet / sACN Mapping** — Netzwerk-DMX Universes direkt einbinden
- **Live-Import aus grandMA / EOS** — Patch aus der Konsole einlesen
- **Hardware-Anbindung** — Verbindung zu echten Boostern über Web Serial

---

## Verwandte Tools

| Tool | Beschreibung |
|------|-------------|
| [Materialliste-Licht](https://github.com/M4dm0nky/Materialliste-Licht) | Material- und Equipment-Management für Lichtproduktionen |
| [Personalplan](https://github.com/M4dm0nky/Personalplan) | Tour-Personalplanung für Konzerte und Events |

---

## Lizenz

MIT — frei verwendbar, frei veränderbar.

---

*Gebaut für die Bühne. Von einem, der dort steht.*
