/* Napojení webu a administrace na Supabase.
 *
 * Obě hodnoty najdeš v Supabase → Project Settings → API Keys:
 *   SUPABASE_URL       Project URL, např. https://abcdefgh.supabase.co
 *   SUPABASE_ANON_KEY  Publishable key (sb_publishable_…), u starších
 *                      projektů „anon public“ klíč (začíná eyJ…)
 *
 * Tenhle klíč je veřejný a patří do prohlížeče — je vidět každému, kdo si
 * otevře zdroják, a to je v pořádku. Data chrání pravidla v databázi
 * (supabase/setup.sql). Secret / service_role klíč sem NIKDY nedávej.
 *
 * Dokud tu jsou zástupné hodnoty, web jede z vestavěných dat ve script.js
 * a administrace ukáže, co je potřeba doplnit.
 */
window.TEASEYOU_CONFIG = {
    SUPABASE_URL:      'https://YOUR_PROJECT.supabase.co',
    SUPABASE_ANON_KEY: 'YOUR_PUBLISHABLE_KEY',
};
