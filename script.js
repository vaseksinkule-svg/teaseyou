/* =============================================
   TEASE YOU — script.js  v2.0
   ============================================= */

/* ─── JAZYK ─────────────────────────────────── */
/* Čeština, slovenština, nebo angličtina. Přednost má volba z přepínače
   v hlavičce (uložená v prohlížeči), jinak jazyk prohlížeče. Kdo nemá
   češtinu ani slovenštinu, dostane angličtinu. */
const LANGS = ['cs', 'sk', 'en'];
const LANG_KEY = 'teaseyou_lang';
const LANG = (() => {
    try {
        const saved = localStorage.getItem(LANG_KEY);
        if (LANGS.includes(saved)) return saved;
    } catch (_) { /* soukromé okno */ }
    const prefs = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ''])
        .map(l => String(l).toLowerCase());
    for (const l of prefs) {
        const code = l.slice(0, 2);
        if (LANGS.includes(code)) return code;
    }
    return 'en';
})();
const LOCALE = { cs: 'cs-CZ', sk: 'sk-SK', en: 'en-GB' }[LANG];
/* Čeština a slovenština píšou desetinnou čárku a „a“ mezi slovy. */
const SLAVIC = LANG !== 'en';

/* ─── TRANSLATIONS ───────────────────────────── */
const TRANSLATIONS = {
    en: {
        /* Nav / Sidebar */
        nav_home:           'Home',
        nav_create:         'Create your own',
        nav_blends:         'My Blends',
        nav_orders:         'My Orders',
        nav_about:          'About',
        nav_cart:           'Cart',
        nav_quiz:           'Find my blend ✨',
        /* Hero buttons */
        btn_create_own:     'Create your own',
        /* Quiz strip */
        /* Stats */
        /* How it works */
        how_title:          'How it works',
        /* FAQ */
        faq_title:          'Frequently asked',
        faq_q1:             'How long does delivery take?',
        faq_a1:             'We blend your order only after you place it and usually ship within 24 hours. Czech Republic: 2–3 business days via Zásilkovna or Česká pošta. Slovakia: 3–5 business days.',
        faq_q2:             'What are the allergens?',
        faq_a2:             'Every blend lists its allergens under Ingredients and food information, based on our suppliers\' specifications. If you have a severe allergy, write to us before ordering.',
        faq_q3:             'Can I return or exchange an order?',
        faq_a3:             'A blend mixed to your choice is made to order, so it cannot be returned without a reason. A ready-made blend can be returned within 14 days if the pouch is unopened. If anything arrives damaged or wrong, write to us and we will send a new one. Details are in our terms.',
        faq_q4:             'How do I brew a blend?',
        faq_a4:             'Use 2–3 grams per 200ml of water. Green and white teas: 75–80°C for 2–3 minutes. Black and oolong: 90–95°C for 3–4 minutes. Herbal (rooibos, chamomile): 100°C for 5–7 minutes. Each package includes a brewing guide card.',
        faq_q5:             'Can I send a blend as a gift?',
        faq_a5:             'Absolutely — it\'s one of our most popular uses! During checkout, add a personal message in the note field and we\'ll include a handwritten card. We also offer gift wrapping on request.',
        faq_q6:             'How long does the tea stay fresh?',
        faq_a6:             'We pack into resealable food-grade pouches. Each one shows a best-before date, usually a year from blending. Keep it dry and dark at room temperature and reseal after opening.',
        /* CTA banner */
        btn_start_creating: 'Start creating →',
        /* Product detail page */
        /* Configurator */
        btn_surprise:       'Surprise me',
        /* Glass panel */
        glass_label_base:   'Base',
        glass_label_flavor: 'Flavor',
        glass_label_extras: 'Extras',
        glass_name_default: 'Name your mix',
        preset_label:       'Quick start:',
        /* Summary page */
        /* Saved blends */
        saved_title:        'My Blends',
        saved_empty:        'No saved blends yet.',
        btn_create_first:   'Create your first blend',
        btn_load_order:     'Load & Order',
        btn_remove:         'Remove',
        saved_date_prefix:  'Saved',
        /* Orders */
        orders_title:       'My Orders',
        orders_empty:       'No orders yet.',
        order_num_prefix:   'Order #',
        order_discount:     'Discount',
        order_shipping:     'Shipping',
        order_total:        'Total',
        /* Cart */
        cart_title:         'Your Cart',
        cart_col_qty:       'Quantity',
        cart_empty_title:   'Your cart is empty',
        cart_empty:         'Your cart is empty.',
        btn_browse_blends:  'Browse blends',
        btn_continue:       '← Continue shopping',
        lbl_promo:          'Discount code',
        btn_apply:          'Apply',
        lbl_subtotal:       'Subtotal',
        ship_calculated:    '+ Shipping: calculated at checkout',
        ship_free:          '+ Shipping: FREE',
        price_from:         'from 49 Kč',
        btn_sending:        'Sending…',
        toast_order_failed: 'The order could not be sent. Your cart is still here — please try again.',
        err_no_weight:      'Pick a size first.',
        ship_free_short:    'FREE',
        btn_checkout:       'Proceed to Checkout',
        /* Checkout */
        checkout_title:     'Shipping',
        checkout_summary:   'Order Summary',
        checkout_contact:   'Contact',
        lbl_firstname:      'First name *',
        lbl_lastname:       'Last name *',
        lbl_email:          'Email *',
        lbl_phone:          'Phone *',
        checkout_address:   'Delivery address',
        lbl_street:         'Street and number *',
        lbl_city:           'City *',
        lbl_zip:            'ZIP *',
        lbl_country:        'Country *',
        country_select:     '— Select —',
        checkout_shipping:  'Shipping method',
        ship_post_desc:     'Delivery in 3–5 business days',
        ship_zasilkovna_desc: 'Pick up at your nearest location',
        ship_dpd_desc:      'Next business day delivery',
        checkout_note:      'Note',
        checkout_note_opt:  '(optional)',
        btn_complete_order: 'Order and pay',
        /* Success page */
        success_title:      'Order placed!',
        success_desc:       'Your blend is on its way. We\'ll brew it fresh and send a confirmation to your email.',
        success_step1:      'Order received',
        success_step2:      'Freshly blended',
        success_step3:      'Shipped to you',
        btn_create_another: 'Create another blend',
        /* Modal */
        /* Cookie */
        /* Footer */
        footer_contact:     'Contact',
        /* Promo feedback */
        promo_cart_first:   'Add something to your cart first.',
        promo_invalid:      'Invalid code.',
        promo_applied:      'Code applied',
        /* Free shipping bar */
        /* Toast / system messages */
        toast_already_saved:    'You already saved this blend.',
        toast_saved:            'saved to My Blends!',
        toast_link_copied:      'Share link copied!',
        toast_removed:          'Blend removed',
        toast_in_cart:          '"{name}" is in your cart',
        toast_discount_applied: 'applied!',
        toast_cart_empty:       'Your cart is empty',
        toast_check_fields:     'Please check the highlighted fields',
        toast_select_shipping:  'Please select a shipping method',
        toast_random:           'Random blend:',
        /* Validation errors */
        err_firstname:  'Enter your first name',
        err_lastname:   'Enter your last name',
        err_email:      'Enter a valid email address',
        err_phone:      'Enter a valid phone number',
        err_street:     'Enter your street and number',
        err_city:       'Enter your city',
        err_zip:        'ZIP must be 5 digits (e.g. 110 00)',
        err_country:    'Please select a country',
        /* Quiz */
        quiz_q1:        'What time of day do you drink most tea?',
        quiz_q1_o1:     'Morning — I need a kick-start',
        quiz_q1_o2:     'Afternoon — calm but refreshing',
        quiz_q1_o3:     'Evening — wind-down ritual',
        quiz_q1_o4:     'Any time, any mood',
        quiz_q2:        'What flavour calls to you most?',
        quiz_q2_o1:     'Bright & citrusy',
        quiz_q2_o2:     'Floral & delicate',
        quiz_q2_o3:     'Warm & spicy',
        quiz_q2_o4:     'Sweet & fruity',
        quiz_q3:        'How do you feel about caffeine?',
        quiz_q3_o1:     'The more the better',
        quiz_q3_o2:     'A little is fine',
        quiz_q3_o3:     'None please — herbal only',
        quiz_q3_o4:     'Don\'t mind either way',
        quiz_q4:        'How do you like to brew?',
        quiz_q4_o1:     'Quick — under 3 minutes',
        quiz_q4_o2:     'Slow & mindful — I\'ll wait',
        quiz_q4_o3:     'Strong steep, big flavour',
        quiz_q4_o4:     'Surprise me every time',
        quiz_q5:        'And the taste you crave?',
        quiz_q5_o1:     'Sweet & fruity',
        quiz_q5_o2:     'Soft & floral',
        quiz_q5_o3:     'Bold & spicy',
        quiz_q5_o4:     'Surprise me',
        quiz_why:       'Why it fits you',
        quiz_also:      'You might also like',
        btn_order_blend: 'Order this blend',
        btn_try_again:   'Try again',
        /* Completion label */
        /* About page */
        about_hero_title:    'Tea is personal.',
        about_hero_subtitle: 'Not some brand\'s version. Yours.',
        about_story_p1:      'Tease you started with a school thesis. The founder spent months studying tea house culture, going from one tea house to the next, and thinking about what makes a good cup worth going back to.',
        about_story_p2:      'That turned into this — a place where you choose every part of your blend yourself. No brand deciding for you. Just your base, your flavour, your name.',
        about_callout_text:  'Every blend is mixed only after you order. Not before.',
        about_card1_title:   'Fresh every time',
        about_card1_desc:    'We blend after you order. Nothing sits pre-packed on a shelf.',
        about_card2_title:   'Your recipe',
        about_card2_desc:    'The mixer is the whole point. Pick a base, a flavour and an extra, set the ratio and name it. That\'s your tea.',
        about_card3_title:   'Real ingredients',
        about_card3_desc:    'Teas, herbs, fruit and spices from checked suppliers. Every blend lists its full ingredients with percentages.',
        about_cta:           'Ready to find your blend?',
        btn_start_creating2: 'Start creating',
        /* SEO */
        page_title:  'Tease you — Mix your own tea blend',
        meta_desc:   'Mix your own loose-leaf tea from up to five ingredients, in any ratio you like. Blended after you order. Free shipping over 500 Kč.',
        /* Ingredients — bases */
        ing_green_tea:      'Green Tea',
        ing_black_tea:      'Black Tea',
        ing_white_tea:      'White Tea',
        ing_oolong:         'Oolong Tea',
        ing_rooibos:        'Rooibos',
        ing_chamomile:      'Chamomile',
        ing_green_tea_desc:  'Fresh and earthy, light caffeine.',
        ing_black_tea_desc:  'Strong and bold, high caffeine.',
        ing_white_tea_desc:  'Delicate and sweet, low caffeine.',
        ing_oolong_desc:     'Complex and floral, medium caffeine.',
        ing_rooibos_desc:    'Earthy and sweet, caffeine-free.',
        ing_chamomile_desc:  'Calm and soothing, caffeine-free.',
        /* Ingredients — flavors */
        ing_strawberry:     'Strawberry',
        ing_mint:           'Mint',
        ing_vanilla:        'Vanilla',
        ing_rose:           'Rose',
        ing_orange:         'Orange',
        ing_blueberry:      'Blueberry',
        ing_raspberry:      'Raspberry',
        ing_cocoa:          'Cocoa',
        ing_coconut:        'Coconut',
        ing_strawberry_desc: 'Sweet and fruity, summery.',
        ing_mint_desc:       'Cooling and fresh, bright.',
        ing_vanilla_desc:    'Sweet, creamy and warm.',
        ing_rose_desc:       'Floral and delicate.',
        ing_orange_desc:     'Citrusy, bright and zesty.',
        ing_blueberry_desc:  'Sweet and tart, tastes like summer.',
        ing_raspberry_desc:  'Tart, fruity and vibrant.',
        ing_cocoa_desc:      'Rich, chocolatey and earthy.',
        ing_coconut_desc:    'Tropical, sweet and creamy.',
        /* Ingredients — extras */
        ing_honey:          'Honey',
        ing_lemon:          'Lemon',
        ing_ginger:         'Ginger',
        ing_lavender:       'Lavender',
        ing_turmeric:       'Turmeric',
        ing_cinnamon:       'Cinnamon',
        ing_spearmint:      'Spearmint',
        ing_rose_hip:       'Rose Hip',
        ing_cardamom:       'Cardamom',
        ing_honey_desc:     'Naturally sweet and soothing.',
        ing_lemon_desc:     'Bright, citrusy and tart.',
        ing_ginger_desc:    'Spicy, warm and zesty.',
        ing_lavender_desc:  'Floral and calming.',
        ing_turmeric_desc:  'Earthy, peppery and warm.',
        ing_cinnamon_desc:  'Warm, spicy and sweet.',
        ing_spearmint_desc: 'Cool, sweet and mild.',
        ing_rose_hip_desc:  'Tart, fruity and tangy.',
        ing_cardamom_desc:  'Exotic, spicy and floral.',
        /* UI labels */
        footer_terms:         'Terms & Conditions',
        footer_privacy:       'Privacy Policy',
        footer_cookies:       'Cookie Policy',
        social_coming_soon:   'Not on social media yet — coming soon!',
        /* Packeta widget */
        packeta_choose:     'Choose pickup point',
        packeta_change:     'Change branch',
        packeta_required:   'Please choose a pickup point',
        packeta_unavailable:'The pickup point map did not load. Please try again.',
        /* Promo bar */
        promo_text:  '🍵 Free shipping on orders over 500 Kč · Use code FIRSTBLEND for 10% off your first order',
        /* Bottom nav */
        nav_quiz_short: 'Quiz',
        /* Ingredients encyclopedia */
        nav_ingredients: 'Ingredients',
        ing_page_title: 'Ingredient Guide',
        ing_page_sub: 'Everything in our palette — and why.',
        ing_cat_bases: 'Bases',
        ing_cat_flavors: 'Flavors',
        ing_cat_extras: 'Extras',
        ing_health: 'Benefits',
        ing_pairs: 'Pairs well with',
        /* Process page */
        nav_process: 'How we do it',
        process_title: 'How we do it',
        process_sub: 'Every order is different. We blend only after you order, exactly as you chose.',
        proc_1_title: 'Ingredient sourcing',
        proc_1_desc: 'For every ingredient we keep the supplier specification (origin, allergens, shelf life). We check each delivery before use: colour, aroma and taste.',
        proc_2_title: 'Precise weighing',
        proc_2_desc: 'Each component is weighed on a digital scale using the same recipe, so the blend tastes the same every time.',
        proc_3_title: 'Blending',
        proc_3_desc: 'We mix the components by hand so they blend evenly and the leaves stay whole.',
        proc_4_title: 'Packaging',
        proc_4_desc: 'We pack into resealable food-grade pouches. Each one shows the blend name, ingredients, best-before date and batch number.',
        proc_5_title: 'Dispatch',
        proc_5_desc: 'Parcels go via Zásilkovna, Česká pošta or DPD, usually within 24 hours of your order.',
        process_cta_title: 'Ready to mix your blend?',
    },
    cs: {
        /* Nav / Sidebar */
        nav_home:           'Domů',
        nav_create:         'Namíchej si vlastní',
        nav_blends:         'Moje blendy',
        nav_orders:         'Moje objednávky',
        nav_about:          'O nás',
        nav_cart:           'Košík',
        nav_quiz:           'Najdi svůj blend ✨',
        /* Hero buttons */
        btn_create_own:     'Namíchej si vlastní',
        /* Quiz strip */
        /* Stats */
        /* How it works */
        how_title:          'Jak to funguje',
        /* FAQ */
        faq_title:          'Časté otázky',
        faq_q1:             'Jak dlouho trvá doručení?',
        faq_a1:             'Směs namícháme až po objednání a obvykle ji odešleme do 24 hodin. Česká republika: 2–3 pracovní dny přes Zásilkovnu nebo Českou poštu. Slovensko: 3–5 pracovních dní.',
        faq_q2:             'Jaké jsou alergeny?',
        faq_a2:             'Alergeny najdeš u každé směsi v části Složení a informace o potravině, a to podle specifikací od našich dodavatelů. Když máš silnou alergii, napiš nám před objednávkou a probereme to.',
        faq_q3:             'Mohu vrátit nebo vyměnit objednávku?',
        faq_a3:             'Směs namíchanou podle tebe děláme na zakázku, takže ji nejde vrátit bez udání důvodu. Hotovou směs z nabídky vrátit můžeš do 14 dnů, pokud je sáček neotevřený. Když cokoli dorazí poškozené nebo jiné, než jsi objednal, napiš nám a pošleme novou. Podrobnosti jsou v obchodních podmínkách.',
        faq_q4:             'Jak směs připravit?',
        faq_a4:             'Použij 2–3 gramy na 200 ml vody. Zelené a bílé čaje: 75–80 °C po dobu 2–3 minut. Černý čaj a oolong: 90–95 °C po dobu 3–4 minut. Bylinkové čaje (rooibos, heřmánek): 100 °C po dobu 5–7 minut. Každé balení obsahuje kartičku s návodem na přípravu.',
        faq_q5:             'Můžu směs poslat jako dárek?',
        faq_a5:             'Určitě, je to jedno z nejoblíbenějších použití. Při objednávce napiš osobní vzkaz do poznámky a přiložíme ručně psanou kartičku. Na přání směs i dárkově zabalíme.',
        faq_q6:             'Jak dlouho čaj vydrží čerstvý?',
        faq_a6:             'Balíme do opakovaně uzavíratelných sáčků pro potraviny. Na každém je datum minimální trvanlivosti, obvykle rok od namíchání. Skladuj v suchu a temnu při pokojové teplotě a po otevření sáček dobře zavři.',
        /* CTA banner */
        btn_start_creating: 'Začít vytvářet →',
        /* Product detail page */
        /* Configurator */
        btn_surprise:       'Překvap mě',
        /* Glass panel */
        glass_label_base:   'Základ',
        glass_label_flavor: 'Příchuť',
        glass_label_extras: 'Doplňky',
        glass_name_default: 'Pojmenuj svůj mix',
        preset_label:       'Rychlý start:',
        /* Summary page */
        /* Saved blends */
        saved_title:        'Moje blendy',
        saved_empty:        'Zatím žádné uložené blendy.',
        btn_create_first:   'Vytvoř svůj první blend',
        btn_load_order:     'Načíst a objednat',
        btn_remove:         'Odebrat',
        saved_date_prefix:  'Uloženo',
        /* Orders */
        orders_title:       'Moje objednávky',
        orders_empty:       'Zatím žádné objednávky.',
        order_num_prefix:   'Objednávka #',
        order_discount:     'Sleva',
        order_shipping:     'Doprava',
        order_total:        'Celkem',
        /* Cart */
        cart_title:         'Tvůj košík',
        cart_col_qty:       'Množství',
        cart_empty_title:   'Košík je prázdný',
        cart_empty:         'Tvůj košík je prázdný.',
        btn_browse_blends:  'Prohlédnout blendy',
        btn_continue:       '← Pokračovat v nákupu',
        lbl_promo:          'Slevový kód',
        btn_apply:          'Použít',
        lbl_subtotal:       'Mezisoučet',
        ship_calculated:    '+ Doprava: bude vypočtena při pokladně',
        ship_free:          '+ Doprava: ZDARMA',
        price_from:         'od 49 Kč',
        btn_sending:        'Odesílám…',
        toast_order_failed: 'Objednávku se nepodařilo odeslat. Košík ti zůstal — zkus to prosím znovu.',
        err_no_weight:      'Nejdřív vyber gramáž.',
        ship_free_short:    'Zdarma',
        btn_checkout:       'Přejít k pokladně',
        /* Checkout */
        checkout_title:     'Doručení',
        checkout_summary:   'Shrnutí objednávky',
        checkout_contact:   'Kontakt',
        lbl_firstname:      'Jméno *',
        lbl_lastname:       'Příjmení *',
        lbl_email:          'E-mail *',
        lbl_phone:          'Telefon *',
        checkout_address:   'Doručovací adresa',
        lbl_street:         'Ulice a číslo *',
        lbl_city:           'Město *',
        lbl_zip:            'PSČ *',
        lbl_country:        'Země *',
        country_select:     '— Vyberte —',
        checkout_shipping:  'Způsob dopravy',
        ship_post_desc:     'Doručení za 3–5 pracovních dní',
        ship_zasilkovna_desc: 'Vyzvednutí na nejbližším výdejním místě',
        ship_dpd_desc:      'Doručení následující pracovní den',
        checkout_note:      'Poznámka',
        checkout_note_opt:  '(nepovinné)',
        btn_complete_order: 'Objednat a zaplatit',
        /* Success page */
        success_title:      'Objednávka odeslána!',
        success_desc:       'Tvůj blend je na cestě. Čerstvě ho namícháme a potvrzení pošleme na tvůj e-mail.',
        success_step1:      'Objednávka přijata',
        success_step2:      'Čerstvě namícháno',
        success_step3:      'Odesláno k tobě',
        btn_create_another: 'Vytvořit další blend',
        /* Modal */
        /* Cookie */
        /* Footer */
        footer_contact:     'Kontakt',
        /* Promo feedback */
        promo_cart_first:   'Nejdřív přidej něco do košíku.',
        promo_invalid:      'Neplatný kód.',
        promo_applied:      'Kód použit',
        /* Free shipping bar */
        /* Toast / system messages */
        toast_already_saved:    'Tuhle směs už máš uloženou.',
        toast_saved:            'uložen do Moje blendy!',
        toast_link_copied:      'Odkaz ke sdílení zkopírován!',
        toast_removed:          'Směs odebrána',
        toast_in_cart:          '„{name}“ je v košíku',
        toast_discount_applied: 'použit!',
        toast_cart_empty:       'Tvůj košík je prázdný',
        toast_check_fields:     'Zkontroluj zvýrazněná pole',
        toast_select_shipping:  'Vyber způsob dopravy',
        toast_random:           'Náhodný blend:',
        /* Validation errors */
        err_firstname:  'Zadej své jméno',
        err_lastname:   'Zadej své příjmení',
        err_email:      'Zadej platnou e-mailovou adresu',
        err_phone:      'Zadej platné telefonní číslo',
        err_street:     'Zadej ulici a číslo',
        err_city:       'Zadej město',
        err_zip:        'PSČ musí mít 5 číslic (např. 110 00)',
        err_country:    'Vyber zemi',
        /* Quiz */
        quiz_q1:        'Kdy nejčastěji piješ čaj?',
        quiz_q1_o1:     'Ráno — potřebuji nakopnout',
        quiz_q1_o2:     'Odpoledne — klidný, ale osvěžující',
        quiz_q1_o3:     'Večer — rituál pro zklidnění',
        quiz_q1_o4:     'Kdykoli, jakoukoli náladu',
        quiz_q2:        'Jaká příchuť tě láká nejvíc?',
        quiz_q2_o1:     'Svěží a citrusová',
        quiz_q2_o2:     'Květinová a jemná',
        quiz_q2_o3:     'Hřejivá a kořeněná',
        quiz_q2_o4:     'Sladká a ovocná',
        quiz_q3:        'Jak se stavíš ke kofeinu?',
        quiz_q3_o1:     'Klidně hodně',
        quiz_q3_o2:     'Trochu nevadí',
        quiz_q3_o3:     'Žádný prosím — jen bylinky',
        quiz_q3_o4:     'Je mi to jedno',
        quiz_q4:        'Jak čaj nejradši připravuješ?',
        quiz_q4_o1:     'Rychle — do 3 minut',
        quiz_q4_o2:     'Pomalu & vědomě — počkám',
        quiz_q4_o3:     'Silný louh, velká chuť',
        quiz_q4_o4:     'Pokaždé mě překvap',
        quiz_q5:        'A jakou chuť si přeješ?',
        quiz_q5_o1:     'Sladkou a ovocnou',
        quiz_q5_o2:     'Jemnou a květinovou',
        quiz_q5_o3:     'Výraznou a kořeněnou',
        quiz_q5_o4:     'Překvap mě',
        quiz_why:       'Proč ti sedí',
        quiz_also:      'Mohlo by ti chutnat i',
        btn_order_blend: 'Objednat tento blend',
        btn_try_again:   'Zkusit znovu',
        /* Completion label */
        /* About page */
        about_hero_title:    'Čaj je osobní.',
        about_hero_subtitle: 'Ne to, co si o čaji myslí někdo jiný. Ten tvůj.',
        about_story_p1:      'Tease you vzniklo kvůli maturitní práci. Zakladatel strávil měsíce studováním kultury čajoven, přecházel z jedné do druhé a přemýšlel, co dělá dobrý šálek takovým, ke kterému se vrátíš.',
        about_story_p2:      'Z toho vzniklo toto — místo, kde si každou část svého blendu vybereš sám. Žádná značka nerozhoduje za tebe. Jen tvůj základ, tvá příchuť, tvůj název.',
        about_callout_text:  'Každou směs mícháme až po objednání. Ne dřív.',
        about_card1_title:   'Vždy čerstvé',
        about_card1_desc:    'Mícháme až po objednání. Nic neleží předbalené na polici.',
        about_card2_title:   'Tvůj recept',
        about_card2_desc:    'Mixér je celý smysl. Vyber základ, příchuť a doplněk, nastav poměr a pojmenuj to. To je tvůj čaj.',
        about_card3_title:   'Skutečné ingredience',
        about_card3_desc:    'Čaje, byliny, ovoce a koření od ověřených dodavatelů. U každé směsi uvádíme celé složení i s procenty.',
        about_cta:           'Připraven/a najít svůj blend?',
        btn_start_creating2: 'Začít vytvářet',
        /* SEO */
        page_title:  'Tease you — Namíchej si vlastní čaj',
        meta_desc:   'Namíchej si vlastní sypaný čaj až z pěti surovin v poměru, jaký chceš. Mícháme až po objednání. Doprava zdarma nad 500 Kč.',
        /* Ingredience — základy */
        ing_green_tea:      'Zelený čaj',
        ing_black_tea:      'Černý čaj',
        ing_white_tea:      'Bílý čaj',
        ing_oolong:         'Oolong',
        ing_rooibos:        'Rooibos',
        ing_chamomile:      'Heřmánek',
        ing_green_tea_desc:  'Svěží a zemitý, nízký kofein.',
        ing_black_tea_desc:  'Silný a výrazný, vysoký kofein.',
        ing_white_tea_desc:  'Jemný a sladký, nízký kofein.',
        ing_oolong_desc:     'Komplexní a květinový, střední kofein.',
        ing_rooibos_desc:    'Zemitý a sladký, bez kofeinu.',
        ing_chamomile_desc:  'Klidný a uklidňující, bez kofeinu.',
        /* Ingredience — příchutě */
        ing_strawberry:     'Jahoda',
        ing_mint:           'Máta',
        ing_vanilla:        'Vanilka',
        ing_rose:           'Růže',
        ing_orange:         'Pomeranč',
        ing_blueberry:      'Borůvka',
        ing_raspberry:      'Malina',
        ing_cocoa:          'Kakao',
        ing_coconut:        'Kokos',
        ing_strawberry_desc: 'Sladká a ovocná, letní.',
        ing_mint_desc:       'Chladivá a svěží, výrazná.',
        ing_vanilla_desc:    'Sladká, krémová a hřejivá.',
        ing_rose_desc:       'Květinová a jemná.',
        ing_orange_desc:     'Citrusový, svěží a šťavnatý.',
        ing_blueberry_desc:  'Sladká a nakyslá, chutná jako léto.',
        ing_raspberry_desc:  'Nakyslá, ovocná a živá.',
        ing_cocoa_desc:      'Bohaté, čokoládové a zemité.',
        ing_coconut_desc:    'Tropický, sladký a krémový.',
        /* Ingredience — doplňky */
        ing_honey:          'Med',
        ing_lemon:          'Citron',
        ing_ginger:         'Zázvor',
        ing_lavender:       'Levandule',
        ing_turmeric:       'Kurkuma',
        ing_cinnamon:       'Skořice',
        ing_spearmint:      'Máta peprná',
        ing_rose_hip:       'Šípek',
        ing_cardamom:       'Kardamom',
        ing_honey_desc:     'Přirozeně sladký a hřejivý.',
        ing_lemon_desc:     'Svěží, citrusový a nakyslý.',
        ing_ginger_desc:    'Pikantní, hřejivý a svěží.',
        ing_lavender_desc:  'Květinová a uklidňující.',
        ing_turmeric_desc:  'Zemitá, pepřová a hřejivá.',
        ing_cinnamon_desc:  'Hřejivá, kořeněná a sladká.',
        ing_spearmint_desc: 'Chladivá, sladká a jemná.',
        ing_rose_hip_desc:  'Nakyslý, ovocný a svěží.',
        ing_cardamom_desc:  'Exotický, kořeněný a květinový.',
        /* UI popisky */
        footer_terms:         'Obchodní podmínky',
        footer_privacy:       'Ochrana osobních údajů',
        footer_cookies:       'Cookie Policy',
        social_coming_soon:   'Na sociálních sítích zatím nejsme — brzy!',
        /* Packeta widget */
        packeta_choose:     'Vybrat výdejní místo',
        packeta_change:     'Změnit pobočku',
        packeta_required:   'Vyber prosím výdejní místo',
        packeta_unavailable:'Výběr výdejních míst se nenačetl. Zkus to prosím znovu.',
        /* Promo bar */
        promo_text:  '🍵 Doprava zdarma při objednávce nad 500 Kč · Použij kód FIRSTBLEND a získej 10 % slevy na první nákup',
        /* Bottom nav */
        nav_quiz_short: 'Quiz',
        /* Ingredients encyclopedia */
        nav_ingredients: 'Ingredience',
        ing_page_title: 'Průvodce ingrediencemi',
        ing_page_sub: 'Vše co jsme přidali do naší palety — a proč.',
        ing_cat_bases: 'Základy',
        ing_cat_flavors: 'Příchutě',
        ing_cat_extras: 'Doplňky',
        ing_health: 'Přínosy',
        ing_pairs: 'Hodí se s',
        /* Process page */
        nav_process: 'Jak to děláme',
        process_title: 'Jak to děláme',
        process_sub: 'Každá objednávka je jiná. Mícháme až po objednání, přesně podle tvého výběru.',
        proc_1_title: 'Výběr surovin',
        proc_1_desc: 'Ke každé surovině máme od dodavatele specifikaci (původ, alergeny, trvanlivost). Každou dodávku před použitím zkontrolujeme: barvu, vůni i chuť.',
        proc_2_title: 'Přesné vážení',
        proc_2_desc: 'Každou složku vážíme na digitální váze podle stejné receptury, takže směs chutná pokaždé stejně.',
        proc_3_title: 'Namíchání',
        proc_3_desc: 'Složky ručně promícháme, aby se rovnoměrně prolnuly a listy zůstaly celé.',
        proc_4_title: 'Balení',
        proc_4_desc: 'Balíme do opakovaně uzavíratelných sáčků pro potraviny. Na každém je jméno směsi, složení, datum minimální trvanlivosti a číslo šarže.',
        proc_5_title: 'Odeslání',
        proc_5_desc: 'Balíky posíláme přes Zásilkovnu, Českou poštu nebo DPD, obvykle do 24 hodin od objednávky.',
        process_cta_title: 'Připraven/a namíchat svůj blend?',
    }
};

/* Slovenština je v i18n-sk.js. Co v ní chybí, ukáže se česky. */
TRANSLATIONS.sk = Object.assign({}, (typeof self !== 'undefined' && self.TEASEYOU_I18N_SK) || {});

/* ─── TRANSLATION HELPER ─────────────────────── */
function t(key) {
    const own = TRANSLATIONS[LANG] && TRANSLATIONS[LANG][key];
    if (own !== undefined) return own;
    if (LANG === 'sk' && TRANSLATIONS.cs[key] !== undefined) return TRANSLATIONS.cs[key];
    if (TRANSLATIONS.en[key] !== undefined) return TRANSLATIONS.en[key];
    return key;
}

/* Text z databáze v jazyce webu: pole name → name_sk, name_cs, name_en.
   Slovenština bez překladu spadne na češtinu, angličtina na češtinu. */
function pickLang(row, field) {
    if (!row) return '';
    const order = LANG === 'en' ? ['en', 'cs'] : LANG === 'sk' ? ['sk', 'cs', 'en'] : ['cs', 'en'];
    for (const l of order) {
        const v = row[field + '_' + l];
        if (Array.isArray(v) ? v.length : (typeof v === 'string' && v.trim())) return v;
    }
    return Array.isArray(row[field + '_cs']) ? [] : '';
}

/* Ingredient names are stored in English internally (data-name keys);
   translate them for display via the ing_* translation keys. */
const ING_KEYS = {
    'Green Tea':'ing_green_tea','Black Tea':'ing_black_tea','White Tea':'ing_white_tea',
    'Oolong Tea':'ing_oolong','Rooibos':'ing_rooibos','Chamomile':'ing_chamomile',
    'Strawberry':'ing_strawberry','Mint':'ing_mint','Vanilla':'ing_vanilla','Rose':'ing_rose',
    'Orange':'ing_orange','Blueberry':'ing_blueberry','Raspberry':'ing_raspberry',
    'Cocoa':'ing_cocoa','Coconut':'ing_coconut',
    'Honey':'ing_honey','Lemon':'ing_lemon','Ginger':'ing_ginger','Lavender':'ing_lavender',
    'Turmeric':'ing_turmeric','Cinnamon':'ing_cinnamon','Spearmint':'ing_spearmint',
    'Rose Hip':'ing_rose_hip','Cardamom':'ing_cardamom'
};
function tIng(name) { return ING_KEYS[name] ? t(ING_KEYS[name]) : name; }

/* ─── APPLY TRANSLATIONS ─────────────────────── */
function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
        el.innerHTML = t(el.getAttribute('data-i18n-html'));
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
        el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
    });
    // Translate ingredient button text and desc
    document.querySelectorAll('[data-i18n-desc]').forEach(el => {
        el.setAttribute('data-desc', t(el.getAttribute('data-i18n-desc')));
    });
    // Právní stránky jsou česky (jazyk smlouvy); v jiném jazyce to řekneme.
    document.querySelectorAll('[data-legal-note]').forEach(el => {
        el.hidden = LANG === 'cs';
        el.textContent = LANG === 'cs' ? '' : t('legal_lang_note');
    });
    const langSel = document.getElementById('lang-select');
    if (langSel) langSel.value = LANG;
    document.querySelectorAll('.footer-lang').forEach(b => {
        if (b.dataset.lang === LANG) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
    });
    // Sync <html lang> with the detected language
    document.documentElement.lang = LANG;
    // Update <title> and <meta name="description"> based on detected language
    document.title = t('page_title');
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', t('meta_desc'));
}

/* ─── PŘEPNUTÍ JAZYKA ───────────────────────── */
/* Uloží volbu a načte stránku znovu, protože jazyk se propisuje do
   katalogu, cen i textů z databáze. Kde zákazník byl (stránka, rozdělaná
   směs v mixéru, otevřená hotová směs), se po načtení obnoví. */
const VIEW_RESTORE_KEY = 'teaseyou_restore';
function setLanguage(code) {
    if (!LANGS.includes(code) || code === LANG) return;
    try { localStorage.setItem(LANG_KEY, code); } catch (_) { /* soukromé okno */ }
    try { sessionStorage.setItem(VIEW_RESTORE_KEY, JSON.stringify(captureViewState())); } catch (_) {}
    location.reload();
}
function captureViewState() {
    const page = document.querySelector('.page.active')?.id || 'home-page';
    const st = { page, y: Math.round(window.scrollY) };
    if (page === 'product-page') {
        st.mix = { items: mixItems.map(x => ({ code: x.code, parts: x.parts })), step: mixerStep, weight: mixerWeight,
                   name: document.getElementById('mix-name')?.value || '' };
    }
    if (page === 'product-detail-page') {
        const b = catalogBlends.find(x => x.name === currentProduct.name);
        if (b) st.blend = b.id; else st.page = 'home-page';
    }
    return st;
}
function restoreViewState() {
    let st = null;
    try {
        st = JSON.parse(sessionStorage.getItem(VIEW_RESTORE_KEY) || 'null');
        sessionStorage.removeItem(VIEW_RESTORE_KEY);
    } catch (_) { return false; }
    if (!st || typeof st !== 'object' || typeof st.page !== 'string' || !/^[a-z-]+-page$/.test(st.page)) return false;
    if (st.page === 'product-page' && st.mix && Array.isArray(st.mix.items)) {
        if (Number.isInteger(st.mix.weight)) mixerWeight = st.mix.weight;
        openInMixer(st.mix.items.map(x => x && x.code), String(st.mix.name || ''), Number(st.mix.step) || 1, st.mix.items.map(x => x && x.parts));
    } else if (st.page === 'product-detail-page' && typeof st.blend === 'string') {
        openBlend(st.blend);
    } else if (document.getElementById(st.page)) {
        showPage(st.page);
    } else {
        return false;
    }
    if (st.y > 0) setTimeout(() => window.scrollTo({ top: st.y, behavior: 'auto' }), 80);
    return true;
}

/* ─── ZÁSILKOVNA / PACKETA ───────────────────── */
// Get your API key at https://app.packeta.com → Integrace → Widget
const PACKETA_API_KEY = 'YOUR_PACKETA_API_KEY';
let packetaPoint = null;

/* ─── STATE ─────────────────────────────────── */
/* Směs, se kterou se zrovna pracuje (mixér nebo detail hotové směsi).
   ingredients jsou kódy surovin, parts jejich díly 1–3 (viz recipe.js). */
let currentProduct = {
    name: 'Custom Mix',
    ingredients: [],
    parts: [],
    colors: [],
    priceBase: 0,
    weight: ''
};
/* Stav z localStorage.
 *
 * Tohle běží na nejvyšší úrovni skriptu, takže jediná výjimka tady shodí
 * všechno pod sebou — funkce se sice vyhoistují, ale `cart`, `appliedPromo`
 * a spol. zůstanou v temporal dead zone. Web se pak vykreslí, jde klikat na
 * ingredience, ale košík i checkout tiše padají. Zákazník nevidí chybu,
 * jen mu nejde nakoupit.
 *
 * Proto: nikdy nevěřit tomu, co je v localStorage. Může to být poškozené
 * půlkou zápisu při zaplněné kvótě, přepsané rozšířením prohlížeče, nebo
 * to může mít starý tvar z minulé verze webu.
 */
function readStore(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        if (raw === null) return fallback;
        const parsed = JSON.parse(raw);
        if (Array.isArray(fallback) && !Array.isArray(parsed)) throw new Error('očekáváno pole');
        return parsed;
    } catch (err) {
        console.warn(`[teaseyou] "${key}" v localStorage je poškozený, zahazuji.`, err);
        try { localStorage.removeItem(key); } catch (_) {}
        return fallback;
    }
}

/* Položka košíku musí mít cenu a množství, jinak by se do součtu dostalo
 * NaN nebo null a celý košík by se rozsypal. */
function isValidCartItem(i) {
    return !!i && typeof i === 'object'
        && typeof i.priceBase === 'number' && isFinite(i.priceBase) && i.priceBase >= 0
        && typeof i.qty === 'number' && isFinite(i.qty) && i.qty > 0
        && Array.isArray(i.colors) && Array.isArray(i.ingredients);
}

/* Starší košíky a uložené směsi mají suroviny ve třech slotech („Empty“
   tam, kde nic nebylo) a žádné díly. Převedou se na seznam a díly 3 + 1 + 1. */
function withRecipe(obj) {
    const { codes, parts } = Recipe.normalize(obj.ingredients, obj.parts);
    const colors = Array.isArray(obj.colors) ? obj.colors.filter(c => c !== 'transparent') : [];
    return Object.assign(obj, { ingredients: codes, parts, colors });
}

let cart = readStore('teaseyou_cart', []).filter(isValidCartItem).map(withRecipe).filter(i => i.ingredients.length);
let cartIdCounter = cart.reduce((m, i) => Math.max(m, i.id || 0), 0);
let savedBlends = readStore('teaseyou_saved', [])
    .filter(b => b && typeof b === 'object' && Array.isArray(b.ingredients)).map(withRecipe);
let orders = readStore('teaseyou_orders', []).filter(o => o && typeof o === 'object');

/* ─── PRICING & CURRENCY (CZK) ───────────────── */
const PRICES = { 50: 49, 100: 89, 250: 199 };  // weight(g) → price (Kč); přepíše katalog z databáze

/* ─── NAPOJENÍ NA SLUŽBY (doplň, než se začne prodávat) ───────────── */
// Bez vyplněného FORMSPREE_ID objednávka nikam nedojde — web běží
// v testovacím režimu a jen to napíše do konzole.
const FORMSPREE_ID = 'YOUR_FORM_ID';

const PAYMENT_GATEWAY = 'none'; // 'gopay' | 'comgate' | 'none' (test mode)
const GOPAY_GOID = 'YOUR_GOPAY_GOID';
const COMGATE_MERCHANT = 'YOUR_COMGATE_MERCHANT';
let FREE_SHIP_THRESHOLD = 500;                  // Kč — přepíše katalog z databáze
const PROMOS = { FIRSTBLEND: { rate: 0.10, label: '-10%' } };

/* Sleva se NIKDY nebere z localStorage tak, jak tam leží — jen se podle ní
 * dohledá kód v PROMOS a sazba se vezme odtud. Bez toho si kdokoliv otevře
 * konzoli, přepíše si `rate` na 0.99 a objedná zboží za 597 Kč za šest korun.
 * Ceník je jediný zdroj pravdy. */
function normalizePromo(stored) {
    if (!stored || typeof stored !== 'object') return null;
    const code = String(stored.code || '').trim().toUpperCase();
    const known = Object.prototype.hasOwnProperty.call(PROMOS, code) ? PROMOS[code] : null;
    if (!known) return null;
    return { code, rate: known.rate, label: known.label };
}

let appliedPromo = normalizePromo(readStore('teaseyou_promo', null));
// Kód z minulé návštěvy. Když web jede s databází, ověří se tam (sleva
// mohla mezitím skončit nebo změnit výši) — viz revalidateStoredPromo().
const storedPromoCode = (() => {
    const p = readStore('teaseyou_promo', null);
    return p && typeof p === 'object' ? String(p.code || '').trim().toUpperCase() : '';
})();

function fmt(n) { return Math.round(n) + ' Kč'; }
function saveCart()  { localStorage.setItem('teaseyou_cart', JSON.stringify(cart)); }
function savePromo() { localStorage.setItem('teaseyou_promo', JSON.stringify(appliedPromo)); }

function cartGoods() {
    return cart.reduce((s, i) => {
        const line = Number(i.priceBase) * Number(i.qty);
        return s + (isFinite(line) ? line : 0);
    }, 0);
}
function computeTotals(shipping = 0, payFee = 0) {
    const goods    = cartGoods();
    // Sazba se drží v rozumných mezích, ať se do součtu nikdy nedostane
    // NaN ani záporná sleva (ta by cenu naopak zvyšovala).
    const rate     = appliedPromo && isFinite(appliedPromo.rate)
        ? Math.min(Math.max(appliedPromo.rate, 0), 1) : 0;
    const discount = Math.round(goods * rate);
    const afterDiscount = goods - discount;
    const freeShip = goods >= FREE_SHIP_THRESHOLD;
    const ship     = freeShip ? 0 : shipping;
    // Příplatek za dobírku platí i při dopravě zdarma (stejně počítá databáze).
    const pay      = Math.max(0, Number(payFee) || 0);
    return { goods, discount, afterDiscount, freeShip, ship, pay, total: afterDiscount + ship + pay };
}

/* Příplatek za zvolený způsob platby v pokladně. */
function selectedPayFee() {
    const r = document.querySelector('#checkout-form input[name="payment"]:checked');
    return r && r.value === 'cod' ? COD_FEE : 0;
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

/* ─── PROMO BAR ──────────────────────────────── */
function dismissPromoBar() {
    document.getElementById('promo-bar').style.display = 'none';
    localStorage.setItem('teaseyou_promo_dismissed', '1');
}

/* ─── SOCIAL COMING SOON ─────────────────────── */
function showSocialComingSoon(e) {
    e.preventDefault();
    showToast(t('social_coming_soon'), '📱');
}

/* ─── TOAST ──────────────────────────────────── */
/* Text hlášky jde přes textContent: bývá v ní jméno směsi, které může
   přijít i ze sdíleného odkazu (?n=…), a to se nesmí vykreslit jako HTML. */
function showToast(msg, icon='🛒') {
    const t = document.getElementById('toast');
    const ic = document.createElement('span');
    ic.textContent = icon;
    t.replaceChildren(ic, ' ' + String(msg));
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

/* ─── COOKIES ────────────────────────────────── */
// Web si v prohlížeči pamatuje jen to, o co si návštěvník sám řekne (košík,
// uložené směsi…). Na to se souhlas nevyžaduje, takže lišta s cookies zmizela.
// Uklidíme po ní i starou odpověď.
try { localStorage.removeItem('teaseyou_cookies'); } catch (_) {}

/* ─── BACK TO TOP ────────────────────────────── */
function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;
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
    const incoming = document.getElementById(pageId);
    if (incoming) {
        incoming.classList.add('active');
        incoming.classList.remove('page-enter');
        void incoming.offsetWidth; // force reflow
        incoming.classList.add('page-enter');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (pageId === 'cart-page')         renderCart();
    if (pageId === 'checkout-page')     renderCheckoutSummary();
    if (pageId === 'cart-page' || pageId === 'checkout-page') applySalesState();
    if (pageId === 'saved-page')        renderSavedBlends();
    if (pageId === 'orders-page')       renderOrders();
    if (pageId === 'home-page')         setTimeout(initReveal, 50);
    if (pageId === 'quiz-page')         setTimeout(startQuiz, 0);
    if (pageId === 'ingredients-page')  renderIngredientEncyclopedia();
    if (pageId === 'craft-page')        renderCraft();
    // Update bottom nav active state
    document.querySelectorAll('.bottom-nav-item, .nav-links [data-page]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.page === pageId);
    });
    document.body.dataset.page = pageId;
    if (pageId === 'product-page' && typeof updateMixerUI === 'function') updateMixerUI();
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
function openDetail(name, desc, price, ingredientsIn, colors, partsIn) {
    const { codes: ingredients, parts } = Recipe.normalize(ingredientsIn, partsIn);
    // Barvy se berou z katalogu — admin je mohl změnit od doby, kdy vznikl
    // kvíz nebo uložený mix.
    colors = ingredients.map((c, i) => ingColor(c) || (colors && colors[i]) || 'transparent');
    currentProduct = { name, desc, priceBase: price, ingredients, parts, colors, weight: '' };
    showDetailPhotoAndStock(name, ingredients);
    document.getElementById('detail-title').innerText = name;
    const localDesc = BLEND_DESCS[name] || desc;
    document.getElementById('detail-desc').innerText = localDesc;
    renderDetailVisual(name, ingredients, parts);
    renderDetailCraft(ingredients);

    // Louhování podle hlavní suroviny
    const brew = brewFor(ingredients, parts);
    const tempEl = document.getElementById('detail-temp');
    const timeEl = document.getElementById('detail-time');
    if (tempEl) tempEl.innerHTML = brew.temp;
    if (timeEl) timeEl.innerHTML = brew.time;

    renderPriceOptions();
    preselectQty(document.querySelector('#product-detail-page .qty-options'));
    showPage('product-detail-page');
}

/* Sáček a seznam ingrediencí na detailu hotové směsi: podíl v % a kolik
   gramů je v sáčku vybrané velikosti. */
function renderDetailVisual(name, ingredients, parts) {
    const weight = parseInt(currentProduct.weight, 10) || 0;
    const box = document.getElementById('detail-pouch');
    if (box) box.innerHTML = pouchHtml({ name, codes: ingredients, parts, size: 'pouch--hero', weight: weight ? weight + ' g' : '' });
    const list = document.getElementById('detail-ingredients-list');
    const r = recipeOf(ingredients, parts, weight);
    if (list) list.innerHTML = r.rows.map(row =>
        `<li>${ingIconHtml(row.code)}`
        + `<span><strong>${escHtml(tIng(row.code))}</strong><span>${row.pct} %${weight ? ` · ${escHtml(fmtGrams(row.grams))}` : ''}</span></span></li>`
    ).join('');
    renderFoodInfo(document.getElementById('detail-food'), ingredients, parts, currentProduct.weight);
}

/* Na detailu je rovnou vybraná prostřední velikost (100 g), ať jde
   tlačítko Do košíku zmáčknout hned. */
function preselectQty(box) {
    if (!box) return;
    const w = sortedWeights();
    const pick = w.includes(100) ? 100 : w[Math.floor(w.length / 2)];
    const btn = [...box.querySelectorAll('.qty-btn')].find(b => parseInt(b.textContent, 10) === pick);
    if (btn) selectQty(pick, { target: btn });
}

/* ─── QUANTITY SELECTION ─────────────────────── */
function selectQty(amount, e) {
    const btn = e.target.closest('.qty-btn');
    if (!btn) return;
    const container = btn.closest('.qty-options');
    container.querySelectorAll('.qty-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    currentProduct.weight    = amount + 'g';
    currentProduct.priceBase = unitPrice(currentProduct.ingredients, currentProduct.parts, amount)
        || unitPrice(currentProduct.ingredients, currentProduct.parts, 100);
    ['detail-add-btn'].forEach(id => {
        const b = document.getElementById(id);
        if (b) { b.disabled = false; b.classList.remove('disabled'); }
    });
    const add = document.getElementById('detail-add-btn');
    if (add) add.textContent = t('add_for').replace('{price}', fmt(currentProduct.priceBase));
    if (btn.closest('#product-detail-page')) renderDetailVisual(currentProduct.name, currentProduct.ingredients, currentProduct.parts);
}

/* ─── SHIPPING COST ──────────────────────────── */
function updateShippingCost() { refreshCheckoutTotals(); }

/* Přepočítá v pokladně dopravu, příplatek za dobírku a celkovou cenu podle
   toho, co je zrovna vybrané. Zákazník tak před odesláním vidí konečnou cenu. */
function refreshCheckoutTotals() {
    const payErr = document.getElementById('payment-error');
    if (payErr && document.querySelector('#checkout-form input[name="payment"]:checked')) payErr.style.display = 'none';
    const shipRadio = document.querySelector('#checkout-form input[name="shipping"]:checked');
    const cost = shipRadio ? parseFloat(shipRadio.getAttribute('data-price')) || 0 : 0;
    const totals = computeTotals(cost, selectedPayFee());
    const row = document.getElementById('checkout-shipping-row');
    const costEl = document.getElementById('checkout-shipping-cost');
    if (row) row.style.display = shipRadio ? 'flex' : 'none';
    if (costEl) costEl.textContent = totals.freeShip ? t('ship_free_short') : fmt(totals.ship);
    const payRow = document.getElementById('checkout-payment-row');
    const payEl = document.getElementById('checkout-payment-cost');
    if (payRow) payRow.style.display = totals.pay ? 'flex' : 'none';
    if (payEl) payEl.textContent = fmt(totals.pay);
    const totalEl = document.getElementById('checkout-total-display');
    if (totalEl) totalEl.textContent = fmt(totals.total);
    return totals;
}

function syncAddressFields() {
    const ship = document.querySelector('#checkout-form input[name="shipping"]:checked');
    const pickup = !!ship && ship.value === 'zasilkovna';
    document.querySelectorAll('#checkout-form .address-only').forEach(el => { el.hidden = pickup; });
    ['f-street', 'f-city', 'f-zip'].forEach(id => {
        const f = document.getElementById(id);
        if (f) { f.required = !pickup; if (pickup) setFieldError(f, ''); }
    });
    const hint = document.getElementById('address-hint');
    if (hint) hint.hidden = !pickup;
}

function handleShippingChange(radio) {
    updateShippingCost(radio);
    syncAddressFields();
    const picker = document.getElementById('packeta-picker');
    if (!picker) return;
    const isZasilkovna = radio.value === 'zasilkovna';
    picker.style.display = isZasilkovna ? 'block' : 'none';
    if (!isZasilkovna) {
        packetaPoint = null;
        const sel = document.getElementById('packeta-selected');
        const btn = document.getElementById('packeta-choose-btn');
        if (sel) sel.style.display = 'none';
        if (btn) btn.style.display = '';
    }
    const errEl = document.getElementById('packeta-error');
    if (errEl) errEl.style.display = 'none';
}

/* Mapa výdejních míst se stáhne ze Zásilkovny až ve chvíli, kdy ji zákazník
   otevře. Do té doby se jejím serverům nic neposílá. */
let packetaLoading = null;
function loadPacketaLibrary() {
    if (typeof Packeta !== 'undefined' && Packeta.Widget) return Promise.resolve(true);
    if (!packetaLoading) {
        packetaLoading = new Promise(resolve => {
            const el = document.createElement('script');
            el.src = 'https://widget.packeta.com/v6/www/js/library.js';
            el.async = true;
            el.onload = () => resolve(true);
            el.onerror = () => { packetaLoading = null; resolve(false); };
            document.head.appendChild(el);
        });
    }
    return packetaLoading;
}
async function openPacketaWidget() {
    await loadPacketaLibrary();
    if (typeof Packeta === 'undefined' || !Packeta.Widget) {
        showToast(t('packeta_unavailable'), '⚠️');
        return;
    }
    // Výdejní místa v zemi z formuláře (bez ní v Česku i na Slovensku)
    const country = (document.getElementById('f-country')?.value || '').toLowerCase();
    Packeta.Widget.pick(PACKETA_API_KEY, onPacketaSelect, {
        country: ['cz', 'sk'].includes(country) ? country : 'cz,sk',
        language: LANG
    });
}

function onPacketaSelect(point) {
    if (!point) return; // user closed the widget without selecting
    packetaPoint = { id: point.id, name: point.name, city: point.city, zip: point.zip };
    const sel     = document.getElementById('packeta-selected');
    const btn     = document.getElementById('packeta-choose-btn');
    const nameEl  = document.getElementById('packeta-branch-name');
    const errEl   = document.getElementById('packeta-error');
    if (nameEl)  nameEl.textContent  = `${point.name}, ${point.city}`;
    if (sel)     sel.style.display   = 'flex';
    if (btn)     btn.style.display   = 'none';
    if (errEl)   errEl.style.display = 'none';
    showToast(`📦 ${point.name}`, '✅');
}

/* ─── PROMO CODES ────────────────────────────── */
function setPromoFeedback(msg, ok) {
    const fb = document.getElementById('promo-feedback');
    if (!fb) return;
    fb.textContent = msg;
    fb.classList.toggle('ok', !!ok);
    fb.classList.toggle('err', !ok && !!msg);
}
async function applyPromo() {
    const input = document.getElementById('promo-input');
    const code  = (input?.value || '').trim().toUpperCase();
    if (!code) { setPromoFeedback('', false); return; }
    if (cart.length === 0) { setPromoFeedback(t('promo_cart_first'), false); return; }
    let promo;
    if (window.TeaDB && TeaDB.configured) {
        // Kódy žijí v databázi a veřejně se vypsat nedají — jen se zeptáme,
        // jestli tenhle konkrétní platí.
        setPromoFeedback(t('promo_checking'), false);
        try {
            const res = await TeaDB.rpc('check_promo', { p_code: code });
            promo = res ? { rate: Number(res.rate), label: res.label } : null;
        } catch (err) {
            console.warn('[teaseyou] Ověření slevového kódu selhalo:', err);
            setPromoFeedback(t('promo_check_failed'), false);
            return;
        }
    } else {
        promo = Object.prototype.hasOwnProperty.call(PROMOS, code) ? PROMOS[code] : null;
    }
    if (!promo) {
        // Překlep nesmí sebrat slevu, kterou už zákazník má uplatněnou.
        // Dřív se tady appliedPromo nulovalo a stačilo se jednou upsat.
        setPromoFeedback(t('promo_invalid'), false);
    } else {
        appliedPromo = { code, rate: promo.rate, label: promo.label };
        setPromoFeedback(`${t('promo_applied')} — ${promo.label} 🎉`, true);
        showToast(`${t('lbl_promo')} "${code}" ${t('toast_discount_applied')}`, '🏷️');
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
        if (text) text.textContent = t('freeship_done');
        wrap.classList.add('unlocked');
    } else {
        if (text) text.innerHTML = escHtml(t('freeship_left')).replace('{amount}', `<strong>${fmt(FREE_SHIP_THRESHOLD - goods)}</strong>`);
        wrap.classList.remove('unlocked');
    }
}

/* ─── CUSTOMIZE FROM READY-MADE ──────────────── */
/* Z detailu hotové směsi do mixéru: suroviny i díly zůstanou, dají se
   upravit a přidat další. */
function modifyReadyMade() {
    openInMixer(currentProduct.ingredients, currentProduct.name, 1, currentProduct.parts);
}

/* ─── INGREDIENT SELECTION ───────────────────── */
/* Klik na surovinu ji do směsi přidá, nebo z ní odebere. Nic se samo
   nepřepíná na další krok: zákazník si vybere, kolik chce, a pokračuje
   tlačítkem Dál (nebo krok přeskočí). */
document.addEventListener('click', function(e) {
    const btn = e.target.closest('#product-page .ingredient-btn');
    if (!btn) return;
    if (btn.classList.contains('is-out')) {
        showToast(t('toast_sold_out'), '🫙');
        return;
    }
    toggleMixItem(btn.getAttribute('data-name'));
});

/* ─── LIVE NAME UPDATE ───────────────────────── */
document.addEventListener('input', function(e) {
    if (e.target.id === 'mix-name' && typeof updateMixerUI === 'function') updateMixerUI();
});

/* Otevře mixér s danými surovinami, díly a jménem. */
function openInMixer(ingredients, name, step, parts) {
    showPage('product-page');
    setMixItems(ingredients, parts);
    const input = document.getElementById('mix-name');
    if (input && name !== undefined) input.value = name || '';
    setMixerStep(step || firstOpenMixerStep(), { scroll: false });
}

/* Z encyklopedie: přidá surovinu do rozdělané směsi a otevře její krok. */
function mixWith(code) {
    const ing = ingByCode(code);
    if (!ing) { showPage('product-page'); return; }
    showPage('product-page');
    if (!mixItems.some(x => x.code === code)) toggleMixItem(code, { quiet: true });
    setMixerStep(MIX_STEP_OF[ing.category] || 1, { scroll: false });
}

/* ─── SAVE BLEND ─────────────────────────────── */
function saveBlend() {
    const blend = {
        id:          Date.now(),
        name:        currentProduct.name,
        ingredients: [...currentProduct.ingredients],
        parts:       [...currentProduct.parts],
        colors:      [...currentProduct.colors],
        savedAt:     new Date().toLocaleDateString(LOCALE)
    };
    if (!blend.ingredients.length) { showToast(t('bar_empty'), '👆'); return; }
    const same = b => b.name === blend.name && b.ingredients.join('|') === blend.ingredients.join('|')
        && (b.parts || []).join() === blend.parts.join();
    if (savedBlends.some(same)) { showToast(t('toast_already_saved'), '📌'); return; }
    savedBlends.unshift(blend);
    if (savedBlends.length > 20) savedBlends.pop(); // max 20
    localStorage.setItem('teaseyou_saved', JSON.stringify(savedBlends));
    showToast(`"${blend.name}" ${t('toast_saved')}`, '📌');
}

/* ─── SHARE BLEND ────────────────────────────── */
function shareBlend() {
    const url  = buildBlendUrl();
    const ings = currentProduct.ingredients.map(tIng).join(', ');
    const text = SLAVIC
        ? `Mrkni na můj čaj „${currentProduct.name}" — ${ings} — namíchaný na Tease you 🍵`
        : `Check out my tea blend "${currentProduct.name}" — ${ings} — made on Tease you 🍵`;
    if (navigator.share) {
        navigator.share({ title: 'Tease you', text, url }).catch(() => {});
    } else {
        navigator.clipboard.writeText(`${text} ${url}`).then(() => showToast(t('toast_link_copied'), '🔗'));
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
        const card = document.createElement('article');
        card.className = 'saved-item';
        card.innerHTML = `
            <div class="saved-pouch" aria-hidden="true">${pouchHtml({ name: blend.name, codes: blend.ingredients, parts: blend.parts, size: 'pouch--xs' })}</div>
            <div class="saved-text">
                <h2 class="saved-name">${escHtml(blend.name)}</h2>
                <p class="saved-mix">${escHtml(blendSubtitle(blend.ingredients))}</p>
                <p class="saved-date">${escHtml(t('saved_date_prefix'))} ${escHtml(blend.savedAt)}</p>
            </div>
            <div class="saved-actions">
                <button class="btn btn-primary btn-small" onclick="loadSavedBlend(${Number(blend.id)})">${escHtml(t('btn_load_order'))}</button>
                <button class="btn btn-link btn-small" onclick="deleteSavedBlend(${Number(blend.id)})">${escHtml(t('btn_remove'))}</button>
            </div>`;
        list.appendChild(card);
    });
}

function loadSavedBlend(id) {
    const blend = savedBlends.find(b => b.id === id);
    if (!blend) return;
    // Suroviny, které už neprodáváme, se vynechají.
    const keep = blend.ingredients.map((c, i) => [c, blend.parts[i]]).filter(([c]) => ingByCode(c));
    const codes = keep.map(x => x[0]);
    const parts = keep.length === blend.ingredients.length ? keep.map(x => x[1]) : null;
    openInMixer(codes, blend.name, recipeOf(codes, parts, 100).ok ? 4 : 1, parts);
}

function deleteSavedBlend(id) {
    savedBlends = savedBlends.filter(b => b.id !== id);
    localStorage.setItem('teaseyou_saved', JSON.stringify(savedBlends));
    renderSavedBlends();
    showToast(t('toast_removed'), '🗑️');
}

/* ─── CONFIRM ORDER → CART ───────────────────── */
function confirmOrder() {
    // Do košíku se nesmí dostat položka bez gramáže a ceny. Dosud to hlídalo
    // jenom `disabled` na tlačítku, což je obrana jen do chvíle, než se na
    // funkci sáhne odjinud (sdílený odkaz, kvíz, budoucí refaktor).
    if (!currentProduct.weight || !(currentProduct.priceBase > 0)) {
        showToast(t('err_no_weight'), '⚖️');
        return;
    }
    const soldOut = outOfStockIn(currentProduct.ingredients);
    if (soldOut.length) {
        showToast(`${t('err_sold_out_named')} ${soldOut.map(tIng).join(', ')}`, '🫙');
        return;
    }
    // Stejná kontrola jako v databázi: limity z vyhlášky a druh čaje.
    const recipe = recipeOf(currentProduct.ingredients, currentProduct.parts, parseInt(currentProduct.weight, 10));
    if (!recipe.ok) {
        showToast(mixErrorText(recipe), '⚠️');
        return;
    }
    // Stejná směs ve stejné velikosti = jen víc kusů
    const sigOf = i => JSON.stringify([i.name, i.ingredients, i.parts, i.weight, i.priceBase]);
    const sig = sigOf(currentProduct);
    const existing = cart.find(i => sigOf(i) === sig);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({
            id:          ++cartIdCounter,
            name:        currentProduct.name,
            ingredients: [...currentProduct.ingredients],
            parts:       [...currentProduct.parts],
            colors:      [...currentProduct.colors],
            weight:      currentProduct.weight,
            priceBase:   currentProduct.priceBase,
            qty:         1
        });
    }
    saveCart();
    updateCartBadge();
    renderCart();
    showToast(t('toast_in_cart').replace('{name}', currentProduct.name), '🍵');

    // Pulse the cart icon to confirm add
    const cartIcon = document.querySelector('.nav-cart-icon');
    if (cartIcon) {
        cartIcon.classList.add('cart-pulse');
        setTimeout(() => cartIcon.classList.remove('cart-pulse'), 600);
    }

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
    const bottom = document.getElementById('bottom-cart-badge');
    if (bottom) { bottom.textContent = total; bottom.style.display = total > 0 ? 'flex' : 'none'; }
}

/* ─── RENDER CART ────────────────────────────── */
function renderCart() {
    const list  = document.getElementById('cart-items-list');
    const empty = document.getElementById('cart-empty');
    list.innerHTML = '';
    document.getElementById('cart-page')?.classList.toggle('is-empty', cart.length === 0);
    if (cart.length === 0) {
        empty.style.display = 'flex';
        document.getElementById('cart-final-total').textContent = fmt(0);
        const sub = document.getElementById('cart-subtotal');
        if (sub) sub.textContent = fmt(0);
        const dl = document.getElementById('cart-discount-line');
        if (dl) dl.style.display = 'none';
        const fs = document.getElementById('cart-freeship');
        if (fs) fs.style.display = 'none';
        return;
    }
    empty.style.display = 'none';
    cart.forEach(item => {
        const row = document.createElement('li');
        row.className = 'cart-item';
        const id = Number(item.id);
        row.innerHTML = `
            <div class="cart-pouch" aria-hidden="true">${pouchHtml({ name: item.name, codes: item.ingredients, parts: item.parts, size: 'pouch--xs' })}</div>
            <div class="cart-text">
                <h2 class="cart-name">${escHtml(item.name)}</h2>
                <p class="cart-mix">${escHtml(blendSubtitle(item.ingredients))}</p>
                <p class="cart-meta">${escHtml(parseInt(item.weight, 10) + ' g')}, ${escHtml(fmt(item.priceBase))} ${escHtml(t('per_piece'))}</p>
            </div>
            <div class="cart-qty" role="group" aria-label="${escHtml(t('cart_col_qty'))}">
                <button type="button" class="qty-step" onclick="updateItemQty(${id}, ${item.qty - 1})" aria-label="${escHtml(t('qty_less'))}"${item.qty <= 1 ? ' disabled' : ''}>−</button>
                <span class="qty-num" aria-live="polite">${item.qty}</span>
                <button type="button" class="qty-step" onclick="updateItemQty(${id}, ${item.qty + 1})" aria-label="${escHtml(t('qty_more'))}">+</button>
            </div>
            <p class="cart-line-price">${fmt(item.priceBase * item.qty)}</p>
            <button type="button" class="cart-remove" onclick="removeCartItem(${id})" aria-label="${escHtml(t('btn_remove'))} ${escHtml(item.name)}">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
            </button>
            <details class="food-info food-info--fold cart-food"><summary>${escHtml(t('food_title'))}</summary>${foodInfoRows(item.ingredients, item.parts, item.weight)}</details>`;
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
    const totals = computeTotals(0);
    const sub = document.getElementById('cart-subtotal');
    if (sub) sub.textContent = fmt(totals.goods);

    const dl = document.getElementById('cart-discount-line');
    if (dl) {
        if (appliedPromo && totals.discount > 0) {
            dl.style.display = 'flex';
            document.getElementById('cart-discount-code').textContent = appliedPromo.code;
            document.getElementById('cart-discount-amount').textContent = '-' + fmt(totals.discount);
        } else {
            dl.style.display = 'none';
        }
    }
    // Keep the promo input in sync with stored state
    const promoInput = document.getElementById('promo-input');
    if (promoInput && appliedPromo && !promoInput.value) promoInput.value = appliedPromo.code;
    if (appliedPromo) setPromoFeedback(`${t('promo_applied')} — ${appliedPromo.label || '-' + Math.round(appliedPromo.rate*100) + '%'} 🎉`, true);

    const shipLine = document.getElementById('cart-shipping-line');
    if (shipLine) shipLine.textContent = totals.freeShip ? t('ship_free') : t('ship_calculated');

    document.getElementById('cart-final-total').textContent = fmt(totals.total);
    renderFreeShip();
}

/* ─── CHECKOUT SUMMARY ───────────────────────── */
function renderCheckoutSummary() {
    const el = document.getElementById('checkout-items-summary');
    el.innerHTML = '';
    cart.forEach(item => {
        const row = document.createElement('li');
        row.className = 'checkout-item';
        row.innerHTML = `
            <span class="checkout-dots" aria-hidden="true">${item.ingredients.map(c => `<i style="--c:${escHtml(ingColor(c) || '#ccc')}"></i>`).join('')}</span>
            <span class="checkout-item-text"><strong>${escHtml(item.name)}</strong><span>${escHtml(parseInt(item.weight, 10) + ' g')}, ${item.qty} ${escHtml(t('pieces'))}</span></span>
            <span class="checkout-item-price">${fmt(item.priceBase * item.qty)}</span>`;
        el.appendChild(row);
    });

    const totals = computeTotals(0);

    // Discount line (insert/update before the total)
    let discRow = document.getElementById('checkout-discount-row');
    if (appliedPromo && totals.discount > 0) {
        if (!discRow) {
            discRow = document.createElement('div');
            discRow.id = 'checkout-discount-row';
            discRow.className = 'sum-line sum-line-discount';
            el.parentElement.insertBefore(discRow, document.getElementById('checkout-shipping-row'));
        }
        discRow.innerHTML = `<span>${t('order_discount')} (${escHtml(appliedPromo.code)})</span><span>-${fmt(totals.discount)}</span>`;
        discRow.style.display = 'flex';
    } else if (discRow) {
        discRow.style.display = 'none';
    }

    refreshCheckoutTotals();
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
    const shipChoice = form.querySelector('input[name="shipping"]:checked');
    const needsAddress = !shipChoice || shipChoice.value !== 'zasilkovna';
    const checks = [
        ['firstName', v => v.trim().length >= 2,                      t('err_firstname')],
        ['lastName',  v => v.trim().length >= 2,                      t('err_lastname')],
        ['email',     v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()), t('err_email')],
        ['phone',     v => /^\+?[\d][\d\s]{7,14}$/.test(v.trim()),    t('err_phone')],
        ['street',    v => v.trim().length >= 3,                      t('err_street')],
        ['city',      v => v.trim().length >= 2,                      t('err_city')],
        ['zip',       v => /^\d{3}\s?\d{2}$/.test(v.trim()),          t('err_zip')],
        ['country',   v => !!v,                                        t('err_country')],
    ];
    checks.forEach(([name, test, msg]) => {
        const field = form.elements[name];
        if (!field) return;
        if (!needsAddress && ['street', 'city', 'zip'].includes(name)) { setFieldError(field, ''); return; }
        const valid = test(field.value);
        setFieldError(field, valid ? '' : msg);
        if (!valid) { ok = false; if (!firstInvalid) firstInvalid = field; }
    });
    const ship = form.querySelector('input[name="shipping"]:checked');
    if (!ship) { ok = false; showToast(t('toast_select_shipping'), '🚚'); }
    // Platba není předvybraná: dobírka stojí víc a příplatek smí zákazník
    // jen sám výslovně zvolit (ne odklikávat předvolbu).
    const payErr = document.getElementById('payment-error');
    const paid = form.querySelector('input[name="payment"]:checked');
    if (payErr) payErr.style.display = paid ? 'none' : 'block';
    if (!paid) { ok = false; if (!firstInvalid) firstInvalid = form.querySelector('input[name="payment"]'); }
    if (ship && ship.value === 'zasilkovna' && !packetaPoint) {
        const errEl = document.getElementById('packeta-error');
        if (errEl) { errEl.textContent = t('packeta_required'); errEl.style.display = 'block'; }
        if (!firstInvalid) firstInvalid = document.getElementById('packeta-choose-btn');
        ok = false;
    }
    if (firstInvalid) firstInvalid.focus();
    return ok;
}

/* ─── SUBMIT ORDER ───────────────────────────── */
function submitOrder(e) {
    e.preventDefault();
    const form = e.target;
    if (!salesOpen()) { showToast(t('sales_closed_toast'), '🌱'); applySalesState(); return; }
    if (cart.length === 0) { showToast(t('toast_cart_empty'), '🛒'); return; }
    if (!validateCheckout(form)) { showToast(t('toast_check_fields'), '⚠️'); return; }

    // Košík mohl vzniknout před změnou v nabídce. Vyprodanou ingredienci nebo
    // zrušenou gramáž radši zachytíme tady než až odmítnutím z databáze.
    const soldOut = [...new Set(cart.flatMap(i => outOfStockIn(i.ingredients)))];
    if (soldOut.length) {
        showToast(`${t('err_sold_out_named')} ${soldOut.map(tIng).join(', ')}`, '🫙');
        return;
    }
    if (cart.some(i => !PRICES[parseInt(i.weight, 10)])) {
        showToast(t('err_weight_unavailable'), '⚖️');
        return;
    }

    const shipRadio = form.querySelector('input[name="shipping"]:checked');
    const shipPrice = shipRadio ? parseFloat(shipRadio.getAttribute('data-price')) || 0 : 0;
    const totals = computeTotals(shipPrice, selectedPayFee());
    const orderNum = 'TY-' + Date.now().toString(36).toUpperCase().slice(-6);

    const order = {
        num:      orderNum,
        date:     new Date().toLocaleDateString(LOCALE),
        created:  new Date().toISOString(),
        items:    cart.map(i => ({ name: i.name, ingredients: [...i.ingredients], parts: [...i.parts], colors: [...i.colors], weight: i.weight, priceBase: i.priceBase, qty: i.qty })),
        goods:       totals.goods,
        discount:    totals.discount,
        promo:       appliedPromo ? appliedPromo.code : null,
        shipping:    totals.ship,
        payment:     totals.pay,
        total:       totals.total,
        packetaPoint: packetaPoint ? `${packetaPoint.name}, ${packetaPoint.city}` : null
    };

    // Platební brána není dodělaná. Kdyby se přepnula, zákazníkovi by se
    // vyprázdnil košík, ukázala se hláška o přesměrování a pak nic — žádná
    // platba, žádné potvrzení. Radši to zastavíme rovnou a nahlas.
    if (PAYMENT_GATEWAY !== 'none') {
        console.error(`[teaseyou] PAYMENT_GATEWAY="${PAYMENT_GATEWAY}", ale napojení na backend není hotové.`);
        showToast(t('toast_order_failed'), '⚠️');
        return;
    }

    // Od téhle chvíle je formulář zamčený, ať dvojklik nepošle objednávku dvakrát.
    const submitBtn = form.querySelector('button[type="submit"], #final-order-btn');
    if (submitBtn && submitBtn.dataset.sending === '1') return;
    const unlock = () => {
        if (!submitBtn) return;
        delete submitBtn.dataset.sending;
        submitBtn.disabled = false;
        submitBtn.classList.remove('disabled');
        if (submitBtn.dataset.label) submitBtn.textContent = submitBtn.dataset.label;
    };
    if (submitBtn) {
        submitBtn.dataset.sending = '1';
        submitBtn.dataset.label = submitBtn.dataset.label || submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.classList.add('disabled');
        submitBtn.textContent = t('btn_sending');
    }

    // Dokončení objednávky: uložit do historie, vyčistit košík, poděkovat.
    // Volá se AŽ když víme, že objednávka opravdu odešla.
    const finish = (serverResult) => {
        // Z databáze přijde finální číslo objednávky a ceny spočítané serverem.
        if (serverResult) {
            order.num      = serverResult.num;
            order.goods    = serverResult.goods;
            order.discount = serverResult.discount;
            order.shipping = serverResult.shipping;
            if (Number.isFinite(serverResult.payment)) order.payment = serverResult.payment;
            order.total    = serverResult.total;
        }
        orders.unshift(order);
        if (orders.length > 50) orders.pop();
        try { localStorage.setItem('teaseyou_orders', JSON.stringify(orders)); } catch (_) {}

        const el = document.getElementById('success-order-num');
        if (el) el.textContent = t('order_num_prefix') + order.num;
        const pouch = document.getElementById('success-pouch');
        const first = order.items[0];
        if (pouch && first) pouch.innerHTML = pouchHtml({ name: first.name, codes: first.ingredients, parts: first.parts, size: 'pouch--sm' });

        cart = [];
        appliedPromo = null;
        packetaPoint = null;
        saveCart();
        savePromo();
        updateCartBadge();
        unlock();
        showPage('success-page');
        launchConfetti();
    };

    // S databází: objednávku založí funkce place_order(), která si cenu
    // spočítá sama z ceníku. Formspree (když je nastavený) pak jen pošle
    // e-mail navíc, na výsledku objednávky nezávisí.
    if (window.TeaDB && TeaDB.configured) {
        TeaDB.rpc('place_order', { p_order: buildOrderPayload(form) })
            .then(res => {
                if (!res || !res.num) throw new Error('place_order nevrátil číslo objednávky');
                finish(res);
                notifyFormspree(form, order);
            })
            .catch(err => {
                // Odmítnutí z databáze (vyprodáno, neplatná sleva…) je běžná
                // situace, zákazník dostane hlášku. Chyba je jen to ostatní.
                const expected = ORDER_ERROR_CODES.has(err && err.message);
                (expected ? console.warn : console.error)('[teaseyou] Objednávku se nepodařilo založit:', err);
                unlock();
                handleOrderError(err);
            });
        return;
    }

    // Objednávka bez nastaveného Formspree nikam nedojde. Dřív se i tak
    // ukázaly konfety — zákazník si myslel, že nakoupil, a majitel o objednávce
    // nevěděl. Teď je to vidět aspoň v konzoli a v testovacím režimu.
    if (FORMSPREE_ID === 'YOUR_FORM_ID') {
        console.warn('[teaseyou] FORMSPREE_ID není vyplněný — objednávka se nikam neodesílá (testovací režim).');
        finish();
        return;
    }

    const fd = new FormData(form);
    fd.append('_subject', `Nová objednávka ${orderNum} — Tease you`);
    fd.append('order_json', JSON.stringify(order, null, 2));

    fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST', body: fd, headers: { Accept: 'application/json' }
    })
        .then(res => {
            if (!res.ok) throw new Error('Formspree odpověděl ' + res.status);
            finish();
        })
        .catch(err => {
            // Košík zůstává, ať to jde zkusit znovu. Poděkování se neukáže —
            // dřív se ukázalo vždycky, i když objednávka nikam nedošla.
            console.error('[teaseyou] Objednávku se nepodařilo odeslat:', err);
            unlock();
            showToast(t('toast_order_failed'), '⚠️');
        });
}

function launchConfetti() {
    const colors = ['#3a5f3c','#87ab68','#f5d78e','#e8607a','#ffc107','#f5f1e9'];
    const count = 80;
    const container = document.body;
    for (let i = 0; i < count; i++) {
        const el = document.createElement('div');
        el.className = 'confetti-piece';
        el.style.cssText = `
            left: ${Math.random() * 100}vw;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            width: ${6 + Math.random() * 8}px;
            height: ${6 + Math.random() * 8}px;
            animation-delay: ${Math.random() * 0.8}s;
            animation-duration: ${1.2 + Math.random() * 1.2}s;
            border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
            transform: rotate(${Math.random() * 360}deg);
        `;
        container.appendChild(el);
        el.addEventListener('animationend', () => el.remove());
    }
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
        const itemsHtml = (o.items || []).map(it => `
            <li><span>${escHtml(it.name)} <span class="order-meta">${escHtml(parseInt(it.weight, 10) + ' g')}, ${Number(it.qty)} ${escHtml(t('pieces'))}</span></span>
            <span>${fmt(it.priceBase * it.qty)}</span></li>`).join('');
        const card = document.createElement('article');
        card.className = 'order-card';
        card.innerHTML = `
            <header class="order-head">
                <h2 class="order-num">${escHtml(t('order_num_prefix'))}${escHtml(o.num)}</h2>
                <p class="order-date">${escHtml(o.date)}</p>
            </header>
            <ul class="order-items">${itemsHtml}</ul>
            <dl class="order-sums">
                ${o.discount ? `<div><dt>${escHtml(t('order_discount'))}${o.promo ? ' ' + escHtml(o.promo) : ''}</dt><dd>-${fmt(o.discount)}</dd></div>` : ''}
                <div><dt>${escHtml(t('order_shipping'))}</dt><dd>${o.shipping ? fmt(o.shipping) : escHtml(t('ship_free_short'))}</dd></div>
                <div class="order-total"><dt>${escHtml(t('order_total'))}</dt><dd>${fmt(o.total)}</dd></div>
            </dl>
            ${orderWithdrawable(o) ? `<p class="order-actions"><button type="button" class="btn btn-quiet btn-small" data-withdraw="${escHtml(o.num)}">${escHtml(t('wd_button'))}</button></p>` : ''}`;
        list.appendChild(card);
    });
}

/* ─── ODSTOUPENÍ OD SMLOUVY ──────────────────
   Tlačítko „Odstoupit od smlouvy“ (§ 1830a občanského zákoníku, od
   1. 1. 2027): krok 1 formulář, krok 2 „Potvrdit odstoupení od smlouvy“,
   hned potom potvrzení s datem a časem. Admin ho pak pošle i e-mailem. */
function orderDate(o) {
    if (o.created) { const d = new Date(o.created); if (!isNaN(d)) return d; }
    const m = /^(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})/.exec(o.date || '');
    return m ? new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1])) : null;
}
// Lhůta je 14 dnů od převzetí. Den převzetí neznáme, tak tlačítko necháme
// 30 dnů od objednání; o pozdním odstoupení rozhodne admin.
function orderWithdrawable(o) {
    const d = orderDate(o);
    return !!o.num && !!d && Date.now() - d.getTime() < 30 * 864e5;
}

function openWithdrawalForm(num) {
    const form = document.getElementById('wd-form');
    const start = document.getElementById('wd-start');
    const done = document.getElementById('wd-done');
    if (!form) return;
    form.hidden = false;
    if (done) done.hidden = true;
    if (start) start.setAttribute('aria-expanded', 'true');
    if (num) form.elements.orderNum.value = num;
    (num ? form.elements.name : form.elements.orderNum).focus();
}

function startWithdrawal(num) {
    showPage('withdrawal-page');
    openWithdrawalForm(num);
}

async function submitWithdrawal(e) {
    e.preventDefault();
    const form = e.target;
    const err = document.getElementById('wd-error');
    const v = n => String(form.elements[n].value || '').trim();
    const data = {
        orderNum: v('orderNum').toUpperCase(), name: v('name'), email: v('email'),
        items: v('items'), bankAccount: v('bankAccount'), note: v('note'),
    };
    const problems = [];
    if (!/^TY-[0-9A-Z]{3,12}$/.test(data.orderNum)) problems.push(['orderNum', t('wd_err_num')]);
    if (data.name.length < 2) problems.push(['name', t('err_firstname')]);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) problems.push(['email', t('err_email')]);
    ['orderNum', 'name', 'email'].forEach(n => setFieldError(form.elements[n], ''));
    problems.forEach(([n, msg]) => setFieldError(form.elements[n], msg));
    if (problems.length) { form.elements[problems[0][0]].focus(); return; }

    const btn = document.getElementById('wd-confirm');
    if (btn.disabled) return;
    btn.disabled = true;
    if (err) err.style.display = 'none';
    let when = new Date();
    let saved = false;
    if (window.TeaDB && TeaDB.configured) {
        try {
            const res = await TeaDB.rpc('submit_withdrawal', { p: data });
            if (res && res.created_at) when = new Date(res.created_at);
            saved = true;
        } catch (ex) {
            console.warn('[teaseyou] Odstoupení se nepodařilo uložit:', ex);
            btn.disabled = false;
            if (err) {
                err.textContent = (ex && ex.message === 'too_many') ? t('wd_err_many') : t('wd_err_failed');
                err.style.display = 'block';
            }
            return;
        }
    }
    btn.disabled = false;
    showWithdrawalDone(data, when, saved);
}

function showWithdrawalDone(data, when, saved) {
    const form = document.getElementById('wd-form');
    const done = document.getElementById('wd-done');
    if (!done) return;
    const stamp = when.toLocaleString('cs-CZ', { day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const address = SELLER.address || '[doplnit]';
    const mail = `mailto:${SELLER.email}?subject=${encodeURIComponent('Odstoupení od smlouvy ' + data.orderNum)}&body=${encodeURIComponent(
        `Odstupuji od smlouvy k objednávce ${data.orderNum}.\nJméno: ${data.name}\nE-mail: ${data.email}` +
        (data.items ? `\nZboží: ${data.items}` : '') + (data.bankAccount ? `\nÚčet: ${data.bankAccount}` : ''))}`;
    done.innerHTML = saved ? `
        <h3>${escHtml(t('wd_done_title'))}</h3>
        <dl class="legal-facts">
            <div><dt>${escHtml(t('wd_done_when'))}</dt><dd>${escHtml(stamp)}</dd></div>
            <div><dt>${escHtml(t('wd_done_order'))}</dt><dd>${escHtml(data.orderNum)}</dd></div>
            <div><dt>${escHtml(t('wd_done_who'))}</dt><dd>${escHtml(data.name)}, ${escHtml(data.email)}</dd></div>
            ${data.items ? `<div><dt>${escHtml(t('wd_done_items'))}</dt><dd>${escHtml(data.items)}</dd></div>` : ''}
        </dl>
        <p>${escHtml(t('wd_done_next').replace('{address}', address))}</p>
        <p class="withdrawal-actions"><button type="button" class="btn btn-quiet" onclick="document.body.classList.add('print-wd'); window.print(); document.body.classList.remove('print-wd');">${escHtml(t('wd_done_print'))}</button></p>`
        : `<h3>${escHtml(t('wd_offline_title'))}</h3>
        <p>${escHtml(t('wd_offline_text'))}</p>
        <p class="withdrawal-actions"><a class="btn btn-primary" href="${escHtml(mail)}">${escHtml(t('wd_offline_send'))}</a></p>`;
    done.hidden = false;
    if (form && saved) { form.hidden = true; form.reset(); }
    const start = document.getElementById('wd-start');
    if (start && saved) start.setAttribute('aria-expanded', 'false');
    done.focus();
}

document.addEventListener('click', e => {
    const w = e.target.closest('[data-withdraw]');
    if (w) { startWithdrawal(w.dataset.withdraw); return; }
    if (e.target.closest('#wd-start')) {
        const form = document.getElementById('wd-form');
        if (form && !form.hidden) { form.hidden = true; e.target.closest('#wd-start').setAttribute('aria-expanded', 'false'); }
        else openWithdrawalForm('');
    }
});
document.addEventListener('submit', e => { if (e.target.id === 'wd-form') submitWithdrawal(e); });


/* ─── ACCESSIBILITY ──────────────────────────── */
function initA11y() {
    const selectors = '.ready-card, .nav-logo, .nav-cart-icon, .nav-menu-icon, .footer-links a[onclick], .back-link';
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

/* ─── INGREDIENT DATA ──────────────── */
/* Suroviny po skupinách. Plní je applyIngredientRows: nejdřív vestavěná
   nabídka (BUILTIN_INGREDIENTS), pak katalog z databáze. */
const ING_DATA = { bases: [], flavors: [], extras: [] };

function renderIngredientEncyclopedia() {
    const caffeineCs = ['Bez kofeinu', 'Velmi málo kofeinu', 'Málo kofeinu', 'Středně kofeinu', 'Hodně kofeinu'];
    const caffeineEn = ['Caffeine-free', 'Very little caffeine', 'Little caffeine', 'Medium caffeine', 'Lots of caffeine'];
    const caffeineSk = ['Bez kofeínu', 'Veľmi málo kofeínu', 'Málo kofeínu', 'Stredne veľa kofeínu', 'Veľa kofeínu'];
    ['bases','flavors','extras'].forEach(cat => {
        const el = document.getElementById('ing-grid-' + cat);
        if (!el) return;
        el.innerHTML = ING_DATA[cat].map(ing => {
            const name = t(ing.key);
            const desc = t(ing.key + '_desc') || '';
            const out = ing.inStock === false;
            const dot = ingIconHtml(ing.code);
            const lvl = Math.max(0, Math.min(4, ing.caffeine || 0));
            const caffeine = ing.caffeine !== undefined
                ? `<p class="ing-caffeine"><span class="ing-meter" aria-hidden="true">${[1,2,3,4].map(n => `<i${n <= lvl ? ' class="on"' : ''}></i>`).join('')}</span>${escHtml(({ cs: caffeineCs, sk: caffeineSk, en: caffeineEn }[LANG])[lvl])}</p>` : '';
            return `<article class="ing-card${out ? ' is-out' : ''}">
                <div class="ing-card-head">${dot}<h3 class="ing-card-name">${escHtml(name)}</h3>${out ? `<span class="ing-out-badge">${escHtml(t('ing_sold_out'))}</span>` : ''}</div>
                <p class="ing-card-desc">${escHtml(desc)}</p>
                ${caffeine}
                <p class="ing-card-taste">${escHtml(ing.flavor.join(', '))}</p>
                <p class="ing-card-pairs">${escHtml(t('ing_pairs'))} ${escHtml(ing.pairs.map(tIng).join(', '))}</p>
                ${craftUsing(ing.code).length ? `<p class="ing-card-craft">${escHtml(t('craft_also_in'))} ${craftUsing(ing.code).map(p => `<button type="button" class="link-btn" data-craft="${escHtml(p.id)}">${escHtml(craftName(p))}</button>`).join(', ')}</p>` : ''}
                ${out || !ing.code ? '' : `<button type="button" class="btn btn-quiet btn-small ing-use" data-mix="${escHtml(ing.code)}">${escHtml(t('ing_use'))}</button>`}
            </article>`;
        }).join('');
    });
}

/* ─── INIT ───────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    // Nejdřív vestavěná nabídka, pak katalog z minulé návštěvy, ať se nové
    // ceny a nabídka ukážou bez probliknutí. Čerstvý se dotáhne na konci
    // (refreshCatalog).
    applyBuiltinCatalog();
    applyCachedCatalog();
    repriceCart();
    renderIngredientButtons();
    renderBlendCards();
    applyTranslations();
    initRedesign();
    initCraft();
    if (localStorage.getItem('teaseyou_promo_dismissed')) {
        const bar = document.getElementById('promo-bar');
        if (bar) bar.style.display = 'none';
    }
    applySalesState();
    initReveal();
    applySeller();
    initBackToTop();
    initA11y();
    updateCartBadge();   // restore badge from persisted cart
    renderIngredientEncyclopedia();
    renderPresets();
    renderSavedBlends();
    renderCart();
    // sdílený odkaz (?b=…), jinak místo, kde zákazník byl před přepnutím jazyka
    if (new URLSearchParams(location.search).get('b')) loadBlendFromUrl();
    else restoreViewState();
    refreshCatalog();    // čerstvá data ze Supabase (když je nastavený)

});


/* =============================================
   QUIZ — Tea Finder  v2.0
   ============================================= */

const QUIZ_QUESTIONS = [
    {
        q: "quiz_q1",
        options: [
            { icon:"🌅", text:"quiz_q1_o1", tags:["bold","caffeine"] },
            { icon:"☀️", text:"quiz_q1_o2", tags:["fresh","mild"] },
            { icon:"🌙", text:"quiz_q1_o3", tags:["herbal","calm"] },
            { icon:"🌀", text:"quiz_q1_o4", tags:["versatile"] },
        ]
    },
    {
        q: "quiz_q2",
        options: [
            { icon:"🍋", text:"quiz_q2_o1", tags:["citrus"] },
            { icon:"🌸", text:"quiz_q2_o2", tags:["floral"] },
            { icon:"🫚", text:"quiz_q2_o3", tags:["spice"] },
            { icon:"🍓", text:"quiz_q2_o4", tags:["fruit"] },
        ]
    },
    {
        q: "quiz_q3",
        options: [
            { icon:"⚡", text:"quiz_q3_o1", tags:["caffeine"] },
            { icon:"🔆", text:"quiz_q3_o2", tags:["mild"] },
            { icon:"🌿", text:"quiz_q3_o3", tags:["herbal","calm"] },
            { icon:"🤷", text:"quiz_q3_o4", tags:["versatile"] },
        ]
    },
    {
        q: "quiz_q4",
        options: [
            { icon:"⏱", text:"quiz_q4_o1", tags:["fresh","mild"] },
            { icon:"🧘", text:"quiz_q4_o2", tags:["calm","herbal"] },
            { icon:"💪", text:"quiz_q4_o3", tags:["bold","caffeine"] },
            { icon:"🎲", text:"quiz_q4_o4", tags:["versatile"] },
        ]
    },
    {
        q: "quiz_q5",
        options: [
            { icon:"🍯", text:"quiz_q5_o1", tags:["fruit","mild"] },
            { icon:"🌸", text:"quiz_q5_o2", tags:["floral","mild"] },
            { icon:"🔥", text:"quiz_q5_o3", tags:["spice","bold"] },
            { icon:"✨", text:"quiz_q5_o4", tags:["versatile"] },
        ]
    },
];

/* Human-readable labels for matched quiz traits. */
const QUIZ_TAG_LABEL = {
    bold:      { cs:'výrazná chuť',    en:'bold flavour', sk:'výrazná chuť' },
    caffeine:  { cs:'více kofeinu',     en:'more caffeine', sk:'viac kofeínu' },
    fresh:     { cs:'svěžest',          en:'freshness', sk:'sviežosť' },
    mild:      { cs:'jemnost',          en:'mildness', sk:'jemnosť' },
    herbal:    { cs:'bylinky',          en:'herbal notes', sk:'bylinky' },
    calm:      { cs:'klid',             en:'calm', sk:'pokoj' },
    citrus:    { cs:'citrusy',          en:'citrus', sk:'citrusy' },
    floral:    { cs:'květinové tóny',   en:'floral notes', sk:'kvetinové tóny' },
    fruit:     { cs:'ovoce',            en:'fruit', sk:'ovocie' },
    spice:     { cs:'koření',           en:'spice', sk:'korenie' },
    versatile: { cs:'univerzálnost',    en:'versatility', sk:'univerzálnosť' },
};
function tQuizTag(tag) {
    const l = QUIZ_TAG_LABEL[tag];
    return l ? (l[LANG] || l.cs) : tag;
}

/* Výsledky kvízu. Složení se bere z hotových směsí v katalogu (podle id),
   tady jsou jen štítky, podle kterých se vybírá. */
const QUIZ_BLENDS = [
    { id: 'deep_winter',    tags: ['bold', 'caffeine'] },
    { id: 'morning_window', tags: ['fresh', 'mild'] },
    { id: 'still_evening',  tags: ['herbal', 'calm'] },
    { id: 'open_air',       tags: ['citrus', 'fresh'] },
    { id: 'late_light',     tags: ['floral', 'mild'] },
    { id: 'slow_tuesday',   tags: ['fruit', 'spice'] },
];
function quizBlends() {
    const all = catalogBlends.length ? catalogBlends : BUILTIN_BLENDS;
    const list = QUIZ_BLENDS.map(q => {
        const b = all.find(x => x.id === q.id);
        return b && { ...b, tags: q.tags };
    }).filter(Boolean);
    // Hotové směsi, které kvíz nezná (přidané v administraci), kvíz ukáže
    // jen jako „univerzální“.
    all.filter(b => !QUIZ_BLENDS.some(q => q.id === b.id)).forEach(b => list.push({ ...b, tags: ['versatile'] }));
    return list.filter(b => recipeOf(b.ingredients, b.parts, 100).ok);
}

/* Český popis hotové směsi podle jména (doplní se z katalogu). */
const BLEND_DESCS = {};

let quizAnswerTags = [];
let quizStep = 0;

function startQuiz() {
    quizAnswerTags = [];
    quizAnswerLog = [];
    quizStep = 0;
    renderQuizStep();
}

function renderQuizStep() {
    const top = document.getElementById('quiz-progress-bar');
    const body = document.getElementById('quiz-body');
    if (!top || !body) return;
    const total = QUIZ_QUESTIONS.length;

    if (quizStep >= total) {
        top.innerHTML = '';
        renderQuizResult();
        return;
    }
    top.innerHTML = `
        <span class="mixer-progress-text">${escHtml(t('quiz_step_of').replace('{n}', quizStep + 1).replace('{total}', total))}</span>
        <span class="mixer-progress-bar" aria-hidden="true"><span style="width:${(quizStep + 1) / total * 100}%"></span></span>`;

    const q = QUIZ_QUESTIONS[quizStep];
    body.innerHTML = `
        <h1 class="step-question quiz-question" tabindex="-1">${escHtml(t(q.q))}</h1>
        <div class="quiz-options" role="list">
            ${q.options.map(opt => `<button type="button" class="quiz-option" role="listitem" data-tags="${escHtml(opt.tags.join(','))}">${escHtml(t(opt.text))}</button>`).join('')}
        </div>
        ${quizStep > 0 ? `<button type="button" class="btn btn-link quiz-back" id="quiz-back">${escHtml(t('mixer_prev'))}</button>` : ''}`;
    body.querySelectorAll('.quiz-option').forEach(btn => {
        btn.addEventListener('click', () => quizAnswer(btn.getAttribute('data-tags').split(',')));
    });
    document.getElementById('quiz-back')?.addEventListener('click', quizBack);
    if (quizStep > 0) body.querySelector('.quiz-question')?.focus({ preventScroll: true });
}

let quizAnswerLog = [];
function quizAnswer(tags) {
    quizAnswerLog[quizStep] = tags;
    quizAnswerTags = quizAnswerLog.slice(0, quizStep + 1).flat();
    quizStep++;
    renderQuizStep();
}
function quizBack() {
    if (quizStep === 0) return;
    quizStep--;
    quizAnswerTags = quizAnswerLog.slice(0, quizStep).flat();
    renderQuizStep();
}

function renderQuizResult() {
    const body = document.getElementById('quiz-body');
    const scored = quizBlends().map(blend => ({ ...blend, score: blend.tags.filter(tg => quizAnswerTags.includes(tg)).length }))
        .sort((a, b) => b.score - a.score);
    const best = scored[0];
    if (!best) { body.innerHTML = ''; return; }
    const runnerUp = scored.find(b => b.name !== best.name && b.score > 0);
    let matched = best.tags.filter(tg => quizAnswerTags.includes(tg));
    if (!matched.length) matched = best.tags.slice();
    const descOf = b => pickLang(b, 'desc');

    body.innerHTML = `
        <div class="quiz-result">
            <div class="quiz-result-copy">
                <p class="quiz-result-intro">${escHtml(t('quiz_result_intro'))}</p>
                <h1 class="page-title">${escHtml(best.name)}</h1>
                <p class="quiz-result-desc">${escHtml(descOf(best))}</p>
                <p class="quiz-result-why">${escHtml(t('quiz_why'))}: ${escHtml(matched.map(tQuizTag).join(', '))}.</p>
                <div class="quiz-actions">
                    <button type="button" class="btn btn-primary btn-lg" id="quiz-order-btn">${escHtml(t('btn_order_blend'))}</button>
                    <button type="button" class="btn btn-link" onclick="startQuiz()">${escHtml(t('btn_try_again'))}</button>
                </div>
            </div>
            <figure class="quiz-stage" aria-hidden="true">${pouchHtml({ name: best.name, codes: best.ingredients, parts: best.parts, size: 'pouch--hero', weight: '100 g' })}</figure>
            ${runnerUp ? `
            <div class="quiz-runnerup">
                <p>${escHtml(t('quiz_also'))}</p>
                <button type="button" class="quiz-runnerup-card" id="quiz-runnerup-btn">
                    <span class="quiz-runnerup-dots" aria-hidden="true">${runnerUp.ingredients.map(c => `<i style="--c:${escHtml(ingColor(c) || '#ccc')}"></i>`).join('')}</span>
                    <span class="quiz-runnerup-text"><strong>${escHtml(runnerUp.name)}</strong><span>${escHtml(blendSubtitle(runnerUp.ingredients))}</span></span>
                </button>
            </div>` : ''}
        </div>`;
    const priceOf = b => unitPrice(b.ingredients, b.parts, 100) || unitPrice(b.ingredients, b.parts, sortedWeights()[0]);
    document.getElementById('quiz-order-btn').addEventListener('click', () => openDetail(best.name, descOf(best), priceOf(best), best.ingredients, null, best.parts));
    document.getElementById('quiz-runnerup-btn')?.addEventListener('click', () => openDetail(runnerUp.name, descOf(runnerUp), priceOf(runnerUp), runnerUp.ingredients, null, runnerUp.parts));
}

/* ─── RANDOM BLEND ───────────────────────────── */
/* Překvap mě: jeden základ, jedna nebo dvě příchutě a někdy doplněk. Jen ze
   surovin skladem a jen směs, která projde pravidly (limity, druh čaje). */
function randomBlend() {
    const pick = arr => arr[Math.floor(Math.random() * arr.length)];
    const avail = list => list.filter(i => i.inStock !== false);
    const bases = avail(ING_DATA.bases), flavors = avail(ING_DATA.flavors), extras = avail(ING_DATA.extras);
    for (let tries = 0; tries < 40 && bases.length; tries++) {
        const chosen = [pick(bases)];
        const nFlavors = Math.random() < 0.5 ? 1 : 2;
        for (let i = 0; i < nFlavors && flavors.length; i++) chosen.push(pick(flavors));
        if (extras.length && Math.random() < 0.6) chosen.push(pick(extras));
        const codes = [...new Set(chosen.map(i => i.code))];
        const parts = codes.map(c => defaultParts(ingByCode(c)));
        if (!recipeOf(codes, parts, 100).ok) continue;
        const randomName = pick(mixNameIdeas());
        openInMixer(codes, randomName, 4, parts);
        showToast(`${t('toast_random')} ${randomName}`, '🎲');
        return;
    }
    showToast(t('toast_sold_out'), '🫙');
}

/* ─── RYCHLÝ START Z HOTOVÉ SMĚSI (mixér, krok 1) ─── */
/* Směsi označené v administraci jako „Rychlá volba v mixéru“. Načtou se
   do mixéru i s díly a dají se upravit. */
const MIX_PRESETS = [];
function renderPresets() {
    const el = document.getElementById('preset-chips');
    if (!el) return;
    const list = MIX_PRESETS.filter(p => !outOfStockIn(p.ingredients).length);
    el.hidden = !list.length;
    el.innerHTML = list.length
        ? `<span class="preset-label">${escHtml(t('preset_label'))}</span>`
          + list.map((p, i) => `<button type="button" class="preset-chip" data-preset="${i}">${escHtml(p.name)}</button>`).join('')
        : '';
    el.querySelectorAll('.preset-chip').forEach(btn => {
        btn.addEventListener('click', () => {
            const p = list[+btn.getAttribute('data-preset')];
            openInMixer(p.ingredients, p.name, 1, p.parts);
        });
    });
}

/* ─── SHAREABLE BLEND LINK ───────────────────── */
/* ?b=Green Tea|Mint|Lemon&p=311&n=Jméno. Starší odkazy bez p mají díly 3 + 1 + 1. */
function buildBlendUrl() {
    const params = new URLSearchParams();
    params.set('b', currentProduct.ingredients.join('|'));
    params.set('p', currentProduct.parts.join(''));
    const nameInput = document.getElementById('mix-name');
    const name = (nameInput && nameInput.value.trim()) ||
                 (currentProduct.name && currentProduct.name !== 'Custom Mix' ? currentProduct.name : '');
    if (name) params.set('n', name);
    return `${location.origin}${location.pathname}?${params.toString()}`;
}
function loadBlendFromUrl() {
    const params = new URLSearchParams(location.search);
    const b = params.get('b');
    if (!b) return;
    const all = b.split('|').map(s => s.trim());
    const p = (params.get('p') || '').split('').map(Number);
    const keep = all.map((c, i) => [c, p[i]]).filter(([c]) => ingByCode(c)).slice(0, Recipe.MAX_ITEMS);
    if (!keep.length) return;
    const codes = keep.map(x => x[0]);
    const parts = keep.length === all.length && p.length === all.length ? keep.map(x => x[1]) : null;
    openInMixer(codes, params.get('n') || '', recipeOf(codes, parts, 100).ok ? 4 : 1, parts);
    setTimeout(() => showToast(t('toast_shared_loaded'), '🔗'), 700);
    // Clean the URL so a refresh doesn't re-trigger
    history.replaceState(null, '', location.origin + location.pathname);
}

/* =============================================
   KATALOG ZE SUPABASE
   =============================================
   Ceny, ingredience, směsi, fotky, doprava a dostupnost se mění
   v administraci (admin/). Tady se načtou a překreslí, co je potřeba.

   Odkud se data berou, v tomhle pořadí:
   1. vestavěná data výš v tomhle souboru — web funguje i bez databáze,
   2. poslední katalog uložený v prohlížeči — nové ceny se ukážou hned
      při načtení, ne až po odpovědi serveru,
   3. čerstvý katalog ze Supabase.
   Když databáze neodpoví, zůstane to, co bylo. Obchod kvůli tomu nespadne.
*/

/* Suroviny a hotové směsi, když databáze není napojená nebo neodpoví.
   Stejné jako výchozí data v supabase/setup.sql (katalog v2). Mají tvar
   řádků z databáze a projdou stejným převodem jako katalog ze Supabase. */
const BUILTIN_INGREDIENTS = [
    {"id": "green_tea", "code": "Green Tea", "category": "base", "name_cs": "Zelený čaj", "name_en": "Green Tea", "desc_cs": "Svěží a zemitý, nízký kofein.", "desc_en": "Fresh and earthy, light caffeine.", "emoji": "🍃", "color": "#8da676", "caffeine": 2, "flavor_cs": ["zemitá", "svěží", "travnatá"], "flavor_en": ["earthy", "fresh", "grassy"], "pairs": ["Mint", "Lemon", "Ginger", "Lemongrass"], "brew_temp": "75–80°C", "brew_time": "2–3 min", "sort": 10, "kind": "tea", "label_cs": "zelený čaj", "surcharge_czk": 0, "name_sk": "Zelený čaj", "desc_sk": "Svieži a zemitý, málo kofeínu.", "flavor_sk": ["zemitá", "svieža", "trávová"], "label_sk": "zelený čaj"},
    {"id": "black_tea", "code": "Black Tea", "category": "base", "name_cs": "Černý čaj", "name_en": "Black Tea", "desc_cs": "Silný a výrazný, vysoký kofein.", "desc_en": "Strong and bold, high caffeine.", "emoji": "🖤", "color": "#4a3b32", "caffeine": 4, "flavor_cs": ["výrazná", "sladová", "silná"], "flavor_en": ["bold", "malty", "robust"], "pairs": ["Orange", "Ginger", "Cinnamon", "Cardamom"], "brew_temp": "90–95°C", "brew_time": "3–4 min", "sort": 20, "kind": "tea", "label_cs": "černý čaj", "surcharge_czk": 0, "name_sk": "Čierny čaj", "desc_sk": "Silný a výrazný, veľa kofeínu.", "flavor_sk": ["výrazná", "sladová", "silná"], "label_sk": "čierny čaj"},
    {"id": "white_tea", "code": "White Tea", "category": "base", "name_cs": "Bílý čaj", "name_en": "White Tea", "desc_cs": "Jemný a sladký, nízký kofein.", "desc_en": "Delicate and sweet, low caffeine.", "emoji": "🤍", "color": "#f5e6d3", "caffeine": 1, "flavor_cs": ["jemná", "sladká", "květinová"], "flavor_en": ["delicate", "sweet", "floral"], "pairs": ["Rose", "Strawberry", "Raspberry", "Lemon Balm"], "brew_temp": "75–80°C", "brew_time": "2–3 min", "sort": 30, "kind": "tea", "label_cs": "bílý čaj", "surcharge_czk": 50, "name_sk": "Biely čaj", "desc_sk": "Jemný a sladký, málo kofeínu.", "flavor_sk": ["jemná", "sladká", "kvetinová"], "label_sk": "biely čaj"},
    {"id": "oolong", "code": "Oolong Tea", "category": "base", "name_cs": "Oolong", "name_en": "Oolong Tea", "desc_cs": "Komplexní a květinový, střední kofein.", "desc_en": "Complex and floral, medium caffeine.", "emoji": "🍵", "color": "#c8a0b4", "caffeine": 3, "flavor_cs": ["komplexní", "květinová", "pražená"], "flavor_en": ["complex", "floral", "toasty"], "pairs": ["Rose", "Lavender", "Orange"], "brew_temp": "85–90°C", "brew_time": "3–4 min", "sort": 40, "kind": "tea", "label_cs": "čaj oolong", "surcharge_czk": 40, "name_sk": "Oolong", "desc_sk": "Komplexný a kvetinový, stredne veľa kofeínu.", "flavor_sk": ["komplexná", "kvetinová", "pražená"], "label_sk": "čaj oolong"},
    {"id": "rooibos", "code": "Rooibos", "category": "base", "name_cs": "Rooibos", "name_en": "Rooibos", "desc_cs": "Zemitý a sladký, bez kofeinu.", "desc_en": "Earthy and sweet, caffeine-free.", "emoji": "🌿", "color": "#e8720c", "caffeine": 0, "flavor_cs": ["zemitá", "sladká", "oříšková"], "flavor_en": ["earthy", "sweet", "nutty"], "pairs": ["Orange", "Cinnamon", "Rose Hip"], "brew_temp": "100°C", "brew_time": "5–7 min", "sort": 50, "kind": "herb", "label_cs": "rooibos", "surcharge_czk": 0, "name_sk": "Rooibos", "desc_sk": "Zemitý a sladký, bez kofeínu.", "flavor_sk": ["zemitá", "sladká", "oriešková"], "label_sk": "rooibos"},
    {"id": "chamomile", "code": "Chamomile", "category": "base", "name_cs": "Heřmánek", "name_en": "Chamomile", "desc_cs": "Jemný, květinový, trochu jablečný. Bez kofeinu.", "desc_en": "Gentle, floral, a little like apple. Caffeine-free.", "emoji": "🌼", "color": "#f5d78e", "caffeine": 0, "flavor_cs": ["květinová", "jablečná", "jemná"], "flavor_en": ["floral", "apple", "mild"], "pairs": ["Lavender", "Lemon Balm", "Apple"], "brew_temp": "100°C", "brew_time": "5–7 min", "sort": 60, "kind": "herb", "label_cs": "heřmánek (květ)", "surcharge_czk": 0, "name_sk": "Harmanček", "desc_sk": "Jemný, kvetinový, trochu jablkový. Bez kofeínu.", "flavor_sk": ["kvetinová", "jablková", "jemná"], "label_sk": "harmanček (kvet)"},
    {"id": "lemon_balm", "code": "Lemon Balm", "category": "base", "name_cs": "Meduňka", "name_en": "Lemon Balm", "desc_cs": "Jemně citronová a svěží, bez kofeinu.", "desc_en": "Softly lemony and fresh, caffeine-free.", "emoji": "🍀", "color": "#9cc26a", "caffeine": 0, "flavor_cs": ["citronová", "svěží", "bylinková"], "flavor_en": ["citrusy", "fresh", "herby"], "pairs": ["Chamomile", "Linden", "Mint", "Lemon"], "brew_temp": "100°C", "brew_time": "5–7 min", "sort": 70, "kind": "herb", "label_cs": "meduňka (list)", "surcharge_czk": 0, "name_sk": "Medovka", "desc_sk": "Jemne citrónová a svieža, bez kofeínu.", "flavor_sk": ["citrónová", "svieža", "bylinková"], "label_sk": "medovka (list)"},
    {"id": "linden", "code": "Linden", "category": "base", "name_cs": "Lípa", "name_en": "Linden", "desc_cs": "Medově sladký květ, bez kofeinu.", "desc_en": "Honey-sweet blossom, caffeine-free.", "emoji": "🌸", "color": "#e6d58a", "caffeine": 0, "flavor_cs": ["sladká", "květinová", "jemná"], "flavor_en": ["sweet", "floral", "delicate"], "pairs": ["Chamomile", "Lemon Balm", "Lemon"], "brew_temp": "100°C", "brew_time": "5–7 min", "sort": 80, "kind": "herb", "label_cs": "lipový květ", "surcharge_czk": 0, "name_sk": "Lipa", "desc_sk": "Medovo sladký kvet, bez kofeínu.", "flavor_sk": ["sladká", "kvetinová", "jemná"], "label_sk": "lipový kvet"},
    {"id": "mint", "code": "Mint", "category": "base", "name_cs": "Máta peprná", "name_en": "Peppermint", "desc_cs": "Chladivá a svěží, výrazná. Bez kofeinu.", "desc_en": "Cooling and fresh, bright. Caffeine-free.", "emoji": "🌱", "color": "#4caf50", "caffeine": 0, "flavor_cs": ["chladivá", "svěží", "jiskřivá"], "flavor_en": ["cooling", "fresh", "bright"], "pairs": ["Green Tea", "Lemon", "Lemon Balm"], "brew_temp": "100°C", "brew_time": "5–7 min", "sort": 90, "kind": "herb", "label_cs": "máta peprná (list)", "surcharge_czk": 0, "name_sk": "Mäta pieporná", "desc_sk": "Chladivá a svieža, výrazná. Bez kofeínu.", "flavor_sk": ["chladivá", "svieža", "iskrivá"], "label_sk": "mäta pieporná (list)"},
    {"id": "apple", "code": "Apple", "category": "base", "name_cs": "Jablko", "name_en": "Apple", "desc_cs": "Sladké a šťavnaté, základ ovocných čajů.", "desc_en": "Sweet and juicy, the base of fruit teas.", "emoji": "🍎", "color": "#d9a35b", "caffeine": 0, "flavor_cs": ["sladká", "ovocná", "hřejivá"], "flavor_en": ["sweet", "fruity", "warm"], "pairs": ["Cinnamon", "Hibiscus", "Rose Hip", "Strawberry"], "brew_temp": "100°C", "brew_time": "8–10 min", "sort": 100, "kind": "fruit", "label_cs": "sušená jablka", "surcharge_czk": 0, "name_sk": "Jablko", "desc_sk": "Sladké a šťavnaté, základ ovocných čajov.", "flavor_sk": ["sladká", "ovocná", "hrejivá"], "label_sk": "sušené jablká"},
    {"id": "strawberry", "code": "Strawberry", "category": "flavor", "name_cs": "Jahoda", "name_en": "Strawberry", "desc_cs": "Sladká a ovocná, letní.", "desc_en": "Sweet and fruity, summery.", "emoji": "🍓", "color": "#cc4747", "flavor_cs": ["sladká", "ovocná", "letní"], "flavor_en": ["sweet", "fruity", "summery"], "pairs": ["White Tea", "Rooibos", "Mint"], "sort": 110, "kind": "fruit", "label_cs": "sušené jahody", "surcharge_czk": 25, "name_sk": "Jahoda", "desc_sk": "Sladká a ovocná, letná.", "flavor_sk": ["sladká", "ovocná", "letná"], "label_sk": "sušené jahody"},
    {"id": "raspberry", "code": "Raspberry", "category": "flavor", "name_cs": "Malina", "name_en": "Raspberry", "desc_cs": "Nakyslá, ovocná a živá.", "desc_en": "Tart, fruity and vibrant.", "emoji": "🍇", "color": "#e91e8c", "flavor_cs": ["nakyslá", "ovocná", "živá"], "flavor_en": ["tart", "fruity", "vibrant"], "pairs": ["Green Tea", "Hibiscus", "Mint"], "sort": 120, "kind": "fruit", "label_cs": "sušené maliny", "surcharge_czk": 25, "name_sk": "Malina", "desc_sk": "Kyslastá, ovocná a živá.", "flavor_sk": ["kyslastá", "ovocná", "živá"], "label_sk": "sušené maliny"},
    {"id": "blueberry", "code": "Blueberry", "category": "flavor", "name_cs": "Borůvka", "name_en": "Blueberry", "desc_cs": "Sladká a nakyslá, chutná jako léto.", "desc_en": "Sweet and tart, tastes like summer.", "emoji": "🫐", "color": "#9b59b6", "flavor_cs": ["sladká", "ovocná", "nakyslá"], "flavor_en": ["sweet", "fruity", "tart"], "pairs": ["Black Tea", "Apple", "Lemon"], "sort": 130, "kind": "fruit", "label_cs": "sušené borůvky", "surcharge_czk": 0, "name_sk": "Čučoriedka", "desc_sk": "Sladká a kyslastá, chutí ako leto.", "flavor_sk": ["sladká", "ovocná", "kyslastá"], "label_sk": "sušené čučoriedky"},
    {"id": "rose_hip", "code": "Rose Hip", "category": "flavor", "name_cs": "Šípek", "name_en": "Rose Hip", "desc_cs": "Nakyslý, ovocný a svěží.", "desc_en": "Tart, fruity and tangy.", "emoji": "🔴", "color": "#f8bbd0", "flavor_cs": ["nakyslá", "ovocná", "svěží"], "flavor_en": ["tart", "fruity", "tangy"], "pairs": ["Hibiscus", "Apple", "Rooibos"], "sort": 140, "kind": "fruit", "label_cs": "šípek", "surcharge_czk": 0, "name_sk": "Šípka", "desc_sk": "Kyslastá, ovocná a svieža.", "flavor_sk": ["kyslastá", "ovocná", "svieža"], "label_sk": "šípky"},
    {"id": "hibiscus", "code": "Hibiscus", "category": "flavor", "name_cs": "Ibišek", "name_en": "Hibiscus", "desc_cs": "Rubínová barva a příjemná kyselost.", "desc_en": "Ruby colour and a pleasant tartness.", "emoji": "🌺", "color": "#b0234a", "flavor_cs": ["nakyslá", "ovocná", "živá"], "flavor_en": ["tart", "fruity", "vibrant"], "pairs": ["Rose Hip", "Apple", "Strawberry"], "sort": 150, "kind": "herb", "label_cs": "ibišek (květ)", "surcharge_czk": 0, "name_sk": "Ibištek", "desc_sk": "Rubínová farba a príjemná kyslosť.", "flavor_sk": ["kyslastá", "ovocná", "živá"], "label_sk": "ibištek (kvet)"},
    {"id": "rose", "code": "Rose", "category": "flavor", "name_cs": "Růže", "name_en": "Rose", "desc_cs": "Květinová a jemná.", "desc_en": "Floral and delicate.", "emoji": "🌹", "color": "#e8607a", "flavor_cs": ["květinová", "romantická", "lehká"], "flavor_en": ["floral", "romantic", "light"], "pairs": ["White Tea", "Oolong Tea", "Lavender"], "sort": 160, "kind": "herb", "label_cs": "růže (okvětní lístky)", "surcharge_czk": 30, "name_sk": "Ruža", "desc_sk": "Kvetinová a jemná.", "flavor_sk": ["kvetinová", "romantická", "ľahká"], "label_sk": "ruža (okvetné lístky)"},
    {"id": "spearmint", "code": "Spearmint", "category": "flavor", "name_cs": "Máta klasnatá", "name_en": "Spearmint", "desc_cs": "Sladší a jemnější než peprná.", "desc_en": "Sweeter and softer than peppermint.", "emoji": "🌿", "color": "#a8d8a8", "flavor_cs": ["chladivá", "sladká", "jemná"], "flavor_en": ["cool", "sweet", "mild"], "pairs": ["Rooibos", "Green Tea", "Lemon"], "sort": 170, "kind": "herb", "label_cs": "máta klasnatá (list)", "surcharge_czk": 0, "name_sk": "Mäta klasnatá", "desc_sk": "Sladšia a jemnejšia ako pieporná.", "flavor_sk": ["chladivá", "sladká", "jemná"], "label_sk": "mäta klasnatá (list)"},
    {"id": "lemongrass", "code": "Lemongrass", "category": "flavor", "name_cs": "Citronová tráva", "name_en": "Lemongrass", "desc_cs": "Vůně citronu bez kyselosti.", "desc_en": "Lemon scent without the sourness.", "emoji": "🌾", "color": "#c9d77b", "flavor_cs": ["citrusová", "svěží", "travnatá"], "flavor_en": ["citrusy", "fresh", "grassy"], "pairs": ["Green Tea", "Ginger", "Lemon Balm"], "sort": 180, "kind": "herb", "label_cs": "citronová tráva (list)", "max_pct": 30, "surcharge_czk": 0, "name_sk": "Citrónová tráva", "desc_sk": "Vôňa citróna bez kyslosti.", "flavor_sk": ["citrusová", "svieža", "trávová"], "label_sk": "citrónová tráva (list)"},
    {"id": "fennel", "code": "Fennel", "category": "flavor", "name_cs": "Fenykl", "name_en": "Fennel", "desc_cs": "Nasládlý, s tónem anýzu.", "desc_en": "Sweetish, with a hint of anise.", "emoji": "✳️", "color": "#a4b36b", "flavor_cs": ["sladká", "kořeněná", "jemná"], "flavor_en": ["sweet", "spicy", "mild"], "pairs": ["Chamomile", "Mint", "Lemon Balm"], "sort": 190, "kind": "herb", "label_cs": "fenykl (plod)", "surcharge_czk": 0, "name_sk": "Fenikel", "desc_sk": "Nasladlý, s tónom anízu.", "flavor_sk": ["sladká", "korenistá", "jemná"], "label_sk": "fenikel (plod)"},
    {"id": "orange", "code": "Orange", "category": "extra", "name_cs": "Pomerančová kůra", "name_en": "Orange Peel", "desc_cs": "Citrusová, svěží a šťavnatá.", "desc_en": "Citrusy, bright and zesty.", "emoji": "🍊", "color": "#ffb347", "flavor_cs": ["citrusová", "jiskřivá", "osvěžující"], "flavor_en": ["citrusy", "bright", "zesty"], "pairs": ["Rooibos", "Black Tea", "Cinnamon"], "sort": 200, "kind": "fruit", "label_cs": "pomerančová kůra", "max_pct": 30, "surcharge_czk": 0, "name_sk": "Pomarančová kôra", "desc_sk": "Citrusová, svieža a šťavnatá.", "flavor_sk": ["citrusová", "iskrivá", "osviežujúca"], "label_sk": "pomarančová kôra"},
    {"id": "lemon", "code": "Lemon", "category": "extra", "name_cs": "Citronová kůra", "name_en": "Lemon Peel", "desc_cs": "Svěží, citrusová a nakyslá.", "desc_en": "Bright, citrusy and tart.", "emoji": "🍋", "color": "#ffe066", "flavor_cs": ["jiskřivá", "citrusová", "nakyslá"], "flavor_en": ["bright", "citrusy", "tart"], "pairs": ["Green Tea", "Chamomile", "Ginger"], "sort": 210, "kind": "fruit", "label_cs": "citronová kůra", "max_pct": 30, "surcharge_czk": 0, "name_sk": "Citrónová kôra", "desc_sk": "Svieža, citrusová a kyslastá.", "flavor_sk": ["iskrivá", "citrusová", "kyslastá"], "label_sk": "citrónová kôra"},
    {"id": "ginger", "code": "Ginger", "category": "extra", "name_cs": "Zázvor", "name_en": "Ginger", "desc_cs": "Pikantní, hřejivý a svěží.", "desc_en": "Spicy, warm and zesty.", "emoji": "🫚", "color": "#ff9800", "flavor_cs": ["kořeněná", "hřejivá", "osvěžující"], "flavor_en": ["spicy", "warm", "zesty"], "pairs": ["Black Tea", "Lemon", "Lemongrass"], "sort": 220, "kind": "herb", "label_cs": "zázvor (kořen)", "max_pct": 30, "surcharge_czk": 0, "name_sk": "Zázvor", "desc_sk": "Pikantný, hrejivý a svieži.", "flavor_sk": ["korenistá", "hrejivá", "osviežujúca"], "label_sk": "zázvor (koreň)"},
    {"id": "cinnamon", "code": "Cinnamon", "category": "extra", "name_cs": "Skořice", "name_en": "Cinnamon", "desc_cs": "Hřejivá, kořeněná a sladká.", "desc_en": "Warm, spicy and sweet.", "emoji": "🪵", "color": "#c8824a", "flavor_cs": ["hřejivá", "kořeněná", "sladká"], "flavor_en": ["warm", "spicy", "sweet"], "pairs": ["Black Tea", "Apple", "Rooibos"], "sort": 230, "kind": "herb", "label_cs": "skořice", "max_pct": 30, "surcharge_czk": 0, "name_sk": "Škorica", "desc_sk": "Hrejivá, korenistá a sladká.", "flavor_sk": ["hrejivá", "korenistá", "sladká"], "label_sk": "škorica"},
    {"id": "lavender", "code": "Lavender", "category": "extra", "name_cs": "Levandule", "name_en": "Lavender", "desc_cs": "Výrazně květinová, stačí špetka.", "desc_en": "Strongly floral, a pinch is enough.", "emoji": "💜", "color": "#b8a0cc", "flavor_cs": ["květinová", "bylinková", "výrazná"], "flavor_en": ["floral", "herby", "bold"], "pairs": ["Chamomile", "White Tea", "Lemon Balm"], "sort": 240, "kind": "herb", "label_cs": "levandule (květ)", "max_pct": 5, "surcharge_czk": 0, "name_sk": "Levanduľa", "desc_sk": "Výrazne kvetinová, stačí štipka.", "flavor_sk": ["kvetinová", "bylinková", "výrazná"], "label_sk": "levanduľa (kvet)"},
    {"id": "cardamom", "code": "Cardamom", "category": "extra", "name_cs": "Kardamom", "name_en": "Cardamom", "desc_cs": "Exotický, kořeněný a květinový. Stačí špetka.", "desc_en": "Exotic, spicy and floral. A pinch is enough.", "emoji": "🫛", "color": "#80cbc4", "flavor_cs": ["exotická", "kořeněná", "květinová"], "flavor_en": ["exotic", "spicy", "floral"], "pairs": ["Black Tea", "Oolong Tea", "Cinnamon"], "sort": 250, "kind": "herb", "label_cs": "kardamom (semeno)", "max_pct": 5, "surcharge_czk": 80, "name_sk": "Kardamón", "desc_sk": "Exotický, korenistý a kvetinový. Stačí štipka.", "flavor_sk": ["exotická", "korenistá", "kvetinová"], "label_sk": "kardamón (semeno)"},
];
const BUILTIN_BLENDS = [
    {"id": "morning_window", "name": "Morning Window", "emoji": "☀️", "is_preset": true, "sort": 10, "ingredients": ["Green Tea", "Mint", "Lemon"], "parts": [3, 1, 1], "desc_cs": "Zelený čaj s mátou peprnou a citronovou kůrou. Čistý a svěží — pohár, který rozjede den.", "desc_en": "Green tea with peppermint and lemon peel. Clean and bright — the cup that gets the day going.", "desc_sk": "Zelený čaj s mätou piepornou a citrónovou kôrou. Čistý a svieži — šálka, ktorá naštartuje deň."},
    {"id": "still_evening", "name": "Still Evening", "emoji": "🌙", "is_preset": true, "sort": 20, "ingredients": ["Chamomile", "Lemon Balm", "Lavender"], "parts": [2, 2, 1], "desc_cs": "Heřmánek a meduňka se špetkou levandule. Jemný, květinový a bez kofeinu — na konec dne.", "desc_en": "Chamomile and lemon balm with a pinch of lavender. Gentle, floral and caffeine-free — for the end of the day.", "desc_sk": "Harmanček a medovka so štipkou levandule. Jemný, kvetinový a bez kofeínu — na koniec dňa."},
    {"id": "deep_winter", "name": "Deep Winter", "emoji": "❄️", "is_preset": true, "sort": 30, "ingredients": ["Black Tea", "Ginger", "Cinnamon"], "parts": [3, 1, 1], "desc_cs": "Černý čaj se zázvorem a skořicí. Plný a hřejivý — nejlepší s oběma rukama kolem hrnku.", "desc_en": "Black tea with ginger and cinnamon. Full and warming — best with both hands around the mug.", "desc_sk": "Čierny čaj so zázvorom a škoricou. Plný a hrejivý — najlepší, keď držíš hrnček oboma rukami."},
    {"id": "late_light", "name": "Late Light", "emoji": "🌅", "is_preset": false, "sort": 40, "ingredients": ["Oolong Tea", "Rose", "Lavender"], "parts": [3, 1, 1], "desc_cs": "Oolong s růží a špetkou levandule. Měkký a trochu květinový — na ten tichý kus odpoledne.", "desc_en": "Oolong with rose and a pinch of lavender. Soft and a little floral — for the quiet part of the afternoon.", "desc_sk": "Oolong s ružou a štipkou levandule. Mäkký a trochu kvetinový — na tichú časť popoludnia."},
    {"id": "open_air", "name": "Open Air", "emoji": "🌿", "is_preset": false, "sort": 50, "ingredients": ["Rooibos", "Orange", "Spearmint"], "parts": [3, 1, 1], "desc_cs": "Rooibos s pomerančovou kůrou a mátou klasnatou. Přirozeně sladký a bez kofeinu — dobrý kdykoli.", "desc_en": "Rooibos with orange peel and spearmint. Naturally sweet and caffeine-free — good any time.", "desc_sk": "Rooibos s pomarančovou kôrou a mätou klasnatou. Prirodzene sladký a bez kofeínu — dobrý kedykoľvek."},
    {"id": "slow_tuesday", "name": "Slow Tuesday", "emoji": "🍎", "is_preset": true, "sort": 60, "ingredients": ["Apple", "Hibiscus", "Rose Hip", "Cinnamon"], "parts": [3, 1, 1, 1], "desc_cs": "Jablko s ibiškem, šípkem a skořicí. Ovocný a hřejivý — čajový ekvivalent nicnedělání.", "desc_en": "Apple with hibiscus, rose hip and cinnamon. Fruity and warming — the tea equivalent of doing nothing.", "desc_sk": "Jablko s ibištekom, šípkami a škoricou. Ovocný a hrejivý — čajový ekvivalent ničnerobenia."},
];

const CATALOG_CACHE_KEY  = 'teaseyou_catalog_v1';
const CATALOG_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;   // starší cache už nebereme
/* Skupina suroviny → krok mixéru, ve kterém se vybírá. */
const MIX_STEP_OF = { base: 1, flavor: 2, extra: 3 };
const MIX_GROUP_OF_STEP = { 1: 'bases', 2: 'flavors', 3: 'extras' };
const ING_CATEGORY_GROUP = { base: 'bases', flavor: 'flavors', extra: 'extras' };

let catalogLoaded   = false;   // true = nabídka pochází z databáze (živě nebo z cache)
let catalogBlends   = BUILTIN_BLENDS.slice();  // řádky tabulky blends (bez databáze vestavěné)
let catalogShipping = null;    // { post: { price, active }, … }
/* Mýdla a balzámy. Bez databáze (nebo dokud v ní tabulka není) se ukážou
   tyhle vestavěné ukázky. */
const BUILTIN_CRAFT = [
    { id: 'levandulovy_vecer', kind: 'soap', name_cs: 'Levandulový večer', name_en: 'Lavender Evening', color: '#b8a0cc', ingredients: ['Lavender', 'Chamomile'],
      desc_cs: 'Jemné mýdlo s levandulí a heřmánkem. Voní jako večerní šálek.', desc_en: 'A gentle soap with lavender and chamomile. Smells like an evening cup.',
      name_sk: 'Levanduľový večer', desc_sk: 'Jemné mydlo s levanduľou a harmančekom. Vonia ako večerná šálka.' },
    { id: 'zelene_rano', kind: 'soap', name_cs: 'Zelené ráno', name_en: 'Green Morning', color: '#8da676', ingredients: ['Green Tea', 'Mint'],
      desc_cs: 'Svěží mýdlo se zeleným čajem a mátou.', desc_en: 'A fresh soap with green tea and mint.',
      name_sk: 'Zelené ráno', desc_sk: 'Svieže mydlo so zeleným čajom a mätou.' },
    { id: 'rooibos_pomeranc', kind: 'soap', name_cs: 'Rooibos a pomeranč', name_en: 'Rooibos & Orange', color: '#e8720c', ingredients: ['Rooibos', 'Orange'],
      desc_cs: 'Hřejivé mýdlo s rooibosem a pomerančovou kůrou.', desc_en: 'A warm soap with rooibos and orange peel.',
      name_sk: 'Rooibos a pomaranč', desc_sk: 'Hrejivé mydlo s rooibosom a pomarančovou kôrou.' },
    { id: 'ruze_bily_caj', kind: 'soap', name_cs: 'Růže a bílý čaj', name_en: 'Rose & White Tea', color: '#e8607a', ingredients: ['Rose', 'White Tea'],
      desc_cs: 'Květinové mýdlo s růží a bílým čajem.', desc_en: 'A floral soap with rose and white tea.',
      name_sk: 'Ruža a biely čaj', desc_sk: 'Kvetinové mydlo s ružou a bielym čajom.' },
    { id: 'med_vanilka', kind: 'balm', name_cs: 'Med a vanilka', name_en: 'Honey & Vanilla', color: '#ffc107', ingredients: ['Honey', 'Vanilla'],
      desc_cs: 'Balzám na rty ze včelího vosku s medem a vanilkou.', desc_en: 'A beeswax lip balm with honey and vanilla.',
      name_sk: 'Med a vanilka', desc_sk: 'Balzam na pery zo včelieho vosku s medom a vanilkou.' },
    { id: 'mata', kind: 'balm', name_cs: 'Máta', name_en: 'Mint', color: '#a8d8a8', ingredients: ['Spearmint'],
      desc_cs: 'Chladivý balzám na rty s mátou klasnatou.', desc_en: 'A cooling lip balm with spearmint.',
      name_sk: 'Mäta', desc_sk: 'Chladivý balzam na pery s mätou klasnatou.' },
];
let catalogCraft = BUILTIN_CRAFT.slice();
let promoBarEnabled = true;

Object.assign(TRANSLATIONS.cs, {
    ing_sold_out:             'Vyprodáno',
    toast_sold_out:           'Tahle ingredience je teď vyprodaná',
    err_sold_out_named:       'Teď je vyprodané:',
    stock_note_blend:         'Některá ingredience téhle směsi je teď vyprodaná.',
    err_weight_unavailable:   'Tuhle gramáž už neprodáváme. Odeber prosím položku z košíku a vyber jinou.',
    err_invalid_customer:     'Zkontroluj prosím kontaktní údaje a adresu.',
    launch_bar:               'Připravujeme spuštění. Objednávky zatím nepřijímáme, směs si ale můžeš namíchat a uložit.',
    sales_closed_note:        'Objednávky zatím nepřijímáme, prodej teprve chystáme. Košík ti tu zůstane.',
    sales_closed_toast:       'Objednávky zatím nepřijímáme. Prodej brzy spustíme.',
    err_too_many_orders:      'Z tohohle e-mailu přišlo moc objednávek najednou. Zkus to prosím za hodinu.',
    err_pickup_point:         'Vyber prosím výdejní místo Zásilkovny.',
    err_shipping_unavailable: 'Tenhle způsob dopravy teď nenabízíme. Vyber prosím jiný.',
    err_unknown_ingredient:   'Některá ingredience v košíku už není v nabídce. Odeber prosím tu položku.',
    err_invalid_recipe:       'Složení jedné směsi v košíku už neprojde pravidly (nejvyšší podíly surovin). Otevři ji v mixéru a uprav, nebo ji odeber.',
    promo_checking:           'Ověřuji kód…',
    promo_check_failed:       'Kód se teď nepodařilo ověřit. Zkus to prosím za chvíli.',
    promo_expired:            'Slevový kód z minula už neplatí, odebrali jsme ho.',
});
Object.assign(TRANSLATIONS.en, {
    ing_sold_out:             'Sold out',
    toast_sold_out:           'This ingredient is sold out right now',
    err_sold_out_named:       'Sold out right now:',
    stock_note_blend:         'One of the ingredients in this blend is sold out right now.',
    err_weight_unavailable:   'We no longer sell this size. Please remove the item and pick another one.',
    err_invalid_customer:     'Please check your contact details and address.',
    launch_bar:               'We are getting ready to launch. We are not taking orders yet, but you can already mix and save your blend.',
    sales_closed_note:        'We are not taking orders yet, the shop is still being set up. Your cart will stay here.',
    sales_closed_toast:       'We are not taking orders yet. The shop opens soon.',
    err_too_many_orders:      'Too many orders from this e-mail at once. Please try again in an hour.',
    err_pickup_point:         'Please choose a Zásilkovna pickup point.',
    err_shipping_unavailable: 'This shipping method is not available right now. Please choose another one.',
    err_unknown_ingredient:   'An ingredient in your cart is no longer available. Please remove that item.',
    err_invalid_recipe:       'One blend in your cart no longer passes the recipe rules. Open it in the mixer and adjust it, or remove it.',
    promo_checking:           'Checking the code…',
    promo_check_failed:       'We could not verify the code right now. Please try again shortly.',
    promo_expired:            'Your discount code from last time is no longer valid, so we removed it.',
});

/* ─── Pomocníci ────────────────────────────── */
function safePhoto(url) {
    // Do HTML a CSS pustíme jen obyčejnou https adresu bez uvozovek a závorek.
    return typeof url === 'string' && /^https:\/\/[^\s"'()<>\\]+$/.test(url) ? url : '';
}
function allIngredients() { return [...ING_DATA.bases, ...ING_DATA.flavors, ...ING_DATA.extras]; }
/* Jen suroviny, které jsou teď v nabídce. Vyřazené (třeba med) vrací null. */
function ingByCode(code) {
    return allIngredients().find(i => i.code === code) || null;
}
function ingColor(code) { const i = ingByCode(code); return i && i.color ? i.color : null; }
/* Vyprodaná, nebo už vůbec není v nabídce: obojí se teď nedá koupit. */
function isOutOfStock(code) { const i = ingByCode(code); return !i || i.inStock === false; }
function outOfStockIn(codes) { return (codes || []).filter(c => c && c !== 'Empty' && isOutOfStock(c)); }

/* ─── Receptura (výpočet je v recipe.js, stejný jako v databázi) ─── */
function recipeInfo(code) {
    const ing = ingByCode(code);
    if (!ing) return null;
    return { kind: ing.kind || (ing.category === 'base' ? 'tea' : 'herb'), maxPct: ing.maxPct, surcharge: ing.surcharge || 0 };
}
function recipeOf(codes, parts, weight) {
    return Recipe.evaluate(codes, parts, recipeInfo, parseInt(weight, 10) || 0);
}
/* Cena sáčku: ceník podle gramáže + příplatek za prémiové suroviny. */
function unitPrice(codes, parts, weight) {
    const w = parseInt(weight, 10);
    if (!PRICES[w]) return 0;
    return PRICES[w] + recipeOf(codes, parts, w).surcharge;
}
function isPinchIng(ing) { return !!ing && Recipe.isPinch(ing.maxPct); }
function defaultParts(ing) { return ing && ing.category === 'base' ? 3 : 1; }
/* 16.5 g → „16,5 g“ */
function fmtGrams(g) {
    const n = Math.round(g * 10) / 10;
    return (SLAVIC ? String(n).replace('.', ',') : String(n)) + ' g';
}
/* Louhování podle hlavní suroviny, která má vlastní teplotu a čas. */
function brewFor(codes, parts) {
    const r = recipeOf(codes, parts, 100);
    const main = r.rows.slice().sort((a, b) => b.pct - a.pct).map(x => x.code).find(c => BREW[c])
        || (codes || []).find(c => BREW[c]);
    return BREW[main] || { temp: '90–95°C', time: '3–4 min' };
}
/* Proč směs nejde objednat, lidsky. */
function mixErrorText(r) {
    switch (r && r.error) {
        case 'over_limit': {
            const ing = ingByCode(r.errorCode);
            return t('mix_over_limit').replace('{name}', tIng(r.errorCode)).replace('{max}', ing && ing.maxPct ? ing.maxPct : '');
        }
        case 'no_category':    return t('mix_no_category');
        case 'no_main':        return t('mix_no_main');
        case 'too_many':       return t('mix_full');
        case 'too_many_pinch': return t('mix_pinch_full');
        case 'empty':          return t('bar_empty');
        case 'unknown':        return t('err_unknown_ingredient');
        default:               return t('toast_order_failed');
    }
}
/* Ikonka suroviny. Jediné místo, které ji kreslí, ať se dá vyměnit všude
   najednou. Pořadí: vlastní ikonka z administrace (PNG s průhledným
   pozadím), fotka suroviny (oříznutá do kruhu), jinak vestavěná kresba
   z icons.js. Podklad je světlý odstín barvy suroviny.
   cls: velikost (ing-ico--sm, --xs) nebo jiná třída podle místa. */
function ingIconHtml(code, cls = '') {
    const ing = ingByCode(code) || {};
    const color = /^#[0-9a-f]{6}$/i.test(ing.color || '') ? ing.color : '#cccccc';
    const klass = 'ing-ico' + (cls ? ' ' + cls : '');
    const icon = safePhoto(ing.icon);
    if (icon) {
        return `<span class="${klass} has-img" style="--c:${color}" aria-hidden="true">`
            + `<img src="${escHtml(icon)}" alt="" loading="lazy" decoding="async"></span>`;
    }
    const photo = safePhoto(ing.photo);
    if (photo) return `<span class="${klass} has-photo" style="--c:${color};background-image:url('${escHtml(photo)}')" aria-hidden="true"></span>`;
    const kind = ing.kind || (ing.category === 'base' ? 'tea' : '');
    return `<span class="${klass}" style="--c:${color}" aria-hidden="true">${IngIcons.svg(IngIcons.keyFor(code, kind))}</span>`;
}
function bySort(a, b) { return (a.sort || 0) - (b.sort || 0); }
function blendSubtitle(codes) {
    const names = (codes || []).map(tIng);
    if (names.length < 2) return names[0] || '';
    const rest = SLAVIC ? names.slice(1).map(n => n.toLocaleLowerCase(LOCALE)) : names.slice(1);
    const last = rest.pop();
    return [names[0], ...rest].join(', ') + (SLAVIC ? ' a ' : ' & ') + last;
}

/* ─── PRODÁVAJÍCÍ A NASTAVENÍ OBCHODU ───────────
   Údaje se vyplňují v administraci (Nastavení → Prodávající a etiketa)
   a web je dosadí do podmínek, patičky a informací o potravině. */
const SELLER = { name: '', ico: '', address: '', email: 'hello@teaseyou.cz', phone: '' };
let COD_FEE = 39;                                  // Kč, příplatek za dobírku
let DURABILITY_MONTHS = 12;
// Prodej je zapnutý, až to admin přepne (Ceny a doprava → Prodej). Do té doby
// web ukazuje „Připravujeme spuštění“ a pokladna je zavřená. Databáze to hlídá taky.
let SALES_OPEN = false;
let SALES_KNOWN = false;   // nastavení už přišlo (z mezipaměti nebo z databáze)
let SALES_OPENED_AT = null;

function applyShopSettings(st) {
    const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
    SELLER.name    = str(st.seller_name, 120);
    SELLER.ico     = /^[0-9]{8}$/.test(st.seller_ico || '') ? st.seller_ico : '';
    SELLER.address = str(st.seller_address, 200);
    SELLER.phone   = str(st.seller_phone, 30);
    const mail = str(st.seller_email, 120);
    SELLER.email   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail) ? mail : 'hello@teaseyou.cz';
    if (Number.isInteger(st.cod_fee_czk) && st.cod_fee_czk >= 0) COD_FEE = st.cod_fee_czk;
    if (Number.isInteger(st.durability_months) && st.durability_months >= 1 && st.durability_months <= 36) {
        DURABILITY_MONTHS = st.durability_months;
    }
    SALES_OPEN = st.sales_open === true;
    SALES_KNOWN = true;
    const opened = st.sales_opened_at ? new Date(st.sales_opened_at) : null;
    SALES_OPENED_AT = opened && !isNaN(opened) ? opened : null;
    const codText = COD_FEE ? ` (+${COD_FEE} Kč)` : '';
    TRANSLATIONS.cs.pay_cod_desc = 'Platíš při převzetí' + codText;
    TRANSLATIONS.en.pay_cod_desc = 'Pay when you collect it' + codText;
}

/* Dosadí údaje o prodávajícím do všech [data-seller] a [data-shop]. Co chybí,
   ukáže jako „[doplnit]“, ať je vidět, že to ještě není hotové. */
function applySeller() {
    document.querySelectorAll('[data-seller]').forEach(el => {
        const v = SELLER[el.dataset.seller] || '';
        el.textContent = v || '[doplnit]';
        el.classList.toggle('is-missing', !v);
    });
    document.querySelectorAll('[data-seller-mail]').forEach(a => {
        a.href = 'mailto:' + SELLER.email;
        a.textContent = SELLER.email;
    });
    const shop = {
        cod_fee:   COD_FEE ? fmt(COD_FEE) : '0 Kč',
        free_ship: fmt(FREE_SHIP_THRESHOLD),
        url:       (location.host + location.pathname).replace(/\/(index\.html)?$/, ''),
    };
    if (SALES_OPENED_AT) shop.terms_date = SALES_OPENED_AT.toLocaleDateString('cs-CZ');
    document.querySelectorAll('[data-shop]').forEach(el => {
        const known = shop[el.dataset.shop] !== undefined;
        if (known) el.textContent = shop[el.dataset.shop];
        el.classList.toggle('is-missing', !known);
    });
    const mail = document.getElementById('withdrawal-mail');
    if (mail) {
        const body = [
            'Oznamuji, že tímto odstupuji od smlouvy o nákupu tohoto zboží:', '',
            'Číslo objednávky: ', 'Zboží (název směsi a gramáž): ', 'Datum objednání / datum převzetí: ',
            'Jméno a příjmení: ', 'Adresa: ', 'Číslo účtu pro vrácení peněz: ', 'Datum: ',
        ].join('\n');
        mail.href = `mailto:${SELLER.email}?subject=${encodeURIComponent('Odstoupení od smlouvy')}&body=${encodeURIComponent(body)}`;
    }
}

/* ─── INFORMACE O POTRAVINĚ ─────────────────────
   Co musí zákazník vidět dřív, než objedná, a co patří na sáček (nařízení
   EU 1169/2011, vyhláška 187/2023 Sb.): název podle složení, složení
   s procenty, alergeny, hmotnost, trvanlivost, skladování a kdo směs vyrobil.

   Druh, název ve složení a limit každé suroviny jsou v katalogu (admin,
   Ingredience → Na etiketu). Podíly počítá recipe.js. */
function ingLabelInfo(code) {
    const ing = ingByCode(code) || {};
    return {
        kind:      ing.kind || (ing.category === 'base' ? 'tea' : 'herb'),
        label:     ing.label || tIng(code).toLocaleLowerCase(LOCALE),
        maxPct:    ing.maxPct || null,
        allergens: ing.allergens || '',
    };
}

/* Složení seřazené od největšího podílu (nařízení 1169/2011, čl. 18).
   K poli jsou přilepené výsledky kontroly: ok, error, category. */
function blendComposition(codes, parts) {
    const r = recipeOf(codes, parts, 100);
    if (!r.rows.length || ['empty', 'unknown', 'too_many', 'duplicate'].includes(r.error)) return [];
    const comp = r.rows.map(row => Object.assign({ code: row.code, pct: row.pct, pinch: row.pinch }, ingLabelInfo(row.code)))
        .sort((x, y) => y.pct - x.pct);
    return Object.assign(comp, { ok: r.ok, error: r.error, errorCode: r.errorCode, category: r.category, teaOnly: r.teaOnly });
}

/* Název podle vyhlášky 187/2023 Sb., § 2: pravý čaj aspoň z poloviny je
   (ochucený) čaj, víc než polovina bylin bylinný čaj, víc než polovina
   sušeného ovoce ovocný čaj. Jinak směs nemá druh a neprodává se (null). */
function legalBlendName(comp) {
    if (!comp || !comp.length || !comp.category) return null;
    const cap = str => str.charAt(0).toLocaleUpperCase(LOCALE) + str.slice(1);
    const N = {
        cs: { tea: 'čaj', flavoured: 'Ochucený ', herb: 'Bylinný čaj', fruit: 'Ovocný čaj' },
        sk: { tea: 'čaj', flavoured: 'Ochutený ', herb: 'Bylinný čaj', fruit: 'Ovocný čaj' },
        en: { tea: 'tea', flavoured: 'Flavoured ', herb: 'Herbal tea', fruit: 'Fruit tea' },
    }[LANG];
    if (comp.category === 'tea') {
        const teas = comp.filter(c => c.kind === 'tea');
        const group = teas.length === 1 ? teas[0].label : N.tea;
        return comp.teaOnly ? cap(group) : N.flavoured + group;
    }
    return comp.category === 'herb' ? N.herb : N.fruit;
}

function foodInfo(codes, parts) {
    const comp = blendComposition(codes, parts);
    if (!comp.length || !comp.ok) return null;
    const name = legalBlendName(comp);
    const allergens = [...new Set(comp.flatMap(c => c.allergens.split(/[,;]/).map(a => a.trim()).filter(Boolean)
        .filter(a => !/^(žádné|zadne|none|-)$/i.test(a))))];
    return {
        name,
        composition: comp.map(c => `${c.label} ${c.pct} %`).join(', '),
        allergens,
        comp,
    };
}

function foodInfoRows(codes, parts, weight) {
    const info = foodInfo(codes, parts);
    if (!info) return '';
    const g = parseInt(weight, 10);
    const brew = brewFor(codes, parts);
    const maker = [SELLER.name, SELLER.address].filter(Boolean).join(', ');
    // bylinný/ovocný čaj s trochou pravého čaje: upozornit na kofein (v každém jazyce)
    const herbalWithTea = info.comp.some(c => c.kind === 'tea') && info.comp.category !== 'tea';
    const rows = [
        [t('food_name'), info.name + (herbalWithTea ? '. ' + t('food_caffeine') : '')],
        [t('food_ingredients'), info.composition],
        [t('food_allergens'), info.allergens.length ? info.allergens.join(', ') : t('food_no_allergens')],
        [t('food_weight'), g ? `${g} g` : t('food_weight_pick')],
        [t('food_durability'), t('food_durability_val').replace('{n}', DURABILITY_MONTHS)],
        [t('food_storage'), t('food_storage_val')],
        [t('food_prep'), `2–3 g ${t('food_prep_per')} 200 ml, ${brew.temp}, ${brew.time}`],
        [t('food_maker'), maker || '[doplnit]'],
    ];
    return `<dl class="food-facts">${rows.map(([k, v]) =>
        `<div><dt>${escHtml(k)}</dt><dd${v === '[doplnit]' ? ' class="is-missing"' : ''}>${escHtml(v)}</dd></div>`).join('')}</dl>`;
}

/* Vyplní blok s informacemi. U <details> zůstane shrnutí nahoře. */
function renderFoodInfo(el, codes, parts, weight) {
    if (!el) return;
    const rows = foodInfoRows(codes, parts, weight);
    el.hidden = !rows;
    if (!rows) { el.innerHTML = ''; return; }
    if (el.tagName === 'DETAILS') {
        const open = el.open;
        el.innerHTML = `<summary>${escHtml(t('food_title'))}</summary>${rows}`;
        el.open = open;
    } else {
        el.innerHTML = `<h2 class="brew-title" id="${el.id}-title">${escHtml(t('food_title'))}</h2>${rows}`;
    }
}

/* ─── Převzetí dat z databáze ──────────────── */
function validCatalog(c) {
    return !!c && typeof c === 'object'
        && Array.isArray(c.ingredients) && Array.isArray(c.blends)
        && Array.isArray(c.prices) && Array.isArray(c.shipping);
}

/* Suroviny z katalogu: překlady, barvy, druh, limity a příplatky. Vrací
   false, když v některé skupině nic není (mixér by neměl z čeho míchat). */
function applyIngredientRows(list) {
    const rows = (list || [])
        .filter(r => r && r.active !== false && ING_CATEGORY_GROUP[r.category]
            && typeof r.id === 'string' && /^[A-Za-z0-9][A-Za-z0-9 ]{0,39}$/.test(r.code || ''))
        .sort(bySort);
    if (!['base', 'flavor', 'extra'].every(cat => rows.some(r => r.category === cat))) return false;

    const groups = { bases: [], flavors: [], extras: [] };
    rows.forEach(r => {
        const key = 'ing_' + r.id;
        TRANSLATIONS.cs[key] = r.name_cs || r.name_en || r.code;
        TRANSLATIONS.sk[key] = r.name_sk || r.name_cs || r.name_en || r.code;
        TRANSLATIONS.en[key] = r.name_en || r.name_cs || r.code;
        TRANSLATIONS.cs[key + '_desc'] = r.desc_cs || '';
        TRANSLATIONS.sk[key + '_desc'] = r.desc_sk || r.desc_cs || '';
        TRANSLATIONS.en[key + '_desc'] = r.desc_en || r.desc_cs || '';
        ING_KEYS[r.code] = key;
        const ing = {
            key,
            code:     r.code,
            category: r.category,
            emoji:    r.emoji || '🍵',
            color:    /^#[0-9a-f]{6}$/i.test(r.color || '') ? r.color : '#cccccc',
            flavor:   pickLang(r, 'flavor') || [],
            pairs:    (r.pairs || []).filter(p => typeof p === 'string'),
            photo:    safePhoto(r.photo_url),
            icon:     safePhoto(r.icon_url),
            inStock:  r.in_stock !== false,
            kind:      ['tea', 'herb', 'fruit', 'other'].includes(r.kind) ? r.kind : '',
            // název ve složení v jazyce webu (česky podle vyhlášky, slovensky
            // z administrace, anglicky podle anglického názvu)
            label:     ({
                cs: (r.label_cs || '').trim(),
                sk: (r.label_sk || '').trim() || (r.name_sk ? r.name_sk.toLocaleLowerCase('sk') : (r.label_cs || '').trim()),
                en: (r.name_en || '').toLocaleLowerCase('en'),
            })[LANG],
            maxPct:    Number.isInteger(r.max_pct) && r.max_pct > 0 && r.max_pct <= 100 ? r.max_pct : null,
            allergens: typeof r.allergens === 'string' ? r.allergens.trim() : '',
            surcharge: Number.isInteger(r.surcharge_czk) && r.surcharge_czk > 0 ? r.surcharge_czk : 0,
        };
        if (r.category === 'base') {
            if (Number.isInteger(r.caffeine)) ing.caffeine = Math.max(0, Math.min(5, r.caffeine));
            if (r.brew_temp || r.brew_time) {
                BREW[r.code] = { temp: r.brew_temp || '90–95°C', time: r.brew_time || '3–4 min' };
            }
        }
        groups[ING_CATEGORY_GROUP[r.category]].push(ing);
    });
    ING_DATA.bases   = groups.bases;
    ING_DATA.flavors = groups.flavors;
    ING_DATA.extras  = groups.extras;
    return true;
}

/* Hotové směsi: jen ty, které se dají namíchat z dnešní nabídky a projdou
   pravidly receptury. Díly chybí u starších řádků, pak platí 3 + 1 + 1. */
function applyBlendRows(list) {
    catalogBlends = (list || [])
        .filter(b => b && b.active !== false && typeof b.id === 'string' && typeof b.name === 'string'
            && Array.isArray(b.ingredients) && b.ingredients.length && b.ingredients.every(code => ingByCode(code)))
        .map(b => {
            const n = Recipe.normalize(b.ingredients, b.parts);
            return Object.assign({}, b, { ingredients: n.codes, parts: n.parts });
        })
        .filter(b => recipeOf(b.ingredients, b.parts, 100).ok)
        .sort(bySort);
    catalogBlends.forEach(b => { const d = pickLang(b, 'desc'); if (d) BLEND_DESCS[b.name] = d; });
    MIX_PRESETS.length = 0;
    catalogBlends.filter(b => b.is_preset).forEach(b => {
        MIX_PRESETS.push({ name: b.name, ingredients: b.ingredients.slice(), parts: b.parts.slice() });
    });
}

/* Vestavěná nabídka, dokud nepřijde katalog (nebo když databáze není). */
function applyBuiltinCatalog() {
    applyIngredientRows(BUILTIN_INGREDIENTS);
    applyBlendRows(BUILTIN_BLENDS);
}

/* Přepíše data webu podle katalogu. Nic nevykresluje (to dělá
   renderCatalogDom). Vrací false, když katalog nedává smysl — třeba když
   v databázi zrovna chybí ceník — a pak web jede dál s tím, co měl. */
function applyCatalog(c) {
    if (!validCatalog(c)) return false;
    const prices = c.prices
        .filter(p => p && p.active !== false && Number.isInteger(p.weight_g) && p.weight_g > 0
            && Number.isFinite(p.price_czk) && p.price_czk > 0)
        .sort((a, b) => a.weight_g - b.weight_g);
    if (!prices.length) return false;
    const before = { bases: ING_DATA.bases, flavors: ING_DATA.flavors, extras: ING_DATA.extras };
    if (!applyIngredientRows(c.ingredients)) { Object.assign(ING_DATA, before); return false; }

    Object.keys(PRICES).forEach(k => delete PRICES[k]);
    prices.forEach(p => { PRICES[p.weight_g] = p.price_czk; });
    const minPrice = prices[0].price_czk;
    TRANSLATIONS.cs.price_from = 'od ' + fmt(minPrice);
    TRANSLATIONS.en.price_from = 'from ' + fmt(minPrice);

    catalogShipping = {};
    c.shipping.forEach(s => {
        if (s && typeof s.id === 'string' && Number.isFinite(s.price_czk)) {
            catalogShipping[s.id] = { price: s.price_czk, active: s.active !== false };
        }
    });

    const st = c.settings || {};
    if (Number.isFinite(st.free_ship_threshold) && st.free_ship_threshold >= 0) {
        FREE_SHIP_THRESHOLD = st.free_ship_threshold;
    }
    promoBarEnabled = st.promo_bar_enabled !== false;
    applyShopSettings(st);
    if (st.promo_bar_cs) TRANSLATIONS.cs.promo_text = st.promo_bar_cs;
    if (st.promo_bar_sk || st.promo_bar_cs) TRANSLATIONS.sk.promo_text = st.promo_bar_sk || st.promo_bar_cs;
    if (st.promo_bar_en) TRANSLATIONS.en.promo_text = st.promo_bar_en;
    else if (st.promo_bar_cs) TRANSLATIONS.en.promo_text = st.promo_bar_cs;

    applyBlendRows(c.blends);

    if (Array.isArray(c.craft)) {
        catalogCraft = c.craft
            .filter(r => r && r.active !== false && typeof r.id === 'string' && /^[a-z0-9_]{2,40}$/.test(r.id)
                && (r.kind === 'soap' || r.kind === 'balm') && typeof r.name_cs === 'string')
            .map(r => ({ ...r, color: /^#[0-9a-f]{6}$/i.test(r.color || '') ? r.color : '#d9c4a0',
                         ingredients: (r.ingredients || []).filter(code => typeof code === 'string') }))
            .sort(bySort);
    }

    catalogLoaded = true;
    return true;
}

/* ─── Vykreslení ───────────────────────────── */
function renderCatalogDom() {
    if (!catalogLoaded) return;
    renderIngredientButtons();
    renderBlendCards();
    renderCraft();
    renderPriceOptions();
    renderShippingOptions();
    const bar = document.getElementById('promo-bar');
    if (bar && !promoBarEnabled) bar.style.display = 'none';
    applySalesState();
}

/* Před spuštěním prodeje: lišta nahoře místo akční, zavřená pokladna.
   Bez databáze (zkušební režim bez config.js) se nic nezavírá. */
function salesOpen() {
    return SALES_OPEN || !(window.TeaDB && TeaDB.configured);
}
function applySalesState() {
    // Dokud nastavení nepřišlo, lištu neukazujeme (ať po spuštění neproblikne),
    // ale objednat taky nejde.
    const closed = SALES_KNOWN && !salesOpen();
    const launch = document.getElementById('launch-bar');
    if (launch) launch.hidden = !closed;
    const promo = document.getElementById('promo-bar');
    if (promo && closed) promo.style.display = 'none';
    document.body.classList.toggle('sales-closed', closed);
    ['cart-closed-note', 'checkout-closed-note'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.hidden = !closed;
    });
    const cartBtn = document.getElementById('cart-checkout-btn');
    if (cartBtn) cartBtn.disabled = closed;
    const submit = document.querySelector('#checkout-form .checkout-submit');
    if (submit) submit.disabled = !salesOpen();
}

/* Tlačítka surovin v mixéru. Vybrané podle mixItems; co mezitím zmizelo
   z nabídky nebo se vyprodalo, ze směsi vypadne. */
function renderIngredientButtons() {
    const before = mixItems.length;
    mixItems = mixItems.filter(x => { const ing = ingByCode(x.code); return ing && ing.inStock !== false; });
    Object.values(MIX_GROUP_OF_STEP).forEach(group => {
        const grid = document.querySelector(`.btn-grid[data-group="${group}"]`);
        if (!grid) return;
        grid.innerHTML = ING_DATA[group].map(ing => {
            const out = ing.inStock === false;
            const selected = !out && mixItems.some(x => x.code === ing.code);
            const cls = ['ingredient-btn', out && 'is-out', selected && 'selected'].filter(Boolean).join(' ');
            const tags = [
                ing.surcharge ? `<span class="ing-tag ing-tag--premium">${escHtml(t('mix_premium_tag'))}</span>` : '',
                isPinchIng(ing) ? `<span class="ing-tag">${escHtml(t('mix_pinch'))}</span>` : '',
            ].join('');
            return `<button type="button" class="${cls}" data-color="${ing.color}"`
                + ` data-name="${escHtml(ing.code)}" aria-pressed="${selected}"${out ? ' aria-disabled="true"' : ''}>`
                + ingIconHtml(ing.code)
                + `<span class="ing-text"><span class="ing-name">${escHtml(t(ing.key))}${tags}</span>`
                + `<span class="ing-note">${escHtml(t(ing.key + '_desc') || '')}</span></span>`
                + (out ? `<span class="ing-out-badge">${escHtml(t('ing_sold_out'))}</span>` : '')
                + `</button>`;
        }).join('');
    });
    if (before !== mixItems.length && typeof updateMixerUI === 'function') updateMixerUI();
}

/* Nejnižší cena hotové směsi (nejmenší balení i s příplatkem). */
function blendPriceFrom(b) {
    const prices = sortedWeights().map(w => unitPrice(b.ingredients, b.parts, w)).filter(Boolean);
    return prices.length ? Math.min(...prices) : 0;
}

function renderBlendCards() {
    const grid = document.querySelector('.ready-grid');
    if (!grid) return;
    const section = grid.closest('.ready-made-section');
    if (section) section.style.display = catalogBlends.length ? '' : 'none';
    grid.innerHTML = catalogBlends.map(b => {
        const photo = safePhoto(b.photo_url);
        const visual = photo
            ? `<div class="ready-photo"><img src="${escHtml(photo)}" alt="" loading="lazy" decoding="async"></div>`
            : pouchHtml({ name: b.name, codes: b.ingredients, parts: b.parts, size: 'pouch--sm' });
        const soldOut = outOfStockIn(b.ingredients).length
            ? `<span class="ing-out-badge">${escHtml(t('ing_sold_out'))}</span>` : '';
        const tint = ingColor(b.ingredients[1]) || ingColor(b.ingredients[0]) || '';
        const from = blendPriceFrom(b);
        return `<article class="ready-card" role="button" tabindex="0" data-blend="${escHtml(b.id)}" aria-label="${escHtml(b.name)}">
                <div class="ready-visual"${tint ? ` style="--tint:${escHtml(tint)}"` : ''}>${visual}</div>
                <h3 class="ready-name">${escHtml(b.name)}</h3>
                <p class="ready-mix">${escHtml(blendSubtitle(b.ingredients))}</p>
                <p class="ready-foot"><span class="ready-price">${escHtml(from ? t('price_from_n').replace('{price}', fmt(from)) : t('price_from'))}</span>${soldOut}</p>
            </article>`;
    }).join('');
    grid.querySelectorAll('.ready-card[data-blend]').forEach(card => {
        const open = () => openBlend(card.getAttribute('data-blend'));
        card.addEventListener('click', open);
        card.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
        });
    });
}

function openBlend(id) {
    const b = catalogBlends.find(x => x.id === id);
    if (!b) return;
    const desc = pickLang(b, 'desc');
    const price = unitPrice(b.ingredients, b.parts, 100) || blendPriceFrom(b);
    openDetail(b.name, desc || '', price, b.ingredients.slice(), null, b.parts.slice());
}

/* Volá openDetail: fotka směsi místo skleničky (když ji admin nahrál)
   a upozornění, když je některá ingredience vyprodaná. */
function showDetailPhotoAndStock(name, ingredients) {
    const blend = catalogBlends.find(b => b.name === name);
    const photo = blend ? safePhoto(blend.photo_url) : '';
    const img = document.getElementById('detail-photo');
    const glass = document.getElementById('detail-pouch');
    if (img) {
        if (photo) { img.src = photo; img.alt = name; img.hidden = false; }
        else { img.hidden = true; img.removeAttribute('src'); }
    }
    if (glass) glass.style.display = photo ? 'none' : '';
    const note = document.getElementById('detail-stock-note');
    if (note) {
        const out = outOfStockIn(ingredients);
        note.hidden = !out.length;
        note.textContent = out.length ? `${t('stock_note_blend')} (${out.map(tIng).join(', ')})` : '';
    }
}

function renderPriceOptions() {
    const weights = Object.keys(PRICES).map(Number).sort((a, b) => a - b);
    const current = parseInt(currentProduct.weight, 10) || 0;
    const price = w => unitPrice(currentProduct.ingredients, currentProduct.parts, w) || PRICES[w];
    document.querySelectorAll('.qty-options:not(#mixer-sizes)').forEach(box => {
        const selectedHere = box.querySelector('.qty-btn.selected');
        box.innerHTML = weights.map(w =>
            `<button type="button" class="qty-btn${selectedHere && w === current ? ' selected' : ''}" onclick="selectQty(${w}, event)">`
            + `${w} g<span class="qty-price">${fmt(price(w))}</span></button>`
        ).join('');
    });
    if (current && PRICES[current]) {
        currentProduct.priceBase = price(current);
        const add = document.getElementById('detail-add-btn');
        if (add) add.textContent = t('add_for').replace('{price}', fmt(currentProduct.priceBase));
    } else if (current) {
        // Vybraná gramáž zmizela z ceníku — výběr zrušit.
        currentProduct.weight = '';
        currentProduct.priceBase = 0;
        ['detail-add-btn'].forEach(id => {
            const b = document.getElementById(id);
            if (b) { b.disabled = true; b.classList.add('disabled'); }
        });
    }
}

function renderShippingOptions() {
    if (!catalogShipping) return;
    document.querySelectorAll('input[name="shipping"]').forEach(radio => {
        const s = catalogShipping[radio.value];
        const label = radio.closest('.shipping-option');
        if (!label) return;
        if (!s || !s.active) {
            if (radio.checked) radio.checked = false;
            radio.disabled = true;
            label.style.display = 'none';
            if (radio.value === 'zasilkovna') {
                const picker = document.getElementById('packeta-picker');
                if (picker) picker.style.display = 'none';
            }
            return;
        }
        radio.disabled = false;
        label.style.display = '';
        radio.setAttribute('data-price', String(s.price));
        const priceEl = label.querySelector('.shipping-price');
        if (priceEl) priceEl.textContent = fmt(s.price);
    });
}

/* Košík z minulé návštěvy: ceny a barvy podle aktuálního katalogu.
   Rozhoduje stejně cena z databáze — tohle je jen ať souhlasí, co zákazník vidí. */
function repriceCart() {
    let changed = false;
    cart.forEach(item => {
        const price = unitPrice(item.ingredients, item.parts, item.weight);
        if (price && price !== item.priceBase) { item.priceBase = price; changed = true; }
        item.colors = item.ingredients.map((c, i) => ingColor(c) || item.colors[i] || 'transparent');
    });
    if (changed) saveCart();
}

function rerenderAfterCatalog() {
    renderCatalogDom();
    if (typeof refreshRedesign === 'function') refreshRedesign();
    applyTranslations();
    applySeller();
    if (document.getElementById('product-detail-page')?.classList.contains('active') && currentProduct) {
        renderDetailVisual(currentProduct.name, currentProduct.ingredients, currentProduct.parts);
    }
    renderIngredientEncyclopedia();
    renderPresets();
    repriceCart();
    renderCart();
    updateCartBadge();
    if (document.getElementById('checkout-page')?.classList.contains('active')) renderCheckoutSummary();
    const checkedShip = document.querySelector('input[name="shipping"]:checked');
    if (checkedShip) updateShippingCost(checkedShip);
}

/* ─── Načítání ─────────────────────────────── */
function readCatalogCache() {
    const cached = readStore(CATALOG_CACHE_KEY, null);
    if (!cached || typeof cached !== 'object' || !validCatalog(cached.data)) return null;
    if (!(Date.now() - Number(cached.at) < CATALOG_MAX_AGE_MS)) return null;
    return cached.data;
}

function applyCachedCatalog() {
    if (!window.TeaDB || !TeaDB.configured) return;
    const data = readCatalogCache();
    if (data && applyCatalog(data)) {
        renderCatalogDom();
        repriceCart();
    }
    // (hero, spíž a ceny se vykreslí v initRedesign hned potom)
}

let catalogRefreshing = null;
function refreshCatalog() {
    if (!window.TeaDB || !TeaDB.configured) return Promise.resolve(false);
    if (catalogRefreshing) return catalogRefreshing;
    catalogRefreshing = (async () => {
        try {
            const [ingredients, blends, prices, shipping, settingsRows, craft] = await Promise.all([
                TeaDB.select('ingredients',      { order: 'sort.asc,name_cs.asc' }),
                TeaDB.select('blends',           { order: 'sort.asc,name.asc' }),
                TeaDB.select('price_tiers',      { order: 'weight_g.asc' }),
                TeaDB.select('shipping_methods', { order: 'sort.asc' }),
                TeaDB.select('settings',         { id: 'eq.1' }),
                // Tabulka mýdel přibyla později. Dokud v databázi není,
                // web ukáže vestavěné ukázky a zbytek katalogu jede normálně.
                TeaDB.select('craft_products',   { order: 'sort.asc' }).catch(() => null),
            ]);
            const fresh = { ingredients, blends, prices, shipping, settings: (settingsRows || [])[0] || null, craft };
            const previous = readCatalogCache();
            if (!applyCatalog(fresh)) {
                console.warn('[teaseyou] Katalog z databáze je neúplný (chybí ceník nebo ingredience), nechávám původní.');
                return false;
            }
            try { localStorage.setItem(CATALOG_CACHE_KEY, JSON.stringify({ at: Date.now(), data: fresh })); } catch (_) {}
            if (!previous || JSON.stringify(previous) !== JSON.stringify(fresh)) rerenderAfterCatalog();
            return true;
        } catch (err) {
            console.warn('[teaseyou] Katalog se nepodařilo načíst, jedu z uložených dat.', err);
            return false;
        } finally {
            catalogRefreshing = null;
            revalidateStoredPromo();
        }
    })();
    return catalogRefreshing;
}

/* Sleva z minulé návštěvy: ověřit v databázi, jestli pořád platí a kolik. */
let promoRevalidated = false;
async function revalidateStoredPromo() {
    if (promoRevalidated || !storedPromoCode || !window.TeaDB || !TeaDB.configured) return;
    promoRevalidated = true;
    try {
        const res = await TeaDB.rpc('check_promo', { p_code: storedPromoCode });
        if (res) {
            appliedPromo = { code: res.code, rate: Number(res.rate), label: res.label };
        } else {
            const hadOne = !!appliedPromo;
            appliedPromo = null;
            if (hadOne && cart.length) showToast(t('promo_expired'), '🏷️');
        }
        savePromo();
        renderCart();
    } catch (_) { /* bez sítě necháme, co bylo; databáze stejně ověří při objednávce */ }
}

/* ─── Objednávka do databáze ───────────────── */
/* Datum znění obchodních podmínek a zásad ochrany osobních údajů, které
   jsou teď na webu. Ukládá se ke každé objednávce jako záznam o tom, s čím
   zákazník souhlasil. Při změně podmínek ho přepiš a staré znění si nech
   (je v historii gitu). */
const TERMS_VERSION = '2026-11-05';

function buildOrderPayload(form) {
    const val = name => (form.elements[name] ? String(form.elements[name].value || '').trim() : '');
    const ship = form.querySelector('input[name="shipping"]:checked');
    const pay  = form.querySelector('input[name="payment"]:checked');
    // Na výdejní místo adresu nepotřebujeme, tak ji ani neposíláme.
    const needsAddress = !ship || ship.value !== 'zasilkovna';
    const addr = name => (needsAddress ? val(name) : '');
    return {
        customer: {
            firstName: val('firstName'), lastName: val('lastName'),
            email: val('email'), phone: val('phone'),
            street: addr('street'), city: addr('city'), zip: addr('zip'), country: val('country'),
        },
        items: cart.map(i => ({
            name:        i.name,
            ingredients: i.ingredients.slice(),
            parts:       i.parts.slice(),
            weight_g:    parseInt(i.weight, 10),
            qty:         i.qty,
        })),
        shipping: ship ? ship.value : '',
        payment:  pay ? pay.value : '',
        note:     val('note'),
        promo:    appliedPromo ? appliedPromo.code : '',
        packetaPoint: packetaPoint
            ? { id: String(packetaPoint.id || ''), name: `${packetaPoint.name}, ${packetaPoint.city}` }
            : null,
        lang: LANG,
        termsVersion: TERMS_VERSION,
    };
}

const ORDER_ERROR_CODES = new Set(['sales_closed', 'out_of_stock', 'promo_invalid', 'invalid_customer', 'too_many_orders',
    'pickup_point_required', 'invalid_shipping', 'invalid_weight', 'unknown_ingredient']);

function handleOrderError(err) {
    const code = err && err.message;
    const refresh = () => refreshCatalog();
    switch (code) {
        case 'sales_closed':
            SALES_OPEN = false;
            applySalesState();
            showToast(t('sales_closed_toast'), '🌱');
            break;
        case 'out_of_stock': {
            const names = String(err.details || '').split(',').map(s => s.trim()).filter(Boolean).map(tIng);
            showToast(`${t('err_sold_out_named')} ${names.join(', ')}`, '🫙');
            refresh();
            break;
        }
        case 'promo_invalid':
            removePromo();
            showToast(t('promo_invalid'), '🏷️');
            break;
        case 'invalid_customer':      showToast(t('err_invalid_customer'), '⚠️'); break;
        case 'too_many_orders':       showToast(t('err_too_many_orders'), '⏳'); break;
        case 'pickup_point_required': showToast(t('err_pickup_point'), '📦'); break;
        case 'invalid_shipping':      showToast(t('err_shipping_unavailable'), '🚚'); refresh(); break;
        case 'invalid_weight':        showToast(t('err_weight_unavailable'), '⚖️'); refresh(); break;
        case 'unknown_ingredient':    showToast(t('err_unknown_ingredient'), '⚠️'); refresh(); break;
        case 'invalid_recipe':        showToast(t('err_invalid_recipe'), '⚠️'); refresh(); break;
        default:                      showToast(t('toast_order_failed'), '⚠️');
    }
}

/* E-mail s objednávkou přes Formspree, když je nastavený. Jen navíc —
   objednávka už je v databázi a v administraci, i kdyby tohle selhalo. */
function notifyFormspree(form, order) {
    if (FORMSPREE_ID === 'YOUR_FORM_ID') return;
    try {
        const fd = new FormData(form);
        fd.append('_subject', `Nová objednávka ${order.num} — Tease you`);
        fd.append('order_json', JSON.stringify(order, null, 2));
        fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
            method: 'POST', body: fd, headers: { Accept: 'application/json' }
        }).catch(err => console.warn('[teaseyou] E-mail o objednávce se neodeslal (objednávka je uložená):', err));
    } catch (err) {
        console.warn('[teaseyou] E-mail o objednávce se neodeslal (objednávka je uložená):', err);
    }
}


/* =============================================
   NOVÝ VZHLED — sklenice, úvodní stránka, mixér po krocích
   ============================================= */

Object.assign(TRANSLATIONS.cs, {
    hero_title:        'Namíchej si čaj. Pojmenuj ho.',
    hero_lede:         'Vybereš až pět surovin a poměr, jaký chceš. Směs čerstvě namícháme a pošleme ti ji v sáčku s tvým jménem.',
    hero_quiz_link:    'Nevíš, co vybrat? Poradí ti kvíz',
    how_result_note:   'Namícháme po objednání, obvykle odešleme do 24 hodin.',
    hero_pick:         'Chci tuhle',
    hero_shuffle:      'Zamíchat jinak',
    hero_note_price:   'Balení od {price}.',
    hero_note_ship:    'Nad {limit} doprava zdarma.',
    how_cta:           'Začít míchat',
    shelf_title:       'Naše směsi',
    shelf_lede:        'Hotové kombinace. Objednej je rovnou, nebo si je v mixéru uprav podle sebe.',
    quizband_title:    'Nevíš, co by ti chutnalo?',
    quizband_text:     'Odpověz na pět krátkých otázek a doporučíme ti směs, která sedí tvé náladě i denní době.',
    quizband_btn:      'Spustit kvíz',
    pantry_lede:       'Na výběr je {bases} základů, {flavors} příchutí a {extras} doplňků. Do jedné směsi jich dáš až {max} v poměru, jaký chceš.',
    faq_lede:          'Něco tu chybí? Napiš na <a href="mailto:hello@teaseyou.cz">hello@teaseyou.cz</a>.',
    mixer_prev:        'Zpět',
    mixer_price:       'Od {price} za {weight} g',
    glass_label_extras:'Doplněk',
    glass_name_default:'Tvoje směs',
    default_mix_name:  'Moje směs',
    nav_mix:           'Namíchat',
    nav_shelf:         'Naše směsi',
    nav_quiz:          'Najdi svůj blend',
    nav_quiz_short:    'Kvíz',
    nav_saved_short:   'Uložené',
    footer_shop:       'Obchod',
    footer_info:       'Informace',
    footer_tagline2:   'Čajové směsi na míru, míchané až po objednání.',
    footer_cookies:    'Cookies',
    footer_made_in:    'Mícháme v Česku',
    theme_dark:        'Tmavý režim',
    theme_light:       'Světlý režim',
    aria_menu:         'Menu',
    aria_close:        'Zavřít',
    aria_theme:        'Přepnout tmavý režim',
    aria_mobile_nav:   'Mobilní navigace',
    aria_main_nav:     'Hlavní navigace',
    ship_zasilkovna_name: 'Zásilkovna',
    toast_shared_loaded: 'Načetli jsme sdílenou směs ✨',
    lang_label:        'Jazyk',
    legal_lang_note:   '',
});
Object.assign(TRANSLATIONS.en, {
    hero_title:        'Mix your tea. Name it.',
    hero_lede:         'Pick up to five ingredients and any ratio you like. We blend it fresh and send it in a pouch with your name on it.',
    hero_quiz_link:    'Not sure what to pick? Take the quiz',
    how_result_note:   'Blended after you order, usually shipped within 24 hours.',
    hero_pick:         'I want this one',
    hero_shuffle:      'Shuffle',
    hero_note_price:   'Packs from {price}.',
    hero_note_ship:    'Free shipping over {limit}.',
    how_cta:           'Start mixing',
    shelf_title:       'Our blends',
    shelf_lede:        'Ready-made combinations. Order one as it is, or tweak it in the mixer.',
    quizband_title:    'Not sure what you would like?',
    quizband_text:     'Answer five quick questions and we will suggest a blend for your mood and time of day.',
    quizband_btn:      'Take the quiz',
    pantry_lede:       'Pick from {bases} bases, {flavors} flavours and {extras} extras. Put up to {max} in one blend, in any ratio you like.',
    faq_lede:          'Missing something? Write to <a href="mailto:hello@teaseyou.cz">hello@teaseyou.cz</a>.',
    mixer_prev:        'Back',
    mixer_price:       'From {price} for {weight} g',
    glass_label_extras:'Extra',
    glass_name_default:'Your blend',
    default_mix_name:  'My blend',
    nav_mix:           'Mix',
    nav_shelf:         'Our blends',
    nav_quiz:          'Find my blend',
    nav_quiz_short:    'Quiz',
    nav_saved_short:   'Saved',
    footer_shop:       'Shop',
    footer_info:       'Information',
    footer_tagline2:   'Custom tea blends, mixed only after you order.',
    footer_cookies:    'Cookies',
    footer_made_in:    'Blended in Czechia',
    theme_dark:        'Dark mode',
    theme_light:       'Light mode',
    aria_menu:         'Menu',
    aria_close:        'Close',
    aria_theme:        'Toggle dark mode',
    aria_mobile_nav:   'Mobile navigation',
    aria_main_nav:     'Main navigation',
    ship_zasilkovna_name: 'Zásilkovna (Packeta)',
    toast_shared_loaded: 'Loaded a shared blend ✨',
    lang_label:        'Language',
    legal_lang_note:   'These documents are in Czech, the language of the contract. If anything is unclear, write to hello@teaseyou.cz and we will explain.',
});

Object.assign(TRANSLATIONS.cs, {
    q_1:               'Na čem ji postavíš?',
    q_1_hint:          'Vyber základ, klidně dva. Určuje chuť i to, kolik bude mít kofeinu.',
    q_2:               'Jakou chceš příchuť?',
    q_2_hint:          'Vyber, kolik chceš, nebo krok přeskoč.',
    q_3:               'Doladíme ji?',
    q_3_hint:          'Citrusová kůra, koření nebo špetka květů. Nepovinné.',
    q_4:               'Hotovo. Pojmenuj ji.',
    name_label:        'Jméno na sáček',
    name_placeholder2: 'Např. Tichý večer',
    name_suggest:      'Vymyslet',
    size_label:        'Velikost',
    btn_save_blend:    'Uložit na později',
    btn_share_blend:   'Poslat odkaz',
    mixer_step_of:     'Krok {n} ze 4',
    mixer_next:        'Dál',
    mixer_add:         'Do košíku',
    mixer_pick_base:   'Vyber aspoň jeden základ',
    mixer_skip:        'Přeskočit',
    bar_empty:         'Zatím nic nevybráno',
    bar_price:         '{price} za {weight} g',
    mixer_price_now:   '{price} za {weight} g',
    preset_label:      'Nebo začni od hotové:',
    mix_title:         'Tvoje směs',
    mix_count:         '{n} z {max}',
    mix_size_label:    'Spočítat pro',
    mix_hint:          'Poměr nastavíš díly: 2 díly jsou dvakrát víc než 1.',
    mix_part_1:        '1 díl',
    mix_parts_n:       '{n} díly',
    mix_parts_of:      'Díly: {name}',
    mix_less:          'Méně: {name}',
    mix_more:          'Víc: {name}',
    mix_remove:        'Odebrat: {name}',
    mix_added:         'Přidáno: {name}',
    mix_removed:       'Odebráno: {name}',
    mix_pinch:         'špetka',
    mix_premium_tag:   'prémiová',
    mix_premium_row:   '+{price}/100 g',
    mix_max:           'nejvýš {max} %',
    mix_full:          'Do jedné směsi dáme nejvýš 5 surovin. Nejdřív nějakou odeber.',
    mix_pinch_full:    'Špetku dáme nejvýš ze dvou surovin.',
    mix_over_limit:    '{name} smí tvořit nejvýš {max} % směsi.',
    mix_no_category:   'Takhle to podle vyhlášky není ochucený, bylinný ani ovocný čaj: čaj musí tvořit aspoň polovinu, byliny nebo ovoce víc než polovinu.',
    mix_fix_more:      'Zkus přidat díl: {name}.',
    mix_fix_more2:     'Zkus přidat dva díly: {name}.',
    mix_fix_less:      'Zkus ubrat díl: {name}.',
    mix_fix_remove:    'Zkus odebrat: {name}.',
    mix_fix_none:      'Uprav díly, nebo něco odeber.',
    mix_fix_becomes:   'Bude z toho {kind}.',
    mix_kind_tea:      'ochucený čaj',
    mix_kind_herb:     'bylinný čaj',
    mix_kind_fruit:    'ovocný čaj',
    bar_show_recipe:   'Ukázat složení směsi',
    mix_no_main:       'Samotná špetka nestačí. Přidej základ.',
    mix_cups:          '{weight} g vystačí zhruba na {cups} šálků.',
    mix_surcharge_note:'V ceně je příplatek {price} za prémiové suroviny.',
    price_from_n:      'od {price}',
    pairs_tag:         'Hodí se',
    how_pouch_name:    'Tvoje jméno',
    glass_label_base:  'Základ',
    glass_label_flavor:'Příchuť',
    back_to_shelf:     'Naše směsi',
    back_home:         'Zpět na úvod',
    btn_edit_in_mixer: 'Upravit v mixéru',
    add_for:           'Do košíku za {price}',
    brew_title:        'Jak ji připravit',
    brew_dose:         'Dávka',
    brew_dose_val:     '2–3 g na 200 ml vody',
    brew_water:        'Teplota vody',
    brew_time:         'Louhování',
    saved_title:       'Uložené směsi',
    saved_lede:        'Směsi uložené z mixéru. Objednáš je jedním klepnutím.',
    saved_empty:       'Zatím tu nic není. V mixéru můžeš každou směs uložit na později.',
    btn_create_first:  'Namíchat směs',
    btn_load_order:    'Objednat',
    orders_lede:       'Objednávky odeslané z tohohle prohlížeče.',
    orders_empty:      'Zatím tu nejsou žádné objednávky.',
    cart_title:        'Košík',
    cart_empty:        'Vyber si některou z našich směsí, nebo si namíchej vlastní.',
    btn_browse_blends: 'Naše směsi',
    btn_continue:      'Pokračovat v nákupu',
    ship_calculated:   'Doprava se připočítá v pokladně.',
    ship_free:         'Doprava je zdarma.',
    freeship_left:     'Do dopravy zdarma ti chybí {amount}.',
    freeship_done:     'Máš dopravu zdarma.',
    per_piece:         'za kus',
    pieces:            'ks',
    qty_less:          'Ubrat kus',
    qty_more:          'Přidat kus',
    promo_remove:      'Odebrat kód',
    checkout_title:    'Pokladna',
    checkout_summary:  'Tvoje objednávka',
    checkout_shipping: 'Doprava',
    country_select:    'Vyber zemi',
    country_cz:        'Česko',
    country_sk:        'Slovensko',
    ship_dpd_name:     'Kurýr DPD',
    ship_zasilkovna_desc: 'Vyzvedneš na výdejním místě, 2–3 pracovní dny',
    ship_post_desc:    'Až domů, 3–5 pracovních dní',
    ship_dpd_desc:     'Až domů, obvykle další pracovní den',
    packeta_choose:    'Vybrat výdejní místo',
    packeta_change:    'Změnit',
    pay_title:         'Platba',
    pay_cod:           'Dobírka',
    pay_cod_desc:      'Platíš při převzetí (+39 Kč)',
    pay_transfer:      'Bankovní převod',
    pay_transfer_desc: 'Údaje k platbě pošleme e-mailem',
    note_placeholder2: 'Třeba vzkaz na přání, když je to dárek',
    checkout_legal:    'Odesláním objednávky potvrzuješ, že ses seznámil s <a href="#" onclick="event.preventDefault(); showPage(\'terms-page\')">obchodními podmínkami</a> a <a href="#" onclick="event.preventDefault(); showPage(\'privacy-page\')">ochranou osobních údajů</a>.',
    checkout_withdraw_note: 'Směsi namíchané podle tvého výběru děláme na zakázku, takže je nejde vrátit do 14 dnů bez udání důvodu (§ 1837 písm. d) občanského zákoníku). Hotovou směs z nabídky vrátit můžeš, pokud zůstal sáček neotevřený. Reklamovat můžeš obojí.',
    btn_complete_order:'Objednat a zaplatit',
    order_payment_fee: 'Příplatek za dobírku',
    footer_contact:    'Kontakt',
    footer_ico:        'IČO',
    footer_vat:        'Nejsme plátci DPH.',
    footer_withdrawal: 'Odstoupení od smlouvy',
    food_title:        'Složení a informace o potravině',
    food_name:         'Název',
    food_caffeine:     'Obsahuje kofein',
    food_ingredients:  'Složení',
    food_allergens:    'Alergeny',
    food_no_allergens: 'neobsahuje žádný ze 14 hlavních alergenů',
    food_weight:       'Hmotnost',
    food_weight_pick:  'podle zvolené velikosti',
    food_durability:   'Trvanlivost',
    food_durability_val: 'minimálně {n} měsíců od namíchání, přesné datum a šarže jsou na sáčku',
    food_storage:      'Skladování',
    food_storage_val:  'v suchu a temnu při pokojové teplotě, mimo silné pachy; po otevření sáček dobře uzavři',
    food_prep:         'Příprava',
    food_prep_per:     'na',
    food_maker:        'Vyrobil',
    wd_button:         'Odstoupit od smlouvy',
    wd_err_num:        'Číslo objednávky vypadá jako TY-00012.',
    wd_err_many:       'Dnes už jsme od tebe dostali několik odstoupení. Napiš nám prosím e-mail.',
    wd_err_failed:     'Odstoupení se nepodařilo odeslat. Zkus to znovu, nebo nám napiš e-mail.',
    wd_done_title:     'Odstoupení jsme přijali',
    wd_done_when:      'Přijato',
    wd_done_order:     'Objednávka',
    wd_done_who:       'Od',
    wd_done_items:     'Zboží',
    wd_done_next:      'Potvrzení ti pošleme i e-mailem. Zboží pošli do 14 dnů na adresu {address}. Peníze vrátíme do 14 dnů ode dneška, jakmile zboží dorazí nebo doložíš, že jsi ho odeslal.',
    wd_done_print:     'Vytisknout potvrzení',
    wd_offline_title:  'Ještě to pošli e-mailem',
    wd_offline_text:   'Online odstoupení teď nejde uložit. Klikni níž, e-mail je připravený, stačí ho odeslat.',
    wd_offline_send:   'Odeslat e-mail',
    craft_privacy_link:'Jak s e-mailem zacházíme',
    err_payment:       'Vyber, jak chceš zaplatit.',
    address_not_needed:'Na výdejní místo Zásilkovny adresu nepotřebujeme, stačí vybrat zemi.',
    skip_to_content:   'Přeskočit na obsah',
    footer_credits:    'Licence písem a ikon',
    success_title:     'Díky, objednávka je u nás',
    success_desc:      'Směs namícháme a obvykle do 24 hodin odešleme. Shrnutí najdeš v Moje objednávky.',
    success_step1:     'Objednávka přijatá',
    success_step2:     'Namícháme',
    success_step3:     'Odešleme',
    btn_create_another:'Namíchat další směs',
    about_cta:         'Chceš si jednu namíchat?',
    btn_start_creating2:'Namíchat směs',
    ing_page_title:    'Ingredience',
    ing_page_sub:      'Ze všeho tady se dá míchat. U každé ingredience je, jak chutná a s čím se hodí.',
    ing_pairs:         'Hodí se k:',
    ing_use:           'Namíchat s tímhle',
    process_cta_title: 'Chceš si jednu namíchat?',
    btn_start_creating:'Namíchat směs',
    quiz_step_of:      'Otázka {n} z {total}',
    quiz_result_intro: 'Podle tvých odpovědí ti nejvíc sedne',
    quiz_why:          'Vybrali jsme ji, protože hledáš',
    quiz_also:         'Mohla by ti chutnat i',
    btn_order_blend:   'Chci tuhle směs',
    btn_try_again:     'Projít kvíz znovu',
    toast_saved:       'najdeš v Uložených směsích',
    nav_blends:        'Uložené směsi',
    nav_quiz:          'Kvíz',
});
Object.assign(TRANSLATIONS.en, {
    q_1:               'What do we build it on?',
    q_1_hint:          'Pick a base, or two. It sets the taste and how much caffeine it has.',
    q_2:               'Which flavours?',
    q_2_hint:          'Pick as many as you like, or skip this step.',
    q_3:               'Finish it off?',
    q_3_hint:          'Citrus peel, spice or a pinch of flowers. Optional.',
    q_4:               'Done. Give it a name.',
    name_label:        'Name on the pouch',
    name_placeholder2: 'e.g. Still Evening',
    name_suggest:      'Suggest',
    size_label:        'Size',
    btn_save_blend:    'Save for later',
    btn_share_blend:   'Share a link',
    mixer_step_of:     'Step {n} of 4',
    mixer_next:        'Next',
    mixer_add:         'Add to cart',
    mixer_pick_base:   'Pick at least one base',
    mixer_skip:        'Skip',
    bar_empty:         'Nothing picked yet',
    bar_price:         '{price} for {weight} g',
    mixer_price_now:   '{price} for {weight} g',
    preset_label:      'Or start from a ready blend:',
    mix_title:         'Your blend',
    mix_count:         '{n} of {max}',
    mix_size_label:    'Show for',
    mix_hint:          'Set the ratio in parts: 2 parts is twice as much as 1.',
    mix_part_1:        '1 part',
    mix_parts_n:       '{n} parts',
    mix_parts_of:      'Parts: {name}',
    mix_less:          'Less: {name}',
    mix_more:          'More: {name}',
    mix_remove:        'Remove: {name}',
    mix_added:         'Added: {name}',
    mix_removed:       'Removed: {name}',
    mix_pinch:         'a pinch',
    mix_premium_tag:   'premium',
    mix_premium_row:   '+{price}/100 g',
    mix_max:           'max {max} %',
    mix_full:          'One blend takes 5 ingredients at most. Remove one first.',
    mix_pinch_full:    'We add a pinch of two ingredients at most.',
    mix_over_limit:    '{name} can be at most {max} % of the blend.',
    mix_no_category:   'By the rules this is neither a flavoured, herbal nor fruit tea: tea must make up at least half, herbs or fruit more than half.',
    mix_fix_more:      'Try adding a part: {name}.',
    mix_fix_more2:     'Try adding two parts: {name}.',
    mix_fix_less:      'Try taking a part away: {name}.',
    mix_fix_remove:    'Try removing: {name}.',
    mix_fix_none:      'Adjust the parts, or take something out.',
    mix_fix_becomes:   'It becomes a {kind}.',
    mix_kind_tea:      'flavoured tea',
    mix_kind_herb:     'herbal tea',
    mix_kind_fruit:    'fruit tea',
    bar_show_recipe:   'Show the blend',
    mix_no_main:       'A pinch alone is not enough. Add a base.',
    mix_cups:          '{weight} g makes roughly {cups} cups.',
    mix_surcharge_note:'Includes a {price} surcharge for premium ingredients.',
    price_from_n:      'from {price}',
    pairs_tag:         'Goes well',
    how_pouch_name:    'Your name',
    glass_label_base:  'Base',
    glass_label_flavor:'Flavour',
    back_to_shelf:     'Our blends',
    back_home:         'Back to home',
    btn_edit_in_mixer: 'Edit in the mixer',
    add_for:           'Add to cart for {price}',
    brew_title:        'How to brew it',
    brew_dose:         'Dose',
    brew_dose_val:     '2–3 g per 200 ml of water',
    brew_water:        'Water',
    brew_time:         'Steep',
    saved_title:       'Saved blends',
    saved_lede:        'Blends you saved in the mixer. Order them in one tap.',
    saved_empty:       'Nothing here yet. You can save any blend in the mixer for later.',
    btn_create_first:  'Mix a blend',
    btn_load_order:    'Order',
    orders_lede:       'Orders placed from this browser.',
    orders_empty:      'No orders yet.',
    cart_title:        'Cart',
    cart_empty:        'Pick one of our blends or mix your own.',
    btn_browse_blends: 'Our blends',
    btn_continue:      'Continue shopping',
    ship_calculated:   'Shipping is added at checkout.',
    ship_free:         'Shipping is free.',
    freeship_left:     'Add {amount} more for free shipping.',
    freeship_done:     'You have free shipping.',
    per_piece:         'each',
    pieces:            'pcs',
    qty_less:          'One less',
    qty_more:          'One more',
    promo_remove:      'Remove code',
    checkout_title:    'Checkout',
    checkout_summary:  'Your order',
    checkout_shipping: 'Shipping',
    country_select:    'Choose a country',
    country_cz:        'Czechia',
    country_sk:        'Slovakia',
    ship_dpd_name:     'DPD courier',
    ship_zasilkovna_desc: 'Pick up at a Zásilkovna point, 2–3 working days',
    ship_post_desc:    'To your door, 3–5 working days',
    ship_dpd_desc:     'To your door, next working day',
    packeta_choose:    'Choose a pickup point',
    packeta_change:    'Change',
    pay_title:         'Payment',
    pay_cod:           'Cash on delivery',
    pay_cod_desc:      'Pay when you collect it (+39 Kč)',
    pay_transfer:      'Bank transfer',
    pay_transfer_desc: 'We will e-mail you the payment details',
    note_placeholder2: 'A message for the card, if it is a gift',
    checkout_legal:    'By placing the order you confirm you have read our <a href="#" onclick="event.preventDefault(); showPage(\'terms-page\')">terms</a> and <a href="#" onclick="event.preventDefault(); showPage(\'privacy-page\')">privacy policy</a> (in Czech).',
    checkout_withdraw_note: 'Blends mixed to your choice are made to order, so they cannot be returned within 14 days without a reason (§ 1837(d) of the Czech Civil Code). A ready-made blend from our range can be returned if the pouch is unopened. You can file a complaint about either.',
    btn_complete_order:'Order and pay',
    order_payment_fee: 'Cash on delivery fee',
    footer_contact:    'Contact',
    footer_ico:        'Company ID',
    footer_vat:        'We are not VAT registered.',
    footer_withdrawal: 'Withdrawal from contract',
    food_title:        'Ingredients and food information',
    food_name:         'Name',
    food_caffeine:     'Contains caffeine',
    food_ingredients:  'Ingredients',
    food_allergens:    'Allergens',
    food_no_allergens: 'none of the 14 main allergens',
    food_weight:       'Net weight',
    food_weight_pick:  'depends on the size you pick',
    food_durability:   'Best before',
    food_durability_val: 'at least {n} months from blending; exact date and batch are on the pouch',
    food_storage:      'Storage',
    food_storage_val:  'dry and dark at room temperature, away from strong smells; reseal after opening',
    food_prep:         'Brewing',
    food_prep_per:     'per',
    food_maker:        'Made by',
    wd_button:         'Withdraw from contract',
    wd_err_num:        'The order number looks like TY-00012.',
    wd_err_many:       'We have already received several withdrawals from you today. Please e-mail us.',
    wd_err_failed:     'The withdrawal could not be sent. Try again or e-mail us.',
    wd_done_title:     'Withdrawal received',
    wd_done_when:      'Received',
    wd_done_order:     'Order',
    wd_done_who:       'From',
    wd_done_items:     'Goods',
    wd_done_next:      'We will also confirm it by e-mail. Send the goods within 14 days to {address}. We refund within 14 days from today, once the goods arrive or you show you have sent them.',
    wd_done_print:     'Print confirmation',
    wd_offline_title:  'Please send it by e-mail',
    wd_offline_text:   'The online withdrawal cannot be saved right now. Click below, the e-mail is ready to send.',
    wd_offline_send:   'Send e-mail',
    craft_privacy_link:'How we handle your e-mail',
    err_payment:       'Choose how you want to pay.',
    address_not_needed:'For a Zásilkovna pickup point we do not need your address, just pick the country.',
    skip_to_content:   'Skip to content',
    footer_credits:    'Font and icon licences',
    success_title:     'Thanks, we have your order',
    success_desc:      'We will blend it and usually ship within 24 hours. You can find the summary in My orders.',
    success_step1:     'Order received',
    success_step2:     'We blend it',
    success_step3:     'Shipped',
    btn_create_another:'Mix another blend',
    about_cta:         'Want to mix one?',
    btn_start_creating2:'Mix a blend',
    ing_page_title:    'Ingredients',
    ing_page_sub:      'Everything here goes into the mixer, with how it tastes and what it pairs with.',
    ing_pairs:         'Pairs with:',
    ing_use:           'Mix with this',
    process_cta_title: 'Want to mix one?',
    btn_start_creating:'Mix a blend',
    quiz_step_of:      'Question {n} of {total}',
    quiz_result_intro: 'Based on your answers, you will like',
    quiz_why:          'We picked it because you are after',
    quiz_also:         'You might also like',
    btn_order_blend:   'I want this one',
    btn_try_again:     'Take the quiz again',
    toast_saved:       'is in your saved blends',
    nav_blends:        'Saved blends',
    nav_quiz:          'Quiz',
});

/* ─── Sáček ─────────────────────────────────── */
/* Kraftový sáček se zipem — tak, jak se čaj opravdu posílá. Na etiketě je
   jméno směsi a její tři ingredience. Obrys a textura jsou v <svg><defs>
   na začátku index.html, tady se na ně jen odkazuje. */
const POUCH_PATH = 'M14 6H186Q192 6 192 12V20L186 26L192 32Q196 140 196 238Q196 262 172 264Q100 270 28 264Q4 262 4 238Q4 140 8 32L14 26L8 20V12Q8 6 14 6Z';
const POUCH_SVG = `<svg class="pouch-bag" viewBox="0 0 200 270" preserveAspectRatio="none" focusable="false" aria-hidden="true">
    <path d="${POUCH_PATH}" fill="url(#kraft-fill)"/>
    <g clip-path="url(#pouch-clip)">
        <rect width="200" height="270" filter="url(#kraft-grain)" opacity=".35"/>
        <rect y="6" width="200" height="29" fill="url(#kraft-crimp)"/>
        <rect y="34" width="200" height="1.5" fill="#000" fill-opacity=".12"/>
        <rect y="44" width="200" height="3" fill="#000" fill-opacity=".2"/>
        <rect y="47" width="200" height="1.5" fill="#fff" fill-opacity=".3"/>
        <path d="M44 62C40 120 42 180 38 236" stroke="#fff" stroke-opacity=".18" stroke-width="7" fill="none" stroke-linecap="round"/>
        <path d="M160 70C164 130 160 190 163 232" stroke="#000" stroke-opacity=".06" stroke-width="9" fill="none" stroke-linecap="round"/>
        <path d="M4 240Q100 254 196 240" stroke="#000" stroke-opacity=".14" stroke-width="2" fill="none"/>
        <rect width="200" height="270" fill="url(#kraft-edge)"/>
    </g>
</svg>`;
const LAYER_LABELS = ['glass_label_base', 'glass_label_flavor', 'glass_label_extras'];

/* Sáček s etiketou: jméno, suroviny s podílem (od největšího) a gramáž. */
function pouchHtml({ name = '', codes = [], parts = null, size = '', placeholders = false, weight = '' } = {}) {
    const comp = blendComposition(codes, parts);
    const real = Recipe.normalize(codes, parts).codes;
    const li = (code, pct) => `<li>${ingIconHtml(code, 'pouch-ico')}`
        + `<span class="pouch-ing">${escHtml(tIng(code))}</span>${pct !== undefined ? `<b>${pct} %</b>` : ''}</li>`;
    let rows;
    if (comp.length) rows = comp.map(c => li(c.code, c.pct)).join('');
    else if (real.length) rows = real.map(c => li(c)).join('');
    else rows = placeholders ? LAYER_LABELS.map(k => `<li class="is-empty"><i></i>${escHtml(t(k))}</li>`).join('') : '';
    const dotCodes = comp.length ? comp.map(c => c.code) : real;
    const dots = dotCodes.map(c => `<i style="--c:${escHtml(ingColor(c) || '#cccccc')}"></i>`).join('');
    return `<div class="pouch ${size}">${POUCH_SVG}<div class="pouch-label${dotCodes.length > 3 ? ' is-long' : ''}">`
        + `<span class="pouch-brand">Tease you</span>`
        + `<span class="pouch-name${name ? '' : ' is-empty'}">${escHtml(name || t('glass_name_default'))}</span>`
        + `<ul class="pouch-ings${dotCodes.length > 3 ? ' is-long' : ''}">${rows}</ul>`
        + `<span class="pouch-dots">${dots}</span>`
        + (weight ? `<span class="pouch-weight">${escHtml(weight)}</span>` : '')
        + `</div></div>`;
}

function mixNameIdeas() {
    return {
        cs: ['Ranní okno', 'Pomalé úterý', 'Tichý večer', 'Hluboká zima', 'Pozdní světlo', 'Volný vzduch',
             'Neděle v posteli', 'Druhý dech', 'Teplý kout', 'Krátká pauza', 'Dlouhá noc', 'Lehká hlava'],
        sk: ['Ranné okno', 'Pomalý utorok', 'Tichý večer', 'Hlboká zima', 'Neskoré svetlo', 'Voľný vzduch',
             'Nedeľa v posteli', 'Druhý dych', 'Teplý kút', 'Krátka pauza', 'Dlhá noc', 'Ľahká hlava'],
        en: ['Morning Window', 'Slow Tuesday', 'Still Evening', 'Deep Winter', 'Late Light', 'Open Air',
             'Sunday in Bed', 'Second Wind', 'Warm Corner', 'Short Break', 'Long Night', 'Light Head'],
    }[LANG];
}
function sortedWeights() {
    return Object.keys(PRICES).map(Number).filter(w => PRICES[w] > 0).sort((a, b) => a - b);
}
function minPriceTier() {
    const w = sortedWeights();
    return w.length ? { weight: w[0], price: PRICES[w[0]] } : null;
}
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ─── Úvodní stránka ────────────────────────── */
let heroBlendId = null;

function renderHero(id, animate) {
    const box = document.getElementById('hero-pouch');
    if (!box || !catalogBlends.length) return;
    const b = catalogBlends.find(x => x.id === id) || catalogBlends[0];
    heroBlendId = b.id;
    const weights = sortedWeights();
    const weight = weights.includes(100) ? '100 g' : (weights[0] ? weights[0] + ' g' : '');
    box.innerHTML = pouchHtml({ name: b.name, codes: b.ingredients, parts: b.parts, size: 'pouch--hero', weight });
    if (animate && !reduceMotion()) {
        box.classList.remove('is-swapping');
        void box.offsetWidth;
        box.classList.add('is-swapping');
    }
    const mix = document.getElementById('hero-mix');
    if (mix) mix.textContent = blendSubtitle(b.ingredients);
}
function shuffleHero() {
    const others = catalogBlends.filter(b => b.id !== heroBlendId);
    if (others.length) renderHero(others[Math.floor(Math.random() * others.length)].id, true);
}
function renderHeroNote() {
    const el = document.getElementById('hero-note');
    if (!el) return;
    const tier = minPriceTier();
    const parts = [];
    if (tier) parts.push(t('hero_note_price').replace('{price}', fmt(tier.price)));
    if (FREE_SHIP_THRESHOLD > 0) parts.push(t('hero_note_ship').replace('{limit}', fmt(FREE_SHIP_THRESHOLD)));
    el.textContent = parts.join(' ');
}
/* Jak to funguje: základ + příchuť + doplněk = sáček s tvým jménem */
function renderHow() {
    const lede = document.getElementById('how-lede');
    if (lede) {
        const n = { bases: ING_DATA.bases.length, flavors: ING_DATA.flavors.length, extras: ING_DATA.extras.length };
        lede.textContent = t('pantry_lede').replace('{bases}', n.bases).replace('{flavors}', n.flavors)
            .replace('{extras}', n.extras).replace('{max}', Recipe.MAX_ITEMS);
    }
    const list = document.getElementById('how-formula');
    if (!list) return;
    const codes = ['Green Tea', 'Strawberry', 'Lemon'].filter(c => ingByCode(c));
    const parts = codes.map(c => defaultParts(ingByCode(c)));
    // Role podle skupiny suroviny (základ / příchuť / doplněk), ne podle pořadí.
    const roleOf = c => t(LAYER_LABELS[(MIX_STEP_OF[(ingByCode(c) || {}).category] || 1) - 1]);
    const roles = codes.map(c => roleOf(c).toLocaleLowerCase(LOCALE));
    list.innerHTML = codes.map((c, i) =>
        `<li class="formula-item">${i ? '<span class="formula-op" aria-hidden="true">+</span>' : ''}`
        + ingIconHtml(c, 'ing-ico--lg')
        + `<span class="formula-text"><strong>${escHtml(tIng(c))}</strong><span>${escHtml(roles[i] + ', ' + partsLabel(parts[i]))}</span></span></li>`
    ).join('')
        + `<li class="formula-item formula-result"><span class="formula-op" aria-hidden="true">=</span>`
        + `<span class="formula-pouch">${pouchHtml({ name: t('how_pouch_name'), codes, parts, size: 'pouch--xs' })}</span>`
        + `<span class="formula-text"><strong>${escHtml(t('how_pouch_name'))}</strong><span>${escHtml(t('how_result_note'))}</span></span></li>`;
}
function goToShelf() {
    const onHome = document.getElementById('home-page')?.classList.contains('active');
    if (!onHome) showPage('home-page');
    setTimeout(() => document.getElementById('shelf')?.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' }), onHome ? 0 : 60);
}

/* ─── Mixér: jedna otázka na obrazovku ──────── */
/* Krok 1 základ (povinný), 2 příchuť a 3 doplněk (obojí nepovinné, dá se
   vybrat víc věcí nebo nic), 4 jméno a velikost. V každém kroku jde vybrat
   víc surovin, dohromady nejvýš 5. Poměr se nastavuje díly v panelu
   „Tvoje směs“, kde jsou hned vidět procenta a gramy. */
let mixItems = [];   // [{ code, parts }] seřazené podle skupiny, pak podle výběru
let mixerStep = 1;
let mixerWeight = 0;

const MIX_CATEGORY_RANK = { base: 0, flavor: 1, extra: 2 };
function sortMixItems() {
    const rank = x => MIX_CATEGORY_RANK[(ingByCode(x.code) || {}).category] ?? 3;
    mixItems = mixItems.map((x, i) => [x, i]).sort((a, b) => (rank(a[0]) - rank(b[0])) || (a[1] - b[1])).map(x => x[0]);
}
function mixCodes() { return mixItems.map(x => x.code); }
function mixParts() { return mixItems.map(x => x.parts); }
function mixRecipe(weight) { return recipeOf(mixCodes(), mixParts(), weight || mixerWeight || 100); }
function partsLabel(n) { return n === 1 ? t('mix_part_1') : t('mix_parts_n').replace('{n}', n); }

/* Nastaví směs v mixéru (z hotové směsi, uloženého mixu, odkazu…). */
function setMixItems(codes, parts) {
    const n = Recipe.normalize(codes, parts);
    mixItems = n.codes.map((code, i) => ({ code, parts: n.parts[i] }))
        .filter(x => { const ing = ingByCode(x.code); return ing && ing.inStock !== false; })
        .slice(0, Recipe.MAX_ITEMS);
    sortMixItems();
    syncIngredientButtons();
}

function syncIngredientButtons() {
    document.querySelectorAll('#product-page .ingredient-btn').forEach(btn => {
        const on = mixItems.some(x => x.code === btn.dataset.name);
        btn.classList.toggle('selected', on);
        btn.setAttribute('aria-pressed', String(on));
    });
}

function toggleMixItem(code, opts = {}) {
    const at = mixItems.findIndex(x => x.code === code);
    if (at >= 0) {
        mixItems.splice(at, 1);
        if (!opts.quiet) announceMix(t('mix_removed').replace('{name}', tIng(code)));
    } else {
        const ing = ingByCode(code);
        if (!ing || ing.inStock === false) return;
        if (mixItems.length >= Recipe.MAX_ITEMS) { showToast(t('mix_full'), '✋'); return; }
        if (isPinchIng(ing) && mixItems.filter(x => isPinchIng(ingByCode(x.code))).length >= Recipe.MAX_PINCH) {
            showToast(t('mix_pinch_full'), '✋'); return;
        }
        mixItems.push({ code, parts: defaultParts(ing) });
        sortMixItems();
        if (!opts.quiet) announceMix(t('mix_added').replace('{name}', tIng(code)));
    }
    syncIngredientButtons();
    updateMixerUI();
}

function changeMixPart(code, delta) {
    const i = mixItems.findIndex(x => x.code === code);
    if (i < 0) return;
    if (!Recipe.partChangeAllowed(mixCodes(), mixParts(), i, delta, recipeInfo)) return;
    mixItems[i].parts += delta;
    updateMixerUI();
    // Fokus zůstane na stejném tlačítku i po překreslení panelu.
    document.querySelector(`#mix-rows [data-part-step="${delta}"][data-code="${CSS.escape(code)}"]`)?.focus();
}

/* Krátké oznámení pro čtečky obrazovky (přidáno/odebráno). */
function announceMix(text) {
    const el = document.getElementById('mix-live');
    if (el) { el.textContent = ''; setTimeout(() => { el.textContent = text; }, 30); }
}

function hasBase() { return mixItems.some(x => (ingByCode(x.code) || {}).category === 'base'); }
function stepHasPick(n) {
    const group = MIX_GROUP_OF_STEP[n];
    return !!group && mixItems.some(x => ING_DATA[group].some(i => i.code === x.code));
}
function mixerStepDone(n) { return n === 1 ? hasBase() : true; }
function firstOpenMixerStep() { return hasBase() ? 4 : 1; }
function mixerComplete() { return hasBase() && mixRecipe().ok; }

/* currentProduct sdílí mixér i detail hotové směsi, takže se ze stavu
   mixéru pokaždé znovu sestaví — jinak by do košíku šla jiná směs. */
function mixerSyncProduct() {
    currentProduct.ingredients = mixCodes();
    currentProduct.parts = mixParts();
    currentProduct.colors = currentProduct.ingredients.map(c => ingColor(c) || 'transparent');
    currentProduct.name = document.getElementById('mix-name')?.value.trim() || t('default_mix_name');
    if (mixerWeight && PRICES[mixerWeight]) {
        currentProduct.weight = mixerWeight + 'g';
        currentProduct.priceBase = unitPrice(currentProduct.ingredients, currentProduct.parts, mixerWeight);
    }
}

function defaultMixerWeight() {
    const w = sortedWeights();
    return w.includes(100) ? 100 : (w[Math.floor(w.length / 2)] || 0);
}

function setMixerStep(n, opts = {}) {
    const page = document.getElementById('product-page');
    if (!page) return;
    mixerStep = Math.min(4, Math.max(1, n));
    page.dataset.step = String(mixerStep);
    if (!PRICES[mixerWeight]) mixerWeight = defaultMixerWeight();
    if (opts.scroll !== false && page.classList.contains('active')) {
        const top = page.getBoundingClientRect().top + window.scrollY;
        if (window.scrollY > top) window.scrollTo({ top, behavior: reduceMotion() ? 'auto' : 'smooth' });
    }
    updateMixerUI();
    if (opts.focus) page.querySelector(`.selection-group[data-step="${mixerStep}"] .step-question`)?.focus?.();
}

function mixerNext() {
    if (mixerStep === 1 && !hasBase()) { showToast(t('mixer_pick_base'), '👆'); return; }
    if (mixerStep < 4) { setMixerStep(mixerStep + 1, { focus: true }); return; }
    if (!hasBase()) { setMixerStep(1); return; }
    const r = mixRecipe();
    if (!r.ok) {
        showToast([mixErrorText(r), mixFixHint()].join(' '), '⚠️');
        document.getElementById('mix-recipe')?.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'center' });
        return;
    }
    mixerSyncProduct();
    confirmOrder();
}
function mixerBack() {
    if (mixerStep === 1) { showPage('home-page'); return; }
    setMixerStep(mixerStep - 1, { focus: true });
}

function renderMixerSizes() {
    const box = document.getElementById('mixer-sizes');
    if (!box) return;
    const codes = mixCodes(), parts = mixParts();
    box.innerHTML = sortedWeights().map(w =>
        `<button type="button" class="qty-btn${w === mixerWeight ? ' selected' : ''}" data-weight="${w}" aria-pressed="${w === mixerWeight}">`
        + `${w} g<span class="qty-price">${fmt(unitPrice(codes, parts, w) || PRICES[w])}</span></button>`
    ).join('');
}

/* Panel „Tvoje směs“: každá surovina s díly, procenty a gramy pro vybranou
   velikost, pruh s poměrem a co z toho podle vyhlášky je. */
function renderMixRecipe() {
    const box = document.getElementById('mix-recipe');
    if (!box) return;
    box.hidden = !mixItems.length;
    if (!mixItems.length) return;
    const r = mixRecipe();
    const codes = mixCodes(), parts = mixParts();
    const sizes = document.getElementById('mix-recipe-sizes');
    if (sizes) sizes.innerHTML = sortedWeights().map(w =>
        `<button type="button" class="seg-btn" data-size="${w}" aria-pressed="${w === mixerWeight}">${w} g</button>`).join('');
    const count = document.getElementById('mix-recipe-count');
    if (count) count.textContent = t('mix_count').replace('{n}', mixItems.length).replace('{max}', Recipe.MAX_ITEMS);

    const byCode = Object.fromEntries(r.rows.map(row => [row.code, row]));
    const strip = document.getElementById('mix-strip');
    if (strip) strip.innerHTML = mixItems.map(x => {
        const row = byCode[x.code];
        return row ? `<span style="--c:${escHtml(ingColor(x.code) || '#ccc')};flex-grow:${row.pct}" title="${escHtml(tIng(x.code))} ${row.pct} %"></span>` : '';
    }).join('');

    const list = document.getElementById('mix-rows');
    if (list) list.innerHTML = mixItems.map((x, i) => {
        const ing = ingByCode(x.code);
        const row = byCode[x.code] || { pct: 0, grams: 0 };
        const name = tIng(x.code);
        const over = r.error === 'over_limit' && r.errorCode === x.code;
        const canLess = Recipe.partChangeAllowed(codes, parts, i, -1, recipeInfo);
        const canMore = Recipe.partChangeAllowed(codes, parts, i, +1, recipeInfo);
        const control = isPinchIng(ing)
            ? `<span class="mix-pinch">${escHtml(t('mix_pinch'))}</span>`
            : `<span class="stepper" role="group" aria-label="${escHtml(t('mix_parts_of').replace('{name}', name))}">`
              + `<button type="button" class="stepper-btn" data-part-step="-1" data-code="${escHtml(x.code)}" aria-label="${escHtml(t('mix_less').replace('{name}', name))}"${canLess ? '' : ' disabled'}>−</button>`
              + `<span class="stepper-val" aria-live="polite">${escHtml(partsLabel(x.parts))}</span>`
              + `<button type="button" class="stepper-btn" data-part-step="1" data-code="${escHtml(x.code)}" aria-label="${escHtml(t('mix_more').replace('{name}', name))}"${canMore ? '' : ' disabled'}>+</button>`
              + `</span>`;
        const notes = [fmtGrams(row.grams)];
        if (ing && ing.surcharge) notes.push(t('mix_premium_row').replace('{price}', fmt(ing.surcharge)));
        if (ing && ing.maxPct && !isPinchIng(ing)) notes.push(t('mix_max').replace('{max}', ing.maxPct));
        return `<li class="mix-row${over ? ' is-over' : ''}">`
            + ingIconHtml(x.code, 'ing-ico--sm')
            + `<strong class="mix-row-title">${escHtml(name)}</strong>`
            + `<small class="mix-row-meta">${escHtml(notes.join(' · '))}</small>`
            + control
            + `<span class="mix-row-pct">${row.pct} %</span>`
            + `<button type="button" class="mix-row-remove" data-remove="${escHtml(x.code)}" aria-label="${escHtml(t('mix_remove').replace('{name}', name))}">`
            + `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>`
            + `</li>`;
    }).join('');

    const verdict = document.getElementById('mix-verdict');
    if (verdict) {
        verdict.classList.toggle('is-error', !r.ok);
        if (r.ok) {
            const legal = legalBlendName(blendComposition(codes, parts));
            const extra = r.surcharge ? ' ' + t('mix_surcharge_note').replace('{price}', fmt(r.surcharge)) : '';
            verdict.innerHTML = `<strong>${escHtml(legal)}.</strong> `
                + escHtml(t('mix_cups').replace('{weight}', mixerWeight).replace('{cups}', Recipe.cups(mixerWeight)) + extra);
        } else {
            verdict.textContent = [mixErrorText(r), mixFixHint()].filter(Boolean).join(' ');
        }
    }
}

/* Nejmenší změna, po které směs projde. Zkouší napřed to, co zachová
   povahu směsi: přidat díl hlavní suroviny (té skupiny, které je ve směsi
   nejvíc), ubrat díl nebo odebrat něco z ostatních. Až potom cokoli jiného. */
function mixFixHint() {
    const codes = mixCodes(), parts = mixParts();
    const r = recipeOf(codes, parts, 100);
    const kindOf = i => (r.rows[i] || {}).kind;
    const share = { tea: 0, herb: 0, fruit: 0 };
    r.rows.forEach(x => { if (x.kind in share) share[x.kind] += x.pct; });
    // Cíl je druh základu (zákazník ho vybral první), jinak co je ve směsi nejvíc.
    const first = kindOf(0);
    const baseKind = codes.map((c, i) => ((ingByCode(c) || {}).category === 'base' ? kindOf(i) : null)).find(k => k in share);
    const target = baseKind || Object.keys(share).sort((x, y) => (share[y] - share[x]) || ((y === first) - (x === first)))[0];
    const adjustable = i => !isPinchIng(ingByCode(codes[i]));
    const passes = (c, p) => recipeOf(c, p, 100).ok;
    const idx = codes.map((_, i) => i);
    const back = idx.slice().reverse();
    const tries = [];
    const more = (list, d) => list.forEach(i => {
        if (!adjustable(i) || parts[i] + d > Recipe.MAX_PARTS) return;
        const p = parts.slice(); p[i] += d;
        tries.push([codes, p, t(d === 1 ? 'mix_fix_more' : 'mix_fix_more2').replace('{name}', tIng(codes[i]))]);
    });
    const less = list => list.forEach(i => {
        if (!adjustable(i) || parts[i] <= Recipe.MIN_PARTS) return;
        const p = parts.slice(); p[i] -= 1;
        tries.push([codes, p, t('mix_fix_less').replace('{name}', tIng(codes[i]))]);
    });
    const drop = list => list.forEach(i => {
        if (codes.length < 2) return;
        tries.push([codes.filter((_, j) => j !== i), parts.filter((_, j) => j !== i), t('mix_fix_remove').replace('{name}', tIng(codes[i]))]);
    });
    const main = idx.filter(i => kindOf(i) === target), rest = back.filter(i => kindOf(i) !== target);
    more(main, 1); less(rest); more(main, 2); drop(rest);
    more(idx.filter(i => kindOf(i) !== target), 1); less(back.filter(i => kindOf(i) === target)); drop(back.filter(i => kindOf(i) === target));
    const hit = tries.find(([c, p]) => passes(c, p));
    if (!hit) return t('mix_fix_none');
    // Když se tím změní druh čaje (třeba ze zeleného na ovocný), řekneme to.
    const after = recipeOf(hit[0], hit[1], 100).category;
    return after !== target ? `${hit[2]} ${t('mix_fix_becomes').replace('{kind}', t('mix_kind_' + after))}` : hit[2];
}

function updateMixerUI() {
    const page = document.getElementById('product-page');
    if (!page) return;
    if (!PRICES[mixerWeight]) mixerWeight = defaultMixerWeight();
    mixerSyncProduct();
    const codes = mixCodes(), parts = mixParts();
    const name = document.getElementById('mix-name')?.value.trim() || '';
    const r = mixRecipe();

    const progressText = document.getElementById('mixer-progress-text');
    if (progressText) progressText.textContent = t('mixer_step_of').replace('{n}', mixerStep);
    const fill = document.getElementById('mixer-progress-fill');
    if (fill) fill.style.width = (mixerStep / 4 * 100) + '%';

    // Doporučení podle všeho, co už ve směsi je
    const pairs = new Set(mixItems.flatMap(x => (ingByCode(x.code) || {}).pairs || []));
    page.querySelectorAll('.btn-grid .ingredient-btn').forEach(btn => {
        const paired = pairs.has(btn.dataset.name) && !btn.classList.contains('is-out') && !btn.classList.contains('selected');
        btn.classList.toggle('is-paired', paired);
        let tag = btn.querySelector('.ing-tag--pair');
        if (paired && !tag) {
            tag = document.createElement('span');
            tag.className = 'ing-tag ing-tag--pair';
            tag.textContent = t('pairs_tag');
            btn.querySelector('.ing-name')?.appendChild(tag);
        } else if (!paired && tag) {
            tag.remove();
        }
    });

    const weightLabel = mixerWeight ? mixerWeight + ' g' : '';
    const pouch = pouchHtml({ name, codes, parts, size: 'pouch--mixer', placeholders: true, weight: weightLabel });
    const aside = document.getElementById('mixer-pouch');
    if (aside) aside.innerHTML = pouch;
    const final = document.getElementById('mixer-pouch-final');
    if (final && mixerStep === 4) final.innerHTML = pouch.replace('pouch--mixer', 'pouch--final');

    renderMixRecipe();
    renderMixerSizes();
    if (mixerStep === 4) renderFoodInfo(document.getElementById('mixer-food'), codes, parts, mixerWeight);

    const price = unitPrice(codes, parts, mixerWeight);
    const summary = document.getElementById('mixer-bar-summary');
    const next = document.getElementById('mixer-next');
    // Na mobilu je panel se směsí pod seznamem: klik na shrnutí v liště k němu sjede.
    if (summary) summary.innerHTML = codes.length
        ? `<button type="button" class="bar-summary-btn" data-show-recipe aria-label="${escHtml(t('bar_show_recipe'))}">`
          + (mixerStep === 4 ? '' : `<span class="bar-dots">${codes.map(c => `<i style="--c:${escHtml(ingColor(c) || '#ccc')}"></i>`).join('')}</span>`)
          + (mixerStep === 4
              ? `<span class="bar-price">${fmt(price)}</span><span class="bar-text">${mixerWeight} g</span>`
              : `<span class="bar-text">${escHtml(t('bar_price').replace('{price}', fmt(price)).replace('{weight}', mixerWeight))}</span>`)
          + `</button>`
        : `<span class="bar-text is-muted">${escHtml(t('bar_empty'))}</span>`;
    if (next) {
        let label, ready;
        if (mixerStep === 1) { label = t('mixer_next'); ready = hasBase(); }
        else if (mixerStep < 4) { label = stepHasPick(mixerStep) ? t('mixer_next') : t('mixer_skip'); ready = true; }
        else { label = t('mixer_add'); ready = hasBase() && r.ok && !!PRICES[mixerWeight]; }
        next.textContent = label;
        next.classList.toggle('is-skip', mixerStep > 1 && mixerStep < 4 && !stepHasPick(mixerStep));
        next.classList.toggle('is-waiting', !ready);
        next.setAttribute('aria-disabled', String(!ready));
    }

    const note = document.getElementById('mixer-price');
    if (note) note.textContent = codes.length && price
        ? t('mixer_price_now').replace('{price}', fmt(price)).replace('{weight}', mixerWeight)
        : (minPriceTier() ? t('mixer_price').replace('{price}', fmt(minPriceTier().price)).replace('{weight}', minPriceTier().weight) : '');
}

/* ─── Start ─────────────────────────────────── */
function refreshRedesign() {
    renderHero(heroBlendId, false);
    renderHeroNote();
    renderHow();
    updateMixerUI();
}

function initRedesign() {
    renderHero(null, false);
    renderHeroNote();
    renderHow();
    renderPriceOptions();
    document.getElementById('hero-shuffle')?.addEventListener('click', shuffleHero);
    document.getElementById('hero-open')?.addEventListener('click', () => openBlend(heroBlendId));
    document.getElementById('mixer-next')?.addEventListener('click', mixerNext);
    document.getElementById('mixer-back')?.addEventListener('click', mixerBack);
    document.getElementById('mixer-sizes')?.addEventListener('click', e => {
        const btn = e.target.closest('[data-weight]');
        if (!btn) return;
        mixerWeight = Number(btn.dataset.weight);
        updateMixerUI();
    });
    document.getElementById('mixer-bar-summary')?.addEventListener('click', e => {
        if (!e.target.closest('[data-show-recipe]')) return;
        const panel = document.getElementById('mix-recipe');
        if (!panel || panel.hidden) return;
        panel.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'center' });
        panel.querySelector('.mix-recipe-title')?.focus({ preventScroll: true });
    });
    document.getElementById('mix-recipe')?.addEventListener('click', e => {
        const step = e.target.closest('[data-part-step]');
        if (step && !step.disabled) { changeMixPart(step.dataset.code, Number(step.dataset.partStep)); return; }
        const rm = e.target.closest('[data-remove]');
        if (rm) {
            const code = rm.dataset.remove;
            const idx = mixItems.findIndex(x => x.code === code);
            toggleMixItem(code);
            // Fokus na další řádek, nebo zpátky na seznam surovin.
            const rows = document.querySelectorAll('#mix-rows .mix-row-remove');
            (rows[Math.min(idx, rows.length - 1)] || document.querySelector('#product-page .selection-group[data-step="' + mixerStep + '"] .step-question'))?.focus?.();
            return;
        }
        const size = e.target.closest('[data-size]');
        if (size) {
            mixerWeight = Number(size.dataset.size);
            updateMixerUI();
            document.querySelector(`#mix-recipe-sizes [data-size="${mixerWeight}"]`)?.focus();
        }
    });
    document.getElementById('name-suggest')?.addEventListener('click', () => {
        const input = document.getElementById('mix-name');
        const ideas = mixNameIdeas().filter(n => n !== input.value);
        input.value = ideas[Math.floor(Math.random() * ideas.length)];
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    document.getElementById('mix-name')?.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); }
    });
    document.getElementById('mixer-save')?.addEventListener('click', () => { mixerSyncProduct(); saveBlend(); });
    document.getElementById('ingredients-page')?.addEventListener('click', e => {
        const btn = e.target.closest('[data-mix]');
        if (btn) mixWith(btn.dataset.mix);
    });
    document.getElementById('mixer-share')?.addEventListener('click', () => { mixerSyncProduct(); shareBlend(); });
    const copy = document.getElementById('footer-copy');
    if (copy) copy.textContent = `© ${new Date().getFullYear()} Tease you`;
    document.body.dataset.page = document.querySelector('.page.active')?.id || 'home-page';
    setMixerStep(firstOpenMixerStep(), { scroll: false });
}

/* ─── Mýdla a balzámy ───────────────────────── */
/* Ze stejných surovin jako čaj. Zatím se neprodávají: web je ukazuje
   a u každého se dá nechat e-mail, až bude k mání. */
Object.assign(TRANSLATIONS.cs, {
    nav_craft:          'Mýdla a balzámy',
    nav_craft_short:    'Mýdla',
    craft_home_title:   'Ze stejných bylinek i mýdla',
    craft_home_lede:    'Levanduli, heřmánek nebo zelený čaj nedáváme jen do čaje. Ručně z nich vyrábíme mýdla a balzámy na rty, v malých várkách.',
    craft_home_btn:     'Prohlédnout mýdla a balzámy',
    craft_title:        'Mýdla a balzámy',
    craft_lede:         'Ze stejných bylinek, čajů a koření, ze kterých mícháme čaj. Vyrábíme je ručně v malých várkách.',
    craft_soon_note:    'Zatím je připravujeme. Nech nám e-mail u toho, co tě láká, a dáme ti vědět, až bude.',
    craft_soaps:        'Mýdla',
    craft_balms:        'Balzámy na rty',
    craft_empty:        'Teď tu nic není. Brzy přidáme.',
    craft_kind_soap:    'Mýdlo',
    craft_kind_balm:    'Balzám na rty',
    craft_soon:         'Připravujeme',
    craft_like_tea:     'Jako v čaji:',
    craft_notify:       'Dej mi vědět, až bude',
    craft_send:         'Poslat',
    craft_form_note:    'Napíšeme ti jednou, až bude k mání. Nic jiného.',
    craft_done:         'Hotovo, dáme ti vědět.',
    craft_err_email:    'Zadej platný e-mail.',
    craft_err_many:     'Z tohohle e-mailu už je zájemců dost. Zkus to zítra.',
    craft_err_other:    'Teď se to nepovedlo uložit. Napiš nám na hello@teaseyou.cz.',
    craft_mail_subject: 'Chci vědět, až bude',
    craft_also_in:      'Najdeš i v:',
    craft_same_title:   'Ze stejných surovin',
});
Object.assign(TRANSLATIONS.en, {
    nav_craft:          'Soaps & balms',
    nav_craft_short:    'Soaps',
    craft_home_title:   'The same herbs, now in soap',
    craft_home_lede:    'Lavender, chamomile and green tea do not only go into tea. We make soaps and lip balms from them by hand, in small batches.',
    craft_home_btn:     'See soaps and balms',
    craft_title:        'Soaps & balms',
    craft_lede:         'Made from the same herbs, teas and spices we blend our tea from. Made by hand in small batches.',
    craft_soon_note:    'They are not ready yet. Leave your e-mail by the one you like and we will let you know.',
    craft_soaps:        'Soaps',
    craft_balms:        'Lip balms',
    craft_empty:        'Nothing here right now. More soon.',
    craft_kind_soap:    'Soap',
    craft_kind_balm:    'Lip balm',
    craft_soon:         'Coming soon',
    craft_like_tea:     'Same as in tea:',
    craft_notify:       'Let me know when it is ready',
    craft_send:         'Send',
    craft_form_note:    'We will write once, when it is available. Nothing else.',
    craft_done:         'Done, we will let you know.',
    craft_err_email:    'Enter a valid e-mail.',
    craft_err_many:     'Too many sign-ups from this e-mail. Try again tomorrow.',
    craft_err_other:    'We could not save it right now. Write to hello@teaseyou.cz.',
    craft_mail_subject: 'Let me know when it is ready',
    craft_also_in:      'Also in:',
    craft_same_title:   'Made from the same',
});

const CRAFT_NOTIFIED_KEY = 'teaseyou_notified';
const CRAFT_EMAIL_KEY = 'teaseyou_notify_email';

function craftName(p) { return pickLang(p, 'name'); }
function craftDesc(p) { return pickLang(p, 'desc'); }
function craftUsing(code) { return code ? catalogCraft.filter(p => (p.ingredients || []).includes(code)) : []; }
function craftNotified() { const v = readStore(CRAFT_NOTIFIED_KEY, []); return Array.isArray(v) ? v : []; }

/* Mýdlo: kostka v barvě hlavní suroviny s kraftovou páskou a etiketou.
   Balzám: plechovka shora s kraftovou nálepkou. */
const SOAP_SVG = `<svg viewBox="0 0 200 150" preserveAspectRatio="none" focusable="false" aria-hidden="true">
    <rect x="2" y="2" width="196" height="146" rx="34" class="soap-body"/>
    <rect x="2" y="2" width="196" height="146" rx="34" fill="url(#soap-speck)"/>
    <rect x="2" y="2" width="196" height="146" rx="34" fill="url(#soap-shade)"/>
    <g clip-path="url(#soap-clip)">
        <rect x="0" y="46" width="200" height="58" fill="url(#kraft-fill)"/>
        <rect x="0" y="46" width="200" height="58" filter="url(#kraft-grain)" opacity=".35"/>
        <rect x="0" y="46" width="200" height="1.5" fill="#000" fill-opacity=".14"/>
        <rect x="0" y="102.5" width="200" height="1.5" fill="#000" fill-opacity=".14"/>
    </g>
</svg>`;
const TIN_SVG = `<svg viewBox="0 0 140 140" focusable="false" aria-hidden="true">
    <circle cx="70" cy="70" r="68" fill="url(#tin-metal)"/>
    <circle cx="70" cy="70" r="61" fill="none" stroke="#000" stroke-opacity=".16" stroke-width="2"/>
    <circle cx="70" cy="70" r="54" fill="url(#kraft-fill)"/>
    <rect width="140" height="140" filter="url(#kraft-grain)" opacity=".3" clip-path="url(#tin-clip)"/>
    <path d="M28 46A50 50 0 0 1 64 21" stroke="#fff" stroke-opacity=".55" stroke-width="3" fill="none" stroke-linecap="round"/>
</svg>`;

function craftVisualHtml(p, size) {
    const photo = safePhoto(p.photo_url);
    if (photo) return `<img class="craft-photo" src="${escHtml(photo)}" alt="" loading="lazy" decoding="async">`;
    const dots = (p.ingredients || []).map(c => `<i style="--c:${escHtml(ingColor(c) || '#ccc')}"></i>`).join('');
    const cls = p.kind === 'balm' ? 'craft-tin' : 'craft-soap';
    return `<div class="${cls} ${size || ''}" style="--c:${escHtml(p.color)}">${p.kind === 'balm' ? TIN_SVG : SOAP_SVG}`
        + `<div class="craft-label"><span class="craft-brand">Tease you</span><span class="craft-label-name">${escHtml(craftName(p))}</span>`
        + `<span class="craft-dots">${dots}</span></div></div>`;
}

function craftIngsHtml(codes) {
    return (codes || []).filter(c => ingByCode(c)).map(c =>
        `<li>${ingIconHtml(c, 'ing-ico--xs')}${escHtml(tIng(c))}</li>`).join('');
}

function craftCardHtml(p, done) {
    const id = escHtml(p.id);
    return `<article class="craft-card" id="craft-${id}" data-id="${id}">
        <div class="craft-visual" style="--tint:${escHtml(p.color)}">
            <span class="craft-badge">${escHtml(t('craft_soon'))}</span>
            ${craftVisualHtml(p)}
        </div>
        <h3 class="craft-name">${escHtml(craftName(p))}</h3>
        <p class="craft-desc">${escHtml(craftDesc(p))}</p>
        ${(p.ingredients || []).length ? `<div class="craft-ings"><span>${escHtml(t('craft_like_tea'))}</span><ul>${craftIngsHtml(p.ingredients)}</ul></div>` : ''}
        <div class="craft-notify">
            <button type="button" class="btn btn-quiet craft-notify-btn" aria-expanded="false" aria-controls="craft-form-${id}"${done ? ' hidden' : ''}>${escHtml(t('craft_notify'))}</button>
            <form class="craft-form" id="craft-form-${id}" novalidate hidden>
                <label class="visually-hidden" for="craft-email-${id}">E-mail</label>
                <div class="craft-form-row">
                    <input type="email" id="craft-email-${id}" class="field" placeholder="tvuj@email.cz" autocomplete="email" inputmode="email" required>
                    <button type="submit" class="btn btn-primary">${escHtml(t('craft_send'))}</button>
                </div>
                <p class="field-error" role="alert"></p>
                <p class="craft-form-note">${escHtml(t('craft_form_note'))} <a href="#" onclick="event.preventDefault(); showPage('privacy-page')">${escHtml(t('craft_privacy_link'))}</a></p>
            </form>
            <p class="craft-done"${done ? '' : ' hidden'}>${escHtml(t('craft_done'))}</p>
        </div>
    </article>`;
}

function renderCraft() {
    const done = new Set(craftNotified());
    const soaps = catalogCraft.filter(p => p.kind === 'soap');
    const balms = catalogCraft.filter(p => p.kind === 'balm');
    [['soap', soaps], ['balm', balms]].forEach(([kind, list]) => {
        const grid = document.getElementById('craft-grid-' + kind);
        if (!grid) return;
        grid.innerHTML = list.map(p => craftCardHtml(p, done.has(p.id))).join('');
        grid.closest('.craft-section').hidden = !list.length;
    });
    const empty = document.getElementById('craft-empty');
    if (empty) empty.hidden = catalogCraft.length > 0;

    // Úvodní stránka: dvě mýdla a jeden balzám, jako na fotce shora.
    const home = document.getElementById('craft-home');
    const lay = document.getElementById('craft-home-items');
    if (home) home.hidden = !catalogCraft.length;
    if (lay) {
        const pick = [...soaps.slice(0, 2), ...balms.slice(0, 1)];
        while (pick.length < 3 && catalogCraft[pick.length]) pick.push(catalogCraft[pick.length]);
        lay.innerHTML = pick.map((p, i) => `<div class="flatlay-item flatlay-${i + 1}">${craftVisualHtml(p)}</div>`).join('');
    }
    // Ingredience mají odkaz „Najdeš i v“, takže se překreslí taky.
    if (document.getElementById('ingredients-page')?.classList.contains('active')) renderIngredientEncyclopedia();
}

function renderDetailCraft(ingredients) {
    const box = document.getElementById('detail-craft');
    const list = document.getElementById('detail-craft-list');
    if (!box || !list) return;
    const codes = new Set((ingredients || []).filter(c => c && c !== 'Empty'));
    const matches = catalogCraft.filter(p => (p.ingredients || []).some(c => codes.has(c))).slice(0, 2);
    box.hidden = !matches.length;
    list.innerHTML = matches.map(p => {
        const shared = p.ingredients.filter(c => codes.has(c));
        return `<button type="button" class="detail-craft-item" data-craft="${escHtml(p.id)}">
            <span class="detail-craft-visual" aria-hidden="true">${craftVisualHtml(p, 'craft--xs')}</span>
            <span class="detail-craft-text"><strong>${escHtml(craftName(p))}</strong>
            <span>${escHtml(t(p.kind === 'balm' ? 'craft_kind_balm' : 'craft_kind_soap'))}, ${escHtml(shared.map(c => tIng(c).toLocaleLowerCase(LOCALE)).join(', '))}</span></span>
        </button>`;
    }).join('');
}

function openCraft(id) {
    showPage('craft-page');
    const card = id && document.getElementById('craft-' + id);
    if (!card) return;
    setTimeout(() => {
        card.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'center' });
        card.classList.add('is-flash');
        setTimeout(() => card.classList.remove('is-flash'), 1400);
    }, 80);
}

async function joinCraftWaitlist(form) {
    const card = form.closest('.craft-card');
    const id = card?.dataset.id;
    const input = form.querySelector('input[type="email"]');
    const err = form.querySelector('.field-error');
    const btn = form.querySelector('button[type="submit"]');
    const email = (input.value || '').trim();
    const showErr = msg => { err.textContent = msg; input.classList.toggle('input-error', !!msg); input.setAttribute('aria-invalid', msg ? 'true' : 'false'); };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showErr(t('craft_err_email')); input.focus(); return; }
    showErr('');
    const finish = () => {
        try { localStorage.setItem(CRAFT_EMAIL_KEY, JSON.stringify(email)); } catch (_) {}
        const list = craftNotified();
        if (!list.includes(id)) list.push(id);
        try { localStorage.setItem(CRAFT_NOTIFIED_KEY, JSON.stringify(list)); } catch (_) {}
        form.hidden = true;
        card.querySelector('.craft-done').hidden = false;
    };
    // Bez databáze aspoň předvyplněný e-mail, ať zájem nepropadne.
    const viaMail = () => {
        const p = catalogCraft.find(x => x.id === id);
        location.href = `mailto:hello@teaseyou.cz?subject=${encodeURIComponent(t('craft_mail_subject') + ': ' + (p ? craftName(p) : id))}&body=${encodeURIComponent(email)}`;
    };
    if (!window.TeaDB || !TeaDB.configured) { viaMail(); finish(); return; }
    btn.disabled = true;
    try {
        await TeaDB.rpc('join_craft_waitlist', { p_product: id, p_email: email, p_lang: LANG });
        finish();
    } catch (e) {
        const code = e && e.message;
        console.warn('[teaseyou] Zájem o produkt se nepodařilo uložit:', e);
        if (code === 'invalid_email') showErr(t('craft_err_email'));
        else if (code === 'too_many') showErr(t('craft_err_many'));
        else showErr(t('craft_err_other'));
    } finally {
        btn.disabled = false;
    }
}

function initCraft() {
    renderCraft();
    document.addEventListener('click', e => {
        const go = e.target.closest('[data-craft]');
        if (go) { e.preventDefault(); openCraft(go.dataset.craft); return; }
        const open = e.target.closest('.craft-notify-btn');
        if (open) {
            const form = open.parentElement.querySelector('.craft-form');
            open.hidden = true;
            open.setAttribute('aria-expanded', 'true');
            form.hidden = false;
            const input = form.querySelector('input');
            const saved = readStore(CRAFT_EMAIL_KEY, '');
            if (typeof saved === 'string' && !input.value) input.value = saved;
            input.focus();
        }
    });
    document.addEventListener('submit', e => {
        const form = e.target.closest('.craft-form');
        if (!form) return;
        e.preventDefault();
        joinCraftWaitlist(form);
    });
}
