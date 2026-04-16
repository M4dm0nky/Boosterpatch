# Swisson Hardware Skin — Dokumentation abgebrochenes Feature

**Status:** Abgebrochen in v0.9.2.x  
**Entfernt in:** v0.9.3  
**Referenz-Commit:** Letzte Version mit Hardware-Skin-Code (vor v0.9.3)

---

## Ziel

Den Swisson XSP-5R-5R DMX-Splitter visuell so darstellen, dass er dem echten Gerät ähnelt:
- Schmales Frontpanel (~1,5 HE / ~66mm hoch)
- Dunkles Gehäuse (Fast-Schwarz, #111114)
- **Schmaler roter Panel-Balken** (Swisson-Rot #C82C10) quer über die Gerätefläche
- Linkes Display-Modul mit Drehencoder und A/B-Eingabe-Anzeige (7-Segment)
- Rechts: Ausgangsbuchsen auf rotem Panel

---

## Ansätze (alle gescheitert)

### Ansatz 1 — Absolute Stripe über `.rack-connectors`
- `.swisson-hw-skin` als `position: absolute` über `.rack-connectors` gelegt
- Problem: Panel füllte die gesamte Höhe (durch `align-items: stretch` des Flex-Parents)
- Dunkle Streifen oben/unten waren **nicht sichtbar** weil `.rack-face` Hintergrund (#111114) und `.swisson-hw-left` Hintergrund (#0d0d11) nahezu identisch waren (Delta: ~3 RGB-Werte)

### Ansatz 2 — Flex-Row mit `justify-content: center`
- `.swisson-hw-right { display: flex; flex-direction: column; justify-content: center; }`
- `.swisson-hw-panel { height: 54px; flex-shrink: 0; }`
- Problem: Panel lag optisch in der Mitte, aber dunkle Randbereiche (`.swisson-hw-right` Background #111114) verschmolzen mit `.rack-face` Background #111114 — **identisch, nicht sichtbar**

### Ansatz 3 — `min-height: 120px` auf `.swisson-hw-skin`
- Sollte dem Panel-Wrapper mehr Raum geben damit die dunklen Randstreifen breit genug sind
- Problem: Inhalts-Höhe (`.swisson-hw-left` mit Encoder + A/B Labels ≈ 58px) war fast so hoch wie der rote Panel (54px) → kaum Platz für Randstreifen
- Selbst mit `min-height: 120px`: Gradient von `.swisson-hw-panel` (`#b82412 → #9a1a0a → #7a1208`) fiel an den Kanten zu nahezu Schwarz ab → verschmolz mit Hintergrund

### Ansatz 4 — Panel-Gradient heller, härtere Kanten
- `border-top: 2px solid #e83018` und `border-bottom: 2px solid #500a04`
- `box-shadow: inset 0 1px 0 rgba(255,100,60,0.2)`
- Ergebnis: Minimal sichtbarer roter Rand, aber insgesamt: **"sieht seit 3 Versionen gleich aus"** (User)

---

## Warum wurde es abgebrochen

Das Kernproblem: Das Rack-Layout (`rack-unit > rack-ear + rack-face + rack-ear`) ist für eine feste Proportionen ausgelegt. Der rote Balken-Effekt (schmaler horizontaler Streifen auf dunklem Grund) funktioniert nicht, wenn:
1. Der dunkle Hintergrund des Skin-Wrappers und die `rack-face` identische Farbtöne haben
2. Der Panel-Gradient an den Kanten zu dunkel wird (Bordeaux → Fast-Schwarz)
3. Das reale Gerät (~66mm hoch) auf einer viel größeren Rack-Unit-Karte dargestellt wird

Ohne tiefe Überarbeitung des Rack-Layout-Systems ist ein überzeugender Hardware-Look **nicht realisierbar** im aktuellen Ansatz.

---

## Entfernter Code

### `js/device-render.js` — entfernte Funktionen

**`buildSwissonHardwareSkin(device)`:**
- Erzeugte `.swisson-hw-skin` (Flex-Row)
- Links: `.swisson-hw-left` mit `.swisson-hw-encoder` (Drehregler-CSS) + `.swisson-hw-ab` (A/B Anzeige mit Dots + Labels)
- Rechts: `.swisson-hw-right` mit `.swisson-hw-panel` (roter Balken)

**`buildSwissonInputPanel(device)`:**
- Alternativer Ansatz: Kompaktes Panel statt XLR-Körper für Eingänge
- `.swisson-input-panel` mit Logo-Bar + Reihen pro Input (Lampe + Buchstabe + Seg-Display + Label)
- War definiert aber nicht final integriert (ersetzt durch `buildSwissonHardwareSkin`)

**In `buildDeviceCard()`:**
```js
// Entfernter Branch:
if (device.skin === 'swisson') {
  connArea.appendChild(buildSwissonHardwareSkin(device));
} else {
  // Standard-Rendering
}

// Entfernter Power-LED-Branch war erhalten geblieben:
if (device.skin === 'swisson') {
  const rightEar = rackUnit.querySelector('.rack-ear.right');
  const powerLed = document.createElement('div');
  powerLed.className = 'swisson-power-led';
  rightEar.appendChild(powerLed);
}
```

### `css/rack.css` — entfernte Klassen

```css
/* Alle swisson-hw-* Klassen: */
.swisson-hw-skin { ... }
.swisson-hw-left { ... }
.swisson-hw-encoder { ... }
.swisson-hw-encoder::after { ... }
.swisson-hw-ab { ... }
.swisson-hw-brand { ... }
.swisson-hw-ab-row { ... }
.swisson-hw-ab-dot { ... }
.swisson-hw-ab-dot.a-dot { ... }
.swisson-hw-ab-dot.b-dot { ... }
.swisson-hw-ab-letter { ... }
.swisson-hw-ab-val { ... }
.swisson-hw-right { ... }
.swisson-hw-panel { ... }

/* Außerdem rückgesetzt: */
/* .skin-logo-swisson war auf display:none → wieder sichtbar */
/* .skin-swisson .rack-connectors war transparent → wieder bordeaux */
```

---

## Wiederhergestellter Zustand (v0.9.3)

Swisson nutzt das Standard-XLR-Rendering wie alle anderen Skins:
- Bordeaux-Hintergrund im Connector-Bereich (`#5c0a08`)
- Weißer `SWISSON`-Schriftzug im Topbar
- Roter Border um das gesamte `rack-unit` (`border: 3px solid #C82C10`)
- Blaue Power-LED im rechten Rack-Ear (`.swisson-power-led`) — erhalten
- Silberne (Output) und blau-getönte (Input) XLR-Körper — erhalten

---

## Möglicher zukünftiger Ansatz

Falls der Hardware-Skin erneut angegangen wird, wären folgende Voraussetzungen nötig:
1. **Eigene Rack-Unit-Höhe** für Swisson (weniger HE / echte Proportionen)
2. **Separater Layer-Ansatz**: Hardware-Skin als echter `z-index`-Layer über der Karte, nicht innerhalb des Flex-Layouts
3. **Deutlich höherer Farbkontrast**: Hintergrund der dunklen Bereiche müsste wirklich schwarz sein (z.B. `#000000`) während `rack-face` grau bleibt — sonst verschmelzen die Flächen
4. **Referenzmaße**: XSP-5R-5R ist 1 HE (44mm) hoch, 482mm breit. Panel-Sektion links ca. 80mm, Encoder-Knopf ~22mm Durchmesser.
