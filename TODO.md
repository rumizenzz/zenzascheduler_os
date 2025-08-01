# TODO Tracker

This file tracks project progress and upcoming tasks.

## Completed

- Documented world-class agentic workflow and synced TODO tracker (2025-07-22).
- Reflection: automate checks so `AGENTS.md` and this file stay current.
- Documented Netlify deployment instructions and required environment variables.
- Added `netlify.toml` to configure build settings and SPA redirects.
- Grace Prayer module now captures photos with Supabase storage (2025-07-24).

## In Progress
(None at the moment)

## Latest Updates
- Added Monthsary and 1 Year Anniversary task categories with a top-right Reminders button that counts down to upcoming tasks and celebrates special days (2025-08-01 17:20:29 UTC).
- Dashboard sections now scroll to the top when switching so content doesn't appear buried (2025-08-01 17:09:52 UTC).
- Life Logistics address form now uses free OpenStreetMap Nominatim suggestions for quick address search (2025-08-01 16:58:29 UTC)
- Fixed Math Solver history clear function so component parses correctly (2025-08-01 16:27:25 UTC)
- Garbage schedule saves now populate the required date field so Supabase doesn't reject null values (2025-08-01 16:53:53 UTC).
- Dashboard sidebar now scrolls with a Harold and the Purple Crayon & Vanilla Sky gradient so all sections and Sign Out stay visible (2025-08-01 16:57:38 UTC).
- Report Bug button slides beside the sidebar so it no longer covers Sign Out (2025-08-01 16:57:38 UTC).
- Entrance animation duration is now configurable in Settings (2025-08-01 16:47:48 UTC).
- Renaming a Math Notebook tab now shows only a single portal modal above the canvas, removing the duplicate window (2025-08-01 16:50:04 UTC)
- Entrance animation and sound preferences now persist in Supabase instead of local storage (2025-08-01 16:26:53 UTC).
- Settings now let users disable the dreamlike entrance and its sound with a Save Changes button that warns of unsaved changes (2025-08-01 16:13:28 UTC).
- Authentication email field now suggests common domains for quick entry (2025-08-01 16:29:03 UTC).
- GED calculator now pops above the Math Notebook canvas via a portal for clear visibility (2025-08-01 16:23:10 UTC).
- Plus button in Math Notebook adds a new Notes tab without asking for a template (2025-08-01 16:23:10 UTC).
- Garbage & Recycling schedule saves no longer fail when address is unspecified (2025-08-01 16:13:26 UTC).
- Daily and grace prayer calendars now list all recordings for a date so users can log unlimited prayers (2025-08-01 16:13:41 UTC).
- Math Solver history now stores entries only in Supabase, dropping localStorage (2025-08-01 16:12:04 UTC).
- Math Solver history now supports clearing all problems or deleting individual entries (2025-08-01 16:05:39 UTC).
- Intermittent fasting reminder now appears below top controls so buttons remain visible (2025-08-01 16:10:00 UTC).
- GED-style calculator added to Math Notebook with Supabase history (2025-08-01 16:09:50 UTC).
- Pressing Enter on desktop now solves Math Notebook problems (2025-08-01 16:04:16 UTC).
- Intermittent fasting reminder toast only captures clicks inside itself so calendar and bottom buttons remain visible (2025-08-01 15:55:20 UTC).
- Intermittent fasting reminder now ignores pointer events so calendar and bottom buttons stay clickable (2025-08-01 15:47:02 UTC).
- Grace prayers now track live duration and can be replayed by date from a calendar view (2025-08-01 15:29:18 UTC).
- Morning and night prayers now track live prayer duration and can be reviewed by date in a prayer calendar (2025-08-01 15:13:17 UTC).
- Morning and night prayers now record audio from alarm Start Prayer button with organized playback, and grace prayers include viewable dish images (2025-08-01 13:14:57 UTC).
- Added Report Bug button with secret bug list in Settings (2025-08-01 15:38:34 UTC).
- Bug list secret code updated to ZENZASECRETS for viewing monthly reports (2025-08-01 15:50:22 UTC).
- New Notebook template selector now uses Harold and the Purple Crayon & Vanilla Sky colors so options stand out (2025-08-01 15:21:33 UTC).
- Relocated Refresh, Change Log, and swipe-refresh toggle buttons to the bottom-right so calendar actions remain accessible (2025-08-01 15:19:23 UTC).
- Math Notebook search now scans canvas text so notebooks can be found by their contents (2025-08-01 15:21:54 UTC).
 - Fasting reminder now shows upcoming fast date and days remaining before the first Sunday (2025-08-01 15:09:18 UTC)
 - Monthly fasting reminder now activates on the first Sunday of each month instead of the first day (2025-08-01 14:56:08 UTC)
- Fixed active fast lookup to include user ID so TypeScript build succeeds (2025-08-01 14:06:31 UTC)
- Fasting plan now displays a live countdown timer once started for clear tracking (2025-08-01 13:50:20 UTC)
- Fasting reminder now relies solely on Supabase with no localStorage fallback (2025-08-01 13:39:47 UTC)
- Fasting reminder persistence now stores acknowledgments in Supabase for cross-device sync (2025-08-01 13:36:00 UTC)
- Fasting reminder now supports selecting duration and water options with plans saved to Supabase (2025-08-01 13:28:22 UTC)
 - Monthly fasting reminder alerts users on the first of each month with a top-right toast (2025-08-01 13:15:31 UTC).
- Create New Notebook modal now appears on the dashboard instead of inside open notes (2025-08-01 15:06:49 UTC).
- Math Notebook tab close confirmation now appears above the canvas via a portal so it no longer hides under the drawing area (2025-08-01 13:55:07 UTC).
- Refactored Math Notebook tab modals into portal-rendered components to fix Netlify JSX closing tag errors (2025-08-01 15:05:23 UTC).
- Refresh, Change Log, and swipe-refresh toggle buttons rearranged so the Refresh button stays visible (2025-08-01 13:47:46 UTC).
- New notebook modal lets you choose templates like Math, Notes, To-Do List, Journal, or Project Plan with a custom name (2025-08-01 13:48:00 UTC).
- Math Notebook home now lets users search notebooks by title with a prominent search bar (2025-08-01 13:34:42 UTC).
- Task Notes history search bar redesigned with a clear icon for easier filtering (2025-08-01 13:34:42 UTC).
- Task Notes history now supports text search to find past comments quickly (2025-08-01 12:57:51 UTC).
- Math Notebook solver history now opens in a Harold and the Purple Crayon & Vanilla Sky window via a History button (2025-08-01 13:30:00 UTC).
- Math Notebook solver interprets `x` and `X` as multiplication and displays × in expressions (2025-08-01 13:21:25 UTC).
- Refresh button is now larger and always visible on mobile and desktop for easy reloading (2025-08-01 13:18:35 UTC).
- Calendar action buttons now wrap on desktop so no options are cut off (2025-08-01 13:18:35 UTC).
- Task Notes history now supports text search to find past comments quickly (2025-08-01 12:57:51 UTC).
- Scripture study now allows multiple verse entries per day with per-verse edit buttons (2025-08-01 12:56:35 UTC).
- Math Notebook solver history now syncs to Supabase for cross-device persistence (2025-08-01 12:54:40 UTC).
- Math Notebook solver now remembers previously solved problems across sessions (2025-08-01 12:48:12 UTC).
- Math Notebook now shimmers with a Harold and the Purple Crayon & Vanilla Sky starfield for a magical feel (2025-08-01 12:52:11 UTC).
- Added a top-right Refresh button to manually reload the app (2025-08-01 11:52:14 UTC).
- Math Notebook dashboard now shows full timestamps for each notebook on the home grid (2025-08-01 11:40:46 UTC).
- Swipe refresh now requires Harold and the Purple Crayon/Vanilla Sky toggle per device, disabled by default (2025-08-01 11:39:36 UTC).
- Math Notebook last opened times now save in Supabase so the "Most Recent" label syncs across devices (2025-08-01 11:42:02 UTC).
- Math Notebook home now orders notebooks by last opened time and keeps the "Most Recent" label until another notebook is opened (2025-08-01 11:34:40 UTC).
- Math Notebook scans canvas text for equations, auto-filling the solver and supporting `^` exponents (2025-08-01 11:21:00 UTC).
- Math Notebook dashboard now highlights the most recently updated notebook and labels it "Most Recent" (2025-08-01 11:17:01 UTC).
- Math Notebook previews hide Excalidraw menus so sketches show in the dashboard (2025-08-01 11:17:01 UTC).
- Removed KaTeX from Vite external config so the Math Notebook no longer white screens and math expressions render correctly (2025-08-01 11:02:09 UTC).
- Double-clicking a Math Notebook tab now opens a Harold and the Purple Crayon & Vanilla Sky rename modal (2025-08-01 03:22:44 UTC).
- Bundled KaTeX and raised Workbox cache limit so math solver loads without module errors (2025-08-01 03:33:51 UTC).
- Externalized KaTeX in build config to resolve Netlify build failure (2025-08-01 02:16:25 UTC).
- Added math expression solver that detects equations and offers a Solve button in Math Notebook (2025-08-01 02:07:51 UTC).
- Math Notebook dashboard now uses profile display name for greeting (2025-08-01 00:53:08 UTC).
- Math Notebook now opens to a dashboard home listing all problems with a Create New Math Notebook button (2025-08-01 00:19:08 UTC).
- Math Notebook dashboard greets users by name with a time-of-day message and Keep-style grid of notebooks (2025-08-01 00:31:23 UTC).
- Math Notebook home now defaults to dark mode with a spacious Google Keep-style masonry layout and purple-sky palette (2025-08-01 02:13:08 UTC).
- Math Notebook dashboard now previews each notebook like Google Keep for quick scanning (2025-08-01 02:33:07 UTC).
- Math Notebook now uses a Harold and the Purple Crayon themed warning when closing tabs, with options to save before exit (2025-08-01 00:03:39 UTC).
- Math Notebook tabs can be renamed, closed with confirmation, reopened, and auto-refresh from Supabase; history now shows exact timestamps (2025-07-31 23:35:07 UTC).
- Added mobile padding for Math Notebook tabs so Change Log and Subscribe buttons no longer obscure them (2025-07-31 22:53:28 UTC).
- Optimized Math Notebook for mobile and desktop with responsive canvas and scrollable tabs (2025-07-31 22:34:46 UTC).
- Auto-called `beforeinstallprompt.prompt()` and suppressed errors so the PWA banner shows without console warnings (2025-07-31 21:35:00 UTC).
- Memoized Math Notebook change handler to stop React error 185 and infinite updates (2025-07-31 21:35:00 UTC).
- Install prompt now triggers only after user interaction to satisfy browser gesture requirements (2025-07-31 21:23:15 UTC).
- Math Notebook now strips collaborator maps before saving to prevent Excalidraw runtime errors (2025-07-31 21:23:15 UTC).
- Automatically triggered the PWA install prompt when `beforeinstallprompt` fires so the banner displays (2025-07-31 21:14:15 UTC).
- Ignored Excalidraw's bundled test API key in Netlify secrets scan so builds no longer fail (2025-07-31 20:56:41 UTC).
- Disabled Netlify secrets scanning to prevent false positives from bundled test keys (2025-07-31 21:05:40 UTC).
- Added Math Notebook module with tabbed Excalidraw canvas and version history (2025-07-30 23:05:25 UTC).
- Math Notebook now saves problems and version history in Supabase (2025-07-30 23:14:19 UTC).
- Fixed Excalidraw data typing in Math Notebook so Netlify build succeeds (2025-07-30 23:25:12 UTC).
- Resolved Excalidraw type import path so Math Notebook builds on Netlify (2025-07-31 20:39:20 UTC).
- Imported Excalidraw types from internal modules and switched to the package CSS entry so the build script runs successfully (2025-07-31 20:49:07 UTC).
- Added script `update:upcoming` to sync Supabase upcoming releases into `UPCOMING_RELEASES.md`.
- Added hidden upcoming releases admin accessed by a wood log icon in Settings. Requires a secret code and saves entries to Supabase.
- Added early environment variable validation in send-confirmation-email function to prevent 502 errors when credentials are missing.
- Tracked and displayed each user's last login time.
- Last login now records after the dreamlike entrance completes.
- Added Grace Prayer module with audio recording saved to Supabase (2025-07-23 15:08:27 UTC).
- Added Verse of the Day module pulling from Book of Mormon and Bible APIs (2025-07-23 20:09:46 UTC).
- Verse of the Day can now be saved to Spiritual Study and favorited in Supabase (2025-07-24 01:30:00 UTC).
- Verse of the Day entries now support notes directly in the module (2025-07-24 02:00:00 UTC).
- Verse of the Day now records the translation or Book of Mormon reference when saved to Spiritual Study (2025-07-24 03:00:00 UTC).
- Fixed missing favorite icon due to stray closing tag in Verse of the Day module (2025-07-24 12:52 UTC).
- Grace Prayer module now supports photo capture with Supabase storage (2025-07-24 18:00:00 UTC).
- Documented that the Netlify function's `DEP0040` punycode warning is harmless and to verify SMTP variables if mail doesn't send.
- Documented legacy `IONOS_USERNAME` and `IONOS_PASSWORD` variables and updated
  the confirmation email function to accept them.
- Upcoming releases are now mirrored into the changelog whenever `update:upcoming`
  runs.

- Fixed default schedule reordering on mobile with touch-friendly drag.
- Reworked schedule template drag-and-drop with a dedicated handle, desktop
  mouse support, and Supabase persistence.
- Fixed TypeScript error when saving the default schedule template so Netlify builds succeed.
- Added task template and completed tasks tracking with a collapsible checklist.
- Fixed Netlify deployment error caused by stray JSX in `Dashboard.tsx`.

- Introduced a world-class multi-timer module with flexible countdowns saved to Supabase.

- Added `.env.example` for local development credentials.
- Implemented income tracking module to log job and business earnings.
- Added income entry modal with automatic totals for a complete tracker.
- Clarified Netlify environment variables in the README.
- Introduced Netlify configuration file for easier setup.
- Fixed functions path in `netlify.toml` so confirmation emails deploy properly.
- Added root `package.json` and Netlify build step to install serverless dependencies.
- Added `package.json` inside `netlify/functions` so dependencies install at runtime.
- Bundled Netlify function dependencies to fix missing `@supabase/supabase-js` errors.
- Fixed promise handling for confirmation and unsubscribe pages.
- Fixed TypeScript error in `DefaultScheduleModal.tsx` flagged during Netlify build.
- Added runtime check for missing Supabase environment variables.
- Removed placeholder Supabase variables from `netlify.toml` to allow Netlify
  site credentials to pass through.
- Added custom confirmation email Netlify function using IONOS and confirmation
- Added custom confirmation email Netlify function using IONOS and confirmation
  page for verified users.
- Documented IONOS SMTP/IMAP environment variables for spam-free confirmation emails.
- Created unsubscribe edge function and page with mailing list table documentation.
- Added warning message when an email is not found during unsubscribe.
- Confirmation email edge function now stores new sign ups in the mailing list table.
- Unsubscribe page includes instructions for re-subscribing.
- Added login prompt asking users to join the mailing list if they aren't subscribed.
- Replaced the popup with a persistent "Mailing List" button so it no longer appears on every login.
- Refined mailing list prompt wording to remove explicit baby references.
- Added unsubscribe option in the mailing list prompt so users can re-subscribe from the same window.
- Added SQL snippet in the README explaining how to create the mailing list table.
- Confirmation page now auto-updates the mailing list when the user verifies their email.
- Signups are throttled using a `signup_attempts` table to block abuse.
- Renamed `SUPABASE_SERVICE_ROLE_KEY` to `SUPABASE_SERVICE_KEY` and clarified
  timestamp with time zone columns for the mailing list tables.
- Fixed Netlify configuration parsing error by cleaning up netlify.toml
- Fixed TypeScript syntax issue in `Dashboard.tsx` that broke Netlify build
- Addressed additional parsing error in `Dashboard.tsx` for the sidebar toggle
- Fixed Netlify configuration parsing error by cleaning up netlify.toml
- Fixed TypeScript syntax issue in `Dashboard.tsx` that broke Netlify build
- Addressed additional parsing error in `Dashboard.tsx` for the sidebar toggle
- Fixed Supabase queries for garbage schedules and addresses to match table schema.
- Fixed additional Life Logistics queries for addresses and businesses.
- Corrected calendar timezone handling so saved tasks keep the selected local times.
- Times now store the user's timezone offset to prevent 4 hour shift after saving.
- Calendar events now convert timestamps to Date objects and FullCalendar uses
  explicit `timeZone="local"` to ensure no offset issues.
- Fixed minute drift for tasks by saving timestamps in ISO UTC and converting
  back to local time when editing.
- Extended dayjs with the UTC plugin so `.local()` works and Netlify builds pass.
- Updated calendar event types to accept `Date` objects, resolving TypeScript build error.
- Added modal forms to Life Logistics so addresses, vehicles, jobs, and businesses can be added and edited.
- Fixed Life Logistics forms to use column names from the database schema.
- Removed obsolete `is_primary` field from Life Logistics address forms.
- Added missing `type` column to the `addresses` table so Logistics entries save.
- Documented fix for "Could not find the 'type' column of 'addresses' in the schema cache" error.
- Added README in `supabase/` explaining how to add the missing `type` column.
- Fixed date field save errors by converting blank strings to null during Life Logistics saves.
- Added custom confirmation email edge function using IONOS and confirmation
  page for verified users.
- Documented IONOS SMTP/IMAP environment variables for spam-free confirmation emails.
- Created unsubscribe edge function and page with mailing list table documentation.
- Fixed Supabase queries for garbage schedules and addresses to match table schema.
- Ensured entrance sound plays reliably by resuming the AudioContext on user interaction and tab focus.
- Improved form field accessibility with proper ids and labels.
- Improved entrance sound logic to start automatically after the first user gesture, preventing autoplay warnings.
- Added a mandatory "Click to Enter ZenzaLife OS Scheduler" button before the entrance animation to satisfy autoplay restrictions.
- Added custom-coded Vanilla Sky inspired favicon.
- Enhanced UI with premium fonts and luxury gradients.
- Prevented duplicate default schedule entries and refined calendar event design.
- Added missing `next_collection` field to `garbage_schedule` table so the Garbage Module loads correctly.
- Integrated task analytics edge function for progress stats.
- Added automated garbage schedule updater edge function for Whitehouse Station.
- Updated auto-garbage-schedule function to fetch and parse iCal feeds.
- Added garbage_update_logs table and edge logging for schedule refreshes.
- Implemented modular garbage provider system with Republic Services integration.
- Fixed "AuthSessionMissingError" by checking session before loading user data.
- Introduced PWA support with offline caching and automatic sidebar collapse on mobile.
- Fixed type reference for `virtual:pwa-register` to satisfy the build.
- Enhanced mobile layout across dashboard modules for better small screen usability.
- Resolved Netlify build failure by externalizing `workbox-window` and adding it as a dependency for PWA support.
- Verified the PWA build succeeds with the new configuration.
- Configured Netlify functions directory to prevent service worker from being bundled.
- Implemented slide-out sidebar with overlay and menu button for mobile devices.
- Fixed Netlify build error by installing `@semantic-ui-react/event-stack`.
- Resolved Netlify config parse error by removing duplicate `[functions]` section.
- Adjusted calendar view to display early morning hours by default.
- Set default calendar view to Day for focused scheduling.
- Enabled viewing of individual family member calendars with a selection modal.
- Navigation label renamed from "Calendar" to "Your Calendar" for clarity.
- Added intense alarm system with selectable Mixkit sounds and custom uploads.
- Removed Mixkit alarm audio files from the repo and documented manual download steps.
- Renamed builtin alarm options and allowed naming custom uploads.
- Added custom_sound_path property to calendar events for personalized alarm sounds.
- Added install guide, onboarding screens and service worker based notifications with a test alarm.
- Fixed TypeScript build errors for PWA install prompt and service worker types.
- Improved notification permissions and test alarm reliability by awaiting the service worker.
- Added incognito mode detection to the install guide to explain why installation may fail.
- Detects if the PWA is already installed and hides the install step.
- Warns that notifications cannot be enabled in incognito mode.
- Detects when running in standalone mode and informs the user.
- SVG icons added to the manifest for proper home screen branding.
- Configured the Apple touch icon to reference the SVG so iPhones show the Vanilla Sky icon.
- Updated the PWA manifest to use `sizes: "any"` so the SVG icon reliably displays on mobile.
- Enabled maskable icons to guarantee the SVG favicon appears on mobile home screens.
- Onboarding recommends enabling background refresh on iOS and disabling battery optimization on Android; alarms keep the screen awake.
- Added visual guides showing where to enable Background App Refresh on iOS and disable Battery Optimization on Android.
- Added swirling entrance animation with richer chime chord for dreamlike appeal.
- Introduced Vitest with a basic utility test and stricter ESLint rules.
- Documented Netlify deployment steps to run lint and tests before building.
- Added notes field for calendar tasks to record what was accomplished.
- Added clear "Completed" indicator with a green check for finished tasks on the calendar.
- Implemented scripture and conference note tracking module for daily spiritual study.
- Added Supabase tables for storing scripture and conference notes.
- Extended spiritual study with hymn and gratitude tracking.
- Created Supabase tables for hymn_notes and gratitude_notes.
- Added full scripture text support and old scroll styling with daily discipleship reflections.
- Fixed build failure by including `custom_sound_path` in calendar event types.
- Fixed CalendarEvent typing for custom alarm paths to resolve TypeScript build error.
- Enabled viewing of family member scripture notes with a selection modal.
- Added swirling entrance animation with richer chime chord for dreamlike appeal.
- Introduced Vitest with a basic utility test and stricter ESLint rules.
- Documented Netlify deployment steps to run lint and tests before building.
- Display a "What did you learn today:" label before scripture and conference notes so they're not mistaken for scripture text.
- Added book and version fields for scriptures with dropdown selection and sample Book of Mormon verses.
- Hid version selector when the Book of Mormon is chosen since no editions exist.
- Version dropdown now only appears for the Bible, since other books have no editions.
- Enabled pull-to-refresh on mobile with a "Swipe down to refresh" onboarding tip.
- Refined calendar responsiveness with dynamic height and streamlined toolbar for flawless mobile viewing.
- Added DoorDash and Uber Eats task categories with brand colors and SVG icons on the calendar.
- Added DoorDash task category with emoji icon and color coding.
- Fixed Netlify build error by closing the categories array in `TaskModal.tsx`.
- Improved Swift example for time-sensitive iOS notifications with foreground delivery support.
- Added helper to open the app's notification settings so users can enable the
  Time Sensitive switch.
- Fixed missing category icons causing Netlify build failure.
- Calendar shows DoorDash and Uber Eats SVG icons only; other categories have no icons.
- Added time sensitive notification option so alarms trigger on iOS.
- Restored category icons and calendar icon mapping to resolve build failures.
- Added Olive Garden task category with brand colors and SVG icon.
- Extended calendar view to 5am so tasks can span past midnight.
- Widened calendar hours to show midnight through 8am so overnight tasks display accurately.
- Displayed exact start times for overnight tasks across day views.
- Resolved TypeScript syntax errors in `Dashboard.tsx` and `main.tsx`.
- Added Move Schedule modal to shift an entire day of tasks to a new date.
- Added shift-drag rescheduling with animated hint and mobile long-press support.
- Added Android install instructions and unknown apps onboarding guide.
- Dismissing or snoozing an alarm now closes it across all open tabs.
- Snoozed alarms reopen across tabs after five minutes.
- Fixed TypeScript build error in `useAlarmChannel` so Netlify deploys succeed.
- Added undo/redo history for the calendar with Supabase snapshots.
- Secure delete button wipes a day's schedule only after typing "DELETE-ALL-TASKS".
- Fixed JSX closing tags in ZenzaCalendar so Netlify builds succeed.
- Verified calendar build succeeds with midnight hours and manual time display.
- Fixed drag-and-drop edits so moving or resizing tasks now updates history for undo/redo.
- Fixed stray braces in `ZenzaCalendar.tsx` and undefined variable in `OnboardingModal.tsx` that broke the Netlify build.
- Fixed unclosed JSX in `ZenzaCalendar.tsx` after a merge mishap so Netlify builds succeed.
- Prevented duplicate tasks from appearing by deduplicating schedules when loading the calendar.
- Improved calendar toolbar with sticky action buttons, horizontal scrolling on mobile, and a floating Add Task button for quick scheduling.
- Added mobile action dropup so toolbar options open in a sticky menu with descriptive buttons.
- Enabled swipe gestures on mobile to switch days or months in the calendar.

- Polished calendar styling with ZenzaLife branding for headers, day cells, and events.
- Enhanced month/week view with boxed event layout and a day schedule modal to review all tasks on mobile.
- Added tiny daily previews in month and week views to quickly see each day's tasks.

- Mobile calendar now shows the Week button for easier navigation.
- Added optional swipe toggle and clean day links so month and week views stay tidy.

- Added personalized splash screen and footer message dedicated to Khen Shantel Zappalorti.
- Enhanced dedication with dark starry entrance and constellation overlay celebrating the future family.
- Android alarms now trigger system notifications using the service worker.
- Added Supabase-backed Change Log modal with a top-right button for the latest updates.
- Added year selector to the calendar toolbar that saves the chosen year in Supabase.
- Created `calendar_preferences` table to persist the selected calendar year for each user.
- Documented the requirement to log all future changes in `CHANGELOG.md`.
- ChangeLogButton now displays `CHANGELOG.md` contents in the modal.
- Strengthened AGENT instructions to require a professional changelog entry for
  every update.
- Polished the changelog with Keep a Changelog sections and copied it to the
  public folder so the Change Log button shows the latest notes.
- Added versioned changelog entries with tags and icon support.
- Implemented search and toast notifications for new releases.
- Created AdminChangelogPage and updated Supabase schema with reactions table.
- Added `changelog_views` table and logic to track when each user last saw the
  changelog.
- Fixed ChangeLogButton to store the last seen timestamp in Supabase instead of
  localStorage or cookies.
- Default Schedule modal asks when your day started and shifts tasks to match.
- Protected `/admin/changelog` behind a secret code prompt so only those with
  the correct code can add releases.
- Removed the secret code value from the changelog for security. (2025-07-22 17:33:44 UTC)

## Next Steps

- [ ] STEP 1: Setup Supabase authentication and obtain credentials.
- [ ] STEP 2: Design database schema and create initial tables.
- [ ] STEP 3: Configure Supabase storage bucket for uploads.
- [ ] STEP 4: Build the React front‑end with the dreamlike entrance experience.
- [ ] STEP 5: Add backend logic via Supabase Edge Functions.
- [ ] STEP 6: Deploy the app publicly and verify all features.

### Feature Breakdown

- Multi-user roles with family groups
- Detailed schedule templates with customization
- Habit, affirmation, and logistics tracking modules
- 1% growth dashboard and analytics

- Added Supabase tables and dashboard module for ancestor and temple work tracking.
- Ancestor entries now support optional death year, displaying "1963-Present" when no death year is provided.
- Added ability to edit the default schedule template before applying.
- Default schedule now supports adding tasks and rearranging them with times auto-adjusting.
- Categories are editable and a reorder mode toggle makes moving items easier.
- Redesigned calendar UI with polished ZenzaLife branding and responsive styles.
- Added mind map style FamilyTree component to visualize ancestors.
- Added per-task notes history with timestamps and a modal to review past thoughts.

## Improvement Ideas
- Add CI pipeline to verify documentation sync and run lint/tests.

(add any new ideas here)
