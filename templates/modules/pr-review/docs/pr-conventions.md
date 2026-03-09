# PR Conventions

## Branch Naming

```
<prefix>-<N>/<short-description>
```

Where `<prefix>` is the company issue prefix (lowercase) and `<N>` is the issue number.

Examples: `yes-6/add-auth-endpoint`, `yes-12/fix-game-loop`

## PR Title

Use Conventional Commits format:

```
<type>: <short description>
```

Types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `perf`

Rules: lowercase after colon, no period, under 72 chars.

## PR Body Template

```markdown
## What changed
<Brief description of the changes>

## Why
<Motivation and context>

## How to test
<Steps to verify the changes>

## Related
Closes [PREFIX-N]
```

## Labels

Apply one primary label: `feature`, `bug`, `docs`, `chore`, `infra`, `agent`.

## Review Workflow

Two-role review via @-mention on the originating issue:

1. **Engineer** opens PR on GitHub
2. **Engineer** sets originating issue to `in_review`
3. **Engineer** @-mentions @Code Reviewer and @Product Owner on the issue with PR link
4. **Code Reviewer** reviews for correctness, security, code style, simplicity
5. **Product Owner** reviews for intent match, scope discipline, acceptance criteria, roadmap alignment
6. Both reviewers post their verdict on the issue
7. **Engineer** merges when both approve, sets issue to `done`

## Review Roles

- **Code Reviewer**: Correctness, security, style, simplicity. Uses `gh pr review`.
- **Product Owner**: Intent alignment, scope discipline, acceptance criteria. Posts review as PR comment.
- **UI Designer** *(when present)*: Visual consistency, brand compliance, accessibility, design token usage.
- **UX Researcher** *(when present)*: Usability, user flow integrity, cognitive load, error handling UX.
- **QA Engineer** *(when present)*: Test coverage, edge cases, regression risk, boundary conditions.
- **DevOps Engineer** *(when present)*: Infrastructure impact, security, performance, rollback safety.

## Merge Rules

- Code Reviewer and Product Owner must approve (required)
- Other reviewers provide advisory feedback — blocking only for their domain-critical issues (e.g., security for DevOps, accessibility for UI Designer)
- CI must pass
- No force pushes
- Merge using `gh pr merge <number> --merge`
- Engineer is the merge owner — reviewers never merge

## Dev Cycle Rules

**Requires PR**: code logic, APIs, DB schema, agent configs, infrastructure
**Direct-to-main OK**: typos, comment-only changes, minor doc fixes (must reference issue)
