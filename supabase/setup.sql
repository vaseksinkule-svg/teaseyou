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

-- Ceník podle gramáže. Cena je za celé balení, ne za gram.
create table if not exists public.price_tiers (
    weight_g    integer primary key check (weight_g between 1 and 5000),
    price_czk   integer not null check (price_czk between 1 and 100000),
    active      boolean not null default true,
    updated_at  timestamptz not null default now()
);

-- Doprava. Web zná tři způsoby (post, zasilkovna, dpd) — tady se jim
-- mění cena a dá se který vypnout.
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
alter table public.settings add column if not exists recipe_base_pct   smallint not null default 70 check (recipe_base_pct between 1 and 100);
alter table public.settings add column if not exists recipe_flavor_pct smallint not null default 20 check (recipe_flavor_pct between 0 and 99);
alter table public.settings add column if not exists recipe_extra_pct  smallint not null default 10 check (recipe_extra_pct between 0 and 99);
alter table public.settings add column if not exists durability_months smallint not null default 12 check (durability_months between 1 and 36);
-- Spuštění prodeje. Dokud je vypnuté, web ukazuje „Připravujeme spuštění“
-- a place_order() objednávky odmítne. Zapnout jde jen s vyplněným jménem,
-- IČO, adresou a e-mailem prodávajícího (§ 435 OZ, zákon 480/2004 § 5).
alter table public.settings add column if not exists sales_open      boolean not null default false;
alter table public.settings add column if not exists sales_opened_at timestamptz;

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
    v_lang       text  := case when p_order ->> 'lang' = 'en' then 'en' else 'cs' end;
    v_terms      text  := case when coalesce(p_order ->> 'termsVersion', '') ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
                               then p_order ->> 'termsVersion' end;
    v_items      jsonb := p_order -> 'items';
    v_item       jsonb;
    v_lines      jsonb := '[]'::jsonb;
    v_codes      text[];
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
    -- výdejní místo Zásilkovny adresu nepotřebujeme, tak ji nechceme
    -- (minimalizace údajů). Když ji někdo vyplní, musí být celá a platná.
    if length(v_first) not between 2 and 100
       or length(v_last) not between 2 and 100
       or length(v_email) > 200 or v_email !~ '^[^\s@]+@[^\s@]+\.[^\s@]+$'
       or v_phone !~ '^\+?[0-9][0-9 ]{7,14}$'
       or v_country not in ('CZ', 'SK') then
        raise exception 'invalid_customer' using errcode = 'P0001';
    end if;
    if (v_ship_id <> 'zasilkovna' or v_street <> '' or v_city <> '' or v_zip <> '')
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

        if v_codes is null or array_length(v_codes, 1) not between 1 and 3 then
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

        v_name := left(btrim(coalesce(v_item ->> 'name', '')), 60);
        if v_name = '' then v_name := 'Custom Mix'; end if;

        select jsonb_agg(i.name_cs order by array_position(v_codes, i.code)) into v_names
        from public.ingredients i where i.code = any (v_codes);

        v_lines := v_lines || jsonb_build_array(jsonb_build_object(
            'name',             v_name,
            'ingredients',      to_jsonb(v_codes),
            'ingredient_names', v_names,
            'weight_g',         v_weight,
            'qty',              v_qty,
            'unit_czk',         v_unit,
            'line_czk',         v_unit * v_qty));
        v_goods := v_goods + v_unit * v_qty;
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
    -- Příplatek za dobírku platí vždy, i při dopravě zdarma.
    select free_ship_threshold, case when v_pay = 'cod' then cod_fee_czk else 0 end
      into v_threshold, v_payfee
      from public.settings where id = 1;
    v_payfee := coalesce(v_payfee, 0);
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
        items, goods_czk, discount_czk, shipping_czk, payment_czk, total_czk, promo_code, lang, terms_version)
    values (
        v_first, v_last, v_email, v_phone, v_street, v_city, v_zip, v_country, v_note,
        v_ship_id, v_ship.name, nullif(v_point, ''), nullif(v_point_id, ''), v_pay,
        v_lines, v_goods, v_discount, v_shipping, v_payfee,
        v_goods - v_discount + v_shipping + v_payfee, v_promo, v_lang, v_terms)
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
        'total',    v_goods - v_discount + v_shipping + v_payfee);
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
create index if not exists craft_waitlist_created_idx on public.craft_waitlist (created_at desc);
create index if not exists craft_waitlist_email_idx   on public.craft_waitlist (email, created_at);

drop trigger if exists craft_products_updated_at on public.craft_products;
create trigger craft_products_updated_at before update on public.craft_products
    for each row execute function public.set_updated_at();

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
    values (p_product, v_email, case when p_lang = 'en' then 'en' else 'cs' end)
    on conflict (product_id, email) do nothing;
    return true;
end;
$$;
revoke all on function public.join_craft_waitlist(text, text, text) from public;
grant execute on function public.join_craft_waitlist(text, text, text) to anon, authenticated;


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
           contacts_purged_at = now()
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
     flavor_cs, flavor_en, health_cs, health_en, pairs, brew_temp, brew_time, sort)
values
    ('green_tea', 'Green Tea', 'base', 'Zelený čaj', 'Green Tea', 'Svěží a zemitý, nízký kofein.', 'Fresh and earthy, light caffeine.', '🍃', '#8da676', 2, array['zemitá', 'svěží', 'travnatá']::text[], array['earthy', 'fresh', 'grassy']::text[], array['Antioxidanty', 'Soustředění', 'Metabolismus']::text[], array['Antioxidants', 'Focus', 'Metabolism']::text[], array['Mint', 'Lemon', 'Ginger']::text[], '75–80°C', '2–3 min', 10),
    ('black_tea', 'Black Tea', 'base', 'Černý čaj', 'Black Tea', 'Silný a výrazný, vysoký kofein.', 'Strong and bold, high caffeine.', '🖤', '#4a3b32', 4, array['výrazná', 'sladová', 'silná']::text[], array['bold', 'malty', 'robust']::text[], array['Energie', 'Zdraví srdce', 'Zdravá střeva']::text[], array['Energy', 'Heart health', 'Gut health']::text[], array['Vanilla', 'Ginger', 'Cinnamon']::text[], '90–95°C', '3–4 min', 20),
    ('white_tea', 'White Tea', 'base', 'Bílý čaj', 'White Tea', 'Jemný a sladký, nízký kofein.', 'Delicate and sweet, low caffeine.', '🤍', '#f5e6d3', 1, array['jemná', 'sladká', 'květinová']::text[], array['delicate', 'sweet', 'floral']::text[], array['Antioxidanty', 'Pokožka', 'Proti stárnutí']::text[], array['Antioxidants', 'Skin', 'Anti-aging']::text[], array['Rose', 'Strawberry', 'Honey']::text[], '75–80°C', '2–3 min', 30),
    ('oolong', 'Oolong Tea', 'base', 'Oolong', 'Oolong Tea', 'Komplexní a květinový, střední kofein.', 'Complex and floral, medium caffeine.', '🍵', '#c8a0b4', 3, array['komplexní', 'květinová', 'pražená']::text[], array['complex', 'floral', 'toasty']::text[], array['Hubnutí', 'Trávení', 'Soustředění']::text[], array['Weight mgmt', 'Digestion', 'Focus']::text[], array['Rose', 'Lavender', 'Honey']::text[], '85–90°C', '3–4 min', 40),
    ('rooibos', 'Rooibos', 'base', 'Rooibos', 'Rooibos', 'Zemitý a sladký, bez kofeinu.', 'Earthy and sweet, caffeine-free.', '🌿', '#e8720c', 0, array['zemitá', 'sladká', 'oříšková']::text[], array['earthy', 'sweet', 'nutty']::text[], array['Bez kofeinu', 'Bohaté na železo', 'Relaxace']::text[], array['Caffeine-free', 'Iron-rich', 'Relaxing']::text[], array['Orange', 'Cinnamon', 'Vanilla']::text[], '100°C', '5–7 min', 50),
    ('chamomile', 'Chamomile', 'base', 'Heřmánek', 'Chamomile', 'Klidný a uklidňující, bez kofeinu.', 'Calm and soothing, caffeine-free.', '🌼', '#f5d78e', 0, array['květinová', 'jablečná', 'uklidňující']::text[], array['floral', 'apple', 'soothing']::text[], array['Spánek', 'Úleva od úzkosti', 'Trávení']::text[], array['Sleep', 'Anxiety relief', 'Digestion']::text[], array['Lavender', 'Lemon', 'Honey']::text[], '100°C', '5–7 min', 60),
    ('strawberry', 'Strawberry', 'flavor', 'Jahoda', 'Strawberry', 'Sladká a ovocná, letní.', 'Sweet and fruity, summery.', '🍓', '#cc4747', null, array['sladká', 'ovocná', 'letní']::text[], array['sweet', 'fruity', 'summery']::text[], array['Vitamín C', 'Antioxidanty']::text[], array['Vitamin C', 'Antioxidants']::text[], array['White Tea', 'Vanilla', 'Lemon']::text[], null, null, 70),
    ('mint', 'Mint', 'flavor', 'Máta', 'Mint', 'Chladivá a svěží, výrazná.', 'Cooling and fresh, bright.', '🌱', '#4caf50', null, array['chladivá', 'svěží', 'jiskřivá']::text[], array['cooling', 'fresh', 'bright']::text[], array['Trávení', 'Soustředění', 'Osvěžení']::text[], array['Digestion', 'Focus', 'Refresh']::text[], array['Green Tea', 'Lemon', 'Honey']::text[], null, null, 80),
    ('vanilla', 'Vanilla', 'flavor', 'Vanilka', 'Vanilla', 'Sladká, krémová a hřejivá.', 'Sweet, creamy and warm.', '🌸', '#f3e5ab', null, array['sladká', 'krémová', 'hřejivá']::text[], array['sweet', 'creamy', 'warm']::text[], array['Nálada', 'Antioxidanty']::text[], array['Mood lift', 'Antioxidants']::text[], array['Black Tea', 'Rooibos', 'Cinnamon']::text[], null, null, 90),
    ('rose', 'Rose', 'flavor', 'Růže', 'Rose', 'Květinová a jemná.', 'Floral and delicate.', '🌹', '#e8607a', null, array['květinová', 'romantická', 'lehká']::text[], array['floral', 'romantic', 'light']::text[], array['Antioxidanty', 'Nálada', 'Pokožka']::text[], array['Antioxidants', 'Mood', 'Skin']::text[], array['White Tea', 'Oolong', 'Lavender']::text[], null, null, 100),
    ('orange', 'Orange', 'flavor', 'Pomeranč', 'Orange', 'Citrusový, svěží a šťavnatý.', 'Citrusy, bright and zesty.', '🍊', '#ffb347', null, array['citrusová', 'jiskřivá', 'osvěžující']::text[], array['citrusy', 'bright', 'zesty']::text[], array['Vitamín C', 'Imunita', 'Energie']::text[], array['Vitamin C', 'Immunity', 'Energy']::text[], array['Rooibos', 'Black Tea', 'Ginger']::text[], null, null, 110),
    ('blueberry', 'Blueberry', 'flavor', 'Borůvka', 'Blueberry', 'Sladká a nakyslá, chutná jako léto.', 'Sweet and tart, tastes like summer.', '🫐', '#9b59b6', null, array['sladká', 'ovocná', 'nakyslá']::text[], array['sweet', 'fruity', 'tart']::text[], array['Antioxidanty', 'Zdraví mozku', 'Proti stárnutí']::text[], array['Antioxidants', 'Brain health', 'Anti-aging']::text[], array['Green Tea', 'Lemon', 'Mint']::text[], null, null, 120),
    ('raspberry', 'Raspberry', 'flavor', 'Malina', 'Raspberry', 'Nakyslá, ovocná a živá.', 'Tart, fruity and vibrant.', '🍇', '#e91e8c', null, array['nakyslá', 'ovocná', 'živá']::text[], array['tart', 'fruity', 'vibrant']::text[], array['Vitamín C', 'Antioxidanty', 'Vláknina']::text[], array['Vitamin C', 'Antioxidants', 'Fiber']::text[], array['Green Tea', 'Mint', 'Lemon']::text[], null, null, 130),
    ('cocoa', 'Cocoa', 'flavor', 'Kakao', 'Cocoa', 'Bohaté, čokoládové a zemité.', 'Rich, chocolatey and earthy.', '🍫', '#795548', null, array['bohatá', 'čokoládová', 'zemitá']::text[], array['rich', 'chocolatey', 'earthy']::text[], array['Nálada', 'Antioxidanty', 'Energie']::text[], array['Mood', 'Antioxidants', 'Energy']::text[], array['Black Tea', 'Rooibos', 'Cinnamon']::text[], null, null, 140),
    ('coconut', 'Coconut', 'flavor', 'Kokos', 'Coconut', 'Tropický, sladký a krémový.', 'Tropical, sweet and creamy.', '🥥', '#4fc3f7', null, array['tropická', 'sladká', 'krémová']::text[], array['tropical', 'sweet', 'creamy']::text[], array['MCT tuky', 'Energie', 'Hydratace']::text[], array['MCTs', 'Energy', 'Hydration']::text[], array['Rooibos', 'Oolong', 'Vanilla']::text[], null, null, 150),
    ('honey', 'Honey', 'extra', 'Med', 'Honey', 'Přirozeně sladký a hřejivý.', 'Naturally sweet and soothing.', '🍯', '#ffc107', null, array['sladká', 'květinová', 'hřejivá']::text[], array['sweet', 'floral', 'warm']::text[], array['Antimikrobiální', 'Zklidnění', 'Energie']::text[], array['Antimicrobial', 'Soothing', 'Energy']::text[], array['Chamomile', 'Green Tea', 'Lemon']::text[], null, null, 160),
    ('lemon', 'Lemon', 'extra', 'Citron', 'Lemon', 'Svěží, citrusový a nakyslý.', 'Bright, citrusy and tart.', '🍋', '#ffe066', null, array['jiskřivá', 'citrusová', 'nakyslá']::text[], array['bright', 'citrusy', 'tart']::text[], array['Vitamín C', 'Detox', 'Imunita']::text[], array['Vitamin C', 'Detox', 'Immunity']::text[], array['Green Tea', 'Chamomile', 'Ginger']::text[], null, null, 170),
    ('ginger', 'Ginger', 'extra', 'Zázvor', 'Ginger', 'Pikantní, hřejivý a svěží.', 'Spicy, warm and zesty.', '🫚', '#ff9800', null, array['kořeněná', 'hřejivá', 'osvěžující']::text[], array['spicy', 'warm', 'zesty']::text[], array['Trávení', 'Proti nevolnosti', 'Protizánětlivé']::text[], array['Digestion', 'Anti-nausea', 'Anti-inflammatory']::text[], array['Black Tea', 'Lemon', 'Honey']::text[], null, null, 180),
    ('lavender', 'Lavender', 'extra', 'Levandule', 'Lavender', 'Květinová a uklidňující.', 'Floral and calming.', '💜', '#b8a0cc', null, array['květinová', 'uklidňující', 'bylinková']::text[], array['floral', 'calming', 'herby']::text[], array['Spánek', 'Proti stresu', 'Nálada']::text[], array['Sleep', 'Stress relief', 'Mood']::text[], array['Chamomile', 'White Tea', 'Honey']::text[], null, null, 190),
    ('turmeric', 'Turmeric', 'extra', 'Kurkuma', 'Turmeric', 'Zemitá, pepřová a hřejivá.', 'Earthy, peppery and warm.', '🌕', '#d4a017', null, array['zemitá', 'pepřová', 'hřejivá']::text[], array['earthy', 'peppery', 'warm']::text[], array['Protizánětlivé', 'Imunita', 'Klouby']::text[], array['Anti-inflammatory', 'Immunity', 'Joints']::text[], array['Chamomile', 'Black Tea', 'Ginger']::text[], null, null, 200),
    ('cinnamon', 'Cinnamon', 'extra', 'Skořice', 'Cinnamon', 'Hřejivá, kořeněná a sladká.', 'Warm, spicy and sweet.', '🪵', '#c8824a', null, array['hřejivá', 'kořeněná', 'sladká']::text[], array['warm', 'spicy', 'sweet']::text[], array['Krevní cukr', 'Protizánětlivé', 'Energie']::text[], array['Blood sugar', 'Anti-inflammatory', 'Energy']::text[], array['Black Tea', 'Rooibos', 'Vanilla']::text[], null, null, 210),
    ('spearmint', 'Spearmint', 'extra', 'Máta peprná', 'Spearmint', 'Chladivá, sladká a jemná.', 'Cool, sweet and mild.', '🌿', '#a8d8a8', null, array['chladivá', 'sladká', 'jemná']::text[], array['cool', 'sweet', 'mild']::text[], array['Trávení', 'Soustředění', 'Svěží dech']::text[], array['Digestion', 'Focus', 'Breath']::text[], array['Rooibos', 'Green Tea', 'Lemon']::text[], null, null, 220),
    ('rose_hip', 'Rose Hip', 'extra', 'Šípek', 'Rose Hip', 'Nakyslý, ovocný a svěží.', 'Tart, fruity and tangy.', '🔴', '#f8bbd0', null, array['nakyslá', 'ovocná', 'svěží']::text[], array['tart', 'fruity', 'tangy']::text[], array['Vitamín C', 'Pokožka', 'Imunita']::text[], array['Vitamin C', 'Skin', 'Immunity']::text[], array['Chamomile', 'Rooibos', 'Honey']::text[], null, null, 230),
    ('cardamom', 'Cardamom', 'extra', 'Kardamom', 'Cardamom', 'Exotický, kořeněný a květinový.', 'Exotic, spicy and floral.', '🫛', '#80cbc4', null, array['exotická', 'kořeněná', 'květinová']::text[], array['exotic', 'spicy', 'floral']::text[], array['Trávení', 'Svěží dech', 'Antioxidanty']::text[], array['Digestion', 'Breath', 'Antioxidants']::text[], array['Black Tea', 'Oolong', 'Vanilla']::text[], null, null, 240)
on conflict (id) do nothing;

insert into public.blends (id, name, desc_cs, desc_en, ingredients, emoji, is_preset, sort)
values
    ('morning_window', 'Morning Window', 'Zelený čaj s mátou a citronem. Čistý a svěží — pohár, který rozjede den správným způsobem.', 'Green tea with mint and lemon. Clean and bright — the kind of cup that gets the day started right.', array['Green Tea', 'Mint', 'Lemon']::text[], '☀️', true, 10),
    ('still_evening', 'Still Evening', 'Bílý čaj s jahodou a medem. Jemně sladký a klidný — měkký závěr dne.', 'White tea with strawberry and honey. Gently sweet and unhurried — a soft end to the day.', array['White Tea', 'Strawberry', 'Honey']::text[], '🍓', true, 20),
    ('deep_winter', 'Deep Winter', 'Černý čaj se zázvorem a vanilkou. Plný a hřejivý — nejlepší s oběma rukama kolem hrnku.', 'Black tea with ginger and vanilla. Full and warming — best with both hands around the mug.', array['Black Tea', 'Ginger', 'Vanilla']::text[], '❄️', true, 30),
    ('late_light', 'Late Light', 'Oolong s růží a levandulí. Měkký a trochu květinový — na ten tichý kus odpoledne.', 'Oolong with rose and lavender. Soft and a little floral — for the quiet part of the afternoon.', array['Oolong Tea', 'Rose', 'Lavender']::text[], '🌅', false, 40),
    ('open_air', 'Open Air', 'Rooibos s pomerančem a mátou. Přirozeně sladký a bez kofeinu — dobrý kdykoli.', 'Rooibos with orange and spearmint. Naturally sweet and caffeine-free — good any time.', array['Rooibos', 'Orange', 'Spearmint']::text[], '🌿', false, 50),
    ('slow_tuesday', 'Slow Tuesday', 'Heřmánek s kurkumou a skořicí. Zemitý a teplý — čajový ekvivalent nicnedělání.', 'Chamomile with turmeric and cinnamon. Earthy and warm — the tea equivalent of doing nothing.', array['Chamomile', 'Turmeric', 'Cinnamon']::text[], '🌙', true, 60)
on conflict (id) do nothing;

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
     'Chladivý balzám na rty s mátou peprnou.',
     'A cooling lip balm with spearmint.',
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

-- Etiketa: jak se suroviny píšou ve složení, jakého jsou druhu a kolik
-- jich smí ve směsi být (vyhláška 187/2023 Sb., příloha 1). Doplní se jen
-- tam, kde ještě nic není, takže úpravy z administrace zůstanou.
update public.ingredients i
   set kind     = coalesce(i.kind, v.kind),
       label_cs = coalesce(i.label_cs, v.label_cs),
       max_pct  = coalesce(i.max_pct, v.max_pct)
  from (values
    ('green_tea',  'tea',   'zelený čaj',          null::smallint),
    ('black_tea',  'tea',   'černý čaj',           null),
    ('white_tea',  'tea',   'bílý čaj',            null),
    ('oolong',     'tea',   'čaj oolong',          null),
    ('rooibos',    'herb',  'rooibos',             null),
    ('chamomile',  'herb',  'heřmánek (květ)',     null),
    ('strawberry', 'fruit', 'sušené jahody',       null),
    ('mint',       'herb',  'máta (list)',         null),
    ('vanilla',    'herb',  'vanilka',             null),
    ('rose',       'herb',  'růže (okvětní lístky)', null),
    ('orange',     'fruit', 'pomerančová kůra',    30),
    ('blueberry',  'fruit', 'sušené borůvky',      null),
    ('raspberry',  'fruit', 'sušené maliny',       null),
    ('cocoa',      'herb',  'kakaové slupky',      null),
    ('coconut',    'fruit', 'sušený kokos',        null),
    ('honey',      'other', 'med',                 null),
    ('lemon',      'fruit', 'citronová kůra',      30),
    ('ginger',     'herb',  'zázvor',              null),
    ('lavender',   'herb',  'levandule (květ)',    5),
    ('turmeric',   'herb',  'kurkuma',             5),
    ('cinnamon',   'herb',  'skořice',             null),
    ('spearmint',  'herb',  'máta klasnatá (list)', null),
    ('rose_hip',   'fruit', 'šípek',               null),
    ('cardamom',   'herb',  'kardamom',            5)
  ) as v(id, kind, label_cs, max_pct)
 where i.id = v.id;

-- Popis borůvky dřív sliboval antioxidanty. To je zdravotní tvrzení, které
-- u potraviny bez schválení EU nesmí být. Přepíše se jen původní text.
update public.ingredients
   set desc_cs = 'Sladká a nakyslá, chutná jako léto.'
 where id = 'blueberry' and desc_cs = 'Sladká a nakyslá, plná antioxidantů.';
update public.ingredients
   set desc_en = 'Sweet and tart, tastes like summer.'
 where id = 'blueberry' and desc_en = 'Sweet and tart, antioxidant-rich.';

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
        ('purchase_offers', 'id', 100), ('purchase_tasks', 'id', 50)
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
        'purchase_offers', 'purchase_tasks', 'orders', 'withdrawals', 'privacy_requests'], p_table), 99);
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
           ('withdrawals', 'id'), ('privacy_requests', 'id');
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
