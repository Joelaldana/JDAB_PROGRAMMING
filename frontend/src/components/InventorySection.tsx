import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { apiFetch } from '../services/api';
import { AvatarShowcase } from './AvatarShowcase';
import { MASTER_ACHIEVEMENTS } from '../data/achievementsData';
import { Package, Trophy } from 'lucide-react';

interface Props {
  user: UserProfile;
  onUpdateUser: () => void;
}

export const InventorySection: React.FC<Props> = ({ user, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState<'logros' | 'auras' | 'skins' | 'mascota'>('logros');
  const [unlockedAchs, setUnlockedAchs] = useState<string[]>([]);

  const loadInventory = async () => {
    try {
      const data = await apiFetch('/shop/my-inventory');
      setUnlockedAchs(data.unlocked_achievements || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const equippedAchievements = (user.equipped_achievements || '').split(',').filter(Boolean);

  const handleToggleAchievement = async (id: string) => {
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

  const handleEquipCosmetic = async (category: string, code: string) => {
    try {
      await apiFetch('/shop/buy-and-equip', {
        method: 'POST',
        body: JSON.stringify({ category, code })
      });
      onUpdateUser();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="w-full h-full space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <Package className="w-7 h-7 text-indigo-400" /> Bóveda de Inventario
          </h1>
          <p className="text-xs text-slate-400">
            Todos los logros ganados en misiones, auras y skins equipables.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl text-xs font-bold text-slate-300">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>{unlockedAchs.length} Logros Conquistados</span>
        </div>
      </div>

      {/* PESTAÑAS */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('logros')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition ${
            activeTab === 'logros' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-slate-900 text-slate-400'
          }`}
        >
          🎖️ Logros Ganados ({unlockedAchs.length})
        </button>
        <button
          onClick={() => setActiveTab('auras')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition ${
            activeTab === 'auras' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-slate-900 text-slate-400'
          }`}
        >
          🌌 Auras
        </button>
        <button
          onClick={() => setActiveTab('skins')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition ${
            activeTab === 'skins' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-slate-900 text-slate-400'
          }`}
        >
          🧢 Skins de Personaje
        </button>
        <button
          onClick={() => setActiveTab('mascota')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition ${
            activeTab === 'mascota' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-slate-900 text-slate-400'
          }`}
        >
          🔥 Colores de Mascota
        </button>
      </div>

      {/* CONTENIDO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 space-y-3">
          
          {/* LOGROS GANADOS */}
          {activeTab === 'logros' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400">
                Logros únicos ganados superando niveles en Aprendizaje. Toca para equipar en tu Perfil:
              </div>

              {unlockedAchs.length === 0 ? (
                <div className="p-8 bg-slate-900/60 border border-slate-800 rounded-3xl text-center space-y-2">
                  <div className="text-3xl">🔒</div>
                  <div className="text-sm font-bold text-white">No tienes logros en tu bóveda aún</div>
                  <div className="text-xs text-slate-400">Supera el Nivel 1 de HTML para ganar tu primer estandarte "Primer Contacto".</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {unlockedAchs.map((achId) => {
                    const ach = MASTER_ACHIEVEMENTS[achId] || { title: achId, desc: 'Logro de maestría en código', icon: '🏆', tier: 'purple' };
                    const isEquipped = equippedAchievements.includes(achId);

                    return (
                      <div
                        key={achId}
                        onClick={() => handleToggleAchievement(achId)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                          isEquipped
                            ? 'bg-amber-950/20 border-amber-500/60 shadow-lg shadow-amber-500/10'
                            : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-2xl">{ach.icon}</span>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                              isEquipped ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {isEquipped ? 'EN PERFIL' : 'EN BÓVEDA'}
                            </span>
                          </div>
                          <div className="font-black text-sm text-white">{ach.title}</div>
                          <p className="text-[11px] text-slate-400 mt-1">{ach.desc}</p>
                        </div>

                        <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-bold text-indigo-300">
                          <span>{isEquipped ? '✔ Destacado' : '+ Mostrar en Perfil'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* AURAS */}
          {activeTab === 'auras' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { id: 'none', name: 'Sin Aura', icon: '🚫' },
                { id: 'aura_fire', name: 'Fire Flare', icon: '🔥' },
                { id: 'aura_shock', name: 'Shock Volt', icon: '⚡' },
                { id: 'aura_cosmic', name: 'Cosmic Orbit', icon: '🌌' },
                { id: 'aura_wind', name: 'Wind Vortex', icon: '🌪️' },
                { id: 'aura_sakura', name: 'Sakura Bloom', icon: '🌸' },
              ].map((aura) => {
                const isEquipped = user.equipped_aura === aura.id;
                return (
                  <div key={aura.id} className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl text-center space-y-2">
                    <div className="text-3xl my-1">{aura.icon}</div>
                    <div className="font-bold text-xs text-white">{aura.name}</div>
                    <button
                      onClick={() => handleEquipCosmetic('aura', aura.id)}
                      className={`w-full py-1.5 rounded-xl text-[11px] font-black transition ${
                        isEquipped ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50' : 'bg-indigo-600 text-white'
                      }`}
                    >
                      {isEquipped ? 'Equipado' : 'Equipar'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* SKINS */}
          {activeTab === 'skins' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { id: 'default', name: 'Explorador Base', icon: '🧢' },
                { id: 'skin_vampire', name: 'Conde Drácula', icon: '🧛‍♂️' },
                { id: 'skin_ghost', name: 'Fantasma', icon: '👻' },
                { id: 'skin_hunter', name: 'Chamán', icon: '🦌' },
              ].map((skin) => {
                const isEquipped = (user.equipped_skin || 'default') === skin.id;
                return (
                  <div key={skin.id} className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl text-center space-y-2">
                    <div className="text-3xl my-1">{skin.icon}</div>
                    <div className="font-bold text-xs text-white">{skin.name}</div>
                    <button
                      onClick={() => handleEquipCosmetic('skin', skin.id)}
                      className={`w-full py-1.5 rounded-xl text-[11px] font-black transition ${
                        isEquipped ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50' : 'bg-indigo-600 text-white'
                      }`}
                    >
                      {isEquipped ? 'Equipado' : 'Equipar'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* COLORES DE MASCOTA */}
          {activeTab === 'mascota' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { id: 'orange', name: 'Llama Naranja', icon: '🔥' },
                { id: 'pet_blue', name: 'Llama Glaciar', icon: '💎' },
                { id: 'pet_green', name: 'Fuego Esmeralda', icon: '🧪' },
                { id: 'pet_purple', name: 'Plasma Cósmico', icon: '🔮' },
              ].map((pet) => {
                const isEquipped = (user.pet_color || 'orange') === pet.id;
                return (
                  <div key={pet.id} className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl text-center space-y-2">
                    <div className="text-3xl my-1">{pet.icon}</div>
                    <div className="font-bold text-xs text-white">{pet.name}</div>
                    <button
                      onClick={() => handleEquipCosmetic('pet_color', pet.id)}
                      className={`w-full py-1.5 rounded-xl text-[11px] font-black transition ${
                        isEquipped ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50' : 'bg-indigo-600 text-white'
                      }`}
                    >
                      {isEquipped ? 'Equipado' : 'Equipar'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        <div className="lg:col-span-5 space-y-3">
          <AvatarShowcase
            skin={user.equipped_skin}
            aura={user.equipped_aura}
            petColor={user.pet_color}
            petName={user.pet_name || 'Ignis'}
          />
        </div>
      </div>
    </div>
  );
};