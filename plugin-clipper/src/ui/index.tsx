import { usePluginData, type PluginPageProps, type PluginSidebarProps, type PluginWidgetProps } from "@paperclipai/plugin-sdk/ui";
import { Sparkles } from "lucide-react";
import { WizardProvider } from "./context/WizardContext";
import { WizardShell } from "./components/WizardShell";
import type { TemplateData } from "./types";
import "./index.css";

const PLUGIN_ID = "paperclipai.plugin-clipper";

export function WizardPage(_props: PluginPageProps) {
  const { data: templates, loading, error } = usePluginData<TemplateData>("templates");

  if (loading || !templates) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-sm text-muted-foreground">
        Loading templates...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-sm text-destructive">
        Failed to load templates: {error.message}
      </div>
    );
  }

  return (
    <WizardProvider templates={templates}>
      <WizardShell />
    </WizardProvider>
  );
}

export function ToolbarButton({ context }: PluginWidgetProps) {
  const companyPrefix = (context as any).companyPrefix;
  const href = companyPrefix
    ? `/${companyPrefix}/company-creator`
    : "#";

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (href !== "#") window.history.pushState({}, "", href);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.375rem",
        padding: "0.25rem 0.625rem",
        fontSize: "12px",
        fontWeight: 500,
        borderRadius: "0.375rem",
        border: "1px solid var(--border)",
        color: "inherit",
        textDecoration: "none",
        transition: "background-color 0.15s",
      }}
    >
      + Company
    </a>
  );
}

export function SidebarLink({ context }: PluginSidebarProps) {
  const href = context.companyPrefix
    ? `/${context.companyPrefix}/company-creator`
    : "#";
  const isActive = typeof window !== "undefined" && window.location.pathname.endsWith("/company-creator");

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (href !== "#") window.history.pushState({}, "", href);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      aria-current={isActive ? "page" : undefined}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.625rem",
        padding: "0.5rem 0.75rem",
        fontSize: "13px",
        fontWeight: 500,
        borderRadius: "0.375rem",
        color: "inherit",
        textDecoration: "none",
        transition: "background-color 0.15s",
        backgroundColor: isActive ? "var(--accent)" : "transparent",
      }}
    >
      <Sparkles style={{ width: 16, height: 16, flexShrink: 0 }} />
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Create Company</span>
    </a>
  );
}
