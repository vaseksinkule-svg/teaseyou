#!/usr/bin/env python3
"""Připraví rendery z Blenderu pro web.

Sáček hotové směsi:
    python3 tools/rendery/vyrez.py sacek RENDER.png deep-winter
    -> img/sacky/deep-winter-480.webp a img/sacky/deep-winter-960.webp

  Render má světlé, málo barevné pozadí (studio). Skript vezme jako pozadí
  všechno málo barevné, co souvisí s okrajem obrázku, a nechá jen sáček.
  Etiketa uvnitř sáčku zůstane, i když je světlá, protože ji obklopuje kraft.
  Stín se nepřenáší, kreslí ho web (.pouch::after). Sáček se postaví dolů
  doprostřed rámečku 200 : 270, stejného jako kreslený sáček na webu.

Surovina:
    python3 tools/rendery/vyrez.py surovina RENDER.png cerny-caj
    -> img/suroviny/cerny-caj-400.webp

  Čtverec z hustého středu hromádky, aby kolečko na webu vyplnily lístky.

Surovina z makro detailu (tools/rendery/blender_suroviny.py, čtvercový záběr
plný lístků):
    python3 tools/rendery/vyrez.py detail RENDER_detail.png zeleny-caj
    -> img/suroviny/zeleny-caj-400.webp

  Bere střed obrázku (90 %), okraje s nejsilnějším rozostřením odřízne.

Hromádka na průhledném pozadí (blender_suroviny.py, renderuj(..., pruhledne=True)):
    python3 tools/rendery/vyrez.py hromadka RENDER_vyrez.png jablko
    -> img/suroviny/jablko-hromadka-480.webp

  Ořízne hromádku i se stínem a postaví ji dolů doprostřed rámečku 3 : 2
  (480 × 320 px), aby měly všechny hromádky na webu stejnou výšku řádku.

Scéna hotové směsi (blender_sceny.py, průhledné pozadí se stínem):
    python3 tools/rendery/vyrez.py scena RENDER.png deep-winter
    -> img/sceny/deep-winter-480.webp a img/sceny/deep-winter-960.webp

  Všechny scény mají stejnou kameru, proto se ořezávají stejným pevným
  výřezem SCENA_VYREZ (čtverec). Na webu se nic neposouvá.

Pak přidej řádek do POUCH_RENDERS / SCENE_RENDERS (podle id směsi) nebo
ING_SLUGS (podle kódu suroviny) ve script.js.

Potřebuje: numpy, scipy, Pillow.
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage as ndi

ROOT = Path(__file__).resolve().parents[2]


def sacek(src: str, slug: str) -> None:
    im = np.asarray(Image.open(src).convert('RGB')).astype(np.float32)
    chroma = im.max(2) - im.min(2)
    lab, _ = ndi.label(chroma < 20)
    border = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    fg = ~np.isin(lab, border[border > 0])
    fg = ndi.binary_opening(fg, iterations=2)
    lab2, n = ndi.label(fg)
    if not n:
        sys.exit('V obrázku jsem nenašel sáček.')
    sizes = ndi.sum(fg, lab2, range(1, n + 1))
    fg = ndi.binary_fill_holes(lab2 == (1 + int(np.argmax(sizes))))
    # změkčený okraj a barvy z okraje dotažené zevnitř, ať nemá šedý lem
    inner = ndi.binary_erosion(fg, iterations=2)
    alpha = ndi.gaussian_filter(fg.astype(np.float32), 1.0)
    alpha[inner] = 1.0
    _, (iy, ix) = ndi.distance_transform_edt(~inner, return_indices=True)
    rgb = im.copy()
    edge = ~inner
    rgb[edge] = im[iy[edge], ix[edge]]
    res = np.dstack([rgb, alpha * 255]).clip(0, 255).astype(np.uint8)
    ys, xs = np.where(alpha > 0.05)
    cut = Image.fromarray(res[ys.min():ys.max() + 1, xs.min():xs.max() + 1], 'RGBA')
    w, h = cut.size
    bw, bh = w, round(w * 270 / 200)
    if bh < h:
        bh, bw = h, round(h * 200 / 270)
    box = Image.new('RGBA', (bw, bh), (0, 0, 0, 0))
    box.alpha_composite(cut, ((bw - w) // 2, bh - h))
    out = ROOT / 'img' / 'sacky'
    out.mkdir(parents=True, exist_ok=True)
    for width in (960, 480):
        b = box.resize((width, round(width * bh / bw)), Image.LANCZOS)
        b.save(out / f'{slug}-{width}.webp', 'WEBP', quality=86, method=6)
    print(f'sáček {w}×{h} px, poměr {w / h:.2f} → {out}/{slug}-480|960.webp')


def surovina(src: str, slug: str) -> None:
    im = np.asarray(Image.open(src).convert('RGB')).astype(np.float32)
    bg = np.median(np.concatenate([im[0], im[-1], im[:, 0], im[:, -1]]), axis=0)
    diff = np.abs(im - bg).max(2)
    mask = ndi.binary_opening(diff > 40, iterations=2)
    lab, n = ndi.label(mask)
    if not n:
        sys.exit('V obrázku jsem nenašel hromádku.')
    sizes = ndi.sum(mask, lab, range(1, n + 1))
    pile = lab == (1 + int(np.argmax(sizes)))
    ys, xs = np.where(pile)
    cy, cx = int(np.median(ys)), int(np.median(xs))
    side = int(min(xs.max() - xs.min(), ys.max() - ys.min()) * 0.7)
    # U řidší hromádky (skořice) by ve středu prosvítalo pozadí. Čtverec se
    # proto posune tam, kde ho hromádka pokryje nejvíc (při shodě blíž středu).
    # mezery v hromádce: světlé a skoro šedé pixely (stín na pozadí)
    jas, sytost = im.mean(2), im.max(2) - im.min(2)
    plna = pile & ~((sytost < 25) & (jas > 140))
    hust = plna.astype(np.float64).cumsum(0).cumsum(1)
    hust = np.pad(hust, ((1, 0), (1, 0)))
    best = None
    krok = max(4, side // 40)
    for y0 in range(max(0, cy - side), min(pile.shape[0] - side, cy) + 1, krok):
        for x0 in range(max(0, cx - side), min(pile.shape[1] - side, cx) + 1, krok):
            kryti = hust[y0 + side, x0 + side] - hust[y0, x0 + side] - hust[y0 + side, x0] + hust[y0, x0]
            vzd = abs(y0 + side / 2 - cy) + abs(x0 + side / 2 - cx)
            klic = (round(kryti / side ** 2, 3), -vzd)
            if best is None or klic > best[0]:
                best = (klic, x0, y0)
    _, x0, y0 = best
    cx, cy = x0 + side // 2, y0 + side // 2
    crop = Image.fromarray(im.astype(np.uint8)).crop((x0, y0, x0 + side, y0 + side))
    out = ROOT / 'img' / 'suroviny'
    out.mkdir(parents=True, exist_ok=True)
    crop.resize((400, 400), Image.LANCZOS).save(out / f'{slug}-400.webp', 'WEBP', quality=84, method=6)
    print(f'čtverec {side} px kolem ({cx}, {cy}) → {out}/{slug}-400.webp')


def detail(src: str, slug: str) -> None:
    im = Image.open(src).convert('RGB')
    side = int(min(im.size) * 0.9)
    x0, y0 = (im.width - side) // 2, (im.height - side) // 2
    out = ROOT / 'img' / 'suroviny'
    out.mkdir(parents=True, exist_ok=True)
    im.crop((x0, y0, x0 + side, y0 + side)).resize((400, 400), Image.LANCZOS).save(
        out / f'{slug}-400.webp', 'WEBP', quality=84, method=6)
    print(f'střed {side} px → {out}/{slug}-400.webp')


def _okraje_do_ztracena(a, podil=0.05):
    """Alfa na krajích výřezu plynule do nuly, ať slabý stín neskončí rovnou čarou."""
    h, w = a.shape
    ry = np.clip(np.minimum(np.arange(h), np.arange(h)[::-1]) / (podil * h), 0, 1)
    rx = np.clip(np.minimum(np.arange(w), np.arange(w)[::-1]) / (podil * w), 0, 1)
    return a * np.minimum.outer(ry, rx)


def hromadka(src: str, slug: str) -> None:
    im = np.asarray(Image.open(src).convert('RGBA')).astype(np.float32)
    a = im[..., 3]
    ys, xs = np.where(a > 20)
    if not len(xs):
        sys.exit('V obrázku jsem nenašel hromádku.')
    x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    # okraj kolem (stín je měkký), pak rámeček 3 : 2 s hromádkou dole na středu
    m = int(0.06 * (x1 - x0))
    x0, x1, y0, y1 = max(0, x0 - m), min(im.shape[1], x1 + m), max(0, y0 - m), min(im.shape[0], y1 + m // 2)
    cut = im[y0:y1, x0:x1].copy()
    cut[..., 3] = _okraje_do_ztracena(cut[..., 3])
    h, w = cut.shape[:2]
    bw, bh = max(w, round(h * 1.5)), max(h, round(w / 1.5))
    box = np.zeros((bh, bw, 4), np.float32)
    ox, oy = (bw - w) // 2, bh - h
    box[oy:oy + h, ox:ox + w] = cut
    out = ROOT / 'img' / 'suroviny'
    out.mkdir(parents=True, exist_ok=True)
    Image.fromarray(box.clip(0, 255).astype(np.uint8), 'RGBA').resize((480, 320), Image.LANCZOS).save(
        out / f'{slug}-hromadka-480.webp', 'WEBP', quality=82, method=6)
    print(f'hromádka {w}×{h} px → {out}/{slug}-hromadka-480.webp')


# Pevný výřez scény (zlomky šířky a výšky renderu 1800 × 1800). Kamera
# v blender_sceny.py už má čtvercový záběr, takže se bere celý.
SCENA_VYREZ = (0.0, 0.0, 1.0, 1.0)


def scena(src: str, slug: str) -> None:
    im = Image.open(src).convert('RGBA')
    x0, y0, x1, y1 = SCENA_VYREZ
    W, H = im.size
    cut = im.crop((round(x0 * W), round(y0 * H), round(x1 * W), round(y1 * H)))
    arr = np.asarray(cut).astype(np.float32)
    # Stín z Blenderu (černé pixely s alfou) má i daleko od sáčku slabý závoj
    # kolem 5 %, na webu by z něj byl vidět tmavší čtverec. Ten se odečte,
    # kontaktní stíny pod sáčkem a hromádkami zůstanou.
    stin = arr[..., :3].max(2) < 8
    arr[..., 3] = np.where(stin, np.clip((arr[..., 3] - 18) / (255 - 18), 0, 1) * 255, arr[..., 3])
    arr[..., 3] = _okraje_do_ztracena(arr[..., 3], 0.03)
    cut = Image.fromarray(arr.clip(0, 255).astype(np.uint8), 'RGBA')
    out = ROOT / 'img' / 'sceny'
    out.mkdir(parents=True, exist_ok=True)
    for width in (960, 480):
        cut.resize((width, round(width * cut.height / cut.width)), Image.LANCZOS).save(
            out / f'{slug}-{width}.webp', 'WEBP', quality=84, method=6)
    print(f'scéna {cut.width}×{cut.height} px → {out}/{slug}-480|960.webp')


if __name__ == '__main__':
    rezimy = {'sacek': sacek, 'surovina': surovina, 'detail': detail, 'hromadka': hromadka, 'scena': scena}
    if len(sys.argv) != 4 or sys.argv[1] not in rezimy:
        sys.exit(__doc__)
    rezimy[sys.argv[1]](sys.argv[2], sys.argv[3])
