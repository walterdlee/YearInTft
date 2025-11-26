#!/usr/bin/env tsx
// Test script to demonstrate caching in action

import { getSummonerByName, getMatchIdsByPuuid, getMatchById } from '../lib/riot/api'

async function main() {
  try {
    console.log('='.repeat(60))
    console.log('CACHE TEST - Watch for [Cache] messages')
    console.log('='.repeat(60))
    console.log()

    const summonerName = 'Doublelift#NA1' // Change this to test with different summoner
    const region = 'na1'

    console.log(`Testing with summoner: ${summonerName}`)
    console.log()

    // First run - should be cache misses
    console.log('--- FIRST RUN (expect cache misses) ---')
    const summoner = await getSummonerByName(region, summonerName)
    console.log(`Found summoner: ${summoner.name} (Level ${summoner.summonerLevel})`)
    console.log()

    const matchIds = await getMatchIdsByPuuid(region, summoner.puuid, 5)
    console.log(`Found ${matchIds.length} recent matches`)
    console.log()

    console.log('Fetching first match details...')
    const match = await getMatchById(region, matchIds[0])
    console.log(`Match ${matchIds[0]}: ${match.info.tft_set_number} - ${new Date(match.info.game_datetime).toLocaleString()}`)
    console.log()

    // Second run - should hit cache
    console.log('--- SECOND RUN (expect cache hits!) ---')
    const summoner2 = await getSummonerByName(region, summonerName)
    console.log(`Found summoner: ${summoner2.name} (Level ${summoner2.summonerLevel})`)
    console.log()

    const matchIds2 = await getMatchIdsByPuuid(region, summoner2.puuid, 5)
    console.log(`Found ${matchIds2.length} recent matches`)
    console.log()

    console.log('Fetching first match details...')
    const match2 = await getMatchById(region, matchIds2[0])
    console.log(`Match ${matchIds2[0]}: ${match2.info.tft_set_number} - ${new Date(match2.info.game_datetime).toLocaleString()}`)
    console.log()

    console.log('='.repeat(60))
    console.log('TEST COMPLETE!')
    console.log('Notice the [Cache] Hit messages on the second run')
    console.log('This means NO API calls were made - everything from cache!')
    console.log('='.repeat(60))

    process.exit(0)
  } catch (error) {
    console.error('Test failed:', error)
    process.exit(1)
  }
}

main()
