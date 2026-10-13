/* Service worker pro Tease you.
 *
 * Pravidlo číslo jedna: po nasazení nesmí nikdo zůstat viset na starém
 * script.js. Proto se HTML tahá vždycky ze sítě a statika se sice servíruje
 * z cache (aby to bylo rychlé), ale na pozadí se rovnou přepisuje novou
 * verzí. Při další návštěvě je aktuální.
 *
 * Když měníš seznam PRECACHE, zvyš VERSION — jinak se stará cache nezahodí.
 */

const VERSION = 'v3';
const CACHE = `teaseyou-${VERSION}`;

// Minimum, aby se web offline vůbec vykreslil.
const PRECACHE = [
    './',
    './index.html',
    './offline.html',
    './style.css',
    './script.js',
    './manifest.json',
    './ClimateCrisis-1979.woff2',
    './icon-192.svg',
    './icon-512.svg'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE)
            // Jeden chybějící soubor nesmí shodit celou instalaci,
            // proto po jednom a chyby jen spolknout.
            .then(cache => Promise.all(
                PRECACHE.map(url => cache.add(url).catch(() => {}))
            ))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys.filter(key => key !== CACHE).map(key => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    const req = event.request;

    // POST na Formspree, widget Packety, Google Fonts — do toho nesaháme.
    if (req.method !== 'GET') return;
    if (new URL(req.url).origin !== self.location.origin) return;

    // Navigace: vždy síť. Bez připojení padáme na uloženou homepage,
    // a když ani ta není, na offline stránku.
    if (req.mode === 'navigate') {
        event.respondWith(
            fetch(req)
                .then(res => {
                    const copy = res.clone();
                    caches.open(CACHE).then(cache => cache.put('./index.html', copy));
                    return res;
                })
                .catch(() => caches.match('./index.html')
                    .then(cached => cached || caches.match('./offline.html')))
        );
        return;
    }

    // Statika: vrať z cache hned, ale stáhni čerstvou verzi na pozadí.
    event.respondWith(
        caches.match(req).then(cached => {
            const fresh = fetch(req)
                .then(res => {
                    if (res && res.ok) {
                        const copy = res.clone();
                        caches.open(CACHE).then(cache => cache.put(req, copy));
                    }
                    return res;
                })
                .catch(() => cached);
            return cached || fresh;
        })
    );
});
