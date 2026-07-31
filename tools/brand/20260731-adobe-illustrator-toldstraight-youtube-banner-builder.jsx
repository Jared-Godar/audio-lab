/**
 * Told Straight — YOUTUBE CHANNEL BANNER  2048 x 1152   (ILLUSTRATOR)
 * ===================================================================
 * Stacked (two-line) wordmark + red rule + authority line + the DECLASSIFY ON
 * stamp from ADR 0019. Three swappable states, one fixed lockup.
 *
 * Reference builders followed for conventions, palette, measured-type
 * discipline and export machinery:
 *   tools/brand/20260731-adobe-illustrator-toldstraight-x-header-builder.jsx
 *   tools/brand/20260728-adobe-illustrator-toldstraight-readme-header-and-social-cards-builder.jsx
 *
 * DIMENSIONS — MEASURED FROM YOUTUBE STUDIO, 2026-07-31
 * -----------------------------------------------------
 * Read from Studio > Customisation > Profile > Banner image, verbatim:
 *
 *     "For the best results on all devices, use an image that's
 *      at least 2048 x 1152 pixels and 6MB or less."
 *
 * Also measured on that screen, and both matter:
 *     Handle changes  — twice per 14 days, previous handle held 14 days
 *     Name changes    — twice in 14 days
 *
 * THE REAL PROBLEM: ONE IMAGE, THREE CROPS
 * ----------------------------------------
 * 2048 x 1152 is 16:9, but YouTube renders it differently per device — TV
 * shows the full frame, desktop a wide band, mobile a narrow strip. The region
 * guaranteed visible EVERYWHERE is the centred "safe area", widely published
 * as 1235 x 338. On a 2048 x 1152 canvas that is:
 *
 *     x 407 - 1641,  y 407 - 745        (about 29% of the canvas HEIGHT (338 of 1152))
 *
 * So this is not a 16:9 design with a margin. It is a 1235 x 338 banner with
 * 1.8 million sacrificial pixels around it. Designing to the full canvas is
 * precisely how a wordmark ends up cropped off on phones — the mistake the X
 * header made at smaller scale before its crop was measured.
 *
 * *** THE 1235 x 338 FIGURE IS PUBLISHED, NOT MEASURED BY US. ***
 * Treat it the way X's crop was treated BEFORE measurement: a starting
 * constraint, not a specification. After uploading, screenshot the live
 * channel on desktop AND phone, solve the scale from a known element (the red
 * rule works well — it has hard edges and a known width), and replace these
 * constants with measured ones. X's published 3:1 turned out to render at
 * 2.62:1 on a real handset; assume YouTube is no kinder.
 *
 * THREE STATES, ONE FIXED LOCKUP
 * ------------------------------
 *   1  DECLASSIFY   red stamp, pre-launch      (use now)
 *   2  PLAIN        no stamp, permanent        (after launch week)
 *   3  LIVE         green stamp, launch week   (06 Aug + ~7 days)
 *
 * Lockup geometry is IDENTICAL across all three — these get swapped on a live
 * channel, and a lockup that shifts between swaps reads as a rebrand.
 *
 * THE GREEN IS A NEW TOKEN, OWED TO THE DESIGN SYSTEM
 * ---------------------------------------------------
 * Light #1F6B45 = 5.34:1 on paper (brand red 5.40, delta -0.07)
 * Dark  #3C9963 = 5.22:1 on #14140F (dark red 5.05, delta +0.17)
 * Chosen by MEASUREMENT so the green carries the same optical weight as the
 * red in both themes. Neither value is in
 * brand/20260727-toldstraight-design-tokens.css yet, and there is no ADR.
 * Both are owed. Written, not in force.
 *
 * TYPE IS MEASURED, NOT ESTIMATED
 * -------------------------------
 * Every line is OUTLINED and measured (createOutline -> path bounds), because
 * geometricBounds on LIVE text returns the em/leading box, not the ink. Point
 * sizes are SOLVED to hit a target width. The stacked wordmark solves its size
 * on the LONGER word and reuses it for the shorter one, so both lines share
 * one size the way the webpage does.
 *
 * TO RUN:  File > Scripts > Other Script...  and pick this file.
 * IT NEVER TOUCHES AN OPEN DOCUMENT. It always creates a new one.
 */

#target illustrator

(function () {

    var thisApp = "an unknown application";
    try { thisApp = String(app.name); } catch (e) {}
    if (thisApp.indexOf("Illustrator") === -1) {
        alert("WRONG APPLICATION\n\nThis is an ILLUSTRATOR script (Told Straight YouTube banner).\n"
            + "You are running it in: " + thisApp + "\n\nNothing was created or changed.");
        return;
    }

    // ================= EDIT THESE =================
    var GO_LIVE_DATE = "06 AUG 2026";
    var GO_LIVE_TIME = "09:00 EDT";
    var AUTHORITY    = "DEPT. OF NEURODEVELOPMENTAL AFFAIRS";
    // ==============================================

    var FACE_TITLE = "TradeGothicNextLTPro-BdCn";
    var FACE_MONO  = "LetterGothicStd";
    var SEARCH_TITLE = [
        { require: ["tradegothicnext"], exclude: ["italic", "oblique"], prefer: ["bdcn", "boldcond", "hvcn"] },
        { require: ["helveticaneueltpro"], exclude: ["italic", "oblique"], prefer: ["bdcn", "blkcn"] }
    ];
    var SEARCH_MONO = [
        { require: ["lettergothic"], exclude: ["italic", "oblique"], prefer: ["std", "bold"] },
        { require: ["couriernew"], exclude: ["italic", "oblique"], prefer: ["bold", "psmt"] }
    ];

    var EXPORT_PNG = true;
    var EXPORT_DIR = "~/Code/audio-lab/output/artwork/brand-youtube-banner";

    var PALETTE = {
        paper: [237, 233, 224], ink: [17, 17, 17], red: [176, 42, 40],
        grey: [120, 116, 108], green: [31, 107, 69], dgreen: [60, 153, 99]
    };
    var report = [];
    function log(s) { report.push(s); }
    function rgb(t) { var c = new RGBColor(); c.red = t[0]; c.green = t[1]; c.blue = t[2]; return c; }
    var C = { paper: rgb(PALETTE.paper), ink: rgb(PALETTE.ink), red: rgb(PALETTE.red),
              grey: rgb(PALETTE.grey), green: rgb(PALETTE.green) };

    // ---- font resolution ----
    var installed = [];
    for (var fi = 0; fi < app.textFonts.length; fi++) installed.push(app.textFonts[fi].name);
    function has(ps) { for (var i = 0; i < installed.length; i++) if (installed[i] === ps) return true; return false; }
    var faceWarnings = 0;
    function resolve(pinned, groups, label) {
        if (has(pinned)) { log("  " + label + ": " + pinned + "   (pinned)"); return pinned; }
        faceWarnings++;
        log("  " + label + ": PINNED '" + pinned + "' NOT INSTALLED — searching");
        for (var g = 0; g < groups.length; g++) {
            for (var i = 0; i < installed.length; i++) {
                var nm = installed[i].toLowerCase(), ok = true, j;
                for (j = 0; j < groups[g].require.length; j++)
                    if (nm.indexOf(groups[g].require[j]) === -1) { ok = false; break; }
                if (ok) for (j = 0; j < groups[g].exclude.length; j++)
                    if (nm.indexOf(groups[g].exclude[j]) !== -1) { ok = false; break; }
                if (!ok) continue;
                for (j = 0; j < groups[g].prefer.length; j++)
                    if (nm.indexOf(groups[g].prefer[j]) !== -1) {
                        log("  " + label + ": " + installed[i] + "   (fallback)"); return installed[i];
                    }
            }
        }
        log("  " + label + ": NOTHING MATCHED — Illustrator default");
        return null;
    }
    var psTitle = resolve(FACE_TITLE, SEARCH_TITLE, "title");
    var psMono  = resolve(FACE_MONO,  SEARCH_MONO,  "mono ");
    var fTitle = null, fMono = null;
    try { fTitle = app.textFonts.getByName(psTitle); } catch (e) {}
    try { fMono  = app.textFonts.getByName(psMono);  } catch (e) {}

    log("TOLD STRAIGHT — YouTube banner 2048x1152");
    log("Built " + new Date().toString());
    log("");

    // ---- document + boards ----
    var W = 2048, H = 1152;
    var doc = app.documents.add(DocumentColorSpace.RGB, W, H);
    try { doc.rulerUnits = RulerUnits.Points; } catch (e) {}

    var GUTTER = 260;
    var BOARDS = [];
    var cursor = { r1: -3500, r2: -3500, r3: -800 };
    var ROWTOP = { 1: 0, 2: -1500, 3: -3000 };

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

    var lyArt = doc.layers.add(); lyArt.name = "BANNERS";
    var lyAudit = doc.layers.add(); lyAudit.name = "AUDIT";

    function px(b, x) { return b.x + x; }
    function py(b, y) { return b.y - y; }
    function fillRectIn(grp, b, y, x, w, h, colour) {
        var r = grp.pathItems.rectangle(py(b, y), px(b, x), w, h);
        r.filled = true; r.fillColor = colour; r.stroked = false; return r;
    }

    function makeLine(container, txt, sizePt, tracking, colour, fontObj) {
        var tf;
        try { tf = container.textFrames.add(); } catch (e) { return null; }
        tf.contents = txt;
        try {
            var ca = tf.textRange.characterAttributes;
            ca.size = sizePt; ca.leading = sizePt; ca.autoLeading = false;
            ca.tracking = tracking; ca.fillColor = colour;
            if (fontObj) ca.textFont = fontObj;
        } catch (e2) {}
        var item = tf;
        try { item = tf.createOutline(); }
        catch (e3) { log("WARN: createOutline failed for '" + txt + "' — measuring em box"); }
        var gb = null;
        try { gb = item.geometricBounds; } catch (e4) {}
        if (!gb) return null;
        return { item: item, gb: gb, w: gb[2] - gb[0], h: gb[1] - gb[3], size: sizePt };
    }
    function fitLine(container, txt, targetW, tracking, colour, fontObj) {
        var probe = makeLine(container, txt, 100, tracking, colour, fontObj);
        if (!probe || probe.w <= 0) return null;
        var w100 = probe.w;
        try { probe.item.remove(); } catch (e) {}
        return makeLine(container, txt, 100 * targetW / w100, tracking, colour, fontObj);
    }
    function place(L, left, top) {
        if (!L) return;
        try { L.item.translate(left - L.gb[0], top - L.gb[1]); L.gb = L.item.geometricBounds; }
        catch (e) { log("WARN: translate failed — " + e); }
    }

    /* ---- THE SAFE AREA IS THE DESIGN ----
       Published (NOT measured by us) centred safe area: 1235 x 338. */
    var SAFE_W = 1235, SAFE_H = 338;
    var SAFE_L = Math.round((W - SAFE_W) / 2);   // 407
    var SAFE_T = Math.round((H - SAFE_H) / 2);   // 407
    var SAFE_R = SAFE_L + SAFE_W;                // 1642
    var SAFE_B = SAFE_T + SAFE_H;                // 745

    // Lockup constants, expressed relative to the safe band — never the canvas.
    var PAD_L      = 8;      // inset from the safe band's left edge
    var WM_TARGET  = 380;    // measure of the LONGER word, "STRAIGHT"
    var WM_TOP     = 32;     // from the safe band's top
    var LINE_GAP_R = 0.10;   // fraction of cap height between the two words
    var RULE_H     = 12;
    var RULE_GAP   = 24;
    var AUTH_GAP   = 22;
    var AUTH_SIZE  = 17;
    var AUTH_TRACK = 280;
    var STAMP_SCALE = 0.95;
    var STAMP_CX = 1420, STAMP_CY = SAFE_T + SAFE_H / 2;

    function lockup(grp, b) {
        // Solve the size on the LONGER word, reuse it for the shorter one, so
        // both lines share ONE point size the way site/index.html does.
        var wm2 = fitLine(grp, "STRAIGHT", WM_TARGET, -15, C.ink, fTitle);
        if (!wm2) return null;
        var wm = makeLine(grp, "TOLD", wm2.size, -15, C.ink, fTitle);
        if (!wm) return null;

        var x0 = SAFE_L + PAD_L;
        var yTop = SAFE_T + WM_TOP;
        place(wm,  px(b, x0), py(b, yTop));
        var y2 = yTop + wm.h + wm.h * LINE_GAP_R;
        place(wm2, px(b, x0), py(b, y2));
        var bottom = y2 + wm2.h;

        var ruleY = bottom + RULE_GAP;
        fillRectIn(grp, b, ruleY, x0, wm2.w, RULE_H, C.red);

        var auth = makeLine(grp, AUTHORITY, AUTH_SIZE, AUTH_TRACK, C.grey, fTitle);
        place(auth, px(b, x0), py(b, ruleY + RULE_H + AUTH_GAP));

        // Right edge is the WIDEST THING DRAWN, measured — not a predicted value.
        var right = Math.max(x0 + wm2.w, auth ? x0 + auth.w : 0);
        return { bottom: ruleY + RULE_H + AUTH_GAP + (auth ? auth.h : 0),
                 right: right, wmW: wm2.w, wmH: wm2.h, authW: auth ? auth.w : 0 };
    }

    function stamp(grp, b, cx, cy, l1, l2, l3, colour) {
        var sg;
        try { sg = grp.groupItems.add(); } catch (e) { return null; }
        var S = STAMP_SCALE;
        var a  = makeLine(sg, l1, 26 * S, 140, colour, fTitle);
        var c2 = makeLine(sg, l2, 62 * S,  20, colour, fTitle);
        var c3 = l3 ? makeLine(sg, l3, 23 * S, 100, colour, fMono) : null;
        if (!a || !c2) return null;

        var g1 = c2.h * 0.30, g2 = c2.h * 0.26;
        var blockH = a.h + g1 + c2.h + (c3 ? g2 + c3.h : 0);
        var blockW = Math.max(a.w, c2.w, c3 ? c3.w : 0);
        var PADX = c2.h * 0.55, PADY = c2.h * 0.42;
        var boxW = blockW + PADX * 2, boxH = blockH + PADY * 2;
        var boxL = px(b, cx) - boxW / 2, boxT = py(b, cy) + boxH / 2;

        var y = boxT - PADY;
        place(a,  px(b, cx) - a.w / 2,  y);  y -= a.h + g1;
        place(c2, px(b, cx) - c2.w / 2, y);  y -= c2.h + g2;
        if (c3) place(c3, px(b, cx) - c3.w / 2, y);

        var OUT = 6, GAPR = 7, INR = 2.5;
        function frame(inset, thick) {
            var o = sg.pathItems.rectangle(boxT - inset, boxL + inset, boxW - inset * 2, boxH - inset * 2);
            o.filled = true; o.fillColor = colour; o.stroked = false;
            var i2 = sg.pathItems.rectangle(boxT - inset - thick, boxL + inset + thick,
                                            boxW - (inset + thick) * 2, boxH - (inset + thick) * 2);
            i2.filled = true; i2.fillColor = C.paper; i2.stroked = false;
            try { o.zOrder(ZOrderMethod.SENDTOBACK); i2.zOrder(ZOrderMethod.SENDTOBACK);
                  o.zOrder(ZOrderMethod.SENDTOBACK); } catch (e) {}
        }
        frame(OUT + GAPR, INR);
        frame(0, OUT);
        var bg = sg.pathItems.rectangle(boxT, boxL, boxW, boxH);
        bg.filled = true; bg.fillColor = C.paper; bg.stroked = false;
        try { bg.zOrder(ZOrderMethod.SENDTOBACK); } catch (e) {}
        try { sg.rotate(-7); } catch (e) { log("WARN: stamp rotate failed — " + e); }
        return { w: boxW, h: boxH };
    }

    function banner(b, opts) {
        var grp = lyArt.groupItems.add();
        fillRectIn(grp, b, 0, 0, b.w, b.h, C.paper);
        var lk = lockup(grp, b);

        var st = null;
        if (opts.state === "declassify")
            st = stamp(grp, b, STAMP_CX, STAMP_CY, "DECLASSIFY ON", GO_LIVE_DATE, GO_LIVE_TIME, C.red);
        else if (opts.state === "live")
            st = stamp(grp, b, STAMP_CX, STAMP_CY, "LIVE AS OF", GO_LIVE_DATE, GO_LIVE_TIME, C.green);

        // ---- audit runs on EVERY board, against the safe band ----
        log("  " + b.name);
        var stL = st ? STAMP_CX - st.w / 2 : null;
        var stR = st ? STAMP_CX + st.w / 2 : null;
        log("     wordmark ink " + Math.round(lk ? lk.wmW : 0) + " x " + Math.round(lk ? lk.wmH : 0)
            + "   authority w " + Math.round(lk ? lk.authW : 0)
            + "   lockup x " + Math.round(SAFE_L + PAD_L) + "-" + Math.round(lk ? lk.right : 0)
            + "   bottom y=" + Math.round(lk ? lk.bottom : 0));
        log("     vs SAFE x " + SAFE_L + "-" + SAFE_R + "  y " + SAFE_T + "-" + SAFE_B + "   -> "
            + ((lk && lk.bottom <= SAFE_B && lk.right <= SAFE_R && (SAFE_T + WM_TOP) >= SAFE_T)
               ? "PASS" : "*** FAIL — outside the safe band ***"));
        if (st) {
            log("     stamp box " + Math.round(st.w) + " x " + Math.round(st.h)
                + "   x " + Math.round(stL) + "-" + Math.round(stR)
                + "   -> " + ((stL >= SAFE_L && stR <= SAFE_R) ? "PASS"
                              : "*** FAIL — outside the safe band ***"));
            var clear = stL - (lk ? lk.right : 0);
            log("     lockup->stamp clearance " + Math.round(clear) + "px   -> "
                + (clear >= 40 ? "PASS" : (clear >= 0 ? "*** TIGHT ***"
                                                      : "*** FAIL — OVERLAP ***")));
        }

        /* SAFE-AREA PREVIEW: dim everything outside the 1235x338 band, i.e.
           everything a phone may not show. Judging only — never upload these. */
        if (opts.preview) {
            function dim(x, y, w, h) {
                var d = grp.pathItems.rectangle(py(b, y), px(b, x), w, h);
                d.filled = true; d.fillColor = C.ink; d.stroked = false;
                try { d.opacity = 58; } catch (e) {}
            }
            dim(0, 0, b.w, SAFE_T);                          // above
            dim(0, SAFE_B, b.w, b.h - SAFE_B);               // below
            dim(0, SAFE_T, SAFE_L, SAFE_H);                  // left
            dim(SAFE_R, SAFE_T, b.w - SAFE_R, SAFE_H);       // right
            var gl = makeLine(grp, "DIMMED = MAY BE CROPPED. SAFE AREA 1235x338 IS PUBLISHED, NOT MEASURED — VERIFY ON A LIVE UPLOAD.",
                              20, 120, C.red, fMono);
            place(gl, px(b, SAFE_L), py(b, SAFE_B + 60));
        }
        return grp;
    }

    log("MEASURED CHECKS — EVERY BOARD, against the 1235x338 safe band");

    // ROW 1 — uploadable
    var b1 = addBoard(1, "yt-banner-DECLASSIFY-2048x1152", W, H);
    var b2 = addBoard(1, "yt-banner-PLAIN-2048x1152",      W, H);
    var b3 = addBoard(1, "yt-banner-LIVE-2048x1152",       W, H);
    banner(b1, { state: "declassify" });
    banner(b2, { state: "none" });
    banner(b3, { state: "live" });

    // ROW 2 — safe-area previews
    var p1 = addBoard(2, "SAFEAREA-DECLASSIFY", W, H);
    var p2 = addBoard(2, "SAFEAREA-PLAIN",      W, H);
    var p3 = addBoard(2, "SAFEAREA-LIVE",       W, H);
    banner(p1, { state: "declassify", preview: true });
    banner(p2, { state: "none",       preview: true });
    banner(p3, { state: "live",       preview: true });

    // ---- AUDIT ----
    log("");
    log("DIMENSIONS — MEASURED from YouTube Studio 2026-07-31");
    log("  \"at least 2048 x 1152 pixels and 6MB or less\"");
    log("  Handle changes: twice per 14 days (old handle held 14 days).");
    log("  Name changes:   twice in 14 days. Get both right the first time.");
    log("");
    log("ONE IMAGE, THREE CROPS — WHY THIS IS NOT A 16:9 DESIGN");
    log("  TV shows the full frame, desktop a wide band, mobile a narrow strip.");
    log("  The region visible EVERYWHERE is the centred safe area, 1235 x 338:");
    log("");
    log("      x " + SAFE_L + " - " + SAFE_R + "     y " + SAFE_T + " - " + SAFE_B);
    log("");
    log("  That is about 29% of the canvas HEIGHT (338 of 1152). So this is a 1235 x 338");
    log("  banner with ~1.8 million sacrificial pixels around it. Designing to");
    log("  the full canvas is exactly how a wordmark gets cropped off on a");
    log("  phone — the mistake the X header made before its crop was measured.");
    log("");
    log("*** THE SAFE AREA IS PUBLISHED, NOT MEASURED BY US ***");
    log("  Treat 1235 x 338 the way X's 3:1 was treated BEFORE measurement: a");
    log("  starting constraint, not a specification. After uploading,");
    log("  screenshot the live channel on desktop AND phone, solve the scale");
    log("  from a known element (the red rule — hard edges, known width), and");
    log("  replace these constants. X's published 3:1 rendered at 2.62:1 on a");
    log("  real handset. Assume YouTube is no kinder until shown otherwise.");
    log("");
    log("THREE STATES, ONE FIXED LOCKUP");
    log("  1 DECLASSIFY red — now   2 PLAIN — permanent   3 LIVE green — launch week");
    log("  Geometry is identical across all three. They get swapped on a live");
    log("  channel; a lockup that moves between swaps reads as a rebrand.");
    log("");
    log("THE GREEN IS OWED TO THE DESIGN SYSTEM");
    log("  --ts-green      #1F6B45  5.34:1 on #EDE9E0  (red 5.40, -0.07)");
    log("  --ts-green-dark #3C9963  5.22:1 on #14140F  (red 5.05, +0.17)");
    log("  Neither is in the tokens CSS; there is no ADR. Written, not in force.");
    log("");
    log("TYPE IS SOLVED, NOT GUESSED");
    log("  Outlined and measured, then the point size is SOLVED to a target");
    log("  width. The stacked wordmark solves on the LONGER word (STRAIGHT) and");
    log("  reuses that size for TOLD, so both share one size as the webpage");
    log("  does — fitting each line to the same width would silently make TOLD");
    log("  larger, which is a bug the X header shipped once.");
    log("");
    log("WHAT TO UPLOAD: row 1 only. Row 2 has the dim mask burned in.");

    var bAud = addBoard(3, "AUDIT", 1600, 2000);
    (function () {
        var bgr = lyAudit.pathItems.rectangle(py(bAud, 0), px(bAud, 0), bAud.w, bAud.h);
        bgr.filled = true; bgr.fillColor = C.paper; bgr.stroked = false;
        var bx = lyAudit.pathItems.rectangle(py(bAud, 80), px(bAud, 80), bAud.w - 160, bAud.h - 160);
        var tf; try { tf = lyAudit.textFrames.areaText(bx); } catch (e) { return; }
        tf.contents = report.join("\r");
        try {
            var ca = tf.textRange.characterAttributes;
            ca.size = 18; ca.leading = 25; ca.autoLeading = false; ca.fillColor = C.ink;
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
            opts.artBoardClipping = true; opts.transparency = false;
            opts.horizontalScale = 100; opts.verticalScale = 100;
            var names = [
                "20260731-adobe-illustrator-toldstraight-youtube-banner-declassify-2048x1152",
                "20260731-adobe-illustrator-toldstraight-youtube-banner-plain-2048x1152",
                "20260731-adobe-illustrator-toldstraight-youtube-banner-live-2048x1152",
                "20260731-adobe-illustrator-toldstraight-youtube-banner-safearea-declassify-2048x1152",
                "20260731-adobe-illustrator-toldstraight-youtube-banner-safearea-plain-2048x1152",
                "20260731-adobe-illustrator-toldstraight-youtube-banner-safearea-live-2048x1152"
            ];
            for (var e5 = 0; e5 < names.length; e5++) {
                if (e5 >= doc.artboards.length) continue;
                doc.artboards.setActiveArtboardIndex(e5);
                doc.exportFile(new File(dir.fsName + "/" + names[e5] + ".png"), ExportType.PNG24, opts);
            }
            exportNote = "\n" + names.length + " PNGs written to " + EXPORT_DIR + "\n";
        } catch (e6) { exportNote = "\nExport failed: " + e6 + "\n"; }
    }

    alert("Told Straight — YouTube banners built (2048x1152).\n\n"
        + "THE POINT: only the centred 1235 x 338 safe area is visible on ALL\n"
        + "devices — about 29% of the canvas height. Everything else is\n"
        + "sacrificial. Row 2 dims what a phone may crop.\n\n"
        + "*** That safe area is PUBLISHED, not measured by us. Upload, then\n"
        + "screenshot the live channel on desktop AND phone and verify. ***\n\n"
        + "CHECK THE AUDIT BOARD: per-board PASS/FAIL against the safe band,\n"
        + "plus a lockup-to-stamp clearance check.\n\n"
        + "Upload from ROW 1 only — row 2 has the dim mask burned in.\n\n"
        + "Title face: " + (psTitle || "DEFAULT") + "\n"
        + "Mono face:  " + (psMono || "DEFAULT") + "\n"
        + (faceWarnings === 0 ? "Faces resolved at intended weights.\n"
                              : "*** A FACE IS COMPROMISED — stop before judging. ***\n")
        + exportNote
        + "\nNothing here touches episodes/ or the feed.");

})();
