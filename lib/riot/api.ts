// Riot API utility functions

const RIOT_API_KEY = process.env.RIOT_API_KEY

if (!RIOT_API_KEY) {
  console.warn('RIOT_API_KEY is not set in environment variables')
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

async function riotFetch(url: string) {
  const response = await fetch(url, {
    headers: {
      'X-Riot-Token': RIOT_API_KEY || '',
    },
  })

  if (!response.ok) {
    throw new Error(`Riot API error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

export async function getSummonerByRiotId(region: string, gameName: string, tagLine: string) {
  // Use Account API to get PUUID from Riot ID
  const accountUrl = `${getRegionalUrl(region)}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`

  console.log(`[Riot API] Looking up: ${gameName}#${tagLine} in region ${region}`)
  console.log(`[Riot API] Account URL: ${accountUrl}`)

  const account = await riotFetch(accountUrl)

  // Then get summoner data using PUUID
  return getSummonerByPuuid(region, account.puuid)
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
  const url = `${getBaseUrl(region)}/tft/summoner/v1/summoners/by-puuid/${puuid}`
  return riotFetch(url)
}

export async function getMatchIdsByPuuid(region: string, puuid: string, count = 20) {
  const url = `${getRegionalUrl(region)}/tft/match/v1/matches/by-puuid/${puuid}/ids?count=${count}`
  return riotFetch(url)
}

export async function getMatchById(region: string, matchId: string) {
  const url = `${getRegionalUrl(region)}/tft/match/v1/matches/${matchId}`
  return riotFetch(url)
}

export async function getLeagueEntries(region: string, summonerId: string) {
  const url = `${getBaseUrl(region)}/tft/league/v1/entries/by-summoner/${summonerId}`
  return riotFetch(url)
}

// Helper to get matches within a date range
export async function getMatchesInDateRange(
  region: string,
  puuid: string,
  startDate: Date,
  endDate: Date
) {
  const matchIds = await getMatchIdsByPuuid(region, puuid, 100)
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
