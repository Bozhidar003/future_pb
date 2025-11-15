import type { RiskLevel, MultiplierSlot } from '@/types/game'

/**
 * Get multiplier values for each slot based on risk level and number of rows
 */
export function getMultipliers(rows: number, risk: RiskLevel): number[] {
  const numSlots = rows + 1

  // Different multiplier distributions based on risk
  const distributions = {
    low: generateLowRiskMultipliers(numSlots),
    medium: generateMediumRiskMultipliers(numSlots),
    high: generateHighRiskMultipliers(numSlots),
  }

  return distributions[risk]
}

/**
 * Low risk: Flatter distribution (0.5x - 10x)
 * Center slots have lower multipliers, edges have higher
 */
function generateLowRiskMultipliers(numSlots: number): number[] {
  const multipliers: number[] = []
  const mid = Math.floor(numSlots / 2)

  for (let i = 0; i < numSlots; i++) {
    const distance = Math.abs(i - mid)
    const normalized = distance / mid

    // Edge slots have higher multipliers (rare outcomes)
    if (normalized > 0.8) {
      multipliers.push(10)
    } else if (normalized > 0.6) {
      multipliers.push(5)
    } else if (normalized > 0.4) {
      multipliers.push(2)
    } else if (normalized > 0.2) {
      multipliers.push(1)
    } else {
      multipliers.push(0.5)
    }
  }

  return multipliers
}

/**
 * Medium risk: Moderate distribution (0.3x - 50x)
 * Center slots have lower multipliers, edges have higher
 */
function generateMediumRiskMultipliers(numSlots: number): number[] {
  const multipliers: number[] = []
  const mid = Math.floor(numSlots / 2)

  for (let i = 0; i < numSlots; i++) {
    const distance = Math.abs(i - mid)
    const normalized = distance / mid

    // Edge slots have higher multipliers (rare outcomes)
    if (normalized > 0.9) {
      multipliers.push(50)
    } else if (normalized > 0.7) {
      multipliers.push(20)
    } else if (normalized > 0.5) {
      multipliers.push(5)
    } else if (normalized > 0.3) {
      multipliers.push(1)
    } else if (normalized > 0.1) {
      multipliers.push(0.5)
    } else {
      multipliers.push(0.3)
    }
  }

  return multipliers
}

/**
 * High risk: Extreme distribution (0.2x - 1000x)
 * Center slots have lowest multipliers, edges have extreme high values
 */
function generateHighRiskMultipliers(numSlots: number): number[] {
  const multipliers: number[] = []
  const mid = Math.floor(numSlots / 2)

  for (let i = 0; i < numSlots; i++) {
    const distance = Math.abs(i - mid)
    const normalized = distance / mid

    // Extreme values at edges, low values at center
    if (i === 0 || i === numSlots - 1) {
      multipliers.push(1000) // Far edges
    } else if (normalized > 0.95) {
      multipliers.push(500)
    } else if (normalized > 0.8) {
      multipliers.push(100)
    } else if (normalized > 0.6) {
      multipliers.push(10)
    } else if (normalized > 0.4) {
      multipliers.push(2)
    } else if (normalized > 0.2) {
      multipliers.push(0.5)
    } else {
      multipliers.push(0.2) // Center slots
    }
  }

  return multipliers
}

/**
 * Get color for a multiplier value
 */
export function getMultiplierColor(multiplier: number): string {
  if (multiplier < 0.5) return '#ef4444' // Red - loss
  if (multiplier < 1) return '#f97316' // Orange - small loss
  if (multiplier <= 2) return '#fbbf24' // Yellow - small win
  if (multiplier <= 10) return '#a3e635' // Light green - medium win
  if (multiplier <= 100) return '#22c55e' // Green - big win
  return '#ffd700' // Gold - jackpot
}

/**
 * Get all slot information including positions
 */
export function getMultiplierSlots(
  rows: number,
  risk: RiskLevel,
  canvasWidth: number
): MultiplierSlot[] {
  const multipliers = getMultipliers(rows, risk)
  const numSlots = multipliers.length
  const slotWidth = canvasWidth / numSlots

  return multipliers.map((multiplier, index) => ({
    index,
    multiplier,
    color: getMultiplierColor(multiplier),
    x: index * slotWidth,
    width: slotWidth,
  }))
}

/**
 * Calculate payout based on bet amount and multiplier
 */
export function calculatePayout(betAmount: number, multiplier: number): number {
  return parseFloat((betAmount * multiplier).toFixed(2))
}
