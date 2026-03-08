const BASE_ROLE_MAP = {
  ceo: "ceo",
  engineer: "engineer",
};

/**
 * Minimal Paperclip API client using native fetch.
 * Designed for local instances (no auth required in local_implicit mode).
 */
export class PaperclipClient {
  constructor(baseUrl = "http://localhost:3100") {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  async _fetch(path, opts = {}) {
    const url = `${this.baseUrl}${path}`;
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json", ...opts.headers },
      ...opts,
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`${opts.method || "GET"} ${path} → ${res.status}: ${body}`);
    }
    return res.json();
  }

  async ping() {
    try {
      await fetch(`${this.baseUrl}/api/companies`, { method: "GET" });
      return true;
    } catch {
      return false;
    }
  }

  async createCompany({ name, description }) {
    return this._fetch("/api/companies", {
      method: "POST",
      body: JSON.stringify({ name, description: description || null }),
    });
  }

  async createAgent(companyId, { name, role, title, adapterConfig }) {
    return this._fetch(`/api/companies/${companyId}/agents`, {
      method: "POST",
      body: JSON.stringify({
        name,
        role,
        title: title || null,
        adapterType: "claude_local",
        adapterConfig: adapterConfig || {},
      }),
    });
  }

  async createProject(companyId, { name, description, workspace }) {
    return this._fetch(`/api/companies/${companyId}/projects`, {
      method: "POST",
      body: JSON.stringify({
        name,
        description: description || null,
        workspace: workspace || undefined,
      }),
    });
  }

  async createGoal(companyId, { title, description, level }) {
    return this._fetch(`/api/companies/${companyId}/goals`, {
      method: "POST",
      body: JSON.stringify({
        title,
        description: description || null,
        level: level || "company",
        status: "active",
      }),
    });
  }

  async createIssue(companyId, { title, description, priority, projectId, goalId }) {
    return this._fetch(`/api/companies/${companyId}/issues`, {
      method: "POST",
      body: JSON.stringify({
        title,
        description: description || null,
        priority: priority || "medium",
        projectId: projectId || undefined,
        goalId: goalId || undefined,
      }),
    });
  }

  async triggerHeartbeat(agentId) {
    return this._fetch(`/api/agents/${agentId}/heartbeat/invoke`, {
      method: "POST",
    });
  }

  /**
   * Resolve a clipper role name to a Paperclip API role enum.
   * Uses role.json's paperclipRole field, falls back to 'general'.
   */
  static resolveRole(clipperRole, roleData) {
    // Check base roles first
    if (BASE_ROLE_MAP[clipperRole]) return BASE_ROLE_MAP[clipperRole];
    // Check role.json data
    if (roleData?.paperclipRole) return roleData.paperclipRole;
    return "general";
  }
}
