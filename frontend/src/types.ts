export interface UserRealStats {
  missions_completed: number;
  streak_days: number;
  unlocked_achievements_count: number;
  coins: number;
  xp: number;
  level: number;
}

export interface UserRealProfile {
  id: number;
  username: string;
  stats: UserRealStats;
  equipped_skin: string;
  equipped_aura: string;
  pet_name: string;
  pet_color: string;
  equipped_achievements: string[];
  bio_signature: string;
}

export interface UserProfile {
  id: number;
  username: string;
  role: string;
  coins: number;
  xp: number;
  level: number;
  streak_days: number;
  pet_name: string;
  equipped_avatar: string;
  equipped_skin?: string;
  equipped_aura?: string;
  pet_color?: string;
  equipped_achievements?: string;
  bio_signature?: string;
}