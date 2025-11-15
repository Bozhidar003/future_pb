'use client'

import { useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import ProvablyFairModal from './ProvablyFairModal'

export default function StatsPanel() {
  const statistics = useGameStore((state) => state.statistics)
  const recentResults = useGameStore((state) => state.recentResults)
  const currentBet = useGameStore((state) => state.currentBet)
  const settings = useGameStore((state) => state.settings)

  const [showProvablyFairModal, setShowProvablyFairModal] = useState(false)

  // Prepare chart data
  const profitChartData = statistics.profitHistory.map((item, index) => ({
    bet: index + 1,
    profit: item.profit,
  }))

  // Prepare multiplier distribution data
  const multiplierData = Object.entries(statistics.multiplierHits)
    .map(([multiplier, count]) => ({
      multiplier: `${multiplier}x`,
      count,
    }))
    .sort((a, b) => parseFloat(a.multiplier) - parseFloat(b.multiplier))
    .slice(0, 10) // Show top 10

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-accent-gold">Statistics</h2>

      {/* Current Bet Info */}
      <div className="bg-gray-800 rounded-lg p-4 space-y-2">
        <h3 className="text-sm font-semibold text-gray-400 mb-2">Current Bet</h3>
        <div className="flex justify-between">
          <span className="text-sm text-gray-400">Bet Amount:</span>
          <span className="font-mono font-bold">${currentBet.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-400">Rows:</span>
          <span className="font-mono">{settings.rows}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-400">Risk:</span>
          <span className="font-mono capitalize">{settings.risk}</span>
        </div>
      </div>

      {/* Session Statistics */}
      <div className="bg-gray-800 rounded-lg p-4 space-y-2">
        <h3 className="text-sm font-semibold text-gray-400 mb-2">Session Stats</h3>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-xs text-gray-500">Total Bets</p>
            <p className="font-mono font-bold">{statistics.totalBets}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Win Rate</p>
            <p className="font-mono font-bold">{statistics.winRate.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Wagered</p>
            <p className="font-mono text-sm">${statistics.totalWagered.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Won</p>
            <p className="font-mono text-sm">${statistics.totalWon.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Biggest Win</p>
            <p className="font-mono text-sm text-green-400">
              ${statistics.biggestWin.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Biggest Loss</p>
            <p className="font-mono text-sm text-red-400">
              ${Math.abs(statistics.biggestLoss).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Profit Chart */}
      {profitChartData.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Profit Over Time</h3>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={profitChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="bet"
                stroke="#9ca3af"
                fontSize={10}
                tickFormatter={(value) => `#${value}`}
              />
              <YAxis stroke="#9ca3af" fontSize={10} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '4px',
                }}
                labelFormatter={(value) => `Bet #${value}`}
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Profit']}
              />
              <Line
                type="monotone"
                dataKey="profit"
                stroke="#00d4ff"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Multiplier Distribution */}
      {multiplierData.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Multiplier Hits</h3>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={multiplierData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="multiplier" stroke="#9ca3af" fontSize={10} />
              <YAxis stroke="#9ca3af" fontSize={10} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '4px',
                }}
              />
              <Bar dataKey="count" fill="#ffd700" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Results */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Recent Results</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {recentResults.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No bets yet</p>
          ) : (
            recentResults.map((result) => (
              <div
                key={result.id}
                className="flex items-center justify-between p-2 bg-gray-700 rounded text-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-gray-400">
                    ${result.betAmount.toFixed(2)}
                  </span>
                  <span className="text-xs">×</span>
                  <span
                    className={`font-mono font-bold ${
                      result.multiplier >= 10
                        ? 'text-accent-gold'
                        : result.multiplier >= 2
                        ? 'text-green-400'
                        : result.multiplier >= 1
                        ? 'text-yellow-400'
                        : 'text-red-400'
                    }`}
                  >
                    {result.multiplier}x
                  </span>
                </div>
                <div className="text-right">
                  <p
                    className={`font-mono font-bold ${
                      result.profit > 0 ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {result.profit > 0 ? '+' : ''}${result.profit.toFixed(2)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Provably Fair Info */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-400 mb-2">Provably Fair</h3>
        <button
          onClick={() => setShowProvablyFairModal(true)}
          className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
        >
          Verify Results
        </button>
      </div>

      {/* Provably Fair Modal */}
      <ProvablyFairModal
        isOpen={showProvablyFairModal}
        onClose={() => setShowProvablyFairModal(false)}
      />
    </div>
  )
}
