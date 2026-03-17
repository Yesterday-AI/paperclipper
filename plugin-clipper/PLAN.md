# Plan: Clipper as Paperclip Plugin

## What was built

`clipper/plugin-clipper/` — a Paperclip plugin that replaces `clipper/web/`. The worker runs inside the Paperclip container as a child process. It writes files to the bind-mounted workdir and provisions via `PaperclipClient` with email/password. Runtime config via environment variables (`.env`), not plugin instance config.

## Requirements

- [ ] Plugin is self-contained (in `plugin-clipper`) -> will be moved to own OSS repository
- [ ] Plugin is usable via paperclipai plugin cli `pnpm paperclipai plugin install`
- [ ] No local mapping of paths required to provide templates to paperclip

## Current status

- [x] Plugin installs and runs in Paperclip (worker running, health ready)
- [x] UI loads in plugin page slot (`/:companyPrefix/company-creator`)
- [x] Templates load from container-mounted path (`/templates/clipper`)
- [x] Wizard renders: onboarding, manual flow, AI wizard, config review
- [x] Client-side navigation (no full-page refresh)
- [x] `+ Company` button in global toolbar
- [x] `Create Company` link in company sidebar
- [x] Removed Radix UI dependency (replaced with native implementations)
- [x] No `useReducer`/`useLayoutEffect` — compatible with Paperclip plugin React shim

## Implementation summary

1. Scaffolded plugin via `create-paperclip-plugin` with `--sdk-path`
2. Copied all wizard components from `web/src/` into `plugin-clipper/src/ui/`
3. Extracted types from `virtual:clipper-templates` into `types.ts`
4. Replaced all `@/` path aliases with relative imports
5. Rewrote `StepProvision` to use `usePluginAction` + `usePluginStream`
6. Rewrote `ui/index.tsx` to export `WizardPage` + `SidebarLink` + `ToolbarButton`
7. Manifest: page + sidebar + globalToolbarButton slots, workspace/ui capabilities
8. Worker: env vars for config, provisions via `PaperclipClient`, writes to bind-mounted workdir
9. Replaced Radix UI with native implementations (hover-card via portal, button asChild via cloneElement)
10. Replaced `useReducer` with `useState` + `useCallback` (not in Paperclip React shim)
11. esbuild config: PostCSS/Tailwind plugin for CSS, `?raw` plugin for markdown imports
12. Client-side navigation via `pushState` + `popstate` (no full-page refresh)

## Remaining

### Must fix
- [ ] Bundle CLI logic into worker so plugin is self-contained (currently dynamic imports to `clipper/src/logic/` and `clipper/src/api/` at runtime)
- [ ] Bundle or embed templates (currently requires container mount at `/templates/clipper`)
- [ ] Verify end-to-end provisioning flow (assembly + API)
- [ ] WizardShell renders own header/layout inside plugin frame — should adapt to embedded context (remove `min-h-screen`, Clipper header, theme toggle)

### Workarounds in place
- Docker volume mount for plugin source (`/host-plugins/plugin-clipper:ro`) — temporary until Paperclip supports plugin file provisioning
- Docker volume mount for templates (`/templates/clipper:ro`) — temporary until templates are bundled
- Plugin page is company-scoped (`/:companyPrefix/company-creator`) — Paperclip has no global page route; `globalToolbarButton` links to company-scoped path

### Paperclip limitations discovered
- All plugin UI slots are company-scoped (no instance-level page/sidebar slot)
- React shim re-exports a curated subset of React hooks — `useReducer`, `useLayoutEffect` etc. not available as named imports
- Plugin page route `plugins/:pluginId` expects UUID, not pluginKey — must use `routePath` for human-readable URLs
- ESM import cache requires container restart after plugin rebuild

### Nice to have
- [ ] Delete `clipper/web/` once fully verified
- [ ] Source maps for plugin UI bundle (currently causes harmless "JSON.parse" warnings)
