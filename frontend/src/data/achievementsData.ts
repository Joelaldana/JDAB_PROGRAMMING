export interface GameAchievement {
  id: string;
  title: string;
  tier: 'purple' | 'gold' | 'red'; // Púrpura (Normal), Dorado (Jefe de Capítulo), Rojo (Jefe Final Mítico)
  desc: string;
  requirement: string;
  category: 'HTML' | 'CSS' | 'Python' | 'Racha';
  icon: string;
}

export const MASTER_ACHIEVEMENTS: Record<string, GameAchievement> = {
  // ==========================================
  // HTML: LA CIUDAD PERDIDA (6 JEFES Y HITOS)
  // ==========================================
  'html_c1_l1': { id: 'html_c1_l1', title: 'PRIMER CONTACTO', tier: 'purple', desc: 'Reactivó el terminal principal de la ciudad digital.', requirement: 'HTML Nivel 1', category: 'HTML', icon: '⚡' },
  'html_boss_c1': { id: 'html_boss_c1', title: 'LLAVE DE LA CIUDAD', tier: 'gold', desc: 'Derrotó al Jefe 1 y abrió la Puerta de Acceso.', requirement: 'Vence al Jefe Nivel 5 de HTML', category: 'HTML', icon: '🗝️' },
  'html_boss_c2': { id: 'html_boss_c2', title: 'DISTRITO COMERCIAL', tier: 'gold', desc: 'Estructuró los edificios y comercios con multimedia y listas.', requirement: 'Vence al Jefe Nivel 10 de HTML', category: 'HTML', icon: '🏛️' },
  'html_boss_c3': { id: 'html_boss_c3', title: 'CENTRO DE COMUNICACIONES', tier: 'gold', desc: 'Conectó la ciudad con tablas de energía y formularios de reporte.', requirement: 'Vence al Jefe Nivel 15 de HTML', category: 'HTML', icon: '📡' },
  'html_boss_c4': { id: 'html_boss_c4', title: 'SISTEMA DE REGISTRO', tier: 'gold', desc: 'Implementó el padrón ciudadano accesible e indestructible.', requirement: 'Vence al Jefe Nivel 20 de HTML', category: 'HTML', icon: '📋' },
  'html_boss_c5': { id: 'html_boss_c5', title: 'ARCHIVO SEMÁNTICO', tier: 'gold', desc: 'Restauró el núcleo de conocimiento con semántica estricta.', requirement: 'Vence al Jefe Nivel 25 de HTML', category: 'HTML', icon: '🏛️' },
  'html_boss_c6': { id: 'html_boss_c6', title: 'ARQUITECTO HTML SUPREMO', tier: 'red', desc: '¡JEFE FINAL SUPERADO! Reconstruyó la ciudad digital completa.', requirement: 'Vence al Jefe Final Nivel 30 de HTML', category: 'HTML', icon: '👑' },

  // ==========================================
  // CSS: LA DIMENSIÓN DEL DISEÑO (6 JEFES Y HITOS)
  // ==========================================
  'css_c1_l1': { id: 'css_c1_l1', title: 'PRIMER PIGMENTO', tier: 'purple', desc: 'Invocó el primer color sobre el mundo en escala de grises.', requirement: 'CSS Nivel 1', category: 'CSS', icon: '🎨' },
  'css_boss_c1': { id: 'css_boss_c1', title: 'RESTAURADOR DEL FARO', tier: 'gold', desc: 'Devolvió el brillo y contraste al gran faro dimensional.', requirement: 'Vence al Jefe Nivel 5 de CSS', category: 'CSS', icon: '🗼' },
  'css_boss_c2': { id: 'css_boss_c2', title: 'MAESTRO DE ARMADURAS', tier: 'gold', desc: 'Forjó tarjetas con bordes redondeados, sombras y box model.', requirement: 'Vence al Jefe Nivel 10 de CSS', category: 'CSS', icon: '🛡️' },
  'css_boss_c3': { id: 'css_boss_c3', title: 'FORMACIÓN PERFECTA', tier: 'gold', desc: 'Dominó Flexbox alineando escuadrones y barras de navegación.', requirement: 'Vence al Jefe Nivel 15 de CSS', category: 'CSS', icon: '📐' },
  'css_boss_c4': { id: 'css_boss_c4', title: 'ARQUITECTO ESPACIAL', tier: 'gold', desc: 'Dominó CSS Grid y transformaciones de energía en múltiples ejes.', requirement: 'Vence al Jefe Nivel 20 de CSS', category: 'CSS', icon: '🌌' },
  'css_boss_c5': { id: 'css_boss_c5', title: 'PORTAL ADAPTABLE', tier: 'gold', desc: 'Creó interfaces responsive aptas para pantallas móviles y PC.', requirement: 'Vence al Jefe Nivel 25 de CSS', category: 'CSS', icon: '📱' },
  'css_boss_c6': { id: 'css_boss_c6', title: 'MAESTRO CSS SUPREMO', tier: 'red', desc: '¡JEFE FINAL SUPERADO! Devolvió vida y animación a la dimensión.', requirement: 'Vence al Jefe Final Nivel 30 de CSS', category: 'CSS', icon: '👑' },

  // ==========================================
  // PYTHON: LA GUERRA DE LAS MÁQUINAS (6 JEFES Y HITOS)
  // ==========================================
  'py_c1_l1': { id: 'py_c1_l1', title: 'CHISPA DE ENERGÍA', tier: 'purple', desc: 'Emitió la primera orden con print() para despertar al robot.', requirement: 'Python Nivel 1', category: 'Python', icon: '⚡' },
  'py_boss_c1': { id: 'py_boss_c1', title: 'ACTIVACIÓN COMPLETA', tier: 'gold', desc: 'Programó el diagnóstico inicial con variables y operadores.', requirement: 'Vence al Jefe Nivel 5 de Python', category: 'Python', icon: '🤖' },
  'py_boss_c2': { id: 'py_boss_c2', title: 'PUERTA DE SEGURIDAD', tier: 'gold', desc: 'Venció los sensores hostiles con condicionales if, elif y else.', requirement: 'Vence al Jefe Nivel 10 de Python', category: 'Python', icon: '🚪' },
  'py_boss_c3': { id: 'py_boss_c3', title: 'RUTA DE PATRULLA', tier: 'gold', desc: 'Programó bucles for y while evitando trampas infinitas.', requirement: 'Vence al Jefe Nivel 15 de Python', category: 'Python', icon: '🔄' },
  'py_boss_c4': { id: 'py_boss_c4', title: 'CONTROL MODULAR', tier: 'gold', desc: 'Estructuró el cerebro del robot con funciones def y retornos.', requirement: 'Vence al Jefe Nivel 20 de Python', category: 'Python', icon: '🧩' },
  'py_boss_c5': { id: 'py_boss_c5', title: 'INVENTARIO INTELIGENTE', tier: 'gold', desc: 'Gestionó listas y diccionarios de máquinas en la arena.', requirement: 'Vence al Jefe Nivel 25 de Python', category: 'Python', icon: '🎒' },
  'py_boss_c6': { id: 'py_boss_c6', title: 'COMANDANTE PYTHON SUPREMO', tier: 'red', desc: '¡JEFE FINAL SUPERADO! Desactivó la red hostil y liberó la arena.', requirement: 'Vence al Jefe Final Nivel 30 de Python', category: 'Python', icon: '👑' },

  // RACHA
  'streak_starter': { id: 'streak_starter', title: 'VÍNCULO ÍGNEO', tier: 'purple', desc: 'Mantuvo a su mascota Ignis activa con racha diaria.', requirement: 'Inicia sesión 3 días seguidos', category: 'Racha', icon: '🔥' }
};