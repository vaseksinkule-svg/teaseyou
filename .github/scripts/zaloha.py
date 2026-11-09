#!/usr/bin/env python3
"""Noční záloha Tease you.

Stáhne celou databázi obchodu (stejný formát jako „Stáhnout zálohu“ v
administraci), přibalí fotky z úložiště, soubor zabalí a zašifruje heslem.
Obnovuje se v administraci: Zálohy a koš → Obnova ze zálohy → zadat heslo.

Proměnné prostředí:
  ZALOHA_DB_URL  připojení k databázi jako role teaseyou_backup (session pooler)
  ZALOHA_HESLO   heslo k šifrování, aspoň 16 znaků

Do výpisu nikdy nepíše obsah tabulek. Repozitář je veřejný a výpis běhu
na GitHubu taky.
"""

import argparse
import base64
import gzip
import hashlib
import json
import os
import re
import secrets
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

import psycopg
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

ITERATIONS = 600_000
PHOTO_BUCKET = 'photos'
PHOTO_TABLES = ('ingredients', 'blends', 'craft_products')
PHOTO_MAX_BYTES = 15 * 1024 * 1024
TABLES = ('settings', 'ingredients', 'blends', 'price_tiers', 'shipping_methods', 'promo_codes',
          'craft_products', 'craft_waitlist', 'purchase_suppliers', 'purchase_materials',
          'purchase_offers', 'purchase_tasks', 'orders', 'reviews', 'withdrawals', 'privacy_requests')
# Bez těchhle tabulek obchod nefunguje. Když jsou prázdné, je něco špatně.
MUST_HAVE_ROWS = ('settings', 'ingredients', 'price_tiers')


def fail(msg, code=1):
    print(f'::error::{msg}')
    sys.exit(code)


def supabase_url(repo_root):
    if os.environ.get('ZALOHA_SUPABASE_URL'):
        return os.environ['ZALOHA_SUPABASE_URL'].rstrip('/')
    text = (repo_root / 'config.js').read_text(encoding='utf-8')
    m = re.search(r"SUPABASE_URL\s*:\s*'([^']+)'", text)
    if not m:
        fail('V config.js chybí SUPABASE_URL.')
    return m.group(1).strip().rstrip('/')


def snapshot(db_url):
    # Pooler občas odmítne první přihlášení, proto pár pokusů.
    waits = [0, 20, 40, 60]
    last = None
    for wait in waits:
        if wait:
            print(f'Databáze neodpověděla, zkusím to znovu za {wait} s.')
            time.sleep(wait)
        try:
            # Šifrované spojení, pokud ho adresa sama nenastavuje jinak.
            extra = {} if 'sslmode' in db_url else {'sslmode': 'require'}
            with psycopg.connect(db_url, connect_timeout=20, autocommit=False, **extra) as conn:
                with conn.cursor() as cur:
                    cur.execute('select public.backup_snapshot()')
                    data = cur.fetchone()[0]
                conn.commit()
            return data
        except psycopg.OperationalError as e:
            # Text chyby neobsahuje heslo, jen adresu a jméno role.
            last = str(e).strip().splitlines()[0] if str(e).strip() else type(e).__name__
    fail(f'Do databáze se nepodařilo připojit: {last}')


def encode_path(path):
    # Stejně jako db.js: každá část cesty zvlášť.
    return '/'.join(urllib.parse.quote(part, safe='') for part in path.split('/'))


def fetch_photos(tables, base):
    prefix = f'{base}/storage/v1/object/public/{PHOTO_BUCKET}/'
    urls = sorted({r.get('photo_url') for t in PHOTO_TABLES for r in tables.get(t, [])
                   if isinstance(r.get('photo_url'), str) and r['photo_url'].startswith(prefix)})
    photos, missing = {}, 0
    for url in urls:
        path = urllib.parse.unquote(url[len(prefix):])
        try:
            req = urllib.request.Request(prefix + encode_path(path), headers={'User-Agent': 'tease-you-zaloha'})
            with urllib.request.urlopen(req, timeout=30) as res:
                body = res.read(PHOTO_MAX_BYTES + 1)
                if len(body) > PHOTO_MAX_BYTES:
                    raise ValueError('too big')
                ctype = res.headers.get_content_type() or 'application/octet-stream'
            photos[path] = {'type': ctype, 'data': base64.b64encode(body).decode('ascii')}
        except Exception:
            missing += 1
    return photos, len(urls), missing


def derive_key(password, salt, iterations=ITERATIONS):
    return PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=salt, iterations=iterations).derive(password.encode('utf-8'))


def encrypt(backup, password):
    plain = gzip.compress(json.dumps(backup, ensure_ascii=False, separators=(',', ':')).encode('utf-8'), mtime=0)
    salt, iv = secrets.token_bytes(16), secrets.token_bytes(12)
    data = AESGCM(derive_key(password, salt)).encrypt(iv, plain, None)
    envelope = {
        'format': 'teaseyou-backup-encrypted',
        'version': 1,
        'created_at': backup.get('created_at'),
        'kdf': {'name': 'PBKDF2', 'hash': 'SHA-256', 'iterations': ITERATIONS,
                'salt': base64.b64encode(salt).decode('ascii')},
        'cipher': {'name': 'AES-GCM', 'iv': base64.b64encode(iv).decode('ascii')},
        'compression': 'gzip',
        'data': base64.b64encode(data).decode('ascii'),
    }
    return envelope, hashlib.sha256(plain).hexdigest()


def decrypt(envelope, password):
    kdf, cipher = envelope['kdf'], envelope['cipher']
    key = derive_key(password, base64.b64decode(kdf['salt']), kdf['iterations'])
    plain = AESGCM(key).decrypt(base64.b64decode(cipher['iv']), base64.b64decode(envelope['data']), None)
    return plain


def set_output(**values):
    path = os.environ.get('GITHUB_OUTPUT')
    if path:
        with open(path, 'a', encoding='utf-8') as f:
            for k, v in values.items():
                f.write(f'{k}={v}\n')


def summary(lines):
    path = os.environ.get('GITHUB_STEP_SUMMARY')
    if path:
        with open(path, 'a', encoding='utf-8') as f:
            f.write('\n'.join(lines) + '\n')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', required=True)
    args = ap.parse_args()

    db_url = os.environ.get('ZALOHA_DB_URL', '').strip()
    password = os.environ.get('ZALOHA_HESLO', '')
    if not db_url:
        fail('Chybí secret ZALOHA_DB_URL (postup v supabase/README.md).')
    if len(password) < 16:
        fail('Secret ZALOHA_HESLO chybí nebo je kratší než 16 znaků.')

    repo_root = Path(__file__).resolve().parents[2]
    base = supabase_url(repo_root)

    backup = snapshot(db_url)
    if not isinstance(backup, dict) or backup.get('format') != 'teaseyou-backup' or not isinstance(backup.get('tables'), dict):
        fail('Databáze vrátila něco, co není záloha.')
    tables = backup['tables']
    missing_tables = [t for t in TABLES if t not in tables]

    photos, photo_total, photo_missing = fetch_photos(tables, base)
    backup['photos'] = photos

    envelope, digest = encrypt(backup, password)
    if hashlib.sha256(decrypt(envelope, password)).hexdigest() != digest:
        fail('Kontrola šifrování selhala, záloha by nešla otevřít.')

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(envelope, separators=(',', ':')), encoding='utf-8')
    size_mb = out.stat().st_size / 1024 / 1024

    counts = {t: len(tables.get(t, [])) for t in TABLES}
    rows = sum(counts.values())
    print(f'Záloha z {backup.get("created_at")}: {rows} záznamů, '
          f'{photo_total - photo_missing}/{photo_total} fotek, {size_mb:.1f} MB, zašifrováno.')
    for t in TABLES:
        print(f'  {t}: {counts[t]}')
    summary([f'### Záloha {backup.get("created_at", "")[:10]}', '',
             f'- {rows} záznamů, {photo_total - photo_missing}/{photo_total} fotek, {size_mb:.1f} MB',
             '- zašifrováno heslem ze secretu `ZALOHA_HESLO`', '',
             '| Tabulka | Záznamů |', '|---|---|'] + [f'| {t} | {counts[t]} |' for t in TABLES])
    set_output(file=str(out), name=out.stem)

    problems = []
    if missing_tables:
        problems.append('v záloze chybí tabulky ' + ', '.join(missing_tables))
    empty = [t for t in MUST_HAVE_ROWS if counts.get(t, 0) == 0]
    if empty:
        problems.append('prázdné tabulky ' + ', '.join(empty))
    if photo_missing:
        problems.append(f'nepodařilo se stáhnout {photo_missing} fotek')
    if problems:
        # Zálohu i tak uložíme, ale běh skončí chybou, ať přijde e-mail.
        fail('Záloha je uložená, ale něco nesedí: ' + '; '.join(problems) + '.', code=3)


if __name__ == '__main__':
    main()
