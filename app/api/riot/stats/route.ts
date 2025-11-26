import { NextRequest, NextResponse } from 'next/server'
import { getSummonerByName, getMatchesInDateRange } from '@/lib/riot/api'
import { aggregateYearlyStats } from '@/lib/riot/stats-aggregator'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const name = searchParams.get('name')
  const region = searchParams.get('region') || 'na1'
  const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())

  if (!name) {
    return NextResponse.json(
      { error: 'Summoner name is required' },
      { status: 400 }
    )
  }

  try {
    // Get summoner data
    const summoner = await getSummonerByName(region, name)

    // Define date range for the year
    const startDate = new Date(year, 0, 1)
    const endDate = new Date(year, 11, 31, 23, 59, 59)

    // Fetch matches within the date range
    const matches = await getMatchesInDateRange(
      region,
      summoner.puuid,
      startDate,
      endDate
    )

    if (matches.length === 0) {
      return NextResponse.json(
        { error: 'No matches found for the specified year' },
        { status: 404 }
      )
    }

    // Aggregate stats
    const stats = aggregateYearlyStats(matches, summoner.puuid, summoner.riotId)

    // Add summoner info from API
    stats.summoner.level = summoner.summonerLevel
    stats.summoner.profileIconId = summoner.profileIconId

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error generating stats:', error)
    return NextResponse.json(
      { error: 'Failed to generate stats' },
      { status: 500 }
    )
  }
}
