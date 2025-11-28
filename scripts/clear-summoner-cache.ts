#!/usr/bin/env tsx
import { sql } from '../lib/db/client'

async function clearSummonerCache() {
  try {
    console.log('Clearing summoner cache...')

    const result = await sql`
      DELETE FROM summoners
    `

    console.log(`✓ Cleared ${result.rowCount || 0} summoner entries from cache`)
    process.exit(0)
  } catch (error) {
    console.error('Error clearing summoner cache:', error)
    process.exit(1)
  }
}

clearSummonerCache()
