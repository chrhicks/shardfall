/**
 * BlockFactory - Creates blocks with proper HP scaling
 *
 * Centralizes block creation with depth-based HP scaling.
 * Caches scaled HP values to avoid repeated calculations.
 */

import { BlockType, BLOCK_CONFIG, HP_SCALING_FACTOR } from '../config/blocks'
import { Block } from './Block'

/**
 * Cache key for scaled HP values: "type:depth"
 */
type HpCacheKey = string

/**
 * Factory for creating Block instances with proper HP scaling.
 */
export class BlockFactory {
  /** Cache of scaled HP values by type and depth */
  private static hpCache: Map<HpCacheKey, number> = new Map()

  /**
   * Calculate scaled HP for a block type at a given depth.
   * Formula: finalHp = floor(baseHp × 1.03^depth)
   *
   * @param type - Block type
   * @param depth - Depth level
   * @returns Scaled HP value
   */
  static getScaledHp(type: BlockType, depth: number): number {
    const cacheKey: HpCacheKey = `${type}:${depth}`

    const cached = this.hpCache.get(cacheKey)
    if (cached !== undefined) {
      return cached
    }

    const baseHp = BLOCK_CONFIG[type].baseHp
    const scaledHp = Math.floor(baseHp * Math.pow(HP_SCALING_FACTOR, depth))

    this.hpCache.set(cacheKey, scaledHp)
    return scaledHp
  }

  /**
   * Create a new block with depth-scaled HP.
   *
   * @param type - Block type
   * @param x - Grid column
   * @param y - Grid row
   * @param depth - Depth level (affects HP scaling)
   * @returns New Block instance
   */
  static createBlock(
    type: BlockType,
    x: number,
    y: number,
    depth: number
  ): Block {
    const scaledHp = this.getScaledHp(type, depth)
    return new Block(type, x, y, depth, scaledHp)
  }

  /**
   * Clear the HP cache (useful for testing or config hot-reload)
   */
  static clearCache(): void {
    this.hpCache.clear()
  }

  /**
   * Get cache size (for debugging)
   */
  static getCacheSize(): number {
    return this.hpCache.size
  }
}
