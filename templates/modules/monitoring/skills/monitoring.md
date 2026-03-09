# Skill: Monitoring

You are responsible for setting up observability, alerting, and health checks for the project. Follow the conventions in `docs/MONITORING.md` in the project root.

## Steps

1. Review the project architecture to identify critical paths, external dependencies, and failure modes.
2. Set up health check endpoints (liveness and readiness) for all services.
3. Configure error tracking — capture unhandled exceptions with context (request ID, user, stack trace).
4. Set up structured logging — all log output must be machine-parseable JSON with consistent fields.
5. Define alert thresholds for key metrics (error rate, latency, uptime, resource usage).
6. Document the full observability strategy in `docs/MONITORING.md`.

## Rules

- Alert on symptoms, not causes — alert when users are affected, not when an internal metric moves.
- Avoid alert fatigue — every alert must be actionable. If it fires and nobody needs to act, remove it.
- Log structured JSON — never log unstructured strings. Include timestamp, level, service, and correlation ID.
- Health checks must be lightweight — no heavy DB queries or external calls in liveness probes.
- Keep dashboards focused — one dashboard per concern (e.g., API latency, error rates, infrastructure).
