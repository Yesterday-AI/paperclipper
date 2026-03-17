import type { PaperclipPluginManifestV1 } from "@paperclipai/plugin-sdk";

const manifest: PaperclipPluginManifestV1 = {
  id: "paperclipai.plugin-clipper",
  apiVersion: 1,
  version: "0.1.0",
  displayName: "Company Creator",
  description: "AI-powered wizard to bootstrap agent companies from composable templates",
  author: "Yesterday AI",
  categories: ["workspace", "ui"],
  capabilities: [
    "companies.read",
    "issues.create",
    "issues.read",
    "goals.create",
    "goals.read",
    "agents.read",
    "projects.read",
    "plugin.state.read",
    "plugin.state.write",
    "events.subscribe",
    "ui.page.register",
    "ui.sidebar.register",
  ],
  instanceConfigSchema: {
    type: "object",
    properties: {
      templatesPath: {
        type: "string",
        default: "/templates/clipper",
        description: "Path to Clipper templates directory (container path if Docker).",
      },
      workdir: {
        type: "string",
        description: "Path where company workspaces are written. Default: $PAPERCLIP_HOME/workspaces",
      },
      paperclipUrl: {
        type: "string",
        default: "http://localhost:3100",
        description: "Paperclip API URL (as seen from the worker process).",
      },
      paperclipEmail: {
        type: "string",
        description: "Board login email (for authenticated instances).",
      },
      paperclipPassword: {
        type: "string",
        description: "Board login password.",
      },
    },
  },
  entrypoints: {
    worker: "./dist/worker.js",
    ui: "./dist/ui",
  },
  ui: {
    slots: [
      {
        type: "page",
        id: "company-wizard",
        displayName: "Company Creator",
        exportName: "WizardPage",
        routePath: "company-creator",
      },
      {
        type: "sidebar",
        id: "company-wizard-link",
        displayName: "Create Company",
        exportName: "SidebarLink",
      },
    ],
  },
};

export default manifest;
