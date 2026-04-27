# Contributing to Yoora Sarah Platform

## Getting Started
1. Clone the repo and run `npm install` at root
2. Copy `.env.example` to `.env` and fill in required values
3. Run `npm run dev` to start all services

## Development Workflow
1. Create a feature branch from `main`
2. Make changes following existing patterns
3. Run quality checks before committing:
   - `npm run lint` — ESLint
   - `npm run typecheck` — TypeScript
   - `npm run test` — unit tests
   - `npm run format:check` — Prettier
4. Open a PR using the template

## Code Standards
- TypeScript strict mode
- ESLint with zero warnings policy
- Prettier for formatting
- Vitest for frontend tests
- pytest + ruff for backend

## Commit Messages
Follow conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`
