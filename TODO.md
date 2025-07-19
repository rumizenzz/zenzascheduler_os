# TODO Tracker

This file tracks project progress and upcoming tasks.

## Completed

- Documented Netlify deployment instructions and required environment variables.
- Added `netlify.toml` to configure build settings and SPA redirects.

## Latest Updates

- Added `.env.example` for local development credentials.
- Implemented income tracking module to log job and business earnings.
- Clarified Netlify environment variables in the README.
- Introduced Netlify configuration file for easier setup.
- Added runtime check for missing Supabase environment variables.
- Removed placeholder Supabase variables from `netlify.toml` to allow Netlify
  site credentials to pass through.
- Added custom confirmation email Netlify function using IONOS and confirmation
  page for verified users.
- Documented IONOS SMTP/IMAP environment variables for spam-free confirmation emails.
- Created unsubscribe edge function and page with mailing list table documentation.
- Added warning message when an email is not found during unsubscribe.
- Confirmation email edge function now stores new sign ups in the mailing list table.
- Unsubscribe page includes instructions for re-subscribing.
- Added login prompt asking users to join the mailing list if they aren't subscribed.
- Refined mailing list prompt wording to remove explicit baby references.
- Fixed Supabase queries for garbage schedules and addresses to match table schema.
- Fixed additional Life Logistics queries for addresses and businesses.
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

## Improvement Ideas

- Ensure entrance animations and audio meet the design philosophy.
- Expand tests and lint rules for higher code quality.
- Document additional deployment steps as they are discovered.
