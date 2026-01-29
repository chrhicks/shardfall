import { Scene } from 'phaser'

type ImpactHandler = (x: number, y: number) => void

/**
 * AxeProjectile - A thrown axe that travels to a target and returns.
 */
export class AxeProjectile {
  private scene: Scene
  private container: Phaser.GameObjects.Container
  private handle: Phaser.GameObjects.Rectangle
  private head: Phaser.GameObjects.Polygon

  private travelTween: Phaser.Tweens.Tween | null = null
  private spinTween: Phaser.Tweens.Tween | null = null
  private active = false

  constructor(scene: Scene, depth = 18) {
    this.scene = scene

    this.container = scene.add.container(0, 0)
    this.container.setDepth(depth)
    this.container.setVisible(false)
    this.container.setActive(false)

    // Axe handle
    this.handle = scene.add.rectangle(0, 0, 28, 5, 0x8b4513)
    this.handle.setStrokeStyle(1, 0x5c2e0a)

    // Axe head (triangle)
    this.head = scene.add.polygon(14, 0, [
      0, -7,
      12, 0,
      0, 7,
    ], 0x888888)
    this.head.setStrokeStyle(1, 0x444444)

    this.container.add([this.handle, this.head])
  }

  static getTravelDuration(fromX: number, fromY: number, toX: number, toY: number, speed: number): number {
    const distance = Phaser.Math.Distance.Between(fromX, fromY, toX, toY)
    const adjustedSpeed = Math.max(0.1, speed)
    const duration = (distance / (300 * adjustedSpeed)) * 1000
    return Phaser.Math.Clamp(duration, 200, 700)
  }

  isActive(): boolean {
    return this.active
  }

  activate(): void {
    this.active = true
    this.container.setVisible(true)
    this.container.setActive(true)
    this.startSpin()
  }

  deactivate(): void {
    this.stopTweens()
    this.active = false
    this.container.setVisible(false)
    this.container.setActive(false)
    this.container.setAngle(0)
  }

  launch(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    duration: number,
    onImpact?: ImpactHandler
  ): void {
    this.stopTravelTween()
    this.activate()
    this.container.setPosition(fromX, fromY)
    this.container.setAngle(0)
    this.travelTween = this.scene.tweens.add({
      targets: this.container,
      x: toX,
      y: toY,
      duration,
      ease: 'Linear',
      onComplete: () => {
        onImpact?.(toX, toY)
      },
    })
  }

  private stopTweens(): void {
    this.stopTravelTween()
    if (this.spinTween) {
      this.spinTween.stop()
      this.spinTween = null
    }
  }

  private stopTravelTween(): void {
    if (this.travelTween) {
      this.travelTween.stop()
      this.travelTween = null
    }
  }

  private startSpin(): void {
    if (this.spinTween) return
    this.spinTween = this.scene.tweens.add({
      targets: this.container,
      angle: 360,
      duration: 320,
      ease: 'Linear',
      repeat: -1,
    })
  }

  destroy(): void {
    this.stopTweens()
    this.container.destroy()
  }
}

export interface AxeProjectilePoolConfig {
  size?: number
  depth?: number
}

/**
 * AxeProjectilePool - Reuses axe projectiles to avoid allocations.
 */
export class AxeProjectilePool {
  private scene: Scene
  private available: AxeProjectile[] = []
  private all: Set<AxeProjectile> = new Set()
  private depth: number

  constructor(scene: Scene, config: AxeProjectilePoolConfig = {}) {
    this.scene = scene
    this.depth = config.depth ?? 18
    const size = config.size ?? 6

    for (let i = 0; i < size; i++) {
      const projectile = new AxeProjectile(scene, this.depth)
      this.available.push(projectile)
      this.all.add(projectile)
    }
  }

  acquire(): AxeProjectile {
    const projectile = this.available.pop() ?? this.createProjectile()
    projectile.activate()
    return projectile
  }

  release(projectile: AxeProjectile): void {
    if (!this.all.has(projectile)) return
    projectile.deactivate()
    this.available.push(projectile)
  }

  destroy(): void {
    for (const projectile of this.all) {
      projectile.destroy()
    }
    this.available = []
    this.all.clear()
  }

  private createProjectile(): AxeProjectile {
    const projectile = new AxeProjectile(this.scene, this.depth)
    this.all.add(projectile)
    return projectile
  }
}
