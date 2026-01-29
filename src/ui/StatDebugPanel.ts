/**
 * StatDebugPanel - Developer tool showing stat breakdown
 *
 * Toggle with D key. Shows all stats with full breakdown:
 * "Damage: 15 = 1 base × 1.5 upgrades × 2.0 skills"
 */

import { StatSystem } from '../systems/StatSystem'
import { StatType } from '../types/stats'

export class StatDebugPanel {
  private scene: Phaser.Scene
  private container: Phaser.GameObjects.Container
  private background: Phaser.GameObjects.Rectangle
  private texts: Map<StatType, Phaser.GameObjects.Text> = new Map()
  private titleText: Phaser.GameObjects.Text
  private visible = false
  private unsubscribe: (() => void) | null = null

  private static readonly PADDING = 10
  private static readonly LINE_HEIGHT = 20
  private static readonly FONT_SIZE = 14
  private static readonly BG_COLOR = 0x000000
  private static readonly BG_ALPHA = 0.8
  private static readonly TEXT_COLOR = '#00ff00'

  constructor(scene: Phaser.Scene) {
    this.scene = scene

    // Create container (initially hidden)
    this.container = scene.add.container(10, 10)
    this.container.setDepth(1000) // Always on top
    this.container.setVisible(false)

    // Background
    this.background = scene.add.rectangle(
      0,
      0,
      400,
      this.calculateHeight(),
      StatDebugPanel.BG_COLOR,
      StatDebugPanel.BG_ALPHA
    )
    this.background.setOrigin(0, 0)
    this.container.add(this.background)

    // Title
    this.titleText = scene.add.text(
      StatDebugPanel.PADDING,
      StatDebugPanel.PADDING,
      'STAT DEBUG (D to close)',
      {
        fontSize: `${StatDebugPanel.FONT_SIZE + 2}px`,
        color: '#ffff00',
        fontFamily: 'monospace',
      }
    )
    this.container.add(this.titleText)

    // Create text for each stat
    let y = StatDebugPanel.PADDING + StatDebugPanel.LINE_HEIGHT + 5
    for (const stat of Object.values(StatType)) {
      const text = scene.add.text(StatDebugPanel.PADDING, y, '', {
        fontSize: `${StatDebugPanel.FONT_SIZE}px`,
        color: StatDebugPanel.TEXT_COLOR,
        fontFamily: 'monospace',
      })
      this.texts.set(stat, text)
      this.container.add(text)
      y += StatDebugPanel.LINE_HEIGHT
    }

    // Listen for D key
    scene.input.keyboard?.on('keydown-D', this.toggle, this)

    // Subscribe to stat changes
    this.unsubscribe = StatSystem.getInstance().onStatChanged(() => {
      if (this.visible) {
        this.refresh()
      }
    })
  }

  private calculateHeight(): number {
    const statCount = Object.values(StatType).length
    return (
      StatDebugPanel.PADDING * 2 +
      StatDebugPanel.LINE_HEIGHT +
      5 +
      statCount * StatDebugPanel.LINE_HEIGHT
    )
  }

  toggle = (): void => {
    this.visible = !this.visible
    this.container.setVisible(this.visible)
    if (this.visible) {
      this.refresh()
    }
  }

  show(): void {
    this.visible = true
    this.container.setVisible(true)
    this.refresh()
  }

  hide(): void {
    this.visible = false
    this.container.setVisible(false)
  }

  refresh(): void {
    const stats = StatSystem.getInstance()

    for (const stat of Object.values(StatType)) {
      const text = this.texts.get(stat)
      if (text) {
        text.setText(stats.formatStatBreakdown(stat))
      }
    }
  }

  destroy(): void {
    this.scene.input.keyboard?.off('keydown-D', this.toggle, this)
    if (this.unsubscribe) {
      this.unsubscribe()
    }
    this.container.destroy()
  }
}
