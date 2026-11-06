import React, { useState } from 'react';
import { UserProfile } from '../types';
import { apiFetch } from '../services/api';
import { Flame, Sparkles, Edit3, Coins, Check, Lock, Gift } from 'lucide-react';
import { Pet } from './Pet';
import { getPalette, getStage, PET_STAGES } from '../data/petData';

interface Props { user: UserProfile; onUpdateUser: () => void }

const DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export const StreakPetSection: React.FC<Props> = ({ user, onUpdateUser }) => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.pet_name || 'Ignis');
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState('');
  const [mood, setMood] = useState<'happy' | 'excited'>('happy');

  const streak = user.streak_days || 1;
  const stage = getStage(streak);
  const pal = getPalette(user.pet_color);
  const pct = stage.next ? Math.min(100, ((streak - stage.from) / (stage.next - stage.from)) * 100) : 100;
  const todayIdx = (new Date().getDay() + 6) % 7;
  // Los últimos `streak` días (hasta hoy) aparecen encendidos
  const lit = (i: number) => i <= todayIdx && todayIdx - i < streak;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await apiFetch('/auth/pet-name', { method: 'PATCH', body: JSON.stringify({ pet_name: name.trim() }) });
      setEditing(false); setNote(`¡Ahora se llama ${name.trim()}! ✨`); setTimeout(() => setNote(''), 3500); onUpdateUser();
    } catch (err: any) { setNote(err.message); } finally { setSaving(false); }
  };

  const cheer = () => { setMood('excited'); setTimeout(() => setMood('happy'), 1800); };

  return (
    <div className="flex-1 min-w-0 space-y-5 text-left">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold tracking-wider uppercase">
            <Flame className="w-3.5 h-3.5 fill-amber-400" /> Santuario de Racha
          </div>
          <h1 className="font-display text-3xl font-bold text-white mt-2">Tu compañero: {user.pet_name || 'Ignis'}</h1>
        </div>
        <div className="flex items-center gap-3 glass rounded-2xl px-5 py-3 border-amber-500/40">
          <Flame className="w-9 h-9 text-amber-400 fill-amber-400 animate-pulse" />
          <div><div className="font-display text-3xl font-bold text-white leading-none">{streak}</div><div className="text-[10px] uppercase tracking-widest text-amber-300 font-bold">días seguidos</div></div>
        </div>
      </header>

      {note && <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2 pop-in"><Check className="w-4 h-4" /> {note}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Escenario de la mascota */}
        <div className="xl:col-span-7 relative rounded-3xl overflow-hidden border border-amber-500/20 card-3d bg-gradient-to-b from-[#1a0f2e] to-[#0a0618] p-6 flex flex-col items-center justify-center">
          <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 55%, ${pal.main}33, transparent 60%)` }} />
          <div className="relative inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/80 border border-amber-500/40 text-[11px] font-black text-amber-300 uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" /> Fase {stage.level} · {stage.name}
          </div>
          <button onClick={cheer} className="relative mt-3 focus:outline-none" title="¡Acaricia a tu mascota!">
            <Pet stage={stage.level} color={user.pet_color} mood={mood} className="w-60 h-64" />
          </button>
          <div className="w-44 h-5 -mt-3 rounded-[50%] bg-black/50 blur-md" />
          <p className="relative text-xs text-slate-400 mt-2 italic">{stage.blurb} <span className="text-slate-500">(tócala 👆)</span></p>

          <div className="relative flex items-center gap-2 mt-3">
            <span className="font-display text-2xl font-bold text-white">{user.pet_name || 'Ignis'}</span>
            <button onClick={() => setEditing(!editing)} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-white/5" title="Cambiar nombre"><Edit3 className="w-4 h-4" /></button>
          </div>
          {editing && (
            <form onSubmit={save} className="relative mt-2 flex gap-2 w-full max-w-xs">
              <input value={name} onChange={e => setName(e.target.value)} maxLength={18} required className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500" />
              <button disabled={saving} className="btn-3d bg-amber-500 text-black font-black text-xs px-4 rounded-xl" style={{ ['--btn-edge' as any]: '#b45309' }}>{saving ? '…' : 'Guardar'}</button>
            </form>
          )}

          <div className="relative w-full max-w-md mt-5 space-y-1.5">
            <div className="flex justify-between text-[11px] font-bold"><span className="text-slate-400">{stage.next ? 'Próxima evolución' : 'Evolución máxima 🌞'}</span><span className="text-amber-300">{stage.next ? `${streak} / ${stage.next} días` : `${streak} días`}</span></div>
            <div className="h-3 rounded-full bg-slate-950 border border-slate-800 overflow-hidden"><div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: `linear-gradient(90deg,${pal.main},#FBBF24,#EC4899)` }} /></div>
          </div>
        </div>

        {/* Panel derecho */}
        <div className="xl:col-span-5 space-y-4">
          <div className="glass rounded-3xl p-5 space-y-3">
            <div className="text-xs font-black uppercase tracking-widest text-slate-400">Esta semana</div>
            <div className="flex justify-between">
              {DAYS.map((d, i) => { const on = lit(i); const today = i === todayIdx; return (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <div className={`w-10 h-12 rounded-xl flex items-center justify-center border transition ${on ? 'bg-gradient-to-b from-amber-400/30 to-orange-600/20 border-amber-400/60' : 'bg-slate-900/60 border-slate-800'} ${today ? 'pulse-ring' : ''}`}>
                    {on ? <Flame className="w-5 h-5 text-amber-400 fill-amber-400" /> : <span className="w-2 h-2 rounded-full bg-slate-700" />}
                  </div>
                  <span className={`text-[10px] font-bold ${today ? 'text-amber-300' : 'text-slate-500'}`}>{d}</span>
                </div>); })}
            </div>
            <p className="text-[11px] text-rose-300/90 bg-rose-950/30 border border-rose-500/30 rounded-xl p-3">⚠️ Si pasas un día sin entrar, {user.pet_name || 'tu mascota'} vuelve a ser una chispa. ¡Entra a diario!</p>
          </div>

          <div className="glass rounded-3xl p-5 space-y-3">
            <div className="text-xs font-black uppercase tracking-widest text-slate-400">Camino de evolución</div>
            {PET_STAGES.map(s => { const done = streak >= s.from; return (
              <div key={s.level} className={`flex items-center gap-3 p-2.5 rounded-2xl border ${stage.level === s.level ? 'border-amber-400/60 bg-amber-500/10' : 'border-slate-800 bg-slate-950/40'} ${done ? '' : 'opacity-60'}`}>
                <div className="w-12 h-12 rounded-xl bg-slate-950 flex items-center justify-center overflow-hidden">
                  {done ? <Pet stage={s.level} color={user.pet_color} animate={false} className="w-10 h-11" /> : <Lock className="w-4 h-4 text-slate-600" />}
                </div>
                <div className="flex-1 min-w-0"><div className="text-xs font-black text-white">{s.name}</div><div className="text-[10px] text-slate-400">Desde {s.from} días de racha</div></div>
                {done && <Check className="w-4 h-4 text-emerald-400" />}
              </div>); })}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="glass rounded-2xl p-3.5 flex items-center gap-2.5"><Coins className="w-6 h-6 text-amber-400" /><div><div className="text-xs font-black text-white">+10 monedas</div><div className="text-[10px] text-slate-400">por racha diaria</div></div></div>
            <div className="glass rounded-2xl p-3.5 flex items-center gap-2.5"><Gift className="w-6 h-6 text-pink-400" /><div><div className="text-xs font-black text-white">Premio día 7</div><div className="text-[10px] text-slate-400">¡sorpresa ígnea!</div></div></div>
          </div>
        </div>
      </div>
    </div>
  );
};
