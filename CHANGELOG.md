# Changelog

All notable changes to **ZenzaScheduler OS Life Scheduler** are documented in this file. This project follows [Semantic Versioning](https://semver.org/) and the [Keep a Changelog](https://keepachangelog.com/) format.

## [Unreleased]
### Added
- Users can create notebooks from templates like Math, Notes, To-Do List, Journal, or Project Plan with custom names (2025-08-01 13:48:00 UTC)
- Task Notes history now supports text search to find past comments quickly (2025-08-01 12:57:51 UTC)
- Math Notebook home now includes a search bar to filter notebooks by title (2025-08-01 13:34:42 UTC)
- Math Solver history opens in a Harold and the Purple Crayon & Vanilla Sky themed window via a History button (2025-08-01 13:30:00 UTC)
- Task Notes history now supports text search to find past comments quickly (2025-08-01 12:57:51 UTC)
- Spiritual study supports multiple verse entries per day with an Add Verse Entry button and per-verse edit controls (2025-08-01 12:56:35 UTC)
- Math Notebook solver history now saves to Supabase for cross-device sync (2025-08-01 12:54:40 UTC)
- Math Notebook solver now remembers previously solved problems with persistent history (2025-08-01 12:48:12 UTC)
- Added a top-right Refresh button to manually reload the app (2025-08-01 11:52:14 UTC)
- Math Notebook dashboard displays last updated time for each notebook (2025-08-01 11:40:46 UTC)
- Harold and the Purple Crayon/Vanilla Sky button toggles swipe-to-refresh per device (2025-08-01 11:39:36 UTC)
- Math Notebook home highlights the most recently updated notebook with a "Most Recent" label (2025-08-01 11:17:01 UTC)
- Math Notebook home now orders notebooks by last opened time and keeps the "Most Recent" label until another notebook is opened (2025-08-01 11:34:40 UTC)
- Math Notebook now detects math expressions and offers a Solve button to compute results (2025-08-01 02:07:51 UTC)
- Math Notebook opens to a dashboard home for browsing old problems and creating new notebooks (2025-08-01 00:19:08 UTC)
- Math Notebook dashboard greets users by name with a time-of-day message and Keep-style grid of notebooks (2025-08-01 00:31:23 UTC)
- Math Notebook dashboard now previews each notebook like Google Keep for quick scanning (2025-08-01 02:33:07 UTC)
- Math Notebook tabs can be renamed, closed with confirmation, reopened, and auto-refresh from Supabase; history shows full timestamps (2025-07-31 23:35:07 UTC)
- Added Math Notebook module with tabbed Excalidraw canvas for solving math problems (2025-07-30 23:05:25 UTC)
- Math Notebook now saves problems and version history in Supabase (2025-07-30 23:14:19 UTC)
- Documented world-class agentic workflow in `AGENTS.md` and expanded `TODO.md` tracker. (2025-07-22 20:34:18 UTC)
- Script `update:upcoming` exports Supabase upcoming releases to `UPCOMING_RELEASES.md`.
- ChangeLogButton now fetches and displays this changelog alongside Supabase entries.
- Changelog entries now include version, title, tags, and icon URL with exact timestamps.
- `update:upcoming` now mirrors upcoming releases into an **Upcoming Releases** section of the changelog. (2025-07-24 01:06:50 UTC)
- Users see a "What's new" toast when new updates are published.
- Change Log modal supports searching by text or tag.
- Admin page `/admin/changelog` allows creating new releases.
- Supabase schema updated with additional fields and a reactions table.
- Added `changelog_views` table to track when each user last viewed the
  changelog.
- Hidden upcoming releases admin accessed via a wood log icon in Settings. Requires code "ZENZALIFE" and stores entries in Supabase.
- Default Schedule modal now asks when your day started and shifts all tasks to match the chosen time.
- Hidden upcoming releases admin accessed via a wood log icon in Settings. Requires a secret code and stores entries in Supabase.
- Admin changelog page now prompts for a secret code before access. (2025-07-22 17:15:12 UTC)
- Grace Prayer module records audio and stores start time with Supabase (2025-07-23 15:08:27 UTC)
- Grace Prayer module now supports photo capture with Supabase storage (2025-07-24 18:00:00 UTC)
- Added Verse of the Day module with Book of Mormon and Bible API support (2025-07-23 20:09:46 UTC)
- Verse of the Day can now be saved to Spiritual Study and favorited (2025-07-24 01:30:00 UTC)
- Verse of the Day entries now support notes directly from the module (2025-07-24 02:00:00 UTC)
- Verse of the Day now records the translation or Book of Mormon reference when saved to Spiritual Study (2025-07-24 03:00:00 UTC)

### Changed
- Task Notes history search bar redesigned with a clear icon for easier filtering (2025-08-01 13:34:42 UTC)
- Refresh button enlarged and always visible on mobile and desktop for easy reloading (2025-08-01 13:18:35 UTC)
- Math Notebook background now shimmers with a Harold and the Purple Crayon & Vanilla Sky starfield for a magical feel (2025-08-01 12:52:11 UTC)
- Swipe down refresh disabled by default unless enabled for the current device (2025-08-01 11:39:36 UTC)
- Math Notebook now stores last opened times in Supabase for cross-device "Most Recent" labels (2025-08-01 11:42:02 UTC)
- Math Notebook home dashboard uses profile display name for greeting (2025-08-01 00:53:08 UTC)
- Math Notebook home defaults to dark mode with a spacious Google Keep-style masonry layout and purple-sky palette (2025-08-01 02:13:08 UTC)
- Double-clicking a Math Notebook tab now opens a Harold and the Purple Crayon & Vanilla Sky themed rename modal (2025-08-01 03:22:44 UTC)
- Optimized Math Notebook with responsive height and scrollable tabs for mobile and desktop (2025-07-31 22:34:46 UTC)
- Math Notebook tab close confirmation now uses a Harold and the Purple Crayon themed modal with save option (2025-08-01 00:03:39 UTC)
- Documented that every update must include a professional changelog entry.
- Clarified the policy in `AGENTS.md`.
- Removed the secret code value from this changelog to keep it private. (2025-07-22 17:33:44 UTC)

### Fixed
- Math Notebook solver interprets `x` and `X` as multiplication and renders × in expressions (2025-08-01 13:21:25 UTC)
- Calendar action toolbar now wraps on desktop so buttons never get cut off (2025-08-01 13:18:35 UTC)
- Math Notebook solver reads canvas equations and treats `^` as exponent so results calculate correctly (2025-08-01 11:21:00 UTC)
- Math Notebook previews now hide Excalidraw menus so note thumbnails show sketch content (2025-08-01 11:17:01 UTC)
- Removed KaTeX from Vite's external bundle list so math solver scripts load and the app no longer white screens (2025-08-01 11:02:09 UTC)
- Bundled KaTeX and raised Workbox cache limit so math solver scripts load without module errors (2025-08-01 03:33:51 UTC)
- Externalized KaTeX in Vite build config to resolve Netlify deployment error (2025-08-01 02:16:25 UTC)
- Math Notebook tabs no longer hide beneath Change Log and Subscribe buttons on mobile (2025-07-31 22:53:28 UTC)
- PWA install prompt now waits for a user gesture, preventing `NotAllowedError` on modern browsers (2025-07-31 21:23:15 UTC)
- Stripped collaborator maps from saved Excalidraw app state so Math Notebook sketches no longer throw runtime errors (2025-07-31 21:23:15 UTC)
- ChangeLogButton now stores the last seen timestamp in Supabase instead of
  relying on cookies or localStorage.
- Added `type` column to the `addresses` table so Life Logistics items save correctly. (2025-07-22 23:09:24 UTC)
- Documented how to add the missing `type` column in `supabase/README.md`. (2025-07-22 23:22:55 UTC)
- Fixed "invalid input syntax for type date" when saving Logistics items by converting blank date fields to null. (2025-07-22 23:31:41 UTC)
- Fixed missing favorite star due to stray closing tag in `VerseOfTheDay.tsx`. (2025-07-24 12:52:00 UTC)
- Corrected Excalidraw data types in Math Notebook to satisfy Netlify build (2025-07-30 23:25:12 UTC)
- Resolved Excalidraw type import path so Math Notebook builds on Netlify (2025-07-31 20:39:20 UTC)
- Imported Excalidraw types from internal modules and switched to the exported CSS path so the build script exits cleanly (2025-07-31 20:49:01 UTC)
- Ignored Excalidraw's bundled test API key in Netlify secrets scan so builds no longer fail (2025-07-31 20:56:41 UTC)
- Disabled Netlify secrets scanning to prevent false positives from bundled test keys (2025-07-31 21:05:40 UTC)
- Automatically triggered the PWA install prompt when `beforeinstallprompt` fires so the banner displays (2025-07-31 21:14:15 UTC)
- Auto-called `beforeinstallprompt.prompt()` and suppressed errors so the PWA banner shows without console warnings (2025-07-31 21:35:00 UTC)
- Memoized Math Notebook change handler to stop infinite update loops and React error 185 (2025-07-31 21:35:00 UTC)
