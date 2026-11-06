from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import text, bindparam
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import User
from app.api.lessons import LESSONS

router = APIRouter(prefix="/ranking", tags=["Ranking"])


class LeaderboardUser(BaseModel):
    rank: int
    id: int
    username: str
    level: int
    xp: int
    streak_days: int
    achievements_count: int
    score_value: int
    score_label: str
    equipped_skin: str
    equipped_aura: str


def _achievement_counts(db: Session, ids: list[int]) -> dict[int, int]:
    if not ids:
        return {}
    q = text("SELECT user_id, COUNT(*) FROM user_unlocked_achievements WHERE user_id IN :ids GROUP BY user_id").bindparams(bindparam("ids", expanding=True))
    return {uid: n for uid, n in db.execute(q, {"ids": ids}).fetchall()}


def _build(db: Session, users: list[User], scores: dict[int, int], label: str) -> list[LeaderboardUser]:
    counts = _achievement_counts(db, [u.id for u in users])
    return [LeaderboardUser(
        rank=i + 1, id=u.id, username=u.username, level=u.level, xp=u.xp, streak_days=u.streak_days or 1,
        achievements_count=counts.get(u.id, 0), score_value=scores[u.id], score_label=label,
        equipped_skin=u.equipped_skin or "default", equipped_aura=u.equipped_aura or "none",
    ) for i, u in enumerate(users)]


@router.get("/", response_model=list[LeaderboardUser])
def get_ranking(category: str = Query("global", pattern="^(global|streak|python|html|css)$"), db: Session = Depends(get_db)):
    """Top 10 real. Los rankings por módulo cuentan misiones de user_mission_progress (antes consultaban tablas vacías)."""
    if category == "streak":
        users = db.query(User).order_by(User.streak_days.desc(), User.xp.desc()).limit(10).all()
        return _build(db, users, {u.id: u.streak_days or 1 for u in users}, "Días Racha")

    if category in ("python", "html", "css"):
        ids = [k for k, v in LESSONS.items() if v["module"] == category]
        q = text("""SELECT u.id, COUNT(p.id) AS c FROM users u
                    LEFT JOIN user_mission_progress p ON p.user_id = u.id AND p.lesson_id IN :ids
                    GROUP BY u.id ORDER BY c DESC, MAX(u.xp) DESC LIMIT 10""").bindparams(bindparam("ids", expanding=True))
        rows = db.execute(q, {"ids": ids}).fetchall()
        by_id = {u.id: u for u in db.query(User).filter(User.id.in_([r[0] for r in rows])).all()}
        users = [by_id[r[0]] for r in rows]
        return _build(db, users, {r[0]: r[1] for r in rows}, f"Misiones {category.upper()}")

    users = db.query(User).order_by(User.level.desc(), User.xp.desc(), User.coins.desc()).limit(10).all()
    return _build(db, users, {u.id: u.xp for u in users}, "Puntos XP")


@router.get("/user/{user_id}/public")
def get_user_public_profile(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Jugador no encontrado")
    skin = user.equipped_skin or "base_default"
    return {
        "id": user.id, "username": user.username, "level": user.level, "xp": user.xp,
        "streak_days": user.streak_days or 1, "pet_name": user.pet_name or "Ignis",
        "pet_color": user.pet_color or "orange",
        "equipped_skin_id": "base_default" if skin == "default" else skin,
        "equipped_aura": user.equipped_aura or "none",
        "equipped_achievements": user.equipped_achievements or "",
        "bio_signature": user.bio_signature or "¡Aventurero de JDAB PROGRAMING!",
    }
