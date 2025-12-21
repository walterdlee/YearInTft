'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { fetchTftTacticianData } from '@/lib/dataDragon'

interface FavoriteLittleLegendProps {
  littleLegend: {
    tacticianId: number
    species: string
    timesUsed: number
  }
}

const DDRAGON_VERSION = '15.24.1'
const DDRAGON_BASE_URL = 'https://ddragon.leagueoflegends.com/cdn'

export default function FavoriteLittleLegend({ littleLegend }: FavoriteLittleLegendProps) {
  const [tacticianData, setTacticianData] = useState<Record<string, { name: string; image: { full: string } }> | null>(null)
  const [displayName, setDisplayName] = useState(littleLegend.species)
  const [imageUrl, setImageUrl] = useState('')

  useEffect(() => {
    console.log('Looking up tactician for item_ID:', littleLegend.tacticianId)
    fetchTftTacticianData()
      .then(data => {
        setTacticianData(data)
        // Look up the tactician by item_ID (convert number to string for JSON lookup)
        const tacticianKey = littleLegend.tacticianId.toString()
        const tactician = data[tacticianKey]

        console.log('Tactician lookup result:', {
          tacticianId: littleLegend.tacticianId,
          tacticianKey,
          found: !!tactician,
          tacticianName: tactician?.name,
          species: littleLegend.species,
          imageFile: tactician?.image.full
        })

        if (tactician) {
          setDisplayName(tactician.name)
          setImageUrl(`${DDRAGON_BASE_URL}/${DDRAGON_VERSION}/img/tft-tactician/${tactician.image.full}`)
        } else {
          console.warn(`Tactician not found for item_ID: ${littleLegend.tacticianId}`)
        }
      })
      .catch(err => {
        console.error('Failed to fetch tactician data:', err)
        // Keep using the fallback values
      })
  }, [littleLegend.tacticianId, littleLegend.species])

  return (
    <div className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-tft-purple/50 transition-all duration-300">
      <p className="text-gray-400 text-sm uppercase tracking-wider mb-4">Favorite Little Legend</p>
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0 rounded-xl overflow-hidden border-2 border-tft-purple/30 shadow-lg bg-gradient-to-br from-tft-purple/10 to-tft-lightBlue/10">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={displayName}
              width={120}
              height={120}
              className="object-contain"
              unoptimized
            />
          ) : (
            <div className="w-20 h-20 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tft-purple"></div>
            </div>
          )}
        </div>
        <div className="flex-1">
          <p className="text-2xl font-bold bg-gradient-to-r from-tft-purple to-white bg-clip-text text-transparent mb-1">
            {displayName}
          </p>
          <p className="text-sm text-gray-400">Used in {littleLegend.timesUsed} games</p>
        </div>
      </div>
    </div>
  )
}
