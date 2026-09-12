import { ActionIcon, Button, Stack, Text, TextInput } from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { v4 as uuidv4 } from "uuid";
import type { HouseholdMember } from "@homeslate/schema";
import classes from "./HouseholdEditor.module.css";

export const HOUSEHOLD_MEMBER_COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#8b5cf6",
  "#06b6d4",
  "#ef4444",
  "#84cc16",
  "#f97316",
  "#3b82f6",
  "#14b8a6",
  "#e11d48",
];

export const MAX_HOUSEHOLD_MEMBERS = 12;

function createMember(index: number): HouseholdMember {
  return {
    id: uuidv4(),
    name: "Person",
    color: HOUSEHOLD_MEMBER_COLORS[index % HOUSEHOLD_MEMBER_COLORS.length],
  };
}

export function HouseholdEditor({
  members,
  onChange,
  readOnly = false,
}: {
  members: HouseholdMember[];
  onChange: (members: HouseholdMember[]) => void;
  readOnly?: boolean;
}) {
  const update = (id: string, patch: Partial<HouseholdMember>) => {
    onChange(members.map((member) => (member.id === id ? { ...member, ...patch } : member)));
  };

  return (
    <Stack gap="sm" className={classes.list}>
      {members.length === 0 && (
        <Text size="sm" c="dimmed">
          Add people to color-code chores.
        </Text>
      )}
      {members.map((member) => (
        <div key={member.id} className={classes.row}>
          <span className={classes.disc} style={{ background: member.color }} aria-hidden>
            {member.name.trim().charAt(0).toUpperCase() || "?"}
          </span>
          <TextInput
            size="sm"
            value={member.name}
            onChange={(event) => update(member.id, { name: event.currentTarget.value })}
            disabled={readOnly}
            style={{ flex: 1 }}
            aria-label="Member name"
          />
          {!readOnly && (
            <>
              <input
                type="color"
                className={classes.swatch}
                value={member.color}
                aria-label={`Color for ${member.name}`}
                onChange={(event) => update(member.id, { color: event.currentTarget.value })}
              />
              <ActionIcon
                variant="subtle"
                color="red"
                aria-label={`Remove ${member.name}`}
                onClick={() => onChange(members.filter((item) => item.id !== member.id))}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </>
          )}
        </div>
      ))}
      {!readOnly && members.length < MAX_HOUSEHOLD_MEMBERS && (
        <Button
          variant="light"
          size="xs"
          leftSection={<IconPlus size={14} />}
          onClick={() => onChange([...members, createMember(members.length)])}
        >
          Add person
        </Button>
      )}
    </Stack>
  );
}
