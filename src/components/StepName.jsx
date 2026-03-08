import React, { useState } from "react";
import { Box, Text } from "ink";
import TextInput from "ink-text-input";

export default function StepName({ onComplete }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (val) => {
    const trimmed = val.trim();
    if (!trimmed) {
      setError("Name is required");
      return;
    }
    if (!/^[a-zA-Z]/.test(trimmed)) {
      setError("Name must start with a letter");
      return;
    }
    if (!/[a-zA-Z]/.test(trimmed.slice(1))) {
      setError("Name must contain at least two letters");
      return;
    }
    onComplete(trimmed);
  };

  return (
    <Box flexDirection="column">
      <Box>
        <Text color="cyan" bold>? </Text>
        <Text bold>Company name </Text>
        <TextInput
          value={value}
          onChange={(v) => {
            setValue(v);
            setError("");
          }}
          onSubmit={handleSubmit}
        />
      </Box>
      <Text dimColor>  Your AI company's name. Special characters are allowed.</Text>
      {error ? (
        <Text color="red">  {error}</Text>
      ) : null}
    </Box>
  );
}
