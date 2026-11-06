"""Pruebas del backend. Usan SQLite en memoria (la lógica SQL es portable); en producción se usa PostgreSQL."""
import os, json
from datetime import datetime, timedelta, timezone
os.environ["DATABASE_URL"] = "sqlite:///./test_jdab.db"
os.environ["SECRET_KEY"] = "test-secret"

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text

from app.core.database import Base, engine
from app.main import app
from app.core.migrations import run_startup_migrations
from app.api.lessons import LESSONS

@pytest.fixture()
def client():
    with engine.begin() as c:
        for t in ("user_inventory", "user_mission_progress", "user_unlocked_achievements"):
            c.execute(text(f"DROP TABLE IF EXISTS {t}"))
    Base.metadata.drop_all(engine); Base.metadata.create_all(engine)
    run_startup_migrations(engine)  # las mismas migraciones que usa el servidor real
    return TestClient(app)

def make_user(client, name="alumno1"):
    assert client.post("/api/v1/auth/register", json={"username": name, "password": "secreto1"}).status_code == 201
    tok = client.post("/api/v1/auth/login", json={"username": name, "password": "secreto1"}).json()["access_token"]
    return {"Authorization": f"Bearer {tok}"}

def sql(q, **p):
    with engine.begin() as c: return c.execute(text(q), p)

def me(client, h): return client.get("/api/v1/auth/me", headers=h).json()

# ---------- Misiones ----------
def test_mision_rechaza_codigo_incorrecto(client):
    h = make_user(client)
    r = client.post("/api/v1/lessons/complete", json={"lesson_id": "html_c1_l1", "submitted_code": "hola"}, headers=h)
    assert r.status_code == 400 and me(client, h)["coins"] == 50

def test_mision_ignora_recompensas_del_cliente(client):
    h = make_user(client)
    l = LESSONS["html_c1_l1"]
    code = " ".join(k for kws in l["main"] for k in kws)
    r = client.post("/api/v1/lessons/complete", json={"lesson_id": "html_c1_l1", "submitted_code": code, "xp_reward": 99999, "coin_reward": 99999}, headers=h)
    assert r.status_code == 200 and r.json()["first_time"] is True
    u = me(client, h)
    assert u["xp"] == l["xp"] and u["coins"] == 50 + l["coins"]          # NO 99999
    again = client.post("/api/v1/lessons/complete", json={"lesson_id": "html_c1_l1", "submitted_code": code}, headers=h).json()
    assert again["first_time"] is False and me(client, h)["coins"] == u["coins"]

def test_mision_bono_y_leccion_inexistente(client):
    h = make_user(client)
    l = LESSONS["html_c1_l1"]
    code = " ".join(k for kws in l["main"] + [l["bonus"]["keywords"]] for k in kws)
    r = client.post("/api/v1/lessons/complete", json={"lesson_id": "html_c1_l1", "submitted_code": code}, headers=h).json()
    assert r["bonus_earned"] and r["coins_earned"] == l["coins"] + l["bonus"]["coins"]
    assert client.post("/api/v1/lessons/complete", json={"lesson_id": "inventada", "submitted_code": "x"}, headers=h).status_code == 404

# ---------- Tienda ----------
def test_tienda_precio_lo_decide_el_servidor(client):
    h = make_user(client)
    r = client.post("/api/v1/shop/buy", json={"category": "skin", "code": "tanjiro_style", "price": 0}, headers=h)
    assert r.status_code == 400 and "insuficientes" in r.json()["detail"]
    r = client.post("/api/v1/shop/buy", json={"category": "skin", "code": "tanjiro_style", "price": -99999}, headers=h)
    assert r.status_code == 400 and me(client, h)["coins"] == 50

def test_tienda_compra_equipa_y_valida(client):
    h = make_user(client)
    uid = me(client, h)["id"]; sql("UPDATE users SET coins = 3000 WHERE id = :i", i=uid)
    assert client.post("/api/v1/shop/equip", json={"category": "skin", "code": "witch_purple"}, headers=h).status_code == 403
    assert client.post("/api/v1/shop/buy", json={"category": "skin", "code": "witch_purple"}, headers=h).json()["remaining_coins"] == 800
    assert client.post("/api/v1/shop/buy", json={"category": "skin", "code": "witch_purple"}, headers=h).status_code == 400
    assert client.post("/api/v1/shop/equip", json={"category": "skin", "code": "witch_purple"}, headers=h).status_code == 200
    assert me(client, h)["equipped_skin"] == "witch_purple"
    assert client.post("/api/v1/shop/buy", json={"category": "skin", "code": "no_existe"}, headers=h).status_code == 404
    assert client.post("/api/v1/shop/buy-and-equip", json={"category": "pet_color", "code": "pet_blue"}, headers=h).status_code == 400  # 800 < 5000
    sql("UPDATE users SET coins = 6000 WHERE id = :i", i=uid)
    assert client.post("/api/v1/shop/buy-and-equip", json={"category": "pet_color", "code": "pet_blue"}, headers=h).status_code == 200
    u = me(client, h); assert u["pet_color"] == "pet_blue" and u["coins"] == 1000

def test_tienda_no_permite_saldo_negativo(client):
    h = make_user(client); uid = me(client, h)["id"]; sql("UPDATE users SET coins = 4499 WHERE id = :i", i=uid)
    assert client.post("/api/v1/shop/buy", json={"category": "skin", "code": "grim_reaper"}, headers=h).status_code == 400
    assert me(client, h)["coins"] == 4499

# ---------- Racha ----------
def test_racha_suma_al_dia_siguiente_y_no_repite_el_mismo_dia(client):
    make_user(client, "racha1")                       # el registro hace login una vez
    uid = sql("SELECT id FROM users WHERE username='racha1'").scalar()
    login = lambda: client.post("/api/v1/auth/login", json={"username": "racha1", "password": "secreto1"})
    login(); assert sql("SELECT streak_days FROM users WHERE id=:i", i=uid).scalar() == 1   # mismo día: no cambia
    sql("UPDATE users SET last_login_date = :d WHERE id=:i", d=datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(days=1), i=uid)
    login(); assert sql("SELECT streak_days FROM users WHERE id=:i", i=uid).scalar() == 2
    sql("UPDATE users SET last_login_date = :d WHERE id=:i", d=datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(days=3), i=uid)
    login(); assert sql("SELECT streak_days FROM users WHERE id=:i", i=uid).scalar() == 1   # se rompe

# ---------- Perfil y ranking ----------
def test_bio_y_ranking_por_modulo(client):
    h = make_user(client)
    assert client.patch("/api/v1/profile/bio", json={"bio_signature": "Código y fuego"}, headers=h).status_code == 200
    assert client.get("/api/v1/profile/me", headers=h).json()["bio_signature"] == "Código y fuego"
    l = LESSONS["html_c1_l1"]; code = " ".join(k for kws in l["main"] for k in kws)
    client.post("/api/v1/lessons/complete", json={"lesson_id": "html_c1_l1", "submitted_code": code}, headers=h)
    top = client.get("/api/v1/ranking/?category=html").json()
    assert top[0]["score_value"] == 1 and top[0]["achievements_count"] == 1
    assert client.get("/api/v1/ranking/?category=python").json()[0]["score_value"] == 0
    assert client.get("/api/v1/ranking/?category=global").status_code == 200

def test_endpoints_protegidos(client):
    assert client.post("/api/v1/lessons/complete", json={"lesson_id": "html_c1_l1"}).status_code == 401
    assert client.post("/api/v1/shop/buy", json={"category": "skin", "code": "red_oni"}).status_code == 401
