import React from "react";
import { View, StyleSheet } from "react-native";
import { List, Checkbox, Text, Badge, Icon } from "react-native-paper";
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

interface TodoItemProps {
  todo: TodoResponse;
  onToggle: (id: string) => void;
  onPress: (id: string) => void;
  testID?: string;
}

export function TodoItem({ todo, onToggle, onPress, testID }: TodoItemProps) {
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

  return (
    <List.Item
      testID={testID}
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
                <Icon source="subdirectory-arrow-right" size={12} color="#666" />
                <Text variant="labelSmall" style={styles.metaText}>
                  {todo.subTasks.filter((s) => s.completed).length}/{todo.subTasks.length} sub-tasks
                </Text>
              </View>
            )}
            {formattedDueDate && (
              <View style={styles.metaItem}>
                <Icon source="calendar" size={12} color="#666" />
                <Text variant="labelSmall" style={styles.metaText}>
                  {formattedDueDate}
                </Text>
              </View>
            )}
            {todo.category && (
              <View style={styles.metaItem}>
                <Icon source="folder" size={12} color="#666" />
                <Text variant="labelSmall" style={styles.metaText}>
                  {todo.category.name}
                </Text>
              </View>
            )}
            {todo.tags && todo.tags.length > 0 && (
              <View style={styles.metaItem}>
                <Icon source="tag" size={12} color="#666" />
                <Text variant="labelSmall" style={styles.metaText} numberOfLines={1}>
                  {todo.tags.map((t) => t.tag.name).join(", ")}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
      onPress={() => onPress(todo.id)}
      left={() => (
        <Checkbox
          testID="todo-checkbox"
          status={todo.completed ? "checked" : "unchecked"}
          onPress={() => onToggle(todo.id)}
        />
      )}
    />
  );
}

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
});
