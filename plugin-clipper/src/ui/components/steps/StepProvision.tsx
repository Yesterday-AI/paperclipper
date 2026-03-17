import { useEffect, useRef, useState } from "react";
import { useWizard, useWizardDispatch, getAllRoles } from "../../context/WizardContext";
import { usePluginAction, usePluginStream } from "@paperclipai/plugin-sdk/ui";
import { Loader2 } from "lucide-react";

interface ProvisionEvent {
  type: "log" | "result" | "error";
  message?: string;
  data?: Record<string, unknown>;
}

export function StepProvision() {
  const state = useWizard();
  const dispatch = useWizardDispatch();
  const started = useRef(false);
  const logEndRef = useRef<HTMLDivElement>(null);
  const [channel, setChannel] = useState<string | null>(null);
  const startProvision = usePluginAction("start-provision");

  // Subscribe to the provision stream once we have a channel
  const stream = usePluginStream<ProvisionEvent>(
    channel ?? "__none__",
    channel ? {} : undefined,
  );

  // Process incoming stream events
  useEffect(() => {
    if (!stream.events || stream.events.length === 0) return;

    for (const event of stream.events) {
      if (event.type === "log" && event.message) {
        dispatch({ type: "ADD_PROVISION_LOG", line: event.message });
      } else if (event.type === "result" && event.data) {
        dispatch({ type: "ADD_PROVISION_LOG", line: "" });
        dispatch({ type: "ADD_PROVISION_LOG", line: "All done!" });
        dispatch({ type: "SET_PROVISION_RESULT", result: event.data as any });
        setTimeout(() => dispatch({ type: "GO_TO", step: "done" }), 2000);
      } else if (event.type === "error") {
        dispatch({
          type: "SET_ERROR",
          error: event.message || "Provisioning failed",
        });
      }
    }
  }, [stream.events, dispatch]);

  // Auto-scroll log
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.provisionLog]);

  // Kick off provisioning on mount
  useEffect(() => {
    if (started.current) return;
    started.current = true;

    dispatch({ type: "SET_PROVISIONING", value: true });
    dispatch({ type: "ADD_PROVISION_LOG", line: "Starting provisioning..." });
    dispatch({ type: "ADD_PROVISION_LOG", line: "" });

    const allRoles = getAllRoles(state);

    startProvision({
      companyName: state.companyName,
      goal: state.goal.title ? state.goal : undefined,
      project: state.project.name ? state.project : undefined,
      presetName: state.presetName,
      selectedModules: state.selectedModules,
      selectedRoles: state.selectedRoles,
      allRoles,
    })
      .then((result: any) => {
        if (result?.channel) {
          setChannel(result.channel);
        }
      })
      .catch((err: unknown) => {
        dispatch({
          type: "SET_ERROR",
          error: err instanceof Error ? err.message : "Provisioning failed",
        });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isDone = !state.provisioning && state.provisionResult;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
          {state.provisioning && <Loader2 className="h-5 w-5 animate-spin" />}
          {state.provisioning
            ? "Provisioning..."
            : state.error
              ? "Error"
              : "Provisioned"}
        </h2>
        {isDone && (
          <p className="text-sm text-muted-foreground">
            Company assembled and registered with Paperclip. Redirecting...
          </p>
        )}
        {state.error && (
          <p className="text-sm text-destructive">{state.error}</p>
        )}
      </div>

      <div className="rounded-lg border bg-card p-4 font-mono text-xs max-h-[400px] overflow-y-auto">
        {state.provisionLog.map((line, i) => (
          <div
            key={i}
            className={
              line.startsWith("✓")
                ? "text-green-600 py-0.5"
                : line.startsWith("!")
                  ? "text-yellow-600 py-0.5"
                  : line.startsWith("Error")
                    ? "text-destructive py-0.5"
                    : line.startsWith("+") || line.startsWith("  ")
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
