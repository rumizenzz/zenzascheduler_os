ZenzaScheduler OS — TODO

- Track and triage UI regressions (e.g., content under headers/sidebar)
- Synced scheduler pnpm lockfile with lottie-web dependency to fix Netlify install errors
- Build pipeline: ensure pnpm availability on Windows; document dev setup
- Calendar: verify sticky header layering across all tabs/modals
- Safe-area: confirm padding on iOS PWA and Android Chrome
- Pull-to-refresh: verify overlay z-index doesn’t occlude content
- Sidebar: confirm collapse/expand restores correct margins at md+ widths
- Tests: add basic UI smoke tests for header overlap and z-order
- Docs: add CONTRIBUTING with local run/build instructions

Backlog
- Add E2E test harness (Playwright) for layout assertions
- Accessibility pass for floating buttons and modals

