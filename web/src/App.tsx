import { presets, modules, roles } from "virtual:clipper-templates";
import { WizardProvider } from "./context/WizardContext";
import { WizardShell } from "./components/WizardShell";

export function App() {
  return (
    <WizardProvider templates={{ presets, modules, roles }}>
      <WizardShell />
    </WizardProvider>
  );
}
