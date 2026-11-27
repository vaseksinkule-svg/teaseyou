"""Rendery sáčku s plochým dnem pro web, ve scéně „Sacek_v2“ souboru
~/TeaseYou-3D/teaseyou-rendery.blend (světla, studio, hromádky surovin).

Starý doypack (Sacek2) se při renderu schová a místo něj se postaví sáček
s plochým dnem z blender_dno.py (750 ml, tedy 100 g). Soubor .blend se neukládá.

    B=/Applications/Blender.app/Contents/MacOS/Blender
    $B -b ~/TeaseYou-3D/teaseyou-rendery.blend -P tools/rendery/blender_dno_rendery.py -- \\
        sacky ~/TeaseYou-3D/etikety ~/TeaseYou-3D/rendery [--jen deep_winter] [--procent 100]
    ... -- prazdny ~/TeaseYou-3D/etikety ~/TeaseYou-3D/rendery
    ... -- sceny ~/TeaseYou-3D/etikety ~/TeaseYou-3D/rendery [--jen deep_winter]

sacky    dno_sacek_<id>.png: sáček hotové směsi, mírně z boku, průhledné pozadí
         bez stínu (stín kreslí web), 1600 × 2000 px
prazdny  dno_prazdny.png: sáček bez etikety pro vlastní směs (etiketu kreslí
         web) a dno_prazdny.json s rohy místa pro etiketu v px obrázku
sceny    dno_scena_<id>.png: sáček a před ním hromádky surovin (stejné
         rozložení a kamera jako blender_sceny.py), 1800 × 1800 px se stínem

Pro web: python3 tools/rendery/vyrez.py sacek-dno / prazdny-dno / scena-dno …
"""
import json
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import bpy  # noqa: E402
from bpy_extras.object_utils import world_to_camera_view  # noqa: E402

import blender_dno as dno  # noqa: E402
import blender_sceny as sceny  # noqa: E402

SCENA = 'Sacek_v2'
KOLEKCE = 'Sacek_dno'
ETIKETA_NA_TEXTURE = (336, 960, 1408, 1920)
OTOCENI_SACEK = math.radians(-12)   # jen náznak boku, etiketa zůstane skoro rovně
OTOCENI_SCENA = math.radians(-20)


def gpu(sc):
    prefs = bpy.context.preferences.addons['cycles'].preferences
    for typ in ('METAL', 'OPTIX', 'CUDA', 'HIP', 'ONEAPI'):
        try:
            prefs.compute_device_type = typ
            break
        except TypeError:
            continue
    prefs.get_devices()
    for d in prefs.devices:
        d.use = True
    sc.cycles.device = 'GPU'


def kolekce(sc):
    col = bpy.data.collections.get(KOLEKCE) or bpy.data.collections.new(KOLEKCE)
    for o in list(col.objects):
        bpy.data.objects.remove(o)
    if col.name not in sc.collection.children:
        sc.collection.children.link(col)
    return col


def priprav(sc, samples):
    gpu(sc)
    sc.objects['Sacek2'].hide_render = True
    r = sc.render
    r.engine = 'CYCLES'
    r.film_transparent = True
    r.image_settings.file_format = 'PNG'
    r.image_settings.color_mode = 'RGBA'
    sc.cycles.samples = samples
    sc.cycles.use_denoising = True
    sc.view_settings.view_transform = 'Standard'
    sc.view_settings.look = 'None'
    sc.view_settings.exposure = -0.55


def render(sc, cesta):
    sc.render.filepath = cesta
    bpy.ops.render.render(write_still=True, scene=sc.name)
    print('Hotovo:', cesta, flush=True)


def sacek(sc, col, textura, otoceni):
    s, et = dno.postav(750, textura, kolekce=col, otoceni=otoceni,
                       oblast=ETIKETA_NA_TEXTURE if textura else None)
    return s, et


def rohy_etikety(sc, sacek_ob):
    """Kde je na obrázku místo pro etiketu: rohy obdélníku 88 × 120 mm
    promítnuté na přední stěnu sáčku a do kamery (px, počátek vlevo nahoře)."""
    from mathutils import Vector
    W, H, G = dno.VELIKOSTI[750]
    _, z_napln, _ = dno.profil(W, H, G)
    ew, eh = dno.ETIKETA_MM
    z_dole = max(18.0, z_napln + 10 - eh)
    dg = bpy.context.evaluated_depsgraph_get()
    mw = sacek_ob.matrix_world
    body = []
    for (x, z) in ((-ew / 2, z_dole + eh), (ew / 2, z_dole + eh), (ew / 2, z_dole), (-ew / 2, z_dole)):
        start = Vector((x * dno.MM, -0.2, z * dno.MM))
        hit, loc, _, _ = sacek_ob.ray_cast(start, Vector((0, 1, 0)), depsgraph=dg)
        p = mw @ (loc if hit else start)
        c = world_to_camera_view(sc, sc.camera, p)
        body.append([c.x * sc.render.resolution_x, (1 - c.y) * sc.render.resolution_y])
    return body


def sacky(sc, etikety, rendery, jen, procent):
    sc.render.resolution_x, sc.render.resolution_y = 1600, 2000
    sc.render.resolution_percentage = procent
    sc.camera = bpy.data.objects['V2_kamera']
    sc.objects['Pozadi'].hide_render = True
    for soubor in sorted(os.listdir(etikety)):
        if not (soubor.startswith('textura_') and soubor.endswith('.png')) or 'vlastni' in soubor:
            continue
        sid = soubor[len('textura_'):-4]
        if jen and sid not in jen:
            continue
        col = kolekce(sc)
        sacek(sc, col, os.path.join(etikety, soubor), OTOCENI_SACEK)
        render(sc, os.path.join(rendery, f'dno_sacek_{sid}.png'))


def prazdny(sc, rendery, procent):
    sc.render.resolution_x, sc.render.resolution_y = 1600, 2000
    sc.render.resolution_percentage = procent
    sc.camera = bpy.data.objects['V2_kamera']
    sc.objects['Pozadi'].hide_render = True
    col = kolekce(sc)
    s, _ = sacek(sc, col, None, OTOCENI_SACEK)
    bpy.context.view_layer.update()
    k = procent / 100
    rohy = [[x * k, y * k] for x, y in rohy_etikety(sc, s)]
    with open(os.path.join(rendery, 'dno_prazdny.json'), 'w') as f:
        json.dump({'obrazek': [sc.render.resolution_x * k, sc.render.resolution_y * k],
                   'etiketa': rohy, 'poradi': 'vlevo nahoře, vpravo nahoře, vpravo dole, vlevo dole'}, f)
    render(sc, os.path.join(rendery, 'dno_prazdny.png'))


def scenyr(sc, etikety, rendery, jen, procent):
    koren = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    with open(os.path.join(koren, 'script.js'), encoding='utf-8') as f:
        vsechny = sceny.smesi(f.read())
    sc.render.resolution_x, sc.render.resolution_y = 1800, 1800
    sc.render.resolution_percentage = procent
    poz = sc.objects['Pozadi']
    poz.hide_render = False
    poz.is_shadow_catcher = True
    cam = sceny._kamera()
    # sáček s plochým dnem je o 16 mm vyšší než doypack: kamera kousek dál
    # a výš, ať se vejde i se svárem (hromádky zůstanou dole v záběru)
    cil = bpy.data.objects[sceny.KAMERA + '_cil']
    cil.location = (0.0, -0.05, 0.094)
    D, uhel = 1.0, math.radians(20)
    cam.location = (0.0, -0.05 - D * math.cos(uhel), 0.094 + D * math.sin(uhel))
    sc.camera = cam
    for smes in vsechny:
        if jen and smes['id'] not in jen:
            continue
        textura = os.path.join(etikety, f"textura_{smes['id']}.png")
        col = kolekce(sc)
        sacek(sc, col, textura, OTOCENI_SCENA)
        chybi = sceny.postav(smes)
        if chybi:
            print('Chybí hromádky:', smes['id'], chybi, flush=True)
        render(sc, os.path.join(rendery, f"dno_scena_{smes['id']}.png"))


def main(argv):
    if len(argv) < 2:
        print(__doc__)
        return
    rezim = argv[0]
    etikety = os.path.expanduser(argv[1])
    rendery = os.path.expanduser(argv[2])
    jen = argv[argv.index('--jen') + 1].split(',') if '--jen' in argv else []
    procent = int(argv[argv.index('--procent') + 1]) if '--procent' in argv else 100
    vzorky = int(argv[argv.index('--vzorky') + 1]) if '--vzorky' in argv else 192
    sc = bpy.data.scenes[SCENA]
    priprav(sc, vzorky)
    if rezim == 'sacky':
        sacky(sc, etikety, rendery, jen, procent)
    elif rezim == 'prazdny':
        prazdny(sc, rendery, procent)
    elif rezim == 'sceny':
        scenyr(sc, etikety, rendery, jen, procent)
    else:
        print(__doc__)


if __name__ == '__main__':
    main(sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else [])
