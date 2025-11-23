import type { Match, Participant } from '@/types/riot'
import type { YearlyStats, CompStats, UnitStats, TraitStats, ItemStats } from '@/types/stats'

export function aggregateYearlyStats(
  matches: Match[],
  puuid: string,
  summonerName: string
): YearlyStats {
  // Filter matches for the specific player
  const playerMatches = matches.map(match => ({
    match,
    participant: match.info.participants.find(p => p.puuid === puuid)!,
  })).filter(m => m.participant)

  const totalGames = playerMatches.length
  const totalGameTime = playerMatches.reduce((sum, m) => sum + m.match.info.game_length, 0)

  // Calculate placements
  const placements = playerMatches.map(m => m.participant.placement)
  const averagePlacement = placements.reduce((a, b) => a + b, 0) / totalGames
  const top4Count = placements.filter(p => p <= 4).length
  const winCount = placements.filter(p => p === 1).length

  // Aggregate unit stats
  const unitCounts = new Map<string, { count: number; placements: number[] }>()
  playerMatches.forEach(({ participant }) => {
    participant.units.forEach(unit => {
      const existing = unitCounts.get(unit.character_id) || { count: 0, placements: [] }
      existing.count++
      existing.placements.push(participant.placement)
      unitCounts.set(unit.character_id, existing)
    })
  })

  const favoriteUnits: UnitStats[] = Array.from(unitCounts.entries())
    .map(([unitId, data]) => ({
      unitId,
      name: unitId.split('_').pop() || unitId,
      timesPlayed: data.count,
      averagePlacement: data.placements.reduce((a, b) => a + b, 0) / data.placements.length,
    }))
    .sort((a, b) => b.timesPlayed - a.timesPlayed)
    .slice(0, 5)

  // Aggregate trait stats
  const traitCounts = new Map<string, { count: number; placements: number[] }>()
  playerMatches.forEach(({ participant }) => {
    participant.traits.filter(t => t.style > 0).forEach(trait => {
      const existing = traitCounts.get(trait.name) || { count: 0, placements: [] }
      existing.count++
      existing.placements.push(participant.placement)
      traitCounts.set(trait.name, existing)
    })
  })

  const favoriteTraits: TraitStats[] = Array.from(traitCounts.entries())
    .map(([traitId, data]) => ({
      traitId,
      name: traitId,
      timesPlayed: data.count,
      averagePlacement: data.placements.reduce((a, b) => a + b, 0) / data.placements.length,
    }))
    .sort((a, b) => b.timesPlayed - a.timesPlayed)
    .slice(0, 5)

  // Aggregate item stats
  const itemCounts = new Map<string, { count: number; placements: number[] }>()
  playerMatches.forEach(({ participant }) => {
    participant.units.forEach(unit => {
      unit.itemNames.forEach(itemName => {
        const existing = itemCounts.get(itemName) || { count: 0, placements: [] }
        existing.count++
        existing.placements.push(participant.placement)
        itemCounts.set(itemName, existing)
      })
    })
  })

  const favoriteItems: ItemStats[] = Array.from(itemCounts.entries())
    .map(([itemName, data]) => ({
      itemName,
      timesUsed: data.count,
      averagePlacement: data.placements.reduce((a, b) => a + b, 0) / data.placements.length,
    }))
    .sort((a, b) => b.timesUsed - a.timesUsed)
    .slice(0, 5)

  // Determine economy style based on gold left
  const avgGoldLeft = playerMatches.reduce((sum, m) => sum + m.participant.gold_left, 0) / totalGames
  const economyStyle = avgGoldLeft > 15 ? 'Greedy' : avgGoldLeft > 5 ? 'Balanced' : 'Aggressive'

  // Find most played set
  const setCounts = new Map<number, number>()
  playerMatches.forEach(({ match }) => {
    const count = setCounts.get(match.info.tft_set_number) || 0
    setCounts.set(match.info.tft_set_number, count + 1)
  })
  const mostPlayedSet = Array.from(setCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 0

  return {
    summoner: {
      name: summonerName,
      level: 0, // Should be fetched from summoner data
      profileIconId: 0,
    },
    overview: {
      totalGames,
      totalHoursPlayed: Math.round(totalGameTime / 3600),
      averagePlacement: Math.round(averagePlacement * 10) / 10,
      top4Rate: Math.round((top4Count / totalGames) * 100),
      winRate: Math.round((winCount / totalGames) * 100),
    },
    favoriteComps: [], // TODO: Implement comp detection logic
    rankedPerformance: {
      currentRank: { tier: 'UNRANKED', division: '', lp: 0 },
      peakRank: { tier: 'UNRANKED', division: '', lp: 0 },
      progression: [],
      totalWins: winCount,
      totalLosses: totalGames - winCount,
    },
    playstyle: {
      averageGameLength: Math.round(totalGameTime / totalGames / 60),
      mostPlayedSet,
      favoriteUnits,
      favoriteTraits,
      favoriteItems,
      economyStyle,
    },
    achievements: [],
  }
}
