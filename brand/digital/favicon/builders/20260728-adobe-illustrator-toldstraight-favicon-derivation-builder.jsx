/**
 * Told Straight — FAVICON DERIVATION from mark M1  (ILLUSTRATOR)
 * ==================================================================
 * Derives the favicon set from the decided compact mark (ADR 0015:
 * M1, TS in a ruled box with the red bar) as FILLS-ONLY redraws at
 * each true pixel size — because at 16px every stroke in the 900pt
 * master dies (14pt box -> 0.25px, measured before M1 was chosen).
 *
 * Judge each tiny board at 100% zoom (View > Actual Size). That is
 * the whole point of true-size artboards: what you see at 100% is
 * exactly what a browser tab shows.
 *
 * SEVEN ARTBOARDS:
 *   ROW 1 — context and the big sizes:
 *     1  m1-master-ref     900 x 900   the promoted mark, for reference
 *     2  favicon-512       512 x 512   maskable (content in centre 80%)
 *     3  favicon-180       180 x 180   apple-touch
 *   ROW 2 — the small sizes, where the decisions live:
 *     4  favicon-32-framed    32 x 32  box survives as a FILLED frame
 *     5  favicon-32-frameless 32 x 32  box dropped entirely
 *     6  favicon-16           16 x 16  TS + red bar only
 *     7  AUDIT             1600 x 1600
 *
 * THE ONE QUESTION THIS RUN ASKS: at 32px, framed or frameless?
 * (16 is frameless by necessity; 180/512 keep the frame comfortably.)
 *
 * Everything here is a FILL — nested filled rectangles make the
 * "frame", no strokeWidth anywhere. Type is fills natively.
 *
 * TO RUN:  File > Scripts > Other Script...  and pick this file.
 * IT NEVER TOUCHES AN OPEN DOCUMENT. It always creates a new one.
 * EXPORT_PNG=true writes each board at its native pixel size, plus
 * an SVG master of the 512 board (modern browsers accept SVG
 * favicons; it also feeds the site).
 */

#target illustrator

(function () {

    var thisApp = "an unknown application";
    try { thisApp = String(app.name); } catch (e) {}
    if (thisApp.indexOf("Illustrator") === -1) {
        alert("WRONG APPLICATION\n\nThis is an ILLUSTRATOR script (Told Straight favicon derivation).\n"
            + "You are running it in: " + thisApp + "\n\nNothing was created or changed.");
        return;
    }

    // ---- faces: only the title face is needed (TS letters) ----
    var FACE_TITLE = "TradeGothicNextLTPro-BdCn";
    var SEARCH_TITLE = [
        { require: ["tradegothicnext"], exclude: ["italic", "oblique"], prefer: ["bdcn", "boldcond", "hvcn"] },
        { require: ["helveticaneueltpro"], exclude: ["italic", "oblique"], prefer: ["bdcn", "blkcn"] }
    ];

    var EXPORT_PNG = true;   // on: true-size PNGs are the honest legibility test, viewable in Finder
    var EXPORT_DIR = "~/Code/audio-lab/output/artwork/brand-favicon";

    /* Dark tokens measured for WCAG contrast 2026-07-28 (5-control
       checker). Favicons are one of only TWO surfaces in this system
       that genuinely theme-switch — browsers honour
       <link rel="icon" media="(prefers-color-scheme: dark)">. The other
       is the README header. The GitHub social preview and the OG card
       CANNOT switch (one image / one URL, no theme signal), so their
       dark boards are alternatives, not companions. */
    var PALETTE = {
        paper: [237, 233, 224], ink: [17, 17, 17], red: [176, 42, 40],
        dpaper: [20, 20, 15],   dink: [237, 233, 224], dred: [228, 86, 79]
    };
    var report = [];
    function log(s) { report.push(s); }
    function rgb(t) { var c = new RGBColor(); c.red=t[0]; c.green=t[1]; c.blue=t[2]; return c; }
    var C = { paper: rgb(PALETTE.paper), ink: rgb(PALETTE.ink), red: rgb(PALETTE.red),
              dpaper: rgb(PALETTE.dpaper), dink: rgb(PALETTE.dink), dred: rgb(PALETTE.dred) };

    // ---- font resolution (same machinery, one role) ----
    var installed = [];
    for (var fi = 0; fi < app.textFonts.length; fi++) installed.push(app.textFonts[fi].name);
    function has(ps) { for (var i = 0; i < installed.length; i++) if (installed[i] === ps) return true; return false; }
    var faceWarnings = 0;
    var psTitle = null;
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

    log("TOLD STRAIGHT — favicon derivation from M1");
    log("Built " + new Date().toString());
    log("");

    // ---- document + boards (two centred rows) ----
    // Row 1: 900+512+180 + 2*220 = 2032 -> start -1016
    // Row 2: 32+32+16+1600 + 3*220 = 2340 -> start -1170
    var GUTTER = 220;
    var doc = app.documents.add(DocumentColorSpace.RGB, 900, 900);
    try { doc.rulerUnits = RulerUnits.Points; } catch (e) {}

    var BOARDS = [];
    // Row 3 holds MAGNIFIED companions of the three tiny boards — a 32pt
    // artboard beside a 900pt one is a speck you have to hunt for, which
    // made run 1 unjudgeable. Same geometry, scaled up: shape decisions
    // are visible there, legibility is judged on the exported PNGs.
    // Row 4: 512+180+32+16+512 + 4*220 = 2132 -> start -1066
    var cursor = { r1: -1016, r2: -1170, r3: -988, r4: -1066 };
    function addBoard(row, name, w, h) {
        var left, top;
        if (row === 1) { left = cursor.r1; top = h / 2;  cursor.r1 += w + GUTTER; }
        else if (row === 2) { left = cursor.r2; top = -700; cursor.r2 += w + GUTTER; }
        else if (row === 3) { left = cursor.r3; top = -2500; cursor.r3 += w + GUTTER; }
        else           { left = cursor.r4; top = -3300; cursor.r4 += w + GUTTER; }
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

    var bRef  = addBoard(1, "m1-master-ref",        900, 900);
    var b512  = addBoard(1, "favicon-512-maskable", 512, 512);
    var b180  = addBoard(1, "favicon-180",          180, 180);
    var b32f  = addBoard(2, "favicon-32-framed",     32,  32);
    var b32n  = addBoard(2, "favicon-32-frameless",  32,  32);
    var b16   = addBoard(2, "favicon-16",            16,  16);
    var bAud  = addBoard(2, "AUDIT",               1600, 1600);

    function layer(name) {
        var l; try { l = doc.layers.getByName(name); } catch (e) { l = doc.layers.add(); l.name = name; } return l;
    }
    var lyType  = layer("TYPE");
    var lyRules = layer("RULES");
    var lyPaper = layer("PAPER");
    try { lyPaper.zOrder(ZOrderMethod.SENDTOBACK); } catch (e) {}
    try { lyType.zOrder(ZOrderMethod.BRINGTOFRONT); } catch (e) {}   // rules-above-type lesson

    function px(b, x) { return b.x + x; }
    function py(b, y) { return b.y - y; }
    function fillRect(ly, b, y, x, w, h, colour) {
        var r = ly.pathItems.rectangle(py(b, y), px(b, x), w, h);
        r.filled = true; r.fillColor = colour; r.stroked = false; return r;
    }
    function styleFor(sizePt, tracking, dark) {
        var nm = "TS/" + sizePt + (dark ? "/dark" : "");
        var st; try { st = doc.paragraphStyles.getByName(nm); } catch (e) { st = doc.paragraphStyles.add(nm); }
        try {
            var ca = st.characterAttributes;
            ca.size = sizePt; ca.leading = sizePt; ca.tracking = tracking; ca.autoLeading = false;
            ca.fillColor = dark ? C.dink : C.ink; if (fTitle) ca.textFont = fTitle;
        } catch (e2) {}
        return st;
    }
    function tsCentred(b, capY, sizePt, tracking, dark) {
        var tf;
        try { tf = lyType.textFrames.add(); } catch (e) { return null; }
        tf.contents = "TS";
        try { styleFor(sizePt, tracking, dark).applyTo(tf.textRange, true); } catch (e2) {}
        try { tf.top = py(b, capY); tf.left = px(b, 0); } catch (e3) {}
        try { tf.left = px(b, (b.w - tf.width) / 2); } catch (e4) {}
        return tf;
    }

    // One derivation function: everything scales off the edge size.
    // frame=true draws the box as NESTED FILLS (ink square, then paper
    // square inset by the frame thickness) — no strokes anywhere.
    function favicon(b, opts) {
        var dark  = !!opts.dark;
        var bg    = dark ? C.dpaper : C.paper;
        var fg    = dark ? C.dink   : C.ink;
        var accent= dark ? C.dred   : C.red;
        fillRect(lyPaper, b, 0, 0, b.w, b.h, bg);
        var inset = opts.inset;                       // maskable safe zone
        if (opts.frame > 0) {
            fillRect(lyRules, b, inset, inset, b.w - inset * 2, b.h - inset * 2, fg);
            fillRect(lyRules, b, inset + opts.frame, inset + opts.frame,
                     b.w - (inset + opts.frame) * 2, b.h - (inset + opts.frame) * 2, bg);
        }
        tsCentred(b, opts.tsY, opts.tsSize, opts.track, dark);
        fillRect(lyRules, b, opts.barY, (b.w - opts.barW) / 2, opts.barW, opts.barH, accent);
    }

    // ---- reference: the M1 master as promoted (strokes and all) ----
    (function () {
        var b = bRef;
        fillRect(lyPaper, b, 0, 0, b.w, b.h, C.paper);
        var box = lyRules.pathItems.rectangle(py(b, 60), px(b, 60), b.w - 120, b.h - 120);
        box.filled = false; box.stroked = true; box.strokeColor = C.ink; box.strokeWidth = 14;
        tsCentred(b, 190, 480, -10);
        fillRect(lyRules, b, 640, 240, 420, 16, C.red);
    })();

    // ---- the derivations, each tuned to its size ----
    favicon(b512, { inset: 51, frame: 36, tsY: 150, tsSize: 250, track: -10, barY: 372, barW: 220, barH: 22 });
    favicon(b180, { inset: 0,  frame: 14, tsY:  48, tsSize:  92, track: -10, barY: 132, barW:  80, barH:  9 });
    favicon(b32f, { inset: 0,  frame: 3,  tsY:   8, tsSize:  16, track:  -5, barY:  24, barW:  15, barH:  2.5 });
    favicon(b32n, { inset: 0,  frame: 0,  tsY:   6, tsSize:  19, track:  -5, barY:  25, barW:  17, barH:  3 });
    favicon(b16,  { inset: 0,  frame: 0,  tsY:   2.5, tsSize: 10, track:  0, barY: 12.5, barW:   9, barH:  1.8 });

    // ---- MAGNIFIED companions (added last so export indices 0-5 above
    //      still map to the true-size boards). Every parameter is the
    //      tiny board's value times the scale factor, so these ARE the
    //      same artwork — nothing is redrawn or prettified.
    //      32-framed and 32-frameless at 16x; 16 at 32x. All land on
    //      512pt boards, so the two 32s are directly comparable.
    var bMag32f = addBoard(3, "MAGNIFIED-32-framed-16x",    512, 512);
    var bMag32n = addBoard(3, "MAGNIFIED-32-frameless-16x", 512, 512);
    var bMag16  = addBoard(3, "MAGNIFIED-16-32x",           512, 512);

    favicon(bMag32f, { inset: 0, frame: 48, tsY: 128, tsSize: 256, track: -5, barY: 384, barW: 240, barH: 40 });
    favicon(bMag32n, { inset: 0, frame: 0,  tsY:  96, tsSize: 304, track: -5, barY: 400, barW: 272, barH: 48 });
    favicon(bMag16,  { inset: 0, frame: 0,  tsY:  80, tsSize: 320, track:  0, barY: 400, barW: 288, barH: 57.6 });

    /* DARK TWINS of the decided set — same geometry, dark tokens only,
       so light and dark cannot drift apart. Decided 2026-07-28:
       frameless at 32 and below, framed at 180 and above.
       These are a genuine PAIR: browsers serve each viewer the right one
       via <link rel="icon" media="(prefers-color-scheme: dark)">.
       A cream favicon in a dark browser tab reads as a glowing chiclet;
       that is the problem these solve. */
    var b512d = addBoard(4, "favicon-512-maskable-DARK", 512, 512);
    var b180d = addBoard(4, "favicon-180-DARK",          180, 180);
    var b32d  = addBoard(4, "favicon-32-frameless-DARK",  32,  32);
    var b16d  = addBoard(4, "favicon-16-DARK",            16,  16);
    var bMag32nd = addBoard(4, "MAGNIFIED-32-frameless-DARK-16x", 512, 512);

    favicon(b512d, { dark: true, inset: 51, frame: 36, tsY: 150, tsSize: 250, track: -10, barY: 372, barW: 220, barH: 22 });
    favicon(b180d, { dark: true, inset: 0,  frame: 14, tsY:  48, tsSize:  92, track: -10, barY: 132, barW:  80, barH:  9 });
    favicon(b32d,  { dark: true, inset: 0,  frame: 0,  tsY:   6, tsSize:  19, track:  -5, barY:  25, barW:  17, barH:  3 });
    favicon(b16d,  { dark: true, inset: 0,  frame: 0,  tsY:   2.5, tsSize: 10, track: 0, barY: 12.5, barW:   9, barH:  1.8 });
    favicon(bMag32nd, { dark: true, inset: 0, frame: 0, tsY: 96, tsSize: 304, track: -5, barY: 400, barW: 272, barH: 48 });

    // ---- audit ----
    log("WHAT THIS RUN IS");
    log("  Fills-only favicon derivations of mark M1 (ADR 0015) at true");
    log("  pixel sizes. Judge the small boards at View > Actual Size —");
    log("  100% zoom IS the browser-tab rendering.");
    log("");
    log("THE ONE QUESTION: at 32px, framed or frameless?");
    log("  16 is frameless by necessity; 180/512 keep the frame easily.");
    log("  512 keeps content inside the centre ~80% (maskable safe zone).");
    log("");
    log("HOW TO ACTUALLY JUDGE IT — run 1's boards were unfindable");
    log("  A 32pt artboard beside a 900pt one is a speck. So:");
    log("  * SHAPE decision -> the MAGNIFIED-* boards (bottom row). Same");
    log("    geometry scaled 16x/32x, nothing redrawn. Compare the two");
    log("    32s side by side there.");
    log("  * LEGIBILITY decision -> the exported PNGs in Finder at actual");
    log("    size. That is the honest test; magnification cannot answer it.");
    log("");
    log("DARK TWINS — row 4, added 2026-07-28");
    log("  The decided set again on dark stock: frameless at 32 and 16,");
    log("  framed at 180 and 512. Same geometry, dark tokens only, so the");
    log("  pair cannot drift. Rule/bar is #E4564F (5.05:1 measured on");
    log("  #14140F); the print red is 2.82:1 there and fails everything.");
    log("  These ARE a genuine pair — browsers honour");
    log("  <link rel=\"icon\" media=\"(prefers-color-scheme: dark)\">, so");
    log("  each viewer gets the right one. Only two surfaces in this whole");
    log("  system can do that: favicons and the README header. The GitHub");
    log("  social preview and the OG card take ONE image with no theme");
    log("  signal, so their dark boards are alternatives, not companions.");
    log("");
    log("NO STROKES EXIST on the derivation boards — frames are nested");
    log("  filled rectangles. The 900 reference board is the promoted M1");
    log("  as-is, strokes included, for side-by-side context.");
    log("");
    log("Sizes and positions: EYEBALLED per size class. Adjust freely.");

    fillRect(lyPaper, bAud, 0, 0, bAud.w, bAud.h, C.paper);
    (function () {
        var bx = lyType.pathItems.rectangle(py(bAud, 90), px(bAud, 90), bAud.w - 180, bAud.h - 180);
        var tf; try { tf = lyType.textFrames.areaText(bx); } catch (e) { return; }
        tf.contents = report.join("\r");
        var st = styleFor(19, 0);
        try { st.characterAttributes.leading = 27; st.applyTo(tf.textRange, true); } catch (e2) {}
    })();

    try { app.executeMenuCommand("fitall"); } catch (e) {}

    // ---- export: PNG per board at native px + SVG master of the 512 ----
    var exportNote = "";
    if (EXPORT_PNG) {
        try {
            var dir = new Folder(EXPORT_DIR);
            if (!dir.exists) dir.create();
            var opts = new ExportOptionsPNG24();
            opts.artBoardClipping = true; opts.transparency = false;
            opts.horizontalScale = 100; opts.verticalScale = 100;
            var names = [
                "20260728-adobe-illustrator-toldstraight-m1-master-ref-900",
                "20260728-adobe-illustrator-toldstraight-favicon-512-maskable",
                "20260728-adobe-illustrator-toldstraight-favicon-180-appletouch",
                "20260728-adobe-illustrator-toldstraight-favicon-32-framed",
                "20260728-adobe-illustrator-toldstraight-favicon-32-frameless",
                "20260728-adobe-illustrator-toldstraight-favicon-16"
            ];
            for (var e5 = 0; e5 < names.length; e5++) {
                doc.artboards.setActiveArtboardIndex(e5);
                doc.exportFile(new File(dir.fsName + "/" + names[e5] + ".png"), ExportType.PNG24, opts);
            }
            // Dark twins live at indices 10-13 (after the 3 magnified boards
            // at 7-9). Named by index so a board reorder breaks loudly here
            // rather than silently exporting the wrong artwork.
            var darkIdx   = [10, 11, 12, 13];
            var darkNames = [
                "20260728-adobe-illustrator-toldstraight-favicon-512-maskable-dark",
                "20260728-adobe-illustrator-toldstraight-favicon-180-appletouch-dark",
                "20260728-adobe-illustrator-toldstraight-favicon-32-frameless-dark",
                "20260728-adobe-illustrator-toldstraight-favicon-16-dark"
            ];
            for (var d5 = 0; d5 < darkIdx.length; d5++) {
                if (darkIdx[d5] >= doc.artboards.length) continue;
                doc.artboards.setActiveArtboardIndex(darkIdx[d5]);
                doc.exportFile(new File(dir.fsName + "/" + darkNames[d5] + ".png"), ExportType.PNG24, opts);
            }
            names = names.concat(darkNames);
            var svgo = new ExportOptionsSVG();
            svgo.saveMultipleArtboards = true; svgo.artboardRange = "2";   // the 512 board
            doc.exportFile(new File(dir.fsName + "/20260728-adobe-illustrator-toldstraight-favicon-master"), ExportType.SVG, svgo);
            exportNote = "\n" + names.length + " PNGs + 1 SVG written to " + EXPORT_DIR + "\n";
        } catch (e6) { exportNote = "\nExport failed: " + e6 + "\n"; }
    }

    alert("Told Straight — favicon derivations built.\n\n"
        + "SHAPE: compare the MAGNIFIED-* boards (bottom row) — same\n"
        + "geometry at 16x/32x, so the tiny boards are actually visible.\n"
        + "LEGIBILITY: open the exported PNGs in Finder at actual size.\n\n"
        + "ONE question: 32px framed or frameless?\n\n"
        + "Title face: " + (psTitle || "DEFAULT") + "\n"
        + (faceWarnings === 0 ? "Face resolved at intended weight.\n"
                              : "*** FACE COMPROMISED — stop before judging. ***\n")
        + exportNote
        + "\nNothing here touches episodes/ or the feed.");

})();
