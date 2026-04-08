# BOOSTERPATCH

> Patch-Management für DMX Booster — für Touring-Produktionen im Bühnenlicht.

---

## ▶ [JETZT STARTEN](https://m4dm0nky.github.io/Boosterpatch/boosterpatch.html)

---

## Was ist Boosterpatch?

**Boosterpatch** ist ein browserbasiertes Werkzeug zur visuellen Verwaltung von DMX Booster Patch-Konfigurationen. Es richtet sich an Lichttechniker auf Tour, die schnell und übersichtlich dokumentieren wollen, welche Geräte an welchem DMX-Universum und ETH-Kanal hängen.

Kein Server. Keine Installation. Kein Login. Einfach die HTML-Datei öffnen — fertig.

---

## Features

- **Visueller Booster-Patch (nebeneinander)**  
  Jeder Booster wird als stilisiertes 1U Rack-Gerät gezeichnet — mit XLR-Connectors, LED-Indikatoren und editierbaren Labels. Geräte werden horizontal nebeneinander dargestellt.

- **7-Segment-Displays (VFD/Nixie-Optik)**  
  Über jedem Connector leuchtet ein 6-stelliges Display im Röhren-Stil (warmes Amber auf Schwarz). Inputs zeigen das DMX-Universum, Outputs die zugewiesene ETH-Quelle.

- **ETH-Quellenliste mit Drag & Drop**  
  Links eine Liste aller ETH-Quellen. Per Drag & Drop auf einen Output ziehen = Verbindung herstellen. Rechtsklick = Verbindung trennen.

- **Geführter Projekt-Workflow**  
  Klick auf „Neues Projekt" → Projektname + Datum eingeben → Booster-Setup (Anzahl und Typ) → fertig. Projektname wird automatisch als Dateiname verwendet.

- **Booster-Typen frei konfigurierbar**  
  Pro Booster: Name, 1 oder 2 Inputs, 4 bis 12 Outputs. Jeder Booster in einem Projekt kann einen anderen Typ haben.

- **Tab-System: Patch-Ansicht & Details**  
  `PATCH-ANSICHT` zeigt die Booster grafisch. `DETAILS / TABELLE` zeigt alle Verbindungen in einer editierbaren Tabelle. Klick auf einen Connector springt direkt zur entsprechenden Zeile.

- **JSON-Projektdateien**  
  Projekte werden als `.json` gespeichert und geladen — inklusive ETH-Zuordnungen.

- **Drucken / Export**  
  Druck-optimiertes Layout für A4 — Sidebar und Steuerelemente werden ausgeblendet.

- **Logo-Slots**  
  Drei Logo-Plätze im Header für Produktionsfirma, Band/Produktion und Booking-Agentur.

---

## Bedienung

| Aktion | Wo |
|--------|-----|
| Neues Projekt erstellen | Startscreen → **Neues Projekt** oder Sidebar → **Projekt** |
| Booster anlegen (Batch) | Automatisch nach Projekt-Erstellung |
| Einzelnes Gerät hinzufügen | Sidebar → **Neu** |
| Gerät umbenennen | Doppelklick auf Gerätenamen im Rack |
| ETH-Quelle zuweisen | ETH-Eintrag links auf Output-Connector ziehen |
| ETH-Verbindung trennen | Rechtsklick auf Output-Connector |
| Connector-Details bearbeiten | Klick auf Connector → wechselt zu Details-Tab |
| LED-Status setzen | Details-Tab → Klick auf LED in der Tabelle |
| Projekt speichern | Sidebar → **Speichern** (lädt `[Projektname].json` herunter) |
| Projekt laden | Sidebar → **Öffnen** |
| Geräte aus anderem Projekt übernehmen | Sidebar → **Import** |
| Drucken | Sidebar → **Export** |
| Logos einfügen | Sidebar → **Logos** |

---

## Technischer Aufbau

```
boosterpatch.html     ← die gesamte Anwendung (HTML + CSS + JS)
```

- Vanilla JavaScript — kein Framework, kein Build-Tool
- Google Fonts: Bebas Neue · Barlow Condensed · Share Tech Mono
- Läuft komplett im Browser, offline nutzbar nach erstem Laden
- CSS-only 7-Segment-Displays (kein Canvas, kein SVG)

---

## Projektformat (JSON)

```json
{
  "appVersion": "v0.3.1",
  "projectName": "My Show 2026",
  "created": "2026-04-08T00:00:00.000Z",
  "modified": "2026-04-08T12:00:00.000Z",
  "devices": [
    {
      "id": "uuid",
      "name": "DMX Booster FOH",
      "inputs": 1,
      "outputs": 8,
      "connections": {
        "inputs": [
          { "id": 1, "universe": 1, "label": "FOH Console", "notes": "", "active": true }
        ],
        "outputs": [
          {
            "id": 1, "universe": 1, "startChannel": 1,
            "label": "Moving Heads", "notes": "", "active": true,
            "ethId": "eth_a_1"
          }
        ]
      }
    }
  ],
  "logos": { "planer": "", "band": "", "booking": "" }
}
```

### ETH-Datenbank (Dummy-Daten)

Standardmäßig sind 16 ETH-Quellen angelegt:

| Gruppe | Ports |
|--------|-------|
| ETH A  | /1 /2 /3 /4 |
| ETH B  | /1 /2 /3 /4 |
| ETH C  | /1 /2 /3 /4 |
| ETH US | /1 /2 /3 /4 |

---

## Wohin die Reise gehen könnte

### Kurzfristig
- **ETH-Datenbank editierbar** — eigene ETH-Quellen anlegen und benennen
- **Konflikt-Erkennung** — Warnung bei doppelt belegten Universes oder ETH-Ports
- **Farbcodierung** — Outputs nach ETH-Gruppe oder Universe einfärben
- **RDM-Geräteverwaltung** — Hersteller, Modell, UID am Output hinterlegen

### Mittelfristig
- **Multi-Rack-Ansicht** — Dimmer, Netzwerk und Booster in einem Plan
- **Signal-Flow-Diagramm** — Linie von ETH-Quelle durch Booster zu den Geräten
- **PDF-Export** — strukturiertes Patch-Dokument für den technischen Rider
- **Versions-History** — Änderungsprotokoll pro Projekt

### Langfristig
- **ArtNet / sACN Mapping** — Netzwerk-DMX Universes direkt einbinden
- **Live-Import aus grandMA / EOS** — Patch aus der Konsole einlesen
- **Netzwerk-Sync** — Projekt in Echtzeit im Team teilen
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
