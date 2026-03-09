# Skill: CI/CD Pipeline

You manage continuous integration and deployment pipelines. Follow the conventions in `docs/CI-CD.md` in the project root.

## Setup Steps

1. Review the tech stack to determine build, lint, and test tooling
2. Create a CI workflow (GitHub Actions or equivalent):
   - Lint on all PRs and pushes to main
   - Run tests on all PRs and pushes to main
   - Build/typecheck to verify compilation
3. Create a CD workflow:
   - Trigger on merge to main
   - Deploy to the target environment
   - Run smoke tests after deployment
4. Add status badges to the project README
5. Document the full pipeline in `docs/CI-CD.md`

## Rules

- Fail fast — put the quickest checks (lint, typecheck) first.
- Keep pipelines under 5 minutes. If they exceed this, add caching or split stages.
- Use dependency caching (e.g., `actions/cache`, `setup-node` cache) to speed up installs.
- Pin action versions to full SHAs, not tags, for security.
- Never store secrets in workflow files — use GitHub Secrets or equivalent.
- If CI breaks main, fix it immediately — a red main blocks everyone.
