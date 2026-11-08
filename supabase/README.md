# Databáze a administrace

Ceny, ingredience, hotové směsi, fotky, doprava, slevové kódy a objednávky
žijí v [Supabase](https://supabase.com). Web si je odtud načítá a ty je měníš
v administraci na adrese `…/admin/`.

Dokud Supabase není napojený, web jede přesně jako dřív z dat ve `script.js`.
Nic se tedy nerozbije, když tohle nasadíš dřív, než projdeš návod.

## Založení (jednou, asi 15 minut)

Menu v Supabase se občas přejmenuje. Když něco nesedí přesně, hledej podobně
pojmenovanou položku.

1. **Projekt.** Na supabase.com → *New project*. Region vyber *Central EU
   (Frankfurt)*, je nejblíž. Heslo k databázi si ulož do správce hesel,
   k běžné práci ho potřebovat nebudeš.

2. **Tabulky.** V projektu otevři *SQL Editor* → *New query*, vlož celý
   obsah souboru [`setup.sql`](setup.sql) a dej *Run*. Založí tabulky,
   pravidla přístupu, úložiště na fotky a nahraje do nich všechno, co je
   teď na webu. Soubor jde spustit znovu kdykoliv — nic nepřepíše.

3. **Klíče do webu.** *Project Settings → API Keys*. Zkopíruj *Project URL*
   a *Publishable key* (`sb_publishable_…`) do [`config.js`](../config.js)
   v kořeni webu a pushni. Publishable klíč je veřejný a patří do
   prohlížeče. **Secret key (dřív service_role) do webu nikdy nedávej** —
   kdo by ho měl, obejde všechna pravidla.

4. **Tvůj účet.** *Authentication → Users → Add user → Create new user*.
   Zadej e-mail a heslo a zaškrtni *Auto Confirm User*. Pak v SQL Editoru
   spusť (s tvým e-mailem):

   ```sql
   insert into public.admins (user_id, email)
   select id, email from auth.users where email = 'tvuj@email.cz';
   ```

   Přihlášení samo o sobě nestačí — do administrace pustí jen účty v
   tabulce `admins`. Stejně přidáš kohokoliv dalšího.

5. **Vypni registrace.** *Authentication → Sign In / Providers* → vypni
   *Allow new users to sign up*. Cizí účet by stejně nic nezměnil, ale
   nemusí tam vznikat.

6. **Odkaz pro zapomenuté heslo.** *Authentication → URL Configuration*:
   do *Site URL* dej adresu webu a do *Redirect URLs* přidej adresu
   administrace, např.
   `https://vaseksinkule-svg.github.io/teaseyou/admin/`
   (a až pojede doména, i `https://teaseyou.cz/admin/`).

7. **Vyzkoušej.** Otevři `/admin/`, přihlas se, změň cenu 50 g a obnov
   web. Nová cena tam musí být.

## Co kde je

| Tabulka | Co v ní je | Kdo smí číst | Kdo smí měnit |
|---|---|---|---|
| `ingredients` | Základy, příchutě, doplňky, fotky, skladem | kdokoliv (jen viditelné) | admin |
| `blends` | Hotové směsi na úvodní stránce | kdokoliv (jen viditelné) | admin |
| `price_tiers` | Ceník podle gramáže | kdokoliv | admin |
| `shipping_methods` | Cena a zapnutí dopravy | kdokoliv | admin |
| `settings` | Doprava zdarma od, lišta nahoře | kdokoliv | admin |
| `promo_codes` | Slevové kódy | jen admin | admin |
| `orders` | Objednávky | jen admin | admin (stav, poznámka) |
| `admins` | Kdo smí do administrace | každý jen sebe | jen přes SQL Editor |

Fotky jsou v úložišti (Storage) v bucketu `photos`. Administrace je před
nahráním zmenší na max. 1600 px a uloží jako WebP, takže fotka z mobilu má
pár set kB.

## Jak vzniká objednávka

Web zavolá funkci `place_order()`. Ta si ověří zákazníka, ingredience,
gramáž, dopravu i slevový kód a **cenu spočítá sama z ceníku** — co pošle
prohlížeč za cenu, se ignoruje. Kdo by si v konzoli přepsal cenu na 1 Kč,
zaplatí stejně plnou. Vyprodané ingredience, vypnutou dopravu nebo
vypršelý kód odmítne a web zákazníkovi řekne proč.

Číslo objednávky je `TY-00001`, `TY-00002`… Při platbě převodem je
variabilní symbol číslo objednávky bez předpony (vidíš ho v detailu).

Z jednoho e-mailu jde poslat nejvýš 5 objednávek za hodinu — pojistka
proti tomu, aby ti někdo zaplnil databázi.

**E-mail o nové objednávce** zatím chodí jen přes Formspree, když vyplníš
`FORMSPREE_ID` ve `script.js`. Objednávka se uloží i bez toho a uvidíš ji
v administraci.

## Na co myslet

- **Zdarma tarif usíná.** Projekt na free tarifu se po týdnu bez provozu
  uspí a musíš ho ručně probudit v dashboardu. Web se mezitím vrátí
  k poslední uložené nabídce (nebo k té vestavěné ve `script.js`), ale
  objednávka neprojde. Než spustíš ostrý prodej, přejdi na Pro.
- **Vnitřní název ingredience** (`code`, např. `Green Tea`) se po založení
  nemění. Znají ho košíky zákazníků a sdílené odkazy. Zobrazovaný název
  měň klidně.
- **Ingredienci radši skryj, než smažeš.** Smazat jde jen ta, která není
  v žádné směsi.
- **Zdravotní tvrzení.** U potravin smí web uvádět jen tvrzení schválená EU
  (nařízení 1924/2006). Pole *Poznámky o účincích* se proto na webu
  neukazuje, je jen pro tebe.

## Když přibude něco nového (třeba mýdla a balzámy)

`setup.sql` jde spustit kolikrát chceš. Když web dostane novou část
databáze, stačí v SQL Editoru znovu vložit celý soubor a dát *Run*.
Doplní jen to, co chybí; ceny, ingredience, objednávky ani nic jiného, co
jsi změnil v administraci, nepřepíše.

Mýdla a balzámy (listopad 2026) přidaly tabulky `craft_products`
(produkty) a `craft_waitlist` (e-maily lidí, kteří chtějí vědět, až bude
produkt k mání). Do seznamu zájemců web zapisuje jen přes funkci
`join_craft_waitlist()`; číst a mazat ho smí jen admin. Dokud tabulky
v databázi nejsou, web ukazuje vestavěné ukázky a zbytek jede normálně.

Než se mýdla nebo balzámy začnou prodávat: kosmetika v EU potřebuje
bezpečnostní posouzení od odborníka, registraci v portálu CPNP
a etiketu se složením (INCI). Na web jim nepiš léčivé účinky.

## Nákup (listopad 2026)

Záložka *Nákup* v administraci je pracovní deník pro hledání dodavatelů:
tabulky `purchase_suppliers` (dodavatelé a stav jednání),
`purchase_materials` (suroviny a poznámky k nim), `purchase_offers`
(nabídka = dodavatel a surovina: cena, vzorek, hodnocení) a
`purchase_tasks` (úkoly). Čte a mění je jen admin, web pro zákazníky
k nim přístup nemá. Přibudou dalším spuštěním `setup.sql`.

Přístup pro dalšího člověka (třeba Kláru): v Supabase *Authentication →
Users → Add user* (e-mail, heslo, zaškrtnout *Auto Confirm User*) a pak
v SQL Editoru:

```sql
insert into public.admins (user_id, email)
select id, email from auth.users where email = 'jeji@email.cz';
```

## Prodávající, etiketa a dobírka (listopad 2026)

Dalším spuštěním `setup.sql` přibude:

- v `settings` údaje o prodávajícím (`seller_*`), příplatek za dobírku
  (`cod_fee_czk`, výchozí 39 Kč), receptura směsi (`recipe_*_pct`, výchozí
  70 / 20 / 10 %) a trvanlivost v měsících. Vyplňuje se v administraci
  *Ceny a doprava → Prodávající a etiketa*. Web z nich skládá obchodní
  podmínky, patičku a informace o potravině.
- v `ingredients` název ve složení (`label_cs`), druh (`kind`: pravý čaj,
  bylina, ovoce, jiné), nejvyšší podíl ve směsi (`max_pct`) a alergeny.
  U 24 výchozích surovin se vyplní samy, upravit je jde u každé ingredience.
- v `orders` sloupec `payment_czk` (příplatek za dobírku je teď součástí
  ceny). Funkce `place_order()` ho počítá sama a platbu kartou zatím
  odmítne, dokud není napojená brána.
- do *Nákup → Úkoly* seznam úředních kroků před spuštěním prodeje
  (živnost, SZPI, HACCP, EKO-KOM…). Vloží se jen jednou.

Popis borůvky sliboval antioxidanty; přepíše se jen tehdy, když jsi ho
mezitím neměnil.

## Mixér s díly a katalog v2 (listopad 2026)

Dalším spuštěním `setup.sql` přibude:

- `ingredients.surcharge_czk`: příplatek za prémiovou surovinu v Kč za 100 g.
- `ingredients.icon_url`: vlastní ikonka suroviny (PNG v úložišti `photos/icons/`). Bez ní web kreslí vestavěnou.
- `blends.parts`: díly 1–3 ke každé surovině, směs má až 5 surovin.
- `recipe_eval()`: výpočet receptury (podíly, gramy, druh čaje podle vyhlášky,
  příplatek). Stejný jako `recipe.js` na webu. Volá ji jen `place_order()`, ta
  podle ní odmítne směs mimo pravidla (`invalid_recipe`) a k ceně z ceníku přičte
  příplatek. Do objednávky uloží `parts`, `recipe` (gramy na míchání),
  `category`, `base_czk` a `surcharge_czk`.
- **Katalog v2**, jednou (`settings.catalog_version`): nové suroviny, nové názvy,
  skupiny, limity a příplatky, skrytí medu, vanilky, kakaa, kokosu a kurkumy,
  nové složení hotových směsí, noví dodavatelé v Nákupu. Fotky, vyprodání
  a objednávky zůstanou. Co potom změníš v administraci, další běh nepřepíše.
- Sloupce `settings.recipe_*_pct` se už nepoužívají (poměr volí zákazník díly).

## Odstoupení, osobní údaje a úklid (listopad 2026)

Dalším spuštěním `setup.sql` přibude:

- tabulka `withdrawals` a funkce `submit_withdrawal()`: online odstoupení od smlouvy
  z webu. Web zapisuje jen přes funkci, číst a měnit smí jen admin (záložka *Odstoupení*).
- tabulka `privacy_requests`: záznam žádostí podle GDPR (záložka *Osobní údaje*).
- funkce `purge_expired_data()`: maže a anonymizuje staré osobní údaje podle lhůt
  v zásadách. Spouští ji administrace při každém přihlášení, nikdo jiný ji zavolat nemůže.
- v `orders` sloupce `terms_version` (znění podmínek při objednávce), `contacts_purged_at`
  a `anonymized_at`. `place_order()` u Zásilkovny nechce adresu.

## Ochrana před ztrátou dat (listopad 2026)

Dalším spuštěním `setup.sql` přibude:

- **koš** `deleted_rows`: každý řádek smazaný z katalogu, mýdel, slev a nákupu se uloží
  (kdo, kdy, co). Vrací se přes `restore_deleted()`, po 30 dnech ho smaže úklid.
- **limit hromadného mazání**: trigger `guard_bulk_delete` zruší příkaz, který by najednou
  smazal víc než pár řádků.
- objednávky, nastavení, odstoupení a žádosti **nejde smazat** ani adminem.
- `export_backup()` a `restore_backup()`: záloha do souboru a obnova (náhled, doplnění,
  nebo přepsání katalogu). V administraci záložka *Zálohy a koš*.
- `erase_waitlist_email()`: výmaz zájemce na žádost bez kopie v koši.

**Před každým spuštěním `setup.sql` si v administraci stáhni zálohu.** Postup obnovy je
v `ZALOHY-A-OBNOVA.md`.

## Noční záloha na GitHubu (listopad 2026)

Každou noc kolem 3:17 spustí GitHub úlohu `.github/workflows/zaloha.yml`. Ta stáhne celou
databázi i fotky (stejný soubor jako *Stáhnout zálohu* v administraci), zašifruje ho a uloží
na 30 dní jako artifact. Do databáze se přihlašuje rolí `teaseyou_backup`, která umí jen
spustit `backup_snapshot()`. Nevidí do tabulek, nic nesmaže ani nezmění.

**Nastavení (jednou, asi 5 minut, až bude `zaloha.yml` v main):**

1. V SQL Editoru spusť `setup.sql` (založí roli bez hesla) a pak:
   ```sql
   select public.reset_backup_password();
   ```
   Výsledek je náhodné heslo pro roli. Zkopíruj si ho, ukáže se jen teď.
2. V dashboardu nahoře klikni na **Connect** a vyber **Session pooler**. Adresa vypadá takhle:
   `postgresql://postgres.afyrschnjxgtlzjkmfjb:[YOUR-PASSWORD]@aws-0-XX.pooler.supabase.com:5432/postgres`.
   Uprav v ní dvě věci:
   - `postgres.afyrschnjxgtlzjkmfjb` přepiš na `teaseyou_backup.afyrschnjxgtlzjkmfjb`,
   - `[YOUR-PASSWORD]` nahraď heslem z bodu 1 (i hranaté závorky pryč).
3. Vymysli **heslo k zálohám**, aspoň 16 znaků, a ulož ho do správce hesel. Bez něj
   žádnou noční zálohu neotevřeš a nikdo ho nedokáže obnovit.
4. GitHub → repozitář → Settings → Secrets and variables → Actions → **New repository secret**:
   - `ZALOHA_DB_URL` = upravená adresa z bodu 2,
   - `ZALOHA_HESLO` = heslo k zálohám z bodu 3.
5. Actions → **Noční záloha** → **Run workflow**. Za minutu by měl být zelený. Dole
   v *Artifacts* je soubor, zkus ho v administraci otevřít (Obnova ze zálohy, zadat heslo).
   Stačí náhled, obnovu nespouštěj.

**Když:**
- běh selže: přijde e-mail od GitHubu. V běhu je napsané proč (počty záznamů, nikdy
  obsah). Když selže kvůli chybějícím fotkám nebo prázdnému ceníku, záloha se i tak uloží.
- heslo k roli unikne: znovu `select public.reset_backup_password();` a nové heslo dej
  do `ZALOHA_DB_URL`.
- 60 dní se v repozitáři nic nezmění: GitHub může noční zálohu vypnout. Úloha se zkouší
  udržet zapnutá sama. Kdyby to nevyšlo, administrace do 7 dní ukáže žlutou lištu
  o staré záloze; pak Actions → Noční záloha → **Enable workflow**.

Výpis běhů je u veřejného repozitáře vidět všem, proto skript vypisuje jen počty.
Soubor zálohy bez hesla nikdo neotevře (AES-256-GCM, klíč z hesla přes PBKDF2-SHA256,
600 000 opakování).

## Spuštění prodeje (listopad 2026)

Po spuštění `setup.sql` je prodej **vypnutý**: web ukazuje „Připravujeme spuštění“
a `place_order()` vrací `sales_closed`, i když by někdo obešel web. Míchat a ukládat
směsi jde dál.

Zapíná se v administraci: *Ceny a doprava* → **Prodej** → *Spustit prodej* (opsat SPUSTIT).
Databáze to dovolí, jen když jsou v *Prodávající a etiketa* vyplněné jméno, IČO,
adresa sídla a e-mail (`seller_missing`). Den prvního spuštění (`sales_opened_at`)
se ukáže v obchodních podmínkách a zásadách jako „platné od“ a dál se nemění.

Před spuštěním: ohlášená živnost, oznámení SZPI, funkční e-mail pro zákazníky
a zkontrolované podmínky (úkoly v *Nákup → Úkoly*).
