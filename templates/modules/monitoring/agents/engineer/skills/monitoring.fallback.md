# Skill: Monitoring (Fallback)

The DevOps engineer primarily owns monitoring and observability. You are the fallback — step in only if DevOps is absent or hasn't set up monitoring.

## Monitoring (Fallback)

1. If no `docs/MONITORING.md` exists and DevOps hasn't started:
   - Add basic health check endpoints (liveness probe returning 200)
   - Set up structured JSON logging with timestamp, level, and service fields
   - Document the setup in `docs/MONITORING.md`
   - Mark the strategy as **provisional** — it needs DevOps review for alerting, dashboards, and SLOs
2. If DevOps is active, skip this entirely.

## Rules

- This is a safety net. Set up the basics — health checks and structured logging.
- Skip alerting and dashboards — those require operational expertise best left to DevOps.
- Let DevOps own the full observability stack and ongoing monitoring.
