/* =============================================
   TEASE YOU — script.js  v2.0
   ============================================= */

/* ─── JAZYK ─────────────────────────────────── */
/* Čeština, slovenština, nebo angličtina. Přednost má jazyk v adrese
   (?lang=sk, podle něj Google pozná jazykové verze), pak volba z přepínače
   v hlavičce (uložená v prohlížeči), jinak jazyk prohlížeče. Kdo nemá
   češtinu ani slovenštinu, dostane angličtinu. */
const LANGS = ['cs', 'sk', 'en'];
const LANG_KEY = 'teaseyou_lang';
const URL_LANG = (() => { try { const l = new URLSearchParams(location.search).get('lang'); return LANGS.includes(l) ? l : ''; } catch (_) { return ''; } })();
const LANG = (() => {
    if (URL_LANG) return URL_LANG;
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
        faq_a1:             'We blend your order only after you place it and usually ship within 24 hours. Delivery then takes 2–3 business days within the Czech Republic (Zásilkovna or Česká pošta) and 3–5 business days to Slovakia.',
        faq_q2:             'What are the allergens?',
        faq_a2:             'Every blend lists its allergens under Ingredients and food information, based on our suppliers\' specifications. If you have a severe allergy, write to us before ordering.',
        faq_q3:             'Can I return an order?',
        faq_a3:             'A blend mixed to your choice is made to order, so it cannot be returned without a reason. A ready-made blend can be returned within 14 days if the pouch is unopened. If anything arrives damaged or wrong, write to us and we will send a new one. Details are in our terms.',
        faq_q4:             'How do I brew a blend?',
        faq_a4:             'Use 2–3 grams, about one teaspoon, per 200 ml of water. Green and white tea: 75–80 °C for 2–3 minutes. Oolong: 85–90 °C for 3–4 minutes. Black tea: 90–95 °C for 3–4 minutes. Herbs and rooibos: boiling water for 5–7 minutes. The exact steps for your blend are on its page. Each package includes a brewing guide card.',
        faq_q5:             'Can I send a blend as a gift?',
        faq_a5:             'Absolutely, it is one of our most popular uses. During checkout, add a personal message in the note field and we will include a handwritten card. We also offer gift wrapping on request.',
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
        saved_empty:        'You can save any blend in the mixer for later.',
        btn_create_first:   'Create your first blend',
        btn_load_order:     'Load & Order',
        btn_remove:         'Remove',
        saved_date_prefix:  'Saved',
        /* Orders */
        orders_title:       'My Orders',
        orders_empty:       'Once you order, you will find it here along with the payment details.',
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
        toast_order_failed: 'The order could not be sent. Your cart is still here, please try again.',
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
        toast_saved:            '“{name}” is in your saved blends.',
        toast_link_copied:      'Link copied.',
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
        quiz_q1:        'When do you drink tea most often?',
        quiz_q1_o1:     'In the morning, to get going',
        quiz_q1_o2:     'In the afternoon, with work or a book',
        quiz_q1_o3:     'In the evening, before bed',
        quiz_q1_o4:     'Any time of day',
        quiz_q2:        'Which flavour appeals to you most?',
        quiz_q2_o1:     'Fresh and citrusy',
        quiz_q2_o2:     'Delicate and floral',
        quiz_q2_o3:     'Warm and spicy',
        quiz_q2_o4:     'Sweet and fruity',
        quiz_q3:        'How do you feel about caffeine?',
        quiz_q3_o1:     'The more the better',
        quiz_q3_o2:     'A little is fine',
        quiz_q3_o3:     'None, just herbs and fruit',
        quiz_q3_o4:     'I do not mind either way',
        quiz_q4:        'How do you like to drink it?',
        quiz_q4_o1:     'Hot and plain',
        quiz_q4_o2:     'Chilled or over ice',
        quiz_q4_o3:     'With milk or honey',
        quiz_q4_o4:     'Different every time',
        quiz_q5:        'Which season do you like best?',
        quiz_q5_o1:     'Spring, when everything blooms',
        quiz_q5_o2:     'Summer and ripe fruit',
        quiz_q5_o3:     'Autumn, blankets and spices',
        quiz_q5_o4:     'Winter, with a hot mug in hand',
        quiz_why:       'Why it fits you',
        quiz_also:      'You might also like',
        btn_order_blend: 'Order this blend',
        btn_try_again:   'Try again',
        /* Completion label */
        /* About page */
        about_hero_title:    'Tea is personal.',
        about_hero_subtitle: 'Everyone likes a different one. So here, everyone mixes their own.',
        about_story_p1:      'Tease you started as a school thesis. For months the founder went from one tea house to the next, trying to work out why you go back to some cups and not others.',
        about_story_p2:      'His answer: nobody can decide that for you. So there is no single “best” blend here, just a mixer: pick a base, a flavour and an extra, set the ratio and give the blend a name.',
        about_callout_text:  'Every blend is mixed only after you order. Not before.',
        about_card1_title:   'Mixed to order',
        about_card1_desc:    'Your blend is made when you order it. Nothing waits pre-mixed in a warehouse.',
        about_card2_title:   'Your recipe',
        about_card2_desc:    'Set the ratio in parts and see the percentages, grams and price straight away. Save the recipe and order it again next time.',
        about_card3_title:   'Nothing hidden',
        about_card3_desc:    'Teas, herbs, fruit and spices from checked suppliers. Every blend shows its full ingredients with percentages, allergens and shelf life.',
        about_cta:           'Ready to find your blend?',
        btn_start_creating2: 'Start creating',
        /* SEO */
        page_title:  'Tease you – Mix your own tea',
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
        ing_spearmint:      'Curly Mint',
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
        social_coming_soon:   'We are not on social media yet. Soon.',
        /* Packeta widget */
        packeta_choose:     'Choose pickup point',
        packeta_change:     'Change branch',
        packeta_required:   'Please choose a pickup point',
        packeta_unavailable:'The pickup point map did not load. Please try again.',
        /* Promo bar */
        promo_text:  'Free shipping over 500 Kč. Code FIRSTBLEND takes 10% off your first order.',
        /* Bottom nav */
        nav_quiz_short: 'Quiz',
        /* Ingredients encyclopedia */
        nav_ingredients: 'Ingredients',
        ing_page_title: 'Ingredient Guide',
        ing_page_sub: 'Everything here can go into your blend. Each one comes with how it tastes and what it goes well with.',
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
        proc_2_desc: 'Each ingredient is weighed on a digital scale exactly to the recipe, so the blend tastes the same every time.',
        proc_3_title: 'Blending',
        proc_3_desc: 'We mix the ingredients by hand so they blend evenly and the leaves stay whole.',
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
        faq_a1:             'Směs namícháme až po objednání a obvykle ji odešleme do 24 hodin. Po Česku pak cesta trvá 2–3 pracovní dny (Zásilkovna nebo Česká pošta), na Slovensko 3–5 pracovních dní.',
        faq_q2:             'Jaké jsou alergeny?',
        faq_a2:             'Alergeny najdeš u každé směsi v části Složení a informace o potravině, a to podle specifikací od našich dodavatelů. Když máš silnou alergii, napiš nám před objednávkou a probereme to.',
        faq_q3:             'Můžu objednávku vrátit?',
        faq_a3:             'Směs namíchanou podle tebe vyrábíme na zakázku, takže ji nejde vrátit bez udání důvodu. Hotovou směs z nabídky můžeš vrátit do 14 dnů, pokud je sáček neotevřený. Když cokoli dorazí poškozené nebo se liší od objednávky, napiš nám a pošleme novou. Podrobnosti jsou v obchodních podmínkách.',
        faq_q4:             'Jak směs připravit?',
        faq_a4:             'Na 200 ml vody dej 2–3 gramy, tedy zhruba jednu čajovou lžičku. Zelený a bílý čaj: 75–80 °C, 2–3 minuty. Oolong: 85–90 °C, 3–4 minuty. Černý čaj: 90–95 °C, 3–4 minuty. Bylinky a rooibos: vroucí voda, 5–7 minut. Přesný postup pro svou směs najdeš na její stránce. Každé balení obsahuje kartičku s návodem na přípravu.',
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
        saved_empty:        'V mixéru si můžeš každou směs uložit na později.',
        btn_create_first:   'Vytvoř svůj první blend',
        btn_load_order:     'Načíst a objednat',
        btn_remove:         'Odebrat',
        saved_date_prefix:  'Uloženo',
        /* Orders */
        orders_title:       'Moje objednávky',
        orders_empty:       'Až něco objednáš, najdeš to tady i s údaji k platbě.',
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
        toast_order_failed: 'Objednávku se nepodařilo odeslat. Košík ti zůstal, zkus to prosím znovu.',
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
        toast_saved:            '„{name}“ je v Uložených směsích.',
        toast_link_copied:      'Odkaz je zkopírovaný.',
        toast_removed:          'Směs odebrána',
        toast_in_cart:          '„{name}“ je v košíku',
        toast_discount_applied: 'použit!',
        toast_cart_empty:       'Košík je prázdný',
        toast_check_fields:     'Zkontroluj zvýrazněná pole',
        toast_select_shipping:  'Vyber způsob dopravy',
        toast_random:           'Náhodná směs:',
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
        quiz_q1:        'Kdy si čaj dáváš nejčastěji?',
        quiz_q1_o1:     'Ráno, na rozjezd',
        quiz_q1_o2:     'Odpoledne, k práci nebo ke knížce',
        quiz_q1_o3:     'Večer, před spaním',
        quiz_q1_o4:     'Kdykoli během dne',
        quiz_q2:        'Jaká chuť tě láká nejvíc?',
        quiz_q2_o1:     'Svěží a citrusová',
        quiz_q2_o2:     'Jemná a květinová',
        quiz_q2_o3:     'Hřejivá a kořeněná',
        quiz_q2_o4:     'Sladká a ovocná',
        quiz_q3:        'Jak to máš s kofeinem?',
        quiz_q3_o1:     'Čím víc, tím líp',
        quiz_q3_o2:     'Trochu nevadí',
        quiz_q3_o3:     'Žádný, jen bylinky a ovoce',
        quiz_q3_o4:     'Je mi to jedno',
        quiz_q4:        'Jak ho piješ nejradši?',
        quiz_q4_o1:     'Horký a čistý, bez ničeho',
        quiz_q4_o2:     'Vychlazený nebo s ledem',
        quiz_q4_o3:     'S mlékem nebo medem',
        quiz_q4_o4:     'Pokaždé jinak',
        quiz_q5:        'Které roční období máš nejradši?',
        quiz_q5_o1:     'Jaro, když všechno kvete',
        quiz_q5_o2:     'Léto a zralé ovoce',
        quiz_q5_o3:     'Podzim, deky a koření',
        quiz_q5_o4:     'Zima s horkým hrnkem v ruce',
        quiz_why:       'Proč ti sedí',
        quiz_also:      'Mohlo by ti chutnat i',
        btn_order_blend: 'Objednat tento blend',
        btn_try_again:   'Zkusit znovu',
        /* Completion label */
        /* About page */
        about_hero_title:    'Čaj je osobní.',
        about_hero_subtitle: 'Každému chutná jiný. Proto si u nás každý míchá ten svůj.',
        about_story_p1:      'Tease you začalo jako maturitní práce. Zakladatel kvůli ní měsíce obcházel čajovny a zjišťoval, proč se k některému šálku vracíš a k jinému ne.',
        about_story_p2:      'Vyšlo mu, že to za tebe nikdo neurčí. Proto tu není jedna „nejlepší“ směs, ale mixér: vybereš základ, příchuť a doplněk, nastavíš poměr a směs pojmenuješ.',
        about_callout_text:  'Každou směs mícháme až po objednání. Ne dřív.',
        about_card1_title:   'Mícháno na objednávku',
        about_card1_desc:    'Směs vzniká, až když si ji objednáš. Nic nečeká namíchané ve skladu.',
        about_card2_title:   'Tvůj recept',
        about_card2_desc:    'Poměr nastavíš po dílech a hned vidíš procenta, gramy i cenu. Recept si můžeš uložit a příště objednat znovu.',
        about_card3_title:   'Složení na očích',
        about_card3_desc:    'Čaje, byliny, ovoce a koření od ověřených dodavatelů. U každé směsi najdeš celé složení v procentech, alergeny i trvanlivost.',
        about_cta:           'Připraven/a najít svůj blend?',
        btn_start_creating2: 'Začít vytvářet',
        /* SEO */
        page_title:  'Tease you – Namíchej si vlastní čaj',
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
        ing_spearmint:      'Máta kadeřavá',
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
        social_coming_soon:   'Na sociálních sítích zatím nejsme. Brzy budeme.',
        /* Packeta widget */
        packeta_choose:     'Vybrat výdejní místo',
        packeta_change:     'Změnit pobočku',
        packeta_required:   'Vyber prosím výdejní místo',
        packeta_unavailable:'Výběr výdejních míst se nenačetl. Zkus to prosím znovu.',
        /* Promo bar */
        promo_text:  'Doprava zdarma nad 500 Kč. S kódem FIRSTBLEND máš první nákup o 10 % levnější.',
        /* Bottom nav */
        nav_quiz_short: 'Quiz',
        /* Ingredients encyclopedia */
        nav_ingredients: 'Suroviny',
        ing_page_title: 'Suroviny',
        ing_page_sub: 'Ze všeho tady se dá míchat. U každé suroviny najdeš, jak chutná a s čím si rozumí.',
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
        proc_2_desc: 'Každou surovinu vážíme na digitální váze přesně podle receptu, takže směs chutná pokaždé stejně.',
        proc_3_title: 'Namíchání',
        proc_3_desc: 'Suroviny ručně promícháme, aby se rovnoměrně spojily a lístky zůstaly celé.',
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
    if (own !== undefined) return typo(own);
    if (LANG === 'sk' && TRANSLATIONS.cs[key] !== undefined) return typo(TRANSLATIONS.cs[key]);
    if (TRANSLATIONS.en[key] !== undefined) return TRANSLATIONS.en[key];
    return key;
}

/* ─── Typografie ─────────────────────────────── */
/* V češtině a slovenštině nemá jednopísmenná předložka nebo spojka zůstat
   na konci řádku („pošleme ti ji v / sáčku“) a číslo se nemá odtrhnout od
   jednotky („500 / Kč“). Tahle funkce mezi ně dává pevnou mezeru. Volá ji
   t() a pickLang(), takže platí pro texty ze slovníku i z databáze. Texty se
   značkami (odkazy) a angličtinu nechává být. Dva průchody jsou kvůli dvěma
   krátkým slovům za sebou („a v sáčku“). */
const TYPO_WORD = /(^|[\s(„“"])([ksvzouaiKSVZOUAI])[ \t]+(?=\S)/g;
const TYPO_UNIT = /(\d)[ \t]+(?=(?:Kč|%|g|kg|ml|min|°C|ks)(?![0-9A-Za-zÀ-ž]))/g;
const typoCache = new Map();
function typo(s) {
    if (LANG === 'en' || typeof s !== 'string' || s.length < 4 || s.indexOf('<') >= 0) return s;
    let out = typoCache.get(s);
    if (out === undefined) {
        out = s.replace(TYPO_WORD, '$1$2\u00a0').replace(TYPO_WORD, '$1$2\u00a0').replace(TYPO_UNIT, '$1\u00a0');
        typoCache.set(s, out);
    }
    return out;
}

/* Text z databáze v jazyce webu: pole name → name_sk, name_cs, name_en.
   Slovenština bez překladu spadne na češtinu, angličtina na češtinu. */
function pickLang(row, field) {
    if (!row) return '';
    const order = LANG === 'en' ? ['en', 'cs'] : LANG === 'sk' ? ['sk', 'cs', 'en'] : ['cs', 'en'];
    for (const l of order) {
        const v = row[field + '_' + l];
        if (Array.isArray(v) ? v.length : (typeof v === 'string' && v.trim())) return typo(v);
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
    // Text se přepisuje, jen když se liší. Česká stránka má stejné texty už
    // v HTML (hlídá to tools/sync-static.js), takže se jí nikdo nedotkne:
    // nic neproblikne a prohlížeč nepočítá hlavní nadpis jako nově vykreslený.
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const text = t(el.getAttribute('data-i18n'));
        if (el.textContent !== text) el.textContent = text;
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
        const html = t(el.getAttribute('data-i18n-html'));
        if (el.innerHTML !== html) el.innerHTML = html;
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
    if (URL_LANG) {
        const u = new URL(location.href);
        u.searchParams.set('lang', code);
        location.replace(u.href);
    } else {
        location.reload();
    }
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
    return withHistory('replace', () => restoreView(st));
}
function restoreView(st) {
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
function computeTotals(shipping = 0, payFee = 0, giftFee = 0) {
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
    const gift     = Math.max(0, Number(giftFee) || 0);
    return { goods, discount, afterDiscount, freeShip, ship, pay, gift, total: afterDiscount + ship + pay + gift };
}

/* Příplatek za zvolený způsob platby v pokladně. */
function selectedPayFee() {
    const r = document.querySelector('#checkout-form input[name="payment"]:checked');
    // při osobním odběru se platí při předání, bez příplatku
    return r && r.value === 'cod' && !pickupSelected() ? COD_FEE : 0;
}
function pickupSelected() {
    const ship = document.querySelector('#checkout-form input[name="shipping"]:checked');
    return !!ship && ship.value === 'pickup';
}
function selectedGiftFee() {
    const box = document.getElementById('f-gift');
    return GIFT_WRAP.on && box && box.checked ? GIFT_WRAP.price : 0;
}
function syncGiftFields() {
    const box = document.getElementById('f-gift');
    const msg = document.getElementById('gift-message-group');
    if (msg) msg.hidden = !(box && box.checked);
    refreshCheckoutTotals();
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
/* Druhý parametr zůstal kvůli starším voláním; rozhoduje jen o tom, jestli
   je hláška varování (vykřičník), nebo potvrzení (fajfka). */
const TOAST_WARN = ['⚠️', '🫙', '⚖️'];
function showToast(msg, icon='🛒') {
    const t = document.getElementById('toast');
    const warn = TOAST_WARN.includes(icon);
    const ic = document.createElement('span');
    ic.className = 'toast-mark' + (warn ? ' toast-mark--warn' : '');
    ic.setAttribute('aria-hidden', 'true');
    ic.innerHTML = warn
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 7v6M12 17h.01"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m6 12.5 4 4 8-9"/></svg>';
    const text = document.createElement('span');
    text.textContent = String(msg);
    t.replaceChildren(ic, text);
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
/* Menu na telefonu. Otevřené si bere fokus (první odkaz), Tab z něj
   nevyjede, Esc ho zavře a fokus se vrátí na tlačítko, které ho otevřelo. */
let sidebarOpener = null;
function openSidebar() {
    const bar = document.getElementById('sidebar');
    sidebarOpener = document.activeElement;
    bar.classList.add('open');
    document.getElementById('sidebar-overlay').classList.add('open');
    document.body.style.overflow = 'hidden';
    document.querySelector('.nav-menu-icon')?.setAttribute('aria-expanded', 'true');
    bar.querySelector('.sidebar-close')?.focus({ preventScroll: true });
}
function closeSidebar() {
    const bar = document.getElementById('sidebar');
    const wasOpen = bar.classList.contains('open');
    bar.classList.remove('open');
    document.getElementById('sidebar-overlay').classList.remove('open');
    document.body.style.overflow = '';
    document.querySelector('.nav-menu-icon')?.setAttribute('aria-expanded', 'false');
    if (wasOpen && bar.contains(document.activeElement) && sidebarOpener && sidebarOpener.focus) sidebarOpener.focus({ preventScroll: true });
    sidebarOpener = null;
}
document.addEventListener('keydown', e => {
    const bar = document.getElementById('sidebar');
    if (!bar || !bar.classList.contains('open')) return;
    if (e.key === 'Escape') { e.preventDefault(); closeSidebar(); return; }
    if (e.key !== 'Tab') return;
    const items = [...bar.querySelectorAll('a[href], button:not([disabled])')];
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});

/* ─── PAGE NAVIGATION ────────────────────────── */
function showPage(pageId, opts = {}) {
    if (!document.getElementById(pageId)) pageId = 'home-page';
    const leftAt = Math.round(window.scrollY);   // dřív, než se stránka vymění a zkrátí
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const incoming = document.getElementById(pageId);
    if (incoming) {
        incoming.classList.add('active');
        incoming.classList.remove('page-enter');
        void incoming.offsetWidth; // force reflow
        incoming.classList.add('page-enter');
    }
    // Nová stránka začíná nahoře a hned: plynulý posun by ukázal, jak nový
    // obsah „odjíždí“ z místa, kde zákazník byl na té staré.
    if (opts.scroll !== false) window.scrollTo({ top: 0, behavior: 'auto' });
    syncHistory(pageId, opts.history || forcedHistory || 'push', leftAt);
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
    updateSeo(pageId);
    if (incoming) setTimeout(() => focusPageHeading(incoming), 0);
}

/* Po přepnutí stránky dostane fokus její nadpis. Kdo web ovládá klávesnicí
   nebo čtečkou obrazovky, jinak zůstane „stát“ na odkazu, který už není vidět,
   a nedozví se, že se obsah změnil. Při prvním načtení se fokus nebere. */
let pageReady = false;
function focusPageHeading(page) {
    if (!pageReady || !page.classList.contains('active') || page.contains(document.activeElement)) return;
    const visible = el => !!(el.offsetWidth || el.offsetHeight);
    const target = [...page.querySelectorAll('h1, .step-question')].find(visible) || document.getElementById('obsah');
    if (!target) return;
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
}

/* ─── ADRESY STRÁNEK A TLAČÍTKO ZPĚT ─────────── */
/* Každá stránka má vlastní adresu (?stranka=kviz, hotová směs
   ?smes=deep_winter), takže v prohlížeči funguje Zpět a Vpřed, odkaz jde
   poslat a Google stránky najde. Adresy jsou stejné ve všech jazycích,
   jazyk přidá ?lang=… (jen když v adrese už je). */
const PAGE_SLUGS = {
    'product-page': 'namichat', 'quiz-page': 'kviz', 'ingredients-page': 'suroviny', 'craft-page': 'mydla',
    'about-page': 'o-nas', 'process-page': 'jak-michame', 'saved-page': 'moje-smesi', 'orders-page': 'moje-objednavky',
    'cart-page': 'kosik', 'checkout-page': 'pokladna', 'terms-page': 'obchodni-podminky',
    'withdrawal-page': 'odstoupeni', 'privacy-page': 'ochrana-udaju', 'cookies-page': 'cookies',
};
const SLUG_PAGES = Object.fromEntries(Object.entries(PAGE_SLUGS).map(([page, slug]) => [slug, page]));
const SITE_URL = 'https://teaseyou.cz/';
let detailState = null;    // co je na detailu: { blend: id } nebo celá směs (kvíz, uložené)
let forcedHistory = null;  // 'replace' / 'none' při obnově stránky
let pendingBlendRoute = null;

function withHistory(mode, fn) {
    const before = forcedHistory;
    forcedHistory = mode;
    try { return fn(); } finally { forcedHistory = before; }
}

function queryFor(pageId, lang = URL_LANG) {
    const q = new URLSearchParams();
    if (pageId === 'product-detail-page' && detailState && detailState.blend) q.set('smes', detailState.blend);
    else if (PAGE_SLUGS[pageId]) q.set('stranka', PAGE_SLUGS[pageId]);
    if (lang) q.set('lang', lang);
    const str = q.toString();
    return str ? '?' + str : '';
}

function syncHistory(pageId, mode, leftAt = Math.round(window.scrollY)) {
    if (mode === 'none' || !window.history || typeof history.pushState !== 'function') return;
    const state = { page: pageId };
    let url = location.pathname + queryFor(pageId);
    if (pageId === 'product-detail-page' && detailState) {
        state.detail = detailState;
        if (!detailState.blend) url = location.pathname + location.search;   // směs bez vlastní adresy
    }
    if (pageId === 'success-page') url = location.pathname + queryFor('home-page');
    const cur = history.state;
    const same = cur && cur.page === pageId && location.pathname + location.search === url
        && JSON.stringify(cur.detail || null) === JSON.stringify(state.detail || null);
    try {
        if (mode === 'replace' || same) {
            history.replaceState(Object.assign({}, same ? cur : {}, state), '', url);
        } else {
            history.replaceState(Object.assign({}, cur, { y: leftAt }), '');
            history.pushState(state, '', url);
        }
    } catch (_) { /* třeba file:// nebo moc rychlých změn */ }
}

function stateFromUrl() {
    const q = new URLSearchParams(location.search);
    const blend = q.get('smes');
    if (blend) return { page: 'product-detail-page', detail: { blend } };
    return { page: SLUG_PAGES[q.get('stranka')] || 'home-page' };
}

/* Otevře stránku podle záznamu v historii nebo podle adresy. */
function routeTo(st, mode) {
    if (!st || typeof st !== 'object' || typeof st.page !== 'string') st = { page: 'home-page' };
    const keepScroll = st.y > 0 ? { scroll: false } : {};
    return withHistory(mode, () => {
        if (st.page === 'product-detail-page') {
            const d = st.detail || {};
            if (typeof d.blend === 'string') {
                if (catalogBlends.some(b => b.id === d.blend)) { openBlend(d.blend, keepScroll); pendingBlendRoute = null; return true; }
                // směs z administrace, která ještě není načtená: zkusí se po načtení katalogu
                if (!catalogLoaded) pendingBlendRoute = d.blend;
            } else if (Array.isArray(d.ingredients) && d.ingredients.length) {
                openDetail(String(d.name || ''), String(d.desc || ''), Number(d.price) || 0, d.ingredients, null, d.parts, keepScroll);
                return true;
            }
            showPage('home-page', keepScroll);
            return false;
        }
        if (st.page === 'success-page' && !document.querySelector('#success-order-num')?.textContent.trim()) {
            showPage('home-page', keepScroll);
            return false;
        }
        showPage(st.page, keepScroll);
        return true;
    });
}

window.addEventListener('popstate', e => {
    // Odkaz uvnitř stránky (#obsah u „Přeskočit na obsah“, #shelf) přidá do
    // historie záznam bez stavu. Stránka se tím nemění, takže ji znovu
    // nepřepínáme: jinak by skočila nahoru a fokus by odešel na nadpis.
    if (!e.state && location.hash) return;
    const st = e.state || stateFromUrl();
    routeTo(st, 'none');
    if (st && st.y > 0) setTimeout(() => window.scrollTo({ top: st.y, behavior: 'auto' }), 40);
});
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

/* Titulek, popis a adresy pro vyhledávače podle otevřené stránky. Mixér
   a kvíz nemají pevný nadpis (mění se po krocích), proto mají vlastní text. */
const PAGE_TITLE_KEYS = { 'product-page': 'title_mixer', 'quiz-page': 'nav_quiz' };
function updateSeo(pageId) {
    const page = document.getElementById(pageId);
    let title = t('page_title');
    let desc = t('meta_desc');
    if (pageId === 'product-detail-page' && currentProduct && currentProduct.name) {
        title = `${currentProduct.name} – Tease you`;
        if (currentProduct.desc) desc = String(currentProduct.desc).replace(/\s+/g, ' ').slice(0, 300);
    } else if (PAGE_TITLE_KEYS[pageId]) {
        title = `${t(PAGE_TITLE_KEYS[pageId])} – Tease you`;
    } else if (pageId !== 'home-page' && page) {
        const h = page.querySelector('h1.page-title, h1, h2');
        const head = h ? h.textContent.replace(/\s+/g, ' ').trim() : '';
        if (head) title = `${head} – Tease you`;
    }
    document.title = title;
    const set = (sel, attr, val) => { const el = document.querySelector(sel); if (el) el.setAttribute(attr, val); };
    set('meta[name="description"]', 'content', desc);
    set('meta[property="og:title"]', 'content', title);
    set('meta[property="og:description"]', 'content', desc);
    const absolute = lang => new URL(queryFor(pageId, lang), SITE_URL).href;
    // Detail směsi bez vlastní adresy (kvíz, uložené směsi) se do vyhledávače nedává.
    const own = pageId !== 'success-page' && !(pageId === 'product-detail-page' && !(detailState && detailState.blend));
    set('link[rel="canonical"]', 'href', own ? absolute(LANG) : absolute(LANG).replace(/\?.*$/, ''));
    set('meta[property="og:url"]', 'content', own ? absolute(LANG) : SITE_URL);
    for (const l of [...LANGS, 'x-default']) {
        let link = document.querySelector(`link[rel="alternate"][hreflang="${l}"]`);
        if (!link) { link = document.createElement('link'); link.rel = 'alternate'; link.hreflang = l; document.head.appendChild(link); }
        link.href = own ? absolute(l === 'x-default' ? '' : l) : SITE_URL;
    }
}

/* ─── FAQ ACCORDION ──────────────────────────── */
function toggleFaq(btn) {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    // Close all
    document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
}

/* Teplota se v češtině píše s mezerou: 100 °C (pevná mezera, ať se číslo
   neodtrhne od jednotky). V katalogu může být zapsaná i bez ní. */
function fmtTemp(s) { return String(s || '').replace(/\s*°\s*C/g, '\u00a0°C'); }

/* ─── BREW GUIDE TOGGLE ──────────────────────── */
function toggleBrewGuide(btn) {
    btn.closest('.brew-guide').classList.toggle('open');
}

/* ─── PRODUCT DETAIL ─────────────────────────── */
function openDetail(name, desc, price, ingredientsIn, colors, partsIn, opts = {}) {
    const { codes: ingredients, parts } = Recipe.normalize(ingredientsIn, partsIn);
    const fromCatalog = catalogBlends.find(b => b.name === name);
    detailState = fromCatalog ? { blend: fromCatalog.id } : { name, desc, price, ingredients, parts };
    renderDetailReviews(fromCatalog && fromCatalog.id);
    // Barvy se berou z katalogu — admin je mohl změnit od doby, kdy vznikl
    // kvíz nebo uložený mix.
    colors = ingredients.map((c, i) => ingColor(c) || (colors && colors[i]) || 'transparent');
    currentProduct = { name, desc, priceBase: price, ingredients, parts, colors, weight: '' };
    showDetailPhotoAndStock(name, ingredients);
    document.getElementById('detail-title').innerText = name;
    const localDesc = BLEND_DESCS[name] || desc;
    document.getElementById('detail-desc').innerText = localDesc;
    const profileEl = document.getElementById('detail-profile');
    if (profileEl) { const profile = blendProfileText(ingredients, parts); profileEl.textContent = profile; profileEl.hidden = !profile; }
    renderDetailMore(fromCatalog && fromCatalog.id);
    renderDetailStory(fromCatalog);
    renderDetailVisual(name, ingredients, parts);
    renderDetailCraft(ingredients);

    // Louhování podle hlavní suroviny
    const brew = brewFor(ingredients, parts);
    const tempEl = document.getElementById('detail-temp');
    const timeEl = document.getElementById('detail-time');
    if (tempEl) tempEl.textContent = fmtTemp(brew.temp);
    if (timeEl) timeEl.innerHTML = brew.time;

    renderPriceOptions();
    preselectQty(document.querySelector('#product-detail-page .qty-options'));
    showPage('product-detail-page', opts);
}

/* Sáček a seznam ingrediencí na detailu hotové směsi: podíl v % a kolik
   gramů je v sáčku vybrané velikosti. */
function renderDetailVisual(name, ingredients, parts) {
    const weight = parseInt(currentProduct.weight, 10) || 0;
    const box = document.getElementById('detail-pouch');
    const band = momentOf(catalogBlends.find(b => b.name === name));
    if (box) box.innerHTML = pouchHtml({ name, codes: ingredients, parts, size: 'pouch--hero', weight: weight ? weight + ' g' : '', band });
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
    const totals = computeTotals(cost, selectedPayFee(), selectedGiftFee());
    const giftRow = document.getElementById('checkout-gift-row');
    if (giftRow) giftRow.style.display = document.getElementById('f-gift')?.checked && GIFT_WRAP.on ? 'flex' : 'none';
    const giftEl = document.getElementById('checkout-gift-cost');
    if (giftEl) giftEl.textContent = totals.gift ? fmt(totals.gift) : t('gift_free');
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
    const pickup = !!ship && (ship.value === 'zasilkovna' || ship.value === 'pickup');
    document.querySelectorAll('#checkout-form .address-only').forEach(el => { el.hidden = pickup; });
    ['f-street', 'f-city', 'f-zip'].forEach(id => {
        const f = document.getElementById(id);
        if (f) { f.required = !pickup; if (pickup) setFieldError(f, ''); }
    });
    const hint = document.getElementById('address-hint');
    if (hint) {
        hint.hidden = !pickup;
        if (pickup) hint.textContent = t(ship.value === 'pickup' ? 'address_not_needed_pickup' : 'address_not_needed');
    }
    // dobírka se u osobního odběru mění na platbu při předání
    const inPerson = !!ship && ship.value === 'pickup';
    const cod = document.querySelector('#checkout-form input[name="payment"][value="cod"]')?.closest('.payment-option');
    if (cod) {
        const name = cod.querySelector('.choice-name'), desc = cod.querySelector('.choice-desc');
        if (name) name.textContent = t(inPerson ? 'pay_on_pickup' : 'pay_cod');
        if (desc) desc.textContent = t(inPerson ? 'pay_on_pickup_desc' : 'pay_cod_desc');
    }
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
        setPromoFeedback(`${t('promo_applied')}: ${promo.label}`, true);
        showToast(t('toast_promo').replace('{code}', code), '🏷️');
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
    showToast(t('toast_saved').replace('{name}', blend.name), '📌');
}

/* ─── SHARE BLEND ────────────────────────────── */
function shareBlend() {
    const url  = buildBlendUrl();
    const ings = currentProduct.ingredients.map(tIng).join(', ');
    const text = t('share_text').replace('{name}', currentProduct.name).replace('{ings}', ings);
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
    if (appliedPromo) setPromoFeedback(`${t('promo_applied')}: ${appliedPromo.label || '−' + Math.round(appliedPromo.rate*100) + ' %'}`, true);

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
    const needsAddress = !shipChoice || (shipChoice.value !== 'zasilkovna' && shipChoice.value !== 'pickup');
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
    const totals = computeTotals(shipPrice, selectedPayFee(), selectedGiftFee());
    const payRadio = form.querySelector('input[name="payment"]:checked');
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
        gift:        totals.gift,
        total:       totals.total,
        ship:        shipRadio ? shipRadio.value : '',
        pay:         payRadio ? payRadio.value : '',
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
            if (Number.isFinite(serverResult.gift)) order.gift = serverResult.gift;
            order.total    = serverResult.total;
            order.server   = true;   // číslo a částka jsou z databáze (jde podle nich platit)
        }
        orders.unshift(order);
        if (orders.length > 50) orders.pop();
        try { localStorage.setItem('teaseyou_orders', JSON.stringify(orders)); } catch (_) {}

        const el = document.getElementById('success-order-num');
        if (el) el.textContent = t('order_num_prefix') + order.num;
        const pouch = document.getElementById('success-pouch');
        const first = order.items[0];
        if (pouch && first) pouch.innerHTML = pouchHtml({ name: first.name, codes: first.ingredients, parts: first.parts, size: 'pouch--sm' });
        renderPaymentBox(document.getElementById('success-pay'), order);
        const giftBox = document.getElementById('f-gift');
        if (giftBox) { giftBox.checked = false; const m = document.getElementById('f-gift-message'); if (m) m.value = ''; syncGiftFields(); }

        cart = [];
        appliedPromo = null;
        packetaPoint = null;
        saveCart();
        savePromo();
        updateCartBadge();
        unlock();
        showPage('success-page', { history: 'replace' });   // Zpět nevede do prázdné pokladny
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

/* ─── PLATBA PŘEVODEM: ÚDAJE A QR KÓD ─────────── */
/* Ukáže se jen u objednávky z databáze (číslo a částku spočítal server)
   a jen když je v administraci vyplněný účet. QR je český standard
   QR Platba, knihovna se načte až tady. */
let qrLibLoading = null;
function loadQrLib() {
    if (typeof window.qrcode === 'function') return Promise.resolve(window.qrcode);
    if (!qrLibLoading) {
        qrLibLoading = new Promise((resolve, reject) => {
            const el = document.createElement('script');
            el.src = 'vendor/qrcode.js';
            el.async = true;
            el.onload = () => (typeof window.qrcode === 'function' ? resolve(window.qrcode) : reject(new Error('qrcode')));
            el.onerror = () => { qrLibLoading = null; reject(new Error('qrcode')); };
            document.head.appendChild(el);
        });
    }
    return qrLibLoading;
}

function paymentInfo(order) {
    if (!order || order.pay !== 'transfer' || !order.server || !SELLER.iban || !window.Bank) return null;
    const vs = Bank.variableSymbol(order.num);
    const amount = Number(order.total);
    if (!vs || !(amount > 0)) return null;
    return { iban: SELLER.iban, account: Bank.czAccount(SELLER.iban), amount, vs, msg: `Tease you ${order.num}` };
}

function renderPaymentBox(box, order) {
    if (!box) return;
    const info = paymentInfo(order);
    box.hidden = !info;
    box.innerHTML = '';
    if (!info) return;
    const rows = [
        [t('pay_account'), info.account || Bank.formatIban(info.iban)],
        info.account ? ['IBAN', Bank.formatIban(info.iban)] : null,
        [t('pay_amount'), fmt(info.amount)],
        [t('pay_vs'), info.vs],
    ].filter(Boolean);
    box.innerHTML = `
        <h2 class="pay-box-title">${escHtml(t('pay_box_title'))}</h2>
        <div class="pay-box-body">
            <figure class="pay-qr">
                <div class="pay-qr-code" role="img" aria-label="${escHtml(t('pay_qr_label'))}"></div>
                <figcaption>${escHtml(t('pay_qr_caption'))}</figcaption>
            </figure>
            <dl class="pay-details">${rows.map(([k, v]) => `<div><dt>${escHtml(k)}</dt><dd>${escHtml(v)}</dd></div>`).join('')}</dl>
        </div>
        <p class="pay-box-note">${escHtml(t('pay_box_note'))}</p>`;
    const text = Bank.spayd(info);
    loadQrLib().then(qr => {
        const code = qr(0, 'M');
        code.addData(text);
        code.make();
        const el = box.querySelector('.pay-qr-code');
        if (el) { el.innerHTML = code.createSvgTag({ cellSize: 4, margin: 4, scalable: true }); el.dataset.spayd = text; }
    }).catch(() => {
        const fig = box.querySelector('.pay-qr');
        if (fig) fig.hidden = true;   // bez QR zůstanou údaje k opsání
    });
}

/* ─── OBJEDNAT ZNOVU ──────────────────────────── */
/* Položky staré objednávky zpátky do košíku, s dnešní cenou. Co už nejde
   (vyprodaná nebo zrušená surovina, velikost, která se už neprodává),
   vynechá a řekne to. */
function reorder(num) {
    const o = orders.find(x => x.num === num);
    if (!o) return;
    let added = 0, skipped = 0;
    (Array.isArray(o.items) ? o.items : []).forEach(it => {
        const raw = Array.isArray(it.ingredients) ? it.ingredients : [];
        const known = raw.filter(c => typeof c === 'string' && ingByCode(c));
        const weight = parseInt(it.weight, 10);
        const { codes, parts } = Recipe.normalize(known, Array.isArray(it.parts) ? it.parts : null);
        const ok = known.length && known.length === raw.length && PRICES[weight]
            && !outOfStockIn(codes).length && recipeOf(codes, parts, weight).ok;
        const price = ok ? unitPrice(codes, parts, weight) : 0;
        if (!price) { skipped++; return; }
        const qty = Math.min(Math.max(parseInt(it.qty, 10) || 1, 1), 20);
        const name = String(it.name || '').trim().slice(0, 60) || 'Custom Mix';
        const same = i => i.name === name && i.ingredients.join('|') === codes.join('|')
            && (i.parts || []).join() === parts.join() && parseInt(i.weight, 10) === weight;
        const existing = cart.find(same);
        if (existing) existing.qty += qty;
        else cart.push({ id: ++cartIdCounter, name, ingredients: codes.slice(), parts: parts.slice(),
                         colors: codes.map(c => ingColor(c) || '#ccc'), weight: weight + 'g', priceBase: price, qty });
        added++;
    });
    if (!added) { showToast(t('reorder_none'), '🫙'); return; }
    saveCart();
    updateCartBadge();
    showPage('cart-page');
    showToast(skipped ? t('reorder_some_' + pluralForm(skipped)).replace('{n}', skipped) : t('reorder_done'), skipped ? '⚠️' : '🛒');
}

/* ─── RECENZE ─────────────────────────────────── */
/* Hodnotit jde z Moje objednávky: databáze ověří číslo objednávky a e-mail
   z ní a pustí to až po odeslání. Na web jdou jen schválené (admin).
   Jak ověřujeme, píšeme u recenzí (zákon o ochraně spotřebitele). */
const REVIEWED_KEY = 'teaseyou_reviewed';
const reviewsCache = {};
const reviewsOn = () => !!(window.TeaDB && TeaDB.configured);
function reviewedOrders() { const v = readStore(REVIEWED_KEY, []); return Array.isArray(v) ? v : []; }
const fmtRating = n => Number(n).toLocaleString(LOCALE, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
function starsHtml(n, label = true) {
    const full = Math.max(0, Math.min(5, Math.round(Number(n) || 0)));
    const aria = label ? ` role="img" aria-label="${escHtml(t('reviews_stars').replace('{n}', fmtRating(n)))}"` : ' aria-hidden="true"';
    return `<span class="stars"${aria}>${'★'.repeat(full)}<span class="stars-off">${'★'.repeat(5 - full)}</span></span>`;
}
/* Tvar podle počtu: 1 recenze, 2–4 recenze, 5 recenzí. */
function pluralForm(n) { return n === 1 ? 'one' : (n >= 2 && n <= 4 ? 'few' : 'many'); }
function reviewsCountText(n) {
    return `${n} ${t('reviews_n_' + pluralForm(n))}`;
}
function loadReviews(blend) {
    if (!reviewsOn()) return Promise.resolve(null);
    const key = blend || '';
    if (!reviewsCache[key]) {
        reviewsCache[key] = TeaDB.rpc('public_reviews', blend ? { p_blend: blend } : {})
            .catch(() => { delete reviewsCache[key]; return null; });
    }
    return reviewsCache[key];
}
function renderReviewBlock(prefix, data, max) {
    const section = document.getElementById(prefix);
    if (!section) return;
    const count = data && Number(data.count) || 0;
    const items = data && Array.isArray(data.items) ? data.items : [];
    section.hidden = !count;
    if (!count) return;
    const summary = document.getElementById(prefix + '-summary');
    if (summary) summary.innerHTML = `${starsHtml(data.average)} <strong>${escHtml(fmtRating(data.average))}</strong> ${escHtml(t('reviews_of5'))} · ${escHtml(reviewsCountText(count))}`;
    const list = document.getElementById(prefix + '-list');
    if (list) list.innerHTML = items.slice(0, max).map(r => {
        const d = new Date(String(r.date || '') + 'T12:00:00');
        const when = isNaN(d) ? '' : d.toLocaleDateString(LOCALE, { month: 'long', year: 'numeric' });
        return `<article class="review-card">
            <header class="review-head">${starsHtml(r.rating)}<span class="review-meta">${escHtml(r.author)}${when ? ' · ' + escHtml(when) : ''}</span></header>
            ${r.body ? `<p class="review-body">${escHtml(r.body)}</p>` : ''}
            ${r.reply ? `<p class="review-reply"><strong>${escHtml(t('reviews_reply'))}</strong> ${escHtml(r.reply)}</p>` : ''}
        </article>`;
    }).join('');
}
function renderHomeReviews() {
    loadReviews('').then(data => renderReviewBlock('reviews-home', data, 6));
}
function renderDetailReviews(blendId) {
    const section = document.getElementById('detail-reviews');
    if (section) section.hidden = true;
    if (!blendId) return;
    loadReviews(blendId).then(data => {
        if (detailState && detailState.blend === blendId) renderReviewBlock('detail-reviews', data, 4);
    });
}

function reviewFormHtml(num) {
    const id = 'rv-' + String(num).replace(/[^A-Za-z0-9-]/g, '');
    const stars = [1, 2, 3, 4, 5].map(n => `<label class="star-pick"><input type="radio" name="rating" value="${n}" class="visually-hidden"><span aria-hidden="true">★</span><span class="visually-hidden">${escHtml(t('review_star_n').replace('{n}', n))}</span></label>`).join('');
    return `<form class="review-form" data-review-form="${escHtml(num)}" novalidate>
        <fieldset class="star-input"><legend class="field-label">${escHtml(t('review_legend'))}</legend><div class="star-row">${stars}</div></fieldset>
        <div class="form-group"><label class="field-label" for="${id}-body">${escHtml(t('review_body'))} <span class="field-opt">${escHtml(t('checkout_note_opt'))}</span></label>
            <textarea id="${id}-body" name="body" class="field" rows="3" maxlength="1000"></textarea></div>
        <div class="form-group"><label class="field-label" for="${id}-author">${escHtml(t('review_author'))}</label>
            <input id="${id}-author" name="author" class="field" maxlength="40" autocomplete="given-name" placeholder="${escHtml(t('review_author_ph'))}"></div>
        <div class="form-group"><label class="field-label" for="${id}-email">${escHtml(t('review_email'))}</label>
            <input id="${id}-email" name="email" type="email" class="field" maxlength="200" autocomplete="email" aria-describedby="${id}-email-hint">
            <small class="field-hint" id="${id}-email-hint">${escHtml(t('review_email_hint'))}</small></div>
        <label class="check-row"><input type="checkbox" name="consent"> <span>${escHtml(t('review_consent'))}</span></label>
        <p class="field-error review-error" role="alert" hidden></p>
        <button type="submit" class="btn btn-primary btn-small">${escHtml(t('review_send'))}</button>
    </form>`;
}

const REVIEW_ERRORS = { review_not_found: 'review_err_not_found', review_too_early: 'review_err_too_early',
    review_exists: 'review_err_exists', review_consent: 'review_err_consent', invalid_review: 'review_err_rating',
    too_many: 'review_err_other' };

function submitReview(form) {
    const num = form.dataset.reviewForm;
    const err = form.querySelector('.review-error');
    const say = key => { err.textContent = t(key); err.hidden = false; };
    err.hidden = true;
    const rating = form.querySelector('input[name="rating"]:checked');
    const author = form.elements.author.value.trim().replace(/\s+/g, ' ');
    const email = form.elements.email.value.trim();
    if (!rating) return say('review_err_rating');
    if (author.length < 2) { form.elements.author.focus(); return say('review_err_author'); }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { form.elements.email.focus(); return say('review_err_email'); }
    if (!form.elements.consent.checked) return say('review_err_consent');
    const btn = form.querySelector('[type=submit]');
    btn.disabled = true;
    TeaDB.rpc('submit_review', { p: { orderNum: num, email, rating: rating.value, body: form.elements.body.value.trim().slice(0, 1000),
                                      author: author.slice(0, 40), lang: LANG, consent: 'true' } })
        .then(() => {
            const done = reviewedOrders().filter(x => x !== num);
            done.unshift(num);
            try { localStorage.setItem(REVIEWED_KEY, JSON.stringify(done.slice(0, 50))); } catch (_) {}
            const card = form.closest('.order-card');
            form.outerHTML = `<p class="review-thanks" role="status">${escHtml(t('review_thanks'))}</p>`;
            const b = card && card.querySelector('[data-review]');
            if (b) b.remove();
        })
        .catch(e => {
            btn.disabled = false;
            const code = e && e.message;
            if (code === 'review_exists') {
                try { localStorage.setItem(REVIEWED_KEY, JSON.stringify([num, ...reviewedOrders()].slice(0, 50))); } catch (_) {}
            }
            say(REVIEW_ERRORS[code] || 'review_err_other');
        });
}

document.addEventListener('click', e => {
    const b = e.target.closest('[data-review]');
    if (!b) return;
    const card = b.closest('.order-card');
    let form = card && card.querySelector('.review-form');
    if (form) { form.remove(); b.setAttribute('aria-expanded', 'false'); return; }
    card.querySelector('.order-actions').insertAdjacentHTML('afterend', reviewFormHtml(b.dataset.review));
    b.setAttribute('aria-expanded', 'true');
    form = card.querySelector('.review-form');
    form.querySelectorAll('input[name="rating"]').forEach(r => r.addEventListener('change', () => {
        form.querySelector('.star-input').dataset.value = r.value;
    }));
    form.addEventListener('submit', ev => { ev.preventDefault(); submitReview(form); });
    form.querySelector('input[name="rating"]').focus();
});

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
                ${o.payment ? `<div><dt>${escHtml(t('order_payment_fee'))}</dt><dd>${fmt(o.payment)}</dd></div>` : ''}
                ${o.gift ? `<div><dt>${escHtml(t('gift_row'))}</dt><dd>${fmt(o.gift)}</dd></div>` : ''}
                <div class="order-total"><dt>${escHtml(t('order_total'))}</dt><dd>${fmt(o.total)}</dd></div>
            </dl>
            ${paymentInfo(o) ? `<details class="order-pay" data-pay="${escHtml(o.num)}"><summary>${escHtml(t('pay_box_title'))}</summary><div class="pay-box pay-box--inline"></div></details>` : ''}
            <p class="order-actions">
                <button type="button" class="btn btn-quiet btn-small" data-reorder="${escHtml(o.num)}">${escHtml(t('reorder_btn'))}</button>
                ${o.server && reviewsOn() && !reviewedOrders().includes(o.num) ? `<button type="button" class="btn btn-quiet btn-small" data-review="${escHtml(o.num)}" aria-expanded="false">${escHtml(t('review_btn'))}</button>` : ''}
                ${orderWithdrawable(o) ? `<button type="button" class="btn btn-quiet btn-small" data-withdraw="${escHtml(o.num)}">${escHtml(t('wd_button'))}</button>` : ''}
            </p>`;
        list.appendChild(card);
        const pay = card.querySelector('.order-pay');
        if (pay) pay.addEventListener('toggle', () => {
            const box = pay.querySelector('.pay-box');
            if (pay.open && box && !box.childElementCount) renderPaymentBox(box, o);
        });
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
    const again = e.target.closest('[data-reorder]');
    if (again) { reorder(again.dataset.reorder); return; }
    if (e.target.closest('#wd-start')) {
        const form = document.getElementById('wd-form');
        if (form && !form.hidden) { form.hidden = true; e.target.closest('#wd-start').setAttribute('aria-expanded', 'false'); }
        else openWithdrawalForm('');
    }
});
document.addEventListener('submit', e => { if (e.target.id === 'wd-form') submitWithdrawal(e); });


/* ─── ODKAZY NA STRÁNKY WEBU ─────────────────── */
/* Navigace jsou opravdové odkazy (<a href="?stranka=kviz" data-page="quiz-page">):
   jdou otevřít v novém panelu, zkopírovat a vyhledávač je vidí. Obyčejné
   kliknutí se tady odchytí a stránka se jen přepne, bez nového načítání.
   data-page = stránka, data-blend = hotová směs, data-go="shelf" = Naše směsi. */
document.addEventListener('click', e => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest && e.target.closest('a[data-page], a[data-blend], a[data-go]');
    if (!a || a.target === '_blank') return;
    e.preventDefault();
    if (a.closest('#sidebar')) closeSidebar();
    if (a.dataset.blend) openBlend(a.dataset.blend);
    else if (a.dataset.go === 'shelf') goToShelf();
    else showPage(a.dataset.page);
});
/* Adresy v odkazech: stejné jako v adresním řádku, včetně ?lang=, když ho
   adresa má. Volá se po startu a po vykreslení částí, které odkazy obsahují. */
function refreshLinks(root = document) {
    root.querySelectorAll('a[data-page]').forEach(a => {
        a.setAttribute('href', a.dataset.page === 'home-page' ? homeHref() : queryFor(a.dataset.page));
    });
    root.querySelectorAll('a[data-blend]').forEach(a => a.setAttribute('href', blendHref(a.dataset.blend)));
    root.querySelectorAll('a[data-go="shelf"]').forEach(a => a.setAttribute('href', homeHref() + '#shelf'));
}
function homeHref() { return URL_LANG ? './?lang=' + URL_LANG : './'; }
function blendHref(id) {
    const q = new URLSearchParams({ smes: id });
    if (URL_LANG) q.set('lang', URL_LANG);
    return '?' + q.toString();
}
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

document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('[data-ing-jump]');
    if (!b) return;
    const h = document.getElementById(b.dataset.ingJump);
    if (h) { h.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' }); h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
});
function renderIngredientEncyclopedia() {
    const jump = document.getElementById('ing-jump');
    if (jump) jump.innerHTML = [['bases', 'ing_cat_bases'], ['flavors', 'ing_cat_flavors'], ['extras', 'ing_cat_extras']]
        .filter(([cat]) => (ING_DATA[cat] || []).length)
        .map(([cat, key]) => `<button type="button" class="chip" data-ing-jump="ing-h-${cat}">${escHtml(t(key))} <span class="chip-count">${ING_DATA[cat].length}</span></button>`).join('');
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
    refreshLinks();
    updateCartBadge();   // restore badge from persisted cart
    renderIngredientEncyclopedia();
    renderPresets();
    renderSavedBlends();
    renderCart();
    // sdílený odkaz (?b=…), jinak místo, kde zákazník byl před přepnutím jazyka
    // pak stránka podle adresy (?stranka=…, ?smes=…)
    if (new URLSearchParams(location.search).get('b')) loadBlendFromUrl();
    else if (!restoreViewState()) routeTo(stateFromUrl(), 'replace');
    refreshCatalog();    // čerstvá data ze Supabase (když je nastavený)
    renderHomeReviews();
    // ikonky zapsané v HTML jen jménem (data-icon="scale") se dokreslí z icons.js
    document.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = IngIcons.svg(el.dataset.icon); });
    renderAboutStage();
    document.documentElement.classList.remove('i18n-wait');   // texty jsou přeložené, můžou se ukázat
    setTimeout(() => { pageReady = true; }, 0);
});


/* =============================================
   QUIZ — Tea Finder  v2.0
   ============================================= */

const QUIZ_QUESTIONS = [
    {   // kdy
        q: "quiz_q1",
        options: [
            { icon: "sunrise",    text: "quiz_q1_o1", tags: ["bold", "caffeine", "@morning"] },
            { icon: "sun",        text: "quiz_q1_o2", tags: ["fresh", "mild", "@afternoon"] },
            { icon: "moon",       text: "quiz_q1_o3", tags: ["herbal", "calm", "@evening"] },
            { icon: "clock",      text: "quiz_q1_o4", tags: ["versatile"] },
        ]
    },
    {   // chuť
        q: "quiz_q2",
        options: [
            { icon: "citrus",     text: "quiz_q2_o1", tags: ["citrus"] },
            { icon: "rose",       text: "quiz_q2_o2", tags: ["floral"] },
            { icon: "cinnamon",   text: "quiz_q2_o3", tags: ["spice"] },
            { icon: "strawberry", text: "quiz_q2_o4", tags: ["fruit"] },
        ]
    },
    {   // kofein
        q: "quiz_q3",
        options: [
            { icon: "bolt",       text: "quiz_q3_o1", tags: ["caffeine"] },
            { icon: "leaf",       text: "quiz_q3_o2", tags: ["mild"] },
            { icon: "daisy",      text: "quiz_q3_o3", tags: ["herbal", "calm"] },
            { icon: "shuffle",    text: "quiz_q3_o4", tags: ["versatile"] },
        ]
    },
    {   // jak ho pije
        q: "quiz_q4",
        options: [
            { icon: "cup",        text: "quiz_q4_o1", tags: ["fresh", "mild"] },
            { icon: "ice",        text: "quiz_q4_o2", tags: ["fruit", "citrus"] },
            { icon: "drop",       text: "quiz_q4_o3", tags: ["bold", "spice"] },
            { icon: "shuffle",    text: "quiz_q4_o4", tags: ["versatile"] },
        ]
    },
    {   // roční období
        q: "quiz_q5",
        options: [
            { icon: "blossom",    text: "quiz_q5_o1", tags: ["floral", "mild"] },
            { icon: "berries",    text: "quiz_q5_o2", tags: ["fruit", "fresh", "@summer"] },
            { icon: "apple",      text: "quiz_q5_o3", tags: ["spice", "fruit"] },
            { icon: "snow",       text: "quiz_q5_o4", tags: ["bold", "caffeine", "@winter"] },
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
    calm:      { cs:'čaj na večer',     en:'an evening tea', sk:'čaj na večer' },
    citrus:    { cs:'citrusy',          en:'citrus', sk:'citrusy' },
    floral:    { cs:'květinové tóny',   en:'floral notes', sk:'kvetinové tóny' },
    fruit:     { cs:'ovoce',            en:'fruit', sk:'ovocie' },
    spice:     { cs:'koření',           en:'spice', sk:'korenie' },
    versatile: { cs:'čaj na každý den', en:'an everyday tea', sk:'čaj na každý deň' },
};
function tQuizTag(tag) {
    const l = QUIZ_TAG_LABEL[tag];
    return l ? (l[LANG] || l.cs) : tag;
}

/* Výsledky kvízu. Složení se bere z hotových směsí v katalogu (podle id),
   tady jsou jen štítky, podle kterých se vybírá. */
/* Štítky hotových směsí pro kvíz. Skóre = kolikrát odpovědi daný štítek
   vybraly, plus bonus, když směs sedí na chvíli dne z 1. otázky (kdy) nebo
   roční období z 5. otázky (@morning…). Rozložení je vyzkoušené na všech
   1024 kombinacích odpovědí: každá směs vyjde aspoň v 16 z nich. */
const QUIZ_MOMENT_BONUS = 1.5;
const QUIZ_BLENDS = [
    { id: 'deep_winter',    tags: ['bold', 'caffeine', 'spice'] },
    { id: 'morning_window', tags: ['fresh', 'mild', 'citrus'] },
    { id: 'still_evening',  tags: ['herbal', 'calm', 'floral'] },
    { id: 'open_air',       tags: ['citrus', 'fresh', 'versatile'] },
    { id: 'late_light',     tags: ['floral', 'mild', 'caffeine'] },
    { id: 'slow_tuesday',   tags: ['fruit', 'spice', 'versatile'] },
    { id: 'sunday_paper',   tags: ['bold', 'caffeine', 'citrus'] },
    { id: 'desk_hours',     tags: ['citrus', 'caffeine', 'fresh'] },
    { id: 'garden_party',   tags: ['floral', 'fruit', 'mild'] },
    { id: 'pink_hour',      tags: ['fruit', 'citrus', 'herbal'] },
    { id: 'after_dinner',   tags: ['herbal', 'fresh', 'calm'] },
    { id: 'quiet_street',   tags: ['calm', 'floral', 'mild'] },
    { id: 'snowed_in',      tags: ['spice', 'herbal', 'calm'] },
    { id: 'mint_condition', tags: ['fresh', 'mild', 'versatile'] },
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
        <div class="quiz-options">
            ${q.options.map(opt => `<button type="button" class="quiz-option" data-tags="${escHtml(opt.tags.join(','))}"><span class="quiz-ico" aria-hidden="true">${IngIcons.svg(opt.icon)}</span><span>${escHtml(t(opt.text))}</span></button>`).join('')}
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

function quizScore(blend) {
    const hits = blend.tags.reduce((sum, tg) => sum + quizAnswerTags.filter(x => x === tg).length, 0);
    const moment = momentOf(blend);
    return hits + (moment && quizAnswerTags.includes('@' + moment) ? QUIZ_MOMENT_BONUS : 0);
}

function renderQuizResult() {
    const body = document.getElementById('quiz-body');
    const scored = quizBlends().map(blend => ({ ...blend, score: quizScore(blend) }))
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
            <figure class="quiz-stage" aria-hidden="true">${pouchHtml({ name: best.name, codes: best.ingredients, parts: best.parts, size: 'pouch--hero', weight: '100 g', band: momentOf(best) })}</figure>
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
    // Adresa se nahradí adresou mixéru, aby obnovení stránky směs nenačetlo znovu.
    withHistory('replace', () => openInMixer(codes, params.get('n') || '', recipeOf(codes, parts, 100).ok ? 4 : 1, parts));
    setTimeout(() => showToast(t('toast_shared_loaded'), '🔗'), 700);
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
    {"id": "spearmint", "code": "Spearmint", "category": "flavor", "name_cs": "Máta kadeřavá", "name_en": "Curly Mint", "desc_cs": "Sladší a jemnější než peprná.", "desc_en": "Sweeter and softer than peppermint.", "emoji": "🌿", "color": "#a8d8a8", "flavor_cs": ["chladivá", "sladká", "jemná"], "flavor_en": ["cool", "sweet", "mild"], "pairs": ["Rooibos", "Green Tea", "Lemon"], "sort": 170, "kind": "herb", "label_cs": "máta kadeřavá (list)", "surcharge_czk": 0, "name_sk": "Mäta kučeravá", "desc_sk": "Sladšia a jemnejšia ako pieporná.", "flavor_sk": ["chladivá", "sladká", "jemná"], "label_sk": "mäta kučeravá (list)"},
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
    {"id": "morning_window", "name": "Morning Window", "emoji": "☀️", "is_preset": true, "sort": 10, "ingredients": ["Green Tea", "Mint", "Lemon"], "parts": [3, 1, 1], "desc_cs": "Zelený čaj s mátou peprnou a citronovou kůrou. Čistý a svěží šálek, který rozjede den.", "desc_en": "Green tea with peppermint and lemon peel. A clean, bright cup that gets the day going.", "desc_sk": "Zelený čaj s mätou piepornou a citrónovou kôrou. Čistá a svieža šálka, ktorá naštartuje deň.", "moment": "morning", "story_cs": "Zelený čaj je sám o sobě trochu travnatý. Máta peprná ho zchladí a citronová kůra mu dodá šťávu, takže chutná jasně i bez cukru.", "story_en": "Green tea on its own is a little grassy. Peppermint cools it down and lemon peel adds brightness, so it tastes lively even without sugar.", "story_sk": "Zelený čaj je sám osebe trochu trávnatý. Mäta pieporná ho schladí a citrónová kôra mu dodá šťavu, takže chutí jasne aj bez cukru.", "tip_cs": "Zalij vodou kolem 80 °C, ne vroucí, jinak zhořkne. Lístky vydrží i druhé zalití.", "tip_en": "Use water around 80 °C, not boiling, or it turns bitter. The leaves are good for a second steep.", "tip_sk": "Zalej vodou okolo 80 °C, nie vriacou, inak zhorkne. Lístky vydržia aj druhé zaliatie."},
    {"id": "still_evening", "name": "Still Evening", "emoji": "🌙", "is_preset": true, "sort": 20, "ingredients": ["Chamomile", "Lemon Balm", "Lavender"], "parts": [2, 2, 1], "desc_cs": "Heřmánek a meduňka se špetkou levandule. Jemný, květinový a bez kofeinu. Na konec dne.", "desc_en": "Chamomile and lemon balm with a pinch of lavender. Gentle, floral and caffeine-free, for the end of the day.", "desc_sk": "Harmanček a medovka so štipkou levandule. Jemný, kvetinový a bez kofeínu. Na koniec dňa.", "moment": "evening", "story_cs": "Heřmánek a meduňka jsou jemné a nasládlé, takže se navzájem nepřekřikují. Levandule je jen špetka: víc by přehlušila všechno ostatní.", "story_en": "Chamomile and lemon balm are both soft and slightly sweet, so neither drowns the other out. The lavender is just a pinch: any more would overpower everything else.", "story_sk": "Rumanček a medovka sú jemné a nasladlé, takže sa navzájom neprekrikujú. Levanduľa je len štipka: viac by prehlušila všetko ostatné.", "tip_cs": "Zalij vroucí vodou a nech louhovat 5–7 minut pod pokličkou, ať vůně neuteče.", "tip_en": "Pour boiling water and steep for 5–7 minutes with a lid on, so the aroma stays in the cup.", "tip_sk": "Zalej vriacou vodou a nechaj lúhovať 5–7 minút pod pokrievkou, aby vôňa neunikla."},
    {"id": "deep_winter", "name": "Deep Winter", "emoji": "❄️", "is_preset": true, "sort": 30, "ingredients": ["Black Tea", "Ginger", "Cinnamon"], "parts": [3, 1, 1], "desc_cs": "Černý čaj se zázvorem a skořicí. Plný a hřejivý, nejlepší s oběma rukama kolem hrnku.", "desc_en": "Black tea with ginger and cinnamon. Full and warming, best with both hands around the mug.", "desc_sk": "Čierny čaj so zázvorom a škoricou. Plný a hrejivý, najlepší, keď držíš hrnček oboma rukami.", "moment": "winter", "story_cs": "Černý čaj je dost silný, aby unesl zázvor i skořici. Zázvor štípne, skořice to zakulatí a dohromady to voní jako vánoční pečení.", "story_en": "Black tea is strong enough to carry both ginger and cinnamon. The ginger bites, the cinnamon rounds it off, and together they smell like Christmas baking.", "story_sk": "Čierny čaj je dosť silný, aby uniesol zázvor aj škoricu. Zázvor štipne, škorica to zaokrúhli a spolu to vonia ako vianočné pečenie.", "tip_cs": "Snese mléko i lžičku medu. Louhuj 4 minuty, ať je dost silný.", "tip_en": "Takes milk and a spoonful of honey well. Steep for 4 minutes so it stays strong.", "tip_sk": "Znesie mlieko aj lyžičku medu. Lúhuj 4 minúty, aby bol dosť silný."},
    {"id": "late_light", "name": "Late Light", "emoji": "🌅", "is_preset": false, "sort": 40, "ingredients": ["Oolong Tea", "Rose", "Lavender"], "parts": [3, 1, 1], "desc_cs": "Oolong s růží a špetkou levandule. Měkký a lehce květinový, na tichou část odpoledne.", "desc_en": "Oolong with rose and a pinch of lavender. Soft and a little floral, for the quiet part of the afternoon.", "desc_sk": "Oolong s ružou a štipkou levandule. Mäkký a trochu kvetinový, na tichú časť popoludnia.", "moment": "afternoon", "story_cs": "Oolong je napůl mezi zeleným a černým čajem: trochu pražený, trochu květinový. Růže tu květinovou stránku vytáhne, levandule ji jen podtrhne.", "story_en": "Oolong sits halfway between green and black tea: a little roasted, a little floral. Rose brings out the floral side and lavender just underlines it.", "story_sk": "Oolong je napoly medzi zeleným a čiernym čajom: trochu pražený, trochu kvetinový. Ruža tú kvetinovú stránku vytiahne, levanduľa ju len podčiarkne.", "tip_cs": "Oolong vydrží dvě až tři zalití. Každé chutná trochu jinak, druhé bývá nejlepší.", "tip_en": "Oolong takes two or three steeps. Each one tastes a bit different, and the second is often the best.", "tip_sk": "Oolong vydrží dve až tri zaliatia. Každé chutí trochu inak, druhé býva najlepšie."},
    {"id": "open_air", "name": "Open Air", "emoji": "🌿", "is_preset": false, "sort": 50, "ingredients": ["Rooibos", "Orange", "Spearmint"], "parts": [3, 1, 1], "desc_cs": "Rooibos s pomerančovou kůrou a mátou kadeřavou. Přirozeně nasládlý a bez kofeinu, dobrý kdykoli.", "desc_en": "Rooibos with orange peel and curly mint. Naturally sweet and caffeine-free, good any time.", "desc_sk": "Rooibos s pomarančovou kôrou a mätou kučeravou. Prirodzene sladký a bez kofeínu, dobrý kedykoľvek.", "moment": "afternoon", "story_cs": "Rooibos je přirozeně nasládlý a nehořkne, ani když ho necháš louhovat dlouho. Pomerančová kůra a máta kadeřavá ho rozjasní, takže není těžký.", "story_en": "Rooibos is naturally sweet and never turns bitter, even if you leave it steeping. Orange peel and curly mint brighten it so it never feels heavy.", "story_sk": "Rooibos je prirodzene nasladlý a nezhorkne, ani keď ho necháš lúhovať dlho. Pomarančová kôra a mäta kučeravá ho rozjasnia, takže nie je ťažký.", "tip_cs": "Dobrý horký i ledový. Na ledový ho zalij vroucí vodou, nech 6 minut louhovat, vychladnout a dej do lednice.", "tip_en": "Good hot or iced. For iced tea, pour boiling water, steep for 6 minutes, let it cool and put it in the fridge.", "tip_sk": "Dobrý horúci aj ľadový. Na ľadový ho zalej vriacou vodou, nechaj 6 minút lúhovať, vychladnúť a daj do chladničky."},
    {"id": "slow_tuesday", "name": "Slow Tuesday", "emoji": "🍎", "is_preset": true, "sort": 60, "ingredients": ["Apple", "Hibiscus", "Rose Hip", "Cinnamon"], "parts": [3, 1, 1, 1], "desc_cs": "Jablko s ibiškem, šípkem a skořicí. Ovocný a hřejivý. Čajový ekvivalent nicnedělání.", "desc_en": "Apple with hibiscus, rose hip and cinnamon. Fruity and warming. The tea equivalent of doing nothing.", "desc_sk": "Jablko s ibištekom, šípkami a škoricou. Ovocný a hrejivý. Čajový ekvivalent ničnerobenia.", "moment": "winter", "story_cs": "Jablko dává sladkost, ibišek a šípek kyselost a rubínovou barvu, skořice teplo. Chutná jako jablečný koláč, jen tekutý.", "story_en": "Apple brings the sweetness, hibiscus and rose hip the tartness and ruby colour, cinnamon the warmth. It tastes like apple pie, only liquid.", "story_sk": "Jablko dáva sladkosť, ibištek a šípka kyslosť a rubínovú farbu, škorica teplo. Chutí ako jablkový koláč, len tekutý.", "tip_cs": "Ovocný čaj potřebuje vroucí vodu a čas: aspoň 8 minut. Krátce louhovaný je vodový.", "tip_en": "Fruit tea needs boiling water and time: at least 8 minutes. Steeped briefly, it tastes watery.", "tip_sk": "Ovocný čaj potrebuje vriacu vodu a čas: aspoň 8 minút. Krátko lúhovaný je vodový."},
    {"id": "sunday_paper", "name": "Sunday Paper", "emoji": "🍊", "is_preset": false, "sort": 70, "ingredients": ["Black Tea", "Orange", "Cardamom"], "parts": [3, 1, 1], "desc_cs": "Černý čaj s pomerančovou kůrou a špetkou kardamomu. Silný, voňavý a pomalý, na snídani, která nikam nespěchá.", "desc_en": "Black tea with orange peel and a pinch of cardamom. Strong, fragrant and unhurried, for a breakfast that is going nowhere.", "desc_sk": "Čierny čaj s pomarančovou kôrou a štipkou kardamónu. Silný, voňavý a pomalý, na raňajky, ktoré nikam neponáhľajú.", "moment": "morning", "story_cs": "Pomeranč a černý čaj jsou klasika. Kardamom je to, čím se tahle směs liší: dá jí vůni, kterou poznáš už při zalévání. Je ho jen špetka, aby nepřebil čaj.", "story_en": "Orange and black tea are a classic. The cardamom is what sets this one apart: a scent you notice as soon as the water hits the leaves. It's only a pinch, so it never overpowers the tea.", "story_sk": "Pomaranč a čierny čaj sú klasika. Kardamón je to, čím sa táto zmes líši: dá jej vôňu, ktorú spoznáš už pri zalievaní. Je ho len štipka, aby neprebil čaj.", "tip_cs": "Louhuj 4 minuty. S kapkou mléka chutná jako snídaňový čaj z kavárny.", "tip_en": "Steep for 4 minutes. With a dash of milk it tastes like a café breakfast tea.", "tip_sk": "Lúhuj 4 minúty. S kvapkou mlieka chutí ako raňajkový čaj z kaviarne."},
    {"id": "desk_hours", "name": "Desk Hours", "emoji": "🍋", "is_preset": false, "sort": 80, "ingredients": ["Green Tea", "Lemongrass", "Ginger"], "parts": [3, 1, 1], "desc_cs": "Zelený čaj s citronovou trávou a zázvorem. Svěží, lehce pikantní, na odpoledne u práce.", "desc_en": "Green tea with lemongrass and ginger. Fresh and lightly spicy, for an afternoon at your desk.", "desc_sk": "Zelený čaj s citrónovou trávou a zázvorom. Svieži, jemne pikantný, na popoludnie pri práci.", "moment": "afternoon", "story_cs": "Citronová tráva voní po citronu, ale nekyselí, takže zelený čaj zůstane jemný. Zázvor mu na konci přidá lehké štípnutí.", "story_en": "Lemongrass smells of lemon without the sourness, so the green tea stays gentle. The ginger adds a light kick at the end.", "story_sk": "Citrónová tráva vonia po citróne, ale nekyslí, takže zelený čaj zostane jemný. Zázvor mu na konci pridá jemné štipnutie.", "tip_cs": "Voda kolem 80 °C a 2–3 minuty. Do velkého hrnku dej dvě lžičky a až dopiješ, zalij je znovu.", "tip_en": "Water around 80 °C, 2–3 minutes. Use two teaspoons for a big mug and top them up again when you finish.", "tip_sk": "Voda okolo 80 °C a 2–3 minúty. Do veľkého hrnčeka daj dve lyžičky a keď dopiješ, zalej ich znova."},
    {"id": "garden_party", "name": "Garden Party", "emoji": "🍓", "is_preset": false, "sort": 90, "ingredients": ["White Tea", "Strawberry", "Rose"], "parts": [3, 1, 1], "desc_cs": "Bílý čaj s jahodou a růží. Jemný, ovocný a voňavý, nejlepší vychlazený.", "desc_en": "White tea with strawberry and rose. Delicate, fruity and fragrant, best served chilled.", "desc_sk": "Biely čaj s jahodou a ružou. Jemný, ovocný a voňavý, najlepší vychladený.", "moment": "summer", "story_cs": "Bílý čaj je ze všech nejjemnější, proto k němu nepatří nic výrazného. Jahoda mu dá sladkost, růže vůni a pořád je cítit čaj.", "story_en": "White tea is the most delicate of all, so nothing loud belongs with it. Strawberry brings sweetness, rose brings scent, and you can still taste the tea.", "story_sk": "Biely čaj je zo všetkých najjemnejší, preto k nemu nepatrí nič výrazné. Jahoda mu dá sladkosť, ruža vôňu a stále je cítiť čaj.", "tip_cs": "Na ledový čaj: zalij vodou o 80 °C, louhuj 3 minuty, nech vychladnout a nalij na led.", "tip_en": "For iced tea: steep in 80 °C water for 3 minutes, let it cool and pour over ice.", "tip_sk": "Na ľadový čaj: zalej vodou s teplotou 80 °C, lúhuj 3 minúty, nechaj vychladnúť a nalej na ľad."},
    {"id": "pink_hour", "name": "Pink Hour", "emoji": "🌺", "is_preset": false, "sort": 100, "ingredients": ["Hibiscus", "Rose Hip", "Strawberry", "Lemon"], "parts": [2, 1, 1, 1], "desc_cs": "Ibišek se šípkem, jahodou a citronovou kůrou. Růžový, nakyslý a bez kofeinu, nejlepší vychlazený.", "desc_en": "Hibiscus with rose hip, strawberry and lemon peel. Pink, tart and caffeine-free, best served chilled.", "desc_sk": "Ibištek so šípkou, jahodou a citrónovou kôrou. Ružový, nakyslý a bez kofeínu, najlepší vychladený.", "moment": "summer", "story_cs": "Ibišek dá barvu a kyselost jako od brusinek, jahoda ji zjemní a citronová kůra osvěží. Vychlazený chutná skoro jako limonáda.", "story_en": "Hibiscus brings colour and a cranberry-like tartness, strawberry softens it and lemon peel freshens it up. Chilled, it tastes almost like lemonade.", "story_sk": "Ibištek dá farbu a kyslosť ako od brusníc, jahoda ju zjemní a citrónová kôra osvieži. Vychladený chutí skoro ako limonáda.", "tip_cs": "Na ledový čaj zalij 2 lžíce půl litrem vroucí vody, louhuj 10 minut, sceď a nech vychladnout. Pak dolij studenou vodou nebo ledem do litru.", "tip_en": "For iced tea, steep 2 tablespoons in half a litre of boiling water for 10 minutes, strain and let it cool. Then top up to a litre with cold water or ice.", "tip_sk": "Na ľadový čaj zalej 2 lyžice pol litrom vriacej vody, lúhuj 10 minút, preceď a nechaj vychladnúť. Potom dolej studenou vodou alebo ľadom do litra."},
    {"id": "after_dinner", "name": "After Dinner", "emoji": "🌱", "is_preset": false, "sort": 110, "ingredients": ["Mint", "Lemon Balm", "Fennel"], "parts": [2, 2, 1], "desc_cs": "Máta peprná s meduňkou a fenyklem. Chladivá, lehce nasládlá a bez kofeinu, na chvíli po večeři.", "desc_en": "Peppermint with lemon balm and fennel. Cooling, lightly sweet and caffeine-free, for the moment after dinner.", "desc_sk": "Mäta pieporná s medovkou a feniklom. Chladivá, jemne nasladlá a bez kofeínu, na chvíľu po večeri.", "moment": "evening", "story_cs": "Máta peprná je výrazná, meduňka ji zjemní citronovou vůní a fenykl přidá nasládlý tón, který připomíná anýz. Kofein v ní není, takže nevadí ani pozdě večer.", "story_en": "Peppermint is bold; lemon balm softens it with a lemony scent and fennel adds a sweet, anise-like note. There's no caffeine, so it's fine even late in the evening.", "story_sk": "Mäta pieporná je výrazná, medovka ju zjemní citrónovou vôňou a fenikel pridá nasladlý tón, ktorý pripomína aníz. Kofeín v nej nie je, takže nevadí ani neskoro večer.", "tip_cs": "Dobrá i ve velké konvici na celý večer: 5 lžiček na litr vroucí vody, 7 minut.", "tip_en": "Good in a big pot for the whole evening: 5 teaspoons per litre of boiling water, 7 minutes.", "tip_sk": "Dobrá aj vo veľkej kanvici na celý večer: 5 lyžičiek na liter vriacej vody, 7 minút."},
    {"id": "quiet_street", "name": "Quiet Street", "emoji": "🌼", "is_preset": false, "sort": 120, "ingredients": ["Linden", "Chamomile", "Lemon"], "parts": [2, 1, 1], "desc_cs": "Lipový květ s heřmánkem a citronovou kůrou. Medově sladký, jemný a bez kofeinu.", "desc_en": "Linden blossom with chamomile and lemon peel. Honey-sweet, gentle and caffeine-free.", "desc_sk": "Lipový kvet s rumančekom a citrónovou kôrou. Medovo sladký, jemný a bez kofeínu.", "moment": "evening", "story_cs": "Lípa voní jako ulice v červnu, když kvete. Heřmánek jí dodá jablečný tón a citronová kůra hlídá, aby nebyla moc sladká.", "story_en": "Linden smells like a street in June when the trees are in bloom. Chamomile adds an apple-like note and lemon peel keeps it from getting too sweet.", "story_sk": "Lipa vonia ako ulica v júni, keď kvitne. Rumanček jej dodá jablkový tón a citrónová kôra stráži, aby nebola príliš sladká.", "tip_cs": "Vroucí voda, 5–7 minut. Lžička medu k ní sedí víc než cukr.", "tip_en": "Boiling water, 5–7 minutes. A spoonful of honey suits it better than sugar.", "tip_sk": "Vriaca voda, 5–7 minút. Lyžička medu k nej sedí viac ako cukor."},
    {"id": "snowed_in", "name": "Snowed In", "emoji": "❄️", "is_preset": false, "sort": 130, "ingredients": ["Rooibos", "Apple", "Cinnamon", "Cardamom"], "parts": [2, 1, 1, 1], "desc_cs": "Rooibos s jablkem, skořicí a špetkou kardamomu. Hřejivý a sladký jako zimní pečení, ale bez kofeinu, takže i večer.", "desc_en": "Rooibos with apple, cinnamon and a pinch of cardamom. Warm and sweet like winter baking, but caffeine-free, so evenings too.", "desc_sk": "Rooibos s jablkom, škoricou a štipkou kardamónu. Hrejivý a sladký ako zimné pečenie, ale bez kofeínu, takže aj večer.", "moment": "winter", "story_cs": "Zimní směs pro ty, kdo nechtějí kofein: místo černého čaje je tu rooibos, který je sám nasládlý. Jablko se skořicí chutná jako štrúdl, kardamom přidá vůni.", "story_en": "A winter blend for anyone skipping caffeine: instead of black tea it uses rooibos, which is naturally sweet. Apple and cinnamon taste like strudel, cardamom adds the scent.", "story_sk": "Zimná zmes pre tých, ktorí nechcú kofeín: namiesto čierneho čaju je tu rooibos, ktorý je sám nasladlý. Jablko so škoricou chutí ako štrúdľa, kardamón pridá vôňu.", "tip_cs": "Vroucí voda a klidně 8 minut, rooibos nezhořkne. S mlékem chutná jako zimní latte.", "tip_en": "Boiling water and up to 8 minutes; rooibos won't turn bitter. With milk it tastes like a winter latte.", "tip_sk": "Vriaca voda a pokojne 8 minút, rooibos nezhorkne. S mliekom chutí ako zimné latte."},
    {"id": "mint_condition", "name": "Mint Condition", "emoji": "🌿", "is_preset": false, "sort": 140, "ingredients": ["Green Tea", "Spearmint", "Mint"], "parts": [3, 1, 1], "desc_cs": "Zelený čaj se dvěma mátami, peprnou a kadeřavou. Svěží a chladivý, horký i s ledem.", "desc_en": "Green tea with two mints, peppermint and curly mint. Fresh and cooling, hot or iced.", "desc_sk": "Zelený čaj s dvoma mätami, piepornou a kučeravou. Svieži a chladivý, horúci aj s ľadom.", "moment": "summer", "story_cs": "Máta peprná chladí, kadeřavá je sladší a měkčí. Spolu chutnají plněji než každá zvlášť, trochu jako marocký mátový čaj.", "story_en": "Peppermint cools, curly mint is sweeter and softer. Together they taste fuller than either alone, a bit like Moroccan mint tea.", "story_sk": "Mäta pieporná chladí, kučeravá je sladšia a mäkšia. Spolu chutia plnšie ako každá zvlášť, trochu ako marocký mätový čaj.", "tip_cs": "Na ledový: zalij vodou o 80 °C, louhuj 3 minuty, nech vychladnout a podávej s ledem a plátkem citronu.", "tip_en": "For iced tea: steep in 80 °C water for 3 minutes, let it cool and serve with ice and a slice of lemon.", "tip_sk": "Na ľadový: zalej vodou s teplotou 80 °C, lúhuj 3 minúty, nechaj vychladnúť a podávaj s ľadom a plátkom citróna."},
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
      desc_cs: 'Chladivý balzám na rty s mátou kadeřavou.', desc_en: 'A cooling lip balm with curly mint.',
      name_sk: 'Mäta', desc_sk: 'Chladivý balzam na pery s mätou kučeravou.' },
];
let catalogCraft = BUILTIN_CRAFT.slice();
let promoBarEnabled = true;

Object.assign(TRANSLATIONS.cs, {
    ing_sold_out:             'Vyprodáno',
    toast_sold_out:           'Tahle surovina je teď vyprodaná',
    err_sold_out_named:       'Teď je vyprodané:',
    stock_note_blend:         'Některá surovina téhle směsi je teď vyprodaná.',
    err_weight_unavailable:   'Tuhle gramáž už neprodáváme. Odeber prosím položku z košíku a vyber jinou.',
    err_invalid_customer:     'Zkontroluj prosím kontaktní údaje a adresu.',
    launch_bar:               'Připravujeme spuštění. Objednávky zatím nepřijímáme, směs si ale můžeš namíchat a uložit.',
    sales_closed_note:        'Objednávky zatím nepřijímáme, prodej teprve chystáme. Košík ti tu zůstane.',
    sales_closed_toast:       'Objednávky zatím nepřijímáme. Prodej brzy spustíme.',
    err_too_many_orders:      'Z tohohle e-mailu přišlo moc objednávek najednou. Zkus to prosím za hodinu.',
    err_pickup_point:         'Vyber prosím výdejní místo Zásilkovny.',
    err_shipping_unavailable: 'Tenhle způsob dopravy teď nenabízíme. Vyber prosím jiný.',
    err_unknown_ingredient:   'Některá surovina v košíku už není v nabídce. Odeber prosím tu položku.',
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
/* Louhování podle hlavní suroviny, která má vlastní teplotu a čas. Když
   žádná nemá (třeba ibišek se šípkem a jahodou), rozhodne druh směsi:
   ovocný a bylinný čaj se zalévá vroucí vodou, ovocný louhuje déle.
   Dřív tu byla napevno příprava černého čaje (90–95 °C), což u ovocné
   směsi nesedělo. */
function brewFor(codes, parts) {
    const r = recipeOf(codes, parts, 100);
    const main = r.rows.slice().sort((a, b) => b.pct - a.pct).map(x => x.code).find(c => BREW[c])
        || (codes || []).find(c => BREW[c]);
    if (BREW[main]) return BREW[main];
    if (r.category === 'fruit') return { temp: '100°C', time: '8–10 min' };
    if (r.category === 'herb') return { temp: '100°C', time: '5–7 min' };
    return { temp: '90–95°C', time: '3–4 min' };
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
/* Chvíle dne u hotové směsi (blends.moment). Barva je pruh nahoře na
   etiketě sáčku: podle něj se směsi z nabídky poznají od vlastních
   a stejnou barvu má tečka u filtru nad směsmi. */
const MOMENTS = ['morning', 'afternoon', 'evening', 'winter', 'summer'];
const MOMENT_COLOR = { morning: '#e0a43a', afternoon: '#7fa65a', evening: '#6c70a6', winter: '#b0553b', summer: '#d4668a' };
const momentOf = b => (b && MOMENTS.includes(b.moment) ? b.moment : '');

/* Výčet se spojkou před poslední položkou: „svěží, zemitá a citrusová“. */
function joinAnd(list) {
    if (list.length < 2) return list[0] || '';
    return list.slice(0, -1).join(', ') + ' ' + t('and_word') + ' ' + list[list.length - 1];
}
/* Je ve směsi kofein? Stačí jedna surovina, která ho má (pravý čaj). */
function blendHasCaffeine(codes) {
    return (codes || []).some(c => ((ingByCode(c) || {}).caffeine || 0) > 0);
}
/* Chuť směsi: přídavná jména surovin z katalogu (svěží, zemitá…). Napřed
   první slovo od každé suroviny v pořadí podle podílu, aby se do tří slov
   dostala i menší surovina (máta v zeleném čaji); zbylá místa doplní další
   slova hlavních surovin. Nic nevymýšlí, jen skládá, co je u surovin napsané. */
function blendTaste(codes, parts, n = 3) {
    const lists = blendComposition(codes, parts).map(c => {
        const ing = ingByCode(c.code);
        return ((ing && ing.flavor) || []).map(w => String(w).trim().toLocaleLowerCase(LOCALE)).filter(Boolean);
    });
    const out = [];
    for (let depth = 0; out.length < n && lists.some(l => l.length > depth); depth++) {
        for (const l of lists) {
            if (out.length < n && l[depth] && !out.includes(l[depth])) out.push(l[depth]);
        }
    }
    return out;
}
/* Jedna věta o směsi: „Chuť: svěží, zemitá a citrusová. Bez kofeinu.“ */
function blendProfileText(codes, parts) {
    const taste = blendTaste(codes, parts);
    if (!taste.length) return '';
    return t('mix_taste').replace('{notes}', joinAnd(taste)) + ' ' + t(blendHasCaffeine(codes) ? 'caf_yes' : 'caf_no') + '.';
}

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
const SELLER = { name: '', ico: '', address: '', email: 'hello@teaseyou.cz', phone: '', iban: '' };
let COD_FEE = 39;                                  // Kč, příplatek za dobírku
// Dárkové balení a osobní odběr se zapínají v administraci (Ceny a doprava).
const GIFT_WRAP = { on: false, price: 0 };
let PICKUP_NOTE = '';
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
    SELLER.iban = window.Bank && Bank.isIban(st.seller_iban || '') ? String(st.seller_iban) : '';
    GIFT_WRAP.on = st.gift_wrap_enabled === true;
    GIFT_WRAP.price = Number.isInteger(st.gift_wrap_czk) && st.gift_wrap_czk >= 0 && st.gift_wrap_czk <= 500 ? st.gift_wrap_czk : 0;
    PICKUP_NOTE = str(st.pickup_note, 200);
    if (Number.isInteger(st.durability_months) && st.durability_months >= 1 && st.durability_months <= 36) {
        DURABILITY_MONTHS = st.durability_months;
    }
    SALES_OPEN = st.sales_open === true;
    SALES_KNOWN = true;
    const opened = st.sales_opened_at ? new Date(st.sales_opened_at) : null;
    SALES_OPENED_AT = opened && !isNaN(opened) ? opened : null;
    const codText = COD_FEE ? ` (+${COD_FEE} Kč)` : '';
    TRANSLATIONS.cs.pay_cod_desc = 'Platíš při převzetí' + codText;
    TRANSLATIONS.sk.pay_cod_desc = 'Platíš pri prevzatí' + codText;
    TRANSLATIONS.en.pay_cod_desc = 'Pay when you collect it' + codText;
    applyCheckoutExtras();
}

/* Dárkové balení a osobní odběr v pokladně podle nastavení obchodu. */
function applyCheckoutExtras() {
    const gift = document.getElementById('gift-block');
    if (gift) {
        gift.hidden = !GIFT_WRAP.on;
        const box = document.getElementById('f-gift');
        if (!GIFT_WRAP.on && box && box.checked) { box.checked = false; syncGiftFields(); }
        const price = document.getElementById('gift-price');
        if (price) price.textContent = GIFT_WRAP.price ? '+' + fmt(GIFT_WRAP.price) : t('gift_free');
    }
    const note = document.getElementById('pickup-note');
    if (note) note.textContent = PICKUP_NOTE || t('ship_pickup_desc');
    const transfer = document.querySelector('#checkout-form input[name="payment"][value="transfer"]')?.closest('.payment-option')?.querySelector('.choice-desc');
    if (transfer) {
        transfer.dataset.i18n = SELLER.iban ? 'pay_transfer_desc_qr' : 'pay_transfer_desc';
        transfer.textContent = t(transfer.dataset.i18n);
    }
    if (document.getElementById('checkout-page')?.classList.contains('active')) refreshCheckoutTotals();
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
        [t('food_prep'), `2–3 g ${t('food_prep_per')} 200 ml, ${fmtTemp(brew.temp)}, ${brew.time}`],
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
    if (typeof renderAboutStage === 'function') renderAboutStage();
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

/* Karta hotové směsi: odkaz na její detail. Stejná na úvodu i pod detailem. */
function blendCardHtml(b) {
    const photo = safePhoto(b.photo_url);
    const visual = photo
        ? `<div class="ready-photo"><img src="${escHtml(photo)}" alt="" loading="lazy" decoding="async"></div>`
        : pouchHtml({ name: b.name, codes: b.ingredients, parts: b.parts, size: 'pouch--sm', band: momentOf(b) });
    const soldOut = outOfStockIn(b.ingredients).length
        ? `<span class="ing-out-badge">${escHtml(t('ing_sold_out'))}</span>` : '';
    const tint = ingColor(b.ingredients[1]) || ingColor(b.ingredients[0]) || '';
    const from = blendPriceFrom(b);
    const caf = blendHasCaffeine(b.ingredients);
    return `<a class="ready-card" href="${escHtml(blendHref(b.id))}" data-blend="${escHtml(b.id)}" data-caf="${caf ? '1' : '0'}" data-moment="${momentOf(b)}">
            <div class="ready-visual" aria-hidden="true"${tint ? ` style="--tint:${escHtml(tint)}"` : ''}>${visual}</div>
            <h3 class="ready-name">${escHtml(b.name)}</h3>
            <p class="ready-mix">${escHtml(blendSubtitle(b.ingredients))}</p>
            <p class="ready-foot"><span class="ready-price">${escHtml(from ? t('price_from_n').replace('{price}', fmt(from)) : t('price_from'))}</span>${caf ? '' : `<span class="ready-tag">${escHtml(t('caf_no'))}</span>`}${soldOut}</p>
        </a>`;
}
function renderBlendCards() {
    const grid = document.querySelector('.shelf .ready-grid');
    if (!grid) return;
    const section = grid.closest('.ready-made-section');
    if (section) section.style.display = catalogBlends.length ? '' : 'none';
    grid.innerHTML = catalogBlends.map(blendCardHtml).join('');
    renderShelfFilter();
}

/* Filtr nad směsmi: všechny, chvíle dne (jen ty, které v nabídce jsou)
   a bez kofeinu. Ukáže se, jen když má z čeho vybírat. */
let shelfFilter = 'all';
function renderShelfFilter() {
    const box = document.getElementById('shelf-filter');
    const cards = [...document.querySelectorAll('.shelf .ready-grid .ready-card')];
    if (!box) return;
    const opts = [['all', t('shelf_all'), '']];
    MOMENTS.forEach(m => { if (cards.some(c => c.dataset.moment === m)) opts.push([m, t('moment_' + m), MOMENT_COLOR[m]]); });
    if (cards.some(c => c.dataset.caf === '1') && cards.some(c => c.dataset.caf === '0')) opts.push(['0', t('caf_no'), '']);
    box.hidden = opts.length < 3;
    if (box.hidden || !opts.some(o => o[0] === shelfFilter)) shelfFilter = 'all';
    box.innerHTML = opts.map(([v, label, color]) =>
        `<button type="button" class="chip${shelfFilter === v ? ' is-on' : ''}" data-shelf-filter="${v}" aria-pressed="${shelfFilter === v}"${color ? ` style="--band:${color}"` : ''}>${escHtml(label)}</button>`).join('');
    cards.forEach(c => {
        c.hidden = shelfFilter !== 'all' && (shelfFilter === '0' ? c.dataset.caf !== '0' : c.dataset.moment !== shelfFilter);
    });
}
document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('[data-shelf-filter]');
    if (!b) return;
    shelfFilter = b.dataset.shelfFilter;
    renderShelfFilter();
    const grid = document.querySelector('.shelf .ready-grid');
    if (grid) grid.scrollLeft = 0;
});

/* Stránka O nás: tři sáčky z nabídky místo fotky. */
function renderAboutStage() {
    const stage = document.getElementById('about-stage');
    if (!stage) return;
    const picks = catalogBlends.slice(0, 3);
    stage.hidden = picks.length < 3;
    stage.innerHTML = picks.map(b => pouchHtml({ name: b.name, codes: b.ingredients, parts: b.parts, size: 'pouch--about', weight: '100 g', band: momentOf(b) })).join('');
}

/* Detail hotové směsi: chvíle dne nad názvem, „Proč to funguje“ a tip
   k přípravě. U vlastní nebo sdílené směsi nic z toho není. */
function renderDetailStory(b) {
    const moment = momentOf(b);
    const chip = document.getElementById('detail-moment');
    if (chip) {
        chip.hidden = !moment;
        chip.textContent = moment ? t('moment_for_' + moment) : '';
        chip.style.setProperty('--band', MOMENT_COLOR[moment] || 'transparent');
    }
    const story = b ? pickLang(b, 'story') : '';
    const box = document.getElementById('detail-story');
    if (box) { box.hidden = !story; document.getElementById('detail-story-text').textContent = story; }
    const tip = b ? pickLang(b, 'tip') : '';
    const tipRow = document.getElementById('detail-tip-row');
    if (tipRow) { tipRow.hidden = !tip; document.getElementById('detail-tip').textContent = tip; }
}

/* Pod detailem směsi: tři další z nabídky, napřed ty na stejnou chvíli dne,
   pak se stejným kofeinem. */
function renderDetailMore(currentId) {
    const sec = document.getElementById('detail-more');
    const grid = document.getElementById('detail-more-grid');
    if (!sec || !grid) return;
    const current = catalogBlends.find(b => b.id === currentId);
    const caf = current ? blendHasCaffeine(current.ingredients) : null;
    const rest = catalogBlends.filter(b => b.id !== currentId)
        .map((b, i) => ({ b, i, same: (momentOf(current) && momentOf(b) === momentOf(current) ? 2 : 0)
            + (caf !== null && blendHasCaffeine(b.ingredients) === caf ? 1 : 0) }))
        .sort((x, y) => (y.same - x.same) || (x.i - y.i)).slice(0, 3).map(x => x.b);
    sec.hidden = !rest.length;
    grid.innerHTML = rest.map(blendCardHtml).join('');
}

function openBlend(id, opts = {}) {
    const b = catalogBlends.find(x => x.id === id);
    if (!b) return;
    const desc = pickLang(b, 'desc');
    const price = unitPrice(b.ingredients, b.parts, 100) || blendPriceFrom(b);
    openDetail(b.name, desc || '', price, b.ingredients.slice(), null, b.parts.slice(), opts);
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
        if (priceEl) priceEl.textContent = s.price ? fmt(s.price) : t('ship_free_short');
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
        renderDetailStory(catalogBlends.find(b => b.name === currentProduct.name));
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
            if (pendingBlendRoute && document.getElementById('home-page')?.classList.contains('active')) {
                const id = pendingBlendRoute;
                pendingBlendRoute = null;
                if (catalogBlends.some(b => b.id === id)) withHistory('replace', () => openBlend(id));
            }
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
const TERMS_VERSION = '2026-11-09';

function buildOrderPayload(form) {
    const val = name => (form.elements[name] ? String(form.elements[name].value || '').trim() : '');
    const ship = form.querySelector('input[name="shipping"]:checked');
    const pay  = form.querySelector('input[name="payment"]:checked');
    // Na výdejní místo adresu nepotřebujeme, tak ji ani neposíláme.
    const needsAddress = !ship || (ship.value !== 'zasilkovna' && ship.value !== 'pickup');
    const gift = document.getElementById('f-gift');
    const wantsGift = GIFT_WRAP.on && !!gift && gift.checked;
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
        gift: wantsGift ? { wrap: true, message: val('giftMessage').slice(0, 300) } : null,
        lang: LANG,
        termsVersion: TERMS_VERSION,
    };
}

const ORDER_ERROR_CODES = new Set(['sales_closed', 'out_of_stock', 'promo_invalid', 'invalid_customer', 'too_many_orders',
    'pickup_point_required', 'invalid_shipping', 'invalid_weight', 'unknown_ingredient', 'gift_unavailable']);

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
        case 'gift_unavailable':      showToast(t('err_gift_unavailable'), '🎁'); refresh(); break;
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
    hero_lede:         'Vyber až pět surovin a poměr, jaký chceš. Směs namícháme až po objednání a pošleme ti ji v sáčku se jménem, které jí dáš.',
    hero_quiz_link:    'Nevíš, co vybrat? Poradí ti kvíz',
    how_result_note:   'Namícháme po objednání, obvykle odešleme do 24 hodin.',
    hero_pick:         'Chci tuhle',
    hero_shuffle:      'Zamíchat jinak',
    hero_note_price:   'Balení od {price}.',
    hero_note_ship:    'Nad {limit} doprava zdarma.',
    how_cta:           'Začít míchat',
    shelf_title:       'Naše směsi',
    shelf_lede:        'Každá má svůj recept, tip na přípravu a chvíli dne, ke které se hodí. Objednej ji, jak je, nebo si ji v mixéru uprav.',
    quizband_title:    'Nevíš, co by ti chutnalo?',
    quizband_text:     'Pět krátkých otázek a doporučíme ti směs podle toho, kdy čaj piješ a jaké chutě máš v oblibě.',
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
    toast_shared_loaded: 'Sdílená směs je načtená.',
    lang_label:        'Jazyk',
    legal_lang_note:   '',
});
Object.assign(TRANSLATIONS.en, {
    hero_title:        'Mix your tea. Name it.',
    hero_lede:         'Pick up to five ingredients and any ratio you like. We blend it after you order and send it in a pouch with the name you give it.',
    hero_quiz_link:    'Not sure what to pick? Take the quiz',
    how_result_note:   'Blended after you order, usually shipped within 24 hours.',
    hero_pick:         'I want this one',
    hero_shuffle:      'Shuffle',
    hero_note_price:   'Packs from {price}.',
    hero_note_ship:    'Free shipping over {limit}.',
    how_cta:           'Start mixing',
    shelf_title:       'Our blends',
    shelf_lede:        'Each one has its own recipe, a brewing tip and a time of day it suits. Order it as it is, or tweak it in the mixer.',
    quizband_title:    'Not sure what you would like?',
    quizband_text:     'Five quick questions and we will suggest a blend based on when you drink tea and which flavours you like.',
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
    toast_shared_loaded: 'Shared blend loaded.',
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
    how_pouch_name:    'Tvoje směs',
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
    saved_empty:       'V mixéru si můžeš každou směs uložit na později.',
    btn_create_first:  'Namíchat směs',
    btn_load_order:    'Objednat',
    orders_lede:       'Objednávky odeslané z tohohle prohlížeče.',
    orders_empty:      'Až něco objednáš, najdeš to tady i s údaji k platbě.',
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
    checkout_legal:    'Odesláním objednávky potvrzuješ, že ses seznámil s <a href="?stranka=obchodni-podminky" data-page="terms-page">obchodními podmínkami</a> a <a href="?stranka=ochrana-udaju" data-page="privacy-page">ochranou osobních údajů</a>.',
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
    ing_page_title:    'Suroviny',
    ing_page_sub:      'Ze všeho tady se dá míchat. U každé suroviny najdeš, jak chutná a s čím si rozumí.',
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
    toast_saved:       '„{name}“ je v Uložených směsích.',
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
    how_pouch_name:    'Your blend',
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
    saved_empty:       'You can save any blend in the mixer for later.',
    btn_create_first:  'Mix a blend',
    btn_load_order:    'Order',
    orders_lede:       'Orders placed from this browser.',
    orders_empty:      'Once you order, you will find it here along with the payment details.',
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
    checkout_legal:    'By placing the order you confirm you have read our <a href="?stranka=obchodni-podminky" data-page="terms-page">terms</a> and <a href="?stranka=ochrana-udaju" data-page="privacy-page">privacy policy</a> (in Czech).',
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
    ing_page_sub:      'Everything here can go into your blend. Each one comes with how it tastes and what it goes well with.',
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
    toast_saved:       '“{name}” is in your saved blends.',
    nav_blends:        'Saved blends',
    nav_quiz:          'Quiz',
});

/* ─── Sáček ─────────────────────────────────── */
/* Kraftový sáček se zipem — tak, jak se čaj opravdu posílá. Na etiketě je
   jméno směsi a její tři ingredience. Obrys a textura jsou v <svg><defs>
   na začátku index.html, tady se na ně jen odkazuje. */
/* Sáček v2: stojací kraftový sáček se zipem, svárem nahoře, otvorem na
   zavěšení a skládaným dnem. Tvar (POUCH_PATH + POUCH_HOLE) je stejný i ve
   výřezu #pouch-clip v index.html – když ho měníš, změň ho na obou místech. */
const POUCH_PATH = 'M16 5H184Q189 5 189 10V21L184.5 26.5L189 32C194 108 197.5 180 195.5 236Q194.5 259 172 262.5Q100 269.5 28 262.5Q5.5 259 4.5 236C2.5 180 6 108 11 32L15.5 26.5L11 21V10Q11 5 16 5Z';
const POUCH_HOLE = 'M91 14.2h18a4.3 4.3 0 0 1 0 8.600H91a4.300 4.300 0 0 1 0-8.600Z';
const POUCH_SVG = `<svg class="pouch-bag" viewBox="0 0 200 270" preserveAspectRatio="none" focusable="false" aria-hidden="true">
    <path d="${POUCH_PATH}${POUCH_HOLE}" fill-rule="evenodd" fill="url(#kraft-fill)"/>
    <g clip-path="url(#pouch-clip)">
        <rect width="200" height="270" fill="url(#kraft-light)"/>
        <rect width="200" height="270" filter="url(#kraft-grain)" opacity=".38"/>
        <rect y="5" width="200" height="28.500" fill="url(#kraft-crimp)"/>
        <rect y="5" width="200" height="28.500" fill="#5a3d1c" fill-opacity=".06"/>
        <rect y="33.200" width="200" height="1.300" fill="#000" fill-opacity=".17"/>
        <rect y="34.500" width="200" height="1" fill="#fff" fill-opacity=".24"/>
        <rect y="45" width="200" height="2.600" fill="#000" fill-opacity=".18"/>
        <rect y="47.600" width="200" height="1.400" fill="#fff" fill-opacity=".3"/>
        <rect y="52" width="200" height="1" fill="#000" fill-opacity=".07"/>
        <path d="M38 62C33 122 36 186 31 238" stroke="#fff" stroke-opacity=".2" stroke-width="9" fill="none" stroke-linecap="round"/>
        <path d="M164 68C169 130 164 192 168 236" stroke="#000" stroke-opacity=".07" stroke-width="11" fill="none" stroke-linecap="round"/>
        <path d="M0 237Q100 253 200 237V270H0Z" fill="url(#kraft-gusset)"/>
        <path d="M4 237.500Q100 253 196 237.500" stroke="#000" stroke-opacity=".2" stroke-width="1.400" fill="none"/>
        <path d="M4 239.200Q100 254.700 196 239.200" stroke="#fff" stroke-opacity=".22" stroke-width="1" fill="none"/>
        <rect width="200" height="270" fill="url(#kraft-edge)"/>
    </g>
    <path d="${POUCH_HOLE}" fill="none" stroke="#000" stroke-opacity=".28" stroke-width="1"/>
</svg>`;
const LAYER_LABELS = ['glass_label_base', 'glass_label_flavor', 'glass_label_extras'];

/* Sáček s etiketou: jméno, suroviny s podílem (od největšího) a gramáž. */
function pouchHtml({ name = '', codes = [], parts = null, size = '', placeholders = false, weight = '', band = '' } = {}) {
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
    const shown = name || t('glass_name_default');
    // Dlouhé jméno dostane menší písmo, ať se na etiketu vejde celé (nic se neuřezává).
    const longest = Math.max(...shown.split(/\s+/).map(w => w.length));
    const fit = shown.length > 22 || longest > 12 ? ' is-xl-name' : (shown.length > 13 || longest > 9 ? ' is-long-name' : '');
    const bandColor = MOMENT_COLOR[band] || '';
    return `<div class="pouch ${size}">${POUCH_SVG}<div class="pouch-label${dotCodes.length > 3 ? ' is-long' : ''}${fit}${bandColor ? ' has-band' : ''}">`
        + (bandColor ? `<span class="pouch-band" style="--band:${bandColor}"></span>` : '')
        + `<span class="pouch-brand">Tease you</span>`
        + `<span class="pouch-name${name ? '' : ' is-empty'}">${escHtml(shown)}</span>`
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
    box.innerHTML = pouchHtml({ name: b.name, codes: b.ingredients, parts: b.parts, size: 'pouch--hero', weight, band: momentOf(b) });
    if (animate && !reduceMotion()) {
        box.classList.remove('is-swapping');
        void box.offsetWidth;
        box.classList.add('is-swapping');
    }
    const mix = document.getElementById('hero-mix');
    if (mix) mix.textContent = blendSubtitle(b.ingredients);
    const open = document.getElementById('hero-open');
    if (open) { open.dataset.blend = b.id; open.setAttribute('href', blendHref(b.id)); }
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
            const profile = blendProfileText(codes, parts);
            verdict.innerHTML = `<strong>${escHtml(legal)}.</strong> `
                + (profile ? `<span class="mix-taste">${escHtml(profile)}</span> ` : '')
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
    // Mixér se překresluje i na pozadí (třeba když se dotáhne katalog).
    // Na otevřeném detailu hotové směsi nesmí přepsat currentProduct, jinak
    // by sáček ukázal „Moje směs“ a do košíku by nešlo nic. Při přechodu
    // do mixéru se updateMixerUI volá znovu a směs se z mixéru sestaví.
    if (!document.getElementById('product-detail-page')?.classList.contains('active')) mixerSyncProduct();
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

/* Adresy stránek, osobní odběr, dárek, QR platba, objednat znovu. */
Object.assign(TRANSLATIONS.cs, {
    title_mixer:          'Namíchej si čaj',
    ship_pickup_name:     'Osobní odběr',
    ship_pickup_desc:     'Karlovy Vary, ozveme se, až bude připravená',
    address_not_needed_pickup: 'Při osobním odběru adresu nepotřebujeme, stačí vybrat zemi.',
    pay_on_pickup:        'Zaplatit při převzetí',
    pay_on_pickup_desc:   'Hotově při předání, bez příplatku',
    pay_transfer_desc_qr: 'Číslo účtu a QR kód ukážeme hned po objednání',
    gift_title:           'Zabalit jako dárek',
    gift_desc:            'Zabalíme do dárkového papíru a do balíčku nedáme doklad s cenou. Ten ti pošleme e-mailem.',
    gift_message:         'Vzkaz na kartičku',
    gift_message_ph:      'Všechno nejlepší, Jano!',
    gift_row:             'Dárkové balení',
    gift_free:            'Zdarma',
    err_gift_unavailable: 'Dárkové balení teď nenabízíme. Zruš ho a zkus to znovu.',
    pay_box_title:        'Údaje k platbě',
    pay_account:          'Číslo účtu',
    pay_amount:           'Částka',
    pay_vs:               'Variabilní symbol',
    pay_qr_label:         'QR kód pro platbu',
    pay_qr_caption:       'Naskenuj v aplikaci své banky',
    pay_box_note:         'Zaplať prosím do 7 dnů. Směs odešleme, jakmile platba dorazí. Údaje najdeš i v Moje objednávky.',
    reorder_btn:          'Objednat znovu',
    reorder_done:         'Je to v košíku, s dnešní cenou.',
    reorder_none:         'Z téhle objednávky už nejde nic objednat. Suroviny nebo velikosti se mezitím změnily.',
    reviews_title:        'Co říkají zákazníci',
    reviews_title_blend:  'Hodnocení',
    reviews_note:         'Recenze píšou jen zákazníci, kteří u nás nakoupili: ověřujeme je číslem objednávky a e-mailem z ní a hodnotit jde až po odeslání. Zveřejňujeme kladné i kritické, nezveřejníme jen vulgární, nesouvisející nebo s cizími osobními údaji. Za recenze nic nedáváme.',
    reviews_of5:          'z 5',
    reviews_n_one:        'hodnocení',
    reviews_n_few:        'hodnocení',
    reviews_n_many:       'hodnocení',
    reviews_stars:        '{n} z 5 hvězdiček',
    reviews_reply:        'Odpověď Tease you:',
    review_btn:           'Ohodnotit',
    review_legend:        'Jak ti chutnalo?',
    review_star_n:        '{n} z 5',
    review_body:          'Co bys řekl(a) ostatním?',
    review_author:        'Podpis, který uvidí ostatní',
    review_author_ph:     'Jana K.',
    review_email:         'E-mail z objednávky',
    review_email_hint:    'Ověříme jím nákup. Nezveřejníme ho ani neuložíme.',
    review_consent:       'Souhlasím se zveřejněním recenze pod tímto podpisem.',
    review_send:          'Odeslat hodnocení',
    review_thanks:        'Díky! Recenzi zveřejníme, jakmile ji zkontrolujeme.',
    review_err_rating:    'Vyber počet hvězdiček.',
    review_err_author:    'Napiš podpis, aspoň 2 znaky.',
    review_err_email:     'Zadej e-mail, na který přišla objednávka.',
    review_err_consent:   'Bez souhlasu recenzi zveřejnit nemůžeme.',
    review_err_not_found: 'Číslo objednávky a e-mail k sobě nesedí. Zadej e-mail z objednávky.',
    review_err_too_early: 'Hodnotit jde, až ti směs odešleme.',
    review_err_exists:    'Tahle objednávka už hodnocení má.',
    review_err_other:     'Teď se to nepovedlo uložit. Zkus to prosím později.',
});
Object.assign(TRANSLATIONS.en, {
    title_mixer:          'Mix your own tea',
    ship_pickup_name:     'Personal pick-up',
    ship_pickup_desc:     'Karlovy Vary, we will let you know when it is ready',
    address_not_needed_pickup: 'For personal pick-up we do not need your address, just choose the country.',
    pay_on_pickup:        'Pay on pick-up',
    pay_on_pickup_desc:   'Cash when you collect it, no extra fee',
    pay_transfer_desc_qr: 'We show the account number and a QR code right after you order',
    gift_title:           'Wrap it as a gift',
    gift_desc:            'We wrap it in gift paper and leave the receipt with the price out of the parcel. We e-mail it to you instead.',
    gift_message:         'Message for the card',
    gift_message_ph:      'Happy birthday, Jana!',
    gift_row:             'Gift wrapping',
    gift_free:            'Free',
    err_gift_unavailable: 'We do not offer gift wrapping right now. Untick it and try again.',
    pay_box_title:        'Payment details',
    pay_account:          'Account number',
    pay_amount:           'Amount',
    pay_vs:               'Variable symbol',
    pay_qr_label:         'QR code for the payment',
    pay_qr_caption:       'Scan it in your banking app (Czech banks)',
    pay_box_note:         'Please pay within 7 days. We ship the blend as soon as the payment arrives. You can find the details in My orders too.',
    reorder_btn:          'Order again',
    reorder_done:         'It is in your cart, at today\'s price.',
    reorder_none:         'Nothing from this order can be ordered any more. Ingredients or sizes have changed.',
    reviews_title:        'What customers say',
    reviews_title_blend:  'Reviews',
    reviews_note:         'Only customers who bought from us can write a review: we verify it with the order number and the order e-mail, and you can review only after we ship. We publish positive and critical reviews alike and leave out only vulgar or unrelated ones, or ones with other people\'s personal data. We give nothing in return for reviews.',
    reviews_of5:          'out of 5',
    reviews_n_one:        'review',
    reviews_n_few:        'reviews',
    reviews_n_many:       'reviews',
    reviews_stars:        '{n} out of 5 stars',
    reviews_reply:        'Reply from Tease you:',
    review_btn:           'Write a review',
    review_legend:        'How did you like it?',
    review_star_n:        '{n} out of 5',
    review_body:          'What would you tell others?',
    review_author:        'Name others will see',
    review_author_ph:     'Jana K.',
    review_email:         'E-mail from the order',
    review_email_hint:    'We use it to verify the purchase. We do not publish or store it.',
    review_consent:       'I agree to publishing the review under this name.',
    review_send:          'Send review',
    review_thanks:        'Thank you! We will publish the review once we have checked it.',
    review_err_rating:    'Choose the number of stars.',
    review_err_author:    'Write a name, at least 2 characters.',
    review_err_email:     'Enter the e-mail the order was sent to.',
    review_err_consent:   'We cannot publish the review without your consent.',
    review_err_not_found: 'The order number and e-mail do not match. Enter the e-mail from the order.',
    review_err_too_early: 'You can review once we have shipped the blend.',
    review_err_exists:    'This order already has a review.',
    review_err_other:     'We could not save it right now. Please try again later.',
});

/* ─── Texty přidané při úpravách webu (listopad 2026) ─── */
Object.assign(TRANSLATIONS.cs, {
    orders_empty_title:  'Zatím žádná objednávka',
    saved_empty_title:   'Zatím žádná uložená směs',
    toast_promo:         'Kód {code} je použitý.',
    share_text:          'Mrkni na můj čaj „{name}“: {ings}. Namíchaný na Tease you.',
    reorder_some_one:    'V košíku. {n} položka už nejde objednat (vyprodaná surovina nebo velikost).',
    reorder_some_few:    'V košíku. {n} položky už nejdou objednat (vyprodaná surovina nebo velikost).',
    reorder_some_many:   'V košíku. {n} položek už nejde objednat (vyprodaná surovina nebo velikost).',
    caf_yes:             'S kofeinem',
    caf_no:              'Bez kofeinu',
    shelf_filter_aria:   'Které směsi ukázat',
    shelf_all:           'Všechny',
    mix_taste:           'Chuť: {notes}.',
    detail_more:         'Další směsi',
    ing_jump_aria:       'Skupiny surovin',
    and_word:            'a',
});
Object.assign(TRANSLATIONS.en, {
    orders_empty_title:  'No orders yet',
    saved_empty_title:   'No saved blends yet',
    toast_promo:         'Code {code} applied.',
    share_text:          'Have a look at my tea “{name}”: {ings}. Mixed on Tease you.',
    reorder_some_one:    'In your cart. {n} item can no longer be ordered (sold-out ingredient or size).',
    reorder_some_few:    'In your cart. {n} items can no longer be ordered (sold-out ingredient or size).',
    reorder_some_many:   'In your cart. {n} items can no longer be ordered (sold-out ingredient or size).',
    caf_yes:             'With caffeine',
    caf_no:              'Caffeine-free',
    shelf_filter_aria:   'Which blends to show',
    shelf_all:           'All',
    mix_taste:           'Taste: {notes}.',
    detail_more:         'More blends',
    ing_jump_aria:       'Ingredient groups',
    and_word:            'and',
});

/* ─── Texty přidané při úpravách webu (listopad 2026) ─── */
Object.assign(TRANSLATIONS.cs, {
    moment_morning:        'Ráno',
    moment_afternoon:      'Odpoledne',
    moment_evening:        'Večer',
    moment_winter:         'Zima',
    moment_summer:         'Léto',
    moment_for_morning:    'Na ráno',
    moment_for_afternoon:  'Na odpoledne',
    moment_for_evening:    'Na večer',
    moment_for_winter:     'Na zimu',
    moment_for_summer:     'Na léto',
    detail_story_title:    'Proč to funguje',
    brew_tip:              'Tip',
});
Object.assign(TRANSLATIONS.en, {
    moment_morning:        'Morning',
    moment_afternoon:      'Afternoon',
    moment_evening:        'Evening',
    moment_winter:         'Winter',
    moment_summer:         'Summer',
    moment_for_morning:    'For mornings',
    moment_for_afternoon:  'For afternoons',
    moment_for_evening:    'For evenings',
    moment_for_winter:     'For winter',
    moment_for_summer:     'For summer',
    detail_story_title:    'Why it works',
    brew_tip:              'Tip',
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
        ${craftIngsHtml(p.ingredients || []) ? `<div class="craft-ings"><span>${escHtml(t('craft_like_tea'))}</span><ul>${craftIngsHtml(p.ingredients)}</ul></div>` : ''}
        <div class="craft-notify">
            <button type="button" class="btn btn-quiet craft-notify-btn" aria-expanded="false" aria-controls="craft-form-${id}"${done ? ' hidden' : ''}>${escHtml(t('craft_notify'))}</button>
            <form class="craft-form" id="craft-form-${id}" novalidate hidden>
                <label class="visually-hidden" for="craft-email-${id}">E-mail</label>
                <div class="craft-form-row">
                    <input type="email" id="craft-email-${id}" class="field" placeholder="tvuj@email.cz" autocomplete="email" inputmode="email" required>
                    <button type="submit" class="btn btn-primary">${escHtml(t('craft_send'))}</button>
                </div>
                <p class="field-error" role="alert"></p>
                <p class="craft-form-note">${escHtml(t('craft_form_note'))} <a href="?stranka=ochrana-udaju" data-page="privacy-page">${escHtml(t('craft_privacy_link'))}</a></p>
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
