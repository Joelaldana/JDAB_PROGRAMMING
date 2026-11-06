from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine, SessionLocal
from app.models.models import Lesson, ShopItem, ItemType
from app.api import auth, lessons, shop, padlet, ranking, profile
from app.core.migrations import run_startup_migrations

# Crear tablas y aplicar migraciones idempotentes
Base.metadata.create_all(bind=engine)
run_startup_migrations(engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Plataforma gamificada de programación para estudiantes"
)
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://jdabprogrammin.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuración CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_origin_regex=settings.CORS_ORIGIN_REGEX,
    allow_credentials=False,  # el token viaja en la cabecera Authorization, no en cookies
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registro de rutas modulares
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(lessons.router, prefix=settings.API_V1_STR)
app.include_router(shop.router, prefix=settings.API_V1_STR)
app.include_router(padlet.router, prefix=settings.API_V1_STR)
app.include_router(ranking.router, prefix=settings.API_V1_STR)
app.include_router(profile.router, prefix=settings.API_V1_STR)

@app.on_event("startup")
def seed_initial_data():
    """Siembra lecciones iniciales y artículos de la tienda si no existen."""
    db = SessionLocal()
    try:
        # Semilla de Tienda
        if db.query(ShopItem).count() == 0:
            items = [
                ShopItem(code="bot_cyber", name="Cyber Bot Skin", item_type=ItemType.AVATAR, price=30, required_level=1, icon_url="🤖", description="Un avatar futurista con circuitos de neón."),
                ShopItem(code="ninja_coder", name="Ninja Coder", item_type=ItemType.AVATAR, price=75, required_level=2, icon_url="🥷", description="Velocidad y sigilo para resolver algoritmos."),
                ShopItem(code="wizard_dev", name="Mago del Código", item_type=ItemType.AVATAR, price=150, required_level=3, icon_url="🧙‍♂️", description="Domina los hechizos más avanzados de Python."),
                ShopItem(code="frame_neon", name="Marco Neón Púrpura", item_type=ItemType.FRAME, price=40, required_level=1, icon_url="🔲", description="Borde resplandeciente para tu tarjeta."),
                ShopItem(code="frame_gold", name="Marco Campeón Dorado", item_type=ItemType.FRAME, price=100, required_level=2, icon_url="⭐", description="Reservado para programadores legendarios.")
            ]
            db.add_all(items)
            db.commit()

        # Semilla de Lecciones
        if db.query(Lesson).count() == 0:
            lessons_data = [
                Lesson(
                    module="python",
                    title="Misión 1: Hola Mundo Galáctico",
                    order=1,
                    description="Tu nave necesita enviar una señal a la Tierra. Usa la función print() para mostrar el mensaje: ¡Hola JDAB!",
                    starter_code='# Escribe tu código aquí\nprint("...")',
                    expected_type="output",
                    expected_solution="¡Hola JDAB!",
                    hint="Recuerda usar comillas dobles o simples dentro de los paréntesis: print(\"¡Hola JDAB!\")",
                    xp_reward=50,
                    coin_reward=25
                ),
                Lesson(
                    module="python",
                    title="Misión 2: Variables y Baterías de Energía",
                    order=2,
                    description="Crea una variable llamada energia con el valor 100 y luego imprímela.",
                    starter_code="# Declara la variable energia\n",
                    expected_type="contains",
                    expected_solution="energia = 100",
                    hint="Escribe: energia = 100 y abajo print(energia)",
                    xp_reward=60,
                    coin_reward=30
                ),
                Lesson(
                    module="html",
                    title="Misión 3: Tu Primer Título Web",
                    order=3,
                    description="Crea un título de primer nivel utilizando la etiqueta <h1> con el texto 'JDAB Academia'.",
                    starter_code="<!-- Añade tu etiqueta h1 aquí -->\n",
                    expected_type="contains",
                    expected_solution="<h1>JDAB Academia</h1>",
                    hint="Asegúrate de cerrar la etiqueta con </h1>",
                    xp_reward=45,
                    coin_reward=20
                )
            ]
            db.add_all(lessons_data)
            db.commit()
    finally:
        db.close()

@app.get("/")
def root():
    return {"status": "online", "system": "JDAB PROGRAMING API v1.0"}