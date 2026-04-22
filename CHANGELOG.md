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
  
