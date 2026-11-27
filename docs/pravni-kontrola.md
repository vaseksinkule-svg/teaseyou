# Deník právních rozhodnutí

Krátký přehled, z čeho právní kontroly webu vycházejí. Před každou kontrolou ho
přečti a porovnej s kódem. Co nesedí, oprav ve stejném PR.

Podrobný checklist po bodech je v [`PRAVNI-KONTROLA.md`](../PRAVNI-KONTROLA.md).
Tohle není právní rada. Podmínky a zásady má před spuštěním prodeje projít advokát.

- **Naposledy zkontrolováno:** 24. 11. 2026 (větev `suroviny-caje`: fotky čajů v kolečkách surovin)

## Trh a rozhodné právo

- Český e-shop pro spotřebitele (B2C), doručuje do Česka a na Slovensko.
- Platí české právo a právo EU. U zákazníků ze Slovenska i slovenská pravidla
  pro jazyk štítku a informací (viz checklist).
- Provozovatel: fyzická osoba podnikající, neplátce DPH, mikropodnik.

## Údaje o podnikání

- Jméno, IČO a adresa zatím nejsou. Vyplní se v administraci (Nastavení →
  Prodávající) po ohlášení živnosti. Dokud chybí, databáze nedovolí spustit
  prodej a web ukazuje „Připravujeme spuštění“.
- Kontakt: hello@teaseyou.cz. Doména teaseyou.cz, pošta u Zoneru.

## Osobní údaje a kde leží

| Co | Údaje | Kde | Jak dlouho |
|---|---|---|---|
| Objednávky | jméno, e-mail, telefon, adresa nebo výdejní místo, obsah, poznámka, vzkaz k dárku, slevový kód, znění podmínek | Supabase (EU, Irsko) | kontakty 5 let, zbytek nejdéle 10 let |
| Odstoupení | číslo objednávky, jméno, e-mail, co se vrací, číslo účtu, poznámka | Supabase | 10 let |
| Upozornění na mýdla a balzámy | e-mail, produkt (souhlas) | Supabase | do odeslání, nejdéle 2 roky |
| Recenze | jméno nebo přezdívka, hodnocení, text, číslo objednávky. E-mail jen k ověření, neukládá se | Supabase | do odvolání, neschválené 6 měsíců |
| Žádosti o osobní údaje | e-mail, druh žádosti, vyřízení | Supabase | 5 let |
| Noční zálohy databáze | vše výše | GitHub Actions, šifrované | 30 dní |
| Prohlížeč zákazníka | košík, uložené směsi, Moje objednávky, jazyk, vzhled | localStorage, nikam se neposílá | dokud je zákazník nesmaže |

Mazání po lhůtách dělá `purge_expired_data()` při každém přihlášení do
administrace. Žádosti o přístup a výmaz řeší záložka *Osobní údaje* v administraci.

## Služby třetích stran

- **GitHub Pages:** hosting webu, technické záznamy o návštěvách.
- **GitHub Actions:** noční zálohy (zašifrované heslem, které GitHub nezná).
- **Supabase:** databáze, fotky, přihlášení správce. Zpracovatel, smlouva
  o zpracování je součást jejích podmínek. Region eu-west-1.
- **Zásilkovna, Česká pošta, DPD:** dopravci, samostatní správci. Mapa
  Zásilkovny se načte až po kliknutí.
- Žádná analytika, pixely ani reklamní kódy. Písma jsou na našem serveru.

## Souhlas s cookies

- Lišta není. Web si ukládá jen to, o co zákazník sám požádá (§ 89 odst. 3
  zákona č. 127/2005 Sb.). Přehled je na stránce Cookies.
- Kdyby přibyla analytika nebo reklama, lišta se souhlasem je povinná.

## Právní stránky

- Obchodní podmínky: `?stranka=obchodni-podminky` (znění 9. 11. 2026)
- Odstoupení od smlouvy: `?stranka=odstoupeni` (tlačítko a vzorový formulář)
- Ochrana osobních údajů: `?stranka=ochrana-udaju` (znění 9. 11. 2026)
- Cookies: `?stranka=cookies`
- Licence: `THIRD-PARTY-LICENSES.txt`, `fonts/OFL.txt`

## Výklad, ze kterého vycházíme

- **Odstoupení:** hotové směsi 14 dní, jen v neporušeném sáčku (§ 1837
  písm. g) OZ, v aktuálním znění „zboží v zapečetěném obalu“). Směsi na míru bez
  odstoupení (§ 1837 písm. d) OZ).
- **Přístupnost:** zákon č. 424/2023 Sb. se na služby mikropodniku nepoužije
  (§ 2 odst. 3 písm. a)). WCAG držíme dobrovolně.
- **Spory:** mimosoudně u ČOI. Platforma ODR skončila 20. 7. 2025 (nařízení
  (EU) 2024/3228), odkaz na ni na webu není a nemá být.
- **Recenze:** pro ně jsme nejspíš hostingová služba podle DSA (nařízení
  (EU) 2022/2065, čl. 11, 12, 14, 16 a 17). Online platformou nejsme,
  prodáváme jen vlastní zboží.
- **Tvrzení o čajích:** prodáváme podle chuti a chvíle dne, ne podle účinků
  na zdraví (nařízení (ES) č. 1924/2006, čl. 10).
- **Obrázky produktů:** rendery sáčku s plochým dnem z Blenderu
  (`img/sacky-dno/`, všech 14 hotových směsí a prázdný sáček pro vlastní
  směs, na který web kreslí etiketu) a scény sáčku s hromádkami surovin
  (`img/sceny-dno/`, úvod a detail) jsou ilustrační a detail to u nich píše. Musí odpovídat
  skutečnému sáčku, etiketě a surovinám (§ 5 zákona o ochraně spotřebitele;
  u potravin i obrázky a vzhled podle nařízení (EU) č. 1169/2011, čl. 7
  odst. 1 a 4). Datum, šarže a trvanlivost na renderu jsou ukázkové.
  Hromádky ve scéně jsou větší, než kolik suroviny je v sáčku, ukazují jen,
  co v něm je; podíly jsou v textu vedle.
- **Fotky surovin:** v kolečkách a v pohledu Suroviny (detail a mixér) jsou
  vlastní rendery z Blenderu (`img/suroviny/`, všech 25 surovin). Ukazují
  typický vzhled podle fotek běžných druhů nakrájených do směsí (Ceylon OP,
  China Sencha, Pai Mu Tan, Tie Guan Yin; jahody a maliny sušené mrazem;
  kardamom jako zelené tobolky s pár semeny), ne konkrétní šarži. Kolečka
  i hromádky jsou dekorace, název suroviny a podíl jsou v textu.
  Pohled Suroviny má popisek „Ilustrační vizualizace surovin“.
- **Ceny a akce na webu:** u hotové směsi je cena vybrané velikosti pod
  názvem i v tlačítku Do košíku, v mixéru je u prémiové suroviny příplatek
  rovnou v korunách („+25 Kč/100 g“). Konečná cena s dopravou je v pokladně
  před odesláním (§ 12 zákona o ochraně spotřebitele, § 13 zákona o cenách).
  „Od 49 Kč“ u scény na úvodu je nejnižší cena té směsi (50 g). Na telefonu
  ukazuje akční lišta jen první větu textu z administrace, slevový kód je
  v košíku pod „Mám slevový kód“ a na počítači v liště celý.
- **Etiketa sáčku:** texty generuje `tools/rendery/etikety.py` ze stejných dat
  jako informace o potravině na webu (název podle vyhlášky 187/2023 Sb.,
  složení s procenty, alergeny, příprava, trvanlivost, skladování,
  provozovatel). Šablona `tools/rendery/etiketa.html` počítá s etiketou
  88 × 120 mm na sáčku 100 g: malá písmena povinných údajů aspoň 1,2 mm
  (nařízení (EU) č. 1169/2011, čl. 13 odst. 2 a příloha IV), číslice „100 g“
  aspoň 3 mm (vyhláška č. 328/2000 Sb., příloha 1 bod 3.1.3), název
  a hmotnost na stejné straně (čl. 13 odst. 5), šarže (směrnice 2011/91/EU).
  Při jiné velikosti etikety velikosti písma znovu ověřit.

## Otevřené body a vědomě přijaté mezery

- 22. 11. 2026: na webu chybí měrná cena (§ 13 odst. 4 zákona o cenách).
  Čeká na rozhodnutí.
- 22. 11. 2026: heřmánek a levandule mají v popisu „uklidňující“
  (anglicky „calming“, „soothing“, u medu „soothing“). Václav v listopadu
  2026 řekl zatím nic nemazat. Rozhodne.
- 22. 11. 2026: v podmínkách chybí pravidla pro recenze podle DSA.
- 24. 11. 2026: fotky surovin jsou ilustrační rendery. Až budou vybraní
  dodavatelé, porovnat se skutečnou surovinou (hlavně druh zeleného čaje
  a oolongu) a případně nahradit fotkami (§ 5 zákona o ochraně spotřebitele).
- 25. 11. 2026: rendery jahody a maliny ukazují sušení mrazem (světlé,
  pórovité kousky). Kdyby dodavatel dodal jinak sušené (tmavší, gumovité),
  upravit render (nařízení (EU) č. 1169/2011, čl. 7 odst. 1 písm. a)
  a odst. 4: způsob výroby, vzhled).
- 25. 11. 2026: kardamom má na etiketě „kardamom (semeno)“, render ukazuje
  hlavně zelené tobolky. Až bude jasné, jestli půjdou do směsí celé
  tobolky, nebo jen semena, srovnat název na etiketě a render.
- 27. 11. 2026: vybraný typ sáčku je kraftový sáček s plochým dnem a zipem
  (22pack, 300 / 750 / 1500 ml pro 50 / 100 / 250 g), vzorky jsou objednané.
  Rendery jsou podle rozměrů od dodavatele, ne podle vzorku; popisek
  „Ilustrační vizualizace balení 100 g“ zůstává. Až vzorky dorazí, doladit
  tvar a barvu, nebo rendery nahradit fotkami (§ 5 zákona o ochraně
  spotřebitele). U dodavatele vyžádat prohlášení o shodě pro styk
  s potravinami (nařízení (EU) č. 10/2011, čl. 15) a skladbu vrstev kvůli
  EKO-KOM.
- 23. 11. 2026: na etiketě chybí jméno a adresa provozovatele (nařízení
  (EU) č. 1169/2011, čl. 9 odst. 1 písm. h)), zatím jen „Tease you ·
  teaseyou.cz“. Po vyplnění v administraci (Nastavení → Prodávající) znovu
  spustit `etikety.py` a `blender_dno_rendery.py`. Skutečné etikety bez adresy
  tisknout nejde.
- Před spuštěním prodeje (viz checklist): živnost, oznámení SZPI, HACCP
  a šarže, údaje prodávajícího, kontrola advokátem, slovenské překlady
  právních stránek, EKO-KOM, u kosmetiky posudek bezpečnosti a CPNP.
