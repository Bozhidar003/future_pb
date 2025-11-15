# Plinko Balls Gambling Game

A modern, feature-rich Plinko gambling game built with Next.js 14+, TypeScript, and Matter.js physics engine. This project implements a fully functional casino-style Plinko game with realistic physics, multiple game modes, and a provably fair system.

## Features

### Core Gameplay
- **Realistic Physics**: Built with Matter.js for authentic ball movement and collisions
- **Configurable Rows**: Choose between 8-16 rows for different difficulty levels
- **Risk Levels**: Three risk modes (Low, Medium, High) with different multiplier distributions
- **Multi-Ball**: Drop up to 10 balls simultaneously for faster gameplay
- **Center Bias**: Adjust ball landing tendencies from edges to center

### Game Modes
- **Manual Betting**: Place individual bets with full control
- **Auto-Bet**: Automated betting with customizable stop conditions
  - Set number of bets or run infinitely
  - Stop on profit/loss thresholds
  - Increase bet on loss option
  - Reset bet on win feature

### Visual & Audio
- **Modern UI**: Dark theme with electric blue and gold accents
- **Smooth Animations**: 60 FPS gameplay with Framer Motion UI animations
- **Sound System**: Dynamic audio feedback using Web Audio API
  - Ball drop sounds
  - Peg bounce effects
  - Win sounds scaled by multiplier value
  - Adjustable volume and mute option

### Statistics & Tracking
- **Real-time Balance**: Live balance updates with profit/loss tracking
- **Session Statistics**:
  - Total bets, wagered amount, and winnings
  - Win rate percentage
  - Biggest win and loss tracking
- **Visual Charts**:
  - Profit over time line chart
  - Multiplier distribution histogram
- **Recent Results**: Last 20 bet outcomes with details

### Provably Fair
- **Seed-based RNG**: Server seed, client seed, and nonce system
- **Transparency**: View and change client seed anytime
- **Verification Modal**: Check result authenticity for any bet
- **Deterministic Outcomes**: Results can be independently verified

### Data Persistence
- **LocalStorage**: Saves balance, settings, and statistics
- **Session Continuity**: Resume your game after page refresh
- **Reset Option**: Clear all data and start fresh

## Tech Stack

- **Framework**: Next.js 14.2+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Physics**: Matter.js
- **State Management**: Zustand
- **Animation**: Framer Motion
- **Charts**: Recharts
- **Audio**: Web Audio API

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or pnpm package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd future_pb
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
future_pb/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── BalanceDisplay.tsx    # Balance and P/L display
│   ├── GameBoard.tsx         # Main game canvas with physics
│   ├── SettingsPanel.tsx     # Game configuration sidebar
│   ├── StatsPanel.tsx        # Statistics sidebar
│   └── ProvablyFairModal.tsx # Verification modal
├── store/                 # Zustand state management
│   └── gameStore.ts       # Global game state
├── types/                 # TypeScript type definitions
│   └── game.ts            # Game-related types
├── utils/                 # Utility functions
│   ├── multipliers.ts     # Multiplier calculations
│   ├── provablyFair.ts    # RNG and verification
│   └── soundManager.ts    # Audio system
└── public/                # Static assets

```

## How to Play

1. **Set Your Bet**: Use the bet amount input in the left panel
2. **Configure Game**:
   - Choose number of rows (8-16)
   - Select risk level (Low/Medium/High)
   - Set balls to drop simultaneously (1-10)
   - Adjust center bias if desired
3. **Place Bet**: Click the green "Bet" button
4. **Watch the Ball**: Ball drops through pegs and lands in a slot
5. **Collect Winnings**: Payout calculated based on multiplier

### Auto-Bet Mode

1. Click "Configure" next to Auto-Bet toggle
2. Set your preferences:
   - Number of bets to place
   - Stop conditions (profit/loss)
   - Bet adjustment rules
3. Click "Start Auto-Bet"
4. Click "Stop Auto-Bet" to halt anytime

## Game Configuration

### Row Count (8-16)
- **More rows** = More randomness, higher potential multipliers
- **Fewer rows** = More predictable, lower variance

### Risk Levels

**Low Risk**
- Multiplier range: 0.5x - 10x
- Flatter distribution, more consistent returns
- Best for conservative play

**Medium Risk**
- Multiplier range: 0.3x - 50x
- Balanced distribution
- Good middle ground

**High Risk**
- Multiplier range: 0.2x - 1000x
- Extreme distribution, rare jackpots
- High variance, big wins or losses

### Multiplier Color Guide

- 🔴 **Red** (0.2x - 0.5x): Loss
- 🟠 **Orange** (0.6x - 0.9x): Small loss
- 🟡 **Yellow** (1x - 2x): Small win
- 🟢 **Light Green** (2x - 10x): Medium win
- 💚 **Green** (10x - 100x): Big win
- 🏆 **Gold** (100x - 1000x): Jackpot

## Provably Fair System

This game uses a provably fair algorithm to ensure result integrity:

1. **Server Seed**: Generated randomly, only hash is shown before bet
2. **Client Seed**: User-controlled seed (can be changed anytime)
3. **Nonce**: Increments with each bet for uniqueness
4. **Result Calculation**: `SHA-256(serverSeed + clientSeed + nonce)`

### Verifying Results

1. Click "Verify Results" in the Statistics panel
2. View seeds used for any past bet
3. Change your client seed to influence future outcomes
4. Results are deterministic and can be independently verified

## Performance Optimization

The game is optimized for smooth 60 FPS gameplay:

- Canvas rendering for efficient graphics
- Matter.js physics engine optimized for multiple balls
- Debounced state updates
- Lazy loading for non-critical components
- Efficient ball cleanup and memory management

## Browser Support

- Chrome (last 2 versions) ✅
- Firefox (last 2 versions) ✅
- Safari (last 2 versions) ✅
- Edge (last 2 versions) ✅

## Responsive Design

The game adapts to different screen sizes:

- **Desktop** (1920x1080+): Full three-panel layout
- **Tablet** (768x1024): Optimized side panels
- **Mobile** (375x667+): Stacked vertical layout

## Development

### Key Components

**GameBoard.tsx**
- Matter.js physics engine setup
- Peg generation based on row count
- Ball physics and collision detection
- Slot detection and payout calculation

**gameStore.ts**
- Zustand state management
- Balance and bet handling
- Statistics calculation
- LocalStorage persistence

**multipliers.ts**
- Risk-based multiplier distribution
- Color coding for slot values
- Payout calculations

**provablyFair.ts**
- Seed generation and hashing
- RNG deterministic calculation
- Result verification

### Adding New Features

1. Create new component in `components/`
2. Add types to `types/game.ts` if needed
3. Update store in `store/gameStore.ts` for state
4. Import and use in `app/page.tsx`

## Known Limitations

- Sound system uses basic Web Audio API (no external audio files)
- Provably fair uses simplified hashing (demo purposes)
- No real money integration (virtual currency only)
- No user authentication/accounts
- No multiplayer features

## Future Enhancements

Potential features for future versions:

- **Phase 2**:
  - Multiple ball skins/themes
  - Leaderboard system
  - Daily challenges
  - Achievement system
  - Social sharing

- **Phase 3**:
  - Real-time multiplayer
  - Tournament mode
  - VIP levels with bonuses
  - Chat system
  - Mobile app (React Native)

## License

This project is for educational and entertainment purposes only. Not intended for real money gambling.

## Responsible Gaming

⚠️ **Important Notice**:
- This is a demonstration game with virtual currency
- No real money is involved
- Gambling can be addictive
- Play responsibly and for fun only
- You must be 18+ to use this application

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## Credits

- Built with Next.js and TypeScript
- Physics powered by Matter.js
- Charts by Recharts
- Icons and design inspired by modern casino UI

---

**Version**: 1.0.0
**Last Updated**: November 15, 2025
**Status**: Production Ready
