import { sql } from './client'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function runMigrations() {
  if (!sql) {
    console.warn('[DB] Database not configured - skipping migrations')
    return
  }

  try {
    console.log('[DB] Running database migrations...')

    // Read schema file
    const schemaPath = join(process.cwd(), 'lib', 'db', 'schema.sql')
    const schema = readFileSync(schemaPath, 'utf-8')

    // Split schema into individual statements and execute them
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0)

    console.log(`[DB] Executing ${statements.length} SQL statements...`)

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      console.log(`[DB] Executing statement ${i + 1}/${statements.length}...`)
      try {
        // Use raw query for DDL statements
        const result = await sql.unsafe(statement)
        console.log(`[DB] ✓ Statement ${i + 1} executed successfully`)
      } catch (err) {
        console.error(`[DB] ✗ Statement ${i + 1} failed:`, err)
        throw err
      }
    }

    console.log('[DB] Migrations completed successfully')
  } catch (error) {
    console.error('[DB] Migration failed:', error)
    throw error
  }
}
