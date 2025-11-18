'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Matter from 'matter-js'
import { useGameStore } from '@/store/gameStore'
import { getMultiplierSlots, calculatePayout } from '@/utils/multipliers'
import { calculateLandingSlot } from '@/utils/provablyFair'
import { soundManager } from '@/utils/soundManager'
import type { Ball, BetResult } from '@/types/game'

const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 600
const PEG_RADIUS = 4
const BALL_RADIUS = 6
const SLOT_HEIGHT = 60

export default function GameBoard() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<Matter.Engine | null>(null)
  const renderRef = useRef<Matter.Render | null>(null)
  const runnerRef = useRef<Matter.Runner | null>(null)
  const ballBodiesRef = useRef<Map<string, Matter.Body>>(new Map())
  const gameTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const settings = useGameStore((state) => state.settings)
  const balance = useGameStore((state) => state.balance)
  const currentBet = useGameStore((state) => state.currentBet)
  const isPlaying = useGameStore((state) => state.isPlaying)
  const autoBetActive = useGameStore((state) => state.autoBetActive)
  const autoBetConfig = useGameStore((state) => state.autoBetConfig)
  const seeds = useGameStore((state) => state.seeds)

  const startGame = useGameStore((state) => state.startGame)
  const endGame = useGameStore((state) => state.endGame)
  const updateBalance = useGameStore((state) => state.updateBalance)
  const addResult = useGameStore((state) => state.addResult)
  const setAutoBetActive = useGameStore((state) => state.setAutoBetActive)

  const [activeBalls, setActiveBalls] = useState<Ball[]>([])
  const [autoBetCount, setAutoBetCount] = useState(0)
  const [highlightedSlot, setHighlightedSlot] = useState<number | null>(null)
  const [allInMode, setAllInMode] = useState(false)

  // Update sound manager settings
  useEffect(() => {
    soundManager.setEnabled(settings.soundEnabled)
    soundManager.setVolume(settings.soundVolume)
  }, [settings.soundEnabled, settings.soundVolume])

  // Get multiplier slots
  const multiplierSlots = getMultiplierSlots(settings.rows, settings.risk, CANVAS_WIDTH)

  // Initialize Matter.js physics engine
  useEffect(() => {
    if (!canvasRef.current) return

    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 1, scale: 0.001 },
    })

    const render = Matter.Render.create({
      canvas: canvasRef.current,
      engine: engine,
      options: {
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        wireframes: false,
        background: '#0f0f1e',
      },
    })

    engineRef.current = engine
    renderRef.current = render

    // Create boundaries
    const walls = [
      // Left wall
      Matter.Bodies.rectangle(-10, CANVAS_HEIGHT / 2, 20, CANVAS_HEIGHT, {
        isStatic: true,
        render: { fillStyle: '#1a1a2e' },
      }),
      // Right wall
      Matter.Bodies.rectangle(CANVAS_WIDTH + 10, CANVAS_HEIGHT / 2, 20, CANVAS_HEIGHT, {
        isStatic: true,
        render: { fillStyle: '#1a1a2e' },
      }),
      // Bottom
      Matter.Bodies.rectangle(CANVAS_WIDTH / 2, CANVAS_HEIGHT - SLOT_HEIGHT + 5, CANVAS_WIDTH, 10, {
        isStatic: true,
        render: { fillStyle: '#1a1a2e' },
      }),
    ]

    Matter.Composite.add(engine.world, walls)

    // Create pegs
    createPegs(engine, settings.rows)

    // Create and start runner
    const runner = Matter.Runner.create()
    runnerRef.current = runner

    // Start engine and render
    Matter.Runner.run(runner, engine)
    Matter.Render.run(render)

    return () => {
      if (runnerRef.current) {
        Matter.Runner.stop(runnerRef.current)
      }
      Matter.Render.stop(render)
      Matter.World.clear(engine.world, false)
      Matter.Engine.clear(engine)
    }
  }, [settings.rows])

  // Create pegs based on rows
  const createPegs = (engine: Matter.Engine, rows: number) => {
    const pegs: Matter.Body[] = []
    const startY = 100
    const verticalSpacing = (CANVAS_HEIGHT - SLOT_HEIGHT - startY - 50) / rows
    const horizontalSpacing = 40

    for (let row = 0; row < rows; row++) {
      const numPegs = row + 3
      const rowWidth = (numPegs - 1) * horizontalSpacing
      const startX = (CANVAS_WIDTH - rowWidth) / 2

      for (let col = 0; col < numPegs; col++) {
        const x = startX + col * horizontalSpacing
        const y = startY + row * verticalSpacing

        const peg = Matter.Bodies.circle(x, y, PEG_RADIUS, {
          isStatic: true,
          restitution: 0.8,
          friction: 0.1,
          render: {
            fillStyle: '#ffffff',
            strokeStyle: '#00d4ff',
            lineWidth: 1,
          },
          label: 'peg',
        })

        pegs.push(peg)
      }
    }

    Matter.Composite.add(engine.world, pegs)
  }

  // Drop a ball
  const dropBall = useCallback(() => {
    if (!engineRef.current) return

    const ballId = `ball-${Date.now()}-${Math.random()}`
    const colors = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7']
    const color = colors[Math.floor(Math.random() * colors.length)]

    // Calculate target slot using provably fair algorithm
    const targetSlot = calculateLandingSlot(
      seeds.serverSeed,
      seeds.clientSeed,
      seeds.nonce,
      multiplierSlots.length,
      settings.centerBias
    )

    // Add slight randomness to starting position
    const startX = CANVAS_WIDTH / 2 + (Math.random() - 0.5) * 20

    const ballBody = Matter.Bodies.circle(startX, 50, BALL_RADIUS, {
      restitution: 0.75,
      friction: 0.05,
      density: 0.001,
      render: {
        fillStyle: color,
        strokeStyle: color,
        lineWidth: 2,
      },
      label: `ball-${ballId}`,
    })

    const ball: Ball = {
      id: ballId,
      body: ballBody,
      color,
      betAmount: currentBet,
      active: true,
      landed: false,
    }

    Matter.Composite.add(engineRef.current.world, ballBody)
    ballBodiesRef.current.set(ballId, ballBody)
    setActiveBalls((prev) => [...prev, ball])

    // Play ball drop sound
    soundManager.playBallDrop()

    // Monitor ball landing
    monitorBallLanding(ball, targetSlot)
  }, [currentBet, multiplierSlots.length, seeds, settings.centerBias])

  // Monitor when ball lands in a slot
  const monitorBallLanding = (ball: Ball, targetSlot: number) => {
    const checkInterval = setInterval(() => {
      if (!engineRef.current) {
        clearInterval(checkInterval)
        return
      }

      const body = ballBodiesRef.current.get(ball.id)
      if (!body) {
        clearInterval(checkInterval)
        return
      }

      // Check if ball has stopped moving and is at the bottom
      const velocity = Math.abs(body.velocity.x) + Math.abs(body.velocity.y)
      const isAtBottom = body.position.y > CANVAS_HEIGHT - SLOT_HEIGHT - 30

      if (velocity < 0.1 && isAtBottom) {
        clearInterval(checkInterval)
        handleBallLanded(ball, body.position.x)
      }
    }, 100)
  }

  // Handle ball landing
  const handleBallLanded = (ball: Ball, finalX: number) => {
    // Determine which slot the ball landed in
    const slotIndex = Math.floor(finalX / (CANVAS_WIDTH / multiplierSlots.length))
    const clampedIndex = Math.max(0, Math.min(slotIndex, multiplierSlots.length - 1))
    const slot = multiplierSlots[clampedIndex]

    // Calculate payout
    const payout = calculatePayout(ball.betAmount, slot.multiplier)
    const profit = payout - ball.betAmount

    // Update balance
    updateBalance(profit)

    // Highlight slot
    setHighlightedSlot(clampedIndex)
    setTimeout(() => setHighlightedSlot(null), 1000)

    // Create result
    const result: BetResult = {
      id: ball.id,
      timestamp: Date.now(),
      betAmount: ball.betAmount,
      multiplier: slot.multiplier,
      payout,
      profit,
      slotIndex: clampedIndex,
      seeds: {
        serverSeed: seeds.serverSeedHash,
        clientSeed: seeds.clientSeed,
        nonce: seeds.nonce,
      },
    }

    addResult(result)

    // Play win/loss sound
    soundManager.playWinSound(slot.multiplier)

    // Remove ball and check if all balls have landed
    setActiveBalls((prevBalls) => {
      const updatedBalls = prevBalls.filter((b) => b.id !== ball.id)

      // If this was the last ball, end game and handle auto-bet/all-in
      if (updatedBalls.length === 0) {
        // Clear the failsafe timeout
        if (gameTimeoutRef.current) {
          clearTimeout(gameTimeoutRef.current)
          gameTimeoutRef.current = null
        }

        setTimeout(() => {
          endGame()

          // Handle auto-bet - get current state
          const currentAutoBetActive = useGameStore.getState().autoBetActive
          if (currentAutoBetActive) {
            handleAutoBet(result)
          } else if (allInMode) {
            handleAllIn()
          }
        }, 100)
      }

      return updatedBalls
    })

    // Remove ball body from physics world after a delay
    setTimeout(() => {
      const body = ballBodiesRef.current.get(ball.id)
      if (body && engineRef.current) {
        Matter.Composite.remove(engineRef.current.world, body)
        ballBodiesRef.current.delete(ball.id)
      }
    }, 2000)
  }

  // Handle all-in mode
  const handleAllIn = () => {
    const currentBalance = useGameStore.getState().balance

    // Stop if balance is too low
    if (currentBalance < 0.1) {
      setAllInMode(false)
      return
    }

    // Continue betting entire balance
    setTimeout(() => {
      const balance = useGameStore.getState().balance
      handleBet(Math.max(0.1, balance))
    }, 500)
  }

  // Handle auto-bet logic
  const handleAutoBet = (lastResult: BetResult) => {
    const newCount = autoBetCount + 1

    // Check stop conditions
    if (autoBetConfig.numberOfBets !== 'infinite' && newCount >= autoBetConfig.numberOfBets) {
      setAutoBetActive(false)
      setAutoBetCount(0)
      return
    }

    const currentProfit = useGameStore.getState().statistics.netProfit
    if (autoBetConfig.stopOnProfit && currentProfit >= autoBetConfig.stopOnProfit) {
      setAutoBetActive(false)
      setAutoBetCount(0)
      return
    }

    if (autoBetConfig.stopOnLoss && currentProfit <= -autoBetConfig.stopOnLoss) {
      setAutoBetActive(false)
      setAutoBetCount(0)
      return
    }

    // Continue auto-bet
    setAutoBetCount(newCount)
    setTimeout(() => {
      handleBet()
    }, 500)
  }

  // Handle bet button click
  const handleBet = (betAmount?: number) => {
    const amount = betAmount ?? currentBet

    if (isPlaying || balance < amount || amount < 0.1) {
      // Stop auto-bet or all-in if insufficient balance
      if ((autoBetActive || allInMode) && balance < amount) {
        setAutoBetActive(false)
        setAllInMode(false)
        setAutoBetCount(0)
      }
      return
    }

    // Clear any existing game timeout
    if (gameTimeoutRef.current) {
      clearTimeout(gameTimeoutRef.current)
    }

    // Deduct bet amount
    updateBalance(-amount)

    startGame()

    // Drop balls based on settings
    for (let i = 0; i < settings.ballsAtOnce; i++) {
      setTimeout(() => {
        dropBall()
      }, i * 200) // Stagger ball drops
    }

    // Failsafe: Force end game after 30 seconds if balls haven't landed
    gameTimeoutRef.current = setTimeout(() => {
      console.warn('Game timeout reached, forcing endGame()')
      endGame()
      setActiveBalls([])

      // Continue all-in if active
      if (allInMode) {
        handleAllIn()
      }
    }, 30000)
  }

  // Auto-bet effect
  useEffect(() => {
    if (autoBetActive && !isPlaying) {
      handleBet()
    }
  }, [autoBetActive])

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-4xl">
      {/* Canvas */}
      <div className="relative rounded-lg overflow-hidden shadow-2xl border-2 border-gray-800">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          style={{ display: 'block', width: `${CANVAS_WIDTH}px`, height: `${CANVAS_HEIGHT}px` }}
        />

        {/* Multiplier Slots Overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-16 flex">
          {multiplierSlots.map((slot, index) => (
            <div
              key={index}
              className={`flex-1 flex items-center justify-center text-xs font-bold font-mono transition-all duration-300 ${
                highlightedSlot === index ? 'pulse-glow scale-110 z-10' : ''
              }`}
              style={{
                backgroundColor: highlightedSlot === index ? slot.color : `${slot.color}90`,
                borderRight: index < multiplierSlots.length - 1 ? '1px solid #1a1a2e' : 'none',
              }}
            >
              {slot.multiplier}x
            </div>
          ))}
        </div>
      </div>

      {/* Bet Buttons */}
      <div className="w-full max-w-md space-y-3">
        <button
          onClick={() => handleBet()}
          disabled={isPlaying || balance < currentBet || currentBet < 0.1 || autoBetActive || allInMode}
          className={`w-full py-4 px-8 rounded-lg font-bold text-xl transition-all transform ${
            isPlaying || balance < currentBet || currentBet < 0.1 || autoBetActive || allInMode
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 hover:scale-105 text-white shadow-lg'
          }`}
          aria-label="Place bet"
        >
          {isPlaying ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⚪</span> Playing...
            </span>
          ) : balance < currentBet ? (
            'Insufficient Balance'
          ) : autoBetActive ? (
            `Auto-Bet Running (${autoBetCount}/${autoBetConfig.numberOfBets === 'infinite' ? '∞' : autoBetConfig.numberOfBets})`
          ) : allInMode ? (
            'All-In Mode Active'
          ) : (
            `Bet $${currentBet.toFixed(2)}`
          )}
        </button>

        <button
          onClick={() => {
            if (allInMode) {
              setAllInMode(false)
            } else {
              setAllInMode(true)
              setAutoBetActive(false)
              const balance = useGameStore.getState().balance
              handleBet(Math.max(0.1, balance))
            }
          }}
          disabled={isPlaying && !allInMode || autoBetActive || balance < 0.1}
          className={`w-full py-3 px-6 rounded-lg font-bold text-lg transition-all transform ${
            allInMode
              ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg'
              : isPlaying && !allInMode || autoBetActive || balance < 0.1
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-orange-600 hover:bg-orange-700 hover:scale-105 text-white shadow-lg'
          }`}
          aria-label="All-in bet"
        >
          {allInMode ? '🛑 Stop All-In' : '💰 All-In (Bet Until Bankrupt)'}
        </button>
      </div>

      {/* Active Balls Counter */}
      {activeBalls.length > 0 && (
        <div className="text-sm text-gray-400">
          Active balls: <span className="text-accent-blue font-mono">{activeBalls.length}</span>
        </div>
      )}
    </div>
  )
}
