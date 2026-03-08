import { join } from "node:path";
import { PaperclipClient } from "./client.js";
import { formatRoleName } from "../logic/resolve.js";

/**
 * Provision a company in Paperclip via the API.
 * This is the optional step after file assembly.
 *
 * @param {object} opts
 * @param {PaperclipClient} opts.client
 * @param {string} opts.companyName
 * @param {string} opts.companyDir - absolute path, used as cwd
 * @param {Set<string>} opts.allRoles
 * @param {Map<string, object>} opts.rolesData - role name → role.json data
 * @param {Array} opts.initialTasks
 * @param {string|null} opts.model - LLM model fallback (overridden by role.json adapter.model)
 * @param {(line: string) => void} opts.onProgress
 * @returns {Promise<{companyId: string, agentIds: Map<string, string>}>}
 */
export async function provisionCompany({
  client,
  companyName,
  companyDir,
  allRoles,
  rolesData = new Map(),
  initialTasks = [],
  model = null,
  onProgress = () => {},
}) {
  // 1. Create company
  onProgress("Creating company...");
  const company = await client.createCompany({ name: companyName });
  const companyId = company.id;
  onProgress(`✓ Company created (${companyId.slice(0, 8)}…)`);

  // 2. Create agents
  const agentIds = new Map();
  for (const role of allRoles) {
    const roleData = rolesData.get(role);
    const paperclipRole = PaperclipClient.resolveRole(role, roleData);
    const title = formatRoleName(role);

    // Role-specific adapter config from role.json, CLI --model as fallback
    const roleAdapter = roleData?.adapter || {};
    const agentModel = roleAdapter.model || model;

    onProgress(`Creating ${title} agent...`);
    const agent = await client.createAgent(companyId, {
      name: title,
      role: paperclipRole,
      title,
      adapterConfig: {
        cwd: companyDir,
        instructionsFilePath: join(companyDir, `agents/${role}/AGENTS.md`),
        ...(agentModel ? { model: agentModel } : {}),
        ...Object.fromEntries(
          Object.entries(roleAdapter).filter(([k]) => k !== "model"),
        ),
      },
    });
    agentIds.set(role, agent.id);
    onProgress(`✓ ${title} created (${agent.id.slice(0, 8)}…)`);
  }

  // 3. Create project with workspace pointing to company dir
  onProgress("Creating project workspace...");
  const project = await client.createProject(companyId, {
    name: companyName,
    description: `Company workspace for ${companyName}`,
    workspace: {
      cwd: companyDir,
      isPrimary: true,
    },
  });
  const projectId = project.id;
  onProgress(`✓ Project created (${projectId.slice(0, 8)}…)`);

  // 4. Create initial tasks as issues (linked to project)
  for (const task of initialTasks) {
    onProgress(`Creating issue: ${task.title}...`);
    await client.createIssue(companyId, {
      title: task.title,
      description: task.description,
      projectId,
    });
    onProgress(`✓ Issue created: ${task.title}`);
  }

  return { companyId, projectId, agentIds };
}
