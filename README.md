# Clipper

> Bootstrap a [Paperclip](https://github.com/paperclipai/paperclip) company workspace from modular templates.

Clipper assembles a ready-to-run company workspace by combining a base org structure with composable modules and optional specialist roles. Capabilities adapt gracefully — adding a Product Owner makes it the primary owner of backlog management, with the CEO as automatic fallback. Adding a UX Researcher makes them the primary market analyst. The system works with just CEO + Engineer and gets better as you add roles.

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

```text
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
    startup — Strategy-first bootstrapping...
    research — Research and planning only...
    full — Full company setup with everything...
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
│   ├── code-reviewer/              (if role selected)
│   │   └── ...
│   ├── ui-designer/                (if role selected)
│   │   └── ...
│   └── ux-researcher/              (if role selected)
│       └── ...
├── projects/                       # Project workspace(s)
│   └── <ProjectName>/              # cwd for agent heartbeats
└── docs/                           # Shared workflows from modules
```

`BOOTSTRAP.md` contains everything needed to set up the company in the Paperclip UI — goal, project with workspace and repo, agent paths, and initial tasks. With `--api`, all of this is provisioned automatically.

Files are read live by Paperclip agents — edit anything on disk and it takes effect on the next heartbeat.

## Gracefully Optimistic Architecture

Capabilities extend, they don't require. The system works with just CEO + Engineer, and gets better as you add specialist roles:

| Capability | Primary Owner | Fallback | Module |
| ---------- | ------------- | -------- | ------ |
| market-analysis | UX Researcher → Product Owner | CEO | market-analysis |
| hiring-review | Product Owner | CEO | hiring-review |
| roadmap-to-issues | Product Owner | CEO | roadmap-to-issues |
| auto-assign | Product Owner | CEO | auto-assign |
| tech-stack | Engineer | CEO | tech-stack |
| architecture-plan | Engineer | CEO | architecture-plan |
| design-system | UI Designer | Engineer | architecture-plan |
| pr-review | Activates with Code Reviewer or Product Owner | — | pr-review |
| stall-detection | CEO (always) | — | stall-detection |
| vision-workshop | CEO (always) | — | vision-workshop |

Primary owners get the full skill. Fallback owners get a safety-net variant that only activates when the primary is absent or stalled.

**Example**: With just CEO + Engineer, the CEO handles market analysis, hiring review, and backlog management alongside strategy. Add a Product Owner and those responsibilities shift automatically — the CEO's skills downgrade to fallback-only safety nets.

## Presets

| Preset | Roles | Modules | Best for |
| ------ | ----- | ------- | -------- |
| **fast** | CEO, Engineer | github-repo, roadmap-to-issues, auto-assign, stall-detection | Solo engineer, prototypes, MVPs |
| **quality** | CEO, Engineer, Product Owner, Code Reviewer | github-repo, pr-review, roadmap-to-issues, auto-assign, stall-detection | Teams, production systems |
| **rad** | CEO, Engineer | tech-stack, hiring-review, github-repo, roadmap-to-issues, auto-assign, stall-detection | Rapid prototyping, iterate fast, formalize later |
| **startup** | CEO, Engineer | vision-workshop, market-analysis, hiring-review, tech-stack, architecture-plan, github-repo, roadmap-to-issues, auto-assign, stall-detection | Strategy-first bootstrapping, grow the team organically |
| **research** | CEO, Engineer | vision-workshop, market-analysis, tech-stack, hiring-review | Research and planning phase — no code, no repo |
| **full** | CEO, Engineer, Product Owner, Code Reviewer | All modules | Serious projects with full planning + quality engineering |

> **fast** is designed for a single engineer. Multiple engineers committing to main without review will cause conflicts.
>
> **research** has no GitHub repo or code workflow. Add `github-repo` and `roadmap-to-issues` when ready to build.

## Modules

### Strategy & Planning

| Module | What it does | Kickoff task | Doc template |
| ------ | ------------ | ------------ | ------------ |
| **vision-workshop** | Define vision, success metrics, strategic milestones | CEO defines vision | `vision-template.md` |
| **market-analysis** | Research market, competitors, positioning | Primary owner conducts analysis | `market-analysis-template.md` |
| **hiring-review** | Evaluate team gaps, propose hires via board approval | Primary owner reviews team | — |
| **tech-stack** | Evaluate and document technology choices | Primary owner evaluates stack | `tech-stack-template.md` |
| **architecture-plan** | Design system architecture + design system (with UI Designer) | Engineer designs architecture; Designer defines design system | `architecture-template.md`, `design-system-template.md` |

### Engineering Workflow

| Module | What it does | Kickoff task | Doc template |
| ------ | ------------ | ------------ | ------------ |
| **github-repo** | Git workflow and commit conventions | Engineer initializes repo | `git-workflow.md` |
| **pr-review** | PR-based review (activates with code-reviewer or product-owner) | Engineer sets up branch protection | `pr-conventions.md` |
| **roadmap-to-issues** | Auto-generates issues from goals when backlog runs low | Primary owner creates initial backlog | — |
| **auto-assign** | Assigns unassigned issues to idle agents | — | — |
| **stall-detection** | Detects stuck handovers and nudges or escalates | — | — |

## Template Catalogue

### Roles

Every company starts with **CEO** and **Engineer** (base roles). These optional roles extend the team:

#### Product Owner

| | |
|-|-|
| **Paperclip role** | `pm` |
| **Reports to** | CEO |
| **Enhances** | Takes over roadmap-to-issues, auto-assign, hiring-review from CEO |
| **Review** | Adds product-alignment review pass (with pr-review module) |

The voice of the user. Owns the backlog pipeline, validates engineering output against goals, manages scope discipline.

#### Code Reviewer

| | |
|-|-|
| **Paperclip role** | `qa` |
| **Reports to** | CEO |
| **Enhances** | Enables pr-review module activation |

Owns code quality. Reviews PRs for correctness, style, security, and test coverage. Never writes code — only reviews it.

#### UI & Brand Designer

| | |
|-|-|
| **Paperclip role** | `designer` |
| **Reports to** | CEO |
| **Enhances** | Takes over design-system from Engineer; contributes UI layer to architecture-plan |
| **Review** | Adds design review pass (with pr-review module) |

Owns visual identity, design systems, and brand consistency. Creates design specs that engineers implement. Outputs are design documents, not code.

#### UX Researcher

| | |
|-|-|
| **Paperclip role** | `researcher` |
| **Reports to** | CEO |
| **Enhances** | Takes over market-analysis from Product Owner/CEO; contributes user metrics to vision-workshop |
| **Review** | Adds UX review pass (with pr-review module) |

Owns user experience research, usability analysis, and journey mapping. Grounds design and product decisions in evidence-based user insights.

---

### Modules

#### vision-workshop

Defines the strategic foundation. The CEO runs a vision workshop to refine the company goal into a vision statement, success metrics, and milestones.

```
Capability: none (CEO-only strategic task)
Task:       "Define company vision, success metrics, and strategic milestones" → CEO
Doc:        docs/vision-template.md
```

With UX Researcher: contributes user-centered metrics and journey mapping to the vision document.

#### market-analysis

Researches the target market, competitors, and positioning.

```
Capability: market-analysis
  Owners:   ux-researcher → product-owner → ceo
  Fallback: CEO creates a brief overview only if primary owner is absent
Task:       "Conduct initial market analysis" → primary owner
Doc:        docs/market-analysis-template.md
```

#### hiring-review

Evaluates team composition against the goal and proposes hires through board approval.

```
Capability: hiring-review
  Owners:   product-owner → ceo
  Fallback: CEO proposes one urgent hire only if primary owner is absent
Task:       "Evaluate team composition and propose new hires" → primary owner
```

#### tech-stack

Evaluates technology options and documents decisions with rationale and trade-offs.

```
Capability: tech-stack
  Owners:   engineer → ceo
  Fallback: CEO makes pragmatic defaults, marks them provisional for engineer review
Task:       "Evaluate and document technology choices" → primary owner
Doc:        docs/tech-stack-template.md
```

#### architecture-plan

Designs the system architecture. Requires `tech-stack`. Includes a **design-system** capability that activates when a UI Designer is present.

```
Capability: architecture-plan
  Owners:   engineer → ceo
  Fallback: CEO sketches a minimal outline for engineer review
Task:       "Design initial system architecture" → primary owner
Doc:        docs/architecture-template.md

Capability: design-system
  Owners:   ui-designer → engineer
  Fallback: Engineer sets up sensible defaults (Tailwind-style)
Task:       "Define design system and visual language" → primary owner
Doc:        docs/design-system-template.md
```

With UI Designer: the designer owns the full design system and contributes the UI architecture layer. Without: the engineer sets up minimal defaults.

#### github-repo

Git workflow and commit conventions.

```
Task:       "Initialize GitHub repository" → engineer
Doc:        docs/git-workflow.md
```

#### pr-review

PR-based review workflow. Requires `github-repo`. Activates with `code-reviewer` or `product-owner`.

```
Task:       "Set up branch protection and PR requirements" → engineer
Doc:        docs/pr-conventions.md
```

#### roadmap-to-issues

Auto-generates issues from the roadmap when the backlog runs low.

```
Capability: roadmap-to-issues
  Owners:   product-owner → ceo
  Fallback: CEO creates 1-2 issues only when backlog is critically empty
Task:       "Create roadmap and generate initial backlog" → primary owner
```

#### auto-assign

Assigns unassigned issues to idle agents.

```
Capability: auto-assign
  Owners:   product-owner → ceo
  Fallback: CEO assigns only when agents are critically idle
```

#### stall-detection

Detects issues stuck in `in_progress` or `in_review` with no recent activity. Nudges the assigned agent, escalates to the board if nudging doesn't help.

```
Capability: stall-detection (CEO-only)
```

---

### Preset Compositions

**fast** — Solo engineer, direct-to-main, automated backlog. No review, no planning phase.

**quality** — Full review pipeline. Product Owner manages backlog and product alignment, Code Reviewer gates code quality. Feature branches with PR workflow.

**rad** — Rapid Application Development. Pick a tech stack, start building, hire when you hit bottlenecks. No upfront market research or architecture formalization — prototype first, learn from what you build, formalize later.

**startup** — Strategy-first. Starts with vision, market analysis, tech evaluation, and hiring review before any code. CEO and Engineer grow the team through board approvals.

**research** — Planning only. Vision, market research, tech evaluation, and team assessment. No repo, no code workflow. Upgrade to `startup` or `full` when ready to build.

**full** — Everything. Full strategic planning, quality engineering with PR review, team growth via hiring review. Product Owner and Code Reviewer included. Best for serious projects that need both strategy and engineering rigor.

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
├── module.json                  # Name, capabilities, activatesWithRoles, tasks
├── skills/                      # Shared skills (used by any primary owner)
│   └── <skill>.md               # One file per capability
├── agents/<role>/skills/        # Role-specific overrides and fallbacks
│   ├── <skill>.md               # Override: replaces shared skill for this role
│   └── <skill>.fallback.md      # Fallback: safety-net variant for non-primary owners
└── docs/                        # Shared docs (→ docs/)
```

#### module.json

```json
{
  "name": "my-module",
  "requires": ["other-module"],
  "activatesWithRoles": ["my-role"],
  "capabilities": [
    {
      "skill": "my-skill",
      "owners": ["my-role", "ceo"],
      "fallbackSkill": "my-skill.fallback"
    }
  ],
  "tasks": [
    {
      "title": "Initial task",
      "assignTo": "capability:my-skill",
      "description": "Task description"
    }
  ]
}
```

- `requires` — other modules that must be selected (no runtime enforcement yet)
- `activatesWithRoles` — module only applies if at least one of these roles is present
- `capabilities[].owners` — priority order; first present role gets the primary skill, others get fallback
- `capabilities[].fallbackSkill` — filename (without .md) of the fallback variant
- `tasks[].assignTo` — a role name (`"engineer"`) or `"capability:<skill>"` to auto-resolve to the primary owner

#### Skill resolution

When assembling a capability's primary skill for a role, the system checks in order:

1. **Role-specific override**: `agents/<role>/skills/<skill>.md`
2. **Shared skill**: `skills/<skill>.md`

The first match wins. This means:

- **Most capabilities only need a shared `skills/<skill>.md`** — the same instructions work for any primary owner (Product Owner, CEO, UX Researcher, etc.)
- **Role-specific overrides** are only needed when a role brings a genuinely different approach (e.g., UX Researcher does user-focused market analysis vs the generic version)
- **Fallback variants** (`<skill>.fallback.md`) are always role-specific because they describe reduced-scope behavior for a specific agent

```text
Example: market-analysis module
├── skills/
│   └── market-analysis.md                           # Shared: any primary owner uses this
├── agents/
│   ├── ux-researcher/skills/
│   │   └── market-analysis.md                       # Override: user-focused deep dive
│   └── ceo/skills/
│       └── market-analysis.fallback.md              # Fallback: brief overview only
```

In this example:
- If **UX Researcher** is present → gets their role-specific override (user-focused)
- If **Product Owner** is primary (no UX Researcher) → gets the shared skill
- If **CEO** is primary (no PO, no UXR) → gets the shared skill
- **CEO** as fallback (when someone else is primary) → gets the fallback variant

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
