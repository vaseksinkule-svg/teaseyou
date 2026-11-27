"""Rendery sáčku s plochým dnem pro web.

Spouští se nad ~/TeaseYou-3D/teaseyou-rendery.blend (kvůli hromádkám
surovin Sypane_<slug>), ale renderuje se v nové scéně „Dno_web“ se studiem
jako první návrh z blender_dno.py: krémové světlo okolí, tři plošná světla
a sáček natočený o 32°, takže je vidět bok a dno. Soubor .blend se neukládá.

    B=/Applications/Blender.app/Contents/MacOS/Blender
    $B -b ~/TeaseYou-3D/teaseyou-rendery.blend -P tools/rendery/blender_dno_rendery.py -- \\
        sacky ~/TeaseYou-3D/etikety ~/TeaseYou-3D/rendery [--jen deep_winter] [--procent 100]
    ... -- prazdny ~/TeaseYou-3D/etikety ~/TeaseYou-3D/rendery
    ... -- sceny ~/TeaseYou-3D/etikety ~/TeaseYou-3D/rendery [--jen deep_winter]

sacky    dno_sacek_<id>.png: sáček hotové směsi, průhledné pozadí bez stínu
         (stín kreslí web), 1200 × 1620 px
prazdny  dno_prazdny.png: sáček bez etikety pro vlastní směs (etiketu kreslí
         web) a dno_prazdny.json s rohy místa pro etiketu v px obrázku
sceny    dno_scena_<id>.png: sáček a před ním hromádky surovin, průhledné
         pozadí se stínem, 1080 × 1080 px

Pro web: python3 tools/rendery/vyrez.py dno ~/TeaseYou-3D/rendery
"""
import json
import math
import os
import sys
import zlib

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import bpy  # noqa: E402
from bpy_extras.object_utils import world_to_camera_view  # noqa: E402
from mathutils import Matrix, Vector  # noqa: E402

import blender_dno as dno  # noqa: E402
import blender_sceny as sceny  # noqa: E402

SCENA = 'Dno_web'
ETIKETA_NA_TEXTURE = (336, 960, 1408, 1920)
UHEL = math.radians(32)           # o kolik je sáček natočený (vidět bok a dno)
FOV = 2 * math.atan(18 / 85)      # objektiv 85 mm, snímač 36 mm


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


def nova_scena(samples):
    """Prázdná scéna pro jeden render; předchozí se i s objekty smaže."""
    stara = bpy.data.scenes.get(SCENA)
    if stara:
        for o in list(stara.collection.all_objects):
            bpy.data.objects.remove(o)
        bpy.data.scenes.remove(stara)
    sc = bpy.data.scenes.new(SCENA)
    gpu(sc)
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
    return sc


def studio(sc, cil, k=1.0, stin=False):
    """Světla jako v prvním návrhu (blender_dno.scena). Jsou natočená spolu se
    sáčkem o −UHEL, takže sáček je nasvícený stejně, jako když se tehdy
    natáčela kamera."""
    world = bpy.data.worlds.new('Dno_svet')
    sc.world = world
    world.use_nodes = True
    world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.92, 0.89, 0.84, 1)
    world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.35
    rot = Matrix.Rotation(-UHEL, 3, 'Z')
    for name, loc, energy, size in (('Klic', (-0.35, -0.45, 0.42), 7, 0.35),
                                    ('Vypln', (0.45, -0.3, 0.2), 1.8, 0.5),
                                    ('Kontra', (0.15, 0.45, 0.4), 3, 0.3)):
        L = bpy.data.lights.new('Dno_' + name, 'AREA')
        L.energy = energy * k * k
        L.size = size * k
        o = bpy.data.objects.new('Dno_' + name, L)
        sc.collection.objects.link(o)
        o.location = rot @ (Vector(loc) * k)
        o.rotation_euler = (Vector(cil) - o.location).to_track_quat('-Z', 'Y').to_euler()
    if stin:
        me = bpy.data.meshes.new('Dno_podlaha')
        s = 3.0
        me.from_pydata([(-s, -s, 0), (s, -s, 0), (s, s, 0), (-s, s, 0)], [], [(0, 1, 2, 3)])
        pod = bpy.data.objects.new('Dno_podlaha', me)
        sc.collection.objects.link(pod)
        pod.is_shadow_catcher = True


def kamera(sc, cil, poloha, lens=85):
    cd = bpy.data.cameras.new('Dno_kamera')
    cd.lens = lens
    cam = bpy.data.objects.new('Dno_kamera', cd)
    sc.collection.objects.link(cam)
    cam.location = poloha
    cam.rotation_euler = (Vector(cil) - cam.location).to_track_quat('-Z', 'Y').to_euler()
    sc.camera = cam
    return cam


def sacek_studio(sc, textura):
    """Sáček 750 ml natočený o −UHEL, studio a kamera zepředu jako v návrhu."""
    W, H, G = dno.VELIKOSTI[750]
    s, _ = dno.postav(750, textura, kolekce=sc.collection, otoceni=-UHEL,
                      oblast=ETIKETA_NA_TEXTURE if textura else None)
    cil = (0, 0, H * 0.47 * dno.MM)
    studio(sc, cil)
    vzd = (H * dno.MM / 0.80) / (2 * math.tan(FOV / 2))
    kamera(sc, cil, (0.0, -vzd, vzd * 0.30))
    sc.render.resolution_x, sc.render.resolution_y = 1200, 1620
    return s


def render(sc, cesta):
    sc.render.filepath = cesta
    bpy.ops.render.render(write_still=True, scene=sc.name)
    print('Hotovo:', cesta, flush=True)


def rohy_etikety(sc, sacek_ob):
    """Rohy místa pro etiketu (88 × 120 mm na přední stěně) v px obrázku."""
    W, H, G = dno.VELIKOSTI[750]
    _, z_napln, _ = dno.profil(W, H, G)
    ew, eh = dno.ETIKETA_MM
    z_dole = max(18.0, z_napln + 10 - eh)
    vl = sc.view_layers[0]
    vl.update()
    dg = vl.depsgraph
    mw = sacek_ob.matrix_world
    body = []
    for (x, z) in ((-ew / 2, z_dole + eh), (ew / 2, z_dole + eh), (ew / 2, z_dole), (-ew / 2, z_dole)):
        start = Vector((x * dno.MM, -0.2, z * dno.MM))
        hit, loc, _, _ = sacek_ob.ray_cast(start, Vector((0, 1, 0)), depsgraph=dg)
        p = mw @ (loc if hit else start)
        c = world_to_camera_view(sc, sc.camera, p)
        body.append([c.x * sc.render.resolution_x, (1 - c.y) * sc.render.resolution_y])
    return body


def textury(etikety, jen):
    for soubor in sorted(os.listdir(etikety)):
        if soubor.startswith('textura_') and soubor.endswith('.png') and 'vlastni' not in soubor:
            sid = soubor[len('textura_'):-4]
            if not jen or sid in jen:
                yield sid, os.path.join(etikety, soubor)


def hromadky(sc, smes):
    """Hromádky surovin v oblouku před sáčkem (jako blender_sceny.postav, jen
    do nové scény). Sítě Sypane_<slug> jsou v souboru .blend."""
    poradi = sceny._sazba(smes['suroviny'])
    mista = sceny.ROZLOZENI[min(len(poradi), 5)]
    chybi = []
    for (kod, _), (x, y, s) in zip(poradi, mista):
        slug = sceny.SLUG.get(kod)
        me = bpy.data.meshes.get('Sypane_' + slug) if slug else None
        if not me:
            chybi.append(kod)
            continue
        R = sceny._polomer(me)
        ob = bpy.data.objects.new('Dno_' + slug, me)
        sc.collection.objects.link(ob)
        k = sceny.SKALA * s * (sceny.R_VZOR / R) ** 0.6
        ob.scale = (k, k, k * sceny.VYSKA)
        ob.location = (x, y, 0.0)
        ob.rotation_euler = (0.0, 0.0, (zlib.crc32((smes['id'] + slug).encode()) % 628) / 100)
    return chybi


def main(argv):
    if len(argv) < 3:
        print(__doc__)
        return
    rezim = argv[0]
    etikety = os.path.expanduser(argv[1])
    rendery = os.path.expanduser(argv[2])
    jen = argv[argv.index('--jen') + 1].split(',') if '--jen' in argv else []
    procent = int(argv[argv.index('--procent') + 1]) if '--procent' in argv else 100
    vzorky = int(argv[argv.index('--vzorky') + 1]) if '--vzorky' in argv else 160

    if rezim == 'sacky':
        for sid, textura in textury(etikety, jen):
            sc = nova_scena(vzorky)
            sacek_studio(sc, textura)
            sc.render.resolution_percentage = procent
            render(sc, os.path.join(rendery, f'dno_sacek_{sid}.png'))
    elif rezim == 'prazdny':
        sc = nova_scena(vzorky)
        s = sacek_studio(sc, None)
        sc.render.resolution_percentage = procent
        k = procent / 100
        rohy = [[x * k, y * k] for x, y in rohy_etikety(sc, s)]
        with open(os.path.join(rendery, 'dno_prazdny.json'), 'w') as f:
            json.dump({'obrazek': [sc.render.resolution_x * k, sc.render.resolution_y * k],
                       'etiketa': rohy, 'poradi': 'vlevo nahoře, vpravo nahoře, vpravo dole, vlevo dole'}, f)
        render(sc, os.path.join(rendery, 'dno_prazdny.png'))
    elif rezim == 'sceny':
        koren = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        with open(os.path.join(koren, 'script.js'), encoding='utf-8') as f:
            vsechny = sceny.smesi(f.read())
        for smes in vsechny:
            if jen and smes['id'] not in jen:
                continue
            sc = nova_scena(vzorky)
            dno.postav(750, os.path.join(etikety, f"textura_{smes['id']}.png"), kolekce=sc.collection,
                       otoceni=-UHEL, oblast=ETIKETA_NA_TEXTURE)
            chybi = hromadky(sc, smes)
            if chybi:
                print('Chybí hromádky:', smes['id'], chybi, flush=True)
            # záběr jako u dosavadních scén (shora 20°), jen o kus dál, ať se
            # vejde vyšší sáček i stín
            cil = (0.0, -0.05, 0.094)
            studio(sc, cil, k=1.25, stin=True)
            D, sklon = 1.05, math.radians(20)
            kamera(sc, cil, (0.0, -0.05 - D * math.cos(sklon), 0.094 + D * math.sin(sklon)), lens=100)
            sc.render.resolution_x, sc.render.resolution_y = 1080, 1080
            sc.render.resolution_percentage = procent
            render(sc, os.path.join(rendery, f"dno_scena_{smes['id']}.png"))
    else:
        print(__doc__)


if __name__ == '__main__':
    main(sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else [])
