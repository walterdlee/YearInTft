#!/usr/bin/env tsx
// Migration using @vercel/postgres

import { sql } from '@vercel/postgres'
import { readFileSync } from 'fs'
import { join } from 'path'

async function main() {
  try {
    console.log('Starting migration with @vercel/postgres...')

    const schemaPath = join(process.cwd(), 'lib', 'db', 'schema.sql')
    const schema = readFileSync(schemaPath, 'utf-8')

    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0)

    console.log(`Executing ${statements.length} statements...`)

    for (let i = 0; i < statements.length; i++) {
      console.log(`[${i + 1}/${statements.length}] Executing...`)
      await sql.query(statements[i])
      console.log(`[${i + 1}/${statements.length}] ✓`)
    }

    // Verify tables were created
    const tables = await sql.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
    `)
    console.log(`\nTables created: ${tables.rows.length}`)
    tables.rows.forEach((row: any) => console.log('  -', row.table_name))

    process.exit(0)
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

main()
