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
    // Druh suroviny rozhoduje o názvu směsi na etiketě (ochucený, bylinný, ovocný čaj).
    const KIND = { tea: 'Pravý čaj', herb: 'Bylina nebo koření', fruit: 'Sušené ovoce', other: 'Jiné (med, cukr…)' };
    const defaultKind = category => (category === 'base' ? 'tea' : 'herb');
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
        suppliers: [], materials: [], offers: [], tasks: [],
        purchaseView: 'overview', supplierFilter: 'all', materialFilter: 'all',
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
        if (m === 'seller_missing') return 'Prodej nejde spustit bez údajů prodávajícího. Vyplň jméno, IČO, adresu sídla a e-mail v Prodávající a etiketa.';
        if (m === 'bulk_delete_blocked') return `Tolik položek najednou smazat nejde. ${err.details || ''} Mazej po menších kouscích.`.trim();
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

    // typed: u velkých zásahů musí admin opsat slovo nebo název, jinak
    // tlačítko nejde zmáčknout. Oprávnění a limity hlídá i tak databáze.
    function confirmDialog(text, okLabel, typed) {
        const dlg = $('#confirm-dialog');
        if (!dlg || typeof dlg.showModal !== 'function') {
            if (!typed) return Promise.resolve(window.confirm(text));
            return Promise.resolve(window.prompt(`${text}\n\nPro potvrzení napiš: ${typed}`) === typed);
        }
        $('#confirm-text').textContent = text;
        const ok = $('#confirm-ok');
        ok.textContent = okLabel || 'Smazat';
        const wrap = $('#confirm-typed');
        const input = $('#confirm-typed-input');
        wrap.hidden = !typed;
        input.value = '';
        ok.disabled = !!typed;
        const onInput = () => { ok.disabled = input.value.trim() !== typed; };
        if (typed) {
            $('#confirm-typed-label').textContent = `Pro potvrzení napiš: ${typed}`;
            input.addEventListener('input', onInput);
        }
        dlg.returnValue = '';
        return new Promise(resolve => {
            dlg.addEventListener('close', () => {
                input.removeEventListener('input', onInput);
                ok.disabled = false;
                resolve(dlg.returnValue === 'ok' && (!typed || input.value.trim() === typed));
            }, { once: true });
            dlg.showModal();
            if (typed) input.focus();
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
    /* Text na štítek sáčku. Na Slovensko jde slovensky (nařízení EU 1169/2011,
       čl. 15: jazyk srozumitelný v zemi prodeje), jinak česky. Druh čaje
       stejně jako na webu (vyhláška 187/2023 Sb., § 2). */
    function pouchLabel(item, lang) {
        if (!Array.isArray(item.recipe) || !item.recipe.length) return '';
        const loc = lang === 'sk' ? 'sk' : 'cs';
        const low = s => String(s || '').toLocaleLowerCase(loc);
        const lbl = x => {
            const i = ingByCode(x.code) || {};
            const cs = String(i.label_cs || '').trim() || low(i.name_cs || x.name || x.code);
            if (loc === 'cs') return cs;
            return String(i.label_sk || '').trim() || (i.name_sk ? low(i.name_sk) : cs);
        };
        const N = loc === 'sk'
            ? { flavoured: 'Ochutený ', herb: 'Bylinný čaj', fruit: 'Ovocný čaj', comp: 'Zloženie' }
            : { flavoured: 'Ochucený ', herb: 'Bylinný čaj', fruit: 'Ovocný čaj', comp: 'Složení' };
        const isTea = x => (recipeInfo(x.code) || {}).kind === 'tea';
        const teas = item.recipe.filter(isTea);
        let name = '';
        if (item.category === 'tea') {
            const group = teas.length === 1 ? lbl(teas[0]) : 'čaj';
            name = teas.length === item.recipe.length ? group.charAt(0).toLocaleUpperCase(loc) + group.slice(1) : N.flavoured + group;
        } else if (item.category === 'herb') name = N.herb;
        else if (item.category === 'fruit') name = N.fruit;
        return `${name ? name + '. ' : ''}${N.comp}: ${item.recipe.map(x => `${lbl(x)} ${x.pct} %`).join(', ')}`;
    }
    /* Receptura stejně jako na webu a v databázi (../recipe.js). Skryté
       suroviny se počítají taky, ať jde staré směsi aspoň zobrazit. */
    const recipeInfo = code => {
        const i = ingByCode(code);
        return i ? { kind: i.kind || (i.category === 'base' ? 'tea' : 'herb'), maxPct: i.max_pct, surcharge: i.surcharge_czk || 0 } : null;
    };
    const recipeOf = (codes, parts, weight) => Recipe.evaluate(codes, parts, recipeInfo, weight || 100);
    const RECIPE_ERRORS = {
        empty: 'Vyber aspoň jednu surovinu.',
        too_many: 'Nejvýš 5 surovin.',
        duplicate: 'Každá surovina jen jednou.',
        unknown: 'Některá surovina už v katalogu není.',
        too_many_pinch: 'Špetka (limit do 5 %) může být nejvýš ze dvou surovin.',
        no_main: 'Samotná špetka nestačí, přidej hlavní surovinu.',
        no_category: 'Žádná skupina nemá přes polovinu: čaj aspoň 50 %, nebo byliny či ovoce víc než 50 % (vyhláška 187/2023 Sb., § 2).',
    };
    const recipeError = r => r.error === 'over_limit'
        ? `${ingName(r.errorCode)} smí tvořit nejvýš ${(ingByCode(r.errorCode) || {}).max_pct} % (příloha 1 vyhlášky).`
        : (RECIPE_ERRORS[r.error] || 'Směs takhle nejde.');
    const CATEGORY_NAME = { tea: 'ochucený nebo čistý čaj', herb: 'bylinný čaj', fruit: 'ovocný čaj' };
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
        const layers = (codes || []).slice(0, 5);
        return `<span class="glass" aria-hidden="true">${layers.map(c =>
            `<span style="background:${esc(ingColor(c))}"></span>`).join('')}</span>`;
    }
    /* Stejná ikonka jako na webu: vlastní (Ikonka), fotka, nebo vestavěná kresba. */
    function swatchHtml(ing) {
        const color = /^#[0-9a-f]{6}$/i.test(ing.color || '') ? ing.color : '#cccccc';
        const icon = safePhoto(ing.icon_url);
        if (icon) return `<span class="ing-ico has-img" style="--c:${esc(color)}" aria-hidden="true"><img src="${esc(icon)}" alt="" loading="lazy"></span>`;
        const photo = safePhoto(ing.photo_url);
        if (photo) return `<span class="ing-ico has-photo" style="--c:${esc(color)};background-image:url('${esc(photo)}')" aria-hidden="true"></span>`;
        const kind = ing.kind || (ing.category === 'base' ? 'tea' : '');
        return `<span class="ing-ico" style="--c:${esc(color)}" aria-hidden="true">${IngIcons.svg(IngIcons.keyFor(ing.code, kind))}</span>`;
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
        showEnvironment();
        show('app');
        const fromHash = (location.hash || '').replace('#', '');
        switchTab(['orders', 'ingredients', 'blends', 'pricing', 'promos', 'craft', 'purchase', 'withdrawals', 'privacy', 'backups'].includes(fromHash) ? fromHash : 'orders');
        purgeExpired();
    }

    // Úklid osobních údajů podle zásad (staré e-maily zájemců, kontakty
    // u starých objednávek…). Běží při každém přihlášení, potichu.
    async function purgeExpired() {
        try {
            const r = await db.rpc('purge_expired_data');
            const n = r ? Object.values(r).reduce((a, b) => a + (Number(b) || 0), 0) : 0;
            if (n) toast(`Úklid osobních údajů: smazáno nebo anonymizováno ${n} záznamů po uplynutí lhůty.`);
        } catch (err) {
            console.warn('[admin] Úklid osobních údajů se nespustil (je spuštěný nový setup.sql?):', err);
        }
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
        renderBackupAlert();
        renderSales();
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
            } else if (name === 'purchase') {
                await loadPurchase();
                renderPurchase();
            } else if (name === 'withdrawals') {
                state.withdrawals = await db.select('withdrawals', { order: 'created_at.desc', limit: 500 });
                renderWithdrawals();
            } else if (name === 'reviews') {
                state.reviews = await db.select('reviews', { order: 'created_at.desc', limit: 500 });
                renderReviews();
            } else if (name === 'backups') {
                state.trash = await db.select('deleted_rows', { order: 'deleted_at.desc', limit: 500 });
                renderBackups();
            } else if (name === 'privacy') {
                state.privacyRequests = await db.select('privacy_requests', { order: 'created_at.desc', limit: 300 });
                renderPrivacy();
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
    /* Ikonka: PNG s průhledným pozadím, nejvýš 512 px. SVG se tady převede
       na PNG, ať se do úložiště nedostane nic, co by šlo spustit. */
    async function prepareIcon(file) {
        if (file.size > 2 * 1024 * 1024) throw new Error('Ikonka je moc velká, nahraj soubor do 2 MB.');
        const isSvg = file.type === 'image/svg+xml' || /\.svg$/i.test(file.name || '');
        const img = await loadImage(isSvg ? new Blob([await file.text()], { type: 'image/svg+xml' }) : file);
        const w = img.naturalWidth || 512, h = img.naturalHeight || 512;
        // SVG bez rozměrů nakreslíme rovnou na 512 px, bitmapu jen zmenšíme.
        const scale = isSvg ? 512 / Math.max(w, h) : Math.min(1, 512 / Math.max(w, h));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(w * scale));
        canvas.height = Math.max(1, Math.round(h * scale));
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        const blob = await canvasBlob(canvas, 'image/png');
        if (!blob) throw new Error('Ikonku se nepodařilo zpracovat.');
        return blob;
    }

    /* Ovládání ikonky v panelu ingredience. Stejně jako u fotky: nahraje
       hned, do ingredience se zapíše až uložením, nepoužité se smažou. */
    function iconControl(body, initialUrl, idHint, previewOf) {
        const ctl = { url: initialUrl || null, uploaded: [] };
        const box = $('#icon-field', body);
        const input = $('input[type=file]', box);
        const removeBtn = $('[data-icon=remove]', box);
        const paint = () => {
            $('.icon-preview', box).innerHTML = previewOf(safePhoto(ctl.url));
            removeBtn.hidden = !safePhoto(ctl.url);
        };
        ctl.paint = paint;
        paint();
        $('[data-icon=pick]', box).addEventListener('click', () => input.click());
        removeBtn.addEventListener('click', () => { ctl.url = null; sheetDirty = true; paint(); });
        input.addEventListener('change', async () => {
            const file = input.files && input.files[0];
            input.value = '';
            if (!file) return;
            const btn = $('[data-icon=pick]', box);
            btn.disabled = true;
            btn.textContent = 'Nahrávám…';
            try {
                const blob = await prepareIcon(file);
                const path = `icons/${slugify(idHint() || 'ikonka') || 'ikonka'}-${Date.now().toString(36)}.png`;
                const url = await db.upload(PHOTO_BUCKET, path, blob, 'image/png');
                ctl.uploaded.push(url);
                ctl.url = url;
                sheetDirty = true;
                paint();
                toast('Ikonka nahraná. Nezapomeň uložit.');
            } catch (err) {
                fail(err);
            } finally {
                btn.disabled = false;
                btn.textContent = 'Nahrát ikonku';
            }
        });
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
                    <span class="row-sub">${esc(o.num)}, ${esc(formatDate(o.created_at))}, ${count} ks${o.gift_wrap ? ', 🎁 dárek' : ''}${o.shipping_method === 'pickup' ? ', osobně' : ''}</span>
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
        const toSk = /^(sk|slovensko|slovakia)$/i.test(String(o.country || '').trim());
        const address = o.shipping_method === 'pickup'
            ? `${o.first_name} ${o.last_name}\nOsobní odběr${(state.settings && state.settings.pickup_note) ? ': ' + state.settings.pickup_note : ''}`
            : [`${o.first_name} ${o.last_name}`, o.street, `${o.zip} ${o.city}`.trim(), o.country].filter(Boolean).join('\n');
        const payLabel = o.shipping_method === 'pickup' && o.payment_method === 'cod'
            ? 'Hotově při osobním převzetí' : (PAYMENT[o.payment_method] || o.payment_method);
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
                            ${Array.isArray(i.recipe) && i.recipe.length
                                ? `<ul class="order-recipe">${i.recipe.map(x => `<li><span>${esc(x.name || ingName(x.code))}</span><span>${esc(x.pct)} %</span><strong>${esc(String(x.grams).replace('.', ','))} g</strong></li>`).join('')}</ul>`
                                : `<div class="order-item-sub">${esc((i.ingredient_names || i.ingredients || []).join(', '))}</div>`}
                            ${toSk && pouchLabel(i, 'sk') ? `<p class="order-label"><span>Na štítek slovensky (posíláš na Slovensko):</span> ${esc(pouchLabel(i, 'sk'))}</p>` : ''}
                            <div class="order-item-sub">${esc(i.weight_g)} g × ${esc(i.qty)}${i.surcharge_czk ? `, z toho příplatek ${kc(i.surcharge_czk)} za kus` : ''}</div>
                        </div>
                        <strong>${kc(i.line_czk)}</strong>
                    </div>`).join('')}
                <div class="totals">
                    <div><span>Zboží</span><span>${kc(o.goods_czk)}</span></div>
                    ${o.discount_czk ? `<div><span>Sleva ${esc(o.promo_code || '')}</span><span>−${kc(o.discount_czk)}</span></div>` : ''}
                    <div><span>Doprava</span><span>${o.shipping_czk ? kc(o.shipping_czk) : 'zdarma'}</span></div>
                    ${o.payment_czk ? `<div><span>Příplatek za dobírku</span><span>${kc(o.payment_czk)}</span></div>` : ''}
                    ${o.gift_wrap ? `<div><span>Dárkové balení</span><span>${o.gift_czk ? kc(o.gift_czk) : 'zdarma'}</span></div>` : ''}
                    <div class="grand"><span>Celkem</span><span>${kc(o.total_czk)}</span></div>
                </div>
            </div>

            ${o.gift_wrap ? `<div class="sheet-section order-gift">
                <h3>🎁 Dárek</h3>
                <p>Zabalit jako dárek. Doklad s cenou do balíčku nedávej, pošli ho zákazníkovi e-mailem.</p>
                ${o.gift_message ? `<p class="order-label"><span>Vzkaz na kartičku</span> ${esc(o.gift_message)}</p>` : '<p class="help">Bez vzkazu.</p>'}
            </div>` : ''}

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
                    <dt>Platba</dt><dd>${esc(payLabel)}</dd>
                    ${o.payment_method === 'transfer' ? `<dt>Variabilní symbol</dt><dd>${esc(o.id)}</dd>` : ''}
                    <dt>Jazyk webu</dt><dd>${({ en: 'angličtina', sk: 'slovenština' })[o.lang] || 'čeština'}</dd>
                    <dt>Obchodní podmínky</dt><dd>${o.terms_version ? `znění z ${esc(o.terms_version)}, odsouhlaseno tlačítkem „Objednat a zaplatit“ ${esc(formatDate(o.created_at))}` : 'neuvedeno'}</dd>
                </dl>
                <p style="margin:12px 0 0"><a class="btn btn-secondary btn-small" id="confirm-mail" href="${esc(orderConfirmMail(o))}">Napsat potvrzení objednávky</a></p>
                <p class="help">Otevře poštu s hotovým potvrzením v jazyce zákazníka${o.payment_method === 'transfer' ? ', včetně údajů k platbě' : ''}. Pošli ho hned po objednání.</p>
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
                            ${i.surcharge_czk ? `<span class="pill">+${esc(i.surcharge_czk)} Kč/100 g</span>` : ''}
                            ${i.max_pct ? `<span class="pill">max ${esc(i.max_pct)} %</span>` : ''}
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
            category: 'flavor', name_cs: '', name_en: '', name_sk: '', desc_cs: '', desc_en: '', desc_sk: '', emoji: '🍵', color: '#87ab68',
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
                <label class="field"><span>Název slovensky</span><input type="text" name="name_sk" maxlength="60" placeholder="Prázdné = česky" value="${esc(i.name_sk || '')}"></label>
                ${isNew
                    ? '<p class="help" id="code-help">Z anglického názvu vznikne vnitřní název pro sdílené odkazy. Později už nejde změnit.</p>'
                    : `<p class="help">Vnitřní název pro odkazy a košíky: <strong>${esc(i.code)}</strong></p>`}
                <label class="field"><span>Skupina v mixéru</span>
                    <select name="category">${Object.entries(CATEGORY).map(([k, v]) =>
                        `<option value="${k}"${i.category === k ? ' selected' : ''}>${v}</option>`).join('')}</select>
                </label>
                <label class="field"><span>Popis česky</span><textarea name="desc_cs" rows="2" maxlength="500">${esc(i.desc_cs)}</textarea></label>
                <label class="field"><span>Popis anglicky</span><textarea name="desc_en" rows="2" maxlength="500">${esc(i.desc_en)}</textarea></label>
                <label class="field"><span>Popis slovensky</span><textarea name="desc_sk" rows="2" maxlength="500" placeholder="Prázdné = česky">${esc(i.desc_sk || '')}</textarea></label>
                <div class="field-row">
                    <label class="field"><span>Barva</span><input type="color" name="color" value="${esc(i.color)}"><small>Podklad ikonky a tečky v košíku.</small></label>
                    <label class="field"><span>Emoji (jen v administraci)</span><input type="text" name="emoji" maxlength="8" value="${esc(i.emoji)}"></label>
                </div>
                <div class="field" id="icon-field">
                    <span>Ikonka</span>
                    <div class="icon-row">
                        <span class="icon-preview"></span>
                        <span class="photo-actions">
                            <input type="file" accept="image/png,image/webp,image/svg+xml,.svg">
                            <button type="button" class="btn btn-secondary btn-small" data-icon="pick">Nahrát ikonku</button>
                            <button type="button" class="btn-link" data-icon="remove">Vrátit vestavěnou</button>
                        </span>
                    </div>
                    <small>PNG nebo SVG s průhledným pozadím, ideálně čtverec 512 × 512 px. Web ji ukáže v kolečku v barvě suroviny: v mixéru, na sáčku, v encyklopedii. Bez ní je tu jednoduchá kresba.</small>
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
                <label class="field"><span>Chuť slovensky</span><input type="text" name="flavor_sk" value="${esc((i.flavor_sk || []).join(', '))}"></label>
                <fieldset class="field-group">
                    <legend>Na etiketu a do informací o potravině</legend>
                    <div class="field-row">
                        <label class="field"><span>Název ve složení</span><input type="text" name="label_cs" maxlength="80" placeholder="např. citronová kůra" value="${esc(i.label_cs || '')}"></label>
                        <label class="field"><span>Ve složení slovensky</span><input type="text" name="label_sk" maxlength="80" placeholder="napr. citrónová kôra" value="${esc(i.label_sk || '')}"></label>
                        <label class="field"><span>Druh</span>
                            <select name="kind">${Object.entries(KIND).map(([k, v]) =>
                                `<option value="${k}"${(i.kind || defaultKind(i.category)) === k ? ' selected' : ''}>${v}</option>`).join('')}</select>
                        </label>
                    </div>
                    <div class="field-row">
                        <label class="field"><span>Nejvýš ve směsi</span><input type="number" name="max_pct" min="1" max="100" step="1" inputmode="numeric" placeholder="bez limitu" value="${esc(i.max_pct || '')}"><small>V % podle přílohy 1 vyhlášky 187/2023 Sb. Třeba citronová kůra 30, levandule a kardamom 5. Do 5 % je surovina „špetka“: ve směsi má pevně 4 %.</small></label>
                        <label class="field"><span>Alergeny</span><input type="text" name="allergens" maxlength="200" placeholder="žádné" value="${esc(i.allergens || '')}"><small>Podle specifikace od dodavatele, např. oxid siřičitý u sušeného ovoce.</small></label>
                    </div>
                </fieldset>
                <label class="field field-inline"><span>Příplatek za prémiovou surovinu</span>
                    <input type="number" name="surcharge_czk" min="0" max="1000" step="1" inputmode="numeric" placeholder="0" value="${esc(i.surcharge_czk || '')}"><em>Kč za 100 g</em></label>
                <p class="help">Připočte se k ceně sáčku podle toho, kolik suroviny v něm je. Třeba 50 Kč za 100 g u bílého čaje: když je ho ve 100g sáčku 60 %, sáček stojí o 30 Kč víc.</p>
                <label class="field"><span>Poznámky o účincích česky</span><input type="text" name="health_cs" value="${esc((i.health_cs || []).join(', '))}">
                    <small>Jen pro tebe, na webu se neukazují. U potravin smí web uvádět jen zdravotní tvrzení schválená EU (nařízení 1924/2006).</small></label>
                <label class="field"><span>Poznámky o účincích anglicky</span><input type="text" name="health_en" value="${esc((i.health_en || []).join(', '))}"></label>
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
            const iconPreview = url => swatchHtml({
                code: i.code || codeFromName(form.name_en.value), kind: form.kind.value, category: form.category.value,
                color: form.color.value, icon_url: url, photo_url: url ? null : photo.url,
            });
            const icon = iconControl(body, i.icon_url, () => form.name_en.value || i.code, iconPreview);
            ['color', 'kind', 'category'].forEach(n => form[n].addEventListener('input', () => icon.paint()));
            ['kind', 'category'].forEach(n => form[n].addEventListener('change', () => icon.paint()));
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
                    name_cs: v('name_cs'), name_en: v('name_en'), name_sk: v('name_sk'),
                    desc_cs: v('desc_cs'), desc_en: v('desc_en'), desc_sk: v('desc_sk'),
                    category,
                    color: form.color.value.toLowerCase(),
                    emoji: v('emoji') || '🍵',
                    caffeine: category === 'base' && form.caffeine.value !== '' ? Number(form.caffeine.value) : null,
                    brew_temp: category === 'base' ? (v('brew_temp') || null) : null,
                    brew_time: category === 'base' ? (v('brew_time') || null) : null,
                    flavor_cs: splitList(v('flavor_cs')), flavor_en: splitList(v('flavor_en')), flavor_sk: splitList(v('flavor_sk')),
                    health_cs: splitList(v('health_cs')), health_en: splitList(v('health_en')),
                    label_cs: v('label_cs') || null,
                    label_sk: v('label_sk'),
                    kind: form.kind.value,
                    max_pct: form.max_pct.value === '' ? null : parseInt(form.max_pct.value, 10),
                    surcharge_czk: form.surcharge_czk.value === '' ? 0 : parseInt(form.surcharge_czk.value, 10),
                    allergens: v('allergens'),
                    pairs: $$('#pairs .chip[aria-pressed="true"]', body).map(c => c.dataset.pair),
                    photo_url: photo.url,
                    icon_url: icon.url,
                    in_stock: form.in_stock.checked,
                    active: form.active.checked,
                    sort: parseInt(v('sort'), 10) || 0,
                };
                if (!row.name_cs || !row.name_en) { formError('#ing-error', 'Vyplň český i anglický název.'); return; }
                if (!(Number.isInteger(row.surcharge_czk) && row.surcharge_czk >= 0 && row.surcharge_czk <= 1000)) {
                    formError('#ing-error', 'Příplatek zadej v celých korunách za 100 g, 0 až 1000.'); return;
                }
                if (row.max_pct !== null && !(row.max_pct >= 1 && row.max_pct <= 100)) {
                    formError('#ing-error', 'Nejvyšší podíl ve směsi musí být 1 až 100 %, nebo nech pole prázdné.'); return;
                }
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
                    icon.commit();
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
                    removePhotos([i.photo_url, i.icon_url].filter(Boolean));
                    toast(`Smazáno: ${i.name_cs}`);
                    closeSheet(true);
                    renderIngredients();
                } catch (err) { formError('#ing-error', friendly(err)); }
            });
            return () => { photo.discard(); icon.discard(); };
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
            const invalid = !missing && !recipeOf(b.ingredients, b.parts).ok;
            return `<button type="button" class="row${b.active ? '' : ' is-muted'}" data-blend="${esc(b.id)}">
                ${photo ? `<img class="thumb" src="${esc(photo)}" alt="" loading="lazy">` : glassHtml(b.ingredients)}
                <span class="row-main">
                    <span class="row-title">${esc(b.name)}</span>
                    <span class="row-sub">${esc(blendLine(b))}</span>
                </span>
                <span class="row-side">
                    ${b.is_preset ? '<span class="pill">Rychlá volba</span>' : ''}
                    ${!b.active ? '<span class="pill">Skrytá</span>' : ''}
                    ${soldOut ? '<span class="pill pill-out">Něco vyprodáno</span>' : ''}
                    ${missing ? '<span class="pill pill-out">Ingredience není na webu</span>' : ''}
                    ${invalid ? '<span class="pill pill-out">Složení neprojde, na webu není</span>' : ''}
                </span>
            </button>`;
        }).join('');
        $$('#blends-list [data-blend]').forEach(row => row.addEventListener('click', () => {
            openBlend(state.blends.find(b => b.id === row.dataset.blend));
        }));
    }

    /* „Zelený čaj 60 %, Máta peprná 20 %, …“ */
    function blendLine(b) {
        const r = recipeOf(b.ingredients, b.parts);
        return r.rows.length ? r.rows.map(x => `${ingName(x.code)} ${x.pct} %`).join(', ') : b.ingredients.map(ingName).join(', ');
    }

    function openBlend(blend) {
        const isNew = !blend;
        const b = blend || {
            name: '', desc_cs: '', desc_en: '', desc_sk: '', ingredients: [], parts: null, emoji: '🍵', is_preset: false,
            photo_url: null, active: true, sort: Math.max(0, ...state.blends.map(x => x.sort || 0)) + 10,
        };
        // Suroviny a díly (1–3). Starší směsi bez dílů: 3 + 1 + 1.
        let rows = (() => {
            const n = Recipe.normalize(b.ingredients, b.parts);
            return n.codes.map((code, i) => ({ code, parts: n.parts[i] }));
        })();
        if (!rows.length) rows = [{ code: '', parts: 3 }];
        const options = sel => ['base', 'flavor', 'extra'].map(cat => `<optgroup label="${CATEGORY_GROUP[cat]}">${state.ingredients
            .filter(i => i.category === cat).map(i => `<option value="${esc(i.code)}"${sel === i.code ? ' selected' : ''}>`
                + `${esc(i.name_cs)}${i.in_stock ? '' : ' (vyprodáno)'}${i.active ? '' : ' (skrytá)'}</option>`).join('')}</optgroup>`).join('');
        const html = `
            <form id="blend-form" novalidate>
                <p class="form-error" id="blend-error" role="alert" hidden></p>
                ${photoFieldHtml}
                <label class="field"><span>Název</span><input type="text" name="name" maxlength="60" required value="${esc(b.name)}"><small>Stejný v češtině i angličtině, jako ostatní směsi.</small></label>
                <fieldset class="field-group">
                    <legend>Složení</legend>
                    <p class="help">Až 5 surovin. Díly určují poměr: 2 díly jsou dvakrát víc než 1. Suroviny s limitem do 5 % (levandule, kardamom) jsou špetka a mají pevně 4 %.</p>
                    <div class="blend-rows" id="blend-rows"></div>
                    <button type="button" class="btn btn-secondary btn-small" id="blend-add-row">Přidat surovinu</button>
                    <div class="blend-preview"><span id="blend-glass"></span><p class="blend-check" id="blend-check" aria-live="polite"></p></div>
                </fieldset>
                <label class="field"><span>Popis česky</span><textarea name="desc_cs" rows="3" maxlength="500">${esc(b.desc_cs)}</textarea></label>
                <label class="field"><span>Popis anglicky</span><textarea name="desc_en" rows="3" maxlength="500">${esc(b.desc_en)}</textarea></label>
                <label class="field"><span>Popis slovensky</span><textarea name="desc_sk" rows="3" maxlength="500" placeholder="Prázdné = česky">${esc(b.desc_sk || '')}</textarea></label>
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
            const chosen = () => rows.filter(r => r.code);
            const paintRows = () => {
                $('#blend-rows', body).innerHTML = rows.map((r, i) => {
                    const ing = ingByCode(r.code);
                    const pinch = ing && Recipe.isPinch(ing.max_pct);
                    return `<div class="blend-row" data-row="${i}">
                        <label class="field"><span>Surovina ${i + 1}</span>
                            <select data-field="code"><option value="">— vyber —</option>${options(r.code)}</select></label>
                        <label class="field"><span>Díly</span>
                            <select data-field="parts"${pinch ? ' disabled' : ''}>${[1, 2, 3].map(n =>
                                `<option value="${n}"${r.parts === n ? ' selected' : ''}>${pinch ? 'špetka' : n}</option>`).join('')}</select></label>
                        <button type="button" class="icon-btn" data-field="remove" aria-label="Odebrat surovinu ${i + 1}"${rows.length < 2 ? ' disabled' : ''}>×</button>
                    </div>`;
                }).join('');
                $('#blend-add-row', body).disabled = rows.length >= Recipe.MAX_ITEMS;
                paintCheck();
            };
            const paintCheck = () => {
                const c = chosen();
                $('#blend-glass', body).innerHTML = glassHtml(c.map(r => r.code));
                const r = recipeOf(c.map(x => x.code), c.map(x => x.parts), 100);
                const el = $('#blend-check', body);
                el.classList.toggle('is-error', !r.ok);
                el.textContent = !c.length ? 'Vyber aspoň jednu surovinu.'
                    : r.ok ? `${r.rows.map(x => `${ingName(x.code)} ${x.pct} %`).join(', ')}. Je to ${CATEGORY_NAME[r.category]}.`
                        + (r.surcharge ? ` Příplatek za 100 g: ${kc(r.surcharge)}.` : '')
                    : recipeError(r);
            };
            paintRows();
            $('#blend-rows', body).addEventListener('change', e => {
                const row = e.target.closest('[data-row]');
                if (!row) return;
                const r = rows[Number(row.dataset.row)];
                if (e.target.dataset.field === 'code') {
                    r.code = e.target.value;
                    const ing = ingByCode(r.code);
                    if (ing && !r.touched) r.parts = ing.category === 'base' ? 3 : 1;
                    paintRows();
                } else if (e.target.dataset.field === 'parts') {
                    r.parts = Number(e.target.value);
                    r.touched = true;
                    paintCheck();
                }
                sheetDirty = true;
            });
            $('#blend-rows', body).addEventListener('click', e => {
                const btn = e.target.closest('[data-field="remove"]');
                if (!btn) return;
                rows.splice(Number(btn.closest('[data-row]').dataset.row), 1);
                paintRows();
                sheetDirty = true;
            });
            $('#blend-add-row', body).addEventListener('click', () => {
                if (rows.length >= Recipe.MAX_ITEMS) return;
                rows.push({ code: '', parts: 1 });
                paintRows();
                $$('#blend-rows select[data-field="code"]', body).pop()?.focus();
            });

            form.addEventListener('submit', async e => {
                e.preventDefault();
                formError('#blend-error', '');
                const c = chosen();
                const row = {
                    name: form.name.value.trim(),
                    desc_cs: form.desc_cs.value.trim(),
                    desc_en: form.desc_en.value.trim(),
                    desc_sk: form.desc_sk.value.trim(),
                    ingredients: c.map(x => x.code),
                    parts: c.map(x => x.parts),
                    emoji: form.emoji.value.trim() || '🍵',
                    is_preset: form.is_preset.checked,
                    active: form.active.checked,
                    photo_url: photo.url,
                    sort: parseInt(form.sort.value, 10) || 0,
                };
                if (!row.name) { formError('#blend-error', 'Vyplň název směsi.'); return; }
                if (!row.ingredients.length) { formError('#blend-error', 'Vyber aspoň jednu surovinu.'); return; }
                const check = recipeOf(row.ingredients, row.parts);
                if (!check.ok) { formError('#blend-error', recipeError(check)); return; }
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

    /* ═══ NÁKUP ════════════════════════════════════════════════════ */
    const SUP_STATUS = {
        find: ['Najít', 'pill'], contacted: ['Osloveno', 'pill-new'], samples: ['Čekám na vzorky', 'pill-paid'],
        testing: ['Testujeme', 'pill-shipped'], approved: ['Schválený', 'pill-done'], rejected: ['Zamítnutý', 'pill-cancelled'],
    };
    const MAT_STATUS = {
        research: ['Zjišťujeme', 'pill'], testing: ['Testujeme', 'pill-paid'],
        approved: ['Máme dodavatele', 'pill-shipped'], dropped: ['Nebudeme', 'pill-done'],
    };
    const SAMPLE = { none: 'Bez vzorku', requested: 'Vzorek vyžádaný', received: 'Vzorek dorazil' };
    const PURCHASE_VIEWS = [['overview', 'Přehled'], ['suppliers', 'Dodavatelé'], ['materials', 'Suroviny'], ['tasks', 'Úkoly'], ['calc', 'Kalkulačka']];
    const CALC_KEY = 'teaseyou_admin_calc';

    const today = () => new Date().toLocaleDateString('sv-SE');
    const supById = id => state.suppliers.find(x => x.id === id);
    const matById = id => state.materials.find(x => x.id === id);
    const perKg = o => (o && Number(o.price_czk) >= 0 && o.price_czk !== null && Number(o.amount_g) > 0)
        ? Number(o.price_czk) / Number(o.amount_g) * 1000 : null;
    const kcKg = n => (n == null ? '' : (Math.round(n * 10) / 10).toLocaleString('cs-CZ') + ' Kč/kg');
    const daysSince = d => d ? Math.floor((Date.parse(today()) - Date.parse(d)) / 86400000) : null;
    function bestOffer(materialId) {
        return state.offers
            .filter(o => o.material_id === materialId && perKg(o) != null && (supById(o.supplier_id) || {}).status !== 'rejected')
            .sort((a, b) => perKg(a) - perKg(b))[0] || null;
    }
    const pillHtml = (map, key) => { const [label, cls] = map[key] || [key, 'pill']; return `<span class="pill ${cls}">${esc(label)}</span>`; };
    const linkHtml = url => /^https?:\/\//i.test(url || '') ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''))}</a>` : '';
    function uses(m) {
        return [m.for_tea && 'čaj', m.for_soap && 'mýdla', m.for_balm && 'balzámy'].filter(Boolean).join(', ');
    }

    async function loadPurchase() {
        const [suppliers, materials, offers, tasks] = await Promise.all([
            db.select('purchase_suppliers', { order: 'name.asc' }),
            db.select('purchase_materials', { order: 'name.asc' }),
            db.select('purchase_offers', { order: 'created_at.asc' }),
            db.select('purchase_tasks', { order: 'created_at.desc', limit: 1000 }),
        ]);
        Object.assign(state, { suppliers, materials, offers, tasks });
    }

    function openTasks() { return state.tasks.filter(t => !t.done); }
    function urgentTasks() { return openTasks().filter(t => t.due && t.due <= today()); }

    function renderPurchase() {
        const badge = $('#count-tasks');
        const urgent = urgentTasks().length;
        badge.textContent = urgent;
        badge.hidden = !urgent;
        $('#purchase-nav').innerHTML = PURCHASE_VIEWS.map(([k, label]) =>
            `<button type="button" class="chip" data-pview="${k}" aria-pressed="${state.purchaseView === k}">${esc(label)}</button>`).join('');
        const el = $('#purchase-list');
        ({ overview: renderOverview, suppliers: renderSuppliers, materials: renderMaterials, tasks: renderTasks, calc: renderCalc })[state.purchaseView](el);
    }
    $('#purchase-nav').addEventListener('click', e => {
        const b = e.target.closest('[data-pview]');
        if (!b) return;
        state.purchaseView = b.dataset.pview;
        renderPurchase();
    });

    /* Přehled: co hoří, kdo neodpověděl, kde chybí cena */
    function renderOverview(el) {
        const urgent = urgentTasks().sort((a, b) => a.due.localeCompare(b.due));
        const stale = state.suppliers.filter(s => ['contacted', 'samples'].includes(s.status)
            && (s.last_contact == null || daysSince(s.last_contact) >= 7));
        const teaNoOffer = state.materials.filter(m => m.status !== 'dropped' && !state.offers.some(o => o.material_id === m.id));
        const counts = Object.keys(SUP_STATUS).map(k => [k, state.suppliers.filter(s => s.status === k).length]);
        const priced = state.materials.filter(m => bestOffer(m.id)).length;
        el.innerHTML = `
            <div class="kpis">
                <div class="kpi"><strong>${openTasks().length}</strong><span>otevřených úkolů</span></div>
                <div class="kpi"><strong>${state.suppliers.filter(s => s.status === 'approved').length} z ${state.suppliers.length}</strong><span>dodavatelů schválených</span></div>
                <div class="kpi"><strong>${priced} z ${state.materials.length}</strong><span>surovin má cenu</span></div>
            </div>
            <div class="pipeline">${counts.map(([k, n]) => `<button type="button" class="pipe" data-sfilter="${k}"><strong>${n}</strong><span>${esc(SUP_STATUS[k][0])}</span></button>`).join('')}</div>
            <div class="panel">
                <h3>Úkoly na dnes a po termínu</h3>
                ${urgent.length ? `<div class="task-list">${urgent.map(taskRowHtml).join('')}</div>` : '<p class="panel-note">Nic nehoří.</p>'}
            </div>
            <div class="panel">
                <h3>Komu se připomenout</h3>
                <p class="panel-note">Oslovení dodavatelé, od kterých jste týden nic neslyšeli.</p>
                ${stale.length ? `<div class="list">${stale.map(supplierRowHtml).join('')}</div>` : '<p class="panel-note">Nikomu, všichni jsou v obraze.</p>'}
            </div>
            <div class="panel">
                <h3>Suroviny bez nabídky (${teaNoOffer.length})</h3>
                <p class="panel-note">U těchhle zatím nemáte žádného dodavatele ani cenu.</p>
                <p class="tag-cloud">${teaNoOffer.map(m => `<button type="button" class="chip" data-material="${esc(m.id)}">${esc(m.name)}</button>`).join('') || 'Všechno má aspoň jednu nabídku.'}</p>
            </div>`;
        bindPurchaseRows(el);
        $$('[data-sfilter]', el).forEach(b => b.addEventListener('click', () => {
            state.supplierFilter = b.dataset.sfilter;
            state.purchaseView = 'suppliers';
            renderPurchase();
        }));
    }

    function supplierRowHtml(s) {
        const offers = state.offers.filter(o => o.supplier_id === s.id).length;
        const last = s.last_contact ? `naposledy ${formatDate(s.last_contact, false)}` : '';
        return `<button type="button" class="row${s.status === 'rejected' ? ' is-muted' : ''}" data-supplier="${esc(s.id)}">
            <span class="swatch swatch-letter" aria-hidden="true">${esc((s.name || '?').slice(0, 1).toUpperCase())}</span>
            <span class="row-main">
                <span class="row-title">${esc(s.name)}</span>
                <span class="row-sub">${esc([s.supplies, offers ? `${offers} ${offers === 1 ? 'nabídka' : offers < 5 ? 'nabídky' : 'nabídek'}` : '', last].filter(Boolean).join(', '))}</span>
            </span>
            <span class="row-side">${pillHtml(SUP_STATUS, s.status)}</span>
        </button>`;
    }

    function materialRowHtml(m) {
        const best = bestOffer(m.id);
        const n = state.offers.filter(o => o.material_id === m.id).length;
        const color = m.ingredient_code ? ingColor(m.ingredient_code) : '#d9c4a0';
        return `<button type="button" class="row${m.status === 'dropped' ? ' is-muted' : ''}" data-material="${esc(m.id)}">
            <span class="swatch" style="background:${esc(color)}" aria-hidden="true"></span>
            <span class="row-main">
                <span class="row-title">${esc(m.name)}</span>
                <span class="row-sub">${esc([uses(m), n ? `${n} ${n === 1 ? 'nabídka' : n < 5 ? 'nabídky' : 'nabídek'}` : 'bez nabídky'].filter(Boolean).join(', '))}</span>
            </span>
            <span class="row-side">${best ? `<span class="row-price">od ${esc(kcKg(perKg(best)))}</span>` : ''}${pillHtml(MAT_STATUS, m.status)}</span>
        </button>`;
    }

    function taskRowHtml(t) {
        const overdue = t.due && t.due < today() && !t.done;
        const links = [t.supplier_id && supById(t.supplier_id) && supById(t.supplier_id).name,
                       t.material_id && matById(t.material_id) && matById(t.material_id).name].filter(Boolean);
        const meta = [t.due ? (t.due === today() ? 'dnes' : formatDate(t.due, false)) : '', t.who, ...links].filter(Boolean).join(', ');
        return `<div class="task${t.done ? ' is-done' : ''}${overdue ? ' is-overdue' : ''}" data-task="${esc(t.id)}">
            <input type="checkbox" class="task-check" ${t.done ? 'checked' : ''} aria-label="Hotovo: ${esc(t.title)}">
            <button type="button" class="task-main" data-task-open="${esc(t.id)}">
                <span class="task-title">${esc(t.title)}</span>
                ${meta ? `<span class="task-meta">${overdue ? 'po termínu, ' : ''}${esc(meta)}</span>` : ''}
            </button>
        </div>`;
    }

    function bindPurchaseRows(root) {
        $$('[data-supplier]', root).forEach(b => b.addEventListener('click', () => openSupplier(supById(b.dataset.supplier))));
        $$('[data-material]', root).forEach(b => b.addEventListener('click', () => openMaterial(matById(b.dataset.material))));
        $$('[data-task-open]', root).forEach(b => b.addEventListener('click', () => openTask(state.tasks.find(t => t.id === b.dataset.taskOpen))));
        $$('.task-check', root).forEach(c => c.addEventListener('change', () => toggleTask(c.closest('[data-task]').dataset.task, c.checked)));
    }

    async function toggleTask(id, done) {
        const t = state.tasks.find(x => x.id === id);
        if (!t) return;
        try {
            Object.assign(t, await updateOne('purchase_tasks', { id: 'eq.' + id }, { done, done_at: done ? new Date().toISOString() : null }));
            if (done) toast('Hotovo: ' + t.title);
        } catch (err) { fail(err); }
        renderPurchase();
    }

    function renderSuppliers(el) {
        const counts = { all: state.suppliers.length };
        Object.keys(SUP_STATUS).forEach(k => { counts[k] = state.suppliers.filter(s => s.status === k).length; });
        const list = state.supplierFilter === 'all' ? state.suppliers : state.suppliers.filter(s => s.status === state.supplierFilter);
        el.innerHTML = `
            <div class="subhead">
                <div class="filters filters-tight">${[['all', 'Všichni'], ...Object.entries(SUP_STATUS).map(([k, v]) => [k, v[0]])].map(([k, label]) =>
                    `<button type="button" class="chip" data-supfilter="${k}" aria-pressed="${state.supplierFilter === k}">${esc(label)} (${counts[k]})</button>`).join('')}</div>
                <button type="button" class="btn btn-primary btn-small" id="new-supplier">Přidat dodavatele</button>
            </div>
            <div class="list">${list.map(supplierRowHtml).join('') || '<p class="empty">Tady zatím nikdo není.</p>'}</div>`;
        $$('[data-supfilter]', el).forEach(b => b.addEventListener('click', () => { state.supplierFilter = b.dataset.supfilter; renderPurchase(); }));
        $('#new-supplier', el).addEventListener('click', () => openSupplier(null));
        bindPurchaseRows(el);
    }

    const MAT_FILTERS = [['all', 'Vše'], ['tea', 'Čaj'], ['soap', 'Mýdla'], ['balm', 'Balzámy'], ['nooffer', 'Bez nabídky']];
    function renderMaterials(el) {
        const pass = {
            all: () => true, tea: m => m.for_tea, soap: m => m.for_soap, balm: m => m.for_balm,
            nooffer: m => !state.offers.some(o => o.material_id === m.id),
        };
        const list = state.materials.filter(pass[state.materialFilter]);
        el.innerHTML = `
            <div class="subhead">
                <div class="filters filters-tight">${MAT_FILTERS.map(([k, label]) =>
                    `<button type="button" class="chip" data-matfilter="${k}" aria-pressed="${state.materialFilter === k}">${esc(label)} (${state.materials.filter(pass[k]).length})</button>`).join('')}</div>
                <button type="button" class="btn btn-primary btn-small" id="new-material">Přidat surovinu</button>
            </div>
            <div class="list">${list.map(materialRowHtml).join('') || '<p class="empty">Nic tu není.</p>'}</div>`;
        $$('[data-matfilter]', el).forEach(b => b.addEventListener('click', () => { state.materialFilter = b.dataset.matfilter; renderPurchase(); }));
        $('#new-material', el).addEventListener('click', () => openMaterial(null));
        bindPurchaseRows(el);
    }

    function supplierOptions(selected) {
        return state.suppliers.map(s => `<option value="${esc(s.id)}"${s.id === selected ? ' selected' : ''}>${esc(s.name)}</option>`).join('');
    }
    function materialOptions(selected) {
        return state.materials.map(m => `<option value="${esc(m.id)}"${m.id === selected ? ' selected' : ''}>${esc(m.name)}</option>`).join('');
    }

    function renderTasks(el) {
        const open = openTasks().sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999'));
        const done = state.tasks.filter(t => t.done).sort((a, b) => String(b.done_at || '').localeCompare(String(a.done_at || '')));
        const who = [...new Set(state.tasks.map(t => t.who).filter(Boolean).concat(['Václav', 'Klára']))];
        el.innerHTML = `
            <form class="panel task-add" id="task-add" novalidate>
                <label class="field"><span>Nový úkol</span><input type="text" name="title" maxlength="300" placeholder="Např. poslat poptávku na levanduli" required></label>
                <div class="field-row">
                    <label class="field"><span>Termín</span><input type="date" name="due"></label>
                    <label class="field"><span>Kdo</span><input type="text" name="who" maxlength="60" list="task-who"></label>
                </div>
                <datalist id="task-who">${who.map(w => `<option value="${esc(w)}">`).join('')}</datalist>
                <div class="field-row">
                    <label class="field"><span>Dodavatel</span><select name="supplier_id"><option value="">— žádný —</option>${supplierOptions('')}</select></label>
                    <label class="field"><span>Surovina</span><select name="material_id"><option value="">— žádná —</option>${materialOptions('')}</select></label>
                </div>
                <button type="submit" class="btn btn-primary btn-small">Přidat úkol</button>
            </form>
            <div class="task-list">${open.map(taskRowHtml).join('') || '<p class="empty">Žádné otevřené úkoly.</p>'}</div>
            ${done.length ? `<details class="done-tasks"><summary>Hotové (${done.length})</summary><div class="task-list">${done.map(taskRowHtml).join('')}</div></details>` : ''}`;
        bindPurchaseRows(el);
        $('#task-add', el).addEventListener('submit', async e => {
            e.preventDefault();
            const f = e.currentTarget;
            const row = {
                title: f.title.value.trim(), due: f.due.value || null, who: f.who.value.trim(),
                supplier_id: f.supplier_id.value || null, material_id: f.material_id.value || null,
            };
            if (!row.title) { f.title.focus(); toast('Napiš, co je potřeba udělat.', true); return; }
            const btn = f.querySelector('[type=submit]');
            btn.disabled = true;
            try {
                const [saved] = await db.insert('purchase_tasks', row);
                state.tasks.unshift(saved);
                toast('Úkol přidaný.');
                renderPurchase();
                $('#task-add [name=title]') && $('#task-add [name=title]').focus();
            } catch (err) { fail(err); btn.disabled = false; }
        });
    }

    function openTask(t, onDone) {
        if (!t) return;
        const html = `
            <form id="task-form" novalidate>
                <p class="form-error" id="task-error" role="alert" hidden></p>
                <label class="field"><span>Úkol</span><input type="text" name="title" maxlength="300" required value="${esc(t.title)}"></label>
                <div class="field-row">
                    <label class="field"><span>Termín</span><input type="date" name="due" value="${esc(t.due || '')}"></label>
                    <label class="field"><span>Kdo</span><input type="text" name="who" maxlength="60" value="${esc(t.who)}"></label>
                </div>
                <div class="field-row">
                    <label class="field"><span>Dodavatel</span><select name="supplier_id"><option value="">— žádný —</option>${supplierOptions(t.supplier_id)}</select></label>
                    <label class="field"><span>Surovina</span><select name="material_id"><option value="">— žádná —</option>${materialOptions(t.material_id)}</select></label>
                </div>
                <label class="switch-row"><input type="checkbox" class="switch" name="done" ${t.done ? 'checked' : ''}><span>Hotovo</span></label>
                <div class="sheet-actions">
                    <button type="submit" class="btn btn-primary">Uložit</button>
                    <button type="button" class="btn btn-secondary" data-action="close-sheet">Zrušit</button>
                    <span class="spacer"></span>
                    <button type="button" class="btn-link" id="task-delete">Smazat</button>
                </div>
            </form>`;
        openSheet('Úkol', html, body => {
            const form = $('#task-form', body);
            form.addEventListener('submit', async e => {
                e.preventDefault();
                const done = form.done.checked;
                const row = {
                    title: form.title.value.trim(), due: form.due.value || null, who: form.who.value.trim(),
                    supplier_id: form.supplier_id.value || null, material_id: form.material_id.value || null,
                    done, done_at: done ? (t.done_at || new Date().toISOString()) : null,
                };
                if (!row.title) { formError('#task-error', 'Napiš, co je potřeba udělat.'); return; }
                try {
                    Object.assign(t, await updateOne('purchase_tasks', { id: 'eq.' + t.id }, row));
                    closeSheet(true);
                    toast('Uloženo.');
                    onDone ? onDone() : renderPurchase();
                } catch (err) { formError('#task-error', friendly(err)); }
            });
            $('#task-delete', body).addEventListener('click', async () => {
                if (!(await confirmDialog(`Smazat úkol „${t.title}“?`))) return;
                try {
                    const rows = await db.remove('purchase_tasks', { id: 'eq.' + t.id });
                    if (!rows.length) throw new db.DbError('no_rows', 0);
                    state.tasks = state.tasks.filter(x => x !== t);
                    closeSheet(true);
                    toast('Smazáno.');
                    onDone ? onDone() : renderPurchase();
                } catch (err) { formError('#task-error', friendly(err)); }
            });
        });
    }

    /* Nabídky v panelu dodavatele i suroviny */
    function offersTableHtml(offers, by) {
        if (!offers.length) return '<p class="panel-note">Zatím žádná nabídka.</p>';
        const sorted = offers.slice().sort((a, b) => (perKg(a) ?? Infinity) - (perKg(b) ?? Infinity));
        const cheapest = by === 'supplier' ? perKg(sorted[0]) : null;
        return `<div class="offer-list">${sorted.map(o => {
            const other = by === 'supplier' ? (supById(o.supplier_id) || {}).name : (matById(o.material_id) || {}).name;
            const pk = perKg(o);
            return `<button type="button" class="offer${cheapest != null && pk === cheapest && sorted.length > 1 ? ' is-best' : ''}" data-offer="${esc(o.id)}">
                <span class="offer-main"><strong>${esc(other || '?')}</strong>
                <span>${esc([o.price_czk != null && o.amount_g ? `${Number(o.price_czk).toLocaleString('cs-CZ')} Kč za ${Number(o.amount_g).toLocaleString('cs-CZ')} g` : 'bez ceny', SAMPLE[o.sample], o.rating ? `hodnocení ${o.rating}/5` : ''].filter(Boolean).join(', '))}</span>
                ${o.note ? `<span class="offer-note">${esc(o.note.length > 160 ? o.note.slice(0, 160) + '…' : o.note)}</span>` : ''}</span>
                <span class="offer-price">${esc(kcKg(pk))}</span>
            </button>`;
        }).join('')}</div>`;
    }

    function openOffer(offer, preset, reopen) {
        const isNew = !offer;
        const o = offer || { supplier_id: preset.supplier_id || '', material_id: preset.material_id || '', price_czk: null, amount_g: 1000, sample: 'none', rating: null, note: '' };
        const html = `
            <form id="offer-form" novalidate>
                <p class="form-error" id="offer-error" role="alert" hidden></p>
                <label class="field"><span>Dodavatel</span><select name="supplier_id" required><option value="">— vyber —</option>${supplierOptions(o.supplier_id)}</select></label>
                <label class="field"><span>Surovina</span><select name="material_id" required><option value="">— vyber —</option>${materialOptions(o.material_id)}</select></label>
                <div class="field-row">
                    <label class="field field-inline"><span>Cena</span><input type="number" name="price_czk" min="0" step="0.01" inputmode="decimal" value="${o.price_czk ?? ''}"><em>Kč</em></label>
                    <label class="field field-inline"><span>za</span><input type="number" name="amount_g" min="1" step="1" inputmode="numeric" value="${o.amount_g ?? ''}"><em>g</em></label>
                </div>
                <p class="help" id="offer-perkg"></p>
                <div class="field-row">
                    <label class="field"><span>Vzorek</span><select name="sample">${Object.entries(SAMPLE).map(([k, v]) => `<option value="${k}"${o.sample === k ? ' selected' : ''}>${v}</option>`).join('')}</select></label>
                    <label class="field"><span>Hodnocení</span><select name="rating"><option value="">—</option>${[1, 2, 3, 4, 5].map(n => `<option value="${n}"${o.rating === n ? ' selected' : ''}>${n} z 5</option>`).join('')}</select></label>
                </div>
                <label class="field"><span>Poznámka</span><textarea name="note" rows="3" maxlength="2000" placeholder="Jak vzorek voní a chutná, balení, platební podmínky…">${esc(o.note)}</textarea></label>
                <div class="sheet-actions">
                    <button type="submit" class="btn btn-primary">${isNew ? 'Přidat nabídku' : 'Uložit'}</button>
                    <button type="button" class="btn btn-secondary" id="offer-back">Zpět</button>
                    <span class="spacer"></span>
                    ${isNew ? '' : '<button type="button" class="btn-link" id="offer-delete">Smazat</button>'}
                </div>
            </form>`;
        openSheet(isNew ? 'Nová nabídka' : 'Nabídka', html, body => {
            const form = $('#offer-form', body);
            const paint = () => {
                const pk = perKg({ price_czk: form.price_czk.value === '' ? null : Number(form.price_czk.value), amount_g: Number(form.amount_g.value) });
                $('#offer-perkg', body).textContent = pk != null ? `To je ${kcKg(pk)}.` : '';
            };
            paint();
            form.addEventListener('input', paint);
            const back = () => { closeSheet(true); reopen && reopen(); };
            $('#offer-back', body).addEventListener('click', back);
            form.addEventListener('submit', async e => {
                e.preventDefault();
                const row = {
                    supplier_id: form.supplier_id.value, material_id: form.material_id.value,
                    price_czk: form.price_czk.value === '' ? null : Number(form.price_czk.value),
                    amount_g: form.amount_g.value === '' ? null : parseInt(form.amount_g.value, 10),
                    sample: form.sample.value, rating: form.rating.value ? Number(form.rating.value) : null,
                    note: form.note.value.trim(),
                };
                if (!row.supplier_id || !row.material_id) { formError('#offer-error', 'Vyber dodavatele i surovinu.'); return; }
                try {
                    if (isNew) state.offers.push((await db.insert('purchase_offers', row))[0]);
                    else Object.assign(offer, await updateOne('purchase_offers', { id: 'eq.' + offer.id }, row));
                    toast(isNew ? 'Nabídka přidaná.' : 'Uloženo.');
                    back();
                } catch (err) { formError('#offer-error', friendly(err)); }
            });
            const del = $('#offer-delete', body);
            if (del) del.addEventListener('click', async () => {
                if (!(await confirmDialog('Smazat tuhle nabídku?'))) return;
                try {
                    const rows = await db.remove('purchase_offers', { id: 'eq.' + offer.id });
                    if (!rows.length) throw new db.DbError('no_rows', 0);
                    state.offers = state.offers.filter(x => x !== offer);
                    toast('Smazáno.');
                    back();
                } catch (err) { formError('#offer-error', friendly(err)); }
            });
        });
    }

    function linkedTasksHtml(filter) {
        const list = state.tasks.filter(filter).sort((a, b) => Number(a.done) - Number(b.done) || (a.due || '9999').localeCompare(b.due || '9999'));
        return list.length ? `<div class="task-list">${list.map(taskRowHtml).join('')}</div>` : '<p class="panel-note">Žádné úkoly.</p>';
    }

    function openSupplier(sup) {
        const isNew = !sup;
        const s = sup || { name: '', status: 'find', website: '', contact: '', email: '', phone: '', supplies: '', min_order: '', lead_time: '', certificates: '', notes: '', last_contact: null };
        const offers = isNew ? [] : state.offers.filter(o => o.supplier_id === s.id);
        const html = `
            <form id="supplier-form" novalidate>
                <p class="form-error" id="supplier-error" role="alert" hidden></p>
                <label class="field"><span>Název</span><input type="text" name="name" maxlength="120" required value="${esc(s.name)}"></label>
                <div class="field-row">
                    <label class="field"><span>Stav</span><select name="status">${Object.entries(SUP_STATUS).map(([k, v]) => `<option value="${k}"${s.status === k ? ' selected' : ''}>${v[0]}</option>`).join('')}</select></label>
                    <label class="field"><span>Naposledy v kontaktu</span><input type="date" name="last_contact" value="${esc(s.last_contact || '')}"></label>
                </div>
                <label class="field"><span>Co dodává</span><input type="text" name="supplies" maxlength="500" value="${esc(s.supplies)}"></label>
                <label class="field"><span>Web</span><input type="url" name="website" maxlength="300" placeholder="https://" value="${esc(s.website)}">${s.website ? `<small>${linkHtml(s.website)}</small>` : ''}</label>
                <div class="field-row">
                    <label class="field"><span>Kontaktní osoba</span><input type="text" name="contact" maxlength="200" value="${esc(s.contact)}"></label>
                    <label class="field"><span>Telefon</span><input type="tel" name="phone" maxlength="50" value="${esc(s.phone)}"></label>
                </div>
                <label class="field"><span>E-mail</span><input type="email" name="email" maxlength="200" value="${esc(s.email)}">${s.email ? `<small><a href="mailto:${esc(s.email)}">Napsat e-mail</a></small>` : ''}</label>
                <div class="field-row">
                    <label class="field"><span>Minimální objednávka</span><input type="text" name="min_order" maxlength="200" value="${esc(s.min_order)}"></label>
                    <label class="field"><span>Dodací lhůta</span><input type="text" name="lead_time" maxlength="200" value="${esc(s.lead_time)}"></label>
                </div>
                <label class="field"><span>Certifikáty</span><input type="text" name="certificates" maxlength="300" placeholder="Bio, potravinářská kvalita, atesty…" value="${esc(s.certificates)}"></label>
                <label class="field"><span>Poznámky</span><textarea name="notes" rows="5" maxlength="5000">${esc(s.notes)}</textarea></label>
                ${isNew ? '' : `
                <section class="sheet-section">
                    <div class="panel-head"><h3>Nabídky</h3><button type="button" class="btn btn-secondary btn-small" id="sup-add-offer">Přidat nabídku</button></div>
                    ${offersTableHtml(offers, 'material')}
                </section>
                <section class="sheet-section">
                    <h3>Úkoly</h3>
                    ${linkedTasksHtml(t => t.supplier_id === s.id)}
                </section>`}
                <div class="sheet-actions">
                    <button type="submit" class="btn btn-primary">${isNew ? 'Přidat dodavatele' : 'Uložit'}</button>
                    <button type="button" class="btn btn-secondary" data-action="close-sheet">Zavřít</button>
                    <span class="spacer"></span>
                    ${isNew ? '' : '<button type="button" class="btn-link" id="supplier-delete">Smazat</button>'}
                </div>
            </form>`;
        openSheet(isNew ? 'Nový dodavatel' : s.name, html, body => {
            const form = $('#supplier-form', body);
            const reopen = () => { renderPurchase(); openSupplier(supById(s.id)); };
            const read = () => ({
                name: form.name.value.trim(), status: form.status.value, last_contact: form.last_contact.value || null,
                supplies: form.supplies.value.trim(), website: form.website.value.trim(), contact: form.contact.value.trim(),
                phone: form.phone.value.trim(), email: form.email.value.trim(), min_order: form.min_order.value.trim(),
                lead_time: form.lead_time.value.trim(), certificates: form.certificates.value.trim(), notes: form.notes.value.trim(),
            });
            form.addEventListener('submit', async e => {
                e.preventDefault();
                const row = read();
                if (!row.name) { formError('#supplier-error', 'Vyplň název.'); return; }
                if (row.website && !/^https?:\/\//i.test(row.website)) row.website = 'https://' + row.website;
                try {
                    if (isNew) state.suppliers.push((await db.insert('purchase_suppliers', row))[0]);
                    else Object.assign(sup, await updateOne('purchase_suppliers', { id: 'eq.' + s.id }, row));
                    state.suppliers.sort((a, b) => a.name.localeCompare(b.name, 'cs'));
                    closeSheet(true);
                    toast(isNew ? `Přidáno: ${row.name}` : `Uloženo: ${row.name}`);
                    renderPurchase();
                } catch (err) { formError('#supplier-error', friendly(err)); }
            });
            const addOffer = $('#sup-add-offer', body);
            if (addOffer) addOffer.addEventListener('click', () => { closeSheet(true); openOffer(null, { supplier_id: s.id }, reopen); });
            $$('[data-offer]', body).forEach(b => b.addEventListener('click', () => {
                closeSheet(true);
                openOffer(state.offers.find(o => o.id === b.dataset.offer), {}, reopen);
            }));
            $$('.task-check', body).forEach(c => c.addEventListener('change', () => toggleTask(c.closest('[data-task]').dataset.task, c.checked)));
            $$('[data-task-open]', body).forEach(b => b.addEventListener('click', () => {
                closeSheet(true);
                openTask(state.tasks.find(t => t.id === b.dataset.taskOpen), reopen);
            }));
            const del = $('#supplier-delete', body);
            if (del) del.addEventListener('click', async () => {
                if (!(await confirmDialog(`Smazat dodavatele ${s.name}? Smažou se i jeho nabídky (${offers.length}). 30 dní půjde všechno vrátit z koše.`, 'Smazat',
                    offers.length ? s.name : undefined))) return;
                try {
                    const rows = await db.remove('purchase_suppliers', { id: 'eq.' + s.id });
                    if (!rows.length) throw new db.DbError('no_rows', 0);
                    state.suppliers = state.suppliers.filter(x => x.id !== s.id);
                    state.offers = state.offers.filter(o => o.supplier_id !== s.id);
                    state.tasks.forEach(t => { if (t.supplier_id === s.id) t.supplier_id = null; });
                    closeSheet(true);
                    toast(`Smazáno: ${s.name}`);
                    renderPurchase();
                } catch (err) { formError('#supplier-error', friendly(err)); }
            });
        });
    }

    function openMaterial(mat) {
        const isNew = !mat;
        const m = mat || { name: '', ingredient_code: null, for_tea: false, for_soap: false, for_balm: false, status: 'research', notes: '', sources: '' };
        const offers = isNew ? [] : state.offers.filter(o => o.material_id === m.id);
        const ing = m.ingredient_code ? ingByCode(m.ingredient_code) : null;
        const html = `
            <form id="material-form" novalidate>
                <p class="form-error" id="material-error" role="alert" hidden></p>
                <label class="field"><span>Název</span><input type="text" name="name" maxlength="120" required value="${esc(m.name)}"></label>
                ${ing ? `<p class="help">Na webu jako ingredience <strong>${esc(ing.name_cs)}</strong> (${esc(CATEGORY[ing.category] || '')}).</p>` : ''}
                <label class="field"><span>Stav</span><select name="status">${Object.entries(MAT_STATUS).map(([k, v]) => `<option value="${k}"${m.status === k ? ' selected' : ''}>${v[0]}</option>`).join('')}</select></label>
                <div class="check-row">
                    <label><input type="checkbox" name="for_tea" ${m.for_tea ? 'checked' : ''}> Do čaje</label>
                    <label><input type="checkbox" name="for_soap" ${m.for_soap ? 'checked' : ''}> Do mýdel</label>
                    <label><input type="checkbox" name="for_balm" ${m.for_balm ? 'checked' : ''}> Do balzámů</label>
                </div>
                <label class="field"><span>Poznámky</span><textarea name="notes" rows="8" maxlength="10000" placeholder="Chuť, vůně, jak se připravuje, kolik dávat do směsi, bezpečnost a alergeny, co jste zjistili…">${esc(m.notes)}</textarea></label>
                <label class="field"><span>Zdroje</span><textarea name="sources" rows="3" maxlength="3000" placeholder="Odkazy na články, knihy, technické listy">${esc(m.sources)}</textarea></label>
                ${isNew ? '' : `
                <section class="sheet-section">
                    <div class="panel-head"><h3>Nabídky</h3><button type="button" class="btn btn-secondary btn-small" id="mat-add-offer">Přidat nabídku</button></div>
                    <p class="panel-note">Seřazené od nejlevnější za kilo.</p>
                    ${offersTableHtml(offers, 'supplier')}
                </section>
                <section class="sheet-section">
                    <h3>Úkoly</h3>
                    ${linkedTasksHtml(t => t.material_id === m.id)}
                </section>`}
                <div class="sheet-actions">
                    <button type="submit" class="btn btn-primary">${isNew ? 'Přidat surovinu' : 'Uložit'}</button>
                    <button type="button" class="btn btn-secondary" data-action="close-sheet">Zavřít</button>
                    <span class="spacer"></span>
                    ${isNew ? '' : '<button type="button" class="btn-link" id="material-delete">Smazat</button>'}
                </div>
            </form>`;
        openSheet(isNew ? 'Nová surovina' : m.name, html, body => {
            const form = $('#material-form', body);
            const reopen = () => { renderPurchase(); openMaterial(matById(m.id)); };
            form.addEventListener('submit', async e => {
                e.preventDefault();
                const row = {
                    name: form.name.value.trim(), status: form.status.value,
                    for_tea: form.for_tea.checked, for_soap: form.for_soap.checked, for_balm: form.for_balm.checked,
                    notes: form.notes.value.trim(), sources: form.sources.value.trim(),
                };
                if (!row.name) { formError('#material-error', 'Vyplň název.'); return; }
                try {
                    if (isNew) state.materials.push((await db.insert('purchase_materials', row))[0]);
                    else Object.assign(mat, await updateOne('purchase_materials', { id: 'eq.' + m.id }, row));
                    state.materials.sort((a, b) => a.name.localeCompare(b.name, 'cs'));
                    closeSheet(true);
                    toast(isNew ? `Přidáno: ${row.name}` : `Uloženo: ${row.name}`);
                    renderPurchase();
                } catch (err) { formError('#material-error', friendly(err)); }
            });
            const addOffer = $('#mat-add-offer', body);
            if (addOffer) addOffer.addEventListener('click', () => { closeSheet(true); openOffer(null, { material_id: m.id }, reopen); });
            $$('[data-offer]', body).forEach(b => b.addEventListener('click', () => {
                closeSheet(true);
                openOffer(state.offers.find(o => o.id === b.dataset.offer), {}, reopen);
            }));
            $$('.task-check', body).forEach(c => c.addEventListener('change', () => toggleTask(c.closest('[data-task]').dataset.task, c.checked)));
            $$('[data-task-open]', body).forEach(b => b.addEventListener('click', () => {
                closeSheet(true);
                openTask(state.tasks.find(t => t.id === b.dataset.taskOpen), reopen);
            }));
            const del = $('#material-delete', body);
            if (del) del.addEventListener('click', async () => {
                if (!(await confirmDialog(`Smazat surovinu ${m.name}? Smažou se i nabídky (${offers.length}). Na webu se nic nezmění. 30 dní půjde všechno vrátit z koše.`, 'Smazat',
                    offers.length ? m.name : undefined))) return;
                try {
                    const rows = await db.remove('purchase_materials', { id: 'eq.' + m.id });
                    if (!rows.length) throw new db.DbError('no_rows', 0);
                    state.materials = state.materials.filter(x => x.id !== m.id);
                    state.offers = state.offers.filter(o => o.material_id !== m.id);
                    state.tasks.forEach(t => { if (t.material_id === m.id) t.material_id = null; });
                    closeSheet(true);
                    toast(`Smazáno: ${m.name}`);
                    renderPurchase();
                } catch (err) { formError('#material-error', friendly(err)); }
            });
        });
    }

    /* Kalkulačka: kolik stojí suroviny na jeden sáček a kolik zbyde.
       Stejná receptura jako na webu: až 5 surovin, díly 1–3, špetka 4 %. */
    function renderCalc(el) {
        let saved = {};
        try { saved = JSON.parse(localStorage.getItem(CALC_KEY) || '{}') || {}; } catch (_) {}
        const mats = state.materials.filter(m => m.ingredient_code && ingByCode(m.ingredient_code));
        const catOf = m => (ingByCode(m.ingredient_code) || {}).category;
        let rows = Array.isArray(saved.rows) ? saved.rows.filter(r => mats.some(m => m.id === r.m)).slice(0, Recipe.MAX_ITEMS) : [];
        if (!rows.length) {
            rows = ['base', 'flavor', 'extra'].map((cat, i) => ({ m: (mats.find(m => catOf(m) === cat) || {}).id, parts: i ? 1 : 3 }))
                .filter(r => r.m);
        }
        const tiers = state.prices.filter(p => p.active);
        const weight = tiers.some(p => p.weight_g === saved.weight) ? saved.weight : ((tiers.find(p => p.weight_g === 100) || tiers[0] || {}).weight_g);
        const options = sel => ['base', 'flavor', 'extra'].map(cat => `<optgroup label="${CATEGORY_GROUP[cat]}">${mats.filter(m => catOf(m) === cat)
            .map(m => `<option value="${esc(m.id)}"${m.id === sel ? ' selected' : ''}>${esc(m.name)}${bestOffer(m.id) ? '' : ' (bez ceny)'}</option>`).join('')}</optgroup>`).join('');
        el.innerHTML = `
            <form class="panel calc" id="calc-form" novalidate>
                <h3>Kolik stojí jeden sáček</h3>
                <p class="panel-note">Počítá s nejlevnější nabídkou u každé suroviny (bez zamítnutých dodavatelů). Podíly jako na webu: díly 1–3, špetka 4 %.</p>
                <div class="calc-rows" id="calc-rows"></div>
                <button type="button" class="btn btn-secondary btn-small" id="calc-add">Přidat surovinu</button>
                <div class="field-row">
                    <label class="field"><span>Velikost</span><select name="weight">${tiers.map(p => `<option value="${p.weight_g}"${p.weight_g === weight ? ' selected' : ''}>${p.weight_g} g (prodej ${kc(p.price_czk)})</option>`).join('')}</select></label>
                    <label class="field field-inline"><span>Sáček a etiketa</span><input type="number" name="pack" min="0" step="0.1" inputmode="decimal" value="${saved.pack ?? ''}" placeholder="0"><em>Kč</em></label>
                </div>
                <div id="calc-out" aria-live="polite"></div>
            </form>`;
        const form = $('#calc-form', el);
        const paintRows = () => {
            $('#calc-rows', el).innerHTML = rows.map((r, i) => `
                <div class="blend-row" data-row="${i}">
                    <label class="field"><span>Surovina ${i + 1}</span><select data-field="m">${options(r.m)}</select></label>
                    <label class="field"><span>Díly</span><select data-field="parts">${[1, 2, 3].map(n => `<option value="${n}"${r.parts === n ? ' selected' : ''}>${n}</option>`).join('')}</select></label>
                    <button type="button" class="icon-btn" data-field="remove" aria-label="Odebrat surovinu ${i + 1}"${rows.length < 2 ? ' disabled' : ''}>×</button>
                </div>`).join('');
            $('#calc-add', el).disabled = rows.length >= Recipe.MAX_ITEMS || !mats.length;
        };
        const paint = () => {
            const v = { rows: rows.map(r => ({ m: r.m, parts: r.parts })), weight: Number(form.weight.value) || 0,
                        pack: form.pack.value === '' ? '' : Number(form.pack.value) };
            try { localStorage.setItem(CALC_KEY, JSON.stringify(v)); } catch (_) {}
            const tier = state.prices.find(p => p.weight_g === v.weight);
            const chosen = rows.map(r => matById(r.m)).filter(Boolean);
            const recipe = recipeOf(chosen.map(m => m.ingredient_code), rows.filter(r => matById(r.m)).map(r => r.parts), v.weight);
            const lines = chosen.map((m, i) => {
                const row = recipe.rows[i] || { pct: 0, grams: 0 };
                const pk = perKg(bestOffer(m.id));
                return { name: m.name, pct: row.pct, grams: row.grams, cost: pk != null ? row.grams / 1000 * pk : null };
            });
            const missing = lines.filter(l => l.cost == null).map(l => l.name);
            const ingredients = lines.reduce((a, l) => a + (l.cost || 0), 0);
            const cost = ingredients + (Number(v.pack) || 0);
            const price = tier ? tier.price_czk + recipe.surcharge : 0;
            const margin = price - cost;
            const r1 = n => (Math.round(n * 10) / 10).toLocaleString('cs-CZ');
            $('#calc-out', el).innerHTML = `
                ${recipe.ok || !lines.length ? '' : `<p class="form-error">${esc(recipeError(recipe))} Na webu by tahle směs nešla objednat.</p>`}
                <div class="calc-table">
                    ${lines.map(l => `<div><span>${esc(l.name)}, ${l.pct} % = ${r1(l.grams)} g</span><span>${l.cost == null ? 'chybí cena' : r1(l.cost) + ' Kč'}</span></div>`).join('')}
                    <div><span>Sáček a etiketa</span><span>${r1(Number(v.pack) || 0)} Kč</span></div>
                    <div class="calc-sum"><span>Náklady celkem</span><span>${missing.length ? 'aspoň ' : ''}${r1(cost)} Kč</span></div>
                    <div><span>Prodejní cena${recipe.surcharge ? ` (vč. příplatku ${kc(recipe.surcharge)})` : ''}</span><span>${kc(price)}</span></div>
                    ${missing.length
                        ? '<div class="calc-margin is-unknown"><span>Zbyde</span><span>doplň ceny</span></div>'
                        : `<div class="calc-margin${margin < 0 ? ' is-neg' : ''}"><span>Zbyde</span><span>${r1(margin)} Kč${price ? ` (${Math.round(margin / price * 100)} %)` : ''}</span></div>`}
                </div>
                ${missing.length ? `<p class="help">Bez ceny: ${esc(missing.join(', '))}. Přidej nabídku v části Suroviny.</p>` : ''}
                <p class="help">Prodejní cena je s DPH. Jestli budeš plátce DPH, počítej s cenou bez daně. Doprava a poplatky za platbu tu nejsou.</p>`;
        };
        paintRows();
        $('#calc-rows', el).addEventListener('change', e => {
            const row = e.target.closest('[data-row]');
            if (!row) return;
            const r = rows[Number(row.dataset.row)];
            if (e.target.dataset.field === 'm') r.m = e.target.value;
            if (e.target.dataset.field === 'parts') r.parts = Number(e.target.value);
        });
        $('#calc-rows', el).addEventListener('click', e => {
            const btn = e.target.closest('[data-field="remove"]');
            if (!btn) return;
            rows.splice(Number(btn.closest('[data-row]').dataset.row), 1);
            paintRows(); paint();
        });
        $('#calc-add', el).addEventListener('click', () => {
            if (rows.length >= Recipe.MAX_ITEMS || !mats.length) return;
            const used = new Set(rows.map(r => r.m));
            rows.push({ m: (mats.find(m => !used.has(m.id)) || mats[0]).id, parts: 1 });
            paintRows(); paint();
        });
        form.addEventListener('input', paint);
        form.addEventListener('change', paint);
        paint();
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
                    <span class="row-sub">${esc(name(w.product_id))}, ${esc(formatDate(w.created_at, false))}${({ en: ', anglicky', sk: ', slovensky' })[w.lang] || ''}</span>
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

    /* ═══ PROSTŘEDÍ, ZÁLOHY, KOŠ ════════════════════════════════════ */
    // Prostředí určuje config.js (ENVIRONMENT), ne adresa v prohlížeči.
    function showEnvironment() {
        const env = (window.TEASEYOU_CONFIG && window.TEASEYOU_CONFIG.ENVIRONMENT) || 'production';
        const badge = $('#env-badge');
        badge.hidden = false;
        badge.textContent = env === 'production' ? 'Ostrý provoz' : 'Testovací prostředí';
        badge.className = 'env-badge ' + (env === 'production' ? 'env-prod' : 'env-test');
        badge.title = env === 'production' ? 'Pracuješ se skutečnými daty zákazníků.' : 'Testovací databáze, žádná skutečná data.';
    }

    const BACKUP_MAX_AGE_DAYS = 7;
    function renderBackupAlert() {
        const el = $('#backup-alert');
        if (!el || !state.settings || !('last_backup_at' in state.settings)) { if (el) el.hidden = true; return; }
        const last = state.settings.last_backup_at ? new Date(state.settings.last_backup_at) : null;
        const days = last ? Math.floor((Date.now() - last.getTime()) / 864e5) : null;
        el.hidden = days !== null && days < BACKUP_MAX_AGE_DAYS;
        $('#backup-alert-text').textContent = days === null
            ? 'Zatím nemáš žádnou zálohu. Stáhni si ji, ať o data nepřijdeš.'
            : `Poslední záloha je stará ${days} ${days < 5 ? 'dny' : 'dní'}. Stáhni novou.`;
        const lastEl = $('#backup-last');
        if (lastEl) lastEl.textContent = last ? `Poslední záloha: ${formatDate(last.toISOString())}` : 'Zatím žádná záloha.';
    }

    const blobToBase64 = blob => new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result).split(',')[1] || '');
        r.onerror = () => reject(r.error);
        r.readAsDataURL(blob);
    });
    const base64ToBlob = (b64, type) => {
        const bin = atob(b64);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        return new Blob([bytes], { type: type || 'application/octet-stream' });
    };
    const photoPrefix = () => db.publicUrl(PHOTO_BUCKET, '');
    function photoPathsIn(tables) {
        const prefix = photoPrefix();
        const urls = new Set();
        ['ingredients', 'blends', 'craft_products'].forEach(t => (tables[t] || []).forEach(r => {
            if (r.photo_url && r.photo_url.startsWith(prefix)) urls.add(r.photo_url);
        }));
        return [...urls].map(u => ({ url: u, path: decodeURIComponent(u.slice(prefix.length)) }));
    }

    async function downloadBackup() {
        const btns = $$('[data-action="download-backup"]');
        const progress = $('#backup-progress');
        btns.forEach(b => { b.disabled = true; });
        try {
            if (progress) progress.textContent = 'Stahuji data…';
            const backup = await db.rpc('export_backup');
            const photos = photoPathsIn(backup.tables || {});
            backup.photos = {};
            let missing = 0;
            for (let i = 0; i < photos.length; i++) {
                if (progress) progress.textContent = `Stahuji fotky ${i + 1} / ${photos.length}…`;
                try {
                    const res = await fetch(photos[i].url, { cache: 'no-store' });
                    if (!res.ok) throw new Error(res.status);
                    const blob = await res.blob();
                    backup.photos[photos[i].path] = { type: blob.type, data: await blobToBase64(blob) };
                } catch (_) { missing++; }
            }
            const blob = new Blob([JSON.stringify(backup)], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `tease-you-zaloha-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
            if (state.settings) state.settings.last_backup_at = backup.created_at;
            renderBackupAlert();
            const n = Object.values(backup.tables || {}).reduce((sum, rows) => sum + rows.length, 0);
            if (progress) progress.textContent = `Hotovo: ${n} záznamů a ${photos.length - missing} fotek.${missing ? ` ${missing} fotek se stáhnout nepodařilo.` : ''}`;
            toast(missing ? `Záloha je stažená, ale ${missing} fotek chybí.` : 'Záloha je stažená.', !!missing);
        } catch (err) {
            if (progress) progress.textContent = '';
            fail(err);
        } finally {
            btns.forEach(b => { b.disabled = false; });
        }
    }
    document.addEventListener('click', e => {
        if (e.target.closest('[data-action="download-backup"]')) downloadBackup();
    });

    const TABLE_LABEL = {
        settings: 'Nastavení', ingredients: 'Ingredience', blends: 'Směsi', price_tiers: 'Ceník',
        shipping_methods: 'Doprava', promo_codes: 'Slevové kódy', craft_products: 'Mýdla a balzámy',
        craft_waitlist: 'Zájemci', purchase_suppliers: 'Dodavatelé', purchase_materials: 'Suroviny',
        purchase_offers: 'Nabídky', purchase_tasks: 'Úkoly', orders: 'Objednávky',
        withdrawals: 'Odstoupení', privacy_requests: 'Žádosti o údaje', reviews: 'Recenze',
    };
    let restoreData = null;

    let previewSeq = 0;
    async function previewRestore() {
        const out = $('#restore-preview');
        const run = $('#restore-run');
        const data = restoreData;
        const seq = ++previewSeq;
        run.disabled = true;
        if (!data) { out.innerHTML = ''; return; }
        out.innerHTML = '<p class="loading">Počítám, co by se stalo…</p>';
        try {
            const overwrite = $('#restore-overwrite').checked;
            const res = await db.rpc('restore_backup', { p: data, p_overwrite: overwrite, p_dry_run: true });
            // Mezitím vybral jiný soubor nebo přepnul volbu: tenhle náhled už neplatí.
            if (seq !== previewSeq || data !== restoreData) return;
            const rows = Object.entries(res.tables || {}).sort((a, b) => (TABLE_LABEL[a[0]] || a[0]).localeCompare(TABLE_LABEL[b[0]] || b[0], 'cs'));
            const changes = rows.reduce((n, [, v]) => n + v.added + v.overwritten + v.removed, 0);
            const photos = Object.keys(data.photos || {}).length;
            out.innerHTML = `
                <p class="help">Záloha z ${esc(formatDate(data.created_at))}. Zatím se nic nezměnilo, tohle je jen náhled.</p>
                <table class="restore-table">
                    <thead><tr><th>Co</th><th>V záloze</th><th>Přibude</th><th>Přepíše se</th><th>Do koše</th><th>Beze změny</th><th>Nejde</th></tr></thead>
                    <tbody>${rows.map(([t, v]) => `<tr><td>${esc(TABLE_LABEL[t] || t)}</td><td>${v.in_backup}</td><td>${v.added}</td><td>${v.overwritten}</td>
                        <td${v.removed ? ' class="warn"' : ''}>${v.removed}</td><td>${v.kept}</td><td${v.failed ? ' class="warn"' : ''}>${v.failed}</td></tr>`).join('')}</tbody>
                </table>
                <p class="help">${photos} fotek v záloze: doplní se ty, které v úložišti chybí.${changes ? '' : ' V databázi by se nic nezměnilo.'}</p>`;
            run.disabled = !changes && !photos;
            run.dataset.changes = String(changes);
        } catch (err) {
            if (seq !== previewSeq) return;
            out.innerHTML = '';
            fail(err);
        }
    }

    // GitHub dává noční zálohu jako .zip s jedním souborem. Vytáhneme z něj
    // první .json (uložený bez komprese, nebo deflate).
    async function jsonFromZip(buf) {
        const v = new DataView(buf);
        let eocd = -1;
        for (let i = buf.byteLength - 22; i >= Math.max(0, buf.byteLength - 65557); i--) {
            if (v.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
        }
        if (eocd < 0) throw new Error('zip');
        let p = v.getUint32(eocd + 16, true);
        const count = v.getUint16(eocd + 10, true);
        for (let n = 0; n < count; n++) {
            if (v.getUint32(p, true) !== 0x02014b50) throw new Error('zip');
            const method = v.getUint16(p + 10, true);
            const size = v.getUint32(p + 20, true);
            const nameLen = v.getUint16(p + 28, true), extraLen = v.getUint16(p + 30, true), commentLen = v.getUint16(p + 32, true);
            const local = v.getUint32(p + 42, true);
            const name = new TextDecoder().decode(new Uint8Array(buf, p + 46, nameLen));
            p += 46 + nameLen + extraLen + commentLen;
            if (!/\.json$/i.test(name)) continue;
            if (v.getUint32(local, true) !== 0x04034b50) throw new Error('zip');
            const start = local + 30 + v.getUint16(local + 26, true) + v.getUint16(local + 28, true);
            const data = new Uint8Array(buf, start, size);
            if (method === 0) return new TextDecoder().decode(data);
            if (method === 8) return new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).text();
            throw new Error('zip');
        }
        throw new Error('zip');
    }

    // Noční záloha: gzip a AES-GCM, klíč z hesla přes PBKDF2 (.github/scripts/zaloha.py).
    async function decryptBackup(env, password) {
        const k = env.kdf || {}, c = env.cipher || {};
        if (k.name !== 'PBKDF2' || k.hash !== 'SHA-256' || !Number.isInteger(k.iterations) || k.iterations < 100000 || k.iterations > 10000000
            || c.name !== 'AES-GCM' || env.compression !== 'gzip') throw new Error('format');
        const bytes = async b64 => new Uint8Array(await (await fetch('data:application/octet-stream;base64,' + b64)).arrayBuffer());
        const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
        const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt: await bytes(k.salt), iterations: k.iterations },
            base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
        let plain;
        try {
            plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: await bytes(c.iv) }, key, await bytes(env.data));
        } catch (_) { throw new Error('password'); }
        const text = await new Response(new Blob([plain]).stream().pipeThrough(new DecompressionStream('gzip'))).text();
        return JSON.parse(text);
    }

    let encryptedBackup = null;
    function acceptBackup(data) {
        if (!data || data.format !== 'teaseyou-backup' || !data.tables) throw new Error('format');
        restoreData = data;
    }

    $('#restore-file').addEventListener('change', async e => {
        const file = e.target.files && e.target.files[0];
        restoreData = null;
        encryptedBackup = null;
        $('#restore-unlock').hidden = true;
        $('#restore-unlock-status').textContent = '';
        if (file) {
            try {
                const buf = await file.arrayBuffer();
                const isZip = buf.byteLength > 4 && new DataView(buf).getUint32(0, true) === 0x04034b50;
                const data = JSON.parse(isZip ? await jsonFromZip(buf) : new TextDecoder().decode(buf));
                if (data && data.format === 'teaseyou-backup-encrypted') {
                    encryptedBackup = data;
                    $('#restore-password').value = '';
                    $('#restore-unlock').hidden = false;
                    $('#restore-password').focus();
                } else {
                    acceptBackup(data);
                }
            } catch (_) {
                toast('Tohle není záloha z administrace Tease you.', true);
            }
        }
        previewRestore();
    });

    $('#restore-unlock').addEventListener('submit', async e => {
        e.preventDefault();
        if (!encryptedBackup) return;
        const btn = $('#restore-unlock-btn');
        const status = $('#restore-unlock-status');
        btn.disabled = true;
        status.textContent = 'Odemykám…';
        try {
            acceptBackup(await decryptBackup(encryptedBackup, $('#restore-password').value));
            $('#restore-password').value = '';
            $('#restore-unlock').hidden = true;
            status.textContent = '';
            encryptedBackup = null;
            previewRestore();
        } catch (err) {
            status.textContent = '';
            toast(err.message === 'password' ? 'Heslo nesedí.' : 'Zálohu se nepodařilo otevřít, soubor je asi poškozený.', true);
        } finally {
            btn.disabled = false;
        }
    });
    $('#restore-overwrite').addEventListener('change', previewRestore);

    $('#restore-run').addEventListener('click', async () => {
        if (!restoreData) return;
        const overwrite = $('#restore-overwrite').checked;
        const text = overwrite
            ? 'Katalog, nastavení, mýdla a nákup budou přesně jako v záloze. Co v záloze není, půjde do koše. Objednávky se jen doplní.'
            : 'Doplní se záznamy, které v databázi chybí. Nic se nepřepíše ani nesmaže.';
        if (!(await confirmDialog(text, 'Obnovit', 'OBNOVIT'))) return;
        const btn = $('#restore-run');
        btn.disabled = true;
        try {
            const res = await db.rpc('restore_backup', { p: restoreData, p_overwrite: overwrite, p_dry_run: false });
            // Fotky, které v úložišti chybí, nahrajeme zpátky.
            let restored = 0, failedPhotos = 0;
            for (const [path, photo] of Object.entries(restoreData.photos || {})) {
                try {
                    const head = await fetch(db.publicUrl(PHOTO_BUCKET, path), { cache: 'no-store' });
                    if (head.ok) continue;
                    await db.upload(PHOTO_BUCKET, path, base64ToBlob(photo.data, photo.type), photo.type);
                    restored++;
                } catch (_) { failedPhotos++; }
            }
            const t = Object.values(res.tables || {});
            const sum = k => t.reduce((n, v) => n + (v[k] || 0), 0);
            toast(`Obnoveno: přibylo ${sum('added')}, přepsáno ${sum('overwritten')}, do koše ${sum('removed')}, fotek ${restored}.`
                + (sum('failed') || failedPhotos ? ` Nepovedlo se ${sum('failed') + failedPhotos}.` : ''), !!(sum('failed') || failedPhotos));
            state.catalogLoaded = false;
            await loadCatalog(true);
            state.trash = await db.select('deleted_rows', { order: 'deleted_at.desc', limit: 500 });
            renderBackups();
            previewRestore();
        } catch (err) { fail(err); btn.disabled = false; }
    });

    function trashLabel(r) {
        const d = r.data || {};
        return d.name_cs || d.name || d.title || d.code || d.email || (d.weight_g ? d.weight_g + ' g' : '') || r.row_key;
    }
    function renderBackups() {
        renderBackupAlert();
        const el = $('#trash-list');
        const batches = new Map();
        (state.trash || []).forEach(r => {
            if (!batches.has(r.batch)) batches.set(r.batch, []);
            batches.get(r.batch).push(r);
        });
        if (!batches.size) {
            el.innerHTML = '<p class="empty">Koš je prázdný.</p>';
            return;
        }
        el.innerHTML = [...batches.entries()].map(([batch, rows]) => {
            const main = rows.slice().sort((a, b) => a.id - b.id)[0];
            const open = rows.filter(r => !r.restored_at).length;
            const more = rows.length - 1;
            return `<div class="table-row trash-row" data-batch="${esc(batch)}">
                <span class="row-main">
                    <span class="row-title">${esc(TABLE_LABEL[main.table_name] || main.table_name)}: ${esc(trashLabel(main))}${more ? ` <span class="row-sub-inline">a ${more} dalších</span>` : ''}</span>
                    <span class="row-sub">smazáno ${esc(formatDate(main.deleted_at))}${main.deleted_by_email ? ', ' + esc(main.deleted_by_email) : ''}${open ? '' : ', už vráceno'}</span>
                </span>
                ${open ? '<button type="button" class="btn btn-secondary btn-small" data-field="restore">Vrátit</button>' : ''}
            </div>`;
        }).join('');
        $$('#trash-list .trash-row').forEach(row => {
            const btn = $('[data-field=restore]', row);
            if (!btn) return;
            btn.addEventListener('click', async () => {
                btn.disabled = true;
                try {
                    const res = await db.rpc('restore_deleted', { p_batch: Number(row.dataset.batch) });
                    toast(res.skipped ? `Vráceno ${res.restored}, ${res.skipped} nešlo (už existuje).` : `Vráceno: ${res.restored}.`);
                    state.catalogLoaded = false;
                    await loadCatalog(true);
                    state.trash = await db.select('deleted_rows', { order: 'deleted_at.desc', limit: 500 });
                    renderBackups();
                } catch (err) { btn.disabled = false; fail(err); }
            });
        });
    }

    /* ═══ POTVRZENÍ OBJEDNÁVKY E-MAILEM ═════════════════════════════
       Dokud e-maily neodcházejí samy, admin je pošle odsud: tlačítko
       otevře poštu s hotovým textem v jazyce zákazníka (§ 1827 OZ:
       potvrzení bez zbytečného odkladu). */
    const MAIL_TEXT = {
        cs: { hi: 'Dobrý den', thanks: (n, d) => `děkujeme za objednávku ${n} z ${d}. Tímto ji potvrzujeme, kupní smlouva je uzavřená.`,
              items: 'Objednané zboží', ship: 'Doprava', free: 'zdarma', cod: 'Příplatek za dobírku', gift: 'Dárkové balení', discount: 'Sleva',
              total: 'Celkem', pay: 'Platba převodem', acc: 'Číslo účtu', amount: 'Částka', vs: 'Variabilní symbol',
              payNote: 'Zaplaťte prosím do 7 dnů. Směs odešleme, jakmile platba dorazí.', codNote: 'Platíte dopravci při převzetí.',
              pickupNote: 'Zaplatíte při osobním převzetí.', deliver: 'Doručení', pickup: 'Osobní odběr',
              terms: v => `Obchodní podmínky (znění z ${v}):`, bye: 'S pozdravem', subject: 'Potvrzení objednávky', pcs: 'ks' },
        sk: { hi: 'Dobrý deň', thanks: (n, d) => `ďakujeme za objednávku ${n} z ${d}. Týmto ju potvrdzujeme, kúpna zmluva je uzavretá.`,
              items: 'Objednaný tovar', ship: 'Doprava', free: 'zadarmo', cod: 'Príplatok za dobierku', gift: 'Darčekové balenie', discount: 'Zľava',
              total: 'Spolu', pay: 'Platba prevodom', acc: 'Číslo účtu', amount: 'Suma', vs: 'Variabilný symbol',
              payNote: 'Zaplaťte, prosím, do 7 dní. Zmes odošleme, hneď ako platba príde.', codNote: 'Platíte prepravcovi pri prevzatí.',
              pickupNote: 'Zaplatíte pri osobnom prevzatí.', deliver: 'Doručenie', pickup: 'Osobný odber',
              terms: v => `Obchodné podmienky (znenie z ${v}, zmluvu uzatvárame v češtine):`, bye: 'S pozdravom', subject: 'Potvrdenie objednávky', pcs: 'ks' },
        en: { hi: 'Hello', thanks: (n, d) => `thank you for your order ${n} of ${d}. We hereby confirm it; the purchase contract is concluded.`,
              items: 'Ordered items', ship: 'Shipping', free: 'free', cod: 'Cash on delivery fee', gift: 'Gift wrapping', discount: 'Discount',
              total: 'Total', pay: 'Bank transfer', acc: 'Account number', amount: 'Amount', vs: 'Variable symbol',
              payNote: 'Please pay within 7 days. We ship the blend as soon as the payment arrives.', codNote: 'You pay the carrier on delivery.',
              pickupNote: 'You pay when you collect it.', deliver: 'Delivery', pickup: 'Personal pick-up',
              terms: v => `Terms and conditions (version of ${v}, the contract is concluded in Czech):`, bye: 'Kind regards', subject: 'Order confirmation', pcs: 'pcs' },
    };
    function orderConfirmMail(o) {
        const L = MAIL_TEXT[o.lang] || MAIL_TEXT.cs;
        const st = state.settings || {};
        const money = v => `${Number(v) || 0} Kč`;
        const items = (Array.isArray(o.items) ? o.items : []).map(i => `- ${i.name}, ${i.weight_g} g × ${i.qty} ${L.pcs}: ${money(i.line_czk)}`);
        const pickup = o.shipping_method === 'pickup';
        const where = pickup ? `${L.pickup}${st.pickup_note ? ': ' + st.pickup_note : ''}`
            : o.packeta_point ? `${o.shipping_name || o.shipping_method}: ${o.packeta_point}`
            : [`${o.first_name} ${o.last_name}`, o.street, `${o.zip} ${o.city}`.trim(), o.country].filter(Boolean).join(', ');
        const iban = st.seller_iban || '';
        const transfer = o.payment_method === 'transfer' ? [
            '', `${L.pay}:`,
            iban ? `${L.acc}: ${Bank.czAccount(iban) || Bank.formatIban(iban)}` : `${L.acc}: [doplnit v Nastavení]`,
            iban && Bank.czAccount(iban) ? `IBAN: ${Bank.formatIban(iban)}` : null,
            `${L.amount}: ${money(o.total_czk)}`, `${L.vs}: ${o.id}`, L.payNote,
        ] : ['', pickup ? L.pickupNote : L.codNote];
        const seller = [st.seller_name || 'Tease you', st.seller_ico ? `IČO ${st.seller_ico}` : null, st.seller_address || null]
            .filter(Boolean).join(', ');
        const body = [
            `${L.hi} ${o.first_name},`, '',
            L.thanks(o.num, formatDate(o.created_at, false)), '',
            `${L.items}:`, ...items,
            o.discount_czk ? `${L.discount} ${o.promo_code || ''}: −${money(o.discount_czk)}` : null,
            `${L.ship} (${pickup ? L.pickup : (o.shipping_name || o.shipping_method)}): ${o.shipping_czk ? money(o.shipping_czk) : L.free}`,
            o.payment_czk ? `${L.cod}: ${money(o.payment_czk)}` : null,
            o.gift_wrap ? `${L.gift}: ${o.gift_czk ? money(o.gift_czk) : L.free}` : null,
            `${L.total}: ${money(o.total_czk)}`,
            ...transfer, '',
            `${L.deliver}: ${where}`, '',
            o.terms_version ? L.terms(o.terms_version) : L.terms('—'),
            'https://teaseyou.cz/?stranka=obchodni-podminky', '',
            L.bye, seller, st.seller_email || 'hello@teaseyou.cz',
        ].filter(x => x !== null).join('\n');
        return `mailto:${encodeURIComponent(o.email)}?subject=${encodeURIComponent(`${L.subject} ${o.num}`)}&body=${encodeURIComponent(body)}`;
    }

    /* ═══ ODSTOUPENÍ OD SMLOUVY ════════════════════════════════════ */
    const WD_STATUS = { new: 'Nové', confirmed: 'Potvrzené', refunded: 'Peníze vrácené', rejected: 'Zamítnuté' };
    const WD_PILL = { new: 'new', confirmed: 'paid', refunded: 'done', rejected: 'cancelled' };

    function withdrawalMail(w) {
        const when = formatDate(w.created_at);
        const sellerName = (state.settings && state.settings.seller_name) || 'Tease you';
        const address = (state.settings && state.settings.seller_address) || '[adresa]';
        const body = [
            `Dobrý den,`, '',
            `potvrzujeme, že jsme ${when} přijali Vaše odstoupení od kupní smlouvy k objednávce ${w.order_num}.`, '',
            `Obsah odstoupení:`,
            `Jméno: ${w.name}`, `E-mail: ${w.email}`,
            w.items ? `Zboží: ${w.items}` : null,
            w.bank_account ? `Účet pro vrácení peněz: ${w.bank_account}` : null, '',
            `Zboží prosím pošlete do 14 dnů na adresu: ${address}.`,
            `Peníze Vám vrátíme do 14 dnů od přijetí odstoupení, ne však dříve, než nám zboží dorazí nebo doložíte, že jste ho odeslali.`, '',
            `S pozdravem`, sellerName,
        ].filter(x => x !== null).join('\n');
        return `mailto:${encodeURIComponent(w.email)}?subject=${encodeURIComponent('Potvrzení odstoupení od smlouvy ' + w.order_num)}&body=${encodeURIComponent(body)}`;
    }

    function renderWithdrawals() {
        const el = $('#withdrawals-list');
        const fresh = state.withdrawals.filter(w => w.status === 'new').length;
        const badge = $('#count-withdrawals');
        badge.textContent = fresh;
        badge.hidden = !fresh;
        if (!state.withdrawals.length) {
            el.innerHTML = '<p class="empty">Zatím žádné. Když zákazník na webu klikne na „Odstoupit od smlouvy“ a potvrdí to, objeví se tady.</p>';
            return;
        }
        el.innerHTML = state.withdrawals.map(w => `
            <button type="button" class="row" data-wd="${w.id}">
                <span class="row-main">
                    <span class="row-title">${esc(w.name)} <span class="row-sub-inline">${esc(w.order_num)}</span></span>
                    <span class="row-sub">${esc(formatDate(w.created_at))}${w.order_id ? '' : ', objednávka se nespárovala'}</span>
                </span>
                <span class="row-side"><span class="pill pill-${WD_PILL[w.status] || 'new'}">${esc(WD_STATUS[w.status] || w.status)}</span></span>
            </button>`).join('');
        $$('#withdrawals-list [data-wd]').forEach(row => row.addEventListener('click', () => {
            openWithdrawal(state.withdrawals.find(w => String(w.id) === row.dataset.wd));
        }));
    }

    function openWithdrawal(w) {
        if (!w) return;
        const order = w.order_id && state.orders ? state.orders.find(o => o.id === w.order_id) : null;
        const html = `
            <div class="order-meta">
                <span class="pill pill-${WD_PILL[w.status] || 'new'}">${esc(WD_STATUS[w.status] || w.status)}</span>
                <span>přijato ${esc(formatDate(w.created_at))}</span>
            </div>
            <div class="sheet-section">
                <h3>Co zákazník poslal</h3>
                <dl class="kv">
                    <dt>Objednávka</dt><dd>${esc(w.order_num)}${w.order_id ? '' : ' <em>(číslo nebo e-mail nesedí s žádnou objednávkou, dohledej ručně)</em>'}</dd>
                    <dt>Jméno</dt><dd>${esc(w.name)}</dd>
                    <dt>E-mail</dt><dd><a href="mailto:${esc(w.email)}">${esc(w.email)}</a></dd>
                    ${w.items ? `<dt>Zboží</dt><dd>${esc(w.items)}</dd>` : ''}
                    ${w.bank_account ? `<dt>Účet</dt><dd>${esc(w.bank_account)}</dd>` : ''}
                    ${w.note ? `<dt>Poznámka</dt><dd>${esc(w.note)}</dd>` : ''}
                    ${order ? `<dt>Zaplaceno</dt><dd>${kc(order.total_czk)} (${esc(PAYMENT[order.payment_method] || order.payment_method)})</dd>` : ''}
                </dl>
            </div>
            <div class="sheet-section">
                <h3>1. Potvrď přijetí</h3>
                <p class="help">Zákon chce potvrzení e-mailem bez zbytečného odkladu, s obsahem odstoupení a datem a časem. Tlačítko připraví e-mail, ty ho jen odešleš.</p>
                <p><a class="btn btn-primary btn-small" id="wd-mail" href="${withdrawalMail(w)}">Napsat potvrzení</a>
                ${w.confirmed_at ? `<span class="help">Potvrzeno ${esc(formatDate(w.confirmed_at))}</span>` : ''}</p>
                <p class="help">Pozor: směsi na míru a otevřené sáčky vrátit nejde (§ 1837 písm. d) a g) OZ). Když jde o ně, odepiš to zákazníkovi a dej Zamítnuté.</p>
            </div>
            <div class="sheet-section">
                <h3>2. Stav</h3>
                <div class="status-buttons" id="wd-status">
                    ${Object.entries(WD_STATUS).map(([k, label]) =>
                        `<button type="button" class="chip" data-status="${k}" aria-pressed="${w.status === k}">${esc(label)}</button>`).join('')}
                </div>
            </div>
            <form class="sheet-section" id="wd-note-form">
                <label class="field"><span>Poznámka pro tebe</span><textarea name="admin_note" rows="3" maxlength="1000">${esc(w.admin_note || '')}</textarea></label>
                <button type="submit" class="btn btn-secondary btn-small">Uložit poznámku</button>
            </form>`;
        openSheet('Odstoupení ' + w.order_num, html, body => {
            const setStatus = async status => {
                const patch = { status };
                if (status === 'confirmed' && !w.confirmed_at) patch.confirmed_at = new Date().toISOString();
                try {
                    Object.assign(w, await updateOne('withdrawals', { id: 'eq.' + w.id }, patch));
                    renderWithdrawals();
                    openWithdrawal(w);
                    toast('Stav uložený.');
                } catch (err) { fail(err); }
            };
            $('#wd-mail', body).addEventListener('click', () => {
                if (w.status === 'new') setTimeout(() => setStatus('confirmed'), 300);
            });
            $$('#wd-status .chip', body).forEach(chip => chip.addEventListener('click', () => setStatus(chip.dataset.status)));
            $('#wd-note-form', body).addEventListener('submit', async e => {
                e.preventDefault();
                try {
                    Object.assign(w, await updateOne('withdrawals', { id: 'eq.' + w.id }, { admin_note: e.currentTarget.admin_note.value.trim() }));
                    sheetDirty = false;
                    toast('Poznámka uložená.');
                } catch (err) { fail(err); }
            });
        });
    }

    /* ═══ RECENZE ══════════════════════════════════════════════════ */
    const RV_STATUS = { pending: 'Čeká', approved: 'Zveřejněná', rejected: 'Odmítnutá' };
    const RV_PILL = { pending: 'new', approved: 'shipped', rejected: 'cancelled' };
    const stars = n => '★'.repeat(n) + '☆'.repeat(5 - n);

    function renderReviews() {
        const el = $('#reviews-list');
        const list = state.reviews || [];
        const waiting = list.filter(r => r.status === 'pending').length;
        const badge = $('#count-reviews');
        badge.textContent = waiting;
        badge.hidden = !waiting;
        if (!list.length) {
            el.innerHTML = '<p class="empty">Zatím žádné. Zákazník může hodnotit, až jeho objednávku označíš jako Odeslanou.</p>';
            return;
        }
        const sorted = list.slice().sort((a, b) => (a.status === 'pending' ? 0 : 1) - (b.status === 'pending' ? 0 : 1) || b.id - a.id);
        el.innerHTML = sorted.map(r => `
            <button type="button" class="row" data-review="${r.id}">
                <span class="row-main">
                    <span class="row-title"><span class="rv-stars" aria-label="${r.rating} z 5">${stars(r.rating)}</span> ${esc(r.author)} <span class="row-sub-inline">${esc(r.order_num)}</span></span>
                    <span class="row-sub">${esc(formatDate(r.created_at))}${r.body ? ', ' + esc(r.body.slice(0, 80)) + (r.body.length > 80 ? '…' : '') : ', bez textu'}</span>
                </span>
                <span class="row-side"><span class="pill pill-${RV_PILL[r.status]}">${esc(RV_STATUS[r.status] || r.status)}</span></span>
            </button>`).join('');
        $$('#reviews-list [data-review]').forEach(row => row.addEventListener('click', () => {
            openReview(state.reviews.find(r => String(r.id) === row.dataset.review));
        }));
    }

    function openReview(r) {
        if (!r) return;
        const blends = (r.blends || []).map(id => (state.blends.find(b => b.id === id) || {}).name || id);
        const html = `
            <div class="order-meta">
                <span class="pill pill-${RV_PILL[r.status]}">${esc(RV_STATUS[r.status])}</span>
                <span>${esc(formatDate(r.created_at))}</span>
            </div>
            <div class="sheet-section">
                <p class="rv-big" aria-label="${r.rating} z 5">${stars(r.rating)}</p>
                ${r.body ? `<p class="address">${esc(r.body)}</p>` : '<p class="help">Jen hvězdičky, bez textu.</p>'}
                <dl class="kv">
                    <dt>Podpis</dt><dd>${esc(r.author)}</dd>
                    <dt>Objednávka</dt><dd>${esc(r.order_num)} (ověřená e-mailem)</dd>
                    ${blends.length ? `<dt>Hotové směsi</dt><dd>${esc(blends.join(', '))} <em>(ukáže se i u nich)</em></dd>` : ''}
                    <dt>Jazyk</dt><dd>${({ en: 'angličtina', sk: 'slovenština' })[r.lang] || 'čeština'}</dd>
                </dl>
            </div>
            <div class="sheet-section">
                <h3>Zveřejnit</h3>
                <div class="status-buttons" id="rv-status">
                    ${Object.entries(RV_STATUS).map(([k, label]) =>
                        `<button type="button" class="chip" data-status="${k}" aria-pressed="${r.status === k}">${esc(label)}</button>`).join('')}
                </div>
                <p class="help">Odmítni jen vulgární, nesouvisející nebo s cizími osobními údaji. Kritické hodnocení zveřejni a klidně na něj odpověz.</p>
            </div>
            <form class="sheet-section" id="rv-reply-form">
                <label class="field"><span>Odpověď pod recenzí (uvidí ji všichni)</span><textarea name="reply" rows="3" maxlength="1000">${esc(r.reply || '')}</textarea></label>
                <div class="sheet-actions">
                    <button type="submit" class="btn btn-secondary btn-small">Uložit odpověď</button>
                    <span class="spacer"></span>
                    <button type="button" class="btn btn-danger btn-small" id="rv-delete">Smazat recenzi</button>
                </div>
                <p class="help">Smaž, když zákazník souhlas odvolá. Smazaná recenze jde 30 dní do koše.</p>
            </form>`;
        openSheet('Recenze ' + r.order_num, html, body => {
            $$('#rv-status .chip', body).forEach(chip => chip.addEventListener('click', async () => {
                if (chip.dataset.status === r.status) return;
                try {
                    Object.assign(r, await updateOne('reviews', { id: 'eq.' + r.id }, { status: chip.dataset.status }));
                    renderReviews();
                    openReview(r);
                    toast(r.status === 'approved' ? 'Recenze je na webu.' : 'Stav uložený.');
                } catch (err) { fail(err); }
            }));
            $('#rv-reply-form', body).addEventListener('submit', async e => {
                e.preventDefault();
                try {
                    Object.assign(r, await updateOne('reviews', { id: 'eq.' + r.id }, { reply: e.currentTarget.reply.value.trim() }));
                    sheetDirty = false;
                    toast('Odpověď uložená.');
                } catch (err) { fail(err); }
            });
            $('#rv-delete', body).addEventListener('click', async () => {
                if (!(await confirmDialog(`Smazat recenzi od ${r.author}?`, 'Smazat'))) return;
                try {
                    await db.remove('reviews', { id: 'eq.' + r.id });
                    state.reviews = state.reviews.filter(x => x.id !== r.id);
                    closeSheet();
                    renderReviews();
                    toast('Smazáno, je v koši.');
                } catch (err) { fail(err); }
            });
        });
    }

    /* ═══ OSOBNÍ ÚDAJE (žádosti podle GDPR) ════════════════════════ */
    const REQ_KIND = { access: 'Kopie údajů', erasure: 'Výmaz', correction: 'Oprava', objection: 'Námitka', other: 'Jiné' };

    function renderPrivacy() {
        const el = $('#privacy-log');
        const open = state.privacyRequests.filter(r => !r.done_at).length;
        const badge = $('#count-privacy');
        badge.textContent = open;
        badge.hidden = !open;
        el.innerHTML = state.privacyRequests.length ? state.privacyRequests.map(r => {
            const due = new Date(new Date(r.created_at).getTime() + 30 * 864e5);
            return `<div class="table-row" data-req="${r.id}">
                <span class="row-main">
                    <span class="row-title">${esc(r.email)} <span class="row-sub-inline">${esc(REQ_KIND[r.kind] || r.kind)}</span></span>
                    <span class="row-sub">${esc(formatDate(r.created_at, false))}${r.done_at ? `, vyřízeno ${esc(formatDate(r.done_at, false))}` : `, odpovědět do ${esc(due.toLocaleDateString('cs-CZ'))}`}${r.note ? ' · ' + esc(r.note) : ''}</span>
                </span>
                ${r.done_at ? '' : '<button type="button" class="btn btn-secondary btn-small" data-field="done">Vyřízeno</button>'}
            </div>`;
        }).join('') : '<p class="empty">Zatím žádné žádosti.</p>';
        $$('#privacy-log [data-req]').forEach(row => {
            const btn = $('[data-field=done]', row);
            if (btn) btn.addEventListener('click', async () => {
                const r = state.privacyRequests.find(x => String(x.id) === row.dataset.req);
                try {
                    Object.assign(r, await updateOne('privacy_requests', { id: 'eq.' + r.id }, { done_at: new Date().toISOString() }));
                    renderPrivacy();
                } catch (err) { fail(err); }
            });
        });
    }

    async function logPrivacyRequest(email, kind, note) {
        const [row] = await db.insert('privacy_requests', { email, kind, note, done_at: new Date().toISOString() });
        state.privacyRequests.unshift(row);
        renderPrivacy();
    }

    async function findPersonalData(email) {
        const eq = { email: 'eq.' + email };
        const [orders, waitlist, withdrawals] = await Promise.all([
            db.select('orders', Object.assign({ order: 'created_at.desc' }, eq)),
            db.select('craft_waitlist', Object.assign({ order: 'created_at.desc' }, eq)),
            db.select('withdrawals', Object.assign({ order: 'created_at.desc' }, eq)),
        ]);
        const ids = orders.map(o => o.id).filter(Number.isInteger);
        const reviews = ids.length ? await db.select('reviews', { order_id: `in.(${ids.join(',')})` }).catch(() => []) : [];
        return { orders, waitlist, withdrawals, reviews };
    }

    $('#privacy-form').addEventListener('submit', async e => {
        e.preventDefault();
        const email = e.currentTarget.email.value.trim().toLowerCase();
        const out = $('#privacy-result');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast('Zadej celý e-mail.', true); return; }
        out.innerHTML = '<p class="loading">Hledám…</p>';
        try {
            const data = await findPersonalData(email);
            state.privacyFound = { email, data };
            const n = data.orders.length + data.waitlist.length + data.withdrawals.length + data.reviews.length;
            out.innerHTML = n ? `
                <ul class="privacy-found">
                    <li><strong>${data.orders.length}</strong> objednávek${data.orders.length ? ': ' + data.orders.map(o => esc(o.num)).join(', ') : ''}</li>
                    <li><strong>${data.waitlist.length}</strong> přihlášení k upozornění na mýdla a balzámy</li>
                    <li><strong>${data.withdrawals.length}</strong> odstoupení od smlouvy</li>
                    <li><strong>${data.reviews.length}</strong> recenzí${data.reviews.length ? ' (smazat je můžeš v záložce Recenze)' : ''}</li>
                </ul>
                <div class="privacy-actions">
                    <button type="button" class="btn btn-primary btn-small" id="privacy-export">Stáhnout kopii (JSON)</button>
                    <button type="button" class="btn btn-secondary btn-small" id="privacy-erase"${data.waitlist.length ? '' : ' disabled'}>Smazat z upozornění</button>
                </div>
                <p class="help">Objednávky a odstoupení mazat nejde: patří k dokladům a reklamacím. Zmizí samy podle lhůt v zásadách (kontakt po 5 letech, zbytek po 10). Zákazníkovi to napiš.</p>`
                : `<p class="empty">K e-mailu ${esc(email)} nic nemáme. I tak mu odpověz, že o něm žádné údaje nevedeme.</p>`;
            const exp = $('#privacy-export');
            if (exp) exp.addEventListener('click', async () => {
                const blob = new Blob([JSON.stringify({ email, exported_at: new Date().toISOString(), ...data }, null, 2)], { type: 'application/json' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `osobni-udaje-${email.replace(/[^a-z0-9]+/gi, '-')}.json`;
                document.body.appendChild(a); a.click();
                setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
                try { await logPrivacyRequest(email, 'access', 'kopie stažena z administrace'); } catch (err) { fail(err); }
            });
            const er = $('#privacy-erase');
            if (er) er.addEventListener('click', async () => {
                if (!(await confirmDialog(`Smazat ${email} ze všech seznamů zájemců?`))) return;
                try {
                    await db.rpc('erase_waitlist_email', { p_email: email });
                    await logPrivacyRequest(email, 'erasure', `smazáno z upozornění (${data.waitlist.length}×), objednávky ponechány kvůli dokladům`);
                    toast('Smazáno.');
                    $('#privacy-form').requestSubmit();
                } catch (err) { fail(err); }
            });
        } catch (err) { out.innerHTML = ''; fail(err); }
    });

    function openCraft(product) {
        const isNew = !product;
        const p = product || {
            kind: 'soap', name_cs: '', name_en: '', name_sk: '', desc_cs: '', desc_en: '', desc_sk: '', ingredients: [],
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
                <label class="field"><span>Název slovensky</span><input type="text" name="name_sk" maxlength="60" placeholder="Prázdné = česky" value="${esc(p.name_sk || '')}"></label>
                <fieldset class="field picks"><span>Suroviny z čajů (nejvýš 4)</span>${groups}
                    <small>U těchhle ingrediencí web ukáže odkaz „Najdeš i v“ a u čajů s nimi „Ze stejných surovin“.</small></fieldset>
                <label class="field"><span>Popis česky</span><textarea name="desc_cs" rows="3" maxlength="500">${esc(p.desc_cs)}</textarea><small>Jak voní a z čeho je. Žádné léčivé účinky, ty u kosmetiky uvádět nejde.</small></label>
                <label class="field"><span>Popis anglicky</span><textarea name="desc_en" rows="3" maxlength="500">${esc(p.desc_en)}</textarea></label>
                <label class="field"><span>Popis slovensky</span><textarea name="desc_sk" rows="3" maxlength="500" placeholder="Prázdné = česky">${esc(p.desc_sk || '')}</textarea></label>
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
                    name_sk: form.name_sk.value.trim(),
                    desc_cs: form.desc_cs.value.trim(),
                    desc_en: form.desc_en.value.trim(),
                    desc_sk: form.desc_sk.value.trim(),
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
                if (!(await confirmDialog(`Smazat ${p.name_cs}? Z webu zmizí.${extra} Když ho chceš jen schovat, vypni „Zobrazovat na webu“.`, 'Smazat',
                    n ? p.name_cs : undefined))) return;
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
                if (active.checked && s.id === 'pickup' && !String((state.settings || {}).pickup_note || '').trim()) {
                    active.checked = false;
                    toast('Nejdřív níže v „Dárek a osobní odběr“ napiš, kde a kdy se vyzvedává.', true);
                    return;
                }
                try {
                    Object.assign(s, await updateOne('shipping_methods', { id: 'eq.' + s.id }, { active: active.checked }));
                    toast(s.active ? `${s.name}: nabízíme` : `${s.name}: vypnuto`);
                } catch (err) { active.checked = !active.checked; fail(err); }
            });
        });

        const form = $('#settings-form');
        const st = Object.assign({}, SETTINGS_DEFAULTS, state.settings || {});
        form.free_ship_threshold.value = st.free_ship_threshold;
        form.cod_fee_czk.value = st.cod_fee_czk;
        form.promo_bar_enabled.checked = st.promo_bar_enabled !== false;
        form.promo_bar_cs.value = st.promo_bar_cs || '';
        form.promo_bar_en.value = st.promo_bar_en || '';
        form.promo_bar_sk.value = st.promo_bar_sk || '';

        const sf = $('#seller-form');
        ['seller_name', 'seller_ico', 'seller_address', 'seller_email', 'seller_phone', 'durability_months'].forEach(n => {
            sf[n].value = st[n] ?? '';
        });
        sf.seller_iban.value = st.seller_iban ? (Bank.czAccount(st.seller_iban) || Bank.formatIban(st.seller_iban)) : '';

        const xf = $('#extras-form');
        xf.gift_wrap_enabled.checked = st.gift_wrap_enabled === true;
        xf.gift_wrap_czk.value = st.gift_wrap_czk ?? 0;
        xf.pickup_note.value = st.pickup_note || '';
    }

    // Výchozí hodnoty, dokud v databázi není řádek nastavení (nebo chybí
    // sloupce, protože se setup.sql ještě nespustil znovu).
    const SETTINGS_DEFAULTS = {
        free_ship_threshold: 500, cod_fee_czk: 39, promo_bar_enabled: true, promo_bar_cs: '', promo_bar_en: '', promo_bar_sk: '',
        seller_name: '', seller_ico: '', seller_address: '', seller_email: 'hello@teaseyou.cz', seller_phone: '',
        seller_iban: '', gift_wrap_enabled: false, gift_wrap_czk: 0, pickup_note: '',
        durability_months: 12,
        sales_open: false, sales_opened_at: null,
    };

    /* ─── Spuštění prodeje ─────────────────────────────────────────── */
    function sellerMissing(st) {
        const miss = [];
        if (!String(st.seller_name || '').trim()) miss.push('jméno');
        if (!/^[0-9]{8}$/.test(st.seller_ico || '')) miss.push('IČO');
        if (!String(st.seller_address || '').trim()) miss.push('adresa sídla');
        if (!String(st.seller_email || '').trim()) miss.push('e-mail');
        return miss;
    }
    function renderSales() {
        const st = state.settings || {};
        const known = 'sales_open' in st;
        const open = st.sales_open === true;
        const badge = $('#sales-badge');
        const status = $('#sales-status');
        const btn = $('#sales-toggle');
        if (!known) {
            badge.hidden = true;
            status.textContent = 'Databáze přepínač prodeje ještě nezná. Spusť znovu supabase/setup.sql v Supabase → SQL Editor.';
            btn.disabled = true;
            return;
        }
        badge.hidden = false;
        badge.textContent = open ? 'Prodej běží' : 'Prodej vypnutý';
        badge.className = 'env-badge ' + (open ? 'sales-open' : 'sales-closed');
        badge.title = open ? 'Web přijímá objednávky.' : 'Web ukazuje „Připravujeme spuštění“ a objednávky nepřijímá.';
        const since = st.sales_opened_at ? ` Poprvé spuštěno ${formatDate(st.sales_opened_at)}.` : '';
        status.textContent = open
            ? 'Prodej běží: web přijímá objednávky.' + since
            : 'Prodej je vypnutý: web ukazuje „Připravujeme spuštění“ a objednávky nepřijímá, ani přímo přes databázi.' + since;
        btn.disabled = false;
        btn.textContent = open ? 'Zastavit prodej' : 'Spustit prodej';
        btn.className = 'btn ' + (open ? 'btn-danger' : 'btn-primary');
    }
    $('#sales-toggle').addEventListener('click', async e => {
        const btn = e.currentTarget;
        const st = state.settings || {};
        const open = st.sales_open === true;
        if (!open) {
            const miss = sellerMissing(st);
            if (miss.length) {
                toast(`Nejdřív vyplň v Prodávající a etiketa: ${miss.join(', ')}. Pak ulož a spusť prodej.`, true);
                $('#seller-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
                return;
            }
            const ok = await confirmDialog('Web začne přijímat skutečné objednávky. Máš ohlášenou živnost, oznámení SZPI, funkční e-mail a zkontrolované podmínky?', 'Spustit prodej', 'SPUSTIT');
            if (!ok) return;
        } else if (!(await confirmDialog('Web přestane přijímat objednávky a ukáže „Připravujeme spuštění“. Objednávky, které už přišly, zůstanou.', 'Zastavit prodej'))) {
            return;
        }
        await saveSettings({ sales_open: !open }, btn, open ? 'Prodej je zastavený.' : 'Prodej běží. Web přijímá objednávky.');
        renderSales();
    });

    async function saveSettings(row, btn, okMsg) {
        btn.disabled = true;
        try {
            state.settings = state.settings
                ? await updateOne('settings', { id: 'eq.1' }, row)
                : (await db.insert('settings', Object.assign({ id: 1 }, row)))[0];
            toast(okMsg);
        } catch (err) {
            // Sloupec chybí = databáze je ze starší verze setup.sql.
            if (/column|schema cache/i.test(String(err && (err.message || err)))) {
                toast('Databáze tyhle údaje ještě nezná. Spusť znovu supabase/setup.sql v Supabase → SQL Editor.', true);
            } else fail(err);
        } finally { btn.disabled = false; }
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
        const codFee = parseInt(form.cod_fee_czk.value, 10);
        if (!(codFee >= 0 && codFee <= 1000)) { toast('Příplatek za dobírku musí být 0 až 1000 Kč.', true); return; }
        const row = {
            free_ship_threshold: threshold,
            promo_bar_enabled: form.promo_bar_enabled.checked,
            promo_bar_cs: form.promo_bar_cs.value.trim() || null,
            promo_bar_en: form.promo_bar_en.value.trim() || null,
            promo_bar_sk: form.promo_bar_sk.value.trim() || null,
        };
        // Sloupec s příplatkem posíláme jen tehdy, když ho databáze už má.
        if (!state.settings || 'cod_fee_czk' in state.settings) row.cod_fee_czk = codFee;
        await saveSettings(row, form.querySelector('[type=submit]'), 'Nastavení uložené.');
    });

    $('#seller-form').addEventListener('submit', async e => {
        e.preventDefault();
        const f = e.currentTarget;
        const v = n => f[n].value.trim();
        const pct = n => parseInt(f[n].value, 10);
        const ico = v('seller_ico').replace(/\s+/g, '');
        if (ico && !/^[0-9]{8}$/.test(ico)) { toast('IČO má přesně 8 číslic.', true); return; }
        const email = v('seller_email');
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast('E-mail nevypadá správně.', true); return; }
        const months = pct('durability_months');
        if (!(months >= 1 && months <= 36)) { toast('Trvanlivost zadej v měsících, 1 až 36.', true); return; }
        const iban = v('seller_iban') ? Bank.toIban(v('seller_iban')) : '';
        if (v('seller_iban') && !iban) { toast('Číslo účtu nesedí. Zkontroluj ho (třeba 19-2000145399/0800) nebo zadej IBAN.', true); return; }
        const row = {
            seller_name: v('seller_name'), seller_ico: ico, seller_address: v('seller_address'),
            seller_email: email, seller_phone: v('seller_phone'),
            durability_months: months,
        };
        if (!state.settings || 'seller_iban' in state.settings) row.seller_iban = iban;
        await saveSettings(row, f.querySelector('[type=submit]'), 'Údaje o prodávajícím uložené.');
        if (state.settings && state.settings.seller_iban) f.seller_iban.value = Bank.czAccount(state.settings.seller_iban) || Bank.formatIban(state.settings.seller_iban);
    });

    $('#extras-form').addEventListener('submit', async e => {
        e.preventDefault();
        const f = e.currentTarget;
        const price = parseInt(f.gift_wrap_czk.value, 10);
        if (!(price >= 0 && price <= 500)) { toast('Cena dárkového balení musí být 0 až 500 Kč.', true); return; }
        const pickup = f.pickup_note.value.trim();
        const pickupOn = (state.shipping.find(x => x.id === 'pickup') || {}).active;
        if (!pickup && pickupOn) { toast('Osobní odběr je zapnutý, tak musí mít napsané místo. Nebo ho nahoře v Dopravě vypni.', true); return; }
        await saveSettings({ gift_wrap_enabled: f.gift_wrap_enabled.checked, gift_wrap_czk: price, pickup_note: pickup },
            f.querySelector('[type=submit]'), 'Uloženo.');
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
