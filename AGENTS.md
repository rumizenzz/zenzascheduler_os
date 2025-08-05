# AGENT Instructions

These guidelines apply to the entire repository.

## Contribution workflow
- Keep `TODO.md` up to date with tasks that are finished and tasks that remain. This file summarizes the large feature list in `todo.md`.
- Always record every change, fix, bug fix, or new feature in `CHANGELOG.md`.
  Entries must follow the [Keep a Changelog](https://keepachangelog.com/) style
  with **Added**, **Changed**, **Fixed**, or **Removed** sections as needed.
  Copy the updated file to `zenzalife-scheduler/public/CHANGELOG.md` so the
  Change Log button shows the latest notes. No update is complete until this
  professional entry is added.
  Whenever `UPCOMING_RELEASES.md` is modified, mirror the list under a
  **Upcoming Releases** section within the `Unreleased` portion of the changelog.
  Each entry should note the release version and exact timestamp.
- Run `pnpm run lint` inside `zenzalife-scheduler` before committing changes.
- Commit with clear messages.

## Development tips
- Use `pnpm` for package management.
- Local development: `pnpm run dev` in `zenzalife-scheduler`.
- Build for production: `pnpm run build` in `zenzalife-scheduler`.

## Style# AGENT Instructions

These guidelines apply to the entire repository.

## Contribution workflow
- Keep `TODO.md` up to date with tasks that are finished and tasks that remain. This file summarizes the large feature list in `todo.md`.
- Always record every change, fix, bug fix, or new feature in `CHANGELOG.md`.
  Entries must follow the [Keep a Changelog](https://keepachangelog.com/) style
  with **Added**, **Changed**, **Fixed**, or **Removed** sections as needed.
  Copy the updated file to `zenzalife-scheduler/public/CHANGELOG.md` so the
  Change Log button shows the latest notes. No update is complete until this
  professional entry is added.
  Whenever `UPCOMING_RELEASES.md` is modified, mirror the list under a
  **Upcoming Releases** section within the `Unreleased` portion of the changelog.
  Each entry should note the release version and exact timestamp.
- Run `pnpm run lint` inside `zenzalife-scheduler` before committing changes.
- Commit with clear messages.

## Development tips
- Use `pnpm` for package management.
- Local development: `pnpm run dev` in `zenzalife-scheduler`.
- Build for production: `pnpm run build` in `zenzalife-scheduler`.

## Style
- Prefer TypeScript and keep formatting consistent (use Prettier or an equivalent formatter).

## Project tasks
`todo.md` lists the complete feature roadmap. Keep `TODO.md` updated as work
progresses. High level milestones:
- Supabase authentication setup
- Database schema design
- Storage bucket configuration
- Dreamlike React front end
- Edge Functions for automation
- Final deployment and testing

## Agent Directory
This repository uses a small collection of workflow agents modeled after the Minimax M1 process. Every agent documents actions here and in `TODO.md` so progress remains transparent.

### Codex Agent
**Role & responsibilities**: Implements code and documentation changes from user requests, runs lint tests, and updates `CHANGELOG.md`.

**Current abilities**: TypeScript development, Markdown docs, basic testing and linting.

**Known limitations**: No automatic CI integration and limited to manual updates.

**To improve**: Add CI hooks to automate lint/test, expand unit tests, and verify changelog sync.

**Recommendations**: Integrate with GitHub Actions to mimic world-class repositories from OpenAI or DeepMind.

**Change log**: see `CHANGELOG.md` for commit history.

### Documentation Agent
**Role & responsibilities**: Maintains `AGENTS.md` and `TODO.md` in sync with repository changes.

**Current abilities**: Writes summaries, organizes tasks, and logs reflections after each update.

**Known limitations**: Manual process; no automatic enforcement that docs stay current.

**To improve**: Create a pre-commit hook that refuses commits if these files are stale.

**Recommendations**: Adopt rigorous documentation standards similar to Meta FAIR and Anthropic open repos.

**Change log**: all updates recorded in `CHANGELOG.md`.

## World-Class Output Practices
All deliverables aim to match the polish of projects from OpenAI, DeepMind, Google Research, Anthropic, Meta FAIR, and Minimax. We follow Semantic Versioning, Keep a Changelog, clear commit messages, and linted TypeScript code. Future upgrades should benchmark UX and code quality against those organizations' public repositories.

## Continuous Improvement Policy
After completing a task, agents self-evaluate in `AGENTS.md` and append reflections to `TODO.md`. Feedback from maintainers or users becomes new tasks in `TODO.md` with links back to the relevant agent section. Major decisions are briefly explained in these files to keep motivation transparent.

### Codex Agent Reflection (2025-07-24 12:52 UTC)
- Fixed a misplaced closing tag in `VerseOfTheDay.tsx` so the favorite star renders correctly.
- Ran `pnpm run lint` to verify the component compiles without errors.

### Codex Agent Reflection (2025-07-31 22:34 UTC)
- Optimized Math Notebook with responsive height and scrollable tabs for better mobile and desktop UX.
- Confirmed styling changes compile by running `pnpm run lint`.

### Codex Agent Reflection (2025-07-31 22:53 UTC)
- Added right padding to Math Notebook tab bar so Change Log and Subscribe buttons don't hide tabs on mobile.
- Verified repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 02:13 UTC)
- Restyled Math Notebook with a spacious Google Keep-inspired masonry grid and default dark canvas.
- Confirmed repository lint passes via `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 11:21 UTC)
- Auto-populated the Math Notebook solver by scanning canvas text for equations and converting `^` to exponents.
- Verified the repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 12:48 UTC)
- Enabled Math Solver history so previous problems persist across sessions.
- Verified repository lint passes via `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 12:54 UTC)
- Synced Math Solver history with Supabase for cross-device persistence.
- Verified repository lint passes via `pnpm run lint`.
### Codex Agent Reflection (2025-08-01 11:40 UTC)
- Added timestamp display so Math Notebook dashboard cards show each note's last updated time from Supabase.
- Confirmed the project passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 12:57 UTC)
- Added text search to Task Notes history for quickly finding past comments.
- Verified the repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 13:34 UTC)
- Added a prominent search bar to Math Notebook home for filtering notebooks by title.
- Refined Task Notes history search with a clear icon and rounded styling.
- Confirmed repository lint passes via `pnpm run lint`.
### Codex Agent Reflection (2025-08-01 12:56 UTC)
- Enabled multiple scripture entries per day with Add Verse Entry button and per-verse editing.
- Verified repository passes lint with `pnpm run lint`.
### Codex Agent Reflection (2025-08-01 12:52 UTC)
- Added a Harold and the Purple Crayon & Vanilla Sky starfield to the Math Notebook so the canvas feels magical.
- Ran `pnpm run lint` to ensure the project passes linting.

### Codex Agent Reflection (2025-08-01 13:14 UTC)
- Introduced alarm-triggered Start Prayer recordings with organized prayer history and grace dish images.
### Codex Agent Reflection (2025-08-01 13:50 UTC)
- Added a live countdown timer for active fasts so users can see remaining time at a glance.
- Confirmed the project passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 14:06 UTC)
- Fixed active fast lookup to include user ID so TypeScript build passes.
- Verified repository lint passes via `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 14:56 UTC)
- Switched the fasting reminder to fire on the first Sunday of each month instead of the first day.
- Confirmed lint and build succeed with `pnpm run lint` and `pnpm run build`.
### Codex Agent Reflection (2025-08-01 13:48 UTC)
- Added a template picker so new Math Notebook entries can start as Math, Notes, Math & Notes, To-Do Lists, Journals, or Project Plans with custom names.
- Verified repository passes lint with `pnpm run lint`.
### Codex Agent Reflection (2025-08-01 13:30 UTC)
- Added a History button that opens Math Solver history in a Harold and the Purple Crayon & Vanilla Sky window.
- Verified the repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 13:55 UTC)
- Routed Math Notebook tab close confirmation through a portal so the modal appears above the canvas.
- Verified the repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 15:05 UTC)
- Refactored Math Notebook tab modals into variables rendered via portals outside the component return to resolve Netlify JSX closing tag errors.
- Ensured project builds cleanly by running `pnpm run lint` and `pnpm run build`.

### Codex Agent Reflection (2025-08-01 15:21 UTC)
- Expanded Math Notebook search to scan canvas text so notebooks surface by their contents.
- Confirmed the repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 15:55 UTC)
- Wrapped fasting reminder toast in a pointer-events-none container so it no longer covers calendar or bottom buttons.
- Verified the repository passes lint with `pnpm run lint`.
### Codex Agent Reflection (2025-08-01 15:51 UTC)
- Updated bug list access code to "ZENZASECRETS" so monthly reports stay hidden behind the correct secret.
- Verified repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 16:13 UTC)
- Added Settings safeguards so users can disable the entrance animation and sound with a Save Changes button.
- Confirmed lint passes with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 16:26 UTC)
- Persisted entrance animation and sound preferences in Supabase instead of local storage.
- Verified repository lint passes via `pnpm run lint`.
- Sanitized garbage schedule saves by converting blank address IDs to null.
- Confirmed repository passes lint and tests with `pnpm run lint` and `pnpm test`.
- Sorted daily and grace prayer lists chronologically with numbering so users can log unlimited prayers per day.
- Verified repository passes lint with `pnpm run lint`.
### Codex Agent Reflection (2025-08-01 16:10 UTC)
- Offset intermittent fasting reminder below top controls so buttons remain visible.
- Verified the repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 17:09 UTC)
- Ensured dashboard sections reset scroll position so new tabs open at the top.
- Verified the repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 17:26 UTC)
- Removed smooth scroll so dashboard tabs snap to the top immediately.
- Verified the repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 17:33 UTC)
- Disabled browser scroll restoration and scrolled before render so dashboard modules always open at the very top.
- Verified the repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 17:48 UTC)
- Reset window, document, and body scroll so dashboard sections always start at the top.
- Moved the calendar Add Task button above bottom controls so it stays visible.
- Verified the repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 18:13 UTC)
- Scrolled the root element on tab changes so modules never appear beneath the dashboard.
- Verified the repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 17:16 UTC)
- Unified timers and a stopwatch into a single Clock module with Harold and the Purple Crayon & Vanilla Sky styling.
- Verified the repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 17:26 UTC)
- Added Supabase-backed stopwatch history with quick-save labels and timer presets that can be expanded with custom durations.
- Verified the repository passes lint with `pnpm run lint`.


### Codex Agent Reflection (2025-08-01 17:53 UTC)
- Created Supabase tables for timer presets and stopwatches to fix missing relation errors.
- Verified the repository passes lint with `pnpm run lint`.
### Codex Agent Reflection (2025-08-01 17:09 UTC)
- Ensured dashboard sections reset scroll position so new tabs open at the top.
- Verified the repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 17:33 UTC)
- Added an All Day option to task scheduling so full-day events need no times.
- Verified repository lint passes with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 18:09 UTC)
- Darkened clock colors and timer preset buttons so timekeeping is easy to read.
- Verified repository passes lint with `pnpm run lint` and tests with `pnpm test`.# AGENT Instructions

These guidelines apply to the entire repository.

## Contribution workflow
- Keep `TODO.md` up to date with tasks that are finished and tasks that remain. This file summarizes the large feature list in `todo.md`.
- Always record every change, fix, bug fix, or new feature in `CHANGELOG.md`.
  Entries must follow the [Keep a Changelog](https://keepachangelog.com/) style
  with **Added**, **Changed**, **Fixed**, or **Removed** sections as needed.
  Copy the updated file to `zenzalife-scheduler/public/CHANGELOG.md` so the
  Change Log button shows the latest notes. No update is complete until this
  professional entry is added.
  Whenever `UPCOMING_RELEASES.md` is modified, mirror the list under a
  **Upcoming Releases** section within the `Unreleased` portion of the changelog.
  Each entry should note the release version and exact timestamp.
- Run `pnpm run lint` inside `zenzalife-scheduler` before committing changes.
- Commit with clear messages.

## Development tips
- Use `pnpm` for package management.
- Local development: `pnpm run dev` in `zenzalife-scheduler`.
- Build for production: `pnpm run build` in `zenzalife-scheduler`.

## Style
- Prefer TypeScript and keep formatting consistent (use Prettier or an equivalent formatter).

## Project tasks
`todo.md` lists the complete feature roadmap. Keep `TODO.md` updated as work
progresses. High level milestones:
- Supabase authentication setup
- Database schema design
- Storage bucket configuration
- Dreamlike React front end
- Edge Functions for automation
- Final deployment and testing

## Agent Directory
This repository uses a small collection of workflow agents modeled after the Minimax M1 process. Every agent documents actions here and in `TODO.md` so progress remains transparent.

### Codex Agent
**Role & responsibilities**: Implements code and documentation changes from user requests, runs lint tests, and updates `CHANGELOG.md`.

**Current abilities**: TypeScript development, Markdown docs, basic testing and linting.

**Known limitations**: No automatic CI integration and limited to manual updates.

**To improve**: Add CI hooks to automate lint/test, expand unit tests, and verify changelog sync.

**Recommendations**: Integrate with GitHub Actions to mimic world-class repositories from OpenAI or DeepMind.

**Change log**: see `CHANGELOG.md` for commit history.

### Documentation Agent
**Role & responsibilities**: Maintains `AGENTS.md` and `TODO.md` in sync with repository changes.

**Current abilities**: Writes summaries, organizes tasks, and logs reflections after each update.

**Known limitations**: Manual process; no automatic enforcement that docs stay current.

**To improve**: Create a pre-commit hook that refuses commits if these files are stale.

**Recommendations**: Adopt rigorous documentation standards similar to Meta FAIR and Anthropic open repos.

**Change log**: all updates recorded in `CHANGELOG.md`.

## World-Class Output Practices
All deliverables aim to match the polish of projects from OpenAI, DeepMind, Google Research, Anthropic, Meta FAIR, and Minimax. We follow Semantic Versioning, Keep a Changelog, clear commit messages, and linted TypeScript code. Future upgrades should benchmark UX and code quality against those organizations' public repositories.

## Continuous Improvement Policy
After completing a task, agents self-evaluate in `AGENTS.md` and append reflections to `TODO.md`. Feedback from maintainers or users becomes new tasks in `TODO.md` with links back to the relevant agent section. Major decisions are briefly explained in these files to keep motivation transparent.

### Codex Agent Reflection (2025-07-24 12:52 UTC)
- Fixed a misplaced closing tag in `VerseOfTheDay.tsx` so the favorite star renders correctly.
- Ran `pnpm run lint` to verify the component compiles without errors.

### Codex Agent Reflection (2025-07-31 22:34 UTC)
- Optimized Math Notebook with responsive height and scrollable tabs for better mobile and desktop UX.
- Confirmed styling changes compile by running `pnpm run lint`.

### Codex Agent Reflection (2025-07-31 22:53 UTC)
- Added right padding to Math Notebook tab bar so Change Log and Subscribe buttons don't hide tabs on mobile.
- Verified repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 02:13 UTC)
- Restyled Math Notebook with a spacious Google Keep-inspired masonry grid and default dark canvas.
- Confirmed repository lint passes via `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 11:21 UTC)
- Auto-populated the Math Notebook solver by scanning canvas text for equations and converting `^` to exponents.
- Verified the repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 12:48 UTC)
- Enabled Math Solver history so previous problems persist across sessions.
- Verified repository lint passes via `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 12:54 UTC)
- Synced Math Solver history with Supabase for cross-device persistence.
- Verified repository lint passes via `pnpm run lint`.
### Codex Agent Reflection (2025-08-01 11:40 UTC)
- Added timestamp display so Math Notebook dashboard cards show each note's last updated time from Supabase.
- Confirmed the project passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 12:57 UTC)
- Added text search to Task Notes history for quickly finding past comments.
- Verified the repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 13:34 UTC)
- Added a prominent search bar to Math Notebook home for filtering notebooks by title.
- Refined Task Notes history search with a clear icon and rounded styling.
- Confirmed repository lint passes via `pnpm run lint`.
### Codex Agent Reflection (2025-08-01 12:56 UTC)
- Enabled multiple scripture entries per day with Add Verse Entry button and per-verse editing.
- Verified repository passes lint with `pnpm run lint`.
### Codex Agent Reflection (2025-08-01 12:52 UTC)
- Added a Harold and the Purple Crayon & Vanilla Sky starfield to the Math Notebook so the canvas feels magical.
- Ran `pnpm run lint` to ensure the project passes linting.

### Codex Agent Reflection (2025-08-01 13:14 UTC)
- Introduced alarm-triggered Start Prayer recordings with organized prayer history and grace dish images.
### Codex Agent Reflection (2025-08-01 13:50 UTC)
- Added a live countdown timer for active fasts so users can see remaining time at a glance.
- Confirmed the project passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 14:06 UTC)
- Fixed active fast lookup to include user ID so TypeScript build passes.
- Verified repository lint passes via `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 14:56 UTC)
- Switched the fasting reminder to fire on the first Sunday of each month instead of the first day.
- Confirmed lint and build succeed with `pnpm run lint` and `pnpm run build`.
### Codex Agent Reflection (2025-08-01 13:48 UTC)
- Added a template picker so new Math Notebook entries can start as Math, Notes, Math & Notes, To-Do Lists, Journals, or Project Plans with custom names.
- Verified repository passes lint with `pnpm run lint`.
### Codex Agent Reflection (2025-08-01 13:30 UTC)
- Added a History button that opens Math Solver history in a Harold and the Purple Crayon & Vanilla Sky window.
- Verified the repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 13:55 UTC)
- Routed Math Notebook tab close confirmation through a portal so the modal appears above the canvas.
- Verified the repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 15:05 UTC)
- Refactored Math Notebook tab modals into variables rendered via portals outside the component return to resolve Netlify JSX closing tag errors.
- Ensured project builds cleanly by running `pnpm run lint` and `pnpm run build`.

### Codex Agent Reflection (2025-08-01 15:21 UTC)
- Expanded Math Notebook search to scan canvas text so notebooks surface by their contents.
- Confirmed the repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 15:55 UTC)
- Wrapped fasting reminder toast in a pointer-events-none container so it no longer covers calendar or bottom buttons.
- Verified the repository passes lint with `pnpm run lint`.
### Codex Agent Reflection (2025-08-01 15:51 UTC)
- Updated bug list access code to "ZENZASECRETS" so monthly reports stay hidden behind the correct secret.
- Verified repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 16:13 UTC)
- Added Settings safeguards so users can disable the entrance animation and sound with a Save Changes button.
- Confirmed lint passes with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 16:26 UTC)
- Persisted entrance animation and sound preferences in Supabase instead of local storage.
- Verified repository lint passes via `pnpm run lint`.
- Sanitized garbage schedule saves by converting blank address IDs to null.
- Confirmed repository passes lint and tests with `pnpm run lint` and `pnpm test`.
- Sorted daily and grace prayer lists chronologically with numbering so users can log unlimited prayers per day.
- Verified repository passes lint with `pnpm run lint`.
### Codex Agent Reflection (2025-08-01 16:10 UTC)
- Offset intermittent fasting reminder below top controls so buttons remain visible.
- Verified the repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 17:09 UTC)
- Ensured dashboard sections reset scroll position so new tabs open at the top.
- Verified the repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 17:26 UTC)
- Removed smooth scroll so dashboard tabs snap to the top immediately.
- Verified the repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 17:33 UTC)
- Disabled browser scroll restoration and scrolled before render so dashboard modules always open at the very top.
- Verified the repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 17:48 UTC)
- Reset window, document, and body scroll so dashboard sections always start at the top.
- Moved the calendar Add Task button above bottom controls so it stays visible.
- Verified the repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 18:13 UTC)
- Scrolled the root element on tab changes so modules never appear beneath the dashboard.
- Verified the repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 17:16 UTC)
- Unified timers and a stopwatch into a single Clock module with Harold and the Purple Crayon & Vanilla Sky styling.
- Verified the repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 17:26 UTC)
- Added Supabase-backed stopwatch history with quick-save labels and timer presets that can be expanded with custom durations.
- Verified the repository passes lint with `pnpm run lint`.


### Codex Agent Reflection (2025-08-01 17:53 UTC)
- Created Supabase tables for timer presets and stopwatches to fix missing relation errors.
- Verified the repository passes lint with `pnpm run lint`.
### Codex Agent Reflection (2025-08-01 17:09 UTC)
- Ensured dashboard sections reset scroll position so new tabs open at the top.
- Verified the repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 17:33 UTC)
- Added an All Day option to task scheduling so full-day events need no times.
- Verified repository lint passes with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 18:09 UTC)
- Darkened clock colors and timer preset buttons so timekeeping is easy to read.
- Verified repository passes lint with `pnpm run lint` and tests with `pnpm test`.

### Codex Agent Reflection (2025-08-01 18:30 UTC)
- Added timer delete controls and persisted dashboard tab selections in Supabase.
- Verified the repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 20:12 UTC)
- Introduced magical Journal and Lucid Dream Journal modules with Supabase persistence.
- Verified lint and tests pass with `pnpm run lint` and `pnpm test`.

### Codex Agent Reflection (2025-08-01 20:55 UTC)
- Constrained all-day task start dates to date-only values to remove browser format warnings.
- Verified the repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-04 22:47 UTC)
- Moved dashboard main content to a top-level p-6 div so modules render first.
- Verified the repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-04 23:06 UTC)
- Corrected Lucid Dream Journal history portal syntax to resolve TypeScript build errors.
- Confirmed repository lint passes with `pnpm run lint`.

### Codex Agent Reflection (2025-08-04 23:19 UTC)
- Reordered dashboard layout so the sidebar renders before the p-6 main container, keeping navigation above modules.
- Verified lint and build succeed with `pnpm run lint` and `pnpm run build`.

### Codex Agent Reflection (2025-08-04 23:55 UTC)
- Moved the sidebar after the p-6 main container and relied on a fixed z-index so navigation stays visible while content renders first.
- Confirmed lint and build pass with `pnpm run lint` and `pnpm run build`.

### Codex Agent Reflection (2025-08-02 04:09 UTC)
- Added quick Current Time buttons so tasks can start now or end after 5, 10, 30, or 60 minutes.
- Verified the repository passes lint with `pnpm run lint`.
### Codex Agent Reflection (2025-08-02 04:20 UTC)
- Added a Diff Viewer option to the Tools menu so code changes can be compared side by side.
- Verified the repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 21:12 UTC)
- Enhanced Monthsary and Anniversary hover effects with floating hearts for a loving celebration.
- Synced changelog and TODO tracker and verified lint with `pnpm run lint`.
# AGENT Instructions

These guidelines apply to the entire repository.

## Contribution workflow
- Keep `TODO.md` up to date with tasks that are finished and tasks that remain. This file summarizes the large feature list in `todo.md`.
- Always record every change, fix, bug fix, or new feature in `CHANGELOG.md`.
  Entries must follow the [Keep a Changelog](https://keepachangelog.com/) style
  with **Added**, **Changed**, **Fixed**, or **Removed** sections as needed.
  Copy the updated file to `zenzalife-scheduler/public/CHANGELOG.md` so the
  Change Log button shows the latest notes. No update is complete until this
  professional entry is added.
  Whenever `UPCOMING_RELEASES.md` is modified, mirror the list under a
  **Upcoming Releases** section within the `Unreleased` portion of the changelog.
  Each entry should note the release version and exact timestamp.
- Run `pnpm run lint` inside `zenzalife-scheduler` before committing changes.
- Commit with clear messages.

## Development tips
- Use `pnpm` for package management.
- Local development: `pnpm run dev` in `zenzalife-scheduler`.
- Build for production: `pnpm run build` in `zenzalife-scheduler`.

## Style
- Prefer TypeScript and keep formatting consistent (use Prettier or an equivalent formatter).

## Project tasks
`todo.md` lists the complete feature roadmap. Keep `TODO.md` updated as work
progresses. High level milestones:
- Supabase authentication setup
- Database schema design
- Storage bucket configuration
- Dreamlike React front end
- Edge Functions for automation
- Final deployment and testing

## Agent Directory
This repository uses a small collection of workflow agents modeled after the Minimax M1 process. Every agent documents actions here and in `TODO.md` so progress remains transparent.

### Codex Agent
**Role & responsibilities**: Implements code and documentation changes from user requests, runs lint tests, and updates `CHANGELOG.md`.

**Current abilities**: TypeScript development, Markdown docs, basic testing and linting.

**Known limitations**: No automatic CI integration and limited to manual updates.

**To improve**: Add CI hooks to automate lint/test, expand unit tests, and verify changelog sync.

**Recommendations**: Integrate with GitHub Actions to mimic world-class repositories from OpenAI or DeepMind.

**Change log**: see `CHANGELOG.md` for commit history.

### Documentation Agent
**Role & responsibilities**: Maintains `AGENTS.md` and `TODO.md` in sync with repository changes.

**Current abilities**: Writes summaries, organizes tasks, and logs reflections after each update.

**Known limitations**: Manual process; no automatic enforcement that docs stay current.

**To improve**: Create a pre-commit hook that refuses commits if these files are stale.

**Recommendations**: Adopt rigorous documentation standards similar to Meta FAIR and Anthropic open repos.

**Change log**: all updates recorded in `CHANGELOG.md`.

## World-Class Output Practices
All deliverables aim to match the polish of projects from OpenAI, DeepMind, Google Research, Anthropic, Meta FAIR, and Minimax. We follow Semantic Versioning, Keep a Changelog, clear commit messages, and linted TypeScript code. Future upgrades should benchmark UX and code quality against those organizations' public repositories.

## Continuous Improvement Policy
After completing a task, agents self-evaluate in `AGENTS.md` and append reflections to `TODO.md`. Feedback from maintainers or users becomes new tasks in `TODO.md` with links back to the relevant agent section. Major decisions are briefly explained in these files to keep motivation transparent.

### Codex Agent Reflection (2025-07-24 12:52 UTC)
- Fixed a misplaced closing tag in `VerseOfTheDay.tsx` so the favorite star renders correctly.
- Ran `pnpm run lint` to verify the component compiles without errors.

### Codex Agent Reflection (2025-07-31 22:34 UTC)
- Optimized Math Notebook with responsive height and scrollable tabs for better mobile and desktop UX.
- Confirmed styling changes compile by running `pnpm run lint`.

### Codex Agent Reflection (2025-07-31 22:53 UTC)
- Added right padding to Math Notebook tab bar so Change Log and Subscribe buttons don't hide tabs on mobile.
- Verified repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 02:13 UTC)
- Restyled Math Notebook with a spacious Google Keep-inspired masonry grid and default dark canvas.
- Confirmed repository lint passes via `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 11:21 UTC)
- Auto-populated the Math Notebook solver by scanning canvas text for equations and converting `^` to exponents.
- Verified the repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 12:48 UTC)
- Enabled Math Solver history so previous problems persist across sessions.
- Verified repository lint passes via `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 12:54 UTC)
- Synced Math Solver history with Supabase for cross-device persistence.
- Verified repository lint passes via `pnpm run lint`.
### Codex Agent Reflection (2025-08-01 11:40 UTC)
- Added timestamp display so Math Notebook dashboard cards show each note's last updated time from Supabase.
- Confirmed the project passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 12:57 UTC)
- Added text search to Task Notes history for quickly finding past comments.
- Verified the repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 13:34 UTC)
- Added a prominent search bar to Math Notebook home for filtering notebooks by title.
- Refined Task Notes history search with a clear icon and rounded styling.
- Confirmed repository lint passes via `pnpm run lint`.
### Codex Agent Reflection (2025-08-01 12:56 UTC)
- Enabled multiple scripture entries per day with Add Verse Entry button and per-verse editing.
- Verified repository passes lint with `pnpm run lint`.
### Codex Agent Reflection (2025-08-01 12:52 UTC)
- Added a Harold and the Purple Crayon & Vanilla Sky starfield to the Math Notebook so the canvas feels magical.
- Ran `pnpm run lint` to ensure the project passes linting.

### Codex Agent Reflection (2025-08-01 13:14 UTC)
- Introduced alarm-triggered Start Prayer recordings with organized prayer history and grace dish images.
### Codex Agent Reflection (2025-08-01 13:50 UTC)
- Added a live countdown timer for active fasts so users can see remaining time at a glance.
- Confirmed the project passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 14:06 UTC)
- Fixed active fast lookup to include user ID so TypeScript build passes.
- Verified repository lint passes via `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 14:56 UTC)
- Switched the fasting reminder to fire on the first Sunday of each month instead of the first day.
- Confirmed lint and build succeed with `pnpm run lint` and `pnpm run build`.
### Codex Agent Reflection (2025-08-01 13:48 UTC)
- Added a template picker so new Math Notebook entries can start as Math, Notes, Math & Notes, To-Do Lists, Journals, or Project Plans with custom names.
- Verified repository passes lint with `pnpm run lint`.
### Codex Agent Reflection (2025-08-01 13:30 UTC)
- Added a History button that opens Math Solver history in a Harold and the Purple Crayon & Vanilla Sky window.
- Verified the repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 13:55 UTC)
- Routed Math Notebook tab close confirmation through a portal so the modal appears above the canvas.
- Verified the repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 15:05 UTC)
- Refactored Math Notebook tab modals into variables rendered via portals outside the component return to resolve Netlify JSX closing tag errors.
- Ensured project builds cleanly by running `pnpm run lint` and `pnpm run build`.

### Codex Agent Reflection (2025-08-01 15:21 UTC)
- Expanded Math Notebook search to scan canvas text so notebooks surface by their contents.
- Confirmed the repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 15:55 UTC)
- Wrapped fasting reminder toast in a pointer-events-none container so it no longer covers calendar or bottom buttons.
- Verified the repository passes lint with `pnpm run lint`.
### Codex Agent Reflection (2025-08-01 15:51 UTC)
- Updated bug list access code to "ZENZASECRETS" so monthly reports stay hidden behind the correct secret.
- Verified repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 16:13 UTC)
- Added Settings safeguards so users can disable the entrance animation and sound with a Save Changes button.
- Confirmed lint passes with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 16:26 UTC)
- Persisted entrance animation and sound preferences in Supabase instead of local storage.
- Verified repository lint passes via `pnpm run lint`.
- Sanitized garbage schedule saves by converting blank address IDs to null.
- Confirmed repository passes lint and tests with `pnpm run lint` and `pnpm test`.
- Sorted daily and grace prayer lists chronologically with numbering so users can log unlimited prayers per day.
- Verified repository passes lint with `pnpm run lint`.
### Codex Agent Reflection (2025-08-01 16:10 UTC)
- Offset intermittent fasting reminder below top controls so buttons remain visible.
- Verified the repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 17:09 UTC)
- Ensured dashboard sections reset scroll position so new tabs open at the top.
- Verified the repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 17:26 UTC)
- Removed smooth scroll so dashboard tabs snap to the top immediately.
- Verified the repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 17:33 UTC)
- Disabled browser scroll restoration and scrolled before render so dashboard modules always open at the very top.
- Verified the repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 17:48 UTC)
- Reset window, document, and body scroll so dashboard sections always start at the top.
- Moved the calendar Add Task button above bottom controls so it stays visible.
- Verified the repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 18:13 UTC)
- Scrolled the root element on tab changes so modules never appear beneath the dashboard.
- Verified the repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 17:16 UTC)
- Unified timers and a stopwatch into a single Clock module with Harold and the Purple Crayon & Vanilla Sky styling.
- Verified the repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 17:26 UTC)
- Added Supabase-backed stopwatch history with quick-save labels and timer presets that can be expanded with custom durations.
- Verified the repository passes lint with `pnpm run lint`.


### Codex Agent Reflection (2025-08-01 17:53 UTC)
- Created Supabase tables for timer presets and stopwatches to fix missing relation errors.
- Verified the repository passes lint with `pnpm run lint`.
### Codex Agent Reflection (2025-08-01 17:09 UTC)
- Ensured dashboard sections reset scroll position so new tabs open at the top.
- Verified the repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 17:33 UTC)
- Added an All Day option to task scheduling so full-day events need no times.
- Verified repository lint passes with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 18:09 UTC)
- Darkened clock colors and timer preset buttons so timekeeping is easy to read.
- Verified repository passes lint with `pnpm run lint` and tests with `pnpm test`.

### Codex Agent Reflection (2025-08-01 18:30 UTC)
- Added timer delete controls and persisted dashboard tab selections in Supabase.
- Verified the repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 18:51 UTC)
- Added Garbage & Recycling schedules to the Reminders countdown so collection days aren't missed.
- Verified repository passes lint with `pnpm run lint` and tests with `pnpm test`.

### Codex Agent Reflection (2025-08-01 19:05 UTC)
- Removed duplicate variable declarations in RemindersButton and ClockModule to fix Netlify TypeScript build errors.
- Confirmed the project passes lint and tests with `pnpm run lint` and `pnpm test`.

### Codex Agent Reflection (2025-08-01 21:30 UTC)
- "See All Reminders" now opens a Harold and the Purple Crayon & Vanilla Sky window above the existing panel.
- Verified the repository passes lint and tests with `pnpm run lint` and `pnpm test`.

### Codex Agent Reflection (2025-08-01 20:12 UTC)
- Introduced magical Journal and Lucid Dream Journal modules with Supabase persistence.
- Verified lint and tests pass with `pnpm run lint` and `pnpm test`.

### Codex Agent Reflection (2025-08-01 20:55 UTC)
- Constrained all-day task start dates to date-only values to remove browser format warnings.
- Verified the repository passes lint with `pnpm run lint`.


### Codex Agent Reflection (2025-08-01 18:30 UTC)
- Added timer delete controls and persisted dashboard tab selections in Supabase.
- Verified the repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 20:12 UTC)
- Introduced magical Journal and Lucid Dream Journal modules with Supabase persistence.
- Verified lint and tests pass with `pnpm run lint` and `pnpm test`.

### Codex Agent Reflection (2025-08-01 20:55 UTC)
- Constrained all-day task start dates to date-only values to remove browser format warnings.
- Verified the repository passes lint with `pnpm run lint`.

- Prefer TypeScript and keep formatting consistent (use Prettier or an equivalent formatter).

## Project tasks
`todo.md` lists the complete feature roadmap. Keep `TODO.md` updated as work
progresses. High level milestones:
- Supabase authentication setup
- Database schema design
- Storage bucket configuration
- Dreamlike React front end
- Edge Functions for automation
- Final deployment and testing

## Agent Directory
This repository uses a small collection of workflow agents modeled after the Minimax M1 process. Every agent documents actions here and in `TODO.md` so progress remains transparent.

### Codex Agent
**Role & responsibilities**: Implements code and documentation changes from user requests, runs lint tests, and updates `CHANGELOG.md`.

**Current abilities**: TypeScript development, Markdown docs, basic testing and linting.

**Known limitations**: No automatic CI integration and limited to manual updates.

**To improve**: Add CI hooks to automate lint/test, expand unit tests, and verify changelog sync.

**Recommendations**: Integrate with GitHub Actions to mimic world-class repositories from OpenAI or DeepMind.

**Change log**: see `CHANGELOG.md` for commit history.

### Documentation Agent
**Role & responsibilities**: Maintains `AGENTS.md` and `TODO.md` in sync with repository changes.

**Current abilities**: Writes summaries, organizes tasks, and logs reflections after each update.

**Known limitations**: Manual process; no automatic enforcement that docs stay current.

**To improve**: Create a pre-commit hook that refuses commits if these files are stale.

**Recommendations**: Adopt rigorous documentation standards similar to Meta FAIR and Anthropic open repos.

**Change log**: all updates recorded in `CHANGELOG.md`.

## World-Class Output Practices
All deliverables aim to match the polish of projects from OpenAI, DeepMind, Google Research, Anthropic, Meta FAIR, and Minimax. We follow Semantic Versioning, Keep a Changelog, clear commit messages, and linted TypeScript code. Future upgrades should benchmark UX and code quality against those organizations' public repositories.

## Continuous Improvement Policy
After completing a task, agents self-evaluate in `AGENTS.md` and append reflections to `TODO.md`. Feedback from maintainers or users becomes new tasks in `TODO.md` with links back to the relevant agent section. Major decisions are briefly explained in these files to keep motivation transparent.

### Codex Agent Reflection (2025-07-24 12:52 UTC)
- Fixed a misplaced closing tag in `VerseOfTheDay.tsx` so the favorite star renders correctly.
- Ran `pnpm run lint` to verify the component compiles without errors.

### Codex Agent Reflection (2025-07-31 22:34 UTC)
- Optimized Math Notebook with responsive height and scrollable tabs for better mobile and desktop UX.
- Confirmed styling changes compile by running `pnpm run lint`.

### Codex Agent Reflection (2025-07-31 22:53 UTC)
- Added right padding to Math Notebook tab bar so Change Log and Subscribe buttons don't hide tabs on mobile.
- Verified repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 02:13 UTC)
- Restyled Math Notebook with a spacious Google Keep-inspired masonry grid and default dark canvas.
- Confirmed repository lint passes via `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 11:21 UTC)
- Auto-populated the Math Notebook solver by scanning canvas text for equations and converting `^` to exponents.
- Verified the repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 12:48 UTC)
- Enabled Math Solver history so previous problems persist across sessions.
- Verified repository lint passes via `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 12:54 UTC)
- Synced Math Solver history with Supabase for cross-device persistence.
- Verified repository lint passes via `pnpm run lint`.
### Codex Agent Reflection (2025-08-01 11:40 UTC)
- Added timestamp display so Math Notebook dashboard cards show each note's last updated time from Supabase.
- Confirmed the project passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 12:57 UTC)
- Added text search to Task Notes history for quickly finding past comments.
- Verified the repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 13:34 UTC)
- Added a prominent search bar to Math Notebook home for filtering notebooks by title.
- Refined Task Notes history search with a clear icon and rounded styling.
- Confirmed repository lint passes via `pnpm run lint`.
### Codex Agent Reflection (2025-08-01 12:56 UTC)
- Enabled multiple scripture entries per day with Add Verse Entry button and per-verse editing.
- Verified repository passes lint with `pnpm run lint`.
### Codex Agent Reflection (2025-08-01 12:52 UTC)
- Added a Harold and the Purple Crayon & Vanilla Sky starfield to the Math Notebook so the canvas feels magical.
- Ran `pnpm run lint` to ensure the project passes linting.

### Codex Agent Reflection (2025-08-01 13:14 UTC)
- Introduced alarm-triggered Start Prayer recordings with organized prayer history and grace dish images.
### Codex Agent Reflection (2025-08-01 13:50 UTC)
- Added a live countdown timer for active fasts so users can see remaining time at a glance.
- Confirmed the project passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 14:06 UTC)
- Fixed active fast lookup to include user ID so TypeScript build passes.
- Verified repository lint passes via `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 14:56 UTC)
- Switched the fasting reminder to fire on the first Sunday of each month instead of the first day.
- Confirmed lint and build succeed with `pnpm run lint` and `pnpm run build`.
### Codex Agent Reflection (2025-08-01 13:48 UTC)
- Added a template picker so new Math Notebook entries can start as Math, Notes, Math & Notes, To-Do Lists, Journals, or Project Plans with custom names.
- Verified repository passes lint with `pnpm run lint`.
### Codex Agent Reflection (2025-08-01 13:30 UTC)
- Added a History button that opens Math Solver history in a Harold and the Purple Crayon & Vanilla Sky window.
- Verified the repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 13:55 UTC)
- Routed Math Notebook tab close confirmation through a portal so the modal appears above the canvas.
- Verified the repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 15:05 UTC)
- Refactored Math Notebook tab modals into variables rendered via portals outside the component return to resolve Netlify JSX closing tag errors.
- Ensured project builds cleanly by running `pnpm run lint` and `pnpm run build`.

### Codex Agent Reflection (2025-08-01 15:21 UTC)
- Expanded Math Notebook search to scan canvas text so notebooks surface by their contents.
- Confirmed the repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 15:55 UTC)
- Wrapped fasting reminder toast in a pointer-events-none container so it no longer covers calendar or bottom buttons.
- Verified the repository passes lint with `pnpm run lint`.
### Codex Agent Reflection (2025-08-01 15:51 UTC)
- Updated bug list access code to "ZENZASECRETS" so monthly reports stay hidden behind the correct secret.
- Verified repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 16:13 UTC)
- Added Settings safeguards so users can disable the entrance animation and sound with a Save Changes button.
- Confirmed lint passes with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 16:26 UTC)
- Persisted entrance animation and sound preferences in Supabase instead of local storage.
- Verified repository lint passes via `pnpm run lint`.
- Sanitized garbage schedule saves by converting blank address IDs to null.
- Confirmed repository passes lint and tests with `pnpm run lint` and `pnpm test`.
- Sorted daily and grace prayer lists chronologically with numbering so users can log unlimited prayers per day.
- Verified repository passes lint with `pnpm run lint`.
### Codex Agent Reflection (2025-08-01 16:10 UTC)
- Offset intermittent fasting reminder below top controls so buttons remain visible.
- Verified the repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 17:09 UTC)
- Ensured dashboard sections reset scroll position so new tabs open at the top.
- Verified the repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 17:26 UTC)
- Removed smooth scroll so dashboard tabs snap to the top immediately.
- Verified the repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 17:33 UTC)
- Disabled browser scroll restoration and scrolled before render so dashboard modules always open at the very top.
- Verified the repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 17:48 UTC)
- Reset window, document, and body scroll so dashboard sections always start at the top.
- Moved the calendar Add Task button above bottom controls so it stays visible.
- Verified the repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 18:13 UTC)
- Scrolled the root element on tab changes so modules never appear beneath the dashboard.
- Verified the repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 17:16 UTC)
- Unified timers and a stopwatch into a single Clock module with Harold and the Purple Crayon & Vanilla Sky styling.
- Verified the repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 17:26 UTC)
- Added Supabase-backed stopwatch history with quick-save labels and timer presets that can be expanded with custom durations.
- Verified the repository passes lint with `pnpm run lint`.


### Codex Agent Reflection (2025-08-01 17:53 UTC)
- Created Supabase tables for timer presets and stopwatches to fix missing relation errors.
- Verified the repository passes lint with `pnpm run lint`.
### Codex Agent Reflection (2025-08-01 17:09 UTC)
- Ensured dashboard sections reset scroll position so new tabs open at the top.
- Verified the repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 17:33 UTC)
- Added an All Day option to task scheduling so full-day events need no times.
- Verified repository lint passes with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 18:09 UTC)
- Darkened clock colors and timer preset buttons so timekeeping is easy to read.
- Verified repository passes lint with `pnpm run lint` and tests with `pnpm test`.

### Codex Agent Reflection (2025-08-01 18:30 UTC)
- Added timer delete controls and persisted dashboard tab selections in Supabase.
- Verified the repository passes lint with `pnpm run lint`.

### Codex Agent Reflection (2025-08-01 20:12 UTC)
- Introduced magical Journal and Lucid Dream Journal modules with Supabase persistence.
- Verified lint and tests pass with `pnpm run lint` and `pnpm test`.

### Codex Agent Reflection (2025-08-01 20:55 UTC)
- Constrained all-day task start dates to date-only values to remove browser format warnings.
- Verified the repository passes lint with `pnpm run lint`.
### Codex Agent Reflection (2025-08-05 00:10 UTC)
- Reordered dashboard so the sidebar renders before the p-6 main container, keeping navigation visible while modules mount.
- Confirmed the project passes lint and build with `pnpm run lint` and `pnpm run build`.

### Codex Agent Reflection (2025-08-05 00:27 UTC)
- Moved reminders and overlay buttons after the p-6 dashboard container so modules always load on top.
- Verified lint and build succeed with `pnpm run lint` and `pnpm run build`.

### Codex Agent Reflection (2025-08-05 00:45 UTC)
- Switched to an injectManifest service worker so cached responses avoid null-body `Response` errors.
- Confirmed the project passes lint and build with `pnpm run lint` and `pnpm run build`.
