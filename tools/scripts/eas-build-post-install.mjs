/**
 * EAS build post-install helper for monorepo apps.
 *
 * Responsibilities:
 * 1) Ensure workspace node_modules exists (symlink to app node_modules when needed).
 * 2) Mirror hoisted packages from the workspace root into the app's node_modules via
 *    symlinks so Android Gradle autolinking finds native modules under the app
 *    (Yarn hoists to repo root, leaving apps/<app>/node_modules nearly empty).
 */

import { existsSync, promises as fs } from 'fs';
import { dirname, join, relative } from 'path';

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

const SKIP_TOP_LEVEL = new Set([
  '.bin',
  '.cache',
  '.yarn-integrity',
  '.modules.yaml',
]);

/**
 * Symlink each hoisted package from workspaceRoot/node_modules into projectRoot/node_modules
 * so paths like apps/my-app/node_modules/react-native-gesture-handler exist for RN Gradle.
 */
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

  async function symlinkIfAbsent(targetAbs, linkAbs) {
    try {
      await fs.lstat(linkAbs);
      return;
    } catch {
      /* create */
    }
    await fs.mkdir(dirname(linkAbs), { recursive: true });
    const rel = relative(dirname(linkAbs), targetAbs);
    await fs.symlink(rel, linkAbs, 'dir');
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
        await symlinkIfAbsent(targetAbs, linkAbs);
      }
    } else {
      const targetAbs = join(rootNm, ent.name);
      const linkAbs = join(appNm, ent.name);
      await symlinkIfAbsent(targetAbs, linkAbs);
    }
  }

  console.log('Hoisted workspace packages symlinked into app node_modules');
}

await ensureWorkspaceNodeModules();

const shouldMirrorHoistedIntoApp =
  process.env.EAS_BUILD === 'true' || process.platform !== 'win32';

if (shouldMirrorHoistedIntoApp) {
  await mirrorHoistedPackagesIntoApp();
} else {
  console.log(
    'Skipping hoisted mirror on Windows (symlinks need dev mode/admin); EAS cloud still runs this step.',
  );
}
