from datetime import datetime, timezone, timedelta
from sqlalchemy import text
from app.core.config import settings
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token
from app.models.models import User, UserRole
from app.schemas.schemas import UserRegister, UserLogin, Token, UserOut, UpdatePetNameRequest
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Autenticación"])

# 1. REGISTRO
@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.username == user_in.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ese nombre de usuario ya está en uso.")
    
    new_user = User(
        username=user_in.username,
        hashed_password=get_password_hash(user_in.password),
        role=UserRole.STUDENT,
        coins=50,
        xp=0,
        level=1,
        streak_days=1,
        pet_name="Ignis",
        equipped_skin="base_default",
        equipped_skin_id="base_default",
        equipped_aura="none",
        pet_color="orange"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Registrar artículos base en su inventario
    try:
        db.execute(text("INSERT INTO user_inventory (user_id, item_type, item_code) VALUES (:u, 'skin', 'base_default') ON CONFLICT DO NOTHING"), {"u": new_user.id})
        db.execute(text("INSERT INTO user_inventory (user_id, item_type, item_code) VALUES (:u, 'aura', 'none') ON CONFLICT DO NOTHING"), {"u": new_user.id})
        db.execute(text("INSERT INTO user_inventory (user_id, item_type, item_code) VALUES (:u, 'pet_color', 'orange') ON CONFLICT DO NOTHING"), {"u": new_user.id})
        db.commit()
    except Exception:
        db.rollback()

    return new_user

# 2. LOGIN (CON CÁLCULO SEGURO DE RACHA EN WINDOWS)
@router.post("/login", response_model=Token)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == user_in.username).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Usuario o contraseña incorrectos.")
    
    # Manejo seguro de fecha (compatible con Windows sin fallar por tzdata)
    now_utc = datetime.now(timezone.utc)
    try:
        from zoneinfo import ZoneInfo
        tz = ZoneInfo(settings.APP_TIMEZONE)
        today = now_utc.astimezone(tz).date()
    except Exception:
        today = now_utc.date()

    if user.last_login_date:
        last = user.last_login_date.date()
        diff_days = (today - last).days
        if diff_days == 1:
            user.streak_days = (user.streak_days or 1) + 1
            user.coins += 10
        elif diff_days > 1:
            user.streak_days = 1
    else:
        user.streak_days = 1

    user.last_login_date = now_utc.replace(tzinfo=None)
    db.commit()

    token = create_access_token(subject=user.id, role=user.role.value)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "username": user.username,
        "role": user.role.value
    }

# 3. PERFIL
@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# 4. NOMBRE DE MASCOTA
@router.patch("/pet-name", response_model=UserOut)
def update_pet_name(data: UpdatePetNameRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    current_user.pet_name = data.pet_name.strip()
    db.commit()
    db.refresh(current_user)
    return current_user