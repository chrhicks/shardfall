/**
 * DevScene - Development scene for testing game systems as they're built
 *
 * Features:
 * - Mining grid with Block system
 * - Cave frame atmosphere
 * - Depth indicator
 * - StatDebugPanel (press D to toggle)
 * - Test controls for stat bonuses
 */

import { Scene } from 'phaser'
import { MiningGrid } from '../systems/MiningGrid'
import { StatSystem } from '../systems/StatSystem'
import { StatType } from '../types/stats'
import { StatDebugPanel } from '../ui/StatDebugPanel'
import { CaveFrame } from '../ui/CaveFrame'
import { DepthIndicator } from '../ui/DepthIndicator'
import { TargetIndicator } from '../ui/TargetIndicator'
import { Miner } from '../objects/Miner'
import { AxeProjectile, AxeProjectilePool } from '../objects/AxeProjectile'
import { Block } from '../objects/Block'
import { showDamageNumber, playBlockHitEffect, flashWhite } from '../utils/BlockEffects'

export class DevScene extends Scene {
  private miningGrid!: MiningGrid
  private miner!: Miner
  private axeProjectiles!: AxeProjectilePool
  private targetIndicator!: TargetIndicator
  private caveFrame!: CaveFrame
  private depthIndicator!: DepthIndicator
  private statDebugPanel!: StatDebugPanel
  private infoText!: Phaser.GameObjects.Text
  private axeLane?: Phaser.GameObjects.Rectangle
  private blockSize = 64

  constructor() {
    super('DevScene')
  }

  create() {
    this.cameras.main.setBackgroundColor(0x1a1a2e)

    // Title
    this.add
      .text(512, 30, 'SHARDFALL - Dev Build', {
        fontFamily: 'Arial Black',
        fontSize: '28px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(0.5)

    // Calculate grid bounds first for cave frame positioning
    const gridWidth = 5
    const visibleRows = 8
    const blockSize = 64
    this.blockSize = blockSize
    const centerX = 350
    const topY = 80
    const gridGap = 48
    const minerOffsetY = 20
    const minerFloorOffset = 24
    const frameExtraBottom = gridGap + minerOffsetY + minerFloorOffset

    const gridLeft = centerX - (gridWidth * blockSize) / 2
    const gridRight = gridLeft + gridWidth * blockSize
    const gridTop = topY
    const gridBottom = topY + visibleRows * blockSize

    // Create cave frame FIRST (lower depth, behind blocks)
    this.caveFrame = new CaveFrame(this, {
      gridLeft,
      gridRight,
      gridTop,
      gridBottom,
      extraBottom: frameExtraBottom,
    })

    // Create the mining grid (higher depth, in front)
    this.miningGrid = new MiningGrid(this, {
      gridWidth,
      visibleRows,
      blockSize,
      centerX,
      topY,
    })

    // Get grid bounds for positioning other elements
    const gridBounds = this.miningGrid.getGridBounds()

    // Create projectile pool for throws
    this.axeProjectiles = new AxeProjectilePool(this, { size: 6, depth: 18 })

    // Create miner centered below the grid
    const minerX = gridBounds.left + gridBounds.width / 2
    const minerY = gridBounds.bottom + gridGap + minerOffsetY
    this.miner = new Miner(this, {
      x: minerX,
      y: minerY,
      axePool: this.axeProjectiles,
    })

    // Subtle lane between miner and grid for axe travel
    const laneTop = gridBounds.bottom + 4
    const laneBottom = minerY - 24
    const laneHeight = Math.max(8, laneBottom - laneTop)
    this.axeLane = this.add.rectangle(
      gridBounds.left + gridBounds.width / 2,
      laneTop + laneHeight / 2,
      gridBounds.width,
      laneHeight,
      0xffffff,
      0.06
    )
    this.axeLane.setDepth(7)

    // Create target indicator for hover highlight
    this.targetIndicator = new TargetIndicator(this, {
      size: blockSize,
    })

    // Wire up block click to miner mining action with visual feedback
    this.miningGrid.onBlockClicked((event) => {
      const throwResult = this.miner.tryThrow()
      if (!throwResult) return

      const target = this.getBlockWorldCenter(event.block, event.worldX, event.worldY)
      this.launchAxeBounce(throwResult.projectile, throwResult.origin, target, event.block)
    })

    // Wire up block hover to target indicator
    this.miningGrid.onBlockHovered((event) => {
      if (event.block) {
        this.targetIndicator.show(event.worldX, event.worldY)
      } else {
        this.targetIndicator.hide()
      }
    })

    // Depth indicator
    this.depthIndicator = new DepthIndicator(this, {
      x: gridBounds.left - 80,
      y: gridBounds.top + 50,
    })

    // Subscribe to depth changes
    this.miningGrid.onDepthChange((event) => {
      this.depthIndicator.setDepth(event.newDepth)
    })

    // Stat debug panel (press D to toggle)
    this.statDebugPanel = new StatDebugPanel(this)

    // Info text
    const infoY = Math.min(minerY + 60, 720)
    this.infoText = this.add
      .text(512, infoY, 'Click blocks to mine! Press D for stat debug', {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#888888',
      })
      .setOrigin(0.5)

    // Test controls
    this.createTestControls()

    // Instructions
    this.add
      .text(512, Math.min(infoY + 32, 748), 'Clear bottom row to scroll deeper', {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#666666',
      })
      .setOrigin(0.5)
  }

  private createTestControls() {
    const startX = 680
    const startY = 100
    const buttonHeight = 40
    const buttonWidth = 200
    const gap = 10

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rexUI = (this as any).rexUI

    // Section title
    this.add
      .text(startX + buttonWidth / 2, startY - 20, 'STAT TEST CONTROLS', {
        fontFamily: 'Arial Black',
        fontSize: '14px',
        color: '#ffff00',
      })
      .setOrigin(0.5)

    const buttons = [
      { label: '+10% Damage (upgrades)', action: () => this.addDamageBonus() },
      { label: '+25% Speed (upgrades)', action: () => this.addSpeedBonus() },
      { label: '+50% Damage (skills)', action: () => this.addSkillDamage() },
      { label: 'Clear Upgrades', action: () => this.clearUpgrades() },
      { label: 'Clear Skills', action: () => this.clearSkills() },
      { label: 'Clear All', action: () => this.clearAll() },
    ]

    buttons.forEach((btn, index) => {
      const y = startY + index * (buttonHeight + gap)

      const bg = rexUI.add.roundRectangle(
        startX + buttonWidth / 2,
        y,
        buttonWidth,
        buttonHeight,
        8,
        0x3a3a5a
      )
      bg.setStrokeStyle(2, 0x5a5a7a)
      bg.setInteractive({ useHandCursor: true })

      const label = this.add
        .text(startX + buttonWidth / 2, y, btn.label, {
          fontFamily: 'Arial',
          fontSize: '12px',
          color: '#ffffff',
        })
        .setOrigin(0.5)

      bg.on('pointerdown', () => {
        btn.action()
        bg.setFillStyle(0x2a2a4a)
      })
      bg.on('pointerup', () => bg.setFillStyle(0x3a3a5a))
      bg.on('pointerover', () => {
        bg.setFillStyle(0x4a4a6a)
        label.setScale(1.05)
      })
      bg.on('pointerout', () => {
        bg.setFillStyle(0x3a3a5a)
        label.setScale(1)
      })
    })

    // Current stats display (updates live)
    const statsY = startY + buttons.length * (buttonHeight + gap) + 30
    this.add
      .text(startX + buttonWidth / 2, statsY, 'Live Stats:', {
        fontFamily: 'Arial Black',
        fontSize: '14px',
        color: '#00ffff',
      })
      .setOrigin(0.5)

    const damageText = this.add
      .text(startX + buttonWidth / 2, statsY + 25, '', {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#00ff00',
      })
      .setOrigin(0.5)

    const speedText = this.add
      .text(startX + buttonWidth / 2, statsY + 45, '', {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#00ff00',
      })
      .setOrigin(0.5)

    // Update stats display
    const updateStats = () => {
      const stats = StatSystem.getInstance()
      damageText.setText(`Damage: ${stats.getStat(StatType.DAMAGE).toFixed(2)}`)
      speedText.setText(`Speed: ${stats.getStat(StatType.SPEED).toFixed(2)}`)
    }

    // Initial update
    updateStats()

    // Subscribe to changes
    StatSystem.getInstance().onStatChanged(() => updateStats())
  }

  private addDamageBonus() {
    const stats = StatSystem.getInstance()
    const current = stats.getBonus('upgrades', StatType.DAMAGE)
    stats.addBonus('upgrades', StatType.DAMAGE, current + 0.1)
    this.flashInfo('+10% Damage from upgrades')
  }

  private addSpeedBonus() {
    const stats = StatSystem.getInstance()
    const current = stats.getBonus('upgrades', StatType.SPEED)
    stats.addBonus('upgrades', StatType.SPEED, current + 0.25)
    this.flashInfo('+25% Speed from upgrades')
  }

  private addSkillDamage() {
    const stats = StatSystem.getInstance()
    const current = stats.getBonus('skill_tree', StatType.DAMAGE)
    stats.addBonus('skill_tree', StatType.DAMAGE, current + 0.5)
    this.flashInfo('+50% Damage from skill tree')
  }

  private clearUpgrades() {
    StatSystem.getInstance().clearSource('upgrades')
    this.flashInfo('Cleared all upgrade bonuses')
  }

  private clearSkills() {
    StatSystem.getInstance().clearSource('skill_tree')
    this.flashInfo('Cleared all skill tree bonuses')
  }

  private clearAll() {
    const stats = StatSystem.getInstance()
    stats.startBatch()
    stats.clearSource('upgrades')
    stats.clearSource('crafted')
    stats.clearSource('skill_tree')
    stats.clearSource('temp_buff')
    stats.clearSource('relic')
    stats.flushBatch()
    this.flashInfo('Cleared ALL bonuses')
  }

  private flashInfo(message: string) {
    this.infoText.setText(message)
    this.infoText.setColor('#00ff00')
    this.tweens.add({
      targets: this.infoText,
      alpha: { from: 1, to: 0.5 },
      duration: 200,
      yoyo: true,
      onComplete: () => {
        this.infoText.setColor('#888888')
        this.infoText.setText('Click blocks to mine! Press D for stat debug')
      },
    })
  }

  private launchAxeBounce(
    projectile: AxeProjectile,
    origin: { x: number; y: number },
    target: { x: number; y: number },
    initialBlock: Block
  ): void {
    const maxRicochets = 3
    const state = { ricochetsLeft: maxRicochets, lastBlockId: initialBlock.id }

    const speed = this.miner.getSpeed()
    const direction = this.normalizeVector(target.x - origin.x, target.y - origin.y)

    this.travelProjectile(projectile, origin, target, speed, () => {
      this.applyAxeHit(initialBlock, target.x, target.y)
      const reflected = this.reflectVector(direction, this.getImpactNormal(direction))
      const start = this.offsetPoint(target, reflected)
      this.continueBounce(projectile, start, reflected, speed, () => this.miner.getPickaxeWorldPosition(), () => {
        this.axeProjectiles.release(projectile)
      }, state)
    })
  }

  private continueBounce(
    projectile: AxeProjectile,
    start: { x: number; y: number },
    direction: { x: number; y: number },
    speed: number,
    getReturnPoint: () => { x: number; y: number },
    onReturn: () => void,
    state: { ricochetsLeft: number; lastBlockId: string }
  ): void {
    const next = this.findNextCollision(start, direction, getReturnPoint(), state.lastBlockId)
    if (!next) {
      this.travelProjectile(projectile, start, getReturnPoint(), speed, onReturn)
      return
    }

    if (next.type === 'return') {
      this.travelProjectile(projectile, start, next.point, speed, onReturn)
      return
    }

    if (state.ricochetsLeft <= 0) {
      this.travelProjectile(projectile, start, getReturnPoint(), speed, onReturn)
      return
    }

    state.ricochetsLeft -= 1

    this.travelProjectile(projectile, start, next.point, speed, () => {
      if (next.type === 'block') {
        this.applyAxeHit(next.block, next.point.x, next.point.y)
        state.lastBlockId = next.block.id
      }

      const reflected = this.reflectVector(direction, next.normal)
      const nextStart = this.offsetPoint(next.point, reflected)
      this.continueBounce(
        projectile,
        nextStart,
        reflected,
        speed,
        getReturnPoint,
        onReturn,
        state
      )
    })
  }

  private travelProjectile(
    projectile: AxeProjectile,
    from: { x: number; y: number },
    to: { x: number; y: number },
    speed: number,
    onComplete: () => void
  ): void {
    const duration = AxeProjectile.getTravelDuration(from.x, from.y, to.x, to.y, speed)
    projectile.launch(from.x, from.y, to.x, to.y, duration, onComplete)
  }

  private applyAxeHit(block: Block, impactX: number, impactY: number): void {
    if (block.isDead()) return

    const damage = this.miner.getDamage()
    const destroyed = block.takeDamage(damage)

    const blockObject = block.gameObject
    const worldMatrix = blockObject?.getWorldTransformMatrix()
    const hitX = worldMatrix?.tx ?? impactX
    const hitY = worldMatrix?.ty ?? impactY

    showDamageNumber(this, hitX, hitY, damage)

    if (!destroyed && block.gameObject) {
      flashWhite(this, block.gameObject, 50)
      playBlockHitEffect(this, hitX, hitY, block.baseColor)
    }
  }

  private findNextCollision(
    origin: { x: number; y: number },
    direction: { x: number; y: number },
    returnPoint: { x: number; y: number },
    ignoreBlockId: string
  ):
    | { type: 'block'; point: { x: number; y: number }; normal: { x: number; y: number }; block: Block }
    | { type: 'wall'; point: { x: number; y: number }; normal: { x: number; y: number } }
    | { type: 'return'; point: { x: number; y: number } }
    | null {
    const bounds = this.miningGrid.getGridBounds()
    const epsilon = 0.0001
    const candidates: { type: 'wall' | 'return'; t: number; normal?: { x: number; y: number } }[] = []

    if (direction.x < -epsilon) {
      const t = (bounds.left - origin.x) / direction.x
      if (t > 0) candidates.push({ type: 'wall', t, normal: { x: -1, y: 0 } })
    }
    if (direction.x > epsilon) {
      const t = (bounds.right - origin.x) / direction.x
      if (t > 0) candidates.push({ type: 'wall', t, normal: { x: 1, y: 0 } })
    }
    if (direction.y < -epsilon) {
      const t = (bounds.top - origin.y) / direction.y
      if (t > 0) candidates.push({ type: 'wall', t, normal: { x: 0, y: -1 } })
    }
    if (direction.y > epsilon) {
      const t = (returnPoint.y - origin.y) / direction.y
      if (t > 0) {
        const returnX = origin.x + direction.x * t
        if (returnX >= bounds.left - this.blockSize && returnX <= bounds.right + this.blockSize) {
          candidates.push({ type: 'return', t })
        }
      }
    }

    const maxCandidate = candidates.reduce((min, current) => Math.min(min, current.t), Number.POSITIVE_INFINITY)
    const blockHit = this.findFirstBlockHit(origin, direction, Math.min(maxCandidate, bounds.height * 3), ignoreBlockId)

    if (blockHit) {
      return {
        type: 'block',
        point: blockHit.point,
        normal: this.getImpactNormal(direction),
        block: blockHit.block,
      }
    }

    if (!candidates.length) return null

    const nearest = candidates.reduce((min, current) => (current.t < min.t ? current : min))
    const point = {
      x: origin.x + direction.x * nearest.t,
      y: origin.y + direction.y * nearest.t,
    }

    if (nearest.type === 'return') {
      return { type: 'return', point }
    }

    return {
      type: 'wall',
      point,
      normal: nearest.normal ?? { x: 0, y: 0 },
    }
  }

  private findFirstBlockHit(
    origin: { x: number; y: number },
    direction: { x: number; y: number },
    maxDistance: number,
    ignoreBlockId: string
  ): { block: Block; point: { x: number; y: number } } | null {
    const bounds = this.miningGrid.getGridBounds()
    const step = Math.max(6, this.blockSize / 4)

    for (let dist = step; dist <= maxDistance; dist += step) {
      const x = origin.x + direction.x * dist
      const y = origin.y + direction.y * dist

      if (x < bounds.left || x > bounds.right || y < bounds.top || y > bounds.bottom) {
        continue
      }

      const col = Math.floor((x - bounds.left) / this.blockSize)
      const row = Math.floor((y - bounds.top) / this.blockSize)
      const block = this.miningGrid.getBlockAt(col, row)
      if (!block || block.isDead() || block.id === ignoreBlockId) continue

      const centerX = bounds.left + col * this.blockSize + this.blockSize / 2
      const centerY = bounds.top + row * this.blockSize + this.blockSize / 2
      return { block, point: { x: centerX, y: centerY } }
    }

    return null
  }

  private getBlockWorldCenter(block: Block, fallbackX: number, fallbackY: number): { x: number; y: number } {
    const blockObject = block.gameObject
    const worldMatrix = blockObject?.getWorldTransformMatrix()
    return {
      x: worldMatrix?.tx ?? fallbackX,
      y: worldMatrix?.ty ?? fallbackY,
    }
  }

  private normalizeVector(x: number, y: number): { x: number; y: number } {
    const length = Math.hypot(x, y)
    if (length <= 0.0001) return { x: 0, y: -1 }
    return { x: x / length, y: y / length }
  }

  private reflectVector(direction: { x: number; y: number }, normal: { x: number; y: number }): { x: number; y: number } {
    const dot = direction.x * normal.x + direction.y * normal.y
    return {
      x: direction.x - 2 * dot * normal.x,
      y: direction.y - 2 * dot * normal.y,
    }
  }

  private getImpactNormal(direction: { x: number; y: number }): { x: number; y: number } {
    if (Math.abs(direction.x) > Math.abs(direction.y)) {
      return { x: Math.sign(direction.x), y: 0 }
    }
    return { x: 0, y: Math.sign(direction.y) }
  }

  private offsetPoint(point: { x: number; y: number }, direction: { x: number; y: number }): { x: number; y: number } {
    return { x: point.x + direction.x * 2, y: point.y + direction.y * 2 }
  }

  shutdown() {
    this.miningGrid.destroy()
    this.miner.destroy()
    this.axeProjectiles.destroy()
    this.targetIndicator.destroy()
    this.caveFrame.destroy()
    this.depthIndicator.destroy()
    this.statDebugPanel.destroy()
    this.axeLane?.destroy()
  }
}
