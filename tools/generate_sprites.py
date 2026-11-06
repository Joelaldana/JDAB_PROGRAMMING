"""
generate_sprites.py - Sistema de Gestión, Validación y Registro de Sprites
CodeProgress / JDAB PROGRAMING
"""

import os
import sys
import json
import argparse
from pathlib import Path
try:
    from PIL import Image
except ImportError:
    print("Aviso: 'Pillow' no está instalado. Ejecuta: pip install Pillow para procesar miniaturas y dimensiones.")
    Image = None

# Rutas estándar del proyecto
ROOT_DIR = Path(__file__).resolve().parent.parent
PUBLIC_ASSETS = ROOT_DIR / "frontend" / "public" / "assets"
CATALOG_PATH = ROOT_DIR / "frontend" / "src" / "data" / "catalog.json"

CATEGORIES = ["characters", "skins", "auras", "pets", "pet_colors", "items"]

def ensure_directories():
    """Garantiza la existencia del árbol de carpetas de recursos gráficos."""
    for cat in CATEGORIES:
        (PUBLIC_ASSETS / "sprites" / cat).mkdir(parents=True, exist_ok=True)
        (PUBLIC_ASSETS / "thumbnails" / cat).mkdir(parents=True, exist_ok=True)

def load_catalog() -> dict:
    if CATALOG_PATH.exists():
        with open(CATALOG_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"version": "1.0.0", "categories": CATEGORIES, "items": []}

def save_catalog(catalog: dict):
    CATALOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(CATALOG_PATH, "w", encoding="utf-8") as f:
        json.dump(catalog, f, indent=2, ensure_ascii=False)
    print(f"✅ Catálogo actualizado con éxito en: {CATALOG_PATH}")

def register_custom_asset(
    input_image_path: str,
    item_id: str,
    name: str,
    category: str,
    rarity: str = "Común",
    price: int = 1000,
    requires_level: int = 1
):
    """
    Procesa un recurso gráfico propio, valida transparencia/tamaño,
    genera miniatura y lo inscribe en el catálogo.
    """
    ensure_directories()
    src = Path(input_image_path)
    if not src.exists():
        print(f"❌ Error: El archivo fuente no existe en: {input_image_path}")
        return False

    if category not in CATEGORIES:
        print(f"❌ Error: Categoría '{category}' inválida. Opciones: {CATEGORIES}")
        return False

    dest_sprite = PUBLIC_ASSETS / "sprites" / category / f"{item_id}.webp"
    dest_thumb = PUBLIC_ASSETS / "thumbnails" / category / f"{item_id}_thumb.webp"

    # Procesamiento con Pillow
    if Image is not None:
        try:
            with Image.open(src) as img:
                # Comprobar transparencia
                if img.mode not in ("RGBA", "LA") and "transparency" not in img.info:
                    print(f"⚠️ Advertencia: '{src.name}' no parece tener fondo transparente.")
                
                # Guardar sprite estándar optimizado en WebP
                img_resized = img.resize((512, 512), Image.Resampling.LANCZOS)
                img_resized.save(dest_sprite, "WEBP", quality=90)

                # Generar miniatura
                thumb = img.resize((128, 128), Image.Resampling.LANCZOS)
                thumb.save(dest_thumb, "WEBP", quality=85)
                print(f"✔ Recurso optimizado guardado: {dest_sprite.name}")
        except Exception as e:
            print(f"❌ Error procesando imagen: {e}")
            return False
    else:
        # Copia directa si Pillow no está instalado
        import shutil
        dest_sprite = PUBLIC_ASSETS / "sprites" / category / src.name
        shutil.copy2(src, dest_sprite)

    # Actualizar catálogo
    catalog = load_catalog()
    existing = next((i for i in catalog["items"] if i["id"] == item_id), None)
    
    item_record = {
        "id": item_id,
        "name": name,
        "category": category,
        "rarity": rarity,
        "price": price,
        "currency": "coins",
        "asset_path": f"/assets/sprites/{category}/{item_id}.webp",
        "thumbnail_path": f"/assets/thumbnails/{category}/{item_id}_thumb.webp",
        "is_available": True,
        "requires_level": requires_level
    }

    if existing:
        catalog["items"][catalog["items"].index(existing)] = item_record
        print(f"ℹ️ Artículo '{item_id}' sobrescrito en el catálogo.")
    else:
        catalog["items"].append(item_record)
        print(f"✨ Nuevo artículo '{name}' registrado con éxito en el catálogo.")

    save_catalog(catalog)
    return True

def generate_with_ai(prompt: str, item_id: str, category: str):
    """
    Hook para generación mediante Inteligencia Artificial (DALL-E / Stable Diffusion).
    Mantiene las credenciales fuera del código mediante variables de entorno.
    """
    api_key = os.environ.get("IMAGE_GEN_API_KEY")
    if not api_key:
        print("❌ Error: No se encontró la variable de entorno 'IMAGE_GEN_API_KEY'.")
        print("Para generar con IA debes configurar: $env:IMAGE_GEN_API_KEY='tu_clave_secreta'")
        return False
    
    print(f"🚀 Conectando con el motor de IA para generar '{prompt}'...")
    # Aquí se integra la llamada al SDK correspondiente (OpenAI, Stability, etc.)
    print("Aviso: Conector de IA listo. Para recursos manuales usa el comando 'register'.")
    return True

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Gestor y Generador de Sprites para JDAB PROGRAMING")
    subparsers = parser.add_subparsers(dest="command")

    # Comando register (para tus propios recursos gráficos)
    reg_parser = subparsers.add_parser("register", help="Registrar un sprite propio en el catálogo")
    reg_parser.add_argument("--file", required=True, help="Ruta de la imagen de origen")
    reg_parser.add_argument("--id", required=True, help="ID único (ej: skin_cyber_ninja)")
    reg_parser.add_argument("--name", required=True, help="Nombre visible del artículo")
    reg_parser.add_argument("--cat", required=True, choices=CATEGORIES, help="Categoría del artículo")
    reg_parser.add_argument("--rarity", default="Común", choices=["Común", "Extraño", "Legendario"])
    reg_parser.add_argument("--price", type=int, default=1000, help="Precio en monedas")
    reg_parser.add_argument("--level", type=int, default=1, help="Nivel requerido")

    args = parser.parse_args()

    if args.command == "register":
        register_custom_asset(
            input_image_path=args.file,
            item_id=args.id,
            name=args.name,
            category=args.cat,
            rarity=args.rarity,
            price=args.price,
            requires_level=args.level
        )
    else:
        parser.print_help()