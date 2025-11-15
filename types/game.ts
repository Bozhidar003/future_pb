import type { Body } from 'matter-js'

export type RiskLevel = 'low' | 'medium' | 'high'

export interface GameSettings {
  rows: number // 8-16
  risk: RiskLevel
  ballsAtOnce: number // 1-10
  centerBias: number // -5 to +5
  soundEnabled: boolean
  soundVolume: number // 0-100
  animationSpeed: number // 0.5x - 2x
}

export interface AutoBetConfig {
  enabled: boolean
  numberOfBets: number | 'infinite'
  stopOnProfit?: number
  stopOnLoss?: number
  increaseOnLoss?: number // percentage
  resetOnWin: boolean
}

export interface BetResult {
  id: string
  timestamp: number
  betAmount: number
  multiplier: number
  payout: number
  profit: number
  slotIndex: number
  seeds: {
    serverSeed: string // hashed
    clientSeed: string
    nonce: number
  }
}

export interface SessionStatistics {
  totalBets: number
  totalWagered: number
  totalWon: number
  netProfit: number
  biggestWin: number
  biggestLoss: number
  winRate: number // percentage
  multiplierHits: Record<number, number> // multiplier -> count
  profitHistory: Array<{ timestamp: number; profit: number }>
}

export interface Ball {
  id: string
  body: Body // Matter.js body
  color: string
  betAmount: number
  active: boolean
  landed: boolean
  finalSlot?: number
}

export interface GameState {
  balance: number
  currentBet: number
  isPlaying: boolean
  autoBetActive: boolean
  autoBetConfig: AutoBetConfig
  settings: GameSettings
  statistics: SessionStatistics
  recentResults: BetResult[]
  balls: Ball[]
  seeds: {
    serverSeed: string
    serverSeedHash: string
    clientSeed: string
    nonce: number
  }
}

export interface MultiplierSlot {
  index: number
  multiplier: number
  color: string
  x: number
  width: number
}
