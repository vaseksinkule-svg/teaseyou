#!/usr/bin/env python3
"""Náhled pro sdílení og-image.jpg (1200 × 630 px) z textů úvodu a renderů sáčků.

    python3 tools/og_obrazek.py [vlevo-slug] [vpravo-slug]
    výchozí: still-evening a morning-window z img/sacky-dno/

Potřebuje Playwright (Chromium). Písma a barvy jsou stejné jako na webu.
Po změně zvyš ?v= u og:image v index.html, ať sítě načtou nový obrázek.
"""
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]

HTML = """<!doctype html><html lang="cs"><head><meta charset="utf-8"><style>
@font-face {{ font-family: Unbounded; font-weight: 600 700; src: url(fonts/unbounded-latin-600-700.woff2) format('woff2'); }}
@font-face {{ font-family: Unbounded; font-weight: 600 700; src: url(fonts/unbounded-cs-sk-600-700.woff2) format('woff2');
  unicode-range: U+010C-010F, U+011A-011B, U+0139-013A, U+013D-013E, U+0147-0148, U+0154-0155, U+0158-0159, U+0160-0161, U+0164-0165, U+016E-016F, U+017D-017E; }}
@font-face {{ font-family: 'Albert Sans'; font-weight: 400 700; src: url(fonts/albert-sans-latin-400-700.woff2) format('woff2'); }}
@font-face {{ font-family: 'Albert Sans'; font-weight: 400 700; src: url(fonts/albert-sans-cs-sk-400-700.woff2) format('woff2');
  unicode-range: U+010C-010F, U+011A-011B, U+0139-013A, U+013D-013E, U+0147-0148, U+0154-0155, U+0158-0159, U+0160-0161, U+0164-0165, U+016E-016F, U+017D-017E; }}
* {{ margin: 0; box-sizing: border-box; }}
body {{ width: 1200px; height: 630px; overflow: hidden; background: #3a5f3c; color: #f5f1e9; font-family: 'Albert Sans', sans-serif; position: relative; }}
.logo {{ position: absolute; left: 72px; top: 60px; font: 700 30px/1 Unbounded; letter-spacing: -.035em; }}
h1 {{ position: absolute; left: 72px; top: 180px; width: 560px; font: 700 56px/1.04 Unbounded; letter-spacing: -.04em; }}
p {{ position: absolute; left: 72px; top: 330px; width: 520px; font: 400 25px/1.42 'Albert Sans'; color: #e7e2d6; }}
.url {{ position: absolute; left: 72px; bottom: 56px; font: 600 24px/1 'Albert Sans'; color: #e9c98f; }}
.sacky {{ position: absolute; right: 40px; bottom: 34px; width: 560px; height: 560px; }}
.sacky img {{ position: absolute; bottom: 0; height: auto; filter: drop-shadow(0 18px 18px rgba(10, 25, 12, .35)); }}
.vlevo {{ left: 40px; width: 272px; bottom: 26px !important; }}
.vpravo {{ right: 0; width: 330px; }}
</style></head><body>
<div class="logo">Tease you</div>
<h1>Namíchej si čaj. Pojmenuj ho.</h1>
<p>Vyber až pět surovin a&nbsp;poměr, jaký chceš. Směs namícháme až po objednání a&nbsp;pošleme ti ji v&nbsp;sáčku se jménem, které jí dáš.</p>
<div class="url">teaseyou.cz</div>
<div class="sacky">
  <img class="vlevo" src="img/sacky-dno/{vlevo}-960.webp" alt="">
  <img class="vpravo" src="img/sacky-dno/{vpravo}-960.webp" alt="">
</div>
</body></html>"""


def main():
    vlevo = sys.argv[1] if len(sys.argv) > 1 else 'still-evening'
    vpravo = sys.argv[2] if len(sys.argv) > 2 else 'morning-window'
    tmp = ROOT / '_og.html'
    tmp.write_text(HTML.format(vlevo=vlevo, vpravo=vpravo), encoding='utf-8')
    try:
        with sync_playwright() as p:
            br = p.chromium.launch()
            pg = br.new_page(viewport={'width': 1200, 'height': 630}, device_scale_factor=1)
            pg.goto(tmp.as_uri(), wait_until='load')
            pg.evaluate('document.fonts.ready')
            pg.wait_for_timeout(300)
            pg.screenshot(path=str(ROOT / 'og-image.jpg'), type='jpeg', quality=88)
            br.close()
    finally:
        tmp.unlink()
    print(ROOT / 'og-image.jpg')


if __name__ == '__main__':
    main()
