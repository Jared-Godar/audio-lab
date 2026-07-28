/**
 * Told Straight — type shootout builder  (ILLUSTRATOR)   REVISION 2
 * ==================================================================
 * Revision 2, 2026-07-27, after run 1 produced an UNFAIR comparison.
 * Three defects found by running it, all fixed here:
 *
 *   1. SILENT WEIGHT DOWNGRADE.  Candidate A asked for
 *      UniversNextPro-CondBold, that exact name did not exist, and a
 *      prefix match quietly used UniversNextPro-Cond — the REGULAR
 *      weight — then reported "[OK]". A was judged as a light face
 *      pretending to be a bold. Same for B. Fixed: the script now
 *      enumerates every installed member of each family, prefers a
 *      bold/heavy cut explicitly, and SHOUTS on the artboard and in
 *      the audit when it had to settle for a lighter weight.
 *
 *   2. ROW 5 HAD NO ARTBOARDS.  "Illustrator error 1095724807
 *      ('CANT')" on artboards 0,4 / 1,4 / 2,4. The grid ran past
 *      Illustrator's canvas limit (227in square centred on the
 *      origin, i.e. +/-8172pt) — row 5's bottom edge sat at -8880pt.
 *      Artwork still drew, so it looked fine and would not have
 *      exported. Fixed: the grid is centred on the origin.
 *
 *   3. DISPLAY TEXT TRUNCATED SILENTLY.  Rows 4 and 5 read
 *      "TOLD STRAIGH" — area text oversets invisibly, so a face that
 *      is too wide HIDES that fact instead of showing it. Fixed:
 *      display lines are point text, which overhangs visibly, and the
 *      audit reports each one's measured width against the live area.
 *
 * Run 1 also produced one finding that stands regardless: Univers
 * Next Pro Condensed renders "SMD ~1.0" as "SMD ^1.0" — its tilde
 * sits high enough to read as a caret at display size. That is
 * exactly what Plate 3 exists to catch.
 *
 * TO RUN:  File > Scripts > Other Script...  and pick this file.
 * IT NEVER TOUCHES AN OPEN DOCUMENT. It always creates a new one.
 */

#target illustrator

(function () {

    // ==============================================================
    // WRONG-APP GUARD — read this before deleting it
    // ==============================================================
    //
    // The InDesign and Illustrator versions of this script differ by
    // ONE WORD in the filename. On 2026-07-27 the InDesign one was run
    // in Illustrator and died 224 lines deep at doc.colors.add() with
    // "Error 21: undefined is not an object" — a message naming
    // neither the cause nor the fix, after creating a stray document.

    var thisApp = "an unknown application";
    try { thisApp = String(app.name); } catch (e) {}

    if (thisApp.indexOf("Illustrator") === -1) {
        alert("WRONG APPLICATION\n\n"
            + "This is the ILLUSTRATOR version of the Told Straight type shootout.\n"
            + "You are running it in: " + thisApp + "\n\n"
            + "Run this file instead:\n"
            + "20260727-adobe-indesign-toldstraight-type-shootout-builder.jsx\n\n"
            + "Nothing was created or changed.");
        return;
    }


    // ==============================================================
    // 0. CONFIG
    // ==============================================================

    var AB      = 1600;   // artboard edge, pt. 1pt = 1px vs the Ep01 renders.
    var GUTTER  = 220;
    var MARGIN  = 96;     // live-area inset, 6% of the artboard
    var LIVE_W  = AB - (MARGIN * 2);   // 1408 pt

    // Illustrator's canvas is 227in square centred on the origin.
    var CANVAS_HALF = 8172;   // pt

    // MEASURED from episodes/ToldStraight-Ep01/*.png by pixel histogram,
    // 2026-07-27. The red is one canonical value across all three files.
    var PALETTE = {
        paper:    [237, 233, 224],   // #EDE9E0
        ink:      [ 17,  17,  17],   // #111111
        red:      [176,  42,  40],   // #B02A28
        grey:     [120, 116, 108],   // #78746C
        hairline: [200, 196, 186]    // #C8C4BA
    };

    // ---- CANDIDATES ----------------------------------------------
    //
    // `exact`   : known-good PostScript names, tried first, no warning.
    // `require` : ALL of these substrings must appear (case-insensitive).
    // `exclude` : any of these disqualifies a face.
    // `prefer`  : weight/width tokens in priority order. If none of them
    //             appear in any family member, the script uses what it
    //             found and marks the candidate WEIGHT-FALLBACK — the
    //             failure that made run 1 unfair.
    //
    // Every installed family member is listed on the audit board whether
    // the match succeeded or not, so the exact names can be pinned here
    // next revision instead of guessed at.

    var CANDIDATES = [
        { key: "A", label: "Univers Next Pro Condensed Bold",
          exact:   ["UniversNextPro-CondBold", "UniversNextPro-BoldCond",
                    "UniversNextPro-CondensedBold", "UniversNextPro-CondBd"],
          require: ["universnextpro", "cond"],
          exclude: ["italic", "oblique"],
          prefer:  ["condbold", "boldcond", "condbd", "bdcond", "bold", "bd", "heavy", "black"] },

        { key: "B", label: "Univers Next Pro Compressed Medium",
          exact:   ["UniversNextPro-CompMedium", "UniversNextPro-CompressedMedium",
                    "UniversNextPro-CompMed"],
          require: ["universnextpro", "comp"],
          exclude: ["italic", "oblique"],
          prefer:  ["compmedium", "compressedmedium", "compmed", "medium", "med", "bold", "bd"] },

        { key: "C", label: "Helvetica Neue LT Pro 77 Bold Condensed",
          exact:   ["HelveticaNeueLTPro-BdCn"],
          require: ["helveticaneueltpro"],
          exclude: ["italic", "oblique", "obl"],
          prefer:  ["bdcn", "boldcond", "bdcond", "blkcn", "bd", "bold"] },

        { key: "D", label: "Articulat Heavy CF",
          exact:   ["ArticulatCF-Heavy", "ArticulatHeavyCF-Heavy"],
          require: ["articulat"],
          exclude: ["italic", "oblique"],
          prefer:  ["heavy", "black", "bold"] },

        // E is THE CHOSEN FACE, 2026-07-27. Name confirmed by a
        // successful resolve in the Exhibit-cards run the same day —
        // not guessed. Adobe Fonts calls the family "Trade Gothic Next
        // LT Pro" (Monotype, 26 styles); the PostScript names use the
        // LTPro form, which is why the earlier "TradeGothicNext-Heavy"
        // patterns never matched.
        { key: "E", label: "Trade Gothic Next LT Pro Bold Condensed  ← CHOSEN",
          exact:   ["TradeGothicNextLTPro-BdCn"],
          require: ["tradegothicnext"],
          exclude: ["italic", "oblique"],
          prefer:  ["bdcn", "boldcond", "condbold"] },

        // F was "Heavy, full width" in revision 2 and found nothing —
        // the full-width cuts are not activated. Retargeted to Heavy
        // CONDENSED, which is a genuinely different candidate for the
        // cover: same family, one step heavier than the chosen face.
        { key: "F", label: "Trade Gothic Next LT Pro Heavy Condensed",
          exact:   ["TradeGothicNextLTPro-HvCn"],
          require: ["tradegothicnext"],
          exclude: ["italic", "oblique"],
          prefer:  ["hvcn", "heavycond", "condheavy", "blkcn"] }
    ];

    var SUPPORT = {
        sans:  ["UniversNextPro-Regular", "UniversNextPro", "HelveticaNeueLTPro-Roman",
                "HelveticaNeue", "Helvetica"],
        // Ordered by how right they are for a military medical record,
        // not by how likely they are to be installed.
        mono:  ["LetterGothicStd", "OratorStd", "CourierPrime", "Nitti",
                "IBMPlexMono", "SourceCodePro-Regular", "InputMono-Regular",
                "P22Typewriter-Regular", "CourierNewPSMT", "Courier"],
        serif: ["SourceSerif4-Regular", "SourceSerif4-Light", "SourceSerifPro-Regular",
                "Georgia", "TimesNewRomanPSMT"]
    };

    var TEXT = {
        wordmark:  "TOLD STRAIGHT",
        stack:     "TOLD\rSTRAIGHT",
        docNo:     "FM ADHD-01",
        subtitle:  "ADULT ADHD — SEASON ONE",
        authority: "DEPT. OF NEURODEVELOPMENTAL AFFAIRS",
        distrib:   "DISTRIBUTION RESTRICTION: APPROVED FOR PUBLIC RELEASE;\rDISTRIBUTION IS UNLIMITED.",
        // "g = 1.17" is the ONLY lowercase in the show's stat vocabulary.
        // Nothing here may be forced to caps or that test dies.
        stats:     "EST. 1775\r74%\r3-YR DELAY\r2.07x\rSMD ~1.0\rg = 1.17"
    };

    var ROLE = {
        wordmark: { size: 168, leading: 190, tracking: -10 },
        display:  { size: 300, leading: 268, tracking: -15 },
        stat:     { size: 132, leading: 158, tracking: -20 },
        subtitle: { size:  42, leading:  58, tracking: 300 },
        docNo:    { size:  30, leading:  40, tracking: 120 },
        authority:{ size:  26, leading:  36, tracking: 300 },
        distrib:  { size:  21, leading:  30, tracking:  80 },
        label:    { size:  19, leading:  25, tracking: 100 },
        audit:    { size:  19, leading:  27, tracking:   0 }
    };

    var report = [];
    function log(s) { report.push(s); }
    function pad(s, n) { s = String(s); while (s.length < n) s += " "; return s; }

    function rgb(t) { var c = new RGBColor(); c.red=t[0]; c.green=t[1]; c.blue=t[2]; return c; }
    var C = {
        paper: rgb(PALETTE.paper), ink: rgb(PALETTE.ink), red: rgb(PALETTE.red),
        grey: rgb(PALETTE.grey), hairline: rgb(PALETTE.hairline)
    };


    // ==============================================================
    // 1. FONT RESOLUTION — weight-aware, and loud about compromises
    // ==============================================================

    var installed = [];
    for (var fi = 0; fi < app.textFonts.length; fi++) installed.push(app.textFonts[fi].name);

    function hasExact(ps) {
        for (var i = 0; i < installed.length; i++) if (installed[i] === ps) return true;
        return false;
    }

    function familyMembers(require, exclude) {
        var out = [], i, j, nm, ok;
        for (i = 0; i < installed.length; i++) {
            nm = installed[i].toLowerCase();
            ok = true;
            for (j = 0; j < require.length; j++) {
                if (nm.indexOf(require[j]) === -1) { ok = false; break; }
            }
            if (ok && exclude) {
                for (j = 0; j < exclude.length; j++) {
                    if (nm.indexOf(exclude[j]) !== -1) { ok = false; break; }
                }
            }
            if (ok) out.push(installed[i]);
        }
        return out;
    }

    function resolve(cand) {
        var i, j;

        // 1. exact, known-good name — no warning
        for (i = 0; i < cand.exact.length; i++) {
            if (hasExact(cand.exact[i])) {
                return { name: cand.exact[i], how: "exact", downgraded: false,
                         family: familyMembers(cand.require, cand.exclude) };
            }
        }

        // 2. family search with an explicit weight preference
        var fam = familyMembers(cand.require, cand.exclude);
        if (!fam.length) {
            return { name: null, how: "missing", downgraded: false, family: [] };
        }
        for (i = 0; i < cand.prefer.length; i++) {
            for (j = 0; j < fam.length; j++) {
                if (fam[j].toLowerCase().indexOf(cand.prefer[i]) !== -1) {
                    // A hit on a low-priority token is still a weight
                    // compromise if the top tokens all missed. Flag it
                    // only when NO bold/heavy token was involved.
                    var tok = cand.prefer[i];
                    var isWeighty = (tok.indexOf("bold") !== -1 || tok.indexOf("bd") !== -1
                                  || tok.indexOf("heavy") !== -1 || tok.indexOf("hv") !== -1
                                  || tok.indexOf("black") !== -1 || tok.indexOf("blk") !== -1
                                  || tok.indexOf("medium") !== -1 || tok.indexOf("med") !== -1);
                    return { name: fam[j], how: "family/" + tok,
                             downgraded: !isWeighty, family: fam };
                }
            }
        }

        // 3. nothing preferred matched — THIS is what made run 1 unfair
        return { name: fam[0], how: "family/ANY", downgraded: true, family: fam };
    }

    function fontObj(ps) { if (!ps) return null; try { return app.textFonts.getByName(ps); } catch (e) { return null; } }

    log("TOLD STRAIGHT — type shootout font audit   REVISION 2");
    log("Built " + new Date().toString());
    log("Illustrator " + app.version + "   |   " + installed.length + " fonts installed");
    log("");
    log("WHY THERE IS A REVISION 2");
    log("  Run 1 judged candidates A and B in the WRONG WEIGHT. A prefix");
    log("  match silently used UniversNextPro-Cond (regular) where");
    log("  CondBold was asked for, and reported [OK]. Candidate C won a");
    log("  race two of its rivals were not actually running in.");
    log("");
    log("TITLE CANDIDATES");

    var missing = 0, downgraded = 0;
    for (var c = 0; c < CANDIDATES.length; c++) {
        var res = resolve(CANDIDATES[c]);
        CANDIDATES[c].resolved = res;

        if (!res.name) {
            missing++;
            log("  [MISSING]  " + CANDIDATES[c].key + "   " + CANDIDATES[c].label);
            log("             no installed face matches: " + CANDIDATES[c].require.join(" + "));
        } else if (res.downgraded) {
            downgraded++;
            log("  [!WEIGHT]  " + CANDIDATES[c].key + "   " + res.name);
            log("             WANTED: " + CANDIDATES[c].label);
            log("             No bold/heavy cut was found. THIS CANDIDATE IS");
            log("             NOT BEING TESTED AT ITS INTENDED WEIGHT.");
        } else {
            log("  [OK]       " + CANDIDATES[c].key + "   " + res.name + "   (" + res.how + ")");
        }

        if (res.family.length) {
            log("             family installed (" + res.family.length + "):");
            for (var q = 0; q < res.family.length && q < 18; q++) log("               " + res.family[q]);
            if (res.family.length > 18) log("               ... and " + (res.family.length - 18) + " more");
        }
        log("");
    }

    log("SUPPORTING FACES");
    function pickSupport(chain, roleName) {
        for (var i = 0; i < chain.length; i++) {
            if (hasExact(chain[i])) { log("  " + pad(roleName, 6) + ": " + chain[i]); return chain[i]; }
        }
        log("  " + pad(roleName, 6) + ": NONE FOUND");
        return null;
    }
    var psSans  = pickSupport(SUPPORT.sans,  "sans");
    var psMono  = pickSupport(SUPPORT.mono,  "mono");
    var psSerif = pickSupport(SUPPORT.serif, "serif");

    if (psMono && psMono.indexOf("LetterGothic") === -1 && psMono.indexOf("Orator") === -1) {
        log("");
        log("  NOTE: " + psMono + " is a monospace, but it is a CODE face, not a");
        log("  typewriter face. The v1 Ep01 form fields and citations read as");
        log("  typed paperwork. Activate Letter Gothic Std or Orator Std for the");
        log("  mono round — Creative Cloud desktop app > Fonts > Browse fonts.");
    }
    log("");

    var fSans  = fontObj(psSans);
    var fMono  = fontObj(psMono);
    var fSmall = fMono || fSans;


    // ==============================================================
    // 2. DOCUMENT + CENTRED ARTBOARD GRID
    // ==============================================================

    var PLATES = ["WORDMARK", "COVER", "NUMERALS"];
    var COLS   = PLATES.length + 1;              // + the audit board
    var ROWS   = CANDIDATES.length;

    var GRID_W = COLS * AB + (COLS - 1) * GUTTER;
    var GRID_H = ROWS * AB + (ROWS - 1) * GUTTER;
    var ORIGIN_X = -GRID_W / 2;
    var ORIGIN_Y =  GRID_H / 2;

    var overrun = (GRID_H / 2 > CANVAS_HALF) || (GRID_W / 2 > CANVAS_HALF);

    var doc = app.documents.add(DocumentColorSpace.RGB, AB, AB);
    try { doc.rulerUnits = RulerUnits.Points; } catch (e) {}

    function cellRect(col, row) {
        var l = ORIGIN_X + col * (AB + GUTTER);
        var t = ORIGIN_Y - row * (AB + GUTTER);
        return [l, t, l + AB, t - AB];
    }

    var abFail = 0;
    try { doc.artboards[0].artboardRect = cellRect(0, 0); }
    catch (e) { abFail++; log("WARN: artboard 0,0 — " + e); }

    for (var r = 0; r < ROWS; r++) {
        for (var col = 0; col < COLS; col++) {
            if (r === 0 && col === 0) continue;
            if (col === PLATES.length && r !== 0) continue;   // audit board: top row only
            try {
                var ab = doc.artboards.add(cellRect(col, r));
                if (col < PLATES.length) {
                    try { ab.name = CANDIDATES[r].key + "-" + PLATES[col].toLowerCase(); } catch (e9) {}
                } else {
                    try { ab.name = "AUDIT"; } catch (e9) {}
                }
            } catch (e2) { abFail++; log("WARN: artboard " + col + "," + r + " — " + e2); }
        }
    }
    if (abFail === 0) log("All " + doc.artboards.length + " artboards created inside the canvas limit.");
    log("");


    // ==============================================================
    // 3. LAYERS
    // ==============================================================

    function layer(name) {
        var l; try { l = doc.layers.getByName(name); } catch (e) { l = doc.layers.add(); l.name = name; } return l;
    }
    var lyLabels = layer("LABELS");
    var lyType   = layer("TYPE");
    var lyPaper  = layer("PAPER");
    try { lyPaper.zOrder(ZOrderMethod.SENDTOBACK); } catch (e) {}


    // ==============================================================
    // 4. STYLES
    // ==============================================================
    //
    // Illustrator has no Based-On inheritance, so the fairness guarantee
    // is structural: PARAGRAPH styles carry the role (size, leading,
    // tracking); CHARACTER styles carry ONLY the face. Edit a role once
    // and every candidate moves together. Never put a size on a FACE/
    // style or a font on a ROLE/ style.

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
    function charStyle(name, font) {
        var st; try { st = doc.characterStyles.getByName(name); } catch (e) { st = doc.characterStyles.add(name); }
        if (font) { try { st.characterAttributes.textFont = font; } catch (e2) {} }
        return st;
    }

    var PS = {
        wordmark:  paraStyle("ROLE/Wordmark",  ROLE.wordmark,  C.ink,  fSans,  Justification.LEFT),
        display:   paraStyle("ROLE/Display",   ROLE.display,   C.ink,  fSans,  Justification.LEFT),
        stat:      paraStyle("ROLE/Stat",      ROLE.stat,      C.ink,  fSans,  Justification.LEFT),
        subtitle:  paraStyle("ROLE/Subtitle",  ROLE.subtitle,  C.ink,  fSans,  Justification.LEFT),
        docNo:     paraStyle("ROLE/DocNo",     ROLE.docNo,     C.ink,  fSmall, Justification.LEFT),
        authority: paraStyle("ROLE/Authority", ROLE.authority, C.grey, fSans,  Justification.LEFT),
        distrib:   paraStyle("ROLE/Distrib",   ROLE.distrib,   C.grey, fSmall, Justification.LEFT),
        label:     paraStyle("ROLE/Label",     ROLE.label,     C.grey, fSmall, Justification.LEFT),
        warn:      paraStyle("ROLE/Warn",      ROLE.label,     C.red,  fSmall, Justification.LEFT),
        audit:     paraStyle("ROLE/Audit",     ROLE.audit,     C.ink,  fSmall, Justification.LEFT)
    };

    for (var s = 0; s < CANDIDATES.length; s++) {
        CANDIDATES[s].font  = fontObj(CANDIDATES[s].resolved.name);
        CANDIDATES[s].style = charStyle("FACE/" + CANDIDATES[s].key, CANDIDATES[s].font);
    }


    // ==============================================================
    // 5. DRAWING
    // ==============================================================

    function dx(col, x) { return ORIGIN_X + col * (AB + GUTTER) + x; }
    function dy(row, y) { return ORIGIN_Y - row * (AB + GUTTER) - y; }

    function paper(col, row) {
        var r = lyPaper.pathItems.rectangle(dy(row, 0), dx(col, 0), AB, AB);
        r.filled = true; r.fillColor = C.paper; r.stroked = false; return r;
    }
    function bar(col, row, y, thick, colour, inset) {
        var x = (inset === undefined) ? MARGIN : inset;
        var r = lyType.pathItems.rectangle(dy(row, y), dx(col, x), AB - (x * 2), thick);
        r.filled = true; r.fillColor = colour; r.stroked = false; return r;
    }

    // Area text — for anything that SHOULD wrap.
    function areaText(col, row, y, h, content, style, lyr) {
        var host = (lyr || lyType);
        var box = host.pathItems.rectangle(dy(row, y), dx(col, MARGIN), LIVE_W, h);
        var tf;
        try { tf = host.textFrames.areaText(box); } catch (e) { log("WARN: areaText — " + e); return null; }
        tf.contents = content;
        try { style.applyTo(tf.textRange, true); } catch (e2) {}
        return tf;
    }

    // POINT text — for display lines. Cannot overset, so a face that is
    // too wide overhangs the live area VISIBLY instead of vanishing.
    // Returns the measured width so the audit can report the overhang.
    function pointText(col, row, y, content, pStyle, cStyle) {
        var tf;
        try { tf = lyType.textFrames.add(); } catch (e) { log("WARN: pointText — " + e); return null; }
        tf.contents = content;
        try { pStyle.applyTo(tf.textRange, true); } catch (e2) {}
        if (cStyle) { try { cStyle.applyTo(tf.textRange, true); } catch (e3) {} }
        try { tf.left = dx(col, MARGIN); tf.top = dy(row, y); } catch (e4) {}
        return tf;
    }


    // ==============================================================
    // 6. PLATES
    // ==============================================================

    var widthNotes = [];

    function slug(col, row, cand, plateName) {
        var res = cand.resolved;
        var line, style;
        if (!res.name) {
            line = cand.key + "  ·  NOT INSTALLED — " + cand.label;  style = PS.warn;
        } else if (res.downgraded) {
            line = cand.key + "  ·  " + res.name + "  ·  ⚠ WRONG WEIGHT — wanted " + cand.label;
            style = PS.warn;
        } else {
            line = cand.key + "  ·  " + res.name;  style = PS.label;
        }
        areaText(col, row, AB - 76, 46, plateName + "   " + line, style, lyLabels);
    }

    function plateWordmark(col, row, cand) {
        paper(col, row);
        pointText(col, row, 300, TEXT.wordmark, PS.wordmark, cand.style);
        var tf = pointText(col, row, 700, TEXT.stack, PS.display, cand.style);
        if (tf) {
            var w = 0; try { w = Math.round(tf.width); } catch (e) {}
            var over = w - LIVE_W;
            widthNotes.push("  " + cand.key + "  display width " + pad(w + "pt", 8)
                + " vs live " + LIVE_W + "pt   "
                + (over > 0 ? ("OVERHANGS by " + over + "pt") : ("fits, " + (-over) + "pt spare")));
        }
        slug(col, row, cand, "PLATE 1 — WORDMARK");
    }

    function plateCover(col, row, cand) {
        paper(col, row);
        areaText(col, row, MARGIN, 46, TEXT.docNo, PS.docNo);
        bar(col, row, MARGIN + 62, 3, C.ink);
        pointText(col, row, 430, TEXT.stack, PS.display, cand.style);
        bar(col, row, 1046, 10, C.red);
        areaText(col, row, 1086, 80, TEXT.subtitle, PS.subtitle);
        bar(col, row, 1330, 1, C.hairline);
        areaText(col, row, 1356, 46, TEXT.authority, PS.authority);
        areaText(col, row, 1412, 76, TEXT.distrib,   PS.distrib);
        slug(col, row, cand, "PLATE 2 — COVER");
    }

    function plateNumerals(col, row, cand) {
        paper(col, row);
        areaText(col, row, MARGIN, 40,
                 "NUMERAL TORTURE TEST  —  %  .  ~  =  -  AND ONE LOWERCASE g",
                 PS.label);
        pointText(col, row, 210, TEXT.stats, PS.stat, cand.style);
        slug(col, row, cand, "PLATE 3 — NUMERALS");
    }


    // ==============================================================
    // 7. BUILD
    // ==============================================================

    for (var rr = 0; rr < CANDIDATES.length; rr++) {
        plateWordmark(0, rr, CANDIDATES[rr]);
        plateCover(1, rr, CANDIDATES[rr]);
        plateNumerals(2, rr, CANDIDATES[rr]);
    }

    log("MEASURED DISPLAY WIDTHS  (\"TOLD / STRAIGHT\" at " + ROLE.display.size + "pt)");
    for (var wn = 0; wn < widthNotes.length; wn++) log(widthNotes[wn]);
    log("");
    log("  A face that overhangs is not disqualified — it means that face");
    log("  needs a smaller display size, which is a real cost to weigh.");
    log("");

    log("ARTBOARD MAP  (" + PLATES.length + " plate columns x " + ROWS + " candidate rows)");
    log("  column 1 = PLATE 1 wordmark     column 2 = PLATE 2 cover");
    log("  column 3 = PLATE 3 numerals     column 4 = this audit board");
    for (var mm = 0; mm < CANDIDATES.length; mm++) {
        log("  row " + (mm + 1) + "  " + CANDIDATES[mm].key + "   " + CANDIDATES[mm].label);
    }
    log("");
    log("WHAT RUN 1 ALREADY ESTABLISHED — do not re-derive");
    log("  · Univers Next Pro Condensed renders \"SMD ~1.0\" as \"SMD ^1.0\".");
    log("    Its tilde sits at caret height. Real strike against A, and it");
    log("    is independent of the weight bug.");
    log("  · The maintainer picked C on all three plates in run 1, against");
    log("    a field where A and B ran at the wrong weight and E was absent.");
    log("    This run is the fair rematch. If C wins again it is settled.");
    log("");
    log("HOW TO JUDGE — three rounds, not one");
    log("  Round 1: columns 1 and 2. Scan DOWN a column. Pick two survivors.");
    log("  Round 2: column 3 for the survivors, then pair each with a mono.");
    log("  Round 3: the winning pair at real sizes.");
    log("  Hide the LABELS layer for a blind pass.");
    log("  Judge on screen at 100%, printed on paper, AND at 32px.");
    log("");
    log("TO CHANGE THINGS GLOBALLY");
    log("  Window > Type > Paragraph Styles — ROLE/* carry size, leading,");
    log("    tracking. Edit one, every candidate moves together.");
    log("  Window > Type > Character Styles — FACE/* carry ONLY the face.");
    log("");
    log("EVERY SIZE AND TRACKING VALUE HERE IS A STARTING POINT.");
    log("Eyeballed from the Ep01 render, not measured (the pixel");
    log("measurement was refused by the repo lane guard — issue #56).");

    paper(PLATES.length, 0);
    areaText(PLATES.length, 0, MARGIN, AB - (MARGIN * 2), report.join("\r"), PS.audit);

    try { app.executeMenuCommand("fitall"); } catch (e) {}


    // ==============================================================
    // 8. REPORT
    // ==============================================================

    var summary = "Told Straight type shootout — REVISION 2\n\n"
        + doc.artboards.length + " artboards: " + ROWS + " candidates x "
        + PLATES.length + " plates, plus the audit board.\n"
        + "Grid centred on the origin — no canvas overrun this time.\n\n";

    if (overrun) {
        summary += "WARNING: the grid still exceeds Illustrator's canvas limit.\n"
                +  "Reduce GUTTER or the candidate count.\n\n";
    }
    if (abFail) {
        summary += abFail + " artboard(s) still failed — see the audit board.\n\n";
    }
    if (missing) {
        summary += missing + " candidate(s) NOT INSTALLED. Their rows are marked in red.\n\n";
    }
    if (downgraded) {
        summary += downgraded + " candidate(s) resolved to the WRONG WEIGHT and are\n"
                +  "marked in red on their artboards. Do not judge those rows —\n"
                +  "the audit board lists every installed face in each family so\n"
                +  "the correct PostScript name can be pinned in CANDIDATES.exact.\n\n";
    }
    if (!missing && !downgraded && !abFail) {
        summary += "All " + ROWS + " candidates resolved at their intended weight.\n"
                +  "This is a fair comparison. Judge away.\n\n";
    }

    summary += "Nothing here is a decision.";

    alert(summary);

})();
