"""Verifica que los 90 niveles sean resolvibles y coherentes."""
import json, subprocess, sys
from pathlib import Path
from app.api.lessons import LESSONS, norm, _has_all

SOL_NEW = json.loads((Path(__file__).parent / "solutions_new.json").read_text(encoding="utf-8"))

def solution_for(lid):
    # Niveles nuevos: solución escrita a mano. Antiguos: se construye con sus palabras clave.
    return SOL_NEW.get(lid) or "\n".join(k for kws in LESSONS[lid]["main"] for k in kws)

def test_hay_90_niveles_30_por_ruta():
    from collections import Counter
    assert Counter(v["module"] for v in LESSONS.values()) == {"html": 30, "css": 30, "python": 30}

def test_todos_los_niveles_se_pueden_superar():
    for lid, l in LESSONS.items():
        code = norm(solution_for(lid))
        assert all(_has_all(code, kws) for kws in l["main"]), f"{lid} no se puede superar"

def test_los_bonos_se_pueden_conseguir_sin_romper_lo_principal():
    for lid in SOL_NEW:
        l = LESSONS[lid]
        code = norm(SOL_NEW[lid])
        assert _has_all(code, l["bonus"]["keywords"]), f"{lid}: la solución de referencia debe lograr el bono"

def test_codigo_vacio_o_irrelevante_no_supera_ningun_nivel():
    for lid, l in LESSONS.items():
        for junk in ("", "hola mundo", "x"):
            assert not all(_has_all(norm(junk), kws) for kws in l["main"]), f"{lid} se supera con '{junk}'"

def test_tolerancia_de_espacios_y_comillas():
    assert _has_all(norm("DISPLAY:grid;GRID-template-columns:2fr   1fr"), ["display: grid", "grid-template-columns: 2fr 1fr"])
    assert _has_all(norm("print('Hola')"), ['print("hola")'])

def test_soluciones_python_son_python_valido_y_producen_salida():
    for lid, code in SOL_NEW.items():
        if not lid.startswith("py_"):
            continue
        r = subprocess.run([sys.executable, "-c", code], capture_output=True, text=True, timeout=10)
        assert r.returncode == 0, f"{lid} falla: {r.stderr}"
        assert r.stdout.strip(), f"{lid} no imprime nada"

def test_soluciones_css_tienen_llaves_balanceadas():
    for lid, code in SOL_NEW.items():
        if lid.startswith("css_"):
            assert code.count("{") == code.count("}"), lid
