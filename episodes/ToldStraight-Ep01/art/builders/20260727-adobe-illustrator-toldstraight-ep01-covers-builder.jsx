/**
 * Told Straight — Ep01 covers + show cover  (ILLUSTRATOR)
 * ==================================================================
 * Completes the Ep01 asset re-set called for by issue #60 as
 * re-scoped 2026-07-27. The six Exhibit cards have their own builder;
 * this one produces the three remaining assets.
 *
 * FOUR ARTBOARDS, and two of them are a CHOICE for the maintainer:
 *
 *   1  EP01 COVER — VARIANT A "intake form"   1600 x 1600
 *      The v1 composition, re-set in the chosen faces. This is
 *      literally "wrap the original draft with the new typography".
 *
 *   2  EP01 COVER — VARIANT B "field manual"  1600 x 1600
 *      The same content rebuilt in the FM 21-76 / military medical
 *      record structure: document number, stacked title, rule zones,
 *      CAUTION box, issuing authority, distribution line.
 *
 *   3  SHOW COVER                             3000 x 3000
 *      Series level, not episode level. Deliberately sparse — it has
 *      to survive being 55px wide in a podcast app.
 *
 *   4  AUDIT                                  1600 x 1600
 *
 * A and B are not drafts of each other. Pick one; the loser informs
 * the other assets rather than being thrown away.
 *
 * TO RUN:  File > Scripts > Other Script...  and pick this file.
 * IT NEVER TOUCHES AN OPEN DOCUMENT. It always creates a new one.
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
            + "This is an ILLUSTRATOR script (Told Straight Ep01 covers).\n"
            + "You are running it in: " + thisApp + "\n\n"
            + "Open Adobe Illustrator and run it from File > Scripts > Other Script...\n\n"
            + "Nothing was created or changed.");
        return;
    }


    // ==============================================================
    // 0. FACES — pinned from the shootout, 2026-07-27
    // ==============================================================

    var FACE = {
        title: "TradeGothicNextLTPro-BdCn",   // chosen candidate E
        label: null,                          // caption / secondary — see SEARCH
        mono:  "LetterGothicStd"              // form fields, stamps, citations
    };

    var SEARCH = {
        title: [
            { require: ["tradegothicnext"], exclude: ["italic", "oblique"],
              prefer: ["bdcn", "boldcond", "condbold", "hvcn"] },
            { require: ["helveticaneueltpro"], exclude: ["italic", "oblique", "obl"],
              prefer: ["bdcn", "blkcn"] }
        ],
        label: [
            // The SAME family at full width, so the whole system is one
            // typeface at two widths — the DoD manual idiom, not a
            // second family.
            //
            // NOTE the excludeSuffix. Excluding "cn" against the FULL
            // PostScript name killed every Trade Gothic Next face,
            // because "TradeGothicNextLTPro-Bd" contains "cn" inside
            // "gothiCNext". That is why the caption kept resolving to
            // Univers even after the full-width cuts were activated.
            // excludeSuffix tests only the style part after the last
            // hyphen, which is where width and slope actually live.
            { require: ["tradegothicnext"], exclude: ["italic", "oblique"],
              excludeSuffix: ["cn", "cond", "comp", "it", "obl"],
              prefer: ["bold", "bd", "heavy", "hv"] },
            { require: ["universnextpro"], exclude: ["italic", "oblique"],
              excludeSuffix: ["cond", "comp", "it", "obl"],
              prefer: ["bold", "bd", "heavy"] },
            { require: ["helveticaneueltpro"], exclude: ["italic", "oblique"],
              excludeSuffix: ["cn", "ex", "it", "obl"],
              prefer: ["bd", "bold"] }
        ],
        mono: [
            { require: ["lettergothic"],  exclude: ["italic", "oblique"], prefer: ["std", "bold", "medium"] },
            { require: ["oratorstd"],     exclude: ["italic", "oblique"], prefer: ["std", "medium"] },
            { require: ["courierprime"],  exclude: ["italic", "oblique"], prefer: ["regular", "prime"] },
            { require: ["sourcecodepro"], exclude: ["italic", "oblique"], prefer: ["regular"] },
            { require: ["courier"],       exclude: ["italic", "oblique"], prefer: ["regular", "psmt"] }
        ]
    };

    var EXPORT_PNG = false;
    var EXPORT_DIR = "~/Code/audio-lab/output/artwork/ep01-v2";


    // ==============================================================
    // 1. CONTENT
    // ==============================================================
    //
    // Variant A is transcribed from episodes/ToldStraight-Ep01/alt-text.md
    // — the only surviving record of the v1 cover, whose source file and
    // fonts are unrecoverable (all three PNGs carry zero metadata).

    var A = {
        formNo:    "FORM ADHD-01",
        authority: "DEPT. OF NEURODEVELOPMENTAL AFFAIRS",
        title1:    "MEMBERSHIP",
        title2:    "HAS",
        title3:    "REQUIREMENTS",
        subtitle:  "ADULT ADHD — TOLD STRAIGHT",
        fields: [
            { k: "MEMBER:",      v: "[ YOU ]" },
            { k: "STATUS:",      v: "DIAGNOSED — CONFIRMED" },
            { k: "ESTABLISHED:", v: "1775 (OLDER THAN THE U.S.)" }
        ],
        stamp:   "MEMBER",
        foot1:   "PODCAST",
        foot2:   "TOLD STRAIGHT / EP.01"
    };

    var B = {
        docNo:     "FM ADHD-01",
        edition:   "SEASON ONE · EPISODE 01",
        title1:    "TOLD",
        title2:    "STRAIGHT",
        subtitle:  "MEMBERSHIP HAS REQUIREMENTS",
        caution:   "CAUTION",
        // Item 3 is not decoration. Issue #60 §5 requires that wherever
        // the synthetic co-host appears, the fact is STATED. A numbered
        // restriction box is native to this design vocabulary, so the
        // disclosure becomes a design element rather than a disclaimer.
        rules: [
            "1. THIS FILE CONTAINS EVIDENCE. IT IS NOT MEDICAL ADVICE.",
            "2. EVERY FIGURE CARRIES ITS SOURCE. CHECK THEM.",
            "3. ONE VOICE IN THIS RECORDING IS SYNTHETIC AND IS IDENTIFIED AS SUCH.",
            "4. IF FOUND, PASS IT ON."
        ],
        authority: "DEPT. OF NEURODEVELOPMENTAL AFFAIRS",
        distrib:   "DISTRIBUTION RESTRICTION: APPROVED FOR PUBLIC RELEASE; DISTRIBUTION IS UNLIMITED."
    };

    var SHOW = {
        docNo:     "FM ADHD",
        title1:    "TOLD",
        title2:    "STRAIGHT",
        subtitle:  "SEASON ONE — ADULT ADHD",
        authority: "DEPT. OF NEURODEVELOPMENTAL AFFAIRS"
    };


    // ==============================================================
    // 2. GEOMETRY + PALETTE
    // ==============================================================

    var EP     = 1600;    // episode cover / audit edge
    var SHOWSZ = 3000;    // show cover edge
    var GUTTER = 220;
    var M      = 96;      // live-area inset on a 1600 board (6%)

    // MEASURED from episodes/ToldStraight-Ep01/*.png by pixel histogram,
    // 2026-07-27. The red is ONE canonical value across all three files.
    var PALETTE = {
        paper:    [237, 233, 224],   // #EDE9E0
        ink:      [ 17,  17,  17],   // #111111
        red:      [176,  42,  40],   // #B02A28
        grey:     [120, 116, 108],   // #78746C
        hairline: [200, 196, 186]    // #C8C4BA
    };

    var report = [];
    function log(s) { report.push(s); }
    function rgb(t) { var c = new RGBColor(); c.red=t[0]; c.green=t[1]; c.blue=t[2]; return c; }
    var C = {
        paper: rgb(PALETTE.paper), ink: rgb(PALETTE.ink), red: rgb(PALETTE.red),
        grey: rgb(PALETTE.grey), hairline: rgb(PALETTE.hairline)
    };


    // ==============================================================
    // 3. FONT RESOLUTION — loud about any compromise
    // ==============================================================

    var installed = [];
    for (var fi = 0; fi < app.textFonts.length; fi++) installed.push(app.textFonts[fi].name);

    function has(ps) {
        for (var i = 0; i < installed.length; i++) if (installed[i] === ps) return true;
        return false;
    }
    // `exclude` tests the whole PostScript name. `excludeSuffix` tests
    // ONLY the style part after the last hyphen — necessary because a
    // family name can contain a width token by accident
    // ("TradeGothicNextLTPro-Bd" contains "cn" inside "gothiCNext"),
    // which silently emptied the match set on 2026-07-27.
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
                for (j = 0; j < excludeSuffix.length; j++) {
                    if (suf.indexOf(excludeSuffix[j]) !== -1) { ok = false; break; }
                }
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

    log("TOLD STRAIGHT — Ep01 covers + show cover");
    log("Built " + new Date().toString());
    log("Illustrator " + app.version + "  |  " + installed.length + " fonts installed");
    log("");
    log("FONTS RESOLVED");
    var psTitle = resolveRole("title", FACE.title, SEARCH.title);
    var psLabel = resolveRole("label", FACE.label, SEARCH.label);
    var psMono  = resolveRole("mono ", FACE.mono,  SEARCH.mono);
    log("");
    if (psLabel && psLabel.toLowerCase().indexOf("tradegothic") === -1) {
        log("  NOTE: the caption face is " + psLabel + " — a SECOND grotesque");
        log("  family beside Trade Gothic Next. Defensible as a pairing, but it");
        log("  is currently an accident rather than a decision: only the");
        log("  CONDENSED cuts of Trade Gothic Next LT Pro are activated, so the");
        log("  full-width Bold cannot be found. Activate it and this resolves");
        log("  into one family at two widths — the DoD manual idiom.");
        log("");
    }
    var fTitle = fontObj(psTitle), fLabel = fontObj(psLabel), fMono = fontObj(psMono);


    // ==============================================================
    // 4. DOCUMENT + ARTBOARDS  (mixed sizes, laid out left to right)
    // ==============================================================

    var doc = app.documents.add(DocumentColorSpace.RGB, EP, EP);
    try { doc.rulerUnits = RulerUnits.Points; } catch (e) {}

    // Each board records its own origin so drawing helpers stay simple.
    var BOARDS = [];
    var cursorX = 0;
    function addBoard(name, size) {
        var left = cursorX, top = size / 2;      // vertically centred on y=0
        var rect = [left, top, left + size, top - size];
        var ab;
        if (BOARDS.length === 0) {
            ab = doc.artboards[0];
            try { ab.artboardRect = rect; } catch (e) { log("WARN: artboard " + name + " — " + e); }
        } else {
            try { ab = doc.artboards.add(rect); }
            catch (e2) { log("WARN: artboard " + name + " — " + e2); ab = null; }
        }
        if (ab) { try { ab.name = name; } catch (e3) {} }
        var b = { name: name, size: size, x: left, y: top };
        BOARDS.push(b);
        cursorX += size + GUTTER;
        return b;
    }

    var bA     = addBoard("ep01-cover-A-intake-form", EP);
    var bB     = addBoard("ep01-cover-B-field-manual", EP);
    var bShow  = addBoard("show-cover-3000", SHOWSZ);
    var bAudit = addBoard("AUDIT", EP);

    function layer(name) {
        var l; try { l = doc.layers.getByName(name); } catch (e) { l = doc.layers.add(); l.name = name; } return l;
    }
    var lyType  = layer("TYPE");
    var lyRules = layer("RULES");
    var lyPaper = layer("PAPER");
    try { lyPaper.zOrder(ZOrderMethod.SENDTOBACK); } catch (e) {}


    // ==============================================================
    // 5. STYLES
    // ==============================================================

    function paraStyle(name, size, leading, tracking, colour, font, justify) {
        var st; try { st = doc.paragraphStyles.getByName(name); } catch (e) { st = doc.paragraphStyles.add(name); }
        try {
            var ca = st.characterAttributes;
            ca.size = size; ca.leading = leading; ca.tracking = tracking; ca.autoLeading = false;
            if (colour) ca.fillColor = colour;
            if (font) ca.textFont = font;
            if (justify !== undefined) st.paragraphAttributes.justification = justify;
        } catch (e2) { log("WARN: style " + name + " — " + e2); }
        return st;
    }

    var L = Justification.LEFT, R = Justification.RIGHT, CTR = Justification.CENTER;

    var PS = {
        // --- variant A, the intake form ---
        aHead:    paraStyle("A/Head",     30,  40,  140, C.ink,  fMono,  L),
        aHeadR:   paraStyle("A/HeadRight",30,  40,  140, C.grey, fMono,  R),
        /* 250pt overset "REQUIREMENTS" to "REQUIREMENT" in the first run —
           area text drops the tail silently, so the longest word in the
           composition decides this size, not the average one. 225pt with a
           wider box clears it. */
        aBig:     paraStyle("A/TitleBig", 225, 218, -18, C.ink,  fTitle, CTR),
        aMid:     paraStyle("A/TitleMid", 150, 160, -12, C.ink,  fTitle, CTR),
        aSub:     paraStyle("A/Subtitle",  40,  56, 300, C.ink,  fMono,  CTR),
        aFieldK:  paraStyle("A/FieldKey",  32,  44, 140, C.grey, fMono,  L),
        aFieldV:  paraStyle("A/FieldVal",  32,  44,  60, C.ink,  fMono,  L),
        aStamp:   paraStyle("A/Stamp",     96, 100,  40, C.red,  fTitle, CTR),
        aFoot1:   paraStyle("A/Foot1",     24,  32, 140, C.grey, fMono,  L),
        aFoot2:   paraStyle("A/Foot2",     28,  38, 140, C.ink,  fMono,  L),

        // --- variant B, the field manual ---
        bDoc:     paraStyle("B/DocNo",     34,  46, 160, C.ink,  fMono,  L),
        bEd:      paraStyle("B/Edition",   26,  36, 200, C.grey, fMono,  R),
        bTitle:   paraStyle("B/Title",    310, 280, -18, C.ink,  fTitle, L),
        bSub:     paraStyle("B/Subtitle",  54,  70, 180, C.ink,  fLabel, L),
        bCaution: paraStyle("B/Caution",   34,  46, 240, C.red,  fTitle, L),
        bRule:    paraStyle("B/Rules",     24,  38,  60, C.ink,  fMono,  L),
        bAuth:    paraStyle("B/Authority", 26,  36, 260, C.grey, fMono,  L),
        bDist:    paraStyle("B/Distrib",   20,  30,  80, C.grey, fMono,  L),

        // --- show cover, scaled for 3000 ---
        /* Wordmark pushed 620 -> 730 to close the dead band the first run
           left between the subtitle and the foot rule. At 730pt
           "STRAIGHT" measures roughly 2,600pt against a 2,640pt live
           width — deliberately near the edge, because on a show cover
           the wordmark filling the measure IS the design. If it
           overhangs, drop to 700 rather than re-tracking. */
        sDoc:     paraStyle("S/DocNo",     64,  84, 200, C.ink,  fMono,  L),
        sTitle:   paraStyle("S/Title",    730, 660, -22, C.ink,  fTitle, L),
        sSub:     paraStyle("S/Subtitle", 118, 155, 240, C.ink,  fMono,  L),
        sAuth:    paraStyle("S/Authority", 50,  66, 260, C.grey, fMono,  L),

        audit:    paraStyle("AUDIT/Text",  19,  27,   0, C.ink,  fMono,  L)
    };


    // ==============================================================
    // 6. DRAWING HELPERS — board-local coordinates, y down from the top
    // ==============================================================

    function px(b, x) { return b.x + x; }
    function py(b, y) { return b.y - y; }

    function paper(b) {
        var r = lyPaper.pathItems.rectangle(py(b, 0), px(b, 0), b.size, b.size);
        r.filled = true; r.fillColor = C.paper; r.stroked = false; return r;
    }
    function bar(b, y, x, w, thick, colour) {
        var r = lyRules.pathItems.rectangle(py(b, y), px(b, x), w, thick);
        r.filled = true; r.fillColor = colour; r.stroked = false; return r;
    }
    function keyline(b, inset, weight) {
        var r = lyRules.pathItems.rectangle(py(b, inset), px(b, inset),
                                            b.size - inset * 2, b.size - inset * 2);
        r.filled = false; r.stroked = true; r.strokeColor = C.ink; r.strokeWidth = weight; return r;
    }
    // Area text — wraps. Use for anything multi-line or long.
    function area(b, y, x, w, h, content, style) {
        var box = lyType.pathItems.rectangle(py(b, y), px(b, x), w, h);
        var tf;
        try { tf = lyType.textFrames.areaText(box); } catch (e) { log("WARN: area — " + e); return null; }
        tf.contents = content;
        try { style.applyTo(tf.textRange, true); } catch (e2) {}
        return tf;
    }
    // Point text — cannot overset, so an over-wide line overhangs visibly.
    function point(b, y, x, content, style) {
        var tf;
        try { tf = lyType.textFrames.add(); } catch (e) { log("WARN: point — " + e); return null; }
        tf.contents = content;
        try { style.applyTo(tf.textRange, true); } catch (e2) {}
        try { tf.left = px(b, x); tf.top = py(b, y); } catch (e3) {}
        return tf;
    }


    // ==============================================================
    // 7. VARIANT A — the intake form, v1 composition in the new faces
    // ==============================================================

    (function buildA() {
        var b = bA, W = EP - M * 2;
        paper(b);
        keyline(b, 44, 7);

        area(b, M + 14, M + 24, W - 48, 44, A.formNo,    PS.aHead);
        area(b, M + 14, M + 24, W - 48, 44, A.authority, PS.aHeadR);
        bar(b, M + 74, M + 24, W - 48, 3, C.ink);

        // Title stack. Line 2 deliberately smaller — the v1 cover sets
        // "HAS" as a hinge between two long words, not as a third line
        // of equal weight.
        /* Boxes run wider than the live area on purpose: the keyline is at
           44pt, so the type may breathe to 60pt without touching it, and
           "REQUIREMENTS" needs every point of it. */
        var TW = EP - 120;
        area(b, 310, 60, TW, 250, A.title1, PS.aBig);
        area(b, 540, 60, TW, 180, A.title2, PS.aMid);
        area(b, 700, 60, TW, 250, A.title3, PS.aBig);
        bar(b, 950, M + 20, W - 40, 9, C.red);

        area(b, 1030, M, W, 70, A.subtitle, PS.aSub);

        // Form field rows, each on a hairline.
        var fy = 1150;
        for (var i = 0; i < A.fields.length; i++) {
            area(b, fy, M + 30, 340, 48, A.fields[i].k, PS.aFieldK);
            area(b, fy, M + 400, W - 430, 48, A.fields[i].v, PS.aFieldV);
            bar(b, fy + 60, M + 30, W - 60, 1, C.hairline);
            fy += 96;
        }

        // The MEMBER stamp: red keyline box, rotated, with red type.
        try {
            var sx = EP - 560, sy = 1230, sw = 400, sh = 150;
            var box = lyType.pathItems.rectangle(py(b, sy), px(b, sx), sw, sh);
            box.filled = false; box.stroked = true; box.strokeColor = C.red; box.strokeWidth = 8;
            var st = lyType.textFrames.add();
            st.contents = A.stamp;
            try { PS.aStamp.applyTo(st.textRange, true); } catch (e) {}
            try { st.left = px(b, sx + 30); st.top = py(b, sy + 32); } catch (e) {}
            var g = lyType.groupItems.add();
            box.moveToBeginning(g);
            st.moveToBeginning(g);
            g.rotate(-9);
        } catch (eStamp) { log("WARN: stamp — " + eStamp); }

        area(b, EP - M - 66, M + 30, 700, 34, A.foot1, PS.aFoot1);
        area(b, EP - M - 30, M + 30, 700, 40, A.foot2, PS.aFoot2);
    })();


    // ==============================================================
    // 8. VARIANT B — the field manual / medical record
    // ==============================================================

    (function buildB() {
        var b = bB, W = EP - M * 2;
        paper(b);

        area(b, M, M, W, 48, B.docNo,   PS.bDoc);
        area(b, M, M, W, 48, B.edition, PS.bEd);
        bar(b, M + 66, M, W, 4, C.ink);
        bar(b, M + 78, M, W, 1, C.ink);      // the FM double rule

        point(b, 300, M, B.title1, PS.bTitle);
        point(b, 580, M, B.title2, PS.bTitle);
        bar(b, 880, M, W, 10, C.red);
        area(b, 920, M, W, 80, B.subtitle, PS.bSub);

        // CAUTION box — a ruled frame of numbered restrictions. Item 3
        // carries the synthetic-voice disclosure required by #60 §5.
        var cy = 1080, ch = 300;
        var cbox = lyRules.pathItems.rectangle(py(b, cy), px(b, M), W, ch);
        cbox.filled = false; cbox.stroked = true; cbox.strokeColor = C.ink; cbox.strokeWidth = 3;
        area(b, cy + 22, M + 26, W - 52, 46, B.caution, PS.bCaution);
        bar(b, cy + 76, M + 26, W - 52, 1, C.hairline);
        area(b, cy + 96, M + 26, W - 52, ch - 110, B.rules.join("\r"), PS.bRule);

        bar(b, EP - M - 108, M, W, 1, C.hairline);
        area(b, EP - M - 86, M, W, 40, B.authority, PS.bAuth);
        area(b, EP - M - 44, M, W, 60, B.distrib,   PS.bDist);
    })();


    // ==============================================================
    // 9. SHOW COVER — sparse on purpose; it must read at 55px
    // ==============================================================

    (function buildShow() {
        var b = bShow, m = 180, W = SHOWSZ - m * 2;
        paper(b);

        area(b, m, m, W, 96, SHOW.docNo, PS.sDoc);
        bar(b, m + 126, m, W, 8, C.ink);

        /* The wordmark now spans from just under the head rule to the red
           rule, which is the whole point of a series cover: at 55px in a
           podcast app everything else is gone and only this survives. */
        point(b,  620, m, SHOW.title1, PS.sTitle);
        point(b, 1330, m, SHOW.title2, PS.sTitle);
        bar(b, 2050, m, W, 22, C.red);

        area(b, 2140, m, W, 190, SHOW.subtitle, PS.sSub);

        /* Foot block raised from -130 to -210: the first run left roughly
           460pt of empty band above it, which reads as unfinished rather
           than as confident whitespace. */
        bar(b, SHOWSZ - m - 210, m, W, 2, C.hairline);
        area(b, SHOWSZ - m - 172, m, W, 90, SHOW.authority, PS.sAuth);
    })();


    // ==============================================================
    // 10. AUDIT BOARD
    // ==============================================================

    log("THREE ASSETS BUILT, AND ONE OF THEM IS A CHOICE");
    log("  1  ep01-cover-A-intake-form    1600  the v1 composition, new faces");
    log("  2  ep01-cover-B-field-manual   1600  FM 21-76 / medical record structure");
    log("  3  show-cover-3000             3000  series level, sparse by design");
    log("");
    log("A AND B ARE NOT DRAFTS OF EACH OTHER — PICK ONE");
    log("  A keeps the joke the v1 cover made: the show is a membership you did");
    log("    not apply for, and the cover is the paperwork. It is warmer and it");
    log("    is already proven — this artwork shipped.");
    log("  B is the direction recorded on issue #60: military medical records,");
    log("    document number, rule zones, restriction box, issuing authority.");
    log("    It is colder, more institutional, and scales to a season of covers");
    log("    more obviously than a one-off form does.");
    log("  The loser is not wasted. Whichever loses, its devices stay in the");
    log("  system — the stamp, the field rows, the CAUTION box are all reusable.");
    log("");
    log("THE SHOW COVER IS DELIBERATELY EMPTY");
    log("  It renders at 55px wide in a podcast app. Everything that is not the");
    log("  wordmark disappears at that size, so anything added has to earn its");
    log("  place against being invisible. Check it by zooming out until the");
    log("  artboard is thumbnail-sized before adding anything.");
    log("");
    log("WHAT IS MEASURED AND WHAT IS NOT");
    log("  Palette: MEASURED from the v1 PNGs. paper #EDE9E0  ink #111111");
    log("    red #B02A28  grey #78746C  hairline #C8C4BA. The red is ONE value");
    log("    across all three source images. Trust these.");
    log("  Sizes and positions: EYEBALLED. The pixel measurement of the v1 art");
    log("    was refused by the repo's lane guard (issue #56), so no cap height");
    log("    or rule weight here is derived from the original. Adjust freely.");
    log("  Variant A's copy: transcribed from alt-text.md, the only surviving");
    log("    record of the v1 cover. Its source file and fonts are unrecoverable.");
    log("");
    log("CAUTION BOX ITEM 3 IS LOAD-BEARING");
    log("  Issue #60 §5 requires that wherever the synthetic co-host appears,");
    log("  the fact is STATED rather than implied by style. A numbered");
    log("  restriction box is native to this vocabulary, so the disclosure is a");
    log("  design element the system wanted anyway — not a disclaimer bolted on.");
    log("  Do not delete it to tidy the layout.");
    log("");
    log("TO CHANGE THINGS GLOBALLY");
    log("  Window > Type > Paragraph Styles. A/*, B/*, S/* are per-variant so");
    log("  you can tune one without disturbing the others.");
    log("");
    log("BEFORE ANY OF THIS REPLACES ANYTHING");
    log("  episodes/ is a gated path. The v1 PNGs are the ONLY copy of the");
    log("  original art and are attached to episodes already on the feed. They");
    log("  get archived, never overwritten. See issue #60.");

    paper(bAudit);
    area(bAudit, M, M, EP - M * 2, EP - M * 2, report.join("\r"), PS.audit);

    try { app.executeMenuCommand("fitall"); } catch (e) {}


    // ==============================================================
    // 11. OPTIONAL EXPORT — descriptive filenames, never a hash
    // ==============================================================

    var exportNote = "";
    if (EXPORT_PNG) {
        try {
            var dir = new Folder(EXPORT_DIR);
            if (!dir.exists) dir.create();
            var opts = new ExportOptionsPNG24();
            opts.artBoardClipping = true; opts.transparency = false;
            opts.horizontalScale = 100; opts.verticalScale = 100;
            var names = ["20260727-adobe-illustrator-toldstraight-ep01-cover-a-intake-form-1600",
                         "20260727-adobe-illustrator-toldstraight-ep01-cover-b-field-manual-1600",
                         "20260727-adobe-illustrator-toldstraight-show-cover-3000"];
            for (var e5 = 0; e5 < names.length; e5++) {
                doc.artboards.setActiveArtboardIndex(e5);
                doc.exportFile(new File(dir.fsName + "/" + names[e5] + ".png"), ExportType.PNG24, opts);
            }
            exportNote = "\n" + names.length + " PNGs written to " + EXPORT_DIR + "\n";
        } catch (e6) { exportNote = "\nPNG export failed: " + e6 + "\n"; }
    }

    var summary = "Told Straight — Ep01 covers built.\n\n"
        + "Artboards: " + doc.artboards.length + "\n"
        + "  1  ep01-cover-A-intake-form   (1600)  the v1 composition, re-set\n"
        + "  2  ep01-cover-B-field-manual  (1600)  the #60 medical-record direction\n"
        + "  3  show-cover-3000            (3000)  series level\n"
        + "  4  AUDIT\n\n"
        + "Title face : " + (psTitle || "DEFAULT") + "\n"
        + "Label face : " + (psLabel || "DEFAULT") + "\n"
        + "Mono face  : " + (psMono  || "DEFAULT") + "\n\n"
        + (faceWarnings === 0
            ? "All three faces resolved at their intended weight.\n\n"
            : faceWarnings + " face(s) resolved with a compromise — see the audit board.\n\n")
        + "A AND B ARE A CHOICE, not drafts of each other. The audit board\n"
        + "argues both sides. Pick one; the loser's devices stay in the system.\n"
        + exportNote + "\n"
        + "Nothing here replaces anything in episodes/ — that path is gated.";

    alert(summary);

})();
