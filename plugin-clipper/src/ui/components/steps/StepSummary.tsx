import { useWizard, useWizardDispatch } from "../../context/WizardContext";
import { Button } from "../ui/button";
import { ConfigReview } from "../ConfigReview";

export function StepSummary() {
  const state = useWizard();
  const dispatch = useWizardDispatch();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">Review</h2>
        <p className="text-sm text-muted-foreground">
          Confirm your company configuration before creating. Click any field to edit.
        </p>
      </div>

      <ConfigReview />

      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => dispatch({ type: "GO_TO", step: "roles" })}
        >
          Back
        </Button>
        <Button onClick={() => dispatch({ type: "GO_TO", step: "provision" })}>
          Create Company
        </Button>
      </div>
    </div>
  );
}
