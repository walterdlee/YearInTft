#!/usr/bin/env tsx
// Database migration script
// Run with: npm run db:migrate
// Environment variables are loaded by dotenv-cli before this script runs

import { runMigrations } from '../lib/db/migrate'

async function main() {
  try {
    console.log('Starting database migration...')
    console.log('POSTGRES_URL:', process.env.POSTGRES_URL ? 'Set ✓' : 'Not set ✗')
    await runMigrations()
    console.log('Migration completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

main()
