/**
 * InventoryPanel - Displays ore stacks with per-ore sell actions.
 */

import { Scene } from 'phaser'
import { ORE_CONFIG, OreType } from '../config/ores'
import { getOreColor } from '../utils'

export interface InventoryPanelConfig {
  /** X position */
  x: number
  /** Y position */
  y: number
  /** Optional sell handler */
  onSellOre?: (oreType: OreType) => void
}

interface InventoryRow {
  countText: Phaser.GameObjects.Text
  sellButton: Phaser.GameObjects.Rectangle
  sellLabel: Phaser.GameObjects.Text
  rowY: number
}

export class InventoryPanel {
  private scene: Scene
  private container: Phaser.GameObjects.Container
  private rows: Map<OreType, InventoryRow> = new Map()
  private onSellOre: ((oreType: OreType) => void) | null

  private static readonly WIDTH = 230
  private static readonly PADDING = 10
  private static readonly HEADER_HEIGHT = 20
  private static readonly ROW_HEIGHT = 16
  private static readonly ROW_GAP = 3
  private static readonly SELL_WIDTH = 44
  private static readonly SELL_HEIGHT = 14

  constructor(scene: Scene, config: InventoryPanelConfig) {
    this.scene = scene
    this.onSellOre = config.onSellOre ?? null

    this.container = scene.add.container(config.x, config.y)
    this.container.setDepth(120)

    const oreTypes = Object.values(OreType)
    const height = this.calculateHeight(oreTypes.length)

    const bg = scene.add.rectangle(0, 0, InventoryPanel.WIDTH, height, 0x151a2a, 0.92)
    bg.setOrigin(0, 0)
    bg.setStrokeStyle(2, 0x30384f)
    this.container.add(bg)

    const title = scene.add.text(InventoryPanel.PADDING, 6, 'INVENTORY', {
      fontFamily: 'Arial Black',
      fontSize: '11px',
      color: '#cbd5f5',
    })
    title.setOrigin(0, 0)
    this.container.add(title)

    const headerY = InventoryPanel.PADDING + InventoryPanel.HEADER_HEIGHT - 2
    const oreLabel = scene.add.text(InventoryPanel.PADDING + 18, headerY, 'ORE', {
      fontFamily: 'Arial',
      fontSize: '9px',
      color: '#7d87a8',
    })
    oreLabel.setOrigin(0, 0.5)
    this.container.add(oreLabel)

    const countLabel = scene.add.text(InventoryPanel.WIDTH - InventoryPanel.PADDING - 56, headerY, 'COUNT', {
      fontFamily: 'Arial',
      fontSize: '9px',
      color: '#7d87a8',
    })
    countLabel.setOrigin(1, 0.5)
    this.container.add(countLabel)

    this.createRows(oreTypes)
  }

  setOreCount(type: OreType, count: number): void {
    const row = this.rows.get(type)
    if (!row) return

    const clamped = Math.max(0, Math.floor(count))
    row.countText.setText(clamped.toString())

    const enabled = clamped > 0
    row.sellButton.setFillStyle(enabled ? 0x2f5b3a : 0x2a2d38)
    row.sellButton.setStrokeStyle(1, enabled ? 0x4e9c62 : 0x3a3f4f)
    row.sellLabel.setAlpha(enabled ? 1 : 0.5)
    row.sellLabel.setColor(enabled ? '#d7f5c4' : '#7a8398')

    if (enabled) {
      row.sellButton.setInteractive({ useHandCursor: true })
    } else {
      row.sellButton.disableInteractive()
    }
  }

  playSellFeedback(type: OreType, goldEarned: number): void {
    if (goldEarned <= 0) return
    const row = this.rows.get(type)
    if (!row) return

    const x = this.container.x + InventoryPanel.WIDTH - InventoryPanel.PADDING - 24
    const y = this.container.y + row.rowY + InventoryPanel.ROW_HEIGHT / 2
    const text = this.scene.add.text(x, y, `+${goldEarned}g`, {
      fontFamily: 'Arial Black',
      fontSize: '11px',
      color: '#ffd27a',
      stroke: '#000000',
      strokeThickness: 2,
    })
    text.setOrigin(1, 0.5)
    text.setDepth(140)

    this.scene.tweens.add({
      targets: text,
      y: y - 18,
      alpha: { from: 1, to: 0 },
      duration: 500,
      ease: 'Power2',
      onComplete: () => text.destroy(),
    })
  }

  getContainer(): Phaser.GameObjects.Container {
    return this.container
  }

  destroy(): void {
    this.container.destroy()
  }

  private calculateHeight(rowCount: number): number {
    return (
      InventoryPanel.PADDING * 2 +
      InventoryPanel.HEADER_HEIGHT +
      rowCount * (InventoryPanel.ROW_HEIGHT + InventoryPanel.ROW_GAP) -
      InventoryPanel.ROW_GAP
    )
  }

  private createRows(oreTypes: OreType[]): void {
    const rowLeft = InventoryPanel.PADDING
    const rowWidth = InventoryPanel.WIDTH - InventoryPanel.PADDING * 2
    const startY = InventoryPanel.PADDING + InventoryPanel.HEADER_HEIGHT + 4

    oreTypes.forEach((oreType, index) => {
      const rowY = startY + index * (InventoryPanel.ROW_HEIGHT + InventoryPanel.ROW_GAP)

      const rowBg = this.scene.add.rectangle(
        rowLeft,
        rowY,
        rowWidth,
        InventoryPanel.ROW_HEIGHT,
        0x1f2535,
        0.95
      )
      rowBg.setOrigin(0, 0)
      rowBg.setStrokeStyle(1, 0x2c3448, 0.6)
      this.container.add(rowBg)

      const icon = this.scene.add.rectangle(
        rowLeft + 9,
        rowY + InventoryPanel.ROW_HEIGHT / 2,
        9,
        9,
        getOreColor(oreType)
      )
      icon.setStrokeStyle(1, 0x0f121a)
      this.container.add(icon)

      const nameText = this.scene.add.text(
        rowLeft + 20,
        rowY + InventoryPanel.ROW_HEIGHT / 2,
        ORE_CONFIG[oreType].name,
        {
          fontFamily: 'Arial',
          fontSize: '11px',
          color: '#c7cbe0',
        }
      )
      nameText.setOrigin(0, 0.5)
      this.container.add(nameText)

      const countText = this.scene.add.text(
        rowLeft + rowWidth - InventoryPanel.SELL_WIDTH - 10,
        rowY + InventoryPanel.ROW_HEIGHT / 2,
        '0',
        {
          fontFamily: 'Arial Black',
          fontSize: '11px',
          color: '#ffffff',
        }
      )
      countText.setOrigin(1, 0.5)
      this.container.add(countText)

      const sellButton = this.scene.add.rectangle(
        rowLeft + rowWidth - InventoryPanel.SELL_WIDTH / 2,
        rowY + InventoryPanel.ROW_HEIGHT / 2,
        InventoryPanel.SELL_WIDTH,
        InventoryPanel.SELL_HEIGHT,
        0x2a2d38,
        1
      )
      sellButton.setStrokeStyle(1, 0x3a3f4f)
      sellButton.setOrigin(0.5)
      this.container.add(sellButton)

      const sellLabel = this.scene.add.text(
        rowLeft + rowWidth - InventoryPanel.SELL_WIDTH / 2,
        rowY + InventoryPanel.ROW_HEIGHT / 2,
        'SELL',
        {
          fontFamily: 'Arial Black',
          fontSize: '9px',
          color: '#7a8398',
        }
      )
      sellLabel.setOrigin(0.5)
      this.container.add(sellLabel)

      sellButton.on('pointerdown', () => {
        this.onSellOre?.(oreType)
      })

      this.rows.set(oreType, { countText, sellButton, sellLabel, rowY })
      this.setOreCount(oreType, 0)
    })
  }
}
