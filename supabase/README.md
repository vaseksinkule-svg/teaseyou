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
  (nařízení 1924/2006). Pole *Přínosy* teď obsahuje věci jako „Detox“ nebo
  „Úleva od úzkosti“ — před spuštěním prodeje je projdi.

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
