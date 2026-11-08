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

    function svg(key) {
        return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"'
            + ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'
            + (SHAPES[key] || SHAPES.sprig) + '</svg>';
    }

    return { svg, keyFor, KEYS: Object.keys(SHAPES) };
});
