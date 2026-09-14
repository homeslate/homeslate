import { useState, useEffect, useCallback, useRef } from "react";
import { HStack, IconButton, Stack, Switch, Text, TextField } from "@var-ui/react";
import { IconCheck, IconPlus, IconX } from "@tabler/icons-react";
import { v4 as uuidv4 } from "uuid";
import type { WidgetProps, WidgetConfig } from "../types";
import * as classes from "./TodoWidget.styles";

export interface TodoItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface TodoConfig extends WidgetConfig {
  items: TodoItem[];
  hideCompleted: boolean;
  transparentBackground: boolean;
}

function getLocalChecked(widgetId: string): Set<string> {
  try {
    const raw = localStorage.getItem(`todo_checked_${widgetId}`);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function saveLocalChecked(widgetId: string, checked: Set<string>) {
  localStorage.setItem(`todo_checked_${widgetId}`, JSON.stringify([...checked]));
}

export function TodoWidget({ widget, isEditing, onConfigChange }: WidgetProps<TodoConfig>) {
  const { items, hideCompleted, transparentBackground } = widget.config;
  const [localChecked, setLocalChecked] = useState<Set<string>>(() => getLocalChecked(widget.id));
  const [newItemText, setNewItemText] = useState("");
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    setLocalChecked(getLocalChecked(widget.id));
  }, [widget.id, items]);

  const mergedItems = items.map((item) => ({
    ...item,
    checked: isEditing ? item.checked : localChecked.has(item.id),
  }));

  const displayItems = hideCompleted ? mergedItems.filter((i) => !i.checked) : mergedItems;

  const handleToggle = useCallback(
    (id: string) => {
      if (isEditing) {
        onConfigChange({
          items: itemsRef.current.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)),
        });
      } else {
        setLocalChecked((prev) => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          saveLocalChecked(widget.id, next);
          return next;
        });
      }
    },
    [isEditing, onConfigChange, widget.id],
  );

  const handleAddItem = useCallback(() => {
    const text = newItemText.trim();
    if (!text) return;
    onConfigChange({ items: [...itemsRef.current, { id: uuidv4(), text, checked: false }] });
    setNewItemText("");
  }, [newItemText, onConfigChange]);

  const handleRemoveItem = useCallback(
    (id: string) => {
      onConfigChange({ items: itemsRef.current.filter((i) => i.id !== id) });
    },
    [onConfigChange],
  );

  const allDone = items.length > 0 && items.every((i) => localChecked.has(i.id));

  return (
    <div className={`${classes.container} ${transparentBackground ? classes.transparent : ""}`}>
      <Stack gap="xs" className={classes.list}>
        {displayItems.map((item) => (
          <div key={item.id} className={classes.itemRow}>
            <button
              className={`${classes.item} ${item.checked ? classes.itemChecked : ""}`}
              onClick={() => handleToggle(item.id)}
            >
              <span
                className={`${classes.checkbox} ${item.checked ? classes.checkboxChecked : ""}`}
              >
                {item.checked && <IconCheck size={11} strokeWidth={3} />}
              </span>
              <Text className={classes.itemText} size="sm">
                {item.text}
              </Text>
            </button>
            <IconButton
              name="close"
              icon={<IconX size={14} />}
              appearance="ghost"
              tone="danger"
              size="sm"
              className={classes.deleteBtn}
              onPress={() => handleRemoveItem(item.id)}
              aria-label="Delete item"
            />
          </div>
        ))}
        <HStack gap="xs" className={classes.addRow}>
          <TextField
            size="sm"
            aria-label="Add item"
            placeholder="Add item..."
            value={newItemText}
            onChange={setNewItemText}
            onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
            style={{ flex: 1 }}
          />
          <IconButton
            name="check"
            icon={<IconPlus size={14} />}
            appearance="subtle"
            aria-label="Add item"
            onPress={handleAddItem}
            isDisabled={!newItemText.trim()}
          />
        </HStack>
      </Stack>
      {allDone && displayItems.length === 0 && (
        <Text size="sm" tone="secondary" style={{ textAlign: "center", marginTop: "0.5rem" }}>
          All done! ✓
        </Text>
      )}
    </div>
  );
}

export function TodoWidgetSettings({ widget, onConfigChange }: WidgetProps<TodoConfig>) {
  const { hideCompleted, transparentBackground } = widget.config;

  return (
    <Stack gap="md">
      <Text size="xs" tone="secondary">
        Add, remove, and check off items directly on the display.
      </Text>

      <HStack justify="between">
        <Text size="sm">Hide completed items</Text>
        <Switch
          aria-label="Hide completed items"
          isSelected={hideCompleted}
          onChange={(value) => onConfigChange({ hideCompleted: value })}
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
