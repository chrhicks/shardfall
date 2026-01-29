/**
 * StatSystem - Centralized stat calculation with multiplicative bonus stacking
 *
 * The GDD defines bonus stacking as:
 * Final = Base × (1 + upgrades) × (1 + crafted) × (1 + skill_tree) × (1 + temp_buff) × (1 + relic)
 *
 * All game systems query this for final stat values.
 */

import {
  StatType,
  BonusSource,
  BASE_VALUES,
  BONUS_SOURCE_ORDER,
  StatChangedEvent,
  StatBreakdown,
} from '../types/stats'

type StatListener = (event: StatChangedEvent) => void

/**
 * Central stat calculator managing all bonuses and providing final values.
 * Singleton pattern - use StatSystem.getInstance() to access.
 */
export class StatSystem {
  private static instance: StatSystem | null = null

  /**
   * Nested map: BonusSource -> StatType -> bonus value
   * Bonuses are stored as decimal multipliers (e.g., 0.25 = 25% bonus)
   */
  private bonuses: Map<BonusSource, Map<StatType, number>> = new Map()

  /** Event listeners for stat changes */
  private listeners: Set<StatListener> = new Set()

  /** Whether to batch events (suppresses individual events until flush) */
  private batchMode = false
  private pendingEvents: StatChangedEvent[] = []

  private constructor() {
    // Initialize empty maps for each source
    for (const source of BONUS_SOURCE_ORDER) {
      this.bonuses.set(source, new Map())
    }
    this.bonuses.set('base', new Map())
  }

  /**
   * Get the singleton instance
   */
  static getInstance(): StatSystem {
    if (!StatSystem.instance) {
      StatSystem.instance = new StatSystem()
    }
    return StatSystem.instance
  }

  /**
   * Reset the singleton (useful for testing)
   */
  static resetInstance(): void {
    StatSystem.instance = null
  }

  /**
   * Add or update a bonus from a specific source.
   * @param source - The source of the bonus (upgrades, crafted, etc.)
   * @param stat - The stat type to modify
   * @param amount - Bonus as decimal (0.25 = 25% bonus)
   */
  addBonus(source: BonusSource, stat: StatType, amount: number): void {
    const oldValue = this.getStat(stat)

    let sourceMap = this.bonuses.get(source)
    if (!sourceMap) {
      sourceMap = new Map()
      this.bonuses.set(source, sourceMap)
    }
    sourceMap.set(stat, amount)

    const newValue = this.getStat(stat)
    this.emitChange({ statType: stat, oldValue, newValue, source })
  }

  /**
   * Remove a bonus from a specific source.
   * @param source - The source of the bonus
   * @param stat - The stat type to remove bonus from
   */
  removeBonus(source: BonusSource, stat: StatType): void {
    const sourceMap = this.bonuses.get(source)
    if (!sourceMap) return

    const oldValue = this.getStat(stat)
    sourceMap.delete(stat)
    const newValue = this.getStat(stat)

    this.emitChange({ statType: stat, oldValue, newValue, source })
  }

  /**
   * Clear all bonuses from a specific source.
   * Used for prestige reset (clears upgrades) or buff expiration.
   * @param source - The source to clear
   */
  clearSource(source: BonusSource): void {
    const sourceMap = this.bonuses.get(source)
    if (!sourceMap || sourceMap.size === 0) return

    // Batch the changes
    this.startBatch()

    for (const stat of sourceMap.keys()) {
      const oldValue = this.getStat(stat)
      sourceMap.delete(stat)
      const newValue = this.getStat(stat)
      this.emitChange({ statType: stat, oldValue, newValue, source })
    }

    this.flushBatch()
  }

  /**
   * Get the current bonus for a stat from a specific source.
   * @param source - The bonus source
   * @param stat - The stat type
   * @returns The bonus value (0 if none)
   */
  getBonus(source: BonusSource, stat: StatType): number {
    return this.bonuses.get(source)?.get(stat) ?? 0
  }

  /**
   * Calculate the final value for a stat after all bonuses.
   * Formula: Base × (1 + upgrades) × (1 + crafted) × (1 + skill_tree) × (1 + temp_buff) × (1 + relic)
   *
   * @param stat - The stat type to calculate
   * @returns Final stat value after all multipliers
   */
  getStat(stat: StatType): number {
    const baseValue = BASE_VALUES[stat]

    let result = baseValue
    for (const source of BONUS_SOURCE_ORDER) {
      const bonus = this.getBonus(source, stat)
      result *= 1 + bonus
    }

    return result
  }

  /**
   * Get a detailed breakdown of how a stat is calculated.
   * Useful for debug display showing contribution from each source.
   *
   * @param stat - The stat type to break down
   * @returns Breakdown with base value, final value, and per-source bonuses
   */
  getStatBreakdown(stat: StatType): StatBreakdown {
    const bonusesBySource = new Map<BonusSource, number>()

    for (const source of BONUS_SOURCE_ORDER) {
      const bonus = this.getBonus(source, stat)
      if (bonus !== 0) {
        bonusesBySource.set(source, bonus)
      }
    }

    return {
      statType: stat,
      baseValue: BASE_VALUES[stat],
      finalValue: this.getStat(stat),
      bonusesBySource,
    }
  }

  /**
   * Format a stat breakdown as a human-readable string.
   * Example: "Damage: 15 = 1 base × 1.5 upgrades × 2.0 skills"
   */
  formatStatBreakdown(stat: StatType): string {
    const breakdown = this.getStatBreakdown(stat)
    let formula = `${stat}: ${breakdown.finalValue.toFixed(2)} = ${breakdown.baseValue} base`

    for (const [source, bonus] of breakdown.bonusesBySource) {
      formula += ` × ${(1 + bonus).toFixed(2)} ${source}`
    }

    return formula
  }

  /**
   * Subscribe to stat change events.
   * @param listener - Callback function
   * @returns Unsubscribe function
   */
  onStatChanged(listener: StatListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /**
   * Start batching events (events are collected but not emitted).
   * Call flushBatch() to emit all collected events.
   */
  startBatch(): void {
    this.batchMode = true
    this.pendingEvents = []
  }

  /**
   * Flush batched events, emitting them all at once.
   * Deduplicates events for the same stat (only last value reported).
   */
  flushBatch(): void {
    this.batchMode = false

    // Deduplicate: keep only the last event per stat
    const eventsBystat = new Map<StatType, StatChangedEvent>()
    for (const event of this.pendingEvents) {
      eventsBystat.set(event.statType, event)
    }

    for (const event of eventsBystat.values()) {
      for (const listener of this.listeners) {
        listener(event)
      }
    }

    this.pendingEvents = []
  }

  private emitChange(event: StatChangedEvent): void {
    if (event.oldValue === event.newValue) return

    if (this.batchMode) {
      this.pendingEvents.push(event)
    } else {
      for (const listener of this.listeners) {
        listener(event)
      }
    }
  }

  /**
   * Get all stats with their current values.
   * @returns Map of stat type to final value
   */
  getAllStats(): Map<StatType, number> {
    const stats = new Map<StatType, number>()
    for (const stat of Object.values(StatType)) {
      stats.set(stat, this.getStat(stat))
    }
    return stats
  }
}
