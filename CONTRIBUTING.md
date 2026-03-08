# Contributing to Clipper

Thanks for your interest in contributing! Clipper is a template system and CLI for bootstrapping [Paperclip](https://github.com/paperclipai/paperclip) company workspaces.

## Getting Started

```sh
git clone https://github.com/Yesterday-AI/paperclipper.git
cd paperclipper
npm install
npm run build
```

## Development

```sh
npm run build          # esbuild: src/cli.jsx → dist/cli.mjs
npm test               # node --test src/logic/*.test.js
node dist/cli.mjs      # run the CLI
```

The CLI uses Ink (React for terminals) and requires a TTY — it won't work in piped or non-interactive contexts.

## Project Structure

```text
src/
├── cli.jsx              # Entry point, flag parsing
├── app.jsx              # Wizard state machine
├── components/          # One component per wizard step
├── logic/               # Pure functions (assembly, resolution)
├── api/                 # Paperclip API client and provisioning
└── shims/               # Build shims (react-devtools-core)

templates/
├── base/                # Always-present roles (CEO, Engineer)
├── roles/               # Optional roles (Product Owner, Code Reviewer, etc.)
├── modules/             # Composable capabilities with skills and docs
└── presets/             # Curated module+role combinations
```

## Adding Templates

### New module

See [Extending → Add a module](README.md#add-a-module) in the README. Key points:

- Every capability needs a shared skill in `skills/<skill>.md`
- Role-specific overrides go in `agents/<role>/skills/<skill>.md` (only when genuinely different)
- Fallback variants are always role-specific
- Add tests in `src/logic/assemble.test.js` if the module has non-trivial resolution logic

### New role

See [Extending → Add a role](README.md#add-a-role). Map `paperclipRole` to a valid Paperclip enum value.

### New preset

See [Extending → Add a preset](README.md#add-a-preset). Test that the module combination works end-to-end.

## Pull Requests

- Keep PRs focused — one feature or fix per PR
- Add or update tests for logic changes
- Run `npm test` before submitting
- Update the README if you add modules, roles, or presets

## Code Style

- ESM only (`type: "module"`)
- JSX with React 19 automatic runtime
- No TypeScript — plain JS with JSDoc where helpful
- Prefer pure functions in `src/logic/`

## Reporting Issues

Use [GitHub Issues](https://github.com/Yesterday-AI/paperclipper/issues). Include:

- What you expected vs what happened
- Node.js version (`node --version`)
- OS and terminal

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
