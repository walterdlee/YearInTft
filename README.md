# Year in TFT

A "Spotify Wrapped" style year-in-review application for TeamFight Tactics players. View your favorite comps, ranked performance, and statistics from the past year.

## Features

- **Favorite Compositions**: See which team comps you played most
- **Ranked Performance**: Track your rank progression throughout the year
- **Play Patterns**: Analyze your playstyle and preferences
- **Beautiful Visuals**: Wrapped-style animated presentation of your stats

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Data Source**: Riot Games API

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Riot Games API Key ([Get one here](https://developer.riotgames.com/))

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env` and add your Riot API key:
   ```bash
   cp .env.example .env
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
year-in-tft/
├── app/
│   ├── api/            # API routes for Riot data
│   ├── wrapped/        # Main wrapped experience
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/
│   └── wrapped/        # Wrapped-specific components
├── lib/
│   └── riot/           # Riot API utilities
├── types/              # TypeScript type definitions
└── public/             # Static assets
```

## API Routes

- `/api/riot/summoner` - Fetch summoner data by name
- `/api/riot/matches` - Get match history for a summoner
- `/api/riot/stats` - Calculate yearly statistics

## Development Roadmap

- [ ] Basic summoner lookup
- [ ] Match history fetching
- [ ] Data aggregation and statistics
- [ ] Wrapped UI components
- [ ] Animation sequences
- [ ] Share functionality

## License

MIT
