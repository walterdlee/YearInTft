import { NextRequest, NextResponse } from 'next/server'
import { getSummonerByName } from '@/lib/riot/api'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const name = searchParams.get('name')
  const region = searchParams.get('region') || 'na1'

  if (!name) {
    return NextResponse.json(
      { error: 'Summoner name is required' },
      { status: 400 }
    )
  }

  try {
    const summoner = await getSummonerByName(region, name)
    return NextResponse.json(summoner)
  } catch (error) {
    console.error('Error fetching summoner:', error)
    return NextResponse.json(
      { error: 'Failed to fetch summoner data' },
      { status: 500 }
    )
  }
}
