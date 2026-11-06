from sqlalchemy import text
from app.core.database import engine

print("Verificando y sincronizando base de datos para el sistema de capas de skins...")

with engine.begin() as conn:
    # 1. Añadir la columna equipped_skin_id en la tabla users si no existe
    conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS equipped_skin_id VARCHAR(50) DEFAULT 'base_default';"))

    # 2. Si había usuarios con 'default' o nulo, actualizarlos a 'base_default' (Qbit Clásico)
    conn.execute(text("UPDATE users SET equipped_skin_id = 'base_default' WHERE equipped_skin_id IS NULL OR equipped_skin_id = 'default';"))

    # 3. Asegurar las columnas de inventario
    conn.execute(text("ALTER TABLE user_inventory ADD COLUMN IF NOT EXISTS item_type VARCHAR(30);"))
    conn.execute(text("ALTER TABLE user_inventory ADD COLUMN IF NOT EXISTS item_code VARCHAR(50);"))

    # 4. Quitar la restricción NOT NULL de item_id antiguo si existía
    conn.execute(text("""
        DO $$ 
        BEGIN 
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_inventory' AND column_name='item_id') THEN
                ALTER TABLE user_inventory ALTER COLUMN item_id DROP NOT NULL;
            END IF;
        END $$;
    """))

    # 5. Crear la restricción única en user_inventory para evitar duplicados
    conn.execute(text("""
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_constraint WHERE conname = 'uq_user_item_ownership'
            ) THEN
                ALTER TABLE user_inventory ADD CONSTRAINT uq_user_item_ownership UNIQUE (user_id, item_type, item_code);
            END IF;
        END $$;
    """))

    # 6. Registrar la skin base 'base_default' en el inventario de todos los usuarios registrados
    conn.execute(text("""
        INSERT INTO user_inventory (user_id, item_type, item_code)
        SELECT id, 'skin', 'base_default' FROM users
        ON CONFLICT (user_id, item_type, item_code) DO NOTHING;
    """))

    # 7. Registrar el aura y color de mascota base
    conn.execute(text("""
        INSERT INTO user_inventory (user_id, item_type, item_code)
        SELECT id, 'aura', 'none' FROM users
        ON CONFLICT (user_id, item_type, item_code) DO NOTHING;
    """))
    conn.execute(text("""
        INSERT INTO user_inventory (user_id, item_type, item_code)
        SELECT id, 'pet_color', 'orange' FROM users
        ON CONFLICT (user_id, item_type, item_code) DO NOTHING;
    """))

    # 8. Asegurar tablas de progreso y logros
    conn.execute(text("""
        CREATE TABLE IF NOT EXISTS user_mission_progress (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            lesson_id VARCHAR(50) NOT NULL,
            completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT uq_user_lesson_progress UNIQUE (user_id, lesson_id)
        );
    """))
    conn.execute(text("""
        CREATE TABLE IF NOT EXISTS user_unlocked_achievements (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            achievement_id VARCHAR(50) NOT NULL,
            unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT uq_user_achievement UNIQUE (user_id, achievement_id)
        );
    """))

print("✅ ¡Éxito! Columna 'equipped_skin_id' e inventario sincronizados en PostgreSQL.")