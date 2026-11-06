import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { apiFetch } from '../services/api';
import { MASTER_ACHIEVEMENTS } from '../data/achievementsData';
import { Medal, Lock, Sparkles, Check, ShieldCheck } from 'lucide-react';

interface Props {
  user: UserProfile;
  onUpdateUser: () => void;
}

export const AchievementsSection: React.FC<Props> = ({ user, onUpdateUser }) => {
  const [unlockedAchs, setUnlockedAchs] = useState<string[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'purple' | 'gold' | 'red'>('all');

  const achievementsList = Object.values(MASTER_ACHIEVEMENTS);

  const loadAchievements = async () => {
    try {
      const data = await apiFetch('/shop/my-inventory');
      setUnlockedAchs(data.unlocked_achievements || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadAchievements();
  }, []);

  const equippedList = (user.equipped_achievements || '').split(',').filter(Boolean);

  const handleToggleDisplay = async (id: string) => {
    if (!unlockedAchs.includes(id)) return;
    try {
      await apiFetch('/shop/toggle-achievement', {
        method: 'POST',
        body: JSON.stringify({ achievement_id: id })
      });
      onUpdateUser();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filtered = selectedFilter === 'all' 
    ? achievementsList 
    : achievementsList.filter(a => a.tier === selectedFilter);

  const tierStyles = {
    purple: {
      bg: 'from-purple-950 via-indigo-900 to-purple-950',
      border: 'border-purple-500/60',
      text: 'text-purple-200',
      glow: 'shadow-[0_0_20px_rgba(168,85,247,0.35)]',
      wing: '#6B21A8',
      accent: 'text-purple-400'
    },
    gold: {
      bg: 'from-amber-950 via-yellow-700 to-amber-950',
      border: 'border-yellow-400/80',
      text: 'text-yellow-100',
      glow: 'shadow-[0_0_25px_rgba(234,179,8,0.5)]',
      wing: '#78350F',
      accent: 'text-yellow-300'
    },
    red: {
      bg: 'from-rose-950 via-red-700 to-rose-950',
      border: 'border-red-500/90',
      text: 'text-red-100',
      glow: 'shadow-[0_0_30px_rgba(239,68,68,0.6)]',
      wing: '#7F1D1D',
      accent: 'text-red-400'
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold tracking-wider uppercase mb-1">
            <Medal className="w-4 h-4 text-indigo-400" />
            Salón de Estandartes de Honor
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Estandartes & Títulos Conquistados
          </h1>
          <p className="text-xs text-slate-400">
            Completa niveles y derrota jefes para desbloquear estandartes y destacarlos con el sello DISPLAY.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl text-xs font-black">
          <span className="text-purple-400">🟣 Normal</span>
          <span className="text-yellow-400">🟡 Legendario (Jefes)</span>
          <span className="text-red-400">🔴 Mítico</span>
          <span className="text-slate-400 border-l border-slate-700 pl-2">
            {unlockedAchs.length} / {achievementsList.length} Obtenidos
          </span>
        </div>
      </div>

      {/* FILTROS POR RAREZA */}
      <div className="flex gap-2">
        <button
          onClick={() => setSelectedFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition ${
            selectedFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400'
          }`}
        >
          Todos ({achievementsList.length})
        </button>
        <button
          onClick={() => setSelectedFilter('purple')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition ${
            selectedFilter === 'purple' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'bg-slate-900 text-purple-400'
          }`}
        >
          Normales (Púrpura)
        </button>
        <button
          onClick={() => setSelectedFilter('gold')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition ${
            selectedFilter === 'gold' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30' : 'bg-slate-900 text-amber-400'
          }`}
        >
          Legendarios (Jefes)
        </button>
        <button
          onClick={() => setSelectedFilter('red')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition ${
            selectedFilter === 'red' ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30' : 'bg-slate-900 text-rose-400'
          }`}
        >
          Míticos (Supremos)
        </button>
      </div>

      {/* CUADRÍCULA DE ESTANDARTES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 max-h-[520px] overflow-y-auto pr-1">
        {filtered.map((ach) => {
          const isUnlocked = unlockedAchs.includes(ach.id);
          const isEquipped = equippedList.includes(ach.id);
          const style = tierStyles[ach.tier];

          return (
            <div
              key={ach.id}
              className={`relative p-5 rounded-3xl border flex flex-col justify-between items-center text-center transition-all ${
                isUnlocked 
                  ? `bg-gradient-to-r ${style.bg} ${style.border} ${style.glow}` 
                  : 'bg-slate-950/70 border-slate-900 opacity-60'
              }`}
            >
              <div className="absolute -top-1.5 -left-2 w-4 h-4 rounded-tl-lg" style={{ backgroundColor: style.wing }} />
              <div className="absolute -top-1.5 -right-2 w-4 h-4 rounded-tr-lg" style={{ backgroundColor: style.wing }} />

              <div className="w-full">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${style.accent}`}>
                    {ach.category} • {ach.tier === 'red' ? 'MÍTICO' : ach.tier === 'gold' ? 'LEGENDARIO' : 'NORMAL'}
                  </span>

                  {isUnlocked && isEquipped && (
                    <span className="text-[10px] font-black tracking-widest px-2.5 py-0.5 rounded-full bg-cyan-500 text-black shadow-md shadow-cyan-500/40 animate-pulse">
                      — DISPLAY —
                    </span>
                  )}
                </div>

                <div className={`py-3 px-6 rounded-xl border-2 backdrop-blur-md relative overflow-hidden ${
                  isUnlocked 
                    ? `bg-black/50 ${style.border} shadow-inner` 
                    : 'bg-slate-950/90 border-slate-800'
                }`}>
                  <div className={`text-base sm:text-lg font-black tracking-wider uppercase drop-shadow-md ${
                    isUnlocked ? style.text : 'text-slate-600'
                  }`}>
                    {ach.title}
                  </div>
                </div>

                <p className="text-xs text-slate-300/80 mt-2.5 leading-relaxed">
                  {ach.requirement}
                </p>
              </div>

              <div className="w-full pt-4 mt-3 border-t border-white/10 flex items-center justify-between">
                {!isUnlocked ? (
                  <div className="w-full flex items-center justify-center gap-2 text-xs font-bold text-slate-500 py-1">
                    <Lock className="w-4 h-4" /> Bloqueado (Supera el nivel correspondiente)
                  </div>
                ) : (
                  <button
                    onClick={() => handleToggleDisplay(ach.id)}
                    className={`w-full py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 shadow-md ${
                      isEquipped
                        ? 'bg-cyan-500 text-slate-950 shadow-cyan-500/30'
                        : 'bg-slate-950/80 hover:bg-slate-900 border border-white/20 text-white'
                    }`}
                  >
                    {isEquipped ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> En Perfil (Display)
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Equipar en Display
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        Los estandartes dorados de Jefe se guardan permanentemente en tu base de datos de PostgreSQL.
      </div>
    </div>
  );
};