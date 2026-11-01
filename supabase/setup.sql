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
drop policy if exists "settings_admin" on public.settings;
create policy "settings_admin" on public.settings for all to authenticated
    using (public.is_admin()) with check (public.is_admin());

-- Slevy a objednávky: jen admin. Žádná politika pro anon = anon nevidí nic.
drop policy if exists "promo_codes_admin" on public.promo_codes;
create policy "promo_codes_admin" on public.promo_codes for all to authenticated
    using (public.is_admin()) with check (public.is_admin());

drop policy if exists "orders_admin" on public.orders;
create policy "orders_admin" on public.orders for all to authenticated
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
                public.shipping_methods, public.settings
    to authenticated;
grant select, insert, update, delete on public.promo_codes to authenticated;
grant select, update, delete on public.orders to authenticated;
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
    v_rate       numeric;
    v_threshold  integer;
    v_ship       public.shipping_methods%rowtype;
    v_id         bigint;
    v_num        text;
begin
    -- Zákazník: stejná pravidla jako formulář na webu.
    if length(v_first) not between 2 and 100
       or length(v_last) not between 2 and 100
       or length(v_email) > 200 or v_email !~ '^[^\s@]+@[^\s@]+\.[^\s@]+$'
       or v_phone !~ '^\+?[0-9][0-9 ]{7,14}$'
       or length(v_street) not between 3 and 200
       or length(v_city) not between 2 and 100
       or v_zip !~ '^[0-9]{3} ?[0-9]{2}$'
       or v_country not in ('CZ', 'SK') then
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
    if v_pay not in ('cod', 'card', 'transfer') then
        raise exception 'invalid_payment' using errcode = 'P0001';
    end if;

    -- Doprava zdarma se počítá z ceny zboží před slevou, stejně jako na webu.
    select free_ship_threshold into v_threshold from public.settings where id = 1;
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
        items, goods_czk, discount_czk, shipping_czk, total_czk, promo_code, lang)
    values (
        v_first, v_last, v_email, v_phone, v_street, v_city, v_zip, v_country, v_note,
        v_ship_id, v_ship.name, nullif(v_point, ''), nullif(v_point_id, ''), v_pay,
        v_lines, v_goods, v_discount, v_shipping, v_goods - v_discount + v_shipping, v_promo, v_lang)
    returning id into v_id;

    v_num := 'TY-' || lpad(v_id::text, 5, '0');
    update public.orders set num = v_num where id = v_id;

    return jsonb_build_object(
        'num',      v_num,
        'id',       v_id,
        'goods',    v_goods,
        'discount', v_discount,
        'shipping', v_shipping,
        'total',    v_goods - v_discount + v_shipping);
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
    ('blueberry', 'Blueberry', 'flavor', 'Borůvka', 'Blueberry', 'Sladká a nakyslá, plná antioxidantů.', 'Sweet and tart, antioxidant-rich.', '🫐', '#9b59b6', null, array['sladká', 'ovocná', 'nakyslá']::text[], array['sweet', 'fruity', 'tart']::text[], array['Antioxidanty', 'Zdraví mozku', 'Proti stárnutí']::text[], array['Antioxidants', 'Brain health', 'Anti-aging']::text[], array['Green Tea', 'Lemon', 'Mint']::text[], null, null, 120),
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
