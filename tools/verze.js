#!/usr/bin/env node
/* Dorovná verzi stylů a skriptů v HTML podle VERSION v sw.js.
 *
 *   node tools/verze.js           přepíše style.css?v=…, script.js?v=… atd.
 *   node tools/verze.js --check   jen zkontroluje (exit 1, když nesedí)
 *
 * Proč: HTML se bere vždycky ze sítě, styly a skripty z cache. Bez verze
 * v adrese by nové HTML mohlo dostat starší script.js a místo textů by se
 * ukázaly názvy klíčů (třeba „promo_toggle“).
 */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const m = sw.match(/const VERSION = 'v(\d+)'/);
if (!m) { console.error('V sw.js chybí VERSION.'); process.exit(1); }
const v = m[1];
const soubory = ['style.css', 'db.js', 'i18n-sk.js', 'bank.js', 'recipe.js', 'icons.js', 'script.js'];
const stranky = ['index.html', 'offline.html', '404.html'];
const check = process.argv.includes('--check');
let chyby = 0;
for (const stranka of stranky) {
    const p = path.join(root, stranka);
    if (!fs.existsSync(p)) continue;
    const puv = fs.readFileSync(p, 'utf8');
    let nove = puv;
    for (const f of soubory) {
        const esc = f.replace(/[.]/g, '\\.');
        // src="script.js", href="/style.css", případně už s ?v=…
        nove = nove.replace(new RegExp(`((?:src|href)="/?)${esc}(?:\\?v=\\d+)?"`, 'g'), `$1${f}?v=${v}"`);
    }
    if (nove !== puv) {
        if (check) { console.error(`${stranka}: verze nesedí s sw.js (v${v}).`); chyby++; }
        else { fs.writeFileSync(p, nove); console.log(`${stranka}: verze v${v}`); }
    }
}
if (check && !chyby) console.log(`Verze stylů a skriptů sedí (v${v}).`);
process.exit(chyby ? 1 : 0);
