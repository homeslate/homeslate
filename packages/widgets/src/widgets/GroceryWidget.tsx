import { Button, HStack, IconButton, Stack, Switch, Text, TextField } from "@var-ui/react";
import { IconCheck, IconPlus, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import type { WidgetConfig, WidgetProps } from "../types";
import { HoldToConfirm } from "../household/HoldToConfirm";
import { clearCheckedGroceryItems, visibleGroceryItems, type GroceryItem } from "./grocery";
import * as classes from "./listWidget.styles";

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
    <div className={`${classes.container} ${transparentBackground ? classes.transparent : ""}`}>
      {items.length === 0 ? (
        <div className={classes.empty}>
          <Text size="sm" tone="secondary">
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
                  <IconButton
                    name="close"
                    icon={<IconTrash size={14} />}
                    appearance="ghost"
                    tone="danger"
                    aria-label={`Delete ${item.text}`}
                    onPress={() => {
                      if (isEditing || window.confirm(`Delete ${item.text}?`)) {
                        remove(item.id);
                      }
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div className={classes.addRow}>
        <TextField
          size="sm"
          aria-label="Add item"
          placeholder="Add item..."
          value={draft}
          onChange={setDraft}
          onKeyDown={(event) => event.key === "Enter" && add()}
          style={{ flex: 1 }}
        />
        <IconButton
          name="check"
          icon={<IconPlus size={14} />}
          appearance="subtle"
          onPress={add}
          isDisabled={!draft.trim()}
          aria-label="Add item"
        />
      </div>
      {items.some((item) => item.checked) &&
        (isEditing ? (
          <Button size="sm" appearance="ghost" onPress={clearChecked}>
            Clear checked
          </Button>
        ) : (
          <HoldToConfirm label="Clear checked" onConfirm={clearChecked} />
        ))}
    </div>
  );
}

export function GroceryWidgetSettings({ widget, onConfigChange }: WidgetProps<GroceryConfig>) {
  const { items = [], hideChecked, groupByAisle, transparentBackground } = widget.config;

  return (
    <Stack gap="md">
      {items.map((item) => (
        <HStack key={item.id} gap="xs">
          <TextField
            size="sm"
            value={item.text}
            onChange={(value) =>
              onConfigChange({
                items: items.map((row) => (row.id === item.id ? { ...row, text: value } : row)),
              })
            }
            style={{ flex: 1 }}
            aria-label="Grocery item"
          />
          <TextField
            size="sm"
            placeholder="Aisle"
            value={item.aisle ?? ""}
            onChange={(value) =>
              onConfigChange({
                items: items.map((row) => (row.id === item.id ? { ...row, aisle: value } : row)),
              })
            }
            style={{ width: 110 }}
            aria-label="Aisle"
          />
        </HStack>
      ))}
      <HStack justify="between">
        <Text size="sm">Hide checked</Text>
        <Switch
          aria-label="Hide checked"
          isSelected={hideChecked}
          onChange={(value) => onConfigChange({ hideChecked: value })}
        />
      </HStack>
      <HStack justify="between">
        <Text size="sm">Group by aisle</Text>
        <Switch
          aria-label="Group by aisle"
          isSelected={groupByAisle}
          onChange={(value) => onConfigChange({ groupByAisle: value })}
        />
      </HStack>
      <HStack justify="between">
        <Text size="sm">Transparent background</Text>
        <Switch
          aria-label="Transparent background"
          isSelected={transparentBackground}
          onChange={(value) => onConfigChange({ transparentBackground: value })}
        />
      </HStack>
    </Stack>
  );
}
