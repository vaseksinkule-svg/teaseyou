"""Kraftový sáček s plochým dnem a zipem, postavený celý ze skriptu.

Rozměry podle 22pack Kraft Flat Bottom Bag (šířka × výška + bok, mm):
    300 ml 110 × 185 + 55   (50 g)
    750 ml 130 × 225 + 65   (100 g)
   1500 ml 160 × 270 + 75   (250 g)
Skutečný tvar se po příchodu vzorků ještě doladí (výška náplně, zip).

Nepotřebuje žádný .blend, jde spustit i bez okna Blenderu:
    python3 tools/rendery/blender_dno.py ETIKETA.png VYSTUP.png [--velikost 750]
        [--pohled predni|bok] [--vzorky 96] [--sirka 900] [--pozadi]
Všechny tři velikosti vedle sebe (etikety 50 g, 100 g a 250 g):
    python3 tools/rendery/blender_dno.py E50.png,E100.png,E250.png VYSTUP.png --pohled skupina
ETIKETA je etiketa_<id>.png z tools/rendery/etikety.py (88 × 120 mm, gramáž
přes --gramaz). Spouští se přes Python s balíčkem bpy (pip install bpy, stejná
verze jako Blender), nebo v Blenderu: blender -b -P blender_dno.py -- ...
Bez --pozadi je obrázek průhledný (jen sáček a stín), jako ostatní rendery.
"""
import argparse
import math
import sys

import bpy  # noqa: I001  (bpy musí být první, s ním se načte i bmesh a mathutils)
import bmesh
from mathutils import Vector

VELIKOSTI = {300: (110, 185, 55), 750: (130, 225, 65), 1500: (160, 270, 75)}
ETIKETA_MM = (88, 120)
MM = 0.001


def _link(ob, kolekce):
    (kolekce or bpy.context.collection).objects.link(ob)


def smooth(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)


def profil(W, H, G):
    """Pro výšku z vrátí (hloubka sáčku D, vyboulení předku) v metrech."""
    z_napln = 0.62 * H          # do této výšky je sáček plný a má tvar krabičky
    z_svar = H - 11             # svár nahoře, odtud je sáček úplně plochý
    D_svar = 1.4

    def f(z):
        if z <= z_napln:
            D = G
            # předek a záda se mírně vyboulí, nejvíc kousek nad dnem
            boule = 2.2 * math.sin(math.pi * min(1.0, z / z_napln) * 0.85 + 0.15)
        elif z < z_svar:
            t = smooth((z - z_napln) / (z_svar - z_napln))
            D = G + (D_svar - G) * t
            boule = 2.2 * (1 - t) * 0.6
        else:
            D, boule = D_svar, 0.0
        return D * MM, max(0.0, boule) * MM
    return f, z_napln, z_svar


def prurez(W, G, D, boule, zip_bump, n_front=36, n_bok=10, v_min=0.0):
    """Body průřezu proti směru hodinek, začíná vlevo vpředu."""
    w, g = W / 2, G / 2
    d = D / 2
    # jak hluboko je bok zalomený dovnitř; i plný sáček má na boku přehyb
    v = max(math.sqrt(max(0.0, g * g - d * d)), v_min)
    body = []
    # předek (y záporné), vyboulení ke středu
    for i in range(n_front + 1):
        s = i / n_front
        x = -w + 2 * w * s
        b = boule * math.sin(math.pi * s) ** 0.6 + zip_bump * math.sin(math.pi * s) ** 0.2
        body.append((x, -d - b))
    # pravý bok: roh vpředu → přehyb → roh vzadu
    for i in range(1, n_bok + 1):
        s = i / n_bok
        body.append((w - v * s - 0.0, -d + d * s))
    for i in range(1, n_bok):
        s = i / n_bok
        body.append((w - v * (1 - s), d * s))
    # záda
    for i in range(n_front + 1):
        s = i / n_front
        x = w - 2 * w * s
        b = boule * math.sin(math.pi * s) ** 0.6 + zip_bump * math.sin(math.pi * s) ** 0.2
        body.append((x, d + b))
    # levý bok
    for i in range(1, n_bok + 1):
        s = i / n_bok
        body.append((-w + v * s, d - d * s))
    for i in range(1, n_bok):
        s = i / n_bok
        body.append((-w + v * (1 - s), -d * s))
    return body


def postav_sacek(W, H, G, kolekce=None):
    f, z_napln, z_svar = profil(W, H, G)
    z_zip = H - 30
    vysky = []
    z = 0.0
    while z < H:
        vysky.append(z)
        krok = 0.5 if abs(z - z_zip + 1.5) < 5 else (1.0 if (z < 6 or z > z_svar - 3) else 2.5)
        z += krok
    vysky.append(H)

    bm = bmesh.new()
    kruhy = []
    for z in vysky:
        D, boule = f(z)
        # zip: dvě úzké lišty těsně pod sebou
        zb = MM * (1.1 * math.exp(-((z - z_zip) / 0.9) ** 2) + 0.7 * math.exp(-((z - z_zip + 3.2) / 0.8) ** 2))
        pts = prurez(W * MM, G * MM, D, boule, zb, v_min=1.3 * MM * smooth((z - 4) / 18.0))
        # dno se trochu zaoblí (sáček nestojí na ostré hraně)
        stah = 1.0 - 0.035 * (1 - smooth(z / 5.0))
        kruhy.append([bm.verts.new((x * stah, y * stah, z * MM)) for x, y in pts])
    for a, b in zip(kruhy, kruhy[1:]):
        n = len(a)
        for i in range(n):
            bm.faces.new((a[i], a[(i + 1) % n], b[(i + 1) % n], b[i]))
    bm.faces.new(list(reversed(kruhy[0])))   # dno
    bm.faces.new(kruhy[-1])                  # horní hrana sváru
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    # hladké stínování, ale rohy krabičky a přehyby zůstanou ostré
    for fc in bm.faces:
        fc.smooth = True
    for e in bm.edges:
        if e.is_manifold and e.calc_face_angle(0) > math.radians(32):
            e.smooth = False
    me = bpy.data.meshes.new('SacekDno')
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new('SacekDno', me)
    _link(ob, kolekce)

    # Papír není dokonale hladký: síť se zjemní (bez vyhlazení, rohy zůstanou
    # ostré) a pak se třikrát zdeformuje: velké vlny, zalomené plošky jako
    # u zmačkaného papíru a drobné vrásky. Nahoře, kde se bok skládá, víc;
    # pod etiketou málo (etiketa je tužší a text se nesmí kroutit).
    sub = ob.modifiers.new('Jemnejsi', 'SUBSURF')
    sub.subdivision_type = 'SIMPLE'
    sub.levels = sub.render_levels = 2
    ew, eh = ETIKETA_MM
    z_et = max(18.0, z_napln + 10 - eh)
    vg = ob.vertex_groups.new(name='mackani')
    for vtx in me.vertices:
        x, y, z = vtx.co.x / MM, vtx.co.y / MM, vtx.co.z / MM
        w = 0.4 + 0.6 * smooth((z - z_napln + 30) / 50.0)
        if z > z_svar - 1:
            w = 0.2
        if y < -(G / 2 - 4) and abs(x) < ew / 2 + 4 and z_et - 4 < z < z_et + eh + 4:
            w *= 0.25
        vg.add([vtx.index], min(1.0, w), 'REPLACE')
    for nazev, typ, meritko, sila in (('Vlny', 'CLOUDS', 0.03, 2.6), ('Plosky', 'VORONOI', 0.014, 1.2),
                                      ('Vrasky', 'CLOUDS', 0.005, 0.32)):
        tex = bpy.data.textures.new(nazev, typ)
        tex.noise_scale = meritko
        if typ == 'CLOUDS':
            tex.noise_depth = 2
        else:
            tex.distance_metric = 'DISTANCE'
            tex.color_mode = 'INTENSITY'
        disp = ob.modifiers.new(nazev, 'DISPLACE')
        disp.texture = tex
        disp.strength = sila * MM
        disp.mid_level = 0.5
        disp.vertex_group = 'mackani'
    return ob, z_napln, z_svar


def material_kraft(z_svar_mm=None):
    """Kraftový papír: dvě vrstvy skvrnitosti, světlejší a tmavší vlákna,
    řídké tmavé tečky a drsný povrch s vlákny a vráskami (bump)."""
    m = bpy.data.materials.new('Kraft')
    m.use_nodes = True
    nt = m.node_tree
    n, l = nt.nodes, nt.links
    bsdf = n['Principled BSDF']
    tc = n.new('ShaderNodeTexCoord')
    obj = tc.outputs['Object']

    def sum_(scale, detail=4, distortion=0.0, rough=0.55):
        t = n.new('ShaderNodeTexNoise')
        t.inputs['Scale'].default_value = scale
        t.inputs['Detail'].default_value = detail
        t.inputs['Roughness'].default_value = rough
        t.inputs['Distortion'].default_value = distortion
        l.new(obj, t.inputs['Vector'])
        return t.outputs['Fac']

    def math_(op, a, b):
        mth = n.new('ShaderNodeMath')
        mth.operation = op
        for i, v in enumerate((a, b)):
            if isinstance(v, (int, float)):
                mth.inputs[i].default_value = v
            else:
                l.new(v, mth.inputs[i])
        return mth.outputs['Value']

    def rozsah(v, a0, a1, b0, b1):
        mr = n.new('ShaderNodeMapRange')
        mr.inputs['From Min'].default_value, mr.inputs['From Max'].default_value = a0, a1
        mr.inputs['To Min'].default_value, mr.inputs['To Max'].default_value = b0, b1
        l.new(v, mr.inputs['Value'])
        return mr.outputs['Result']

    # barva: velké skvrny (cm) a menší mraky (mm)
    skvrny = math_('ADD', math_('MULTIPLY', sum_(16, 3), 0.55), math_('MULTIPLY', sum_(130, 8), 0.45))
    ramp = n.new('ShaderNodeValToRGB')
    el = ramp.color_ramp.elements
    el[0].position, el[0].color = 0.3, (0.43, 0.29, 0.155, 1)
    el[1].position, el[1].color = 0.7, (0.56, 0.40, 0.235, 1)
    l.new(skvrny, ramp.inputs['Fac'])
    # vlákna: zkroucený jemný šum, světlejší i tmavší
    vlakna = rozsah(sum_(520, 3, distortion=4.0), 0.3, 0.7, 0.86, 1.1)
    # tečky: Voronoi se pár procent buněk, jen tam, kde to dovolí další šum
    vor = n.new('ShaderNodeTexVoronoi')
    vor.inputs['Scale'].default_value = 240
    l.new(obj, vor.inputs['Vector'])
    tecka = rozsah(vor.outputs['Distance'], 0.03, 0.08, 0.0, 1.0)          # 0 = tečka
    povoleno = rozsah(sum_(40, 2), 0.55, 0.62, 1.0, 0.0)                    # 1 = tečka nesmí
    tecky = rozsah(math_('MAXIMUM', tecka, povoleno), 0.0, 1.0, 0.62, 1.0)
    jas = math_('MULTIPLY', vlakna, tecky)
    mix = n.new('ShaderNodeMix')
    mix.data_type = 'RGBA'
    mix.blend_type = 'MULTIPLY'
    mix.inputs['Factor'].default_value = 1.0
    l.new(ramp.outputs['Color'], mix.inputs[6])
    comb = n.new('ShaderNodeCombineColor')
    for k in ('Red', 'Green', 'Blue'):
        l.new(jas, comb.inputs[k])
    l.new(comb.outputs['Color'], mix.inputs[7])
    l.new(mix.outputs[2], bsdf.inputs['Base Color'])
    # papír je matný, vlákna trochu mění lesk
    l.new(rozsah(vlakna, 0.86, 1.1, 0.88, 0.74), bsdf.inputs['Roughness'])
    # povrch: vlákna (jemně) + vrásky (víc)
    vyska = math_('ADD', math_('MULTIPLY', sum_(1600, 5, distortion=2.0), 0.55),
                  math_('MULTIPLY', sum_(140, 6), 0.45))
    bump = n.new('ShaderNodeBump')
    bump.inputs['Strength'].default_value = 0.28
    if z_svar_mm is not None:
        # svár nahoře: jemné vodorovné rýhy po svařovacích čelistech
        sep = n.new('ShaderNodeSeparateXYZ')
        l.new(obj, sep.inputs['Vector'])
        maska = math_('GREATER_THAN', sep.outputs['Z'], z_svar_mm * MM)
        vlna = n.new('ShaderNodeTexWave')
        vlna.wave_type = 'BANDS'
        vlna.bands_direction = 'Z'
        vlna.inputs['Scale'].default_value = 900
        l.new(obj, vlna.inputs['Vector'])
        vyska = math_('ADD', vyska, math_('MULTIPLY', math_('MULTIPLY', vlna.outputs['Fac'], maska), 3.0))
    l.new(vyska, bump.inputs['Height'])
    l.new(bump.outputs['Normal'], bsdf.inputs['Normal'])
    return m


def material_etiketa(cesta, oblast=None):
    """oblast = (x, y, š, v) etikety v px na větší textuře (textura_<id>.png
    z etikety.py má etiketu na 336, 960, 1408 × 1920 z 2080 × 3360)."""
    m = bpy.data.materials.new('Etiketa')
    m.use_nodes = True
    nt = m.node_tree
    n, l = nt.nodes, nt.links
    bsdf = n['Principled BSDF']
    img = n.new('ShaderNodeTexImage')
    img.image = bpy.data.images.load(cesta, check_existing=True)
    img.interpolation = 'Cubic'
    img.extension = 'CLIP'
    if oblast:
        TW, TH = img.image.size
        x, y, w, h = oblast
        uv = n.new('ShaderNodeUVMap')
        mp = n.new('ShaderNodeMapping')
        mp.inputs['Scale'].default_value = (w / TW, h / TH, 1)
        mp.inputs['Location'].default_value = (x / TW, 1 - (y + h) / TH, 0)
        l.new(uv.outputs['UV'], mp.inputs['Vector'])
        l.new(mp.outputs['Vector'], img.inputs['Vector'])
    l.new(img.outputs['Color'], bsdf.inputs['Base Color'])
    l.new(img.outputs['Alpha'], bsdf.inputs['Alpha'])
    bsdf.inputs['Roughness'].default_value = 0.6
    return m



def postav_etiketu(sacek, z_napln, cesta, kolekce=None, oblast=None):
    """Etiketa jako síť před přední stěnou, přilepená k sáčku (shrinkwrap).
    Je dítě sáčku, takže se s ním otáčí."""
    ew, eh = ETIKETA_MM
    z_dole = max(18.0, z_napln + 10 - eh)
    bm = bmesh.new()
    bm.loops.layers.uv.new('UVMap')
    bmesh.ops.create_grid(bm, x_segments=60, y_segments=80, size=0.5, calc_uvs=True)
    for v in bm.verts:
        x, y = v.co.x, v.co.y
        v.co = (x * ew * MM, -0.2, (z_dole + (y + 0.5) * eh) * MM)
    for f in bm.faces:
        f.smooth = True
    me = bpy.data.meshes.new('Etiketa')
    bm.to_mesh(me)
    bm.free()
    et = bpy.data.objects.new('Etiketa', me)
    _link(et, kolekce)
    et.parent = sacek
    sw = et.modifiers.new('Prilepit', 'SHRINKWRAP')
    sw.target = sacek
    sw.wrap_method = 'PROJECT'
    sw.use_project_y = True
    sw.use_negative_direction = True
    sw.use_positive_direction = True
    sw.offset = 0.25 * MM
    me.materials.append(material_etiketa(cesta, oblast))
    return et


def postav(velikost, etiketa, x=0.0, kolekce=None, otoceni=0.0, oblast=None):
    """Sáček (a etiketa, je-li zadaná) v dané velikosti. Vrací (sáček, etiketa)."""
    W, H, G = VELIKOSTI[velikost]
    sacek, z_napln, z_svar = postav_sacek(W, H, G, kolekce)
    sacek.location.x = x
    sacek.rotation_euler.z = otoceni
    sacek.data.materials.append(material_kraft(z_svar))
    et = postav_etiketu(sacek, z_napln, etiketa, kolekce, oblast) if etiketa else None
    return sacek, et


def scena(pozadi, sirka_m, vyska_m, pohled, na_sirku):
    sc = bpy.context.scene
    world = bpy.data.worlds.new('Svet')
    sc.world = world
    world.use_nodes = True
    world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.92, 0.89, 0.84, 1)
    world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.35
    cil = Vector((0, 0, vyska_m * 0.47))
    k = max(vyska_m / 0.225, sirka_m / 0.30)

    def area(name, loc, energy, size):
        L = bpy.data.lights.new(name, 'AREA')
        L.energy = energy * k * k
        L.size = size * k
        o = bpy.data.objects.new(name, L)
        sc.collection.objects.link(o)
        o.location = Vector(loc) * k
        o.rotation_euler = (cil - o.location).to_track_quat('-Z', 'Y').to_euler()
    area('Klic', (-0.35, -0.45, 0.42), 7, 0.35)
    area('Vypln', (0.45, -0.3, 0.2), 1.8, 0.5)
    area('Kontra', (0.15, 0.45, 0.4), 3, 0.3)

    bpy.ops.mesh.primitive_plane_add(size=6, location=(0, 0, 0))
    pod = bpy.context.active_object
    if pozadi:
        m = bpy.data.materials.new('Pozadi')
        m.use_nodes = True
        m.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (0.86, 0.82, 0.74, 1)
        m.node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value = 0.9
        pod.data.materials.append(m)
    else:
        pod.is_shadow_catcher = True
        sc.render.film_transparent = True

    cam_d = bpy.data.cameras.new('Kamera')
    cam_d.lens = 85
    cam = bpy.data.objects.new('Kamera', cam_d)
    sc.collection.objects.link(cam)
    sc.camera = cam
    uhel = math.radians({'predni': 0, 'bok': 32, 'skupina': 18}[pohled])
    # vzdálenost tak, aby se vešla výška (na výšku) nebo šířka (na šířku)
    fov = 2 * math.atan(18 / 85)
    vzd = (sirka_m / 0.80 if na_sirku else vyska_m / 0.80) / (2 * math.tan(fov / 2))
    cam.location = (vzd * math.sin(uhel), -vzd * math.cos(uhel), vzd * 0.30)
    cam.rotation_euler = (cil - cam.location).to_track_quat('-Z', 'Y').to_euler()


def main(argv):
    ap = argparse.ArgumentParser()
    ap.add_argument('etiketa', help='etiketa_<id>.png; u skupiny tři cesty oddělené čárkou (50 g, 100 g, 250 g)')
    ap.add_argument('vystup')
    ap.add_argument('--velikost', type=int, default=750, choices=VELIKOSTI)
    ap.add_argument('--pohled', default='predni', choices=('predni', 'bok', 'skupina'))
    ap.add_argument('--vzorky', type=int, default=96)
    ap.add_argument('--sirka', type=int, default=900)
    ap.add_argument('--pozadi', action='store_true')
    a = ap.parse_args(argv)

    bpy.ops.wm.read_factory_settings(use_empty=True)
    if a.pohled == 'skupina':
        cesty = a.etiketa.split(',')
        mezera = 28
        sirky = [VELIKOSTI[v][0] for v in (300, 750, 1500)]
        xs = [-(sirky[0] / 2 + mezera + sirky[1] / 2), 0, sirky[1] / 2 + mezera + sirky[2] / 2]
        for v, c, x in zip((300, 750, 1500), cesty, xs):
            postav(v, c, x * MM)
        sirka_m = (xs[2] - xs[0] + sirky[0] / 2 + sirky[2] / 2) * MM
        vyska_m = VELIKOSTI[1500][1] * MM
        scena(a.pozadi, sirka_m, vyska_m, 'skupina', True)
        rx, ry = a.sirka, int(a.sirka * 0.72)
    else:
        postav(a.velikost, a.etiketa)
        W, H, G = VELIKOSTI[a.velikost]
        scena(a.pozadi, W * MM, H * MM, a.pohled, False)
        rx, ry = a.sirka, int(a.sirka * 1.35)

    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    sc.cycles.device = 'CPU'
    sc.cycles.samples = a.vzorky
    sc.cycles.use_denoising = True
    sc.render.resolution_x, sc.render.resolution_y = rx, ry
    sc.render.image_settings.file_format = 'PNG'
    sc.render.image_settings.color_mode = 'RGBA'
    sc.view_settings.view_transform = 'Standard'
    sc.view_settings.look = 'None'
    sc.view_settings.exposure = -0.55
    sc.render.filepath = a.vystup
    bpy.ops.render.render(write_still=True)


if __name__ == '__main__':
    # v Blenderu (blender -b -P …) jsou argumenty skriptu až za „--“
    main(sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:])
