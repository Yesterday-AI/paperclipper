# Skill: CI/CD Pipeline (Fallback)

The DevOps engineer primarily owns CI/CD pipelines. You are the fallback — step in only if DevOps is absent or hasn't set up the pipeline.

## CI/CD (Fallback)

1. If no CI workflow exists and DevOps hasn't started:
   - Create a basic CI workflow: lint + test on PRs, build on push to main
   - Use standard caching and pinned action versions
   - Document the setup in `docs/CI-CD.md`
   - Mark the pipeline as **provisional** — it needs DevOps review for CD, caching optimization, and security hardening
2. If DevOps is active, skip this entirely.

## Rules

- This is a safety net. Set up the basics — lint, test, build.
- Skip CD (deployment) — that requires infrastructure knowledge best left to DevOps.
- Let DevOps own pipeline optimization, deployment, and ongoing maintenance.
