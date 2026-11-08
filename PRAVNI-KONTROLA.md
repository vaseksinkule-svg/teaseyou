# Právní kontrola webu Tease you

Kontrola podle checklistu „The App Launch Checklist“ (35 bodů, stav k říjnu 2026),
přepočítaná na český e-shop se sypaným čajem. U každého bodu je, jestli se nás týká,
podle čeho v Česku, co je hotové a co zbývá.

- **Stav ke dni:** 5. 11. 2026
- **Projít znovu:** nejpozději 5. 11. 2027, a vždycky, když přibude nová funkce, dodavatel,
  druh údajů, způsob placení nebo nová země prodeje. Úkol na to je v administraci
  (Nákup → Úkoly).
- **Odpovídá:** Václav (mýdla a balzámy: Klára)
- **Důležité:** tohle není právní rada. Texty podmínek a zásad má před spuštěním prodeje
  zkontrolovat advokát.

Značky: ✅ hotovo · ⏳ zbývá udělat · ➖ netýká se nás (s důvodem)

## Část 1: Právní dokumenty a údaje o prodávajícím

| # | Bod | Stav | Podle čeho v ČR | Co je na webu / co zbývá |
|---|---|---|---|---|
| 01 | Zásady ochrany osobních údajů | ✅ | GDPR čl. 13; zákon č. 110/2019 Sb. | Stránka *Ochrana osobních údajů*: správce, účely, právní základy, doby uložení, příjemci, předávání mimo EU, práva, stížnost u ÚOOÚ, pověřenec (nemáme, není povinný), změny a datum znění. Psáno podle skutečných toků dat v kódu. Supabase běží v regionu eu-west-1 (Irsko), ověřeno 7. 11. 2026. |
| 02 | Obchodní podmínky | ✅ ⏳ | Občanský zákoník (č. 89/2012 Sb.) § 1811, 1820, 1826; zákon o ochraně spotřebitele (č. 634/1992 Sb.) | Stránka *Obchodní podmínky*. ⏳ Kontrola advokátem a datum platnosti při spuštění. |
| 03 | Souhlas s podmínkami u tlačítka | ✅ | § 1826a OZ (tlačítko musí říkat, že objednávka zavazuje k platbě) | Věta o podmínkách a ochraně údajů je těsně nad tlačítkem **Objednat a zaplatit**. Zaškrtávací políčko česká pravidla nevyžadují. Ochranu údajů jen potvrzuje, že ji zákazník četl, nejde o souhlas. |
| 04 | Záznam o odsouhlasení podmínek | ✅ | GDPR čl. 7 odst. 1 (doložitelnost); obecně důkaz o obsahu smlouvy | Každá objednávka si ukládá `terms_version` (datum znění) a čas. Administrace je u objednávky ukazuje. Stará znění jsou v historii gitu. **Při každé změně podmínek přepiš `TERMS_VERSION` ve `script.js` a datum na stránkách.** |
| 05 | Vracení peněz a odstoupení | ✅ ⏳ | § 1829–1837 OZ; § 1830a OZ podle zákona č. 159/2026 Sb. (tlačítko „Odstoupit od smlouvy“, platí od 1. 1. 2027) | Hotové směsi 14 dní, pokud je sáček neotevřený (§ 1837 písm. g)), směsi na míru ne (§ 1837 písm. d)). **Tlačítko „Odstoupit od smlouvy“** na stránce Odstoupení i u každé objednávky v *Moje objednávky*, druhý krok **„Potvrdit odstoupení od smlouvy“**, hned potvrzení s datem a časem, záznam v databázi. Vzorový formulář e-mailem nebo k tisku. ⏳ Potvrzení e-mailem zatím posílá admin ručně (Odstoupení → Napsat potvrzení), dokud nebude automatický e-mail. |
| 06 | Kontaktní údaje prodávajícího | ✅ ⏳ | § 435 OZ; zákon č. 480/2004 Sb. § 5 | Jméno, IČO, sídlo, e-mail a telefon z administrace v patičce, podmínkách, zásadách a u potraviny. Dokud nejsou vyplněné jméno, IČO a adresa, nejde v administraci spustit prodej (hlídá to databáze) a web ukazuje „Připravujeme spuštění“. ⏳ Vyplnit v Nastavení po ohlášení živnosti. ⏳ **Ověřit, že doména teaseyou.cz a e-mail hello@teaseyou.cz patří nám a fungují** (zkušební zpráva). |

## Část 2: Souhlasy, cookies, marketing

| # | Bod | Stav | Podle čeho v ČR | Co je na webu / co zbývá |
|---|---|---|---|---|
| 07 | Cookie lišta | ➖ | § 89 odst. 3 zákona č. 127/2005 Sb. o elektronických komunikacích | Web si ukládá jen to, o co zákazník sám požádá (košík, uložené směsi, tmavý režim…). Na to se souhlas nevyžaduje, proto lišta není. Přehled všeho uloženého je na stránce *Cookies*. Kdyby někdy přibyla analytika nebo reklama, lišta s „Odmítnout vše“ stejně výrazným jako „Přijmout“ je povinná. |
| 08 | Sledování až po souhlasu | ✅ | totéž | Žádná analytika ani reklamní kódy. Písma jsou na našem serveru. Mapa Zásilkovny se načte až po kliknutí. Ověřeno testem: při načtení webu nejde žádný požadavek na cizí server kromě naší databáze u Supabase. |
| 09 | Oddělený souhlas s marketingem | ✅ | zákon č. 480/2004 Sb. § 7; GDPR čl. 7 | Newsletter ani reklamní e-maily neposíláme. Upozornění na mýdla a balzámy je samostatná volba u produktu, nic předem zaškrtnutého, s odkazem na zásady. |
| 10 | Odhlášení z e-mailů | ✅ | § 7 odst. 4 zákona č. 480/2004 Sb. | Platí pro jedinou zprávu „už je k mání“. V administraci je u zájemců návod: označit jako obchodní sdělení, uvést odesílatele, nabídnout odhlášení, posílat skrytou kopií (BCC), pak seznam smazat. |

## Část 3: Práce s osobními údaji

| # | Bod | Stav | Podle čeho v ČR | Co je na webu / co zbývá |
|---|---|---|---|---|
| 11 | Jen nutné údaje | ✅ | GDPR čl. 5 odst. 1 písm. c) | U výdejního místa Zásilkovny se adresa nechce ani neposílá. Telefon zůstává povinný, potřebují ho dopravci. Žádná data narození ani nic navíc. |
| 12 | Doby uložení | ✅ | GDPR čl. 5 odst. 1 písm. e); daňové předpisy | Funkce `purge_expired_data()` se spouští při každém přihlášení do administrace: zájemci po 2 letech, kontakt u objednávky po 5 letech, jméno a adresa a odstoupení po 10 letech, záznamy žádostí po 5 letech. Lhůty jsou popsané v zásadách. |
| 13 | Žádosti o přístup a výmaz | ✅ | GDPR čl. 12, 15–21 (odpověď do 1 měsíce) | Záložka *Osobní údaje* v administraci: najde vše podle e-mailu, stáhne kopii v JSON, smaže z upozornění, zapíše žádost. Objednávky zůstávají kvůli dokladům, zákazníkovi se to napíše. |
| 14 | Údaje dětí | ➖ | GDPR čl. 8; § 7 zákona č. 110/2019 Sb. (hranice 15 let) | Web není určený dětem. V zásadách je, že souhlas s upozorněním může dát člověk od 15 let. |
| 15 | Trénování AI na datech | ➖ | GDPR čl. 5 a 6 | Žádnou AI na údaje zákazníků nepoužíváme. V zásadách je to výslovně napsané. |

## Část 4: Dodavatelé a třetí strany

| # | Bod | Stav | Podle čeho v ČR | Co je na webu / co zbývá |
|---|---|---|---|---|
| 16 | Kontrola služeb třetích stran | ✅ | GDPR čl. 13 a 28 | Seznam: GitHub Pages (hosting), Supabase (databáze, fotky, přihlášení admina), Zásilkovna (mapa, až po kliknutí), dopravci. Žádné SDK ani pixely. Formspree je v kódu vypnuté; kdyby se zapnulo, patří do zásad. |
| 17 | Smlouvy o zpracování (DPA) | ✅ ⏳ | GDPR čl. 28 odst. 3 | Supabase: DPA je součástí jejích podmínek včetně standardních smluvních doložek. Dopravci jsou samostatní správci. ⏳ Projít podmínky GitHubu pro Pages (jejich záznamy o návštěvách) a pro Actions, kde jsou noční zálohy. Zálohy jsou zašifrované a GitHub k nim nemá heslo, v zásadách je GitHub uvedený i jako jejich úložiště. |
| 18 | Seznam subdodavatelů | ➖ | GDPR čl. 28 odst. 2 | Jsme správce, ne zpracovatel pro jiné firmy. Příjemce uvádíme v zásadách. |

## Část 5: Přístupnost

| # | Bod | Stav | Podle čeho v ČR | Co je na webu / co zbývá |
|---|---|---|---|---|
| 19 | Kontrast | ✅ | zákon č. 424/2023 Sb. (u služeb mikropodniku se nepoužije, § 2 odst. 3 písm. a)); WCAG 2.2 AA | Automatická kontrola axe-core (WCAG 2.2 A/AA) na 12 stránkách ve světlém i tmavém režimu: 0 chyb. Opravený kontrast poznámky v úvodu. |
| 20 | Popisky obrázků | ✅ | WCAG 1.1.1 | Fotka směsi má jméno jako popisek. Ilustrace jsou pro čtečky skryté, protože vedle je text. |
| 21 | Ovládání klávesnicí | ✅ | WCAG 2.1.1, 2.4.1, 2.4.7 | Odkaz „Přeskočit na obsah“, menu jsou skutečná tlačítka, viditelný fokus, platba, doprava i odstoupení jdou klávesnicí. ⏳ Dobré je nechat to vyzkoušet člověka se čtečkou obrazovky. |

## Část 6: Férový design a ceny

| # | Bod | Stav | Podle čeho v ČR | Co je na webu / co zbývá |
|---|---|---|---|---|
| 22 | Manipulativní design | ✅ | zákon o ochraně spotřebitele § 4–5a; směrnice 2011/83/EU čl. 22 (platba navíc jen s výslovným souhlasem, ne předvolbou) | Dobírka (s příplatkem) už není předvybraná, zákazník volí platbu sám. Žádné vyčítavé texty ani skryté volby. |
| 23 | Falešné odpočty | ➖ | zákon o ochraně spotřebitele, příloha č. 1 (vždy nekalé praktiky) | Žádné odpočty ani „zbývají 3 kusy“. |
| 24 | Skryté poplatky | ✅ | § 1811 a 1820 OZ (celková cena včetně všech poplatků) | Příplatek za dobírku je v celkové ceně v pokladně i v databázi. Doprava je vidět před odesláním. Ceny jsou konečné, prodávající není plátce DPH. |
| 25 | Automatické obnovování | ➖ | – | Žádné předplatné. |
| 26 | Snadné zrušení předplatného | ➖ | – | Žádné předplatné. |

## Část 7: Pravdivá tvrzení

| # | Bod | Stav | Podle čeho v ČR | Co je na webu / co zbývá |
|---|---|---|---|---|
| 27 | Nepodložená tvrzení | ✅ ⏳ | zákon o ochraně spotřebitele § 5 (klamavé praktiky); nařízení 1924/2006 (zdravotní tvrzení); 1169/2011 čl. 7 | Pryč: „500+ kombinací“ (je jich 486), „certifikovaní dodavatelé“, „žádné šarže“, „čerstvost 12–18 měsíců“, „bez umělých aromatizátorů“, „mícháme ve stejný den“, „sledovací číslo e-mailem“, vymyšlený telefon v datech pro vyhledávače, zdravotní tvrzení. Termíny jsou „obvykle do 24 hodin“, jak říkají podmínky. ⏳ Potvrdit, že sedí příběh v *O nás* (maturitní práce). Zelená tvrzení („eko“, „šetrné k přírodě“) nepoužívat, novela zákona podle směrnice 2024/825 prošla Sněmovnou 14. 10. 2026. |
| 28 | Falešné recenze | ➖ | zákon o ochraně spotřebitele § 5a odst. 5 | Recenze na webu nejsou. Až budou, musí být u nich napsané, jestli a jak ověřujeme, že jsou od zákazníků. |
| 29 | Falešné certifikáty bezpečnosti | ➖ | § 5 zákona o ochraně spotřebitele | Žádné „SOC 2“, „ISO“ ani „GDPR certified“. Zásady popisují jen to, co opravdu děláme. |
| 30 | Slib dostupnosti | ➖ | – | Nic takového neslibujeme. |
| 31 | Loga zákazníků | ➖ | zákon o ochranných známkách | Žádná. Ikony sociálních sítí vedou jen na naše profily. |
| 32 | Označení obsahu od AI | ➖ | nařízení (EU) 2024/1689 čl. 50 | Žádný chatbot ani generovaný obsah pro zákazníky. Ilustrace jsou kreslené SVG. Kdyby přibyly fotky vytvořené AI, nesmí se vydávat za fotky skutečného produktu. |

## Část 8: Duševní vlastnictví

| # | Bod | Stav | Podle čeho v ČR | Co je na webu / co zbývá |
|---|---|---|---|---|
| 33 | Licence obrázků, písem a kódu | ✅ | autorský zákon č. 121/2000 Sb. | Písma Unbounded a Albert Sans (OFL 1.1, `fonts/OFL.txt`), část ikon z Feather Icons (MIT), vše v `THIRD-PARTY-LICENSES.txt` a odkazem v patičce. Ilustrace jsou vlastní. |
| 34 | Open-source licence | ✅ | – | Web nemá žádné knihovny, jen vlastní kód. Mapa Zásilkovny se načítá z jejich serveru podle jejich podmínek. |
| 35 | Registrace agenta DMCA | ➖ | americký zákon; v EU nařízení 2022/2065 (DSA) | Zákazníci nic nenahrávají, nejsme hostingová služba. |

## Navíc podle českých předpisů (mimo checklist)

| Bod | Stav | Podle čeho | Co je hotové / co zbývá |
|---|---|---|---|
| Informace o potravině před nákupem | ✅ ⏳ | nařízení (EU) 1169/2011 čl. 9 a 14; vyhláška č. 187/2023 Sb. | Název podle složení, složení s procenty (seřazené od největšího), alergeny, hmotnost, trvanlivost, skladování, výrobce. Druh podle § 2 vyhlášky: pravý čaj aspoň 50 % = (ochucený) čaj, byliny nad 50 % = bylinný, sušené ovoce nad 50 % = ovocný; jinak web i databáze směs odmítnou. Limity z přílohy 1 (tabulka 2: 30 %, tabulka 3: 5 %) hlídá mixér i databáze. ⏳ Doplnit alergeny podle specifikací dodavatelů; u SZPI ověřit zařazení skořice, zázvoru a sušeného jablka (v příloze 1 nejsou jmenovitě, počítáme je jako „ostatní koření“ do 30 % a „ostatní sušené ovoce“ bez limitu) a rooibosu. |
| Registrace u SZPI | ⏳ | zákon č. 110/1997 Sb. o potravinách | Oznámit zahájení činnosti nejpozději v den zahájení prodeje. |
| Živnost | ⏳ | zákon č. 455/1991 Sb. | Obory Velkoobchod a maloobchod + Výroba potravinářských výrobků. |
| HACCP a šarže | ⏳ | nařízení (ES) 852/2004 a 178/2002 čl. 18 | Sepsat postupy, vést šarže a dodávky. |
| Obaly | ⏳ | nařízení (EU) 2025/40 (PPWR, od 12. 8. 2026); zákon č. 477/2001 Sb. | Zeptat se EKO-KOM. |
| Kosmetika (mýdla, balzámy) | ⏳ | nařízení (ES) 1223/2009 | Před prodejem posudek bezpečnosti, CPNP, oznámení hygieně. Zatím jen „Dej mi vědět“. |
| Potvrzení objednávky | ⏳ | § 1824 a 1827 OZ | Do zprovoznění automatického e-mailu potvrzovat ručně a do balíčku dávat doklad a podmínky. |

## Před spuštěním prodeje

1. Spustit znovu `supabase/setup.sql`, vyplnit Nastavení → Prodávající a etiketa.
2. Ohlásit živnost, oznámit SZPI, sepsat HACCP.
3. Ověřit doménu a e-mail.
4. Nechat podmínky a zásady zkontrolovat advokátem, doplnit datum platnosti.
5. Zkušební objednávka a zkušební odstoupení na ostrém webu (ne jen v testu).
