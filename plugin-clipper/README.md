# Company Creator

Paperclip plugin that provides an AI-powered wizard to bootstrap agent companies from composable templates. Replaces the standalone Clipper web app with a native plugin integration.

## How It Works

The plugin worker runs inside the Paperclip server process as a child process. It writes assembled company files to the bind-mounted `workdir` and provisions via `PaperclipClient` with email/password auth.

```text
┌──────────────────┐     ┌──────────────────────────────────────┐
│  Paperclip UI    │────▶│  Paperclip Server (Docker)           │
│  (wizard page)   │     │  ┌──────────────┐  ┌─────────────┐  │
└──────────────────┘     │  │ Plugin Worker │─▶│ Paperclip   │  │
                         │  │ (child proc)  │  │ REST API    │  │
                         │  └──────┬───────┘  └─────────────┘  │
                         └─────────┼───────────────────────────┘
                                   ▼
                         ┌──────────────────┐
                         │  /host-workdir   │  ← bind-mount to host
                         │  (workdir)       │
                         └──────────────────┘
```

## Development

```bash
pnpm install
pnpm build          # build worker + manifest + UI
pnpm dev            # watch builds
pnpm test
```

The SDK is snapshotted from a local Paperclip checkout in `.paperclip-sdk/`. Before publishing, switch to published npm versions.

## Install Into Paperclip

The plugin path must be visible from inside the container. Use a path that is bind-mounted (e.g. under `/host-workdir` or `/paperclip/.paperclip`).

```bash
curl -X POST http://127.0.0.1:3100/api/plugins/install \
  -H "Content-Type: application/json" \
  -d '{"packageName":"/host-workdir/_plugins/plugin-clipper","isLocalPath":true}'
```

> **Authenticated instances:** This endpoint requires board access. On `local_trusted` instances it works as-is. On authenticated instances, the request needs a valid board session.

## Environment Variables

Copy `.env.example` to `.env` and configure. All runtime config is via environment variables.

| Variable | Default | Description |
| -------- | ------- | ----------- |
| `CLIPPER_WORKDIR` | `/host-workdir` | Path where company workspaces are written (bind-mounted path) |
| `CLIPPER_TEMPLATES_PATH` | _(auto)_ | Path to `templates/` directory |
| `CLIPPER_PAPERCLIP_URL` | `http://localhost:3100` | Paperclip API URL |
| `CLIPPER_PAPERCLIP_EMAIL` | — | Board login email (for authenticated instances) |
| `CLIPPER_PAPERCLIP_PASSWORD` | — | Board login password |

All paths are **container paths** since the worker runs inside the Paperclip container.

## What It Does

- Adds a **"Create Company"** link in the sidebar
- Opens a full-page wizard with manual or AI-powered company configuration
- Assembles company workspace files (AGENTS.md, SOUL.md, HEARTBEAT.md, etc.) to `CLIPPER_WORKDIR`
- Provisions the company via the Paperclip API using `PaperclipClient` with email/password auth
- Streams real-time progress during provisioning

## Build Output

`pnpm build` produces:

- `dist/manifest.js` — plugin manifest
- `dist/worker.js` — Node.js worker (template loading + provisioning)
- `dist/ui/index.js` + `index.css` — React UI bundle (wizard components + Tailwind)
