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
 - Added custom confirmation email Netlify function using IONOS and confirmation
  page for verified users.
- Documented IONOS SMTP/IMAP environment variables for spam-free confirmation emails.
- Created unsubscribe edge function and page with mailing list table documentation.
- Added warning message when an email is not found during unsubscribe.
- Confirmation email edge function now stores new sign ups in the mailing list table.
- Unsubscribe page includes instructions for re-subscribing.
- Added login prompt asking users to join the mailing list if they aren't subscribed.
- Refined mailing list prompt wording to remove explicit baby references.
- Added SQL snippet in the README explaining how to create the mailing list table.
- Fixed Netlify configuration parsing error by cleaning up netlify.toml
- Fixed TypeScript syntax issue in `Dashboard.tsx` that broke Netlify build
- Addressed additional parsing error in `Dashboard.tsx` for the sidebar toggle

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

