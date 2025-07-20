# TODO Tracker

This file tracks project progress and upcoming tasks.

## Completed

- Documented Netlify deployment instructions and required environment variables.
- Added `netlify.toml` to configure build settings and SPA redirects.

## Latest Updates

- Fixed Netlify deployment error caused by stray JSX in `Dashboard.tsx`.

- Introduced a world-class multi-timer module with flexible countdowns saved to Supabase.

- Added `.env.example` for local development credentials.
- Implemented income tracking module to log job and business earnings.
- Added income entry modal with automatic totals for a complete tracker.
- Clarified Netlify environment variables in the README.
- Introduced Netlify configuration file for easier setup.
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
- Refined mailing list prompt wording to remove explicit baby references.
- Fixed Netlify configuration parsing error by cleaning up netlify.toml
- Fixed Supabase queries for garbage schedules and addresses to match table schema.
- Fixed additional Life Logistics queries for addresses and businesses.
- Corrected calendar timezone handling so saved tasks keep the selected local times.
- Times now store the user's timezone offset to prevent 4 hour shift after saving.
- Calendar events now convert timestamps to Date objects and FullCalendar uses
  explicit `timeZone="local"` to ensure no offset issues.
- Updated calendar event types to accept `Date` objects, resolving TypeScript build error.
- Added modal forms to Life Logistics so addresses, vehicles, jobs, and businesses can be added and edited.
- Fixed Life Logistics forms to use column names from the database schema.
- Removed obsolete `is_primary` field from Life Logistics address forms.
- Added missing `type` column to the `addresses` table so Logistics entries save.
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
## Improvement Ideas

(add any new ideas here)

