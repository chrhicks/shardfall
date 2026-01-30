/**
 * Ore Visual Effects
 *
 * Lightweight feedback for ore collection.
 */

import { lightenColor } from './color'

export interface OreCollectEffectConfig {
  /** Duration of travel in ms (default: 550) */
  duration?: number
  /** Size of the ore shard (default: 12) */
  size?: number
  /** Vertical arc in pixels (default: 24) */
  arc?: number
}

const DEFAULT_COLLECT_CONFIG: Required<OreCollectEffectConfig> = {
  duration: 550,
  size: 12,
  arc: 24,
}

/**
 * Play an ore collection tween from world position to a UI target.
 */
export function playOreCollectEffect(
  scene: Phaser.Scene,
  startX: number,
  startY: number,
  color: number,
  targetX: number,
  targetY: number,
  config: OreCollectEffectConfig = {}
): void {
  const cfg = { ...DEFAULT_COLLECT_CONFIG, ...config }

  const shard = scene.add.rectangle(startX, startY, cfg.size, cfg.size, color)
  shard.setStrokeStyle(1, lightenColor(color, 0.25))
  shard.setDepth(120)
  shard.setRotation(Math.PI / 4)

  const controlX = (startX + targetX) / 2
  const controlY = Math.min(startY, targetY) - cfg.arc

  scene.tweens.addCounter({
    from: 0,
    to: 1,
    duration: cfg.duration,
    ease: 'Cubic.easeIn',
    onUpdate: (tween) => {
      const t = tween.getValue()
      const oneMinus = 1 - t
      const x = oneMinus * oneMinus * startX + 2 * oneMinus * t * controlX + t * t * targetX
      const y = oneMinus * oneMinus * startY + 2 * oneMinus * t * controlY + t * t * targetY
      shard.setPosition(x, y)
      shard.setAlpha(1 - t * 0.9)
      shard.setScale(1 - t * 0.5)
    },
    onComplete: () => {
      shard.destroy()
      const pulse = scene.add.circle(targetX, targetY, cfg.size * 0.9, color, 0.5)
      pulse.setDepth(121)
      scene.tweens.add({
        targets: pulse,
        scale: { from: 0.5, to: 1.2 },
        alpha: { from: 0.5, to: 0 },
        duration: 200,
        ease: 'Quad.easeOut',
        onComplete: () => pulse.destroy(),
      })
    },
  })
}
