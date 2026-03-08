import React from "react";
import { Box, Text } from "ink";
import { formatRoleName } from "../logic/resolve.js";

export default function StepDone({
  companyDir,
  allRoles,
  provisioned,
  provisionResult,
}) {
  const rolesList = [...allRoles];

  return (
    <Box flexDirection="column" gap={1}>
      <Text color="green" bold>
        Done!
      </Text>

      {provisioned && provisionResult ? (
        <Box flexDirection="column">
          <Text bold>Provisioned via Paperclip API:</Text>
          <Box flexDirection="column" marginLeft={2}>
            <Text>
              <Text color="green">✓</Text> Company{" "}
              <Text dimColor>({provisionResult.companyId?.slice(0, 8)}…)</Text>
            </Text>
            {provisionResult.goalId ? (
              <Text>
                <Text color="green">✓</Text> Goal{" "}
                <Text dimColor>({provisionResult.goalId.slice(0, 8)}…)</Text>
              </Text>
            ) : null}
            <Text>
              <Text color="green">✓</Text> Project{" "}
              <Text dimColor>({provisionResult.projectId?.slice(0, 8)}…)</Text>
            </Text>
            <Text>
              {"  "}workspace → <Text dimColor>{provisionResult.projectCwd}</Text>
            </Text>
            {rolesList.map((role) => (
              <Text key={role}>
                <Text color="green">✓</Text> Agent:{" "}
                <Text bold>{formatRoleName(role)}</Text>{" "}
                <Text dimColor>
                  ({provisionResult.agentIds?.get(role)?.slice(0, 8)}…)
                </Text>
              </Text>
            ))}
            {provisionResult.issueIds?.length > 0 ? (
              <Text>
                <Text color="green">✓</Text>{" "}
                {provisionResult.issueIds.length} issue
                {provisionResult.issueIds.length !== 1 ? "s" : ""} created
              </Text>
            ) : null}
            {provisionResult.ceoStarted ? (
              <Text>
                <Text color="green">✓</Text> CEO heartbeat started
              </Text>
            ) : null}
          </Box>

          {!provisionResult.ceoStarted ? (
            <Box flexDirection="column" marginTop={1}>
              <Text bold>Next:</Text>
              <Text>  Start the CEO heartbeat in the Paperclip UI</Text>
              <Text dimColor>  or re-run with --start to auto-start</Text>
            </Box>
          ) : null}
        </Box>
      ) : (
        <Box flexDirection="column">
          <Text bold>Next steps:</Text>
          <Text>  Follow BOOTSTRAP.md in the company directory.</Text>
          <Text dimColor>  Or re-run with --api to provision automatically.</Text>
          <Text />
          {rolesList.map((role, i) => (
            <Box key={role} flexDirection="column">
              <Text>
                {"  "}
                {i + 1}. Create the{" "}
                <Text bold>{formatRoleName(role)}</Text> agent:
              </Text>
              <Text dimColor>
                {"     "}cwd = {companyDir}
              </Text>
              <Text dimColor>
                {"     "}instructionsFilePath = {companyDir}/agents/{role}
                /AGENTS.md
              </Text>
            </Box>
          ))}
        </Box>
      )}

      <Text dimColor>Workspace: {companyDir}</Text>
    </Box>
  );
}
