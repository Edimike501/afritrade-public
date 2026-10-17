#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const ROOT_DIR = process.cwd();

// Parse CLI flags
const args = process.argv.slice(2);
const isYes = args.includes('--yes') || args.includes('-y');
const isTurboOnly = args.includes('--turbo');
const isNodeModulesOnly = args.includes('--node-modules');
const isDryRun = args.includes('--dry-run');

/**
 * Scan monorepo directories for dist, .next, .turbo, and node_modules
 * without recursing inside node_modules or .git.
 */
function findTargets(dir, root = dir) {
  const results = {
    dist: [],
    next: [],
    turbo: [],
    nodeModules: [],
  };

  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return results;
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const name = entry.name;
    const fullPath = path.join(dir, name);
    const relPath = path.relative(root, fullPath);

    // Skip git repository metadata and agent config
    if (name === '.git' || name === '.agents') continue;

    if (name === 'dist') {
      results.dist.push(relPath);
    } else if (name === '.next') {
      results.next.push(relPath);
    } else if (name === '.turbo') {
      results.turbo.push(relPath);
    } else if (name === 'node_modules') {
      results.nodeModules.push(relPath);
    } else {
      const sub = findTargets(fullPath, root);
      results.dist.push(...sub.dist);
      results.next.push(...sub.next);
      results.turbo.push(...sub.turbo);
      results.nodeModules.push(...sub.nodeModules);
    }
  }

  return results;
}

function removeDirectory(relPath) {
  const fullPath = path.join(ROOT_DIR, relPath);
  if (isDryRun) {
    console.log(`  [dry-run] Would delete: ${relPath}`);
    return;
  }
  try {
    fs.rmSync(fullPath, { recursive: true, force: true });
    console.log(`  ✓ Removed: ${relPath}`);
  } catch (err) {
    console.error(`  ✗ Failed to remove ${relPath}:`, err.message);
  }
}

async function askConfirmation(rl, message) {
  if (isYes) return true;
  if (!process.stdin.isTTY) {
    console.log(`\n  (Non-interactive environment detected; skipping confirmation. Pass -y to confirm)`);
    return false;
  }
  const answer = await rl.question(`${message} (y/N): `);
  return answer.trim().toLowerCase() === 'y' || answer.trim().toLowerCase() === 'yes';
}

async function main() {
  console.log('🧹 Monorepo Clean Utility\n');
  if (isDryRun) {
    console.log('🔍 DRY RUN MODE (no files will be deleted)\n');
  }

  const targets = findTargets(ROOT_DIR);
  const autoTargets = [...targets.dist, ...targets.next];

  // 1. Clear dist and .next automatically
  console.log('📦 Step 1: Cleaning build outputs (dist, .next)...');
  if (autoTargets.length === 0) {
    console.log('  ℹ No dist or .next directories found.');
  } else {
    for (const relPath of autoTargets) {
      removeDirectory(relPath);
    }
  }

  const rl = readline.createInterface({ input, output });

  try {
    // 2. Ask confirmation for .turbo folders
    console.log('\n⚡ Step 2: Turborepo cache (.turbo)...');
    if (targets.turbo.length === 0) {
      console.log('  ℹ No .turbo directories found.');
    } else {
      console.log(`  Found ${targets.turbo.length} .turbo directory/directories:`);
      for (const t of targets.turbo) {
        console.log(`    - ${t}`);
      }

      const shouldDeleteTurbo = isTurboOnly || (await askConfirmation(rl, '\n  Delete all .turbo folders?'));
      if (shouldDeleteTurbo) {
        for (const t of targets.turbo) {
          removeDirectory(t);
        }
      } else {
        console.log('  ⊘ Skipped .turbo directories.');
      }
    }

    // 3. Ask confirmation for node_modules
    console.log('\n📦 Step 3: Dependencies (node_modules)...');
    if (targets.nodeModules.length === 0) {
      console.log('  ℹ No node_modules directories found.');
    } else {
      console.log(`  Found ${targets.nodeModules.length} node_modules directory/directories:`);
      for (const nm of targets.nodeModules) {
        console.log(`    - ${nm}`);
      }

      const shouldDeleteNodeModules = isNodeModulesOnly || (await askConfirmation(rl, '\n  Delete all node_modules folders?'));
      if (shouldDeleteNodeModules) {
        for (const nm of targets.nodeModules) {
          removeDirectory(nm);
        }
      } else {
        console.log('  ⊘ Skipped node_modules directories.');
      }
    }

    console.log('\n✨ Clean process completed!\n');
  } finally {
    rl.close();
  }
}

main().catch((err) => {
  console.error('\n❌ Clean failed:', err);
  process.exit(1);
});
