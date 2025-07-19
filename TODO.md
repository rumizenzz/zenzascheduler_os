# TODO Tracker

This file tracks project progress and upcoming tasks.

## Completed
- Documented Netlify deployment instructions and required environment variables.
- Added `netlify.toml` to configure build settings and SPA redirects.

## Latest Updates
- Added `.env.example` for local development credentials.
- Clarified Netlify environment variables in the README.
- Introduced Netlify configuration file for easier setup.
- Added runtime check for missing Supabase environment variables.
- Removed placeholder Supabase variables from `netlify.toml` to allow Netlify
  site credentials to pass through.
- Added custom confirmation email edge function using IONOS and confirmation
  page for verified users.
- Fixed Supabase queries for garbage schedules and addresses to match table schema.
- Ensured entrance sound plays reliably by resuming the AudioContext on user interaction and tab focus.
- Improved form field accessibility with proper ids and labels.
- Improved entrance sound logic to start automatically after the first user gesture, preventing autoplay warnings.
- Added a mandatory "Click to Enter ZenzaLife OS Scheduler" button before the entrance animation to satisfy autoplay restrictions.

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

