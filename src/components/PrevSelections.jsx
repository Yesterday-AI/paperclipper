import React from "react";
import { Box, Text } from "ink";

function truncate(str, max = 60) {
  if (!str) return "";
  return str.length > max ? str.slice(0, max) + "..." : str;
}

/**
 * Shows previous wizard selections as compact dimmed context.
 */
export default function PrevSelections({ entries }) {
  const filled = entries.filter(([, v]) => v);
  if (filled.length === 0) return null;

  return (
    <Box flexDirection="column" marginBottom={1}>
      {filled.map(([label, value]) => (
        <Text key={label || value} dimColor>
          {label ? (
            <>
              <Text dimColor>{label}</Text>
              {" "}
              <Text color="cyan" dimColor>{truncate(value)}</Text>
            </>
          ) : (
            <Text dimColor>  {truncate(value)}</Text>
          )}
        </Text>
      ))}
    </Box>
  );
}
