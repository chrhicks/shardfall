import { Scene } from 'phaser'
import Decimal from 'break_infinity.js'

// Colors for the mining blocks
const BLOCK_COLORS = [
  0x8b4513, // dirt brown
  0x696969, // gray stone
  0x2f4f4f, // dark slate
  0x8b0000, // dark red ore
  0xffd700 // gold ore
]

export class HelloWorldScene extends Scene {
  private counter: Decimal = new Decimal(0)
  private counterText!: Phaser.GameObjects.Text
  private buttonBg!: Phaser.GameObjects.Rectangle

  constructor() {
    super('HelloWorldScene')
  }

  create() {
    // 1) Colored background
    this.cameras.main.setBackgroundColor(0x1a1a2e)

    // 2) Draw a placeholder grid of rectangles (5x8 mining grid)
    const gridWidth = 5
    const gridHeight = 8
    const blockSize = 64
    const gridStartX = (1024 - gridWidth * blockSize) / 2
    const gridStartY = 80

    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        const colorIndex = Math.floor(Math.random() * BLOCK_COLORS.length)
        const block = this.add.rectangle(
          gridStartX + x * blockSize + blockSize / 2,
          gridStartY + y * blockSize + blockSize / 2,
          blockSize - 4,
          blockSize - 4,
          BLOCK_COLORS[colorIndex]
        )
        block.setStrokeStyle(2, 0x000000)
      }
    }

    // 3) Placeholder miner (colored rectangle at bottom of grid)
    const minerX = gridStartX + (gridWidth * blockSize) / 2
    const minerY = gridStartY + gridHeight * blockSize + 40
    const miner = this.add.rectangle(minerX, minerY, 48, 48, 0x00ffff)
    miner.setStrokeStyle(3, 0xffffff)

    // Add a simple animation to the miner
    this.tweens.add({
      targets: miner,
      y: minerY - 10,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    // Label for miner
    this.add
      .text(minerX, minerY + 40, 'MINER', {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#00ffff'
      })
      .setOrigin(0.5)

    // 4) Create button using rexUI roundRectangle
    this.createMineButton()

    // 5) Display counter with break_infinity formatting
    this.counterText = this.add
      .text(512, 700, this.formatCounter(), {
        fontFamily: 'Arial Black',
        fontSize: '32px',
        color: '#ffd700',
        stroke: '#000000',
        strokeThickness: 4
      })
      .setOrigin(0.5)

    // Title
    this.add
      .text(512, 30, 'SHARDFALL - Hello World', {
        fontFamily: 'Arial Black',
        fontSize: '28px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4
      })
      .setOrigin(0.5)

    // Instructions
    this.add
      .text(512, 740, 'Click the MINE button to test break_infinity.js', {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#888888'
      })
      .setOrigin(0.5)
  }

  private createMineButton() {
    // Access rexUI from scene (mapped in config)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rexUI = (this as any).rexUI

    // Create button background using rexUI's roundRectangle
    // This validates that rexUI is properly configured
    this.buttonBg = rexUI.add.roundRectangle(800, 400, 180, 60, 10, 0x4a4a8a)
    this.buttonBg.setStrokeStyle(2, 0x6a6aba)
    this.buttonBg.setInteractive({ useHandCursor: true })

    // Create button label
    const buttonLabel = this.add
      .text(800, 400, 'MINE (+1e6)', {
        fontFamily: 'Arial Black',
        fontSize: '20px',
        color: '#ffffff'
      })
      .setOrigin(0.5)

    // Button interactions
    this.buttonBg.on('pointerdown', () => {
      this.onMineClick()
      this.buttonBg.setFillStyle(0x3a3a6a) // Darker on press
    })

    this.buttonBg.on('pointerup', () => {
      this.buttonBg.setFillStyle(0x4a4a8a) // Normal color
    })

    this.buttonBg.on('pointerover', () => {
      this.buttonBg.setFillStyle(0x5a5a9a) // Hover color
      buttonLabel.setScale(1.05)
    })

    this.buttonBg.on('pointerout', () => {
      this.buttonBg.setFillStyle(0x4a4a8a) // Normal color
      buttonLabel.setScale(1)
    })
  }

  private onMineClick() {
    // Add 1 million per click (to demonstrate big numbers)
    this.counter = this.counter.add(new Decimal(1e6))
    this.updateCounterDisplay()

    // Visual feedback - flash the text
    this.tweens.add({
      targets: this.counterText,
      scale: 1.2,
      duration: 100,
      yoyo: true,
      ease: 'Sine.easeOut'
    })
  }

  private updateCounterDisplay() {
    this.counterText.setText(this.formatCounter())
  }

  private formatCounter(): string {
    // Use break_infinity's built-in formatting
    if (this.counter.lt(1e6)) {
      return `Shards: ${this.counter.toFixed(0)}`
    }
    // Format with scientific notation for large numbers
    return `Shards: ${this.counter.toExponential(2)}`
  }
}
