from app.core.database import engine
from sqlalchemy import text

print("Restableciendo personajes a la ropa básica y poniendo todo en venta...")

with engine.begin() as conn:
    # 1. Quitar cualquier skin o aura que no sea la básica gratuita
    conn.execute(text("UPDATE users SET equipped_skin = 'default', equipped_aura = 'none';"))
    
    # 2. Dejar en el inventario solo los artículos base gratuitos
    conn.execute(text("DELETE FROM user_inventory WHERE item_code NOT IN ('default', 'none', 'orange');"))

print("✅ ¡Éxito! Todos los personajes tienen el traje base y Tanjiro/Auras están a la venta en la tienda.")