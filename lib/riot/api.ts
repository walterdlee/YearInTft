// Riot API utility functions
import {
  getCachedMatch,
  cacheMatch,
  getCachedSummoner,
  cacheSummoner,
  getCachedMatchIds,
  cacheMatchIds,
  getCachedRiotAccount,
  cacheRiotAccount,
  getCachedLeagueEntries,
  cacheLeagueEntries,
} from '../db/cache'

const RIOT_API_KEY = process.env.RIOT_API_KEY

if (!RIOT_API_KEY) {
  console.warn('RIOT_API_KEY is not set in environment variables')
}

// Rate limiting configuration
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 1000 // Initial retry delay

// TODO: Remove this limit when production API key is obtained
const MAX_MATCHES_TO_FETCH = 50 // Temporary limit for dev API key

// ============================================
// REQUEST DEDUPLICATION
// ============================================
// Prevents multiple parallel requests for the same resource
// by caching in-flight promises and sharing their results

interface PendingRequest<T> {
  promise: Promise<T>
  timestamp: number
}

const pendingRequests = new Map<string, PendingRequest<any>>()
const PENDING_REQUEST_TTL = 30000 // 30 seconds

function createRequestKey(type: string, ...args: string[]): string {
  return `${type}:${args.join(':')}`
}

async function deduplicateRequest<T>(
  key: string,
  fetchFn: () => Promise<T>
): Promise<T> {
  // Check if there's already a pending request for this key
  const pending = pendingRequests.get(key)

  if (pending) {
    const age = Date.now() - pending.timestamp
    if (age < PENDING_REQUEST_TTL) {
      console.log(`[Dedup] Reusing in-flight request: ${key}`)
      return pending.promise
    } else {
      // Stale pending request, remove it
      pendingRequests.delete(key)
    }
  }

  // No pending request, create a new one
  console.log(`[Dedup] Creating new request: ${key}`)
  const promise = fetchFn()

  // Store the promise
  pendingRequests.set(key, {
    promise,
    timestamp: Date.now(),
  })

  // Clean up after the request completes (success or failure)
  promise
    .finally(() => {
      pendingRequests.delete(key)
    })

  return promise
}

// Base URLs for different API endpoints
const getBaseUrl = (region: string) => `https://${region}.api.riotgames.com`
const getRegionalUrl = (region: string) => {
  // Map platform routes to regional routes
  const regionalMapping: { [key: string]: string } = {
    na1: 'americas',
    br1: 'americas',
    la1: 'americas',
    la2: 'americas',
    euw1: 'europe',
    eun1: 'europe',
    tr1: 'europe',
    ru: 'europe',
    kr: 'asia',
    jp1: 'asia',
    oc1: 'sea',
  }
  return `https://${regionalMapping[region] || 'americas'}.api.riotgames.com`
}

// Simple sleep utility
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

async function riotFetch(url: string, retries = 0): Promise<any> {
  try {
    const response = await fetch(url, {
      headers: {
        'X-Riot-Token': RIOT_API_KEY || '',
      },
    })

    // Handle rate limiting
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After')
      const delayMs = retryAfter ? parseInt(retryAfter) * 1000 : RETRY_DELAY_MS * Math.pow(2, retries)

      if (retries < MAX_RETRIES) {
        console.log(`[Riot API] Rate limited. Retrying after ${delayMs}ms (attempt ${retries + 1}/${MAX_RETRIES})`)
        await sleep(delayMs)
        return riotFetch(url, retries + 1)
      }

      throw new Error(`Riot API error: 429 Too Many Requests (exceeded ${MAX_RETRIES} retries)`)
    }

    if (!response.ok) {
      throw new Error(`Riot API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  } catch (error) {
    // Retry on network errors
    if (retries < MAX_RETRIES && error instanceof TypeError) {
      const delayMs = RETRY_DELAY_MS * Math.pow(2, retries)
      console.log(`[Riot API] Network error. Retrying after ${delayMs}ms (attempt ${retries + 1}/${MAX_RETRIES})`)
      await sleep(delayMs)
      return riotFetch(url, retries + 1)
    }

    throw error
  }
}

export async function getSummonerByRiotId(region: string, gameName: string, tagLine: string) {
  const key = createRequestKey('riot-account', region, gameName, tagLine)

  return deduplicateRequest(key, async () => {
    // Check cache first for Riot ID -> PUUID mapping
    const cachedAccount = await getCachedRiotAccount(region, gameName, tagLine)

    let account: any

    if (cachedAccount) {
      account = cachedAccount
    } else {
      // Cache miss - fetch from Account API
      const accountUrl = `${getRegionalUrl(region)}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`

      console.log(`[Riot API] Looking up: ${gameName}#${tagLine} in region ${region}`)
      console.log(`[Riot API] Account URL: ${accountUrl}`)

      account = await riotFetch(accountUrl)

      // Store in cache for future requests
      await cacheRiotAccount(region, account.gameName, account.tagLine, account.puuid, account)
    }

    // Then get summoner data using PUUID (will use cache if available)
    const summoner = await getSummonerByPuuid(region, account.puuid)

    // Add the Riot ID to the summoner data
    const result = {
      ...summoner,
      gameName: account.gameName,
      tagLine: account.tagLine,
      riotId: `${account.gameName}#${account.tagLine}`
    }

    // Update summoner cache with Riot ID info
    await cacheSummoner(region, account.puuid, summoner, account.gameName, account.tagLine)

    return result
  })
}

export async function getSummonerByName(region: string, summonerName: string) {
  // Parse Riot ID format: GameName#TagLine
  // If no tag provided, default to region-specific tag
  const defaultTags: { [key: string]: string } = {
    na1: 'NA1',
    br1: 'BR1',
    la1: 'LA1',
    la2: 'LA2',
    euw1: 'EUW',
    eun1: 'EUNE',
    tr1: 'TR1',
    ru: 'RU',
    kr: 'KR',
    jp1: 'JP1',
    oc1: 'OCE',
  }

  let gameName: string
  let tagLine: string

  if (summonerName.includes('#')) {
    const parts = summonerName.split('#')
    gameName = parts[0].trim()
    tagLine = parts[1].trim()
  } else {
    gameName = summonerName.trim()
    tagLine = defaultTags[region] || 'NA1'
  }

  console.log(`[Riot API] Parsed summoner name: "${summonerName}" -> gameName: "${gameName}", tagLine: "${tagLine}"`)

  return getSummonerByRiotId(region, gameName, tagLine)
}

export async function getSummonerByPuuid(region: string, puuid: string) {
  const key = createRequestKey('summoner', region, puuid)

  return deduplicateRequest(key, async () => {
    // Check cache first
    const cached = await getCachedSummoner(region, puuid)
    if (cached) {
      return cached
    }

    // Cache miss - fetch from API
    // Use LoL summoner endpoint instead of TFT - summoner IDs are shared across games
    const url = `${getBaseUrl(region)}/lol/summoner/v4/summoners/by-puuid/${puuid}`
    const summoner = await riotFetch(url)

    // Store in cache for future requests
    await cacheSummoner(region, puuid, summoner)

    return summoner
  })
}

export async function getMatchIdsByPuuid(region: string, puuid: string, count = 20) {
  const key = createRequestKey('match-ids', region, puuid, count.toString())

  return deduplicateRequest(key, async () => {
    // Check cache first (1 hour TTL for year-in-review use case)
    const cached = await getCachedMatchIds(region, puuid)
    if (cached && cached.length >= count) {
      return cached.slice(0, count)
    }

    // Cache miss or insufficient cached IDs - fetch from API
    const url = `${getRegionalUrl(region)}/tft/match/v1/matches/by-puuid/${puuid}/ids?count=${count}`
    const matchIds = await riotFetch(url)

    // Store in cache for future requests
    await cacheMatchIds(region, puuid, matchIds)

    return matchIds
  })
}

export async function getMatchById(region: string, matchId: string) {
  const key = createRequestKey('match', region, matchId)

  return deduplicateRequest(key, async () => {
    // Check cache first - matches never change, so this is permanently cached
    const cached = await getCachedMatch(region, matchId)
    if (cached) {
      return cached
    }

    // Cache miss - fetch from API
    const url = `${getRegionalUrl(region)}/tft/match/v1/matches/${matchId}`
    const match = await riotFetch(url)

    // Store in cache forever (matches are immutable)
    await cacheMatch(region, matchId, match)

    return match
  })
}

export async function getLeagueEntries(region: string, puuid: string) {
  const key = createRequestKey('league-entries', region, puuid)

  return deduplicateRequest(key, async () => {
    // Check cache first
    const cached = await getCachedLeagueEntries(region, puuid)
    if (cached) {
      return cached
    }

    // Cache miss - fetch from API
    // Use the PUUID endpoint for TFT league entries
    const url = `${getBaseUrl(region)}/tft/league/v1/by-puuid/${puuid}`
    const leagueEntries = await riotFetch(url)

    // Store in cache for future requests
    await cacheLeagueEntries(region, puuid, leagueEntries)

    return leagueEntries
  })
}

// Helper to get matches within a date range
export async function getMatchesInDateRange(
  region: string,
  puuid: string,
  startDate: Date,
  endDate: Date
) {
  const matchIds = await getMatchIdsByPuuid(region, puuid, MAX_MATCHES_TO_FETCH)
  const matches = []

  for (const matchId of matchIds) {
    const match = await getMatchById(region, matchId)
    const matchDate = new Date(match.info.game_datetime)

    if (matchDate >= startDate && matchDate <= endDate) {
      matches.push(match)
    } else if (matchDate < startDate) {
      // Matches are returned in descending order, so we can break early
      break
    }
  }

  return matches
}
