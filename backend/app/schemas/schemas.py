from datetime import datetime
from pydantic import BaseModel, Field
from app.models.models import UserRole, ItemType, CardType

# Auth
class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=20, pattern=r"^[a-zA-Z0-9_-]+$")
    password: str = Field(..., min_length=6, max_length=64)

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    username: str
    role: str

# Usuario
class UserOut(BaseModel):
    id: int
    username: str
    role: UserRole
    coins: int
    xp: int
    level: int
    equipped_avatar: str
    equipped_skin: str = "default"
    equipped_aura: str = "none"
    pet_color: str = "orange"
    equipped_achievements: str = "first_code"
    bio_signature: str = "¡Aprendiendo código en JDAB!"
    likes_count: int = 0
    streak_days: int = 1
    pet_name: str = "Ignis"

    class Config:
        from_attributes = True

class EquipCosmeticRequest(BaseModel):
    category: str  # 'skin', 'aura', 'pet_color'
    code: str

class UpdatePetNameRequest(BaseModel):
    pet_name: str = Field(..., min_length=2, max_length=20)

# Tienda
class ShopItemOut(BaseModel):
    id: int
    code: str
    name: str
    description: str | None
    item_type: ItemType
    price: int
    required_level: int
    icon_url: str
    is_owned: bool = False
    is_equipped: bool = False

    class Config:
        from_attributes = True

class BuyItemRequest(BaseModel):
    item_id: int

class EquipItemRequest(BaseModel):
    item_code: str
    item_type: ItemType

# Lecciones y Ejercicios
class LessonOut(BaseModel):
    id: int
    module: str
    title: str
    order: int
    description: str
    starter_code: str
    hint: str | None
    xp_reward: int
    coin_reward: int
    is_completed: bool = False

    class Config:
        from_attributes = True

class SubmitSolution(BaseModel):
    lesson_id: int
    submitted_code: str

class EvaluationResult(BaseModel):
    success: bool
    feedback: str
    xp_gained: int = 0
    coins_gained: int = 0
    new_level: int | None = None

# Tablero Padlet
class PadletCardCreate(BaseModel):
    title: str = Field(..., max_length=80)
    content: str = Field(..., max_length=1000)
    card_type: CardType = CardType.PROJECT
    color: str = "purple"

class PadletCardOut(BaseModel):
    id: int
    user_id: int
    title: str
    content: str
    card_type: CardType
    color: str
    likes: int
    created_at: datetime
    author_name: str | None = None

    class Config:
        from_attributes = True