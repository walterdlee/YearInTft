'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [summonerName, setSummonerName] = useState('')
  const [region, setRegion] = useState('na1')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!summonerName.trim()) return

    setLoading(true)

    try {
      // Validate summoner exists before redirecting
      const response = await fetch(
        `/api/riot/summoner?name=${encodeURIComponent(summonerName)}&region=${region}`
      )

      if (!response.ok) {
        alert('Summoner not found. Please check the name and region.')
        setLoading(false)
        return
      }

      // Summoner exists, redirect to wrapped page
      router.push(`/wrapped?summoner=${encodeURIComponent(summonerName)}&region=${region}`)
    } catch (error) {
      console.error('Error validating summoner:', error)
      alert('Failed to validate summoner. Please try again.')
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-tft-gold via-tft-lightBlue to-tft-purple bg-clip-text text-transparent">
            Year in TFT
          </h1>
          <p className="text-xl text-gray-300">
            Discover your TeamFight Tactics journey from the past year
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-12">
          <div className="space-y-2">
            <input
              type="text"
              value={summonerName}
              onChange={(e) => setSummonerName(e.target.value)}
              placeholder="Enter your Riot ID (e.g., GameName#NA1)"
              className="w-full px-6 py-4 text-lg rounded-lg bg-white/10 border border-white/20 focus:border-tft-gold focus:outline-none focus:ring-2 focus:ring-tft-gold/50 transition-all"
              disabled={loading}
            />
            <p className="text-sm text-gray-400 text-left">
              Use your Riot ID format: GameName#TAG (e.g., Doublelift#NA1)
            </p>
          </div>

          <div className="flex items-center justify-center gap-4">
            <label htmlFor="region" className="text-gray-300">
              Region:
            </label>
            <select
              id="region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:border-tft-gold focus:outline-none focus:ring-2 focus:ring-tft-gold/50 transition-all"
              disabled={loading}
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

          <button
            type="submit"
            disabled={loading || !summonerName.trim()}
            className="w-full px-8 py-4 text-lg font-semibold rounded-lg bg-gradient-to-r from-tft-gold to-tft-lightBlue hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
          >
            {loading ? 'Loading...' : 'View My Year in Review'}
          </button>
        </form>

        <div className="mt-16 text-sm text-gray-400">
          <p>Powered by Riot Games API</p>
        </div>
      </div>
    </main>
  )
}
