# Changelog

Co se na webu kdy změnilo. Nejnovější nahoře.
Tenhle projekt nemá verze `1.2.3` — je to jeden web, co se průběžně vyvíjí,
takže se řadí podle data.

## Nezveřejněno

### Přidáno (mýdla a balzámy)
- **Mýdla a balzámy na rty** ze stejných surovin jako čaj: sekce na úvodní
  stránce, vlastní stránka a odkazy z ingrediencí („Najdeš i v“) i z detailu
  čaje („Ze stejných surovin“). Zatím se neprodávají, u každého jde nechat
  e-mail a dostat zprávu, až bude k mání.
- V administraci nová záložka Mýdla a balzámy: produkty s fotkou, barvou
  a surovinami z čajů, seznam zájemců s exportem do CSV.
- Databáze: tabulky `craft_products` a `craft_waitlist` a funkce
  `join_craft_waitlist()`. Je potřeba znovu spustit `supabase/setup.sql`.

### Změněno
- **Nový vzhled celého webu, hlavně na telefonu.** Značka zůstává (logo,
  barvy), písmo je nově jen Archivo: nadpisy široké a tučné jako potisk
  na obalu. Místo sklenice je všude kraftový sáček s etiketou, na které je
  jméno směsi a její složení.
- Mixér se ptá na jednu věc na obrazovce: základ, příchuť, doplněk a nakonec
  jméno a velikost. K vybranému základu ukáže, co se k němu hodí. Samostatná
  stránka se souhrnem odpadla, do košíku se jde rovnou z posledního kroku.
- Detail hotové směsi má rovnou vybraných 100 g a cenu na tlačítku.
- Košík má tlačítka − a + místo políčka s číslem, pokladna formulář
  s doplňováním adresy a vlastní kontrolou polí.
- Kvíz jde po otázkách s možností vrátit se zpět, výsledek ukáže sáček.
- Uložené směsi se otevřou v mixéru na posledním kroku. V encyklopedii
  ingrediencí tlačítko „Namíchat s tímhle“ ingredienci rovnou vybere.
- Z encyklopedie zmizely zdravotní přínosy (např. „detox“, „na spánek“).
  U potravin je v EU smí uvádět jen schválená tvrzení.

### Odstraněno
- `legacy.css` a starý vzhled.

### Přidáno
- **Databáze a administrace.** Ceny, ingredience, hotové směsi, fotky,
  doprava, slevové kódy a objednávky jsou v Supabase a mění se na `/admin/`
  — bez sahání do kódu. Návod v `supabase/README.md`.
- Objednávky se ukládají do databáze. Cenu počítá databáze z ceníku, takže
  podvržená cena z prohlížeče nic nezmění.
- Ingredience jde jedním přepínačem vyprodat. Na webu zůstane vidět, ale
  vybrat ani objednat nejde, a hotové směsi s ní dostanou upozornění.
- Fotky ingrediencí a hotových směsí.
- Web si pamatuje poslední nabídku z databáze. Když databáze neodpoví,
  jede z ní (nebo z vestavěných dat) dál.
- Soubory, které web potřebuje, i když je návštěvník nikdy neuvidí:
  `README.md`, `LICENSE`, `CHANGELOG.md`, `.gitignore`, `.editorconfig`,
  `humans.txt`, `.well-known/security.txt`, `CNAME`, `.nojekyll`.
- `offline.html` — pořádná stránka pro stav bez připojení.

### Opraveno
- **Objednávka se už nepotvrdí, když neodešla.** Odesílalo se stylem
  „vystřel a zapomeň": košík se vyprázdnil a konfety spustily bez ohledu na
  to, jestli Formspree objednávku přijal. Při výpadku sítě nebo vyčerpané
  kvótě zákazník viděl poděkování a majitel se o objednávce nedozvěděl.
  Nově se čeká na odpověď; při chybě zůstane košík plný a zobrazí se hláška.
- **Poškozený localStorage přestal zabíjet obchod.** Stačil jeden nevalidní
  zápis a web sice vykreslil stránku, ale košík i checkout tiše padaly na
  „Cannot access 'cart' before initialization". Zákazník nic nepoznal, jen
  mu nešlo nakoupit. Stav se teď načítá obranně a poškozená data se zahodí.
- **Sleva se ověřuje proti ceníku.** Sazba se brala z localStorage tak, jak
  tam ležela — kdokoliv si mohl v konzoli přepsat `rate` na 0.99 a objednat
  zboží za 597 Kč za necelých šest korun. Teď se z uloženého záznamu bere
  jen kód a sazba se dohledá v `PROMOS`.
- Překlep v promo kódu smazal už uplatněnou platnou slevu.
- Dvojklik na „Dokončit objednávku" mohl objednávku odeslat vícekrát.
- Nedodělaná platební brána vyprázdnila košík a skončila bez potvrzení
  i bez přesměrování. Dokud není napojená, objednávku zastaví nahlas.
- Do košíku se nedala vložit položka bez gramáže za 0 Kč (hlídalo to jen
  `disabled` na tlačítku).
- Cena dopravy zdarma se v české verzi zobrazovala jako „FREE".
- Ceny hotových směsí zůstávaly v anglické verzi česky („od 49 Kč").
- Popisky v checkoutu nebyly propojené s poli (`for`/`id`) — klik na popisek
  nezaostřil pole a čtečky obrazovky je nespárovaly.

### Změněno
- `FORMSPREE_ID` přesunut ke zbytku konfigurace na začátek souboru. Dřív byl
  zahrabaný uvnitř `submitOrder()`.
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
