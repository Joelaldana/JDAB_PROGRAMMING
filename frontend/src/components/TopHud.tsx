import React from 'react';
import { Coins, Flame, Zap } from 'lucide-react';
import { UserProfile } from '../types';

export const TopHud: React.FC<{ user: UserProfile | null }> = ({ user }) => {
  if (!user) return null;
  const xp = user.xp % 100;
  return (
    <div className="flex items-center justify-end gap-3 mb-5 flex-wrap">
      <div className="flex items-center gap-2 glass rounded-full pl-2 pr-4 py-1.5">
        <span className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-emerald-400 flex items-center justify-center font-display font-bold text-sm text-white">{user.level}</span>
        <div className="w-32"><div className="flex justify-between text-[10px] font-bold text-slate-400"><span className="flex items-center gap-1"><Zap className="w-3 h-3 text-indigo-300" />XP</span><span>{xp}/100</span></div>
          <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-700" style={{ width: `${xp}%` }} /></div></div>
      </div>
      <div className="flex items-center gap-1.5 glass rounded-full px-3.5 py-2 text-sm font-black text-orange-300"><Flame className="w-4 h-4 fill-orange-400 text-orange-400" />{user.streak_days}</div>
      <div className="flex items-center gap-1.5 glass rounded-full px-3.5 py-2 text-sm font-black text-amber-300"><Coins className="w-4 h-4 text-amber-400" />{user.coins.toLocaleString()}</div>
    </div>
  );
};
