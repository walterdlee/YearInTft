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
    <section className="relative bg-gradient-to-br from-white/10 to-white/5 rounded-3xl p-10 border border-white/20 backdrop-blur-sm overflow-hidden">
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-tft-gold/10 rounded-full blur-3xl" />
      <div className="relative">
        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-tft-gold to-tft-purple bg-clip-text text-transparent">
          Your Favorite Items
        </h2>
        <p className="text-gray-400 mb-10 text-lg">The items you loved building this year</p>
      </div>

      <div className="relative flex flex-col gap-2">
        {items.map((item, index) => (
          <motion.div
            key={item.itemName}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="group relative bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-4 border border-white/20 hover:border-tft-gold/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-tft-gold/20 backdrop-blur-sm hover:z-10"
            style={{
              transform: `translateX(${index * 16}px)`,
              maxWidth: `calc(100% - ${index * 16}px)`
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-tft-gold/0 to-tft-gold/0 group-hover:from-tft-gold/10 group-hover:to-transparent rounded-xl transition-all duration-300" />
            <div className="relative flex items-center gap-4">
              {/* Item Image */}
              <div className="relative w-12 h-12 flex-shrink-0 rounded-lg border-2 border-tft-gold/30 overflow-hidden shadow-lg">
                <Image
                  src={getTftItemImage(item.itemName)}
                  alt={getItemName(item.itemName)}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="px-2 py-0.5 bg-gradient-to-r from-tft-gold/20 to-tft-gold/10 rounded-full border border-tft-gold/30">
                    <span className="text-tft-gold font-bold text-xs">#{index + 1}</span>
                  </div>
                  <h3 className="text-base font-bold bg-gradient-to-br from-white to-gray-200 bg-clip-text text-transparent truncate">
                    {getItemName(item.itemName)}
                  </h3>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <div className="bg-tft-purple/20 rounded px-2 py-1 border border-tft-purple/30">
                    <span className="font-bold text-tft-purple">{item.timesUsed}</span> <span className="text-gray-400">uses</span>
                  </div>
                  <div className="text-gray-400">
                    Avg: <span className="text-tft-lightBlue font-bold">{item.averagePlacement.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              {/* Visual Progress Bar */}
              <div className="flex-shrink-0 w-24 bg-white/10 rounded-full h-2 overflow-hidden shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((item.timesUsed / items[0].timesUsed) * 100, 100)}%` }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                  className="h-full bg-gradient-to-r from-tft-gold via-tft-lightBlue to-tft-purple shadow-lg"
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="relative mt-10 pt-8 border-t border-white/20"
      >
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-6 border border-white/20 text-center backdrop-blur-sm">
            <p className="text-gray-400 text-sm mb-3 uppercase tracking-wider">Most Used</p>
            <p className="text-xl font-bold bg-gradient-to-r from-tft-gold to-white bg-clip-text text-transparent">
              {getItemName(items[0].itemName)}
            </p>
          </div>
          <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-6 border border-white/20 text-center backdrop-blur-sm">
            <p className="text-gray-400 text-sm mb-3 uppercase tracking-wider">Total Uses</p>
            <p className="text-3xl font-bold text-tft-lightBlue">
              {items.reduce((sum, item) => sum + item.timesUsed, 0)}
            </p>
          </div>
          <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-6 border border-white/20 text-center backdrop-blur-sm">
            <p className="text-gray-400 text-sm mb-3 uppercase tracking-wider">Best Performance</p>
            <p className="text-xl font-bold bg-gradient-to-r from-tft-purple to-white bg-clip-text text-transparent">
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
