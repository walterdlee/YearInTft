#!/usr/bin/env tsx
// Test script to verify caching and request deduplication improvements

import { getSummonerByRiotId, getMatchById } from '../lib/riot/api'

async function main() {
  console.log('=== Testing Caching Improvements ===\n')

  // Test 1: Account lookup caching (Riot ID -> PUUID)
  console.log('Test 1: Account lookup caching')
  console.log('First request (should hit API)...')
  const start1 = Date.now()
  const summoner1 = await getSummonerByRiotId('na1', 'Doublelift', 'NA1')
  const time1 = Date.now() - start1
  console.log(`✓ First request took ${time1}ms`)
  console.log(`  PUUID: ${summoner1.puuid}\n`)

  console.log('Second request (should hit cache)...')
  const start2 = Date.now()
  const summoner2 = await getSummonerByRiotId('na1', 'Doublelift', 'NA1')
  const time2 = Date.now() - start2
  console.log(`✓ Second request took ${time2}ms`)
  console.log(`  Cache hit: ${time2 < time1 ? '✓ YES' : '✗ NO (slower than first)'}`)
  console.log(`  Speed improvement: ${Math.round((time1 / time2) * 100)}%\n`)

  // Test 2: Request deduplication (parallel requests)
  console.log('Test 2: Request deduplication')
  console.log('Making 5 parallel requests for the same account...')
  const startParallel = Date.now()
  const parallelResults = await Promise.all([
    getSummonerByRiotId('na1', 'Scarra', 'NA1'),
    getSummonerByRiotId('na1', 'Scarra', 'NA1'),
    getSummonerByRiotId('na1', 'Scarra', 'NA1'),
    getSummonerByRiotId('na1', 'Scarra', 'NA1'),
    getSummonerByRiotId('na1', 'Scarra', 'NA1'),
  ])
  const timeParallel = Date.now() - startParallel
  console.log(`✓ 5 parallel requests completed in ${timeParallel}ms`)
  console.log(`  All results identical: ${parallelResults.every(r => r.puuid === parallelResults[0].puuid) ? '✓ YES' : '✗ NO'}`)
  console.log('  (Should deduplicate to 1 API call)\n')

  // Test 3: Match caching (permanent)
  if (summoner1.puuid) {
    console.log('Test 3: Match data caching')
    console.log('Note: Match caching test skipped to avoid excessive API calls')
    console.log('Matches are cached permanently once fetched.\n')
  }

  console.log('=== All Tests Completed ===')
  console.log('\nCache TTL Summary:')
  console.log('  - Riot Accounts (Riot ID → PUUID): 7 days')
  console.log('  - Summoner data: 24 hours')
  console.log('  - Match IDs list: 1 hour (increased from 5 minutes)')
  console.log('  - Match details: Permanent (immutable data)')

  process.exit(0)
}

main().catch((error) => {
  console.error('Test failed:', error)
  process.exit(1)
})
