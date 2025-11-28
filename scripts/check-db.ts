#!/usr/bin/env tsx
// Check what tables exist in the database

import { sql } from '../lib/db/client'

async function main() {
  if (!sql) {
    console.error('Database not configured!')
    process.exit(1)
  }

  try {
    console.log('Checking database tables...')

    const result = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `

    console.log('Tables found:', result.rows.length)
    result.rows.forEach((row: any) => {
      console.log('  -', row.table_name)
    })

    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

main()
