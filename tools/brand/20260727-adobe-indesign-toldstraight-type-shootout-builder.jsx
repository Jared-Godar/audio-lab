/**
 * Told Straight — type shootout builder
 * ------------------------------------------------------------------
 * Builds a complete 16-page InDesign comparison document for issue #60:
 * swatches, a Based-On paragraph style tree, and three specimen plates
 * for each of five title candidates, plus a font audit page.
 *
 * Vendor/engine/subject/purpose per CLAUDE.md naming rule.
 * Written 2026-07-27 by the audio-lab PM thread.
 *
 * WHAT IT DOES NOT DO: it makes no design decisions. Every size,
 * tracking value and rule weight below is a documented starting point
 * (eyeballed from the Ep01 render, NOT measured — the measurement was
 * refused by the repo's lane guard, see issue #56). Change them.
 *
 * TO RUN: Window > Utilities > Scripts, then double-click this file
 * under the "User" folder.
 *
 * IT NEVER TOUCHES AN EXISTING DOCUMENT. It always creates a new one.
 */

#target indesign

(function () {

    // ==============================================================
    // WRONG-APP GUARD — read this before deleting it
    // ==============================================================
    //
    // This job ships an InDesign version and an Illustrator version
    // whose filenames differ by ONE WORD in the middle. Running the
    // wrong one used to fail 224 lines deep with "Error 21: undefined
    // is not an object" at doc.colors.add() — a message that names
    // neither the cause nor the fix, after silently creating a stray
    // untitled document. It happened on 2026-07-27. This block is why
    // it will not happen twice.

    var thisApp = "an unknown application";
    try { thisApp = String(app.name); } catch (e) {}

    if (thisApp.indexOf("InDesign") === -1) {
        alert("WRONG APPLICATION\n\n"
            + "This is the INDESIGN version of the Told Straight type shootout.\n"
            + "You are running it in: " + thisApp + "\n\n"
            + "Run this file instead:\n"
            + "20260727-adobe-illustrator-toldstraight-type-shootout-builder.jsx\n\n"
            + "Nothing was created or changed.");
        return;
    }

    // ==============================================================
    // 0. CONFIG — everything you would want to change lives here
    // ==============================================================

    var CANVAS      = 1600;   // pt. 1pt = 1px against the existing Ep01 renders.
    var MARGIN      = 96;     // pt. 6% of canvas.
    var LIVE_L      = MARGIN;
    var LIVE_R      = CANVAS - MARGIN;

    // Palette — MEASURED from episodes/ToldStraight-Ep01/*.png by pixel
    // histogram, 2026-07-27. The red is a single canonical value across
    // all three source images. These are not estimates.
    var PALETTE = [
        { name: "TS/Paper",    rgb: [237, 233, 224] },   // #EDE9E0
        { name: "TS/Ink",      rgb: [ 17,  17,  17] },   // #111111
        { name: "TS/Red",      rgb: [176,  42,  40] },   // #B02A28
        { name: "TS/Grey",     rgb: [120, 116, 108] },   // #78746C
        { name: "TS/Hairline", rgb: [200, 196, 186] }    // #C8C4BA
    ];

    // Title candidates. Each carries several name variants because
    // InDesign's family/style naming for Adobe Fonts is not predictable
    // from the web font slug — the script probes rather than assumes.
    var CANDIDATES = [
        { key: "A", label: "Univers Next Pro Condensed Bold",
          variants: ["Univers Next Pro Condensed\tBold",
                     "Univers Next Pro\tCondensed Bold",
                     "Univers Next Pro Cond\tBold",
                     "UniversNextPro-CondBold"] },

        { key: "B", label: "Univers Next Pro Compressed Medium",
          variants: ["Univers Next Pro Compressed\tMedium",
                     "Univers Next Pro\tCompressed Medium",
                     "Univers Next Pro Compressed\tRegular",
                     "Univers Next Pro\tCompressed",
                     "UniversNextPro-CompMedium"] },

        { key: "C", label: "Helvetica Neue LT Pro 77 Bold Condensed",
          variants: ["Helvetica Neue LT Pro\t77 Bold Condensed",
                     "Helvetica Neue LT Pro Condensed\tBold",
                     "Helvetica Neue LT Pro Cond\tBold",
                     "HelveticaNeueLTPro-BdCn"] },

        { key: "D", label: "Articulat Heavy CF",
          variants: ["Articulat Heavy CF\tHeavy",
                     "Articulat Heavy CF\tRegular",
                     "Articulat CF\tHeavy",
                     "ArticulatHeavyCF-Heavy"] },

        { key: "E", label: "Trade Gothic Next Heavy (needs activating)",
          variants: ["Trade Gothic Next\tHeavy",
                     "Trade Gothic Next LT Pro\tHeavy",
                     "Trade Gothic Next Condensed\tHeavy",
                     "TradeGothicNextLTPro-Hv"] }
    ];

    // Supporting faces. The mono list is probed in order; the first one
    // installed wins. None are in the maintainer's web project yet, so
    // the fallback matters.
    var SUPPORT = {
        sans:  ["Univers Next Pro\tRegular", "Helvetica Neue LT Pro\tRoman",
                "Helvetica Neue\tRegular", "Helvetica\tRegular"],
        mono:  ["Letter Gothic Std\tMedium", "Letter Gothic Std\tRegular",
                "Orator Std\tMedium", "Courier Prime\tRegular",
                "Nitti\tNormal", "IBM Plex Mono\tRegular",
                "Courier New\tRegular", "Courier\tRegular"],
        serif: ["Source Serif 4\tRegular", "Source Serif Pro\tRegular",
                "Georgia\tRegular", "Times New Roman\tRegular"]
    };

    // Specimen text. Kept as data so you can edit copy without touching
    // layout code. See the shootout guide for why each string is here.
    var TEXT = {
        wordmark:  "TOLD STRAIGHT",
        stack:     "TOLD\rSTRAIGHT",
        docNo:     "FM ADHD-01",
        subtitle:  "ADULT ADHD — SEASON ONE",
        authority: "DEPT. OF NEURODEVELOPMENTAL AFFAIRS",
        distrib:   "DISTRIBUTION RESTRICTION: APPROVED FOR PUBLIC RELEASE; DISTRIBUTION IS UNLIMITED.",
        // The numeral torture test. Note "g = 1.17" is the ONLY lowercase
        // in the show's entire stat vocabulary — the stat style must NOT
        // be set to all-caps or this test is destroyed.
        stats:     "EST. 1775\r74%\r3-YR DELAY\r2.07x\rSMD ~1.0\rg = 1.17"
    };

    var report = [];
    function log(s) { report.push(s); }


    // ==============================================================
    // 1. FONT PROBE — resolve before building, never substitute silently
    // ==============================================================
    //
    // A shootout in which one candidate silently rendered in a
    // substituted face is worse than no shootout, because it looks
    // like a result. So: probe first, report honestly, mark misses.

    function resolveFont(variants) {
        for (var i = 0; i < variants.length; i++) {
            var f;
            try { f = app.fonts.itemByName(variants[i]); } catch (e) { continue; }
            if (f !== null && f.isValid) {
                var ok = true;
                try { ok = (f.status === FontStatus.INSTALLED); } catch (e2) { ok = true; }
                if (ok) return { name: variants[i], font: f, matched: true };
            }
        }
        return { name: variants[0], font: null, matched: false };
    }

    log("TOLD STRAIGHT — type shootout font audit");
    log("Built " + new Date().toString());
    log("InDesign " + app.version);
    log("");
    log("TITLE CANDIDATES");

    var missing = 0;
    for (var c = 0; c < CANDIDATES.length; c++) {
        var res = resolveFont(CANDIDATES[c].variants);
        CANDIDATES[c].resolved = res;
        if (res.matched) {
            log("  [OK]      " + CANDIDATES[c].key + "  " + res.name.replace("\t", " / "));
        } else {
            missing++;
            log("  [MISSING] " + CANDIDATES[c].key + "  " + CANDIDATES[c].label);
            log("            tried: " + CANDIDATES[c].variants.join(" | ").replace(/\t/g, " / "));
        }
    }

    log("");
    log("SUPPORTING FACES");
    var sans  = resolveFont(SUPPORT.sans);
    var mono  = resolveFont(SUPPORT.mono);
    var serif = resolveFont(SUPPORT.serif);
    log("  sans : " + (sans.matched  ? sans.name.replace("\t", " / ")  : "NONE FOUND"));
    log("  mono : " + (mono.matched  ? mono.name.replace("\t", " / ")  : "NONE FOUND — no monospace is activated"));
    log("  serif: " + (serif.matched ? serif.name.replace("\t", " / ") : "NONE FOUND"));
    log("");

    if (!mono.matched) {
        log("  NOTE: every form field, stamp and citation in the Ep01 art is");
        log("  a typewriter mono, and none is activated. Activate one of:");
        log("  Letter Gothic Std / Orator Std / Courier Prime / Nitti / IBM Plex Mono");
        log("  via Creative Cloud desktop app > Fonts > Browse fonts.");
        log("");
    }


    // ==============================================================
    // 2. DOCUMENT
    // ==============================================================

    var doc = app.documents.add();

    try {
        doc.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.POINTS;
        doc.viewPreferences.verticalMeasurementUnits   = MeasurementUnits.POINTS;
    } catch (e) { log("WARN: could not set measurement units — " + e); }

    try {
        doc.documentPreferences.facingPages   = false;
        doc.documentPreferences.pageWidth     = CANVAS;
        doc.documentPreferences.pageHeight    = CANVAS;
        doc.documentPreferences.pagesPerDocument = 1;
    } catch (e) { log("WARN: could not set page geometry — " + e); }

    try {
        doc.marginPreferences.top    = MARGIN;
        doc.marginPreferences.bottom = MARGIN;
        doc.marginPreferences.left   = MARGIN;
        doc.marginPreferences.right  = MARGIN;
        doc.marginPreferences.columnCount = 1;
    } catch (e) { log("WARN: could not set margins — " + e); }


    // ==============================================================
    // 3. SWATCHES
    // ==============================================================
    //
    // RGB deliberately: the source art is RGB and this document is judged
    // on screen and on a desktop print. The CMYK conversion belongs to the
    // business card later, through a profile — never hand-typed.

    var SW = {};
    for (var p = 0; p < PALETTE.length; p++) {
        var spec = PALETTE[p];
        var sw;
        try {
            sw = doc.colors.itemByName(spec.name);
            if (!sw.isValid) {
                sw = doc.colors.add({
                    name: spec.name,
                    model: ColorModel.PROCESS,
                    space: ColorSpace.RGB,
                    colorValue: spec.rgb
                });
            }
        } catch (e) {
            sw = doc.colors.add({
                name: spec.name,
                model: ColorModel.PROCESS,
                space: ColorSpace.RGB,
                colorValue: spec.rgb
            });
        }
        SW[spec.name] = sw;
    }
    log("Swatches built: " + PALETTE.length);


    // ==============================================================
    // 4. PARAGRAPH STYLES — the part that makes the comparison fair
    // ==============================================================
    //
    // Every candidate style is Based On a root style and overrides ONLY
    // the applied font. If you ever find yourself changing something else
    // on a candidate style, you have broken the comparison — that is the
    // built-in check.

    function setProps(obj, props, where) {
        for (var k in props) {
            if (!props.hasOwnProperty(k)) continue;
            try { obj[k] = props[k]; }
            catch (e) { log("WARN: " + where + "." + k + " rejected — " + e); }
        }
    }

    function makeStyle(name, basedOn, props) {
        var st;
        try {
            st = doc.paragraphStyles.itemByName(name);
            if (!st.isValid) st = doc.paragraphStyles.add({ name: name });
        } catch (e) {
            st = doc.paragraphStyles.add({ name: name });
        }
        if (basedOn) { try { st.basedOn = basedOn; } catch (e2) { log("WARN: basedOn " + name); } }
        setProps(st, props, name);
        return st;
    }

    var sRoot = makeStyle("_ROOT", null, {
        fillColor: SW["TS/Ink"],
        hyphenation: false,
        justification: Justification.LEFT_ALIGN
    });
    if (sans.matched) { try { sRoot.appliedFont = sans.name; } catch (e) {} }

    // Display: stacked title caps. Negative tracking, tight leading.
    var sDisplay = makeStyle("_ROOT/Display", sRoot, {
        pointSize: 340, leading: 300, tracking: -15,
        capitalization: Capitalization.ALL_CAPS
    });
    try { sDisplay.kerningMethod = "Optical"; } catch (e) { log("WARN: optical kerning unavailable"); }

    // Wordmark: single line, must fit the live width.
    var sWordmark = makeStyle("_ROOT/Wordmark", sRoot, {
        pointSize: 190, leading: 210, tracking: -10,
        capitalization: Capitalization.ALL_CAPS
    });
    try { sWordmark.kerningMethod = "Optical"; } catch (e) {}

    // Stat: the deciding plate. NOT all-caps — "g = 1.17" is the only
    // lowercase in the stat vocabulary and forcing caps destroys the test.
    var sStat = makeStyle("_ROOT/Stat", sRoot, {
        pointSize: 140, leading: 165, tracking: -20,
        capitalization: Capitalization.NORMAL
    });
    try { sStat.kerningMethod = "Optical"; } catch (e) {}
    try {
        sStat.otfFigureStyle = OTFFigureStyle.TABULAR_LINING;
    } catch (e) { log("WARN: could not force tabular lining figures — set them by hand in the OpenType panel"); }

    makeStyle("_ROOT/Subtitle", sRoot, {
        pointSize: 44, leading: 60, tracking: 300,
        capitalization: Capitalization.ALL_CAPS
    });

    makeStyle("_ROOT/DocNo", sRoot, {
        pointSize: 32, leading: 40, tracking: 120,
        capitalization: Capitalization.ALL_CAPS
    });

    makeStyle("_ROOT/Authority", sRoot, {
        pointSize: 28, leading: 38, tracking: 300,
        capitalization: Capitalization.ALL_CAPS,
        fillColor: SW["TS/Grey"]
    });

    makeStyle("_ROOT/Distribution", sRoot, {
        pointSize: 22, leading: 32, tracking: 80,
        capitalization: Capitalization.ALL_CAPS,
        fillColor: SW["TS/Grey"]
    });

    var sLabel = makeStyle("_ROOT/Label", sRoot, {
        pointSize: 20, leading: 26, tracking: 100,
        capitalization: Capitalization.ALL_CAPS,
        fillColor: SW["TS/Grey"]
    });

    var sAudit = makeStyle("_ROOT/Audit", sRoot, {
        pointSize: 22, leading: 32, tracking: 0,
        capitalization: Capitalization.NORMAL
    });
    if (mono.matched) { try { sAudit.appliedFont = mono.name; } catch (e) {} }

    // Small lines on the cover plate go in the mono if one exists.
    if (mono.matched) {
        try { doc.paragraphStyles.itemByName("_ROOT/DocNo").appliedFont = mono.name; } catch (e) {}
        try { doc.paragraphStyles.itemByName("_ROOT/Distribution").appliedFont = mono.name; } catch (e) {}
        try { sLabel.appliedFont = mono.name; } catch (e) {}
    }

    // Per-candidate styles: font family ONLY.
    for (var s = 0; s < CANDIDATES.length; s++) {
        var cand = CANDIDATES[s];
        cand.styles = {
            display:  makeStyle(cand.key + "/Display",  sDisplay,  {}),
            wordmark: makeStyle(cand.key + "/Wordmark", sWordmark, {}),
            stat:     makeStyle(cand.key + "/Stat",     sStat,     {})
        };
        if (cand.resolved.matched) {
            for (var k in cand.styles) {
                if (!cand.styles.hasOwnProperty(k)) continue;
                try { cand.styles[k].appliedFont = cand.resolved.name; }
                catch (e) { log("WARN: could not apply " + cand.resolved.name + " to " + cand.key + "/" + k); }
            }
        }
    }


    // ==============================================================
    // 5. LAYERS — so the candidate labels can be hidden for a blind pass
    // ==============================================================

    function layer(name) {
        var l;
        try {
            l = doc.layers.itemByName(name);
            if (!l.isValid) l = doc.layers.add({ name: name });
        } catch (e) { l = doc.layers.add({ name: name }); }
        return l;
    }
    var lyPaper  = layer("PAPER");
    var lyType   = layer("TYPE");
    var lyLabels = layer("LABELS");
    try { lyPaper.move(LocationOptions.AT_END); } catch (e) {}


    // ==============================================================
    // 6. PAGE BUILDERS
    // ==============================================================

    function paper(page) {
        var r = page.rectangles.add(lyPaper, {
            geometricBounds: [0, 0, CANVAS, CANVAS],
            fillColor: SW["TS/Paper"],
            strokeColor: doc.swatches.itemByName("None")
        });
        try { r.locked = true; } catch (e) {}
        return r;
    }

    function frame(page, bounds, content, styleName, layerRef) {
        var tf = page.textFrames.add(layerRef || lyType, { geometricBounds: bounds });
        tf.contents = content;
        try {
            tf.textFramePreferences.verticalJustification = VerticalJustification.TOP_ALIGN;
            tf.textFramePreferences.insetSpacing = [0, 0, 0, 0];
        } catch (e) {}
        try {
            tf.parentStory.appliedParagraphStyle = doc.paragraphStyles.itemByName(styleName);
        } catch (e) { log("WARN: style " + styleName + " not applied"); }
        return tf;
    }

    function slug(page, cand, plate) {
        var note = cand.resolved.matched
            ? cand.key + " · " + cand.resolved.name.replace("\t", " / ")
            : cand.key + " · NOT INSTALLED — " + cand.label;
        frame(page, [CANVAS - 70, LIVE_L, CANVAS - 30, LIVE_R],
              plate + "   " + note, "_ROOT/Label", lyLabels);
    }

    function rule(page, y, thickness, swatch) {
        var r = page.rectangles.add(lyType, {
            geometricBounds: [y, LIVE_L, y + thickness, LIVE_R],
            fillColor: swatch,
            strokeColor: doc.swatches.itemByName("None")
        });
        return r;
    }

    function newPage() {
        return doc.pages.add(LocationOptions.AT_END);
    }

    // ---- Plate 1: the wordmark ----
    function plate1(cand) {
        var pg = newPage(); paper(pg);
        frame(pg, [300, LIVE_L, 560, LIVE_R], TEXT.wordmark, cand.key + "/Wordmark");
        frame(pg, [700, LIVE_L, 1400, LIVE_R], TEXT.stack, cand.key + "/Display");
        slug(pg, cand, "PLATE 1 — WORDMARK");
        return pg;
    }

    // ---- Plate 2: the FM 21-76 cover structure ----
    function plate2(cand) {
        var pg = newPage(); paper(pg);
        frame(pg, [MARGIN, LIVE_L, MARGIN + 50, LIVE_L + 700], TEXT.docNo, "_ROOT/DocNo");
        rule(pg, MARGIN + 66, 3, SW["TS/Ink"]);
        frame(pg, [420, LIVE_L, 1020, LIVE_R], TEXT.stack, cand.key + "/Display");
        rule(pg, 1040, 10, SW["TS/Red"]);
        frame(pg, [1080, LIVE_L, 1160, LIVE_R], TEXT.subtitle, "_ROOT/Subtitle");
        rule(pg, 1330, 1, SW["TS/Hairline"]);
        frame(pg, [1355, LIVE_L, 1400, LIVE_R], TEXT.authority, "_ROOT/Authority");
        frame(pg, [1410, LIVE_L, 1480, LIVE_R], TEXT.distrib, "_ROOT/Distribution");
        slug(pg, cand, "PLATE 2 — COVER");
        return pg;
    }

    // ---- Plate 3: the numerals. This is the plate that decides it. ----
    function plate3(cand) {
        var pg = newPage(); paper(pg);
        frame(pg, [MARGIN, LIVE_L, MARGIN + 40, LIVE_R],
              "NUMERAL TORTURE TEST — % . ~ = - AND ONE LOWERCASE g",
              "_ROOT/Label");
        frame(pg, [200, LIVE_L, 1420, LIVE_R], TEXT.stats, cand.key + "/Stat");
        slug(pg, cand, "PLATE 3 — NUMERALS");
        return pg;
    }


    // ==============================================================
    // 7. BUILD
    // ==============================================================

    // The document was created with one page; reuse it as the audit page
    // at the end by moving it. Simplest reliable route: build plates,
    // then repurpose page 1.
    var firstPage = doc.pages.item(0);

    for (var b = 0; b < CANDIDATES.length; b++) {
        plate1(CANDIDATES[b]);
        plate2(CANDIDATES[b]);
        plate3(CANDIDATES[b]);
    }

    // Audit page = the original page 1, moved to the end.
    paper(firstPage);
    log("");
    log("PAGE MAP");
    for (var m = 0; m < CANDIDATES.length; m++) {
        var base = 1 + (m * 3);
        log("  " + CANDIDATES[m].key + "  pages " + base + ", " + (base + 1) + ", " + (base + 2)
            + "   (wordmark / cover / numerals)");
    }
    log("");
    log("HOW TO JUDGE — three rounds, not one");
    log("  Round 1: plates 1 and 2 only. Pick two survivors.");
    log("  Round 2: plate 3 for the survivors, then pair each with a mono.");
    log("  Round 3: the winning pair at real sizes.");
    log("");
    log("  Hide the LABELS layer for a blind pass.");
    log("  Judge on screen at 100%, printed on paper, AND at 32px.");
    log("");
    log("EVERY SIZE AND TRACKING VALUE IN THIS DOCUMENT IS A STARTING POINT.");
    log("They were eyeballed from the Ep01 render, not measured. Change them.");

    frame(firstPage, [MARGIN, LIVE_L, CANVAS - MARGIN, LIVE_R],
          report.join("\r"), "_ROOT/Audit");
    try { firstPage.move(LocationOptions.AT_END); } catch (e) {}

    try { doc.recompose(); } catch (e) {}


    // ==============================================================
    // 8. REPORT — say plainly what did and did not happen
    // ==============================================================

    var summary = "Told Straight type shootout built.\n\n"
        + doc.pages.length + " pages: " + CANDIDATES.length + " candidates x 3 plates, plus the audit page (last).\n\n";

    if (missing > 0) {
        summary += missing + " of " + CANDIDATES.length + " title candidates are NOT installed.\n"
                +  "Their pages were built but will render in a substituted face.\n"
                +  "See the audit page for exactly which, and what names were tried.\n\n";
    } else {
        summary += "All " + CANDIDATES.length + " title candidates resolved.\n\n";
    }

    if (!mono.matched) {
        summary += "No monospace font is activated. The cover's small lines\n"
                +  "fell back to the sans. Activate Letter Gothic Std or\n"
                +  "Orator Std and re-run to see the intended cover.\n\n";
    }

    summary += "Save this as a working file. Nothing here is a decision.";

    alert(summary);

})();
