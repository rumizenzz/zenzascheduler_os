ZenzaScheduler OS — TODO

- Dashboard renders above app content again so modules show at the top
- Track and triage UI regressions (e.g., content under headers/sidebar)
- To-Do List items can be marked "In Progress..." with an animated ellipsis
- Checking an in-progress to-do item now marks it completed instead of reverting to pending
- Supabase schema reloads after adding todo status column to prevent missing-field errors
- Filtered past garbage collection reminders using local dates so countdowns never show negative time
- Synced scheduler pnpm lockfile with lottie-web dependency to fix Netlify install errors
- Prayer modules skip audio player when recordings are missing to avoid playback errors
- ErrorBoundary deduplicated to resolve TypeScript build errors
- Number Theory tool factors numbers and finds LCM/GCD for GED prep
- Math Notebook accepts pasted screenshots, highlights regions, and OCRs text into selectable math
- Multiplication table hides products until hovered so answers reveal on mouseover
- Build pipeline: ensure pnpm availability on Windows; document dev setup
- Calendar: verify sticky header layering across all tabs/modals
- Safe-area: confirm padding on iOS PWA and Android Chrome
- Pull-to-refresh: verify overlay z-index doesn’t occlude content
- Sidebar: confirm collapse/expand restores correct margins at md+ widths
- Tests: add basic UI smoke tests for header overlap and z-order
- Docs: add CONTRIBUTING with local run/build instructions
- Factor tree tool builds interactive prime factor trees with connecting branches for any number
- Corrected Math Notebook buttons and portal syntax so Netlify builds pass
- Added Our Wedding Vows module with Rumi's vow and placeholder for Khen's vow
- Added Soundboard module for playing custom audio clips
- Soundboard default beep and chime download from the web instead of shipping audio files
- Soundboard expanded to a 12-pad grid with keyboard shortcuts and removable custom clips

Backlog
- Add E2E test harness (Playwright) for layout assertions
- Accessibility pass for floating buttons and modals

