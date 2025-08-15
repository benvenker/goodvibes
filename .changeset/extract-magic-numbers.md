---
'goodvibes': patch
---

Extract magic numbers to centralized constants configuration

- Created comprehensive constants.ts file organizing all magic numbers by domain
- Replaced 80+ hardcoded values across 15 files with named constants
- Organized constants into logical groups: PHYSICS, CAMERA, NETWORK, AUDIO, UI, ARENA, etc.
- Improved maintainability and made gameplay tuning easier
- No functional changes, purely a refactoring for better code quality