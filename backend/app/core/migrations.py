"""Migraciones idempotentes que se ejecutan al arrancar en cualquier base de datos nueva o existente."""
from sqlalchemy import text

POSTGRES_STATEMENTS = [
    # 1. Columnas de personalización y perfil
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS equipped_skin VARCHAR(50) DEFAULT 'default';",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS equipped_skin_id VARCHAR(50) DEFAULT 'base_default';",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS equipped_aura VARCHAR(50) DEFAULT 'none';",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS pet_color VARCHAR(50) DEFAULT 'orange';",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS pet_name VARCHAR(50) DEFAULT 'Ignis';",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS equipped_achievements VARCHAR(200) DEFAULT '';",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS bio_signature VARCHAR(100) DEFAULT '¡Estudiante de JDAB PROGRAMING!';",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS streak_days INTEGER DEFAULT 1;",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;",

    # 2. Columnas modernas de inventario
    "ALTER TABLE user_inventory ADD COLUMN IF NOT EXISTS item_type VARCHAR(30);",
    "ALTER TABLE user_inventory ADD COLUMN IF NOT EXISTS item_code VARCHAR(50);",

    # 3. Quitar NOT NULL de item_id solo si dicha columna existiera en bases viejas
    """DO $$ BEGIN
         IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_inventory' AND column_name='item_id') THEN
           ALTER TABLE user_inventory ALTER COLUMN item_id DROP NOT NULL;
         END IF; END $$;""",

    # 4. Restricción única de posesión para evitar compras duplicadas
    """DO $$ BEGIN
         IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_user_item_ownership') THEN
           ALTER TABLE user_inventory ADD CONSTRAINT uq_user_item_ownership UNIQUE (user_id, item_type, item_code);
         END IF; END $$;""",

    # 5. Tabla de progreso de lecciones
    """CREATE TABLE IF NOT EXISTS user_mission_progress (
         id SERIAL PRIMARY KEY,
         user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
         lesson_id VARCHAR(50) NOT NULL,
         completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
         CONSTRAINT uq_user_lesson_progress UNIQUE (user_id, lesson_id));""",

    # 6. Tabla de logros desbloqueados
    """CREATE TABLE IF NOT EXISTS user_unlocked_achievements (
         id SERIAL PRIMARY KEY,
         user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
         achievement_id VARCHAR(50) NOT NULL,
         unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
         CONSTRAINT uq_user_achievement UNIQUE (user_id, achievement_id));""",
]

SQLITE_STATEMENTS = [
    """CREATE TABLE IF NOT EXISTS user_inventory (
         id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL,
         item_type VARCHAR(30), item_code VARCHAR(50), UNIQUE (user_id, item_type, item_code));""",
    """CREATE TABLE IF NOT EXISTS user_mission_progress (
         id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, lesson_id VARCHAR(50) NOT NULL,
         completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE (user_id, lesson_id));""",
    """CREATE TABLE IF NOT EXISTS user_unlocked_achievements (
         id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, achievement_id VARCHAR(50) NOT NULL,
         unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE (user_id, achievement_id));""",
]

def _sqlite_migrate(engine) -> None:
    with engine.begin() as conn:
        for stmt in SQLITE_STATEMENTS:
            conn.execute(text(stmt))

def run_startup_migrations(engine) -> None:
    if engine.dialect.name == "sqlite":
        return _sqlite_migrate(engine)
    if engine.dialect.name != "postgresql":
        return
    with engine.begin() as conn:
        for stmt in POSTGRES_STATEMENTS:
            conn.execute(text(stmt))