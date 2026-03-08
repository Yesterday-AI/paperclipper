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
          <Text bold>Provisioned via Paperclip API</Text>
          <Box flexDirection="column" marginLeft={2}>
            <Text>
              <Text color="green">+</Text> Company{" "}
              <Text dimColor>{provisionResult.companyId?.slice(0, 8)}</Text>
            </Text>
            {provisionResult.goalId ? (
              <Text>
                <Text color="green">+</Text> Goal{" "}
                <Text dimColor>{provisionResult.goalId.slice(0, 8)}</Text>
              </Text>
            ) : null}
            <Text>
              <Text color="green">+</Text> Project{" "}
              <Text dimColor>{provisionResult.projectId?.slice(0, 8)}</Text>
            </Text>
            <Text dimColor>
              {"  "}workspace: {provisionResult.projectCwd}
            </Text>
            {rolesList.map((role) => (
              <Text key={role}>
                <Text color="green">+</Text> Agent{" "}
                <Text bold>{formatRoleName(role)}</Text>{" "}
                <Text dimColor>
                  {provisionResult.agentIds?.get(role)?.slice(0, 8)}
                </Text>
              </Text>
            ))}
            {provisionResult.issueIds?.length > 0 ? (
              <Text>
                <Text color="green">+</Text>{" "}
                {provisionResult.issueIds.length} issue
                {provisionResult.issueIds.length !== 1 ? "s" : ""}
              </Text>
            ) : null}
            {provisionResult.ceoStarted ? (
              <Text>
                <Text color="green">+</Text> CEO heartbeat started
              </Text>
            ) : null}
          </Box>

          {!provisionResult.ceoStarted ? (
            <Box flexDirection="column" marginTop={1}>
              <Text dimColor>Next: start the CEO heartbeat in the Paperclip UI</Text>
              <Text dimColor>  or re-run with --start</Text>
            </Box>
          ) : null}
        </Box>
      ) : (
        <Box flexDirection="column">
          <Text dimColor>Next: follow BOOTSTRAP.md in the company directory</Text>
          <Text dimColor>  or re-run with --api to provision automatically</Text>
        </Box>
      )}

      <Text dimColor>Workspace: {companyDir}</Text>
    </Box>
  );
}
