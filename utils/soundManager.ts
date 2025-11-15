/**
 * Sound Manager using Web Audio API
 * Generates simple tones for game events
 */

class SoundManager {
  private audioContext: AudioContext | null = null
  private enabled = true
  private volume = 0.5

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.audioContext = new AudioContext()
      } catch (e) {
        console.warn('Web Audio API not supported')
      }
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume / 100))
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
    if (!this.enabled || !this.audioContext) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator.frequency.value = frequency
    oscillator.type = type

    gainNode.gain.setValueAtTime(this.volume * 0.3, this.audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + duration
    )

    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + duration)
  }

  // Ball drop sound
  playBallDrop() {
    this.playTone(200, 0.1, 'sine')
  }

  // Peg bounce sound
  playPegBounce() {
    const frequency = 300 + Math.random() * 200
    this.playTone(frequency, 0.05, 'sine')
  }

  // Small win (1x-2x)
  playSmallWin() {
    this.playTone(400, 0.2, 'sine')
    setTimeout(() => this.playTone(500, 0.2, 'sine'), 100)
  }

  // Medium win (2x-10x)
  playMediumWin() {
    this.playTone(500, 0.15, 'sine')
    setTimeout(() => this.playTone(600, 0.15, 'sine'), 80)
    setTimeout(() => this.playTone(700, 0.2, 'sine'), 160)
  }

  // Big win (10x-100x)
  playBigWin() {
    const notes = [523, 587, 659, 698, 784] // C, D, E, F, G
    notes.forEach((note, i) => {
      setTimeout(() => this.playTone(note, 0.2, 'sine'), i * 100)
    })
  }

  // Jackpot (100x+)
  playJackpot() {
    const notes = [523, 659, 784, 1047] // C, E, G, C (octave higher)
    notes.forEach((note, i) => {
      setTimeout(() => {
        this.playTone(note, 0.3, 'sine')
        this.playTone(note * 1.5, 0.3, 'sine') // Add harmony
      }, i * 150)
    })
  }

  // Loss sound
  playLoss() {
    this.playTone(200, 0.3, 'sine')
    setTimeout(() => this.playTone(150, 0.3, 'sine'), 150)
  }

  // Play win sound based on multiplier
  playWinSound(multiplier: number) {
    if (multiplier >= 100) {
      this.playJackpot()
    } else if (multiplier >= 10) {
      this.playBigWin()
    } else if (multiplier >= 2) {
      this.playMediumWin()
    } else if (multiplier >= 1) {
      this.playSmallWin()
    } else {
      this.playLoss()
    }
  }
}

// Export singleton instance
export const soundManager = new SoundManager()
