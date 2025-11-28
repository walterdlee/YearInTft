import { sql, isDatabaseAvailable } from './client'

// Cache TTL settings (in milliseconds)
const TTL = {
  SUMMONER: 24 * 60 * 60 * 1000, // 24 hours
  MATCH_IDS: 60 * 60 * 1000, // 1 hour (increased from 5 minutes for year-in-review)
  RIOT_ACCOUNT: 7 * 24 * 60 * 60 * 1000, // 7 days (Riot IDs rarely change)
  LEAGUE_ENTRIES: 60 * 60 * 1000, // 1 hour (ranked data changes frequently)
  // Matches never expire (games are immutable)
}

// ============================================
// MATCH CACHING
// ============================================

export async function getCachedMatch(region: string, matchId: string): Promise<any | null> {
  if (!isDatabaseAvailable()) return null

  try {
    const result = await sql`
      SELECT match_data
      FROM matches
      WHERE match_id = ${matchId} AND region = ${region}
    `

    if (result.rows && result.rows.length > 0) {
      console.log(`[Cache] Hit: Match ${matchId}`)
      return result.rows[0].match_data
    }

    console.log(`[Cache] Miss: Match ${matchId}`)
    return null
  } catch (error) {
    console.error(`[Cache] Error retrieving match ${matchId}:`, error)
    return null
  }
}

export async function cacheMatch(region: string, matchId: string, matchData: any): Promise<void> {
  if (!isDatabaseAvailable()) return

  try {
    const gameDatetime = new Date(matchData.info.game_datetime)

    await sql`
      INSERT INTO matches (match_id, region, match_data, game_datetime)
      VALUES (${matchId}, ${region}, ${JSON.stringify(matchData)}, ${gameDatetime.toISOString()})
      ON CONFLICT (match_id) DO NOTHING
    `

    console.log(`[Cache] Stored: Match ${matchId}`)
  } catch (error) {
    console.error(`[Cache] Error storing match ${matchId}:`, error)
  }
}

// ============================================
// SUMMONER CACHING
// ============================================

export async function getCachedSummoner(region: string, puuid: string): Promise<any | null> {
  if (!isDatabaseAvailable()) return null

  try {
    const result = await sql`
      SELECT summoner_data, updated_at
      FROM summoners
      WHERE puuid = ${puuid} AND region = ${region}
    `

    if (result.rows && result.rows.length > 0) {
      const cached = result.rows[0]
      const age = Date.now() - new Date(cached.updated_at).getTime()

      // Check if cache is still valid
      if (age < TTL.SUMMONER) {
        console.log(`[Cache] Hit: Summoner ${puuid} (age: ${Math.round(age / 1000 / 60)}m)`)
        return cached.summoner_data
      } else {
        console.log(`[Cache] Expired: Summoner ${puuid}`)
      }
    } else {
      console.log(`[Cache] Miss: Summoner ${puuid}`)
    }

    return null
  } catch (error) {
    console.error(`[Cache] Error retrieving summoner ${puuid}:`, error)
    return null
  }
}

export async function cacheSummoner(
  region: string,
  puuid: string,
  summonerData: any,
  gameName?: string,
  tagLine?: string
): Promise<void> {
  if (!isDatabaseAvailable()) return

  try {
    await sql`
      INSERT INTO summoners (puuid, region, summoner_data, game_name, tag_line, updated_at)
      VALUES (
        ${puuid},
        ${region},
        ${JSON.stringify(summonerData)},
        ${gameName || null},
        ${tagLine || null},
        NOW()
      )
      ON CONFLICT (puuid)
      DO UPDATE SET
        summoner_data = ${JSON.stringify(summonerData)},
        game_name = ${gameName || null},
        tag_line = ${tagLine || null},
        updated_at = NOW()
    `

    console.log(`[Cache] Stored: Summoner ${puuid}`)
  } catch (error) {
    console.error(`[Cache] Error storing summoner ${puuid}:`, error)
  }
}

// ============================================
// MATCH IDS CACHING
// ============================================

export async function getCachedMatchIds(region: string, puuid: string): Promise<string[] | null> {
  if (!isDatabaseAvailable()) return null

  try {
    const result = await sql`
      SELECT match_ids, created_at
      FROM match_id_lists
      WHERE puuid = ${puuid} AND region = ${region}
    `

    if (result.rows && result.rows.length > 0) {
      const cached = result.rows[0]
      const age = Date.now() - new Date(cached.created_at).getTime()

      // Check if cache is still valid
      if (age < TTL.MATCH_IDS) {
        console.log(`[Cache] Hit: Match IDs for ${puuid} (age: ${Math.round(age / 1000)}s)`)
        return cached.match_ids as string[]
      } else {
        console.log(`[Cache] Expired: Match IDs for ${puuid}`)
      }
    } else {
      console.log(`[Cache] Miss: Match IDs for ${puuid}`)
    }

    return null
  } catch (error) {
    console.error(`[Cache] Error retrieving match IDs for ${puuid}:`, error)
    return null
  }
}

export async function cacheMatchIds(region: string, puuid: string, matchIds: string[]): Promise<void> {
  if (!isDatabaseAvailable()) return

  try {
    await sql`
      INSERT INTO match_id_lists (puuid, region, match_ids, created_at)
      VALUES (${puuid}, ${region}, ${JSON.stringify(matchIds)}, NOW())
      ON CONFLICT (puuid, region)
      DO UPDATE SET
        match_ids = ${JSON.stringify(matchIds)},
        created_at = NOW()
    `

    console.log(`[Cache] Stored: Match IDs for ${puuid} (${matchIds.length} IDs)`)
  } catch (error) {
    console.error(`[Cache] Error storing match IDs for ${puuid}:`, error)
  }
}

// ============================================
// RIOT ACCOUNT CACHING
// ============================================

export async function getCachedRiotAccount(
  region: string,
  gameName: string,
  tagLine: string
): Promise<any | null> {
  if (!isDatabaseAvailable()) return null

  try {
    const result = await sql`
      SELECT puuid, account_data, updated_at
      FROM riot_accounts
      WHERE game_name = ${gameName}
        AND tag_line = ${tagLine}
        AND region = ${region}
    `

    if (result.rows && result.rows.length > 0) {
      const cached = result.rows[0]
      const age = Date.now() - new Date(cached.updated_at).getTime()

      // Check if cache is still valid
      if (age < TTL.RIOT_ACCOUNT) {
        console.log(
          `[Cache] Hit: Riot Account ${gameName}#${tagLine} (age: ${Math.round(age / 1000 / 60 / 60)}h)`
        )
        return {
          puuid: cached.puuid,
          ...cached.account_data,
        }
      } else {
        console.log(`[Cache] Expired: Riot Account ${gameName}#${tagLine}`)
      }
    } else {
      console.log(`[Cache] Miss: Riot Account ${gameName}#${tagLine}`)
    }

    return null
  } catch (error) {
    console.error(`[Cache] Error retrieving Riot Account ${gameName}#${tagLine}:`, error)
    return null
  }
}

export async function cacheRiotAccount(
  region: string,
  gameName: string,
  tagLine: string,
  puuid: string,
  accountData: any
): Promise<void> {
  if (!isDatabaseAvailable()) return

  try {
    await sql`
      INSERT INTO riot_accounts (game_name, tag_line, region, puuid, account_data, updated_at)
      VALUES (
        ${gameName},
        ${tagLine},
        ${region},
        ${puuid},
        ${JSON.stringify(accountData)},
        NOW()
      )
      ON CONFLICT (game_name, tag_line, region)
      DO UPDATE SET
        puuid = ${puuid},
        account_data = ${JSON.stringify(accountData)},
        updated_at = NOW()
    `

    console.log(`[Cache] Stored: Riot Account ${gameName}#${tagLine} -> ${puuid}`)
  } catch (error) {
    console.error(`[Cache] Error storing Riot Account ${gameName}#${tagLine}:`, error)
  }
}

// ============================================
// LEAGUE ENTRIES CACHING
// ============================================

export async function getCachedLeagueEntries(region: string, summonerId: string): Promise<any[] | null> {
  if (!isDatabaseAvailable()) return null

  try {
    const result = await sql`
      SELECT league_data, updated_at
      FROM league_entries
      WHERE summoner_id = ${summonerId} AND region = ${region}
    `

    if (result.rows && result.rows.length > 0) {
      const cached = result.rows[0]
      const age = Date.now() - new Date(cached.updated_at).getTime()

      // Check if cache is still valid
      if (age < TTL.LEAGUE_ENTRIES) {
        console.log(`[Cache] Hit: League Entries for ${summonerId} (age: ${Math.round(age / 1000 / 60)}m)`)
        return cached.league_data as any[]
      } else {
        console.log(`[Cache] Expired: League Entries for ${summonerId}`)
      }
    } else {
      console.log(`[Cache] Miss: League Entries for ${summonerId}`)
    }

    return null
  } catch (error) {
    console.error(`[Cache] Error retrieving league entries for ${summonerId}:`, error)
    return null
  }
}

export async function cacheLeagueEntries(
  region: string,
  summonerId: string,
  leagueData: any[]
): Promise<void> {
  if (!isDatabaseAvailable()) return

  try {
    await sql`
      INSERT INTO league_entries (summoner_id, region, league_data, updated_at)
      VALUES (${summonerId}, ${region}, ${JSON.stringify(leagueData)}, NOW())
      ON CONFLICT (summoner_id, region)
      DO UPDATE SET
        league_data = ${JSON.stringify(leagueData)},
        updated_at = NOW()
    `

    console.log(`[Cache] Stored: League Entries for ${summonerId}`)
  } catch (error) {
    console.error(`[Cache] Error storing league entries for ${summonerId}:`, error)
  }
}

// ============================================
// CACHE CLEANUP
// ============================================

export async function cleanupExpiredCache(): Promise<void> {
  if (!isDatabaseAvailable()) return

  try {
    // Clean up old match ID lists (older than 2 hours)
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()

    const result = await sql`
      DELETE FROM match_id_lists
      WHERE created_at < ${twoHoursAgo}
    `

    if (result.rowCount && result.rowCount > 0) {
      console.log(`[Cache] Cleanup: Removed ${result.rowCount} expired match ID lists`)
    }
  } catch (error) {
    console.error('[Cache] Error during cleanup:', error)
  }
}
