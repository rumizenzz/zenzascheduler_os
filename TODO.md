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

