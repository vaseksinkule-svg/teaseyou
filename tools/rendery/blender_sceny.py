"""Scény hotových směsí pro web: sáček s etiketou a před ním hromádky surovin.

Spouští se v Blenderu (soubor ~/TeaseYou-3D/teaseyou-rendery.blend, scéna
„Sacek_v2“ se sáčkem, světly a pozadím). Potřebuje:
  - hromádky Sypane_<slug> z blender_suroviny.py (funkce postav),
  - textury etiket textura_<id>.png z etikety.py,
  - script.js, odkud se berou suroviny a díly směsí (BUILTIN_BLENDS),
    takže scéna má vždy stejné složení jako web.

    blender -b ~/TeaseYou-3D/teaseyou-rendery.blend -P tools/rendery/blender_sceny.py -- \\
        ~/TeaseYou-3D/etikety ~/TeaseYou-3D/rendery [--jen deep_winter,still_evening]

Uloží rendery/scena_<id>.png: 1800 × 1800 px, průhledné pozadí, stín na podlaze.
Pro web: python3 tools/rendery/vyrez.py scena rendery/scena_<id>.png deep-winter

Hromádky stojí v oblouku před sáčkem, největší díl uprostřed vpředu.
Velikost hromádky odpovídá jejímu dílu jen zhruba (aby byly vidět i doplňky).
"""
import json
import math
import os
import re
import sys
import zlib

import bpy

SCENA = 'Sacek_v2'
SACEK = 'Sacek2'
POZADI = 'Pozadi'
OBRAZEK = 'front_label.png'
KOLEKCE = 'Scena_smes'
KAMERA = 'Scena_kamera'

# kód suroviny ve script.js → slug hromádky (stejné jako v blender_suroviny.py)
SLUG = {'Black Tea': 'cerny-caj', 'Green Tea': 'zeleny-caj', 'White Tea': 'bily-caj', 'Oolong Tea': 'oolong',
        'Rooibos': 'rooibos', 'Ginger': 'zazvor', 'Cinnamon': 'skorice', 'Chamomile': 'hermanek',
        'Lemon Balm': 'medunka', 'Linden': 'lipa', 'Mint': 'mata-peprna', 'Spearmint': 'mata-kaderava',
        'Apple': 'jablko', 'Strawberry': 'jahoda', 'Raspberry': 'malina', 'Blueberry': 'boruvka',
        'Rose Hip': 'sipek', 'Hibiscus': 'ibisek', 'Rose': 'ruze', 'Lemongrass': 'citronova-trava',
        'Fennel': 'fenykl', 'Orange': 'pomerancova-kura', 'Lemon': 'citronova-kura', 'Lavender': 'levandule',
        'Cardamom': 'kardamom'}

# Kde stojí hromádky (x, y v metrech, sáček má střed v počátku a přední
# stěnu asi na y = −0,034) a jak jsou velké. Pořadí = od největšího dílu.
ROZLOZENI = {
    1: [(0.0, -0.1, 1.3)],
    2: [(-0.045, -0.105, 1.2), (0.075, -0.085, 1.0)],
    3: [(0.0, -0.112, 1.15), (-0.095, -0.07, 0.95), (0.095, -0.07, 0.95)],
    4: [(-0.04, -0.118, 1.1), (0.06, -0.13, 0.92), (-0.108, -0.058, 0.9), (0.108, -0.058, 0.9)],
    5: [(0.0, -0.13, 1.05), (-0.088, -0.118, 0.88), (0.088, -0.118, 0.88), (-0.118, -0.05, 0.85), (0.118, -0.05, 0.85)],
}
R_VZOR = 0.026      # hromádky mají různý poloměr, srovnají se k tomuhle
SKALA = 1.45        # hromádky jsou větší než skutečné 10 g, ať jsou vedle sáčku vidět
VYSKA = 1.15        # a trochu vyšší (kopeček místo placky)


def smesi(script_js):
    """Hotové směsi z webu: [{'id', 'name', 'suroviny': [(kod, dil), …]}]."""
    m = re.search(r'const BUILTIN_BLENDS = (\[.*?\n\]);', script_js, re.S)
    if not m:
        raise ValueError('V script.js chybí BUILTIN_BLENDS.')
    pole = re.sub(r',\s*\]$', ']', m.group(1))      # v JS smí být za poslední položkou čárka
    return [{'id': b['id'], 'name': b['name'], 'suroviny': list(zip(b['ingredients'], b['parts']))}
            for b in json.loads(pole)]


def _kamera():
    sc = bpy.data.scenes[SCENA]
    v2 = bpy.data.objects['V2_kamera']
    cam = bpy.data.objects.get(KAMERA)
    if not cam:
        cam = bpy.data.objects.new(KAMERA, v2.data.copy())
        sc.collection.objects.link(cam)
    cil = bpy.data.objects.get(KAMERA + '_cil') or bpy.data.objects.new(KAMERA + '_cil', None)
    if cil.name not in sc.collection.objects:
        sc.collection.objects.link(cil)
    # o něco výš než u samotného sáčku (20°), ať je vidět na hromádky shora;
    # čtvercový záběr, do kterého se vejdou hromádky po stranách
    cil.location = (0.0, -0.05, 0.085)
    D, uhel = 0.9, math.radians(20)
    cam.location = (0.0, -0.05 - D * math.cos(uhel), 0.085 + D * math.sin(uhel))
    cam.data.dof.use_dof = False
    con = cam.constraints.get('Track') or cam.constraints.new('TRACK_TO')
    con.name = 'Track'
    con.target = cil
    con.track_axis, con.up_axis = 'TRACK_NEGATIVE_Z', 'UP_Y'
    return cam


def _sazba(seznam):
    """Suroviny seřazené od největšího dílu (při shodě podle pořadí na webu)."""
    return [k for _, k in sorted(enumerate(seznam), key=lambda x: (-x[1][1], x[0]))]


def postav(smes):
    """Do kolekce Scena_smes dá hromádky surovin směsi (sdílejí síť
    s hromádkami ve scéně Caj, takže se nic nepočítá znovu)."""
    sc = bpy.data.scenes[SCENA]
    col = bpy.data.collections.get(KOLEKCE) or bpy.data.collections.new(KOLEKCE)
    for o in list(col.objects):
        bpy.data.objects.remove(o)
    if col.name not in sc.collection.children:
        sc.collection.children.link(col)
    poradi = _sazba(smes['suroviny'])
    mista = ROZLOZENI[min(len(poradi), 5)]
    chybi = []
    for (kod, dil), (x, y, s) in zip(poradi, mista):
        slug = SLUG.get(kod)
        me = bpy.data.meshes.get('Sypane_' + slug) if slug else None
        if not me:
            chybi.append(kod)
            continue
        # poloměr hromádky z její sítě (bez zatoulaných kousků)
        R = _polomer(me)
        ob = bpy.data.objects.new('Scena_' + slug, me)
        col.objects.link(ob)
        k = SKALA * s * (R_VZOR / R) ** 0.6
        ob.scale = (k, k, k * VYSKA)
        ob.location = (x, y, 0.0)
        ob.rotation_euler = (0.0, 0.0, (zlib.crc32((smes['id'] + slug).encode()) % 628) / 100)
    return chybi


_R_CACHE = {}


def _polomer(me):
    if me.name not in _R_CACHE:
        import numpy as np
        co = np.empty(len(me.vertices) * 3, np.float32)
        me.vertices.foreach_get('co', co)
        r = np.hypot(co[0::3], co[1::3])
        _R_CACHE[me.name] = float(np.percentile(r, 97))
    return _R_CACHE[me.name]


def renderuj(smes, etikety, rendery, vzorku=192, procent=100):
    sc = bpy.data.scenes[SCENA]
    win = bpy.context.window
    puv_scena = win.scene
    win.scene = sc
    puv_kamera = sc.camera
    chybi = postav(smes)
    img = bpy.data.images[OBRAZEK]
    img.filepath = os.path.join(etikety, f"textura_{smes['id']}.png")
    img.reload()
    r = sc.render
    puv_rozliseni = (r.resolution_x, r.resolution_y)
    r.resolution_x, r.resolution_y, r.resolution_percentage = 1800, 1800, procent
    sc.cycles.samples = vzorku
    sc.camera = _kamera()
    poz = bpy.data.objects[POZADI]
    r.film_transparent = True
    poz.is_shadow_catcher = True
    r.image_settings.color_mode = 'RGBA'
    r.filepath = os.path.join(rendery, f"scena_{smes['id']}.png")
    try:
        bpy.ops.render.render(write_still=True)
    finally:
        r.film_transparent = False
        poz.is_shadow_catcher = False
        r.image_settings.color_mode = 'RGB'
        r.resolution_x, r.resolution_y = puv_rozliseni
        r.resolution_percentage = 100
        sc.camera = puv_kamera
        col = bpy.data.collections.get(KOLEKCE)
        if col and col.name in sc.collection.children:
            sc.collection.children.unlink(col)   # rendery samotných sáčků bez hromádek
        win.scene = puv_scena
    return {'soubor': r.filepath, 'chybi': chybi}


def main(argv):
    if len(argv) < 2:
        print(__doc__)
        return
    etikety, rendery = os.path.expanduser(argv[0]), os.path.expanduser(argv[1])
    jen = argv[argv.index('--jen') + 1].split(',') if '--jen' in argv else []
    koren = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    with open(os.path.join(koren, 'script.js'), encoding='utf-8') as f:
        vsechny = smesi(f.read())
    for s in vsechny:
        if not jen or s['id'] in jen:
            print(s['id'], renderuj(s, etikety, rendery))


if __name__ == '__main__':
    main(sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else [])
