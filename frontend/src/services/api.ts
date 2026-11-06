const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

// En tu PC usa localhost, en Vercel/Internet usa Render con /api/v1
const BASE_URL = isLocal
  ? `http://${window.location.hostname}:8000/api/v1`
  : "https://jdab-backend.onrender.com/api/v1";

export const getAuthToken = () => localStorage.getItem("jdab_token");

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || "Error en el servidor de JDAB.");
    }
    return res.json();
  } catch (err: any) {
    if (err.message === "Failed to fetch") {
      throw new Error(
        "El servidor gratuito en la nube está despertando (tarda ~30 segundos la primera vez). Por favor espera un momento y vuelve a intentar."
      );
    }
    throw err;
  }
};