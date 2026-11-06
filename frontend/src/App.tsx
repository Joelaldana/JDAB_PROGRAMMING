import React, { useState, useEffect } from 'react';
import { UserProfile } from './types';
import { apiFetch } from './services/api';
import { Sidebar, TabType } from './components/Sidebar';
import { LearningSection } from './components/LearningSection';
import { StreakPetSection } from './components/StreakPetSection';
import { WelcomeMascotModal } from './components/WelcomeMascotModal';
import { ShopSection } from './components/ShopSection';
import { ProfileSection } from './components/ProfileSection';
import { RankingSection } from './components/RankingSection';
import { InventorySection } from './components/InventorySection';
import { AchievementsSection } from './components/AchievementsSection';
import { TopHud } from './components/TopHud';
import { Qbit } from './components/Qbit';
import { Pet } from './components/Pet';
import { 
  Sparkles, 
  Lock, 
  User as UserIcon, 
  ArrowRight, 
  Code2, 
  ShieldCheck, 
  Zap, 
  Trophy 
} from 'lucide-react';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('jdab_token'));
  const [user, setUser] = useState<UserProfile | null>(null);
  
  // Pestaña activa por defecto: 'aprendizaje'
  const [tab, setTab] = useState<TabType>('aprendizaje');

  // Estados de inicio de sesión y registro
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal del androide de bienvenida
  const [showWelcomeMascot, setShowWelcomeMascot] = useState(false);
  const [createdUsername, setCreatedUsername] = useState('');

  const loadUserProfile = async () => {
    try {
      const data = await apiFetch('/auth/me');
      setUser(data);
    } catch {
      handleLogout();
    }
  };

  useEffect(() => {
    if (token) {
      loadUserProfile();
    }
  }, [token]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);

    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const res = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });

      if (isRegister) {
        setCreatedUsername(username);
        setShowWelcomeMascot(true);
        setIsRegister(false);
        setPassword('');
      } else {
        localStorage.setItem('jdab_token', res.access_token);
        setToken(res.access_token);
      }
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('jdab_token');
    setToken(null);
    setUser(null);
  };

  // 1. PANTALLA DE ACCESO (Si no ha iniciado sesión)
  if (!token) {
    return (
      <div className="min-h-screen bg-cyber-bg bg-grid-cyber flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-pink-600/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 text-xs font-semibold tracking-wider uppercase backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-pink-400" />
              Academia de Programación para Grados 6° a 11°
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-none">
              JDAB <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">PROGRAMING</span>
            </h1>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-lg">
              Sube de nivel resolviendo misiones de código real en Python, HTML y CSS. Cuida a tu mascota cibernética y desbloquea skins para tu perfil.
            </p>
            <div className="hidden sm:flex items-end gap-2 pt-4">
              <div className="relative"><div className="absolute inset-x-4 bottom-0 h-6 rounded-[50%] bg-indigo-500/30 blur-xl" /><Qbit skinId="default" size="xl" /></div>
              <Pet stage={3} color="orange" className="w-32 h-36 mb-6" />
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-slate-900/70 border border-indigo-500/30 p-8 rounded-3xl shadow-2xl backdrop-blur-xl space-y-6">
              <div className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => { setIsRegister(false); setAuthError(''); }}
                  className={`py-2 text-xs font-bold rounded-lg transition ${
                    !isRegister ? 'bg-indigo-600 text-white' : 'text-gray-400'
                  }`}
                >
                  Iniciar Sesión
                </button>
                <button
                  type="button"
                  onClick={() => { setIsRegister(true); setAuthError(''); }}
                  className={`py-2 text-xs font-bold rounded-lg transition ${
                    isRegister ? 'bg-pink-600 text-white' : 'text-gray-400'
                  }`}
                >
                  Crear Cuenta
                </button>
              </div>

              {authError && (
                <div className="p-3 bg-rose-950/50 border border-rose-500/40 rounded-xl text-rose-300 text-xs font-medium text-center">
                  ⚠️ {authError}
                </div>
              )}

              <form onSubmit={handleAuth} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5 text-indigo-400" /> Usuario
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none"
                    placeholder="ej. Manuelmolina"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-pink-400" /> Contraseña
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-pink-500 outline-none"
                    placeholder="••••••••"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl text-sm font-extrabold bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white transition shadow-xl"
                >
                  {isRegister ? 'Crear Personaje' : 'Entrar a la Academia'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Notificación del androide flotante */}
        <WelcomeMascotModal
          isOpen={showWelcomeMascot}
          username={createdUsername}
          onProceedToLogin={() => setShowWelcomeMascot(false)}
        />
      </div>
    );
  }

  // 2. DASHBOARD PRINCIPAL
  return (
    <div className="min-h-screen bg-cyber-bg bg-grid-cyber flex p-4 gap-5">
      <Sidebar
        currentTab={tab} onSelectTab={setTab} onLogout={handleLogout}
        streakDays={user?.streak_days || 1} petName={user?.pet_name || 'Bit'}
        petColor={user?.pet_color} username={user?.username} level={user?.level || 1}
      />

      <main className="flex-1 min-w-0 max-w-[1400px]">
        <TopHud user={user} />
        <div key={tab} className="pop-in">
          {tab === 'aprendizaje' && (
            <LearningSection onReward={(xp, coins) => { if (user) setUser({ ...user, xp: user.xp + xp, coins: user.coins + coins, level: Math.floor((user.xp + xp) / 100) + 1 }); }} />
          )}
          {tab === 'racha' && user && <StreakPetSection user={user} onUpdateUser={loadUserProfile} />}
          {tab === 'tienda' && user && <ShopSection user={user} onUpdateUser={loadUserProfile} onExit={() => setTab('aprendizaje')} />}
          {tab === 'perfil' && user && <ProfileSection user={user} onUpdateUser={loadUserProfile} />}
          {tab === 'ranking' && <RankingSection currentUserId={user?.id} />}
          {tab === 'logros' && user && <AchievementsSection user={user} onUpdateUser={loadUserProfile} />}
          {tab === 'inventario' && user && <InventorySection user={user} onUpdateUser={loadUserProfile} />}
        </div>
      </main>
    </div>
  );
}
