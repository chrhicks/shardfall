# Skill Tree Layout Research

## Overview

Research on different skill tree and talent system presentations across games, with focus on what works for idle/casual games.

---

## Layout Patterns

### 1. Linear Path
```
[Node] → [Node] → [Node] → [Node]
```
**Examples:** Early Diablo, basic mobile games

**Pros:**
- Zero decision paralysis
- Easy to balance
- Mobile-friendly
- Clear progression

**Cons:**
- Boring, no replay value
- No player expression
- Predictable

---

### 2. Branching Paths (Converging)
```
        [Start]
       /   |   \
    [A]  [B]  [C]
     |    |    |
    [A2] [B2] [C2]
      \   |   /
       [Final]
```
**Examples:** Diablo 2/3/4, Borderlands, Last Epoch

**Pros:**
- Clear paths with meaningful choices
- Manageable complexity
- Satisfying progression
- Good build diversity

**Cons:**
- "Optimal" builds emerge
- Can feel restrictive

---

### 3. Central Node Radiating Outward
```
              [Node]
                |
       [Node]--[CENTER]--[Node]
              / | \
         [Node][Node][Node]
```
**Examples:** Final Fantasy X Sphere Grid, some roguelikes

**Pros:**
- High player choice
- Exploratory feel
- Non-linear progression

**Cons:**
- Can be confusing
- Harder to balance
- Respec is difficult

---

### 4. Web/Constellation (Massive)
```
    [N]---[N]       [N]---[N]
      \   /    [N]    \   /
       [N]------+------[N]
      /   \    [N]    /   \
    [N]---[N]       [N]---[N]
```
**Examples:** Path of Exile (1500+ nodes), Grim Dawn

**Pros:**
- Ultimate build diversity
- Theorycrafting depth
- Endless content for hardcore players

**Cons:**
- New player nightmare
- Requires external tools/guides
- Easy to "brick" a build
- Overwhelming visually

---

### 5. Grid-Based
```
    [N] [N] [N] [N]
    [N] [N] [N] [N]
    [N] [N] [N] [N]
```
**Examples:** Some roguelikes, tactical games

**Pros:**
- Systematic feel
- Easy to read
- Works on mobile

**Cons:**
- Less thematic
- Can feel spreadsheet-y

---

### 6. Dual-Choice List (Hades Style)
```
    Mining Speed    [A] ←→ [B]    Crit Chance
    Ore Value       [A] ←→ [B]    Drop Rate
    Auto-Mine       [A] ←→ [B]    Click Power
```
**Examples:** Hades (Mirror of Night)

**Pros:**
- Simple presentation
- Dual-mode adds replay without complexity
- Instant respec
- Excellent visual clarity

**Cons:**
- Limited total options
- Less "tree" feel
- Binary choices only

---

### 7. Class/Character-Based Separate Trees
```
    WARRIOR          MAGE           ROGUE
    [Strength]       [Magic]        [Speed]
        |               |              |
    [Defense]        [AoE]          [Crit]
        |               |              |
    [Rage]           [Mana]         [Stealth]
```
**Examples:** WoW Classic, Torchlight, Realm Grinder factions

**Pros:**
- High replay value (try each class)
- Thematic coherence
- Easy to balance in isolation

**Cons:**
- Requires multiple playthroughs
- Less flexibility mid-game

---

## Comparison Matrix

| Layout | Complexity | Player Choice | Respec | Visual Clarity | Build Diversity |
|--------|-----------|---------------|--------|----------------|-----------------|
| **Linear** | Low | Very Low | Easy | Excellent | None |
| **Branching** | Medium | Good | Medium | Good | Good |
| **Central Radial** | Medium-High | High | Hard | Fair | High |
| **Web/Constellation** | Very High | Excellent | Varies | Poor | Excellent |
| **Grid** | Medium | Medium | Easy | Good | Medium |
| **Dual-Choice List** | Low | Good | Easy | Excellent | Good |
| **Class-Based** | Medium | High | N/A | Good | High |

---

## Idle Game Examples

### Realm Grinder
- **Faction-based trees** (11 factions)
- Each faction has unique upgrade paths
- Prestige unlocks more factions
- Very high replay value

### Idle Slayer
- **Web-style** Ascension tree
- Tier list approach emerges (community identifies optimal paths)
- Reincarnation nodes are most valuable (meta-progression)

### Cookie Clicker
- **Grid/List** of Heavenly Upgrades
- Unlock based on Heavenly Chips owned
- Some have prerequisites, most don't
- Simple but effective

### Adventure Capitalist
- **Linear** Angel upgrades
- Simple % boosts
- No real choices

---

## Recommendations for Idle Mining Game

### Best Fit: **Branching + Optional Dual-Mode**

**Why Branching Works:**
1. Clear visual paths (Power/Speed/Luck)
2. Meaningful choices without overwhelm
3. Works well on mobile
4. Easy to communicate "pick a path"
5. Convergence at end provides satisfying completion

**Enhancement - Dual-Mode Nodes (Hades-style):**
```
Instead of:
    [+15% Damage]

Offer:
    [+15% Damage] ←→ [+10% Crit Chance]
    (Player picks one, can swap later)
```

This adds build variety without tree complexity.

---

## Alternative Layouts to Consider

### Option A: Current (3 Converging Paths)
```
        [Start]
       /   |   \
  [Power][Speed][Luck]
     |     |     |
    ...   ...   ...
      \    |    /
       [Converge]
          |
      [Capstone]
```
**Best for:** Clear progression, easy to understand

### Option B: Central Hub Radiating
```
            [Speed+]
               |
    [Crit]--[CENTER]--[Auto]
               |
            [Value+]
```
**Best for:** Non-linear exploration, "unlock what you want"

### Option C: Dual-Choice List (Hades)
```
    OFFENSE                          DEFENSE
    ────────────────────────────────────────
    [+20% Damage]    ←→    [+15% Crit]
    [Auto-Mine]      ←→    [+30% Speed]
    [Multi-Hit]      ←→    [Ore Value+]
```
**Best for:** Simplicity, easy respec, clear tradeoffs

### Option D: Faction/Archetype Based
```
    THE BRUTE          THE MERCHANT        THE PROSPECTOR
    (Damage focus)     (Economy focus)     (Luck focus)
    
    Pick one per prestige, unlocks that tree
```
**Best for:** Replay value, thematic runs, class fantasy

---

## Design Principles for Idle Games

1. **Readability First** - Player understands all options in <30 seconds
2. **Clear Next Goal** - Always show what's achievable next
3. **Meaningful Numbers** - 2% feels bad, 25% feels good
4. **Mix Stats and Abilities** - Not just +% damage; include new mechanics
5. **Mobile-Friendly** - Avoid complex pathing hard to tap
6. **Visible Progress** - Fill bars, node counts, completion %
7. **Allow Respec** - Casual players get frustrated by permanent choices

---

## Implementation Phases (Suggested)

| Phase | Complexity | Description |
|-------|------------|-------------|
| **1** | Simple | 3 branches, 5-7 nodes each |
| **2** | Medium | Add dual-mode choices to nodes |
| **3** | Advanced | Prestige-locked advanced tree |
| **4** | Expert | Mini-constellation for hardcore |

Start simple, validate core loop, add depth for engaged players.
