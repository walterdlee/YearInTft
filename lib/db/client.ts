import { sql as vercelSql } from '@vercel/postgres'

// Export the sql client from @vercel/postgres
export const sql = vercelSql

// Helper to check if database is available
export function isDatabaseAvailable(): boolean {
  return !!process.env.POSTGRES_URL
}
