// Type declarations for phaser3-rex-plugins rexUI
// This provides basic types for IDE support

declare module 'phaser3-rex-plugins/templates/ui/ui-plugin.js' {
  import { Scene } from 'phaser'

  interface ButtonConfig {
    x?: number
    y?: number
    width?: number
    height?: number
    background?: Phaser.GameObjects.GameObject
    text?: Phaser.GameObjects.Text
    space?: { left?: number; right?: number; top?: number; bottom?: number }
  }

  interface LabelConfig {
    x?: number
    y?: number
    width?: number
    height?: number
    background?: Phaser.GameObjects.GameObject
    text?: Phaser.GameObjects.Text | string
    icon?: Phaser.GameObjects.GameObject
    space?: { left?: number; right?: number; top?: number; bottom?: number }
  }

  class RexUIPlugin extends Phaser.Plugins.ScenePlugin {
    add: {
      label(config: LabelConfig): Phaser.GameObjects.Container
      buttons(config: object): Phaser.GameObjects.Container
      dialog(config: object): Phaser.GameObjects.Container
      gridTable(config: object): Phaser.GameObjects.Container
      sizer(config: object): Phaser.GameObjects.Container
      overlapSizer(config: object): Phaser.GameObjects.Container
      fixWidthSizer(config: object): Phaser.GameObjects.Container
      gridSizer(config: object): Phaser.GameObjects.Container
      scrollablePanel(config: object): Phaser.GameObjects.Container
      textBox(config: object): Phaser.GameObjects.Container
      numberBar(config: object): Phaser.GameObjects.Container
      slider(config: object): Phaser.GameObjects.Container
      roundRectangle(
        x: number,
        y: number,
        width: number,
        height: number,
        radius?: number,
        color?: number,
        alpha?: number
      ): Phaser.GameObjects.GameObject
    }
  }

  export default RexUIPlugin
}

// Extend Phaser Scene to include rexUI
declare module 'phaser' {
  interface Scene {
    rexUI: import('phaser3-rex-plugins/templates/ui/ui-plugin.js').default
  }
}
