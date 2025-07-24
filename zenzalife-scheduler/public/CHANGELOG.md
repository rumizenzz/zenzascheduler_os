# Changelog

All notable changes to **ZenzaScheduler OS Life Scheduler** are documented in this file. This project follows [Semantic Versioning](https://semver.org/) and the [Keep a Changelog](https://keepachangelog.com/) format.

## [Unreleased]
### Added
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
- Primary Address support with ICS upload and sync for garbage schedules. (2025-07-24 15:00 UTC)
- Provider field now lets users choose Republic or Waste Management, and primary address changes automatically sync garbage schedules. (2025-07-24 18:00 UTC)
- Garbage schedules now parse ICS recurrences, saving notes and collection_year up to the next year. (2025-07-24 19:00 UTC)
- Default Schedule modal now asks when your day started and shifts all tasks to match the chosen time.
- Hidden upcoming releases admin accessed via a wood log icon in Settings. Requires a secret code and stores entries in Supabase.
- Admin changelog page now prompts for a secret code before access. (2025-07-22 17:15:12 UTC)
- Grace Prayer module records audio and stores start time with Supabase (2025-07-23 15:08:27 UTC)
- Added Verse of the Day module with Book of Mormon and Bible API support (2025-07-23 20:09:46 UTC)
- Verse of the Day can now be saved to Spiritual Study and favorited (2025-07-24 01:30:00 UTC)
- Verse of the Day entries now support notes directly from the module (2025-07-24 02:00:00 UTC)
- Verse of the Day now records the translation or Book of Mormon reference when saved to Spiritual Study (2025-07-24 03:00:00 UTC)

### Changed
- Documented that every update must include a professional changelog entry.
- Clarified the policy in `AGENTS.md`.
- Removed the secret code value from this changelog to keep it private. (2025-07-22 17:33:44 UTC)

### Fixed
- ChangeLogButton now stores the last seen timestamp in Supabase instead of
  relying on cookies or localStorage.
- Added `type` column to the `addresses` table so Life Logistics items save correctly. (2025-07-22 23:09:24 UTC)
- Documented how to add the missing `type` column in `supabase/README.md`. (2025-07-22 23:22:55 UTC)
- Fixed "invalid input syntax for type date" when saving Logistics items by converting blank date fields to null. (2025-07-22 23:31:41 UTC)
- Fixed missing favorite star due to stray closing tag in `VerseOfTheDay.tsx`. (2025-07-24 12:52:00 UTC)
