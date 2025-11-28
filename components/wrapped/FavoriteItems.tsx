'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import type { ItemStats } from '@/types/stats'
import { getTftItemImage, fetchTftItemData } from '@/lib/dataDragon'

interface FavoriteItemsProps {
  items: ItemStats[]
}

export default function FavoriteItems({ items }: FavoriteItemsProps) {
  const [itemData, setItemData] = useState<Record<string, { name: string }> | null>(null)

  useEffect(() => {
    fetchTftItemData()
      .then(data => setItemData(data))
      .catch(err => console.error('Failed to fetch item data:', err))
  }, [])

  if (!items || items.length === 0) {
    return null
  }

  // Get actual item name from Data Dragon data, fallback to formatted name
  const getItemName = (itemName: string): string => {
    if (itemData && itemData[itemName]) {
      return itemData[itemName].name
    }
    // Fallback to formatted name
    return itemName
      .replace('TFT_Item_', '')
      .replace('TFT', '')
      .replace(/_/g, ' ')
      .trim()
  }

  return (
    <section className="bg-white/5 rounded-xl p-8 border border-white/10">
      <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-tft-purple to-tft-lightBlue bg-clip-text text-transparent">
        Your Favorite Items
      </h2>
      <p className="text-gray-400 mb-8">The items you loved building this year</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, index) => (
          <motion.div
            key={item.itemName}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="bg-gradient-to-br from-white/10 to-white/5 rounded-lg p-6 border border-white/20 hover:border-tft-gold/50 transition-all hover:scale-105 transform"
          >
            <div className="flex items-start gap-4 mb-4">
              {/* Item Image */}
              <div className="relative w-12 h-12 flex-shrink-0 rounded-lg border-2 border-tft-gold/30 overflow-hidden">
                <Image
                  src={getTftItemImage(item.itemName)}
                  alt={getItemName(item.itemName)}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>

              <div className="flex-1">
                {/* Rank Badge */}
                <div className="flex items-start justify-between mb-2">
                  <div className="bg-tft-gold/20 text-tft-gold rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                    #{index + 1}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Avg. Placement</p>
                    <p className="text-lg font-bold text-tft-lightBlue">
                      {item.averagePlacement.toFixed(1)}
                    </p>
                  </div>
                </div>

                {/* Item Name */}
                <h3 className="text-lg font-bold text-white">
                  {getItemName(item.itemName)}
                </h3>
              </div>
            </div>

            {/* Usage Stats */}
            <div className="flex items-center gap-2 text-gray-300">
              <div className="bg-tft-purple/20 rounded px-3 py-1">
                <span className="text-sm">
                  <span className="font-bold text-tft-purple">{item.timesUsed}</span> uses
                </span>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="mt-4 w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((item.timesUsed / items[0].timesUsed) * 100, 100)}%` }}
                transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                className="h-full bg-gradient-to-r from-tft-gold to-tft-lightBlue"
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="mt-8 pt-6 border-t border-white/10"
      >
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-gray-400 text-sm mb-1">Most Used</p>
            <p className="text-lg font-bold text-tft-gold">
              {getItemName(items[0].itemName)}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Total Item Uses</p>
            <p className="text-lg font-bold text-tft-lightBlue">
              {items.reduce((sum, item) => sum + item.timesUsed, 0)}
            </p>
          </div>
          <div className="col-span-2 md:col-span-1">
            <p className="text-gray-400 text-sm mb-1">Best Performance</p>
            <p className="text-lg font-bold text-tft-purple">
              {getItemName(items.reduce((best, item) =>
                item.averagePlacement < best.averagePlacement ? item : best
              ).itemName)}
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
