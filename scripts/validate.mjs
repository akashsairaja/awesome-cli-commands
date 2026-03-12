#!/usr/bin/env node

/**
 * validate.mjs — Validate all data files in awesome-cli-commands
 *
 * Checks:
 *  1.  JSON/MD parse validity
 *  2.  Zod schema validation (required fields, types, enums)
 *  3.  Filename matches the item's ID
 *  4.  Parent directory matches categoryId/stackId
 *  5.  No duplicate IDs within a data type
 *  6.  Agent type field matches directory (agents/ → "agent", etc.)
 *  7.  ID format — lowercase kebab-case only
 *  8.  Description quality — minimum length, no placeholders
 *  9.  Command quality — no TODO/FIXME, no trailing whitespace
 *  10. Date validation — YYYY-MM-DD format, not in the future
 *  11. Markdown body — must start with a heading, min length
 *  12. Cross-references — relatedRecipes/relatedItems point to real IDs
 *  13. Tag quality — no duplicates, no empty strings
 *  14. Consistent stack coverage — warn if stack has agents but no rules
 *
 * Usage:
 *   node scripts/validate.mjs                  # validate everything
 *   node scripts/validate.mjs --only commands   # validate one type
 *   node scripts/validate.mjs --changed-only    # validate only git-changed files
 */

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// ── CLI args ────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const onlyIdx = args.indexOf("--only");
const onlyType = onlyIdx !== -1 ? args[onlyIdx + 1] : null;
const changedOnly = args.includes("--changed-only");

// ── Regex Patterns ──────────────────────────────────────────────────

const KEBAB_CASE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
// Patterns for detecting placeholder/incomplete content
// Separate lists for different contexts to avoid false positives
const DESCRIPTION_PLACEHOLDERS = [
  /\bTODO\b/,
  /\bFIXME\b/,
  /\bHACK\b/,
  /\bLorem ipsum\b/i,
];

// Commands: strict — only obvious markers (not XXX, which is a common CLI example value)
const COMMAND_PLACEHOLDERS = [/\bTODO\b/, /\bFIXME\b/];

// Markdown body: check only OUTSIDE fenced code blocks
const BODY_PLACEHOLDERS = [/\bTODO\b/, /\bFIXME\b/, /\bHACK\b/];

// ── Zod Schemas ─────────────────────────────────────────────────────

const CommandSchema = z.object({
  id: z.string().min(1),
  categoryId: z.string().min(1),
  subcategoryId: z.string().optional(),
  title: z.string().min(1),
  command: z.string().min(1),
  description: z.string().min(1),
  tags: z.array(z.string()).optional(),
  example: z.string().optional(),
  output: z.string().optional(),
});

const RecipeStepSchema = z.object({
  title: z.string().min(1),
  command: z.string().min(1),
  description: z.string().min(1),
  tip: z.string().optional(),
  warning: z.string().optional(),
});

const RecipeFAQSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
});

const RecipeSchema = z.object({
  id: z.string().min(1),
  stackId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  timeMinutes: z.number().positive().optional(),
  trending: z.boolean().optional(),
  trendingReason: z.string().optional(),
  tags: z.array(z.string()).min(1),
  prerequisites: z.array(z.string()),
  steps: z.array(RecipeStepSchema).min(1),
  fullScript: z.string().optional(),
  faq: z.array(RecipeFAQSchema),
  relatedRecipes: z.array(z.string()).optional(),
  lastUpdated: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD format"),
});

const AgentFrontmatterSchema = z.object({
  id: z.string().min(1),
  stackId: z.string().min(1),
  type: z.enum(["agent", "skill", "rule"]),
  name: z.string().min(1),
  description: z.string().min(1),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  globs: z.array(z.string()).optional(),
  tags: z.array(z.string()).min(1),
  compatibility: z.array(z.string()).min(1),
  languages: z.array(z.string()).optional(),
  prerequisites: z.array(z.string()).optional(),
  faq: z.array(
    z.object({ question: z.string().min(1), answer: z.string().min(1) }),
  ),
  relatedItems: z.array(z.string()).optional(),
  version: z.string().min(1),
  lastUpdated: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD format"),
});

// ── Helpers ─────────────────────────────────────────────────────────

const errors = [];
const warnings = [];
const stats = { files: 0, passed: 0, failed: 0 };

// Collected IDs for cross-reference validation (populated during first pass)
const allRecipeIds = new Set();
const allAgentItemIds = new Set(); // agents + skills + rules share a namespace

// Deferred cross-reference checks (validated after all files are read)
const pendingCrossRefs = [];

function fail(filePath, message) {
  errors.push({ file: path.relative(ROOT, filePath), message });
  stats.failed++;
}

function warn(filePath, message) {
  warnings.push({ file: path.relative(ROOT, filePath), message });
}

function pass() {
  stats.passed++;
}

/** Check if a date string is in the future. */
function isFutureDate(dateStr) {
  const today = new Date().toISOString().slice(0, 10);
  return dateStr > today;
}

/** Check for placeholder content in descriptions. */
function hasDescriptionPlaceholder(str) {
  return DESCRIPTION_PLACEHOLDERS.some((p) => p.test(str));
}

/** Check for placeholder content in commands. */
function hasCommandPlaceholder(str) {
  return COMMAND_PLACEHOLDERS.some((p) => p.test(str));
}

/** Strip fenced code blocks from markdown, then check for placeholders. */
function hasBodyPlaceholder(str) {
  // Remove fenced code blocks (```...```) — these often contain example searches for TODO/FIXME
  const withoutCodeBlocks = str.replace(/```[\s\S]*?```/g, "");
  // Remove inline code (`...`)
  const withoutInlineCode = withoutCodeBlocks.replace(/`[^`]+`/g, "");
  return BODY_PLACEHOLDERS.some((p) => p.test(withoutInlineCode));
}

/** Check for duplicate values in an array. */
function findDuplicates(arr) {
  const seen = new Set();
  const dupes = [];
  for (const item of arr) {
    if (seen.has(item)) dupes.push(item);
    seen.add(item);
  }
  return dupes;
}

/** Get files changed in this PR (compared to main). */
function getChangedFiles() {
  try {
    const output = execSync("git diff --name-only origin/main...HEAD", {
      cwd: ROOT,
      encoding: "utf-8",
    });
    return output
      .trim()
      .split("\n")
      .filter((f) => f.length > 0);
  } catch {
    return null;
  }
}

/** List data files in a directory, optionally filtered to changed files. */
function listDataFiles(dir, ext, changedFiles) {
  const fullDir = path.join(ROOT, dir);
  if (!fs.existsSync(fullDir)) return [];

  const results = [];
  const stacks = fs.readdirSync(fullDir, { withFileTypes: true });

  for (const entry of stacks) {
    if (!entry.isDirectory()) continue;

    const stackDir = path.join(fullDir, entry.name);
    const files = fs
      .readdirSync(stackDir)
      .filter((f) => f.endsWith(ext) && !f.startsWith("_"));

    for (const file of files) {
      const relPath = path.join(dir, entry.name, file);
      if (
        changedFiles &&
        !changedFiles.includes(relPath.replace(/\\/g, "/"))
      ) {
        continue;
      }
      results.push({
        fullPath: path.join(ROOT, relPath),
        relPath,
        stack: entry.name,
        filename: file,
      });
    }
  }

  return results;
}

// ── Validators ──────────────────────────────────────────────────────

function validateCommands() {
  console.log("  Commands...");
  const changedFiles = changedOnly ? getChangedFiles() : null;
  const files = listDataFiles("commands", ".json", changedFiles);
  const seenIds = new Map();

  for (const { fullPath, relPath, stack, filename } of files) {
    stats.files++;
    let hasError = false;

    // 1. Parse JSON
    let data;
    try {
      data = JSON.parse(fs.readFileSync(fullPath, "utf-8"));
    } catch (e) {
      fail(fullPath, `Invalid JSON: ${e.message}`);
      continue;
    }

    // 2. Schema validation
    const result = CommandSchema.safeParse(data);
    if (!result.success) {
      const issues = result.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ");
      fail(fullPath, `Schema: ${issues}`);
      continue;
    }

    const item = result.data;

    // 3. Filename must match ID
    const expectedFilename = `${item.id}.json`;
    if (filename !== expectedFilename) {
      fail(fullPath, `Filename "${filename}" doesn't match id "${item.id}"`);
      hasError = true;
    }

    // 4. Parent directory must match categoryId
    if (item.categoryId !== stack) {
      fail(fullPath, `categoryId "${item.categoryId}" doesn't match directory "${stack}"`);
      hasError = true;
    }

    // 5. Duplicate ID check
    const key = `commands:${item.id}`;
    if (seenIds.has(key)) {
      fail(fullPath, `Duplicate ID "${item.id}" — also in ${seenIds.get(key)}`);
      hasError = true;
    } else {
      seenIds.set(key, relPath);
    }

    // 7. ID format — must be kebab-case (allow numeric suffixes like git-1)
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(item.id)) {
      fail(fullPath, `ID "${item.id}" is not valid kebab-case (lowercase letters, numbers, hyphens)`);
      hasError = true;
    }

    // 8. Description quality
    if (item.description.length < 5) {
      fail(fullPath, `Description too short (${item.description.length} chars, min 5)`);
      hasError = true;
    }
    if (hasDescriptionPlaceholder(item.description)) {
      fail(fullPath, `Description contains placeholder text (TODO/FIXME/etc.)`);
      hasError = true;
    }

    // 9. Command quality
    if (hasCommandPlaceholder(item.command)) {
      fail(fullPath, `Command contains placeholder text (TODO/FIXME)`);
      hasError = true;
    }
    if (item.command !== item.command.trim()) {
      fail(fullPath, `Command has leading/trailing whitespace`);
      hasError = true;
    }

    // 13. Tag quality
    if (item.tags) {
      const dupes = findDuplicates(item.tags);
      if (dupes.length > 0) {
        warn(fullPath, `Duplicate tags: ${dupes.join(", ")}`);
      }
      if (item.tags.some((t) => t.trim() === "")) {
        fail(fullPath, `Tags array contains empty strings`);
        hasError = true;
      }
    }

    if (!hasError) pass();
  }

  return files.length;
}

function validateRecipes() {
  console.log("  Recipes...");
  const changedFiles = changedOnly ? getChangedFiles() : null;
  const files = listDataFiles("recipes", ".json", changedFiles);
  const seenIds = new Map();

  for (const { fullPath, relPath, stack, filename } of files) {
    stats.files++;
    let hasError = false;

    // 1. Parse JSON
    let data;
    try {
      data = JSON.parse(fs.readFileSync(fullPath, "utf-8"));
    } catch (e) {
      fail(fullPath, `Invalid JSON: ${e.message}`);
      continue;
    }

    // 2. Schema validation
    const result = RecipeSchema.safeParse(data);
    if (!result.success) {
      const issues = result.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ");
      fail(fullPath, `Schema: ${issues}`);
      continue;
    }

    const item = result.data;
    allRecipeIds.add(item.id);

    // 3. Filename must match ID
    const expectedFilename = `${item.id}.json`;
    if (filename !== expectedFilename) {
      fail(fullPath, `Filename "${filename}" doesn't match id "${item.id}"`);
      hasError = true;
    }

    // 4. Parent directory must match stackId
    if (item.stackId !== stack) {
      fail(fullPath, `stackId "${item.stackId}" doesn't match directory "${stack}"`);
      hasError = true;
    }

    // 5. Duplicate ID check
    const key = `recipes:${item.id}`;
    if (seenIds.has(key)) {
      fail(fullPath, `Duplicate ID "${item.id}" — also in ${seenIds.get(key)}`);
      hasError = true;
    } else {
      seenIds.set(key, relPath);
    }

    // 7. ID format
    if (!KEBAB_CASE.test(item.id)) {
      fail(fullPath, `ID "${item.id}" is not valid kebab-case`);
      hasError = true;
    }

    // 8. Description quality
    if (item.description.length < 10) {
      fail(fullPath, `Description too short (${item.description.length} chars, min 10)`);
      hasError = true;
    }
    if (hasDescriptionPlaceholder(item.description)) {
      fail(fullPath, `Description contains placeholder text`);
      hasError = true;
    }

    // 9. Step command quality
    for (let i = 0; i < item.steps.length; i++) {
      const step = item.steps[i];
      if (hasCommandPlaceholder(step.command)) {
        fail(fullPath, `Step ${i + 1} command contains placeholder text`);
        hasError = true;
      }
      if (step.command !== step.command.trim()) {
        fail(fullPath, `Step ${i + 1} command has leading/trailing whitespace`);
        hasError = true;
      }
    }

    // 10. Date validation — not in the future
    if (isFutureDate(item.lastUpdated)) {
      fail(fullPath, `lastUpdated "${item.lastUpdated}" is in the future`);
      hasError = true;
    }

    // 12. Cross-references (deferred)
    if (item.relatedRecipes && item.relatedRecipes.length > 0) {
      pendingCrossRefs.push({
        fullPath,
        type: "recipe",
        field: "relatedRecipes",
        refs: item.relatedRecipes,
      });
    }

    // 13. Tag quality
    const tagDupes = findDuplicates(item.tags);
    if (tagDupes.length > 0) {
      warn(fullPath, `Duplicate tags: ${tagDupes.join(", ")}`);
    }
    if (item.tags.some((t) => t.trim() === "")) {
      fail(fullPath, `Tags array contains empty strings`);
      hasError = true;
    }

    // FAQ quality
    for (let i = 0; i < item.faq.length; i++) {
      const faq = item.faq[i];
      if (faq.answer.length < 10) {
        warn(fullPath, `FAQ ${i + 1} answer is very short (${faq.answer.length} chars)`);
      }
    }

    if (!hasError) pass();
  }

  return files.length;
}

function validateAgentItems(dir, expectedType) {
  console.log(`  ${dir.charAt(0).toUpperCase() + dir.slice(1)}...`);
  const changedFiles = changedOnly ? getChangedFiles() : null;
  const files = listDataFiles(dir, ".md", changedFiles);
  const seenIds = new Map();

  for (const { fullPath, relPath, stack, filename } of files) {
    stats.files++;
    let hasError = false;

    // 1. Parse frontmatter
    let parsed;
    try {
      const raw = fs.readFileSync(fullPath, "utf-8");
      parsed = matter(raw);
    } catch (e) {
      fail(fullPath, `Failed to parse frontmatter: ${e.message}`);
      continue;
    }

    // 2. Schema validation
    const result = AgentFrontmatterSchema.safeParse(parsed.data);
    if (!result.success) {
      const issues = result.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ");
      fail(fullPath, `Schema: ${issues}`);
      continue;
    }

    const item = result.data;
    allAgentItemIds.add(item.id);

    // 3. Filename must match ID
    const expectedFilename = `${item.id}.md`;
    if (filename !== expectedFilename) {
      fail(fullPath, `Filename "${filename}" doesn't match id "${item.id}"`);
      hasError = true;
    }

    // 4. Parent directory must match stackId
    if (item.stackId !== stack) {
      fail(fullPath, `stackId "${item.stackId}" doesn't match directory "${stack}"`);
      hasError = true;
    }

    // 5. Duplicate ID check
    const key = `${dir}:${item.id}`;
    if (seenIds.has(key)) {
      fail(fullPath, `Duplicate ID "${item.id}" — also in ${seenIds.get(key)}`);
      hasError = true;
    } else {
      seenIds.set(key, relPath);
    }

    // 6. Type field must match directory
    if (item.type !== expectedType) {
      fail(fullPath, `type "${item.type}" doesn't match directory "${dir}" (expected "${expectedType}")`);
      hasError = true;
    }

    // 7. ID format
    if (!KEBAB_CASE.test(item.id)) {
      fail(fullPath, `ID "${item.id}" is not valid kebab-case`);
      hasError = true;
    }

    // 8. Description quality
    if (item.description.length < 10) {
      fail(fullPath, `Description too short (${item.description.length} chars, min 10)`);
      hasError = true;
    }
    if (hasDescriptionPlaceholder(item.description)) {
      fail(fullPath, `Description contains placeholder text`);
      hasError = true;
    }

    // 10. Date validation
    if (isFutureDate(item.lastUpdated)) {
      fail(fullPath, `lastUpdated "${item.lastUpdated}" is in the future`);
      hasError = true;
    }

    // 11. Markdown body checks
    const body = parsed.content.trim();
    if (body.length < 50) {
      fail(fullPath, `Markdown body too short (${body.length} chars, min 50) — needs meaningful content`);
      hasError = true;
    }
    if (!body.startsWith("#")) {
      fail(fullPath, `Markdown body must start with a heading (# Title)`);
      hasError = true;
    }
    if (hasBodyPlaceholder(body)) {
      fail(fullPath, `Markdown body contains placeholder text (TODO/FIXME/HACK outside code blocks)`);
      hasError = true;
    }

    // 12. Cross-references (deferred)
    if (item.relatedItems && item.relatedItems.length > 0) {
      pendingCrossRefs.push({
        fullPath,
        type: "agent-item",
        field: "relatedItems",
        refs: item.relatedItems,
      });
    }

    // 13. Tag quality
    const tagDupes = findDuplicates(item.tags);
    if (tagDupes.length > 0) {
      warn(fullPath, `Duplicate tags: ${tagDupes.join(", ")}`);
    }
    if (item.tags.some((t) => t.trim() === "")) {
      fail(fullPath, `Tags array contains empty strings`);
      hasError = true;
    }

    // Version format check
    if (!/^\d+\.\d+\.\d+$/.test(item.version)) {
      warn(fullPath, `Version "${item.version}" is not semver (x.y.z)`);
    }

    if (!hasError) pass();
  }

  return files.length;
}

// ── Cross-reference validation ──────────────────────────────────────

function validateCrossReferences() {
  if (pendingCrossRefs.length === 0) return;

  console.log("  Cross-references...");
  let crossRefErrors = 0;

  for (const { fullPath, type, field, refs } of pendingCrossRefs) {
    const idSet = type === "recipe" ? allRecipeIds : allAgentItemIds;

    for (const ref of refs) {
      if (!idSet.has(ref)) {
        warn(fullPath, `${field} references unknown ID "${ref}"`);
        crossRefErrors++;
      }
    }
  }

  if (crossRefErrors > 0) {
    console.log(`    ${crossRefErrors} broken cross-reference(s) (warnings)`);
  }
}

// ── Stack coverage check ────────────────────────────────────────────

function checkStackCoverage() {
  console.log("  Stack coverage...");

  const getStacks = (dir) => {
    const fullDir = path.join(ROOT, dir);
    if (!fs.existsSync(fullDir)) return new Set();
    return new Set(
      fs
        .readdirSync(fullDir, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name),
    );
  };

  const agentStacks = getStacks("agents");
  const skillStacks = getStacks("skills");
  const ruleStacks = getStacks("rules");

  // Check that agents/skills/rules all cover the same stacks
  for (const stack of agentStacks) {
    if (!skillStacks.has(stack)) {
      warn(ROOT, `Stack "${stack}" has agents but no skills`);
    }
    if (!ruleStacks.has(stack)) {
      warn(ROOT, `Stack "${stack}" has agents but no rules`);
    }
  }
}

// ── Main ────────────────────────────────────────────────────────────

console.log("Validating awesome-cli-commands data...\n");

const types = {
  commands: () => validateCommands(),
  recipes: () => validateRecipes(),
  agents: () => validateAgentItems("agents", "agent"),
  skills: () => validateAgentItems("skills", "skill"),
  rules: () => validateAgentItems("rules", "rule"),
};

const toRun = onlyType ? { [onlyType]: types[onlyType] } : types;

if (onlyType && !types[onlyType]) {
  console.error(`Unknown type: ${onlyType}`);
  console.error(`Valid types: ${Object.keys(types).join(", ")}`);
  process.exit(1);
}

for (const [name, validator] of Object.entries(toRun)) {
  const count = validator();
  if (count === 0 && !changedOnly) {
    console.log(`    No ${name} files found — is the directory missing?`);
  }
}

// Run post-validation checks
if (!onlyType) {
  validateCrossReferences();
  checkStackCoverage();
}

// ── Report ──────────────────────────────────────────────────────────

console.log("");

if (warnings.length > 0) {
  console.log(`Warnings (${warnings.length}):`);
  for (const w of warnings) {
    console.log(`  WARN  ${w.file}: ${w.message}`);
  }
  console.log("");
}

if (errors.length > 0) {
  console.log(`Errors (${errors.length}):`);
  for (const e of errors) {
    console.log(`  FAIL  ${e.file}: ${e.message}`);
  }
  console.log("");
  console.log(
    `VALIDATION FAILED: ${stats.failed} error(s) in ${stats.files} files`,
  );
  process.exit(1);
} else {
  console.log(
    `ALL PASSED: ${stats.passed} files validated, 0 errors`,
  );
  if (warnings.length > 0) {
    console.log(`  (${warnings.length} warning(s) — not blocking)`);
  }
}
