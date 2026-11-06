import React, { useId } from 'react';

type Hat = 'cap' | 'witch' | 'straw' | 'crown' | 'ears' | 'bear' | 'horns' | 'hood' | 'none';
type Hair = 'short' | 'spiky' | 'long' | 'tanjiro' | 'none';

interface Outfit {
  name: string; skin: string; shirt: string; shirt2?: string; pants: string; shoes: string;
  hair: Hair; hairColor: string; hat: Hat; hatColor: string; hatColor2?: string;
  pattern?: 'stripe' | 'check' | 'wraps' | 'dress' | 'onesie'; backpack?: boolean; tail?: string; cape?: string;
}

const DEFAULT: Outfit = { name: 'Qbit Clásico', skin: '#E0B48C', shirt: '#FFFFFF', shirt2: '#E63946', pants: '#1F2128', shoes: '#E63946', hair: 'short', hairColor: '#3B2417', hat: 'cap', hatColor: '#0284C7', hatColor2: '#F59E0B', pattern: 'stripe', backpack: true };

export const OUTFITS: Record<string, Outfit> = {
  base_default: DEFAULT, default: DEFAULT,
  tanjiro_style: { name: 'Cazador de Demonios', skin: '#E0B48C', shirt: '#14532D', shirt2: '#0A0A0A', pants: '#111827', shoes: '#F5F5F4', hair: 'tanjiro', hairColor: '#3A1212', hat: 'none', hatColor: '#000', pattern: 'check' },
  witch_purple: { name: 'Bruja Mística', skin: '#E0B48C', shirt: '#581C87', shirt2: '#A855F7', pants: '#3B0764', shoes: '#1E1B4B', hair: 'long', hairColor: '#1E1B4B', hat: 'witch', hatColor: '#4C1D95', hatColor2: '#C084FC', pattern: 'dress' },
  witch_green: { name: 'Bruja del Bosque', skin: '#E0B48C', shirt: '#166534', shirt2: '#4ADE80', pants: '#14532D', shoes: '#422006', hair: 'long', hairColor: '#7C2D12', hat: 'witch', hatColor: '#15803D', hatColor2: '#BBF7D0', pattern: 'dress' },
  black_cat: { name: 'Gato Oscuro', skin: '#E0B48C', shirt: '#18181B', shirt2: '#3F3F46', pants: '#18181B', shoes: '#27272A', hair: 'short', hairColor: '#18181B', hat: 'ears', hatColor: '#18181B', hatColor2: '#F9A8D4', pattern: 'onesie', tail: '#18181B' },
  scarecrow: { name: 'Espantapájaros', skin: '#E0B48C', shirt: '#B45309', shirt2: '#2563EB', pants: '#2563EB', shoes: '#451A03', hair: 'spiky', hairColor: '#FACC15', hat: 'straw', hatColor: '#D4A24C', hatColor2: '#F59E0B', pattern: 'onesie' },
  mummy: { name: 'Momia Ancestral', skin: '#EADBC0', shirt: '#E7D9B8', shirt2: '#CDB98A', pants: '#E7D9B8', shoes: '#CDB98A', hair: 'none', hairColor: '#E7D9B8', hat: 'none', hatColor: '#E7D9B8', pattern: 'wraps' },
  grim_reaper: { name: 'Espectro Sombrío', skin: '#CBD5E1', shirt: '#0F172A', shirt2: '#334155', pants: '#0F172A', shoes: '#020617', hair: 'none', hairColor: '#000', hat: 'hood', hatColor: '#0B1020', hatColor2: '#7C3AED', pattern: 'dress', cape: '#0B1020' },
  red_oni: { name: 'Demonio Oni', skin: '#E5484D', shirt: '#7F1D1D', shirt2: '#FACC15', pants: '#FACC15', shoes: '#450A0A', hair: 'spiky', hairColor: '#111827', hat: 'horns', hatColor: '#FEF3C7', pattern: 'stripe' },
  princess_peach: { name: 'Princesa Real', skin: '#F2C9A5', shirt: '#F472B6', shirt2: '#FBCFE8', pants: '#F472B6', shoes: '#BE185D', hair: 'long', hairColor: '#FACC15', hat: 'crown', hatColor: '#FBBF24', hatColor2: '#38BDF8', pattern: 'dress' },
  brown_bear: { name: 'Oso de Peluche', skin: '#E0B48C', shirt: '#92400E', shirt2: '#D6A77A', pants: '#92400E', shoes: '#78350F', hair: 'none', hairColor: '#78350F', hat: 'bear', hatColor: '#92400E', hatColor2: '#D6A77A', pattern: 'onesie' },
};

export const getOutfit = (id?: string): Outfit => OUTFITS[id || 'default'] || DEFAULT;

const Aura: React.FC<{ id: string; uid: string }> = ({ id, uid }) => {
  if (id === 'aura_shock') return (
    <g className="idle-bob" filter={`url(#glow${uid})`}>
      <polygon points="80,6 92,40 120,18 114,56 150,52 128,86 156,110 122,118 138,150 104,140 108,176 84,152 60,176 58,142 22,154 40,120 6,108 34,86 12,52 46,56 40,18 68,40" fill="rgba(253,224,71,.22)" stroke="#FACC15" strokeWidth="2.5" strokeLinejoin="round" />
    </g>
  );
  if (id === 'aura_fire') return (
    <g filter={`url(#glow${uid})`}>
      {[20, 44, 80, 116, 140].map((x, i) => (
        <path key={i} className="flicker" style={{ animationDelay: `${i * 0.25}s` }} d={`M${x} 200 C ${x - 18} 160 ${x + 6} 140 ${x} 100 C ${x + 22} 130 ${x + 26} 170 ${x} 200 Z`} fill={i % 2 ? '#F97316' : '#EF4444'} opacity=".7" />
      ))}
    </g>
  );
  if (id === 'aura_cosmic') return (
    <g filter={`url(#glow${uid})`}>
      <ellipse className="spin-slow" cx="80" cy="130" rx="74" ry="26" fill="none" stroke="#818CF8" strokeWidth="2.5" strokeDasharray="6 5" />
      <ellipse className="spin-slow" cx="80" cy="130" rx="56" ry="74" fill="none" stroke="#C084FC" strokeWidth="1.8" strokeDasharray="3 6" style={{ animationDirection: 'reverse' }} />
      {[[20, 70], [140, 100], [30, 190], [132, 40], [80, 14]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.8" fill="#E0E7FF" />)}
    </g>
  );
  if (id === 'aura_wind') return (
    <g className="idle-bob" fill="none" stroke="#7DD3FC" strokeLinecap="round" strokeWidth="3" opacity=".8" filter={`url(#glow${uid})`}>
      <path d="M8 90 Q40 70 70 90 T130 80" /><path d="M20 140 Q60 120 90 142 T152 130" /><path d="M6 190 Q44 172 80 190 T140 182" />
    </g>
  );
  if (id === 'aura_sakura') return (
    <g>
      {[[24, 40], [128, 62], [40, 130], [124, 150], [70, 20], [100, 190], [22, 190]].map(([x, y], i) => (
        <ellipse key={i} className="ember" style={{ animationDelay: `${i * 0.35}s`, animationDuration: '3.6s' }} cx={x} cy={y} rx="5" ry="3" fill="#F9A8D4" transform={`rotate(${i * 40} ${x} ${y})`} />
      ))}
    </g>
  );
  return null;
};

const HatSVG: React.FC<{ o: Outfit }> = ({ o }) => {
  switch (o.hat) {
    case 'cap': return (<g>
      <path d="M44 74 Q44 34 80 34 Q108 34 116 56 L100 74 Z" fill={o.hatColor} />
      <path d="M100 74 L116 56 Q124 64 122 74 Z" fill={o.hatColor2} />
      <ellipse cx="60" cy="74" rx="40" ry="7" fill="#FBBF24" stroke="#B45309" strokeWidth="1.5" />
      <circle cx="68" cy="53" r="9" fill="#F97316" /><circle cx="65" cy="52" r="1.3" fill="#431407" /><circle cx="71" cy="52" r="1.3" fill="#431407" /><path d="M65 56 Q68 59 71 56" stroke="#431407" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <ellipse cx="80" cy="33" rx="5" ry="3" fill="#0369A1" /></g>);
    case 'witch': return (<g>
      <ellipse cx="80" cy="58" rx="50" ry="9" fill={o.hatColor} /><path d="M52 58 Q70 20 92 -14 Q96 24 108 58 Z" fill={o.hatColor} />
      <rect x="54" y="48" width="54" height="8" fill={o.hatColor2} /><path d="M92 -14 Q112 -8 108 8 Q100 -4 92 -4Z" fill={o.hatColor} /></g>);
    case 'straw': return (<g>
      <ellipse cx="80" cy="52" rx="52" ry="10" fill={o.hatColor} stroke="#92651F" strokeWidth="1.5" /><path d="M54 52 Q54 22 80 22 Q106 22 106 52 Z" fill={o.hatColor} stroke="#92651F" strokeWidth="1.5" />
      <rect x="54" y="42" width="52" height="7" fill="#7C2D12" /><g transform="translate(100 42)"><circle r="9" fill="#FDE047" /><circle r="4" fill="#78350F" /></g></g>);
    case 'crown': return (<g transform="translate(80 36)"><path d="M-26 8 L-22 -16 L-9 -2 L0 -20 L9 -2 L22 -16 L26 8 Z" fill={o.hatColor} stroke="#B45309" strokeWidth="2.5" strokeLinejoin="round" /><circle cy="-2" r="3.5" fill="#EF4444" /><circle cx="-15" cy="2" r="2.5" fill={o.hatColor2} /><circle cx="15" cy="2" r="2.5" fill={o.hatColor2} /></g>);
    case 'ears': return (<g><polygon points="46,52 50,20 74,42" fill={o.hatColor} /><polygon points="114,52 110,20 86,42" fill={o.hatColor} /><polygon points="52,44 54,30 66,40" fill={o.hatColor2} /><polygon points="108,44 106,30 94,40" fill={o.hatColor2} /></g>);
    case 'bear': return (<g><circle cx="50" cy="42" r="14" fill={o.hatColor} /><circle cx="110" cy="42" r="14" fill={o.hatColor} /><circle cx="50" cy="42" r="7" fill={o.hatColor2} /><circle cx="110" cy="42" r="7" fill={o.hatColor2} /></g>);
    case 'horns': return (<g><path d="M56 48 Q48 26 60 12 Q64 30 70 44Z" fill={o.hatColor} stroke="#D6C28F" strokeWidth="1.5" /><path d="M104 48 Q112 26 100 12 Q96 30 90 44Z" fill={o.hatColor} stroke="#D6C28F" strokeWidth="1.5" /></g>);
    case 'hood': return (<g><path d="M38 96 Q30 30 80 24 Q130 30 122 96 L108 92 Q114 52 80 50 Q46 52 52 92 Z" fill={o.hatColor} /><path d="M52 92 Q46 52 80 50 Q114 52 108 92" fill="none" stroke={o.hatColor2} strokeWidth="1.5" opacity=".6" /></g>);
    default: return null;
  }
};

const HairSVG: React.FC<{ o: Outfit; back?: boolean }> = ({ o, back }) => {
  const c = o.hairColor;
  if (o.hair === 'none') return null;
  if (back) return o.hair === 'long' ? <path d="M42 70 Q40 130 54 138 L106 138 Q120 130 118 70 Z" fill={c} /> : null;
  if (o.hair === 'long') return <path d="M44 74 Q42 36 80 36 Q118 36 116 74 Q104 58 80 56 Q56 58 44 74Z" fill={c} />;
  if (o.hair === 'spiky') return <path d="M44 72 L42 46 L56 54 L58 30 L72 46 L80 26 L90 46 L104 30 L106 54 L118 46 L116 72 Q100 56 80 56 Q60 56 44 72Z" fill={c} />;
  if (o.hair === 'tanjiro') return (<g><path d="M42 76 L40 44 L56 52 L60 28 L74 44 L84 24 L94 44 L108 30 L108 54 L120 44 L118 76 Q100 58 80 58 Q60 58 42 76Z" fill={c} /><path d="M66 44 Q58 56 60 64 Q70 58 72 48Z" fill="#B91C1C" /><path d="M70 62 L62 82" stroke="#B91C1C" strokeWidth="3" strokeLinecap="round" /></g>);
  return <path d="M44 74 Q46 38 80 38 Q114 38 116 74 Q104 54 80 54 Q56 54 44 74Z" fill={c} />;
};

interface Props { skinId?: string; auraId?: string; size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string; animate?: boolean; mood?: 'happy' | 'cheer' }

const SIZE = { sm: 'w-20 h-28', md: 'w-32 h-48', lg: 'w-44 h-64', xl: 'w-56 h-80' };

export const Qbit: React.FC<Props> = ({ skinId, auraId = 'none', size = 'lg', className = '', animate = true, mood = 'happy' }) => {
  const uid = useId().replace(/:/g, '');
  const o = getOutfit(skinId);
  const dark = o.hat === 'hood';
  const skinShade = o.skin;

  return (
    <svg viewBox="-10 -24 180 270" className={`${SIZE[size]} ${className} select-none overflow-visible`} role="img" aria-label={o.name}>
      <defs>
        <filter id={`glow${uid}`} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <filter id={`sh${uid}`}><feDropShadow dx="0" dy="6" stdDeviation="5" floodOpacity=".4" /></filter>
        <linearGradient id={`fl${uid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".16" /><stop offset="1" stopColor="#000" stopOpacity=".2" /></linearGradient>
      </defs>

      <Aura id={auraId} uid={uid} />
      <ellipse cx="80" cy="228" rx="42" ry="7" fill="#000" opacity=".35" />

      <g className={animate ? 'idle-bob' : ''} filter={`url(#sh${uid})`}>
        {o.cape && <path d="M46 114 L34 206 Q80 222 126 206 L114 114 Z" fill={o.cape} />}
        {o.backpack && (<g><rect x="36" y="112" width="26" height="52" rx="11" fill="#8C5332" stroke="#6D3D22" strokeWidth="2" /><path d="M40 120 Q49 111 58 120" stroke="#A76843" strokeWidth="3" fill="none" /></g>)}
        {o.tail && <path d="M104 190 Q146 186 140 150 Q138 176 106 178Z" fill={o.tail} />}

        {/* Piernas y calzado */}
        <rect x="58" y="168" width="18" height="36" rx="6" fill={o.pattern === 'dress' || o.pattern === 'onesie' || o.pattern === 'wraps' ? o.pants : skinShade} />
        <rect x="84" y="168" width="18" height="36" rx="6" fill={o.pattern === 'dress' || o.pattern === 'onesie' || o.pattern === 'wraps' ? o.pants : skinShade} />
        {o.pattern === 'stripe' && <><rect x="56" y="160" width="22" height="26" rx="5" fill={o.pants} /><rect x="82" y="160" width="22" height="26" rx="5" fill={o.pants} /></>}
        {o.pattern === 'check' && <><rect x="56" y="160" width="22" height="42" rx="5" fill={o.pants} /><rect x="82" y="160" width="22" height="42" rx="5" fill={o.pants} /></>}
        <rect x="54" y="200" width="26" height="14" rx="6" fill={o.shoes} /><rect x="80" y="200" width="26" height="14" rx="6" fill={o.shoes} />
        <rect x="54" y="209" width="26" height="5" rx="2.5" fill="#fff" opacity=".85" /><rect x="80" y="209" width="26" height="5" rx="2.5" fill="#fff" opacity=".85" />

        {/* Brazos */}
        <rect x="34" y="118" width="16" height="44" rx="8" fill={o.pattern === 'onesie' || o.pattern === 'wraps' || dark || o.pattern === 'check' ? o.shirt : skinShade} />
        <rect x="110" y="118" width="16" height="44" rx="8" fill={o.pattern === 'onesie' || o.pattern === 'wraps' || dark || o.pattern === 'check' ? o.shirt : skinShade} />
        <circle cx="42" cy="164" r="8" fill={skinShade} /><circle cx="118" cy="164" r="8" fill={skinShade} />

        {/* Torso */}
        {o.pattern === 'dress' ? (
          <path d="M50 112 Q80 104 110 112 L124 192 Q80 204 36 192 Z" fill={o.shirt} />
        ) : (
          <rect x="48" y="110" width="64" height="62" rx="12" fill={o.shirt} />
        )}
        {o.pattern === 'stripe' && <><rect x="48" y="130" width="64" height="10" fill={o.shirt2} /><rect x="48" y="140" width="64" height="8" fill="#18181B" /><polygon points="68,126 80,126 74,142" fill="#fff" stroke="#18181B" strokeWidth="1.5" /><polygon points="66,110 80,126 94,110" fill="#18181B" /></>}
        {o.pattern === 'check' && Array.from({ length: 4 }).flatMap((_, r) => Array.from({ length: 4 }).map((__, c) => (r + c) % 2 === 0 ? <rect key={`${r}${c}`} x={48 + c * 16} y={110 + r * 15.5} width="16" height="15.5" fill={o.shirt2} /> : null))}
        {o.pattern === 'wraps' && [118, 128, 138, 148, 158, 168].map((y, i) => <path key={y} d={`M48 ${y} L112 ${y + (i % 2 ? 4 : -2)}`} stroke={o.shirt2} strokeWidth="3" />)}
        {o.pattern === 'dress' && <path d="M52 150 Q80 158 108 150" stroke={o.shirt2} strokeWidth="5" fill="none" />}
        {o.pattern === 'onesie' && <ellipse cx="80" cy="146" rx="20" ry="18" fill={o.shirt2} opacity=".7" />}
        {o.hat === 'crown' && <circle cx="80" cy="130" r="5" fill="#38BDF8" />}
        <rect x="48" y="110" width="64" height="62" rx="12" fill={`url(#fl${uid})`} />

        {/* Cabeza */}
        <HairSVG o={o} back />
        <circle cx="80" cy="82" r="38" fill={o.skin} />
        <ellipse cx="80" cy="82" rx="38" ry="38" fill={`url(#fl${uid})`} opacity=".5" />
        <g className="blink"><ellipse cx="64" cy="86" rx="5" ry="8.5" fill="#101114" /><ellipse cx="96" cy="86" rx="5" ry="8.5" fill="#101114" /><circle cx="65.5" cy="82" r="2" fill="#fff" /><circle cx="97.5" cy="82" r="2" fill="#fff" /></g>
        <ellipse cx="53" cy="98" rx="6" ry="3.5" fill="#F87171" opacity=".45" /><ellipse cx="107" cy="98" rx="6" ry="3.5" fill="#F87171" opacity=".45" />
        {mood === 'cheer'
          ? <path d="M70 100 Q80 112 90 100 Z" fill="#7F1D1D" />
          : <path d="M72 101 Q80 108 88 101" stroke="#7C2D12" strokeWidth="3" strokeLinecap="round" fill="none" />}
        {o.pattern === 'wraps' && <><path d="M44 70 L116 62" stroke={o.shirt2} strokeWidth="5" /><path d="M42 80 L118 74" stroke={o.shirt} strokeWidth="5" /></>}
        {o.hat === 'ears' && <path d="M76 98 L80 102 L84 98 Z" fill="#F9A8D4" />}
        <HairSVG o={o} />
        <HatSVG o={o} />
      </g>
    </svg>
  );
};

export const SKIN_NAMES: Record<string, string> = Object.fromEntries(Object.entries(OUTFITS).map(([k, v]) => [k, v.name]));
