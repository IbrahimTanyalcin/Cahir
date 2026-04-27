# CHANGELOG
## 09 05 2025

- `<simple-chat/>`
    - inlined `scrollToBottom`to fix a bug that caused only one chat component to scroll when a new message arrives.
- Added `<bioinfo-input/>`
- Added `<simple-upload/>`
## 19 04 2026
- ## v0.1.0
  ### changes
  - Added `<pointer-orb/>` component — cursor-following orb with elastic CSS animation, click ripple effect, and configurable appearance
  - Added `scripts/version-bump.sh` — automated version bumping across all versioned filenames, imports, READMEs, HTML files, and package.json exports
  - Added `.agents/skills/version-bump/SKILL.md` — skill documentation for AI-assisted version bumping
  
  ### fixes
  - Add the missing break statement under character data in mana-orb:
  ```javascript
  case "characterData-host":
        //console.log("characterData-host");
        el[symbols.upClipPath]({values, el});
        break;
  ```
## 27 04 2026
- ## v0.1.1
  ### changes
  - `<pointer-orb/>`: added `data-velocity-smoothing` and `data-velocity-stale-ms` attributes for tuning the satellite trail.
  - `<pointer-orb/>`: added `moveTo(x, y)`, `getPos()`, and `clicked()` methods for programmatic control when `data-auto-mount` / `data-auto-capture` are off.
  - `<pointer-orb/>` README: added `## Limitations` section covering WebKit gooey-filter behavior, `touch-action` requirement, 60Hz jitter, document-scoped `@property` globals, and the `ready()`-before-use contract.
  - `scripts/gen-versionless.js`: generates versionless `dist/` artifacts from the versioned outputs at the end of `npm run build`, preventing stale hand-edits from being carried across version bumps.

  ### fixes
  - `<pointer-orb/>`: switched motion driver from CSS `animation` to `transition` on `--orb-x` / `--orb-y`, fixing Safari drift to the top-left caused by `@property` being ignored inside a shadow root.
  - `<pointer-orb/>`: registered `--orb-x`, `--orb-y`, `--orb-pointer-x`, `--orb-pointer-y`, `--orb-dx`, `--orb-dy` at document scope via `document.adoptedStyleSheets` and `CSS.registerProperty()`, restoring typed numeric interpolation in every engine.
  - `<pointer-orb/>`: coalesced per-`pointermove` style writes into a single `requestAnimationFrame` flush — eliminates the 60Hz / touchscreen stutter while the EMA still consumes every event.
  - `<pointer-orb/>`: special-cased `pointerdown` in the velocity calculation to use raw delta (preserves satellite direction on tap-then-tap-elsewhere on touchscreens) and guarded the smoothed-velocity writes so taps no longer poison subsequent EMA blends.
  - `<pointer-orb/>`: made `:host` inert — `position: fixed`, `pointer-events: none`, no `display: grid` / `container-type` / `transform` — so `#center` is no longer trapped in the host's containing block.
  - `<pointer-orb/>`: added `aria-hidden="true"` and `role="presentation"` on the host since the orb is purely decorative.
  - `<pointer-orb/>`: expanded the SVG filter region (`x="-500%" y="-500%" width="1100%" height="1100%"`) so the gooey blend isn't clipped on large satellite excursions.
  - `<pointer-orb/>`: added a dedicated `pointerdown` listener so the click ripple fires on iOS where `pointermove` alone is insufficient.
