# Changelog

All notable changes to **ZenzaScheduler OS Life Scheduler** are documented in this file. This project follows [Semantic Versioning](https://semver.org/) and the [Keep a Changelog](https://keepachangelog.com/) format.

## [Unreleased]
### Added
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
- Dreamlike right-click menu for Math Notebook text elements with edit history (2025-07-31 22:26:50 UTC)
- Text edit history in Math Notebook persists to Supabase (2025-07-31 22:38:52 UTC)

### Changed
- Optimized Math Notebook with responsive height and scrollable tabs for mobile and desktop (2025-07-31 22:34:46 UTC)
- Documented that every update must include a professional changelog entry.
- Clarified the policy in `AGENTS.md`.
- Removed the secret code value from this changelog to keep it private. (2025-07-22 17:33:44 UTC)

### Fixed
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
