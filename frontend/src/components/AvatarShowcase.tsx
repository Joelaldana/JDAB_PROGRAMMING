import React from 'react';
import { Qbit, getOutfit } from './Qbit';
import { Pet } from './Pet';
import { getStage } from '../data/petData';

interface Props { skin?: string; aura?: string; petColor?: string; petName?: string; streak?: number; height?: string }

export const AvatarShowcase: React.FC<Props> = ({ skin = 'default', aura = 'none', petColor = 'orange', petName = 'Ignis', streak = 1, height = 'h-[400px]' }) => {
  const stage = getStage(streak);
  return (
    <div className={`relative w-full ${height} rounded-3xl overflow-hidden border border-purple-500/30 shadow-2xl select-none bg-gradient-to-b from-[#1b0b3a] via-[#0e0620] to-[#070311]`}>
      {/* Cielo con estrellas y luna */}
      <div className="absolute inset-0 opacity-70" style={{ backgroundImage: 'radial-gradient(1.5px 1.5px at 20% 30%,#fff,transparent),radial-gradient(1px 1px at 70% 20%,#c4b5fd,transparent),radial-gradient(1.5px 1.5px at 85% 55%,#fff,transparent),radial-gradient(1px 1px at 40% 15%,#fff,transparent),radial-gradient(1px 1px at 10% 65%,#a5b4fc,transparent)' }} />
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-indigo-400/20 blur-2xl" />
      <div className="absolute top-6 right-8 w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-amber-300 opacity-90 shadow-[0_0_30px_rgba(253,230,138,.6)]" />
      {/* Ciudad al fondo */}
      <svg viewBox="0 0 400 120" className="absolute bottom-16 w-full opacity-40" preserveAspectRatio="none">
        {[[10,60,34],[50,40,30],[88,70,26],[124,30,36],[170,56,30],[210,44,40],[258,64,28],[294,36,34],[336,58,30]].map(([x,y,w],i)=>(<g key={i}><rect x={x} y={y} width={w} height={120-y} fill="#1e1b4b"/><rect x={x+6} y={y+8} width="5" height="6" fill="#fde047" opacity=".7"/><rect x={x+w-12} y={y+20} width="5" height="6" fill="#38bdf8" opacity=".7"/></g>))}
      </svg>
      {/* Plataforma */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-72 h-14 rounded-[50%] bg-gradient-to-b from-indigo-500/50 to-indigo-950 border border-indigo-300/40 shadow-[0_0_40px_rgba(129,140,248,.5)]" />
      <div className="absolute bottom-[3.1rem] left-1/2 -translate-x-1/2 w-56 h-8 rounded-[50%] border border-cyan-300/50" />

      <div className="relative z-10 h-full flex items-end justify-center gap-2 pb-14">
        <Qbit skinId={skin} auraId={aura} size="xl" />
        <div className="mb-6 flex flex-col items-center -ml-4">
          <Pet stage={stage.level} color={petColor} className="w-24 h-28" />
          <span className="mt-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-200">{petName}</span>
        </div>
      </div>
      <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[11px] font-black text-white bg-slate-950/80 px-4 py-1 rounded-full border border-purple-400/40 tracking-wider">
        {getOutfit(skin).name}
      </span>
    </div>
  );
};
