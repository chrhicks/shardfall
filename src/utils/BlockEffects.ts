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
  shakeDuration: 50
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
    tint: [color, darkenColor(color, 0.2), lightenColor(color, 0.2)]
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
export function playBlockHitEffect(scene: Phaser.Scene, x: number, y: number, color: number): void {
  ensureParticleTexture(scene)

  const particles = scene.add.particles(x, y, PARTICLE_TEXTURE_KEY, {
    lifespan: 150,
    speed: { min: 20, max: 50 },
    angle: { min: 0, max: 360 },
    scale: { start: 0.8, end: 0.2 },
    alpha: { start: 0.8, end: 0 },
    quantity: 3,
    emitting: false,
    tint: color
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

/**
 * Configuration for floating damage number
 */
export interface DamageNumberConfig {
  /** Duration of float animation in ms (default: 500) */
  duration?: number
  /** How far to float upward in pixels (default: 30) */
  floatDistance?: number
  /** Font size (default: '16px') */
  fontSize?: string
  /** Text color (default: '#ffffff') */
  color?: string
  /** Whether to add a critical hit style (larger, yellow) */
  isCritical?: boolean
}

const DEFAULT_DAMAGE_CONFIG: Required<Omit<DamageNumberConfig, 'isCritical'>> = {
  duration: 500,
  floatDistance: 30,
  fontSize: '16px',
  color: '#ffffff'
}

/**
 * Show a floating damage number that rises and fades out.
 *
 * @param scene - Phaser scene
 * @param x - World X position
 * @param y - World Y position
 * @param damage - Damage amount to display
 * @param config - Optional configuration
 */
export function showDamageNumber(
  scene: Phaser.Scene,
  x: number,
  y: number,
  damage: number,
  config: DamageNumberConfig = {}
): void {
  const cfg = { ...DEFAULT_DAMAGE_CONFIG, ...config }

  // Format damage (round to 1 decimal if needed)
  const damageText = damage % 1 === 0 ? damage.toString() : damage.toFixed(1)

  // Create text with style
  const style: Phaser.Types.GameObjects.Text.TextStyle = {
    fontFamily: 'Arial Black',
    fontSize: config.isCritical ? '24px' : cfg.fontSize,
    color: config.isCritical ? '#ffff00' : cfg.color,
    stroke: '#000000',
    strokeThickness: config.isCritical ? 4 : 2
  }

  const text = scene.add.text(x, y, damageText, style)
  text.setOrigin(0.5)
  text.setDepth(100) // Above everything

  // Add slight random horizontal offset for visual variety
  const xOffset = Phaser.Math.Between(-10, 10)

  // Float up and fade animation
  scene.tweens.add({
    targets: text,
    y: y - cfg.floatDistance,
    x: x + xOffset,
    alpha: { from: 1, to: 0 },
    duration: cfg.duration,
    ease: 'Power2',
    onComplete: () => {
      text.destroy()
    }
  })

  // Scale pop for critical hits
  if (config.isCritical) {
    scene.tweens.add({
      targets: text,
      scale: { from: 1.5, to: 1 },
      duration: 150,
      ease: 'Back.easeOut'
    })
  }
}

/**
 * Flash a game object white briefly to indicate a hit.
 *
 * @param scene - Phaser scene
 * @param target - The game object to flash (must support setTint)
 * @param duration - Flash duration in ms (default: 50)
 */
export function flashWhite(
  scene: Phaser.Scene,
  target: Phaser.GameObjects.Rectangle | Phaser.GameObjects.Image,
  duration = 50
): void {
  if (target instanceof Phaser.GameObjects.Rectangle) {
    const originalColor = target.fillColor
    target.setFillStyle(0xffffff)
    scene.time.delayedCall(duration, () => {
      target.setFillStyle(originalColor)
    })
    return
  }

  if ('setTint' in target) {
    target.setTint(0xffffff)
    scene.time.delayedCall(duration, () => {
      if ('clearTint' in target) {
        target.clearTint()
      }
    })
  }
}
