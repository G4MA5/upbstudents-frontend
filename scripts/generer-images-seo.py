"""Génère les images de partage (Open Graph, 1200x630) et le logo haute
définition à partir des logos du dossier public/.

    python scripts/generer-images-seo.py

À relancer seulement si un logo change. Nécessite Pillow (pip install pillow).
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
FONTS = Path("C:/Windows/Fonts")
ORANGE = (244, 123, 32)
ORANGE_DARK = (201, 79, 0)
INK = (22, 22, 24)
MUTED = (96, 96, 104)


def font(name: str, size: int):
    for candidate in (FONTS / name, Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf")):
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size)
    return ImageFont.load_default()


def fit(img: Image.Image, box: int) -> Image.Image:
    scale = box / max(img.size)
    return img.resize((round(img.width * scale), round(img.height * scale)), Image.LANCZOS)


def wrap(draw, text, fnt, width):
    lines, line = [], ""
    for word in text.split():
        test = f"{line} {word}".strip()
        if draw.textlength(test, font=fnt) <= width:
            line = test
        else:
            lines.append(line)
            line = word
    lines.append(line)
    return lines


def card(logo: Image.Image, title: str, subtitle: str, tagline: str, out: Path):
    W, H = 1200, 630
    img = Image.new("RGB", (W, H), "white")
    d = ImageDraw.Draw(img)
    # Orange band and soft circle (brand identity)
    d.rectangle([0, H - 18, W, H], fill=ORANGE)
    d.ellipse([W - 330, -200, W + 170, 300], fill=(255, 241, 230))
    # Logo tile
    tile = 300
    d.rounded_rectangle([80, (H - tile) // 2 - 10, 80 + tile, (H + tile) // 2 - 10], radius=48, fill=(255, 247, 240), outline=(250, 226, 207), width=2)
    lg = fit(logo, 210)
    img.paste(lg, (80 + (tile - lg.width) // 2, (H - lg.height) // 2 - 10), lg)
    # Text
    x = 440
    f_title, f_sub, f_tag = font("segoeuib.ttf", 76), font("segoeui.ttf", 34), font("seguisb.ttf", 28)
    y = 150
    d.text((x, y), title, font=f_title, fill=INK)
    y += 110
    for line in wrap(d, subtitle, f_sub, W - x - 70):
        d.text((x, y), line, font=f_sub, fill=MUTED)
        y += 46
    d.text((x, y + 28), tagline, font=f_tag, fill=ORANGE_DARK)
    img.save(out, optimize=True)
    print("écrit", out.relative_to(ROOT))


def main():
    (PUBLIC / "og").mkdir(exist_ok=True)
    upb = Image.open(PUBLIC / "logo5.png").convert("RGBA")
    gama = Image.open(PUBLIC / "logo_gama.png").convert("RGBA")

    # Logo HD (Google demande au moins 112 x 112 px), fond blanc.
    square = Image.new("RGBA", (192, 192), "white")
    big = fit(upb, 160)
    square.paste(big, ((192 - big.width) // 2, (192 - big.height) // 2), big)
    square.convert("RGB").save(PUBLIC / "logo-upb-students.png", optimize=True)
    print("écrit public/logo-upb-students.png")

    card(upb, "UpB Student's", "La bibliothèque numérique de l'Université Polytechnique de Bingerville",
         "Examens · Cours · TD · TP · Mémoires · Livres", PUBLIC / "og" / "upb-students.png")
    card(gama, "Gama Labs", "L'équipe qui a conçu et développé UpB Student's, la bibliothèque numérique de l'UPB",
         "upbstudents-labibliotheque.com/gama-labs", PUBLIC / "og" / "gama-labs.png")


if __name__ == "__main__":
    main()
