# Deník právních rozhodnutí

Krátký přehled, z čeho právní kontroly webu vycházejí. Před každou kontrolou ho
přečti a porovnej s kódem. Co nesedí, oprav ve stejném PR.

Podrobný checklist po bodech je v [`PRAVNI-KONTROLA.md`](../PRAVNI-KONTROLA.md).
Tohle není právní rada. Podmínky a zásady má před spuštěním prodeje projít advokát.

- **Naposledy zkontrolováno:** 22. 11. 2026 (celý web na `main`, commit 8a26619)

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
- **Obrázky produktů:** rendery sáčků z Blenderu (`img/sacky/`) jsou ilustrační
  a detail to u nich píše. Musí odpovídat skutečnému sáčku a etiketě (§ 5
  zákona o ochraně spotřebitele). Etiketa na renderu se generuje ze stejných
  dat jako informace o potravině na webu.

## Otevřené body a vědomě přijaté mezery

- 22. 11. 2026: na webu chybí měrná cena (§ 13 odst. 4 zákona o cenách).
  Čeká na rozhodnutí.
- 22. 11. 2026: heřmánek a levandule mají v popisu „uklidňující“
  (anglicky „calming“, „soothing“, u medu „soothing“). Václav v listopadu
  2026 řekl zatím nic nemazat. Rozhodne.
- 22. 11. 2026: v podmínkách chybí pravidla pro recenze podle DSA.
- 23. 11. 2026: render Deep Winter je jen na zkoušku. Sáček ještě není vybraný
  a etiketa na renderu nemá provozovatele ani název podle vyhlášky („Ochucený
  černý čaj“). Před spuštěním prodeje opravit, nebo render nahradit fotkou.
- Před spuštěním prodeje (viz checklist): živnost, oznámení SZPI, HACCP
  a šarže, údaje prodávajícího, kontrola advokátem, slovenské překlady
  právních stránek, EKO-KOM, u kosmetiky posudek bezpečnosti a CPNP.
