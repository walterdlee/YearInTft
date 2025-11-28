#!/usr/bin/env tsx
import { sql } from '../lib/db/client'

async function clearAllCache() {
  try {
    console.log('Clearing all cache tables...')

    // Clear summoners
    const r1 = await sql`DELETE FROM summoners`
    console.log(`✓ Cleared ${r1.rowCount || 0} entries from summoners`)

    // Clear riot_accounts
    const r2 = await sql`DELETE FROM riot_accounts`
    console.log(`✓ Cleared ${r2.rowCount || 0} entries from riot_accounts`)

    // Clear match_id_lists
    const r3 = await sql`DELETE FROM match_id_lists`
    console.log(`✓ Cleared ${r3.rowCount || 0} entries from match_id_lists`)

    // Clear league_entries
    const r4 = await sql`DELETE FROM league_entries`
    console.log(`✓ Cleared ${r4.rowCount || 0} entries from league_entries`)

    console.log('\n✅ All caches cleared!')
    process.exit(0)
  } catch (error) {
    console.error('Error clearing cache:', error)
    process.exit(1)
  }
}

clearAllCache()
