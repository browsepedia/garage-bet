/**
 * EAS build post-install helper for monorepo apps.
 *
 * Responsibilities:
 * 1) Ensure workspace node_modules exists (symlink to app node_modules when needed).
 * 2) Keep setup minimal and deterministic (no node_modules source patching).
 */

import { existsSync, promises as fs } from 'fs';
import { join } from 'path';

const [workspaceRoot, projectRoot] = process.argv.slice(2);

async function ensureWorkspaceNodeModules() {
  const workspaceNodeModules = join(workspaceRoot, 'node_modules');
  if (existsSync(workspaceNodeModules)) {
    console.log('Workspace node_modules already exists');
    return;
  }

  await fs.symlink(
    join(projectRoot, 'node_modules'),
    workspaceNodeModules,
    'dir',
  );
  console.log('Workspace node_modules symlink created');
}

await ensureWorkspaceNodeModules();
