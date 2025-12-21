'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { UnitStats } from '@/types/stats'
import { getTftChampionImage, getTftItemImage } from '@/lib/dataDragon'

interface FavoriteChampionsSectionProps {
  favoriteUnits: UnitStats[]
}

export default function FavoriteChampionsSection({ favoriteUnits }: FavoriteChampionsSectionProps) {
  // Group units by set
  const unitsBySet = favoriteUnits.reduce((acc, unit) => {
    const setMatch = unit.unitId.match(/TFT(\d+)_/)
    const setNumber = setMatch ? setMatch[1] : 'Unknown'
    const setKey = `Set ${setNumber}`

    if (!acc[setKey]) {
      acc[setKey] = []
    }
    acc[setKey].push(unit)
    return acc
  }, {} as Record<string, UnitStats[]>)

  // Sort sets in descending order (newest first)
  const sortedSets = Object.entries(unitsBySet).sort(([a], [b]) => b.localeCompare(a))

  // Calculate top 5 across all sets
  const allSetsTop5 = [...favoriteUnits]
    .sort((a, b) => b.timesPlayed - a.timesPlayed)
    .slice(0, 5)

  // Create tab options: individual sets + "All Sets"
  const tabs = [
    { id: 'all', label: 'All Sets', units: allSetsTop5 },
    ...sortedSets.map(([setName, units]) => ({
      id: setName.toLowerCase().replace(' ', '-'),
      label: setName,
      units: units.slice(0, 5), // Top 5 from each set
    })),
  ]

  const [activeTab, setActiveTab] = useState(tabs[0].id)
  const currentTabData = tabs.find(tab => tab.id === activeTab)

  return (
    <section className="relative space-y-8 bg-gradient-to-br from-white/10 to-white/5 rounded-3xl p-10 border border-white/20 backdrop-blur-sm overflow-hidden">
      <div className="absolute top-0 left-0 w-64 h-64 bg-tft-purple/10 rounded-full blur-3xl" />
      <div className="relative">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-tft-purple to-tft-lightBlue bg-clip-text text-transparent">Your Favorite Champions</h2>
      </div>

      {/* Tabs */}
      <div className="relative flex flex-wrap gap-3">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-8 py-3 rounded-2xl font-semibold transition-all duration-300 overflow-hidden ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-tft-purple to-tft-lightBlue text-white shadow-lg shadow-tft-purple/50 scale-105'
                : 'bg-white/5 text-gray-300 border border-white/20 hover:border-tft-purple/50 hover:bg-white/10'
            }`}
          >
            <span className="relative z-10">{tab.label}</span>
            {activeTab === tab.id && (
              <div className="absolute inset-0 bg-gradient-to-r from-tft-purple/20 to-tft-lightBlue/20 animate-pulse" />
            )}
          </button>
        ))}
      </div>

      {/* Champion Cards */}
      <div className="relative">
        <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          {currentTabData?.label} - Top 5
        </h3>
        <div className="flex flex-col gap-2">
          {currentTabData?.units.map((unit, index) => (
            <div
              key={unit.unitId}
              className="group relative bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-4 border border-white/20 hover:border-tft-gold/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-tft-gold/20 backdrop-blur-sm hover:z-10"
              style={{
                transform: `translateX(${index * 16}px)`,
                maxWidth: `calc(100% - ${index * 16}px)`
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-tft-gold/0 to-tft-gold/0 group-hover:from-tft-gold/10 group-hover:to-transparent rounded-xl transition-all duration-300" />
              <div className="relative flex items-center gap-4">
                <div className="relative w-12 h-12 flex-shrink-0 overflow-hidden rounded-lg border-2 border-tft-gold/30 shadow-lg">
                  <div className="absolute -left-12 top-0 w-24 h-12">
                    <Image
                      src={getTftChampionImage(unit.unitId)}
                      alt={unit.name}
                      width={96}
                      height={48}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="px-2 py-0.5 bg-gradient-to-r from-tft-gold/20 to-tft-gold/10 rounded-full border border-tft-gold/30">
                      <span className="text-tft-gold font-bold text-xs">#{index + 1}</span>
                    </div>
                    <h3 className="text-base font-bold bg-gradient-to-br from-white to-gray-200 bg-clip-text text-transparent truncate">
                      {unit.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <div className="bg-tft-purple/20 rounded px-2 py-1 border border-tft-purple/30">
                      <span className="font-bold text-tft-purple">{unit.timesPlayed}</span> <span className="text-gray-400">games</span>
                    </div>
                    <div className="text-gray-400">
                      Avg: <span className="text-tft-lightBlue font-bold">{unit.averagePlacement.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
                {unit.favoriteItem && (
                  <div className="flex-shrink-0 flex flex-col items-center gap-1">
                    <div className="relative w-10 h-10 rounded-lg border border-tft-gold/30 overflow-hidden shadow-md">
                      <Image
                        src={getTftItemImage(unit.favoriteItem)}
                        alt="Favorite item"
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    </div>
                    <span className="text-[10px] text-gray-400">Top Item</span>
                  </div>
                )}
                <div className="flex-shrink-0 w-24 bg-white/10 rounded-full h-2 overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-tft-gold via-tft-lightBlue to-tft-purple shadow-lg transition-all duration-500"
                    style={{ width: `${Math.min((unit.timesPlayed / (currentTabData?.units[0].timesPlayed || 1)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
