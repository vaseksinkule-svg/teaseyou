# Zálohy a obnova: ochrana před ztrátou dat

Kontrola podle checklistu „Protect Your App from Data Loss“ (20 opatření), přepočítaná
na Tease you: statický web na GitHub Pages, databáze a fotky v Supabase (bezplatný plán),
jeden nebo dva lidé v administraci.

- **Stav ke dni:** 7. 11. 2026
- **Projít znovu:** se zbytkem v `PRAVNI-KONTROLA.md`, nejpozději 5. 11. 2027
- **Odpovídá:** Václav

Značky: ✅ hotovo · ⏳ zbývá udělat · ➖ netýká se nás (s důvodem)

## Co je potřeba vědět o Supabase

- **Bezplatný plán nemá automatické zálohy.** Supabase doporučuje zálohovat si data sám.
  Denní zálohy (7 dní zpětně) jsou až v placeném plánu Pro, obnova k libovolné minutě
  (PITR) je placený doplněk k Pro.
- **Zálohy databáze nikdy neobsahují fotky** z úložiště. Proto naše záloha fotky přibaluje.
- **Projekt bez návštěv se po 7 dnech uspí.** Web se při každé návštěvě ptá databáze,
  takže to hrozí jen bez provozu. Uspaný projekt jde do roka probudit v dashboardu
  (Resume project), data zůstanou.

## Opatření

| # | Opatření | Stav | Jak to u nás je |
|---|---|---|---|
| 01 | Oddělená testovací a ostrá databáze | ✅ | Testy běží na lokální databázi se smyšlenými daty (stejný `setup.sql`, napodobený Supabase). Ostrá data jsou jen v Supabase. ⏳ Volitelně: druhý bezplatný projekt v Supabase na zkoušení obnovy. |
| 02 | Ostrý provoz musí být poznat | ✅ | Administrace ukazuje nahoře štítek **Ostrý provoz** (nebo **Testovací prostředí**). Bere se z `ENVIRONMENT` v `config.js`, ne z adresy. |
| 03 | Hromadné mazání jen pro oprávněné | ✅ | Mazat smí jen přihlášený admin (pravidla RLS v databázi, ne jen schované tlačítko). Objednávky, nastavení, odstoupení a žádosti nesmaže ani admin. |
| 04 | Oddělené přístupy | ✅ ⏳ | Web má jen veřejný klíč, tajný klíč Supabase nikde není. Každý admin má vlastní účet. ⏳ Zapnout dvoufázové přihlášení na účtech Supabase a GitHub, kdo ovládne dashboard, může smazat celý projekt. |
| 05 | Limit na jedno hromadné smazání | ✅ | Trigger v databázi: jeden příkaz smí smazat nejvýš 20 řádků (zájemci a nabídky 100, úkoly 50). Větší požadavek se zruší celý a nesmaže se nic. Platí i pro kaskádové mazání. |
| 06 | Výslovné schválení ničivých akcí | ➖ | Na schvalování druhým člověkem jsme moc malí. Nahrazuje to opsání slova u velkých zásahů (bod 10) a koš (bod 11). |
| 07 | Ochrana proti smazání celé databáze | ⏳ | Supabase takový přepínač nemá, smazání projektu jen chce opsat jeho název. Chrání ho dvoufázové přihlášení (bod 04) a hlavně záloha mimo Supabase (bod 16). |
| 08 | Pravidla mazání hlídá server | ✅ | Oprávnění (RLS), zákaz mazání objednávek a limit jsou v databázi. Platí pro administraci, přímé volání API i SQL. |
| 09 | Náhled před hromadnou akcí | ✅ | Obnova ze zálohy nejdřív ukáže tabulku: co přibude, co se přepíše, co půjde do koše, co nejde. Výmaz osobních údajů ukáže, co se k e-mailu našlo. |
| 10 | Opsání názvu u velkých zásahů | ✅ | Smazání dodavatele nebo suroviny s nabídkami a produktu se zájemci chce opsat jeho název. Obnova ze zálohy chce opsat OBNOVIT. Oprávnění a limity tím nejdou obejít. |
| 11 | Koš s možností vrátit | ✅ | Co se v administraci smaže, jde na 30 dní do koše (*Zálohy a koš*). Jedním kliknutím se vrátí i všechno, co se smazalo s tím (třeba dodavatel i s nabídkami). Pak se maže natrvalo. Výmaz na žádost podle GDPR do koše nejde. |
| 12 | Verze souborů | ➖ ✅ | Úložiště Supabase verze nemá. Fotky jsou proto v záloze a obnova doplní ty, které chybí. |
| 13 | Změny databáze nejdřív na kopii | ✅ | Každá změna `setup.sql` se zkouší na čisté databázi i na kopii staré verze, dvakrát po sobě. `setup.sql` nic nemaže ani nepřepisuje. **Před každým spuštěním stáhni zálohu.** |
| 14 | Automatické zálohy databáze i fotek | ✅ ⏳ | Supabase je na bezplatném plánu nedělá, proto **noční záloha na GitHubu**: každou noc databáze i fotky v jednom souboru, zašifrovaném heslem, drží se 30 dní. Navíc kdykoli **Stáhnout zálohu** v administraci. ⏳ Nastavit dva secrets podle `supabase/README.md`. ⏳ Až pojede prodej, zvážit plán Pro (denní zálohy přímo v Supabase). |
| 15 | Obnova k libovolnému okamžiku (PITR) | ➖ | Jen jako placený doplněk k Pro. Pro malý obchod zatím zbytečný. |
| 16 | Záloha, kterou živé přístupy nesmažou | ✅ ⏳ | Noční záloha je u GitHubu, ne v Supabase, a přístup, kterým se dělá, umí jen číst. Kdo by ovládl web nebo databázi, zálohy nesmaže. Ruční zálohu máš u sebe. ⏳ Aspoň jednou za měsíc si jednu stáhni k sobě, ať nejsou všechny jen na GitHubu. |
| 17 | Upozornění na chybějící zálohu a hromadné mazání | ✅ | Když noční záloha selže, přijde e-mail od GitHubu (i když je katalog prázdný nebo chybí fotky). Žlutá lišta v administraci, když záloha chybí nebo je starší 7 dní. Hromadné mazání se nehlásí, rovnou se zablokuje (bod 05). |
| 18 | Záznam, kdo co smazal | ✅ | Koš ukládá, kdo (účet), kdy a co. Záznam nejde změnit ani smazat, zmizí až po 30 dnech. |
| 19 | Zkouška obnovy mimo ostrý provoz | ✅ ⏳ | Vyzkoušeno: záloha obnovená do úplně nové databáze, všechny záznamy sedí, další objednávka dostane správné číslo. Noční záloha vyzkoušená stejně, i se zipem z GitHubu a špatným heslem. ⏳ Jednou za rok zkusit obnovu do testovacího projektu (postup níž). |
| 20 | Ověřit, že web s obnovenými daty funguje | ✅ | Po obnově v testu: počty v tabulkách sedí, vzorová objednávka má stejný obsah i cenu, nová objednávka projde, web načte nabídku, administrace otevře objednávku. |

## Postup: jak obnovit data

**Když se něco smazalo omylem v administraci (do 30 dnů):**
Administrace → *Zálohy a koš* → Koš → u položky **Vrátit**.

**Když se data poškodila nebo zmizela:**
1. Ještě nic neměň. Stáhni zálohu současného stavu (i poškozeného), ať je k čemu se vrátit.
2. Vyber zálohu z doby před problémem: buď svoji staženou, nebo noční z GitHubu
   (Actions → *Noční záloha* → běh z dané noci → dole *Artifacts*, stáhne se .zip).
3. Administrace → *Zálohy a koš* → Obnova ze zálohy → vyber soubor (.json i .zip).
   U noční zálohy zadej heslo k zálohám (`ZALOHA_HESLO`).
4. Projdi náhled. Bez přepisování se jen doplní, co chybí.
5. Když je potřeba vrátit i změněné ceny, názvy a podobně, zapni **Přepsat katalog…**
   a znovu projdi náhled. Co v záloze nebylo, půjde do koše.
6. **Obnovit**, opiš OBNOVIT.
7. Zkontroluj web (nabídka, ceny, fotky) a jednu objednávku v administraci.
8. Když se od zálohy někdo nechal vymazat (záložka *Osobní údaje*, žádosti typu Výmaz),
   smaž ho znovu.

**Když zmizel celý projekt v Supabase:**
1. Založ nový projekt, v SQL Editoru spusť `supabase/setup.sql`.
2. Přidej si admin účet (návod v `supabase/README.md`), do `config.js` dej novou adresu
   a klíč nového projektu.
3. Obnov zálohu **s přepsáním** (nahradí ukázková data z `setup.sql`), fotky se doplní samy.
4. Noční zálohu znovu napoj: `select public.reset_backup_password();` a nová adresa
   do secretu `ZALOHA_DB_URL` (postup v `supabase/README.md`).

**Zkouška obnovy jednou za rok:** stejný postup jako u zmizelého projektu, jen do
testovacího projektu s `ENVIRONMENT: 'test'`. Ostrá data se tím nezmění.

## Před každou rizikovou změnou

- Stáhni čerstvou zálohu.
- Zkontroluj, že je v administraci vidět, ve kterém prostředí jsi.
- Napiš si, co přesně měníš a co má vyjít.
- U obnovy si přečti náhled. Když nesedí počty, zastav se.
- Potom zkontroluj web a administraci.
