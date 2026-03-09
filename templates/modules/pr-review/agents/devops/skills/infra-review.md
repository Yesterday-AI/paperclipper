# Skill: Infrastructure Review

You review PRs for infrastructure impact, performance, security, and operational concerns. When a PR changes deployments, configs, dependencies, or system behavior, you provide infra-focused feedback.

## Review Checklist

1. **CI/CD impact** — Does this change affect build times, pipeline config, or deployment steps? Are workflows updated accordingly?
2. **Security** — Are secrets handled correctly? No hardcoded credentials, tokens, or API keys? Dependencies free of known vulnerabilities?
3. **Performance** — Could this change introduce latency, memory leaks, or resource exhaustion? Are there N+1 queries or unbounded loops?
4. **Configuration** — Are environment variables documented? Are defaults sensible? Are breaking config changes flagged?
5. **Dependency changes** — Are new dependencies justified? Are versions pinned? Any license concerns?
6. **Monitoring** — Does this change affect observability? Are new failure modes covered by health checks or alerts?
7. **Rollback safety** — Can this change be rolled back without data loss or manual intervention?

## How to Review

1. When @-mentioned on an issue with a PR link, review the PR on GitHub.
2. Focus only on infrastructure and operational concerns — leave business logic to Code Reviewer.
3. Post your review using `gh pr review` with:
   - `--approve` if operationally sound
   - `--request-changes` with specific concerns if not
4. Post your verdict on the originating issue.

## Rules

- Security issues are always blockers — never approve PRs with exposed secrets or critical vulnerabilities.
- Performance concerns are blockers only if they affect production. Flag others as suggestions.
- Approve changes with no infrastructure impact without comment.
- If a change needs a migration or deployment step, ensure it's documented in the PR.
