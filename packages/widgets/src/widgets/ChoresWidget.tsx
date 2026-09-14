import {
  ActionIcon,
  Box,
  Button,
  Group,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
} from "@mantine/core";
import { IconCheck, IconPlus, IconTrash } from "@tabler/icons-react";
import { v4 as uuidv4 } from "uuid";
import type { WidgetConfig, WidgetProps } from "../types";
import { useHousehold } from "../household/HouseholdContext";
import {
  civilDayKey,
  isChoreDueOn,
  pruneCompletions,
  toggleChoreCompletion,
  type ChoreCompletion,
} from "./chores";
import * as classes from "./listWidget.styles";

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export type Chore = {
  id: string;
  title: string;
  assigneeId?: string;
  days: number[];
};

export interface ChoresConfig extends WidgetConfig {
  chores: Chore[];
  completions: ChoreCompletion[];
  showCompleted: boolean;
  onlyToday: boolean;
  transparentBackground: boolean;
}

export function ChoresWidget({ widget, onConfigChange }: WidgetProps<ChoresConfig>) {
  const {
    chores = [],
    completions = [],
    showCompleted = true,
    onlyToday = true,
    transparentBackground,
  } = widget.config;
  const { members } = useHousehold();
  const today = civilDayKey(new Date());
  const weekday = new Date().getDay();
  const pruned = pruneCompletions(completions, today);
  const done = new Set(
    pruned.filter((completion) => completion.day === today).map((completion) => completion.choreId),
  );

  const due = chores.filter((chore) => !onlyToday || isChoreDueOn(chore.days, weekday));
  const visible = showCompleted ? due : due.filter((chore) => !done.has(chore.id));

  const toggle = (choreId: string) => {
    onConfigChange({ completions: toggleChoreCompletion(pruned, choreId, today) });
  };

  return (
    <Box className={`${classes.container} ${transparentBackground ? classes.transparent : ""}`}>
      {chores.length === 0 && members.length === 0 ? (
        <div className={classes.empty}>
          <Text size="sm" c="dimmed">
            Add people under Household, then add chores.
          </Text>
        </div>
      ) : visible.length === 0 ? (
        <div className={classes.empty}>
          <Text size="sm" c="dimmed">
            {chores.length === 0 ? "Add chores in settings." : "Nothing due today."}
          </Text>
        </div>
      ) : (
        <div className={classes.list}>
          {visible.map((chore) => {
            const member = members.find((item) => item.id === chore.assigneeId);
            const complete = done.has(chore.id);
            return (
              <button
                key={chore.id}
                type="button"
                className={`${classes.row} ${complete ? classes.rowDone : ""}`}
                onClick={() => toggle(chore.id)}
              >
                <span
                  className={classes.disc}
                  style={{
                    background: member?.color ?? "var(--token-text-secondary)",
                  }}
                  aria-hidden
                >
                  {member?.name.trim().charAt(0).toUpperCase() ?? "?"}
                </span>
                <span className={classes.label}>{chore.title}</span>
                <span className={`${classes.checkbox} ${complete ? classes.checkboxOn : ""}`}>
                  {complete && <IconCheck size={12} stroke={3} />}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </Box>
  );
}

export function ChoresWidgetSettings({ widget, onConfigChange }: WidgetProps<ChoresConfig>) {
  const {
    chores = [],
    showCompleted = true,
    onlyToday = true,
    transparentBackground,
  } = widget.config;
  const { members } = useHousehold();

  const update = (id: string, patch: Partial<Chore>) => {
    onConfigChange({
      chores: chores.map((chore) => (chore.id === id ? { ...chore, ...patch } : chore)),
    });
  };

  return (
    <Stack gap="md">
      <Text size="xs" c="dimmed">
        Household members are edited in the Household panel, not here.
      </Text>
      {chores.map((chore) => (
        <Stack key={chore.id} gap={6}>
          <Group gap="xs" wrap="nowrap">
            <TextInput
              size="sm"
              value={chore.title}
              onChange={(event) => update(chore.id, { title: event.currentTarget.value })}
              style={{ flex: 1 }}
              aria-label="Chore title"
            />
            <ActionIcon
              variant="subtle"
              color="red"
              aria-label="Remove chore"
              onClick={() =>
                onConfigChange({ chores: chores.filter((item) => item.id !== chore.id) })
              }
            >
              <IconTrash size={14} />
            </ActionIcon>
          </Group>
          <Select
            size="xs"
            label="Assignee"
            data={[
              { value: "", label: "Unassigned" },
              ...members.map((member) => ({ value: member.id, label: member.name })),
            ]}
            value={chore.assigneeId ?? ""}
            onChange={(value) => update(chore.id, { assigneeId: value || undefined })}
          />
          <Group gap={4}>
            {DAY_LABELS.map((label, day) => {
              const active = chore.days.includes(day);
              return (
                <Button
                  key={`${chore.id}-${day}`}
                  size="compact-xs"
                  variant={active ? "filled" : "default"}
                  onClick={() => {
                    const days = active
                      ? chore.days.filter((item) => item !== day)
                      : [...chore.days, day].sort((a, b) => a - b);
                    update(chore.id, { days });
                  }}
                >
                  {label}
                </Button>
              );
            })}
          </Group>
        </Stack>
      ))}
      <Button
        variant="light"
        size="xs"
        leftSection={<IconPlus size={14} />}
        onClick={() =>
          onConfigChange({
            chores: [...chores, { id: uuidv4(), title: "New chore", days: [] }],
          })
        }
      >
        Add chore
      </Button>
      <Group justify="space-between">
        <Text size="sm">Show completed</Text>
        <Switch
          checked={showCompleted}
          onChange={(event) => onConfigChange({ showCompleted: event.currentTarget.checked })}
        />
      </Group>
      <Group justify="space-between">
        <Text size="sm">Only today</Text>
        <Switch
          checked={onlyToday}
          onChange={(event) => onConfigChange({ onlyToday: event.currentTarget.checked })}
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
