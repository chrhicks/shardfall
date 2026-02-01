/**
 * DepthIndicator - Displays current mining depth
 *
 * Shows the current depth prominently with milestone highlighting
 * at depths 25, 50, 75, 100, etc.
 */

import { Scene } from 'phaser'

export interface DepthIndicatorConfig {
  /** X position */
  x: number
  /** Y position */
  y: number
  /** Initial depth (default: 0) */
  initialDepth?: number
}

/** Milestone depths for special highlighting */
const MILESTONES = [25, 50, 75, 100, 150, 200, 250, 300, 400, 500]

/**
 * DepthIndicator displays the current mining depth.
 */
export class DepthIndicator {
  private scene: Scene
  private container: Phaser.GameObjects.Container

  private labelText: Phaser.GameObjects.Text
  private valueText: Phaser.GameObjects.Text
  private milestoneGlow: Phaser.GameObjects.Rectangle

  private _depth = 0

  constructor(scene: Scene, config: DepthIndicatorConfig) {
    this.scene = scene
    this._depth = config.initialDepth ?? 0

    this.container = scene.add.container(config.x, config.y)
    this.container.setDepth(100) // Above most UI

    // Background panel
    const bg = scene.add.rectangle(0, 0, 120, 60, 0x1a1a2e, 0.9)
    bg.setStrokeStyle(2, 0x3a3a5a)
    this.container.add(bg)

    // Milestone glow (hidden by default)
    this.milestoneGlow = scene.add.rectangle(0, 0, 130, 70, 0xffd700, 0)
    this.container.add(this.milestoneGlow)

    // Label
    this.labelText = scene.add.text(0, -15, 'DEPTH', {
      fontFamily: 'Arial',
      fontSize: '12px',
      color: '#888888'
    })
    this.labelText.setOrigin(0.5)
    this.container.add(this.labelText)

    // Value
    this.valueText = scene.add.text(0, 10, '0', {
      fontFamily: 'Arial Black',
      fontSize: '24px',
      color: '#ffffff'
    })
    this.valueText.setOrigin(0.5)
    this.container.add(this.valueText)

    // Initial update
    this.updateDisplay()
  }

  /**
   * Current depth value
   */
  get depth(): number {
    return this._depth
  }

  /**
   * Set the depth and update display
   */
  setDepth(depth: number): void {
    const oldDepth = this._depth
    if (depth === oldDepth) return
    this._depth = depth
    this.updateDisplay()

    this.playDepthChangeEffect()

    // Check for milestone crossing
    if (this.crossedMilestone(oldDepth, depth)) {
      this.playMilestoneEffect()
    }
  }

  /**
   * Check if a milestone was crossed between old and new depth
   */
  private crossedMilestone(oldDepth: number, newDepth: number): boolean {
    for (const milestone of MILESTONES) {
      if (oldDepth < milestone && newDepth >= milestone) {
        return true
      }
    }
    return false
  }

  /**
   * Update the visual display
   */
  private updateDisplay(): void {
    this.valueText.setText(this._depth.toString())

    // Color based on depth tier
    if (this._depth >= 100) {
      this.valueText.setColor('#9966ff') // Purple for deep
    } else if (this._depth >= 50) {
      this.valueText.setColor('#66ccff') // Blue for mid
    } else if (this._depth >= 25) {
      this.valueText.setColor('#66ff66') // Green for early-mid
    } else {
      this.valueText.setColor('#ffffff') // White for surface
    }
  }

  /**
   * Play milestone celebration effect
   */
  private playMilestoneEffect(): void {
    // Flash gold
    this.valueText.setColor('#ffd700')

    // Glow effect
    this.scene.tweens.add({
      targets: this.milestoneGlow,
      alpha: { from: 0.5, to: 0 },
      scale: { from: 1, to: 1.3 },
      duration: 500,
      ease: 'Power2'
    })

    // Scale pop
    this.scene.tweens.add({
      targets: this.valueText,
      scale: { from: 1.5, to: 1 },
      duration: 300,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.updateDisplay() // Reset color
      }
    })

    // Shake
    this.scene.tweens.add({
      targets: this.container,
      x: this.container.x + 3,
      duration: 50,
      yoyo: true,
      repeat: 3
    })
  }

  private playDepthChangeEffect(): void {
    this.scene.tweens.add({
      targets: this.valueText,
      scale: { from: 1.2, to: 1 },
      duration: 300,
      ease: 'Back.easeOut'
    })

    this.scene.tweens.add({
      targets: this.milestoneGlow,
      alpha: { from: 0.15, to: 0 },
      duration: 200,
      ease: 'Quad.easeOut'
    })
  }

  /**
   * Get container for external positioning
   */
  getContainer(): Phaser.GameObjects.Container {
    return this.container
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.container.destroy()
  }
}
