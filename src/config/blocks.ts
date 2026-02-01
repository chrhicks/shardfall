/**
 * Block Configuration
 *
 * Data-driven configuration for block types.
 * All block properties are defined here for easy balancing.
 */

/**
 * Terrain block types in the game.
 * Each has different HP, appearance, and spawn rules.
 */
export enum BlockType {
  DIRT = 'dirt',
  STONE = 'stone',
  HARD_ROCK = 'hard_rock',
  DENSE_ROCK = 'dense_rock',
  ANCIENT_STONE = 'ancient_stone'
}

/**
 * Configuration for a single block type.
 */
export interface BlockTypeConfig {
  /** Base HP before depth scaling */
  baseHp: number
  /** Hex color for rendering */
  color: number
  /** Minimum depth where this block can spawn */
  minDepth: number
  /** Relative spawn weight (higher = more common) */
  spawnWeight: number
}

/**
 * Block configuration by type.
 * Values from GDD:
 * - Dirt: 3hp, earth brown, depth 0+
 * - Stone: 5hp, gray, depth 0+
 * - Hard Rock: 15hp, brown, depth 25+
 * - Dense Rock: 40hp, dark gray, depth 50+
 * - Ancient Stone: 100hp, purple-gray, depth 100+
 */
export const BLOCK_CONFIG: Record<BlockType, BlockTypeConfig> = {
  [BlockType.DIRT]: {
    baseHp: 3,
    color: 0x6b4b3e, // earth brown
    minDepth: 0,
    spawnWeight: 130
  },
  [BlockType.STONE]: {
    baseHp: 5,
    color: 0x808080, // gray
    minDepth: 0,
    spawnWeight: 100
  },
  [BlockType.HARD_ROCK]: {
    baseHp: 15,
    color: 0x8b4513, // saddle brown
    minDepth: 25,
    spawnWeight: 60
  },
  [BlockType.DENSE_ROCK]: {
    baseHp: 40,
    color: 0x2f4f4f, // dark slate gray
    minDepth: 50,
    spawnWeight: 40
  },
  [BlockType.ANCIENT_STONE]: {
    baseHp: 100,
    color: 0x4b0082, // indigo / purple-gray
    minDepth: 100,
    spawnWeight: 20
  }
}

/**
 * HP scaling factor per depth level.
 * Formula: finalHp = baseHp × (HP_SCALING_FACTOR ^ depth)
 */
export const HP_SCALING_FACTOR = 1.03

/**
 * Depth thresholds for terrain distribution.
 * Defines which block types can appear and their relative weights at each depth range.
 */
export interface DepthTier {
  minDepth: number
  maxDepth: number // Infinity for last tier
  weights: Partial<Record<BlockType, number>>
}

export const DEPTH_TIERS: DepthTier[] = [
  {
    minDepth: 0,
    maxDepth: 9,
    weights: {
      [BlockType.DIRT]: 70,
      [BlockType.STONE]: 30
    }
  },
  {
    minDepth: 10,
    maxDepth: 24,
    weights: {
      [BlockType.DIRT]: 40,
      [BlockType.STONE]: 60
    }
  },
  {
    minDepth: 25,
    maxDepth: 49,
    weights: {
      [BlockType.STONE]: 70,
      [BlockType.HARD_ROCK]: 30
    }
  },
  {
    minDepth: 50,
    maxDepth: 99,
    weights: {
      [BlockType.STONE]: 40,
      [BlockType.HARD_ROCK]: 40,
      [BlockType.DENSE_ROCK]: 20
    }
  },
  {
    minDepth: 100,
    maxDepth: Infinity,
    weights: {
      [BlockType.STONE]: 20,
      [BlockType.HARD_ROCK]: 30,
      [BlockType.DENSE_ROCK]: 30,
      [BlockType.ANCIENT_STONE]: 20
    }
  }
]
