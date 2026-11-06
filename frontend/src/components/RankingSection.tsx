import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import { AvatarShowcase } from './AvatarShowcase';
import { 
  Trophy, 
  Flame, 
  Crown, 
  Medal, 
  Zap, 
  ShieldCheck, 
  Terminal, 
  Code2, 
  Palette,
  Users,
  X
} from 'lucide-react';

interface LeaderboardUser {
  rank: number;
  id: number;
  username: string;
  level: number;
  xp: number;
  streak_days: number;
  achievements_count: number;
  score_value: number;
  score_label: string;
  equipped_skin: string;
  equipped_aura: string;
}

interface PublicProfile {
  id: number;
  username: string;
  level: number;
  xp: number;
  streak_days: number;
  pet_name: string;
  pet_color: string;
  equipped_skin: string;
  equipped_aura: string;
  equipped_achievements: string;
  bio_signature: string;
  likes_count: number;
}

interface Props {
  currentUserId?: number;
}

export const RankingSection: React.FC<Props> = ({ currentUserId }) => {
  const [category, setCategory] = useState<'global' | 'streak' | 'python' | 'html' | 'css'>('global');
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(false);

  // Estado para inspeccionar perfil ajeno de forma segura
  const [inspectUser, setInspectUser] = useState<PublicProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const fetchLeaderboard = async (cat: string) => {
    setLoading(true);
    try {
      const data = await apiFetch(`/ranking/?category=${cat}`);
      setLeaderboard(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(category);
  }, [category]);

  const handleInspectUser = async (userId: number) => {
    setLoadingProfile(true);
    try {
      const data = await apiFetch(`/ranking/user/${userId}/public`);
      setInspectUser(data);
    } catch (err: any) {
      alert('No se pudo cargar el perfil del estudiante.');
    } finally {
      setLoadingProfile(false);
    }
  };

  const categories = [
    { id: 'global' as const, label: 'Global (Nivel & XP)', icon: Trophy, color: 'text-amber-400' },
    { id: 'streak' as const, label: 'Racha de Días', icon: Flame, color: 'text-orange-400' },
    { id: 'python' as const, label: 'Ruta Python', icon: Terminal, color: 'text-emerald-400' },
    { id: 'html' as const, label: 'Ruta HTML', icon: Code2, color: 'text-amber-500' },
    { id: 'css' as const, label: 'Ruta CSS', icon: Palette, color: 'text-cyan-400' },
  ];

  return (
    <div className="w-full h-full flex flex-col justify-between space-y-6 text-left">
      
      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold tracking-wider uppercase mb-1">
            <Trophy className="w-4 h-4 text-amber-400" />
            Tabla de Clasificación Oficial
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Top 10 Héroes de la Academia
          </h1>
          <p className="text-xs text-slate-400">
            Haz clic en cualquier jugador para inspeccionar su avatar, aura, mascota y logros.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl text-xs font-bold text-slate-300">
          <Users className="w-4 h-4 text-indigo-400" />
          <span>{leaderboard.length} / 10 Clasificados</span>
        </div>
      </div>

      {/* SELECTOR DE PESTAÑAS */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = category === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : cat.color}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* LISTA DE JUGADORES */}
      <div className="bg-slate-900/70 border border-indigo-950/80 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400 animate-pulse">
            Consultando registros reales en PostgreSQL...
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <div className="text-3xl">🛡️</div>
            <div className="text-sm font-bold text-white">No hay alumnos clasificados aún</div>
            <div className="text-xs text-slate-400">Sé el primero en resolver misiones para encabezar el ranking.</div>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {leaderboard.map((player) => {
              const isCurrentUser = player.id === currentUserId;
              const isTop1 = player.rank === 1;
              const isTop2 = player.rank === 2;
              const isTop3 = player.rank === 3;

              return (
                <div
                  key={player.id}
                  onClick={() => handleInspectUser(player.id)}
                  className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition-all ${
                    isCurrentUser 
                      ? 'bg-indigo-600/15 border-l-4 border-indigo-500' 
                      : 'hover:bg-slate-800/40'
                  }`}
                  title="Toca para inspeccionar su perfil"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm flex-shrink-0">
                      {isTop1 ? (
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-300">
                          <Crown className="w-5 h-5 text-amber-400" />
                        </div>
                      ) : isTop2 ? (
                        <div className="w-10 h-10 rounded-2xl bg-slate-400/20 border border-slate-400/50 flex items-center justify-center text-slate-300">
                          <Medal className="w-5 h-5 text-slate-300" />
                        </div>
                      ) : isTop3 ? (
                        <div className="w-10 h-10 rounded-2xl bg-amber-700/20 border border-amber-700/50 flex items-center justify-center text-amber-500">
                          <Medal className="w-5 h-5 text-amber-500" />
                        </div>
                      ) : (
                        <span className="text-slate-500 font-mono text-base font-bold">#{player.rank}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-xl">
                        🧢
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-white hover:text-indigo-300 transition">
                            {player.username}
                          </span>
                          {isCurrentUser && (
                            <span className="text-[10px] font-black px-2 py-0.2 rounded-full bg-indigo-500 text-white">
                              TÚ
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-3 mt-0.5">
                          <span className="text-indigo-400 font-bold">Nivel {player.level}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-orange-400 font-bold">
                            <Flame className="w-3 h-3" /> {player.streak_days} Días Racha
                          </span>
                          <span>•</span>
                          <span className="text-pink-400 font-bold">{player.achievements_count} Logros</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end sm:text-right">
                    <div className="bg-slate-950/80 border border-slate-800/80 px-4 py-2 rounded-2xl">
                      <div className="text-base font-black text-white">
                        {player.score_value.toLocaleString()}
                      </div>
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        {player.score_label}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL DE INSPECCIÓN SEGURA DE PERFIL AJENO */}
      {inspectUser && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-indigo-500/40 p-6 rounded-3xl max-w-lg w-full space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            {/* Botón de cerrar */}
            <button
              onClick={() => setInspectUser(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Cabecera del Perfil Inspeccionado */}
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-2xl">
                🧢
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-white">{inspectUser.username}</h3>
                  <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    AVENTURERO
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  Nivel {inspectUser.level} • {inspectUser.xp} XP • {inspectUser.streak_days} Días de Racha
                </div>
              </div>
            </div>

            {/* Vitrina 2D con su skin, aura y mascota */}
            <AvatarShowcase
              skin={inspectUser.equipped_skin}
              aura={inspectUser.equipped_aura}
              petColor={inspectUser.pet_color}
              petName={inspectUser.pet_name}
            />

            {/* Estadísticas Públicas Seguras */}
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="font-bold text-slate-400">Mascota Compañera</div>
                <div className="text-sm font-black text-amber-400 mt-0.5">{inspectUser.pet_name} (Flama)</div>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="font-bold text-slate-400">Racha Continua</div>
                <div className="text-sm font-black text-orange-400 mt-0.5">🔥 {inspectUser.streak_days} Días</div>
              </div>
            </div>

            {/* Logros que ha destacado */}
            <div className="space-y-1.5 pt-1">
              <span className="text-xs font-bold text-slate-300">Logros Destacados:</span>
              <div className="flex flex-wrap gap-2">
                {inspectUser.equipped_achievements ? (
                  inspectUser.equipped_achievements.split(',').filter(Boolean).map((ach, i) => (
                    <span key={i} className="text-xs bg-amber-500/10 border border-amber-500/30 text-amber-300 px-3 py-1 rounded-xl font-bold flex items-center gap-1.5">
                      🏆 {ach.replace('_', ' ').toUpperCase()}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">No ha destacado logros aún.</span>
                )}
              </div>
            </div>

            <div className="pt-2 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Vista de perfil protegida conforme a la política de privacidad de menores.
            </div>

          </div>
        </div>
      )}

    </div>
  );
};