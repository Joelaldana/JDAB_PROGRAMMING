# Cambios (rediseño)
- Corregido: el proyecto no compilaba (4 errores TS), postcss.config.js estaba vacío (dependía del CDN de Tailwind), la pestaña Inventario no se mostraba, faltaba <main> en el layout, ProfileSection ignoraba props.
- Nuevo: Qbit.tsx (personaje vectorial, 11 skins + 5 auras), Pet.tsx (mascota con 4 evoluciones), TopHud.tsx.
- Rediseñados: Sidebar, App (login + layout), LearningSection (mapa de niveles, pistas, vista previa segura, confeti), StreakPetSection, ProfileSection, AvatarShowcase.
- Eliminados (código muerto que rompía el build): LessonPlayer, PadletBoard, ShopInventory, Navbar.
- Ejecutar: ver README.md

## Backend
- SEGURIDAD: /lessons/complete valida el código en el servidor y usa recompensas oficiales (antes el navegador decidía monedas/XP). /shop/buy usa el precio del catálogo del servidor (antes se podía comprar gratis o con precio negativo). Compra atómica (sin saldo negativo ni doble compra).
- La contraseña real de PostgreSQL estaba escrita en config.py y en backend/.venv: eliminada. CAMBIA esa contraseña. Usa backend/.env (ver .env.example).
- docker-compose: URL con +psycopg (antes el backend no arrancaba), SECRET_KEY y clave de BD por variables.
- Migraciones automáticas al arrancar (antes había que correr migrate_db.py a mano; una BD nueva fallaba en /profile y /lessons).
- Racha por zona horaria America/Bogota (antes UTC: entrar después de las 7 p. m. rompía la racha). Logro "streak_starter" ahora se otorga.
- Ranking por módulo (python/html/css) consultaba tablas vacías: corregido. Logros reales en vez de los equipados.
- Nuevos endpoints: PATCH /profile/bio, POST /shop/buy-and-equip (el inventario lo llamaba y no existía), colores de mascota en el catálogo.
- Pruebas: cd backend && pip install -r requirements-dev.txt && pytest

## 31 niveles nuevos + mejoras de juego
- CSS niveles 17-19, 21-24, 26-29 (11) y Python niveles 6-9, 11-14, 16-19, 21-24, 26-29 (20): ahora 90 niveles (30 por ruta).
- Comprobación tolerante (espacios, mayúsculas, comillas) en navegador y servidor.
- Python real en el navegador (Pyodide): if/for/while/def/listas, errores con línea, corte de bucles infinitos.
- Vista previa CSS con escena de práctica (.escena, .item, .boton, h1, p).
- Modo SQLite sin instalar PostgreSQL + INICIAR_WINDOWS.bat / iniciar.sh + README completo.
- Pruebas: 16 (backend) incl. resolubilidad de los 90 niveles.
