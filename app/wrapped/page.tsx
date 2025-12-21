'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import Image from 'next/image'
import type { YearlyStats } from '@/types/stats'
import FavoriteItems from '@/components/wrapped/FavoriteItems'
import FavoriteChampionsSection from '@/components/wrapped/FavoriteChampions'
import FavoriteLittleLegend from '@/components/wrapped/FavoriteLittleLegend'
import ChristmasTreeGraphic from '@/components/wrapped/ChristmasTreeGraphic'
import { getRankEmblemImage } from '@/lib/dataDragon'

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
    <main className="min-h-screen p-8 relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0e1a] via-[#1a1f3a] to-[#0a0e1a]" />
        <div className="absolute top-0 -left-4 w-96 h-96 bg-tft-purple/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
        <div className="absolute top-0 -right-4 w-96 h-96 bg-tft-gold/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-tft-lightBlue/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />
      </div>

      <div className="max-w-4xl mx-auto space-y-16 relative">
        {/* Header */}
        <div className="text-center space-y-6 pt-8">
          <div className="inline-block">
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-tft-gold via-tft-lightBlue to-tft-purple bg-clip-text text-transparent animate-gradient bg-300">
              {stats.summoner.name}
            </h1>
            <div className="h-1 bg-gradient-to-r from-transparent via-tft-gold to-transparent mt-4" />
          </div>
          <p className="text-2xl text-gray-300 font-light tracking-wide">Your 2025 TFT Journey</p>
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
        <section className="relative bg-gradient-to-br from-white/10 to-white/5 rounded-3xl p-10 border border-white/20 backdrop-blur-sm overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-tft-gold/10 rounded-full blur-3xl" />
          <div className="relative">
            <h2 className="text-4xl font-bold mb-10 bg-gradient-to-r from-tft-gold to-tft-lightBlue bg-clip-text text-transparent">Ranked Performance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="flex flex-col items-center text-center group">
                <p className="text-gray-400 mb-6 text-xs uppercase tracking-widest font-semibold">Current Rank</p>
                <div className="relative w-52 h-52 mb-6 transition-transform duration-300 group-hover:scale-110">
                  <div className="absolute inset-0 bg-gradient-to-br from-tft-gold/30 to-transparent rounded-full blur-2xl animate-pulse" />
                  <Image
                    src={getRankEmblemImage(stats.rankedPerformance.currentRank.tier)}
                    alt={`${stats.rankedPerformance.currentRank.tier} rank`}
                    width={208}
                    height={208}
                    className="relative w-full h-full object-contain drop-shadow-2xl"
                    unoptimized
                  />
                </div>
                <p className="text-4xl font-bold mb-2 bg-gradient-to-br from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                  {stats.rankedPerformance.currentRank.tier} {stats.rankedPerformance.currentRank.division}
                </p>
                <div className="px-6 py-2 bg-gradient-to-r from-tft-gold/20 to-tft-gold/10 rounded-full border border-tft-gold/30">
                  <p className="text-tft-gold text-xl font-bold">{stats.rankedPerformance.currentRank.lp} LP</p>
                </div>
              </div>
              <div className="flex flex-col items-center text-center group">
                <p className="text-gray-400 mb-6 text-xs uppercase tracking-widest font-semibold">Peak Rank</p>
                <div className="relative w-52 h-52 mb-6 transition-transform duration-300 group-hover:scale-110">
                  <div className="absolute inset-0 bg-gradient-to-br from-tft-purple/30 to-transparent rounded-full blur-2xl animate-pulse" />
                  <Image
                    src={getRankEmblemImage(stats.rankedPerformance.peakRank.tier)}
                    alt={`${stats.rankedPerformance.peakRank.tier} rank`}
                    width={208}
                    height={208}
                    className="relative w-full h-full object-contain drop-shadow-2xl"
                    unoptimized
                  />
                </div>
                <p className="text-4xl font-bold mb-2 bg-gradient-to-br from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                  {stats.rankedPerformance.peakRank.tier} {stats.rankedPerformance.peakRank.division}
                </p>
                <div className="px-6 py-2 bg-gradient-to-r from-tft-purple/20 to-tft-purple/10 rounded-full border border-tft-purple/30">
                  <p className="text-tft-lightBlue text-xl font-bold">{stats.rankedPerformance.peakRank.lp} LP</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Playstyle */}
        <section className="relative bg-gradient-to-br from-white/10 to-white/5 rounded-3xl p-10 border border-white/20 backdrop-blur-sm overflow-hidden">
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-tft-lightBlue/10 rounded-full blur-3xl" />
          <div className="relative">
            <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-tft-lightBlue to-tft-purple bg-clip-text text-transparent">Your Playstyle</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-tft-lightBlue/50 transition-all duration-300">
                <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Average Game Length</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-tft-lightBlue to-white bg-clip-text text-transparent">{stats.playstyle.averageGameLength} minutes</p>
              </div>
              {stats.playstyle.favoriteLittleLegend && (
                <FavoriteLittleLegend littleLegend={stats.playstyle.favoriteLittleLegend} />
              )}
            </div>
          </div>
        </section>

        {/* Favorite Champions */}
        <FavoriteChampionsSection favoriteUnits={stats.playstyle.favoriteUnits} />

        {/* Favorite Items */}
        <FavoriteItems items={stats.playstyle.favoriteItems} />

        {/* Christmas Tree Graphic */}
        <ChristmasTreeGraphic stats={stats} />

        {/* Footer */}
        <div className="text-center pt-8 pb-12">
          <a
            href="/"
            className="group inline-block relative px-10 py-4 bg-gradient-to-r from-tft-gold to-tft-lightBlue rounded-2xl hover:shadow-2xl hover:shadow-tft-gold/50 transition-all duration-300 hover:scale-105 font-semibold text-lg overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Search Another Player
            </span>
            <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
          </a>
        </div>
      </div>
    </main>
  )
}

function StatCard({ title, value, subtitle }: { title: string; value: string | number; subtitle: string }) {
  return (
    <div className="group relative bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-6 border border-white/20 hover:border-tft-gold/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-tft-gold/20 backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-tft-gold/0 to-tft-gold/0 group-hover:from-tft-gold/10 group-hover:to-transparent rounded-2xl transition-all duration-300" />
      <div className="relative">
        <h3 className="text-gray-400 text-sm mb-3 uppercase tracking-wider font-medium">{title}</h3>
        <p className="text-5xl font-bold mb-2 bg-gradient-to-br from-white to-gray-300 bg-clip-text text-transparent">{value}</p>
        <p className="text-tft-gold/80 text-sm font-medium">{subtitle}</p>
      </div>
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
