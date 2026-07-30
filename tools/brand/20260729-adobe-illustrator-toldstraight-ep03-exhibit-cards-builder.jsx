/**
 * Told Straight — Ep03 Exhibit stat cards  (ILLUSTRATOR)
 * ------------------------------------------------------------------
 * Builds the six Ep03 "Exhibit" chapter cards (ch1..ch6) as live,
 * editable vector artboards in the measured Told Straight palette —
 * siblings of the Ep02 set, which is the binding reference.
 *
 * WORKFLOW (audio-lab, pinned 2026-07-29). The agent AUTHORS this
 * builder; the MAINTAINER runs it manually in Illustrator, where the
 * licensed faces (Trade Gothic Next LT Pro Bold Condensed + Letter
 * Gothic Std) are activated via Adobe Fonts. The agent never renders
 * these PNGs itself — the licensed condensed face is not installed in
 * its environment, and embedding the outlines in a tracked SVG on this
 * PUBLIC repo is a license breach (see the #80 483-glyph incident).
 * Export to PNG24 here, hand the PNGs back, an executor commits them to
 * episodes/ToldStraight-Ep03/ as ch1.png..ch6.png.
 *
 * TO RUN:  File > Scripts > Other Script...  and pick this file.
 * IT NEVER TOUCHES AN OPEN DOCUMENT. It always creates a new one.
 *
 * CONTENT is locked by the PM (spec §3.3, 2026-07-29): copy may be
 * typographically tightened, but the numbers and attributions may not
 * change. Two cards (01, 05) deliberately carry no citation.
 */

#target illustrator

(function () {

    // ==============================================================
    // WRONG-APP GUARD
    // ==============================================================

    var thisApp = "an unknown application";
    try { thisApp = String(app.name); } catch (e) {}
    if (thisApp.indexOf("Illustrator") === -1) {
        alert("WRONG APPLICATION\n\n"
            + "This is an ILLUSTRATOR script (Told Straight Ep03 Exhibit cards).\n"
            + "You are running it in: " + thisApp + "\n\n"
            + "Open Adobe Illustrator and run it from:\n"
            + "File > Scripts > Other Script...\n\n"
            + "Nothing was created or changed.");
        return;
    }

    // ==============================================================
    // 0. FACES — pinned from the Ep01/Ep02 system, 2026-07-27
    // ==============================================================

    var FACE = {
        title: "TradeGothicNextLTPro-BdCn",   // big stat + captions
        label: null,                          // full-width sibling — searched
        mono:  "LetterGothicStd"              // exhibit line + citation + footer
    };

    var SEARCH = {
        title: [
            { require: ["tradegothicnext"], exclude: ["italic", "oblique"],
              prefer: ["bdcn", "boldcond", "condbold", "hvcn", "condheavy", "bd", "bold"] },
            { require: ["universnextpro", "cond"], exclude: ["italic", "oblique"],
              prefer: ["boldcond", "condbold", "heavycond", "blackcond"] },
            { require: ["helveticaneueltpro"], exclude: ["italic", "oblique", "obl"],
              prefer: ["bdcn", "blkcn"] }
        ],
        label: [
            { require: ["tradegothicnext"], exclude: ["italic", "oblique"],
              excludeSuffix: ["cn", "cond", "comp", "it", "obl"],
              prefer: ["bold", "bd", "heavy", "hv"] },
            { require: ["universnextpro"], exclude: ["italic", "oblique"],
              excludeSuffix: ["cond", "comp", "it", "obl"],
              prefer: ["bold", "bd", "heavy"] },
            { require: ["helveticaneueltpro"], exclude: ["italic", "oblique"],
              excludeSuffix: ["cn", "ex", "it", "obl"],
              prefer: ["bd", "bold", "blk"] }
        ],
        mono: [
            { require: ["lettergothic"],  exclude: ["italic", "oblique"], prefer: ["std", "medium", "bold"] },
            { require: ["oratorstd"],     exclude: ["italic", "oblique"], prefer: ["std", "medium"] },
            { require: ["courierprime"],  exclude: ["italic", "oblique"], prefer: ["regular", "prime"] },
            { require: ["ibmplexmono"],   exclude: ["italic", "oblique"], prefer: ["regular", "text"] },
            { require: ["sourcecodepro"], exclude: ["italic", "oblique"], prefer: ["regular"] },
            { require: ["courier"],       exclude: ["italic", "oblique"], prefer: ["regular", "psmt"] }
        ]
    };

    var EXPORT_PNG = true;   // re-run writes ch1..ch6.png for commit
    var EXPORT_DIR = "~/Code/audio-lab/output/artwork/ep03";

    // ==============================================================
    // 1. THE CONTENT — locked by spec §3.3. Do not change numbers or
    //    attributions. `statSize` is an eyeballed starting point per
    //    card because the figures vary from "n = 2" to a short phrase;
    //    tune it, do not tune the words.
    // ==============================================================

    var CARDS = [
        { n: "01", topic: "THE HOMEWORK",
          stat: "232 ITEMS", statSize: 210,
          caption: "ONE PEN, TEN PAGES, REAL ANSWERS",
          cite: "" },

        { n: "02", topic: "THE EVIDENCE, TOLD STRAIGHT",
          stat: "n = 2", statSize: 300,
          caption: "SMALL STUDIES — AND THEY DISAGREE",
          cite: "PHILIPSEN 2017\rKIRAZ 2021" },

        { n: "03", topic: "DOOR ONE",
          stat: "4.56 / 6", statSize: 250,
          caption: "EMOTIONAL DEPRIVATION — 7 OF 9 ITEMS AT FIVE",
          cite: "PHILIPSEN 2017" },

        { n: "04", topic: "THE FINGERPRINT",
          stat: "1 SIX IN 232", statSize: 150,
          caption: "ONLY WHERE THE TASK STOPS FEEDING",
          cite: "MARX 2021\rSERGEANT 2005" },

        { n: "05", topic: "DOOR THREE",
          stat: "GIVES 5s,\rRECEIVES 1s", statSize: 130,
          caption: "SELF-SACRIFICE — RINGS TRUEST, MEASURES WORST",
          cite: "" },

        { n: "06", topic: "THE PLAN",
          stat: "d ≈ 0.65", statSize: 250,
          caption: "IF-THEN PLANS, META-ANALYZED",
          cite: "GOLLWITZER & SHEERAN 2006" }
    ];

    var FOOTER_LEFT = "TOLD STRAIGHT / EP.03";

    // ==============================================================
    // 2. GEOMETRY + PALETTE  (measured from the v1 PNGs, 2026-07-27)
    // ==============================================================

    var AB     = 1600;
    var GUTTER = 200;
    var MARGIN = 96;
    var COLS   = 3;

    var PALETTE = {
        paper:    [237, 233, 224],   // #EDE9E0
        ink:      [ 17,  17,  17],   // #111111
        red:      [176,  42,  40],   // #B02A28
        grey:     [120, 116, 108],   // #78746C
        hairline: [200, 196, 186]    // #C8C4BA
    };

    var SIZE = {
        exhibit: { size: 34,  leading: 44,  tracking: 160 },
        stat:    { size: 300, leading: 300, tracking: -20 },  // per-card size overrides this
        caption: { size: 50,  leading: 64,  tracking:  10 },
        cite:    { size: 30,  leading: 46,  tracking: 120 },
        footer:  { size: 26,  leading: 34,  tracking: 120 }
    };

    var report = [];
    function log(s) { report.push(s); }
    function rgb(t) { var c = new RGBColor(); c.red=t[0]; c.green=t[1]; c.blue=t[2]; return c; }
    var C = {
        paper: rgb(PALETTE.paper), ink: rgb(PALETTE.ink), red: rgb(PALETTE.red),
        grey: rgb(PALETTE.grey), hairline: rgb(PALETTE.hairline)
    };

    // ==============================================================
    // 3. FONT RESOLUTION — report substitutions, never hide them
    // ==============================================================

    var installed = [];
    for (var fi = 0; fi < app.textFonts.length; fi++) installed.push(app.textFonts[fi].name);

    function has(ps) {
        for (var i = 0; i < installed.length; i++) if (installed[i] === ps) return true;
        return false;
    }
    function familyMembers(require, exclude, excludeSuffix) {
        var out = [], i, j, nm, suf, cut, ok;
        for (i = 0; i < installed.length; i++) {
            nm = installed[i].toLowerCase(); ok = true;
            for (j = 0; j < require.length; j++) if (nm.indexOf(require[j]) === -1) { ok = false; break; }
            if (ok && exclude) {
                for (j = 0; j < exclude.length; j++) if (nm.indexOf(exclude[j]) !== -1) { ok = false; break; }
            }
            if (ok && excludeSuffix) {
                cut = nm.lastIndexOf("-");
                suf = (cut === -1) ? "" : nm.substring(cut + 1);
                for (j = 0; j < excludeSuffix.length; j++) if (suf.indexOf(excludeSuffix[j]) !== -1) { ok = false; break; }
            }
            if (ok) out.push(installed[i]);
        }
        return out;
    }

    var faceWarnings = 0;

    function resolveRole(roleName, pinned, groups) {
        var i, j, k, fam;
        if (pinned && has(pinned)) { log("  " + roleName + ": " + pinned + "   (pinned)"); return pinned; }
        if (pinned) { faceWarnings++; log("  " + roleName + ": PINNED '" + pinned + "' NOT INSTALLED — searching"); }
        for (i = 0; i < groups.length; i++) {
            fam = familyMembers(groups[i].require, groups[i].exclude, groups[i].excludeSuffix);
            if (!fam.length) continue;
            for (j = 0; j < groups[i].prefer.length; j++) {
                for (k = 0; k < fam.length; k++) {
                    if (fam[k].toLowerCase().indexOf(groups[i].prefer[j]) !== -1) {
                        log("  " + roleName + ": " + fam[k] + "   (" + groups[i].require.join("+")
                            + " / " + groups[i].prefer[j] + ")");
                        return fam[k];
                    }
                }
            }
            faceWarnings++;
            log("  " + roleName + ": " + fam[0] + "   ** WEIGHT COMPROMISE **");
            return fam[0];
        }
        faceWarnings++;
        log("  " + roleName + ": NOTHING MATCHED — Illustrator default");
        return null;
    }
    function fontObj(ps) { if (!ps) return null; try { return app.textFonts.getByName(ps); } catch (e) { return null; } }

    log("TOLD STRAIGHT — Ep03 Exhibit cards");
    log("Built " + new Date().toString());
    log("Illustrator " + app.version + "  |  " + installed.length + " fonts installed");
    log("");
    log("FONTS RESOLVED");
    var psTitle = resolveRole("title", FACE.title, SEARCH.title);
    var psLabel = resolveRole("label", FACE.label, SEARCH.label);
    var psMono  = resolveRole("mono ", FACE.mono,  SEARCH.mono);
    log("");
    var fTitle = fontObj(psTitle), fLabel = fontObj(psLabel), fMono = fontObj(psMono);

    // ==============================================================
    // 4. DOCUMENT + ARTBOARDS
    // ==============================================================

    var doc = app.documents.add(DocumentColorSpace.RGB, AB, AB);
    try { doc.rulerUnits = RulerUnits.Points; } catch (e) {}

    function cellRect(col, row) {
        var l = col * (AB + GUTTER), t = -(row * (AB + GUTTER));
        return [l, t, l + AB, t - AB];
    }
    try { doc.artboards[0].artboardRect = cellRect(0, 0); } catch (e) { log("WARN: artboard 0 — " + e); }
    for (var k = 1; k < CARDS.length; k++) {
        try { doc.artboards.add(cellRect(k % COLS, Math.floor(k / COLS))); }
        catch (e2) { log("WARN: artboard " + k + " — " + e2); }
    }
    try { doc.artboards.add(cellRect(COLS, 0)); } catch (e3) {}   // audit board
    for (var ai = 0; ai < doc.artboards.length && ai < CARDS.length; ai++) {
        try { doc.artboards[ai].name = "ch" + (ai + 1) + "-exhibit-" + CARDS[ai].n; } catch (e4) {}
    }

    function layer(name) {
        var l; try { l = doc.layers.getByName(name); } catch (e) { l = doc.layers.add(); l.name = name; } return l;
    }
    var lyType = layer("TYPE"), lyRules = layer("RULES"), lyPaper = layer("PAPER");
    try { lyPaper.zOrder(ZOrderMethod.SENDTOBACK); } catch (e) {}

    // ==============================================================
    // 5. STYLES
    // ==============================================================

    function paraStyle(name, spec, colour, font, justify) {
        var st; try { st = doc.paragraphStyles.getByName(name); } catch (e) { st = doc.paragraphStyles.add(name); }
        try {
            var ca = st.characterAttributes;
            ca.size = spec.size; ca.leading = spec.leading; ca.tracking = spec.tracking;
            ca.autoLeading = false;
            if (colour) ca.fillColor = colour;
            if (font) ca.textFont = font;
            if (justify !== undefined) st.paragraphAttributes.justification = justify;
        } catch (e2) { log("WARN: style " + name + " — " + e2); }
        return st;
    }

    var PS = {
        exhibit: paraStyle("CARD/Exhibit", SIZE.exhibit, C.ink,  fMono  || fLabel, Justification.LEFT),
        stat:    paraStyle("CARD/Stat",    SIZE.stat,    C.ink,  fTitle,           Justification.CENTER),
        caption: paraStyle("CARD/Caption", SIZE.caption, C.ink,  fLabel || fTitle, Justification.CENTER),
        cite:    paraStyle("CARD/Cite",    SIZE.cite,    C.grey, fMono  || fLabel, Justification.CENTER),
        footL:   paraStyle("CARD/FooterL", SIZE.footer,  C.grey, fMono  || fLabel, Justification.LEFT),
        footR:   paraStyle("CARD/FooterR", SIZE.footer,  C.grey, fMono  || fLabel, Justification.RIGHT),
        audit:   paraStyle("CARD/Audit",   { size: 20, leading: 29, tracking: 0 }, C.ink, fMono || fLabel, Justification.LEFT)
    };

    // ==============================================================
    // 6. DRAWING
    // ==============================================================

    function dx(col, x) { return col * (AB + GUTTER) + x; }
    function dy(row, y) { return -(row * (AB + GUTTER)) - y; }

    function paper(col, row) {
        var r = lyPaper.pathItems.rectangle(dy(row, 0), dx(col, 0), AB, AB);
        r.filled = true; r.fillColor = C.paper; r.stroked = false; return r;
    }
    function frameBox(col, row) {
        var r = lyRules.pathItems.rectangle(dy(row, MARGIN * 0.45), dx(col, MARGIN * 0.45),
                                            AB - (MARGIN * 0.9), AB - (MARGIN * 0.9));
        r.filled = false; r.stroked = true; r.strokeColor = C.ink; r.strokeWidth = 7; return r;
    }
    function bar(col, row, y, thick, colour, inset, width) {
        var x = (inset === undefined) ? MARGIN : inset;
        var w = (width === undefined) ? (AB - x * 2) : width;
        var r = lyRules.pathItems.rectangle(dy(row, y), dx(col, x), w, thick);
        r.filled = true; r.fillColor = colour; r.stroked = false; return r;
    }
    function text(col, row, y, h, content, style, inset) {
        var x = (inset === undefined) ? MARGIN : inset;
        var box = lyType.pathItems.rectangle(dy(row, y), dx(col, x), AB - (x * 2), h);
        var tf;
        try { tf = lyType.textFrames.areaText(box); } catch (e) { log("WARN: text — " + e); return null; }
        tf.contents = content;
        try { style.applyTo(tf.textRange, true); } catch (e2) {}
        return tf;
    }

    // ==============================================================
    // 7. BUILD THE SIX CARDS
    //    Structure mirrors Ep02: keyline frame, exhibit line under a
    //    rule, the figure centred, a red rule beneath it, the caption
    //    in caps, the citation in grey (omitted where there is none),
    //    a two-part footer.
    // ==============================================================

    for (var i = 0; i < CARDS.length; i++) {
        var card = CARDS[i];
        var col = i % COLS, row = Math.floor(i / COLS);

        paper(col, row);
        frameBox(col, row);

        text(col, row, MARGIN + 18, 54,
             "EXHIBIT " + card.n + " — " + card.topic, PS.exhibit, MARGIN + 24);
        bar(col, row, MARGIN + 84, 4, C.ink, MARGIN + 24);

        // The figure. Per-card size — the stat decides the face and the
        // longest figures (05, 04) need the smaller sizes set above.
        var statTf = text(col, row, 470, 380, card.stat, PS.stat);
        if (statTf && card.statSize) {
            try { statTf.textRange.characterAttributes.size = card.statSize; } catch (eSt) {}
            try { statTf.textRange.characterAttributes.leading = card.statSize; } catch (eSt2) {}
        }

        bar(col, row, 872, 9, C.red, 240);

        text(col, row, 930, 200, card.caption, PS.caption, 108);

        if (card.cite && card.cite.length) {
            text(col, row, 1190, 130, card.cite, PS.cite, 200);
        }

        text(col, row, AB - MARGIN - 40, 46, FOOTER_LEFT, PS.footL, MARGIN + 24);
        text(col, row, AB - MARGIN - 40, 46, card.n + "/06", PS.footR, MARGIN + 24);
    }

    // ==============================================================
    // 8. AUDIT BOARD
    // ==============================================================

    log("SIX CARDS BUILT — artboards ch1..ch6");
    for (var m = 0; m < CARDS.length; m++) {
        log("  ch" + (m + 1) + "  " + CARDS[m].stat.replace(/\r/g, " ") + "   " + CARDS[m].topic);
    }
    log("");
    log("WHAT IS AND IS NOT DECIDED HERE");
    log("  Palette: MEASURED from the v1 PNGs. Trust it.");
    log("    paper #EDE9E0  ink #111111  red #B02A28  grey #78746C  rule #C8C4BA");
    log("  Content: LOCKED by spec §3.3 — numbers and attributions are canon.");
    log("    Cards 01 and 05 carry NO citation on purpose; do not invent one.");
    log("  Sizes/positions: EYEBALLED, siblings of the Ep02 set. Adjust freely.");
    log("    The stat sizes vary per card (see statSize) because the figures");
    log("    range from 'n = 2' to the phrase 'GIVES 5s, RECEIVES 1s'.");
    log("  GLYPH WATCH: card 06 uses U+2248 (≈). If Trade Gothic Next lacks");
    log("    it and it drops, substitute a plain '~' — but keep the value 0.65.");
    log("");
    log("MATCH THE EP02 SET BY EYE AT 100% BEFORE EXPORT");
    log("  Open episodes/ToldStraight-Ep02/ch1.png beside these. Divergence from");
    log("  the Ep02 exhibit format is a defect, not a variation.");
    log("");
    log("THE AGENT DID NOT AND CANNOT RENDER THESE");
    log("  Licensed condensed face is not installed off this machine, and");
    log("  embedding its outlines in a tracked SVG on a public repo is a license");
    log("  breach. You run this; you export; an executor commits your PNGs.");

    var auditCol = COLS, auditRow = 0;
    paper(auditCol, auditRow);
    text(auditCol, auditRow, MARGIN, AB - (MARGIN * 2), report.join("\r"), PS.audit);

    try { app.executeMenuCommand("fitall"); } catch (e) {}

    // ==============================================================
    // 9. OPTIONAL PNG EXPORT — descriptive filenames, never a hash
    //    Set EXPORT_PNG = true above. Files land as ch1..ch6 so an
    //    executor can drop them straight into episodes/ToldStraight-Ep03/.
    // ==============================================================

    var exported = 0, exportNote = "";
    if (EXPORT_PNG) {
        try {
            var dir = new Folder(EXPORT_DIR);
            if (!dir.exists) dir.create();
            var opts = new ExportOptionsPNG24();
            opts.artBoardClipping = true; opts.transparency = false;
            opts.horizontalScale = 100; opts.verticalScale = 100;
            for (var e5 = 0; e5 < CARDS.length; e5++) {
                doc.artboards.setActiveArtboardIndex(e5);
                doc.exportFile(new File(dir.fsName + "/ch" + (e5 + 1) + ".png"), ExportType.PNG24, opts);
                exported++;
            }
            exportNote = "\n" + exported + " PNGs (ch1..ch6) written to " + EXPORT_DIR + "\n";
        } catch (e6) { exportNote = "\nPNG export failed: " + e6 + "\n"; }
    }

    var summary = "Told Straight — six Ep03 Exhibit cards built.\n\n"
        + "Artboards: " + doc.artboards.length + " (six cards plus the audit board).\n\n"
        + "Title face : " + (psTitle || "DEFAULT — nothing matched") + "\n"
        + "Label face : " + (psLabel || "DEFAULT — nothing matched") + "\n"
        + "Mono face  : " + (psMono  || "NONE INSTALLED") + "\n\n"
        + (faceWarnings === 0
            ? "All three faces resolved at their intended weight.\n"
            : faceWarnings + " face(s) resolved with a COMPROMISE — see the audit board.\n")
        + exportNote + "\n"
        + "Match the Ep02 set by eye at 100% before export. Palette is measured;\n"
        + "sizes are eyeballed. Nothing here replaces anything in episodes/.";

    alert(summary);

})();
