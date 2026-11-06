export interface CharacterLayers {
  backpack?: string;
  body: string;
  pants?: string;
  clothes?: string;
  headwear?: string;
  eyes?: string;
  hair?: string;
}

export interface SkinDefinition {
  id: string;
  name: string;
  rarity: 'Común' | 'Extraño' | 'Legendario';
  price: number;
  layers: CharacterLayers;
}

export const SKINS_CATALOG = {
  base_character: {
    id: "base_default",
    name: "Qbit Clásico",
    rarity: "Común" as const,
    price: 0,
    layers: {
      backpack: "/assets/skins/base/backpack.png",
      body: "/assets/skins/base/body.png",
      pants: "/assets/skins/base/pants.png",
      clothes: "/assets/skins/base/shirt.png",
      headwear: "/assets/skins/base/cap.png"
    }
  },
  skins: [
    {
      id: "tanjiro_style",
      name: "Cazador de Demonios",
      rarity: "Legendario" as const,
      price: 4500,
      layers: {
        body: "/assets/body_base.png",
        hair: "/assets/hair_tanjiro.png",
        clothes: "/assets/shirt_tanjiro.png",
        pants: "/assets/pants_tanjiro.png"
      }
    },
    {
      id: "witch_purple",
      name: "Bruja Mística",
      rarity: "Extraño" as const,
      price: 2200,
      layers: {
        body: "/assets/body_base.png",
        headwear: "/assets/hat_witch_purple.png",
        clothes: "/assets/robe_witch_purple.png"
      }
    },
    {
      id: "black_cat",
      name: "Gato Oscuro",
      rarity: "Común" as const,
      price: 1300,
      layers: {
        body: "/assets/body_base.png",
        clothes: "/assets/suit_cat.png"
      }
    },
    {
      id: "mummy",
      name: "Momia Ancestral",
      rarity: "Legendario" as const,
      price: 3500,
      layers: {
        body: "/assets/body_base.png",
        clothes: "/assets/wraps_mummy.png"
      }
    },
    {
      id: "grim_reaper",
      name: "Espectro Sombrío",
      rarity: "Legendario" as const,
      price: 4500,
      layers: {
        body: "/assets/body_base.png",
        clothes: "/assets/cloak_reaper.png"
      }
    }
  ]
};

export const getSkinById = (skinId: string | undefined): SkinDefinition => {
  if (!skinId || skinId === 'base_default' || skinId === 'default') {
    return SKINS_CATALOG.base_character;
  }
  const found = SKINS_CATALOG.skins.find(s => s.id === skinId);
  return found || SKINS_CATALOG.base_character;
};