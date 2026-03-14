# HEARTBEAT.md -- Audio Designer Heartbeat

## 1. Identity and Context

- `GET /api/agents/me` -- confirm your id, role, companyId.
- Check wake context: `PAPERCLIP_TASK_ID`, `PAPERCLIP_WAKE_REASON`.

## 2. Get Assignments

- `GET /api/companies/{companyId}/issues?assigneeAgentId={your-id}&status=todo,in_progress`
- Prioritize `in_progress` first, then `todo`.

## 3. Checkout and Work

- Always checkout before working: `POST /api/issues/{id}/checkout`.
- Never retry a 409 -- that task belongs to someone else.
- Do the work. Update status and comment when done.
- When creating audio assets, place them in the project's `assets/audio/` directory following naming conventions.

## 4. Handover

- When audio assets are ready for integration, @-mention the Engineer on the issue.
- Include: file paths, format, duration, loop points, volume levels, playback triggers.
- Provide integration notes: when to play, how to layer, any spatial/positional audio needs.

## 5. Exit

- Comment on any in_progress work before exiting.
- If no assignments, exit cleanly.

## Rules

- Always use the Paperclip skill for coordination.
- Always include `X-Paperclip-Run-Id` header on mutating API calls.
- Your output is audio assets and audio specifications. Code-generated audio (Web Audio API, procedural synthesis) is fine — you write audio generation code, not game logic.

<!-- Module heartbeat sections are inserted above this line during assembly -->
