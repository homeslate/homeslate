import {
  ActionIcon,
  Box,
  Group,
  NumberInput,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
} from "@mantine/core";
import {
  IconBackpack,
  IconBed,
  IconBook,
  IconCheck,
  IconDental,
  IconDroplet,
  IconPlus,
  IconShirt,
  IconShoe,
  IconStar,
  IconSun,
  IconToolsKitchen2,
  IconTrash,
  IconArrowUp,
  IconArrowDown,
} from "@tabler/icons-react";
import { v4 as uuidv4 } from "uuid";
import type { ComponentType } from "react";
import type { WidgetConfig, WidgetProps } from "../types";
import { HoldToConfirm } from "../household/HoldToConfirm";
import { effectiveCompletedStepIds, routineDayKey, toggleRoutineStep } from "./dailyRoutine";
import classes from "./listWidget.module.css";

export const ROUTINE_ICON_IDS = [
  "sun",
  "bed",
  "utensils",
  "shirt",
  "toothbrush",
  "backpack",
  "shoes",
  "book",
  "soap",
  "star",
] as const;

export type RoutineIconId = (typeof ROUTINE_ICON_IDS)[number];

export type RoutineStep = {
  id: string;
  label: string;
  icon?: RoutineIconId;
};

export interface DailyRoutineConfig extends WidgetConfig {
  steps: RoutineStep[];
  resetHour: number;
  completionDay: string | null;
  completedStepIds: string[];
  showReset: boolean;
  transparentBackground: boolean;
}

const ICONS: Record<RoutineIconId, ComponentType<{ size?: number }>> = {
  sun: IconSun,
  bed: IconBed,
  utensils: IconToolsKitchen2,
  shirt: IconShirt,
  toothbrush: IconDental,
  backpack: IconBackpack,
  shoes: IconShoe,
  book: IconBook,
  soap: IconDroplet,
  star: IconStar,
};

function iconOf(id: RoutineIconId | undefined) {
  return id && ICONS[id] ? ICONS[id] : null;
}

export function DailyRoutineWidget({
  widget,
  isEditing,
  onConfigChange,
}: WidgetProps<DailyRoutineConfig>) {
  const {
    steps = [],
    resetHour = 4,
    completionDay = null,
    completedStepIds = [],
    showReset = true,
    transparentBackground,
  } = widget.config;
  const now = new Date();
  const dayKey = routineDayKey(now, resetHour);
  const doneIds = new Set(
    effectiveCompletedStepIds(completionDay, completedStepIds, now, resetHour),
  );
  const doneCount = steps.filter((step) => doneIds.has(step.id)).length;

  const persistToggle = (stepId: string) => {
    onConfigChange({
      completionDay: dayKey,
      completedStepIds: toggleRoutineStep([...doneIds], stepId),
    });
  };

  const persistReset = () => {
    onConfigChange({ completionDay: dayKey, completedStepIds: [] });
  };

  return (
    <Box className={`${classes.container} ${transparentBackground ? classes.transparent : ""}`}>
      {steps.length === 0 ? (
        <div className={classes.empty}>
          <Text size="sm" c="dimmed">
            Add morning steps in the editor.
          </Text>
        </div>
      ) : (
        <>
          <div className={classes.header}>
            <Text size="sm" c="dimmed">
              {doneCount} of {steps.length}
            </Text>
            {showReset &&
              (isEditing ? (
                <ActionIcon
                  variant="subtle"
                  size="sm"
                  aria-label="Reset day"
                  onClick={persistReset}
                >
                  <IconTrash size={14} />
                </ActionIcon>
              ) : (
                <HoldToConfirm label="Reset day" onConfirm={persistReset} />
              ))}
          </div>
          {doneCount === steps.length && (
            <Text size="sm" fw={600}>
              All done
            </Text>
          )}
          <div className={classes.list}>
            {steps.map((step, index) => {
              const Icon = iconOf(step.icon);
              const done = doneIds.has(step.id);
              return (
                <button
                  key={step.id}
                  type="button"
                  className={`${classes.row} ${classes.routineRow} ${done ? classes.rowDone : ""}`}
                  onClick={() => persistToggle(step.id)}
                >
                  <span className={classes.number}>{index + 1}</span>
                  {Icon ? <Icon size={22} /> : null}
                  <span className={classes.label}>{step.label}</span>
                  <span className={`${classes.checkbox} ${done ? classes.checkboxOn : ""}`}>
                    {done && <IconCheck size={12} stroke={3} />}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </Box>
  );
}

export function DailyRoutineWidgetSettings({
  widget,
  onConfigChange,
}: WidgetProps<DailyRoutineConfig>) {
  const { steps = [], resetHour = 4, showReset = true, transparentBackground } = widget.config;

  const updateStep = (id: string, patch: Partial<RoutineStep>) => {
    onConfigChange({
      steps: steps.map((step) => (step.id === id ? { ...step, ...patch } : step)),
    });
  };

  const move = (index: number, delta: number) => {
    const next = [...steps];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    onConfigChange({ steps: next });
  };

  return (
    <Stack gap="md">
      {steps.map((step, index) => (
        <Stack key={step.id} gap={6}>
          <TextInput
            size="sm"
            value={step.label}
            onChange={(event) => updateStep(step.id, { label: event.currentTarget.value })}
            aria-label={`Step ${index + 1} label`}
          />
          <Group gap="xs">
            <Select
              size="xs"
              data={ROUTINE_ICON_IDS.map((id) => ({ value: id, label: id }))}
              value={step.icon ?? null}
              clearable
              onChange={(value) =>
                updateStep(step.id, { icon: (value as RoutineIconId | null) ?? undefined })
              }
              style={{ flex: 1 }}
            />
            <ActionIcon variant="subtle" aria-label="Move up" onClick={() => move(index, -1)}>
              <IconArrowUp size={14} />
            </ActionIcon>
            <ActionIcon variant="subtle" aria-label="Move down" onClick={() => move(index, 1)}>
              <IconArrowDown size={14} />
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              color="red"
              aria-label="Remove step"
              onClick={() => onConfigChange({ steps: steps.filter((item) => item.id !== step.id) })}
            >
              <IconTrash size={14} />
            </ActionIcon>
          </Group>
        </Stack>
      ))}
      <ButtonLikeAdd
        onClick={() =>
          onConfigChange({
            steps: [...steps, { id: uuidv4(), label: "New step", icon: "star" }],
          })
        }
      />
      <NumberInput
        label="Reset hour"
        min={0}
        max={23}
        value={resetHour}
        onChange={(value) => {
          if (typeof value === "number") onConfigChange({ resetHour: value });
        }}
      />
      <Group justify="space-between">
        <Text size="sm">Show reset control</Text>
        <Switch
          checked={showReset}
          onChange={(event) => onConfigChange({ showReset: event.currentTarget.checked })}
        />
      </Group>
      <Group justify="space-between">
        <Text size="sm">Transparent background</Text>
        <Switch
          checked={transparentBackground}
          onChange={(event) =>
            onConfigChange({ transparentBackground: event.currentTarget.checked })
          }
        />
      </Group>
    </Stack>
  );
}

function ButtonLikeAdd({ onClick }: { onClick: () => void }) {
  return (
    <ActionIcon variant="light" onClick={onClick} aria-label="Add step">
      <IconPlus size={16} />
    </ActionIcon>
  );
}
