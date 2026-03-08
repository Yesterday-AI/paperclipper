import React, { useState } from "react";
import { Box, Text } from "ink";
import TextInput from "ink-text-input";

export default function StepProject({ defaultName, companyDir, onComplete }) {
  const [phase, setPhase] = useState("name"); // name → repo
  const [name, setName] = useState(defaultName);
  const [repoUrl, setRepoUrl] = useState("");

  const handleNameSubmit = (val) => {
    const trimmed = val.trim() || defaultName;
    setName(trimmed);
    setPhase("repo");
  };

  const handleRepoSubmit = (val) => {
    onComplete({ name, repoUrl: val.trim() || null });
  };

  const projectPath = companyDir
    ? `${companyDir}/projects/${name || defaultName}`
    : null;

  return (
    <Box flexDirection="column">
      {phase === "name" ? (
        <Box flexDirection="column">
          <Box>
            <Text bold>Project name: </Text>
            <TextInput
              value={name}
              onChange={setName}
              onSubmit={handleNameSubmit}
            />
          </Box>
          <Text dimColor>  Default: {defaultName}. Press enter to accept.</Text>
          {projectPath ? (
            <Text dimColor>  Workspace: {projectPath}</Text>
          ) : null}
        </Box>
      ) : (
        <Box flexDirection="column">
          <Text dimColor>Project: {name}</Text>
          {projectPath ? (
            <Text dimColor>  Workspace: {projectPath}</Text>
          ) : null}
          <Box>
            <Text bold>GitHub repo URL: </Text>
            <TextInput
              value={repoUrl}
              onChange={setRepoUrl}
              onSubmit={handleRepoSubmit}
            />
          </Box>
          <Text dimColor>  Optional. Press enter to skip.</Text>
        </Box>
      )}
    </Box>
  );
}
