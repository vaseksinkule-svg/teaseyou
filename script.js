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
let cart = [];
let cartIdCounter = 0;
let savedBlends = JSON.parse(localStorage.getItem('teaseyou_saved') || '[]');

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
    currentProduct.priceBase = amount === 50 ? 1.99 : (amount === 100 ? 3.50 : 7.50);
    ['detail-add-btn','final-order-btn','summary-order-btn'].forEach(id => {
        const b = document.getElementById(id);
        if (b) { b.disabled = false; b.classList.remove('disabled'); }
    });
}

/* ─── SHIPPING COST ──────────────────────────── */
function updateShippingCost(radio) {
    const cost = parseFloat(radio.getAttribute('data-price')) || 0;
    const row = document.getElementById('checkout-shipping-row');
    const costEl = document.getElementById('checkout-shipping-cost');
    const totalEl = document.getElementById('checkout-total-display');
    if (row) row.style.display = 'flex';
    if (costEl) costEl.textContent = '$' + cost.toFixed(2);
    const goods = cart.reduce((s, i) => s + i.priceBase * i.qty, 0);
    if (totalEl) totalEl.textContent = '$' + (goods + cost).toFixed(2);
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
    const item = {
        id:          ++cartIdCounter,
        name:        currentProduct.name,
        ingredients: [...currentProduct.ingredients],
        colors:      [...currentProduct.colors],
        weight:      currentProduct.weight,
        priceBase:   currentProduct.priceBase,
        qty:         1
    };
    cart.push(item);
    updateCartBadge();
    renderCart();
    showToast(`${item.name} added to cart!`, '🍵');
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
        document.getElementById('cart-final-total').innerText = 'Total: $0.00';
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
            <div class="cart-price">$${item.priceBase.toFixed(2)}</div>
            <div class="cart-qty">
                <input type="number" value="${item.qty}" min="1" class="name-input cart-qty-input"
                    onchange="updateItemQty(${item.id}, this.value)">
            </div>
            <div class="cart-subtotal">
                <b>$${(item.priceBase * item.qty).toFixed(2)}</b>
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
    renderCart();
    updateCartBadge();
}
function removeCartItem(id) {
    cart = cart.filter(i => i.id !== id);
    renderCart();
    updateCartBadge();
}
function updateCartTotal() {
    const total = cart.reduce((s, i) => s + i.priceBase * i.qty, 0);
    document.getElementById('cart-final-total').innerText = `Total: $${total.toFixed(2)}`;
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
            <span class="checkout-item-price">$${(item.priceBase * item.qty).toFixed(2)}</span>
        `;
        el.appendChild(row);
    });
    const total = cart.reduce((s, i) => s + i.priceBase * i.qty, 0);
    document.getElementById('checkout-total-display').textContent = `$${total.toFixed(2)}`;
    // Reset shipping row
    const row = document.getElementById('checkout-shipping-row');
    if (row) row.style.display = 'none';
}

/* ─── SUBMIT ORDER ───────────────────────────── */
function submitOrder(e) {
    e.preventDefault();
    const orderNum = 'TY-' + Date.now().toString(36).toUpperCase().slice(-6);
    const el = document.getElementById('success-order-num');
    if (el) el.textContent = 'Order #' + orderNum;
    cart = [];
    updateCartBadge();
    showPage('success-page');
}

/* ─── NEWSLETTER ─────────────────────────────── */
function subscribeNewsletter(e) {
    e.preventDefault();
    e.target.style.display = 'none';
    document.getElementById('newsletter-success').style.display = 'block';
}

/* ─── INIT ───────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.ingredient-btn').forEach(btn => {
        const c = btn.getAttribute('data-color');
        if (c) btn.style.setProperty('--dot-color', c);
    });
    initReveal();
    initCookieBanner();
    initBackToTop();
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