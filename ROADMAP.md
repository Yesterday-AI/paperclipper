# Clipper Roadmap

## Done

- Shared skills system — deduplicate primary skills, role-specific overrides only when genuinely different
- New modules: vision-workshop, market-analysis, hiring-review, tech-stack, architecture-plan
- New roles: ui-designer (designer), ux-researcher (researcher)
- New presets: startup, research, full, rad
- Template catalogue in README
- Special characters in company names (stripped in PascalCase)
- `dangerouslySkipPermissions` default for claude_local agents
- `reportsTo` hierarchy wiring (CEO-first provisioning)
- Module dependency validation — auto-include required modules, prevent deselecting dependencies
- OSS repo polish — badges, CONTRIBUTING.md, CI, issue/PR templates, .editorconfig
- Remove legacy `create-company.mjs` CLI

## In Progress

## Backlog

### Clipper CLI

- [ ] AI wizard mode — instead of step-by-step Q&A, describe the company/project in natural language and let an LLM select the best preset, modules, roles, and configuration automatically. Alternative entry point alongside the current interactive wizard.
- [ ] `--dry-run` flag — show summary and exit without writing files
- [ ] Wire ui-designer and ux-researcher into pr-review module (design review, UX review skill files)

### Template System

- [ ] Excalidraw MCP server integration — add as a tool skill for agents (ui-designer, ux-researcher, engineer) to generate diagrams, charts, and architecture visuals. Requires MCP server setup at adapter level; skill files instruct agents when and how to use the tool.
- [ ] More role templates: CTO, CMO, CFO, DevOps, QA
- [ ] Module: `user-testing` — UX Researcher runs usability evaluations, documents findings
- [ ] Module: `brand-identity` — UI Designer creates brand book, logo usage guidelines
- [ ] Module: `ci-cd` — Engineer sets up continuous integration and deployment pipeline
- [ ] Module: `monitoring` — observability, alerting, health checks

### Platform

- [ ] Paperclip workspace resolution fix — `resolveWorkspaceForRun()` returns null when manually triggering heartbeat (no issue/project context). Needs server-side fix.
