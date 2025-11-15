'use client'

import { useGameStore } from '@/store/gameStore'
import { useState } from 'react'
import type { RiskLevel } from '@/types/game'

export default function SettingsPanel() {
  const settings = useGameStore((state) => state.settings)
  const balance = useGameStore((state) => state.balance)
  const currentBet = useGameStore((state) => state.currentBet)
  const isPlaying = useGameStore((state) => state.isPlaying)
  const autoBetActive = useGameStore((state) => state.autoBetActive)
  const autoBetConfig = useGameStore((state) => state.autoBetConfig)

  const updateSettings = useGameStore((state) => state.updateSettings)
  const setCurrentBet = useGameStore((state) => state.setCurrentBet)
  const setAutoBetActive = useGameStore((state) => state.setAutoBetActive)
  const updateAutoBetConfig = useGameStore((state) => state.updateAutoBetConfig)

  const [showAutoBetSettings, setShowAutoBetSettings] = useState(false)

  const handleBetChange = (value: string) => {
    const num = parseFloat(value)
    if (!isNaN(num) && num >= 0.1) {
      setCurrentBet(num)
    }
  }

  const handleQuickBet = (action: 'half' | 'double' | 'min' | 'max') => {
    switch (action) {
      case 'half':
        setCurrentBet(currentBet / 2)
        break
      case 'double':
        setCurrentBet(currentBet * 2)
        break
      case 'min':
        setCurrentBet(0.1)
        break
      case 'max':
        setCurrentBet(Math.min(balance, 1000))
        break
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-accent-blue">Game Settings</h2>

      {/* Rows */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Rows: <span className="text-accent-blue font-mono">{settings.rows}</span>
        </label>
        <input
          type="range"
          min="8"
          max="16"
          value={settings.rows}
          onChange={(e) => updateSettings({ rows: parseInt(e.target.value) })}
          disabled={isPlaying}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          aria-label="Number of rows"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>8</span>
          <span>16</span>
        </div>
      </div>

      {/* Risk Level */}
      <div>
        <label className="block text-sm font-medium mb-2">Risk Level</label>
        <div className="grid grid-cols-3 gap-2">
          {(['low', 'medium', 'high'] as RiskLevel[]).map((risk) => (
            <button
              key={risk}
              onClick={() => updateSettings({ risk })}
              disabled={isPlaying}
              className={`py-2 px-4 rounded-lg font-medium transition-all ${
                settings.risk === risk
                  ? 'bg-accent-blue text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-label={`${risk} risk level`}
              aria-pressed={settings.risk === risk}
            >
              {risk.charAt(0).toUpperCase() + risk.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Balls At Once */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Balls At Once: <span className="text-accent-blue font-mono">{settings.ballsAtOnce}</span>
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={settings.ballsAtOnce}
          onChange={(e) => updateSettings({ ballsAtOnce: parseInt(e.target.value) })}
          disabled={isPlaying}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          aria-label="Balls at once"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>1</span>
          <span>10</span>
        </div>
      </div>

      {/* Center Bias */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Center Bias:{' '}
          <span className="text-accent-blue font-mono">
            {settings.centerBias > 0 ? '+' : ''}{settings.centerBias}
          </span>
        </label>
        <input
          type="range"
          min="-5"
          max="5"
          value={settings.centerBias}
          onChange={(e) => updateSettings({ centerBias: parseInt(e.target.value) })}
          disabled={isPlaying}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          aria-label="Center bias"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Edges</span>
          <span>Neutral</span>
          <span>Center</span>
        </div>
      </div>

      {/* Bet Amount */}
      <div>
        <label className="block text-sm font-medium mb-2">Bet Amount</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-mono">$</span>
          <input
            type="number"
            min="0.1"
            max={Math.min(balance, 1000)}
            step="0.1"
            value={currentBet}
            onChange={(e) => handleBetChange(e.target.value)}
            disabled={isPlaying}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-8 py-3 font-mono text-lg focus:outline-none focus:border-accent-blue disabled:opacity-50"
            aria-label="Bet amount"
          />
        </div>

        {/* Quick Bet Buttons */}
        <div className="grid grid-cols-4 gap-2 mt-2">
          <button
            onClick={() => handleQuickBet('min')}
            disabled={isPlaying}
            className="py-1 px-2 bg-gray-700 hover:bg-gray-600 rounded text-sm disabled:opacity-50"
          >
            Min
          </button>
          <button
            onClick={() => handleQuickBet('half')}
            disabled={isPlaying}
            className="py-1 px-2 bg-gray-700 hover:bg-gray-600 rounded text-sm disabled:opacity-50"
          >
            ½
          </button>
          <button
            onClick={() => handleQuickBet('double')}
            disabled={isPlaying}
            className="py-1 px-2 bg-gray-700 hover:bg-gray-600 rounded text-sm disabled:opacity-50"
          >
            2×
          </button>
          <button
            onClick={() => handleQuickBet('max')}
            disabled={isPlaying}
            className="py-1 px-2 bg-gray-700 hover:bg-gray-600 rounded text-sm disabled:opacity-50"
          >
            Max
          </button>
        </div>
      </div>

      {/* Auto-Bet */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium">Auto-Bet</label>
          <button
            onClick={() => setShowAutoBetSettings(!showAutoBetSettings)}
            className="text-xs text-accent-blue hover:underline"
          >
            {showAutoBetSettings ? 'Hide' : 'Configure'}
          </button>
        </div>

        {showAutoBetSettings && (
          <div className="space-y-3 mb-3 p-3 bg-gray-800 rounded-lg">
            <div>
              <label className="text-xs text-gray-400">Number of Bets</label>
              <input
                type="number"
                min="1"
                value={autoBetConfig.numberOfBets === 'infinite' ? '' : autoBetConfig.numberOfBets}
                onChange={(e) => {
                  const val = parseInt(e.target.value)
                  updateAutoBetConfig({ numberOfBets: isNaN(val) ? 'infinite' : val })
                }}
                placeholder="Infinite"
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm mt-1"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400">Stop on Profit ($)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={autoBetConfig.stopOnProfit || ''}
                onChange={(e) => {
                  const val = parseFloat(e.target.value)
                  updateAutoBetConfig({ stopOnProfit: isNaN(val) ? undefined : val })
                }}
                placeholder="No limit"
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm mt-1"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400">Stop on Loss ($)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={autoBetConfig.stopOnLoss || ''}
                onChange={(e) => {
                  const val = parseFloat(e.target.value)
                  updateAutoBetConfig({ stopOnLoss: isNaN(val) ? undefined : val })
                }}
                placeholder="No limit"
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm mt-1"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="resetOnWin"
                checked={autoBetConfig.resetOnWin}
                onChange={(e) => updateAutoBetConfig({ resetOnWin: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="resetOnWin" className="text-xs text-gray-400">
                Reset bet on win
              </label>
            </div>
          </div>
        )}

        <button
          onClick={() => {
            if (autoBetActive) {
              setAutoBetActive(false)
            } else {
              updateAutoBetConfig({ enabled: true })
              setAutoBetActive(true)
            }
          }}
          disabled={isPlaying && !autoBetActive}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-all ${
            autoBetActive
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-yellow-600 hover:bg-yellow-700'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {autoBetActive ? 'Stop Auto-Bet' : 'Start Auto-Bet'}
        </button>
      </div>

      {/* Sound Settings */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">Sound</label>
          <button
            onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
            className={`px-3 py-1 rounded text-sm ${
              settings.soundEnabled ? 'bg-green-600' : 'bg-gray-700'
            }`}
          >
            {settings.soundEnabled ? 'On' : 'Off'}
          </button>
        </div>
        {settings.soundEnabled && (
          <input
            type="range"
            min="0"
            max="100"
            value={settings.soundVolume}
            onChange={(e) => updateSettings({ soundVolume: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            aria-label="Sound volume"
          />
        )}
      </div>
    </div>
  )
}
