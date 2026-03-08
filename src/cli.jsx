import React from "react";
import { render } from "ink";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import App from "./app.jsx";
import { runHeadless } from "./headless.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = join(__dirname, "..", "templates");

const HELP = `
  Clipper — Bootstrap a Paperclip company workspace

  Usage:
    clipper [options]

  Company options:
    --name <name>              Company name (required for non-interactive)
    --goal <title>             Company goal title
    --goal-description <desc>  Goal description
    --project <name>           Project name (default: company name)
    --project-description <d>  Project description
    --repo <url>               GitHub repository URL
    --preset <name>            Preset: fast, quality, rad, startup, research, full
    --modules <a,b,c>          Comma-separated module names (added to preset)
    --roles <a,b>              Comma-separated extra role names (added to preset)

  Infrastructure options:
    --output <dir>             Output directory (default: ./companies/)
    --api                      Provision via Paperclip API after assembly
    --api-url <url>            Paperclip API URL (default: http://localhost:3100)
    --model <model>            LLM model for agents (default: adapter default)
    --start                    Start CEO heartbeat after provisioning (implies --api)

  Modes:
    Interactive (default)      Wizard prompts for missing values
    Non-interactive            Pass --name and --preset (minimum) to skip the wizard

  Examples:
    clipper                                          # interactive wizard
    clipper --name "Acme" --preset fast               # headless, files only
    clipper --name "Acme" --preset startup --api      # headless + API provisioning
    clipper --name "Acme" --preset fast --roles product-owner --modules pr-review
    clipper --name "Acme" --preset custom --modules github-repo,auto-assign

  -h, --help                   Show this help
`;

// Parse CLI flags
function parseArgs(argv) {
  const args = argv.slice(2);
  const config = {
    outputDir: join(process.cwd(), "companies"),
    apiEnabled: false,
    apiBaseUrl: "http://localhost:3100",
    model: null,
    startCeo: false,
    // Company options
    name: null,
    goal: null,
    goalDescription: null,
    projectName: null,
    projectDescription: null,
    repo: null,
    preset: null,
    modules: [],
    roles: [],
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];

    switch (arg) {
      case "--output":
        config.outputDir = resolve(next);
        i++;
        break;
      case "--api":
        config.apiEnabled = true;
        break;
      case "--api-url":
        config.apiBaseUrl = next;
        config.apiEnabled = true;
        i++;
        break;
      case "--start":
        config.startCeo = true;
        config.apiEnabled = true;
        break;
      case "--model":
        config.model = next;
        i++;
        break;
      case "--name":
        config.name = next;
        i++;
        break;
      case "--goal":
        config.goal = next;
        i++;
        break;
      case "--goal-description":
        config.goalDescription = next;
        i++;
        break;
      case "--project":
        config.projectName = next;
        i++;
        break;
      case "--project-description":
        config.projectDescription = next;
        i++;
        break;
      case "--repo":
        config.repo = next;
        i++;
        break;
      case "--preset":
        config.preset = next;
        i++;
        break;
      case "--modules":
        config.modules = next.split(",").map((s) => s.trim()).filter(Boolean);
        i++;
        break;
      case "--roles":
        config.roles = next.split(",").map((s) => s.trim()).filter(Boolean);
        i++;
        break;
      case "--help":
      case "-h":
        console.log(HELP);
        process.exit(0);
        break;
      default:
        if (arg.startsWith("-")) {
          console.error(`Unknown flag: ${arg}`);
          console.error("Run clipper --help for usage.");
          process.exit(1);
        }
    }
  }

  return config;
}

const config = parseArgs(process.argv);

// Headless mode: --name + --preset are the minimum for non-interactive
const isHeadless = config.name && config.preset;

if (isHeadless) {
  runHeadless({
    ...config,
    templatesDir: TEMPLATES_DIR,
  }).catch((err) => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  });
} else {
  // Interactive wizard (Ink)
  const app = render(
    <App
      outputDir={config.outputDir}
      templatesDir={TEMPLATES_DIR}
      apiEnabled={config.apiEnabled}
      apiBaseUrl={config.apiBaseUrl}
      model={config.model}
      startCeo={config.startCeo}
      // Pass pre-filled values from flags
      initialName={config.name}
      initialGoal={config.goal}
      initialGoalDescription={config.goalDescription}
      initialProjectName={config.projectName}
      initialProjectDescription={config.projectDescription}
      initialRepo={config.repo}
      initialPreset={config.preset}
      initialModules={config.modules}
      initialRoles={config.roles}
    />
  );

  await app.waitUntilExit();
}
