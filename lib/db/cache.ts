import { sql, isDatabaseAvailable } from './client'

// Cache TTL settings (in milliseconds)
const TTL = {
  SUMMONER: 24 * 60 * 60 * 1000, // 24 hours
  MATCH_IDS: 5 * 60 * 1000, // 5 minutes
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
// CACHE CLEANUP
// ============================================

export async function cleanupExpiredCache(): Promise<void> {
  if (!isDatabaseAvailable()) return

  try {
    // Clean up old match ID lists (older than 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

    const result = await sql`
      DELETE FROM match_id_lists
      WHERE created_at < ${oneHourAgo}
    `

    if (result.rowCount && result.rowCount > 0) {
      console.log(`[Cache] Cleanup: Removed ${result.rowCount} expired match ID lists`)
    }
  } catch (error) {
    console.error('[Cache] Error during cleanup:', error)
  }
}
