-- ════════════════════════════════════════════════════════════════════
--  Tease you — databáze v Supabase
--
--  Jak spustit: Supabase → SQL Editor → New query → vlož CELÝ tenhle
--  soubor → Run. Jde spustit opakovaně: tabulky se jen doplní, výchozí
--  data se vloží jen tam, kde ještě nic není, a nic z toho, co jsi
--  mezitím změnil v administraci, se nepřepíše.
--
--  Bezpečnost stojí na Row Level Security. Web má veřejný (anon) klíč,
--  a ten smí jen číst katalog a založit objednávku přes funkci
--  place_order(). Měnit cokoliv smí jen přihlášený uživatel, který je
--  v tabulce admins. Samotné přihlášení nestačí.
-- ════════════════════════════════════════════════════════════════════


-- ─── ADMINI ─────────────────────────────────────────────────────────

create table if not exists public.admins (
    user_id    uuid primary key references auth.users (id) on delete cascade,
    email      text,
    created_at timestamptz not null default now()
);
alter table public.admins enable row level security;

-- security definer: funkce běží s právy vlastníka, takže smí do admins
-- nahlédnout, i když tam běžný uživatel nevidí. Používají ji všechny
-- politiky níž.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (select 1 from public.admins where user_id = auth.uid());
$$;


-- ─── POMOCNÉ ────────────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at := now();
    return new;
end;
$$;


-- ─── KATALOG ────────────────────────────────────────────────────────

-- Ingredience. `code` je vnitřní název, pod kterým ingredienci znají
-- košíky, uložené mixy a sdílené odkazy (?b=Green Tea|Mint|Lemon).
-- Po založení se nemění — změna by rozbila staré odkazy. Zobrazované
-- názvy jsou name_cs / name_en a ty se měnit dají kdykoli.
create table if not exists public.ingredients (
    id          text primary key check (id ~ '^[a-z0-9_]{2,40}$'),
    code        text not null unique check (code ~ '^[A-Za-z0-9][A-Za-z0-9 ]{0,39}$'),
    category    text not null check (category in ('base', 'flavor', 'extra')),
    name_cs     text not null check (length(name_cs) between 1 and 60),
    name_en     text not null check (length(name_en) between 1 and 60),
    desc_cs     text not null default '' check (length(desc_cs) <= 500),
    desc_en     text not null default '' check (length(desc_en) <= 500),
    emoji       text not null default '🍵' check (length(emoji) <= 16),
    color       text not null default '#cccccc' check (color ~* '^#[0-9a-f]{6}$'),
    caffeine    smallint check (caffeine between 0 and 5),
    flavor_cs   text[] not null default '{}',
    flavor_en   text[] not null default '{}',
    health_cs   text[] not null default '{}',
    health_en   text[] not null default '{}',
    pairs       text[] not null default '{}',
    brew_temp   text check (length(brew_temp) <= 20),
    brew_time   text check (length(brew_time) <= 20),
    photo_url   text check (photo_url ~ '^https://'),
    in_stock    boolean not null default true,
    active      boolean not null default true,
    sort        integer not null default 0,
    updated_at  timestamptz not null default now()
);

-- Údaje na etiketu a do „Informací o potravině“ na webu.
--   label_cs   jak se surovina píše ve složení („citronová kůra“, „sušené jahody“)
--   kind       pravý čaj / bylina nebo koření / sušené ovoce / jiné. Podle toho
--              web pozná, jestli je směs ochucený, bylinný, nebo ovocný čaj
--              (vyhláška 187/2023 Sb., § 2).
--   max_pct    nejvyšší podíl ve směsi podle přílohy 1 vyhlášky (třeba
--              levandule, kurkuma a kardamom nejvýš 5 %)
--   allergens  alergeny podle specifikace dodavatele, např. „oxid siřičitý“
alter table public.ingredients add column if not exists label_cs  text check (length(label_cs) <= 80);
alter table public.ingredients add column if not exists kind      text check (kind in ('tea', 'herb', 'fruit', 'other'));
alter table public.ingredients add column if not exists max_pct   smallint check (max_pct between 1 and 100);
alter table public.ingredients add column if not exists allergens text not null default '' check (length(allergens) <= 200);

-- Příplatek za prémiovou surovinu v Kč za 100 g (bílý čaj, oolong, růže…).
-- K ceně sáčku se připočte podle toho, kolik suroviny v něm je.
alter table public.ingredients add column if not exists surcharge_czk integer not null default 0 check (surcharge_czk between 0 and 1000);

-- Slovenština (web má češtinu, slovenštinu a angličtinu). Prázdné = web
-- ukáže českou verzi.
alter table public.ingredients add column if not exists name_sk   text not null default '' check (length(name_sk) <= 60);
alter table public.ingredients add column if not exists desc_sk   text not null default '' check (length(desc_sk) <= 500);
alter table public.ingredients add column if not exists flavor_sk text[] not null default '{}';
alter table public.ingredients add column if not exists label_sk  text not null default '' check (length(label_sk) <= 80);

-- Vlastní ikonka suroviny (PNG s průhledným pozadím z administrace). Bez ní
-- web nakreslí vestavěnou (icons.js).
alter table public.ingredients add column if not exists icon_url text check (icon_url ~ '^https://');

-- Hotové směsi (Signature Blends na úvodní stránce).
create table if not exists public.blends (
    id          text primary key check (id ~ '^[a-z0-9_]{2,40}$'),
    name        text not null check (length(name) between 1 and 60),
    desc_cs     text not null default '' check (length(desc_cs) <= 500),
    desc_en     text not null default '' check (length(desc_en) <= 500),
    ingredients text[] not null check (cardinality(ingredients) between 1 and 3),
    emoji       text not null default '🍵' check (length(emoji) <= 16),
    is_preset   boolean not null default false,   -- ukázat jako rychlou volbu v mixéru
    photo_url   text check (photo_url ~ '^https://'),
    active      boolean not null default true,
    sort        integer not null default 0,
    updated_at  timestamptz not null default now()
);

-- Směs má až 5 surovin a ke každé díly 1–3 (2 díly = dvakrát víc než 1).
-- Bez dílů (starší řádky) platí 3 + 1 + 1.
alter table public.blends add column if not exists parts smallint[];
alter table public.blends add column if not exists desc_sk text not null default '' check (length(desc_sk) <= 500);
alter table public.blends drop constraint if exists blends_ingredients_check;
alter table public.blends add constraint blends_ingredients_check
    check (cardinality(ingredients) between 1 and 5);
alter table public.blends drop constraint if exists blends_parts_check;
alter table public.blends add constraint blends_parts_check
    check (parts is null or (cardinality(parts) = cardinality(ingredients)
                             and 1 <= all (parts) and 3 >= all (parts)));

-- Proč si koupit hotovou směs (listopad 2026): chvíle dne (barevný pruh na
-- etiketě a filtr na webu), „Proč to funguje“ a tip k přípravě, ve třech
-- jazycích. Prázdné = na webu se neukáže.
alter table public.blends add column if not exists moment text
    check (moment in ('morning', 'afternoon', 'evening', 'winter', 'summer'));
alter table public.blends add column if not exists story_cs text not null default '' check (length(story_cs) <= 600);
alter table public.blends add column if not exists story_en text not null default '' check (length(story_en) <= 600);
alter table public.blends add column if not exists story_sk text not null default '' check (length(story_sk) <= 600);
alter table public.blends add column if not exists tip_cs text not null default '' check (length(tip_cs) <= 300);
alter table public.blends add column if not exists tip_en text not null default '' check (length(tip_en) <= 300);
alter table public.blends add column if not exists tip_sk text not null default '' check (length(tip_sk) <= 300);

-- Ceník podle gramáže. Cena je za celé balení, ne za gram.
create table if not exists public.price_tiers (
    weight_g    integer primary key check (weight_g between 1 and 5000),
    price_czk   integer not null check (price_czk between 1 and 100000),
    active      boolean not null default true,
    updated_at  timestamptz not null default now()
);

-- Doprava. Web zná čtyři způsoby (post, zasilkovna, dpd, pickup = osobní
-- odběr) — tady se jim mění cena a dá se který vypnout.
create table if not exists public.shipping_methods (
    id          text primary key check (id ~ '^[a-z0-9_]{2,30}$'),
    name        text not null,
    price_czk   integer not null check (price_czk between 0 and 10000),
    active      boolean not null default true,
    sort        integer not null default 0,
    updated_at  timestamptz not null default now()
);

-- Nastavení obchodu. Vždy přesně jeden řádek (id = 1).
create table if not exists public.settings (
    id                   smallint primary key default 1 check (id = 1),
    free_ship_threshold  integer not null default 500 check (free_ship_threshold between 0 and 1000000),
    promo_bar_enabled    boolean not null default true,
    promo_bar_cs         text check (length(promo_bar_cs) <= 300),   -- prázdné = výchozí text webu
    promo_bar_en         text check (length(promo_bar_en) <= 300),
    updated_at           timestamptz not null default now()
);

-- Kdo prodává (patří do obchodních podmínek, patičky a na etiketu),
-- příplatek za dobírku a receptura, podle které web počítá podíly
-- surovin ve složení. Prázdné údaje web ukáže jako „[doplnit]“.
alter table public.settings add column if not exists seller_name    text not null default '' check (length(seller_name) <= 120);
alter table public.settings add column if not exists seller_ico     text not null default '' check (seller_ico ~ '^([0-9]{8})?$');
alter table public.settings add column if not exists seller_address text not null default '' check (length(seller_address) <= 200);
alter table public.settings add column if not exists seller_email   text not null default 'hello@teaseyou.cz' check (length(seller_email) <= 120);
alter table public.settings add column if not exists seller_phone   text not null default '' check (length(seller_phone) <= 30);
alter table public.settings add column if not exists cod_fee_czk    integer not null default 39 check (cod_fee_czk between 0 and 1000);
-- Účet pro platbu převodem (IBAN). Web podle něj po objednávce ukáže
-- údaje k platbě a QR kód. Prázdný = nic se neukáže.
alter table public.settings add column if not exists seller_iban    text not null default '' check (seller_iban ~ '^([A-Z]{2}[0-9]{2}[A-Z0-9]{11,30})?$');
-- Dárkové balení se vzkazem. Vypnuté, dokud ho nezapneš v administraci.
alter table public.settings add column if not exists gift_wrap_enabled boolean not null default false;
alter table public.settings add column if not exists gift_wrap_czk  integer not null default 0 check (gift_wrap_czk between 0 and 500);
-- Osobní odběr: kde a kdy si zákazník směs vyzvedne (ukáže se v pokladně).
alter table public.settings add column if not exists pickup_note    text not null default '' check (length(pickup_note) <= 200);
-- recipe_*_pct: pevný poměr základ/příchuť/doplněk z doby, kdy směs měla
-- tři sloty. Od listopadu 2026 si poměr volí zákazník díly a tyhle sloupce
-- se nepoužívají. Zůstávají kvůli starším zálohám.
alter table public.settings add column if not exists recipe_base_pct   smallint not null default 70 check (recipe_base_pct between 1 and 100);
alter table public.settings add column if not exists recipe_flavor_pct smallint not null default 20 check (recipe_flavor_pct between 0 and 99);
alter table public.settings add column if not exists recipe_extra_pct  smallint not null default 10 check (recipe_extra_pct between 0 and 99);
alter table public.settings add column if not exists durability_months smallint not null default 12 check (durability_months between 1 and 36);
-- Spuštění prodeje. Dokud je vypnuté, web ukazuje „Připravujeme spuštění“
-- a place_order() objednávky odmítne. Zapnout jde jen s vyplněným jménem,
-- IČO, adresou a e-mailem prodávajícího (§ 435 OZ, zákon 480/2004 § 5).
alter table public.settings add column if not exists sales_open      boolean not null default false;
alter table public.settings add column if not exists sales_opened_at timestamptz;

alter table public.settings add column if not exists promo_bar_sk text check (length(promo_bar_sk) <= 300);

-- Verze nabídky surovin. Když je nižší než ta v tomhle souboru, setup.sql
-- jednou převede katalog na novou nabídku (viz „Katalog v2“ na konci).
alter table public.settings add column if not exists catalog_version smallint not null default 0;

create or replace function public.check_sales_open()
returns trigger
language plpgsql
set search_path = public
as $$
declare
    v_check boolean := false;
begin
    -- Hlídá se jen zapnutí prodeje a změna údajů prodávajícího. Jiné úpravy
    -- nastavení (třeba čas noční zálohy) projdou vždycky.
    if new.sales_open then
        if tg_op = 'INSERT' then
            v_check := true;
        else
            v_check := not old.sales_open
                or (new.seller_name, new.seller_ico, new.seller_address, new.seller_email)
                   is distinct from (old.seller_name, old.seller_ico, old.seller_address, old.seller_email);
        end if;
    end if;
    if v_check and (btrim(new.seller_name) = '' or new.seller_ico = ''
                    or btrim(new.seller_address) = '' or btrim(new.seller_email) = '') then
        raise exception 'seller_missing' using errcode = 'P0001';
    end if;
    -- Den prvního spuštění si pamatujeme, od něj platí obchodní podmínky.
    -- Jednou zapsaný se nemění (ani vypnutím a zapnutím); obnova zálohy
    -- do prázdné databáze ho převezme ze zálohy.
    if tg_op = 'UPDATE' then
        new.sales_opened_at := coalesce(old.sales_opened_at, new.sales_opened_at);
    end if;
    if new.sales_open and new.sales_opened_at is null then
        new.sales_opened_at := now();
    end if;
    return new;
end;
$$;
drop trigger if exists settings_check_sales_open on public.settings;
create trigger settings_check_sales_open
    before insert or update on public.settings
    for each row execute function public.check_sales_open();
revoke all on function public.check_sales_open() from public, anon, authenticated;
do $$
begin
    if not exists (select 1 from pg_constraint where conname = 'settings_recipe_sum') then
        alter table public.settings add constraint settings_recipe_sum
            check (recipe_base_pct + recipe_flavor_pct + recipe_extra_pct = 100);
    end if;
end;
$$;

-- Slevové kódy. Veřejně se nedají vypsat — web se jen zeptá funkce
-- check_promo(), jestli konkrétní kód platí.
create table if not exists public.promo_codes (
    code        text primary key check (code ~ '^[A-Z0-9_-]{2,30}$'),
    rate        numeric(4, 3) not null check (rate > 0 and rate <= 0.9),
    active      boolean not null default true,
    valid_until date,
    max_uses    integer check (max_uses > 0),
    used_count  integer not null default 0,
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);


-- ─── OBJEDNÁVKY ─────────────────────────────────────────────────────

-- Zakládá je jen funkce place_order(), která si cenu spočítá sama
-- z ceníku. Co pošle prohlížeč za cenu, se ignoruje.
create table if not exists public.orders (
    id               bigint generated always as identity primary key,
    num              text unique,
    created_at       timestamptz not null default now(),
    status           text not null default 'new'
                     check (status in ('new', 'paid', 'shipped', 'done', 'cancelled')),
    first_name       text not null,
    last_name        text not null,
    email            text not null,
    phone            text not null,
    street           text not null,
    city             text not null,
    zip              text not null,
    country          text not null,
    note             text,
    shipping_method  text not null,
    shipping_name    text,
    packeta_point    text,
    packeta_point_id text,
    payment_method   text not null,
    items            jsonb not null,
    goods_czk        integer not null,
    discount_czk     integer not null default 0,
    shipping_czk     integer not null,
    total_czk        integer not null,
    promo_code       text,
    lang             text,
    admin_note       text,
    updated_at       timestamptz not null default now()
);
-- Příplatek za způsob platby (dobírka). Je součástí total_czk.
alter table public.orders add column if not exists payment_czk integer not null default 0;
-- Které znění obchodních podmínek zákazník při objednávce viděl (datum
-- verze). Spolu s created_at je to záznam o tom, s čím souhlasil.
alter table public.orders add column if not exists terms_version text check (terms_version ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$');
-- Kdy se z objednávky smazaly osobní údaje (viz purge_expired_data).
alter table public.orders add column if not exists contacts_purged_at timestamptz;
alter table public.orders add column if not exists anonymized_at timestamptz;
-- Dárek: zabalit, vzkaz na kartičku a cena balení (je součástí total_czk).
alter table public.orders add column if not exists gift_wrap    boolean not null default false;
alter table public.orders add column if not exists gift_message text check (length(gift_message) <= 300);
alter table public.orders add column if not exists gift_czk     integer not null default 0 check (gift_czk between 0 and 500);
create index if not exists orders_created_idx on public.orders (created_at desc);
create index if not exists orders_email_idx   on public.orders (email, created_at);


-- ─── updated_at triggery ────────────────────────────────────────────

do $$
declare t text;
begin
    foreach t in array array['ingredients', 'blends', 'price_tiers', 'shipping_methods',
                             'settings', 'promo_codes', 'orders'] loop
        execute format('drop trigger if exists %I_updated_at on public.%I', t, t);
        execute format('create trigger %I_updated_at before update on public.%I
                        for each row execute function public.set_updated_at()', t, t);
    end loop;
end;
$$;


-- ─── ROW LEVEL SECURITY ─────────────────────────────────────────────

alter table public.ingredients      enable row level security;
alter table public.blends           enable row level security;
alter table public.price_tiers      enable row level security;
alter table public.shipping_methods enable row level security;
alter table public.settings         enable row level security;
alter table public.promo_codes      enable row level security;
alter table public.orders           enable row level security;

-- Katalog: kdokoliv čte aktivní položky, admin vidí i skryté a smí měnit.
do $$
declare t text;
begin
    foreach t in array array['ingredients', 'blends', 'price_tiers', 'shipping_methods'] loop
        execute format('drop policy if exists "%s_read" on public.%I', t, t);
        execute format('create policy "%s_read" on public.%I for select
                        using (active or public.is_admin())', t, t);
        execute format('drop policy if exists "%s_admin" on public.%I', t, t);
        execute format('create policy "%s_admin" on public.%I for all to authenticated
                        using (public.is_admin()) with check (public.is_admin())', t, t);
    end loop;
end;
$$;

drop policy if exists "settings_read" on public.settings;
create policy "settings_read" on public.settings for select using (true);
-- Nastavení se nikdy nemaže, jen mění (ochrana před ztrátou dat).
drop policy if exists "settings_admin" on public.settings;
drop policy if exists "settings_admin_insert" on public.settings;
drop policy if exists "settings_admin_update" on public.settings;
create policy "settings_admin_insert" on public.settings for insert to authenticated
    with check (public.is_admin());
create policy "settings_admin_update" on public.settings for update to authenticated
    using (public.is_admin()) with check (public.is_admin());

-- Slevy a objednávky: jen admin. Žádná politika pro anon = anon nevidí nic.
drop policy if exists "promo_codes_admin" on public.promo_codes;
create policy "promo_codes_admin" on public.promo_codes for all to authenticated
    using (public.is_admin()) with check (public.is_admin());

-- Objednávky admin čte a mění (stav, poznámka), ale nikdy nemaže: patří
-- k dokladům. Staré osobní údaje z nich odstraňuje jen purge_expired_data().
drop policy if exists "orders_admin" on public.orders;
drop policy if exists "orders_admin_read" on public.orders;
drop policy if exists "orders_admin_update" on public.orders;
create policy "orders_admin_read" on public.orders for select to authenticated
    using (public.is_admin());
create policy "orders_admin_update" on public.orders for update to authenticated
    using (public.is_admin()) with check (public.is_admin());

-- Každý přihlášený vidí jen svůj vlastní řádek v admins (podle toho
-- administrace pozná, jestli tě pustit dál).
drop policy if exists "admins_self" on public.admins;
create policy "admins_self" on public.admins for select to authenticated
    using (user_id = auth.uid());


-- ─── PRÁVA ──────────────────────────────────────────────────────────
-- Supabase je většinou nastaví sám, ale nové projekty můžou mít
-- automatické zpřístupnění tabulek vypnuté. Tohle je jistota.

grant usage on schema public to anon, authenticated;
grant select on public.ingredients, public.blends, public.price_tiers,
                public.shipping_methods, public.settings
    to anon, authenticated;
grant insert, update, delete on public.ingredients, public.blends, public.price_tiers,
                public.shipping_methods
    to authenticated;
grant insert, update on public.settings to authenticated;
revoke delete on public.settings from anon, authenticated;
grant select, insert, update, delete on public.promo_codes to authenticated;
grant select, update on public.orders to authenticated;
revoke insert, delete on public.orders from anon, authenticated;
grant select on public.admins to authenticated;


-- ─── FUNKCE PRO WEB ─────────────────────────────────────────────────

-- Platí kód? Vrací {code, rate, label}, nebo null.
create or replace function public.check_promo(p_code text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
    select jsonb_build_object(
               'code',  code,
               'rate',  rate,
               'label', '-' || round(rate * 100)::text || '%')
    from public.promo_codes
    where code = upper(btrim(coalesce(p_code, '')))
      and active
      and (valid_until is null or valid_until >= current_date)
      and (max_uses is null or used_count < max_uses);
$$;

-- Receptura směsi: ze surovin a dílů spočítá podíly v %, gramy na sáček,
-- druh čaje (vyhláška 187/2023 Sb., § 2) a příplatek za prémiové suroviny.
-- Stejný výpočet dělá web (recipe.js), pravidla jsou popsaná tam. Počítá
-- se jen v celých číslech, ať web a databáze vyjdou vždy stejně.
--
-- Vrací { ok, error, error_code, category, surcharge, items: [{ code, name,
-- label, kind, parts, pct, grams, pinch }] }. Chyby: empty, too_many,
-- duplicate, bad_parts, unknown, too_many_pinch, no_main, over_limit,
-- no_category. Neaktivní suroviny bere taky (staré objednávky), to, jestli
-- se dají koupit, hlídá place_order.
create or replace function public.recipe_eval(p_codes text[], p_parts integer[], p_weight integer)
returns jsonb
language plpgsql
stable
set search_path = public
as $$
declare
    n         integer := coalesce(cardinality(p_codes), 0);
    v_parts   integer[];
    v_kind    text[]    := '{}';
    v_max     integer[] := '{}';
    v_sur     integer[] := '{}';
    v_name    text[]    := '{}';
    v_label   text[]    := '{}';
    v_pinch   boolean[] := '{}';
    v_pct     integer[] := '{}';
    v_rem     integer[] := '{}';
    v_rest    integer := 100;
    v_sum     integer := 0;
    v_npinch  integer := 0;
    v_left    integer;
    v_best    integer;
    v_cents   bigint := 0;
    v_tea     bigint := 0;
    v_herb    bigint := 0;
    v_fruit   bigint := 0;
    v_cat     text;
    v_items   jsonb := '[]'::jsonb;
    v_weight  integer := greatest(coalesce(p_weight, 0), 0);
    v_err     text;
    v_errcode text;
    ing       record;
    i         integer;
begin
    if n = 0 then return jsonb_build_object('ok', false, 'error', 'empty'); end if;
    if n > 5 then return jsonb_build_object('ok', false, 'error', 'too_many'); end if;
    if (select count(distinct c) from unnest(p_codes) as c) <> n or array_position(p_codes, null) is not null then
        return jsonb_build_object('ok', false, 'error', 'duplicate');
    end if;

    if p_parts is null then
        -- starší košíky a odkazy: 3 + 1 + 1
        v_parts := array(select case when g = 1 and n > 1 then 3 else 1 end from generate_series(1, n) as g);
    elsif cardinality(p_parts) <> n
          or exists (select 1 from unnest(p_parts) as x where x is null or x not between 1 and 3) then
        return jsonb_build_object('ok', false, 'error', 'bad_parts');
    else
        v_parts := p_parts;
    end if;

    for i in 1 .. n loop
        select coalesce(nullif(kind, ''), 'herb') as kind, max_pct, surcharge_czk, name_cs,
               coalesce(nullif(btrim(label_cs), ''), lower(name_cs)) as label
          into ing
          from public.ingredients where code = p_codes[i];
        if not found then
            return jsonb_build_object('ok', false, 'error', 'unknown', 'error_code', p_codes[i]);
        end if;
        v_kind[i]  := ing.kind;
        v_max[i]   := ing.max_pct;
        v_sur[i]   := greatest(coalesce(ing.surcharge_czk, 0), 0);
        v_name[i]  := ing.name_cs;
        v_label[i] := ing.label;
        v_pinch[i] := ing.max_pct is not null and ing.max_pct between 1 and 5;
        v_rem[i]   := -1;
        if v_pinch[i] then
            v_npinch := v_npinch + 1;
            v_pct[i] := least(4, ing.max_pct);
            v_rest := v_rest - v_pct[i];
        else
            v_pct[i] := 0;
            v_sum := v_sum + v_parts[i];
        end if;
    end loop;
    if v_npinch > 2 then return jsonb_build_object('ok', false, 'error', 'too_many_pinch'); end if;
    if v_sum = 0 then return jsonb_build_object('ok', false, 'error', 'no_main'); end if;

    -- celá procenta dolů, zbytek dostanou největší zbytky (při shodě ta víc vpředu)
    v_left := v_rest;
    for i in 1 .. n loop
        if not v_pinch[i] then
            v_pct[i] := (v_rest * v_parts[i]) / v_sum;
            v_rem[i] := (v_rest * v_parts[i]) % v_sum;
            v_left := v_left - v_pct[i];
        end if;
    end loop;
    while v_left > 0 loop
        v_best := null;
        for i in 1 .. n loop
            if v_rem[i] > 0 and (v_best is null or v_rem[i] > v_rem[v_best]) then v_best := i; end if;
        end loop;
        exit when v_best is null;
        v_pct[v_best] := v_pct[v_best] + 1;
        v_rem[v_best] := -1;
        v_left := v_left - 1;
    end loop;

    for i in 1 .. n loop
        v_cents := v_cents + v_pct[i]::bigint * v_weight * v_sur[i];
        if v_pinch[i] then
            if v_kind[i] = 'tea' then v_tea := v_tea + v_pct[i] * v_sum;
            elsif v_kind[i] = 'fruit' then v_fruit := v_fruit + v_pct[i] * v_sum;
            elsif v_kind[i] = 'herb' then v_herb := v_herb + v_pct[i] * v_sum; end if;
        else
            if v_err is null and v_max[i] is not null and v_rest * v_parts[i] > v_max[i] * v_sum then
                v_err := 'over_limit';
                v_errcode := p_codes[i];
            end if;
            if v_kind[i] = 'tea' then v_tea := v_tea + v_rest * v_parts[i];
            elsif v_kind[i] = 'fruit' then v_fruit := v_fruit + v_rest * v_parts[i];
            elsif v_kind[i] = 'herb' then v_herb := v_herb + v_rest * v_parts[i]; end if;
        end if;
        v_items := v_items || jsonb_build_object(
            'code', p_codes[i], 'name', v_name[i], 'label', v_label[i], 'kind', v_kind[i],
            'parts', v_parts[i], 'pct', v_pct[i], 'pinch', v_pinch[i],
            'grams', round(v_pct[i] * v_weight / 100.0, 1));
    end loop;

    v_cat := case when v_tea >= 50 * v_sum then 'tea'
                  when v_herb > 50 * v_sum then 'herb'
                  when v_fruit > 50 * v_sum then 'fruit' end;
    if v_err is null and v_cat is null then v_err := 'no_category'; end if;

    return jsonb_build_object(
        'ok', v_err is null, 'error', v_err, 'error_code', v_errcode, 'category', v_cat,
        'surcharge', (v_cents + 5000) / 10000, 'items', v_items);
end;
$$;
-- Volá ji place_order (běží s právy vlastníka). Zvenku není potřeba.
revoke all on function public.recipe_eval(text[], integer[], integer) from public, anon, authenticated;

-- Založí objednávku. Cenu počítá z ceníku v databázi, ne z toho, co
-- poslal prohlížeč. Chyby vrací jako krátký kód (invalid_customer,
-- out_of_stock, …), web je přeloží do lidské hlášky.
create or replace function public.place_order(p_order jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
    v_c          jsonb := coalesce(p_order -> 'customer', '{}'::jsonb);
    v_first      text  := btrim(coalesce(v_c ->> 'firstName', ''));
    v_last       text  := btrim(coalesce(v_c ->> 'lastName', ''));
    v_email      text  := lower(btrim(coalesce(v_c ->> 'email', '')));
    v_phone      text  := btrim(coalesce(v_c ->> 'phone', ''));
    v_street     text  := btrim(coalesce(v_c ->> 'street', ''));
    v_city       text  := btrim(coalesce(v_c ->> 'city', ''));
    v_zip        text  := btrim(coalesce(v_c ->> 'zip', ''));
    v_country    text  := upper(btrim(coalesce(v_c ->> 'country', '')));
    v_note       text  := nullif(left(btrim(coalesce(p_order ->> 'note', '')), 1000), '');
    v_ship_id    text  := btrim(coalesce(p_order ->> 'shipping', ''));
    v_pay        text  := btrim(coalesce(p_order ->> 'payment', ''));
    v_point      text  := left(btrim(coalesce(p_order -> 'packetaPoint' ->> 'name', '')), 300);
    v_point_id   text  := left(btrim(coalesce(p_order -> 'packetaPoint' ->> 'id', '')), 50);
    v_promo      text  := upper(btrim(coalesce(p_order ->> 'promo', '')));
    v_gift_wrap  boolean := coalesce(p_order -> 'gift' ->> 'wrap', '') = 'true';
    v_gift_msg   text  := nullif(left(btrim(coalesce(p_order -> 'gift' ->> 'message', '')), 300), '');
    v_gift_on    boolean;
    v_gift_fee   integer := 0;
    v_lang       text  := case when p_order ->> 'lang' in ('en', 'sk') then p_order ->> 'lang' else 'cs' end;
    v_terms      text  := case when coalesce(p_order ->> 'termsVersion', '') ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
                               then p_order ->> 'termsVersion' end;
    v_items      jsonb := p_order -> 'items';
    v_item       jsonb;
    v_lines      jsonb := '[]'::jsonb;
    v_codes      text[];
    v_parts      integer[];
    v_recipe     jsonb;
    v_names      jsonb;
    v_missing    text;
    v_weight     integer;
    v_qty        integer;
    v_unit       integer;
    v_name       text;
    v_goods      integer := 0;
    v_discount   integer := 0;
    v_shipping   integer;
    v_payfee     integer := 0;
    v_rate       numeric;
    v_threshold  integer;
    v_ship       public.shipping_methods%rowtype;
    v_id         bigint;
    v_num        text;
begin
    -- Před spuštěním prodeje nic nepřijímáme, ani když někdo obejde web.
    if not coalesce((select sales_open from public.settings where id = 1), false) then
        raise exception 'sales_closed' using errcode = 'P0001';
    end if;

    -- Zákazník: stejná pravidla jako formulář na webu. Při doručení na
    -- výdejní místo Zásilkovny a při osobním odběru adresu nepotřebujeme,
    -- tak ji nechceme (minimalizace údajů). Když ji někdo vyplní, musí být
    -- celá a platná.
    if length(v_first) not between 2 and 100
       or length(v_last) not between 2 and 100
       or length(v_email) > 200 or v_email !~ '^[^\s@]+@[^\s@]+\.[^\s@]+$'
       or v_phone !~ '^\+?[0-9][0-9 ]{7,14}$'
       or v_country not in ('CZ', 'SK') then
        raise exception 'invalid_customer' using errcode = 'P0001';
    end if;
    if (v_ship_id not in ('zasilkovna', 'pickup') or v_street <> '' or v_city <> '' or v_zip <> '')
       and (length(v_street) not between 3 and 200
            or length(v_city) not between 2 and 100
            or v_zip !~ '^[0-9]{3} ?[0-9]{2}$') then
        raise exception 'invalid_customer' using errcode = 'P0001';
    end if;

    -- Pojistka proti spamu: z jednoho e-mailu max. 5 objednávek za hodinu.
    if (select count(*) from public.orders
        where email = v_email and created_at > now() - interval '1 hour') >= 5 then
        raise exception 'too_many_orders' using errcode = 'P0001';
    end if;

    if jsonb_typeof(v_items) is distinct from 'array'
       or jsonb_array_length(v_items) not between 1 and 30 then
        raise exception 'invalid_items' using errcode = 'P0001';
    end if;

    for v_item in select value from jsonb_array_elements(v_items) loop
        if jsonb_typeof(v_item -> 'ingredients') is distinct from 'array' then
            raise exception 'invalid_items' using errcode = 'P0001';
        end if;

        select array_agg(x order by ord) into v_codes
        from jsonb_array_elements_text(v_item -> 'ingredients') with ordinality as e(x, ord)
        where x <> 'Empty';

        if v_codes is null or array_length(v_codes, 1) not between 1 and 5 then
            raise exception 'invalid_items' using errcode = 'P0001';
        end if;

        -- Díly ke každé surovině (1–3). Starší košíky je neposílají, pak 3 + 1 + 1.
        v_parts := null;
        if jsonb_typeof(v_item -> 'parts') = 'array' then
            select array_agg(case when jsonb_typeof(x) = 'number' and x::text ~ '^[1-3]$'
                                  then x::text::integer end order by ord)
              into v_parts
              from jsonb_array_elements(v_item -> 'parts') with ordinality as e(x, ord);
            if v_parts is null or cardinality(v_parts) <> cardinality(v_codes)
               or array_position(v_parts, null) is not null then
                raise exception 'invalid_items' using errcode = 'P0001';
            end if;
        elsif v_item ? 'parts' and jsonb_typeof(v_item -> 'parts') <> 'null' then
            raise exception 'invalid_items' using errcode = 'P0001';
        end if;

        select string_agg(c, ', ') into v_missing
        from unnest(v_codes) as c
        where not exists (select 1 from public.ingredients i where i.code = c and i.active);
        if v_missing is not null then
            raise exception 'unknown_ingredient' using errcode = 'P0001', detail = v_missing;
        end if;

        select string_agg(i.code, ', ') into v_missing
        from public.ingredients i
        where i.code = any (v_codes) and not i.in_stock;
        if v_missing is not null then
            raise exception 'out_of_stock' using errcode = 'P0001', detail = v_missing;
        end if;

        v_weight := case when coalesce(v_item ->> 'weight_g', '') ~ '^[0-9]{1,5}$'
                         then (v_item ->> 'weight_g')::integer end;
        select price_czk into v_unit from public.price_tiers where weight_g = v_weight and active;
        if v_unit is null then
            raise exception 'invalid_weight' using errcode = 'P0001';
        end if;

        v_qty := case when coalesce(v_item ->> 'qty', '') ~ '^[0-9]{1,3}$'
                      then (v_item ->> 'qty')::integer end;
        if v_qty is null or v_qty not between 1 and 50 then
            raise exception 'invalid_items' using errcode = 'P0001';
        end if;

        -- Poměr, limity z vyhlášky a druh čaje. Cena = ceník + příplatek za
        -- prémiové suroviny podle toho, kolik jich v sáčku je.
        v_recipe := public.recipe_eval(v_codes, v_parts, v_weight);
        if v_recipe ->> 'error' = 'bad_parts' or v_recipe ->> 'error' = 'duplicate' then
            raise exception 'invalid_items' using errcode = 'P0001';
        end if;
        if not (v_recipe ->> 'ok')::boolean then
            raise exception 'invalid_recipe' using errcode = 'P0001',
                detail = concat_ws(':', v_recipe ->> 'error', v_recipe ->> 'error_code');
        end if;

        v_name := left(btrim(coalesce(v_item ->> 'name', '')), 60);
        if v_name = '' then v_name := 'Custom Mix'; end if;

        select jsonb_agg(i.name_cs order by array_position(v_codes, i.code)) into v_names
        from public.ingredients i where i.code = any (v_codes);

        v_lines := v_lines || jsonb_build_array(jsonb_build_object(
            'name',             v_name,
            'ingredients',      to_jsonb(v_codes),
            'ingredient_names', v_names,
            'parts',            (select jsonb_agg((x ->> 'parts')::integer order by o)
                                   from jsonb_array_elements(v_recipe -> 'items') with ordinality as e(x, o)),
            'recipe',           (select jsonb_agg(jsonb_build_object('code', x -> 'code', 'name', x -> 'name',
                                                                     'parts', x -> 'parts', 'pct', x -> 'pct', 'grams', x -> 'grams')
                                             order by o)
                                   from jsonb_array_elements(v_recipe -> 'items') with ordinality as e(x, o)),
            'category',         v_recipe ->> 'category',
            'weight_g',         v_weight,
            'qty',              v_qty,
            'base_czk',         v_unit,
            'surcharge_czk',    (v_recipe ->> 'surcharge')::integer,
            'unit_czk',         v_unit + (v_recipe ->> 'surcharge')::integer,
            'line_czk',         (v_unit + (v_recipe ->> 'surcharge')::integer) * v_qty));
        v_goods := v_goods + (v_unit + (v_recipe ->> 'surcharge')::integer) * v_qty;
    end loop;

    select * into v_ship from public.shipping_methods where id = v_ship_id and active;
    if not found then
        raise exception 'invalid_shipping' using errcode = 'P0001';
    end if;
    if v_ship_id = 'zasilkovna' and v_point = '' then
        raise exception 'pickup_point_required' using errcode = 'P0001';
    end if;
    -- Platba kartou zatím není napojená na bránu, tak ji nebereme.
    if v_pay not in ('cod', 'transfer') then
        raise exception 'invalid_payment' using errcode = 'P0001';
    end if;

    -- Doprava zdarma se počítá z ceny zboží před slevou, stejně jako na webu.
    -- Příplatek za dobírku platí vždy, i při dopravě zdarma. Při osobním
    -- odběru se platí při předání a příplatek není.
    select free_ship_threshold, case when v_pay = 'cod' and v_ship_id <> 'pickup' then cod_fee_czk else 0 end,
           gift_wrap_enabled, gift_wrap_czk
      into v_threshold, v_payfee, v_gift_on, v_gift_fee
      from public.settings where id = 1;
    v_payfee := coalesce(v_payfee, 0);
    -- Dárkové balení jen když je zapnuté; vzkaz patří jen k dárku.
    if v_gift_wrap then
        if not coalesce(v_gift_on, false) then
            raise exception 'gift_unavailable' using errcode = 'P0001';
        end if;
        v_gift_fee := coalesce(v_gift_fee, 0);
    else
        v_gift_fee := 0;
        v_gift_msg := null;
    end if;
    v_shipping := case when v_threshold is not null and v_goods >= v_threshold
                       then 0 else v_ship.price_czk end;

    if v_promo <> '' then
        update public.promo_codes
           set used_count = used_count + 1
         where code = v_promo
           and active
           and (valid_until is null or valid_until >= current_date)
           and (max_uses is null or used_count < max_uses)
        returning rate into v_rate;
        if v_rate is null then
            raise exception 'promo_invalid' using errcode = 'P0001';
        end if;
        v_discount := round(v_goods * v_rate);
    else
        v_promo := null;
    end if;

    insert into public.orders (
        first_name, last_name, email, phone, street, city, zip, country, note,
        shipping_method, shipping_name, packeta_point, packeta_point_id, payment_method,
        items, goods_czk, discount_czk, shipping_czk, payment_czk, total_czk, promo_code, lang, terms_version,
        gift_wrap, gift_message, gift_czk)
    values (
        v_first, v_last, v_email, v_phone, v_street, v_city, v_zip, v_country, v_note,
        v_ship_id, v_ship.name, nullif(v_point, ''), nullif(v_point_id, ''), v_pay,
        v_lines, v_goods, v_discount, v_shipping, v_payfee,
        v_goods - v_discount + v_shipping + v_payfee + v_gift_fee, v_promo, v_lang, v_terms,
        v_gift_wrap, v_gift_msg, v_gift_fee)
    returning id into v_id;

    v_num := 'TY-' || lpad(v_id::text, 5, '0');
    update public.orders set num = v_num where id = v_id;

    return jsonb_build_object(
        'num',      v_num,
        'id',       v_id,
        'goods',    v_goods,
        'discount', v_discount,
        'shipping', v_shipping,
        'payment',  v_payfee,
        'gift',     v_gift_fee,
        'total',    v_goods - v_discount + v_shipping + v_payfee + v_gift_fee);
end;
$$;

revoke all on function public.place_order(jsonb) from public;
revoke all on function public.check_promo(text)  from public;
grant execute on function public.place_order(jsonb) to anon, authenticated;
grant execute on function public.check_promo(text)  to anon, authenticated;
grant execute on function public.is_admin()         to anon, authenticated;


-- ─── FOTKY ──────────────────────────────────────────────────────────
-- Veřejný bucket: fotky se zobrazí komukoliv, nahrávat smí jen admin.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
    set public = true,
        file_size_limit = excluded.file_size_limit,
        allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "photos_admin_select" on storage.objects;
create policy "photos_admin_select" on storage.objects for select to authenticated
    using (bucket_id = 'photos' and public.is_admin());
drop policy if exists "photos_admin_insert" on storage.objects;
create policy "photos_admin_insert" on storage.objects for insert to authenticated
    with check (bucket_id = 'photos' and public.is_admin());
drop policy if exists "photos_admin_update" on storage.objects;
create policy "photos_admin_update" on storage.objects for update to authenticated
    using (bucket_id = 'photos' and public.is_admin())
    with check (bucket_id = 'photos' and public.is_admin());
drop policy if exists "photos_admin_delete" on storage.objects;
create policy "photos_admin_delete" on storage.objects for delete to authenticated
    using (bucket_id = 'photos' and public.is_admin());


-- ─── MÝDLA A BALZÁMY ────────────────────────────────────────────────
-- Ručně dělaná mýdla a balzámy na rty ze stejných surovin jako čaj.
-- Zatím se neprodávají: web je ukazuje a sbírá e-maily lidí, kteří
-- chtějí vědět, až budou k mání. `ingredients` jsou kódy ingrediencí
-- z katalogu (Lavender, Green Tea…), web podle nich ukáže propojení
-- s čajem.

create table if not exists public.craft_products (
    id          text primary key check (id ~ '^[a-z0-9_]{2,40}$'),
    kind        text not null check (kind in ('soap', 'balm')),
    name_cs     text not null check (length(name_cs) between 1 and 60),
    name_en     text not null default '' check (length(name_en) <= 60),
    desc_cs     text not null default '' check (length(desc_cs) <= 500),
    desc_en     text not null default '' check (length(desc_en) <= 500),
    ingredients text[] not null default '{}' check (cardinality(ingredients) <= 4),
    color       text not null default '#d9c4a0' check (color ~* '^#[0-9a-f]{6}$'),
    photo_url   text check (photo_url ~ '^https://'),
    active      boolean not null default true,
    sort        integer not null default 0,
    updated_at  timestamptz not null default now()
);

-- Kdo chce dát vědět, až bude produkt k mání. Stejný e-mail u stejného
-- produktu je tu jen jednou.
create table if not exists public.craft_waitlist (
    id          bigint generated always as identity primary key,
    product_id  text not null references public.craft_products (id) on delete cascade,
    email       text not null check (length(email) <= 200 and email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
    lang        text not null default 'cs' check (lang in ('cs', 'en')),
    created_at  timestamptz not null default now(),
    unique (product_id, email)
);
alter table public.craft_waitlist drop constraint if exists craft_waitlist_lang_check;
alter table public.craft_waitlist add constraint craft_waitlist_lang_check check (lang in ('cs', 'sk', 'en'));
create index if not exists craft_waitlist_created_idx on public.craft_waitlist (created_at desc);
create index if not exists craft_waitlist_email_idx   on public.craft_waitlist (email, created_at);

drop trigger if exists craft_products_updated_at on public.craft_products;
create trigger craft_products_updated_at before update on public.craft_products
    for each row execute function public.set_updated_at();

alter table public.craft_products add column if not exists name_sk text not null default '' check (length(name_sk) <= 60);
alter table public.craft_products add column if not exists desc_sk text not null default '' check (length(desc_sk) <= 500);
alter table public.craft_products enable row level security;
alter table public.craft_waitlist enable row level security;

drop policy if exists "craft_products_read" on public.craft_products;
create policy "craft_products_read" on public.craft_products for select
    using (active or public.is_admin());
drop policy if exists "craft_products_admin" on public.craft_products;
create policy "craft_products_admin" on public.craft_products for all to authenticated
    using (public.is_admin()) with check (public.is_admin());
-- Seznam zájemců vidí jen admin. Web do něj zapisuje přes funkci níž.
drop policy if exists "craft_waitlist_admin" on public.craft_waitlist;
create policy "craft_waitlist_admin" on public.craft_waitlist for all to authenticated
    using (public.is_admin()) with check (public.is_admin());

grant select on public.craft_products to anon, authenticated;
grant insert, update, delete on public.craft_products to authenticated;
grant select, delete on public.craft_waitlist to authenticated;

-- Zápis do seznamu zájemců. Zkontroluje e-mail a produkt a z jednoho
-- e-mailu pustí nejvýš 10 zápisů za den.
create or replace function public.join_craft_waitlist(p_product text, p_email text, p_lang text default 'cs')
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
    v_email text := lower(btrim(coalesce(p_email, '')));
begin
    if length(v_email) > 200 or v_email !~ '^[^\s@]+@[^\s@]+\.[^\s@]+$' then
        raise exception 'invalid_email' using errcode = 'P0001';
    end if;
    if not exists (select 1 from public.craft_products where id = p_product and active) then
        raise exception 'unknown_product' using errcode = 'P0001';
    end if;
    if (select count(*) from public.craft_waitlist
        where email = v_email and created_at > now() - interval '1 day') >= 10 then
        raise exception 'too_many' using errcode = 'P0001';
    end if;
    insert into public.craft_waitlist (product_id, email, lang)
    values (p_product, v_email, case when p_lang in ('en', 'sk') then p_lang else 'cs' end)
    on conflict (product_id, email) do nothing;
    return true;
end;
$$;
revoke all on function public.join_craft_waitlist(text, text, text) from public;
grant execute on function public.join_craft_waitlist(text, text, text) to anon, authenticated;


-- ─── RECENZE ─────────────────────────────────────────────────────────
-- Hodnotit může jen ten, kdo u nás nakoupil: zná číslo objednávky a e-mail
-- z ní a objednávka už je odeslaná. Na web jde recenze až po schválení
-- v administraci. Schvalují se i kritické; odmítnout jde jen vulgární,
-- nesouvisející nebo s cizími osobními údaji. Jak recenze ověřujeme, web
-- píše u nich (zákon o ochraně spotřebitele, § 5a odst. 5).
create table if not exists public.reviews (
    id          bigint generated always as identity primary key,
    created_at  timestamptz not null default now(),
    order_id    bigint unique references public.orders (id) on delete set null,
    order_num   text not null check (order_num ~ '^TY-[0-9A-Z]{3,12}$'),
    blends      text[] not null default '{}',     -- hotové směsi z objednávky
    rating      smallint not null check (rating between 1 and 5),
    body        text not null default '' check (length(body) <= 1000),
    author      text not null check (length(author) between 2 and 40),
    lang        text not null default 'cs' check (lang in ('cs', 'sk', 'en')),
    status      text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
    reply       text not null default '' check (length(reply) <= 1000),
    approved_at timestamptz,
    updated_at  timestamptz not null default now()
);
create index if not exists reviews_status_idx on public.reviews (status, created_at desc);
drop trigger if exists reviews_updated_at on public.reviews;
create trigger reviews_updated_at before update on public.reviews
    for each row execute function public.set_updated_at();
alter table public.reviews enable row level security;
drop policy if exists "reviews_admin" on public.reviews;
create policy "reviews_admin" on public.reviews for all to authenticated
    using (public.is_admin()) with check (public.is_admin());
revoke all on public.reviews from anon;   -- web čte jen přes public_reviews()
grant select, update, delete on public.reviews to authenticated;

-- Schválení si pamatuje datum (kvůli pořadí na webu).
create or replace function public.reviews_approved_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
    if new.status = 'approved' and (tg_op = 'INSERT' or old.status is distinct from 'approved') then
        new.approved_at := now();
    elsif new.status <> 'approved' then
        new.approved_at := null;
    end if;
    return new;
end;
$$;
drop trigger if exists reviews_approved on public.reviews;
create trigger reviews_approved before insert or update of status on public.reviews
    for each row execute function public.reviews_approved_at();

create or replace function public.submit_review(p jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
    v_num    text := upper(btrim(coalesce(p ->> 'orderNum', '')));
    v_email  text := lower(btrim(coalesce(p ->> 'email', '')));
    v_body   text := left(btrim(coalesce(p ->> 'body', '')), 1000);
    v_author text := left(btrim(regexp_replace(coalesce(p ->> 'author', ''), '\s+', ' ', 'g')), 40);
    v_lang   text := case when p ->> 'lang' in ('en', 'sk') then p ->> 'lang' else 'cs' end;
    v_rating integer;
    v_order  public.orders%rowtype;
    v_blends text[];
begin
    if coalesce(p ->> 'consent', '') <> 'true' then
        raise exception 'review_consent' using errcode = 'P0001';
    end if;
    if v_num !~ '^TY-[0-9A-Z]{3,12}$' then
        raise exception 'invalid_order_num' using errcode = 'P0001';
    end if;
    v_rating := case when coalesce(p ->> 'rating', '') ~ '^[1-5]$' then (p ->> 'rating')::integer end;
    if v_rating is null or length(v_author) < 2 then
        raise exception 'invalid_review' using errcode = 'P0001';
    end if;
    -- pojistka proti zahlcení
    if (select count(*) from public.reviews where created_at > now() - interval '1 hour') >= 30 then
        raise exception 'too_many' using errcode = 'P0001';
    end if;
    select * into v_order from public.orders where num = v_num and email = v_email;
    if not found then
        raise exception 'review_not_found' using errcode = 'P0001';
    end if;
    if v_order.status not in ('shipped', 'done') then
        raise exception 'review_too_early' using errcode = 'P0001';
    end if;
    if exists (select 1 from public.reviews where order_id = v_order.id) then
        raise exception 'review_exists' using errcode = 'P0001';
    end if;
    select coalesce(array_agg(distinct b.id), '{}') into v_blends
      from jsonb_array_elements(v_order.items) i
      join public.blends b on b.name = i ->> 'name';
    insert into public.reviews (order_id, order_num, blends, rating, body, author, lang)
    values (v_order.id, v_order.num, v_blends, v_rating, v_body, v_author, v_lang);
    return jsonb_build_object('ok', true);
end;
$$;
revoke all on function public.submit_review(jsonb) from public;
grant execute on function public.submit_review(jsonb) to anon, authenticated;

-- Schválené recenze pro web: průměr, počet a posledních 12. S p_blend jen
-- ty, kde zákazník tu hotovou směs koupil. Číslo objednávky ani e-mail ven nejdou.
create or replace function public.public_reviews(p_blend text default null)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
    with r as (
        select rating, body, author, lang, reply, created_at, approved_at
          from public.reviews
         where status = 'approved' and (p_blend is null or p_blend = any (blends))
    )
    select jsonb_build_object(
        'count',   (select count(*) from r),
        'average', (select round(avg(rating)::numeric, 1) from r),
        'items',   coalesce((select jsonb_agg(jsonb_build_object(
                        'rating', rating, 'body', body, 'author', author, 'lang', lang,
                        'reply', reply, 'date', to_char(created_at, 'YYYY-MM-DD')) order by approved_at desc)
                      from (select * from r order by approved_at desc limit 12) x), '[]'::jsonb));
$$;
revoke all on function public.public_reviews(text) from public;
grant execute on function public.public_reviews(text) to anon, authenticated;


-- ─── ODSTOUPENÍ OD SMLOUVY ───────────────────────────────────────────
-- Online odstoupení přes tlačítko „Odstoupit od smlouvy“ (§ 1830a
-- občanského zákoníku podle zákona č. 159/2026 Sb., od 1. 1. 2027).
-- Web zapisuje jen přes submit_withdrawal(), číst a měnit smí jen admin.
create table if not exists public.withdrawals (
    id            bigint generated always as identity primary key,
    created_at    timestamptz not null default now(),
    order_num     text not null check (order_num ~ '^TY-[0-9A-Z]{3,12}$'),
    order_id      bigint references public.orders (id) on delete set null,
    name          text not null check (length(name) between 2 and 200),
    email         text not null check (length(email) <= 200 and email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
    items         text not null default '' check (length(items) <= 1000),
    bank_account  text not null default '' check (length(bank_account) <= 60),
    note          text not null default '' check (length(note) <= 1000),
    status        text not null default 'new' check (status in ('new', 'confirmed', 'refunded', 'rejected')),
    confirmed_at  timestamptz,
    admin_note    text not null default '' check (length(admin_note) <= 1000),
    updated_at    timestamptz not null default now()
);
create index if not exists withdrawals_created_idx on public.withdrawals (created_at desc);
create index if not exists withdrawals_email_idx   on public.withdrawals (email, created_at);

create or replace function public.submit_withdrawal(p jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
    v_num     text := upper(btrim(coalesce(p ->> 'orderNum', '')));
    v_name    text := btrim(coalesce(p ->> 'name', ''));
    v_email   text := lower(btrim(coalesce(p ->> 'email', '')));
    v_items   text := left(btrim(coalesce(p ->> 'items', '')), 1000);
    v_account text := left(btrim(coalesce(p ->> 'bankAccount', '')), 60);
    v_note    text := left(btrim(coalesce(p ->> 'note', '')), 1000);
    v_order   bigint;
    v_row     public.withdrawals%rowtype;
begin
    if v_num !~ '^TY-[0-9A-Z]{3,12}$' then
        raise exception 'invalid_order_num' using errcode = 'P0001';
    end if;
    if length(v_name) not between 2 and 200
       or length(v_email) > 200 or v_email !~ '^[^\s@]+@[^\s@]+\.[^\s@]+$' then
        raise exception 'invalid_customer' using errcode = 'P0001';
    end if;
    if (select count(*) from public.withdrawals
        where email = v_email and created_at > now() - interval '1 day') >= 5 then
        raise exception 'too_many' using errcode = 'P0001';
    end if;
    -- Objednávku přiřadíme jen tehdy, když sedí i e-mail. Když nesedí,
    -- odstoupení se stejně uloží (zákon ho nedovoluje odmítnout kvůli
    -- překlepu) a admin si ho dohledá.
    select id into v_order from public.orders where num = v_num and email = v_email;
    insert into public.withdrawals (order_num, order_id, name, email, items, bank_account, note)
    values (v_num, v_order, v_name, v_email, v_items, v_account, v_note)
    returning * into v_row;
    return jsonb_build_object('id', v_row.id, 'created_at', v_row.created_at, 'matched', v_order is not null);
end;
$$;
revoke all on function public.submit_withdrawal(jsonb) from public;
grant execute on function public.submit_withdrawal(jsonb) to anon, authenticated;


-- ─── OSOBNÍ ÚDAJE: ŽÁDOSTI A ÚKLID ───────────────────────────────────
-- Záznam žádostí podle GDPR (kdo chtěl kopii nebo výmaz, kdy a jak se
-- vyřídila), aby šlo doložit, že se odpovědělo do měsíce.
create table if not exists public.privacy_requests (
    id          bigint generated always as identity primary key,
    created_at  timestamptz not null default now(),
    email       text not null check (length(email) <= 200),
    kind        text not null check (kind in ('access', 'erasure', 'correction', 'objection', 'other')),
    note        text not null default '' check (length(note) <= 1000),
    done_at     timestamptz,
    updated_at  timestamptz not null default now()
);

-- Odstoupení a žádosti jsou záznamy, které musíme umět doložit: admin je
-- čte a mění stav, mazat je smí jen úklid po uplynutí lhůty.
do $$
declare t text;
begin
    foreach t in array array['withdrawals', 'privacy_requests'] loop
        execute format('drop trigger if exists %I_updated_at on public.%I', t, t);
        execute format('create trigger %I_updated_at before update on public.%I
                        for each row execute function public.set_updated_at()', t, t);
        execute format('alter table public.%I enable row level security', t);
        execute format('drop policy if exists "%s_admin" on public.%I', t, t);
        execute format('drop policy if exists "%s_admin_read" on public.%I', t, t);
        execute format('drop policy if exists "%s_admin_update" on public.%I', t, t);
        execute format('create policy "%s_admin_read" on public.%I for select to authenticated
                        using (public.is_admin())', t, t);
        execute format('create policy "%s_admin_update" on public.%I for update to authenticated
                        using (public.is_admin()) with check (public.is_admin())', t, t);
        execute format('revoke all on public.%I from anon', t);
        execute format('revoke delete on public.%I from authenticated', t);
        execute format('grant select, update on public.%I to authenticated', t);
    end loop;
    drop policy if exists "privacy_requests_admin_insert" on public.privacy_requests;
    create policy "privacy_requests_admin_insert" on public.privacy_requests for insert to authenticated
        with check (public.is_admin());
    grant insert on public.privacy_requests to authenticated;
end;
$$;

-- Úklid podle zásad ochrany osobních údajů. Spouští ho administrace při
-- každém přihlášení, smí ho zavolat jen admin.
--   e-maily pro upozornění na mýdla a balzámy   smazat po 2 letech
--   kontakt a poznámka u objednávky             smazat po 5 letech
--   jméno a adresa u objednávky, odstoupení     smazat po 10 letech
--   záznamy o žádostech podle GDPR               smazat po 5 letech
create or replace function public.purge_expired_data()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
    v_wait int; v_contacts int; v_names int; v_wd int; v_req int;
begin
    if not public.is_admin() then
        raise exception 'not_admin' using errcode = '42501';
    end if;
    -- Mazání po uplynutí lhůty je záměrné a konečné: nejde do koše a nevadí
    -- mu limit hromadného mazání (platí jen do konce téhle transakce).
    perform set_config('teaseyou.skip_trash', 'on', true);
    perform set_config('teaseyou.allow_bulk', 'on', true);
    delete from public.craft_waitlist where created_at < now() - interval '2 years';
    get diagnostics v_wait = row_count;
    update public.orders
       set email = 'smazano@example.invalid', phone = '', note = null, admin_note = null,
           gift_message = null, contacts_purged_at = now()
     where created_at < now() - interval '5 years' and contacts_purged_at is null;
    get diagnostics v_contacts = row_count;
    update public.orders
       set first_name = '—', last_name = '—', street = '', city = '', zip = '',
           packeta_point = null, packeta_point_id = null, anonymized_at = now()
     where created_at < now() - interval '10 years' and anonymized_at is null;
    get diagnostics v_names = row_count;
    delete from public.withdrawals where created_at < now() - interval '10 years';
    get diagnostics v_wd = row_count;
    delete from public.privacy_requests where created_at < now() - interval '5 years';
    get diagnostics v_req = row_count;
    -- Recenze, které se nezveřejnily (čekají nebo jsou odmítnuté), po půl roce.
    delete from public.reviews where status <> 'approved' and created_at < now() - interval '6 months';
    -- Koš: smazané položky držíme 30 dní, pak zmizí úplně.
    if to_regclass('public.deleted_rows') is not null then
        delete from public.deleted_rows where deleted_at < now() - interval '30 days';
    end if;
    return jsonb_build_object('waitlist', v_wait, 'order_contacts', v_contacts, 'order_names', v_names,
                              'withdrawals', v_wd, 'privacy_requests', v_req);
end;
$$;
revoke all on function public.purge_expired_data() from public;
grant execute on function public.purge_expired_data() to authenticated;


-- ─── NÁKUP: DODAVATELÉ, SUROVINY, NABÍDKY, ÚKOLY ────────────────────
-- Pracovní deník pro hledání dodavatelů. Vidí a mění ho jen admin;
-- web pro zákazníky k těmhle tabulkám nemá žádný přístup.

create table if not exists public.purchase_suppliers (
    id           uuid primary key default gen_random_uuid(),
    name         text not null check (length(name) between 1 and 120),
    status       text not null default 'find'
                 check (status in ('find', 'contacted', 'samples', 'testing', 'approved', 'rejected')),
    website      text not null default '' check (length(website) <= 300),
    contact      text not null default '' check (length(contact) <= 200),
    email        text not null default '' check (length(email) <= 200),
    phone        text not null default '' check (length(phone) <= 50),
    supplies     text not null default '' check (length(supplies) <= 500),
    min_order    text not null default '' check (length(min_order) <= 200),
    lead_time    text not null default '' check (length(lead_time) <= 200),
    certificates text not null default '' check (length(certificates) <= 300),
    notes        text not null default '' check (length(notes) <= 5000),
    last_contact date,
    created_at   timestamptz not null default now(),
    updated_at   timestamptz not null default now()
);

-- Suroviny: všechno, co se kupuje. U bylinek a čajů z obchodu je vyplněný
-- ingredient_code (odkaz na ingredienci v obchodě), suroviny jen na mýdla
-- a balzámy (oleje, vosk, louh…) ho mají prázdný.
create table if not exists public.purchase_materials (
    id              uuid primary key default gen_random_uuid(),
    name            text not null unique check (length(name) between 1 and 120),
    ingredient_code text check (ingredient_code is null or length(ingredient_code) <= 40),
    for_tea         boolean not null default false,
    for_soap        boolean not null default false,
    for_balm        boolean not null default false,
    status          text not null default 'research'
                    check (status in ('research', 'testing', 'approved', 'dropped')),
    notes           text not null default '' check (length(notes) <= 10000),
    sources         text not null default '' check (length(sources) <= 3000),
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now()
);

-- Nabídka = jeden dodavatel a jedna surovina: cena, vzorek, hodnocení.
create table if not exists public.purchase_offers (
    id          uuid primary key default gen_random_uuid(),
    supplier_id uuid not null references public.purchase_suppliers (id) on delete cascade,
    material_id uuid not null references public.purchase_materials (id) on delete cascade,
    price_czk   numeric(10, 2) check (price_czk >= 0),
    amount_g    integer check (amount_g between 1 and 10000000),   -- za kolik gramů je cena
    sample      text not null default 'none' check (sample in ('none', 'requested', 'received')),
    rating      smallint check (rating between 1 and 5),
    note        text not null default '' check (length(note) <= 2000),
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);
create index if not exists purchase_offers_material_idx on public.purchase_offers (material_id);
create index if not exists purchase_offers_supplier_idx on public.purchase_offers (supplier_id);

create table if not exists public.purchase_tasks (
    id          uuid primary key default gen_random_uuid(),
    title       text not null check (length(title) between 1 and 300),
    done        boolean not null default false,
    due         date,
    who         text not null default '' check (length(who) <= 60),
    supplier_id uuid references public.purchase_suppliers (id) on delete set null,
    material_id uuid references public.purchase_materials (id) on delete set null,
    done_at     timestamptz,
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

do $$
declare t text;
begin
    foreach t in array array['purchase_suppliers', 'purchase_materials', 'purchase_offers', 'purchase_tasks'] loop
        execute format('drop trigger if exists %I_updated_at on public.%I', t, t);
        execute format('create trigger %I_updated_at before update on public.%I
                        for each row execute function public.set_updated_at()', t, t);
        execute format('alter table public.%I enable row level security', t);
        execute format('drop policy if exists "%s_admin" on public.%I', t, t);
        execute format('create policy "%s_admin" on public.%I for all to authenticated
                        using (public.is_admin()) with check (public.is_admin())', t, t);
        execute format('revoke all on public.%I from anon', t);
        execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    end loop;
end;
$$;


-- ─── VÝCHOZÍ DATA ───────────────────────────────────────────────────
-- Přesně to, co je teď natvrdo ve webu. Vloží se jen jednou.

insert into public.ingredients
    (id, code, category, name_cs, name_en, desc_cs, desc_en, emoji, color, caffeine,
     flavor_cs, flavor_en, pairs, brew_temp, brew_time, sort, kind, label_cs, max_pct, surcharge_czk,
     name_sk, desc_sk, flavor_sk, label_sk)
values
    ('green_tea', 'Green Tea', 'base', 'Zelený čaj', 'Green Tea', 'Svěží a zemitý, nízký kofein.', 'Fresh and earthy, light caffeine.', '🍃', '#8da676', 2, array['zemitá', 'svěží', 'travnatá']::text[], array['earthy', 'fresh', 'grassy']::text[], array['Mint', 'Lemon', 'Ginger', 'Lemongrass']::text[], '75–80°C', '2–3 min', 10, 'tea', 'zelený čaj', null, 0, 'Zelený čaj', 'Svieži a zemitý, málo kofeínu.', array['zemitá', 'svieža', 'trávová']::text[], 'zelený čaj'),
    ('black_tea', 'Black Tea', 'base', 'Černý čaj', 'Black Tea', 'Silný a výrazný, vysoký kofein.', 'Strong and bold, high caffeine.', '🖤', '#4a3b32', 4, array['výrazná', 'sladová', 'silná']::text[], array['bold', 'malty', 'robust']::text[], array['Orange', 'Ginger', 'Cinnamon', 'Cardamom']::text[], '90–95°C', '3–4 min', 20, 'tea', 'černý čaj', null, 0, 'Čierny čaj', 'Silný a výrazný, veľa kofeínu.', array['výrazná', 'sladová', 'silná']::text[], 'čierny čaj'),
    ('white_tea', 'White Tea', 'base', 'Bílý čaj', 'White Tea', 'Jemný a sladký, nízký kofein.', 'Delicate and sweet, low caffeine.', '🤍', '#f5e6d3', 1, array['jemná', 'sladká', 'květinová']::text[], array['delicate', 'sweet', 'floral']::text[], array['Rose', 'Strawberry', 'Raspberry', 'Lemon Balm']::text[], '75–80°C', '2–3 min', 30, 'tea', 'bílý čaj', null, 50, 'Biely čaj', 'Jemný a sladký, málo kofeínu.', array['jemná', 'sladká', 'kvetinová']::text[], 'biely čaj'),
    ('oolong', 'Oolong Tea', 'base', 'Oolong', 'Oolong Tea', 'Komplexní a květinový, střední kofein.', 'Complex and floral, medium caffeine.', '🍵', '#c8a0b4', 3, array['komplexní', 'květinová', 'pražená']::text[], array['complex', 'floral', 'toasty']::text[], array['Rose', 'Lavender', 'Orange']::text[], '85–90°C', '3–4 min', 40, 'tea', 'čaj oolong', null, 40, 'Oolong', 'Komplexný a kvetinový, stredne veľa kofeínu.', array['komplexná', 'kvetinová', 'pražená']::text[], 'čaj oolong'),
    ('rooibos', 'Rooibos', 'base', 'Rooibos', 'Rooibos', 'Zemitý a sladký, bez kofeinu.', 'Earthy and sweet, caffeine-free.', '🌿', '#e8720c', 0, array['zemitá', 'sladká', 'oříšková']::text[], array['earthy', 'sweet', 'nutty']::text[], array['Orange', 'Cinnamon', 'Rose Hip']::text[], '100°C', '5–7 min', 50, 'herb', 'rooibos', null, 0, 'Rooibos', 'Zemitý a sladký, bez kofeínu.', array['zemitá', 'sladká', 'oriešková']::text[], 'rooibos'),
    ('chamomile', 'Chamomile', 'base', 'Heřmánek', 'Chamomile', 'Jemný, květinový, trochu jablečný. Bez kofeinu.', 'Gentle, floral, a little like apple. Caffeine-free.', '🌼', '#f5d78e', 0, array['květinová', 'jablečná', 'jemná']::text[], array['floral', 'apple', 'mild']::text[], array['Lavender', 'Lemon Balm', 'Apple']::text[], '100°C', '5–7 min', 60, 'herb', 'heřmánek (květ)', null, 0, 'Harmanček', 'Jemný, kvetinový, trochu jablkový. Bez kofeínu.', array['kvetinová', 'jablková', 'jemná']::text[], 'harmanček (kvet)'),
    ('lemon_balm', 'Lemon Balm', 'base', 'Meduňka', 'Lemon Balm', 'Jemně citronová a svěží, bez kofeinu.', 'Softly lemony and fresh, caffeine-free.', '🍀', '#9cc26a', 0, array['citronová', 'svěží', 'bylinková']::text[], array['citrusy', 'fresh', 'herby']::text[], array['Chamomile', 'Linden', 'Mint', 'Lemon']::text[], '100°C', '5–7 min', 70, 'herb', 'meduňka (list)', null, 0, 'Medovka', 'Jemne citrónová a svieža, bez kofeínu.', array['citrónová', 'svieža', 'bylinková']::text[], 'medovka (list)'),
    ('linden', 'Linden', 'base', 'Lípa', 'Linden', 'Medově sladký květ, bez kofeinu.', 'Honey-sweet blossom, caffeine-free.', '🌸', '#e6d58a', 0, array['sladká', 'květinová', 'jemná']::text[], array['sweet', 'floral', 'delicate']::text[], array['Chamomile', 'Lemon Balm', 'Lemon']::text[], '100°C', '5–7 min', 80, 'herb', 'lipový květ', null, 0, 'Lipa', 'Medovo sladký kvet, bez kofeínu.', array['sladká', 'kvetinová', 'jemná']::text[], 'lipový kvet'),
    ('mint', 'Mint', 'base', 'Máta peprná', 'Peppermint', 'Chladivá a svěží, výrazná. Bez kofeinu.', 'Cooling and fresh, bright. Caffeine-free.', '🌱', '#4caf50', 0, array['chladivá', 'svěží', 'jiskřivá']::text[], array['cooling', 'fresh', 'bright']::text[], array['Green Tea', 'Lemon', 'Lemon Balm']::text[], '100°C', '5–7 min', 90, 'herb', 'máta peprná (list)', null, 0, 'Mäta pieporná', 'Chladivá a svieža, výrazná. Bez kofeínu.', array['chladivá', 'svieža', 'iskrivá']::text[], 'mäta pieporná (list)'),
    ('apple', 'Apple', 'base', 'Jablko', 'Apple', 'Sladké a šťavnaté, základ ovocných čajů.', 'Sweet and juicy, the base of fruit teas.', '🍎', '#d9a35b', 0, array['sladká', 'ovocná', 'hřejivá']::text[], array['sweet', 'fruity', 'warm']::text[], array['Cinnamon', 'Hibiscus', 'Rose Hip', 'Strawberry']::text[], '100°C', '8–10 min', 100, 'fruit', 'sušená jablka', null, 0, 'Jablko', 'Sladké a šťavnaté, základ ovocných čajov.', array['sladká', 'ovocná', 'hrejivá']::text[], 'sušené jablká'),
    ('strawberry', 'Strawberry', 'flavor', 'Jahoda', 'Strawberry', 'Sladká a ovocná, letní.', 'Sweet and fruity, summery.', '🍓', '#cc4747', null, array['sladká', 'ovocná', 'letní']::text[], array['sweet', 'fruity', 'summery']::text[], array['White Tea', 'Rooibos', 'Mint']::text[], null, null, 110, 'fruit', 'sušené jahody', null, 25, 'Jahoda', 'Sladká a ovocná, letná.', array['sladká', 'ovocná', 'letná']::text[], 'sušené jahody'),
    ('raspberry', 'Raspberry', 'flavor', 'Malina', 'Raspberry', 'Nakyslá, ovocná a živá.', 'Tart, fruity and vibrant.', '🍇', '#e91e8c', null, array['nakyslá', 'ovocná', 'živá']::text[], array['tart', 'fruity', 'vibrant']::text[], array['Green Tea', 'Hibiscus', 'Mint']::text[], null, null, 120, 'fruit', 'sušené maliny', null, 25, 'Malina', 'Kyslastá, ovocná a živá.', array['kyslastá', 'ovocná', 'živá']::text[], 'sušené maliny'),
    ('blueberry', 'Blueberry', 'flavor', 'Borůvka', 'Blueberry', 'Sladká a nakyslá, chutná jako léto.', 'Sweet and tart, tastes like summer.', '🫐', '#9b59b6', null, array['sladká', 'ovocná', 'nakyslá']::text[], array['sweet', 'fruity', 'tart']::text[], array['Black Tea', 'Apple', 'Lemon']::text[], null, null, 130, 'fruit', 'sušené borůvky', null, 0, 'Čučoriedka', 'Sladká a kyslastá, chutí ako leto.', array['sladká', 'ovocná', 'kyslastá']::text[], 'sušené čučoriedky'),
    ('rose_hip', 'Rose Hip', 'flavor', 'Šípek', 'Rose Hip', 'Nakyslý, ovocný a svěží.', 'Tart, fruity and tangy.', '🔴', '#f8bbd0', null, array['nakyslá', 'ovocná', 'svěží']::text[], array['tart', 'fruity', 'tangy']::text[], array['Hibiscus', 'Apple', 'Rooibos']::text[], null, null, 140, 'fruit', 'šípek', null, 0, 'Šípka', 'Kyslastá, ovocná a svieža.', array['kyslastá', 'ovocná', 'svieža']::text[], 'šípky'),
    ('hibiscus', 'Hibiscus', 'flavor', 'Ibišek', 'Hibiscus', 'Rubínová barva a příjemná kyselost.', 'Ruby colour and a pleasant tartness.', '🌺', '#b0234a', null, array['nakyslá', 'ovocná', 'živá']::text[], array['tart', 'fruity', 'vibrant']::text[], array['Rose Hip', 'Apple', 'Strawberry']::text[], null, null, 150, 'herb', 'ibišek (květ)', null, 0, 'Ibištek', 'Rubínová farba a príjemná kyslosť.', array['kyslastá', 'ovocná', 'živá']::text[], 'ibištek (kvet)'),
    ('rose', 'Rose', 'flavor', 'Růže', 'Rose', 'Květinová a jemná.', 'Floral and delicate.', '🌹', '#e8607a', null, array['květinová', 'romantická', 'lehká']::text[], array['floral', 'romantic', 'light']::text[], array['White Tea', 'Oolong Tea', 'Lavender']::text[], null, null, 160, 'herb', 'růže (okvětní lístky)', null, 30, 'Ruža', 'Kvetinová a jemná.', array['kvetinová', 'romantická', 'ľahká']::text[], 'ruža (okvetné lístky)'),
    ('spearmint', 'Spearmint', 'flavor', 'Máta kadeřavá', 'Curly Mint', 'Sladší a jemnější než peprná.', 'Sweeter and softer than peppermint.', '🌿', '#a8d8a8', null, array['chladivá', 'sladká', 'jemná']::text[], array['cool', 'sweet', 'mild']::text[], array['Rooibos', 'Green Tea', 'Lemon']::text[], null, null, 170, 'herb', 'máta kadeřavá (list)', null, 0, 'Mäta kučeravá', 'Sladšia a jemnejšia ako pieporná.', array['chladivá', 'sladká', 'jemná']::text[], 'mäta kučeravá (list)'),
    ('lemongrass', 'Lemongrass', 'flavor', 'Citronová tráva', 'Lemongrass', 'Vůně citronu bez kyselosti.', 'Lemon scent without the sourness.', '🌾', '#c9d77b', null, array['citrusová', 'svěží', 'travnatá']::text[], array['citrusy', 'fresh', 'grassy']::text[], array['Green Tea', 'Ginger', 'Lemon Balm']::text[], null, null, 180, 'herb', 'citronová tráva (list)', 30, 0, 'Citrónová tráva', 'Vôňa citróna bez kyslosti.', array['citrusová', 'svieža', 'trávová']::text[], 'citrónová tráva (list)'),
    ('fennel', 'Fennel', 'flavor', 'Fenykl', 'Fennel', 'Nasládlý, s tónem anýzu.', 'Sweetish, with a hint of anise.', '✳️', '#a4b36b', null, array['sladká', 'kořeněná', 'jemná']::text[], array['sweet', 'spicy', 'mild']::text[], array['Chamomile', 'Mint', 'Lemon Balm']::text[], null, null, 190, 'herb', 'fenykl (plod)', null, 0, 'Fenikel', 'Nasladlý, s tónom anízu.', array['sladká', 'korenistá', 'jemná']::text[], 'fenikel (plod)'),
    ('orange', 'Orange', 'extra', 'Pomerančová kůra', 'Orange Peel', 'Citrusová, svěží a šťavnatá.', 'Citrusy, bright and zesty.', '🍊', '#ffb347', null, array['citrusová', 'jiskřivá', 'osvěžující']::text[], array['citrusy', 'bright', 'zesty']::text[], array['Rooibos', 'Black Tea', 'Cinnamon']::text[], null, null, 200, 'fruit', 'pomerančová kůra', 30, 0, 'Pomarančová kôra', 'Citrusová, svieža a šťavnatá.', array['citrusová', 'iskrivá', 'osviežujúca']::text[], 'pomarančová kôra'),
    ('lemon', 'Lemon', 'extra', 'Citronová kůra', 'Lemon Peel', 'Svěží, citrusová a nakyslá.', 'Bright, citrusy and tart.', '🍋', '#ffe066', null, array['jiskřivá', 'citrusová', 'nakyslá']::text[], array['bright', 'citrusy', 'tart']::text[], array['Green Tea', 'Chamomile', 'Ginger']::text[], null, null, 210, 'fruit', 'citronová kůra', 30, 0, 'Citrónová kôra', 'Svieža, citrusová a kyslastá.', array['iskrivá', 'citrusová', 'kyslastá']::text[], 'citrónová kôra'),
    ('ginger', 'Ginger', 'extra', 'Zázvor', 'Ginger', 'Pikantní, hřejivý a svěží.', 'Spicy, warm and zesty.', '🫚', '#ff9800', null, array['kořeněná', 'hřejivá', 'osvěžující']::text[], array['spicy', 'warm', 'zesty']::text[], array['Black Tea', 'Lemon', 'Lemongrass']::text[], null, null, 220, 'herb', 'zázvor (kořen)', 30, 0, 'Zázvor', 'Pikantný, hrejivý a svieži.', array['korenistá', 'hrejivá', 'osviežujúca']::text[], 'zázvor (koreň)'),
    ('cinnamon', 'Cinnamon', 'extra', 'Skořice', 'Cinnamon', 'Hřejivá, kořeněná a sladká.', 'Warm, spicy and sweet.', '🪵', '#c8824a', null, array['hřejivá', 'kořeněná', 'sladká']::text[], array['warm', 'spicy', 'sweet']::text[], array['Black Tea', 'Apple', 'Rooibos']::text[], null, null, 230, 'herb', 'skořice', 30, 0, 'Škorica', 'Hrejivá, korenistá a sladká.', array['hrejivá', 'korenistá', 'sladká']::text[], 'škorica'),
    ('lavender', 'Lavender', 'extra', 'Levandule', 'Lavender', 'Výrazně květinová, stačí špetka.', 'Strongly floral, a pinch is enough.', '💜', '#b8a0cc', null, array['květinová', 'bylinková', 'výrazná']::text[], array['floral', 'herby', 'bold']::text[], array['Chamomile', 'White Tea', 'Lemon Balm']::text[], null, null, 240, 'herb', 'levandule (květ)', 5, 0, 'Levanduľa', 'Výrazne kvetinová, stačí štipka.', array['kvetinová', 'bylinková', 'výrazná']::text[], 'levanduľa (kvet)'),
    ('cardamom', 'Cardamom', 'extra', 'Kardamom', 'Cardamom', 'Exotický, kořeněný a květinový. Stačí špetka.', 'Exotic, spicy and floral. A pinch is enough.', '🫛', '#80cbc4', null, array['exotická', 'kořeněná', 'květinová']::text[], array['exotic', 'spicy', 'floral']::text[], array['Black Tea', 'Oolong Tea', 'Cinnamon']::text[], null, null, 250, 'herb', 'kardamom (semeno)', 5, 80, 'Kardamón', 'Exotický, korenistý a kvetinový. Stačí štipka.', array['exotická', 'korenistá', 'kvetinová']::text[], 'kardamón (semeno)')
on conflict (id) do nothing;

-- Výchozí směsi jen do prázdné tabulky (nová databáze). Dřív se vkládaly
-- při každém běhu, takže se směs smazaná v administraci po dalším
-- spuštění setup.sql vrátila.
do $$
begin
    if not exists (select 1 from public.blends) then
        insert into public.blends (id, name, desc_cs, desc_en, desc_sk, ingredients, parts, emoji, is_preset, sort)
        values
            ('morning_window', 'Morning Window', 'Zelený čaj s mátou peprnou a citronovou kůrou. Čistý a svěží šálek, který rozjede den.', 'Green tea with peppermint and lemon peel. A clean, bright cup that gets the day going.', 'Zelený čaj s mätou piepornou a citrónovou kôrou. Čistá a svieža šálka, ktorá naštartuje deň.', array['Green Tea', 'Mint', 'Lemon']::text[], array[3, 1, 1]::smallint[], '☀️', true, 10),
            ('still_evening', 'Still Evening', 'Heřmánek a meduňka se špetkou levandule. Jemný, květinový a bez kofeinu. Na konec dne.', 'Chamomile and lemon balm with a pinch of lavender. Gentle, floral and caffeine-free, for the end of the day.', 'Harmanček a medovka so štipkou levandule. Jemný, kvetinový a bez kofeínu. Na koniec dňa.', array['Chamomile', 'Lemon Balm', 'Lavender']::text[], array[2, 2, 1]::smallint[], '🌙', true, 20),
            ('deep_winter', 'Deep Winter', 'Černý čaj se zázvorem a skořicí. Plný a hřejivý, nejlepší s oběma rukama kolem hrnku.', 'Black tea with ginger and cinnamon. Full and warming, best with both hands around the mug.', 'Čierny čaj so zázvorom a škoricou. Plný a hrejivý, najlepší, keď držíš hrnček oboma rukami.', array['Black Tea', 'Ginger', 'Cinnamon']::text[], array[3, 1, 1]::smallint[], '❄️', true, 30),
            ('late_light', 'Late Light', 'Oolong s růží a špetkou levandule. Měkký a lehce květinový, na tichou část odpoledne.', 'Oolong with rose and a pinch of lavender. Soft and a little floral, for the quiet part of the afternoon.', 'Oolong s ružou a štipkou levandule. Mäkký a trochu kvetinový, na tichú časť popoludnia.', array['Oolong Tea', 'Rose', 'Lavender']::text[], array[3, 1, 1]::smallint[], '🌅', false, 40),
            ('open_air', 'Open Air', 'Rooibos s pomerančovou kůrou a mátou kadeřavou. Přirozeně nasládlý a bez kofeinu, dobrý kdykoli.', 'Rooibos with orange peel and curly mint. Naturally sweet and caffeine-free, good any time.', 'Rooibos s pomarančovou kôrou a mätou kučeravou. Prirodzene sladký a bez kofeínu, dobrý kedykoľvek.', array['Rooibos', 'Orange', 'Spearmint']::text[], array[3, 1, 1]::smallint[], '🌿', false, 50),
            ('slow_tuesday', 'Slow Tuesday', 'Jablko s ibiškem, šípkem a skořicí. Ovocný a hřejivý. Čajový ekvivalent nicnedělání.', 'Apple with hibiscus, rose hip and cinnamon. Fruity and warming. The tea equivalent of doing nothing.', 'Jablko s ibištekom, šípkami a škoricou. Ovocný a hrejivý. Čajový ekvivalent ničnerobenia.', array['Apple', 'Hibiscus', 'Rose Hip', 'Cinnamon']::text[], array[3, 1, 1, 1]::smallint[], '🍎', true, 60)
        on conflict (id) do nothing;
    end if;
end
$$;

insert into public.price_tiers (weight_g, price_czk)
values
    (50, 49),
    (100, 89),
    (250, 199)
on conflict (weight_g) do nothing;

insert into public.shipping_methods (id, name, price_czk, sort)
values
    ('post', 'Česká pošta', 89, 10),
    ('zasilkovna', 'Zásilkovna', 69, 20),
    ('dpd', 'DPD kurýr', 119, 30)
on conflict (id) do nothing;
-- Osobní odběr je vypnutý, dokud v administraci nevyplníš, kde a kdy.
insert into public.shipping_methods (id, name, price_czk, sort, active)
values ('pickup', 'Osobní odběr', 0, 40, false)
on conflict (id) do nothing;

insert into public.settings (id, free_ship_threshold)
values (1, 500)
on conflict (id) do nothing;

insert into public.promo_codes (code, rate)
values
    ('FIRSTBLEND', 0.1)
on conflict (code) do nothing;

-- Ukázková mýdla a balzámy: vloží se jen do prázdné tabulky, takže
-- co v administraci smažeš, se po dalším spuštění nevrátí.
insert into public.craft_products (id, kind, name_cs, name_en, desc_cs, desc_en, ingredients, color, sort)
select * from (values
    ('levandulovy_vecer', 'soap', 'Levandulový večer', 'Lavender Evening',
     'Jemné mýdlo s levandulí a heřmánkem. Voní jako večerní šálek.',
     'A gentle soap with lavender and chamomile. Smells like an evening cup.',
     array['Lavender', 'Chamomile']::text[], '#b8a0cc', 10),
    ('zelene_rano', 'soap', 'Zelené ráno', 'Green Morning',
     'Svěží mýdlo se zeleným čajem a mátou.',
     'A fresh soap with green tea and mint.',
     array['Green Tea', 'Mint']::text[], '#8da676', 20),
    ('rooibos_pomeranc', 'soap', 'Rooibos a pomeranč', 'Rooibos & Orange',
     'Hřejivé mýdlo s rooibosem a pomerančovou kůrou.',
     'A warm soap with rooibos and orange peel.',
     array['Rooibos', 'Orange']::text[], '#e8720c', 30),
    ('ruze_bily_caj', 'soap', 'Růže a bílý čaj', 'Rose & White Tea',
     'Květinové mýdlo s růží a bílým čajem.',
     'A floral soap with rose and white tea.',
     array['Rose', 'White Tea']::text[], '#e8607a', 40),
    ('med_vanilka', 'balm', 'Med a vanilka', 'Honey & Vanilla',
     'Balzám na rty ze včelího vosku s medem a vanilkou.',
     'A beeswax lip balm with honey and vanilla.',
     array['Honey', 'Vanilla']::text[], '#ffc107', 50),
    ('mata', 'balm', 'Máta', 'Mint',
     'Chladivý balzám na rty s mátou kadeřavou.',
     'A cooling lip balm with curly mint.',
     array['Spearmint']::text[], '#a8d8a8', 60)
) as v(id, kind, name_cs, name_en, desc_cs, desc_en, ingredients, color, sort)
where not exists (select 1 from public.craft_products);

-- Nákup: suroviny z obchodu, suroviny na mýdla a balzámy a pár tipů na
-- dodavatele k prověření. Vloží se jen do prázdných tabulek.
do $$
begin
    if not exists (select 1 from public.purchase_materials) then
        insert into public.purchase_materials (name, ingredient_code, for_tea, for_soap, for_balm)
        select name_cs, code, true,
               code = any (array['Lavender', 'Chamomile', 'Green Tea', 'Mint', 'Rooibos', 'Orange', 'Rose', 'White Tea']),
               code = any (array['Honey', 'Vanilla', 'Spearmint'])
        from public.ingredients
        on conflict (name) do nothing;
        insert into public.purchase_materials (name, for_soap, for_balm, notes) values
            ('Bambucké máslo', true, true, ''),
            ('Kokosový olej', true, true, ''),
            ('Olivový olej', true, false, ''),
            ('Ricinový olej', true, false, ''),
            ('Včelí vosk', false, true, ''),
            ('Hydroxid sodný (louh)', true, false, 'Na mýdlo studenou cestou. Je to žíravina: rukavice, brýle, větrat.'),
            ('Esenciální olej levandule', true, true, '')
        on conflict (name) do nothing;
    end if;
    if not exists (select 1 from public.purchase_suppliers) then
        insert into public.purchase_suppliers (name, website, supplies, notes) values
            ('Oxalis', 'https://www.oxalis.cz', 'Sypané čaje a bylinné směsi',
             'Český výrobce ze Slavičína. Zjistit, jestli prodává čaje a byliny ve velkém i firmám (B2B).'),
            ('CGfoods', '', 'Velkoobchod čaje a kávy',
             'Našli jsme v katalogu vystavovatelů BVV. Dohledat kontakt a ceník.'),
            ('Nutrada (katalog dodavatelů)', 'https://nutrada.com/cz/produkty/byliny/levandule-velkoobchod', 'Byliny ve velkém: levandule, heřmánek, máta',
             'B2B katalog, dodavatelé často z Egypta. Hlídat certifikáty a kvalitu, nejdřív vzorky.'),
            ('Ekokoza', 'https://www.ekokoza.cz', 'Suroviny na mýdla a kosmetiku: bambucké máslo, oleje, vosky',
             'Na start pro mýdla a balzámy. Zeptat se na větší balení.'),
            ('Dobrý kolonial', 'https://www.dobrykolonial.cz/tuky-oleje/', 'Tuky a oleje na výrobu mýdla', ''),
            ('Mýdlový svět', 'https://www.mydlovysvet.cz', 'Mýdlové hmoty a formy',
             'Glycerinové mýdlové hmoty: mýdlo jde dělat i bez louhu.'),
            ('Handymade', 'https://www.handymade.sk', 'Másla a oleje na kosmetiku (SK)',
             'U surovin mají atesty, to se bude hodit k bezpečnostnímu posouzení.');
    end if;
end;
$$;

-- ─── KATALOG V2 (listopad 2026) ─────────────────────────────────────
-- Nabídka podle toho, co se dá běžně koupit u dodavatelů (Herbona,
-- Wollenhaupt, Alveus, Zelený Drak) a co povoluje příloha 1 vyhlášky
-- 187/2023 Sb. Proběhne jednou: přepíše názvy, popisy, skupiny, limity
-- a příplatky surovin, skryje med, vanilku, kakao, kokos a kurkumu
-- (zůstanou kvůli starým objednávkám) a hotovým směsím dá nové složení
-- s díly. Pak si všechno upravuješ v administraci a tohle už nic nemění.
do $$
begin
    if (select catalog_version from public.settings where id = 1) < 2 then
        update public.ingredients i
           set category = v.category, name_cs = v.name_cs, name_en = v.name_en,
               desc_cs = v.desc_cs, desc_en = v.desc_en, emoji = v.emoji, color = v.color,
               flavor_cs = v.flavor_cs, flavor_en = v.flavor_en, pairs = v.pairs, sort = v.sort,
               kind = v.kind, label_cs = v.label_cs, max_pct = v.max_pct, surcharge_czk = v.surcharge,
               name_sk = v.name_sk, desc_sk = v.desc_sk, flavor_sk = v.flavor_sk, label_sk = v.label_sk,
               caffeine = case when v.category = 'base' then coalesce(i.caffeine, v.caffeine) else i.caffeine end,
               active = true
          from (values
            ('green_tea', 'base', 'Zelený čaj', 'Green Tea', 'Svěží a zemitý, nízký kofein.', 'Fresh and earthy, light caffeine.', '🍃', '#8da676', array['zemitá', 'svěží', 'travnatá']::text[], array['earthy', 'fresh', 'grassy']::text[], array['Mint', 'Lemon', 'Ginger', 'Lemongrass']::text[], 10, 'tea', 'zelený čaj', null::smallint, 0, 2::smallint, 'Zelený čaj', 'Svieži a zemitý, málo kofeínu.', array['zemitá', 'svieža', 'trávová']::text[], 'zelený čaj'),
            ('black_tea', 'base', 'Černý čaj', 'Black Tea', 'Silný a výrazný, vysoký kofein.', 'Strong and bold, high caffeine.', '🖤', '#4a3b32', array['výrazná', 'sladová', 'silná']::text[], array['bold', 'malty', 'robust']::text[], array['Orange', 'Ginger', 'Cinnamon', 'Cardamom']::text[], 20, 'tea', 'černý čaj', null::smallint, 0, 4::smallint, 'Čierny čaj', 'Silný a výrazný, veľa kofeínu.', array['výrazná', 'sladová', 'silná']::text[], 'čierny čaj'),
            ('white_tea', 'base', 'Bílý čaj', 'White Tea', 'Jemný a sladký, nízký kofein.', 'Delicate and sweet, low caffeine.', '🤍', '#f5e6d3', array['jemná', 'sladká', 'květinová']::text[], array['delicate', 'sweet', 'floral']::text[], array['Rose', 'Strawberry', 'Raspberry', 'Lemon Balm']::text[], 30, 'tea', 'bílý čaj', null::smallint, 50, 1::smallint, 'Biely čaj', 'Jemný a sladký, málo kofeínu.', array['jemná', 'sladká', 'kvetinová']::text[], 'biely čaj'),
            ('oolong', 'base', 'Oolong', 'Oolong Tea', 'Komplexní a květinový, střední kofein.', 'Complex and floral, medium caffeine.', '🍵', '#c8a0b4', array['komplexní', 'květinová', 'pražená']::text[], array['complex', 'floral', 'toasty']::text[], array['Rose', 'Lavender', 'Orange']::text[], 40, 'tea', 'čaj oolong', null::smallint, 40, 3::smallint, 'Oolong', 'Komplexný a kvetinový, stredne veľa kofeínu.', array['komplexná', 'kvetinová', 'pražená']::text[], 'čaj oolong'),
            ('rooibos', 'base', 'Rooibos', 'Rooibos', 'Zemitý a sladký, bez kofeinu.', 'Earthy and sweet, caffeine-free.', '🌿', '#e8720c', array['zemitá', 'sladká', 'oříšková']::text[], array['earthy', 'sweet', 'nutty']::text[], array['Orange', 'Cinnamon', 'Rose Hip']::text[], 50, 'herb', 'rooibos', null::smallint, 0, 0::smallint, 'Rooibos', 'Zemitý a sladký, bez kofeínu.', array['zemitá', 'sladká', 'oriešková']::text[], 'rooibos'),
            ('chamomile', 'base', 'Heřmánek', 'Chamomile', 'Jemný, květinový, trochu jablečný. Bez kofeinu.', 'Gentle, floral, a little like apple. Caffeine-free.', '🌼', '#f5d78e', array['květinová', 'jablečná', 'jemná']::text[], array['floral', 'apple', 'mild']::text[], array['Lavender', 'Lemon Balm', 'Apple']::text[], 60, 'herb', 'heřmánek (květ)', null::smallint, 0, 0::smallint, 'Harmanček', 'Jemný, kvetinový, trochu jablkový. Bez kofeínu.', array['kvetinová', 'jablková', 'jemná']::text[], 'harmanček (kvet)'),
            ('lemon_balm', 'base', 'Meduňka', 'Lemon Balm', 'Jemně citronová a svěží, bez kofeinu.', 'Softly lemony and fresh, caffeine-free.', '🍀', '#9cc26a', array['citronová', 'svěží', 'bylinková']::text[], array['citrusy', 'fresh', 'herby']::text[], array['Chamomile', 'Linden', 'Mint', 'Lemon']::text[], 70, 'herb', 'meduňka (list)', null::smallint, 0, 0::smallint, 'Medovka', 'Jemne citrónová a svieža, bez kofeínu.', array['citrónová', 'svieža', 'bylinková']::text[], 'medovka (list)'),
            ('linden', 'base', 'Lípa', 'Linden', 'Medově sladký květ, bez kofeinu.', 'Honey-sweet blossom, caffeine-free.', '🌸', '#e6d58a', array['sladká', 'květinová', 'jemná']::text[], array['sweet', 'floral', 'delicate']::text[], array['Chamomile', 'Lemon Balm', 'Lemon']::text[], 80, 'herb', 'lipový květ', null::smallint, 0, 0::smallint, 'Lipa', 'Medovo sladký kvet, bez kofeínu.', array['sladká', 'kvetinová', 'jemná']::text[], 'lipový kvet'),
            ('mint', 'base', 'Máta peprná', 'Peppermint', 'Chladivá a svěží, výrazná. Bez kofeinu.', 'Cooling and fresh, bright. Caffeine-free.', '🌱', '#4caf50', array['chladivá', 'svěží', 'jiskřivá']::text[], array['cooling', 'fresh', 'bright']::text[], array['Green Tea', 'Lemon', 'Lemon Balm']::text[], 90, 'herb', 'máta peprná (list)', null::smallint, 0, 0::smallint, 'Mäta pieporná', 'Chladivá a svieža, výrazná. Bez kofeínu.', array['chladivá', 'svieža', 'iskrivá']::text[], 'mäta pieporná (list)'),
            ('apple', 'base', 'Jablko', 'Apple', 'Sladké a šťavnaté, základ ovocných čajů.', 'Sweet and juicy, the base of fruit teas.', '🍎', '#d9a35b', array['sladká', 'ovocná', 'hřejivá']::text[], array['sweet', 'fruity', 'warm']::text[], array['Cinnamon', 'Hibiscus', 'Rose Hip', 'Strawberry']::text[], 100, 'fruit', 'sušená jablka', null::smallint, 0, 0::smallint, 'Jablko', 'Sladké a šťavnaté, základ ovocných čajov.', array['sladká', 'ovocná', 'hrejivá']::text[], 'sušené jablká'),
            ('strawberry', 'flavor', 'Jahoda', 'Strawberry', 'Sladká a ovocná, letní.', 'Sweet and fruity, summery.', '🍓', '#cc4747', array['sladká', 'ovocná', 'letní']::text[], array['sweet', 'fruity', 'summery']::text[], array['White Tea', 'Rooibos', 'Mint']::text[], 110, 'fruit', 'sušené jahody', null::smallint, 25, null::smallint, 'Jahoda', 'Sladká a ovocná, letná.', array['sladká', 'ovocná', 'letná']::text[], 'sušené jahody'),
            ('raspberry', 'flavor', 'Malina', 'Raspberry', 'Nakyslá, ovocná a živá.', 'Tart, fruity and vibrant.', '🍇', '#e91e8c', array['nakyslá', 'ovocná', 'živá']::text[], array['tart', 'fruity', 'vibrant']::text[], array['Green Tea', 'Hibiscus', 'Mint']::text[], 120, 'fruit', 'sušené maliny', null::smallint, 25, null::smallint, 'Malina', 'Kyslastá, ovocná a živá.', array['kyslastá', 'ovocná', 'živá']::text[], 'sušené maliny'),
            ('blueberry', 'flavor', 'Borůvka', 'Blueberry', 'Sladká a nakyslá, chutná jako léto.', 'Sweet and tart, tastes like summer.', '🫐', '#9b59b6', array['sladká', 'ovocná', 'nakyslá']::text[], array['sweet', 'fruity', 'tart']::text[], array['Black Tea', 'Apple', 'Lemon']::text[], 130, 'fruit', 'sušené borůvky', null::smallint, 0, null::smallint, 'Čučoriedka', 'Sladká a kyslastá, chutí ako leto.', array['sladká', 'ovocná', 'kyslastá']::text[], 'sušené čučoriedky'),
            ('rose_hip', 'flavor', 'Šípek', 'Rose Hip', 'Nakyslý, ovocný a svěží.', 'Tart, fruity and tangy.', '🔴', '#f8bbd0', array['nakyslá', 'ovocná', 'svěží']::text[], array['tart', 'fruity', 'tangy']::text[], array['Hibiscus', 'Apple', 'Rooibos']::text[], 140, 'fruit', 'šípek', null::smallint, 0, null::smallint, 'Šípka', 'Kyslastá, ovocná a svieža.', array['kyslastá', 'ovocná', 'svieža']::text[], 'šípky'),
            ('hibiscus', 'flavor', 'Ibišek', 'Hibiscus', 'Rubínová barva a příjemná kyselost.', 'Ruby colour and a pleasant tartness.', '🌺', '#b0234a', array['nakyslá', 'ovocná', 'živá']::text[], array['tart', 'fruity', 'vibrant']::text[], array['Rose Hip', 'Apple', 'Strawberry']::text[], 150, 'herb', 'ibišek (květ)', null::smallint, 0, null::smallint, 'Ibištek', 'Rubínová farba a príjemná kyslosť.', array['kyslastá', 'ovocná', 'živá']::text[], 'ibištek (kvet)'),
            ('rose', 'flavor', 'Růže', 'Rose', 'Květinová a jemná.', 'Floral and delicate.', '🌹', '#e8607a', array['květinová', 'romantická', 'lehká']::text[], array['floral', 'romantic', 'light']::text[], array['White Tea', 'Oolong Tea', 'Lavender']::text[], 160, 'herb', 'růže (okvětní lístky)', null::smallint, 30, null::smallint, 'Ruža', 'Kvetinová a jemná.', array['kvetinová', 'romantická', 'ľahká']::text[], 'ruža (okvetné lístky)'),
            ('spearmint', 'flavor', 'Máta kadeřavá', 'Curly Mint', 'Sladší a jemnější než peprná.', 'Sweeter and softer than peppermint.', '🌿', '#a8d8a8', array['chladivá', 'sladká', 'jemná']::text[], array['cool', 'sweet', 'mild']::text[], array['Rooibos', 'Green Tea', 'Lemon']::text[], 170, 'herb', 'máta kadeřavá (list)', null::smallint, 0, null::smallint, 'Mäta kučeravá', 'Sladšia a jemnejšia ako pieporná.', array['chladivá', 'sladká', 'jemná']::text[], 'mäta kučeravá (list)'),
            ('lemongrass', 'flavor', 'Citronová tráva', 'Lemongrass', 'Vůně citronu bez kyselosti.', 'Lemon scent without the sourness.', '🌾', '#c9d77b', array['citrusová', 'svěží', 'travnatá']::text[], array['citrusy', 'fresh', 'grassy']::text[], array['Green Tea', 'Ginger', 'Lemon Balm']::text[], 180, 'herb', 'citronová tráva (list)', 30::smallint, 0, null::smallint, 'Citrónová tráva', 'Vôňa citróna bez kyslosti.', array['citrusová', 'svieža', 'trávová']::text[], 'citrónová tráva (list)'),
            ('fennel', 'flavor', 'Fenykl', 'Fennel', 'Nasládlý, s tónem anýzu.', 'Sweetish, with a hint of anise.', '✳️', '#a4b36b', array['sladká', 'kořeněná', 'jemná']::text[], array['sweet', 'spicy', 'mild']::text[], array['Chamomile', 'Mint', 'Lemon Balm']::text[], 190, 'herb', 'fenykl (plod)', null::smallint, 0, null::smallint, 'Fenikel', 'Nasladlý, s tónom anízu.', array['sladká', 'korenistá', 'jemná']::text[], 'fenikel (plod)'),
            ('orange', 'extra', 'Pomerančová kůra', 'Orange Peel', 'Citrusová, svěží a šťavnatá.', 'Citrusy, bright and zesty.', '🍊', '#ffb347', array['citrusová', 'jiskřivá', 'osvěžující']::text[], array['citrusy', 'bright', 'zesty']::text[], array['Rooibos', 'Black Tea', 'Cinnamon']::text[], 200, 'fruit', 'pomerančová kůra', 30::smallint, 0, null::smallint, 'Pomarančová kôra', 'Citrusová, svieža a šťavnatá.', array['citrusová', 'iskrivá', 'osviežujúca']::text[], 'pomarančová kôra'),
            ('lemon', 'extra', 'Citronová kůra', 'Lemon Peel', 'Svěží, citrusová a nakyslá.', 'Bright, citrusy and tart.', '🍋', '#ffe066', array['jiskřivá', 'citrusová', 'nakyslá']::text[], array['bright', 'citrusy', 'tart']::text[], array['Green Tea', 'Chamomile', 'Ginger']::text[], 210, 'fruit', 'citronová kůra', 30::smallint, 0, null::smallint, 'Citrónová kôra', 'Svieža, citrusová a kyslastá.', array['iskrivá', 'citrusová', 'kyslastá']::text[], 'citrónová kôra'),
            ('ginger', 'extra', 'Zázvor', 'Ginger', 'Pikantní, hřejivý a svěží.', 'Spicy, warm and zesty.', '🫚', '#ff9800', array['kořeněná', 'hřejivá', 'osvěžující']::text[], array['spicy', 'warm', 'zesty']::text[], array['Black Tea', 'Lemon', 'Lemongrass']::text[], 220, 'herb', 'zázvor (kořen)', 30::smallint, 0, null::smallint, 'Zázvor', 'Pikantný, hrejivý a svieži.', array['korenistá', 'hrejivá', 'osviežujúca']::text[], 'zázvor (koreň)'),
            ('cinnamon', 'extra', 'Skořice', 'Cinnamon', 'Hřejivá, kořeněná a sladká.', 'Warm, spicy and sweet.', '🪵', '#c8824a', array['hřejivá', 'kořeněná', 'sladká']::text[], array['warm', 'spicy', 'sweet']::text[], array['Black Tea', 'Apple', 'Rooibos']::text[], 230, 'herb', 'skořice', 30::smallint, 0, null::smallint, 'Škorica', 'Hrejivá, korenistá a sladká.', array['hrejivá', 'korenistá', 'sladká']::text[], 'škorica'),
            ('lavender', 'extra', 'Levandule', 'Lavender', 'Výrazně květinová, stačí špetka.', 'Strongly floral, a pinch is enough.', '💜', '#b8a0cc', array['květinová', 'bylinková', 'výrazná']::text[], array['floral', 'herby', 'bold']::text[], array['Chamomile', 'White Tea', 'Lemon Balm']::text[], 240, 'herb', 'levandule (květ)', 5::smallint, 0, null::smallint, 'Levanduľa', 'Výrazne kvetinová, stačí štipka.', array['kvetinová', 'bylinková', 'výrazná']::text[], 'levanduľa (kvet)'),
            ('cardamom', 'extra', 'Kardamom', 'Cardamom', 'Exotický, kořeněný a květinový. Stačí špetka.', 'Exotic, spicy and floral. A pinch is enough.', '🫛', '#80cbc4', array['exotická', 'kořeněná', 'květinová']::text[], array['exotic', 'spicy', 'floral']::text[], array['Black Tea', 'Oolong Tea', 'Cinnamon']::text[], 250, 'herb', 'kardamom (semeno)', 5::smallint, 80, null::smallint, 'Kardamón', 'Exotický, korenistý a kvetinový. Stačí štipka.', array['exotická', 'korenistá', 'kvetinová']::text[], 'kardamón (semeno)')
          ) as v(id, category, name_cs, name_en, desc_cs, desc_en, emoji, color, flavor_cs, flavor_en,
                 pairs, sort, kind, label_cs, max_pct, surcharge, caffeine, name_sk, desc_sk, flavor_sk, label_sk)
         where i.id = v.id;

        update public.ingredients set active = false
         where id = any (array['vanilla', 'cocoa', 'coconut', 'honey', 'turmeric']);

        insert into public.blends as b (id, name, emoji, is_preset, sort, ingredients, parts, desc_cs, desc_en, desc_sk)
        values
            ('morning_window', 'Morning Window', '☀️', true, 10, array['Green Tea', 'Mint', 'Lemon']::text[], array[3, 1, 1]::smallint[], 'Zelený čaj s mátou peprnou a citronovou kůrou. Čistý a svěží šálek, který rozjede den.', 'Green tea with peppermint and lemon peel. A clean, bright cup that gets the day going.', 'Zelený čaj s mätou piepornou a citrónovou kôrou. Čistá a svieža šálka, ktorá naštartuje deň.'),
            ('still_evening', 'Still Evening', '🌙', true, 20, array['Chamomile', 'Lemon Balm', 'Lavender']::text[], array[2, 2, 1]::smallint[], 'Heřmánek a meduňka se špetkou levandule. Jemný, květinový a bez kofeinu. Na konec dne.', 'Chamomile and lemon balm with a pinch of lavender. Gentle, floral and caffeine-free, for the end of the day.', 'Harmanček a medovka so štipkou levandule. Jemný, kvetinový a bez kofeínu. Na koniec dňa.'),
            ('deep_winter', 'Deep Winter', '❄️', true, 30, array['Black Tea', 'Ginger', 'Cinnamon']::text[], array[3, 1, 1]::smallint[], 'Černý čaj se zázvorem a skořicí. Plný a hřejivý, nejlepší s oběma rukama kolem hrnku.', 'Black tea with ginger and cinnamon. Full and warming, best with both hands around the mug.', 'Čierny čaj so zázvorom a škoricou. Plný a hrejivý, najlepší, keď držíš hrnček oboma rukami.'),
            ('late_light', 'Late Light', '🌅', false, 40, array['Oolong Tea', 'Rose', 'Lavender']::text[], array[3, 1, 1]::smallint[], 'Oolong s růží a špetkou levandule. Měkký a lehce květinový, na tichou část odpoledne.', 'Oolong with rose and a pinch of lavender. Soft and a little floral, for the quiet part of the afternoon.', 'Oolong s ružou a štipkou levandule. Mäkký a trochu kvetinový, na tichú časť popoludnia.'),
            ('open_air', 'Open Air', '🌿', false, 50, array['Rooibos', 'Orange', 'Spearmint']::text[], array[3, 1, 1]::smallint[], 'Rooibos s pomerančovou kůrou a mátou kadeřavou. Přirozeně nasládlý a bez kofeinu, dobrý kdykoli.', 'Rooibos with orange peel and curly mint. Naturally sweet and caffeine-free, good any time.', 'Rooibos s pomarančovou kôrou a mätou kučeravou. Prirodzene sladký a bez kofeínu, dobrý kedykoľvek.'),
            ('slow_tuesday', 'Slow Tuesday', '🍎', true, 60, array['Apple', 'Hibiscus', 'Rose Hip', 'Cinnamon']::text[], array[3, 1, 1, 1]::smallint[], 'Jablko s ibiškem, šípkem a skořicí. Ovocný a hřejivý. Čajový ekvivalent nicnedělání.', 'Apple with hibiscus, rose hip and cinnamon. Fruity and warming. The tea equivalent of doing nothing.', 'Jablko s ibištekom, šípkami a škoricou. Ovocný a hrejivý. Čajový ekvivalent ničnerobenia.')
        on conflict (id) do update
           set ingredients = excluded.ingredients, parts = excluded.parts, emoji = excluded.emoji,
               is_preset = excluded.is_preset, desc_cs = excluded.desc_cs, desc_en = excluded.desc_en,
               desc_sk = excluded.desc_sk;

        -- Mýdla a balzámy slovensky (jen u výchozích, které nikdo nepřejmenoval)
        update public.craft_products c
           set name_sk = v.name_sk, desc_sk = v.desc_sk
          from (values
            ('levandulovy_vecer', 'Levanduľový večer', 'Jemné mydlo s levanduľou a harmančekom. Vonia ako večerná šálka.'),
            ('zelene_rano', 'Zelené ráno', 'Svieže mydlo so zeleným čajom a mätou.'),
            ('rooibos_pomeranc', 'Rooibos a pomaranč', 'Hrejivé mydlo s rooibosom a pomarančovou kôrou.'),
            ('ruze_bily_caj', 'Ruža a biely čaj', 'Kvetinové mydlo s ružou a bielym čajom.'),
            ('med_vanilka', 'Med a vanilka', 'Balzam na pery zo včelieho vosku s medom a vanilkou.'),
            ('mata', 'Mäta', 'Chladivý balzam na pery s mätou kučeravou.')
          ) as v(id, name_sk, desc_sk)
         where c.id = v.id and c.name_sk = '';
        update public.craft_products set desc_cs = 'Chladivý balzám na rty s mátou kadeřavou.', desc_en = 'A cooling lip balm with curly mint.'
         where id = 'mata' and desc_cs in ('Chladivý balzám na rty s mátou peprnou.', 'Chladivý balzám na rty s mátou klasnatou.');

        insert into public.purchase_materials (name, ingredient_code, for_tea)
        select v.name, v.code, true
          from (values
            ('Meduňka', 'Lemon Balm'),
            ('Lípa', 'Linden'),
            ('Jablko', 'Apple'),
            ('Ibišek', 'Hibiscus'),
            ('Citronová tráva', 'Lemongrass'),
            ('Fenykl', 'Fennel')
          ) as v(name, code)
         where not exists (select 1 from public.purchase_materials m where m.ingredient_code = v.code)
        on conflict (name) do nothing;

        insert into public.purchase_suppliers (name, website, supplies, notes)
        select v.name, v.website, v.supplies, v.notes
          from (values
            ('Herbona', 'https://www.herbona.cz', 'Byliny a koření ve velkém, i BIO', 'Cheb. Laboratorní rozbory na pesticidy a alkaloidy, BIO certifikát. info@herbona.cz, +420 605 246 898. Hlavní kandidát na byliny.'),
            ('Wollenhaupt', 'https://www.wollenhaupt.com', 'Čaje, rooibos, byliny, sušené ovoce (DE)', 'Jen pro firmy. Minimální objednávka 500 €, pod 1 000 € doprava 20 €. Balení 1–2 kg, vzorky na vyžádání, specifikace k surovinám.'),
            ('Alveus', 'https://www.alveus.eu', 'BIO čaje a byliny (DE)', 'Hamburg, jen pro firmy. Asi 800 BIO čajů, vzorky zdarma s katalogem.'),
            ('Zelený Drak', 'https://www.zelenydrak.cz', 'Velkoobchod čajů, ovocných a bylinných směsí', 'Třebíč. Velkoobchod po zaslání IČ, minimální objednávka 5 000 Kč, platba předem.')
          ) as v(name, website, supplies, notes)
         where not exists (select 1 from public.purchase_suppliers s where lower(s.name) = lower(v.name));

        -- Nákup: suroviny pojmenované podle starých názvů (máta kadeřavá,
        -- kód Spearmint, se dřív omylem jmenovala „Máta peprná“).
        update public.purchase_materials set name = 'Máta kadeřavá'
         where ingredient_code = 'Spearmint' and name in ('Máta peprná', 'Máta klasnatá')
           and not exists (select 1 from public.purchase_materials where name = 'Máta kadeřavá');
        update public.purchase_materials set name = 'Máta peprná'
         where ingredient_code = 'Mint' and name = 'Máta'
           and not exists (select 1 from public.purchase_materials where name = 'Máta peprná');
        update public.purchase_materials set name = 'Pomerančová kůra'
         where ingredient_code = 'Orange' and name = 'Pomeranč'
           and not exists (select 1 from public.purchase_materials where name = 'Pomerančová kůra');
        update public.purchase_materials set name = 'Citronová kůra'
         where ingredient_code = 'Lemon' and name = 'Citron'
           and not exists (select 1 from public.purchase_materials where name = 'Citronová kůra');
        -- Vyřazené suroviny se do čaje už nekupují. Med a vanilka zůstávají
        -- u balzámů, kakao, kokos a kurkuma se odloží.
        update public.purchase_materials
           set for_tea = false,
               status = case when not for_soap and not for_balm and status = 'research' then 'dropped' else status end
         where ingredient_code = any (array['Vanilla', 'Cocoa', 'Coconut', 'Honey', 'Turmeric']);

        update public.settings set catalog_version = 2 where id = 1;
    end if;
end;
$$;

-- Popisy hotových směsí bez dlouhých pomlček (listopad 2026). Mění se jen
-- popis, který je pořád původní: co sis v administraci přepsal, zůstane.
-- Dá se pouštět opakovaně.
update public.blends set desc_cs = replace(desc_cs, 'Čistý a svěží — pohár, který rozjede den.', 'Čistý a svěží šálek, který rozjede den.') where id = 'morning_window' and desc_cs like '%Čistý a svěží — pohár, který rozjede den.';
update public.blends set desc_en = replace(desc_en, 'Clean and bright — the cup that gets the day going.', 'A clean, bright cup that gets the day going.') where id = 'morning_window' and desc_en like '%Clean and bright — the cup that gets the day going.';
update public.blends set desc_sk = replace(desc_sk, 'Čistý a svieži — šálka, ktorá naštartuje deň.', 'Čistá a svieža šálka, ktorá naštartuje deň.') where id = 'morning_window' and desc_sk like '%Čistý a svieži — šálka, ktorá naštartuje deň.';
update public.blends set desc_cs = replace(desc_cs, 'Jemný, květinový a bez kofeinu — na konec dne.', 'Jemný, květinový a bez kofeinu. Na konec dne.') where id = 'still_evening' and desc_cs like '%Jemný, květinový a bez kofeinu — na konec dne.';
update public.blends set desc_en = replace(desc_en, 'Gentle, floral and caffeine-free — for the end of the day.', 'Gentle, floral and caffeine-free, for the end of the day.') where id = 'still_evening' and desc_en like '%Gentle, floral and caffeine-free — for the end of the day.';
update public.blends set desc_sk = replace(desc_sk, 'Jemný, kvetinový a bez kofeínu — na koniec dňa.', 'Jemný, kvetinový a bez kofeínu. Na koniec dňa.') where id = 'still_evening' and desc_sk like '%Jemný, kvetinový a bez kofeínu — na koniec dňa.';
update public.blends set desc_cs = replace(desc_cs, 'Plný a hřejivý — nejlepší s oběma rukama kolem hrnku.', 'Plný a hřejivý, nejlepší s oběma rukama kolem hrnku.') where id = 'deep_winter' and desc_cs like '%Plný a hřejivý — nejlepší s oběma rukama kolem hrnku.';
update public.blends set desc_en = replace(desc_en, 'Full and warming — best with both hands around the mug.', 'Full and warming, best with both hands around the mug.') where id = 'deep_winter' and desc_en like '%Full and warming — best with both hands around the mug.';
update public.blends set desc_sk = replace(desc_sk, 'Plný a hrejivý — najlepší, keď držíš hrnček oboma rukami.', 'Plný a hrejivý, najlepší, keď držíš hrnček oboma rukami.') where id = 'deep_winter' and desc_sk like '%Plný a hrejivý — najlepší, keď držíš hrnček oboma rukami.';
update public.blends set desc_cs = replace(desc_cs, 'Měkký a trochu květinový — na ten tichý kus odpoledne.', 'Měkký a lehce květinový, na tichou část odpoledne.') where id = 'late_light' and desc_cs like '%Měkký a trochu květinový — na ten tichý kus odpoledne.';
update public.blends set desc_en = replace(desc_en, 'Soft and a little floral — for the quiet part of the afternoon.', 'Soft and a little floral, for the quiet part of the afternoon.') where id = 'late_light' and desc_en like '%Soft and a little floral — for the quiet part of the afternoon.';
update public.blends set desc_sk = replace(desc_sk, 'Mäkký a trochu kvetinový — na tichú časť popoludnia.', 'Mäkký a trochu kvetinový, na tichú časť popoludnia.') where id = 'late_light' and desc_sk like '%Mäkký a trochu kvetinový — na tichú časť popoludnia.';
update public.blends set desc_cs = replace(desc_cs, 'Přirozeně sladký a bez kofeinu — dobrý kdykoli.', 'Přirozeně nasládlý a bez kofeinu, dobrý kdykoli.') where id = 'open_air' and desc_cs like '%Přirozeně sladký a bez kofeinu — dobrý kdykoli.';
update public.blends set desc_en = replace(desc_en, 'Naturally sweet and caffeine-free — good any time.', 'Naturally sweet and caffeine-free, good any time.') where id = 'open_air' and desc_en like '%Naturally sweet and caffeine-free — good any time.';
update public.blends set desc_sk = replace(desc_sk, 'Prirodzene sladký a bez kofeínu — dobrý kedykoľvek.', 'Prirodzene sladký a bez kofeínu, dobrý kedykoľvek.') where id = 'open_air' and desc_sk like '%Prirodzene sladký a bez kofeínu — dobrý kedykoľvek.';
update public.blends set desc_cs = replace(desc_cs, 'Ovocný a hřejivý — čajový ekvivalent nicnedělání.', 'Ovocný a hřejivý. Čajový ekvivalent nicnedělání.') where id = 'slow_tuesday' and desc_cs like '%Ovocný a hřejivý — čajový ekvivalent nicnedělání.';
update public.blends set desc_en = replace(desc_en, 'Fruity and warming — the tea equivalent of doing nothing.', 'Fruity and warming. The tea equivalent of doing nothing.') where id = 'slow_tuesday' and desc_en like '%Fruity and warming — the tea equivalent of doing nothing.';
update public.blends set desc_sk = replace(desc_sk, 'Ovocný a hrejivý — čajový ekvivalent ničnerobenia.', 'Ovocný a hrejivý. Čajový ekvivalent ničnerobenia.') where id = 'slow_tuesday' and desc_sk like '%Ovocný a hrejivý — čajový ekvivalent ničnerobenia.';

-- Hotové směsi v2 (listopad 2026), jednou podle settings.blends_seed_version:
-- původním šesti doplní chvíli, „Proč to funguje“ a tip (jen kde je prázdno)
-- a přidá osm nových. Co pak v administraci změníš nebo smažeš, další běh
-- nevrátí. Recepty jsou návrh: před prodejem je namíchej a ochutnej.
alter table public.settings add column if not exists blends_seed_version smallint not null default 0;
do $$
begin
    if (select blends_seed_version from public.settings where id = 1) < 1 then
        update public.blends set
            moment = coalesce(moment, 'morning'),
            story_cs = case when story_cs = '' then 'Zelený čaj je sám o sobě trochu travnatý. Máta peprná ho zchladí a citronová kůra mu dodá šťávu, takže chutná jasně i bez cukru.' else story_cs end,
            story_en = case when story_en = '' then 'Green tea on its own is a little grassy. Peppermint cools it down and lemon peel adds brightness, so it tastes lively even without sugar.' else story_en end,
            story_sk = case when story_sk = '' then 'Zelený čaj je sám osebe trochu trávnatý. Mäta pieporná ho schladí a citrónová kôra mu dodá šťavu, takže chutí jasne aj bez cukru.' else story_sk end,
            tip_cs = case when tip_cs = '' then 'Zalij vodou kolem 80 °C, ne vroucí, jinak zhořkne. Lístky vydrží i druhé zalití.' else tip_cs end,
            tip_en = case when tip_en = '' then 'Use water around 80 °C, not boiling, or it turns bitter. The leaves are good for a second steep.' else tip_en end,
            tip_sk = case when tip_sk = '' then 'Zalej vodou okolo 80 °C, nie vriacou, inak zhorkne. Lístky vydržia aj druhé zaliatie.' else tip_sk end
         where id = 'morning_window';
        update public.blends set
            moment = coalesce(moment, 'evening'),
            story_cs = case when story_cs = '' then 'Heřmánek a meduňka jsou jemné a nasládlé, takže se navzájem nepřekřikují. Levandule je jen špetka: víc by přehlušila všechno ostatní.' else story_cs end,
            story_en = case when story_en = '' then 'Chamomile and lemon balm are both soft and slightly sweet, so neither drowns the other out. The lavender is just a pinch: any more would overpower everything else.' else story_en end,
            story_sk = case when story_sk = '' then 'Rumanček a medovka sú jemné a nasladlé, takže sa navzájom neprekrikujú. Levanduľa je len štipka: viac by prehlušila všetko ostatné.' else story_sk end,
            tip_cs = case when tip_cs = '' then 'Zalij vroucí vodou a nech louhovat 5–7 minut pod pokličkou, ať vůně neuteče.' else tip_cs end,
            tip_en = case when tip_en = '' then 'Pour boiling water and steep for 5–7 minutes with a lid on, so the aroma stays in the cup.' else tip_en end,
            tip_sk = case when tip_sk = '' then 'Zalej vriacou vodou a nechaj lúhovať 5–7 minút pod pokrievkou, aby vôňa neunikla.' else tip_sk end
         where id = 'still_evening';
        update public.blends set
            moment = coalesce(moment, 'winter'),
            story_cs = case when story_cs = '' then 'Černý čaj je dost silný, aby unesl zázvor i skořici. Zázvor štípne, skořice to zakulatí a dohromady to voní jako vánoční pečení.' else story_cs end,
            story_en = case when story_en = '' then 'Black tea is strong enough to carry both ginger and cinnamon. The ginger bites, the cinnamon rounds it off, and together they smell like Christmas baking.' else story_en end,
            story_sk = case when story_sk = '' then 'Čierny čaj je dosť silný, aby uniesol zázvor aj škoricu. Zázvor štipne, škorica to zaokrúhli a spolu to vonia ako vianočné pečenie.' else story_sk end,
            tip_cs = case when tip_cs = '' then 'Snese mléko i lžičku medu. Louhuj 4 minuty, ať je dost silný.' else tip_cs end,
            tip_en = case when tip_en = '' then 'Takes milk and a spoonful of honey well. Steep for 4 minutes so it stays strong.' else tip_en end,
            tip_sk = case when tip_sk = '' then 'Znesie mlieko aj lyžičku medu. Lúhuj 4 minúty, aby bol dosť silný.' else tip_sk end
         where id = 'deep_winter';
        update public.blends set
            moment = coalesce(moment, 'afternoon'),
            story_cs = case when story_cs = '' then 'Oolong je napůl mezi zeleným a černým čajem: trochu pražený, trochu květinový. Růže tu květinovou stránku vytáhne, levandule ji jen podtrhne.' else story_cs end,
            story_en = case when story_en = '' then 'Oolong sits halfway between green and black tea: a little roasted, a little floral. Rose brings out the floral side and lavender just underlines it.' else story_en end,
            story_sk = case when story_sk = '' then 'Oolong je napoly medzi zeleným a čiernym čajom: trochu pražený, trochu kvetinový. Ruža tú kvetinovú stránku vytiahne, levanduľa ju len podčiarkne.' else story_sk end,
            tip_cs = case when tip_cs = '' then 'Oolong vydrží dvě až tři zalití. Každé chutná trochu jinak, druhé bývá nejlepší.' else tip_cs end,
            tip_en = case when tip_en = '' then 'Oolong takes two or three steeps. Each one tastes a bit different, and the second is often the best.' else tip_en end,
            tip_sk = case when tip_sk = '' then 'Oolong vydrží dve až tri zaliatia. Každé chutí trochu inak, druhé býva najlepšie.' else tip_sk end
         where id = 'late_light';
        update public.blends set
            moment = coalesce(moment, 'afternoon'),
            story_cs = case when story_cs = '' then 'Rooibos je přirozeně nasládlý a nehořkne, ani když ho necháš louhovat dlouho. Pomerančová kůra a máta kadeřavá ho rozjasní, takže není těžký.' else story_cs end,
            story_en = case when story_en = '' then 'Rooibos is naturally sweet and never turns bitter, even if you leave it steeping. Orange peel and curly mint brighten it so it never feels heavy.' else story_en end,
            story_sk = case when story_sk = '' then 'Rooibos je prirodzene nasladlý a nezhorkne, ani keď ho necháš lúhovať dlho. Pomarančová kôra a mäta kučeravá ho rozjasnia, takže nie je ťažký.' else story_sk end,
            tip_cs = case when tip_cs = '' then 'Dobrý horký i ledový. Na ledový ho zalij vroucí vodou, nech 6 minut louhovat, vychladnout a dej do lednice.' else tip_cs end,
            tip_en = case when tip_en = '' then 'Good hot or iced. For iced tea, pour boiling water, steep for 6 minutes, let it cool and put it in the fridge.' else tip_en end,
            tip_sk = case when tip_sk = '' then 'Dobrý horúci aj ľadový. Na ľadový ho zalej vriacou vodou, nechaj 6 minút lúhovať, vychladnúť a daj do chladničky.' else tip_sk end
         where id = 'open_air';
        update public.blends set
            moment = coalesce(moment, 'winter'),
            story_cs = case when story_cs = '' then 'Jablko dává sladkost, ibišek a šípek kyselost a rubínovou barvu, skořice teplo. Chutná jako jablečný koláč, jen tekutý.' else story_cs end,
            story_en = case when story_en = '' then 'Apple brings the sweetness, hibiscus and rose hip the tartness and ruby colour, cinnamon the warmth. It tastes like apple pie, only liquid.' else story_en end,
            story_sk = case when story_sk = '' then 'Jablko dáva sladkosť, ibištek a šípka kyslosť a rubínovú farbu, škorica teplo. Chutí ako jablkový koláč, len tekutý.' else story_sk end,
            tip_cs = case when tip_cs = '' then 'Ovocný čaj potřebuje vroucí vodu a čas: aspoň 8 minut. Krátce louhovaný je vodový.' else tip_cs end,
            tip_en = case when tip_en = '' then 'Fruit tea needs boiling water and time: at least 8 minutes. Steeped briefly, it tastes watery.' else tip_en end,
            tip_sk = case when tip_sk = '' then 'Ovocný čaj potrebuje vriacu vodu a čas: aspoň 8 minút. Krátko lúhovaný je vodový.' else tip_sk end
         where id = 'slow_tuesday';
        insert into public.blends (id, name, emoji, is_preset, active, sort, ingredients, parts, desc_cs, desc_en, desc_sk, moment, story_cs, story_en, story_sk, tip_cs, tip_en, tip_sk) values
            ('sunday_paper', 'Sunday Paper', '🍊', false, true, 70, array['Black Tea', 'Orange', 'Cardamom'], array[3, 1, 1]::smallint[], 'Černý čaj s pomerančovou kůrou a špetkou kardamomu. Silný, voňavý a pomalý, na snídani, která nikam nespěchá.', 'Black tea with orange peel and a pinch of cardamom. Strong, fragrant and unhurried, for a breakfast that is going nowhere.', 'Čierny čaj s pomarančovou kôrou a štipkou kardamónu. Silný, voňavý a pomalý, na raňajky, ktoré nikam neponáhľajú.', 'morning', 'Pomeranč a černý čaj jsou klasika. Kardamom je to, čím se tahle směs liší: dá jí vůni, kterou poznáš už při zalévání. Je ho jen špetka, aby nepřebil čaj.', 'Orange and black tea are a classic. The cardamom is what sets this one apart: a scent you notice as soon as the water hits the leaves. It''s only a pinch, so it never overpowers the tea.', 'Pomaranč a čierny čaj sú klasika. Kardamón je to, čím sa táto zmes líši: dá jej vôňu, ktorú spoznáš už pri zalievaní. Je ho len štipka, aby neprebil čaj.', 'Louhuj 4 minuty. S kapkou mléka chutná jako snídaňový čaj z kavárny.', 'Steep for 4 minutes. With a dash of milk it tastes like a café breakfast tea.', 'Lúhuj 4 minúty. S kvapkou mlieka chutí ako raňajkový čaj z kaviarne.'),
            ('desk_hours', 'Desk Hours', '🍋', false, true, 80, array['Green Tea', 'Lemongrass', 'Ginger'], array[3, 1, 1]::smallint[], 'Zelený čaj s citronovou trávou a zázvorem. Svěží, lehce pikantní, na odpoledne u práce.', 'Green tea with lemongrass and ginger. Fresh and lightly spicy, for an afternoon at your desk.', 'Zelený čaj s citrónovou trávou a zázvorom. Svieži, jemne pikantný, na popoludnie pri práci.', 'afternoon', 'Citronová tráva voní po citronu, ale nekyselí, takže zelený čaj zůstane jemný. Zázvor mu na konci přidá lehké štípnutí.', 'Lemongrass smells of lemon without the sourness, so the green tea stays gentle. The ginger adds a light kick at the end.', 'Citrónová tráva vonia po citróne, ale nekyslí, takže zelený čaj zostane jemný. Zázvor mu na konci pridá jemné štipnutie.', 'Voda kolem 80 °C a 2–3 minuty. Do velkého hrnku dej dvě lžičky a až dopiješ, zalij je znovu.', 'Water around 80 °C, 2–3 minutes. Use two teaspoons for a big mug and top them up again when you finish.', 'Voda okolo 80 °C a 2–3 minúty. Do veľkého hrnčeka daj dve lyžičky a keď dopiješ, zalej ich znova.'),
            ('garden_party', 'Garden Party', '🍓', false, true, 90, array['White Tea', 'Strawberry', 'Rose'], array[3, 1, 1]::smallint[], 'Bílý čaj s jahodou a růží. Jemný, ovocný a voňavý, nejlepší vychlazený.', 'White tea with strawberry and rose. Delicate, fruity and fragrant, best served chilled.', 'Biely čaj s jahodou a ružou. Jemný, ovocný a voňavý, najlepší vychladený.', 'summer', 'Bílý čaj je ze všech nejjemnější, proto k němu nepatří nic výrazného. Jahoda mu dá sladkost, růže vůni a pořád je cítit čaj.', 'White tea is the most delicate of all, so nothing loud belongs with it. Strawberry brings sweetness, rose brings scent, and you can still taste the tea.', 'Biely čaj je zo všetkých najjemnejší, preto k nemu nepatrí nič výrazné. Jahoda mu dá sladkosť, ruža vôňu a stále je cítiť čaj.', 'Na ledový čaj: zalij vodou o 80 °C, louhuj 3 minuty, nech vychladnout a nalij na led.', 'For iced tea: steep in 80 °C water for 3 minutes, let it cool and pour over ice.', 'Na ľadový čaj: zalej vodou s teplotou 80 °C, lúhuj 3 minúty, nechaj vychladnúť a nalej na ľad.'),
            ('pink_hour', 'Pink Hour', '🌺', false, true, 100, array['Hibiscus', 'Rose Hip', 'Strawberry', 'Lemon'], array[2, 1, 1, 1]::smallint[], 'Ibišek se šípkem, jahodou a citronovou kůrou. Růžový, nakyslý a bez kofeinu, nejlepší vychlazený.', 'Hibiscus with rose hip, strawberry and lemon peel. Pink, tart and caffeine-free, best served chilled.', 'Ibištek so šípkou, jahodou a citrónovou kôrou. Ružový, nakyslý a bez kofeínu, najlepší vychladený.', 'summer', 'Ibišek dá barvu a kyselost jako od brusinek, jahoda ji zjemní a citronová kůra osvěží. Vychlazený chutná skoro jako limonáda.', 'Hibiscus brings colour and a cranberry-like tartness, strawberry softens it and lemon peel freshens it up. Chilled, it tastes almost like lemonade.', 'Ibištek dá farbu a kyslosť ako od brusníc, jahoda ju zjemní a citrónová kôra osvieži. Vychladený chutí skoro ako limonáda.', 'Na ledový čaj zalij 2 lžíce půl litrem vroucí vody, louhuj 10 minut, sceď a nech vychladnout. Pak dolij studenou vodou nebo ledem do litru.', 'For iced tea, steep 2 tablespoons in half a litre of boiling water for 10 minutes, strain and let it cool. Then top up to a litre with cold water or ice.', 'Na ľadový čaj zalej 2 lyžice pol litrom vriacej vody, lúhuj 10 minút, preceď a nechaj vychladnúť. Potom dolej studenou vodou alebo ľadom do litra.'),
            ('after_dinner', 'After Dinner', '🌱', false, true, 110, array['Mint', 'Lemon Balm', 'Fennel'], array[2, 2, 1]::smallint[], 'Máta peprná s meduňkou a fenyklem. Chladivá, lehce nasládlá a bez kofeinu, na chvíli po večeři.', 'Peppermint with lemon balm and fennel. Cooling, lightly sweet and caffeine-free, for the moment after dinner.', 'Mäta pieporná s medovkou a feniklom. Chladivá, jemne nasladlá a bez kofeínu, na chvíľu po večeri.', 'evening', 'Máta peprná je výrazná, meduňka ji zjemní citronovou vůní a fenykl přidá nasládlý tón, který připomíná anýz. Kofein v ní není, takže nevadí ani pozdě večer.', 'Peppermint is bold; lemon balm softens it with a lemony scent and fennel adds a sweet, anise-like note. There''s no caffeine, so it''s fine even late in the evening.', 'Mäta pieporná je výrazná, medovka ju zjemní citrónovou vôňou a fenikel pridá nasladlý tón, ktorý pripomína aníz. Kofeín v nej nie je, takže nevadí ani neskoro večer.', 'Dobrá i ve velké konvici na celý večer: 5 lžiček na litr vroucí vody, 7 minut.', 'Good in a big pot for the whole evening: 5 teaspoons per litre of boiling water, 7 minutes.', 'Dobrá aj vo veľkej kanvici na celý večer: 5 lyžičiek na liter vriacej vody, 7 minút.'),
            ('quiet_street', 'Quiet Street', '🌼', false, true, 120, array['Linden', 'Chamomile', 'Lemon'], array[2, 1, 1]::smallint[], 'Lipový květ s heřmánkem a citronovou kůrou. Medově sladký, jemný a bez kofeinu.', 'Linden blossom with chamomile and lemon peel. Honey-sweet, gentle and caffeine-free.', 'Lipový kvet s rumančekom a citrónovou kôrou. Medovo sladký, jemný a bez kofeínu.', 'evening', 'Lípa voní jako ulice v červnu, když kvete. Heřmánek jí dodá jablečný tón a citronová kůra hlídá, aby nebyla moc sladká.', 'Linden smells like a street in June when the trees are in bloom. Chamomile adds an apple-like note and lemon peel keeps it from getting too sweet.', 'Lipa vonia ako ulica v júni, keď kvitne. Rumanček jej dodá jablkový tón a citrónová kôra stráži, aby nebola príliš sladká.', 'Vroucí voda, 5–7 minut. Lžička medu k ní sedí víc než cukr.', 'Boiling water, 5–7 minutes. A spoonful of honey suits it better than sugar.', 'Vriaca voda, 5–7 minút. Lyžička medu k nej sedí viac ako cukor.'),
            ('snowed_in', 'Snowed In', '❄️', false, true, 130, array['Rooibos', 'Apple', 'Cinnamon', 'Cardamom'], array[2, 1, 1, 1]::smallint[], 'Rooibos s jablkem, skořicí a špetkou kardamomu. Hřejivý a sladký jako zimní pečení, ale bez kofeinu, takže i večer.', 'Rooibos with apple, cinnamon and a pinch of cardamom. Warm and sweet like winter baking, but caffeine-free, so evenings too.', 'Rooibos s jablkom, škoricou a štipkou kardamónu. Hrejivý a sladký ako zimné pečenie, ale bez kofeínu, takže aj večer.', 'winter', 'Zimní směs pro ty, kdo nechtějí kofein: místo černého čaje je tu rooibos, který je sám nasládlý. Jablko se skořicí chutná jako štrúdl, kardamom přidá vůni.', 'A winter blend for anyone skipping caffeine: instead of black tea it uses rooibos, which is naturally sweet. Apple and cinnamon taste like strudel, cardamom adds the scent.', 'Zimná zmes pre tých, ktorí nechcú kofeín: namiesto čierneho čaju je tu rooibos, ktorý je sám nasladlý. Jablko so škoricou chutí ako štrúdľa, kardamón pridá vôňu.', 'Vroucí voda a klidně 8 minut, rooibos nezhořkne. S mlékem chutná jako zimní latte.', 'Boiling water and up to 8 minutes; rooibos won''t turn bitter. With milk it tastes like a winter latte.', 'Vriaca voda a pokojne 8 minút, rooibos nezhorkne. S mliekom chutí ako zimné latte.'),
            ('mint_condition', 'Mint Condition', '🌿', false, true, 140, array['Green Tea', 'Spearmint', 'Mint'], array[3, 1, 1]::smallint[], 'Zelený čaj se dvěma mátami, peprnou a kadeřavou. Svěží a chladivý, horký i s ledem.', 'Green tea with two mints, peppermint and curly mint. Fresh and cooling, hot or iced.', 'Zelený čaj s dvoma mätami, piepornou a kučeravou. Svieži a chladivý, horúci aj s ľadom.', 'summer', 'Máta peprná chladí, kadeřavá je sladší a měkčí. Spolu chutnají plněji než každá zvlášť, trochu jako marocký mátový čaj.', 'Peppermint cools, curly mint is sweeter and softer. Together they taste fuller than either alone, a bit like Moroccan mint tea.', 'Mäta pieporná chladí, kučeravá je sladšia a mäkšia. Spolu chutia plnšie ako každá zvlášť, trochu ako marocký mätový čaj.', 'Na ledový: zalij vodou o 80 °C, louhuj 3 minuty, nech vychladnout a podávej s ledem a plátkem citronu.', 'For iced tea: steep in 80 °C water for 3 minutes, let it cool and serve with ice and a slice of lemon.', 'Na ľadový: zalej vodou s teplotou 80 °C, lúhuj 3 minúty, nechaj vychladnúť a podávaj s ľadom a plátkom citróna.')
        on conflict (id) do nothing;
        update public.settings set blends_seed_version = 1 where id = 1;
    end if;
end
$$;

-- Nákup: u každé suroviny, od koho ji jde koupit (podle sortimentu na webech
-- dodavatelů 9. 11. 2026). Ceny tam nejsou, ty doplníš z ceníku. Proběhne
-- jednou; co pak v administraci smažeš nebo změníš, zůstane.
alter table public.settings add column if not exists purchase_seed_version smallint not null default 0;
do $$
begin
    if (select purchase_seed_version from public.settings where id = 1) < 1 then
        -- každá prodávaná surovina má svůj řádek v Nákupu
        insert into public.purchase_materials (name, ingredient_code, for_tea)
        select i.name_cs, i.code, true
          from public.ingredients i
         where i.active
           and not exists (select 1 from public.purchase_materials m where m.ingredient_code = i.code)
        on conflict (name) do nothing;

        insert into public.purchase_offers (supplier_id, material_id, note)
        select s.id, m.id, v.note
          from (values
            -- Herbona (Cheb): byliny, koření, sušené ovoce, zelený čaj, rooibos
            ('Herbona', 'Green Tea',   'V sortimentu „čaj zelený (různé druhy)“. Zeptat se, jaké druhy a řez.'),
            ('Herbona', 'Rooibos',     'V sortimentu (Speciality). Cena, řez a balení: info@herbona.cz.'),
            ('Herbona', 'Chamomile',   'Heřmánek, květ. Cena, řez a balení: info@herbona.cz.'),
            ('Herbona', 'Lemon Balm',  'Meduňka, list. Cena, řez a balení: info@herbona.cz.'),
            ('Herbona', 'Linden',      'Lípa, květ. Cena, řez a balení: info@herbona.cz.'),
            ('Herbona', 'Mint',        'Máta peprná, list. Cena, řez a balení: info@herbona.cz.'),
            ('Herbona', 'Spearmint',   'Máta kadeřavá, list. Na etiketě „máta kadeřavá (list)“.'),
            ('Herbona', 'Apple',       'Jablko, plod. Zeptat se na velikost kousků do čaje.'),
            ('Herbona', 'Strawberry',  'Jahoda, plod (mají i list, ten nechceme). Zeptat se na kousky.'),
            ('Herbona', 'Raspberry',   'Malina, plod (mají i list, ten nechceme). Zeptat se na kousky.'),
            ('Herbona', 'Blueberry',   'Borůvka, plod. Zeptat se na kousky.'),
            ('Herbona', 'Rose Hip',    'Šípek, plod. Cena, řez a balení: info@herbona.cz.'),
            ('Herbona', 'Hibiscus',    'Ibišek, květ. Cena, řez a balení: info@herbona.cz.'),
            ('Herbona', 'Rose',        'Růže, květ. Chceme okvětní lístky, zeptat se.'),
            ('Herbona', 'Lemongrass',  'Citronová tráva (nať). Cena, řez a balení: info@herbona.cz.'),
            ('Herbona', 'Fennel',      'Fenykl, plod. Cena a balení: info@herbona.cz.'),
            ('Herbona', 'Cinnamon',    'Skořice, kůra. Zeptat se na řez do čaje.'),
            ('Herbona', 'Lavender',    'Levandule, květ. Cena a balení: info@herbona.cz.'),
            ('Herbona', 'Cardamom',    'Kardamom (u nich „kardamon“), plod. Cena a balení: info@herbona.cz.'),
            -- Wollenhaupt (Hamburk): čaje a čisté suroviny, čísla položek z webu
            ('Wollenhaupt', 'Black Tea',  'Čajový velkoobchod, vybrat konkrétní černý čaj, vzorky na vyžádání.'),
            ('Wollenhaupt', 'White Tea',  'Čajový velkoobchod, vybrat konkrétní bílý čaj, vzorky na vyžádání.'),
            ('Wollenhaupt', 'Oolong Tea', 'Čajový velkoobchod, vybrat konkrétní oolong, vzorky na vyžádání.'),
            ('Wollenhaupt', 'Ginger',     'Ginger, cut (č. 4310742).'),
            ('Wollenhaupt', 'Orange',     'Na webu jsem pomerančovou kůru jako samostatnou položku nenašel, píšou o citrusech obecně. Zeptat se.'),
            ('Wollenhaupt', 'Lemon',      'Na webu jsem citronovou kůru jako samostatnou položku nenašel, píšou o citrusech obecně. Zeptat se.'),
            ('Wollenhaupt', 'Chamomile',  'Camomile (č. 4310342), BIO č. 4373642. Záloha k Herboně.'),
            ('Wollenhaupt', 'Lemon Balm', 'Lemon balm, cut leaves (č. 4310541). Záloha k Herboně.'),
            ('Wollenhaupt', 'Hibiscus',   'Hibiscus, cut (č. 4300303), BIO č. 4373542. Záloha k Herboně.'),
            ('Wollenhaupt', 'Fennel',     'Fennel sweet Organic, whole seeds (č. 4320742). Záloha k Herboně.'),
            ('Wollenhaupt', 'Lemongrass', 'Lemongrass, cut (č. 4311942). Záloha k Herboně.'),
            ('Wollenhaupt', 'Mint',       'Peppermint, cut leaves (č. 4310942). Záloha k Herboně.'),
            ('Wollenhaupt', 'Rose Hip',   'Rosehips (č. 4300203), BIO č. 4373442. Záloha k Herboně.'),
            -- Alveus (Hamburk): BIO
            ('Alveus', 'Black Tea',  'BIO čaje, vybrat druh. 10 vzorků zdarma pro firmy.'),
            ('Alveus', 'White Tea',  'BIO čaje, vybrat druh. 10 vzorků zdarma pro firmy.'),
            ('Alveus', 'Oolong Tea', 'BIO oolongy (B2B shop). 10 vzorků zdarma pro firmy.'),
            ('Alveus', 'Ginger',     'Ginger Pieces ORGANIC (č. 82867).'),
            ('Alveus', 'Orange',     'Na webu jsem pomerančovou kůru nenašel. Zeptat se.'),
            ('Alveus', 'Lemon',      'Na webu jsem citronovou kůru nenašel. Zeptat se.'),
            -- Zelený Drak (Třebíč): český čajový velkoobchod
            ('Zelený Drak', 'Black Tea',  'Velkoobchod po zaslání IČ, min. 5 000 Kč. Vybrat druh, ověřit nabídku.'),
            ('Zelený Drak', 'White Tea',  'Velkoobchod po zaslání IČ, min. 5 000 Kč. Vybrat druh, ověřit nabídku.'),
            ('Zelený Drak', 'Oolong Tea', 'Velkoobchod po zaslání IČ, min. 5 000 Kč. Vybrat druh, ověřit nabídku.')
          ) as v(supplier, code, note)
          join public.purchase_suppliers s on lower(s.name) = lower(v.supplier)
          join lateral (select id from public.purchase_materials m
                         where m.ingredient_code = v.code order by m.created_at limit 1) m on true
         where not exists (select 1 from public.purchase_offers o where o.supplier_id = s.id and o.material_id = m.id);

        -- Kdyby ses chtěl vrátit k mátě klasnaté: Wollenhaupt ji má.
        update public.purchase_materials
           set notes = 'Herbona prodává mátu kadeřavou. Mátu klasnatou (Spearmint, cut leaves, č. 4300442) má Wollenhaupt, ale pak se musí přejmenovat surovina i etiketa.'
         where ingredient_code = 'Spearmint' and notes = '';

        update public.settings set purchase_seed_version = 1 where id = 1;
    end if;
end;
$$;

-- Úřední a právní kroky před spuštěním prodeje. Vloží se jednou, potom je
-- spravuješ v administraci (Nákup → Úkoly).
insert into public.purchase_tasks (title, who, due)
select v.title, v.who, v.due
  from (values
    ('Ohlásit živnost: Velkoobchod a maloobchod + Výroba potravinářských výrobků (jeden formulář pro úřad, ČSSZ, pojišťovnu i finanční úřad)', 'Václav', null::date),
    ('Doplnit v administraci Nastavení: jméno, IČO, adresu sídla a telefon (ukážou se v podmínkách, patičce a na etiketě)', 'Václav', null),
    ('Oznámit SZPI zahájení činnosti: maloobchod + internetový obchod se skladem, uvést adresu e-shopu (nejpozději v den zahájení prodeje)', 'Václav', null),
    ('Sepsat postupy podle zásad HACCP: příjem surovin, skladování, míchání, balení, čištění, šarže', 'Václav', null),
    ('Ke každé surovině vyžádat od dodavatele specifikaci (alergeny, původ, trvanlivost) a zapsat alergeny u ingredience', 'Václav', null),
    ('Ověřit receptury podle vyhlášky 187/2023: levandule, kurkuma a kardamom nejvýš 5 %, citrusová kůra nejvýš 30 %; skořice, zázvor, vanilka, kokos a med nejsou v příloze 1, zeptat se SZPI', 'Václav', null),
    ('Zeptat se EKO-KOM (info@ekokom.cz), jestli jsem kvůli sáčkům se značkou producent obalů a co mám platit', 'Václav', null),
    ('Nastavit potvrzovací e-mail zákazníkovi po objednávce (zákon ho vyžaduje), např. Resend + Supabase', 'Václav', null),
    ('Dokud nejede automatický e-mail: každou objednávku potvrdit zákazníkovi e-mailem ručně a do balíčku přiložit doklad a obchodní podmínky', 'Václav', null),
    ('Vyzkoušet tlačítko „Odstoupit od smlouvy“ na testovací objednávce a poslat si potvrzení (zákon 159/2026 Sb. platí od 1. 1. 2027)', 'Václav', date '2026-12-31'),
    ('Ověřit, že ti patří doména teaseyou.cz a funguje e-mail hello@teaseyou.cz (poslat si zkušební zprávu); jinak změnit e-mail v Nastavení', 'Václav', null),
    ('Nechat obchodní podmínky a ochranu osobních údajů zkontrolovat právníkem', 'Václav', null),
    ('Ověřit v Supabase (Project Settings → General), ve kterém regionu jsou data, a doplnit to do ochrany osobních údajů', 'Václav', null),
    ('Mýdla a balzámy: než se začnou prodávat, zjistit cenu posudku bezpečnosti, registraci v CPNP a oznámení hygieně', 'Klára', null),
    ('Projít znovu PRAVNI-KONTROLA.md v repozitáři (jednou za rok a při každé nové funkci, dodavateli nebo zemi)', 'Václav', date '2027-11-05'),
    ('Zapnout dvoufázové přihlášení na účtech Supabase a GitHub', 'Václav', null),
    ('Stáhnout první zálohu (Zálohy a koš) a uložit ji na dvě místa; pak jednou týdně', 'Václav', null),
    ('Zkouška obnovy zálohy do testovacího projektu (postup v ZALOHY-A-OBNOVA.md)', 'Václav', date '2027-11-05')
  ) as v(title, who, due)
 where not exists (select 1 from public.purchase_tasks where title like 'Ohlásit živnost:%');

-- Přibylo v listopadu 2026 s noční zálohou a režimem před spuštěním, vloží se jednou.
insert into public.purchase_tasks (title, who, due)
select 'Nastavit noční zálohu na GitHubu: heslo role, dva secrets a jedno ruční spuštění (supabase/README.md)', 'Václav', null
 where not exists (select 1 from public.purchase_tasks where title like 'Nastavit noční zálohu%');
insert into public.purchase_tasks (title, who, due)
select 'Spustit prodej (Ceny a doprava → Prodej), až bude živnost, oznámení SZPI, funkční e-mail a zkontrolované podmínky', 'Václav', null
 where not exists (select 1 from public.purchase_tasks where title like 'Spustit prodej%');


-- ═══ OCHRANA PŘED ZTRÁTOU DAT ══════════════════════════════════════
-- Free plán Supabase nemá automatické zálohy a zálohy databáze nikdy
-- neobsahují fotky. Proto:
--   1. koš: co se v administraci smaže, se 30 dní dá vrátit (deleted_rows)
--      a je u toho vidět, kdo a kdy to smazal,
--   2. limit: jeden požadavek nesmaže víc než pár řádků najednou,
--   3. záloha: export_backup() a restore_backup() pro soubor, který si
--      admin stáhne k sobě (administrace → Zálohy, přidá i fotky).

alter table public.settings add column if not exists last_backup_at timestamptz;

create table if not exists public.deleted_rows (
    id                bigint generated always as identity primary key,
    deleted_at        timestamptz not null default now(),
    batch             bigint not null default txid_current(),
    table_name        text not null,
    row_key           text not null,
    data              jsonb not null,
    deleted_by        uuid,
    deleted_by_email  text,
    restored_at       timestamptz
);
create index if not exists deleted_rows_batch_idx on public.deleted_rows (batch);
create index if not exists deleted_rows_time_idx  on public.deleted_rows (deleted_at desc);
alter table public.deleted_rows enable row level security;
drop policy if exists "deleted_rows_admin_read" on public.deleted_rows;
create policy "deleted_rows_admin_read" on public.deleted_rows for select to authenticated
    using (public.is_admin());
-- Jen pro čtení: zapisuje trigger, obnovuje restore_deleted(). Nikdo nemůže
-- záznam změnit ani smazat (jen úklid po 30 dnech).
revoke all on public.deleted_rows from anon, authenticated;
grant select on public.deleted_rows to authenticated;

-- Každý smazaný řádek se uloží do koše (kromě úmyslného mazání po lhůtě
-- nebo na žádost podle GDPR, to nastaví teaseyou.skip_trash).
create or replace function public.trash_deleted_row()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare v_uid uuid;
begin
    if coalesce(current_setting('teaseyou.skip_trash', true), '') = 'on' then
        return old;
    end if;
    begin v_uid := auth.uid(); exception when others then v_uid := null; end;
    insert into public.deleted_rows (table_name, row_key, data, deleted_by, deleted_by_email)
    values (tg_table_name, to_jsonb(old) ->> tg_argv[0], to_jsonb(old), v_uid,
            (select email from auth.users where id = v_uid));
    return old;
end;
$$;

-- Hromadné mazání: když jeden příkaz smaže víc řádků než limit, celý se
-- zruší a nesmaže se nic (i to, co by smazalo kaskádové mazání).
create or replace function public.guard_bulk_delete()
returns trigger
language plpgsql
as $$
declare n integer; v_limit integer := tg_argv[0]::integer;
begin
    if coalesce(current_setting('teaseyou.allow_bulk', true), '') = 'on' then
        return null;
    end if;
    select count(*) into n from gone;
    if n > v_limit then
        raise exception 'bulk_delete_blocked'
            using errcode = 'P0001',
                  detail = format('%s: %s řádků najednou, limit je %s. Nesmazalo se nic.', tg_table_name, n, v_limit);
    end if;
    return null;
end;
$$;

do $$
declare
    r record;
begin
    for r in select * from (values
        ('ingredients', 'id', 20), ('blends', 'id', 20), ('price_tiers', 'weight_g', 20),
        ('shipping_methods', 'id', 20), ('promo_codes', 'code', 20), ('craft_products', 'id', 20),
        ('craft_waitlist', 'id', 100), ('purchase_suppliers', 'id', 20), ('purchase_materials', 'id', 20),
        ('purchase_offers', 'id', 100), ('purchase_tasks', 'id', 50), ('reviews', 'id', 20)
    ) as v(t, k, lim) loop
        execute format('drop trigger if exists %I_trash on public.%I', r.t, r.t);
        execute format('create trigger %I_trash after delete on public.%I
                        for each row execute function public.trash_deleted_row(%L)', r.t, r.t, r.k);
        execute format('drop trigger if exists %I_bulk_guard on public.%I', r.t, r.t);
        execute format('create trigger %I_bulk_guard after delete on public.%I
                        referencing old table as gone
                        for each statement execute function public.guard_bulk_delete(%L)', r.t, r.t, r.lim);
    end loop;
end;
$$;

-- Pořadí tabulek pro obnovu: nejdřív ty, na které ostatní odkazují.
create or replace function public.restore_order(p_table text)
returns integer
language sql
immutable
as $$
    select coalesce(array_position(array[
        'settings', 'ingredients', 'blends', 'price_tiers', 'shipping_methods', 'promo_codes',
        'craft_products', 'craft_waitlist', 'purchase_suppliers', 'purchase_materials',
        'purchase_offers', 'purchase_tasks', 'orders', 'reviews', 'withdrawals', 'privacy_requests'], p_table), 99);
$$;

-- Vrátí z koše všechno, co se smazalo jedním kliknutím (jedna transakce).
-- Co mezitím vzniklo znovu se stejným klíčem, nepřepíše.
create or replace function public.restore_deleted(p_batch bigint)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
    r record; n integer; v_ok integer := 0; v_skip integer := 0;
begin
    if not public.is_admin() then
        raise exception 'not_admin' using errcode = '42501';
    end if;
    for r in select * from public.deleted_rows
              where batch = p_batch and restored_at is null
              order by public.restore_order(table_name), id loop
        begin
            execute format('insert into public.%I overriding system value
                            select * from jsonb_populate_record(null::public.%I, $1)
                            on conflict do nothing', r.table_name, r.table_name) using r.data;
            get diagnostics n = row_count;
        exception when others then
            n := 0;
        end;
        if n > 0 then
            update public.deleted_rows set restored_at = now() where id = r.id;
            v_ok := v_ok + 1;
        else
            v_skip := v_skip + 1;
        end if;
    end loop;
    return jsonb_build_object('restored', v_ok, 'skipped', v_skip);
end;
$$;

-- Výmaz e-mailu ze seznamu zájemců na žádost (GDPR): bez kopie v koši.
create or replace function public.erase_waitlist_email(p_email text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare n integer;
begin
    if not public.is_admin() then
        raise exception 'not_admin' using errcode = '42501';
    end if;
    perform set_config('teaseyou.skip_trash', 'on', true);
    delete from public.craft_waitlist where email = lower(btrim(p_email));
    get diagnostics n = row_count;
    delete from public.deleted_rows where table_name = 'craft_waitlist' and data ->> 'email' = lower(btrim(p_email));
    return n;
end;
$$;

-- Tabulky v záloze a jejich primární klíče.
create or replace function public.backup_tables()
returns table (t text, k text)
language sql
immutable
as $$
    values ('settings', 'id'), ('ingredients', 'id'), ('blends', 'id'), ('price_tiers', 'weight_g'),
           ('shipping_methods', 'id'), ('promo_codes', 'code'), ('craft_products', 'id'),
           ('craft_waitlist', 'id'), ('purchase_suppliers', 'id'), ('purchase_materials', 'id'),
           ('purchase_offers', 'id'), ('purchase_tasks', 'id'), ('orders', 'id'),
           ('reviews', 'id'), ('withdrawals', 'id'), ('privacy_requests', 'id');
$$;

-- Celá databáze obchodu jako jeden JSON (jeden konzistentní snímek).
-- Sama nic nekontroluje, proto ji nesmí spustit nikdo z webu. Volá ji
-- export_backup() pro admina a noční záloha přes roli teaseyou_backup.
create or replace function public.backup_snapshot()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
    r record; v_tables jsonb := '{}'::jsonb; v_rows jsonb;
begin
    -- Čas zálohy zapíšeme dřív, než se data přečtou, ať ho záloha obsahuje.
    update public.settings set last_backup_at = now() where id = 1;
    for r in select * from public.backup_tables() loop
        execute format('select coalesce(jsonb_agg(to_jsonb(x) order by x.%I), ''[]''::jsonb) from public.%I x', r.k, r.t)
            into v_rows;
        v_tables := v_tables || jsonb_build_object(r.t, v_rows);
    end loop;
    return jsonb_build_object('format', 'teaseyou-backup', 'version', 1,
                              'created_at', now(), 'tables', v_tables);
end;
$$;
-- Hned po vytvoření pryč z dosahu webu (Supabase ji anon a authenticated dává sám).
revoke all on function public.backup_snapshot() from public, anon, authenticated, service_role;

create or replace function public.export_backup()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
    if not public.is_admin() then
        raise exception 'not_admin' using errcode = '42501';
    end if;
    return public.backup_snapshot();
end;
$$;

-- Role pro noční zálohu na GitHubu. Umí jen jedno: spustit backup_snapshot().
-- Nevidí do tabulek, nic nesmaže ani nezmění. Vzniká bez hesla, takže se za ni
-- nikdo nepřihlásí, dokud majitel nespustí reset_backup_password() (supabase/README.md).
do $$
begin
    if not exists (select 1 from pg_roles where rolname = 'teaseyou_backup') then
        create role teaseyou_backup login noinherit;
    end if;
end $$;
alter role teaseyou_backup set statement_timeout = '60s';
grant usage on schema public to teaseyou_backup;

-- Nové náhodné heslo pro teaseyou_backup. Spouští se v SQL Editoru:
--   select public.reset_backup_password();
-- Heslo se ukáže jednou ve výsledku. V textu dotazu ani v historii není.
-- Staré heslo tím přestane platit (třeba když unikne).
create or replace function public.reset_backup_password()
returns text
language plpgsql
set search_path = public
as $$
declare
    v text := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
begin
    execute format('alter role teaseyou_backup with login password %L', v);
    return v;
end;
$$;

-- Obnova ze zálohy.
--   výchozí (p_overwrite = false): jen doplní, co chybí. Nic nemaže ani nepřepíše.
--   p_overwrite = true: katalog, nastavení, mýdla a nákup budou přesně jako
--     v záloze (co v záloze není, jde do koše, takže se dá 30 dní vrátit).
--     Objednávky, odstoupení, žádosti a zájemce vždycky jen doplní.
--   p_dry_run = true (výchozí): jen spočítá, co by se stalo, a nic nezmění.
create or replace function public.restore_backup(p jsonb, p_overwrite boolean default false, p_dry_run boolean default true)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
    r record; v_row jsonb; n integer; v_cols text; v_list text; v_sql text;
    v_keys text[]; v_prev_keys text[]; v_prev_table text;
    v_report jsonb := '{}'::jsonb; v_ins integer; v_upd integer; v_same integer; v_err integer;
    v_insert_only text[] := array['orders', 'withdrawals', 'privacy_requests', 'craft_waitlist'];
    v_exists boolean;
    v_same_row boolean;
    v_removed jsonb := '{}'::jsonb;
    v_last_backup timestamptz := (select last_backup_at from public.settings where id = 1);
begin
    if not public.is_admin() then
        raise exception 'not_admin' using errcode = '42501';
    end if;
    if p ->> 'format' is distinct from 'teaseyou-backup' or jsonb_typeof(p -> 'tables') <> 'object' then
        raise exception 'invalid_backup' using errcode = 'P0001';
    end if;
    begin
        if p_overwrite then
            -- Nejdřív pryč (do koše) to, co v záloze není: třeba ukázková data,
            -- která do prázdné databáze vložil setup.sql. Od dětí k rodičům.
            perform set_config('teaseyou.allow_bulk', 'on', true);
            for r in select * from public.backup_tables()
                      where t <> all (v_insert_only) and t <> 'settings'
                      order by public.restore_order(t) desc loop
                execute format('delete from public.%I x where not exists (
                                    select 1 from jsonb_array_elements(coalesce($1 -> %L, ''[]''::jsonb)) e
                                     where e ->> %L = x.%I::text)', r.t, r.t, r.k, r.k)
                    using p -> 'tables';
                get diagnostics n = row_count;
                v_removed := v_removed || jsonb_build_object(r.t, n);
            end loop;
            perform set_config('teaseyou.allow_bulk', '', true);
        end if;
        for r in select * from public.backup_tables() order by public.restore_order(t) loop
            v_ins := 0; v_upd := 0; v_same := 0; v_err := 0;
            for v_row in select * from jsonb_array_elements(coalesce(p -> 'tables' -> r.t, '[]'::jsonb)) loop
                begin
                    -- Jen sloupce, které záloha má. Co přibylo později (třeba
                    -- sales_open), zůstane, jak je, nebo dostane výchozí hodnotu.
                    -- Řádky jedné tabulky mají stejné klíče, počítá se jednou.
                    v_keys := array(select jsonb_object_keys(v_row) order by 1);
                    if v_keys is distinct from v_prev_keys or v_prev_table is distinct from r.t then
                        select string_agg(format('%I', column_name), ', ' order by ordinal_position),
                               string_agg(format('%I = excluded.%I', column_name, column_name), ', ' order by ordinal_position)
                                   filter (where column_name <> r.k)
                          into v_list, v_cols
                          from information_schema.columns
                         where table_schema = 'public' and table_name = r.t and column_name = any (v_keys);
                        v_prev_keys := v_keys;
                        v_prev_table := r.t;
                    end if;
                    execute format('select exists (select 1 from public.%I where %I::text = $1)', r.t, r.k)
                        into v_exists using v_row ->> r.k;
                    if v_exists and (not p_overwrite or r.t = any (v_insert_only)) then
                        v_same := v_same + 1;
                        continue;
                    end if;
                    if v_exists then
                        -- Stejný řádek (kromě času úpravy) nepočítáme jako přepsaný.
                        execute format('select ((select jsonb_object_agg(e.key, e.value) from jsonb_each(to_jsonb(x)) e where $2 ? e.key)
                                                 - ''updated_at'' - ''last_backup_at'') = ($2 - ''updated_at'' - ''last_backup_at'')
                                          from public.%I x where %I::text = $1', r.t, r.k)
                            into v_same_row using v_row ->> r.k, v_row;
                        if v_same_row then
                            v_same := v_same + 1;
                            continue;
                        end if;
                    end if;
                    v_sql := format('insert into public.%I (%s) overriding system value
                                     select %s from jsonb_populate_record(null::public.%I, $1) ', r.t, v_list, v_list, r.t)
                          || case when v_exists and v_cols is not null then format('on conflict (%I) do update set %s', r.k, v_cols)
                                  else 'on conflict do nothing' end;
                    execute v_sql using v_row;
                    get diagnostics n = row_count;
                    if n > 0 and v_exists then v_upd := v_upd + 1;
                    elsif n > 0 then v_ins := v_ins + 1;
                    else v_err := v_err + 1; end if;  -- střet s jiným jedinečným údajem
                exception when others then
                    v_err := v_err + 1;
                end;
            end loop;
            v_report := v_report || jsonb_build_object(r.t, jsonb_build_object(
                'in_backup', jsonb_array_length(coalesce(p -> 'tables' -> r.t, '[]'::jsonb)),
                'added', v_ins, 'overwritten', v_upd, 'kept', v_same, 'failed', v_err,
                'removed', coalesce((v_removed ->> r.t)::integer, 0)));
        end loop;
        -- Čítače ID musí jít za nejvyšší obnovené číslo, jinak by další
        -- objednávka narazila na existující ID.
        perform setval(pg_get_serial_sequence('public.orders', 'id'), (select max(id) from public.orders))
          where exists (select 1 from public.orders);
        perform setval(pg_get_serial_sequence('public.craft_waitlist', 'id'), (select max(id) from public.craft_waitlist))
          where exists (select 1 from public.craft_waitlist);
        perform setval(pg_get_serial_sequence('public.withdrawals', 'id'), (select max(id) from public.withdrawals))
          where exists (select 1 from public.withdrawals);
        perform setval(pg_get_serial_sequence('public.privacy_requests', 'id'), (select max(id) from public.privacy_requests))
          where exists (select 1 from public.privacy_requests);
        perform setval(pg_get_serial_sequence('public.reviews', 'id'), (select max(id) from public.reviews))
          where exists (select 1 from public.reviews);
        -- Obnova starší zálohy nesmí vrátit čas poslední zálohy do minulosti.
        update public.settings set last_backup_at = greatest(last_backup_at, v_last_backup) where id = 1;
        if p_dry_run then
            raise exception 'dry_run_rollback' using errcode = 'P0099';
        end if;
    exception when sqlstate 'P0099' then
        null;  -- zkušební běh: všechno se vrátilo, zůstal jen přehled
    end;
    return jsonb_build_object('dry_run', p_dry_run, 'overwrite', p_overwrite, 'tables', v_report);
end;
$$;

revoke all on function public.restore_deleted(bigint) from public;
revoke all on function public.erase_waitlist_email(text) from public;
revoke all on function public.export_backup() from public;
revoke all on function public.restore_backup(jsonb, boolean, boolean) from public;
-- Supabase dává nové funkce automaticky anon i authenticated, tady to nesmí.
revoke all on function public.backup_snapshot() from public, anon, authenticated, service_role;
revoke all on function public.reset_backup_password() from public, anon, authenticated, service_role;
grant execute on function public.backup_snapshot() to teaseyou_backup;
grant execute on function public.restore_deleted(bigint) to authenticated;
grant execute on function public.erase_waitlist_email(text) to authenticated;
grant execute on function public.export_backup() to authenticated;
grant execute on function public.restore_backup(jsonb, boolean, boolean) to authenticated;
