import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { apiFetch } from '../services/api';
import { AvatarShowcase } from './AvatarShowcase';
import { 
  ArrowLeft, 
  Lock, 
  Check, 
  Flame, 
  Shirt, 
  Box, 
  Dices, 
  RotateCcw,
  Smile
} from 'lucide-react';

interface Props {
  user: UserProfile;
  onUpdateUser: () => void;
  onExit?: () => void;
}

interface ShopItem {
  id: string;
  name: string;
  rarity: 'Común' | 'Extraño' | 'Legendario';
  price: number;
  preview: string;
  desc?: string;
}

export const ShopSection: React.FC<Props> = ({ user, onUpdateUser, onExit }) => {
  const [storeTab, setStoreTab] = useState<'nuevo' | 'comercio'>('comercio');
  const [activeCategory, setActiveCategory] = useState<'skins' | 'auras'>('skins');

  // EL PROBADOR INICIA MOSTRANDO LO QUE EL USUARIO REALMENTE TIENE EQUIPADO (ROPA BASE)
  const [previewSkin, setPreviewSkin] = useState<string>(user.equipped_skin || 'default');
  const [previewAura, setPreviewAura] = useState<string>(user.equipped_aura || 'none');

  const [catalog, setCatalog] = useState<{ skins: ShopItem[]; auras: ShopItem[] }>({ skins: [], auras: [] });
  const [inventory, setInventory] = useState<{ owned_skins: string[]; owned_auras: string[] }>({ owned_skins: ['default'], owned_auras: ['none'] });
  const [loading, setLoading] = useState(false);

  const loadShopData = async () => {
    try {
      const [catData, invData] = await Promise.all([
        apiFetch('/shop/catalog'),
        apiFetch('/shop/my-inventory')
      ]);
      setCatalog(catData);
      setInventory(invData);
    } catch (err) {
      console.error('Error cargando catálogo:', err);
    }
  };

  useEffect(() => {
    loadShopData();
  }, []);

  // Al hacer clic en un artículo: SE LO PRUEBA EN EL MANIQUÍ
  const handleSelectItem = (item: ShopItem) => {
    if (activeCategory === 'skins') {
      setPreviewSkin(item.id);
    } else {
      setPreviewAura(item.id);
    }
  };

  // Volver a la ropa real que tiene puesta
  const handleResetPreview = () => {
    setPreviewSkin(user.equipped_skin || 'default');
    setPreviewAura(user.equipped_aura || 'none');
  };

  // Comprar o Equipar
  const handleAction = async (item: ShopItem) => {
    const isOwned = activeCategory === 'skins' 
      ? inventory.owned_skins.includes(item.id) 
      : inventory.owned_auras.includes(item.id);

    setLoading(true);
    try {
      if (isOwned) {
        // Si ya lo compró: Equipar
        await apiFetch('/shop/equip', {
          method: 'POST',
          body: JSON.stringify({ category: activeCategory === 'skins' ? 'skin' : 'aura', code: item.id })
        });
      } else {
        // Si no lo tiene: Comprar
        await apiFetch('/shop/buy', {
          method: 'POST',
          body: JSON.stringify({ category: activeCategory === 'skins' ? 'skin' : 'aura', code: item.id, price: item.price })
        });
      }
      await loadShopData();
      onUpdateUser();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const currentItems = activeCategory === 'skins' ? catalog.skins : catalog.auras;

  return (
    <div className="w-full h-full flex flex-col justify-between space-y-4 text-left select-none">
      
      {/* BARRA SUPERIOR */}
      <header className="flex items-center justify-between border-b border-purple-950/60 pb-3">
        <button
          onClick={onExit}
          className="flex items-center gap-2 text-sm font-black text-white hover:text-purple-300 transition px-3 py-1.5 rounded-xl hover:bg-slate-900"
        >
          <ArrowLeft className="w-4 h-4" /> Salir
        </button>

        {/* Píldora Central: Qué hay de nuevo | Comercio */}
        <div className="flex bg-[#0B0418] border border-purple-900/60 rounded-2xl p-1 shadow-inner">
          <button
            onClick={() => setStoreTab('nuevo')}
            className={`px-5 py-2 rounded-xl text-xs font-black transition ${
              storeTab === 'nuevo' ? 'bg-[#1C0E38] text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Qué hay de nuevo
          </button>
          <button
            onClick={() => setStoreTab('comercio')}
            className={`px-5 py-2 rounded-xl text-xs font-black transition ${
              storeTab === 'comercio' ? 'bg-[#1C0E38] text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Comercio
          </button>
        </div>

        {/* Monedas reales del alumno */}
        <div className="flex items-center gap-2 bg-[#1A0E2E] border border-amber-500/40 px-3.5 py-1.5 rounded-full shadow-lg shadow-amber-500/10">
          <span className="text-amber-400 text-sm">🪙</span>
          <span className="text-sm font-black text-white">{user.coins.toLocaleString()}</span>
          <span className="w-4 h-4 rounded-full bg-amber-500 text-black flex items-center justify-center text-[10px] font-black ml-1">
            +
          </span>
        </div>
      </header>

      {/* CUERPO DE LA TIENDA */}
      <div className="flex gap-4 flex-1 items-start">
        
        {/* TIRA LATERAL DE CATEGORÍAS */}
        <div className="flex flex-col gap-2 p-1.5 bg-[#0A0316] border border-purple-950/60 rounded-2xl shadow-xl">
          <button className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:text-white transition">
            <Box className="w-5 h-5" />
          </button>

          {/* Botón Skins */}
          <button
            onClick={() => setActiveCategory('skins')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${
              activeCategory === 'skins' 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/40' 
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
            title="Skins en Venta"
          >
            <Shirt className="w-5 h-5" />
          </button>

          {/* Botón Auras */}
          <button
            onClick={() => setActiveCategory('auras')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${
              activeCategory === 'auras' 
                ? 'bg-white text-slate-950 shadow-lg shadow-white/30' 
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
            title="Auras en Venta"
          >
            <Flame className="w-5 h-5 fill-current" />
          </button>

          <button className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600">
            <Smile className="w-5 h-5" />
          </button>
        </div>

        {/* CUADRÍCULA DE ARTÍCULOS EN VENTA */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
            <span>
              {activeCategory === 'auras' ? 'Auras en Venta' : 'Skins en Venta'} ({currentItems.length} artículos)
            </span>
            <span className="text-[11px] text-purple-400">Toca para probarte el artículo en Mi Qbit</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 max-h-[460px] overflow-y-auto pr-1">
            {currentItems.map((item) => {
              const isSelected = activeCategory === 'skins' ? previewSkin === item.id : previewAura === item.id;
              const isOwned = activeCategory === 'skins' 
                ? inventory.owned_skins.includes(item.id) 
                : inventory.owned_auras.includes(item.id);
              const isEquipped = activeCategory === 'skins' 
                ? (user.equipped_skin || 'default') === item.id 
                : (user.equipped_aura || 'none') === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectItem(item)}
                  className={`bg-[#0E061E]/90 p-4 rounded-3xl border-2 flex flex-col justify-between items-center text-center cursor-pointer transition-all relative group ${
                    isSelected 
                      ? 'border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.35)] scale-[1.02]' 
                      : 'border-purple-950/40 hover:border-purple-800/60'
                  }`}
                >
                  <span className={`absolute top-3 right-3 text-[9px] font-black px-2 py-0.5 rounded-md ${
                    item.rarity === 'Legendario' ? 'bg-amber-500 text-black' :
                    item.rarity === 'Extraño' ? 'bg-purple-600 text-white' :
                    'bg-blue-600 text-white'
                  }`}>
                    {item.rarity}
                  </span>

                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl my-3 group-hover:scale-110 transition-transform drop-shadow-md">
                    {item.preview}
                  </div>

                  <div className="font-black text-sm text-white mb-2">
                    {item.name}
                  </div>

                  {/* BOTÓN CON PRECIO DE COMPRA O DE EQUIPAR */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAction(item);
                    }}
                    disabled={loading}
                    className={`w-full py-2 px-3 rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 transition shadow-md ${
                      isEquipped
                        ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50'
                        : isOwned
                        ? 'bg-purple-600 hover:bg-purple-500 text-white'
                        : item.price === 0
                        ? 'bg-slate-800 text-slate-300'
                        : 'bg-[#170B2E] hover:bg-[#251249] text-white border border-purple-800/40'
                    }`}
                  >
                    {isEquipped ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Equipado
                      </>
                    ) : isOwned ? (
                      'Equipar'
                    ) : item.price === 0 ? (
                      'Gratis'
                    ) : (
                      <>
                        <Lock className="w-3 h-3 text-slate-400" />
                        <span>{item.price.toLocaleString()}</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* PROBADOR "MI QBIT" A LA DERECHA */}
        <div className="w-80 flex flex-col space-y-2 relative">
          <div className="flex items-center justify-between text-xs font-black text-white px-2">
            <span>Probador: Mi Qbit</span>
            <button
              onClick={handleResetPreview}
              className="text-[10px] text-purple-400 hover:text-white flex items-center gap-1"
              title="Quitar prendas probadas y ver mi ropa actual"
            >
              <RotateCcw className="w-3 h-3" /> Restablecer
            </button>
          </div>

          <div className="relative">
            {/* Renderiza exactamente lo que el usuario está probándose */}
            <AvatarShowcase
              skin={previewSkin}
              aura={previewAura}
              petColor={user.pet_color}
              petName={user.pet_name || 'Ignis'}
            />

            {/* Herramientas laterales de la vitrina */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
              <button
                onClick={() => setPreviewAura(prev => prev === 'none' ? 'aura_shock' : 'none')}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition border ${
                  previewAura !== 'none'
                    ? 'bg-purple-600 text-white border-purple-400'
                    : 'bg-black/60 text-slate-400 border-white/10 hover:text-white'
                }`}
                title="Probar / Quitar Aura"
              >
                <Flame className="w-4 h-4 fill-current" />
              </button>

              <button
                onClick={() => {
                  const randomAura = catalog.auras[Math.floor(Math.random() * catalog.auras.length)]?.id || 'none';
                  const randomSkin = catalog.skins[Math.floor(Math.random() * catalog.skins.length)]?.id || 'default';
                  setPreviewAura(randomAura);
                  setPreviewSkin(randomSkin);
                }}
                className="w-8 h-8 rounded-lg bg-black/60 text-slate-400 border border-white/10 hover:text-white flex items-center justify-center transition"
                title="Probar combinación al azar"
              >
                <Dices className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="text-[11px] text-center text-slate-400 pt-1">
            {previewSkin !== (user.equipped_skin || 'default') || previewAura !== (user.equipped_aura || 'none') ? (
              <span className="text-amber-300 font-bold">✨ Estás probándote artículos no equipados</span>
            ) : (
              <span>Mostrando tu aspecto actual equipado</span>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};