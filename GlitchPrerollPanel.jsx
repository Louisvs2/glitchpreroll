// GlitchPrerollPanel.jsx  –  Dockbares ScriptUI Panel, After Effects 2026
//
// Mac:  /Applications/Adobe After Effects 2026/Scripts/ScriptUI Panels/
// Win:  ...\Adobe After Effects 2026\Support Files\Scripts\ScriptUI Panels\
// AE neu starten → Fenster → GlitchPrerollPanel

(function (thisObj) {
    "use strict";

    // ── Defaults ──────────────────────────────────────────────────────────────
    var DEF_NUM  = 3;
    var DEF_FR   = [10, 7, 4, 6, 3];
    var DEF_DIST = 6;
    var DEF_FREQ = 3;
    var DEF_SIZE = 10;

    // ── Farben  (R,G,B,A  je 0–1) ─────────────────────────────────────────────
    var C = {
        bg:     [1.000, 1.000, 1.000, 1],   // #FFFFFF
        card:   [1.000, 1.000, 1.000, 1],   // #FFFFFF
        orange: [1.000, 0.231, 0.000, 1],   // #FF3B00
        blue:   [0.000, 0.000, 0.000, 1],   // #000000
        purple: [0.000, 0.000, 0.000, 1],   // #000000
        pink:   [0.000, 0.000, 0.000, 1],   // #000000
        white:  [1.000, 1.000, 1.000, 1],   // #FFFFFF
        hi:     [0.000, 0.000, 0.000, 1],   // #000000
        mid:    [0.541, 0.541, 0.541, 1],   // #8A8A8A
        lo:     [0.541, 0.541, 0.541, 1],   // #8A8A8A
        black:  [0.000, 0.000, 0.000, 1],   // #000000
    };

    // ── Typografie  (eine Familie: Systemschrift) ─────────────────────────────
    var F = {
        title:   ScriptUI.newFont("", ScriptUI.FontStyle.BOLD,    18),
        section: ScriptUI.newFont("", ScriptUI.FontStyle.BOLD,    11),
        label:   ScriptUI.newFont("", ScriptUI.FontStyle.REGULAR, 11),
        value:   ScriptUI.newFont("", ScriptUI.FontStyle.REGULAR, 11),
        button:  ScriptUI.newFont("", ScriptUI.FontStyle.BOLD,    12),
        small:   ScriptUI.newFont("", ScriptUI.FontStyle.REGULAR, 10),
    };

    // ── Farb-Helfer ───────────────────────────────────────────────────────────
    function bg(el, col) {
        el.graphics.backgroundColor =
            el.graphics.newBrush(el.graphics.BrushType.SOLID_COLOR, col);
    }
    function fg(el, col) {
        el.graphics.foregroundColor =
            el.graphics.newPen(el.graphics.PenType.SOLID_COLOR, col, 1);
    }
    function font(el, f) {
        el.graphics.font = f;
    }

    // ── Dünne schwarze Trennlinie (1 px) ──────────────────────────────────────
    function rule(parent, col) {
        var sep = parent.add("group");
        sep.alignment            = ["fill", "top"];
        sep.preferredSize.height = 1;
        sep.onDraw = function () {
            var g = this.graphics, W = this.size[0];
            g.newPath(); g.rectPath(0, 0, W, 1);
            g.fillPath(g.newBrush(g.BrushType.SOLID_COLOR, col));
        };
        return sep;
    }

    // ── Karte (group, KEIN panel → respektiert bg auf macOS) ─────────────────
    function card(parent) {
        var c = parent.add("group");
        c.orientation   = "column";
        c.alignChildren = ["fill", "top"];
        c.alignment     = ["fill", "top"];
        c.spacing       = 8;
        c.margins       = [0, 4, 0, 4];
        bg(c, C.card);
        return c;
    }

    // ── Abschnitts-Header ─────────────────────────────────────────────────────
    function sectionTitle(parent, title, col) {
        var row = parent.add("group");
        row.orientation   = "row";
        row.alignChildren = ["left", "center"];
        row.alignment     = ["fill", "top"];
        row.spacing       = 12;
        row.margins       = [0, 0, 0, 6];
        bg(row, C.card);

        var lbl = row.add("statictext", undefined, title);
        lbl.alignment = ["fill", "center"];
        font(lbl, F.section);
        fg(lbl, C.black);

        // dünne Linie
        rule(parent, col);

        // Abstand nach Linie
        var pad = parent.add("group");
        pad.alignment = ["fill", "top"];
        pad.preferredSize.height = 6;
        bg(pad, C.card);
    }

    // ── Slider-Zeile ─────────────────────────────────────────────────────────
    function sliderRow(parent, label, val, lo, hi, unit, col) {
        var row = parent.add("group");
        row.orientation   = "row";
        row.alignChildren = ["left", "center"];
        row.alignment     = ["fill", "top"];
        row.spacing       = 12;
        row.margins       = [0, 2, 0, 2];
        bg(row, C.card);

        var lbl = row.add("statictext", undefined, label);
        lbl.preferredSize.width = 168;
        lbl.alignment = ["left", "center"];
        font(lbl, F.label);
        fg(lbl, C.mid);

        var sl = row.add("slider", undefined, val, lo, hi);
        sl.alignment = ["fill", "center"];   // ← füllt verfügbaren Platz

        var vl = row.add("statictext", undefined, val + unit);
        vl.preferredSize.width = 36;
        vl.alignment = ["right", "center"];
        font(vl, F.value);
        fg(vl, col);

        sl.onChanging = function () { vl.text = Math.round(sl.value) + unit; };

        return { row: row, slider: sl, valLabel: vl };
    }

    // ── Haupt-UI ──────────────────────────────────────────────────────────────
    function buildUI(host) {
        var win = (host instanceof Panel)
            ? host
            : new Window("palette", "Glitch Preroll", undefined, { resizeable: true });

        win.orientation   = "column";
        win.alignChildren = ["fill", "top"];
        win.spacing       = 12;
        win.margins       = 16;
        bg(win, C.bg);

        // ── Header ────────────────────────────────────────────────────────────
        var hdrRow = win.add("group");
        hdrRow.orientation   = "row";
        hdrRow.alignChildren = ["left", "center"];
        hdrRow.alignment     = ["fill", "top"];
        hdrRow.spacing       = 12;
        hdrRow.margins       = [0, 0, 0, 6];
        bg(hdrRow, C.bg);

        var title = hdrRow.add("statictext", undefined, "GLITCH PREROLL");
        title.alignment = ["left", "center"];
        font(title, F.title);
        fg(title, C.black);

        var sub = hdrRow.add("statictext", undefined, "AE 2026");
        sub.alignment = ["right", "center"];
        font(sub, F.small);
        fg(sub, C.mid);

        rule(win, C.black);

        // ── Karte: Layer ──────────────────────────────────────────────────────
        var cL = card(win);
        sectionTitle(cL, "LAYER SETTINGS", C.black);

        var ctrlNum = sliderRow(cL, "NUMBER OF LAYERS", DEF_NUM, 1, 5, "", C.orange);

        var sp = cL.add("group"); sp.preferredSize.height = 6; sp.alignment = ["fill","top"]; bg(sp, C.card);

        var layerColors  = [C.orange, C.orange, C.orange, C.orange, C.orange];
        var frameRows    = [], frameSliders = [], frameLabels = [];
        for (var fi = 0; fi < 5; fi++) {
            var fr = sliderRow(cL, "LAYER " + (fi + 1) + "  FRAMES",
                               DEF_FR[fi], 1, 60, " f", layerColors[fi]);
            frameRows.push(fr.row);
            frameSliders.push(fr.slider);
            frameLabels.push(fr.valLabel);
        }

        // ── Karte: Masken ─────────────────────────────────────────────────────
        var cM = card(win);
        sectionTitle(cM, "MASK SETTINGS", C.black);

        var ctrlDist = sliderRow(cM, "JUMP DISTANCE",       DEF_DIST, 1, 40, " %", C.black);
        var ctrlFreq = sliderRow(cM, "JUMP EVERY N FRAMES", DEF_FREQ, 1, 15, " f", C.black);
        var ctrlSize = sliderRow(cM, "MASK SIZE",           DEF_SIZE, 1, 60, " %", C.black);

        // ── Button (Leaf → onDraw funktioniert) ───────────────────────────────
        var btn = win.add("button", undefined, "");
        btn.alignment       = ["fill", "top"];
        btn.preferredSize.height = 34;
        font(btn, F.button);

        btn.onDraw = function () {
            var g = this.graphics, W = this.size[0], H = this.size[1];

            g.newPath(); g.rectPath(0, 0, W, H);
            g.fillPath(g.newBrush(g.BrushType.SOLID_COLOR, C.orange));

            var txt = "CREATE GLITCH PREROLL";
            var pen = g.newPen(g.PenType.SOLID_COLOR, C.white, 1);
            var ms  = g.measureString(txt, g.font, W);
            g.drawString(txt, pen, (W - ms[0]) / 2, (H - ms[1]) / 2);
        };

        // ── Layer-Zeilen ein-/ausblenden ──────────────────────────────────────
        function refreshRows() {
            var n = Math.round(ctrlNum.slider.value);
            ctrlNum.valLabel.text = n;
            for (var j = 0; j < 5; j++) {
                frameRows[j].enabled = (j < n);
                fg(frameLabels[j], j < n ? layerColors[j] : C.lo);
            }
        }
        ctrlNum.slider.onChanging = refreshRows;
        ctrlNum.slider.onChange   = refreshRows;
        refreshRows();

        btn.onClick = function () {
            var n = Math.round(ctrlNum.slider.value);
            var frames = [];
            for (var j = 0; j < n; j++) frames.push(Math.round(frameSliders[j].value));
            runGlitchPreroll(
                n, frames,
                Math.round(ctrlDist.slider.value) / 100,
                Math.round(ctrlFreq.slider.value),
                Math.round(ctrlSize.slider.value) / 100
            );
        };

        // ── Branding ──────────────────────────────────────────────────────────
        rule(win, C.black);

        var footRow = win.add("group");
        footRow.orientation   = "row";
        footRow.alignChildren = ["right", "center"];
        footRow.alignment     = ["fill", "top"];
        footRow.margins       = [0, 2, 0, 0];
        bg(footRow, C.bg);

        var credit = footRow.add("statictext", undefined, "BY LOUIS REINECKE");
        credit.alignment = ["right", "center"];
        font(credit, F.small);
        fg(credit, C.mid);

        // ── Resize ────────────────────────────────────────────────────────────
        win.onResize = win.onResizeContent = function () {
            win.layout.resize();
        };

        win.layout.layout(true);
        win.layout.resize();
        return win;
    }

    // ── Glitch-Logik ─────────────────────────────────────────────────────────
    function runGlitchPreroll(numLayers, frames, jumpDist, jumpFreq, maskSizePct) {
        var comp = app.project.activeItem;
        if (!(comp instanceof CompItem)) { alert("Bitte eine Komposition oeffnen."); return; }
        if (comp.selectedLayers.length !== 1) { alert("Bitte genau EINEN Layer auswaehlen."); return; }

        var orig        = comp.selectedLayers[0];
        var fd          = 1 / comp.frameRate;
        var X           = orig.inPoint;
        var anchorLayer = (orig.index >= 3) ? comp.layer(orig.index - 2) : null;

        app.beginUndoGroup("Glitch Preroll");

        for (var i = 0; i < numLayers; i++) {
            var nF  = frames[i];
            var dup = orig.duplicate();
            if (anchorLayer) { dup.moveBefore(anchorLayer); } else { dup.moveToBeginning(); }
            dup.inPoint  = X - nF * fd;
            dup.outPoint = X;
            applyMask(dup, X - nF * fd, X, fd, jumpDist, jumpFreq, maskSizePct);
        }

        app.endUndoGroup();
    }

    function applyMask(layer, layerIn, layerOut, fd, jumpDist, jumpFreq, sizePct) {
        var w = layer.width, h = layer.height;
        var maskW = w * Math.sqrt(sizePct) * (0.5 + Math.random() * 1.8);
        var maskH = h * Math.sqrt(sizePct) * (0.3 + Math.random() * 1.2);
        var baseCX = w / 2 + (Math.random() - 0.5) * 0.5 * w;
        var baseCY = h / 2 + (Math.random() - 0.5) * 0.5 * h;

        var mask = layer.Masks.addProperty("Mask");
        var pp   = mask.property("Mask Path");
        mask.property("Mask Feather").setValue([0, 0]);

        var t = layerIn;
        while (t <= layerOut + fd * 0.01) {
            var cx = baseCX + (Math.random() - 0.5) * w * jumpDist;
            var cy = baseCY + (Math.random() - 0.5) * h * jumpDist;
            var rs = 0.5 + Math.random();
            var s  = new Shape();
            s.closed      = true;
            s.vertices    = [[cx - maskW*rs/2, cy - maskH*rs/2],
                              [cx + maskW*rs/2, cy - maskH*rs/2],
                              [cx + maskW*rs/2, cy + maskH*rs/2],
                              [cx - maskW*rs/2, cy + maskH*rs/2]];
            s.inTangents  = [[0,0],[0,0],[0,0],[0,0]];
            s.outTangents = [[0,0],[0,0],[0,0],[0,0]];
            pp.setValueAtTime(t, s);
            t += (jumpFreq + Math.floor(Math.random() * 2)) * fd;
        }

        for (var k = 1; k <= pp.numKeys; k++) {
            pp.setInterpolationTypeAtKey(k, KeyframeInterpolationType.HOLD);
        }
    }

    // ── Start ─────────────────────────────────────────────────────────────────
    var panel = buildUI(thisObj);
    if (panel instanceof Window) { panel.center(); panel.show(); }

}(this));
