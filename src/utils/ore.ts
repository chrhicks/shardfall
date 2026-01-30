/**
 * Ore Utilities
 *
 * Depth-based tier weights and ore selection helpers.
 */

import { ORE_CONFIG, ORE_TIER_BREAKPOINTS, ORE_TIER_COLORS, OreTier, OreType } from '../config/ores'
import { darkenColor, lightenColor } from './color'
import { randomItem, weightedRandom, type WeightedItem } from './random'

const ORE_TIER_ORDER: OreTier[] = [
  OreTier.COMMON,
  OreTier.UNCOMMON,
  OreTier.RARE,
  OreTier.EPIC,
  OreTier.LEGENDARY,
]

/**
 * Get interpolated tier weights for a given depth.
 */
export function getOreTierWeights(depth: number): Record<OreTier, number> {
  if (ORE_TIER_BREAKPOINTS.length === 0) {
    return {
      [OreTier.COMMON]: 100,
      [OreTier.UNCOMMON]: 0,
      [OreTier.RARE]: 0,
      [OreTier.EPIC]: 0,
      [OreTier.LEGENDARY]: 0,
    }
  }

  const sorted = [...ORE_TIER_BREAKPOINTS].sort((a, b) => a.depth - b.depth)
  if (depth <= sorted[0].depth) {
    return { ...sorted[0].weights }
  }
  if (depth >= sorted[sorted.length - 1].depth) {
    return { ...sorted[sorted.length - 1].weights }
  }

  let lower = sorted[0]
  let upper = sorted[sorted.length - 1]

  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i]
    const next = sorted[i + 1]
    if (depth >= current.depth && depth <= next.depth) {
      lower = current
      upper = next
      break
    }
  }

  const span = Math.max(1, upper.depth - lower.depth)
  const t = (depth - lower.depth) / span

  const weights: Record<OreTier, number> = {
    [OreTier.COMMON]: 0,
    [OreTier.UNCOMMON]: 0,
    [OreTier.RARE]: 0,
    [OreTier.EPIC]: 0,
    [OreTier.LEGENDARY]: 0,
  }

  for (const tier of ORE_TIER_ORDER) {
    const start = lower.weights[tier] ?? 0
    const end = upper.weights[tier] ?? 0
    weights[tier] = start + (end - start) * t
  }

  return weights
}

/**
 * Get all ore types within a tier (optionally filtered by minDepth).
 */
export function getOreTypesByTier(tier: OreTier, depth?: number): OreType[] {
  return Object.values(OreType).filter((oreType) => {
    const config = ORE_CONFIG[oreType]
    if (!config || config.tier !== tier) return false
    if (depth === undefined) return true
    return config.minDepth <= depth
  })
}

/**
 * Select an ore type based on depth-weighted tier curves.
 */
export function selectOreType(depth: number): OreType | null {
  const tierWeights = getOreTierWeights(depth)

  const tierItems: WeightedItem<OreTier>[] = []
  for (const tier of ORE_TIER_ORDER) {
    const available = getOreTypesByTier(tier, depth)
    if (available.length === 0) continue
    const weight = tierWeights[tier] ?? 0
    if (weight > 0) {
      tierItems.push({ item: tier, weight })
    }
  }

  const selectedTier = weightedRandom(tierItems)
  if (!selectedTier) return null

  const availableOres = getOreTypesByTier(selectedTier, depth)
  return randomItem(availableOres) ?? null
}

/**
 * Get base tier color.
 */
export function getOreTierColor(tier: OreTier): number {
  return ORE_TIER_COLORS[tier]
}

/**
 * Get display color for an ore type (tier color + variant).
 */
export function getOreColor(oreType: OreType): number {
  const config = ORE_CONFIG[oreType]
  const tierColor = ORE_TIER_COLORS[config.tier]
  const variant = config.variant ?? 0

  if (variant >= 0) {
    return lightenColor(tierColor, variant)
  }
  return darkenColor(tierColor, Math.abs(variant))
}
