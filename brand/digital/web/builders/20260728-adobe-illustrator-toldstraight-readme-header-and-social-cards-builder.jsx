/**
 * Told Straight — README HEADER + SOCIAL CARDS  (ILLUSTRATOR)
 * ==================================================================
 * Applies the ADR 0015 lockups to the three wide/flat surfaces that
 * #60 child B calls for. Lockup assignment follows the maintainer's
 * instruction verbatim, NOT aspect-ratio instinct:
 *
 *   "Use the oneline for headers, readme, other formats where that
 *    width is appropriate; use the stacked one or minor aspect ratio
 *    tweaks of it for the social preview and anything else that the
 *    more square format lends it to"
 *
 * So: README header -> HORIZONTAL. Social preview + OG card ->
 * STACKED, because he named the social preview specifically. 1280x640
 * reads "wide" at 2:1, but his call governs.
 *
 * SIX ARTBOARDS — two of them are a CHOICE:
 *   ROW 1 — README header, pick one:
 *     1  readme-header-A   1280 x 320   tight banner, lockup + rule
 *     2  readme-header-B   1280 x 400   more air, adds the season line
 *   ROW 2 — the cards (sizes are fixed by the platforms, not by taste):
 *     3  github-social     1280 x 640   GitHub repo social preview
 *     4  og-card           1200 x 630   Open Graph / link previews
 *     5  og-card-dark      1200 x 630   dark-stock variant of 4
 *     6  AUDIT             1600 x 1600
 *
 * THE TWO SIZES ARE NOT ONE SCALED. 1280x640 is 2:1; 1200x630 is
 * 1.905:1. Cropping one from the other shifts the lockup off its
 * optical centre, which is why both are drawn rather than exported
 * twice from a single board.
 *
 * TO RUN:  File > Scripts > Other Script...  and pick this file.
 * IT NEVER TOUCHES AN OPEN DOCUMENT. It always creates a new one.
 */

#target illustrator

(function () {

    var thisApp = "an unknown application";
    try { thisApp = String(app.name); } catch (e) {}
    if (thisApp.indexOf("Illustrator") === -1) {
        alert("WRONG APPLICATION\n\nThis is an ILLUSTRATOR script (Told Straight README + social cards).\n"
            + "You are running it in: " + thisApp + "\n\nNothing was created or changed.");
        return;
    }

    // ==============================================================
    // 0. FACES — pinned, per ADR 0015
    // ==============================================================

    var FACE = {
        title: "TradeGothicNextLTPro-BdCn",
        label: "TradeGothicNextLTPro-Bd",
        mono:  "LetterGothicStd"
    };
    var SEARCH = {
        title: [{ require: ["tradegothicnext"], exclude: ["italic", "oblique"], prefer: ["bdcn", "boldcond", "hvcn"] },
                { require: ["helveticaneueltpro"], exclude: ["italic", "oblique"], prefer: ["bdcn", "blkcn"] }],
        label: [{ require: ["tradegothicnext"], exclude: ["italic", "oblique"],
                  excludeSuffix: ["cn", "cond", "comp", "it", "obl"], prefer: ["bold", "bd", "heavy"] }],
        mono:  [{ require: ["lettergothic"], exclude: ["italic", "oblique"], prefer: ["std", "bold", "medium"] },
                { require: ["oratorstd"], exclude: ["italic", "oblique"], prefer: ["std", "medium"] },
                { require: ["courier"], exclude: ["italic", "oblique"], prefer: ["regular", "psmt"] }]
    };

    var EXPORT_PNG = true;
    var EXPORT_DIR = "~/Code/audio-lab/output/artwork/brand-web";

    // ==============================================================
    // 1. PALETTE — light measured 2026-07-27; dark contrast-measured
    //    2026-07-28. Print red on dark = 2.82:1 and FAILS; the dark
    //    rule is #E4564F at 5.05:1. Measurement, not taste.
    // ==============================================================

    var PALETTE = {
        paper: [237, 233, 224], ink: [17, 17, 17], red: [176, 42, 40],
        grey: [120, 116, 108], hairline: [200, 196, 186],
        dpaper: [20, 20, 15], dink: [237, 233, 224], dred: [228, 86, 79], dgrey: [154, 150, 142]
    };
    var report = [];
    function log(s) { report.push(s); }
    function rgb(t) { var c = new RGBColor(); c.red=t[0]; c.green=t[1]; c.blue=t[2]; return c; }
    var C = {
        paper: rgb(PALETTE.paper), ink: rgb(PALETTE.ink), red: rgb(PALETTE.red),
        grey: rgb(PALETTE.grey), hairline: rgb(PALETTE.hairline),
        dpaper: rgb(PALETTE.dpaper), dink: rgb(PALETTE.dink),
        dred: rgb(PALETTE.dred), dgrey: rgb(PALETTE.dgrey)
    };

    // ==============================================================
    // 2. FONT RESOLUTION — loud about any compromise
    // ==============================================================

    var installed = [];
    for (var fi = 0; fi < app.textFonts.length; fi++) installed.push(app.textFonts[fi].name);
    function has(ps) { for (var i = 0; i < installed.length; i++) if (installed[i] === ps) return true; return false; }
    function familyMembers(require, exclude, excludeSuffix) {
        var out = [], i, j, nm, suf, cut, ok;
        for (i = 0; i < installed.length; i++) {
            nm = installed[i].toLowerCase(); ok = true;
            for (j = 0; j < require.length; j++) if (nm.indexOf(require[j]) === -1) { ok = false; break; }
            if (ok && exclude) for (j = 0; j < exclude.length; j++) if (nm.indexOf(exclude[j]) !== -1) { ok = false; break; }
            if (ok && excludeSuffix) {
                cut = nm.lastIndexOf("-"); suf = (cut === -1) ? "" : nm.substring(cut + 1);
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
            for (j = 0; j < groups[i].prefer.length; j++)
                for (k = 0; k < fam.length; k++)
                    if (fam[k].toLowerCase().indexOf(groups[i].prefer[j]) !== -1) { log("  " + roleName + ": " + fam[k]); return fam[k]; }
            faceWarnings++; log("  " + roleName + ": " + fam[0] + "   ** WEIGHT COMPROMISE **"); return fam[0];
        }
        faceWarnings++; log("  " + roleName + ": NOTHING MATCHED — Illustrator default"); return null;
    }
    function fontObj(ps) { if (!ps) return null; try { return app.textFonts.getByName(ps); } catch (e) { return null; } }

    log("TOLD STRAIGHT — README header + social cards");
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
    // 3. DOCUMENT + ARTBOARDS
    //    Row 1: 1280+1280 + 220        = 2780 -> start -1390
    //    Row 2: 1280+1200+1200 + 2*220 = 4120 -> start -2060
    //    Row 3: 1600                          -> start  -800
    // ==============================================================

    var GUTTER = 220;
    var doc = app.documents.add(DocumentColorSpace.RGB, 1280, 320);
    try { doc.rulerUnits = RulerUnits.Points; } catch (e) {}

    var BOARDS = [];
    // Row 1: 5 headers  1280*5 + 4*220        = 7280 -> start -3640
    // Row 2: 5 cards    1280*2+1200*3 + 4*220 = 7040 -> start -3520
    // Row 3: audit      1600                        -> start  -800
    var cursor = { r1: -3640, r2: -3520, r3: -800 };
    function addBoard(row, name, w, h) {
        var left, top;
        if (row === 1)      { left = cursor.r1; top = h / 2;  cursor.r1 += w + GUTTER; }
        else if (row === 2) { left = cursor.r2; top = -600;   cursor.r2 += w + GUTTER; }
        else                { left = cursor.r3; top = -1600;  cursor.r3 += w + GUTTER; }
        var rect = [left, top, left + w, top - h];
        var ab;
        if (BOARDS.length === 0) {
            ab = doc.artboards[0];
            try { ab.artboardRect = rect; } catch (e) { log("WARN: artboard " + name + " — " + e); }
        } else {
            try { ab = doc.artboards.add(rect); } catch (e2) { log("WARN: artboard " + name + " — " + e2); ab = null; }
        }
        if (ab) { try { ab.name = name; } catch (e3) {} }
        var b = { name: name, w: w, h: h, x: left, y: top };
        BOARDS.push(b); return b;
    }

    var bHdrA = addBoard(1, "readme-header-A-oneline-1280x320", 1280, 320);
    var bHdrB = addBoard(1, "readme-header-B-oneline-1280x400", 1280, 400);
    // Stacked headers, added on the maintainer's request to see both
    // treatments before deciding. A stacked lockup needs vertical room,
    // so these are taller than their one-line counterparts — that height
    // cost IS part of the decision, not a drafting accident.
    var bHdrC = addBoard(1, "readme-header-C-stacked-1280x420", 1280, 420);
    var bHdrD = addBoard(1, "readme-header-D-stacked-1280x520", 1280, 520);
    // Cards: the SAME two platform sizes, each drawn both ways. Sizes
    // are fixed by GitHub and Open Graph; only the lockup varies.
    var bGHs  = addBoard(2, "github-social-STACKED-1280x640", 1280, 640);
    var bGHo  = addBoard(2, "github-social-ONELINE-1280x640", 1280, 640);
    var bOGs  = addBoard(2, "og-card-STACKED-1200x630",       1200, 630);
    var bOGo  = addBoard(2, "og-card-ONELINE-1200x630",       1200, 630);
    var bOGD  = addBoard(2, "og-card-dark-1200x630",          1200, 630);
    /* README header, DARK — the ONLY flat surface here that can actually
       switch by theme. GitHub honours <picture> + prefers-color-scheme in
       README markdown, so light and dark are a genuine PAIR.
       The social preview and the OG card CANNOT: a repo takes one image,
       and og:image is a single URL with no theme signal in the protocol.
       Their dark boards are therefore an ALTERNATIVE (pick one for
       everyone), never a companion. Recorded here because "we have a dark
       version" invites shipping it as if it were responsive. */
    var bHdrBD = addBoard(1, "readme-header-B-DARK-1280x400", 1280, 400);
    var bAud  = addBoard(3, "AUDIT",                          1600, 1600);

    function layer(name) { var l; try { l = doc.layers.getByName(name); } catch (e) { l = doc.layers.add(); l.name = name; } return l; }
    var lyType  = layer("TYPE");
    var lyRules = layer("RULES");
    var lyPaper = layer("PAPER");
    try { lyPaper.zOrder(ZOrderMethod.SENDTOBACK); } catch (e) {}
    try { lyType.zOrder(ZOrderMethod.BRINGTOFRONT); } catch (e) {}   // rules-above-type lesson

    // ==============================================================
    // 4. STYLES
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
    var L = Justification.LEFT;

    var PS = {
        hdrTitle:  paraStyle("HDR/Title",  150, 140, -18, C.ink,  fTitle, L),
        // Stacked headers set smaller than the one-line: two lines of
        // 150pt would make the banner ~600pt tall, which stops being a
        // banner. The size difference is the honest cost of stacking here.
        hdrStackTitle: paraStyle("HDR/StackTitle", 128, 120, -18, C.ink, fTitle, L),
        hdrMono:   paraStyle("HDR/Mono",    17,  24, 240, C.grey, fMono,  L),
        hdrSeason: paraStyle("HDR/Season",  24,  34, 200, C.ink,  fLabel, L),
        // Dark twins of the header roles — same metrics, dark tokens only.
        dHdrTitle: paraStyle("DHDR/Title", 150, 140, -18, C.dink,  fTitle, L),
        dHdrMono:  paraStyle("DHDR/Mono",   17,  24, 240, C.dgrey, fMono,  L),
        dHdrSeason:paraStyle("DHDR/Season", 24,  34, 200, C.dink,  fLabel, L),

        cardTitle: paraStyle("CARD/Title", 190, 178, -18, C.ink,  fTitle, L),
        // One-line on a 1200-1280 measure: "TOLD STRAIGHT" at 190pt would
        // overhang, so the one-line card sets smaller. Point text, so any
        // overhang is visible rather than silently overset.
        cardOneTitle: paraStyle("CARD/OneTitle", 132, 124, -18, C.ink, fTitle, L),
        cardMono:  paraStyle("CARD/Mono",   22,  30, 240, C.grey, fMono,  L),
        cardSeason:paraStyle("CARD/Season", 30,  42, 200, C.ink,  fLabel, L),

        dCardTitle:paraStyle("DCARD/Title",190, 178, -18, C.dink, fTitle, L),
        dCardMono: paraStyle("DCARD/Mono",  22,  30, 240, C.dgrey,fMono,  L),
        dCardSeason:paraStyle("DCARD/Season",30, 42, 200, C.dink, fLabel, L),

        audit:     paraStyle("AUDIT/Text",  19,  27,   0, C.ink,  fMono,  L)
    };

    var AUTHORITY = "DEPT. OF NEURODEVELOPMENTAL AFFAIRS";
    var SEASON    = "SEASON ONE — ADULT ADHD";

    // ==============================================================
    // 5. HELPERS
    // ==============================================================

    function px(b, x) { return b.x + x; }
    function py(b, y) { return b.y - y; }
    function paper(b, colour) {
        var r = lyPaper.pathItems.rectangle(py(b, 0), px(b, 0), b.w, b.h);
        r.filled = true; r.fillColor = colour || C.paper; r.stroked = false; return r;
    }
    function bar(b, y, x, w, thick, colour) {
        var r = lyRules.pathItems.rectangle(py(b, y), px(b, x), w, thick);
        r.filled = true; r.fillColor = colour; r.stroked = false; return r;
    }
    function point(b, y, x, content, style) {
        var tf; try { tf = lyType.textFrames.add(); } catch (e) { log("WARN: point — " + e); return null; }
        tf.contents = content;
        try { style.applyTo(tf.textRange, true); } catch (e2) {}
        try { tf.left = px(b, x); tf.top = py(b, y); } catch (e3) {}
        return tf;
    }
    function pointRight(b, y, rightMargin, content, style) {
        var tf = point(b, y, 0, content, style);
        if (tf) { try { tf.left = px(b, b.w - rightMargin - tf.width); } catch (e) {} }
        return tf;
    }

    // ==============================================================
    // 6. README HEADER — HORIZONTAL lockup (maintainer: "oneline for
    //    headers, readme"). Two proportions to choose between.
    // ==============================================================

    // A — tight banner. Lockup and rule only; the README's own H1
    // carries the season context, so the banner does not repeat it.
    (function () {
        var b = bHdrA, M = 70;
        paper(b);
        point(b, 70, M, "TOLD STRAIGHT", PS.hdrTitle);
        bar(b, 224, M, b.w - M * 2, 7, C.red);
        point(b, 252, M, AUTHORITY, PS.hdrMono);
    })();

    // B — more air, and carries the season line, so the banner works
    // standalone (social crops, docs pages) without the README around it.
    (function () {
        var b = bHdrB, M = 80;
        paper(b);
        point(b, 74, M, "TOLD STRAIGHT", PS.hdrTitle);
        bar(b, 232, M, b.w - M * 2, 8, C.red);
        point(b, 262, M, AUTHORITY, PS.hdrMono);
        pointRight(b, 258, M, SEASON, PS.hdrSeason);
    })();

    // C, D — the SAME header content in the stacked lockup. Stacking
    // two lines of display type costs vertical height on a surface whose
    // whole job is being a thin banner; C is the tightest stack that
    // does not crowd, D gives it room and adds the season line.
    (function () {
        var b = bHdrC, M = 70;
        paper(b);
        point(b, 46,  M, "TOLD",     PS.hdrStackTitle);
        point(b, 176, M, "STRAIGHT", PS.hdrStackTitle);
        bar(b, 322, M, b.w - M * 2, 7, C.red);
        point(b, 350, M, AUTHORITY, PS.hdrMono);
    })();
    (function () {
        var b = bHdrD, M = 80;
        paper(b);
        point(b, 60,  M, "TOLD",     PS.hdrStackTitle);
        point(b, 205, M, "STRAIGHT", PS.hdrStackTitle);
        bar(b, 372, M, b.w - M * 2, 8, C.red);
        point(b, 402, M, AUTHORITY, PS.hdrMono);
        pointRight(b, 398, M, SEASON, PS.hdrSeason);
    })();

    // B-DARK — the chosen header on dark stock. Geometry identical to B;
    // only the four colour roles change, so the pair cannot drift apart.
    // Rule is #E4564F (5.05:1 measured on #14140F); the print red is
    // 2.82:1 there and fails every threshold. Not a taste call.
    (function () {
        var b = bHdrBD, M = 80;
        paper(b, C.dpaper);
        point(b, 74, M, "TOLD STRAIGHT", PS.dHdrTitle);
        bar(b, 232, M, b.w - M * 2, 8, C.dred);
        point(b, 262, M, AUTHORITY, PS.dHdrMono);
        pointRight(b, 258, M, SEASON, PS.dHdrSeason);
    })();

    // ==============================================================
    // 7. THE CARDS — STACKED lockup, per the maintainer naming the
    //    social preview specifically. Drawn per size, never cropped
    //    from one another: 2:1 vs 1.905:1 moves the optical centre.
    // ==============================================================

    /* SEASON IS AN EYEBROW ON CARDS, NOT A FOOT-RIGHT LINE.
       Run 1 set AUTHORITY left and SEASON right on one baseline, as the
       headers do. On a card that collides: at 22pt/30pt the two lines
       need ~1155pt against a ~1030pt live measure, so SEASON overprinted
       "...AFFAIRS" and buried it. Headers escape it only because their
       type is 17pt/24pt on a wider board.
       The fix is not smaller type — it is that a card has vertical room
       the header does not, and an edition line above the title is native
       to the document idiom anyway (FM covers put it exactly there). */
    function card(b, dark) {
        var M = Math.round(b.w * 0.075);          // ~7.5% margin, scales with width
        paper(b, dark ? C.dpaper : null);
        var sT = dark ? PS.dCardTitle  : PS.cardTitle;
        var sM = dark ? PS.dCardMono   : PS.cardMono;
        var sS = dark ? PS.dCardSeason : PS.cardSeason;
        var rule = dark ? C.dred : C.red;

        // Vertical rhythm derived from board height so both card sizes
        // sit on the same proportional grid rather than fixed offsets.
        var titleTop = Math.round(b.h * 0.22);
        var lineGap  = Math.round(b.h * 0.28);
        var ruleY    = titleTop + lineGap + Math.round(b.h * 0.30);

        point(b, Math.round(b.h * 0.10), M, SEASON, sS);   // eyebrow
        point(b, titleTop, M, "TOLD", sT);
        point(b, titleTop + lineGap, M, "STRAIGHT", sT);
        bar(b, ruleY, M, b.w - M * 2, 9, rule);
        point(b, ruleY + 30, M, AUTHORITY, sM);            // foot, alone
    }

    // One-line variant of the same card, so both treatments are visible
    // on both platform sizes. The name has to fit the measure at one
    // line, so the title size is derived from board width rather than
    // fixed — that constraint is itself part of the comparison.
    function cardOneline(b) {
        var M = Math.round(b.w * 0.075);
        paper(b);
        var titleTop = Math.round(b.h * 0.30);
        var ruleY    = titleTop + Math.round(b.h * 0.30);
        point(b, Math.round(b.h * 0.14), M, SEASON, PS.cardSeason);   // eyebrow, same fix
        point(b, titleTop, M, "TOLD STRAIGHT", PS.cardOneTitle);
        bar(b, ruleY, M, b.w - M * 2, 9, C.red);
        point(b, ruleY + 30, M, AUTHORITY, PS.cardMono);
    }

    card(bGHs,  false);
    cardOneline(bGHo);
    card(bOGs,  false);
    cardOneline(bOGo);
    card(bOGD, true);

    // ==============================================================
    // 8. AUDIT
    // ==============================================================

    log("WHAT THIS RUN IS");
    log("  The three flat web surfaces from #60 child B, built on the");
    log("  ADR 0015 lockups. Sizes are fixed by the platforms:");
    log("    GitHub repo social preview  1280 x 640  (2:1)");
    log("    Open Graph / link preview   1200 x 630  (1.905:1)");
    log("  They are DRAWN SEPARATELY, not cropped from one another —");
    log("  the ratios differ enough to move the lockup off optical centre.");
    log("");
    log("LOCKUP ASSIGNMENT IS BEING PREVIEWED, NOT ASSUMED");
    log("  ADR 0015 records the maintainer's instruction: one-line for");
    log("  headers/README, stacked for the social preview. He then asked");
    log("  to SEE both treatments on BOTH surfaces before deciding, so");
    log("  every board below exists in both forms. Whatever he picks");
    log("  either confirms ADR 0015 or amends it — and if it amends it,");
    log("  that is a new ADR, not a quiet edit to 0015.");
    log("");
    log("THE QUESTIONS — two picks");
    log("  1. README header: A / B (one-line) or C / D (stacked)?");
    log("       A 1280x320  tight, no season line");
    log("       B 1280x400  more air + season line");
    log("       C 1280x420  stacked, tightest that does not crowd");
    log("       D 1280x520  stacked with room + season line");
    log("     COST OF STACKING, stated: two display lines need height on");
    log("     a surface whose job is being a thin banner, so C/D set at");
    log("     128pt against the one-line 150pt. Smaller name, taller band.");
    log("  2. Social cards: STACKED or ONELINE? One answer covers both");
    log("     platform sizes. The one-line card sets at 132pt because");
    log("     TOLD STRAIGHT must fit a 1200-1280 measure on one line.");
    log("");
    log("SIZES ARE FIXED BY PLATFORMS, NOT TASTE");
    log("  GitHub social preview 1280x640 (2:1); Open Graph 1200x630");
    log("  (1.905:1). Drawn separately, never cropped from one another.");
    log("");
    log("RUN 1 DEFECT, FIXED — read this before comparing to a screenshot");
    log("  Run 1 set AUTHORITY left and SEASON right on ONE baseline on");
    log("  the cards, copying the header layout. They collided: at card");
    log("  type sizes the pair needs ~1155pt against a ~1030pt measure,");
    log("  so SEASON overprinted AFFAIRS. Headers were unaffected — they");
    log("  set smaller type on a wider board, which is exactly why the");
    log("  bug survived being 'the same code'. SEASON is now an eyebrow");
    log("  above the title on cards, which the FM idiom wanted anyway.");
    log("  Lesson: measure the pair, do not reuse a layout across sizes.");
    log("");
    log("DARK VARIANTS — WHICH ONES ARE REAL PAIRS, AND WHICH ARE NOT");
    log("  README header light+dark IS a pair: GitHub honours <picture>");
    log("    with prefers-color-scheme in README markdown, so each viewer");
    log("    gets the right one. UNVERIFIED in this repo — the deliverables");
    log("    PR must prove it by rendering, not assert it.");
    log("  GitHub social preview and the OG card CANNOT switch. A repo");
    log("    takes ONE image; og:image is ONE URL with no theme signal in");
    log("    the protocol. Their dark boards are an ALTERNATIVE — pick one");
    log("    for everyone — never a responsive companion. Shipping one as");
    log("    if it were responsive is the trap this note exists to stop.");
    log("  Favicons CAN switch: <link rel=icon media=prefers-color-scheme>.");
    log("    Handled in the favicon derivation builder, not here.");
    log("  All dark rules are #E4564F (5.05:1 on #14140F, measured). Print");
    log("    red #B02A28 is 2.82:1 there and fails everything. Do not revert.");
    log("");
    log("Sizes and positions: EYEBALLED. Card rhythm is proportional to");
    log("  board height, so both card sizes share one grid.");

    paper(bAud);
    (function () {
        var bx = lyType.pathItems.rectangle(py(bAud, 90), px(bAud, 90), bAud.w - 180, bAud.h - 180);
        var tf; try { tf = lyType.textFrames.areaText(bx); } catch (e) { return; }
        tf.contents = report.join("\r");
        try { PS.audit.applyTo(tf.textRange, true); } catch (e2) {}
    })();

    try { app.executeMenuCommand("fitall"); } catch (e) {}

    // ==============================================================
    // 9. EXPORT — descriptive names, native pixel sizes
    // ==============================================================

    var exportNote = "";
    if (EXPORT_PNG) {
        try {
            var dir = new Folder(EXPORT_DIR);
            if (!dir.exists) dir.create();
            var opts = new ExportOptionsPNG24();
            opts.artBoardClipping = true; opts.transparency = false;
            opts.horizontalScale = 100; opts.verticalScale = 100;
            var names = [
                "20260728-adobe-illustrator-toldstraight-readme-header-a-oneline-1280x320",
                "20260728-adobe-illustrator-toldstraight-readme-header-b-oneline-1280x400",
                "20260728-adobe-illustrator-toldstraight-readme-header-c-stacked-1280x420",
                "20260728-adobe-illustrator-toldstraight-readme-header-d-stacked-1280x520",
                "20260728-adobe-illustrator-toldstraight-github-social-stacked-1280x640",
                "20260728-adobe-illustrator-toldstraight-github-social-oneline-1280x640",
                "20260728-adobe-illustrator-toldstraight-og-card-stacked-1200x630",
                "20260728-adobe-illustrator-toldstraight-og-card-oneline-1200x630",
                "20260728-adobe-illustrator-toldstraight-og-card-dark-stacked-1200x630",
                "20260728-adobe-illustrator-toldstraight-readme-header-b-dark-1280x400"
            ];
            for (var e5 = 0; e5 < names.length; e5++) {
                doc.artboards.setActiveArtboardIndex(e5);
                doc.exportFile(new File(dir.fsName + "/" + names[e5] + ".png"), ExportType.PNG24, opts);
            }
            exportNote = "\n" + names.length + " PNGs written to " + EXPORT_DIR + "\n";
        } catch (e6) { exportNote = "\nPNG export failed: " + e6 + "\n"; }
    }

    alert("Told Straight — README header + social cards built.\n\n"
        + "TWO picks, both treatments rendered for both surfaces:\n\n"
        + "1. README header:\n"
        + "     A 1280x320 one-line, tight\n"
        + "     B 1280x400 one-line + season line\n"
        + "     C 1280x420 stacked, tight\n"
        + "     D 1280x520 stacked + season line\n"
        + "2. Social cards: STACKED or ONELINE?\n"
        + "     One answer covers both 1280x640 and 1200x630.\n\n"
        + "Title face: " + (psTitle || "DEFAULT") + "\n"
        + (faceWarnings === 0 ? "All faces resolved at intended weight.\n"
                              : "*** " + faceWarnings + " FACE(S) COMPROMISED — stop before judging. ***\n")
        + exportNote
        + "\nNothing here touches episodes/ or the feed.");

})();
