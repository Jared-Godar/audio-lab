/**
 * Told Straight — Ep03 cover + Anna clinician cast card  (ILLUSTRATOR)
 * ==================================================================
 * TWO artboards, both 1600 x 1600, siblings of the Ep02 set (the
 * binding reference):
 *
 *   1  EP03 COVER — "results report / scored answer sheet"
 *      The Ep02 intake-form cover evolved one notch: SESSION TWO,
 *      "the results are in", the answer-sheet fields, a red SCORED
 *      stamp where Ep02 stamped IN SESSION.
 *
 *   2  CAST CARD — Dr. Anna Sinclair, clinician (Ep03)
 *      The Ep02 brutalist personnel-file card. NOT REAL stamp. Copy
 *      from CARD 005 of the trading-cards file — role line and the
 *      license number NOT-A-REAL-1 are canon.
 *
 * WORKFLOW (audio-lab, pinned 2026-07-29). The agent AUTHORS this
 * builder; the MAINTAINER runs it manually in Illustrator, where the
 * licensed faces are activated via Adobe Fonts. The agent never renders
 * these PNGs itself (no licensed condensed face off this machine;
 * embedding outlines in a tracked SVG on a public repo is a license
 * breach). Export to PNG24 here, hand the PNGs back, an executor commits
 * cover.png and cast/clinician_anna_sinclair.png to episodes/.
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
            + "This is an ILLUSTRATOR script (Told Straight Ep03 cover + cast card).\n"
            + "You are running it in: " + thisApp + "\n\n"
            + "Open Adobe Illustrator and run it from File > Scripts > Other Script...\n\n"
            + "Nothing was created or changed.");
        return;
    }

    // ==============================================================
    // 0a. THE ANNA PORTRAIT — the colour cartoon is the STANDARD
    // ==============================================================
    //
    // Maintainer decision, 2026-07-29: the colour cartoon portrait is
    // the cast-card image going forward AND retroactively — it replaces
    // the brutalist silhouette Ep02 used. So this DEFAULTS to placing
    // the committed illustrated portrait:
    //   episodes/cast/portraits/20260729-gemini-nano-banana-2-anna-
    //     sinclair-ep03-clinician-cast-portrait-1x1.png
    // Set PLACE_PORTRAIT = false only to fall back to the silhouette if
    // the portrait file is missing at run time (the code also falls back
    // automatically and says so in the audit).
    var PLACE_PORTRAIT = true;
    var PORTRAIT_PATH   = "~/Code/audio-lab/episodes/cast/portraits/"
        + "20260729-gemini-nano-banana-2-anna-sinclair-ep03-clinician-cast-portrait-1x1.png";

    // ==============================================================
    // 0b. FACES — pinned from the Ep01/Ep02 system, 2026-07-27
    // ==============================================================

    var FACE = {
        title: "TradeGothicNextLTPro-BdCn",
        label: null,
        mono:  "LetterGothicStd"
    };

    var SEARCH = {
        title: [
            { require: ["tradegothicnext"], exclude: ["italic", "oblique"],
              prefer: ["bdcn", "boldcond", "condbold", "hvcn", "condheavy", "bd", "bold"] },
            { require: ["universnextpro", "cond"], exclude: ["italic", "oblique"],
              prefer: ["boldcond", "condbold", "heavycond", "blackcond"] },
            { require: ["helveticaneueltpro"], exclude: ["italic", "oblique", "obl"],
              prefer: ["bdcn", "blkcn"] }
        ],
        label: [
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
            { require: ["ibmplexmono"],   exclude: ["italic", "oblique"], prefer: ["regular", "text"] },
            { require: ["sourcecodepro"], exclude: ["italic", "oblique"], prefer: ["regular"] },
            { require: ["courier"],       exclude: ["italic", "oblique"], prefer: ["regular", "psmt"] }
        ]
    };

    var EXPORT_PNG = true;   // re-run writes cover.png + clinician_anna_sinclair.png for commit
    var EXPORT_DIR = "~/Code/audio-lab/output/artwork/ep03";

    // ==============================================================
    // 1. CONTENT
    // ==============================================================

    // --- COVER (spec §3.2): results-report / scored answer sheet ---
    var COVER = {
        formNo:    "FORM TS-03",
        authority: "DEPT. OF PLAIN TRUTH",
        title1:    "SESSION",
        title2:    "TWO",
        subtitle:  "THE RESULTS ARE IN",
        fields: [
            { k: "PATIENT:", v: "[ YOU ]" },
            { k: "STATUS:",  v: "RESULTS IN" },
            { k: "SHEET:",   v: "232 ITEMS, SCORED" }
        ],
        stamp: "SCORED",
        foot1: "PODCAST",
        foot2: "TOLD STRAIGHT / EP.03"
    };

    // --- CAST CARD (spec §3.5): CARD 005, Dr. Anna Sinclair ---------
    // Copy is card canon: the role line and the license number
    // NOT-A-REAL-1 come straight from the trading-cards file. The
    // FILE NOTES carry her heightened, in-voice disclosure obligation —
    // descriptive/functional, no episode punchlines.
    var CARD = {
        header:  "PERSONNEL FILE",
        headerR: "TOLD STRAIGHT / CAST",
        boxLabel: "TS-C03",
        boxCaption: "SYNTHETIC LIKENESS — NOT REAL",
        name:   "DR. ANNA SINCLAIR",
        role:   "CLINICIAN / EP.03",
        stamp:  "NOT REAL",
        fields: [
            { k: "VOICE",     v: "Emma (synthetic)" },
            { k: "ACCENT",    v: "Australian" },
            { k: "LICENSE",   v: "NOT-A-REAL-1" },
            { k: "STATUS",    v: "SYNTHETIC / ACTIVE" },
            { k: "FILE NO.",  v: "TS-C03" }
        ],
        notesLabel: "FILE NOTES",
        notes:
            "A composite of every good clinician you wish you'd had. License "
          + "number NOT-A-REAL-1. She walks a real person through his real "
          + "results — warmly, plainly, and without diagnosing anyone. She says "
          + "so herself, in her own voice, before she touches the results: she "
          + "is not real, this is orientation and not diagnosis, and Jared is "
          + "seeing his actual, human doctor. The disclosure is the point of "
          + "the card, not a footnote to it.",
        foot: "TOLD STRAIGHT"
    };

    // ==============================================================
    // 2. GEOMETRY + PALETTE  (measured from the v1 PNGs, 2026-07-27)
    // ==============================================================

    var EP     = 1600;
    var GUTTER = 220;
    var M      = 96;

    var PALETTE = {
        paper:    [237, 233, 224],   // #EDE9E0
        ink:      [ 17,  17,  17],   // #111111
        red:      [176,  42,  40],   // #B02A28
        grey:     [120, 116, 108],   // #78746C
        hairline: [200, 196, 186]    // #C8C4BA
    };
    var GHOST = [222, 218, 209];     // portrait ground — a notch off paper

    var report = [];
    function log(s) { report.push(s); }
    function rgb(t) { var c = new RGBColor(); c.red=t[0]; c.green=t[1]; c.blue=t[2]; return c; }
    var C = {
        paper: rgb(PALETTE.paper), ink: rgb(PALETTE.ink), red: rgb(PALETTE.red),
        grey: rgb(PALETTE.grey), hairline: rgb(PALETTE.hairline), ghost: rgb(GHOST)
    };

    // ==============================================================
    // 3. FONT RESOLUTION
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

    log("TOLD STRAIGHT — Ep03 cover + Anna cast card");
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

    var bCover = addBoard("ep03-cover", EP);
    var bCast  = addBoard("ep03-cast-anna-sinclair", EP);
    var bAudit = addBoard("AUDIT", EP);

    function layer(name) {
        var l; try { l = doc.layers.getByName(name); } catch (e) { l = doc.layers.add(); l.name = name; } return l;
    }
    // Create bottom-to-top so TYPE ends on top: the placed Anna portrait lives on
    // ART; the NOT REAL stamp + caption text live on TYPE and must sit ABOVE the
    // opaque portrait or they render behind it (the 2026-07-30 z-order bug).
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
        // cover
        cHead:   paraStyle("C/Head",     30,  40, 140, C.ink,  fMono,  L),
        cHeadR:  paraStyle("C/HeadR",    30,  40, 140, C.grey, fMono,  R),
        cBig:    paraStyle("C/Big",     215, 205, -16, C.ink,  fTitle, CTR),
        cSub:    paraStyle("C/Sub",      40,  56, 300, C.ink,  fMono,  CTR),
        cFieldK: paraStyle("C/FieldK",   32,  44, 140, C.grey, fMono,  L),
        cFieldV: paraStyle("C/FieldV",   32,  44,  60, C.ink,  fMono,  L),
        cStamp:  paraStyle("C/Stamp",    96, 100,  40, C.red,  fTitle, CTR),
        cFoot1:  paraStyle("C/Foot1",    24,  32, 140, C.grey, fMono,  L),
        cFoot2:  paraStyle("C/Foot2",    28,  38, 140, C.ink,  fMono,  L),
        // cast card
        kHead:   paraStyle("K/Head",     30,  40, 160, C.ink,  fMono,  L),
        kHeadR:  paraStyle("K/HeadR",    30,  40, 160, C.grey, fMono,  R),
        kBoxLbl: paraStyle("K/BoxLabel", 26,  34,  80, C.ink,  fMono,  L),
        kBoxCap: paraStyle("K/BoxCap",   22,  28,  40, C.paper,fMono,  L),
        kName:   paraStyle("K/Name",     88,  84, -6,  C.ink,  fTitle, L),  // fits "DR. ANNA SINCLAIR" on one line
        kRole:   paraStyle("K/Role",     40,  50, 120, C.red,  fMono,  L),
        kFieldK: paraStyle("K/FieldK",   24,  50, 120, C.grey, fMono,  L),
        kFieldV: paraStyle("K/FieldV",   34,  50,  20, C.ink,  fMono,  L),
        kStamp:  paraStyle("K/Stamp",    72,  76,  40, C.red,  fTitle, CTR),
        kNotesL: paraStyle("K/NotesL",   26,  34, 120, C.grey, fMono,  L),
        kNotes:  paraStyle("K/Notes",    38,  54,   0, C.ink,  fLabel || fMono, L),
        kFoot:   paraStyle("K/Foot",     24,  32, 160, C.grey, fMono,  L),
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
    function fillRect(b, y, x, w, h, colour, layerObj) {
        var lyr = layerObj || lyArt;
        var r = lyr.pathItems.rectangle(py(b, y), px(b, x), w, h);
        r.filled = true; r.fillColor = colour; r.stroked = false; return r;
    }
    function strokeRect(b, y, x, w, h, colour, weight, layerObj) {
        var lyr = layerObj || lyRules;
        var r = lyr.pathItems.rectangle(py(b, y), px(b, x), w, h);
        r.filled = false; r.stroked = true; r.strokeColor = colour; r.strokeWidth = weight; return r;
    }
    function ellipse(b, y, x, w, h, colour) {
        var r = lyArt.pathItems.ellipse(py(b, y), px(b, x), w, h);
        r.filled = true; r.fillColor = colour; r.stroked = false; return r;
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
    // 7. COVER — results report / scored answer sheet
    // ==============================================================

    (function buildCover() {
        var b = bCover, W = EP - M * 2;
        paper(b);
        keyline(b, 44, 7);

        area(b, M + 14, M + 24, W - 48, 44, COVER.formNo,    PS.cHead);
        area(b, M + 14, M + 24, W - 48, 44, COVER.authority, PS.cHeadR);
        bar(b, M + 74, M + 24, W - 48, 3, C.ink);

        var TW = EP - 120;
        area(b, 330, 60, TW, 240, COVER.title1, PS.cBig);   // SESSION
        area(b, 560, 60, TW, 240, COVER.title2, PS.cBig);   // TWO
        bar(b, 820, M + 20, W - 40, 9, C.red);

        area(b, 900, M, W, 70, COVER.subtitle, PS.cSub);

        var fy = 1060;
        for (var i = 0; i < COVER.fields.length; i++) {
            area(b, fy, M + 30, 340, 48, COVER.fields[i].k, PS.cFieldK);
            area(b, fy, M + 400, W - 430, 48, COVER.fields[i].v, PS.cFieldV);
            bar(b, fy + 60, M + 30, W - 60, 1, C.hairline);
            fy += 96;
        }

        // SCORED stamp — red keyline box, rotated, red type.
        try {
            var sx = EP - 560, sy = 1150, sw = 400, sh = 150;
            var box = lyType.pathItems.rectangle(py(b, sy), px(b, sx), sw, sh);
            box.filled = false; box.stroked = true; box.strokeColor = C.red; box.strokeWidth = 8;
            var st = lyType.textFrames.add();
            st.contents = COVER.stamp;
            try { PS.cStamp.applyTo(st.textRange, true); } catch (e) {}
            try { st.left = px(b, sx + 40); st.top = py(b, sy + 32); } catch (e) {}
            var g = lyType.groupItems.add();
            box.moveToBeginning(g); st.moveToBeginning(g);
            g.rotate(-9);
        } catch (eStamp) { log("WARN: cover stamp — " + eStamp); }

        area(b, EP - M - 66, M + 30, 700, 34, COVER.foot1, PS.cFoot1);
        area(b, EP - M - 30, M + 30, 700, 40, COVER.foot2, PS.cFoot2);
    })();

    // ==============================================================
    // 8. CAST CARD — Anna Sinclair, clinician
    // ==============================================================

    (function buildCast() {
        var b = bCast, W = EP - M * 2;
        paper(b);
        keyline(b, 44, 7);

        // header
        area(b, M + 6, M + 20, W - 40, 44, CARD.header,  PS.kHead);
        area(b, M + 6, M + 20, W - 40, 44, CARD.headerR, PS.kHeadR);
        bar(b, M + 62, M + 20, W - 40, 3, C.ink);

        // portrait box (left column)
        var bx = M + 20, by = 230, bw = 560, bh = 690;
        fillRect(b, by, bx, bw, bh, C.ghost);            // ground
        strokeRect(b, by, bx, bw, bh, C.ink, 3);         // frame
        area(b, by + 16, bx + 18, 200, 34, CARD.boxLabel, PS.kBoxLbl);

        if (PLACE_PORTRAIT) {
            // Place the committed illustrated portrait, fit to the box.
            try {
                var pf = new File(PORTRAIT_PATH);
                if (pf.exists) {
                    var placed = lyArt.placedItems.add();
                    placed.file = pf;
                    // fit square portrait into the box, top-aligned
                    var scale = (bw / placed.width) * 100;
                    placed.width  = placed.width  * scale / 100;
                    placed.height = placed.height * scale / 100;
                    placed.left = px(b, bx);
                    placed.top  = py(b, by);
                    log("  Anna portrait PLACED from " + PORTRAIT_PATH);
                } else {
                    log("  PORTRAIT NOT FOUND at " + PORTRAIT_PATH + " — drew silhouette");
                    drawSilhouette(b, bx, by, bw, bh);
                }
            } catch (ePl) { log("  portrait place failed (" + ePl + ") — drew silhouette"); drawSilhouette(b, bx, by, bw, bh); }
        } else {
            drawSilhouette(b, bx, by, bw, bh);
        }

        // caption bar at the foot of the box (black bar, paper text)
        var capH = 52;
        fillRect(b, by + bh - capH, bx, bw, capH, C.ink);
        area(b, by + bh - capH + 14, bx + 18, bw - 36, 34, CARD.boxCaption, PS.kBoxCap);

        // NOT REAL stamp, rotated over the box
        try {
            var sx = bx + 80, sy = by + bh - 250, sw = 400, sh = 120;
            var sbox = lyType.pathItems.rectangle(py(b, sy), px(b, sx), sw, sh);
            sbox.filled = false; sbox.stroked = true; sbox.strokeColor = C.red; sbox.strokeWidth = 7;
            var stf = lyType.textFrames.add();
            stf.contents = CARD.stamp;
            try { PS.kStamp.applyTo(stf.textRange, true); } catch (e) {}
            try { stf.left = px(b, sx + 46); stf.top = py(b, sy + 24); } catch (e) {}
            var g = lyType.groupItems.add();
            sbox.moveToBeginning(g); stf.moveToBeginning(g);
            g.rotate(-11);
        } catch (eStamp) { log("WARN: cast stamp — " + eStamp); }

        // right column
        var rx = bx + bw + 60, rw = EP - M - 20 - rx;
        area(b, 250, rx, rw, 140, CARD.name, PS.kName);
        area(b, 372, rx, rw, 56,  CARD.role, PS.kRole);

        var fy = 470;
        for (var i = 0; i < CARD.fields.length; i++) {
            area(b, fy, rx, rw, 34, CARD.fields[i].k, PS.kFieldK);
            area(b, fy + 34, rx, rw, 44, CARD.fields[i].v, PS.kFieldV);
            fy += 92;
        }

        // divider + FILE NOTES
        bar(b, 990, M + 20, W - 40, 2, C.ink);
        area(b, 1010, M + 20, W - 40, 36, CARD.notesLabel, PS.kNotesL);
        area(b, 1060, M + 20, W - 40, 360, CARD.notes, PS.kNotes);

        area(b, EP - M - 26, M + 20, 700, 34, CARD.foot, PS.kFoot);
    })();

    function drawSilhouette(b, bx, by, bw, bh) {
        // brutalist head-and-shoulders, Ep02 register
        var cx = bx + bw / 2;
        var headD = bw * 0.42;
        ellipse(b, by + bh * 0.20, cx - headD / 2, headD, headD, C.ink);
        var shW = bw * 0.72, shH = bh * 0.42;
        fillRect(b, by + bh * 0.20 + headD * 0.72, cx - shW / 2, shW, shH, C.ink);
    }

    // ==============================================================
    // 9. AUDIT BOARD
    // ==============================================================

    log("TWO ARTBOARDS BUILT");
    log("  1  ep03-cover                 1600  results report / scored answer sheet");
    log("  2  ep03-cast-anna-sinclair    1600  clinician personnel card, NOT REAL");
    log("");
    log("MATCH THE EP02 SET BY EYE AT 100% BEFORE EXPORT");
    log("  cover  -> beside episodes/ToldStraight-Ep02/cover.png");
    log("  card   -> beside episodes/ToldStraight-Ep02/cast/guest_michael_voss.png");
    log("  Divergence from the Ep02 register is a defect, not a variation.");
    log("");
    log("THE ANNA PORTRAIT — colour cartoon is the STANDARD (2026-07-29)");
    log("  DEFAULT: place the committed illustrated portrait. The colour");
    log("  cartoon replaces the Ep02 silhouette going forward AND retro-");
    log("  actively (Ep02 cast art is being re-rendered to match). If the");
    log("  portrait file is missing the code falls back to a silhouette and");
    log("  says so here — that fallback is not the intended look.");
    log("");
    log("CARD COPY IS CANON (CARD 005)");
    log("  Role line 'CLINICIAN / EP.03' and 'LICENSE: NOT-A-REAL-1' are fixed.");
    log("  The FILE NOTES carry Anna's heightened, in-voice disclosure — this is");
    log("  the one card where the disclosure is load-bearing, not a running gag.");
    log("  A LICENSE field was added beside Ep02's VOICE/ACCENT/STATUS/FILE NO.");
    log("  because the license number is explicit card canon; that is the only");
    log("  deliberate divergence from the Ep02 field list.");
    log("");
    log("PALETTE IS MEASURED: paper #EDE9E0 ink #111111 red #B02A28");
    log("  grey #78746C hairline #C8C4BA. Sizes/positions are EYEBALLED.");
    log("");
    log("THE AGENT DID NOT AND CANNOT RENDER THESE — you run this, you export,");
    log("an executor commits your PNGs (cover.png, cast/clinician_anna_sinclair.png).");

    paper(bAudit);
    area(bAudit, M, M, EP - M * 2, EP - M * 2, report.join("\r"), PS.audit);

    try { app.executeMenuCommand("fitall"); } catch (e) {}

    // ==============================================================
    // 10. OPTIONAL PNG EXPORT — descriptive names for a clean commit
    // ==============================================================

    var exportNote = "";
    if (EXPORT_PNG) {
        try {
            var dir = new Folder(EXPORT_DIR);
            if (!dir.exists) dir.create();
            var opts = new ExportOptionsPNG24();
            opts.artBoardClipping = true; opts.transparency = false;
            opts.horizontalScale = 100; opts.verticalScale = 100;
            var names = ["cover", "clinician_anna_sinclair"];
            for (var e5 = 0; e5 < names.length; e5++) {
                doc.artboards.setActiveArtboardIndex(e5);
                doc.exportFile(new File(dir.fsName + "/" + names[e5] + ".png"), ExportType.PNG24, opts);
            }
            exportNote = "\n2 PNGs (cover, clinician_anna_sinclair) written to " + EXPORT_DIR + "\n";
        } catch (e6) { exportNote = "\nPNG export failed: " + e6 + "\n"; }
    }

    var summary = "Told Straight — Ep03 cover + Anna cast card built.\n\n"
        + "Artboards: " + doc.artboards.length + " (cover, cast card, audit).\n\n"
        + "Title face : " + (psTitle || "DEFAULT") + "\n"
        + "Label face : " + (psLabel || "DEFAULT") + "\n"
        + "Mono face  : " + (psMono  || "DEFAULT") + "\n\n"
        + (faceWarnings === 0
            ? "All three faces resolved at their intended weight.\n"
            : faceWarnings + " face(s) resolved with a compromise — see the audit board.\n")
        + "Anna portrait: " + (PLACE_PORTRAIT ? "PLACED (illustrated)" : "SILHOUETTE (Ep02 register)") + "\n"
        + exportNote + "\n"
        + "Match the Ep02 set by eye at 100% before export.\n"
        + "Nothing here replaces anything in episodes/ — that path is gated.";

    alert(summary);

})();
