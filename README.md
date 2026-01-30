# Shardfall

Shardfall is a single-screen, desktop-first idle mining game built in Phaser. Mine blocks to collect ores, invest in upgrades, unlock powerful skills, and push deeper to discover rare resources and long-term progression.

## Core Loop

- Mine blocks in a grid to collect ores and gold.
- Spend gold on short-term upgrades (speed, damage, yield, etc.).
- Find crystal shards to unlock the skill tree and permanent progression.
- Push to deeper layers for tougher blocks and rarer drops.
- Prestige to reset a run and amplify long-term gains.

## Mechanics Snapshot

- **Mining grid:** click-to-mine blocks that scale in HP with depth.
- **Ores & tiers:** common → legendary resources with increasing value and rarity.
- **Upgrades:** short-term boosts purchased with gold.
- **Skill tree:** long-term shard-based progression that unlocks automation and new mechanics.
- **Inventory:** track ore counts and sell for gold.
- **Prestige:** meta progression after acquiring crystal shards.

## Tech Stack

- Phaser 3 + TypeScript
- Vite for dev/build
- LocalStorage for saves

## Run Locally

```
npm install
npm run dev
```

## Art & Assets

- Pixel art direction with warm cave tones and dwarven stonework.
- Placeholder assets are generated via PixelLab and refined in Piskel.
- Palette reference: Apollo (see `docs/palettes/`).

## Project Status

Active development. The current scene is a dev build used to iterate on the mining grid, UI layout, and visual direction.
