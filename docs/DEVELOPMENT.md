# Shardfall Development Guide

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+
- Git
- Code editor with TypeScript support (VS Code recommended)

## Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd mining_game

# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:8080 in your browser. The page will hot-reload on file changes.

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint with auto-fix |
| `npm run format` | Format code with Prettier |
| `npm run typecheck` | Run TypeScript type checking |

## Project Structure

```
src/
├── game/           # Phaser game entry point and config
│   ├── main.ts     # Game configuration and initialization
│   └── scenes/     # Template scenes (can be removed)
├── scenes/         # Game scenes
│   └── HelloWorldScene.ts  # Example scene
├── objects/        # Game entities (Miner, Block, Ore, etc.)
├── systems/        # Game systems (MiningSystem, SaveSystem, etc.)
├── ui/             # UI components using rexUI
├── config/         # Constants, balance values, game settings
├── utils/          # Helper functions, formatters
└── types/          # TypeScript interfaces and type definitions

public/
└── assets/
    ├── images/     # Sprites, tilesets (when added)
    ├── audio/      # Sound effects, music (when added)
    └── data/       # JSON data files (when needed)

docs/               # Game design documents
```

## Code Style

This project uses:
- **2 spaces** for indentation
- **No semicolons**
- **Single quotes** for strings
- **Trailing comma**: none

Prettier and ESLint are configured to enforce this. Enable "format on save" in your editor.

VS Code users: The `.vscode/settings.json` file is included with recommended settings.

## Creating New Scenes

1. Create a new file in `src/scenes/`:

```typescript
import { Scene } from 'phaser'

export class MyScene extends Scene {
  constructor() {
    super('MyScene')
  }

  create() {
    // Scene setup
  }

  update() {
    // Game loop
  }
}
```

2. Register it in `src/game/main.ts`:

```typescript
import { MyScene } from '../scenes/MyScene'

const config = {
  // ...
  scene: [MyScene]
}
```

## Working with rexUI

rexUI is available as `this.rexUI` in any scene:

```typescript
// Create a rounded rectangle button
const button = this.rexUI.add.roundRectangle(x, y, width, height, radius, color)
button.setInteractive()
button.on('pointerdown', () => { /* handle click */ })
```

See [rexUI documentation](https://rexrainbow.github.io/phaser3-rex-notes/docs/site/ui-overview/) for more components.

## Working with Big Numbers

Use `break_infinity.js` for numbers that can grow very large:

```typescript
import Decimal from 'break_infinity.js'

const shards = new Decimal(0)
shards = shards.add(1e6)           // Add 1 million
shards.toExponential(2)            // "1.00e6"
shards.lt(1e9)                     // true (less than 1 billion)
```

## Asset Pipeline

### Current Approach (Prototyping)

Use Phaser's built-in graphics for placeholders:

```typescript
// Colored rectangle
this.add.rectangle(x, y, width, height, color)

// Circle
this.add.circle(x, y, radius, color)

// Line
this.add.line(x1, y1, x2, y2, color)
```

### Future (Pixel Art)

When ready for real assets:

1. Create sprites in Aseprite
2. Export as PNG + JSON (Array format)
3. Place in `public/assets/images/`
4. Load in Phaser:

```typescript
// In preload()
this.load.image('miner', 'assets/images/miner.png')

// For spritesheets with animations
this.load.aseprite('miner', 'assets/images/miner.png', 'assets/images/miner.json')
```

## Building for Production

```bash
npm run build
```

Output goes to `dist/`. To preview locally:

```bash
npm run preview
```

Bundle size notes:
- Phaser: ~1.1MB
- App code + rexUI: ~860KB
- Total: ~2.3MB (gzipped will be much smaller)

## Troubleshooting

### TypeScript errors with rexUI

Use type assertion when accessing rexUI:

```typescript
const rexUI = (this as any).rexUI
```

### Hot reload not working

1. Check terminal for errors
2. Try hard refresh (Cmd+Shift+R)
3. Restart dev server

### ESLint errors on save

Run `npm run lint:fix` to auto-fix what can be fixed automatically.
