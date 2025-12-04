// Aggregated Statistics Types for Year in Review

export interface YearlyStats {
  summoner: {
    name: string;
    level: number;
    profileIconId: number;
  };
  overview: {
    totalGames: number;
    totalHoursPlayed: number;
    averagePlacement: number;
    top4Rate: number;
    winRate: number;
  };
  favoriteComps: CompStats[];
  rankedPerformance: RankedStats;
  playstyle: PlaystyleStats;
  achievements: Achievement[];
}

export interface CompStats {
  traits: string[];
  units: string[];
  gamesPlayed: number;
  averagePlacement: number;
  winRate: number;
}

export interface RankedStats {
  currentRank: {
    tier: string;
    division: string;
    lp: number;
  };
  peakRank: {
    tier: string;
    division: string;
    lp: number;
  };
  progression: RankProgression[];
  totalWins: number;
  totalLosses: number;
}

export interface RankProgression {
  date: string;
  tier: string;
  division: string;
  lp: number;
}

export interface PlaystyleStats {
  averageGameLength: number;
  mostPlayedSet: number;
  favoriteUnits: UnitStats[];
  favoriteTraits: TraitStats[];
  favoriteItems: ItemStats[];
}

export interface UnitStats {
  unitId: string;
  name: string;
  timesPlayed: number;
  averagePlacement: number;
}

export interface TraitStats {
  traitId: string;
  name: string;
  timesPlayed: number;
  averagePlacement: number;
}

export interface ItemStats {
  itemName: string;
  timesUsed: number;
  averagePlacement: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}
