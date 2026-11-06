const host = window.location.hostname || "localhost";
const BASE_URL = `http://${host}:8000/api/v1`;

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
    // Si falla por IP, intenta como respaldo directo a localhost:8000
    if (host !== "localhost" && host !== "127.0.0.1") {
      try {
        const fallbackRes = await fetch(`http://localhost:8000/api/v1${endpoint}`, { ...options, headers });
        if (fallbackRes.ok) return fallbackRes.json();
      } catch {
        // Ignorar y arrojar el error original
      }
    }

    if (err.message === "Failed to fetch") {
      throw new Error(`No se pudo conectar a ${BASE_URL}. ¿Está Uvicorn corriendo con --host 0.0.0.0?`);
    }
    throw err;
  }
};