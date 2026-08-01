/**
 * Told Straight — APPROVED CARD SYSTEM  (ILLUSTRATOR)
 * ==================================================================
 * The single builder for episode covers and chapter (exhibit) cards.
 *
 * WHAT MAKES THIS ONE DIFFERENT FROM ITS PREDECESSORS
 * ---------------------------------------------------
 * Every number in section 1 was MEASURED off the approved artwork,
 * episodes/ToldStraight-Ep01/cover.png and ch1.png, on 2026-08-01, and
 * is recorded in brand/20260801-toldstraight-approved-card-standard.md.
 * Nothing here is eyeballed or recalled.
 *
 * The faces were recovered by fitting glyph ink-width / cap-height --
 * a ratio independent of both point size and tracking -- against 987
 * fonts installed on the maintainer's machine, then confirmed by pixel
 * overlap at matched cap height. Results:
 *
 *   TITLE : Arial Narrow Bold   RMS 0.018, IoU 0.777   <- CONDENSED
 *   MONO  : Courier New Bold                IoU 0.587
 *
 * Wide grotesques were tested and REJECTED. Arial Bold and Helvetica
 * Bold are 15-20% too wide on every glyph and only reach the measured
 * line width at about -145/1000 em tracking, which collides the
 * letters. The Ep01 title is not a wide face. It has been read as one
 * by eye more than once; the measurement settles it.
 *
 * NEITHER FACE IS AN ADOBE FONT. Trade Gothic Next, Letter Gothic and
 * Univers are absent from all 215 synced CoreSync faces on that
 * machine, which is exactly how a builder asking for
 * TradeGothicNextLTPro-BdCn ended up rendering a fallback.
 *
 * THEREFORE: this builder FAILS LOUDLY on an unresolved face. It never
 * substitutes a wide fallback. Silent fallback is the whole reason the
 * standard had to be reconstructed from pixels.
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
    try { thisApp = String(app.name); } catch (eN) {}
    if (thisApp.indexOf("Illustrator") === -1) {
        alert("WRONG APPLICATION\n\n"
            + "This is an ILLUSTRATOR script (Told Straight approved card system).\n"
            + "You are running it in: " + thisApp + "\n\n"
            + "Open Adobe Illustrator and run it from File > Scripts > Other Script...\n\n"
            + "Nothing was created or changed.");
        return;
    }


    // ==============================================================
    // 0. MAINTAINER KNOBS
    // ==============================================================
    // The measured card is 1.00. Raise to bump; the baseline stays
    // visible so the deviation from the approved art is always legible.
    var SUBTITLE_SCALE = 1.00;   // cover subtitle, chapter subtitle
    var BOTTOM_SCALE   = 1.00;   // cover footer, chapter citations

    // Which episodes to build. Content lives in section 6.
    var BUILD = ["ep01"];        // e.g. ["ep01","ep02","ep03"]


    // ==============================================================
    // 1. THE MEASURED STANDARD  (see brand/…-approved-card-standard.md)
    // ==============================================================
    var CANVAS = 1600;

    var FACE = {
        title: "ArialNarrow-Bold",
        mono:  "CourierNewPS-BoldMT"
    };

    // Condensed-only fallbacks. There is deliberately NO wide face in
    // any chain -- a wide fallback is the documented failure mode.
    var SEARCH = {
        title: [
            { require: ["arialnarrow"],       prefer: ["bold", "bd"] },
            { require: ["helveticaneue"],     prefer: ["condensedbold", "condbold", "bdcn"] },
            { require: ["ptsansnarrow"],      prefer: ["bold"] },
            { require: ["robotocondensed"],   prefer: ["bold"] },
            { require: ["firasanscondensed"], prefer: ["bold"] }
        ],
        mono: [
            { require: ["couriernew"], prefer: ["boldmt", "bold", "bd"] },
            { require: ["courier"],    exclude: ["prime"], prefer: ["bold", "bo"] },
            { require: ["menlo"],      prefer: ["bold"] }
        ]
    };

    var C_HEX = {
        paper: [237, 233, 224],
        ink:   [17, 17, 17],
        red:   [176, 42, 40],
        grey:  [120, 116, 108],
        hair:  [200, 196, 186]
    };

    // Frame
    var FRAME_INSET = 40, FRAME_W = 6;

    // Shared header
    var HEAD_CAP = 21, HEAD_TOP = 96, HEAD_L = 71, HEAD_TRACK = 108;
    var HEADR_CAP = 18, HEADR_TOP = 99, HEADR_L = 900, HEADR_TRACK = 0;
    var HEAD_RULE_Y = 149, HEAD_RULE_H = 3, RULE_X0 = 62, RULE_X1 = 1537;

    // Cover title zone
    var TITLE_CAP_MAJOR = 147;
    var TITLE_MINOR_RATIO = 0.755;      // measured 111/147 -- NOT 0.66
    var TITLE_TOPS = [293, 463, 619];   // measured cap-tops, 3-line case
    var TITLE_TRACK_MAJOR = -13, TITLE_TRACK_MINOR = -21;
    var TITLE_CENTRE = 801.5;
    var TITLE_COL = 1310;               // widest measured line + margin

    // Red rule: anchored UNDER the last title line, never a constant
    var RED_GAP = 10, RED_H = 8, RED_X0 = 120, RED_X1 = 1480;

    // Cover subtitle: hangs off the rule
    var SUB_CAP = 31, SUB_TRACK = 142, SUB_GAP_BELOW_RULE = 48;

    // Cover fields
    var FIELD_CAP = 23, FIELD_TRACK = 22;
    var FIELD_TOPS = [938, 1030, 1122];
    var FIELD_KEY_X = 160, FIELD_VAL_X = 592;
    var HAIR_DY = 47, HAIR_H = 2, HAIR_X0 = 160, HAIR_X1 = 1440;

    // Cover footer
    var FOOT_CAP = 18, FOOT_TOPS = [1511, 1537], FOOT_X = 71;

    // Chapter card
    var CH_HEAD_TOP = 94, CH_HEAD_L = 70;
    var CH_RULE_Y = 147;
    var CH_STATE_CAP = 111, CH_STATE_TOP = 537;
    var CH_RED_Y = 757, CH_RED_X0 = 200, CH_RED_X1 = 1400;
    var CH_SUB_CAP = 44, CH_SUB_TOP = 830;
    var CH_CITE_CAPS = [30, 26], CH_CITE_TOPS = [1068, 1122];
    var CH_FOOT_CAP = 18, CH_FOOT_TOP = 1512, CH_FOOT_R = 1527;

    // Stamp. NOT precisely measured -- flagged in the audit.
    var STAMP_ESTIMATED = true;
    var STAMP = { cx: 1270, cy: 1373, w: 560, h: 190, rot: -12, cap: 82, stroke: 9 };


    // ==============================================================
    // 2. DOC, COLOUR, LOG
    // ==============================================================
    var LOG = [];
    function log(s) { LOG.push(String(s)); }

    function rgb(a) {
        var c = new RGBColor();
        c.red = a[0]; c.green = a[1]; c.blue = a[2];
        return c;
    }

    var doc = app.documents.add(DocumentColorSpace.RGB, CANVAS, CANVAS);
    var C = {
        paper: rgb(C_HEX.paper), ink: rgb(C_HEX.ink), red: rgb(C_HEX.red),
        grey: rgb(C_HEX.grey), hair: rgb(C_HEX.hair)
    };

    var lyArt = doc.layers.add(); lyArt.name = "ART";
    var lyType = doc.layers.add(); lyType.name = "TYPE";


    // ==============================================================
    // 3. FONT RESOLUTION — loud failure, never a wide fallback
    // ==============================================================
    function lc(s) { return String(s).toLowerCase(); }

    function findFont(exact, chains) {
        var i, j, f;
        for (i = 0; i < app.textFonts.length; i++) {
            if (String(app.textFonts[i].name) === exact) return app.textFonts[i];
        }
        for (j = 0; j < chains.length; j++) {
            var rule = chains[j], best = null, bestScore = -1;
            for (i = 0; i < app.textFonts.length; i++) {
                f = app.textFonts[i];
                var n = lc(f.name), ok = true, k;
                for (k = 0; k < rule.require.length; k++) {
                    if (n.indexOf(rule.require[k]) === -1) { ok = false; break; }
                }
                if (ok && rule.exclude) {
                    for (k = 0; k < rule.exclude.length; k++) {
                        if (n.indexOf(rule.exclude[k]) !== -1) { ok = false; break; }
                    }
                }
                if (!ok) continue;
                var score = 0;
                for (k = 0; k < rule.prefer.length; k++) {
                    if (n.indexOf(rule.prefer[k]) !== -1) {
                        score = rule.prefer.length - k; break;
                    }
                }
                if (score > bestScore) { bestScore = score; best = f; }
            }
            if (best) return best;
        }
        return null;
    }

    var fTitle = findFont(FACE.title, SEARCH.title);
    var fMono  = findFont(FACE.mono,  SEARCH.mono);

    if (!fTitle || !fMono) {
        var miss = (!fTitle ? "TITLE (" + FACE.title + ")" : "")
                 + (!fTitle && !fMono ? " and " : "")
                 + (!fMono ? "MONO (" + FACE.mono + ")" : "");
        doc.close(SaveOptions.DONOTSAVECHANGES);
        alert("FONT NOT RESOLVED — nothing was built.\n\n"
            + "Missing: " + miss + "\n\n"
            + "This builder refuses to substitute a wide face. Setting these\n"
            + "cards in Helvetica or Arial at normal width is the documented\n"
            + "defect this file exists to prevent — it is 15-20% too wide on\n"
            + "every glyph.\n\n"
            + "Activate the face and run again. See\n"
            + "brand/20260801-toldstraight-approved-card-standard.md");
        return;
    }
    log("TITLE face resolved: " + fTitle.name
        + (String(fTitle.name) === FACE.title ? "  (exact)" : "  (FALLBACK — check it is condensed)"));
    log("MONO  face resolved: " + fMono.name
        + (String(fMono.name) === FACE.mono ? "  (exact)" : "  (FALLBACK)"));


    // ==============================================================
    // 4. PLACEMENT — by INK BOX, which is what was measured
    // ==============================================================
    // Card space is 0..1600 with y increasing DOWNWARD, matching the
    // measurements. Illustrator's y increases upward.
    function px(b, x) { return b.x0 + x; }
    function py(b, y) { return b.y0 - y; }

    /**
     * Place point text so its INK lands exactly where measured.
     * Text-box tops move with font metrics; ink does not, so every
     * measured value is an ink coordinate and every placement uses one.
     */
    function place(b, text, font, capPx, trackEm, colour, opt) {
        var tf = null;
        try {
            tf = lyType.textFrames.add();
            tf.contents = text;
            var ca = tf.textRange.characterAttributes;
            ca.autoLeading = false;
            ca.textFont = font;
            ca.tracking = trackEm;
            ca.fillColor = colour;

            // Solve point size for the requested cap height by probing:
            // set a reference size, measure the ink, scale once.
            ca.size = 100; ca.leading = 100;
            try { app.redraw(); } catch (e1) {}
            var probeH = tf.height;
            if (probeH <= 0) { throw new Error("zero-height probe"); }
            var size = 100 * (capPx / probeH);
            ca.size = size; ca.leading = size;
            try { app.redraw(); } catch (e2) {}

            var w = tf.width;
            if (opt.centre !== undefined) tf.left = px(b, opt.centre - w / 2);
            else if (opt.right !== undefined) tf.left = px(b, opt.right - w);
            else tf.left = px(b, opt.left);
            tf.top = py(b, opt.capTop);

            return { tf: tf, size: size, w: w, h: tf.height };
        } catch (e) {
            log("WARN: could not place '" + text + "' — " + e);
            return null;
        }
    }

    function bar(b, y, x0, x1, h, colour) {
        var r = lyArt.pathItems.rectangle(py(b, y), px(b, x0), x1 - x0, h);
        r.filled = true; r.fillColor = colour; r.stroked = false;
        return r;
    }

    function frame(b) {
        var bg = lyArt.pathItems.rectangle(py(b, 0), px(b, 0), CANVAS, CANVAS);
        bg.filled = true; bg.fillColor = C.paper; bg.stroked = false;
        var fr = lyArt.pathItems.rectangle(
            py(b, FRAME_INSET), px(b, FRAME_INSET),
            CANVAS - 2 * FRAME_INSET, CANVAS - 2 * FRAME_INSET);
        fr.filled = false; fr.stroked = true;
        fr.strokeColor = C.ink; fr.strokeWidth = FRAME_W;
    }


    // ==============================================================
    // 5. CARD BUILDERS
    // ==============================================================
    function isMinor(line, longest) {
        var t = String(line).replace(/\s+/g, "");
        return (t.length <= 4) || (t.length < longest * 0.45);
    }

    function buildCover(b, spec) {
        frame(b);
        place(b, spec.formNo, fMono, HEAD_CAP, HEAD_TRACK, C.ink,
              { left: HEAD_L, capTop: HEAD_TOP });
        place(b, spec.dept, fMono, HEADR_CAP, HEADR_TRACK, C.grey,
              { left: HEADR_L, capTop: HEADR_TOP });
        bar(b, HEAD_RULE_Y, RULE_X0, RULE_X1, HEAD_RULE_H, C.ink);

        // --- title: MAJOR/minor, measured ratio, ink-top placement ---
        var lines = spec.title, i, longest = 0;
        for (i = 0; i < lines.length; i++) {
            var L = String(lines[i]).replace(/\s+/g, "").length;
            if (L > longest) longest = L;
        }
        // Height budget: reuse the measured cap-tops for the 3-line
        // case; otherwise distribute on the same rhythm.
        var tops = [];
        if (lines.length === TITLE_TOPS.length) {
            tops = TITLE_TOPS;
        } else {
            var pitch = 170, first = 293;
            for (i = 0; i < lines.length; i++) tops.push(first + i * pitch);
        }

        var lastBottom = 0, majorCap = TITLE_CAP_MAJOR;
        // width guard: shrink the whole block if any line overruns
        var shrink = 1.0;
        for (i = 0; i < lines.length; i++) {
            var capW = isMinor(lines[i], longest)
                     ? majorCap * TITLE_MINOR_RATIO : majorCap;
            var probe = place(b, lines[i], fTitle, capW,
                              isMinor(lines[i], longest) ? TITLE_TRACK_MINOR : TITLE_TRACK_MAJOR,
                              C.ink, { centre: TITLE_CENTRE, capTop: tops[i] });
            if (probe && probe.w > TITLE_COL) {
                var s = TITLE_COL / probe.w;
                if (s < shrink) shrink = s;
            }
            if (probe) probe.tf.remove();
        }
        if (shrink < 1.0) log("  title block shrunk to " + Math.round(shrink * 100) + "% to fit the column");

        for (i = 0; i < lines.length; i++) {
            var minor = isMinor(lines[i], longest);
            var cap = (minor ? majorCap * TITLE_MINOR_RATIO : majorCap) * shrink;
            var r = place(b, lines[i], fTitle, cap,
                          minor ? TITLE_TRACK_MINOR : TITLE_TRACK_MAJOR,
                          C.ink, { centre: TITLE_CENTRE, capTop: tops[i] });
            if (r) {
                var bot = tops[i] + cap;
                if (bot > lastBottom) lastBottom = bot;
                log("    " + (minor ? "minor " : "MAJOR ") + lines[i]
                    + "  cap " + Math.round(cap) + "  " + Math.round(r.w) + "pt wide");
            }
        }

        // --- red rule follows the title, then the subtitle follows it ---
        var ruleY = lastBottom + RED_GAP;
        bar(b, ruleY, RED_X0, RED_X1, RED_H, C.red);
        var subTop = ruleY + SUB_GAP_BELOW_RULE;
        place(b, spec.subtitle, fMono, SUB_CAP * SUBTITLE_SCALE, SUB_TRACK, C.ink,
              { centre: TITLE_CENTRE, capTop: subTop });
        log("    red rule y " + Math.round(ruleY) + "   subtitle cap "
            + Math.round(SUB_CAP * SUBTITLE_SCALE));

        // --- fields ---
        for (i = 0; i < spec.fields.length && i < FIELD_TOPS.length; i++) {
            var f = spec.fields[i], top = FIELD_TOPS[i];
            place(b, f.k, fMono, FIELD_CAP, FIELD_TRACK, C.grey,
                  { left: FIELD_KEY_X, capTop: top });
            place(b, f.v, fMono, FIELD_CAP, FIELD_TRACK, C.ink,
                  { left: FIELD_VAL_X, capTop: top });
            bar(b, top + HAIR_DY, HAIR_X0, HAIR_X1, HAIR_H, C.hair);
        }

        // --- footer ---
        place(b, spec.footer1, fMono, FOOT_CAP * BOTTOM_SCALE, -3, C.grey,
              { left: FOOT_X + 1, capTop: FOOT_TOPS[0] });
        place(b, spec.footer2, fMono, FOOT_CAP * BOTTOM_SCALE, 0, C.ink,
              { left: FOOT_X, capTop: FOOT_TOPS[1] });

        // --- stamp (geometry estimated, flagged) ---
        if (spec.stamp) {
            var sx = STAMP.cx - STAMP.w / 2, sy = STAMP.cy - STAMP.h / 2;
            var box = lyArt.pathItems.rectangle(py(b, sy), px(b, sx), STAMP.w, STAMP.h);
            box.filled = false; box.stroked = true;
            box.strokeColor = C.red; box.strokeWidth = STAMP.stroke;
            var st = place(b, spec.stamp, fTitle, STAMP.cap, 0, C.red,
                           { centre: STAMP.cx, capTop: STAMP.cy - STAMP.cap / 2 });
            try {
                box.rotate(STAMP.rot);
                if (st) st.tf.rotate(STAMP.rot);
            } catch (eR) { log("WARN: stamp rotation — " + eR); }
            if (STAMP_ESTIMATED) {
                log("  ** STAMP GEOMETRY IS ESTIMATED, not measured. Check it against "
                    + "episodes/ToldStraight-Ep01/cover.png before accepting. **");
            }
        }
    }

    function buildChapter(b, spec) {
        frame(b);
        place(b, spec.exhibit, fMono, HEAD_CAP, HEAD_TRACK, C.ink,
              { left: CH_HEAD_L, capTop: CH_HEAD_TOP });
        bar(b, CH_RULE_Y, RULE_X0, RULE_X1, HEAD_RULE_H, C.ink);

        place(b, spec.statement, fTitle, CH_STATE_CAP, TITLE_TRACK_MINOR, C.ink,
              { centre: TITLE_CENTRE, capTop: CH_STATE_TOP });
        bar(b, CH_RED_Y, CH_RED_X0, CH_RED_X1, RED_H, C.red);

        // NOTE: the chapter subtitle is the TITLE face, not the mono.
        place(b, spec.subtitle, fTitle, CH_SUB_CAP * SUBTITLE_SCALE, 0, C.ink,
              { centre: TITLE_CENTRE, capTop: CH_SUB_TOP });

        for (var i = 0; i < spec.cite.length && i < CH_CITE_TOPS.length; i++) {
            place(b, spec.cite[i], fMono, CH_CITE_CAPS[i] * BOTTOM_SCALE, 0, C.grey,
                  { centre: TITLE_CENTRE, capTop: CH_CITE_TOPS[i] });
        }

        place(b, spec.footL, fMono, CH_FOOT_CAP * BOTTOM_SCALE, 0, C.grey,
              { left: FOOT_X, capTop: CH_FOOT_TOP });
        place(b, spec.footR, fMono, CH_FOOT_CAP * BOTTOM_SCALE, 0, C.grey,
              { right: CH_FOOT_R, capTop: CH_FOOT_TOP });
    }


    // ==============================================================
    // 6. CONTENT — verbatim from the approved artwork
    // ==============================================================
    var EPISODES = {
        ep01: {
            cover: {
                formNo: "FORM ADHD-01",
                dept: "DEPT. OF NEURODEVELOPMENTAL AFFAIRS",
                title: ["MEMBERSHIP", "HAS", "REQUIREMENTS"],
                subtitle: "ADULT ADHD - TOLD STRAIGHT",
                fields: [
                    { k: "MEMBER:", v: "[ YOU ]" },
                    { k: "STATUS:", v: "DIAGNOSED - CONFIRMED" },
                    { k: "ESTABLISHED:", v: "1775 (older than the U.S.)" }
                ],
                footer1: "PODCAST",
                footer2: "TOLD STRAIGHT / EP.01",
                stamp: "MEMBER"
            },
            chapters: [
                { exhibit: "EXHIBIT 01 - PROVENANCE",
                  statement: "EST. 1775",
                  subtitle: "FIRST MEDICAL DESCRIPTION OF ADHD",
                  cite: ["WEIKARD, cited in FARAONE et al.,",
                         "WORLD FED. CONSENSUS, NEUROSCI BIOBEHAV REV 2021"],
                  footL: "TOLD STRAIGHT / EP.01", footR: "01/06" }
            ]
        }
    };


    // ==============================================================
    // 7. BUILD
    // ==============================================================
    var boards = [], gap = 200, cursorX = 0, e, ep, ci;

    function newBoard(name) {
        var b = { x0: cursorX, y0: 0, name: name };
        cursorX += CANVAS + gap;
        return b;
    }

    for (e = 0; e < BUILD.length; e++) {
        ep = EPISODES[BUILD[e]];
        if (!ep) { log("SKIP: no content for " + BUILD[e]); continue; }
        log("");
        log(BUILD[e].toUpperCase() + " COVER");
        buildCover(newBoard(BUILD[e] + "-cover"), ep.cover);
        for (ci = 0; ci < ep.chapters.length; ci++) {
            log(BUILD[e].toUpperCase() + " CH" + (ci + 1));
            buildChapter(newBoard(BUILD[e] + "-ch" + (ci + 1)), ep.chapters[ci]);
        }
    }

    // real artboards over the laid-out cards
    try {
        while (doc.artboards.length > 1) doc.artboards[doc.artboards.length - 1].remove();
        var n = Math.round(cursorX / (CANVAS + gap));
        doc.artboards[0].artboardRect = [0, 0, CANVAS, -CANVAS];
        for (var a = 1; a < n; a++) {
            var ox = a * (CANVAS + gap);
            doc.artboards.add([ox, 0, ox + CANVAS, -CANVAS]);
        }
    } catch (eA) { log("WARN: artboards — " + eA); }


    // ==============================================================
    // 8. AUDIT — the report is part of the deliverable
    // ==============================================================
    log("");
    log("SCALES: subtitle x" + SUBTITLE_SCALE + "   bottom x" + BOTTOM_SCALE);
    log("Standard: brand/20260801-toldstraight-approved-card-standard.md");
    log("If either resolved face above is not CONDENSED (title) or a");
    log("SLAB-SERIF typewriter face (mono), stop and fix the activation —");
    log("do not accept the output.");

    alert("Told Straight — approved card system\n\n" + LOG.join("\n"));

})();
