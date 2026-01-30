/**
 * Block - Core block entity with type, HP, and state
 *
 * Blocks are the interactive objects players mine through.
 * Each block has HP that decreases when damaged, visual damage states,
 * and emits events on damage and destruction.
 */

import { BlockType, BLOCK_CONFIG } from '../config/blocks'

/** Event types emitted by Block */
export type BlockEventType = 'damage' | 'destroy'

/** Event payload for block damage */
export interface BlockDamageEvent {
  block: Block
  damage: number
  oldHp: number
  newHp: number
  hpPercent: number
}

/** Event payload for block destruction */
export interface BlockDestroyEvent {
  block: Block
  x: number
  y: number
  color: number
}

type BlockEventListener<T> = (event: T) => void

let blockIdCounter = 0

/**
 * Generate a unique block ID
 */
function generateBlockId(): string {
  return `block_${++blockIdCounter}`
}

/**
 * Block entity representing a single minable block in the grid.
 */
export class Block {
  /** Unique identifier */
  readonly id: string

  /** Block type (determines base stats) */
  readonly type: BlockType

  /** Current HP */
  private _hp: number

  /** Maximum HP (after depth scaling) */
  readonly maxHp: number

  /** Depth level where this block was spawned */
  readonly depth: number

  /** Grid column position */
  readonly x: number

  /** Grid row position */
  readonly y: number

  /** Base color for rendering */
  readonly baseColor: number

  /** Reference to Phaser game object (set by renderer) */
  gameObject: Phaser.GameObjects.Rectangle | Phaser.GameObjects.Image | null = null

  /** Optional frame behind the block image */
  frameObject: Phaser.GameObjects.Rectangle | null = null

  /** Event listeners */
  private damageListeners: Set<BlockEventListener<BlockDamageEvent>> = new Set()
  private destroyListeners: Set<BlockEventListener<BlockDestroyEvent>> = new Set()

  /**
   * Create a new block.
   * Use BlockFactory.createBlock() for proper HP scaling.
   *
   * @param type - Block type
   * @param x - Grid column
   * @param y - Grid row
   * @param depth - Depth level (for HP scaling)
   * @param scaledHp - Pre-calculated HP after depth scaling
   * @param baseColorOverride - Optional color override
   */
  constructor(
    type: BlockType,
    x: number,
    y: number,
    depth: number,
    scaledHp: number,
    baseColorOverride?: number
  ) {
    this.id = generateBlockId()
    this.type = type
    this.x = x
    this.y = y
    this.depth = depth
    this.maxHp = scaledHp
    this._hp = scaledHp
    this.baseColor = baseColorOverride ?? BLOCK_CONFIG[type].color
  }

  /**
   * Current HP
   */
  get hp(): number {
    return this._hp
  }

  /**
   * Get HP as percentage (0-1)
   */
  getHpPercent(): number {
    return this._hp / this.maxHp
  }

  /**
   * Check if block is destroyed
   */
  isDead(): boolean {
    return this._hp <= 0
  }

  /**
   * Apply damage to the block.
   * Emits 'damage' event. If HP reaches 0, emits 'destroy' event.
   *
   * @param amount - Damage to apply
   * @returns true if block was destroyed by this damage
   */
  takeDamage(amount: number): boolean {
    if (this.isDead()) return false

    const oldHp = this._hp
    this._hp = Math.max(0, this._hp - amount)

    // Emit damage event
    const damageEvent: BlockDamageEvent = {
      block: this,
      damage: amount,
      oldHp,
      newHp: this._hp,
      hpPercent: this.getHpPercent()
    }
    for (const listener of this.damageListeners) {
      listener(damageEvent)
    }

    // Check for destruction
    if (this._hp <= 0) {
      const destroyEvent: BlockDestroyEvent = {
        block: this,
        x: this.x,
        y: this.y,
        color: this.baseColor
      }
      for (const listener of this.destroyListeners) {
        listener(destroyEvent)
      }
      return true
    }

    return false
  }

  /**
   * Subscribe to damage events.
   * @returns Unsubscribe function
   */
  onDamage(listener: BlockEventListener<BlockDamageEvent>): () => void {
    this.damageListeners.add(listener)
    return () => this.damageListeners.delete(listener)
  }

  /**
   * Subscribe to destroy events.
   * @returns Unsubscribe function
   */
  onDestroy(listener: BlockEventListener<BlockDestroyEvent>): () => void {
    this.destroyListeners.add(listener)
    return () => this.destroyListeners.delete(listener)
  }

  /**
   * Clean up listeners and game object reference.
   * Call when removing block from grid.
   */
  dispose(): void {
    this.damageListeners.clear()
    this.destroyListeners.clear()
    if (this.gameObject) {
      this.gameObject.destroy()
      this.gameObject = null
    }
    if (this.frameObject) {
      this.frameObject.destroy()
      this.frameObject = null
    }
  }
}

/**
 * Reset block ID counter (useful for testing)
 */
export function resetBlockIdCounter(): void {
  blockIdCounter = 0
}
