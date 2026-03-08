import React from "react";
import { Box, Text } from "ink";

export default function Header({ step, totalSteps }) {
  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box>
        <Text bold color="magenta">Clipper</Text>
        <Text dimColor> — Bootstrap a Paperclip company</Text>
      </Box>
      {step && totalSteps ? (
        <Text dimColor>
          Step {step}/{totalSteps}
        </Text>
      ) : null}
    </Box>
  );
}
