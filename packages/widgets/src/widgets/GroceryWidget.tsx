import { ActionIcon, Box, Button, Group, Stack, Switch, Text, TextInput } from "@mantine/core";
import { IconCheck, IconPlus, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import type { WidgetConfig, WidgetProps } from "../types";
import { HoldToConfirm } from "../household/HoldToConfirm";
import { clearCheckedGroceryItems, visibleGroceryItems, type GroceryItem } from "./grocery";
import classes from "./listWidget.module.css";

export interface GroceryConfig extends WidgetConfig {
  items: GroceryItem[];
  hideChecked: boolean;
  groupByAisle: boolean;
  transparentBackground: boolean;
}

export function GroceryWidget({ widget, isEditing, onConfigChange }: WidgetProps<GroceryConfig>) {
  const {
    items = [],
    hideChecked = false,
    groupByAisle = false,
    transparentBackground,
  } = widget.config;
  const [draft, setDraft] = useState("");
  const visible = visibleGroceryItems(items, { hideChecked, groupByAisle });

  const toggle = (id: string) => {
    onConfigChange({
      items: items.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)),
    });
  };

  const add = () => {
    const text = draft.trim();
    if (!text) return;
    onConfigChange({
      items: [...items, { id: uuidv4(), text, checked: false }],
    });
    setDraft("");
  };

  const remove = (id: string) => {
    onConfigChange({ items: items.filter((item) => item.id !== id) });
  };

  const clearChecked = () => {
    onConfigChange({ items: clearCheckedGroceryItems(items) });
  };

  let lastAisle: string | undefined;

  return (
    <Box className={`${classes.container} ${transparentBackground ? classes.transparent : ""}`}>
      {items.length === 0 ? (
        <div className={classes.empty}>
          <Text size="sm" c="dimmed">
            List is empty. Add milk from here or in the editor.
          </Text>
        </div>
      ) : (
        <div className={classes.list}>
          {visible.map((item) => {
            const aisle = groupByAisle ? (item.aisle?.trim() ?? "") : "";
            const showAisle = groupByAisle && aisle && aisle !== lastAisle;
            if (groupByAisle) lastAisle = aisle;
            return (
              <div key={item.id}>
                {showAisle && <div className={classes.aisle}>{aisle}</div>}
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <button
                    type="button"
                    className={`${classes.row} ${item.checked ? classes.rowDone : ""}`}
                    onClick={() => toggle(item.id)}
                  >
                    <span
                      className={`${classes.checkbox} ${item.checked ? classes.checkboxOn : ""}`}
                    >
                      {item.checked && <IconCheck size={12} stroke={3} />}
                    </span>
                    <span className={classes.label}>{item.text}</span>
                  </button>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    aria-label={`Delete ${item.text}`}
                    onClick={() => {
                      if (isEditing || window.confirm(`Delete ${item.text}?`)) {
                        remove(item.id);
                      }
                    }}
                  >
                    <IconTrash size={14} />
                  </ActionIcon>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div className={classes.addRow}>
        <TextInput
          size="xs"
          placeholder="Add item..."
          value={draft}
          onChange={(event) => setDraft(event.currentTarget.value)}
          onKeyDown={(event) => event.key === "Enter" && add()}
          style={{ flex: 1 }}
        />
        <ActionIcon variant="light" onClick={add} disabled={!draft.trim()} aria-label="Add item">
          <IconPlus size={14} />
        </ActionIcon>
      </div>
      {items.some((item) => item.checked) &&
        (isEditing ? (
          <Button size="xs" variant="subtle" onClick={clearChecked}>
            Clear checked
          </Button>
        ) : (
          <HoldToConfirm label="Clear checked" onConfirm={clearChecked} />
        ))}
    </Box>
  );
}

export function GroceryWidgetSettings({ widget, onConfigChange }: WidgetProps<GroceryConfig>) {
  const { items = [], hideChecked, groupByAisle, transparentBackground } = widget.config;

  return (
    <Stack gap="md">
      {items.map((item) => (
        <Group key={item.id} gap="xs" wrap="nowrap">
          <TextInput
            size="xs"
            value={item.text}
            onChange={(event) =>
              onConfigChange({
                items: items.map((row) =>
                  row.id === item.id ? { ...row, text: event.currentTarget.value } : row,
                ),
              })
            }
            style={{ flex: 1 }}
            aria-label="Grocery item"
          />
          <TextInput
            size="xs"
            placeholder="Aisle"
            value={item.aisle ?? ""}
            onChange={(event) =>
              onConfigChange({
                items: items.map((row) =>
                  row.id === item.id ? { ...row, aisle: event.currentTarget.value } : row,
                ),
              })
            }
            style={{ width: 110 }}
            aria-label="Aisle"
          />
        </Group>
      ))}
      <Group justify="space-between">
        <Text size="sm">Hide checked</Text>
        <Switch
          checked={hideChecked}
          onChange={(event) => onConfigChange({ hideChecked: event.currentTarget.checked })}
        />
      </Group>
      <Group justify="space-between">
        <Text size="sm">Group by aisle</Text>
        <Switch
          checked={groupByAisle}
          onChange={(event) => onConfigChange({ groupByAisle: event.currentTarget.checked })}
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
