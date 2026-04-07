# BOOSTERPATCH

> Patch-Management für DMX Booster — für Touring-Produktionen im Bühnenlicht.

---

## ▶ [JETZT STARTEN](https://m4dm0nky.github.io/Boosterpatch/boosterpatch.html)

---

## Was ist Boosterpatch?

**Boosterpatch** ist ein browserbasiertes Werkzeug zur visuellen Verwaltung von DMX Booster Patch-Konfigurationen. Es richtet sich an Lichttechniker auf Tour, die schnell und übersichtlich dokumentieren wollen, welche Geräte an welchem DMX-Universum und Kanal hängen.

Kein Server. Keine Installation. Kein Login. Einfach die HTML-Datei öffnen — fertig.

---

## Features

- **Visuelle DMX Booster Darstellung**  
  Jeder Booster wird als stilisiertes 1U Rack-Gerät gezeichnet — mit XLR-Connectors, LED-Indikatoren und editierbaren Labels direkt auf dem Gerät.

- **Flexibles Geräte-Setup**  
  Beim Anlegen eines neuen Geräts wählst du: 1 oder 2 Eingänge, 4 bis 12 Ausgänge. Das Gerät wird entsprechend aufgebaut.

- **Globale Patch-Tabelle**  
  Alle Verbindungen aller Booster in einer Übersichtstabelle — Universe, DMX-Startkanal, Label, Notizen, alles inline editierbar.

- **JSON-Projektdateien**  
  Projekte werden als `.json` gespeichert und geladen. Einfach, portabel, lesbar.

- **Drucken / Export**  
  Druck-optimiertes Layout für A4 — Sidebar und Steuerelemente werden ausgeblendet.

- **Logo-Slots**  
  Drei Logo-Plätze im Header für Veranstalter, Agentur und Technikfirma — per Klick belegbar.

---

## Bedienung

| Aktion | Wo |
|--------|-----|
| Neues Gerät anlegen | Sidebar → **Neu** |
| Gerät umbenennen | Doppelklick auf den Gerätenamen im Rack |
| Connector bearbeiten | Klick auf einen XLR-Connector |
| LED-Status setzen | Im Connector-Panel → **AKTIV / INAKTIV** |
| Projekt speichern | Sidebar → **Speichern** (lädt `.json` herunter) |
| Projekt laden | Sidebar → **Öffnen** |
| Geräte aus anderem Projekt übernehmen | Sidebar → **Import** |
| Drucken | Sidebar → **Export** |
| Logos einfügen | Klick auf Logo-Slot im Header |

---

## Technischer Aufbau

```
boosterpatch.html     ← die gesamte Anwendung (HTML + CSS + JS)
```

- Vanilla JavaScript — kein Framework, kein Build-Tool
- Google Fonts: Bebas Neue · Barlow Condensed · Share Tech Mono
- Läuft komplett im Browser, offline nutzbar nach erstem Laden

---

## Projektformat (JSON)

```json
{
  "appVersion": "1.0",
  "projectName": "My Show 2026",
  "created": "2026-04-07T00:00:00.000Z",
  "modified": "2026-04-07T12:00:00.000Z",
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
          { "id": 1, "universe": 1, "startChannel": 1, "label": "Moving Heads", "notes": "", "active": true },
          { "id": 2, "universe": 2, "startChannel": 1, "label": "LED Bars", "notes": "", "active": true }
        ]
      }
    }
  ]
}
```

---

## Wohin die Reise gehen könnte

Boosterpatch ist als einfaches, stabiles Werkzeug gestartet — aber das Potential geht weit darüber hinaus:

### Kurzfristig
- **RDM-Geräteverwaltung** — Gerätedaten wie Hersteller, Modell, UID direkt am Output hinterlegen
- **Konflikt-Erkennung** — automatische Warnung bei doppelt belegten Universes oder Kanaläberschneidungen
- **Farbcodierung** — Outputs nach Universe oder Gerätetyp einfärben
- **Drag & Drop** — Outputs zwischen Boostern verschieben oder neu sortieren
- **Geräte-Bibliothek** — häufig verwendete Booster-Konfigurationen als Vorlagen speichern

### Mittelfristig
- **Multi-Rack-Ansicht** — gesamte Rackstruktur einer Produktion abbilden (Dimmer, Netzwerk, Booster in einem Plan)
- **Signal-Flow-Diagramm** — visuelle Linie vom Console-Output durch Booster zu den Geräten
- **Notizen-System** — geräteübergreifende Notizen und Warnhinweise für die Crew
- **Versions-History** — Änderungsprotokoll pro Projekt (wer hat was wann geändert)
- **PDF-Export** — strukturiertes Patch-Dokument für den technischen Rider

### Langfristig
- **ArtNet / sACN Mapping** — Netzwerk-DMX Universes direkt in den Patch einbinden
- **Live-Import aus grandMA / EOS** — Patch aus der Konsole einlesen und automatisch abgleichen
- **Netzwerk-Sync** — Projekt in Echtzeit im Team teilen (z.B. über WebRTC oder lokales Netzwerk)
- **Hardware-Anbindung** — Verbindung zu echten Boostern über Web Serial oder USB für direktes Readout
- **Mobile-App** — React Native oder PWA für die Nutzung auf dem Tablet in der Show

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
