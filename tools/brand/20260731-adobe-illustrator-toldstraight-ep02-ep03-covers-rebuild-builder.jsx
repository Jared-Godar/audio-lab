/**
 * Told Straight — Ep02 + Ep03 covers, REBUILT with fitted titles  (ILLUSTRATOR)
 * ==================================================================
 * Why this builder exists (2026-07-31):
 *
 *   1. EP02 HAD NO BUILDER AT ALL. Its cover.png landed in commit 7ad83c7
 *      (#64/#66), which PREDATES the type shootout that locked the faces on
 *      2026-07-27. It is the only episode card never rebuilt into the system,
 *      which is exactly why it reads as the odd one out.
 *
 *   2. THE EP03 BUILDER'S TITLE DOES NOT FIT ANYTHING BUT ITS OWN TITLE.
 *      20260729-...-ep03-cover-and-cast-builder.jsx sets the title at a literal
 *      215pt and places lines at hard-coded y=330 / y=560 with the red rule at
 *      y=820. That works for "SESSION" / "TWO" and nothing else. A three-line
 *      title runs straight through the red rule — and because Illustrator area
 *      text CLIPS rather than throwing, the script still reports success. The
 *      composition was encoded as coordinates instead of as constraints.
 *
 * So the titles here are FITTED, not placed:
 *
 *      size = min(MAX, zoneHeight / lineCount * ratio)  then shrunk further,
 *      if needed, until the WIDEST line fits the column. The finished block is
 *      centred in the zone between the header rule and the red rule. Two-line
 *      titles come out large, three-line titles proportionally smaller, and
 *      NEITHER can collide with the rule. Add a fourth line and it still holds.
 *
 * TWO COVER ARTBOARDS, both 1600 x 1600, siblings of the Ep01/Ep03 set:
 *
 *   1  EP02 COVER   "ADDITIONAL / TRAINING / REQUIRED"
 *   2  EP03 COVER   "YOUR / RESULTS / MAY VARY"
 *   3  AUDIT        what was resolved, what was fitted, what compromised
 *
 * TO RUN:  File > Scripts > Other Script...  and pick this file.
 * IT NEVER TOUCHES AN OPEN DOCUMENT. It always creates a new one.
 * It NEVER writes into episodes/ — PNGs go to the gitignored output/ zone and
 * the maintainer promotes them, same gate as every other builder here.
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
            + "This is an ILLUSTRATOR script (Told Straight Ep02 + Ep03 covers).\n"
            + "You are running it in: " + thisApp + "\n\n"
            + "Open Adobe Illustrator and run it from File > Scripts > Other Script...\n\n"
            + "Nothing was created or changed.");
        return;
    }


    // ==============================================================
    // 0. FACES — pinned from the shootout, 2026-07-27. Identical to the
    //    Ep01 and Ep03 builders on purpose: one system, one resolution path.
    // ==============================================================

    var FACE = {
        title: "TradeGothicNextLTPro-BdCn",
        label: null,
        mono:  "LetterGothicStd"
    };

    var SEARCH = {
        title: [
            { require: ["tradegothicnext"], exclude: ["italic", "oblique"],
              prefer: ["bdcn", "boldcond", "condbold", "hvcn"] },
            { require: ["helveticaneueltpro"], exclude: ["italic", "oblique", "obl"],
              prefer: ["bdcn", "blkcn"] },
            { require: ["oswald"], exclude: ["italic"], prefer: ["bold", "semibold"] }
        ],
        label: [
            { require: ["tradegothicnext"], exclude: ["italic", "oblique", "cn"],
              prefer: ["regular", "bold"] },
            { require: ["helveticaneueltpro"], exclude: ["italic", "oblique", "obl"],
              prefer: ["roman", "md"] }
        ],
        mono: [
            { require: ["lettergothic"],  exclude: ["italic", "oblique"], prefer: ["std", "bold", "medium"] },
            { require: ["oratorstd"],     exclude: ["italic", "oblique"], prefer: ["std", "medium"] },
            { require: ["courierprime"],  exclude: ["italic", "oblique"], prefer: ["regular", "prime"] },
            { require: ["ibmplexmono"],   exclude: ["italic", "oblique"], prefer: ["regular", "text"] },
            { require: ["sourcecodepro"], exclude: ["italic", "oblique"], prefer: ["regular"] },
            { require: ["courier"],       exclude: ["italic", "oblique"], prefer: ["regular", "psmt"] }
        ]
    };

    var EXPORT_PNG = true;
    var EXPORT_DIR = "~/Code/audio-lab/output/artwork/ep02-ep03-rebuild";


    // ==============================================================
    // 1. CONTENT
    // ==============================================================
    //
    // AUTHORITY LINE — still open. The Ep01/Ep03 set says DEPT. OF PLAIN TRUTH.
    // Ep02 is the skills/therapy episode, where DEPT. OF NEURODEVELOPMENTAL
    // AFFAIRS is the funnier and more specific joke, at the cost of breaking a
    // running gag that only works by repetition. Flip AUTHORITY_EP02 below to
    // see both; the set currently ships consistent.

    var AUTHORITY_EP02 = "DEPT. OF PLAIN TRUTH";
    // var AUTHORITY_EP02 = "DEPT. OF NEURODEVELOPMENTAL AFFAIRS";

    var COVERS = [
        {
            board:     "ep02-cover",
            formNo:    "FORM TS-02",
            authority: AUTHORITY_EP02,
            // Three lines. This is the title that broke the old builder.
            title:     ["ADDITIONAL", "TRAINING", "REQUIRED"],
            subtitle:  "THE SKILLS THAT COMPLEMENT THE PILLS",
            fields: [
                { k: "PATIENT:", v: "[ YOU ]" },
                { k: "STATUS:",  v: "MEDICATED, STILL STRUGGLING" },
                { k: "Rx:",      v: "NECESSARY / NOT SUFFICIENT" }
            ],
            stamp: "IN SESSION",
            foot1: "PODCAST",
            foot2: "TOLD STRAIGHT / EP.02",
            pngName: "20260731-adobe-illustrator-toldstraight-ep02-cover-additional-training-required-1600"
        },
        {
            board:     "ep03-cover",
            formNo:    "FORM TS-03",
            authority: "DEPT. OF PLAIN TRUTH",
            title:     ["YOUR", "RESULTS", "MAY VARY"],
            subtitle:  "BUT HERE ARE MINE",
            fields: [
                { k: "SUBJECT:",    v: "[ ME ]" },
                // Spelled out, per the maintainer — YSQ means nothing cold.
                { k: "INSTRUMENT:", v: "YOUNG SCHEMA QUESTIONNAIRE" },
                { k: "STATUS:",     v: "232 ITEMS, SCORED" }
            ],
            stamp: "RESULTS ENCLOSED",
            foot1: "PODCAST",
            foot2: "TOLD STRAIGHT / EP.03",
            pngName: "20260731-adobe-illustrator-toldstraight-ep03-cover-your-results-may-vary-1600"
        }
    ];


    // ==============================================================
    // 2. GEOMETRY + PALETTE  (measured from the v1 PNGs, 2026-07-27)
    // ==============================================================

    var EP     = 1600;
    var GUTTER = 220;
    var M      = 96;

    // The title zone: everything between the header rule and the red rule.
    // The fitter owns this band and nothing else draws into it.
    var TITLE_TOP    = 300;
    var TITLE_BOTTOM = 782;   // 38pt of air above the red rule at 820
    var RED_RULE_Y   = 820;
    var TITLE_MAX_PT = 232;   // a one-word title should not become a billboard
    var TITLE_COL    = EP - 150;  // usable width for a title line

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
    // 3. FONT RESOLUTION  (verbatim from the Ep03 builder)
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
                for (j = 0; j < excludeSuffix.length; j++) if (suf.indexOf(excludeSuffix[j]) !== -1) { ok = false; break; }
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

    log("TOLD STRAIGHT — Ep02 + Ep03 covers, fitted-title rebuild");
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
    // 4. DOCUMENT + ARTBOARDS
    // ==============================================================

    var doc = app.documents.add(DocumentColorSpace.RGB, EP, EP);
    try { doc.rulerUnits = RulerUnits.Points; } catch (e) {}

    var BOARDS = [];
    var cursorX = 0;
    function addBoard(name, size) {
        var left = cursorX, top = size / 2;
        var rect = [left, top, left + size, top - size];
        var ab;
        if (BOARDS.length === 0) {
            ab = doc.artboards[0];
            try { ab.artboardRect = rect; } catch (e) { log("WARN: artboard " + name + " — " + e); }
        } else {
            try { ab = doc.artboards.add(rect); } catch (e2) { log("WARN: artboard " + name + " — " + e2); ab = null; }
        }
        if (ab) { try { ab.name = name; } catch (e3) {} }
        var b = { name: name, size: size, x: left, y: top };
        BOARDS.push(b); cursorX += size + GUTTER; return b;
    }

    var boardRefs = [];
    for (var ci = 0; ci < COVERS.length; ci++) boardRefs.push(addBoard(COVERS[ci].board, EP));
    var bAudit = addBoard("AUDIT", EP);

    function layer(name) {
        var l; try { l = doc.layers.getByName(name); } catch (e) { l = doc.layers.add(); l.name = name; } return l;
    }
    var lyPaper = layer("PAPER");
    var lyArt   = layer("ART");
    var lyRules = layer("RULES");
    var lyType  = layer("TYPE");
    try { lyPaper.zOrder(ZOrderMethod.SENDTOBACK); } catch (e) {}
    try { lyType.zOrder(ZOrderMethod.BRINGTOFRONT); } catch (e) {}


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
        cHead:   paraStyle("C/Head",     30,  40, 140, C.ink,  fMono,  L),
        cHeadR:  paraStyle("C/HeadR",    30,  40, 140, C.grey, fMono,  R),
        cSub:    paraStyle("C/Sub",      40,  56, 300, C.ink,  fMono,  CTR),
        cFieldK: paraStyle("C/FieldK",   32,  44, 140, C.grey, fMono,  L),
        cFieldV: paraStyle("C/FieldV",   32,  44,  60, C.ink,  fMono,  L),
        cStamp:  paraStyle("C/Stamp",    82,  88,  40, C.red,  fTitle, CTR),
        cFoot1:  paraStyle("C/Foot1",    24,  32, 140, C.grey, fMono,  L),
        cFoot2:  paraStyle("C/Foot2",    28,  38, 140, C.ink,  fMono,  L),
        audit:   paraStyle("AUDIT/Text", 19,  27,   0, C.ink,  fMono,  L)
    };


    // ==============================================================
    // 6. DRAWING HELPERS — board-local, y down from the top
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
    function area(b, y, x, w, h, content, style) {
        var box = lyType.pathItems.rectangle(py(b, y), px(b, x), w, h);
        var tf;
        try { tf = lyType.textFrames.areaText(box); } catch (e) { log("WARN: area — " + e); return null; }
        tf.contents = content;
        try { style.applyTo(tf.textRange, true); } catch (e2) {}
        return tf;
    }


    // ==============================================================
    // 7. THE TITLE FITTER — the whole point of this rebuild
    // ==============================================================
    //
    // ExtendScript has no "measure this string" call. The only honest way to
    // get a rendered width is to BUILD a point-text frame, force a redraw, read
    // its bounds, and throw it away. Skip the redraw and Illustrator hands back
    // stale bounds from before the font was applied — the frame reports the
    // width it had at 12pt Myriad, the fit computes garbage, and the title
    // overruns anyway. The redraw is load-bearing, not defensive.

    function measure(text, font, sizePt, tracking) {
        var tf = null, w = 0, h = 0;
        try {
            tf = lyType.textFrames.add();
            tf.contents = text;
            var ca = tf.textRange.characterAttributes;
            ca.autoLeading = false;
            ca.size = sizePt;
            ca.leading = sizePt;
            ca.tracking = tracking;
            if (font) ca.textFont = font;
            try { app.redraw(); } catch (eR) {}
            w = tf.width; h = tf.height;
        } catch (e) {
            log("WARN: measure('" + text + "') — " + e);
        } finally {
            try { if (tf) tf.remove(); } catch (e2) {}
        }
        return { w: w, h: h };
    }

    // Choose ONE shared size for the whole stack. Two constraints:
    //   height — lineCount lines must fit between zoneTop and zoneBottom
    //   width  — the WIDEST line must fit inside colW
    // The tighter constraint wins. A shared size is the typographically correct
    // answer for a stacked title: per-line sizing would make the block look
    // like a ransom note.
    function fitTitle(b, lines, zoneTop, zoneBottom, colW, maxPt, font, tracking) {
        var n = lines.length;
        if (!n) return { size: 0, lead: 0, fitBy: "empty", lines: [] };

        var zoneH = zoneBottom - zoneTop;
        var lead  = zoneH / n;
        var size  = Math.min(maxPt, lead * 0.90);   // cap height ≈ 0.72em; 0.90 keeps the stack tight but unclipped
        var fitBy = (size === maxPt) ? "max cap" : "zone height";

        // Width pass. Probe at the height-derived size, then scale down to the
        // tightest line. Never scale UP — the height constraint is a ceiling.
        var probe = size, worst = 1, i, m, s;
        for (i = 0; i < n; i++) {
            m = measure(lines[i], font, probe, tracking);
            if (m.w > 0) {
                s = colW / m.w;
                if (s < worst) worst = s;
            }
        }
        if (worst < 1) {
            size = size * worst;
            lead = size / 0.90;
            fitBy = "line width";
        }

        // Re-measure at the final size so the block is centred on real bounds,
        // not on an estimate of them.
        var meas = [], maxH = 0;
        for (i = 0; i < n; i++) {
            m = measure(lines[i], font, size, tracking);
            meas.push(m);
            if (m.h > maxH) maxH = m.h;
        }

        // Block height = the leading steps between lines, plus the cap height of
        // the last line. Centre THAT in the zone.
        var blockH = (n - 1) * lead + maxH;
        var top    = zoneTop + (zoneH - blockH) / 2;

        var placed = [];
        for (i = 0; i < n; i++) {
            var tf = null;
            try {
                tf = lyType.textFrames.add();
                tf.contents = lines[i];
                var ca = tf.textRange.characterAttributes;
                ca.autoLeading = false;
                ca.size = size; ca.leading = size; ca.tracking = tracking;
                ca.fillColor = C.ink;
                if (font) ca.textFont = font;
                try { app.redraw(); } catch (eR2) {}
                // Point text anchors at its baseline, so centre on measured bounds.
                tf.left = px(b, (EP - tf.width) / 2);
                tf.top  = py(b, top + i * lead);
                placed.push({ text: lines[i], w: tf.width, h: tf.height });
            } catch (e) {
                log("WARN: title line '" + lines[i] + "' — " + e);
            }
        }

        return {
            size: size, lead: lead, fitBy: fitBy, blockH: blockH,
            top: top, bottom: top + blockH, lines: placed
        };
    }


    // One line of point text positioned by BASELINE rather than by box top, so a
    // value that had to shrink still sits on the same baseline as its key.
    // tf.height on all-caps text is the cap height, which is exactly the offset
    // we need — no font-metrics guesswork.
    function baselineText(b, baselineY, x, text, size, colour, font, tracking) {
        var tf = null;
        try {
            tf = lyType.textFrames.add();
            tf.contents = text;
            var ca = tf.textRange.characterAttributes;
            ca.autoLeading = false;
            ca.size = size; ca.leading = size; ca.tracking = tracking;
            if (colour) ca.fillColor = colour;
            if (font) ca.textFont = font;
            try { app.redraw(); } catch (eR) {}
            tf.left = px(b, x);
            tf.top  = py(b, baselineY - tf.height);
        } catch (e) { log("WARN: line '" + text + "' — " + e); return null; }
        return tf;
    }

    // Field values are fitted the same way titles are: measure, shrink to the
    // column, never clip. The old builder set values as AREA text, which silently
    // swallows anything too long — so a value running under the stamp looked
    // fine to the script and unreadable in the PNG.
    function fitValue(b, baselineY, x, maxW, text, maxPt) {
        var size = maxPt;
        var m = measure(text, fMono, size, 60);
        if (m.w > maxW && m.w > 0) size = Math.max(19, size * (maxW / m.w));
        baselineText(b, baselineY, x, text, size, C.ink, fMono, 60);
        return { size: size, wanted: m.w, avail: maxW };
    }


    // ==============================================================
    // 8. COVERS
    // ==============================================================

    var fits = [];
    var valueNotes = [];

    function buildCover(b, spec) {
        var W = EP - M * 2;
        paper(b);
        keyline(b, 44, 7);

        // header
        area(b, M + 14, M + 24, W - 48, 44, spec.formNo,    PS.cHead);
        area(b, M + 14, M + 24, W - 48, 44, spec.authority, PS.cHeadR);
        bar(b, M + 74, M + 24, W - 48, 3, C.ink);

        // TITLE — fitted, never placed
        var fit = fitTitle(b, spec.title, TITLE_TOP, TITLE_BOTTOM, TITLE_COL,
                           TITLE_MAX_PT, fTitle, -16);
        fit.board = b.name;
        fits.push(fit);

        // The rule the old builder collided with. Assert the clearance rather
        // than trusting it: if the fitter ever regresses, the audit board says so
        // in numbers instead of the defect shipping silently in a PNG.
        if (fit.bottom > RED_RULE_Y) {
            log("  ** " + b.name + ": TITLE OVERRUNS THE RED RULE by "
                + Math.round(fit.bottom - RED_RULE_Y) + "pt **");
        }
        bar(b, RED_RULE_Y, M + 20, W - 40, 9, C.red);

        area(b, 900, M, W, 70, spec.subtitle, PS.cSub);

        // The stamp's geometry is resolved BEFORE the fields are drawn, because
        // the fields have to know where it lands. The Ep03 original placed a
        // stamp at a fixed x and got away with it only because its values were
        // short ("RESULTS IN"). "YOUNG SCHEMA QUESTIONNAIRE" runs straight under
        // it — and the word we spelled out on purpose is the one that disappears.
        // FIRST ATTEMPT AT THIS WAS WRONG AND THE RE-RUN PROVED IT. Shrinking
        // the values to squeeze past a stamp sitting in the middle of the field
        // block left a ~220pt column, so "YOUNG SCHEMA QUESTIONNAIRE" hit the
        // 19pt floor and STILL ran under the stamp -- illegible AND obscured.
        // The conflict is spatial, not typographic: a 700pt stamp and a 500pt
        // value cannot share a 980pt row, and a size floor just turns an
        // impossible constraint into a quiet failure.
        //
        // So the stamp moves OUT of the field block, into the empty band between
        // the last rule and the footer. Values keep their full column at full
        // size. The fitter below stays as a backstop and now simply never fires.
        var STAMP_PT = 72, STAMP_H = 118, STAMP_ROT = -7;
        var sm = measure(spec.stamp, fTitle, STAMP_PT, 40);
        var sw = Math.max(380, sm.w + 70);

        var valueX = M + 400, valueFullW = W - 430, STAMP_GUTTER = 44;

        var fy = 1060;
        // Field block runs from 1060 in 96pt steps, its last hairline at +60.
        var fieldsEnd = 1060 + spec.fields.length * 96 - 96 + 60;
        // Baselines sit 34pt below each row's top; this is the lowest word on
        // the card above the footer, and the thing the stamp must clear.
        var lastBaseline = 1060 + (spec.fields.length - 1) * 96 + 34;
        // Position the stamp from the CLEARANCE it must keep, not from a fixed
        // offset. A wider stamp swings further when rotated, so a constant y
        // gives "RESULTS ENCLOSED" 9pt of air where "IN SESSION" gets 22 --
        // which is how the long one ends up touching a word again.
        var STAMP_CLEAR = 24;
        var stampSwing = (sw / 2) * Math.abs(Math.sin(STAMP_ROT * Math.PI / 180));
        var sy = lastBaseline + STAMP_CLEAR + stampSwing;
        // EP-120 rather than EP-96: rotating the group swings its corners
        // outward, so a box whose right edge sits inside the keyline can still
        // print across it. The margin has to pay for the rotation.
        var sx = EP - 120 - sw;
        for (var i = 0; i < spec.fields.length; i++) {
            baselineText(b, fy + 34, M + 30, spec.fields[i].k, 32, C.grey, fMono, 140);

            // Only rows that actually sit beside the stamp get the narrow column.
            // Shrinking every value to the worst case would punish the rows that
            // have the full width to themselves.
            var collides = (fy + 48 > sy) && (fy < sy + STAMP_H);
            var avail = collides ? (sx - STAMP_GUTTER - valueX) : valueFullW;
            var vr = fitValue(b, fy + 34, valueX, avail, spec.fields[i].v, 32);
            if (vr.size < 32) {
                valueNotes.push("  " + b.name + "  " + spec.fields[i].k + " "
                    + Math.round(vr.size) + "pt (wanted " + Math.round(vr.wanted)
                    + "pt, column " + Math.round(vr.avail) + "pt — beside the stamp)");
            }

            bar(b, fy + 60, M + 30, W - 60, 1, C.hairline);
            fy += 96;
        }

        // Stamp — red keyline box, rotated. Sized to its text so a long stamp
        // ("RESULTS ENCLOSED") does not burst a box drawn for a short one.
        try {
            var sh = STAMP_H;
            var box = lyType.pathItems.rectangle(py(b, sy), px(b, sx), sw, sh);
            box.filled = false; box.stroked = true; box.strokeColor = C.red; box.strokeWidth = 8;

            var st = lyType.textFrames.add();
            st.contents = spec.stamp;
            var sca = st.textRange.characterAttributes;
            sca.autoLeading = false;
            // Size the TEXT at the same point size the BOX was measured from.
            // These had drifted apart -- the box was measured at STAMP_PT while
            // the text was set from a style pinned at 82pt, so the box no longer
            // fitted its own contents.
            sca.size = STAMP_PT; sca.leading = STAMP_PT; sca.tracking = 40;
            sca.fillColor = C.red;
            if (fTitle) sca.textFont = fTitle;
            try { app.redraw(); } catch (eR3) {}
            try {
                st.left = px(b, sx + (sw - st.width) / 2);
                st.top  = py(b, sy + (sh - st.height) / 2);
            } catch (e) {}

            var g = lyType.groupItems.add();
            box.moveToBeginning(g); st.moveToBeginning(g);
            g.rotate(STAMP_ROT);

            // Rotation swings the corners out; report the real occupied band so a
            // collision shows up as a number here rather than as a covered word
            // in the PNG.
            var swing = stampSwing;
            log("  " + b.name + " stamp: x " + Math.round(sx) + "-" + Math.round(sx + sw)
                + "  y " + Math.round(sy - swing) + "-" + Math.round(sy + sh + swing)
                + "   last value baseline at " + Math.round(lastBaseline)
                + "   bottom keyline at " + (EP - 44));
            // Test against the last VALUE's baseline, not the hairline beneath
            // it. The stamp is meant to sit across the rules -- that is the
            // rubber-stamp look. What it must never touch is a word.
            if (sy - swing < lastBaseline) {
                log("    ** stamp reaches the last value's baseline — a value may be covered **");
            }
            if (sy + sh + swing > EP - 44) {
                log("    ** stamp crosses the bottom keyline **");
            }
        } catch (eStamp) { log("WARN: " + b.name + " stamp — " + eStamp); }

        area(b, EP - M - 66, M + 30, 700, 34, spec.foot1, PS.cFoot1);
        area(b, EP - M - 30, M + 30, 700, 40, spec.foot2, PS.cFoot2);
    }

    for (var bi = 0; bi < COVERS.length; bi++) buildCover(boardRefs[bi], COVERS[bi]);


    // ==============================================================
    // 9. AUDIT BOARD
    // ==============================================================

    log("");
    log("TITLE FIT RESULTS");
    for (var ti = 0; ti < fits.length; ti++) {
        var f = fits[ti];
        log("  " + f.board + "  " + f.lines.length + " lines");
        log("    size " + Math.round(f.size) + "pt  lead " + Math.round(f.lead)
            + "pt   constrained by: " + f.fitBy);
        log("    block y " + Math.round(f.top) + " -> " + Math.round(f.bottom)
            + "   red rule at " + RED_RULE_Y
            + "   clearance " + Math.round(RED_RULE_Y - f.bottom) + "pt");
        for (var li = 0; li < f.lines.length; li++) {
            log("      " + f.lines[li].text + "   " + Math.round(f.lines[li].w)
                + "pt wide  (column " + TITLE_COL + ")");
        }
    }
    log("");
    log("FIELD VALUES SHRUNK TO CLEAR THE STAMP");
    if (valueNotes.length) {
        for (var vn = 0; vn < valueNotes.length; vn++) log(valueNotes[vn]);
    } else {
        log("  none — every value had its full column");
    }
    log("");
    log("WHY THIS BUILDER EXISTS");
    log("  Ep02 never had a builder — its cover predates the 2026-07-27 type lock.");
    log("  The Ep03 builder hard-coded a 215pt title at y=330/560 against a red");
    log("  rule at y=820, which fits SESSION/TWO and nothing else. Titles here");
    log("  are fitted to the zone, so line count and word length cannot collide");
    log("  with the rule.");

    (function buildAudit() {
        var b = bAudit;
        paper(b);
        keyline(b, 44, 5);
        area(b, 96, 120, EP - 240, EP - 220, report.join("\n"), PS.audit);
    })();


    // ==============================================================
    // 10. OPTIONAL EXPORT — descriptive filenames, never a hash.
    //     output/ is gitignored: the maintainer promotes into episodes/.
    // ==============================================================

    var exportNote = "";
    if (EXPORT_PNG) {
        try {
            var dir = new Folder(EXPORT_DIR);
            if (!dir.exists) dir.create();
            var opts = new ExportOptionsPNG24();
            opts.artBoardClipping = true; opts.transparency = false;
            opts.horizontalScale = 100; opts.verticalScale = 100;
            for (var e5 = 0; e5 < COVERS.length; e5++) {
                doc.artboards.setActiveArtboardIndex(e5);
                doc.exportFile(new File(dir.fsName + "/" + COVERS[e5].pngName + ".png"),
                               ExportType.PNG24, opts);
            }
            exportNote = "\n" + COVERS.length + " PNGs written to " + EXPORT_DIR + "\n";
        } catch (e6) { exportNote = "\nPNG export failed: " + e6 + "\n"; }
    }

    var clearLines = [];
    for (var si = 0; si < fits.length; si++) {
        clearLines.push("  " + fits[si].board + ": " + Math.round(fits[si].size)
            + "pt, " + Math.round(RED_RULE_Y - fits[si].bottom) + "pt clear of the red rule");
    }

    var summary = "Told Straight — Ep02 + Ep03 covers rebuilt.\n\n"
        + "Artboards: " + doc.artboards.length + "\n"
        + "  1  ep02-cover  ADDITIONAL / TRAINING / REQUIRED\n"
        + "  2  ep03-cover  YOUR / RESULTS / MAY VARY\n"
        + "  3  AUDIT\n\n"
        + "TITLE FIT (the reason for this rebuild):\n"
        + clearLines.join("\n") + "\n\n"
        + "Title face : " + (psTitle || "DEFAULT") + "\n"
        + "Label face : " + (psLabel || "DEFAULT") + "\n"
        + "Mono face  : " + (psMono  || "DEFAULT") + "\n\n"
        + (faceWarnings === 0
            ? "All three faces resolved at their intended weight.\n\n"
            : faceWarnings + " face(s) resolved with a compromise — see the audit board.\n\n")
        + "The authority line on Ep02 is still open — DEPT. OF PLAIN TRUTH ships\n"
        + "by default; the NEURODEVELOPMENTAL AFFAIRS variant is commented at the\n"
        + "top of section 1.\n"
        + exportNote + "\n"
        + "Nothing here writes into episodes/ — that path is gated.";

    alert(summary);

})();
