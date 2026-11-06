import React, { useState, useEffect } from 'react';
import { UserProfile, UserRealProfile } from '../types';
import { apiFetch } from '../services/api';
import { AvatarShowcase } from './AvatarShowcase';
import { Pet } from './Pet';
import { getOutfit } from './Qbit';
import { getStage } from '../data/petData';
import { MASTER_ACHIEVEMENTS } from '../data/achievementsData';
import { Flame, Coins, Trophy, Target, Pencil, Check } from 'lucide-react';

const TIER: Record<string, string> = { purple: 'from-purple-600/30 to-indigo-700/20 border-purple-400/50', gold: 'from-amber-500/30 to-yellow-700/20 border-amber-400/60', red: 'from-rose-500/30 to-red-800/20 border-rose-400/60' };

export const ProfileSection: React.FC<{ user?: UserProfile; onUpdateUser?: () => void }> = ({ onUpdateUser }) => {
  const [profile, setProfile] = useState<UserRealProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState('');

  const load = async () => {
    try { const d = await apiFetch('/profile/me'); setProfile(d); setBio(d.bio_signature || ''); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const saveBio = async () => {
    try { await apiFetch('/profile/bio', { method: 'PATCH', body: JSON.stringify({ bio_signature: bio }) }); } catch { /* endpoint opcional */ }
    setProfile(p => p ? { ...p, bio_signature: bio } : p); setEditing(false); onUpdateUser?.();
  };

  if (loading) return <div className="flex-1 py-24 text-center text-xs text-slate-400 animate-pulse">Cargando expediente…</div>;
  if (!profile) return <div className="flex-1 py-16 text-center text-xs text-rose-400">No se pudo cargar el perfil.</div>;

  const { stats } = profile;
  const xpIn = stats.xp % 100;
  const stage = getStage(stats.streak_days);
  const R = 46, C = 2 * Math.PI * R;
  const ach = (profile.equipped_achievements || []).slice(0, 4);

  return (
    <div className="flex-1 min-w-0 grid grid-cols-1 xl:grid-cols-12 gap-5 text-left items-start">
      <div className="xl:col-span-5 space-y-3">
        <AvatarShowcase skin={profile.equipped_skin} aura={profile.equipped_aura} petColor={profile.pet_color} petName={profile.pet_name} streak={stats.streak_days} height="h-[460px]" />
      </div>

      <div className="xl:col-span-7 space-y-4">
        {/* Tarjeta de jugador */}
        <div className="glass card-3d rounded-3xl p-5 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="relative flex items-center gap-5">
            <div className="relative w-28 h-28 shrink-0">
              <svg viewBox="0 0 110 110" className="w-full h-full -rotate-90">
                <circle cx="55" cy="55" r={R} fill="none" stroke="#1e1b4b" strokeWidth="9" />
                <circle cx="55" cy="55" r={R} fill="none" stroke="url(#xpg)" strokeWidth="9" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - xpIn / 100)} className="transition-all duration-700" />
                <defs><linearGradient id="xpg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#6366F1" /><stop offset="1" stopColor="#34D399" /></linearGradient></defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-[9px] font-black tracking-widest text-slate-400">NIVEL</span><span className="font-display text-4xl font-bold text-white leading-none">{stats.level}</span></div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-3xl font-bold text-white truncate">{profile.username}</h1>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">● En línea</span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">{getOutfit(profile.equipped_skin).name} · ID #{profile.id}</div>
              <div className="mt-2 flex items-center gap-2 text-sm text-indigo-200 italic">
                {editing ? (<>
                  <input value={bio} onChange={e => setBio(e.target.value)} maxLength={60} className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white outline-none focus:border-indigo-400 flex-1" />
                  <button onClick={saveBio} className="text-emerald-400"><Check className="w-4 h-4" /></button></>) : (<>
                  <span className="truncate">“{profile.bio_signature || 'Escribe tu lema…'}”</span>
                  <button onClick={() => setEditing(true)} className="text-slate-500 hover:text-white"><Pencil className="w-3.5 h-3.5" /></button></>)}
              </div>
              <div className="mt-2 text-[11px] text-slate-400">{xpIn}/100 XP · {100 - xpIn} para el nivel {stats.level + 1}</div>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { i: <Target className="w-5 h-5" />, v: stats.missions_completed, l: 'Misiones', c: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30' },
            { i: <Flame className="w-5 h-5 fill-current" />, v: stats.streak_days, l: 'Racha', c: 'text-orange-300 bg-orange-500/10 border-orange-500/30' },
            { i: <Trophy className="w-5 h-5" />, v: stats.unlocked_achievements_count, l: 'Logros', c: 'text-pink-300 bg-pink-500/10 border-pink-500/30' },
            { i: <Coins className="w-5 h-5" />, v: stats.coins.toLocaleString(), l: 'Monedas', c: 'text-amber-300 bg-amber-500/10 border-amber-500/30' },
          ].map(s => (
            <div key={s.l} className={`rounded-2xl border p-3.5 ${s.c}`}>{s.i}<div className="font-display text-2xl font-bold text-white mt-1.5 leading-none">{s.v}</div><div className="text-[10px] uppercase tracking-wider font-bold opacity-80 mt-1">{s.l}</div></div>
          ))}
        </div>

        {/* Compañero */}
        <div className="glass rounded-3xl p-4 flex items-center gap-4">
          <div className="w-24 h-24 rounded-2xl bg-slate-950/70 flex items-center justify-center shrink-0"><Pet stage={stage.level} color={profile.pet_color} className="w-20 h-22" /></div>
          <div>
            <div className="text-[10px] uppercase tracking-widest font-black text-amber-300">Compañero de racha</div>
            <div className="font-display text-xl font-bold text-white">{profile.pet_name} <span className="text-sm text-slate-400 font-sans font-normal">· {stage.name}</span></div>
            <div className="text-xs text-slate-400">{stage.blurb}</div>
          </div>
        </div>

        {/* Vitrina */}
        <div className="glass rounded-3xl p-5 space-y-3">
          <div className="text-xs font-black uppercase tracking-widest text-pink-300">🎖️ Vitrina de honor ({ach.length}/4)</div>
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => { const id = ach[i]; const a = id && (MASTER_ACHIEVEMENTS[id] || { title: id, desc: 'Logro superado', icon: '🏆', tier: 'purple' });
              return a ? (
                <div key={i} className={`rounded-2xl border bg-gradient-to-br p-3 flex items-center gap-3 ${TIER[a.tier] || TIER.purple}`}><span className="text-3xl">{a.icon}</span><div className="min-w-0"><div className="text-xs font-black text-white truncate">{a.title}</div><div className="text-[10px] text-slate-300/80 line-clamp-2">{a.desc}</div></div></div>
              ) : (<div key={i} className="rounded-2xl border border-dashed border-slate-700 p-3 text-center text-[11px] text-slate-600 flex items-center justify-center h-[66px]">Espacio libre</div>);
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
