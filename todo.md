# TASK: Build ZenzaLife Scheduler - Comprehensive Family Life Management Platform

## Objective: Create a full-stack multi-user scheduler and life-management platform that goes beyond calendaring to track habits, family growth, milestones, and enable "1% better" daily progress for individuals and families.

## DESIGN PHILOSOPHY: World-class, dreamlike, cinematic experience
- Evoke a serene, cloud-like lucid dream space (think "Vanilla Sky" aesthetic)
- Every screen, animation, and transition should feel calming, seamless, and inviting
- Color palettes inspire clarity, hope, and gentle motivation - never stress or confusion
- Users should feel they're organizing life in a beautiful, serene, almost magical environment
- Far beyond any ordinary calendar or scheduler - this is elevated life management

## 🌌 DREAMLIKE ENTRANCE EXPERIENCE - EVERY TIME (NON-NEGOTIABLE)
**Critical UX Requirement:** Every login, app open, or refresh must create a ritualistic, cinematic entrance

### Visual Experience:
- Gentle, flowing animations creating sensation of entering magical, weightless environment
- Visual style immediately invoking Vanilla Sky and lucid dream movies - expansive, light, beautiful
- Landing screen with subtle motion: clouds drifting, light particles, gentle gradients
- Typography, colors, micro-interactions, button hovers all reinforce "lucid dream" aesthetic
- No harshness, no stress - only clarity and hope

### Audio Experience:
- Cinematic entrance sound plays every time main screen loads
- Options: gentle chime, airy pad, or soft whoosh
- Reinforces dreamlike state and "otherworldly" space entry
- Optional skip/mute after few seconds, but plays by default

### Emotional Impact:
- Not just productivity app - emotional and cinematic experience
- Users feel inspired, calm, elevated - entering higher dreamlike version of themselves
- Deepens ritual, anticipation, and positive emotional association
- Sets tone for entire platform experience

## STEPs:
[ ] STEP 1: Setup Supabase authentication and obtain project credentials for backend services. -> System STEP

[ ] STEP 2: Design and create comprehensive database schema for all modules (users, families, children, tasks, goals, growth tracking, etc.) and setup initial Supabase tables. -> System STEP

[ ] STEP 3: Create Supabase storage bucket for user uploads (profile photos, custom alarm sounds, etc.). -> System STEP

[ ] STEP 4: Build the core interactive web application with React/Next.js frontend, including:
   - 🌌 DREAMLIKE ENTRANCE EXPERIENCE (every login/refresh with cinematic sound and visuals)
   - Multi-user authentication system with role-based access
   - Family group management and child profiles
   - Full calendar/scheduling system with FullCalendar.js
   - Default schedule templates and customization
   - Task management with recurring/one-time options
   - Real-time progress tracking and "1% better" calculations
   - All specialized modules (garbage tracking, affirmations, life logistics, etc.)
   - Growth dashboards and family collaboration features
   - Responsive UI with role visibility and family-centric design -> Web Development STEP

[ ] STEP 5: Implement advanced backend logic via Supabase Edge Functions for:
   - Automated garbage/recycling schedule updates based on location
   - Progress calculations and 1% improvement tracking
   - Family milestone notifications and reminders
   - Template management and reset functionality -> System STEP

[ ] STEP 6: Deploy the application to a public URL with proper environment configuration and test all functionality end-to-end. -> System STEP

## Deliverable: A fully functional, publicly accessible ZenzaLife Scheduler web application with all specified features including multi-user family management, comprehensive scheduling, habit tracking, and life milestone management.

## Key Features to Implement:
- Multi-user authentication with family roles (Mom, Dad, Son, Daughter, etc.)
- Default detailed schedule template (6:30 AM wake up through 9:45 PM sleep)
- Family and children profile management with academic tracking
- Flexible task scheduling (daily, weekly, monthly, custom intervals)
- Garbage/recycling module with location-based auto-scheduling
- 1% better tracking with identity-based growth categories
- Affirmations module with personal and family options
- Life logistics tracking (homes, vehicles, jobs, income)
- Collaborative commenting and family engagement features
- Custom alarms with upload capability
- Growth dashboards and progress visualization
- Monthly first-of-month fasting and prayer reminder for LDS tradition with customizable duration, water options, and a live countdown timer saved to Supabase
- Template system for schedule management