# Changelog

Co se na webu kdy změnilo. Nejnovější nahoře.
Tenhle projekt nemá verze `1.2.3` — je to jeden web, co se průběžně vyvíjí,
takže se řadí podle data.

## Nezveřejněno

### Přidáno (věci, které mají konkurenční e-shopy)
- **Tlačítko Zpět funguje.** Každá stránka a hotová směs má vlastní adresu
  (`?stranka=kviz`, `?smes=deep_winter`, jazyk `&lang=sk`). Zpět se vrátí i na
  místo, kde zákazník na úvodu byl. Titulky, popisy a jazykové verze pro
  Google, `sitemap.xml` se všemi stránkami a směsmi ve třech jazycích.
- **QR platba.** Po objednávce převodem web ukáže číslo účtu, částku,
  variabilní symbol a QR kód pro bankovní aplikaci (i v Moje objednávky).
  Účet se zadává v administraci (číslo účtu nebo IBAN, web ho zkontroluje).
- **Objednat znovu** v Moje objednávky: položky zpátky do košíku s dnešní
  cenou, co už nejde (vyprodané), vynechá.
- **Dárkové balení se vzkazem** v pokladně a **osobní odběr**. Obojí se
  zapíná a nastavuje v administraci, výchozí je vypnuto.
- **Recenze ověřené nákupem.** Hodnotit jde z Moje objednávky po odeslání
  (ověří se číslo objednávky a e-mail). Na web jdou po schválení
  v administraci, s průměrem na úvodu a u hotové směsi, s odpovědí obchodu
  a s informací, jak recenze ověřujeme.
- Administrace: záložka Recenze, u objednávky tlačítko **Napsat potvrzení
  objednávky** (hotový e-mail v jazyce zákazníka, u převodu s údaji k platbě),
  dárek a osobní odběr viditelně v detailu i v seznamu.
- Obchodní podmínky a zásady ochrany údajů doplněné o QR platbu, osobní
  odběr, dárek a recenze (znění z 9. 11. 2026).
- **Nákup: u každé suroviny, od koho ji koupit.** 41 nabídek podle sortimentu
  na webech dodavatelů (Herbona 19 surovin, čaje a kůry u Wollenhauptu,
  Alveusu a Zeleného Draka, u Wollenhauptu a Alveusu i čísla položek).
  Ceny prázdné, doplní se z ceníku. Poznámka u nabídky je vidět v seznamu.

### Změněno
- Máta klasnatá → **máta kadeřavá** (Herbona prodává kadeřavou). Název,
  složení na etiketě („máta kadeřavá (list)“, slovensky „mäta kučeravá“),
  popis směsi Open Air a balzámu. Kód suroviny zůstává `Spearmint`.

### Přidáno (slovenština a výběr jazyka)
- Výběr jazyka **CZ / SK / EN** v hlavičce a v patičce. Volba se pamatuje;
  bez ní web pozná jazyk z prohlížeče (slovenský prohlížeč dřív dostal angličtinu).
- Po přepnutí se web vrátí tam, kde zákazník byl: rozdělaná směs v mixéru
  (suroviny, díly, krok, název, velikost) i otevřená hotová směs zůstanou.
- Celý web slovensky (`i18n-sk.js`), včetně informací o potravině: „Ochutený
  zelený čaj“, složení „zelený čaj 60 %, mäta pieporná (list) 20 %…“.
- Slovenské názvy, popisy, chutě a složení surovin, popisy směsí, mýdla a lišta
  v administraci (prázdné = česky). Objednávka a zájemce si pamatují `sk`.
- Administrace u objednávky na Slovensko ukáže text na štítek slovensky.
- Obchodní podmínky, ochrana údajů, odstoupení a cookies zůstávají česky;
  ve slovenštině a angličtině mají nahoře poznámku, že jsou česky.
- Mapa Zásilkovny se otevře v jazyce webu a pro zemi z adresy.

### Opraveno (překlady)
- Anglický web ukazoval české názvy ve složení a druh čaje („Ochucený…“),
  teď „Flavoured green tea“, „green tea 60 %“. Upozornění na kofein u bylinného
  čaje s pravým čajem chybělo v angličtině.
- Popisky pro čtečky obrazovky, data a gramy podle jazyka; opravené anglické
  věty v úvodu, kvízu a FAQ; odstraněno 128 nepoužívaných překladů.
- Na nejužších telefonech se logo nedotýká výběru jazyka.

### Změněno (ikonky surovin)
- Místo barevných koleček s tečkami má každá surovina jednoduchou kreslenou
  ikonku (`icons.js`) na světlém podkladu v barvě suroviny: v mixéru, v panelu
  směsi, na etiketě sáčku, v encyklopedii, na detailu směsi i v adminu.
- Admin, Ingredience → **Ikonka**: nahraješ vlastní (PNG nebo SVG s průhledným
  pozadím). Uloží se jako PNG 512 px, nic se neořezává, SVG se převede na PNG.
  „Vrátit vestavěnou“ ji zase odebere. Nový sloupec `ingredients.icon_url`.
- Všechno kreslí jedna funkce (`ingIconHtml`), takže výměna platí všude najednou.

### Změněno (mixér: víc surovin, díly, gramy)
- V každém kroku jde vybrat víc věcí, dohromady až **5 surovin**. Klik už sám
  nepřeskočí na další krok; nepovinné kroky (příchuť, doplněk) jdou **přeskočit**.
- Nový panel **Tvoje směs**: ke každé surovině díly 1–3 (−/+), podíl v %, gramy
  pro vybranou velikost (50 / 100 / 250 g), pruh s poměrem, kolik šálků to dá
  a jestli je to podle vyhlášky ochucený, bylinný, nebo ovocný čaj.
- Hlídá limity z přílohy 1 vyhlášky 187/2023 Sb. (citronová a pomerančová kůra,
  citronová tráva, zázvor, skořice nejvýš 30 %). Levandule a kardamom jsou
  „špetka“ s pevnými 4 %. Směs bez druhu (žádná skupina přes polovinu) nejde
  objednat a mixér poradí, co změnit.
- **Prémiové suroviny** (bílý čaj, oolong, růže, jahody, maliny, kardamom) mají
  příplatek za 100 g podle toho, kolik jich v sáčku je. Částky se mění v adminu.
- Jeden výpočet receptury: `recipe.js` na webu i v adminu a stejný
  `recipe_eval()` v databázi; `place_order()` ho použije pro kontrolu i cenu
  a k objednávce uloží díly, procenta a gramy na míchání.
- Staré košíky, uložené směsi a sdílené odkazy fungují dál (díly 3 + 1 + 1).
- Rychlý start z hotové směsi v kroku 1 (směsi označené „Rychlá volba v mixéru“).
- Kvíz bere složení z hotových směsí v katalogu.
- Opraveno: jméno směsi ze sdíleného odkazu se v hlášce vykreslilo jako HTML.

### Změněno (sortiment, katalog v2)
- Suroviny podle toho, co jde běžně koupit u dodavatelů (Herbona, Wollenhaupt,
  Alveus, Zelený Drak) a co povoluje příloha 1 vyhlášky. Nově meduňka, lípa,
  jablko, ibišek, citronová tráva a fenykl; máta peprná je základ, „Pomeranč“
  a „Citron“ jsou poctivě kůra. Med, vanilka, kakao, kokos a kurkuma se skryly
  (zůstávají kvůli starým objednávkám).
- Hotové směsi mají nové složení s díly (Still Evening je teď bylinná bez
  kofeinu, Slow Tuesday ovocná).
- `setup.sql` převede katalog jednou (`settings.catalog_version` = 2), další běhy
  úpravy z administrace nepřepíšou. V Nákupu přibyli noví dodavatelé a suroviny.
- Admin: editor směsi s až 5 surovinami a díly a s kontrolou podle vyhlášky,
  příplatek u ingredience, gramy na míchání u objednávky, kalkulačka nákladů
  s díly. Pevná receptura 70/20/10 z nastavení zmizela.

### Změněno (náhled pro sdílení)
- Nový `og-image.jpg` podle současného designu: zelený pás, nadpis v Unbounded
  a dva sáčky přímo z webu. Starý `og-image.svg` (patkové písmo) pryč.
- Doplněné `og:image:width/height/alt`, `og:site_name`, `og:locale` a `twitter:image`;
  adresa obrázku má `?v=2`, ať sociální sítě nenechají v mezipaměti ten starý.

### Změněno (ikonky)
- Nové ikonky podle současného designu: „T“ z písma Unbounded. E-shop má zelený
  čtverec se světlým T, administrace kraft se tmavým T, aby šly odlišit v panelech.
- favicon.ico (16/32/48) pro Safari a starší prohlížeče, favicon.svg, ikonka pro
  iPhone (180 px), pro Android 192/512 px a maskovatelnou 512 px; staré SVG pryč.
- Stránka 404 bere styly a ikonky z kořene webu, ať funguje na jakékoli adrese.

### Změněno
- Zásady ochrany osobních údajů: databáze Supabase běží v Irsku (region eu-west-1).

### Přidáno (režim před spuštěním prodeje)
- Dokud prodej neběží, web ukazuje lištu **„Připravujeme spuštění“**, košík a pokladna
  objednat nedovolí a databáze (`place_order`) objednávku odmítne (`sales_closed`).
  Míchat a ukládat směsi jde dál.
- Administrace: v *Ceny a doprava* panel **Prodej** se spuštěním (opsat SPUSTIT)
  a zastavením, nahoře štítek *Prodej vypnutý* / *Prodej běží*.
- Databáze: `settings.sales_open` (výchozí vypnuto) a `sales_opened_at`. Zapnout jde
  jen s vyplněným jménem, IČO, adresou a e-mailem prodávajícího. Den prvního spuštění
  je v podmínkách jako „platné od“.
- Úkol v administraci: spustit prodej, až bude živnost, SZPI, e-mail a kontrola podmínek.

### Opraveno
- Obnova zálohy ze starší verze (bez nově přidaných sloupců) selhala na řádku
  nastavení. Teď se obnoví jen sloupce, které záloha má.

### Přidáno (noční záloha)
- **Noční záloha na GitHubu** (`.github/workflows/zaloha.yml`): každou noc databáze
  i fotky, zašifrované heslem (AES-256-GCM), uložené na 30 dní. Když selže, přijde e-mail.
- Databáze: `backup_snapshot()`, role `teaseyou_backup`, která umí jen zálohovat,
  a `reset_backup_password()` na nové náhodné heslo pro ni.
- Administrace otevře i noční zálohu: rovnou .zip z GitHubu, po zadání hesla.
- Zásady ochrany osobních údajů zmiňují noční zálohy u GitHubu (znění ze 7. 11. 2026).

### Opraveno
- Náhled obnovy spadl, když se během načítání vybral jiný soubor.

### Přidáno (ochrana před ztrátou dat)
- **Zálohy a koš** v administraci: stažení zálohy jedním kliknutím (databáze i fotky
  v jednom souboru), obnova se zkušebním náhledem a opsáním OBNOVIT, koš na 30 dní
  s informací, kdo co smazal.
- Upozornění, když záloha chybí nebo je starší než 7 dní.
- Štítek **Ostrý provoz** / **Testovací prostředí** v administraci (podle `config.js`).
- Smazání dodavatele či suroviny s nabídkami a produktu se zájemci chce opsat název.
- Databáze: koš, limit hromadného mazání, zákaz mazání objednávek, nastavení,
  odstoupení a žádostí, funkce pro zálohu a obnovu.
- `ZALOHY-A-OBNOVA.md`: všech 20 opatření a postup obnovy.

### Přidáno (kontrola podle checklistu)
- **Tlačítko „Odstoupit od smlouvy“** (zákon č. 159/2026 Sb., od 1. 1. 2027): na stránce
  Odstoupení i u každé objednávky v Moje objednávky, druhý krok „Potvrdit odstoupení od
  smlouvy“, hned potvrzení s datem a časem. V administraci nová záložka **Odstoupení**
  s připraveným potvrzovacím e-mailem a stavy.
- **Záložka Osobní údaje** v administraci: najde vše k e-mailu, stáhne kopii, smaže
  z upozornění a zapíše žádost (odpověď do měsíce).
- **Automatický úklid osobních údajů** při přihlášení do administrace podle lhůt v zásadách.
- U objednávky se ukládá **znění obchodních podmínek**, se kterým zákazník souhlasil.
- `PRAVNI-KONTROLA.md`: všech 35 bodů checklistu s českými předpisy a stavem.
- `THIRD-PARTY-LICENSES.txt` a odkaz v patičce (písma, ikony).
- Odkaz „Přeskočit na obsah“.

### Změněno (kontrola podle checklistu)
- Platba v pokladně není předvybraná (dobírka stojí víc, musí ji zvolit zákazník).
- Doprava je v pokladně před adresou. U výdejního místa Zásilkovny se adresa nechce.
- Věta o podmínkách je těsně nad tlačítkem Objednat a zaplatit.
- Zásady ochrany osobních údajů: pověřenec, odstoupení, žádosti, technické záznamy,
  přesné lhůty, zabezpečení, změny a znění. Podmínky popisují online odstoupení.
- Pryč nepodložená tvrzení: „500+ kombinací“, „certifikovaní dodavatelé“, „žádné šarže“,
  „bez umělých aromatizátorů“, „ve stejný den“, vymyšlený telefon ve strukturovaných datech.
  Termíny odeslání jsou „obvykle do 24 hodin“.
- Přístupnost: tlačítka ingrediencí a menu bez chybných rolí, lepší kontrast poznámky
  v úvodu, přehled zpracování údajů na telefonu jako karty.

### Přidáno (právní věci)
- **Obchodní podmínky, reklamace, ochrana osobních údajů a cookies** sepsané
  nanovo podle toho, jak e-shop opravdu funguje. Nová stránka **Odstoupení od
  smlouvy** se vzorovým formulářem (e-mail nebo tisk).
- **Údaje o prodávajícím** (jméno, IČO, sídlo, telefon, e-mail) se vyplňují
  v administraci a web je dosadí do podmínek, patičky i na etiketu. Dokud
  chybí, je vidět „[doplnit]“.
- **Informace o potravině** u každé směsi: na detailu, v posledním kroku
  mixéru a v košíku. Název podle vyhlášky 187/2023 Sb. (ochucený, bylinný
  nebo ovocný čaj), složení s procenty, alergeny, hmotnost, trvanlivost,
  skladování, příprava a výrobce. Levandule, kurkuma a kardamom nejvýš 5 %.
- **Úkoly v administraci** s úředními kroky před spuštěním prodeje.

### Změněno
- Tlačítko v pokladně je **„Objednat a zaplatit“** a nad ním je poučení, že
  směsi na míru nejde vrátit bez udání důvodu.
- **Příplatek za dobírku** se opravdu připočítá do ceny (dřív ho web jen
  sliboval). Výši nastavíš v administraci.
- **Platba kartou** zmizela z nabídky, dokud nebude napojená platební brána.
- **Písma** jsou uložená přímo na webu, nic se nenačítá z Googlu.
  **Mapa Zásilkovny** se stáhne až po kliknutí na výběr výdejního místa.
- FAQ: opravené odpovědi o alergenech, vracení a trvanlivosti.
- Stránka po objednávce už neslibuje potvrzovací e-mail, dokud se neposílá.

### Odebráno
- **Cookie lišta:** web nic nesleduje, takže souhlas není potřeba.
- **Přihlášení k newsletteru** v patičce: hlásilo „jsi přihlášený“, ale nic
  neukládalo.
- **Zdravotní tvrzení** (antioxidanty a podobně) z webu.
- Nepoužívané písmo Climate Crisis.

### Změněno (písma a úvod)
- **Nová písma na celém webu i v administraci:** nadpisy a logo v Unbounded,
  text v Albert Sans. Climate Crisis a Archivo jsou pryč.
- **Úvod celý v zelené:** nadpis „namíchej si“ je světlý na tmavě zeleném
  pásu přes celou šířku, sáček stojí pod ním. Zbytek stránky zůstává světlý.
- **Srovnaná horní lišta:** na počítači logo vlevo, menu uprostřed, ikony
  vpravo. Nadpisy na podstránkách jsou o něco menší a vyrovnané.
- Service worker v6, aby se nová písma načetla hned.

### Přidáno (nákup)
- **Záložka Nákup v administraci:** dodavatelé se stavem jednání
  (najít, osloveno, vzorky, testujeme, schválený, zamítnutý), suroviny
  s poznámkami a zdroji, nabídky s přepočtem na kilo a porovnáním,
  úkoly s termínem a kalkulačka nákladů a marže na sáček.
- Předvyplněné suroviny (24 z obchodu a 7 na mýdla a balzámy) a sedm tipů
  na dodavatele k prověření.
- Databáze: tabulky `purchase_*`, jen pro admina. Je potřeba znovu spustit
  `supabase/setup.sql`.

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
