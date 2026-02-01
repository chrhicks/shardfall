/**
 * Terrain Distribution Utilities
 *
 * Functions for determining which block types appear at different depths.
 * Uses weighted random selection based on depth tiers from config.
 */

import { BlockType, DEPTH_TIERS } from '../config/blocks'
import { weightedRandom, WeightedItem } from './random'

/**
 * Get the depth tier for a given depth.
 * Returns the tier configuration that applies at this depth.
 */
function getDepthTier(depth: number) {
  for (const tier of DEPTH_TIERS) {
    if (depth >= tier.minDepth && depth <= tier.maxDepth) {
      return tier
    }
  }
  // Fallback to last tier if depth exceeds all tiers
  return DEPTH_TIERS[DEPTH_TIERS.length - 1]
}

/**
 * Get a random block type appropriate for the given depth.
 * Uses weighted random selection based on depth tier configuration.
 *
 * Depth ranges from current tuning:
 * - 0-9: 70% Dirt, 30% Stone
 * - 10-24: 40% Dirt, 60% Stone
 * - 25-49: 70% Stone, 30% Hard Rock
 * - 50-99: 40% Stone, 40% Hard Rock, 20% Dense Rock
 * - 100+: 20% Stone, 30% Hard Rock, 30% Dense Rock, 20% Ancient Stone
 *
 * @param depth - Current depth level
 * @returns Block type for this depth
 */
export function getTerrainTypeForDepth(depth: number): BlockType {
  const tier = getDepthTier(depth)

  const weightedItems: WeightedItem<BlockType>[] = []

  for (const [type, weight] of Object.entries(tier.weights)) {
    if (weight && weight > 0) {
      weightedItems.push({
        item: type as BlockType,
        weight
      })
    }
  }

  // weightedRandom returns undefined only if empty, but our tiers always have items
  return weightedRandom(weightedItems) ?? BlockType.STONE
}

/**
 * Get all possible block types at a given depth with their spawn chances.
 * Useful for UI or debugging.
 *
 * @param depth - Depth level
 * @returns Array of block types with their percentage chance
 */
export function getTerrainDistribution(depth: number): Array<{ type: BlockType; chance: number }> {
  const tier = getDepthTier(depth)

  const totalWeight = Object.values(tier.weights).reduce((sum, w) => sum + (w ?? 0), 0)

  const result: Array<{ type: BlockType; chance: number }> = []

  for (const [type, weight] of Object.entries(tier.weights)) {
    if (weight && weight > 0) {
      result.push({
        type: type as BlockType,
        chance: weight / totalWeight
      })
    }
  }

  return result
}

/**
 * Check if a block type can spawn at a given depth.
 *
 * @param type - Block type to check
 * @param depth - Depth level
 * @returns true if this block type can appear at this depth
 */
export function canSpawnAtDepth(type: BlockType, depth: number): boolean {
  const tier = getDepthTier(depth)
  const weight = tier.weights[type]
  return weight !== undefined && weight > 0
}
