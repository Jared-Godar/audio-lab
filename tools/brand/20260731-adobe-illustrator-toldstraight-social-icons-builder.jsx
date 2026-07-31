/**
 * Told Straight — SOCIAL PLATFORM ICONS  (ILLUSTRATOR)
 * ====================================================
 * Places the five official platform marks, applies the measured colour rule,
 * lays them out as a row, and exports at the sizes non-web surfaces need.
 *
 * Reference builders followed for conventions, palette and export machinery:
 *   tools/brand/20260731-adobe-illustrator-toldstraight-x-avatar-builder.jsx
 *   tools/brand/20260728-adobe-illustrator-toldstraight-favicon-derivation-builder.jsx
 *
 * WHAT THIS IS FOR — AND WHAT IT IS NOT
 * -------------------------------------
 * NOT for the website. Issue #164 wants inline SVG in site/index.html, and the
 * ready-to-paste component already exists at
 *   artifacts/specs/20260731-issue-164-social-links-component.html
 * Running Illustrator to make web icons would be a detour.
 *
 * This is for the surfaces the web component cannot serve: episode art, cast and
 * exhibit cards, print, and anything built in Illustrator that needs a "find us
 * here" row in the brand system.
 *
 * THE MARKS ARE PLACED, NEVER REDRAWN
 * -----------------------------------
 * It reads the official SVGs from brand/social-icons/ and PLACES them. It does
 * not reconstruct path data. Hand-drawing a trademarked logo produces an
 * approximately-wrong mark, which breaks every platform's brand guidelines and
 * reads as amateur. If a mark needs replacing, re-fetch the SVG — do not edit
 * beziers. Provenance and licensing are in brand/social-icons/README.md.
 *
 * THE COLOUR RULE IS MEASURED, NOT CHOSEN
 * ---------------------------------------
 * WCAG floor for non-text graphical objects is 3.0:1.
 *
 *     mark        brand hex    on #EDE9E0   on #14140F
 *     X           #000000        17.33         1.14   <- non-perceivable
 *     TikTok      #000000        17.33         1.14   <- non-perceivable
 *     Instagram   #FF0069         3.18         4.80
 *     YouTube     #FF0000         3.30         4.62
 *     Facebook    #0866FF         3.98         3.83
 *
 * So X and TikTok do NOT carry their brand colour. They take the INK token,
 * which is #111111 on paper and #EDE9E0 on dark stock, so they invert with the
 * theme and stay perceivable. The other three clear the floor both ways and keep
 * brand colour. That is the honest reading of "official full colour" in a
 * two-theme system: every mark that CAN carry its brand colour does.
 *
 * TO RUN:  File > Scripts > Other Script...  and pick this file.
 * IT NEVER TOUCHES AN OPEN DOCUMENT. It always creates a new one.
 */

#target illustrator

(function () {

    var thisApp = "an unknown application";
    try { thisApp = String(app.name); } catch (e) {}
    if (thisApp.indexOf("Illustrator") === -1) {
        alert("WRONG APPLICATION\n\nThis is an ILLUSTRATOR script (Told Straight social icons).\n"
            + "You are running it in: " + thisApp + "\n\nNothing was created or changed.");
        return;
    }

    /* ================= EDIT THESE =================
       ICON_DIRS is a CANDIDATE LIST, not one path. The marks live in
       brand/social-icons/, but that directory reaches the main checkout only
       once the branch carrying it is merged — until then it exists solely in
       the worktree. Run 1 hardcoded the main-checkout path and reported all ten
       marks missing for that reason alone. Resolving a list makes the script
       work before AND after the merge, and on any future worktree, without
       anyone editing it. The resolved path is printed in the AUDIT board. */
    var ICON_DIRS = [
        "~/Code/audio-lab/brand/social-icons",
        "~/Code/audio-lab/.claude/worktrees/social-handles-111/brand/social-icons"
    ];
    var EXPORT_DIR = "~/Code/audio-lab/output/artwork/brand-social-icons";
    var GLYPH      = 96;    // drawn glyph size, points
    var GAP        = 40;    // space between marks
    var PAD        = 48;    // board padding
    // ==============================================

    var PALETTE = {
        paper: [237, 233, 224], ink: [17, 17, 17],
        dpaper: [20, 20, 15],   dink: [237, 233, 224]
    };
    function rgb(t) { var c = new RGBColor(); c.red = t[0]; c.green = t[1]; c.blue = t[2]; return c; }
    var C = { paper: rgb(PALETTE.paper), ink: rgb(PALETTE.ink),
              dpaper: rgb(PALETTE.dpaper), dink: rgb(PALETTE.dink) };
    function hex(h) {
        var c = new RGBColor();
        c.red = parseInt(h.substr(0, 2), 16);
        c.green = parseInt(h.substr(2, 2), 16);
        c.blue = parseInt(h.substr(4, 2), 16);
        return c;
    }

    /* useInk:true  -> take the theme's ink token (X, TikTok — brand colour is
                       #000 and measures 1.14:1 on dark stock)
       useInk:false -> keep the brand hex (clears 3.0:1 in both themes) */
    var MARKS = [
        { name: "X",         file: "20260731-simpleicons-x-official-glyph.svg",         useInk: true,  hex: "000000" },
        { name: "Instagram", file: "20260731-simpleicons-instagram-official-glyph.svg", useInk: false, hex: "FF0069" },
        { name: "YouTube",   file: "20260731-simpleicons-youtube-official-glyph.svg",   useInk: false, hex: "FF0000" },
        { name: "TikTok",    file: "20260731-simpleicons-tiktok-official-glyph.svg",    useInk: true,  hex: "000000" },
        { name: "Facebook",  file: "20260731-simpleicons-facebook-official-glyph.svg",  useInk: false, hex: "0866FF" }
    ];

    var report = [];
    function log(s) { report.push(s); }
    log("TOLD STRAIGHT — social platform icons");
    log("Built " + new Date().toString());
    log("");

    /* Resolve the icon directory: first candidate that actually contains the
       marks wins. Probe for a real FILE, not just the folder — an empty or
       stale directory would otherwise satisfy the check and fail later, one
       mark at a time, which is a worse failure than not starting. */
    var ICON_DIR = null;
    for (var di = 0; di < ICON_DIRS.length; di++) {
        var probe = new File(ICON_DIRS[di] + "/20260731-simpleicons-x-official-glyph.svg");
        if (probe.exists) { ICON_DIR = ICON_DIRS[di]; break; }
    }
    if (!ICON_DIR) {
        var tried = ICON_DIRS.join("\n  ");
        alert("MARKS NOT FOUND\n\nNo candidate directory contains the platform SVGs.\n\nTried:\n  "
            + tried + "\n\nNothing was created. Add the path to ICON_DIRS at the top of this script.");
        return;
    }
    log("ICON SOURCE: " + ICON_DIR);
    log("");

    // ---- document ----
    var ROW_W = MARKS.length * GLYPH + (MARKS.length - 1) * GAP + PAD * 2;
    var ROW_H = GLYPH + PAD * 2;
    var doc = app.documents.add(DocumentColorSpace.RGB, ROW_W, ROW_H);
    try { doc.rulerUnits = RulerUnits.Points; } catch (e) {}

    var BOARDS = [];
    var cursor = { r1: -ROW_W / 2, r2: -ROW_W / 2, r3: -700 };
    var ROWTOP = { 1: 0, 2: -(ROW_H + 120), 3: -(ROW_H * 2 + 300) };
    function addBoard(row, name, w, h) {
        var left = cursor["r" + row], top = ROWTOP[row];
        cursor["r" + row] += w + 120;
        var rect = [left, top, left + w, top - h], ab;
        if (BOARDS.length === 0) {
            ab = doc.artboards[0];
            try { ab.artboardRect = rect; } catch (e) { log("WARN: artboard " + name + " — " + e); }
        } else {
            try { ab = doc.artboards.add(rect); } catch (e2) { log("WARN: " + name + " — " + e2); ab = null; }
        }
        if (ab) { try { ab.name = name; } catch (e3) {} }
        var b = { name: name, w: w, h: h, x: left, y: top };
        BOARDS.push(b); return b;
    }

    var ly = doc.layers.add(); ly.name = "ICONS";
    var lyAudit = doc.layers.add(); lyAudit.name = "AUDIT";
    function px(b, x) { return b.x + x; }
    function py(b, y) { return b.y - y; }
    function fillRect(layer, b, y, x, w, h, colour) {
        var r = layer.pathItems.rectangle(py(b, y), px(b, x), w, h);
        r.filled = true; r.fillColor = colour; r.stroked = false; return r;
    }

    /* Recolour every path inside a placed group. The SVGs arrive carrying their
       own fill; we override per the measured rule above.

       RUN 2 BUG — why this is not one branch:
       A CompoundPathItem's fill lives on its CHILD paths. Setting fillColor on
       the compound itself silently does nothing and raises no error. Run 2
       treated PathItem and CompoundPathItem identically, so X — which imports
       as a compound (crossing strokes with counters) — stayed #000000 on the
       dark board at 1.14:1, while TikTok, a simple path, recoloured correctly.
       Same code, opposite outcomes, no error either way. It took decoding the
       exported PNG and sampling pixels to find, which is why this function now
       COUNTS what it changed and the audit prints the count. A recolour that
       silently no-ops is worse than one that throws. */
    var recoloured = 0;
    function recolour(item, colour) {
        var t = "";
        try { t = item.typename; } catch (e) { return; }

        if (t === "PathItem") {
            try { item.filled = true; item.fillColor = colour; item.stroked = false; recoloured++; }
            catch (e1) {}
            return;
        }
        if (t === "CompoundPathItem") {
            // Recurse — do NOT set fill on the compound itself.
            try {
                for (var i = 0; i < item.pathItems.length; i++) recolour(item.pathItems[i], colour);
            } catch (e2) {}
            return;
        }
        try {
            for (var j = 0; j < item.pageItems.length; j++) recolour(item.pageItems[j], colour);
        } catch (e3) {}
    }

    var missing = 0;
    function placeRow(b, dark) {
        fillRect(ly, b, 0, 0, b.w, b.h, dark ? C.dpaper : C.paper);
        var x = PAD;
        for (var i = 0; i < MARKS.length; i++) {
            var m = MARKS[i];
            var f = new File(ICON_DIR + "/" + m.file);
            if (!f.exists) {
                log("  *** MISSING: " + m.file);
                missing++;
                x += GLYPH + GAP;
                continue;
            }
            var placed = null;
            try {
                placed = ly.groupItems.createFromFile(f);
            } catch (e) {
                try { placed = ly.placedItems.add(); placed.file = f; }
                catch (e2) { log("  *** PLACE FAILED: " + m.name + " — " + e2); missing++; x += GLYPH + GAP; continue; }
            }
            // Normalise to GLYPH size, preserving aspect.
            try {
                var gb = placed.geometricBounds;           // [l, t, r, b]
                var w = gb[2] - gb[0], h = gb[1] - gb[3];
                var s = (GLYPH / Math.max(w, h)) * 100;
                placed.resize(s, s);
                gb = placed.geometricBounds;
                w = gb[2] - gb[0]; h = gb[1] - gb[3];
                placed.translate(px(b, x + (GLYPH - w) / 2) - gb[0],
                                 py(b, PAD + (GLYPH - h) / 2) - gb[1]);
            } catch (e3) { log("  WARN: resize/place " + m.name + " — " + e3); }

            var colour = m.useInk ? (dark ? C.dink : C.ink) : hex(m.hex);
            var before = recoloured;
            recolour(placed, colour);
            var touched = recoloured - before;

            log("  " + (dark ? "dark " : "light") + "  " + m.name
                + "   " + (m.useInk ? "INK TOKEN (brand #000 is 1.14:1 on dark)" : "brand #" + m.hex)
                + "   paths recoloured: " + touched
                + (touched === 0 ? "   *** ZERO — RECOLOUR NO-OPPED, MARK WILL BE WRONG ***" : ""));
            if (touched === 0) missing++;
            x += GLYPH + GAP;
        }
    }

    var bLight = addBoard(1, "social-icons-row-light", ROW_W, ROW_H);
    var bDark  = addBoard(2, "social-icons-row-dark",  ROW_W, ROW_H);
    log("PLACEMENT LOG");
    placeRow(bLight, false);
    placeRow(bDark, true);

    // ---- audit ----
    log("");
    log("WHAT THIS IS FOR");
    log("  NON-WEB surfaces only — episode art, cards, print. The website gets");
    log("  inline SVG from");
    log("  artifacts/specs/20260731-issue-164-social-links-component.html.");
    log("  Running Illustrator to make web icons is a detour.");
    log("");
    log("THE MARKS ARE PLACED, NEVER REDRAWN");
    log("  Read from brand/social-icons/ — official glyph geometry, CC0 files,");
    log("  trademarks still each platform's. To replace a mark, RE-FETCH it.");
    log("  Do not edit path data: a hand-nudged logo is a wrong logo.");
    log("");
    log("THE COLOUR RULE IS MEASURED (WCAG floor 3.0:1, non-text graphics)");
    log("    X          #000000   17.33 on paper   1.14 on dark  -> INK TOKEN");
    log("    TikTok     #000000   17.33 on paper   1.14 on dark  -> INK TOKEN");
    log("    Instagram  #FF0069    3.18            4.80          -> brand");
    log("    YouTube    #FF0000    3.30            4.62          -> brand");
    log("    Facebook   #0866FF    3.98            3.83          -> brand");
    log("  X and TikTok are NON-PERCEIVABLE on dark stock at their brand colour,");
    log("  so they take the ink token and invert with the theme. Every mark that");
    log("  CAN carry brand colour does.");
    log("");
    log("  Instagram 3.18 and YouTube 3.30 clear the floor but not by much on");
    log("  paper. Eyeball them small before committing to a print surface.");
    log("");
    log("RECOLOUR VERIFICATION");
    log("  Total paths recoloured across both rows: " + recoloured);
    log("  Every mark must show a NON-ZERO count above. A zero means the fill was");
    log("  set on a container rather than on the paths that actually carry it —");
    log("  Illustrator raises no error for that, so the count is the only signal.");
    log("");
    log("ICON SOURCE RESOLUTION");
    log("  Marks were read from: " + ICON_DIR);
    log("  ICON_DIRS is a candidate list because brand/social-icons/ reaches the");
    log("  main checkout only after its branch merges; before that it exists only");
    log("  in the worktree. Run 1 hardcoded the main-checkout path and reported");
    log("  all ten marks missing for that reason alone.");
    log("");
    log("BRAND GUIDELINES still apply: minimum size and clear space are set by");
    log("  each platform. At 96pt you are comfortably above every stated floor;");
    log("  below ~24pt, check each platform's rule before shipping.");
    if (missing > 0) {
        log("");
        log("*** " + missing + " MARK(S) MISSING OR UNPLACEABLE — see the log above. ***");
        log("    Expected in: " + ICON_DIR);
    }

    var bAud = addBoard(3, "AUDIT", 1400, 1500);
    (function () {
        fillRect(lyAudit, bAud, 0, 0, bAud.w, bAud.h, C.paper);
        var bx = lyAudit.pathItems.rectangle(py(bAud, 60), px(bAud, 60), bAud.w - 120, bAud.h - 120);
        var tf; try { tf = lyAudit.textFrames.areaText(bx); } catch (e) { return; }
        tf.contents = report.join("\r");
        try {
            var ca = tf.textRange.characterAttributes;
            ca.size = 16; ca.leading = 23; ca.autoLeading = false; ca.fillColor = C.ink;
        } catch (e2) {}
    })();

    try { app.executeMenuCommand("fitall"); } catch (e) {}

    var exportNote = "";
    try {
        var dir = new Folder(EXPORT_DIR);
        if (!dir.exists) dir.create();
        var opts = new ExportOptionsPNG24();
        opts.artBoardClipping = true; opts.transparency = true;
        opts.horizontalScale = 200; opts.verticalScale = 200;   // 2x for retina
        var names = ["20260731-adobe-illustrator-toldstraight-social-icons-row-light",
                     "20260731-adobe-illustrator-toldstraight-social-icons-row-dark"];
        for (var e5 = 0; e5 < names.length; e5++) {
            if (e5 >= doc.artboards.length) continue;
            doc.artboards.setActiveArtboardIndex(e5);
            doc.exportFile(new File(dir.fsName + "/" + names[e5] + ".png"), ExportType.PNG24, opts);
        }
        exportNote = "\n" + names.length + " PNGs (2x) written to " + EXPORT_DIR + "\n";
    } catch (e6) { exportNote = "\nExport failed: " + e6 + "\n"; }

    alert("Told Straight — social icons built.\n\n"
        + "Marks are PLACED from brand/social-icons/, never redrawn.\n\n"
        + "X and TikTok take the INK token, not brand colour: #000 measures\n"
        + "1.14:1 on the dark stock, below the 3.0:1 floor for non-text\n"
        + "graphics. They invert with the theme instead. The other three keep\n"
        + "brand colour — both themes clear the floor.\n\n"
        + (missing > 0 ? "*** " + missing + " MARK(S) MISSING — check the AUDIT board. ***\n\n"
                       : "All five marks placed.\n\n")
        + "FOR NON-WEB SURFACES. The website uses the inline-SVG component in\n"
        + "artifacts/specs/20260731-issue-164-social-links-component.html.\n"
        + exportNote
        + "\nNothing here touches episodes/ or the feed.");

})();
