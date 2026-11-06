import React from 'react';

interface Props {
  stage: string;
  code: string;
  hasBonus: boolean;
}

export const CyberCityViewport: React.FC<Props> = ({ stage, code, hasBonus }) => {
  const cleanCode = code.toLowerCase();

  const hasDoctype = cleanCode.includes('<!doctype html>');
  const hasHtmlBody = (cleanCode.includes('<html>') || cleanCode.includes('</html>')) && (cleanCode.includes('<body>') || cleanCode.includes('</body>'));
  const hasH1 = cleanCode.includes('<h1>') && cleanCode.includes('</h1>');
  const hasH2 = cleanCode.includes('<h2>') && cleanCode.includes('</h2>');
  const hasP = cleanCode.includes('<p>') && cleanCode.includes('</p>');
  const hasStrong = cleanCode.includes('<strong>') && cleanCode.includes('</strong>');

  const h1Match = code.match(/<h1>(.*?)<\/h1>/i);
  const h1Text = h1Match ? h1Match[1] : '';

  const h2Match = code.match(/<h2>(.*?)<\/h2>/i);
  const h2Text = h2Match ? h2Match[1] : '';

  let bossLocksOpen = 0;
  if (hasDoctype) bossLocksOpen++;
  if (hasHtmlBody) bossLocksOpen++;
  if (hasH1) bossLocksOpen++;
  if (hasH2) bossLocksOpen++;
  if (hasStrong) bossLocksOpen++;

  return (
    <div className="relative w-full h-[280px] rounded-3xl bg-gradient-to-b from-[#06030F] via-[#0C061A] to-[#120824] border-2 border-indigo-900/60 overflow-hidden flex flex-col justify-between shadow-2xl select-none">
      
      {/* BARRA SUPERIOR DEL MONITOR */}
      <div className="bg-slate-950/90 px-4 py-2 border-b border-indigo-950/80 flex items-center justify-between text-xs font-mono z-30">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${bossLocksOpen >= 3 || hasDoctype || hasH1 ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500 animate-ping'}`} />
          <span className="text-slate-300 font-bold uppercase tracking-wider">
            {stage === 'boss_gate' ? 'COMPUERTA BLINDADA DEL JEFE' :
             stage === 'plaza' ? 'PLAZA CENTRAL DE LA CIUDAD' :
             stage === 'emergency' ? 'RED DE TRANSMISIÓN CIUDADANA' :
             stage === 'archive' ? 'BANCO CUÁNTICO DE ARCHIVO' :
             'SIMULADOR DE LA CIUDAD DIGITAL'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400">ESTADO:</span>
          <span className={`font-black ${bossLocksOpen >= 4 || (hasDoctype && hasH1) ? 'text-emerald-400' : 'text-amber-400'}`}>
            {stage === 'boss_gate' ? `${bossLocksOpen}/5 CERROJOS` : (hasDoctype || hasH1 ? '100% OPERATIVO' : 'SIN ENERGÍA')}
          </span>
        </div>
      </div>

      {/* ÁREA CENTRAL DINÁMICA */}
      <div className="relative flex-1 w-full flex items-center justify-center p-4">
        
        {stage === 'terminal' ? (
          <div className="w-full max-w-md h-full flex flex-col items-center justify-center relative">
            <svg viewBox="0 0 400 180" className="w-full h-full">
              <rect x="50" y="20" width="300" height="130" rx="12" fill={hasDoctype ? '#0B132B' : '#090514'} stroke={hasDoctype ? '#06B6D4' : '#374151'} strokeWidth="3" />
              <rect x="180" y="150" width="40" height="20" fill="#1F2937" />
              <rect x="150" y="170" width="100" height="8" rx="4" fill="#374151" />

              {!hasDoctype ? (
                <text x="200" y="85" textAnchor="middle" fill="#EF4444" fontSize="13" fontFamily="monospace" fontWeight="bold">
                  {"[SISTEMA APAGADO - ESCRIBE <!DOCTYPE html>]"}
                </text>
              ) : (
                <>
                  <text x="70" y="55" fill="#38BDF8" fontSize="12" fontFamily="monospace">
                    {"✔ Frecuencia <!DOCTYPE html> sintonizada"}
                  </text>
                  <text x="70" y="80" fill={hasHtmlBody ? '#4ADE80' : '#6B7280'} fontSize="12" fontFamily="monospace">
                    {hasHtmlBody ? "✔ Núcleo <html> y <body> vinculados" : "○ Esperando <html> y <body>..."}
                  </text>
                  <text x="70" y="105" fill="#FACC15" fontSize="12" fontFamily="monospace">
                    {hasHtmlBody ? "⚡ Energía: 100% OPERATIVO" : "⚡ Energía: 50% CARGANDO"}
                  </text>
                </>
              )}
            </svg>
          </div>
        ) : stage === 'plaza' ? (
          <div className="w-full max-w-md h-full flex flex-col items-center justify-center">
            <svg viewBox="0 0 400 180" className="w-full h-full">
              <rect x="195" y="120" width="10" height="55" fill="#4B5563" />
              <rect x="160" y="170" width="80" height="8" rx="3" fill="#1F2937" />
              <rect x="50" y="30" width="300" height="50" rx="10" fill={hasH1 ? '#1E103C' : '#0B0517'} stroke={hasH1 ? '#F43F5E' : '#374151'} strokeWidth="3" />
              <rect x="90" y="85" width="220" height="36" rx="8" fill={hasH2 ? '#0F172A' : '#0B0517'} stroke={hasH2 ? '#38BDF8' : '#374151'} strokeWidth="2.5" />
              <text x="200" y="60" textAnchor="middle" fill={hasH1 ? '#FDA4AF' : '#6B7280'} fontSize="14" fontWeight="bold">
                {hasH1 ? (h1Text || 'TÍTULO H1 ERIGIDO') : 'LETRERO H1 VACÍO'}
              </text>
              <text x="200" y="108" textAnchor="middle" fill={hasH2 ? '#BAE6FD' : '#6B7280'} fontSize="12" fontWeight="bold">
                {hasH2 ? (h2Text || 'SUBTÍTULO H2 ERIGIDO') : 'SUBTÍTULO H2 VACÍO'}
              </text>
            </svg>
          </div>
        ) : stage === 'emergency' ? (
          <div className="w-full max-w-md h-full flex flex-col items-center justify-center space-y-2">
            <div className={`w-full p-3 rounded-xl border transition-all ${
              hasP ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-200' : 'bg-slate-950/60 border-slate-800 text-slate-500'
            }`}>
              <div className="text-[10px] font-mono text-cyan-400 font-bold">{"AVISO PÁRRAFO 1 <p>:"}</div>
              <div className="text-xs font-medium truncate">{hasP ? 'Mensaje transmitido a los ciudadanos.' : '[Sin señal: redacta un párrafo <p>]'}</div>
            </div>
            <div className={`w-full p-3 rounded-xl border transition-all ${
              cleanCode.split('<p>').length > 2 ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-200' : 'bg-slate-950/60 border-slate-800 text-slate-500'
            }`}>
              <div className="text-[10px] font-mono text-cyan-400 font-bold">{"AVISO PÁRRAFO 2 <p>:"}</div>
              <div className="text-xs font-medium truncate">{cleanCode.split('<p>').length > 2 ? 'Segundo mensaje en bloque independiente.' : '[Esperando segundo párrafo <p>]'}</div>
            </div>
          </div>
        ) : stage === 'boss_gate' ? (
          <div className="w-full max-w-md h-full flex flex-col items-center justify-center relative">
            <svg viewBox="0 0 400 180" className="w-full h-full">
              <rect x="60" y="20" width="280" height="150" rx="8" fill="#180D2C" stroke="#4C1D95" strokeWidth="4" />
              <circle cx="100" cy="50" r="14" fill={hasDoctype ? '#10B981' : '#EF4444'} className={hasDoctype ? '' : 'animate-ping'} />
              <text x="100" y="54" textAnchor="middle" fill="#FFF" fontSize="10" fontWeight="bold">1</text>
              <circle cx="200" cy="50" r="14" fill={hasHtmlBody ? '#10B981' : '#EF4444'} />
              <text x="200" y="54" textAnchor="middle" fill="#FFF" fontSize="10" fontWeight="bold">2</text>
              <circle cx="300" cy="50" r="14" fill={hasH1 ? '#10B981' : '#EF4444'} />
              <text x="300" y="54" textAnchor="middle" fill="#FFF" fontSize="10" fontWeight="bold">3</text>
              <circle cx="150" cy="110" r="14" fill={hasH2 ? '#10B981' : '#EF4444'} />
              <text x="150" y="114" textAnchor="middle" fill="#FFF" fontSize="10" fontWeight="bold">4</text>
              <circle cx="250" cy="110" r="14" fill={hasStrong ? '#10B981' : '#EF4444'} />
              <text x="250" y="114" textAnchor="middle" fill="#FFF" fontSize="10" fontWeight="bold">5</text>
            </svg>
            <div className="absolute bottom-2 text-center text-xs font-black">
              {bossLocksOpen === 5 ? (
                <span className="text-emerald-400 animate-pulse">¡COMPUERTA ABIERTA! JEFE DERROTADO</span>
              ) : (
                <span className="text-amber-400">{bossLocksOpen} de 5 cerrojos desactivados</span>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-end justify-center relative">
            <svg viewBox="0 0 500 180" className="w-full h-full">
              <rect x="40" y="40" width="75" height="140" fill="#090514" stroke="#1E1338" strokeWidth="2" />
              <rect x="52" y="55" width="12" height="16" rx="2" fill={hasHtmlBody ? '#FDE047' : '#1A122E'} />
              <rect x="72" y="55" width="12" height="16" rx="2" fill={hasHtmlBody ? '#38BDF8' : '#1A122E'} />

              <rect x="385" y="50" width="80" height="130" fill="#090514" stroke="#1E1338" strokeWidth="2" />
              <rect x="398" y="70" width="14" height="18" rx="2" fill={hasHtmlBody ? '#38BDF8' : '#1A122E'} />
              <rect x="420" y="70" width="14" height="18" rx="2" fill={hasHtmlBody ? '#FDE047' : '#1A122E'} />

              <rect x="150" y="25" width="200" height="155" rx="4" fill="#110A24" stroke="#311B5E" strokeWidth="2" />
              <rect x="165" y="40" width="170" height="50" rx="8" fill={hasH1 ? '#1E103C' : '#070311'} stroke={hasH1 ? '#EC4899' : '#3F1528'} strokeWidth="3" />

              <line x1="0" y1="170" x2="500" y2="170" stroke={hasDoctype ? '#06B6D4' : '#1E1B4B'} strokeWidth="4" />
            </svg>
            <div className="absolute top-[52px] left-1/2 -translate-x-1/2 w-36 text-center pointer-events-none">
              <div className="text-xs font-black text-pink-300 truncate drop-shadow-[0_0_10px_#ec4899]">
                {h1Text || (hasDoctype ? 'RED ACTIVA' : '[SISTEMA OFFLINE]')}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* BARRA INFERIOR DE MISIÓN APARTE */}
      <div className="bg-slate-950/90 px-4 py-2 border-t border-indigo-950/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 font-bold">🪙 Misión Aparte:</span>
          <span className="text-slate-300">
            {hasBonus ? '¡Objetivo extra cumplido! (+Monedas aseguradas)' : 'Cumple el reto opcional para ganar más monedas'}
          </span>
        </div>
        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded ${
          hasBonus ? 'bg-amber-500 text-black font-extrabold' : 'bg-slate-800 text-slate-500'
        }`}>
          {hasBonus ? 'COMPLETO' : 'OPCIONAL'}
        </span>
      </div>

    </div>
  );
};