/**
 * Told Straight — X (TWITTER) PROFILE AVATAR, circle-optimised  (ILLUSTRATOR)
 * ===========================================================================
 * Derived from mark M1 (ADR 0015: TS in a ruled box with the red bar).
 * Reference builder for conventions, palette and export machinery:
 *   tools/brand/20260728-adobe-illustrator-toldstraight-favicon-derivation-builder.jsx
 *
 * REVISION 3 — 2026-07-31. TWO BUGS, BOTH ABOUT MEASURING THE TYPE
 * -----------------------------------------------------------------
 * REV 1 put the red bar at a HARDCODED barY computed from an ESTIMATED cap
 * height (0.72 * size). Two errors compounded: Trade Gothic Next Bold
 * Condensed's real cap height is not 0.72em, and textFrame.top sets the
 * BOUNDING BOX top (ascender + leading included), not the cap top. Variant C's
 * bar ran THROUGH the letterforms and every block sat low.
 *
 * REV 2 replaced the estimate with tf.geometricBounds — and overcorrected,
 * because geometricBounds on LIVE TEXT returns the em/leading box, not the
 * ink. It measured 496pt of "ink" for a 470pt "TS": a ratio of 1.055em, which
 * is impossible for two caps with no descenders. The bar was gapped off the
 * em-box bottom, well below the baseline, and floated detached.
 *
 * REV 3 outlines the type (createOutline) and measures the resulting PATHS,
 * whose bounds ARE the ink. The gap is then taken from the true baseline.
 * Outlining also removes the font dependency from the exported artwork, which
 * for a licensed face living on one machine is worth having on its own.
 *
 * The audit now prints a cap/em ratio per board and flags anything at or
 * above ~0.95 as "em box, not ink" — so a silent regression to the rev-2
 * defect is visible rather than something to be re-discovered by eye.
 *
 * Everything is derived from the measured ink:
 *
 *   - bar WIDTH     = measured ink width * barWRatio   (1.0 = exactly the letters)
 *   - bar THICKNESS = measured ink height * barHRatio
 *   - GAP           = measured ink height * gapRatio
 *   - the whole block (ink + gap + bar) is then CENTRED from measured values
 *
 * So the bar cannot collide with the letters and the block cannot sit low,
 * whatever face resolves. The reference builder already centred horizontally
 * off tf.width; this simply extends that discipline to the vertical axis.
 *
 * The script now also CHECKS ITS OWN GEOMETRY and prints PASS/FAIL per board
 * in the AUDIT — a fit claim in a comment is not a fit check.
 *
 * WHY THIS FILE EXISTS AT ALL
 * ---------------------------
 * The favicon set was built square. X renders every avatar as a CIRCLE, and
 * the existing 512 maskable loses its frame corners to that crop. "Maskable"
 * is not the same guarantee: the PWA maskable spec protects the CONTENT safe
 * zone, it does not promise a full-bleed frame survives a circular mask.
 *
 * THE GEOMETRY THAT DECIDES EVERYTHING
 * ------------------------------------
 * For a square board of side S the crop is the INSCRIBED circle, radius S/2.
 * A square frame inset by i has its outer corner at
 *
 *     d = sqrt(2) * (S/2 - i)
 *
 * and the corner survives only if d <= S/2, i.e.
 *
 *     i  >=  (S/2) * (1 - 1/sqrt(2))  =  0.1464 * S      <- 14.64 PERCENT
 *
 * The shipped 512 maskable uses inset 51 = 9.96%, and needs 75. That file is
 * not wrong — it was built for a square favicon slot. It is the wrong asset
 * for a round hole. A ring has no corners and needs no such inset, which is
 * the whole argument for variant A.
 *
 * THREE TREATMENTS, ONE QUESTION
 * ------------------------------
 *   A  ring        box becomes a concentric ring — native to the crop
 *   B  box-safe    established square frame, inset to 16% so corners survive
 *   C  frameless   frame dropped, largest possible mark
 *
 * THE ONE QUESTION: which still reads at TIMELINE size (~48px), cropped?
 * Judge on the exported 48px PNGs in Finder at actual size. The MAGNIFIED
 * boards answer SHAPE only; they cannot answer legibility.
 *
 * WHAT TO UPLOAD
 * --------------
 * A SQUARE master (the *-1000 boards). X applies its own circular mask;
 * uploading a pre-cropped circle invites a second crop and a halo. The
 * CROP-PREVIEW boards exist to SEE the result, never to be uploaded.
 *
 * 1000x1000 is retina headroom. X's own stated requirement was NOT verified
 * when this file was written — read it from the uploader at registration and
 * record it in docs/social-handle-availability-and-registration.md (its 5.4).
 *
 * TO RUN:  File > Scripts > Other Script...  and pick this file.
 * IT NEVER TOUCHES AN OPEN DOCUMENT. It always creates a new one.
 */

#target illustrator

(function () {

    var thisApp = "an unknown application";
    try { thisApp = String(app.name); } catch (e) {}
    if (thisApp.indexOf("Illustrator") === -1) {
        alert("WRONG APPLICATION\n\nThis is an ILLUSTRATOR script (Told Straight X avatar).\n"
            + "You are running it in: " + thisApp + "\n\nNothing was created or changed.");
        return;
    }

    // ---- faces: only the title face is needed (TS letters) ----
    var FACE_TITLE = "TradeGothicNextLTPro-BdCn";
    var SEARCH_TITLE = [
        { require: ["tradegothicnext"], exclude: ["italic", "oblique"], prefer: ["bdcn", "boldcond", "hvcn"] },
        { require: ["helveticaneueltpro"], exclude: ["italic", "oblique"], prefer: ["bdcn", "blkcn"] }
    ];

    var EXPORT_PNG = true;
    var EXPORT_DIR = "~/Code/audio-lab/output/artwork/brand-x-avatar";

    /* Print/light tokens measured by pixel histogram 2026-07-27; dark tokens
       measured for WCAG contrast 2026-07-28. See
       brand/20260727-toldstraight-design-tokens.css — do not retype values
       from memory, they are traced there. */
    var PALETTE = {
        paper: [237, 233, 224], ink: [17, 17, 17], red: [176, 42, 40],
        dpaper: [20, 20, 15],   dink: [237, 233, 224], dred: [228, 86, 79]
    };
    var report = [];
    function log(s) { report.push(s); }
    function rgb(t) { var c = new RGBColor(); c.red = t[0]; c.green = t[1]; c.blue = t[2]; return c; }
    var C = { paper: rgb(PALETTE.paper), ink: rgb(PALETTE.ink), red: rgb(PALETTE.red),
              dpaper: rgb(PALETTE.dpaper), dink: rgb(PALETTE.dink), dred: rgb(PALETTE.dred) };

    // ---- font resolution (same machinery as the favicon builder) ----
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

    log("TOLD STRAIGHT — X profile avatar, circle-optimised  (REVISION 2)");
    log("Built " + new Date().toString());
    log("");

    // ---- document + boards ----
    var doc = app.documents.add(DocumentColorSpace.RGB, 1000, 1000);
    try { doc.rulerUnits = RulerUnits.Points; } catch (e) {}

    var GUTTER = 220;
    var BOARDS = [];
    var cursor = { r1: -1720, r2: -1720, r3: -1342, r4: -800 };
    var ROWTOP = { 1: 0, 2: -1300, 3: -2600, 4: -3300 };

    function addBoard(row, name, w, h) {
        var left = cursor["r" + row];
        var top = ROWTOP[row];
        cursor["r" + row] += w + GUTTER;
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

    var lyArt = doc.layers.add(); lyArt.name = "AVATARS";
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
    function styleFor(sizePt, tracking, dark) {
        var nm = "TSX/" + sizePt + (dark ? "/dark" : "");
        var st; try { st = doc.paragraphStyles.getByName(nm); } catch (e) { st = doc.paragraphStyles.add(nm); }
        try {
            var ca = st.characterAttributes;
            ca.size = sizePt; ca.leading = sizePt; ca.tracking = tracking; ca.autoLeading = false;
            ca.fillColor = dark ? C.dink : C.ink; if (fTitle) ca.textFont = fTitle;
        } catch (e2) {}
        return st;
    }

    /* THE FIX. Place the TS, MEASURE its true ink bounds, then derive the bar
       and centre the whole block from those measurements. Nothing about the
       bar's position is estimated from the point size, which is exactly what
       broke revision 1.

       geometricBounds is [left, top, right, bottom] in document coordinates
       with y increasing UPWARD, so ink height = top - bottom. translate()
       likewise takes a positive dy as "up". */
    function markBlock(grp, b, opts, accent) {
        var tf;
        try { tf = grp.textFrames.add(); } catch (e) { log("WARN: no text frame on " + b.name); return null; }
        tf.contents = "TS";
        try { styleFor(opts.tsSize, opts.track, opts.dark).applyTo(tf.textRange, true); } catch (e2) {}

        /* REVISION 3. geometricBounds on LIVE TEXT returns the em/leading box,
           NOT the ink — revision 2 measured 496pt of "ink" for a 470pt "TS"
           (1.055em), which is impossible for two caps with no descenders. The
           bar was therefore gapped off the em-box bottom, well below the
           baseline, and floated detached.

           Outlining converts the type to PATHS whose bounds ARE the ink, so
           the gap is measured from the true baseline. It also removes the font
           dependency from the exported artwork, which for a licensed face
           living on one machine is worth having on its own.

           If outlining fails we fall back to the live frame and SAY SO in the
           audit rather than silently reverting to the revision-2 defect. */
        var mark = tf, outlined = false;
        try { mark = tf.createOutline(); outlined = true; }
        catch (eO) { log("WARN: createOutline failed on " + b.name + " — measuring the em box, bar WILL sit low (" + eO + ")"); }

        var gb = null;
        try { gb = mark.geometricBounds; } catch (e3) {}
        if (!gb) { log("WARN: geometricBounds unavailable on " + b.name + " — bar skipped"); return null; }

        var inkW = gb[2] - gb[0];
        var inkH = gb[1] - gb[3];
        if (inkW <= 0 || inkH <= 0) { log("WARN: degenerate ink bounds on " + b.name); return null; }

        var barW = inkW * opts.barWRatio;
        var barH = inkH * opts.barHRatio;
        var gap  = inkH * opts.gapRatio;
        var blockH = inkH + gap + barH;

        var cx = px(b, b.w / 2);
        var cy = py(b, b.h / 2);

        /* lift: optical nudge. A heavy red bar makes the block bottom-weighted,
           so dead-centre can read low. Positive = up, as a fraction of block
           height. Kept small and explicit rather than baked into a magic Y. */
        var lift = blockH * opts.lift;
        var wantInkTop  = cy + blockH / 2 + lift;
        var wantInkLeft = cx - inkW / 2;

        try { mark.translate(wantInkLeft - gb[0], wantInkTop - gb[1]); }
        catch (e4) { log("WARN: translate failed on " + b.name + " — " + e4); }

        var barTop = wantInkTop - inkH - gap;
        var bar = grp.pathItems.rectangle(barTop, cx - barW / 2, barW, barH);
        bar.filled = true; bar.fillColor = accent; bar.stroked = false;

        return { inkW: inkW, inkH: inkH, barW: barW, barH: barH, gap: gap,
                 blockH: blockH, top: wantInkTop, bottom: barTop - barH,
                 cx: cx, cy: cy, outlined: outlined,
                 emRatio: inkH / opts.tsSize };
    }

    /* Self-check: does the drawn block actually fit inside the space that
       survives the crop? Computed from the SAME measured numbers that drew
       it, so it cannot drift from the artwork. */
    function fitCheck(name, m, b, limitRadius, label) {
        if (!m) { log("  " + name + ": NOT MEASURED"); return; }
        var halfW = m.inkW / 2;
        var halfH = m.blockH / 2;
        var d = Math.sqrt(halfW * halfW + halfH * halfH);
        log("  " + name);
        log("     ink " + Math.round(m.inkW) + " x " + Math.round(m.inkH)
            + "   bar " + Math.round(m.barW) + " x " + Math.round(m.barH)
            + "   gap " + Math.round(m.gap));
        /* cap/em sanity: true cap height for two caps lands near 0.70em. A
           value at or above ~0.95 means the em box was measured, not the ink
           — i.e. outlining did not happen and the bar will sit low. */
        log("     cap/em " + (Math.round(m.emRatio * 1000) / 1000)
            + (m.outlined ? "  (outlined — true ink)" : "  *** EM BOX, NOT INK — bar will sit low ***")
            + (m.emRatio > 0.95 ? "   *** ratio implies em box ***" : ""));
        log("     block corner " + Math.round(d) + " vs " + label + " " + Math.round(limitRadius)
            + "   -> " + (d <= limitRadius ? "PASS" : "*** FAIL — reduce tsSize ***"));
    }

    function avatar(b, opts, clipToCircle) {
        var dark   = !!opts.dark;
        var bg     = dark ? C.dpaper : C.paper;
        var fg     = dark ? C.dink   : C.ink;
        var accent = dark ? C.dred   : C.red;

        var grp = lyArt.groupItems.add();
        fillRectIn(grp, b, 0, 0, b.w, b.h, bg);

        var limit, label;
        if (opts.mode === "ring") {
            fillEllipseIn(grp, b, b.w / 2, b.h / 2, opts.ringR, fg);
            fillEllipseIn(grp, b, b.w / 2, b.h / 2, opts.ringR - opts.ringT, bg);
            limit = opts.ringR - opts.ringT; label = "ring inner r";
        } else if (opts.mode === "box") {
            fillRectIn(grp, b, opts.inset, opts.inset, b.w - opts.inset * 2, b.h - opts.inset * 2, fg);
            fillRectIn(grp, b, opts.inset + opts.frame, opts.inset + opts.frame,
                       b.w - (opts.inset + opts.frame) * 2, b.h - (opts.inset + opts.frame) * 2, bg);
            limit = (b.w / 2) - opts.inset - opts.frame; label = "box half-side";
        } else {
            limit = b.w / 2; label = "crop radius";
        }

        var m = markBlock(grp, b, opts, accent);
        if (opts.audit) fitCheck(b.name, m, b, limit, label);

        if (clipToCircle) {
            var clip = grp.pathItems.ellipse(py(b, 0), px(b, 0), b.w, b.h);
            try { clip.clipping = true; grp.clipped = true; }
            catch (eC) { log("WARN: clip failed on " + b.name + " — " + eC); }
        }
        return grp;
    }

    // =====================================================================
    // TREATMENTS. Every bar/gap value is now a RATIO of measured ink, not a
    // coordinate. barWRatio 1.0 means the bar is exactly as wide as the
    // letters — the M1 relationship, held automatically at any size or face.
    // =====================================================================
    /* Sizes raised from revision 2: measuring TRUE ink instead of the em box
       shrinks the block by roughly 30%, which both frees room for larger type
       and turns revision 2's marginal fits (297 vs 300, 18 vs 19) comfortable.
       barHRatio/gapRatio are now ratios of CAP HEIGHT, so they read larger
       than revision 2's em-box ratios for the same visual result. */
    var A = { mode: "ring", ringR: 460, ringT: 40, tsSize: 540, track: -10,
              barWRatio: 1.0, barHRatio: 0.13, gapRatio: 0.10, lift: 0.0 };
    // inset 160 = 16% > the 14.64% minimum, with margin against over-cropping
    var B = { mode: "box",  inset: 160, frame: 40, tsSize: 430, track: -10,
              barWRatio: 1.0, barHRatio: 0.13, gapRatio: 0.10, lift: 0.0 };
    var Cc = { mode: "none", tsSize: 700, track: -10,
               barWRatio: 1.0, barHRatio: 0.13, gapRatio: 0.10, lift: 0.0 };

    function withAudit(o) { var r = {}; for (var k in o) if (o.hasOwnProperty(k)) r[k] = o[k]; r.audit = true; return r; }

    log("MEASURED FIT CHECKS (computed from the same numbers that drew it)");

    // ROW 1 — the 1000pt masters. THESE are what gets uploaded.
    var a1000 = addBoard(1, "x-avatar-A-ring-1000",      1000, 1000);
    var b1000 = addBoard(1, "x-avatar-B-boxsafe-1000",   1000, 1000);
    var c1000 = addBoard(1, "x-avatar-C-frameless-1000", 1000, 1000);
    avatar(a1000, withAudit(A),  false);
    avatar(b1000, withAudit(B),  false);
    avatar(c1000, withAudit(Cc), false);

    // ROW 2 — the same three, circle-cropped. This is what X shows.
    var a1000c = addBoard(2, "CROP-PREVIEW-A-ring",      1000, 1000);
    var b1000c = addBoard(2, "CROP-PREVIEW-B-boxsafe",   1000, 1000);
    var c1000c = addBoard(2, "CROP-PREVIEW-C-frameless", 1000, 1000);
    avatar(a1000c, A,  true);
    avatar(b1000c, B,  true);
    avatar(c1000c, Cc, true);

    // ROW 3 — TRUE SIZE at the timeline avatar (~48px), cropped.
    // Ring/frame thicknesses are redrawn per size class, not scaled: at 48px
    // a proportionally-scaled 40pt ring is 1.9px and dies. The BAR is not
    // redrawn — it is measured, so it stays correct by construction.
    var A48 = { mode: "ring", ringR: 22, ringT: 3, tsSize: 26, track: -5,
                barWRatio: 1.0, barHRatio: 0.15, gapRatio: 0.12, lift: 0.0 };
    var B48 = { mode: "box",  inset: 7, frame: 2.5, tsSize: 19, track: -5,
                barWRatio: 1.0, barHRatio: 0.16, gapRatio: 0.13, lift: 0.0 };
    var C48 = { mode: "none", tsSize: 33, track: -5,
                barWRatio: 1.0, barHRatio: 0.15, gapRatio: 0.12, lift: 0.0 };

    log("");
    log("TRUE-SIZE 48px BOARDS");
    var a48 = addBoard(3, "x-avatar-A-ring-48",      48, 48);
    var b48 = addBoard(3, "x-avatar-B-boxsafe-48",   48, 48);
    var c48 = addBoard(3, "x-avatar-C-frameless-48", 48, 48);
    avatar(a48, withAudit(A48),  true);
    avatar(b48, withAudit(B48),  true);
    avatar(c48, withAudit(C48),  true);

    // Magnified 10x — same geometry, every dimension multiplied by 10.
    // Ratios are untouched, so these ARE the 48px boards, just larger.
    function times10(o) {
        var r = {}; for (var k in o) if (o.hasOwnProperty(k)) r[k] = o[k];
        var keys = ["ringR", "ringT", "inset", "frame", "tsSize"];
        for (var i = 0; i < keys.length; i++) if (r[keys[i]] !== undefined) r[keys[i]] = o[keys[i]] * 10;
        return r;
    }
    var a480 = addBoard(3, "MAGNIFIED-A-ring-48-10x",      480, 480);
    var b480 = addBoard(3, "MAGNIFIED-B-boxsafe-48-10x",   480, 480);
    var c480 = addBoard(3, "MAGNIFIED-C-frameless-48-10x", 480, 480);
    avatar(a480, times10(A48), true);
    avatar(b480, times10(B48), true);
    avatar(c480, times10(C48), true);

    // =====================================================================
    // AUDIT
    // =====================================================================
    log("");
    log("REVISION 3 — TWO BUGS, BOTH ABOUT MEASURING THE TYPE");
    log("  REV 1 placed the bar at a hardcoded Y from an ESTIMATED cap height");
    log("  (0.72*size). The real cap height is not 0.72em, and textFrame.top");
    log("  is the BOUNDING BOX top, not the cap top. Variant C's bar ran");
    log("  THROUGH the letters and every block sat low.");
    log("");
    log("  REV 2 measured tf.geometricBounds instead — and OVERCORRECTED,");
    log("  because geometricBounds on LIVE TEXT is the em/leading box, not");
    log("  the ink. It reported 496pt of ink for a 470pt TS: 1.055em, which");
    log("  is impossible for two caps with no descenders. The bar was gapped");
    log("  off the em-box bottom and floated detached below the baseline.");
    log("");
    log("  REV 3 OUTLINES the type and measures the resulting paths, whose");
    log("  bounds ARE the ink. Bar width = ink width * barWRatio (1.0 =");
    log("  exactly the letters, the M1 relationship); thickness and gap are");
    log("  ratios of CAP HEIGHT. The block is centred from measured values.");
    log("  Outlining also removes the font dependency from the exported");
    log("  artwork — the letterforms cannot reflow if the face fails later.");
    log("");
    log("  The cap/em ratio is printed per board above. Two caps should land");
    log("  near 0.70. Anything at or above ~0.95 means the em box got");
    log("  measured and the bar will sit low — flagged, not left to the eye.");
    log("");
    log("  'lift' is an explicit optical nudge (fraction of block height,");
    log("  positive = up), there because a heavy bar makes a dead-centred");
    log("  block read slightly low. Default 0 — raise it if it still looks");
    log("  low to you. It is a named knob, not a magic coordinate.");
    log("");
    log("THE GEOMETRY — why the existing favicon 512 loses its corners");
    log("  Crop = the inscribed circle, radius S/2. A square frame inset by i");
    log("  has its outer corner at sqrt(2)*(S/2 - i), which survives only if");
    log("");
    log("      i >= (S/2)*(1 - 1/sqrt(2)) = 0.1464 * S      (14.64%)");
    log("");
    log("  favicon-512-maskable uses inset 51 = 9.96% and needs 75. That file");
    log("  is not wrong — it was built for a square favicon. It is the wrong");
    log("  asset for a round hole. 'Maskable' protects the CONTENT safe zone,");
    log("  it does not promise a full-bleed frame's corners survive a mask.");
    log("");
    log("  B uses inset 160 on 1000 = 16%, clearing the minimum with margin");
    log("  in case X crops slightly inside the true inscribed circle. A ring");
    log("  has no corners and needs no such inset.");
    log("");
    log("THE ONE QUESTION: which still reads at TIMELINE size (~48px)?");
    log("  Row 3 is true size. Judge LEGIBILITY on the exported 48px PNGs in");
    log("  Finder at actual size — that is the honest test. The MAGNIFIED");
    log("  boards answer SHAPE only and cannot answer legibility.");
    log("");
    log("WHAT TO UPLOAD");
    log("  A SQUARE master — the *-1000 boards. X applies its own circular");
    log("  mask. Uploading a pre-cropped circle invites a second crop and a");
    log("  halo. The CROP-PREVIEW boards are for judging, never for upload.");
    log("");
    log("NOT VERIFIED: X's own stated avatar dimensions. 1000x1000 is chosen");
    log("  for retina headroom, not read from the uploader. Read the real");
    log("  requirement at registration and record it in");
    log("  docs/social-handle-availability-and-registration.md (its 5.4).");
    log("");
    log("NO STROKES EXIST anywhere here. Frames and rings are nested filled");
    log("  shapes — strokes vanish at true small sizes.");
    log("");
    log("Ring/frame thicknesses: EYEBALLED per size class. The BAR is not —");
    log("  it is measured, and stays correct by construction.");

    var bAud = addBoard(4, "AUDIT", 1600, 1900);
    (function () {
        var bgr = lyAudit.pathItems.rectangle(py(bAud, 0), px(bAud, 0), bAud.w, bAud.h);
        bgr.filled = true; bgr.fillColor = C.paper; bgr.stroked = false;
        var bx = lyAudit.pathItems.rectangle(py(bAud, 80), px(bAud, 80), bAud.w - 160, bAud.h - 160);
        var tf; try { tf = lyAudit.textFrames.areaText(bx); } catch (e) { return; }
        tf.contents = report.join("\r");
        var st = styleFor(18, 0);
        try { st.characterAttributes.leading = 25; st.applyTo(tf.textRange, true); } catch (e2) {}
    })();

    try { app.executeMenuCommand("fitall"); } catch (e) {}

    // ---- export ----
    /* Named by artboard INDEX so a board reorder breaks loudly here rather
       than silently exporting the wrong artwork. */
    var exportNote = "";
    if (EXPORT_PNG) {
        try {
            var dir = new Folder(EXPORT_DIR);
            if (!dir.exists) dir.create();
            var opts = new ExportOptionsPNG24();
            opts.artBoardClipping = true; opts.transparency = false;
            opts.horizontalScale = 100; opts.verticalScale = 100;

            var idx   = [0, 1, 2, 3, 4, 5, 6, 7, 8];
            var names = [
                "20260731-adobe-illustrator-toldstraight-x-avatar-a-ring-1000",
                "20260731-adobe-illustrator-toldstraight-x-avatar-b-boxsafe-1000",
                "20260731-adobe-illustrator-toldstraight-x-avatar-c-frameless-1000",
                "20260731-adobe-illustrator-toldstraight-x-avatar-a-ring-croppreview-1000",
                "20260731-adobe-illustrator-toldstraight-x-avatar-b-boxsafe-croppreview-1000",
                "20260731-adobe-illustrator-toldstraight-x-avatar-c-frameless-croppreview-1000",
                "20260731-adobe-illustrator-toldstraight-x-avatar-a-ring-48",
                "20260731-adobe-illustrator-toldstraight-x-avatar-b-boxsafe-48",
                "20260731-adobe-illustrator-toldstraight-x-avatar-c-frameless-48"
            ];
            for (var e5 = 0; e5 < idx.length; e5++) {
                if (idx[e5] >= doc.artboards.length) continue;
                doc.artboards.setActiveArtboardIndex(idx[e5]);
                doc.exportFile(new File(dir.fsName + "/" + names[e5] + ".png"), ExportType.PNG24, opts);
            }
            exportNote = "\n" + names.length + " PNGs written to " + EXPORT_DIR + "\n";
        } catch (e6) { exportNote = "\nExport failed: " + e6 + "\n"; }
    }

    alert("Told Straight — X avatar, REVISION 3 (outlined, true ink).\n\n"
        + "REV 2 overcorrected: geometricBounds on LIVE TEXT is the em box,\n"
        + "not the ink, so the bar floated BELOW the baseline. REV 3 outlines\n"
        + "the type and measures the paths, whose bounds ARE the ink.\n\n"
        + "CHECK THE AUDIT BOARD: per-board PASS/FAIL fit checks, plus a\n"
        + "cap/em ratio. Two caps should read near 0.70 — anything at or\n"
        + "above 0.95 means the em box got measured and is flagged.\n"
        + "Any FAIL means reduce that variant's tsSize.\n\n"
        + "THE QUESTION: which still reads at ~48px (timeline size)?\n"
        + "  LEGIBILITY -> the exported 48px PNGs in Finder, actual size.\n\n"
        + "Upload a SQUARE *-1000 master — never a crop preview.\n\n"
        + "Title face: " + (psTitle || "DEFAULT") + "\n"
        + (faceWarnings === 0 ? "Face resolved at intended weight.\n"
                              : "*** FACE COMPROMISED — stop before judging. ***\n")
        + exportNote
        + "\nNothing here touches episodes/ or the feed.");

})();
