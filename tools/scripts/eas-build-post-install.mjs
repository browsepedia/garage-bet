/**
 * EAS build post-install helper for monorepo apps.
 *
 * 1) Ensure workspace node_modules exists (symlink to app node_modules when needed).
 * 2) Mirror hoisted packages from the workspace root into the app's node_modules when
 *    they are missing there (Yarn nohoist should make this a no-op for garage-bet-app).
 *
 * Directory links: POSIX uses relative symlinks; Windows uses junctions (no admin).
 */

import { existsSync, promises as fs } from 'fs';
import { dirname, join, relative, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const rawWorkspace = process.argv[2];
const rawProject = process.argv[3];

const workspaceRoot = rawWorkspace
  ? resolve(process.cwd(), rawWorkspace)
  : resolve(__dirname, '../..');
const projectRoot = rawProject
  ? resolve(process.cwd(), rawProject)
  : resolve(workspaceRoot, 'apps/garage-bet-app');

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

const SKIP_TOP_LEVEL = new Set([
  '.bin',
  '.cache',
  '.yarn-integrity',
  '.modules.yaml',
]);

async function mirrorHoistedPackagesIntoApp() {
  const rootNm = join(workspaceRoot, 'node_modules');
  const appNm = join(projectRoot, 'node_modules');

  if (!existsSync(rootNm)) {
    console.warn(
      'mirrorHoistedPackagesIntoApp: workspace node_modules missing, skipping',
    );
    return;
  }

  await fs.mkdir(appNm, { recursive: true });

  async function linkIfAbsent(targetAbs, linkAbs) {
    try {
      await fs.lstat(linkAbs);
      return;
    } catch {
      /* create */
    }
    await fs.mkdir(dirname(linkAbs), { recursive: true });
    if (process.platform === 'win32') {
      await fs.symlink(targetAbs, linkAbs, 'junction');
    } else {
      const rel = relative(dirname(linkAbs), targetAbs);
      await fs.symlink(rel, linkAbs, 'dir');
    }
  }

  const top = await fs.readdir(rootNm, { withFileTypes: true });
  for (const ent of top) {
    if (!ent.isDirectory()) continue;
    if (ent.name.startsWith('.')) continue;
    if (SKIP_TOP_LEVEL.has(ent.name)) continue;

    if (ent.name.startsWith('@')) {
      const scopeDir = join(rootNm, ent.name);
      let subs;
      try {
        subs = await fs.readdir(scopeDir, { withFileTypes: true });
      } catch {
        continue;
      }
      for (const sub of subs) {
        if (!sub.isDirectory()) continue;
        const targetAbs = join(scopeDir, sub.name);
        const linkAbs = join(appNm, ent.name, sub.name);
        await linkIfAbsent(targetAbs, linkAbs);
      }
    } else {
      const targetAbs = join(rootNm, ent.name);
      const linkAbs = join(appNm, ent.name);
      await linkIfAbsent(targetAbs, linkAbs);
    }
  }

  console.log(
    'Hoisted workspace packages linked into app node_modules (if missing)',
  );
}

await ensureWorkspaceNodeModules();
await mirrorHoistedPackagesIntoApp();
