import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const DRY_RUN = process.argv.includes("--dry-run");
const TAG = DRY_RUN ? "[DRY-RUN] " : "";

// ── Resolve project root via git (same source of truth as version-bump.sh) ───
let projectRoot;
try {
  projectRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
} catch {
  console.error("gen-versionless: not inside a git repository (or git unavailable)");
  process.exit(1);
}
if (!projectRoot) {
  console.error("gen-versionless: failed to resolve project root via git");
  process.exit(1);
}

const distDir = path.join(projectRoot, "dist");
if (!fs.existsSync(distDir)) {
  console.error(`gen-versionless: dist directory not found at ${distDir}`);
  process.exit(1);
}

const v = process.env.npm_package_version;
if (!v) {
  console.error("gen-versionless: npm_package_version not set (run via 'npm run')");
  process.exit(1);
}

const prefix = `cahir.${v}.`;

console.log(`${TAG}gen-versionless: project root = ${projectRoot}`);
console.log(`${TAG}gen-versionless: dist dir     = ${distDir}`);
console.log(`${TAG}gen-versionless: prefix       = ${prefix}`);

let count = 0;
for (const f of fs.readdirSync(distDir)) {
  if (!f.startsWith(prefix)) continue;
  const target = f.replace(`.${v}.`, ".");
  if (DRY_RUN) {
    console.log(`  ${TAG}would copy: ${f} -> ${target}`);
  } else {
    fs.copyFileSync(path.join(distDir, f), path.join(distDir, target));
    console.log(`  ${f} -> ${target}`);
  }
  count++;
}

if (count === 0) {
  console.error(`gen-versionless: no files matching prefix '${prefix}' in ${distDir}`);
  process.exit(1);
}

console.log(`${TAG}gen-versionless: ${DRY_RUN ? "would copy" : "copied"} ${count} files for ${v}`);
