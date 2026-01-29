/**
 * Color Utilities
 *
 * Helper functions for color manipulation, primarily for
 * visual damage states on blocks.
 */

/**
 * Extract RGB components from a hex color number.
 * @param color - Hex color (e.g., 0x808080)
 * @returns Object with r, g, b values (0-255)
 */
export function hexToRgb(color: number): { r: number; g: number; b: number } {
  return {
    r: (color >> 16) & 0xff,
    g: (color >> 8) & 0xff,
    b: color & 0xff,
  }
}

/**
 * Convert RGB components to hex color number.
 * @param r - Red (0-255)
 * @param g - Green (0-255)
 * @param b - Blue (0-255)
 * @returns Hex color number
 */
export function rgbToHex(r: number, g: number, b: number): number {
  return ((r & 0xff) << 16) | ((g & 0xff) << 8) | (b & 0xff)
}

/**
 * Darken a color by a specified amount.
 * Used for block damage states - darker = more damaged.
 *
 * @param color - Base hex color
 * @param amount - Darkening amount (0 = no change, 1 = fully black)
 * @returns Darkened hex color
 */
export function darkenColor(color: number, amount: number): number {
  // Clamp amount to 0-1
  const factor = 1 - Math.max(0, Math.min(1, amount))

  const { r, g, b } = hexToRgb(color)

  return rgbToHex(
    Math.floor(r * factor),
    Math.floor(g * factor),
    Math.floor(b * factor)
  )
}

/**
 * Lighten a color by a specified amount.
 *
 * @param color - Base hex color
 * @param amount - Lightening amount (0 = no change, 1 = fully white)
 * @returns Lightened hex color
 */
export function lightenColor(color: number, amount: number): number {
  // Clamp amount to 0-1
  const factor = Math.max(0, Math.min(1, amount))

  const { r, g, b } = hexToRgb(color)

  return rgbToHex(
    Math.floor(r + (255 - r) * factor),
    Math.floor(g + (255 - g) * factor),
    Math.floor(b + (255 - b) * factor)
  )
}

/**
 * Get damage color for a block based on HP percentage.
 * Higher damage (lower HP) = darker color.
 *
 * @param baseColor - Block's base color
 * @param hpPercent - Current HP as percentage (0-1)
 * @returns Color adjusted for damage state
 */
export function getDamageColor(baseColor: number, hpPercent: number): number {
  // At 100% HP, no darkening. At 0% HP, darken by 60%.
  const damageAmount = (1 - hpPercent) * 0.6
  return darkenColor(baseColor, damageAmount)
}
