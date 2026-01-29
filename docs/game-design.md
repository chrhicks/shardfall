# Shardfall - Game Design Document

## Overview

An idle/clicker mining game with depth-based progression and a prestige system tied to rare mineable Crystal Shards.

---

## Theme: Deep Earth Fantasy

*"The deeper you dig, the more you discover..."*

### Setting

Long ago, a great **Dwarven civilization** thrived in the depths of the earth. They built vast underground cities, forged legendary tools, and discovered a powerful energy source: **Crystal Shards** - crystallized magic that pulsed with the heartbeat of the world itself.

Then, something happened. The dwarves vanished. Their cities fell silent. The mines were abandoned.

Now, centuries later, **you** are a miner who has discovered an entrance to these forgotten depths. What treasures await below? What happened to the dwarves? And what power do the Crystal Shards truly hold?

### Tone

- **Cozy but mysterious** - Satisfying mining loop with hints of deeper lore
- **Discovery-focused** - Each depth milestone reveals more about the past
- **Hopeful** - You're uncovering wonders, not horrors

### Key Lore Elements

| Element | In-Game | Lore Explanation |
|---------|---------|------------------|
| **Crystal Shards** | Prestige currency | Crystallized magic from the world's core; the dwarves harnessed them for power |
| **Prestige** | Reset + keep shards | "Returning to the surface" to study shards and prepare for a deeper expedition |
| **Relics** | Run-long buffs | Dwarven artifacts - tools, charms, and inventions left behind |
| **Skill Tree** | Permanent upgrades | Knowledge gained from studying Crystal Shards; unlocks ancient techniques |
| **Depth Milestones** | New content | Discovering layers of the old dwarven civilization |
| **Ores** | Resources | Natural resources + dwarven alloys (Mythril, Adamantite, Orichalcum) |
| **Chests** | Random rewards | Dwarven supply caches, hidden for centuries |

### Depth as Story Progression

| Depth | Discovery | Lore |
|-------|-----------|------|
| 0-25 | Surface mines | Abandoned human mines, recent history |
| 25-50 | Dwarven Outposts | First signs of dwarven presence |
| 50-75 | Trade Roads | Ancient paths between settlements |
| 75-100 | Dwarven City Ruins | Crumbling halls, forges, homes |
| 100-125 | The Deep Forges | Where legendary items were crafted |
| 125-150 | Crystal Caverns | Natural shard formations, beautiful/eerie |
| 150+ | The Heart | What lies at the center? What happened here? |

### Visual Direction

- **Warm earth tones** - Browns, coppers, golds
- **Dwarven aesthetic** - Sturdy stonework, geometric patterns, forge-glow
- **Crystal accents** - Shards pulse with soft blue/purple light
- **Pixel art style** (per mockup) - Detailed but readable

### Game Title: **SHARDFALL**

*The name evokes the moment of discovery - when Crystal Shards "fall" into your possession, and the ancient dwarven civilization's "fall" into mystery.*

**Tagline options:**
- *"Dig deeper. Discover more."*
- *"The deeper you delve, the more you uncover."*
- *"What secrets lie below?"*
- *"Mine the forgotten depths."*

---

## Core Loop

```
MINE ──▶ ORE ──▶ GOLD ──▶ UPGRADES ──▶ GO DEEPER ──┐
  ▲                                                 │
  └─────────────────────────────────────────────────┘
```

**Player Actions:**
1. Click/tap to mine blocks
2. Collect ore drops
3. Sell ore for gold (auto? manual?)
4. Spend gold on upgrades (Damage, Speed, Luck)
5. Progress deeper where blocks are harder but ores are more valuable

**Interaction Feel:**
- The mining action should feel like Breakout or BALLxPIT: axes are launched upward, collide with the grid, then bounce back to the miner.
- The miner stands under the grid with a visible gap so thrown axes have clear travel space before impact.
- Early game input can still be click-to-mine, but the visual treatment should communicate the launch-and-return loop.

---

## Progression Systems

### A) Short-Term Upgrades (Gold) - Reset on Prestige

These upgrades cost **Gold** and reset every prestige. They have multiple levels with exponential cost scaling.

#### Core Mining Stats

| Upgrade | Effect | Base Cost | Scaling | Notes |
|---------|--------|-----------|---------|-------|
| **Pickaxe Power** | +1 damage per hit | 10 | 1.15x | Primary damage stat |
| **Swing Speed** | +0.1 hits/sec | 25 | 1.18x | Caps at reasonable max? |
| **Multi-Strike** | % chance to hit twice | 100 | 1.25x | Chance-based, powerful |

#### Economy Stats

| Upgrade | Effect | Base Cost | Scaling | Notes |
|---------|--------|-----------|---------|-------|
| **Ore Value** | +5% gold from selling | 50 | 1.12x | Multiplies all ore sales |
| **Prospecting** | +5% rare ore chance | 75 | 1.20x | Find better ores |

#### Luck/RNG Stats

| Upgrade | Effect | Base Cost | Scaling | Notes |
|---------|--------|-----------|---------|-------|
| **Fortune** | +2% bonus drop chance | 100 | 1.18x | Extra drops from blocks |
| **Treasure Hunter** | +3% chest/special spawn | 150 | 1.22x | More special blocks |

#### Formulas

```
Upgrade Cost = base_cost × (scaling ^ current_level)

Example - Pickaxe Power:
  Lv 1:  10 × 1.15^0  = 10 gold
  Lv 5:  10 × 1.15^4  = 17 gold
  Lv 10: 10 × 1.15^9  = 35 gold
  Lv 25: 10 × 1.15^24 = 288 gold
  Lv 50: 10 × 1.15^49 = 8,657 gold
```

### Depth Progression

- Deeper = harder blocks (more HP/Defense)
- Deeper = better ores (more valuable)
- Deeper = higher Crystal Shard spawn chance
- Creates natural difficulty curve and progress stall

---

## Meta Loop (Prestige)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   MAIN LOOP ──▶ PROGRESS STALLS ──▶ PRESTIGE ──▶ STRONGER   │
│       ▲                                              │      │
│       └──────────────────────────────────────────────┘      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Crystal Shards (Prestige Currency)

**What:** Rare, special blocks that spawn while mining

**Spawn Mechanic:**
- Spawn chance scales EXPONENTIALLY with depth
- Deeper = significantly higher chance to find Crystal Shards
- Rewards players who push through the grind

**Spawn Formula (Exponential):**
```
spawn_chance = 0.001 * (1.02 ^ depth)
```

| Depth | Spawn Chance | Approx. Blocks per Shard |
|-------|--------------|--------------------------|
| 10    | 0.12%        | 1 in 833                 |
| 25    | 0.16%        | 1 in 625                 |
| 50    | 0.27%        | 1 in 370                 |
| 75    | 0.45%        | 1 in 222                 |
| 100   | 0.72%        | 1 in 139                 |
| 150   | 1.96%        | 1 in 51                  |
| 200   | 5.2%         | 1 in 19                  |

*Note: These values are starting points - will need playtesting to tune.*

**Mining:**
- Crystal Shards are HARDER to mine than normal blocks
- Makes them feel special and rewarding
- Clear visual distinction when found

**Banking:**
- Crystal Shards are collected and banked immediately
- Survive prestige (never lost)
- Accumulated across all runs

### Prestige Trigger

**Unlock Condition:** Discovery of first Crystal Shard

- Prestige is NOT available from game start
- First Crystal Shard discovery unlocks prestige as an "emergent feature"
- Player realizes: "Oh, THIS is what these are for"
- Creates discovery moment / aha moment

**Cost to Prestige:** FREE (no cost)
- Player can prestige as soon as they have Crystal Shards
- Incentive to collect more: skill tree nodes have varying costs
- Player decides when to cash in vs keep pushing

### Prestige Reset

Prestiging returns you to the surface to study your Crystal Shards and prepare for a deeper expedition. Some progress is lost, but your accumulated knowledge remains.

**LOSE on Prestige:**
- Gold (current balance)
- Short-term upgrades (Pickaxe Power, Swing Speed, Multi-Strike, Ore Value, Prospecting, Fortune, Treasure Hunter)
- Depth progress (return to depth 0)
- Collected ores in inventory
- Crafted tools and equipment (Copper Pickaxe, Iron Pickaxe, etc.)
- Active relics (max 3-5 held)
- Consumables inventory (Mining Bombs, Potions, etc.)
- Temporary buffs (Midas Touch, Fury, Haste, etc.)

**KEEP on Prestige:**
- Crystal Shards (banked currency - never lost)
- Skill Tree progress (all unlocked nodes persist)
- Achievements (once unlocked, permanent)
- Banked gold from Midas node (1% of gold earned, if unlocked)

**Note on Crafted Items:** All crafted tools, equipment, and consumables are **per-run**. They provide powerful advantages during a run but must be re-crafted after prestige. This creates a meaningful choice: spend ores on crafting for immediate power, or sell them for gold to buy upgrades faster.

### B) Permanent Upgrades (Crystal Shards) - Central Hub Skill Tree

**Currency:** Crystal Shards (mined, never lost)

**Structure:** Central hub with themed archetype spokes radiating outward

#### Design Philosophy

- **Central Hub** - All players start here, branch into any direction
- **Themed Spokes** - Each spoke is an archetype mixing multiple upgrade families
- **Go Deep or Wide** - Specialize in one spoke or diversify across many
- **Expandable** - New spokes can be added without rebalancing existing ones
- **No Wrong Path** - Each spoke is independently useful

#### Skill Tree Layout

```
                                 ┌─────────────┐
                                 │   MINER     │
                                 │ Production  │
                                 │   Power     │
                                 └──────┬──────┘
                                        │
                                        │
      ┌─────────────┐                   │                   ┌─────────────┐
      │DEMOLITIONIST│                   │                   │ PROSPECTOR  │
      │   AoE &     │                   │                   │  Luck &     │
      │ Multi-Hit   │───────────────────┼───────────────────│  Discovery  │
      └─────────────┘                   │                   └─────────────┘
                                        │
                                 ┌──────┴──────┐
                                 │             │
                                 │   CENTER    │
                                 │   START     │
                                 │             │
                                 └──────┬──────┘
                                        │
      ┌─────────────┐                   │                   ┌─────────────┐
      │  ENGINEER   │───────────────────┼───────────────────│  MERCHANT   │
      │ Automation  │                   │                   │  Economy    │
      │   & Idle    │                   │                   │  & Value    │
      └─────────────┘                   │                   └─────────────┘
                                        │
                                 ┌──────┴──────┐
                                 │   CRYSTAL   │
                                 │   SEEKER    │
                                 │  Prestige   │
                                 │ Efficiency  │
                                 └─────────────┘
```

---

#### THE MINER (Production & Power)

*"Hit harder. Mine faster. Break everything."*

**Theme:** Raw extraction power, damage, and speed
**Upgrade Families:** Production, Damage, Speed

```
                         [CENTER]
                            │
                            ▼
                    ┌───────────────┐
                    │  Strong Arm   │
                    │  +20% Damage  │
                    │  (3 shards)   │
                    └───────┬───────┘
                            │
               ┌────────────┼────────────┐
               ▼            ▼            ▼
        ┌───────────┐ ┌───────────┐ ┌───────────┐
        │ Pickaxe   │ │ Steady    │ │ Deep      │
        │ Mastery   │ │ Rhythm    │ │ Strikes   │
        │ +25% DMG  │ │ +20% SPD  │ │ +15% vs   │
        │ (6)       │ │ (6)       │ │ hard rock │
        └─────┬─────┘ └─────┬─────┘ │ (6)       │
              │             │       └───────────┘
              ▼             ▼            
        ┌───────────┐ ┌───────────┐      
        │ Brutal    │ │ Relentless│      
        │ Force     │ │ Miner     │      
        │ +30% DMG  │ │ +25% SPD  │ 
        │ (12)      │ │ (12)      │ 
        └─────┬─────┘ └─────┬─────┘ 
              │             │       
              └──────┬──────┘       
                     ▼              
              ┌───────────┐         
              │ ★ POWER   │         
              │ STRIKE    │         
              │ Chance to │         
              │ deal 3x   │         
              │ damage    │         
              │ (20)      │         
              └───────────┘         
```

| Node | Effect | Cost | Requires |
|------|--------|------|----------|
| Strong Arm | +20% base damage | 3 | Center |
| Pickaxe Mastery | +25% base damage | 6 | Strong Arm |
| Steady Rhythm | +20% swing speed | 6 | Strong Arm |
| Deep Strikes | +15% damage vs hard blocks | 6 | Strong Arm |
| Brutal Force | +30% base damage | 12 | Pickaxe Mastery |
| Relentless Miner | +25% swing speed | 12 | Steady Rhythm |
| ★ Power Strike | 10% chance for 3x damage hit | 20 | Brutal Force + Relentless |

**Spoke Total: 65 shards**

---

#### THE DEMOLITIONIST (AoE & Multi-Hit)

*"Why mine one block when you can mine five?"*

**Theme:** Explosive power, chain reactions, area damage
**Upgrade Families:** AoE, Multi-Strike, Crit

```
                         [CENTER]
                            │
                            ▼
                    ┌───────────────┐
                    │ Unstable      │
                    │ Pickaxe       │
                    │ 5% multi-hit  │
                    │ (3 shards)    │
                    └───────┬───────┘
                            │
               ┌────────────┼────────────┐
               ▼            ▼            ▼
        ┌───────────┐ ┌───────────┐ ┌───────────┐
        │ Chain     │ │ Wide      │ │ Volatile  │
        │ Reaction  │ │ Swing     │ │ Ore       │
        │ +10%      │ │ Hit 2     │ │ Exploding │
        │ multi-hit │ │ adjacent  │ │ ores deal │
        │ (6)       │ │ (8)       │ │ AoE (8)   │
        └─────┬─────┘ └─────┬─────┘ └───────────┘
              │             │            
              ▼             ▼            
        ┌───────────┐ ┌───────────┐      
        │ Explosive │ │ Tremor    │      
        │ Crits     │ │ Strike    │      
        │ Crits hit │ │ Hit 3     │ 
        │ adjacent  │ │ adjacent  │ 
        │ (15)      │ │ (15)      │ 
        └─────┬─────┘ └─────┬─────┘ 
              │             │       
              └──────┬──────┘       
                     ▼              
              ┌───────────┐         
              │ ★ DETONATE│         
              │ 5% chance │         
              │ to clear  │         
              │ entire row│         
              │ (25)      │         
              └───────────┘         
```

| Node | Effect | Cost | Requires |
|------|--------|------|----------|
| Unstable Pickaxe | 5% chance to hit twice | 3 | Center |
| Chain Reaction | +10% multi-hit chance | 6 | Unstable Pickaxe |
| Wide Swing | Hits also damage 2 adjacent blocks | 8 | Unstable Pickaxe |
| Volatile Ore | Ore blocks explode for small AoE | 8 | Unstable Pickaxe |
| Explosive Crits | Critical hits damage adjacent blocks | 15 | Chain Reaction |
| Tremor Strike | Hits damage 3 adjacent blocks | 15 | Wide Swing |
| ★ Detonate | 5% chance to instantly clear entire row | 25 | Explosive Crits + Tremor |

**Spoke Total: 80 shards**

---

#### THE PROSPECTOR (Luck & Discovery)

*"Fortune favors the patient miner."*

**Theme:** Finding rare resources, treasure, special blocks
**Upgrade Families:** Luck, RNG, Discovery

```
                         [CENTER]
                            │
                            ▼
                    ┌───────────────┐
                    │ Keen Eye      │
                    │ +15% Luck     │
                    │ (3 shards)    │
                    └───────┬───────┘
                            │
               ┌────────────┼────────────┐
               ▼            ▼            ▼
        ┌───────────┐ ┌───────────┐ ┌───────────┐
        │ Ore Sense │ │ Treasure  │ │ Lucky     │
        │ Highlight │ │ Hunter    │ │ Strikes   │
        │ rare ores │ │ +25%      │ │ +10% crit │
        │ nearby    │ │ chest     │ │ chance    │
        │ (5)       │ │ spawn (6) │ │ (6)       │
        └─────┬─────┘ └─────┬─────┘ └─────┬─────┘
              │             │             │
              ▼             ▼             ▼
        ┌───────────┐ ┌───────────┐ ┌───────────┐
        │ Dowsing   │ │ Treasure  │ │ Fortune's │
        │ +30% rare │ │ Magnet    │ │ Favor     │
        │ ore spawn │ │ Auto-     │ │ +15% crit │
        │ (12)      │ │ collect   │ │ (12)      │
        └─────┬─────┘ │ nearby(12)│ └───────────┘
              │       └─────┬─────┘       
              └──────┬──────┘       
                     ▼              
              ┌───────────┐         
              │ ★ JACKPOT │         
              │ 2% chance │         
              │ for 10x   │         
              │ ore drop  │         
              │ (20)      │         
              └───────────┘         
```

| Node | Effect | Cost | Requires |
|------|--------|------|----------|
| Keen Eye | +15% base luck | 3 | Center |
| Ore Sense | Highlight rare ore blocks nearby | 5 | Keen Eye |
| Treasure Hunter | +25% chest/special block spawn | 6 | Keen Eye |
| Lucky Strikes | +10% critical hit chance | 6 | Keen Eye |
| Dowsing | +30% rare ore spawn rate | 12 | Ore Sense |
| Treasure Magnet | Auto-collect drops in small radius | 12 | Treasure Hunter |
| Fortune's Favor | +15% critical hit chance | 12 | Lucky Strikes |
| ★ Jackpot | 2% chance for 10x ore drop | 20 | Dowsing + Treasure Magnet |

**Spoke Total: 76 shards**

---

#### THE ENGINEER (Automation & Idle)

*"Work smarter, not harder."*

**Theme:** Automation, idle efficiency, passive income
**Upgrade Families:** Automation, Idle, QoL

```
                         [CENTER]
                            │
                            ▼
                    ┌───────────────┐
                    │ Efficient     │
                    │ Methods       │
                    │ +10% all      │
                    │ production    │
                    │ (3 shards)    │
                    └───────┬───────┘
                            │
               ┌────────────┼────────────┐
               ▼            ▼            ▼
        ┌───────────┐ ┌───────────┐ ┌───────────┐
        │ ★ AUTO-   │ │ Conveyor  │ │ Smart     │
        │ MINE      │ │ Belt      │ │ Upgrades  │
        │ Passive   │ │ ★ AUTO-   │ │ -10%      │
        │ mining    │ │ SELL ores │ │ upgrade   │
        │ (10)      │ │ (10)      │ │ costs (8) │
        └─────┬─────┘ └─────┬─────┘ └───────────┘
              │             │            
              ▼             ▼            
        ┌───────────┐ ┌───────────┐      
        │ Idle      │ │ Bulk      │      
        │ Mastery   │ │ Processing│      
        │ +50% auto │ │ +25% sell │ 
        │ efficiency│ │ value     │ 
        │ (15)      │ │ (12)      │ 
        └─────┬─────┘ └─────┬─────┘ 
              │             │       
              └──────┬──────┘       
                     ▼              
              ┌───────────┐         
              │ ★ OFFLINE │         
              │ PROGRESS  │         
              │ Earn 50%  │         
              │ while away│         
              │ (25)      │         
              └───────────┘         
```

| Node | Effect | Cost | Requires |
|------|--------|------|----------|
| Efficient Methods | +10% all production | 3 | Center |
| ★ Auto-Mine | Passive mining without clicking | 10 | Efficient Methods |
| ★ Auto-Sell | Automatically sell ores | 10 | Efficient Methods |
| Smart Upgrades | -10% short-term upgrade costs | 8 | Efficient Methods |
| Idle Mastery | +50% auto-mine efficiency | 15 | Auto-Mine |
| Bulk Processing | +25% ore sell value | 12 | Auto-Sell |
| ★ Offline Progress | Earn 50% while away | 25 | Idle Mastery + Bulk Processing |

**Spoke Total: 83 shards**

---

#### THE MERCHANT (Economy & Value)

*"Every ore has a price. Make sure it's a good one."*

**Theme:** Maximizing gold, ore value, economic bonuses
**Upgrade Families:** Economy, Value Multipliers, Gold Generation

```
                         [CENTER]
                            │
                            ▼
                    ┌───────────────┐
                    │ Appraisal     │
                    │ +15% ore      │
                    │ sell value    │
                    │ (3 shards)    │
                    └───────┬───────┘
                            │
               ┌────────────┼────────────┐
               ▼            ▼            ▼
        ┌───────────┐ ┌───────────┐ ┌───────────┐
        │ Gem       │ │ Haggler   │ │ Market    │
        │ Expert    │ │ +20% ore  │ │ Timing    │
        │ +50% gem  │ │ value     │ │ Bonus gold│
        │ value     │ │ (6)       │ │ on depth  │
        │ (6)       │ └─────┬─────┘ │ milestones│
        └─────┬─────┘       │       │ (6)       │
              │             │       └───────────┘
              ▼             ▼            
        ┌───────────┐ ┌───────────┐      
        │ Rare Ore  │ │ Golden    │      
        │ Specialist│ │ Touch     │      
        │ +75% rare │ │ +30% all  │ 
        │ ore value │ │ gold      │ 
        │ (12)      │ │ (15)      │ 
        └─────┬─────┘ └─────┬─────┘ 
              │             │       
              └──────┬──────┘       
                     ▼              
              ┌───────────┐         
              │ ★ MIDAS   │         
              │ 1% of gold│         
              │ earned is │         
              │ permanent │         
              │ (banked)  │         
              │ (30)      │         
              └───────────┘         
```

| Node | Effect | Cost | Requires |
|------|--------|------|----------|
| Appraisal | +15% ore sell value | 3 | Center |
| Gem Expert | +50% gem sell value | 6 | Appraisal |
| Haggler | +20% all ore value | 6 | Appraisal |
| Market Timing | Bonus gold at depth milestones | 6 | Appraisal |
| Rare Ore Specialist | +75% rare ore value | 12 | Gem Expert |
| Golden Touch | +30% all gold earned | 15 | Haggler |
| ★ Midas | 1% of gold earned is banked (survives prestige) | 30 | Rare Ore Specialist + Golden Touch |

**Spoke Total: 78 shards**

---

#### THE CRYSTAL SEEKER (Prestige Efficiency)

*"The shards call to those who listen."*

**Theme:** Finding more Crystal Shards, prestige bonuses
**Upgrade Families:** Prestige, Meta-Progression, Shard Generation

```
                         [CENTER]
                            │
                            ▼
                    ┌───────────────┐
                    │ Crystal       │
                    │ Affinity      │
                    │ +20% shard    │
                    │ spawn rate    │
                    │ (5 shards)    │
                    └───────┬───────┘
                            │
               ┌────────────┼────────────┐
               ▼            ▼            ▼
        ┌───────────┐ ┌───────────┐ ┌───────────┐
        │ Shard     │ │ Deep      │ │ Head      │
        │ Sense     │ │ Resonance │ │ Start     │
        │ Highlight │ │ +30% shard│ │ Begin w/  │
        │ shards    │ │ rate at   │ │ 500 gold  │
        │ nearby    │ │ depth 50+ │ │ (10)      │
        │ (8)       │ │ (10)      │ └───────────┘
        └─────┬─────┘ └─────┬─────┘       
              │             │            
              ▼             ▼            
        ┌───────────┐ ┌───────────┐      
        │ Crystal   │ │ Depth     │      
        │ Magnetism │ │ Mastery   │      
        │ Shards    │ │ +50% shard│ 
        │ easier to │ │ rate at   │ 
        │ mine -25% │ │ depth 100+│ 
        │ HP (15)   │ │ (20)      │ 
        └─────┬─────┘ └─────┬─────┘ 
              │             │       
              └──────┬──────┘       
                     ▼              
              ┌───────────┐         
              │ ★ CRYSTAL │         
              │ MASTERY   │         
              │ Shards    │         
              │ grant +1  │         
              │ bonus     │         
              │ shard on  │         
              │ pickup    │         
              │ (35)      │         
              └───────────┘         
```

| Node | Effect | Cost | Requires |
|------|--------|------|----------|
| Crystal Affinity | +20% Crystal Shard spawn rate | 5 | Center |
| Shard Sense | Highlight Crystal Shards nearby | 8 | Crystal Affinity |
| Deep Resonance | +30% shard spawn at depth 50+ | 10 | Crystal Affinity |
| Head Start | Begin each run with 500 gold | 10 | Crystal Affinity |
| Crystal Magnetism | Shards have -25% HP (easier to mine) | 15 | Shard Sense |
| Depth Mastery | +50% shard spawn at depth 100+ | 20 | Deep Resonance |
| ★ Crystal Mastery | Each shard mined grants +1 bonus shard | 35 | Crystal Magnetism + Depth Mastery |

**Spoke Total: 103 shards**

---

#### Total Shards to Complete All Spokes

| Spoke | Theme | Total Shards |
|-------|-------|--------------|
| Miner | Production & Power | 65 |
| Demolitionist | AoE & Multi-Hit | 80 |
| Prospector | Luck & Discovery | 76 |
| Engineer | Automation & Idle | 83 |
| Merchant | Economy & Value | 78 |
| Crystal Seeker | Prestige Efficiency | 103 |
| **GRAND TOTAL** | | **485 shards** |

---

#### Interaction: Short-Term × Permanent

```
FINAL STAT = Base × (1 + Short-Term Bonus) × (1 + Permanent Bonuses)

Example - Damage with Miner + Demolitionist investment:
  Base Damage: 1
  Pickaxe Power Lv 20: +20 damage (21 total)
  
  Miner Spoke:
    Strong Arm: +20%
    Pickaxe Mastery: +25%
    Brutal Force: +30%
    = +75% total
  
  Final = 21 × 1.75 = 36.75 damage per hit
```

#### Strategy: Go Deep vs Go Wide

| Strategy | Approach | Best For |
|----------|----------|----------|
| **Specialist** | Max out 1-2 spokes | Focused playstyle, faster capstone |
| **Generalist** | Buy entry nodes on all spokes | Balanced bonuses, flexibility |
| **Hybrid** | Deep on one, shallow on others | Main strength + utility |

**Design Goals:**
- Entry nodes (3-5 shards): Accessible early, small bonuses
- Mid nodes (6-15 shards): Meaningful choices, some unlocks
- Capstone nodes (20-35 shards): Powerful rewards, build-defining
- No wrong path: Every spoke provides value
- Expandable: Can add new spokes (e.g., "Geologist", "Alchemist") later

---

---

## Blocks & Ores System

### Block Types Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           BLOCK TYPES                                    │
│                                                                          │
│  TERRAIN          ORE BLOCKS         SPECIAL BLOCKS                      │
│  ────────         ──────────         ──────────────                      │
│  ⬛ Stone         ⬜ Common Ore      💎 Crystal Shard                     │
│  🟫 Hard Rock     🟢 Uncommon Ore   📦 Chest                             │
│  ite)             🔵 Rare Ore       🏺 Artifact (Relic)                  │
│                   🟣 Epic Ore       💠 Gem Node                          │
│                   🟠 Legendary Ore                                       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Terrain Blocks

Basic blocks that must be mined through to progress deeper.

| Block | HP | Depth | Drops | Notes |
|-------|-----|-------|-------|-------|
| **Stone** | Low | 0+ | Nothing | Basic filler |
| **Hard Rock** | Medium | 25+ | Nothing | Slower to mine |
| **Dense Rock** | High | 50+ | Nothing | Requires good damage |
| **Ancient Stone** | Very High | 100+ | Rare: Artifact | Late-game barrier |

**HP Scaling Formula:**
```
block_hp = base_hp × (1.03 ^ depth)

Stone:       base_hp = 5
Hard Rock:   base_hp = 15
Dense Rock:  base_hp = 40
Ancient:     base_hp = 100
```

---

### Ore Blocks (Sell or Craft)

Ores can be **SOLD for gold** OR **SAVED for crafting** upgrades.

#### Ore Tiers

| Tier | Color | Ores | Base Value | Depth | Spawn Rate |
|------|-------|------|------------|-------|------------|
| ⬜ **Common** | Gray | Coal, Copper, Tin | 5-15g | 0+ | 30% |
| 🟢 **Uncommon** | Green | Iron, Silver, Zinc | 25-60g | 20+ | 20% |
| 🔵 **Rare** | Blue | Gold, Platinum, Cobalt | 100-250g | 45+ | 10% |
| 🟣 **Epic** | Purple | Diamond, Ruby, Sapphire | 400-1000g | 70+ | 5% |
| 🟠 **Legendary** | Orange | Mythril, Adamantite, Orichalcum | 1500-5000g | 100+ | 2% |

#### Ore Spawn Model

Each block in the mine has a base chance to be a special block (ore, chest, etc.) rather than plain terrain:

```
Block Generation:
  - (100% - ore_spawn_chance): Stone/Bedrock (terrain)
  - ore_spawn_chance: Roll on ore tier weights below
```

The "Spawn Rate" column above represents the *relative weight* within the ore pool, not the absolute chance per block.

#### Ore Tier Overlap Curves

As depth increases, higher tier ores gradually appear while lower tiers become rarer. All tiers remain available at all depths (after unlock), but weights shift dramatically. Lower tiers asymptotically approach zero but never fully disappear.

| Depth | Common | Uncommon | Rare | Epic | Legendary | Notes |
|-------|--------|----------|------|------|-----------|-------|
| 0 | 100% | — | — | — | — | Only common ores |
| 10 | 100% | — | — | — | — | Still only common |
| 20 | 80% | 20% | — | — | — | Uncommon unlocks |
| 30 | 60% | 40% | — | — | — | Transitioning |
| 45 | 40% | 40% | 20% | — | — | Rare unlocks |
| 60 | 25% | 35% | 35% | 5% | — | Approaching Epic |
| 70 | 18% | 28% | 35% | 19% | — | Epic unlocks |
| 85 | 12% | 20% | 32% | 32% | 4% | Approaching Legendary |
| 100 | 8% | 15% | 28% | 35% | 14% | Legendary unlocks |
| 125 | 5% | 10% | 22% | 38% | 25% | Deep mining |
| 150 | 3% | 7% | 18% | 37% | 35% | Very deep |
| 200 | 1% | 4% | 12% | 33% | 50% | Endgame depths |

*Percentages are relative weights within the ore pool, normalized to 100% at each depth.*

**Design Notes:**
- Common ores decay linearly as depth increases, ensuring early-game materials remain available (for crafting) but become increasingly rare
- Each tier "peaks" around when the next tier unlocks, then gradually declines
- Legendary caps around 50% even at extreme depths to maintain variety
- Values will need playtesting — may adjust decay rates based on crafting material requirements

#### Specific Ores

**Common Tier (⬜)**
| Ore | Value | Depth | Crafting Use |
|-----|-------|-------|--------------|
| Coal | 5g | 0+ | Fuel for smelting |
| Copper | 10g | 0+ | Basic components |
| Tin | 8g | 5+ | Alloy material |
| Stone Chunk | 3g | 0+ | Building material |

**Uncommon Tier (🟢)**
| Ore | Value | Depth | Crafting Use |
|-----|-------|-------|--------------|
| Iron | 25g | 20+ | Core crafting material |
| Silver | 40g | 25+ | Refined components |
| Zinc | 30g | 20+ | Alloy material |
| Quartz | 50g | 30+ | Energy components |

**Rare Tier (🔵)**
| Ore | Value | Depth | Crafting Use |
|-----|-------|-------|--------------|
| Gold | 100g | 45+ | Premium components |
| Platinum | 175g | 50+ | Advanced crafting |
| Cobalt | 150g | 55+ | Tool enhancement |
| Amethyst | 200g | 60+ | Magic components |

**Epic Tier (🟣)**
| Ore | Value | Depth | Crafting Use |
|-----|-------|-------|--------------|
| Diamond | 500g | 70+ | Elite components |
| Ruby | 600g | 75+ | Power enhancement |
| Sapphire | 550g | 75+ | Speed enhancement |
| Emerald | 700g | 80+ | Luck enhancement |

**Legendary Tier (🟠)**
| Ore | Value | Depth | Crafting Use |
|-----|-------|-------|--------------|
| Mythril | 1500g | 100+ | Mythic crafting |
| Adamantite | 2500g | 110+ | Ultimate tools |
| Orichalcum | 3500g | 120+ | Divine components |
| Celestine | 5000g | 150+ | Endgame crafting |

---

### Crafting System

**Core Decision:** Sell ores for immediate gold OR save them for permanent/powerful upgrades.

#### Crafting Categories

```
┌─────────────────────────────────────────────────────────────────┐
│                      CRAFTING                                    │
│                                                                  │
│  TOOL UPGRADES          EQUIPMENT           CONSUMABLES          │
│  ─────────────          ─────────           ───────────          │
│  Pickaxe Tiers          Helmet (+HP)        Mining Bombs         │
│  Drill Parts            Gloves (+Speed)     Luck Potions         │
│  Lantern (+Vision)      Boots (+Depth)      Value Boosters       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### Tool Upgrades (Permanent for Run)

| Upgrade | Materials | Effect |
|---------|-----------|--------|
| **Copper Pickaxe** | 20 Copper | +25% base damage |
| **Iron Pickaxe** | 30 Iron, 10 Coal | +50% base damage |
| **Gold Pickaxe** | 25 Gold, 20 Iron | +100% base damage |
| **Diamond Pickaxe** | 15 Diamond, 30 Gold | +200% base damage |
| **Mythril Pickaxe** | 10 Mythril, 20 Diamond | +400% base damage |

| Upgrade | Materials | Effect |
|---------|-----------|--------|
| **Basic Lantern** | 15 Copper, 5 Coal | Reveal ores 2 blocks away |
| **Silver Lantern** | 20 Silver, 10 Quartz | Reveal ores 4 blocks away |
| **Crystal Lantern** | 10 Amethyst, 15 Quartz | Reveal special blocks |

#### Equipment (Permanent for Run)

| Equipment | Materials | Effect |
|-----------|-----------|--------|
| **Miner's Helmet** | 25 Iron, 10 Copper | +20% HP (survive hazards?) |
| **Swift Gloves** | 20 Silver, 15 Zinc | +15% swing speed |
| **Deep Boots** | 30 Cobalt, 20 Iron | Unlock depth 100+ |
| **Lucky Charm** | 5 Emerald, 10 Amethyst | +10% luck |

#### Consumables (Single Use)

| Item | Materials | Effect |
|------|-----------|--------|
| **Mining Bomb** | 10 Coal, 5 Iron | Instantly clear 3x3 area |
| **Luck Potion** | 3 Emerald, 5 Quartz | +50% luck for 60 seconds |
| **Gold Rush Elixir** | 5 Gold, 3 Ruby | +100% ore value for 60 seconds |
| **Depth Charge** | 15 Cobalt, 10 Coal | Skip 10 depth levels |

#### Bonus Stacking Rules

All percentage bonuses from **different sources** stack **multiplicatively**. Bonuses from the **same source** stack **additively** within that source first, then multiply with other sources.

**Bonus Sources:**
1. **Base Stats** - Starting values
2. **Short-Term Upgrades** - Purchased with gold (reset on prestige)
3. **Crafted Equipment** - Made from ores (reset on prestige)
4. **Relics** - Found in chests/artifacts (reset on prestige)
5. **Skill Tree** - Purchased with Crystal Shards (permanent)
6. **Temporary Buffs** - From chests or consumables (timed duration)

**Formula:**
```
Final Stat = Base × (1 + Σ short_term) × (1 + Σ crafted) × (1 + Σ relics) × (1 + Σ skill_tree) × (1 + Σ temp_buffs)
```

**Example - Damage Calculation:**
```
Base Damage: 1
Short-Term: Pickaxe Power Lv 20 → +20 damage (now 21 base)

Multipliers:
  Crafted:    Iron Pickaxe (+50%)        = 1.50
  Relic:      Warrior's Pickaxe (+30%)   = 1.30
  Skill Tree: Strong Arm + Pickaxe Mastery (+20% + 25% = +45%) = 1.45
  Temp Buff:  Fury (+75%)                = 1.75

Final = 21 × 1.50 × 1.30 × 1.45 × 1.75 = 103.9 damage per hit
```

**Consumables & Temporary Buffs:**
- Crafted consumables (Luck Potion, Gold Rush Elixir) and chest buffs (Midas Touch, Fury) are both "Temporary Buffs"
- Multiple temp buffs of different types stack multiplicatively with each other
- Same buff from different sources refreshes duration, does not stack (e.g., two Fury buffs = one Fury with reset timer)
- Consumables can always be used regardless of active relics or other buffs

---

### Special Blocks

#### Crystal Shard (Prestige Currency)

Already defined - rare block that spawns based on depth, provides prestige currency.

#### Chests (Tiered Random Rewards)

Chests spawn randomly while mining and contain variable rewards.

| Chest | Rarity | Depth | Possible Contents |
|-------|--------|-------|-------------------|
| **Wooden Chest** | Common | 0+ | 50-200g, Common ores (5-10) |
| **Iron Chest** | Uncommon | 25+ | 200-500g, Uncommon ores (5-10), Small buff |
| **Gold Chest** | Rare | 50+ | 500-2000g, Rare ores (3-5), Medium buff |
| **Diamond Chest** | Epic | 75+ | 2000-5000g, Epic ores (2-4), Strong buff, Relic chance |
| **Ethereal Chest** | Legendary | 100+ | 5000-20000g, Legendary ores (1-3), Powerful buff, Relic |

**Chest Spawn Rate:**
```
base_rate = 0.5% per block
tier_weights:
  Wooden:   60%
  Iron:     25%
  Gold:     10%
  Diamond:  4%
  Ethereal: 1%
```

#### Chest Buffs (Temporary)

| Buff | Duration | Effect | Source |
|------|----------|--------|--------|
| **Midas Touch** | 60s | +50% ore value | Iron+ Chest |
| **Fury** | 45s | +75% damage | Gold+ Chest |
| **Haste** | 60s | +50% speed | Iron+ Chest |
| **Fortune** | 90s | +100% rare ore chance | Gold+ Chest |
| **Shard Sense** | 120s | Crystal Shards highlighted | Diamond+ Chest |

---

### Artifacts / Relics (Run Buffs)

**Relics** are rare items found in chests or special blocks that provide **run-long buffs**. They reset on prestige but can dramatically change a run's playstyle.

#### Relic System

- Found in Diamond/Ethereal chests, Artifact blocks, or at depth milestones
- **One-time pickup** per run (can't find duplicates)
- **Persist until prestige** (not consumed)
- **Max 3-5 active relics** per run (creates strategic choices)

#### Relic List

**Damage Relics**
| Relic | Effect | Rarity |
|-------|--------|--------|
| **Warrior's Pickaxe** | +30% damage | Common |
| **Berserker's Fury** | +10% damage per depth milestone | Uncommon |
| **Giant's Strength** | +100% damage, -20% speed | Rare |
| **Vorpal Edge** | Crits deal +100% extra damage | Epic |

**Speed Relics**
| Relic | Effect | Rarity |
|-------|--------|--------|
| **Swift Pick** | +25% swing speed | Common |
| **Caffeine Crystal** | +50% speed, -10% damage | Uncommon |
| **Time Shard** | Buffs last 50% longer | Rare |
| **Haste Amulet** | +15% speed per relic owned | Epic |

**Economy Relics**
| Relic | Effect | Rarity |
|-------|--------|--------|
| **Merchant's Eye** | +20% ore sell value | Common |
| **Miser's Pouch** | +5% gold per 1000g owned | Uncommon |
| **Golden Touch** | 10% chance for double gold | Rare |
| **Philosopher's Stone** | Common ores worth 5x | Epic |

**Luck Relics**
| Relic | Effect | Rarity |
|-------|--------|--------|
| **Lucky Coin** | +15% luck | Common |
| **Four-Leaf Clover** | +25% chest spawn rate | Uncommon |
| **Treasure Map** | Chests upgrade one tier | Rare |
| **Jackpot Gem** | 5% chance for 10x ore drops | Epic |

**Utility Relics**
| Relic | Effect | Rarity |
|-------|--------|--------|
| **Spelunker's Torch** | Reveal blocks 3 tiles ahead | Common |
| **Dowsing Rod** | Highlight rare ores nearby | Uncommon |
| **Crystal Compass** | +30% Crystal Shard spawn | Rare |
| **Pocket Furnace** | Auto-smelt ores (+10% value) | Epic |

**Legendary Relics** (Max 1 per run)
| Relic | Effect | Rarity |
|-------|--------|--------|
| **Crown of the Deep** | All other relics +50% effective | Legendary |
| **Eternal Flame** | Never lose combo/momentum | Legendary |
| **Void Pickaxe** | 1% chance to instantly destroy any block | Legendary |

---

### Gem Nodes (High-Value Clusters)

Special blocks that contain multiple gems of the same type.

| Node Type | Contents | Depth | Spawn Rate |
|-----------|----------|-------|------------|
| **Quartz Cluster** | 5-10 Quartz | 30+ | 2% |
| **Amethyst Geode** | 3-6 Amethyst | 60+ | 1% |
| **Ruby Vein** | 2-4 Ruby | 75+ | 0.5% |
| **Diamond Cache** | 1-3 Diamond | 85+ | 0.25% |

---

### Block Interaction Summary

| Block Type | Action | Reward | Special |
|------------|--------|--------|---------|
| Terrain | Mine through | Nothing | Barrier |
| Ore | Mine | Ore (sell/craft) | Tiered value |
| Crystal Shard | Mine (hard) | Prestige currency | Exponential spawn |
| Chest | Open | Gold, ores, buffs, relics | Tiered rewards |
| Artifact | Collect | Relic | One per location |
| Gem Node | Mine | Multiple gems | High value cluster |

---

### The Sell vs Craft Decision

**Core Tension:**
```
SELL ORE NOW:
  ✓ Immediate gold
  ✓ Buy short-term upgrades faster
  ✓ Progress now
  ✗ Can't craft later

SAVE FOR CRAFTING:
  ✓ Powerful permanent (run) upgrades
  ✓ Better tools = faster mining
  ✗ Slower immediate progress
  ✗ Opportunity cost
```

**Example Decision:**
```
You have 30 Iron.
  - Sell: 30 × 25g = 750 gold
  - Craft: Iron Pickaxe (+50% damage)
  
Which helps more right now?
```

---

## Tension & Player Decisions

### The Core Tension

```
GO DEEPER:
  ✓ More valuable ores
  ✓ Higher Crystal Shard chance
  ✗ Blocks take longer to mine
  ✗ Progress slows down

PRESTIGE NOW:
  ✓ Get stronger via Skill Tree
  ✓ Faster early game next run
  ✗ Lose current progress
  ✗ Start from depth 0
```

**Player Question:** *"Do I grind deeper for more Crystal Shards, or prestige now and come back stronger?"*

### Decision Points

1. **Which upgrade to buy?** (Damage vs Speed vs Luck)
2. **Keep pushing or prestige?** (Depth vs Reset)
3. **Which skill tree path?** (Build choices)
4. **Sell or craft?** (Immediate gold vs powerful tools)
5. **Which relics to keep?** (Max 3-5, synergy choices)

---

## UI Reference

### Visual Direction

See mockups in `/docs/mockups/` for visual reference.

| Mockup | Description |
|--------|-------------|
| [mock_001.jpg](./mockups/mock_001.jpg) | Original concept - establishes pixel art style, warm earth tones, dwarven aesthetic |
| [mock_002.jpg](./mockups/mock_002.jpg) | Updated UI - inventory, crafting, relics panel, skill tree popup |
| [mock_003.jpg](./mockups/mock_003.jpg) | Short-term upgrades panel |
| [mock_004.jpg](./mockups/mock_004.jpg) | Prestige state - bottom action bar, expanded skill tree |

**Style Guidelines:**
- Pixel art with warm earth tones (browns, coppers, golds)
- Dark cave atmosphere with torch lighting
- Dwarven aesthetic - sturdy stonework, geometric patterns
- Crystal Shards pulse with soft blue/purple light
- UI panels use wood/stone frame aesthetic

### Screen Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  [Gold: 2450]  [Crystal Shards: 85]                                 │
├───────────────────────────────────────────┬─────────────────────────┤
│                                           │ Depth: 47               │
│                                           ├─────────────────────────┤
│                                           │ [Buff Timers]           │
│         MINING GRID                       │  - 13h [icon]           │
│                                           │  - 3h 48m [icon]        │
│    ┌─────────────────────────┐            │  - 70m [icon]           │
│    │ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ │            ├─────────────────────────┤
│    │ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ │            │ RIGHT PANEL             │
│    │ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ │            │ [Tabs: ⛏ 🔨 💰]        │
│    │ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ │            │                         │
│    │ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ │            │ Tab content:            │
│    └─────────────────────────┘            │ - Upgrades              │
│                                           │ - Inventory/Crafting    │
│    🔥                           🔥        │ - Relics                │
│         ┌─────────────────┐               │                         │
│         │  SKILL TREE     │               │                         │
│         │   (popup)       │               │                         │
│         └─────────────────┘               │                         │
│              ⛏️ MINER                      │                         │
├───────────────────────────────────────────┴─────────────────────────┤
│  [⚙️ Settings]  [✨ Prestige]  [📦]  [📜]                            │
└─────────────────────────────────────────────────────────────────────┘
```

### UI Components

#### Top Bar
- **Gold counter** - Coin icon + amount
- **Crystal Shards counter** - Shard icon + amount

#### Mining Area (Center)
- **Block grid** - Approximately 10x12 visible blocks
- **Terrain blocks** - Visual variants by depth (lighter → darker as depth increases)
- **Ore blocks** - Color-coded by tier (gray/green/blue/purple/orange)
- **Special blocks** - Crystal Shards, Chests (5 visual tiers), Gem Nodes, Artifacts
- **Block damage states** - Progressive crack overlays
- **Miner character** - Bottom center with pickaxe swing animations
- **Launch gap** - Clear space between miner and grid for thrown axes to travel
- **Axe loop** - Axes arc upward to mine and return to the miner (Breakout/BALLxPIT feel)
- **Cave framing** - Stone walls, torches for atmosphere

#### Right Side HUD
- **Depth indicator** - Current depth number
- **Active buff timers** - Icon + remaining time for each active buff

#### Right Panel (Tabbed)

**Tab 1: Short-Term Upgrades**
| Upgrade | Icon | Description |
|---------|------|-------------|
| Pickaxe Power | Pickaxe | +damage per level |
| Swing Speed | Boot | +speed per level |
| Multi-Strike | Double pickaxe | % chance to hit twice |
| Ore Value | Gold bar | +% gold from selling |
| Prospecting | Gem | +% rare ore chance |
| Fortune | Clover | +% bonus drop chance |
| Treasure Hunter | Chest | +% chest spawn |

Each upgrade shows: Icon, Name, Current effect, Cost in Gold

**Tab 2: Inventory & Crafting**
- **Ore inventory grid** - Shows collected ores with stack counts
- **Sell / Craft buttons** - Toggle between selling and crafting modes
- **Crafting sections** (collapsible):
  - Tools (pickaxes, lanterns)
  - Equipment (helmet, gloves, boots, charm)
  - Consumables (bombs, potions, elixirs)

**Tab 3: Relics**
- **Active relic slots** (3-5) - Shows equipped relics
- **Relic details** - Hover/tap for effect description

#### Skill Tree (Popup/Modal)
- **Triggered by** - Button in bottom bar or automatic on first Crystal Shard
- **Layout** - Central hub with 6 spokes radiating outward
- **Node states** - Locked (dark), Available (highlighted border), Unlocked (golden/lit)
- **Spoke icons** - Represent each archetype (Miner, Demolitionist, Prospector, Engineer, Merchant, Crystal Seeker)

#### Bottom Action Bar
- **Settings** - Gear icon
- **Prestige** - Golden button with shard icon (appears after first shard collected)
- **Additional slots** - For future features (achievements, stats, etc.)

### State Variations

**Early Game (pre-prestige unlock)**
- Prestige button hidden
- Only surface-level terrain visible
- Limited ore tiers spawning

**Prestige Available**
- Prestige button glows/pulses
- Skill Tree button prominent

**Active Buffs**
- Buff timer icons appear in right HUD
- Visual effects on miner or grid when powerful buffs active

**Late Game**
- All ore tiers visible
- Multiple relics equipped
- Skill Tree significantly filled

---

## Open Questions

### Gameplay
- [x] Auto-sell ores or manual sell? **Manual by default. Auto-Sell unlocked via Engineer skill tree node.**
- [x] Offline progress? How much? **None by default. Offline Progress (50% efficiency) unlocked via Engineer skill tree capstone.**
- [x] Achievements system? **Future feature - not required for MVP**
- [x] What's the prestige cost (if any)? **FREE - player can prestige anytime after first shard**

### Blocks & Ores
- [x] How many ore tiers? **5 tiers: Common, Uncommon, Rare, Epic, Legendary**
- [x] What are the ore names/themes? **Fantasy metals + gems (Copper→Iron→Gold→Diamond→Mythril)**
- [x] Block HP/Defense formula by depth? **block_hp = base_hp × (1.03 ^ depth)**
- [x] Crystal Shard spawn % formula? **Exponential: 0.001 * (1.02 ^ depth)**
- [x] Crafting system? **Yes - ores can be sold OR used for tool/equipment/consumable crafting**
- [x] Chests? **Yes - 5 tiers (Wooden→Iron→Gold→Diamond→Ethereal) with variable rewards**
- [x] Relics/Artifacts? **Yes - run-specific buffs, max 3-5 per run, found in chests/special blocks**

### Skill Tree
- [x] How many nodes total? **~40 nodes across 6 spokes, 485 total shards to complete**
- [x] What mechanics does it unlock? **Auto-Mine, Auto-Sell, Offline Progress, AoE hits, Crits, Treasure detection, Banked gold**
- [x] Node cost scaling? **Fixed costs per node (3-5 entry → 6-15 mid → 20-35 capstone)**
- [x] Layout style? **Central Hub with 6 themed archetype spokes**
- [x] Can nodes be refunded/reset? **No refunds - choices are permanent. Encourages meaningful decisions and multiple playthroughs.**

### Theme/Story
- [x] What's the setting? **Deep Earth Fantasy - abandoned dwarven civilization**
- [x] Why is the miner mining? **Discovering the secrets of the vanished dwarves**
- [x] What ARE Crystal Shards lore-wise? **Crystallized magic from the world's core**
- [x] Name for the game? **SHARDFALL**

### Technical
- [x] Platform? (Web, mobile, both) **Desktop/Web only (no mobile)**
- [x] Engine/framework? **Phaser 3.90 + TypeScript + Vite**
- [x] Save system (local, cloud)? **Local only (localStorage)**

### Tech Stack

| Component | Choice | Notes |
|-----------|--------|-------|
| **Engine** | Phaser 3.90 | Stable, excellent idle game support |
| **Language** | TypeScript | First-class Phaser support |
| **Build Tool** | Vite | Fast dev server, clean builds |
| **UI Plugin** | phaser3-rex-plugins (rexUI) | Tabs, grids, scrollers, trees |
| **Big Numbers** | break_infinity.js | For idle game math scaling |
| **Map Editor** | Tiled | For mining grid layouts |
| **Art Tool** | Aseprite | Pixel art, integrates with Phaser |
| **Save System** | localStorage | Browser-native, simple |
| **Hosting** | itch.io (planned) | Free, built-in audience, HTML5 support |

### Browser Support
- Modern browsers with WebGL: Chrome, Firefox, Safari, Edge
- No IE11 support required

---

## Reference

### Research Documents

| Document | Contents |
|----------|----------|
| [idle-mining-game-research.md](./idle-mining-game-research.md) | Core mechanics, resource management, upgrade systems, block types |
| [upgrade-systems-research.md](./upgrade-systems-research.md) | Upgrade families, scaling patterns, progression curves |
| [skill-tree-layouts-research.md](./skill-tree-layouts-research.md) | Layout options comparison, hub-and-spoke analysis |
| [ores-blocks-research.md](./ores-blocks-research.md) | Entity types, ore functions, block behaviors |
