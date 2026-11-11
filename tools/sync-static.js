#!/usr/bin/env node
/* Srovná české texty v index.html se slovníkem ve script.js.
 *
 * Texty webu jsou na dvou místech: ve slovníku (script.js, TRANSLATIONS.cs)
 * a přímo v index.html, kde je vidí vyhledávač a návštěvník dřív, než se
 * načte skript. Když se změní jen slovník, v HTML zůstane starý text. Tenhle
 * skript přepíše HTML podle slovníku:
 *
 *   node tools/sync-static.js          přepíše index.html
 *   node tools/sync-static.js --check  nic nemění; skončí chybou, když se texty liší
 *
 * Přepisuje obsah prvků s data-i18n a data-i18n-html, atributy aria-label
 * (data-i18n-aria) a placeholder (data-i18n-placeholder), <title> a popisy
 * stránky v hlavičce. Nic jiného v HTML nemění.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const htmlPath = path.join(root, 'index.html');
const check = process.argv.includes('--check');

/* script.js se spustí „naprázdno“ (bez prohlížeče), aby šlo zavolat přímo
   jeho funkci t() — stejné texty včetně typografie, jaké uvidí zákazník. */
function loadDictionary() {
    const noop = () => {};
    const fake = new Proxy(function () {}, {
        get: (_, k) => (k === Symbol.toPrimitive ? () => '' : k === 'length' ? 0 : fake),
        apply: () => fake,
        construct: () => fake,
    });
    const sandbox = {
        navigator: { language: 'cs-CZ', languages: ['cs-CZ'] },
        localStorage: { getItem: () => null, setItem: noop, removeItem: noop },
        sessionStorage: { getItem: () => null, setItem: noop, removeItem: noop },
        document: {
            addEventListener: noop, querySelector: () => null, querySelectorAll: () => [], getElementById: () => null,
            documentElement: { classList: { add: noop, remove: noop }, lang: 'cs' }, body: { classList: { add: noop, remove: noop, toggle: noop }, dataset: {} },
        },
        location: { search: '', origin: 'https://teaseyou.cz', pathname: '/', href: 'https://teaseyou.cz/' },
        history: {},
        console,
        setTimeout: noop, clearTimeout: noop, requestAnimationFrame: noop,
        IntersectionObserver: function () { return { observe: noop, unobserve: noop, disconnect: noop }; },
        MutationObserver: function () { return { observe: noop, disconnect: noop }; },
        matchMedia: () => ({ matches: false, addEventListener: noop }),
        URLSearchParams, URL, CSS: { escape: s => s },
    };
    sandbox.window = sandbox; sandbox.self = sandbox; sandbox.globalThis = sandbox;
    sandbox.addEventListener = noop;
    vm.createContext(sandbox);
    for (const file of ['i18n-sk.js', 'bank.js', 'recipe.js', 'icons.js']) {
        vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), sandbox, { filename: file });
    }
    vm.runInContext(fs.readFileSync(path.join(root, 'script.js'), 'utf8')
        + '\n;globalThis.__t = t; globalThis.__lang = LANG; globalThis.__keys = Object.keys(TRANSLATIONS.cs);', sandbox, { filename: 'script.js' });
    if (sandbox.__lang !== 'cs') throw new Error('slovník se nenačetl česky');
    const known = new Set(sandbox.__keys);
    return key => {
        if (!known.has(key)) throw new Error(`klíč „${key}“ není v českém slovníku`);
        return String(sandbox.__t(key));
    };
}

const escText = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/ /g, '&nbsp;');
const escAttr = s => escText(s).replace(/"/g, '&quot;');
const htmlText = s => s.replace(/ /g, '&nbsp;');

function sync(html, t) {
    let changes = 0;
    const note = (what, before, after) => {
        if (before !== after) { changes++; if (check) console.log(`  ${what}\n    v HTML:    ${before.trim().slice(0, 110)}\n    slovník:   ${after.trim().slice(0, 110)}`); }
    };
    const setAttr = (tag, name, value) => {
        const re = new RegExp(`(\\s${name}=")([^"]*)(")`);
        if (re.test(tag)) return tag.replace(re, (_, a, old, c) => { note(`${name} (${value.slice(0, 30)})`, old, escAttr(value)); return a + escAttr(value) + c; });
        note(`chybí ${name}`, '', value);
        return tag.replace(/>$/, ` ${name}="${escAttr(value)}">`);
    };

    let out = '';
    let pos = 0;
    const openRe = /<([a-zA-Z][a-zA-Z0-9]*)(\s[^<>]*)?>/g;
    let m;
    while ((m = openRe.exec(html))) {
        let tag = m[0];
        const name = m[1];
        const attrs = m[2] || '';
        const text = /\sdata-i18n="([^"]+)"/.exec(attrs);
        const rich = /\sdata-i18n-html="([^"]+)"/.exec(attrs);
        const aria = /\sdata-i18n-aria="([^"]+)"/.exec(attrs);
        const ph = /\sdata-i18n-placeholder="([^"]+)"/.exec(attrs);
        if (!text && !rich && !aria && !ph) continue;
        if (aria) tag = setAttr(tag, 'aria-label', t(aria[1]));
        if (ph) tag = setAttr(tag, 'placeholder', t(ph[1]));
        out += html.slice(pos, m.index) + tag;
        pos = m.index + m[0].length;
        if (!text && !rich) continue;

        // konec prvku: první uzavírací značka stejného jména, se započtením vnořených
        const inner = new RegExp(`<(/?)${name}(?=[\\s>])[^<>]*>`, 'gi');
        inner.lastIndex = pos;
        let depth = 1, end = -1, im;
        while ((im = inner.exec(html))) {
            depth += im[1] ? -1 : 1;
            if (!depth) { end = im.index; break; }
        }
        if (end < 0) throw new Error(`prvek <${name}> s ${text ? text[0] : rich[0]} nemá konec`);
        const before = html.slice(pos, end);
        const after = text ? escText(t(text[1])) : htmlText(t(rich[1]));
        if (text && /</.test(before)) throw new Error(`prvek s data-i18n="${text[1]}" má v sobě značky; použij data-i18n-html`);
        note(text ? text[1] : rich[1], before, after);
        out += after;
        pos = end;
        openRe.lastIndex = end;
    }
    out += html.slice(pos);

    // hlavička
    const title = t('page_title'), desc = t('meta_desc');
    const head = [
        [/(<title>)([^<]*)(<\/title>)/, title, 'title'],
        [/(<meta name="description" content=")([^"]*)(">)/, desc, 'meta description'],
        [/(<meta property="og:title" content=")([^"]*)(">)/, title, 'og:title'],
        [/(<meta property="og:description" content=")([^"]*)(">)/, desc, 'og:description'],
    ];
    for (const [re, value, what] of head) {
        if (!re.test(out)) throw new Error(`v hlavičce chybí ${what}`);
        out = out.replace(re, (_, a, old, c) => { const v = what === 'title' ? escText(value) : escAttr(value); note(what, old, v); return a + v + c; });
    }
    return { out, changes };
}

const t = loadDictionary();
const html = fs.readFileSync(htmlPath, 'utf8');
const { out, changes } = sync(html, t);
if (check) {
    if (changes) { console.error(`index.html se liší od slovníku na ${changes} místech. Spusť: node tools/sync-static.js`); process.exit(1); }
    console.log('index.html odpovídá slovníku.');
} else if (out !== html) {
    fs.writeFileSync(htmlPath, out);
    console.log(`index.html: přepsáno ${changes} míst podle slovníku.`);
} else {
    console.log('index.html odpovídá slovníku, není co měnit.');
}
