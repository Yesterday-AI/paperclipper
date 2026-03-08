import React, { useState } from "react";
import { Box, Text } from "ink";
import TextInput from "ink-text-input";

export default function StepGoal({ onComplete }) {
  const [phase, setPhase] = useState("title"); // title → description
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const handleTitleSubmit = (val) => {
    const trimmed = val.trim();
    if (!trimmed) {
      setError("Goal title is required");
      return;
    }
    setTitle(trimmed);
    setError("");
    setPhase("description");
  };

  const handleDescriptionSubmit = (val) => {
    onComplete({ title, description: val.trim() || null });
  };

  return (
    <Box flexDirection="column">
      {phase === "title" ? (
        <Box flexDirection="column">
          <Box>
            <Text color="cyan" bold>? </Text>
            <Text bold>Company goal </Text>
            <TextInput
              value={title}
              onChange={(v) => {
                setTitle(v);
                setError("");
              }}
              onSubmit={handleTitleSubmit}
            />
          </Box>
          <Text dimColor>  What should this company achieve?</Text>
        </Box>
      ) : (
        <Box flexDirection="column">
          <Text dimColor>  Goal: {title}</Text>
          <Box>
            <Text color="cyan" bold>? </Text>
            <Text bold>Description </Text>
            <TextInput
              value={description}
              onChange={setDescription}
              onSubmit={handleDescriptionSubmit}
            />
          </Box>
          <Text dimColor>  Optional details. Press enter to skip.</Text>
        </Box>
      )}
      {error ? <Text color="red">  {error}</Text> : null}
    </Box>
  );
}
