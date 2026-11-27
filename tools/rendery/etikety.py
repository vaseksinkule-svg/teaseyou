#!/usr/bin/env python3
"""Etikety sáčků ze stejných dat jako web.

Texty bere přímo z webu: otevře index.html v prohlížeči (bez databáze, takže
platí vestavěné BUILTIN_BLENDS) a zeptá se funkcí, které web používá pro
informace o potravině: foodInfo (název podle vyhlášky 187/2023 Sb., složení
s procenty, alergeny), brewFor (příprava), MOMENT_COLOR, překlady a SELLER.
Šablona je tools/rendery/etiketa.html, ručně se v etiketách nic nepřepisuje.

Hotové směsi (všech 14, nebo jen vybrané):
    python3 tools/rendery/etikety.py hotove VYSTUP [--jen deep_winter,still_evening]
Vlastní směs (jméno a suroviny v dílech, kódy jako na webu):
    python3 tools/rendery/etikety.py vlastni VYSTUP "Pátek po práci" "Rooibos:2,Orange:1,Cinnamon:1" [--cislo 0427]
Prázdná etiketa vlastní směsi (podklad pro web):
    python3 tools/rendery/etikety.py prazdna VYSTUP

Volby: --datum 2026-11-23 (den míchání, výchozí dnes), --gramaz "250 g" (výchozí 100 g).

Do VYSTUP uloží pro každou etiketu:
  etiketa_<id>.png        samotná etiketa 1408 × 1920 px (88 × 120 mm, 16 px/mm)
  textura_<id>.png        celá přední strana sáčku 2080 × 3360 px s průhledným
                          okolím, jde rovnou do Blenderu místo tex/front_label.png
  etiketa_<id>.json       data etikety a obdélníky polí (pro živou etiketu na webu)

Potřebuje: Python Playwright s Chromiem a Pillow.
"""
import argparse
import datetime as dt
import functools
import http.server
import json
import re
import sys
import threading
import unicodedata
from pathlib import Path

from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]

# Kde leží etiketa na textuře přední strany (stejně jako v tex/height_front.png).
TEXTURA = (2080, 3360)
ETIKETA_XY = (336, 960)
ETIKETA_PX = (1408, 1920)   # 704 × 960 CSS px při deviceScaleFactor 2

DATA_JS = r"""
(vlastni) => {
  const sel = [SELLER.name, SELLER.address].filter(Boolean).join(', ');
  const one = (id, name, codes, parts, b) => {
    const info = foodInfo(codes, parts);
    if (!info || !info.name) return { id, name, error: 'Směs nejde prodat (chybí druh nebo nesedí limity).' };
    const brew = brewFor(codes, parts);
    const herbalWithTea = info.comp.some(c => c.kind === 'tea') && info.comp.category !== 'tea';
    return {
      id, name,
      moment: b ? b.moment : '',
      momentColor: b ? (MOMENT_COLOR[b.moment] || '') : '',
      momentLabel: b ? t('moment_for_' + b.moment) : '',
      desc: b ? b.desc_cs : '',
      legalName: info.name,
      caffeine: herbalWithTea ? t('food_caffeine') : '',
      comp: info.comp.map(c => ({ code: c.code, label: c.label, pct: c.pct, pinch: !!c.pinch, color: ingColor(c.code) || '#cccccc' })),
      allergens: info.allergens,
      brewTemp: fmtTemp(brew.temp), brewTime: brew.time,
    };
  };
  return {
    lang: LANG,
    blends: BUILTIN_BLENDS.map(b => one(b.id, b.name, b.ingredients, b.parts, b)),
    custom: (vlastni || []).map(v => one(v.id, v.name, v.codes, v.parts, null)),
    durabilityMonths: DURABILITY_MONTHS,
    storageLabel: t('food_storage'), storage: t('food_storage_val'),
    allergensLabel: t('food_allergens'),
    makerLabel: t('food_maker'), maker: sel,
    prepPer: t('food_prep_per'),
    web: location.hostname === '127.0.0.1' ? 'teaseyou.cz' : location.hostname,
  };
}
"""


def server():
    class Tichy(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a):
            pass
    handler = functools.partial(Tichy, directory=str(ROOT))
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), handler)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv


def datum(d: dt.date) -> str:
    return f'{d.day}. {d.month}. {d.year}'


def plus_mesice(d: dt.date, n: int) -> dt.date:
    m = d.month - 1 + n
    y, m = d.year + m // 12, m % 12 + 1
    for den in (d.day, 30, 29, 28):
        try:
            return dt.date(y, m, den)
        except ValueError:
            pass


def prvni_veta(text: str) -> str:
    return re.split(r'(?<=[.!?])\s', text.strip(), maxsplit=1)[0].rstrip('.')


def etiketa(web: dict, b: dict, druh: str, den: dt.date, poradi: int, cislo: str = '', prazdna=False, gramaz: str = '100 g') -> dict:
    """Složí texty jedné etikety z dat webu."""
    trv = plus_mesice(den, web['durabilityMonths'])
    poznamky = []
    if b.get('allergens'):
        poznamky.append(f"{web['allergensLabel']}: {', '.join(b['allergens'])}")
    if b.get('caffeine'):
        poznamky.append(b['caffeine'] + '.')
    sklad = web['storage']
    return {
        'id': b['id'], 'druh': druh, 'prazdna': prazdna,
        'jmeno': b['name'], 'chvile': b.get('momentLabel', ''), 'barva': b.get('momentColor', ''),
        'gramaz': gramaz,
        'pravni': b.get('legalName', ''),
        'popis': prvni_veta(b.get('desc', '')),
        'slozeni': [{'label': c['label'], 'pct': c['pct'], 'barva': c['color']} for c in b.get('comp', [])],
        'teplota': b.get('brewTemp', ''), 'cas': b.get('brewTime', ''),
        'davka': f"2–3 g / 200 ml",
        'namichano': datum(den), 'razitko_datum': datum(den),
        'sarze': f"{den:%y%m%d}-{poradi:02d}",
        'trvanlivost': datum(trv),
        'skladovani': f"{web['storageLabel']}: {sklad[0].upper()}{sklad[1:]}.",
        'poznamky': poznamky,
        'vyrobil_popis': web['makerLabel'] + ':',
        # Dokud nejsou v administraci jméno a adresa, je tu jen značka a web.
        'vyrobil': web['maker'] or f"Tease you · {web['web']}",
        'cislo': f'Směs č. {cislo}' if cislo else '',
    }


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('co', choices=['hotove', 'vlastni', 'prazdna', 'data'])
    ap.add_argument('vystup')
    ap.add_argument('jmeno', nargs='?')
    ap.add_argument('suroviny', nargs='?')
    ap.add_argument('--jen', default='')
    ap.add_argument('--cislo', default='0427')
    ap.add_argument('--datum', default='')
    ap.add_argument('--gramaz', default='100 g', help='hmotnost na etiketě, třeba "50 g" nebo "250 g"')
    a = ap.parse_args()

    den = dt.date.fromisoformat(a.datum) if a.datum else dt.date.today()
    out = Path(a.vystup).expanduser()
    out.mkdir(parents=True, exist_ok=True)

    vlastni = []
    if a.co == 'vlastni':
        if not (a.jmeno and a.suroviny):
            sys.exit('Vlastní směs potřebuje jméno a suroviny, třeba "Rooibos:2,Orange:1".')
        codes, parts = [], []
        for kus in a.suroviny.split(','):
            kod, _, dil = kus.rpartition(':')
            codes.append(kod.strip())
            parts.append(int(dil))
        slug = re.sub(r'[^a-z0-9]+', '-', unicodedata.normalize('NFKD', a.jmeno.lower()).encode('ascii', 'ignore').decode()).strip('-') or 'vlastni'
        vlastni.append({'id': 'vlastni_' + slug, 'name': a.jmeno, 'codes': codes, 'parts': parts})

    srv = server()
    base = f'http://127.0.0.1:{srv.server_address[1]}'
    with sync_playwright() as p:
        br = p.chromium.launch()
        ctx = br.new_context(locale='cs-CZ', device_scale_factor=2, viewport={'width': 760, 'height': 1000})
        # jen místní soubory: bez databáze platí vestavěná data webu
        ctx.route('**/*', lambda r: r.continue_() if r.request.url.startswith(base) else r.abort())
        pg = ctx.new_page()
        pg.goto(f'{base}/index.html?lang=cs', wait_until='load')
        pg.wait_for_function('typeof foodInfo === "function" && typeof BUILTIN_BLENDS !== "undefined"')
        web = pg.evaluate(DATA_JS, vlastni)
        if a.co == 'data':
            (out / 'etikety-data.json').write_text(json.dumps(web, ensure_ascii=False, indent=1))
            print(out / 'etikety-data.json')
            return

        if a.co == 'hotove':
            jen = [x for x in a.jen.split(',') if x]
            seznam = [(b, 'hotova', i + 1) for i, b in enumerate(web['blends']) if not jen or b['id'] in jen]
        elif a.co == 'vlastni':
            seznam = [(web['custom'][0], 'vlastni', 1)]
        else:
            seznam = [({'id': 'vlastni_prazdna', 'name': ''}, 'vlastni', 1)]

        pg.goto(f'{base}/tools/rendery/etiketa.html', wait_until='load')
        for b, druh, poradi in seznam:
            if b.get('error'):
                print(f"{b['id']}: {b['error']}", file=sys.stderr)
                continue
            d = etiketa(web, b, druh, den, poradi, a.cislo, prazdna=(a.co == 'prazdna'), gramaz=a.gramaz)
            pg.evaluate('d => vykresli(d)', d)
            loc = pg.locator('#etiketa')
            png = out / f"etiketa_{b['id']}.png"
            loc.screenshot(path=str(png), omit_background=True)
            # obdélníky polí v px etikety (pro živou etiketu na webu)
            pole = pg.evaluate('''() => {
                const r0 = document.getElementById('etiketa').getBoundingClientRect();
                const box = s => { const e = document.querySelector(s); if (!e) return null;
                    const r = e.getBoundingClientRect();
                    return [r.left - r0.left, r.top - r0.top, r.width, r.height].map(v => Math.round(v * 2)); };
                return { jmeno: box('[data-k="jmeno"]'), pravni: box('.pod') || box('[data-k="pravni"]'),
                         slozeni: box('[data-k="radky"]'), priprava: box('[data-k="priprava"]'), pata: box('[data-k="pata"]') };
            }''')
            lab = Image.open(png).convert('RGBA')
            if lab.size != ETIKETA_PX:
                lab = lab.resize(ETIKETA_PX, Image.LANCZOS)
                lab.save(png)
            tex = Image.new('RGBA', TEXTURA, (0, 0, 0, 0))
            tex.alpha_composite(lab, ETIKETA_XY)
            tex.save(out / f"textura_{b['id']}.png")
            (out / f"etiketa_{b['id']}.json").write_text(json.dumps(
                {'etiketa': d, 'pole_px': pole, 'etiketa_na_texture': [*ETIKETA_XY, *ETIKETA_PX], 'textura': TEXTURA},
                ensure_ascii=False, indent=1))
            print(f"{b['id']}: {d['pravni']} · {', '.join(f'{s['label']} {s['pct']} %' for s in d['slozeni'])}")
        br.close()
    srv.shutdown()


if __name__ == '__main__':
    main()
