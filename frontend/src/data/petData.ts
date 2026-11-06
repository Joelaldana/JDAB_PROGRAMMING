export interface PetPalette { main: string; light: string; core: string; shadow: string }

export const PET_PALETTES: Record<string, PetPalette> = {
  orange:     { main: '#F97316', light: '#FDBA74', core: '#FEF3C7', shadow: '#9A3412' },
  pet_orange: { main: '#F97316', light: '#FDBA74', core: '#FEF3C7', shadow: '#9A3412' },
  pet_blue:   { main: '#06B6D4', light: '#A5F3FC', core: '#ECFEFF', shadow: '#155E75' },
  pet_green:  { main: '#10B981', light: '#A7F3D0', core: '#ECFDF5', shadow: '#065F46' },
  pet_purple: { main: '#A855F7', light: '#E9D5FF', core: '#FAF5FF', shadow: '#6B21A8' },
  pet_pink:   { main: '#EC4899', light: '#FBCFE8', core: '#FDF2F8', shadow: '#9D174D' },
};

export const getPalette = (c?: string): PetPalette => PET_PALETTES[c || 'orange'] || PET_PALETTES.orange;

export interface PetStage { level: 1 | 2 | 3 | 4; name: string; from: number; next: number | null; blurb: string }

export const PET_STAGES: PetStage[] = [
  { level: 1, name: 'Llama Chispa',   from: 1,  next: 4,    blurb: 'Una chispa tímida que sueña con crecer.' },
  { level: 2, name: 'Llama de Neón',  from: 4,  next: 8,    blurb: 'Brilla con destellos eléctricos.' },
  { level: 3, name: 'Flama Fénix',    from: 8,  next: 15,   blurb: 'Despliega sus alas ardientes.' },
  { level: 4, name: 'Titán Solar',    from: 15, next: null, blurb: 'Corona solar: la máxima evolución.' },
];

export const getStage = (streak: number): PetStage => {
  let s = PET_STAGES[0];
  for (const st of PET_STAGES) if (streak >= st.from) s = st;
  return s;
};
