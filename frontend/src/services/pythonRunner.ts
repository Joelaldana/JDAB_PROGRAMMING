/**
 * Ejecuta el código Python del alumno con Python real (Pyodide/WebAssembly) dentro del navegador.
 * Se descarga una sola vez (~10 MB) la primera vez que se abre un nivel de Python y requiere internet.
 * Si no hay conexión, LearningSection usa una consola simulada de respaldo.
 */
declare global { interface Window { loadPyodide?: (o: { indexURL: string }) => Promise<any> } }

const VERSION = '0.26.4';
const BASE = `https://cdn.jsdelivr.net/pyodide/v${VERSION}/full/`;

export const HARNESS_PY = String.raw`
import sys, io, builtins
_MAX_LINES = 300000

def _no_input(*a, **k):
    raise RuntimeError("input() no está disponible en esta consola")

def _friendly(e):
    if isinstance(e, SyntaxError):
        return "Error de sintaxis (línea %s): %s" % (e.lineno, e.msg)
    line = None
    tb = e.__traceback__
    while tb is not None:
        if tb.tb_frame.f_code.co_filename == "<jdab>":
            line = tb.tb_lineno
        tb = tb.tb_next
    where = " (línea %d)" % line if line else ""
    return "%s%s: %s" % (type(e).__name__, where, e)

def __jdab_run(src):
    buf = io.StringIO()
    old_out, old_input = sys.stdout, builtins.input
    sys.stdout = buf
    builtins.input = _no_input
    counter = [0]
    def tracer(frame, event, arg):
        if frame.f_code.co_filename != "<jdab>":
            return None
        if event == "line":
            counter[0] += 1
            if counter[0] > _MAX_LINES:
                raise TimeoutError("Tu programa tardó demasiado: ¿hay un bucle infinito?")
        return tracer
    err = None
    try:
        code = compile(src, "<jdab>", "exec")
        sys.settrace(tracer)
        exec(code, {"__name__": "__main__"})
    except BaseException as e:
        err = _friendly(e)
    finally:
        sys.settrace(None)
        sys.stdout, builtins.input = old_out, old_input
    return (buf.getvalue(), err)
`;

let pyodidePromise: Promise<any> | null = null;

export const loadPython = (): Promise<any> => {
  if (!pyodidePromise) {
    pyodidePromise = new Promise((resolve, reject) => {
      const init = async () => {
        try {
          const py = await window.loadPyodide!({ indexURL: BASE });
          py.runPython(HARNESS_PY);
          resolve(py);
        } catch (e) { reject(e); }
      };
      if (window.loadPyodide) { init(); return; }
      const s = document.createElement('script');
      s.src = BASE + 'pyodide.js';
      s.onload = init;
      s.onerror = () => reject(new Error('sin conexión'));
      document.head.appendChild(s);
    });
    pyodidePromise.catch(() => { pyodidePromise = null; });
  }
  return pyodidePromise;
};

export const runPython = async (code: string): Promise<{ output: string; error: string | null }> => {
  const py = await loadPython();
  const fn = py.globals.get('__jdab_run');
  const res = fn(code);
  const [output, error] = res.toJs();
  res.destroy?.(); fn.destroy?.();
  return { output, error };
};
