/**
 * Told Straight — WORDMARK, LOCKED SYSTEM  (ILLUSTRATOR)
 * ==================================================================
 * Renders the wordmark system AS DECIDED by the maintainer on
 * 2026-07-28 (recorded on issue #60): dual lockup, stamp as device
 * with the name once, TS-boxed compact mark, authority-line
 * satellite. This is the approval run — if these boards are right,
 * this file is what gets PROMOTED to tools/brand/ (#68 pattern).
 *
 * ONE QUESTION remains open in this run, rendered as side-by-side
 * variants instead of asked in the abstract:
 *
 *   A  = satellite is the authority line ONLY
 *   B  = A plus the small PODCAST eyebrow above the name
 *
 * EIGHT ARTBOARDS:
 *   ROW 1 — the two lockups, each in A and B:
 *     1  lockup-horizontal-A          2400 x  720
 *     2  lockup-horizontal-B-eyebrow  2400 x  720
 *     3  lockup-stacked-A             1600 x 1200
 *     4  lockup-stacked-B-eyebrow     1600 x 1200
 *   ROW 2 — the rest of the decided system:
 *     5  lockup-horizontal-DARK       2400 x  720   dark-stock variant
 *     6  stamp-device                 1600 x 1000   name ONCE (decided)
 *     7  mark-m1-final                 900 x  900
 *     8  AUDIT                        1600 x 1600
 *
 * TO RUN:  File > Scripts > Other Script...  and pick this file.
 * IT NEVER TOUCHES AN OPEN DOCUMENT. It always creates a new one.
 *
 * Decisions this file implements (do not re-open them here):
 *   - horizontal lockup for wide surfaces, stacked for square-leaning
 *     ones, "minor aspect ratio tweaks" of the stacked form permitted
 *     per surface (maintainer, 2026-07-28, verbatim on #60)
 *   - stamp = DEVICE, name once (double-strike dropped)
 *   - compact mark = M1 TS-boxed (16px degradation measurement)
 *   - default satellite = DEPT. OF NEURODEVELOPMENTAL AFFAIRS
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
            + "This is an ILLUSTRATOR script (Told Straight wordmark, locked).\n"
            + "You are running it in: " + thisApp + "\n\n"
            + "Open Adobe Illustrator and run it from File > Scripts > Other Script...\n\n"
            + "Nothing was created or changed.");
        return;
    }


    // ==============================================================
    // 0. FACES — pinned; all three verified resolving at intended
    //    weight in both wordmark-options runs today.
    // ==============================================================

    var FACE = {
        title: "TradeGothicNextLTPro-BdCn",
        label: "TradeGothicNextLTPro-Bd",
        mono:  "LetterGothicStd"
    };

    var SEARCH = {
        title: [
            { require: ["tradegothicnext"], exclude: ["italic", "oblique"],
              prefer: ["bdcn", "boldcond", "condbold", "hvcn"] },
            { require: ["helveticaneueltpro"], exclude: ["italic", "oblique", "obl"],
              prefer: ["bdcn", "blkcn"] }
        ],
        label: [
            { require: ["tradegothicnext"], exclude: ["italic", "oblique"],
              excludeSuffix: ["cn", "cond", "comp", "it", "obl"],
              prefer: ["bold", "bd", "heavy", "hv"] }
        ],
        mono: [
            { require: ["lettergothic"],  exclude: ["italic", "oblique"], prefer: ["std", "bold", "medium"] },
            { require: ["oratorstd"],     exclude: ["italic", "oblique"], prefer: ["std", "medium"] },
            { require: ["courier"],       exclude: ["italic", "oblique"], prefer: ["regular", "psmt"] }
        ]
    };

    var EXPORT_PNG = false;
    var EXPORT_DIR = "~/Code/audio-lab/output/artwork/brand-wordmark";


    // ==============================================================
    // 1. PALETTE — light measured from Ep01 art (2026-07-27); dark
    //    contrast-measured 2026-07-28. #B02A28 on #14140F is 2.82:1
    //    and FAILS — the dark rule is #E4564F (5.05:1) by measurement,
    //    not taste. Do not "correct" it back.
    // ==============================================================

    var PALETTE = {
        paper:  [237, 233, 224], ink:  [ 17,  17,  17], red:  [176,  42,  40],
        grey:   [120, 116, 108], hairline: [200, 196, 186],
        dpaper: [ 20,  20,  15], dink: [237, 233, 224], dred: [228,  86,  79],
        dgrey:  [154, 150, 142]
    };

    var report = [];
    function log(s) { report.push(s); }
    function rgb(t) { var c = new RGBColor(); c.red=t[0]; c.green=t[1]; c.blue=t[2]; return c; }
    var C = {
        paper: rgb(PALETTE.paper), ink: rgb(PALETTE.ink), red: rgb(PALETTE.red),
        grey: rgb(PALETTE.grey), hairline: rgb(PALETTE.hairline),
        dpaper: rgb(PALETTE.dpaper), dink: rgb(PALETTE.dink),
        dred: rgb(PALETTE.dred), dgrey: rgb(PALETTE.dgrey)
    };


    // ==============================================================
    // 2. FONT RESOLUTION — loud about any compromise
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
                        log("  " + roleName + ": " + fam[k]);
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

    log("TOLD STRAIGHT — wordmark, LOCKED system (approval run)");
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
    // 3. DOCUMENT + ARTBOARDS — two centred rows.
    //    Row 1: 2400+2400+1600+1600 + 3*220 = 8660 -> start -4330
    //    Row 2: 2400+1600+900+1600  + 3*220 = 7160 -> start -3580
    // ==============================================================

    var GUTTER = 220;
    var doc = app.documents.add(DocumentColorSpace.RGB, 1600, 1200);
    try { doc.rulerUnits = RulerUnits.Points; } catch (e) {}

    var BOARDS = [];
    var cursor = { r1: -4330, r2: -3580 };

    function addBoard(row, name, w, h) {
        var left, top;
        if (row === 1) { left = cursor.r1; top = h / 2; cursor.r1 += w + GUTTER; }
        else           { left = cursor.r2; top = -950;  cursor.r2 += w + GUTTER; }
        var rect = [left, top, left + w, top - h];
        var ab;
        if (BOARDS.length === 0) {
            ab = doc.artboards[0];
            try { ab.artboardRect = rect; } catch (e) { log("WARN: artboard " + name + " — " + e); }
        } else {
            try { ab = doc.artboards.add(rect); }
            catch (e2) { log("WARN: artboard " + name + " — " + e2); ab = null; }
        }
        if (ab) { try { ab.name = name; } catch (e3) {} }
        var b = { name: name, w: w, h: h, x: left, y: top };
        BOARDS.push(b);
        return b;
    }

    var bHA  = addBoard(1, "lockup-horizontal-A",         2400,  720);
    var bHB  = addBoard(1, "lockup-horizontal-B-eyebrow", 2400,  720);
    var bSA  = addBoard(1, "lockup-stacked-A",            1600, 1200);
    var bSB  = addBoard(1, "lockup-stacked-B-eyebrow",    1600, 1200);
    var bHD  = addBoard(2, "lockup-horizontal-DARK",      2400,  720);
    var bStp = addBoard(2, "stamp-device",                1600, 1000);
    var bM1  = addBoard(2, "mark-m1-final",                900,  900);
    var bAud = addBoard(2, "AUDIT",                       1600, 1600);

    function layer(name) {
        var l; try { l = doc.layers.getByName(name); } catch (e) { l = doc.layers.add(); l.name = name; } return l;
    }
    var lyType  = layer("TYPE");
    var lyRules = layer("RULES");
    var lyPaper = layer("PAPER");
    try { lyPaper.zOrder(ZOrderMethod.SENDTOBACK); } catch (e) {}
    // layers.add() creates at the TOP of the stack — without this line
    // RULES sits above TYPE (found when M2's band covered its letters
    // in the options run). Type wins explicitly:
    try { lyType.zOrder(ZOrderMethod.BRINGTOFRONT); } catch (e) {}


    // ==============================================================
    // 4. STYLES
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

    var L = Justification.LEFT, CTR = Justification.CENTER;

    var PS = {
        hTitle:  paraStyle("H/Title",   360, 330, -18, C.ink,  fTitle, L),
        hMono:   paraStyle("H/Mono",     30,  42, 240, C.grey, fMono,  L),
        sTitle:  paraStyle("S/Title",   380, 350, -18, C.ink,  fTitle, L),
        sMono:   paraStyle("S/Mono",     26,  36, 240, C.grey, fMono,  L),
        dTitle:  paraStyle("D/Title",   360, 330, -18, C.dink, fTitle, L),
        dMono:   paraStyle("D/Mono",     30,  42, 240, C.dgrey, fMono, L),
        stpTitle:paraStyle("STP/Title", 175, 200, -10, C.red,  fTitle, CTR),
        stpMono: paraStyle("STP/Mono",   34,  46, 300, C.red,  fMono,  CTR),
        m1TS:    paraStyle("M1/TS",     480, 440, -10, C.ink,  fTitle, L),
        audit:   paraStyle("AUDIT/Text", 19,  27,   0, C.ink,  fMono,  L)
    };

    var AUTHORITY = "DEPT. OF NEURODEVELOPMENTAL AFFAIRS";
    var EYEBROW   = "PODCAST";


    // ==============================================================
    // 5. DRAWING HELPERS
    // ==============================================================

    function px(b, x) { return b.x + x; }
    function py(b, y) { return b.y - y; }

    function paper(b, colour) {
        var r = lyPaper.pathItems.rectangle(py(b, 0), px(b, 0), b.w, b.h);
        r.filled = true; r.fillColor = colour || C.paper; r.stroked = false; return r;
    }
    function bar(b, y, x, w, thick, colour) {
        var r = lyRules.pathItems.rectangle(py(b, y), px(b, x), w, thick);
        r.filled = true; r.fillColor = colour; r.stroked = false; return r;
    }
    function box(b, y, x, w, h, weight, colour) {
        var r = lyRules.pathItems.rectangle(py(b, y), px(b, x), w, h);
        r.filled = false; r.stroked = true; r.strokeColor = colour; r.strokeWidth = weight; return r;
    }
    function point(b, y, x, content, style) {
        var tf;
        try { tf = lyType.textFrames.add(); } catch (e) { log("WARN: point — " + e); return null; }
        tf.contents = content;
        try { style.applyTo(tf.textRange, true); } catch (e2) {}
        try { tf.left = px(b, x); tf.top = py(b, y); } catch (e3) {}
        return tf;
    }
    function pointCentred(b, y, content, style) {
        var tf = point(b, y, 0, content, style);
        if (tf) { try { tf.left = px(b, (b.w - tf.width) / 2); } catch (e) {} }
        return tf;
    }
    function area(b, y, x, w, h, content, style) {
        var bx = lyType.pathItems.rectangle(py(b, y), px(b, x), w, h);
        var tf;
        try { tf = lyType.textFrames.areaText(bx); } catch (e) { log("WARN: area — " + e); return null; }
        tf.contents = content;
        try { style.applyTo(tf.textRange, true); } catch (e2) {}
        return tf;
    }


    // ==============================================================
    // 6. THE LOCKUPS
    // ==============================================================

    function horizontal(b, eyebrow, dark) {
        var M = 100;
        paper(b, dark ? C.dpaper : null);
        var tTitle = dark ? PS.dTitle : PS.hTitle;
        var tMono  = dark ? PS.dMono  : PS.hMono;
        var rule   = dark ? C.dred    : C.red;
        var nameY  = eyebrow ? 170 : 150;
        if (eyebrow) point(b, 85, M, EYEBROW, tMono);
        point(b, nameY, M, "TOLD STRAIGHT", tTitle);
        bar(b, nameY + 370, M, 2200, 12, rule);
        point(b, nameY + 420, M, AUTHORITY, tMono);
        if (dark) {
            var tf = point(b, nameY + 420, 0, "DARK VARIANT — RULE #E4564F BY MEASUREMENT", tMono);
            if (tf) { try { tf.left = px(b, b.w - M - tf.width); } catch (e) {} }
        }
    }

    function stacked(b, eyebrow) {
        var M = 90;
        paper(b);
        var topY = eyebrow ? 210 : 190;
        if (eyebrow) point(b, 90, M, EYEBROW, PS.sMono);
        point(b, topY, M - 8, "TOLD", PS.sTitle);
        point(b, topY + 350, M - 8, "STRAIGHT", PS.sTitle);
        bar(b, topY + 750, M, 1353, 14, C.red);
        point(b, topY + 820, M, AUTHORITY, PS.sMono);
    }

    horizontal(bHA, false, false);
    horizontal(bHB, true,  false);
    stacked(bSA, false);
    stacked(bSB, true);
    horizontal(bHD, false, true);

    // Stamp DEVICE — name once, per the 2026-07-28 decision.
    (function buildStamp() {
        var b = bStp;
        paper(b);
        var g;
        try { g = lyType.groupItems.add(); } catch (e) { log("WARN: stamp group — " + e); return; }
        var W = 1180, H = 520, x0 = (b.w - W) / 2, y0 = (b.h - H) / 2;
        var r1 = g.pathItems.rectangle(py(b, y0), px(b, x0), W, H);
        r1.filled = false; r1.stroked = true; r1.strokeColor = C.red; r1.strokeWidth = 10;
        var r2 = g.pathItems.rectangle(py(b, y0 + 22), px(b, x0 + 22), W - 44, H - 44);
        r2.filled = false; r2.stroked = true; r2.strokeColor = C.red; r2.strokeWidth = 3;
        function gpoint(y, content, style) {
            var tf = g.textFrames.add();
            tf.contents = content;
            try { style.applyTo(tf.textRange, true); } catch (e2) {}
            try { tf.top = py(b, y); tf.left = px(b, x0); } catch (e3) {}
            try { tf.left = px(b, x0 + (W - tf.width) / 2); } catch (e4) {}
            return tf;
        }
        gpoint(y0 + 100, "TOLD STRAIGHT", PS.stpTitle);
        gpoint(y0 + 340, "PODCAST · NO SHORTCUTS · EST. 2026", PS.stpMono);
        try { g.rotate(-3.5); } catch (e5) { log("WARN: stamp rotate — " + e5); }
    })();

    // M1 — the decided compact mark, unchanged from the winning render.
    (function buildM1() {
        var b = bM1;
        paper(b);
        box(b, 60, 60, b.w - 120, b.h - 120, 14, C.ink);
        pointCentred(b, 190, "TS", PS.m1TS);
        bar(b, 640, 240, 420, 16, C.red);
    })();


    // ==============================================================
    // 7. AUDIT
    // ==============================================================

    log("WHAT THIS RUN IS");
    log("  The LOCKED wordmark system, per the maintainer's 2026-07-28");
    log("  decisions on #60: horizontal lockup for wide surfaces, stacked");
    log("  for square-leaning ones (minor aspect tweaks allowed), stamp as");
    log("  a device with the name ONCE, M1 TS-boxed compact mark,");
    log("  authority-line satellite.");
    log("");
    log("THE ONE OPEN QUESTION — A or B, per lockup");
    log("  A = authority line only. B = A plus the PODCAST eyebrow.");
    log("  The pick can differ between horizontal and stacked.");
    log("");
    log("IF THESE BOARDS ARE RIGHT");
    log("  This file gets promoted to tools/brand/ by an executor PR (#68");
    log("  pattern), the decision lands durably per the AGENTS.md DoD ADR");
    log("  line, and the deliverables phase starts: favicon derivation");
    log("  (fills-only redraw at 16/32px from M1), README header, OG card,");
    log("  and the brand sheet in InDesign.");
    log("");
    log("DARK VARIANT");
    log("  The dark rule is #E4564F — 5.05:1 on #14140F, measured");
    log("  2026-07-28. The print red #B02A28 measures 2.82:1 there and");
    log("  FAILS every WCAG threshold. Not a taste call; do not revert.");

    paper(bAud);
    area(bAud, 90, 90, bAud.w - 180, bAud.h - 180, report.join("\r"), PS.audit);

    try { app.executeMenuCommand("fitall"); } catch (e) {}


    // ==============================================================
    // 8. OPTIONAL EXPORT — descriptive filenames, never a hash
    // ==============================================================

    var exportNote = "";
    if (EXPORT_PNG) {
        try {
            var dir = new Folder(EXPORT_DIR);
            if (!dir.exists) dir.create();
            var opts = new ExportOptionsPNG24();
            opts.artBoardClipping = true; opts.transparency = false;
            opts.horizontalScale = 100; opts.verticalScale = 100;
            var names = [
                "20260728-adobe-illustrator-toldstraight-wordmark-locked-horizontal-a-2400x720",
                "20260728-adobe-illustrator-toldstraight-wordmark-locked-horizontal-b-eyebrow-2400x720",
                "20260728-adobe-illustrator-toldstraight-wordmark-locked-stacked-a-1600x1200",
                "20260728-adobe-illustrator-toldstraight-wordmark-locked-stacked-b-eyebrow-1600x1200",
                "20260728-adobe-illustrator-toldstraight-wordmark-locked-horizontal-dark-2400x720",
                "20260728-adobe-illustrator-toldstraight-stamp-device-1600x1000",
                "20260728-adobe-illustrator-toldstraight-mark-m1-final-900"
            ];
            for (var e5 = 0; e5 < names.length; e5++) {
                doc.artboards.setActiveArtboardIndex(e5);
                doc.exportFile(new File(dir.fsName + "/" + names[e5] + ".png"), ExportType.PNG24, opts);
            }
            exportNote = "\n" + names.length + " PNGs written to " + EXPORT_DIR + "\n";
        } catch (e6) { exportNote = "\nPNG export failed: " + e6 + "\n"; }
    }

    var summary = "Told Straight — LOCKED wordmark system built.\n\n"
        + "This is the approval run of the system as decided 2026-07-28.\n\n"
        + "ONE question: A (authority only) or B (+ PODCAST eyebrow),\n"
        + "per lockup — the pick can differ between horizontal and stacked.\n\n"
        + "Title face : " + (psTitle || "DEFAULT") + "\n"
        + "Label face : " + (psLabel || "DEFAULT") + "\n"
        + "Mono face  : " + (psMono  || "DEFAULT") + "\n\n"
        + (faceWarnings === 0
            ? "All faces resolved at their intended weight.\n"
            : "*** " + faceWarnings + " FACE(S) COMPROMISED — STOP; fix activation "
              + "before approving. ***\n")
        + exportNote + "\n"
        + "Approve -> promotion PR + deliverables phase.\n"
        + "Nothing here touches episodes/ or the feed.";

    alert(summary);

})();
