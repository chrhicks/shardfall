/**
 * Miner - Player character that mines blocks
 *
 * The miner is the player's avatar and the source of all mining actions.
 * Players click on blocks to mine them, with the miner visually swinging
 * at the target. Swing speed determines how fast the next click can happen.
 */

import { Scene } from 'phaser'
import { StatSystem } from '../systems/StatSystem'
import { StatType } from '../types/stats'
import { Block } from './Block'
import { AxeProjectile, AxeProjectilePool } from './AxeProjectile'

/** Miner configuration */
export interface MinerConfig {
  /** X position (center) */
  x: number
  /** Y position (center) */
  y: number
  /** Optional axe projectile pool for throw loop */
  axePool?: AxeProjectilePool
}

/**
 * Miner entity representing the player character.
 */
export class Miner {
  private scene: Scene

  /** Position */
  private _x: number
  private _y: number

  /** Visual components */
  private container: Phaser.GameObjects.Container
  private body: Phaser.GameObjects.Rectangle
  private head: Phaser.GameObjects.Rectangle
  private pickaxe: Phaser.GameObjects.Container
  private pickaxeHandle: Phaser.GameObjects.Rectangle
  private pickaxeHead: Phaser.GameObjects.Polygon

  /** Swing state */
  private isSwinging = false
  private lastSwingTime = 0

  /** Axe projectile pool (optional) */
  private axePool: AxeProjectilePool | null = null

  constructor(scene: Scene, config: MinerConfig) {
    this.scene = scene
    this._x = config.x
    this._y = config.y
    this.axePool = config.axePool ?? null

    // Create container for all miner parts
    this.container = scene.add.container(this._x, this._y)
    this.container.setDepth(20) // Above grid

    // Create body (torso)
    this.body = scene.add.rectangle(0, 0, 24, 32, 0x4a4a8a)
    this.body.setStrokeStyle(2, 0x2a2a5a)

    // Create head
    this.head = scene.add.rectangle(0, -24, 20, 20, 0xffcc99)
    this.head.setStrokeStyle(2, 0xcc9966)

    // Create pickaxe container (for rotation)
    this.pickaxe = scene.add.container(12, -8)

    // Pickaxe handle
    this.pickaxeHandle = scene.add.rectangle(16, 0, 32, 6, 0x8b4513)
    this.pickaxeHandle.setStrokeStyle(1, 0x5c2e0a)

    // Pickaxe head (triangle shape)
    this.pickaxeHead = scene.add.polygon(32, 0, [
      0, -8,  // top
      16, 0,  // right
      0, 8,   // bottom
    ], 0x888888)
    this.pickaxeHead.setStrokeStyle(1, 0x444444)

    // Add pickaxe parts to pickaxe container
    this.pickaxe.add([this.pickaxeHandle, this.pickaxeHead])

    // Add all parts to main container
    this.container.add([this.body, this.head, this.pickaxe])

    // Set initial pickaxe angle (resting position)
    this.pickaxe.setAngle(-30)
  }

  /**
   * Get current X position
   */
  get x(): number {
    return this._x
  }

  /**
   * Get current Y position
   */
  get y(): number {
    return this._y
  }

  /**
   * Get the miner's damage value from StatSystem
   */
  getDamage(): number {
    return StatSystem.getInstance().getStat(StatType.DAMAGE)
  }

  /**
   * Get the miner's speed value (hits per second) from StatSystem
   */
  getSpeed(): number {
    return StatSystem.getInstance().getStat(StatType.SPEED)
  }

  /**
   * Check if the miner can swing (cooldown based on speed)
   */
  canSwing(): boolean {
    if (this.isSwinging) return false

    const now = Date.now()
    const cooldown = 1000 / this.getSpeed() // ms between swings
    return now - this.lastSwingTime >= cooldown
  }

  /**
   * Play the swing animation
   * @returns Promise that resolves when animation completes
   */
  swing(): Promise<void> {
    if (!this.canSwing()) {
      return Promise.resolve()
    }

    this.isSwinging = true
    this.lastSwingTime = Date.now()

    return new Promise((resolve) => {
      // Calculate swing duration based on speed (faster speed = faster animation)
      const speed = this.getSpeed()
      const baseDuration = 150
      const duration = Math.max(50, baseDuration / Math.sqrt(speed))

      // Swing animation: pickaxe rotates from -30 to 30 degrees
      this.scene.tweens.add({
        targets: this.pickaxe,
        angle: 30,
        duration: duration,
        ease: 'Power2',
        yoyo: true,
        onComplete: () => {
          this.pickaxe.setAngle(-30)
          this.isSwinging = false
          resolve()
        },
      })

      // Slight body movement
      this.scene.tweens.add({
        targets: this.body,
        x: 3,
        duration: duration,
        ease: 'Power2',
        yoyo: true,
      })
    })
  }

  /**
   * Get whether the miner is currently swinging
   */
  getIsSwinging(): boolean {
    return this.isSwinging
  }

  /**
   * Mine a block - handles cooldown check, damage, and swing animation.
   * This is the main mining action that combines everything.
   *
   * @param block - The block to mine
   * @returns Object with damage dealt and whether block was destroyed, or null if on cooldown
   */
  mine(block: Block): { damage: number; destroyed: boolean } | null {
    if (!this.canSwing()) {
      return null
    }

    const damage = this.getDamage()
    const destroyed = block.takeDamage(damage)

    // Play swing animation (fire and forget)
    this.swing()

    return { damage, destroyed }
  }

  /**
   * Set miner position
   */
  setPosition(x: number, y: number): void {
    this._x = x
    this._y = y
    this.container.setPosition(x, y)
  }

  /**
   * Get the pickaxe container (for external effects)
   */
  getPickaxe(): Phaser.GameObjects.Container {
    return this.pickaxe
  }

  /**
   * Get the main container
   */
  getContainer(): Phaser.GameObjects.Container {
    return this.container
  }

  /**
   * Throw an axe toward a target block and apply damage on impact.
   */
  tryThrow(): { projectile: AxeProjectile; origin: { x: number; y: number } } | null {
    if (!this.axePool) return null
    if (!this.canSwing()) return null

    const origin = this.getPickaxeWorldPosition()
    this.lastSwingTime = Date.now()

    const projectile = this.axePool.acquire()
    return { projectile, origin }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.container.destroy()
  }

  getPickaxeWorldPosition(): { x: number; y: number } {
    const matrix = this.pickaxe.getWorldTransformMatrix()
    return { x: matrix.tx, y: matrix.ty }
  }
}
