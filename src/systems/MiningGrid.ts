/**
 * MiningGrid - Core grid system managing blocks and rendering
 *
 * The mining grid is the central visual and interactive element.
 * Displays blocks in a vertical scrolling layout, handles block
 * generation, rendering, scrolling, and visibility culling.
 */

import { Scene } from 'phaser'
import { Block, BlockFactory } from '../objects'
import { getTerrainTypeForDepth, getDamageColor, playBlockBreakEffect } from '../utils'

/** Grid configuration */
export interface MiningGridConfig {
  /** Number of columns (default: 5) */
  gridWidth?: number
  /** Number of visible rows (default: 8) */
  visibleRows?: number
  /** Size of each block in pixels (default: 64) */
  blockSize?: number
  /** X position of grid center */
  centerX?: number
  /** Y position of grid top */
  topY?: number
  /** Buffer rows above/below visible area for culling (default: 1) */
  bufferRows?: number
  /** Number of empty rows at bottom of visible area (default: 0) */
  emptyRowsBottom?: number
}

const DEFAULT_CONFIG: Required<MiningGridConfig> = {
  gridWidth: 5,
  visibleRows: 8,
  blockSize: 64,
  centerX: 400,
  topY: 80,
  bufferRows: 1,
  emptyRowsBottom: 0,
}

/** Event types emitted by MiningGrid */
export type MiningGridEventType = 'depth-change' | 'block-destroyed' | 'row-cleared' | 'block-clicked' | 'block-hovered'

/** Block clicked event */
export interface BlockClickedEvent {
  block: Block
  worldX: number
  worldY: number
}

/** Block hovered event */
export interface BlockHoveredEvent {
  block: Block | null
  worldX: number
  worldY: number
  gridCol: number
  gridRow: number
}

/** Depth change event */
export interface DepthChangeEvent {
  oldDepth: number
  newDepth: number
}

/** Block destroyed event */
export interface BlockDestroyedEvent {
  block: Block
  worldX: number
  worldY: number
}

/** Row cleared event */
export interface RowClearedEvent {
  depth: number
}

type GridEventListener<T> = (event: T) => void

/** Config for setting up pointer interactions externally */
export type BlockClickHandler = (event: BlockClickedEvent) => void
export type BlockHoverHandler = (event: BlockHoveredEvent) => void

/**
 * MiningGrid manages the block data structure and rendering.
 */
export class MiningGrid {
  private scene: Scene
  private config: Required<MiningGridConfig>

  /** Container for all block game objects */
  private container: Phaser.GameObjects.Container

  /** 2D array of blocks indexed by [row][col], row 0 = top visible row */
  private blocks: (Block | null)[][] = []

  /** Current depth (top row's depth) */
  private _currentDepth = 0

  /** Total rows generated (for generating new rows) */
  private totalRowsGenerated = 0

  /** Whether currently animating a scroll */
  private isScrolling = false

  /** Event listeners */
  private depthListeners: Set<GridEventListener<DepthChangeEvent>> = new Set()
  private blockDestroyedListeners: Set<GridEventListener<BlockDestroyedEvent>> = new Set()
  private rowClearedListeners: Set<GridEventListener<RowClearedEvent>> = new Set()
  private blockClickedListeners: Set<GridEventListener<BlockClickedEvent>> = new Set()
  private blockHoveredListeners: Set<GridEventListener<BlockHoveredEvent>> = new Set()

  /** Currently hovered block position */
  private hoveredCol = -1
  private hoveredRow = -1

  constructor(scene: Scene, config: MiningGridConfig = {}) {
    this.scene = scene
    const merged = { ...DEFAULT_CONFIG, ...config }
    const clampedEmptyRows = Math.max(0, Math.min(merged.emptyRowsBottom, merged.visibleRows - 1))
    this.config = { ...merged, emptyRowsBottom: clampedEmptyRows }

    // Create container at grid position
    const gridLeft = this.config.centerX - (this.config.gridWidth * this.config.blockSize) / 2
    this.container = scene.add.container(gridLeft, this.config.topY)
    this.container.setDepth(10) // Above cave frame

    // Create a mask to clip blocks outside visible area
    const maskGraphics = scene.make.graphics({ x: 0, y: 0 }, false)
    maskGraphics.fillStyle(0xffffff)
    maskGraphics.fillRect(
      gridLeft,
      this.config.topY,
      this.config.gridWidth * this.config.blockSize,
      this.config.visibleRows * this.config.blockSize
    )
    const mask = maskGraphics.createGeometryMask()
    this.container.setMask(mask)

    // Initialize grid with blocks
    this.initializeGrid()
  }

  /**
   * Current depth (top visible row)
   */
  get currentDepth(): number {
    return this._currentDepth
  }

  /**
   * Grid width in blocks
   */
  get gridWidth(): number {
    return this.config.gridWidth
  }

  /**
   * Visible rows count
   */
  get visibleRows(): number {
    return this.config.visibleRows
  }

  /**
   * Block size in pixels
   */
  get blockSize(): number {
    return this.config.blockSize
  }

  /**
   * The Phaser container holding all blocks
   */
  get gridContainer(): Phaser.GameObjects.Container {
    return this.container
  }

  /**
   * Initialize the grid with starting blocks
   */
  private initializeGrid(): void {
    const totalRows = this.config.visibleRows + this.config.bufferRows * 2

    for (let row = 0; row < totalRows; row++) {
      this.generateRow(row)
    }

    this.totalRowsGenerated = totalRows
    this.enforceBottomGap()
  }

  /**
   * Generate a new row of blocks at the given row index
   */
  private generateRow(rowIndex: number, insertAtTop = false): void {
    const depth = this._currentDepth + rowIndex
    const row: (Block | null)[] = []

    if (this.isBottomGapRow(rowIndex)) {
      for (let col = 0; col < this.config.gridWidth; col++) {
        row.push(null)
      }
    } else {
      for (let col = 0; col < this.config.gridWidth; col++) {
        const blockType = getTerrainTypeForDepth(depth)
        const block = BlockFactory.createBlock(blockType, col, rowIndex, depth)

        // Subscribe to block events
        this.setupBlockListeners(block)

        // Render the block
        this.renderBlock(block, col, rowIndex)

        row.push(block)
      }
    }

    // Insert at the correct position
    if (insertAtTop) {
      this.blocks.unshift(row)
    } else if (rowIndex >= this.blocks.length) {
      this.blocks.push(row)
    } else {
      this.blocks[rowIndex] = row
    }
  }

  /**
   * Set up damage and destroy listeners for a block
   */
  private setupBlockListeners(block: Block): void {
    // Update visual on damage
    block.onDamage((event) => {
      if (block.gameObject) {
        const newColor = getDamageColor(block.baseColor, event.hpPercent)
        block.gameObject.setFillStyle(newColor)
      }
    })

    // Handle destruction
    block.onDestroy(() => {
      const worldFromObject = this.getBlockWorldPositionFromGameObject(block)
      // Find the block's current position in the grid (may have shifted due to scrolling)
      const gridPos =
        this.findBlockPosition(block) ??
        (worldFromObject ? this.getGridPositionFromWorld(worldFromObject.x, worldFromObject.y) : null)
      if (!gridPos) return

      const worldPos = worldFromObject ?? this.getBlockWorldPosition(gridPos.col, gridPos.row)

      // Play break effect
      playBlockBreakEffect(this.scene, worldPos.x, worldPos.y, block.baseColor)

      // Emit event
      for (const listener of this.blockDestroyedListeners) {
        listener({ block, worldX: worldPos.x, worldY: worldPos.y })
      }

      // Remove from grid using current position
      this.removeBlockAt(gridPos.col, gridPos.row)
    })
  }

  /**
   * Get world position for a block using its game object transform
   */
  private getBlockWorldPositionFromGameObject(block: Block): { x: number; y: number } | null {
    if (!block.gameObject) return null
    const matrix = block.gameObject.getWorldTransformMatrix()
    return { x: matrix.tx, y: matrix.ty }
  }

  /**
   * Convert world position to grid coordinates
   */
  private getGridPositionFromWorld(worldX: number, worldY: number): { col: number; row: number } | null {
    const localX = worldX - this.container.x
    const localY = worldY - this.container.y
    const col = Math.round((localX - this.config.blockSize / 2) / this.config.blockSize)
    const row = Math.round((localY - this.config.blockSize / 2) / this.config.blockSize)

    if (col < 0 || col >= this.config.gridWidth) return null
    if (row < 0 || row >= this.blocks.length) return null
    return { col, row }
  }

  /**
   * Find a block's current position in the grid array
   */
  private findBlockPosition(block: Block): { col: number; row: number } | null {
    for (let row = 0; row < this.blocks.length; row++) {
      for (let col = 0; col < this.config.gridWidth; col++) {
        if (this.blocks[row][col] === block) {
          return { col, row }
        }
      }
    }
    return null
  }

  /**
   * Render a block at the given grid position
   */
  private renderBlock(block: Block, col: number, row: number): void {
    const x = col * this.config.blockSize + this.config.blockSize / 2
    const y = row * this.config.blockSize + this.config.blockSize / 2

    const rect = this.scene.add.rectangle(
      x,
      y,
      this.config.blockSize - 4,
      this.config.blockSize - 4,
      block.baseColor
    )
    rect.setStrokeStyle(2, 0x000000)

    // Make interactive for clicking and hovering
    rect.setInteractive({ useHandCursor: true })
    rect.on('pointerdown', () => {
      this.emitBlockClicked(block, col, row)
    })
    rect.on('pointerover', () => {
      this.emitBlockHovered(block, col, row)
    })
    rect.on('pointerout', () => {
      this.emitBlockHovered(null, col, row)
    })

    block.gameObject = rect
    this.container.add(rect)
  }

  /**
   * Emit block clicked event
   */
  private emitBlockClicked(block: Block, col: number, row: number): void {
    if (block.isDead()) return

    const worldPos = this.getBlockWorldPositionFromGameObject(block) ?? this.getBlockWorldPosition(col, row)
    const event: BlockClickedEvent = {
      block,
      worldX: worldPos.x,
      worldY: worldPos.y,
    }

    for (const listener of this.blockClickedListeners) {
      listener(event)
    }
  }

  /**
   * Emit block hovered event
   */
  private emitBlockHovered(block: Block | null, col: number, row: number): void {
    // Avoid duplicate events for same position
    if (block && this.hoveredCol === col && this.hoveredRow === row) return

    if (block) {
      this.hoveredCol = col
      this.hoveredRow = row
    } else {
      this.hoveredCol = -1
      this.hoveredRow = -1
    }

    const worldPos = block
      ? this.getBlockWorldPositionFromGameObject(block) ?? this.getBlockWorldPosition(col, row)
      : this.getBlockWorldPosition(col, row)
    const event: BlockHoveredEvent = {
      block: block && !block.isDead() ? block : null,
      worldX: worldPos.x,
      worldY: worldPos.y,
      gridCol: col,
      gridRow: row,
    }

    for (const listener of this.blockHoveredListeners) {
      listener(event)
    }
  }

  /**
   * Get block at grid coordinates
   */
  getBlockAt(col: number, row: number): Block | null {
    if (row < 0 || row >= this.blocks.length) return null
    if (col < 0 || col >= this.config.gridWidth) return null
    return this.blocks[row]?.[col] ?? null
  }

  /**
   * Remove block at grid coordinates
   */
  private removeBlockAt(col: number, row: number): void {
    const block = this.getBlockAt(col, row)
    if (!block) return

    // Remove game object
    if (block.gameObject) {
      this.container.remove(block.gameObject)
      block.gameObject.destroy()
      block.gameObject = null
    }

    // Clear from grid
    if (this.blocks[row]) {
      this.blocks[row][col] = null
    }

    // Check if row is cleared
    this.checkRowCleared(row)
  }

  /**
   * Check if a row is fully cleared and handle scrolling
   */
  private checkRowCleared(row: number): void {
    const rowBlocks = this.blocks[row]
    if (!rowBlocks) return

    const isCleared = rowBlocks.every((block) => block === null)
    if (!isCleared) return

    // Emit row cleared event
    const depth = this._currentDepth + row
    for (const listener of this.rowClearedListeners) {
      listener({ depth })
    }

    // If bottom-most visible row is cleared, scroll down
    if (row >= this.getBottomActiveRowIndex()) {
      this.scrollDown()
    }
  }

  /**
   * Scroll the grid down by one row
   */
  private scrollDown(): void {
    if (this.isScrolling) return
    this.isScrolling = true

    const oldDepth = this._currentDepth
    this._currentDepth++

    // Emit depth change
    for (const listener of this.depthListeners) {
      listener({ oldDepth, newDepth: this._currentDepth })
    }

    // Animate scroll
    this.scene.tweens.add({
      targets: this.container,
      y: this.container.y + this.config.blockSize,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        this.onScrollComplete()
      },
    })
  }

  /**
   * Called when scroll animation completes
   */
  private onScrollComplete(): void {
    // Remove bottom row (now off-screen)
    const bottomRow = this.blocks.pop()
    if (bottomRow) {
      for (const block of bottomRow) {
        if (block) {
          block.dispose()
        }
      }
    }

    // Insert new top row (revealed at the top after scrolling down)
    this.generateRow(0, true)
    this.totalRowsGenerated++

    // Update row indices for remaining blocks and their visual positions
    for (let row = 0; row < this.blocks.length; row++) {
      for (let col = 0; col < this.config.gridWidth; col++) {
        const block = this.blocks[row][col]
        if (block && block.gameObject) {
          // Update visual position
          const y = row * this.config.blockSize + this.config.blockSize / 2
          block.gameObject.setY(y)

          // Re-wire event listeners with updated row index
          // Remove old listeners
          block.gameObject.removeAllListeners('pointerdown')
          block.gameObject.removeAllListeners('pointerover')
          block.gameObject.removeAllListeners('pointerout')

          // Add new listeners with correct row
          const currentRow = row // Capture in closure
          const currentCol = col
          block.gameObject.on('pointerdown', () => {
            this.emitBlockClicked(block, currentCol, currentRow)
          })
          block.gameObject.on('pointerover', () => {
            this.emitBlockHovered(block, currentCol, currentRow)
          })
          block.gameObject.on('pointerout', () => {
            this.emitBlockHovered(null, currentCol, currentRow)
          })
        }
      }
    }

    // Reset container position after scroll
    this.container.y = this.config.topY

    this.enforceBottomGap()

    this.isScrolling = false
  }

  /**
   * Ensure bottom gap rows stay empty after scrolls.
   */
  private enforceBottomGap(): void {
    if (this.config.emptyRowsBottom <= 0) return

    const startRow = this.getBottomGapStartIndex()
    const endRow = Math.min(this.blocks.length, this.config.visibleRows)
    for (let row = startRow; row < endRow; row++) {
      const rowBlocks = this.blocks[row]
      if (!rowBlocks) continue
      for (let col = 0; col < rowBlocks.length; col++) {
        const block = rowBlocks[col]
        if (!block) continue
        block.dispose()
        rowBlocks[col] = null
      }
    }
  }

  private isBottomGapRow(rowIndex: number): boolean {
    return rowIndex >= this.getBottomGapStartIndex() && rowIndex < this.config.visibleRows
  }

  private getBottomGapStartIndex(): number {
    return this.config.visibleRows - this.config.emptyRowsBottom
  }

  private getBottomActiveRowIndex(): number {
    return Math.max(0, this.config.visibleRows - 1 - this.config.emptyRowsBottom)
  }

  /**
   * Get world position of a block
   */
  getBlockWorldPosition(col: number, row: number): { x: number; y: number } {
    const localX = col * this.config.blockSize + this.config.blockSize / 2
    const localY = row * this.config.blockSize + this.config.blockSize / 2
    return {
      x: this.container.x + localX,
      y: this.container.y + localY,
    }
  }

  /**
   * Get all visible blocks (for systems that need to iterate)
   */
  getVisibleBlocks(): Block[] {
    const visible: Block[] = []
    for (let row = 0; row < this.config.visibleRows; row++) {
      if (!this.blocks[row]) continue
      for (const block of this.blocks[row]) {
        if (block) visible.push(block)
      }
    }
    return visible
  }

  /**
   * Subscribe to depth change events
   */
  onDepthChange(listener: GridEventListener<DepthChangeEvent>): () => void {
    this.depthListeners.add(listener)
    return () => this.depthListeners.delete(listener)
  }

  /**
   * Subscribe to block destroyed events
   */
  onBlockDestroyed(listener: GridEventListener<BlockDestroyedEvent>): () => void {
    this.blockDestroyedListeners.add(listener)
    return () => this.blockDestroyedListeners.delete(listener)
  }

  /**
   * Subscribe to row cleared events
   */
  onRowCleared(listener: GridEventListener<RowClearedEvent>): () => void {
    this.rowClearedListeners.add(listener)
    return () => this.rowClearedListeners.delete(listener)
  }

  /**
   * Subscribe to block clicked events
   */
  onBlockClicked(listener: GridEventListener<BlockClickedEvent>): () => void {
    this.blockClickedListeners.add(listener)
    return () => this.blockClickedListeners.delete(listener)
  }

  /**
   * Subscribe to block hovered events
   */
  onBlockHovered(listener: GridEventListener<BlockHoveredEvent>): () => void {
    this.blockHoveredListeners.add(listener)
    return () => this.blockHoveredListeners.delete(listener)
  }

  /**
   * Get grid bounds for UI positioning
   */
  getGridBounds(): { left: number; right: number; top: number; bottom: number; width: number; height: number } {
    const width = this.config.gridWidth * this.config.blockSize
    const height = this.config.visibleRows * this.config.blockSize
    return {
      left: this.container.x,
      right: this.container.x + width,
      top: this.container.y,
      bottom: this.container.y + height,
      width,
      height,
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    // Clear all blocks
    for (const row of this.blocks) {
      for (const block of row) {
        if (block) {
          block.dispose()
        }
      }
    }
    this.blocks = []

    // Clear listeners
    this.depthListeners.clear()
    this.blockDestroyedListeners.clear()
    this.rowClearedListeners.clear()
    this.blockClickedListeners.clear()
    this.blockHoveredListeners.clear()

    // Destroy container
    this.container.destroy()
  }
}
