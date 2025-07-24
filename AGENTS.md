# AGENT Instructions

These guidelines apply to the entire repository.

## Contribution workflow
- Keep `TODO.md` up to date with tasks that are finished and tasks that remain. This file summarizes the large feature list in `todo.md`.
- Always record every change, fix, bug fix, or new feature in `CHANGELOG.md`.
  Entries must follow the [Keep a Changelog](https://keepachangelog.com/) style
  with **Added**, **Changed**, **Fixed**, or **Removed** sections as needed.
  Copy the updated file to `zenzalife-scheduler/public/CHANGELOG.md` so the
  Change Log button shows the latest notes. No update is complete until this
  professional entry is added.
  Whenever `UPCOMING_RELEASES.md` is modified, mirror the list under a
  **Upcoming Releases** section within the `Unreleased` portion of the changelog.
  Each entry should note the release version and exact timestamp.
- Run `pnpm run lint` inside `zenzalife-scheduler` before committing changes.
- Commit with clear messages.

## Development tips
- Use `pnpm` for package management.
- Local development: `pnpm run dev` in `zenzalife-scheduler`.
- Build for production: `pnpm run build` in `zenzalife-scheduler`.

## Style
- Prefer TypeScript and keep formatting consistent (use Prettier or an equivalent formatter).

## Project tasks
`todo.md` lists the complete feature roadmap. Keep `TODO.md` updated as work
progresses. High level milestones:
- Supabase authentication setup
- Database schema design
- Storage bucket configuration
- Dreamlike React front end
- Edge Functions for automation
- Final deployment and testing

## Agent Directory
This repository uses a small collection of workflow agents modeled after the Minimax M1 process. Every agent documents actions here and in `TODO.md` so progress remains transparent.

### Codex Agent
**Role & responsibilities**: Implements code and documentation changes from user requests, runs lint tests, and updates `CHANGELOG.md`.

**Current abilities**: TypeScript development, Markdown docs, basic testing and linting.

**Known limitations**: No automatic CI integration and limited to manual updates.

**To improve**: Add CI hooks to automate lint/test, expand unit tests, and verify changelog sync.

**Recommendations**: Integrate with GitHub Actions to mimic world-class repositories from OpenAI or DeepMind.

**Change log**: see `CHANGELOG.md` for commit history.

### Documentation Agent
**Role & responsibilities**: Maintains `AGENTS.md` and `TODO.md` in sync with repository changes.

**Current abilities**: Writes summaries, organizes tasks, and logs reflections after each update.

**Known limitations**: Manual process; no automatic enforcement that docs stay current.

**To improve**: Create a pre-commit hook that refuses commits if these files are stale.

**Recommendations**: Adopt rigorous documentation standards similar to Meta FAIR and Anthropic open repos.

**Change log**: all updates recorded in `CHANGELOG.md`.

## World-Class Output Practices
All deliverables aim to match the polish of projects from OpenAI, DeepMind, Google Research, Anthropic, Meta FAIR, and Minimax. We follow Semantic Versioning, Keep a Changelog, clear commit messages, and linted TypeScript code. Future upgrades should benchmark UX and code quality against those organizations' public repositories.

## Continuous Improvement Policy
After completing a task, agents self-evaluate in `AGENTS.md` and append reflections to `TODO.md`. Feedback from maintainers or users becomes new tasks in `TODO.md` with links back to the relevant agent section. Major decisions are briefly explained in these files to keep motivation transparent.

