/**
 * Told Straight — Ep01 Exhibit stat cards  (ILLUSTRATOR)
 * ------------------------------------------------------------------
 * Rebuilds all six Ep01 "Exhibit" chapter cards as live, editable
 * vector artboards in the measured Told Straight palette — the
 * re-set called for by issue #60 as re-scoped 2026-07-27.
 *
 * Run the type shootout builder FIRST and pick a face. Then set
 * FACE.title / FACE.mono below and run this. Everything else is
 * already correct.
 *
 * TO RUN:  File > Scripts > Other Script...  and pick this file.
 * IT NEVER TOUCHES AN OPEN DOCUMENT. It always creates a new one.
 *
 * The six cards' content is transcribed verbatim from
 * episodes/ToldStraight-Ep01/alt-text.md — the only surviving record
 * of what the v1 cards said. Citations are the show's evidence and
 * are not to be paraphrased.
 */

#target illustrator

(function () {

    // ==============================================================
    // WRONG-APP GUARD — read this before deleting it
    // ==============================================================

    var thisApp = "an unknown application";
    try { thisApp = String(app.name); } catch (e) {}

    if (thisApp.indexOf("Illustrator") === -1) {
        alert("WRONG APPLICATION\n\n"
            + "This is an ILLUSTRATOR script (Told Straight Ep01 Exhibit cards).\n"
            + "You are running it in: " + thisApp + "\n\n"
            + "Open Adobe Illustrator and run it from:\n"
            + "File > Scripts > Other Script...\n\n"
            + "Nothing was created or changed.");
        return;
    }

    // ==============================================================
    // 0. THE ONE THING YOU CHANGE AFTER THE SHOOTOUT
    // ==============================================================
    //
    // PostScript names. Leave a value null to let the script fall back
    // and tell you what it substituted. Run the shootout builder's
    // audit board to get the exact installed names.

    // ---- THE DECISION, 2026-07-27 --------------------------------
    //
    // The maintainer chose candidate E — TRADE GOTHIC NEXT BOLD
    // CONDENSED — across all three plates of the type shootout, run 2.
    //
    // Run 1 had produced a false result: candidates A and B rendered at
    // the wrong weight because a prefix match silently downgraded them,
    // and Trade Gothic Next was not installed at all. C won that run.
    // With the field corrected, the answer changed. Do not treat run 1's
    // outcome as history — it was measurement error.
    //
    // Set an exact PostScript name below to pin it. Leave null and the
    // resolver below searches the family, prefers a bold/condensed cut,
    // and SHOUTS if it has to settle for a lighter weight — which is
    // precisely the failure that made run 1 unfair.

    var FACE = {
        // PINNED 2026-07-27. Confirmed by a successful resolve in this
        // script's own run the same day — measured, not guessed. Adobe
        // Fonts names the family "Trade Gothic Next LT Pro" (Monotype,
        // 26 styles); its PostScript names use the LTPro form, which is
        // why earlier "TradeGothicNext-Heavy" patterns never matched.
        title: "TradeGothicNextLTPro-BdCn",
        label: null,   // the caption — see the note below
        mono:  null    // exhibit line + citation — still undecided
    };

    // Weight-aware search, in preference order. `require` substrings must
    // ALL appear; `exclude` disqualifies; `prefer` tokens are tried in
    // order and anything outside them counts as a weight compromise.
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
            // Same family at full width — one typeface at two widths, the
            // DoD manual idiom. See familyMembers() for why this uses
            // excludeSuffix rather than exclude.
            { require: ["tradegothicnext"], exclude: ["italic", "oblique"],
              excludeSuffix: ["cn", "cond", "comp", "it", "obl"],
              prefer: ["bold", "bd", "heavy", "hv"] },
            { require: ["universnextpro"], exclude: ["italic", "oblique"],
              excludeSuffix: ["cond", "comp", "it", "obl"],
              prefer: ["bold", "bd", "heavy"] },
            { require: ["helveticaneueltpro"], exclude: ["italic", "oblique"],
              excludeSuffix: ["cn", "ex", "it", "obl"],
              prefer: ["bd", "bold", "blk"] }
        ],
        mono: [
            // Ordered by how RIGHT each is for a military medical record,
            // not by how likely it is to be installed. Source Code Pro is
            // a monospace but it is a CODE face, not a typewriter face —
            // it is last on purpose.
            { require: ["lettergothic"],  exclude: ["italic", "oblique"], prefer: ["std", "medium", "bold"] },
            { require: ["oratorstd"],     exclude: ["italic", "oblique"], prefer: ["std", "medium"] },
            { require: ["courierprime"],  exclude: ["italic", "oblique"], prefer: ["regular", "prime"] },
            { require: ["nitti"],         exclude: ["italic", "oblique"], prefer: ["normal", "regular"] },
            { require: ["ibmplexmono"],   exclude: ["italic", "oblique"], prefer: ["regular", "text"] },
            { require: ["p22typewriter"], exclude: ["italic", "oblique"], prefer: ["regular"] },
            { require: ["sourcecodepro"], exclude: ["italic", "oblique"], prefer: ["regular"] },
            { require: ["courier"],       exclude: ["italic", "oblique"], prefer: ["regular", "psmt"] }
        ]
    };

    // Set true to write PNGs alongside the .ai when the build finishes.
    var EXPORT_PNG = false;
    var EXPORT_DIR = "~/Code/audio-lab/output/artwork/ep01-v2";

    // ==============================================================
    // 1. THE CONTENT — verbatim from alt-text.md, do not paraphrase
    // ==============================================================

    var CARDS = [
        { n: "01", topic: "PROVENANCE",
          stat: "EST. 1775",
          caption: "FIRST MEDICAL DESCRIPTION OF ADHD",
          cite: "WEIKARD, CITED IN THE WORLD FEDERATION\rOF ADHD CONSENSUS STATEMENT, 2021" },

        { n: "02", topic: "HERITABILITY",
          stat: "74%",
          caption: "TWIN-STUDY HERITABILITY OF ADHD",
          cite: "FARAONE & LARSSON,\rMOLECULAR PSYCHIATRY 2019" },

        { n: "03", topic: "RECOGNITION",
          stat: "3-YR DELAY",
          caption: "PEAK CORTICAL THICKNESS VS PEERS",
          cite: "SHAW ET AL.,\rPNAS 2007" },

        { n: "04", topic: "RISK (UNTREATED)",
          stat: "2.07x",
          caption: "ALL-CAUSE MORTALITY RATE RATIO",
          cite: "DALSGAARD ET AL.,\rTHE LANCET 2015" },

        { n: "05", topic: "TREATMENT",
          stat: "SMD ~1.0",
          caption: "STIMULANT EFFECT SIZE (LARGE)",
          cite: "CORTESE ET AL.,\rLANCET PSYCHIATRY 2018" },

        { n: "06", topic: "PHENOTYPE",
          stat: "g = 1.17",
          caption: "EMOTIONAL DYSREGULATION (CORE FEATURE)",
          cite: "BEHESHTI ET AL.,\rBMC PSYCHIATRY 2020" }
    ];

    var FOOTER_LEFT = "TOLD STRAIGHT / EP.01";

    // ==============================================================
    // 2. GEOMETRY + PALETTE
    // ==============================================================

    var AB     = 1600;
    var GUTTER = 200;
    var MARGIN = 96;          // outer frame inset
    var LIVE_W = AB - (MARGIN * 2);
    var COLS   = 3;           // 3 x 2 grid for six cards

    // MEASURED from episodes/ToldStraight-Ep01/*.png, 2026-07-27.
    var PALETTE = {
        paper:    [237, 233, 224],
        ink:      [ 17,  17,  17],
        red:      [176,  42,  40],
        grey:     [120, 116, 108],
        hairline: [200, 196, 186]
    };

    // Sizes are STARTING POINTS eyeballed from the v1 renders, not
    // measured — the pixel measurement was refused by the repo lane
    // guard (#56). Expect to adjust, especially "stat".
    var SIZE = {
        exhibit: { size: 34,  leading: 44,  tracking: 160 },
        stat:    { size: 300, leading: 320, tracking: -20 },
        /* 62pt wrapped card 06's caption to two lines while every other
           card sat on one. The longest caption sets this size, not the
           average — "EMOTIONAL DYSREGULATION (CORE FEATURE)" is 38
           characters against card 02's 31. Kept the copy rather than
           cutting the parenthetical: "(core feature)" is a real claim,
           that dysregulation is core to ADHD and not a comorbidity. */
        caption: { size: 52,  leading: 66,  tracking:  10 },
        cite:    { size: 30,  leading: 46,  tracking: 120 },
        footer:  { size: 26,  leading: 34,  tracking: 120 }
    };

    var report = [];
    function log(s) { report.push(s); }

    function rgb(t) { var c = new RGBColor(); c.red=t[0]; c.green=t[1]; c.blue=t[2]; return c; }
    var C = {
        paper: rgb(PALETTE.paper), ink: rgb(PALETTE.ink), red: rgb(PALETTE.red),
        grey: rgb(PALETTE.grey), hairline: rgb(PALETTE.hairline)
    };

    // ==============================================================
    // 3. FONT RESOLUTION — report substitutions, never hide them
    // ==============================================================

    var installed = [];
    for (var fi = 0; fi < app.textFonts.length; fi++) installed.push(app.textFonts[fi].name);

    function has(ps) {
        for (var i = 0; i < installed.length; i++) if (installed[i] === ps) return true;
        return false;
    }

    // `exclude` tests the whole PostScript name. `excludeSuffix` tests
    // ONLY the style part after the last hyphen — necessary because a
    // family name can contain a width token by accident:
    // "TradeGothicNextLTPro-Bd" contains "cn" inside "gothiCNext", so
    // excluding "cn" against the full name silently emptied the match
    // set and the caption kept falling back to Univers even with the
    // full-width cuts activated. Found 2026-07-27.
    function familyMembers(require, exclude, excludeSuffix) {
        var out = [], i, j, nm, suf, cut, ok;
        for (i = 0; i < installed.length; i++) {
            nm = installed[i].toLowerCase();
            ok = true;
            for (j = 0; j < require.length; j++) {
                if (nm.indexOf(require[j]) === -1) { ok = false; break; }
            }
            if (ok && exclude) {
                for (j = 0; j < exclude.length; j++) {
                    if (nm.indexOf(exclude[j]) !== -1) { ok = false; break; }
                }
            }
            if (ok && excludeSuffix) {
                cut = nm.lastIndexOf("-");
                suf = (cut === -1) ? "" : nm.substring(cut + 1);
                for (j = 0; j < excludeSuffix.length; j++) {
                    if (suf.indexOf(excludeSuffix[j]) !== -1) { ok = false; break; }
                }
            }
            if (ok) out.push(installed[i]);
        }
        return out;
    }

    var faceWarnings = 0;

    // Walks SEARCH[role] in order. A pinned FACE name wins outright. A
    // family hit on a preferred token is clean. A family hit with NO
    // preferred token is a WEIGHT COMPROMISE and says so loudly — that
    // is the exact failure that made shootout run 1 unfair, where a
    // prefix match quietly substituted UniversNextPro-Cond (regular)
    // for the bold that was asked for, and reported success.
    function resolveRole(roleName, pinned, groups) {
        var i, j, k, fam;

        if (pinned && has(pinned)) {
            log("  " + roleName + ": " + pinned + "   (pinned in FACE)");
            return pinned;
        }
        if (pinned) {
            faceWarnings++;
            log("  " + roleName + ": PINNED FONT '" + pinned + "' IS NOT INSTALLED — searching");
        }

        for (i = 0; i < groups.length; i++) {
            fam = familyMembers(groups[i].require, groups[i].exclude, groups[i].excludeSuffix);
            if (!fam.length) continue;

            for (j = 0; j < groups[i].prefer.length; j++) {
                for (k = 0; k < fam.length; k++) {
                    if (fam[k].toLowerCase().indexOf(groups[i].prefer[j]) !== -1) {
                        log("  " + roleName + ": " + fam[k]
                            + "   (" + groups[i].require.join("+") + " / " + groups[i].prefer[j] + ")");
                        return fam[k];
                    }
                }
            }

            faceWarnings++;
            log("  " + roleName + ": " + fam[0] + "   ** WEIGHT COMPROMISE **");
            log("           " + groups[i].require.join("+") + " matched " + fam.length
                + " face(s) but none carried a preferred weight:");
            for (k = 0; k < fam.length && k < 10; k++) log("             " + fam[k]);
            return fam[0];
        }

        faceWarnings++;
        log("  " + roleName + ": NOTHING MATCHED — Illustrator's default will be used");
        return null;
    }

    function fontObj(ps) { if (!ps) return null; try { return app.textFonts.getByName(ps); } catch (e) { return null; } }

    log("TOLD STRAIGHT — Ep01 Exhibit cards");
    log("Built " + new Date().toString());
    log("Illustrator " + app.version + "  |  " + installed.length + " fonts installed");
    log("");
    log("TYPEFACE: candidate E, TRADE GOTHIC NEXT BOLD CONDENSED");
    log("  Chosen by the maintainer 2026-07-27 from shootout run 2, across");
    log("  all three plates. Run 1 had picked a different face, but that run");
    log("  rendered two candidates at the wrong weight and omitted this one");
    log("  entirely — its result was measurement error, not a preference.");
    log("");
    log("FONTS RESOLVED");
    var psTitle = resolveRole("title", FACE.title, SEARCH.title);
    var psLabel = resolveRole("label", FACE.label, SEARCH.label);
    var psMono  = resolveRole("mono ", FACE.mono,  SEARCH.mono);
    log("");
    if (!psMono) {
        log("  WARNING: no monospace installed at all. The exhibit line and the");
        log("  citation are the two places the v1 cards used a typewriter face.");
        log("");
    } else if (psMono.toLowerCase().indexOf("lettergothic") === -1
            && psMono.toLowerCase().indexOf("orator") === -1) {
        log("  NOTE: " + psMono + " is monospace but it is a CODE face, not a");
        log("  TYPEWRITER face. The v1 exhibit line and citation read as typed");
        log("  paperwork — a code face reads as a terminal. This is the last");
        log("  undecided slot in the system. Activate Letter Gothic Std or");
        log("  Orator Std (Creative Cloud desktop app > Fonts > Browse fonts)");
        log("  and re-run to see the intended card.");
        log("");
    }
    var fTitle = fontObj(psTitle), fLabel = fontObj(psLabel), fMono = fontObj(psMono);

    // ==============================================================
    // 4. DOCUMENT + ARTBOARDS
    // ==============================================================

    var doc = app.documents.add(DocumentColorSpace.RGB, AB, AB);
    try { doc.rulerUnits = RulerUnits.Points; } catch (e) {}

    function cellRect(col, row) {
        var l = col * (AB + GUTTER), t = -(row * (AB + GUTTER));
        return [l, t, l + AB, t - AB];
    }
    try { doc.artboards[0].artboardRect = cellRect(0, 0); } catch (e) { log("WARN: artboard 0 — " + e); }
    for (var k = 1; k < CARDS.length; k++) {
        try { doc.artboards.add(cellRect(k % COLS, Math.floor(k / COLS))); }
        catch (e2) { log("WARN: artboard " + k + " — " + e2); }
    }
    // Audit board to the right of the grid.
    try { doc.artboards.add(cellRect(COLS, 0)); } catch (e3) {}
    for (var ai = 0; ai < doc.artboards.length && ai < CARDS.length; ai++) {
        try { doc.artboards[ai].name = "exhibit-" + CARDS[ai].n + "-" + CARDS[ai].topic.toLowerCase().replace(/[^a-z0-9]+/g, "-"); }
        catch (e4) {}
    }

    function layer(name) {
        var l; try { l = doc.layers.getByName(name); } catch (e) { l = doc.layers.add(); l.name = name; } return l;
    }
    var lyType = layer("TYPE"), lyRules = layer("RULES"), lyPaper = layer("PAPER");
    try { lyPaper.zOrder(ZOrderMethod.SENDTOBACK); } catch (e) {}

    // ==============================================================
    // 5. STYLES — role in paragraph styles so one edit moves all six
    // ==============================================================

    function paraStyle(name, spec, colour, font, justify) {
        var st; try { st = doc.paragraphStyles.getByName(name); } catch (e) { st = doc.paragraphStyles.add(name); }
        try {
            var ca = st.characterAttributes;
            ca.size = spec.size; ca.leading = spec.leading; ca.tracking = spec.tracking;
            ca.autoLeading = false;
            if (colour) ca.fillColor = colour;
            if (font) ca.textFont = font;
            if (justify !== undefined) st.paragraphAttributes.justification = justify;
        } catch (e2) { log("WARN: style " + name + " — " + e2); }
        return st;
    }

    var PS = {
        exhibit: paraStyle("CARD/Exhibit", SIZE.exhibit, C.ink,  fMono  || fLabel, Justification.LEFT),
        stat:    paraStyle("CARD/Stat",    SIZE.stat,    C.ink,  fTitle,           Justification.CENTER),
        caption: paraStyle("CARD/Caption", SIZE.caption, C.ink,  fLabel || fTitle, Justification.CENTER),
        cite:    paraStyle("CARD/Cite",    SIZE.cite,    C.grey, fMono  || fLabel, Justification.CENTER),
        footL:   paraStyle("CARD/FooterL", SIZE.footer,  C.grey, fMono  || fLabel, Justification.LEFT),
        footR:   paraStyle("CARD/FooterR", SIZE.footer,  C.grey, fMono  || fLabel, Justification.RIGHT),
        audit:   paraStyle("CARD/Audit",   { size: 20, leading: 29, tracking: 0 }, C.ink, fMono || fLabel, Justification.LEFT)
    };

    // ==============================================================
    // 6. DRAWING
    // ==============================================================

    function dx(col, x) { return col * (AB + GUTTER) + x; }
    function dy(row, y) { return -(row * (AB + GUTTER)) - y; }

    function paper(col, row) {
        var r = lyPaper.pathItems.rectangle(dy(row, 0), dx(col, 0), AB, AB);
        r.filled = true; r.fillColor = C.paper; r.stroked = false; return r;
    }
    function frameBox(col, row) {
        // The outer keyline the v1 cards carry.
        var r = lyRules.pathItems.rectangle(dy(row, MARGIN * 0.45), dx(col, MARGIN * 0.45),
                                            AB - (MARGIN * 0.9), AB - (MARGIN * 0.9));
        r.filled = false; r.stroked = true; r.strokeColor = C.ink; r.strokeWidth = 7; return r;
    }
    function bar(col, row, y, thick, colour, inset, width) {
        var x = (inset === undefined) ? MARGIN : inset;
        var w = (width === undefined) ? (AB - x * 2) : width;
        var r = lyRules.pathItems.rectangle(dy(row, y), dx(col, x), w, thick);
        r.filled = true; r.fillColor = colour; r.stroked = false; return r;
    }
    function text(col, row, y, h, content, style, inset) {
        var x = (inset === undefined) ? MARGIN : inset;
        var box = lyType.pathItems.rectangle(dy(row, y), dx(col, x), AB - (x * 2), h);
        var tf;
        try { tf = lyType.textFrames.areaText(box); } catch (e) { log("WARN: text — " + e); return null; }
        tf.contents = content;
        try { style.applyTo(tf.textRange, true); } catch (e2) {}
        return tf;
    }

    // ==============================================================
    // 7. BUILD THE SIX CARDS
    // ==============================================================
    //
    // Structure mirrors the v1 cards: keyline frame, exhibit line under
    // a rule at the top, the figure centred, a red rule beneath it, the
    // caption in caps, the citation in grey, and a two-part footer.

    for (var i = 0; i < CARDS.length; i++) {
        var card = CARDS[i];
        var col = i % COLS, row = Math.floor(i / COLS);

        paper(col, row);
        frameBox(col, row);

        text(col, row, MARGIN + 18, 54,
             "EXHIBIT " + card.n + " — " + card.topic, PS.exhibit, MARGIN + 24);
        bar(col, row, MARGIN + 84, 4, C.ink, MARGIN + 24);

        // The figure. This is the element that decides the typeface —
        // % . ~ = - and, on card 06, the only lowercase in the set.
        text(col, row, 470, 360, card.stat, PS.stat);

        bar(col, row, 872, 9, C.red, 240);

        text(col, row, 930, 190, card.caption, PS.caption, 108);

        text(col, row, 1180, 130, card.cite, PS.cite, 200);

        text(col, row, AB - MARGIN - 40, 46, FOOTER_LEFT, PS.footL, MARGIN + 24);
        text(col, row, AB - MARGIN - 40, 46, card.n + "/06", PS.footR, MARGIN + 24);
    }

    // ==============================================================
    // 8. AUDIT BOARD
    // ==============================================================

    log("SIX CARDS BUILT — artboards named exhibit-NN-topic");
    for (var m = 0; m < CARDS.length; m++) {
        log("  " + CARDS[m].n + "  " + CARDS[m].stat + "   " + CARDS[m].topic);
    }
    log("");
    log("WHAT IS AND IS NOT DECIDED HERE");
    log("  Palette: MEASURED from the v1 PNGs. Trust it.");
    log("    paper #EDE9E0  ink #111111  red #B02A28  grey #78746C  rule #C8C4BA");
    log("  Sizes and positions: EYEBALLED from the v1 renders, not measured.");
    log("    Adjust freely. Card 05 'SMD ~1.0' and 03 '3-YR DELAY' are the");
    log("    longest figures — if anything overflows, it is those two.");
    log("  Citations: transcribed verbatim from alt-text.md. Do not paraphrase;");
    log("    the attached source is the show's entire argument.");
    log("");
    log("TO CHANGE EVERY CARD AT ONCE");
    log("  Window > Type > Paragraph Styles, edit CARD/Stat, CARD/Caption, etc.");
    log("  One edit moves all six. Do not restyle a card locally.");
    log("");
    log("BEFORE THESE REPLACE ANYTHING");
    log("  episodes/ is a gated path. The v1 PNGs are the ONLY copy of the");
    log("  original art and are attached to episodes already on the feed.");
    log("  They get archived, never overwritten. See issue #60.");

    var auditCol = COLS, auditRow = 0;
    paper(auditCol, auditRow);
    text(auditCol, auditRow, MARGIN, AB - (MARGIN * 2), report.join("\r"), PS.audit);

    try { app.executeMenuCommand("fitall"); } catch (e) {}

    // ==============================================================
    // 9. OPTIONAL PNG EXPORT — descriptive filenames, never a hash
    // ==============================================================

    var exported = 0, exportNote = "";
    if (EXPORT_PNG) {
        try {
            var dir = new Folder(EXPORT_DIR);
            if (!dir.exists) dir.create();
            var opts = new ExportOptionsPNG24();
            opts.artBoardClipping = true;
            opts.transparency = false;
            opts.horizontalScale = 100; opts.verticalScale = 100;
            for (var e5 = 0; e5 < CARDS.length; e5++) {
                doc.artboards.setActiveArtboardIndex(e5);
                var slug = "20260727-adobe-illustrator-toldstraight-ep01-exhibit-"
                         + CARDS[e5].n + "-"
                         + CARDS[e5].topic.toLowerCase().replace(/[^a-z0-9]+/g, "-")
                         + "-1600";
                doc.exportFile(new File(dir.fsName + "/" + slug + ".png"), ExportType.PNG24, opts);
                exported++;
            }
            exportNote = "\n" + exported + " PNGs written to " + EXPORT_DIR + "\n";
        } catch (e6) {
            exportNote = "\nPNG export failed: " + e6 + "\n";
        }
    }

    var summary = "Told Straight — six Ep01 Exhibit cards built.\n\n"
        + "Artboards: " + doc.artboards.length + " (six cards plus the audit board).\n\n"
        + "Title face : " + (psTitle || "DEFAULT — nothing matched") + "\n"
        + "Label face : " + (psLabel || "DEFAULT — nothing matched") + "\n"
        + "Mono face  : " + (psMono  || "NONE INSTALLED") + "\n\n"
        + (faceWarnings === 0
            ? "All three faces resolved at their intended weight.\n"
            : faceWarnings + " face(s) resolved with a COMPROMISE — see the audit\n"
              + "board. Do not judge these cards until that is fixed; a wrong\n"
              + "weight is what invalidated shootout run 1.\n")
        + exportNote + "\n"
        + "Palette is measured. Sizes are eyeballed starting points.\n"
        + "Nothing here replaces anything in episodes/ — that path is gated.";

    alert(summary);

})();
