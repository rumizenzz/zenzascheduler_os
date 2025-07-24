# Changelog

All notable changes to **ZenzaScheduler OS Life Scheduler** are documented in this file. This project follows [Semantic Versioning](https://semver.org/) and the [Keep a Changelog](https://keepachangelog.com/) format.

## [Unreleased]
### Added
- Documented world-class agentic workflow in `AGENTS.md` and expanded `TODO.md` tracker. (2025-07-22 20:34:18 UTC)
- Script `update:upcoming` exports Supabase upcoming releases to `UPCOMING_RELEASES.md`.
- ChangeLogButton now fetches and displays this changelog alongside Supabase entries.
- Changelog entries now include version, title, tags, and icon URL with exact timestamps.
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
- Morning Prayer modal records audio with a timer when an alarm is dismissed. (2025-07-22 23:59:59 UTC)
- Night Prayer modal records audio after evening alarms and both prayers upload recordings to Supabase. (2025-07-23 15:09:38 UTC)
- Added "Sleep" and "Wake Up" task categories and updated the default schedule.
- Morning and night prayer modals now open only when alarms for those categories are dismissed. (2025-07-23 15:23:39 UTC)
- Prayer audio now uploads directly to a Supabase Storage bucket instead of using the audio-upload function. (2025-07-24 12:30:00 UTC)

### Removed
- SQL script for creating `zenzalife-assets` storage bucket was deleted since the bucket already exists. (2025-07-24 12:37:27 UTC)

### Changed
- Documented that every update must include a professional changelog entry.
- Clarified the policy in `AGENTS.md`.
- Removed the secret code value from this changelog to keep it private. (2025-07-22 17:33:44 UTC)
- Prayer modals now show the recording duration after stopping. (2025-07-24 12:45:32 UTC)

### Fixed
- ChangeLogButton now stores the last seen timestamp in Supabase instead of
  relying on cookies or localStorage.
- Added `type` column to the `addresses` table so Life Logistics items save correctly. (2025-07-22 23:09:24 UTC)
- Custom alarm uploads now use direct Supabase Storage to avoid "Upload failed" errors. (2025-07-24 12:45:32 UTC)
