# Swisson Hardware Skin — Dokumentation abgebrochenes Feature

**Status:** Abgebrochen in v0.9.2.x  
**Entfernt in:** v0.9.3 (visueller Skin) / v0.9.4.1 (Skin-System komplett)  
**Zweck dieser Datei:** Wissenserhalt für späteren Neuanlauf — nicht nochmal von vorne anfangen müssen

---

## Ursprüngliche Idee & Wert des Features

Das Skin-System hatte zwei Vorteile:

1. **Auto-Konfiguration:** Modell wählen (z.B. Swisson XSP-5R-5R) → Inputs/Outputs/Connector-Typ werden automatisch gesetzt. Kein manuelles Eintragen.
2. **Visuelle Erkennung:** Auf einen Blick sehen welche physische Hardware wo im Patch hängt — Swisson in Rot, NETRON in Teal, Major in Silber.

### Unterstützte Geräte (aus SKIN_CATALOG)

**Swisson XSP:**
- XSP-5R — 5-Pin XLR, 2 In / 5 Out
- XSP-3R — 3-Pin XLR, 2 In / 5 Out
- XSP-5R-5R — 5-Pin XLR, 2 In / 10 Out
- XSP-3R-3R — 3-Pin XLR, 2 In / 10 Out

**Obsidian NETRON:**
- RDM-6XL — 5-Pin XLR, 1 In / 6 Out
- RDM6-IP — 5-Pin XLR IP66, 1 In / 6 Out
- DMX-10-5 — 5-Pin XLR, 2 In / 10 Out
- DMX10-53 — 5+3-Pin XLR, 2 In / 10 Out

**Major:**
- DMX-Booster-12 — 5-Pin XLR, 1 In / 12 Out

---

## Warum wurde der visuelle Skin abgebrochen

### Das Kernproblem

Das Rack-Layout (`rack-unit > rack-ear + rack-face + rack-ear`) ist für feste Proportionen ausgelegt. Der angestrebte Swisson-Look (schmaler roter Panel-Balken auf dunklem Grund) funktioniert nicht, wenn:
1. Der dunkle Hintergrund des Skin-Wrappers und die `rack-face` nahezu identische Farbtöne haben (Delta: ~3 RGB-Werte)
2. Der Panel-Gradient an den Kanten zu dunkel wird (Bordeaux → Fast-Schwarz → verschmilzt)
3. Das reale Gerät (~66mm hoch) auf einer viel größeren Rack-Unit-Karte dargestellt wird

### Ansätze (alle gescheitert)

**Ansatz 1 — Absolute Stripe über `.rack-connectors`**
- `.swisson-hw-skin` als `position: absolute` über `.rack-connectors` gelegt
- Problem: Panel füllte die gesamte Höhe durch `align-items: stretch` des Flex-Parents
- Dunkle Streifen oben/unten waren nicht sichtbar — Hintergründe identisch

**Ansatz 2 — Flex-Row mit `justify-content: center`**
- `.swisson-hw-right { justify-content: center; }`, `.swisson-hw-panel { height: 54px; }`
- Problem: `.swisson-hw-right` Background `#111114` verschmolz mit `.rack-face` Background `#111114` — identisch

**Ansatz 3 — `min-height: 120px`**
- Sollte mehr Raum für sichtbare dunkle Randstreifen schaffen
- Inhalts-Höhe (≈58px) war fast so hoch wie roter Panel (54px) → kaum Platz
- Gradient fiel an Kanten zu nahezu Schwarz ab → verschmolz trotzdem

**Ansatz 4 — Hellerer Gradient, härtere Kanten**
- `border-top: 2px solid #e83018`, `border-bottom: 2px solid #500a04`
- `box-shadow: inset 0 1px 0 rgba(255,100,60,0.2)`
- Ergebnis: minimal sichtbar, aber: *"sieht seit 3 Versionen gleich aus"* (User-Feedback)

---

## Voraussetzungen für einen erfolgreichen Neuanlauf

1. **Eigene Rack-Unit-Höhe** für skin-spezifische Geräte (weniger HE / echte Proportionen) — das aktuelle Layout skaliert alle Geräte gleich
2. **Separater Layer-Ansatz**: Hardware-Skin als echter `z-index`-Layer über der Karte, nicht innerhalb des Flex-Layouts
3. **Deutlich höherer Farbkontrast**: Hintergrund der dunklen Bereiche wirklich schwarz (`#000000`) während `rack-face` grau bleibt — sonst verschmelzen die Flächen immer
4. **Referenzmaße**: XSP-5R-5R ist 1 HE (44mm) hoch, 482mm breit. Panel-Sektion links ca. 80mm, Encoder-Knopf ~22mm Durchmesser

---

## Was vom Skin-System gut funktioniert hat

- **SKIN_CATALOG** mit Modellen und Auto-Konfiguration (Inputs/Outputs/Connector) → sehr nützlich, sofort wiederverwendbar
- **Skin-Picker UI** im Modal (Tile-Auswahl) → gutes UX-Pattern
- **bsSkinChanged()** im Booster-Setup-Wizard → Auto-Fill von Name + Specs beim Modell-Wählen
- **CSS-Grundstruktur** für `.skin-swisson`, `.skin-obsidian`, `.skin-major` war solide — nur der Hardware-Look scheiterte

## Was beim Neuanlauf weggelassen werden kann

- Kein Hardware-Skin-Versuch für Swisson (zu komplex für aktuelles Layout)
- Stattdessen: dezente Farb-Akzente (Border, Topbar-Farbe) reichen für Erkennbarkeit
- Obsidian und Major hatten keine Layout-Probleme — nur Swisson war problematisch

---

## Entfernter Code (Referenz)

### `js/state.js` — SKIN_CATALOG
```js
const SKIN_CATALOG = [
  { id: 'standard', label: 'Standard', description: 'Generischer DMX Booster', models: null },
  { id: 'swisson', label: 'Swisson XSP', models: [
    { id: 'XSP-5R',    connector: '5-Pin XLR', inputs: 2, outputs: 5  },
    { id: 'XSP-3R',    connector: '3-Pin XLR', inputs: 2, outputs: 5  },
    { id: 'XSP-5R-5R', connector: '5-Pin XLR', inputs: 2, outputs: 10 },
    { id: 'XSP-3R-3R', connector: '3-Pin XLR', inputs: 2, outputs: 10 }
  ]},
  { id: 'obsidian', label: 'Obsidian NETRON', models: [
    { id: 'RDM-6XL',  connector: '5-Pin XLR',     inputs: 1, outputs: 6  },
    { id: 'RDM6-IP',  connector: '5-Pin XLR IP66', inputs: 1, outputs: 6  },
    { id: 'DMX-10-5', connector: '5-Pin XLR',      inputs: 2, outputs: 10 },
    { id: 'DMX10-53', connector: '5+3-Pin XLR',    inputs: 2, outputs: 10 }
  ]},
  { id: 'major', label: 'Major', models: [
    { id: 'DMX-Booster-12', connector: '5-Pin XLR', inputs: 1, outputs: 12 }
  ]}
];
```

### Entfernte Funktionen (`js/device-crud.js`)
- `findCatalogModel(modelId)` — findet Modell über alle Skins
- `allCatalogModelIds()` — alle Modell-IDs für Auto-Fill-Check
- `selectSkin(skinId)` — Tile-Auswahl + Modell-Dropdown befüllen
- `applySkinModel(modelId)` — Inputs/Outputs/Name aus Modell setzen
- `bsSkinChanged(i)` — Auto-Fill im Booster-Setup-Wizard

### Entfernte Device-Properties
```js
skin:          'standard' | 'swisson' | 'obsidian' | 'major'
skinModel:     'XSP-5R' | 'RDM-6XL' | ... | null
connectorType: '5-Pin XLR' | '3-Pin XLR' | ... | null
```
