import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Enum, CheckConstraint, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base

class UserRole(str, enum.Enum):
    STUDENT = "student"
    INSTRUCTOR = "instructor"
    ADMIN = "admin"

class ItemType(str, enum.Enum):
    AVATAR = "avatar"
    SKIN = "skin"
    FRAME = "frame"
    BACKGROUND = "background"

class CardType(str, enum.Enum):
    PROJECT = "project"
    ACHIEVEMENT = "achievement"
    NOTE = "note"
    CHALLENGE = "challenge"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.STUDENT, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Gamificación
    coins = Column(Integer, default=50, nullable=False)
    xp = Column(Integer, default=0, nullable=False)
    level = Column(Integer, default=1, nullable=False)
    
    # Racha y Mascota
    streak_days = Column(Integer, default=1, nullable=False)
    last_login_date = Column(DateTime, default=datetime.utcnow)
    pet_name = Column(String(50), default="Ignis", nullable=False)

    # Personalización y Cosméticos
    equipped_avatar = Column(String(100), default="bot_novice")
    equipped_skin = Column(String(50), default="base_default")
    equipped_skin_id = Column(String(50), default="base_default")
    equipped_aura = Column(String(50), default="none")
    pet_color = Column(String(50), default="orange")
    equipped_achievements = Column(String(255), default="")
    bio_signature = Column(String(100), default="¡Aventurero de JDAB PROGRAMING!")
    likes_count = Column(Integer, default=0)

    # Tablas secundarias
    inventory = relationship("UserInventory", back_populates="user", cascade="all, delete-orphan")
    cards = relationship("PadletCard", back_populates="user", cascade="all, delete-orphan")
    progress = relationship("UserProgress", back_populates="user", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint("coins >= 0", name="check_positive_coins"),
        CheckConstraint("xp >= 0", name="check_positive_xp"),
    )

class ShopItem(Base):
    __tablename__ = "shop_items"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    item_type = Column(Enum(ItemType), nullable=False)
    price = Column(Integer, default=0, nullable=False)
    required_level = Column(Integer, default=1, nullable=False)
    icon_url = Column(String(255), nullable=False)

class UserInventory(Base):
    __tablename__ = "user_inventory"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    item_type = Column(String(30), default="skin")
    item_code = Column(String(50), default="base_default")
    acquired_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="inventory")

    __table_args__ = (
        UniqueConstraint("user_id", "item_type", "item_code", name="uq_user_item_ownership"),
    )

class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    module = Column(String(50), nullable=False)
    title = Column(String(150), nullable=False)
    order = Column(Integer, default=1)
    description = Column(Text, nullable=False)
    starter_code = Column(Text, nullable=False)
    expected_type = Column(String(20), default="output")
    expected_solution = Column(Text, nullable=False)
    hint = Column(Text, nullable=True)
    xp_reward = Column(Integer, default=30)
    coin_reward = Column(Integer, default=15)

class UserProgress(Base):
    __tablename__ = "user_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=True)
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="progress")
    lesson = relationship("Lesson")

class PadletCard(Base):
    __tablename__ = "padlet_cards"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(100), nullable=False)
    content = Column(Text, nullable=False)
    card_type = Column(Enum(CardType), default=CardType.PROJECT)
    color = Column(String(20), default="purple")
    likes = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="cards")