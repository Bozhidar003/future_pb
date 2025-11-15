import { create } from 'zustand'
import type { GameState, BetResult, Ball } from '@/types/game'
import { generateServerSeed, generateClientSeed, hashSeed } from '@/utils/provablyFair'

const INITIAL_BALANCE = 1000
const MIN_BET = 0.1
const MAX_BET = 1000

const initialState: GameState = {
  balance: INITIAL_BALANCE,
  currentBet: 1,
  isPlaying: false,
  autoBetActive: false,
  autoBetConfig: {
    enabled: false,
    numberOfBets: 10,
    resetOnWin: false,
  },
  settings: {
    rows: 12,
    risk: 'medium',
    ballsAtOnce: 1,
    centerBias: 0,
    soundEnabled: true,
    soundVolume: 50,
    animationSpeed: 1,
  },
  statistics: {
    totalBets: 0,
    totalWagered: 0,
    totalWon: 0,
    netProfit: 0,
    biggestWin: 0,
    biggestLoss: 0,
    winRate: 0,
    multiplierHits: {},
    profitHistory: [],
  },
  recentResults: [],
  balls: [],
  seeds: {
    serverSeed: generateServerSeed(),
    serverSeedHash: '',
    clientSeed: generateClientSeed(),
    nonce: 0,
  },
}

// Initialize server seed hash
initialState.seeds.serverSeedHash = hashSeed(initialState.seeds.serverSeed)

interface GameActions {
  // Balance actions
  updateBalance: (amount: number) => void
  setCurrentBet: (amount: number) => void

  // Game flow actions
  startGame: () => void
  endGame: () => void

  // Ball management
  addBall: (ball: Ball) => void
  updateBall: (id: string, updates: Partial<Ball>) => void
  removeBall: (id: string) => void
  clearBalls: () => void

  // Results and statistics
  addResult: (result: BetResult) => void
  updateStatistics: (result: BetResult) => void

  // Settings
  updateSettings: (settings: Partial<GameState['settings']>) => void

  // Auto-bet
  setAutoBetActive: (active: boolean) => void
  updateAutoBetConfig: (config: Partial<GameState['autoBetConfig']>) => void

  // Seeds
  updateSeeds: (nonce: number) => void
  changeClientSeed: (newSeed: string) => void

  // Persistence
  initializeGame: () => void
  saveToLocalStorage: () => void
  resetGame: () => void
}

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  ...initialState,

  updateBalance: (amount) => {
    set((state) => ({
      balance: Math.max(0, state.balance + amount),
    }))
    get().saveToLocalStorage()
  },

  setCurrentBet: (amount) => {
    const clampedAmount = Math.max(MIN_BET, Math.min(MAX_BET, amount))
    set({ currentBet: clampedAmount })
  },

  startGame: () => {
    set({ isPlaying: true })
  },

  endGame: () => {
    set({ isPlaying: false })
  },

  addBall: (ball) => {
    set((state) => ({
      balls: [...state.balls, ball],
    }))
  },

  updateBall: (id, updates) => {
    set((state) => ({
      balls: state.balls.map((ball) =>
        ball.id === id ? { ...ball, ...updates } : ball
      ),
    }))
  },

  removeBall: (id) => {
    set((state) => ({
      balls: state.balls.filter((ball) => ball.id !== id),
    }))
  },

  clearBalls: () => {
    set({ balls: [] })
  },

  addResult: (result) => {
    set((state) => ({
      recentResults: [result, ...state.recentResults].slice(0, 20),
    }))
    get().updateStatistics(result)
    get().updateSeeds(result.seeds.nonce + 1)
    get().saveToLocalStorage()
  },

  updateStatistics: (result) => {
    set((state) => {
      const newTotalBets = state.statistics.totalBets + 1
      const newTotalWagered = state.statistics.totalWagered + result.betAmount
      const newTotalWon = state.statistics.totalWon + result.payout
      const newNetProfit = state.statistics.netProfit + result.profit

      const multiplierHits = { ...state.statistics.multiplierHits }
      multiplierHits[result.multiplier] = (multiplierHits[result.multiplier] || 0) + 1

      const profitHistory = [
        ...state.statistics.profitHistory,
        {
          timestamp: result.timestamp,
          profit: newNetProfit,
        },
      ].slice(-100) // Keep last 100 for chart

      return {
        statistics: {
          totalBets: newTotalBets,
          totalWagered: newTotalWagered,
          totalWon: newTotalWon,
          netProfit: newNetProfit,
          biggestWin: Math.max(state.statistics.biggestWin, result.profit),
          biggestLoss: Math.min(state.statistics.biggestLoss, result.profit),
          winRate: ((newTotalWon / newTotalWagered) * 100) || 0,
          multiplierHits,
          profitHistory,
        },
      }
    })
  },

  updateSettings: (settings) => {
    set((state) => ({
      settings: { ...state.settings, ...settings },
    }))
    get().saveToLocalStorage()
  },

  setAutoBetActive: (active) => {
    set({ autoBetActive: active })
  },

  updateAutoBetConfig: (config) => {
    set((state) => ({
      autoBetConfig: { ...state.autoBetConfig, ...config },
    }))
  },

  updateSeeds: (nonce) => {
    set((state) => ({
      seeds: { ...state.seeds, nonce },
    }))
  },

  changeClientSeed: (newSeed) => {
    const newServerSeed = generateServerSeed()
    set({
      seeds: {
        serverSeed: newServerSeed,
        serverSeedHash: hashSeed(newServerSeed),
        clientSeed: newSeed,
        nonce: 0,
      },
    })
    get().saveToLocalStorage()
  },

  initializeGame: () => {
    if (typeof window === 'undefined') return

    try {
      const savedData = localStorage.getItem('plinko-game-state')
      if (savedData) {
        const parsed = JSON.parse(savedData)
        set({
          balance: parsed.balance ?? INITIAL_BALANCE,
          settings: { ...initialState.settings, ...parsed.settings },
          statistics: { ...initialState.statistics, ...parsed.statistics },
          recentResults: parsed.recentResults ?? [],
          seeds: parsed.seeds ?? initialState.seeds,
        })
      }
    } catch (error) {
      console.error('Failed to load game state:', error)
    }
  },

  saveToLocalStorage: () => {
    if (typeof window === 'undefined') return

    try {
      const state = get()
      const dataToSave = {
        balance: state.balance,
        settings: state.settings,
        statistics: state.statistics,
        recentResults: state.recentResults,
        seeds: state.seeds,
      }
      localStorage.setItem('plinko-game-state', JSON.stringify(dataToSave))
    } catch (error) {
      console.error('Failed to save game state:', error)
    }
  },

  resetGame: () => {
    const newServerSeed = generateServerSeed()
    set({
      ...initialState,
      seeds: {
        serverSeed: newServerSeed,
        serverSeedHash: hashSeed(newServerSeed),
        clientSeed: generateClientSeed(),
        nonce: 0,
      },
    })
    get().saveToLocalStorage()
  },
}))
