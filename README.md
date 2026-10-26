# Tease you

Zdrojový kód webu [teaseyou.cz](https://teaseyou.cz) — e-shopu, kde si
zákazník namíchá vlastní čajovou směs ze 6 základů, 9 příchutí a 9 doplňků,
pojmenuje ji a nechá si ji poslat.

Statický web. Žádný framework, žádný build, žádný `npm install`. Tři soubory
dělají všechnu práci: `index.html`, `style.css`, `script.js`. Bylo to
rozhodnutí, ne lenost — web musí jet roky bez údržby závislostí.

Nabídku a objednávky drží [Supabase](https://supabase.com). Ceny, ingredience,
fotky, směsi, dopravu a slevy měníš v administraci na `/admin/`, ne v kódu.
Spojení obstarává `db.js` — malý klient bez knihovny, ve stejném duchu jako
zbytek webu. Jak databázi založit: [`supabase/README.md`](supabase/README.md).

## Spuštění lokálně

Service worker a `fetch()` nefungují přes `file://`, takže je potřeba
skutečný server. Stačí ten, co máš v systému:

```bash
python3 -m http.server 8000
# nebo
npx serve .
```

Pak otevři <http://localhost:8000>.

**Pozor na service worker při vývoji.** Umí ti podstrčit starou verzi
`script.js`. Když změna nejde vidět, otevři DevTools → Application →
Service Workers → *Update on reload*, nebo dej hard reload
(<kbd>Ctrl</kbd>/<kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>R</kbd>).

## Co je potřeba vyplnit, než se dá prodávat

V repozitáři jsou zatím zástupné hodnoty. **Dokud není vyplněný `config.js`
ani `FORMSPREE_ID`, objednávka nikam nedojde** — web běží v testovacím
režimu: objednávku uloží do historie v prohlížeči, ukáže poděkování a napíše
varování do konzole. Nikomu se nic neodešle.

S vyplněným `config.js` se objednávky ukládají do databáze a vidíš je
v administraci. Formspree je pak už jen e-mail navíc.

| Kde | Konstanta | Co to je |
|---|---|---|
| `config.js` | `SUPABASE_URL`, `SUPABASE_ANON_KEY` | Napojení na databázi — viz [`supabase/README.md`](supabase/README.md) |
| `script.js:869` | `FORMSPREE_ID` | ID formuláře na Formspree, kam chodí objednávky |
| `script.js:812` | `PACKETA_API_KEY` | Klíč pro widget výdejních míst Zásilkovny |
| `script.js:872` | `GOPAY_GOID` | ID obchodníka GoPay |
| `script.js:873` | `COMGATE_MERCHANT` | ID obchodníka Comgate |
| `script.js:871` | `PAYMENT_GATEWAY` | Přepnout z `'none'` na `'gopay'` nebo `'comgate'` |
| `index.html` | `telephone` v JSON-LD | Je tam `+420123456789`, což je zjevně placeholder |

## Kde se co mění

S napojenou databází se běžné věci mění v **administraci (`/admin/`)**:
ceny podle gramáže, ingredience (názvy, popisy, barvy, fotky, skladem),
hotové směsi a rychlé volby v mixéru, ceny a zapnutí dopravy, doprava
zdarma od, text lišty nahoře a slevové kódy. Hodnoty ve `script.js` jsou
pak jen záloha pro případ, že databáze neodpoví.

| Chci změnit | Kouknu do |
|---|---|
| Ceny podle gramáže (záloha) | `script.js` — `PRICES` |
| Limit pro dopravu zdarma (záloha) | `script.js` — `FREE_SHIP_THRESHOLD` |
| Slevové kódy bez databáze | `script.js` — `PROMOS` |
| Ingredience a jejich popisy (záloha) | `script.js` — `ING_DATA` |
| Jak web převezme data z databáze | `script.js` — sekce `KATALOG ZE SUPABASE` na konci |
| Otázky a vyhodnocení kvízu | `script.js:2193` — `QUIZ_QUESTIONS`, `QUIZ_BLENDS` |
| Přednastavené mixy (záloha, jinak směsi s rychlou volbou v administraci) | `script.js:2510` — `MIX_PRESETS` |
| Návody na louhování (záloha, jinak u základů v administraci) | `script.js:921` — `BREW` |
| Překlady (CS/EN) | `script.js:9` — `TRANSLATIONS` |

Jazyk se volí podle prohlížeče (`script.js:6`). Čeština je výchozí,
angličtina je fallback.

## Struktura

```
index.html                 Celý web. Všechny "stránky" jsou sekce, přepíná JS.
style.css                  Styly včetně tmavého režimu.
script.js                  Mixér, košík, checkout, kvíz, i18n, data ingrediencí.
config.js                  Adresa a veřejný klíč Supabase.
db.js                      Malý klient pro Supabase (tabulky, přihlášení, fotky).
admin/                     Administrace: objednávky, nabídka, ceny, slevy.
supabase/setup.sql         Celá databáze — tabulky, pravidla přístupu, výchozí data.
supabase/README.md         Jak databázi založit a co v ní je.
sw.js                      Service worker — offline režim a cache.
offline.html               Co se ukáže bez připojení.
404.html                   Nenalezeno.
manifest.json              PWA — instalace na plochu.
email-order-template.html  Šablona e-mailu s objednávkou.
robots.txt  sitemap.xml    Pro vyhledávače.
humans.txt                 Pro lidi.
.well-known/security.txt   Kam nahlásit bezpečnostní chybu.
CNAME  .nojekyll           Konfigurace GitHub Pages.
og-image.*  icon-*.svg     Náhledy pro sociální sítě a ikony.
ClimateCrisis-1979.woff2   Displejové písmo (SIL OFL 1.1).
```

## Nasazení

GitHub Pages z větve `main`. Push do `main` = nasazeno, obvykle do minuty.

Dva soubory, které vypadají zbytečně, ale nejsou:

- **`CNAME`** drží vlastní doménu. Když zmizí, Pages se vrátí na
  `vaseksinkule-svg.github.io/teaseyou` a `teaseyou.cz` přestane fungovat.
- **`.nojekyll`** vypíná Jekyll. Bez něj GitHub Pages zahodí všechno, co
  začíná tečkou nebo podtržítkem — mimo jiné celou složku `.well-known/`,
  takže by `security.txt` nebyl dostupný.

## Co vědomě chybí

Ať se to nemusí objevovat znovu při každé revizi:

- **Žádná Content-Security-Policy.** V HTML je přes sto inline `onclick`
  handlerů, takže by rozumná CSP web okamžitě rozbila. Šlo by to opravit
  přechodem na `addEventListener`, ale je to velký zásah a zatím na něj
  nedošlo.
- **Žádné bezpečnostní hlavičky.** GitHub Pages neumí nastavit vlastní
  HTTP hlavičky. Kdyby to jednou bylo potřeba, znamená to přesun na
  Cloudflare Pages nebo Netlify (pak přibude `_headers`).
- **Žádné automatické testy v repozitáři.** Testuje se ručně v prohlížeči.
  U checkoutu kontroluj obzvlášť pečlivě — tam se chyba projeví až tím, že
  nedorazí objednávka.
- **Žádná analytika.** Záměrně. Proto taky nejsou cookies třetích stran.
- **`404.html` se po 3 sekundách sám přesměruje** na homepage. Pro čtečky
  obrazovky a pomalejší čtenáře to není ideální (WCAG 2.2.1); zatím ponecháno.

## Licence

Není to open source — viz [`LICENSE`](LICENSE). Repozitář je veřejný, aby
bylo vidět, jak je web postavený, a aby šlo nahlásit chybu.

Chyba na webu → [issue](https://github.com/vaseksinkule-svg/teaseyou/issues).
Bezpečnostní problém → [`security.txt`](.well-known/security.txt).
Cokoliv jiného → hello@teaseyou.cz.
