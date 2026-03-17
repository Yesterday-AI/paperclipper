import { definePlugin, runWorker } from "@paperclipai/plugin-sdk";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// --- Template loader (simplified from CLI's load-templates.js) ---

function loadJsonFiles(dir: string, filename: string) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((d) => {
      try { return fs.statSync(path.join(dir, d)).isDirectory(); } catch { return false; }
    })
    .map((d) => {
      const fp = path.join(dir, d, filename);
      if (!fs.existsSync(fp)) return null;
      try { return JSON.parse(fs.readFileSync(fp, "utf-8")); } catch { return null; }
    })
    .filter(Boolean);
}

function resolveTemplatesDir(configPath?: string): string {
  if (configPath) return configPath;
  const containerDefault = "/templates/clipper";
  if (fs.existsSync(containerDefault)) return containerDefault;
  return path.resolve(__dirname, "..", "..", "..", "templates");
}

function loadTemplates(templatesDir: string) {
  const presets = loadJsonFiles(path.join(templatesDir, "presets"), "preset.meta.json");
  const modules = loadJsonFiles(path.join(templatesDir, "modules"), "module.meta.json");
  const roles = loadJsonFiles(path.join(templatesDir, "roles"), "role.meta.json").map(
    (r: Record<string, unknown>) => {
      if (r.base) return { ...r, _base: true };
      return r;
    }
  );
  return { presets, modules, roles };
}

// --- Plugin definition ---

const plugin = definePlugin({
  async setup(ctx) {
    const cfg = (ctx.config ?? {}) as Record<string, string>;
    const templatesPath = cfg.templatesPath || "";
    const paperclipHome = process.env.PAPERCLIP_HOME || path.join(process.env.HOME || "/tmp", ".paperclip");
    const workdir = cfg.workdir || path.join(paperclipHome, "workspaces");
    const paperclipUrl = cfg.paperclipUrl || process.env.PAPERCLIP_PUBLIC_URL || "http://localhost:3100";
    const paperclipEmail = cfg.paperclipEmail || "";
    const paperclipPassword = cfg.paperclipPassword || "";

    // Serve template data to the UI
    ctx.data.register("templates", async () => {
      return loadTemplates(resolveTemplatesDir(templatesPath));
    });

    // Provisioning action — assembles company files + provisions via Paperclip API
    ctx.actions.register("start-provision", async (params) => {
      const companyName = typeof params.companyName === "string" ? params.companyName : "";
      if (!companyName) throw new Error("companyName is required");

      const channelId = `provision-${Date.now()}`;
      ctx.streams.open(channelId);

      void (async () => {
        const emit = (type: string, message?: string, data?: unknown) => {
          ctx.streams.emit(channelId, { type, message, data });
        };

        try {
          const templatesDir = resolveTemplatesDir(templatesPath);

          // Dynamic import of CLI modules (ESM)
          const cliRoot = path.resolve(__dirname, "..", "..", "..");
          const { assembleCompany } = await import(
            /* webpackIgnore: true */
            path.join(cliRoot, "src", "logic", "assemble.js")
          );
          const { provisionCompany } = await import(
            /* webpackIgnore: true */
            path.join(cliRoot, "src", "api", "provision.js")
          );
          const { PaperclipClient } = await import(
            /* webpackIgnore: true */
            path.join(cliRoot, "src", "api", "client.js")
          );
          const { loadPresets, loadModules, collectGoals } = await import(
            /* webpackIgnore: true */
            path.join(cliRoot, "src", "logic", "load-templates.js")
          );

          // Step 1: Collect inline goals from preset + modules
          const [presets, allModules] = await Promise.all([
            loadPresets(templatesDir),
            loadModules(templatesDir),
          ]);
          const selectedPreset = presets.find((p: any) => p.name === params.presetName) || null;
          const goals = collectGoals(selectedPreset, allModules, new Set((params.selectedModules as string[]) ?? []));

          // Step 2: Assemble files to workdir
          fs.mkdirSync(workdir, { recursive: true });
          emit("log", "Assembling company workspace...");

          const assembleResult = await assembleCompany({
            companyName,
            goal: (params.goal as any) || {},
            project: (params.project as any) || {},
            moduleNames: (params.selectedModules as string[]) ?? [],
            extraRoleNames: (params.selectedRoles as string[]) ?? [],
            goals,
            outputDir: workdir,
            templatesDir,
            onProgress: (msg: string) => emit("log", msg),
          });

          const { companyDir, initialTasks, roleAdapterOverrides } = assembleResult;
          const assembledAllRoles: Set<string> = assembleResult.allRoles;

          emit("log", "");
          emit("log", `Assembled to: ${companyDir}`);
          emit("log", "");

          // Step 3: Load role metadata for API provisioning
          const rolesData = new Map();
          for (const role of assembledAllRoles) {
            const metaPath = path.join(templatesDir, "roles", role, "role.meta.json");
            try {
              rolesData.set(role, JSON.parse(fs.readFileSync(metaPath, "utf-8")));
            } catch {
              // Role without metadata
            }
          }

          // Step 4: Provision via Paperclip API
          emit("log", "Connecting to Paperclip API...");
          const client = new PaperclipClient(paperclipUrl, {
            email: paperclipEmail,
            password: paperclipPassword,
          });
          await client.connect();
          emit("log", "Connected.");
          emit("log", "");

          const result = await provisionCompany({
            client,
            companyName,
            companyDir,
            goal: (params.goal as any) || {},
            projectName: (params.project as any)?.name || companyName,
            projectDescription: (params.project as any)?.description ?? null,
            repoUrl: (params.project as any)?.repoUrl ?? null,
            allRoles: assembledAllRoles,
            rolesData,
            initialTasks,
            goals,
            roleAdapterOverrides,
            model: null,
            remoteCompanyDir: companyDir,
            startCeo: false,
            onProgress: (msg: string) => emit("log", msg),
          });

          emit("log", "");
          emit("log", "Provisioning complete!");

          emit("result", undefined, {
            companyId: result.companyId,
            issuePrefix: result.issuePrefix,
            paperclipUrl,
            goalId: result.goalId,
            projectId: result.projectId,
            agentIds: Object.fromEntries(result.agentIds),
            issueIds: result.issueIds,
            goalResults: result.goalResults,
            goalErrors: result.goalErrors,
          });
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err);
          emit("log", `Error: ${message}`);
          emit("error", message);
        } finally {
          ctx.streams.close(channelId);
        }
      })();

      return { channel: channelId };
    });
  },

  async onHealth() {
    return { status: "ok", message: "Company Creator plugin is running" };
  },
});

export default plugin;
runWorker(plugin, import.meta.url);
