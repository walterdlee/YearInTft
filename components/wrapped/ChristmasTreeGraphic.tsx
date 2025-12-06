'use client'

import { useRef } from 'react'
import type { YearlyStats } from '@/types/stats'
import { getTftChampionImage, getTftItemImage } from '@/lib/dataDragon'

interface ChristmasTreeGraphicProps {
  stats: YearlyStats
}

export default function ChristmasTreeGraphic({ stats }: ChristmasTreeGraphicProps) {
  const graphicRef = useRef<HTMLDivElement>(null)

  // Get top 3 champions and items for ornaments
  const topChampions = stats.playstyle.favoriteUnits.slice(0, 3)
  const topItems = stats.playstyle.favoriteItems.slice(0, 3)

  const generateImage = async (): Promise<Blob | null> => {
    if (!graphicRef.current) return null

    try {
      const html2canvas = (await import('html2canvas')).default

      // Skip external images entirely to avoid CORS issues
      // This will render everything except the champion/item/rank images
      const canvas = await html2canvas(graphicRef.current, {
        backgroundColor: '#0a0e1a',
        scale: 2,
        useCORS: false,
        allowTaint: false,
        logging: false,
        imageTimeout: 0,
        // Ignore all img elements to avoid CORS blocking
        ignoreElements: (element) => element.tagName === 'IMG',
      })

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob)
        }, 'image/png')
      })
    } catch (error) {
      console.error('Failed to generate image:', error)
      return null
    }
  }

  const handleDownload = async () => {
    const blob = await generateImage()
    if (!blob) return

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = `${stats.summoner.name}-year-in-tft-2025.png`
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleShareToInstagram = () => {
    alert(
      'To share on Instagram:\n\n' +
      '1. Long press the image above\n' +
      '2. Tap "Share"\n' +
      '3. Select Instagram\n' +
      '4. Share to your Story! 🎄'
    )
  }

  return (
    <section className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2 text-tft-gold">Share Your Year in TFT</h2>
        <p className="text-gray-400">Download and share your personalized graphic</p>
      </div>

      {/* Instagram Story Graphic - 9:16 aspect ratio (1080x1920) */}
      <div className="flex justify-center">
        <div
          ref={graphicRef}
          className="relative bg-gradient-to-b from-[#0a0e1a] via-[#1a1f3a] to-[#0a0e1a] rounded-lg overflow-hidden"
          style={{ width: '540px', height: '960px' }}
        >
          {/* Header */}
          <div className="absolute top-12 left-0 right-0 text-center z-10">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-tft-gold to-tft-lightBlue bg-clip-text text-transparent mb-2">
              {stats.summoner.name}
            </h1>
            <p className="text-xl text-gray-300">Year in TFT 2025</p>
          </div>

          {/* Peak Rank Star at top of tree */}
          <div className="absolute top-44 left-1/2 -translate-x-1/2 z-20">
            <div className="relative w-24 h-24">
              {/* Platinum Rank Icon */}
              <img
                src="https://ddragon.leagueoflegends.com/cdn/15.23.1/img/tft-regalia/TFT_Regalia_Platinum.png"
                alt="Platinum Rank"
                className="w-full h-full object-contain drop-shadow-lg"
                crossOrigin="anonymous"
              />
            </div>
          </div>

          {/* Christmas Tree */}
          <div className="absolute top-60 left-1/2 -translate-x-1/2">
            {/* Tree sections - creating a simple triangle tree with 3 layers */}
            <div className="relative">
              {/* Top triangle */}
              <div
                className="absolute left-1/2 -translate-x-1/2"
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: '80px solid transparent',
                  borderRight: '80px solid transparent',
                  borderBottom: '120px solid #2d5016',
                }}
              />

              {/* Middle triangle */}
              <div
                className="absolute left-1/2 -translate-x-1/2 top-20"
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: '110px solid transparent',
                  borderRight: '110px solid transparent',
                  borderBottom: '140px solid #3d6b1f',
                }}
              />

              {/* Bottom triangle */}
              <div
                className="absolute left-1/2 -translate-x-1/2 top-40"
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: '140px solid transparent',
                  borderRight: '140px solid transparent',
                  borderBottom: '160px solid #4d7f2a',
                }}
              />

              {/* Tree trunk */}
              <div
                className="absolute left-1/2 -translate-x-1/2 bg-[#6b4423] rounded"
                style={{
                  width: '40px',
                  height: '60px',
                  top: '340px',
                }}
              />

              {/* Champion Ornaments */}
              {topChampions.map((champion, index) => {
                const positions = [
                  { top: '80px', left: '-40px' },
                  { top: '80px', left: '40px' },
                  { top: '160px', left: '0px' },
                ]
                return (
                  <div
                    key={champion.unitId}
                    className="absolute"
                    style={positions[index]}
                  >
                    <div className="relative w-14 h-14 rounded-full border-4 border-tft-gold bg-white/10 backdrop-blur overflow-hidden shadow-lg">
                      <div className="absolute -left-14 top-0 w-28 h-14">
                        <img
                          src={getTftChampionImage(champion.unitId)}
                          alt={champion.name}
                          className="w-full h-full object-cover"
                          crossOrigin="anonymous"
                        />
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Item Ornaments */}
              {topItems.map((item, index) => {
                const positions = [
                  { top: '140px', left: '-60px' },
                  { top: '140px', left: '60px' },
                  { top: '220px', left: '-40px' },
                ]
                return (
                  <div
                    key={item.itemName}
                    className="absolute"
                    style={positions[index]}
                  >
                    <div className="relative w-12 h-12 rounded-full border-4 border-tft-lightBlue bg-white/10 backdrop-blur overflow-hidden shadow-lg">
                      <img
                        src={getTftItemImage(item.itemName)}
                        alt={item.itemName}
                        className="w-full h-full object-cover"
                        crossOrigin="anonymous"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Stats Summary at bottom */}
          <div className="absolute bottom-16 left-0 right-0 px-12">
            <div className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-tft-gold">{stats.overview.totalGames}</p>
                  <p className="text-sm text-gray-400">Games</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-tft-lightBlue">{stats.overview.top4Rate}%</p>
                  <p className="text-sm text-gray-400">Top 4</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-tft-purple">{stats.overview.averagePlacement}</p>
                  <p className="text-sm text-gray-400">Avg Place</p>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative snow/particles */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white/30 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-4">
        <button
          onClick={handleDownload}
          className="px-8 py-3 bg-gradient-to-r from-tft-gold to-tft-lightBlue rounded-lg hover:opacity-90 transition-all font-semibold"
        >
          Download Graphic
        </button>
        <button
          onClick={handleShareToInstagram}
          className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg hover:opacity-90 transition-all font-semibold flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
          How to Share
        </button>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
    </section>
  )
}
