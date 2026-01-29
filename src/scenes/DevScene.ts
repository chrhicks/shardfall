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

export class DevScene extends Scene {
  private miningGrid!: MiningGrid
  private caveFrame!: CaveFrame
  private depthIndicator!: DepthIndicator
  private statDebugPanel!: StatDebugPanel
  private infoText!: Phaser.GameObjects.Text

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
    const centerX = 350
    const topY = 80

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
    this.infoText = this.add
      .text(512, 700, 'Click blocks to mine! Press D for stat debug', {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#888888',
      })
      .setOrigin(0.5)

    // Test controls
    this.createTestControls()

    // Instructions
    this.add
      .text(512, 740, 'Clear bottom row to scroll deeper', {
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

  shutdown() {
    this.miningGrid.destroy()
    this.caveFrame.destroy()
    this.depthIndicator.destroy()
    this.statDebugPanel.destroy()
  }
}
