'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import Image from 'next/image'
import type { YearlyStats } from '@/types/stats'
import FavoriteItems from '@/components/wrapped/FavoriteItems'
import { getTftChampionImage } from '@/lib/dataDragon'

function WrappedContent() {
  const searchParams = useSearchParams()
  const summoner = searchParams.get('summoner')
  const region = searchParams.get('region')

  const [stats, setStats] = useState<YearlyStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!summoner || !region) {
      setError('Missing summoner name or region')
      setLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch stats from the API
        const year = new Date().getFullYear()
        const response = await fetch(
          `/api/riot/stats?name=${encodeURIComponent(summoner)}&region=${region}&year=${year}`
        )

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
          throw new Error(errorData.error || `Failed to fetch stats: ${response.statusText}`)
        }

        const data: YearlyStats = await response.json()
        setStats(data)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch stats'
        setError(errorMessage)
        console.error('Error fetching stats:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [summoner, region])

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-tft-gold mx-auto"></div>
          <p className="text-xl">Loading your Year in TFT...</p>
        </div>
      </main>
    )
  }

  if (error || !stats) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-400">Error</h1>
          <p>{error || 'Failed to load stats'}</p>
          <a href="/" className="inline-block mt-4 px-6 py-3 bg-tft-gold rounded-lg hover:opacity-90">
            Go Back
          </a>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-tft-gold to-tft-lightBlue bg-clip-text text-transparent">
            {stats.summoner.name}&apos;s Year in TFT
          </h1>
          <p className="text-xl text-gray-300">Your 2025 TFT Journey</p>
        </div>

        {/* Overview Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Games Played"
            value={stats.overview.totalGames}
            subtitle={`${stats.overview.totalHoursPlayed} hours`}
          />
          <StatCard
            title="Average Placement"
            value={stats.overview.averagePlacement.toFixed(1)}
            subtitle="out of 8"
          />
          <StatCard
            title="Top 4 Rate"
            value={`${stats.overview.top4Rate}%`}
            subtitle={`${stats.overview.winRate}% win rate`}
          />
        </section>

        {/* Ranked Performance */}
        <section className="bg-white/5 rounded-xl p-8 border border-white/10">
          <h2 className="text-3xl font-bold mb-6 text-tft-gold">Ranked Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-400 mb-2">Current Rank</p>
              <p className="text-2xl font-bold">
                {stats.rankedPerformance.currentRank.tier} {stats.rankedPerformance.currentRank.division}
              </p>
              <p className="text-gray-300">{stats.rankedPerformance.currentRank.lp} LP</p>
            </div>
            <div>
              <p className="text-gray-400 mb-2">Peak Rank</p>
              <p className="text-2xl font-bold">
                {stats.rankedPerformance.peakRank.tier} {stats.rankedPerformance.peakRank.division}
              </p>
              <p className="text-gray-300">{stats.rankedPerformance.peakRank.lp} LP</p>
            </div>
          </div>
        </section>

        {/* Playstyle */}
        <section className="bg-white/5 rounded-xl p-8 border border-white/10">
          <h2 className="text-3xl font-bold mb-6 text-tft-lightBlue">Your Playstyle</h2>
          <div className="space-y-4">
            <div>
              <p className="text-gray-400">Economy Style</p>
              <p className="text-xl font-semibold">{stats.playstyle.economyStyle}</p>
            </div>
            <div>
              <p className="text-gray-400">Average Game Length</p>
              <p className="text-xl font-semibold">{stats.playstyle.averageGameLength} minutes</p>
            </div>
          </div>
        </section>

        {/* Favorite Champions */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-tft-purple">Your Favorite Champions</h2>
          {Object.entries(
            stats.playstyle.favoriteUnits.reduce((acc, unit) => {
              // Extract set number from unitId (e.g., "TFT15_Udyr.TFT_Set15" -> "15")
              const setMatch = unit.unitId.match(/TFT(\d+)_/)
              const setNumber = setMatch ? setMatch[1] : 'Unknown'
              const setKey = `Set ${setNumber}`

              if (!acc[setKey]) {
                acc[setKey] = []
              }
              acc[setKey].push(unit)
              return acc
            }, {} as Record<string, typeof stats.playstyle.favoriteUnits>)
          )
          .sort(([a], [b]) => b.localeCompare(a)) // Sort sets in descending order (newest first)
          .map(([setName, units]) => (
            <div key={setName} className="bg-white/5 rounded-xl p-8 border border-white/10">
              <h3 className="text-2xl font-bold mb-4 text-tft-lightBlue">{setName} - Top 5</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {units.map((unit, index) => (
                  <div
                    key={unit.unitId}
                    className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-tft-purple/50 transition-all"
                  >
                    <div className="flex items-center gap-4 mb-3">
                      <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg border-2 border-tft-purple/30">
                        <div className="absolute -left-16 top-0 w-32 h-16">
                          <Image
                            src={getTftChampionImage(unit.unitId)}
                            alt={unit.name}
                            width={128}
                            height={64}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h3 className="text-lg font-semibold">{unit.name}</h3>
                          <span className="text-tft-gold text-sm font-bold">
                            #{index + 1}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-400">
                        Unit ID: <span className="text-white font-semibold font-mono text-xs">{unit.unitId}</span>
                      </p>
                      <p className="text-gray-400">
                        Played: <span className="text-white font-semibold">{unit.timesPlayed}</span> times
                      </p>
                      <p className="text-gray-400">
                        Avg Place: <span className="text-white font-semibold">{unit.averagePlacement.toFixed(1)}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Favorite Items */}
        <FavoriteItems items={stats.playstyle.favoriteItems} />

        {/* Footer */}
        <div className="text-center pt-8">
          <a
            href="/"
            className="inline-block px-8 py-3 bg-gradient-to-r from-tft-gold to-tft-lightBlue rounded-lg hover:opacity-90 transition-all"
          >
            Search Another Player
          </a>
        </div>
      </div>
    </main>
  )
}

function StatCard({ title, value, subtitle }: { title: string; value: string | number; subtitle: string }) {
  return (
    <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-tft-gold/50 transition-all">
      <h3 className="text-gray-400 text-sm mb-2">{title}</h3>
      <p className="text-4xl font-bold mb-1">{value}</p>
      <p className="text-gray-400 text-sm">{subtitle}</p>
    </div>
  )
}

export default function WrappedPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-tft-gold mx-auto"></div>
            <p className="text-xl">Loading...</p>
          </div>
        </main>
      }
    >
      <WrappedContent />
    </Suspense>
  )
}
