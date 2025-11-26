-- TFT Match Caching Schema
-- This schema is optimized for caching Riot API responses

-- Matches table - stores complete match data (immutable, cached forever)
CREATE TABLE IF NOT EXISTS matches (
  match_id TEXT PRIMARY KEY,
  region TEXT NOT NULL,
  match_data JSONB NOT NULL,
  game_datetime TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for querying matches by date range
CREATE INDEX IF NOT EXISTS idx_matches_game_datetime ON matches(game_datetime);
CREATE INDEX IF NOT EXISTS idx_matches_region ON matches(region);

-- Summoners table - caches summoner lookups by PUUID (moderate TTL)
CREATE TABLE IF NOT EXISTS summoners (
  puuid TEXT PRIMARY KEY,
  region TEXT NOT NULL,
  summoner_data JSONB NOT NULL,
  game_name TEXT,
  tag_line TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for looking up summoners by Riot ID
CREATE INDEX IF NOT EXISTS idx_summoners_riot_id ON summoners(game_name, tag_line);
CREATE INDEX IF NOT EXISTS idx_summoners_region ON summoners(region);

-- Match IDs cache - stores lists of match IDs for players (short TTL)
CREATE TABLE IF NOT EXISTS match_id_lists (
  puuid TEXT NOT NULL,
  region TEXT NOT NULL,
  match_ids JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (puuid, region)
);

-- Index for cleaning up old match_id_lists
CREATE INDEX IF NOT EXISTS idx_match_id_lists_created_at ON match_id_lists(created_at);
