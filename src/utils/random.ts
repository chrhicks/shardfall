/**
 * Random Utilities
 *
 * Helper functions for random selection, particularly
 * weighted random for terrain distribution.
 */

/**
 * Item with a weight for weighted random selection.
 */
export interface WeightedItem<T> {
  item: T
  weight: number
}

/**
 * Select a random item from a weighted list.
 *
 * @param items - Array of items with weights
 * @returns Selected item, or undefined if list is empty
 */
export function weightedRandom<T>(items: WeightedItem<T>[]): T | undefined {
  if (items.length === 0) return undefined

  // Calculate total weight
  const totalWeight = items.reduce((sum, { weight }) => sum + weight, 0)
  if (totalWeight <= 0) return items[0]?.item

  // Pick a random point in the total weight
  let random = Math.random() * totalWeight

  // Find the item at that point
  for (const { item, weight } of items) {
    random -= weight
    if (random <= 0) {
      return item
    }
  }

  // Fallback (shouldn't happen)
  return items[items.length - 1]?.item
}

/**
 * Select a random item from an array with equal probability.
 *
 * @param items - Array of items
 * @returns Random item, or undefined if array is empty
 */
export function randomItem<T>(items: T[]): T | undefined {
  if (items.length === 0) return undefined
  return items[Math.floor(Math.random() * items.length)]
}

/**
 * Generate a random integer between min and max (inclusive).
 *
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Random integer in range [min, max]
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Generate a random float between min and max.
 *
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Random float in range [min, max)
 */
export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

/**
 * Roll a probability check.
 *
 * @param chance - Probability (0-1)
 * @returns true if the roll succeeded
 */
export function rollChance(chance: number): boolean {
  return Math.random() < chance
}
