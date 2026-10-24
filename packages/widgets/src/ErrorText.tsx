import { Text, type TextProps } from "@var-ui/react";
import { styles } from "./typeStyles";

const danger = styles.class("error-text", {
  color: "var(--var-ui-color-tone-danger-foreground)",
});

/**
 * Body text in the danger color, for error and validation messages.
 *
 * var-ui's `Text` has no `danger` tone yet (phthalo-dev/var-ui#48), and passing
 * `tone="danger"` is ignored at runtime. Replace this with `<Text tone="danger">`
 * once var-ui ships it.
 */
export function ErrorText({ className, ...props }: Omit<TextProps, "tone">) {
  return <Text {...props} className={className ? `${danger} ${className}` : danger} />;
}
