/**
 * OreBlock - Block that drops ore on destruction.
 */

import { BlockType } from '../config/blocks'
import { ORE_CONFIG, OreTier, OreType } from '../config/ores'
import { getOreColor } from '../utils/ore'
import { Block } from './Block'
import { BlockFactory } from './BlockFactory'

export class OreBlock extends Block {
  readonly tier: OreTier
  readonly oreType: OreType
  readonly value: number
  readonly displayName: string

  private highlighted = false
  private highlightGraphic: Phaser.GameObjects.Rectangle | null = null
  private highlightTween: Phaser.Tweens.Tween | null = null

  private overlayGraphic: Phaser.GameObjects.Rectangle | null = null
  private glowGraphic: Phaser.GameObjects.Rectangle | null = null
  private glowTween: Phaser.Tweens.Tween | null = null

  constructor(oreType: OreType, terrainType: BlockType, x: number, y: number, depth: number) {
    const config = ORE_CONFIG[oreType]
    const scaledHp = BlockFactory.getScaledHp(terrainType, depth)
    const color = getOreColor(oreType)
    super(terrainType, x, y, depth, scaledHp, color)

    this.oreType = oreType
    this.tier = config.tier
    this.value = config.value
    this.displayName = config.name
  }

  setHighlighted(highlighted: boolean): void {
    this.highlighted = highlighted
    if (this.highlightGraphic) {
      this.highlightGraphic.setVisible(highlighted)
    }
    if (this.highlightTween) {
      if (highlighted) {
        this.highlightTween.play()
      } else {
        this.highlightTween.pause()
      }
    }
  }

  attachHighlightGraphic(graphic: Phaser.GameObjects.Rectangle, tween?: Phaser.Tweens.Tween): void {
    this.highlightGraphic = graphic
    this.highlightTween = tween ?? null
    this.highlightGraphic.setVisible(this.highlighted)
    if (this.highlightTween) {
      if (this.highlighted) {
        this.highlightTween.play()
      } else {
        this.highlightTween.pause()
      }
    }
  }

  attachOverlayGraphic(graphic: Phaser.GameObjects.Rectangle): void {
    this.overlayGraphic = graphic
  }

  attachGlowGraphic(graphic: Phaser.GameObjects.Rectangle, tween?: Phaser.Tweens.Tween | null): void {
    this.glowGraphic = graphic
    this.glowTween = tween ?? null
  }

  updateVisualPosition(x: number, y: number): void {
    if (this.overlayGraphic) {
      this.overlayGraphic.setPosition(x, y)
    }
    if (this.glowGraphic) {
      this.glowGraphic.setPosition(x, y)
    }
    if (this.highlightGraphic) {
      this.highlightGraphic.setPosition(x, y)
    }
  }

  override dispose(): void {
    super.dispose()
    this.overlayGraphic?.destroy()
    this.glowGraphic?.destroy()
    this.highlightGraphic?.destroy()
    this.highlightTween?.stop()
    this.glowTween?.stop()
    this.overlayGraphic = null
    this.glowGraphic = null
    this.highlightGraphic = null
    this.highlightTween = null
    this.glowTween = null
  }
}

export function isOreBlock(block: Block): block is OreBlock {
  return block instanceof OreBlock
}
