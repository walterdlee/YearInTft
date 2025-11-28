#!/usr/bin/env tsx
// Test database connection and table creation

import { sql } from '../lib/db/client'

async function main() {
  if (!sql) {
    console.error('Database not configured!')
    process.exit(1)
  }

  try {
    console.log('Testing database connection...')
    console.log('POSTGRES_URL:', process.env.POSTGRES_URL ? 'Set' : 'Not set')

    // Try creating a simple test table
    console.log('Creating test table...')
    await sql`
      CREATE TABLE IF NOT EXISTS test_table (
        id SERIAL PRIMARY KEY,
        name TEXT
      )
    `
    console.log('✓ Test table created')

    // Check if it exists
    const result = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'test_table'
    `
    console.log('Test table found:', result.rows.length > 0 ? 'YES' : 'NO')

    // List all tables
    const allTables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `
    console.log('Total tables:', allTables.rows.length)
    allTables.rows.forEach((row: any) => console.log('  -', row.table_name))

    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

main()
