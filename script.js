/* =============================================
   TEASE YOU — script.js  v2.0
   ============================================= */

/* ─── LANGUAGE DETECTION ─────────────────────── */
const LANG = navigator.language.startsWith('cs') ? 'cs' : 'en';

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
        btn_how_works:      'How it works ↓',
        /* Quiz strip */
        quiz_strip_text:    'Not sure where to start?',
        btn_quiz:           'Take the Tea Finder Quiz →',
        /* Stats */
        stat_bases:         'Tea bases',
        stat_flavors:       'Flavors',
        stat_extras:        'Extras',
        stat_blends:        'Unique blends',
        stat_recipe:        'Dispatch',
        /* How it works */
        how_title:          'How it works',
        how_1_title:        'Pick your base',
        how_1_desc:         'Choose from six tea bases — green, black, white, oolong, rooibos or chamomile. Each has a different character.',
        how_2_title:        'Add flavors',
        how_2_desc:         'Pick a fruit, flower or spice that sounds good to you. This is the part where it gets personal.',
        how_3_title:        'We ship it fresh',
        how_3_desc:         'We mix your blend the day you order it and send it straight to you. No warehouse, no shelf time.',
        /* FAQ */
        faq_title:          'Frequently asked',
        faq_q1:             'How long does delivery take?',
        faq_a1:             'We blend your order the same day and ship within 24 hours. Czech Republic: 2–3 business days via Zásilkovna or Česká pošta. Slovakia: 3–5 business days.',
        faq_q2:             'What are the allergens?',
        faq_a2:             'All our blends are naturally free of gluten, dairy and nuts. We do handle nut-adjacent spices (cardamom, cinnamon) in our facility. If you have a severe allergy, please contact us before ordering. All ingredients are 100% natural with no artificial flavourings.',
        faq_q3:             'Can I return or exchange an order?',
        faq_a3:             'Because every blend is made to order, we cannot accept returns for custom blends. If your order arrives damaged or incorrect, we will reship at no charge. Contact us within 7 days of delivery.',
        faq_q4:             'How do I brew my blend?',
        faq_a4:             'Use 2–3 grams per 200ml of water. Green and white teas: 75–80°C for 2–3 minutes. Black and oolong: 90–95°C for 3–4 minutes. Herbal (rooibos, chamomile): 100°C for 5–7 minutes. Each package includes a brewing guide card.',
        faq_q5:             'Can I send a blend as a gift?',
        faq_a5:             'Absolutely — it\'s one of our most popular uses! During checkout, add a personal message in the note field and we\'ll include a handwritten card. We also offer gift wrapping on request.',
        faq_q6:             'How long does the tea stay fresh?',
        faq_a6:             'All our blends are packed in resealable, food-grade kraft pouches with an airtight seal. Stored in a cool, dry place away from direct light, your blend will stay fresh for 12–18 months.',
        /* CTA banner */
        cta_title:          'Start with what sounds good.',
        cta_desc:           'Pick a base, add what you like, name it.',
        btn_start_creating: 'Start creating →',
        /* Product detail page */
        btn_add_cart:       'Add to Cart',
        btn_customize:      'Customize Recipe',
        back_to_blends:     '← Back to blends',
        lbl_select_weight:  'Select weight',
        /* Configurator */
        back_btn:           '← Back',
        config_title:       'Build your blend',
        config_subtitle:    'Pick one from each category',
        prog_base:          'Base',
        prog_flavor:        'Flavor',
        prog_extras:        'Extras',
        prog_name:          'Name',
        section_base:       '1. Base',
        section_flavor:     '2. Flavor',
        section_extras:     '3. Extras',
        section_name:       '4. Name your mix',
        info_default_title: 'Select a base',
        info_default_text:  'Choose your preferred tea base to start.',
        name_placeholder:   'e.g. Slow Tuesday',
        name_hint:          'Give it a name you\'ll remember ✨',
        btn_preview:        'Preview my blend →',
        btn_surprise:       'Surprise me',
        /* Glass panel */
        glass_title:        'Your blend',
        glass_label_base:   'Base',
        glass_label_flavor: 'Flavor',
        glass_label_extras: 'Extras',
        glass_name_default: 'Name your mix',
        /* Summary page */
        summary_badge:      'Your blend',
        summary_inside:     'What\'s inside',
        summary_weight:     'Choose weight to order',
        btn_edit_recipe:    'Edit Recipe',
        btn_save:           'Save',
        btn_share:          'Share',
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
        order_status:       'Confirmed',
        order_discount:     'Discount',
        order_shipping:     'Shipping',
        order_total:        'Total',
        /* Cart */
        cart_title:         'Your Cart',
        cart_col_product:   'Product',
        cart_col_price:     'Price',
        cart_col_qty:       'Quantity',
        cart_col_subtotal:  'Subtotal',
        cart_empty_title:   'Your cart is empty',
        cart_empty:         'Your cart is empty.',
        btn_start_shopping: 'Start shopping',
        btn_browse_blends:  'Browse blends',
        btn_continue:       '← Continue shopping',
        lbl_promo:          'Discount code',
        btn_apply:          'Apply',
        lbl_subtotal:       'Subtotal',
        ship_calculated:    '+ Shipping: calculated at checkout',
        ship_free:          '+ Shipping: FREE',
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
        note_placeholder:   'Any special requests or gift messages...',
        btn_complete_order: 'Complete Order',
        /* Success page */
        success_title:      'Order placed!',
        success_desc:       'Your blend is on its way. We\'ll brew it fresh and send a confirmation to your email.',
        success_step1:      'Order received',
        success_step2:      'Freshly blended',
        success_step3:      'Shipped to you',
        btn_create_another: 'Create another blend',
        /* Modal */
        modal_qty_title:    'Select Quantity',
        btn_confirm:        'Confirm',
        btn_cancel:         'Cancel',
        /* Cookie */
        cookie_title:       'We use cookies',
        cookie_text:        'We use cookies to improve your experience and remember your preferences. By continuing you agree to our',
        cookie_policy_link: 'Cookie Policy',
        btn_decline:        'Decline',
        btn_accept:         'Accept all',
        /* Footer */
        footer_nav:         'Navigation',
        footer_legal:       'Legal',
        footer_contact:     'Contact',
        footer_newsletter:  'Newsletter',
        footer_newsletter_desc: 'New blends, offers and tea stories — straight to your inbox.',
        footer_subscribe:   'Subscribe',
        footer_copyright:   '© 2025 Tease you. All rights reserved.',
        /* Promo feedback */
        promo_cart_first:   'Add something to your cart first.',
        promo_invalid:      'Invalid code.',
        promo_applied:      'Code applied',
        /* Free shipping bar */
        freeship_add:       'Add',
        freeship_more:      'more for free shipping',
        freeship_unlocked:  'You\'ve unlocked <strong>free shipping</strong>!',
        /* Toast / system messages */
        toast_already_saved:    'Blend already saved!',
        toast_saved:            'saved to My Blends!',
        toast_copied:           'Blend description copied!',
        toast_removed:          'Blend removed',
        toast_added_cart:       'added to cart!',
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
        quiz_q3_o1:     'Give me all of it',
        quiz_q3_o2:     'A little is fine',
        quiz_q3_o3:     'None please — herbal only',
        quiz_q3_o4:     'Don\'t mind either way',
        quiz_q4:        'Pick your brewing mood:',
        quiz_q4_o1:     'Quick — under 3 minutes',
        quiz_q4_o2:     'Slow & mindful — I\'ll wait',
        quiz_q4_o3:     'Strong steep, big flavour',
        quiz_q4_o4:     'Surprise me every time',
        quiz_question_of: 'Question',
        quiz_of:        'of',
        quiz_result_label: 'Your perfect blend is',
        btn_order_blend: 'Order this blend',
        btn_try_again:   'Try again',
        btn_back_home:   'Back home',
        /* Completion label */
        completion_selected: 'selected',
        /* About page */
        about_tag:           'Our Story',
        about_hero_title:    'Tea is personal.',
        about_hero_subtitle: 'Not some brand\'s version. Yours.',
        about_story_p1:      'Tease you started with a school thesis. The founder spent months studying tea house culture, going from one tea house to the next, and thinking about what makes a good cup worth going back to.',
        about_story_p2:      'That turned into this — a place where you choose every part of your blend yourself. No brand deciding for you. Just your base, your flavour, your name.',
        about_callout_text:  'Every order is mixed on the day it\'s placed. Not before.',
        about_card1_title:   'Fresh every time',
        about_card1_desc:    'We blend when you order. Not pre-packed, not sitting on a shelf — made the day it ships.',
        about_card2_title:   'Your recipe',
        about_card2_desc:    'The configurator is the whole point. Pick your base, your flavour, your extra. Name it. That\'s your tea.',
        about_card3_title:   'Real ingredients',
        about_card3_desc:    'No artificial flavours, no fillers. Six bases, nine flavours, nine extras — all real, all listed.',
        about_cta:           'Ready to find your blend?',
        btn_start_creating2: 'Start creating',
        /* SEO */
        page_title:  'Tease you — Build your perfect tea blend',
        meta_desc:   'Create your own custom tea blend from 6 premium bases, 9 flavors and 9 extras. Named, packed and shipped fresh to your door. Free shipping over 500 Kč.',
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
        /* UI labels */
        lbl_signature_blends: 'Signature Blends',
        lbl_signature_blend:  'Signature Blend',
        lbl_brewing_guide:    'Brewing guide',
        lbl_per_200ml:        'per 200ml',
        lbl_water_temp:       'water temp',
        lbl_steep_time:       'steep time',
        footer_tagline:       'Handcrafted blends,<br>made just for you.',
        footer_made_with:     'Made with 🍵 in Czech Republic',
        footer_terms:         'Terms & Conditions',
        footer_privacy:       'Privacy Policy',
        footer_gdpr:          'GDPR',
        footer_cookies:       'Cookie Policy',
        btn_clear:          '\u2715 Clear',
        blend_sub_1:        'Green tea, Mint & Lemon',
        blend_sub_2:        'White tea, Strawberry & Honey',
        blend_sub_3:        'Black tea, Ginger & Vanilla',
        blend_sub_4:        'Oolong, Rose & Lavender',
        blend_sub_5:        'Rooibos, Orange & Spearmint',
        blend_sub_6:        'Chamomile, Turmeric & Cinnamon',
        social_coming_soon:   'Not on social media yet — coming soon!',
        /* Packeta widget */
        packeta_choose:     'Choose pickup point',
        packeta_change:     'Change branch',
        packeta_required:   'Please choose a pickup point',
        packeta_unavailable:'Widget not available — try again',
        /* Promo bar */
        promo_text:  '🍵 Free shipping on orders over 500 Kč · Use code FIRSTBLEND for 10% off your first order',
        /* Bottom nav */
        nav_quiz_short: 'Quiz',
        /* Ingredients encyclopedia */
        nav_ingredients: 'Ingredients',
        ing_page_title: 'Ingredient Guide',
        ing_page_sub: 'Everything in our palette — and why.',
        ing_cat_bases: 'Tea Bases',
        ing_cat_flavors: 'Flavors',
        ing_cat_extras: 'Extras',
        ing_health: 'Benefits',
        ing_pairs: 'Pairs well with',
        back_btn_text: 'Back',
        /* Process page */
        nav_process: 'How we do it',
        process_tag: 'From field to cup',
        process_title: 'How we do it',
        process_sub: 'Every order is unique. No warehouses, no batches. Just freshly mixed tea, prepared exactly for you.',
        proc_1_title: 'Ingredient sourcing',
        proc_1_desc: 'We work exclusively with certified suppliers of tea leaves and herbs. Each batch of ingredients undergoes sensory inspection — colour, aroma, taste.',
        proc_2_title: 'Precise weighing',
        proc_2_desc: 'Each component of your blend is weighed on a precision digital scale. Ratios are designed so no flavour dominates — unless you explicitly want it to.',
        proc_3_title: 'Blending',
        proc_3_desc: 'Components are gently hand-mixed for even distribution without damaging the leaves. Then the blend rests briefly to let aromas meld.',
        proc_4_title: 'Packaging',
        proc_4_desc: 'We pack in hermetically sealable kraft pouches that preserve freshness for 12–18 months. Each pouch carries your blend name and ingredients.',
        proc_5_title: 'Dispatch',
        proc_5_desc: 'Parcels are sent via Zásilkovna or Česká pošta, typically within 24 hours. You receive a tracking number by email.',
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
        btn_how_works:      'Jak to funguje ↓',
        /* Quiz strip */
        quiz_strip_text:    'Nevíš, kde začít?',
        btn_quiz:           'Spusť kvíz pro hledání blendu →',
        /* Stats */
        stat_bases:         'Základy čaje',
        stat_flavors:       'Příchutě',
        stat_extras:        'Doplňky',
        stat_blends:        'Unikátních blendů',
        stat_recipe:        'Expedice',
        /* How it works */
        how_title:          'Jak to funguje',
        how_1_title:        'Vyber základ',
        how_1_desc:         'Vyber ze šesti základů čaje — zelený, černý, bílý, oolong, rooibos nebo heřmánek. Každý má jiný charakter.',
        how_2_title:        'Přidej příchutě',
        how_2_desc:         'Vyber ovoce, květ nebo koření, které ti říká. Tady to začne být osobní.',
        how_3_title:        'Čerstvě odešleme',
        how_3_desc:         'Blend smícháme ve stejný den, kdy objednáváš, a pošleme přímo k tobě. Žádný sklad, žádné čekání na polici.',
        /* FAQ */
        faq_title:          'Časté otázky',
        faq_q1:             'Jak dlouho trvá doručení?',
        faq_a1:             'Blend smícháme ve stejný den a expedujeme do 24 hodin. Česká republika: 2–3 pracovní dny přes Zásilkovnu nebo Českou poštu. Slovensko: 3–5 pracovních dní.',
        faq_q2:             'Jaké jsou alergeny?',
        faq_a2:             'Všechny naše blendy jsou přirozeně bez lepku, mléčných výrobků a ořechů. V naší provozovně manipulujeme s kořením příbuzným ořechům (kardamom, skořice). Pokud máš silnou alergii, kontaktuj nás před objednávkou. Všechny ingredience jsou 100% přírodní bez umělých aromatizátorů.',
        faq_q3:             'Mohu vrátit nebo vyměnit objednávku?',
        faq_a3:             'Protože každý blend připravujeme na objednávku, nemůžeme přijímat vrácení u vlastních blendů. Pokud objednávka dorazí poškozená nebo nesprávná, zašleme ji znovu zdarma. Kontaktuj nás do 7 dnů od doručení.',
        faq_q4:             'Jak připravit svůj blend?',
        faq_a4:             'Použij 2–3 gramy na 200 ml vody. Zelené a bílé čaje: 75–80 °C po dobu 2–3 minut. Černý čaj a oolong: 90–95 °C po dobu 3–4 minut. Bylinkové čaje (rooibos, heřmánek): 100 °C po dobu 5–7 minut. Každé balení obsahuje kartičku s návodem na přípravu.',
        faq_q5:             'Mohu blend poslat jako dárek?',
        faq_a5:             'Rozhodně — je to jedno z nejoblíbenějších použití! Při objednávce přidej osobní zprávu do pole pro poznámky a my přiložíme ručně psanou kartičku. Na vyžádání nabízíme také dárkové balení.',
        faq_q6:             'Jak dlouho čaj vydrží čerstvý?',
        faq_a6:             'Všechny naše blendy jsou zabaleny v opakovaně uzavíratelných, potravinářských kraft sáčcích se vzduchotěsným uzávěrem. Uskladněny na chladném, suchém místě mimo přímé světlo vydrží čerstvé 12–18 měsíců.',
        /* CTA banner */
        cta_title:          'Začni s tím, co ti zní dobře.',
        cta_desc:           'Vyber základ, přidej co chceš, pojmenuj to.',
        btn_start_creating: 'Začít vytvářet →',
        /* Product detail page */
        btn_add_cart:       'Přidat do košíku',
        btn_customize:      'Upravit recept',
        back_to_blends:     '← Zpět na blendy',
        lbl_select_weight:  'Vyber gramáž',
        /* Configurator */
        back_btn:           '← Zpět',
        config_title:       'Namíchej svůj blend',
        config_subtitle:    'Zvol po jednom z každé kategorie',
        prog_base:          'Základ',
        prog_flavor:        'Příchuť',
        prog_extras:        'Doplňky',
        prog_name:          'Název',
        section_base:       '1. Základ',
        section_flavor:     '2. Příchuť',
        section_extras:     '3. Doplňky',
        section_name:       '4. Pojmenuj svůj mix',
        info_default_title: 'Zvol základ',
        info_default_text:  'Vyber svůj oblíbený základ čaje pro začátek.',
        name_placeholder:   'Např. Pomalé úterý',
        name_hint:          'Dej mu jméno, které si zapamatuješ ✨',
        btn_preview:        'Náhled mého blendu →',
        btn_surprise:       'Překvap mě',
        /* Glass panel */
        glass_title:        'Tvůj blend',
        glass_label_base:   'Základ',
        glass_label_flavor: 'Příchuť',
        glass_label_extras: 'Doplňky',
        glass_name_default: 'Pojmenuj svůj mix',
        /* Summary page */
        summary_badge:      'Tvůj blend',
        summary_inside:     'Co je uvnitř',
        summary_weight:     'Zvol gramáž k objednání',
        btn_edit_recipe:    'Upravit recept',
        btn_save:           'Uložit',
        btn_share:          'Sdílet',
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
        order_status:       'Potvrzeno',
        order_discount:     'Sleva',
        order_shipping:     'Doprava',
        order_total:        'Celkem',
        /* Cart */
        cart_title:         'Tvůj košík',
        cart_col_product:   'Produkt',
        cart_col_price:     'Cena',
        cart_col_qty:       'Množství',
        cart_col_subtotal:  'Mezisoučet',
        cart_empty_title:   'Košík je prázdný',
        cart_empty:         'Tvůj košík je prázdný.',
        btn_start_shopping: 'Začít nakupovat',
        btn_browse_blends:  'Prohlédnout blendy',
        btn_continue:       '← Pokračovat v nákupu',
        lbl_promo:          'Slevový kód',
        btn_apply:          'Použít',
        lbl_subtotal:       'Mezisoučet',
        ship_calculated:    '+ Doprava: bude vypočtena při pokladně',
        ship_free:          '+ Doprava: ZDARMA',
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
        note_placeholder:   'Speciální přání nebo dárkové zprávy...',
        btn_complete_order: 'Dokončit objednávku',
        /* Success page */
        success_title:      'Objednávka odeslána!',
        success_desc:       'Tvůj blend je na cestě. Čerstvě ho namícháme a potvrzení pošleme na tvůj e-mail.',
        success_step1:      'Objednávka přijata',
        success_step2:      'Čerstvě namícháno',
        success_step3:      'Odesláno k tobě',
        btn_create_another: 'Vytvořit další blend',
        /* Modal */
        modal_qty_title:    'Vyber gramáž',
        btn_confirm:        'Potvrdit',
        btn_cancel:         'Zrušit',
        /* Cookie */
        cookie_title:       'Používáme cookies',
        cookie_text:        'Používáme cookies ke zlepšení vašeho zážitku a zapamatování preferencí. Pokračováním souhlasíte s naší',
        cookie_policy_link: 'Cookie Policy',
        btn_decline:        'Odmítnout',
        btn_accept:         'Přijmout vše',
        /* Footer */
        footer_nav:         'Navigace',
        footer_legal:       'Právní info',
        footer_contact:     'Kontakt',
        footer_newsletter:  'Newsletter',
        footer_newsletter_desc: 'Nové blendy, nabídky a čajové příběhy — přímo do tvé schránky.',
        footer_subscribe:   'Odebírat',
        footer_copyright:   '© 2025 Tease you. Všechna práva vyhrazena.',
        /* Promo feedback */
        promo_cart_first:   'Nejdřív přidej něco do košíku.',
        promo_invalid:      'Neplatný kód.',
        promo_applied:      'Kód použit',
        /* Free shipping bar */
        freeship_add:       'Přidej',
        freeship_more:      'ještě pro dopravu zdarma',
        freeship_unlocked:  'Odemkl/a jsi <strong>dopravu zdarma</strong>! 🎉',
        /* Toast / system messages */
        toast_already_saved:    'Blend je již uložen!',
        toast_saved:            'uložen do Moje blendy!',
        toast_copied:           'Popis blendu zkopírován!',
        toast_removed:          'Blend odstraněn',
        toast_added_cart:       'přidán do košíku!',
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
        quiz_q2_o1:     'Svěží & citrusová',
        quiz_q2_o2:     'Květinová & jemná',
        quiz_q2_o3:     'Teplá & kořeněná',
        quiz_q2_o4:     'Sladká & ovocná',
        quiz_q3:        'Jak se stavíš ke kofeinu?',
        quiz_q3_o1:     'Dejte mi všechen',
        quiz_q3_o2:     'Trochu nevadí',
        quiz_q3_o3:     'Žádný prosím — jen bylinky',
        quiz_q3_o4:     'Je mi to jedno',
        quiz_q4:        'Vyber svoji náladou při přípravě:',
        quiz_q4_o1:     'Rychle — do 3 minut',
        quiz_q4_o2:     'Pomalu & vědomě — počkám',
        quiz_q4_o3:     'Silný louh, velká chuť',
        quiz_q4_o4:     'Pokaždé mě překvap',
        quiz_question_of: 'Otázka',
        quiz_of:        'z',
        quiz_result_label: 'Tvůj ideální blend je',
        btn_order_blend: 'Objednat tento blend',
        btn_try_again:   'Zkusit znovu',
        btn_back_home:   'Zpět domů',
        /* Completion label */
        completion_selected: 'vybráno',
        /* About page */
        about_tag:           'Náš příběh',
        about_hero_title:    'Čaj je osobní.',
        about_hero_subtitle: 'Ne to, co si o čaji myslí někdo jiný. Ten tvůj.',
        about_story_p1:      'Tease you vzniklo kvůli maturitní práci. Zakladatel strávil měsíce studováním kultury čajoven, přecházel z jedné do druhé a přemýšlel, co dělá dobrý šálek takovým, ke kterému se vrátíš.',
        about_story_p2:      'Z toho vzniklo toto — místo, kde si každou část svého blendu vybereš sám. Žádná značka nerozhoduje za tebe. Jen tvůj základ, tvá příchuť, tvůj název.',
        about_callout_text:  'Každá objednávka se míchá v den, kdy ji zadáš. Ne dřív.',
        about_card1_title:   'Vždy čerstvé',
        about_card1_desc:    'Mícháme, když objednáváš. Nepředbaleno, neležící na polici — připraveno v den odeslání.',
        about_card2_title:   'Tvůj recept',
        about_card2_desc:    'Konfigurátor je celý smysl. Vyber základ, příchuť, doplněk. Pojmenuj to. To je tvůj čaj.',
        about_card3_title:   'Skutečné ingredience',
        about_card3_desc:    'Žádné umělé aromatizátory, žádná plnidla. Šest základů, devět příchutí, devět doplňků — všechno skutečné, vše uvedené.',
        about_cta:           'Připraven/a najít svůj blend?',
        btn_start_creating2: 'Začít vytvářet',
        /* SEO */
        page_title:  'Tease you — Namíchej si vlastní čajový blend',
        meta_desc:   'Namíchej si vlastní čaj ze 6 základů, 9 příchutí a 9 doplňků. Pojmenuj ho, my ho čerstvě zabalíme a doručíme. Doprava zdarma nad 500 Kč.',
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
        /* UI popisky */
        lbl_signature_blends: 'Signature Blendy',
        lbl_signature_blend:  'Signature Blend',
        lbl_brewing_guide:    'Jak připravit',
        lbl_per_200ml:        'na 200ml',
        lbl_water_temp:       'teplota vody',
        lbl_steep_time:       'doba louhování',
        footer_tagline:       'Čaje na míru,<br>jen pro tebe.',
        footer_made_with:     'Vyrobeno s 🍵 v České republice',
        footer_terms:         'Obchodní podmínky',
        footer_privacy:       'Ochrana osobních údajů',
        footer_gdpr:          'GDPR',
        footer_cookies:       'Cookie Policy',
        btn_clear:          '\u2715 Vymazat',
        blend_sub_1:        'Zelen\u00fd \u010daj, m\u00e1ta a citron',
        blend_sub_2:        'B\u00edl\u00fd \u010daj, jahoda a med',
        blend_sub_3:        '\u010cern\u00fd \u010daj, z\u00e1zvor a vanilka',
        blend_sub_4:        'Oolong, r\u016f\u017ee a levandule',
        blend_sub_5:        'Rooibos, pomeran\u010d a m\u00e1ta',
        blend_sub_6:        'He\u0159m\u00e1nek, kurkuma a sko\u0159ice',
        social_coming_soon:   'Na sociálních sítích zatím nejsme — brzy!',
        /* Packeta widget */
        packeta_choose:     'Vybrat výdejní místo',
        packeta_change:     'Změnit pobočku',
        packeta_required:   'Prosím vyberte výdejní místo',
        packeta_unavailable:'Widget není dostupný — zkuste to znovu',
        /* Promo bar */
        promo_text:  '🍵 Doprava zdarma při objednávce nad 500 Kč · Použij kód FIRSTBLEND a získej 10 % slevy na první nákup',
        /* Bottom nav */
        nav_quiz_short: 'Quiz',
        /* Ingredients encyclopedia */
        nav_ingredients: 'Ingredience',
        ing_page_title: 'Průvodce ingrediencemi',
        ing_page_sub: 'Vše co jsme přidali do naší palety — a proč.',
        ing_cat_bases: 'Čajové základy',
        ing_cat_flavors: 'Příchutě',
        ing_cat_extras: 'Doplňky',
        ing_health: 'Přínosy',
        ing_pairs: 'Hodí se s',
        back_btn_text: 'Zpět',
        /* Process page */
        nav_process: 'Jak to děláme',
        process_tag: 'Od políčka do šálku',
        process_title: 'Jak to děláme',
        process_sub: 'Každá objednávka je unikátní. Žádné sklady, žádné šarže. Jen čerstvě namíchaný čaj, připravený přesně pro tebe.',
        proc_1_title: 'Výběr surovin',
        proc_1_desc: 'Pracujeme výhradně s certifikovanými dodavateli čajových listů a bylinek. Každá šarže surovin prochází smyslovou kontrolou — barva, vůně, chuť.',
        proc_2_title: 'Přesné vážení',
        proc_2_desc: 'Každou složku tvého blendu vážíme na přesné digitální váze. Poměry jsou navrženy tak, aby žádná příchuť nedominovala — pokud si to výslovně nepřeješ.',
        proc_3_title: 'Namíchání',
        proc_3_desc: 'Složky šetrně ručně mícháme, aby se rovnoměrně prolnuly bez poškození listů. Pak necháme blend chvíli odpočinout, aby vůně splynuly.',
        proc_4_title: 'Balení',
        proc_4_desc: 'Balíme do hermeticky uzavíratelných kraft sáčků, které zachovávají čerstvost 12–18 měsíců. Na každém sáčku je tvoje jméno blendu a složení.',
        proc_5_title: 'Odeslání',
        proc_5_desc: 'Balíky odesíláme přes Zásilkovnu nebo Českou poštu zpravidla do 24 hodin. Dostaneš sledovací číslo emailem.',
        process_cta_title: 'Připraven/a namíchat svůj blend?',
    }
};

/* ─── TRANSLATION HELPER ─────────────────────── */
function t(key) {
    return LANG === 'cs'
        ? (TRANSLATIONS.cs[key] !== undefined ? TRANSLATIONS.cs[key] : key)
        : (TRANSLATIONS.en[key] !== undefined ? TRANSLATIONS.en[key] : key);
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
    // Sync <html lang> with the detected language
    document.documentElement.lang = LANG;
    // Update <title> and <meta name="description"> based on detected language
    document.title = t('page_title');
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', t('meta_desc'));
}

/* ─── ZÁSILKOVNA / PACKETA ───────────────────── */
// Get your API key at https://app.packeta.com → Integrace → Widget
const PACKETA_API_KEY = 'YOUR_PACKETA_API_KEY';
let packetaPoint = null;

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

/* ─── PAYMENT GATEWAY (replace with real credentials) ─────────────── */
const PAYMENT_GATEWAY = 'none'; // 'gopay' | 'comgate' | 'none' (test mode)
const GOPAY_GOID = 'YOUR_GOPAY_GOID';
const COMGATE_MERCHANT = 'YOUR_COMGATE_MERCHANT';
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
    if (pageId === 'saved-page')        renderSavedBlends();
    if (pageId === 'orders-page')       renderOrders();
    if (pageId === 'home-page')         setTimeout(initReveal, 50);
    if (pageId === 'quiz-page')         setTimeout(startQuiz, 0);
    if (pageId === 'ingredients-page')  renderIngredientEncyclopedia();
    // Update bottom nav active state
    document.querySelectorAll('.bottom-nav-item').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.page === pageId);
    });
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
    const localDesc = LANG === 'cs' && BLEND_DESCS_CS[name] ? BLEND_DESCS_CS[name] : desc;
    document.getElementById('detail-desc').innerText = localDesc;
    document.getElementById('detail-ingredients-list').innerText = ingredients.map(tIng).join(' • ');
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
    const totals = computeTotals(cost);
    const row = document.getElementById('checkout-shipping-row');
    const costEl = document.getElementById('checkout-shipping-cost');
    const totalEl = document.getElementById('checkout-total-display');
    if (row) row.style.display = 'flex';
    if (costEl) costEl.textContent = totals.freeShip ? 'FREE' : fmt(totals.ship);
    if (totalEl) totalEl.textContent = fmt(totals.total);
}

function handleShippingChange(radio) {
    updateShippingCost(radio);
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

function openPacketaWidget() {
    if (typeof Packeta === 'undefined' || !Packeta.Widget) {
        showToast(t('packeta_unavailable'), '⚠️');
        return;
    }
    Packeta.Widget.pick(PACKETA_API_KEY, onPacketaSelect, {
        country: 'cz',
        language: LANG === 'cs' ? 'cs' : 'en'
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
function applyPromo() {
    const input = document.getElementById('promo-input');
    const code  = (input?.value || '').trim().toUpperCase();
    if (!code) { setPromoFeedback('', false); return; }
    if (cart.length === 0) { setPromoFeedback(t('promo_cart_first'), false); return; }
    const promo = PROMOS[code];
    if (!promo) {
        appliedPromo = null;
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
        if (text) text.innerHTML = '🎉 ' + t('freeship_unlocked');
        wrap.classList.add('unlocked');
    } else {
        if (text) text.innerHTML = `${t('freeship_add')} <strong>${fmt(FREE_SHIP_THRESHOLD - goods)}</strong> ${t('freeship_more')}`;
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
function fillGlassPart(partId) {
    const part = document.getElementById(partId);
    if (!part) return;
    part.classList.remove('part-fill');
    void part.offsetWidth;
    part.classList.add('part-fill');
}

/* ─── UPDATE GLASS LABELS ────────────────────── */
function updateGlassLabels() {
    const defaults = { 1: t('glass_label_base'), 2: t('glass_label_flavor'), 3: t('glass_label_extras') };
    ['part1','part2','part3'].forEach((partId, i) => {
        const idx = i + 1;
        const sel = document.querySelector(`[data-target="${partId}"].selected`);
        const dot  = document.getElementById(`label-dot-${idx}`);
        const text = document.getElementById(`label-text-${idx}`);
        if (!dot || !text) return;
        if (sel) {
            dot.style.background = sel.getAttribute('data-color');
            text.textContent = t(sel.getAttribute('data-i18n') || '') || sel.getAttribute('data-name');
        } else {
            dot.style.background = 'var(--color-border)';
            text.textContent = defaults[idx];
        }
    });
    const nameEl  = document.getElementById('glass-mix-name-display');
    const nameVal = document.getElementById('mix-name')?.value?.trim();
    if (nameEl) {
        nameEl.textContent = nameVal || t('glass_name_default');
        nameEl.classList.toggle('has-name', !!nameVal);
    }
}

/* ─── INFO PANEL ─────────────────────────────── */
function showIngInfo(name) {
    const allIng = [...ING_DATA.bases, ...ING_DATA.flavors, ...ING_DATA.extras];
    const keyMap = Object.fromEntries(Object.entries(ING_KEYS).map(([n,k]) => [n, k]));
    const key = keyMap[name];
    const data = allIng.find(i => i.key === key);
    const def = document.getElementById('info-default-state');
    const rich = document.getElementById('info-rich');
    if (!data || !rich) return;
    const caffeineLabelsCs = ['Bez kofeinu','Velmi nízký','Nízký','Střední','Vysoký','Velmi vysoký'];
    const caffeineLabelsEn = ['Caffeine-free','Very low','Low','Medium','High','Very high'];
    document.getElementById('info-rich-emoji').textContent = data.emoji;
    document.getElementById('info-rich-name').textContent = t(data.key);
    document.getElementById('info-rich-desc').textContent = t(data.key + '_desc') || '';
    if (data.caffeine !== undefined) {
        const lvl = Math.min(data.caffeine, 4);
        const label = LANG === 'cs' ? caffeineLabelsCs[data.caffeine] : caffeineLabelsEn[data.caffeine];
        document.getElementById('info-rich-caffeine').innerHTML =
            `<span class="ing-caffeine-dots">${'●'.repeat(lvl)}${'○'.repeat(4 - lvl)}</span> ${label}`;
        document.getElementById('info-rich-caffeine').style.display = '';
    } else {
        document.getElementById('info-rich-caffeine').style.display = 'none';
    }
    document.getElementById('info-rich-tags').innerHTML = data.flavor.map(f => `<span class="ing-tag">${f}</span>`).join('');
    const healthLabel = LANG === 'cs' ? 'Přínosy' : 'Benefits';
    const pairsLabel  = LANG === 'cs' ? 'Hodí se s' : 'Pairs well with';
    document.getElementById('info-rich-health').innerHTML = `<strong>${healthLabel}:</strong> ${data.health.join(' · ')}`;
    document.getElementById('info-rich-pairs').innerHTML  = `<strong>${pairsLabel}:</strong> ${data.pairs.join(', ')}`;
    if (def) def.style.display = 'none';
    rich.style.display = '';
}
function resetIngInfo() {
    const def = document.getElementById('info-default-state');
    const rich = document.getElementById('info-rich');
    if (def) def.style.display = '';
    if (rich) rich.style.display = 'none';
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
        fillGlassPart(targetId);
        fillGlassPart(targetId);
        animateGlass('main-glass-frame');
        const idx = parseInt(targetId.replace('part','')) - 1;
        currentProduct.colors[idx]      = color;
        currentProduct.ingredients[idx] = name;
        showIngInfo(name);
        validateSelection();
        updateGlassLabels();
    }

    const clearBtn = e.target.closest('.clear-btn[data-target]');
    if (clearBtn) {
        const tid = clearBtn.getAttribute('data-target');
        document.getElementById(tid).style.backgroundColor = 'transparent';
        fillGlassPart(tid);
        animateGlass('main-glass-frame');
        clearBtn.closest('.selection-group').querySelectorAll('.ingredient-btn').forEach(b => b.classList.remove('selected'));
        const idx = parseInt(tid.replace('part','')) - 1;
        currentProduct.colors[idx]      = 'transparent';
        currentProduct.ingredients[idx] = 'Empty';
        resetIngInfo();
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
    if (label) label.textContent = `${count} / 3 ${t('completion_selected')}`;
}

/* ─── VALIDATION ─────────────────────────────── */
function renderSelectedIngPanel() {
    const panel = document.getElementById('selected-ing-panel');
    if (!panel) return;
    const allIng = [...ING_DATA.bases, ...ING_DATA.flavors, ...ING_DATA.extras];
    const slots = [
        { partId: 'part1', label: t('glass_label_base') },
        { partId: 'part2', label: t('glass_label_flavor') },
        { partId: 'part3', label: t('glass_label_extras') },
    ];
    const cards = slots.map(({ partId, label }) => {
        const btn = document.querySelector(`.ingredient-btn[data-target="${partId}"].selected`);
        if (!btn) return '';
        const name = btn.getAttribute('data-name');
        const key = ING_KEYS[name];
        const data = allIng.find(i => i.key === key);
        if (!data) return '';
        const caffeineLabels = LANG === 'cs'
            ? ['Bez kofeinu','Velmi nízký','Nízký','Střední','Vysoký','Velmi vysoký']
            : ['Caffeine-free','Very low','Low','Medium','High','Very high'];
        const caffeine = data.caffeine !== undefined
            ? `<div class="sip-caffeine"><span class="sip-dots">${'●'.repeat(Math.min(data.caffeine,4))}${'○'.repeat(4-Math.min(data.caffeine,4))}</span> ${caffeineLabels[data.caffeine]}</div>`
            : '';
        const tags = data.flavor.slice(0,3).map(f => `<span class="ing-tag">${f}</span>`).join('');
        const pairsLabel = LANG === 'cs' ? 'Hodí se s' : 'Pairs well with';
        return `<div class="sip-card">
            <div class="sip-card-header">
                <span class="sip-emoji">${data.emoji}</span>
                <div>
                    <div class="sip-slot-label">${label}</div>
                    <div class="sip-name">${t(data.key)}</div>
                </div>
            </div>
            <p class="sip-desc">${t(data.key + '_desc') || ''}</p>
            ${caffeine}
            <div class="ing-card-tags">${tags}</div>
            <div class="sip-pairs">${pairsLabel}: ${data.pairs.slice(0,3).join(', ')}</div>
        </div>`;
    }).filter(Boolean);
    panel.innerHTML = cards.length
        ? `<div class="sip-title">${LANG === 'cs' ? 'Tvoje složení' : 'Your selection'}</div>${cards.join('')}`
        : '';
}

function validateSelection() {
    const ok = ['part1','part2','part3'].every(p => document.querySelector(`[data-target="${p}"].selected`));
    const btn = document.getElementById('save-mix-btn');
    btn.disabled = !ok;
    btn.classList.toggle('disabled', !ok);
    updateProgress();
    updateCompletion();
    renderSelectedIngPanel();
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
        chip.innerHTML = `<div class="summary-chip-dot" style="background:${currentProduct.colors[i]}"></div><span>${tIng(name)}</span>`;
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
    if (exists) { showToast(t('toast_already_saved'), '📌'); return; }
    savedBlends.unshift(blend);
    if (savedBlends.length > 20) savedBlends.pop(); // max 20
    localStorage.setItem('teaseyou_saved', JSON.stringify(savedBlends));
    showToast(`"${blend.name}" ${t('toast_saved')}`, '📌');
}

/* ─── SHARE BLEND ────────────────────────────── */
function shareBlend() {
    const text = `Check out my tea blend "${currentProduct.name}" — ${currentProduct.ingredients.filter(i=>i!=='Empty').join(', ')} — made on Tease you 🍵 teaseyou.cz`;
    if (navigator.share) {
        navigator.share({ title: 'My tea blend', text });
    } else {
        navigator.clipboard.writeText(text).then(() => showToast(t('toast_copied'), '📋'));
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
                <p class="saved-card-ingredients font-chaos">${escHtml(blend.ingredients.filter(i=>i!=='Empty').map(tIng).join(' · '))}</p>
                <span class="saved-card-date">${t('saved_date_prefix')} ${escHtml(blend.savedAt)}</span>
            </div>
            <div class="saved-card-actions">
                <button class="btn btn-secondary" onclick="loadSavedBlend(${blend.id})">${t('btn_load_order')}</button>
                <button class="clear-btn" onclick="deleteSavedBlend(${blend.id})" style="color:var(--color-ink-faint)">${t('btn_remove')}</button>
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
    showToast(t('toast_removed'), '🗑️');
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
    showToast(`${currentProduct.name} ${t('toast_added_cart')}`, '🍵');

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
}

/* ─── RENDER CART ────────────────────────────── */
function renderCart() {
    const list  = document.getElementById('cart-items-list');
    const empty = document.getElementById('cart-empty');
    list.innerHTML = '';
    if (cart.length === 0) {
        empty.style.display = 'flex';
        document.getElementById('cart-final-total').innerText = t('order_total') + ': 0 Kč';
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
                    <p class="font-chaos cart-item-ingredients">${escHtml(item.ingredients.map(tIng).join(' \u2022 '))}</p>
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
    const totals = computeTotals(0);
    const sub = document.getElementById('cart-subtotal');
    if (sub) sub.textContent = fmt(totals.goods);

    const dl = document.getElementById('cart-discount-line');
    if (dl) {
        if (appliedPromo && totals.discount > 0) {
            dl.style.display = 'flex';
            document.getElementById('cart-discount-code').textContent = '(' + appliedPromo.code + ')';
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

    document.getElementById('cart-final-total').innerText = `${t('order_total')}: ${fmt(totals.total)}`;
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
                    <p class="checkout-item-meta">${escHtml(item.weight)} · ${LANG === 'cs' ? item.qty + ' ks' : 'qty ' + item.qty}</p>
                </div>
            </div>
            <span class="checkout-item-price">${fmt(item.priceBase * item.qty)}</span>
        `;
        el.appendChild(row);
    });

    const totals = computeTotals(0);

    // Discount line (insert/update before the total)
    let discRow = document.getElementById('checkout-discount-row');
    if (appliedPromo && totals.discount > 0) {
        if (!discRow) {
            discRow = document.createElement('div');
            discRow.id = 'checkout-discount-row';
            discRow.className = 'checkout-shipping-row checkout-discount-row';
            el.parentElement.insertBefore(discRow, document.getElementById('checkout-shipping-row'));
        }
        discRow.innerHTML = `<span>${t('order_discount')} (${escHtml(appliedPromo.code)})</span><span>-${fmt(totals.discount)}</span>`;
        discRow.style.display = 'flex';
    } else if (discRow) {
        discRow.style.display = 'none';
    }

    document.getElementById('checkout-total-display').textContent = fmt(totals.total);
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
        const valid = test(field.value);
        setFieldError(field, valid ? '' : msg);
        if (!valid) { ok = false; if (!firstInvalid) firstInvalid = field; }
    });
    const ship = form.querySelector('input[name="shipping"]:checked');
    if (!ship) { ok = false; showToast(t('toast_select_shipping'), '🚚'); }
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
    const FORMSPREE_ID = 'YOUR_FORM_ID';
    const form = e.target;
    if (cart.length === 0) { showToast(t('toast_cart_empty'), '🛒'); return; }
    if (!validateCheckout(form)) { showToast(t('toast_check_fields'), '⚠️'); return; }

    const shipRadio = form.querySelector('input[name="shipping"]:checked');
    const shipPrice = shipRadio ? parseFloat(shipRadio.getAttribute('data-price')) || 0 : 0;
    const totals = computeTotals(shipPrice);
    const orderNum = 'TY-' + Date.now().toString(36).toUpperCase().slice(-6);

    const order = {
        num:      orderNum,
        date:     new Date().toLocaleDateString('cs-CZ'),
        items:    cart.map(i => ({ name: i.name, ingredients: [...i.ingredients], colors: [...i.colors], weight: i.weight, priceBase: i.priceBase, qty: i.qty })),
        goods:       totals.goods,
        discount:    totals.discount,
        promo:       appliedPromo ? appliedPromo.code : null,
        shipping:    totals.ship,
        total:       totals.total,
        packetaPoint: packetaPoint ? `${packetaPoint.name}, ${packetaPoint.city}` : null
    };

    if (FORMSPREE_ID !== 'YOUR_FORM_ID') {
        const fd = new FormData(form);
        fd.append('_subject', `Nová objednávka ${orderNum} — Tease you`);
        fd.append('order_json', JSON.stringify(order, null, 2));
        fetch(`https://formspree.io/f/${FORMSPREE_ID}`, { method: 'POST', body: fd, headers: { Accept: 'application/json' } })
            .catch(() => {}); // fire-and-forget, don't block UX
    }

    orders.unshift(order);
    if (orders.length > 50) orders.pop();
    localStorage.setItem('teaseyou_orders', JSON.stringify(orders));

    const el = document.getElementById('success-order-num');
    if (el) el.textContent = t('order_num_prefix') + orderNum;

    cart = [];
    appliedPromo = null;
    packetaPoint  = null;
    saveCart();
    savePromo();
    updateCartBadge();
    if (PAYMENT_GATEWAY === 'gopay') {
        showToast('Přesměrování na GoPay platební bránu...', '💳');
        // TODO: call your backend /api/gopay/create-payment with orderPayload
        // backend returns { gw_url } → window.location.href = gw_url;
        return;
    }
    if (PAYMENT_GATEWAY === 'comgate') {
        showToast('Přesměrování na Comgate platební bránu...', '💳');
        // TODO: call your backend /api/comgate/create-payment with orderPayload
        // backend returns { redirect } → window.location.href = redirect;
        return;
    }
    showPage('success-page');
    launchConfetti();
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
                    <span class="order-num font-cosmico">${t('order_num_prefix')}${escHtml(o.num)}</span>
                    <span class="order-date">${escHtml(o.date)}</span>
                </div>
                <span class="order-status">${t('order_status')}</span>
            </div>
            <div class="order-items">${itemsHtml}</div>
            <div class="order-card-foot">
                ${o.discount ? `<span class="order-discount">${t('order_discount')}${o.promo ? ' (' + escHtml(o.promo) + ')' : ''}: -${fmt(o.discount)}</span>` : ''}
                <span class="order-ship">${t('order_shipping')}: ${o.shipping ? fmt(o.shipping) : 'FREE'}</span>
                <span class="order-total">${t('order_total')}: ${fmt(o.total)}</span>
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

/* ─── INGREDIENT ENCYCLOPEDIA DATA ──────────────── */
const ING_DATA = {
    bases: [
        { key: 'ing_green_tea',  emoji: '🍃', caffeine: 2, flavor: ['earthy','fresh','grassy'],    health: ['Antioxidants','Focus','Metabolism'], pairs: ['Mint','Lemon','Ginger'] },
        { key: 'ing_black_tea',  emoji: '🖤', caffeine: 4, flavor: ['bold','malty','robust'],       health: ['Energy','Heart health','Gut health'], pairs: ['Vanilla','Ginger','Cinnamon'] },
        { key: 'ing_white_tea',  emoji: '🤍', caffeine: 1, flavor: ['delicate','sweet','floral'],   health: ['Antioxidants','Skin','Anti-aging'], pairs: ['Rose','Strawberry','Honey'] },
        { key: 'ing_oolong',     emoji: '🍵', caffeine: 3, flavor: ['complex','floral','toasty'],   health: ['Weight mgmt','Digestion','Focus'], pairs: ['Rose','Lavender','Honey'] },
        { key: 'ing_rooibos',    emoji: '🌿', caffeine: 0, flavor: ['earthy','sweet','nutty'],      health: ['Caffeine-free','Iron-rich','Relaxing'], pairs: ['Orange','Cinnamon','Vanilla'] },
        { key: 'ing_chamomile',  emoji: '🌼', caffeine: 0, flavor: ['floral','apple','soothing'],   health: ['Sleep','Anxiety relief','Digestion'], pairs: ['Lavender','Lemon','Honey'] },
    ],
    flavors: [
        { key: 'ing_strawberry', emoji: '🍓', flavor: ['sweet','fruity','summery'],  health: ['Vitamin C','Antioxidants'], pairs: ['White Tea','Vanilla','Lemon'] },
        { key: 'ing_mint',       emoji: '🌱', flavor: ['cooling','fresh','bright'],  health: ['Digestion','Focus','Refresh'], pairs: ['Green Tea','Lemon','Honey'] },
        { key: 'ing_vanilla',    emoji: '🌸', flavor: ['sweet','creamy','warm'],     health: ['Mood lift','Antioxidants'], pairs: ['Black Tea','Rooibos','Cinnamon'] },
        { key: 'ing_rose',       emoji: '🌹', flavor: ['floral','romantic','light'], health: ['Antioxidants','Mood','Skin'], pairs: ['White Tea','Oolong','Lavender'] },
        { key: 'ing_orange',     emoji: '🍊', flavor: ['citrusy','bright','zesty'],  health: ['Vitamin C','Immunity','Energy'], pairs: ['Rooibos','Black Tea','Ginger'] },
        { key: 'ing_blueberry',  emoji: '🫐', flavor: ['sweet','fruity','tart'],     health: ['Antioxidants','Brain health','Anti-aging'], pairs: ['Green Tea','Lemon','Mint'] },
        { key: 'ing_raspberry',  emoji: '🍇', flavor: ['tart','fruity','vibrant'],   health: ['Vitamin C','Antioxidants','Fiber'], pairs: ['Green Tea','Mint','Lemon'] },
        { key: 'ing_cocoa',      emoji: '🍫', flavor: ['rich','chocolatey','earthy'],health: ['Mood','Antioxidants','Energy'], pairs: ['Black Tea','Rooibos','Cinnamon'] },
        { key: 'ing_coconut',    emoji: '🥥', flavor: ['tropical','sweet','creamy'], health: ['MCTs','Energy','Hydration'], pairs: ['Rooibos','Oolong','Vanilla'] },
    ],
    extras: [
        { key: 'ing_honey',      emoji: '🍯', flavor: ['sweet','floral','warm'],     health: ['Antimicrobial','Soothing','Energy'], pairs: ['Chamomile','Green Tea','Lemon'] },
        { key: 'ing_lemon',      emoji: '🍋', flavor: ['bright','citrusy','tart'],   health: ['Vitamin C','Detox','Immunity'], pairs: ['Green Tea','Chamomile','Ginger'] },
        { key: 'ing_ginger',     emoji: '🫚', flavor: ['spicy','warm','zesty'],      health: ['Digestion','Anti-nausea','Anti-inflammatory'], pairs: ['Black Tea','Lemon','Honey'] },
        { key: 'ing_lavender',   emoji: '💜', flavor: ['floral','calming','herby'],  health: ['Sleep','Stress relief','Mood'], pairs: ['Chamomile','White Tea','Honey'] },
        { key: 'ing_turmeric',   emoji: '🌕', flavor: ['earthy','peppery','warm'],   health: ['Anti-inflammatory','Immunity','Joints'], pairs: ['Chamomile','Black Tea','Ginger'] },
        { key: 'ing_cinnamon',   emoji: '🪵', flavor: ['warm','spicy','sweet'],      health: ['Blood sugar','Anti-inflammatory','Energy'], pairs: ['Black Tea','Rooibos','Vanilla'] },
        { key: 'ing_spearmint',  emoji: '🌿', flavor: ['cool','sweet','mild'],       health: ['Digestion','Focus','Breath'], pairs: ['Rooibos','Green Tea','Lemon'] },
        { key: 'ing_rose_hip',   emoji: '🔴', flavor: ['tart','fruity','tangy'],     health: ['Vitamin C','Skin','Immunity'], pairs: ['Chamomile','Rooibos','Honey'] },
        { key: 'ing_cardamom',   emoji: '🫛', flavor: ['exotic','spicy','floral'],   health: ['Digestion','Breath','Antioxidants'], pairs: ['Black Tea','Oolong','Vanilla'] },
    ]
};

function renderIngredientEncyclopedia() {
    const caffeineLabel = ['Bez kofeinu','Velmi nízký','Nízký','Střední','Vysoký','Velmi vysoký'];
    const caffeineEn = ['Caffeine-free','Very low','Low','Medium','High','Very high'];
    const pairsLabel = LANG === 'cs' ? 'Hodí se s' : 'Pairs well with';
    const healthLabel = LANG === 'cs' ? 'Přínosy' : 'Benefits';
    ['bases','flavors','extras'].forEach(cat => {
        const el = document.getElementById('ing-grid-' + cat);
        if (!el) return;
        el.innerHTML = ING_DATA[cat].map(ing => {
            const name = t(ing.key);
            const desc = t(ing.key + '_desc') || '';
            const caffeine = ing.caffeine !== undefined ? `<div class="ing-caffeine"><span class="ing-caffeine-dots">${'●'.repeat(ing.caffeine)}${'○'.repeat(4 - Math.min(ing.caffeine,4))}</span> ${LANG === 'cs' ? caffeineLabel[ing.caffeine] : caffeineEn[ing.caffeine]}</div>` : '';
            return `<div class="ing-card">
                <div class="ing-card-emoji">${ing.emoji}</div>
                <h3 class="ing-card-name">${name}</h3>
                <p class="ing-card-desc">${desc}</p>
                ${caffeine}
                <div class="ing-card-tags">${ing.flavor.map(f => `<span class="ing-tag">${f}</span>`).join('')}</div>
                <div class="ing-card-section"><strong>${healthLabel}:</strong> ${ing.health.join(' · ')}</div>
                <div class="ing-card-section"><strong>${pairsLabel}:</strong> ${ing.pairs.join(', ')}</div>
                <button class="btn btn-small" onclick="closeSidebar(); showPage('product-page');" style="margin-top:auto">${LANG === 'cs' ? 'Použít →' : 'Use →'}</button>
            </div>`;
        }).join('');
    });
}

/* ─── INIT ───────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    applyTranslations();
    if (localStorage.getItem('teaseyou_promo_dismissed')) {
        const bar = document.getElementById('promo-bar');
        if (bar) bar.style.display = 'none';
    }
    document.querySelectorAll('.ingredient-btn').forEach(btn => {
        const c = btn.getAttribute('data-color');
        if (c) btn.style.setProperty('--dot-color', c);
    });
    // Initialize completion label with correct language
    const completionLabel = document.getElementById('completion-label');
    if (completionLabel) completionLabel.textContent = `0 / 3 ${t('completion_selected')}`;
    initReveal();
    initCookieBanner();
    initBackToTop();
    initA11y();
    updateCartBadge();   // restore badge from persisted cart
    renderIngredientEncyclopedia();
    renderSavedBlends();
    renderCart();

    // Hero parallax on scroll
    (function() {
        const glasses = document.querySelectorAll('.hero-glass');
        if (!glasses.length) return;
        const speeds = [0.12, 0.20, 0.08];
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (ticking) return;
            requestAnimationFrame(() => {
                const y = window.scrollY;
                glasses.forEach((g, i) => {
                    g.style.transform = `translateY(${-y * speeds[i]}px)`;
                });
                ticking = false;
            });
            ticking = true;
        }, { passive: true });
    })();
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
];

const QUIZ_BLENDS = [
    {
        tags:["bold","caffeine"],
        name:"Deep Winter",
        desc:"Black tea with warming ginger and smooth vanilla. Full-bodied and rich — best on a cold morning.",
        desc_cs:'Černý čaj se zázvorem a vanilkou. Plný a hřejivý — nejlepší na chladné ráno.',
        ingredients:["Black Tea","Ginger","Vanilla"],
        colors:["#4a3b32","#ff9800","#f3e5ab"]
    },
    {
        tags:["fresh","mild"],
        name:"Morning Window",
        desc:"Green tea with mint and lemon. Clean and bright — the kind of cup that gets the day started right.",
        desc_cs:'Zelený čaj s mátou a citronem. Čistý a svěží — pohár co správně nastartuje den.',
        ingredients:["Green Tea","Mint","Lemon"],
        colors:["#8da676","#4caf50","#ffe066"]
    },
    {
        tags:["herbal","calm"],
        name:"Slow Tuesday",
        desc:"Chamomile with turmeric and cinnamon. Earthy and warm — for when you have nowhere to be.",
        desc_cs:'Heřmánek s kurkumou a skořicí. Zemitý a teplý — na chvíle, kdy nikam nespěcháš.',
        ingredients:["Chamomile","Turmeric","Cinnamon"],
        colors:["#f5d78e","#d4a017","#c8824a"]
    },
    {
        tags:["citrus","fresh"],
        name:"Open Air",
        desc:"Rooibos with orange and spearmint. Naturally sweet and caffeine-free — good any time.",
        desc_cs:'Rooibos s pomerančem a mátou. Přirozeně sladký a bez kofeinu — kdykoli je správný čas.',
        ingredients:["Rooibos","Orange","Spearmint"],
        colors:["#e8720c","#ffb347","#a8d8a8"]
    },
    {
        tags:["floral","mild"],
        name:"Late Light",
        desc:"Oolong with rose and lavender. Soft and a little floral — for the quiet part of the afternoon.",
        desc_cs:'Oolong s růží a levandulí. Měkký a květinový — na tichý kout odpoledne.',
        ingredients:["Oolong Tea","Rose","Lavender"],
        colors:["#c8a0b4","#e8607a","#b8a0cc"]
    },
    {
        tags:["fruit","mild"],
        name:"Still Evening",
        desc:"White tea with strawberry and honey. Gently sweet and unhurried — a soft end to the day.",
        desc_cs:'Bílý čaj s jahodou a medem. Jemně sladký a klidný — měkký závěr dne.',
        ingredients:["White Tea","Strawberry","Honey"],
        colors:["#f5e6d3","#cc4747","#ffc107"]
    },
];

const BLEND_DESCS_CS = {
    'Morning Window': 'Zelený čaj s mátou a citronem. Čistý a svěží — pohár, který rozjede den správným způsobem.',
    'Still Evening':  'Bílý čaj s jahodou a medem. Jemně sladký a klidný — měkký závěr dne.',
    'Deep Winter':    'Černý čaj se zázvorem a vanilkou. Plný a hřejivý — nejlepší s oběma rukama kolem hrnku.',
    'Late Light':     'Oolong s růží a levandulí. Měkký a trochu květinový — na ten tichý kus odpoledne.',
    'Open Air':       'Rooibos s pomerančem a mátou. Přirozeně sladký a bez kofeinu — dobrý kdykoli.',
    'Slow Tuesday':   'Heřmánek s kurkumou a skořicí. Zemitý a teplý — čajový ekvivalent nicnedělání.',
};

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
            <p class="font-chaos" style="font-size:12px;color:var(--color-ink-faint);margin-bottom:12px;letter-spacing:1px;text-transform:uppercase;">${t('quiz_question_of')} ${quizStep+1} ${t('quiz_of')} ${QUIZ_QUESTIONS.length}</p>
            <h2 class="quiz-question font-cosmico">${t(q.q)}</h2>
            <div class="quiz-options">
                ${q.options.map(opt => `
                    <button class="quiz-option" data-tags="${opt.tags.join(',')}">
                        <span class="quiz-option-icon">${opt.icon}</span>
                        <span>${t(opt.text)}</span>
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
            <p class="quiz-result-label font-chaos">${t('quiz_result_label')}</p>
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
                <button class="btn btn-large" id="quiz-order-btn">${t('btn_order_blend')}</button>
                <button class="btn btn-secondary" onclick="startQuiz()">${t('btn_try_again')}</button>
                <button class="btn btn-ghost" onclick="showPage('home-page')">${t('btn_back_home')}</button>
            </div>
        </div>
    `;
    document.getElementById('quiz-order-btn').addEventListener('click', () => {
        openDetail(best.name, LANG === 'cs' && best.desc_cs ? best.desc_cs : best.desc, 89, best.ingredients, best.colors);
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
        if (part) { part.style.backgroundColor = color; fillGlassPart(partId); }
        const idx = parseInt(partId.replace('part','')) - 1;
        currentProduct.colors[idx]      = color;
        currentProduct.ingredients[idx] = name;
    });

    // Random name
    const adjectives = ['Morning','Early','Late','Slow','Dark','Quiet','Warm','Still','Deep','Open'];
    const nouns      = ['Window','Tuesday','Winter','Light','Air','Evening','Hour','Field','Corner','Shelf'];
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
    showToast(`${t('toast_random')} ${randomName} 🎲`, '🎲');
}