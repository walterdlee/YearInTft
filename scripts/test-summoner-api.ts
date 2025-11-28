#!/usr/bin/env tsx

const RIOT_API_KEY = process.env.RIOT_API_KEY

async function testSummonerAPI() {
  const region = 'na1'
  const gameName = 'jordan poole'
  const tagLine = 'sad'

  try {
    // First get the account (PUUID)
    console.log('1. Fetching account data...')
    const accountUrl = `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`
    console.log('URL:', accountUrl)

    const accountResponse = await fetch(accountUrl, {
      headers: { 'X-Riot-Token': RIOT_API_KEY || '' }
    })
    const account = await accountResponse.json()
    console.log('Account data:', JSON.stringify(account, null, 2))

    // Then get summoner data
    console.log('\n2. Fetching summoner data by PUUID...')
    const summonerUrl = `https://${region}.api.riotgames.com/tft/summoner/v1/summoners/by-puuid/${account.puuid}`
    console.log('URL:', summonerUrl)

    const summonerResponse = await fetch(summonerUrl, {
      headers: { 'X-Riot-Token': RIOT_API_KEY || '' }
    })
    const summoner = await summonerResponse.json()
    console.log('Summoner data:', JSON.stringify(summoner, null, 2))
    console.log('Fields:', Object.keys(summoner))
    console.log('Has id field?:', 'id' in summoner)

    if (summoner.id) {
      console.log('\n3. Fetching league entries...')
      const leagueUrl = `https://${region}.api.riotgames.com/tft/league/v1/entries/by-summoner/${summoner.id}`
      console.log('URL:', leagueUrl)

      const leagueResponse = await fetch(leagueUrl, {
        headers: { 'X-Riot-Token': RIOT_API_KEY || '' }
      })
      const leagues = await leagueResponse.json()
      console.log('League data:', JSON.stringify(leagues, null, 2))
    } else {
      console.log('\n❌ No summoner ID found - cannot fetch league entries')
    }

  } catch (error) {
    console.error('Error:', error)
  }
}

testSummonerAPI()
