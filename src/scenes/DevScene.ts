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
import { OreType } from '../config/ores'
import { InventorySystem } from '../systems/InventorySystem'
import { MiningGrid } from '../systems/MiningGrid'
import { StatSystem } from '../systems/StatSystem'
import { StatType } from '../types/stats'
import { StatDebugPanel } from '../ui/StatDebugPanel'
import { CaveFrame } from '../ui/CaveFrame'
import { DepthIndicator } from '../ui/DepthIndicator'
import { TargetIndicator } from '../ui/TargetIndicator'
import { GoldDisplay } from '../ui/GoldDisplay'
import { InventoryPanel } from '../ui/InventoryPanel'
import { Miner } from '../objects/Miner'
import { AxeProjectile, AxeProjectilePool } from '../objects/AxeProjectile'
import { Block } from '../objects/Block'
import { showDamageNumber, playBlockHitEffect, flashWhite } from '../utils/BlockEffects'
import { playOreCollectEffect } from '../utils'
import { BlockType } from '../config/blocks'

const TERRAIN_TILE_ASSETS: Record<string, string> = {
  terrain_stone_01: 'assets/tiles/terrain_48/stone_01.png',
  terrain_stone_02: 'assets/tiles/terrain_48/stone_02.png',
  terrain_stone_03: 'assets/tiles/terrain_48/stone_03.png',
  terrain_stone_04: 'assets/tiles/terrain_48/stone_04.png',
  terrain_dirt_01: 'assets/tiles/terrain_48/dirt_01.png',
  terrain_dirt_02: 'assets/tiles/terrain_48/dirt_02.png',
  terrain_dirt_03: 'assets/tiles/terrain_48/dirt_03.png',
  terrain_dirt_04: 'assets/tiles/terrain_48/dirt_04.png',
  terrain_hard_rock_01: 'assets/tiles/terrain_48/stone_hard_01.png',
  terrain_hard_rock_02: 'assets/tiles/terrain_48/stone_hard_02.png',
  terrain_hard_rock_03: 'assets/tiles/terrain_48/stone_hard_03.png',
  terrain_hard_rock_04: 'assets/tiles/terrain_48/stone_hard_04.png',
  terrain_dense_rock_01: 'assets/tiles/terrain_48/basalt_01.png',
  terrain_dense_rock_02: 'assets/tiles/terrain_48/basalt_02.png',
  terrain_dense_rock_03: 'assets/tiles/terrain_48/basalt_03.png',
  terrain_dense_rock_04: 'assets/tiles/terrain_48/basalt_04.png',
  terrain_ancient_stone_01: 'assets/tiles/terrain_48/ancient_01.png',
  terrain_ancient_stone_02: 'assets/tiles/terrain_48/ancient_02.png',
  terrain_ancient_stone_03: 'assets/tiles/terrain_48/ancient_03.png',
  terrain_ancient_stone_04: 'assets/tiles/terrain_48/ancient_04.png'
}

const ORE_TILE_ASSETS: Record<string, string> = {
  ore_coal_01: 'assets/tiles/ore_48/coal_01.png',
  ore_coal_02: 'assets/tiles/ore_48/coal_02.png',
  ore_coal_03: 'assets/tiles/ore_48/coal_03.png',
  ore_copper_01: 'assets/tiles/ore_48/copper_01.png',
  ore_copper_02: 'assets/tiles/ore_48/copper_02.png',
  ore_copper_03: 'assets/tiles/ore_48/copper_03.png',
  ore_tin_01: 'assets/tiles/ore_48/tin_01.png',
  ore_tin_02: 'assets/tiles/ore_48/tin_02.png',
  ore_tin_03: 'assets/tiles/ore_48/tin_03.png',
  ore_iron_01: 'assets/tiles/ore_48/iron_01.png',
  ore_iron_02: 'assets/tiles/ore_48/iron_02.png',
  ore_iron_03: 'assets/tiles/ore_48/iron_03.png',
  ore_silver_01: 'assets/tiles/ore_48/silver_01.png',
  ore_silver_02: 'assets/tiles/ore_48/silver_02.png',
  ore_silver_03: 'assets/tiles/ore_48/silver_03.png',
  ore_gold_01: 'assets/tiles/ore_48/gold_01.png',
  ore_gold_02: 'assets/tiles/ore_48/gold_02.png',
  ore_gold_03: 'assets/tiles/ore_48/gold_03.png',
  ore_platinum_01: 'assets/tiles/ore_48/platinum_01.png',
  ore_platinum_02: 'assets/tiles/ore_48/platinum_02.png',
  ore_platinum_03: 'assets/tiles/ore_48/platinum_03.png',
  ore_diamond_01: 'assets/tiles/ore_48/diamond_01.png',
  ore_diamond_02: 'assets/tiles/ore_48/diamond_02.png',
  ore_diamond_03: 'assets/tiles/ore_48/diamond_03.png',
  ore_ruby_01: 'assets/tiles/ore_48/ruby_01.png',
  ore_ruby_02: 'assets/tiles/ore_48/ruby_02.png',
  ore_ruby_03: 'assets/tiles/ore_48/ruby_03.png',
  ore_mythril_01: 'assets/tiles/ore_48/mythril_01.png',
  ore_mythril_02: 'assets/tiles/ore_48/mythril_02.png',
  ore_mythril_03: 'assets/tiles/ore_48/mythril_03.png',
  ore_adamantite_01: 'assets/tiles/ore_48/adamantite_01.png',
  ore_adamantite_02: 'assets/tiles/ore_48/adamantite_02.png',
  ore_adamantite_03: 'assets/tiles/ore_48/adamantite_03.png'
}

const ORE_TILE_KEYS: Record<OreType, string[]> = {
  [OreType.COAL]: ['ore_coal_01', 'ore_coal_02', 'ore_coal_03'],
  [OreType.COPPER]: ['ore_copper_01', 'ore_copper_02', 'ore_copper_03'],
  [OreType.TIN]: ['ore_tin_01', 'ore_tin_02', 'ore_tin_03'],
  [OreType.IRON]: ['ore_iron_01', 'ore_iron_02', 'ore_iron_03'],
  [OreType.SILVER]: ['ore_silver_01', 'ore_silver_02', 'ore_silver_03'],
  [OreType.GOLD]: ['ore_gold_01', 'ore_gold_02', 'ore_gold_03'],
  [OreType.PLATINUM]: ['ore_platinum_01', 'ore_platinum_02', 'ore_platinum_03'],
  [OreType.DIAMOND]: ['ore_diamond_01', 'ore_diamond_02', 'ore_diamond_03'],
  [OreType.RUBY]: ['ore_ruby_01', 'ore_ruby_02', 'ore_ruby_03'],
  [OreType.MYTHRIL]: ['ore_mythril_01', 'ore_mythril_02', 'ore_mythril_03'],
  [OreType.ADAMANTITE]: ['ore_adamantite_01', 'ore_adamantite_02', 'ore_adamantite_03']
}

const TERRAIN_TILE_KEYS: Record<BlockType, string[]> = {
  [BlockType.STONE]: [
    'terrain_stone_01',
    'terrain_stone_02',
    'terrain_stone_03',
    'terrain_stone_04'
  ],
  [BlockType.DIRT]: ['terrain_dirt_01', 'terrain_dirt_02', 'terrain_dirt_03', 'terrain_dirt_04'],
  [BlockType.HARD_ROCK]: [
    'terrain_hard_rock_01',
    'terrain_hard_rock_02',
    'terrain_hard_rock_03',
    'terrain_hard_rock_04'
  ],
  [BlockType.DENSE_ROCK]: [
    'terrain_dense_rock_01',
    'terrain_dense_rock_02',
    'terrain_dense_rock_03',
    'terrain_dense_rock_04'
  ],
  [BlockType.ANCIENT_STONE]: [
    'terrain_ancient_stone_01',
    'terrain_ancient_stone_02',
    'terrain_ancient_stone_03',
    'terrain_ancient_stone_04'
  ]
}

export class DevScene extends Scene {
  private miningGrid!: MiningGrid
  private inventory!: InventorySystem
  private miner!: Miner
  private axeProjectiles!: AxeProjectilePool
  private targetIndicator!: TargetIndicator
  private caveFrame!: CaveFrame
  private depthIndicator!: DepthIndicator
  private goldDisplay!: GoldDisplay
  private inventoryPanel!: InventoryPanel
  private statDebugPanel!: StatDebugPanel
  private infoText!: Phaser.GameObjects.Text
  private axeLane?: Phaser.GameObjects.Rectangle
  private blockSize = 48
  private unsubscribeGoldChanged?: () => void
  private unsubscribeOreChanged?: () => void
  private unsubscribeOreSold?: () => void

  constructor() {
    super('DevScene')
  }

  preload() {
    for (const [key, url] of Object.entries(TERRAIN_TILE_ASSETS)) {
      this.load.image(key, url)
    }
    for (const [key, url] of Object.entries(ORE_TILE_ASSETS)) {
      this.load.image(key, url)
    }
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
        strokeThickness: 4
      })
      .setOrigin(0.5)

    // Calculate grid bounds first for cave frame positioning
    const gridWidth = 10
    const visibleRows = 12
    const blockSize = 48
    this.blockSize = blockSize
    const centerX = 360
    const topY = 90
    const emptyRowsBottom = 2
    const minerOffsetY = 0
    const minerFloorOffset = 24
    const frameExtraBottom = minerOffsetY + minerFloorOffset

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
      extraBottom: frameExtraBottom
    })

    // Create the mining grid (higher depth, in front)
    this.miningGrid = new MiningGrid(this, {
      gridWidth,
      visibleRows,
      blockSize,
      centerX,
      topY,
      emptyRowsBottom,
      terrainTextureKeys: TERRAIN_TILE_KEYS,
      oreTextureKeys: ORE_TILE_KEYS
    })

    this.inventory = InventorySystem.getInstance()

    const safeLeft = 16
    const goldHalfWidth = 85
    const depthHalfWidth = 60
    const leftGap = 12
    const goldX = Math.max(safeLeft + goldHalfWidth, gridLeft - goldHalfWidth - leftGap)

    this.goldDisplay = new GoldDisplay(this, {
      x: goldX,
      y: 60,
      initialGold: this.inventory.getGold()
    })

    this.unsubscribeGoldChanged = this.inventory.onGoldChanged((event) => {
      this.goldDisplay.setGold(event.newGold)
      if (event.delta > 0) {
        this.goldDisplay.playGainEffect(event.delta)
      }
    })

    this.inventoryPanel = new InventoryPanel(this, {
      x: 660,
      y: 490,
      onSellOre: (oreType) => {
        this.inventory.sellOre(oreType)
      }
    })

    this.unsubscribeOreChanged = this.inventory.onOreChanged((event) => {
      this.inventoryPanel.setOreCount(event.oreType, event.newCount)
    })

    this.unsubscribeOreSold = this.inventory.onOreSold((event) => {
      this.inventoryPanel.playSellFeedback(event.oreType, event.goldEarned)
    })

    for (const oreType of Object.values(OreType)) {
      this.inventoryPanel.setOreCount(oreType, this.inventory.getOreCount(oreType))
    }

    // Get grid bounds for positioning other elements
    const gridBounds = this.miningGrid.getGridBounds()

    const oreTargetX = this.cameras.main.width - 70
    const oreTargetY = 70
    const oreAnchor = this.add.rectangle(oreTargetX, oreTargetY, 28, 28, 0x1f2937, 0.85)
    oreAnchor.setStrokeStyle(2, 0xffcc66)
    oreAnchor.setDepth(30)
    this.add
      .text(oreTargetX, oreTargetY + 24, 'ORE', {
        fontFamily: 'Arial Black',
        fontSize: '11px',
        color: '#ffcc66'
      })
      .setOrigin(0.5, 0)
      .setDepth(30)

    const sellButtonY = oreTargetY + 58
    const sellButton = this.add.rectangle(oreTargetX, sellButtonY, 88, 26, 0x2b3a2f, 0.95)
    sellButton.setStrokeStyle(2, 0x4a7a52)
    sellButton.setDepth(30)
    sellButton.setInteractive({ useHandCursor: true })

    const sellLabel = this.add
      .text(oreTargetX, sellButtonY, 'SELL ALL', {
        fontFamily: 'Arial Black',
        fontSize: '11px',
        color: '#d7f5c4'
      })
      .setOrigin(0.5)
      .setDepth(31)

    sellButton.on('pointerdown', () => {
      const earned = this.inventory.sellAllOres()
      if (earned <= 0) {
        this.flashInfo('No ores to sell')
        return
      }
      sellButton.setFillStyle(0x23412a)
    })
    sellButton.on('pointerup', () => sellButton.setFillStyle(0x2b3a2f))
    sellButton.on('pointerover', () => {
      sellButton.setFillStyle(0x3a4f3f)
      sellLabel.setScale(1.05)
    })
    sellButton.on('pointerout', () => {
      sellButton.setFillStyle(0x2b3a2f)
      sellLabel.setScale(1)
    })

    // Create projectile pool for throws
    this.axeProjectiles = new AxeProjectilePool(this, { size: 6, depth: 18 })

    // Create miner centered below the grid
    const minerX = gridBounds.left + gridBounds.width / 2
    const minerY = gridBounds.bottom + minerOffsetY
    this.miner = new Miner(this, {
      x: minerX,
      y: minerY,
      axePool: this.axeProjectiles
    })

    // Subtle lane between miner and grid for axe travel
    const laneTop = gridBounds.bottom - emptyRowsBottom * blockSize + 4
    const laneBottom = gridBounds.bottom - 4
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
      size: blockSize
    })

    // Fire toward cursor on click/tap
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y)
      this.fireToward(worldPoint.x, worldPoint.y)
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
    const depthX = Math.max(safeLeft + depthHalfWidth, gridBounds.left - depthHalfWidth - leftGap)
    this.depthIndicator = new DepthIndicator(this, {
      x: depthX,
      y: gridBounds.top + 50
    })

    // Subscribe to depth changes
    this.miningGrid.onDepthChange((event) => {
      this.depthIndicator.setDepth(event.newDepth)
    })

    // Ore collection visuals (placeholder for inventory UI)
    this.miningGrid.onOreCollected((event) => {
      this.inventory.addOre(event.oreType, event.amount)
      playOreCollectEffect(
        this,
        event.worldX,
        event.worldY,
        event.block.baseColor,
        oreTargetX,
        oreTargetY
      )
    })

    // Stat debug panel (press D to toggle)
    this.statDebugPanel = new StatDebugPanel(this, {
      getDepth: () => this.miningGrid.currentDepth
    })

    // Info text
    const infoY = Math.min(minerY + 60, 720)
    this.infoText = this.add
      .text(512, infoY, 'Click blocks to mine! Press D for stat debug', {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#888888'
      })
      .setOrigin(0.5)

    // Test controls
    this.createTestControls()

    // Instructions
    this.add
      .text(512, Math.min(infoY + 32, 748), 'Clear bottom row to scroll deeper', {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#666666'
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
        color: '#ffff00'
      })
      .setOrigin(0.5)

    const buttons = [
      { label: '+10% Damage (upgrades)', action: () => this.addDamageBonus() },
      { label: '+25% Speed (upgrades)', action: () => this.addSpeedBonus() },
      { label: '+50% Damage (skills)', action: () => this.addSkillDamage() },
      { label: 'Clear Upgrades', action: () => this.clearUpgrades() },
      { label: 'Clear Skills', action: () => this.clearSkills() },
      { label: 'Clear All', action: () => this.clearAll() }
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
          color: '#ffffff'
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
        color: '#00ffff'
      })
      .setOrigin(0.5)

    const damageText = this.add
      .text(startX + buttonWidth / 2, statsY + 25, '', {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#00ff00'
      })
      .setOrigin(0.5)

    const speedText = this.add
      .text(startX + buttonWidth / 2, statsY + 45, '', {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#00ff00'
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
      }
    })
  }

  private fireToward(targetX: number, targetY: number): void {
    const throwResult = this.miner.tryThrow()
    if (!throwResult) return

    if (targetY >= throwResult.origin.y) {
      return
    }

    const direction = this.normalizeVector(
      targetX - throwResult.origin.x,
      targetY - throwResult.origin.y
    )
    this.launchAxeFromDirection(throwResult.projectile, throwResult.origin, direction)
  }

  private launchAxeFromDirection(
    projectile: AxeProjectile,
    origin: { x: number; y: number },
    direction: { x: number; y: number }
  ): void {
    const maxRicochets = 3
    const state = { ricochetsLeft: maxRicochets, lastBlockId: '' }

    const speed = this.miner.getSpeed()
    const returnPoint = this.miner.getPickaxeWorldPosition()

    const first = this.findNextCollision(origin, direction, returnPoint, state.lastBlockId)
    if (!first) {
      this.travelProjectile(projectile, origin, returnPoint, speed, () => {
        this.axeProjectiles.release(projectile)
      })
      return
    }

    if (first.type === 'return') {
      this.travelProjectile(projectile, origin, first.point, speed, () => {
        this.axeProjectiles.release(projectile)
      })
      return
    }

    this.travelProjectile(projectile, origin, first.point, speed, () => {
      if (first.type === 'block') {
        this.applyAxeHit(first.block, first.point.x, first.point.y)
        state.lastBlockId = first.block.id
      }

      const reflected = this.reflectVector(direction, first.normal)
      const start = this.offsetPoint(first.point, reflected)
      this.continueBounce(
        projectile,
        start,
        reflected,
        speed,
        () => this.miner.getPickaxeWorldPosition(),
        () => {
          this.axeProjectiles.release(projectile)
        },
        state
      )
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
      this.continueBounce(projectile, nextStart, reflected, speed, getReturnPoint, onReturn, state)
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
    | {
        type: 'block'
        point: { x: number; y: number }
        normal: { x: number; y: number }
        block: Block
      }
    | { type: 'wall'; point: { x: number; y: number }; normal: { x: number; y: number } }
    | { type: 'return'; point: { x: number; y: number } }
    | null {
    const bounds = this.miningGrid.getGridBounds()
    const epsilon = 0.0001
    const candidates: { type: 'wall' | 'return'; t: number; normal?: { x: number; y: number } }[] =
      []

    if (direction.x < -epsilon) {
      const t = (bounds.left - origin.x) / direction.x
      if (t > 0) candidates.push({ type: 'wall', t, normal: { x: 1, y: 0 } })
    }
    if (direction.x > epsilon) {
      const t = (bounds.right - origin.x) / direction.x
      if (t > 0) candidates.push({ type: 'wall', t, normal: { x: -1, y: 0 } })
    }
    if (direction.y < -epsilon) {
      const t = (bounds.top - origin.y) / direction.y
      if (t > 0) candidates.push({ type: 'wall', t, normal: { x: 0, y: 1 } })
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

    const blockHit = this.findFirstBlockHit(origin, direction, ignoreBlockId)

    let closest:
      | {
          type: 'block'
          point: { x: number; y: number }
          normal: { x: number; y: number }
          block: Block
          t: number
        }
      | {
          type: 'wall'
          point: { x: number; y: number }
          normal: { x: number; y: number }
          t: number
        }
      | { type: 'return'; point: { x: number; y: number }; t: number }
      | null = null

    if (blockHit) {
      closest = {
        type: 'block',
        point: blockHit.point,
        normal: blockHit.normal,
        block: blockHit.block,
        t: blockHit.t
      }
    }

    for (const candidate of candidates) {
      const point = {
        x: origin.x + direction.x * candidate.t,
        y: origin.y + direction.y * candidate.t
      }
      if (!closest || candidate.t < closest.t - 0.0001) {
        closest =
          candidate.type === 'return'
            ? { type: 'return', point, t: candidate.t }
            : { type: 'wall', point, normal: candidate.normal ?? { x: 0, y: 0 }, t: candidate.t }
        continue
      }

      if (closest && Math.abs(candidate.t - closest.t) <= 0.0001 && closest.type !== 'block') {
        closest =
          candidate.type === 'return'
            ? { type: 'return', point, t: candidate.t }
            : { type: 'wall', point, normal: candidate.normal ?? { x: 0, y: 0 }, t: candidate.t }
      }
    }

    if (!closest) return null

    if (closest.type === 'return') {
      return { type: 'return', point: closest.point }
    }

    if (closest.type === 'wall') {
      return { type: 'wall', point: closest.point, normal: closest.normal }
    }

    return { type: 'block', point: closest.point, normal: closest.normal, block: closest.block }
  }

  private findFirstBlockHit(
    origin: { x: number; y: number },
    direction: { x: number; y: number },
    ignoreBlockId: string
  ): {
    block: Block
    point: { x: number; y: number }
    normal: { x: number; y: number }
    t: number
  } | null {
    let closest: {
      block: Block
      point: { x: number; y: number }
      normal: { x: number; y: number }
      t: number
    } | null = null

    for (const block of this.miningGrid.getVisibleBlocks()) {
      if (!block.gameObject || block.isDead()) continue
      if (ignoreBlockId && block.id === ignoreBlockId) continue

      const matrix = block.gameObject.getWorldTransformMatrix()
      const halfWidth = block.gameObject.displayWidth / 2
      const halfHeight = block.gameObject.displayHeight / 2
      const minX = matrix.tx - halfWidth
      const maxX = matrix.tx + halfWidth
      const minY = matrix.ty - halfHeight
      const maxY = matrix.ty + halfHeight

      const hit = this.intersectRayAabb(origin, direction, minX, minY, maxX, maxY)
      if (!hit) continue

      if (!closest || hit.t < closest.t) {
        closest = { block, point: hit.point, normal: hit.normal, t: hit.t }
      }
    }

    return closest
  }

  private normalizeVector(x: number, y: number): { x: number; y: number } {
    const length = Math.hypot(x, y)
    if (length <= 0.0001) return { x: 0, y: -1 }
    return { x: x / length, y: y / length }
  }

  private reflectVector(
    direction: { x: number; y: number },
    normal: { x: number; y: number }
  ): { x: number; y: number } {
    const dot = direction.x * normal.x + direction.y * normal.y
    return {
      x: direction.x - 2 * dot * normal.x,
      y: direction.y - 2 * dot * normal.y
    }
  }

  private offsetPoint(
    point: { x: number; y: number },
    direction: { x: number; y: number }
  ): { x: number; y: number } {
    return { x: point.x + direction.x * 2, y: point.y + direction.y * 2 }
  }

  private intersectRayAabb(
    origin: { x: number; y: number },
    direction: { x: number; y: number },
    minX: number,
    minY: number,
    maxX: number,
    maxY: number
  ): { point: { x: number; y: number }; normal: { x: number; y: number }; t: number } | null {
    const epsilon = 0.000001
    const invX = Math.abs(direction.x) > epsilon ? 1 / direction.x : Number.POSITIVE_INFINITY
    const invY = Math.abs(direction.y) > epsilon ? 1 / direction.y : Number.POSITIVE_INFINITY

    const t1 = (minX - origin.x) * invX
    const t2 = (maxX - origin.x) * invX
    const t3 = (minY - origin.y) * invY
    const t4 = (maxY - origin.y) * invY

    const tMinX = Math.min(t1, t2)
    const tMaxX = Math.max(t1, t2)
    const tMinY = Math.min(t3, t4)
    const tMaxY = Math.max(t3, t4)

    const tEntry = Math.max(tMinX, tMinY)
    const tExit = Math.min(tMaxX, tMaxY)

    if (tExit < 0 || tEntry > tExit) return null

    const tHit = tEntry >= 0 ? tEntry : tExit
    if (tHit < 0) return null

    const point = {
      x: origin.x + direction.x * tHit,
      y: origin.y + direction.y * tHit
    }

    const axisNormal = this.getEntryNormal(direction, tMinX, tMinY)
    return { point, normal: axisNormal, t: tHit }
  }

  private getEntryNormal(
    direction: { x: number; y: number },
    tMinX: number,
    tMinY: number
  ): { x: number; y: number } {
    const epsilon = 0.000001
    const absX = Math.abs(direction.x)
    const absY = Math.abs(direction.y)

    let hitAxis: 'x' | 'y'
    if (Math.abs(tMinX - tMinY) < epsilon) {
      hitAxis = absX >= absY ? 'x' : 'y'
    } else {
      hitAxis = tMinX > tMinY ? 'x' : 'y'
    }

    if (hitAxis === 'x') {
      return { x: direction.x > 0 ? -1 : 1, y: 0 }
    }
    return { x: 0, y: direction.y > 0 ? -1 : 1 }
  }

  shutdown() {
    this.miningGrid.destroy()
    this.miner.destroy()
    this.axeProjectiles.destroy()
    this.targetIndicator.destroy()
    this.caveFrame.destroy()
    this.depthIndicator.destroy()
    this.goldDisplay.destroy()
    this.inventoryPanel.destroy()
    this.statDebugPanel.destroy()
    this.axeLane?.destroy()
    this.unsubscribeGoldChanged?.()
    this.unsubscribeOreChanged?.()
    this.unsubscribeOreSold?.()
  }
}
