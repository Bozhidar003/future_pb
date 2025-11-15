'use client'

import { useEffect } from 'react'
import GameBoard from '@/components/GameBoard'
import SettingsPanel from '@/components/SettingsPanel'
import StatsPanel from '@/components/StatsPanel'
import BalanceDisplay from '@/components/BalanceDisplay'
import { useGameStore } from '@/store/gameStore'

export default function Home() {
  const initializeGame = useGameStore((state) => state.initializeGame)

  useEffect(() => {
    // Initialize game state from localStorage
    initializeGame()
  }, [initializeGame])

  return (
    <main className="min-h-screen bg-background-primary text-white">
      {/* Header with Balance */}
      <header className="border-b border-gray-800 bg-background-secondary">
        <BalanceDisplay />
      </header>

      {/* Main Game Area */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)]">
        {/* Left Sidebar - Settings */}
        <aside className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-gray-800 bg-background-secondary p-4 overflow-y-auto">
          <SettingsPanel />
        </aside>

        {/* Center - Game Board */}
        <section className="flex-1 flex items-center justify-center p-4 bg-background-primary">
          <GameBoard />
        </section>

        {/* Right Sidebar - Statistics */}
        <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-gray-800 bg-background-secondary p-4 overflow-y-auto">
          <StatsPanel />
        </aside>
      </div>
    </main>
  )
}
