import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          primary: '#0f0f1e',
          secondary: '#1a1a2e',
        },
        accent: {
          blue: '#00d4ff',
          gold: '#ffd700',
        },
        multiplier: {
          loss: '#ef4444',
          smallLoss: '#f97316',
          smallWin: '#fbbf24',
          mediumWin: '#a3e635',
          bigWin: '#22c55e',
          jackpot: '#ffd700',
        }
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Monaco', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config
