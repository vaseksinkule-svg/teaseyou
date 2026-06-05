/* =============================================
   TEASE YOU — script.js  v2.0
   ============================================= */

/* ─── STATE ─────────────────────────────────── */
let currentProduct = {
    name: 'Custom Mix',
    ingredients: ['Empty','Empty','Empty'],
    colors: ['transparent','transparent','transparent'],
    priceBase: 0,
    weight: ''
};
let cart = JSON.parse(localStorage.getItem('teaseyou_cart') || '[]');
let cartIdCounter = cart.reduce((m, i) => Math.max(m, i.id || 0), 0);
let savedBlends = JSON.parse(localStorage.getItem('teaseyou_saved') || '[]');
let orders = JSON.parse(localStorage.getItem('teaseyou_orders') || '[]');

/* ─── PRICING & CURRENCY (CZK) ───────────────── */
const PRICES = { 50: 49, 100: 89, 250: 199 };  // weight(g) → price (Kč)
const FREE_SHIP_THRESHOLD = 500;                // Kč
const PROMOS = { FIRSTBLEND: { rate: 0.10, label: '-10%' } };

let appliedPromo = JSON.parse(localStorage.getItem('teaseyou_promo') || 'null');

function fmt(n) { return Math.round(n) + ' Kč'; }
function saveCart()  { localStorage.setItem('teaseyou_cart', JSON.stringify(cart)); }
function savePromo() { localStorage.setItem('teaseyou_promo', JSON.stringify(appliedPromo)); }

function cartGoods() { return cart.reduce((s, i) => s + i.priceBase * i.qty, 0); }
function computeTotals(shipping = 0) {
    const goods    = cartGoods();
    const discount = appliedPromo ? goods * appliedPromo.rate : 0;
    const afterDiscount = goods - discount;
    const freeShip = goods >= FREE_SHIP_THRESHOLD;
    const ship     = freeShip ? 0 : shipping;
    return { goods, discount, afterDiscount, freeShip, ship, total: afterDiscount + ship };
}

/* ─── BREW PARAMS per base ───────────────────── */
const BREW = {
    'Green Tea':  { temp:'75–80°C', time:'2–3 min' },
    'White Tea':  { temp:'75–80°C', time:'2–3 min' },
    'Black Tea':  { temp:'90–95°C', time:'3–4 min' },
    'Oolong Tea': { temp:'85–90°C', time:'3–4 min' },
    'Rooibos':    { temp:'100°C',   time:'5–7 min' },
    'Chamomile':  { temp:'100°C',   time:'5–7 min' },
};

/* ─── HTML ESCAPE (XSS prevention) ──────────── */
function escHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/* ─── TOAST ──────────────────────────────────── */
function showToast(msg, icon='🛒') {
    const t = document.getElementById('toast');
    t.innerHTML = `<span>${icon}</span> ${msg}`;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), 3000);
}

/* ─── DARK MODE ──────────────────────────────── */
function toggleDarkMode() {
    document.body.classList.toggle('dark');
    localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
}
if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark');

/* ─── COOKIE CONSENT ─────────────────────────── */
function handleCookies(accepted) {
    localStorage.setItem('teaseyou_cookies', accepted ? 'accepted' : 'declined');
    const banner = document.getElementById('cookie-banner');
    banner.style.transform = 'translateY(120%)';
    setTimeout(() => banner.style.display = 'none', 400);
}
function initCookieBanner() {
    if (!localStorage.getItem('teaseyou_cookies')) {
        const banner = document.getElementById('cookie-banner');
        banner.style.display = 'block';
        setTimeout(() => banner.classList.add('visible'), 600);
    }
}

/* ─── BACK TO TOP ────────────────────────────── */
function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
}

/* ─── SCROLL REVEAL ──────────────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('visible');
            e.target.classList.remove('reveal-hidden');
            revealObserver.unobserve(e.target);
        }
    });
}, { threshold: 0.08 });

function initReveal() {
    document.querySelectorAll('.reveal-section').forEach((el, i) => {
        el.classList.remove('visible');
        const rect = el.getBoundingClientRect();
        const inView = rect.top < (window.innerHeight - 40) && rect.bottom > 0;
        if (inView) {
            setTimeout(() => { el.classList.add('visible'); el.classList.remove('reveal-hidden'); }, i * 90);
        } else {
            el.classList.add('reveal-hidden');
            revealObserver.observe(el);
        }
    });
}

/* ─── SIDEBAR ────────────────────────────────── */
function openSidebar() {
    document.getElementById('sidebar').classList.add('open');
    document.getElementById('sidebar-overlay').classList.add('open');
    document.body.style.overflow = 'hidden';
}
function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebar-overlay').classList.remove('open');
    document.body.style.overflow = '';
}

/* ─── PAGE NAVIGATION ────────────────────────── */
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (pageId === 'cart-page')     renderCart();
    if (pageId === 'checkout-page') renderCheckoutSummary();
    if (pageId === 'saved-page')    renderSavedBlends();
    if (pageId === 'orders-page')   renderOrders();
    if (pageId === 'home-page')     setTimeout(initReveal, 50);
    if (pageId === 'quiz-page')     setTimeout(startQuiz, 0);
}

/* ─── FAQ ACCORDION ──────────────────────────── */
function toggleFaq(btn) {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    // Close all
    document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
}

/* ─── BREW GUIDE TOGGLE ──────────────────────── */
function toggleBrewGuide(btn) {
    btn.closest('.brew-guide').classList.toggle('open');
}

/* ─── PRODUCT DETAIL ─────────────────────────── */
function openDetail(name, desc, price, ingredients, colors) {
    currentProduct = { name, desc, priceBase: price, ingredients, colors, weight: '' };
    document.getElementById('detail-title').innerText = name;
    document.getElementById('detail-desc').innerText = desc;
    document.getElementById('detail-ingredients-list').innerText = ingredients.join(' • ');
    document.getElementById('detail-part1').style.backgroundColor = colors[0];
    document.getElementById('detail-part2').style.backgroundColor = colors[1];
    document.getElementById('detail-part3').style.backgroundColor = colors[2];

    // Set brew params based on base
    const base = ingredients[0];
    const brew = BREW[base] || { temp: '90–95°C', time: '3–4 min' };
    const tempEl = document.getElementById('detail-temp');
    const timeEl = document.getElementById('detail-time');
    if (tempEl) tempEl.innerHTML = brew.temp;
    if (timeEl) timeEl.innerHTML = brew.time;

    document.querySelectorAll('#product-detail-page .qty-btn').forEach(b => b.classList.remove('selected'));
    const addBtn = document.getElementById('detail-add-btn');
    addBtn.disabled = true;
    addBtn.classList.add('disabled');
    animateGlass('detail-glass-frame');
    showPage('product-detail-page');
}

/* ─── QUANTITY SELECTION ─────────────────────── */
function selectQty(amount, e) {
    const btn = e.target.closest('.qty-btn');
    if (!btn) return;
    const container = btn.closest('.qty-options');
    container.querySelectorAll('.qty-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    currentProduct.weight    = amount + 'g';
    currentProduct.priceBase = PRICES[amount] || PRICES[100];
    ['detail-add-btn','final-order-btn','summary-order-btn'].forEach(id => {
        const b = document.getElementById(id);
        if (b) { b.disabled = false; b.classList.remove('disabled'); }
    });
}

/* ─── SHIPPING COST ──────────────────────────── */
function updateShippingCost(radio) {
    const cost = parseFloat(radio.getAttribute('data-price')) || 0;
    const t = computeTotals(cost);
    const row = document.getElementById('checkout-shipping-row');
    const costEl = document.getElementById('checkout-shipping-cost');
    const totalEl = document.getElementById('checkout-total-display');
    if (row) row.style.display = 'flex';
    if (costEl) costEl.textContent = t.freeShip ? 'FREE' : fmt(t.ship);
    if (totalEl) totalEl.textContent = fmt(t.total);
}

/* ─── PROMO CODES ────────────────────────────── */
function setPromoFeedback(msg, ok) {
    const fb = document.getElementById('promo-feedback');
    if (!fb) return;
    fb.textContent = msg;
    fb.classList.toggle('ok', !!ok);
    fb.classList.toggle('err', !ok && !!msg);
}
function applyPromo() {
    const input = document.getElementById('promo-input');
    const code  = (input?.value || '').trim().toUpperCase();
    if (!code) { setPromoFeedback('', false); return; }
    if (cart.length === 0) { setPromoFeedback('Add something to your cart first.', false); return; }
    const promo = PROMOS[code];
    if (!promo) {
        appliedPromo = null;
        setPromoFeedback('Invalid code.', false);
    } else {
        appliedPromo = { code, rate: promo.rate, label: promo.label };
        setPromoFeedback(`Code applied — ${promo.label} 🎉`, true);
        showToast(`Discount code "${code}" applied!`, '🏷️');
    }
    savePromo();
    renderCart();
}
function removePromo() {
    appliedPromo = null;
    savePromo();
    setPromoFeedback('', false);
    const input = document.getElementById('promo-input');
    if (input) input.value = '';
    renderCart();
}

/* ─── FREE SHIPPING PROGRESS ─────────────────── */
function renderFreeShip() {
    const wrap = document.getElementById('cart-freeship');
    if (!wrap) return;
    if (cart.length === 0) { wrap.style.display = 'none'; return; }
    wrap.style.display = 'block';
    const goods = cartGoods();
    const fill  = document.getElementById('cart-freeship-fill');
    const text  = document.getElementById('cart-freeship-text');
    const pct   = Math.min(100, Math.round(goods / FREE_SHIP_THRESHOLD * 100));
    if (fill) fill.style.width = pct + '%';
    if (goods >= FREE_SHIP_THRESHOLD) {
        if (text) text.innerHTML = '🎉 You\'ve unlocked <strong>free shipping</strong>!';
        wrap.classList.add('unlocked');
    } else {
        if (text) text.innerHTML = `Add <strong>${fmt(FREE_SHIP_THRESHOLD - goods)}</strong> more for free shipping`;
        wrap.classList.remove('unlocked');
    }
}

/* ─── CUSTOMIZE FROM READY-MADE ──────────────── */
function modifyReadyMade() {
    showPage('product-page');
    document.getElementById('mix-name').value = currentProduct.name;
    document.getElementById('part1').style.backgroundColor = currentProduct.colors[0];
    document.getElementById('part2').style.backgroundColor = currentProduct.colors[1];
    document.getElementById('part3').style.backgroundColor = currentProduct.colors[2];
    document.querySelectorAll('.ingredient-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (currentProduct.ingredients.includes(btn.getAttribute('data-name')))
            btn.classList.add('selected');
    });
    validateSelection();
}

/* ─── GLASS ANIMATIONS ───────────────────────── */
function animateGlass(frameId) {
    const frame = document.getElementById(frameId);
    if (!frame) return;
    frame.classList.remove('glass-pop');
    void frame.offsetWidth;
    frame.classList.add('glass-pop');
}
function pulseGlassPart(partId) {
    const part = document.getElementById(partId);
    if (!part) return;
    part.classList.remove('part-pulse');
    void part.offsetWidth;
    part.classList.add('part-pulse');
}

/* ─── UPDATE GLASS LABELS ────────────────────── */
function updateGlassLabels() {
    const defaults = { 1:'Base', 2:'Flavor', 3:'Extras' };
    ['part1','part2','part3'].forEach((partId, i) => {
        const idx = i + 1;
        const sel = document.querySelector(`[data-target="${partId}"].selected`);
        const dot  = document.getElementById(`label-dot-${idx}`);
        const text = document.getElementById(`label-text-${idx}`);
        if (!dot || !text) return;
        if (sel) {
            dot.style.background = sel.getAttribute('data-color');
            text.textContent = sel.getAttribute('data-name');
        } else {
            dot.style.background = 'var(--color-border)';
            text.textContent = defaults[idx];
        }
    });
    const nameEl  = document.getElementById('glass-mix-name-display');
    const nameVal = document.getElementById('mix-name')?.value?.trim();
    if (nameEl) {
        nameEl.textContent = nameVal || 'Name your mix';
        nameEl.classList.toggle('has-name', !!nameVal);
    }
}

/* ─── INGREDIENT SELECTION ───────────────────── */
document.addEventListener('click', function(e) {
    const ingBtn = e.target.closest('.ingredient-btn');
    if (ingBtn) {
        const targetId = ingBtn.getAttribute('data-target');
        const color    = ingBtn.getAttribute('data-color');
        const name     = ingBtn.getAttribute('data-name');
        ingBtn.parentElement.querySelectorAll('.ingredient-btn').forEach(b => b.classList.remove('selected'));
        ingBtn.classList.add('selected');
        document.getElementById(targetId).style.backgroundColor = color;
        pulseGlassPart(targetId);
        animateGlass('main-glass-frame');
        const idx = parseInt(targetId.replace('part','')) - 1;
        currentProduct.colors[idx]      = color;
        currentProduct.ingredients[idx] = name;
        if (targetId === 'part1') {
            document.getElementById('info-title').innerText = name;
            document.getElementById('info-text').innerText  = ingBtn.getAttribute('data-desc') || '';
        }
        validateSelection();
        updateGlassLabels();
    }

    const clearBtn = e.target.closest('.clear-btn[data-target]');
    if (clearBtn) {
        const tid = clearBtn.getAttribute('data-target');
        document.getElementById(tid).style.backgroundColor = 'transparent';
        pulseGlassPart(tid);
        animateGlass('main-glass-frame');
        clearBtn.closest('.selection-group').querySelectorAll('.ingredient-btn').forEach(b => b.classList.remove('selected'));
        const idx = parseInt(tid.replace('part','')) - 1;
        currentProduct.colors[idx]      = 'transparent';
        currentProduct.ingredients[idx] = 'Empty';
        if (tid === 'part1') {
            document.getElementById('info-title').innerText = 'Select a base';
            document.getElementById('info-text').innerText  = 'Choose your preferred tea base to start.';
        }
        validateSelection();
        updateGlassLabels();
    }
});

/* ─── PROGRESS & COMPLETION ──────────────────── */
function updateProgress() {
    const base   = !!document.querySelector('[data-target="part1"].selected');
    const flavor = !!document.querySelector('[data-target="part2"].selected');
    const extras = !!document.querySelector('[data-target="part3"].selected');
    const name   = !!(document.getElementById('mix-name')?.value?.trim());
    [base, flavor, extras, name].forEach((done, i) => {
        document.getElementById(`prog-${i+1}`)?.classList.toggle('done', done);
        document.getElementById(`prog-line-${i+1}`)?.classList.toggle('done', done);
    });
}
function updateCompletion() {
    const count = ['part1','part2','part3'].filter(p => document.querySelector(`[data-target="${p}"].selected`)).length;
    const fill  = document.getElementById('completion-fill');
    const label = document.getElementById('completion-label');
    if (fill)  fill.style.width = Math.round((count/3)*100) + '%';
    if (label) label.textContent = `${count} / 3 selected`;
}

/* ─── VALIDATION ─────────────────────────────── */
function validateSelection() {
    const ok = ['part1','part2','part3'].every(p => document.querySelector(`[data-target="${p}"].selected`));
    const btn = document.getElementById('save-mix-btn');
    btn.disabled = !ok;
    btn.classList.toggle('disabled', !ok);
    updateProgress();
    updateCompletion();
}

/* ─── LIVE NAME UPDATE ───────────────────────── */
document.addEventListener('input', function(e) {
    if (e.target.id === 'mix-name') { updateGlassLabels(); updateProgress(); }
});

/* ─── SUMMARY ────────────────────────────────── */
function showSummary() {
    currentProduct.name = document.getElementById('mix-name').value || 'Custom Mix';
    document.getElementById('display-mix-name').innerText = currentProduct.name;
    ['part1','part2','part3'].forEach((p, i) => {
        document.getElementById(`summary-${p}`).style.backgroundColor = currentProduct.colors[i];
    });
    const chipsEl = document.getElementById('summary-chips');
    chipsEl.innerHTML = '';
    currentProduct.ingredients.forEach((name, i) => {
        if (name === 'Empty') return;
        const chip = document.createElement('div');
        chip.className = 'summary-chip';
        chip.innerHTML = `<div class="summary-chip-dot" style="background:${currentProduct.colors[i]}"></div><span>${name}</span>`;
        chipsEl.appendChild(chip);
    });
    const btn = document.getElementById('summary-order-btn');
    btn.disabled = true;
    btn.classList.add('disabled');
    document.querySelectorAll('#summary-page .qty-btn').forEach(b => b.classList.remove('selected'));
    currentProduct.weight = '';
    currentProduct.priceBase = 0;
    showPage('summary-page');
}

/* ─── SAVE BLEND ─────────────────────────────── */
function saveBlend() {
    const blend = {
        id:          Date.now(),
        name:        currentProduct.name,
        ingredients: [...currentProduct.ingredients],
        colors:      [...currentProduct.colors],
        savedAt:     new Date().toLocaleDateString('cs-CZ')
    };
    // Avoid exact duplicates
    const exists = savedBlends.some(b => b.name === blend.name && b.ingredients.join() === blend.ingredients.join());
    if (exists) { showToast('Blend already saved!', '📌'); return; }
    savedBlends.unshift(blend);
    if (savedBlends.length > 20) savedBlends.pop(); // max 20
    localStorage.setItem('teaseyou_saved', JSON.stringify(savedBlends));
    showToast(`"${blend.name}" saved to My Blends!`, '📌');
}

/* ─── SHARE BLEND ────────────────────────────── */
function shareBlend() {
    const text = `Check out my tea blend "${currentProduct.name}" — ${currentProduct.ingredients.filter(i=>i!=='Empty').join(', ')} — made on Tease you 🍵 teaseyou.cz`;
    if (navigator.share) {
        navigator.share({ title: 'My tea blend', text });
    } else {
        navigator.clipboard.writeText(text).then(() => showToast('Blend description copied!', '📋'));
    }
}

/* ─── RENDER SAVED BLENDS ────────────────────── */
function renderSavedBlends() {
    const list  = document.getElementById('saved-list');
    const empty = document.getElementById('saved-empty');
    if (!list) return;
    list.innerHTML = '';

    if (savedBlends.length === 0) {
        empty.style.display = 'flex';
        return;
    }
    empty.style.display = 'none';

    savedBlends.forEach(blend => {
        const card = document.createElement('div');
        card.className = 'saved-card';
        card.innerHTML = `
            <div class="saved-card-glass">
                <div class="cart-mini-glass">
                    <div style="background:${escHtml(blend.colors[2])}"></div>
                    <div style="background:${escHtml(blend.colors[1])}"></div>
                    <div style="background:${escHtml(blend.colors[0])}"></div>
                </div>
            </div>
            <div class="saved-card-info">
                <h3 class="font-cosmico saved-card-name">${escHtml(blend.name)}</h3>
                <p class="saved-card-ingredients font-chaos">${escHtml(blend.ingredients.filter(i=>i!=='Empty').join(' · '))}</p>
                <span class="saved-card-date">Saved ${escHtml(blend.savedAt)}</span>
            </div>
            <div class="saved-card-actions">
                <button class="btn btn-secondary" onclick="loadSavedBlend(${blend.id})">Load &amp; Order</button>
                <button class="clear-btn" onclick="deleteSavedBlend(${blend.id})" style="color:var(--color-ink-faint)">Remove</button>
            </div>
        `;
        list.appendChild(card);
    });
}

function loadSavedBlend(id) {
    const blend = savedBlends.find(b => b.id === id);
    if (!blend) return;
    currentProduct = { name: blend.name, ingredients: [...blend.ingredients], colors: [...blend.colors], priceBase: 0, weight: '' };
    showSummary();
}

function deleteSavedBlend(id) {
    savedBlends = savedBlends.filter(b => b.id !== id);
    localStorage.setItem('teaseyou_saved', JSON.stringify(savedBlends));
    renderSavedBlends();
    showToast('Blend removed', '🗑️');
}

/* ─── ORDER MODAL ────────────────────────────── */
function openOrderModal() {
    const modal = document.getElementById('order-modal');
    modal.style.display = 'flex';
    document.getElementById('final-order-btn').disabled = true;
    document.getElementById('final-order-btn').classList.add('disabled');
    modal.querySelectorAll('.qty-btn').forEach(b => b.classList.remove('selected'));
}
function closeOrderModal() {
    document.getElementById('order-modal').style.display = 'none';
}
document.getElementById('order-modal').addEventListener('click', function(e) {
    if (e.target === this) closeOrderModal();
});

/* ─── CONFIRM ORDER → CART ───────────────────── */
function confirmOrder() {
    closeOrderModal();
    // Merge with an identical line if one already exists
    const sig = JSON.stringify([currentProduct.name, currentProduct.ingredients, currentProduct.weight, currentProduct.priceBase]);
    const existing = cart.find(i => JSON.stringify([i.name, i.ingredients, i.weight, i.priceBase]) === sig);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({
            id:          ++cartIdCounter,
            name:        currentProduct.name,
            ingredients: [...currentProduct.ingredients],
            colors:      [...currentProduct.colors],
            weight:      currentProduct.weight,
            priceBase:   currentProduct.priceBase,
            qty:         1
        });
    }
    saveCart();
    updateCartBadge();
    renderCart();
    showToast(`${currentProduct.name} added to cart!`, '🍵');
    showPage('cart-page');
}

/* ─── CART BADGE ─────────────────────────────── */
function updateCartBadge() {
    const total = cart.reduce((s, i) => s + i.qty, 0);
    let badge = document.getElementById('cart-badge');
    if (!badge) {
        badge = document.createElement('span');
        badge.id = 'cart-badge';
        badge.className = 'cart-badge';
        document.querySelector('.nav-cart-icon').appendChild(badge);
    }
    badge.textContent = total;
    badge.style.display = total > 0 ? 'flex' : 'none';
}

/* ─── RENDER CART ────────────────────────────── */
function renderCart() {
    const list  = document.getElementById('cart-items-list');
    const empty = document.getElementById('cart-empty');
    list.innerHTML = '';
    if (cart.length === 0) {
        empty.style.display = 'flex';
        document.getElementById('cart-final-total').innerText = 'Total: 0 Kč';
        const sub = document.getElementById('cart-subtotal');
        if (sub) sub.textContent = '0 Kč';
        const dl = document.getElementById('cart-discount-line');
        if (dl) dl.style.display = 'none';
        const fs = document.getElementById('cart-freeship');
        if (fs) fs.style.display = 'none';
        return;
    }
    empty.style.display = 'none';
    cart.forEach(item => {
        const row = document.createElement('div');
        row.className = 'cart-item';
        row.innerHTML = `
            <div class="cart-product-info">
                <div class="cart-mini-glass">
                    <div style="background:${escHtml(item.colors[2])}"></div>
                    <div style="background:${escHtml(item.colors[1])}"></div>
                    <div style="background:${escHtml(item.colors[0])}"></div>
                </div>
                <div class="cart-text">
                    <h4 class="font-cosmico cart-item-name">${escHtml(item.name)}</h4>
                    <p class="font-chaos cart-item-ingredients">${escHtml(item.ingredients.join(' \u2022 '))}</p>
                    <span class="cart-item-weight">${escHtml(item.weight)}</span>
                </div>
            </div>
            <div class="cart-price">${fmt(item.priceBase)}</div>
            <div class="cart-qty">
                <input type="number" value="${item.qty}" min="1" class="name-input cart-qty-input"
                    onchange="updateItemQty(${item.id}, this.value)">
            </div>
            <div class="cart-subtotal">
                <b>${fmt(item.priceBase * item.qty)}</b>
                <button onclick="removeCartItem(${item.id})" class="cart-remove-btn" title="Remove">\u2715</button>
            </div>
        `;
        list.appendChild(row);
    });
    updateCartTotal();
}

function updateItemQty(id, value) {
    const qty = Math.max(1, parseInt(value) || 1);
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty = qty;
    saveCart();
    renderCart();
    updateCartBadge();
}
function removeCartItem(id) {
    cart = cart.filter(i => i.id !== id);
    if (cart.length === 0 && appliedPromo) { appliedPromo = null; savePromo(); }
    saveCart();
    renderCart();
    updateCartBadge();
}
function updateCartTotal() {
    const t = computeTotals(0);
    const sub = document.getElementById('cart-subtotal');
    if (sub) sub.textContent = fmt(t.goods);

    const dl = document.getElementById('cart-discount-line');
    if (dl) {
        if (appliedPromo && t.discount > 0) {
            dl.style.display = 'flex';
            document.getElementById('cart-discount-code').textContent = '(' + appliedPromo.code + ')';
            document.getElementById('cart-discount-amount').textContent = '-' + fmt(t.discount);
        } else {
            dl.style.display = 'none';
        }
    }
    // Keep the promo input in sync with stored state
    const promoInput = document.getElementById('promo-input');
    if (promoInput && appliedPromo && !promoInput.value) promoInput.value = appliedPromo.code;
    if (appliedPromo) setPromoFeedback(`Code applied — ${appliedPromo.label || '-' + Math.round(appliedPromo.rate*100) + '%'} 🎉`, true);

    const shipLine = document.getElementById('cart-shipping-line');
    if (shipLine) shipLine.textContent = t.freeShip ? '+ Shipping: FREE' : '+ Shipping: calculated at checkout';

    document.getElementById('cart-final-total').innerText = `Total: ${fmt(t.total)}`;
    renderFreeShip();
}

/* ─── CHECKOUT SUMMARY ───────────────────────── */
function renderCheckoutSummary() {
    const el = document.getElementById('checkout-items-summary');
    el.innerHTML = '';
    cart.forEach(item => {
        const row = document.createElement('div');
        row.className = 'checkout-summary-item';
        row.innerHTML = `
            <div class="checkout-item-left">
                <div class="cart-mini-glass" style="width:28px;height:46px;border-width:2px;">
                    <div style="flex:1;background:${escHtml(item.colors[0])}"></div>
                    <div style="flex:1;background:${escHtml(item.colors[1])}"></div>
                    <div style="flex:1;background:${escHtml(item.colors[2])}"></div>
                </div>
                <div>
                    <p class="font-cosmico checkout-item-name">${escHtml(item.name)}</p>
                    <p class="checkout-item-meta">${escHtml(item.weight)} · qty ${item.qty}</p>
                </div>
            </div>
            <span class="checkout-item-price">${fmt(item.priceBase * item.qty)}</span>
        `;
        el.appendChild(row);
    });

    const t = computeTotals(0);

    // Discount line (insert/update before the total)
    let discRow = document.getElementById('checkout-discount-row');
    if (appliedPromo && t.discount > 0) {
        if (!discRow) {
            discRow = document.createElement('div');
            discRow.id = 'checkout-discount-row';
            discRow.className = 'checkout-shipping-row checkout-discount-row';
            el.parentElement.insertBefore(discRow, document.getElementById('checkout-shipping-row'));
        }
        discRow.innerHTML = `<span>Discount (${escHtml(appliedPromo.code)})</span><span>-${fmt(t.discount)}</span>`;
        discRow.style.display = 'flex';
    } else if (discRow) {
        discRow.style.display = 'none';
    }

    document.getElementById('checkout-total-display').textContent = fmt(t.total);
    // Reset shipping row
    const row = document.getElementById('checkout-shipping-row');
    if (row) row.style.display = 'none';
}

/* ─── CHECKOUT VALIDATION ────────────────────── */
function setFieldError(field, msg) {
    const group = field.closest('.form-group') || field.parentElement;
    let err = group.querySelector('.field-error');
    if (!err) {
        err = document.createElement('span');
        err.className = 'field-error';
        group.appendChild(err);
    }
    err.textContent = msg || '';
    field.classList.toggle('input-error', !!msg);
    field.setAttribute('aria-invalid', msg ? 'true' : 'false');
}
function validateCheckout(form) {
    let ok = true;
    let firstInvalid = null;
    const checks = [
        ['firstName', v => v.trim().length >= 2,                      'Enter your first name'],
        ['lastName',  v => v.trim().length >= 2,                      'Enter your last name'],
        ['email',     v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()), 'Enter a valid email address'],
        ['phone',     v => /^\+?[\d][\d\s]{7,14}$/.test(v.trim()),    'Enter a valid phone number'],
        ['street',    v => v.trim().length >= 3,                      'Enter your street and number'],
        ['city',      v => v.trim().length >= 2,                      'Enter your city'],
        ['zip',       v => /^\d{3}\s?\d{2}$/.test(v.trim()),          'ZIP must be 5 digits (e.g. 110 00)'],
        ['country',   v => !!v,                                        'Please select a country'],
    ];
    checks.forEach(([name, test, msg]) => {
        const field = form.elements[name];
        if (!field) return;
        const valid = test(field.value);
        setFieldError(field, valid ? '' : msg);
        if (!valid) { ok = false; if (!firstInvalid) firstInvalid = field; }
    });
    const ship = form.querySelector('input[name="shipping"]:checked');
    if (!ship) { ok = false; showToast('Please select a shipping method', '🚚'); }
    if (firstInvalid) firstInvalid.focus();
    return ok;
}

/* ─── SUBMIT ORDER ───────────────────────────── */
function submitOrder(e) {
    e.preventDefault();
    const form = e.target;
    if (cart.length === 0) { showToast('Your cart is empty', '🛒'); return; }
    if (!validateCheckout(form)) { showToast('Please check the highlighted fields', '⚠️'); return; }

    const shipRadio = form.querySelector('input[name="shipping"]:checked');
    const shipPrice = shipRadio ? parseFloat(shipRadio.getAttribute('data-price')) || 0 : 0;
    const t = computeTotals(shipPrice);
    const orderNum = 'TY-' + Date.now().toString(36).toUpperCase().slice(-6);

    const order = {
        num:      orderNum,
        date:     new Date().toLocaleDateString('cs-CZ'),
        items:    cart.map(i => ({ name: i.name, ingredients: [...i.ingredients], colors: [...i.colors], weight: i.weight, priceBase: i.priceBase, qty: i.qty })),
        goods:    t.goods,
        discount: t.discount,
        promo:    appliedPromo ? appliedPromo.code : null,
        shipping: t.ship,
        total:    t.total
    };
    orders.unshift(order);
    if (orders.length > 50) orders.pop();
    localStorage.setItem('teaseyou_orders', JSON.stringify(orders));

    const el = document.getElementById('success-order-num');
    if (el) el.textContent = 'Order #' + orderNum;

    cart = [];
    appliedPromo = null;
    saveCart();
    savePromo();
    updateCartBadge();
    showPage('success-page');
}

/* ─── RENDER ORDER HISTORY ───────────────────── */
function renderOrders() {
    const list  = document.getElementById('orders-list');
    const empty = document.getElementById('orders-empty');
    if (!list) return;
    list.innerHTML = '';
    if (orders.length === 0) { empty.style.display = 'flex'; return; }
    empty.style.display = 'none';

    orders.forEach(o => {
        const itemsHtml = o.items.map(it => `
            <div class="order-item-row">
                <span>${escHtml(it.name)} <span class="order-item-meta">${escHtml(it.weight)} × ${it.qty}</span></span>
                <span>${fmt(it.priceBase * it.qty)}</span>
            </div>`).join('');
        const card = document.createElement('div');
        card.className = 'order-card';
        card.innerHTML = `
            <div class="order-card-head">
                <div>
                    <span class="order-num font-cosmico">Order #${escHtml(o.num)}</span>
                    <span class="order-date">${escHtml(o.date)}</span>
                </div>
                <span class="order-status">Confirmed</span>
            </div>
            <div class="order-items">${itemsHtml}</div>
            <div class="order-card-foot">
                ${o.discount ? `<span class="order-discount">Discount${o.promo ? ' (' + escHtml(o.promo) + ')' : ''}: -${fmt(o.discount)}</span>` : ''}
                <span class="order-ship">Shipping: ${o.shipping ? fmt(o.shipping) : 'FREE'}</span>
                <span class="order-total">Total: ${fmt(o.total)}</span>
            </div>`;
        list.appendChild(card);
    });
}

/* ─── NEWSLETTER ─────────────────────────────── */
function subscribeNewsletter(e) {
    e.preventDefault();
    e.target.style.display = 'none';
    document.getElementById('newsletter-success').style.display = 'block';
}

/* ─── ACCESSIBILITY ──────────────────────────── */
function initA11y() {
    const selectors = '.ready-card, .nav-logo, .nav-cart-icon, .nav-menu-icon, .sidebar-nav li, .footer-links a[onclick], .back-link';
    document.querySelectorAll(selectors).forEach(el => {
        if (!el.hasAttribute('role'))     el.setAttribute('role', 'button');
        if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
    });
}
// Activate role="button" elements with keyboard (Enter / Space)
document.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') &&
        e.target.matches('[role="button"]:not(button):not(input):not(textarea):not(select)')) {
        e.preventDefault();
        e.target.click();
    }
});
// Clear a field's error message as the user fixes it
document.addEventListener('input', e => {
    if (e.target.closest('#checkout-form') && e.target.classList.contains('input-error')) {
        setFieldError(e.target, '');
    }
});

/* ─── INIT ───────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.ingredient-btn').forEach(btn => {
        const c = btn.getAttribute('data-color');
        if (c) btn.style.setProperty('--dot-color', c);
    });
    initReveal();
    initCookieBanner();
    initBackToTop();
    initA11y();
    updateCartBadge();   // restore badge from persisted cart
});


/* =============================================
   QUIZ — Tea Finder  v2.0
   ============================================= */

const QUIZ_QUESTIONS = [
    {
        q: "What time of day do you drink most tea?",
        options: [
            { icon:"🌅", text:"Morning — I need a kick-start",   tags:["bold","caffeine"] },
            { icon:"☀️", text:"Afternoon — calm but refreshing",  tags:["fresh","mild"] },
            { icon:"🌙", text:"Evening — wind-down ritual",       tags:["herbal","calm"] },
            { icon:"🌀", text:"Any time, any mood",               tags:["versatile"] },
        ]
    },
    {
        q: "What flavour calls to you most?",
        options: [
            { icon:"🍋", text:"Bright & citrusy",   tags:["citrus"] },
            { icon:"🌸", text:"Floral & delicate",  tags:["floral"] },
            { icon:"🫚", text:"Warm & spicy",        tags:["spice"] },
            { icon:"🍓", text:"Sweet & fruity",     tags:["fruit"] },
        ]
    },
    {
        q: "How do you feel about caffeine?",
        options: [
            { icon:"⚡", text:"Give me all of it",       tags:["caffeine"] },
            { icon:"🔆", text:"A little is fine",        tags:["mild"] },
            { icon:"🌿", text:"None please — herbal only", tags:["herbal","calm"] },
            { icon:"🤷", text:"Don't mind either way",   tags:["versatile"] },
        ]
    },
    {
        q: "Pick your brewing mood:",
        options: [
            { icon:"⏱", text:"Quick — under 3 minutes",   tags:["fresh","mild"] },
            { icon:"🧘", text:"Slow & mindful — I'll wait", tags:["calm","herbal"] },
            { icon:"💪", text:"Strong steep, big flavour", tags:["bold","caffeine"] },
            { icon:"🎲", text:"Surprise me every time",    tags:["versatile"] },
        ]
    },
];

const QUIZ_BLENDS = [
    {
        tags:["bold","caffeine"],
        name:"Ginger Soul",
        desc:"Strong black tea with warming ginger and smooth vanilla. Bold, rich, and energising.",
        ingredients:["Black Tea","Ginger","Vanilla"],
        colors:["#4a3b32","#ff9800","#f3e5ab"]
    },
    {
        tags:["fresh","mild"],
        name:"Zen Master",
        desc:"Bright green tea with cooling mint and a lemon lift. Refreshing any time of day.",
        ingredients:["Green Tea","Mint","Lemon"],
        colors:["#8da676","#4caf50","#ffe066"]
    },
    {
        tags:["herbal","calm"],
        name:"Golden Calm",
        desc:"Soothing chamomile with turmeric warmth and cinnamon spice. Perfect for unwinding.",
        ingredients:["Chamomile","Turmeric","Cinnamon"],
        colors:["#f5d78e","#d4a017","#c8824a"]
    },
    {
        tags:["citrus","fresh"],
        name:"Citrus Storm",
        desc:"Vibrant rooibos with orange zest and spearmint. Uplifting and naturally sweet.",
        ingredients:["Rooibos","Orange","Spearmint"],
        colors:["#e8720c","#ffb347","#a8d8a8"]
    },
    {
        tags:["floral","mild"],
        name:"Midnight Rose",
        desc:"Elegant oolong with rose petals and a hint of lavender. Delicate and aromatic.",
        ingredients:["Oolong Tea","Rose","Lavender"],
        colors:["#c8a0b4","#e8607a","#b8a0cc"]
    },
    {
        tags:["fruit","mild"],
        name:"Berry Blast",
        desc:"White tea with strawberry and honey. Gently sweet and beautifully fragrant.",
        ingredients:["White Tea","Strawberry","Honey"],
        colors:["#f5e6d3","#cc4747","#ffc107"]
    },
];

let quizAnswerTags = [];
let quizStep = 0;

function startQuiz() {
    quizAnswerTags = [];
    quizStep = 0;
    renderQuizStep();
}

function renderQuizStep() {
    const progressBar = document.getElementById('quiz-progress-bar');
    const body = document.getElementById('quiz-body');
    if (!progressBar || !body) return;

    // Progress dots
    progressBar.innerHTML = QUIZ_QUESTIONS.map((_, i) =>
        `<div class="quiz-progress-dot${i < quizStep ? ' done' : ''}"></div>`
    ).join('');

    if (quizStep >= QUIZ_QUESTIONS.length) {
        renderQuizResult();
        return;
    }

    const q = QUIZ_QUESTIONS[quizStep];
    body.innerHTML = `
        <div class="quiz-card">
            <p class="font-chaos" style="font-size:12px;color:var(--color-ink-faint);margin-bottom:12px;letter-spacing:1px;text-transform:uppercase;">Question ${quizStep+1} of ${QUIZ_QUESTIONS.length}</p>
            <h2 class="quiz-question font-cosmico">${q.q}</h2>
            <div class="quiz-options">
                ${q.options.map(opt => `
                    <button class="quiz-option" data-tags="${opt.tags.join(',')}">
                        <span class="quiz-option-icon">${opt.icon}</span>
                        <span>${opt.text}</span>
                    </button>
                `).join('')}
            </div>
        </div>
    `;
    // Attach listeners after DOM is updated
    body.querySelectorAll('.quiz-option').forEach(btn => {
        btn.addEventListener('click', () => {
            const tags = btn.getAttribute('data-tags').split(',');
            quizAnswer(tags);
        });
    });
}

function quizAnswer(tags) {
    quizAnswerTags.push(...tags);
    quizStep++;
    renderQuizStep();
}

function renderQuizResult() {
    const body = document.getElementById('quiz-body');

    // Score each blend
    const scored = QUIZ_BLENDS.map(blend => {
        const score = blend.tags.filter(t => quizAnswerTags.includes(t)).length;
        return { ...blend, score };
    }).sort((a, b) => b.score - a.score);

    const best = scored[0];

    body.innerHTML = `
        <div class="quiz-result">
            <p class="quiz-result-label font-chaos">Your perfect blend is</p>
            <h1 class="logo quiz-result-name">${escHtml(best.name)}</h1>
            <div class="quiz-result-glass">
                <div class="glass-frame" style="width:100%;height:100%;border-color:rgba(0,0,0,0.15)">
                    <div class="glass-part" style="background:${escHtml(best.colors[0])}"></div>
                    <div class="glass-part" style="background:${escHtml(best.colors[1])}"></div>
                    <div class="glass-part" style="background:${escHtml(best.colors[2])}"></div>
                </div>
            </div>
            <p class="quiz-result-desc font-chaos">${escHtml(best.desc)}</p>
            <div class="quiz-actions">
                <button class="btn btn-large" id="quiz-order-btn">Order this blend</button>
                <button class="btn btn-secondary" onclick="startQuiz()">Try again</button>
                <button class="btn btn-ghost" onclick="showPage('home-page')">Back home</button>
            </div>
        </div>
    `;
    document.getElementById('quiz-order-btn').addEventListener('click', () => {
        openDetail(best.name, best.desc, 3.50, best.ingredients, best.colors);
    });
}

/* ─── RANDOM BLEND ───────────────────────────── */
const RANDOM_BASES    = [['part1','Green Tea','#8da676'],['part1','Black Tea','#4a3b32'],['part1','White Tea','#f5e6d3'],['part1','Oolong Tea','#c8a0b4'],['part1','Rooibos','#e8720c'],['part1','Chamomile','#f5d78e']];
const RANDOM_FLAVORS  = [['part2','Strawberry','#cc4747'],['part2','Mint','#4caf50'],['part2','Vanilla','#f3e5ab'],['part2','Rose','#e8607a'],['part2','Orange','#ffb347'],['part2','Blueberry','#9b59b6'],['part2','Raspberry','#e91e8c'],['part2','Cocoa','#795548'],['part2','Coconut','#4fc3f7']];
const RANDOM_EXTRAS   = [['part3','Honey','#ffc107'],['part3','Lemon','#ffe066'],['part3','Ginger','#ff9800'],['part3','Lavender','#b8a0cc'],['part3','Turmeric','#d4a017'],['part3','Cinnamon','#c8824a'],['part3','Spearmint','#a8d8a8'],['part3','Rose Hip','#f8bbd0'],['part3','Cardamom','#80cbc4']];

function randomBlend() {
    const pick = arr => arr[Math.floor(Math.random() * arr.length)];
    const [,baseName,baseColor]     = pick(RANDOM_BASES);
    const [,flavorName,flavorColor] = pick(RANDOM_FLAVORS);
    const [,extraName,extraColor]   = pick(RANDOM_EXTRAS);

    // Clear all
    document.querySelectorAll('.ingredient-btn').forEach(b => b.classList.remove('selected'));

    // Apply each
    [[baseName,'part1',baseColor],[flavorName,'part2',flavorColor],[extraName,'part3',extraColor]].forEach(([name,partId,color]) => {
        const btn = document.querySelector(`.ingredient-btn[data-name="${name}"]`);
        if (btn) btn.classList.add('selected');
        const part = document.getElementById(partId);
        if (part) { part.style.backgroundColor = color; pulseGlassPart(partId); }
        const idx = parseInt(partId.replace('part','')) - 1;
        currentProduct.colors[idx]      = color;
        currentProduct.ingredients[idx] = name;
    });

    // Random name
    const adjectives = ['Morning','Mystic','Wild','Golden','Twilight','Secret','Smoky','Velvet','Crisp','Bold'];
    const nouns      = ['Hour','Dream','Ritual','Escape','Garden','Story','Moment','Harmony'];
    const randomName = pick(adjectives) + ' ' + pick(nouns);
    const nameInput  = document.getElementById('mix-name');
    if (nameInput) nameInput.value = randomName;

    // Update info box with base description
    const baseBtn = document.querySelector(`[data-target="part1"][data-name="${baseName}"]`);
    if (baseBtn) {
        document.getElementById('info-title').innerText = baseName;
        document.getElementById('info-text').innerText  = baseBtn.getAttribute('data-desc') || '';
    }

    animateGlass('main-glass-frame');
    validateSelection();
    updateGlassLabels();
    showToast(`Random blend: ${randomName} 🎲`, '🎲');
}