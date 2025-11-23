// Riot API Response Types

export interface Summoner {
  id: string;
  accountId: string;
  puuid: string;
  name: string;
  profileIconId: number;
  revisionDate: number;
  summonerLevel: number;
}

export interface Match {
  metadata: MatchMetadata;
  info: MatchInfo;
}

export interface MatchMetadata {
  data_version: string;
  match_id: string;
  participants: string[]; // PUUIDs
}

export interface MatchInfo {
  game_datetime: number;
  game_length: number;
  game_version: string;
  participants: Participant[];
  queue_id: number;
  tft_set_number: number;
}

export interface Participant {
  puuid: string;
  placement: number;
  level: number;
  time_eliminated: number;
  gold_left: number;
  total_damage_to_players: number;
  companion: Companion;
  traits: Trait[];
  units: Unit[];
}

export interface Companion {
  content_ID: string;
  skin_ID: number;
  species: string;
}

export interface Trait {
  name: string;
  num_units: number;
  style: number;
  tier_current: number;
  tier_total: number;
}

export interface Unit {
  character_id: string;
  itemNames: string[];
  name: string;
  rarity: number;
  tier: number;
}

export interface LeagueEntry {
  leagueId: string;
  summonerId: string;
  summonerName: string;
  queueType: string;
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  hotStreak: boolean;
  veteran: boolean;
  freshBlood: boolean;
  inactive: boolean;
}
