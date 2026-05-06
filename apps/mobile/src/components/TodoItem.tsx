import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { List, Checkbox, Text, Badge, Icon, IconButton, useTheme } from "react-native-paper";
import type { TodoResponse } from "@todo-app/shared";

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "#4caf50",
  MEDIUM: "#ff9800",
  HIGH: "#f44336",
  URGENT: "#9c27b0",
};

const PRIORITY_LABELS: Record<string, string> = {
  LOW: "Low",
  MEDIUM: "Med",
  HIGH: "High",
  URGENT: "!",
};

const DUE_DATE_COLORS: Record<string, string> = {
  overdue: "#f44336",
  "due-today": "#ff9800",
  "due-soon": "#ffc107",
};

function getDueDateStatus(dueDate: string | null, completed: boolean): 'overdue' | 'due-today' | 'due-soon' | null {
  if (!dueDate || completed) return null;
  const due = new Date(dueDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const diff = due.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return 'overdue';
  if (days === 0) return 'due-today';
  if (days <= 3) return 'due-soon';
  return null;
}

interface TodoItemProps {
  todo: TodoResponse;
  onToggle: (id: string) => void;
  onPress: (id: string) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onLongPress?: (id: string) => void;
  selected?: boolean;
  testID?: string;
}

function TodoItemComponent({ todo, onToggle, onPress, onMoveUp, onMoveDown, onLongPress, selected, testID }: TodoItemProps) {
  const { colors } = useTheme();
  const iconColor = colors.onSurfaceVariant;
  const titleStyle = todo.completed
    ? [styles.title, styles.completed]
    : styles.title;

  const showPriority = todo.priority && todo.priority !== "NONE";

  const formattedDueDate = todo.dueDate
    ? new Date(todo.dueDate).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : null;

  const dueDateStatus = getDueDateStatus(todo.dueDate, todo.completed);

  return (
    <Pressable
      onLongPress={onLongPress ? () => onLongPress(todo.id) : undefined}
      delayLongPress={500}
    >
      <List.Item
        testID={testID}
        style={[
          selected ? styles.selectedItem : undefined,
        ]}
        title={() => (
          <View style={styles.titleRow}>
            <Text testID="todo-title" style={titleStyle} variant="bodyLarge">
              {todo.title}
            </Text>
            {showPriority && (
              <Badge
                style={[
                  styles.priorityBadge,
                  { backgroundColor: PRIORITY_COLORS[todo.priority] || "#999" },
                ]}
                size={20}
              >
                {PRIORITY_LABELS[todo.priority] || todo.priority}
              </Badge>
            )}
          </View>
        )}
        description={() => (
          <View>
            {todo.description ? (
              <Text variant="bodySmall" style={styles.description} numberOfLines={1}>
                {todo.description}
              </Text>
            ) : null}
            <View style={styles.metaRow}>
              {todo.subTasks && todo.subTasks.length > 0 && (
                <View style={styles.metaItem}>
                  <Icon source="subdirectory-arrow-right" size={12} color={iconColor} />
                  <Text variant="labelSmall" style={styles.metaText}>
                    {todo.subTasks.filter((s: { completed: boolean }) => s.completed).length}/{todo.subTasks.length} sub-tasks
                  </Text>
                </View>
              )}
              {formattedDueDate && (
                <View style={styles.metaItem}>
                  {dueDateStatus && (
                    <View style={[styles.dueDateDot, { backgroundColor: DUE_DATE_COLORS[dueDateStatus] }]} />
                  )}
                  <Icon source="calendar" size={12} color={dueDateStatus ? DUE_DATE_COLORS[dueDateStatus] : iconColor} />
                  <Text
                    variant="labelSmall"
                    style={[
                      styles.metaText,
                      dueDateStatus ? { color: DUE_DATE_COLORS[dueDateStatus], opacity: 1 } : undefined,
                    ]}
                  >
                    {formattedDueDate}
                  </Text>
                </View>
              )}
              {todo.category && (
                <View style={styles.metaItem}>
                  <Icon source="folder" size={12} color={iconColor} />
                  <Text variant="labelSmall" style={styles.metaText}>
                    {todo.category.name}
                  </Text>
                </View>
              )}
              {todo.tags && todo.tags.length > 0 && (
                <View style={styles.metaItem}>
                  <Icon source="tag" size={12} color={iconColor} />
                  <Text variant="labelSmall" style={styles.metaText} numberOfLines={1}>
                    {todo.tags.map((t: { tag: { name: string } }) => t.tag.name).join(", ")}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
        onPress={() => onPress(todo.id)}
        left={() =>
          selected !== undefined ? (
            <Checkbox
              testID="todo-checkbox"
              status={selected ? "checked" : todo.completed ? "checked" : "unchecked"}
              onPress={() => onToggle(todo.id)}
            />
          ) : (
            <Checkbox
              testID="todo-checkbox"
              status={todo.completed ? "checked" : "unchecked"}
              onPress={() => onToggle(todo.id)}
            />
          )
        }
        right={() =>
          onMoveUp || onMoveDown ? (
            <View style={styles.reorderButtons}>
              {onMoveUp ? (
                <IconButton
                  icon="chevron-up"
                  size={20}
                  iconColor={iconColor}
                  onPress={onMoveUp}
                  testID="move-up"
                />
              ) : null}
              {onMoveDown ? (
                <IconButton
                  icon="chevron-down"
                  size={20}
                  iconColor={iconColor}
                  onPress={onMoveDown}
                  testID="move-down"
                />
              ) : null}
            </View>
          ) : null
        }
      />
    </Pressable>
  );
}

export const TodoItem = React.memo(TodoItemComponent, (prev, next) => {
  return (
    prev.todo.id === next.todo.id &&
    prev.todo.title === next.todo.title &&
    prev.todo.completed === next.todo.completed &&
    prev.todo.description === next.todo.description &&
    prev.todo.priority === next.todo.priority &&
    prev.todo.dueDate === next.todo.dueDate &&
    prev.todo.position === next.todo.position &&
    prev.selected === next.selected &&
    prev.onLongPress === next.onLongPress
  );
});

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 16,
    flex: 1,
  },
  completed: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
  priorityBadge: {
    fontSize: 10,
    fontWeight: "bold",
  },
  description: {
    opacity: 0.6,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 2,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  metaText: {
    opacity: 0.6,
  },
  reorderButtons: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  dueDateDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 2,
  },
  selectedItem: {
    backgroundColor: "rgba(98, 0, 238, 0.08)",
  },
});
