import React from 'react';
import { Sparkles, ArrowRight, Coins, ShieldCheck } from 'lucide-react';

interface Props {
  isOpen: boolean;
  username: string;
  onProceedToLogin: () => void;
}

export const WelcomeMascotModal: React.FC<Props> = ({ isOpen, username, onProceedToLogin }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      
      {/* Luces de energía de fondo */}
      <div className="absolute w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute w-72 h-72 bg-pink-500/20 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative max-w-lg w-full bg-slate-900/95 border-2 border-indigo-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(99,102,241,0.3)] backdrop-blur-xl flex flex-col items-center text-center space-y-6">
        
        {/* EL ANDROIDE BIT FLOTANTE */}
        <div className="relative animate-bounce" style={{ animationDuration: '3s' }}>
          
          {/* Resplandor del propulsor */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-16 h-8 bg-cyan-400/40 rounded-full blur-md animate-pulse" />

          {/* SVG del Robot */}
          <svg viewBox="0 0 160 160" className="w-32 h-32 drop-shadow-[0_10px_20px_rgba(6,182,212,0.4)]">
            <line x1="80" y1="40" x2="80" y2="18" stroke="#6366F1" strokeWidth="4" strokeLinecap="round" />
            <circle cx="80" cy="16" r="7" fill="#38BDF8" className="animate-ping" style={{ animationDuration: '2s' }} />
            <circle cx="80" cy="16" r="6" fill="#38BDF8" />

            <rect x="25" y="65" width="12" height="30" rx="6" fill="#4338CA" />
            <rect x="123" y="65" width="12" height="30" rx="6" fill="#4338CA" />

            <rect x="32" y="40" width="96" height="76" rx="28" fill="#1E1B4B" stroke="#6366F1" strokeWidth="3" />
            
            <rect x="42" y="52" width="76" height="52" rx="18" fill="#0F172A" stroke="#06B6D4" strokeWidth="2" />

            <path d="M 54 74 Q 62 64 70 74" stroke="#06B6D4" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M 90 74 Q 98 64 106 74" stroke="#06B6D4" strokeWidth="4" strokeLinecap="round" fill="none" />

            <path d="M 72 88 Q 80 95 88 88" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" fill="none" />

            <circle cx="50" cy="85" r="4" fill="#EC4899" fillOpacity="0.7" />
            <circle cx="110" cy="85" r="4" fill="#EC4899" fillOpacity="0.7" />

            <polygon points="70,116 90,116 85,135 75,135" fill="#4338CA" />
            <polygon points="73,135 87,135 80,152" fill="#06B6D4" className="animate-pulse" />
          </svg>

          <span className="absolute -top-1 -right-2 bg-gradient-to-r from-pink-500 to-indigo-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-md">
            BIT • GUÍA
          </span>
        </div>

        {/* GLOBO DE DIÁLOGO */}
        <div className="relative bg-slate-950/80 border border-cyan-500/30 rounded-2xl p-5 space-y-3 shadow-inner w-full">
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-950 border-t border-l border-cyan-500/30 rotate-45" />

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-bold tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" /> Transmisión entrante...
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white">
            ¡Saludos, Aventurero{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
              {username}
            </span>!
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            ¡He registrado tu perfil con éxito en <strong className="text-indigo-400">JDAB PROGRAMING</strong>! Te he dejado un cofre de bienvenida con 50 monedas virtuales.
          </p>

          <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
            <Coins className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
            +50 Monedas añadidas a tu cofre
          </div>
        </div>

        {/* BOTÓN DALE A INICIAR SESIÓN */}
        <div className="w-full space-y-2">
          <button
            onClick={onProceedToLogin}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-black text-sm tracking-wide shadow-[0_0_25px_rgba(99,102,241,0.5)] transition-all transform active:scale-95 flex items-center justify-center gap-2 group"
          >
            <span>DALE A INICIAR SESIÓN</span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
          
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Perfil listo para comenzar la aventura
          </div>
        </div>

      </div>
    </div>
  );
};