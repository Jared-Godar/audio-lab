/**
 * Told Straight — X (TWITTER) HEADER / BANNER  1500 x 500   (ILLUSTRATOR)
 * =======================================================================
 * Baseline is the SHIPPED WEBPAGE lockup (site/index.html): stacked or
 * one-line wordmark, red rule, spaced authority line, and the DECLASSIFY ON
 * rubber stamp from ADR 0019.
 *
 * Reference builders followed for conventions, palette and export machinery:
 *   tools/brand/20260728-adobe-illustrator-toldstraight-readme-header-and-social-cards-builder.jsx
 *   tools/brand/20260731-adobe-illustrator-toldstraight-x-avatar-builder.jsx  (measured-ink discipline)
 *
 * DIMENSIONS ARE MEASURED, NOT ASSUMED
 * ------------------------------------
 * Read from X's own help page 2026-07-31
 * (help.x.com/en/managing-your-account/how-to-customize-your-profile):
 *
 *     Header photo, also known as a "banner" — recommended 1500 x 500
 *     Profile photo — recommended 400 x 400
 *     Bio — maximum 160 characters
 *
 * THREE STAMP STATES, ONE FIXED LOCKUP
 * ------------------------------------
 *   1  DECLASSIFY   red stamp, pre-launch            (use now)
 *   2  PLAIN        no stamp, permanent              (use after week 1)
 *   3  LIVE         green stamp, launch week         (use 06 Aug for ~a week)
 *
 * The wordmark, rule and authority line are IDENTICAL in all three and are
 * driven by the same constants. That is deliberate: these get swapped on a
 * live profile, and a lockup that shifts position between swaps reads as a
 * rebrand rather than a state change.
 *
 * THE GREEN IS A NEW TOKEN AND IS NOT IN THE DESIGN SYSTEM
 * --------------------------------------------------------
 * brand/20260727-toldstraight-design-tokens.css has no green. #1F6B45 was
 * chosen by MEASUREMENT, not taste: it lands at 5.34:1 on --ts-paper, within
 * 0.06 of the brand red's 5.40:1, so the LIVE stamp carries the same optical
 * authority as the DECLASSIFY stamp instead of reading as a different system.
 * It has NO dark-theme value and NO ADR. If it becomes permanent both are
 * owed — this file is not the place that decides it.
 *
 * THE SAFE ZONE X DOES NOT DOCUMENT
 * ---------------------------------
 * X overlaps the profile AVATAR onto the header's bottom-left. Its help page
 * gives dimensions and says nothing about this, so it is the failure everyone
 * discovers after uploading. Row 3 draws the avatar disc over each header at
 * 40% so it can be seen rather than guessed. Nothing in the lockup may enter
 * roughly x < 400, y > 320.
 *
 * The overlap geometry is ESTIMATED from X's rendered profile proportions and
 * is NOT a documented figure — treat row 3 as a warning, not a specification,
 * and confirm against the live profile after upload.
 *
 * TYPE IS MEASURED, NOT ESTIMATED
 * -------------------------------
 * Every line is OUTLINED and measured (createOutline -> path bounds), because
 * geometricBounds on live text returns the em/leading box, not the ink. The
 * avatar builder cost three revisions learning that. Sizes are then SOLVED to
 * hit a target width — nothing here is a magic point size, so the lockup fits
 * its measure whatever face resolves.
 *
 * TO RUN:  File > Scripts > Other Script...  and pick this file.
 * IT NEVER TOUCHES AN OPEN DOCUMENT. It always creates a new one.
 */

#target illustrator

(function () {

    var thisApp = "an unknown application";
    try { thisApp = String(app.name); } catch (e) {}
    if (thisApp.indexOf("Illustrator") === -1) {
        alert("WRONG APPLICATION\n\nThis is an ILLUSTRATOR script (Told Straight X header).\n"
            + "You are running it in: " + thisApp + "\n\nNothing was created or changed.");
        return;
    }

    // ================= EDIT THESE =================
    var GO_LIVE_DATE = "06 AUG 2026";     // ADR 0019 go-live
    var GO_LIVE_TIME = "09:00 EDT";
    var AUTHORITY    = "DEPT. OF NEURODEVELOPMENTAL AFFAIRS";
    var WORDMARK     = "TOLD STRAIGHT";
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
    var EXPORT_DIR = "~/Code/audio-lab/output/artwork/brand-x-header";

    /* Light tokens measured by pixel histogram 2026-07-27 (see
       brand/20260727-toldstraight-design-tokens.css). GREEN IS NEW — see the
       header comment; measured 5.34:1 on paper against the red's 5.40:1. */
    var PALETTE = {
        paper: [237, 233, 224], ink: [17, 17, 17], red: [176, 42, 40],
        grey: [120, 116, 108],
        /* GREEN — new token, measured 2026-07-31, maintainer-approved.
           Light #1F6B45 = 5.34:1 on paper   (brand red 5.40 — delta -0.07)
           Dark  #3C9963 = 5.22:1 on #14140F (dark  red 5.05 — delta +0.17)
           Harmonious BY MEASUREMENT: the green carries the same optical
           weight as the red in BOTH themes, and lifts deep->bright exactly
           as the red does (#B02A28 -> #E4564F). The dark value is carried
           here so it exists before the ADR needs it; only the light value
           is used by this builder (these headers are paper-stock only). */
        green: [31, 107, 69], dgreen: [60, 153, 99]
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

    log("TOLD STRAIGHT — X header 1500x500");
    log("Built " + new Date().toString());
    log("");

    // ---- document + boards ----
    var doc = app.documents.add(DocumentColorSpace.RGB, 1500, 500);
    try { doc.rulerUnits = RulerUnits.Points; } catch (e) {}

    var GUTTER = 220;
    var BOARDS = [];
    var cursor = { r1: -2470, r2: -2470, r3: -2470, r4: -800 };
    var ROWTOP = { 1: 0, 2: -800, 3: -1600, 4: -2400 };

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

    var lyArt = doc.layers.add(); lyArt.name = "HEADERS";
    var lyAudit = doc.layers.add(); lyAudit.name = "AUDIT";

    function px(b, x) { return b.x + x; }
    function py(b, y) { return b.y - y; }
    function fillRectIn(grp, b, y, x, w, h, colour) {
        var r = grp.pathItems.rectangle(py(b, y), px(b, x), w, h);
        r.filled = true; r.fillColor = colour; r.stroked = false; return r;
    }

    /* Outline every line and measure the PATHS. geometricBounds on live text
       is the em/leading box, not the ink — measuring it is what put the avatar
       builder's red bar below the baseline for a whole revision. */
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
        var item = tf, outlined = false;
        try { item = tf.createOutline(); outlined = true; }
        catch (e3) { log("WARN: createOutline failed for '" + txt + "' — measuring em box"); }
        var gb = null;
        try { gb = item.geometricBounds; } catch (e4) {}
        if (!gb) return null;
        return { item: item, gb: gb, w: gb[2] - gb[0], h: gb[1] - gb[3],
                 size: sizePt, outlined: outlined };
    }

    /* SOLVE the point size to hit a target width instead of guessing it:
       measure a 100pt probe, scale linearly, rebuild. Tracking is in
       thousandths of an em so it scales with size — the solve stays linear. */
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

    // ---- LOCKUP CONSTANTS — identical across all three stamp states ----
    var M          = 90;    // left margin
    var WM_TARGET  = 700;   // one-line wordmark measure
    var WM_TOP     = 118;   // ink top of the wordmark
    var RULE_H     = 14;
    var RULE_GAP   = 34;    // wordmark ink bottom -> rule
    var AUTH_GAP   = 30;    // rule -> authority ink top
    var AUTH_SIZE  = 25;
    var AUTH_TRACK = 280;   // .28em, matching site .authority

    // Avatar overlap reserve (ESTIMATED — see header comment)
    var AV_CX = 215, AV_CY = 500, AV_R = 168;

    function lockup(grp, b, stacked) {
        var wm, wm2 = null, bottom;
        if (stacked) {
            wm  = fitLine(grp, "TOLD",     520, -15, C.ink, fTitle);
            wm2 = fitLine(grp, "STRAIGHT", 520, -15, C.ink, fTitle);
            if (!wm || !wm2) return null;
            place(wm,  px(b, M), py(b, 92));
            place(wm2, px(b, M), py(b, 92 + wm.h + wm.h * 0.10));
            bottom = 92 + wm.h + wm.h * 0.10 + wm2.h;
        } else {
            wm = fitLine(grp, WORDMARK, WM_TARGET, -15, C.ink, fTitle);
            if (!wm) return null;
            place(wm, px(b, M), py(b, WM_TOP));
            bottom = WM_TOP + wm.h;
        }
        var ruleY = bottom + RULE_GAP;
        fillRectIn(grp, b, ruleY, M, stacked ? 520 : WM_TARGET, RULE_H, C.red);
        var auth = makeLine(grp, AUTHORITY, AUTH_SIZE, AUTH_TRACK, C.grey, fTitle);
        place(auth, px(b, M), py(b, ruleY + RULE_H + AUTH_GAP));
        return { bottom: ruleY + RULE_H + AUTH_GAP + (auth ? auth.h : 0), wmH: wm.h, wmW: wm.w };
    }

    /* The rubber stamp: build the TEXT BLOCK first, measure it, then draw the
       box around the measurement and send it behind. Sizing a box first and
       hoping the text fits is how type ends up clipped. */
    function stamp(grp, b, cx, cy, l1, l2, l3, colour) {
        var sg;
        try { sg = grp.groupItems.add(); } catch (e) { return null; }

        var a = makeLine(sg, l1, 26, 140, colour, fTitle);
        var c2 = makeLine(sg, l2, 62,  20, colour, fTitle);
        var c3 = l3 ? makeLine(sg, l3, 23, 100, colour, fMono) : null;
        if (!a || !c2) return null;

        var g1 = c2.h * 0.30, g2 = c2.h * 0.26;
        var blockH = a.h + g1 + c2.h + (c3 ? g2 + c3.h : 0);
        var blockW = Math.max(a.w, c2.w, c3 ? c3.w : 0);

        var PADX = c2.h * 0.55, PADY = c2.h * 0.42;
        var boxW = blockW + PADX * 2, boxH = blockH + PADY * 2;
        var boxL = px(b, cx) - boxW / 2, boxT = py(b, cy) + boxH / 2;

        var y = boxT - PADY;
        place(a,  px(b, cx) - a.w / 2,  y);           y -= a.h + g1;
        place(c2, px(b, cx) - c2.w / 2, y);           y -= c2.h + g2;
        if (c3) place(c3, px(b, cx) - c3.w / 2, y);

        // Double rule: outer frame, then a hairline inset — the site's
        // 4px border + 1.5px inset shadow, as nested fills.
        var OUT = 6, GAPR = 7, INR = 2.5;
        function frame(inset, thick) {
            var o = sg.pathItems.rectangle(boxT - inset, boxL + inset, boxW - inset * 2, boxH - inset * 2);
            o.filled = true; o.fillColor = colour; o.stroked = false;
            var i = sg.pathItems.rectangle(boxT - inset - thick, boxL + inset + thick,
                                           boxW - (inset + thick) * 2, boxH - (inset + thick) * 2);
            i.filled = true; i.fillColor = C.paper; i.stroked = false;
            try { o.zOrder(ZOrderMethod.SENDTOBACK); i.zOrder(ZOrderMethod.SENDTOBACK); } catch (e) {}
            try { o.zOrder(ZOrderMethod.SENDTOBACK); } catch (e) {}
        }
        frame(OUT + GAPR, INR);
        frame(0, OUT);
        var bg = sg.pathItems.rectangle(boxT, boxL, boxW, boxH);
        bg.filled = true; bg.fillColor = C.paper; bg.stroked = false;
        try { bg.zOrder(ZOrderMethod.SENDTOBACK); } catch (e) {}

        try { sg.rotate(-7); } catch (e) { log("WARN: stamp rotate failed — " + e); }
        return { w: boxW, h: boxH };
    }

    function header(b, opts) {
        var grp = lyArt.groupItems.add();
        fillRectIn(grp, b, 0, 0, b.w, b.h, C.paper);
        var lk = lockup(grp, b, !!opts.stacked);

        var st = null;
        if (opts.state === "declassify")
            st = stamp(grp, b, 1145, 236, "DECLASSIFY ON", GO_LIVE_DATE, GO_LIVE_TIME, C.red);
        else if (opts.state === "live")
            st = stamp(grp, b, 1145, 236, "LIVE AS OF", GO_LIVE_DATE, GO_LIVE_TIME, C.green);

        if (opts.audit) {
            log("  " + b.name);
            log("     wordmark ink " + Math.round(lk ? lk.wmW : 0) + " x " + Math.round(lk ? lk.wmH : 0)
                + "   lockup bottom y=" + Math.round(lk ? lk.bottom : 0)
                + (lk && lk.bottom < 320 ? "   -> CLEARS avatar zone (needs < 320)"
                                         : "   *** ENTERS avatar zone ***"));
            if (st) log("     stamp box " + Math.round(st.w) + " x " + Math.round(st.h));
        }

        // Safe-zone overlay: the avatar disc X drops on the bottom-left.
        if (opts.safezone) {
            var ov = grp.pathItems.ellipse(py(b, AV_CY - AV_R), px(b, AV_CX - AV_R), AV_R * 2, AV_R * 2);
            ov.filled = true; ov.fillColor = C.ink; ov.stroked = false;
            try { ov.opacity = 42; } catch (e) {}
            var gl = makeLine(grp, "AVATAR SITS HERE — ESTIMATED, CONFIRM ON THE LIVE PROFILE",
                              18, 120, C.red, fMono);
            place(gl, px(b, M), py(b, 460));
        }
        return grp;
    }

    // ---- ROW 1: one-line, the three states ----
    log("MEASURED LOCKUP CHECKS");
    var h1 = addBoard(1, "x-header-DECLASSIFY-1500x500", 1500, 500);
    var h2 = addBoard(1, "x-header-PLAIN-1500x500",      1500, 500);
    var h3 = addBoard(1, "x-header-LIVE-1500x500",       1500, 500);
    header(h1, { state: "declassify", audit: true });
    header(h2, { state: "none",       audit: true });
    header(h3, { state: "live",       audit: true });

    // ---- ROW 2: stacked wordmark, same three states ----
    var s1 = addBoard(2, "x-header-DECLASSIFY-stacked", 1500, 500);
    var s2 = addBoard(2, "x-header-PLAIN-stacked",      1500, 500);
    var s3 = addBoard(2, "x-header-LIVE-stacked",       1500, 500);
    header(s1, { state: "declassify", stacked: true });
    header(s2, { state: "none",       stacked: true });
    header(s3, { state: "live",       stacked: true });

    // ---- ROW 3: safe-zone overlays (judging only, never upload) ----
    var z1 = addBoard(3, "SAFEZONE-DECLASSIFY", 1500, 500);
    var z2 = addBoard(3, "SAFEZONE-PLAIN",      1500, 500);
    var z3 = addBoard(3, "SAFEZONE-LIVE",       1500, 500);
    header(z1, { state: "declassify", safezone: true });
    header(z2, { state: "none",       safezone: true });
    header(z3, { state: "live",       safezone: true });

    // ---- AUDIT ----
    log("");
    log("DIMENSIONS — MEASURED, from help.x.com 2026-07-31");
    log("  header/banner 1500 x 500   profile photo 400 x 400   bio max 160 chars");
    log("  (the avatar builder's 1000x1000 master is 2.5x the stated 400 — headroom,");
    log("   not waste; X downsamples, and a 400px upload has none.)");
    log("");
    log("THREE STATES, ONE FIXED LOCKUP");
    log("  1 DECLASSIFY  red stamp     — use now, pre-launch");
    log("  2 PLAIN       no stamp      — permanent, after launch week");
    log("  3 LIVE        green stamp   — launch week (06 Aug + ~7 days)");
    log("");
    log("  Wordmark, rule and authority line are IDENTICAL in all three, driven");
    log("  by the same constants. These get swapped on a live profile; a lockup");
    log("  that moves between swaps reads as a rebrand, not a state change.");
    log("");
    log("THE GREEN — new token, maintainer-approved 2026-07-31, OWED TO THE SYSTEM");
    log("  brand/20260727-toldstraight-design-tokens.css has no green. Both");
    log("  values were chosen by MEASUREMENT, not taste:");
    log("");
    log("    --ts-green      #1F6B45   5.34:1 on #EDE9E0   (red 5.40, -0.07)");
    log("    --ts-green-dark #3C9963   5.22:1 on #14140F   (red 5.05, +0.17)");
    log("");
    log("  Harmonious means something specific here: the green carries the same");
    log("  optical weight as the red in BOTH themes, and lifts deep->bright the");
    log("  same way the red does (#B02A28 -> #E4564F). Not a hue picked to look");
    log("  nice next to it — a value matched to it.");
    log("");
    log("  STILL OWED, and this file does not discharge either: the pair must");
    log("  land in the design-tokens CSS, and an ADR must record why a fourth");
    log("  colour entered a deliberately three-colour system. Until then the");
    log("  green exists only in this builder — written, not in force.");
    log("  Only the LIGHT value is used here; these headers are paper stock.");
    log("");
    log("THE SAFE ZONE X DOES NOT DOCUMENT");
    log("  X overlaps the profile AVATAR onto the header's bottom-left. The help");
    log("  page gives dimensions and says nothing about it, which is why it is");
    log("  the thing everyone finds out after uploading. Row 3 draws the disc at");
    log("  42% so it can be SEEN. Keep the lockup out of x < 400, y > 320.");
    log("");
    log("  That geometry is ESTIMATED from X's rendered profile proportions, NOT");
    log("  a documented figure. Treat row 3 as a warning, not a specification,");
    log("  and confirm against the live profile once uploaded.");
    log("");
    log("TYPE IS SOLVED, NOT GUESSED");
    log("  Every line is outlined and measured, then its point size is SOLVED to");
    log("  hit a target width (100pt probe, linear scale, rebuild). No magic");
    log("  point sizes — the lockup fits its measure whatever face resolves.");
    log("  geometricBounds on LIVE text is the em box, not the ink; the avatar");
    log("  builder spent a revision on that lesson.");
    log("");
    log("WHAT TO UPLOAD: rows 1-2 only. Row 3 has the avatar disc burned in.");

    var bAud = addBoard(4, "AUDIT", 1600, 1900);
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

    // ---- export ----
    var exportNote = "";
    if (EXPORT_PNG) {
        try {
            var dir = new Folder(EXPORT_DIR);
            if (!dir.exists) dir.create();
            var opts = new ExportOptionsPNG24();
            opts.artBoardClipping = true; opts.transparency = false;
            opts.horizontalScale = 100; opts.verticalScale = 100;
            var names = [
                "20260731-adobe-illustrator-toldstraight-x-header-declassify-1500x500",
                "20260731-adobe-illustrator-toldstraight-x-header-plain-1500x500",
                "20260731-adobe-illustrator-toldstraight-x-header-live-1500x500",
                "20260731-adobe-illustrator-toldstraight-x-header-declassify-stacked-1500x500",
                "20260731-adobe-illustrator-toldstraight-x-header-plain-stacked-1500x500",
                "20260731-adobe-illustrator-toldstraight-x-header-live-stacked-1500x500",
                "20260731-adobe-illustrator-toldstraight-x-header-safezone-declassify-1500x500",
                "20260731-adobe-illustrator-toldstraight-x-header-safezone-plain-1500x500",
                "20260731-adobe-illustrator-toldstraight-x-header-safezone-live-1500x500"
            ];
            for (var e5 = 0; e5 < names.length; e5++) {
                if (e5 >= doc.artboards.length) continue;
                doc.artboards.setActiveArtboardIndex(e5);
                doc.exportFile(new File(dir.fsName + "/" + names[e5] + ".png"), ExportType.PNG24, opts);
            }
            exportNote = "\n" + names.length + " PNGs written to " + EXPORT_DIR + "\n";
        } catch (e6) { exportNote = "\nExport failed: " + e6 + "\n"; }
    }

    alert("Told Straight — X headers built (1500x500, measured from X's help).\n\n"
        + "THREE STATES, one fixed lockup:\n"
        + "  1 DECLASSIFY (red)  — now\n"
        + "  2 PLAIN (no stamp)  — permanent\n"
        + "  3 LIVE (green)      — launch week\n\n"
        + "Row 1 one-line / Row 2 stacked / Row 3 SAFE-ZONE previews.\n"
        + "Upload from rows 1-2 ONLY — row 3 has the avatar disc burned in.\n\n"
        + "The green #1F6B45 is a NEW token, not in the design system.\n"
        + "Measured 5.34:1 on paper vs the red's 5.40:1.\n\n"
        + "Title face: " + (psTitle || "DEFAULT") + "\n"
        + "Mono face:  " + (psMono || "DEFAULT") + "\n"
        + (faceWarnings === 0 ? "Faces resolved at intended weights.\n"
                              : "*** A FACE IS COMPROMISED — stop before judging. ***\n")
        + exportNote
        + "\nNothing here touches episodes/ or the feed.");

})();
