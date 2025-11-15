'use client'

import { useGameStore } from '@/store/gameStore'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function BalanceDisplay() {
  const balance = useGameStore((state) => state.balance)
  const netProfit = useGameStore((state) => state.statistics.netProfit)
  const [prevBalance, setPrevBalance] = useState(balance)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (balance !== prevBalance) {
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 300)
      setPrevBalance(balance)
    }
  }, [balance, prevBalance])

  const profitPercentage = netProfit !== 0 ? ((netProfit / 1000) * 100).toFixed(2) : '0.00'
  const isProfitable = netProfit > 0

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Balance */}
        <div className="flex items-center gap-4">
          <div>
            <p className="text-sm text-gray-400 mb-1">Balance</p>
            <motion.p
              className={`text-4xl font-bold font-mono ${isAnimating ? 'number-change' : ''}`}
              animate={isAnimating ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              ${balance.toFixed(2)}
            </motion.p>
          </div>
        </div>

        {/* Profit/Loss */}
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-sm text-gray-400 mb-1">Session P/L</p>
            <p
              className={`text-2xl font-bold font-mono ${
                isProfitable ? 'text-green-400' : netProfit < 0 ? 'text-red-400' : 'text-gray-400'
              }`}
            >
              {isProfitable ? '+' : ''}${netProfit.toFixed(2)}
              <span className="text-sm ml-2">
                ({isProfitable ? '+' : ''}{profitPercentage}%)
              </span>
            </p>
          </div>

          {/* Reset Button */}
          <button
            onClick={() => {
              if (confirm('Are you sure you want to reset the game? This will clear all statistics and reset your balance.')) {
                useGameStore.getState().resetGame()
              }
            }}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm"
            aria-label="Reset game"
          >
            Reset Game
          </button>
        </div>
      </div>
    </div>
  )
}
