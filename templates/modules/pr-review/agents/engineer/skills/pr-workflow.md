# Skill: PR Workflow

When this skill is active, you work in feature branches and open PRs instead of committing directly to main. Follow the conventions in `docs/pr-conventions.md` in the project root.

## Feature Branch Flow

1. Pull latest main: `git pull origin main`
2. Create branch: `git checkout -b <prefix>-<N>/<short-description>`
3. Make your changes, commit with Conventional Commits format
4. Push branch: `git push -u origin <branch-name>`
5. Open PR: `gh pr create --title "<type>: <description>" --body "<template>"`
6. Set originating issue to `in_review`
7. @-mention @Code Reviewer and @Product Owner on the issue with the PR link (also @UI Designer, @UX Researcher, @QA, @DevOps if present and relevant)
8. Wait for reviews
9. When Code Reviewer and Product Owner both approve (and no domain blockers from other reviewers): `gh pr merge <number> --merge`
10. Set issue to `done`

## Rules

- Never commit directly to main (except typos/comment-only/doc fixes with issue reference).
- One PR per issue. Keep changes focused.
- Always include `Closes [PREFIX-N]` in the PR body.
- If reviewers request changes, address them and push to the same branch.
- You are the merge owner — never ask reviewers to merge.
