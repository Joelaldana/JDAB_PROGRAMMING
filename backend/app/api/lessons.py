import json
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import User
from app.api.deps import get_current_user

router = APIRouter(prefix="/lessons", tags=["Lecciones"])

# Recompensas y objetivos oficiales (generado desde frontend/src/data/curriculumData.ts).
# El servidor NUNCA confía en las monedas/XP que envía el navegador.
LESSONS: dict = json.loads((Path(__file__).resolve().parent.parent / "data_lessons.json").read_text(encoding="utf-8"))


class CompleteMissionRequest(BaseModel):
    lesson_id: str = Field(..., max_length=50)
    submitted_code: str = Field("", max_length=20000)
    # Campos heredados: se aceptan pero se IGNORAN
    xp_reward: int | None = None
    coin_reward: int | None = None


def norm(text_: str) -> str:
    """Comparación tolerante (idéntica a la del navegador): sin mayúsculas, espacios ni distinción de comillas."""
    return "".join(text_.lower().split()).replace("'", '"')


def _has_all(code: str, keywords: list[str]) -> bool:
    return all(norm(k) in code for k in keywords)


@router.get("/my-progress", response_model=list[str])
def get_my_progress(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rows = db.execute(text("SELECT lesson_id FROM user_mission_progress WHERE user_id = :uid"), {"uid": current_user.id}).fetchall()
    return [r[0] for r in rows]


@router.post("/complete")
def complete_mission(req: CompleteMissionRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    lesson = LESSONS.get(req.lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Misión inexistente.")

    code = norm(req.submitted_code)
    if not all(_has_all(code, kws) for kws in lesson["main"]):
        raise HTTPException(status_code=400, detail="Tu código aún no cumple los objetivos de la misión.")

    bonus_ok = bool(lesson["bonus"]) and _has_all(code, lesson["bonus"]["keywords"])
    xp_gain = lesson["xp"]
    coin_gain = lesson["coins"] + (lesson["bonus"]["coins"] if bonus_ok else 0)

    try:
        db.execute(text("INSERT INTO user_mission_progress (user_id, lesson_id) VALUES (:uid, :lid)"),
                   {"uid": current_user.id, "lid": req.lesson_id})
        db.flush()
    except IntegrityError:  # doble clic / petición duplicada: ya estaba completada
        db.rollback()
        return {"first_time": False, "xp_earned": 0, "coins_earned": 0, "bonus_earned": False,
                "coins": current_user.coins, "xp": current_user.xp, "level": current_user.level,
                "message": "Nivel ya completado. Modo repaso (sin recompensa)."}

    # Suma atómica en SQL (evita carreras entre peticiones simultáneas)
    db.execute(text("UPDATE users SET xp = xp + :x, coins = coins + :c WHERE id = :uid"),
               {"x": xp_gain, "c": coin_gain, "uid": current_user.id})
    db.execute(text("INSERT INTO user_unlocked_achievements (user_id, achievement_id) VALUES (:uid, :aid) ON CONFLICT DO NOTHING"),
               {"uid": current_user.id, "aid": req.lesson_id})
    db.commit()
    db.refresh(current_user)
    current_user.level = current_user.xp // 100 + 1
    db.commit()

    return {"first_time": True, "xp_earned": xp_gain, "coins_earned": coin_gain, "bonus_earned": bonus_ok,
            "unlocked_achievement": req.lesson_id, "coins": current_user.coins, "xp": current_user.xp,
            "level": current_user.level, "message": "¡Nivel superado!"}
