import React from "react";
import { Box, Text } from "ink";
import SelectInput from "ink-select-input";

export default function StepPreset({ presets, onComplete }) {
  const items = [
    ...presets.map((p) => ({
      key: p.name,
      label: `${p.name}`,
      value: p,
    })),
    {
      key: "custom",
      label: "custom",
      value: { name: "custom" },
    },
  ];

  return (
    <Box flexDirection="column">
      <Box>
        <Text color="cyan" bold>? </Text>
        <Text bold>Select a preset</Text>
      </Box>
      <Box marginLeft={2} marginTop={1} flexDirection="column">
        <SelectInput
          items={items}
          onSelect={(item) => onComplete(item.value)}
          itemComponent={PresetItem}
        />
      </Box>
    </Box>
  );
}

function PresetItem({ isSelected, label, value }) {
  const desc = value?.description || (label === "custom" ? "Pick modules manually" : "");
  return (
    <Box>
      <Text color={isSelected ? "cyan" : undefined} bold={isSelected}>
        {label}
      </Text>
      {desc ? (
        <Text dimColor> — {desc}</Text>
      ) : null}
    </Box>
  );
}
