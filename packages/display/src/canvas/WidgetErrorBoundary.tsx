import { Component, Fragment, type ComponentType, type ReactNode } from "react";
import { Text } from "@var-ui/react";
import type { WidgetHealthStatus } from "@homeslate/widgets";
import * as classes from "./WidgetErrorBoundary.styles";

export const WIDGET_HEALTH_EVENT = "widget-health-change";

export type WidgetHealthChangeDetail = {
  widgetId: string;
  status: WidgetHealthStatus;
};

/** Shape dispatched on `widget-health-change` when a widget crashes or recovers. */
export function widgetHealthChangeDetail(
  widgetId: string,
  status: WidgetHealthStatus,
): WidgetHealthChangeDetail {
  return { widgetId, status };
}

export function dispatchWidgetHealthChange(widgetId: string, status: WidgetHealthStatus): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(WIDGET_HEALTH_EVENT, {
      detail: widgetHealthChangeDetail(widgetId, status),
    }),
  );
}

export type WidgetErrorFallbackProps = {
  name: string;
  icon?: ComponentType<{ size?: number | string }>;
  isEditing: boolean;
  errorMessage?: string;
  showDetails?: boolean;
  onRetry: () => void;
  onRemove?: () => void;
};

/** Visible fallback for a crashed widget. Rendered by the boundary and by tests. */
export function WidgetErrorFallback({
  name,
  icon: Icon,
  isEditing,
  errorMessage,
  showDetails = false,
  onRetry,
  onRemove,
}: WidgetErrorFallbackProps) {
  return (
    <div className={classes.fallback} role="alert">
      <div className={classes.title}>
        {Icon ? <Icon size={20} /> : null}
        <Text size="sm" weight="semibold">
          {name}
        </Text>
      </div>
      <p className={classes.message}>This widget crashed</p>
      {showDetails && errorMessage ? <p className={classes.detail}>{errorMessage}</p> : null}
      <div className={classes.actions}>
        <button type="button" className={classes.button} onClick={onRetry}>
          Retry
        </button>
        {isEditing && onRemove ? (
          <button
            type="button"
            className={`${classes.button} ${classes.removeButton}`}
            onClick={onRemove}
          >
            Remove
          </button>
        ) : null}
      </div>
    </div>
  );
}

type WidgetErrorBoundaryProps = {
  widgetId: string;
  name: string;
  icon?: ComponentType<{ size?: number | string }>;
  isEditing: boolean;
  onRemove?: () => void;
  children: ReactNode;
};

type WidgetErrorBoundaryState = {
  error: Error | null;
  resetKey: number;
};

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

/**
 * Isolates a widget (or its settings) so a render throw cannot blank the board.
 * Retry remounts the child; Remove is offered only while editing.
 */
export class WidgetErrorBoundary extends Component<
  WidgetErrorBoundaryProps,
  WidgetErrorBoundaryState
> {
  state: WidgetErrorBoundaryState = { error: null, resetKey: 0 };

  static getDerivedStateFromError(error: unknown): Pick<WidgetErrorBoundaryState, "error"> {
    return { error: toError(error) };
  }

  componentDidCatch(error: unknown): void {
    if (import.meta.env.DEV) console.error(error);
    dispatchWidgetHealthChange(this.props.widgetId, "error");
  }

  retry = (): void => {
    dispatchWidgetHealthChange(this.props.widgetId, "idle");
    this.setState((state) => ({ error: null, resetKey: state.resetKey + 1 }));
  };

  render(): ReactNode {
    const { error } = this.state;
    if (error) {
      return (
        <WidgetErrorFallback
          name={this.props.name}
          icon={this.props.icon}
          isEditing={this.props.isEditing}
          errorMessage={error.message}
          showDetails={import.meta.env.DEV}
          onRetry={this.retry}
          onRemove={this.props.onRemove}
        />
      );
    }
    return <Fragment key={this.state.resetKey}>{this.props.children}</Fragment>;
  }
}
