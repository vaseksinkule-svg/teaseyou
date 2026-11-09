/* =============================================
   ČÍSLO ÚČTU A QR PLATBA
   =============================================
   Převod českého čísla účtu (předčíslí-číslo/kód banky) na IBAN a zpět,
   kontrola IBANu a text pro QR Platbu (český standard SPAYD 1.0, čte ho
   bankovní aplikace každé české banky).

   Používá ho web (script.js), administrace (admin.js) i testy.
*/
(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.Bank = api;
})(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    const LENGTHS = { CZ: 24, SK: 24, DE: 22, AT: 20, PL: 28 };
    const clean = v => String(v == null ? '' : v).replace(/[\s.]+/g, '').toUpperCase();

    // zbytek po dělení 97 pro dlouhé číslo zapsané jako text
    function mod97(digits) {
        let r = 0;
        for (const ch of digits) r = (r * 10 + (ch.charCodeAt(0) - 48)) % 97;
        return r;
    }
    const toDigits = s => s.replace(/[A-Z]/g, c => String(c.charCodeAt(0) - 55));

    function isIban(value) {
        const s = clean(value);
        if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$/.test(s)) return false;
        const len = LENGTHS[s.slice(0, 2)];
        if (len && s.length !== len) return false;
        return mod97(toDigits(s.slice(4) + s.slice(0, 4))) === 1;
    }

    // české účty mají kontrolu modulo 11 zvlášť pro předčíslí a číslo
    function mod11ok(digits, weights) {
        const d = digits.padStart(weights.length, '0');
        let sum = 0;
        for (let i = 0; i < weights.length; i++) sum += Number(d[i]) * weights[i];
        return sum % 11 === 0;
    }

    function fromCzAccount(value) {
        const m = /^(?:([0-9]{1,6})-)?([0-9]{2,10})\/([0-9]{4})$/.exec(clean(value));
        if (!m) return '';
        const prefix = m[1] || '', number = m[2], bank = m[3];
        if (prefix && !mod11ok(prefix, [10, 5, 8, 4, 2, 1])) return '';
        if (!mod11ok(number, [6, 3, 7, 9, 10, 5, 8, 4, 2, 1]) || /^0+$/.test(number)) return '';
        const bban = bank + prefix.padStart(6, '0') + number.padStart(10, '0');
        const check = String(98 - mod97(toDigits(bban + 'CZ00'))).padStart(2, '0');
        return 'CZ' + check + bban;
    }

    /* IBAN z čehokoliv, co člověk napíše: IBAN s mezerami i bez,
       nebo české číslo účtu. Neplatné → ''. */
    function toIban(value) {
        const s = clean(value);
        if (isIban(s)) return s;
        const cz = fromCzAccount(value);
        return cz && isIban(cz) ? cz : '';
    }

    /* CZ IBAN → „předčíslí-číslo/kód“, jak ho znají české banky. */
    function czAccount(iban) {
        const s = clean(iban);
        if (!/^CZ[0-9]{22}$/.test(s) || !isIban(s)) return '';
        const bank = s.slice(4, 8);
        const prefix = s.slice(8, 14).replace(/^0+/, '');
        const number = s.slice(14).replace(/^0+/, '');
        return (prefix ? prefix + '-' : '') + number + '/' + bank;
    }

    const formatIban = iban => clean(iban).replace(/(.{4})/g, '$1 ').trim();

    /* Variabilní symbol z čísla objednávky: TY-00012 → 12. */
    function variableSymbol(orderNum) {
        const m = /^TY-0*([0-9]{1,10})$/.exec(String(orderNum || '').toUpperCase());
        return m ? m[1] : '';
    }

    /* Text QR Platby. Zpráva jen bez diakritiky a bez hvězdičky,
       ať ji přečte každá banka. */
    function spayd({ iban, amount, vs, msg }) {
        const acc = clean(iban);
        const am = Number(amount);
        if (!isIban(acc) || !Number.isFinite(am) || am <= 0 || am > 9999999) return '';
        const parts = ['SPD', '1.0', 'ACC:' + acc, 'AM:' + am.toFixed(2), 'CC:CZK'];
        if (/^[0-9]{1,10}$/.test(String(vs || ''))) parts.push('X-VS:' + vs);
        const text = String(msg || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
            .replace(/[^A-Za-z0-9 .,:/+-]/g, '').replace(/\s+/g, ' ').trim().slice(0, 60);
        if (text) parts.push('MSG:' + text);
        return parts.join('*');
    }

    return { isIban, toIban, czAccount, formatIban, variableSymbol, spayd };
});
