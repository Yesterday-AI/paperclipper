# Clipper

> Company as code. Bootstrap a [Paperclip](https://github.com/paperclipai/paperclip) company workspace from modular templates.

Clipper assembles a ready-to-run company workspace by combining a base org structure with composable modules — git workflows, review processes, backlog automation, and more. Pick a preset or mix your own.

## Install

```sh
npx @lx0/paperclipper
```

Or install globally:

```sh
npm i -g @lx0/paperclipper
clipper
```

Or run directly from the repo:

```sh
node clipper/create-company.mjs
```

No dependencies. Node.js 18+.

## Usage

```
$ clipper

  ╔═══════════════════════════════════════╗
  ║   Clipper                              ║
  ╚═══════════════════════════════════════╝

  Company name: Acme

  Select a preset:

    1) fast
       Speed-optimized for solo engineer. CEO + one Engineer,
       commit directly on main, no PR review.

    2) quality
       Quality-optimized with PR review. CEO + Engineer +
       Code Reviewer + Product Owner. Feature branches.

    3) custom
       Pick modules manually
```

### Options

```sh
clipper --output /path/to/companies   # custom output directory
```

## What You Get

```
companies/Acme/
├── agents/
│   ├── ceo/
│   │   ├── AGENTS.md           # Identity, references, skill list
│   │   ├── SOUL.md             # Persona and voice
│   │   ├── HEARTBEAT.md        # Execution checklist
│   │   ├── TOOLS.md            # Tool inventory
│   │   └── skills/             # Module skills (auto-referenced)
│   │       ├── roadmap-to-issues.md
│   │       ├── auto-assign.md
│   │       └── stall-detection.md
│   └── engineer/
│       ├── AGENTS.md
│       ├── SOUL.md
│       ├── HEARTBEAT.md
│       ├── TOOLS.md
│       └── skills/
│           └── git-workflow.md
└── docs/                        # Shared workflows
    └── git-workflow.md
```

Files are read live by Paperclip agents — edit anything on disk and it takes effect on the next heartbeat.

## Presets

| Preset | Roles | Workflow | Best for |
|--------|-------|----------|----------|
| **fast** | CEO, Engineer | Commit on main | Solo engineer, prototypes, MVPs |
| **quality** | CEO, Engineer, Code Reviewer, Product Owner | Feature branches + PR review | Teams, production systems |

> **fast** is designed for a single engineer. Multiple engineers committing to main without review will cause conflicts.

## Modules

Modules are composable building blocks. Each adds capabilities to specific roles.

| Module | Adds to | What it does |
|--------|---------|-------------|
| **github-repo** | Engineer | Git workflow and commit conventions (direct-to-main) |
| **pr-review** | Engineer + 2 new roles | PR-based review with Code Reviewer and Product Owner |
| **roadmap-to-issues** | CEO | Auto-generates issues from goals when backlog runs low |
| **auto-assign** | CEO | Assigns unassigned issues to idle agents |
| **stall-detection** | CEO | Detects stuck handovers and nudges or escalates |

## After Clipper

Once the workspace is assembled, set up agents in the Paperclip UI:

1. Create the company
2. For each agent, configure:
   - **cwd** → path to `companies/<name>/`
   - **instructionsFilePath** → `agents/<role>/AGENTS.md`
3. Start the CEO heartbeat

## Extending

### Add a module

```
templates/modules/<name>/
├── README.md                    # Description and examples
├── docs/                        # Shared docs (→ companies/<name>/docs/)
├── agents/<role>/skills/        # Role skills (→ agents/<role>/skills/)
└── roles/<role>/                # New roles (→ agents/<role>/)
    ├── AGENTS.md
    ├── SOUL.md
    └── HEARTBEAT.md
```

### Add a preset

```json
// templates/presets/<name>/preset.json
{
  "name": "my-preset",
  "description": "What this preset is for",
  "constraints": [],
  "base": "base",
  "modules": ["github-repo", "roadmap-to-issues"]
}
```

## How It Works

1. Copies base role files (CEO, Engineer) into `agents/`
2. For each module:
   - Copies shared docs into `docs/`
   - Copies role skills into `agents/<role>/skills/`
   - Appends skill and doc references to each AGENTS.md
   - Copies any new roles the module introduces
3. Done. No runtime, no config server, no database — just files.

## License

MIT
