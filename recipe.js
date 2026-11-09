/* =============================================
   RECEPTURA SMĚSI
   =============================================
   Ze surovin a dílů spočítá podíly v %, gramy na sáček, druh čaje podle
   vyhlášky 187/2023 Sb. a příplatek za prémiové suroviny.

   Stejný výpočet dělá databáze (public.recipe_eval v supabase/setup.sql).
   Rozhoduje databáze, tohle je jen ať zákazník hned vidí totéž. Proto se
   počítá jen v celých číslech: web i databáze musí dojít ke stejnému
   výsledku do posledního procenta i koruny. Kdo mění pravidla tady, musí
   je změnit i v SQL (hlídá to test, který obě verze porovnává).

   Pravidla:
   - 1 až 5 surovin, každá jen jednou.
   - Každá surovina má 1 až 3 díly. 2 díly jsou dvakrát víc než 1 díl.
   - Suroviny s limitem do 5 % (levandule, kardamom) jsou „špetka“: mají
     pevně 4 % (nebo svůj limit, když je nižší) a díly se u nich nepočítají.
     Ve směsi můžou být nejvýš dvě.
   - Zbytek do 100 % se rozdělí mezi ostatní suroviny podle dílů.
     Zaokrouhluje se na celá procenta metodou největšího zbytku, takže
     součet je vždy přesně 100 %. Při shodě vyhrává surovina víc vpředu.
   - Žádná surovina nesmí přesáhnout svůj limit z přílohy 1 vyhlášky
     (třeba citronová kůra 30 %). Hlídá se přesná hodnota, ne zaokrouhlená.
   - Směs musí mít druh podle § 2 vyhlášky: pravý čaj aspoň 50 % (ochucený
     čaj), nebo byliny víc než 50 % (bylinný čaj), nebo sušené ovoce víc
     než 50 % (ovocný čaj). Jinak ji neprodáváme.
   - Příplatek: součet (podíl × gramáž × Kč za 100 g), zaokrouhlený na
     celé koruny.
*/
(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.Recipe = api;
})(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    const MAX_ITEMS = 5;
    const MAX_PINCH = 2;
    const MIN_PARTS = 1;
    const MAX_PARTS = 3;
    const PINCH_PCT = 4;
    const PINCH_LIMIT = 5;          // surovina s limitem do 5 % je špetka
    const GRAMS_PER_CUP = 2.5;      // na 200 ml

    function isPinch(maxPct) {
        return Number.isInteger(maxPct) && maxPct >= 1 && maxPct <= PINCH_LIMIT;
    }
    function pinchPct(maxPct) { return Math.min(PINCH_PCT, maxPct); }
    function validPart(p) { return Number.isInteger(p) && p >= MIN_PARTS && p <= MAX_PARTS; }

    /* Starší košíky, uložené směsi a odkazy znají jen suroviny ve třech
       slotech (základ, příchuť, doplněk). Ty dostanou díly 3 + 1 + 1. */
    function legacyParts(n) {
        return Array.from({ length: n }, (_, i) => (i === 0 && n > 1 ? 3 : 1));
    }

    /* Vyčistí seznam surovin (vyhodí prázdné sloty) a k němu díly. */
    function normalize(codes, parts) {
        const list = (Array.isArray(codes) ? codes : [])
            .filter(c => typeof c === 'string' && c !== '' && c !== 'Empty');
        const ok = Array.isArray(parts) && parts.length === list.length && parts.every(validPart);
        return { codes: list, parts: ok ? parts.slice() : legacyParts(list.length) };
    }

    /* infoOf(code) → { kind: 'tea'|'herb'|'fruit'|'other', maxPct, surcharge } nebo null */
    function evaluate(codesIn, partsIn, infoOf, weight) {
        const { codes, parts } = normalize(codesIn, partsIn);
        const w = Number.isInteger(weight) && weight > 0 ? weight : 0;
        const out = { ok: false, error: null, errorCode: null, rows: [], category: null,
                      teaOnly: false, surcharge: 0, weight: w, codes, parts };
        const fail = (error, code) => Object.assign(out, { ok: false, error, errorCode: code || null });

        if (!codes.length) return fail('empty');
        if (codes.length > MAX_ITEMS) return fail('too_many');
        if (new Set(codes).size !== codes.length) return fail('duplicate');

        const infos = codes.map(c => infoOf(c));
        const missing = codes.find((c, i) => !infos[i]);
        if (missing) return fail('unknown', missing);

        let rest = 100, sumParts = 0, pinches = 0;
        const rows = codes.map((code, i) => {
            const info = infos[i];
            const maxPct = Number.isInteger(info.maxPct) ? info.maxPct : null;
            const pinch = isPinch(maxPct);
            const row = {
                code, parts: parts[i], pinch, pct: 0, grams: 0, rem: -1,
                kind: ['tea', 'herb', 'fruit', 'other'].includes(info.kind) ? info.kind : 'herb',
                maxPct,
                surcharge: Number.isInteger(info.surcharge) && info.surcharge > 0 ? info.surcharge : 0,
            };
            if (pinch) { pinches++; row.pct = pinchPct(maxPct); rest -= row.pct; }
            else sumParts += row.parts;
            return row;
        });
        out.rows = rows;
        if (pinches > MAX_PINCH) return fail('too_many_pinch');
        if (!sumParts) return fail('no_main');

        // Hlavní suroviny: celé procento dolů, zbytek dostanou největší zbytky.
        let left = rest;
        rows.forEach(r => {
            if (r.pinch) return;
            r.pct = Math.floor(rest * r.parts / sumParts);
            r.rem = (rest * r.parts) % sumParts;
            left -= r.pct;
        });
        while (left > 0) {
            let best = null;
            rows.forEach(r => { if (r.rem > 0 && (best === null || r.rem > best.rem)) best = r; });
            if (!best) break;
            best.pct += 1;
            best.rem = -1;
            left -= 1;
        }
        rows.forEach(r => {
            delete r.rem;
            r.grams = Math.round(r.pct * w / 10) / 10;
        });

        // Příplatek v celých korunách (a vždy, i když směs neprojde dál).
        const cents = rows.reduce((s, r) => s + r.pct * w * r.surcharge, 0);
        out.surcharge = Math.floor((cents + 5000) / 10000);

        // Limity z přílohy 1: přesný podíl je rest × díly / součet dílů.
        const over = rows.find(r => !r.pinch && r.maxPct !== null && rest * r.parts > r.maxPct * sumParts);
        if (over) return fail('over_limit', over.code);

        // Druh čaje, taky přesně: každý podíl vynásobený součtem dílů.
        const share = { tea: 0, herb: 0, fruit: 0, other: 0 };
        rows.forEach(r => { share[r.kind] += r.pinch ? r.pct * sumParts : rest * r.parts; });
        const half = 50 * sumParts;
        out.category = share.tea >= half ? 'tea' : share.herb > half ? 'herb' : share.fruit > half ? 'fruit' : null;
        out.teaOnly = rows.every(r => r.kind === 'tea');
        if (!out.category) return fail('no_category');

        out.ok = true;
        return out;
    }

    /* Projde změna dílu (o +1 nebo −1) bez překročení limitu? Pro tlačítka. */
    function partChangeAllowed(codes, parts, index, delta, infoOf) {
        const next = parts.slice();
        next[index] = parts[index] + delta;
        if (!validPart(next[index])) return false;
        const now = evaluate(codes, parts, infoOf, 100);
        const then = evaluate(codes, next, infoOf, 100);
        return !(then.error === 'over_limit' && now.error !== 'over_limit');
    }

    function cups(weight) { return Math.round(weight / GRAMS_PER_CUP); }

    return {
        MAX_ITEMS, MAX_PINCH, MIN_PARTS, MAX_PARTS, PINCH_PCT, PINCH_LIMIT, GRAMS_PER_CUP,
        isPinch, legacyParts, normalize, evaluate, partChangeAllowed, cups, validPart,
    };
});
