/**
 * Stats System Types
 *
 * Defines all stat types that can be modified by bonuses,
 * bonus sources for multiplicative stacking, and base values.
 */

/**
 * All game stats that can receive bonuses.
 * These are the core attributes that affect gameplay.
 */
export enum StatType {
  /** Mining damage per hit */
  DAMAGE = 'damage',
  /** Attacks per second (auto-mine rate) */
  SPEED = 'speed',
  /** Ore sell value multiplier */
  ORE_VALUE = 'ore_value',
  /** Better ore tier spawn odds */
  RARE_ORE_CHANCE = 'rare_ore_chance',
  /** Chest spawn rate */
  CHEST_CHANCE = 'chest_chance',
  /** Crystal shard spawn rate */
  SHARD_CHANCE = 'shard_chance',
  /** General RNG modifier */
  LUCK = 'luck',
  /** Chance to hit multiple times */
  MULTI_STRIKE_CHANCE = 'multi_strike_chance',
}

/**
 * Sources of stat bonuses. Bonuses from different sources
 * multiply together; bonuses within the same source are additive.
 *
 * Formula: Final = Base × (1 + upgrades) × (1 + crafted) × (1 + skill_tree) × (1 + temp_buff) × (1 + relic)
 */
export type BonusSource =
  | 'base' // Base stat values (usually not modified)
  | 'upgrades' // Short-term upgrades purchased with gold
  | 'crafted' // Crafted equipment bonuses
  | 'skill_tree' // Permanent skill tree bonuses (prestige)
  | 'temp_buff' // Temporary buffs (potions, events)
  | 'relic' // Relic bonuses

/**
 * Order in which bonus sources are applied (multiplicatively).
 * This ordering affects the final calculation.
 */
export const BONUS_SOURCE_ORDER: BonusSource[] = [
  'upgrades',
  'crafted',
  'skill_tree',
  'temp_buff',
  'relic',
]

/**
 * Base values for all stats before any bonuses.
 * These are the starting values at depth 0 with no upgrades.
 */
export const BASE_VALUES: Record<StatType, number> = {
  [StatType.DAMAGE]: 1, // 1 damage per hit
  [StatType.SPEED]: 1, // 1 attack per second
  [StatType.ORE_VALUE]: 1, // 1x sell multiplier
  [StatType.RARE_ORE_CHANCE]: 0, // 0% bonus to rare ore
  [StatType.CHEST_CHANCE]: 0.01, // 1% base chest chance
  [StatType.SHARD_CHANCE]: 0.001, // 0.1% base shard chance
  [StatType.LUCK]: 0, // 0% luck bonus
  [StatType.MULTI_STRIKE_CHANCE]: 0, // 0% multi-strike
}

/**
 * Event emitted when a stat changes.
 */
export interface StatChangedEvent {
  statType: StatType
  oldValue: number
  newValue: number
  source: BonusSource
}

/**
 * Breakdown of how a stat value is calculated.
 * Used for debug display.
 */
export interface StatBreakdown {
  statType: StatType
  baseValue: number
  finalValue: number
  bonusesBySource: Map<BonusSource, number>
}
