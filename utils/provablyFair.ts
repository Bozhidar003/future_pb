/**
 * Generate a random server seed
 */
export function generateServerSeed(): string {
  // Use Web Crypto API for browser
  const array = new Uint8Array(32)
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array)
  } else {
    // Fallback for environments without crypto
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256)
    }
  }
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Generate a random client seed
 */
export function generateClientSeed(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 15)
  return `${timestamp}-${random}`
}

/**
 * Hash a seed using a simple hash function (for demo purposes)
 * In production, use proper SHA-256 via Web Crypto API
 */
export function hashSeed(seed: string): string {
  // Simple hash function for demo
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(16).padStart(16, '0')
}

/**
 * Generate a deterministic random number between 0 and 1
 * using server seed, client seed, and nonce
 */
export function generateRandomNumber(
  serverSeed: string,
  clientSeed: string,
  nonce: number
): number {
  const combined = `${serverSeed}-${clientSeed}-${nonce}`
  const hash = hashSeed(combined)

  // Convert first 8 characters of hex to a number between 0 and 1
  const hexValue = hash.substring(0, 8)
  const intValue = parseInt(hexValue, 16)
  const maxValue = parseInt('ffffffff', 16)

  return intValue / maxValue
}

/**
 * Calculate which slot the ball should land in based on seeds
 */
export function calculateLandingSlot(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
  numSlots: number,
  centerBias: number = 0
): number {
  const random = generateRandomNumber(serverSeed, clientSeed, nonce)

  // Apply center bias (positive = center, negative = edges)
  let biasedRandom = random

  if (centerBias !== 0) {
    // Transform random to favor center or edges
    const normalized = centerBias / 5 // Normalize -5 to +5 to -1 to +1

    if (normalized > 0) {
      // Bias toward center
      biasedRandom = 0.5 + (random - 0.5) * (1 - normalized * 0.7)
    } else {
      // Bias toward edges
      biasedRandom = random < 0.5
        ? random * (1 + Math.abs(normalized) * 0.7)
        : 1 - (1 - random) * (1 + Math.abs(normalized) * 0.7)
    }
  }

  // Convert to slot index
  const slotIndex = Math.floor(biasedRandom * numSlots)
  return Math.min(slotIndex, numSlots - 1)
}

/**
 * Verify a result using the provably fair algorithm
 */
export function verifyResult(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
  numSlots: number,
  centerBias: number,
  claimedSlot: number
): boolean {
  const calculatedSlot = calculateLandingSlot(
    serverSeed,
    clientSeed,
    nonce,
    numSlots,
    centerBias
  )
  return calculatedSlot === claimedSlot
}
