/**
 * Told Straight — cast personnel cards, portrait standard  (ILLUSTRATOR)
 * ==================================================================
 * Rebuilds cast personnel-file cards with the COLOUR CARTOON PORTRAIT
 * placed in the mugshot frame — the standard set by the maintainer on
 * 2026-07-29, replacing the brutalist silhouette Ep02 shipped with,
 * going forward AND retroactively.
 *
 * SEEDED with the Ep02 retroactive pair. Each card keeps its EXISTING
 * copy verbatim (transcribed from the shipped Ep02 PNGs); only the image
 * changes. Add more cards to CARDS to extend the standard (Ep01 Owen,
 * future episodes) — same four-field personnel-file vocabulary.
 *
 * WORKFLOW (audio-lab). The agent AUTHORS this; the MAINTAINER runs it
 * in Illustrator (licensed faces live there) and exports. The exported
 * PNGs replace the same-named files under episodes/ToldStraight-EpNN/
 * cast/ — a change to shipped, gated episode art, so it lands through a
 * tracked issue/PR, never a silent overwrite.
 *
 * TO RUN:  File > Scripts > Other Script...  and pick this file.
 * IT NEVER TOUCHES AN OPEN DOCUMENT. It always creates a new one.
 */

#target illustrator

(function () {

    var thisApp = "an unknown application";
    try { thisApp = String(app.name); } catch (e) {}
    if (thisApp.indexOf("Illustrator") === -1) {
        alert("WRONG APPLICATION\n\nThis is an ILLUSTRATOR script (Told Straight cast cards).\n"
            + "You are running it in: " + thisApp + "\n\n"
            + "Open Adobe Illustrator and run it from File > Scripts > Other Script...\n\n"
            + "Nothing was created or changed.");
        return;
    }

    // ==============================================================
    // 0. FACES + EXPORT
    // ==============================================================

    var FACE = { title: "TradeGothicNextLTPro-BdCn", label: null, mono: "LetterGothicStd" };
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
              excludeSuffix: ["cn", "cond", "comp", "it", "obl"], prefer: ["bold", "bd", "heavy", "hv"] },
            { require: ["universnextpro"], exclude: ["italic", "oblique"],
              excludeSuffix: ["cond", "comp", "it", "obl"], prefer: ["bold", "bd", "heavy"] },
            { require: ["helveticaneueltpro"], exclude: ["italic", "oblique"],
              excludeSuffix: ["cn", "ex", "it", "obl"], prefer: ["bd", "bold"] }
        ],
        mono: [
            { require: ["lettergothic"],  exclude: ["italic", "oblique"], prefer: ["std", "bold", "medium"] },
            { require: ["oratorstd"],     exclude: ["italic", "oblique"], prefer: ["std", "medium"] },
            { require: ["courierprime"],  exclude: ["italic", "oblique"], prefer: ["regular", "prime"] },
            { require: ["ibmplexmono"],   exclude: ["italic", "oblique"], prefer: ["regular", "text"] },
            { require: ["courier"],       exclude: ["italic", "oblique"], prefer: ["regular", "psmt"] }
        ]
    };

    var EXPORT_PNG = true;   // re-run writes PNGs (names match episodes/…/cast/) for commit
    var EXPORT_DIR = "~/Code/audio-lab/output/artwork/cast-rebuild";
    var PORTRAIT_DIR = "~/Code/audio-lab/episodes/cast/portraits";

    // ==============================================================
    // 1. THE CARDS — copy verbatim from the shipped Ep02 PNGs.
    //    `out` is the target filename under episodes/…/cast/. `portrait`
    //    is the committed colour portrait to place.
    // ==============================================================

    var CARDS = [
        {
            out: "host_des_fable",
            portrait: "20260729-gemini-nano-banana-2-des-fable-ep02-host-cast-portrait-1x1.png",
            boxLabel: "TS-H01",
            name: "DES FABLE",
            role: "HOST",
            fields: [
                { k: "VOICE",    v: "bm_fable (synthetic)" },
                { k: "ACCENT",   v: "British" },
                { k: "STATUS",   v: "SYNTHETIC / ACTIVE" },
                { k: "FILE NO.", v: "TS-H01" }
            ],
            notes:
                "Des has been diagnosed with ADHD in every episode and remembers it in "
              + "none of them. Your fellow club member and guide — he has read none of the "
              + "studies and lived all of the symptoms. Hosts from a chair that may or may "
              + "not exist. Believes his membership card is in a drawer. It is not."
        },
        {
            out: "guest_michael_voss",
            portrait: "20260729-gemini-nano-banana-2-michael-voss-ep02-expert-cast-portrait-1x1.png",
            boxLabel: "TS-G02",
            name: "DR. MICHAEL VOSS",
            role: "EXPERT / EP.02",
            fields: [
                { k: "VOICE",    v: "am_michael (synthetic)" },
                { k: "ACCENT",   v: "American" },
                { k: "STATUS",   v: "SYNTHETIC / ACTIVE" },
                { k: "FILE NO.", v: "TS-G02" }
            ],
            notes:
                "Dr. Voss holds a doctorate in nothing, on account of not existing, but he "
              + "reads meta-analyses the way other people read menus. In our fiction he also "
              + "has ADHD — which is why he lost his keys twice getting to a studio that "
              + "isn't real. Speaks fluent effect size. Will cite you into submission, then "
              + "admit the confidence interval is wide."
        }
    ];

    // ==============================================================
    // 2. GEOMETRY + PALETTE  (measured from the v1 PNGs, 2026-07-27)
    // ==============================================================

    var AB = 1600, GUTTER = 220, M = 96;
    var PALETTE = {
        paper: [237,233,224], ink: [17,17,17], red: [176,42,40],
        grey: [120,116,108], hairline: [200,196,186]
    };
    var GHOST = [222,218,209];

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
    function has(ps) { for (var i=0;i<installed.length;i++) if (installed[i]===ps) return true; return false; }
    function familyMembers(require, exclude, excludeSuffix) {
        var out = [], i, j, nm, suf, cut, ok;
        for (i = 0; i < installed.length; i++) {
            nm = installed[i].toLowerCase(); ok = true;
            for (j = 0; j < require.length; j++) if (nm.indexOf(require[j]) === -1) { ok = false; break; }
            if (ok && exclude) for (j = 0; j < exclude.length; j++) if (nm.indexOf(exclude[j]) !== -1) { ok = false; break; }
            if (ok && excludeSuffix) {
                cut = nm.lastIndexOf("-"); suf = (cut===-1)?"":nm.substring(cut+1);
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
            for (j = 0; j < groups[i].prefer.length; j++) for (k = 0; k < fam.length; k++)
                if (fam[k].toLowerCase().indexOf(groups[i].prefer[j]) !== -1) {
                    log("  " + roleName + ": " + fam[k] + "   (" + groups[i].prefer[j] + ")"); return fam[k];
                }
            faceWarnings++; log("  " + roleName + ": " + fam[0] + "   ** WEIGHT COMPROMISE **"); return fam[0];
        }
        faceWarnings++; log("  " + roleName + ": NOTHING MATCHED — Illustrator default"); return null;
    }
    function fontObj(ps) { if (!ps) return null; try { return app.textFonts.getByName(ps); } catch (e) { return null; } }

    log("TOLD STRAIGHT — cast personnel cards (portrait standard)");
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
    // 4. DOCUMENT + ARTBOARDS (one per card + audit)
    // ==============================================================

    var doc = app.documents.add(DocumentColorSpace.RGB, AB, AB);
    try { doc.rulerUnits = RulerUnits.Points; } catch (e) {}

    var BOARDS = [], cursorX = 0;
    function addBoard(name) {
        var left = cursorX, top = AB / 2, rect = [left, top, left + AB, top - AB], ab;
        if (BOARDS.length === 0) { ab = doc.artboards[0]; try { ab.artboardRect = rect; } catch (e) {} }
        else { try { ab = doc.artboards.add(rect); } catch (e2) { ab = null; } }
        if (ab) try { ab.name = name; } catch (e3) {}
        var b = { name: name, x: left, y: top }; BOARDS.push(b); cursorX += AB + GUTTER; return b;
    }
    var boards = [];
    for (var ci = 0; ci < CARDS.length; ci++) boards.push(addBoard(CARDS[ci].out));
    var bAudit = addBoard("AUDIT");

    function layer(name) { var l; try { l = doc.layers.getByName(name); } catch (e) { l = doc.layers.add(); l.name = name; } return l; }
    // Create bottom-to-top so TYPE ends on top: the placed portrait lives on
    // ART, and the NOT REAL stamp + caption text live on TYPE and must sit ABOVE
    // the opaque portrait, or they render behind it (the 2026-07-30 z-order bug).
    var lyPaper = layer("PAPER"), lyArt = layer("ART"), lyRules = layer("RULES"), lyType = layer("TYPE");
    try { lyPaper.zOrder(ZOrderMethod.SENDTOBACK); } catch (e) {}
    try { lyType.zOrder(ZOrderMethod.BRINGTOFRONT); } catch (e) {}

    // ==============================================================
    // 5. STYLES + HELPERS
    // ==============================================================

    function paraStyle(name, size, leading, tracking, colour, font, justify) {
        var st; try { st = doc.paragraphStyles.getByName(name); } catch (e) { st = doc.paragraphStyles.add(name); }
        try {
            var ca = st.characterAttributes;
            ca.size = size; ca.leading = leading; ca.tracking = tracking; ca.autoLeading = false;
            if (colour) ca.fillColor = colour; if (font) ca.textFont = font;
            if (justify !== undefined) st.paragraphAttributes.justification = justify;
        } catch (e2) { log("WARN: style " + name + " — " + e2); }
        return st;
    }
    var L = Justification.LEFT, R = Justification.RIGHT, CTR = Justification.CENTER;
    var PS = {
        head:   paraStyle("K/Head",     30, 40, 160, C.ink,  fMono,  L),
        headR:  paraStyle("K/HeadR",    30, 40, 160, C.grey, fMono,  R),
        boxLbl: paraStyle("K/BoxLabel", 26, 34,  80, C.ink,  fMono,  L),
        boxCap: paraStyle("K/BoxCap",   22, 28,  40, C.paper,fMono,  L),
        name:   paraStyle("K/Name",     88, 84, -6,  C.ink,  fTitle, L),  // fits "DR. MICHAEL VOSS" on one line
        role:   paraStyle("K/Role",     40, 50, 120, C.red,  fMono,  L),
        fieldK: paraStyle("K/FieldK",   24, 50, 120, C.grey, fMono,  L),
        fieldV: paraStyle("K/FieldV",   34, 50,  20, C.ink,  fMono,  L),
        stamp:  paraStyle("K/Stamp",    72, 76,  40, C.red,  fTitle, CTR),
        notesL: paraStyle("K/NotesL",   26, 34, 120, C.grey, fMono,  L),
        notes:  paraStyle("K/Notes",    38, 54,   0, C.ink,  fLabel || fMono, L),
        foot:   paraStyle("K/Foot",     24, 32, 160, C.grey, fMono,  L),
        audit:  paraStyle("AUDIT/Text", 19, 27,   0, C.ink,  fMono,  L)
    };

    function px(b, x) { return b.x + x; }
    function py(b, y) { return b.y - y; }
    function paper(b) { var r = lyPaper.pathItems.rectangle(py(b,0), px(b,0), AB, AB); r.filled=true; r.fillColor=C.paper; r.stroked=false; return r; }
    function bar(b,y,x,w,thick,colour){ var r=lyRules.pathItems.rectangle(py(b,y),px(b,x),w,thick); r.filled=true; r.fillColor=colour; r.stroked=false; return r; }
    function keyline(b,inset,weight){ var r=lyRules.pathItems.rectangle(py(b,inset),px(b,inset),AB-inset*2,AB-inset*2); r.filled=false; r.stroked=true; r.strokeColor=C.ink; r.strokeWidth=weight; return r; }
    function fillRect(b,y,x,w,h,colour,lyr){ lyr=lyr||lyArt; var r=lyr.pathItems.rectangle(py(b,y),px(b,x),w,h); r.filled=true; r.fillColor=colour; r.stroked=false; return r; }
    function strokeRect(b,y,x,w,h,colour,weight,lyr){ lyr=lyr||lyRules; var r=lyr.pathItems.rectangle(py(b,y),px(b,x),w,h); r.filled=false; r.stroked=true; r.strokeColor=colour; r.strokeWidth=weight; return r; }
    function ellipse(b,y,x,w,h,colour){ var r=lyArt.pathItems.ellipse(py(b,y),px(b,x),w,h); r.filled=true; r.fillColor=colour; r.stroked=false; return r; }
    function area(b,y,x,w,h,content,style){ var box=lyType.pathItems.rectangle(py(b,y),px(b,x),w,h); var tf; try{tf=lyType.textFrames.areaText(box);}catch(e){log("WARN: area — "+e);return null;} tf.contents=content; try{style.applyTo(tf.textRange,true);}catch(e2){} return tf; }

    function drawSilhouette(b, bx, by, bw, bh) {
        var cx = bx + bw/2, headD = bw*0.42;
        ellipse(b, by + bh*0.20, cx - headD/2, headD, headD, C.ink);
        fillRect(b, by + bh*0.20 + headD*0.72, cx - bw*0.36, bw*0.72, bh*0.42, C.ink);
    }

    // ==============================================================
    // 6. BUILD EACH CARD
    // ==============================================================

    function buildCard(b, card) {
        var W = AB - M*2;
        paper(b);
        keyline(b, 44, 7);

        area(b, M+6, M+20, W-40, 44, "PERSONNEL FILE",       PS.head);
        area(b, M+6, M+20, W-40, 44, "TOLD STRAIGHT / CAST", PS.headR);
        bar(b, M+62, M+20, W-40, 3, C.ink);

        var bx = M+20, by = 230, bw = 560, bh = 690;
        fillRect(b, by, bx, bw, bh, C.ghost);
        strokeRect(b, by, bx, bw, bh, C.ink, 3);

        // Place the committed colour portrait, fit to the box (top-aligned).
        var placed = false;
        try {
            var pf = new File(PORTRAIT_DIR + "/" + card.portrait);
            if (pf.exists) {
                var pi = lyArt.placedItems.add();
                pi.file = pf;
                var scale = (bw / pi.width) * 100;
                pi.width  = pi.width  * scale / 100;
                pi.height = pi.height * scale / 100;
                pi.left = px(b, bx);
                pi.top  = py(b, by);
                // clip to the box height if the portrait is taller than the frame
                placed = true;
                log("  " + card.out + ": portrait PLACED (" + card.portrait + ")");
            } else {
                log("  " + card.out + ": PORTRAIT NOT FOUND (" + card.portrait + ") — silhouette");
            }
        } catch (ePl) { log("  " + card.out + ": portrait place failed (" + ePl + ") — silhouette"); }
        if (!placed) drawSilhouette(b, bx, by, bw, bh);

        area(b, by+16, bx+18, 200, 34, card.boxLabel, PS.boxLbl);
        var capH = 52;
        fillRect(b, by+bh-capH, bx, bw, capH, C.ink);
        area(b, by+bh-capH+14, bx+18, bw-36, 34, "SYNTHETIC LIKENESS — NOT REAL", PS.boxCap);

        // NOT REAL stamp
        try {
            var sx = bx+80, sy = by+bh-250, sw = 400, sh = 120;
            var sbox = lyType.pathItems.rectangle(py(b,sy), px(b,sx), sw, sh);
            sbox.filled=false; sbox.stroked=true; sbox.strokeColor=C.red; sbox.strokeWidth=7;
            var stf = lyType.textFrames.add(); stf.contents = "NOT REAL";
            try { PS.stamp.applyTo(stf.textRange, true); } catch (e) {}
            try { stf.left = px(b,sx+46); stf.top = py(b,sy+24); } catch (e) {}
            var g = lyType.groupItems.add(); sbox.moveToBeginning(g); stf.moveToBeginning(g); g.rotate(-11);
        } catch (eStamp) { log("WARN: stamp " + card.out + " — " + eStamp); }

        var rx = bx+bw+60, rw = AB-M-20-rx;
        area(b, 250, rx, rw, 140, card.name, PS.name);
        area(b, 372, rx, rw, 56,  card.role, PS.role);
        var fy = 470;
        for (var i = 0; i < card.fields.length; i++) {
            area(b, fy, rx, rw, 34, card.fields[i].k, PS.fieldK);
            area(b, fy+34, rx, rw, 44, card.fields[i].v, PS.fieldV);
            fy += 92;
        }

        bar(b, 990, M+20, W-40, 2, C.ink);
        area(b, 1010, M+20, W-40, 36, "FILE NOTES", PS.notesL);
        area(b, 1060, M+20, W-40, 360, card.notes, PS.notes);
        area(b, AB-M-26, M+20, 700, 34, "TOLD STRAIGHT", PS.foot);
    }

    for (var b2 = 0; b2 < CARDS.length; b2++) buildCard(boards[b2], CARDS[b2]);

    // ==============================================================
    // 7. AUDIT
    // ==============================================================

    log("");
    log("CARDS BUILT (one artboard each), export names match episodes/…/cast/:");
    for (var m = 0; m < CARDS.length; m++) log("  " + CARDS[m].out + ".png   " + CARDS[m].name);
    log("");
    log("COLOUR PORTRAIT IS THE STANDARD (2026-07-29). Each card keeps its");
    log("  shipped copy verbatim; only the silhouette -> portrait changes.");
    log("  Portraits are read from " + PORTRAIT_DIR);
    log("  If a portrait is taller than the frame it overhangs the box — nudge");
    log("  pi.top / crop with a clipping mask by hand; the frame is 560x690.");
    log("");
    log("These overwrite the Ep02 DRAFT cast art (episodes are drafts, not");
    log("  published — no undo concern). Exports replace the same-named files:");
    log("  episodes/ToldStraight-Ep02/cast/{host_des_fable,guest_michael_voss}.png");
    log("  studio_disclaimer.png has no portrait and is unchanged.");
    log("");
    log("EXTEND THE STANDARD by adding cards to CARDS (Ep01 Owen has a portrait");
    log("  but no card yet; give him one here when wanted).");

    paper(bAudit);
    area(bAudit, M, M, AB - M*2, AB - M*2, report.join("\r"), PS.audit);
    try { app.executeMenuCommand("fitall"); } catch (e) {}

    // ==============================================================
    // 8. OPTIONAL EXPORT — names match the tracked files
    // ==============================================================

    var exportNote = "";
    if (EXPORT_PNG) {
        try {
            var dir = new Folder(EXPORT_DIR);
            if (!dir.exists) dir.create();
            var opts = new ExportOptionsPNG24();
            opts.artBoardClipping = true; opts.transparency = false;
            opts.horizontalScale = 100; opts.verticalScale = 100;
            for (var e5 = 0; e5 < CARDS.length; e5++) {
                doc.artboards.setActiveArtboardIndex(e5);
                doc.exportFile(new File(dir.fsName + "/" + CARDS[e5].out + ".png"), ExportType.PNG24, opts);
            }
            exportNote = "\n" + CARDS.length + " PNGs written to " + EXPORT_DIR + "\n";
        } catch (e6) { exportNote = "\nPNG export failed: " + e6 + "\n"; }
    }

    alert("Told Straight — " + CARDS.length + " cast card(s) built.\n\n"
        + "Title face : " + (psTitle || "DEFAULT") + "\n"
        + "Mono face  : " + (psMono  || "DEFAULT") + "\n\n"
        + (faceWarnings === 0 ? "Faces resolved cleanly.\n" : faceWarnings + " face compromise(s) — see audit.\n")
        + exportNote + "\n"
        + "Portrait standard: colour cartoon placed from episodes/cast/portraits/.\n"
        + "Exports overwrite the same-named files in episodes/…/cast/ via a tracked PR.");

})();
