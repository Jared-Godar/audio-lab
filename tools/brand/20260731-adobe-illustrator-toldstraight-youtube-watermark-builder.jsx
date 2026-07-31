/**
 * Told Straight — YOUTUBE VIDEO WATERMARK  150 x 150   (ILLUSTRATOR)
 * ==================================================================
 * The small mark YouTube overlays in the player's right-hand corner. Clicking
 * it subscribes, so it is a brand asset AND a button.
 *
 * Reference builders followed for conventions, palette, measured-type
 * discipline and export machinery:
 *   tools/brand/20260731-adobe-illustrator-toldstraight-x-avatar-builder.jsx
 *   tools/brand/20260728-adobe-illustrator-toldstraight-favicon-derivation-builder.jsx
 *
 * DIMENSIONS — MEASURED FROM YOUTUBE STUDIO, 2026-07-31
 * -----------------------------------------------------
 * Read verbatim from Studio > Customisation > Branding > Video watermark:
 *
 *     "An image that's 150 x 150 pixels is recommended. Use a PNG, GIF
 *      (no animations), BMP, or JPEG file that's 1MB or less."
 *
 * WHY THIS IS NOT THE AVATAR SCALED DOWN
 * --------------------------------------
 * The watermark is composited OVER ARBITRARY VIDEO and rendered far smaller
 * than 150 — roughly 40-60px in a desktop player. Two constraints collide:
 *
 *   1. IT MUST SURVIVE EXTREME DOWNSCALING. The favicon run already found
 *      frames die below 32px. A thin ring at 40px is a grey smudge.
 *   2. IT MUST READ ON ANY BACKGROUND. Ink-on-transparent vanishes on dark
 *      footage; cream-on-transparent vanishes on a white studio shot.
 *
 * So the watermark carries ITS OWN BACKGROUND — a full-bleed disc — and drops
 * detail the avatar can afford. That is a different design problem, not a
 * resize. Exported with TRANSPARENCY ON so the corners outside the disc are
 * clear rather than a cream square stuck on the video.
 *
 * THREE TREATMENTS, ONE QUESTION
 * ------------------------------
 *   A  ring        the M1 ring on a paper disc — most brand-consistent
 *   B  frameless   TS + rule on a paper disc — ring dropped, larger letters
 *   C  knockout    cream TS on an INK disc — highest contrast on any footage
 *
 * THE ONE QUESTION: which still reads at ~48px, over BOTH dark and light
 * video? Row 2 composites each over black and white fields; row 3 is true
 * size. Judge legibility on the exported 48px PNGs in Finder, not on screen.
 *
 * TO RUN:  File > Scripts > Other Script...  and pick this file.
 * IT NEVER TOUCHES AN OPEN DOCUMENT. It always creates a new one.
 */

#target illustrator

(function () {

    var thisApp = "an unknown application";
    try { thisApp = String(app.name); } catch (e) {}
    if (thisApp.indexOf("Illustrator") === -1) {
        alert("WRONG APPLICATION\n\nThis is an ILLUSTRATOR script (Told Straight YouTube watermark).\n"
            + "You are running it in: " + thisApp + "\n\nNothing was created or changed.");
        return;
    }

    var FACE_TITLE = "TradeGothicNextLTPro-BdCn";
    var SEARCH_TITLE = [
        { require: ["tradegothicnext"], exclude: ["italic", "oblique"], prefer: ["bdcn", "boldcond", "hvcn"] },
        { require: ["helveticaneueltpro"], exclude: ["italic", "oblique"], prefer: ["bdcn", "blkcn"] }
    ];

    var EXPORT_PNG = true;
    var EXPORT_DIR = "~/Code/audio-lab/output/artwork/brand-youtube-watermark";

    var PALETTE = {
        paper: [237, 233, 224], ink: [17, 17, 17], red: [176, 42, 40],
        vidDark: [10, 10, 10], vidLight: [244, 244, 244]
    };
    var report = [];
    function log(s) { report.push(s); }
    function rgb(t) { var c = new RGBColor(); c.red = t[0]; c.green = t[1]; c.blue = t[2]; return c; }
    var C = { paper: rgb(PALETTE.paper), ink: rgb(PALETTE.ink), red: rgb(PALETTE.red),
              vidDark: rgb(PALETTE.vidDark), vidLight: rgb(PALETTE.vidLight) };

    var installed = [];
    for (var fi = 0; fi < app.textFonts.length; fi++) installed.push(app.textFonts[fi].name);
    function has(ps) { for (var i = 0; i < installed.length; i++) if (installed[i] === ps) return true; return false; }
    var faceWarnings = 0, psTitle = null;
    if (has(FACE_TITLE)) { psTitle = FACE_TITLE; log("  title: " + FACE_TITLE + "   (pinned)"); }
    else {
        faceWarnings++;
        log("  title: PINNED '" + FACE_TITLE + "' NOT INSTALLED — searching");
        outer:
        for (var g = 0; g < SEARCH_TITLE.length; g++) {
            for (var i2 = 0; i2 < installed.length; i2++) {
                var nm = installed[i2].toLowerCase(), ok = true, j;
                for (j = 0; j < SEARCH_TITLE[g].require.length; j++)
                    if (nm.indexOf(SEARCH_TITLE[g].require[j]) === -1) { ok = false; break; }
                if (ok) for (j = 0; j < SEARCH_TITLE[g].exclude.length; j++)
                    if (nm.indexOf(SEARCH_TITLE[g].exclude[j]) !== -1) { ok = false; break; }
                if (!ok) continue;
                for (j = 0; j < SEARCH_TITLE[g].prefer.length; j++)
                    if (nm.indexOf(SEARCH_TITLE[g].prefer[j]) !== -1) { psTitle = installed[i2]; break outer; }
            }
        }
        if (psTitle) log("  title: " + psTitle + "   (fallback)");
        else log("  title: NOTHING MATCHED — Illustrator default");
    }
    var fTitle = null; try { fTitle = app.textFonts.getByName(psTitle); } catch (e) {}

    log("TOLD STRAIGHT — YouTube video watermark 150x150");
    log("Built " + new Date().toString());
    log("");

    var doc = app.documents.add(DocumentColorSpace.RGB, 150, 150);
    try { doc.rulerUnits = RulerUnits.Points; } catch (e) {}

    var GUTTER = 80;
    var BOARDS = [];
    var cursor = { r1: -300, r2: -520, r3: -430, r4: -400 };
    var ROWTOP = { 1: 0, 2: -260, 3: -520, 4: -800 };

    function addBoard(row, name, w, h) {
        var left = cursor["r" + row], top = ROWTOP[row];
        cursor["r" + row] += w + GUTTER;
        var rect = [left, top, left + w, top - h], ab;
        if (BOARDS.length === 0) {
            ab = doc.artboards[0];
            try { ab.artboardRect = rect; } catch (e) { log("WARN: artboard " + name + " — " + e); }
        } else {
            try { ab = doc.artboards.add(rect); }
            catch (e2) { log("WARN: artboard " + name + " — " + e2); ab = null; }
        }
        if (ab) { try { ab.name = name; } catch (e3) {} }
        var b = { name: name, w: w, h: h, x: left, y: top };
        BOARDS.push(b); return b;
    }

    var lyArt = doc.layers.add(); lyArt.name = "WATERMARKS";
    var lyAudit = doc.layers.add(); lyAudit.name = "AUDIT";

    function px(b, x) { return b.x + x; }
    function py(b, y) { return b.y - y; }
    function fillRectIn(grp, b, y, x, w, h, colour) {
        var r = grp.pathItems.rectangle(py(b, y), px(b, x), w, h);
        r.filled = true; r.fillColor = colour; r.stroked = false; return r;
    }
    function fillEllipseIn(grp, b, cx, cy, radius, colour) {
        var e = grp.pathItems.ellipse(py(b, cy - radius), px(b, cx - radius), radius * 2, radius * 2);
        e.filled = true; e.fillColor = colour; e.stroked = false; return e;
    }

    /* Outlined-and-measured type, then the block is centred from what was
       actually drawn. geometricBounds on LIVE text is the em box, not the ink
       — the avatar builder spent a revision learning that. */
    function markBlock(grp, b, opts) {
        var tf;
        try { tf = grp.textFrames.add(); } catch (e) { return null; }
        tf.contents = "TS";
        try {
            var ca = tf.textRange.characterAttributes;
            ca.size = opts.tsSize; ca.leading = opts.tsSize; ca.autoLeading = false;
            ca.tracking = opts.track; ca.fillColor = opts.fg;
            if (fTitle) ca.textFont = fTitle;
        } catch (e2) {}
        var item = tf, outlined = false;
        try { item = tf.createOutline(); outlined = true; }
        catch (e3) { log("WARN: createOutline failed on " + b.name); }
        var gb = null; try { gb = item.geometricBounds; } catch (e4) {}
        if (!gb) return null;
        var inkW = gb[2] - gb[0], inkH = gb[1] - gb[3];
        var barW = inkW * opts.barWRatio, barH = inkH * opts.barHRatio, gap = inkH * opts.gapRatio;
        var blockH = inkH + gap + barH;
        var cx = px(b, b.w / 2), cy = py(b, b.h / 2);
        var wantTop = cy + blockH / 2 + blockH * opts.lift;
        try { item.translate(cx - inkW / 2 - gb[0], wantTop - gb[1]); } catch (e5) {}
        var bar = grp.pathItems.rectangle(wantTop - inkH - gap, cx - barW / 2, barW, barH);
        bar.filled = true; bar.fillColor = opts.accent; bar.stroked = false;
        return { inkW: inkW, inkH: inkH, blockH: blockH, barH: barH,
                 emRatio: inkH / opts.tsSize, outlined: outlined };
    }

    function watermark(b, opts) {
        var grp = lyArt.groupItems.add();
        // Optional video field UNDER everything, for the contrast tests.
        if (opts.field) fillRectIn(grp, b, 0, 0, b.w, b.h, opts.field);

        var discR = b.w / 2;                 // full-bleed disc; corners stay transparent
        var discCol = (opts.mode === "knockout") ? C.ink : C.paper;
        var fg      = (opts.mode === "knockout") ? C.paper : C.ink;
        fillEllipseIn(grp, b, b.w / 2, b.h / 2, discR, discCol);

        if (opts.mode === "ring") {
            fillEllipseIn(grp, b, b.w / 2, b.h / 2, discR * opts.ringOuter, fg);
            fillEllipseIn(grp, b, b.w / 2, b.h / 2, discR * opts.ringOuter - opts.ringT, discCol);
        }
        var m = markBlock(grp, b, { tsSize: opts.tsSize, track: opts.track, fg: fg,
                                    accent: C.red, barWRatio: 1.0,
                                    barHRatio: opts.barHRatio, gapRatio: opts.gapRatio,
                                    lift: opts.lift });
        if (opts.audit && m) {
            var limit = (opts.mode === "ring") ? (discR * opts.ringOuter - opts.ringT) : discR;
            var d = Math.sqrt((m.inkW / 2) * (m.inkW / 2) + (m.blockH / 2) * (m.blockH / 2));
            log("  " + b.name);
            log("     ink " + Math.round(m.inkW) + "x" + Math.round(m.inkH)
                + "   bar h " + Math.round(m.barH)
                + "   cap/em " + (Math.round(m.emRatio * 1000) / 1000)
                + (m.outlined ? "" : "  *** EM BOX, NOT INK ***"));
            log("     block corner " + Math.round(d) + " vs limit " + Math.round(limit)
                + "   -> " + (d <= limit ? "PASS" : "*** FAIL — reduce tsSize ***"));
        }
        return grp;
    }

    // ---- treatments. Ratios, not coordinates. ----
    var A  = { mode: "ring",      ringOuter: 0.94, ringT: 9,  tsSize: 66, track: -10,
               barHRatio: 0.16, gapRatio: 0.11, lift: 0 };
    var B  = { mode: "frameless",                   tsSize: 84, track: -10,
               barHRatio: 0.16, gapRatio: 0.11, lift: 0 };
    var Ck = { mode: "knockout",                    tsSize: 84, track: -10,
               barHRatio: 0.16, gapRatio: 0.11, lift: 0 };

    function withField(o, f) { var r = {}; for (var k in o) if (o.hasOwnProperty(k)) r[k] = o[k]; r.field = f; return r; }
    function withAudit(o) { var r = {}; for (var k in o) if (o.hasOwnProperty(k)) r[k] = o[k]; r.audit = true; return r; }
    function scaled(o, f) {
        var r = {}; for (var k in o) if (o.hasOwnProperty(k)) r[k] = o[k];
        r.tsSize = o.tsSize * f; if (r.ringT) r.ringT = o.ringT * f; return r;
    }

    log("MEASURED FIT CHECKS");

    // ROW 1 — the uploadable 150s, transparent outside the disc
    var a1 = addBoard(1, "watermark-A-ring-150",      150, 150);
    var b1 = addBoard(1, "watermark-B-frameless-150", 150, 150);
    var c1 = addBoard(1, "watermark-C-knockout-150",  150, 150);
    watermark(a1, withAudit(A));
    watermark(b1, withAudit(B));
    watermark(c1, withAudit(Ck));

    // ROW 2 — CONTRAST TEST: each over near-black and near-white "video"
    var a2 = addBoard(2, "OVER-DARK-A",  150, 150);
    var b2 = addBoard(2, "OVER-DARK-B",  150, 150);
    var c2 = addBoard(2, "OVER-DARK-C",  150, 150);
    var a3 = addBoard(2, "OVER-LIGHT-A", 150, 150);
    var b3 = addBoard(2, "OVER-LIGHT-B", 150, 150);
    var c3 = addBoard(2, "OVER-LIGHT-C", 150, 150);
    watermark(a2, withField(A,  C.vidDark));
    watermark(b2, withField(B,  C.vidDark));
    watermark(c2, withField(Ck, C.vidDark));
    watermark(a3, withField(A,  C.vidLight));
    watermark(b3, withField(B,  C.vidLight));
    watermark(c3, withField(Ck, C.vidLight));

    // ROW 3 — TRUE SIZE at the player's actual render (~48px), the honest test
    var f = 48 / 150;
    var a4 = addBoard(3, "TRUESIZE-A-48", 48, 48);
    var b4 = addBoard(3, "TRUESIZE-B-48", 48, 48);
    var c4 = addBoard(3, "TRUESIZE-C-48", 48, 48);
    watermark(a4, withAudit(scaled(A,  f)));
    watermark(b4, withAudit(scaled(B,  f)));
    watermark(c4, withAudit(scaled(Ck, f)));

    // ---- AUDIT ----
    log("");
    log("DIMENSIONS — MEASURED from YouTube Studio 2026-07-31");
    log("  \"150 x 150 recommended. PNG, GIF (no animations), BMP or JPEG,");
    log("   1MB or less.\"  Exported here as PNG24 WITH TRANSPARENCY.");
    log("");
    log("WHY THIS IS NOT THE AVATAR SCALED DOWN");
    log("  The watermark sits OVER ARBITRARY VIDEO and renders at roughly");
    log("  40-60px in a desktop player. Two constraints collide:");
    log("    1. It must survive extreme downscaling. The favicon run found");
    log("       frames die below 32px; a thin ring at 40px is a smudge.");
    log("    2. It must read on ANY background. Ink-on-transparent vanishes");
    log("       on dark footage; cream-on-transparent vanishes on white.");
    log("  So it carries its OWN full-bleed disc and drops detail the avatar");
    log("  can afford. Different problem, not a resize.");
    log("");
    log("THE ONE QUESTION: which reads at ~48px over BOTH dark and light?");
    log("  Row 2 composites each over near-black and near-white fields — that");
    log("  is the test ink-on-transparent would fail invisibly.");
    log("  Row 3 is TRUE SIZE. Judge legibility on the exported 48px PNGs in");
    log("  Finder at actual size; on-screen zoom cannot answer it.");
    log("  Prior art says expect C (knockout) > B (frameless) > A (ring).");
    log("");
    log("TRANSPARENCY IS THE POINT");
    log("  Corners outside the disc are CLEAR. Exporting opaque would paste a");
    log("  cream square onto every video — the failure this asset exists to");
    log("  avoid. If the exported PNGs have square backgrounds, the export");
    log("  flag regressed; check ExportOptionsPNG24.transparency.");
    log("");
    log("Ring thickness is EYEBALLED per size class. The bar is MEASURED —");
    log("  derived from the type's true ink bounds, so it cannot collide.");
    log("");
    log("WHAT TO UPLOAD: row 1 only. Rows 2-3 are tests.");

    var bAud = addBoard(4, "AUDIT", 1000, 1300);
    (function () {
        var bgr = lyAudit.pathItems.rectangle(py(bAud, 0), px(bAud, 0), bAud.w, bAud.h);
        bgr.filled = true; bgr.fillColor = C.paper; bgr.stroked = false;
        var bx = lyAudit.pathItems.rectangle(py(bAud, 50), px(bAud, 50), bAud.w - 100, bAud.h - 100);
        var tf; try { tf = lyAudit.textFrames.areaText(bx); } catch (e) { return; }
        tf.contents = report.join("\r");
        try {
            var ca = tf.textRange.characterAttributes;
            ca.size = 15; ca.leading = 21; ca.autoLeading = false; ca.fillColor = C.ink;
            if (fTitle) ca.textFont = fTitle;
        } catch (e2) {}
    })();

    try { app.executeMenuCommand("fitall"); } catch (e) {}

    var exportNote = "";
    if (EXPORT_PNG) {
        try {
            var dir = new Folder(EXPORT_DIR);
            if (!dir.exists) dir.create();
            var opts = new ExportOptionsPNG24();
            opts.artBoardClipping = true;
            opts.transparency = true;          // <-- the whole point
            opts.horizontalScale = 100; opts.verticalScale = 100;
            var names = [
                "20260731-adobe-illustrator-toldstraight-youtube-watermark-a-ring-150",
                "20260731-adobe-illustrator-toldstraight-youtube-watermark-b-frameless-150",
                "20260731-adobe-illustrator-toldstraight-youtube-watermark-c-knockout-150",
                "20260731-adobe-illustrator-toldstraight-youtube-watermark-overdark-a-150",
                "20260731-adobe-illustrator-toldstraight-youtube-watermark-overdark-b-150",
                "20260731-adobe-illustrator-toldstraight-youtube-watermark-overdark-c-150",
                "20260731-adobe-illustrator-toldstraight-youtube-watermark-overlight-a-150",
                "20260731-adobe-illustrator-toldstraight-youtube-watermark-overlight-b-150",
                "20260731-adobe-illustrator-toldstraight-youtube-watermark-overlight-c-150",
                "20260731-adobe-illustrator-toldstraight-youtube-watermark-truesize-a-48",
                "20260731-adobe-illustrator-toldstraight-youtube-watermark-truesize-b-48",
                "20260731-adobe-illustrator-toldstraight-youtube-watermark-truesize-c-48"
            ];
            for (var e5 = 0; e5 < names.length; e5++) {
                if (e5 >= doc.artboards.length) continue;
                doc.artboards.setActiveArtboardIndex(e5);
                doc.exportFile(new File(dir.fsName + "/" + names[e5] + ".png"), ExportType.PNG24, opts);
            }
            exportNote = "\n" + names.length + " PNGs written to " + EXPORT_DIR + "\n";
        } catch (e6) { exportNote = "\nExport failed: " + e6 + "\n"; }
    }

    alert("Told Straight — YouTube watermarks built (150x150, transparent).\n\n"
        + "NOT the avatar scaled down: this sits OVER VIDEO at ~40-60px, so it\n"
        + "carries its own disc and drops detail the avatar can afford.\n\n"
        + "A ring / B frameless / C knockout (cream on ink).\n"
        + "Row 2 composites each over dark AND light video — the test an\n"
        + "ink-on-transparent mark would fail invisibly.\n"
        + "Row 3 is TRUE SIZE; judge on the exported 48px PNGs in Finder.\n\n"
        + "Upload from ROW 1 only. If those PNGs have square backgrounds the\n"
        + "transparency flag regressed.\n\n"
        + "Title face: " + (psTitle || "DEFAULT") + "\n"
        + (faceWarnings === 0 ? "Face resolved at intended weight.\n"
                              : "*** FACE COMPROMISED — stop before judging. ***\n")
        + exportNote
        + "\nNothing here touches episodes/ or the feed.");

})();
