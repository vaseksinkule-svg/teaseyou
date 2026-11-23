"""Rendery sáčků 100 g v Blenderu (spouští se uvnitř Blenderu).

Soubor: ~/TeaseYou-3D/teaseyou-rendery.blend (kopie teaseyou-sacek-caj.blend,
navíc kamery na zázvor a skořici ve scéně „Caj“). Scéna „Sacek_v2“ (kamera
V2_kamera, světla V2_*, sáček Sacek2). Etiketa je obrázek „front_label.png“
v materiálu Kraft_Front, skript mu jen mění soubor. Textury etiket dělá
tools/rendery/etikety.py (soubory textura_<id>.png, 2080 × 3360 px).

    blender -b ~/TeaseYou-3D/teaseyou-rendery.blend -P tools/rendery/blender_sacky.py -- \
        hotove ~/TeaseYou-3D/etikety ~/TeaseYou-3D/rendery [--jen deep_winter,still_evening]
    blender -b ... -P tools/rendery/blender_sacky.py -- \
        vlastni ~/TeaseYou-3D/etikety ~/TeaseYou-3D/rendery vlastni_prazdna

hotove   pro každou texturu textura_<id>.png uloží rendery/sacek_<id>_100g.png
vlastni  podklad vlastní směsi z jedné textury:
           sacek_<nazev>_100g.png   celý obrázek jako u hotových směsí
           sacek_<nazev>_sacek.png  jen sáček na průhledném pozadí
           sacek_<nazev>_stin.png   jen stín na podlaze (průhledné pozadí)
           sacek_<nazev>_etiketa.json  rohy etikety a polí v px obrázku

Nastavení: 1600 × 2000 px, Cycles 192 vzorků, barvy Standard s expozicí −0,55
(při 0 se krémová etiketa přepálí do bíla).
"""
import json
import os
import sys

import bpy
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Vector
from mathutils.geometry import barycentric_transform, intersect_point_tri_2d

SCENA = 'Sacek_v2'
SACEK = 'Sacek2'
POZADI = 'Pozadi'
OBRAZEK = 'front_label.png'
TEXTURA = (2080, 3360)
ETIKETA = (336, 960, 1408, 1920)   # x, y, šířka, výška na textuře


def priprav():
    sc = bpy.data.scenes[SCENA]
    bpy.context.window.scene = sc
    r = sc.render
    r.resolution_x, r.resolution_y, r.resolution_percentage = 1600, 2000, 100
    r.image_settings.file_format = 'PNG'
    sc.cycles.samples = 192
    sc.view_settings.view_transform = 'Standard'
    sc.view_settings.look = 'None'
    sc.view_settings.exposure = -0.55
    return sc


def nastav_etiketu(cesta):
    img = bpy.data.images[OBRAZEK]
    img.filepath = cesta
    img.reload()


def renderuj(sc, cil):
    sc.render.filepath = cil
    bpy.ops.render.render(write_still=True)


def hotove(etikety, rendery, jen=()):
    sc = priprav()
    sc.render.film_transparent = False
    hotovo = []
    for f in sorted(os.listdir(etikety)):
        if not (f.startswith('textura_') and f.endswith('.png')) or f.startswith('textura_vlastni'):
            continue
        bid = f[len('textura_'):-4]
        if jen and bid not in jen:
            continue
        nastav_etiketu(os.path.join(etikety, f))
        renderuj(sc, os.path.join(rendery, f'sacek_{bid}_100g.png'))
        hotovo.append(bid)
    return hotovo


def uv_na_obraz(sc, body_uv):
    """Body v UV přední strany → px v renderu (x zleva, y shora)."""
    obj = bpy.data.objects[SACEK]
    dg = bpy.context.evaluated_depsgraph_get()
    ev = obj.evaluated_get(dg)
    me = ev.to_mesh()
    me.calc_loop_triangles()
    uvl = me.uv_layers.active.data
    front = [i for i, s in enumerate(obj.material_slots) if s.material and s.material.name == 'Kraft_Front']
    tris = []
    for t in me.loop_triangles:
        if me.polygons[t.polygon_index].material_index not in front:
            continue
        uv = [Vector((*uvl[li].uv, 0)) for li in t.loops]
        co = [obj.matrix_world @ me.vertices[vi].co for vi in t.vertices]
        tris.append((uv, co))
    cam = sc.camera
    W, H = sc.render.resolution_x, sc.render.resolution_y
    out = []
    for (u, v) in body_uv:
        p = Vector((u, v, 0))
        bod = None
        for uv, co in tris:
            if intersect_point_tri_2d(p.to_2d(), uv[0].to_2d(), uv[1].to_2d(), uv[2].to_2d()):
                bod = barycentric_transform(p, uv[0], uv[1], uv[2], co[0], co[1], co[2])
                break
        if bod is None:
            out.append(None)
            continue
        c = world_to_camera_view(sc, cam, bod)
        out.append([round(c.x * W, 1), round((1 - c.y) * H, 1)])
    ev.to_mesh_clear()
    return out


def px_na_uv(x, y):
    return (x / TEXTURA[0], 1 - y / TEXTURA[1])


def obdelnik(x, y, w, h):
    return [px_na_uv(x, y), px_na_uv(x + w, y), px_na_uv(x + w, y + h), px_na_uv(x, y + h)]


def vlastni(etikety, rendery, nazev):
    sc = priprav()
    nastav_etiketu(os.path.join(etikety, f'textura_{nazev}.png'))
    zaklad = os.path.join(rendery, f'sacek_{nazev}')
    sacek, pozadi = bpy.data.objects[SACEK], bpy.data.objects[POZADI]
    # 1) celý obrázek jako u hotových směsí
    sc.render.film_transparent = False
    renderuj(sc, zaklad + '_100g.png')
    # 2) jen sáček: pozadí kamera nevidí, ale dál odráží světlo
    sc.render.film_transparent = True
    sc.render.image_settings.color_mode = 'RGBA'
    pozadi.visible_camera = False
    renderuj(sc, zaklad + '_sacek.png')
    # 3) jen stín: pozadí zachytává stín, sáček kamera nevidí
    pozadi.visible_camera = True
    pozadi.is_shadow_catcher = True
    sacek.visible_camera = False
    renderuj(sc, zaklad + '_stin.png')
    pozadi.is_shadow_catcher = False
    sacek.visible_camera = True
    sc.render.film_transparent = False
    sc.render.image_settings.color_mode = 'RGB'
    # 4) kde leží etiketa a její pole v obrázku
    x, y, w, h = ETIKETA
    data = {'obrazek': [sc.render.resolution_x, sc.render.resolution_y],
            'etiketa_rohy': uv_na_obraz(sc, obdelnik(x, y, w, h))}
    # mřížka 5 × 5 přes etiketu (na pokřiveném sáčku přesnější než 4 rohy)
    mriz = [px_na_uv(x + w * i / 4, y + h * j / 4) for j in range(5) for i in range(5)]
    data['etiketa_mrizka_5x5'] = uv_na_obraz(sc, mriz)
    pj = os.path.join(etikety, f'etiketa_{nazev}.json')
    if os.path.exists(pj):
        pole = json.load(open(pj)).get('pole_px', {})
        k = w / 1408
        data['pole'] = {n: uv_na_obraz(sc, obdelnik(x + b[0] * k, y + b[1] * k, b[2] * k, b[3] * k))
                        for n, b in pole.items() if b}
    with open(zaklad + '_etiketa.json', 'w') as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
    return data


def main(argv):
    if len(argv) < 3:
        print(__doc__)
        return
    co, etikety, rendery = argv[0], os.path.expanduser(argv[1]), os.path.expanduser(argv[2])
    os.makedirs(rendery, exist_ok=True)
    if co == 'hotove':
        jen = ()
        if '--jen' in argv:
            jen = tuple(argv[argv.index('--jen') + 1].split(','))
        print('hotovo:', hotove(etikety, rendery, jen))
    elif co == 'vlastni':
        print(json.dumps(vlastni(etikety, rendery, argv[3]), indent=1))


if __name__ == '__main__':
    main(sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else [])
