import ast
import re

def evaluate_code_safely(module: str, code: str, expected_type: str, expected_solution: str) -> tuple[bool, str]:
    """
    Evalúa las soluciones sin recurrir a exec/eval inseguro.
    Utiliza análisis estático AST y patrones estructurados.
    """
    clean_code = code.strip()

    if module.lower() == "python":
        # 1. Comprobación sintáctica con AST
        try:
            tree = ast.parse(clean_code)
        except SyntaxError as e:
            return False, f"Error de sintaxis en la línea {e.lineno}: {e.msg}"

        # 2. Verificación determinista según la regla pedagógica
        if expected_type == "output":
            # Busca si el alumno invocó print con el contenido esperado
            calls_correct = False
            for node in ast.walk(tree):
                if isinstance(node, ast.Call) and getattr(node.func, "id", None) == "print":
                    for arg in node.args:
                        if isinstance(arg, ast.Constant) and str(arg.value).strip().lower() == expected_solution.strip().lower():
                            calls_correct = True
            
            if calls_correct:
                return True, "¡Excelente trabajo! Tu código Python imprimió exactamente el resultado esperado."
            return False, f"Pista: Asegúrate de imprimir exactamente: '{expected_solution}'"

        elif expected_type == "contains":
            if expected_solution.lower() in clean_code.lower():
                return True, "¡Desafío completado con éxito! Estructura verificada."
            return False, f"Tu código debe incluir la sentencia: '{expected_solution}'"

    elif module.lower() in ["html", "css"]:
        # Validación de etiquetas y propiedades
        clean_expected = expected_solution.strip().lower()
        if clean_expected in clean_code.lower():
            return True, "¡Código maquetado correctamente! Etiqueta detectada con precisión."
        return False, f"Revisa las etiquetas. Tu solución debe contener: '{expected_solution}'"

    return False, "Tipo de evaluación no soportada."