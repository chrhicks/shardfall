/**
 * Ore Configuration
 *
 * Defines all ore types, tiers, and spawn metadata.
 */

/**
 * Ore tiers by rarity.
 */
export enum OreTier {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

/**
 * Ore types available in the game.
 */
export enum OreType {
  COAL = 'coal',
  COPPER = 'copper',
  TIN = 'tin',
  IRON = 'iron',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
  DIAMOND = 'diamond',
  RUBY = 'ruby',
  MYTHRIL = 'mythril',
  ADAMANTITE = 'adamantite',
}

/**
 * Configuration for a single ore type.
 */
export interface OreConfig {
  tier: OreTier
  value: number
  minDepth: number
  name: string
  /**
   * Color variation from tier color (-1 to 1).
   * Negative darkens, positive lightens.
   */
  variant?: number
}

/**
 * Tier colors (from GDD).
 */
export const ORE_TIER_COLORS: Record<OreTier, number> = {
  [OreTier.COMMON]: 0x888888,
  [OreTier.UNCOMMON]: 0x44aa44,
  [OreTier.RARE]: 0x4444ff,
  [OreTier.EPIC]: 0xaa44aa,
  [OreTier.LEGENDARY]: 0xff8800,
}

/**
 * Base ore spawn chance per block (tuned in MiningGrid config).
 */
export const ORE_SPAWN_CHANCE = 0.18

/**
 * Ore configuration by type.
 */
export const ORE_CONFIG: Record<OreType, OreConfig> = {
  [OreType.COAL]: {
    tier: OreTier.COMMON,
    value: 5,
    minDepth: 0,
    name: 'Coal',
    variant: -0.1,
  },
  [OreType.COPPER]: {
    tier: OreTier.COMMON,
    value: 10,
    minDepth: 0,
    name: 'Copper',
    variant: 0.04,
  },
  [OreType.TIN]: {
    tier: OreTier.COMMON,
    value: 14,
    minDepth: 5,
    name: 'Tin',
    variant: 0.08,
  },
  [OreType.IRON]: {
    tier: OreTier.UNCOMMON,
    value: 25,
    minDepth: 20,
    name: 'Iron',
    variant: -0.05,
  },
  [OreType.SILVER]: {
    tier: OreTier.UNCOMMON,
    value: 45,
    minDepth: 25,
    name: 'Silver',
    variant: 0.06,
  },
  [OreType.GOLD]: {
    tier: OreTier.RARE,
    value: 100,
    minDepth: 40,
    name: 'Gold',
    variant: 0.04,
  },
  [OreType.PLATINUM]: {
    tier: OreTier.RARE,
    value: 200,
    minDepth: 45,
    name: 'Platinum',
    variant: -0.03,
  },
  [OreType.DIAMOND]: {
    tier: OreTier.EPIC,
    value: 500,
    minDepth: 70,
    name: 'Diamond',
    variant: 0.08,
  },
  [OreType.RUBY]: {
    tier: OreTier.EPIC,
    value: 750,
    minDepth: 75,
    name: 'Ruby',
    variant: -0.06,
  },
  [OreType.MYTHRIL]: {
    tier: OreTier.LEGENDARY,
    value: 1500,
    minDepth: 100,
    name: 'Mythril',
    variant: 0.05,
  },
  [OreType.ADAMANTITE]: {
    tier: OreTier.LEGENDARY,
    value: 3000,
    minDepth: 110,
    name: 'Adamantite',
    variant: -0.04,
  },
}

/**
 * Tier weight breakpoints for depth-based interpolation.
 */
export const ORE_TIER_BREAKPOINTS: Array<{ depth: number; weights: Record<OreTier, number> }> = [
  {
    depth: 0,
    weights: {
      [OreTier.COMMON]: 100,
      [OreTier.UNCOMMON]: 0,
      [OreTier.RARE]: 0,
      [OreTier.EPIC]: 0,
      [OreTier.LEGENDARY]: 0,
    },
  },
  {
    depth: 45,
    weights: {
      [OreTier.COMMON]: 40,
      [OreTier.UNCOMMON]: 40,
      [OreTier.RARE]: 20,
      [OreTier.EPIC]: 0,
      [OreTier.LEGENDARY]: 0,
    },
  },
  {
    depth: 100,
    weights: {
      [OreTier.COMMON]: 8,
      [OreTier.UNCOMMON]: 15,
      [OreTier.RARE]: 28,
      [OreTier.EPIC]: 35,
      [OreTier.LEGENDARY]: 14,
    },
  },
]
