/**
 * GoldDisplay - Displays current gold balance and gain feedback.
 */

import { Scene } from 'phaser'
import Decimal from 'break_infinity.js'

export interface GoldDisplayConfig {
  /** X position */
  x: number
  /** Y position */
  y: number
  /** Initial gold value */
  initialGold?: number
}

export class GoldDisplay {
  private scene: Scene
  private container: Phaser.GameObjects.Container
  private valueText: Phaser.GameObjects.Text
  private glow: Phaser.GameObjects.Rectangle
  private goldTween: Phaser.Tweens.Tween | null = null
  private _gold = 0

  constructor(scene: Scene, config: GoldDisplayConfig) {
    this.scene = scene
    this._gold = config.initialGold ?? 0

    this.container = scene.add.container(config.x, config.y)
    this.container.setDepth(120)

    const bg = scene.add.rectangle(0, 0, 170, 56, 0x1a1a2e, 0.92)
    bg.setStrokeStyle(2, 0x4a3a1f)
    this.container.add(bg)

    this.glow = scene.add.rectangle(0, 0, 182, 64, 0xffd27a, 0)
    this.container.add(this.glow)

    const coin = scene.add.circle(-54, 0, 14, 0xffd27a, 1)
    coin.setStrokeStyle(2, 0x7a4b12)
    this.container.add(coin)

    const coinHighlight = scene.add.circle(-59, -5, 4, 0xffffff, 0.55)
    this.container.add(coinHighlight)

    const label = scene.add.text(-32, -12, 'GOLD', {
      fontFamily: 'Arial',
      fontSize: '11px',
      color: '#ffd27a',
    })
    label.setOrigin(0, 0.5)
    this.container.add(label)

    this.valueText = scene.add.text(-32, 10, this.formatGold(this._gold), {
      fontFamily: 'Arial Black',
      fontSize: '20px',
      color: '#ffffff',
    })
    this.valueText.setOrigin(0, 0.5)
    this.container.add(this.valueText)
  }

  setGold(amount: number): void {
    const previous = this._gold
    this._gold = amount

    if (amount > previous) {
      this.animateGold(previous, amount)
    } else {
      this.valueText.setText(this.formatGold(amount))
    }
  }

  playGainEffect(amount: number): void {
    if (amount <= 0) return

    const anchor = this.getGainAnchor()
    const gainText = this.scene.add.text(anchor.x, anchor.y, `+${this.formatGold(amount)}g`, {
      fontFamily: 'Arial Black',
      fontSize: '14px',
      color: '#ffd27a',
      stroke: '#000000',
      strokeThickness: 2,
    })
    gainText.setOrigin(0.5)
    gainText.setDepth(140)

    this.scene.tweens.add({
      targets: gainText,
      y: anchor.y - 24,
      alpha: { from: 1, to: 0 },
      duration: 600,
      ease: 'Power2',
      onComplete: () => gainText.destroy(),
    })

    this.scene.tweens.killTweensOf(this.valueText)
    this.scene.tweens.add({
      targets: this.valueText,
      scale: { from: 1.18, to: 1 },
      duration: 220,
      ease: 'Back.easeOut',
    })

    this.scene.tweens.killTweensOf(this.glow)
    this.scene.tweens.add({
      targets: this.glow,
      alpha: { from: 0.5, to: 0 },
      scale: { from: 1, to: 1.12 },
      duration: 260,
      ease: 'Quad.easeOut',
      onComplete: () => this.glow.setScale(1),
    })

    if (this.scene.cache.audio.exists('coin')) {
      this.scene.sound.play('coin', { volume: 0.35 })
    }
  }

  getContainer(): Phaser.GameObjects.Container {
    return this.container
  }

  destroy(): void {
    this.goldTween?.stop()
    this.container.destroy()
  }

  private getGainAnchor(): { x: number; y: number } {
    return { x: this.container.x + 40, y: this.container.y - 18 }
  }

  private animateGold(from: number, to: number): void {
    this.goldTween?.stop()
    const duration = Math.min(550, 200 + Math.max(0, Math.log10(Math.max(1, to - from))) * 120)
    this.goldTween = this.scene.tweens.addCounter({
      from,
      to,
      duration,
      ease: 'Cubic.easeOut',
      onUpdate: (tween) => {
        this.valueText.setText(this.formatGold(tween.getValue()))
      },
      onComplete: () => {
        this.valueText.setText(this.formatGold(to))
        this.goldTween = null
      },
    })
  }

  private formatGold(amount: number): string {
    const value = new Decimal(amount)
    if (value.lt(1e6)) {
      return value.toFixed(0)
    }
    return value.toExponential(2)
  }
}
