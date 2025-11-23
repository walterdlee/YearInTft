import { NextRequest, NextResponse } from 'next/server'
import { getMatchIdsByPuuid, getMatchById } from '@/lib/riot/api'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const puuid = searchParams.get('puuid')
  const region = searchParams.get('region') || 'na1'
  const count = parseInt(searchParams.get('count') || '20')

  if (!puuid) {
    return NextResponse.json(
      { error: 'PUUID is required' },
      { status: 400 }
    )
  }

  try {
    const matchIds = await getMatchIdsByPuuid(region, puuid, count)

    // Fetch detailed match data for each match ID
    const matches = await Promise.all(
      matchIds.map(matchId => getMatchById(region, matchId))
    )

    return NextResponse.json({ matches, count: matches.length })
  } catch (error) {
    console.error('Error fetching matches:', error)
    return NextResponse.json(
      { error: 'Failed to fetch match data' },
      { status: 500 }
    )
  }
}
