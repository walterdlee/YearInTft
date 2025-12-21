'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { UnitStats } from '@/types/stats'
import { getTftChampionImage } from '@/lib/dataDragon'

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
    <section className="space-y-6">
      <h2 className="text-3xl font-bold text-tft-purple">Your Favorite Champions</h2>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-tft-purple text-white border-2 border-tft-purple'
                : 'bg-white/5 text-gray-300 border-2 border-white/10 hover:border-tft-purple/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Champion Cards */}
      <div className="bg-white/5 rounded-xl p-8 border border-white/10">
        <h3 className="text-2xl font-bold mb-4 text-tft-lightBlue">
          {currentTabData?.label} - Top 5
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentTabData?.units.map((unit, index) => (
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
    </section>
  )
}
