import { Surface, Text } from "@var-ui/react";
import type { WidgetProps } from "./types";

export function unknownWidgetLabel(type: string): string {
  return `Unknown widget type: ${type}`;
}

export function UnknownWidget({ widget }: WidgetProps) {
  return (
    <Surface padding="md">
      <Text>{unknownWidgetLabel(widget.type)}</Text>
    </Surface>
  );
}
