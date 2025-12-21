'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface SearchHistory {
  summoner: string
  region: string
  timestamp: number
}

export default function Home() {
  const [summonerName, setSummonerName] = useState('')
  const [region, setRegion] = useState('na1')
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([])
  const router = useRouter()

  // Load search history from localStorage
  useEffect(() => {
    const history = localStorage.getItem('tft-search-history')
    if (history) {
      try {
        setSearchHistory(JSON.parse(history))
      } catch (e) {
        console.error('Failed to parse search history:', e)
      }
    }
  }, [])

  const saveToHistory = (summoner: string, region: string) => {
    const newEntry: SearchHistory = {
      summoner,
      region,
      timestamp: Date.now(),
    }

    // Remove duplicates and add new entry at the start
    const filtered = searchHistory.filter(
      (entry) => !(entry.summoner.toLowerCase() === summoner.toLowerCase() && entry.region === region)
    )
    const updated = [newEntry, ...filtered].slice(0, 5) // Keep only last 5

    setSearchHistory(updated)
    localStorage.setItem('tft-search-history', JSON.stringify(updated))
  }

  const clearHistory = () => {
    setSearchHistory([])
    localStorage.removeItem('tft-search-history')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!summonerName.trim()) return

    // Save to history before navigating
    saveToHistory(summonerName, region)

    // Directly redirect to wrapped page - validation happens there
    router.push(`/wrapped?summoner=${encodeURIComponent(summonerName)}&region=${region}`)
  }

  const handleHistoryClick = (summoner: string, region: string) => {
    saveToHistory(summoner, region)
    router.push(`/wrapped?summoner=${encodeURIComponent(summoner)}&region=${region}`)
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-8 overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0e1a] via-[#1a1f3a] to-[#0a0e1a]" />
        <div className="absolute top-0 -left-4 w-96 h-96 bg-tft-purple/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
        <div className="absolute top-0 -right-4 w-96 h-96 bg-tft-gold/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-tft-lightBlue/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />
      </div>

      <div className="max-w-2xl w-full space-y-12 text-center relative">
        <div className="space-y-6">
          <div className="inline-block">
            <h1 className="text-7xl md:text-8xl font-bold bg-gradient-to-r from-tft-gold via-tft-lightBlue to-tft-purple bg-clip-text text-transparent animate-gradient bg-300">
              Year in TFT
            </h1>
            <div className="h-1.5 bg-gradient-to-r from-transparent via-tft-gold to-transparent mt-6" />
          </div>
          <p className="text-2xl text-gray-300 font-light tracking-wide">
            Discover your TeamFight Tactics journey from the past year
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 mt-16">
          <div className="relative bg-gradient-to-br from-white/10 to-white/5 rounded-3xl p-8 border border-white/20 backdrop-blur-sm">
            <div className="absolute top-0 left-0 w-32 h-32 bg-tft-purple/10 rounded-full blur-2xl" />
            <div className="relative space-y-6">
              <div className="space-y-3">
                <input
                  type="text"
                  value={summonerName}
                  onChange={(e) => setSummonerName(e.target.value)}
                  placeholder="Enter your Riot ID (e.g., GameName#NA1)"
                  className="w-full px-8 py-5 text-lg rounded-2xl bg-white/10 border-2 border-white/20 focus:border-tft-gold focus:outline-none focus:ring-4 focus:ring-tft-gold/20 transition-all duration-300 placeholder:text-gray-500 hover:bg-white/15 backdrop-blur-sm"
                  autoFocus
                />
                <p className="text-sm text-gray-400 text-left px-2">
                  Use your Riot ID format: GameName#TAG (e.g., Doublelift#NA1)
                </p>
              </div>

              <div className="flex items-center justify-center gap-4">
                <label htmlFor="region" className="text-gray-300 font-medium">
                  Region:
                </label>
                <select
                  id="region"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="px-6 py-3 rounded-xl bg-white/10 border-2 border-white/20 focus:border-tft-gold focus:outline-none focus:ring-4 focus:ring-tft-gold/20 transition-all duration-300 hover:bg-white/15 backdrop-blur-sm cursor-pointer"
                >
                  <option value="na1">NA</option>
                  <option value="euw1">EUW</option>
                  <option value="eun1">EUNE</option>
                  <option value="kr">KR</option>
                  <option value="br1">BR</option>
                  <option value="jp1">JP</option>
                  <option value="la1">LAN</option>
                  <option value="la2">LAS</option>
                  <option value="oc1">OCE</option>
                  <option value="tr1">TR</option>
                  <option value="ru">RU</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={!summonerName.trim()}
            className="group relative w-full px-10 py-5 text-xl font-bold rounded-2xl bg-gradient-to-r from-tft-gold to-tft-lightBlue hover:shadow-2xl hover:shadow-tft-gold/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              View My Year in Review
              <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
            <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
          </button>
        </form>

        {/* Search History */}
        {searchHistory.length > 0 && (
          <div className="relative mt-12">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-300">Recent Searches</h3>
              <button
                onClick={clearHistory}
                className="text-sm text-gray-400 hover:text-red-400 transition-colors duration-200"
              >
                Clear History
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {searchHistory.map((entry, index) => (
                <button
                  key={`${entry.summoner}-${entry.region}-${index}`}
                  onClick={() => handleHistoryClick(entry.summoner, entry.region)}
                  className="group relative bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-4 border border-white/20 hover:border-tft-gold/50 transition-all duration-300 hover:scale-102 backdrop-blur-sm text-left"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-tft-gold/0 to-tft-gold/0 group-hover:from-tft-gold/10 group-hover:to-transparent rounded-2xl transition-all duration-300" />
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-tft-gold/20 to-tft-purple/20 flex items-center justify-center border border-tft-gold/30">
                        <svg className="w-5 h-5 text-tft-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-white">{entry.summoner}</p>
                        <p className="text-sm text-gray-400">{entry.region.toUpperCase()}</p>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-tft-gold group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-20 pt-8 border-t border-white/10">
          <p className="text-sm text-gray-400 font-light tracking-wide">Powered by Riot Games API</p>
        </div>
      </div>
    </main>
  )
}
