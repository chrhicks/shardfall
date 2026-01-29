// @bun
// src/tools.ts
import { tool } from "@opencode-ai/plugin";

// src/error.ts
class ContinuumError extends Error {
  code;
  suggestions;
  constructor(code, message, suggestions, options) {
    super(message, options);
    this.code = code;
    this.suggestions = suggestions;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
function isContinuumError(err) {
  return err instanceof ContinuumError;
}

// src/util.ts
import { mkdir } from "fs/promises";

// src/db.ts
import { Database } from "bun:sqlite";

// src/db.utils.ts
var ID_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";
function randomId(prefix, length = 8) {
  let out = "";
  const bytes = new Uint8Array(16);
  while (out.length < length) {
    crypto.getRandomValues(bytes);
    for (const b of bytes) {
      if (b < 252) {
        out += ID_ALPHABET[b % 36];
        if (out.length === length)
          break;
      }
    }
  }
  return `${prefix}-${out}`;
}

// inline-migration:/Users/chicks/dev/personal/continuum/src/migration.ts
var MIGRATIONS = [
  { version: 1, sql: `-- Tasks
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  intent TEXT,
  description TEXT,
  plan TEXT,
  parent_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
  blocked_by TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_parent ON tasks(parent_id);
` },
  { version: 2, sql: `-- Add execution model columns
ALTER TABLE tasks ADD COLUMN steps TEXT NOT NULL DEFAULT '[]';
ALTER TABLE tasks ADD COLUMN current_step INTEGER;
ALTER TABLE tasks ADD COLUMN discoveries TEXT NOT NULL DEFAULT '[]';
ALTER TABLE tasks ADD COLUMN decisions TEXT NOT NULL DEFAULT '[]';
ALTER TABLE tasks ADD COLUMN outcome TEXT;
` }
];
async function getMigrations() {
  return MIGRATIONS;
}

// src/db.ts
var TASK_TYPES = ["epic", "feature", "bug", "investigation", "chore"];
var TEMPLATE_TYPE_MAP = {
  epic: "epic",
  feature: "feature",
  bug: "bug",
  investigation: "investigation",
  chore: "chore"
};
var TEMPLATE_RECOMMENDATIONS = {
  epic: {
    name: "epic",
    type: "epic",
    plan_template: `Plan:
- Goals:
  - <outcomes to deliver>
- Milestones:
  - <major phases/modules>
- Dependencies:
  - <blocking work>
`
  },
  feature: {
    name: "feature",
    type: "feature",
    plan_template: `Plan:
- Changes:
  - <steps>
- Files:
  - <files or areas>
- Tests:
  - <tests to run/add>
- Risks:
  - <edge cases>
`
  },
  bug: {
    name: "bug",
    type: "bug",
    plan_template: `Plan:
- Repro:
  - <steps>
- Fix:
  - <approach>
- Tests:
  - <coverage>
- Verify:
  - <validation steps>
`
  },
  investigation: {
    name: "investigation",
    type: "investigation",
    plan_template: `Plan:
- Questions:
  - <what to answer>
- Sources:
  - <files/docs/experiments>
- Output:
  - <decision + recommendation>
`
  },
  chore: {
    name: "chore",
    type: "chore",
    plan_template: `Plan:
- Changes:
  - <steps>
- Files:
  - <files or areas>
- Tests:
  - <tests to run>
- Safety:
  - <backups/rollback>
`
  }
};
var dbFilePath = (directory) => `${directory}/.continuum/continuum.db`;
var dbCache = new Map;
function parse_json_array(value, defaultValue = []) {
  if (!value)
    return defaultValue;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : defaultValue;
  } catch {
    return defaultValue;
  }
}
function parse_blocked_by(value) {
  return parse_json_array(value).filter((item) => typeof item === "string");
}
function parse_steps(value) {
  return parse_json_array(value);
}
function parse_discoveries(value) {
  return parse_json_array(value);
}
function parse_decisions(value) {
  return parse_json_array(value);
}
function row_to_task(row) {
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    status: row.status,
    intent: row.intent,
    description: row.description,
    plan: row.plan,
    steps: parse_steps(row.steps),
    current_step: row.current_step,
    discoveries: parse_discoveries(row.discoveries),
    decisions: parse_decisions(row.decisions),
    outcome: row.outcome,
    parent_id: row.parent_id,
    blocked_by: parse_blocked_by(row.blocked_by),
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}
var TASK_COLUMNS = `id, title, type, status, intent, description, plan, steps, current_step, discoveries, decisions, outcome, parent_id, blocked_by, created_at, updated_at`;
async function get_db(directory) {
  const status = await init_status({ directory });
  if (!status.pluginDirExists) {
    throw new ContinuumError("NOT_INITIALIZED", "Continuum is not initialized in this directory", [
      "Run `continuum_init()` to initialize continuum in this directory"
    ]);
  }
  if (!status.dbFileExists) {
    throw new ContinuumError("NOT_INITIALIZED", "Continuum database file does not exist", [
      "Run `continuum_init()` to initialize continuum in this directory"
    ]);
  }
  if (dbCache.has(directory)) {
    return dbCache.get(directory);
  }
  const db = new Database(dbFilePath(directory));
  const migrations = await getMigrations();
  const currentVersion = get_db_version(db);
  const latestVersion = migrations[migrations.length - 1]?.version ?? 0;
  if (currentVersion < latestVersion) {
    for (const migration of migrations) {
      if (migration.version > currentVersion) {
        db.run(migration.sql.trim());
        set_db_version(db, migration.version);
      }
    }
  }
  dbCache.set(directory, db);
  return db;
}
function get_db_version(db) {
  try {
    const result = db.query("PRAGMA user_version").get();
    return result?.user_version ?? 0;
  } catch {
    return 0;
  }
}
function set_db_version(db, version) {
  db.run(`PRAGMA user_version = ${version}`);
}
async function init_db(directory) {
  const db = new Database(dbFilePath(directory));
  const migrations = await getMigrations();
  const initialMigration = migrations[0];
  if (initialMigration) {
    db.run(initialMigration.sql.trim());
    set_db_version(db, initialMigration.version);
  }
  db.close();
}
function is_valid_task_type(type) {
  return TASK_TYPES.includes(type);
}
function resolve_template_type(template) {
  if (!template)
    return null;
  return TEMPLATE_TYPE_MAP[template] ?? null;
}
function list_template_recommendations() {
  return Object.values(TEMPLATE_RECOMMENDATIONS);
}
function validate_task_input(input) {
  const missing = [];
  if (!input.title?.trim())
    missing.push("title");
  switch (input.type) {
    case "epic":
      if (!input.intent?.trim())
        missing.push("intent");
      if (!input.description?.trim())
        missing.push("description");
      break;
    case "feature":
    case "bug":
      if (!input.intent?.trim())
        missing.push("intent");
      if (!input.description?.trim())
        missing.push("description");
      if (!input.plan?.trim())
        missing.push("plan");
      break;
    case "investigation":
    case "chore":
      if (!input.description?.trim())
        missing.push("description");
      if (!input.plan?.trim())
        missing.push("plan");
      break;
  }
  return missing;
}
function validate_status_transition(task, nextStatus) {
  const missing = [];
  if (nextStatus === "in_progress") {
    if (["feature", "bug", "investigation", "chore"].includes(task.type)) {
      if (!task.plan?.trim())
        missing.push("plan");
    }
  }
  if (nextStatus === "completed") {
    if (!task.description?.trim())
      missing.push("description");
    if (["feature", "bug", "investigation", "chore"].includes(task.type)) {
      if (!task.plan?.trim())
        missing.push("plan");
    }
  }
  return missing;
}
async function has_open_blockers(db, task) {
  if (task.blocked_by.length === 0)
    return [];
  const placeholders = task.blocked_by.map(() => "?").join(", ");
  const rows = db.query(`SELECT id, status FROM tasks WHERE id IN (${placeholders}) AND status != 'deleted'`).all(...task.blocked_by);
  const open = new Set(["open", "in_progress"]);
  return rows.filter((row) => open.has(row.status)).map((row) => row.id);
}
async function task_exists(db, task_id) {
  const row = db.query(`SELECT COUNT(1) AS count FROM tasks WHERE id = ? AND status != 'deleted'`).get(task_id);
  return (row?.count ?? 0) > 0;
}
function validate_blocker_list(task_id, blockers) {
  if (blockers.length === 0)
    return;
  const seen = new Set;
  for (const blocker of blockers) {
    if (blocker === task_id) {
      throw new ContinuumError("INVALID_BLOCKER", "Task cannot block itself", [
        "Remove the task id from blocked_by."
      ]);
    }
    if (seen.has(blocker)) {
      throw new ContinuumError("DUPLICATE_BLOCKERS", "blocked_by contains duplicate task ids", [
        "Remove duplicate ids from blocked_by."
      ]);
    }
    seen.add(blocker);
  }
}
async function validate_blockers(db, blockers) {
  if (blockers.length === 0)
    return [];
  const unique = Array.from(new Set(blockers));
  const placeholders = unique.map(() => "?").join(", ");
  const rows = db.query(`SELECT id FROM tasks WHERE id IN (${placeholders}) AND status != 'deleted'`).all(...unique);
  const found = new Set(rows.map((row) => row.id));
  return unique.filter((id) => !found.has(id));
}
async function create_task(db, input) {
  const id = randomId("tkt");
  const created_at = new Date().toISOString();
  const updated_at = created_at;
  const blocked_by = input.blocked_by ?? [];
  validate_blocker_list(id, blocked_by);
  if (input.parent_id) {
    const parentExists = await task_exists(db, input.parent_id);
    if (!parentExists) {
      throw new ContinuumError("PARENT_NOT_FOUND", "Parent task not found", [
        "Verify parent_id and try again."
      ]);
    }
  }
  const missingBlockers = await validate_blockers(db, blocked_by);
  if (missingBlockers.length > 0) {
    throw new ContinuumError("BLOCKER_NOT_FOUND", `Blocking tasks not found: ${missingBlockers.join(", ")}`, [
      `Missing blocked_by IDs: ${missingBlockers.join(", ")}`
    ]);
  }
  const result = db.run(`INSERT INTO tasks (id, title, type, status, intent, description, plan, parent_id, blocked_by, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
    id,
    input.title,
    input.type,
    input.status ?? "open",
    input.intent ?? null,
    input.description ?? null,
    input.plan ?? null,
    input.parent_id ?? null,
    JSON.stringify(blocked_by),
    created_at,
    updated_at
  ]);
  if (result.changes === 0) {
    throw new ContinuumError("TASK_CREATE_FAILED", "Failed to create task");
  }
  const row = db.query(`SELECT ${TASK_COLUMNS} FROM tasks WHERE id = ?`).get(id);
  if (!row) {
    throw new ContinuumError("TASK_NOT_FOUND", "Task not found after create");
  }
  return row_to_task(row);
}
async function update_task(db, task_id, input) {
  const updates = [];
  const params = [];
  if (input.parent_id !== undefined) {
    if (input.parent_id) {
      const parentExists = await task_exists(db, input.parent_id);
      if (!parentExists) {
        throw new ContinuumError("PARENT_NOT_FOUND", "Parent task not found", [
          "Verify parent_id and try again."
        ]);
      }
    }
  }
  if (input.blocked_by !== undefined) {
    validate_blocker_list(task_id, input.blocked_by ?? []);
    const missingBlockers = await validate_blockers(db, input.blocked_by ?? []);
    if (missingBlockers.length > 0) {
      throw new ContinuumError("BLOCKER_NOT_FOUND", `Blocking tasks not found: ${missingBlockers.join(", ")}`, [
        `Missing blocked_by IDs: ${missingBlockers.join(", ")}`
      ]);
    }
  }
  if (input.title !== undefined) {
    updates.push("title = ?");
    params.push(input.title);
  }
  if (input.type !== undefined) {
    updates.push("type = ?");
    params.push(input.type);
  }
  if (input.status !== undefined) {
    updates.push("status = ?");
    params.push(input.status);
  }
  if (input.intent !== undefined) {
    updates.push("intent = ?");
    params.push(input.intent);
  }
  if (input.description !== undefined) {
    updates.push("description = ?");
    params.push(input.description);
  }
  if (input.plan !== undefined) {
    updates.push("plan = ?");
    params.push(input.plan);
  }
  if (input.parent_id !== undefined) {
    updates.push("parent_id = ?");
    params.push(input.parent_id);
  }
  if (input.blocked_by !== undefined) {
    updates.push("blocked_by = ?");
    params.push(JSON.stringify(input.blocked_by ?? []));
  }
  if (updates.length === 0) {
    throw new ContinuumError("NO_CHANGES_MADE", "No fields to update");
  }
  updates.push("updated_at = ?");
  params.push(new Date().toISOString());
  params.push(task_id);
  const result = db.run(`UPDATE tasks SET ${updates.join(", ")} WHERE id = ?`, params);
  if (result.changes === 0) {
    throw new ContinuumError("TASK_UPDATE_FAILED", "Failed to update task");
  }
  const row = db.query(`SELECT ${TASK_COLUMNS} FROM tasks WHERE id = ?`).get(task_id);
  if (!row) {
    throw new ContinuumError("TASK_NOT_FOUND", "Task not found after update");
  }
  return row_to_task(row);
}
async function get_task(db, task_id) {
  const row = db.query(`SELECT ${TASK_COLUMNS} FROM tasks WHERE id = ?`).get(task_id);
  return row ? row_to_task(row) : null;
}
async function list_tasks(db, filters = {}) {
  const where = ["status != ?"];
  const params = ["deleted"];
  if (filters.status) {
    where.push("status = ?");
    params.push(filters.status);
  }
  if (filters.parent_id !== undefined) {
    if (filters.parent_id === null) {
      where.push("parent_id IS NULL");
    } else {
      where.push("parent_id = ?");
      params.push(filters.parent_id);
    }
  }
  const sql = `
    SELECT ${TASK_COLUMNS}
    FROM tasks
    WHERE ${where.join(" AND ")}
    ORDER BY created_at ASC
  `;
  const rows = db.query(sql).all(...params);
  return rows.map(row_to_task);
}
async function list_tasks_by_statuses(db, filters) {
  const where = ["status != ?"];
  const params = ["deleted"];
  if (filters.statuses.length > 0) {
    const placeholders = filters.statuses.map(() => "?").join(", ");
    where.push(`status IN (${placeholders})`);
    params.push(...filters.statuses);
  }
  if (filters.parent_id !== undefined) {
    if (filters.parent_id === null) {
      where.push("parent_id IS NULL");
    } else {
      where.push("parent_id = ?");
      params.push(filters.parent_id);
    }
  }
  const sql = `
    SELECT ${TASK_COLUMNS}
    FROM tasks
    WHERE ${where.join(" AND ")}
    ORDER BY created_at ASC
  `;
  const rows = db.query(sql).all(...params);
  return rows.map(row_to_task);
}
async function add_steps(db, input) {
  const task = await get_task(db, input.task_id);
  if (!task) {
    throw new ContinuumError("TASK_NOT_FOUND", "Task not found");
  }
  const existingSteps = task.steps;
  const maxId = existingSteps.reduce((max, s) => Math.max(max, s.id), 0);
  const newSteps = input.steps.map((s, i) => ({
    id: maxId + i + 1,
    title: s.title,
    summary: s.summary,
    details: s.details,
    status: "pending",
    notes: null
  }));
  const allSteps = [...existingSteps, ...newSteps];
  let currentStep = task.current_step;
  if (currentStep === null && allSteps.length > 0) {
    const firstPending = allSteps.find((s) => s.status === "pending");
    currentStep = firstPending?.id ?? null;
  }
  const result = db.run(`UPDATE tasks SET steps = ?, current_step = ?, updated_at = ? WHERE id = ?`, [JSON.stringify(allSteps), currentStep, new Date().toISOString(), input.task_id]);
  if (result.changes === 0) {
    throw new ContinuumError("TASK_UPDATE_FAILED", "Failed to add steps");
  }
  return await get_task(db, input.task_id);
}
async function complete_step(db, input) {
  const task = await get_task(db, input.task_id);
  if (!task) {
    throw new ContinuumError("TASK_NOT_FOUND", "Task not found");
  }
  const stepId = input.step_id ?? task.current_step;
  if (stepId === null) {
    throw new ContinuumError("ITEM_NOT_FOUND", "No step to complete (no current_step set)", [
      "Add steps first using step_add, or specify step_id explicitly"
    ]);
  }
  const stepIndex = task.steps.findIndex((s) => s.id === stepId);
  if (stepIndex === -1) {
    throw new ContinuumError("ITEM_NOT_FOUND", `Step ${stepId} not found`);
  }
  const existingStep = task.steps[stepIndex];
  const updatedSteps = [...task.steps];
  updatedSteps[stepIndex] = {
    id: existingStep.id,
    title: existingStep.title,
    summary: existingStep.summary,
    details: existingStep.details,
    status: "completed",
    notes: input.notes ?? existingStep.notes
  };
  let nextStep = null;
  for (const step of updatedSteps) {
    if (step.status === "pending") {
      nextStep = step.id;
      break;
    }
  }
  const result = db.run(`UPDATE tasks SET steps = ?, current_step = ?, updated_at = ? WHERE id = ?`, [JSON.stringify(updatedSteps), nextStep, new Date().toISOString(), input.task_id]);
  if (result.changes === 0) {
    throw new ContinuumError("TASK_UPDATE_FAILED", "Failed to complete step");
  }
  return await get_task(db, input.task_id);
}
async function update_step(db, input) {
  const task = await get_task(db, input.task_id);
  if (!task) {
    throw new ContinuumError("TASK_NOT_FOUND", "Task not found");
  }
  const stepIndex = task.steps.findIndex((s) => s.id === input.step_id);
  if (stepIndex === -1) {
    throw new ContinuumError("ITEM_NOT_FOUND", `Step ${input.step_id} not found`);
  }
  const existingStep = task.steps[stepIndex];
  const updatedSteps = [...task.steps];
  updatedSteps[stepIndex] = {
    id: existingStep.id,
    title: input.title ?? existingStep.title,
    summary: input.summary ?? existingStep.summary,
    details: input.details ?? existingStep.details,
    status: input.status ?? existingStep.status,
    notes: input.notes !== undefined ? input.notes : existingStep.notes
  };
  const result = db.run(`UPDATE tasks SET steps = ?, updated_at = ? WHERE id = ?`, [JSON.stringify(updatedSteps), new Date().toISOString(), input.task_id]);
  if (result.changes === 0) {
    throw new ContinuumError("TASK_UPDATE_FAILED", "Failed to update step");
  }
  return await get_task(db, input.task_id);
}
async function add_discovery(db, input) {
  const task = await get_task(db, input.task_id);
  if (!task) {
    throw new ContinuumError("TASK_NOT_FOUND", "Task not found");
  }
  const maxId = task.discoveries.reduce((max, d) => Math.max(max, d.id), 0);
  const discovery = {
    id: maxId + 1,
    content: input.content,
    created_at: new Date().toISOString()
  };
  const discoveries = [...task.discoveries, discovery];
  const result = db.run(`UPDATE tasks SET discoveries = ?, updated_at = ? WHERE id = ?`, [JSON.stringify(discoveries), new Date().toISOString(), input.task_id]);
  if (result.changes === 0) {
    throw new ContinuumError("TASK_UPDATE_FAILED", "Failed to add discovery");
  }
  return await get_task(db, input.task_id);
}
async function add_decision(db, input) {
  const task = await get_task(db, input.task_id);
  if (!task) {
    throw new ContinuumError("TASK_NOT_FOUND", "Task not found");
  }
  const maxId = task.decisions.reduce((max, d) => Math.max(max, d.id), 0);
  const decision = {
    id: maxId + 1,
    content: input.content,
    rationale: input.rationale ?? null,
    created_at: new Date().toISOString()
  };
  const decisions = [...task.decisions, decision];
  const result = db.run(`UPDATE tasks SET decisions = ?, updated_at = ? WHERE id = ?`, [JSON.stringify(decisions), new Date().toISOString(), input.task_id]);
  if (result.changes === 0) {
    throw new ContinuumError("TASK_UPDATE_FAILED", "Failed to add decision");
  }
  return await get_task(db, input.task_id);
}
async function complete_task(db, input) {
  const task = await get_task(db, input.task_id);
  if (!task) {
    throw new ContinuumError("TASK_NOT_FOUND", "Task not found");
  }
  const openBlockers = await has_open_blockers(db, task);
  if (openBlockers.length > 0) {
    throw new ContinuumError("HAS_BLOCKERS", `Task has unresolved blockers: ${openBlockers.join(", ")}`, [
      `Complete blockers first: ${openBlockers.join(", ")}`
    ]);
  }
  const result = db.run(`UPDATE tasks SET status = 'completed', outcome = ?, updated_at = ? WHERE id = ?`, [input.outcome, new Date().toISOString(), input.task_id]);
  if (result.changes === 0) {
    throw new ContinuumError("TASK_UPDATE_FAILED", "Failed to complete task");
  }
  return await get_task(db, input.task_id);
}

// src/util.ts
async function dir_exists(directory) {
  try {
    const stat = await Bun.file(`${directory}`).stat();
    return stat.isDirectory();
  } catch {
    return false;
  }
}
async function init_status({ directory }) {
  const pluginDirExists = await dir_exists(`${directory}/.continuum`);
  const dbFile = Bun.file(`${directory}/.continuum/continuum.db`);
  const dbFileExists = await dbFile.exists();
  return {
    pluginDirExists,
    dbFileExists
  };
}
async function init_project({ directory }) {
  const { pluginDirExists, dbFileExists } = await init_status({ directory });
  if (!pluginDirExists) {
    await mkdir(`${directory}/.continuum`, { recursive: true });
  }
  if (!dbFileExists) {
    await init_db(directory);
  }
}

// inline-static:/Users/chicks/dev/personal/continuum/src/static-content.ts
var STATIC = {
  continuum_init_guide: `## Core Workflow

### 1. Plan

Create a task with intent (why), description (what), and plan (how):

\`\`\`
continuum_task_create({
  title: "Add dark mode",
  template: "feature",
  intent: "Users have requested dark mode to reduce eye strain during night usage. This is a top-requested accessibility feature.",
  description: "Add a theme toggle to the settings page that switches between light and dark modes, persisting the preference across sessions.",
  plan: "Use CSS custom properties for theming (avoids runtime style recalculation). Store preference in localStorage. Steps: 1) Define color tokens as CSS vars, 2) Create ThemeContext with toggle, 3) Add toggle UI to settings, 4) Wire up localStorage persistence"
})
\`\`\`

### 2. Break Down

Add execution steps derived from your plan. Each step should have:
- **title**: Short step name
- **summary**: 1-2 sentence description of what this step accomplishes
- **details**: Full specification with files, functions, APIs, specific values \u2014 enough detail for any agent to execute blindly

\`\`\`
continuum_step_add({
  task_id: "tkt_xxx",
  steps: [
    {
      title: "Define CSS custom properties",
      summary: "Create theme tokens as CSS variables with light/dark selectors.",
      details: "Create src/styles/theme.css with :root selector for light theme defaults and [data-theme='dark'] selector for dark overrides. Define tokens: --color-bg (#ffffff / #1a1a1a), --color-text (#111111 / #f0f0f0), --color-primary (#0066cc / #66b3ff), --color-border (#dddddd / #333333). Import this file in the app entry point."
    },
    {
      title: "Create ThemeContext",
      summary: "Build context provider and hook for theme state management.",
      details: "Create src/context/ThemeContext.tsx. Export ThemeProvider component and useTheme hook. State holds 'light' | 'dark'. Provide toggle() function that switches theme and updates document.documentElement.dataset.theme. Initialize from localStorage on mount, default to 'light'."
    },
    {
      title: "Add ThemeToggle component",
      summary: "Build the UI toggle for the settings page.",
      details: "Create src/components/settings/ThemeToggle.tsx. Render a switch or button that displays current theme. On click, call useTheme().toggle(). Show sun/moon icon based on current state. Add to existing SettingsPage component in the Appearance section."
    },
    {
      title: "Wire up localStorage persistence",
      summary: "Persist theme preference across browser sessions.",
      details: "In ThemeContext, read localStorage key 'user-theme-preference' on mount (default 'light' if missing). On every theme change, write to the same key. Ensure hydration doesn't cause flash \u2014 apply theme before first render."
    }
  ]
})
\`\`\`

### 3. Execute

Work through steps one at a time. Complete each step with notes on what actually happened:

\`\`\`
continuum_step_complete({
  task_id: "tkt_xxx",
  notes: "Switched from React Context to Zustand for state management. Context required too much boilerplate for a simple toggle. Created src/store/theme.ts with useThemeStore hook. Toggle and persistence working as specified."
})
\`\`\`

**Record discoveries and decisions as you go** \u2014 this is critical for session resumption:

\`\`\`
continuum_task_discover({
  task_id: "tkt_xxx",
  content: "The third-party date picker (react-datepicker v4.8) doesn't support CSS custom properties \u2014 it uses inline styles that override CSS variables. Tested by setting --color-bg on .react-datepicker wrapper, no effect. GitHub issue #3421 confirms this is a known limitation with no fix planned."
})

continuum_task_decide({
  task_id: "tkt_xxx",
  content: "Use inline styles to theme the date picker instead of CSS variables",
  rationale: "Only one component needs this workaround. Alternatives considered: (1) fork the library \u2014 too much maintenance burden, (2) use a different date picker \u2014 would require reworking existing date logic, (3) leave it unthemed \u2014 breaks the dark mode experience. Inline styles are the smallest scoped fix."
})
\`\`\`

#### What to Record

**Discoveries** \u2014 things you learned that weren't obvious from the plan:
- Unexpected API behavior or limitations (with specific error messages, version numbers)
- Missing dependencies or version conflicts
- Existing code patterns you need to follow
- Edge cases you encountered
- Links to relevant docs, issues, or discussions

**Decisions** \u2014 choices you made during implementation:
- What you decided and why
- What alternatives you considered and rejected
- Trade-offs you accepted
- Deviations from the original plan
- Workarounds for blockers

Even small decisions matter. A future session (or different agent) will lack your context \u2014 recordings bridge that gap.

### 4. Complete

When all steps are done, complete the task with an outcome summary that captures what shipped, how it differed from the plan, and key learnings:

\`\`\`
continuum_task_complete({
  task_id: "tkt_xxx",
  outcome: "Dark mode shipped and working. Deviated from plan: used Zustand instead of React Context for simpler API (fewer files, no provider nesting). Key discovery: react-datepicker doesn't support CSS variables, required inline style workaround \u2014 future theming work should audit third-party components first. All four steps completed, localStorage persistence verified across browser restart."
})
\`\`\`

## Resuming Work

When starting a session, check for active tasks:

\`\`\`
continuum_query({ query: "active_tasks" })
\`\`\`

Then fetch the task to see current state:

\`\`\`
continuum_task_get({ task_id: "tkt_xxx" })
\`\`\`

Example response:

\`\`\`json
{
  "id": "tkt_abc123",
  "title": "Add dark mode",
  "status": "in_progress",
  "intent": "Users have requested dark mode to reduce eye strain during night usage. This is a top-requested accessibility feature.",
  "description": "Add a theme toggle to the settings page that switches between light and dark modes, persisting the preference across sessions.",
  "plan": "Use CSS custom properties for theming (avoids runtime style recalculation). Store preference in localStorage. Steps: 1) Define color tokens as CSS vars, 2) Create ThemeContext with toggle, 3) Add toggle UI to settings, 4) Wire up localStorage persistence",
  "current_step": 3,
  "steps": [
    {
      "id": 1,
      "title": "Define CSS custom properties",
      "summary": "Create theme tokens as CSS variables with light/dark selectors.",
      "details": "Create src/styles/theme.css with :root selector for light theme...",
      "status": "completed",
      "notes": "Done as specified, added --color-accent as well."
    },
    {
      "id": 2,
      "title": "Create ThemeContext",
      "summary": "Build context provider and hook for theme state management.",
      "details": "Create src/context/ThemeContext.tsx...",
      "status": "completed",
      "notes": "Switched to Zustand instead of Context for simpler API."
    },
    {
      "id": 3,
      "title": "Add ThemeToggle component",
      "summary": "Build the UI toggle for the settings page.",
      "details": "Create src/components/settings/ThemeToggle.tsx...",
      "status": "in_progress",
      "notes": null
    },
    {
      "id": 4,
      "title": "Wire up localStorage persistence",
      "summary": "Persist theme preference across browser sessions.",
      "details": "In ThemeContext, read localStorage key 'user-theme-preference'...",
      "status": "pending",
      "notes": null
    }
  ],
  "discoveries": [
    {
      "id": 1,
      "content": "The third-party date picker (react-datepicker v4.8) doesn't support CSS custom properties...",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "decisions": [
    {
      "id": 1,
      "content": "Use inline styles to theme the date picker instead of CSS variables",
      "rationale": "Only one component needs this workaround...",
      "created_at": "2024-01-15T10:35:00Z"
    }
  ]
}
\`\`\`

**Before continuing, review:**

1. Read the \`plan\` to understand the overall approach
2. Check \`discoveries\` for things learned that may affect remaining work
3. Check \`decisions\` for choices already made (don't re-litigate)
4. Look at \`current_step\` and its \`details\` to see exactly what to do next
5. Review completed steps' \`notes\` for any context that carries forward

## Tools Reference

| Tool | Purpose |
|------|---------|
| \`continuum_init\` | Initialize database (required before other tools) |
| \`continuum_task_create\` | Create a task with intent, description, and plan |
| \`continuum_task_get\` | Fetch task with full context, steps, discoveries, decisions |
| \`continuum_task_update\` | Update task fields (title, description, plan, status, etc.) |
| \`continuum_step_add\` | Add execution steps with title, summary, and details |
| \`continuum_step_complete\` | Mark step done with notes, auto-advance to next |
| \`continuum_step_update\` | Modify step title, summary, details, status, or notes |
| \`continuum_task_discover\` | Record a discovery with full context and evidence |
| \`continuum_task_decide\` | Record a decision with rationale and alternatives considered |
| \`continuum_task_complete\` | Finalize with outcome: result, deviations, learnings |
| \`continuum_task_delete\` | Soft delete a task |
| \`continuum_query\` | List/filter tasks (tasks, active_tasks, children_of, etc.) |

## Key Principles

1. **Detail enables resumption** \u2014 A future session (or different agent) has no memory of your context. The quality of what you record directly determines how effectively work can continue. Be thorough.

2. **Steps are executable specs** \u2014 Each step should have enough detail that any agent could execute it without guessing. Title, summary, and details \u2014 if the details are vague, the step isn't ready.

3. **Record as you go, not after** \u2014 Capture discoveries and decisions in the moment. If you wait until the end, you'll forget the nuance, the alternatives you rejected, the evidence you found.

4. **Plan first, then steps** \u2014 Establish the approach before breaking it into steps. The plan captures key decisions and the overall strategy; steps are the tactical execution.

5. **Outcome vs plan matters** \u2014 When completing a task, explicitly note what differed from the plan. This is where learning happens \u2014 the delta between intent and reality.

6. **One step at a time** \u2014 Complete the current step before moving to the next. This keeps execution focused and ensures notes are captured while context is fresh.
`
};

// src/tools.ts
var TASK_NOT_FOUND_SUGGESTIONS = [
  'Use continuum_query({ query: "tasks" }) to list valid task_ids.',
  "If you only have a title, list tasks and match by title."
];
function continuum_success(data) {
  return { success: true, data };
}
function continuum_error(error) {
  return { success: false, error };
}
function with_continuum_error_handling(fn) {
  return fn().then((data) => JSON.stringify(data)).catch((err) => {
    if (isContinuumError(err)) {
      return JSON.stringify(continuum_error({ code: err.code, message: err.message, suggestions: err.suggestions }));
    }
    const error = err;
    return JSON.stringify(continuum_error({ code: "UNKNOWN_ERROR", message: error.message }));
  });
}
function recommendations_for_template(template) {
  return { plan_template: TEMPLATE_RECOMMENDATIONS[template].plan_template };
}
function merge_recommendations(template, missing) {
  if (!template && (!missing || missing.length === 0))
    return;
  return {
    ...template ? recommendations_for_template(template) : {},
    ...missing && missing.length > 0 ? { missing_fields: missing } : {}
  };
}
function continuum_init({ directory }) {
  return tool({
    description: "Initialize the continuum database.",
    args: {},
    async execute() {
      return with_continuum_error_handling(async () => {
        await init_project({ directory });
        return continuum_success({
          initialized: true,
          path: `${directory}/.continuum/continuum.db`,
          guide_markdown: STATIC.continuum_init_guide
        });
      });
    }
  });
}
function continuum_task_create({ directory }) {
  return tool({
    description: "Create a task (supports templates for discovery).",
    args: {
      title: tool.schema.string().min(1).describe("Short task label."),
      type: tool.schema.enum(["epic", "feature", "bug", "investigation", "chore"]).optional().describe("Task type."),
      template: tool.schema.enum(["epic", "feature", "bug", "investigation", "chore"]).optional().describe("Template name for guided creation."),
      intent: tool.schema.string().optional().describe("Why this task exists."),
      description: tool.schema.string().optional().describe("What the task does."),
      plan: tool.schema.string().optional().describe("How to implement."),
      parent_id: tool.schema.string().optional().describe("Parent task ID."),
      blocked_by: tool.schema.array(tool.schema.string()).optional().describe("Blocking task IDs."),
      status: tool.schema.enum(["open", "in_progress", "completed", "cancelled"]).optional().describe("Initial status.")
    },
    async execute(args) {
      return with_continuum_error_handling(async () => {
        const db = await get_db(directory);
        const templateType = resolve_template_type(args.template);
        if (args.template && !templateType) {
          throw new ContinuumError("INVALID_TEMPLATE", "Template not recognized");
        }
        const type = args.type ?? templateType;
        if (!type) {
          throw new ContinuumError("INVALID_TYPE", "Task type is required when no template is provided");
        }
        if (!is_valid_task_type(type)) {
          throw new ContinuumError("INVALID_TYPE", "Task type not recognized");
        }
        if (args.type && templateType && args.type !== templateType) {
          throw new ContinuumError("INVALID_TEMPLATE", "Template does not match provided type");
        }
        const input = {
          title: args.title,
          type,
          status: args.status,
          intent: args.intent ?? null,
          description: args.description ?? null,
          plan: args.plan ?? null,
          parent_id: args.parent_id ?? null,
          blocked_by: args.blocked_by ?? []
        };
        const task = await create_task(db, input);
        const missing = validate_task_input({ ...input, title: args.title });
        const recommendations = merge_recommendations(args.template, missing);
        return continuum_success({ task, recommendations });
      });
    }
  });
}
function continuum_task_get({ directory }) {
  return tool({
    description: "Fetch a task by ID.",
    args: {
      task_id: tool.schema.string().describe("Task ID.")
    },
    async execute(args) {
      return with_continuum_error_handling(async () => {
        const db = await get_db(directory);
        const task = await get_task(db, args.task_id);
        if (!task) {
          throw new ContinuumError("TASK_NOT_FOUND", "Task not found", TASK_NOT_FOUND_SUGGESTIONS);
        }
        const parent = task.parent_id ? await get_task(db, task.parent_id) : null;
        const children = await list_tasks(db, { parent_id: task.id });
        const blockers = task.blocked_by.length > 0 ? await Promise.all(task.blocked_by.map((id) => get_task(db, id))) : [];
        const uniqueBlocking = new Map;
        for (const item of blockers) {
          if (!item)
            continue;
          if (!uniqueBlocking.has(item.id)) {
            uniqueBlocking.set(item.id, item);
          }
        }
        return continuum_success({
          task,
          parent,
          children,
          blocking: Array.from(uniqueBlocking.values())
        });
      });
    }
  });
}
function continuum_task_update({ directory }) {
  return tool({
    description: "Update a task.",
    args: {
      task_id: tool.schema.string().describe("Task ID."),
      title: tool.schema.string().optional().describe("Updated title."),
      type: tool.schema.enum(["epic", "feature", "bug", "investigation", "chore"]).optional().describe("Updated type."),
      intent: tool.schema.string().optional().describe("Updated intent."),
      description: tool.schema.string().optional().describe("Updated description."),
      plan: tool.schema.string().optional().describe("Updated plan."),
      parent_id: tool.schema.string().nullable().optional().describe("Updated parent ID."),
      blocked_by: tool.schema.array(tool.schema.string()).optional().describe("Updated blocking IDs."),
      status: tool.schema.enum(["open", "in_progress", "completed", "cancelled"]).optional().describe("Updated status.")
    },
    async execute(args) {
      return with_continuum_error_handling(async () => {
        const db = await get_db(directory);
        const task = await get_task(db, args.task_id);
        if (!task) {
          throw new ContinuumError("TASK_NOT_FOUND", "Task not found", TASK_NOT_FOUND_SUGGESTIONS);
        }
        if (args.status) {
          const candidate = {
            ...task,
            title: args.title ?? task.title,
            type: args.type ?? task.type,
            status: args.status,
            intent: args.intent ?? task.intent,
            description: args.description ?? task.description,
            plan: args.plan ?? task.plan,
            parent_id: args.parent_id ?? task.parent_id,
            blocked_by: args.blocked_by ?? task.blocked_by
          };
          if (args.status === "completed") {
            const openBlockers = await has_open_blockers(db, candidate);
            if (openBlockers.length > 0) {
              throw new ContinuumError("HAS_BLOCKERS", `Task has unresolved blockers: ${openBlockers.join(", ")}`, [
                `Complete blockers first: ${openBlockers.join(", ")}`
              ]);
            }
          }
          const missingStatus = validate_status_transition(candidate, args.status);
          if (missingStatus.length > 0) {
            return continuum_success({
              task,
              recommendations: { missing_fields: missingStatus, plan_template: TEMPLATE_RECOMMENDATIONS[candidate.type].plan_template }
            });
          }
        }
        const updatedTask = await update_task(db, args.task_id, {
          title: args.title,
          type: args.type,
          status: args.status,
          intent: args.intent,
          description: args.description,
          plan: args.plan,
          parent_id: args.parent_id ?? undefined,
          blocked_by: args.blocked_by
        });
        const missing = validate_task_input({
          title: updatedTask.title,
          type: updatedTask.type,
          status: updatedTask.status === "deleted" ? undefined : updatedTask.status,
          intent: updatedTask.intent,
          description: updatedTask.description,
          plan: updatedTask.plan,
          parent_id: updatedTask.parent_id,
          blocked_by: updatedTask.blocked_by
        });
        const recommendations = merge_recommendations(undefined, missing);
        return continuum_success({ task: updatedTask, recommendations });
      });
    }
  });
}
function continuum_task_delete({ directory }) {
  return tool({
    description: "Soft delete a task.",
    args: {
      task_id: tool.schema.string().describe("Task ID.")
    },
    async execute(args) {
      return with_continuum_error_handling(async () => {
        const db = await get_db(directory);
        const task = await get_task(db, args.task_id);
        if (!task) {
          throw new ContinuumError("TASK_NOT_FOUND", "Task not found", TASK_NOT_FOUND_SUGGESTIONS);
        }
        if (task.status === "deleted") {
          return continuum_success({ deleted: true });
        }
        const deleted = await update_task(db, args.task_id, { status: "deleted" });
        return continuum_success({ deleted: Boolean(deleted) });
      });
    }
  });
}
function continuum_query({ directory }) {
  return tool({
    description: "List and graph queries for tasks.",
    args: {
      query: tool.schema.enum(["tasks", "active_tasks", "children_of", "descendants_of", "ancestors_of", "templates"]).describe("Named query to run."),
      params: tool.schema.object({
        status: tool.schema.enum(["open", "in_progress", "completed", "cancelled"]).optional(),
        parent_id: tool.schema.string().nullable().optional(),
        task_id: tool.schema.string().optional()
      }).optional()
    },
    async execute(args) {
      return with_continuum_error_handling(async () => {
        const db = await get_db(directory);
        const params = args.params ?? {};
        switch (args.query) {
          case "tasks": {
            const tasks = await list_tasks(db, {
              status: params.status,
              parent_id: params.parent_id
            });
            return continuum_success({ tasks });
          }
          case "active_tasks": {
            const tasks = await list_tasks_by_statuses(db, {
              statuses: ["open", "in_progress"],
              parent_id: params.parent_id
            });
            return continuum_success({ tasks });
          }
          case "children_of": {
            if (!params.task_id) {
              throw new ContinuumError("TASK_NOT_FOUND", "task_id is required", TASK_NOT_FOUND_SUGGESTIONS);
            }
            const tasks = await list_tasks(db, { parent_id: params.task_id });
            return continuum_success({ tasks });
          }
          case "descendants_of": {
            if (!params.task_id) {
              throw new ContinuumError("TASK_NOT_FOUND", "task_id is required", TASK_NOT_FOUND_SUGGESTIONS);
            }
            const tasks = await list_tasks(db);
            const descendants = collect_descendants(tasks, params.task_id);
            return continuum_success({ task_ids: descendants });
          }
          case "ancestors_of": {
            if (!params.task_id) {
              throw new ContinuumError("TASK_NOT_FOUND", "task_id is required", TASK_NOT_FOUND_SUGGESTIONS);
            }
            const tasks = await list_tasks(db);
            const ancestors = collect_ancestors(tasks, params.task_id);
            return continuum_success({ task_ids: ancestors });
          }
          case "templates": {
            return continuum_success({ templates: list_template_recommendations() });
          }
        }
      });
    }
  });
}
function collect_descendants(tasks, parent_id) {
  const byParent = new Map;
  for (const task of tasks) {
    if (!task.parent_id)
      continue;
    const list = byParent.get(task.parent_id) ?? [];
    list.push(task);
    byParent.set(task.parent_id, list);
  }
  const result = [];
  const queue = [...byParent.get(parent_id) ?? []];
  while (queue.length > 0) {
    const current = queue.shift();
    result.push(current.id);
    const children = byParent.get(current.id);
    if (children)
      queue.push(...children);
  }
  return result;
}
function collect_ancestors(tasks, task_id) {
  const byId = new Map(tasks.map((task) => [task.id, task]));
  const result = [];
  let current = byId.get(task_id);
  while (current?.parent_id) {
    result.push(current.parent_id);
    current = byId.get(current.parent_id);
  }
  return result;
}
function continuum_step_add({ directory }) {
  return tool({
    description: "Add execution steps to a task. Steps define the tactical actions to complete the task.",
    args: {
      task_id: tool.schema.string().describe("Task ID."),
      steps: tool.schema.array(tool.schema.object({
        title: tool.schema.string().optional().describe('Short step name (e.g., "Create ThemeContext").'),
        summary: tool.schema.string().optional().describe("1-2 sentence description of what this step accomplishes."),
        details: tool.schema.string().optional().describe("Full specification: files, functions, APIs, specific values. Enough detail for any agent to execute blindly.")
      })).describe("Steps to add.")
    },
    async execute(args) {
      return with_continuum_error_handling(async () => {
        const db = await get_db(directory);
        const task = await add_steps(db, {
          task_id: args.task_id,
          steps: args.steps
        });
        return continuum_success({ task });
      });
    }
  });
}
function continuum_step_complete({ directory }) {
  return tool({
    description: "Mark a step as completed. If step_id is not provided, completes the current_step. Auto-advances to the next pending step.",
    args: {
      task_id: tool.schema.string().describe("Task ID."),
      step_id: tool.schema.number().optional().describe("Step ID to complete. Defaults to current_step."),
      notes: tool.schema.string().optional().describe("Notes about how the step was completed.")
    },
    async execute(args) {
      return with_continuum_error_handling(async () => {
        const db = await get_db(directory);
        const task = await complete_step(db, {
          task_id: args.task_id,
          step_id: args.step_id,
          notes: args.notes
        });
        return continuum_success({ task });
      });
    }
  });
}
function continuum_step_update({ directory }) {
  return tool({
    description: "Update a step's title, summary, details, status, or notes.",
    args: {
      task_id: tool.schema.string().describe("Task ID."),
      step_id: tool.schema.number().describe("Step ID to update."),
      title: tool.schema.string().optional().describe("Updated step title."),
      summary: tool.schema.string().optional().describe("Updated summary."),
      details: tool.schema.string().optional().describe("Updated details."),
      status: tool.schema.enum(["pending", "in_progress", "completed", "skipped"]).optional().describe("Updated status."),
      notes: tool.schema.string().optional().describe("Updated notes.")
    },
    async execute(args) {
      return with_continuum_error_handling(async () => {
        const db = await get_db(directory);
        const task = await update_step(db, {
          task_id: args.task_id,
          step_id: args.step_id,
          title: args.title,
          summary: args.summary,
          details: args.details,
          status: args.status,
          notes: args.notes
        });
        return continuum_success({ task });
      });
    }
  });
}
function continuum_task_discover({ directory }) {
  return tool({
    description: "Record a discovery made during task execution. Discoveries are things learned that may be useful later.",
    args: {
      task_id: tool.schema.string().describe("Task ID."),
      content: tool.schema.string().describe("What was discovered.")
    },
    async execute(args) {
      return with_continuum_error_handling(async () => {
        const db = await get_db(directory);
        const task = await add_discovery(db, {
          task_id: args.task_id,
          content: args.content
        });
        return continuum_success({ task });
      });
    }
  });
}
function continuum_task_decide({ directory }) {
  return tool({
    description: "Record a decision made during task execution, with optional rationale.",
    args: {
      task_id: tool.schema.string().describe("Task ID."),
      content: tool.schema.string().describe("What was decided."),
      rationale: tool.schema.string().optional().describe("Why this decision was made.")
    },
    async execute(args) {
      return with_continuum_error_handling(async () => {
        const db = await get_db(directory);
        const task = await add_decision(db, {
          task_id: args.task_id,
          content: args.content,
          rationale: args.rationale
        });
        return continuum_success({ task });
      });
    }
  });
}
function continuum_task_complete({ directory }) {
  return tool({
    description: "Complete a task with an outcome summary. Records what actually happened vs. the plan.",
    args: {
      task_id: tool.schema.string().describe("Task ID."),
      outcome: tool.schema.string().describe("Summary of what was accomplished and any deviations from the plan.")
    },
    async execute(args) {
      return with_continuum_error_handling(async () => {
        const db = await get_db(directory);
        const task = await complete_task(db, {
          task_id: args.task_id,
          outcome: args.outcome
        });
        return continuum_success({ task });
      });
    }
  });
}

// src/index.ts
var plugin = async ({ project, client, $, directory, worktree }) => {
  return {
    tool: {
      continuum_init: continuum_init({ directory }),
      continuum_task_create: continuum_task_create({ directory }),
      continuum_task_get: continuum_task_get({ directory }),
      continuum_task_update: continuum_task_update({ directory }),
      continuum_task_delete: continuum_task_delete({ directory }),
      continuum_query: continuum_query({ directory }),
      continuum_step_add: continuum_step_add({ directory }),
      continuum_step_complete: continuum_step_complete({ directory }),
      continuum_step_update: continuum_step_update({ directory }),
      continuum_task_discover: continuum_task_discover({ directory }),
      continuum_task_decide: continuum_task_decide({ directory }),
      continuum_task_complete: continuum_task_complete({ directory })
    }
  };
};

// src/plugin.ts
var plugin_default = plugin;
export {
  plugin_default as default
};
