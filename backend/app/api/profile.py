from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel, Field
from app.core.database import get_db
from app.models.models import User
from app.api.deps import get_current_user

router = APIRouter(prefix="/profile", tags=["Perfil"])

class RealStats(BaseModel):
    missions_completed: int
    streak_days: int
    unlocked_achievements_count: int
    coins: int
    xp: int
    level: int

class RealProfileOut(BaseModel):
    id: int
    username: str
    stats: RealStats
    equipped_skin: str
    equipped_aura: str
    pet_name: str
    pet_color: str
    equipped_achievements: list[str]
    bio_signature: str

@router.get("/me", response_model=RealProfileOut)
def get_my_real_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Devuelve estrictamente los datos verificados del estudiante.
    Cero estadísticas inventadas.
    """
    # 1. Contar misiones reales completadas
    missions_count = db.execute(
        text("SELECT COUNT(*) FROM user_mission_progress WHERE user_id = :uid"),
        {"uid": current_user.id}
    ).scalar() or 0

    # 2. Contar logros reales desbloqueados
    ach_count = db.execute(
        text("SELECT COUNT(*) FROM user_unlocked_achievements WHERE user_id = :uid"),
        {"uid": current_user.id}
    ).scalar() or 0

    # 3. Logros que el usuario tiene equipados en su perfil
    raw_equipped = [a for a in (current_user.equipped_achievements or "").split(",") if a]
    
    # Validar que los logros equipados realmente estén desbloqueados en la BD
    valid_equipped = []
    if raw_equipped:
        unlocked_set = set(r[0] for r in db.execute(
            text("SELECT achievement_id FROM user_unlocked_achievements WHERE user_id = :uid"),
            {"uid": current_user.id}
        ).fetchall())
        valid_equipped = [a for a in raw_equipped if a in unlocked_set]

    return RealProfileOut(
        id=current_user.id,
        username=current_user.username,
        stats=RealStats(
            missions_completed=missions_count,
            streak_days=current_user.streak_days or 1,
            unlocked_achievements_count=ach_count,
            coins=current_user.coins,
            xp=current_user.xp,
            level=current_user.level
        ),
        equipped_skin=current_user.equipped_skin or "default",
        equipped_aura=current_user.equipped_aura or "none",
        pet_name=current_user.pet_name or "Ignis",
        pet_color=current_user.pet_color or "orange",
        equipped_achievements=valid_equipped,
        bio_signature=current_user.bio_signature or "Estudiante de JDAB PROGRAMING"
    )


class BioIn(BaseModel):
    bio_signature: str = Field(..., min_length=1, max_length=60)

@router.patch("/bio")
def update_bio(data: BioIn, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    current_user.bio_signature = data.bio_signature.strip()
    db.commit()
    return {"bio_signature": current_user.bio_signature}
