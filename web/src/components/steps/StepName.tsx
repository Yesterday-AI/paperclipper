import { useWizard, useWizardDispatch, nextStep } from "@/context/WizardContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toPascalCase } from "@/lib/utils";
import { useCallback } from "react";

export function StepName() {
  const state = useWizard();
  const dispatch = useWizardDispatch();

  const handleNext = useCallback(() => {
    if (state.companyName.trim()) {
      dispatch({ type: "GO_TO", step: nextStep(state) });
    }
  }, [state, dispatch]);

  const dirName = state.companyName.trim()
    ? toPascalCase(state.companyName)
    : "YourCompany";

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">Company name</h2>
        <p className="text-sm text-muted-foreground">
          What should your AI company be called?
        </p>
      </div>

      <div className="space-y-3">
        <Input
          placeholder="e.g. Acme Corp, Black Mesa, Initech"
          value={state.companyName}
          onChange={(e) => dispatch({ type: "SET_COMPANY_NAME", value: e.target.value })}
          onKeyDown={(e) => e.key === "Enter" && handleNext()}
          autoFocus
          className="text-base h-11"
        />
        <p className="text-xs text-muted-foreground">
          Workspace directory: <code className="bg-muted px-1.5 py-0.5 rounded">{dirName}/</code>
        </p>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleNext} disabled={!state.companyName.trim()}>
          Continue
        </Button>
      </div>
    </div>
  );
}
