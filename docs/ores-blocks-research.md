# Ores & Blocks Research

## Overview

Research on mineable entities across idle/clicker mining games, organized by function rather than by game.

---

## Entity Categories by Function

### 1. SELL-ONLY RESOURCES (Primary Income)

Basic resources that exist purely to generate currency.

#### Motherload Ores (Depth-Based Value)

| Ore | Value | Min Depth | Notes |
|-----|-------|-----------|-------|
| Ironium | $30 | Surface | Starter ore |
| Bronzium | $60 | Surface | Common |
| Silverium | $100 | Surface | Common |
| Goldium | $250 | -250 ft | Mid-tier |
| Platinum | $750 | -1700 ft | Rare |
| Einsteinium | $2,000 | -2600 ft | Deep |
| Emerald | $5,000 | -4000 ft | Very deep |
| Ruby | $20,000 | -4800 ft | Extremely rare |
| Diamond | $100,000 | -5000 ft | Legendary |
| Amazonite | $500,000 | Deepest | Ultimate |

**Pattern:** ~3-5x value increase per tier, exponential curve

#### Mr. Mine Minerals

| Tier | Depth | Examples | Sell Value |
|------|-------|----------|------------|
| Common | 0-10 km | Coal, Copper, Iron | Low |
| Uncommon | 10-30 km | Silver, Gold | Medium |
| Rare | 30-50 km | Platinum, Titanium | High |
| Epic | 45-100 km | Diamond, Painite | Very High |
| Legendary | 100+ km | Californium, Black Opal | Extreme |
| Moon | 1000+ km | 13 unique types | Moon-tier |
| Titan | 1782+ km | 11 unique types | Titan-tier |

#### Idle Miner Tycoon

- Each mine type has ONE ore (Coal Mine = coal, Gold Mine = gold)
- Value determined by mine tier, not ore rarity
- Simpler system for casual mobile play

---

### 2. CRAFTING MATERIALS (Production Chains)

Resources used to create other items, not just sold.

#### Deep Town - Full Crafting Chain

```
MINING → SMELTING → CRAFTING → ADVANCED CRAFTING

Copper Ore → Copper Bar → Copper Wire → Circuit
Iron Ore → Iron Bar → Iron Nail → Steel Plate
Coal + Iron → Steel Bar → Steel components
```

| Resource | Source | Used For |
|----------|--------|----------|
| Copper Ore | Mining | Copper Bar, selling |
| Iron Ore | Mining | Iron Bar, Steel |
| Coal | Mining | Steel production, fuel |
| Silver Ore | Deep mining | Electronics, jewelry |
| Gold Ore | Deep mining | Advanced electronics |
| Aluminum | Chemical mining | Lightweight components |
| Titanium | Very deep | End-game crafting |

**Key Design:** Resources have BOTH sell value AND crafting use. Player must decide.

#### Mr. Mine - Isotopes (Special Crafting)

| Isotope | Source | Use |
|---------|--------|-----|
| Uranium-234 | Deep mining | Reactor fuel |
| Plutonium-238 | Very deep | Advanced fuel |
| Various | Caves, events | Blueprint crafting |

**Key Design:** Isotopes CANNOT be sold. Purely for crafting. Creates scarcity.

#### Terraria - Tool Gating

| Tier | Ores | Crafts Into | Pickaxe Required |
|------|------|-------------|------------------|
| 1 | Copper/Tin | Basic tools, armor | Wood |
| 2 | Iron/Lead | Better tools, anvil | Copper+ |
| 3 | Silver/Tungsten | Mid-tier gear | Iron+ |
| 4 | Gold/Platinum | Pre-boss gear | Silver+ |
| 5 | Demonite/Crimtane | Boss-tier | Gold+ |
| 6 | Hellstone | Hell gear | Nightmare/Deathbringer |
| HM1 | Cobalt/Palladium | Hardmode start | Molten |
| HM2 | Mythril/Orichalcum | Hardmode mid | Cobalt+ |
| HM3 | Adamantite/Titanium | Hardmode end | Mythril+ |

**Key Design:** Can't even MINE higher ores without better tools. Hard gates.

---

### 3. BUFF-GRANTING ITEMS (Temporary/Permanent Bonuses)

Items that provide effects beyond currency.

#### Mr. Mine - Chest Buffs

| Buff | Effect | Duration | Source |
|------|--------|----------|--------|
| Midas Touch | +X% sell value | Temporary | Gold Chest |
| Mining Speed | +X% mining speed | Temporary | Chests |
| Cargo Expansion | +50% cargo capacity | Temporary | Chests |
| Key of Luck | +50% chest spawn | Temporary | Rare chest |
| Elemental Pike | +50% isotope chance | Temporary | Rare chest |

#### Cookie Clicker - Golden Cookies

| Effect | What It Does | Rarity |
|--------|--------------|--------|
| Frenzy | x7 production for 77 seconds | Common |
| Lucky | Gain cookies based on bank | Common |
| Click Frenzy | x777 click power for 13 seconds | Rare |
| Building Special | x10 one building type | Rare |
| Cookie Storm | Rain of clickable cookies | Very Rare |
| Dragonflight | x1111 clicks for 10 seconds | Legendary |

**Key Design:** Variable rewards create excitement. "What will I get?"

#### Forager - Buff Items

| Item | Effect | Source |
|------|--------|--------|
| Bottled Lightning | Damage boost | Crafting |
| Liquid Luck | +Luck temporarily | Crafting |
| Various Foods | Stat buffs | Cooking |

---

### 4. UNLOCK ITEMS (Gate Progression)

Items that unlock new content, areas, or features.

#### Mr. Mine - Progression Unlocks

| Item | Unlocks |
|------|---------|
| Cave Keys | Access to specific caves |
| Blueprints | New drill components |
| Building Materials | New structures |
| Reactor Fuel | Power generation |
| Depth Milestones | New ore tiers, features |

#### Terraria - Boss Summoning

| Item | Source | Unlocks |
|------|--------|---------|
| Suspicious Eye | Crafted from lenses | Eye of Cthulhu boss |
| Worm Food | Crafted from rot | Eater of Worlds boss |
| Mechanical Parts | Hardmode ores | Mechanical bosses |

#### Deep Town - Guild Events

| Resource | Unlocks |
|----------|---------|
| Event Materials | Guild progression |
| Tech Components | Research tree |
| Portal Pieces | New areas |

---

### 5. SPECIAL EVENT BLOCKS (Variable Rewards)

Rare blocks that provide surprise rewards.

#### Mr. Mine - Chest System (Tiered)

| Chest Type | Rarity | Contents |
|------------|--------|----------|
| Basic Chest | Common | Small gold, common items |
| Silver Chest | Uncommon | Medium gold, buffs |
| Gold Chest | Rare | Large gold, rare buffs |
| Platinum Chest | Very Rare | Huge gold, rare items |
| Ethereal Chest | Legendary | Best rewards, exclusive items |

#### Motherload - Collectibles & Artifacts

| Item | Value | Depth |
|------|-------|-------|
| Dinosaur Bones | $1,000 | Mid |
| Martian Skeleton | $10,000 | Deep |
| Religious Artifact | $50,000 | Very Deep |
| ??? | $100,000+ | Deepest |

**Key Design:** Non-ore items break up monotony, provide discovery moments.

#### Cookie Clicker - Special Events

| Event | Trigger | Effect |
|-------|---------|--------|
| Golden Cookie | Random spawn | Various buffs |
| Wrath Cookie | Grandmapocalypse | Buff or debuff |
| Reindeer | Christmas season | Bonus cookies |
| Wrinkler | Grandmapocalypse | Consume then return 1.1x |

---

### 6. HAZARDS & OBSTACLES (Risk/Danger)

Blocks that provide challenge or negative effects.

#### Motherload - Environmental Hazards

| Hazard | Depth | Effect |
|--------|-------|--------|
| Gas Pockets | Random | Explosion damage |
| Lava Pockets | -1500+ ft | Fire damage |
| Earthquakes | -1000+ ft | Screen shake, damage |
| Satan | Bottom | Boss fight |

#### Terraria - Dangerous Blocks

| Block | Effect |
|-------|--------|
| Hellstone | Burns player when mined |
| Meteorite | Burns player on contact |
| Lava | Instant damage |
| Boulder Traps | Triggered, crush damage |

#### Mr. Mine - Enemies

| Enemy | Depth | Mechanic |
|-------|-------|----------|
| Cave Creatures | Caves | Combat required |
| Bosses | Milestones | Major fights |

---

## Tiering Systems Comparison

### System A: Depth-Based (Motherload, Mr. Mine)

```
DEPTH 0-100:    Common ores (low value)
DEPTH 100-500:  Uncommon ores (medium value)
DEPTH 500-1000: Rare ores (high value)
DEPTH 1000+:    Legendary ores (extreme value)
```

**Pros:** Natural progression, exploration feel
**Cons:** Can feel grindy waiting for depth

### System B: Rarity Colors (Most RPGs, Forager)

```
⬜ Common (Gray/White)
🟢 Uncommon (Green)
🔵 Rare (Blue)
🟣 Epic (Purple)
🟠 Legendary (Orange)
```

**Pros:** Instant visual communication, dopamine hit
**Cons:** Can feel arbitrary

### System C: Tool-Gated (Terraria, Minecraft)

```
Wood Pickaxe → Copper Ore
Copper Pickaxe → Iron Ore
Iron Pickaxe → Silver Ore
...etc
```

**Pros:** Clear progression gates, crafting matters
**Cons:** Can feel restrictive, blocked

### System D: Hybrid (Recommended)

Combine depth + rarity colors:
```
Depth 0-50:   ⬜ Common ores appear
Depth 25-75:  🟢 Uncommon start appearing
Depth 50-100: 🔵 Rare start appearing
Depth 75+:    🟣 Epic start appearing
Depth 100+:   🟠 Legendary possible
```

Each tier ALSO has depth-scaled spawn rates.

---

## Design Patterns & Recommendations

### Pattern 1: Dual-Purpose Resources

**Best Practice:** Some resources should be BOTH sellable AND useful for something else.

```
Iron Ore:
  - Sell for 50 gold
  - OR use 10 to upgrade Pickaxe
  
Player Decision: "Do I sell now or save for upgrade?"
```

### Pattern 2: Pure-Utility Resources

**Best Practice:** Some resources should NOT be sellable.

```
Crystal Shards:
  - Cannot sell
  - Used for prestige upgrades only
  
Creates: Scarcity, strategic hoarding
```

### Pattern 3: Tiered Special Events

**Best Practice:** Chests/events should have visible tiers.

```
Basic Chest → Silver Chest → Gold Chest → Ethereal Chest

Player thinks: "I hope I get a Gold chest!"
```

### Pattern 4: Discovery Moments

**Best Practice:** Include non-standard items that surprise.

```
Normal mining... normal mining...
*ARTIFACT FOUND: Ancient Pickaxe Blueprint*
"Woah, what's this?!"
```

### Pattern 5: Depth Milestones

**Best Practice:** Major unlocks at round-number depths.

```
Depth 50:  New ore tier unlocked!
Depth 100: Caves discovered!
Depth 150: New block type appears!
```

---

## Entity Interaction Matrix

| Entity Type | Sell? | Craft? | Buff? | Unlock? | Special? |
|-------------|-------|--------|-------|---------|----------|
| Common Ore | ✅ | ❌ | ❌ | ❌ | ❌ |
| Rare Ore | ✅ | Maybe | ❌ | ❌ | ❌ |
| Gems | ✅ | ✅ | ❌ | ❌ | ❌ |
| Crafting Material | ❌ | ✅ | ❌ | ❌ | ❌ |
| Buff Item | ❌ | ❌ | ✅ | ❌ | ❌ |
| Key/Unlock | ❌ | ❌ | ❌ | ✅ | ❌ |
| Chest | ❌ | ❌ | Maybe | Maybe | ✅ |
| Artifact | ✅ | ❌ | Maybe | Maybe | ✅ |
| Crystal Shard | ❌ | ❌ | ❌ | ✅ | ✅ |

---

## Recommendations for Idle Mining Game

### Core Ores (Sell for Gold)

| Tier | Color | Examples | Base Value | Depth Start |
|------|-------|----------|------------|-------------|
| Common | ⬜ | Stone, Coal, Copper | 1-10 | 0 |
| Uncommon | 🟢 | Iron, Silver | 15-50 | 25 |
| Rare | 🔵 | Gold, Platinum | 75-200 | 50 |
| Epic | 🟣 | Diamond, Ruby | 300-1000 | 75 |
| Legendary | 🟠 | Mythril, Adamantite | 1500-5000 | 100 |

### Special Blocks

| Block | Function | Rarity |
|-------|----------|--------|
| Crystal Shard | Prestige currency | Scales w/ depth |
| Chest | Random rewards | Uncommon |
| Artifact | Large gold + discovery | Rare |
| Gem Node | High-value gems | Rare |
| Unstable Block | Explodes (AoE mine) | Uncommon |

### Hazard Blocks (Optional)

| Block | Effect | Depth |
|-------|--------|-------|
| Gas Pocket | Damage if mined wrong | 50+ |
| Hard Rock | Extra HP, normal drops | 25+ |
| Lava Block | Damage over time nearby | 100+ |

### Crafting Materials (If Adding Crafting)

| Material | Source | Use |
|----------|--------|-----|
| Ore Dust | Byproduct of mining | Upgrade components |
| Gem Shards | Breaking gems | Equipment crafting |
| Ancient Parts | Artifacts | Special upgrades |
