/* =============================================
   IKONKY SUROVIN
   =============================================
   Jednoduché čárové ikonky 24 × 24, dokud v administraci nenahraješ
   vlastní (Ingredience → Ikonka). Kreslí se barvou `currentColor`, takže
   barvu určuje CSS (tmavší odstín barvy suroviny).

   Novou surovinu bez vlastní ikonky web nakreslí podle druhu: pravý čaj
   lístkem, sušené ovoce bobulí, bylinu snítkou.

   Používá ho web (script.js) i administrace (admin.js).
*/
(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.IngIcons = api;
})(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    const SHAPES = {
        // čajový lístek se žilkou a stopkou
        leaf: '<path d="M6.5 17.5C5 10 10 5 19 5c.5 8.5-4.5 13.5-12.5 12.5Z"/><path d="M6.5 17.5 15 9"/><path d="M6.5 17.5 4 20"/>',
        // jehličky rooibosu na větvičce
        needles: '<path d="M12 21V4"/><path d="m12 7-3.5-3M12 7l3.5-3M12 11.5l-4.5-3.5M12 11.5 16.5 8M12 16l-5-3.5M12 16l5-3.5"/>',
        // heřmánek: osm okvětních lístků a žlutý střed
        daisy: '<circle cx="12" cy="12" r="2.6"/>'
            + [0, 45, 90, 135, 180, 225, 270, 315].map(a =>
                `<path d="M12 9.4c-1.4-1.2-1.8-3.6-.0-5.6 1.8 2 1.4 4.4 0 5.6Z" transform="rotate(${a} 12 12)"/>`).join(''),
        // lipový květ: pět kulatých lístků
        blossom: '<circle cx="12" cy="12" r="1.8"/>'
            + [0, 72, 144, 216, 288].map(a => `<circle cx="12" cy="6.8" r="3" transform="rotate(${a} 12 12)"/>`).join(''),
        // máta a meduňka: stonek a dva páry lístků
        mint: '<path d="M12 21V8"/><path d="M12 13c-3.8.4-6.2-1.6-6.5-5 3.6-.2 6.2 1.6 6.5 5Z"/><path d="M12 13c3.8.4 6.2-1.6 6.5-5-3.6-.2-6.2 1.6-6.5 5Z"/><path d="M12 8c-1.6-1.2-1.9-3-.0-5 1.9 2 1.6 3.8 0 5Z"/>',
        // meduňka: kulatější, vroubkované lístky
        balm: '<path d="M12 21V9"/><path d="M12 14.5c-3.6.6-6.4-1.2-6.6-4.6 3-.8 6.2.8 6.6 4.6Z"/><path d="M12 14.5c3.6.6 6.4-1.2 6.6-4.6-3-.8-6.2.8-6.6 4.6Z"/>'
            + '<path d="M12 9c-2.3-.6-3.4-2.6-2.6-5 2.6.2 3.6 2.6 2.6 5Z"/><path d="M7.4 11.4l1 .4M9.6 12.6l.8.6M16.6 11.4l-1 .4M14.4 12.6l-.8.6"/>',
        // jablko s lístkem
        apple: '<path d="M12 7.5c-1.7-1.3-6.5-1.8-6.8 3.8-.2 4.2 2.8 8.7 5 8.7.8 0 1.2-.4 1.8-.4s1 .4 1.8.4c2.2 0 5.2-4.5 5-8.7-.3-5.6-5.1-5.1-6.8-3.8Z"/><path d="M12 7.5c0-2 .8-3.4 2.2-4"/><path d="M13.2 5.4c1-1.6 2.7-2 4.3-1.5-.8 1.5-2.4 2.2-4.3 1.5Z"/>',
        // jahoda se semínky
        strawberry: '<path d="M12 20.5c-3.8-1.8-7-5.6-7-9.3 0-2.4 1.8-3.7 3.6-3.7 1.4 0 2.3.6 3.4.6s2-.6 3.4-.6c1.8 0 3.6 1.3 3.6 3.7 0 3.7-3.2 7.5-7 9.3Z"/><path d="M8.5 6.2 12 8l3.5-1.8"/><path d="M12 8V4"/><path d="M9.3 11.2h.01M14.7 11.2h.01M12 13.4h.01M9.8 15.4h.01M14.2 15.4h.01"/>',
        // malina z kuliček
        raspberry: '<path d="M8.6 7.2 12 8.6l3.4-1.4M12 8.6V4.5"/>'
            + [[9.5, 11.2], [14.5, 11.2], [12, 13.4], [9.5, 15.6], [14.5, 15.6], [12, 17.8]].map(([x, y]) =>
                `<circle cx="${x}" cy="${y}" r="2.2"/>`).join(''),
        // borůvky: tři bobule s korunkou
        berries: '<circle cx="8.5" cy="15" r="3.6"/><circle cx="15.5" cy="15" r="3.6"/><circle cx="12" cy="8.5" r="3.6"/><path d="M11 8.2h2M12 7.2v2"/>',
        // šípek: protáhlá plodina s korunkou
        rosehip: '<path d="M12 8.5c3 0 4.6 2.8 4.6 5.6S14.7 20.5 12 20.5s-4.6-3.6-4.6-6.4S9 8.5 12 8.5Z"/><path d="M12 8.5V4.5M12 6.5l-3-2.5M12 6.5l3-2.5"/>',
        // ibišek: pět lístků a tyčinka
        hibiscus: [0, 72, 144, 216, 288].map(a =>
                `<path d="M12 12c-2.4-1-3.6-3.6-2.6-6.6 1.6-.6 3.8-.4 5.2 1.2.8 2.4-.4 4.4-2.6 5.4Z" transform="rotate(${a} 12 12)"/>`).join('')
            + '<path d="m12 12 3.2-3.2"/><circle cx="16" cy="8" r=".9"/>',
        // růže: spirála květu, stonek s lístkem
        rose: '<path d="M7.5 10.5c0-3 2-5 4.5-5s4.5 2 4.5 5-2 5-4.5 5-4.5-2-4.5-5Z"/><path d="M12 8.2c1.4 0 2.3 1 2.3 2.2s-1 2.1-2.3 2.1-2.1-.9-2.1-2"/><path d="M12 15.5V21"/><path d="M12 18.5c-1.8.2-3.4-.6-4-2.3 1.9-.2 3.4.6 4 2.3Z"/>',
        // citronová tráva: tři stébla
        grass: '<path d="M7 21C7 14.5 8.6 8.8 12.5 4"/><path d="M12 21c0-5.5.8-10 4.3-14"/><path d="M17 21c-.6-3.6-2-6.6-4.6-8.6"/>',
        // fenykl: tři podélná semínka s rýhou
        seeds: [[7.6, 14.2, -25], [12, 9.6, 0], [16.4, 14.2, 25]].map(([x, y, r]) =>
            `<g transform="translate(${x} ${y}) rotate(${r})"><path d="M0-4.4C2-2.4 2 2.4 0 4.4-2 2.4-2-2.4 0-4.4Z"/><path d="M0-3v6"/></g>`).join(''),
        // citrusová kůra / kolečko citrusu
        citrus: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="5.6"/><path d="M12 6.4v11.2M7.2 9.2l9.6 5.6M7.2 14.8l9.6-5.6"/>',
        // zázvorový kořen s výhonky
        root: '<path d="M4.5 15.6c.2-1.8 2-2.8 3.8-2 .4-2.2 2.8-3.2 4.6-2 1-1.8 3.6-2 4.8-.4 1.3 1.7.2 4.2-2 4.4-.4 1.8-2.8 2.8-4.6 1.8-1.4 1.4-4 1.4-5.2-.2-.9-.2-1.5-.8-1.4-1.6Z"/><path d="M10 11.2V8.4M15 10V7.6"/>',
        // skořice: dvě srolované tyčinky, na konci je vidět stočená kůra
        cinnamon: '<g transform="rotate(-35 12 12)"><rect x="3.5" y="7.6" width="17" height="4.4" rx="2.2"/><rect x="3.5" y="12" width="17" height="4.4" rx="2.2"/>'
            + '<path d="M5.7 9.8a.9.9 0 1 1 .9.9"/><path d="M5.7 14.2a.9.9 0 1 1 .9.9"/></g>',
        // levandule: klas s poupaty
        lavender: '<path d="M12 21V10"/>'
            + [[10.6, 4.4], [13.4, 5.6], [10.6, 7], [13.4, 8.2], [10.6, 9.6]].map(([x, y]) =>
                `<ellipse cx="${x}" cy="${y}" rx="1.2" ry="1.6"/>`).join('')
            + '<path d="M12 16.5c-2-.2-3.3-1.4-3.6-3.2 2 .2 3.3 1.4 3.6 3.2Z"/>',
        // kardamom: tobolka s rýhou
        pod: '<path d="M12 3.5c3.4 2.8 4.6 5.8 4.6 8.8S15.4 18 12 20.5c-3.4-2.5-4.6-5.4-4.6-8.2S8.6 6.3 12 3.5Z"/><path d="M12 6v12"/><path d="M12 3.5V2"/>',
        // obecná bylinka (nová surovina bez ikonky)
        sprig: '<path d="M12 21V5"/><path d="M12 9c-2.6-.2-4.2-1.8-4.4-4.2 2.6.2 4.2 1.8 4.4 4.2Z"/><path d="M12 13c2.6-.2 4.2-1.8 4.4-4.2-2.6.2-4.2 1.8-4.4 4.2Z"/><path d="M12 17c-2.6-.2-4.2-1.8-4.4-4.2 2.6.2 4.2 1.8 4.4 4.2Z"/>',
        // obecné ovoce
        berry: '<circle cx="12" cy="13.5" r="6"/><path d="M12 7.5V4M12 6l-2.6-1.6M12 6l2.6-1.6"/>',

        /* ── Ikonky mimo suroviny (odpovědi v kvízu) ── */
        // východ slunce
        sunrise: '<path d="M3.5 18.5h17"/><path d="M7 18.5a5 5 0 0 1 10 0"/><path d="M12 9.5V6.5M5.3 12.6 3.4 10.7M18.7 12.6l1.9-1.9"/>',
        sun: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M5.6 18.4l1.6-1.6M16.8 7.2l1.6-1.6"/>',
        moon: '<path d="M19.5 14.2A8 8 0 1 1 9.8 4.5a6.4 6.4 0 0 0 9.7 9.7Z"/>',
        clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
        bolt: '<path d="M13 3 5.5 13.5H11L10 21l7.500-10.500H12L13 3Z"/>',
        // dvě překřížené šipky
        shuffle: '<path d="M4 7h3.200c2 0 3.300 1 4.300 2.600l1 1.800c1 1.600 2.300 2.600 4.300 2.600H20"/><path d="M4 17h3.200c1.400 0 2.500-.5 3.300-1.400M13.500 8.400c.8-.9 1.900-1.400 3.300-1.400H20"/><path d="m17.500 4.500 2.500 2.500-2.500 2.500M17.500 14.500 20 17l-2.500 2.500"/>',
        // hrnek s párou
        cup: '<path d="M5 10h11v4.500a4.500 4.500 0 0 1-4.500 4.500h-2A4.500 4.500 0 0 1 5 14.500V10Z"/><path d="M16 11.500h1.300a2.200 2.200 0 0 1 0 4.400H16"/><path d="M8.500 7c0-1.100.9-1.300.9-2.500M12 7c0-1.100.9-1.300.9-2.500"/>',
        // sklenice s ledem a brčkem
        ice: '<path d="M6.500 7h11l-1.200 12.200a1.800 1.800 0 0 1-1.800 1.600h-5a1.800 1.800 0 0 1-1.800-1.600L6.500 7Z"/><path d="M13.500 7 15 3h2.500"/><rect x="9" y="10.500" width="3.400" height="3.400" rx=".7" transform="rotate(-12 10.7 12.200)"/><rect x="11.800" y="14.600" width="3.200" height="3.200" rx=".7" transform="rotate(14 13.400 16.200)"/>',
        drop: '<path d="M12 3.500c3.400 4 5.500 6.900 5.500 9.800a5.500 5.500 0 0 1-11 0c0-2.900 2.100-5.800 5.500-9.800Z"/><path d="M9.300 14.200c.3 1.400 1.300 2.300 2.700 2.500"/>',
        // kuchyňská váha
        scale: '<path d="M5 9.500h14l-1.100 8.300a2 2 0 0 1-2 1.700H8.100a2 2 0 0 1-2-1.700L5 9.500Z"/><path d="M8.500 9.500a3.500 3.500 0 0 1 7 0"/><path d="m12 9.500 1.800-2.400"/><path d="M9.500 15.500h5"/>',
        // sáček se zipem a etiketou
        pouch: '<path d="M7 3.500h10v3c1.200 4.200 1.700 8 1.400 11.800a2.500 2.500 0 0 1-2.500 2.200H8.100a2.500 2.500 0 0 1-2.500-2.200C5.300 14.500 5.800 10.700 7 6.500v-3Z"/><path d="M7 6.500h10"/><rect x="9" y="10.500" width="6" height="6" rx=".8"/>',
        // balík
        box: '<path d="M4 8.500 12 4.500l8 4v8l-8 4-8-4v-8Z"/><path d="m4 8.500 8 4 8-4M12 12.500v8M8 6.500l8 4"/>',
        // sněhová vločka
        snow: '<path d="M12 3v18M4.200 7.500l15.600 9M4.200 16.500l15.600-9"/><path d="m9.600 4.600 2.400 2 2.400-2M9.600 19.400l2.400-2 2.400 2M3.600 11l3 1-.8 3M20.400 13l-3-1 .8-3M17.200 5.800l-.6 3.100 3 .9M6.800 18.200l.6-3.100-3-.9"/>',
    };

    const BY_CODE = {
        'Green Tea': 'leaf', 'Black Tea': 'leaf', 'White Tea': 'leaf', 'Oolong Tea': 'leaf',
        'Rooibos': 'needles', 'Chamomile': 'daisy', 'Lemon Balm': 'balm', 'Linden': 'blossom',
        'Mint': 'mint', 'Spearmint': 'mint', 'Apple': 'apple', 'Strawberry': 'strawberry',
        'Raspberry': 'raspberry', 'Blueberry': 'berries', 'Rose Hip': 'rosehip', 'Hibiscus': 'hibiscus',
        'Rose': 'rose', 'Lemongrass': 'grass', 'Fennel': 'seeds', 'Orange': 'citrus', 'Lemon': 'citrus',
        'Ginger': 'root', 'Cinnamon': 'cinnamon', 'Lavender': 'lavender', 'Cardamom': 'pod',
    };
    const BY_KIND = { tea: 'leaf', fruit: 'berry', herb: 'sprig', other: 'sprig' };

    function keyFor(code, kind) { return BY_CODE[code] || BY_KIND[kind] || 'sprig'; }

    /* Posun kresby na střed pole 24×24 [doprava, dolů]. Tvary jsou kreslené od
       ruky a v kolečku bylo vidět, že nesedí uprostřed (východ slunce a růže
       moc nízko, měsíc vlevo dole…). Posun míří doprostřed mezi střed obrysu
       kresby a její těžiště: samotný obrys nestačí u tvarů, které mají váhu
       na jedné straně (srpek měsíce, čára obzoru). U pár ikonek je poměr
       doladěný od oka. Novou ikonku je potřeba doměřit a přidat sem; ikonka
       bez záznamu se neposouvá. */
    const SHIFT = {
        leaf: [0.3, -0.3], needles: [0, 0.1], blossom: [0, 0.2], mint: [0, 0.6], balm: [0.1, 0],
        apple: [-0.3, 0.5], strawberry: [0, -0.1], raspberry: [0, -0.6], berries: [0, -0.1],
        rosehip: [0, -0.2], hibiscus: [0.1, 0.1], rose: [0.1, -0.7], grass: [0.1, -0.9],
        seeds: [0, -0.2], root: [0.5, -1.3], cinnamon: [0.3, -0.2], lavender: [0.5, 0.7],
        pod: [0, 0.5], sprig: [0.3, -0.2], berry: [0, 0.2], sunrise: [0, -2.5], moon: [1.3, -1.3],
        clock: [0, 0.1], bolt: [0.5, 0], shuffle: [-0.4, 0.1], cup: [0, -0.2], ice: [-0.1, -0.3],
        drop: [0.1, 0.3], scale: [0, -0.8], pouch: [0, 0.1], box: [0, -0.3],
    };

    function svg(key) {
        const k = SHAPES[key] ? key : 'sprig';
        const s = SHIFT[k];
        return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"'
            + ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'
            + (s ? '<g transform="translate(' + s[0] + ' ' + s[1] + ')">' + SHAPES[k] + '</g>' : SHAPES[k]) + '</svg>';
    }

    return { svg, keyFor, KEYS: Object.keys(SHAPES) };
});
