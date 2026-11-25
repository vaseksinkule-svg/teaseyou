"""Hromádky sypaných čajů pro fotky surovin na webu (spouští se v Blenderu).

Soubor: ~/TeaseYou-3D/teaseyou-rendery.blend, scéna „Caj“ (světla Svetlo_*,
pozadí Pozadi). Pro každý čaj postaví z náhodně tvarovaných lístků hromádku
(kolekce Sypane_<slug>) a dvě kamery:
  Kamera_<slug>         celá hromádka, stejný pohled jako cerny-caj.png
  Kamera_<slug>_detail  makro zblízka s malou hloubkou ostrosti, pro kolečko na webu

    blender -b ~/TeaseYou-3D/teaseyou-rendery.blend -P tools/rendery/blender_suroviny.py -- \
        ~/TeaseYou-3D/rendery zeleny-caj bily-caj oolong rooibos cerny-caj

Uloží rendery/<slug>.png (1600 × 1280) a rendery/<slug>_detail.png (1600 × 1600).
Pro web: python3 tools/rendery/vyrez.py detail rendery/<slug>_detail.png <slug>

Tvary lístků (všechno v metrech, list leží podél osy x):
  list_     plochý lístek se žilkou, svinutý, zkroucený a zmačkaný
  trubka    jehlička nebo stonek (rooibos, stonky bílého čaje)
  kulicka   svinutý lístek do kuličky (oolong)
Hromádka se vrství přes výškovou mapu: každý kousek dopadne na to, co už leží
pod ním, takže lístky na sobě leží a neprorůstají se.
"""
import math
import os
import sys

import bpy
import numpy as np

MM = 0.001


# ───────────────────────── tvary ─────────────────────────

def _vlny(rng, n, k):
    """Hladký náhodný reliéf: součet n sinusovek s vlnovým číslem kolem k (1/m)."""
    sm = rng.normal(size=(n, 2))
    sm /= np.linalg.norm(sm, axis=1, keepdims=True)
    ks = sm * (k * rng.uniform(0.6, 1.4, (n, 1)))
    ph = rng.uniform(0, 2 * np.pi, n)
    am = rng.uniform(0.5, 1.0, n)
    am /= am.sum()
    return lambda x, y: sum(a * np.sin(kk[0] * x + kk[1] * y + p) for a, kk, p in zip(am, ks, ph))


def _mrizka(nu, nv, cyklicky=False):
    """Čtyřúhelníky mřížky nu × nv (indexy i * nv + j)."""
    jv = nv if cyklicky else nv - 1
    i, j = np.meshgrid(np.arange(nu - 1), np.arange(jv), indexing='ij')
    i, j = i.ravel(), j.ravel()
    j2 = (j + 1) % nv
    return np.stack([i * nv + j, (i + 1) * nv + j, (i + 1) * nv + j2, i * nv + j2], 1)


def _zkrut(y, z, a):
    return y * np.cos(a) - z * np.sin(a), y * np.sin(a) + z * np.cos(a)


def list_(rng, L, W, nu=26, nv=9, svinuti=0.0, zkrut=0.0, ohyb=0.0, zmac=0.0,
          prelozeni=0.0, spicka=0.8, zaklad=0.7, zubky=0.0):
    """Lístek délky L a šířky W.
    svinuti: kolik otáček kolem podélné osy (0 plochý, 0,5 korýtko, 1,2 jehlička)
    zkrut: otočení kolem podélné osy po délce (rad), ohyb: prohnutí po délce (× L)
    zmac: zmačkání (× W), prelozeni: lom podél žilky (× W), zubky: vroubky okraje
    """
    u = np.linspace(0, 1, nu)
    v = np.linspace(-1, 1, nv)
    U, V = np.meshgrid(u, v, indexing='ij')
    prof = np.where(U < 0.5, np.sin(np.pi * U) ** zaklad, np.sin(np.pi * U) ** spicka)
    prof = np.maximum(prof, 0.03)
    w = 0.5 * W * prof * (1 + zubky * np.abs(np.sin(U * 46 + V)) * (np.abs(V) > 0.9))
    x = L * (U - 0.5)
    s = V * w                                   # vzdálenost od žilky po povrchu
    z = prelozeni * W * np.abs(V) * prof
    if zmac:
        f = _vlny(rng, 7, 2 * np.pi / (0.9 * W))
        g = _vlny(rng, 4, 2 * np.pi / (0.6 * L))
        z = z + zmac * W * (0.6 * f(x, s) + 0.4 * g(x, s))
    y = s
    if svinuti > 0:
        R = W / (2 * np.pi * svinuti)
        y, z = (R - z) * np.sin(s / R), R - (R - z) * np.cos(s / R)
    if ohyb:
        z = z + ohyb * L * (2 * (U - 0.5)) ** 2
    if zkrut:
        y, z = _zkrut(y, z, zkrut * (U - 0.5))
    v3 = np.stack([x, y, z], -1).reshape(-1, 3)
    v3 -= v3.mean(0)
    uv = np.stack([U, (V + 1) / 2], -1).reshape(-1, 2)
    return {'v': v3, 'f': _mrizka(nu, nv), 'uv': uv}


def trubka(rng, L, r, nu=14, nv=7, zplosteni=1.0, zkrut=0.0, ohyb=0.0, zuzeni=0.6, hrbol=0.0, vlna=0.0):
    """Jehlička nebo stonek: trubička délky L a poloměru r, konce zúžené."""
    u = np.linspace(0, 1, nu)
    a = np.linspace(0, 2 * np.pi, nv, endpoint=False)
    U, A = np.meshgrid(u, a, indexing='ij')
    rr = r * (1 - zuzeni * np.abs(2 * U - 1) ** 3)
    rr = rr * np.sqrt(np.clip(1 - np.abs(2 * U - 1) ** 10, 0, 1))   # zaoblené zavřené konce
    if hrbol:
        rr = rr * (1 + hrbol * _vlny(rng, 4, 2 * np.pi / (0.4 * L))(L * U, A * r))
    x = L * (U - 0.5)
    y = rr * np.cos(A)
    z = rr * np.sin(A) * zplosteni
    if zkrut:
        y, z = _zkrut(y, z, zkrut * (U - 0.5))
    if ohyb:
        z = z + ohyb * L * (2 * (U - 0.5)) ** 2
    if vlna:                                    # zvlnění do stran (drátovité proužky)
        f1, f2 = rng.uniform(0.6, 1.6), rng.uniform(0.5, 1.3)
        y = y + vlna * L * np.sin(2 * np.pi * f1 * U + rng.uniform(0, 6.3))
        z = z + 0.5 * vlna * L * np.sin(2 * np.pi * f2 * U + rng.uniform(0, 6.3))
    v3 = np.stack([x, y, z], -1).reshape(-1, 3)
    v3 -= v3.mean(0)
    uv = np.stack([U, A / (2 * np.pi)], -1).reshape(-1, 2)
    return {'v': v3, 'f': _mrizka(nu, nv, cyklicky=True), 'uv': uv}


def kostka(rng, a, nu=14, nv=16, hrany=0.35, vlakna=0.06, slupka=0.0):
    """Nepravidelný kousek (sušený zázvor, jablko, jahoda): zaoblený kvádr
    s otlučenými hranami a podélnými vlákny. slupka: jaký podíl povrchu (shora)
    je slupka, ta má druh 1, zbytek (dužina) 0."""
    th = np.linspace(0, np.pi, nu)
    ph = np.linspace(0, 2 * np.pi, nv, endpoint=False)
    T, P = np.meshgrid(th, ph, indexing='ij')
    d = np.stack([np.sin(T) * np.cos(P), np.sin(T) * np.sin(P), np.cos(T)], -1)
    # superelipsoid: malý exponent dělá z koule kvádr
    q = np.abs(d) ** hrany * np.sign(d)
    rozm = a * rng.uniform(0.55, 1.0, 3)
    v3 = q * rozm
    otluk = _vlny(rng, 6, 2 * np.pi / (0.7 * a))
    v3 = v3 * (1 + 0.3 * otluk(v3[..., 0] + v3[..., 2], v3[..., 1] - v3[..., 2]))[..., None]
    v3[..., 1] += vlakna * a * np.sin(v3[..., 2] * 2 * np.pi / (0.15 * a)) * (np.abs(d[..., 1]) > 0.3)
    v3 = v3.reshape(-1, 3)
    v3 -= v3.mean(0)
    uv = np.stack([T / np.pi, P / (2 * np.pi)], -1).reshape(-1, 2)
    c = {'v': v3, 'f': _mrizka(nu, nv, cyklicky=True), 'uv': uv}
    if slupka:
        c['d'] = (d[..., 2] > 1 - 2 * slupka).astype(float).ravel()
    return c


def kura(rng, L, W, t, svinuti=0.4, nu=18, nv=28):
    """Kousek kůry (skořice): prohnutá destička s tloušťkou, roztřepené konce.
    Vnější strana má druh 1 (tmavá kůra), vnitřní 0 (světlá)."""
    u = np.linspace(0, 1, nu)
    a = np.linspace(0, 2 * np.pi, nv, endpoint=False)
    U, A = np.meshgrid(u, a, indexing='ij')
    ca, sa = np.cos(A), np.sin(A)
    s = 0.5 * W * np.sign(ca) * np.abs(ca) ** 0.3       # přes šířku
    z = 0.5 * t * np.sign(sa) * np.abs(sa) ** 0.4       # tloušťka
    z = z * (1 + 0.25 * _vlny(rng, 5, 2 * np.pi / (0.3 * L))(L * U, s))   # hrbolatá kůra
    roztrep = 1 + 0.12 * _vlny(rng, 4, 2 * np.pi / (0.4 * W))(s, np.zeros_like(s))
    x = L * (U - 0.5) * roztrep
    y = s
    if svinuti > 0:
        R = W / (2 * np.pi * svinuti)
        y, z = (R - z) * np.sin(s / R), R - (R - z) * np.cos(s / R)
    z = z + 0.08 * L * (2 * (U - 0.5)) ** 2 * rng.uniform(-1, 1)
    v3 = np.stack([x, y, z], -1).reshape(-1, 3)
    v3 -= v3.mean(0)
    uv = np.stack([U, (s / W + 0.5)], -1).reshape(-1, 2)
    d = (sa < 0).astype(float).ravel()                  # spodní strana = vnější kůra
    return {'v': v3, 'f': _mrizka(nu, nv, cyklicky=True), 'uv': uv, 'd': d}


def kulicka(rng, r, protazeni=1.3, rasy=0.22, nu=30, nv=26):
    """Lístek svinutý do kuličky (oolong): koule se záhyby, mírně protáhlá."""
    th = np.linspace(0, np.pi, nu)              # póly zavřené (jinak by v kuličce byla díra)
    ph = np.linspace(0, 2 * np.pi, nv, endpoint=False)
    T, P = np.meshgrid(th, ph, indexing='ij')
    d = np.stack([np.sin(T) * np.cos(P), np.sin(T) * np.sin(P), np.cos(T)], -1)
    zahyby = np.zeros(T.shape)
    for _ in range(9):                          # ostré hřbety jako přeložený list
        k = rng.normal(size=3)
        k = k / np.linalg.norm(k) * rng.uniform(6, 14)
        zahyby += 1 - np.abs(np.sin(d @ k + rng.uniform(0, 6.3)))
    zahyby = zahyby / 9 - 0.5
    hlad = _vlny(rng, 5, 3.0)(d[..., 0] * 2, d[..., 1] * 2 + d[..., 2])
    rr = r * (1 + rasy * zahyby + 0.12 * hlad)
    v3 = d * rr[..., None]
    v3[..., 0] *= protazeni
    v3[..., 2] *= rng.uniform(0.75, 0.95)
    v3 = v3.reshape(-1, 3)
    v3 -= v3.mean(0)
    uv = np.stack([T / np.pi, P / (2 * np.pi)], -1).reshape(-1, 2)
    return {'v': v3, 'f': _mrizka(nu, nv, cyklicky=True), 'uv': uv}


def platek(rng, L, W, t, ohyb=(0.0, 0.0), zmac=0.0, tvar=0.2, nu=16, nv=28):
    """Destička s tloušťkou (kůra citrusů, šípek): zavřená, okraje nepravidelně
    ořezané. ohyb: zakřivení (1/m) podél délky a šířky, kladné = miska dolů.
    Horní strana (slupka) má druh 1, spodní strana a řezné hrany druh 0."""
    u = np.linspace(0, 1, nu)
    a = np.linspace(0, 2 * np.pi, nv, endpoint=False)
    U, A = np.meshgrid(u, a, indexing='ij')
    ca, sa = np.cos(A), np.sin(A)
    s = 0.5 * W * np.sign(ca) * np.abs(ca) ** 0.25
    z = 0.5 * t * np.sign(sa) * np.abs(sa) ** 0.35
    z = z * np.sqrt(np.clip(1 - np.abs(2 * U - 1) ** 8, 0, 1))      # zavřené konce
    x = L * (U - 0.5)
    obrys = 1 + tvar * _vlny(rng, 4, 2 * np.pi / (0.9 * max(L, W)))(x, s)
    x, y = x * obrys, s * obrys
    if zmac:
        z = z + zmac * t * _vlny(rng, 6, 2 * np.pi / (0.5 * max(L, W)))(x, y)
    z = z - 0.5 * (ohyb[0] * x ** 2 + ohyb[1] * y ** 2)
    v3 = np.stack([x, y, z], -1).reshape(-1, 3)
    v3 -= v3.mean(0)
    uv = np.stack([U, s / W + 0.5], -1).reshape(-1, 2)
    d = (sa > 0.05).astype(float).ravel()
    return {'v': v3, 'f': _mrizka(nu, nv, cyklicky=True), 'uv': uv, 'd': d}


def semeno(rng, L, r, zebra=5, vyska_zeber=0.15, ostrost=4, spicka=(0.55, 0.55), ohyb=0.0,
           plocha=0.0, d_zebra=True, nu=22, nv=30):
    """Vřetenovitý plod nebo poupě s podélnými žebry (fenykl, levandule, kardamom).
    spicka: exponent profilu u spodního a horního konce (menší = tupější),
    plocha: zploštění jedné strany (polovina plodu fenyklu).
    d_zebra: žebra mají druh 1 (světlejší), zbytek 0."""
    u = np.linspace(0, 1, nu)
    a = np.linspace(0, 2 * np.pi, nv, endpoint=False)
    U, A = np.meshgrid(u, a, indexing='ij')
    sn = np.sin(np.pi * U)
    prof = np.where(U < 0.5, sn ** spicka[0], sn ** spicka[1])
    zeb = (0.5 + 0.5 * np.cos(zebra * A + rng.uniform(0, 6.3))) ** ostrost
    rr = r * prof * (1 + vyska_zeber * zeb)
    x = L * (U - 0.5)
    y = rr * np.cos(A)
    z = rr * np.sin(A)
    if plocha:
        z = np.where(z < 0, z * (1 - plocha), z)
    if ohyb:
        z = z + ohyb * L * (2 * (U - 0.5)) ** 2
    v3 = np.stack([x, y, z], -1).reshape(-1, 3)
    v3 -= v3.mean(0)
    uv = np.stack([U, A / (2 * np.pi)], -1).reshape(-1, 2)
    d = ((zeb > 0.35).astype(float) if d_zebra else np.zeros(zeb.shape)).ravel()
    return {'v': v3, 'f': _mrizka(nu, nv, cyklicky=True), 'uv': uv, 'd': d}


def kvitek(rng, r, okvet=14, zachovano=0.8):
    """Úbor heřmánku: vypouklý žlutý terč (druh 1) s plochým zelenavým spodkem
    (druh 2) a kolem svěšené scvrklé jazykové květy (druh 0)."""
    nu, nv = 16, 18
    th = np.linspace(0, np.pi, nu)
    ph = np.linspace(0, 2 * np.pi, nv, endpoint=False)
    T, P = np.meshgrid(th, ph, indexing='ij')
    d = np.stack([np.sin(T) * np.cos(P), np.sin(T) * np.sin(P), np.cos(T)], -1)
    hrb = np.zeros(T.shape)
    for _ in range(6):                          # drobné hrbolky kvítků v terči
        k = rng.normal(size=3)
        hrb += np.abs(np.sin(d @ (k / np.linalg.norm(k) * rng.uniform(14, 22)) + rng.uniform(0, 6.3)))
    v = d * (r * (1 + 0.07 * (hrb / 6 - 0.5)))[..., None]
    v[..., 2] = np.where(v[..., 2] > 0, v[..., 2] * rng.uniform(0.8, 1.15), v[..., 2] * 0.4)
    terc = {'v': v.reshape(-1, 3), 'f': _mrizka(nu, nv, cyklicky=True),
            'uv': np.stack([T / np.pi, P / (2 * np.pi)], -1).reshape(-1, 2),
            'd': np.where(d[..., 2] > -0.2, 1.0, 2.0).ravel()}
    casti = [terc]
    for i in range(okvet):
        if rng.random() > zachovano:
            continue
        Lp = r * rng.uniform(1.3, 2.2)
        p = druh_casti(list_(rng, Lp, r * rng.uniform(0.45, 0.62), nu=9, nv=5, svinuti=rng.uniform(0.1, 0.45),
                             zmac=0.45, zkrut=rng.uniform(-1.5, 1.5), spicka=0.5, zaklad=0.9), 0)
        phi = 2 * np.pi * i / okvet + rng.normal(0, 0.12)
        p = posun(dict(p, v=p['v'] + [0.5 * Lp, 0, 0]), [0.9 * r * math.cos(phi), 0.9 * r * math.sin(phi), 0],
                  rot_xyz(0, rng.uniform(0.5, 1.45), phi))      # svěšené dolů
        casti.append(p)
    return spoj(*casti)


def shluk(rng, n, r):
    """Drobenka mrazem sušené maliny: shluk malých kuliček (peckovičky)."""
    R0 = r * n ** (1 / 3) * 0.85
    casti = []
    for _ in range(n):
        p = rng.uniform(-1, 1, 3)
        while np.linalg.norm(p) > 1:
            p = rng.uniform(-1, 1, 3)
        k = kulicka(rng, r * rng.uniform(0.8, 1.15), protazeni=1.05, rasy=0.1, nu=12, nv=12)
        casti.append(posun(k, p * R0 * np.array([1, 1, 0.75])))
    return spoj(*casti)


def _mezi(c, a, b):
    """Trubku podél osy x (vycentrovanou) postaví mezi body a a b."""
    a, b = np.asarray(a, float), np.asarray(b, float)
    dv = b - a
    return posun(c, (a + b) / 2, rot_xyz(0, -math.atan2(dv[2], math.hypot(dv[0], dv[1])), math.atan2(dv[1], dv[0])))


def spoj(*casti):
    """Spojí několik tvarů do jednoho kusu (např. kulička se stonkem)."""
    v, f, uv, d, off = [], [], [], [], 0
    for c in casti:
        v.append(c['v']); f.append(c['f'] + off); uv.append(c['uv']); off += len(c['v'])
        d.append(c.get('d', np.full(len(c['v']), -1.0)))
    return {'v': np.concatenate(v), 'f': np.concatenate(f), 'uv': np.concatenate(uv), 'd': np.concatenate(d)}


def posun(c, t, rot=None):
    v = c['v'] @ rot.T if rot is not None else c['v']
    return dict(c, v=v + np.asarray(t))


def druh_casti(c, druh):
    return dict(c, d=np.full(len(c['v']), float(druh)))


def rot_xyz(rx, ry, rz):
    cx, sx, cy, sy, cz, sz = math.cos(rx), math.sin(rx), math.cos(ry), math.sin(ry), math.cos(rz), math.sin(rz)
    Rx = np.array([[1, 0, 0], [0, cx, -sx], [0, sx, cx]])
    Ry = np.array([[cy, 0, sy], [0, 1, 0], [-sy, 0, cy]])
    Rz = np.array([[cz, -sz, 0], [sz, cz, 0], [0, 0, 1]])
    return Rz @ Ry @ Rx


# ───────────────────────── čaje ─────────────────────────
# Každý kus: (váha, funkce rng → tvar, druh) — druh 0 list, 1 pupen/tip, 2 stonek.
# lezi: rozptyl náklonu (rad), kolem: náhodné otočení kolem vlastní osy (trubky).

# Tvary a barvy podle fotek běžných sypaných čajů do směsí (Ceylon OP, China
# Sencha, Pai Mu Tan, Tie Guan Yin, rooibos, zázvor a skořice nakrájené na čaj).

def _cerny(rng):
    # Ceylon OP: dlouhé drátovité proužky, zvlněné a zkroucené, černohnědé
    return trubka(rng, rng.uniform(6, 13) * MM, rng.uniform(0.38, 0.6) * MM, zplosteni=rng.uniform(0.45, 0.7),
                  zkrut=rng.uniform(-5, 5), ohyb=rng.uniform(-0.12, 0.12), zuzeni=0.5, hrbol=0.25,
                  vlna=rng.uniform(0.03, 0.08), nu=34, nv=8)


def _cerny_list(rng):
    return list_(rng, rng.uniform(4, 8) * MM, rng.uniform(2.5, 4) * MM, svinuti=rng.uniform(0.5, 0.9),
                 zkrut=rng.uniform(-2, 2), zmac=rng.uniform(0.3, 0.5), prelozeni=0.1, nu=20, nv=11)


def _cerny_tip(rng):
    return trubka(rng, rng.uniform(4, 8) * MM, rng.uniform(0.4, 0.6) * MM, zplosteni=0.7, zkrut=rng.uniform(-2, 2),
                  ohyb=rng.uniform(-0.12, 0.12), zuzeni=0.7, hrbol=0.15, nu=22, nv=8)


def _zeleny(rng):
    # China Sencha: ploché proužky listu přeložené podél žilky, olivové až žlutozelené
    return list_(rng, rng.uniform(5, 14) * MM, rng.uniform(1.6, 3.0) * MM, svinuti=rng.uniform(0.2, 0.45),
                 prelozeni=rng.uniform(0.25, 0.45), zkrut=rng.uniform(-2, 2), ohyb=rng.uniform(-0.15, 0.15),
                 zmac=rng.uniform(0.25, 0.45), spicka=1.2, nu=30, nv=9)


def _zeleny_kousek(rng):
    return list_(rng, rng.uniform(3, 7) * MM, rng.uniform(2.6, 5) * MM, svinuti=rng.uniform(0.1, 0.35),
                 prelozeni=rng.uniform(0.1, 0.3), zmac=rng.uniform(0.3, 0.5), zkrut=rng.uniform(-1, 1),
                 spicka=0.6, zaklad=0.5, nu=18, nv=11)


def _zeleny_stonek(rng):
    return trubka(rng, rng.uniform(4, 9) * MM, rng.uniform(0.22, 0.32) * MM, ohyb=rng.uniform(-0.1, 0.1),
                  zuzeni=0.2, nu=12, nv=6)


def _bily_list(rng):
    L = rng.uniform(9, 17) * MM
    return list_(rng, L, L * rng.uniform(0.38, 0.5), svinuti=rng.uniform(0.3, 0.75), zkrut=rng.uniform(-2, 2),
                 ohyb=rng.uniform(-0.2, 0.2), zmac=rng.uniform(0.4, 0.65), prelozeni=rng.uniform(0.1, 0.3),
                 zubky=0.05, nu=32, nv=15)


def _bily_pupen(rng):
    return list_(rng, rng.uniform(8, 13) * MM, rng.uniform(3.2, 4.4) * MM, svinuti=rng.uniform(0.95, 1.25),
                 zkrut=rng.uniform(-0.5, 0.5), ohyb=rng.uniform(-0.1, 0.1), zmac=0.06, spicka=1.5, zaklad=0.6, nu=26)


def _bily_stonek(rng):
    return trubka(rng, rng.uniform(8, 16) * MM, rng.uniform(0.35, 0.55) * MM, ohyb=rng.uniform(-0.1, 0.1), zuzeni=0.3)


def _oolong(rng):
    # Tie Guan Yin: pevně svinuté vrásčité kuličky, často s hnědým stonkem
    r = rng.uniform(1.7, 3.0) * MM
    k = kulicka(rng, r, protazeni=rng.uniform(1.1, 1.7), rasy=rng.uniform(0.4, 0.55))
    if rng.random() < 0.5:
        st = druh_casti(trubka(rng, rng.uniform(2.5, 5) * MM, 0.32 * MM, zuzeni=0.3, ohyb=0.1), 2)
        a = rng.uniform(0, 2 * np.pi)
        k = spoj(k, posun(st, [1.6 * r * math.cos(a), 1.6 * r * math.sin(a), 0.4 * r], rot_xyz(0, rng.uniform(-0.4, 0.4), a)))
    return k


def _oolong_rozvinuty(rng):
    return list_(rng, rng.uniform(6, 10) * MM, rng.uniform(3, 5) * MM, svinuti=rng.uniform(0.4, 0.7),
                 zmac=rng.uniform(0.3, 0.5), zkrut=rng.uniform(-1, 1), prelozeni=0.15, nu=20, nv=11)


def _rooibos(rng):
    # nasekané jehličky: tenké, hranaté, různě dlouhé, měděně červenohnědé
    return trubka(rng, rng.uniform(1.2, 4.5) * MM, rng.uniform(0.18, 0.3) * MM, zplosteni=rng.uniform(0.6, 0.85),
                  zkrut=rng.uniform(-3, 3), ohyb=rng.uniform(-0.2, 0.2), zuzeni=0.2, hrbol=0.3, nu=10, nv=5)


def _zazvor(rng):
    # sušený zázvor nakrájený na čaj: drobné nepravidelné kousky, světle béžové
    return kostka(rng, rng.uniform(1.0, 2.3) * MM, hrany=rng.uniform(0.18, 0.35), vlakna=0.08)


def _zazvor_slupka(rng):
    return druh_casti(kostka(rng, rng.uniform(1.0, 2.0) * MM, hrany=0.25, vlakna=0.03), 1)


def _skorice(rng):
    # skořice nakrájená na čaj: prohnuté třísky kůry, venku tmavá, uvnitř světlejší
    return kura(rng, rng.uniform(1.8, 4.5) * MM, rng.uniform(1.0, 2.4) * MM, rng.uniform(0.4, 0.8) * MM,
                svinuti=rng.uniform(0.05, 0.3))


def _rooibos_stonek(rng):
    return trubka(rng, rng.uniform(2, 5) * MM, rng.uniform(0.2, 0.3) * MM, ohyb=rng.uniform(-0.1, 0.1),
                  zuzeni=0.15, hrbol=0.12, nu=12, nv=6)


# Byliny, květy, ovoce a koření. Tvary a barvy podle fotek, jak se prodávají
# nakrájené do čajových směsí.

def _hermanek(rng):
    # sušené úbory: žlutý vypouklý terč, scvrklé krémově bílé okvětní lístky
    return kvitek(rng, rng.uniform(1.2, 2.0) * MM, okvet=int(rng.integers(13, 19)), zachovano=rng.uniform(0.6, 1.0))


def _hermanek_holy(rng):
    return kvitek(rng, rng.uniform(1.1, 1.9) * MM, zachovano=rng.uniform(0.0, 0.3))


def _okvetni(rng):
    return list_(rng, rng.uniform(2.5, 4.5) * MM, rng.uniform(0.9, 1.4) * MM, svinuti=rng.uniform(0.1, 0.5), zmac=0.5,
                 zkrut=rng.uniform(-2, 2), spicka=0.5, nu=10, nv=5)


def _stonek_tenky(rng):
    return trubka(rng, rng.uniform(3, 8) * MM, rng.uniform(0.28, 0.42) * MM, ohyb=rng.uniform(-0.15, 0.15), zuzeni=0.2,
                  nu=12, nv=6)


def _list_bylina(rng, zmac=(0.5, 0.8)):
    # nakrájený list (meduňka, máty): zmačkané kousky se zoubkovaným okrajem
    return list_(rng, rng.uniform(2.5, 7) * MM, rng.uniform(2, 5) * MM, svinuti=rng.uniform(0.1, 0.45),
                 zmac=rng.uniform(*zmac), zkrut=rng.uniform(-1.5, 1.5), ohyb=rng.uniform(-0.15, 0.15),
                 prelozeni=rng.uniform(0, 0.2), zubky=0.12, spicka=0.45, zaklad=0.45, nu=18, nv=13)


def _list_kaderavy(rng):
    return _list_bylina(rng, zmac=(0.7, 1.0))


def _stonek_ctyrhranny(rng):
    # máty mají čtyřhranný stonek
    return trubka(rng, rng.uniform(2.5, 7) * MM, rng.uniform(0.35, 0.6) * MM, zplosteni=0.85, ohyb=rng.uniform(-0.1, 0.1),
                  zuzeni=0.1, hrbol=0.1, nu=12, nv=4)


def _lipa_listen(rng):
    # listen: dlouhý jazykovitý, světle žlutozelený, papírový, se žilkami
    return list_(rng, rng.uniform(9, 20) * MM, rng.uniform(3.5, 6) * MM, svinuti=rng.uniform(0.02, 0.2),
                 zmac=rng.uniform(0.2, 0.4), zkrut=rng.uniform(-0.8, 0.8), ohyb=rng.uniform(-0.12, 0.12),
                 spicka=0.35, zaklad=0.35, nu=30, nv=9)


def _lipa_kvet(rng):
    # květenství: pár kulatých krémově žlutých kvítků na tenkých stopkách
    casti, stred = [], np.zeros(3)
    for _ in range(int(rng.integers(2, 6))):
        p = rng.normal(size=3)
        p = p / np.linalg.norm(p) * rng.uniform(1.2, 2.6) * MM
        p[2] *= 0.5
        casti.append(druh_casti(posun(kulicka(rng, rng.uniform(0.8, 1.3) * MM, protazeni=1.1, rasy=0.35, nu=14, nv=14), p), 1))
        casti.append(druh_casti(_mezi(trubka(rng, np.linalg.norm(p), 0.16 * MM, zuzeni=0.1, nu=6, nv=5), stred, p), 2))
    if rng.random() < 0.6:
        a = rng.uniform(0, 2 * np.pi)
        Ls = rng.uniform(3, 6) * MM
        casti.append(druh_casti(_mezi(trubka(rng, Ls, 0.22 * MM, zuzeni=0.1, nu=8, nv=5), stred,
                                      [Ls * math.cos(a), Ls * math.sin(a), -0.5 * MM]), 2))
    return spoj(*casti)


def _jablko(rng):
    # kostičky sušeného jablka, krémově béžová dužina, občas kus slupky
    return kostka(rng, rng.uniform(2.0, 3.8) * MM, hrany=rng.uniform(0.25, 0.4), vlakna=0.0,
                  slupka=float(rng.choice([0.0, 0.0, 0.2, 0.3])))


def _jahoda(rng):
    # mrazem sušené kousky: venku červené, řez růžově bílý a pórovitý
    return kostka(rng, rng.uniform(1.6, 3.0) * MM, hrany=rng.uniform(0.35, 0.6), vlakna=0.0, slupka=rng.uniform(0.35, 0.65))


def _malina(rng):
    n = int(rng.integers(3, 9)) if rng.random() < 0.7 else int(rng.integers(10, 17))
    return shluk(rng, n, rng.uniform(0.6, 0.85) * MM)


def _boruvka(rng):
    # sušené borůvky: tmavé, vrásčité kuličky, nahoře světlejší korunka
    c = kulicka(rng, rng.uniform(1.8, 2.8) * MM, protazeni=rng.uniform(1.0, 1.15), rasy=rng.uniform(0.5, 0.65), nu=24, nv=22)
    c['d'] = (c['uv'][:, 0] < 0.1).astype(float)
    return c


def _sipek(rng):
    # půlky a kousky slupky: venku lesklá červenooranžová, uvnitř světlejší
    L = rng.uniform(4, 9) * MM
    k = 1 / (rng.uniform(3.5, 6) * MM)
    return platek(rng, L, L * rng.uniform(0.6, 0.95), rng.uniform(0.6, 1.0) * MM, ohyb=(k, k * rng.uniform(0.7, 1.1)),
                  zmac=0.35, tvar=0.25)


def _ibisek(rng):
    # kousky kalichu: tmavě vínové, zmačkané, papírové, se světlejšími žilkami
    L = rng.uniform(6, 13) * MM
    return list_(rng, L, L * rng.uniform(0.45, 0.75), svinuti=rng.uniform(0.15, 0.55), zmac=rng.uniform(0.6, 0.95),
                 zkrut=rng.uniform(-2, 2), ohyb=rng.uniform(-0.2, 0.2), prelozeni=rng.uniform(0.1, 0.3), spicka=1.3,
                 zaklad=0.5, nu=24, nv=13)


def _ruze(rng):
    # okvětní lístky: zaprášeně růžové až fialové, zmačkané, u báze krémové
    L = rng.uniform(5, 11) * MM
    p = list_(rng, L, L * rng.uniform(0.75, 1.05), svinuti=rng.uniform(0.15, 0.5), zmac=rng.uniform(0.55, 0.9),
              zkrut=rng.uniform(-1.5, 1.5), ohyb=rng.uniform(-0.2, 0.2), prelozeni=rng.uniform(0, 0.15),
              spicka=0.3, zaklad=1.6, nu=22, nv=15)
    p['d'] = np.where(p['uv'][:, 0] < rng.uniform(0.1, 0.2), 1.0, 0.0)
    return p


def _trava(rng):
    # citronová tráva: ploché rovně uříznuté proužky, khaki, vláknité
    return list_(rng, rng.uniform(3, 10) * MM, rng.uniform(1.5, 3.5) * MM, svinuti=rng.uniform(0.05, 0.3),
                 prelozeni=rng.uniform(0.1, 0.3), zmac=rng.uniform(0.08, 0.2), zkrut=rng.uniform(-0.6, 0.6),
                 ohyb=rng.uniform(-0.08, 0.08), spicka=0.0, zaklad=0.0, nu=14, nv=9)


def _trava_stonek(rng):
    return trubka(rng, rng.uniform(3, 7) * MM, rng.uniform(0.8, 1.3) * MM, zplosteni=rng.uniform(0.35, 0.6), zuzeni=0.0,
                  ohyb=rng.uniform(-0.06, 0.06), nu=12, nv=10)


def _fenykl(rng):
    # podlouhlé žebrované plody, šedozelené, žebra světlejší
    L = rng.uniform(4, 6.5) * MM
    s = semeno(rng, L, L * rng.uniform(0.15, 0.19), zebra=5, vyska_zeber=0.12, ostrost=10, spicka=(0.3, 0.3),
               ohyb=rng.uniform(-0.08, 0.08), plocha=rng.uniform(0.2, 0.45))
    if rng.random() < 0.35:
        Ls = rng.uniform(1, 2.5) * MM
        s = spoj(s, druh_casti(posun(trubka(rng, Ls, 0.17 * MM, zuzeni=0.2, nu=6, nv=5), [-0.5 * (L + Ls) + 0.2 * MM, 0, 0]), 2))
    return s


def _levandule(rng):
    # poupata: drobná, šedě modrofialová, s jemnými podélnými žebry
    L = rng.uniform(3.2, 5.0) * MM
    return semeno(rng, L, L * rng.uniform(0.13, 0.16), zebra=int(rng.integers(10, 14)), vyska_zeber=0.08, ostrost=3,
                  spicka=(1.1, 0.45), ohyb=rng.uniform(-0.1, 0.1), nu=16, nv=26)


def _kardamom(rng):
    # zelené tobolky: trojboké, na koncích zašpičatělé, jemně rýhované
    L = rng.uniform(9, 15) * MM
    return semeno(rng, L, L * rng.uniform(0.17, 0.22), zebra=3, vyska_zeber=0.22, ostrost=1, spicka=(0.55, 0.4),
                  ohyb=rng.uniform(-0.06, 0.06), d_zebra=False, nu=26, nv=30)


def _kardamom_semeno(rng):
    return druh_casti(kostka(rng, rng.uniform(0.7, 1.1) * MM, hrany=0.5, vlakna=0.0), 1)


def _kura_citrus(rng):
    # kostičky sušené kůry: slupka nahoře, bílá vrstva vespod a na řezu
    L = rng.uniform(2.5, 6.5) * MM
    k = rng.uniform(20, 120)
    return platek(rng, L, L * rng.uniform(0.6, 1.0), rng.uniform(0.8, 1.5) * MM, ohyb=(k, k * rng.uniform(0.3, 1.0)),
                  zmac=0.15, tvar=0.15)


CAJE = {
    'cerny-caj': dict(R=27 * MM, H=15 * MM, kusy=[(0.88, _cerny, 0), (0.12, _cerny_list, 0)], lezi=0.25, kolem=True, sedne=40,
                      barvy=dict(list=['#0d0806', '#120b08', '#170e0a', '#1d120c', '#24160e', '#2c1a11'], pupen=['#5e3d1f', '#74502a'], stonek=['#3a2a1a', '#4a3520']),
                      drsnost=0.45, lesk=0.35, pupen_chlup=0.3),
    'zeleny-caj': dict(R=27 * MM, H=15 * MM, kusy=[(0.68, _zeleny, 0), (0.24, _zeleny_kousek, 0), (0.08, _zeleny_stonek, 2)],
                       lezi=0.3, kolem=False, sedne=40,
                       barvy=dict(list=['#222510', '#2a2e14', '#333818', '#3c411c', '#454920', '#4f5025', '#3e3820'], pupen=['#6f7a3e', '#808a48'], stonek=['#6a6436', '#78723e']),
                       drsnost=0.5, lesk=0.3, pupen_chlup=0.2),
    'bily-caj': dict(R=30 * MM, H=16 * MM, kusy=[(0.55, _bily_list, 0), (0.33, _bily_pupen, 1), (0.12, _bily_stonek, 2)], lezi=0.3, kolem=False, sedne=45,
                     barvy=dict(list=['#343b22', '#3f472a', '#4b5332', '#575d3a', '#544c33', '#433829'], pupen=['#949886', '#a6aa98'], stonek=['#76694a', '#857856']),
                     drsnost=0.66, lesk=0.3, pupen_chlup=1.0),
    'oolong': dict(R=26 * MM, H=14 * MM, kusy=[(0.86, _oolong, 0), (0.14, _oolong_rozvinuty, 0)], lezi=0.6, kolem=False, sedne=70,
                   barvy=dict(list=['#12170e', '#192013', '#202918', '#28311d', '#313922', '#3c4227', '#1e1f16'], pupen=['#5d6b33', '#6d7a3c'], stonek=['#7a5c36', '#8a6a40']),
                   drsnost=0.58, lesk=0.25, pupen_chlup=0.2),
    'rooibos': dict(R=22 * MM, H=12 * MM, kusy=[(0.92, _rooibos, 0), (0.08, _rooibos_stonek, 2)], lezi=0.3, kolem=True, sedne=40,
                    barvy=dict(list=['#4e1d0c', '#5e2410', '#6e2c14', '#7c3418', '#8a3e1d', '#38170a'], pupen=['#8a4a2a', '#9a5632'], stonek=['#94562c', '#a06236']),
                    drsnost=0.78, lesk=0.1, pupen_chlup=0.1),
    'zazvor': dict(R=22 * MM, H=11 * MM, kusy=[(0.8, _zazvor, 0), (0.2, _zazvor_slupka, 1)], lezi=0.6, kolem=False, sedne=40,
                   barvy=dict(list=['#7a5c3a', '#86663f', '#927044', '#9e7a4a', '#aa8552', '#6a4e32'], pupen=['#56402a', '#604830'], stonek=['#56402a', '#604830']),
                   drsnost=0.9, lesk=0.05, pupen_chlup=0.0, zilky=0.0, vlakna=0.5),
    'skorice': dict(R=22 * MM, H=11 * MM, kusy=[(1.0, _skorice, 0)], lezi=0.35, kolem=False, sedne=55,
                    barvy=dict(list=['#6e4222', '#7a4a26', '#86522a', '#925c30'], pupen=['#3a2214', '#462a18', '#52321c'], stonek=['#462a18', '#52321c']),
                    drsnost=0.78, lesk=0.05, pupen_chlup=0.0, zilky=0.0, vlakna=0.8),
    # otoc: jak často kus leží vzhůru nohama (heřmánek spíš terčem nahoru)
    # detail: o kolik dál je makro kamera (velké kusy jako tobolky kardamomu)
    # porez: pórovitý povrch (ovoce), drsnost_pupen: drsnost slupky (druh 1)
    'hermanek': dict(R=24 * MM, H=12 * MM, kusy=[(0.65, _hermanek, 1), (0.13, _hermanek_holy, 1), (0.16, _okvetni, 0), (0.06, _stonek_tenky, 2)],
                     lezi=0.5, kolem=False, sedne=50, otoc=0.25,
                     barvy=dict(list=['#a09680', '#aca48c', '#b8b09a', '#beb49a', '#c4bca6'], pupen=['#7e6224', '#8a6c24', '#94782c', '#a08434', '#ac8e3c'], stonek=['#6a6a48', '#74724e', '#7e7c56']),
                     drsnost=0.75, lesk=0.1, pupen_chlup=0.0, zilky=0.2, porez=0.5, porez_pupen=True),
    'medunka': dict(R=26 * MM, H=13 * MM, kusy=[(0.92, _list_bylina, 0), (0.08, _stonek_ctyrhranny, 2)], lezi=0.35, kolem=False, sedne=45,
                    barvy=dict(list=['#444c30', '#4a5236', '#545c3c', '#5c6242', '#4e5034', '#62603e'], pupen=['#5c6242', '#66684a'], stonek=['#5a5a3a', '#66643f']),
                    drsnost=0.7, lesk=0.1, pupen_chlup=0.0, zilky=0.8),
    'lipa': dict(R=28 * MM, H=13 * MM, kusy=[(0.55, _lipa_listen, 0), (0.35, _lipa_kvet, 1), (0.10, _stonek_tenky, 2)], lezi=0.3, kolem=False, sedne=45, detail=1.3,
                 barvy=dict(list=['#8a8654', '#948f5c', '#9e9864', '#a8a06a', '#80784c', '#b0a874'], pupen=['#9a8048', '#a48c56', '#b09a62', '#8e7442'], stonek=['#7c6c44', '#887648']),
                 drsnost=0.75, lesk=0.1, pupen_chlup=0.3, zilky=1.0),
    'mata-peprna': dict(R=26 * MM, H=13 * MM, kusy=[(0.9, _list_bylina, 0), (0.1, _stonek_ctyrhranny, 2)], lezi=0.35, kolem=False, sedne=45,
                        barvy=dict(list=['#2a2e20', '#2e3424', '#34382a', '#363c2a', '#3c4430', '#424434'], pupen=['#3c4430', '#444a34'], stonek=['#4a3a32', '#56443a']),
                        drsnost=0.65, lesk=0.1, pupen_chlup=0.0, zilky=0.8),
    'mata-kaderava': dict(R=26 * MM, H=13 * MM, kusy=[(0.9, _list_kaderavy, 0), (0.1, _stonek_ctyrhranny, 2)], lezi=0.35, kolem=False, sedne=45,
                          barvy=dict(list=['#4e5440', '#545c44', '#5e664c', '#666c52', '#6c6e56'], pupen=['#666c52', '#70745a'], stonek=['#6a6448', '#76704f']),
                          drsnost=0.72, lesk=0.15, pupen_chlup=0.0, zilky=0.8),
    'jablko': dict(R=24 * MM, H=12 * MM, kusy=[(1.0, _jablko, 0)], lezi=0.6, kolem=False, sedne=45, detail=1.1,
                   barvy=dict(list=['#ae9874', '#b49e78', '#bba680', '#c6b28c', '#ccb994'], pupen=['#5c2414', '#6d2717', '#7a301c', '#8a4a24', '#6a4a20'], stonek=['#bba680', '#c6b28c']),
                   drsnost=0.85, lesk=0.05, pupen_chlup=0.0, zilky=0.0, porez=0.4, porez_meritko=4500, drsnost_pupen=0.6),
    'jahoda': dict(R=22 * MM, H=11 * MM, kusy=[(1.0, _jahoda, 0)], lezi=0.6, kolem=False, sedne=45,
                   barvy=dict(list=['#9c7a7e', '#a88486', '#b49294', '#bc9c9c', '#c4a6a4'], pupen=['#662d32', '#723338', '#7e393f', '#89474a'], stonek=['#a88486', '#b49294']),
                   drsnost=0.9, lesk=0.05, pupen_chlup=0.0, zilky=0.0, porez=0.5, porez_meritko=6000, drsnost_pupen=0.75),
    'malina': dict(R=22 * MM, H=11 * MM, kusy=[(1.0, _malina, 0)], lezi=0.6, kolem=False, sedne=45,
                   barvy=dict(list=['#6d3641', '#763c47', '#834752', '#925661', '#9e646c'], pupen=['#834752', '#925661'], stonek=['#834752', '#925661']),
                   drsnost=0.85, lesk=0.15, pupen_chlup=0.0, zilky=0.0, porez=0.4),
    'boruvka': dict(R=22 * MM, H=11 * MM, kusy=[(1.0, _boruvka, 0)], lezi=0.6, kolem=False, sedne=60,
                    barvy=dict(list=['#100e14', '#121018', '#16131e', '#1a1622', '#1e1a28'], pupen=['#38323e', '#423c48'], stonek=['#38323e', '#423c48']),
                    drsnost=0.55, lesk=0.7, pupen_chlup=0.0, zilky=0.0),
    'sipek': dict(R=23 * MM, H=11 * MM, kusy=[(1.0, _sipek, 0)], lezi=0.5, kolem=False, sedne=50,
                  barvy=dict(list=['#9a7960', '#a9886c', '#b4967a'], pupen=['#653329', '#70392e', '#7e4436', '#8b4e3e', '#965c46'], stonek=['#a9886c', '#b4967a']),
                  drsnost=0.85, lesk=0.05, pupen_chlup=0.0, zilky=0.0, porez=0.15, porez_meritko=4000, drsnost_pupen=0.4),
    'ibisek': dict(R=26 * MM, H=13 * MM, kusy=[(1.0, _ibisek, 0)], lezi=0.35, kolem=False, sedne=45, detail=1.2,
                   barvy=dict(list=['#2e080e', '#3a0a12', '#460c17', '#52101c', '#5e1422', '#6a1a28'], pupen=['#6a1a28', '#7a2232'], stonek=['#5e1422', '#6a1a28']),
                   drsnost=0.68, lesk=0.15, pupen_chlup=0.0, zilky=1.4),
    'ruze': dict(R=26 * MM, H=13 * MM, kusy=[(1.0, _ruze, 0)], lezi=0.35, kolem=False, sedne=45, detail=1.2,
                 barvy=dict(list=['#704f57', '#7d5a62', '#846368', '#8c6971', '#9b7880', '#a7868b'], pupen=['#b4a682', '#c0b28e'], stonek=['#846368', '#8c6971']),
                 drsnost=0.65, lesk=0.3, pupen_chlup=0.0, zilky=0.5),
    'citronova-trava': dict(R=24 * MM, H=12 * MM, kusy=[(0.85, _trava, 0), (0.15, _trava_stonek, 2)], lezi=0.3, kolem=False, sedne=45,
                            barvy=dict(list=['#7a7650', '#858158', '#8e8a5e', '#989466', '#a29c6c', '#8a8250'], pupen=['#989466', '#a29c6c'], stonek=['#a89c76', '#b4a880']),
                            drsnost=0.75, lesk=0.1, pupen_chlup=0.0, zilky=0.3, vlakna=0.9),
    'fenykl': dict(R=22 * MM, H=11 * MM, kusy=[(1.0, _fenykl, 0)], lezi=0.3, kolem=True, sedne=50,
                   barvy=dict(list=['#525638', '#5c6040', '#656946', '#6e724c', '#787a52'], pupen=['#767654', '#7e7c58', '#888660'], stonek=['#6a5e3e', '#766a46']),
                   drsnost=0.75, lesk=0.05, pupen_chlup=0.0, zilky=0.0, vlakna=0.3),
    'pomerancova-kura': dict(R=22 * MM, H=11 * MM, kusy=[(1.0, _kura_citrus, 0)], lezi=0.5, kolem=False, sedne=50, otoc=0.35,
                             barvy=dict(list=['#a89678', '#b4a284', '#bcab8e'], pupen=['#8a4a22', '#9c5020', '#9a5426', '#a85e2a', '#b46a30'], stonek=['#b4a284', '#bcab8e']),
                             drsnost=0.85, lesk=0.05, pupen_chlup=0.0, zilky=0.0, porez=0.5, porez_meritko=4000, drsnost_pupen=0.55),
    'citronova-kura': dict(R=22 * MM, H=11 * MM, kusy=[(1.0, _kura_citrus, 0)], lezi=0.5, kolem=False, sedne=50, otoc=0.35,
                           barvy=dict(list=['#b0a88c', '#bcb498', '#c6bea2'], pupen=['#9c8838', '#a8913e', '#b49c48', '#bea652', '#c4ae5e'], stonek=['#bcb498', '#c6bea2']),
                           drsnost=0.85, lesk=0.05, pupen_chlup=0.0, zilky=0.0, porez=0.5, porez_meritko=4000, drsnost_pupen=0.55),
    'levandule': dict(R=20 * MM, H=10 * MM, kusy=[(0.94, _levandule, 0), (0.06, _stonek_tenky, 2)], lezi=0.3, kolem=True, sedne=50,
                      barvy=dict(list=['#464255', '#4f495e', '#575168', '#5f5970', '#55555d', '#4a4a54'], pupen=['#696378', '#726c80'], stonek=['#5a6050', '#646a58']),
                      drsnost=0.7, lesk=0.3, pupen_chlup=0.0, zilky=0.0),
    'kardamom': dict(R=24 * MM, H=12 * MM, kusy=[(0.85, _kardamom, 0), (0.15, _kardamom_semeno, 1)], lezi=0.3, kolem=True, sedne=55, detail=1.8,
                     barvy=dict(list=['#545c3a', '#5a6440', '#626a40', '#646c46', '#6c744e', '#747a54'], pupen=['#2a1c14', '#34241a', '#3e2c1e'], stonek=['#646c46', '#6c744e']),
                     drsnost=0.8, lesk=0.05, pupen_chlup=0.0, zilky=0.0, vlakna=1.0),
}

# kód suroviny ve script.js → slug
SLUG = {'Black Tea': 'cerny-caj', 'Green Tea': 'zeleny-caj', 'White Tea': 'bily-caj', 'Oolong Tea': 'oolong',
        'Rooibos': 'rooibos', 'Ginger': 'zazvor', 'Cinnamon': 'skorice', 'Chamomile': 'hermanek',
        'Lemon Balm': 'medunka', 'Linden': 'lipa', 'Mint': 'mata-peprna', 'Spearmint': 'mata-kaderava',
        'Apple': 'jablko', 'Strawberry': 'jahoda', 'Raspberry': 'malina', 'Blueberry': 'boruvka',
        'Rose Hip': 'sipek', 'Hibiscus': 'ibisek', 'Rose': 'ruze', 'Lemongrass': 'citronova-trava',
        'Fennel': 'fenykl', 'Orange': 'pomerancova-kura', 'Lemon': 'citronova-kura', 'Lavender': 'levandule',
        'Cardamom': 'kardamom'}


# ───────────────────────── hromádka ─────────────────────────

def hromadka(slug, seed=1, max_kusu=40000, bunka=0.2 * MM, variant=48):
    """Vrstvení přes výškovou mapu. Vrací pole vrcholů, ploch, uv a atributů."""
    cfg = CAJE[slug]
    rng = np.random.default_rng(seed)
    vahy = np.array([k[0] for k in cfg['kusy']])
    vahy = vahy / vahy.sum()
    sablony = []
    for i in range(variant):
        k = cfg['kusy'][rng.choice(len(vahy), p=vahy)]
        sablony.append((k[1](np.random.default_rng(seed * 1000 + i)), k[2]))
    R, H = cfg['R'], cfg['H']
    ext = R * 1.6
    G = int(2 * ext / bunka)
    hm = np.zeros((G, G))
    gx = (np.arange(G) + 0.5) * bunka - ext
    GX, GY = np.meshgrid(gx, gx, indexing='ij')
    rr = np.hypot(GX, GY)
    cil = H * np.clip(1 - (rr / R) ** 1.8, 0, None)       # kopeček
    uvnitr = rr < R * 0.92
    V, F, UV, NA, DR = [], [], [], [], []
    off = 0
    for n in range(max_kusu):
        if n % 200 == 0 and n >= cfg.get('min_kusu', 0) and (cil - hm)[uvnitr].clip(0).mean() < 0.25 * MM:
            break
        tv, druh = sablony[rng.integers(len(sablony))]
        # náklon: list leží, trubky se točí kolem své osy
        rx = rng.uniform(0, 2 * np.pi) if cfg['kolem'] else (np.pi if rng.random() < cfg.get('otoc', 0.5) else 0) + rng.normal(0, cfg['lezi'])
        Rm = rot_xyz(rx, rng.normal(0, cfg['lezi']), rng.uniform(0, 2 * np.pi))
        s = rng.uniform(0.85, 1.15)
        loc = tv['v'] @ Rm.T * s
        # kam: z několika míst to, kde kopečku nejvíc chybí (občas zatoulaný kus okolo)
        if rng.random() < 0.012:
            a, r = rng.uniform(0, 2 * np.pi), R * rng.uniform(0.95, 1.45)
            px, py = r * math.cos(a), r * math.sin(a)
        else:
            best = None
            for _ in range(6):
                a, r = rng.uniform(0, 2 * np.pi), R * math.sqrt(rng.random())
                qx, qy = r * math.cos(a), r * math.sin(a)
                i, j = int((qx + ext) / bunka), int((qy + ext) / bunka)
                d = cil[i, j] - hm[i, j]
                if best is None or d > best[0]:
                    best = (d, qx, qy)
            _, px, py = best
        ix = ((loc[:, 0] + px + ext) / bunka).astype(int).clip(0, G - 1)
        iy = ((loc[:, 1] + py + ext) / bunka).astype(int).clip(0, G - 1)
        x0, y0 = ix.min(), iy.min()
        w, h = ix.max() - x0 + 1, iy.max() - y0 + 1
        spod = np.full((w, h), np.inf)
        vrch = np.full((w, h), -np.inf)
        np.minimum.at(spod, (ix - x0, iy - y0), loc[:, 2])
        np.maximum.at(vrch, (ix - x0, iy - y0), loc[:, 2])
        okno = hm[x0:x0 + w, y0:y0 + h]
        m = np.isfinite(spod)
        # kus si sedne: pár nejvyšších bodů pod ním smí lehce prorazit (jinak by
        # dlouhé lístky stály na špičkách a hromádka by byla vzdušná a vysoká)
        z = np.percentile(okno[m] - spod[m], cfg.get('sedne', 80)) - 0.05 * MM
        # vrch kusu do mapy (rozšířený o buňku, ať mezi vrcholy nezůstanou díry)
        top = np.where(np.isfinite(vrch), vrch + z, -np.inf)
        top = np.maximum.reduce([top, np.pad(top, ((1, 0), (0, 0)), constant_values=-np.inf)[:-1],
                                 np.pad(top, ((0, 1), (0, 0)), constant_values=-np.inf)[1:],
                                 np.pad(top, ((0, 0), (1, 0)), constant_values=-np.inf)[:, :-1],
                                 np.pad(top, ((0, 0), (0, 1)), constant_values=-np.inf)[:, 1:]])
        hm[x0:x0 + w, y0:y0 + h] = np.maximum(okno, top)
        V.append(loc + [px, py, z]); F.append(tv['f'] + off); UV.append(tv['uv'])
        NA.append(np.full(len(loc), rng.random()))
        dd = tv.get('d')
        DR.append(np.where(dd >= 0, dd, float(druh)) if dd is not None else np.full(len(loc), float(druh)))
        off += len(loc)
    return {'v': np.concatenate(V), 'f': np.concatenate(F), 'uv': np.concatenate(UV),
            'nahoda': np.concatenate(NA), 'druh': np.concatenate(DR), 'kusu': len(V), 'hm': hm, 'ext': ext, 'bunka': bunka}


def sit(nazev, d):
    """Jedna síť z celé hromádky (rychlé foreach_set místo tisíců objektů)."""
    me = bpy.data.meshes.get(nazev) or bpy.data.meshes.new(nazev)
    me.clear_geometry()
    nv, nf = len(d['v']), len(d['f'])
    me.vertices.add(nv)
    me.vertices.foreach_set('co', d['v'].astype(np.float32).ravel())
    me.loops.add(nf * 4)
    me.loops.foreach_set('vertex_index', d['f'].astype(np.int32).ravel())
    me.polygons.add(nf)
    me.polygons.foreach_set('loop_start', (np.arange(nf) * 4).astype(np.int32))
    me.polygons.foreach_set('loop_total', np.full(nf, 4, np.int32))
    me.update(calc_edges=True)
    me.polygons.foreach_set('use_smooth', np.ones(nf, bool))
    uvl = me.uv_layers.new(name='list')
    uvl.data.foreach_set('uv', d['uv'][d['f'].ravel()].astype(np.float32).ravel())
    for jm in ('nahoda', 'druh'):
        a = me.attributes.get(jm) or me.attributes.new(jm, 'FLOAT', 'POINT')
        a.data.foreach_set('value', d[jm].astype(np.float32))
    me.validate(clean_customdata=False)
    me.update()
    return me


def _hex(h):
    h = h.lstrip('#')
    return [((int(h[i:i + 2], 16) / 255) ** 2.2) for i in (0, 2, 4)] + [1.0]


def material(slug):
    cfg = CAJE[slug]
    jm = 'Sypany_' + slug
    m = bpy.data.materials.get(jm) or bpy.data.materials.new(jm)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    N, Lk = nt.nodes.new, nt.links.new
    out = N('ShaderNodeOutputMaterial'); out.location = (1400, 0)
    bs = N('ShaderNodeBsdfPrincipled'); bs.location = (1100, 0)
    Lk(bs.outputs[0], out.inputs['Surface'])

    def ramp(barvy, x):
        r = N('ShaderNodeValToRGB'); r.location = (x, 300)
        el = r.color_ramp.elements
        while len(el) > 1:
            el.remove(el[-1])
        for i, b in enumerate(barvy):
            e = el[0] if i == 0 else el.new(i / max(1, len(barvy) - 1))
            e.position = i / max(1, len(barvy) - 1)
            e.color = _hex(b)
        return r
    na = N('ShaderNodeAttribute'); na.attribute_name = 'nahoda'; na.location = (-900, 300)
    dr = N('ShaderNodeAttribute'); dr.attribute_name = 'druh'; dr.location = (-900, 0)
    rl, rp, rs = ramp(cfg['barvy']['list'], -600), ramp(cfg['barvy']['pupen'], -600), ramp(cfg['barvy']['stonek'], -600)
    rp.location.y, rs.location.y = 0, -300
    for r in (rl, rp, rs):
        Lk(na.outputs['Fac'], r.inputs['Fac'])

    def mix(a, b, fac, typ='MIX', x=0, y=0):
        n = N('ShaderNodeMix'); n.data_type = 'RGBA'; n.blend_type = typ; n.location = (x, y)
        Lk(fac, n.inputs['Factor']) if not isinstance(fac, float) else n.inputs['Factor'].__setattr__('default_value', fac)
        Lk(a, n.inputs['A']); Lk(b, n.inputs['B'])
        return n

    def math_(op, a, b=None, x=0, y=0, clamp=False):
        n = N('ShaderNodeMath'); n.operation = op; n.location = (x, y); n.use_clamp = clamp
        for i, s in enumerate((a, b)):
            if s is None:
                continue
            if isinstance(s, (int, float)):
                n.inputs[i].default_value = s
            else:
                Lk(s, n.inputs[i])
        return n.outputs[0]
    je_pupen = math_('COMPARE', dr.outputs['Fac'], 1.0, -600, -550)
    N_ = nt.nodes[-1]; N_.inputs[2].default_value = 0.5
    je_stonek = math_('GREATER_THAN', dr.outputs['Fac'], 1.5, -600, -700)
    c = mix(rl.outputs['Color'], rp.outputs['Color'], je_pupen, x=-300, y=200)
    c = mix(c.outputs['Result'], rs.outputs['Color'], je_stonek, x=-150, y=200)
    # žilka uprostřed a postranní žilky z uv lístku
    uvn = N('ShaderNodeUVMap'); uvn.uv_map = 'list'; uvn.location = (-1200, -300)
    sep = N('ShaderNodeSeparateXYZ'); sep.location = (-1000, -300)
    Lk(uvn.outputs['UV'], sep.inputs[0])
    od = math_('ABSOLUTE', math_('SUBTRACT', sep.outputs['Y'], 0.5, -850, -350), None, -700, -350)
    zilka = math_('SUBTRACT', 1.0, math_('DIVIDE', od, 0.07, -550, -350, clamp=True), -400, -350, clamp=True)
    vl = math_('SINE', math_('MULTIPLY', math_('ADD', sep.outputs['X'], math_('MULTIPLY', od, 0.8, -700, -450)), 70, -550, -450), None, -400, -450)
    zilky = math_('MULTIPLY', math_('SUBTRACT', vl, 0.82, -250, -450, clamp=True), 5.0, -100, -450, clamp=True)
    listy_jen = math_('SUBTRACT', 1.0, math_('MAXIMUM', je_pupen, je_stonek, -250, -600), -100, -600)
    zil = math_('MULTIPLY', math_('MAXIMUM', zilka, math_('MULTIPLY', zilky, 0.6, 50, -450)), listy_jen, 200, -450)
    zil = math_('MULTIPLY', zil, cfg.get('zilky', 1.0), 260, -450)
    # podélná vlákna (kůra skořice, zázvor)
    vlk = math_('MULTIPLY', math_('ADD', math_('SINE', math_('MULTIPLY', sep.outputs['Y'], 160, -550, -900), None, -400, -900), 1.0, -250, -900),
                0.5 * cfg.get('vlakna', 0.0), -100, -900)
    svetla = mix(c.outputs['Result'], rl.outputs['Color'], 0.0, 'SCREEN', 50, 200)
    Lk(math_('MULTIPLY', zil, 0.35, 350, -300), svetla.inputs['Factor'])
    # skvrnitost
    tc = N('ShaderNodeTexCoord'); tc.location = (-1200, 600)
    nz = N('ShaderNodeTexNoise'); nz.location = (-900, 650)
    nz.inputs['Scale'].default_value = 900; nz.inputs['Detail'].default_value = 4
    Lk(tc.outputs['Object'], nz.inputs['Vector'])
    skv = mix(svetla.outputs['Result'], nz.outputs['Color'], 0.12, 'OVERLAY', 400, 200)
    tm = N('ShaderNodeRGB'); tm.location = (400, 400); tm.outputs[0].default_value = (0.55, 0.55, 0.55, 1)
    skv = mix(skv.outputs['Result'], tm.outputs[0], math_('MULTIPLY', vlk, 0.35, 450, -900), 'MULTIPLY', 600, 200)
    # póry (sušené ovoce, kůra citrusů, terč heřmánku): rýhy mezi buňkami
    por = 0.0
    if cfg.get('porez'):
        vor = N('ShaderNodeTexVoronoi'); vor.location = (-900, 1100)
        vor.feature = 'DISTANCE_TO_EDGE'
        vor.inputs['Scale'].default_value = cfg.get('porez_meritko', 2500)
        Lk(tc.outputs['Object'], vor.inputs['Vector'])
        por = math_('SUBTRACT', 1.0, math_('DIVIDE', vor.outputs['Distance'], 0.12, -700, 1100, clamp=True), -550, 1100, clamp=True)
        if cfg.get('porez_pupen'):
            por = math_('MULTIPLY', por, je_pupen, -400, 1100)
        por = math_('MULTIPLY', por, cfg['porez'], -250, 1100)
        skv = mix(skv.outputs['Result'], tm.outputs[0], math_('MULTIPLY', por, 0.8, 600, 1100), 'MULTIPLY', 750, 200)
    Lk(skv.outputs['Result'], bs.inputs['Base Color'])
    # povrch: jemné vrásky + žilky
    nz2 = N('ShaderNodeTexNoise'); nz2.location = (-900, 900)
    nz2.inputs['Scale'].default_value = 3500; nz2.inputs['Detail'].default_value = 6
    Lk(tc.outputs['Object'], nz2.inputs['Vector'])
    vys = math_('ADD', math_('MULTIPLY', nz2.outputs['Fac'], 0.6, 500, -700), math_('MULTIPLY', zil, 0.8, 500, -800), 700, -750)
    vys = math_('ADD', vys, math_('MULTIPLY', vlk, 0.7, 600, -900), 800, -850)
    if cfg.get('porez'):
        vys = math_('SUBTRACT', vys, math_('MULTIPLY', por, 1.2, 700, -1000), 850, -950)
    bump = N('ShaderNodeBump'); bump.location = (900, -500)
    bump.inputs['Strength'].default_value = 0.5
    bump.inputs['Distance'].default_value = 0.00008
    Lk(vys, bump.inputs['Height'])
    Lk(bump.outputs['Normal'], bs.inputs['Normal'])
    if 'drsnost_pupen' in cfg:
        Lk(math_('ADD', math_('MULTIPLY', je_pupen, cfg['drsnost_pupen'] - cfg['drsnost'], 900, -250), cfg['drsnost'], 1000, -250),
           bs.inputs['Roughness'])
    else:
        bs.inputs['Roughness'].default_value = cfg['drsnost']
    bs.inputs['Specular IOR Level'].default_value = 0.4
    bs.inputs['Subsurface Weight'].default_value = 0.08
    bs.inputs['Subsurface Scale'].default_value = 0.0008
    # „chloupky“ pupenů (bílý čaj je stříbřitý): sheen podle druhu
    sh = math_('ADD', math_('MULTIPLY', je_pupen, cfg['pupen_chlup'], 800, -100), cfg['lesk'] * 0.5, 950, -100)
    Lk(sh, bs.inputs['Sheen Weight'])
    bs.inputs['Sheen Roughness'].default_value = 0.35
    return m


def postav(slug, seed=1):
    """Hromádka jako objekt Sypane_<slug> ve vlastní kolekci + kamery."""
    d = hromadka(slug, seed)
    me = sit('Sypane_' + slug, d)
    col = bpy.data.collections.get('Sypane_' + slug) or bpy.data.collections.new('Sypane_' + slug)
    ob = bpy.data.objects.get('Sypane_' + slug) or bpy.data.objects.new('Sypane_' + slug, me)
    ob.data = me
    if ob.name not in col.objects:
        col.objects.link(ob)
    me.materials.clear()
    me.materials.append(material(slug))
    kamery(slug, d)
    return {'kusu': d['kusu'], 'vrcholu': len(d['v']), 'vyska_mm': round(float(d['hm'].max()) * 1000, 1)}


def _kamera(jm, cil, smer, vzd, lens, fstop=None):
    cam = bpy.data.objects.get(jm)
    if not cam:
        cam = bpy.data.objects.new(jm, bpy.data.cameras.new(jm))
    cam.data.lens = lens
    cam.data.sensor_width = 36
    cam.data.clip_start = 0.005
    t = bpy.data.objects.get(jm + '_cil') or bpy.data.objects.new(jm + '_cil', None)
    t.location = cil
    smer = np.asarray(smer, float)
    smer /= np.linalg.norm(smer)
    cam.location = tuple(np.asarray(cil) + smer * vzd)
    con = cam.constraints.get('Track') or cam.constraints.new('TRACK_TO')
    con.name = 'Track'
    con.target = t
    con.track_axis, con.up_axis = 'TRACK_NEGATIVE_Z', 'UP_Y'
    cam.data.dof.use_dof = fstop is not None
    if fstop:
        cam.data.dof.focus_object = t
        cam.data.dof.aperture_fstop = fstop
    sc = bpy.data.scenes['Caj']
    for o in (cam, t):
        if o.name not in sc.collection.objects:
            sc.collection.objects.link(o)
    return cam


def kamery(slug, d):
    R, H = CAJE[slug]['R'], CAJE[slug]['H']
    # celek: stejný směr a poměr velikosti jako Kamera_caj u černého čaje (rozpětí 6,9 cm)
    k0, c0 = bpy.data.objects['Kamera_caj'], bpy.data.objects['Cil_caj']
    off = np.array(k0.location - c0.location)
    k = 2 * R / 0.069
    _kamera('Kamera_' + slug, (0, 0, 0.4 * H), off, np.linalg.norm(off) * k, k0.data.lens)
    # detail: pohled shora zepředu na svah kopečku, záběr asi 3 cm, malá hloubka ostrosti
    yy = -0.28 * R
    i = int((yy + d['ext']) / d['bunka'])
    j = int(d['ext'] / d['bunka'])
    zc = float(d['hm'][j, i])
    vzd = 0.072 * min(1.0, R / (27 * MM)) * CAJE[slug].get('detail', 1.0)
    _kamera('Kamera_' + slug + '_detail', (0, yy, zc), (0.1, -0.45, 1.0), vzd, 100, fstop=11 * CAJE[slug].get('detail', 1.0))


def jen(slug):
    """Ve scéně Caj nechá jen hromádku slug (ostatní kolekce odpojí)."""
    sc = bpy.data.scenes['Caj']
    for c in list(sc.collection.children):
        if c.name.startswith(('Sypane_', 'Caj_samotny', 'Zazvor_samotny', 'Skorice_samotny')) and c.name != 'Sypane_' + slug:
            sc.collection.children.unlink(c)
    c = bpy.data.collections['Sypane_' + slug]
    if c.name not in sc.collection.children:
        sc.collection.children.link(c)
    return sc


def renderuj(slug, rendery, detail=True, celek=True, vzorku=256, procent=100, pruhledne=False):
    """pruhledne: celek bez pozadí, jen se stínem (rendery/<slug>_vyrez.png),
    pro skládání hromádek před sáček na webu."""
    sc = jen(slug)
    win = bpy.context.window
    puv = win.scene
    win.scene = sc
    r = sc.render
    r.resolution_percentage = procent
    sc.cycles.samples = vzorku
    sc.cycles.use_denoising = True
    hotovo = []
    if celek:
        sc.camera = bpy.data.objects['Kamera_' + slug]
        r.resolution_x, r.resolution_y = 1600, 1280
        poz = bpy.data.objects['Pozadi']
        if pruhledne:
            r.film_transparent = True
            poz.is_shadow_catcher = True
            r.image_settings.color_mode = 'RGBA'
        r.filepath = os.path.join(rendery, slug + ('_vyrez.png' if pruhledne else '.png'))
        try:
            bpy.ops.render.render(write_still=True)
        finally:
            r.film_transparent = False
            poz.is_shadow_catcher = False
            r.image_settings.color_mode = 'RGB'
        hotovo.append(r.filepath)
    if detail:
        sc.camera = bpy.data.objects['Kamera_' + slug + '_detail']
        r.resolution_x, r.resolution_y = 1600, 1600
        r.filepath = os.path.join(rendery, slug + '_detail.png')
        bpy.ops.render.render(write_still=True)
        hotovo.append(r.filepath)
    r.resolution_x, r.resolution_y, r.resolution_percentage = 1600, 1280, 100
    sc.camera = bpy.data.objects['Kamera_caj']
    win.scene = puv
    return hotovo


if __name__ == '__main__' and '--' in sys.argv:
    args = sys.argv[sys.argv.index('--') + 1:]
    rendery = os.path.expanduser(args[0])
    for slug in args[1:]:
        print(slug, postav(slug))
        print(renderuj(slug, rendery))
