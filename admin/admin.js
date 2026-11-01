/* Tease you — administrace.
 *
 * Mluví přímo se Supabase přes ../db.js. Co smí kdo měnit, hlídá databáze
 * (Row Level Security v supabase/setup.sql), ne tenhle soubor — i kdyby
 * tu byla chyba, nepřihlášený nebo cizí účet nic nezmění.
 */
(function () {
    'use strict';

    const db = window.TeaDB;
    const $  = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
    const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g,
        c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const kc = n => Math.round(Number(n) || 0).toLocaleString('cs-CZ') + ' Kč';
    const pct = r => Math.round(Number(r) * 100) + ' %';

    const CATEGORY = { base: 'Základ', flavor: 'Příchuť', extra: 'Doplněk' };
    const CATEGORY_GROUP = { base: 'Základy', flavor: 'Příchutě', extra: 'Doplňky' };
    const STATUS = { new: 'Nová', paid: 'Zaplacená', shipped: 'Odeslaná', done: 'Vyřízená', cancelled: 'Zrušená' };
    const PAYMENT = { cod: 'Dobírka', card: 'Kartou online', transfer: 'Převodem na účet' };
    const ORDER_FILTERS = [
        ['open', 'K vyřízení'], ['new', 'Nové'], ['paid', 'Zaplacené'], ['shipped', 'Odeslané'],
        ['done', 'Vyřízené'], ['cancelled', 'Zrušené'], ['all', 'Všechny'],
    ];
    const PHOTO_BUCKET = 'photos';

    const state = {
        tab: 'orders',
        ingredients: [], blends: [], prices: [], shipping: [], settings: null,
        promos: [], orders: [], craft: [], waitlist: [],
        orderFilter: 'open',
        catalogLoaded: false,
    };

    /* ─── Hlášky ───────────────────────────────────────────────────── */
    function friendly(err) {
        if (!err) return 'Něco se pokazilo.';
        const m = String(err.message || '');
        if (m === 'network') return 'Nepodařilo se spojit se serverem. Zkontroluj připojení a zkus to znovu.';
        if (m === 'timeout') return 'Server neodpověděl včas. Zkus to znovu.';
        if (m === 'no_rows') return 'Změna se neuložila. Položka možná mezitím zmizela, nebo na ni tvůj účet nemá práva.';
        if (/invalid login credentials/i.test(m)) return 'Špatný e-mail nebo heslo.';
        if (/email not confirmed/i.test(m)) return 'E-mail tohohle účtu ještě není potvrzený.';
        if (err.status === 422 && /password/i.test(m)) return 'Heslo je moc slabé. Použij aspoň 8 znaků.';
        if (/rate limit|too many/i.test(m)) return 'Moc pokusů za sebou. Počkej chvíli a zkus to znovu.';
        if (/jwt|token/i.test(m) && err.status === 401) return 'Přihlášení vypršelo. Přihlas se prosím znovu.';
        if (err.code === '42501' || err.status === 403 || /row-level security/i.test(m)) {
            return 'Na tohle tvůj účet nemá oprávnění. Je v tabulce admins?';
        }
        if (err.code === '42P01' || err.code === 'PGRST205' || /could not find the table/i.test(m)) {
            return 'V databázi chybí tabulka. Spusť znovu celý supabase/setup.sql v SQL Editoru (nic se tím nepřepíše).';
        }
        if (err.code === '23505') return 'Tohle už existuje. Zvol jiný název nebo kód.';
        if (err.code === '23514') return 'Databáze hodnotu nepřijala. Zkontroluj formát (barva, délka textu, rozsah čísla).';
        if (err.code === '23503') return 'Na tuhle položku něco odkazuje, takže ji nejde smazat.';
        if (/mime|maximum allowed size|too large/i.test(m)) return 'Fotku se nepodařilo nahrát. Povolené jsou JPG, PNG a WebP do 5 MB.';
        return m || 'Něco se pokazilo.';
    }

    let toastTimer = null;
    function toast(msg, isError) {
        const el = $('#toast');
        el.textContent = msg;
        el.classList.toggle('error', !!isError);
        el.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => el.classList.remove('show'), isError ? 6000 : 2400);
    }
    const fail = err => { console.error('[admin]', err); toast(friendly(err), true); };

    function confirmDialog(text, okLabel) {
        const dlg = $('#confirm-dialog');
        if (!dlg || typeof dlg.showModal !== 'function') return Promise.resolve(window.confirm(text));
        $('#confirm-text').textContent = text;
        $('#confirm-ok').textContent = okLabel || 'Smazat';
        dlg.returnValue = '';
        return new Promise(resolve => {
            dlg.addEventListener('close', () => resolve(dlg.returnValue === 'ok'), { once: true });
            dlg.showModal();
        });
    }

    /* ─── Pomocníci pro data ───────────────────────────────────────── */
    async function updateOne(table, filters, patch) {
        const rows = await db.update(table, filters, patch);
        if (!Array.isArray(rows) || !rows.length) throw new db.DbError('no_rows', 0);
        return rows[0];
    }
    const ingByCode = code => state.ingredients.find(i => i.code === code);
    const ingName = code => (ingByCode(code) || {}).name_cs || code;
    const ingColor = code => (ingByCode(code) || {}).color || '#dddddd';
    const splitList = s => String(s || '').split(',').map(x => x.trim()).filter(Boolean).slice(0, 12);
    const slugify = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
        .toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 36);
    function uniqueId(base, taken) {
        let id = base.length >= 2 ? base : ('x_' + base).slice(0, 36);
        let n = 2;
        while (taken.includes(id)) id = `${base}_${n++}`;
        return id;
    }
    function codeFromName(name) {
        return String(name || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
            .replace(/[^A-Za-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 40).trim();
    }
    function formatDate(iso, withTime = true) {
        const d = new Date(iso);
        if (isNaN(d)) return '';
        return d.toLocaleString('cs-CZ', withTime
            ? { day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }
            : { day: 'numeric', month: 'numeric', year: 'numeric' });
    }
    function glassHtml(codes) {
        const layers = (codes || []).slice(0, 3);
        return `<span class="glass" aria-hidden="true">${layers.map(c =>
            `<span style="background:${esc(ingColor(c))}"></span>`).join('')}</span>`;
    }
    function swatchHtml(ing) {
        const photo = safePhoto(ing.photo_url);
        if (photo) return `<span class="swatch" style="background-image:url('${esc(photo)}')" aria-hidden="true"></span>`;
        return `<span class="swatch" style="background:${esc(ing.color)}" aria-hidden="true">${esc(ing.emoji)}</span>`;
    }
    function safePhoto(url) {
        return typeof url === 'string' && /^https:\/\/[^\s"'()<>\\]+$/.test(url) ? url : '';
    }

    /* ─── Obrazovky ────────────────────────────────────────────────── */
    let currentScreen = '';
    function show(name) {
        currentScreen = name;
        $$('.screen').forEach(el => { el.hidden = el.id !== 'screen-' + name; });
        const focus = { login: '#login-form [name=email]', password: '#password-form [name=password]' }[name];
        if (focus) setTimeout(() => $(focus) && $(focus).focus(), 30);
    }
    function formError(id, msg) {
        const el = $(id);
        el.textContent = msg || '';
        el.hidden = !msg;
    }

    async function boot() {
        if (!db || !db.configured) { show('setup'); return; }
        const fromLink = db.auth.consumeUrlHash();
        if (fromLink && fromLink.error) {
            show('login');
            formError('#login-error', 'Odkaz z e-mailu už neplatí. Požádej o nový přes „Zapomenuté heslo“.');
            return;
        }
        if (!fromLink) db.auth.restore();
        if (fromLink && ['recovery', 'invite', 'signup', 'magiclink'].includes(fromLink.type)) {
            show('password');
            return;
        }
        if (!db.auth.session()) { show('login'); return; }
        await enterApp();
    }

    async function enterApp() {
        let ok, user;
        try {
            [ok, user] = await Promise.all([db.rpc('is_admin'), db.auth.user()]);
        } catch (err) {
            show('login');
            if (db.auth.session()) formError('#login-error', friendly(err));
            return;
        }
        if (ok !== true) {
            $('#denied-email').textContent = (user && user.email) || '';
            show('denied');
            return;
        }
        $('#user-email').textContent = (user && user.email) || '';
        show('app');
        const fromHash = (location.hash || '').replace('#', '');
        switchTab(['orders', 'ingredients', 'blends', 'pricing', 'promos', 'craft'].includes(fromHash) ? fromHash : 'orders');
    }

    db && db.auth.onChange(session => {
        if (!session && currentScreen === 'app') {
            closeSheet(true);
            show('login');
            formError('#login-error', 'Přihlášení vypršelo. Přihlas se prosím znovu.');
        }
    });

    /* ─── Přihlášení ───────────────────────────────────────────────── */
    $('#login-form').addEventListener('submit', async e => {
        e.preventDefault();
        const form = e.currentTarget;
        const email = form.email.value.trim();
        const password = form.password.value;
        if (!email || !password) { formError('#login-error', 'Vyplň e-mail i heslo.'); return; }
        const btn = form.querySelector('[type=submit]');
        btn.disabled = true;
        formError('#login-error', '');
        try {
            await db.auth.signIn(email, password);
            form.password.value = '';
            await enterApp();
        } catch (err) {
            formError('#login-error', friendly(err));
        } finally {
            btn.disabled = false;
        }
    });

    $('#forgot-btn').addEventListener('click', async () => {
        const email = $('#login-form').email.value.trim();
        if (!email) { formError('#login-error', 'Napiš nahoru svůj e-mail a klikni znovu.'); return; }
        try {
            await db.auth.recover(email, location.origin + location.pathname);
            formError('#login-error', '');
            toast('Jestli účet existuje, přišel ti e-mail s odkazem na nové heslo.');
        } catch (err) {
            formError('#login-error', friendly(err));
        }
    });

    $('#password-form').addEventListener('submit', async e => {
        e.preventDefault();
        const form = e.currentTarget;
        const password = form.password.value;
        if (password.length < 8) { formError('#password-error', 'Heslo musí mít aspoň 8 znaků.'); return; }
        const btn = form.querySelector('[type=submit]');
        btn.disabled = true;
        try {
            await db.auth.updatePassword(password);
            form.password.value = '';
            toast('Heslo je uložené.');
            await enterApp();
        } catch (err) {
            formError('#password-error', friendly(err));
        } finally {
            btn.disabled = false;
        }
    });

    document.addEventListener('click', async e => {
        const el = e.target.closest('[data-action]');
        if (!el) return;
        const action = el.getAttribute('data-action');
        if (action === 'logout') {
            await db.auth.signOut();
            state.catalogLoaded = false;
            show('login');
        } else if (action === 'reload') {
            loadTab(state.tab, true);
        } else if (action === 'close-sheet') {
            closeSheet();
        } else if (action === 'new-ingredient') {
            openIngredient(null);
        } else if (action === 'new-blend') {
            openBlend(null);
        } else if (action === 'new-promo') {
            openPromo(null);
        } else if (action === 'new-craft') {
            openCraft(null);
        }
    });

    /* ─── Záložky ──────────────────────────────────────────────────── */
    $$('.tab').forEach(tab => tab.addEventListener('click', () => switchTab(tab.dataset.tab)));

    function switchTab(name) {
        state.tab = name;
        $$('.tab').forEach(t => t.setAttribute('aria-selected', String(t.dataset.tab === name)));
        $$('.view').forEach(v => { v.hidden = v.id !== 'view-' + name; });
        history.replaceState(null, '', '#' + name);
        loadTab(name, name === 'orders');
    }

    async function loadCatalog(force) {
        if (state.catalogLoaded && !force) return;
        const [ingredients, blends, prices, shipping, settings] = await Promise.all([
            db.select('ingredients', { order: 'sort.asc,name_cs.asc' }),
            db.select('blends', { order: 'sort.asc,name.asc' }),
            db.select('price_tiers', { order: 'weight_g.asc' }),
            db.select('shipping_methods', { order: 'sort.asc' }),
            db.select('settings', { id: 'eq.1' }),
        ]);
        Object.assign(state, { ingredients, blends, prices, shipping, settings: settings[0] || null, catalogLoaded: true });
    }

    async function loadTab(name, force) {
        const target = $('#view-' + name + ' .list, #view-' + name + ' [id$="-list"]');
        if (target && !target.children.length) target.innerHTML = '<p class="loading">Načítám…</p>';
        try {
            await loadCatalog(force);
            if (name === 'orders') {
                state.orders = await db.select('orders', { order: 'created_at.desc', limit: 300 });
                renderOrders();
            } else if (name === 'ingredients') {
                renderIngredients();
            } else if (name === 'blends') {
                renderBlends();
            } else if (name === 'pricing') {
                renderPricing();
            } else if (name === 'promos') {
                state.promos = await db.select('promo_codes', { order: 'created_at.desc' });
                renderPromos();
            } else if (name === 'craft') {
                const [craft, waitlist] = await Promise.all([
                    db.select('craft_products', { order: 'sort.asc,name_cs.asc' }),
                    db.select('craft_waitlist', { order: 'created_at.desc', limit: 2000 }),
                ]);
                Object.assign(state, { craft, waitlist });
                renderCraft();
            }
        } catch (err) {
            if (target) target.innerHTML = `<p class="empty">${esc(friendly(err))}</p>`;
            fail(err);
        }
    }

    /* ─── Boční panel ──────────────────────────────────────────────── */
    let sheetDirty = false;
    let sheetCleanup = null;
    function openSheet(title, html, mount) {
        $('#sheet-title').textContent = title;
        $('#sheet-body').innerHTML = html;
        $('#sheet').hidden = false;
        $('#sheet-backdrop').hidden = false;
        document.body.style.overflow = 'hidden';
        document.body.classList.add('sheet-open');
        sheetDirty = false;
        sheetCleanup = null;
        const body = $('#sheet-body');
        body.scrollTop = 0;
        body.addEventListener('input', () => { sheetDirty = true; }, { once: true });
        if (mount) sheetCleanup = mount(body) || null;
        // Do prvního pole skočit jen u formulářů (ne u detailu objednávky, kde
        // by fokus na poznámce odscrolloval panel dolů) a ne na mobilu, kde by
        // vyjela klávesnice přes půl obrazovky.
        const form = body.firstElementChild && body.firstElementChild.tagName === 'FORM' ? body.firstElementChild : null;
        const first = form && form.querySelector('input[type=text]:not([readonly]), input[type=number], textarea');
        if (first && window.matchMedia('(min-width: 641px)').matches) first.focus({ preventScroll: true });
    }
    async function closeSheet(force) {
        if ($('#sheet').hidden) return;
        if (!force && sheetDirty && !(await confirmDialog('Máš neuložené změny. Zavřít bez uložení?', 'Zahodit'))) return;
        if (sheetCleanup) { try { sheetCleanup(); } catch (_) {} }
        sheetCleanup = null;
        $('#sheet').hidden = true;
        $('#sheet-backdrop').hidden = true;
        document.body.style.overflow = '';
        document.body.classList.remove('sheet-open');
    }
    $('#sheet-backdrop').addEventListener('click', () => closeSheet());
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && !$('#sheet').hidden && !$('#confirm-dialog').open) closeSheet();
    });

    /* ─── Fotky ────────────────────────────────────────────────────── */
    function loadImage(file) {
        return new Promise((resolve, reject) => {
            const url = URL.createObjectURL(file);
            const img = new Image();
            img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
            img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Fotku se nepodařilo otevřít. Zkus JPG nebo PNG.')); };
            img.src = url;
        });
    }
    function canvasBlob(canvas, type, quality) {
        return new Promise(resolve => canvas.toBlob(resolve, type, quality));
    }
    // Zmenší fotku na max. 1600 px a uloží jako WebP (Safari bez WebP → JPEG).
    // Z 8 MB fotky z mobilu je tak ~200 kB a web se nenačítá věčnost.
    async function prepareImage(file) {
        const img = await loadImage(file);
        const scale = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        let blob = await canvasBlob(canvas, 'image/webp', 0.85);
        if (!blob || blob.type !== 'image/webp') blob = await canvasBlob(canvas, 'image/jpeg', 0.86);
        if (!blob) throw new Error('Fotku se nepodařilo zpracovat.');
        return blob;
    }
    function storagePath(url) {
        const prefix = db.publicUrl(PHOTO_BUCKET, '');
        return typeof url === 'string' && url.startsWith(prefix) ? decodeURIComponent(url.slice(prefix.length)) : null;
    }
    function removePhotos(urls) {
        const paths = urls.map(storagePath).filter(Boolean);
        if (paths.length) db.removeObjects(PHOTO_BUCKET, paths).catch(err => console.warn('[admin] staré fotky zůstaly v úložišti', err));
    }

    /* Ovládání fotky v panelu. Nahraje hned, ale do položky se zapíše až
       uložením. Co se nahrálo a neuložilo, se po zavření panelu smaže. */
    function photoControl(body, initialUrl, folder, idHint, emoji) {
        const ctl = { url: initialUrl || null, uploaded: [] };
        const preview = $('.photo-preview', body);
        const input = $('.photo-actions input[type=file]', body);
        const removeBtn = $('[data-photo=remove]', body);
        const paint = () => {
            const safe = safePhoto(ctl.url);
            preview.style.backgroundImage = safe ? `url("${safe}")` : '';
            preview.textContent = safe ? '' : (emoji || '📷');
            removeBtn.hidden = !safe;
        };
        paint();
        $('[data-photo=pick]', body).addEventListener('click', () => input.click());
        removeBtn.addEventListener('click', () => { ctl.url = null; sheetDirty = true; paint(); });
        input.addEventListener('change', async () => {
            const file = input.files && input.files[0];
            input.value = '';
            if (!file) return;
            const btn = $('[data-photo=pick]', body);
            btn.disabled = true;
            btn.textContent = 'Nahrávám…';
            try {
                const blob = await prepareImage(file);
                const ext = blob.type === 'image/webp' ? 'webp' : 'jpg';
                const path = `${folder}/${slugify(idHint() || 'foto') || 'foto'}-${Date.now().toString(36)}.${ext}`;
                const url = await db.upload(PHOTO_BUCKET, path, blob, blob.type);
                ctl.uploaded.push(url);
                ctl.url = url;
                sheetDirty = true;
                paint();
                toast('Fotka nahraná. Nezapomeň uložit.');
            } catch (err) {
                fail(err);
            } finally {
                btn.disabled = false;
                btn.textContent = 'Nahrát fotku';
            }
        });
        // Po uložení: smazat starou fotku a nepoužité nahrávky.
        ctl.commit = () => {
            const unused = ctl.uploaded.filter(u => u !== ctl.url);
            if (initialUrl && initialUrl !== ctl.url) unused.push(initialUrl);
            removePhotos(unused);
            ctl.uploaded = [];
            initialUrl = ctl.url;
        };
        ctl.discard = () => { removePhotos(ctl.uploaded.filter(u => u !== initialUrl)); ctl.uploaded = []; };
        return ctl;
    }
    const photoFieldHtml = `
        <div class="photo-field">
            <div class="photo-preview" aria-hidden="true"></div>
            <div class="photo-actions">
                <input type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif">
                <button type="button" class="btn btn-secondary btn-small" data-photo="pick">Nahrát fotku</button>
                <button type="button" class="btn-link" data-photo="remove">Odebrat fotku</button>
            </div>
        </div>`;

    /* ═══ OBJEDNÁVKY ═══════════════════════════════════════════════ */
    function renderOrders() {
        const counts = {};
        state.orders.forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1; });
        const newCount = counts.new || 0;
        const badge = $('#count-new');
        badge.textContent = newCount;
        badge.hidden = !newCount;

        $('#order-filters').innerHTML = ORDER_FILTERS.map(([key, label]) => {
            const n = key === 'all' ? state.orders.length
                : key === 'open' ? (counts.new || 0) + (counts.paid || 0) + (counts.shipped || 0)
                : counts[key] || 0;
            return `<button type="button" class="chip" data-filter="${key}" aria-pressed="${state.orderFilter === key}">${esc(label)} (${n})</button>`;
        }).join('');
        $$('#order-filters .chip').forEach(chip => chip.addEventListener('click', () => {
            state.orderFilter = chip.dataset.filter;
            renderOrders();
        }));

        const list = state.orders.filter(o => state.orderFilter === 'all' ? true
            : state.orderFilter === 'open' ? ['new', 'paid', 'shipped'].includes(o.status)
            : o.status === state.orderFilter);
        const el = $('#orders-list');
        if (!state.orders.length) {
            el.innerHTML = '<p class="empty">Zatím žádné objednávky. Jakmile někdo na webu objedná, objeví se tady.</p>';
            return;
        }
        if (!list.length) {
            el.innerHTML = '<p class="empty">V tomhle stavu teď nic není.</p>';
            return;
        }
        el.innerHTML = list.map(o => {
            const items = Array.isArray(o.items) ? o.items : [];
            const count = items.reduce((s, i) => s + (Number(i.qty) || 0), 0);
            return `<button type="button" class="row" data-order="${o.id}">
                ${glassHtml(items[0] && items[0].ingredients)}
                <span class="row-main">
                    <span class="row-title">${esc(o.first_name)} ${esc(o.last_name)}</span>
                    <span class="row-sub">${esc(o.num)}, ${esc(formatDate(o.created_at))}, ${count} ks</span>
                </span>
                <span class="row-side">
                    <span class="row-price">${kc(o.total_czk)}</span>
                    <span class="pill pill-${esc(o.status)}">${esc(STATUS[o.status] || o.status)}</span>
                </span>
            </button>`;
        }).join('');
        $$('#orders-list [data-order]').forEach(row => row.addEventListener('click', () => {
            openOrder(state.orders.find(o => String(o.id) === row.dataset.order));
        }));
    }

    function openOrder(o) {
        if (!o) return;
        const items = Array.isArray(o.items) ? o.items : [];
        const address = [`${o.first_name} ${o.last_name}`, o.street, `${o.zip} ${o.city}`, o.country].join('\n');
        const html = `
            <div class="order-meta">
                <span class="pill pill-${esc(o.status)}" id="order-status-pill">${esc(STATUS[o.status] || o.status)}</span>
                <span>${esc(formatDate(o.created_at))}</span>
            </div>

            <div class="sheet-section">
                <h3>Položky</h3>
                ${items.map(i => `
                    <div class="order-item">
                        ${glassHtml(i.ingredients)}
                        <div>
                            <div><strong>${esc(i.name)}</strong></div>
                            <div class="order-item-sub">${esc((i.ingredient_names || i.ingredients || []).join(', '))}</div>
                            <div class="order-item-sub">${esc(i.weight_g)} g × ${esc(i.qty)}</div>
                        </div>
                        <strong>${kc(i.line_czk)}</strong>
                    </div>`).join('')}
                <div class="totals">
                    <div><span>Zboží</span><span>${kc(o.goods_czk)}</span></div>
                    ${o.discount_czk ? `<div><span>Sleva ${esc(o.promo_code || '')}</span><span>−${kc(o.discount_czk)}</span></div>` : ''}
                    <div><span>Doprava</span><span>${o.shipping_czk ? kc(o.shipping_czk) : 'zdarma'}</span></div>
                    <div class="grand"><span>Celkem</span><span>${kc(o.total_czk)}</span></div>
                </div>
            </div>

            <div class="sheet-section">
                <h3>Stav</h3>
                <div class="status-buttons" id="status-buttons">
                    ${Object.entries(STATUS).map(([k, label]) =>
                        `<button type="button" class="chip" data-status="${k}" aria-pressed="${o.status === k}">${esc(label)}</button>`).join('')}
                </div>
            </div>

            <div class="sheet-section">
                <h3>Doručení</h3>
                <p class="address">${esc(address)}</p>
                <p style="margin:10px 0 0"><button type="button" class="btn btn-secondary btn-small" id="copy-address">Zkopírovat adresu</button></p>
            </div>

            <div class="sheet-section">
                <h3>Kontakt a platba</h3>
                <dl class="kv">
                    <dt>E-mail</dt><dd><a href="mailto:${esc(o.email)}">${esc(o.email)}</a></dd>
                    <dt>Telefon</dt><dd><a href="tel:${esc(String(o.phone).replace(/\s+/g, ''))}">${esc(o.phone)}</a></dd>
                    <dt>Doprava</dt><dd>${esc(o.shipping_name || o.shipping_method)}</dd>
                    ${o.packeta_point ? `<dt>Výdejní místo</dt><dd>${esc(o.packeta_point)}${o.packeta_point_id ? ` (ID ${esc(o.packeta_point_id)})` : ''}</dd>` : ''}
                    <dt>Platba</dt><dd>${esc(PAYMENT[o.payment_method] || o.payment_method)}</dd>
                    ${o.payment_method === 'transfer' ? `<dt>Variabilní symbol</dt><dd>${esc(o.id)}</dd>` : ''}
                    <dt>Jazyk webu</dt><dd>${o.lang === 'en' ? 'angličtina' : 'čeština'}</dd>
                </dl>
            </div>

            ${o.note ? `<div class="sheet-section"><h3>Poznámka od zákazníka</h3><p class="address">${esc(o.note)}</p></div>` : ''}

            <form class="sheet-section" id="order-note-form">
                <h3>Interní poznámka</h3>
                <label class="field">
                    <span>Vidíš ji jen ty</span>
                    <textarea name="admin_note" rows="3" maxlength="2000">${esc(o.admin_note || '')}</textarea>
                </label>
                <button type="submit" class="btn btn-secondary btn-small">Uložit poznámku</button>
            </form>`;

        openSheet(`Objednávka ${o.num}`, html, body => {
            $$('#status-buttons .chip', body).forEach(btn => btn.addEventListener('click', async () => {
                const status = btn.dataset.status;
                if (status === o.status) return;
                if (status === 'cancelled' && !(await confirmDialog(`Opravdu zrušit objednávku ${o.num}?`, 'Zrušit objednávku'))) return;
                $$('#status-buttons .chip', body).forEach(b => { b.disabled = true; });
                try {
                    const row = await updateOne('orders', { id: 'eq.' + o.id }, { status });
                    Object.assign(o, row);
                    $$('#status-buttons .chip', body).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.status === o.status)));
                    const pill = $('#order-status-pill', body);
                    pill.className = 'pill pill-' + o.status;
                    pill.textContent = STATUS[o.status];
                    renderOrders();
                    toast(`Objednávka ${o.num}: ${STATUS[o.status].toLowerCase()}`);
                } catch (err) { fail(err); }
                finally { $$('#status-buttons .chip', body).forEach(b => { b.disabled = false; }); }
            }));
            $('#copy-address', body).addEventListener('click', async () => {
                try { await navigator.clipboard.writeText(address); toast('Adresa zkopírovaná.'); }
                catch (_) { toast('Kopírování prohlížeč nepovolil. Označ adresu a zkopíruj ručně.', true); }
            });
            $('#order-note-form', body).addEventListener('submit', async e => {
                e.preventDefault();
                const note = e.currentTarget.admin_note.value.trim();
                try {
                    const row = await updateOne('orders', { id: 'eq.' + o.id }, { admin_note: note || null });
                    Object.assign(o, row);
                    sheetDirty = false;
                    toast('Poznámka uložená.');
                } catch (err) { fail(err); }
            });
        });
    }

    /* ═══ INGREDIENCE ══════════════════════════════════════════════ */
    function renderIngredients() {
        const el = $('#ingredients-list');
        if (!state.ingredients.length) {
            el.innerHTML = '<p class="empty">Zatím tu nejsou žádné ingredience. Spustil jsi supabase/setup.sql?</p>';
            return;
        }
        el.innerHTML = ['base', 'flavor', 'extra'].map(cat => {
            const items = state.ingredients.filter(i => i.category === cat);
            return `<h3 class="group-title">${CATEGORY_GROUP[cat]} (${items.length})</h3>
                <div class="list">${items.map(i => `
                    <div class="row compact${i.active ? '' : ' is-muted'}" role="button" tabindex="0" data-ing="${esc(i.id)}">
                        ${swatchHtml(i)}
                        <span class="row-main">
                            <span class="row-title">${esc(i.name_cs)}</span>
                            <span class="row-sub">${!i.active ? 'Skrytá, na webu není vidět' : esc(i.desc_cs || i.name_en)}</span>
                        </span>
                        <span class="row-side">
                            ${i.in_stock ? '' : '<span class="pill pill-out">Vyprodáno</span>'}
                            <label class="stock-toggle" title="Skladem">
                                <span class="stock-label">Skladem</span>
                                <input type="checkbox" class="switch" data-stock="${esc(i.id)}" ${i.in_stock ? 'checked' : ''} aria-label="${esc(i.name_cs)} skladem">
                            </label>
                        </span>
                    </div>`).join('') || '<p class="empty">V téhle skupině nic není.</p>'}
                </div>`;
        }).join('');

        $$('#ingredients-list [data-ing]').forEach(row => {
            const open = () => openIngredient(state.ingredients.find(i => i.id === row.dataset.ing));
            row.addEventListener('click', e => { if (!e.target.closest('.stock-toggle')) open(); });
            row.addEventListener('keydown', e => {
                if ((e.key === 'Enter' || e.key === ' ') && e.target === row) { e.preventDefault(); open(); }
            });
        });
        $$('#ingredients-list [data-stock]').forEach(sw => sw.addEventListener('change', async () => {
            const ing = state.ingredients.find(i => i.id === sw.dataset.stock);
            const inStock = sw.checked;
            sw.disabled = true;
            try {
                const row = await updateOne('ingredients', { id: 'eq.' + ing.id }, { in_stock: inStock });
                Object.assign(ing, row);
                toast(inStock ? `${ing.name_cs}: zpátky skladem` : `${ing.name_cs}: vyprodáno`);
                renderIngredients();
            } catch (err) {
                sw.checked = !inStock;
                sw.disabled = false;
                fail(err);
            }
        }));
    }

    function openIngredient(ing) {
        const isNew = !ing;
        const i = ing || {
            category: 'flavor', name_cs: '', name_en: '', desc_cs: '', desc_en: '', emoji: '🍵', color: '#87ab68',
            caffeine: null, flavor_cs: [], flavor_en: [], health_cs: [], health_en: [], pairs: [],
            brew_temp: '', brew_time: '', photo_url: null, in_stock: true, active: true,
            sort: (Math.max(0, ...state.ingredients.map(x => x.sort || 0)) + 10),
        };
        const others = state.ingredients.filter(x => x.code !== i.code);
        const usedIn = isNew ? [] : state.blends.filter(b => b.ingredients.includes(i.code));
        const html = `
            <form id="ing-form" novalidate>
                <p class="form-error" id="ing-error" role="alert" hidden></p>
                ${photoFieldHtml}
                <div class="field-row">
                    <label class="field"><span>Název česky</span><input type="text" name="name_cs" maxlength="60" required value="${esc(i.name_cs)}"></label>
                    <label class="field"><span>Název anglicky</span><input type="text" name="name_en" maxlength="60" required value="${esc(i.name_en)}"></label>
                </div>
                ${isNew
                    ? '<p class="help" id="code-help">Z anglického názvu vznikne vnitřní název pro sdílené odkazy. Později už nejde změnit.</p>'
                    : `<p class="help">Vnitřní název pro odkazy a košíky: <strong>${esc(i.code)}</strong></p>`}
                <label class="field"><span>Skupina v mixéru</span>
                    <select name="category">${Object.entries(CATEGORY).map(([k, v]) =>
                        `<option value="${k}"${i.category === k ? ' selected' : ''}>${v}</option>`).join('')}</select>
                </label>
                <label class="field"><span>Popis česky</span><textarea name="desc_cs" rows="2" maxlength="500">${esc(i.desc_cs)}</textarea></label>
                <label class="field"><span>Popis anglicky</span><textarea name="desc_en" rows="2" maxlength="500">${esc(i.desc_en)}</textarea></label>
                <div class="field-row">
                    <label class="field"><span>Barva ve skleničce</span><input type="color" name="color" value="${esc(i.color)}"></label>
                    <label class="field"><span>Emoji (když není fotka)</span><input type="text" name="emoji" maxlength="8" value="${esc(i.emoji)}"></label>
                </div>
                <div class="base-only">
                    <div class="field-row">
                        <label class="field"><span>Kofein</span>
                            <select name="caffeine">
                                <option value="">neuvádět</option>
                                ${['bez kofeinu', 'velmi nízký', 'nízký', 'střední', 'vysoký', 'velmi vysoký'].map((label, n) =>
                                    `<option value="${n}"${i.caffeine === n ? ' selected' : ''}>${label}</option>`).join('')}
                            </select>
                        </label>
                        <span></span>
                    </div>
                    <div class="field-row">
                        <label class="field"><span>Teplota vody</span><input type="text" name="brew_temp" maxlength="20" placeholder="85–90°C" value="${esc(i.brew_temp || '')}"></label>
                        <label class="field"><span>Doba louhování</span><input type="text" name="brew_time" maxlength="20" placeholder="3–4 min" value="${esc(i.brew_time || '')}"></label>
                    </div>
                </div>
                <label class="field"><span>Chuť česky</span><input type="text" name="flavor_cs" value="${esc((i.flavor_cs || []).join(', '))}"><small>Oddělené čárkou, např. sladká, květinová</small></label>
                <label class="field"><span>Chuť anglicky</span><input type="text" name="flavor_en" value="${esc((i.flavor_en || []).join(', '))}"></label>
                <label class="field"><span>Přínosy česky</span><input type="text" name="health_cs" value="${esc((i.health_cs || []).join(', '))}">
                    <small>Pozor: u potravin smí web uvádět jen zdravotní tvrzení schválená EU (nařízení 1924/2006). Bezpečnější je popisovat chuť a původ.</small></label>
                <label class="field"><span>Přínosy anglicky</span><input type="text" name="health_en" value="${esc((i.health_en || []).join(', '))}"></label>
                <div class="field"><span>Hodí se s</span>
                    <div class="status-buttons" id="pairs">${others.map(x =>
                        `<button type="button" class="chip" data-pair="${esc(x.code)}" aria-pressed="${(i.pairs || []).includes(x.code)}">${esc(x.name_cs)}</button>`).join('')}</div>
                </div>
                <label class="switch-row"><input type="checkbox" class="switch" name="in_stock" ${i.in_stock ? 'checked' : ''}><span>Skladem</span></label>
                <label class="switch-row"><input type="checkbox" class="switch" name="active" ${i.active ? 'checked' : ''}><span>Zobrazovat na webu</span></label>
                <label class="field field-inline"><span>Pořadí</span><input type="number" name="sort" step="1" value="${esc(i.sort)}"></label>
                ${usedIn.length ? `<p class="help">Je ve směsích: ${esc(usedIn.map(b => b.name).join(', '))}</p>` : ''}
                <div class="sheet-actions">
                    <button type="submit" class="btn btn-primary">${isNew ? 'Přidat ingredienci' : 'Uložit změny'}</button>
                    <button type="button" class="btn btn-secondary" data-action="close-sheet">Zrušit</button>
                    <span class="spacer"></span>
                    ${isNew ? '' : '<button type="button" class="btn-link" id="ing-delete">Smazat</button>'}
                </div>
            </form>`;

        openSheet(isNew ? 'Nová ingredience' : i.name_cs, html, body => {
            const form = $('#ing-form', body);
            const photo = photoControl(body, i.photo_url, 'ingredients', () => form.name_en.value || i.code, i.emoji);
            const syncBase = () => { $('.base-only', body).hidden = form.category.value !== 'base'; };
            syncBase();
            form.category.addEventListener('change', syncBase);
            $$('#pairs .chip', body).forEach(chip => chip.addEventListener('click', () => {
                chip.setAttribute('aria-pressed', String(chip.getAttribute('aria-pressed') !== 'true'));
                sheetDirty = true;
            }));
            if (isNew) {
                const help = $('#code-help', body);
                form.name_en.addEventListener('input', () => {
                    const code = codeFromName(form.name_en.value);
                    help.innerHTML = code
                        ? `Vnitřní název pro odkazy: <strong>${esc(code)}</strong>. Později už nejde změnit.`
                        : 'Z anglického názvu vznikne vnitřní název pro sdílené odkazy. Později už nejde změnit.';
                });
            }

            form.addEventListener('submit', async e => {
                e.preventDefault();
                formError('#ing-error', '');
                const v = n => form[n].value.trim();
                const category = form.category.value;
                const row = {
                    name_cs: v('name_cs'), name_en: v('name_en'),
                    desc_cs: v('desc_cs'), desc_en: v('desc_en'),
                    category,
                    color: form.color.value.toLowerCase(),
                    emoji: v('emoji') || '🍵',
                    caffeine: category === 'base' && form.caffeine.value !== '' ? Number(form.caffeine.value) : null,
                    brew_temp: category === 'base' ? (v('brew_temp') || null) : null,
                    brew_time: category === 'base' ? (v('brew_time') || null) : null,
                    flavor_cs: splitList(v('flavor_cs')), flavor_en: splitList(v('flavor_en')),
                    health_cs: splitList(v('health_cs')), health_en: splitList(v('health_en')),
                    pairs: $$('#pairs .chip[aria-pressed="true"]', body).map(c => c.dataset.pair),
                    photo_url: photo.url,
                    in_stock: form.in_stock.checked,
                    active: form.active.checked,
                    sort: parseInt(v('sort'), 10) || 0,
                };
                if (!row.name_cs || !row.name_en) { formError('#ing-error', 'Vyplň český i anglický název.'); return; }
                if (isNew) {
                    const code = codeFromName(row.name_en);
                    if (!/^[A-Za-z0-9]/.test(code)) { formError('#ing-error', 'Anglický název musí obsahovat aspoň jedno písmeno nebo číslici.'); return; }
                    if (state.ingredients.some(x => x.code.toLowerCase() === code.toLowerCase())) {
                        formError('#ing-error', `Ingredience s anglickým názvem „${code}“ už existuje.`); return;
                    }
                    row.code = code;
                    row.id = uniqueId(slugify(code), state.ingredients.map(x => x.id));
                }
                if (!isNew && i.category !== category && usedIn.length) {
                    const ok = await confirmDialog(`Ingredience je ve směsích (${usedIn.map(b => b.name).join(', ')}). Po změně skupiny bude ve skleničce na jiném místě. Pokračovat?`, 'Změnit skupinu');
                    if (!ok) return;
                }
                const btn = form.querySelector('[type=submit]');
                btn.disabled = true;
                try {
                    if (isNew) {
                        const [saved] = await db.insert('ingredients', row);
                        state.ingredients.push(saved);
                    } else {
                        const saved = await updateOne('ingredients', { id: 'eq.' + i.id }, row);
                        Object.assign(ing, saved);
                    }
                    state.ingredients.sort((a, b) => (a.sort - b.sort) || a.name_cs.localeCompare(b.name_cs, 'cs'));
                    photo.commit();
                    toast(isNew ? `Přidáno: ${row.name_cs}` : `Uloženo: ${row.name_cs}`);
                    closeSheet(true);
                    renderIngredients();
                } catch (err) {
                    formError('#ing-error', friendly(err));
                } finally {
                    btn.disabled = false;
                }
            });

            const del = $('#ing-delete', body);
            if (del) del.addEventListener('click', async () => {
                if (usedIn.length) {
                    formError('#ing-error', `Nejdřív ji odeber ze směsí: ${usedIn.map(b => b.name).join(', ')}. Nebo ji jen skryj vypínačem „Zobrazovat na webu“.`);
                    return;
                }
                if (!(await confirmDialog(`Smazat ingredienci ${i.name_cs}? Starší sdílené odkazy s ní se načtou bez ní.`))) return;
                try {
                    const rows = await db.remove('ingredients', { id: 'eq.' + i.id });
                    if (!rows.length) throw new db.DbError('no_rows', 0);
                    state.ingredients = state.ingredients.filter(x => x.id !== i.id);
                    removePhotos([i.photo_url]);
                    toast(`Smazáno: ${i.name_cs}`);
                    closeSheet(true);
                    renderIngredients();
                } catch (err) { formError('#ing-error', friendly(err)); }
            });
            return () => photo.discard();
        });
    }

    /* ═══ SMĚSI ════════════════════════════════════════════════════ */
    function renderBlends() {
        const el = $('#blends-list');
        if (!state.blends.length) {
            el.innerHTML = '<p class="empty">Zatím žádné hotové směsi. Přidej první, ať má úvodní stránka co ukázat.</p>';
            return;
        }
        el.innerHTML = state.blends.map(b => {
            const photo = safePhoto(b.photo_url);
            const soldOut = b.ingredients.some(c => ingByCode(c) && !ingByCode(c).in_stock);
            const missing = b.ingredients.some(c => !ingByCode(c) || !ingByCode(c).active);
            return `<button type="button" class="row${b.active ? '' : ' is-muted'}" data-blend="${esc(b.id)}">
                ${photo ? `<img class="thumb" src="${esc(photo)}" alt="" loading="lazy">` : glassHtml(b.ingredients)}
                <span class="row-main">
                    <span class="row-title">${esc(b.name)}</span>
                    <span class="row-sub">${esc(b.ingredients.map(ingName).join(', '))}</span>
                </span>
                <span class="row-side">
                    ${b.is_preset ? '<span class="pill">Rychlá volba</span>' : ''}
                    ${!b.active ? '<span class="pill">Skrytá</span>' : ''}
                    ${soldOut ? '<span class="pill pill-out">Něco vyprodáno</span>' : ''}
                    ${missing ? '<span class="pill pill-out">Ingredience není na webu</span>' : ''}
                </span>
            </button>`;
        }).join('');
        $$('#blends-list [data-blend]').forEach(row => row.addEventListener('click', () => {
            openBlend(state.blends.find(b => b.id === row.dataset.blend));
        }));
    }

    function openBlend(blend) {
        const isNew = !blend;
        const b = blend || {
            name: '', desc_cs: '', desc_en: '', ingredients: [], emoji: '🍵', is_preset: false,
            photo_url: null, active: true, sort: Math.max(0, ...state.blends.map(x => x.sort || 0)) + 10,
        };
        const byCat = cat => state.ingredients.filter(i => i.category === cat);
        const pickFor = cat => b.ingredients.find(c => (ingByCode(c) || {}).category === cat) || '';
        const select = (name, cat, required) => `
            <label class="field"><span>${CATEGORY[cat]}</span>
                <select name="${name}">${required ? '' : '<option value="">— nic —</option>'}
                    ${byCat(cat).map(i => `<option value="${esc(i.code)}"${pickFor(cat) === i.code ? ' selected' : ''}>${esc(i.name_cs)}${i.in_stock ? '' : ' (vyprodáno)'}${i.active ? '' : ' (skrytá)'}</option>`).join('')}
                </select>
            </label>`;
        const html = `
            <form id="blend-form" novalidate>
                <p class="form-error" id="blend-error" role="alert" hidden></p>
                ${photoFieldHtml}
                <label class="field"><span>Název</span><input type="text" name="name" maxlength="60" required value="${esc(b.name)}"><small>Stejný v češtině i angličtině, jako ostatní směsi.</small></label>
                <div class="blend-preview"><span id="blend-glass"></span><span class="help" style="margin:0">Takhle bude vypadat sklenička na webu.</span></div>
                <div class="field-row">${select('base', 'base', true)}${select('flavor', 'flavor')}</div>
                ${select('extra', 'extra')}
                <label class="field"><span>Popis česky</span><textarea name="desc_cs" rows="3" maxlength="500">${esc(b.desc_cs)}</textarea></label>
                <label class="field"><span>Popis anglicky</span><textarea name="desc_en" rows="3" maxlength="500">${esc(b.desc_en)}</textarea></label>
                <label class="field field-inline"><span>Emoji</span><input type="text" name="emoji" maxlength="8" value="${esc(b.emoji)}"></label>
                <label class="switch-row"><input type="checkbox" class="switch" name="is_preset" ${b.is_preset ? 'checked' : ''}><span>Rychlá volba v mixéru</span></label>
                <label class="switch-row"><input type="checkbox" class="switch" name="active" ${b.active ? 'checked' : ''}><span>Zobrazovat na webu</span></label>
                <label class="field field-inline"><span>Pořadí</span><input type="number" name="sort" step="1" value="${esc(b.sort)}"></label>
                <div class="sheet-actions">
                    <button type="submit" class="btn btn-primary">${isNew ? 'Přidat směs' : 'Uložit změny'}</button>
                    <button type="button" class="btn btn-secondary" data-action="close-sheet">Zrušit</button>
                    <span class="spacer"></span>
                    ${isNew ? '' : '<button type="button" class="btn-link" id="blend-delete">Smazat</button>'}
                </div>
            </form>`;

        openSheet(isNew ? 'Nová směs' : b.name, html, body => {
            const form = $('#blend-form', body);
            const photo = photoControl(body, b.photo_url, 'blends', () => form.name.value || b.id, b.emoji);
            const chosen = () => [form.base.value, form.flavor.value, form.extra.value].filter(Boolean);
            const paintGlass = () => { $('#blend-glass', body).innerHTML = glassHtml(chosen()); };
            paintGlass();
            ['base', 'flavor', 'extra'].forEach(n => form[n].addEventListener('change', paintGlass));

            form.addEventListener('submit', async e => {
                e.preventDefault();
                formError('#blend-error', '');
                const row = {
                    name: form.name.value.trim(),
                    desc_cs: form.desc_cs.value.trim(),
                    desc_en: form.desc_en.value.trim(),
                    ingredients: chosen(),
                    emoji: form.emoji.value.trim() || '🍵',
                    is_preset: form.is_preset.checked,
                    active: form.active.checked,
                    photo_url: photo.url,
                    sort: parseInt(form.sort.value, 10) || 0,
                };
                if (!row.name) { formError('#blend-error', 'Vyplň název směsi.'); return; }
                if (!row.ingredients.length) { formError('#blend-error', 'Vyber aspoň základ.'); return; }
                if (state.blends.some(x => x.id !== b.id && x.name.toLowerCase() === row.name.toLowerCase())) {
                    formError('#blend-error', `Směs „${row.name}“ už existuje.`); return;
                }
                if (isNew) row.id = uniqueId(slugify(row.name) || 'smes', state.blends.map(x => x.id));
                const btn = form.querySelector('[type=submit]');
                btn.disabled = true;
                try {
                    if (isNew) {
                        const [saved] = await db.insert('blends', row);
                        state.blends.push(saved);
                    } else {
                        const saved = await updateOne('blends', { id: 'eq.' + b.id }, row);
                        Object.assign(blend, saved);
                    }
                    state.blends.sort((x, y) => (x.sort - y.sort) || x.name.localeCompare(y.name, 'cs'));
                    photo.commit();
                    toast(isNew ? `Přidáno: ${row.name}` : `Uloženo: ${row.name}`);
                    closeSheet(true);
                    renderBlends();
                } catch (err) {
                    formError('#blend-error', friendly(err));
                } finally {
                    btn.disabled = false;
                }
            });
            const del = $('#blend-delete', body);
            if (del) del.addEventListener('click', async () => {
                if (!(await confirmDialog(`Smazat směs ${b.name}? Z úvodní stránky zmizí. Kdo ji má v košíku, objedná ji dál.`))) return;
                try {
                    const rows = await db.remove('blends', { id: 'eq.' + b.id });
                    if (!rows.length) throw new db.DbError('no_rows', 0);
                    state.blends = state.blends.filter(x => x.id !== b.id);
                    removePhotos([b.photo_url]);
                    toast(`Smazáno: ${b.name}`);
                    closeSheet(true);
                    renderBlends();
                } catch (err) { formError('#blend-error', friendly(err)); }
            });
            return () => photo.discard();
        });
    }

    /* ═══ MÝDLA A BALZÁMY ══════════════════════════════════════════ */
    const CRAFT_KIND = { soap: 'Mýdlo', balm: 'Balzám na rty' };

    function craftSwatch(p) {
        const photo = safePhoto(p.photo_url);
        if (photo) return `<img class="thumb" src="${esc(photo)}" alt="" loading="lazy">`;
        return `<span class="swatch${p.kind === 'balm' ? ' swatch-round' : ''}" style="background:${esc(p.color)}" aria-hidden="true"></span>`;
    }

    function renderCraft() {
        const el = $('#craft-list');
        const counts = {};
        state.waitlist.forEach(w => { counts[w.product_id] = (counts[w.product_id] || 0) + 1; });
        const badge = $('#count-waitlist');
        badge.textContent = state.waitlist.length;
        badge.hidden = !state.waitlist.length;
        el.innerHTML = state.craft.length ? state.craft.map(p => `
            <button type="button" class="row${p.active ? '' : ' is-muted'}" data-craft="${esc(p.id)}">
                ${craftSwatch(p)}
                <span class="row-main">
                    <span class="row-title">${esc(p.name_cs)}</span>
                    <span class="row-sub">${esc(CRAFT_KIND[p.kind] || p.kind)}${p.ingredients.length ? ', ' + esc(p.ingredients.map(ingName).join(', ')) : ''}</span>
                </span>
                <span class="row-side">
                    ${counts[p.id] ? `<span class="pill pill-new">${counts[p.id]} ${counts[p.id] === 1 ? 'zájemce' : counts[p.id] < 5 ? 'zájemci' : 'zájemců'}</span>` : ''}
                    ${!p.active ? '<span class="pill">Skrytý</span>' : ''}
                </span>
            </button>`).join('') : '<p class="empty">Zatím žádné produkty. Dokud tu nic není, web ukazuje vestavěné ukázky.</p>';
        $$('#craft-list [data-craft]').forEach(row => row.addEventListener('click', () => {
            openCraft(state.craft.find(p => p.id === row.dataset.craft));
        }));
        renderWaitlist();
    }

    function renderWaitlist() {
        const el = $('#waitlist-list');
        $('#waitlist-count').textContent = state.waitlist.length ? `(${state.waitlist.length})` : '';
        $('#waitlist-export').hidden = !state.waitlist.length;
        if (!state.waitlist.length) {
            el.innerHTML = '<p class="empty">Zatím nikdo. Jakmile si někdo na webu nechá poslat zprávu, objeví se tady.</p>';
            return;
        }
        const name = id => (state.craft.find(p => p.id === id) || {}).name_cs || id;
        el.innerHTML = state.waitlist.map(w => `
            <div class="table-row waitlist-row" data-id="${esc(w.id)}">
                <span class="row-main">
                    <span class="row-title"><a href="mailto:${esc(w.email)}">${esc(w.email)}</a></span>
                    <span class="row-sub">${esc(name(w.product_id))}, ${esc(formatDate(w.created_at, false))}${w.lang === 'en' ? ', anglicky' : ''}</span>
                </span>
                <button type="button" class="icon-btn" data-field="delete" aria-label="Smazat ${esc(w.email)}">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12M9 7V4h6v3"/></svg>
                </button>
            </div>`).join('');
        $$('#waitlist-list .waitlist-row').forEach(row => {
            $('[data-field=delete]', row).addEventListener('click', async () => {
                const w = state.waitlist.find(x => String(x.id) === row.dataset.id);
                if (!w || !(await confirmDialog(`Smazat ${w.email} ze seznamu zájemců?`))) return;
                try {
                    const rows = await db.remove('craft_waitlist', { id: 'eq.' + w.id });
                    if (!rows.length) throw new db.DbError('no_rows', 0);
                    state.waitlist = state.waitlist.filter(x => x !== w);
                    renderCraft();
                    toast('Smazáno.');
                } catch (err) { fail(err); }
            });
        });
    }

    $('#waitlist-export').addEventListener('click', () => {
        const name = id => (state.craft.find(p => p.id === id) || {}).name_cs || id;
        const cell = v => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;
        const lines = [['Produkt', 'E-mail', 'Datum', 'Jazyk'].map(cell).join(';')]
            .concat(state.waitlist.map(w => [name(w.product_id), w.email, formatDate(w.created_at, false), w.lang].map(cell).join(';')));
        const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `zajemci-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    });

    function openCraft(product) {
        const isNew = !product;
        const p = product || {
            kind: 'soap', name_cs: '', name_en: '', desc_cs: '', desc_en: '', ingredients: [],
            color: '#d9c4a0', photo_url: null, active: true,
            sort: Math.max(0, ...state.craft.map(x => x.sort || 0)) + 10,
        };
        const groups = ['base', 'flavor', 'extra'].map(cat => `
            <div class="pick-group"><span class="pick-label">${CATEGORY_GROUP[cat]}</span><div class="pick-chips">
                ${state.ingredients.filter(i => i.category === cat).map(i => `
                    <label class="pick-chip"><input type="checkbox" name="ing" value="${esc(i.code)}" ${p.ingredients.includes(i.code) ? 'checked' : ''}>
                    <span><i style="background:${esc(i.color)}"></i>${esc(i.name_cs)}</span></label>`).join('')}
            </div></div>`).join('');
        const html = `
            <form id="craft-form" novalidate>
                <p class="form-error" id="craft-error" role="alert" hidden></p>
                ${photoFieldHtml}
                <p class="help">Bez fotky web nakreslí mýdlo nebo plechovku v barvě níž.</p>
                <label class="field"><span>Druh</span>
                    <select name="kind">${Object.entries(CRAFT_KIND).map(([k, v]) => `<option value="${k}"${p.kind === k ? ' selected' : ''}>${v}</option>`).join('')}</select>
                </label>
                <label class="field"><span>Název česky</span><input type="text" name="name_cs" maxlength="60" required value="${esc(p.name_cs)}"></label>
                <label class="field"><span>Název anglicky</span><input type="text" name="name_en" maxlength="60" value="${esc(p.name_en)}"><small>Prázdné = česky i v angličtině.</small></label>
                <fieldset class="field picks"><span>Suroviny z čajů (nejvýš 4)</span>${groups}
                    <small>U těchhle ingrediencí web ukáže odkaz „Najdeš i v“ a u čajů s nimi „Ze stejných surovin“.</small></fieldset>
                <label class="field"><span>Popis česky</span><textarea name="desc_cs" rows="3" maxlength="500">${esc(p.desc_cs)}</textarea><small>Jak voní a z čeho je. Žádné léčivé účinky, ty u kosmetiky uvádět nejde.</small></label>
                <label class="field"><span>Popis anglicky</span><textarea name="desc_en" rows="3" maxlength="500">${esc(p.desc_en)}</textarea></label>
                <label class="field field-inline"><span>Barva</span><input type="color" name="color" value="${esc(p.color)}"></label>
                <label class="switch-row"><input type="checkbox" class="switch" name="active" ${p.active ? 'checked' : ''}><span>Zobrazovat na webu</span></label>
                <label class="field field-inline"><span>Pořadí</span><input type="number" name="sort" step="1" value="${esc(p.sort)}"></label>
                <div class="sheet-actions">
                    <button type="submit" class="btn btn-primary">${isNew ? 'Přidat produkt' : 'Uložit změny'}</button>
                    <button type="button" class="btn btn-secondary" data-action="close-sheet">Zrušit</button>
                    <span class="spacer"></span>
                    ${isNew ? '' : '<button type="button" class="btn-link" id="craft-delete">Smazat</button>'}
                </div>
            </form>`;

        openSheet(isNew ? 'Nový produkt' : p.name_cs, html, body => {
            const form = $('#craft-form', body);
            const photo = photoControl(body, p.photo_url, 'craft', () => form.name_cs.value || p.id, '🧼');
            const boxes = () => $$('input[name=ing]', form);
            const limit = () => {
                const on = boxes().filter(b => b.checked).length;
                boxes().forEach(b => { b.disabled = !b.checked && on >= 4; });
            };
            limit();
            form.addEventListener('change', e => { if (e.target.name === 'ing') limit(); });

            form.addEventListener('submit', async e => {
                e.preventDefault();
                formError('#craft-error', '');
                const row = {
                    kind: form.kind.value === 'balm' ? 'balm' : 'soap',
                    name_cs: form.name_cs.value.trim(),
                    name_en: form.name_en.value.trim(),
                    desc_cs: form.desc_cs.value.trim(),
                    desc_en: form.desc_en.value.trim(),
                    ingredients: boxes().filter(b => b.checked).map(b => b.value).slice(0, 4),
                    color: /^#[0-9a-f]{6}$/i.test(form.color.value) ? form.color.value : '#d9c4a0',
                    active: form.active.checked,
                    photo_url: photo.url,
                    sort: parseInt(form.sort.value, 10) || 0,
                };
                if (!row.name_cs) { formError('#craft-error', 'Vyplň název.'); return; }
                if (isNew) row.id = uniqueId(slugify(row.name_cs) || 'produkt', state.craft.map(x => x.id));
                const btn = form.querySelector('[type=submit]');
                btn.disabled = true;
                try {
                    if (isNew) {
                        const [saved] = await db.insert('craft_products', row);
                        state.craft.push(saved);
                    } else {
                        Object.assign(product, await updateOne('craft_products', { id: 'eq.' + p.id }, row));
                    }
                    state.craft.sort((x, y) => (x.sort - y.sort) || x.name_cs.localeCompare(y.name_cs, 'cs'));
                    photo.commit();
                    toast(isNew ? `Přidáno: ${row.name_cs}` : `Uloženo: ${row.name_cs}`);
                    closeSheet(true);
                    renderCraft();
                } catch (err) {
                    formError('#craft-error', friendly(err));
                } finally {
                    btn.disabled = false;
                }
            });
            const del = $('#craft-delete', body);
            if (del) del.addEventListener('click', async () => {
                const n = state.waitlist.filter(w => w.product_id === p.id).length;
                const extra = n ? ` Smažou se i ${n} ${n === 1 ? 'zájemce' : n < 5 ? 'zájemci' : 'zájemců'}.` : '';
                if (!(await confirmDialog(`Smazat ${p.name_cs}? Z webu zmizí.${extra} Když ho chceš jen schovat, vypni „Zobrazovat na webu“.`))) return;
                try {
                    const rows = await db.remove('craft_products', { id: 'eq.' + p.id });
                    if (!rows.length) throw new db.DbError('no_rows', 0);
                    state.craft = state.craft.filter(x => x.id !== p.id);
                    state.waitlist = state.waitlist.filter(w => w.product_id !== p.id);
                    removePhotos([p.photo_url]);
                    toast(`Smazáno: ${p.name_cs}`);
                    closeSheet(true);
                    renderCraft();
                } catch (err) { formError('#craft-error', friendly(err)); }
            });
            return () => photo.discard();
        });
    }

    /* ═══ CENY A DOPRAVA ═══════════════════════════════════════════ */
    function renderPricing() {
        const prices = $('#prices-list');
        prices.innerHTML = state.prices.length ? state.prices.map(p => `
            <div class="table-row" data-weight="${p.weight_g}">
                <span class="table-label">${p.weight_g} g</span>
                <span class="unit"><input type="number" min="1" step="1" inputmode="numeric" value="${p.price_czk}" data-field="price" aria-label="Cena za ${p.weight_g} g"><em>Kč</em></span>
                <label class="stock-toggle"><input type="checkbox" class="switch" data-field="active" ${p.active ? 'checked' : ''}><span>V prodeji</span></label>
                <button type="button" class="icon-btn" data-field="delete" aria-label="Smazat ${p.weight_g} g">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12M9 7V4h6v3"/></svg>
                </button>
            </div>`).join('') : '<p class="empty">Ceník je prázdný. Dokud tu nic není, web ukazuje vestavěné ceny a objednat nejde.</p>';

        const activeCount = () => state.prices.filter(p => p.active).length;
        $$('#prices-list .table-row').forEach(row => {
            const p = state.prices.find(x => String(x.weight_g) === row.dataset.weight);
            const priceInput = $('[data-field=price]', row);
            priceInput.addEventListener('change', async () => {
                const value = parseInt(priceInput.value, 10);
                if (!(value >= 1 && value <= 100000)) { toast('Cena musí být celé číslo od 1 Kč.', true); priceInput.value = p.price_czk; return; }
                try {
                    Object.assign(p, await updateOne('price_tiers', { weight_g: 'eq.' + p.weight_g }, { price_czk: value }));
                    toast(`${p.weight_g} g teď stojí ${kc(p.price_czk)}`);
                } catch (err) { priceInput.value = p.price_czk; fail(err); }
            });
            const active = $('[data-field=active]', row);
            active.addEventListener('change', async () => {
                if (!active.checked && activeCount() <= 1) {
                    active.checked = true;
                    toast('Aspoň jedna gramáž musí zůstat v prodeji.', true);
                    return;
                }
                try {
                    Object.assign(p, await updateOne('price_tiers', { weight_g: 'eq.' + p.weight_g }, { active: active.checked }));
                    toast(p.active ? `${p.weight_g} g zpátky v prodeji` : `${p.weight_g} g stažené z prodeje`);
                } catch (err) { active.checked = !active.checked; fail(err); }
            });
            $('[data-field=delete]', row).addEventListener('click', async () => {
                if (p.active && activeCount() <= 1) { toast('Aspoň jedna gramáž musí zůstat v prodeji.', true); return; }
                if (!(await confirmDialog(`Smazat gramáž ${p.weight_g} g? Kdo ji má v košíku, bude muset vybrat jinou.`))) return;
                try {
                    const rows = await db.remove('price_tiers', { weight_g: 'eq.' + p.weight_g });
                    if (!rows.length) throw new db.DbError('no_rows', 0);
                    state.prices = state.prices.filter(x => x !== p);
                    renderPricing();
                    toast(`Gramáž ${p.weight_g} g smazaná`);
                } catch (err) { fail(err); }
            });
        });

        const ship = $('#shipping-list');
        ship.innerHTML = state.shipping.map(s => `
            <div class="table-row" data-ship="${esc(s.id)}">
                <span class="table-label">${esc(s.name)}</span>
                <span class="unit"><input type="number" min="0" step="1" inputmode="numeric" value="${s.price_czk}" data-field="price" aria-label="Cena dopravy ${esc(s.name)}"><em>Kč</em></span>
                <label class="stock-toggle"><input type="checkbox" class="switch" data-field="active" ${s.active ? 'checked' : ''}><span>Nabízet</span></label>
                <span></span>
            </div>`).join('');
        $$('#shipping-list .table-row').forEach(row => {
            const s = state.shipping.find(x => x.id === row.dataset.ship);
            const price = $('[data-field=price]', row);
            price.addEventListener('change', async () => {
                const value = parseInt(price.value, 10);
                if (!(value >= 0 && value <= 10000)) { toast('Cena dopravy musí být 0 až 10 000 Kč.', true); price.value = s.price_czk; return; }
                try {
                    Object.assign(s, await updateOne('shipping_methods', { id: 'eq.' + s.id }, { price_czk: value }));
                    toast(`${s.name}: ${kc(s.price_czk)}`);
                } catch (err) { price.value = s.price_czk; fail(err); }
            });
            const active = $('[data-field=active]', row);
            active.addEventListener('change', async () => {
                if (!active.checked && state.shipping.filter(x => x.active).length <= 1) {
                    active.checked = true;
                    toast('Aspoň jeden způsob dopravy musí zůstat zapnutý.', true);
                    return;
                }
                try {
                    Object.assign(s, await updateOne('shipping_methods', { id: 'eq.' + s.id }, { active: active.checked }));
                    toast(s.active ? `${s.name}: nabízíme` : `${s.name}: vypnuto`);
                } catch (err) { active.checked = !active.checked; fail(err); }
            });
        });

        const form = $('#settings-form');
        const st = state.settings || { free_ship_threshold: 500, promo_bar_enabled: true, promo_bar_cs: '', promo_bar_en: '' };
        form.free_ship_threshold.value = st.free_ship_threshold;
        form.promo_bar_enabled.checked = st.promo_bar_enabled !== false;
        form.promo_bar_cs.value = st.promo_bar_cs || '';
        form.promo_bar_en.value = st.promo_bar_en || '';
    }

    $('#price-add-form').addEventListener('submit', async e => {
        e.preventDefault();
        const form = e.currentTarget;
        const weight = parseInt(form.weight_g.value, 10);
        const price = parseInt(form.price_czk.value, 10);
        if (!(weight >= 1 && weight <= 5000)) { toast('Gramáž musí být 1 až 5000 g.', true); return; }
        if (!(price >= 1 && price <= 100000)) { toast('Cena musí být celé číslo od 1 Kč.', true); return; }
        if (state.prices.some(p => p.weight_g === weight)) { toast(`Gramáž ${weight} g už v ceníku je.`, true); return; }
        try {
            const [row] = await db.insert('price_tiers', { weight_g: weight, price_czk: price });
            state.prices.push(row);
            state.prices.sort((a, b) => a.weight_g - b.weight_g);
            form.reset();
            renderPricing();
            toast(`Přidáno: ${weight} g za ${kc(price)}`);
        } catch (err) { fail(err); }
    });

    $('#settings-form').addEventListener('submit', async e => {
        e.preventDefault();
        const form = e.currentTarget;
        const threshold = parseInt(form.free_ship_threshold.value, 10);
        if (!(threshold >= 0)) { toast('Hranice pro dopravu zdarma musí být číslo od 0.', true); return; }
        const row = {
            free_ship_threshold: threshold,
            promo_bar_enabled: form.promo_bar_enabled.checked,
            promo_bar_cs: form.promo_bar_cs.value.trim() || null,
            promo_bar_en: form.promo_bar_en.value.trim() || null,
        };
        const btn = form.querySelector('[type=submit]');
        btn.disabled = true;
        try {
            state.settings = state.settings
                ? await updateOne('settings', { id: 'eq.1' }, row)
                : (await db.insert('settings', Object.assign({ id: 1 }, row)))[0];
            toast('Nastavení uložené.');
        } catch (err) { fail(err); }
        finally { btn.disabled = false; }
    });

    /* ═══ SLEVY ════════════════════════════════════════════════════ */
    function promoStatus(p) {
        if (!p.active) return ['Vypnutý', 'pill-done'];
        if (p.valid_until && p.valid_until < new Date().toISOString().slice(0, 10)) return ['Vypršel', 'pill-cancelled'];
        if (p.max_uses && p.used_count >= p.max_uses) return ['Vyčerpaný', 'pill-cancelled'];
        return ['Platí', 'pill-shipped'];
    }
    function renderPromos() {
        const el = $('#promos-list');
        if (!state.promos.length) {
            el.innerHTML = '<p class="empty">Žádné slevové kódy. Přidej první tlačítkem nahoře.</p>';
            return;
        }
        el.innerHTML = state.promos.map(p => {
            const [label, cls] = promoStatus(p);
            const parts = [`použito ${p.used_count}×${p.max_uses ? ` z ${p.max_uses}` : ''}`];
            if (p.valid_until) parts.unshift(`platí do ${formatDate(p.valid_until + 'T12:00:00', false)}`);
            return `<button type="button" class="row compact" data-promo="${esc(p.code)}">
                <span class="swatch" style="background:var(--pale);color:var(--forest);font-size:13px;font-weight:700">−${Math.round(p.rate * 100)}</span>
                <span class="row-main">
                    <span class="row-title">${esc(p.code)}</span>
                    <span class="row-sub">${esc(parts.join(', '))}</span>
                </span>
                <span class="row-side"><span class="pill ${cls}">${label}</span></span>
            </button>`;
        }).join('');
        $$('#promos-list [data-promo]').forEach(row => row.addEventListener('click', () => {
            openPromo(state.promos.find(p => p.code === row.dataset.promo));
        }));
    }

    function openPromo(promo) {
        const isNew = !promo;
        const p = promo || { code: '', rate: 0.1, active: true, valid_until: null, max_uses: null, used_count: 0 };
        const html = `
            <form id="promo-form" novalidate>
                <p class="form-error" id="promo-error" role="alert" hidden></p>
                ${isNew
                    ? `<label class="field"><span>Kód</span><input type="text" name="code" maxlength="30" required autocapitalize="characters" placeholder="LETO15">
                       <small>Velká písmena, číslice, pomlčka nebo podtržítko. Zákazník ho může psát i malými.</small></label>`
                    : `<div class="field"><span>Kód</span><div class="readonly">${esc(p.code)}</div><small>Kód už nejde přejmenovat. Když potřebuješ jiný, založ nový a tenhle vypni.</small></div>`}
                <label class="field field-inline"><span>Sleva</span><input type="number" name="percent" min="1" max="90" step="1" value="${Math.round(p.rate * 100)}"><em>%</em></label>
                <label class="field field-inline"><span>Platí do</span><input type="date" name="valid_until" value="${esc(p.valid_until || '')}"></label>
                <p class="help">Prázdné = platí bez omezení. Poslední den ještě platí.</p>
                <label class="field field-inline"><span>Max. použití</span><input type="number" name="max_uses" min="1" step="1" value="${esc(p.max_uses || '')}"></label>
                <p class="help">Prázdné = bez limitu.${isNew ? '' : ` Zatím použito ${p.used_count}×.`}</p>
                <label class="switch-row"><input type="checkbox" class="switch" name="active" ${p.active ? 'checked' : ''}><span>Kód je aktivní</span></label>
                <div class="sheet-actions">
                    <button type="submit" class="btn btn-primary">${isNew ? 'Přidat kód' : 'Uložit změny'}</button>
                    <button type="button" class="btn btn-secondary" data-action="close-sheet">Zrušit</button>
                    <span class="spacer"></span>
                    ${isNew ? '' : '<button type="button" class="btn-link" id="promo-delete">Smazat</button>'}
                </div>
            </form>`;
        openSheet(isNew ? 'Nový slevový kód' : p.code, html, body => {
            const form = $('#promo-form', body);
            form.addEventListener('submit', async e => {
                e.preventDefault();
                formError('#promo-error', '');
                const percent = parseInt(form.percent.value, 10);
                const maxUses = form.max_uses.value.trim() ? parseInt(form.max_uses.value, 10) : null;
                if (!(percent >= 1 && percent <= 90)) { formError('#promo-error', 'Sleva musí být 1 až 90 %.'); return; }
                if (maxUses !== null && !(maxUses >= 1)) { formError('#promo-error', 'Max. použití musí být aspoň 1, nebo nech políčko prázdné.'); return; }
                const row = {
                    rate: percent / 100,
                    valid_until: form.valid_until.value || null,
                    max_uses: maxUses,
                    active: form.active.checked,
                };
                if (isNew) {
                    row.code = form.code.value.trim().toUpperCase();
                    if (!/^[A-Z0-9_-]{2,30}$/.test(row.code)) {
                        formError('#promo-error', 'Kód smí mít 2–30 znaků: písmena bez diakritiky, číslice, pomlčka, podtržítko.');
                        return;
                    }
                    if (state.promos.some(x => x.code === row.code)) { formError('#promo-error', `Kód ${row.code} už existuje.`); return; }
                }
                const btn = form.querySelector('[type=submit]');
                btn.disabled = true;
                try {
                    if (isNew) {
                        const [saved] = await db.insert('promo_codes', row);
                        state.promos.unshift(saved);
                    } else {
                        Object.assign(promo, await updateOne('promo_codes', { code: 'eq.' + p.code }, row));
                    }
                    toast(isNew ? `Kód ${row.code} je připravený.` : `Uloženo: ${p.code}`);
                    closeSheet(true);
                    renderPromos();
                } catch (err) {
                    formError('#promo-error', friendly(err));
                } finally {
                    btn.disabled = false;
                }
            });
            const del = $('#promo-delete', body);
            if (del) del.addEventListener('click', async () => {
                if (!(await confirmDialog(`Smazat kód ${p.code}? Kdo ho má zadaný v košíku, slevu při objednávce nedostane.`))) return;
                try {
                    const rows = await db.remove('promo_codes', { code: 'eq.' + p.code });
                    if (!rows.length) throw new db.DbError('no_rows', 0);
                    state.promos = state.promos.filter(x => x.code !== p.code);
                    toast(`Kód ${p.code} smazaný`);
                    closeSheet(true);
                    renderPromos();
                } catch (err) { formError('#promo-error', friendly(err)); }
            });
        });
    }

    boot().catch(fail);
})();
