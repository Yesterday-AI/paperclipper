# Clipper

> Company as code. Bootstrap a [Paperclip](https://github.com/paperclipai/paperclip) company workspace from modular templates.

Clipper assembles a ready-to-run company workspace by combining a base org structure with composable modules and optional roles. Capabilities adapt gracefully — adding a Product Owner makes it the primary owner of backlog management, with the CEO as automatic fallback.

## Install

```sh
mkdir ~/.paperclipper && cd ~/.paperclipper
npx @yesterday-ai/paperclipper
```

Or install globally:

```sh
npm i -g @yesterday-ai/paperclipper
clipper
```

Requires Node.js 20+.

## Usage

The interactive wizard walks through these steps:

```
$ clipper --api

  ╭──────────────╮
  │   Clipper    │
  ╰──────────────╯

  Company name: Acme Corp
  Company goal: Build the best widgets in the world
  Description:  Ship v1 with core features and onboard first 10 customers

  Project name: Acme Corp
  GitHub repo URL: https://github.com/acme/widgets

  Select a preset:
  ❯ fast — Speed-optimized for solo engineer...
    quality — Quality-optimized with PR review...
    custom — Pick modules manually

  Select modules: (↑↓ navigate · space toggle · enter confirm)
  ❯ ◉ github-repo
    ◉ roadmap-to-issues
    ◉ auto-assign
    ◉ stall-detection
    ○ pr-review

  Capability resolution:
    roadmap-to-issues: ceo
    auto-assign: ceo

  Summary:
    Company:  Acme Corp
    Goal:     Build the best widgets in the world
    Project:  Acme Corp
    Repo:     https://github.com/acme/widgets
    Modules:  github-repo, roadmap-to-issues, auto-assign, stall-detection
    Roles:    ceo, engineer
    Output:   ./companies/AcmeCorp
    API:      enabled (will create company, goal, project, agents, issues)

  Create? [Y/n]:
```

### Options

```sh
clipper                                # interactive wizard, output to ./companies/
clipper --output /path/to/companies    # custom output directory
clipper --api                          # also provision via Paperclip API
clipper --api --start                  # provision and start CEO heartbeat
clipper --api --model claude-opus-4-6  # set default model for all agents
clipper --api-url http://host:3100     # custom API URL (implies --api)
```

| Flag | Description | Default |
| ---- | ----------- | ------- |
| `--output <dir>` | Output directory for company workspaces | `./companies/` |
| `--api` | Provision company, goal, project, agents, and issues via Paperclip API after file assembly | off |
| `--api-url <url>` | Paperclip API URL (implies `--api`) | `http://localhost:3100` |
| `--model <model>` | Default LLM model for all agents (overridden by `role.json` per-role config) | adapter default |
| `--start` | Start CEO heartbeat after provisioning (implies `--api`) | off |

The company directory name is PascalCase: "Black Mesa" → `companies/BlackMesa/`.

## What You Get

```text
companies/AcmeCorp/
├── BOOTSTRAP.md                    # Setup guide: goal, project, agents, tasks
├── agents/
│   ├── ceo/
│   │   ├── AGENTS.md               # Identity, references, skill list
│   │   ├── SOUL.md                 # Persona and voice
│   │   ├── HEARTBEAT.md            # Execution checklist
│   │   ├── TOOLS.md                # Tool inventory
│   │   └── skills/                 # Assigned by capability resolution
│   ├── engineer/
│   │   ├── AGENTS.md
│   │   ├── SOUL.md, HEARTBEAT.md, TOOLS.md
│   │   └── skills/
│   ├── product-owner/              (if role selected)
│   │   └── ...
│   └── code-reviewer/              (if role selected)
│       └── ...
├── projects/                       # Project workspace(s)
│   └── <ProjectName>/              # cwd for agent heartbeats
└── docs/                           # Shared workflows from modules
```

`BOOTSTRAP.md` contains everything needed to set up the company in the Paperclip UI — goal, project with workspace and repo, agent paths, and initial tasks. With `--api`, all of this is provisioned automatically.

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

Clipper provisions everything in the local Paperclip instance automatically:

1. **Company** — created with the name you entered
2. **Goal** — company-level goal with your title and description, set to `active`
3. **Project** — with a workspace pointing to `companies/<Name>/projects/<ProjectName>/` (and GitHub repo if provided)
4. **Agents** — one per role, each with correct absolute `cwd`, `instructionsFilePath`, model, and adapter config from `role.json`
5. **Issues** — initial tasks from modules, linked to the goal and project
6. **CEO heartbeat** — optionally started with `--start`

After provisioning, the CLI shows a detailed summary of every created resource with IDs.

### Without `--api`

Follow the `BOOTSTRAP.md` file generated in the company directory. It lists every resource to create manually in the Paperclip UI: company, goal, project with workspace, agents with paths, and initial issues.

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

The wizard collects: company name, goal, project (name + repo), preset, modules, and roles.

**Assembly** (always runs):

1. Copies base role files (CEO, Engineer) into `agents/`
2. Copies selected extra roles into `agents/`
3. For each module:
   - Checks `activatesWithRoles` — skips if required roles aren't present
   - Resolves capability ownership based on present roles
   - Primary owner gets the full skill; fallback owners get the safety-net variant
   - Copies shared docs into `docs/`
   - Appends skill and doc references to each AGENTS.md
4. Generates `BOOTSTRAP.md` with goal, project, agent paths, and initial tasks

**Provisioning** (with `--api`):

1. Creates company in Paperclip
2. Creates company-level goal (status: active)
3. Creates project with workspace (cwd → `companies/<Name>/projects/<ProjectName>/`, repo URL if provided)
4. Creates agents with per-role adapter config (`model`, `effort`, etc. from `role.json`)
5. Creates initial issues linked to goal and project
6. Optionally starts CEO heartbeat (`--start`)

## License

MIT
