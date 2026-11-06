import React, { useId } from 'react';
import { getPalette } from '../data/petData';

interface Props {
  stage?: 1 | 2 | 3 | 4;
  color?: string;
  mood?: 'happy' | 'excited' | 'sleepy';
  className?: string;
  animate?: boolean;
}

/** Mascota de racha: espíritu de fuego con 4 evoluciones. */
export const Pet: React.FC<Props> = ({ stage = 1, color, mood = 'happy', className = 'w-40 h-44', animate = true }) => {
  const uid = useId().replace(/:/g, '');
  const p = getPalette(color);
  const scale = [0.82, 0.92, 1, 1.06][stage - 1];

  return (
    <svg viewBox="0 0 240 250" className={`${className} ${animate ? 'pet-hover' : ''} overflow-visible`} role="img" aria-label={`Mascota fase ${stage}`}>
      <defs>
        <radialGradient id={`b${uid}`} cx="50%" cy="70%" r="70%">
          <stop offset="0%" stopColor={p.light} /><stop offset="55%" stopColor={p.main} /><stop offset="100%" stopColor={p.shadow} />
        </radialGradient>
        <radialGradient id={`g${uid}`} cx="50%" cy="60%" r="60%">
          <stop offset="0%" stopColor={p.core} stopOpacity=".95" /><stop offset="100%" stopColor={p.light} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`h${uid}`}>
          <stop offset="0%" stopColor={p.main} stopOpacity=".55" /><stop offset="100%" stopColor={p.main} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`w${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={p.light} /><stop offset="100%" stopColor={p.main} stopOpacity=".15" />
        </linearGradient>
      </defs>

      {/* Halo de energía */}
      <circle cx="120" cy="140" r={70 + stage * 12} fill={`url(#h${uid})`} />

      {/* Rayos del Titán Solar */}
      {stage >= 4 && (
        <g className="spin-slow" style={{ transformOrigin: '120px 120px' }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <polygon key={i} points="120,6 126,34 114,34" fill="#FBBF24" opacity=".75" transform={`rotate(${i * 30} 120 120)`} />
          ))}
        </g>
      )}

      <g transform={`translate(${120 - 120 * scale} ${(1 - scale) * 230}) scale(${scale})`}>
        {/* Alas de fénix */}
        {stage >= 3 && (
          <>
            <path className="wing-l" d="M62 136 C 18 120 -2 80 8 44 C 30 62 52 84 74 106 Z" fill={`url(#w${uid})`} />
            <path className="wing-l" d="M66 150 C 28 150 6 128 0 104 C 26 108 50 120 70 134 Z" fill={`url(#w${uid})`} opacity=".8" />
            <path className="wing-r" d="M178 136 C 222 120 242 80 232 44 C 210 62 188 84 166 106 Z" fill={`url(#w${uid})`} />
            <path className="wing-r" d="M174 150 C 212 150 234 128 240 104 C 214 108 190 120 170 134 Z" fill={`url(#w${uid})`} opacity=".8" />
          </>
        )}

        {/* Lenguas de fuego laterales (fase 2+) */}
        {stage >= 2 && (
          <>
            <path className="flicker" d="M54 118 C 40 92 52 70 60 56 C 70 78 82 92 84 118 Z" fill={p.main} opacity=".9" />
            <path className="flicker" d="M186 118 C 200 92 188 70 180 56 C 170 78 158 92 156 118 Z" fill={p.main} opacity=".9" style={{ animationDelay: '.5s' }} />
          </>
        )}

        {/* Cuerpo */}
        <path className="flicker" d="M120 14 C 138 56 190 82 190 142 C 190 196 158 224 120 224 C 82 224 50 196 50 142 C 50 104 78 82 92 48 C 104 68 112 60 120 14 Z" fill={`url(#b${uid})`} />
        <path d="M120 54 C 136 88 170 106 170 148 C 170 186 148 206 120 206 C 92 206 70 186 70 148 C 70 118 92 100 120 54 Z" fill={`url(#g${uid})`} />
        <ellipse cx="96" cy="92" rx="9" ry="16" fill="#fff" opacity=".35" transform="rotate(-24 96 92)" />

        {/* Cara */}
        <g>
          {mood === 'sleepy' ? (
            <>
              <path d="M82 150 Q94 158 106 150" stroke="#451A03" strokeWidth="5" strokeLinecap="round" fill="none" />
              <path d="M134 150 Q146 158 158 150" stroke="#451A03" strokeWidth="5" strokeLinecap="round" fill="none" />
            </>
          ) : (
            <>
              <g className="blink"><ellipse cx="94" cy="148" rx="14" ry="19" fill="#fff" /><ellipse cx="97" cy="150" rx="10" ry="14" fill="#2B1304" /><circle cx="92" cy="143" r="5" fill="#fff" /><circle cx="100" cy="157" r="2.4" fill="#fff" /></g>
              <g className="blink"><ellipse cx="146" cy="148" rx="14" ry="19" fill="#fff" /><ellipse cx="143" cy="150" rx="10" ry="14" fill="#2B1304" /><circle cx="140" cy="143" r="5" fill="#fff" /><circle cx="148" cy="157" r="2.4" fill="#fff" /></g>
            </>
          )}
          <ellipse cx="76" cy="172" rx="9" ry="5.5" fill="#FB7185" opacity=".55" />
          <ellipse cx="164" cy="172" rx="9" ry="5.5" fill="#FB7185" opacity=".55" />
          {mood === 'excited'
            ? <path d="M106 172 Q120 192 134 172 Z" fill="#7C2D12" stroke="#7C2D12" strokeWidth="3" strokeLinejoin="round" />
            : mood === 'sleepy'
            ? <ellipse cx="120" cy="178" rx="5" ry="3.5" fill="#7C2D12" />
            : <path d="M108 172 Q120 186 132 172" stroke="#7C2D12" strokeWidth="5" strokeLinecap="round" fill="none" />}
        </g>

        {/* Patitas */}
        <ellipse cx="96" cy="226" rx="15" ry="8" fill={p.shadow} />
        <ellipse cx="144" cy="226" rx="15" ry="8" fill={p.shadow} />

        {/* Corona (fase 4) */}
        {stage >= 4 && (
          <g transform="translate(120 20)">
            <path d="M-26 6 L-20 -14 L-9 0 L0 -18 L9 0 L20 -14 L26 6 Z" fill="#FBBF24" stroke="#B45309" strokeWidth="2.5" strokeLinejoin="round" />
            <circle cx="0" cy="-2" r="3.5" fill="#EF4444" /><circle cx="-16" cy="1" r="2.5" fill="#38BDF8" /><circle cx="16" cy="1" r="2.5" fill="#38BDF8" />
          </g>
        )}
      </g>

      {/* Brasas flotantes */}
      {[[72, 70, 0], [168, 80, 0.9], [120, 44, 1.6], [58, 120, 2.1]].slice(0, stage + 1).map(([x, y, d], i) => (
        <circle key={i} className="ember" cx={x} cy={y} r={2.6 + (i % 2)} fill={p.light} style={{ animationDelay: `${d}s` }} />
      ))}
    </svg>
  );
};
