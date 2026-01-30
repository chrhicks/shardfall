/**
 * StatDebugPanel - Developer tool showing stat breakdown
 *
 * Toggle with D key. Shows all stats with full breakdown:
 * "Damage: 15 = 1 base × 1.5 upgrades × 2.0 skills"
 */

import { ORE_SPAWN_CHANCE, OreTier } from '../config'
import { StatSystem } from '../systems/StatSystem'
import { StatType } from '../types/stats'
import { getOreTierWeights, getOreTypesByTier } from '../utils'

export interface StatDebugPanelConfig {
  getDepth?: () => number
}

export class StatDebugPanel {
  private scene: Phaser.Scene
  private container: Phaser.GameObjects.Container
  private background: Phaser.GameObjects.Rectangle
  private texts: Map<StatType, Phaser.GameObjects.Text> = new Map()
  private titleText: Phaser.GameObjects.Text
  private oreTexts: Phaser.GameObjects.Text[] = []
  private visible = false
  private unsubscribe: (() => void) | null = null
  private getDepth: (() => number) | null = null
  private oreLinesEnabled = false

  private static readonly PADDING = 10
  private static readonly LINE_HEIGHT = 20
  private static readonly FONT_SIZE = 14
  private static readonly BG_COLOR = 0x000000
  private static readonly BG_ALPHA = 0.8
  private static readonly TEXT_COLOR = '#00ff00'
  private static readonly SECTION_SPACING = 8

  constructor(scene: Phaser.Scene, config: StatDebugPanelConfig = {}) {
    this.scene = scene
    this.getDepth = config.getDepth ?? null
    this.oreLinesEnabled = Boolean(this.getDepth)

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

    if (this.oreLinesEnabled) {
      y += StatDebugPanel.SECTION_SPACING
      this.oreTexts = this.createOreDebugText(y)
      for (const text of this.oreTexts) {
        this.container.add(text)
      }
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
    const oreLines = this.oreLinesEnabled ? 4 : 0
    const oreSpacing = this.oreLinesEnabled ? StatDebugPanel.SECTION_SPACING : 0
    return (
      StatDebugPanel.PADDING * 2 +
      StatDebugPanel.LINE_HEIGHT +
      5 +
      statCount * StatDebugPanel.LINE_HEIGHT +
      oreSpacing +
      oreLines * StatDebugPanel.LINE_HEIGHT
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

    if (this.oreLinesEnabled && this.getDepth && this.oreTexts.length >= 4) {
      const depth = this.getDepth()
      const spawnChance = Math.round(ORE_SPAWN_CHANCE * 100)
      this.oreTexts[0].setText('ORE DEBUG')
      this.oreTexts[1].setText(`Depth: ${depth} | Spawn: ${spawnChance}%`)
      this.oreTexts[2].setText(`Tier Weights: ${this.formatTierWeights(depth)}`)
      this.oreTexts[3].setText(`Ores by tier: ${this.formatTierCounts(depth)}`)
    }
  }

  private createOreDebugText(startY: number): Phaser.GameObjects.Text[] {
    const makeText = (y: number, color: string, size = StatDebugPanel.FONT_SIZE) =>
      this.scene.add.text(StatDebugPanel.PADDING, y, '', {
        fontSize: `${size}px`,
        color,
        fontFamily: 'monospace',
      })

    const title = makeText(startY, '#ffff00', StatDebugPanel.FONT_SIZE + 1)
    const line1 = makeText(startY + StatDebugPanel.LINE_HEIGHT, StatDebugPanel.TEXT_COLOR)
    const line2 = makeText(startY + StatDebugPanel.LINE_HEIGHT * 2, StatDebugPanel.TEXT_COLOR)
    const line3 = makeText(startY + StatDebugPanel.LINE_HEIGHT * 3, StatDebugPanel.TEXT_COLOR)

    return [title, line1, line2, line3]
  }

  private formatTierWeights(depth: number): string {
    const weights = getOreTierWeights(depth)
    const order: OreTier[] = [
      OreTier.COMMON,
      OreTier.UNCOMMON,
      OreTier.RARE,
      OreTier.EPIC,
      OreTier.LEGENDARY,
    ]
    return order
      .map((tier) => `${this.tierShortLabel(tier)} ${Math.round(weights[tier] ?? 0)}`)
      .join(' ')
  }

  private formatTierCounts(depth: number): string {
    const order: OreTier[] = [
      OreTier.COMMON,
      OreTier.UNCOMMON,
      OreTier.RARE,
      OreTier.EPIC,
      OreTier.LEGENDARY,
    ]
    return order
      .map((tier) => `${this.tierShortLabel(tier)}${getOreTypesByTier(tier, depth).length}`)
      .join(' ')
  }

  private tierShortLabel(tier: OreTier): string {
    switch (tier) {
      case OreTier.COMMON:
        return 'C'
      case OreTier.UNCOMMON:
        return 'U'
      case OreTier.RARE:
        return 'R'
      case OreTier.EPIC:
        return 'E'
      case OreTier.LEGENDARY:
        return 'L'
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
