/**
 * CaveFrame - Atmospheric framing around the mining grid
 *
 * Creates rocky borders, torch effects, and depth gradients
 * to give the mining area a cave-like atmosphere.
 */

import { Scene } from 'phaser'

export interface CaveFrameConfig {
  /** Left edge of the grid area */
  gridLeft: number
  /** Right edge of the grid area */
  gridRight: number
  /** Top of the grid area */
  gridTop: number
  /** Bottom of the grid area */
  gridBottom: number
  /** Width of the cave frame border (default: 20) */
  borderWidth?: number
  /** Whether to show torches (default: true) */
  showTorches?: boolean
}

const DEFAULT_CONFIG = {
  borderWidth: 20,
  showTorches: true,
}

/**
 * CaveFrame renders atmospheric framing around the mining grid.
 */
export class CaveFrame {
  private scene: Scene
  private config: Required<CaveFrameConfig>

  private container: Phaser.GameObjects.Container
  private graphics: Phaser.GameObjects.Graphics
  private torchEmitters: Phaser.GameObjects.Particles.ParticleEmitter[] = []

  constructor(scene: Scene, config: CaveFrameConfig) {
    this.scene = scene
    this.config = { ...DEFAULT_CONFIG, ...config } as Required<CaveFrameConfig>

    this.container = scene.add.container(0, 0)
    this.container.setDepth(5) // Behind grid blocks

    this.graphics = scene.add.graphics()
    this.container.add(this.graphics)

    this.drawFrame()

    if (this.config.showTorches) {
      this.createTorches()
    }
  }

  /**
   * Draw the cave frame borders
   */
  private drawFrame(): void {
    const { gridLeft, gridRight, gridTop, gridBottom, borderWidth } = this.config

    const frameLeft = gridLeft - borderWidth
    const frameRight = gridRight + borderWidth
    const frameTop = gridTop - borderWidth

    // Rocky border color
    const rockColor = 0x2a2a3e

    // Only draw borders AROUND the grid, not over it
    // Top border
    this.graphics.fillStyle(0x0a0a15, 1)
    this.graphics.fillRect(frameLeft, frameTop, frameRight - frameLeft, borderWidth)

    // Bottom border
    this.graphics.fillRect(frameLeft, gridBottom, frameRight - frameLeft, borderWidth)

    // Left border (rocky texture simulation)
    this.drawRockyBorder(frameLeft, gridTop, borderWidth, gridBottom - gridTop, 'left')

    // Right border
    this.drawRockyBorder(gridRight, gridTop, borderWidth, gridBottom - gridTop, 'right')

    // Inner stroke around grid
    this.graphics.lineStyle(3, rockColor, 1)
    this.graphics.strokeRect(
      gridLeft - 2,
      gridTop - 2,
      gridRight - gridLeft + 4,
      gridBottom - gridTop + 4
    )
  }

  /**
   * Draw a rocky-looking border
   */
  private drawRockyBorder(
    x: number,
    y: number,
    width: number,
    height: number,
    side: 'left' | 'right'
  ): void {
    const segments = Math.floor(height / 30)

    for (let i = 0; i < segments; i++) {
      const segY = y + i * 30
      const segHeight = 30

      // Vary the color slightly for texture
      const colorVariation = Math.random() * 0.1
      const baseColor = 0x2a2a3e
      const r = ((baseColor >> 16) & 0xff) * (1 - colorVariation)
      const g = ((baseColor >> 8) & 0xff) * (1 - colorVariation)
      const b = (baseColor & 0xff) * (1 - colorVariation)
      const color = (Math.floor(r) << 16) | (Math.floor(g) << 8) | Math.floor(b)

      this.graphics.fillStyle(color, 1)

      // Jagged edge simulation
      const indent = Math.random() * 5
      if (side === 'left') {
        this.graphics.fillRect(x + indent, segY, width - indent, segHeight)
      } else {
        this.graphics.fillRect(x, segY, width - indent, segHeight)
      }
    }
  }

  /**
   * Create torch particle effects
   */
  private createTorches(): void {
    const { gridLeft, gridRight, gridTop, borderWidth } = this.config

    // Ensure particle texture exists
    this.ensureParticleTexture()

    // Torch positions (left and right sides)
    const torchY = [gridTop + 60, gridTop + 200, gridTop + 340]

    for (const y of torchY) {
      // Left torch
      this.createTorch(gridLeft - borderWidth / 2, y)
      // Right torch
      this.createTorch(gridRight + borderWidth / 2, y)
    }
  }

  /**
   * Ensure particle texture exists
   */
  private ensureParticleTexture(): void {
    const key = 'torch_particle'
    if (this.scene.textures.exists(key)) return

    const graphics = this.scene.make.graphics({ x: 0, y: 0 }, false)
    graphics.fillStyle(0xffffff, 1)
    graphics.fillCircle(2, 2, 2)
    graphics.generateTexture(key, 4, 4)
    graphics.destroy()
  }

  /**
   * Create a single torch with flickering effect
   */
  private createTorch(x: number, y: number): void {
    // Torch base (simple rectangle)
    const torchBase = this.scene.add.rectangle(x, y, 8, 16, 0x4a3728)
    torchBase.setStrokeStyle(1, 0x2a1a10)
    this.container.add(torchBase)

    // Flame particle emitter
    const emitter = this.scene.add.particles(x, y - 12, 'torch_particle', {
      lifespan: { min: 200, max: 400 },
      speed: { min: 10, max: 30 },
      angle: { min: 250, max: 290 },
      scale: { start: 1, end: 0 },
      alpha: { start: 0.8, end: 0 },
      tint: [0xff6600, 0xff9900, 0xffcc00],
      frequency: 50,
      quantity: 1,
      blendMode: 'ADD',
    })

    this.container.add(emitter)
    this.torchEmitters.push(emitter)

    // Glow around torch
    const glow = this.scene.add.circle(x, y - 10, 25, 0xff6600, 0.1)
    this.container.add(glow)

    // Flicker the glow
    this.scene.tweens.add({
      targets: glow,
      alpha: { from: 0.08, to: 0.15 },
      scale: { from: 0.9, to: 1.1 },
      duration: 200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    for (const emitter of this.torchEmitters) {
      emitter.destroy()
    }
    this.torchEmitters = []
    this.container.destroy()
  }
}
