# Glitch Preroll Panel

Ein dockbares ScriptUI-Panel für **Adobe After Effects 2026**, das aus einem
ausgewählten Layer automatisch einen kurzen Glitch-Vorlauf ("Preroll") erzeugt:
mehrere Duplikate vor dem eigentlichen In-Point, jedes mit einer animierten,
sprunghaft umherspringenden Maske.

Autor: Louis Reinecke

---

## Installation

Die Datei `GlitchPrerollPanel.jsx` in den ScriptUI-Panels-Ordner kopieren:

| OS      | Pfad |
|---------|------|
| macOS   | `/Applications/Adobe After Effects 2026/Scripts/ScriptUI Panels/` |
| Windows | `...\Adobe After Effects 2026\Support Files\Scripts\ScriptUI Panels\` |

Danach After Effects neu starten und das Panel über
**Fenster → GlitchPrerollPanel** öffnen.

> Damit das Skript Layer erzeugen darf, muss in den Voreinstellungen
> *Skripting & Ausdrücke* die Option **„Skripten erlauben, auf Dateien und
> Netzwerk zuzugreifen"** nicht zwingend aktiv sein – das Skript arbeitet nur
> im Projekt. Wird die Datei stattdessen per **Datei → Skripten → Skriptdatei
> ausführen** gestartet, öffnet sie sich als frei schwebende Palette.

---

## Benutzung

1. Eine Komposition öffnen.
2. **Genau einen** Layer auswählen.
3. Parameter im Panel einstellen.
4. **Create Glitch Preroll** klicken.

Alle Änderungen laufen in einer Undo-Gruppe („Glitch Preroll") – ein einzelnes
`Cmd/Ctrl+Z` macht den kompletten Vorgang rückgängig.

### Fehlermeldungen

| Meldung | Ursache |
|---------|---------|
| `Bitte eine Komposition oeffnen.` | Aktives Item ist keine Komposition |
| `Bitte genau EINEN Layer auswaehlen.` | Kein oder mehr als ein Layer selektiert |

---

## Parameter

### Layer Settings

| Regler | Bereich | Default | Bedeutung |
|--------|---------|---------|-----------|
| **Number of Layers** | 1 – 5 | 3 | Anzahl der erzeugten Glitch-Duplikate. Nicht genutzte Layer-Zeilen werden ausgegraut. |
| **Layer 1–5 Frames** | 1 – 60 f | 10, 7, 4, 6, 3 | Länge des jeweiligen Duplikats in Frames – es läuft von `inPoint − n Frames` bis zum ursprünglichen `inPoint`. |

### Mask Settings

| Regler | Bereich | Default | Bedeutung |
|--------|---------|---------|-----------|
| **Jump Distance** | 1 – 40 % | 6 % | Wie weit die Maske pro Sprung maximal von ihrer Basisposition abweicht (Anteil der Layer-Breite/-Höhe). |
| **Jump Every N Frames** | 1 – 15 f | 3 | Grundabstand zwischen zwei Sprüngen; pro Keyframe kommt zufällig 0 oder 1 Frame dazu. |
| **Mask Size** | 1 – 60 % | 10 % | Grundgröße der Maske. Geht als `sqrt(Wert)` in Breite und Höhe ein, wird zusätzlich zufällig skaliert. |

---

## Wie es funktioniert

### `runGlitchPreroll(numLayers, frames, jumpDist, jumpFreq, maskSizePct)`

* Prüft, dass eine Komposition aktiv ist und genau ein Layer selektiert wurde.
* Merkt sich `X = orig.inPoint` und die Frame-Dauer `fd = 1 / comp.frameRate`.
* Bestimmt einen `anchorLayer` (`comp.layer(orig.index - 2)`, falls
  `orig.index >= 3`), damit die Duplikate in der Ebenenliste konsistent
  einsortiert werden – sonst wandern sie an den Anfang der Komposition.
* Erzeugt pro Durchlauf ein Duplikat, setzt
  `inPoint = X − n·fd`, `outPoint = X` und ruft `applyMask()` auf.
* Alles innerhalb `app.beginUndoGroup("Glitch Preroll")` / `app.endUndoGroup()`.

### `applyMask(layer, layerIn, layerOut, fd, jumpDist, jumpFreq, sizePct)`

* Berechnet aus `sizePct` und Zufallsfaktoren eine Basis-Maskengröße
  (`maskW`, `maskH`) und ein Basis-Zentrum (`baseCX`, `baseCY`) in der Nähe der
  Layer-Mitte.
* Fügt eine Maske ohne Feather hinzu und setzt vom In- bis zum Out-Point
  Keyframes auf `Mask Path`: pro Keyframe ein achsenparalleles Rechteck
  (4 Vertices, keine Tangenten) an zufällig versetzter Position und mit
  zufälliger Skalierung.
* Der Zeitschritt ist `(jumpFreq + rand(0|1)) · fd`, wodurch das Springen
  unregelmäßig wirkt.
* Zum Schluss werden **alle Keyframes auf HOLD** gesetzt – die Maske springt
  hart, statt zu interpolieren.

Da jeder Aufruf mit `Math.random()` arbeitet, sieht jedes Ergebnis anders aus.

---

## UI-Aufbau

Das Panel baut sein Dark-Theme selbst, weil ScriptUI auf macOS Hintergrund-
farben nur auf `group`-Elementen zuverlässig respektiert:

* `bg()` / `fg()` – setzen Brush bzw. Pen eines Controls.
* `dot()` – kleiner farbiger Punkt, gezeichnet per `onDraw`.
* `card()` – Container-Group im Kartenlook (`#1C1D28`).
* `sectionTitle()` – Punkt + Überschrift + farbige Trennlinie.
* `sliderRow()` – Label, Slider und mitlaufender Wert-Text mit Einheit.
* Der Button ist ein Leaf-Control und wird komplett in `onDraw` gezeichnet
  (Orange-Fläche, Shimmer oben, dunkler Rand unten, zentrierter Text).
* `buildUI()` erkennt über `thisObj instanceof Panel`, ob es als dockbares
  Panel oder als schwebende Palette läuft.

Farbpalette: `#111118` (Hintergrund), `#1C1D28` (Karten), `#F0750A` (Orange),
`#4FB8F5` (Blau), `#7B5BE8` (Violett), `#C85AC8` (Pink).

---

## Anpassen

Die Defaults stehen ganz oben in der Datei:

```js
var DEF_NUM  = 3;               // Anzahl Layer
var DEF_FR   = [10, 7, 4, 6, 3];// Frames pro Layer
var DEF_DIST = 6;               // Jump Distance in %
var DEF_FREQ = 3;               // Jump Every N Frames
var DEF_SIZE = 10;              // Mask Size in %
```

Die Slider-Grenzen lassen sich in den `sliderRow(...)`-Aufrufen in `buildUI()`
ändern; das Maximum von 5 Layern ist zusätzlich in den Arrays `DEF_FR` und
`layerColors` sowie in der `for`-Schleife verankert.

---

## Kompatibilität

Getestet für After Effects 2026 (ExtendScript / ES3-Syntax). Das Skript
verwendet ausschließlich klassische AE-Scripting-APIs (`CompItem`,
`Layer.duplicate()`, `Masks.addProperty`, `Shape`,
`KeyframeInterpolationType.HOLD`) und sollte auch in älteren CC-Versionen
laufen.
