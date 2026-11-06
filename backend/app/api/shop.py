from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from pydantic import BaseModel
from app.core.database import get_db
from app.models.models import User
from app.api.deps import get_current_user

router = APIRouter(prefix="/shop", tags=["Tienda & Inventario"])

# CATÁLOGO OFICIAL CON LOS IDENTIFICADORES EXACTOS DE TU JSON MODULAR
CATALOG = {
    "skins": [
        {"id": "base_default", "name": "Qbit Clásico", "rarity": "Común", "price": 0, "preview": "🧢", "desc": "Personaje base oficial de todo estudiante."},
        {"id": "tanjiro_style", "name": "Cazador de Demonios", "rarity": "Legendario", "price": 4500, "preview": "🗡️", "desc": "Haori de cuadros verdes y negros con aretes hanafuda."},
        {"id": "witch_purple", "name": "Bruja Mística", "rarity": "Extraño", "price": 2200, "preview": "🧙‍♀️", "desc": "Sombrero oscuro con plumas violetas y vestido místico."},
        {"id": "witch_green", "name": "Bruja del Bosque", "rarity": "Extraño", "price": 1800, "preview": "🌿", "desc": "Gorro puntiagudo verde y túnica botánica."},
        {"id": "black_cat", "name": "Gato Oscuro", "rarity": "Común", "price": 1300, "preview": "🐱", "desc": "Traje enterizo de gato negro con cola y orejitas."},
        {"id": "scarecrow", "name": "Espantapájaros", "rarity": "Extraño", "price": 2500, "preview": "🌾", "desc": "Sombrero de paja con girasol y overol rústico."},
        {"id": "mummy", "name": "Momia Ancestral", "rarity": "Legendario", "price": 3500, "preview": "🩹", "desc": "Vendajes bendecidos con energía del templo antiguo."},
        {"id": "grim_reaper", "name": "Espectro Sombrío", "rarity": "Legendario", "price": 4500, "preview": "💀", "desc": "Túnica negra con capucha de nigromante de código."},
        {"id": "red_oni", "name": "Demonio Oni", "rarity": "Legendario", "price": 4000, "preview": "👹", "desc": "Cuernos y túnica inspirados en la mitología oriental."},
        {"id": "princess_peach", "name": "Princesa Real", "rarity": "Legendario", "price": 3800, "preview": "👑", "desc": "Vestido rosa elegante y corona dorada con gemas."},
        {"id": "brown_bear", "name": "Oso de Peluche", "rarity": "Extraño", "price": 2000, "preview": "🧸", "desc": "Enterizo cálido y esponjoso de oso pardo."}
    ],
    "auras": [
        {"id": "none", "name": "Sin Aura", "rarity": "Común", "price": 0, "preview": "🚫", "desc": "Sin efectos alrededor del cuerpo."},
        {"id": "aura_shock", "name": "Shock", "rarity": "Común", "price": 10000, "preview": "⚡", "desc": "Rayos puntiagudos dorados con destellos de plasma."},
        {"id": "aura_fire", "name": "Fire", "rarity": "Común", "price": 10000, "preview": "🔥", "desc": "Llamas ardientes de alta temperatura alrededor del cuerpo."},
        {"id": "aura_cosmic", "name": "Cosmic", "rarity": "Común", "price": 10000, "preview": "🌌", "desc": "Anillo de energía cósmica con órbitas gravitacionales."},
        {"id": "aura_wind", "name": "Wind", "rarity": "Común", "price": 10000, "preview": "🌪️", "desc": "Vórtice de ráfagas de aire glaciar."},
        {"id": "aura_sakura", "name": "Sakura", "rarity": "Común", "price": 10000, "preview": "🌸", "desc": "Pétalos de cerezo flotantes de neón rosa."}
    ],
    "pet_colors": [
        {"id": "orange", "name": "Llama Clásica", "rarity": "Común", "price": 0, "preview": "🟠", "desc": "El fuego original de tu mascota."},
        {"id": "pet_blue", "name": "Llama Glaciar", "rarity": "Extraño", "price": 5000, "preview": "🔵", "desc": "Fuego azul que no quema."},
        {"id": "pet_green", "name": "Llama Esmeralda", "rarity": "Extraño", "price": 5000, "preview": "🟢", "desc": "Energía de bosque encantado."},
        {"id": "pet_purple", "name": "Llama Cósmica", "rarity": "Legendario", "price": 6500, "preview": "🟣", "desc": "Fuego de otra dimensión."},
        {"id": "pet_pink", "name": "Llama Sakura", "rarity": "Legendario", "price": 6500, "preview": "🌸", "desc": "Brasas color cerezo."}
    ]
}

# Búsqueda segura: el PRECIO lo decide el servidor, nunca el navegador
_KIND = {"skin": "skins", "aura": "auras", "pet_color": "pet_colors"}
ITEMS = {(k, it["id"]): it for k, group in _KIND.items() for it in CATALOG[group]}
FREE_DEFAULTS = {("skin", "base_default"), ("skin", "default"), ("aura", "none"), ("pet_color", "orange")}

class EquipRequest(BaseModel):
    category: str  # 'skin' | 'aura' | 'pet_color'
    code: str

class BuyRequest(BaseModel):
    category: str
    code: str
    price: int | None = None  # heredado: se IGNORA


def _item_or_404(category: str, code: str) -> dict:
    item = ITEMS.get((category, code))
    if not item:
        raise HTTPException(status_code=404, detail="Artículo inexistente.")
    return item

def _owns(db: Session, uid: int, category: str, code: str) -> bool:
    if (category, code) in FREE_DEFAULTS:
        return True
    return db.execute(text("SELECT 1 FROM user_inventory WHERE user_id=:u AND item_type=:t AND item_code=:c"),
                      {"u": uid, "t": category, "c": code}).fetchone() is not None

def _buy(db: Session, user: User, category: str, code: str) -> None:
    item = _item_or_404(category, code)
    if _owns(db, user.id, category, code):
        raise HTTPException(status_code=400, detail="Ya compraste este artículo previamente.")
    price = int(item["price"])
    # Descuento atómico: solo si alcanza el saldo
    res = db.execute(text("UPDATE users SET coins = coins - :p WHERE id = :u AND coins >= :p"), {"p": price, "u": user.id})
    if res.rowcount == 0:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Monedas insuficientes. Cuesta {price} y tienes {user.coins}.")
    try:
        db.execute(text("INSERT INTO user_inventory (user_id, item_type, item_code) VALUES (:u,:t,:c)"), {"u": user.id, "t": category, "c": code})
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Ya compraste este artículo previamente.")
    db.refresh(user)

def _equip(db: Session, user: User, category: str, code: str) -> None:
    _item_or_404(category, code)
    if not _owns(db, user.id, category, code):
        raise HTTPException(status_code=403, detail="No puedes equipar un artículo que no has comprado.")
    if category == "skin":
        user.equipped_skin = code
    elif category == "aura":
        user.equipped_aura = code
    else:
        user.pet_color = code
    db.commit()
    db.refresh(user)


@router.get("/catalog")
def get_catalog():
    return CATALOG

@router.get("/my-inventory")
def get_my_inventory(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rows = db.execute(text("SELECT item_type, item_code FROM user_inventory WHERE user_id = :uid"), {"uid": current_user.id}).fetchall()
    owned = {"skin": {"base_default", "default"}, "aura": {"none"}, "pet_color": {"orange"}}
    for t, c in rows:
        if t in owned:
            owned[t].add(c)
    unlocked = [r[0] for r in db.execute(text("SELECT achievement_id FROM user_unlocked_achievements WHERE user_id = :uid"), {"uid": current_user.id}).fetchall()]
    skin = current_user.equipped_skin or "base_default"
    skin = "base_default" if skin == "default" else skin
    return {
        "owned_skins": list(owned["skin"]), "owned_auras": list(owned["aura"]), "owned_pet_colors": list(owned["pet_color"]),
        "equipped_skin": skin, "equipped_skin_id": skin,
        "equipped_aura": current_user.equipped_aura or "none", "pet_color": current_user.pet_color or "orange",
        "equipped_achievements": [a for a in (current_user.equipped_achievements or "").split(",") if a],
        "unlocked_achievements": unlocked,
    }

@router.post("/equip")
def equip_item(req: EquipRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _equip(db, current_user, req.category, req.code)
    return {"success": True, "equipped_skin_id": current_user.equipped_skin, "equipped_aura": current_user.equipped_aura, "pet_color": current_user.pet_color}

@router.post("/buy")
def buy_item(req: BuyRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _buy(db, current_user, req.category, req.code)
    return {"message": "¡Compra exitosa! Guardado en tu inventario.", "remaining_coins": current_user.coins}

@router.post("/buy-and-equip")
def buy_and_equip(req: EquipRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Compra (si hace falta y alcanzan las monedas) y equipa en un solo paso."""
    _item_or_404(req.category, req.code)
    if not _owns(db, current_user.id, req.category, req.code):
        _buy(db, current_user, req.category, req.code)
    _equip(db, current_user, req.category, req.code)
    return {"success": True, "remaining_coins": current_user.coins}

@router.post("/toggle-achievement")
def toggle_achievement(req: dict, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Permite equipar o desequipar logros del perfil (máximo 4 a la vez)."""
    ach_id = req.get("achievement_id")
    if not ach_id:
        raise HTTPException(status_code=400, detail="ID de logro requerido")

    unlocked = db.execute(
        text("SELECT id FROM user_unlocked_achievements WHERE user_id = :uid AND achievement_id = :aid"),
        {"uid": current_user.id, "aid": ach_id}
    ).fetchone()

    if not unlocked:
        raise HTTPException(status_code=403, detail="No puedes destacar un logro que no has desbloqueado en misiones.")

    equipped = [a for a in (current_user.equipped_achievements or "").split(",") if a]
    if ach_id in equipped:
        equipped.remove(ach_id)
    else:
        if len(equipped) >= 4:
            equipped.pop(0)
        equipped.append(ach_id)

    current_user.equipped_achievements = ",".join(equipped)
    db.commit()

    return {"equipped_achievements": equipped}