# Clipper Web — Roadmap

## Done

- [x] Project scaffold (Vite + React 19 + TS + Tailwind v4 + shadcn/ui)
- [x] Paperclip-identical OKLCh theme system
- [x] Build-time template loader (Vite virtual module)
- [x] Wizard state machine (useReducer, 11 steps)
- [x] Two-path onboarding: "Setup my own org" vs "Autonomous from idea" (Dotta pattern)
- [x] Manual wizard flow: Name → Goal → Project → Preset → Modules → Roles → Summary
- [x] AI wizard flow: 4-phase (Describe → Interview → Configure → Review)
- [x] Multi-turn AI interview mode (3-question guided conversation)
- [x] Module dependency logic (auto-select deps, block deselect)
- [x] Role gating (activatesWithRoles awareness)
- [x] CLI command generation for assembly + provisioning
- [x] Step indicator with progress bar
- [x] Editable review in both modes (inline edit fields, toggleable modules/roles)
- [x] Detailed configuration view (roles with enhances, modules with capabilities/tasks)
- [x] Shared ConfigReview component (used by both manual and AI flows)

## Next

- [ ] **Direct API provisioning** — call Paperclip REST API from browser (skip CLI step)
  - PaperclipClient is already browser-compatible (pure fetch)
  - Needs: Company → Goal → Project → Agents → Issues flow in StepProvision
  - Assembly (file writing) still requires CLI or server endpoint

- [ ] **Team templates** — pre-assembled complete teams as a third onboarding path
  - Load from `paperclipai/companies` repo (Marketing Agency, Research Team, Startup Essentials)
  - Show as example cards alongside presets in StepPreset or as a new StepTemplate
  - Allow users to save their own company configs as reusable templates
  - Template format: full agent directory tree (AGENTS.md, SOUL.md, HEARTBEAT.md, TOOLS.md per role)
  - Needs: template import/export, local storage or API persistence for custom templates

- [ ] **Paperclip plugin integration** — package as a `page` slot plugin
  - Blocked on: plugin system implementation in Paperclip (post-V1, see `doc/plugins/PLUGIN_SPEC.md`)
  - See: [PLUGIN-INTEGRATION.md](./PLUGIN-INTEGRATION.md) for full architecture plan
  - Steps when unblocked:
    1. Create `@paperclipai/plugin-clipper` package with manifest + worker + UI bundle
    2. Worker: template loading via `getData`, provisioning via `performAction`
    3. UI: export `WizardPage` for `page` slot, use `usePluginData`/`usePluginAction` bridge
    4. Manifest: declare capabilities (`companies.create`, `agents.create`, `ui.page.register`)
    5. Publish to npm, install via `pnpm paperclipai plugin install`

## Later

- [ ] Dark mode toggle
- [ ] Template gallery / marketplace (browse community templates)
- [ ] Live preview of assembled HEARTBEAT.md / AGENTS.md during wizard
- [ ] Drag-and-drop org chart editor for role hierarchy
- [ ] Cost estimation based on selected roles + adapter models
- [ ] Template versioning and diffing
