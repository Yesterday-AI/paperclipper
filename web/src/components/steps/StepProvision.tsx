import { useEffect, useRef } from "react";
import { useWizard, useWizardDispatch, getAllRoles } from "@/context/WizardContext";
import { Loader2 } from "lucide-react";
import { toPascalCase } from "@/lib/utils";

export function StepProvision() {
  const state = useWizard();
  const dispatch = useWizardDispatch();
  const started = useRef(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.provisionLog]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    runProvision();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runProvision() {
    dispatch({ type: "SET_PROVISIONING", value: true });
    const log = (msg: string) => dispatch({ type: "ADD_PROVISION_LOG", line: msg });

    try {
      // For now, generate the CLI command instead of calling API directly
      // This is the safest approach — no filesystem access needed from browser
      const allRoles = getAllRoles(state);
      const companyDir = toPascalCase(state.companyName || "Company");

      log("Preparing configuration...");
      log("");
      log(`Company: ${state.companyName}`);
      log(`Directory: ${companyDir}/`);
      log(`Preset: ${state.presetName}`);
      log(`Modules: ${state.selectedModules.join(", ")}`);
      log(`Roles: ${allRoles.join(", ")}`);
      if (state.goal.title) log(`Goal: ${state.goal.title}`);
      if (state.project.name) log(`Project: ${state.project.name}`);
      log("");

      // Build CLI command
      const args = [`--name "${state.companyName}"`];
      if (state.presetName && state.presetName !== "custom") {
        args.push(`--preset ${state.presetName}`);
      }
      if (state.goal.title) args.push(`--goal "${state.goal.title}"`);
      if (state.goal.description) args.push(`--goal-description "${state.goal.description}"`);
      if (state.project.name) args.push(`--project "${state.project.name}"`);
      if (state.project.repoUrl) args.push(`--repo "${state.project.repoUrl}"`);
      if (state.presetName === "custom" && state.selectedModules.length > 0) {
        args.push(`--modules ${state.selectedModules.join(",")}`);
      }
      if (state.selectedRoles.length > 0) {
        args.push(`--roles ${state.selectedRoles.join(",")}`);
      }
      args.push("--api");

      const cliCommand = `node dist/cli.mjs ${args.join(" \\\n  ")}`;

      log("To assemble and provision, run this command in the Clipper directory:");
      log("");
      log("```");
      log(cliCommand);
      log("```");
      log("");
      log("Done! The command above will:");
      log("  1. Assemble agent files to disk");
      log("  2. Create the company in Paperclip via API");
      log("  3. Set up agents, goals, project, and initial tasks");

      // Simulate success for now
      await new Promise((r) => setTimeout(r, 500));

      dispatch({
        type: "SET_PROVISION_RESULT",
        result: {
          companyId: "(run CLI to create)",
          agentIds: Object.fromEntries(allRoles.map((r) => [r, "pending"])),
          issueIds: [],
        },
      });
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        error: err instanceof Error ? err.message : "Provisioning failed",
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
          {state.provisioning && <Loader2 className="h-5 w-5 animate-spin" />}
          {state.provisioning ? "Creating..." : "Ready"}
        </h2>
      </div>

      <div className="rounded-lg border bg-card p-4 font-mono text-xs max-h-[400px] overflow-y-auto">
        {state.provisionLog.map((line, i) => (
          <div
            key={i}
            className={
              line.startsWith("```")
                ? "hidden"
                : line.startsWith("  ") || line.startsWith("node ")
                  ? "text-foreground pl-2 py-0.5 bg-muted/50 rounded my-0.5"
                  : "text-muted-foreground py-0.5"
            }
          >
            {line || "\u00A0"}
          </div>
        ))}
        <div ref={logEndRef} />
      </div>
    </div>
  );
}
