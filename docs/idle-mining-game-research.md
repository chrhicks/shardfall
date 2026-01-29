# Idle/Clicker Mining Games Research

## 1. Common Game Mechanics

### Active vs Passive Gameplay Progression

**Pattern: Click-to-Automation Transition**
- Games start with active clicking as the primary mechanic
- Progression naturally transitions to automation through unlocks
- Maintains engagement by making clicking feel impactful early, then rewarding passive play

| Game | Early Game | Automation Trigger |
|------|------------|-------------------|
| **Mr. Mine** | Click to mine | Hire workers, unlock Manager |
| **Idle Miner Tycoon** | Tap shafts manually | Hire Managers for each shaft/elevator/warehouse |
| **Cookie Clicker** | Click the cookie | Buy buildings (Grandmas, Farms, etc.) |
| **Motherload** | Direct drill control | N/A (remains active) |
| **Clicker Heroes** | Click monsters | Heroes deal auto-DPS |

### Prestige/Rebirth Systems

**Pattern: Multi-Tier Resets with Escalating Rewards**

Most successful idle games have layered prestige systems:

| Game | Tier 1 | Tier 2 | Tier 3 |
|------|--------|--------|--------|
| **Clicker Heroes** | Ascension (Hero Souls → buy Ancients) | Transcendence (Ancient Souls → buy Outsiders) | - |
| **Cookie Clicker** | Ascension (Heavenly Chips → Heavenly Upgrades) | - | - |
| **Idle Miner Tycoon** | Prestige per mine (6 levels, permanent income multiplier) | - | - |

**Key Design Elements:**
- **What resets:** Currency, buildings/generators, progress
- **What persists:** Prestige currency, permanent multipliers, meta-upgrades
- **Reward formula (Clicker Heroes):** `Ancient Souls = floor(5 × log₁₀(total Hero Souls sacrificed))`
- **Cookie Clicker:** +1% CpS per prestige level, plus Heavenly Upgrades

### Offline Progress

**Pattern: Capped Efficiency with Upgradeable Limits**

| Game | Base Offline Cap | Max Efficiency | Unlock Method |
|------|------------------|----------------|---------------|
| **Mr. Mine** | Limited | 100% for 48 hours | Building Manager Level 3 |
| **Idle Miner Tycoon** | ~2 hours | Extended via upgrades | Research tree + gem purchases |
| **Clicker Heroes** | Idle DPS only | Full idle build | Ancients (Siyalatas, Libertas) |

**Design Considerations:**
- Cap offline earnings to prevent trivializing active play
- Make offline efficiency upgradeable as a sink for premium/prestige currency
- Simplify calculations offline (e.g., ignore click bonuses, complex interactions)

### Achievement Systems

**Pattern: Tiered Milestones with Functional Rewards**

**Cookie Clicker** (622 achievements):
- Achievements unlock "milk" which boosts Kitten upgrades
- Categories: Cookies baked, CpS milestones, building counts, special events
- Shadow achievements (17) for extra challenge, don't affect milk

**Common Achievement Types:**
1. **Quantity milestones** (own X of building Y)
2. **Production milestones** (reach X currency/second)
3. **Total accumulation** (earn X total)
4. **Action-based** (click X times, prestige X times)
5. **Discovery** (find secret content, unlock features)

---

## 2. Resource Management

### Currency Architecture

**Industry Standard: Dual Currency System**

| Type | Purpose | Acquisition | Examples |
|------|---------|-------------|----------|
| **Soft Currency** | Core progression, basic upgrades | Gameplay activities | Dollars, Cookies, Gold |
| **Hard/Premium Currency** | Acceleration, cosmetics, premium content | Real money (primarily), rare drops | Super Cash, Gems, Rubies |

**Mr. Mine Specific Resources:**
- **Dollars ($)**: Primary currency (scales to octillions)
- **Minerals**: Mined resources, sold for dollars
- **Isotopes**: Rare resources for crafting (Reactor fuel, Blueprints) - **cannot be sold/traded**

### Faucet-and-Drain Economy

**Core Principle:** Balance resource generation (faucets) against consumption (drains/sinks)

**Common Resource Sinks:**
1. **Upgrades** - Primary sink, exponentially scaling costs
2. **Crafting** - Convert basic → advanced resources
3. **Unlocking content** - Gates behind currency thresholds
4. **Maintenance/upkeep** - Recurring costs for structures
5. **Prestige costs** - Idle Miner Tycoon charges cash to prestige

**Inflation Control Mechanisms:**
- **Storage limits** (upgradeable capacity)
- **Resource caps** per tier
- **Diminishing returns** on certain multipliers
- **Tiered resource hierarchies** (basic → advanced materials)

### Resource Conversion Systems

**Mr. Mine Pattern:**
```
Minerals → Sell Center → Dollars → Upgrades
Isotopes → Crafting → Fuel Rods → Reactor → Energy/Buffs
```

**Cookie Clicker Pattern:**
```
Clicks/Buildings → Cookies → Upgrades/Buildings
Cookies (total baked) → Ascend → Heavenly Chips → Heavenly Upgrades
```

---

## 3. Upgrade Systems

### Structure Types

| Type | Description | Example |
|------|-------------|---------|
| **Linear List** | Sequential unlocks, one path | Motherload (Hull → Fuel → Cargo → Drill tiers) |
| **Branching Trees** | Multiple paths, player choice | Idle Miner Tycoon (7 color-coded skill trees) |
| **Component-Based** | Multiple parts to upgrade independently | Mr. Mine Drill (Engine, Fan, Drill Bit, Cargo) |
| **Web/Grid** | Open-ended, many interconnections | Cookie Clicker Heavenly Upgrades |

### Idle Miner Tycoon's Skill Tree System

**7 Distinct Skill Trees:**

| Tree | Color | Focus | Currency Source |
|------|-------|-------|-----------------|
| Green | Green | Mine income | Start Cash |
| Blue | Blue | Ad bonuses, speed | Ice Cash |
| Red | Red | Manager abilities | Fire Cash |
| Pink | Pink | Super Managers, Mainland | Dawn Cash |
| Purple | Purple | Core mechanics (loading, mining speed) | Dusk Cash |
| Turquoise | Turquoise | Continent efficiency | Ancient Cash |
| Electric Blue | Electric Blue | Advanced bonuses | Underwater Cash |

**Unlock:** Research Island at 5.6 Trillion cash

### Cost Scaling Formulas

**Standard Exponential Growth:**
```
cost_next = cost_base × (rate_growth)^owned
```

**Common Growth Rates:**
- 1.15 (15% per level) - Standard
- 1.07 - Gentle scaling
- 1.5+ - Aggressive scaling for premium items

**Production Formula:**
```
production_total = (production_base × owned) × multipliers
```

**Key Insight:** Costs grow exponentially while production grows linearly/polynomially. This creates the core engagement loop where players must optimize purchases and eventually need prestige to continue progressing.

### Mr. Mine Drill Formula

**Multiplicative Component System:**
```
Total Watts = (Fan Base Watts + Drill Bit Base Watts) × Engine Multiplier
```

**Depth-Gated Blueprint Unlocks:**

| Depth | Blueprint Levels Available |
|-------|---------------------------|
| 50km | Levels 6-9 |
| 225km | Levels 10-13 |
| 1000km | Levels 18-20 |
| 1257km | Levels 24-26 |
| 1782km | Levels 33-36 |

### Cookie Clicker Prestige Potential System

**Tiered Unlock of Prestige Bonuses:**

| Upgrade | Chips Required | Prestige Unlocked |
|---------|----------------|-------------------|
| Heavenly Chip Secret | 11 | 5% |
| Heavenly Cookie Stand | 1,111 | 25% |
| Heavenly Bakery | 111,111 | 50% |
| Heavenly Confectionery | 11,111,111 | 100% |

This gates the power of prestige behind additional investment, preventing instant power spikes after ascension.

---

## 4. Block Types & Ore Systems

### Basic Terrain Blocks

| Type | Durability | Drops | Notes |
|------|------------|-------|-------|
| **Dirt/Soil** | Very low | Nothing | Easiest to break |
| **Stone/Rock** | Low-Medium | Nothing or stone | Standard terrain |
| **Hard Stone** | High | Nothing | Requires tool upgrades |
| **Bedrock** | Indestructible | N/A | Boundary marker |

### Special Block Types

| Type | Effect | Example Game |
|------|--------|--------------|
| **Collapsible** | Falls when undermined | SteamWorld Dig |
| **Metal/Pushable** | Moved by abilities | SteamWorld Dig |
| **Mushroom** | Bouncing/wall-jump surface | SteamWorld Dig |
| **Explosive/TNT** | Chain reaction damage to nearby blocks | Terraria, Minecraft |
| **Crates** | Destructible containers with loot | Multiple |
| **Chests** | Loot containers | Minecraft, Mr. Mine |
| **Relics** | Major reward artifacts | Dome Keeper, Mr. Mine |

### Environmental Hazard Blocks

| Hazard | Depth Trigger | Effect | Game |
|--------|---------------|--------|------|
| **Gas Pockets** | Random | Explosion damage | Motherload |
| **Lava/Magma** | Deep areas | Burns player, spawns when mined (Hellstone) | Terraria, Motherload |
| **Earthquakes** | -1000 ft+ | Screen shake, damage | Motherload |
| **Toxic/Acid Pools** | Mid-game | Damage over time | SteamWorld Dig |
| **Force Fields/Lasers** | Late-game | Block passage, damage | SteamWorld Dig |

### Block Durability Systems

**Idle Mine Remix HP/Defense Model:**
- **HP** - Total damage needed to break the block
- **Defense** - Resistance threshold (if defense > pickaxe power, no damage dealt)
- Creates natural tool progression gates

**Dome Keeper Depth Scaling:**
- More hits needed the farther from base
- Encourages strategic mining paths

### Ore Varieties & Rarity Tiers

#### Mr. Mine (6-Tier Depth-Based System)

| Tier | Depth Range | Examples |
|------|-------------|----------|
| **Common** | 0-10 km | Coal, Copper |
| **Rare** | 10-30 km | Silver, Gold |
| **Epic** | 30-50 km | Platinum, Diamond |
| **Legendary** | 45-305 km | Coltan, Painite, Black Opal, Californium |
| **Moon** | 1000-1032 km | 13 unique resources |
| **Titan** | 1782-1814 km | 11 unique resources |

#### Motherload (Value-Based Progression)

| Ore | Value | Min Depth | Common Depth |
|-----|-------|-----------|--------------|
| Ironium | $30 | -25 ft | -25 ft |
| Bronzium | $60 | -25 ft | -25 ft |
| Silverium | $100 | -25 ft | -25 ft |
| Goldium | $250 | -25 ft | -250 ft |
| Platinum | $750 | -800 ft | -1700 ft |
| Einsteinium | $2,000 | -1600 ft | -2600 ft |
| Emerald | $5,000 | -2400 ft | -4000 ft |
| Ruby | $20,000 | -4000 ft | -4800 ft |
| Diamond | $100,000 | -4400 ft | -5000 ft |
| Amazonite | $500,000 | Deep | Deepest |

#### Terraria (Tool-Gated Tiers)

**Pre-Hardmode Progression:**
Copper/Tin → Iron/Lead → Silver/Tungsten → Gold/Platinum → Demonite/Crimtane → Meteorite → Obsidian → Hellstone

**Hardmode Progression:**
Cobalt/Palladium → Mythril/Orichalcum → Adamantite/Titanium → Chlorophyte → Luminite

*Key mechanic: World generates ONE variant per tier (either Copper OR Tin, not both)*

#### Minecraft (Triangular Distribution by Y-Level)

| Ore | Best Y-Level | Special Notes |
|-----|--------------|---------------|
| Coal | Y=96 | Mountains |
| Copper | Y=48 | Dripstone Caves bonus |
| Iron | Y=16, Y=232 | Dual distribution peaks |
| Gold | Y=-16 | Badlands biome bonus |
| Lapis | Y=0 | - |
| Redstone | Y=-59 | Deep only |
| Diamond | Y=-59 | Reduced near air exposure |
| Emerald | Y=236 | Mountains only |

### Ore Generation Patterns

**Vein Systems:**
- Ores spawn in clusters of same type
- Dome Keeper: larger veins appear deeper
- Visual hints: dirt color changes near resources

**Weight-Based Spawning Algorithm:**
```
dirt_weight = 9.0
gold_weight = 1.0
total_weight = sum(all_weights)
roll = random(0, total_weight)
```

**Depth-Based Probability Curve:**
```
normalized_depth = (current_depth - min_depth) / (max_depth - min_depth)
// Peak probability at middle of ore's valid depth range
```

### Drop Mechanics

#### Direct Drops
- **Ore quantity** - Dome Keeper: 1-4 Iron per ore block, scales with depth
- **Multi-drop** - Stone drops stone + embedded ore type
- **Guaranteed drops** - Each ore type has base drop rate

#### Chance-Based Drops

| Drop Type | Base Chance | Modifiers | Game |
|-----------|-------------|-----------|------|
| Gems from rocks | 1-5% | Biome, skills | Forager |
| Rare items | Low | Depth | Motherload |
| Golden Ore variant | Upgradeable | Multipliers (3x value) | Idle Mine Remix |
| Triple Rock bonus | Chance-based | Upgrades | Idle Mine Remix |

#### Hidden Content & Discovery

| Content Type | Trigger | Reward | Game |
|--------------|---------|--------|------|
| **Caves** | Depth milestones | Special areas, unique resources | Mr. Mine |
| **Relics** | Deep mining | Perks, large resource drops | Dome Keeper |
| **Treasure Rooms** | Random/Exploration | Chest clusters | Minecraft |
| **Religious Artifacts** | Deep mining | $50,000 | Motherload |
| **Martian Skeletons** | Deep mining | $10,000 | Motherload |
| **Dinosaur Bones** | Mid-depth | $1,000 | Motherload |

#### Depth Milestone Bonuses

| Depth | Bonus | Game |
|-------|-------|------|
| 500 ft | $1,000 | Motherload |
| 1000 ft | $3,000 | Motherload |
| Various km | Blueprint unlocks | Mr. Mine |

### Key Design Patterns for Blocks & Ores

1. **Value scales exponentially** with rarity (~2-10x per tier)
2. **Depth gates progression** naturally without hard locks
3. **"Rich zones"** where ores peak before becoming rare again
4. **Tool requirements** create soft gates (can't damage high-defense blocks)
5. **Visual differentiation** through distinct colors per rarity tier
6. **Discovery rewards** (caves, relics, artifacts) break up core mining loop
7. **Biome/location bonuses** reward exploration (Forager: volcanic = 5% gem vs 1% normal)

---

## 5. Design Recommendations for a New Idle Mining Game

### Core Loop
1. **Early:** Manual clicking to mine, sell resources
2. **Mid:** Hire workers, automate mining, unlock new depths
3. **Late:** Optimize equipment, prestige for permanent bonuses

### Suggested Resource Structure
- **Primary:** Money (from selling ore)
- **Secondary:** Ore types (tiered by depth/rarity)
- **Tertiary:** Crafting materials (rare drops, depth-locked)
- **Premium:** Optional hard currency for acceleration

### Upgrade Categories
1. **Mining Equipment** (drill, picks, explosives)
2. **Workers** (quantity, efficiency, speed)
3. **Infrastructure** (storage, transport, processing)
4. **Automation** (managers, bots, conveyor systems)
5. **Prestige** (permanent multipliers, unlocks)

### Differentiation Opportunities
- **Depth-as-difficulty:** Mining difficulty increases with depth (like Mr. Mine)
- **Environmental hazards:** Gas pockets, lava, cave-ins (like Motherload)
- **Discovery elements:** Caves, relics, treasures (Mr. Mine)
- **Boss battles:** Underground monsters/challenges
- **Multiple worlds/planets:** Expand beyond single mine

---

## 5. Reference Games

### Mr. Mine
- Browser-based idle mining game
- Deep progression system with 1000+ km of depth
- Component-based drill upgrades
- Isotope crafting system

### Idle Miner Tycoon
- Mobile idle game
- 7 skill trees with different currencies
- Manager-based automation
- Multiple mines/continents

### Motherload
- Classic Flash mining game (now on Steam)
- Active gameplay (not idle)
- Depth-based progression
- Environmental hazards

### Cookie Clicker
- Definitive idle game
- Heavenly chip prestige system
- 622 achievements with functional rewards
- Building-based automation

### Clicker Heroes
- Idle RPG with mining-like progression
- Two-tier prestige system
- Hero-based automation
- Ancient/Outsider meta-upgrades

### Terraria
- Action-adventure sandbox
- Tool-gated ore progression (pickaxe tiers)
- World variant system (Copper OR Tin, not both)
- Hardmode unlocks new ore tiers
- Environmental hazards (lava from Hellstone)

### Minecraft
- Sandbox survival
- Y-level based ore distribution (triangular curves)
- Biome-specific bonuses (Emerald in mountains, Gold in badlands)
- Fortune enchantment for bonus drops

### SteamWorld Dig
- Metroidvania mining game
- Special block types (collapsible, mushroom, metal)
- Ability-gated progression
- Environmental hazards in late-game areas

### Dome Keeper
- Mining + tower defense hybrid
- Vein-based ore clusters
- Depth scaling for hits required
- Relic discovery system

### Forager
- Idle/crafting hybrid
- Biome-based resource bonuses
- Skill tree affects drop rates
- Resource node respawning
