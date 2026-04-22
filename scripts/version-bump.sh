#!/usr/bin/env bash
# =============================================================================
# version-bump.sh — Bump version across all versioned files in the Cahir project
#
# Usage:
#   ./scripts/version-bump.sh <NEW_VERSION>
#   ./scripts/version-bump.sh <NEW_VERSION> --dry-run
#   ./scripts/version-bump.sh <NEW_VERSION> --no-backup
#
# Examples:
#   ./scripts/version-bump.sh 0.0.11
#   ./scripts/version-bump.sh 0.0.11 --dry-run
#   ./scripts/version-bump.sh 0.0.11 --no-backup --yes
#
# Safety:
#   - Only operates within the project root (auto-detected via git)
#   - Validates version format (semver-like: X.Y.Z)
#   - Backs up all affected files before changes (skip with --no-backup)
#   - Dry-run walks through ALL phases showing exactly what would change
#   - Logs every action to stdout
#   - Uses git mv for renames (better tracking)
#   - Stages all version-bumped files for commit
#   - Asks for confirmation before making changes (unless --yes flag)
# =============================================================================

set -euo pipefail

# ── Colors for logging ───────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

log_info()  { echo -e "${CYAN}[INFO]${NC}  $*"; }
log_ok()    { echo -e "${GREEN}[OK]${NC}    $*"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
log_error() { echo -e "${RED}[ERROR]${NC} $*"; }
log_dry()   { echo -e "${YELLOW}[DRY-RUN]${NC} $*"; }

# ── Remove gitignored paths from a named array (second pass on top of manual) ─
# Usage: filter_gitignored ARRAY_NAME
# Modifies the named array in-place. Manual exclusions above are the fast first
# pass; this catches anything else from .gitignore / .git/info/exclude.
filter_gitignored() {
  local -n arr=$1
  (( ${#arr[@]} )) || return 0
  local -A ignored_set=()
  while IFS= read -r -d '' f; do
    [[ -n "$f" ]] && ignored_set["$f"]=1
  done < <(printf '%s\0' "${arr[@]}" | git check-ignore --stdin -z 2>/dev/null || true)
  (( ${#ignored_set[@]} )) || return 0
  local -a filtered=()
  for f in "${arr[@]}"; do
    [[ -z "${ignored_set[$f]+_}" ]] && filtered+=("$f")
  done
  arr=("${filtered[@]}")
}

# ── Navigate to project root ─────────────────────────────────────────────────
PROJECT_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [[ -z "$PROJECT_ROOT" ]]; then
  log_error "Not inside a git repository. Aborting."
  exit 1
fi
cd "$PROJECT_ROOT"
log_info "Project root: $PROJECT_ROOT"

# ── Parse arguments ──────────────────────────────────────────────────────────
NEW_VERSION="${1:-}"
DRY_RUN=false
AUTO_YES=false
NO_BACKUP=false

for arg in "$@"; do
  case "$arg" in
    --dry-run)    DRY_RUN=true ;;
    --yes|-y)     AUTO_YES=true ;;
    --no-backup)  NO_BACKUP=true ;;
  esac
done

# ── Validate NEW_VERSION ─────────────────────────────────────────────────────
if [[ -z "$NEW_VERSION" ]]; then
  echo "Usage: $0 <NEW_VERSION> [--dry-run] [--yes] [--no-backup]"
  echo "  e.g. $0 0.0.11"
  exit 1
fi

if ! [[ "$NEW_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  log_error "Invalid version format: '$NEW_VERSION'. Expected X.Y.Z (e.g., 0.0.11)"
  exit 1
fi

# ── Read OLD_VERSION from package.json ───────────────────────────────────────
if [[ ! -f "package.json" ]]; then
  log_error "package.json not found in $PROJECT_ROOT"
  exit 1
fi

OLD_VERSION="$(node -p "require('./package.json').version" 2>/dev/null || true)"
if [[ -z "$OLD_VERSION" ]]; then
  log_error "Could not read version from package.json"
  exit 1
fi

if [[ "$OLD_VERSION" == "$NEW_VERSION" ]]; then
  log_error "OLD_VERSION ($OLD_VERSION) is the same as NEW_VERSION ($NEW_VERSION). Nothing to do."
  exit 1
fi

log_info "Old version: $OLD_VERSION"
log_info "New version: $NEW_VERSION"
if $DRY_RUN; then
  log_dry "DRY-RUN mode — walking through all phases, no changes will be made."
fi

# ── Discover files to rename ─────────────────────────────────────────────────
# Find all files whose FILENAME contains the old version string
RENAME_FILES=()
while IFS= read -r -d '' file; do
  RENAME_FILES+=("$file")
done < <(find . \
  -not -path './.git/*' \
  -not -path './node_modules/*' \
  -not -path './.agents/*' \
  -not -path './olderVersions/*' \
  -not -path './debug/*' \
  -not -path './src/*' \
  -type f \
  -name "*${OLD_VERSION}*" \
  -print0 | sort -z)
filter_gitignored RENAME_FILES

# ── Discover files with version strings inside ───────────────────────────────
CONTENT_FILES=()
while IFS= read -r -d '' file; do
  CONTENT_FILES+=("$file")
done < <(grep -FrlZ --include='*.js' --include='*.cjs' --include='*.json' \
  --include='*.html' --include='*.md' \
  "$OLD_VERSION" . \
  --exclude-dir=.git \
  --exclude-dir=node_modules \
  --exclude-dir=.agents \
  --exclude-dir=olderVersions \
  --exclude-dir=debug \
  --exclude-dir=src \
  --exclude='package-lock.json' \
  --exclude='CHANGELOG.md' \
  2>/dev/null | sort -z)
filter_gitignored CONTENT_FILES

# ── Escape dots in OLD_VERSION for sed regex (0.0.10 → 0\.0\.10) ─────────────
OLD_VERSION_ESCAPED="${OLD_VERSION//./\\.}"

# ── Display summary ──────────────────────────────────────────────────────────
BACKUP_DIR="olderVersions/backup-${OLD_VERSION}-$(date +%Y-%m-%d-%H%M%S)"

echo ""
echo "============================================================"
echo "  VERSION BUMP SUMMARY: $OLD_VERSION → $NEW_VERSION"
echo "============================================================"

# ── Confirm (skip for dry-run — nothing to confirm) ─────────────────────────
if ! $DRY_RUN && ! $AUTO_YES; then
  echo ""
  echo "Files to rename: ${#RENAME_FILES[@]}, Files with content changes: ${#CONTENT_FILES[@]}"
  echo ""
  read -rp "Proceed with version bump? (y/N): " confirm
  if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
    log_warn "Aborted by user."
    exit 0
  fi
fi

# ══════════════════════════════════════════════════════════════════════════════
#  PHASE 0: Backup affected files
# ══════════════════════════════════════════════════════════════════════════════
echo ""
if $NO_BACKUP; then
  log_warn "Phase 0: Backup skipped (--no-backup)"
else
  # Collect unique files from both rename and content lists
  declare -A BACKUP_SET
  for f in "${RENAME_FILES[@]}"; do
    BACKUP_SET["$f"]=1
  done
  for f in "${CONTENT_FILES[@]}"; do
    BACKUP_SET["$f"]=1
  done

  if $DRY_RUN; then
    log_dry "Phase 0: Would back up ${#BACKUP_SET[@]} file(s) to $BACKUP_DIR"
    for f in "${!BACKUP_SET[@]}"; do
      log_dry "  $f"
    done
  else
    log_info "Phase 0: Backing up affected files to $BACKUP_DIR..."
    mkdir -p "$BACKUP_DIR"
    for f in "${!BACKUP_SET[@]}"; do
      backup_path="$BACKUP_DIR/$f"
      mkdir -p "$(dirname "$backup_path")"
      cp "$f" "$backup_path"
      log_info "  Backed up: $f"
    done
    log_ok "Backed up ${#BACKUP_SET[@]} file(s) to $BACKUP_DIR"
  fi
fi

# ══════════════════════════════════════════════════════════════════════════════
#  PHASE 0.5: Update package.json version via npm (the proper tool)
# ══════════════════════════════════════════════════════════════════════════════
echo ""
if $DRY_RUN; then
  log_dry "Phase 0.5: Would run: npm version $NEW_VERSION --no-git-tag-version"
  log_dry "  package.json      \"version\": \"$OLD_VERSION\" → \"version\": \"$NEW_VERSION\""
  log_dry "  package-lock.json  version fields updated by npm"
else
  log_info "Phase 0.5: Updating package.json version field via npm..."
  npm version "$NEW_VERSION" --no-git-tag-version --force
  git add package.json package-lock.json 2>/dev/null || true
  log_ok "npm version set to $NEW_VERSION (package.json + package-lock.json)"
fi

# ══════════════════════════════════════════════════════════════════════════════
#  PHASE 1: Update version string inside file CONTENTS (before renaming)
#  Note: package.json is included here for export paths — the version field
#  was already updated by npm version above, so sed only catches export paths.
#  package-lock.json is never touched by sed — npm handles it.
# ══════════════════════════════════════════════════════════════════════════════
echo ""
if $DRY_RUN; then
  log_dry "Phase 1: Content changes (sed s/${OLD_VERSION_ESCAPED}/${NEW_VERSION}/g):"
else
  log_info "Phase 1: Updating version strings inside file contents..."
fi

for f in "${CONTENT_FILES[@]}"; do
  if $DRY_RUN; then
    log_dry "  File: $f"
    # Show mini-diff: each matching line before → after
    # || true guards against pipefail killing the script if grep finds no matches
    grep -Fn "$OLD_VERSION" "$f" 2>/dev/null | while IFS= read -r match; do
      line_num="${match%%:*}"
      content="${match#*:}"
      # Trim to max 120 chars for readability
      content="${content:0:120}"
      new_content="${content//$OLD_VERSION/$NEW_VERSION}"
      echo -e "    ${RED}- L${line_num}: ${content}${NC}"
      echo -e "    ${GREEN}+ L${line_num}: ${new_content}${NC}"
    done || true
  else
    log_info "Updating: $f"
    # Show mini-diff before applying
    grep -Fn "$OLD_VERSION" "$f" 2>/dev/null | while IFS= read -r match; do
      line_num="${match%%:*}"
      content="${match#*:}"
      content="${content:0:120}"
      new_content="${content//$OLD_VERSION/$NEW_VERSION}"
      echo -e "    ${RED}- L${line_num}: ${content}${NC}"
      echo -e "    ${GREEN}+ L${line_num}: ${new_content}${NC}"
    done || true
    sed -i "s/${OLD_VERSION_ESCAPED}/${NEW_VERSION}/g" "$f"
    git add "$f" 2>/dev/null || true
    log_ok "Updated + staged: $f"
  fi
done

# ══════════════════════════════════════════════════════════════════════════════
#  PHASE 2: Rename versioned files using git mv
# ══════════════════════════════════════════════════════════════════════════════
echo ""
if $DRY_RUN; then
  log_dry "Phase 2: File renames:"
else
  log_info "Phase 2: Renaming versioned files..."
fi

for f in "${RENAME_FILES[@]}"; do
  new_name="${f//$OLD_VERSION/$NEW_VERSION}"

  if $DRY_RUN; then
    if git ls-files --error-unmatch "$f" &>/dev/null; then
      log_dry "  git mv: $f → $new_name"
    else
      log_dry "  mv + git add: $f → $new_name"
    fi
  else
    new_dir="$(dirname "$new_name")"
    if [[ ! -d "$new_dir" ]]; then
      mkdir -p "$new_dir"
      log_info "Created directory: $new_dir"
    fi

    if git ls-files --error-unmatch "$f" &>/dev/null; then
      git mv "$f" "$new_name"
      log_ok "git mv: $f → $new_name"
    else
      mv "$f" "$new_name"
      git add "$new_name" 2>/dev/null || true
      log_ok "mv + git add: $f → $new_name"
    fi
  fi
done

# ══════════════════════════════════════════════════════════════════════════════
#  PHASE 3: Rebuild dist/ via npm run build
# ══════════════════════════════════════════════════════════════════════════════
echo ""
if $DRY_RUN; then
  log_dry "Phase 3: Would run: npm run build"
  log_dry "  Regenerates dist/ with new version from package.json"
else
  log_info "Phase 3: Rebuilding dist/ via 'npm run build'..."
  if npm run build; then
    log_ok "npm run build succeeded"
    git add dist/ 2>/dev/null || true
  else
    log_error "npm run build FAILED. Aborting."
    log_warn "File renames and content updates have already been applied."
    log_warn "Fix the build issue, then run 'npm run build' manually."
    exit 1
  fi
fi

# ══════════════════════════════════════════════════════════════════════════════
#  PHASE 4: Sync static/js/ copies
# ══════════════════════════════════════════════════════════════════════════════
echo ""
DIST_UMD="dist/cahir.${NEW_VERSION}.evergreen.umd.js"
STATIC_UMD="static/js/cahir.${NEW_VERSION}.evergreen.umd.js"
COLL_CH="collections/DOM/ch.${NEW_VERSION}.js"
STATIC_CH="static/js/ch.${NEW_VERSION}.js"
OLD_STATIC_UMD="static/js/cahir.${OLD_VERSION}.evergreen.umd.js"
OLD_STATIC_CH="static/js/ch.${OLD_VERSION}.js"

if $DRY_RUN; then
  log_dry "Phase 4: Static/js sync:"
  log_dry "  Copy: $DIST_UMD → $STATIC_UMD"
  log_dry "  Copy: $COLL_CH → $STATIC_CH"
  if [[ -f "$OLD_STATIC_UMD" ]]; then
    log_dry "  Remove: $OLD_STATIC_UMD"
  fi
  if [[ -f "$OLD_STATIC_CH" ]]; then
    log_dry "  Remove: $OLD_STATIC_CH"
  fi
else
  log_info "Phase 4: Syncing static/js/ copies..."

  if [[ -f "$DIST_UMD" ]]; then
    cp "$DIST_UMD" "$STATIC_UMD"
    git add "$STATIC_UMD" 2>/dev/null || true
    log_ok "Copied $DIST_UMD → $STATIC_UMD"
  else
    log_warn "Expected $DIST_UMD not found. static/js/ may need manual sync."
  fi

  if [[ -f "$COLL_CH" ]]; then
    cp "$COLL_CH" "$STATIC_CH"
    git add "$STATIC_CH" 2>/dev/null || true
    log_ok "Copied $COLL_CH → $STATIC_CH"
  else
    log_warn "Expected $COLL_CH not found. static/js/ may need manual sync."
  fi

  for old_file in "$OLD_STATIC_UMD" "$OLD_STATIC_CH"; do
    if [[ -f "$old_file" ]]; then
      git rm "$old_file" 2>/dev/null || rm -f "$old_file"
      log_ok "Removed old static copy: $old_file"
    fi
  done
fi

# ══════════════════════════════════════════════════════════════════════════════
#  PHASE 5: Verification (only in real run — nothing changed in dry-run)
# ══════════════════════════════════════════════════════════════════════════════
echo ""
if $DRY_RUN; then
  log_dry "Phase 5: Verification skipped (dry-run — no changes to verify)"
  echo ""
  echo "============================================================"
  log_dry "Dry-run complete. No changes were made."
  echo "============================================================"
else
  log_info "Phase 5: Verification — checking for stale references to $OLD_VERSION..."

  STALE=$(grep -Fr "$OLD_VERSION" . \
    --include='*.js' --include='*.cjs' --include='*.json' \
    --include='*.html' --include='*.md' \
    --exclude-dir=.git \
    --exclude-dir=node_modules \
    --exclude-dir=.agents \
    --exclude-dir=olderVersions \
    --exclude-dir=debug \
    --exclude-dir=src \
    --exclude='CHANGELOG.md' \
    --exclude='package-lock.json' \
    2>/dev/null || true)

  if [[ -n "$STALE" ]]; then
    echo ""
    log_warn "Found remaining content references to $OLD_VERSION:"
    echo "$STALE"
  fi

  # Also check for stale filenames
  STALE_FILES=$(find . \
    -not -path './.git/*' \
    -not -path './node_modules/*' \
    -not -path './.agents/*' \
    -not -path './olderVersions/*' \
    -not -path './debug/*' \
    -not -path './src/*' \
    -type f \
    -name "*${OLD_VERSION}*" \
    2>/dev/null || true)

  if [[ -n "$STALE_FILES" ]]; then
    echo ""
    log_warn "Found remaining filenames containing $OLD_VERSION:"
    echo "$STALE_FILES"
  fi

  if [[ -n "$STALE" || -n "$STALE_FILES" ]]; then
    echo ""
    log_warn "You may need to update these manually or add them to the script."
  else
    log_ok "No stale references to $OLD_VERSION found (content or filenames)!"
  fi

  echo ""
  echo "============================================================"
  log_ok "Version bump complete: $OLD_VERSION → $NEW_VERSION"
  echo "============================================================"
  echo ""
  log_info "Next steps:"
  log_info "  1. Review changes:  git diff --staged"
  log_info "  2. Test the build:  open components/examples/index.html"
  log_info "  3. Commit:          git commit -m 'chore: bump version to $NEW_VERSION'"
  log_info "  4. Tag (optional):  git tag v$NEW_VERSION"
  log_info "  5. Publish:         npm publish"
fi
