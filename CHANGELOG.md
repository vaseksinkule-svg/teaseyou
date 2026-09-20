# Changelog

Co se na webu kdy změnilo. Nejnovější nahoře.
Tenhle projekt nemá verze `1.2.3` — je to jeden web, co se průběžně vyvíjí,
takže se řadí podle data.

## Nezveřejněno

### Přidáno
- Soubory, které web potřebuje, i když je návštěvník nikdy neuvidí:
  `README.md`, `LICENSE`, `CHANGELOG.md`, `.gitignore`, `.editorconfig`,
  `humans.txt`, `.well-known/security.txt`, `CNAME`, `.nojekyll`.
- `offline.html` — pořádná stránka pro stav bez připojení.

### Změněno
- Service worker přepsán. HTML se nově tahá vždycky ze sítě, takže po
  nasazení nikdo nezůstane viset na starém `script.js`. Statika jede
  stale-while-revalidate. Do POST requestů na Formspree ani do widgetu
  Packety už se nepleteme.
- Do precache přibylo lokální písmo a ikony — offline teď vypadá jako web,
  ne jako holý text.

## 2026-06-13

### Přidáno
- Sdílitelné odkazy na namíchaný blend.
- Rychlé presety v mixéru pro lidi, co nechtějí začínat od nuly.
- Kvíz rozšířen na 5 otázek. Nově ukazuje % shody, zdůvodnění výběru
  a druhý nejlepší tip.
- Na mobilu rozbalovací shrnutí mixu s kartami vybraných ingrediencí.

### Opraveno
- Popisky na skleničce se navzájem překrývaly.
- Doplněny chybějící popisy příchutí a doplňků.
- Tagy, párování a benefity přeloženy do češtiny — zbyly tam anglické.

## 2026-06-11 – 2026-06-12

### Přidáno
- Encyklopedie ingrediencí jako samostatná stránka.
- Spodní tabová navigace.
- Košík přežije zavření prohlížeče.
- Stránka o procesu výroby a šablona objednávkového e-mailu.
- PWA: manifest a service worker. Web jde nainstalovat na plochu.
- Výběr způsobu platby.

### Změněno
- Informace o ingredienci se ukazují rovnou u výběru — tooltip při najetí,
  detailní karty vedle skleničky. Samostatný info panel byl navíc, zmizel.
- Přechody mezi stránkami a vylepšený tmavý režim.

## 2026-06-05 – 2026-06-10

### Přidáno
- Právní stránky: obchodní podmínky, GDPR, cookies, reklamace, odstoupení.
- Odesílání objednávek přes Formspree.
- Výdejní místa Zásilkovny přes widget Packety.
- Kvíz na výběr čaje, animace, parallax, konfety po objednávce.
- Dvojjazyčné CS/EN rozhraní s detekcí jazyka prohlížeče.
- `robots.txt`, `sitemap.xml`, `og-image`, strukturovaná data pro Google.
- Stránka 404.
- Promo kódy, doprava zdarma nad limit, historie objednávek, validace formulářů.

### Změněno
- Ceny v korunách.
- Přepsané texty a popisy blendů, aby nezněly jako z generátoru.
- Číslované kroky v checkoutu.

### Opraveno
- Mobilní layout napříč všemi breakpointy.
- Tmavý režim: ceny, patička, prokliky.
- Umístění tlačítka Zpět na detailu produktu a na právních stránkách.
- Přetékající tabulka cookies na mobilu.

## 2026-03-06

- První verze. Jeden HTML soubor jménem `zkouska.html`.
