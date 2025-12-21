'use client'

import { useRef, useEffect, useState } from 'react'
import type { YearlyStats } from '@/types/stats'
import { getTftChampionImage, getTftItemImage, fetchTftTacticianData } from '@/lib/dataDragon'

const DDRAGON_VERSION = '15.24.1'
const DDRAGON_BASE_URL = 'https://ddragon.leagueoflegends.com/cdn'

interface ChristmasTreeGraphicProps {
  stats: YearlyStats
}

export default function ChristmasTreeGraphic({ stats }: ChristmasTreeGraphicProps) {
  const graphicRef = useRef<HTMLDivElement>(null)
  const [tacticianImageUrl, setTacticianImageUrl] = useState('')

  // Get top 3 champions and items for ornaments
  const topChampions = stats.playstyle.favoriteUnits.slice(0, 3)
  const topItems = stats.playstyle.favoriteItems.slice(0, 3)

  // Fetch tactician image
  useEffect(() => {
    if (stats.playstyle.favoriteLittleLegend) {
      fetchTftTacticianData()
        .then(data => {
          const tacticianKey = stats.playstyle.favoriteLittleLegend!.tacticianId.toString()
          const tactician = data[tacticianKey]
          if (tactician) {
            setTacticianImageUrl(`${DDRAGON_BASE_URL}/${DDRAGON_VERSION}/img/tft-tactician/${tactician.image.full}`)
          }
        })
        .catch(err => {
          console.error('Failed to fetch tactician data:', err)
        })
    }
  }, [stats.playstyle.favoriteLittleLegend])

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
            <div
              className="relative w-24 h-24"
              style={{
                animation: 'starGlow 2s ease-in-out infinite',
                filter: 'drop-shadow(0 0 30px rgba(255, 215, 0, 0.8)) drop-shadow(0 0 60px rgba(255, 215, 0, 0.4))',
              }}
            >
              {/* Platinum Rank Icon */}
              <img
                src="https://ddragon.leagueoflegends.com/cdn/15.23.1/img/tft-regalia/TFT_Regalia_Platinum.png"
                alt="Platinum Rank"
                className="w-full h-full object-contain"
                crossOrigin="anonymous"
              />
              {/* Star rays */}
              <div className="absolute inset-0 opacity-50">
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                  <div
                    key={angle}
                    className="absolute top-1/2 left-1/2 w-1 h-12 bg-gradient-to-t from-transparent to-yellow-300"
                    style={{
                      transform: `translate(-50%, -100%) rotate(${angle}deg)`,
                      transformOrigin: 'bottom center',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Christmas Tree */}
          <div className="absolute top-60 left-1/2 -translate-x-1/2">
            {/* Tree sections - creating a layered tree with 3 sections */}
            <div className="relative">
              {/* Top triangle - darkest layer (back) */}
              <div
                className="absolute left-1/2 -translate-x-1/2"
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: '82px solid transparent',
                  borderRight: '82px solid transparent',
                  borderBottom: '122px solid #234010',
                  filter: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.4))',
                }}
              />
              {/* Top triangle - main layer */}
              <div
                className="absolute left-1/2 -translate-x-1/2"
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: '80px solid transparent',
                  borderRight: '80px solid transparent',
                  borderBottom: '120px solid #2d5a1a',
                  filter: 'drop-shadow(0 0 30px rgba(45, 90, 26, 0.6))',
                }}
              />
              {/* Top triangle - bright highlights on left side */}
              <div
                className="absolute left-1/2 -translate-x-1/2 opacity-40"
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: '40px solid transparent',
                  borderRight: '40px solid transparent',
                  borderBottom: '60px solid #52a830',
                  clipPath: 'polygon(0% 100%, 50% 0%, 50% 100%)',
                }}
              />

              {/* Middle triangle - darkest layer (back) */}
              <div
                className="absolute left-1/2 -translate-x-1/2 top-20"
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: '112px solid transparent',
                  borderRight: '112px solid transparent',
                  borderBottom: '142px solid #1f3812',
                  filter: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.4))',
                }}
              />
              {/* Middle triangle - main layer */}
              <div
                className="absolute left-1/2 -translate-x-1/2 top-20"
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: '110px solid transparent',
                  borderRight: '110px solid transparent',
                  borderBottom: '140px solid #2f5218',
                  filter: 'drop-shadow(0 0 30px rgba(47, 82, 24, 0.6))',
                }}
              />
              {/* Middle triangle - bright highlights */}
              <div
                className="absolute left-1/2 -translate-x-1/2 top-20 opacity-40"
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: '55px solid transparent',
                  borderRight: '55px solid transparent',
                  borderBottom: '70px solid #5cb832',
                  clipPath: 'polygon(0% 100%, 50% 0%, 50% 100%)',
                }}
              />

              {/* Bottom triangle - darkest layer (back) */}
              <div
                className="absolute left-1/2 -translate-x-1/2 top-40"
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: '142px solid transparent',
                  borderRight: '142px solid transparent',
                  borderBottom: '162px solid #1a3010',
                  filter: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.4))',
                }}
              />
              {/* Bottom triangle - main layer */}
              <div
                className="absolute left-1/2 -translate-x-1/2 top-40"
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: '140px solid transparent',
                  borderRight: '140px solid transparent',
                  borderBottom: '160px solid #3a6b20',
                  filter: 'drop-shadow(0 0 30px rgba(58, 107, 32, 0.6))',
                }}
              />
              {/* Bottom triangle - bright highlights */}
              <div
                className="absolute left-1/2 -translate-x-1/2 top-40 opacity-40"
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: '70px solid transparent',
                  borderRight: '70px solid transparent',
                  borderBottom: '80px solid #66cc38',
                  clipPath: 'polygon(0% 100%, 50% 0%, 50% 100%)',
                }}
              />

              {/* Twinkling lights scattered on tree */}
              {[
                { top: '40px', left: '-30px', color: '#ffd700', delay: '0s' },
                { top: '60px', left: '35px', color: '#ff6b6b', delay: '0.5s' },
                { top: '100px', left: '-50px', color: '#4ecdc4', delay: '1s' },
                { top: '120px', left: '25px', color: '#ffd700', delay: '1.5s' },
                { top: '180px', left: '-70px', color: '#ff6b6b', delay: '2s' },
                { top: '200px', left: '55px', color: '#4ecdc4', delay: '0.3s' },
                { top: '240px', left: '-45px', color: '#ffd700', delay: '0.8s' },
                { top: '260px', left: '70px', color: '#ff6b6b', delay: '1.3s' },
                { top: '300px', left: '-90px', color: '#4ecdc4', delay: '1.8s' },
                { top: '320px', left: '40px', color: '#ffd700', delay: '2.3s' },
              ].map((light, i) => (
                <div
                  key={`light-${i}`}
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    top: light.top,
                    left: light.left,
                    backgroundColor: light.color,
                    boxShadow: `0 0 10px ${light.color}, 0 0 20px ${light.color}`,
                    animation: `twinkle 2s ease-in-out infinite`,
                    animationDelay: light.delay,
                  }}
                />
              ))}

              {/* Tree trunk with realistic wood texture */}
              <div
                className="absolute left-1/2 -translate-x-1/2 rounded-sm overflow-hidden"
                style={{
                  width: '44px',
                  height: '64px',
                  top: '340px',
                  background: 'linear-gradient(to right, #4a2f1a 0%, #5d3a22 20%, #6b4423 40%, #5d3a22 60%, #4a2f1a 100%)',
                  boxShadow: '0 6px 16px rgba(0, 0, 0, 0.6), inset -4px 0 8px rgba(0, 0, 0, 0.4), inset 4px 0 8px rgba(139, 90, 43, 0.3)',
                }}
              >
                {/* Wood grain lines */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: `
                      linear-gradient(90deg, transparent 48%, rgba(0,0,0,0.2) 49%, rgba(0,0,0,0.2) 51%, transparent 52%),
                      linear-gradient(90deg, transparent 20%, rgba(90, 56, 34, 0.3) 21%, transparent 22%)
                    `,
                  }}
                />
                {/* Top highlight */}
                <div
                  className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-b from-amber-900/30 to-transparent"
                />
              </div>

              {/* Present with Little Legend */}
              {stats.playstyle.favoriteLittleLegend && (
                <div
                  className="absolute left-1/2 -translate-x-1/2"
                  style={{
                    top: '395px',
                    animation: 'presentBounce 3s ease-in-out infinite',
                  }}
                >
                  {/* Gift Box */}
                  <div className="relative">
                    {/* Box body */}
                    <div
                      className="relative rounded-lg overflow-hidden"
                      style={{
                        width: '80px',
                        height: '65px',
                        background: 'linear-gradient(135deg, #c41e3a 0%, #8b1428 50%, #c41e3a 100%)',
                        boxShadow: `
                          0 8px 16px rgba(0, 0, 0, 0.4),
                          inset -4px -4px 12px rgba(0, 0, 0, 0.3),
                          inset 4px 4px 12px rgba(220, 50, 70, 0.4)
                        `,
                      }}
                    >
                      {/* Vertical ribbon */}
                      <div
                        className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400"
                        style={{
                          width: '16px',
                          boxShadow: 'inset -2px 0 4px rgba(0, 0, 0, 0.3), inset 2px 0 4px rgba(255, 255, 255, 0.4)',
                        }}
                      />
                      {/* Horizontal ribbon */}
                      <div
                        className="absolute top-1/2 -translate-y-1/2 left-0 right-0 bg-gradient-to-b from-yellow-400 via-yellow-300 to-yellow-400"
                        style={{
                          height: '16px',
                          boxShadow: 'inset 0 -2px 4px rgba(0, 0, 0, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.4)',
                        }}
                      />
                      {/* Ribbon center knot */}
                      <div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500"
                        style={{
                          width: '20px',
                          height: '20px',
                          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.4), inset -1px -1px 3px rgba(0, 0, 0, 0.2)',
                        }}
                      />
                    </div>

                    {/* Bow on top */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-1">
                      {/* Left bow loop */}
                      <div
                        className="rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500"
                        style={{
                          width: '24px',
                          height: '16px',
                          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3), inset -2px -2px 4px rgba(0, 0, 0, 0.2)',
                        }}
                      />
                      {/* Right bow loop */}
                      <div
                        className="rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500"
                        style={{
                          width: '24px',
                          height: '16px',
                          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3), inset -2px -2px 4px rgba(0, 0, 0, 0.2)',
                        }}
                      />
                    </div>

                    {/* Little Legend on top of box */}
                    {tacticianImageUrl && (
                      <div
                        className="absolute left-1/2 -translate-x-1/2"
                        style={{
                          top: '-55px',
                          filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
                        }}
                      >
                        <img
                          src={tacticianImageUrl}
                          alt="Favorite Little Legend"
                          className="w-20 h-20 object-contain"
                          crossOrigin="anonymous"
                          style={{
                            animation: 'tacticianBob 2s ease-in-out infinite',
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Champion Ornaments */}
              {topChampions.map((champion, index) => {
                const positions = [
                  { top: '50px', left: '-25px' },  // Top section, left side
                  { top: '130px', left: '45px' },   // Middle section, right side
                  { top: '250px', left: '-70px' },  // Bottom section, left side
                ]
                return (
                  <div
                    key={champion.unitId}
                    className="absolute"
                    style={{
                      ...positions[index],
                      animation: 'ornamentSwing 4s ease-in-out infinite',
                      animationDelay: `${index * 0.5}s`,
                    }}
                  >
                    {/* Hanging String */}
                    <div
                      className="absolute left-1/2 -translate-x-1/2 bg-gradient-to-b from-gray-400 to-gray-500"
                      style={{
                        width: '2px',
                        height: '18px',
                        top: '-18px',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.5)',
                      }}
                    />

                    {/* Ornament Cap */}
                    <div
                      className="absolute left-1/2 -translate-x-1/2 bg-gradient-to-b from-yellow-600 via-yellow-500 to-yellow-600 rounded-sm"
                      style={{
                        width: '16px',
                        height: '6px',
                        top: '-6px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.5)',
                      }}
                    />

                    {/* Ornament Ball */}
                    <div
                      className="relative w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 overflow-hidden"
                      style={{
                        boxShadow: `
                          0 0 30px rgba(255, 215, 0, 0.6),
                          0 0 60px rgba(255, 215, 0, 0.3),
                          inset -8px -8px 20px rgba(0, 0, 0, 0.4),
                          inset 8px 8px 20px rgba(255, 255, 255, 0.4),
                          0 4px 8px rgba(0, 0, 0, 0.3)
                        `,
                        border: '2px solid rgba(255, 215, 0, 0.5)',
                      }}
                    >
                      {/* Champion image with circular mask */}
                      <div className="absolute inset-1 rounded-full overflow-hidden">
                        <div className="absolute -left-14 top-0 w-28 h-16">
                          <img
                            src={getTftChampionImage(champion.unitId)}
                            alt={champion.name}
                            className="w-full h-full object-cover"
                            crossOrigin="anonymous"
                          />
                        </div>
                      </div>

                      {/* Glass shine effect - top left */}
                      <div
                        className="absolute rounded-full bg-gradient-to-br from-white via-white/60 to-transparent"
                        style={{
                          width: '28px',
                          height: '28px',
                          top: '6px',
                          left: '6px',
                          opacity: 0.8,
                        }}
                      />

                      {/* Secondary smaller shine */}
                      <div
                        className="absolute rounded-full bg-white/50"
                        style={{
                          width: '10px',
                          height: '10px',
                          top: '8px',
                          right: '12px',
                          opacity: 0.6,
                        }}
                      />

                      {/* Bottom shadow overlay for depth */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent rounded-full" />
                    </div>
                  </div>
                )
              })}

              {/* Item Ornaments */}
              {topItems.map((item, index) => {
                const positions = [
                  { top: '85px', left: '30px' },    // Top section, right side
                  { top: '180px', left: '-55px' },  // Middle section, left side
                  { top: '280px', left: '60px' },   // Bottom section, right side
                ]
                return (
                  <div
                    key={item.itemName}
                    className="absolute"
                    style={{
                      ...positions[index],
                      animation: 'ornamentSwing 4s ease-in-out infinite',
                      animationDelay: `${index * 0.7 + 0.3}s`,
                    }}
                  >
                    {/* Hanging String */}
                    <div
                      className="absolute left-1/2 -translate-x-1/2 bg-gradient-to-b from-gray-400 to-gray-500"
                      style={{
                        width: '2px',
                        height: '16px',
                        top: '-16px',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.5)',
                      }}
                    />

                    {/* Ornament Cap */}
                    <div
                      className="absolute left-1/2 -translate-x-1/2 bg-gradient-to-b from-cyan-600 via-cyan-500 to-cyan-600 rounded-sm"
                      style={{
                        width: '14px',
                        height: '5px',
                        top: '-5px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.5)',
                      }}
                    />

                    {/* Ornament Ball */}
                    <div
                      className="relative w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 via-cyan-500 to-blue-700 overflow-hidden"
                      style={{
                        boxShadow: `
                          0 0 30px rgba(78, 205, 196, 0.6),
                          0 0 60px rgba(78, 205, 196, 0.3),
                          inset -6px -6px 16px rgba(0, 0, 0, 0.4),
                          inset 6px 6px 16px rgba(255, 255, 255, 0.4),
                          0 4px 8px rgba(0, 0, 0, 0.3)
                        `,
                        border: '2px solid rgba(78, 205, 196, 0.5)',
                      }}
                    >
                      {/* Item image */}
                      <div className="absolute inset-1 rounded-full overflow-hidden flex items-center justify-center">
                        <img
                          src={getTftItemImage(item.itemName)}
                          alt={item.itemName}
                          className="w-11 h-11 object-contain"
                          crossOrigin="anonymous"
                        />
                      </div>

                      {/* Glass shine effect - top left */}
                      <div
                        className="absolute rounded-full bg-gradient-to-br from-white via-white/60 to-transparent"
                        style={{
                          width: '24px',
                          height: '24px',
                          top: '5px',
                          left: '5px',
                          opacity: 0.8,
                        }}
                      />

                      {/* Secondary smaller shine */}
                      <div
                        className="absolute rounded-full bg-white/50"
                        style={{
                          width: '8px',
                          height: '8px',
                          top: '7px',
                          right: '10px',
                          opacity: 0.6,
                        }}
                      />

                      {/* Bottom shadow overlay for depth */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent rounded-full" />
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
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(30)].map((_, i) => {
              const size = Math.random() * 4 + 2
              const left = Math.random() * 100
              const animationDuration = Math.random() * 3 + 2
              const delay = Math.random() * 5
              return (
                <div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    left: `${left}%`,
                    top: '-5%',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.4) 100%)',
                    boxShadow: '0 0 6px rgba(255, 255, 255, 0.8)',
                    animation: `snowfall ${animationDuration}s linear infinite, float ${3 + Math.random() * 2}s ease-in-out infinite`,
                    animationDelay: `${delay}s, ${delay}s`,
                  }}
                />
              )
            })}
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

        @keyframes snowfall {
          0% {
            transform: translateY(-5%) translateX(0);
          }
          100% {
            transform: translateY(105%) translateX(50px);
          }
        }

        @keyframes twinkle {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.3;
            transform: scale(0.8);
          }
        }

        @keyframes ornamentGlow {
          0%, 100% {
            transform: scale(1);
            filter: brightness(1);
          }
          50% {
            transform: scale(1.05);
            filter: brightness(1.2);
          }
        }

        @keyframes ornamentSwing {
          0%, 100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(-3deg);
          }
          75% {
            transform: rotate(3deg);
          }
        }

        @keyframes starGlow {
          0%, 100% {
            transform: rotate(0deg) scale(1);
          }
          50% {
            transform: rotate(5deg) scale(1.1);
          }
        }

        @keyframes presentBounce {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-4px);
          }
        }

        @keyframes tacticianBob {
          0%, 100% {
            transform: translateY(0px) rotate(-2deg);
          }
          50% {
            transform: translateY(-6px) rotate(2deg);
          }
        }
      `}</style>
    </section>
  )
}
