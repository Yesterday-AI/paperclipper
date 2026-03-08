import { join } from "node:path";
import { PaperclipClient } from "./client.js";
import { formatRoleName } from "../logic/resolve.js";

/**
 * Provision a company in Paperclip via the API.
 *
 * Creates (in order):
 *   1. Company
 *   2. Company-level goal
 *   3. Project with local workspace (cwd → company dir)
 *   4. Agents (with per-role adapter config from role.json)
 *   5. Initial issues (linked to goal + project)
 *
 * @param {object} opts
 * @param {PaperclipClient} opts.client
 * @param {string} opts.companyName
 * @param {string} opts.companyDir - absolute path to assembled workspace
 * @param {object} opts.goal - { title, description }
 * @param {string} opts.projectName - display name for the project
 * @param {string|null} opts.repoUrl - GitHub repository URL
 * @param {Set<string>} opts.allRoles
 * @param {Map<string, object>} opts.rolesData - role name → role.json data
 * @param {Array} opts.initialTasks
 * @param {string|null} opts.model - LLM model fallback (overridden by role.json adapter.model)
 * @param {boolean} opts.startCeo - trigger CEO heartbeat after provisioning
 * @param {(line: string) => void} opts.onProgress
 */
export async function provisionCompany({
  client,
  companyName,
  companyDir,
  goal,
  projectName,
  repoUrl = null,
  allRoles,
  rolesData = new Map(),
  initialTasks = [],
  model = null,
  startCeo = false,
  onProgress = () => {},
}) {
  // 1. Create company
  onProgress("Creating company...");
  const company = await client.createCompany({ name: companyName });
  const companyId = company.id;
  onProgress(`✓ Company "${companyName}" created`);

  // 2. Create company goal
  let goalId = null;
  if (goal?.title) {
    onProgress(`Creating goal: ${goal.title}...`);
    const g = await client.createGoal(companyId, {
      title: goal.title,
      description: goal.description,
      level: "company",
    });
    goalId = g.id;
    onProgress(`✓ Goal created: ${goal.title}`);
  }

  // 3. Create project with workspace
  const projectCwd = join(companyDir, "projects", projectName);
  onProgress(`Creating project "${projectName}"...`);
  const project = await client.createProject(companyId, {
    name: projectName,
    description: goal?.title ? `Goal: ${goal.title}` : null,
    workspace: {
      cwd: projectCwd,
      ...(repoUrl ? { repoUrl } : {}),
      isPrimary: true,
    },
  });
  const projectId = project.id;
  onProgress(`✓ Project "${projectName}" created`);
  onProgress(`  workspace: ${projectCwd}`);
  if (repoUrl) {
    onProgress(`  repo: ${repoUrl}`);
  }

  // 4. Create agents
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
    onProgress(`✓ ${title} agent created`);
  }

  // 5. Create initial issues (linked to goal + project)
  const issueIds = [];
  for (const task of initialTasks) {
    onProgress(`Creating issue: ${task.title}...`);
    const issue = await client.createIssue(companyId, {
      title: task.title,
      description: task.description,
      projectId,
      goalId,
    });
    issueIds.push(issue.id);
    onProgress(`✓ Issue created: ${task.title}`);
  }

  // 6. Optionally start CEO heartbeat
  let ceoStarted = false;
  if (startCeo) {
    const ceoAgentId = agentIds.get("ceo");
    if (ceoAgentId) {
      onProgress("Starting CEO heartbeat...");
      try {
        await client.triggerHeartbeat(ceoAgentId);
        ceoStarted = true;
        onProgress("✓ CEO heartbeat started");
      } catch (err) {
        onProgress(`! Could not start CEO heartbeat: ${err.message}`);
      }
    }
  }

  return {
    companyId,
    goalId,
    projectId,
    projectCwd,
    agentIds,
    issueIds,
    ceoStarted,
  };
}
