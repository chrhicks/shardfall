/**
 * BlockEffects - Visual effects for block destruction
 *
 * Provides satisfying feedback when blocks break:
 * - Particle burst (small squares flying outward)
 * - Screen shake (subtle, 2-3px)
 * - Sound effect placeholder
 */

import { darkenColor, lightenColor } from './color'

/** Particle texture key (generated at runtime) */
const PARTICLE_TEXTURE_KEY = 'block_particle'

/** Whether the particle texture has been created */
let particleTextureCreated = false

/**
 * Ensure the particle texture exists.
 * Creates a simple 4x4 white square that can be tinted.
 */
function ensureParticleTexture(scene: Phaser.Scene): void {
  if (particleTextureCreated) return
  if (scene.textures.exists(PARTICLE_TEXTURE_KEY)) {
    particleTextureCreated = true
    return
  }

  // Create a small canvas texture
  const graphics = scene.make.graphics({ x: 0, y: 0 }, false)
  graphics.fillStyle(0xffffff, 1)
  graphics.fillRect(0, 0, 4, 4)
  graphics.generateTexture(PARTICLE_TEXTURE_KEY, 4, 4)
  graphics.destroy()

  particleTextureCreated = true
}

/**
 * Configuration for block break effect
 */
export interface BlockBreakEffectConfig {
  /** Number of particles (default: 8) */
  particleCount?: number
  /** Particle lifespan in ms (default: 300) */
  lifespan?: number
  /** Particle speed (default: 100) */
  speed?: number
  /** Whether to shake camera (default: true) */
  shakeCamera?: boolean
  /** Camera shake intensity in pixels (default: 2) */
  shakeIntensity?: number
  /** Camera shake duration in ms (default: 50) */
  shakeDuration?: number
}

const DEFAULT_CONFIG: Required<BlockBreakEffectConfig> = {
  particleCount: 8,
  lifespan: 300,
  speed: 100,
  shakeCamera: true,
  shakeIntensity: 2,
  shakeDuration: 50,
}

/**
 * Play block destruction effect at the specified position.
 *
 * @param scene - Phaser scene
 * @param x - World X position (center of block)
 * @param y - World Y position (center of block)
 * @param color - Block color for particles
 * @param config - Optional effect configuration
 */
export function playBlockBreakEffect(
  scene: Phaser.Scene,
  x: number,
  y: number,
  color: number,
  config: BlockBreakEffectConfig = {}
): void {
  const cfg = { ...DEFAULT_CONFIG, ...config }

  ensureParticleTexture(scene)

  // Create particle emitter
  const particles = scene.add.particles(x, y, PARTICLE_TEXTURE_KEY, {
    lifespan: cfg.lifespan,
    speed: { min: cfg.speed * 0.5, max: cfg.speed },
    angle: { min: 0, max: 360 },
    scale: { start: 1.5, end: 0.5 },
    alpha: { start: 1, end: 0 },
    gravityY: 200,
    quantity: cfg.particleCount,
    emitting: false,
    tint: [
      color,
      darkenColor(color, 0.2),
      lightenColor(color, 0.2),
    ],
  })

  // Emit all particles at once
  particles.explode(cfg.particleCount)

  // Clean up after effect completes
  scene.time.delayedCall(cfg.lifespan + 50, () => {
    particles.destroy()
  })

  // Camera shake
  if (cfg.shakeCamera) {
    scene.cameras.main.shake(cfg.shakeDuration, cfg.shakeIntensity / 1000)
  }

  // TODO: Sound effect placeholder
  // scene.sound.play('block_break')
}

/**
 * Play a lighter hit effect (for damage without destruction).
 * Just a small particle puff, no shake.
 *
 * @param scene - Phaser scene
 * @param x - World X position
 * @param y - World Y position
 * @param color - Block color
 */
export function playBlockHitEffect(
  scene: Phaser.Scene,
  x: number,
  y: number,
  color: number
): void {
  ensureParticleTexture(scene)

  const particles = scene.add.particles(x, y, PARTICLE_TEXTURE_KEY, {
    lifespan: 150,
    speed: { min: 20, max: 50 },
    angle: { min: 0, max: 360 },
    scale: { start: 0.8, end: 0.2 },
    alpha: { start: 0.8, end: 0 },
    quantity: 3,
    emitting: false,
    tint: color,
  })

  particles.explode(3)

  scene.time.delayedCall(200, () => {
    particles.destroy()
  })
}

/**
 * Reset particle texture state (for testing or scene cleanup).
 */
export function resetBlockEffects(): void {
  particleTextureCreated = false
}
