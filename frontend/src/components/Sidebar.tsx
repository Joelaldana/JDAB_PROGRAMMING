import React from 'react';
import { BookOpen, ShoppingBag, Trophy, Medal, User, Package, LogOut, Flame } from 'lucide-react';
import { Pet } from './Pet';
import { getStage } from '../data/petData';

export type TabType = 'aprendizaje' | 'racha' | 'tienda' | 'ranking' | 'logros' | 'perfil' | 'inventario';

interface Props {
  currentTab: TabType; onSelectTab: (t: TabType) => void; onLogout: () => void;
  streakDays?: number; petName?: string; petColor?: string; username?: string; level?: number;
}

const ITEMS: { id: TabType; label: string; icon: React.ReactNode; color: string }[] = [
  { id: 'aprendizaje', label: 'Aprender', icon: <BookOpen className="w-5 h-5" />, color: '#818CF8' },
  { id: 'racha', label: 'Racha', icon: <Flame className="w-5 h-5" />, color: '#FBBF24' },
  { id: 'tienda', label: 'Tienda', icon: <ShoppingBag className="w-5 h-5" />, color: '#C084FC' },
  { id: 'ranking', label: 'Ranking', icon: <Trophy className="w-5 h-5" />, color: '#34D399' },
  { id: 'logros', label: 'Logros', icon: <Medal className="w-5 h-5" />, color: '#F472B6' },
  { id: 'inventario', label: 'Inventario', icon: <Package className="w-5 h-5" />, color: '#38BDF8' },
  { id: 'perfil', label: 'Perfil', icon: <User className="w-5 h-5" />, color: '#FB923C' },
];

export const Sidebar: React.FC<Props> = ({ currentTab, onSelectTab, onLogout, streakDays = 1, petName = 'Bit', petColor, username, level = 1 }) => (
  <aside className="w-[76px] lg:w-64 shrink-0 sticky top-4 h-[calc(100vh-2rem)] glass rounded-3xl p-3 flex flex-col justify-between shadow-2xl shadow-black/60 select-none">
    <div className="space-y-1.5">
      <div className="flex items-center gap-3 px-1.5 py-2 mb-2 border-b border-slate-800/80">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-pink-500 flex items-center justify-center font-display font-bold text-white shadow-lg shadow-indigo-600/30">JD</div>
        <div className="hidden lg:block leading-tight"><div className="font-display text-base font-bold text-white tracking-wide">JDAB</div><div className="text-[10px] text-indigo-300 font-bold tracking-[.25em] uppercase">Programing</div></div>
      </div>

      {ITEMS.map(it => {
        const on = currentTab === it.id;
        return (
          <button key={it.id} onClick={() => onSelectTab(it.id)} title={it.label}
            className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-bold transition-all relative ${on ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            style={on ? { background: `${it.color}22`, boxShadow: `inset 0 0 0 1.5px ${it.color}66` } : undefined}>
            <span className="transition-transform group-hover:scale-110" style={{ color: on ? it.color : undefined }}>{it.icon}</span>
            <span className="hidden lg:inline">{it.label}</span>
            {it.id === 'racha' && (
              <span className="hidden lg:flex ml-auto items-center gap-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 px-2 py-0.5 rounded-full text-xs font-black"><Flame className="w-3 h-3 fill-amber-400" />{streakDays}</span>
            )}
          </button>
        );
      })}
    </div>

    <div className="space-y-2">
      <button onClick={() => onSelectTab('racha')} className="hidden lg:flex w-full items-center gap-3 p-2.5 rounded-2xl bg-slate-950/60 border border-amber-500/20 hover:border-amber-400/50 transition">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center"><Pet stage={getStage(streakDays).level} color={petColor} animate={false} className="w-10 h-11" /></div>
        <div className="text-left min-w-0"><div className="text-xs font-black text-white truncate">{petName}</div><div className="text-[10px] text-slate-400 truncate">{username} · Nv. {level}</div></div>
      </button>
      <button onClick={onLogout} title="Cerrar sesión" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-bold text-rose-400 hover:bg-rose-950/30 transition group">
        <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /><span className="hidden lg:inline">Cerrar sesión</span>
      </button>
    </div>
  </aside>
);
