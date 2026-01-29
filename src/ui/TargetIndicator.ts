/**
 * TargetIndicator - Visual highlight for the block under the cursor
 *
 * Shows a semi-transparent white rectangle overlay with a subtle pulsing
 * animation when hovering over a valid block. Hides when no valid block
 * is under the cursor.
 */

import { Scene } from 'phaser'

/** Configuration for target indicator */
export interface TargetIndicatorConfig {
  /** Size of the indicator (should match block size) */
  size: number
  /** Initial x position */
  x?: number
  /** Initial y position */
  y?: number
}

/**
 * TargetIndicator shows a highlight over the hovered block.
 */
export class TargetIndicator {
  private scene: Scene

  /** The highlight rectangle */
  private highlight: Phaser.GameObjects.Rectangle

  /** Pulse animation tween */
  private pulseTween: Phaser.Tweens.Tween | null = null

  constructor(scene: Scene, config: TargetIndicatorConfig) {
    this.scene = scene

    // Create highlight rectangle (initially hidden)
    this.highlight = scene.add.rectangle(
      config.x ?? 0,
      config.y ?? 0,
      config.size - 4,
      config.size - 4,
      0xffffff,
      0.3
    )
    this.highlight.setStrokeStyle(3, 0xffffff, 0.8)
    this.highlight.setDepth(15) // Between grid (10) and miner (20)
    this.highlight.setVisible(false)

    // Start pulse animation
    this.startPulse()
  }

  /**
   * Start the pulsing animation
   */
  private startPulse(): void {
    this.pulseTween = this.scene.tweens.add({
      targets: this.highlight,
      alpha: { from: 0.5, to: 0.8 },
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })
  }

  /**
   * Show the indicator at the specified position
   */
  show(x: number, y: number): void {
    this.highlight.setPosition(x, y)
    this.highlight.setVisible(true)
  }

  /**
   * Hide the indicator
   */
  hide(): void {
    this.highlight.setVisible(false)
  }

  /**
   * Check if the indicator is currently visible
   */
  isVisible(): boolean {
    return this.highlight.visible
  }

  /**
   * Get the highlight game object (for external styling if needed)
   */
  getHighlight(): Phaser.GameObjects.Rectangle {
    return this.highlight
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.pulseTween) {
      this.pulseTween.destroy()
      this.pulseTween = null
    }
    this.highlight.destroy()
  }
}
