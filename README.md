# Clipper

> Company as code. Bootstrap a [Paperclip](https://github.com/paperclipai/paperclip) company workspace from modular templates.

Clipper assembles a ready-to-run company workspace by combining a base org structure with composable modules and optional roles. Capabilities adapt gracefully — adding a Product Owner makes it the primary owner of backlog management, with the CEO as automatic fallback.

## Install

```sh
npx @yesterday-ai/paperclipper
```

Or install globally:

```sh
npm i -g @yesterday-ai/paperclipper
clipper
```

Requires Node.js 20+.

## Usage

```bash
$ clipper

  ╔═══════════════════════════════════════╗
  ║   Clipper                             ║
  ╚═══════════════════════════════════════╝

  Company name: Acme

  Select a preset:

    1) fast       — Solo engineer, commit on main
    2) quality    — PR review, 4 roles
    3) custom     — Pick modules manually

  Modules included + available:
    ...

  Add roles (optional — capabilities adapt gracefully):
    1) product-owner   + Enhances roadmap-to-issues, auto-assign
    2) code-reviewer   + Enables pr-review

  Capability resolution:
    roadmap-to-issues: product-owner (fallback: ceo)
    auto-assign:       product-owner (fallback: ceo)

  Summary:
    Company:  Acme
    Roles:    ceo, engineer, product-owner
    Modules:  github-repo, roadmap-to-issues, auto-assign, stall-detection

  Create? [Y/n]:
```

### Options

```sh
clipper                                # interactive wizard, output to ./companies/
clipper --output /path/to/companies    # custom output directory
clipper --api                          # also provision via Paperclip API
clipper --api --model claude-opus-4-6  # set default model for all agents
clipper --api-url http://host:3100     # custom API URL (implies --api)
```

| Flag | Description | Default |
| ---- | ----------- | ------- |
| `--output <dir>` | Output directory for company workspaces | `./companies/` |
| `--api` | Provision company, agents, project, and issues via Paperclip API after file assembly | off |
| `--api-url <url>` | Paperclip API URL (implies `--api`) | `http://localhost:3100` |
| `--model <model>` | Default LLM model for all agents (overridden by `role.json` per-role config) | adapter default |

The company directory name is PascalCase: "Black Mesa" → `companies/BlackMesa/`.

## What You Get

```text
companies/AcmeCorp/
├── agents/
│   ├── ceo/
│   │   ├── AGENTS.md           # Identity, references, skill list
│   │   ├── SOUL.md             # Persona and voice
│   │   ├── HEARTBEAT.md        # Execution checklist
│   │   ├── TOOLS.md            # Tool inventory
│   │   └── skills/             # Assigned by capability resolution
│   │       ├── roadmap-to-issues.fallback.md   (if PO present)
│   │       ├── roadmap-to-issues.md            (if PO absent — CEO is primary)
│   │       ├── auto-assign.md / .fallback.md
│   │       └── stall-detection.md
│   ├── engineer/
│   │   ├── AGENTS.md
│   │   ├── SOUL.md
│   │   ├── HEARTBEAT.md
│   │   ├── TOOLS.md
│   │   └── skills/
│   │       ├── git-workflow.md
│   │       └── pr-workflow.md        (if pr-review module active)
│   ├── product-owner/                (if role selected)
│   │   ├── AGENTS.md
│   │   └── skills/
│   │       ├── roadmap-to-issues.md  (primary)
│   │       └── auto-assign.md       (primary)
│   └── code-reviewer/               (if role selected)
│       └── AGENTS.md
└── docs/                             # Shared workflows
    ├── git-workflow.md
    └── pr-conventions.md             (if pr-review active)
```

Files are read live by Paperclip agents — edit anything on disk and it takes effect on the next heartbeat.

## Gracefully Optimistic Architecture

Capabilities extend, they don't require. The system works with just CEO + Engineer, and gets better as you add roles:

| Capability | Primary Owner | Fallback |
| ---------- | ------------- | -------- |
| roadmap-to-issues | Product Owner (if present) | CEO |
| auto-assign | Product Owner (if present) | CEO |
| pr-review | Activates with Code Reviewer or Product Owner | — |
| stall-detection | CEO (always) | — |

Primary owners get the full skill. Fallback owners get a safety-net variant that only activates when the primary is absent or stalled.

## Presets

| Preset | Roles | Modules | Best for |
| ------ | ----- | ------- | -------- |
| **fast** | CEO, Engineer | github-repo, roadmap-to-issues, auto-assign, stall-detection | Solo engineer, prototypes, MVPs |
| **quality** | CEO, Engineer, Product Owner, Code Reviewer | All 5 modules | Teams, production systems |

> **fast** is designed for a single engineer. Multiple engineers committing to main without review will cause conflicts.

## Modules

| Module | What it does |
| ------ | ------------ |
| **github-repo** | Git workflow and commit conventions |
| **pr-review** | PR-based review (activates with code-reviewer or product-owner) |
| **roadmap-to-issues** | Auto-generates issues from goals when backlog runs low |
| **auto-assign** | Assigns unassigned issues to idle agents |
| **stall-detection** | Detects stuck handovers and nudges or escalates |

## After Clipper

### With `--api` (recommended)

Clipper provisions everything automatically: company, agents (with correct `cwd` and `instructionsFilePath`), a project workspace, and initial issues. Just start the CEO heartbeat.

### Without `--api`

Set up manually in the Paperclip UI:

1. Create the company
2. Create a project with a workspace pointing to `companies/<Name>/`
3. For each agent, configure:
   - **cwd** → absolute path to `companies/<Name>/`
   - **instructionsFilePath** → absolute path to `companies/<Name>/agents/<role>/AGENTS.md`
4. Create initial issues (see `BOOTSTRAP.md` in the company directory)
5. Start the CEO heartbeat

## Extending

### Add a module

```text
templates/modules/<name>/
├── module.json                  # Name, capabilities, activatesWithRoles
├── README.md                    # Description
├── docs/                        # Shared docs (→ docs/)
└── agents/<role>/skills/        # Role skills (→ agents/<role>/skills/)
```

#### module.json

```json
{
  "name": "my-module",
  "activatesWithRoles": ["my-role"],
  "capabilities": [
    {
      "skill": "my-skill",
      "owners": ["my-role", "ceo"],
      "fallbackSkill": "my-skill.fallback"
    }
  ]
}
```

- `activatesWithRoles` — module only applies if at least one of these roles is present
- `capabilities[].owners` — priority order; first present role gets the primary skill, others get fallback
- `capabilities[].fallbackSkill` — filename (without .md) of the fallback variant

### Add a role

```text
templates/roles/<name>/
├── role.json                    # Name, title, description, reportsTo, enhances, adapter
├── AGENTS.md
├── SOUL.md
├── HEARTBEAT.md
└── TOOLS.md
```

#### role.json

```json
{
  "name": "my-role",
  "title": "My Role",
  "paperclipRole": "general",
  "description": "What this role does",
  "reportsTo": "ceo",
  "enhances": ["Takes over X from CEO"],
  "adapter": {
    "model": "claude-sonnet-4-6",
    "effort": "medium"
  }
}
```

- `paperclipRole` — maps to a Paperclip `AGENT_ROLE` enum: `ceo`, `engineer`, `pm`, `qa`, `designer`, `cto`, `cmo`, `cfo`, `devops`, `researcher`, `general`
- `adapter` — passed directly to `adapterConfig` during API provisioning. Supports any field the adapter accepts: `model`, `effort`, `maxTurnsPerRun`, etc. The `--model` CLI flag is used as fallback when `adapter.model` is not set.

### Add a preset

```json
{
  "name": "my-preset",
  "description": "What this preset is for",
  "constraints": [],
  "base": "base",
  "roles": ["product-owner"],
  "modules": ["github-repo", "roadmap-to-issues"]
}
```

## How It Works

1. Copies base role files (CEO, Engineer) into `agents/`
2. Copies selected extra roles into `agents/`
3. For each module:
   - Checks `activatesWithRoles` — skips if required roles aren't present
   - Resolves capability ownership based on present roles
   - Primary owner gets the full skill; fallback owners get the safety-net variant
   - Copies shared docs into `docs/`
   - Appends skill and doc references to each AGENTS.md
4. Done. No runtime, no config server, no database — just files.

## License

MIT
