/* Tease you — malý klient pro Supabase.
 *
 * Bez knihovny a bez buildu, stejně jako zbytek webu. Umí přesně to, co
 * potřebuje web a administrace: číst a zapisovat tabulky (PostgREST),
 * volat databázové funkce, přihlásit admina a nahrát fotku. Supabase tyhle
 * HTTP rozhraní drží stabilní roky, takže tu není co aktualizovat.
 *
 * Nastavení se bere z config.js (window.TEASEYOU_CONFIG). Když tam nic není,
 * `TeaDB.configured` je false a web jede dál z vestavěných dat.
 */
(function () {
    'use strict';

    const cfg = window.TEASEYOU_CONFIG || {};
    const BASE = String(cfg.SUPABASE_URL || '').trim().replace(/\/+$/, '');
    const KEY = String(cfg.SUPABASE_ANON_KEY || '').trim();
    const configured = /^https?:\/\/[^/]+/.test(BASE) && !BASE.includes('YOUR_PROJECT')
        && KEY.length > 20 && !KEY.startsWith('YOUR_');

    // Starý typ klíče (anon, začíná "eyJ") je JWT a Supabase ho chce i v
    // Authorization. Nový publishable klíč (sb_publishable_…) patří jen do
    // hlavičky apikey — v Authorization ho Supabase nebere.
    const LEGACY_JWT_KEY = KEY.startsWith('eyJ');
    const SESSION_KEY = 'teaseyou_admin_session';

    class DbError extends Error {
        constructor(message, status, code, details) {
            super(message);
            this.name = 'DbError';
            this.status = status || 0;
            this.code = code || '';
            this.details = details || '';
        }
    }

    /* ─── Session (jen administrace) ────────────────────────────────
     * Web pro zákazníky session nikdy nenačítá. Kdyby ji načetl, admin
     * přihlášený ve stejném prohlížeči by na webu viděl i skryté položky. */
    let session = null;
    const listeners = new Set();

    function emit() { listeners.forEach(fn => { try { fn(session); } catch (_) {} }); }

    function storeSession(s) {
        session = s;
        try {
            if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s));
            else localStorage.removeItem(SESSION_KEY);
        } catch (_) {}
        emit();
    }

    function sessionFromTokenResponse(data) {
        if (!data || !data.access_token) throw new DbError('Neplatná odpověď přihlášení', 500);
        const expiresAt = data.expires_at
            || Math.floor(Date.now() / 1000) + (Number(data.expires_in) || 3600);
        return {
            access_token: data.access_token,
            refresh_token: data.refresh_token || '',
            expires_at: expiresAt,
            user: data.user ? { id: data.user.id, email: data.user.email } : null,
        };
    }

    let refreshing = null;
    async function ensureFreshSession() {
        if (!session) return;
        const now = Math.floor(Date.now() / 1000);
        if (session.expires_at - 60 > now) return;
        if (!session.refresh_token) { storeSession(null); return; }
        // Víc souběžných požadavků nesmí spustit víc obnov — refresh token
        // jde použít jen jednou a druhá obnova by session zahodila.
        if (!refreshing) {
            refreshing = (async () => {
                try {
                    const data = await raw('/auth/v1/token?grant_type=refresh_token', {
                        method: 'POST', body: { refresh_token: session.refresh_token }, withSession: false,
                    });
                    storeSession(sessionFromTokenResponse(data));
                } catch (err) {
                    if (err.status >= 400 && err.status < 500) storeSession(null);
                    else throw err;
                } finally {
                    refreshing = null;
                }
            })();
        }
        await refreshing;
    }

    /* ─── HTTP ────────────────────────────────────────────────────── */
    function buildHeaders(extra, withSession) {
        const h = Object.assign({ apikey: KEY }, extra || {});
        if (withSession && session && session.access_token) h.Authorization = 'Bearer ' + session.access_token;
        else if (LEGACY_JWT_KEY) h.Authorization = 'Bearer ' + KEY;
        return h;
    }

    async function raw(path, opts) {
        const o = Object.assign({ method: 'GET', withSession: true, timeout: 12000 }, opts || {});
        if (!configured) throw new DbError('not_configured', 0);
        if (o.withSession) await ensureFreshSession();
        const headers = buildHeaders(o.headers, o.withSession);
        let body = o.body;
        if (body !== undefined && !(body instanceof Blob) && !(body instanceof ArrayBuffer)) {
            headers['Content-Type'] = 'application/json';
            body = JSON.stringify(body);
        }
        const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const timer = ctrl ? setTimeout(() => ctrl.abort(), o.timeout) : null;
        let res;
        try {
            res = await fetch(BASE + path, { method: o.method, headers, body, signal: ctrl && ctrl.signal });
        } catch (err) {
            throw new DbError(err && err.name === 'AbortError' ? 'timeout' : 'network', 0);
        } finally {
            if (timer) clearTimeout(timer);
        }
        const text = await res.text();
        let data = null;
        if (text) { try { data = JSON.parse(text); } catch (_) { data = text; } }
        if (!res.ok) {
            const d = data && typeof data === 'object' ? data : {};
            const msg = d.message || d.msg || d.error_description || d.error || ('HTTP ' + res.status);
            // Vypršelý token: zahodit session, ať se admin přihlásí znovu.
            if (res.status === 401 && o.withSession && session && /jwt/i.test(String(msg))) storeSession(null);
            throw new DbError(String(msg), res.status, d.code || d.error_code || d.statusCode || '', d.details || '');
        }
        return data;
    }

    function qs(params) {
        if (!params) return '';
        const p = new URLSearchParams();
        Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null) p.append(k, String(v)); });
        const s = p.toString();
        return s ? '?' + s : '';
    }

    /* ─── Tabulky ────────────────────────────────────────────────────
     * filters ve tvaru PostgRESTu: { id: 'eq.mint', active: 'eq.true' } */
    const REPR = { Prefer: 'return=representation' };

    function select(table, params) {
        return raw('/rest/v1/' + encodeURIComponent(table) + qs(Object.assign({ select: '*' }, params)));
    }
    function insert(table, rows, opts) {
        const o = opts || {};
        const headers = { Prefer: 'return=representation' + (o.upsert ? ',resolution=merge-duplicates' : '') };
        const params = o.upsert && o.onConflict ? { on_conflict: o.onConflict } : null;
        return raw('/rest/v1/' + encodeURIComponent(table) + qs(params), { method: 'POST', body: rows, headers });
    }
    function update(table, filters, patch) {
        return raw('/rest/v1/' + encodeURIComponent(table) + qs(filters), { method: 'PATCH', body: patch, headers: REPR });
    }
    function remove(table, filters) {
        return raw('/rest/v1/' + encodeURIComponent(table) + qs(filters), { method: 'DELETE', headers: REPR });
    }
    function rpc(fn, args) {
        return raw('/rest/v1/rpc/' + encodeURIComponent(fn), { method: 'POST', body: args || {} });
    }

    /* ─── Fotky ──────────────────────────────────────────────────── */
    function encPath(path) { return path.split('/').map(encodeURIComponent).join('/'); }
    function publicUrl(bucket, path) {
        return BASE + '/storage/v1/object/public/' + encodeURIComponent(bucket) + '/' + encPath(path);
    }
    async function upload(bucket, path, blob, contentType) {
        await raw('/storage/v1/object/' + encodeURIComponent(bucket) + '/' + encPath(path), {
            method: 'POST', body: blob, timeout: 60000,
            headers: { 'Content-Type': contentType || blob.type || 'application/octet-stream', 'x-upsert': 'true' },
        });
        return publicUrl(bucket, path);
    }
    function removeObjects(bucket, paths) {
        return raw('/storage/v1/object/' + encodeURIComponent(bucket), { method: 'DELETE', body: { prefixes: paths } });
    }

    /* ─── Přihlášení ─────────────────────────────────────────────── */
    const auth = {
        /** Načte uloženou session. Volá jen administrace. */
        restore() {
            try {
                const s = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
                if (s && s.access_token && s.expires_at) session = s;
            } catch (_) { session = null; }
            return session;
        },
        /** Odkaz z e-mailu (pozvánka, obnova hesla) nese tokeny v #hash. */
        consumeUrlHash() {
            const h = new URLSearchParams((location.hash || '').replace(/^#/, ''));
            if (h.get('error_description')) {
                history.replaceState(null, '', location.pathname + location.search);
                return { error: h.get('error_description') };
            }
            const token = h.get('access_token');
            if (!token) return null;
            storeSession(sessionFromTokenResponse({
                access_token: token,
                refresh_token: h.get('refresh_token'),
                expires_in: h.get('expires_in'),
                expires_at: Number(h.get('expires_at')) || undefined,
            }));
            history.replaceState(null, '', location.pathname + location.search);
            return { type: h.get('type') || '' };
        },
        async signIn(email, password) {
            const data = await raw('/auth/v1/token?grant_type=password', {
                method: 'POST', body: { email, password }, withSession: false,
            });
            storeSession(sessionFromTokenResponse(data));
            return session;
        },
        async signOut() {
            const had = session;
            try { if (had) await raw('/auth/v1/logout', { method: 'POST' }); } catch (_) {}
            storeSession(null);
        },
        async user() {
            return raw('/auth/v1/user');
        },
        async updatePassword(password) {
            return raw('/auth/v1/user', { method: 'PUT', body: { password } });
        },
        async recover(email, redirectTo) {
            return raw('/auth/v1/recover' + qs({ redirect_to: redirectTo }), {
                method: 'POST', body: { email }, withSession: false,
            });
        },
        session() { return session; },
        onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    };

    window.TeaDB = { configured, DbError, select, insert, update, remove, rpc, upload, publicUrl, removeObjects, auth };
})();
