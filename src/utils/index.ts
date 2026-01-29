// Utility function exports

// Color utilities
export {
  hexToRgb,
  rgbToHex,
  darkenColor,
  lightenColor,
  getDamageColor,
} from './color'

// Block effects
export {
  playBlockBreakEffect,
  playBlockHitEffect,
  resetBlockEffects,
  showDamageNumber,
  flashWhite,
  type BlockBreakEffectConfig,
  type DamageNumberConfig,
} from './BlockEffects'

// Random utilities
export {
  weightedRandom,
  randomItem,
  randomInt,
  randomFloat,
  rollChance,
  type WeightedItem,
} from './random'

// Terrain distribution
export {
  getTerrainTypeForDepth,
  getTerrainDistribution,
  canSpawnAtDepth,
} from './terrain'
