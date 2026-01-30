/**
 * InventorySystem - Tracks ore stacks and gold economy.
 */

import { ORE_CONFIG, OreType } from '../config/ores'
import { StatSystem } from './StatSystem'
import { StatType } from '../types/stats'

export interface OreStackChangedEvent {
  oreType: OreType
  oldCount: number
  newCount: number
  delta: number
}

export interface GoldChangedEvent {
  oldGold: number
  newGold: number
  delta: number
  lifetimeGold: number
  allTimeGold: number
}

export interface OreSoldEvent {
  oreType: OreType
  amount: number
  unitValue: number
  multiplier: number
  goldEarned: number
  totalGold: number
}

type OreListener = (event: OreStackChangedEvent) => void
type GoldListener = (event: GoldChangedEvent) => void
type OreSoldListener = (event: OreSoldEvent) => void

export class InventorySystem {
  private static instance: InventorySystem | null = null

  private ores: Map<OreType, number> = new Map()
  private gold = 0
  private lifetimeGold = 0
  private allTimeGold = 0

  private oreListeners: Set<OreListener> = new Set()
  private goldListeners: Set<GoldListener> = new Set()
  private oreSoldListeners: Set<OreSoldListener> = new Set()

  private constructor() {
    for (const oreType of Object.values(OreType)) {
      this.ores.set(oreType, 0)
    }
  }

  static getInstance(): InventorySystem {
    if (!InventorySystem.instance) {
      InventorySystem.instance = new InventorySystem()
    }
    return InventorySystem.instance
  }

  static resetInstance(): void {
    InventorySystem.instance = null
  }

  getGold(): number {
    return this.gold
  }

  getLifetimeGold(): number {
    return this.lifetimeGold
  }

  getAllTimeGold(): number {
    return this.allTimeGold
  }

  getOreCount(type: OreType): number {
    return this.ores.get(type) ?? 0
  }

  getAllOres(): Map<OreType, number> {
    return new Map(this.ores)
  }

  addOre(type: OreType, amount = 1): void {
    const delta = Math.max(0, Math.floor(amount))
    if (delta === 0) return

    const oldCount = this.getOreCount(type)
    const newCount = oldCount + delta
    this.ores.set(type, newCount)
    this.emitOreChanged({ oreType: type, oldCount, newCount, delta })
  }

  removeOre(type: OreType, amount = 1): boolean {
    const delta = Math.max(0, Math.floor(amount))
    if (delta === 0) return true

    const oldCount = this.getOreCount(type)
    if (oldCount < delta) return false

    const newCount = oldCount - delta
    this.ores.set(type, newCount)
    this.emitOreChanged({ oreType: type, oldCount, newCount, delta: -delta })
    return true
  }

  addGold(amount: number): void {
    const delta = Math.max(0, amount)
    if (delta === 0) return

    const oldGold = this.gold
    this.gold += delta
    this.lifetimeGold += delta
    this.allTimeGold += delta
    this.emitGoldChanged({
      oldGold,
      newGold: this.gold,
      delta,
      lifetimeGold: this.lifetimeGold,
      allTimeGold: this.allTimeGold,
    })
  }

  canAfford(amount: number): boolean {
    return this.gold >= amount
  }

  spendGold(amount: number): boolean {
    const delta = Math.max(0, amount)
    if (delta === 0) return true
    if (this.gold < delta) return false

    const oldGold = this.gold
    this.gold -= delta
    this.emitGoldChanged({
      oldGold,
      newGold: this.gold,
      delta: -delta,
      lifetimeGold: this.lifetimeGold,
      allTimeGold: this.allTimeGold,
    })
    return true
  }

  sellOre(type: OreType, amount?: number): number {
    const available = this.getOreCount(type)
    const requested = amount ?? available
    const sellAmount = Math.max(0, Math.min(Math.floor(requested), available))
    if (sellAmount === 0) return 0

    this.removeOre(type, sellAmount)

    const multiplier = this.getOreValueMultiplier()
    const unitValue = ORE_CONFIG[type].value
    const rawGold = sellAmount * unitValue * multiplier
    const goldEarned = Math.max(0, Math.round(rawGold))

    if (goldEarned > 0) {
      this.addGold(goldEarned)
    }

    this.emitOreSold({
      oreType: type,
      amount: sellAmount,
      unitValue,
      multiplier,
      goldEarned,
      totalGold: this.gold,
    })

    return goldEarned
  }

  sellAllOres(): number {
    let totalGold = 0
    const multiplier = this.getOreValueMultiplier()

    for (const oreType of Object.values(OreType)) {
      const count = this.getOreCount(oreType)
      if (count <= 0) continue

      const oldCount = count
      this.ores.set(oreType, 0)
      this.emitOreChanged({ oreType, oldCount, newCount: 0, delta: -oldCount })

      const unitValue = ORE_CONFIG[oreType].value
      const rawGold = count * unitValue * multiplier
      const goldEarned = Math.max(0, Math.round(rawGold))
      totalGold += goldEarned

      this.emitOreSold({
        oreType,
        amount: count,
        unitValue,
        multiplier,
        goldEarned,
        totalGold: this.gold + totalGold,
      })
    }

    if (totalGold > 0) {
      this.addGold(totalGold)
    }

    return totalGold
  }

  onOreChanged(listener: OreListener): () => void {
    this.oreListeners.add(listener)
    return () => this.oreListeners.delete(listener)
  }

  onGoldChanged(listener: GoldListener): () => void {
    this.goldListeners.add(listener)
    return () => this.goldListeners.delete(listener)
  }

  onOreSold(listener: OreSoldListener): () => void {
    this.oreSoldListeners.add(listener)
    return () => this.oreSoldListeners.delete(listener)
  }

  private emitOreChanged(event: OreStackChangedEvent): void {
    if (event.oldCount === event.newCount) return
    for (const listener of this.oreListeners) {
      listener(event)
    }
  }

  private emitGoldChanged(event: GoldChangedEvent): void {
    if (event.oldGold === event.newGold) return
    for (const listener of this.goldListeners) {
      listener(event)
    }
  }

  private emitOreSold(event: OreSoldEvent): void {
    if (event.amount <= 0) return
    for (const listener of this.oreSoldListeners) {
      listener(event)
    }
  }

  private getOreValueMultiplier(): number {
    return StatSystem.getInstance().getStat(StatType.ORE_VALUE)
  }
}
